// app/admin/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  UsersIcon,
  BookOpenIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  NewspaperIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { auth } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    
    if (!token || (role !== 'SUPER_ADMIN' && role !== 'ADMIN')) {
      router.push('/admin/login');
      return;
    }

    auth.profile()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.clear();
        router.push('/admin/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    auth.logout();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { href: '/admin/members', label: 'Membres', icon: UsersIcon, desc: 'Gérer les membres' },
    { href: '/admin/courses', label: 'Formations', icon: BookOpenIcon, desc: 'Gérer les formations' },
    { href: '/admin/projects', label: 'Projets', icon: RocketLaunchIcon, desc: 'Gérer les projets' },
    { href: '/admin/blog', label: 'Blog', icon: NewspaperIcon, desc: 'Gérer les articles' },
    { href: '/admin/certificates', label: 'Certificats', icon: DocumentTextIcon, desc: 'Gérer les certificats' },
    { href: '/admin/opportunities', label: 'Opportunités', icon: BriefcaseIcon, desc: 'Gérer les offres' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="DigiCol" width={120} height={40} className="h-auto" />
            <span className="text-sm text-gray-400 hidden sm:inline">| Administration</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">Tableau de bord</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition hover:border-blue-300 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">{item.label}</h2>
                </div>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}