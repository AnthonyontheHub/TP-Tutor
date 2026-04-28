import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProposedChange } from '../services/linaService';
import type { MasteryStatus } from '../types/mastery';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  displayContent: string;
  raw?: string;
  proposedChanges?: ProposedChange[];
}

export interface ChatSessionData {
  id: string;
  title: string;
  isMinimized: boolean;
  pendingPrompt: string | null;
  messages: ChatMessage[];
  history: { role: 'user' | 'assistant'; content: string }[];
  sessionDeltas: ProposedChange[];
  context: 'GENERAL' | 'DAILY_REVIEW' | 'GRAMMAR_CHECK' | 'LESSON' | 'PHRASE_PRACTICE' | 'VOCAB_PANEL' | 'MASTERY_COURT';
  vibe?: string;
  contextPayload?: string;
}

interface ChatState {
  sessions: ChatSessionData[];
}

interface ChatActions {
  addSession: (session: ChatSessionData) => void;
  removeSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<ChatSessionData>) => void;
  clearSessions: () => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (session) => set((state) => ({ 
        sessions: [...state.sessions, session] 
      })),
      removeSession: (id) => set((state) => ({ 
        sessions: state.sessions.filter((s) => s.id !== id) 
      })),
      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),
      clearSessions: () => set({ sessions: [] }),
    }),
    {
      name: 'tp-tutor-chats',
    }
  )
);
