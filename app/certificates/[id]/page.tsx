// app/certificates/[id]/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeftIcon, 
  PrinterIcon, 
  UserIcon, 
  CalendarIcon, 
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function CertificateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  const fetchCertificate = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          user:users(id, username, full_name, email),
          course:courses(
            id, 
            title, 
            description, 
            level, 
            duration,
            instructor:users(id, username, full_name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur:', error);
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

  const getLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      'DEBUTANT': 'Débutant',
      'INTERMEDIAIRE': 'Intermédiaire',
      'AVANCE': 'Avancé',
      'EXPERT': 'Expert',
    };
    return levels[level] || level;
  };

  const handlePrint = () => {
    window.print();
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Certificat non trouvé</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/certificates" className="text-blue-600 hover:underline">
            Retour aux certificats
          </Link>
        </div>
      </div>
    );
  }

  const memberName = certificate.user?.full_name || certificate.user?.username || 'Membre DigiCol';
  const memberEmail = certificate.user?.email || '';
  const courseTitle = certificate.course?.title || certificate.title || 'Formation DigiCol';
  const courseLevel = getLevelLabel(certificate.course?.level);
  const courseDuration = certificate.course?.duration || 'Non spécifiée';
  const instructorName = certificate.course?.instructor?.full_name || certificate.course?.instructor?.username || 'Formateur';
  const reference = certificate.certificate_number || 'CERT-DIGICOL-2026-0001';
  const issueDate = formatDate(certificate.issued_date);
  const displayTitle = certificate.course?.title || certificate.title || 'Certification DigiCol';

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="container mx-auto px-4 max-w-4xl print:max-w-full">
        
        {/* Boutons d'action */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/certificates" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
            <ArrowLeftIcon className="h-4 w-4" />
            Retour aux certificats
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <PrinterIcon className="h-4 w-4" />
            Imprimer
          </button>
        </div>

        {/* ========================================== */}
        {/* CERTIFICAT DE FORMATION AVEC CACHET */}
        {/* ========================================== */}
        <div className="certificate-wrapper print:shadow-none">
          <div className="certificate bg-white rounded-2xl shadow-2xl overflow-hidden print:rounded-none print:shadow-none relative">
            
            {/* Bordures décoratives */}
            <div className="absolute inset-4 border-2 border-blue-200 rounded-xl pointer-events-none print:border-blue-300"></div>
            <div className="absolute inset-6 border border-blue-100 rounded-lg pointer-events-none print:border-blue-200"></div>

            <div className="relative z-10 p-8 pt-10 print:p-8">
              
              {/* ========================================== */}
              {/* HEADER */}
              {/* ========================================== */}
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  <Image
                    src="/logo.png"
                    alt="DigiCol"
                    width={180}
                    height={60}
                    className="h-auto w-auto"
                    priority
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-1.5 rounded-full text-xs font-semibold tracking-wider shadow-lg mb-6">
                  CERTIFICAT DE COMPLÉTION
                </div>
              </div>

              {/* ========================================== */}
              {/* CORPS */}
              {/* ========================================== */}
              <div className="text-center">
                <p className="text-gray-500 text-sm uppercase tracking-wider mb-4">
                  Ce certificat atteste que
                </p>
                
                {/* Nom du membre */}
                <h2 className="text-4xl md:text-5xl font-bold text-slate-800 font-serif mb-2">
                  {memberName}
                </h2>
                <div className="w-48 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full mb-2"></div>
                {memberEmail && (
                  <p className="text-sm text-gray-400 mb-6">{memberEmail}</p>
                )}

                <p className="text-gray-600 text-base max-w-lg mx-auto leading-relaxed">
                  a complété avec succès la formation
                </p>

                {/* Titre de la formation */}
                <div className="mt-4 mb-5">
                  <h3 className="text-2xl md:text-3xl font-bold text-blue-600">
                    {displayTitle}
                  </h3>
                  
                  {/* Détails de la formation */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-sm text-gray-500">
                    {certificate.course?.level && (
                      <>
                        <span className="flex items-center gap-1.5">
                          <AcademicCapIcon className="h-4 w-4 text-blue-500" />
                          Niveau {courseLevel}
                        </span>
                        <span className="text-gray-300">|</span>
                      </>
                    )}
                    {certificate.course?.duration && (
                      <span className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4 text-blue-500" />
                        {courseDuration}
                      </span>
                    )}
                    {certificate.course?.instructor && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1.5">
                          <UserGroupIcon className="h-4 w-4 text-blue-500" />
                          {instructorName}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Informations complémentaires */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 max-w-2xl mx-auto">
                  <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                    <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-0.5">
                      <CalendarIcon className="h-3 w-3" />
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Date d'obtention</p>
                    </div>
                    <p className="font-semibold text-slate-700 text-sm">{issueDate}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                    <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-0.5">
                      <BookOpenIcon className="h-3 w-3" />
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Référence</p>
                    </div>
                    <p className="font-mono font-semibold text-slate-700 text-[10px]">{reference}</p>
                  </div>
                  {certificate.course?.level && (
                    <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                      <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-0.5">
                        <AcademicCapIcon className="h-3 w-3" />
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Niveau</p>
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">{courseLevel}</p>
                    </div>
                  )}
                </div>

                {/* ========================================== */}
                {/* BAS DU CERTIFICAT AVEC CACHET */}
                {/* ========================================== */}
                <div className="flex flex-wrap items-center justify-center gap-8 mt-8 pt-6 border-t border-gray-100">
                  
                  {/* Signature Formateur */}
                  {certificate.course?.instructor && (
                    <div className="text-center min-w-[100px]">
                      <div className="font-script text-xl text-blue-600 mb-1" style={{ fontFamily: "'Pinyon Script', cursive" }}>
                        {instructorName}
                      </div>
                      <div className="w-20 h-px bg-gray-300 mx-auto"></div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Formateur</p>
                    </div>
                  )}

                  {/* ========================================== */}
                  {/* CACHET DIGICOL AVEC IMAGE */}
                  {/* ========================================== */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-28 h-28 print:w-24 print:h-24">
                      <Image
                        src="/cachetDigicol.png"
                        alt="Cachet officiel DigiCol"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>

                  {/* Signature Direction */}
                  <div className="text-center min-w-[100px]">
                    <div className="font-script text-xl text-blue-600 mb-1" style={{ fontFamily: "'Pinyon Script', cursive" }}>
                      DigiCol
                    </div>
                    <div className="w-20 h-px bg-gray-300 mx-auto"></div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">La Direction</p>
                  </div>
                </div>

                {/* Statut de vérification */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">Certificat vérifié</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    <span className="font-mono">{reference}</span>
                    <span className="mx-2">•</span>
                    Douala - Cameroun
                  </p>
                  <p className="text-[8px] text-gray-300 mt-1">
                    DigiCol — Apprendre · Partager · Innover
                  </p>
                  <div className="mt-2">
                    <Link
                      href={`/verify/certificate/${reference}`}
                      target="_blank"
                      className="text-[9px] text-blue-500 hover:underline inline-flex items-center gap-1"
                    >
                      Vérifier l'authenticité
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge Formation */}
            <div className="absolute bottom-6 right-8 text-right print:right-6">
              <div className="text-[10px] text-blue-400 font-medium tracking-widest">
                FORMATION
              </div>
              <div className="text-[8px] text-gray-300">DIGICOL</div>
            </div>

          </div>
        </div>

        <div className="mt-4 text-center print:hidden">
          <Link
            href={`/verify/certificate/${certificate.certificate_number}`}
            target="_blank"
            className="text-sm text-blue-600 hover:underline"
          >
            Voir la vérification publique
          </Link>
        </div>
      </div>

      {/* ========================================== */}
      {/* STYLES D'IMPRESSION */}
      {/* ========================================== */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:p-0 { padding: 0 !important; }
          
          .certificate {
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}