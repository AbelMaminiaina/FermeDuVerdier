'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeInUp, fadeInLeft, fadeInRight, viewportOnce } from '@/lib/animations';

export function Story() {
  return (
    <section id="histoire" className="py-20 bg-cream-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            className="relative"
            variants={fadeInLeft}
            initial="initial"
            whileInView="animate"
            viewport={viewportOnce}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/porc/WhatsApp Image 2026-02-17 at 00.43.16.jpeg"
                alt="Nos installations d'élevage porcin"
                fill
                className="object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-prairie-100 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-terre-100 rounded-2xl -z-10" />

            {/* Experience badge */}
            <div className="absolute -bottom-4 left-8 bg-white rounded-xl shadow-lg p-4">
              <div className="text-3xl font-bold text-prairie-600">2024</div>
              <div className="text-sm text-warm-600">Création de la ferme</div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            variants={fadeInRight}
            initial="initial"
            whileInView="animate"
            viewport={viewportOnce}
          >
            <span className="text-prairie-600 font-medium mb-2 block">
              Notre histoire
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-warm-800 mb-6">
              Une passion transmise de génération en génération
            </h2>

            <div className="space-y-4 text-warm-600 leading-relaxed">
              <p>
                Tout a commencé en 2024, lorsque Varombo a décidé de
                créer cette ferme avec une vision nouvelle : proposer
                du porc et du poisson de qualité exceptionnelle tout en respectant
                les animaux et l&apos;environnement.
              </p>
              <p>
                Installée à Ambatolampy Tsimahafotsy à Madagascar, la Ferme du Vardier s&apos;étend sur
                5 hectares où notre élevage porcin et notre pisciculture prospèrent
                dans des conditions optimales. Nos porcs bénéficient d&apos;enclos spacieux
                et nos bassins de poissons sont entretenus avec le plus grand soin.
              </p>
              <p>
                Notre engagement pour un élevage responsable n&apos;est pas qu&apos;un
                label, c&apos;est une philosophie de vie. Nous nourrissons nos animaux
                avec des aliments de qualité, sans antibiotiques de croissance,
                pour vous offrir des produits au goût incomparable.
              </p>
              <p className="font-medium text-warm-800">
                Aujourd&apos;hui, c&apos;est toute une équipe passionnée qui perpétue
                cette tradition d&apos;excellence, avec le même amour des animaux et
                le même souci de qualité.
              </p>
            </div>

            {/* Signature */}
            <div className="mt-8 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden relative">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                  alt="Pierre"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-display text-xl text-warm-800">Varombo Fitoky</div>
                <div className="text-warm-500">Fondateur de la Ferme du Vardier</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Story;
