// app/dashboard/carte/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function CarteMembrePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      setProfile(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Aucune information disponible</p>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/verify/${profile.digicol_id || 'ID-NON-DEFINI'}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Image src="/logo.png" alt="DigiCol" width={80} height={30} className="h-auto brightness-0 invert" />
            </div>
            <p className="text-xs text-blue-200">Carte de membre officielle</p>
          </div>

          {/* Corps de la carte */}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                {profile.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="font-bold text-slate-800">{profile.full_name || 'Membre'}</h2>
                <p className="text-xs text-gray-500">{profile.digicol_id || 'ID en cours...'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-100 pt-4">
              <div>
                <p className="text-xs text-gray-500">Statut</p>
                <p className="font-medium text-green-600">
                  {profile.is_active_member ? ' Actif' : ' En attente'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Domaine</p>
                <p className="font-medium">{profile.domain || 'Non défini'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Rôle</p>
                <p className="font-medium">{profile.role || 'MEMBRE'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Membre depuis</p>
                <p className="font-medium text-sm">
                  {profile.membership_date 
                    ? new Date(profile.membership_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'Date non disponible'
                  }
                </p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mt-4 pt-4 border-t border-gray-100">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <QRCodeSVG 
                  value={verifyUrl}
                  size={120}
                  level="H"
                  marginSize={4}
                />
              </div>
            </div>

            {/* Cachet */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500"> Vérifiable sur</span>
                <span className="text-xs font-medium text-blue-600 truncate max-w-[150px]">{verifyUrl}</span>
              </div>
              <div className="text-xs text-gray-400 text-right">
                <p>Cachet numérique</p>
                <p className="font-mono text-[10px]">DIGICOL-2026</p>
              </div>
            </div>
          </div>

          {/* Pied */}
          <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
            <p className="text-[10px] text-gray-400">
              DigiCol — Apprendre • Partager • Innover
            </p>
          </div>
        </div>

        {/* Boutons */}
        <div className="mt-4 text-center space-y-2">
          <button
            onClick={() => window.print()}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition w-full"
          >
             Imprimer ma carte
          </button>
          <Link 
            href="/dashboard" 
            className="text-sm text-gray-500 hover:text-gray-700 block"
          >
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}