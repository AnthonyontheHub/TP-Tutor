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
}

type MasteryStore = MasteryMap & MasteryActions;

export const useMasteryStore = create<MasteryStore>()(
  persist(
    (set, get) => ({
      ...initialMasteryMap,

      updateVocabStatus: (wordId, status) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) =>
            w.id === wordId ? { ...w, status } : w
          ),
        }));
        get().syncToCloud(); // Save change to Firebase
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
        get().syncToCloud(); // Save change to Firebase
      },

      setLastUpdated: (date) => set({ lastUpdated: date }),

      // INTERNAL HELPER: Push current state to Firebase
      syncToCloud: async () => {
        const { vocabulary, chapters, lastUpdated, studentName } = get();
        // For a personal app, we save everything to one 'anthony' document
        await setDoc(doc(db, 'users', 'anthony'), {
          vocabulary,
          chapters,
          lastUpdated,
          studentName
        });
      },

      // INITIALIZER: Listen for changes from other devices
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
