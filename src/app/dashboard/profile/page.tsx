'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if(data.user) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  if (!user) return <div className="text-center p-8">User not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          My Profile
        </h2>
        <p className="text-slate-400 mt-2">Manage your account settings</p>
      </div>

      <div className="glass-card p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 text-4xl font-bold border-2 border-slate-700">
             {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{user.name}</h3>
            <p className="text-blue-400">{user.role}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Email Address</p>
              <p className="text-slate-200">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Account Role</p>
              <p className="text-slate-200 capitalize">{user.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
               <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Member Since</p>
              <p className="text-slate-200">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
