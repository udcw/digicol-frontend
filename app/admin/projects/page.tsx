// app/admin/projects/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeftIcon, 
  RocketLaunchIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: string;
  team_size: number;
  technologies: string;
  github_url: string | null;
  demo_url: string | null;
  is_published: boolean;
  created_at: string;
  created_by: string;
  creator?: {
    id: string;
    email: string;
    username: string;
    full_name: string;
  };
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    draft: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchProjects();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    const role = userData?.role || 'MEMBRE';
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      router.push('/admin/login');
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          creator:users(id, email, username, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);

      const total = data?.length || 0;
      const inProgress = data?.filter((p: Project) => p.status === 'IN_PROGRESS').length || 0;
      const completed = data?.filter((p: Project) => p.status === 'COMPLETED').length || 0;
      const draft = data?.filter((p: Project) => p.status === 'DRAFT').length || 0;

      setStats({ total, inProgress, completed, draft });
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce projet ?')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      fetchProjects();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du projet');
    }
  };

  const handleTogglePublish = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_published: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      fetchProjects();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise a jour');
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

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'DRAFT': ClockIcon,
      'IN_PROGRESS': ClockIcon,
      'COMPLETED': CheckCircleIcon,
      'ARCHIVED': XCircleIcon,
    };
    return icons[status] || ClockIcon;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="DigiCol" width={120} height={40} className="h-auto" />
            <span className="text-sm text-gray-400 hidden sm:inline">| Administration</span>
          </Link>
          <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
            <ArrowLeftIcon className="h-4 w-4" /> Retour
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <RocketLaunchIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Gestion des projets</h1>
              <p className="text-sm text-gray-500">{stats.total} projet{stats.total > 1 ? 's' : ''} au total</p>
            </div>
          </div>
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            <PlusIcon className="h-4 w-4" /> Nouveau projet
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Total</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">En cours</p>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Termines</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Brouillons</p>
            <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Projet</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Createur</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Statut</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Equipe</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Inscriptions</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Publie</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-12">
                      <RocketLaunchIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>Aucun projet</p>
                      <Link
                        href="/admin/projects/new"
                        className="text-blue-600 hover:underline mt-2 inline-block"
                      >
                        Creer le premier projet
                      </Link>
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => {
                    const StatusIcon = getStatusIcon(project.status);
                    return (
                      <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{project.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{project.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {project.creator?.full_name || project.creator?.username || 'Inconnu'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                            <StatusIcon className="h-3 w-3" />
                            {getStatusLabel(project.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-center">
                          {project.team_size || 1}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/projects/${project.id}/enrollments`}
                            className="text-gray-500 hover:text-blue-600 p-1 transition flex items-center gap-1"
                            title="Gerer les inscriptions"
                          >
                            <UserIcon className="h-4 w-4" />
                            <span className="text-xs">Gerer</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            project.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {project.is_published ? 'Publie' : 'Non publie'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/projects/${project.slug}`}
                              target="_blank"
                              className="text-gray-500 hover:text-gray-700 p-1 transition"
                              title="Voir le projet"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin/projects/${project.id}/edit`}
                              className="text-blue-600 hover:text-blue-800 p-1 transition"
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleTogglePublish(project.id, project.is_published)}
                              className={`p-1 transition ${
                                project.is_published ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'
                              }`}
                              title={project.is_published ? 'Retirer de la publication' : 'Publier'}
                            >
                              {project.is_published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              onClick={() => handleDelete(project.id)}
                              className="text-red-600 hover:text-red-800 p-1 transition"
                              title="Supprimer"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}