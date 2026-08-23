import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { mockReset, type DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';

vi.mock('../lib/prisma.js');
vi.mock('../lib/cache.js', () => ({
  withCache: (_key: string, _ttl: number, fn: () => Promise<unknown>) => fn(),
  CACHE_TTL: { CHICKENS: 1 },
  CACHE_KEYS: { CHICKENS: 'chickens' },
}));

import prisma from '../lib/prisma.js';
import chickensRouter from './chickens.js';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/chickens', chickensRouter);
  return app;
}

describe('GET /api/chickens', () => {
  it('returns all breeds ordered by name', async () => {
    prismaMock.chickenBreed.findMany.mockResolvedValue([{ id: '1', name: 'Sussex' }] as any);

    const res = await request(buildApp()).get('/api/chickens');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(prismaMock.chickenBreed.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
  });
});

describe('GET /api/chickens/available', () => {
  it('filters to only available breeds', async () => {
    prismaMock.chickenBreed.findMany.mockResolvedValue([]);

    await request(buildApp()).get('/api/chickens/available');

    expect(prismaMock.chickenBreed.findMany).toHaveBeenCalledWith({
      where: { available: true },
      orderBy: { name: 'asc' },
    });
  });
});

describe('GET /api/chickens/:slug', () => {
  it('returns 404 when the breed does not exist', async () => {
    prismaMock.chickenBreed.findUnique.mockResolvedValue(null);

    const res = await request(buildApp()).get('/api/chickens/unknown');

    expect(res.status).toBe(404);
  });

  it('returns the breed', async () => {
    prismaMock.chickenBreed.findUnique.mockResolvedValue({ id: '1', slug: 'sussex' } as any);

    const res = await request(buildApp()).get('/api/chickens/sussex');

    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('sussex');
  });
});
