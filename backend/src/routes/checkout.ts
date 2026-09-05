import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { DeliveryMethod } from '@prisma/client';
import {
  sendOrderConfirmationEmail,
  sendOrderCancellationEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
} from '../services/emailService.js';
import { invalidateProductCache } from '../lib/cache.js';
import { computeShippingCost } from '../lib/shipping.js';

const router = Router();

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().min(1),
      image: z.string().optional(),
    })
  ),
  customer: z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().optional(),
  }),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string().optional(),
  }),
  deliveryMethod: z.enum(['standard', 'express', 'retrait']),
  notes: z.string().optional(),
});

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `FDV-${timestamp}-${randomStr}`.toUpperCase();
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = checkoutSchema.parse(req.body);

    // Calculate subtotal (shipping is computed further down, once products are loaded)
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { email: validatedData.customer.email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email: validatedData.customer.email,
          firstName: validatedData.customer.firstName,
          lastName: validatedData.customer.lastName,
          phone: validatedData.customer.phone,
        },
      });
    }

    // Create address
    const address = await prisma.address.create({
      data: {
        customerId: customer.id,
        street: validatedData.shippingAddress.street,
        city: validatedData.shippingAddress.city,
        postalCode: validatedData.shippingAddress.postalCode,
        country: validatedData.shippingAddress.country || 'Madagascar',
      },
    });

    // Check stock availability for all items
    const productIds = validatedData.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stockQuantity: true, freeShipping: true, availableFrom: true },
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    // Shipping: a single product flagged freeShipping makes the whole order free.
    const freeShippingProductIds = new Set(
      products.filter(p => p.freeShipping).map(p => p.id)
    );
    const shippingCost = computeShippingCost(
      validatedData.deliveryMethod,
      subtotal,
      freeShippingProductIds,
      validatedData.items,
    );
    const total = subtotal + shippingCost;

    let allInStock = true;
    const stockUpdates: { id: string; newQuantity: number }[] = [];

    for (const item of validatedData.items) {
      const product = productMap.get(item.productId);
      if (!product || product.stockQuantity < item.quantity) {
        allInStock = false;
        break;
      }
      stockUpdates.push({
        id: item.productId,
        newQuantity: product.stockQuantity - item.quantity,
      });
    }

    // Stock disponible = processing, sinon = pending
    const orderStatus = allInStock ? 'processing' : 'pending';

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: customer.id,
        addressId: address.id,
        deliveryMethod: validatedData.deliveryMethod as DeliveryMethod,
        status: orderStatus,
        subtotal,
        shippingCost,
        total,
        notes: validatedData.notes,
        items: {
          create: validatedData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            availableFrom: productMap.get(item.productId)?.availableFrom ?? null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Si stock disponible, décrémenter les quantités
    if (allInStock) {
      await Promise.all(
        stockUpdates.map(update =>
          prisma.product.update({
            where: { id: update.id },
            data: {
              stockQuantity: update.newQuantity,
              inStock: update.newQuantity > 0,
            },
          })
        )
      );
      await invalidateProductCache();
      console.log('Commande en préparation:', order.orderNumber);
    } else {
      console.log('Commande en attente (stock insuffisant):', order.orderNumber);
    }

    // Envoyer l'email avec la facture
    const emailData = {
      orderNumber: order.orderNumber,
      customerName: `${validatedData.customer.firstName} ${validatedData.customer.lastName}`,
      customerEmail: validatedData.customer.email,
      customerPhone: validatedData.customer.phone,
      address: {
        street: validatedData.shippingAddress.street,
        city: validatedData.shippingAddress.city,
        postalCode: validatedData.shippingAddress.postalCode,
        country: validatedData.shippingAddress.country || 'Madagascar',
      },
      deliveryMethod: validatedData.deliveryMethod,
      items: validatedData.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        availableFrom: productMap.get(item.productId)?.availableFrom ?? null,
      })),
      subtotal,
      shippingCost,
      total,
      status: orderStatus,
      createdAt: new Date(),
    };

    // Envoi asynchrone (ne bloque pas la réponse)
    sendOrderConfirmationEmail(emailData).catch(err =>
      console.error('Failed to send email:', err)
    );

    res.json({
      success: true,
      message: allInStock
        ? 'Commande confirmée et en préparation'
        : 'Commande en attente de stock',
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: orderStatus,
      total,
    });
  } catch (error) {
    console.error('Checkout error:', error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la commande',
    });
  }
});

// Admin: Get all orders (MUST be before /:orderNumber)
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        address: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      status: order.status,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      deliveryMethod: order.deliveryMethod,
      notes: order.notes,
      cancelReason: order.cancelReason,
      createdAt: order.createdAt,
      address: order.address ? {
        street: order.address.street,
        city: order.address.city,
        postalCode: order.address.postalCode,
        country: order.address.country,
      } : null,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        availableFrom: item.availableFrom,
      })),
    }));

    res.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin: Update order status
router.patch('/orders/:orderId/status', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    if (existingOrder.status === 'cancelled') {
      return res.status(400).json({ error: 'Cette commande est déjà annulée' });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === 'cancelled' ? { cancelReason: reason || null } : {}),
      },
      include: {
        customer: true,
        address: true,
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    // Une commande "pending" n'a jamais décrémenté le stock (stock insuffisant au moment
    // de la commande) : rien à restaurer. Pour toute autre commande annulée, le stock avait
    // été décrémenté à la création, on le restitue.
    if (status === 'cancelled' && existingOrder.status !== 'pending') {
      await Promise.all(
        existingOrder.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { increment: item.quantity },
              inStock: true,
            },
          })
        )
      );
      await invalidateProductCache();
    }

    // Envoi asynchrone des emails de notification (ne bloque pas la réponse)
    if (status === 'cancelled') {
      sendOrderCancellationEmail({
        orderNumber: order.orderNumber,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerEmail: order.customer.email,
        reason: reason || undefined,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          availableFrom: item.availableFrom,
        })),
        total: order.total,
        cancelledAt: new Date(),
      }).catch((err) => console.error('Failed to send cancellation email:', err));
    } else if (status === 'shipped' || status === 'delivered') {
      const emailData = {
        orderNumber: order.orderNumber,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerEmail: order.customer.email,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          availableFrom: item.availableFrom,
        })),
        total: order.total,
        deliveryMethod: order.deliveryMethod,
        address: order.address
          ? {
              street: order.address.street,
              city: order.address.city,
              postalCode: order.address.postalCode,
              country: order.address.country,
            }
          : { street: '', city: '', postalCode: '', country: '' },
        updatedAt: new Date(),
      };

      const sendFn = status === 'shipped' ? sendOrderShippedEmail : sendOrderDeliveredEmail;
      sendFn(emailData).catch((err) =>
        console.error(`Failed to send ${status} email:`, err)
      );
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get orders for customer (by email)
router.get('/customer/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { email },
      include: {
        orders: {
          include: {
            address: true,
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return res.json({ orders: [] });
    }

    // Format orders with product names
    const formattedOrders = customer.orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      deliveryMethod: order.deliveryMethod,
      cancelReason: order.cancelReason,
      createdAt: order.createdAt,
      address: order.address ? {
        street: order.address.street,
        city: order.address.city,
        postalCode: order.address.postalCode,
        country: order.address.country,
      } : null,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        availableFrom: item.availableFrom,
      })),
    }));

    res.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by number (MUST be LAST - catches all unmatched paths)
router.get('/:orderNumber', async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        customer: true,
        address: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
