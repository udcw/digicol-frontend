// app/admin/courses/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ArrowLeftIcon, BookOpenIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Course {
  id: number;
  title: string;
  level: string;
  price: number;
  is_published: boolean;
  category: { name: string } | null;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchCourses();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }
    const role = session.user?.user_metadata?.role;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      router.push('/admin/login');
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses_course')
        .select(`
          id,
          title,
          level,
          price,
          is_published,
          category:category_id (name)
        `)
        .order('id', { ascending: false });

      if (error) throw error;

      // Formater les données
      const formattedData: Course[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        level: item.level,
        price: item.price,
        is_published: item.is_published,
        category: item.category && Array.isArray(item.category) && item.category.length > 0
          ? { name: item.category[0].name }
          : null
      }));

      setCourses(formattedData);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><BookOpenIcon className="h-6 w-6 text-blue-600" /></div>
            <h1 className="text-2xl font-bold text-slate-800">Gestion des formations</h1>
            <span className="text-sm text-gray-500 ml-2">({courses.length})</span>
          </div>
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            <PlusIcon className="h-4 w-4" /> Nouvelle formation
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">ID</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Titre</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Catégorie</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Niveau</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Prix</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-12">
                    <BookOpenIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>Aucune formation</p>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-500">{course.id}</td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-800">{course.title}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{course.category?.name || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{course.level}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{course.price} FCFA</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {course.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}