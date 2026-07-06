'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import api from '@/lib/api';
import { User as UserIcon, Video as VideoIcon, Heart, Users } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadProfile(params.id as string);
    }
  }, [params.id]);

  const loadProfile = async (userId: string) => {
    try {
      const [profileRes, videosRes] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/videos/user/${userId}`),
      ]);
      setProfile(profileRes.data);
      setVideos(videosRes.data.videos);
      setIsFollowing(profileRes.data.isFollowing || false);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/social/follow/${profile.id}`);
      } else {
        await api.post(`/social/follow/${profile.id}`);
      }
      setIsFollowing(!isFollowing);
      loadProfile(params.id as string);
    } catch (err) {
      console.error('Error following:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">Profil introuvable</div>;
  }

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnProfile = currentUser.id === profile.id;

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navigation />
      <div className="md:ml-64 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="w-32 h-32 rounded-full bg-zinc-700 flex items-center justify-center mx-auto md:mx-0">
              {profile.profile?.avatarUrl ? (
                <img src={profile.profile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-4xl font-bold">
                  {profile.profile?.displayName || profile.username[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">@{profile.username}</h1>
              <p className="text-zinc-400 mb-4">{profile.profile?.displayName || ''}</p>
              {profile.profile?.bio && <p className="text-zinc-300 mb-4">{profile.profile.bio}</p>}
              <div className="flex gap-6 justify-center md:justify-start mb-4">
                <div className="flex items-center gap-2">
                  <VideoIcon size={20} />
                  <span>{videos.length} vidéos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  <span>{profile._count?.followers || 0} abonnés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart size={20} />
                  <span>{profile._count?.following || 0} abonnements</span>
                </div>
              </div>
              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    isFollowing
                      ? 'bg-zinc-700 hover:bg-zinc-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? 'Se désabonner' : 'S\'abonner'}
                </button>
              )}
              {isOwnProfile && (
                <button
                  onClick={() => router.push('/settings')}
                  className="px-6 py-2 rounded-lg font-medium bg-zinc-700 hover:bg-zinc-600 transition"
                >
                  Modifier le profil
                </button>
              )}
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4">Vidéos</h2>
          {videos.length === 0 ? (
            <p className="text-zinc-400">Aucune vidéo</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => router.push(`/video/${video.id}`)}
                  className="cursor-pointer"
                >
                  <div className="aspect-[9/16] bg-zinc-800 rounded-lg overflow-hidden">
                    {video.thumbnailUrl && (
                      <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <p className="mt-2 font-medium truncate">{video.title}</p>
                  <p className="text-sm text-zinc-400">{video.likeCount} likes</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
