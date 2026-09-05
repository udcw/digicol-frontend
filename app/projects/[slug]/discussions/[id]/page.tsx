// app/projects/[slug]/discussions/[id]/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
  };
}

export default function DiscussionDetailPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = use(params);
  const router = useRouter();
  const [discussion, setDiscussion] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Vérifier l'appartenance au projet
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: project } = await supabase
          .from('projects')
          .select('id')
          .eq('slug', slug)
          .single();

        if (project) {
          const { data: enrollment } = await supabase
            .from('project_enrollments')
            .select('status')
            .eq('project_id', project.id)
            .eq('user_id', session.user.id)
            .single();

          setIsMember(enrollment?.status === 'APPROVED');
        }
      }

      if (!isMember) {
        router.push(`/projects/${slug}`);
        return;
      }

      // Récupérer la discussion
      const { data: discussionData } = await supabase
        .from('project_discussions')
        .select(`
          *,
          user:users(id, username, full_name)
        `)
        .eq('id', id)
        .single();

      setDiscussion(discussionData);

      // Récupérer les messages
      const { data: messagesData } = await supabase
        .from('project_messages')
        .select(`
          *,
          user:users(id, username, full_name)
        `)
        .eq('discussion_id', id)
        .order('created_at', { ascending: true });

      setMessages(messagesData || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('project_messages')
        .insert({
          discussion_id: id,
          user_id: session.user.id,
          content: newMessage,
        })
        .select(`
          *,
          user:users(id, username, full_name)
        `)
        .single();

      if (error) throw error;

      setMessages([...messages, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
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
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/projects/${slug}/discussions`} className="text-gray-600 hover:text-blue-600 transition">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{discussion?.title}</h1>
            <p className="text-sm text-gray-500">
              Par {discussion?.user?.full_name || discussion?.user?.username || 'Inconnu'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Aucun message. Soyez le premier à répondre !
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                    {message.user?.full_name?.charAt(0) || message.user?.username?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-800">
                        {message.user?.full_name || message.user?.username || 'Inconnu'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulaire d'envoi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 self-end"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Appuyez sur Entrée pour envoyer, Shift+Entrée pour un saut de ligne</p>
        </div>
      </div>
    </div>
  );
}