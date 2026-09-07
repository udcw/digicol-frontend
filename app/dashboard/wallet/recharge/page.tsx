
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeftIcon, WalletIcon, CreditCardIcon } from '@heroicons/react/24/outline';

interface Wallet {
  id: number;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export default function RechargePage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('orange');

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
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Erreur wallet:', error);
        return;
      }

      setWallet(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleRecharge = async () => {
    if (amount <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Non connecté');
      }

      // Simuler un paiement
      const paymentSuccess = await simulatePayment(amount, paymentMethod);

      if (!paymentSuccess) {
        throw new Error('Paiement échoué');
      }

      // Récupérer le wallet de l'utilisateur
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('id, balance, user_id, created_at, updated_at')
        .eq('user_id', session.user.id)
        .single();

      if (walletError || !walletData) {
        throw new Error('Wallet non trouvé');
      }

      // Ajouter la transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: walletData.id,
          amount: amount,
          type: 'CREDIT',
          description: `Recharge de ${amount.toLocaleString()} FCFA via ${getPaymentLabel(paymentMethod)}`,
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
        });

      if (txError) throw txError;

      // Mettre à jour le solde
      const newBalance = (walletData.balance || 0) + amount;
      
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', walletData.id);

      if (updateError) throw updateError;

      // Mettre à jour l'état local avec toutes les propriétés
      setWallet({
        id: walletData.id,
        user_id: walletData.user_id,
        balance: newBalance,
        created_at: walletData.created_at,
        updated_at: new Date().toISOString(),
      });

      alert(' Recharge réussie !');
      router.push('/dashboard/wallet');
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(` ${error.message || 'Erreur lors de la recharge'}`);
    } finally {
      setLoading(false);
    }
  };

  const simulatePayment = (amount: number, method: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() < 0.95;
        resolve(success);
      }, 1500);
    });
  };

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, string> = {
      orange: 'Orange Money',
      mtn: 'MTN Mobile Money',
      card: 'Carte Bancaire',
    };
    return labels[method] || method;
  };

  const quickAmounts = [5000, 10000, 25000, 50000, 100000];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/wallet" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Recharger</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
              <WalletIcon className="h-4 w-4" />
              Solde actuel: {wallet?.balance?.toLocaleString() || 0} FCFA
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`p-3 rounded-lg border text-center transition ${
                  amount === amt 
                    ? 'border-blue-600 bg-blue-50 text-blue-600' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <p className="font-bold">{amt.toLocaleString()}</p>
                <p className="text-xs text-gray-500">FCFA</p>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant personnalisé (FCFA)
            </label>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
              min="100"
              step="100"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de paiement
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('orange')}
                className={`p-3 rounded-lg border text-center transition ${
                  paymentMethod === 'orange' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <span className="text-2xl"></span>
                <p className="text-xs font-medium text-gray-700">Orange Money</p>
              </button>
              <button
                onClick={() => setPaymentMethod('mtn')}
                className={`p-3 rounded-lg border text-center transition ${
                  paymentMethod === 'mtn' 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 hover:border-yellow-300'
                }`}
              >
                <span className="text-2xl"></span>
                <p className="text-xs font-medium text-gray-700">MTN Mobile</p>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border text-center transition ${
                  paymentMethod === 'card' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <span className="text-2xl"></span>
                <p className="text-xs font-medium text-gray-700">Carte</p>
              </button>
            </div>
          </div>

          <button
            onClick={handleRecharge}
            disabled={loading || amount <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? (
              'Traitement...'
            ) : (
              `Recharger ${amount > 0 ? amount.toLocaleString() : ''} FCFA`
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Paiement sécurisé via Orange Money, MTN Mobile Money ou Carte Bancaire
          </p>
        </div>
      </div>
    </div>
  );
}