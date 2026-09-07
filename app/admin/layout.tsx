// app/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Ne pas vérifier sur la page de login
      if (pathname === '/admin/login') {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/admin/login');
          return;
        }

        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error || !userData) {
          router.push('/admin/login');
          return;
        }

        const role = userData.role || 'MEMBRE';
        const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';

        if (!isAdmin) {
          await supabase.auth.signOut();
          router.push('/admin/login');
          return;
        }

        setLoading(false);

      } catch (error) {
        console.error('Erreur vérification admin:', error);
        router.push('/admin/login');
      }
    };

    checkAdminAccess();
  }, [pathname, router]);

  if (loading && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}