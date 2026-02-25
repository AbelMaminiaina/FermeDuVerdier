'use client';

import React, { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Eye, Check, Truck, X } from 'lucide-react';
import { Button } from '@/components/ui';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'En préparation', color: 'bg-purple-100 text-purple-800' },
  shipped: { label: 'Expédiée', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/checkout/orders`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/checkout/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (response.ok) {
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prairie-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-warm-800 mb-8">Gestion des commandes</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-warm-600">Aucune commande pour le moment</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-warm-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-warm-700">
                    N° Commande
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-warm-700">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-warm-700">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-warm-700">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-warm-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-warm-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-warm-50">
                    <td className="px-6 py-4 text-sm font-medium text-warm-800">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-warm-800">
                        {order.customerName}
                      </p>
                      <p className="text-sm text-warm-500">{order.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          statusLabels[order.status]?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-warm-800">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-warm-600">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-prairie-50 rounded-lg transition-colors"
                        title="Voir détails"
                      >
                        <Eye className="h-5 w-5 text-prairie-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-warm-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-warm-800">
                  Commande {selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-warm-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Client info */}
              <div>
                <h3 className="font-semibold text-warm-800 mb-2">Client</h3>
                <p className="text-warm-700">{selectedOrder.customerName}</p>
                <p className="text-warm-600">{selectedOrder.customerEmail}</p>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-warm-800 mb-2">Articles</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-warm-100"
                    >
                      <div>
                        <p className="text-warm-800">{item.name}</p>
                        <p className="text-sm text-warm-500">Qté: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-warm-800">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 font-bold">
                  <span>Total</span>
                  <span className="text-prairie-600">
                    {formatPrice(selectedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Status actions */}
              <div>
                <h3 className="font-semibold text-warm-800 mb-3">Changer le statut</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                    icon={<Check className="h-4 w-4" />}
                  >
                    Confirmer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                  >
                    En préparation
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                    icon={<Truck className="h-4 w-4" />}
                  >
                    Expédier
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                  >
                    Livrée
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
