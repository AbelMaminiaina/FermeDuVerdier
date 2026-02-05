import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { DeliveryMethod } from '@prisma/client';

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

// Calculate shipping cost
function getShippingCost(method: string, subtotal: number): number {
  if (subtotal >= 200000) return 0; // Free shipping above 200,000 Ar

  const costs: Record<string, number> = {
    standard: 25000,
    express: 45000,
    retrait: 0,
  };
  return costs[method] || 0;
}

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `FDV-${timestamp}-${randomStr}`.toUpperCase();
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = checkoutSchema.parse(req.body);

    // Calculate totals
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = getShippingCost(validatedData.deliveryMethod, subtotal);
    const total = subtotal + shippingCost;

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

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: customer.id,
        addressId: address.id,
        deliveryMethod: validatedData.deliveryMethod as DeliveryMethod,
        subtotal,
        shippingCost,
        total,
        notes: validatedData.notes,
        items: {
          create: validatedData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    console.log('Order created:', order.orderNumber);

    res.json({
      success: true,
      message: 'Commande créée avec succès',
      orderId: order.id,
      orderNumber: order.orderNumber,
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

// Get order by number
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

// Get orders for customer (by email)
router.get('/customer/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { email },
      include: {
        orders: {
          include: {
            items: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return res.json({ orders: [] });
    }

    res.json({ orders: customer.orders });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
