import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { mockReset, type DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';

vi.mock('../lib/prisma.js');

import prisma from '../lib/prisma.js';
import categoriesRouter from './categories.js';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/categories', categoriesRouter);
  return app;
}

function category(overrides: Partial<any> = {}) {
  return {
    id: '1',
    name: 'Poulet',
    slug: 'poulet',
    description: null,
    image: null,
    order: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('GET /api/categories', () => {
  it('returns categories with product counts', async () => {
    prismaMock.category.findMany.mockResolvedValue([category()] as any);
    prismaMock.product.count.mockResolvedValue(3);

    const res = await request(buildApp()).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.categories[0]._count.products).toBe(3);
    expect(prismaMock.product.count).toHaveBeenCalledWith({ where: { category: 'poulet' } });
  });
});

describe('GET /api/categories/active', () => {
  it('sorts categories with stock before out-of-stock categories', async () => {
    prismaMock.category.findMany.mockResolvedValue([
      category({ id: '1', slug: 'porc', order: 0 }),
      category({ id: '2', slug: 'poulet', order: 1 }),
    ] as any);
    prismaMock.product.count
      .mockResolvedValueOnce(0) // porc: no stock
      .mockResolvedValueOnce(5); // poulet: in stock

    const res = await request(buildApp()).get('/api/categories/active');

    expect(res.status).toBe(200);
    expect(res.body[0].slug).toBe('poulet');
    expect(res.body[1].slug).toBe('porc');
  });

  it('falls back to order when stock status is equal', async () => {
    prismaMock.category.findMany.mockResolvedValue([
      category({ id: '1', slug: 'b', order: 2 }),
      category({ id: '2', slug: 'a', order: 1 }),
    ] as any);
    prismaMock.product.count.mockResolvedValue(0);

    const res = await request(buildApp()).get('/api/categories/active');

    expect(res.body.map((c: any) => c.slug)).toEqual(['a', 'b']);
  });
});

describe('GET /api/categories/:slug', () => {
  it('returns 404 for an unknown slug', async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);

    const res = await request(buildApp()).get('/api/categories/unknown');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/categories', () => {
  it('requires a name', async () => {
    const res = await request(buildApp()).post('/api/categories').send({});

    expect(res.status).toBe(400);
  });

  it('creates a category with a slugified name', async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);
    prismaMock.category.create.mockResolvedValue(category({ name: 'Produits Transformés', slug: 'produits-transformes' }) as any);

    const res = await request(buildApp()).post('/api/categories').send({ name: 'Produits Transformés' });

    expect(res.status).toBe(201);
    const createArgs = prismaMock.category.create.mock.calls[0][0] as any;
    expect(createArgs.data.slug).toBe('produits-transformes');
  });

  it('deduplicates a slug that already exists', async () => {
    prismaMock.category.findUnique.mockResolvedValue(category() as any);
    prismaMock.category.create.mockResolvedValue(category() as any);

    await request(buildApp()).post('/api/categories').send({ name: 'Poulet' });

    const createArgs = prismaMock.category.create.mock.calls[0][0] as any;
    expect(createArgs.data.slug).toMatch(/^poulet-\d+$/);
  });
});

describe('PUT /api/categories/:id', () => {
  it('returns 404 for a missing category', async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);

    const res = await request(buildApp()).put('/api/categories/1').send({ name: 'New' });

    expect(res.status).toBe(404);
  });

  it('keeps the existing slug when the name is unchanged', async () => {
    prismaMock.category.findUnique.mockResolvedValue(category() as any);
    prismaMock.category.update.mockResolvedValue(category() as any);

    await request(buildApp()).put('/api/categories/1').send({ name: 'Poulet' });

    const updateArgs = prismaMock.category.update.mock.calls[0][0] as any;
    expect(updateArgs.data.slug).toBe('poulet');
  });
});

describe('DELETE /api/categories/:id', () => {
  it('refuses to delete a category that still has products', async () => {
    prismaMock.category.findUnique.mockResolvedValue(category() as any);
    prismaMock.product.count.mockResolvedValue(2);

    const res = await request(buildApp()).delete('/api/categories/1');

    expect(res.status).toBe(400);
    expect(prismaMock.category.delete).not.toHaveBeenCalled();
  });

  it('deletes an empty category', async () => {
    prismaMock.category.findUnique.mockResolvedValue(category() as any);
    prismaMock.product.count.mockResolvedValue(0);
    prismaMock.category.delete.mockResolvedValue(category() as any);

    const res = await request(buildApp()).delete('/api/categories/1');

    expect(res.status).toBe(200);
    expect(prismaMock.category.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});

describe('POST /api/categories/reorder', () => {
  it('rejects a non-array payload', async () => {
    const res = await request(buildApp()).post('/api/categories/reorder').send({ orders: 'nope' });

    expect(res.status).toBe(400);
  });

  it('updates the order of every category', async () => {
    prismaMock.category.update.mockResolvedValue(category() as any);

    const res = await request(buildApp())
      .post('/api/categories/reorder')
      .send({ orders: [{ id: '1', order: 2 }, { id: '2', order: 1 }] });

    expect(res.status).toBe(200);
    expect(prismaMock.category.update).toHaveBeenCalledTimes(2);
  });
});
