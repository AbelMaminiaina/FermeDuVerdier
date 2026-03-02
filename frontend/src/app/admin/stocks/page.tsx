'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import {
  Package,
  AlertTriangle,
  Save,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  inStock: boolean;
  images: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const CATEGORIES: Record<string, string> = {
  porc: 'Porc',
  poulet: 'Poulet',
  poisson: 'Poisson',
  akanga: 'Akanga',
  caille: 'Caille',
  transformes: 'Transformés',
  oeufs_frais: 'Oeufs frais',
  oeufs_fecondes: 'Oeufs fécondés',
  poules: 'Poules',
  accessoires: 'Accessoires',
};

export default function AdminStocksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  // Stock editing
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [savingStock, setSavingStock] = useState<string | null>(null);

  // Modal
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; product?: Product } | null>(null);
  const [form, setForm] = useState({ name: '', description: '', category: 'poulet', price: 0, stockQuantity: 0, images: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products?inStock=false`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'all' || p.category === category;
      return matchSearch && matchCategory;
    });
  }, [products, search, category]);

  // Stats
  const stats = useMemo(() => ({
    total: products.length,
    inStock: products.filter(p => p.inStock).length,
    lowStock: products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length,
    outOfStock: products.filter(p => !p.inStock).length,
  }), [products]);

  // Save stock
  const saveStock = async (id: string) => {
    const qty = stockEdits[id];
    if (qty === undefined) return;

    setSavingStock(id);
    try {
      const res = await fetch(`${API_URL}/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: qty }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stockQuantity: qty, inStock: qty > 0 } : p));
        setStockEdits(prev => { const n = { ...prev }; delete n[id]; return n; });
      }
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setSavingStock(null);
    }
  };

  // Open modal
  const openModal = (mode: 'add' | 'edit', product?: Product) => {
    if (mode === 'edit' && product) {
      setForm({
        name: product.name,
        description: product.description || '',
        category: product.category,
        price: product.price,
        stockQuantity: product.stockQuantity,
        images: product.images?.join('\n') || '',
      });
    } else {
      setForm({ name: '', description: '', category: 'poulet', price: 0, stockQuantity: 0, images: '' });
    }
    setModal({ mode, product });
  };

  // Save product
  const saveProduct = async () => {
    setSaving(true);
    const images = form.images.split('\n').map(s => s.trim()).filter(Boolean);
    const body = { ...form, images };

    try {
      const isEdit = modal?.mode === 'edit';
      const url = isEdit ? `${API_URL}/products/${modal.product?.id}` : `${API_URL}/products`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchProducts();
        setModal(null);
      }
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
      if (res.ok) setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error('Error:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prairie-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-warm-800">Gestion des stocks</h1>
        <Button onClick={() => openModal('add')} icon={<Plus className="h-4 w-4" />}>
          Ajouter
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, bg: 'bg-white' },
          { label: 'En stock', value: stats.inStock, bg: 'bg-green-50 text-green-700' },
          { label: 'Stock faible', value: stats.lowStock, bg: 'bg-yellow-50 text-yellow-700' },
          { label: 'Rupture', value: stats.outOfStock, bg: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 shadow-sm ${s.bg}`}>
            <p className="text-sm opacity-80">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-400" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-4 py-2 border border-warm-300 rounded-lg"
        >
          <option value="all">Toutes catégories</option>
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-warm-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-warm-700">Produit</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-warm-700">Catégorie</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-warm-700">Prix</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-warm-700">Stock</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-warm-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100">
            {filtered.map(p => (
              <tr key={p.id} className={p.stockQuantity === 0 ? 'bg-red-50' : p.stockQuantity <= 10 ? 'bg-yellow-50' : ''}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-warm-100 shrink-0">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt="" width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <Package className="w-full h-full p-2 text-warm-400" />
                      )}
                    </div>
                    <span className="font-medium text-warm-800">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-warm-600">{CATEGORIES[p.category] || p.category}</td>
                <td className="px-4 py-3 text-sm font-medium">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {p.stockQuantity <= 10 && p.stockQuantity > 0 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    <input
                      type="number"
                      min="0"
                      value={stockEdits[p.id] ?? p.stockQuantity}
                      onChange={e => setStockEdits(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                      className="w-16 px-2 py-1 border rounded text-center"
                    />
                    {stockEdits[p.id] !== undefined && stockEdits[p.id] !== p.stockQuantity && (
                      <Button size="sm" onClick={() => saveStock(p.id)} loading={savingStock === p.id} icon={<Save className="h-3 w-3" />}>
                        OK
                      </Button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openModal('edit', p)} className="p-2 hover:bg-warm-100 rounded">
                      <Edit2 className="h-4 w-4 text-prairie-600" />
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 hover:bg-red-50 rounded">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-warm-500">Aucun produit trouvé</p>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b">
              <h2 className="text-lg md:text-xl font-bold text-warm-800">
                {modal.mode === 'edit' ? 'Modifier le produit' : 'Ajouter un produit'}
              </h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-warm-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-4 md:px-6 md:py-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-warm-700 mb-1">Nom du produit *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-warm-300 rounded-lg focus:ring-2 focus:ring-prairie-500 focus:border-prairie-500 outline-none"
                      placeholder="Ex: Poulet fermier entier"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-warm-700 mb-1">Catégorie</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-warm-300 rounded-lg focus:ring-2 focus:ring-prairie-500 outline-none"
                    >
                      {Object.entries(CATEGORIES).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-warm-700 mb-1">Prix (Ar) *</label>
                      <input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-warm-300 rounded-lg focus:ring-2 focus:ring-prairie-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-warm-700 mb-1">Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={form.stockQuantity}
                        onChange={e => setForm(f => ({ ...f, stockQuantity: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-warm-300 rounded-lg focus:ring-2 focus:ring-prairie-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-warm-700 mb-1">Images (URLs, une par ligne)</label>
                    <textarea
                      value={form.images}
                      onChange={e => setForm(f => ({ ...f, images: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-warm-300 rounded-lg focus:ring-2 focus:ring-prairie-500 outline-none resize-none font-mono text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                {/* Right column - Description */}
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-warm-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full flex-1 min-h-[180px] lg:min-h-0 px-3 py-2 md:px-4 md:py-2.5 border border-warm-300 rounded-lg focus:ring-2 focus:ring-prairie-500 outline-none resize-none"
                    placeholder="Décrivez le produit en détail..."
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-4 py-3 md:px-6 md:py-4 border-t bg-warm-50 rounded-b-2xl">
              <Button variant="outline" onClick={() => setModal(null)}>Annuler</Button>
              <Button onClick={saveProduct} loading={saving} disabled={!form.name || form.price <= 0}>
                {modal.mode === 'edit' ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
