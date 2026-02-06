import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { API_BASE_URL } from '@/lib/api/config';
import NosDoulesClient from './NospoulesClient';

async function getChickenBreeds() {
  noStore();

  const apiUrl = `${API_BASE_URL}/chickens`;
  console.log('[SSR] Fetching chickens from:', apiUrl);

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
    console.log('[SSR] Chickens fetched:', data?.length || 0);
    return data;
  } catch (error) {
    console.error('[SSR] Error fetching chickens:', error);
    return [];
  }
}

export default async function NosDoulesPage() {
  const chickenBreeds = await getChickenBreeds();

  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50 py-12 flex items-center justify-center">Chargement...</div>}>
      <NosDoulesClient chickenBreeds={chickenBreeds} />
    </Suspense>
  );
}
