import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { API_BASE_URL } from '@/lib/api/config';
import ProductsClient from './ProductsClient';

async function getProducts() {
  noStore(); // Mark this fetch as dynamic
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
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
