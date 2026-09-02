// app/admin/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  UsersIcon,
  BookOpenIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  NewspaperIcon,
  BriefcaseIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    members: 0,
    courses: 0,
    projects: 0,
    certificates: 0,
    users: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchStats();
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
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      // Compter les membres
      const { count: members } = await supabase
        .from('members_member')
        .select('*', { count: 'exact', head: true });
      
      // Compter les formations
      const { count: courses } = await supabase
        .from('courses_course')
        .select('*', { count: 'exact', head: true });
      
      // Compter les projets
      const { count: projects } = await supabase
        .from('projects_project')
        .select('*', { count: 'exact', head: true });
      
      // Compter les certificats
      const { count: certificates } = await supabase
        .from('certificates_certificate')
        .select('*', { count: 'exact', head: true });
      
      // Compter les utilisateurs
      const { count: users } = await supabase
        .from('accounts_user')
        .select('*', { count: 'exact', head: true });

      setStats({
        members: members || 0,
        courses: courses || 0,
        projects: projects || 0,
        certificates: certificates || 0,
        users: users || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statItems = [
    { label: 'Utilisateurs', value: stats.users, icon: UsersIcon },
    { label: 'Membres', value: stats.members, icon: UsersIcon },
    { label: 'Formations', value: stats.courses, icon: BookOpenIcon },
    { label: 'Projets', value: stats.projects, icon: RocketLaunchIcon },
    { label: 'Certificats', value: stats.certificates, icon: DocumentTextIcon },
  ];

  const menuItems = [
    { href: '/admin/members', label: 'Membres', icon: UsersIcon },
    { href: '/admin/courses', label: 'Formations', icon: BookOpenIcon },
    { href: '/admin/projects', label: 'Projets', icon: RocketLaunchIcon },
    { href: '/admin/blog', label: 'Blog', icon: NewspaperIcon },
    { href: '/admin/certificates', label: 'Certificats', icon: DocumentTextIcon },
    { href: '/admin/opportunities', label: 'Opportunités', icon: BriefcaseIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="DigiCol" width={120} height={40} className="h-auto" />
            <span className="text-sm text-gray-400 hidden sm:inline">| Administration</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700">
            <ArrowRightOnRectangleIcon className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">Tableau de bord</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statItems.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">{item.label}</h2>
                </div>
                <p className="text-sm text-gray-500">Gérer les {item.label.toLowerCase()}</p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}