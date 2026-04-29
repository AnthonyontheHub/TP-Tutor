/* src/store/masteryStore.ts */
import { db } from '../services/firebase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import {
  type MasteryStatus, type VocabWord, type StatusSummary, type SavedPhrase,
  type UserProfile, type ReviewVibe,
  type CurriculumLevel, type NodeStatus, type CommonPhrase, type PosRole,
  type SmallRank, type CeremonialRank, type Badge, SMALL_RANKS,
  CEREMONIAL_RANKS, ALL_BADGES, type SessionLogEntry, type WeeklyChallenge,
  type Album
} from '../types/mastery';
import { scoreToStatus, STATUS_MIDPOINT } from '../types/mastery';
import { initialMasteryMap } from '../data/initialMasteryMap';
import { curriculumRoadmap } from '../data/curriculum';
import { vocabContent } from '../data/vocabContent';
import { albumData } from '../data/albumData';
import { TOKI_PONA_DICTIONARY, WORD_FREQUENCY } from '../data/tokiPonaDictionary';

function toFullVocabWord(v: { word: string; partOfSpeech?: string; status: MasteryStatus; type: 'word' | 'grammar'; sessionNotes: string; frequencyRank?: number; weight?: 'pillar' | 'working' | 'bonus' }): VocabWord {
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
    weight: v.weight,
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
    userNotes: '',
    notes: '',
    customDefinition: ''
  };
}

const mappedVocabulary: VocabWord[] = initialMasteryMap.initialVocabulary.map(toFullVocabWord);

const defaultSongs: Album[] = [
  {
    id: "utala-kon",
    title: "utala kon",
    songs: [
      { id: "wawa-kama", title: "01 wawa kama", blocks: [
        { title: "Verse 1", tp: "mi tawa / mi tawa / mi tawa lon nasin / nasin li pini", en: "I go / I go / I go on the path / The path ends" },
        { title: "Chorus", tp: "ona li lon / pini li kama / mi ken ala pini e tawa", en: "It is here / The end is coming / I cannot stop the movement" }
      ]},
      { id: "nasin-li-ken-ala", title: "02 nasin li ken ala", blocks: [
        { title: "Chorus", tp: "nasin li ken ala", en: "The path is not possible" }
      ]},
      { id: "pini-li-kama", title: "03 pini li kama", blocks: [] },
      { id: "toki-ike", title: "04 toki ike", blocks: [] },
      { id: "lukin-moli", title: "05 lukin moli", blocks: [] },
      { id: "mi-olin-e-ike", title: "06 mi olin e ike", blocks: [] },
      { id: "mi-awen-lon-ni", title: "07 mi awen lon ni", blocks: [] },
      { id: "pini-ala", title: "08 pini ala", blocks: [] }
    ]
  },
  ...albumData
];

const defaultCommonPhrases = [
  { category: "GREETINGS", tp: "toki!", en: "Hello / Hi" },
  { category: "GREETINGS", tp: "sina pilin seme?", en: "How are you?" },
  { category: "GREETINGS", tp: "mi tawa", en: "Goodbye (I am leaving)" },
  { category: "SOCIAL", tp: "nimi mi li jan User", en: "My name is User" },
  { category: "SOCIAL", tp: "mi kama sona e toki pona", en: "I'm learning Toki Pona" },
  { category: "POLITE", tp: "sina pona", en: "Thank you / You are good" },
  { category: "POLITE", tp: "mi pakala", en: "I'm sorry / I messed up" },
  { category: "POLITE", tp: "ale li pona", en: "Everything is good" },
  { category: "FEELINGS", tp: "mi pilin pona", en: "I feel good / happy" },
  { category: "FEELINGS", tp: "mi pilin seli", en: "I feel hot / angry" }
];

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
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  setReviewVibe: (vibe: ReviewVibe) => Promise<void>;
  setProfileImage: (url: string) => Promise<void>;
  updatePhraseNote: (id: string, notes: string) => Promise<void>;
  deletePhrase: (id: string) => Promise<void>;
  resetAsNewUser: () => Promise<void>;
  resetProfileAndRunSetup: () => Promise<void>;
  randomizeVocab: () => Promise<void>;
  masterAllVocab: () => Promise<void>;
  clearLocalData: () => void;
  syncFromCloud: (userId: string, initialName?: string, initialProfileImage?: string) => Promise<Unsubscribe | void>;
  syncToCloud: (userId?: string, merge?: boolean, force?: boolean) => Promise<void>;
  getStatusSummary: () => StatusSummary & { xp: number; level: number; rankTitle: string };
  setHasCompletedSetup: (val: boolean) => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
  awardBadge: (badgeId: string) => void;
  checkAndAwardRanks: () => void;
  clearNewRankUnlocked: () => void;
  updateSessionXPRecord: (xp: number) => void;
  refreshCurriculumStatus: () => void;
  setWidgetDensity: (val: 'Compact' | 'Expanded') => void;
  setFogOfWar: (val: 'Strict' | 'Visible') => void;
  setShowCircuitPaths: (val: boolean) => void;
  setKnowledgeCheckFrequency: (freq: 'daily' | 'session' | 'never') => Promise<void>;
  setLastKnowledgeCheckDate: (date: string) => Promise<void>;
  setSelectedWords: (words: string[]) => void;
  addWordToSelection: (word: string) => void;
  removeWordFromSelection: (word: string) => void;
  toggleWordSelection: (word: string) => void;
  setLessonFilter: (wordIds: string[] | null) => void;
  hardenWord: (wordId: string) => Promise<void>;
  clearAllSavedPhrases: () => Promise<void>;
  checkAssessments: (onTrigger: (word: VocabWord) => void) => void;
  switchProfile: (name: string) => void;
  updateVocabAIContent: (wordId: string, content: { aiExplanation?: string; aiExamples?: Record<string, string> }) => void;
  updateSessionNotes: (wordId: string, notes: string) => void;

  // Feature 5
  recordLearningDay: (date: string) => void;
  runMorningStreakCheck: () => boolean;

  // Feature 6
  recordWordOutcome: (wordId: string, outcome: 'correct' | 'struggled', date: string) => void;
  getRegressionCandidates: (windowDays: number) => string[];

  // Feature 7
  recordConfusion: (wordA: string, wordB: string) => void;
  getTopConfusionPairs: (limit: number) => { wordA: string, wordB: string, count: number }[];
  completeIntroduction: (introId: string) => void;

  // Feature 8
  updateProductionStatus: (wordId: string, status: MasteryStatus) => void;
  updateRecognitionStatus: (wordId: string, status: MasteryStatus) => void;

  // Feature 10
  addProveItResponse: (entry: { word: string, sentence: string, date: string }) => void;
  clearProveItResponses: () => void;

  // Feature 11
  setPinnedExample: (wordId: string, example: string) => void;
  markRoleMastered: (wordId: string, role: PosRole) => void;
  resetLearningProgress: () => Promise<void>;
  completeNode: (nodeId: string) => void;
  checkNodeReadiness: (nodeId: string) => boolean;
  getNodeReadinessPercentage: (nodeId: string) => number;
  recordActivityCompletion: (nodeId: string, activityId: string, stats?: { score: number, total: number }) => void;
  setActiveActivity: (act: { type: string, nodeId: string } | null) => void;
  recordInsight: (label: string, change: number) => void;

  // Prompt C Actions
  startSessionTimer: () => void;
  commitSessionLog: (entry: Omit<SessionLogEntry, 'id' | 'durationMinutes'>) => void;
  generateWeeklyChallenge: () => void;
  progressChallenge: (amount?: number, type?: WeeklyChallenge['type'], wordId?: string) => void;
  clearRankAcknowledgement: () => void;
}

