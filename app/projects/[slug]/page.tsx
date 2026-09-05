// app/projects/[slug]/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon,
  UsersIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  UserPlusIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  technologies: string;
  image: string | null;
  github_url: string | null;
  demo_url: string | null;
  status: string;
  level: string;
  duration: string;
  learning_outcomes: string[];
  team_size: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  creator?: {
    id: string;
    username: string;
    full_name: string;
    avatar: string;
  };
}

const getTechnologiesArray = (technologies: string | string[] | null): string[] => {
  if (!technologies) return [];
  if (Array.isArray(technologies)) return technologies;
  return technologies.split(',').map(t => t.trim()).filter(t => t !== '');
};

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchProject();
      checkAuth();
    }
  }, [slug]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    setUserId(session?.user?.id || null);
  };

  const fetchProject = async () => {
    try {
      console.log('🔍 Recherche du projet avec slug:', slug);

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          creator:users(id, username, full_name, avatar)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('❌ Erreur:', error);
        console.log('❌ Code:', error.code);
        console.log('❌ Message:', error.message);
        
        if (error.code === 'PGRST116') {
          setError('Projet non trouve. Verifiez que le slug est correct.');
        } else {
          setError('Erreur lors du chargement du projet: ' + error.message);
        }
        return;
      }

      if (!data) {
        setError('Projet non trouve');
        return;
      }

      console.log('✅ Projet trouve:', data.title);
      console.log('✅ ID du projet:', data.id);
      console.log('✅ Slug:', data.slug);
      
      setProject(data);

      // Vérifier le statut d'inscription
      if (data && userId) {
        await checkEnrollmentStatus(data.id, userId);
      }
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      setError('Erreur lors du chargement du projet: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async (projectId: number, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_enrollments')
        .select('status')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur vérification:', error);
        return;
      }

      if (data) {
        setEnrollmentStatus(data.status.toLowerCase() as 'pending' | 'approved' | 'rejected');
      } else {
        setEnrollmentStatus('none');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (!project) return;

    if (enrollmentStatus !== 'none') {
      alert('Vous etes deja inscrit a ce projet');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('project_enrollments')
        .insert({
          project_id: project.id,
          user_id: userId,
          status: 'PENDING',
          role: 'MEMBER',
        })
        .select();

      if (error) {
        if (error.code === '23505') {
          alert('Vous etes deja inscrit a ce projet');
          await checkEnrollmentStatus(project.id, userId!);
        } else {
          console.error('Erreur inscription:', error);
          alert('Erreur lors de l\'inscription: ' + error.message);
        }
        return;
      }

      setEnrollmentStatus('pending');
      alert('Inscription au projet reussie ! En attente de validation par l\'administrateur.');

    } catch (error: any) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'inscription: ' + error.message);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'DRAFT': 'Brouillon',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Termine',
      'ARCHIVED': 'Archive',
    };
    return labels[status] || status;
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

  const getLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      'DEBUTANT': 'Debutant',
      'INTERMEDIAIRE': 'Intermédiaire',
      'AVANCE': 'Avance',
      'EXPERT': 'Expert',
    };
    return levels[level] || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Projet non trouve</h2>
          <p className="text-gray-500 mb-4">{error || 'Le projet que vous recherchez n\'existe pas.'}</p>
          <p className="text-xs text-gray-400 mb-6">Slug recherché: {slug}</p>
          <div className="flex flex-col gap-3">
            <Link href="/projects" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
              Retour aux projets
            </Link>
            <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const techArray = getTechnologiesArray(project.technologies);

  const getEnrollmentButton = () => {
    if (!isLoggedIn) {
      return (
        <Link
          href="/login"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition text-center"
        >
          Connectez-vous pour rejoindre
        </Link>
      );
    }

    switch (enrollmentStatus) {
      case 'pending':
        return (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-lg text-sm text-center">
            <ClockIcon className="h-5 w-5 mx-auto mb-1" />
            Inscription en attente de validation
          </div>
        );
      case 'approved':
        return (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm text-center">
            <CheckBadgeIcon className="h-5 w-5 mx-auto mb-1" />
            Vous etes inscrit a ce projet
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm text-center">
            Votre inscription a ete refusee
          </div>
        );
      default:
        return (
          <button
            onClick={handleEnroll}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <UserPlusIcon className="h-5 w-5" />
            Rejoindre le projet
          </button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/projects" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
            <ArrowLeftIcon className="h-4 w-4" />
            Retour aux projets
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center relative">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">{project.title}</span>
                )}
                <span className={`absolute top-4 right-4 text-sm px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>

              <div className="p-6">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">{project.title}</h1>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <span>Par</span>
                  <span className="font-medium text-slate-700">
                    {project.creator?.full_name || project.creator?.username || 'Inconnu'}
                  </span>
                  <span>•</span>
                  <span>{new Date(project.created_at).toLocaleDateString('fr-FR')}</span>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800 mb-2">Description</h2>
                  <p className="text-gray-600 leading-relaxed">{project.description}</p>
                </div>

                {techArray.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-800 mb-2">Technologies</h2>
                    <div className="flex flex-wrap gap-2">
                      {techArray.map((tech) => (
                        <span key={tech} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(project.github_url || project.demo_url) && (
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
                      >
                        <CodeBracketIcon className="h-5 w-5" />
                        GitHub
                      </a>
                    )}
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
                      >
                        <GlobeAltIcon className="h-5 w-5" />
                        Demo
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-slate-800 mb-4">Informations</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Niveau</span>
                  <span className="font-medium">{getLevelLabel(project.level)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duree</span>
                  <span className="font-medium">{project.duration || 'Non specifiee'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taille de l'equipe</span>
                  <span className="font-medium">{project.team_size || 1} membres</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Statut</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
              </div>

              {getEnrollmentButton()}

              <p className="text-xs text-gray-400 text-center mt-3">
                Rejoignez ce projet et contribuez a son developpement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}