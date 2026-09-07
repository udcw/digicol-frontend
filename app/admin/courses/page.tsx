
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, Course, Category } from '@/lib/supabase';
import { 
  ArrowLeftIcon, 
  BookOpenIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // État pour les IDs de vidéos (stockés en tant que chaîne de caractères séparée par des virgules)
  const [videoIdsInput, setVideoIdsInput] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    level: 'DEBUTANT',
    duration: '',
    program: '',
    prerequisites: '',
    price: 0,
    available_seats: 10,
    category_id: null as number | null,
    is_published: false,
    youtube_playlist_id: '',
    has_videos: false,
  });

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

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

  const fetchData = async () => {
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        supabase.from('courses').select('*, category:categories(*)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ]);
      if (coursesRes.error) throw coursesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      setCourses(coursesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = await supabase.auth.getUser();
      
      // Convertir la chaîne d'IDs en tableau
      const videoIds = videoIdsInput
        .split(',')
        .map(id => id.trim())
        .filter(id => id !== '');

      const data = {
        ...formData,
        instructor_id: userData.data.user?.id,
        youtube_video_ids: videoIds,
        has_videos: formData.has_videos && videoIds.length > 0,
      };
      
      if (editingId) {
        const { error } = await supabase.from('courses').update(data).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('courses').insert(data);
        if (error) throw error;
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      level: course.level,
      duration: course.duration || '',
      program: course.program || '',
      prerequisites: course.prerequisites || '',
      price: course.price,
      available_seats: course.available_seats,
      category_id: course.category_id,
      is_published: course.is_published,
      youtube_playlist_id: course.youtube_playlist_id || '',
      has_videos: course.has_videos || false,
    });
    
    // Convertir le tableau d'IDs en chaîne séparée par des virgules
    setVideoIdsInput((course.youtube_video_ids || []).join(', '));
    
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette formation ?')) return;
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      level: 'DEBUTANT',
      duration: '',
      program: '',
      prerequisites: '',
      price: 0,
      available_seats: 10,
      category_id: null,
      is_published: false,
      youtube_playlist_id: '',
      has_videos: false,
    });
    setVideoIdsInput('');
  };

  const renderProgramPreview = (program: string) => {
    if (!program) return <span className="text-gray-400">Aucun</span>;
    
    const cleanProgram = program.replace(/\\n/g, '\n');
    const lines = cleanProgram.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) return <span className="text-gray-400">Aucun</span>;
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('-')) {
        return (
          <div key={index} className="flex items-start gap-1 text-xs text-gray-600 ml-2">
            <span className="text-blue-500">•</span>
            <span>{trimmedLine.substring(1).trim()}</span>
          </div>
        );
      }
      if (trimmedLine.toLowerCase().startsWith('module')) {
        return (
          <div key={index} className="font-medium text-xs text-slate-700 mt-1">
            {trimmedLine}
          </div>
        );
      }
      return (
        <div key={index} className="text-xs text-gray-500">
          {trimmedLine}
        </div>
      );
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const getLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      'DEBUTANT': 'Debutant',
      'INTERMEDIAIRE': 'Intermédiaire',
      'AVANCE': 'Avance',
      'EXPERT': 'Expert',
    };
    return levels[level] || level;
  };

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
            <div className="p-2 bg-blue-50 rounded-lg"><BookOpenIcon className="h-6 w-6 text-blue-600" /></div>
            <h1 className="text-2xl font-bold text-slate-800">Gestion des formations</h1>
            <span className="text-sm text-gray-500 ml-2">({courses.length})</span>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            <PlusIcon className="h-4 w-4" />
            {showForm ? 'Annuler' : 'Nouvelle formation'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              {editingId ? 'Modifier la formation' : 'Nouvelle formation'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selectionner</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DEBUTANT">Debutant</option>
                  <option value="INTERMEDIAIRE">Intermédiaire</option>
                  <option value="AVANCE">Avance</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duree</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="4 semaines"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
                <textarea
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Module 1: Introduction&#10;- Syntaxe et variables"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prerequis</label>
                <textarea
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Places disponibles</label>
                <input
                  type="number"
                  value={formData.available_seats}
                  onChange={(e) => setFormData({ ...formData, available_seats: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* SECTION YOUTUBE - Utilisant la structure existante */}
              <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
                <h3 className="text-md font-semibold text-slate-700 mb-3">Videos YouTube</h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ID de la playlist YouTube</label>
                <input
                  type="text"
                  value={formData.youtube_playlist_id}
                  onChange={(e) => setFormData({ ...formData, youtube_playlist_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="PLillGF-RfqbZ7s3t6ZInY3NjEOOX7hsBv"
                />
                <p className="text-xs text-gray-400 mt-1">ID de la playlist YouTube (optionnel)</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">IDs des videos YouTube</label>
                <textarea
                  value={videoIdsInput}
                  onChange={(e) => setVideoIdsInput(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="dQw4w9WgXcQ, dQw4w9WgXcQ, dQw4w9WgXcQ"
                />
                <p className="text-xs text-gray-400 mt-1">Separes par des virgules</p>
                
                {/* Aperçu des miniatures */}
                {videoIdsInput && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {videoIdsInput.split(',').map((id, index) => {
                      const cleanId = id.trim();
                      if (!cleanId) return null;
                      return (
                        <div key={index} className="relative w-24 h-16 bg-gray-100 rounded overflow-hidden border border-gray-200">
                          <img
                            src={`https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`}
                            alt={`Video ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <span className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5">
                            {index + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.has_videos}
                    onChange={(e) => setFormData({ ...formData, has_videos: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  Activer les videos pour cette formation
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  Publie
                </label>
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                >
                  {editingId ? 'Mettre à jour' : 'Creer'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Titre</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Categorie</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Niveau</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Videos</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Prix</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Programme</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Statut</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-500 py-12">
                      <BookOpenIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>Aucune formation</p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="text-blue-600 hover:underline mt-2"
                      >
                        Creer la premiere formation
                      </button>
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{course.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{course.category?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{getLevelLabel(course.level)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {course.has_videos && course.youtube_video_ids && course.youtube_video_ids.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              {course.youtube_video_ids.length} videos
                            </span>
                            {course.youtube_video_ids.length > 1 && (
                              <span className="text-xs text-gray-400">
                                ({course.youtube_video_ids.join(', ')})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Aucune</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{course.price} FCFA</td>
                      <td className="px-4 py-3">
                        <div className="max-w-[200px] max-h-[60px] overflow-y-auto text-xs">
                          {course.program ? renderProgramPreview(course.program) : <span className="text-gray-400">Aucun</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {course.is_published ? 'Publie' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/courses/${course.slug}`} target="_blank" className="text-gray-500 hover:text-gray-700 p-1">
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleEdit(course)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}