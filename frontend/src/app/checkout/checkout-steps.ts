export type CheckoutStepId = 'informations' | 'adresse' | 'livraison' | 'paiement';

/**
 * Étapes visibles du tunnel de commande.
 * Quand le panier contient un produit en livraison offerte, l'étape « Livraison »
 * n'a plus d'objet (aucun frais, aucun choix de méthode) → on la retire.
 */
export function filterCheckoutSteps<T extends { id: CheckoutStepId }>(
  steps: readonly T[],
  hasFreeShippingItem: boolean,
): T[] {
  return hasFreeShippingItem
    ? steps.filter((s) => s.id !== 'livraison')
    : [...steps];
}
