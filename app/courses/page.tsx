// app/courses/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, Course } from '@/lib/supabase';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, category:categories(*)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Erreur:', error);
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

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(c => c.level === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Nos formations</h1>
        <p className="text-gray-500 mb-6">Développez vos compétences avec DigiCol</p>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('DEBUTANT')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'DEBUTANT' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Débutant
          </button>
          <button
            onClick={() => setFilter('INTERMEDIAIRE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'INTERMEDIAIRE' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Intermédiaire
          </button>
          <button
            onClick={() => setFilter('AVANCE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'AVANCE' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Avancé
          </button>
        </div>

        {/* Liste */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">Aucune formation disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition group"
              >
                <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">DigiCol</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {course.category?.name || 'Formation'}
                    </span>
                    <span className="text-xs text-gray-400">{getLevelLabel(course.level)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      {course.price === 0 ? 'Gratuit' : `${course.price} FCFA`}
                    </span>
                    <span className="text-sm text-blue-600 group-hover:underline">
                      Voir les détails →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}