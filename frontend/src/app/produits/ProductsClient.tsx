'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilter from '@/components/products/ProductFilter';
import { fadeInUp } from '@/lib/animations';

type ProductCategory = 'all' | 'porc' | 'poulet' | 'poisson' | 'transformes';

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
    if (categoryParam && ['porc', 'poulet', 'poisson', 'transformes'].includes(categoryParam)) {
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
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/porc/test4.jpeg"
            alt="Nos produits de qualité"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-warm-900/70 to-warm-900/40" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-2xl text-white"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <span className="text-prairie-300 font-medium mb-2 block">
              Notre boutique
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Nos Produits
            </h1>
            <p className="text-lg text-warm-200">
              Découvrez notre gamme de produits de qualité : viande de porc et poulet fermier,
              poissons d&apos;élevage et produits transformés artisanaux.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Header removed - now in hero */}

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
