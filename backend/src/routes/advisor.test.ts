import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { mockReset, type DeepMockProxy } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';

vi.mock('../lib/prisma.js');
vi.mock('../lib/redis');

import prisma from '../lib/prisma.js';
import redis from '../lib/redis';
import advisorRouter, { resetRateLimit } from './advisor.js';
import { cleanMessage } from '../services/advisorService.js';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

const catalog = [
  {
    slug: 'poule-pondeuse',
    name: 'Poule pondeuse',
    category: 'poules',
    shortDescription: 'Excellente pondeuse, idéale pour débuter',
    price: 45000,
    productType: 'vif',
    inStock: true,
    availableFrom: null,
    freeShipping: false,
    race: 'Akoho Gasy',
  },
  {
    slug: 'tilapia-frais',
    name: 'Tilapia frais',
    category: 'poisson',
    shortDescription: "Poisson d'élevage",
    price: 12000,
    productType: 'piece',
    inStock: true,
    availableFrom: null,
    freeShipping: false,
    race: null,
  },
];

function fullProduct(slug: string) {
  const item = catalog.find((c) => c.slug === slug)!;
  return { ...item, id: `id-${slug}`, images: [], quantity: null, eggColor: null, dimensions: null, weight: null } as any;
}

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/advisor', advisorRouter);
  return app;
}

const fetchMock = vi.fn();

beforeEach(() => {
  mockReset(prismaMock);
  resetRateLimit();
  (redis.get as any).mockResolvedValue(null);
  (redis.set as any).mockResolvedValue(undefined);
  prismaMock.product.findMany.mockImplementation((async (args: any) => {
    if (args?.select) return catalog;
    return args.where.slug.in.map(fullProduct);
  }) as any);
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  delete process.env.MISTRAL_API_KEY;
  delete process.env.GEMINI_API_KEY;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/advisor', () => {
  it('rejects a too-short question', async () => {
    const res = await request(buildApp()).post('/api/advisor').send({ question: 'a' });

    expect(res.status).toBe(400);
  });

  it('falls back to keyword search when no AI key is configured', async () => {
    const res = await request(buildApp()).post('/api/advisor').send({ question: 'Je veux des poules pondeuses' });

    expect(res.status).toBe(200);
    expect(res.body.source).toBe('fallback');
    expect(res.body.products.map((p: any) => p.slug)).toEqual(['poule-pondeuse']);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns the products picked by Mistral, ignoring unknown slugs', async () => {
    process.env.MISTRAL_API_KEY = 'test-key';
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          { message: { content: JSON.stringify({ message: 'Le tilapia est parfait.', slugs: ['tilapia-frais', 'invente'] }) } },
        ],
      }),
    });

    const res = await request(buildApp()).post('/api/advisor').send({ question: 'Une idée pour le dîner ?' });

    expect(res.status).toBe(200);
    expect(res.body.source).toBe('ai');
    expect(res.body.message).toBe('Le tilapia est parfait.');
    expect(res.body.products.map((p: any) => p.slug)).toEqual(['tilapia-frais']);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.mistral.ai/v1/chat/completions');
    // Les images ne sont jamais envoyées à l'IA
    expect(fetchMock.mock.calls[0][1].body).not.toContain('images');
  });

  it('falls back to Gemini when Mistral fails', async () => {
    process.env.MISTRAL_API_KEY = 'test-key';
    process.env.GEMINI_API_KEY = 'test-key';
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 429, text: async () => 'quota exceeded' })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            { content: { parts: [{ text: JSON.stringify({ message: 'Une pondeuse !', slugs: ['poule-pondeuse'] }) }] } },
          ],
        }),
      });

    const res = await request(buildApp()).post('/api/advisor').send({ question: 'Je veux des œufs' });

    expect(res.body.source).toBe('ai');
    expect(res.body.products.map((p: any) => p.slug)).toEqual(['poule-pondeuse']);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain('generativelanguage.googleapis.com');
  });

  it('falls back to keyword search when the AI provider fails', async () => {
    process.env.MISTRAL_API_KEY = 'test-key';
    fetchMock.mockResolvedValue({ ok: false, status: 429, text: async () => 'quota exceeded' });

    const res = await request(buildApp()).post('/api/advisor').send({ question: 'du tilapia svp' });

    expect(res.status).toBe(200);
    expect(res.body.source).toBe('fallback');
    expect(res.body.products.map((p: any) => p.slug)).toEqual(['tilapia-frais']);
  });

  it('rate-limits a visitor after 10 questions per hour', async () => {
    const app = buildApp();
    for (let i = 0; i < 10; i++) {
      const res = await request(app).post('/api/advisor').send({ question: `question ${i}` });
      expect(res.status).toBe(200);
    }

    const res = await request(app).post('/api/advisor').send({ question: 'encore une' });
    expect(res.status).toBe(429);
  });
});

describe('cleanMessage', () => {
  it('strips Markdown and leaked slugs from the AI message', () => {
    expect(cleanMessage("Une **poule pondeuse** (slug: poule-pondeuse) et un abreuvoir (slug: abreuvoir).")).toBe(
      'Une poule pondeuse et un abreuvoir.'
    );
  });
});
