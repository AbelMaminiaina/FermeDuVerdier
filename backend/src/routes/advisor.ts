import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { withCache, CACHE_TTL, CACHE_KEYS } from '../lib/cache.js';
import { getAdvice, normalizeText } from '../services/advisorService.js';
import { transformProduct } from './products.js';

const router = Router();

const advisorSchema = z.object({
  question: z.string().trim().min(3).max(500),
});

// Limite par visiteur pour ne pas épuiser le quota gratuit de Mistral
// (en mémoire : suffisant pour une seule instance du backend)
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const requestLog = new Map<string, number[]>();

export function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (requestLog.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    requestLog.set(key, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(key, recent);
  return false;
}

export function resetRateLimit(): void {
  requestLog.clear();
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { question } = advisorSchema.parse(req.body);

    if (isRateLimited(req.ip || 'unknown')) {
      return res.status(429).json({
        error: 'Trop de demandes, merci de réessayer un peu plus tard.',
      });
    }

    // Même question (à la casse et aux accents près) → même réponse, sans rappeler l'IA
    const cacheKey = `${CACHE_KEYS.ADVISOR}:${normalizeText(question).replace(/\s+/g, ' ')}`;

    const advice = await withCache(cacheKey, CACHE_TTL.ADVISOR, async () => {
      // Catalogue léger : jamais les images (data: URI en base64, trop lourdes pour l'IA)
      const catalog = await prisma.product.findMany({
        where: { isActive: true },
        select: {
          slug: true,
          name: true,
          category: true,
          shortDescription: true,
          price: true,
          productType: true,
          inStock: true,
          availableFrom: true,
          freeShipping: true,
          race: true,
        },
        orderBy: [{ inStock: 'desc' }, { createdAt: 'desc' }],
      });
      return getAdvice(question, catalog);
    });

    // Produits rechargés à chaque fois pour que le stock et le prix affichés soient à jour
    const products = advice.slugs.length
      ? await prisma.product.findMany({
          where: { slug: { in: advice.slugs }, isActive: true },
        })
      : [];
    const ordered = advice.slugs
      .map((slug) => products.find((p) => p.slug === slug))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    res.json({
      message: advice.message,
      source: advice.source,
      products: ordered.map(transformProduct),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Question invalide (entre 3 et 500 caractères)',
      });
    }

    console.error('Error processing advisor request:', error);
    res.status(500).json({ error: 'Le conseiller est indisponible pour le moment' });
  }
});

export default router;
