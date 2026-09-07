// app/dashboard/wallet/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeftIcon,
  WalletIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  MinusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export default function WalletPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalCredits: 0,
    totalDebits: 0,
    totalBonuses: 0,
  });
  const [filter, setFilter] = useState('all');

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

      await fetchWallet(session.user.id);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/login');
    }
  };

  const fetchWallet = async (userId: string) => {
    try {
      console.log(' Récupération du portefeuille pour:', userId);

      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (walletError) {
        console.error(' Erreur wallet:', walletError);
        return;
      }

      console.log(' Wallet trouvé:', walletData);
      setWallet(walletData);

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', walletData.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) {
        console.error(' Erreur transactions:', transactionsError);
        return;
      }

      console.log(' Transactions trouvées:', transactionsData?.length || 0);
      setTransactions(transactionsData || []);

      const credits = transactionsData?.filter((t: any) => t.type === 'CREDIT')
        .reduce((sum: number, t: any) => sum + t.amount, 0) || 0;
      const debits = transactionsData?.filter((t: any) => t.type === 'DEBIT')
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0;
      const bonuses = transactionsData?.filter((t: any) => t.type === 'BONUS')
        .reduce((sum: number, t: any) => sum + t.amount, 0) || 0;

      setStats({
        totalCredits: credits,
        totalDebits: debits,
        totalBonuses: bonuses,
      });
    } catch (error) {
      console.error(' Erreur:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'CREDIT': 'Crédit',
      'DEBIT': 'Débit',
      'BONUS': 'Bonus',
      'REFUND': 'Remboursement',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'CREDIT': 'bg-green-100 text-green-700',
      'DEBIT': 'bg-red-100 text-red-700',
      'BONUS': 'bg-blue-100 text-blue-700',
      'REFUND': 'bg-yellow-100 text-yellow-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'COMPLETED': 'Terminé',
      'FAILED': 'Échoué',
      'CANCELLED': 'Annulé',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'FAILED': 'bg-red-100 text-red-700',
      'CANCELLED': 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Mon portefeuille</h1>

          {/* ✅ Message informatif au lieu du bouton Recharger */}
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
            <InformationCircleIcon className="h-4 w-4 text-blue-500" />
            <span>Crédits gérés par DigiCol</span>
          </div>
        </div>

        {/* Carte du solde */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-2">
            <WalletIcon className="h-6 w-6" />
            <p className="text-sm opacity-80">Solde disponible</p>
          </div>
          <p className="text-4xl font-bold">
            {wallet?.balance?.toLocaleString() || 0} FCFA
          </p>
          <p className="text-sm opacity-70 mt-1">Compte DigiCol</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <ArrowUpIcon className="h-4 w-4" />
              <p className="text-xs text-gray-500 font-medium">Total crédits</p>
            </div>
            <p className="text-lg font-bold text-slate-800">{stats.totalCredits.toLocaleString()} FCFA</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <ArrowDownIcon className="h-4 w-4" />
              <p className="text-xs text-gray-500 font-medium">Total débits</p>
            </div>
            <p className="text-lg font-bold text-slate-800">{stats.totalDebits.toLocaleString()} FCFA</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <PlusIcon className="h-4 w-4" />
              <p className="text-xs text-gray-500 font-medium">Total bonus</p>
            </div>
            <p className="text-lg font-bold text-slate-800">{stats.totalBonuses.toLocaleString()} FCFA</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('CREDIT')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'CREDIT'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Crédits
          </button>
          <button
            onClick={() => setFilter('DEBIT')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'DEBIT'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Débits
          </button>
          <button
            onClick={() => setFilter('BONUS')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'BONUS'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Bonus
          </button>
        </div>

        {/* Historique des transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-slate-800">Historique des transactions</h2>
            <p className="text-xs text-gray-500">Dernières 50 transactions</p>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <WalletIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Aucune transaction</p>
              <p className="text-xs text-gray-400 mt-1">
                {filter !== 'all' ? `Aucune transaction de type "${getTypeLabel(filter)}"` : 'Commencez à utiliser DigiCol pour voir vos transactions'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(transaction.type)}`}>
                        {transaction.type === 'CREDIT' || transaction.type === 'BONUS' ? (
                          <PlusIcon className="h-4 w-4" />
                        ) : (
                          <MinusIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">
                          {getTypeLabel(transaction.type)}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.description || 'Sans description'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(transaction.status)}`}>
                            {getStatusLabel(transaction.status)}
                          </span>
                          <span className="text-[10px] text-gray-400">{formatDate(transaction.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${
                        transaction.type === 'CREDIT' || transaction.type === 'BONUS' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'CREDIT' || transaction.type === 'BONUS' ? '+' : '-'}
                        {Math.abs(transaction.amount).toLocaleString()} FCFA
                      </p>
                      <div className="flex justify-end gap-1 mt-1">
                        {transaction.status === 'COMPLETED' && (
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        )}
                        {transaction.status === 'PENDING' && (
                          <ClockIcon className="h-4 w-4 text-yellow-600" />
                        )}
                        {transaction.status === 'FAILED' && (
                          <XCircleIcon className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 transition">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}