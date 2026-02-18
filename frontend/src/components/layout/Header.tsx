'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ShoppingCart,
  Phone,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import CartDrawer from '../cart/CartDrawer';

const navigation = [
  { name: 'Accueil', href: '/' },
  {
    name: 'Produits',
    href: '/produits',
    submenu: [
      { name: 'Tous les produits', href: '/produits' },
      { name: 'Viande de porc', href: '/produits?categorie=porc' },
      { name: 'Poissons frais', href: '/produits?categorie=poisson' },
      { name: 'Produits transformés', href: '/produits?categorie=transformes' },
    ],
  },
  { name: 'Notre Élevage', href: '/notre-elevage' },
  { name: 'Services', href: '/services' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const cart = useCart();

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenSubmenu(null);
  }, [pathname]);

  const itemCount = isMounted ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-md py-2'
            : 'bg-transparent py-4'
        )}
      >
        {/* Top bar */}
        <div
          className={cn(
            'container mx-auto px-4 mb-2 transition-all duration-300',
            isScrolled ? 'hidden' : 'block'
          )}
        >
          <div className="flex justify-end items-center text-sm text-prairie-700">
            <a
              href="tel:+261380100101"
              className="flex items-center gap-1 hover:text-prairie-600 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>038 01 001 01</span>
            </a>
          </div>
        </div>

        {/* Main navigation */}
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <img
                src="/images/logo.jpeg"
                alt="La Ferme du Vardier"
                className="h-14 w-auto object-contain group-hover:scale-105 transition-transform bg-white rounded-lg p-1"
              />
            </Link>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.submenu && setOpenSubmenu(item.name)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors',
                      pathname === item.href
                        ? 'text-prairie-700 bg-prairie-50'
                        : 'text-warm-700 hover:text-prairie-700 hover:bg-prairie-50'
                    )}
                  >
                    {item.name}
                    {item.submenu && (
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          openSubmenu === item.name && 'rotate-180'
                        )}
                      />
                    )}
                  </Link>
                  {item.submenu && (
                    <AnimatePresence>
                      {openSubmenu === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-warm-100 py-2 min-w-[200px]"
                        >
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.name}
                              href={subitem.href}
                              className="block px-4 py-2 text-sm text-warm-700 hover:text-prairie-700 hover:bg-prairie-50 transition-colors"
                            >
                              {subitem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Cart button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-prairie-50 transition-colors"
                aria-label="Panier"
              >
                <ShoppingCart className="h-6 w-6 text-warm-700" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-terre-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-prairie-50 transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-warm-700" />
                ) : (
                  <Menu className="h-6 w-6 text-warm-700" />
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-warm-100 overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-4 space-y-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
                        pathname === item.href
                          ? 'text-prairie-700 bg-prairie-50'
                          : 'text-warm-700 hover:text-prairie-700 hover:bg-prairie-50'
                      )}
                    >
                      {item.name}
                    </Link>
                    {item.submenu && (
                      <div className="pl-4 mt-1 space-y-1">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.name}
                            href={subitem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-warm-600 hover:text-prairie-700 hover:bg-prairie-50 rounded-lg transition-colors"
                          >
                            {subitem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer */}
      <div className="h-28" />

      {/* Cart drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default Header;
