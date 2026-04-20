import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MasteryMap, MasteryStatus, StatusSummary } from '../types/mastery';
import { initialMasteryMap } from '../data/initialMasteryMap';

interface MasteryActions {
  updateVocabStatus: (wordId: string, status: MasteryStatus) => void;
  updateVocabNotes: (wordId: string, notes: string) => void;
  toggleMasteryCandidate: (wordId: string) => void;
  updateConceptStatus: (chapterId: string, conceptId: string, status: MasteryStatus) => void;
  updateConceptNotes: (chapterId: string, conceptId: string, notes: string) => void;
  getStatusSummary: () => StatusSummary;
  resetToInitial: () => void;
}

type MasteryStore = MasteryMap & MasteryActions;

export const useMasteryStore = create<MasteryStore>()(
  persist(
    (set, get) => ({
      ...initialMasteryMap,

      updateVocabStatus: (wordId, status) =>
        set((state) => ({
          vocabulary: state.vocabulary.map((w) =>
            w.id === wordId ? { ...w, status } : w
          ),
        })),

      updateVocabNotes: (wordId, notes) =>
        set((state) => ({
          vocabulary: state.vocabulary.map((w) =>
            w.id === wordId ? { ...w, sessionNotes: notes } : w
          ),
        })),

      toggleMasteryCandidate: (wordId) =>
        set((state) => ({
          vocabulary: state.vocabulary.map((w) =>
            w.id === wordId ? { ...w, isMasteryCandidate: !w.isMasteryCandidate } : w
          ),
        })),

      updateConceptStatus: (chapterId, conceptId, status) =>
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
        })),

      updateConceptNotes: (chapterId, conceptId, notes) =>
        set((state) => ({
          chapters: state.chapters.map((ch) =>
            ch.id === chapterId
              ? {
                  ...ch,
                  concepts: ch.concepts.map((c) =>
                    c.id === conceptId ? { ...c, sessionNotes: notes } : c
                  ),
                }
              : ch
          ),
        })),

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

      resetToInitial: () => set({ ...initialMasteryMap }),
    }),
    { name: 'tp-tutor-mastery' }
  )
);
