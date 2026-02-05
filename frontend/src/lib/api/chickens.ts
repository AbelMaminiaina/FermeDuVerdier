import { fetchAPI } from './config';
import { ChickenBreed } from '@/types';

export async function getChickenBreeds(): Promise<ChickenBreed[]> {
  return fetchAPI<ChickenBreed[]>('/chickens');
}

export async function getAvailableChickens(): Promise<ChickenBreed[]> {
  return fetchAPI<ChickenBreed[]>('/chickens/available');
}

export async function getChickenBySlug(slug: string): Promise<ChickenBreed> {
  return fetchAPI<ChickenBreed>(`/chickens/${slug}`);
}
