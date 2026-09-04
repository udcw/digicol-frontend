// app/dashboard/carte/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeftIcon, 
  PrinterIcon,
  UserCircleIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';

export default function CarteMembrePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="text-6xl mb-4 text-gray-300">ID</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Carte non disponible</h2>
          <p className="text-gray-500 mb-6">{error || 'Aucune information disponible'}</p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'https://digicol-frontend.vercel.app');
  const verifyUrl = `${baseUrl}/verify/${profile.digicol_id || 'ID-NON-DEFINI'}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:py-0">
      <div className="container mx-auto px-4 max-w-md print:max-w-full">
        
        {/* En-tête avec retour - Masqué à l'impression */}
        <div className="flex items-center gap-4 mb-6 print:hidden">
          <Link 
            href="/dashboard" 
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Ma carte DigiCol</h1>
          <button
            onClick={handlePrint}
            className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm"
          >
            <PrinterIcon className="h-4 w-4" />
            Imprimer
          </button>
        </div>

        {/* Carte */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:border print:border-gray-200">
          
          {/* En-tête de la carte */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <Image 
                src="/logo.png" 
                alt="DigiCol" 
                width={60} 
                height={25} 
                className="h-auto brightness-0 invert"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-2xl font-bold tracking-tight">DigiCol</span>
            </div>
            <p className="text-xs text-blue-200 tracking-wider">CARTE DE MEMBRE OFFICIELLE</p>
          </div>

          {/* Corps de la carte */}
          <div className="p-6">
            
            {/* Photo et identité */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-md">
                {profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">
                  {profile.full_name || 'Membre'}
                </h2>
                <p className="text-xs text-gray-500 font-mono">
                  {profile.digicol_id || 'ID en cours...'}
                </p>
                <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {profile.is_active_member ? 'Membre actif' : 'En attente de validation'}
                </span>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-4">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Rôle</p>
                <p className="font-medium text-slate-700">{profile.role || 'MEMBRE'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Domaine</p>
                <p className="font-medium text-slate-700 truncate">{profile.domain || 'Non défini'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email</p>
                <p className="font-medium text-slate-700 text-xs truncate">{profile.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Membre depuis</p>
                <p className="font-medium text-slate-700 text-sm">
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

            {/* QR Code */}
            {profile.digicol_id && (
              <div className="flex justify-center mt-4 pt-4 border-t border-gray-100">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                  <QRCodeSVG 
                    value={verifyUrl}
                    size={130}
                    level="H"
                    marginSize={3}
                    imageSettings={{
                      src: '/logo.png',
                      height: 24,
                      width: 24,
                      excavate: true,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Lien de vérification */}
            <div className="mt-3 text-center">
              <p className="text-[10px] text-gray-400">Scannez le code QR pour vérifier l'identité</p>
              <p className="text-[9px] text-blue-600 font-mono truncate mt-1">{verifyUrl}</p>
            </div>

            {/* Cachet numérique */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400">Cachet numérique</p>
                  <p className="font-mono text-[10px] text-gray-500">DIGICOL-2026</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-400">Version</p>
                <p className="font-mono text-[10px] text-gray-500">v2.0</p>
              </div>
            </div>
          </div>

          {/* Pied de la carte */}
          <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100 print:bg-white">
            <p className="text-[10px] text-gray-400 tracking-wider">
              DigiCol — Apprendre • Partager • Innover
            </p>
            <p className="text-[8px] text-gray-300 mt-0.5">
              Document officiel — Toute reproduction est interdite
            </p>
          </div>
        </div>

        {/* Actions - Masqué à l'impression */}
        <div className="mt-6 space-y-3 print:hidden">
          <Link 
            href="/dashboard" 
            className="block text-center text-sm text-gray-500 hover:text-gray-700 transition"
          >
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>

      {/* Styles d'impression */}
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