'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Home,
  MapPin,
  Phone,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { fadeInUp } from '@/lib/animations';
import { formatPrice } from '@/lib/utils';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  deliveryMethod: string;
  createdAt: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode; description: string }> = {
  pending: {
    label: 'En attente',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: <Clock className="h-6 w-6" />,
    description: 'Votre commande est en attente de confirmation. Nous vérifions la disponibilité des produits.',
  },
  confirmed: {
    label: 'Confirmée',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <CheckCircle className="h-6 w-6" />,
    description: 'Votre commande a été confirmée et sera bientôt préparée.',
  },
  processing: {
    label: 'En préparation',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: <Package className="h-6 w-6" />,
    description: 'Votre commande est en cours de préparation par notre équipe.',
  },
  shipped: {
    label: 'Expédiée',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    icon: <Truck className="h-6 w-6" />,
    description: 'Votre commande a été expédiée et est en route vers vous.',
  },
  delivered: {
    label: 'Livrée',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: <CheckCircle className="h-6 w-6" />,
    description: 'Votre commande a été livrée avec succès. Merci pour votre confiance !',
  },
  cancelled: {
    label: 'Annulée',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: <XCircle className="h-6 w-6" />,
    description: 'Cette commande a été annulée.',
  },
};

const deliveryLabels: Record<string, string> = {
  standard: 'Livraison standard',
  express: 'Livraison express',
  retrait: 'Retrait sur place',
};

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function SuiviCommandePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const searchOrder = async () => {
    if (!searchQuery.trim()) {
      setError('Veuillez entrer un numéro de commande');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || '/api'}/checkout/${searchQuery.trim().toUpperCase()}`
      );

      if (response.ok) {
        const data = await response.json();
        setOrder({
          id: data.id,
          orderNumber: data.orderNumber,
          customerName: `${data.customer.firstName} ${data.customer.lastName}`,
          customerEmail: data.customer.email,
          customerPhone: data.customer.phone,
          status: data.status,
          subtotal: data.subtotal,
          shippingCost: data.shippingCost,
          total: data.total,
          deliveryMethod: data.deliveryMethod,
          createdAt: data.createdAt,
          address: data.address,
          items: data.items.map((item: { product: { name: string }; quantity: number; price: number }) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
          })),
        });
      } else {
        setOrder(null);
        setError('Commande non trouvée. Vérifiez le numéro de commande.');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setOrder(null);
      setError('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchOrder();
    }
  };

  const currentStatus = order ? statusConfig[order.status] : null;
  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-prairie-100 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-prairie-600" />
            </div>
            <h1 className="text-3xl font-display font-bold text-warm-800 mb-2">
              Suivi de commande
            </h1>
            <p className="text-warm-600">
              Entrez votre numéro de commande pour suivre son état
            </p>
          </div>

          {/* Search box */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-400" />
                <Input
                  type="text"
                  placeholder="Ex: FDV-XXXXXX-XXXXX"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 uppercase"
                />
              </div>
              <Button onClick={searchOrder} loading={loading} className="shrink-0">
                Rechercher
              </Button>
            </div>
            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Order details */}
          {order && currentStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Status card */}
              <div className={`rounded-xl p-6 ${currentStatus.bgColor}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full bg-white ${currentStatus.color}`}>
                    {currentStatus.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className={`text-xl font-bold ${currentStatus.color}`}>
                        {currentStatus.label}
                      </h2>
                      <span className="text-sm text-warm-600">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className={`${currentStatus.color} opacity-80`}>
                      {currentStatus.description}
                    </p>
                  </div>
                </div>

                {/* Progress steps */}
                {order.status !== 'cancelled' && (
                  <div className="mt-6 pt-6 border-t border-white/30">
                    <div className="flex justify-between">
                      {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        return (
                          <div key={step} className="flex flex-col items-center flex-1">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                ${isCompleted ? 'bg-white text-prairie-600' : 'bg-white/40 text-warm-500'}`}
                            >
                              {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                            </div>
                            <span className={`text-xs mt-2 text-center hidden sm:block
                              ${isCurrent ? 'font-semibold' : ''} ${currentStatus.color}`}>
                              {statusConfig[step].label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Order info */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-warm-800 mb-4">
                  Commande {order.orderNumber}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Delivery info */}
                  <div>
                    <div className="flex items-center gap-2 text-warm-600 mb-2">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm font-medium">Livraison</span>
                    </div>
                    <p className="text-warm-800">
                      {deliveryLabels[order.deliveryMethod] || order.deliveryMethod}
                    </p>
                  </div>

                  {/* Address */}
                  {order.address && (
                    <div>
                      <div className="flex items-center gap-2 text-warm-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">Adresse</span>
                      </div>
                      <p className="text-warm-800 text-sm">
                        {order.address.street}<br />
                        {order.address.postalCode} {order.address.city}
                      </p>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="border-t border-warm-100 pt-4">
                  <h4 className="font-medium text-warm-800 mb-3">Articles commandés</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-warm-600">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="text-warm-800 font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-warm-100 mt-4 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-600">Sous-total</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-600">Livraison</span>
                      <span>{order.shippingCost > 0 ? formatPrice(order.shippingCost) : 'Gratuit'}</span>
                    </div>
                    <div className="flex justify-between font-bold text-prairie-600">
                      <span>Total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-warm-100 rounded-xl p-6">
                <h3 className="font-semibold text-warm-800 mb-3">Une question ?</h3>
                <div className="flex items-center gap-2 text-warm-700">
                  <Phone className="h-4 w-4" />
                  <span>Appelez-nous au </span>
                  <a href="tel:+261380100101" className="font-medium text-prairie-600 hover:underline">
                    038 01 001 01
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* No order found */}
          {searched && !order && !loading && !error && (
            <div className="bg-white rounded-xl p-8 text-center">
              <AlertCircle className="h-12 w-12 text-warm-400 mx-auto mb-4" />
              <p className="text-warm-600">Aucune commande trouvée</p>
            </div>
          )}

          {/* Back to home */}
          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="outline" icon={<Home className="h-4 w-4" />}>
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
