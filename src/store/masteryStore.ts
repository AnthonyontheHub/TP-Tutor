import { db } from '../services/firebase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import type { MasteryMap, MasteryStatus, StatusSummary } from '../types/mastery';
import { initialMasteryMap } from '../data/initialMasteryMap';

interface MasteryActions {
  updateVocabStatus: (wordId: string, status: MasteryStatus) => void;
  updateConceptStatus: (chapterId: string, conceptId: string, status: MasteryStatus) => void;
  setLastUpdated: (date: string) => void;
  savePhrase: (phrase: string) => void;
  recordActivity: () => void;
  setStudentName: (name: string) => void; 
  syncFromCloud: () => void;
  syncToCloud: () => Promise<void>; 
  getStatusSummary: () => StatusSummary;
}

type MasteryStore = MasteryMap & MasteryActions;

export const useMasteryStore = create<MasteryStore>()(
  persist(
    (set, get) => ({
      ...initialMasteryMap,
      studentName: initialMasteryMap.studentName || 'Student',
      savedPhrases: initialMasteryMap.savedPhrases || [],
      currentStreak: initialMasteryMap.currentStreak || 0,
      lastActiveDate: initialMasteryMap.lastActiveDate || '',

      updateVocabStatus: (wordId, status) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) =>
            w.id === wordId ? { ...w, status } : w
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
        set((state) => ({ savedPhrases: [...new Set([...state.savedPhrases, phrase])] }));
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
        const summary: StatusSummary = { not_started: 0, introduced: 0, practicing: 0, confident: 0, mastered: 0 };
        for (const word of vocabulary) { summary[word.status]++; }
        return summary;
      },

      syncToCloud: async () => {
        const { vocabulary, chapters, lastUpdated, studentName, savedPhrases, currentStreak, lastActiveDate } = get();
        try {
          await setDoc(doc(db, 'users', 'anthony'), {
            vocabulary, chapters, lastUpdated, studentName, savedPhrases, currentStreak, lastActiveDate
          });
        } catch (err) {
          console.error("Firebase Sync Error:", err);
        }
      },

      syncFromCloud: () => {
        onSnapshot(doc(db, 'users', 'anthony'), (snapshot) => {
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
