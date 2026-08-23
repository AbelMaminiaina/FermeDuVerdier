import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchAPI } from './config';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('fetchAPI', () => {
  it('requests the configured base URL and endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ hello: 'world' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await fetchAPI('/products');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/products',
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) })
    );
  });

  it('returns the parsed JSON body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ hello: 'world' }) })
    );

    const result = await fetchAPI<{ hello: string }>('/products');

    expect(result).toEqual({ hello: 'world' });
  });

  it('forwards the caller-supplied method and body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    vi.stubGlobal('fetch', fetchMock);

    await fetchAPI('/checkout', {
      method: 'POST',
      body: JSON.stringify({ a: 1 }),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/checkout',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ a: 1 }),
      })
    );
  });

  // options spread after the default headers, so caller-supplied `headers`
  // currently replaces the whole headers object instead of merging into it.
  it('replaces the default Content-Type header when the caller passes its own headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    vi.stubGlobal('fetch', fetchMock);

    await fetchAPI('/checkout', { headers: { Authorization: 'Bearer token' } });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers).toEqual({ Authorization: 'Bearer token' });
  });

  it('throws an error with the status when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' })
    );

    await expect(fetchAPI('/products/missing')).rejects.toThrow('API Error: 404 Not Found');
  });
});

describe('SERVER_API_BASE_URL', () => {
  const originalBackendUrl = process.env.BACKEND_URL;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (originalBackendUrl === undefined) {
      delete process.env.BACKEND_URL;
    } else {
      process.env.BACKEND_URL = originalBackendUrl;
    }
  });

  it('uses BACKEND_URL (internal Docker network) when set, so Server Components skip the public domain', async () => {
    process.env.BACKEND_URL = 'http://backend:3001';

    const { SERVER_API_BASE_URL } = await import('./config');

    expect(SERVER_API_BASE_URL).toBe('http://backend:3001/api');
  });

  it('falls back to the public API_BASE_URL when BACKEND_URL is not set (e.g. local dev)', async () => {
    delete process.env.BACKEND_URL;

    const { SERVER_API_BASE_URL, API_BASE_URL } = await import('./config');

    expect(SERVER_API_BASE_URL).toBe(API_BASE_URL);
  });
});
