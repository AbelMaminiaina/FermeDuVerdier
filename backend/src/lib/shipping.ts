// Barème de livraison — source unique de vérité côté backend.
// Le frontend en garde un miroir dans frontend/src/lib/utils.ts (getShippingCost).

/** Frais de livraison en Ariary : la livraison est offerte sur toutes les commandes. */
export function computeShippingCost(): number {
  return 0;
}
