// app/dashboard/courses/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrophyIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface Course {
  id: number;
  title: string;
  slug: string;
  level: string;
  description: string;
  duration: string;
  price: number;
  status: string;
  progress: number;
  is_completed: boolean;
  enrollment_date: string;
  completion_date: string | null;
}

export default function DashboardCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const coursesPerPage = 9;

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
      await fetchEnrolledCourses(session.user.id);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async (userId: string) => {
    try {
      const { data: enrollments, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          user_id,
          course_id,
          status,
          progress,
          is_completed,
          completed_at,
          enrollment_date,
          courses:course_id (
            id,
            title,
            slug,
            level,
            description,
            duration,
            price
          )
        `)
        .eq('user_id', userId)
        .order('enrollment_date', { ascending: false });

      if (error) {
        console.error('Erreur recuperation cours:', error);
        return;
      }

      if (enrollments && enrollments.length > 0) {
        const coursesList = enrollments.map((e: any) => {
          const courseData = e.courses || {};
          return {
            id: courseData.id,
            title: courseData.title || 'Cours sans titre',
            slug: courseData.slug || String(courseData.id),
            level: courseData.level || 'Non defini',
            description: courseData.description || '',
            duration: courseData.duration || '',
            price: courseData.price || 0,
            status: e.status || 'PENDING',
            progress: e.progress || 0,
            is_completed: e.is_completed || false,
            enrollment_date: e.enrollment_date,
            completion_date: e.completed_at || null,
          };
        });
        setCourses(coursesList);
        setFilteredCourses(coursesList);
        setTotalPages(Math.ceil(coursesList.length / coursesPerPage));
      } else {
        setCourses([]);
        setFilteredCourses([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, statusFilter, levelFilter);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(searchQuery, status, levelFilter);
    setCurrentPage(1);
  };

  const handleLevelFilter = (level: string) => {
    setLevelFilter(level);
    applyFilters(searchQuery, statusFilter, level);
    setCurrentPage(1);
  };

  const applyFilters = (query: string, status: string, level: string) => {
    let filtered = [...courses];

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }

    if (status !== 'all') {
      if (status === 'completed') {
        filtered = filtered.filter(c => c.is_completed === true);
      } else if (status === 'in_progress') {
        filtered = filtered.filter(c => c.is_completed === false && c.status !== 'PENDING');
      } else if (status === 'pending') {
        filtered = filtered.filter(c => c.status === 'PENDING');
      }
    }

    if (level !== 'all') {
      filtered = filtered.filter(c => c.level === level);
    }

    setFilteredCourses(filtered);
    setTotalPages(Math.ceil(filtered.length / coursesPerPage));
  };

  const getStatusLabel = (status: string, isCompleted: boolean) => {
    if (isCompleted) return 'Termine';
    if (status === 'PENDING') return 'En attente';
    return 'En cours';
  };

  const getStatusColor = (status: string, isCompleted: boolean) => {
    if (isCompleted) return 'bg-green-100 text-green-700';
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (isCompleted) return <CheckCircleIcon className="h-4 w-4" />;
    if (status === 'PENDING') return <ClockIcon className="h-4 w-4" />;
    return <BookOpenIcon className="h-4 w-4" />;
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

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'DEBUTANT': 'bg-green-100 text-green-700',
      'INTERMEDIAIRE': 'bg-blue-100 text-blue-700',
      'AVANCE': 'bg-orange-100 text-orange-700',
      'EXPERT': 'bg-red-100 text-red-700',
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  const getLevelBadgeColor = (level: string) => {
    const colors: Record<string, string> = {
      'DEBUTANT': 'border-green-200 bg-green-50',
      'INTERMEDIAIRE': 'border-blue-200 bg-blue-50',
      'AVANCE': 'border-orange-200 bg-orange-50',
      'EXPERT': 'border-red-200 bg-red-50',
    };
    return colors[level] || 'border-gray-200 bg-gray-50';
  };

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Calcul des statistiques
  const stats = {
    total: filteredCourses.length,
    inProgress: filteredCourses.filter(c => !c.is_completed && c.status !== 'PENDING').length,
    completed: filteredCourses.filter(c => c.is_completed).length,
    pending: filteredCourses.filter(c => c.status === 'PENDING').length,
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
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold text-slate-800">Mes formations</h1>
            <span className="text-sm text-gray-500">({filteredCourses.length})</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/courses" className="text-sm text-blue-600 hover:underline">
              Explorer
            </Link>
            <Link href="/certificates" className="text-sm text-blue-600 hover:underline">
              Certificats
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Barre de recherche et filtres */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Rechercher une formation..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Termines</option>
                <option value="pending">En attente</option>
              </select>

              <select
                value={levelFilter}
                onChange={(e) => handleLevelFilter(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="all">Tous les niveaux</option>
                <option value="DEBUTANT">Debutant</option>
                <option value="INTERMEDIAIRE">Intermédiaire</option>
                <option value="AVANCE">Avance</option>
                <option value="EXPERT">Expert</option>
              </select>

              {(statusFilter !== 'all' || levelFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setLevelFilter('all');
                    applyFilters('', 'all', 'all');
                  }}
                  className="px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <BookOpenIcon className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-gray-500">En cours</p>
            </div>
            <p className="text-xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <TrophyIcon className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-500">Terminees</p>
            </div>
            <p className="text-xl font-bold text-green-600 mt-1">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-yellow-600" />
              <p className="text-xs text-gray-500">En attente</p>
            </div>
            <p className="text-xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
          </div>
        </div>

        {/* Liste des formations */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <BookOpenIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Aucune formation</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all' || levelFilter !== 'all'
                ? 'Aucune formation ne correspond a vos criteres'
                : 'Vous n\'etes inscrit a aucune formation pour le moment. Explorez notre catalogue !'}
            </p>
            <Link
              href="/courses"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition"
            >
              Explorer les formations
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition group"
                >
                  <Link href={`/courses/${course.slug}/learn`} className="block p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 group-hover:text-blue-600 transition">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full ${getLevelColor(course.level)}`}>
                            {getLevelLabel(course.level)}
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 ${getStatusColor(course.status, course.is_completed)}`}>
                            {getStatusIcon(course.status, course.is_completed)}
                            {getStatusLabel(course.status, course.is_completed)}
                          </span>
                        </div>
                      </div>
                      {course.is_completed && (
                        <div className="flex-shrink-0 ml-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircleIcon className="h-3 w-3" />
                            Certifie
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progression</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            course.is_completed ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                      <span>{course.duration || 'Durée non specifiee'}</span>
                      <span>
                        {new Date(course.enrollment_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {!course.is_completed && course.status !== 'PENDING' && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-blue-600 group-hover:underline flex items-center gap-1">
                          Continuer l'apprentissage →
                        </span>
                      </div>
                    )}
                    {course.status === 'PENDING' && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-yellow-600 flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" />
                          En attente de validation
                        </span>
                      </div>
                    )}
                  </Link>
                  {course.is_completed && (
                    <div className="px-5 pb-4 pt-0 border-t border-gray-100">
                      <div className="flex items-center gap-2 mt-3">
                        <Link
                          href={`/certificates/generate/${course.id}`}
                          className="flex-1 text-center text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition"
                        >
                          Generer le certificat
                        </Link>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg transition"
                        >
                          Revoir
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Precedent
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3.5 py-1.5 text-sm rounded-lg transition ${
                        currentPage === number
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Suivant
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}