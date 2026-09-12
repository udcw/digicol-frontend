// app/community/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  UserGroupIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar: string;
  };
  isLiked?: boolean;
}

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showComment, setShowComment] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    checkAuth();
    fetchPosts();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    setUserId(session?.user?.id || null);
    if (session?.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setUser(userData);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user:users(id, username, full_name, avatar)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Vérifier les likes
      let postsWithLikes = data || [];
      if (userId) {
        const { data: likes } = await supabase
          .from('community_likes')
          .select('post_id')
          .eq('user_id', userId);

        const likedIds = new Set(likes?.map((l: any) => l.post_id) || []);
        postsWithLikes = postsWithLikes.map((post: any) => ({
          ...post,
          isLiked: likedIds.has(post.id),
        }));
      }

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) throw error;

        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, isLiked: false, likes_count: p.likes_count - 1 }
            : p
        ));
      } else {
        const { error } = await supabase
          .from('community_likes')
          .insert({ post_id: postId, user_id: userId });

        if (error) throw error;

        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, isLiked: true, likes_count: p.likes_count + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du like');
    }
  };

  const handleCreatePost = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (!newPost.trim()) {
      alert('Veuillez écrire un message');
      return;
    }

    setIsPosting(true);
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: userId,
          content: newPost.trim(),
        })
        .select(`
          *,
          user:users(id, username, full_name, avatar)
        `)
        .single();

      if (error) throw error;

      setNewPost('');
      setPosts([{ ...data, isLiked: false }, ...posts]);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la publication');
    } finally {
      setIsPosting(false);
    }
  };

  const handleComment = async (postId: string) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (!commentContent.trim()) {
      alert('Veuillez écrire un commentaire');
      return;
    }

    try {
      const { error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: commentContent.trim(),
        });

      if (error) throw error;

      setPosts(posts.map(p =>
        p.id === postId
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      ));

      setCommentContent('');
      setShowComment(null);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi du commentaire');
    }
  };

  const formatDate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours} h`;
    if (days < 7) return `${days} j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <UserGroupIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Communauté</h1>
            <p className="text-sm text-gray-500">Partagez et échangez avec la communauté</p>
          </div>
        </div>

        {/* Créer un post */}
        {isLoggedIn ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Partagez quelque chose avec la communauté..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleCreatePost}
                    disabled={isPosting || !newPost.trim()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                    {isPosting ? 'Publication...' : 'Publier'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center mb-6">
            <p className="text-gray-500">
              <Link href="/login" className="text-blue-600 hover:underline">
                Connectez-vous
              </Link>
              {' '}pour partager avec la communauté.
            </p>
          </div>
        )}

        {/* Liste des posts */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <UserGroupIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucune publication</p>
              <p className="text-sm text-gray-400 mt-1">Soyez le premier à partager !</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  {/* En-tête */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                      {post.user?.full_name?.charAt(0) || post.user?.username?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">
                        {post.user?.full_name || post.user?.username || 'Inconnu'}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
                    </div>
                    {post.is_pinned && (
                      <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        Épinglé
                      </span>
                    )}
                  </div>

                  {/* Contenu */}
                  <p className="text-gray-700 text-sm mb-3">{post.content}</p>

                  {/* Image */}
                  {post.image_url && (
                    <div className="rounded-lg overflow-hidden mb-3">
                      <Image
                        src={post.image_url}
                        alt="Post image"
                        width={600}
                        height={400}
                        className="w-full object-cover max-h-96"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 text-sm transition ${
                        post.isLiked
                          ? 'text-red-600'
                          : 'text-gray-500 hover:text-red-600'
                      }`}
                    >
                      {post.isLiked ? (
                        <HeartSolidIcon className="h-4 w-4 text-red-600" />
                      ) : (
                        <HeartIcon className="h-4 w-4" />
                      )}
                      <span>{post.likes_count || 0}</span>
                    </button>
                    <button
                      onClick={() => setShowComment(showComment === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition"
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                      <span>{post.comments_count || 0}</span>
                    </button>
                  </div>

                  {/* Commentaires */}
                  {showComment === post.id && isLoggedIn && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-[10px] flex-shrink-0">
                          {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Écrire un commentaire..."
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                            rows={2}
                          />
                          <div className="mt-1 flex gap-2">
                            <button
                              onClick={() => handleComment(post.id)}
                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition"
                            >
                              Commenter
                            </button>
                            <button
                              onClick={() => {
                                setShowComment(null);
                                setCommentContent('');
                              }}
                              className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg transition"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}