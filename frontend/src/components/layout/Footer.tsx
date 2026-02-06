'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Send,
  Leaf,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';

const footerLinks = {
  produits: [
    { name: 'Œufs frais bio', href: '/produits?categorie=oeufs-frais' },
    { name: 'Œufs fécondés', href: '/produits?categorie=oeufs-fecondes' },
    { name: 'Poules pondeuses', href: '/produits?categorie=poules' },
    { name: 'Accessoires', href: '/produits?categorie=accessoires' },
  ],
  informations: [
    { name: 'Notre histoire', href: '/#histoire' },
    { name: 'Nos poules', href: '/nos-poules' },
    { name: 'Notre élevage', href: '/notre-elevage' },
    { name: 'Blog & Conseils', href: '/blog' },
  ],
  services: [
    { name: 'Livraison', href: '/services#livraison' },
    { name: 'Gardiennage', href: '/services#gardiennage' },
    { name: 'Location matériel', href: '/services#location' },
    { name: 'Conseils personnalisés', href: '/services#conseils' },
  ],
  legal: [
    { name: 'Mentions légales', href: '/mentions-legales' },
    { name: 'Politique de confidentialité', href: '/politique-confidentialite' },
    { name: 'CGV', href: '/cgv' },
    { name: 'Politique de livraison', href: '/cgv#livraison' },
  ],
};

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    setIsSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-warm-800 text-warm-200">
      {/* Newsletter section */}
      <div className="bg-prairie-700">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-display font-bold text-white mb-2">
              Restez informé de nos actualités
            </h3>
            <p className="text-prairie-100 mb-6">
              Recevez nos conseils d&apos;élevage, les disponibilités de nos produits
              et nos offres exclusives.
            </p>
            {isSubscribed ? (
              <p className="text-white font-medium">
                Merci pour votre inscription ! Vous recevrez bientôt nos actualités.
              </p>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Votre adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white"
                />
                <Button type="submit" variant="secondary" icon={<Send className="h-4 w-4" />}>
                  S&apos;inscrire
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Brand */}
          <div className="lg:col-span-3">
            <Link href="/" className="inline-block mb-4">
              <img
                src="/images/logo.jpeg"
                alt="La Ferme du Vardier"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-warm-400 text-sm mb-6">
              Ferme avicole biologique spécialisée dans la vente d&apos;œufs frais,
              de poules pondeuses et de produits pour basse-cour. Depuis 2024,
              nous élevons nos poules avec passion et respect.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-prairie-500 shrink-0 mt-0.5" />
                <span>1 Chemin du Vardier<br />Ambatolampy Tsimahafotsy, Madagascar</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-prairie-500 shrink-0" />
                <a href="tel:+261380100101" className="hover:text-white transition-colors">
                  038 01 001 01
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-prairie-500 shrink-0" />
                <a href="mailto:contact@fermeduvardier.mg" className="hover:text-white transition-colors">
                  contact@fermeduvardier.mg
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-prairie-500 shrink-0 mt-0.5" />
                <span>
                  Lundi - Vendredi : 9h - 18h<br />
                  Samedi : 9h - 12h<br />
                  Dimanche : Fermé
                </span>
              </div>
            </div>
          </div>

          {/* Links - Centered */}
          <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h4 className="text-white font-semibold mb-4">Nos Produits</h4>
              <ul className="space-y-2">
                {footerLinks.produits.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-warm-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Informations</h4>
              <ul className="space-y-2">
                {footerLinks.informations.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-warm-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-warm-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-warm-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-warm-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-warm-400">
              &copy; {new Date().getFullYear()} Ferme du Vardier. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-warm-700 hover:bg-prairie-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-warm-700 hover:bg-prairie-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-prairie-700 rounded-full px-3 py-1">
                <Leaf className="h-5 w-5 text-prairie-300" />
                <span className="text-sm text-prairie-200">Agriculture Bio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
