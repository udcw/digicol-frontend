// app/opportunities/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BriefcaseIcon, MapPinIcon, CalendarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_published', true)
        .order('deadline', { ascending: true });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error('Erreur:', error);
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
      'CONCOURS': 'Concours',
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'STAGE': 'bg-blue-100 text-blue-700',
      'EMPLOI': 'bg-green-100 text-green-700',
      'FREELANCE': 'bg-purple-100 text-purple-700',
      'HACKATHON': 'bg-orange-100 text-orange-700',
      'CONCOURS': 'bg-pink-100 text-pink-700',
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
    ? opportunities
    : opportunities.filter(o => o.opportunity_type === filter);

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
          <h1 className="text-3xl font-bold text-slate-900">Opportunités</h1>
          <p className="text-gray-500 mt-1">Stages, emplois et missions pour les talents</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Toutes
          </button>
          {['STAGE', 'EMPLOI', 'FREELANCE', 'HACKATHON'].map((type) => (
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

        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <BriefcaseIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune opportunité disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
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
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{opportunity.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <BuildingOfficeIcon className="h-4 w-4" />
                        {opportunity.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        {opportunity.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {formatDate(opportunity.deadline)}
                      </span>
                    </div>
                    <p className="text-gray-600 line-clamp-2">{opportunity.description}</p>
                  </div>
                  <Link
                    href={`/opportunities/${opportunity.slug}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition whitespace-nowrap"
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