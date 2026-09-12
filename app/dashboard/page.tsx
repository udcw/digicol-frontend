// app/dashboard/page.tsx

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  BookOpenIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  UserCircleIcon,
  AcademicCapIcon,
  ClockIcon,
  IdentificationIcon,
  TrophyIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  WalletIcon,
  ArrowRightIcon,
  SparklesIcon,
  ChartBarIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [courseStats, setCourseStats] = useState({ total: 0, completed: 0, inProgress: 0 });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const approved = searchParams.get('notification');
    const project = searchParams.get('project');

    if (approved === 'approved' && project) {
      setSuccessMessage(`Votre inscription au projet "${project}" a été approuvée !`);
      setTimeout(() => {
        router.replace('/dashboard');
      }, 5000);
    }

    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('Erreur recuperation membre:', userError);
      } else {
        setMember(userData);
      }

      await Promise.all([
        fetchBadges(session.user.id),
        fetchMemberCourses(session.user.id),
        fetchUserProjects(session.user.id),
      ]);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async (userId: string) => {
    try {
      const { data: badgesData } = await supabase
        .from('member_badges')
        .select('badges(*)')
        .eq('member_id', userId);
      if (badgesData) {
        setBadges(badgesData.map((b: any) => b.badges).filter(Boolean));
      }
    } catch (e) {
      console.log('Table member_badges non trouvee');
    }
  };

  const fetchMemberCourses = async (userId: string) => {
    try {
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          id, user_id, course_id, status, progress, is_completed, completed_at, enrollment_date,
          courses:course_id (id, title, slug, level, description, duration, price)
        `)
        .eq('user_id', userId);

      if (error) return;

      if (enrollments && enrollments.length > 0) {
        const courses = enrollments.map((e: any) => {
          const courseData = e.courses || {};
          return {
            id: courseData.id,
            title: courseData.title || 'Cours sans titre',
            slug: courseData.slug || courseData.id,
            level: courseData.level || 'Non defini',
            description: courseData.description || '',
            duration: courseData.duration || '',
            price: courseData.price || 0,
            status: e.status || 'PENDING',
            progress: e.progress || 0,
            is_completed: e.is_completed || false,
            enrollment_date: e.enrollment_date,
            completion_date: e.completed_at,
          };
        });
        setEnrolledCourses(courses);

        const total = courses.length;
        const completed = courses.filter((c: any) => c.is_completed === true).length;
        const inProgress = courses.filter((c: any) => c.is_completed !== true).length;
        setCourseStats({ total, completed, inProgress });
      } else {
        setEnrolledCourses([]);
        setCourseStats({ total: 0, completed: 0, inProgress: 0 });
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchUserProjects = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_enrollments')
        .select(`
          id, project_id, status, role, joined_at,
          projects:project_id (id, title, slug, description, status, level, image, technologies, github_url, demo_url)
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) return;

      if (data && data.length > 0) {
        setUserProjects(data.filter((item: any) => item.projects !== null));
      } else {
        setUserProjects([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setUserProjects([]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getProjectStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'DRAFT': 'Brouillon',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Terminé',
      'ARCHIVED': 'Archivé',
    };
    return labels[status] || status;
  };

  const getProjectStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'bg-gray-100 text-gray-700',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'ARCHIVED': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  const pendingProjects = userProjects.filter(p => p.status === 'PENDING');
  const approvedProjects = userProjects.filter(p => p.status === 'APPROVED');
  const rejectedProjects = userProjects.filter(p => p.status === 'REJECTED');

  const stats = [
    {
      label: 'Formations',
      value: courseStats.total,
      icon: AcademicCapIcon,
      color: 'blue',
      href: '/dashboard/courses',
    },
    {
      label: 'En cours',
      value: courseStats.inProgress,
      icon: ClockIcon,
      color: 'orange',
      href: '/dashboard/courses',
    },
    {
      label: 'Certificats',
      value: courseStats.completed,
      icon: DocumentTextIcon,
      color: 'purple',
      href: '/certificates',
    },
    {
      label: 'Badges',
      value: badges.length,
      icon: TrophyIcon,
      color: 'yellow',
      href: '/profile',
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', gradient: 'from-blue-500 to-blue-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', gradient: 'from-orange-500 to-orange-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', gradient: 'from-purple-500 to-purple-600' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100', gradient: 'from-yellow-500 to-yellow-600' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
            <h1 className="text-lg font-bold text-slate-900">DigiCol</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {member?.full_name || user?.user_metadata?.username || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 transition font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        {/* ============================================ */}
        {/* MESSAGE DE SUCCÈS */}
        {/* ============================================ */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-3 animate-pulse">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}

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
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium mb-3 border border-blue-500/30">
                <SparklesIcon className="h-3 w-3" />
                Espace Membre
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Bonjour, {member?.full_name?.split(' ')[0] || user?.user_metadata?.username || 'Utilisateur'}
              </h1>
              <p className="text-sm text-gray-300">
                Bienvenue sur votre espace DigiCol
              </p>
            </div>

            {member?.digicol_id && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 rounded-xl">
                <p className="text-[10px] text-blue-200 uppercase tracking-wider mb-0.5">
                  Identifiant DigiCol
                </p>
                <p className="font-mono text-sm font-bold text-white">
                  {member.digicol_id}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* STATISTIQUES */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colors = colorMap[stat.color];
            return (
              <Link
                key={index}
                href={stat.href}
                className="group bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 ${colors.bg} rounded-xl group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</p>
              </Link>
            );
          })}
        </div>

        {/* ============================================ */}
        {/* BADGES */}
        {/* ============================================ */}
        {badges.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <TrophyIcon className="h-5 w-5 text-yellow-500" />
                Mes badges
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                  {badges.length}
                </span>
              </h2>
              <Link
                href="/profile"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Voir tout
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 6).map((badge) => (
                <span
                  key={badge.id}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-slate-800 px-3 py-1.5 rounded-full text-sm font-medium hover:shadow-md transition"
                  title={badge.description}
                >
                  {badge.icon} {badge.name}
                </span>
              ))}
              {badges.length > 6 && (
                <span className="inline-flex items-center bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-500 font-medium">
                  +{badges.length - 6}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* PROJETS ACTIFS */}
        {/* ============================================ */}
        {approvedProjects.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                </div>
                Mes projets actifs
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  {approvedProjects.length}
                </span>
              </h2>
              <Link
                href="/projects"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Voir tout
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {approvedProjects.slice(0, 4).map((enrollment: any) => (
                <div
                  key={enrollment.id}
                  className="group bg-white p-5 rounded-xl shadow-sm border border-green-100 hover:shadow-lg hover:border-green-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 mb-1">
                        {enrollment.projects?.title || 'Projet sans titre'}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {enrollment.projects?.description}
                      </p>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2">
                      Actif
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-4">
                    <span className={`px-2 py-0.5 rounded-full ${getProjectStatusColor(enrollment.projects?.status)}`}>
                      {getProjectStatusLabel(enrollment.projects?.status)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(enrollment.joined_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/projects/${enrollment.projects?.slug || '#'}`}
                      className="flex-1 text-center text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition font-medium"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/projects/${enrollment.projects?.slug || '#'}/contribute`}
                      className="flex-1 text-center text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition font-medium"
                    >
                      Contribuer
                    </Link>
                    {enrollment.projects?.github_url && (
                      <a
                        href={enrollment.projects.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded-lg transition"
                        title="GitHub"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* PROJETS EN ATTENTE */}
        {/* ============================================ */}
        {pendingProjects.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-yellow-50 rounded-lg">
                <ClockIcon className="h-4 w-4 text-yellow-600" />
              </div>
              Projets en attente
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                {pendingProjects.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingProjects.slice(0, 4).map((enrollment: any) => (
                <div
                  key={enrollment.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-yellow-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
                      {enrollment.projects?.title || 'Projet sans titre'}
                    </h3>
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2">
                      En attente
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {enrollment.projects?.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <CalendarIcon className="h-3 w-3" />
                    Demande du {new Date(enrollment.joined_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* PROJETS REFUSÉS */}
        {/* ============================================ */}
        {rejectedProjects.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-red-50 rounded-lg">
                <XCircleIcon className="h-4 w-4 text-red-600" />
              </div>
              Projets refusés
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                {rejectedProjects.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rejectedProjects.slice(0, 4).map((enrollment: any) => (
                <div
                  key={enrollment.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-red-100 opacity-60"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
                      {enrollment.projects?.title || 'Projet sans titre'}
                    </h3>
                    <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2">
                      Refusé
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {enrollment.projects?.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* MES FORMATIONS */}
        {/* ============================================ */}
        {enrolledCourses.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <BookOpenIcon className="h-4 w-4 text-blue-600" />
                </div>
                Mes formations en cours
              </h2>
              <Link
                href="/dashboard/courses"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Voir tout
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {enrolledCourses.slice(0, 4).map((course: any) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}/learn`}
                  className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 pr-2">
                      {course.title}
                    </h3>
                    <span className={`text-xs font-bold flex-shrink-0 ${
                      course.is_completed ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {course.is_completed ? '100%' : `${course.progress || 0}%`}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          course.is_completed
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                        style={{ width: `${course.is_completed ? 100 : course.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {course.duration || 'Durée non spécifiée'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      course.level === 'DEBUTANT' ? 'bg-green-100 text-green-700' :
                      course.level === 'INTERMEDIAIRE' ? 'bg-blue-100 text-blue-700' :
                      course.level === 'AVANCE' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {course.level}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* MENU PRINCIPAL */}
        {/* ============================================ */}
        <div className="mb-6">
          <h2 className="font-bold text-slate-900 mb-4">Accès rapide</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { href: '/courses', label: 'Formations', desc: 'Voir les cours', icon: BookOpenIcon, color: 'blue' },
              { href: '/projects', label: 'Projets', desc: 'Explorer', icon: RocketLaunchIcon, color: 'orange' },
              { href: '/dashboard/wallet', label: 'Portefeuille', desc: 'Mon budget', icon: WalletIcon, color: 'green' },
              { href: '/dashboard/carte', label: 'Ma carte', desc: 'Carte numérique', icon: IdentificationIcon, color: 'purple' },
              { href: '/certificates', label: 'Certificats', desc: 'Mes certifications', icon: DocumentTextIcon, color: 'yellow' },
              { href: '/profile', label: 'Profil', desc: 'Mes informations', icon: UserCircleIcon, color: 'pink' },
              { href: '/dashboard/courses', label: 'Mes formations', desc: 'Toutes mes inscriptions', icon: AcademicCapIcon, color: 'indigo' },
              { href: '/events', label: 'Événements', desc: 'Mes événements', icon: CalendarIcon, color: 'teal' },
            ].map((item, index) => {
              const Icon = item.icon;
              const colors = colorMap[item.color] || colorMap.blue;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all text-center"
                >
                  <div className={`w-12 h-12 mx-auto ${colors.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.label}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ============================================ */}
        {/* CTA FINAL */}
        {/* ============================================ */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 md:p-8 text-white text-center">
          <FireIcon className="h-10 w-10 mx-auto mb-3 text-blue-200" />
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            Continuez votre progression !
          </h2>
          <p className="text-blue-100 text-sm mb-5 max-w-xl mx-auto">
            Explorez de nouvelles formations et participez à des projets pour développer vos compétences.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-lg font-medium transition"
            >
              <BookOpenIcon className="h-4 w-4" />
              Voir les formations
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg font-medium border border-white/20 transition"
            >
              <RocketLaunchIcon className="h-4 w-4" />
              Rejoindre un projet
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-gray-500 mt-4">Chargement...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}