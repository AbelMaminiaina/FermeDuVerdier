'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Leaf, Sun, Heart, Award, MapPin, Phone, Clock } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, viewportOnce } from '@/lib/animations';

const certifications = [
  {
    name: 'Agriculture Biologique',
    icon: Leaf,
    description: 'Certification Bio depuis 2012',
  },
  {
    name: 'Qualité Premium',
    icon: Award,
    description: 'Produits de qualité supérieure',
  },
];

const methods = [
  {
    icon: Sun,
    title: 'Élevage en plein air',
    description:
      'Nos poules disposent de 10m² minimum chacune pour picorer, gratter et profiter du soleil.',
  },
  {
    icon: Leaf,
    title: 'Alimentation 100% bio',
    description:
      'Céréales bio (blé, maïs, orge), sans OGM ni antibiotiques. Complétées par les insectes et herbes du parcours.',
  },
  {
    icon: Heart,
    title: 'Bien-être animal',
    description:
      'Pas de bec coupé, pas de stress. Nos poules vivent naturellement, au rythme des saisons.',
  },
  {
    icon: Award,
    title: 'Qualité contrôlée',
    description:
      'Ramassage quotidien, tri manuel et contrôle qualité pour ne vous offrir que le meilleur.',
  },
];

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600', alt: 'Poules en liberté dans la prairie' },
  { src: 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=600', alt: 'Le poulailler principal' },
  { src: 'https://images.unsplash.com/photo-1569428034239-f9565e32e224?w=600', alt: 'Ramassage des œufs' },
  { src: 'https://images.unsplash.com/photo-1598965402089-897ce52e8355?w=600', alt: 'Poussins dans l\'éleveuse' },
  { src: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600', alt: 'Vue aérienne de la ferme' },
  { src: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600', alt: 'L\'équipe de la ferme' },
];

export default function NotreElevagePage() {
  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1920"
            alt="Vue de notre élevage"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-warm-900/80 to-warm-900/40" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-2xl text-white"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <span className="text-prairie-300 font-medium mb-2 block">
              Bienvenue chez nous
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Notre Élevage
            </h1>
            <p className="text-lg text-warm-200 leading-relaxed">
              Découvrez notre ferme avicole biologique, nos méthodes d&apos;élevage
              respectueuses et notre passion pour le bien-être animal.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Method section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={viewportOnce}
          >
            <span className="text-prairie-600 font-medium mb-2 block">
              Notre philosophie
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-warm-800 mb-4">
              Un élevage bio et respectueux
            </h2>
            <p className="text-warm-600">
              Depuis 2024, nous avons fait le choix d&apos;une agriculture biologique
              et d&apos;un élevage en plein air. Un choix de conviction pour des
              produits de qualité.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={viewportOnce}
          >
            {methods.map((method) => (
              <motion.div key={method.title} variants={fadeInUp}>
                <Card hover className="h-full text-center">
                  <CardContent>
                    <div className="w-14 h-14 rounded-full bg-prairie-100 flex items-center justify-center mx-auto mb-4">
                      <method.icon className="h-7 w-7 text-prairie-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-warm-800 mb-2">
                      {method.title}
                    </h3>
                    <p className="text-warm-600 text-sm">{method.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-prairie-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-col md:flex-row items-center justify-center gap-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={viewportOnce}
          >
            <motion.div variants={fadeInUp} className="text-center md:text-left">
              <h3 className="text-2xl font-display font-bold text-warm-800 mb-2">
                Nos certifications
              </h3>
              <p className="text-warm-600">
                Des labels qui garantissent notre engagement qualité
              </p>
            </motion.div>
            {certifications.map((cert) => (
              <motion.div
                key={cert.name}
                variants={fadeInUp}
                className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="w-16 h-16 rounded-full bg-prairie-100 flex items-center justify-center">
                  <cert.icon className="h-8 w-8 text-prairie-600" />
                </div>
                <div>
                  <div className="font-semibold text-warm-800">{cert.name}</div>
                  <div className="text-sm text-warm-500">{cert.description}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={viewportOnce}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-warm-800 mb-4">
              Galerie photos
            </h2>
            <p className="text-warm-600">
              Découvrez en images la vie quotidienne à la Ferme du Vardier
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={viewportOnce}
          >
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`relative overflow-hidden rounded-xl ${
                  index === 0 || index === 5 ? 'row-span-2 aspect-[3/4]' : 'aspect-square'
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Visit section */}
      <section className="py-20 bg-warm-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeInLeft}
              initial="initial"
              whileInView="animate"
              viewport={viewportOnce}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Venez nous rendre visite !
              </h2>
              <p className="text-warm-300 text-lg mb-8 leading-relaxed">
                Nous vous accueillons à la ferme pour découvrir notre élevage,
                rencontrer nos poules et repartir avec des œufs fraîchement pondus.
                Une expérience authentique pour petits et grands !
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-prairie-600 flex items-center justify-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span>1 Chemin du Vardier, Ambatolampy Tsimahafotsy, Madagascar</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-prairie-600 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span>Lun - Ven : 9h-18h | Sam : 9h-12h</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-prairie-600 flex items-center justify-center">
                    <Phone className="h-5 w-5" />
                  </div>
                  <a href="tel:+261380100101" className="hover:text-prairie-300">
                    038 01 001 01
                  </a>
                </div>
              </div>

              <Link href="/contact">
                <Button size="lg">Nous contacter</Button>
              </Link>
            </motion.div>

            {/* Map placeholder */}
            <motion.div
              variants={fadeInRight}
              initial="initial"
              whileInView="animate"
              viewport={viewportOnce}
              className="relative aspect-square md:aspect-video rounded-2xl overflow-hidden bg-warm-700"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3774.123456789!2d47.4234567!3d-19.3456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDIwJzQ0LjQiUyA0N8KwMjUnMjQuNCJF!5e0!3m2!1sfr!2smg!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
