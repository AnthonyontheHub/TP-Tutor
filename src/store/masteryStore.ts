/* src/store/masteryStore.ts */
import { db } from '../services/firebase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import type { 
  MasteryStatus, VocabWord, StatusSummary, SavedPhrase, 
  UserProfile, LoreEntry, ReviewVibe, LoreCategory, 
  CurriculumLevel, NodeStatus 
} from '../types/mastery';
import { scoreToStatus, STATUS_MIDPOINT } from '../types/mastery';
import { initialMasteryMap } from '../data/initialMasteryMap';

function toFullVocabWord(v: { word: string; status: MasteryStatus; type: 'word' | 'grammar'; sessionNotes: string; frequencyRank?: number }): VocabWord {
  const score = STATUS_MIDPOINT[v.status];
  return {
    id: v.word,
    word: v.word,
    partOfSpeech: '',
    meanings: '',
    type: v.type,
    baseScore: score,
    confidenceScore: score,
    status: v.status,
    useCount: 0,
    frequencyRank: v.frequencyRank ?? 999,
    isMasteryCandidate: false,
    sessionNotes: v.sessionNotes,
    partOfSpeechScores: { noun: 0, verb: 0, modifier: 0 },
    lastReviewed: new Date().toISOString(),
    scoreHistory: []
  };
}

const mappedVocabulary: VocabWord[] = initialMasteryMap.initialVocabulary.map(toFullVocabWord);

interface MasteryActions {
  applyScoreUpdate: (nodeId: string, points: number, context: string) => void;
  calculateDecay: () => void;
  applyScoreDeltas: (deltas: { wordId: string; delta: number }[]) => void;
  updateVocabStatus: (wordIdOrText: string, status: MasteryStatus) => void;
  cycleWordStatus: (wordId: string) => void;
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
  resetProfileAndRunSetup: () => void;
  randomizeVocab: () => void;
  masterAllVocab: () => void;
  clearLocalData: () => void;
  syncFromCloud: (userId: string, initialName?: string, initialProfileImage?: string) => Promise<Unsubscribe | void>;
  syncToCloud: (userId?: string) => Promise<void>;
  getStatusSummary: () => StatusSummary & { xp: number; level: number; rankTitle: string };
  setHasCompletedSetup: (val: boolean) => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
  refreshCurriculumStatus: () => void;
  setWidgetDensity: (val: 'Compact' | 'Expanded') => void;
  setFogOfWar: (val: 'Strict' | 'Visible') => void;
  setShowCircuitPaths: (val: boolean) => void;
  setSelectedWords: (words: string[]) => void;
  addWordToSelection: (word: string) => void;
  removeWordFromSelection: (word: string) => void;
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
  levels: CurriculumLevel[];
  savedPhrases: (string | SavedPhrase)[];
  currentStreak: number;
  lastActiveDate: string;
  hasCompletedSetup: boolean;
  selectedWords: string[];
  // Dashboard settings
  widgetDensity: 'Compact' | 'Expanded';
  fogOfWar: 'Strict' | 'Visible';
  showCircuitPaths: boolean;
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
      profile: { name: 'Anthony', age: '', location: '', sex: '', history: [] },
      lore: [],
      reviewVibe: 'chill',
      profileImage: '',
      lastUpdated: '',
      vocabulary: mappedVocabulary,
      levels: initialMasteryMap.roadmap,
      savedPhrases: [],
      currentStreak: 0,
      lastActiveDate: '',
      hasCompletedSetup: false,
      selectedWords: [],
      widgetDensity: 'Expanded',
      fogOfWar: 'Visible',
      showCircuitPaths: true,

      setHasCompletedSetup: (val) => { set({ hasCompletedSetup: val }); void get().syncToCloud(); },

      refreshCurriculumStatus: () => {
        set((state) => {
          const newLevels = state.levels.map(level => ({
            ...level,
            nodes: level.nodes.map(node => {
              const allReqs = [...node.requiredVocabIds, ...node.requiredGrammarIds];
              const masteryReqs = state.vocabulary.filter(v => allReqs.includes(v.id));
              
              const isMastered = masteryReqs.length > 0 && masteryReqs.every(v => v.status === 'mastered');
              const isActive = masteryReqs.some(v => v.status !== 'not_started') || node.status === 'active';
              
              let newStatus: NodeStatus = 'locked';
              if (isMastered) newStatus = 'mastered';
              else if (isActive) newStatus = 'active';

              return { ...node, status: newStatus };
            })
          }));
          return { levels: newLevels };
        });
      },

