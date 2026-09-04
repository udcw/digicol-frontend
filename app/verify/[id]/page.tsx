// app/verify/[id]/page.tsx

import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Créer un client Supabase pour le serveur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  console.log('🔍 Vérification du membre:', id);

  const { data: member, error } = await supabase
    .from('users')
    .select('*')
    .eq('digicol_id', id)
    .single();

  if (error || !member) {
    console.error('❌ Erreur:', error);
    notFound();
  }

  const isVerified = member.is_active_member === true;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="DigiCol" 
              width={150} 
              height={50} 
              className="h-auto"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full mb-4">
            <span className="text-2xl">🟢</span>
            <span className="font-semibold">Identité DigiCol vérifiée</span>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="space-y-3 text-left">
              <div>
                <p className="text-xs text-gray-500">Nom complet</p>
                <p className="font-medium text-slate-800">{member.full_name || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Identifiant DigiCol</p>
                <p className="font-mono text-sm font-medium text-blue-600">{member.digicol_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Statut</p>
                <p className="font-medium text-green-600">
                  {isVerified ? '✅ Membre actif' : '⏳ En attente de vérification'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Domaine</p>
                <p className="font-medium">{member.domain || 'Non défini'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Membre depuis</p>
                <p className="font-medium">
                  {member.membership_date 
                    ? new Date(member.membership_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'Date non disponible'
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Rôle</p>
                <p className="font-medium">{member.role || 'MEMBRE'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Cachet numérique officiel</p>
              <div className="flex justify-center items-center gap-2 text-xs text-gray-400">
                <span>🔒</span>
                <span>Vérifié par DigiCol</span>
                <span className="font-mono">DIGICOL-2026</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-blue-600 hover:underline"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}