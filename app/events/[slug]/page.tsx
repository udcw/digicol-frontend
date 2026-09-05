// app/events/[slug]/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchEvent();
      checkAuth();
    }
  }, [slug]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
  };

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, creator:users(id, username, full_name)')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Événement non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          user_id: session.user.id,
          status: 'CONFIRMED',
        });

      if (error) throw error;
      setIsRegistered(true);
      setEvent({ ...event, current_participants: event.current_participants + 1 });
      alert('Inscription réussie !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'inscription');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Événement non trouvé</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/events" className="text-blue-600 hover:underline">Retour aux événements</Link>
        </div>
      </div>
    );
  }

  const isFull = event.current_participants >= event.max_participants;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/events" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-6">
          <ArrowLeftIcon className="h-4 w-4" />
          Retour aux événements
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center relative">
            {event.image_url ? (
              <Image src={event.image_url} alt={event.title} fill className="object-cover" />
            ) : (
              <span className="text-white text-3xl font-bold">DigiCol</span>
            )}
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{event.title}</h1>
            <p className="text-gray-600 mb-4">{event.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p>Début: {new Date(event.start_date).toLocaleString('fr-FR')}</p>
                  <p>Fin: {new Date(event.end_date).toLocaleString('fr-FR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <MapPinIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p>{event.location}</p>
                  {event.address && <p className="text-xs">{event.address}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <UsersIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p>{event.current_participants} / {event.max_participants} participants</p>
                  {isFull && <p className="text-red-600 text-xs">Complet</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <ClockIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p>Type: {event.event_type}</p>
                  <p className="font-bold text-blue-600">{event.is_free ? 'Gratuit' : `${event.price} FCFA`}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              {isLoggedIn ? (
                isRegistered ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-center">
                    <CheckCircleIcon className="h-5 w-5 mx-auto mb-1" />
                    Vous êtes inscrit à cet événement
                  </div>
                ) : isFull ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-center">
                    Événement complet
                  </div>
                ) : (
                  <button
                    onClick={handleRegister}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <UserPlusIcon className="h-5 w-5" />
                    S'inscrire
                  </button>
                )
              ) : (
                <Link
                  href="/login"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition text-center"
                >
                  Connectez-vous pour vous inscrire
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}