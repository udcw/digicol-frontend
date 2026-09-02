// app/admin/projects/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ArrowLeftIcon, RocketLaunchIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Project {
  id: number;
  title: string;
  status: string;
  team_size: number;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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
    const role = session.user?.user_metadata?.role;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      router.push('/admin/login');
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects_project')
        .select('id, title, status, team_size')
        .order('id', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setLoading(false);
    }
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><RocketLaunchIcon className="h-6 w-6 text-blue-600" /></div>
            <h1 className="text-2xl font-bold text-slate-800">Gestion des projets</h1>
            <span className="text-sm text-gray-500 ml-2">({projects.length})</span>
          </div>
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            <PlusIcon className="h-4 w-4" /> Nouveau projet
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">ID</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Titre</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Statut</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Équipe</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-12">
                    <RocketLaunchIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>Aucun projet</p>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-500">{project.id}</td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-800">{project.title}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{project.team_size || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}