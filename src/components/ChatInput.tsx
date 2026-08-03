import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, MicOff, X, Loader2, Globe, Radio, Sparkles, Check, FileText, Camera, Search, HelpCircle } from 'lucide-react';
import { ModeType } from '../types';
import { extractTextFromFile } from '../lib/pdfParser';

interface ChatInputProps {
  onSendMessage: (
    text: string,
    image?: string,
    options?: { useWebSearch?: boolean; documentText?: string; documentName?: string }
  ) => void;
  isLoading: boolean;
  currentMode: ModeType;
  defaultWebSearch?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  currentMode,
  defaultWebSearch = false,
}) => {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documentText, setDocumentText] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [useWebSearch, setUseWebSearch] = useState(defaultWebSearch);

  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'hi-IN' | 'en-IN' | 'en-US'>('hi-IN');
  const [autoSendOnStop, setAutoSendOnStop] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  useEffect(() => {
    setUseWebSearch(defaultWebSearch);
  }, [defaultWebSearch]);

  const handleSubmit = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const sendText = customText !== undefined ? customText : text;

    if ((!sendText.trim() && !imagePreview && !documentText) || isLoading) return;

    if (isListening) {
      stopListening();
    }

    onSendMessage(sendText, imagePreview || undefined, {
      useWebSearch,
      documentText: documentText || undefined,
      documentName: documentName || undefined,
    });

    setText('');
    setImagePreview(null);
    setDocumentText(null);
    setDocumentName(null);
    setVoiceStatus('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Image size 8MB se choti honi chahiye dost.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { text: extracted, name } = await extractTextFromFile(file);
        setDocumentText(extracted);
        setDocumentName(name);
      } catch (err) {
        alert('Document file read karne me issue hua.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Speech stop error:', err);
      }
    }
    setIsListening(false);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Aapke browser me Web Speech API supported nahi hai. Chrome ya Edge browser try karein.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      let finalTranscriptAccumulator = text ? text + ' ' : '';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('Listening... Aap bolo, text yahan type ho raha hai');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += transcriptChunk + ' ';
          } else {
            currentInterim += transcriptChunk;
          }
        }

        if (currentFinal) {
          finalTranscriptAccumulator += currentFinal;
        }

        const combinedText = (finalTranscriptAccumulator + currentInterim).trim();
        setText(combinedText);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone permission enable karein voice input ke liye.');
        } else if (event.error === 'no-speech') {
          setVoiceStatus('Aawaz nahi aayi, phir se boliyen...');
        } else {
          setVoiceStatus(`Voice error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceStatus('');
        if (autoSendOnStop && finalTranscriptAccumulator.trim()) {
          setTimeout(() => {
            handleSubmit();
          }, 300);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech start exception:', err);
      setIsListening(false);
    }
  };

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="sticky bottom-0 z-20 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-3 md:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Active Voice Listening Banner */}
        {isListening && (
          <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-red-950/80 via-purple-950/80 to-indigo-950/80 border border-red-500/40 shadow-xl flex items-center justify-between text-xs text-slate-100 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white animate-pulse">
                <Radio className="w-4 h-4 animate-spin" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
              </div>
              <div>
                <p className="font-bold text-red-300 flex items-center gap-1">
                  <span>🎙️ Voice Input Active</span>
                  <span className="text-[10px] bg-red-500/30 px-1.5 py-0.5 rounded text-red-200 uppercase">
                    {voiceLang === 'hi-IN' ? 'Hinglish/Hindi' : voiceLang === 'en-IN' ? 'Indian English' : 'US English'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-300">{voiceStatus || 'Bolo dost... Web Speech API voice capture kar raha hai'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={stopListening}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors"
              >
                Stop Mic
              </button>
              {text.trim() && (
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold flex items-center gap-1 shadow-md"
                >
                  <span>Send</span>
                  <Send className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Attachment Previews */}
        <div className="flex flex-wrap gap-2 mb-2">
          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Attachment preview"
                className="w-16 h-16 object-cover rounded-xl border border-slate-700 shadow-md"
              />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow transition-transform transform active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {documentName && (
            <div className="relative inline-flex items-center gap-2 px-3 py-2 bg-slate-800 border border-indigo-500/50 rounded-xl text-xs text-indigo-200 shadow-md">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold max-w-[180px] truncate">{documentName}</span>
              <button
                onClick={() => {
                  setDocumentText(null);
                  setDocumentName(null);
                }}
                className="p-0.5 hover:text-red-400 text-slate-400 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Action Pills if PDF or Image attached */}
        {(documentName || imagePreview) && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            <button
              type="button"
              onClick={() => handleSubmit(undefined, 'Iss document/photo ka complete summary aur key takeaways batao.')}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 font-medium"
            >
              📝 Summarize Document
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(undefined, 'Iss document/photo se sabse important exam/study revision points nikal ke do.')}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 font-medium"
            >
              🎯 Extract Key Revision Notes
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(undefined, 'Iss photo/document me diye gaye question ko step-by-step detail me solve karke samjhao.')}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 font-medium"
            >
              💡 Solve Questions Step-by-Step
            </button>
          </div>
        )}

        {/* Form Input Box */}
        <form onSubmit={(e) => handleSubmit(e)} className="relative bg-slate-800/90 border border-slate-700/80 rounded-2xl p-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-xl">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentMode === 'mh-board'
                ? 'Accounts, Maths, Eco, OCM, SP, English, IT, या kisi bhi Maharashtra HSC topic par pucho...'
                : currentMode === 'coding'
                ? 'HTML/CSS, JS, React, Python, Flutter, Android code ya bug fixes pucho...'
                : currentMode === 'youtube'
                ? 'YouTube titles, viral scripts, hashtags, SEO description generator...'
                : currentMode === 'tasks'
                ? 'Study schedule, timetable, resume writing, email drafting...'
                : 'Alpha AI se kuch bhi pucho Hinglish me...'
            }
            rows={2}
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm p-2 resize-none focus:outline-none max-h-32 min-h-[50px]"
          />

          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-700/50 px-2 gap-2">
            {/* Left Controls: File, Camera, PDF, Web Search, Voice */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Image upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60 transition-colors"
                title="Photo/Screenshot attach karo"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              {/* Camera Capture for mobile/Android */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60 transition-colors"
                title="Camera se photo click karo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleImageChange}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              {/* PDF & Document upload */}
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60 transition-colors"
                title="PDF, TXT, ya Document attach karo"
              >
                <FileText className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={docInputRef}
                onChange={handleDocChange}
                accept=".pdf,.txt,.md,.csv,.json,.js,.py"
                className="hidden"
              />

              {/* Web Search Toggle */}
              <button
                type="button"
                onClick={() => setUseWebSearch(!useWebSearch)}
                className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl border transition-colors ${
                  useWebSearch
                    ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-md shadow-blue-500/10'
                    : 'bg-slate-900/40 text-slate-400 border-slate-700/50 hover:text-slate-300'
                }`}
                title="Google Real-Time Web Search enable/disable"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Web Search</span>
                {useWebSearch && <Check className="w-3 h-3 text-blue-300" />}
              </button>

              {/* Mic Voice Button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                disabled={!speechSupported}
                className={`p-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  isListening
                    ? 'bg-red-500/30 text-red-300 border border-red-500/50 shadow-lg shadow-red-500/20 animate-pulse'
                    : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60'
                }`}
                title={speechSupported ? 'Voice Input (Web Speech API)' : 'Speech Recognition Not Supported'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span className="text-xs font-semibold hidden md:inline">
                  {isListening ? 'Stop' : 'Voice'}
                </span>
              </button>

              {/* Voice Language Selector */}
              <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-700/60 rounded-xl px-2 py-1 text-[11px] text-slate-300">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <select
                  value={voiceLang}
                  onChange={(e) => setVoiceLang(e.target.value as any)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
                  title="Voice Language"
                >
                  <option value="hi-IN" className="bg-slate-800 text-slate-100">Hinglish / Hindi</option>
                  <option value="en-IN" className="bg-slate-800 text-slate-100">English (India)</option>
                  <option value="en-US" className="bg-slate-800 text-slate-100">English (US)</option>
                </select>
              </div>
            </div>

            {/* Right: Send button */}
            <button
              type="submit"
              disabled={(!text.trim() && !imagePreview && !documentText) || isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-95 ml-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
