import { API_BASE_URL } from './config';
import { Product } from '@/types';

export interface AdvisorResponse {
  message: string;
  source: 'ai' | 'fallback';
  products: Product[];
}

export async function askAdvisor(question: string): Promise<AdvisorResponse> {
  const response = await fetch(`${API_BASE_URL}/advisor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  const data = await response.json().catch(() => null);

  // Le backend renvoie un message lisible (limite atteinte, question invalide…)
  if (!response.ok) {
    throw new Error(data?.error || 'Le conseiller est indisponible pour le moment');
  }

  return data as AdvisorResponse;
}
