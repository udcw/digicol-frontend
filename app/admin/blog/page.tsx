// app/admin/blog/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeftIcon, 
  NewspaperIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string | null;
  author_id: string;
  category: string;
  tags: string[];
  reading_time: number;
  is_published: boolean;
  view_count: number;
  likes_count: number;
  published_at: string;
  created_at: string;
  author?: {
    id: string;
    username: string;
    full_name: string;
  };
  comments_count?: number;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    mostViewed: null as BlogPost | null,
    mostLiked: null as BlogPost | null,
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
      // Récupérer les articles avec les compteurs de commentaires
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:users(id, username, full_name),
          comments:blog_comments(count)
        `)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;

      const postsWithComments = data?.map((post: any) => ({
        ...post,
        comments_count: post.comments?.[0]?.count || 0,
      })) || [];

      setPosts(postsWithComments);

      // Calculer les statistiques
      const total = postsWithComments.length;
      const published = postsWithComments.filter((p: BlogPost) => p.is_published).length;
      const draft = postsWithComments.filter((p: BlogPost) => !p.is_published).length;
      const totalViews = postsWithComments.reduce((sum: number, p: BlogPost) => sum + (p.view_count || 0), 0);
      const totalLikes = postsWithComments.reduce((sum: number, p: BlogPost) => sum + (p.likes_count || 0), 0);
      const totalComments = postsWithComments.reduce((sum: number, p: BlogPost) => sum + (p.comments_count || 0), 0);

      // Article le plus vu
      const mostViewed = postsWithComments.length > 0 
        ? postsWithComments.reduce((a: BlogPost, b: BlogPost) => (a.view_count || 0) > (b.view_count || 0) ? a : b)
        : null;

      // Article le plus liké
      const mostLiked = postsWithComments.length > 0 
        ? postsWithComments.reduce((a: BlogPost, b: BlogPost) => (a.likes_count || 0) > (b.likes_count || 0) ? a : b)
        : null;

      setStats({
        total,
        published,
        draft,
        totalViews,
        totalLikes,
        totalComments,
        mostViewed,
        mostLiked,
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    fetchPosts();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' 
      ? <ArrowUpIcon className="h-3 w-3 inline ml-1" />
      : <ArrowDownIcon className="h-3 w-3 inline ml-1" />;
  };

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
          <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
            <ArrowLeftIcon className="h-4 w-4" /> Retour
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <NewspaperIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Gestion du blog</h1>
              <p className="text-sm text-gray-500">{stats.total} article{stats.total > 1 ? 's' : ''} au total</p>
            </div>
          </div>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            <PlusIcon className="h-4 w-4" /> Nouvel article
          </Link>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Total articles</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-green-600">{stats.published} publiés</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{stats.draft} brouillons</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Total vues</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
            {stats.mostViewed && (
              <p className="text-xs text-gray-400 truncate">
                Top: {stats.mostViewed.title}
              </p>
            )}
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Total likes</p>
            <p className="text-2xl font-bold text-red-600">{stats.totalLikes}</p>
            {stats.mostLiked && (
              <p className="text-xs text-gray-400 truncate">
                Top: {stats.mostLiked.title}
              </p>
            )}
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Total commentaires</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalComments}</p>
          </div>
        </div>

        {/* Liste des articles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th 
                    className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('title')}
                  >
                    Titre {getSortIcon('title')}
                  </th>
                  <th 
                    className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('category')}
                  >
                    Catégorie {getSortIcon('category')}
                  </th>
                  <th 
                    className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('view_count')}
                  >
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-3 w-3" />
                      Vues {getSortIcon('view_count')}
                    </div>
                  </th>
                  <th 
                    className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('likes_count')}
                  >
                    <div className="flex items-center gap-1">
                      <HeartIcon className="h-3 w-3" />
                      Likes {getSortIcon('likes_count')}
                    </div>
                  </th>
                  <th 
                    className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('comments_count')}
                  >
                    <div className="flex items-center gap-1">
                      <ChatBubbleLeftIcon className="h-3 w-3" />
                      Commentaires {getSortIcon('comments_count')}
                    </div>
                  </th>
                  <th 
                    className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('created_at')}
                  >
                    Date {getSortIcon('created_at')}
                  </th>
                  <th 
                    className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('is_published')}
                  >
                    Statut {getSortIcon('is_published')}
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-500 py-12">
                      <NewspaperIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>Aucun article</p>
                      <Link href="/admin/blog/new" className="text-blue-600 hover:underline mt-2 inline-block">
                        Créer le premier article
                      </Link>
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-800 line-clamp-1">{post.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{post.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {post.category || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {post.view_count || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        <span className="flex items-center justify-center gap-1">
                          <HeartSolidIcon className="h-3 w-3 text-red-500" />
                          {post.likes_count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        {post.comments_count || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(post.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          post.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {post.is_published ? 'Publié' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-gray-500 hover:text-gray-700 p-1 transition"
                            title="Voir"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="text-blue-600 hover:text-blue-800 p-1 transition"
                            title="Modifier"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleTogglePublish(post.id, post.is_published)}
                            className={`p-1 transition ${
                              post.is_published ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'
                            }`}
                            title={post.is_published ? 'Retirer de la publication' : 'Publier'}
                          >
                            {post.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-600 hover:text-red-800 p-1 transition"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Résumé des statistiques */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Résumé des statistiques</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total vues</p>
              <p className="font-bold text-slate-800">{stats.totalViews}</p>
            </div>
            <div>
              <p className="text-gray-500">Total likes</p>
              <p className="font-bold text-slate-800">{stats.totalLikes}</p>
            </div>
            <div>
              <p className="text-gray-500">Total commentaires</p>
              <p className="font-bold text-slate-800">{stats.totalComments}</p>
            </div>
            <div>
              <p className="text-gray-500">Moyenne likes/article</p>
              <p className="font-bold text-slate-800">
                {stats.total > 0 ? (stats.totalLikes / stats.total).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}