// app/dashboard/page.tsx - Dashboard avec Heroicons

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  BookOpenIcon, 
  RocketLaunchIcon, 
  DocumentTextIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { auth, members } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    Promise.all([auth.profile(), members.profile()])
      .then(([userRes, memberRes]) => {
        setUser(userRes.data);
        setMember(memberRes.data);
      })
      .catch(() => {
        localStorage.clear();
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    auth.logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 md:gap-3">
            <Image src="/digicol.png" alt="DigiCol" width={100} height={35} className="h-auto md:w-[120px]" />
          </Link>
          <div className="flex items-center gap-3 md:gap-6">
            <span className="text-xs md:text-sm text-gray-600 hidden sm:block">
              {member?.full_name || user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs md:text-sm text-gray-600 hover:text-red-600 transition"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            Bonjour, {member?.full_name || user?.username}
          </h1>
          <p className="text-sm md:text-base text-gray-500">Bienvenue sur votre espace DigiCol</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs md:text-sm text-gray-500 font-medium">Identifiant</p>
            <p className="text-base md:text-xl font-bold text-slate-900 mt-1 break-all">
              {user?.digicol_id || 'N/A'}
            </p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs md:text-sm text-gray-500 font-medium">Statut</p>
            <p className="text-base md:text-xl font-bold text-green-600 mt-1">
              {member?.is_active_member ? 'Actif' : 'En attente'}
            </p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs md:text-sm text-gray-500 font-medium">Membre depuis</p>
            <p className="text-base md:text-xl font-bold text-slate-900 mt-1">
              {member?.membership_date
                ? new Date(member.membership_date).toLocaleDateString('fr-FR')
                : 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
          <Link href="/courses" className="flex items-center gap-3 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <BookOpenIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-sm md:text-base">Mes formations</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">Voir vos formations en cours</p>
            </div>
          </Link>
          <Link href="/projects" className="flex items-center gap-3 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <RocketLaunchIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-sm md:text-base">Mes projets</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">Gérer vos projets</p>
            </div>
          </Link>
          <Link href="/certificates" className="flex items-center gap-3 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-sm md:text-base">Mes certificats</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">Voir vos certifications</p>
            </div>
          </Link>
          <Link href="/profile" className="flex items-center gap-3 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <UserCircleIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="font-bold text-slate-900 text-sm md:text-base">Mon profil</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">Gérer vos informations</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}