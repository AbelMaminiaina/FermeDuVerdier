import { SERVER_API_BASE_URL } from '@/lib/api/config';
import { FeaturedProductsClient } from './FeaturedProductsClient';

// Backend already caches this in Redis for 5 min (see CACHE_TTL.PRODUCTS).
// Not using Next.js' data cache here: product payloads embed their images
// (data: URIs) and the list can exceed Next's hard 2 MB fetch-cache limit,
// which silently drops the oversized part of the response.
async function getFeaturedProducts() {
  const apiUrl = `${SERVER_API_BASE_URL}/products`;
  console.log('[SSR] Fetching featured products from:', apiUrl);

  const res = await fetch(apiUrl, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error('[SSR] Featured fetch failed:', res.status, res.statusText);
    throw new Error('Failed to fetch featured products');
  }

  const data = await res.json();
  console.log('[SSR] Featured products fetched, total:', data.products?.length || 0);

  // Get popular or new products
  const featured = data.products
    .filter((p: { badges: string[] }) => p.badges.includes('populaire') || p.badges.includes('nouveau'))
    .slice(0, 4);

  return featured.length > 0 ? featured : data.products.slice(0, 4);
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return <FeaturedProductsClient products={products} />;
}

export default FeaturedProducts;
