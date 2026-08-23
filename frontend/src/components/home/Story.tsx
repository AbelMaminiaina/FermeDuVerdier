'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeInLeft, fadeInRight, viewportOnce } from '@/lib/animations';

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
                sizes="(max-width: 1024px) 100vw, 50vw"
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
              Élever avec soin, produire avec qualité
            </h2>

            <div className="space-y-4 text-warm-600 leading-relaxed">
              <p>
                Tout commence en 2024 à Ambatolampy, avec une ambition simple :
                bâtir une ferme familiale fondée sur la passion de l&apos;élevage,
                la qualité des productions et le respect des animaux et de leur
                environnement. Fondée par Heriniaina et Fitiavana Raoelina, la
                Ferme du Vardier s&apos;est développée pour proposer une production
                diversifiée et participer au développement de l&apos;élevage local
                à Madagascar.
              </p>
              <p>
                Aujourd&apos;hui, notre ferme rassemble plusieurs élevages : poules
                pondeuses, Kuroiler et volailles d&apos;ornement, élevage porcin
                (Piétrain, Large White), ainsi qu&apos;une pisciculture de tilapia.
                Nous proposons également des œufs fécondés de volailles
                d&apos;ornement, issus de notre élevage et de lignées sélectionnées
                venues de France, pour faire découvrir et développer de nouvelles
                races à Madagascar.
              </p>
              <p>
                Pour nous, l&apos;élevage ne se résume pas à produire et à vendre :
                c&apos;est une responsabilité. Bien-être animal, qualité de
                l&apos;alimentation, conditions d&apos;élevage et qualité des produits
                guident chacune de nos décisions.
              </p>
              <p className="font-medium text-warm-800">
                Notre ambition : construire une ferme moderne et durable, qui
                répond aux besoins de nos clients tout en créant de la valeur
                pour notre région et en faisant grandir l&apos;élevage à
                Ambatolampy et à Madagascar.
              </p>
            </div>

            {/* Devise */}
            <blockquote className="mt-8 border-l-4 border-prairie-500 pl-5">
              <p className="font-display text-xl text-warm-800">« Ferme responsable »</p>
              <p className="text-sm text-warm-500 mt-1">
                Une philosophie qui guide notre travail chaque jour.
              </p>
            </blockquote>

            {/* Signature */}
            <div className="mt-8 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden relative">
                <Image
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='white'/%3E%3C/svg%3E"
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-display text-xl text-warm-800">Heriniaina &amp; Fitiavana Raoelina</div>
                <div className="text-warm-500">Fondateurs de la Ferme du Vardier</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Story;
