// app/admin/members/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeftIcon, 
  UsersIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserCircleIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface Member {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  domain: string | null;
  role: string;
  digicol_id: string | null;
  is_active_member: boolean;
  membership_date: string;
  created_at: string;
  avatar_url: string | null;
  skills: string | null;
}

export default function AdminMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    members: 0,
    instructors: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      await checkAuth();
      if (isMounted) {
        await fetchMembers();
        setLoading(false);
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    const role = userData?.role || 'MEMBRE';
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      router.push('/admin/login');
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMembers(data || []);

      const total = data?.length || 0;
      const admins = data?.filter((u: Member) => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').length || 0;
      const instructors = data?.filter((u: Member) => u.role === 'INSTRUCTOR').length || 0;
      const membersCount = data?.filter((u: Member) => u.role === 'MEMBRE').length || 0;
      const active = data?.filter((u: Member) => u.is_active_member === true).length || 0;
      const inactive = data?.filter((u: Member) => u.is_active_member === false).length || 0;

      setStats({ total, admins, members: membersCount, instructors, active, inactive });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      await fetchMembers();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de rôle');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active_member: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      await fetchMembers();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(' Supprimer ce membre ? Cette action est irréversible.')) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) throw error;
      await fetchMembers();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      'SUPER_ADMIN': 'bg-purple-100 text-purple-700',
      'ADMIN': 'bg-blue-100 text-blue-700',
      'INSTRUCTOR': 'bg-green-100 text-green-700',
      'MEMBRE': 'bg-gray-100 text-gray-700',
    };
    return styles[role] || 'bg-gray-100 text-gray-700';
  };

  const filteredMembers = members
    .filter(m => {
      const search = searchTerm.toLowerCase();
      return (
        m.email?.toLowerCase().includes(search) ||
        m.username?.toLowerCase().includes(search) ||
        m.full_name?.toLowerCase().includes(search) ||
        m.digicol_id?.toLowerCase().includes(search)
      );
    })
    .filter(m => filterRole === 'all' || m.role === filterRole)
    .filter(m => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'active') return m.is_active_member === true;
      if (filterStatus === 'inactive') return m.is_active_member === false;
      return true;
    });

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
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestion des membres</h1>
            <p className="text-sm text-gray-500">{stats.total} membre{stats.total > 1 ? 's' : ''} au total</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-500 font-medium">Total</p>
            <p className="text-xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-500 font-medium">Admins</p>
            <p className="text-xl font-bold text-purple-600">{stats.admins}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-500 font-medium">Formateurs</p>
            <p className="text-xl font-bold text-green-600">{stats.instructors}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-500 font-medium">Membres</p>
            <p className="text-xl font-bold text-blue-600">{stats.members}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-500 font-medium">Actifs</p>
            <p className="text-xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-500 font-medium">Inactifs</p>
            <p className="text-xl font-bold text-red-600">{stats.inactive}</p>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">Tous les rôles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="INSTRUCTOR">Formateur</option>
            <option value="MEMBRE">Membre</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>

        {/* Liste des membres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Membre</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Identifiant</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Rôle</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Statut</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Domaine</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Inscription</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-12">
                      <UsersIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>Aucun membre trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {member.full_name?.charAt(0) || member.username?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {member.full_name || member.username || 'Inconnu'}
                            </p>
                            <p className="text-xs text-gray-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                        {member.digicol_id || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadge(member.role)}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          member.is_active_member ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {member.is_active_member ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {member.domain || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(member.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="MEMBRE">Membre</option>
                            <option value="INSTRUCTOR">Formateur</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </select>
                          <button
                            onClick={() => handleToggleStatus(member.id, member.is_active_member)}
                            className={`p-1 transition ${
                              member.is_active_member ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                            }`}
                            title={member.is_active_member ? 'Désactiver' : 'Activer'}
                          >
                            {member.is_active_member ? (
                              <XCircleIcon className="h-4 w-4" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="text-red-600 hover:text-red-800 p-1 transition"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
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

        <div className="mt-4 text-sm text-gray-400">
          {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} affiché{filteredMembers.length > 1 ? 's' : ''}
          {searchTerm && ` • Recherche: "${searchTerm}"`}
        </div>
      </main>
    </div>
  );
}