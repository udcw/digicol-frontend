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
  AcademicCapIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    projects: 0,
    certificates: 0,
    events: 0,
    opportunities: 0,
    admins: 0,
    members: 0,
  });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/admin/login');
        return;
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('role, is_superadmin, email, username')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error || !userData) {
        console.error('Erreur récupération rôle:', error);
        router.push('/admin/login');
        return;
      }

      const role = userData?.role || 'MEMBRE';
      const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN' || userData?.is_superadmin === true;

      if (!isAdmin) {
        router.push('/admin/login');
        return;
      }

      setUser(userData);
      await fetchStats();
      await fetchRecentData();
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/admin/login');
    }
  };

  const fetchStats = async () => {
    try {
      // Compter les administrateurs
      const { count: adminCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .in('role', ['SUPER_ADMIN', 'ADMIN']);

      // Compter les membres
      const { count: memberCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'MEMBRE');

      const [
        { count: usersCount },
        { count: coursesCount },
        { count: projectsCount },
        { count: certificatesCount },
        { count: eventsCount },
        { count: opportunitiesCount },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('certificates').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('opportunities').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        users: usersCount || 0,
        courses: coursesCount || 0,
        projects: projectsCount || 0,
        certificates: certificatesCount || 0,
        events: eventsCount || 0,
        opportunities: opportunitiesCount || 0,
        admins: adminCount || 0,
        members: memberCount || 0,
      });
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const fetchRecentData = async () => {
    try {
      // Récupérer les 5 derniers cours
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, level, price, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Récupérer les 5 derniers utilisateurs
      const { data: users } = await supabase
        .from('users')
        .select('id, email, username, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentCourses(courses || []);
      setRecentUsers(users || []);
    } catch (error) {
      console.error('Erreur récupération données récentes:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
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
    { label: 'Total Utilisateurs', value: stats.users, icon: UsersIcon, color: 'blue' },
    { label: 'Membres', value: stats.members, icon: UsersIcon, color: 'green' },
    { label: 'Administrateurs', value: stats.admins, icon: UsersIcon, color: 'purple' },
    { label: 'Formations', value: stats.courses, icon: BookOpenIcon, color: 'indigo' },
    { label: 'Projets', value: stats.projects, icon: RocketLaunchIcon, color: 'orange' },
    { label: 'Certificats', value: stats.certificates, icon: DocumentTextIcon, color: 'yellow' },
    { label: 'Événements', value: stats.events, icon: BriefcaseIcon, color: 'red' },
    { label: 'Opportunités', value: stats.opportunities, icon: BriefcaseIcon, color: 'pink' },
  ];

  const menuItems = [
    { href: '/admin/members', label: 'Membres', icon: UsersIcon, description: 'Gérer les utilisateurs' },
    { href: '/admin/courses', label: 'Formations', icon: BookOpenIcon, description: 'Gérer les cours' },
    { href: '/admin/projects', label: 'Projets', icon: RocketLaunchIcon, description: 'Gérer les projets' },
    { href: '/admin/blog', label: 'Blog', icon: NewspaperIcon, description: 'Gérer les articles' },
    { href: '/admin/certificates', label: 'Certificats', icon: DocumentTextIcon, description: 'Gérer les certificats' },
    { href: '/admin/opportunities', label: 'Opportunités', icon: BriefcaseIcon, description: 'Gérer les offres' },
  ];

  // Couleurs pour les stats
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="DigiCol" width={120} height={40} className="h-auto" />
            <span className="text-sm text-gray-400 hidden sm:inline">| Administration</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">{user?.email || 'Admin'}</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition">
              <ArrowRightOnRectangleIcon className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
            <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de la plateforme DigiCol</p>
          </div>
          <Link href="/admin/courses/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            + Nouvelle formation
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {statItems.map((stat, index) => {
            const Icon = stat.icon;
            const colorClass = colorClasses[stat.color] || 'bg-blue-50 text-blue-600';
            return (
              <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xl font-bold text-slate-800">{stat.value}</span>
                </div>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Menu Admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={index} href={item.href} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 group transition">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">{item.label}</h2>
                </div>
                <p className="text-sm text-gray-500">{item.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Données récentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Derniers cours */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AcademicCapIcon className="h-5 w-5 text-blue-600" />
              Dernières formations
            </h3>
            {recentCourses.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune formation ajoutée</p>
            ) : (
              <div className="space-y-3">
                {recentCourses.map((course) => (
                  <Link key={course.id} href={`/admin/courses/${course.id}`} className="block hover:bg-gray-50 p-2 rounded-lg transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{course.title}</p>
                        <p className="text-xs text-gray-500">{course.level} • {course.price} FCFA</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(course.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link href="/admin/courses" className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block">
              Voir toutes les formations →
            </Link>
          </div>

          {/* Derniers utilisateurs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-blue-600" />
              Derniers membres
            </h3>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun utilisateur inscrit</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <Link key={user.id} href={`/admin/members/${user.id}`} className="block hover:bg-gray-50 p-2 rounded-lg transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{user.email}</p>
                        <p className="text-xs text-gray-500">{user.username || 'N/A'} • {user.role}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link href="/admin/members" className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block">
              Voir tous les membres →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}