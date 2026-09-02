// app/admin/members/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, User } from '@/lib/supabase';
import { 
  ArrowLeftIcon, 
  UsersIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export default function AdminMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchMembers();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }
    const { data: userData } = await supabase
      .from('users')
      .select('role, is_superadmin')
      .eq('id', session.user.id)
      .single();

    const role = userData?.role || 'MEMBRE';
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && !userData?.is_superadmin) {
      router.push('/admin/login');
    }
    setLoading(false);
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Changer le statut actif/inactif
  const toggleStatus = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      // Mettre à jour la liste localement
      setMembers(members.map(m => 
        m.id === userId ? { ...m, is_active: !currentStatus } : m
      ));
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setActionLoading(null);
    }
  };

  // 🔄 Changer le rôle
  const changeRole = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      setMembers(members.map(m => 
        m.id === userId ? { ...m, role: newRole } : m
      ));
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de rôle');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredMembers = members.filter((member) =>
    member.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    member.email?.toLowerCase().includes(search.toLowerCase()) ||
    member.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="DigiCol" width={120} height={40} className="h-auto" />
            <span className="text-sm text-gray-400 hidden sm:inline">| Administration</span>
          </Link>
          <Link href="/admin/dashboard" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
            <ArrowLeftIcon className="h-4 w-4" /> Retour
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <UsersIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des membres</h1>
          <span className="text-sm text-gray-500 ml-2">({filteredMembers.length})</span>
        </div>

        {/* Recherche */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={fetchMembers} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Membre</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Rôle</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Statut</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-12">
                      <UsersIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>Aucun membre trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                            {member.full_name?.[0] || member.username?.[0] || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {member.full_name || member.username}
                            </p>
                            <p className="text-xs text-gray-400">@{member.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{member.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={member.role || 'MEMBRE'}
                          onChange={(e) => changeRole(member.id, e.target.value)}
                          disabled={actionLoading === member.id}
                          className={`text-xs px-2 py-1 rounded-full border-0 font-medium focus:ring-2 focus:ring-blue-500 ${
                            member.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                            member.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                            member.role === 'FORMATEUR' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <option value="SUPER_ADMIN">Super Admin</option>
                          <option value="ADMIN">Admin</option>
                          <option value="FORMATEUR">Formateur</option>
                          <option value="MEMBRE">Membre</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                          member.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {member.is_active ? (
                            <CheckCircleIcon className="h-3 w-3" />
                          ) : (
                            <XCircleIcon className="h-3 w-3" />
                          )}
                          {member.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStatus(member.id, member.is_active)}
                            disabled={actionLoading === member.id}
                            className={`text-xs px-3 py-1 rounded-lg transition ${
                              member.is_active
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {actionLoading === member.id ? '...' : member.is_active ? 'Désactiver' : 'Activer'}
                          </button>
                          <button
                            className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-200 transition"
                          >
                            Voir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}