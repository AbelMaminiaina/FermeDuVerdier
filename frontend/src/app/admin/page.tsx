'use client';

import React, { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des stats (à remplacer par un appel API)
    setTimeout(() => {
      setStats({
        totalOrders: 24,
        pendingOrders: 5,
        totalProducts: 35,
        lowStockProducts: 3,
      });
      setLoading(false);
    }, 500);
  }, []);

  const statCards = [
    {
      name: 'Commandes totales',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      href: '/admin/commandes',
    },
    {
      name: 'Commandes en attente',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      href: '/admin/commandes?status=pending',
    },
    {
      name: 'Produits',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-green-500',
      href: '/admin/stocks',
    },
    {
      name: 'Stock faible',
      value: stats.lowStockProducts,
      icon: Package,
      color: 'bg-red-500',
      href: '/admin/stocks?filter=low',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-warm-800 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-warm-600">{stat.name}</p>
                {loading ? (
                  <div className="h-8 w-16 bg-warm-200 animate-pulse rounded mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-warm-800">{stat.value}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-warm-800 mb-4">
            Actions rapides
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin/commandes"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-prairie-50 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-prairie-600" />
              <span className="text-warm-700">Gérer les commandes</span>
            </Link>
            <Link
              href="/admin/stocks"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-prairie-50 transition-colors"
            >
              <Package className="h-5 w-5 text-prairie-600" />
              <span className="text-warm-700">Gérer les stocks</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-warm-800 mb-4">
            Dernières commandes
          </h2>
          <div className="text-center py-8 text-warm-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Les commandes apparaîtront ici</p>
          </div>
        </div>
      </div>
    </div>
  );
}
