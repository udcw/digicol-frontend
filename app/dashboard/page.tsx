// app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [courseStats, setCourseStats] = useState({ total: 0, completed: 0, inProgress: 0 });

  useEffect(() => {
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

      // Récupérer le membre depuis la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('Erreur récupération membre:', userError);
      } else {
        setMember(userData);
      }

      // Récupérer les badges du membre
      const { data: badgesData } = await supabase
        .from('member_badges')
        .select('badges(*)')
        .eq('member_id', session.user.id);

      if (badgesData) {
        setBadges(badgesData.map((b: any) => b.badges).filter(Boolean));
      }

      // Récupérer les cours du membre
      await fetchMemberCourses(session.user.id);

    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberCourses = async (userId: string) => {
    try {
      // Récupérer les inscriptions aux cours
      const { data: enrollments, error } = await supabase
        .from('course_enrollments')
        .select(`
          course_id,
          status,
          progress,
          courses:course_id (
            id,
            title,
            level,
            description,
            duration,
            instructor_id,
            category_id
          )
        `)
        .eq('member_id', userId);

      if (error) {
        console.error('Erreur récupération cours:', error);
        return;
      }

      if (enrollments) {
        const courses = enrollments.map((e: any) => ({
          ...e.courses,
          status: e.status,
          progress: e.progress || 0,
        }));
        setEnrolledCourses(courses);

        // Statistiques
        const total = courses.length;
        const completed = courses.filter((c: any) => c.status === 'COMPLETED').length;
        const inProgress = courses.filter((c: any) => c.status === 'IN_PROGRESS').length;
        setCourseStats({ total, completed, inProgress });
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">DigiCol</h1>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-600 hidden sm:block">
              {member?.full_name || user?.user_metadata?.username || user?.email}
            </span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 transition">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* En-tête avec identifiant DigiCol */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                Bonjour, {member?.full_name || user?.user_metadata?.username || 'Utilisateur'} 
              </h1>
              <p className="text-sm md:text-base text-gray-500">Bienvenue sur votre espace DigiCol</p>
            </div>
            {member?.digicol_id && (
              <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                <p className="text-xs text-gray-500">Identifiant DigiCol</p>
                <p className="font-mono text-sm font-semibold text-blue-600">{member.digicol_id}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cartes d'information */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <AcademicCapIcon className="h-5 w-5 text-blue-600" />
              <p className="text-xs text-gray-500 font-medium">Formations</p>
            </div>
            <p className="text-xl font-bold text-slate-900">{courseStats.total}</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <ClockIcon className="h-5 w-5 text-green-600" />
              <p className="text-xs text-gray-500 font-medium">En cours</p>
            </div>
            <p className="text-xl font-bold text-slate-900">{courseStats.inProgress}</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <DocumentTextIcon className="h-5 w-5 text-purple-600" />
              <p className="text-xs text-gray-500 font-medium">Certificats</p>
            </div>
            <p className="text-xl font-bold text-slate-900">{courseStats.completed}</p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <TrophyIcon className="h-5 w-5 text-orange-600" />
              <p className="text-xs text-gray-500 font-medium">Badges</p>
            </div>
            <p className="text-xl font-bold text-slate-900">{badges.length}</p>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-slate-900 text-base mb-3">🏅 Mes badges</h2>
            <div className="flex flex-wrap gap-2">
              {badges.slice(0, 6).map((badge) => (
                <span
                  key={badge.id}
                  className="inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-gray-200 text-sm"
                  title={badge.description}
                >
                  {badge.icon} {badge.name}
                </span>
              ))}
              {badges.length > 6 && (
                <span className="inline-flex items-center bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-500">
                  +{badges.length - 6}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Mes formations */}
        {enrolledCourses.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-slate-900 text-base mb-3">Mes formations en cours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {enrolledCourses.slice(0, 4).map((course: any) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <h3 className="font-semibold text-slate-800 text-sm">{course.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{course.level}</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${course.progress || 0}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{course.progress || 0}%</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Menu principal */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          <Link href="/courses" className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
            <BookOpenIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Formations</h2>
              <p className="text-xs text-gray-500 mt-0.5">Voir les cours</p>
            </div>
          </Link>
          <Link href="/projects" className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
            <RocketLaunchIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Projets</h2>
              <p className="text-xs text-gray-500 mt-0.5">Gérer mes projets</p>
            </div>
          </Link>
          <Link href="/dashboard/carte" className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
            <IdentificationIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Ma carte</h2>
              <p className="text-xs text-gray-500 mt-0.5">Carte numérique</p>
            </div>
          </Link>
          <Link href="/certificates" className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
            <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Certificats</h2>
              <p className="text-xs text-gray-500 mt-0.5">Mes certifications</p>
            </div>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
            <UserCircleIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Profil</h2>
              <p className="text-xs text-gray-500 mt-0.5">Mes informations</p>
            </div>
          </Link>
          <Link href="/events" className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Événements</h2>
              <p className="text-xs text-gray-500 mt-0.5">Mes événements</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}