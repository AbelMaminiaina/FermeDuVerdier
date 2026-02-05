import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { ProductCategory } from '@prisma/client';
import { withCache, CACHE_TTL, CACHE_KEYS } from '../lib/cache.js';

const router = Router();

// Transform product for frontend
function transformProduct(p: any) {
  return {
    ...p,
    category: p.category.replace('_', '-'),
    metadata: {
      race: p.race,
      eggColor: p.eggColor,
      quantity: p.quantity,
      dimensions: p.dimensions,
      weight: p.weight,
    },
  };
}

// Get all products with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, inStock } = req.query;

    // Build cache key based on query params
    const cacheKey = `${CACHE_KEYS.PRODUCTS}:list:${category || 'all'}:${search || ''}:${inStock || ''}`;

    const result = await withCache(
      cacheKey,
      CACHE_TTL.PRODUCTS,
      async () => {
        const where: any = {};

        // Filter by category
        if (category && category !== 'all') {
          const categoryMap: Record<string, ProductCategory> = {
            'oeufs-frais': 'oeufs_frais',
            'oeufs-fecondes': 'oeufs_fecondes',
            'poules': 'poules',
            'accessoires': 'accessoires',
          };
          where.category = categoryMap[category as string] || category;
        }

        // Filter by search term
        if (search && typeof search === 'string') {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { race: { contains: search, mode: 'insensitive' } },
          ];
        }

        // Filter by stock status
        if (inStock === 'true') {
          where.inStock = true;
        }

        const products = await prisma.product.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });

        const transformedProducts = products.map(transformProduct);

        return {
          products: transformedProducts,
          total: transformedProducts.length,
        };
      }
    );

    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const cacheKey = `${CACHE_KEYS.PRODUCT}:${slug}`;

    const product = await withCache(
      cacheKey,
      CACHE_TTL.PRODUCT,
      async () => {
        const p = await prisma.product.findUnique({
          where: { slug },
        });

        if (!p) return null;
        return transformProduct(p);
      }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get related products
router.get('/:slug/related', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit as string) || 4;
    const cacheKey = `${CACHE_KEYS.RELATED}:${slug}:${limit}`;

    const result = await withCache(
      cacheKey,
      CACHE_TTL.RELATED,
      async () => {
        const product = await prisma.product.findUnique({
          where: { slug },
        });

        if (!product) return null;

        const relatedProducts = await prisma.product.findMany({
          where: {
            category: product.category,
            slug: { not: slug },
          },
          take: limit,
        });

        return relatedProducts.map(transformProduct);
      }
    );

    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ error: 'Failed to fetch related products' });
  }
});

export default router;
