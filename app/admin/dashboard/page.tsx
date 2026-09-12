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
  CalendarIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  WalletIcon,
  TrophyIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
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
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

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
      const { count: adminCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .in('role', ['SUPER_ADMIN', 'ADMIN']);

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
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, level, price, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: users } = await supabase
        .from('users')
        .select('id, email, username, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: events } = await supabase
        .from('events')
        .select('id, title, event_type, start_date, is_published')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentCourses(courses || []);
      setRecentUsers(users || []);
      setRecentEvents(events || []);
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
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: 'Utilisateurs',
      value: stats.users,
      icon: UsersIcon,
      color: 'blue',
      href: '/admin/members',
    },
    {
      label: 'Membres',
      value: stats.members,
      icon: UserGroupIcon,
      color: 'green',
      href: '/admin/members',
    },
    {
      label: 'Administrateurs',
      value: stats.admins,
      icon: ShieldCheckIcon,
      color: 'purple',
      href: '/admin/members',
    },
    {
      label: 'Formations',
      value: stats.courses,
      icon: BookOpenIcon,
      color: 'indigo',
      href: '/admin/courses',
    },
    {
      label: 'Projets',
      value: stats.projects,
      icon: RocketLaunchIcon,
      color: 'orange',
      href: '/admin/projects',
    },
    {
      label: 'Certificats',
      value: stats.certificates,
      icon: DocumentTextIcon,
      color: 'yellow',
      href: '/admin/certificates',
    },
    {
      label: 'Événements',
      value: stats.events,
      icon: CalendarIcon,
      color: 'red',
      href: '/admin/events',
    },
    {
      label: 'Opportunités',
      value: stats.opportunities,
      icon: BriefcaseIcon,
      color: 'pink',
      href: '/admin/opportunities',
    },
  ];

  const menuItems = [
    {
      href: '/admin/members',
      label: 'Membres',
      icon: UsersIcon,
      description: 'Gérer les utilisateurs',
      color: 'blue',
    },
    {
      href: '/admin/courses',
      label: 'Formations',
      icon: BookOpenIcon,
      description: 'Gérer les cours',
      color: 'indigo',
    },
    {
      href: '/admin/projects',
      label: 'Projets',
      icon: RocketLaunchIcon,
      description: 'Gérer les projets',
      color: 'orange',
    },
    {
      href: '/admin/events',
      label: 'Événements',
      icon: CalendarIcon,
      description: 'Gérer les événements',
      color: 'red',
    },
    {
      href: '/admin/opportunities',
      label: 'Opportunités',
      icon: BriefcaseIcon,
      description: 'Gérer les offres',
      color: 'pink',
    },
    {
      href: '/admin/blog',
      label: 'Blog',
      icon: NewspaperIcon,
      description: 'Gérer les articles',
      color: 'green',
    },
    {
      href: '/admin/certificates',
      label: 'Certificats',
      icon: DocumentTextIcon,
      description: 'Gérer les certificats',
      color: 'yellow',
    },
    {
      href: '/admin/community',
      label: 'Communauté',
      icon: UserGroupIcon,
      description: 'Modérer la communauté',
      color: 'teal',
    },
    {
      href: '/admin/badges',
      label: 'Badges',
      icon: TrophyIcon,
      description: 'Gérer les badges',
      color: 'amber',
    },
    {
      href: '/admin/wallets',
      label: 'Portefeuilles',
      icon: WalletIcon,
      description: 'Gérer les portefeuilles',
      color: 'emerald',
    },
    {
      href: '/admin/statistics',
      label: 'Statistiques',
      icon: ChartBarIcon,
      description: 'Voir les statistiques',
      color: 'violet',
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', gradient: 'from-blue-500 to-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', gradient: 'from-green-500 to-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', gradient: 'from-purple-500 to-purple-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', gradient: 'from-indigo-500 to-indigo-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', gradient: 'from-orange-500 to-orange-600' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100', gradient: 'from-yellow-500 to-yellow-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', gradient: 'from-red-500 to-red-600' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', gradient: 'from-pink-500 to-pink-600' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100', gradient: 'from-teal-500 to-teal-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', gradient: 'from-amber-500 to-amber-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', gradient: 'from-emerald-500 to-emerald-600' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', gradient: 'from-violet-500 to-violet-600' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="DigiCol" width={120} height={40} className="h-auto" />
            <span className="text-sm text-gray-400 hidden sm:inline">| Administration</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">{user?.email || 'Admin'}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition font-medium"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* ============================================ */}
        {/* BANNIÈRE DE BIENVENUE */}
        {/* ============================================ */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-6 md:p-8 mb-6 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium mb-3 border border-purple-500/30">
                <ShieldCheckIcon className="h-3 w-3" />
                Panneau d'Administration
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Tableau de bord
              </h1>
              <p className="text-sm text-gray-300">
                Vue d'ensemble de la plateforme DigiCol
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/events/new"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/20 transition text-sm font-medium backdrop-blur-sm"
              >
                <CalendarIcon className="h-4 w-4" />
                Nouvel événement
              </Link>
              <Link
                href="/admin/courses/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium shadow-lg shadow-blue-600/30"
              >
                <BookOpenIcon className="h-4 w-4" />
                Nouvelle formation
              </Link>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* STATISTIQUES */}
        {/* ============================================ */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-blue-600" />
              Vue d'ensemble
            </h2>
            <Link
              href="/admin/statistics"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Voir les statistiques
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {statItems.map((stat, index) => {
              const Icon = stat.icon;
              const colors = colorMap[stat.color] || colorMap.blue;
              return (
                <Link
                  key={index}
                  href={stat.href}
                  className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 ${colors.bg} rounded-xl group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ============================================ */}
        {/* MENU D'ADMINISTRATION */}
        {/* ============================================ */}
        <div className="mb-8">
          <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
            Gestion de la plateforme
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const colors = colorMap[item.color] || colorMap.blue;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${colors.bg} rounded-xl group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-0.5">{item.label}</h3>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ============================================ */}
        {/* DONNÉES RÉCENTES */}
        {/* ============================================ */}
        <div className="mb-6">
          <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
            <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" />
            Activité récente
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Derniers cours */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <AcademicCapIcon className="h-4 w-4 text-indigo-600" />
                  </div>
                  Dernières formations
                </h3>
                <Link
                  href="/admin/courses"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir tout
                </Link>
              </div>

              {recentCourses.length === 0 ? (
                <div className="p-6 text-center">
                  <BookOpenIcon className="h-10 w-10 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">Aucune formation</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/admin/courses/${course.id}`}
                      className="block p-3 hover:bg-gray-50 transition group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm line-clamp-1 group-hover:text-blue-600 transition">
                            {course.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {course.level}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {course.price} FCFA
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {new Date(course.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Derniers événements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <div className="p-1.5 bg-red-50 rounded-lg">
                    <CalendarIcon className="h-4 w-4 text-red-600" />
                  </div>
                  Derniers événements
                </h3>
                <Link
                  href="/admin/events"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir tout
                </Link>
              </div>

              {recentEvents.length === 0 ? (
                <div className="p-6 text-center">
                  <CalendarIcon className="h-10 w-10 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">Aucun événement</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/admin/events/${event.id}`}
                      className="block p-3 hover:bg-gray-50 transition group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm line-clamp-1 group-hover:text-blue-600 transition">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {event.event_type}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              event.is_published
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {event.is_published ? 'Publié' : 'Brouillon'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {new Date(event.start_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Derniers utilisateurs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <UsersIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  Derniers membres
                </h3>
                <Link
                  href="/admin/members"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir tout
                </Link>
              </div>

              {recentUsers.length === 0 ? (
                <div className="p-6 text-center">
                  <UsersIcon className="h-10 w-10 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">Aucun utilisateur</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentUsers.map((user) => (
                    <Link
                      key={user.id}
                      href={`/admin/members/${user.id}`}
                      className="block p-3 hover:bg-gray-50 transition group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 text-sm line-clamp-1 group-hover:text-blue-600 transition">
                              {user.email}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-700'
                                  : user.role === 'INSTRUCTOR'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {user.role}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {new Date(user.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* CTA FINAL */}
        {/* ============================================ */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white text-center">
          <SparklesIcon className="h-8 w-8 mx-auto mb-3 text-blue-200" />
          <h2 className="text-lg md:text-xl font-bold mb-2">
            DigiCol Administration
          </h2>
          <p className="text-blue-100 text-sm max-w-xl mx-auto mb-4">
            Gérez l'ensemble de la plateforme depuis ce panneau central.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/admin/statistics"
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-5 py-2 rounded-lg font-medium transition text-sm"
            >
              <ChartBarIcon className="h-4 w-4" />
              Voir les statistiques
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg font-medium border border-white/20 transition text-sm"
            >
              Voir le site public
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}