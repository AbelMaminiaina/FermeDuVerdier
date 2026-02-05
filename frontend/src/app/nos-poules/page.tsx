import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { API_BASE_URL } from '@/lib/api/config';
import NosDoulesClient from './NospoulesClient';

async function getChickenBreeds() {
  noStore();
  try {
    const res = await fetch(`${API_BASE_URL}/chickens`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch (error) {
    console.error('Error fetching chicken breeds:', error);
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
