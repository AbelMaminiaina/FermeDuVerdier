import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Product } from '@/types';
import type { Category } from '@/hooks/useCategories';
import { ProductsMegaMenu } from './ProductsMegaMenu';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Produit',
    slug: 'produit',
    category: 'porc',
    description: '',
    shortDescription: '',
    price: 10000,
    images: ['/img.jpg'],
    inStock: true,
    badges: [],
    productType: 'piece',
    freeShipping: false,
    estimatedWeightKg: null,
    availableFrom: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

const products: Product[] = [
  makeProduct({ id: 'a', name: 'Côte de porc', slug: 'cote', createdAt: '2026-01-01' }),
  makeProduct({ id: 'b', name: 'Pintade', slug: 'pintade', category: 'akanga', badges: ['populaire'], createdAt: '2026-02-01' }),
  makeProduct({ id: 'c', name: 'Œufs d’été', slug: 'oeufs-ete', category: 'oeufs_frais', badges: ['nouveau'], createdAt: '2026-03-01' }),
  makeProduct({ id: 'd', name: 'Épuisé', slug: 'epuise', inStock: false, badges: ['populaire'] }),
];

const categories: Category[] = [
  { id: 'c1', name: 'Porc', slug: 'porc', order: 1, isActive: true },
  { id: 'c2', name: 'Œufs frais', slug: 'oeufs-frais', order: 2, isActive: true },
];

describe('ProductsMegaMenu', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve({ products }) }));
  });

  it('met les produits « populaire » en stock en premier dans « À la une »', async () => {
    render(<ProductsMegaMenu isOpen categories={categories} />);
    const names = (await screen.findAllByRole('heading', { level: 5 })).map(h => h.textContent);
    expect(names[0]).toBe('Pintade');
    expect(names).not.toContain('Épuisé');
  });

  it('l’onglet « Tous les produits » mène vers /produits', () => {
    render(<ProductsMegaMenu isOpen categories={categories} />);
    expect(screen.getByRole('link', { name: 'Tous les produits' })).toHaveAttribute('href', '/produits');
  });

  it('« Nouveautés » met en avant les produits « nouveau » avec le badge', async () => {
    render(<ProductsMegaMenu isOpen categories={categories} />);
    await screen.findByText('Pintade');
    fireEvent.click(screen.getByRole('tab', { name: 'Nouveautés' }));
    const names = screen.getAllByRole('heading', { level: 5 }).map(h => h.textContent);
    expect(names[0]).toBe('Œufs d’été');
    expect(screen.getAllByText('Nouveau').length).toBeGreaterThan(0);
  });

  it('« Catégories » affiche seulement la liste des catégories actives', async () => {
    render(<ProductsMegaMenu isOpen categories={[...categories, { id: 'c3', name: 'Archivée', slug: 'archivee', order: 3, isActive: false }]} />);
    await screen.findByText('Pintade');
    fireEvent.click(screen.getByRole('tab', { name: 'Catégories' }));
    expect(screen.getByRole('link', { name: 'Œufs frais' })).toHaveAttribute('href', '/produits?categorie=oeufs-frais');
    expect(screen.getByRole('link', { name: 'Porc' })).toHaveAttribute('href', '/produits?categorie=porc');
    expect(screen.queryByText('Archivée')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Côte de porc' })).not.toBeInTheDocument();
  });
});
