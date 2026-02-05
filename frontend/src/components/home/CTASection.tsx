'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui';
import { fadeInUp, fadeInLeft, fadeInRight, viewportOnce } from '@/lib/animations';

export function CTASection() {
  return (
    <section className="py-20 bg-warm-800 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            variants={fadeInLeft}
            initial="initial"
            whileInView="animate"
            viewport={viewportOnce}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Venez nous rendre visite à la ferme !
            </h2>
            <p className="text-warm-300 text-lg mb-8 leading-relaxed">
              Découvrez notre élevage en plein air, rencontrez nos poules et
              repartez avec des œufs fraîchement pondus. Les enfants adorent !
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-warm-200">
                <div className="w-10 h-10 rounded-full bg-prairie-600 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span>1 Chemin du Vardier, Ambatolampy Tsimahafotsy, Madagascar</span>
              </div>
              <div className="flex items-center gap-3 text-warm-200">
                <div className="w-10 h-10 rounded-full bg-prairie-600 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span>Ouvert du lundi au samedi, 9h - 18h</span>
              </div>
              <div className="flex items-center gap-3 text-warm-200">
                <div className="w-10 h-10 rounded-full bg-prairie-600 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <a href="tel:+261380100101" className="hover:text-white transition-colors">
                  038 01 001 01
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button
                  size="lg"
                  icon={<ArrowRight className="h-5 w-5" />}
                  iconPosition="right"
                >
                  Nous contacter
                </Button>
              </Link>
              <Link href="/notre-elevage">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-warm-800"
                >
                  En savoir plus
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right image */}
          <motion.div
            className="relative"
            variants={fadeInRight}
            initial="initial"
            whileInView="animate"
            viewport={viewportOnce}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600"
                alt="Visite de la ferme"
                fill
                className="object-cover"
              />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 max-w-[250px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-prairie-200 ring-2 ring-white" />
                  <div className="w-8 h-8 rounded-full bg-terre-200 ring-2 ring-white" />
                  <div className="w-8 h-8 rounded-full bg-warm-200 ring-2 ring-white" />
                </div>
                <span className="text-sm font-medium text-warm-800">+500 visiteurs/an</span>
              </div>
              <p className="text-sm text-warm-600">
                Familles et passionnés nous rendent visite chaque année.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
