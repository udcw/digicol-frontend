// app/ClientLayout.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from '@heroicons/react/24/outline';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, [pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  // Navigation items
  const navItems = [
    { href: '/', label: 'Accueil', icon: HomeIcon },
    { href: '/courses', label: 'Formations', icon: BookOpenIcon },
    { href: '/projects', label: 'Projets', icon: RocketLaunchIcon },
    { href: '/events', label: 'Événements', icon: CalendarIcon },
    { href: '/blog', label: 'Blog', icon: NewspaperIcon },
    { href: '/opportunities', label: 'Opportunités', icon: BriefcaseIcon },
    { href: '/certificates', label: 'Certificats', icon: DocumentTextIcon },
  ];

  return (
    <>
      {/* Header avec logo et menu */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
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
          
          {/* Menu desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 transition font-medium ${
                    pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-1.5 transition font-medium ${
                    pathname === '/dashboard'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
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

          {/* Menu mobile - hamburger */}
          <button 
            onClick={toggleMenu} 
            className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none p-2"
            aria-label="Menu"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Menu mobile déroulant */}
        <div className={`md:hidden bg-white border-b border-gray-200 transition-all duration-300 overflow-hidden ${
          isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 transition font-medium py-2.5 px-3 rounded-lg ${
                    pathname === item.href
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
            
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 transition font-medium py-2.5 px-3 rounded-lg ${
                    pathname === '/dashboard'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  onClick={closeMenu}
                >
                  <UserCircleIcon className="h-5 w-5" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="flex items-center gap-3 text-red-600 hover:bg-red-50 transition font-medium py-2.5 px-3 rounded-lg"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-center block font-medium"
                onClick={closeMenu}
              >
                Se connecter
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Overlay quand le menu mobile est ouvert */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMenu}
        />
      )}

      {children}
    </>
  );
}