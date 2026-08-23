export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Server Components / SSR run inside the frontend container: hitting the public
// domain (NEXT_PUBLIC_API_URL) would round-trip out through the internet and
// back through Nginx. BACKEND_URL (set in docker-compose.prod.yml) points
// straight at the backend container over the internal Docker network instead.
export const SERVER_API_BASE_URL = process.env.BACKEND_URL
  ? `${process.env.BACKEND_URL}/api`
  : API_BASE_URL;

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
