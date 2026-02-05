'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Heart } from 'lucide-react';
import { Button } from '@/components/ui';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from '@/lib/animations';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1920&q=80"
          alt="Poules en liberté dans la prairie"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-warm-900/80 via-warm-900/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 py-20">
        <motion.div
          className="max-w-2xl"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-prairie-600/90 text-white rounded-full text-sm font-medium">
              <Leaf className="h-4 w-4" />
              Agriculture Biologique Certifiée
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight"
          >
            Des œufs frais{' '}
            <span className="text-terre-400">toujours à portée</span>{' '}
            de mains
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-warm-200 mb-8 leading-relaxed"
          >
            Découvrez le goût authentique des œufs bio de la Ferme du Vardier.
            Nos poules vivent en plein air, nourries avec amour pour vous offrir
            des produits d&apos;exception.
          </motion.p>

          {/* Values highlights */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap gap-4 mb-8"
          >
            <div className="flex items-center gap-2 text-warm-200">
              <Heart className="h-5 w-5 text-terre-400" />
              <span>Bien-être animal</span>
            </div>
            <div className="flex items-center gap-2 text-warm-200">
              <Leaf className="h-5 w-5 text-prairie-400" />
              <span>100% Bio</span>
            </div>
            <div className="flex items-center gap-2 text-warm-200">
              <svg className="h-5 w-5 text-terre-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>Circuit court</span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/produits">
              <Button
                size="lg"
                icon={<ArrowRight className="h-5 w-5" />}
                iconPosition="right"
              >
                Commander mes œufs
              </Button>
            </Link>
            <Link href="/notre-elevage">
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-warm-800">
                Découvrir la ferme
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream-50 to-transparent z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />

      {/* Stats */}
      <motion.div
        className="absolute bottom-8 right-8 hidden lg:flex gap-8 z-20"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div
          variants={fadeInRight}
          className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg"
        >
          <div className="text-3xl font-bold text-prairie-600">2+</div>
          <div className="text-sm text-warm-600">Années d&apos;expérience</div>
        </motion.div>
        <motion.div
          variants={fadeInRight}
          className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg"
        >
          <div className="text-3xl font-bold text-prairie-600">2</div>
          <div className="text-sm text-warm-600">Races de poules</div>
        </motion.div>
        <motion.div
          variants={fadeInRight}
          className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg"
        >
          <div className="text-3xl font-bold text-prairie-600">100%</div>
          <div className="text-sm text-warm-600">Bio certifié</div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
