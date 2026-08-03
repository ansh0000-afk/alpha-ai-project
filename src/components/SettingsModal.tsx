import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Monitor, User, Brain, Volume2, Globe, Shield, Trash2, Plus, Sparkles, Check, Save, Download } from 'lucide-react';
import { UserSettings, UserMemory, MemoryItem, UserProfile } from '../types';
import { getAvailableVoices, VoiceOption } from '../lib/speechSynthesis';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  memory: UserMemory;
  onUpdateMemory: (newMemory: UserMemory) => void;
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onClearAllChats: () => void;
  onExportAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  memory,
  onUpdateMemory,
  profile,
  onUpdateProfile,
  onClearAllChats,
  onExportAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'memory' | 'voice' | 'privacy'>('general');
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [newFact, setNewFact] = useState('');

  // Editable memory fields
  const [userName, setUserName] = useState(memory.userName || profile.name);
  const [userLang, setUserLang] = useState(memory.userLanguage || 'hinglish');
  const [preferences, setPreferences] = useState(memory.preferences || '');
  const [customNotes, setCustomNotes] = useState(memory.customNotes || '');

  useEffect(() => {
    if (isOpen) {
      setVoices(getAvailableVoices());
      setUserName(memory.userName || profile.name);
      setUserLang(memory.userLanguage || 'hinglish');
      setPreferences(memory.preferences || '');
      setCustomNotes(memory.customNotes || '');
    }
  }, [isOpen, memory, profile]);

  if (!isOpen) return null;

  const handleSaveMemoryProfile = () => {
    onUpdateMemory({
      ...memory,
      userName,
      userLanguage: userLang,
      preferences,
      customNotes,
    });
    onUpdateProfile({
      ...profile,
      name: userName || 'User',
    });
    alert('Memory & Profile preferences saved successfully!');
  };

  const handleAddMemoryItem = () => {
    if (!newFact.trim()) return;
    const newItem: MemoryItem = {
      id: `mem-${Date.now()}`,
      fact: newFact.trim(),
      category: 'custom',
      createdAt: new Date().toLocaleDateString(),
    };
    onUpdateMemory({
      ...memory,
      items: [newItem, ...(memory.items || [])],
    });
    setNewFact('');
  };

  const handleDeleteMemoryItem = (id: string) => {
    onUpdateMemory({
      ...memory,
      items: (memory.items || []).filter((item) => item.id !== id),
    });
  };

  const handleClearAllMemory = () => {
    if (window.confirm('Kya aap Alpha AI ki saari saved memory delete karna chahte hain?')) {
      onUpdateMemory({
        userName: '',
        userLanguage: 'hinglish',
        preferences: '',
        customNotes: '',
        items: [],
      });
      setUserName('');
      setPreferences('');
      setCustomNotes('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 md:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Alpha AI Settings</h2>
              <p className="text-xs text-slate-400">Personalize memory, theme, voice, and system behavior</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>General & Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'memory'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>AI Memory & User</span>
            {memory.items?.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px]">
                {memory.items.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'voice'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Voice & Speech</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy & Storage</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: GENERAL & THEME */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Theme Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Appearance Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                      settings.theme === 'dark'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Moon className="w-5 h-5 mb-1.5" />
                    <span className="text-xs font-medium">Dark Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                      settings.theme === 'light'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Sun className="w-5 h-5 mb-1.5" />
                    <span className="text-xs font-medium">Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, theme: 'system' })}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                      settings.theme === 'system'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/10'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Monitor className="w-5 h-5 mb-1.5" />
                    <span className="text-xs font-medium">System Default</span>
                  </button>
                </div>
              </div>

              {/* Accent Color Palette */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Accent Color Palette
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'indigo', name: 'Indigo / Violet', bg: 'bg-indigo-600' },
                    { id: 'emerald', name: 'Emerald / Teal', bg: 'bg-emerald-500' },
                    { id: 'purple', name: 'Purple / Magenta', bg: 'bg-purple-600' },
                    { id: 'pink', name: 'Pink / Rose', bg: 'bg-pink-500' },
                    { id: 'amber', name: 'Amber / Orange', bg: 'bg-amber-500' },
                  ].map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, accentColor: color.id as any })}
                      className={`flex items-center gap-2 p-2 rounded-2xl border text-xs transition-all ${
                        (settings.accentColor || 'indigo') === color.id
                          ? 'border-indigo-400 bg-slate-800 text-white font-bold ring-2 ring-indigo-500/30'
                          : 'border-slate-700/60 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                      }`}
                      title={color.name}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${color.bg}`} />
                      <span className="hidden sm:inline text-[11px]">{color.name.split('/')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Preference */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>Default Language</span>
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => onUpdateSettings({ ...settings, language: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="hinglish">Hinglish (Hindi + English mix in Latin script)</option>
                  <option value="english">English (Standard English)</option>
                  <option value="hindi">Hindi (Pure Hindi)</option>
                </select>
              </div>

              {/* AI Personality */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  AI Personality Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'friendly', name: 'Friendly & Motivational', desc: 'Supportive buddy ("dost") tone' },
                    { id: 'academic', name: 'Academic & Exam Focus', desc: 'HSC Board structures & formulas' },
                    { id: 'expert-coder', name: 'Expert Developer', desc: 'Clean code & line-by-line logic' },
                    { id: 'concise', name: 'Concise & Direct', desc: 'Short, fast, no extra fluff' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, aiPersonality: p.id as any })}
                      className={`p-3 text-left rounded-2xl border transition-all ${
                        settings.aiPersonality === p.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-200">{p.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Web Search Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Enable Live Web Search Grounding by Default</p>
                  <p className="text-[11px] text-slate-400">Fetch real-time information with search citations</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.useWebSearchDefault}
                  onChange={(e) => onUpdateSettings({ ...settings, useWebSearchDefault: e.target.checked })}
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: AI MEMORY & USER PREFERENCES */}
          {activeTab === 'memory' && (
            <div className="space-y-5">
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-200">
                  <p className="font-bold mb-0.5">How Memory Works in Alpha AI</p>
                  <p className="text-[11px] text-purple-300">
                    Alpha AI remembers your name, study goals, preferred subjects, and personal instructions across all chat sessions for customized responses!
                  </p>
                </div>
              </div>

              {/* Memory Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Name (What Alpha AI calls you)
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Ansh Kumar"
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Study Goals / Stream
                  </label>
                  <input
                    type="text"
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="e.g. Maharashtra Class 12 Commerce student, React Web Developer"
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Custom AI Instructions / Notes
                  </label>
                  <textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="e.g. Always explain numerical steps clearly with formulas. Keep code blocks well-commented."
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveMemoryProfile}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-2xl shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Memory Preferences</span>
                </button>
              </div>

              {/* Individual Memory Facts */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-200">Custom Memory Facts</h3>
                  {memory.items?.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllMemory}
                      className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All Memory</span>
                    </button>
                  )}
                </div>

                {/* Add new memory fact */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newFact}
                    onChange={(e) => setNewFact(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMemoryItem()}
                    placeholder="Add a new fact (e.g. 'Preparing for HSC board exams in March')"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddMemoryItem}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Memory facts list */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {memory.items && memory.items.length > 0 ? (
                    memory.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-200"
                      >
                        <span className="flex-1 mr-2">{item.fact}</span>
                        <button
                          onClick={() => handleDeleteMemoryItem(item.id)}
                          className="text-slate-400 hover:text-red-400 p-1"
                          title="Delete fact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic p-2 bg-slate-950/40 rounded-xl text-center">
                      Koi custom memory fact nahi hai abhi.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VOICE & SPEECH */}
          {activeTab === 'voice' && (
            <div className="space-y-5">
              {/* Voice Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Text-to-Speech Voice
                </label>
                <select
                  value={settings.voiceName || ''}
                  onChange={(e) => onUpdateSettings({ ...settings, voiceName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Default System Voice (Auto-detect Hindi/English)</option>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speech Rate Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">Speech Rate / Speed</label>
                  <span className="text-xs font-bold text-emerald-400">{settings.speechRate || 1.0}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.1"
                  value={settings.speechRate || 1.0}
                  onChange={(e) => onUpdateSettings({ ...settings, speechRate: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Auto Read Responses Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Auto-read AI Responses</p>
                  <p className="text-[11px] text-slate-400">Automatically speak out assistant replies when received</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoReadResponses}
                  onChange={(e) => onUpdateSettings({ ...settings, autoReadResponses: e.target.checked })}
                  className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Hands free auto send toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Hands-free Voice Input Auto-Send</p>
                  <p className="text-[11px] text-slate-400">Automatically submit question when mic stops</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSendVoice}
                  onChange={(e) => onUpdateSettings({ ...settings, autoSendVoice: e.target.checked })}
                  className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY & STORAGE */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Export All Alpha AI Data</p>
                  <p className="text-[11px] text-slate-400">Download chats, memory, and settings as JSON</p>
                </div>
                <button
                  type="button"
                  onClick={onExportAllData}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-red-300">Clear All Chat Conversations</p>
                  <p className="text-[11px] text-red-400/80">Irreversibly delete all saved chat sessions</p>
                </div>
                <button
                  type="button"
                  onClick={onClearAllChats}
                  className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Chats</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
