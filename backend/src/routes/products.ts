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
            'porc': 'porc',
            'poulet': 'poulet',
            'poisson': 'poisson',
            'akanga': 'akanga',
            'caille': 'caille',
            'transformes': 'transformes',
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

        // Filter by stock status (par défaut, afficher seulement les produits en stock)
        if (inStock !== 'false') {
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
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      details: error?.message || 'Unknown error'
    });
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

// Admin: Update product stock
router.patch('/:productId/stock', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { stockQuantity } = req.body;

    if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
      return res.status(400).json({ error: 'Quantité de stock invalide' });
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity,
        inStock: stockQuantity > 0,
      },
    });

    res.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ error: 'Failed to update product stock' });
  }
});

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Admin: Create new product
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, category, price, stockQuantity, images } = req.body;

    if (!name || !category || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Données invalides' });
    }

    // Generate unique slug
    let slug = generateSlug(name);
    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || '',
        shortDescription: description ? description.substring(0, 100) : '',
        category: category as ProductCategory,
        price,
        stockQuantity: stockQuantity || 0,
        inStock: (stockQuantity || 0) > 0,
        images: images || [],
      },
    });

    res.status(201).json({ success: true, product: transformProduct(product) });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin: Update product
router.put('/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { name, description, category, price, stockQuantity, images } = req.body;

    if (!name || !category || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Données invalides' });
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Generate new slug if name changed
    let slug = existingProduct.slug;
    if (name !== existingProduct.name) {
      slug = generateSlug(name);
      const slugExists = await prisma.product.findFirst({
        where: { slug, id: { not: productId } },
      });
      if (slugExists) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        slug,
        description: description || '',
        shortDescription: description ? description.substring(0, 100) : '',
        category: category as ProductCategory,
        price,
        stockQuantity: stockQuantity ?? existingProduct.stockQuantity,
        inStock: (stockQuantity ?? existingProduct.stockQuantity) > 0,
        images: images || existingProduct.images,
      },
    });

    res.json({ success: true, product: transformProduct(product) });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin: Delete product
router.delete('/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Check if product has orders
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId },
    });

    if (orderItems) {
      // Soft delete - just mark as out of stock instead of deleting
      await prisma.product.update({
        where: { id: productId },
        data: { inStock: false, stockQuantity: 0 },
      });
      return res.json({
        success: true,
        message: 'Produit désactivé (conservé car lié à des commandes)'
      });
    }

    await prisma.product.delete({ where: { id: productId } });
    res.json({ success: true, message: 'Produit supprimé' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
