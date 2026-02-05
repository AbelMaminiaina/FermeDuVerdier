'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilter from '@/components/products/ProductFilter';
import { fadeInUp } from '@/lib/animations';

type ProductCategory = 'all' | 'oeufs-frais' | 'oeufs-fecondes' | 'poules' | 'accessoires';

interface ProductsClientProps {
  initialProducts: Product[];
}

function ProductsContent({ initialProducts }: ProductsClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('categorie');

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(
    (categoryParam as ProductCategory) || 'all'
  );

  useEffect(() => {
    if (categoryParam && ['oeufs-frais', 'oeufs-fecondes', 'poules', 'accessoires'].includes(categoryParam)) {
      setSelectedCategory(categoryParam as ProductCategory);
    }
  }, [categoryParam]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return initialProducts;
    return initialProducts.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, initialProducts]);

  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [initialProducts]);

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <span className="text-prairie-600 font-medium mb-2 block">
            Notre boutique
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-warm-800 mb-4">
            Nos Produits
          </h1>
          <p className="text-warm-600">
            Découvrez notre gamme complète de produits bio : œufs frais,
            œufs fécondés, poules pondeuses et accessoires pour votre basse-cour.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="flex justify-center mb-8"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <ProductFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            productCounts={productCounts}
          />
        </motion.div>

        {/* Results count */}
        <motion.p
          className="text-warm-500 text-center mb-8"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
        </motion.p>

        {/* Products grid */}
        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
}

export default function ProductsClient({ initialProducts }: ProductsClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50 py-12 flex items-center justify-center">Chargement...</div>}>
      <ProductsContent initialProducts={initialProducts} />
    </Suspense>
  );
}
