import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, Bookmark, Volume2, VolumeX, Sparkles, ExternalLink, ThumbsUp, ThumbsDown, FileText, RotateCcw, Edit2, Share2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { speakText, stopSpeech, isSpeaking as checkIsSpeaking } from '../lib/speechSynthesis';

interface ChatMessageItemProps {
  message: ChatMessage;
  onBookmarkToggle?: (messageId: string) => void;
  onFeedback?: (messageId: string, type: 'like' | 'dislike') => void;
  onRegenerate?: (messageId: string) => void;
  onEditPrompt?: (text: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onBookmarkToggle,
  onFeedback,
  onRegenerate,
  onEditPrompt,
}) => {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const isAnshu = message.sender === 'anshu';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speakText(message.text, {
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Alpha AI Response',
        text: message.text,
      }).catch((err) => console.log('Share error:', err));
    } else {
      handleCopy();
      alert('Copied response to clipboard!');
    }
  };

  // Custom renderer for Markdown code blocks with copy button
  const renderers = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      if (!inline) {
        return (
          <div className="relative group my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-lg">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
              <span>{match ? match[1] : 'code'}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(codeString);
                  setCopiedCodeIndex(1);
                  setTimeout(() => setCopiedCodeIndex(null), 2000);
                }}
                className="flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
              >
                {copiedCodeIndex === 1 ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-xs overflow-x-auto text-indigo-100 font-mono leading-relaxed">
              <code>{children}</code>
            </pre>
          </div>
        );
      }
      return (
        <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[12px]" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div
      className={`flex gap-3 my-4 p-4 rounded-2xl transition-all ${
        isAnshu
          ? 'bg-slate-900/80 border border-slate-800 text-slate-100 shadow-md'
          : 'bg-indigo-950/40 border border-indigo-900/50 text-indigo-100 ml-auto max-w-3xl'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isAnshu ? (
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-indigo-500/40 p-0.5 overflow-hidden shadow-md flex items-center justify-center">
            <img src="/logo.png" alt="Alpha AI" className="w-full h-full object-cover rounded-lg" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200">
            <User className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header info */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              {isAnshu ? 'Alpha AI' : 'Aap'}
            </span>
            {isAnshu && (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Intelligent AI
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500">{message.timestamp}</span>
        </div>

        {/* Uploaded Document Attachment chip */}
        {message.documentName && (
          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-indigo-300">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold">{message.documentName}</span>
          </div>
        )}

        {/* Uploaded image if present */}
        {message.image && (
          <div className="mb-3 max-w-md rounded-xl overflow-hidden border border-slate-700 shadow-lg">
            <img src={message.image} alt="User attachment" className="w-full h-auto object-cover" />
          </div>
        )}

        {/* Text Markdown */}
        <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed font-sans">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers}>
            {message.text}
          </ReactMarkdown>
        </div>

        {/* Web Search Sources Grounding Section */}
        {isAnshu && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Web Sources & Grounding Links:</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800/60 text-indigo-300 transition-colors"
                >
                  <span className="truncate max-w-[180px]">{src.title}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 text-indigo-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action Toolbar for AI responses */}
        {isAnshu ? (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-800/80 text-slate-400">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs hover:text-slate-200 px-2 py-1 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
              title="Copy Response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* TTS Speech Listen */}
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-xl transition-colors ${
                speaking
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 animate-pulse'
                  : 'bg-slate-800/50 hover:bg-slate-800 hover:text-slate-200 text-slate-400'
              }`}
              title="Listen to Speech"
            >
              {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{speaking ? 'Stop Speech' : 'Listen'}</span>
            </button>

            {/* Bookmark */}
            {onBookmarkToggle && (
              <button
                onClick={() => onBookmarkToggle(message.id)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-xl transition-colors ${
                  message.isBookmarked
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                    : 'bg-slate-800/50 hover:bg-slate-800 hover:text-slate-200 text-slate-400'
                }`}
                title="Save Note"
              >
                <Bookmark className={`w-3.5 h-3.5 ${message.isBookmarked ? 'fill-pink-400 text-pink-400' : ''}`} />
                <span>{message.isBookmarked ? 'Saved' : 'Save Note'}</span>
              </button>
            )}

            {/* Like/Dislike feedback */}
            {onFeedback && (
              <div className="flex items-center gap-1 bg-slate-800/40 rounded-xl px-1">
                <button
                  onClick={() => onFeedback(message.id, 'like')}
                  className={`p-1 rounded hover:text-emerald-400 ${
                    message.feedback === 'like' ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                  title="Like"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onFeedback(message.id, 'dislike')}
                  className={`p-1 rounded hover:text-red-400 ${
                    message.feedback === 'dislike' ? 'text-red-400' : 'text-slate-500'
                  }`}
                  title="Dislike"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Regenerate Response */}
            {onRegenerate && (
              <button
                onClick={() => onRegenerate(message.id)}
                className="flex items-center gap-1 text-xs hover:text-indigo-300 px-2 py-1 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors ml-auto"
                title="Regenerate AI Answer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}

            {/* Share button */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
              title="Share Response"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* User Message Actions */
          onEditPrompt && (
            <div className="flex items-center justify-end mt-2 text-slate-400">
              <button
                onClick={() => onEditPrompt(message.text)}
                className="flex items-center gap-1 text-[11px] hover:text-indigo-300 px-2 py-0.5 rounded bg-slate-900/50 hover:bg-slate-900 transition-colors"
                title="Edit this prompt"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Prompt</span>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};
