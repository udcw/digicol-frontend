// app/admin/community/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  EyeSlashIcon,
  EyeIcon,
  TrashIcon,
  StarIcon,
  PlusIcon,
  PaperAirplaneIcon,
  PencilIcon,
  XMarkIcon,
  PhotoIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Post {
  id: number;
  content: string;
  image: string | null;
  likes: number;
  is_pinned: boolean;
  is_hidden: boolean;
  created_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    email: string;
  };
  comments_count?: number;
}

export default function AdminCommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    content: '',
    image: '',
    is_pinned: false,
  });
  const [stats, setStats] = useState({
    total: 0,
    pinned: 0,
    hidden: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchPosts();
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

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user:users(id, username, full_name, email)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithCounts = await Promise.all(
        (data || []).map(async (post: any) => {
          const { count } = await supabase
            .from('community_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);
          return { ...post, comments_count: count || 0 };
        })
      );

      setPosts(postsWithCounts);

      const total = postsWithCounts.length;
      const pinned = postsWithCounts.filter((p: Post) => p.is_pinned).length;
      const hidden = postsWithCounts.filter((p: Post) => p.is_hidden).length;
      const totalLikes = postsWithCounts.reduce((sum: number, p: Post) => sum + (p.likes || 0), 0);
      const totalComments = postsWithCounts.reduce((sum: number, p: Post) => sum + (p.comments_count || 0), 0);

      setStats({ total, pinned, hidden, totalLikes, totalComments });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // OUVRIR LE FORMULAIRE
  // ============================================
  const openNewForm = () => {
    setEditingId(null);
    setFormData({
      content: '',
      image: '',
      is_pinned: false,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================
  // CRÉER / MODIFIER UN POST
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      alert('Veuillez écrire un message');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (editingId) {
        const { error } = await supabase
          .from('community_posts')
          .update({
            content: formData.content.trim(),
            image: formData.image || null,
            is_pinned: formData.is_pinned,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_posts')
          .insert({
            user_id: session.user.id,
            content: formData.content.trim(),
            image: formData.image || null,
            likes: 0,
            is_pinned: formData.is_pinned,
            is_hidden: false,
          });

        if (error) throw error;
      }

      resetForm();
      fetchPosts();
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(`Erreur: ${error.message || 'Erreur inconnue'}`);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setFormData({
      content: post.content,
      image: post.image || '',
      is_pinned: post.is_pinned,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      content: '',
      image: '',
      is_pinned: false,
    });
  };

  // ============================================
  // ACTIONS MODÉRATION
  // ============================================
  const handlePin = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ is_pinned: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'épinglage');
    }
  };

  const handleHide = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ is_hidden: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette publication ? Cette action est irréversible.')) return;
    try {
      const { error } = await supabase.from('community_posts').delete().eq('id', id);
      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredPosts = filter === 'all'
    ? posts
    : filter === 'pinned'
    ? posts.filter(p => p.is_pinned)
    : filter === 'hidden'
    ? posts.filter(p => p.is_hidden)
    : posts;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="DigiCol" width={120} height={40} className="h-auto" />
            <span className="text-sm text-gray-400 hidden sm:inline">| Administration</span>
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Retour
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* En-tête avec bouton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Gestion de la communauté</h1>
              <p className="text-sm text-gray-500">{stats.total} publication{stats.total > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={openNewForm}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvelle publication
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-500 font-medium">Total</p>
            <p className="text-xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-500 font-medium">Épinglés</p>
            <p className="text-xl font-bold text-yellow-600">{stats.pinned}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-500 font-medium">Masqués</p>
            <p className="text-xl font-bold text-red-600">{stats.hidden}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-500 font-medium">Likes</p>
            <p className="text-xl font-bold text-pink-600">{stats.totalLikes}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-500 font-medium">Commentaires</p>
            <p className="text-xl font-bold text-blue-600">{stats.totalComments}</p>
          </div>
        </div>

        {/* ============================================ */}
        {/* FORMULAIRE DE PUBLICATION */}
        {/* ============================================ */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {editingId ? (
                  <>
                    <PencilIcon className="h-5 w-5 text-blue-600" />
                    Modifier la publication
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-5 w-5 text-blue-600" />
                    Nouvelle publication
                  </>
                )}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 p-1 transition"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu de la publication *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Écrivez votre annonce, challenge, question ou ressource..."
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  {formData.content.length} caractères
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'image (optionnel)
                </label>
                <div className="relative">
                  <PhotoIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_pinned}
                    onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                    className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                  />
                  <StarIcon className="h-4 w-4 text-yellow-600" />
                  Épingler cette publication
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  {editingId ? 'Mettre à jour' : 'Publier'}
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

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Toutes ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pinned')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'pinned' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Épinglées ({stats.pinned})
          </button>
          <button
            onClick={() => setFilter('hidden')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'hidden' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Masquées ({stats.hidden})
          </button>
        </div>

        {/* Liste des publications */}
        <div className="space-y-3">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <UserGroupIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucune publication</p>
              <button
                onClick={openNewForm}
                className="text-blue-600 hover:underline mt-2"
              >
                Créer la première publication
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className={`bg-white rounded-xl shadow-sm border p-4 ${
                  post.is_hidden
                    ? 'border-red-200 opacity-70'
                    : post.is_pinned
                    ? 'border-yellow-200'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                      {post.user?.full_name?.charAt(0) || post.user?.username?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-slate-800 text-sm">
                          {post.user?.full_name || post.user?.username || 'Inconnu'}
                        </p>
                        {post.is_pinned && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <StarIcon className="h-3 w-3" />
                            Épinglé
                          </span>
                        )}
                        {post.is_hidden && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <EyeSlashIcon className="h-3 w-3" />
                            Masqué
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {formatDate(post.created_at)}
                      </p>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{post.content}</p>

                      {post.image && (
                        <div className="mt-3 rounded-lg overflow-hidden">
                          <img
                            src={post.image}
                            alt="Publication"
                            className="w-full max-h-64 object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <HeartIcon className="h-3 w-3" />
                          {post.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleLeftIcon className="h-3 w-3" />
                          {post.comments_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                      title="Modifier"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handlePin(post.id, post.is_pinned)}
                      className={`p-2 rounded-lg transition ${
                        post.is_pinned
                          ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                          : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                      title={post.is_pinned ? 'Désépingler' : 'Épingler'}
                    >
                      <StarIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleHide(post.id, post.is_hidden)}
                      className={`p-2 rounded-lg transition ${
                        post.is_hidden
                          ? 'text-green-600 bg-green-50 hover:bg-green-100'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title={post.is_hidden ? 'Afficher' : 'Masquer'}
                    >
                      {post.is_hidden ? (
                        <EyeIcon className="h-5 w-5" />
                      ) : (
                        <EyeSlashIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ============================================ */}
        {/* BOUTON FLOTTANT (toujours visible) */}
        {/* ============================================ */}
        <button
          onClick={openNewForm}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition z-50 flex items-center gap-2"
          title="Nouvelle publication"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </main>
    </div>
  );
}