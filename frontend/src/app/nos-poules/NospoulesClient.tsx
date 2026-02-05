'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Egg, ThermometerSun, ShoppingCart } from 'lucide-react';
import { ChickenBreed } from '@/types';
import { Button, Modal } from '@/components/ui';
import { formatPrice, getProductivityLabel, getProductivityColor } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/animations';

interface NosDoulesClientProps {
  chickenBreeds: ChickenBreed[];
}

export default function NosDoulesClient({ chickenBreeds }: NosDoulesClientProps) {
  const [selectedChicken, setSelectedChicken] = useState<ChickenBreed | null>(null);

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <span className="text-prairie-600 font-medium mb-2 block">
            Notre élevage
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-warm-800 mb-4">
            Découvrez nos races de poules
          </h1>
          <p className="text-warm-600 text-lg">
            Chaque race a ses particularités : couleur des œufs, tempérament, productivité...
            Découvrez celle qui correspond le mieux à vos attentes !
          </p>
        </motion.div>

        {/* Chickens grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {chickenBreeds.map((chicken) => (
            <motion.div
              key={chicken.id}
              variants={fadeInUp}
              className="group cursor-pointer"
              onClick={() => setSelectedChicken(chicken)}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-warm-100">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={chicken.image}
                    alt={chicken.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!chicken.available && (
                    <div className="absolute inset-0 bg-warm-900/60 flex items-center justify-center">
                      <span className="text-white font-semibold bg-warm-800 px-4 py-2 rounded-lg">
                        Bientôt disponible
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-warm-800 mb-2">
                    {chicken.name}
                  </h3>

                  {/* Egg color */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-5 h-5 rounded-full border border-warm-200"
                      style={{ backgroundColor: chicken.eggColorHex }}
                    />
                    <span className="text-sm text-warm-600">
                      Œufs {chicken.eggColor.toLowerCase()}
                    </span>
                  </div>

                  {/* Temperament */}
                  <p className="text-sm text-warm-500 mb-3">
                    {chicken.temperament}
                  </p>

                  {/* Productivity */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-warm-600">Productivité</span>
                      <span className="font-medium text-warm-700">
                        {getProductivityLabel(chicken.productivity)}
                      </span>
                    </div>
                    <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProductivityColor(chicken.productivity)} transition-all`}
                        style={{ width: `${chicken.productivityNumber}%` }}
                      />
                    </div>
                  </div>

                  {/* Price and action */}
                  {chicken.price && (
                    <div className="flex items-center justify-between pt-3 border-t border-warm-100">
                      <span className="font-bold text-prairie-600">
                        {formatPrice(chicken.price)}
                      </span>
                      <Button size="sm" variant="outline">
                        En savoir plus
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal */}
        <Modal
          isOpen={!!selectedChicken}
          onClose={() => setSelectedChicken(null)}
          title={selectedChicken?.name}
          size="lg"
        >
          {selectedChicken && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={selectedChicken.image}
                  alt={selectedChicken.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div>
                {/* Egg color */}
                <div className="flex items-center gap-2 mb-4">
                  <Egg className="h-5 w-5 text-prairie-600" />
                  <span className="font-medium">Œufs :</span>
                  <div
                    className="w-6 h-6 rounded-full border border-warm-200"
                    style={{ backgroundColor: selectedChicken.eggColorHex }}
                  />
                  <span>{selectedChicken.eggColor}</span>
                </div>

                {/* Origin */}
                <div className="flex items-center gap-2 mb-4">
                  <ThermometerSun className="h-5 w-5 text-prairie-600" />
                  <span className="font-medium">Origine :</span>
                  <span>{selectedChicken.origin}</span>
                </div>

                {/* Eggs per year */}
                <div className="bg-prairie-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-prairie-600 mb-1">Production annuelle</div>
                  <div className="text-2xl font-bold text-prairie-700">
                    {selectedChicken.eggsPerYear} œufs/an
                  </div>
                </div>

                {/* Description */}
                <p className="text-warm-600 mb-4 leading-relaxed">
                  {selectedChicken.description}
                </p>

                {/* Characteristics */}
                <div className="mb-4">
                  <h4 className="font-semibold text-warm-800 mb-2">Caractéristiques</h4>
                  <ul className="space-y-1">
                    {selectedChicken.characteristics.map((char, index) => (
                      <li key={index} className="text-sm text-warm-600 flex items-start gap-2">
                        <span className="text-prairie-500">•</span>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Why choose */}
                <div className="bg-terre-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-terre-800 mb-2">
                    Pourquoi choisir cette race ?
                  </h4>
                  <p className="text-sm text-terre-700">{selectedChicken.whyChoose}</p>
                </div>

                {/* Price and CTA */}
                {selectedChicken.price && selectedChicken.available && (
                  <div className="flex items-center justify-between pt-4 border-t border-warm-200">
                    <div>
                      <span className="text-2xl font-bold text-prairie-600">
                        {formatPrice(selectedChicken.price)}
                      </span>
                      <span className="text-warm-500 ml-1">/poule</span>
                    </div>
                    <Link href={`/produits?categorie=poules`}>
                      <Button icon={<ShoppingCart className="h-4 w-4" />}>
                        Voir les disponibilités
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
