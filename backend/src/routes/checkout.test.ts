import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { mockReset, type DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';

vi.mock('../lib/prisma.js');
vi.mock('../services/emailService.js', () => ({
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue(true),
  sendOrderCancellationEmail: vi.fn().mockResolvedValue(true),
}));

import prisma from '../lib/prisma.js';
import { sendOrderConfirmationEmail, sendOrderCancellationEmail } from '../services/emailService.js';
import checkoutRouter from './checkout.js';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
  vi.mocked(sendOrderConfirmationEmail).mockClear();
  vi.mocked(sendOrderCancellationEmail).mockClear();
});

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/checkout', checkoutRouter);
  return app;
}

const validPayload = {
  items: [
    { productId: 'p1', name: 'Poulet', price: 15000, quantity: 2 },
    { productId: 'p2', name: 'Oeufs', price: 5000, quantity: 1 },
  ],
  customer: {
    email: 'client@example.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: '0340000000',
  },
  shippingAddress: {
    street: '12 rue des Champs',
    city: 'Antananarivo',
    postalCode: '101',
  },
  deliveryMethod: 'standard' as const,
};

function mockHappyPath({ stockQuantity = 10 }: { stockQuantity?: number } = {}) {
  prismaMock.customer.findUnique.mockResolvedValue(null);
  prismaMock.customer.create.mockResolvedValue({ id: 'cust1', email: validPayload.customer.email } as any);
  prismaMock.address.create.mockResolvedValue({ id: 'addr1' } as any);
  prismaMock.product.findMany.mockResolvedValue([
    { id: 'p1', stockQuantity },
    { id: 'p2', stockQuantity },
  ] as any);
  prismaMock.order.create.mockResolvedValue({
    id: 'order1',
    orderNumber: 'FDV-TEST',
    items: [],
  } as any);
  prismaMock.product.update.mockResolvedValue({} as any);
}

describe('POST /api/checkout', () => {
  it('rejects an invalid payload', async () => {
    const res = await request(buildApp())
      .post('/api/checkout')
      .send({ items: [], customer: {}, shippingAddress: {}, deliveryMethod: 'standard' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Données invalides');
  });

  it('computes subtotal, shipping cost and total, and marks the order processing when stock is available', async () => {
    mockHappyPath();

    const res = await request(buildApp()).post('/api/checkout').send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('processing');
    // subtotal = 15000*2 + 5000*1 = 35000, standard shipping = 25000 (below 200000 free threshold)
    expect(res.body.total).toBe(60000);

    const orderCreateArgs = prismaMock.order.create.mock.calls[0][0] as any;
    expect(orderCreateArgs.data.subtotal).toBe(35000);
    expect(orderCreateArgs.data.shippingCost).toBe(25000);
    expect(orderCreateArgs.data.total).toBe(60000);
    expect(orderCreateArgs.data.status).toBe('processing');
  });

  it('applies free shipping once the subtotal reaches 200000 Ar', async () => {
    mockHappyPath();
    const bigOrder = {
      ...validPayload,
      items: [{ productId: 'p1', name: 'Poulet', price: 200000, quantity: 1 }],
    };

    const res = await request(buildApp()).post('/api/checkout').send(bigOrder);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(200000);
  });

  it('uses express shipping cost when requested', async () => {
    mockHappyPath();

    const res = await request(buildApp())
      .post('/api/checkout')
      .send({ ...validPayload, deliveryMethod: 'express' });

    expect(res.body.total).toBe(35000 + 45000);
  });

  it('marks the order pending and skips stock decrement when stock is insufficient', async () => {
    mockHappyPath({ stockQuantity: 0 });

    const res = await request(buildApp()).post('/api/checkout').send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pending');
    expect(res.body.message).toBe('Commande en attente de stock');
    expect(prismaMock.product.update).not.toHaveBeenCalled();
  });

  it('decrements stock for every purchased item when in stock', async () => {
    mockHappyPath({ stockQuantity: 10 });

    await request(buildApp()).post('/api/checkout').send(validPayload);

    expect(prismaMock.product.update).toHaveBeenCalledTimes(2);
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { stockQuantity: 8, inStock: true },
    });
  });

  it('reuses an existing customer instead of creating a new one', async () => {
    prismaMock.customer.findUnique.mockResolvedValue({ id: 'existing-cust', email: validPayload.customer.email } as any);
    prismaMock.address.create.mockResolvedValue({ id: 'addr1' } as any);
    prismaMock.product.findMany.mockResolvedValue([
      { id: 'p1', stockQuantity: 10 },
      { id: 'p2', stockQuantity: 10 },
    ] as any);
    prismaMock.order.create.mockResolvedValue({ id: 'order1', orderNumber: 'FDV-TEST', items: [] } as any);

    await request(buildApp()).post('/api/checkout').send(validPayload);

    expect(prismaMock.customer.create).not.toHaveBeenCalled();
  });

  it('sends the order confirmation email asynchronously without blocking the response', async () => {
    mockHappyPath();

    await request(buildApp()).post('/api/checkout').send(validPayload);

    expect(sendOrderConfirmationEmail).toHaveBeenCalledTimes(1);
    const emailArg = vi.mocked(sendOrderConfirmationEmail).mock.calls[0][0];
    expect(emailArg.orderNumber).toBe('FDV-TEST');
    expect(emailArg.total).toBe(60000);
  });

  it('returns 500 on unexpected errors', async () => {
    prismaMock.customer.findUnique.mockRejectedValue(new Error('db down'));

    const res = await request(buildApp()).post('/api/checkout').send(validPayload);

    expect(res.status).toBe(500);
  });
});

