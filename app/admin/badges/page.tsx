// app/admin/badges/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon,
  TrophyIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  StarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  FireIcon,
  PencilSquareIcon,
  HandRaisedIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

// ============================================
// ICÔNES DISPONIBLES
// ============================================

const AVAILABLE_ICONS = [
  { value: 'star', label: 'Étoile', Icon: StarIcon },
  { value: 'trophy', label: 'Trophée', Icon: TrophyIcon },
  { value: 'fire', label: 'Feu', Icon: FireIcon },
  { value: 'pencil', label: 'Crayon', Icon: PencilSquareIcon },
  { value: 'hand-raised', label: 'Main levée', Icon: HandRaisedIcon },
  { value: 'code', label: 'Code', Icon: CodeBracketIcon },
  { value: 'shield', label: 'Bouclier', Icon: ShieldCheckIcon },
  { value: 'cpu', label: 'Processeur', Icon: CpuChipIcon },
  { value: 'rocket', label: 'Fusée', Icon: RocketLaunchIcon },
  { value: 'academic', label: 'Diplôme', Icon: AcademicCapIcon },
  { value: 'users', label: 'Utilisateurs', Icon: UserGroupIcon },
  { value: 'check', label: 'Vérifié', Icon: CheckCircleIcon },
];

const AVAILABLE_COLORS = [
  { value: 'blue', label: 'Bleu', class: 'bg-blue-100 text-blue-600' },
  { value: 'green', label: 'Vert', class: 'bg-green-100 text-green-600' },
  { value: 'yellow', label: 'Jaune', class: 'bg-yellow-100 text-yellow-600' },
  { value: 'red', label: 'Rouge', class: 'bg-red-100 text-red-600' },
  { value: 'purple', label: 'Violet', class: 'bg-purple-100 text-purple-600' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-100 text-orange-600' },
  { value: 'pink', label: 'Rose', class: 'bg-pink-100 text-pink-600' },
  { value: 'teal', label: 'Turquoise', class: 'bg-teal-100 text-teal-600' },
];

const AVAILABLE_CATEGORIES = [
  { value: 'communaute', label: 'Communauté' },
  { value: 'langage', label: 'Langage' },
  { value: 'developpement', label: 'Développement' },
  { value: 'securite', label: 'Sécurité' },
  { value: 'ia', label: 'Intelligence Artificielle' },
  { value: 'data', label: 'Data Science' },
  { value: 'projet', label: 'Projet' },
  { value: 'formation', label: 'Formation' },
  { value: 'general', label: 'Général' },
];

// ============================================
// COMPOSANT
// ============================================

interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  created_at: string;
}

export default function AdminBadgesPage() {
  const router = useRouter();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'star',
    color: 'blue',
    category: 'general',
  });

  useEffect(() => {
    checkAuth();
    fetchBadges();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    const role = userData?.role || 'MEMBRE';
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      router.push('/admin/login');
    }
  };

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('category')
        .order('name');

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({ 
      ...formData, 
      name,
      slug: generateSlug(name)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from('badges')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('badges')
          .insert(formData);
        if (error) throw error;
      }
      resetForm();
      fetchBadges();
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error.message || 'Erreur inconnue'}`);
    }
  };

  const handleEdit = (badge: Badge) => {
    setEditingId(badge.id);
    setFormData({
      name: badge.name,
      slug: badge.slug,
      description: badge.description,
      icon: badge.icon,
      color: badge.color,
      category: badge.category,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce badge ?')) return;
    try {
      const { error } = await supabase.from('badges').delete().eq('id', id);
      if (error) throw error;
      fetchBadges();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'star',
      color: 'blue',
      category: 'general',
    });
  };

  const getIconComponent = (iconName: string) => {
    const icon = AVAILABLE_ICONS.find(i => i.value === iconName);
    return icon ? icon.Icon : StarIcon;
  };

  const getColorClass = (color: string) => {
    const c = AVAILABLE_COLORS.find(i => i.value === color);
    return c ? c.class : 'bg-gray-100 text-gray-600';
  };

  const getCategoryLabel = (category: string) => {
    const c = AVAILABLE_CATEGORIES.find(i => i.value === category);
    return c ? c.label : category;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const SelectedIcon = getIconComponent(formData.icon);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="DigiCol" width={120} height={40} className="h-auto" />
            <span className="text-sm text-gray-400 hidden sm:inline">| Administration</span>
          </Link>
          <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
            <ArrowLeftIcon className="h-4 w-4" /> Retour
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <TrophyIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Gestion des badges</h1>
              <p className="text-sm text-gray-500">{badges.length} badge{badges.length > 1 ? 's' : ''} au total</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            {showForm ? (
              <>
                <XMarkIcon className="h-4 w-4" />
                Annuler
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Nouveau badge
              </>
            )}
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              {editingId ? 'Modifier le badge' : 'Nouveau badge'}
            </h2>

            {/* Aperçu du badge */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-500 mb-2">Aperçu :</p>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getColorClass(formData.color)}`}>
                <SelectedIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{formData.name || 'Nom du badge'}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du badge *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Ex: Contributeur Actif"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL unique)</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Comment obtenir ce badge ?"
                />
              </div>

              {/* Icônes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icône</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVAILABLE_ICONS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: value })}
                      className={`p-3 rounded-lg border-2 transition ${
                        formData.icon === value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      title={label}
                    >
                      <Icon className={`h-5 w-5 mx-auto ${
                        formData.icon === value ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Couleurs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map(({ value, label, class: colorClass }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: value })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition ${
                        formData.color === value
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-transparent'
                      } ${colorClass}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {AVAILABLE_CATEGORIES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                >
                  {editingId ? 'Mettre à jour' : 'Créer le badge'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des badges */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Badge</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Description</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Catégorie</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Slug</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {badges.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-12">
                      <TrophyIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>Aucun badge</p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="text-blue-600 hover:underline mt-2"
                      >
                        Créer le premier badge
                      </button>
                    </td>
                  </tr>
                ) : (
                  badges.map((badge) => {
                    const Icon = getIconComponent(badge.icon);
                    return (
                      <tr key={badge.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getColorClass(badge.color)}`}>
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{badge.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                          {badge.description}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {getCategoryLabel(badge.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                          {badge.slug}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(badge)}
                              className="text-blue-600 hover:text-blue-800 p-1 transition"
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(badge.id)}
                              className="text-red-600 hover:text-red-800 p-1 transition"
                              title="Supprimer"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}