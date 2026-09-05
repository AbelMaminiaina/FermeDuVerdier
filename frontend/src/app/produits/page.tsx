import { Suspense } from 'react';
import { Metadata } from 'next';
import { SERVER_API_BASE_URL } from '@/lib/api/config';
import ProductsClient from './ProductsClient';

// This page fetches from the backend, which isn't reachable from the isolated
// Docker build stage — force per-request rendering so the build doesn't try
// to prerender it statically.
export const dynamic = 'force-dynamic';

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
  const apiUrl = `${SERVER_API_BASE_URL}/products`;
  console.log('[SSR] Fetching products from:', apiUrl);

  // Backend already caches this in Redis for 5 min (see CACHE_TTL.PRODUCTS).
  // We deliberately do NOT use Next.js' data cache: product payloads embed their
  // images (data: URIs) and the list can exceed Next's hard 2 MB fetch-cache
  // limit, which silently drops the oversized part of the response.
  const res = await fetch(apiUrl, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error('[SSR] Fetch failed:', res.status, res.statusText);
    throw new Error('Failed to fetch products');
  }

  const data = await res.json();
  console.log('[SSR] Products fetched:', data.products?.length || 0);

  return data;
}

export default async function ProductsPage() {
  const data = await getProducts();

  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50 py-12 flex items-center justify-center">Chargement...</div>}>
      <ProductsClient initialProducts={data.products} />
    </Suspense>
  );
}
