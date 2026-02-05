import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { withCache, CACHE_TTL, CACHE_KEYS } from '../lib/cache.js';

const router = Router();

// Get all chicken breeds
router.get('/', async (_req: Request, res: Response) => {
  try {
    const cacheKey = `${CACHE_KEYS.CHICKENS}:all`;

    const chickens = await withCache(
      cacheKey,
      CACHE_TTL.CHICKENS,
      async () => {
        return prisma.chickenBreed.findMany({
          orderBy: { name: 'asc' },
        });
      }
    );

    res.json(chickens);
  } catch (error) {
    console.error('Error fetching chicken breeds:', error);
    res.status(500).json({ error: 'Failed to fetch chicken breeds' });
  }
});

// Get available chicken breeds
router.get('/available', async (_req: Request, res: Response) => {
  try {
    const cacheKey = `${CACHE_KEYS.CHICKENS}:available`;

    const chickens = await withCache(
      cacheKey,
      CACHE_TTL.CHICKENS,
      async () => {
        return prisma.chickenBreed.findMany({
          where: { available: true },
          orderBy: { name: 'asc' },
        });
      }
    );

    res.json(chickens);
  } catch (error) {
    console.error('Error fetching available chickens:', error);
    res.status(500).json({ error: 'Failed to fetch chickens' });
  }
});

// Get chicken breed by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const cacheKey = `${CACHE_KEYS.CHICKENS}:${slug}`;

    const chicken = await withCache(
      cacheKey,
      CACHE_TTL.CHICKENS,
      async () => {
        return prisma.chickenBreed.findUnique({
          where: { slug },
        });
      }
    );

    if (!chicken) {
      return res.status(404).json({ error: 'Chicken breed not found' });
    }

    res.json(chicken);
  } catch (error) {
    console.error('Error fetching chicken breed:', error);
    res.status(500).json({ error: 'Failed to fetch chicken breed' });
  }
});

export default router;
