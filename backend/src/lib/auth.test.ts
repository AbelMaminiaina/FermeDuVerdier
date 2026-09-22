import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { mockReset, type DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';

vi.mock('./prisma.js');
vi.mock('./cache.js', () => ({
  withCache: vi.fn((_key: string, _ttl: number, fn: () => unknown) => fn()),
  invalidateProductCache: vi.fn().mockResolvedValue(undefined),
  CACHE_TTL: { PRODUCTS: 60 },
  CACHE_KEYS: { PRODUCTS: 'products', RELATED: 'related' },
}));
vi.mock('../services/emailService.js', () => ({
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue(true),
  sendOrderCancellationEmail: vi.fn().mockResolvedValue(true),
  sendOrderShippedEmail: vi.fn().mockResolvedValue(true),
  sendOrderDeliveredEmail: vi.fn().mockResolvedValue(true),
}));

import prisma from './prisma.js';
import productsRouter from '../routes/products.js';
import checkoutRouter from '../routes/checkout.js';
import categoriesRouter from '../routes/categories.js';
import contactRouter from '../routes/contact.js';
import newsletterRouter from '../routes/newsletter.js';
import { ADMIN_SESSION, sessionCookie } from '../test/auth.js';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/products', productsRouter);
  app.use('/api/checkout', checkoutRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api/newsletter', newsletterRouter);
  return app;
}

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

const adminRoutes: [Method, string][] = [
  ['get', '/api/checkout/orders'],
  ['patch', '/api/checkout/orders/o1/status'],
  ['get', '/api/checkout/FDV-ABC-123'],
  ['post', '/api/categories'],
  ['put', '/api/categories/c1'],
  ['delete', '/api/categories/c1'],
  ['post', '/api/categories/reorder'],
  ['get', '/api/contact'],
  ['patch', '/api/contact/m1/read'],
  ['get', '/api/newsletter'],
  ['delete', '/api/newsletter/a@b.c'],
  ['post', '/api/products'],
  ['put', '/api/products/p1'],
  ['patch', '/api/products/p1/stock'],
  ['patch', '/api/products/p1/images'],
  ['patch', '/api/products/p1/visibility'],
  ['get', '/api/products/p1/has-orders'],
  ['delete', '/api/products/p1'],
];

const customerSession = { email: 'client@example.com', name: 'Client', role: 'customer' };

describe('Routes d’administration', () => {
  it.each(adminRoutes)('%s %s → 401 sans session', async (method, path) => {
    const res = await request(buildApp())[method](path).send({});
    expect(res.status).toBe(401);
  });

  it.each(adminRoutes)('%s %s → 403 pour un client connecté', async (method, path) => {
    const res = await request(buildApp())[method](path)
      .set('Cookie', await sessionCookie(customerSession))
      .send({});
    expect(res.status).toBe(403);
  });

  it('refuse un cookie chiffré avec un autre secret (session forgée)', async () => {
    const forged = await sessionCookie(ADMIN_SESSION, 'un-autre-secret');
    const res = await request(buildApp()).get('/api/checkout/orders').set('Cookie', forged);
    expect(res.status).toBe(401);
    expect(prismaMock.order.findMany).not.toHaveBeenCalled();
  });

  it('refuse un cookie illisible', async () => {
    const res = await request(buildApp())
      .get('/api/checkout/orders')
      .set('Cookie', 'next-auth.session-token=nimportequoi');
    expect(res.status).toBe(401);
  });

  it('accepte la session admin (cookie sécurisé de la prod)', async () => {
    prismaMock.order.findMany.mockResolvedValue([]);
    const cookie = (await sessionCookie(ADMIN_SESSION)).replace('next-auth.', '__Secure-next-auth.');
    const res = await request(buildApp()).get('/api/checkout/orders').set('Cookie', cookie);
    expect(res.status).toBe(200);
  });

  it('refuse tout quand NEXTAUTH_SECRET est absent du serveur', async () => {
    const cookie = await sessionCookie(ADMIN_SESSION);
    const saved = process.env.NEXTAUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    try {
      const res = await request(buildApp()).get('/api/checkout/orders').set('Cookie', cookie);
      expect(res.status).toBe(401);
    } finally {
      process.env.NEXTAUTH_SECRET = saved;
    }
  });
});

describe('GET /api/checkout/customer/:email', () => {
  it('401 sans session', async () => {
    const res = await request(buildApp()).get('/api/checkout/customer/client@example.com');
    expect(res.status).toBe(401);
  });

  it('403 quand un client demande les commandes d’un autre', async () => {
    const res = await request(buildApp())
      .get('/api/checkout/customer/autre@example.com')
      .set('Cookie', await sessionCookie(customerSession));
    expect(res.status).toBe(403);
    expect(prismaMock.customer.findUnique).not.toHaveBeenCalled();
  });

  it('autorise le client à voir ses propres commandes (casse ignorée)', async () => {
    prismaMock.customer.findUnique.mockResolvedValue(null);
    const res = await request(buildApp())
      .get('/api/checkout/customer/Client@Example.com')
      .set('Cookie', await sessionCookie(customerSession));
    expect(res.status).toBe(200);
  });
});

describe('Routes publiques', () => {
  it('le suivi par numéro reste accessible sans session', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);
    const res = await request(buildApp()).get('/api/checkout/track/FDV-ABC-123');
    expect(res.status).toBe(404);
  });

  it('includeInactive est ignoré pour un visiteur (produits masqués non listés)', async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    await request(buildApp()).get('/api/products?includeInactive=true');
    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });

  it('includeInactive est pris en compte pour l’admin', async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    await request(buildApp())
      .get('/api/products?includeInactive=true')
      .set('Cookie', await sessionCookie(ADMIN_SESSION));
    const where = prismaMock.product.findMany.mock.calls[0][0]?.where as Record<string, unknown>;
    expect(where).not.toHaveProperty('isActive');
  });
});
