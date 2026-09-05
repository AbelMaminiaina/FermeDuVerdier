import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Product } from '@/types';
import ProductCard from './ProductCard';

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Poulet fermier',
    slug: 'poulet-fermier',
    category: 'volaille',
    description: 'desc',
    shortDescription: 'short',
    price: 30000,
    images: ['/img.jpg'],
    inStock: true,
    badges: [],
    productType: 'piece',
    freeShipping: false,
    estimatedWeightKg: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('ProductCard — nature & livraison', () => {
  it('labels a "vif" product with "Réserver"', () => {
    render(<ProductCard product={makeProduct({ productType: 'vif' })} />);
    expect(screen.getByRole('button', { name: 'Réserver' })).toBeInTheDocument();
  });

  it('labels a "piece" product with "Ajouter"', () => {
    render(<ProductCard product={makeProduct({ productType: 'piece' })} />);
    expect(screen.getByRole('button', { name: 'Ajouter au panier' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Réserver' })).not.toBeInTheDocument();
  });

  it('shows the estimated weight when set', () => {
    render(<ProductCard product={makeProduct({ estimatedWeightKg: 1.8 })} />);
    expect(screen.getByText(/≈ 1,8 kg/)).toBeInTheDocument();
  });

  it('shows a "Livraison offerte" badge when the product has free shipping', () => {
    render(<ProductCard product={makeProduct({ freeShipping: true })} />);
    expect(screen.getByText('Livraison offerte')).toBeInTheDocument();
  });

  it('does not show the free-shipping badge otherwise', () => {
    render(<ProductCard product={makeProduct({ freeShipping: false })} />);
    expect(screen.queryByText('Livraison offerte')).not.toBeInTheDocument();
  });

  it('always shows the "/pièce" price unit', () => {
    render(<ProductCard product={makeProduct()} />);
    expect(screen.getByText('/pièce')).toBeInTheDocument();
  });
});

describe('ProductCard — date de disponibilité', () => {
  const future = new Date(Date.now() + 30 * 86400_000).toISOString();
  const past = new Date(Date.now() - 30 * 86400_000).toISOString();

  it('shows "Réserver" and the availability date for an upcoming product, even out of stock — no "Rupture de stock" overlay', () => {
    render(<ProductCard product={makeProduct({ availableFrom: future, inStock: false })} />);
    expect(screen.getByRole('button', { name: 'Réserver' })).toBeInTheDocument();
    expect(screen.getByText(/Disponible le/)).toBeInTheDocument();
    expect(screen.queryByText('Rupture de stock')).not.toBeInTheDocument();
  });

  it('behaves normally when the availability date is in the past', () => {
    render(<ProductCard product={makeProduct({ availableFrom: past })} />);
    expect(screen.getByRole('button', { name: 'Ajouter au panier' })).toBeInTheDocument();
    expect(screen.queryByText(/Disponible le/)).not.toBeInTheDocument();
  });
});
