'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Menu,
  X,
  ShoppingBag,
  ChevronDown,
  User,
  UserCircle,
  LogOut,
  Search,
  Beef,
  Fish,
  Bird,
  Egg,
  Sparkles,
  Truck,
  Headset,
  Package,
  LayoutDashboard,
  LucideIcon,
} from 'lucide-react';
import { cn, FREE_SHIPPING_THRESHOLD, formatPrice } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useCategories } from '@/hooks/useCategories';
import CartDrawer from '../cart/CartDrawer';
import { ProductsMegaMenu } from './ProductsMegaMenu';

// Mapping des icônes par slug de catégorie
const categoryIcons: Record<string, { icon: LucideIcon; color: string }> = {
  'porc': { icon: Beef, color: 'text-rose-500' },
  'poulet': { icon: Bird, color: 'text-orange-500' },
  'poisson': { icon: Fish, color: 'text-blue-500' },
  'akanga': { icon: Bird, color: 'text-amber-600' },
  'caille': { icon: Bird, color: 'text-yellow-600' },
  'transformes': { icon: Package, color: 'text-purple-500' },
  'oeufs-frais': { icon: Egg, color: 'text-amber-500' },
  'oeufs-fecondes': { icon: Egg, color: 'text-orange-400' },
  'poules': { icon: Bird, color: 'text-red-500' },
  'accessoires': { icon: Package, color: 'text-gray-500' },
};

interface SubItem {
  name: string;
  href: string;
  icon?: LucideIcon;
  color?: string;
}

interface NavItem {
  name: string;
  href: string;
  // 'mega' : méga-menu pleine largeur (Produits) ; 'dropdown' : sous-menu simple
  kind?: 'mega' | 'dropdown';
  submenu?: SubItem[];
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const accountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const cart = useCart();
  const { data: session, status } = useSession();
  const { categories } = useCategories();

