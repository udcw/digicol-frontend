// app/courses/[slug]/page.tsx - Version corrigée

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { courses } from '@/lib/api';

interface CourseDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  level: string;
  duration: string;
  program: string;
  prerequisites: string;
  price: number;
  category_name: string;
  instructor_name: string;
  is_available: boolean;
  available_seats: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  const fetchCourse = async () => {
    try {
      // Récupérer d'abord la liste des cours pour trouver l'ID
      const response = await courses.list();
      const coursesList = response.data.results || response.data || [];
      
      // Trouver le cours par slug
      const foundCourse = coursesList.find((c: any) => c.slug === slug);
      
      if (foundCourse) {
        // Récupérer les détails du cours avec son ID (nombre)
        const detailResponse = await courses.detail(foundCourse.id);
        setCourse(detailResponse.data);
      } else {
        setError('Formation non trouvée');
      }
    } catch (error) {
      setError('Erreur lors du chargement');
      console.error(error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-red-600">{error || 'Formation non trouvée'}</p>
          <Link href="/courses" className="text-blue-600 hover:underline mt-4 block">
            Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/courses" className="text-blue-600 hover:underline mb-6 inline-block text-sm md:text-base">
          ← Retour aux formations
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-48 md:h-64 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-white text-3xl md:text-5xl font-bold">DigiCol</span>
          </div>

          <div className="p-4 md:p-8">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
              <span className="text-xs md:text-sm bg-blue-100 text-blue-700 px-2 md:px-3 py-1 rounded-full">
                {course.category_name}
              </span>
              <span className={`text-xs md:text-sm px-2 md:px-3 py-1 rounded-full ${getLevelColor(course.level)}`}>
                {getLevelLabel(course.level)}
              </span>
              <span className="text-xs md:text-sm text-gray-400">{course.duration}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{course.title}</h1>

            <p className="text-sm md:text-lg text-gray-600 mb-6">{course.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 mb-6">
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-500">Formateur</p>
                <p className="text-sm md:text-base font-medium">{course.instructor_name}</p>
              </div>
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <p className="text-xs md:text-sm text-gray-500">Prix</p>
                <p className="text-lg md:text-xl font-bold text-blue-600">
                  {course.price === 0 ? 'Gratuit' : `${course.price} FCFA`}
                </p>
              </div>
            </div>

            {course.prerequisites && (
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-2 text-sm md:text-base">Prérequis</h3>
                <p className="text-sm md:text-base text-gray-600">{course.prerequisites}</p>
              </div>
            )}

            {course.program && (
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-2 text-sm md:text-base">Programme</h3>
                <div className="text-sm md:text-base text-gray-600 whitespace-pre-line">
                  {course.program}
                </div>
              </div>
            )}

            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
              <button
                disabled={!course.is_available}
                className={`px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-medium transition w-full sm:w-auto text-sm md:text-base ${
                  course.is_available
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {course.is_available ? "S'inscrire" : 'Complet'}
              </button>
              {course.is_available && (
                <span className="text-xs md:text-sm text-gray-500">
                  {course.available_seats} places disponibles
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}