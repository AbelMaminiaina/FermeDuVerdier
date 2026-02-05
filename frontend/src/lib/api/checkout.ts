import { fetchAPI } from './config';
import { CartItem } from '@/types';

interface CheckoutData {
  items: CartItem[];
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country?: string;
  };
  deliveryMethod: 'standard' | 'express' | 'retrait';
  notes?: string;
}

interface CheckoutResponse {
  success: boolean;
  message: string;
  orderId?: string;
  orderNumber?: string;
  total?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      slug: string;
    };
  }>;
}

export async function createOrder(data: CheckoutData): Promise<CheckoutResponse> {
  return fetchAPI<CheckoutResponse>('/checkout', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  return fetchAPI<Order>(`/checkout/${orderNumber}`);
}

export async function getCustomerOrders(email: string): Promise<{ orders: Order[] }> {
  return fetchAPI<{ orders: Order[] }>(`/checkout/customer/${encodeURIComponent(email)}`);
}
