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
  CheckCircle,
  XCircle,
  EyeOff,
  Eye,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useCategories, Category, invalidateCategoriesCache } from '@/hooks/useCategories';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  stockQuantity: number;
  inStock: boolean;
  isActive: boolean;
  images: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function AdminStocksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  // Catégories dynamiques
  const { categories, loading: categoriesLoading } = useCategories();

  // Créer un map slug -> name pour l'affichage
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(c => {
      map[c.slug] = c.name;
      // Aussi mapper avec underscores pour compatibilité
      map[c.slug.replace(/-/g, '_')] = c.name;
    });
    return map;
  }, [categories]);

  // Stock editing
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [savingStock, setSavingStock] = useState<string | null>(null);

  // Modal
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; product?: Product } | null>(null);
  const [form, setForm] = useState({ name: '', description: '', category: '', price: 0, stockQuantity: 0, images: '' });
  const [saving, setSaving] = useState(false);

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{ product: Product; hasOrders: boolean; ordersCount: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [checkingOrders, setCheckingOrders] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // includeInactive=true pour afficher tous les produits dans l'admin
      const res = await fetch(`${API_URL}/products?includeInactive=true`);
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
      // Normaliser les catégories pour la comparaison
      const productCat = p.category.replace(/-/g, '_');
      const filterCat = category.replace(/-/g, '_');
      const matchCategory = category === 'all' || productCat === filterCat;
      return matchSearch && matchCategory;
    });
  }, [products, search, category]);

  // Stats
  const stats = useMemo(() => ({
    total: products.length,
    inStock: products.filter(p => p.inStock && p.isActive).length,
    lowStock: products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10 && p.isActive).length,
    outOfStock: products.filter(p => !p.inStock && p.isActive).length,
    hidden: products.filter(p => !p.isActive).length,
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

  // Helper to convert category format (API uses dashes, form/DB uses underscores)
  const categoryToForm = (cat: string) => cat.replace(/-/g, '_');

  // Get category display name
  const getCategoryName = (cat: string) => {
    const normalized = categoryToForm(cat);
    return categoryMap[normalized] || categoryMap[cat] || cat;
  };

  // Edit restriction modal for products with orders
  const [editRestrictionModal, setEditRestrictionModal] = useState<{ product: Product; ordersCount: number } | null>(null);

  // Open modal
  const openModal = async (mode: 'add' | 'edit', product?: Product) => {
    if (mode === 'edit' && product) {
      // Check if product has orders before allowing edit
      try {
        const res = await fetch(`${API_URL}/products/${product.id}/has-orders`);
        const data = await res.json();

        if (data.hasOrders) {
          setEditRestrictionModal({ product, ordersCount: data.ordersCount });
          return;
        }
      } catch (e) {
        // En cas d'erreur, permettre l'édition
      }

      setForm({
        name: product.name,
        description: product.description || '',
        category: categoryToForm(product.category),
        price: product.price,
        stockQuantity: product.stockQuantity,
        images: product.images?.join('\n') || '',
      });
    } else {
      const defaultCategory = categories.length > 0 ? categories[0].slug.replace(/-/g, '_') : 'poulet';
      setForm({ name: '', description: '', category: defaultCategory, price: 0, stockQuantity: 0, images: '' });
    }
    setModal({ mode, product });
  };

  // Create new product based on existing one
  const duplicateProduct = (product: Product) => {
    setEditRestrictionModal(null);
    const defaultCategory = categories.length > 0 ? categories[0].slug.replace(/-/g, '_') : 'poulet';
    setForm({
      name: product.name + ' (copie)',
      description: product.description || '',
      category: categoryToForm(product.category),
      price: product.price,
      stockQuantity: 0,
      images: product.images?.join('\n') || '',
    });
    setModal({ mode: 'add' });
  };

  // Toggle product visibility
  const [hidingProduct, setHidingProduct] = useState(false);
  const toggleVisibility = async (product: Product, makeActive: boolean) => {
    setHidingProduct(true);
    try {
      const res = await fetch(`${API_URL}/products/${product.id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: makeActive }),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => prev.map(p =>
          p.id === product.id ? { ...p, isActive: makeActive } : p
        ));
        setToast({ type: 'success', message: data.message });
        setEditRestrictionModal(null);
      }
    } catch (e) {
      setToast({ type: 'error', message: 'Erreur lors de la mise à jour' });
    } finally {
      setHidingProduct(false);
    }
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

  // Open delete modal with order check
  const openDeleteModal = async (product: Product) => {
    setCheckingOrders(true);
    try {
      const res = await fetch(`${API_URL}/products/${product.id}/has-orders`);
      const data = await res.json();
      setDeleteModal({
        product,
        hasOrders: data.hasOrders || false,
        ordersCount: data.ordersCount || 0
      });
    } catch (e) {
      // En cas d'erreur, ouvrir quand même le modal sans info
      setDeleteModal({ product, hasOrders: false, ordersCount: 0 });
    } finally {
      setCheckingOrders(false);
    }
  };

  // Delete product
  const confirmDelete = async () => {
    if (!deleteModal) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/products/${deleteModal.product.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== deleteModal.product.id));
        setToast({
          type: 'success',
          message: data.message || `"${deleteModal.product.name}" a été supprimé avec succès`
        });
      } else {
        setToast({
          type: 'error',
          message: data.error || 'Erreur lors de la suppression'
        });
      }
    } catch (e) {
      setToast({ type: 'error', message: 'Erreur de connexion au serveur' });
    } finally {
      setDeleting(false);
      setDeleteModal(null);
    }
  };

  if (loading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prairie-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-warm-800">Gestion des stocks</h1>
        <Button onClick={() => openModal('add')} icon={<Plus className="h-4 w-4" />} className="shrink-0">
          <span className="hidden sm:inline">Ajouter</span>
          <span className="sm:hidden">+</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, bg: 'bg-white' },
          { label: 'En stock', value: stats.inStock, bg: 'bg-green-50 text-green-700' },
          { label: 'Stock faible', value: stats.lowStock, bg: 'bg-yellow-50 text-yellow-700' },
          { label: 'Rupture', value: stats.outOfStock, bg: 'bg-red-50 text-red-700' },
          { label: 'Masqués', value: stats.hidden, bg: 'bg-gray-100 text-gray-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 shadow-sm ${s.bg}`}>
            <p className="text-sm opacity-80">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1 sm:max-w-xs">
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
          {categories.filter(c => c.isActive).map(c => (
            <option key={c.id} value={c.slug.replace(/-/g, '_')}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
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
              <tr key={p.id} className={`${!p.isActive ? 'bg-gray-100 opacity-60' : p.stockQuantity === 0 ? 'bg-red-50' : p.stockQuantity <= 10 ? 'bg-yellow-50' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-warm-100 shrink-0 relative">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt="" width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <Package className="w-full h-full p-2 text-warm-400" />
                      )}
                      {!p.isActive && (
                        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                          <EyeOff className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-warm-800">{p.name}</span>
                      {!p.isActive && (
                        <span className="ml-2 text-xs bg-gray-500 text-white px-2 py-0.5 rounded">Masqué</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-warm-600">{getCategoryName(p.category)}</td>
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
                    <button
                      onClick={() => toggleVisibility(p, !p.isActive)}
                      disabled={hidingProduct}
                      className={`p-2 rounded ${p.isActive ? 'hover:bg-amber-50' : 'hover:bg-green-50'}`}
                      title={p.isActive ? 'Masquer du catalogue' : 'Remettre dans le catalogue'}
                    >
                      {p.isActive ? (
                        <EyeOff className="h-4 w-4 text-amber-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-green-600" />
                      )}
                    </button>
                    <button onClick={() => openModal('edit', p)} className="p-2 hover:bg-warm-100 rounded">
                      <Edit2 className="h-4 w-4 text-prairie-600" />
                    </button>
                    <button onClick={() => openDeleteModal(p)} disabled={checkingOrders} className="p-2 hover:bg-red-50 rounded disabled:opacity-50">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <p className="p-8 text-center text-warm-500">Aucun produit trouvé</p>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-5xl my-2 md:my-4 max-h-[95vh] md:max-h-[90vh] flex flex-col">
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
            <div className="px-4 py-4 md:px-6 md:py-5 overflow-y-auto flex-1">
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
                      {categories.filter(c => c.isActive).map(c => (
                        <option key={c.id} value={c.slug.replace(/-/g, '_')}>{c.name}</option>
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
                    <label className="block text-sm font-semibold text-warm-700 mb-1">Images</label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-warm-300 rounded-lg cursor-pointer hover:border-prairie-500 hover:bg-prairie-50 transition-colors">
                          <Plus className="h-5 w-5 text-warm-500" />
                          <span className="text-sm text-warm-600">Parcourir les fichiers</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files) {
                                Array.from(files).forEach(file => {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const base64 = event.target?.result as string;
                                    setForm(f => ({
                                      ...f,
                                      images: f.images ? f.images + '\n' + base64 : base64
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                });
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                      <textarea
                        value={form.images}
                        onChange={e => setForm(f => ({ ...f, images: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-warm-300 rounded-lg focus:ring-2 focus:ring-prairie-500 outline-none resize-none font-mono text-xs"
                        placeholder="URLs des images (une par ligne) ou utilisez le bouton ci-dessus"
                      />
                      {form.images && (
                        <div className="flex flex-wrap gap-2">
                          {form.images.split('\n').filter(Boolean).slice(0, 4).map((img, i) => (
                            <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-warm-100 relative">
                              <Image
                                src={img}
                                alt=""
                                fill
                                className="object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            </div>
                          ))}
                          {form.images.split('\n').filter(Boolean).length > 4 && (
                            <div className="w-16 h-16 rounded-lg bg-warm-200 flex items-center justify-center text-sm text-warm-600">
                              +{form.images.split('\n').filter(Boolean).length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 px-4 py-3 md:px-6 md:py-4 border-t bg-warm-50 rounded-b-2xl shrink-0">
              <Button variant="outline" onClick={() => setModal(null)} className="w-full sm:w-auto">Annuler</Button>
              <Button onClick={saveProduct} loading={saving} disabled={!form.name || form.price <= 0} className="w-full sm:w-auto">
                {modal.mode === 'edit' ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className="pt-6 pb-2 flex justify-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                deleteModal.hasOrders ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                {deleteModal.hasOrders ? (
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                ) : (
                  <Trash2 className="h-8 w-8 text-red-600" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 text-center">
              <h3 className="text-xl font-bold text-warm-800 mb-2">
                {deleteModal.hasOrders ? 'Attention' : 'Confirmer la suppression'}
              </h3>

              {deleteModal.hasOrders ? (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-amber-800 font-medium mb-1">
                      Ce produit est lié à {deleteModal.ordersCount} commande{deleteModal.ordersCount > 1 ? 's' : ''}
                    </p>
                    <p className="text-amber-700 text-sm">
                      Il ne peut pas être supprimé définitivement. Il sera <strong>désactivé</strong> et masqué du catalogue.
                    </p>
                  </div>
                  <p className="text-warm-600">
                    Voulez-vous désactiver{' '}
                    <span className="font-semibold text-warm-800">"{deleteModal.product.name}"</span> ?
                  </p>
                </>
              ) : (
                <>
                  <p className="text-warm-600">
                    Voulez-vous vraiment supprimer{' '}
                    <span className="font-semibold text-warm-800">"{deleteModal.product.name}"</span> ?
                  </p>
                  <p className="text-sm text-warm-500 mt-2">
                    Cette action est irréversible.
                  </p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-4 bg-warm-50">
              <Button
                variant="outline"
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                className="flex-1"
              >
                Annuler
              </Button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  deleteModal.hasOrders
                    ? 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400'
                    : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                }`}
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {deleteModal.hasOrders ? 'Désactivation...' : 'Suppression...'}
                  </>
                ) : (
                  <>
                    {deleteModal.hasOrders ? (
                      <>
                        <XCircle className="h-4 w-4" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Restriction Modal */}
      {editRestrictionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className="pt-6 pb-2 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 text-center">
              <h3 className="text-xl font-bold text-warm-800 mb-2">Modification impossible</h3>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-medium mb-1">
                  Ce produit est lié à {editRestrictionModal.ordersCount} commande{editRestrictionModal.ordersCount > 1 ? 's' : ''}
                </p>
                <p className="text-blue-700 text-sm">
                  Pour garantir l'intégrité des historiques de commandes, ce produit ne peut plus être modifié.
                </p>
              </div>

              <p className="text-warm-600 mb-2">
                <span className="font-semibold text-warm-800">"{editRestrictionModal.product.name}"</span>
              </p>
              <p className="text-sm text-warm-500">
                Vous pouvez créer un nouveau produit basé sur celui-ci.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 px-6 py-4 bg-warm-50">
              <button
                onClick={() => duplicateProduct(editRestrictionModal.product)}
                className="w-full px-4 py-2.5 bg-prairie-600 hover:bg-prairie-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Créer un nouveau produit (copie)
              </button>
              <button
                onClick={() => toggleVisibility(editRestrictionModal.product, !editRestrictionModal.product.isActive)}
                disabled={hidingProduct}
                className={`w-full px-4 py-2.5 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  editRestrictionModal.product.isActive
                    ? 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400'
                    : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                }`}
              >
                {hidingProduct ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {editRestrictionModal.product.isActive ? 'Masquage...' : 'Activation...'}
                  </>
                ) : editRestrictionModal.product.isActive ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Masquer du catalogue
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Remettre dans le catalogue
                  </>
                )}
              </button>
              <Button
                variant="outline"
                onClick={() => setEditRestrictionModal(null)}
                className="w-full"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0" />
            )}
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
