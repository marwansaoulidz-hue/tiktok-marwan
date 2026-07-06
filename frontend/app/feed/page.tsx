'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import api from '@/lib/api';
import { Heart, MessageCircle, Share2, Eye } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  user: {
    id: string;
    username: string;
    profile: { displayName: string | null; avatarUrl: string | null };
  };
}

export default function FeedPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const res = await api.get('/videos/feed');
      setVideos(res.data.videos);
    } catch (err) {
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (videoId: string) => {
    try {
      await api.post(`/social/like/${videoId}`);
      setVideos(videos.map(v => 
        v.id === videoId 
          ? { ...v, liked: !v.liked, likeCount: v.liked ? v.likeCount - 1 : v.likeCount + 1 }
          : v
      ));
    } catch (err) {
      console.error('Error liking video:', err);
    }
  };

  const handleScroll = (index: number) => {
    setCurrentIndex(index);
    videoRefs.current.forEach((video, i) => {
      if (video) {
        if (i === index) {
          video.play();
        } else {
          video.pause();
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="md:ml-64 pb-20 md:pb-0">
        <div className="max-w-lg mx-auto h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
          {videos.length === 0 ? (
            <div className="h-screen flex items-center justify-center text-zinc-400">
              Aucune vidéo disponible
            </div>
          ) : (
            videos.map((video, index) => (
              <div
                key={video.id}
                className="h-screen snap-start relative flex items-center justify-center"
                onScroll={() => handleScroll(index)}
              >
                <video
                  ref={el => videoRefs.current[index] = el}
                  src={video.videoUrl}
                  className="h-full w-full object-cover"
                  loop
                  playsInline
                  onClick={(e) => {
                    const vid = e.target as HTMLVideoElement;
                    vid.paused ? vid.play() : vid.pause();
                  }}
                />
                <div className="absolute bottom-20 left-4 right-20 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center cursor-pointer"
                      onClick={() => router.push(`/profile/${video.user.id}`)}
                    >
                      {video.user.profile.avatarUrl ? (
                        <img src={video.user.profile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold">
                          {video.user.profile.displayName || video.user.username[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold">@{video.user.username}</p>
                      <p className="text-sm text-zinc-300">{video.user.profile.displayName || ''}</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{video.title}</h3>
                  {video.description && <p className="text-sm text-zinc-300 mb-2">{video.description}</p>}
                </div>
                <div className="absolute right-4 bottom-32 flex flex-col gap-6">
                  <button
                    onClick={() => handleLike(video.id)}
                    className={`flex flex-col items-center ${video.liked ? 'text-red-500' : 'text-white'}`}
                  >
                    <Heart size={32} fill={video.liked ? 'currentColor' : 'none'} />
                    <span className="text-sm mt-1">{video.likeCount}</span>
                  </button>
                  <button
                    onClick={() => router.push(`/video/${video.id}`)}
                    className="flex flex-col items-center text-white"
                  >
                    <MessageCircle size={32} />
                    <span className="text-sm mt-1">{video.commentCount}</span>
                  </button>
                  <button className="flex flex-col items-center text-white">
                    <Share2 size={32} />
                  </button>
                  <div className="flex flex-col items-center text-white">
                    <Eye size={32} />
                    <span className="text-sm mt-1">0</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
