import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { API_BASE_URL } from '@/lib/api/config';
import ProductsClient from './ProductsClient';

async function getProducts() {
  noStore(); // Mark this fetch as dynamic

  const apiUrl = `${API_BASE_URL}/products`;
  console.log('[SSR] Fetching products from:', apiUrl);

  try {
    const res = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('[SSR] Fetch failed:', res.status, res.statusText);
      throw new Error('Failed to fetch');
    }

    const data = await res.json();
    console.log('[SSR] Products fetched:', data.products?.length || 0);
    return data;
  } catch (error) {
    console.error('[SSR] Error fetching products:', error);
    return { products: [], total: 0 };
  }
}

export default async function ProductsPage() {
  const data = await getProducts();

  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50 py-12 flex items-center justify-center">Chargement...</div>}>
      <ProductsClient initialProducts={data.products} />
    </Suspense>
  );
}
