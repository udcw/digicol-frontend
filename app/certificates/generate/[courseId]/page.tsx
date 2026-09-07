// app/certificates/generate/[courseId]/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

export default function GenerateCertificatePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [certificate, setCertificate] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkEligibility();
  }, [courseId]);

  const checkEligibility = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // 1. Vérifier la formation
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (!courseData) {
        setError('Formation non trouvée');
        return;
      }
      setCourse(courseData);

      // 2. Vérifier l'inscription
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', session.user.id)
        .single();

      if (!enrollmentData) {
        setError('Vous n\'êtes pas inscrit à cette formation');
        return;
      }

      if (!enrollmentData.is_completed) {
        setError('Vous devez terminer la formation avant de générer un certificat');
        return;
      }

      setEnrollment(enrollmentData);

      // 3. Vérifier si un certificat existe déjà
      const { data: certData } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('course_id', courseId)
        .single();

      if (certData) {
        setCertificate(certData);
      }

    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('certificates')
        .insert({
          user_id: session.user.id,
          course_id: Number(courseId),
          title: `Certification ${course.title}`,
          description: `Certificat délivré pour la formation "${course.title}"`,
          issued_date: new Date().toISOString(),
          is_verified: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Marquer le certificat comme généré
      await supabase
        .from('enrollments')
        .update({ certificate_generated: true })
        .eq('id', enrollment.id);

      setCertificate(data);
      alert('✅ Certificat généré avec succès !');
      router.push(`/certificates/${data.id}`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la génération du certificat');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <AcademicCapIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Accès non autorisé</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Certificat déjà généré</h2>
          <p className="text-gray-500 mb-6">
            Vous avez déjà un certificat pour cette formation.
          </p>
          <Link
            href={`/certificates/${certificate.id}`}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Voir mon certificat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <DocumentTextIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Générer votre certificat
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Vous avez terminé la formation <strong>{course?.title}</strong>.
            Vous êtes éligible pour recevoir votre certificat.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="font-medium">Formation terminée avec succès</span>
            </div>
          </div>

          <button
            onClick={generateCertificate}
            disabled={generating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
          >
            {generating ? 'Génération en cours...' : '🎓 Générer mon certificat'}
          </button>

          <Link
            href={`/courses/${course?.slug}/learn`}
            className="block text-sm text-gray-500 hover:text-gray-700 mt-4"
          >
            ← Retour à la formation
          </Link>
        </div>
      </div>
    </div>
  );
}