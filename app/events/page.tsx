// app/events/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { events } from '@/lib/api';

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  event_type: string;
  location: string;
  start_date: string;
  end_date: string;
  is_free: boolean;
  price: number;
  max_participants: number;
  current_participants: number;
  is_full: boolean;
}

export default function EventsPage() {
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await events.list();
      setEventsList(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erreur chargement des événements:', error);
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
      'FORMATION': 'Formation',
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
      'FORMATION': 'bg-indigo-100 text-indigo-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const filteredEvents = filter === 'all'
    ? eventsList
    : eventsList.filter(e => e.event_type === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Événements DigiCol</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Participez aux événements de la communauté</p>
        </div>

        {/* Filtres */}
        <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0 mb-6 md:mb-8 scrollbar-hide">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('WORKSHOP')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'WORKSHOP'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Ateliers
          </button>
          <button
            onClick={() => setFilter('HACKATHON')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'HACKATHON'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Hackathons
          </button>
          <button
            onClick={() => setFilter('CONFERENCE')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'CONFERENCE'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Conférences
          </button>
          <button
            onClick={() => setFilter('MEETUP')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'MEETUP'
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Rencontres
          </button>
        </div>

        {/* Liste des événements */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">Aucun événement disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition"
              >
                {event.image ? (
                  <div className="h-40 md:h-48 bg-gray-200 relative">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 md:h-48 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-3xl md:text-4xl font-bold">DigiCol</span>
                  </div>
                )}
                <div className="p-4 md:p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(event.event_type)}`}>
                      {getTypeLabel(event.event_type)}
                    </span>
                    {event.is_free ? (
                      <span className="text-xs text-green-600 font-medium">Gratuit</span>
                    ) : (
                      <span className="text-xs text-gray-500">{event.price} FCFA</span>
                    )}
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1 line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 mb-2 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex flex-col gap-1 mb-3 text-xs md:text-sm text-gray-500">
                    <span>📅 {formatDate(event.start_date)}</span>
                    <span>📍 {event.location}</span>
                    <span>👥 {event.current_participants}/{event.max_participants} participants</span>
                  </div>
                  <Link
                    href={`/events/${event.slug}`}
                    className="block text-center text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    {event.is_full ? 'Complet' : "S'inscrire"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}