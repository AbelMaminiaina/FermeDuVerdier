'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import {
  Menu,
  X,
  ShoppingCart,
  Phone,
  ChevronDown,
  User,
  LogOut,
  Beef,
  Fish,
  Bird,
  Egg,
  Sparkles,
  Truck,
  Gift,
  Package,
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
      { name: 'Tous les produits', href: '/produits', icon: Sparkles, color: 'text-purple-500' },
      { name: 'Viande de porc', href: '/produits?categorie=porc', icon: Beef, color: 'text-rose-500' },
      { name: 'Poissons frais', href: '/produits?categorie=poisson', icon: Fish, color: 'text-blue-500' },
      { name: 'Poulet', href: '/produits?categorie=poulet', icon: Bird, color: 'text-orange-500' },
      { name: 'Akanga', href: '/produits?categorie=akanga', icon: Bird, color: 'text-amber-600' },
      { name: 'Caille', href: '/produits?categorie=caille', icon: Bird, color: 'text-yellow-600' },
    ],
  },
  { name: 'Notre Élevage', href: '/notre-elevage' },
  { name: 'Services', href: '/services' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

const menuItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const submenuVariants = {
  hidden: {
    opacity: 0,
    y: 15,
    scale: 0.95,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.95,
    filter: 'blur(5px)',
    transition: {
      duration: 0.2,
    },
  },
};

const submenuItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 },
  },
};

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const cart = useCart();
  const { data: session, status } = useSession();

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
          'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
          isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-warm-900/5 pt-1 pb-2'
            : 'bg-gradient-to-b from-white/90 to-transparent pt-2 pb-4'
        )}
      >
        {/* Top bar - hidden on small mobile */}
        <div className="hidden sm:block container mx-auto px-4 mb-2">
          <div className="flex justify-between items-center text-sm">
            {/* Livraison gratuite */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-terre-50 to-terre-100/50 text-terre-700 text-xs">
              <div className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-terre-600" />
                <Gift className="h-3 w-3 text-terre-500" />
              </div>
              <span className="font-medium">
                <span className="hidden md:inline">Livraison offerte à 10 km</span>
                <span className="md:hidden">Livraison offerte</span>
                {' '}dès <span className="font-bold text-terre-800">50 000 Ar</span>
              </span>
            </div>

            {/* Téléphone */}
            <a
              href="tel:+261343018173"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-prairie-50/80 text-prairie-700 hover:bg-prairie-100 transition-all duration-300 text-xs"
            >
              <Phone className="h-3 w-3" />
              <span className="font-medium">034 30 181 73</span>
            </a>
          </div>
        </div>

        {/* Main navigation */}
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-14 sm:h-auto">
            {/* Logo */}
            <Link href="/" className="flex items-center group relative">
              <motion.img
                src="/images/logo.png"
                alt="La Ferme du Vardier"
                className="h-20 md:h-28 lg:h-32 w-auto object-contain absolute sm:relative top-0 left-0"
                whileHover={{ scale: 1.05, rotate: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </Link>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.submenu && setOpenSubmenu(item.name)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'relative px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all duration-300',
                      pathname === item.href
                        ? 'text-prairie-700'
                        : 'text-warm-600 hover:text-prairie-700'
                    )}
                  >
                    {/* Active indicator */}
                    {pathname === item.href && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-r from-prairie-50 to-prairie-100/50 rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span>{item.name}</span>
                    {item.submenu && (
                      <motion.div
                        animate={{ rotate: openSubmenu === item.name ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    )}
                  </Link>

                  {/* Mega Menu */}
                  {item.submenu && (
                    <AnimatePresence>
                      {openSubmenu === item.name && (
                        <motion.div
                          variants={submenuVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 p-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-warm-900/10 border border-warm-100/50 min-w-[280px]"
                        >
                          {/* Arrow */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-warm-100/50" />

                          <div className="relative grid gap-1">
                            {item.submenu.map((subitem, subIndex) => {
                              const IconComponent = subitem.icon;
                              return (
                                <motion.div
                                  key={subitem.name}
                                  variants={submenuItemVariants}
                                  custom={subIndex}
                                >
                                  <Link
                                    href={subitem.href}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-warm-700 hover:bg-gradient-to-r hover:from-prairie-50 hover:to-transparent transition-all duration-300 group"
                                  >
                                    <motion.div
                                      className={cn(
                                        "p-2 rounded-lg bg-warm-50 group-hover:scale-110 transition-transform duration-300",
                                        subitem.color
                                      )}
                                      whileHover={{ rotate: [0, -10, 10, 0] }}
                                      transition={{ duration: 0.4 }}
                                    >
                                      <IconComponent className="h-4 w-4" />
                                    </motion.div>
                                    <span className="font-medium group-hover:text-prairie-700 transition-colors">
                                      {subitem.name}
                                    </span>
                                  </Link>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* User button */}
              {status === 'loading' ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-warm-100 to-warm-200 animate-pulse" />
              ) : session ? (
                <div
                  className="relative"
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <motion.button
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-prairie-50 transition-colors"
                    aria-label="Mon compte"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-9 h-9 rounded-full ring-2 ring-prairie-200 ring-offset-2"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-prairie-400 to-prairie-600 flex items-center justify-center shadow-lg">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </motion.button>
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        variants={submenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-warm-900/10 border border-warm-100/50 py-2 min-w-[220px] z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-warm-100 bg-gradient-to-r from-prairie-50/50 to-transparent">
                          <p className="font-semibold text-warm-800 truncate">
                            {session.user?.name}
                          </p>
                          <p className="text-sm text-warm-500 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                        <Link
                          href="/suivi-commande"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-warm-700 hover:text-prairie-700 hover:bg-prairie-50 transition-colors"
                        >
                          <Package className="h-4 w-4" />
                          Mes commandes
                        </Link>
                        {(session.user as any)?.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-warm-700 hover:text-prairie-700 hover:bg-prairie-50 transition-colors"
                          >
                            <Sparkles className="h-4 w-4" />
                            Dashboard Admin
                          </Link>
                        )}
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Se déconnecter
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/connexion">
                  <motion.div
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-prairie-500 to-prairie-600 rounded-xl shadow-lg shadow-prairie-500/25 hover:shadow-xl hover:shadow-prairie-500/30 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <User className="h-4 w-4" />
                    Connexion
                  </motion.div>
                </Link>
              )}

              {/* Cart button */}
              <motion.button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-warm-50 hover:bg-prairie-50 transition-colors"
                aria-label="Panier"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="h-5 w-5 text-warm-700" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-terre-500 to-terre-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-warm-50 hover:bg-prairie-50 transition-colors"
                aria-label="Menu"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5 text-warm-700" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5 text-warm-700" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
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
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-warm-100/50 overflow-hidden max-h-[70vh] overflow-y-auto"
            >
              <nav className="container mx-auto px-4 py-4 pb-safe space-y-2" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-300',
                        pathname === item.href
                          ? 'text-prairie-700 bg-gradient-to-r from-prairie-50 to-prairie-100/50'
                          : 'text-warm-700 hover:text-prairie-700 hover:bg-prairie-50'
                      )}
                    >
                      {item.name}
                    </Link>
                    {item.submenu && (
                      <motion.div
                        className="ml-4 mt-2 space-y-1 border-l-2 border-prairie-100 pl-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {item.submenu.map((subitem) => {
                          const IconComponent = subitem.icon;
                          return (
                            <Link
                              key={subitem.name}
                              href={subitem.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-600 hover:text-prairie-700 hover:bg-prairie-50 rounded-lg transition-all duration-300"
                            >
                              <IconComponent className={cn("h-4 w-4", subitem.color)} />
                              {subitem.name}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </motion.div>
                ))}

                {/* Suivi commande - toujours visible */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Link
                    href="/suivi-commande"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-warm-700 hover:text-prairie-700 hover:bg-prairie-50 transition-all duration-300"
                  >
                    <Package className="h-5 w-5 text-prairie-600" />
                    Suivi de commande
                  </Link>
                </motion.div>

                {/* Mobile login button */}
                {!session && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4 border-t border-warm-100"
                  >
                    <Link
                      href="/connexion"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 text-white bg-gradient-to-r from-prairie-500 to-prairie-600 rounded-xl font-medium shadow-lg"
                    >
                      <User className="h-4 w-4" />
                      Se connecter
                    </Link>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer */}
      <div className="h-24 sm:h-36 lg:h-40" />

      {/* Cart drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default Header;
