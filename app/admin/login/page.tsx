'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Connexion via Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('Utilisateur introuvable');

      console.log('✅ Utilisateur connecté:', data.user);

      // 2. Récupération du rôle en filtrant sur la colonne 'user_id'
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('user_id', data.user.id) // 🌟 Correction de la colonne
        .maybeSingle();

      console.log('📊 userData:', userData);
      console.log('📊 userError:', userError);

      if (userError) {
        console.error('❌ Erreur base de données:', userError);
        setError('Erreur lors de la vérification des droits.');
        await supabase.auth.signOut();
        return;
      }

      // Si le profil n'existe pas dans la table 'users'
      if (!userData) {
        setError("Compte non configuré en base de données. Contactez l'administrateur.");
        await supabase.auth.signOut();
        return;
      }

      // 3. Vérification des droits administrateur
      const role = userData.role || 'MEMBRE';
      const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';

      console.log('🔍 Rôle:', role);
      console.log('🔍 Est admin:', isAdmin);

      if (isAdmin) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError('Accès réservé aux administrateurs.');
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      console.error('❌ Erreur globale:', err);
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          {/* Balise HTML standard pour éviter définitivement les warnings Next.js Image */}
          <img 
            src="/logo.png" 
            alt="DigiCol" 
            width={160} 
            height={50} 
            className="mx-auto h-auto" 
          />
          <h1 className="text-2xl font-bold text-slate-800 mt-4">Administration DigiCol</h1>
          <p className="text-gray-500 text-sm">Accès réservé aux administrateurs</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="admin@digicol.com" 
              required 
              disabled={loading}
            />
          </div> 
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="••••••••" 
              required 
              disabled={loading}
            />
          </div> 
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button> 
        </form>
      </div>
    </div>
  );
}
