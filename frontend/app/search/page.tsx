'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import api from '@/lib/api';
import { Search as SearchIcon, User, Video, Hash } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <Navigation />
      <div className="md:ml-64 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Recherche</h1>
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher des utilisateurs, vidéos ou hashtags..."
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg transition"
              >
                <SearchIcon size={24} />
              </button>
            </div>
          </form>

          {results && (
            <div className="space-y-8">
              {results.users && results.users.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <User size={20} /> Utilisateurs
                  </h2>
                  <div className="space-y-3">
                    {results.users.map((user: any) => (
                      <div
                        key={user.id}
                        onClick={() => router.push(`/profile/${user.id}`)}
                        className="flex items-center gap-3 p-4 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition"
                      >
                        <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center">
                          {user.profile?.avatarUrl ? (
                            <img src={user.profile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-xl font-bold">
                              {user.profile?.displayName || user.username[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold">@{user.username}</p>
                          <p className="text-sm text-zinc-400">{user.profile?.displayName || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.videos && results.videos.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Video size={20} /> Vidéos
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {results.videos.map((video: any) => (
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
                        <p className="text-sm text-zinc-400">@{video.user.username}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.hashtags && results.hashtags.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Hash size={20} /> Hashtags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {results.hashtags.map((tag: any) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 bg-zinc-800 rounded-full text-sm cursor-pointer hover:bg-zinc-700"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {results.users?.length === 0 && results.videos?.length === 0 && results.hashtags?.length === 0 && (
                <p className="text-zinc-400 text-center py-8">Aucun résultat trouvé</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
