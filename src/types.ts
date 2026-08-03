export type ModeType = 'general' | 'mh-board' | 'coding' | 'youtube' | 'website' | 'tasks';

export interface ChatSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'anshu';
  text: string;
  timestamp: string;
  image?: string; // Base64 data URL
  documentText?: string;
  documentName?: string;
  mode?: ModeType;
  isBookmarked?: boolean;
  sources?: ChatSource[];
  feedback?: 'like' | 'dislike' | null;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  isPinned?: boolean;
}

export interface MemoryItem {
  id: string;
  fact: string;
  category?: 'preference' | 'name' | 'language' | 'study' | 'custom';
  createdAt: string;
}

export interface UserMemory {
  userName: string;
  userLanguage: 'hinglish' | 'english' | 'hindi';
  preferences: string;
  customNotes: string;
  items: MemoryItem[];
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor?: 'indigo' | 'emerald' | 'purple' | 'pink' | 'amber';
  language: 'hinglish' | 'english' | 'hindi';
  voiceName?: string;
  speechRate: number;
  autoReadResponses: boolean;
  useWebSearchDefault: boolean;
  autoSendVoice: boolean;
  aiPersonality: 'friendly' | 'academic' | 'expert-coder' | 'concise';
}

export interface UserProfile {
  id: string;
  isGuest: boolean;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
}

export interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface QuickPrompt {
  id: string;
  title: string;
  prompt: string;
  mode: ModeType;
  icon: string;
}
