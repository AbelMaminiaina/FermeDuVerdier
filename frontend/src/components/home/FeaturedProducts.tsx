import { unstable_noStore as noStore } from 'next/cache';
import { API_BASE_URL } from '@/lib/api/config';
import { FeaturedProductsClient } from './FeaturedProductsClient';

async function getFeaturedProducts() {
  noStore();
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();

    // Get popular or new products
    const featured = data.products
      .filter((p: { badges: string[] }) => p.badges.includes('populaire') || p.badges.includes('nouveau'))
      .slice(0, 4);

    return featured.length > 0 ? featured : data.products.slice(0, 4);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return <FeaturedProductsClient products={products} />;
}

export default FeaturedProducts;
