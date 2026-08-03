import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ModeSelector } from './components/ModeSelector';
import { QuickPrompts } from './components/QuickPrompts';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { StudyPlanModal } from './components/StudyPlanModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { ChatHistoryDrawer } from './components/ChatHistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ChatMessage, ModeType, ChatSession, UserMemory, UserSettings, UserProfile } from './types';
import { Bot, Sparkles } from 'lucide-react';
import { speakText } from './lib/speechSynthesis';
import { initCapacitor, registerBackButtonHandler, triggerHaptic } from './lib/capacitor';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  sender: 'anshu',
  text: `### Namaste! Main Alpha AI hoon 🙏
*Aapka intelligent, fast, friendly, aur creative personal AI assistant.*  
✨ **"Think Smart. Build Smart. Achieve More."** — *Powered by Alpha AI*

---
#### 🚀 Main in sabhi domains me aapki step-by-step help kar sakta hoon:

1. **📚 Study & Exam Assistant (Special HSC Class 12 Focus):**
   - **Accounts (BK) & Maths**: Step-by-step numerical solving, Partnership Final Accounts, Journal Entries, Integration, Matrices, LPP.
   - **Economics, OCM, SP & English**: 8-mark/4-mark structured answers, distinction tables, key concepts & paper presentation tips.

2. **💻 Coding, Website & Mobile App Builder:**
   - Web & Mobile (HTML, CSS, JS, React, Node.js, Python, Flutter, C++, Java, Git).
   - Website design, Android/iOS app guide, bug fixing, and clean code explanation.

3. **🎥 YouTube, Content Writing & Social Media:**
   - Viral titles, video script hooks, full Hinglish scripts, SEO descriptions, hashtags, thumbnail ideas & social strategy.

4. **📝 Resumes, Documents & Writing:**
   - Professional emails, cover letters, resume building, interview coaching, essay writing, and document/PDF summaries.

5. **🖼️ Multimodal Photo & Notes Analyzer:**
   - Attach photos of study notes, textbook problems, handwritten questions, or code screenshots for instant step-by-step solutions.

6. **📅 Productivity, Daily Planning & Career Advice:**
   - Daily timetables, study schedules, career guidance, interview prep, travel planning, and business advice.

---
💡 **Standard Response Format:**  
*Short answer ➔ Detailed explanation ➔ Step-by-step solution ➔ Examples ➔ Pro tips ➔ Summary*

**Niche mode select karein ya direct koi bhi question pucho dost! Main Alpha AI ready hoon.**`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  mode: 'general',
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  language: 'hinglish',
  speechRate: 1.0,
  autoReadResponses: false,
  useWebSearchDefault: false,
  autoSendVoice: false,
  aiPersonality: 'friendly',
};

const DEFAULT_MEMORY: UserMemory = {
  userName: 'Ansh',
  userLanguage: 'hinglish',
  preferences: 'Maharashtra HSC Class 12 Commerce & Coding student',
  customNotes: 'Prefer step-by-step explanations with formulas and clean code blocks.',
  items: [
    {
      id: 'm1',
      fact: 'Preparing for Maharashtra HSC Class 12 Commerce board exams',
      category: 'study',
      createdAt: '2026-08-03',
    },
    {
      id: 'm2',
      fact: 'Interested in Web Development (React, Node.js, Tailwind CSS)',
      category: 'preference',
      createdAt: '2026-08-03',
    },
  ],
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest-1',
  isGuest: true,
  name: 'Ansh Kumar',
  email: 'ansh.kumar@gmail.com',
  avatar: '',
  createdAt: 'August 2026',
};

