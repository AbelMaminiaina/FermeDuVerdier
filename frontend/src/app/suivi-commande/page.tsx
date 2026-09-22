'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Phone,
  XCircle,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { fadeInUp } from '@/lib/animations';
import { formatPrice } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/api/config';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  availableFrom?: string | null;
}

function isReservation(availableFrom?: string | null): boolean {
  if (!availableFrom) return false;
  const d = new Date(availableFrom);
  return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
}

interface Order {
  id: string;
  orderNumber: string;
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
  } | null;
  // Suivi public par numéro : seule la ville est renvoyée, jamais l'adresse exacte
  city?: string | null;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode; description: string }> = {
  pending: {
    label: 'En attente',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: <Clock className="h-5 w-5" />,
    description: 'Votre commande est en attente de confirmation.',
  },
  confirmed: {
    label: 'Confirmée',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <CheckCircle className="h-5 w-5" />,
    description: 'Votre commande a été confirmée.',
  },
  processing: {
    label: 'En préparation',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: <Package className="h-5 w-5" />,
    description: 'Votre commande est en cours de préparation.',
  },
  shipped: {
    label: 'Expédiée',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-100',
    icon: <Truck className="h-5 w-5" />,
    description: 'Votre commande est en route.',
  },
  delivered: {
    label: 'Livrée',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: <CheckCircle className="h-5 w-5" />,
    description: 'Commande livrée avec succès.',
  },
  cancelled: {
    label: 'Annulée',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: <XCircle className="h-5 w-5" />,
    description: 'Cette commande a été annulée.',
  },
};

const deliveryLabels: Record<string, string> = {
  standard: 'Livraison standard',
  express: 'Livraison express',
  retrait: 'Retrait sur place',
};

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const formatLongDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

function SuiviCommandeContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Suivi par numéro de commande, sans connexion
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  const trackOrder = useCallback(async (value: string) => {
    const number = value.trim();
    if (!number) return;
    setTracking(true);
    setTrackError(null);
    setTrackedOrder(null);
    try {
      const response = await fetch(`${API_BASE_URL}/checkout/track/${encodeURIComponent(number)}`);
      if (response.status === 404) {
        setTrackError('Aucune commande ne correspond à ce numéro. Vérifiez-le dans votre email de confirmation.');
        return;
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setTrackedOrder({ id: data.order.orderNumber, ...data.order });
    } catch (error) {
      console.error('Error tracking order:', error);
      setTrackError('Impossible de récupérer la commande pour le moment. Réessayez dans quelques instants.');
    } finally {
      setTracking(false);
    }
  }, []);

  // Lien depuis la page de confirmation : /suivi-commande?order=FDV-...
  useEffect(() => {
    const fromUrl = searchParams.get('order');
    if (fromUrl) trackOrder(fromUrl);
  }, [searchParams, trackOrder]);

  // Client connecté : on affiche en plus l'historique de ses commandes
  useEffect(() => {
    if (session?.user?.email) {
      fetchOrders(session.user.email);
    }
  }, [session]);

  const fetchOrders = async (email: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/checkout/customer/${encodeURIComponent(email)}`,
        { credentials: 'include' } // l'API vérifie que la session correspond à cet email
      );
      if (response.ok) {
        const data = await response.json();
        const formattedOrders = (data.orders || []).map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          total: order.total,
          deliveryMethod: order.deliveryMethod,
          createdAt: order.createdAt,
          address: order.address,
          items: order.items?.map((item: any) => ({
            name: item.product?.name || item.name || 'Produit',
            quantity: item.quantity,
            price: item.price,
            availableFrom: item.availableFrom ?? null,
          })) || [],
        }));
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-display font-bold text-warm-800 mb-2">
              Suivi de commande
            </h1>
            <p className="text-warm-600">
              Saisissez le numéro de commande reçu dans votre email de confirmation.
            </p>
          </div>

          {/* Formulaire de suivi */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              trackOrder(orderNumber);
            }}
            className="max-w-xl mx-auto mb-8 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-400 pointer-events-none" />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ex. : FDV-MF3K2A1B-X7K9P2"
                aria-label="Numéro de commande"
                autoComplete="off"
                required
                className="w-full h-11 pl-9 pr-3 text-sm uppercase placeholder:normal-case text-warm-700 placeholder:text-warm-400 bg-white border border-warm-200 rounded-md transition focus:outline-none focus:border-prairie-500 focus:ring-[3px] focus:ring-prairie-500/15"
              />
            </div>
            <Button type="submit" loading={tracking} className="h-11">
              Suivre ma commande
            </Button>
          </form>

          {trackError && (
            <div className="max-w-xl mx-auto mb-8 p-4 rounded-md bg-red-50 text-sm text-red-700 text-center" role="alert">
              {trackError}
            </div>
          )}

          {trackedOrder && (
            <div className="bg-white rounded-xl shadow-sm mb-12 overflow-hidden">
              <div className="border-b border-warm-100 p-4 sm:p-6">
                <h2 className="text-xl font-bold text-warm-800">{trackedOrder.orderNumber}</h2>
                <p className="text-sm text-warm-600">Passée le {formatLongDate(trackedOrder.createdAt)}</p>
              </div>
              <OrderDetail order={trackedOrder} />
            </div>
          )}

          {/* Historique (client connecté) */}
          {session && orders.length > 0 && (
            <>
              <h2 className="text-2xl font-display font-bold text-warm-800 mb-4">
                Mes commandes
              </h2>
              <div className="space-y-4">
                {orders.map((order, index) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Infos commande */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-warm-800">
                              {order.orderNumber}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                              {status.icon}
                              {status.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-warm-600">
                            <span>
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                            <span>•</span>
                            <span>{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>{deliveryLabels[order.deliveryMethod] || order.deliveryMethod}</span>
                          </div>
                        </div>

                        {/* Prix et flèche */}
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-prairie-600">
                            {formatPrice(order.total)}
                          </span>
                          <ChevronRight className="h-5 w-5 text-warm-400 group-hover:text-prairie-600 transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Modal détail commande */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl w-full max-w-2xl my-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Header modal */}
              <div className="sticky top-0 bg-white border-b border-warm-100 p-4 sm:p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-warm-800">
                    {selectedOrder.orderNumber}
                  </h2>
                  <p className="text-sm text-warm-600">{formatLongDate(selectedOrder.createdAt)}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-warm-100 rounded-full transition-colors"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5 text-warm-600" />
                </button>
              </div>

              <OrderDetail order={selectedOrder} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderDetail({ order }: { order: Order }) {
  const status = statusConfig[order.status] || statusConfig.pending;
  const stepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Statut avec progression */}
      <div className={`rounded-xl p-4 sm:p-6 ${status.bgColor}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full bg-white ${status.color}`}>
            {status.icon}
          </div>
          <div>
            <h3 className={`font-bold ${status.color}`}>{status.label}</h3>
            <p className={`text-sm ${status.color} opacity-80`}>{status.description}</p>
          </div>
        </div>

        {/* Barre de progression */}
        {order.status !== 'cancelled' && (
          <div className="flex justify-between mt-4">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= stepIndex;
              const isCurrent = index === stepIndex;
              return (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium
                      ${isCompleted ? 'bg-white text-prairie-600' : 'bg-white/40 text-warm-500'}`}
                  >
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-1 text-center ${isCurrent ? 'font-semibold' : ''} ${status.color}`}>
                    <span className="hidden sm:inline">{statusConfig[step].label}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Livraison */}
      <div className="flex items-center gap-3 p-4 bg-warm-50 rounded-xl">
        <Truck className="h-5 w-5 text-warm-600" />
        <div>
          <p className="font-medium text-warm-800">
            {deliveryLabels[order.deliveryMethod] || order.deliveryMethod}
          </p>
          {order.address ? (
            <p className="text-sm text-warm-600">
              {order.address.street}, {order.address.postalCode} {order.address.city}
            </p>
          ) : order.city ? (
            <p className="text-sm text-warm-600">{order.city}</p>
          ) : null}
        </div>
      </div>

      {/* Articles */}
      <div>
        <h4 className="font-semibold text-warm-800 mb-3">Articles commandés</h4>
        <div className="space-y-2 bg-warm-50 rounded-xl p-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm py-2 border-b border-warm-200 last:border-0">
              <span className="text-warm-700">
                {item.name} <span className="text-warm-500">x{item.quantity}</span>
                {isReservation(item.availableFrom) && (
                  <span className="block text-xs text-amber-600 font-medium mt-0.5">
                    📅 Réservation — livraison à partir du{' '}
                    {new Date(item.availableFrom!).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                )}
              </span>
              <span className="font-medium text-warm-800">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Totaux */}
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-warm-600">
            <span>Sous-total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-warm-600">
            <span>Livraison</span>
            <span>{order.shippingCost > 0 ? formatPrice(order.shippingCost) : 'Gratuit'}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-prairie-600 pt-2 border-t border-warm-200">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-warm-100 rounded-xl p-4">
        <div className="flex items-center gap-2 text-warm-700">
          <Phone className="h-4 w-4" />
          <span>Une question ? </span>
          <a href="tel:+261380100101" className="font-medium text-prairie-600 hover:underline">
            038 01 001 01
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SuiviCommandePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50" />}>
      <SuiviCommandeContent />
    </Suspense>
  );
}
