'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Leaf, MapPin, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { fadeInUp, staggerContainer, viewportOnce } from '@/lib/animations';

const values = [
  {
    icon: Heart,
    title: 'Bien-être animal',
    description:
      'Nos poules vivent en totale liberté sur 5 hectares de prairies. Chacune dispose de 10m² minimum pour s\'épanouir naturellement.',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  {
    icon: Leaf,
    title: 'Agriculture biologique',
    description:
      'Certification Bio depuis 2012. Alimentation 100% bio, sans OGM ni antibiotiques. Respect des cycles naturels.',
    color: 'text-prairie-600',
    bgColor: 'bg-prairie-50',
  },
  {
    icon: MapPin,
    title: 'Circuit court',
    description:
      'De la ferme à votre table en moins de 48h. Livraison à Antananarivo et environs ou vente directe à la ferme.',
    color: 'text-terre-600',
    bgColor: 'bg-terre-50',
  },
  {
    icon: Award,
    title: 'Qualité garantie',
    description:
      'Des œufs ramassés quotidiennement, triés et contrôlés avec soin. Fraîcheur et traçabilité assurées.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export function Values() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
        >
          <span className="text-prairie-600 font-medium mb-2 block">
            Nos engagements
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-warm-800 mb-4">
            Des valeurs qui nous guident au quotidien
          </h2>
          <p className="text-warm-600">
            Depuis plus de 15 ans, nous mettons tout en œuvre pour vous offrir
            des produits d&apos;exception, dans le respect de la nature et des animaux.
          </p>
        </motion.div>

        {/* Values grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
        >
          {values.map((value) => (
            <motion.div key={value.title} variants={fadeInUp}>
              <Card hover className="h-full text-center">
                <CardContent>
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${value.bgColor} mb-4`}
                  >
                    <value.icon className={`h-8 w-8 ${value.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-warm-800 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-warm-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Values;
