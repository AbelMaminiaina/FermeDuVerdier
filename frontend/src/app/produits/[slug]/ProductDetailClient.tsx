'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { Product } from '@/types';
import { Button, Badge } from '@/components/ui';
import ProductCard from '@/components/products/ProductCard';
import { formatPrice, getBadgeLabel, getCategoryLabel } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';
import { fadeInLeft, fadeInRight } from '@/lib/animations';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const cart = useCart();
  const { addToast } = useToast();

  const handleAddToCart = () => {
    cart.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0] || '/images/placeholder.jpg',
      slug: product.slug,
      metadata: product.metadata,
    });
    addToast('success', `${product.name} ajouté au panier`);
  };

  const isPoule = product.category === 'poules';

  return (
    <div className="min-h-screen bg-cream-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-warm-500 mb-8">
          <Link href="/" className="hover:text-prairie-600">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/produits" className="hover:text-prairie-600">
            Produits
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/produits?categorie=${product.category}`}
            className="hover:text-prairie-600"
          >
            {getCategoryLabel(product.category)}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-warm-700">{product.name}</span>
        </nav>

        {/* Product details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <motion.div
            variants={fadeInLeft}
            initial="initial"
            animate="animate"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg mb-4">
              <Image
                src={product.images[selectedImage] || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {product.badges.map((badge) => (
                  <Badge key={badge} type={badge}>
                    {getBadgeLabel(badge)}
                  </Badge>
                ))}
              </div>
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-prairie-600 shadow-md'
                        : 'border-transparent hover:border-warm-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            variants={fadeInRight}
            initial="initial"
            animate="animate"
          >
            {/* Category and race */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-prairie-600 font-medium">
                {getCategoryLabel(product.category)}
              </span>
              {product.metadata?.race && (
                <>
                  <span className="text-warm-400">•</span>
                  <span className="text-warm-500">{product.metadata.race}</span>
                </>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-warm-800 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-prairie-600">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-warm-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {isPoule && <span className="text-warm-500">/pièce</span>}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-6">
              {product.inStock ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">En stock</span>
                  {product.stockQuantity && product.stockQuantity < 10 && (
                    <span className="text-warm-500">
                      (Plus que {product.stockQuantity} disponibles)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-red-600 font-medium">Rupture de stock</span>
              )}
            </div>

            {/* Description */}
            <p className="text-warm-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Characteristics */}
            {product.characteristics && (
              <div className="mb-8">
                <h3 className="font-semibold text-warm-800 mb-3">Caractéristiques</h3>
                <ul className="space-y-2">
                  {product.characteristics.map((char, index) => (
                    <li key={index} className="flex items-start gap-2 text-warm-600">
                      <Check className="h-5 w-5 text-prairie-500 shrink-0 mt-0.5" />
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add to cart */}
            {product.inStock && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Quantity selector */}
                <div className="flex items-center border border-warm-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-warm-100 transition-colors"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-warm-100 transition-colors"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                {/* Add to cart button */}
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  icon={<ShoppingCart className="h-5 w-5" />}
                  className="flex-1"
                >
                  {isPoule ? 'Réserver' : 'Ajouter au panier'}
                </Button>
              </div>
            )}

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-warm-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-prairie-50 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-prairie-600" />
                </div>
                <div>
                  <div className="font-medium text-warm-800 text-sm">
                    Livraison gratuite
                  </div>
                  <div className="text-xs text-warm-500">Dès 200 000 Ar d&apos;achat</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-prairie-50 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-prairie-600" />
                </div>
                <div>
                  <div className="font-medium text-warm-800 text-sm">
                    Qualité garantie
                  </div>
                  <div className="text-xs text-warm-500">Fraîcheur assurée</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-display font-bold text-warm-800 mb-6">
              Produits similaires
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="mt-12">
          <Link href="/produits">
            <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
              Retour aux produits
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
