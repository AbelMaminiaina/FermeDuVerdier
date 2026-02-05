import { notFound } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { API_BASE_URL } from '@/lib/api/config';
import ProductDetailClient from './ProductDetailClient';

async function getProduct(slug: string) {
  noStore();
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function getRelatedProducts(slug: string) {
  noStore();
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}/related?limit=4`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const [product, relatedProducts] = await Promise.all([
    getProduct(slug),
    getRelatedProducts(slug),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
