// app/projects/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  RocketLaunchIcon,
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CodeBracketIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

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
  created_by: string;
  created_at: string;
  is_published: boolean;
  creator?: {
    id: string;
    username: string;
    full_name: string;
  };
}

const getTechnologiesArray = (technologies: string | null): string[] => {
  if (!technologies) return [];
  return technologies.split(',').map(t => t.trim()).filter(t => t !== '');
};

export default function ProjectsPage() {
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchProjects();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          creator:users(id, username, full_name)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement des projets:', error);
        return;
      }

      setProjectsList(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'DRAFT': 'Brouillon',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Termine',
      'ARCHIVED': 'Archive',
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

  const filteredProjects = projectsList
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.technologies?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <RocketLaunchIcon className="h-8 w-8 text-blue-600" />
              Projets DigiCol
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Decouvrez les projets realises par la communaute
            </p>
          </div>
          {isLoggedIn && (
            <Link
              href="/projects/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm"
            >
              <PlusIcon className="h-5 w-5" />
              Nouveau projet
            </Link>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
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
              Termines
            </button>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <RocketLaunchIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {searchTerm ? 'Aucun projet ne correspond a votre recherche' : 'Aucun projet disponible pour le moment.'}
            </p>
            {isLoggedIn && !searchTerm && (
              <Link
                href="/projects/new"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Creer le premier projet
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">
              {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} trouve{filteredProjects.length > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProjects.map((project) => {
                const techArray = getTechnologiesArray(project.technologies);
                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group"
                  >
                    <div className="h-40 md:h-48 bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center relative">
                      {project.image ? (
                        <Image
                          src={project.image.startsWith('http') ? project.image : `${project.image}`}
                          alt={project.title}
                          fill
                          className="object-cover"
                          unoptimized={project.image.startsWith('http')}
                        />
                      ) : (
                        <span className="text-white text-3xl md:text-4xl font-bold">{project.title.charAt(0)}</span>
                      )}
                      <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>

                    <div className="p-4 md:p-5">
                      <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1 line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {project.description}
                      </p>

                      {techArray.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {techArray.slice(0, 3).map((tech) => (
                            <span key={tech} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {tech}
                            </span>
                          ))}
                          {techArray.length > 3 && (
                            <span className="text-xs text-gray-400">+{techArray.length - 3}</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <UsersIcon className="h-3 w-3" />
                          {project.team_size || 1} membre{project.team_size > 1 ? 's' : ''}
                        </span>
                        {project.creator && (
                          <span>par {project.creator.full_name || project.creator.username}</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/projects/${project.slug}`}
                          className="flex-1 text-center text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition"
                        >
                          Voir le projet
                        </Link>
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                          >
                            <CodeBracketIcon className="h-3 w-3" />
                            Code
                          </a>
                        )}
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                          >
                            <GlobeAltIcon className="h-3 w-3" />
                            Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}