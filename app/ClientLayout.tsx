// app/ClientLayout.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Bars3Icon, 
  XMarkIcon,
  BookOpenIcon,
  RocketLaunchIcon,
  CalendarIcon,
  NewspaperIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  UserCircleIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session?.user) {
        const role = session.user.user_metadata?.role || 'MEMBRE';
        setUserRole(role);
      }
    };
    checkAuth();
  }, [pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserRole(null);
    window.location.href = '/';
  };

  const navItems = [
    { href: '/', label: 'Accueil', icon: HomeIcon },
    { href: '/courses', label: 'Formations', icon: BookOpenIcon },
    { href: '/projects', label: 'Projets', icon: RocketLaunchIcon },
    { href: '/events', label: 'Événements', icon: CalendarIcon },
    { href: '/blog', label: 'Blog', icon: NewspaperIcon },
    { href: '/opportunities', label: 'Opportunités', icon: BriefcaseIcon },
    { href: '/certificates', label: 'Certificats', icon: DocumentTextIcon },
  ];

  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
              <Image src="/logo.png" alt="DigiCol" width={120} height={40} className="h-auto w-auto" priority />
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 transition font-medium ${
                      pathname === item.href ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              
              {isLoggedIn && isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-1.5 transition font-medium ${
                    pathname.startsWith('/admin') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                  Admin
                </Link>
              )}
              
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-1.5 transition font-medium text-gray-600 hover:text-blue-600">
                    <UserCircleIcon className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-600 hover:text-red-700 transition font-medium">
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                  Connexion
                </Link>
              )}
            </nav>

            <button onClick={toggleMenu} className="md:hidden text-gray-600 p-2">
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>

          <div className={`md:hidden bg-white transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <nav className="py-4 flex flex-col gap-2 border-t border-gray-100 mt-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 transition font-medium py-2.5 px-3 rounded-lg ${
                      pathname === item.href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    onClick={closeMenu}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              
              {isLoggedIn && isAdmin && (
                <Link href="/admin/dashboard" className="flex items-center gap-3 transition font-medium py-2.5 px-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600" onClick={closeMenu}>
                  <ShieldCheckIcon className="h-5 w-5" /> Admin
                </Link>
              )}
              
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-3 transition font-medium py-2.5 px-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600" onClick={closeMenu}>
                    <UserCircleIcon className="h-5 w-5" /> Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); closeMenu(); }} className="flex items-center gap-3 text-red-600 hover:bg-red-50 transition font-medium py-2.5 px-3 rounded-lg">
                    <ArrowRightOnRectangleIcon className="h-5 w-5" /> Déconnexion
                  </button>
                </>
              ) : (
                <Link href="/login" className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-center block font-medium" onClick={closeMenu}>
                  Se connecter
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}