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
              Découvrez notre sélection de produits les plus appréciés : viande de porc,
              poissons frais, volailles et œufs de qualité.
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
          className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-4"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
        >
          {[
            { name: 'Porc', href: '/produits?categorie=porc', emoji: '🐷' },
            { name: 'Poisson', href: '/produits?categorie=poisson', emoji: '🐟' },
            { name: 'Poulet', href: '/produits?categorie=poulet', emoji: '🐔' },
            { name: 'Œufs frais', href: '/produits?categorie=oeufs-frais', emoji: '🥚' },
            { name: 'Œufs fécondés', href: '/produits?categorie=oeufs-fecondes', emoji: '🐣' },
          ].map((category, index) => (
            <motion.div
              key={category.name}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                href={category.href}
                className="flex items-center justify-center gap-3 p-6 bg-warm-50 rounded-xl hover:bg-prairie-50 hover:shadow-lg transition-all duration-300 group"
              >
                <motion.span
                  className="text-3xl"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  {category.emoji}
                </motion.span>
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
