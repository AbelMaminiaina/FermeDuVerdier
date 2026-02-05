'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { staggerContainer, fadeInUp } from '@/lib/animations';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export function ProductGrid({ products, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-warm-500 text-lg">
          Aucun produit ne correspond à votre recherche.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={fadeInUp}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-warm-100 animate-pulse">
      <div className="aspect-square bg-warm-200" />
      <div className="p-4">
        <div className="h-4 bg-warm-200 rounded w-1/3 mb-2" />
        <div className="h-5 bg-warm-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-warm-200 rounded w-full mb-4" />
        <div className="flex justify-between items-center">
          <div className="h-6 bg-warm-200 rounded w-1/4" />
          <div className="h-9 bg-warm-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

export default ProductGrid;
