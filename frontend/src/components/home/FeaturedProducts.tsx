import { unstable_noStore as noStore } from 'next/cache';
import { API_BASE_URL } from '@/lib/api/config';
import { FeaturedProductsClient } from './FeaturedProductsClient';
import { products as localProducts } from '@/data/products';

function getLocalFeaturedProducts() {
  // Get popular or new products from local data
  const featured = localProducts
    .filter((p) => p.badges.includes('populaire') || p.badges.includes('nouveau'))
    .slice(0, 4);

  return featured.length > 0 ? featured : localProducts.slice(0, 4);
}

async function getFeaturedProducts() {
  noStore();

  const apiUrl = `${API_BASE_URL}/products`;
  console.log('[SSR] Fetching featured products from:', apiUrl);

  try {
    const res = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('[SSR] Featured fetch failed:', res.status, res.statusText);
      throw new Error('Failed to fetch');
    }

    const data = await res.json();
    console.log('[SSR] Featured products fetched, total:', data.products?.length || 0);

    // Si pas de produits du backend, utiliser les données locales
    if (!data.products || data.products.length === 0) {
      console.log('[SSR] Using local featured products as fallback');
      return getLocalFeaturedProducts();
    }

    // Get popular or new products
    const featured = data.products
      .filter((p: { badges: string[] }) => p.badges.includes('populaire') || p.badges.includes('nouveau'))
      .slice(0, 4);

    return featured.length > 0 ? featured : data.products.slice(0, 4);
  } catch (error) {
    console.error('[SSR] Error fetching featured products, using local data:', error);
    // Utiliser les données locales en cas d'erreur
    return getLocalFeaturedProducts();
  }
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return <FeaturedProductsClient products={products} />;
}

export default FeaturedProducts;
