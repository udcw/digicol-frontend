// app/dashboard/carte/page.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeftIcon, 
  PrinterIcon,
  ArrowDownTrayIcon,
  CheckBadgeIcon,
  IdentificationIcon,
  EnvelopeIcon,
  CalendarIcon,
  BriefcaseIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export default function CarteMembrePage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

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

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      
      if (!data) {
        setError('Aucune information trouvée');
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement de la carte');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ✅ Téléchargement avec html-to-image
  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setDownloading(true);
    
    try {
      const { toPng } = await import('html-to-image');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        cacheBust: true,
        filter: (node) => {
          if (node instanceof HTMLElement) {
            return !node.classList?.contains('print:hidden');
          }
          return true;
        },
      });
      
      const link = document.createElement('a');
      link.download = `carte-digicol-${profile.digicol_id || profile.email?.split('@')[0] || 'membre'}.png`;
      link.href = dataUrl;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error: any) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement. Utilisez le bouton "Imprimer" à la place.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <IdentificationIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Carte non disponible</h2>
          <p className="text-gray-500 mb-6">{error || 'Aucune information'}</p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retour
          </Link>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'https://digicol-frontend.vercel.app');
  const verifyUrl = `${baseUrl}/verify/${profile.digicol_id || 'ID-NON-DEFINI'}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 print:bg-white print:py-0">
      <div className="container mx-auto px-4 max-w-md print:max-w-full">
        
        <div className="flex items-center gap-3 mb-6 print:hidden">
          <Link 
            href="/dashboard" 
            className="p-2 hover:bg-white rounded-lg transition bg-white shadow-sm"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">Ma carte DigiCol</h1>
            <p className="text-xs text-gray-500">Carte de membre officielle</p>
          </div>
        </div>

        <div 
          ref={cardRef}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:border print:border-gray-200"
        >
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-300 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-1">
                <Image 
                  src="/logo.png" 
                  alt="DigiCol" 
                  width={50} 
                  height={20} 
                  className="h-auto brightness-0 invert"
                  crossOrigin="anonymous"
                />
                <span className="text-2xl font-bold tracking-tight">DigiCol</span>
              </div>
              <p className="text-[10px] text-blue-200 tracking-[0.2em] font-medium">
                CARTE DE MEMBRE OFFICIELLE
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
                  profile.is_active_member ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  {profile.is_active_member ? (
                    <CheckBadgeIcon className="h-4 w-4 text-white" />
                  ) : (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-800 text-lg leading-tight truncate">
                  {profile.full_name || 'Membre'}
                </h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  {profile.digicol_id || 'ID en cours...'}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    profile.is_active_member 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {profile.is_active_member ? 'Actif' : 'En attente'}
                  </span>
                  <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    profile.role === 'SUPER_ADMIN' || profile.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : profile.role === 'INSTRUCTOR'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {profile.role || 'MEMBRE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm border-t border-gray-100 pt-4">
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <EnvelopeIcon className="h-3 w-3 text-gray-400" />
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">Email</p>
                </div>
                <p className="font-medium text-slate-700 text-xs truncate">{profile.email || 'N/A'}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <BriefcaseIcon className="h-3 w-3 text-gray-400" />
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">Domaine</p>
                </div>
                <p className="font-medium text-slate-700 text-xs truncate">{profile.domain || 'Non défini'}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <MapPinIcon className="h-3 w-3 text-gray-400" />
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">Ville</p>
                </div>
                <p className="font-medium text-slate-700 text-xs truncate">{profile.city || 'Non renseigné'}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <CalendarIcon className="h-3 w-3 text-gray-400" />
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">Membre depuis</p>
                </div>
                <p className="font-medium text-slate-700 text-xs">
                  {profile.membership_date 
                    ? new Date(profile.membership_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : 'N/A'
                  }
                </p>
              </div>
            </div>

            {profile.digicol_id && (
              <div className="flex justify-center mt-5 pt-5 border-t border-gray-100">
                <div className="bg-white p-3 rounded-xl shadow-sm border-2 border-blue-100">
                  <QRCodeSVG 
                    value={verifyUrl}
                    size={140}
                    level="H"
                    marginSize={3}
                    fgColor="#1e40af"
                  />
                </div>
              </div>
            )}

            <div className="mt-3 text-center">
              <p className="text-[10px] text-gray-400">
                Scannez pour vérifier l'identité
              </p>
              <p className="text-[9px] text-blue-600 font-mono truncate mt-1 px-2">
                {verifyUrl}
              </p>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400">Cachet numérique</p>
                  <p className="font-mono text-[10px] text-blue-600 font-medium">DIGICOL-2026</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-400">Version</p>
                <p className="font-mono text-[10px] text-gray-500">v2.0</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-3 text-center border-t border-gray-100 print:bg-white">
            <p className="text-[10px] text-gray-500 tracking-wider font-medium">
              DigiCol — Apprendre • Partager • Innover
            </p>
            <p className="text-[8px] text-gray-400 mt-0.5">
              Document officiel — Toute reproduction est interdite
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 print:hidden">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition text-sm font-medium shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            {downloading ? 'Téléchargement...' : 'Télécharger'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 px-4 py-3 rounded-xl transition text-sm font-medium shadow-sm"
          >
            <PrinterIcon className="h-4 w-4" />
            Imprimer
          </button>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 print:hidden">
          <p className="text-xs text-blue-700">
            <strong>Astuce :</strong> Si le téléchargement échoue, utilisez <strong>Imprimer</strong> puis <strong>"Enregistrer en PDF"</strong>.
          </p>
        </div>

        <div className="mt-4 text-center print:hidden">
          <Link 
            href="/dashboard" 
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border { border: 1px solid #e5e7eb !important; }
          .print\\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .print\\:max-w-full { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}