import React, { useState } from 'react';
import { X, User, Check, Shield, Sparkles, LogOut, Mail, Award, Lock, Chrome } from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);

  if (!isOpen) return null;

  const handleSimulateGoogleLogin = () => {
    onUpdateProfile({
      ...profile,
      isGuest: false,
      name: name || 'Ansh Kumar',
      email: email || 'ansh.kumar@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
    alert('Google Account connected successfully!');
  };

  const handleLogoutToGuest = () => {
    onUpdateProfile({
      id: 'guest-1',
      isGuest: true,
      name: 'Guest User',
      email: 'guest@alpha.ai',
      avatar: '',
      createdAt: new Date().toLocaleDateString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 md:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">User Profile & Account</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/30 flex items-center gap-4 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold border-2 border-indigo-400/40 shadow-inner overflow-hidden">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{profile.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {profile.isGuest ? 'Guest Mode' : 'Alpha AI Pro'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-slate-500" />
              <span>{profile.email}</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Member since {profile.createdAt || 'August 2026'}
            </p>
          </div>
        </div>

        {/* Authentication Actions */}
        {profile.isGuest ? (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-slate-300 font-medium">
              Connect your account to sync chats across devices & save personal memory securely:
            </p>

            <button
              onClick={handleSimulateGoogleLogin}
              className="w-full py-2.5 px-4 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Chrome className="w-4 h-4 text-blue-600" />
              <span>Continue with Google Sign-In</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
              <Shield className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Account active & synchronized with Alpha AI Cloud memory.</span>
            </div>

            <button
              onClick={handleLogoutToGuest}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Switch to Guest Mode / Logout</span>
            </button>
          </div>
        )}

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
