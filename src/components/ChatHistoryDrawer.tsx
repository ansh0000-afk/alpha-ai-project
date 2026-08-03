import React, { useState } from 'react';
import { X, MessageSquare, Plus, Search, Pin, Trash2, Edit2, Check, Download, FileText, Sparkles, ChevronRight } from 'lucide-react';
import { ChatSession } from '../types';

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onExportSession: (session: ChatSession, format: 'txt' | 'json' | 'pdf') => void;
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateNewSession,
  onDeleteSession,
  onTogglePinSession,
  onRenameSession,
  onExportSession,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const regularSessions = filteredSessions.filter((s) => !s.isPinned);

  const startRename = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-start animate-fadeIn">
      <div className="bg-slate-900 border-r border-slate-800 text-slate-100 w-full max-w-sm h-full flex flex-col shadow-2xl animate-slideRight">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-100">Chat History & Sessions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onCreateNewSession();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past conversations..."
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-4">
          {/* Pinned Sessions */}
          {pinnedSessions.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1 px-2 flex items-center gap-1">
                <Pin className="w-3 h-3" />
                <span>Pinned Chats</span>
              </p>
              <div className="space-y-1">
                {pinnedSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    editingId={editingId}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelect={() => {
                      onSelectSession(session.id);
                      onClose();
                    }}
                    onStartRename={startRename}
                    onSaveRename={saveRename}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      onTogglePinSession(session.id);
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    onExportSession={onExportSession}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Sessions */}
          <div>
            {pinnedSessions.length > 0 && (
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-2">
                Recent Conversations
              </p>
            )}

            <div className="space-y-1">
              {regularSessions.length > 0 ? (
                regularSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    editingId={editingId}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSelect={() => {
                      onSelectSession(session.id);
                      onClose();
                    }}
                    onStartRename={startRename}
                    onSaveRename={saveRename}
                    onTogglePin={(e) => {
                      e.stopPropagation();
                      onTogglePinSession(session.id);
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    onExportSession={onExportSession}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-500 italic p-3 text-center">
                  {searchQuery ? 'No chats found matching search' : 'No previous chat history'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-center text-[11px] text-slate-500">
          Alpha AI Auto-Saves Conversations
        </div>
      </div>
    </div>
  );
};

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  editingId: string | null;
  editTitle: string;
  setEditTitle: (t: string) => void;
  onSelect: () => void;
  onStartRename: (s: ChatSession, e: React.MouseEvent) => void;
  onSaveRename: (id: string, e: React.FormEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onExportSession: (session: ChatSession, format: 'txt' | 'json' | 'pdf') => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  editingId,
  editTitle,
  setEditTitle,
  onSelect,
  onStartRename,
  onSaveRename,
  onTogglePin,
  onDelete,
  onExportSession,
}) => {
  const isEditing = editingId === session.id;

  return (
    <div
      onClick={onSelect}
      className={`group relative p-2.5 rounded-2xl cursor-pointer transition-all border ${
        isActive
          ? 'bg-indigo-600/20 border-indigo-500/80 text-slate-100 shadow-md'
          : 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
          {isEditing ? (
            <form onSubmit={(e) => onSaveRename(session.id, e)} className="flex-1 mr-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
                className="w-full bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
              />
            </form>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate leading-tight">{session.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {session.messages.length} messages • {session.updatedAt || session.createdAt}
              </p>
            </div>
          )}
        </div>

        {/* Action icons on hover or active */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onTogglePin}
            className={`p-1 rounded hover:bg-slate-700/80 ${session.isPinned ? 'text-indigo-400' : 'text-slate-500'}`}
            title={session.isPinned ? 'Unpin' : 'Pin chat'}
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => onStartRename(session, e)}
            className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-700/80"
            title="Rename chat"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExportSession(session, 'pdf');
            }}
            className="p-1 rounded text-slate-500 hover:text-emerald-300 hover:bg-slate-700/80"
            title="Export / Print PDF"
          >
            <FileText className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExportSession(session, 'txt');
            }}
            className="p-1 rounded text-slate-500 hover:text-indigo-300 hover:bg-slate-700/80"
            title="Export TXT"
          >
            <Download className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-700/80"
            title="Delete chat"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
