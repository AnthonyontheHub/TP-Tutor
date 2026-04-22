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
  getStatusSummary: () => StatusSummary & { xp: number, level: number, rankTitle: string };
  resetProgress: () => void;
  masterAllWords: () => void;
  generateRandomProgress: () => void;
}

type MasteryStore = MasteryMap & MasteryActions;

const XP_MAP = { not_started: 0, introduced: 10, practicing: 25, confident: 50, mastered: 100 };

const getUserId = () => {
  let userId = localStorage.getItem('tp_tutor_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
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

      updateVocabStatus: (wordId, status) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => w.id === wordId ? { ...w, status } : w),
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
          set((state) => ({ currentStreak: state.currentStreak + 1, lastActiveDate: today }));
        }
      },

      setStudentName: (name) => {
        set({ studentName: name });
        void get().syncToCloud();
      },

      getStatusSummary: () => {
        const { vocabulary } = get();
        const summary = { not_started: 0, introduced: 0, practicing: 0, confident: 0, mastered: 0, xp: 0 };
        for (const word of vocabulary) { 
          summary[word.status]++; 
          summary.xp += XP_MAP[word.status];
        }
        const level = Math.floor(summary.xp / 500) + 1;
        return { ...summary, level, rankTitle: level > 5 ? "jan sona" : "nimi lili" };
      },

      resetProgress: () => {
        set({ ...initialMasteryMap, studentName: 'Student', savedPhrases: [], currentStreak: 0 });
        void get().syncToCloud();
      },

      masterAllWords: () => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => ({ ...w, status: 'mastered' as MasteryStatus }))
        }));
        void get().syncToCloud();
      },

      generateRandomProgress: () => {
        const statuses: MasteryStatus[] = ['not_started', 'introduced', 'practicing', 'confident', 'mastered'];
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => ({
            ...w,
            status: statuses[Math.floor(Math.random() * statuses.length)]
          }))
        }));
        void get().syncToCloud();
      },

      syncToCloud: async () => {
        const state = get();
        try {
          const userId = getUserId();
          await setDoc(doc(db, 'users', userId), { ...state });
        } catch (err) { console.error(err); }
      },

      syncFromCloud: () => {
        const userId = getUserId();
        onSnapshot(doc(db, 'users', userId), (snapshot) => {
          if (snapshot.exists()) set(snapshot.data() as MasteryStore);
        });
      }
    }),
    { name: 'tp-tutor-mastery' }
  )
);
