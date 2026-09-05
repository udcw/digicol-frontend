// app/events/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  event_type: string;
  location: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  current_participants: number;
  is_free: boolean;
  price: number;
  is_published: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'WORKSHOP': 'Atelier',
      'CONFERENCE': 'Conférence',
      'BOOTCAMP': 'Bootcamp',
      'HACKATHON': 'Hackathon',
      'MEETUP': 'Rencontre',
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'WORKSHOP': 'bg-blue-100 text-blue-700',
      'CONFERENCE': 'bg-purple-100 text-purple-700',
      'BOOTCAMP': 'bg-orange-100 text-orange-700',
      'HACKATHON': 'bg-green-100 text-green-700',
      'MEETUP': 'bg-pink-100 text-pink-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
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

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(e => e.event_type === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Événements</h1>
          <p className="text-gray-500 mt-1">Participez aux événements de la communauté DigiCol</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tous
          </button>
          {['WORKSHOP', 'CONFERENCE', 'BOOTCAMP', 'HACKATHON', 'MEETUP'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === type ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {getTypeLabel(type)}
            </button>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun événement disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center relative">
                  {event.image_url ? (
                    <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                  ) : (
                    <span className="text-white text-2xl font-bold">DigiCol</span>
                  )}
                  <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${getTypeColor(event.event_type)}`}>
                    {getTypeLabel(event.event_type)}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>
                  <div className="space-y-1 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4" />
                      <span>{event.current_participants}/{event.max_participants} participants</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">
                      {event.is_free ? 'Gratuit' : `${event.price} FCFA`}
                    </span>
                    <Link
                      href={`/events/${event.slug}`}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      S'inscrire
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}