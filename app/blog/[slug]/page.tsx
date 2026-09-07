// app/blog/[slug]/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  TagIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  is_approved: boolean;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar: string;
  };
  replies?: Comment[];
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Commentaires
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // ✅ 1. Vérifier l'authentification d'abord
  useEffect(() => {
    checkAuth();
  }, []);

  // ✅ 2. Charger l'article quand le slug change
  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  // ✅ 3. Charger les commentaires quand le post est chargé
  useEffect(() => {
    if (post?.id) {
      fetchComments();
    }
  }, [post?.id]);

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

  const fetchPost = async () => {
    try {
      setLoading(true);
      console.log('🔍 Récupération de l\'article:', slug);

      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:users(id, username, full_name)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('❌ Erreur:', error);
        setError('Article non trouvé');
        return;
      }

      console.log('✅ Article trouvé:', data.title);
      setPost(data);
      setLikesCount(data.likes_count || 0);

      // Incrémenter les vues
      await supabase
        .from('blog_posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

    } catch (error) {
      console.error('❌ Erreur:', error);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!post?.id) return;

    try {
      console.log('💬 Chargement des commentaires pour post:', post.id);

      const { data, error } = await supabase
        .from('blog_comments')
        .select(`
          *,
          user:users(id, username, full_name, avatar)
        `)
        .eq('post_id', post.id)
        .is('parent_id', null)
        .eq('is_approved', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erreur commentaires:', error);
        return;
      }

      // Récupérer les réponses
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment: any) => {
          const { data: replies } = await supabase
            .from('blog_comments')
            .select(`
              *,
              user:users(id, username, full_name, avatar)
            `)
            .eq('parent_id', comment.id)
            .eq('is_approved', true)
            .order('created_at', { ascending: true });

          return {
            ...comment,
            replies: replies || [],
          };
        })
      );

      console.log('✅ Commentaires chargés:', commentsWithReplies.length);
      setComments(commentsWithReplies);

    } catch (error) {
      console.error('❌ Erreur:', error);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('blog_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', userId);

        if (error) throw error;

        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ likes_count: likesCount - 1 })
          .eq('id', post.id);

        if (updateError) throw updateError;

        setIsLiked(false);
        setLikesCount(likesCount - 1);
      } else {
        const { error } = await supabase
          .from('blog_likes')
          .insert({
            post_id: post.id,
            user_id: userId,
          });

        if (error) throw error;

        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({ likes_count: likesCount + 1 })
          .eq('id', post.id);

        if (updateError) throw updateError;

        setIsLiked(true);
        setLikesCount(likesCount + 1);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du like');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) {
      alert('Veuillez écrire un commentaire');
      return;
    }

    setCommentLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: post.id,
          user_id: userId,
          content: newComment.trim(),
          is_approved: true,
        })
        .select(`
          *,
          user:users(id, username, full_name, avatar)
        `)
        .single();

      if (error) throw error;

      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi du commentaire');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (!replyContent.trim()) {
      alert('Veuillez écrire une réponse');
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: post.id,
          user_id: userId,
          parent_id: parentId,
          content: replyContent.trim(),
          is_approved: true,
        });

      if (error) throw error;

      setReplyContent('');
      setReplyTo(null);
      await fetchComments();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi de la réponse');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié !');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours} h`;
    if (days < 7) return `${days} j`;
    return formatDate(date);
  };

  // ✅ Vérifier le like quand l'utilisateur est connecté et que le post est chargé
  useEffect(() => {
    const checkLike = async () => {
      if (userId && post?.id) {
        const { data: likeData } = await supabase
          .from('blog_likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', userId)
          .single();
        setIsLiked(!!likeData);
      }
    };
    checkLike();
  }, [userId, post?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Article non trouvé</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/blog" className="text-blue-600 hover:underline">
            Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link href="/blog" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
            <ArrowLeftIcon className="h-4 w-4" />
            Retour au blog
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
          >
            <ShareIcon className="h-5 w-5" />
            Partager
          </button>
        </div>

        <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center relative">
            {post.image_url ? (
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-white text-3xl font-bold">DigiCol Tech</span>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {post.category && (
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {post.category}
                </span>
              )}
              {post.tags && post.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-bold text-slate-800 mb-4">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
              <span className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                {post.author?.full_name || post.author?.username || 'Inconnu'}
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {formatDate(post.published_at || post.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                {post.reading_time} min de lecture
              </span>
              <span className="flex items-center gap-1">
                <TagIcon className="h-4 w-4" />
                {post.view_count} vues
              </span>
            </div>

            <div className="prose prose-lg max-w-none">
              {post.content && post.content.split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="text-gray-600 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isLiked
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isLiked ? (
                    <HeartSolidIcon className="h-5 w-5 text-red-600" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                  <span className="font-medium">{likesCount}</span>
                  <span className="text-sm">{likesCount > 1 ? 'likes' : 'like'}</span>
                </button>
                <span className="text-sm text-gray-400">
                  {post.view_count} vues
                </span>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition"
              >
                <ShareIcon className="h-5 w-5" />
                <span className="text-sm">Partager</span>
              </button>
            </div>
          </div>
        </article>

        {/* Commentaires */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ChatBubbleLeftIcon className="h-5 w-5 text-blue-600" />
              Commentaires ({comments.length})
            </h3>

            {isLoggedIn ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                    {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Laissez un commentaire..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                      required
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={commentLoading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                      >
                        <PaperAirplaneIcon className="h-4 w-4" />
                        {commentLoading ? 'Envoi...' : 'Publier'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center mb-6">
                <p className="text-gray-500">
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Connectez-vous
                  </Link>
                  {' '}pour laisser un commentaire.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucun commentaire pour le moment. Soyez le premier !
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                        {comment.user?.full_name?.charAt(0) || comment.user?.username?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-slate-800">
                            {comment.user?.full_name || comment.user?.username || 'Inconnu'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                        <button
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          {replyTo === comment.id ? 'Annuler' : 'Répondre'}
                        </button>

                        {replyTo === comment.id && isLoggedIn && (
                          <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-2">
                            <div className="flex items-start gap-2">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-[10px] flex-shrink-0">
                                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1">
                                <textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="Écrire une réponse..."
                                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                  rows={2}
                                />
                                <div className="mt-1 flex gap-2">
                                  <button
                                    type="submit"
                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition"
                                  >
                                    Répondre
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setReplyTo(null)}
                                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg transition"
                                  >
                                    Annuler
                                  </button>
                                </div>
                              </div>
                            </div>
                          </form>
                        )}

                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-6 mt-3 space-y-3 border-l-2 border-gray-100 pl-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-[10px] flex-shrink-0">
                                  {reply.user?.full_name?.charAt(0) || reply.user?.username?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-xs text-slate-800">
                                      {reply.user?.full_name || reply.user?.username || 'Inconnu'}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {formatTimeAgo(reply.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-0.5">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/blog" className="text-sm text-blue-600 hover:underline">
            Tous les articles
          </Link>
        </div>
      </div>
    </div>
  );
}