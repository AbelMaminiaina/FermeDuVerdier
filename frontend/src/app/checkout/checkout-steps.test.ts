import { describe, it, expect } from 'vitest';
import { filterCheckoutSteps, type CheckoutStepId } from './checkout-steps';

const steps: { id: CheckoutStepId }[] = [
  { id: 'informations' },
  { id: 'adresse' },
  { id: 'livraison' },
  { id: 'paiement' },
];

describe('filterCheckoutSteps', () => {
  it('garde toutes les étapes quand aucun produit n’est en livraison offerte', () => {
    expect(filterCheckoutSteps(steps, false).map((s) => s.id)).toEqual([
      'informations',
      'adresse',
      'livraison',
      'paiement',
    ]);
  });

  it('retire l’étape « livraison » quand le panier a un produit en livraison offerte', () => {
    expect(filterCheckoutSteps(steps, true).map((s) => s.id)).toEqual([
      'informations',
      'adresse',
      'paiement',
    ]);
  });

  it('ne mute pas le tableau d’origine', () => {
    filterCheckoutSteps(steps, true);
    expect(steps).toHaveLength(4);
  });
});
