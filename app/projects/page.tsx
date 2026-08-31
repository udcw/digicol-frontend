// app/projects/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { projects } from '@/lib/api';

interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  technologies: string;
  status: string;
  team_size: number;
  github_url: string | null;
  demo_url: string | null;
}

export default function ProjectsPage() {
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projects.list();
      setProjectsList(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erreur chargement des projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'DRAFT': 'Brouillon',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Terminé',
      'ARCHIVED': 'Archivé',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'bg-gray-100 text-gray-700',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'ARCHIVED': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredProjects = filter === 'all' 
    ? projectsList 
    : projectsList.filter(p => p.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Projets DigiCol</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Découvrez les projets réalisés par la communauté</p>
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
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'IN_PROGRESS'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            En cours
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'COMPLETED'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Terminés
          </button>
          <button
            onClick={() => setFilter('DRAFT')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'DRAFT'
                ? 'bg-gray-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Brouillons
          </button>
        </div>

        {/* Liste des projets */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">Aucun projet disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition"
              >
               {project.image ? (
  <div className="h-40 md:h-48 bg-gray-200 relative">
    <Image
      src={project.image.startsWith('http') ? project.image : `http://127.0.0.1:8000${project.image}`}
      alt={project.title}
      fill
      className="object-cover"
      unoptimized={project.image.startsWith('http')} // Pour les URLs externes
    />
  </div>
) : (
  <div className="h-40 md:h-48 bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
    <span className="text-white text-3xl md:text-4xl font-bold">DigiCol</span>
  </div>
)}
                <div className="p-4 md:p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                    <span className="text-xs text-gray-400">{project.team_size} membre{project.team_size > 1 ? 's' : ''}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 mb-2 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.technologies?.split(',').slice(0, 3).map((tech, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {tech.trim()}
                      </span>
                    ))}
                    {project.technologies?.split(',').length > 3 && (
                      <span className="text-xs text-gray-400">+{project.technologies.split(',').length - 3}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition"
                      >
                        GitHub
                      </a>
                    )}
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded transition"
                      >
                        Démo
                      </a>
                    )}
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