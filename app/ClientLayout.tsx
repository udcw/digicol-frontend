// app/ClientLayout.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import NotificationBell from './components/NotificationBell';
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
  UserGroupIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          setUserRole(userData?.role || 'MEMBRE');
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('Erreur checkAuth:', error);
      } finally {
        setIsLoading(false);
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

  // Navigation principale
  const navItems = [
    { href: '/', label: 'Accueil', icon: HomeIcon },
    { href: '/courses', label: 'Formations', icon: BookOpenIcon },
    { href: '/projects', label: 'Projets', icon: RocketLaunchIcon },
    { href: '/events', label: 'Événements', icon: CalendarIcon },
    { href: '/blog', label: 'Blog', icon: NewspaperIcon },
    { href: '/opportunities', label: 'Opportunités', icon: BriefcaseIcon },
    { href: '/certificates', label: 'Certificats', icon: DocumentTextIcon },
    { href: '/community', label: 'Communauté', icon: UserGroupIcon },
  ];

  // Navigation secondaire
  const secondaryNavItems = [
    { href: '/about', label: 'À propos', icon: InformationCircleIcon },
    { href: '/contact', label: 'Contact', icon: EnvelopeIcon },
    { href: '/faq', label: 'FAQ', icon: QuestionMarkCircleIcon },
  ];

  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
              <Image 
                src="/logo.png" 
                alt="DigiCol" 
                width={120} 
                height={40} 
                className="h-auto w-auto" 
                priority 
              />
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-4 text-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 transition font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 transition font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
                    pathname.startsWith('/admin')
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  <ShieldCheckIcon className="h-4 w-4" />
                  Admin
                </Link>
              )}
              
              {isLoggedIn ? (
                <>
                  <NotificationBell />
                  <Link 
                    href="/dashboard" 
                    className={`flex items-center gap-1.5 transition font-medium ${
                      pathname.startsWith('/dashboard') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-1.5 text-red-600 hover:text-red-700 transition font-medium"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Connexion
                </Link>
              )}
            </nav>

            {/* Bouton menu mobile */}
            <button 
              onClick={toggleMenu} 
              className="lg:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Menu"
            >
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>

          {/* Navigation Mobile */}
          <div 
            className={`lg:hidden transition-all duration-300 ${
              isMenuOpen 
                ? 'max-h-[calc(100vh-80px)] opacity-100 overflow-y-auto' 
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <nav className="py-4 flex flex-col gap-1 border-t border-gray-100 mt-3">
              
              {/* Navigation principale */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 transition font-medium py-2.5 px-3 rounded-lg ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    onClick={closeMenu}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Séparateur */}
              <div className="border-t border-gray-100 my-2"></div>

              {/* Navigation secondaire */}
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 transition font-medium py-2.5 px-3 rounded-lg ${
                      isActive 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={closeMenu}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Bouton Admin */}
              {isLoggedIn && isAdmin && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link 
                    href="/admin/dashboard" 
                    className="flex items-center gap-3 transition font-medium py-2.5 px-3 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100" 
                    onClick={closeMenu}
                  >
                    <ShieldCheckIcon className="h-5 w-5" /> 
                    Administration
                  </Link>
                </>
              )}
              
              {isLoggedIn ? (
                <>
                  {/* Séparateur */}
                  <div className="border-t border-gray-100 my-2"></div>

                  {/* Notifications Mobile */}
                  <div className="flex items-center justify-between px-3 py-2.5 bg-blue-50 rounded-lg mx-1">
                    <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <BellIcon className="h-5 w-5" />
                      Notifications
                    </span>
                    <NotificationBell />
                  </div>

                  {/* Dashboard */}
                  <Link 
                    href="/dashboard" 
                    className={`flex items-center gap-3 transition font-medium py-2.5 px-3 rounded-lg ${
                      pathname.startsWith('/dashboard')
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    onClick={closeMenu}
                  >
                    <UserCircleIcon className="h-5 w-5" /> 
                    Dashboard
                  </Link>

                  {/* Déconnexion */}
                  <button 
                    onClick={() => { handleLogout(); closeMenu(); }} 
                    className="flex items-center gap-3 text-red-600 hover:bg-red-50 transition font-medium py-2.5 px-3 rounded-lg"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" /> 
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  {/* Séparateur */}
                  <div className="border-t border-gray-100 my-2"></div>

                  {/* Bouton Connexion */}
                  <Link 
                    href="/login" 
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition text-center block font-medium" 
                    onClick={closeMenu}
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}