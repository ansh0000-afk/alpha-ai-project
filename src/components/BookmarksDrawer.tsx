import React, { useState } from 'react';
import { X, Bookmark, Copy, Check, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../types';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedMessages: ChatMessage[];
  onRemoveBookmark: (id: string) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarkedMessages,
  onRemoveBookmark,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col p-4 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-pink-400" />
            <h2 className="text-base font-bold text-slate-100">Saved Notes & Answers</h2>
            <span className="text-xs bg-pink-500/20 text-pink-300 font-bold px-2 py-0.5 rounded-full border border-pink-500/30">
              {bookmarkedMessages.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of saved notes */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {bookmarkedMessages.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <Bookmark className="w-12 h-12 mx-auto text-slate-700 stroke-1" />
              <p className="text-sm font-medium">Koi saved note nahi hai abhi.</p>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Chat me Alpha AI ke kisi bhi answer ke niche "Save Note" par click karke formulas ya code snippets save kar sakte ho!
              </p>
            </div>
          ) : (
            bookmarkedMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2 relative group hover:border-pink-500/40 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-pink-400">{msg.timestamp}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Copy"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onRemoveBookmark(msg.id)}
                      className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="prose prose-invert prose-xs max-w-none text-slate-300 max-h-48 overflow-y-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
