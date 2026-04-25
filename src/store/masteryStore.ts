/* src/store/masteryStore.ts */
import { db } from '../services/firebase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import type { MasteryStatus, VocabWord, StatusSummary, SavedPhrase, UserProfile, LoreEntry, ReviewVibe, LoreCategory } from '../types/mastery';
import { scoreToStatus, STATUS_MIDPOINT } from '../types/mastery';
import { initialVocabulary, initialConcepts, curriculums } from '../data/initialMasteryMap';

// ... (existing toFullVocabWord and INITIAL_VOCABULARY)

interface MasteryActions {
  applyScoreDeltas: (deltas: { wordId: string; delta: number }[]) => void;
  updateVocabStatus: (wordIdOrText: string, status: MasteryStatus) => void;
  cycleWordStatus: (wordId: string) => void;
  updateConceptStatus: (id: string, status: MasteryStatus) => void;
  setLastUpdated: (date: string) => void;
  savePhrase: (phrase: string | SavedPhrase) => void;
  recordActivity: () => void;
  setStudentName: (name: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addLore: (category: LoreCategory, detail: string) => void;
  deleteLore: (id: string) => void;
  setReviewVibe: (vibe: ReviewVibe) => void;
  setProfileImage: (url: string) => void;
  updatePhraseNote: (id: string, notes: string) => void;
  deletePhrase: (id: string) => void;
  resetAsNewUser: () => void;
  randomizeVocab: () => void;
  masterAllVocab: () => void;
  clearLocalData: () => void;
  syncFromCloud: (userId: string, initialName?: string, initialProfileImage?: string) => Promise<Unsubscribe | void>;
  syncToCloud: (userId?: string) => Promise<void>;
  getStatusSummary: () => StatusSummary & { xp: number; level: number; rankTitle: string };
  setActiveLesson: (curriculumId: string, moduleId: string) => void;
}

interface MasteryState {
  userId: string | null;
  studentName: string;
  profile: UserProfile;
  lore: LoreEntry[];
  reviewVibe: ReviewVibe;
  profileImage: string;
  lastUpdated: string;
  vocabulary: VocabWord[];
  concepts: Concept[];
  curriculums: typeof curriculums;
  activeCurriculumId: string | null;
  activeModuleId: string | null;
  savedPhrases: (string | SavedPhrase)[];
  currentStreak: number;
  lastActiveDate: string;
}

type MasteryStore = MasteryState & MasteryActions;

const XP_MAP = { not_started: 0, introduced: 10, practicing: 25, confident: 50, mastered: 100 };
const STATUS_ORDER: MasteryStatus[] = ['not_started', 'introduced', 'practicing', 'confident', 'mastered'];
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const useMasteryStore = create<MasteryStore>()(
  persist(
    (set, get) => ({
      userId: null,
      studentName: 'Anthony',
      profile: { name: 'Anthony', age: '', location: '', sex: '' },
      lore: [],
      reviewVibe: 'chill',
      profileImage: '',
      lastUpdated: '',
      vocabulary: INITIAL_VOCABULARY,
      concepts: initialConcepts,
      curriculums,
      activeCurriculumId: null,
      activeModuleId: null,
      savedPhrases: [],
      currentStreak: 0,
      lastActiveDate: '',

      applyScoreDeltas: (deltas) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            const d = deltas.find(
              (delta) =>
                delta.wordId === w.id ||
                delta.wordId.toLowerCase() === w.word.toLowerCase()
            );
            if (!d) return w;
            const newScore = clamp((w.confidenceScore ?? 0) + d.delta, 0, 500);
            return {
              ...w,
              confidenceScore: newScore,
              status: scoreToStatus(newScore),
              useCount: (w.useCount ?? 0) + 1,
            };
          }),
        }));
        get().recordActivity();
        void get().syncToCloud();
      },

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

      cycleWordStatus: (wordId) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId) return w;
            const currentIndex = STATUS_ORDER.indexOf(w.status);
            const nextStatus = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];
            const targetScore = STATUS_MIDPOINT[nextStatus];
            return { ...w, confidenceScore: targetScore, status: nextStatus };
          }),
        }));
        get().recordActivity();
        void get().syncToCloud();
      },

      updateConceptStatus: (id, status) => {
        set((state) => ({
          concepts: state.concepts.map((c) =>
            c.id === id ? { ...c, status } : c
          ),
        }));
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

      setStudentName: (name) => { set({ studentName: name }); get().updateProfile({ name }); },
      updateProfile: (profile) => { set((state) => ({ profile: { ...state.profile, ...profile } })); void get().syncToCloud(); },
      addLore: (category, detail) => { 
        set((state) => ({ lore: [...state.lore, { id: crypto.randomUUID(), category, detail }] })); 
        void get().syncToCloud(); 
      },
      deleteLore: (id) => { 
        set((state) => ({ lore: state.lore.filter(l => l.id !== id) })); 
        void get().syncToCloud(); 
      },
      setReviewVibe: (vibe) => { set({ reviewVibe: vibe }); },
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
          profile: { name: '', age: '', location: '', sex: '' },
          lore: [],
          reviewVibe: 'chill',
          profileImage: '',
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: INITIAL_VOCABULARY,
          concepts: initialConcepts,
          activeCurriculumId: null,
          activeModuleId: null,
        });
        void get().syncToCloud();
      },

      randomizeVocab: () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(w => {
            const score = Math.floor(Math.random() * 451);
            return { ...w, confidenceScore: score, status: scoreToStatus(score) };
          })
        }));
        void get().syncToCloud();
      },

      masterAllVocab: () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(w => ({ ...w, confidenceScore: 450, status: 'mastered' as MasteryStatus }))
        }));
        void get().syncToCloud();
      },

      clearLocalData: () => {
        set({
          userId: null,
          studentName: 'Anthony',
          profile: { name: 'Anthony', age: '', location: '', sex: '' },
          lore: [],
          reviewVibe: 'chill',
          profileImage: '',
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: INITIAL_VOCABULARY,
          concepts: initialConcepts,
          activeCurriculumId: null,
          activeModuleId: null,
        });
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

      setActiveLesson: (curriculumId, moduleId) =>
        set({ activeCurriculumId: curriculumId, activeModuleId: moduleId }),

      syncToCloud: async (explicitUserId) => {
        const { vocabulary, concepts, lastUpdated, studentName, profile, lore, profileImage, savedPhrases, currentStreak, lastActiveDate, userId } = get();
        const targetId = explicitUserId || userId;
        if (!targetId || targetId === 'guest_user') return;

        try {
          await setDoc(doc(db, 'users', targetId), {
            vocabulary, concepts, lastUpdated, studentName, profile, lore, profileImage,
            savedPhrases, currentStreak, lastActiveDate,
          }, { merge: true });
        } catch (err) {
          console.error('Firebase Sync Error:', err);
        }
      },

      syncFromCloud: async (uid: string, initialName?: string, initialProfileImage?: string) => {
        set({ userId: uid });
        if (uid === 'guest_user') return;
        
        const userDocRef = doc(db, 'users', uid);
        
        try {
          const docSnap = await getDoc(userDocRef);
          
          if (!docSnap.exists()) {
            // New user or no cloud data
            if (initialName && (get().studentName === 'Anthony' || !get().studentName)) {
              set({ studentName: initialName });
              get().updateProfile({ name: initialName });
            }
            if (initialProfileImage && !get().profileImage) {
              set({ profileImage: initialProfileImage });
            }

            const { vocabulary } = get();
            const isFresh = vocabulary.every(w => w.status === 'not_started');
            if (!isFresh) {
              console.log('Migrating local progress to Firestore...');
              await get().syncToCloud(uid);
            }
          }
        } catch (err) {
          console.error('Error checking for migration:', err);
        }

        return onSnapshot(userDocRef, (snapshot) => {
          if (!snapshot.exists()) return;
          const data = snapshot.data();

          const vocabulary = (data.vocabulary || INITIAL_VOCABULARY).map(
            (w: any) => {
              const base = INITIAL_VOCABULARY.find(iv => iv.word === w.word);
              const useCount = typeof w.useCount === 'number' ? w.useCount : 0;
              const frequencyRank = typeof w.frequencyRank === 'number' ? w.frequencyRank : (base?.frequencyRank ?? 999);
              
              if (typeof w.confidenceScore === 'number') return { ...w, useCount, frequencyRank };
              const status: MasteryStatus = w.status || 'not_started';
              return { ...w, confidenceScore: STATUS_MIDPOINT[status], useCount, frequencyRank };
            }
          );

          set({
            vocabulary,
            concepts: data.concepts || initialConcepts,
            lastUpdated: data.lastUpdated || '',
            studentName: data.studentName || 'Anthony',
            profile: data.profile || { name: data.studentName || 'Anthony', age: '', location: '', sex: '' },
            lore: data.lore || [],
            profileImage: data.profileImage || '',
            savedPhrases: data.savedPhrases || [],
            currentStreak: data.currentStreak || 0,
            lastActiveDate: data.lastActiveDate || '',
          });
        });
      },
    }),
    { 
      name: 'tp-tutor-mastery',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { userId, ...rest } = state;
        return rest;
      }
    }
  )
);
