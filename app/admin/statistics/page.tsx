// app/admin/statistics/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  UsersIcon,
  BookOpenIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  CalendarIcon,
  BriefcaseIcon,
  NewspaperIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  UserGroupIcon,
  UserPlusIcon,
  UserMinusIcon,
  ClockIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function AdminStatisticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [userStats, setUserStats] = useState<any>({
    total: 0,
    newThisMonth: 0,
    newThisWeek: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    members: 0,
    instructors: 0,
    monthlyGrowth: [],
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      await checkAuth();
      if (isMounted) {
        await fetchStats();
        await fetchUserStats();
        await fetchRecentActivity();
        setLoading(false);
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
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

  const fetchStats = async () => {
    try {
      const [
        { count: users },
        { count: courses },
        { count: projects },
        { count: events },
        { count: opportunities },
        { count: blogPosts },
        { count: certificates },
        { count: comments },
        { count: likes },
        { count: projectEnrollments },
        { count: eventRegistrations },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('opportunities').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('certificates').select('*', { count: 'exact', head: true }),
        supabase.from('blog_comments').select('*', { count: 'exact', head: true }),
        supabase.from('blog_likes').select('*', { count: 'exact', head: true }),
        supabase.from('project_enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        users: users || 0,
        courses: courses || 0,
        projects: projects || 0,
        events: events || 0,
        opportunities: opportunities || 0,
        blogPosts: blogPosts || 0,
        certificates: certificates || 0,
        comments: comments || 0,
        likes: likes || 0,
        projectEnrollments: projectEnrollments || 0,
        eventRegistrations: eventRegistrations || 0,
      });
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data: usersByRole } = await supabase
        .from('users')
        .select('role, is_active_member');

      const total = usersByRole?.length || 0;
      const admins = usersByRole?.filter((u: any) => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').length || 0;
      const members = usersByRole?.filter((u: any) => u.role === 'MEMBRE').length || 0;
      const instructors = usersByRole?.filter((u: any) => u.role === 'INSTRUCTOR').length || 0;
      const active = usersByRole?.filter((u: any) => u.is_active_member === true).length || 0;
      const inactive = usersByRole?.filter((u: any) => u.is_active_member === false).length || 0;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newThisMonth } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      startOfWeek.setHours(0, 0, 0, 0);

      const { count: newThisWeek } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfWeek.toISOString());

      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('fr-FR', { month: 'short' });
        const year = date.getFullYear();
        
        const start = new Date(year, date.getMonth(), 1);
        const end = new Date(year, date.getMonth() + 1, 1);
        
        const { count } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', start.toISOString())
          .lt('created_at', end.toISOString());
        
        monthlyData.push({ month: `${month} ${year}`, count: count || 0 });
      }

      setUserStats({
        total,
        admins,
        members,
        instructors,
        active,
        inactive,
        newThisMonth: newThisMonth || 0,
        newThisWeek: newThisWeek || 0,
        monthlyGrowth: monthlyData,
      });
    } catch (error) {
      console.error('Erreur user stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: recentUsers } = await supabase
        .from('users')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentCourses } = await supabase
        .from('courses')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentProjects } = await supabase
        .from('projects')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentEnrollments } = await supabase
        .from('project_enrollments')
        .select('*, projects(title)')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: any[] = [];

      recentUsers?.forEach((u: any) => {
        activities.push({
          type: 'user',
          title: u.full_name || u.email,
          description: 'Nouveau membre inscrit',
          date: u.created_at,
          link: `/admin/members/${u.id}`,
        });
      });

      recentCourses?.forEach((c: any) => {
        activities.push({
          type: 'course',
          title: c.title,
          description: 'Nouvelle formation creee',
          date: c.created_at,
          link: `/admin/courses/${c.id}`,
        });
      });

      recentProjects?.forEach((p: any) => {
        activities.push({
          type: 'project',
          title: p.title,
          description: 'Nouveau projet ajoute',
          date: p.created_at,
          link: `/admin/projects/${p.id}`,
        });
      });

      recentEnrollments?.forEach((e: any) => {
        activities.push({
          type: 'enrollment',
          title: e.projects?.title || 'Projet',
          description: 'Nouvelle inscription a un projet',
          date: e.created_at,
          link: `/admin/projects/${e.project_id}/enrollments`,
        });
      });

      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activities.slice(0, 10));
    } catch (error) {
      console.error('Erreur activite:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statItems = [
    { label: 'Utilisateurs', value: stats.users, icon: UsersIcon, color: 'blue' },
    { label: 'Formations', value: stats.courses, icon: BookOpenIcon, color: 'indigo' },
    { label: 'Projets', value: stats.projects, icon: RocketLaunchIcon, color: 'orange' },
    { label: 'Evenements', value: stats.events, icon: CalendarIcon, color: 'purple' },
    { label: 'Opportunites', value: stats.opportunities, icon: BriefcaseIcon, color: 'pink' },
    { label: 'Articles blog', value: stats.blogPosts, icon: NewspaperIcon, color: 'green' },
    { label: 'Certificats', value: stats.certificates, icon: DocumentTextIcon, color: 'yellow' },
    { label: 'Commentaires', value: stats.comments, icon: ChatBubbleLeftIcon, color: 'teal' },
    { label: 'Likes', value: stats.likes, icon: HeartIcon, color: 'red' },
    { label: 'Inscriptions projets', value: stats.projectEnrollments, icon: UserGroupIcon, color: 'emerald' },
    { label: 'Inscriptions evenements', value: stats.eventRegistrations, icon: CalendarIcon, color: 'fuchsia' },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    teal: 'bg-teal-50 text-teal-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    fuchsia: 'bg-fuchsia-50 text-fuchsia-600',
  };

  const getIcon = (type: string) => {
    const icons: Record<string, any> = {
      user: UsersIcon,
      course: BookOpenIcon,
      project: RocketLaunchIcon,
      enrollment: UserGroupIcon,
    };
    const Icon = icons[type] || ChartBarIcon;
    return <Icon className="h-4 w-4" />;
  };

  const roleItems = [
    { label: 'Admins', value: userStats.admins, icon: ShieldCheckIcon, color: 'purple' },
    { label: 'Formateurs', value: userStats.instructors, icon: AcademicCapIcon, color: 'green' },
    { label: 'Membres', value: userStats.members, icon: UserCircleIcon, color: 'blue' },
  ];

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
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Statistiques</h1>
            <p className="text-sm text-gray-500">Vue d'ensemble des donnees de la plateforme</p>
          </div>
        </div>

        {/* Statistiques Utilisateurs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-0.5">
              <UsersIcon className="h-4 w-4 text-blue-600" />
              <p className="text-[10px] text-gray-500 font-medium">Total</p>
            </div>
            <p className="text-xl font-bold text-slate-800">{userStats.total}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-0.5">
              <UserPlusIcon className="h-4 w-4 text-green-600" />
              <p className="text-[10px] text-gray-500 font-medium">Nouveaux (mois)</p>
            </div>
            <p className="text-xl font-bold text-green-600">+{userStats.newThisMonth}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-0.5">
              <UserPlusIcon className="h-4 w-4 text-blue-600" />
              <p className="text-[10px] text-gray-500 font-medium">Nouveaux (semaine)</p>
            </div>
            <p className="text-xl font-bold text-blue-600">+{userStats.newThisWeek}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-0.5">
              <UserCircleIcon className="h-4 w-4 text-green-600" />
              <p className="text-[10px] text-gray-500 font-medium">Actifs</p>
            </div>
            <p className="text-xl font-bold text-green-600">{userStats.active}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-0.5">
              <UserMinusIcon className="h-4 w-4 text-red-600" />
              <p className="text-[10px] text-gray-500 font-medium">Inactifs</p>
            </div>
            <p className="text-xl font-bold text-red-600">{userStats.inactive}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-0.5">
              <ChartBarIcon className="h-4 w-4 text-slate-600" />
              <p className="text-[10px] text-gray-500 font-medium">Taux activite</p>
            </div>
            <p className="text-xl font-bold text-slate-800">
              {userStats.total > 0 ? Math.round((userStats.active / userStats.total) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Repartition par role */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {roleItems.map((item, index) => {
            const Icon = item.icon;
            const colorMap: Record<string, string> = {
              purple: 'text-purple-600 bg-purple-50',
              green: 'text-green-600 bg-green-50',
              blue: 'text-blue-600 bg-blue-50',
            };
            const bgColor = colorMap[item.color] || 'text-gray-600 bg-gray-50';
            return (
              <div key={index} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className={`inline-flex p-2 rounded-lg ${bgColor} mb-1`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-[10px] text-gray-500 font-medium">{item.label}</p>
                <p className="text-xl font-bold text-slate-800">{item.value}</p>
              </div>
            );
          })}
        </div>

        {/* Croissance mensuelle */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4 text-blue-600" />
            Evolution des inscriptions (6 derniers mois)
          </h3>
          <div className="flex items-end gap-2 h-32">
            {userStats.monthlyGrowth.map((item: any, index: number) => {
              const max = Math.max(...userStats.monthlyGrowth.map((i: any) => i.count), 1);
              const height = (item.count / max) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <p className="text-[8px] text-gray-400 mt-1">{item.month}</p>
                  <p className="text-[10px] font-bold text-slate-700">{item.count}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cartes principales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {statItems.map((stat, index) => {
            const Icon = stat.icon;
            const colorClass = colorClasses[stat.color] || 'bg-blue-50 text-blue-600';
            return (
              <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-1">
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

        {/* Activite recente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-blue-600" />
            Activite recente
          </h2>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune activite recente</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const Icon = getIcon(activity.type);
                const colors: Record<string, string> = {
                  user: 'bg-blue-100 text-blue-600',
                  course: 'bg-indigo-100 text-indigo-600',
                  project: 'bg-orange-100 text-orange-600',
                  enrollment: 'bg-emerald-100 text-emerald-600',
                };
                const color = colors[activity.type] || 'bg-gray-100 text-gray-600';
                return (
                  <Link
                    key={index}
                    href={activity.link || '#'}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className={`p-2 rounded-lg ${color}`}>
                      {Icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(activity.date)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}