interface MasteryState {
  userId: string | null;
  studentName: string;
  profile: UserProfile;
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
  activeCurriculumId: string | null;
  activeModuleId: string | null;
  selectedWords: string[];
  lessonFilter: string[] | null;
  activeActivity: { type: string, nodeId: string } | null;
  isMainProfile: boolean;
  cloudSynced: boolean;
  songs: Album[];
  commonPhrases: CommonPhrase[];
  // Dashboard settings
  widgetDensity: 'Compact' | 'Expanded';
  fogOfWar: 'Strict' | 'Visible';
  showCircuitPaths: boolean;
  knowledgeCheckFrequency: 'daily' | 'session' | 'never';
  lastKnowledgeCheckDate: string;

  // New Features
  completedActivities: Record<string, { id: string, stats?: { score: number, total: number } }[]>;
  lastStreakCheck: string;
  learningDays: string[];
  completedNodeIds: string[];
  seenIntroductions: string[];
  confusionPairs: { wordA: string, wordB: string, count: number }[];
  pendingProveItResponses: { word: string, sentence: string, date: string }[];
  earnedCeremonialRanks: CeremonialRank[];
  newRankUnlocked: SmallRank | CeremonialRank | null;
  lastSmallRankTitle: string;
  earnedBadges: Badge[];
  totalProveItSubmitted: number;
  streakShields: number;
  xpMultiplier: number;
  lastStreakMilestone: number;
  pendingComebackBonus: boolean;
  sessionXPRecord: number;
  masteryHistory: MasteryEvent[];

  // Prompt C State
  sessionLog: SessionLogEntry[];
  sessionStartTime: string;
  currentChallenge: WeeklyChallenge | null;
  completedChallenges: WeeklyChallenge[];
  pendingRankAcknowledgement: string | null;
}

type MasteryStore = MasteryState & MasteryActions;

const STATUS_ORDER: MasteryStatus[] = ['not_started', 'introduced', 'practicing', 'confident', 'mastered'];
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const defaultProfile: UserProfile = {
  firstName: '',
  lastName: '',
  tpName: '',
  difficulty: 'Beginner',
  interests: [],
  history: [],
  
  age: '',
  sex: null,
  locationString: '',
  
  // Personality
  mbti: '',
  enneagram: '',
  bigFiveOpenness: null,
  bigFiveConscientiousness: null,
  bigFiveExtraversion: null,
  bigFiveAgreeableness: null,
  bigFiveNeuroticism: null,
  attachmentStyle: '',

  // Beliefs
  religion: '',
  religionOther: '',
  politicalIdentity: [],
  politicalIdentityOther: '',

  // Health
  bloodType: '',
  dietPattern: '',
  workoutStyle: '',
  activityLevel: '',
  chronicConditions: '',

  // Media
  bookGenres: [],
  tvGenres: [],
  musicGenres: [],
  gamingGenres: [],
  gamingPlatforms: [],

  // Daily Life
  chronotype: '',
  workSchedule: '',
  livingSituation: '',
  socialPreference: '',
};