describe('PATCH /api/checkout/orders/:orderId/status', () => {
  it('rejects an invalid status', async () => {
    const res = await request(buildApp())
      .patch('/api/checkout/orders/o1/status')
      .send({ status: 'not-a-status' });

    expect(res.status).toBe(400);
  });

  it('updates the order status', async () => {
    prismaMock.order.update.mockResolvedValue({ id: 'o1', status: 'shipped' } as any);

    const res = await request(buildApp())
      .patch('/api/checkout/orders/o1/status')
      .send({ status: 'shipped' });

    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe('shipped');
    expect(sendOrderCancellationEmail).not.toHaveBeenCalled();
  });

  it('saves the cancellation reason and sends a cancellation email to the customer', async () => {
    prismaMock.order.update.mockResolvedValue({
      id: 'o1',
      orderNumber: 'FDV-CANCEL',
      status: 'cancelled',
      total: 45000,
      customer: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com' },
      items: [{ quantity: 2, price: 15000, product: { name: 'Poulet fermier' } }],
    } as any);

    const res = await request(buildApp())
      .patch('/api/checkout/orders/o1/status')
      .send({ status: 'cancelled', reason: 'Rupture de stock' });

    expect(res.status).toBe(200);

    const updateArgs = prismaMock.order.update.mock.calls[0][0] as any;
    expect(updateArgs.data.cancelReason).toBe('Rupture de stock');

    expect(sendOrderCancellationEmail).toHaveBeenCalledTimes(1);
    const emailArg = vi.mocked(sendOrderCancellationEmail).mock.calls[0][0];
    expect(emailArg.orderNumber).toBe('FDV-CANCEL');
    expect(emailArg.customerEmail).toBe('jean@example.com');
    expect(emailArg.reason).toBe('Rupture de stock');
    expect(emailArg.items).toEqual([{ name: 'Poulet fermier', quantity: 2, price: 15000 }]);
  });

  it('cancels without a reason when none is provided', async () => {
    prismaMock.order.update.mockResolvedValue({
      id: 'o1',
      orderNumber: 'FDV-CANCEL2',
      status: 'cancelled',
      total: 10000,
      customer: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com' },
      items: [],
    } as any);

    await request(buildApp())
      .patch('/api/checkout/orders/o1/status')
      .send({ status: 'cancelled' });

    const updateArgs = prismaMock.order.update.mock.calls[0][0] as any;
    expect(updateArgs.data.cancelReason).toBeNull();

    const emailArg = vi.mocked(sendOrderCancellationEmail).mock.calls[0][0];
    expect(emailArg.reason).toBeUndefined();
  });
});

describe('GET /api/checkout/customer/:email', () => {
  it('returns an empty list for an unknown customer', async () => {
    prismaMock.customer.findUnique.mockResolvedValue(null);

    const res = await request(buildApp()).get('/api/checkout/customer/nobody@example.com');

    expect(res.status).toBe(200);
    expect(res.body.orders).toEqual([]);
  });
});

describe('GET /api/checkout/:orderNumber', () => {
  it('returns 404 when the order is not found', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);

    const res = await request(buildApp()).get('/api/checkout/FDV-UNKNOWN');

    expect(res.status).toBe(404);
  });
});
