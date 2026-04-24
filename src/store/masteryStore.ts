/* src/store/masteryStore.ts */
import { db } from '../services/firebase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import type { MasteryMap, MasteryStatus, StatusSummary } from '../types/mastery';
import { scoreToStatus, STATUS_MIDPOINT } from '../types/mastery';
import { initialMasteryMap } from '../data/initialMasteryMap';

interface MasteryActions {
  applyScoreDeltas: (deltas: { wordId: string; delta: number }[]) => void;
  updateVocabStatus: (wordIdOrText: string, status: MasteryStatus) => void;
  updateConceptStatus: (chapterId: string, conceptId: string, status: MasteryStatus) => void;
  setLastUpdated: (date: string) => void;
  savePhrase: (phrase: string | import('../types/mastery').SavedPhrase) => void;
  recordActivity: () => void;
  setStudentName: (name: string) => void;
  setProfileImage: (url: string) => void;
  updatePhraseNote: (id: string, notes: string) => void;
  deletePhrase: (id: string) => void;
  resetAsNewUser: () => void;
  randomizeVocab: () => void;
  masterAllVocab: () => void;
  syncFromCloud: () => Unsubscribe | void;
  syncToCloud: () => Promise<void>;
  getStatusSummary: () => StatusSummary & { xp: number; level: number; rankTitle: string };
}

type MasteryStore = MasteryMap & MasteryActions;

const XP_MAP = { not_started: 0, introduced: 10, practicing: 25, confident: 50, mastered: 100 };

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

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
      profileImage: initialMasteryMap.profileImage || '',
      savedPhrases: initialMasteryMap.savedPhrases || [],
      currentStreak: initialMasteryMap.currentStreak || 0,
      lastActiveDate: initialMasteryMap.lastActiveDate || '',

      // Primary scoring action — adjusts confidenceScore and re-derives status.
      applyScoreDeltas: (deltas) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            const d = deltas.find(
              (delta) =>
                delta.wordId === w.id ||
                delta.wordId.toLowerCase() === w.word.toLowerCase()
            );
            if (!d) return w;
            const newScore = clamp((w.confidenceScore ?? 0) + d.delta, 0, 100);
            return { ...w, confidenceScore: newScore, status: scoreToStatus(newScore) };
          }),
        }));
        get().recordActivity();
        void get().syncToCloud();
      },

      // Kept for backward-compat. Converts a direct status assignment into a
      // score nudge to the midpoint of the target tier — nothing breaks.
      updateVocabStatus: (wordIdOrText, status) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordIdOrText && w.word.toLowerCase() !== wordIdOrText.toLowerCase()) return w;
            const targetScore = STATUS_MIDPOINT[status];
            return { ...w, confidenceScore: targetScore, status };
          }),
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
          const key = typeof phrase === 'string' ? phrase : phrase.tp;
          const already = state.savedPhrases.some(p =>
            typeof p === 'string' ? p === key : p.tp === key
          );
          if (already) return state;
          return { savedPhrases: [...state.savedPhrases, phrase] };
        });
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

      setStudentName: (name) => { set({ studentName: name }); void get().syncToCloud(); },
      setProfileImage: (url) => { set({ profileImage: url }); void get().syncToCloud(); },

      updatePhraseNote: (id, notes) => {
        set((state) => ({
          savedPhrases: state.savedPhrases.map(p => {
            if (typeof p === 'string') return p === id ? { id, tp: p, en: 'User Saved Phrase *', notes } : p;
            return p.id === id ? { ...p, notes } : p;
          })
        }));
        void get().syncToCloud();
      },

      deletePhrase: (id) => {
        set((state) => ({
          savedPhrases: state.savedPhrases.filter(p =>
            typeof p === 'string' ? p !== id : p.id !== id
          )
        }));
        void get().syncToCloud();
      },

      resetAsNewUser: () => {
        set({
          studentName: '',
          profileImage: '',
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: initialMasteryMap.vocabulary.map(w => ({
            ...w,
            confidenceScore: 0,
            status: 'not_started' as MasteryStatus,
          })),
          chapters: initialMasteryMap.chapters,
        });
        void get().syncToCloud();
      },

      randomizeVocab: () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(w => {
            const score = Math.floor(Math.random() * 101);
            return { ...w, confidenceScore: score, status: scoreToStatus(score) };
          })
        }));
        void get().syncToCloud();
      },

      masterAllVocab: () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(w => ({ ...w, confidenceScore: 92, status: 'mastered' as MasteryStatus }))
        }));
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
        let rankTitle = 'nimi lili';
        if (level >= 5) rankTitle = 'jan pi toki pona';
        if (level >= 10) rankTitle = 'jan sona';
        return { ...summary, level, rankTitle };
      },

      syncToCloud: async () => {
        const { vocabulary, chapters, lastUpdated, studentName, profileImage, savedPhrases, currentStreak, lastActiveDate } = get();
        try {
          const userId = getUserId();
          await setDoc(doc(db, 'users', userId), {
            vocabulary, chapters, lastUpdated, studentName, profileImage,
            savedPhrases, currentStreak, lastActiveDate,
          });
        } catch (err) {
          console.error('Firebase Sync Error:', err);
        }
      },

      syncFromCloud: () => {
        const userId = getUserId();
        return onSnapshot(doc(db, 'users', userId), (snapshot) => {
          if (!snapshot.exists()) return;
          const data = snapshot.data();

          // Change 6: Backfill confidenceScore for legacy records that only have status.
          const vocabulary = (data.vocabulary || initialMasteryMap.vocabulary).map(
            (w: any) => {
              if (typeof w.confidenceScore === 'number') return w;
              // Old record — seed score from the midpoint of its stored status tier.
              const status: MasteryStatus = w.status || 'not_started';
              return { ...w, confidenceScore: STATUS_MIDPOINT[status] };
            }
          );

          set({
            vocabulary,
            chapters: data.chapters || initialMasteryMap.chapters,
            lastUpdated: data.lastUpdated || '',
            studentName: data.studentName || 'Student',
            profileImage: data.profileImage || '',
            savedPhrases: data.savedPhrases || [],
            currentStreak: data.currentStreak || 0,
            lastActiveDate: data.lastActiveDate || '',
          });
        });
      },
    }),
    { name: 'tp-tutor-mastery' }
  )
);