export const useMasteryStore = create<MasteryStore>()(
  persist(
    (set, get) => ({
      userId: null,
      studentName: '',
      profile: defaultProfile,
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
          activeCurriculumId: null,
          activeModuleId: null,
      selectedWords: [],
      lessonFilter: null,
      activeActivity: null,
      widgetDensity: 'Expanded',
      isMainProfile: true,
      fogOfWar: 'Visible',
      showCircuitPaths: true,
      knowledgeCheckFrequency: 'session',
      lastKnowledgeCheckDate: '',
      cloudSynced: false,
      commonPhrases: defaultCommonPhrases,
      songs: defaultSongs,

      // New Features Defaults
      completedActivities: {},
      lastStreakCheck: '',
      learningDays: [],
      completedNodeIds: [],
      seenIntroductions: [],
      confusionPairs: [],
      pendingProveItResponses: [],
      earnedCeremonialRanks: [],
      newRankUnlocked: null,
      lastSmallRankTitle: 'jan lili',
      earnedBadges: [],
      totalProveItSubmitted: 0,
      streakShields: 0,
      xpMultiplier: 1.0,
      lastStreakMilestone: 0,
      pendingComebackBonus: false,
      sessionXPRecord: 0,
      masteryHistory: [],

      // Prompt C Defaults
      sessionLog: [],
      sessionStartTime: '',
      currentChallenge: null,
      completedChallenges: [],
      pendingRankAcknowledgement: null,

      setHasCompletedSetup: (val) => { set({ hasCompletedSetup: val }); void get().syncToCloud(); },

      refreshCurriculumStatus: () => {
        set((state) => {
          let lastNodeMastery = 0; // Conceptual nodes stay active until sign-off

          const newCurriculums = state.curriculums.map((level, lIdx) => ({
            ...level,
            nodes: level.nodes.map((node, nIdx) => {
              const allReqs = [...node.requiredVocabIds, ...node.requiredGrammarIds];
              const vocabReqs = state.vocabulary.filter(v => allReqs.includes(v.id) || allReqs.includes(v.word));
              
              const avgScore = vocabReqs.length > 0 
                ? vocabReqs.reduce((acc, v) => acc + v.baseScore, 0) / vocabReqs.length 
                : (isFinite(lastNodeMastery) ? lastNodeMastery : 0);

              const isMastered = 
                state.completedNodeIds.includes(node.id) ||
                (vocabReqs.length > 0 && vocabReqs.every(v => v.status === 'mastered')) || 
                (vocabReqs.length === 0 && lastNodeMastery >= 950 && nIdx > 0);

              const isUnlocked = lastNodeMastery > 700 || (lIdx === 0 && nIdx === 0);

              let newStatus: NodeStatus = 'locked';
              if (isMastered) newStatus = 'mastered';
              else if (isUnlocked) newStatus = 'active';

              // Activity Mapping Logic
              let activities = node.activities || [];
              if (node.id === 'phi_sim') {
                activities = ['true-false', 'thought-translation'];
              } else if (node.id === 'vowels') {
                activities = ['word-scramble', 'drag-drop'];
              } else if (node.id === 'consonants') {
                activities = ['word-scramble'];
              } else if ((allReqs.length > 0 || node.type === 'Drill' || node.type === 'Checkpoint') && !activities.includes('word-scramble')) {
                // Ensure nodes with vocab/grammar requirements have word-scramble
                activities = [...new Set([...activities, 'word-scramble'])];
              }

              lastNodeMastery = isMastered ? 1000 : avgScore;

              return { ...node, status: newStatus, activities };
            })
          }));
          const allNodes = newCurriculums.flatMap(l => l.nodes);
          const firstActive = allNodes.find(n => n.status === 'active')?.id || state.currentPositionNodeId;

          return { curriculums: newCurriculums, currentPositionNodeId: firstActive };
        });
      },

      completeNode: (nodeId) => {
        set((state) => ({
          completedNodeIds: [...new Set([...state.completedNodeIds, nodeId])]
        }));
        get().refreshCurriculumStatus();
        void get().syncToCloud();
      },

      checkNodeReadiness: (nodeId) => {
        return get().getNodeReadinessPercentage(nodeId) >= 100;
      },

      getNodeReadinessPercentage: (nodeId) => {
        const { vocabulary, curriculums, completedActivities } = get();
        const node = curriculums.flatMap(l => l.nodes).find(n => n.id === nodeId);
        if (!node) return 0;

        const allReqs = [...node.requiredVocabIds, ...node.requiredGrammarIds];
        const words = vocabulary.filter(v => allReqs.includes(v.id) || allReqs.includes(v.word));

        const pillars = words.filter(v => v.weight === 'pillar');
        const working = words.filter(v => v.weight === 'working');

        const getStatusWeight = (status: string) => {
          switch(status) {
            case 'mastered': return 10;
            case 'confident': return 10;
            case 'practicing': return 5;
            case 'introduced': return 2;
            default: return 0;
          }
        };

        let currentPoints = 0;
        let maxPoints = 0;

        pillars.forEach(v => {
          maxPoints += 20; // 2 * 10
          currentPoints += 2 * getStatusWeight(v.status);
        });

        working.forEach(v => {
          maxPoints += 10; // 1 * 10
          currentPoints += 1 * getStatusWeight(v.status);
        });

        let basePercentage = 0;
        if (maxPoints > 0) {
          basePercentage = (currentPoints / maxPoints) * 100;
        } else {
          basePercentage = node.status === 'mastered' ? 100 : 0;
        }

        const nodeActivities = node.activities || [];
        let activityBonus = 0;
        if (nodeActivities.length > 0) {
          const completions = completedActivities[nodeId] || [];
          const slicePerActivity = 30 / nodeActivities.length;

          nodeActivities.forEach(actId => {
            const record = completions.find(c => c.id === actId);
            if (record) {
              if (record.stats) {
                // Award based on accuracy: (score/total) * slice
                const accuracy = record.stats.total > 0 ? (record.stats.score / record.stats.total) : 1;
                activityBonus += accuracy * slicePerActivity;
              } else {
                activityBonus += slicePerActivity;
              }
            }
          });
        }
        
        return Math.min(100, Math.round(basePercentage * 0.7 + activityBonus));
      },

      recordActivityCompletion: (nodeId, activityId, stats) => {
        set((state) => {
          const current = state.completedActivities[nodeId] || [];
          const existingIdx = current.findIndex(a => a.id === activityId);
          
          let updated;
          if (existingIdx !== -1) {
            updated = [...current];
            const prev = updated[existingIdx];
            const newAccuracy = stats ? (stats.score / stats.total) : 1;
            const oldAccuracy = prev.stats ? (prev.stats.score / prev.stats.total) : (prev ? 1 : 0);
            
            if (newAccuracy >= oldAccuracy) {
              updated[existingIdx] = { id: activityId, stats };
            }
          } else {
            updated = [...current, { id: activityId, stats }];
          }

          const newState = {
            completedActivities: {
              ...state.completedActivities,
              [nodeId]: updated
            }
          };

          if (stats) {
            const insightEntry = {
              label: activityId.toUpperCase().replace('-', ' '),
              change: Math.round(stats.score),
              timestamp: new Date().toISOString()
            };
            (newState as any).masteryHistory = [insightEntry, ...(state.masteryHistory || [])].slice(0, 50);
          }

          return newState;
        });
        get().refreshCurriculumStatus();
        void get().syncToCloud();
      },

      setActiveActivity: (act) => set({ activeActivity: act }),

      recordInsight: (label, change) => set(state => ({
        masteryHistory: [{ label, change, timestamp: new Date().toISOString() }, ...(state.masteryHistory || [])].slice(0, 50)
      })),

      applyScoreUpdate: (nodeId, points, context) => {
        const now = new Date().toISOString();
        set((state) => {
          const vocab = state.vocabulary.map((w) => {
            if (w.id !== nodeId && w.word.toLowerCase() !== nodeId.toLowerCase()) return w;
            const newScore = clamp(w.baseScore + points, 0, 1000);
            const historyEntry = { date: now, change: points, reason: context };
            
            const recentDrops = [historyEntry, ...(w.scoreHistory || [])]
              .filter(h => h.change < 0 && (new Date(now).getTime() - new Date(h.date).getTime() < 48 * 3600000));
            const totalDrop = Math.abs(recentDrops.reduce((acc, h) => acc + h.change, 0));
            const isBleeding = totalDrop > 50;

            return {
              ...w,
              baseScore: newScore,
              confidenceScore: newScore,
              status: scoreToStatus(newScore),
              lastReviewed: now,
              scoreHistory: [historyEntry, ...(w.scoreHistory || [])].slice(0, 5),
              useCount: w.useCount + 1,
              isBleeding
            };
          });

          const insightEntry = {
            label: nodeId.toUpperCase(),
            change: points,
            timestamp: now
          };

          return {
            vocabulary: vocab,
            masteryHistory: [insightEntry, ...(state.masteryHistory || [])].slice(0, 50)
          };
        });
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

      hardenWord: async (wordId) => {
        set(state => ({
          vocabulary: state.vocabulary.map(w => (w.id === wordId || w.word === wordId) ? { ...w, hardened: true, baseScore: 1000, status: 'mastered' } : w)
        }));
        get().awardBadge('first_hardened');
        await get().syncToCloud();
      },

      clearAllSavedPhrases: async () => {
        set({ savedPhrases: [] });
        await get().syncToCloud();
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
        const { xpMultiplier, pendingComebackBonus } = get();
        let comebackApplied = false;
        let totalXPChange = 0;

        set((state) => {
          const updatedVocab = state.vocabulary.map((w, idx) => {
            const d = deltas.find(
              (delta) =>
                delta.wordId === w.id ||
                delta.wordId.toLowerCase() === w.word.toLowerCase()
            );
            if (!d) return w;
            
            const multiplier = WORD_FREQUENCY[w.word.toLowerCase()] ?? 1.0;
            let effectiveDelta = d.delta * multiplier;
            
            if (effectiveDelta > 0) {
              effectiveDelta *= xpMultiplier;
            }

            if (pendingComebackBonus && !comebackApplied) {
               effectiveDelta += 100;
               comebackApplied = true;
            }

            totalXPChange += effectiveDelta;

            const newScore = clamp((w.baseScore ?? 0) + effectiveDelta, 0, 1000);
            const historyReason = (pendingComebackBonus && idx === 0) ? 'manual_delta + comeback_bonus' : 'manual_delta';
            
            const newStatus = scoreToStatus(newScore);
            if (newStatus === 'mastered' && w.status !== 'mastered') {
               setTimeout(() => get().awardBadge('first_master'), 0);
            }
            if (newStatus === 'practicing' && w.status === 'introduced') {
               setTimeout(() => get().progressChallenge(1, 'word_progression'), 0);
            }

            return {
              ...w,
              baseScore: newScore,
              confidenceScore: newScore,
              status: newStatus,
              useCount: (w.useCount ?? 0) + 1,
              lastReviewed: now,
              scoreHistory: [{ date: now, change: effectiveDelta, reason: historyReason }, ...(w.scoreHistory || [])].slice(0, 5)
            };
          });

          const insightEntry = {
            label: deltas.length === 1 ? deltas[0].wordId.toUpperCase() : "SESSION INSIGHTS",
            change: Math.round(totalXPChange),
            timestamp: now
          };

          return {
            vocabulary: updatedVocab,
            masteryHistory: [insightEntry, ...(state.masteryHistory || [])].slice(0, 50),
            pendingComebackBonus: false
          };
        });

        if (comebackApplied) {
          get().awardBadge('comeback');
        }

        get().refreshCurriculumStatus();
        get().recordActivity();
        void get().syncToCloud();
      },

      updateVocabStatus: (wordIdOrText, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordIdOrText && w.word.toLowerCase() !== wordIdOrText.toLowerCase()) return w;
            
            if (status === 'practicing' && w.status === 'introduced') {
              setTimeout(() => get().progressChallenge(1, 'word_progression'), 0);
            }

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
        get().progressChallenge(1, 'phrase_save');
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

      recordLearningDay: (date) => {
        set((state) => {
          if (state.learningDays.includes(date)) return state;
          return { learningDays: [...state.learningDays, date] };
        });
        void get().syncToCloud();
      },
      runMorningStreakCheck: () => {
        const today = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        let wasActiveYesterday = false;

        set((state) => {
          if (state.lastStreakCheck === today) {
            wasActiveYesterday = state.learningDays.includes(yesterday);
            return state; // Already checked today
          }

          wasActiveYesterday = state.learningDays.includes(yesterday);
          let newStreak = state.currentStreak;
          let newShields = state.streakShields;
          let newLastStreakMilestone = state.lastStreakMilestone;
          let newPendingComebackBonus = state.pendingComebackBonus;
          let shieldWasUsed = false;

          if (wasActiveYesterday) {
            newStreak += 1;
            
            // Award shield every 7 days
            if (newStreak > 0 && newStreak % 7 === 0 && newStreak > newLastStreakMilestone) {
              if (newShields < 2) newShields += 1;
              newLastStreakMilestone = newStreak;
            }
          } else {
            // Missed a day
            if (newShields > 0) {
              newShields -= 1;
              shieldWasUsed = true;
              // Streak maintained by shield
            } else {
              // Comeback bonus check
              if (newStreak >= 3) {
                newPendingComebackBonus = true;
              }
              newStreak = 0;
            }
          }

          // Recalculate Multiplier
          let newMultiplier = 1.0;
          if (newStreak >= 30) newMultiplier = 1.75;
          else if (newStreak >= 14) newMultiplier = 1.50;
          else if (newStreak >= 7) newMultiplier = 1.25;
          else if (newStreak >= 3) newMultiplier = 1.10;

          return { 
            lastStreakCheck: today, 
            currentStreak: newStreak,
            streakShields: newShields,
            lastStreakMilestone: newLastStreakMilestone,
            xpMultiplier: newMultiplier,
            pendingComebackBonus: newPendingComebackBonus
          };
        });
        get().generateWeeklyChallenge();
        void get().syncToCloud();
        return wasActiveYesterday;
      },
      recordWordOutcome: (wordId, outcome, date) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId && w.word.toLowerCase() !== wordId.toLowerCase()) return w;
            const recentPerformance = [{ date, outcome }, ...(w.recentPerformance || [])].slice(0, 10);
            return { ...w, recentPerformance };
          })
        }));
        void get().syncToCloud();
      },
      getRegressionCandidates: (windowDays) => {
        const { vocabulary } = get();
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - windowDays);
        const limitTime = limitDate.getTime();

        const candidates: { word: string, ratio: number }[] = [];

        vocabulary.forEach(w => {
          if (!w.recentPerformance) return;
          const windowEntries = w.recentPerformance.filter(e => new Date(e.date).getTime() >= limitTime);
          if (windowEntries.length === 0) return;

          const struggledCount = windowEntries.filter(e => e.outcome === 'struggled').length;
          const correctCount = windowEntries.filter(e => e.outcome === 'correct').length;

          if (struggledCount > correctCount) {
            candidates.push({ word: w.word, ratio: struggledCount / windowEntries.length });
          }
        });

        return candidates.sort((a, b) => b.ratio - a.ratio).map(c => c.word);
      },
      recordConfusion: (wordA, wordB) => {
        set((state) => {
          const pairs = [...state.confusionPairs];
          const a = wordA.toLowerCase();
          const b = wordB.toLowerCase();
          const existing = pairs.find(p => 
            (p.wordA.toLowerCase() === a && p.wordB.toLowerCase() === b) || 
            (p.wordA.toLowerCase() === b && p.wordB.toLowerCase() === a)
          );
          if (existing) {
            existing.count += 1;
          } else {
            pairs.push({ wordA, wordB, count: 1 });
          }
          return { confusionPairs: pairs };
        });
        void get().syncToCloud();
      },
      getTopConfusionPairs: (limit) => {
        const pairs = [...get().confusionPairs];
        return pairs.sort((a, b) => b.count - a.count).slice(0, limit);
      },
      completeIntroduction: (introId) => {
        set((state) => ({
          seenIntroductions: [...new Set([...state.seenIntroductions, introId])]
        }));
        void get().syncToCloud();
      },
      updateProductionStatus: (wordId, status) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId && w.word.toLowerCase() !== wordId.toLowerCase()) return w;
            return { ...w, productionStatus: status };
          })
        }));
        void get().syncToCloud();
      },
      updateRecognitionStatus: (wordId, status) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId && w.word.toLowerCase() !== wordId.toLowerCase()) return w;
            return { ...w, recognitionStatus: status };
          })
        }));
        void get().syncToCloud();
      },
      addProveItResponse: (entry) => {
        set((state) => {
          const total = state.totalProveItSubmitted + 1;
          if (total === 5) {
            // awardBadge will handle firestore sync
            setTimeout(() => get().awardBadge('prove_it_5'), 0);
          }
          return { 
            pendingProveItResponses: [...state.pendingProveItResponses, entry],
            totalProveItSubmitted: total
          };
        });
        get().progressChallenge(1, 'prove_it_usage', entry.word);
        void get().syncToCloud();
      },
      awardBadge: (badgeId) => {
        const badge = ALL_BADGES.find(b => b.id === badgeId);
        if (!badge) return;

        set((state) => {
          if (state.earnedBadges.some(b => b.id === badgeId)) return state;
          const newBadge = { ...badge, earnedDate: new Date().toISOString() };
          return { earnedBadges: [...state.earnedBadges, newBadge] };
        });
        void get().syncToCloud();
      },
      checkAndAwardRanks: () => {
        const summary = get().getStatusSummary();
        const { vocabulary, curriculums, currentStreak, earnedCeremonialRanks, lastSmallRankTitle } = get();
        const today = new Date().toISOString();

        // 1. Small Rank
        const currentSmallRank = [...SMALL_RANKS].reverse().find(r => summary.xp >= r.xpThreshold) || SMALL_RANKS[0];
        
        // 2. Ceremonial Ranks
        const newlyEarned: CeremonialRank[] = [];
        
        const checkRank = (id: string, condition: boolean) => {
          if (earnedCeremonialRanks.some(r => r.id === id)) return;
          if (condition) {
            const rank = CEREMONIAL_RANKS.find(r => r.id === id);
            if (rank) newlyEarned.push({ ...rank, achievedDate: today });
          }
        };

        checkRank('initiate', vocabulary.filter(w => w.status === 'mastered').length >= 10);
        checkRank('speaker', vocabulary.filter(w => w.status === 'confident' || w.status === 'mastered').length >= 25);
        
        const ch12Mastered = curriculums
          .filter(c => c.id === 'book_1' || c.id === 'book_2') // Assuming Book 1 & 2 are Chapter 1 & 2
          .every(c => c.nodes.every(n => n.status === 'mastered'));
        checkRank('grammarian', ch12Mastered);
        
        checkRank('sewi_speaker', vocabulary.filter(w => w.status === 'confident' || w.status === 'mastered').length >= 50);
        checkRank('consistent', currentStreak >= 30);
        checkRank('toki_pona_lon', vocabulary.filter(w => w.status === 'confident' || w.status === 'mastered').length >= 137);
        checkRank('jan_sonja', vocabulary.filter(w => w.status === 'mastered').length >= 137);

        // Badges related to ranks
        if (vocabulary.some(w => w.status === 'mastered')) get().awardBadge('first_master');
        if (vocabulary.filter(w => w.status === 'mastered').length >= 10) get().awardBadge('ten_masters');
        if (currentStreak >= 7) get().awardBadge('streak_7');
        if (currentStreak >= 14) get().awardBadge('streak_14');
        if (currentStreak >= 30) get().awardBadge('streak_30');
        if (currentStreak >= 60) get().awardBadge('streak_60');
        if (currentStreak >= 100) get().awardBadge('streak_100');
        if (vocabulary.filter(w => w.status === 'mastered').length >= 137) get().awardBadge('jan_sonja_badge');

        set((state) => {
          const updates: Partial<MasteryState> = {};
          if (newlyEarned.length > 0) {
            updates.earnedCeremonialRanks = [...state.earnedCeremonialRanks, ...newlyEarned];
            updates.newRankUnlocked = newlyEarned[0];
            updates.pendingRankAcknowledgement = newlyEarned[0].title;
          } else if (currentSmallRank.title !== lastSmallRankTitle) {
            updates.newRankUnlocked = currentSmallRank;
            updates.lastSmallRankTitle = currentSmallRank.title;
          }
          return updates;
        });

        void get().syncToCloud();
      },
      clearNewRankUnlocked: () => {
        set({ newRankUnlocked: null });
      },
      updateSessionXPRecord: (xp) => {
        if (xp > get().sessionXPRecord) {
          set({ sessionXPRecord: xp });
          void get().syncToCloud();
        }
      },
      clearProveItResponses: () => {
        set({ pendingProveItResponses: [] });
        void get().syncToCloud();
      },
      setPinnedExample: (wordId, example) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId && w.word.toLowerCase() !== wordId.toLowerCase()) return w;
            return { ...w, pinnedExample: example };
          })
        }));
        void get().syncToCloud();
      },
      markRoleMastered: (wordId, role) => {
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId && w.word.toLowerCase() !== wordId.toLowerCase()) return w;
            
            const rolesMastered = { ...w.rolesMastered, [role]: true };
            const masteredCount = Object.values(rolesMastered).filter(Boolean).length;
            
            let extraBonus = 0;
            let bonusReason = "";

            if (masteredCount >= 2 && !w.rolesMastered[role]) {
              // One-time bonus for 2+ roles
              const alreadyHad2 = Object.values(w.rolesMastered).filter(Boolean).length >= 2;
              if (!alreadyHad2) {
                extraBonus += 50;
                bonusReason = `Role mastery bonus: ${role} confirmed (2+ roles)`;
              }
            }

            // Check if all roles are mastered
            const allRolesDefined = w.roles.map(r => r.role);
            const allMastered = allRolesDefined.every(r => rolesMastered[r]);
            const wasAllMastered = allRolesDefined.every(r => w.rolesMastered[r]);
            
            if (allMastered && !wasAllMastered && allRolesDefined.length > 0) {
              extraBonus += 100;
              bonusReason = bonusReason ? bonusReason + " + Full Role Mastery" : `Full Role Mastery: ${wordId}`;
              setTimeout(() => get().awardBadge('full_roles'), 0);
              // Note: No specific challenge for markRoleMastered mentioned in Prompt C wiring list, 
              // but I'll keep the previous progressChallenge if it fits. 
              // Actually Prompt C says "Achieved full role mastery on any word" badge, 
              // but doesn't list a weekly challenge for it.
              // I will remove the generic progressChallenge(1) I added earlier.
            }

            if (extraBonus > 0) {
              const newScore = clamp((w.baseScore ?? 0) + extraBonus, 0, 1000);
              return {
                ...w,
                rolesMastered,
                baseScore: newScore,
                confidenceScore: newScore,
                status: scoreToStatus(newScore),
                scoreHistory: [{ date: now, change: extraBonus, reason: bonusReason }, ...(w.scoreHistory || [])].slice(0, 5)
              };
            }

            return { ...w, rolesMastered };
          })
        }));
        void get().syncToCloud();
      },

      resetLearningProgress: async () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(v => ({ 
            ...v, 
            baseScore: 0, 
            confidenceScore: 0, 
            status: 'not_started' as MasteryStatus,
            useCount: 0,
            scoreHistory: [],
            rolesMastered: {},
            hardened: false,
            isBleeding: false,
            recentPerformance: [],
            productionStatus: undefined,
            recognitionStatus: undefined,
            pinnedExample: undefined
          })),
          curriculums: curriculumRoadmap,
          activeCurriculumId: null,
          activeModuleId: null,
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          currentPositionNodeId: 'phi_sim',
          earnedBadges: [],
          earnedCeremonialRanks: [],
          newRankUnlocked: null,
          lastSmallRankTitle: 'jan lili',
          sessionXPRecord: 0,
          xpMultiplier: 1.0,
          streakShields: 0,
          lastStreakMilestone: 0,
          pendingComebackBonus: false,
          learningDays: [],
          completedNodeIds: [],
          seenIntroductions: [],
          confusionPairs: [],
          sessionLog: [],
          currentChallenge: null,
          completedChallenges: [],
          pendingRankAcknowledgement: null,
          lastStreakCheck: '',
          pendingProveItResponses: [],
          totalProveItSubmitted: 0,
          completedActivities: {},
          masteryHistory: []
        }));
        localStorage.setItem('tp_sandbox_mode', 'false');
        get().refreshCurriculumStatus();
        await get().syncToCloud(undefined, false, true);
      },

      startSessionTimer: () => set({ sessionStartTime: new Date().toISOString() }),
      
      commitSessionLog: (entry) => {
        const id = crypto.randomUUID();
        const startTime = get().sessionStartTime;
        const now = new Date();
        const start = startTime ? new Date(startTime) : now;
        const durationMinutes = Math.round((now.getTime() - start.getTime()) / 60000);

        set(state => ({
          sessionLog: [{ ...entry, id, durationMinutes }, ...state.sessionLog].slice(0, 100)
        }));
        void get().syncToCloud();
      },

      generateWeeklyChallenge: () => {
        const now = new Date();
        const day = now.getDay(); // 0 (Sun) to 6 (Sat)
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(now.setDate(diff));
        monday.setHours(0,0,0,0);
        const weekStartDate = monday.toISOString().split('T')[0];

        const { currentChallenge, vocabulary } = get();
        if (currentChallenge && currentChallenge.weekStartDate === weekStartDate) return;

        if (currentChallenge && new Date(currentChallenge.expiresDate) < new Date()) {
           set(state => ({ completedChallenges: [currentChallenge, ...state.completedChallenges] }));
        }

        const templates: { type: WeeklyChallenge['type'], title: string, description: string, targetCount: number, xpReward: number }[] = [
          {
            type: 'word_usage',
            title: "Use [word] in 3 different sentences",
            description: "Show jan Lina you can use [word] as a noun, verb, and modifier.",
            targetCount: 3, xpReward: 150
          },
          {
            type: 'session_count',
            title: "Complete 3 sessions this week",
            description: "Show up three times. Consistency beats intensity.",
            targetCount: 3, xpReward: 200
          },
          {
            type: 'word_progression',
            title: "Get any word from Introduced to Practicing",
            description: "Push a new word deeper into your memory.",
            targetCount: 1, xpReward: 175
          },
          {
            type: 'prove_it_usage',
            title: "Use [word] correctly in a Prove It drill",
            description: "Submit a Prove It sentence using [word] and have jan Lina confirm it.",
            targetCount: 1, xpReward: 125
          },
          {
            type: 'convo_length',
            title: "Have a 10-message conversation with jan Lina",
            description: "Go deep. Ten messages back and forth in one session.",
            targetCount: 10, xpReward: 225
          },
          {
            type: 'phrase_save',
            title: "Save 2 new phrases to The Archive",
            description: "Build your personal phrase library.",
            targetCount: 2, xpReward: 100
          },
        ];

        const template = templates[Math.floor(Math.random() * templates.length)];
        const candidates = vocabulary.filter(w => w.status === 'introduced' || w.status === 'practicing');
        const randomWord = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)].word : 'toki';
        
        const expires = new Date(monday);
        expires.setDate(expires.getDate() + 6);
        expires.setHours(23, 59, 59, 999);

        const newChallenge: WeeklyChallenge = {
          id: crypto.randomUUID(),
          type: template.type,
          weekStartDate,
          title: template.title.replace('[word]', randomWord),
          description: template.description.replace('[word]', randomWord),
          targetWord: randomWord,
          targetCount: template.targetCount,
          currentCount: 0,
          completed: false,
          xpReward: template.xpReward,
          expiresDate: expires.toISOString()
        };

        set({ currentChallenge: newChallenge });
        void get().syncToCloud();
      },

      progressChallenge: (amount = 1, type?: WeeklyChallenge['type'], wordId?: string) => {
        const { currentChallenge, vocabulary } = get();
        if (!currentChallenge || currentChallenge.completed) return;

        // If type is specified, only progress if it matches
        if (type && currentChallenge.type !== type) return;
        
        // If targetWord is specified for the challenge, check if it matches
        if (currentChallenge.targetWord && wordId && currentChallenge.targetWord.toLowerCase() !== wordId.toLowerCase()) return;

        const newCount = Math.min(currentChallenge.currentCount + amount, currentChallenge.targetCount);
        const completed = newCount >= currentChallenge.targetCount;

        set(state => ({
          currentChallenge: state.currentChallenge ? {
            ...state.currentChallenge,
            currentCount: newCount,
            completed
          } : null
        }));

        if (completed) {
          const sorted = [...vocabulary].sort((a,b) => (b.baseScore || 0) - (a.baseScore || 0));
          const bestWord = sorted[0];
          if (bestWord) {
            const now = new Date().toISOString();
            const newScore = Math.min((bestWord.baseScore || 0) + currentChallenge.xpReward, 1000);
            set(state => ({
              vocabulary: state.vocabulary.map(w => w.id === bestWord.id ? {
                ...w,
                baseScore: newScore,
                confidenceScore: newScore,
                status: scoreToStatus(newScore),
                scoreHistory: [{ date: now, change: currentChallenge.xpReward, reason: `Weekly challenge complete: ${currentChallenge.title}` }, ...(w.scoreHistory || [])].slice(0, 5)
              } : w)
            }));
          }
        }
        void get().syncToCloud();
      },

      clearRankAcknowledgement: () => set({ pendingRankAcknowledgement: null }),

      setStudentName: (name) => { set({ studentName: name }); void get().updateProfile({ firstName: name }); },
      updateProfile: async (profileUpdate) => { 
        set((state) => ({ 
          profile: { ...state.profile, ...profileUpdate } 
        })); 
        await get().syncToCloud(); 
      },
      setReviewVibe: async (vibe) => { set({ reviewVibe: vibe }); await get().syncToCloud(); },
      setProfileImage: async (url) => { set({ profileImage: url }); await get().syncToCloud(); },

      updatePhraseNote: async (id, notes) => {
        set((state) => ({
          savedPhrases: state.savedPhrases.map(p => {
            if (typeof p === 'string') return p === id ? { id, tp: p, en: 'Saved Phrase *', notes } : p;
            return p.id === id ? { ...p, notes } : p;
          })
        }));
        await get().syncToCloud();
      },

      deletePhrase: async (id) => {
        set((state) => ({
          savedPhrases: state.savedPhrases.filter(p =>
            typeof p === 'string' ? p !== id : p.id !== id
          )
        }));
        await get().syncToCloud();
      },

      resetAsNewUser: async () => {
        const { userId } = get();
        set({
          studentName: '',
          profile: defaultProfile,
          reviewVibe: null,
          profileImage: '',
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: mappedVocabulary.map(v => ({ ...v, baseScore: 0, confidenceScore: 0, status: 'not_started' as MasteryStatus })),
          curriculums: curriculumRoadmap,
          currentPositionNodeId: 'phi_sim',
          activeCurriculumId: null,
          activeModuleId: null,
          hasCompletedSetup: false,
          songs: defaultSongs,
          commonPhrases: defaultCommonPhrases,
          earnedBadges: [],
          earnedCeremonialRanks: [],
          newRankUnlocked: null,
          lastSmallRankTitle: 'jan lili',
          sessionXPRecord: 0,
          xpMultiplier: 1.0,
          streakShields: 0,
          lastStreakMilestone: 0,
          pendingComebackBonus: false,
          learningDays: [],
          completedNodeIds: [],
          seenIntroductions: [],
          confusionPairs: [],
          sessionLog: [],
          currentChallenge: null,
          completedChallenges: [],
          pendingRankAcknowledgement: null,
          lastStreakCheck: '',
          pendingProveItResponses: [],
          totalProveItSubmitted: 0,
          completedActivities: {}
        });
        localStorage.setItem('tp_sandbox_mode', 'false');
        get().refreshCurriculumStatus();
        if (userId) {
          await get().syncToCloud(userId, false, true);
        }
      },

      resetProfileAndRunSetup: async () => {
        set({
          studentName: '',
          profile: defaultProfile,
          reviewVibe: null,
          profileImage: '',
          curriculums: curriculumRoadmap,
          vocabulary: mappedVocabulary.map(v => ({ ...v, baseScore: 0, confidenceScore: 0, status: 'not_started' as MasteryStatus })),
          currentPositionNodeId: 'phi_sim',
          activeCurriculumId: null,
          activeModuleId: null,
          hasCompletedSetup: false,
          songs: defaultSongs,
          commonPhrases: defaultCommonPhrases,
          earnedBadges: [],
          earnedCeremonialRanks: [],
          newRankUnlocked: null,
          lastSmallRankTitle: 'jan lili',
          sessionXPRecord: 0,
          xpMultiplier: 1.0,
          streakShields: 0,
          lastStreakMilestone: 0,
          pendingComebackBonus: false,
          learningDays: [],
          completedNodeIds: [],
          seenIntroductions: [],
          confusionPairs: [],
          sessionLog: [],
          currentChallenge: null,
          completedChallenges: [],
          pendingRankAcknowledgement: null,
          lastStreakCheck: '',
          pendingProveItResponses: [],
          totalProveItSubmitted: 0,
          completedActivities: {}
        });
        localStorage.setItem('tp_sandbox_mode', 'false');
        get().refreshCurriculumStatus();
        await get().syncToCloud(undefined, false, true);
      },

      randomizeVocab: async () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(w => {
            const score = Math.floor(Math.random() * 1001);
            return { ...w, baseScore: score, confidenceScore: score, status: scoreToStatus(score) };
          })
        }));
        get().refreshCurriculumStatus();
        await get().syncToCloud();
      },

      masterAllVocab: async () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(w => ({ ...w, baseScore: 975, confidenceScore: 975, status: 'mastered' as MasteryStatus })),
          curriculums: state.curriculums.map(level => ({
            ...level,
            nodes: level.nodes.map(node => ({ ...node, status: 'mastered' as const }))
          }))
        }));
        get().refreshCurriculumStatus();
        await get().syncToCloud();
      },

      clearLocalData: () => {
        set({
          userId: null,
          studentName: '',
          profile: defaultProfile,
          reviewVibe: null,
          profileImage: '',
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: mappedVocabulary,
          curriculums: curriculumRoadmap,
          hasCompletedSetup: false,
          songs: defaultSongs,
          commonPhrases: defaultCommonPhrases,
        });
      },

      setLastUpdated: (date) => set({ lastUpdated: date }),

      setWidgetDensity: (val) => { set({ widgetDensity: val }); void get().syncToCloud(); },
      setFogOfWar: (val) => { set({ fogOfWar: val }); void get().syncToCloud(); },
      setShowCircuitPaths: (val) => { set({ showCircuitPaths: val }); void get().syncToCloud(); },
      setKnowledgeCheckFrequency: async (freq) => { set({ knowledgeCheckFrequency: freq }); await get().syncToCloud(); },
      setLastKnowledgeCheckDate: async (date) => { set({ lastKnowledgeCheckDate: date }); await get().syncToCloud(); },

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
          const multiplier = WORD_FREQUENCY[word.word.toLowerCase()] ?? 1.0;
          summary.xp += (word.baseScore || 0) * multiplier;
        }
        summary.xp = Math.round(summary.xp);
        const level = Math.floor(summary.xp / 500) + 1;
        
        const rank = [...SMALL_RANKS].reverse().find(r => summary.xp >= r.xpThreshold) || SMALL_RANKS[0];
        const rankTitle = rank.title;

        return { ...summary, level, rankTitle };
      },

      switchProfile: (name: string) => {
        set({
          studentName: name,
          profile: { ...defaultProfile, firstName: name },
          reviewVibe: null,
          profileImage: '',
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: mappedVocabulary,
          curriculums: curriculumRoadmap,
          hasCompletedSetup: false,
          songs: defaultSongs,
          commonPhrases: defaultCommonPhrases,
          currentPositionNodeId: 'phi_sim',
          activeCurriculumId: null,
          activeModuleId: null,
          isMainProfile: false,
        });
      },

      updateVocabAIContent: (wordId, content) => {
        set((state) => ({
          vocabulary: state.vocabulary.map(v => (v.id === wordId || v.word === wordId) ? { ...v, ...content } : v)
        }));
        void get().syncToCloud();
      },
      updateSessionNotes: (wordId, notes) => {
        set((state) => ({
          vocabulary: state.vocabulary.map(v => (v.id === wordId || v.word === wordId) ? { ...v, sessionNotes: notes } : v)
        }));
        void get().syncToCloud();
      },

      syncToCloud: async (explicitUserId, merge = true, force = false) => {
        const { vocabulary, curriculums, lastUpdated, studentName, profile, profileImage, savedPhrases, currentStreak, lastActiveDate, userId, hasCompletedSetup, currentPositionNodeId, isMainProfile, widgetDensity, fogOfWar, showCircuitPaths, knowledgeCheckFrequency, lastKnowledgeCheckDate, cloudSynced, songs, commonPhrases, lastStreakCheck, learningDays, confusionPairs, pendingProveItResponses,
            earnedCeremonialRanks, lastSmallRankTitle, earnedBadges, totalProveItSubmitted,
            streakShields, xpMultiplier, lastStreakMilestone, pendingComebackBonus, sessionXPRecord,
            sessionLog, currentChallenge, completedChallenges, pendingRankAcknowledgement, newRankUnlocked,
            activeCurriculumId, activeModuleId, selectedWords, lessonFilter,
            completedNodeIds, seenIntroductions, completedActivities, masteryHistory } = get();
        const targetId = explicitUserId || userId;

        // Block premature syncs before cloud data has loaded — prevents stale
        // localStorage data from overwriting Firestore during the auth race window
        if (!cloudSynced && !explicitUserId && !force) return;

        // Prevent sync for guest users and any non-main profile (Sandbox mode)
        // Unless force=true (used for resets)
        if (!targetId || targetId === 'guest_user') return;
        if (!force && (!isMainProfile || localStorage.getItem('tp_sandbox_mode') === 'true')) return;

        try {
          // Strip static content before sending to Firestore
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const partialVocab = vocabulary.map(({ phonetic, syllables, anchor, semanticCluster, connotation, roles, examples, collocations, relatedWordIds, boundaryNotes, etymology, mnemonic, culturalNotes, avoidWhen, ...dynamicData }) => dynamicData);

          // Deep sanitize object to convert undefined -> null for Firestore reliability
          const sanitize = (obj: any): any => {
            if (Array.isArray(obj)) return obj.map(sanitize);
            if (obj !== null && typeof obj === 'object') {
              return Object.entries(obj).reduce((acc, [key, value]) => ({
                ...acc,
                [key]: value === undefined ? null : sanitize(value)
              }), {});
            }
            return obj === undefined ? null : obj;
          };

          await setDoc(doc(db, 'users', targetId), sanitize({
            vocabulary: partialVocab,
            curriculums, lastUpdated, studentName, profile, profileImage,
            savedPhrases, currentStreak, lastActiveDate, hasCompletedSetup, currentPositionNodeId, isMainProfile,
            widgetDensity, fogOfWar, showCircuitPaths, knowledgeCheckFrequency, lastKnowledgeCheckDate, songs, commonPhrases,
            lastStreakCheck, learningDays, completedNodeIds, seenIntroductions, confusionPairs, pendingProveItResponses,
            earnedCeremonialRanks, lastSmallRankTitle, earnedBadges, totalProveItSubmitted,
            streakShields, xpMultiplier, lastStreakMilestone, pendingComebackBonus, sessionXPRecord,
            sessionLog, currentChallenge, completedChallenges, pendingRankAcknowledgement, newRankUnlocked,
            activeCurriculumId, activeModuleId, selectedWords, lessonFilter, completedActivities, masteryHistory
          }), { merge });
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
              localName !== '' &&
              localName.toLowerCase() !== initialName.toLowerCase();

            if (isOtherUsersData) {
              // Local data belongs to a different user — start fresh for this account
              set({
                studentName: initialName,
                profile: { ...defaultProfile, firstName: initialName },
                reviewVibe: null,
                profileImage: initialProfileImage || '',
                savedPhrases: [],
                currentStreak: 0,
                lastActiveDate: '',
                vocabulary: mappedVocabulary,
                curriculums: curriculumRoadmap,
                currentPositionNodeId: 'phi_sim',
          activeCurriculumId: null,
          activeModuleId: null,
                hasCompletedSetup: false,
                songs: defaultSongs,
                commonPhrases: defaultCommonPhrases,
              });
            } else {
              if (initialName && (localName === '' || !localName)) {
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
            (data.vocabulary as Array<{ status: MasteryStatus }>).every((w) => w.status === 'mastered');
          const nameMismatch = initialName && cloudName &&
            cloudName.toLowerCase() !== initialName.toLowerCase();

          if (nameMismatch && allVocabMastered) {
            set({
              studentName: initialName,
              profile: { ...defaultProfile, firstName: initialName },
              profileImage: initialProfileImage || '',
              savedPhrases: [],
              currentStreak: 0,
              lastActiveDate: '',
              vocabulary: mappedVocabulary,
              curriculums: curriculumRoadmap,
              currentPositionNodeId: 'phi_sim',
          activeCurriculumId: null,
          activeModuleId: null,
              hasCompletedSetup: false,
              songs: defaultSongs,
              commonPhrases: defaultCommonPhrases,
              cloudSynced: true,
            });
            void get().syncToCloud(uid);
            return;
          }

          const vocabulary = (data.vocabulary || mappedVocabulary).map(
            (w: { word?: string; useCount?: number; frequencyRank?: number; type?: string; status?: MasteryStatus; [key: string]: unknown }) => {
              const base = mappedVocabulary.find(iv => iv.word === w.word);
              const staticData = vocabContent[w.word || ''] || {};
              const useCount = typeof w.useCount === 'number' ? w.useCount : 0;
              const frequencyRank = typeof w.frequencyRank === 'number' ? w.frequencyRank : (base?.frequencyRank ?? 999);
              const type = w.type || (base?.type ?? 'word');
              const weight = w.weight || base?.weight;
              
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
                weight,
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
                notes: w.notes || '',
                customDefinition: w.customDefinition || '',
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
            const storedLevel = (data.curriculums || []).find((l: { id?: string }) => l.id === staticLevel.id);
            return {
              ...staticLevel,
              nodes: staticLevel.nodes.map(staticNode => {
                const storedNode = (storedLevel?.nodes || []).find((n: { id?: string; status?: NodeStatus }) => n.id === staticNode.id);
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
            songs: (Array.isArray(data.songs) && data.songs.length > 0) ? data.songs : defaultSongs,
            commonPhrases: (Array.isArray(data.commonPhrases) && data.commonPhrases.length > 0) ? data.commonPhrases : defaultCommonPhrases,
            lastStreakCheck: data.lastStreakCheck || '',
            learningDays: data.learningDays || [],
            completedNodeIds: data.completedNodeIds || [],
            seenIntroductions: data.seenIntroductions || [],
            confusionPairs: data.confusionPairs || [],
            pendingProveItResponses: data.pendingProveItResponses || [],
            earnedCeremonialRanks: data.earnedCeremonialRanks || [],
            lastSmallRankTitle: data.lastSmallRankTitle || 'jan lili',
            earnedBadges: data.earnedBadges || [],
            totalProveItSubmitted: data.totalProveItSubmitted || 0,
            streakShields: data.streakShields || 0,
            xpMultiplier: data.xpMultiplier || 1.0,
            lastStreakMilestone: data.lastStreakMilestone || 0,
            pendingComebackBonus: !!data.pendingComebackBonus,
            sessionXPRecord: data.sessionXPRecord || 0,
            sessionLog: data.sessionLog || [],
            currentChallenge: data.currentChallenge || null,
            completedChallenges: data.completedChallenges || [],
            pendingRankAcknowledgement: data.pendingRankAcknowledgement || null,
            newRankUnlocked: data.newRankUnlocked || null,
            activeCurriculumId: data.activeCurriculumId || null,
            activeModuleId: data.activeModuleId || null,
            selectedWords: data.selectedWords || [],
            lessonFilter: data.lessonFilter || null,
            completedActivities: data.completedActivities || {},
            masteryHistory: data.masteryHistory || [],
          };

          if (data.studentName) update.studentName = data.studentName;
          if (data.profileImage) update.profileImage = data.profileImage;
          if (data.profile) {
            const incomingProfile = data.profile || {};
            update.profile = { 
              ...get().profile, 
              ...incomingProfile,
              firstName: incomingProfile.firstName || data.studentName || defaultProfile.firstName,
              lastName: incomingProfile.lastName || defaultProfile.lastName,
              tpName: incomingProfile.tpName || defaultProfile.tpName,
              age: incomingProfile.age || defaultProfile.age,
              sex: incomingProfile.sex || defaultProfile.sex,
              locationString: incomingProfile.locationString || defaultProfile.locationString,
              difficulty: incomingProfile.difficulty || defaultProfile.difficulty,
              interests: incomingProfile.interests || defaultProfile.interests,
              mbti: incomingProfile.mbti || defaultProfile.mbti,
              enneagram: incomingProfile.enneagram || defaultProfile.enneagram,
              bigFiveOpenness: incomingProfile.bigFiveOpenness || defaultProfile.bigFiveOpenness,
              bigFiveConscientiousness: incomingProfile.bigFiveConscientiousness || defaultProfile.bigFiveConscientiousness,
              bigFiveExtraversion: incomingProfile.bigFiveExtraversion || defaultProfile.bigFiveExtraversion,
              bigFiveAgreeableness: incomingProfile.bigFiveAgreeableness || defaultProfile.bigFiveAgreeableness,
              bigFiveNeuroticism: incomingProfile.bigFiveNeuroticism || defaultProfile.bigFiveNeuroticism,
              attachmentStyle: incomingProfile.attachmentStyle || defaultProfile.attachmentStyle,
              religion: incomingProfile.religion || defaultProfile.religion,
              religionOther: incomingProfile.religionOther || defaultProfile.religionOther,
              politicalIdentity: incomingProfile.politicalIdentity || defaultProfile.politicalIdentity,
              politicalIdentityOther: incomingProfile.politicalIdentityOther || defaultProfile.politicalIdentityOther,
              bloodType: incomingProfile.bloodType || defaultProfile.bloodType,
              dietPattern: incomingProfile.dietPattern || defaultProfile.dietPattern,
              workoutStyle: incomingProfile.workoutStyle || defaultProfile.workoutStyle,
              activityLevel: incomingProfile.activityLevel || defaultProfile.activityLevel,
              chronicConditions: incomingProfile.chronicConditions || defaultProfile.chronicConditions,
              bookGenres: incomingProfile.bookGenres || defaultProfile.bookGenres,
              tvGenres: incomingProfile.tvGenres || defaultProfile.tvGenres,
              musicGenres: incomingProfile.musicGenres || defaultProfile.musicGenres,
              gamingGenres: incomingProfile.gamingGenres || defaultProfile.gamingGenres,
              gamingPlatforms: incomingProfile.gamingPlatforms || defaultProfile.gamingPlatforms,
              chronotype: incomingProfile.chronotype || defaultProfile.chronotype,
              workSchedule: incomingProfile.workSchedule || defaultProfile.workSchedule,
              livingSituation: incomingProfile.livingSituation || defaultProfile.livingSituation,
              socialPreference: incomingProfile.socialPreference || defaultProfile.socialPreference,
            };
          }

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
          // Ensure critical array fields are always arrays and not empty if defaults exist
          if (!Array.isArray(state.commonPhrases) || state.commonPhrases.length === 0) {
            state.commonPhrases = defaultCommonPhrases;
          }
          if (!Array.isArray(state.songs) || state.songs.length === 0) {
            state.songs = defaultSongs;
          } else {
            // Migration check: If local song count is less than the count in albumData.ts, or missing specific albums
            const hasTelo = state.songs.some((a: Album) => a.id === 'telo-lon-kiwen');
            const needsUpdate = !hasTelo || state.songs.length < defaultSongs.length;

            if (needsUpdate) {
              console.log('Migrating songs to latest albumData...');
              state.songs = defaultSongs;
            }
          }          if (!Array.isArray(state.savedPhrases)) {
            state.savedPhrases = [];
          }

          // Merge static content on rehydration
          const mergedCurriculums = curriculumRoadmap.map(staticLevel => {
            const storedLevel = (state.curriculums || []).find((l: { id?: string }) => l.id === staticLevel.id);
            return {
              ...staticLevel,
              nodes: staticLevel.nodes.map(staticNode => {
                const storedNode = (storedLevel?.nodes || []).find((n: { id?: string; status?: NodeStatus }) => n.id === staticNode.id);
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
