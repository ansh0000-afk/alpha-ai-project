// Text-to-Speech Utility for Alpha AI

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function getAvailableVoices(): VoiceOption[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  return voices.map((v) => ({
    voice: v,
    name: v.name,
    lang: v.lang,
  }));
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function speakText(
  text: string,
  options?: {
    voiceName?: string;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Interrupt any ongoing speech
  stopSpeech();

  // Strip markdown formatting symbols for clean natural reading
  const cleanText = text
    .replace(/```[\s\S]*?```/g, 'Code block skipped.') // Skip code blocks in speech
    .replace(/[#*`_~>[\]()]/g, '')
    .replace(/\n+/g, '. ')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = options?.rate || 1.0;
  utterance.pitch = options?.pitch || 1.0;

  const voices = window.speechSynthesis.getVoices();
  if (options?.voiceName) {
    const selected = voices.find((v) => v.name === options.voiceName);
    if (selected) {
      utterance.voice = selected;
    }
  } else {
    // Prefer Indian English / Hindi / Natural voices
    const preferredVoice = voices.find(
      (v) =>
        v.lang.includes('hi-IN') ||
        v.lang.includes('en-IN') ||
        v.name.includes('Google') ||
        v.name.includes('Natural')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
  }

  utterance.onstart = () => {
    if (options?.onStart) options.onStart();
  };

  utterance.onend = () => {
    activeUtterance = null;
    if (options?.onEnd) options.onEnd();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    if (options?.onError) options.onError(e);
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  return window.speechSynthesis.speaking;
}
