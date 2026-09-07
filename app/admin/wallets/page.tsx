// app/admin/wallets/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon,
  WalletIcon,
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Wallet {
  id: number;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    username: string;
    full_name: string;
  };
}

interface ModalState {
  isOpen: boolean;
  type: 'credit' | 'debit' | null;
  walletId: number | null;
  userName: string | null;
}

export default function AdminWalletsPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    totalBalance: 0,
    averageBalance: 0,
  });

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: null,
    walletId: null,
    userName: null,
  });
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchWallets();
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

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select(`
          *,
          user:users(id, email, username, full_name)
        `)
        .order('balance', { ascending: false });

      if (error) throw error;

      setWallets(data || []);

      const total = data?.length || 0;
      const totalBalance = data?.reduce((sum: number, w: Wallet) => sum + (w.balance || 0), 0) || 0;

      setStats({
        total,
        totalBalance,
        averageBalance: total > 0 ? totalBalance / total : 0,
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'credit' | 'debit', walletId: number, userName: string) => {
    setModal({
      isOpen: true,
      type,
      walletId,
      userName,
    });
    setAmount(0);
    setDescription('');
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: null,
      walletId: null,
      userName: null,
    });
    setAmount(0);
    setDescription('');
    setSubmitting(false);
  };

  const handleSubmit = async () => {
    if (amount <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    if (!description.trim()) {
      alert('Veuillez entrer une description');
      return;
    }

    setSubmitting(true);

    try {
      const walletId = modal.walletId!;
      const isCredit = modal.type === 'credit';

      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: walletId,
          amount: isCredit ? amount : -amount,
          type: isCredit ? 'CREDIT' : 'DEBIT',
          description: description.trim(),
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
        });

      if (txError) throw txError;

      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', walletId)
        .single();

      const newBalance = isCredit 
        ? (wallet?.balance || 0) + amount
        : (wallet?.balance || 0) - amount;

      await supabase
        .from('wallets')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', walletId);

      await fetchWallets();
      closeModal();
      alert(`✅ ${isCredit ? 'Crédit' : 'Débit'} effectué avec succès !`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'opération');
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredWallets = wallets.filter(w =>
    w.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <WalletIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Portefeuilles membres</h1>
            <p className="text-sm text-gray-500">{stats.total} portefeuille{stats.total > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Total portefeuilles</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Solde total</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalBalance.toLocaleString()} FCFA</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Solde moyen</p>
            <p className="text-2xl font-bold text-blue-600">{Math.round(stats.averageBalance).toLocaleString()} FCFA</p>
          </div>
        </div>

        <div className="relative mb-4">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Membre</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Solde</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Créé le</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWallets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-12">
                      <WalletIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>Aucun portefeuille trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredWallets.map((wallet) => (
                    <tr key={wallet.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {wallet.user?.full_name || wallet.user?.username || 'Inconnu'}
                          </p>
                          <p className="text-xs text-gray-500">{wallet.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-sm font-bold ${wallet.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {wallet.balance?.toLocaleString() || 0} FCFA
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(wallet.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            onClick={() => openModal('credit', wallet.id, wallet.user?.full_name || wallet.user?.username || 'Membre')}
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs transition"
                          >
                            <PlusIcon className="h-3 w-3" />
                            Créditer
                          </button>
                          <button
                            onClick={() => openModal('debit', wallet.id, wallet.user?.full_name || wallet.user?.username || 'Membre')}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs transition"
                          >
                            <MinusIcon className="h-3 w-3" />
                            Débiter
                          </button>
                          <Link
                            href={`/admin/wallets/${wallet.id}/transactions`}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Voir
                          </Link>
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

      {/* ========================================== */}
      {/* MODALE DE CRÉDIT / DÉBIT */}
      {/* ========================================== */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${modal.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {modal.type === 'credit' ? (
                    <PlusIcon className="h-5 w-5" />
                  ) : (
                    <MinusIcon className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {modal.type === 'credit' ? 'Créditer' : 'Débiter'}
                  </h3>
                  <p className="text-sm text-gray-500">{modal.userName}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="1"
                  step="100"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder={modal.type === 'credit' ? 'Bonus, récompense...' : 'Achat formation, événement...'}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || amount <= 0 || !description.trim()}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-white transition ${
                    modal.type === 'credit' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submitting ? 'Traitement...' : modal.type === 'credit' ? 'Créditer' : 'Débiter'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}