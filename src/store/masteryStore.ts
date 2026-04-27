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
import { curriculumRoadmap } from '../data/curriculum';
import { vocabContent } from '../data/vocabContent';
import { TOKI_PONA_DICTIONARY } from '../data/tokiPonaDictionary';

function toFullVocabWord(v: { word: string; partOfSpeech?: string; status: MasteryStatus; type: 'word' | 'grammar'; sessionNotes: string; frequencyRank?: number }): VocabWord {
  const score = STATUS_MIDPOINT[v.status];
  const staticData = vocabContent[v.word] || {};

  return {
    id: v.word,
    word: v.word,
    partOfSpeech: v.partOfSpeech || '',
    meanings: TOKI_PONA_DICTIONARY[v.word.toLowerCase()] || '',
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
    scoreHistory: [],
    hardened: false,
    isBleeding: false,

    // Hydrate static fields from vocabContent
    phonetic: staticData.phonetic || '',
    syllables: staticData.syllables || [],
    anchor: staticData.anchor || '',
    semanticCluster: staticData.semanticCluster || [],
    connotation: staticData.connotation || 'neutral',
    roles: staticData.roles || [],
    examples: staticData.examples || [],
    collocations: staticData.collocations || [],
    relatedWordIds: staticData.relatedWordIds || [],
    boundaryNotes: staticData.boundaryNotes || [],
    etymology: staticData.etymology || '',
    mnemonic: staticData.mnemonic || '',
    userMnemonic: '',
    culturalNotes: staticData.culturalNotes || '',
    avoidWhen: staticData.avoidWhen || '',
    rolesMastered: {},
    userNotes: ''
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
  setKnowledgeCheckFrequency: (freq: 'daily' | 'session' | 'never') => void;
  setLastKnowledgeCheckDate: (date: string) => void;
  setSelectedWords: (words: string[]) => void;
  addWordToSelection: (word: string) => void;
  removeWordFromSelection: (word: string) => void;
  toggleWordSelection: (word: string) => void;
  setLessonFilter: (wordIds: string[] | null) => void;
  hardenWord: (wordId: string) => void;
  clearAllSavedPhrases: () => void;
  checkAssessments: (onTrigger: (word: VocabWord) => void) => void;
  switchProfile: (name: string) => void;
  updateVocabAIContent: (wordId: string, content: { aiExplanation?: string; aiExamples?: Record<string, string> }) => void;
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
  curriculums: CurriculumLevel[];
  savedPhrases: (string | SavedPhrase)[];
  currentStreak: number;
  lastActiveDate: string;
  hasCompletedSetup: boolean;
  currentPositionNodeId: string;
  selectedWords: string[];
  lessonFilter: string[] | null;
  isMainProfile: boolean;
  cloudSynced: boolean;
  // Dashboard settings
  widgetDensity: 'Compact' | 'Expanded';
  fogOfWar: 'Strict' | 'Visible';
  showCircuitPaths: boolean;
  knowledgeCheckFrequency: 'daily' | 'session' | 'never';
  lastKnowledgeCheckDate: string;
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
      profile: { firstName: 'Anthony', lastName: '', tpName: '', difficulty: 'Beginner', interests: [], age: '', locationString: '', sex: '', history: [] },
      lore: [],
      reviewVibe: null,
      profileImage: '',
      lastUpdated: '',
      vocabulary: mappedVocabulary,
      curriculums: curriculumRoadmap,
      savedPhrases: [],
      currentStreak: 0,
      lastActiveDate: '',
      hasCompletedSetup: false,
      currentPositionNodeId: 'phi_sim',
      selectedWords: [],
      lessonFilter: null,
      widgetDensity: 'Expanded',
      isMainProfile: true,
      fogOfWar: 'Visible',
      showCircuitPaths: true,
      knowledgeCheckFrequency: 'session',
      lastKnowledgeCheckDate: '',
      cloudSynced: false,

      setHasCompletedSetup: (val) => { set({ hasCompletedSetup: val }); void get().syncToCloud(); },

      refreshCurriculumStatus: () => {
        set((state) => {
          let lastNodeMastery = 1000; // Book 1 starts unlocked

          const newCurriculums = state.curriculums.map((level, lIdx) => ({
            ...level,
            nodes: level.nodes.map((node, nIdx) => {
              const allReqs = [...node.requiredVocabIds, ...node.requiredGrammarIds];
              const vocabReqs = state.vocabulary.filter(v => allReqs.includes(v.id) || allReqs.includes(v.word));
              
              const avgScore = vocabReqs.length > 0 
                ? vocabReqs.reduce((acc, v) => acc + v.baseScore, 0) / vocabReqs.length 
                : lastNodeMastery; // Default to last node's mastery if no reqs

              const isMastered = (vocabReqs.length > 0 && vocabReqs.every(v => v.status === 'mastered')) || (vocabReqs.length === 0 && lastNodeMastery >= 950);
              const isUnlocked = lastNodeMastery > 700 || (lIdx === 0 && nIdx === 0);
              
              let newStatus: NodeStatus = 'locked';
              if (isMastered) newStatus = 'mastered';
              else if (isUnlocked) newStatus = 'active';

              lastNodeMastery = avgScore;

              return { ...node, status: newStatus };
            })
          }));

          // Update currentPositionNodeId to the first active/mastered but not yet hardened node?
          // Actually user said: "The current stop is highlighted and clickable."
          // So the first non-mastered node that is active.
          const allNodes = newCurriculums.flatMap(l => l.nodes);
          const firstActive = allNodes.find(n => n.status === 'active')?.id || state.currentPositionNodeId;

          return { curriculums: newCurriculums, currentPositionNodeId: firstActive };
        });
      },

      applyScoreUpdate: (nodeId, points, context) => {
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== nodeId && w.word.toLowerCase() !== nodeId.toLowerCase()) return w;
            const newScore = clamp(w.baseScore + points, 0, 1000);
            const historyEntry = { date: now, change: points, reason: context };
            
            // Bleed Detection: >50 drop in 48hrs
            const recentDrops = [historyEntry, ...(w.scoreHistory || [])]
              .filter(h => h.change < 0 && (new Date(now).getTime() - new Date(h.date).getTime() < 48 * 3600000));
            const totalDrop = Math.abs(recentDrops.reduce((acc, h) => acc + h.change, 0));
            const isBleeding = totalDrop > 50;

            return {
              ...w,
              baseScore: newScore,
              confidenceScore: newScore, // Keep legacy in sync
              status: scoreToStatus(newScore),
              lastReviewed: now,
              scoreHistory: [historyEntry, ...(w.scoreHistory || [])].slice(0, 5),
              useCount: w.useCount + 1,
              isBleeding
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
            if (w.hardened) return w;
            const last = new Date(w.lastReviewed || 0).getTime();
            if (now.getTime() - last > FORTY_EIGHT_HOURS) {
              const decayAmount = -15; 
              const newScore = clamp(w.baseScore - 15, 0, 1000);
              if (newScore === w.baseScore) return w;
              
              const history = [{ date: now.toISOString(), change: decayAmount, reason: 'decay' }, ...(w.scoreHistory || [])].slice(0, 5);
              const recentDrops = history.filter(h => h.change < 0 && (now.getTime() - new Date(h.date).getTime() < 48 * 3600000));
              const totalDrop = Math.abs(recentDrops.reduce((acc, h) => acc + h.change, 0));

              return {
                ...w,
                baseScore: newScore,
                confidenceScore: newScore,
                status: scoreToStatus(newScore),
                scoreHistory: history,
                isBleeding: totalDrop > 50
              };
            }
            return w;
          })
        }));
        void get().syncToCloud();
      },

      hardenWord: (wordId) => {
        set(state => ({
          vocabulary: state.vocabulary.map(w => (w.id === wordId || w.word === wordId) ? { ...w, hardened: true, baseScore: 1000, status: 'mastered' } : w)
        }));
        void get().syncToCloud();
      },

      clearAllSavedPhrases: () => {
        set({ savedPhrases: [] });
        void get().syncToCloud();
      },

      checkAssessments: (onTrigger) => {
        const { vocabulary } = get();
        const candidates = vocabulary.filter(w => w.baseScore >= 500 && w.status !== 'mastered' && !w.hardened);
        if (candidates.length > 0) {
          onTrigger(candidates[0]);
        }
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
        if (localStorage.getItem('tp_sandbox_mode') !== 'true') return;
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
          curriculums: state.curriculums.map(l => ({
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

      setStudentName: (name) => { set({ studentName: name }); get().updateProfile({ firstName: name }); },
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
            if (typeof p === 'string') return p === id ? { id, tp: p, en: 'Anthony Saved Phrase *', notes } : p;
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
          profile: { firstName: '', lastName: '', tpName: '', difficulty: 'Beginner', interests: [], age: '', locationString: '', sex: '', history: [] },
          lore: [],
          reviewVibe: null,
          profileImage: '',
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: mappedVocabulary,
          curriculums: curriculumRoadmap,
          currentPositionNodeId: 'phi_sim',
          hasCompletedSetup: false,
        });
        void get().syncToCloud();
      },

      resetProfileAndRunSetup: () => {
        set({
          studentName: '',
          profile: { firstName: '', lastName: '', tpName: '', difficulty: 'Beginner', interests: [], age: '', locationString: '', sex: '', history: [] },
          lore: [],
          profileImage: '',
          curriculums: curriculumRoadmap,
          currentPositionNodeId: 'phi_sim',
          hasCompletedSetup: false,
        });
        void get().syncToCloud();
      },

      randomizeVocab: () => {
        if (localStorage.getItem('tp_sandbox_mode') !== 'true') return;
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
        if (localStorage.getItem('tp_sandbox_mode') !== 'true') return;
        set((state) => ({
          vocabulary: state.vocabulary.map(w => ({ ...w, baseScore: 975, confidenceScore: 975, status: 'mastered' as MasteryStatus })),
          curriculums: state.curriculums.map(level => ({
            ...level,
            nodes: level.nodes.map(node => ({ ...node, status: 'mastered' as const }))
          }))
        }));
        get().refreshCurriculumStatus();
        void get().syncToCloud();
      },

      clearLocalData: () => {
        set({
          userId: null,
          studentName: 'Anthony',
          profile: { firstName: 'Anthony', lastName: '', tpName: '', difficulty: 'Beginner', interests: [], age: '', locationString: '', sex: '', history: [] },
          lore: [],
          reviewVibe: null,
          profileImage: '',
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: mappedVocabulary,
          curriculums: curriculumRoadmap,
          hasCompletedSetup: false,
        });
      },

      setLastUpdated: (date) => set({ lastUpdated: date }),

      setWidgetDensity: (val) => { set({ widgetDensity: val }); void get().syncToCloud(); },
      setFogOfWar: (val) => { set({ fogOfWar: val }); void get().syncToCloud(); },
      setShowCircuitPaths: (val) => { set({ showCircuitPaths: val }); void get().syncToCloud(); },
      setKnowledgeCheckFrequency: (freq) => { set({ knowledgeCheckFrequency: freq }); void get().syncToCloud(); },
      setLastKnowledgeCheckDate: (date) => { set({ lastKnowledgeCheckDate: date }); void get().syncToCloud(); },

      setSelectedWords: (words) => set({ selectedWords: words }),
      addWordToSelection: (word) => set((state) => ({ selectedWords: [...state.selectedWords, word] })),
      removeWordFromSelection: (word) => set((state) => {
        const index = state.selectedWords.indexOf(word);
        if (index === -1) return state;
        const newSelected = [...state.selectedWords];
        newSelected.splice(index, 1);
        return { selectedWords: newSelected };
      }),
      toggleWordSelection: (word) => set((state) => {
        const index = state.selectedWords.indexOf(word);
        if (index === -1) {
          return { selectedWords: [...state.selectedWords, word] };
        } else {
          const newSelected = [...state.selectedWords];
          newSelected.splice(index, 1);
          return { selectedWords: newSelected };
        }
      }),

      setLessonFilter: (wordIds) => set({ lessonFilter: wordIds }),

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

      switchProfile: (name: string) => {
        set({
          studentName: name,
          profile: { firstName: name, lastName: '', tpName: '', difficulty: 'Beginner', interests: [], age: '', locationString: '', sex: '', history: [] },
          lore: [],
          reviewVibe: null,
          profileImage: '',
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: mappedVocabulary,
          curriculums: curriculumRoadmap,
          hasCompletedSetup: false,
          currentPositionNodeId: 'phi_sim',
          isMainProfile: false,
        });
      },

      updateVocabAIContent: (wordId, content) => {
        set((state) => ({
          vocabulary: state.vocabulary.map(v => (v.id === wordId || v.word === wordId) ? { ...v, ...content } : v)
        }));
        void get().syncToCloud();
      },

      syncToCloud: async (explicitUserId) => {
        const { vocabulary, curriculums, lastUpdated, studentName, profile, lore, profileImage, savedPhrases, currentStreak, lastActiveDate, userId, hasCompletedSetup, currentPositionNodeId, isMainProfile, widgetDensity, fogOfWar, showCircuitPaths, knowledgeCheckFrequency, lastKnowledgeCheckDate, cloudSynced } = get();
        const targetId = explicitUserId || userId;

        // Block premature syncs before cloud data has loaded — prevents stale
        // localStorage data from overwriting Firestore during the auth race window
        if (!cloudSynced && !explicitUserId) return;

        // Prevent sync for guest users and any non-main profile (Sandbox mode)
        if (!targetId || targetId === 'guest_user' || !isMainProfile) return;

        // NEW: Also check explicit sandbox mode toggle
        if (localStorage.getItem('tp_sandbox_mode') === 'true') return;

        try {
          // Strip static content before sending to Firestore
          const partialVocab = vocabulary.map(w => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { 
              phonetic, syllables, anchor, semanticCluster, connotation, 
              roles, examples, collocations, relatedWordIds, boundaryNotes, 
              etymology, mnemonic, culturalNotes, avoidWhen, 
              ...dynamicData 
            } = w;
            return dynamicData;
          });

          await setDoc(doc(db, 'users', targetId), {
            vocabulary: partialVocab,
            curriculums, lastUpdated, studentName, profile, lore, profileImage,
            savedPhrases, currentStreak, lastActiveDate, hasCompletedSetup, currentPositionNodeId, isMainProfile,
            widgetDensity, fogOfWar, showCircuitPaths, knowledgeCheckFrequency, lastKnowledgeCheckDate
          }, { merge: true });
        } catch (err) {
          console.error('Firebase Sync Error:', err);
        }
      },

      syncFromCloud: async (uid: string, initialName?: string, initialProfileImage?: string) => {
        set({ userId: uid, cloudSynced: false });
        if (uid === 'guest_user') return;
        
        const userDocRef = doc(db, 'users', uid);
        
        try {
          const docSnap = await getDoc(userDocRef);
          
          if (!docSnap.exists()) {
            const localName = get().studentName;
            const isOtherUsersData = initialName && localName &&
              localName !== 'Anthony' &&
              localName.toLowerCase() !== initialName.toLowerCase();

            if (isOtherUsersData) {
              // Local data belongs to a different user — start fresh for this account
              set({
                studentName: initialName,
                profile: { firstName: initialName, lastName: '', tpName: '', difficulty: 'Beginner', interests: [], age: '', locationString: '', sex: '', history: [] },
                lore: [],
                profileImage: initialProfileImage || '',
                savedPhrases: [],
                currentStreak: 0,
                lastActiveDate: '',
                vocabulary: mappedVocabulary,
                curriculums: curriculumRoadmap,
                currentPositionNodeId: 'phi_sim',
                hasCompletedSetup: false,
              });
            } else {
              if (initialName && (localName === 'Anthony' || !localName)) {
                set({ studentName: initialName });
                get().updateProfile({ firstName: initialName });
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
          }
        } catch (err) {
          console.error('Error checking for migration:', err);
        } finally {
          // Unblock syncToCloud now that the initial Firestore check is complete
          set({ cloudSynced: true });
        }

        return onSnapshot(userDocRef, (snapshot) => {
          if (!snapshot.exists()) return;
          const data = snapshot.data();

          // Detect contaminated cloud data: a different name + all vocab mastered
          // indicates test/debug data was accidentally synced to this account
          const cloudName = data.studentName as string | undefined;
          const allVocabMastered = Array.isArray(data.vocabulary) &&
            data.vocabulary.length > 0 &&
            (data.vocabulary as any[]).every((w) => w.status === 'mastered');
          const nameMismatch = initialName && cloudName &&
            cloudName.toLowerCase() !== initialName.toLowerCase();

          if (nameMismatch && allVocabMastered) {
            set({
              studentName: initialName,
              profile: { firstName: initialName, lastName: '', tpName: '', difficulty: 'Beginner', interests: [], age: '', locationString: '', sex: '', history: [] },
              lore: [],
              profileImage: initialProfileImage || '',
              savedPhrases: [],
              currentStreak: 0,
              lastActiveDate: '',
              vocabulary: mappedVocabulary,
              curriculums: curriculumRoadmap,
              currentPositionNodeId: 'phi_sim',
              hasCompletedSetup: false,
              cloudSynced: true,
            });
            void get().syncToCloud(uid);
            return;
          }

          const vocabulary = (data.vocabulary || mappedVocabulary).map(
            (w: any) => {
              const base = mappedVocabulary.find(iv => iv.word === w.word);
              const staticData = vocabContent[w.word] || {};
              const useCount = typeof w.useCount === 'number' ? w.useCount : 0;
              const frequencyRank = typeof w.frequencyRank === 'number' ? w.frequencyRank : (base?.frequencyRank ?? 999);
              const type = w.type || (base?.type ?? 'word');
              
              let sessionNotes = w.sessionNotes || '';
              let meanings = w.meanings || (base?.meanings ?? '');

              // DATA MIGRATION: If meanings is missing/generic and sessionNotes contains definition-like text
              if ((!meanings || meanings === '') && sessionNotes.includes('.')) {
                const parts = sessionNotes.split('.');
                const firstPart = parts[0].trim();
                // Check if the first part looks like a dictionary definition (no "Study Session" or "Learning" keywords)
                if (!firstPart.match(/session|improvement|accuracy|mastery|learned/i)) {
                   meanings = firstPart;
                   sessionNotes = parts.slice(1).join('.').trim();
                }
              }

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
                meanings,
                sessionNotes,
                partOfSpeech: w.partOfSpeech || (base?.partOfSpeech ?? ''),
                partOfSpeechScores: w.partOfSpeechScores || { noun: 0, verb: 0, modifier: 0 },
                lastReviewed: w.lastReviewed || new Date().toISOString(),
                scoreHistory: w.scoreHistory || [],

                // Always hydrate from ground truth in code
                phonetic: staticData.phonetic || '',
                syllables: staticData.syllables || [],
                anchor: staticData.anchor || '',
                semanticCluster: staticData.semanticCluster || [],
                connotation: staticData.connotation || 'neutral',
                roles: staticData.roles || [],
                examples: staticData.examples || [],
                collocations: staticData.collocations || [],
                relatedWordIds: staticData.relatedWordIds || [],
                boundaryNotes: staticData.boundaryNotes || [],
                etymology: staticData.etymology || '',
                mnemonic: staticData.mnemonic || '',
                // User fields should remain as loaded from data
                userMnemonic: w.userMnemonic || '',
                userNotes: w.userNotes || '',
                culturalNotes: staticData.culturalNotes || '',
                avoidWhen: staticData.avoidWhen || '',
                rolesMastered: w.rolesMastered || {},
                hardened: !!w.hardened,
                isBleeding: !!w.isBleeding
              };
            }
          );

          // Merge static curriculum content (richContent, etc.) with stored status
          const mergedCurriculums = curriculumRoadmap.map(staticLevel => {
            const storedLevel = (data.curriculums || []).find((l: any) => l.id === staticLevel.id);
            return {
              ...staticLevel,
              nodes: staticLevel.nodes.map(staticNode => {
                const storedNode = (storedLevel?.nodes || []).find((n: any) => n.id === staticNode.id);
                return {
                  ...staticNode,
                  status: storedNode?.status || staticNode.status
                };
              })
            };
          });

          // Build the patch incrementally so empty/missing fields in the
          // cloud doc don't clobber local state (e.g. a fresh Firestore doc
          // would otherwise reset studentName back to "Anthony" and wipe the
          // profileImage on every snapshot).
          const update: Partial<MasteryState> = {
            cloudSynced: true,
            vocabulary,
            curriculums: mergedCurriculums,
            lastUpdated: data.lastUpdated || '',
            lore: data.lore || [],
            savedPhrases: data.savedPhrases || [],
            currentStreak: data.currentStreak || 0,
            lastActiveDate: data.lastActiveDate || '',
            hasCompletedSetup: data.hasCompletedSetup || false,
            currentPositionNodeId: data.currentPositionNodeId || 'phi_sim',
            isMainProfile: data.isMainProfile !== undefined ? data.isMainProfile : true,
            widgetDensity: data.widgetDensity || 'Expanded',
            fogOfWar: data.fogOfWar || 'Visible',
            showCircuitPaths: data.showCircuitPaths !== undefined ? data.showCircuitPaths : true,
            knowledgeCheckFrequency: data.knowledgeCheckFrequency || 'session',
            lastKnowledgeCheckDate: data.lastKnowledgeCheckDate || '',
          };

          if (data.studentName) update.studentName = data.studentName;
          if (data.profileImage) update.profileImage = data.profileImage;
          if (data.profile) update.profile = data.profile;

          set(update);
          get().refreshCurriculumStatus();
        });
      },
    }),
    { 
      name: 'tp-tutor-mastery',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { userId, cloudSynced, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Merge static content on rehydration
          const mergedCurriculums = curriculumRoadmap.map(staticLevel => {
            const storedLevel = (state.curriculums || []).find((l: any) => l.id === staticLevel.id);
            return {
              ...staticLevel,
              nodes: staticLevel.nodes.map(staticNode => {
                const storedNode = (storedLevel?.nodes || []).find((n: any) => n.id === staticNode.id);
                return {
                  ...staticNode,
                  status: storedNode?.status || staticNode.status
                };
              })
            };
          });
          state.curriculums = mergedCurriculums;
          state.refreshCurriculumStatus();
        }
      }
    }
  )
);
