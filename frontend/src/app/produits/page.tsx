import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import { API_BASE_URL } from '@/lib/api/config';
import ProductsClient from './ProductsClient';
import { products as localProducts } from '@/data/products';

export const metadata: Metadata = {
  title: 'Nos Produits - Viande, Volaille et Poisson Frais',
  description:
    'Découvrez tous nos produits fermiers : porc entier, poulet Akoho Gasy, pintade Akanga, caille, tilapia frais. Livraison à Antananarivo, Madagascar.',
  keywords: [
    'produits fermiers madagascar',
    'viande porc madagascar',
    'poulet fermier akoho gasy',
    'pintade akanga',
    'caille madagascar',
    'tilapia frais',
    'livraison viande antananarivo',
  ],
  openGraph: {
    title: 'Nos Produits | Ferme du Vardier',
    description:
      'Porc, poulet Akoho Gasy, pintade Akanga, caille et tilapia frais. Produits fermiers de qualité livrés à Antananarivo.',
    url: 'https://fermeduvardier.com/produits',
    siteName: 'Ferme du Vardier',
    locale: 'fr_MG',
    type: 'website',
  },
  alternates: {
    canonical: '/produits',
  },
};

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
