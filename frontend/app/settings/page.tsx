'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import api from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    shareLocation: false,
    notifyMessages: true,
    notifyLikes: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.get(`/users/${user.id}`);
      const profile = res.data.profile;
      setFormData({
        displayName: profile?.displayName || '',
        bio: profile?.bio || '',
        shareLocation: profile?.shareLocation || false,
        notifyMessages: profile?.notifyMessages ?? true,
        notifyLikes: profile?.notifyLikes ?? true,
      });
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await api.put(`/users/${user.id}`, formData);
      setMessage('Profil mis à jour avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await api.delete(`/users/${user.id}`);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Erreur lors de la suppression du compte');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navigation />
      <div className="md:ml-64 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Paramètres</h1>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes('succès') ? 'bg-green-600' : 'bg-red-600'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nom d'affichage</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                maxLength={500}
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.shareLocation}
                  onChange={(e) => setFormData({ ...formData, shareLocation: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span>Partager ma position avec mes amis</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifyMessages}
                  onChange={(e) => setFormData({ ...formData, notifyMessages: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span>Notifications pour les messages</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifyLikes}
                  onChange={(e) => setFormData({ ...formData, notifyLikes: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <span>Notifications pour les likes</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg font-medium transition"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-zinc-800">
            <h2 className="text-xl font-bold mb-4 text-red-500">Zone de danger</h2>
            <button
              onClick={handleDeleteAccount}
              className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition"
            >
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
