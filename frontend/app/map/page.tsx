'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import api from '@/lib/api';
import { MapPin, ToggleLeft, ToggleRight } from 'lucide-react';

export default function MapPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [shareLocation, setShareLocation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
    loadSettings();
  }, []);

  const loadFriends = async () => {
    try {
      const res = await api.get('/locations/friends');
      setFriends(res.data);
    } catch (err) {
      console.error('Error loading friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await api.get(`/users/${user.id}`);
      setShareLocation(res.data.profile?.shareLocation || false);
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const toggleLocationSharing = async () => {
    try {
      if (shareLocation) {
        await api.put('/locations/disable');
      } else {
        await api.put('/locations/enable');
      }
      setShareLocation(!shareLocation);
    } catch (err) {
      console.error('Error toggling location:', err);
    }
  };

  const updateMyLocation = async () => {
    if (!navigator.geolocation) {
      alert('Géolocalisation non supportée');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await api.post('/locations', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          loadFriends();
        } catch (err) {
          console.error('Error updating location:', err);
        }
      },
      (error) => {
        alert('Erreur de géolocalisation: ' + error.message);
      }
    );
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Carte des amis</h1>
            <button
              onClick={toggleLocationSharing}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"
            >
              {shareLocation ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              <span>{shareLocation ? 'Partage activé' : 'Partage désactivé'}</span>
            </button>
          </div>

          <button
            onClick={updateMyLocation}
            className="w-full mb-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <MapPin size={20} />
            Mettre à jour ma position
          </button>

          <div className="bg-zinc-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Amis avec position partagée</h2>
            {friends.length === 0 ? (
              <p className="text-zinc-400">Aucun ami ne partage sa position</p>
            ) : (
              <div className="space-y-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center gap-4 p-4 bg-zinc-700 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-zinc-600 flex items-center justify-center">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold">
                          {friend.displayName || friend.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">@{friend.username}</p>
                      <p className="text-sm text-zinc-400">{friend.displayName || ''}</p>
                    </div>
                    {friend.location && (
                      <div className="text-right">
                        <p className="text-sm text-zinc-400">
                          {friend.location.latitude.toFixed(4)}, {friend.location.longitude.toFixed(4)}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {new Date(friend.location.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Informations</h2>
            <ul className="space-y-2 text-zinc-400">
              <li>• La position n'est partagée qu'avec vos amis acceptés</li>
              <li>• Vous pouvez activer/désactiver le partage à tout moment</li>
              <li>• La position est mise à jour manuellement</li>
              <li>• Seules les personnes qui ont activé le partage apparaissent</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
