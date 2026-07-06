'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import api from '@/lib/api';
import { Send, Image as ImageIcon } from 'lucide-react';

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await api.get(`/messages/conversations/${conversationId}`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const selectConversation = (conv: any) => {
    setSelectedConversation(conv);
    loadMessages(conv.id);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await api.post(`/messages/conversations/${selectedConversation.id}/messages`, {
        content: newMessage,
      });
      setNewMessage('');
      loadMessages(selectedConversation.id);
    } catch (err) {
      console.error('Error sending message:', err);
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
      <div className="md:ml-64 h-screen flex">
        <div className="w-full md:w-80 border-r border-zinc-800">
          <div className="p-4 border-b border-zinc-800">
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.length === 0 ? (
              <p className="p-4 text-zinc-400">Aucune conversation</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800 ${
                    selectedConversation?.id === conv.id ? 'bg-zinc-800' : ''
                  }`}
                >
                  <p className="font-bold">{conv.otherUser.username}</p>
                  <p className="text-sm text-zinc-400 truncate">{conv.lastMessage || 'Nouveau message'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedConversation && (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="font-bold">@{selectedConversation.otherUser.username}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === selectedConversation.otherUser.id ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.senderId === selectedConversation.otherUser.id
                        ? 'bg-zinc-800'
                        : 'bg-blue-600'
                    }`}
                  >
                    {msg.content && <p>{msg.content}</p>}
                    {msg.gifUrl && <img src={msg.gifUrl} alt="" className="rounded-lg" />}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-zinc-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrire un message..."
                  className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
