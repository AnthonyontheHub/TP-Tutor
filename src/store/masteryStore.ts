/* src/store/masteryStore.ts */
import { db } from '../services/firebase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import type { MasteryMap, MasteryStatus, StatusSummary, SavedPhrase } from '../types/mastery';
import { initialMasteryMap } from '../data/initialMasteryMap';

interface MasteryActions {
  updateVocabStatus: (wordIdOrText: string, status: MasteryStatus) => void;
  savePhrase: (text: string, comment?: string) => void;
  deletePhrase: (id: string) => void;
  updatePhraseComment: (id: string, comment: string) => void;
  setStudentName: (name: string) => void; 
  syncToCloud: () => Promise<void>; 
  getStatusSummary: () => StatusSummary;
}

const getUserId = () => {
  let userId = localStorage.getItem('tp_tutor_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('tp_tutor_user_id', userId);
  }
  return userId;
};

export const useMasteryStore = create<MasteryMap & MasteryActions>()(
  persist(
    (set, get) => ({
      ...initialMasteryMap,
      savedPhrases: Array.isArray(initialMasteryMap.savedPhrases) ? initialMasteryMap.savedPhrases : [],

      updateVocabStatus: (wordIdOrText, status) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) =>
            (w.id === wordIdOrText || w.word.toLowerCase() === wordIdOrText.toLowerCase()) ? { ...w, status } : w
          ),
        }));
        void get().syncToCloud(); 
      },

      savePhrase: (text, comment = "") => {
        const newPhrase: SavedPhrase = { id: crypto.randomUUID(), text, comment, timestamp: Date.now() };
        set((state) => ({ savedPhrases: [newPhrase, ...state.savedPhrases] }));
        void get().syncToCloud();
      },

      deletePhrase: (id) => {
        set((state) => ({ savedPhrases: state.savedPhrases.filter(p => p.id !== id) }));
        void get().syncToCloud();
      },

      updatePhraseComment: (id, comment) => {
        set((state) => ({
          savedPhrases: state.savedPhrases.map(p => p.id === id ? { ...p, comment } : p)
        }));
        void get().syncToCloud();
      },

      getStatusSummary: () => {
        const { vocabulary } = get();
        const summary = { not_started: 0, introduced: 0, practicing: 0, confident: 0, mastered: 0 };
        vocabulary.forEach(w => { if(summary[w.status] !== undefined) summary[w.status]++; });
        return summary;
      },

      setStudentName: (name) => {
        set({ studentName: name });
        void get().syncToCloud();
      },

      syncToCloud: async () => {
        const { vocabulary, chapters, studentName, savedPhrases, currentStreak, lastActiveDate } = get();
        try {
          const userId = getUserId();
          await setDoc(doc(db, 'users', userId), {
            vocabulary, chapters, studentName, savedPhrases, currentStreak, lastActiveDate, lastUpdated: new Date().toISOString()
          });
        } catch (err) { console.error("Sync Error:", err); }
      }
    }),
    { name: 'tp-tutor-mastery' }
  )
);
