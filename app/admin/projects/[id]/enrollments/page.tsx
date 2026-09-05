// app/admin/projects/[id]/enrollments/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  UserIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface Enrollment {
  id: string;
  project_id: number;
  user_id: string;
  status: string;
  role: string;
  joined_at: string;
  validated_at: string | null;
  validated_by: string | null;
  rejection_reason: string | null;
}

export default function ProjectEnrollmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [projectStatus, setProjectStatus] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
    fetchProject();
    fetchEnrollments();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    const role = userData?.role || 'MEMBRE';
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      router.push('/admin/login');
    }
  };

  const fetchProject = async () => {
    try {
      const projectId = Number(id);
      const { data, error } = await supabase
        .from('projects')
        .select('title, status, slug')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Erreur projet:', error);
        return;
      }

      if (data) {
        setProjectTitle(data.title);
        setProjectStatus(data.status);
        setProjectSlug(data.slug);
      }
    } catch (err) {
      console.error('Erreur fetchProject:', err);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const projectId = Number(id);

      const { data, error } = await supabase
        .from('project_enrollments')
        .select('*')
        .eq('project_id', projectId)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase:', error);
        setError('Erreur lors du chargement des inscriptions');
        return;
      }

      setEnrollments(data || []);

      if (data && data.length > 0) {
        const userIds = data.map((e: Enrollment) => e.user_id).filter(Boolean);
        const validatorIds = data.map((e: Enrollment) => e.validated_by).filter(Boolean);
        const allIds = [...new Set([...userIds, ...validatorIds])];

        if (allIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, username, full_name, avatar')
            .in('id', allIds);

          if (!usersError && users) {
            const enrichedData = data.map((enrollment: Enrollment) => ({
              ...enrollment,
              user: users.find((u: any) => u.id === enrollment.user_id),
              validator: users.find((u: any) => u.id === enrollment.validated_by),
            }));
            setEnrollments(enrichedData);
          }
        }
      }

      const pending = data?.filter((e: Enrollment) => e.status === 'PENDING').length || 0;
      const approved = data?.filter((e: Enrollment) => e.status === 'APPROVED').length || 0;
      const rejected = data?.filter((e: Enrollment) => e.status === 'REJECTED').length || 0;
      setStats({ pending, approved, rejected });

    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des inscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (enrollmentId: string, action: 'approve' | 'reject') => {
    const reason = action === 'reject' ? prompt('Raison du refus (optionnel):') : null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateData: any = {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        validated_at: new Date().toISOString(),
        validated_by: user.id,
        updated_at: new Date().toISOString(),
      };

      if (reason) {
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('project_enrollments')
        .update(updateData)
        .eq('id', enrollmentId);

      if (error) throw error;

      const enrollment = enrollments.find(e => e.id === enrollmentId);
      
      const notificationTitle = action === 'approve' 
        ? 'Inscription au projet approuvee' 
        : 'Inscription au projet refusee';
      
      const notificationMessage = action === 'approve' 
        ? `Votre inscription au projet "${projectTitle}" a ete approuvee.`
        : `Votre inscription au projet "${projectTitle}" a ete refusee.${reason ? ' Raison: ' + reason : ''}`;

      await supabase
        .from('notifications')
        .insert({
          user_id: enrollment?.user_id,
          title: notificationTitle,
          message: notificationMessage,
          type: 'PROJECT_ENROLLMENT',
          link: `/projects/${projectSlug}`,
          is_read: false,
          created_at: new Date().toISOString(),
        });

      await fetchEnrollments();
      alert(`Inscription ${action === 'approve' ? 'approuvee' : 'refusee'} avec succes`);

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la validation');
    }
  };

  const handleBulkApprove = async () => {
    const pendingEnrollments = enrollments.filter(e => e.status === 'PENDING');
    if (pendingEnrollments.length === 0) {
      alert('Aucune inscription en attente');
      return;
    }

    if (!confirm(`Approuver les ${pendingEnrollments.length} inscriptions en attente ?`)) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ids = pendingEnrollments.map(e => e.id);
      
      const { error } = await supabase
        .from('project_enrollments')
        .update({
          status: 'APPROVED',
          validated_at: new Date().toISOString(),
          validated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .in('id', ids);

      if (error) throw error;

      for (const enrollment of pendingEnrollments) {
        await supabase
          .from('notifications')
          .insert({
            user_id: enrollment.user_id,
            title: 'Inscription au projet approuvee',
            message: `Votre inscription au projet "${projectTitle}" a ete approuvee.`,
            type: 'PROJECT_ENROLLMENT',
            link: `/projects/${projectSlug}`,
            is_read: false,
            created_at: new Date().toISOString(),
          });
      }

      await fetchEnrollments();
      alert(`${pendingEnrollments.length} inscription(s) approuvee(s) avec succes`);

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'approbation en masse');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'APPROVED': 'Approuve',
      'REJECTED': 'Refuse',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'APPROVED': 'bg-green-100 text-green-700',
      'REJECTED': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'PENDING': ClockIcon,
      'APPROVED': CheckCircleIcon,
      'REJECTED': XCircleIcon,
    };
    return icons[status] || ClockIcon;
  };

  const getProjectStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'DRAFT': 'Brouillon',
      'IN_PROGRESS': 'En cours',
      'COMPLETED': 'Termine',
      'ARCHIVED': 'Archive',
    };
    return labels[status] || status;
  };

  const getProjectStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'bg-gray-100 text-gray-700',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'ARCHIVED': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredEnrollments = filter === 'all' 
    ? enrollments 
    : enrollments.filter((e: any) => e.status === filter);

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
          <Link href="/admin/projects" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600">
            <ArrowLeftIcon className="h-4 w-4" /> Retour
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Inscriptions</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{projectTitle || 'Chargement...'}</span>
                {projectStatus && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getProjectStatusColor(projectStatus)}`}>
                    {getProjectStatusLabel(projectStatus)}
                  </span>
                )}
                <span className="text-sm text-gray-400">• {enrollments.length} inscription{enrollments.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stats.pending > 0 && (
              <button
                onClick={handleBulkApprove}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
              >
                <CheckCircleIcon className="h-4 w-4" />
                Approuver tout ({stats.pending})
              </button>
            )}
            <Link
              href="/admin/projects"
              className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm transition"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Retour aux projets
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
              <p className="text-xs text-gray-500 font-medium">En attente</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <p className="text-xs text-gray-500 font-medium">Approuves</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <XCircleIcon className="h-5 w-5 text-red-600" />
              <p className="text-xs text-gray-500 font-medium">Refuses</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tous ({enrollments.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'PENDING'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            En attente ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'APPROVED'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Approuves ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === 'REJECTED'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Refuses ({stats.rejected})
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Membre</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Statut</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-12">
                      <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>Aucune inscription pour ce projet</p>
                      <p className="text-xs text-gray-400 mt-1">ID du projet: {id}</p>
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enrollment: any) => {
                    const StatusIcon = getStatusIcon(enrollment.status);
                    return (
                      <tr key={enrollment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {enrollment.user?.full_name?.charAt(0) || enrollment.user?.username?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {enrollment.user?.full_name || enrollment.user?.username || 'Inconnu'}
                              </p>
                              {enrollment.user?.email && (
                                <p className="text-xs text-gray-400">{enrollment.user.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {enrollment.user?.email || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getStatusColor(enrollment.status)}`}>
                            <StatusIcon className="h-3 w-3" />
                            {getStatusLabel(enrollment.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(enrollment.joined_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {enrollment.status === 'PENDING' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleValidate(enrollment.id, 'approve')}
                                className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-lg text-xs transition"
                                title="Approuver"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                                Approuver
                              </button>
                              <button
                                onClick={() => handleValidate(enrollment.id, 'reject')}
                                className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-lg text-xs transition"
                                title="Refuser"
                              >
                                <XCircleIcon className="h-4 w-4" />
                                Refuser
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {enrollment.status === 'APPROVED' ? 'Approuve' : 'Refuse'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Les membres peuvent s'inscrire depuis la page publique du projet
          </p>
        </div>
      </main>
    </div>
  );
}