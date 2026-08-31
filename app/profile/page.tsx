// app/profile/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { auth, members } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    study_level: '',
    domain: '',
    skills: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    Promise.all([auth.profile(), members.profile()])
      .then(([userRes, memberRes]) => {
        setUser(userRes.data);
        setMember(memberRes.data);
        setFormData({
          full_name: memberRes.data.full_name || '',
          phone: memberRes.data.phone || '',
          city: memberRes.data.city || '',
          study_level: memberRes.data.study_level || '',
          domain: memberRes.data.domain || '',
          skills: memberRes.data.skills || '',
          bio: memberRes.data.bio || '',
        });
      })
      .catch(() => {
        localStorage.clear();
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await members.update(formData);
      setEditing(false);
      // Rafraîchir les données
      const memberRes = await members.profile();
      setMember(memberRes.data);
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
              {member?.full_name?.charAt(0) || user?.username?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{member?.full_name || user?.username}</h1>
              <p className="text-sm text-gray-500">{user?.digicol_id}</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'étude</label>
                <input
                  type="text"
                  name="study_level"
                  value={formData.study_level}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domaine</label>
                <input
                  type="text"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compétences</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Séparées par des virgules"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{member?.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ville</p>
                  <p className="font-medium">{member?.city || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Niveau d'étude</p>
                  <p className="font-medium">{member?.study_level || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Domaine</p>
                  <p className="font-medium">{member?.domain || 'Non renseigné'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Compétences</p>
                <p className="font-medium">{member?.skills || 'Non renseigné'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bio</p>
                <p className="font-medium">{member?.bio || 'Non renseigné'}</p>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Modifier mon profil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}