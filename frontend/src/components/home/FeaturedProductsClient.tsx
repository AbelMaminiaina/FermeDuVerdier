'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui';
import { fadeInUp, staggerContainer, viewportOnce } from '@/lib/animations';

interface FeaturedProductsClientProps {
  products: Product[];
}

export function FeaturedProductsClient({ products }: FeaturedProductsClientProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
        >
          <div>
            <span className="text-prairie-600 font-medium mb-2 block">
              Nos produits
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-warm-800 mb-2">
              Les favoris de nos clients
            </h2>
            <p className="text-warm-600 max-w-xl">
              Découvrez notre sélection de produits les plus appréciés : œufs bio,
              poules pondeuses et accessoires pour votre basse-cour.
            </p>
          </div>
          <Link href="/produits" className="mt-4 md:mt-0">
            <Button
              variant="outline"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
            >
              Voir tous les produits
            </Button>
          </Link>
        </motion.div>

        {/* Products grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={fadeInUp}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Categories shortcut */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
        >
          {[
            { name: 'Œufs frais', href: '/produits?categorie=oeufs-frais', emoji: '🥚' },
            { name: 'Œufs fécondés', href: '/produits?categorie=oeufs-fecondes', emoji: '🐣' },
            { name: 'Poules vivantes', href: '/produits?categorie=poules', emoji: '🐔' },
            { name: 'Accessoires', href: '/produits?categorie=accessoires', emoji: '🏠' },
          ].map((category) => (
            <motion.div key={category.name} variants={fadeInUp}>
              <Link
                href={category.href}
                className="flex items-center justify-center gap-3 p-6 bg-warm-50 rounded-xl hover:bg-prairie-50 transition-colors group"
              >
                <span className="text-3xl">{category.emoji}</span>
                <span className="font-medium text-warm-700 group-hover:text-prairie-700">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturedProductsClient;
