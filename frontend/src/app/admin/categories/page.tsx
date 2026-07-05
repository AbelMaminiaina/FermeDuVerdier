'use client';

import React, { useEffect, useState } from 'react';
import {
  Folder,
  Plus,
  Edit2,
  Trash2,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Package,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; category?: Category } | null>(null);
  const [form, setForm] = useState({ name: '', description: '', image: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Open modal
  const openModal = (mode: 'add' | 'edit', category?: Category) => {
    if (mode === 'edit' && category) {
      setForm({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
        isActive: category.isActive,
      });
    } else {
      setForm({ name: '', description: '', image: '', isActive: true });
    }
    setError(null);
    setModal({ mode, category });
  };

  // Save category
  const saveCategory = async () => {
    if (!form.name.trim()) {
      setError('Le nom est requis');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const isEdit = modal?.mode === 'edit';
      const url = isEdit ? `${API_URL}/categories/${modal.category?.id}` : `${API_URL}/categories`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          image: form.image || null,
          isActive: form.isActive,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchCategories();
        setModal(null);
      } else {
        setError(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (e) {
      setError('Erreur de connexion');
      console.error('Error:', e);
    } finally {
      setSaving(false);
    }
  };

  // Delete category
  const deleteCategory = async (id: string, name: string, productCount: number) => {
    if (productCount > 0) {
      alert(`Impossible de supprimer "${name}" : ${productCount} produit(s) dans cette catégorie.`);
      return;
    }

    if (!confirm(`Supprimer la catégorie "${name}" ?`)) return;

    try {
      const res = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (e) {
      console.error('Error:', e);
    }
  };

  // Toggle active status
  const toggleActive = async (category: Category) => {
    try {
      const res = await fetch(`${API_URL}/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: category.name,
          description: category.description,
          image: category.image,
          isActive: !category.isActive,
        }),
      });

      if (res.ok) {
        setCategories(prev =>
          prev.map(c => c.id === category.id ? { ...c, isActive: !c.isActive } : c)
        );
      }
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
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-warm-800">Gestion des catégories</h1>
        <Button onClick={() => openModal('add')} icon={<Plus className="h-4 w-4" />}>
          <span className="hidden sm:inline">Ajouter</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-warm-500">Total</p>
          <p className="text-2xl font-bold text-warm-800">{categories.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-green-600">Actives</p>
          <p className="text-2xl font-bold text-green-700">
            {categories.filter(c => c.isActive).length}
          </p>
        </div>
      </div>

      {/* Categories list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-warm-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-warm-700">Catégorie</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-warm-700">Slug</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-warm-700">Produits</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-warm-700">Statut</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-warm-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {categories.map(category => (
                <tr key={category.id} className={!category.isActive ? 'bg-warm-50 opacity-60' : ''}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-prairie-100 flex items-center justify-center shrink-0">
                        <Folder className="h-5 w-5 text-prairie-600" />
                      </div>
                      <div>
                        <p className="font-medium text-warm-800">{category.name}</p>
                        {category.description && (
                          <p className="text-xs text-warm-500 truncate max-w-[200px]">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-warm-600 font-mono">{category.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-warm-100 text-warm-700 text-sm">
                      <Package className="h-3 w-3" />
                      {category._count?.products || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(category)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                        category.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-warm-200 text-warm-500'
                      }`}
                    >
                      {category.isActive ? (
                        <>
                          <Eye className="h-3 w-3" /> Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" /> Masquée
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openModal('edit', category)}
                        className="p-2 hover:bg-warm-100 rounded"
                      >
                        <Edit2 className="h-4 w-4 text-prairie-600" />
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id, category.name, category._count?.products || 0)}
                        className="p-2 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {categories.length === 0 && (
          <p className="p-8 text-center text-warm-500">Aucune catégorie</p>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-warm-800">
                {modal.mode === 'edit' ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-warm-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-1">
                  Nom de la catégorie *
                </label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Oeufs frais"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-warm-300 rounded-lg focus:ring-2 focus:ring-prairie-500 outline-none resize-none"
                  placeholder="Description optionnelle..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-warm-700 mb-1">
                  Image (URL)
                </label>
                <Input
                  value={form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-warm-300 text-prairie-600 focus:ring-prairie-500"
                />
                <label htmlFor="isActive" className="text-sm text-warm-700">
                  Catégorie visible sur le site
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-warm-50 rounded-b-2xl">
              <Button variant="outline" onClick={() => setModal(null)}>
                Annuler
              </Button>
              <Button onClick={saveCategory} loading={saving} disabled={!form.name.trim()}>
                {modal.mode === 'edit' ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
