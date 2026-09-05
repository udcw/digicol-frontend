// app/projects/[slug]/contribute/page.tsx

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeftIcon,
  CodeBracketIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  UserGroupIcon,
  EnvelopeIcon,
  BookOpenIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  technologies: string;
  github_url: string | null;
  demo_url: string | null;
  status: string;
  created_by: string;
  creator?: {
    id: string;
    username: string;
    full_name: string;
    email: string;
  };
}

export default function ContributePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          creator:users(id, username, full_name, email)
        `)
        .eq('slug', slug)
        .single();

      if (projectError) {
        console.error('Erreur projet:', projectError);
        setError('Projet non trouvé');
        return;
      }

      if (projectData) {
        setProject(projectData);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        
        const { data: enrollment } = await supabase
          .from('project_enrollments')
          .select('status')
          .eq('project_id', projectData?.id)
          .eq('user_id', session.user.id)
          .single();

        if (enrollment) {
          setEnrollmentStatus(enrollment.status);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleContactCreator = () => {
    if (!project?.creator?.email) {
      alert('Email du créateur non disponible');
      return;
    }
    
    const subject = encodeURIComponent(`Rejoindre l'équipe du projet: ${project?.title}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nJe suis intéressé(e) par le projet "${project?.title}" et souhaiterais rejoindre l'équipe.\n\nVoici mes informations :\n- Nom: ${user?.user_metadata?.full_name || user?.email}\n- Email: ${user?.email}\n- Compétences: \n\nJe suis disponible pour contribuer.\n\nCordialement,\n${user?.user_metadata?.full_name || user?.email}`
    );
    
    window.location.href = `mailto:${project.creator.email}?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Projet non trouvé</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/projects" className="text-blue-600 hover:underline">
            Retour aux projets
          </Link>
        </div>
      </div>
    );
  }

  if (enrollmentStatus !== 'APPROVED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Accès non autorisé</h2>
          <p className="text-gray-500 mb-4">
            Vous devez être inscrit et approuvé pour contribuer à ce projet.
          </p>
          {enrollmentStatus === 'PENDING' && (
            <p className="text-yellow-600 text-sm mb-4">
              Votre inscription est en attente de validation par l'administrateur.
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Link href={`/projects/${slug}`} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
              Retour au projet
            </Link>
            <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
              Voir mes projets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Navigation - AJOUT DU LIEN DISCUSSIONS */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Link href={`/projects/${slug}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition text-sm">
            <ArrowLeftIcon className="h-4 w-4" />
            Retour au projet
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition text-sm">
            Tableau de bord
          </Link>
          <span className="text-gray-300">|</span>
          <Link href={`/projects/${slug}/discussions`} className="text-purple-600 hover:text-purple-700 transition text-sm font-medium flex items-center gap-1">
            <ChatBubbleLeftIcon className="h-4 w-4" />
            Discussions
          </Link>
        </div>

        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white mb-6">
          <h1 className="text-2xl font-bold">
            Contribuer à "{project.title}"
          </h1>
          <p className="text-blue-100 mt-1">
            Voici comment vous pouvez contribuer à ce projet
          </p>
          <div className="flex items-center flex-wrap gap-3 mt-3">
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
              {project.status === 'IN_PROGRESS' ? 'En cours' : project.status}
            </span>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
              {project.technologies?.split(',').slice(0, 3).join(', ')}
            </span>
            <Link 
              href={`/projects/${slug}/discussions`}
              className="text-xs bg-purple-500/50 hover:bg-purple-500/70 text-white px-3 py-1 rounded-full transition flex items-center gap-1"
            >
              <ChatBubbleLeftIcon className="h-3 w-3" />
              Discussions
            </Link>
          </div>
        </div>

        {/* Grille des actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GitHub */}
          {project.github_url && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <CodeBracketIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Contribuer sur GitHub</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Forkez le projet, créez une branche et faites une pull request.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition"
                    >
                      Voir sur GitHub →
                    </a>
                    <a
                      href={`${project.github_url}/fork`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
                    >
                      Fork
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Discussions / Issues */}
          {project.github_url && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <ChatBubbleLeftIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Participer aux discussions</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Échangez avec l'équipe, proposez des idées et suivez l'avancement.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/projects/${slug}/discussions`}
                      className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Voir les discussions →
                    </Link>
                    <a
                      href={`${project.github_url}/issues`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
                    >
                      Issues GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documentation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-purple-600 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Documentation</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Consultez la documentation pour comprendre le projet.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.github_url && (
                    <a
                      href={`${project.github_url}#readme`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition"
                    >
                      Lire le README →
                    </a>
                  )}
                  <button
                    onClick={() => alert('Documentation en cours de rédaction')}
                    className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
                  >
                    Documentation à venir
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Rejoindre l'équipe */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-600 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Rejoindre l'équipe</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Contactez le créateur du projet pour rejoindre l'équipe.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={handleContactCreator}
                    className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                    Contacter l'équipe
                  </button>
                  {project.creator?.full_name && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <span>Créateur: {project.creator.full_name}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Démo */}
          {project.demo_url && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <StarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">Voir la démo</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Testez le projet en action et voyez ce qui a été réalisé.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Voir la démo →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Guide de contribution</h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">1</span>
              <span>Forkez le dépôt GitHub du projet</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">2</span>
              <span>Créez une branche pour votre fonctionnalité: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">git checkout -b feature/ma-fonctionnalite</code></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">3</span>
              <span>Faites vos modifications et commitez: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">git commit -m "Ma contribution"</code></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">4</span>
              <span>Poussez votre branche: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">git push origin feature/ma-fonctionnalite</code></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">5</span>
              <span>Créez une Pull Request sur GitHub</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">6</span>
              <span>Participez aux discussions et révisions</span>
            </li>
          </ol>
        </div>

        <div className="mt-6 text-center flex flex-wrap justify-center gap-4">
          <Link href={`/projects/${slug}`} className="text-sm text-blue-600 hover:underline">
            ← Retour au projet
          </Link>
          <Link href={`/projects/${slug}/discussions`} className="text-sm text-purple-600 hover:underline flex items-center gap-1">
            <ChatBubbleLeftIcon className="h-4 w-4" />
            Voir les discussions
          </Link>
        </div>
      </div>
    </div>
  );
}