// app/checkout/[slug]/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeftIcon, WalletIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      // 1. Récupérer la formation
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!courseData) {
        setError('Formation non trouvée');
        return;
      }
      setCourse(courseData);

      // 2. Récupérer le wallet de l'utilisateur
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      setWallet(walletData);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!course) return;

    setSubmitting(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Vérifier le solde
      if ((wallet?.balance || 0) < course.price) {
        setError('Solde insuffisant. Veuillez recharger votre portefeuille.');
        setSubmitting(false);
        return;
      }

      // 1. Créer l'inscription
      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: session.user.id,
          course_id: course.id,
          status: 'ACTIVE',
          progress: 0,
          is_completed: false,
          enrollment_date: new Date().toISOString(),
          is_paid: true,
          payment_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (enrollError) throw enrollError;

      // 2. Débiter le wallet
      await supabase
        .from('transactions')
        .insert({
          wallet_id: wallet.id,
          amount: -course.price,
          type: 'DEBIT',
          description: `Formation: ${course.title}`,
          category: 'FORMATION',
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
        });

      // 3. Mettre à jour le solde
      await supabase
        .from('wallets')
        .update({ 
          balance: (wallet?.balance || 0) - course.price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id);

      router.push(`/courses/${slug}/learn`);
    } catch (error: any) {
      console.error('Erreur:', error);
      setError(error.message || 'Erreur lors du paiement');
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
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/courses" className="text-blue-600 hover:underline">
            Retour aux formations
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
            <WalletIcon className="h-12 w-12 mx-auto mb-3" />
            <h1 className="text-2xl font-bold">Paiement de la formation</h1>
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
                <span className="font-medium text-blue-600">{course.price} FCFA</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-gray-600">Solde disponible</span>
                <span className={`font-medium ${(wallet?.balance || 0) >= course.price ? 'text-green-600' : 'text-red-600'}`}>
                  {wallet?.balance?.toLocaleString() || 0} FCFA
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {(wallet?.balance || 0) < course.price ? (
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-lg text-sm">
                  ⚠️ Solde insuffisant. Veuillez recharger votre portefeuille.
                </div>
                <Link
                  href="/dashboard/wallet/recharge"
                  className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-medium transition text-center"
                >
                  Recharger mon portefeuille
                </Link>
              </div>
            ) : (
              <button
                onClick={handlePayment}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
              >
                {submitting ? 'Paiement en cours...' : `Payer ${course.price} FCFA`}
              </button>
            )}

            <p className="text-xs text-gray-400 text-center mt-4">
              Paiement sécurisé via votre portefeuille DigiCol
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}