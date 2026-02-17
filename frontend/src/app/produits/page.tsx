import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { API_BASE_URL } from '@/lib/api/config';
import ProductsClient from './ProductsClient';
import { products as localProducts } from '@/data/products';

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

    // Si le backend retourne des produits, les utiliser
    if (data.products && data.products.length > 0) {
      return data;
    }

    // Sinon, utiliser les données locales
    console.log('[SSR] Using local products as fallback');
    return { products: localProducts, total: localProducts.length };
  } catch (error) {
    console.error('[SSR] Error fetching products, using local data:', error);
    // Utiliser les données locales en cas d'erreur
    return { products: localProducts, total: localProducts.length };
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
