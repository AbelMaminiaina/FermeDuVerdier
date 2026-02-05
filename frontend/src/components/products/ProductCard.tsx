'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { Badge, Button } from '@/components/ui';
import { formatPrice, getBadgeLabel } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';
import { imageHover } from '@/lib/animations';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const cart = useCart();
  const { addToast } = useToast();

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
      quantity: 1,
    });

    addToast('success', `${product.name} ajouté au panier`);
  };

  const isPoule = product.category === 'poules';

  return (
    <Link href={`/produits/${product.slug}`}>
      <motion.div
        className="group bg-white rounded-xl overflow-hidden border border-warm-100 shadow-sm hover:shadow-lg transition-all duration-300"
        whileHover="hover"
        initial="rest"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-warm-50">
          <motion.div variants={imageHover} className="absolute inset-0">
            <Image
              src={product.images[0] || '/images/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {product.badges.map((badge) => (
              <Badge key={badge} type={badge} size="sm">
                {getBadgeLabel(badge)}
              </Badge>
            ))}
          </div>

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-warm-900/60 flex items-center justify-center">
              <span className="text-white font-semibold bg-warm-800 px-4 py-2 rounded-lg">
                Rupture de stock
              </span>
            </div>
          )}

          {/* Quick view button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <span className="bg-white text-warm-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Voir le produit
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {product.metadata?.race && (
            <span className="text-xs text-prairie-600 font-medium">
              {product.metadata.race}
            </span>
          )}

          {/* Name */}
          <h3 className="font-semibold text-warm-800 mt-1 line-clamp-2 group-hover:text-prairie-700 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-warm-500 mt-1 line-clamp-2">
            {product.shortDescription}
          </p>

          {/* Price and action */}
          <div className="flex items-center justify-between mt-4">
            <div>
              <span className="text-lg font-bold text-prairie-600">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-warm-400 line-through ml-2">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {isPoule && (
                <span className="text-xs text-warm-500 block">/pièce</span>
              )}
            </div>

            {product.inStock && (
              <Button
                size="sm"
                icon={<ShoppingCart className="h-4 w-4" />}
                onClick={handleAddToCart}
                aria-label={isPoule ? 'Réserver' : 'Ajouter au panier'}
              >
                {isPoule ? 'Réserver' : 'Ajouter'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default ProductCard;
