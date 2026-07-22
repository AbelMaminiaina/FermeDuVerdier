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
  standard: 'Livraison standard (3-5 jours)',
  express: 'Livraison express (1-2 jours)',
  retrait: 'Retrait sur place',
};

// Email admin de la ferme
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'contact@fermeduvardier.com';

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

// Template email pour le CLIENT
function generateCustomerEmailHTML(order: OrderData): string {
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
  <title>Confirmation de commande - ${order.orderNumber}</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">

  <div style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white;">
      <h1 style="margin: 0; font-size: 28px;">🌿 FERME DU VARDIER</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Produits fermiers de qualité</p>
    </div>

    <div style="padding: 30px;">

      <!-- Confirmation Message -->
      <div style="text-align: center; padding: 20px 0 30px 0;">
        <div style="font-size: 50px; margin-bottom: 15px;">🛒</div>
        <h2 style="margin: 0; color: #16a34a; font-size: 24px;">Commande enregistrée !</h2>
        <p style="margin: 10px 0 0 0; color: #666;">Merci ${order.customerName.split(' ')[0]} pour votre commande</p>
        <p style="margin: 5px 0 0 0; color: #f59e0b; font-weight: bold;">⏳ En attente de votre paiement MVola</p>
      </div>

      <!-- Order Info -->
      <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 5px 0;"><strong>N° de commande:</strong></td>
            <td style="text-align: right; font-family: monospace; font-size: 16px; color: #16a34a;">${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Date:</strong></td>
            <td style="text-align: right;">${formatDate(order.createdAt)}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Statut:</strong></td>
            <td style="text-align: right;">
              <span style="display: inline-block; padding: 4px 12px; background-color: ${statusColor}; color: white; border-radius: 12px; font-size: 12px;">
                ${statusLabel}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Payment Notice - Mobile Money -->
      <div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin-bottom: 25px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 15px;">
          <span style="font-size: 40px;">📱</span>
          <h3 style="margin: 10px 0 5px 0; color: #92400e;">Paiement par MVola</h3>
          <p style="margin: 0; color: #92400e; font-size: 14px;">Payez maintenant pour confirmer votre livraison</p>
        </div>

        <div style="background-color: white; border-radius: 8px; padding: 15px; text-align: center;">
          <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">MONTANT À ENVOYER</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #16a34a;">${formatPrice(order.total)}</p>
        </div>

        <div style="background-color: white; border-radius: 8px; padding: 15px; margin-top: 10px; text-align: center;">
          <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">NUMÉRO MVOLA</p>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #333; font-family: monospace;">038 01 001 01</p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Nom: FERME DU VARDIER</p>
        </div>

        <div style="margin-top: 15px; padding: 15px; background-color: #fff8e6; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #92400e; font-size: 14px;">📋 Comment payer :</p>
          <ol style="margin: 0; padding-left: 20px; color: #78350f; font-size: 13px;">
            <li style="margin-bottom: 5px;">Composez <strong>*111#</strong> sur votre téléphone</li>
            <li style="margin-bottom: 5px;">Envoyez <strong>${formatPrice(order.total)}</strong> au <strong>038 01 001 01</strong></li>
            <li style="margin-bottom: 5px;">Indiquez <strong>${order.orderNumber}</strong> en référence</li>
            <li>Votre commande sera livrée après confirmation du paiement</li>
          </ol>
        </div>
      </div>

      <!-- Delivery Info -->
      <div style="display: table; width: 100%; margin-bottom: 25px;">
        <div style="display: table-cell; width: 50%; padding-right: 10px; vertical-align: top;">
          <div style="background-color: #f0fdf4; border-radius: 8px; padding: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #16a34a; font-size: 14px;">📦 MODE DE LIVRAISON</h3>
            <p style="margin: 0; font-weight: bold;">${deliveryLabels[order.deliveryMethod] || order.deliveryMethod}</p>
          </div>
        </div>
        <div style="display: table-cell; width: 50%; padding-left: 10px; vertical-align: top;">
          <div style="background-color: #f0fdf4; border-radius: 8px; padding: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #16a34a; font-size: 14px;">📍 ADRESSE</h3>
            <p style="margin: 0;">${order.address.street}<br>${order.address.postalCode} ${order.address.city}</p>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <h3 style="margin: 0 0 15px 0; color: #333;">Récapitulatif de votre commande</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #16a34a; color: white;">
            <th style="padding: 12px; text-align: left; border-radius: 8px 0 0 0;">Produit</th>
            <th style="padding: 12px; text-align: center;">Qté</th>
            <th style="padding: 12px; text-align: right;">Prix</th>
            <th style="padding: 12px; text-align: right; border-radius: 0 8px 0 0;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0;">Sous-total</td>
            <td style="text-align: right;">${formatPrice(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">Frais de livraison</td>
            <td style="text-align: right;">${order.shippingCost > 0 ? formatPrice(order.shippingCost) : '<span style="color: #16a34a;">Gratuit</span>'}</td>
          </tr>
          <tr style="font-size: 20px; font-weight: bold; color: #16a34a;">
            <td style="padding: 15px 0 0 0; border-top: 2px solid #e5e5e5;">TOTAL À PAYER</td>
            <td style="text-align: right; padding: 15px 0 0 0; border-top: 2px solid #e5e5e5;">${formatPrice(order.total)}</td>
          </tr>
        </table>
      </div>

    </div>

    <!-- Footer -->
    <div style="padding: 25px; background-color: #f8f8f8; text-align: center; border-top: 1px solid #e5e5e5;">
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #16a34a;">Une question sur votre commande ?</p>
      <p style="margin: 0; color: #666; font-size: 14px;">
        📧 contact@fermeduvardier.com | 📞 038 01 001 01
      </p>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
        <p style="margin: 0; color: #999; font-size: 12px;">
          Ferme du Vardier - Lot IF 210 Ambatofotsy Ambohimalaza<br>
          Madagascar
        </p>
      </div>
    </div>

  </div>

</body>
</html>
  `;
}

// Template email pour l'ADMIN
function generateAdminNotificationHTML(order: OrderData): string {
  const itemsList = order.items
    .map(item => `• ${item.name} x${item.quantity} = ${formatPrice(item.price * item.quantity)}`)
    .join('<br>');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nouvelle commande - ${order.orderNumber}</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
    <h1 style="margin: 0; color: #92400e; font-size: 20px;">🔔 Nouvelle commande reçue !</h1>
  </div>

  <div style="background-color: white; border: 1px solid #e5e5e5; border-radius: 12px; padding: 25px;">

    <h2 style="margin: 0 0 20px 0; color: #16a34a;">Commande ${order.orderNumber}</h2>

    <table style="width: 100%; margin-bottom: 20px;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Client:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${order.customerName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Email:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${order.customerEmail}">${order.customerEmail}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Téléphone:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${order.customerPhone || 'Non renseigné'}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Adresse:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${order.address.street}, ${order.address.postalCode} ${order.address.city}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;"><strong>Livraison:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${deliveryLabels[order.deliveryMethod] || order.deliveryMethod}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Date:</strong></td>
        <td style="padding: 8px 0;">${formatDate(order.createdAt)}</td>
      </tr>
    </table>

    <div style="background-color: #f8f8f8; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; font-size: 14px;">Produits commandés:</h3>
      <p style="margin: 0; font-family: monospace;">${itemsList}</p>
    </div>

    <div style="background-color: #16a34a; color: white; border-radius: 8px; padding: 20px; text-align: center;">
      <p style="margin: 0; font-size: 14px;">TOTAL À ENCAISSER</p>
      <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold;">${formatPrice(order.total)}</p>
    </div>

  </div>

  <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
    Connectez-vous à l'admin pour gérer cette commande
  </p>

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

// Envoyer email de confirmation au CLIENT
export async function sendOrderConfirmationEmail(order: OrderData): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('SMTP not configured, skipping email');
      return false;
    }

    const transporter = createTransporter();
    const customerHTML = generateCustomerEmailHTML(order);

    const statusText = order.status === 'processing'
      ? 'Confirmée'
      : 'En attente';

    // Email au client
    await transporter.sendMail({
      from: `"Ferme du Vardier" <${process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `✅ Commande ${order.orderNumber} - ${statusText}`,
      html: customerHTML,
    });

    console.log(`✉️ Email client envoyé à ${order.customerEmail} pour commande ${order.orderNumber}`);

    // Email à l'admin
    await sendAdminNotificationEmail(order);

    return true;
  } catch (error) {
    console.error('Error sending customer email:', error);
    return false;
  }
}

// Envoyer notification à l'ADMIN
export async function sendAdminNotificationEmail(order: OrderData): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('SMTP not configured, skipping admin email');
      return false;
    }

    const transporter = createTransporter();
    const adminHTML = generateAdminNotificationHTML(order);

    await transporter.sendMail({
      from: `"Ferme du Vardier - Système" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🔔 Nouvelle commande ${order.orderNumber} - ${formatPrice(order.total)}`,
      html: adminHTML,
    });

    console.log(`✉️ Email admin envoyé à ${ADMIN_EMAIL} pour commande ${order.orderNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending admin email:', error);
    return false;
  }
}
