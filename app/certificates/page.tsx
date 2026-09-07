// app/certificates/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  EyeIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface Certificate {
  id: string;
  certificate_number: string;
  title: string;
  description: string;
  issued_date: string;
  expiry_date: string | null;
  is_verified: boolean;
  course?: {
    id: number;
    title: string;
  };
  project?: {
    id: number;
    title: string;
  };
}

export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
  });

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

      await fetchCertificates(session.user.id);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/login');
    }
  };

  const fetchCertificates = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          course:courses(id, title),
          project:projects(id, title)
        `)
        .eq('user_id', userId)
        .order('issued_date', { ascending: false });

      if (error) throw error;

      setCertificates(data || []);

      const total = data?.length || 0;
      const verified = data?.filter((c: Certificate) => c.is_verified).length || 0;
      const unverified = data?.filter((c: Certificate) => !c.is_verified).length || 0;

      setStats({ total, verified, unverified });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mes certificats</h1>
            <p className="text-sm text-gray-500">{stats.total} certificat{stats.total > 1 ? 's' : ''} obtenu{stats.total > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-medium">Total</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-medium">Vérifiés</p>
            <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-medium">Non vérifiés</p>
            <p className="text-2xl font-bold text-red-600">{stats.unverified}</p>
          </div>
        </div>

        {/* Liste des certificats */}
        {certificates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun certificat pour le moment</p>
            <p className="text-sm text-gray-400 mt-1">
              Suivez des formations ou participez à des projets pour obtenir des certificats
            </p>
            <Link
              href="/courses"
              className="inline-block mt-4 text-blue-600 hover:underline"
            >
              Découvrir les formations →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <Link
                key={cert.id}
                href={`/certificates/${cert.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-800 text-sm">
                        {cert.title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {cert.course?.title || cert.project?.title || 'Certification'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(cert.issued_date)}
                      </span>
                      <span className={`flex items-center gap-1 ${
                        cert.is_verified ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {cert.is_verified ? (
                          <CheckCircleIcon className="h-3 w-3" />
                        ) : (
                          <XCircleIcon className="h-3 w-3" />
                        )}
                        {cert.is_verified ? 'Vérifié' : 'Non vérifié'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">
                      {cert.certificate_number}
                    </span>
                    <EyeIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 transition">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}