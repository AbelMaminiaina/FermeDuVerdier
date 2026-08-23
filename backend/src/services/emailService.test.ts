import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'test' });
const createTransportMock = vi.fn(() => ({ sendMail: sendMailMock }));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: (...args: unknown[]) => createTransportMock(...args),
  },
}));

import { sendOrderConfirmationEmail, sendAdminNotificationEmail, sendOrderCancellationEmail } from './emailService.js';

const baseOrder = {
  orderNumber: 'FDV-TEST123',
  customerName: 'Jean Dupont',
  customerEmail: 'jean@example.com',
  customerPhone: '0340000000',
  address: {
    street: '12 rue des Champs',
    city: 'Antananarivo',
    postalCode: '101',
    country: 'Madagascar',
  },
  deliveryMethod: 'standard',
  items: [{ name: 'Poulet fermier', quantity: 2, price: 15000 }],
  subtotal: 30000,
  shippingCost: 25000,
  total: 55000,
  status: 'processing',
  createdAt: new Date('2026-01-01T10:00:00Z'),
};

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.SMTP_USER = 'smtp-user';
  process.env.SMTP_PASS = 'smtp-pass';
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('sendOrderConfirmationEmail', () => {
  it('skips sending when SMTP credentials are not configured', async () => {
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const result = await sendOrderConfirmationEmail(baseOrder);

    expect(result).toBe(false);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('sends both a customer and an admin email', async () => {
    const result = await sendOrderConfirmationEmail(baseOrder);

    expect(result).toBe(true);
    expect(sendMailMock).toHaveBeenCalledTimes(2);
  });

  it('includes the order number, total and status in the customer email', async () => {
    await sendOrderConfirmationEmail(baseOrder);

    const customerCall = sendMailMock.mock.calls[0][0];
    expect(customerCall.to).toBe('jean@example.com');
    expect(customerCall.subject).toContain('FDV-TEST123');
    expect(customerCall.html).toContain('FDV-TEST123');
    expect(customerCall.html).toMatch(/55\s000\sAr/);
  });

  it('returns false and does not throw when sendMail rejects', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('smtp error'));

    const result = await sendOrderConfirmationEmail(baseOrder);

    expect(result).toBe(false);
  });
});

describe('sendAdminNotificationEmail', () => {
  it('sends the notification to the default admin address', async () => {
    const result = await sendAdminNotificationEmail(baseOrder);

    expect(result).toBe(true);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'fermeduvardier@gmail.com' })
    );
  });

  it('lists every ordered item in the notification body', async () => {
    await sendAdminNotificationEmail({
      ...baseOrder,
      items: [
        { name: 'Poulet fermier', quantity: 2, price: 15000 },
        { name: 'Oeufs frais', quantity: 3, price: 2000 },
      ],
    });

    const call = sendMailMock.mock.calls[0][0];
    expect(call.html).toContain('Poulet fermier x2');
    expect(call.html).toContain('Oeufs frais x3');
  });

  it('skips sending when SMTP credentials are not configured', async () => {
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const result = await sendAdminNotificationEmail(baseOrder);

    expect(result).toBe(false);
    expect(sendMailMock).not.toHaveBeenCalled();
  });
});

describe('sendOrderCancellationEmail', () => {
  const cancellation = {
    orderNumber: 'FDV-CANCEL',
    customerName: 'Jean Dupont',
    customerEmail: 'jean@example.com',
    reason: 'Rupture de stock',
    items: [{ name: 'Poulet fermier', quantity: 2, price: 15000 }],
    total: 30000,
    cancelledAt: new Date('2026-01-02T10:00:00Z'),
  };

  it('skips sending when SMTP credentials are not configured', async () => {
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const result = await sendOrderCancellationEmail(cancellation);

    expect(result).toBe(false);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('sends the cancellation email to the customer with the order number and reason', async () => {
    const result = await sendOrderCancellationEmail(cancellation);

    expect(result).toBe(true);
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const call = sendMailMock.mock.calls[0][0];
    expect(call.to).toBe('jean@example.com');
    expect(call.subject).toContain('FDV-CANCEL');
    expect(call.html).toContain('FDV-CANCEL');
    expect(call.html).toContain('Rupture de stock');
  });

  it('omits the reason block when no reason is given', async () => {
    await sendOrderCancellationEmail({ ...cancellation, reason: undefined });

    const call = sendMailMock.mock.calls[0][0];
    expect(call.html).not.toContain('MOTIF DE L');
  });

  it('returns false and does not throw when sendMail rejects', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('smtp error'));

    const result = await sendOrderCancellationEmail(cancellation);

    expect(result).toBe(false);
  });
});
