// app/certificates/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, certificates } from '@/lib/api';

interface Certificate {
  id: number;
  certificate_id: string;
  course_title: string;
  issue_date: string;
  is_verified: boolean;
}

export default function CertificatesPage() {
  const router = useRouter();
  const [certificatesList, setCertificatesList] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchCertificates();
  }, [router]);

  const fetchCertificates = async () => {
    try {
      const response = await certificates.list();
      setCertificatesList(response.data.results || response.data || []);
    } catch (error) {
      console.error('Erreur chargement des certificats:', error);
    } finally {
      setLoading(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Mes certificats</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Vos certifications DigiCol</p>
        </div>

        {certificatesList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">Vous n'avez pas encore de certificat.</p>
            <Link href="/courses" className="text-blue-600 hover:underline mt-4 inline-block">
              Découvrir les formations →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {certificatesList.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl"></span>
                    <div>
                      <h3 className="font-bold text-slate-900">{cert.course_title}</h3>
                      <p className="text-sm text-gray-500">{cert.certificate_id}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Délivré le {formatDate(cert.issue_date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    cert.is_verified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {cert.is_verified ? ' Vérifié' : ' En attente'}
                  </span>
                  <Link
                    href={`/certificates/${cert.id}`}
                    className="text-blue-600 hover:text-blue-800 transition text-sm"
                  >
                    Voir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}