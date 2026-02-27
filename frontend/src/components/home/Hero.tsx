'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Leaf, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { fadeInUp, fadeInRight, staggerContainer } from '@/lib/animations';

const slides = [
  {
    id: 1,
    image: '/images/porc/test3.jpeg',
    title: 'Porc de',
    titleHighlight: 'Qualité Premium',
    description:
      'Découvrez notre élevage porcin traditionnel. Des porcs élevés en plein air avec une alimentation naturelle pour une viande tendre et savoureuse.',
  },
  {
    id: 2,
    image: '/images/chickens/Akoho2.jpeg',
    title: 'Brahma',
    titleHighlight: 'Race Noble',
    description:
      'Découvrez notre élevage de Brahma, une race majestueuse reconnue pour sa beauté et sa robustesse. Des volailles d\'exception pour les amateurs de races nobles.',
    zoomIn: true,
  },
  {
    id: 3,
    image: '/images/caille/caille1.jpeg',
    title: 'Cailles',
    titleHighlight: 'Délicieuses',
    description:
      'Découvrez nos cailles élevées avec soin. Une viande fine et savoureuse, parfaite pour vos repas gastronomiques.',
    zoomIn: true,
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className={`absolute inset-0 z-0 ${(slide as any).contain ? 'bg-warm-800' : ''}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.img
            src={slide.image}
            alt={slide.title}
            className={`absolute inset-0 w-full h-full ${(slide as any).contain ? 'object-contain' : 'object-cover'}`}
            initial={{ scale: (slide as any).zoomIn ? 1.15 : 1 }}
            animate={{ scale: (slide as any).zoomIn ? 1 : 1.1 }}
            transition={{ duration: 5, ease: 'linear' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-warm-900/80 via-warm-900/60 to-transparent" />
        </motion.div>
      </AnimatePresence>

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
              Élevage Responsable
            </span>
          </motion.div>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6 leading-tight"
            >
              {slide.title}{' '}
              <span className="text-terre-400 text-2xl md:text-3xl lg:text-4xl">{slide.titleHighlight}</span>
            </motion.h1>
          </AnimatePresence>

          {/* Description */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-warm-200 mb-8 leading-relaxed"
            >
              {slide.description}
            </motion.p>
          </AnimatePresence>

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
              <span>Élevage naturel</span>
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
                Découvrir nos produits
              </Button>
            </Link>
            <Link href="/notre-elevage">
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-warm-800">
                Visiter la ferme
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
        <motion.button
          onClick={prevSlide}
          className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all pointer-events-auto"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Slide précédent"
        >
          <ChevronLeft className="h-6 w-6" />
        </motion.button>
        <motion.button
          onClick={nextSlide}
          className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all pointer-events-auto"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Slide suivant"
        >
          <ChevronRight className="h-6 w-6" />
        </motion.button>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <motion.div
          className="h-full bg-prairie-500"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 5, ease: 'linear' }}
          key={currentSlide}
        />
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
        className="absolute bottom-12 right-8 hidden lg:flex gap-6 z-20"
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
          <div className="text-3xl font-bold text-prairie-600">3</div>
          <div className="text-sm text-warm-600">Activités principales</div>
        </motion.div>
        <motion.div
          variants={fadeInRight}
          className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg"
        >
          <div className="text-3xl font-bold text-prairie-600">100%</div>
          <div className="text-sm text-warm-600">Qualité garantie</div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
