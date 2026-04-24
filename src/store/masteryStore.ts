import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialVocabulary, initialConcepts, curriculums } from '../data/initialMasteryMap';
import type { MasteryStatus, VocabWord } from '../types/mastery';

interface Concept {
  id: string;
  title: string;
  status: MasteryStatus;
  sessionNotes: string;
}

interface MasteryState {
  studentName: string;
  lastUpdated: string;
  vocabulary: VocabWord[];
  concepts: Concept[];
  curriculums: typeof curriculums;
  activeCurriculumId: string | null;
  activeModuleId: string | null;

  setStudentName: (name: string) => void;
  setLastUpdated: (date: string) => void;
  updateVocabStatus: (word: string, status: MasteryStatus) => void;
  updateConceptStatus: (id: string, status: MasteryStatus) => void;
  setActiveLesson: (curriculumId: string, moduleId: string) => void;
  resetAsNewUser: () => void;
}

export const useMasteryStore = create<MasteryState>()(
  persist(
    (set) => ({
      studentName: 'Anthony',
      lastUpdated: new Date().toLocaleDateString(),
      vocabulary: initialVocabulary,
      concepts: initialConcepts,
      curriculums: curriculums,
      activeCurriculumId: null,
      activeModuleId: null,

      setStudentName: (name) => set({ studentName: name }),
      setLastUpdated: (date) => set({ lastUpdated: date }),
      updateVocabStatus: (word, status) =>
        set((state) => ({
          vocabulary: state.vocabulary.map((v) =>
            v.word === word ? { ...v, status } : v
          ),
        })),
      updateConceptStatus: (id, status) =>
        set((state) => ({
          concepts: state.concepts.map((c) =>
            c.id === id ? { ...c, status } : c
          ),
        })),
      setActiveLesson: (curriculumId, moduleId) =>
        set({ activeCurriculumId: curriculumId, activeModuleId: moduleId }),
      resetAsNewUser: () =>
        set({
          studentName: '',
          vocabulary: initialVocabulary,
          concepts: initialConcepts,
          activeCurriculumId: null,
          activeModuleId: null,
          lastUpdated: '',
        }),
    }),
    { name: 'tp-tutor-mastery' }
  )
);
