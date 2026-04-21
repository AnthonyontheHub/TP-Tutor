import { db } from '../services/firebase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../services/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import type { MasteryMap, MasteryStatus, StatusSummary } from '../types/mastery';
import { initialMasteryMap } from '../data/initialMasteryMap';

interface MasteryActions {
  updateVocabStatus: (wordId: string, status: MasteryStatus) => void;
  updateConceptStatus: (chapterId: string, conceptId: string, status: MasteryStatus) => void;
  setLastUpdated: (date: string) => void;
  syncFromCloud: () => void;
  syncToCloud: () => Promise<void>; // Added this to fix the 'does not exist' error
  getStatusSummary: () => StatusSummary;
}

type MasteryStore = MasteryMap & MasteryActions;

export const useMasteryStore = create<MasteryStore>()(
  persist(
    (set, get) => ({
      ...initialMasteryMap,
      // Ensure studentName exists even if initialMasteryMap doesn't have it
      studentName: initialMasteryMap.studentName || 'Student',

      updateVocabStatus: (wordId, status) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) =>
            w.id === wordId ? { ...w, status } : w
          ),
        }));
        void get().syncToCloud(); 
      },

      updateConceptStatus: (chapterId, conceptId, status) => {
        set((state) => ({
          chapters: state.chapters.map((ch) =>
            ch.id === chapterId
              ? {
                  ...ch,
                  concepts: ch.concepts.map((c) =>
                    c.id === conceptId ? { ...c, status } : c
                  ),
                }
              : ch
          ),
        }));
        void get().syncToCloud();
      },

      setLastUpdated: (date) => set({ lastUpdated: date }),

      getStatusSummary: () => {
        const { vocabulary } = get();
        const summary: StatusSummary = {
          not_started: 0,
          introduced: 0,
          practicing: 0,
          confident: 0,
          mastered: 0,
        };
        for (const word of vocabulary) {
          summary[word.status]++;
        }
        return summary;
      },

      syncToCloud: async () => {
        const { vocabulary, chapters, lastUpdated, studentName } = get();
        try {
          await setDoc(doc(db, 'users', 'anthony'), {
            vocabulary,
            chapters,
            lastUpdated,
            studentName
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
              vocabulary: data.vocabulary,
              chapters: data.chapters,
              lastUpdated: data.lastUpdated,
              studentName: data.studentName
            });
          }
        });
      }
    }),
    { name: 'tp-tutor-mastery' }
  )
);