  // Construire le menu de navigation avec les catégories dynamiques
  const navigation = useMemo<NavItem[]>(() => {
    const produitsSubmenu: SubItem[] = categories
      .filter(c => c.isActive)
      .map(c => ({
        name: c.name,
        href: `/produits?categorie=${c.slug}`,
        icon: categoryIcons[c.slug]?.icon || Package,
        color: categoryIcons[c.slug]?.color || 'text-gray-500',
      }));

    return [
      { name: 'Accueil', href: '/' },
      { name: 'Produits', href: '/produits', kind: 'mega', submenu: produitsSubmenu },
      { name: 'Notre Élevage', href: '/notre-elevage' },
      { name: 'Services', href: '/services' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
    ];
  }, [categories]);

  useEffect(() => {
    setIsMounted(true);
    // Seuils différents à l'aller et au retour : replier le header réduit la hauteur
    // de la page, ce qui sinon le ferait clignoter autour d'un seuil unique.
    const handleScroll = () =>
      setIsScrolled(prev => (prev ? window.scrollY > 4 : window.scrollY > 80));
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setOpenSubmenu(null);
    setIsAccountOpen(false);
  }, [pathname]);

  // Bloquer le scroll de la page quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Fermer le menu compte au clic à l'extérieur
  useEffect(() => {
    if (!isAccountOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isAccountOpen]);

  const itemCount = isMounted ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    router.push(q ? `/produits?q=${encodeURIComponent(q)}` : '/produits');
    setIsMobileSearchOpen(false);
  };

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'admin';

  return (
    <>
      {/* Header fixé en haut : la barre utilitaire se replie au défilement pour gagner de la place */}
      <header
        className={cn(
          'sticky top-0 z-40 bg-white text-warm-600 transition-shadow duration-300',
          isScrolled && 'shadow-md shadow-warm-900/5'
        )}
      >
        {/* Top Utility Bar */}
        <div className={cn('bg-prairie-50/60 border-b border-warm-100 py-1.5', isScrolled ? 'hidden' : 'hidden md:block')}>
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/suivi-commande"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-warm-500 hover:text-prairie-700 hover:bg-prairie-100/60 transition-colors"
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Suivi de commande</span>
              </Link>
              <span className="w-px h-3.5 bg-warm-200 mx-1" />
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-warm-500 hover:text-prairie-700 hover:bg-prairie-100/60 transition-colors"
              >
                <Headset className="h-3.5 w-3.5" />
                <span>Nous contacter</span>
              </Link>
            </div>
            <span className="text-xs font-medium tracking-wide text-prairie-700">
              Livraison offerte dès {formatPrice(FREE_SHIPPING_THRESHOLD)} d&apos;achat
            </span>
          </div>
        </div>

        {/* Main Header */}
        <div className={cn('bg-white border-b border-warm-100 transition-[padding] duration-300', isScrolled ? 'py-2' : 'py-3 lg:py-4')}>
          <div className="container mx-auto px-4 flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img
                src="/images/logo.png"
                alt="La Ferme du Vardier"
                className={cn('w-auto object-contain transition-all duration-300', isScrolled ? 'h-10 lg:h-12' : 'h-12 md:h-14 lg:h-16')}
              />
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 relative items-center max-w-[600px] mx-auto">
              <Search className="absolute left-3 h-4 w-4 text-warm-400 pointer-events-none" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un produit : porc, poulet, pintade, œufs..."
                aria-label="Rechercher un produit"
                className="w-full h-10 pl-9 pr-28 text-sm text-warm-700 placeholder:text-warm-400 bg-white border border-warm-200 rounded-md transition focus:outline-none focus:border-prairie-500 focus:ring-[3px] focus:ring-prairie-500/15"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-4 rounded text-[13px] font-medium text-white bg-prairie-600 hover:bg-prairie-700 transition-colors"
              >
                Rechercher
              </button>
            </form>

            {/* Actions */}
            <div className="ml-auto lg:ml-0 flex items-center gap-0 lg:gap-1">
              {/* Mobile Search Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(v => !v)}
                className="lg:hidden p-2 rounded-md text-warm-600 hover:bg-warm-50 hover:text-prairie-700 transition-colors"
                aria-label="Rechercher"
                aria-expanded={isMobileSearchOpen}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Account */}
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setIsAccountOpen(v => !v)}
                  className="p-2 lg:px-2.5 rounded-md text-warm-600 hover:bg-warm-50 hover:text-prairie-700 transition-colors"
                  aria-label="Mon compte"
                  aria-expanded={isAccountOpen}
                >
                  {status !== 'loading' && session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'Mon compte'}
                      className="w-6 h-6 rounded-full ring-2 ring-prairie-200"
                    />
                  ) : (
                    <UserCircle className="h-6 w-6" />
                  )}
                </button>

                {isAccountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg border border-warm-100 shadow-lg shadow-warm-900/10 overflow-hidden z-50">
                    {session ? (
                      <div className="px-5 pt-5 pb-3">
                        <h6 className="text-[15px] font-semibold text-warm-800 truncate">
                          {session.user?.name || 'Mon compte'}
                        </h6>
                        <p className="text-[13px] text-warm-500 truncate">{session.user?.email}</p>
                      </div>
                    ) : (
                      <>
                        <div className="px-5 pt-5 pb-3">
                          <h6 className="text-[15px] font-semibold text-warm-800">Bienvenue</h6>
                          <p className="text-[13px] text-warm-500">
                            Connectez-vous pour suivre vos commandes
                          </p>
                        </div>
                        <div className="px-5 pb-4">
                          <Link
                            href="/connexion"
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-[13px] font-medium text-white bg-prairie-600 hover:bg-prairie-700 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            Se connecter
                          </Link>
                        </div>
                      </>
                    )}
                    <div className="border-t border-warm-100 py-2">
                      <Link
                        href="/suivi-commande"
                        className="flex items-center gap-3 px-5 py-2.5 text-sm text-warm-600 hover:bg-warm-50 hover:text-prairie-700 transition-colors"
                      >
                        <Package className="h-4 w-4 text-warm-400" />
                        {session ? 'Mes commandes' : 'Suivi de commande'}
                      </Link>
                      <Link
                        href="/contact"
                        className="flex items-center gap-3 px-5 py-2.5 text-sm text-warm-600 hover:bg-warm-50 hover:text-prairie-700 transition-colors"
                      >
                        <Headset className="h-4 w-4 text-warm-400" />
                        Service client
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-warm-600 hover:bg-warm-50 hover:text-prairie-700 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-warm-400" />
                          Dashboard Admin
                        </Link>
                      )}
                      {session && (
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Se déconnecter
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 lg:px-2.5 rounded-md text-warm-600 hover:bg-warm-50 hover:text-prairie-700 transition-colors"
                aria-label="Panier"
              >
                <ShoppingBag className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute top-0.5 left-6 min-w-[18px] h-[18px] px-1 rounded-full bg-prairie-600 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Navigation Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 ml-1 rounded-md text-warm-600 hover:bg-warm-50 hover:text-prairie-700 transition-colors"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-7 w-7" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation (desktop) */}
        <div className="hidden lg:block bg-white border-b border-warm-100">
          <div className="container mx-auto px-4 relative">
            <nav>
              <ul className="flex items-center">
                {navigation.map((item, index) => (
                  <li
                    key={item.name}
                    className={cn(item.kind !== 'mega' && 'relative')}
                    onMouseEnter={() => item.submenu && setOpenSubmenu(item.name)}
                    onMouseLeave={() => setOpenSubmenu(null)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-1.5 py-4 px-4 font-nav text-sm font-medium whitespace-nowrap transition-colors',
                        index === 0 && 'pl-0',
                        isActive(item.href) || openSubmenu === item.name
                          ? 'text-prairie-700'
                          : 'text-warm-600 hover:text-prairie-700'
                      )}
                    >
                      <span>{item.name}</span>
                      {item.submenu && (
                        <ChevronDown
                          className={cn('h-3.5 w-3.5 transition-transform', openSubmenu === item.name && 'rotate-180')}
                        />
                      )}
                    </Link>

                    {/* Simple dropdown */}
                    {item.kind === 'dropdown' && item.submenu && (
                      <ul
                        className={cn(
                          'absolute left-3.5 py-2.5 min-w-[240px] bg-white rounded shadow-[0_0_30px_rgba(0,0,0,0.1)] z-50 transition-all duration-300',
                          openSubmenu === item.name ? 'top-full opacity-100 visible' : 'top-[130%] opacity-0 invisible'
                        )}
                      >
                        {item.submenu.map((sub) => (
                          <li key={sub.href}>
                            <Link
                              href={sub.href}
                              className="block px-5 py-2.5 font-nav text-[15px] text-warm-600 hover:text-prairie-700 transition-colors"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Mega menu Produits (onglets comme le megamenu 1 de la maquette) */}
                    {item.kind === 'mega' && (
                      <ProductsMegaMenu isOpen={openSubmenu === item.name} categories={categories} />
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Mobile Search Form */}
        {isMobileSearchOpen && (
          <div className="lg:hidden bg-white border-b border-warm-100">
            <form onSubmit={handleSearch} className="container mx-auto px-4 pt-2 pb-3">
              <div className="flex items-center px-3 border border-warm-200 rounded-md bg-white focus-within:border-prairie-500 focus-within:ring-[3px] focus-within:ring-prairie-500/15">
                <Search className="h-4 w-4 mr-2.5 flex-shrink-0 text-warm-400" />
                <input
                  type="search"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Que recherchez-vous ?"
                  aria-label="Rechercher un produit"
                  className="w-full py-2.5 text-sm bg-transparent text-warm-700 placeholder:text-warm-400 focus:outline-none"
                />
              </div>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Navigation (overlay) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[rgba(33,37,41,0.8)]" onClick={() => setIsMobileMenuOpen(false)}>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-white"
            aria-label="Fermer le menu"
          >
            <X className="h-8 w-8" />
          </button>
          <nav
            className="absolute top-[60px] left-5 right-5 bottom-5 py-2.5 bg-white rounded-md overflow-y-auto shadow-[0_0_30px_rgba(0,0,0,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <ul>
              {navigation.map((item) => {
                const expanded = openMobileSubmenu === item.name;
                return (
                  <li key={item.name}>
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex-1 px-5 py-2.5 font-nav text-[17px] font-medium transition-colors',
                          isActive(item.href) ? 'text-prairie-700' : 'text-warm-600 hover:text-prairie-700'
                        )}
                      >
                        {item.name}
                      </Link>
                      {item.submenu && item.submenu.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setOpenMobileSubmenu(expanded ? null : item.name)}
                          className={cn(
                            'mr-5 w-[30px] h-[30px] flex items-center justify-center rounded-full transition-all',
                            expanded ? 'bg-prairie-600 text-white rotate-180' : 'bg-prairie-100 text-prairie-700'
                          )}
                          aria-label={`Afficher le sous-menu ${item.name}`}
                          aria-expanded={expanded}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {item.submenu && expanded && (
                      <ul className="mx-5 my-2.5 py-2.5 border border-warm-100 rounded bg-warm-50/40">
                        {item.kind === 'mega' && (
                          <li>
                            <Link
                              href="/produits"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-5 py-2.5 font-nav text-[15px] text-warm-600 hover:text-prairie-700"
                            >
                              <Sparkles className="h-4 w-4 text-purple-500" />
                              Tous les produits
                            </Link>
                          </li>
                        )}
                        {item.submenu.map((sub) => {
                          const Icon = sub.icon;
                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-5 py-2.5 font-nav text-[15px] text-warm-600 hover:text-prairie-700"
                              >
                                {Icon && <Icon className={cn('h-4 w-4', sub.color)} />}
                                {sub.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
              <li className="mt-2 pt-2 border-t border-warm-100">
                <Link
                  href="/suivi-commande"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-2.5 font-nav text-[17px] font-medium text-warm-600 hover:text-prairie-700"
                >
                  <Truck className="h-5 w-5 text-prairie-600" />
                  Suivi de commande
                </Link>
              </li>
              {!session && (
                <li className="px-5 pt-3">
                  <Link
                    href="/connexion"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-md font-medium text-white bg-prairie-600 hover:bg-prairie-700"
                  >
                    <User className="h-4 w-4" />
                    Se connecter
                  </Link>
                </li>
              )}
            </ul>
            <p className="px-5 pt-4 pb-2 text-xs font-medium text-prairie-700">
              Livraison offerte dès {formatPrice(FREE_SHIPPING_THRESHOLD)} d&apos;achat
            </p>
          </nav>
        </div>
      )}

      {/* Cart drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default Header;