export default function App() {
  // Saved Chat Sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('alpha_ai_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Session load error:', e);
      }
    }
    const initSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'Welcome to Alpha AI',
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
      messages: [INITIAL_WELCOME_MESSAGE],
    };
    return [initSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const savedId = localStorage.getItem('alpha_ai_active_session_id');
    if (savedId && sessions.some((s) => s.id === savedId)) return savedId;
    return sessions[0]?.id || `session-${Date.now()}`;
  });

  // Settings, Memory, Profile
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('alpha_ai_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_SETTINGS;
  });

  const [memory, setMemory] = useState<UserMemory>(() => {
    const saved = localStorage.getItem('alpha_ai_memory');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_MEMORY;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('alpha_ai_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_PROFILE;
  });

  // UI state
  const [currentMode, setCurrentMode] = useState<ModeType>('general');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals & Drawers
  const [isPlannerOpen, setIsPlannerOpen] = useState<boolean>(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active Session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [INITIAL_WELCOME_MESSAGE];

  // Initialize Capacitor Native Features
  useEffect(() => {
    initCapacitor();
  }, []);

  // Handle Android Native Back Button
  useEffect(() => {
    const unbind = registerBackButtonHandler(() => {
      if (isPlannerOpen) { setIsPlannerOpen(false); return true; }
      if (isBookmarksOpen) { setIsBookmarksOpen(false); return true; }
      if (isHistoryOpen) { setIsHistoryOpen(false); return true; }
      if (isSettingsOpen) { setIsSettingsOpen(false); return true; }
      if (isProfileOpen) { setIsProfileOpen(false); return true; }
      return false;
    });
    return () => unbind();
  }, [isPlannerOpen, isBookmarksOpen, isHistoryOpen, isSettingsOpen, isProfileOpen]);

  // Apply Theme on html
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      // System default
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    localStorage.setItem('alpha_ai_settings', JSON.stringify(settings));
  }, [settings]);

  // Persist State
  useEffect(() => {
    localStorage.setItem('alpha_ai_sessions', JSON.stringify(sessions));
    localStorage.setItem('alpha_ai_active_session_id', activeSessionId);
  }, [sessions, activeSessionId]);

  useEffect(() => {
    localStorage.setItem('alpha_ai_memory', JSON.stringify(memory));
  }, [memory]);

  useEffect(() => {
    localStorage.setItem('alpha_ai_profile', JSON.stringify(profile));
  }, [profile]);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Send Message
  const handleSendMessage = async (
    text: string,
    image?: string,
    options?: { useWebSearch?: boolean; documentText?: string; documentName?: string }
  ) => {
    if (!text.trim() && !image && !options?.documentText) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      image,
      documentText: options?.documentText,
      documentName: options?.documentName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: currentMode,
    };

    // Update active session messages & auto-update session title if new
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === activeSessionId) {
          const updatedMsgs = [...session.messages, userMsg];
          const newTitle =
            session.messages.length <= 1 && text.trim()
              ? text.slice(0, 32) + (text.length > 32 ? '...' : '')
              : session.title;

          return {
            ...session,
            title: newTitle,
            updatedAt: new Date().toLocaleDateString(),
            messages: updatedMsgs,
          };
        }
        return session;
      })
    );

    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.filter((m) => m.id !== 'welcome-1'),
          mode: currentMode,
          image,
          useWebSearch: options?.useWebSearch ?? settings.useWebSearchDefault,
          userMemory: memory,
          documentText: options?.documentText,
          documentName: options?.documentName,
        }),
      });

      const data = await res.json();

      const replyText = data.reply || 'Maaf karna dost, response generate hone me issue hua.';

      const anshuReply: ChatMessage = {
        id: `anshu-${Date.now()}`,
        sender: 'anshu',
        text: replyText,
        sources: data.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: currentMode,
      };

      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages, anshuReply],
            };
          }
          return session;
        })
      );

      // Auto Read if enabled in settings
      if (settings.autoReadResponses) {
        speakText(replyText, {
          voiceName: settings.voiceName,
          rate: settings.speechRate,
        });
      }
    } catch (error) {
      console.error('Alpha AI Chat Error:', error);
      const errorMsg: ChatMessage = {
        id: `anshu-err-${Date.now()}`,
        sender: 'anshu',
        text: 'Dost! Gemini API key ya connection check karein. Main help ke liye taiyaar hoon!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: currentMode,
      };
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === activeSessionId
            ? { ...session, messages: [...session.messages, errorMsg] }
            : session
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Sessions CRUD
  const handleCreateNewSession = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
      messages: [INITIAL_WELCOME_MESSAGE],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      handleCreateNewSession();
      return;
    }
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0].id);
    }
  };

  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleExportSession = (session: ChatSession, format: 'txt' | 'json' | 'pdf') => {
    let fileName = `${session.title.replace(/[^a-z0-9]/gi, '_')}`;

    if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Pop-up blocked! Allow pop-ups to print or save chat as PDF.');
        return;
      }
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${session.title} - Alpha AI Chat Export</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            .meta { font-size: 12px; color: #64748b; margin-bottom: 30px; }
            .msg { margin-bottom: 20px; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .user { background: #f8fafc; border-left: 4px solid #6366f1; }
            .anshu { background: #f0fdf4; border-left: 4px solid #10b981; }
            .sender { font-weight: bold; font-size: 13px; margin-bottom: 5px; color: #334155; }
            .time { font-size: 11px; color: #94a3b8; margin-left: 10px; font-weight: normal; }
            .text { font-size: 14px; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>Alpha AI - ${session.title}</h1>
          <div class="meta">Export Date: ${new Date().toLocaleDateString()} | Total Messages: ${session.messages.length}</div>
          ${session.messages
            .map(
              (m) => `
            <div class="msg ${m.sender === 'user' ? 'user' : 'anshu'}">
              <div class="sender">${m.sender === 'user' ? 'USER' : 'ALPHA AI'} <span class="time">${m.timestamp}</span></div>
              <div class="text">${m.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
          `
            )
            .join('')}
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      return;
    }

    let content = '';
    if (format === 'json') {
      content = JSON.stringify(session, null, 2);
    } else {
      content = `--- ${session.title} ---\nDate: ${session.createdAt}\n\n`;
      session.messages.forEach((m) => {
        content += `[${m.timestamp}] ${m.sender === 'user' ? 'USER' : 'ALPHA AI'}:\n${m.text}\n\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllChats = () => {
    const initSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
      messages: [INITIAL_WELCOME_MESSAGE],
    };
    setSessions([initSession]);
    setActiveSessionId(initSession.id);
    setIsSettingsOpen(false);
  };

  const handleExportAllData = () => {
    const data = {
      sessions,
      memory,
      settings,
      profile,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alpha_ai_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Bookmark Toggle
  const handleBookmarkToggle = (msgId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === msgId ? { ...m, isBookmarked: !m.isBookmarked } : m
            ),
          };
        }
        return s;
      })
    );
  };

  // Feedback Toggle
  const handleFeedback = (msgId: string, type: 'like' | 'dislike') => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === msgId ? { ...m, feedback: m.feedback === type ? null : type } : m
            ),
          };
        }
        return s;
      })
    );
  };

  // Regenerate Response
  const handleRegenerate = (msgId: string) => {
    const msgIndex = messages.findIndex((m) => m.id === msgId);
    if (msgIndex > 0) {
      const prevUserMsg = messages[msgIndex - 1];
      if (prevUserMsg && prevUserMsg.sender === 'user') {
        handleSendMessage(prevUserMsg.text, prevUserMsg.image);
      }
    }
  };

  // Bookmarked messages across all sessions
  const allBookmarkedMessages = sessions
    .flatMap((s) => s.messages)
    .filter((m) => m.isBookmarked);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onOpenPlanner={() => setIsPlannerOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onClearChat={handleCreateNewSession}
        bookmarkCount={allBookmarkedMessages.length}
        sessionCount={sessions.length}
        profile={profile}
        settings={settings}
        memory={memory}
        onToggleTheme={() =>
          setSettings((prev) => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark',
          }))
        }
      />

      {/* Mode Selector */}
      <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />

      {/* Main Chat View */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-4 flex flex-col justify-between">
        {/* Messages List */}
        <div className="flex-1 space-y-4 pb-6">
          {messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onBookmarkToggle={handleBookmarkToggle}
              onFeedback={handleFeedback}
              onRegenerate={handleRegenerate}
              onEditPrompt={(text) => handleSendMessage(text)}
            />
          ))}

          {/* Loading Animation Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 w-fit animate-pulse shadow-xl">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 flex items-center justify-center text-indigo-400">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-xs font-semibold text-indigo-300">
                Alpha AI is generating a structured, step-by-step response...
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Prompts */}
        <QuickPrompts currentMode={currentMode} onSelectPrompt={(p) => handleSendMessage(p)} />
      </main>

      {/* Chat Input Bar */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        currentMode={currentMode}
        defaultWebSearch={settings.useWebSearchDefault}
      />

      {/* Class 12 Study Plan Modal */}
      <StudyPlanModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        onPlanGenerated={(planText) => {
          handleSendMessage(`Mere liye yeh Maharashtra Class 12 HSC Study Schedule explain aur refine karo:\n\n${planText}`);
        }}
      />

      {/* Saved Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedMessages={allBookmarkedMessages}
        onRemoveBookmark={handleBookmarkToggle}
      />

      {/* Chat History Drawer */}
      <ChatHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onCreateNewSession={handleCreateNewSession}
        onDeleteSession={handleDeleteSession}
        onTogglePinSession={handleTogglePinSession}
        onRenameSession={handleRenameSession}
        onExportSession={handleExportSession}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        memory={memory}
        onUpdateMemory={setMemory}
        profile={profile}
        onUpdateProfile={setProfile}
        onClearAllChats={handleClearAllChats}
        onExportAllData={handleExportAllData}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onUpdateProfile={setProfile}
      />
    </div>
  );
}
