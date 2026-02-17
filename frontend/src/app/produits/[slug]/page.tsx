import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { API_BASE_URL } from '@/lib/api/config';
import ProductDetailClient from './ProductDetailClient';
import { getProductBySlug, getRelatedProducts as getLocalRelatedProducts } from '@/data/products';

async function getProduct(slug: string) {
  noStore();
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}`);
    if (!res.ok) {
      // Fallback vers les données locales
      const localProduct = getProductBySlug(slug);
      return localProduct || null;
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching product, using local data:', error);
    // Fallback vers les données locales
    const localProduct = getProductBySlug(slug);
    return localProduct || null;
  }
}

async function getRelatedProducts(slug: string, productId: string) {
  noStore();
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}/related?limit=4`);
    if (!res.ok) {
      // Fallback vers les données locales
      return getLocalRelatedProducts(productId, 4);
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching related products, using local data:', error);
    // Fallback vers les données locales
    return getLocalRelatedProducts(productId, 4);
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(slug, product.id);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
