// app/courses/[slug]/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  level: string;
  duration: string;
  program: string;
  prerequisites: string;
  price: number;
  available_seats: number;
  is_published: boolean;
  category_id: number;
  instructor_id: string;
  created_at: string;
  category?: {
    id: number;
    name: string;
  };
  instructor?: {
    id: string;
    username: string;
    full_name: string;
    email: string;
  };
}

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          category:categories (
            id,
            name
          ),
          instructor:users (
            id,
            username,
            full_name,
            email
          )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Cette formation n\'existe pas ou n\'est pas encore publiee.');
        } else {
          setError('Erreur lors du chargement de la formation.');
        }
        return;
      }

      if (!data) {
        setError('Formation non trouvee.');
        return;
      }

      setCourse(data);
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
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

  const getPriceText = (price: number) => {
    if (price === 0) return 'Gratuit';
    return `${price.toLocaleString()} FCFA`;
  };

  // Fonction pour afficher le programme avec des sauts de ligne
  const renderProgram = (program: string) => {
    if (!program) return null;
    
    // Remplacer les \n par des <br /> et traiter les tirets
    const lines = program.split('\n').filter(line => line.trim() !== '');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      // Si la ligne commence par un tiret, c'est un sous-point
      if (trimmedLine.startsWith('-')) {
        return (
          <div key={index} className="flex items-start gap-2 ml-4 text-gray-600">
            <span className="text-blue-500">•</span>
            <span>{trimmedLine.substring(1).trim()}</span>
          </div>
        );
      }
      // Si la ligne commence par "Module", c'est un titre
      if (trimmedLine.toLowerCase().startsWith('module')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-slate-800 mt-4 mb-2">
            {trimmedLine}
          </h3>
        );
      }
      // Ligne normale
      return (
        <p key={index} className="text-gray-600 mb-1">
          {trimmedLine}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Formation non trouvee</h2>
          <p className="text-gray-500 mb-6">{error || 'Le cours que vous recherchez n\'existe pas.'}</p>
          <Link 
            href="/courses" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Fil d'Ariane */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">Accueil</Link>
          <span>›</span>
          <Link href="/courses" className="hover:text-blue-600 transition">Formations</Link>
          <span>›</span>
          <span className="text-slate-800 font-medium">{course.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Bannière */}
              <div className="h-56 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center relative">
                <div className="text-center text-white">
                  <span className="text-4xl font-bold">DigiCol</span>
                  <p className="text-sm opacity-80 mt-1">Formation en ligne</p>
                </div>
                <span className={`absolute top-4 right-4 text-sm px-3 py-1 rounded-full ${getLevelColor(course.level)}`}>
                  {getLevelLabel(course.level)}
                </span>
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">{course.title}</h1>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    {course.category?.name || 'Formation'}
                  </span>
                  <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    Duree: {course.duration}
                  </span>
                  {course.instructor && (
                    <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                      Formateur: {course.instructor.full_name || course.instructor.username}
                    </span>
                  )}
                </div>

                {/* Description */}
                {course.description && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Description</h2>
                    <p className="text-gray-600 leading-relaxed">{course.description}</p>
                  </div>
                )}

                {/* Prérequis */}
                {course.prerequisites && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Prerequis</h2>
                    <p className="text-gray-600 leading-relaxed">{course.prerequisites}</p>
                  </div>
                )}

                {/* Programme - VERSION CORRIGEE */}
                {course.program && (
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">Programme de la formation</h2>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {renderProgram(course.program)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              {/* Prix */}
              <div className="text-center border-b pb-4 mb-4">
                <div className="text-3xl font-bold text-blue-600">
                  {getPriceText(course.price)}
                </div>
                {course.price > 0 && (
                  <p className="text-sm text-gray-500 mt-1">TVA incluse</p>
                )}
              </div>

              {/* Informations */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Niveau</span>
                  <span className="font-medium">{getLevelLabel(course.level)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duree</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Places disponibles</span>
                  <span className="font-medium">{course.available_seats}</span>
                </div>
                {course.instructor && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Formateur</span>
                    <span className="font-medium">{course.instructor.full_name || course.instructor.username}</span>
                  </div>
                )}
              </div>

              {/* Bouton d'inscription */}
              <button 
                onClick={() => {
                  if (course.price === 0) {
                    router.push(`/courses/${course.slug}/enroll`);
                  } else {
                    router.push(`/checkout/${course.slug}`);
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                {course.price === 0 ? "S'inscrire gratuitement" : "S'inscrire maintenant"}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Acces illimite • Certificat inclus
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}