'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { drawerSlide, modalBackdrop } from '@/lib/animations';
import { AdvisorChat } from './FarmAdvisor';

// Pages où le bouton flottant gênerait (administration, tunnel de commande)
const HIDDEN_PREFIXES = ['/admin', '/checkout', '/panier', '/connexion'];

// Bouton « Conseil » en bas d'écran, sur toutes les pages publiques : ouvre le conseiller en panneau
export function AdvisorLauncher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(false);

  // Ferme le panneau quand le client part vers une fiche produit
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Bouton inutile (et gênant pour les boutons « Ajouter ») quand la section du conseiller est à l'écran
  useEffect(() => {
    const sections = document.querySelectorAll('[data-advisor-section]');
    if (sections.length === 0) {
      setSectionVisible(false);
      return;
    }
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
      setSectionVisible(visible.size > 0);
    });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && !sectionVisible && (
          <motion.button
            type="button"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 inline-flex items-center gap-2 rounded-full bg-prairie-600 p-3.5 sm:px-4 sm:py-3 text-white font-medium shadow-lg hover:bg-prairie-700 focus:outline-none focus:ring-[3px] focus:ring-prairie-300"
            aria-label="Ouvrir le conseiller de la ferme"
          >
            <Sparkles className="h-5 w-5" />
            {/* Téléphone : icône seule, pour ne pas masquer les boutons de la page */}
            <span className="hidden sm:inline">Conseil</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              variants={modalBackdrop}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="advisor-panel-title"
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-cream-50 z-50 flex flex-col shadow-xl"
              variants={drawerSlide}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="flex items-center justify-between p-4 border-b border-warm-100 bg-white">
                <h2 id="advisor-panel-title" className="text-lg font-semibold text-warm-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-prairie-600" />
                  Conseiller de la ferme
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-warm-500 hover:bg-warm-100"
                  aria-label="Fermer le conseiller"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <p className="text-warm-600 text-sm mb-4">
                  Décrivez votre besoin, notre conseiller vous propose les produits adaptés.
                </p>
                <AdvisorChat compact onNavigate={() => setIsOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default AdvisorLauncher;
