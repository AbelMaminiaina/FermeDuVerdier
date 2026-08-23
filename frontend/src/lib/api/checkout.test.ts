import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, getOrderByNumber, getCustomerOrders } from './checkout';
import type { CartItem } from '@/types';

function mockFetchJson(body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(body) });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

const items: CartItem[] = [
  { productId: 'p1', name: 'Poulet', price: 15000, quantity: 1, image: '', slug: 'poulet' },
];

describe('createOrder', () => {
  it('POSTs the checkout payload as JSON', async () => {
    const fetchMock = mockFetchJson({ success: true, message: 'ok' });

    await createOrder({
      items,
      customer: { email: 'a@b.com', firstName: 'A', lastName: 'B' },
      shippingAddress: { street: 'rue', city: 'Tana', postalCode: '101' },
      deliveryMethod: 'standard',
    });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:3001/api/checkout');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toMatchObject({ deliveryMethod: 'standard' });
  });
});

describe('getOrderByNumber', () => {
  it('requests the order by its number', async () => {
    const fetchMock = mockFetchJson({ id: '1' });

    await getOrderByNumber('FDV-123');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/checkout/FDV-123',
      expect.anything()
    );
  });
});

describe('getCustomerOrders', () => {
  it('URL-encodes the customer email', async () => {
    const fetchMock = mockFetchJson({ orders: [] });

    await getCustomerOrders('a+test@example.com');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/checkout/customer/a%2Btest%40example.com',
      expect.anything()
    );
  });
});