      applyScoreUpdate: (nodeId, points, context) => {
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== nodeId && w.word.toLowerCase() !== nodeId.toLowerCase()) return w;
            const newScore = clamp(w.baseScore + points, 0, 1000);
            const historyEntry = { date: now, change: points, reason: context };
            return {
              ...w,
              baseScore: newScore,
              confidenceScore: newScore, // Keep legacy in sync
              status: scoreToStatus(newScore),
              lastReviewed: now,
              scoreHistory: [historyEntry, ...(w.scoreHistory || [])].slice(0, 5),
              useCount: w.useCount + 1
            };
          })
        }));
        get().refreshCurriculumStatus();
        get().recordActivity();
        void get().syncToCloud();
      },

      calculateDecay: () => {
        const now = new Date();
        const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            const last = new Date(w.lastReviewed || 0).getTime();
            if (now.getTime() - last > FORTY_EIGHT_HOURS) {
              const decayAmount = -15; // Lina's gentle decay
              const newScore = clamp(w.baseScore - 15, 0, 1000);
              if (newScore === w.baseScore) return w;
              return {
                ...w,
                baseScore: newScore,
                confidenceScore: newScore,
                status: scoreToStatus(newScore),
                scoreHistory: [{ date: now.toISOString(), change: decayAmount, reason: 'decay' }, ...(w.scoreHistory || [])].slice(0, 5)
              };
            }
            return w;
          })
        }));
        void get().syncToCloud();
      },

      applyScoreDeltas: (deltas) => {
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            const d = deltas.find(
              (delta) =>
                delta.wordId === w.id ||
                delta.wordId.toLowerCase() === w.word.toLowerCase()
            );
            if (!d) return w;
            const newScore = clamp((w.baseScore ?? 0) + d.delta, 0, 1000);
            return {
              ...w,
              baseScore: newScore,
              confidenceScore: newScore,
              status: scoreToStatus(newScore),
              useCount: (w.useCount ?? 0) + 1,
              lastReviewed: now,
              scoreHistory: [{ date: now, change: d.delta, reason: 'manual_delta' }, ...(w.scoreHistory || [])].slice(0, 5)
            };
          }),
        }));
        get().refreshCurriculumStatus();
        get().recordActivity();
        void get().syncToCloud();
      },

      updateVocabStatus: (wordIdOrText, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordIdOrText && w.word.toLowerCase() !== wordIdOrText.toLowerCase()) return w;
            const targetScore = STATUS_MIDPOINT[status];
            const diff = targetScore - (w.baseScore || 0);
            return { 
              ...w, 
              baseScore: targetScore, 
              confidenceScore: targetScore, 
              status,
              lastReviewed: now,
              scoreHistory: [{ date: now, change: diff, reason: 'status_override' }, ...(w.scoreHistory || [])].slice(0, 5)
            };
          }),
        }));
        get().refreshCurriculumStatus();
        get().recordActivity();
        void get().syncToCloud();
      },

      cycleWordStatus: (wordId) => {
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId) return w;
            const currentIndex = STATUS_ORDER.indexOf(w.status);
            const nextStatus = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];
            const targetScore = STATUS_MIDPOINT[nextStatus];
            const diff = targetScore - (w.baseScore || 0);
            return { 
              ...w, 
              baseScore: targetScore, 
              confidenceScore: targetScore, 
              status: nextStatus,
              lastReviewed: now,
              scoreHistory: [{ date: now, change: diff, reason: 'status_cycle' }, ...(w.scoreHistory || [])].slice(0, 5)
            };
          }),
        }));
        get().refreshCurriculumStatus();
        get().recordActivity();
        void get().syncToCloud();
      },

      updateNodeStatus: (nodeId, status) => {
        set((state) => ({
          levels: state.levels.map(l => ({
            ...l,
            nodes: l.nodes.map(n => n.id === nodeId ? { ...n, status } : n)
          }))
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
        
        let newStreak = get().currentStreak;
        let streakChanged = false;

        if (lastDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastDate === yesterday.toDateString()) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          streakChanged = true;
          set({ currentStreak: newStreak, lastActiveDate: today });
        }

        if (streakChanged) {
          const summary = get().getStatusSummary();
          const totalLearned = summary.introduced + summary.practicing + summary.confident + summary.mastered;
          const snapshot = {
            date: today,
            xp: summary.xp,
            totalLearned,
            streak: newStreak
          };
          
          set(state => ({
            profile: {
              ...state.profile,
              history: [...(state.profile.history || []), snapshot]
            }
          }));
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
          profile: { name: '', age: '', location: '', sex: '', history: [] },
          lore: [],
          reviewVibe: 'chill',
          profileImage: '',
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: mappedVocabulary,
          levels: initialMasteryMap.roadmap,
          hasCompletedSetup: false,
        });
        void get().syncToCloud();
      },

      resetProfileAndRunSetup: () => {
        set({
          studentName: '',
          profile: { name: '', age: '', location: '', sex: '', history: [] },
          lore: [],
          profileImage: '',
          hasCompletedSetup: false,
        });
        void get().syncToCloud();
      },

      randomizeVocab: () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(w => {
            const score = Math.floor(Math.random() * 1001);
            return { ...w, baseScore: score, confidenceScore: score, status: scoreToStatus(score) };
          })
        }));
        get().refreshCurriculumStatus();
        void get().syncToCloud();
      },

      masterAllVocab: () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(w => ({ ...w, baseScore: 975, confidenceScore: 975, status: 'mastered' as MasteryStatus }))
        }));
        get().refreshCurriculumStatus();
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
          vocabulary: mappedVocabulary,
          levels: initialMasteryMap.roadmap,
          hasCompletedSetup: false,
        });
      },

      setLastUpdated: (date) => set({ lastUpdated: date }),

      setWidgetDensity: (val) => { set({ widgetDensity: val }); void get().syncToCloud(); },
      setFogOfWar: (val) => { set({ fogOfWar: val }); void get().syncToCloud(); },
      setShowCircuitPaths: (val) => { set({ showCircuitPaths: val }); void get().syncToCloud(); },

      setSelectedWords: (words) => set({ selectedWords: words }),
      addWordToSelection: (word) => set((state) => ({ selectedWords: [...state.selectedWords, word] })),
      removeWordFromSelection: (word) => set((state) => {
        const index = state.selectedWords.indexOf(word);
        if (index === -1) return state;
        const newSelected = [...state.selectedWords];
        newSelected.splice(index, 1);
        return { selectedWords: newSelected };
      }),

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

      syncToCloud: async (explicitUserId) => {
        const { vocabulary, levels, lastUpdated, studentName, profile, lore, profileImage, savedPhrases, currentStreak, lastActiveDate, userId, hasCompletedSetup, widgetDensity, fogOfWar, showCircuitPaths } = get();
        const targetId = explicitUserId || userId;
        if (!targetId || targetId === 'guest_user') return;

        try {
          await setDoc(doc(db, 'users', targetId), {
            vocabulary, levels, lastUpdated, studentName, profile, lore, profileImage,
            savedPhrases, currentStreak, lastActiveDate, hasCompletedSetup,
            widgetDensity, fogOfWar, showCircuitPaths
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
              await get().syncToCloud(uid);
            }
          }
        } catch (err) {
          console.error('Error checking for migration:', err);
        }

        return onSnapshot(userDocRef, (snapshot) => {
          if (!snapshot.exists()) return;
          const data = snapshot.data();

          const vocabulary = (data.vocabulary || mappedVocabulary).map(
            (w: any) => {
              const base = mappedVocabulary.find(iv => iv.word === w.word);
              const useCount = typeof w.useCount === 'number' ? w.useCount : 0;
              const frequencyRank = typeof w.frequencyRank === 'number' ? w.frequencyRank : (base?.frequencyRank ?? 999);
              const type = w.type || (base?.type ?? 'word');
              
              // Handle Migration to baseScore (0-1000)
              let baseScore = w.baseScore;
              if (baseScore === undefined) {
                // If we only have confidenceScore (0-500), map it
                if (typeof w.confidenceScore === 'number') {
                  baseScore = w.confidenceScore * 2;
                } else {
                  baseScore = STATUS_MIDPOINT[w.status as MasteryStatus || 'not_started'];
                }
              }

              return { 
                ...w, 
                baseScore,
                confidenceScore: baseScore, // sync legacy
                useCount, 
                frequencyRank, 
                type,
                partOfSpeechScores: w.partOfSpeechScores || { noun: 0, verb: 0, modifier: 0 },
                lastReviewed: w.lastReviewed || new Date().toISOString(),
                scoreHistory: w.scoreHistory || []
              };
            }
          );

          set({
            vocabulary,
            levels: data.levels || initialMasteryMap.roadmap,
            lastUpdated: data.lastUpdated || '',
            studentName: data.studentName || 'Anthony',
            profile: data.profile || { name: data.studentName || 'Anthony', age: '', location: '', sex: '' },
            lore: data.lore || [],
            profileImage: data.profileImage || '',
            savedPhrases: data.savedPhrases || [],
            currentStreak: data.currentStreak || 0,
            lastActiveDate: data.lastActiveDate || '',
            hasCompletedSetup: data.hasCompletedSetup || false,
            widgetDensity: data.widgetDensity || 'Expanded',
            fogOfWar: data.fogOfWar || 'Visible',
            showCircuitPaths: data.showCircuitPaths !== undefined ? data.showCircuitPaths : true,
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
