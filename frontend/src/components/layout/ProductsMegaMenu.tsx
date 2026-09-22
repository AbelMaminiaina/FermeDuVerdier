'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { Category } from '@/hooks/useCategories';
import { API_BASE_URL } from '@/lib/api/config';
import { cn, formatPrice } from '@/lib/utils';

const CARDS_PER_TAB = 4;

// Les images produit sont en base64 (payload lourd) : on ne charge le catalogue
// qu'à la première ouverture du méga-menu, puis on le garde pour toute la session.
let cachedProducts: Product[] | null = null;
let productsPromise: Promise<Product[]> | null = null;

function fetchMenuProducts(): Promise<Product[]> {
  if (cachedProducts) return Promise.resolve(cachedProducts);
  if (!productsPromise) {
    productsPromise = fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => {
        cachedProducts = (data.products || []) as Product[];
        return cachedProducts;
      })
      .catch(() => {
        productsPromise = null;
        return [] as Product[];
      });
  }
  return productsPromise;
}

function useMenuProducts(enabled: boolean) {
  const [products, setProducts] = useState<Product[] | null>(cachedProducts);

  useEffect(() => {
    if (!enabled || products) return;
    let cancelled = false;
    fetchMenuProducts().then(p => {
      if (!cancelled) setProducts(p);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, products]);

  return products;
}

// Complète une sélection prioritaire avec le reste du catalogue, sans doublon
function pickCards(priority: Product[], all: Product[]): Product[] {
  const picked = [...priority];
  for (const p of all) {
    if (picked.length >= CARDS_PER_TAB) break;
    if (!picked.some(x => x.id === p.id)) picked.push(p);
  }
  return picked.slice(0, CARDS_PER_TAB);
}

type TabKey = 'featured' | 'new' | 'categories';

interface ProductsMegaMenuProps {
  isOpen: boolean;
  categories: Category[];
}

export function ProductsMegaMenu({ isOpen, categories }: ProductsMegaMenuProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('featured');
  const products = useMenuProducts(isOpen);

  const { featured, newArrivals } = useMemo(() => {
    const all = products ?? [];
    const available = all.filter(p => p.inStock);
    const byNewest = [...available].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return {
      featured: pickCards(available.filter(p => p.badges?.includes('populaire')), available),
      newArrivals: pickCards(byNewest.filter(p => p.badges?.includes('nouveau')), byNewest),
    };
  }, [products]);

  const activeCategories = categories.filter(c => c.isActive);

  const tabClass = (active: boolean) =>
    cn(
      'px-5 py-2.5 -mb-px font-nav text-[15px] font-medium border-b-2 transition-colors',
      active
        ? 'text-prairie-700 border-prairie-600'
        : 'text-warm-600 border-transparent hover:text-prairie-700'
    );

  return (
    <div
      className={cn(
        'absolute left-4 right-4 p-5 flex flex-col max-h-[80vh] bg-white rounded-md shadow-[0_5px_20px_rgba(0,0,0,0.1)] z-50 transition-all duration-300',
        isOpen ? 'top-full opacity-100 visible' : 'top-[130%] opacity-0 invisible'
      )}
    >
      {/* Tabs */}
      <div className="mb-4 flex border-b border-warm-100" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'featured'}
          onClick={() => setActiveTab('featured')}
          className={tabClass(activeTab === 'featured')}
        >
          À la une
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'new'}
          onClick={() => setActiveTab('new')}
          className={tabClass(activeTab === 'new')}
        >
          Nouveautés
        </button>
        <Link href="/produits" className={tabClass(false)}>
          Tous les produits
        </Link>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'categories'}
          onClick={() => setActiveTab('categories')}
          className={tabClass(activeTab === 'categories')}
        >
          Catégories
        </button>
      </div>

      {/* Tabs content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === 'categories' ? (
          <ul className="grid grid-cols-4 gap-x-6 gap-y-3 p-4 rounded-lg bg-prairie-50/50">
            {activeCategories.map(c => (
              <li key={c.id}>
                <MenuLink href={`/produits?categorie=${c.slug}`}>{c.name}</MenuLink>
              </li>
            ))}
          </ul>
        ) : (
          <ProductGrid
            products={activeTab === 'featured' ? featured : newArrivals}
            loading={products === null}
            showNewBadge={activeTab === 'new'}
          />
        )}
      </div>
    </div>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative flex items-start gap-1 text-sm text-warm-600 transition-all hover:translate-x-[3px] hover:text-prairie-700"
    >
      <ChevronRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-prairie-600 opacity-70 group-hover:opacity-100" />
      <span className="line-clamp-2">{children}</span>
    </Link>
  );
}

function ProductGrid({
  products,
  loading,
  showNewBadge,
}: {
  products: Product[];
  loading: boolean;
  showNewBadge: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-5 pt-2.5">
        {Array.from({ length: CARDS_PER_TAB }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-40 bg-warm-100 rounded" />
            <div className="h-4 mt-4 w-3/4 bg-warm-100 rounded" />
            <div className="h-4 mt-2 w-1/3 bg-warm-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="py-8 text-center text-sm text-warm-500">Aucun produit pour le moment.</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-5 pt-2.5">
      {products.map(p => (
        <div key={p.id} className="group bg-white overflow-hidden">
          <Link href={`/produits/${p.slug}`} className="block relative h-40 overflow-hidden bg-cream-100">
            {p.images?.[0] && (
              <img
                src={p.images[0]}
                alt={p.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}
            {showNewBadge && (
              <span className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-sm text-[11px] font-semibold text-white bg-prairie-600">
                Nouveau
              </span>
            )}
            {!showNewBadge && p.originalPrice && p.originalPrice > p.price && (
              <span className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-sm text-[11px] font-semibold text-white bg-red-600">
                -{Math.round((1 - p.price / p.originalPrice) * 100)}%
              </span>
            )}
          </Link>
          <div className="p-4">
            <h5 className="mb-1 text-[15px] font-semibold text-warm-800 line-clamp-1">{p.name}</h5>
            <p className="mb-2.5 text-sm font-semibold text-prairie-700">
              {p.originalPrice && p.originalPrice > p.price && (
                <span className="mr-1.5 font-normal line-through text-warm-400">
                  {formatPrice(p.originalPrice)}
                </span>
              )}
              {formatPrice(p.price)}
            </p>
            <Link
              href={`/produits/${p.slug}`}
              className="inline-block px-3 py-1.5 rounded text-xs font-medium text-prairie-700 bg-prairie-600/15 hover:bg-prairie-600 hover:text-white transition-colors"
            >
              Voir le produit
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductsMegaMenu;
