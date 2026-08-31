// app/courses/page.tsx - Version responsive

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { courses } from '@/lib/api';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  level: string;
  duration: string;
  price: number;
  category_name: string;
  is_available: boolean;
  instructor_name: string;
}

export default function CoursesPage() {
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courses.list();
      setCoursesList(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur chargement des formations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      'DEBUTANT': 'Débutant',
      'INTERMEDIAIRE': 'Intermédiaire',
      'AVANCE': 'Avancé',
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

  const filteredCourses = filter === 'all' 
    ? coursesList 
    : coursesList.filter(c => c.level === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement des formations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Nos formations</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Développez vos compétences avec DigiCol</p>
        </div>

        {/* Filtres - Version responsive avec scroll horizontal sur mobile */}
        <div className="flex flex-nowrap md:flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0 mb-6 md:mb-8 scrollbar-hide">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('DEBUTANT')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'DEBUTANT'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Débutant
          </button>
          <button
            onClick={() => setFilter('INTERMEDIAIRE')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'INTERMEDIAIRE'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Intermédiaire
          </button>
          <button
            onClick={() => setFilter('AVANCE')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
              filter === 'AVANCE'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Avancé
          </button>
        </div>

        {/* Liste des formations - Grille responsive */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">Aucune formation disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition"
              >
                {course.image ? (
                  <div className="h-40 md:h-48 bg-gray-200 relative">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 md:h-48 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                    <span className="text-white text-3xl md:text-4xl font-bold">DigiCol</span>
                  </div>
                )}
                <div className="p-4 md:p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getLevelColor(course.level)}`}>
                      {getLevelLabel(course.level)}
                    </span>
                    <span className="text-xs text-gray-400">{course.duration}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 mb-2 line-clamp-2">
                    {course.description}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 mb-3">
                    {course.category_name} · {course.instructor_name}
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <span className="text-lg md:text-xl font-bold text-blue-600">
                      {course.price === 0 ? 'Gratuit' : `${course.price} FCFA`}
                    </span>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="text-xs md:text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 md:py-2 rounded-lg transition w-full sm:w-auto text-center"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}