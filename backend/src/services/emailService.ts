import nodemailer from 'nodemailer';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  deliveryMethod: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  createdAt: Date;
}

const deliveryLabels: Record<string, string> = {
  standard: 'Livraison standard',
  express: 'Livraison express',
  retrait: 'Retrait sur place',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-MG', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(price) + ' Ar';
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

function generateInvoiceHTML(order: OrderData): string {
  const itemsHTML = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatPrice(item.price)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `
    )
    .join('');

  const statusLabel = order.status === 'processing'
    ? 'Confirmée - En préparation'
    : 'En attente de confirmation';

  const statusColor = order.status === 'processing' ? '#16a34a' : '#f59e0b';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Facture - ${order.orderNumber}</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="text-align: center; padding: 30px 0; border-bottom: 3px solid #16a34a;">
    <h1 style="color: #16a34a; margin: 0; font-size: 28px;">FERME DU VARDIER</h1>
    <p style="color: #666; margin: 5px 0 0 0;">Produits fermiers de qualité</p>
  </div>

  <!-- Invoice Title -->
  <div style="text-align: center; padding: 30px 0;">
    <h2 style="margin: 0; color: #333; font-size: 24px;">FACTURE</h2>
    <p style="margin: 10px 0 0 0; color: #666;">N° ${order.orderNumber}</p>
    <p style="margin: 5px 0 0 0; color: #666;">${formatDate(order.createdAt)}</p>
    <span style="display: inline-block; margin-top: 15px; padding: 8px 16px; background-color: ${statusColor}; color: white; border-radius: 20px; font-size: 14px;">
      ${statusLabel}
    </span>
  </div>

  <!-- Customer Info -->
  <div style="display: flex; margin-bottom: 30px;">
    <div style="flex: 1; padding: 20px; background-color: #f8f8f8; border-radius: 8px; margin-right: 10px;">
      <h3 style="margin: 0 0 15px 0; color: #16a34a; font-size: 16px;">INFORMATIONS CLIENT</h3>
      <p style="margin: 5px 0;"><strong>${order.customerName}</strong></p>
      <p style="margin: 5px 0;">${order.customerEmail}</p>
      ${order.customerPhone ? `<p style="margin: 5px 0;">${order.customerPhone}</p>` : ''}
    </div>
    <div style="flex: 1; padding: 20px; background-color: #f8f8f8; border-radius: 8px; margin-left: 10px;">
      <h3 style="margin: 0 0 15px 0; color: #16a34a; font-size: 16px;">ADRESSE DE LIVRAISON</h3>
      <p style="margin: 5px 0;">${order.address.street}</p>
      <p style="margin: 5px 0;">${order.address.postalCode} ${order.address.city}</p>
      <p style="margin: 5px 0;">${order.address.country}</p>
    </div>
  </div>

  <!-- Delivery Method -->
  <div style="padding: 15px 20px; background-color: #e8f5e9; border-radius: 8px; margin-bottom: 30px;">
    <strong>Mode de livraison:</strong> ${deliveryLabels[order.deliveryMethod] || order.deliveryMethod}
  </div>

  <!-- Items Table -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
    <thead>
      <tr style="background-color: #16a34a; color: white;">
        <th style="padding: 12px; text-align: left;">Produit</th>
        <th style="padding: 12px; text-align: center;">Quantité</th>
        <th style="padding: 12px; text-align: right;">Prix unitaire</th>
        <th style="padding: 12px; text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHTML}
    </tbody>
  </table>

  <!-- Totals -->
  <div style="margin-left: auto; width: 300px;">
    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e5e5;">
      <span>Sous-total</span>
      <span>${formatPrice(order.subtotal)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e5e5;">
      <span>Frais de livraison</span>
      <span>${order.shippingCost > 0 ? formatPrice(order.shippingCost) : 'Gratuit'}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding: 15px 0; font-size: 20px; font-weight: bold; color: #16a34a;">
      <span>TOTAL</span>
      <span>${formatPrice(order.total)}</span>
    </div>
  </div>

  <!-- Footer -->
  <div style="margin-top: 50px; padding: 30px; background-color: #f8f8f8; border-radius: 8px; text-align: center;">
    <p style="margin: 0 0 10px 0; font-weight: bold; color: #16a34a;">Merci pour votre commande !</p>
    <p style="margin: 0; color: #666; font-size: 14px;">
      Pour toute question, contactez-nous à contact@fermeduvardier.com
    </p>
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
      <p style="margin: 0; color: #999; font-size: 12px;">
        Ferme du Vardier - Madagascar<br>
        www.fermeduvardier.com
      </p>
    </div>
  </div>

</body>
</html>
  `;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function sendOrderConfirmationEmail(order: OrderData): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('SMTP not configured, skipping email');
      return false;
    }

    const transporter = createTransporter();
    const invoiceHTML = generateInvoiceHTML(order);

    const statusText = order.status === 'processing'
      ? 'Confirmée'
      : 'En attente';

    await transporter.sendMail({
      from: `"Ferme du Vardier" <${process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `Votre commande ${order.orderNumber} - ${statusText}`,
      html: invoiceHTML,
    });

    console.log(`Email sent to ${order.customerEmail} for order ${order.orderNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
