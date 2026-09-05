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
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [courseStats, setCourseStats] = useState({ total: 0, completed: 0, inProgress: 0 });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const approved = searchParams.get('notification');
    const project = searchParams.get('project');

    if (approved === 'approved' && project) {
      setSuccessMessage(`Votre inscription au projet "${project}" a ete approuvee !`);
      
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
        fetchNotifications(session.user.id),
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
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur recuperation cours:', error);
        return;
      }

      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map((e: any) => e.course_id).filter(Boolean);
        
        if (courseIds.length > 0) {
          const { data: courses, error: coursesError } = await supabase
            .from('courses')
            .select('id, title, level, description, duration, price')
            .in('id', courseIds);

          if (!coursesError && courses) {
            const coursesWithProgress = enrollments.map((e: any) => {
              const courseData = courses.find((c: any) => c.id === e.course_id);
              return {
                id: courseData?.id || e.course_id,
                title: courseData?.title || 'Cours sans titre',
                level: courseData?.level || 'Non defini',
                description: courseData?.description || '',
                duration: courseData?.duration || '',
                price: courseData?.price || 0,
                status: e.status || 'PENDING',
                progress: e.progress || 0,
                enrollment_date: e.enrollment_date,
                completion_date: e.completion_date,
              };
            });

            setEnrolledCourses(coursesWithProgress);

            const total = coursesWithProgress.length;
            const completed = coursesWithProgress.filter((c: any) => c.status === 'COMPLETED').length;
            const inProgress = coursesWithProgress.filter((c: any) => c.status === 'IN_PROGRESS' || c.status === 'PENDING').length;
            setCourseStats({ total, completed, inProgress });
          }
        }
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
          id,
          project_id,
          status,
          role,
          joined_at,
          projects:project_id (
            id,
            title,
            slug,
            description,
            status,
            level,
            image,
            technologies,
            github_url,
            demo_url
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Erreur recuperation projets:', error);
        return;
      }

      if (data && data.length > 0) {
        const validProjects = data.filter((item: any) => item.projects !== null);
        setUserProjects(validProjects);
      } else {
        setUserProjects([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setUserProjects([]);
    }
  };

  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erreur notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (!error) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'APPROVED': 'bg-green-100 text-green-700',
      'REJECTED': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'APPROVED': 'Approuve',
      'REJECTED': 'Refuse',
    };
    return labels[status] || status;
  };

  const getProjectStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'DRAFT': 'Brouillon',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Termine',
      'ARCHIVED': 'Archive',
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

  const getNotificationLink = (notification: any): { href: string; text: string } => {
    if (notification.link && notification.link !== '#' && notification.link !== '/dashboard') {
      return {
        href: notification.link,
        text: 'Voir les details →',
      };
    }

    if (notification.type === 'PROJECT_ENROLLMENT') {
      return {
        href: '/projects',
        text: 'Voir mes projets →',
      };
    }

    switch (notification.type) {
      case 'COURSE_ENROLLMENT':
        return {
          href: '/courses',
          text: 'Voir mes formations →',
        };
      case 'CERTIFICATE_ISSUED':
        return {
          href: '/certificates',
          text: 'Voir mes certificats →',
        };
      case 'EVENT_REMINDER':
        return {
          href: '/events',
          text: 'Voir les evenements →',
        };
      default:
        return {
          href: '/dashboard',
          text: 'Voir le tableau de bord →',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingProjects = userProjects.filter(p => p.status === 'PENDING');
  const approvedProjects = userProjects.filter(p => p.status === 'APPROVED');
  const rejectedProjects = userProjects.filter(p => p.status === 'REJECTED');

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
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

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

        {notifications.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <BellIcon className="h-5 w-5 text-blue-600" />
              Notifications
              {notifications.filter((n: any) => !n.is_read).length > 0 && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {notifications.filter((n: any) => !n.is_read).length}
                </span>
              )}
            </h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {notifications.slice(0, 5).map((notif: any) => {
                const { href, text } = getNotificationLink(notif);
                
                return (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`bg-white p-4 rounded-xl shadow-sm border cursor-pointer transition ${
                      notif.is_read ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800 text-sm">{notif.title}</p>
                          {!notif.is_read && (
                            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              Nouveau
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                        {href && href !== '#' && (
                          <Link
                            href={href}
                            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {text}
                          </Link>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                        {new Date(notif.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

        {badges.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-slate-900 text-base mb-3">Mes badges</h2>
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

        {approvedProjects.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              Mes projets actifs ({approvedProjects.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {approvedProjects.slice(0, 4).map((enrollment: any) => (
                <div key={enrollment.id} className="bg-white p-4 rounded-xl shadow-sm border border-green-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 text-sm">
                      {enrollment.projects?.title || 'Projet sans titre'}
                    </h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Actif
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {enrollment.projects?.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${getProjectStatusColor(enrollment.projects?.status)}`}>
                      {getProjectStatusLabel(enrollment.projects?.status)}
                    </span>
                    <span>•</span>
                    <span>Rejoint le {new Date(enrollment.joined_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/projects/${enrollment.projects?.slug || '#'}`}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition"
                    >
                      Voir le projet
                    </Link>
                    <Link
                      href={`/projects/${enrollment.projects?.slug || '#'}/contribute`}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition"
                    >
                      Contribuer
                    </Link>
                    {enrollment.projects?.github_url && (
                      <a
                        href={enrollment.projects.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-800 hover:bg-gray-900 text-white px-3 py-1 rounded-lg transition"
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {approvedProjects.length > 4 && (
              <Link href="/projects" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                Voir tous mes projets actifs ({approvedProjects.length})
              </Link>
            )}
          </div>
        )}

        {pendingProjects.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
              Projets en attente de validation ({pendingProjects.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingProjects.slice(0, 4).map((enrollment: any) => (
                <div
                  key={enrollment.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-yellow-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 text-sm">
                      {enrollment.projects?.title || 'Projet sans titre'}
                    </h3>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      En attente
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {enrollment.projects?.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <span>Demande du {new Date(enrollment.joined_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              ))}
            </div>
            {pendingProjects.length > 4 && (
              <p className="text-sm text-gray-500 mt-2">
                +{pendingProjects.length - 4} autres projets en attente
              </p>
            )}
          </div>
        )}

        {rejectedProjects.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <XCircleIcon className="h-5 w-5 text-red-600" />
              Projets refuses ({rejectedProjects.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rejectedProjects.slice(0, 4).map((enrollment: any) => (
                <div
                  key={enrollment.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-red-200 opacity-70"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 text-sm">
                      {enrollment.projects?.title || 'Projet sans titre'}
                    </h3>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Refuse
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {enrollment.projects?.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <span>Demande du {new Date(enrollment.joined_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              <p className="text-xs text-gray-500 mt-0.5">Explorer les projets</p>
            </div>
          </Link>
          <Link href="/dashboard/carte" className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition text-center">
            <IdentificationIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Ma carte</h2>
              <p className="text-xs text-gray-500 mt-0.5">Carte numerique</p>
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
              <h2 className="font-bold text-slate-900 text-sm">Evenements</h2>
              <p className="text-xs text-gray-500 mt-0.5">Mes evenements</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}