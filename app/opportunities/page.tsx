// app/opportunities/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { opportunities } from '@/lib/api';

interface Opportunity {
  id: number;
  title: string;
  slug: string;
  description: string;
  opportunity_type: string;
  company: string;
  location: string;
  is_remote: boolean;
  deadline: string;
}

export default function OpportunitiesPage() {
  const [opportunitiesList, setOpportunitiesList] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await opportunities.list();
      setOpportunitiesList(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erreur chargement des opportunités:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'STAGE': 'Stage',
      'EMPLOI': 'Emploi',
      'FREELANCE': 'Freelance',
      'HACKATHON': 'Hackathon',
      'FORMATION': 'Formation',
      'PROJET': 'Projet',
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'STAGE': 'bg-blue-100 text-blue-700',
      'EMPLOI': 'bg-green-100 text-green-700',
      'FREELANCE': 'bg-purple-100 text-purple-700',
      'HACKATHON': 'bg-orange-100 text-orange-700',
      'FORMATION': 'bg-indigo-100 text-indigo-700',
      'PROJET': 'bg-pink-100 text-pink-700',
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

  const filteredOpportunities = filter === 'all'
    ? opportunitiesList
    : opportunitiesList.filter(o => o.opportunity_type === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement des opportunités...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Opportunités</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Stages, emplois et missions pour les talents</p>
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
            Toutes
          </button>
          <button
            onClick={() => setFilter('STAGE')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'STAGE'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Stages
          </button>
          <button
            onClick={() => setFilter('EMPLOI')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'EMPLOI'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Emplois
          </button>
          <button
            onClick={() => setFilter('FREELANCE')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'FREELANCE'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Freelance
          </button>
        </div>

        {/* Liste */}
        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">Aucune opportunité disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {filteredOpportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(opportunity.opportunity_type)}`}>
                        {getTypeLabel(opportunity.opportunity_type)}
                      </span>
                      {opportunity.is_remote && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Remote</span>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">
                      {opportunity.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{opportunity.company}</p>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{opportunity.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>📍 {opportunity.location}</span>
                      <span>•</span>
                      <span>📅 {formatDate(opportunity.deadline)}</span>
                    </div>
                  </div>
                  <Link
                    href={`/opportunities/${opportunity.slug}`}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition whitespace-nowrap"
                  >
                    Postuler
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