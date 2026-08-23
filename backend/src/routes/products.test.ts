import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { mockReset, type DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';

vi.mock('../lib/prisma.js');
vi.mock('../lib/cache.js', () => ({
  withCache: (_key: string, _ttl: number, fn: () => Promise<unknown>) => fn(),
  CACHE_TTL: { PRODUCTS: 1, PRODUCT: 1, RELATED: 1 },
  CACHE_KEYS: { PRODUCTS: 'products', PRODUCT: 'product', RELATED: 'related' },
  invalidateProductCache: vi.fn().mockResolvedValue(undefined),
}));

import prisma from '../lib/prisma.js';
import { invalidateProductCache } from '../lib/cache.js';
import productsRouter from './products.js';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
  vi.mocked(invalidateProductCache).mockClear();
});

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/products', productsRouter);
  return app;
}

function baseProduct(overrides: Partial<any> = {}) {
  return {
    id: 'p1',
    name: 'Poulet fermier',
    slug: 'poulet-fermier',
    description: 'desc',
    shortDescription: 'short',
    category: 'poulet',
    price: 15000,
    stockQuantity: 5,
    inStock: true,
    isActive: true,
    images: [],
    race: null,
    eggColor: null,
    quantity: null,
    dimensions: null,
    weight: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('GET /api/products', () => {
  it('transforms category dashes and builds metadata', async () => {
    prismaMock.product.findMany.mockResolvedValue([baseProduct({ category: 'oeufs_frais' })] as any);

    const res = await request(buildApp()).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.products[0].category).toBe('oeufs-frais');
    expect(res.body.products[0].metadata).toEqual({
      race: null,
      eggColor: null,
      quantity: null,
      dimensions: null,
      weight: null,
    });
  });

  it('filters by category, converting dashes to underscores', async () => {
    prismaMock.product.findMany.mockResolvedValue([]);

    await request(buildApp()).get('/api/products?category=oeufs-frais');

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'oeufs_frais' }),
      })
    );
  });

  it('hides inactive products by default', async () => {
    prismaMock.product.findMany.mockResolvedValue([]);

    await request(buildApp()).get('/api/products');

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });

  it('includes inactive products when requested', async () => {
    prismaMock.product.findMany.mockResolvedValue([]);

    await request(buildApp()).get('/api/products?includeInactive=true');

    const call = prismaMock.product.findMany.mock.calls[0][0] as any;
    expect(call.where.isActive).toBeUndefined();
  });

  it('returns 500 with details on failure', async () => {
    prismaMock.product.findMany.mockRejectedValue(new Error('db down'));

    const res = await request(buildApp()).get('/api/products');

    expect(res.status).toBe(500);
    expect(res.body.details).toBe('db down');
  });
});

describe('GET /api/products/:slug', () => {
  it('returns 404 when the product does not exist', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    const res = await request(buildApp()).get('/api/products/unknown');

    expect(res.status).toBe(404);
  });

  it('returns the transformed product', async () => {
    prismaMock.product.findUnique.mockResolvedValue(baseProduct() as any);

    const res = await request(buildApp()).get('/api/products/poulet-fermier');

    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('poulet-fermier');
  });
});

describe('PATCH /api/products/:productId/stock', () => {
  it('rejects a negative stock quantity', async () => {
    const res = await request(buildApp())
      .patch('/api/products/p1/stock')
      .send({ stockQuantity: -1 });

    expect(res.status).toBe(400);
    expect(prismaMock.product.update).not.toHaveBeenCalled();
  });

  it('sets inStock to false when quantity reaches zero', async () => {
    prismaMock.product.update.mockResolvedValue(baseProduct({ stockQuantity: 0, inStock: false }) as any);

    const res = await request(buildApp())
      .patch('/api/products/p1/stock')
      .send({ stockQuantity: 0 });

    expect(res.status).toBe(200);
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { stockQuantity: 0, inStock: false },
    });
    expect(invalidateProductCache).toHaveBeenCalled();
  });
});

describe('POST /api/products', () => {
  it('rejects invalid payloads', async () => {
    const res = await request(buildApp())
      .post('/api/products')
      .send({ name: '', category: 'poulet', price: 100 });

    expect(res.status).toBe(400);
  });

  it('rejects an unknown category', async () => {
    prismaMock.category.findFirst.mockResolvedValue(null);

    const res = await request(buildApp())
      .post('/api/products')
      .send({ name: 'Test', category: 'inconnue', price: 100 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('introuvable');
  });

  it('creates a product with a slugified, deduplicated slug', async () => {
    prismaMock.category.findFirst.mockResolvedValue({ id: 'c1' } as any);
    prismaMock.product.findUnique.mockResolvedValue(baseProduct({ slug: 'poulet-fermier-bio' }) as any);
    prismaMock.product.create.mockResolvedValue(baseProduct({ name: 'Poulet Fermier Bio' }) as any);

    const res = await request(buildApp())
      .post('/api/products')
      .send({ name: 'Poulet Fermier Bio', category: 'poulet', price: 100, stockQuantity: 2 });

    expect(res.status).toBe(201);
    const createCall = prismaMock.product.create.mock.calls[0][0] as any;
    expect(createCall.data.slug).toMatch(/^poulet-fermier-bio-\d+$/);
    expect(invalidateProductCache).toHaveBeenCalled();
  });
});

describe('DELETE /api/products/:productId', () => {
  it('soft-deletes a product that has existing orders', async () => {
    prismaMock.product.findUnique.mockResolvedValue(baseProduct() as any);
    prismaMock.orderItem.findFirst.mockResolvedValue({ id: 'oi1' } as any);

    const res = await request(buildApp()).delete('/api/products/p1');

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('désactivé');
    expect(prismaMock.product.delete).not.toHaveBeenCalled();
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { inStock: false, stockQuantity: 0 },
    });
  });

  it('hard-deletes a product with no orders', async () => {
    prismaMock.product.findUnique.mockResolvedValue(baseProduct() as any);
    prismaMock.orderItem.findFirst.mockResolvedValue(null);

    const res = await request(buildApp()).delete('/api/products/p1');

    expect(res.status).toBe(200);
    expect(prismaMock.product.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });

  it('returns 404 for an unknown product', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    const res = await request(buildApp()).delete('/api/products/missing');

    expect(res.status).toBe(404);
  });
});
