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
  resetProgress: () => void; // Added resetProgress
}

type MasteryStore = MasteryMap & MasteryActions;

// XP Mapping: Values for each status level - Made sure it covers all statuses
const XP_MAP: Record<MasteryStatus, number> = { 
  not_started: 0, 
  introduced: 10, 
  practicing: 25, 
  confident: 50, 
  mastered: 100 
};

// Helper to get or create a unique user ID for the database
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
        const summary = { not_started: 0, introduced: 0, practicing: 0, confident: 0, mastered: 0, xp: 0 };
        
        for (const word of vocabulary) { 
          // Ensure word.status is valid, fallback to not_started if undefined
          const status = word.status || 'not_started';
          summary[status]++; 
          summary.xp += (XP_MAP[status] || 0); // Guard against NaN
        }

        // Calculate level based on 500 XP per level. Ensure XP is a valid number.
        const validXp = isNaN(summary.xp) ? 0 : summary.xp;
        const level = Math.floor(validXp / 500) + 1;
        
        let rankTitle = "nimi lili"; 
        if (level >= 5) rankTitle = "jan pi toki pona"; 
        if (level >= 10) rankTitle = "jan sona"; 
        
        return { ...summary, xp: validXp, level, rankTitle };
      },

      // Added Reset Progress function
      resetProgress: () => {
        set({
           vocabulary: initialMasteryMap.vocabulary,
           chapters: initialMasteryMap.chapters,
           savedPhrases: [],
           currentStreak: 0,
           lastActiveDate: '',
           // Keep studentName
        });
        void get().syncToCloud();
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
        onSnapshot(doc(db, 'users', userId), (snapshot) => {
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
