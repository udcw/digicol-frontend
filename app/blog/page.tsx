// app/blog/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { blog } from '@/lib/api';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image: string | null;
  categories_names: string[];
  author_name: string;
  reading_time: number;
  created_at: string;
  view_count: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await blog.list();
      setPosts(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erreur chargement des articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Blog DigiCol Tech</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Découvrez nos articles et tutoriels</p>
        </div>

        {/* Liste des articles */}
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">Aucun article disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition"
              >
                {post.image ? (
                  <div className="h-48 bg-gray-200 relative">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">DigiCol</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400">{post.reading_time} min de lecture</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{formatDate(post.created_at)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt || post.title}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-600">{post.author_name}</span>
                    <span className="text-xs text-gray-400">👁️ {post.view_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}