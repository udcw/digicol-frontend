// app/verify/certificate/[number]/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,BookOpenIcon,RocketLaunchIcon,
} from '@heroicons/react/24/outline';

export default function VerifyCertificatePage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = use(params);
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificate();
  }, [number]);

  const fetchCertificate = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          user:users(id, username, full_name, email),
          course:courses(id, title),
          project:projects(id, title)
        `)
        .eq('certificate_number', number)
        .single();

      if (error) {
        setError('Certificat non trouvé');
        return;
      }

      setCertificate(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Certificat non trouvé</h2>
          <p className="text-gray-500 mb-6">
            Aucun certificat ne correspond à ce numéro.
          </p>
          <Link href="/" className="text-blue-600 hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Image src="/logo.png" alt="DigiCol" width={80} height={30} className="h-auto brightness-0 invert" />
            </div>
            <p className="text-xs text-blue-200">Certificat numérique officiel</p>
          </div>

          {/* Corps */}
          <div className="p-6">
            {/* Statut */}
            <div className="flex items-center justify-center mb-6">
              {certificate.is_verified ? (
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span className="font-semibold">Certificat vérifié</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full">
                  <XCircleIcon className="h-5 w-5" />
                  <span className="font-semibold">Certificat non vérifié</span>
                </div>
              )}
            </div>

            {/* Informations */}
            <div className="space-y-4">
              <div className="text-center border-b border-gray-100 pb-4">
                <h1 className="text-2xl font-bold text-slate-800">{certificate.title}</h1>
                {certificate.description && (
                  <p className="text-gray-500 mt-1">{certificate.description}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Titulaire</p>
                    <p className="font-medium text-slate-800">
                      {certificate.user?.full_name || certificate.user?.username || 'Inconnu'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Numéro</p>
                    <p className="font-mono text-sm font-medium text-slate-800">
                      {certificate.certificate_number}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Date d'émission</p>
                    <p className="font-medium text-slate-800">
                      {formatDate(certificate.issued_date)}
                    </p>
                  </div>
                </div>

                {certificate.expiry_date && (
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Date d'expiration</p>
                      <p className="font-medium text-slate-800">
                        {formatDate(certificate.expiry_date)}
                      </p>
                    </div>
                  </div>
                )}

                {certificate.course && (
                  <div className="flex items-center gap-3 text-sm">
                    <BookOpenIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Formation</p>
                      <p className="font-medium text-slate-800">{certificate.course.title}</p>
                    </div>
                  </div>
                )}

                {certificate.project && (
                  <div className="flex items-center gap-3 text-sm">
                    <RocketLaunchIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Projet</p>
                      <p className="font-medium text-slate-800">{certificate.project.title}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cachet */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Cachet numérique officiel</p>
                <div className="flex justify-center items-center gap-2 text-xs text-gray-400">
                  <span></span>
                  <span>Vérifié par DigiCol</span>
                  <span className="font-mono">DIGICOL-2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pied */}
          <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
            <p className="text-[10px] text-gray-400">
              DigiCol — Apprendre · Partager · Innover
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}