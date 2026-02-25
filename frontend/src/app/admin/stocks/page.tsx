'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Package, AlertTriangle, Save, Search } from 'lucide-react';
import { Button, Input } from '@/components/ui';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stockQuantity: number;
  inStock: boolean;
  images: string[];
}

export default function AdminStocksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/products`
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: string) => {
    const newQuantity = editingStock[productId];
    if (newQuantity === undefined) return;

    setSaving(productId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/products/${productId}/stock`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stockQuantity: newQuantity }),
        }
      );
      if (response.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, stockQuantity: newQuantity, inStock: newQuantity > 0 }
              : p
          )
        );
        setEditingStock((prev) => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setSaving(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockProducts = products.filter((p) => p.stockQuantity <= 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prairie-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-warm-800 mb-8">Gestion des stocks</h1>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Stock faible</p>
            <p className="text-sm text-yellow-700">
              {lowStockProducts.length} produit(s) ont un stock inférieur à 10 unités
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-400" />
          <Input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-warm-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-warm-700">
                  Produit
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-warm-700">
                  Catégorie
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-warm-700">
                  Prix
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-warm-700">
                  Stock actuel
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-warm-700">
                  Nouveau stock
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-warm-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-warm-50 ${
                    product.stockQuantity <= 10 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-warm-100">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <span className="font-medium text-warm-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-warm-600 capitalize">
                    {product.category.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-warm-800">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {product.stockQuantity <= 10 && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span
                        className={`font-medium ${
                          product.stockQuantity <= 10
                            ? 'text-yellow-600'
                            : 'text-warm-800'
                        }`}
                      >
                        {product.stockQuantity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Input
                      type="number"
                      min="0"
                      value={
                        editingStock[product.id] !== undefined
                          ? editingStock[product.id]
                          : product.stockQuantity
                      }
                      onChange={(e) =>
                        setEditingStock((prev) => ({
                          ...prev,
                          [product.id]: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-24"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingStock[product.id] !== undefined &&
                      editingStock[product.id] !== product.stockQuantity && (
                        <Button
                          size="sm"
                          onClick={() => updateStock(product.id)}
                          loading={saving === product.id}
                          icon={<Save className="h-4 w-4" />}
                        >
                          Sauvegarder
                        </Button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
