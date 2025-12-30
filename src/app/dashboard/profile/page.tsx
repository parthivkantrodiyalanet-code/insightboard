'use client';

import { useState, useEffect } from 'react';
import { Mail, Shield, Calendar, Loader2 } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  createdAt: string;
  trialEndsAt: string;
  isPaid: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
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

      {/* Subscription Section */}
      <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-6">Subscription Plan</h3>
          
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700 mb-6">
              <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Current Plan</p>
                  <p className="text-xl font-bold text-white mt-1">
                      {user.isPaid ? 'Pro Plan' : 'Free Trial'}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                      {user.isPaid 
                        ? 'Unlimited Access' 
                        : (new Date(user.trialEndsAt) > new Date() 
                            ? `Trial ends on ${new Date(user.trialEndsAt).toLocaleDateString()}` 
                            : 'Trial Expired')
                      }
                  </p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  user.isPaid 
                    ? 'bg-green-500/20 text-green-400' 
                    : (new Date(user.trialEndsAt) > new Date() ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400')
              }`}>
                  {user.isPaid 
                    ? 'Active' 
                    : (new Date(user.trialEndsAt) > new Date() ? 'Trial Active' : 'Expired')
                  }
              </div>
          </div>

          {!user.isPaid && (
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-500/30">
                  <div className="flex justify-between items-center">
                      <div>
                          <h4 className="text-lg font-semibold text-white">Upgrade to Pro</h4>
                          <p className="text-slate-400 text-sm mt-1">Unlock unlimited dashboards and remove limits.</p>
                      </div>
                      <a href="/pricing" className="btn-primary py-2 px-4 text-sm">
                          View Plans
                      </a>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
}
