'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import api from '@/lib/api';
import { Users, Video, AlertCircle, HardDrive, Shield } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [storage, setStorage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'ADMIN') {
      router.push('/feed');
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'videos') {
        const res = await api.get('/admin/videos');
        setVideos(res.data);
      } else if (activeTab === 'reports') {
        const res = await api.get('/admin/reports');
        setReports(res.data);
      } else if (activeTab === 'storage') {
        const res = await api.get('/admin/storage');
        setStorage(res.data);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Désactiver cet utilisateur ?')) return;
    try {
      await api.put(`/admin/users/${userId}/deactivate`);
      loadData();
    } catch (err) {
      console.error('Error deactivating user:', err);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Supprimer cette vidéo ?')) return;
    try {
      await api.delete(`/admin/videos/${videoId}`);
      loadData();
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  const tabs = [
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'videos', label: 'Vidéos', icon: Video },
    { id: 'reports', label: 'Signalements', icon: AlertCircle },
    { id: 'storage', label: 'Stockage', icon: HardDrive },
  ];

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navigation />
      <div className="md:ml-64 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <Shield size={32} /> Administration
          </h1>

          <div className="flex gap-2 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  activeTab === tab.id ? 'bg-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <div className="bg-zinc-800 rounded-lg p-6">
              {activeTab === 'users' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Utilisateurs ({users.length})</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-zinc-700">
                          <th className="text-left p-3">Utilisateur</th>
                          <th className="text-left p-3">Rôle</th>
                          <th className="text-left p-3">Statut</th>
                          <th className="text-left p-3">Vidéos</th>
                          <th className="text-left p-3">Abonnés</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b border-zinc-700">
                            <td className="p-3">
                              <p className="font-bold">@{user.username}</p>
                              <p className="text-sm text-zinc-400">{user.email}</p>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                user.role === 'ADMIN' ? 'bg-purple-600' :
                                user.role === 'MODERATOR' ? 'bg-blue-600' :
                                'bg-zinc-600'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                user.isActive ? 'bg-green-600' : 'bg-red-600'
                              }`}>
                                {user.isActive ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td className="p-3">{user._count?.videos || 0}</td>
                            <td className="p-3">{user._count?.followers || 0}</td>
                            <td className="p-3">
                              {user.isActive && user.role !== 'ADMIN' && (
                                <button
                                  onClick={() => handleDeactivateUser(user.id)}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                >
                                  Désactiver
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'videos' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Vidéos ({videos.length})</h2>
                  <div className="space-y-4">
                    {videos.map((video) => (
                      <div key={video.id} className="flex items-center gap-4 p-4 bg-zinc-700 rounded-lg">
                        {video.thumbnailKey && (
                          <img src={video.thumbnailUrl} alt="" className="w-20 h-28 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <p className="font-bold">{video.title}</p>
                          <p className="text-sm text-zinc-400">@{video.user.username}</p>
                          <p className="text-xs text-zinc-500">
                            {video.likeCount} likes • {video.commentCount} commentaires
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Signalements ({reports.length})</h2>
                  {reports.length === 0 ? (
                    <p className="text-zinc-400">Aucun signalement</p>
                  ) : (
                    <div className="space-y-4">
                      {reports.map((report) => (
                        <div key={report.id} className="p-4 bg-zinc-700 rounded-lg">
                          <p className="font-bold">{report.reason}</p>
                          <p className="text-sm text-zinc-400">
                            Par @{report.reporter.username} • {new Date(report.createdAt).toLocaleString('fr-FR')}
                          </p>
                          <p className="text-xs text-zinc-500 mt-2">Statut: {report.status}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'storage' &&存储 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Stockage</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-zinc-700 rounded-lg">
                      <p className="text-sm text-zinc-400">Vidéos</p>
                      <p className="text-2xl font-bold">{storage.videoCount}</p>
                    </div>
                    <div className="p-4 bg-zinc-700 rounded-lg">
                      <p className="text-sm text-zinc-400">Utilisateurs</p>
                      <p className="text-2xl font-bold">{storage.userCount}</p>
                    </div>
                    <div className="p-4 bg-zinc-700 rounded-lg">
                      <p className="text-sm text-zinc-400">Espace utilisé</p>
                      <p className="text-2xl font-bold">{(parseInt(storage.videoBytes) / 1024 / 1024 / 1024).toFixed(2)} Go</p>
                    </div>
                    <div className="p-4 bg-zinc-700 rounded-lg">
                      <p className="text-sm text-zinc-400">Limite</p>
                      <p className="text-2xl font-bold">{storage.videoLimitGb} Go</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
