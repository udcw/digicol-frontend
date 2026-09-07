// app/courses/[slug]/enroll/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeftIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  level: string;
  duration: string;
  price: number;
  is_published: boolean;
}

export default function EnrollPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);

  useEffect(() => {
    fetchCourseAndCheckEnrollment();
  }, [slug]);

  const fetchCourseAndCheckEnrollment = async () => {
    try {
      console.log('Récupération de la formation:', slug);

      // 1. Récupérer la formation
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single();

      if (courseError) {
        console.error(' Erreur cours:', courseError);
        if (courseError.code === 'PGRST116') {
          setError('Formation non trouvée');
        } else {
          setError('Erreur lors du chargement');
        }
        setLoading(false);
        return;
      }

      if (!courseData) {
        setError('Formation non trouvée');
        setLoading(false);
        return;
      }

      console.log(' Formation trouvée:', courseData.title);
      setCourse(courseData);

      // 2. Vérifier si l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('👤 Non connecté');
        setLoading(false);
        return;
      }

      console.log(' Vérification inscription pour:', session.user.email);

      // 3. Vérifier l'inscription
      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .select('id, status, progress, is_completed')
        .eq('user_id', session.user.id)
        .eq('course_id', courseData.id)
        .maybeSingle();

      if (enrollError && enrollError.code !== 'PGRST116') {
        console.error(' Erreur vérification:', enrollError);
      }

      if (enrollment) {
        console.log(' Déjà inscrit:', enrollment);
        setIsAlreadyEnrolled(true);
        setEnrollmentProgress(enrollment.progress || 0);

        // Rediriger vers la page d'apprentissage après 2 secondes
        setTimeout(() => {
          router.replace(`/courses/${slug}/learn`);
        }, 2000);
      } else {
        console.log(' Non inscrit');
        setIsAlreadyEnrolled(false);
      }

      setLoading(false);
    } catch (error) {
      console.error(' Erreur:', error);
      setError('Erreur lors du chargement');
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!course) {
      setError('Formation non trouvée');
      return;
    }

    console.log('Début de l\'inscription...');
    setSubmitting(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('👤 Session:', session?.user?.email);

      if (!session) {
        console.log('Non connecté, redirection vers login');
        router.push('/login');
        return;
      }

      // Vérifier une dernière fois
      const { data: existing, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('course_id', course.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(' Erreur vérification:', checkError);
      }

      if (existing) {
        console.log(' Déjà inscrit (vérification finale)');
        router.replace(`/courses/${slug}/learn`);
        return;
      }

      console.log(' Création de l\'inscription...');

      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: session.user.id,
          course_id: course.id,
          status: 'ACTIVE',
          progress: 0,
          is_completed: false,
          enrollment_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (enrollError) {
        if (enrollError.code === '23505') {
          console.log(' Déjà inscrit (erreur unique)');
          router.replace(`/courses/${slug}/learn`);
          return;
        }
        console.error(' Erreur inscription:', enrollError);
        throw enrollError;
      }

      console.log(' Inscription créée:', enrollment);
      router.replace(`/courses/${slug}/learn`);

    } catch (error: any) {
      console.error(' Erreur:', error);
      setError(error.message || 'Erreur lors de l\'inscription');
      setSubmitting(false);
    } finally {
      setSubmitting(false);
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Formation non trouvée</h2>
          <p className="text-gray-500 mb-6">{error || 'La formation n\'existe pas.'}</p>
          <Link href="/courses" className="text-blue-600 hover:underline">
            Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Si déjà inscrit, afficher un message de redirection
  if (isAlreadyEnrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <AcademicCapIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2"> Déjà inscrit !</h2>
          <p className="text-gray-500 mb-2">
            Vous êtes déjà inscrit à cette formation.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Progression: {enrollmentProgress}%
          </p>
          <div className="bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${enrollmentProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Redirection vers la formation dans quelques secondes...
          </p>
          <Link
            href={`/courses/${slug}/learn`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Aller à la formation →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href={`/courses/${slug}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-6">
          <ArrowLeftIcon className="h-4 w-4" />
          Retour à la formation
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white text-center">
            <AcademicCapIcon className="h-12 w-12 mx-auto mb-3" />
            <h1 className="text-2xl font-bold">Inscription à la formation</h1>
            <p className="text-blue-100 mt-1">{course.title}</p>
          </div>

          <div className="p-6">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-gray-600">Formation</span>
                <span className="font-medium">{course.title}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-gray-600">Niveau</span>
                <span className="font-medium">{getLevelLabel(course.level)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-gray-600">Durée</span>
                <span className="font-medium">{course.duration || 'Non spécifiée'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-gray-600">Prix</span>
                <span className="font-medium text-blue-600">
                  {course.price === 0 ? 'Gratuit' : `${course.price} FCFA`}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleEnroll}
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {submitting ? 'Inscription en cours...' : "S'inscrire maintenant"}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              En vous inscrivant, vous acceptez les conditions d'utilisation de DigiCol
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}