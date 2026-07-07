'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, Plus, MessageSquare, Map, User, LogOut, Shield } from 'lucide-react';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navItems = [
    { path: '/feed', icon: Home, label: 'Pour toi' },
    { path: '/search', icon: Search, label: 'Recherche' },
    { path: '/upload', icon: Plus, label: 'Publier' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/map', icon: Map, label: 'Carte' },
    { path: '/profile', icon: User, label: 'Profil' },
  ];

  if (user.role === 'ADMIN') {
    navItems.push({ path: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 md:hidden z-50">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center p-2 ${
                pathname === item.path ? 'text-blue-400' : 'text-zinc-400'
              }`}
            >
              <item.icon size={24} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-zinc-900 border-r border-zinc-800 flex-col z-50">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold">Social Video</h1>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                pathname === item.path ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-zinc-800 transition"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>
    </>
  );
}