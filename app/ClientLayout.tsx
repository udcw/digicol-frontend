// app/ClientLayout.tsx - Client Component (avec menu burger)

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Bars3Icon, 
  XMarkIcon,
  BookOpenIcon,
  RocketLaunchIcon,
  CalendarIcon,
  DocumentTextIcon,
  NewspaperIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Header avec logo et menu */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
            <Image
              src="/digicol.png"
              alt="DigiCol"
              width={120}
              height={40}
              className="h-auto"
              priority
            />
          </Link>
          
          {/* Menu desktop */}
        {/* Menu mobile déroulant */}
<div className={`md:hidden bg-white border-b border-gray-200 transition-all duration-300 overflow-hidden ${
  isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
}`}>
  <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
    <Link 
      href="/courses" 
      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition font-medium py-2.5 px-3 rounded-lg"
      onClick={closeMenu}
    >
      <BookOpenIcon className="h-5 w-5 text-blue-600" />
      Formations
    </Link>
    <Link 
      href="/projects" 
      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition font-medium py-2.5 px-3 rounded-lg"
      onClick={closeMenu}
    >
      <RocketLaunchIcon className="h-5 w-5 text-blue-600" />
      Projets
    </Link>
    <Link 
      href="/events" 
      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition font-medium py-2.5 px-3 rounded-lg"
      onClick={closeMenu}
    >
      <CalendarIcon className="h-5 w-5 text-blue-600" />
      Événements
    </Link>
    <Link 
      href="/blog" 
      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition font-medium py-2.5 px-3 rounded-lg"
      onClick={closeMenu}
    >
      <NewspaperIcon className="h-5 w-5 text-blue-600" />
      Blog
    </Link>
    <Link 
      href="/opportunities" 
      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition font-medium py-2.5 px-3 rounded-lg"
      onClick={closeMenu}
    >
      <BriefcaseIcon className="h-5 w-5 text-blue-600" />
      Opportunités
    </Link>
    <Link 
      href="/certificates" 
      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition font-medium py-2.5 px-3 rounded-lg"
      onClick={closeMenu}
    >
      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
      Certificats
    </Link>
    <div className="border-t border-gray-200 my-2 pt-2">
      <Link 
        href="/login" 
        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-center block font-medium"
        onClick={closeMenu}
      >
        Se connecter
      </Link>
    </div>
  </nav>
</div>

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
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link 
              href="/courses" 
              className="flex items-center gap-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition font-medium py-2.5 px-3 rounded-lg"
              onClick={closeMenu}
            >
              <BookOpenIcon className="h-5 w-5 text-blue-600" />
              Formations
            </Link>
            <Link 
              href="/projects" 
              className="flex items-center gap-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition font-medium py-2.5 px-3 rounded-lg"
              onClick={closeMenu}
            >
              <RocketLaunchIcon className="h-5 w-5 text-blue-600" />
              Projets
            </Link>
            <Link 
              href="/events" 
              className="flex items-center gap-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition font-medium py-2.5 px-3 rounded-lg"
              onClick={closeMenu}
            >
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Événements
            </Link>
            <Link 
              href="/blog" 
              className="flex items-center gap-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition font-medium py-2.5 px-3 rounded-lg"
              onClick={closeMenu}
            >
              <NewspaperIcon className="h-5 w-5 text-blue-600" />
              Blog
            </Link>
            <Link 
              href="/opportunities" 
              className="flex items-center gap-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition font-medium py-2.5 px-3 rounded-lg"
              onClick={closeMenu}
            >
              <BriefcaseIcon className="h-5 w-5 text-blue-600" />
              Opportunités
            </Link>
            <div className="border-t border-gray-200 my-2 pt-2">
              <Link 
                href="/login" 
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition text-center block font-medium"
                onClick={closeMenu}
              >
                Se connecter
              </Link>
            </div>
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