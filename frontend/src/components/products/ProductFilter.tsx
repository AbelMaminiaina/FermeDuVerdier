'use client';

import React from 'react';
import { cn, getCategoryLabel } from '@/lib/utils';

type ProductCategory = 'all' | 'porc' | 'poulet' | 'poisson' | 'transformes';

interface ProductFilterProps {
  selectedCategory: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
  productCounts: Record<string, number>;
}

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'porc', label: 'Viande de porc' },
  { value: 'poulet', label: 'Viande de poulet' },
  { value: 'poisson', label: 'Poissons' },
  { value: 'transformes', label: 'Produits transformés' },
];

export function ProductFilter({
  selectedCategory,
  onCategoryChange,
  productCounts,
}: ProductFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const count = category.value === 'all'
          ? Object.values(productCounts).reduce((a, b) => a + b, 0)
          : productCounts[category.value] || 0;

        return (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={cn(
              'px-4 py-2 rounded-full font-medium transition-all duration-200',
              'flex items-center gap-2',
              selectedCategory === category.value
                ? 'bg-prairie-600 text-white shadow-md'
                : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
            )}
          >
            {category.label}
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                selectedCategory === category.value
                  ? 'bg-white/20 text-white'
                  : 'bg-warm-200 text-warm-600'
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ProductFilter;
