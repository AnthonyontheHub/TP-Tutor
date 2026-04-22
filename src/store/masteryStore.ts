/* src/store/masteryStore.ts */
import { db } from '../services/firebase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import type { MasteryMap, MasteryStatus, StatusSummary, SavedPhrase } from '../types/mastery';
import { initialMasteryMap } from '../data/initialMasteryMap';

interface MasteryActions {
  updateVocabStatus: (wordIdOrText: string, status: MasteryStatus) => void;
  updateConceptStatus: (chapterId: string, conceptId: string, status: MasteryStatus) => void;
  setLastUpdated: (date: string) => void;
  savePhrase: (phrase: string) => void;
  removePhrase: (id: string) => void;
  updatePhraseComment: (id: string, comment: string) => void;
  recordActivity: () => void;
  setStudentName: (name: string) => void; 
  syncFromCloud: () => any;
  syncToCloud: () => Promise<void>; 
  getStatusSummary: () => StatusSummary & { xp: number, level: number, rankTitle: string };
}

type MasteryStore = MasteryMap & MasteryActions;

const XP_MAP = { not_started: 0, introduced: 10, practicing: 25, confident: 50, mastered: 100 };

// Fixed: Add fallback to prevent crash in non-HTTPS local networks
const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2, 15);
  }
};

const getUserId = () => {
  let userId = localStorage.getItem('tp_tutor_user_id');
  if (!userId) {
    userId = generateId();
    localStorage.setItem('tp_tutor_user_id', userId);
  }
  return userId;
};

export const useMasteryStore = create<MasteryStore>()(
  persist(
    (set, get) => ({
      ...initialMasteryMap,
      studentName: initialMasteryMap.studentName || 'Student',
      savedPhrases: initialMasteryMap.savedPhrases || [],
      currentStreak: initialMasteryMap.currentStreak || 0,
      lastActiveDate: initialMasteryMap.lastActiveDate || '',

      updateVocabStatus: (wordIdOrText, status) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) =>
            (w.id === wordIdOrText || w.word.toLowerCase() === wordIdOrText.toLowerCase()) 
              ? { ...w, status } 
              : w
          ),
        }));
        get().recordActivity();
        void get().syncToCloud(); 
      },

      updateConceptStatus: (chapterId, conceptId, status) => {
        set((state) => ({
          chapters: state.chapters.map((ch) =>
            ch.id === chapterId
              ? { ...ch, concepts: ch.concepts.map((c) => c.id === conceptId ? { ...c, status } : c) }
              : ch
          ),
        }));
        get().recordActivity();
        void get().syncToCloud();
      },

      savePhrase: (phrase) => {
        set((state) => {
          const newPhrase: SavedPhrase = { id: generateId(), text: phrase, comment: '' };
          return { savedPhrases: [...state.savedPhrases, newPhrase] };
        });
        void get().syncToCloud();
      },

      removePhrase: (id) => {
        set((state) => ({
          savedPhrases: state.savedPhrases.filter((p: any) => typeof p === 'string' ? p !== id : p.id !== id)
        }));
        void get().syncToCloud();
      },

      updatePhraseComment: (id, comment) => {
        set((state) => ({
          savedPhrases: state.savedPhrases.map((p: any) => 
            typeof p === 'object' && p.id === id ? { ...p, comment } : p
          )
        }));
        void get().syncToCloud();
      },

      recordActivity: () => {
        const today = new Date().toDateString();
        const lastDate = get().lastActiveDate;
        
        if (lastDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastDate === yesterday.toDateString()) {
            set((state) => ({ currentStreak: state.currentStreak + 1, lastActiveDate: today }));
          } else {
            set({ currentStreak: 1, lastActiveDate: today });
          }
        }
      },

      setStudentName: (name) => {
        set({ studentName: name });
        void get().syncToCloud();
      },

      setLastUpdated: (date) => set({ lastUpdated: date }),

      getStatusSummary: () => {
        const { vocabulary } = get();
        const summary = { not_started: 0, introduced: 0, practicing: 0, confident: 0, mastered: 0, xp: 0 };
        
        for (const word of vocabulary) { 
          summary[word.status]++; 
          summary.xp += XP_MAP[word.status];
        }

        const level = Math.floor(summary.xp / 500) + 1;
        let rankTitle = "nimi lili"; 
        if (level >= 5) rankTitle = "jan pi toki pona"; 
        if (level >= 10) rankTitle = "jan sona"; 
        
        return { ...summary, level, rankTitle };
      },

      syncToCloud: async () => {
        const { vocabulary, chapters, lastUpdated, studentName, savedPhrases, currentStreak, lastActiveDate } = get();
        try {
          const userId = getUserId();
          await setDoc(doc(db, 'users', userId), {
            vocabulary, chapters, lastUpdated, studentName, savedPhrases, currentStreak, lastActiveDate
          });
        } catch (err) {
          console.error("Firebase Sync Error:", err);
        }
      },

      syncFromCloud: () => {
        const userId = getUserId();
        // Fixed: Ensure the unsubscribe function is actually returned to the App.tsx component
        return onSnapshot(doc(db, 'users', userId), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            set({
              vocabulary: data.vocabulary || initialMasteryMap.vocabulary,
              chapters: data.chapters || initialMasteryMap.chapters,
              lastUpdated: data.lastUpdated || '',
              studentName: data.studentName || 'Student',
              savedPhrases: data.savedPhrases || [],
              currentStreak: data.currentStreak || 0,
              lastActiveDate: data.lastActiveDate || ''
            });
          }
        });
      }
    }),
    { name: 'tp-tutor-mastery' }
  )
);
