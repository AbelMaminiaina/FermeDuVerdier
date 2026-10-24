'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui';
import { formatPrice, isUpcoming } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';

interface AdvisorProductRowProps {
  product: Product;
  onNavigate?: () => void;
}

// Carte compacte (petite photo, nom, prix, bouton) : tient sur une ligne de téléphone
export function AdvisorProductRow({ product, onNavigate }: AdvisorProductRowProps) {
  const cart = useCart();
  const { addToast } = useToast();

  const upcoming = isUpcoming(product.availableFrom);
  const reserveLabel = product.productType === 'vif' || upcoming;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/images/placeholder.jpg',
      slug: product.slug,
      metadata: product.metadata,
      freeShipping: product.freeShipping,
      estimatedWeightKg: product.estimatedWeightKg,
      availableFrom: product.availableFrom,
      quantity: 1,
    });

    addToast('success', upcoming ? `${product.name} réservé` : `${product.name} ajouté au panier`);
  };

  return (
    <Link
      href={`/produits/${product.slug}`}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-xl border border-warm-100 bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-warm-100">
        <Image
          src={product.images[0] || '/images/placeholder.jpg'}
          alt={product.name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-warm-800 text-sm line-clamp-2">{product.name}</h3>
        <span className="text-prairie-600 font-bold">{formatPrice(product.price)}</span>
        {!upcoming && !product.inStock && (
          <span className="block text-xs text-warm-500">Rupture de stock</span>
        )}
      </div>

      {(product.inStock || upcoming) && (
        <Button
          size="sm"
          icon={<ShoppingCart className="h-4 w-4" />}
          onClick={handleAddToCart}
          aria-label={reserveLabel ? `Réserver ${product.name}` : `Ajouter ${product.name} au panier`}
          className="shrink-0"
        >
          {reserveLabel ? 'Réserver' : 'Ajouter'}
        </Button>
      )}
    </Link>
  );
}

export default AdvisorProductRow;
