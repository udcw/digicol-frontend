// app/projects/[slug]/discussions/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Discussion {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_resolved: boolean;
  created_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
  };
  messages_count: number;
}

export default function ProjectDiscussionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      // Récupérer le projet
      const { data: projectData } = await supabase
        .from('projects')
        .select('id, title')
        .eq('slug', slug)
        .single();

      if (projectData) {
        setProject(projectData);
        await checkMembership(projectData.id);
        await fetchDiscussions(projectData.id);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async (projectId: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('project_enrollments')
      .select('status')
      .eq('project_id', projectId)
      .eq('user_id', session.user.id)
      .single();

    setIsMember(data?.status === 'APPROVED');
  };

  const fetchDiscussions = async (projectId: number) => {
    const { data, error } = await supabase
      .from('project_discussions')
      .select(`
        *,
        user:users(id, username, full_name),
        messages:project_messages(count)
      `)
      .eq('project_id', projectId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDiscussions(data.map((d: any) => ({
        ...d,
        messages_count: d.messages?.[0]?.count || 0
      })));
    }
  };

  const handleCreateDiscussion = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const { error } = await supabase
        .from('project_discussions')
        .insert({
          project_id: project.id,
          user_id: session.user.id,
          title: newTitle,
          content: newContent,
        });

      if (error) throw error;

      setShowNewDiscussion(false);
      setNewTitle('');
      setNewContent('');
      await fetchDiscussions(project.id);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la discussion');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Accès restreint</h2>
          <p className="text-gray-500 mb-6">
            Vous devez être membre approuvé du projet pour accéder aux discussions.
          </p>
          <Link href={`/projects/${slug}`} className="text-blue-600 hover:underline">
            Retour au projet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/projects/${slug}`} className="text-gray-600 hover:text-blue-600 transition">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Discussions</h1>
              <p className="text-sm text-gray-500">{project?.title}</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewDiscussion(!showNewDiscussion)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvelle discussion
          </button>
        </div>

        {showNewDiscussion && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-slate-800 mb-4">Créer une nouvelle discussion</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Sujet de la discussion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Détaillez votre question ou suggestion..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateDiscussion}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Publier
                </button>
                <button
                  onClick={() => setShowNewDiscussion(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {discussions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <ChatBubbleLeftIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune discussion pour ce projet</p>
            <p className="text-sm text-gray-400 mt-1">Soyez le premier à lancer une discussion !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {discussions.map((discussion) => (
              <Link
                key={discussion.id}
                href={`/projects/${slug}/discussions/${discussion.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {discussion.is_pinned && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Épinglé</span>
                      )}
                      {discussion.is_resolved && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Résolu</span>
                      )}
                      <h3 className="font-semibold text-slate-800">{discussion.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{discussion.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Par {discussion.user?.full_name || discussion.user?.username || 'Inconnu'}</span>
                      <span>•</span>
                      <span>{new Date(discussion.created_at).toLocaleDateString('fr-FR')}</span>
                      <span>•</span>
                      <span>{discussion.messages_count} message{discussion.messages_count > 1 ? 's' : ''}</span>
                    </div>
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