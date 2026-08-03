import React from 'react';
import { Sparkles, GraduationCap, Bookmark, Calendar, RotateCcw, Bot, MessageSquare, Brain, Settings, User, Moon, Sun } from 'lucide-react';
import { ModeType, UserProfile, UserSettings, UserMemory } from '../types';

interface NavbarProps {
  currentMode: ModeType;
  onModeChange: (mode: ModeType) => void;
  onOpenBookmarks: () => void;
  onOpenPlanner: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onClearChat: () => void;
  bookmarkCount: number;
  sessionCount: number;
  profile: UserProfile;
  settings: UserSettings;
  memory: UserMemory;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onModeChange,
  onOpenBookmarks,
  onOpenPlanner,
  onOpenHistory,
  onOpenSettings,
  onOpenProfile,
  onClearChat,
  bookmarkCount,
  sessionCount,
  profile,
  settings,
  memory,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-3 md:px-5 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: History drawer button + Logo & Brand */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Chat History Drawer Toggle */}
          <button
            onClick={onOpenHistory}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 relative transition-colors border border-slate-700/60"
            title="Chat History & Past Conversations"
          >
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            {sessionCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {sessionCount}
              </span>
            )}
          </button>

          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-indigo-500/40 p-0.5 overflow-hidden shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <img src="/logo.png" alt="Alpha AI Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  Alpha AI
                </h1>
                <span className="hidden sm:flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Personal AI
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-indigo-300/90 font-medium">
                Think Smarter. Build Faster. Learn Better.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Class 12 Planner */}
          <button
            onClick={onOpenPlanner}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition-all transform active:scale-95"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Class 12 Planner</span>
          </button>

          {/* Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            className="p-2 md:px-3 md:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 relative transition-colors flex items-center gap-1.5"
            title="Saved Bookmarks"
          >
            <Bookmark className="w-4 h-4 text-pink-400" />
            <span className="hidden md:inline">Bookmarks</span>
            {bookmarkCount > 0 && (
              <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {settings.theme === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>

          {/* Memory & Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 md:px-3 md:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors flex items-center gap-1.5"
            title="Memory & Settings"
          >
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Memory & Settings</span>
          </button>

          {/* User Profile Avatar button */}
          <button
            onClick={onOpenProfile}
            className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-colors flex items-center gap-1"
            title="User Profile & Login"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />
              )}
            </div>
          </button>

          {/* Clear / New Chat Reset button */}
          <button
            onClick={onClearChat}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            title="New / Clear Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
