// app/admin/certificates/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { ArrowLeftIcon, DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Certificate {
  id: number;
  certificate_id: string;
  member: { full_name: string } | null;
  course: { title: string } | null;
  issue_date: string;
}

export default function AdminCertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchCertificates();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }
    const role = session.user?.user_metadata?.role;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      router.push('/admin/login');
    }
  };

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates_certificate')
        .select(`
          id,
          certificate_id,
          issue_date,
          member:member_id (full_name),
          course:course_id (title)
        `)
        .order('id', { ascending: false });

      if (error) throw error;

      // Formater les données
      const formattedData: Certificate[] = (data || []).map((item: any) => ({
        id: item.id,
        certificate_id: item.certificate_id,
        issue_date: item.issue_date,
        member: item.member && Array.isArray(item.member) && item.member.length > 0
          ? { full_name: item.member[0].full_name }
          : null,
        course: item.course && Array.isArray(item.course) && item.course.length > 0
          ? { title: item.course[0].title }
          : null
      }));

      setCertificates(formattedData);
    } catch (error) {
      console.error('Erreur lors du chargement des certificats:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><DocumentTextIcon className="h-6 w-6 text-blue-600" /></div>
            <h1 className="text-2xl font-bold text-slate-800">Gestion des certificats</h1>
            <span className="text-sm text-gray-500 ml-2">({certificates.length})</span>
          </div>
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            <PlusIcon className="h-4 w-4" /> Nouveau certificat
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">ID</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Certificat</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Membre</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Formation</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-12">
                    <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>Aucun certificat</p>
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-500">{cert.id}</td>
                    <td className="px-6 py-3 text-sm font-mono">{cert.certificate_id}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{cert.member?.full_name || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{cert.course?.title || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('fr-FR') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}