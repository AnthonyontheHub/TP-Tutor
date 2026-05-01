// src/types/mastery.ts
// ─── Status ──────────────────────────────────────────────────────────────────

export const MASTERY_STATUS = {
  NOT_STARTED: 'not_started',
  INTRODUCED: 'introduced',
  PRACTICING: 'practicing',
  CONFIDENT: 'confident',
  MASTERED: 'mastered',
} as const;

export type MasteryStatus = (typeof MASTERY_STATUS)[keyof typeof MASTERY_STATUS];

export const STATUS_META: Record<
  MasteryStatus,
  { emoji: string; label: string; meaning: string }
> = {
  not_started: {
    emoji: '⬜',
    label: 'PENDING',
    meaning: 'Concept has not yet been introduced (0-200 pts).',
  },
  introduced: {
    emoji: '🟣',
    label: 'INTRODUCED',
    meaning: 'The word is new to you (201-500 pts).',
  },
  practicing: {
    emoji: '🔵',
    label: 'PRACTICING',
    meaning: "You're using it, but it's not fluid yet (501-750 pts).",
  },
  confident: {
    emoji: '🟡',
    label: 'CONFIDENT',
    meaning: 'You know it well in most contexts (751-949 pts).',
  },
  mastered: {
    emoji: '✅',
    label: 'MASTERED',
    meaning:
      'The word is now part of your "mental map" (950-1000 pts).',
  },
};

// ─── Score → Status derivation ────────────────────────────────────────────────
// Status is derived from baseScore (0-1000); it is never stored independently.
// New thresholds per Lina's Scoring Engine:
// 0–200 = ⬜ Not Started
// 201–500 = 🟣 Introduced
// 501–750 = 🔵 Practicing
// 751–949 = 🟡 Confident
// 950–1000 = ✅ Mastered

export function scoreToStatus(score: number): MasteryStatus {
  if (score >= 950) return 'mastered';
  if (score >= 751) return 'confident';
  if (score >= 501) return 'practicing';
  if (score >= 201) return 'introduced';
  return 'not_started';
}

// Midpoint of each tier's range — used to seed baseScore when reading
// legacy cloud data that only has a status field.
export const STATUS_MIDPOINT: Record<MasteryStatus, number> = {
  not_started: 0,
  introduced:  350,
  practicing:  625,
  confident:   850,
  mastered:    975,
};

// ─── Profile ──────────────────────────────────────────────────────────

export interface ProgressSnapshot {
  date: string;
  xp: number;
  totalLearned: number;
  streak: number;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  tpName?: string;
  age?: string;
  sex?: 'Male' | 'Female' | 'Other' | null;
  locationString?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  interests?: string[];
  history?: ProgressSnapshot[];

  // Personality
  mbti?: string | null;
  enneagram?: string | null;
  bigFiveOpenness?: 'Low' | 'Medium' | 'High' | null;
  bigFiveConscientiousness?: 'Low' | 'Medium' | 'High' | null;
  bigFiveExtraversion?: 'Low' | 'Medium' | 'High' | null;
  bigFiveAgreeableness?: 'Low' | 'Medium' | 'High' | null;
  bigFiveNeuroticism?: 'Low' | 'Medium' | 'High' | null;
  attachmentStyle?: string | null;

  // Beliefs
  religion?: string | null;
  religionOther?: string;
  politicalIdentity?: string[];
  politicalIdentityOther?: string;

  // Health
  bloodType?: string | null;
  dietPattern?: string | null;
  workoutStyle?: string | null;
  activityLevel?: string | null;
  chronicConditions?: string;

  // Media
  bookGenres?: string[];
  tvGenres?: string[];
  musicGenres?: string[];
  gamingGenres?: string[];
  gamingPlatforms?: string[];

  // Daily Life
  chronotype?: string | null;
  workSchedule?: string | null;
  livingSituation?: string | null;
  socialPreference?: string | null;

  [key: string]: any; // Added index signature
}

export type ReviewVibe = 'chill' | 'deep' | 'intense' | 'new_concept' | 'review' | 'quiz' | null;

// ─── Scoring Engine Types ─────────────────────────────────────────────────────

export interface ScoreHistoryEntry {
  date: string;
  change: number;
  reason: string;
}

export interface RoleMatrix {
  noun: number;
  verb: number;
  mod: number;
}

// ─── Linguistic & Teaching Types ────────────────────────────────────────

export type PosRole = 'noun' | 'verb' | 'modifier' | 'preverb' | 'preposition' | 'particle' | 'interjection';

export type ExampleTier = 'simple' | 'intermediate' | 'advanced' | 'philosophical';

export type Connotation = 'positive' | 'negative' | 'neutral' | 'contextual';

export interface BoundaryNote {
  id: string;
  wordId: string;
  note: string;
  timestamp: string;
}

export interface PosRoleEntry {
  role: PosRole;
  definition: string;
  example: {
    tp: string;
    en: string;
    highlight: string;
  };
  notes?: string;
}

export interface ExampleSentence {
  tier: ExampleTier;
  tp: string;
  en: string;
  highlight: string;
  notes?: string;
}

export interface Collocation {
  phrase: string;
  translation: string;
  wordIds: string[];
}

export interface TeachingObjective {
  wordId: string;
  roles: PosRole[];
  commonErrors: string[];
  focusExampleTier: ExampleTier;
}

// ─── Grammar Concepts ─────────────────────────────────────────────────────────

export interface GrammarConcept {
  id: string;
  concept: string;
  status: MasteryStatus;
  sessionNotes: string;
  baseScore: number;
  hardened?: boolean;
  isBleeding?: boolean;
  lastReviewed?: string;
  scoreHistory?: ScoreHistoryEntry[];
}

// ─── Chapters ─────────────────────────────────────────────────────────────────

export interface Chapter {
  id: string;
  title: string;
  order: number;
  // order === 0 is reserved for the Introduction section
  concepts: GrammarConcept[];
}

// ─── Vocabulary & Grammar ──────────────────────────────────────────────────

export type ItemType = 'word' | 'grammar';

export type MasteryWeight = 'pillar' | 'working' | 'bonus';

export interface VocabWord {
  id: string;
  word: string;
  partOfSpeech: string;
  meanings: string;
  type: ItemType;
  // baseScore is the source of truth (0–1000).
  // status is derived from it via scoreToStatus() and kept in sync.
  baseScore: number;
  // legacy field kept for migration of cloud/local data; prefer baseScore.
  confidenceScore?: number;
  roleMatrix: RoleMatrix;
  status: MasteryStatus;
  weight?: MasteryWeight;
  useCount: number;
  frequencyRank: number;
  isMasteryCandidate: boolean;
  sessionNotes: string;
  aiExplanation?: string;
  aiExamples?: Record<string, string>;

  // Deep Knowledge Scoring
  lastReviewed: string; // ISO timestamp
  scoreHistory: ScoreHistoryEntry[];
  hardened: boolean;
  isBleeding: boolean;

  // Feature extensions
  productionStatus?: MasteryStatus;
  recognitionStatus?: MasteryStatus;
  pinnedExample?: string;
  recentPerformance?: { date: string, outcome: 'correct' | 'struggled' }[];

  // Extensions
  phonetic: string;
  syllables: string[];
  anchor: string;
  semanticCluster: string[];
  connotation: Connotation;
  roles: PosRoleEntry[];
  examples: ExampleSentence[];
  collocations: Collocation[];
  relatedWordIds: string[];
  boundaryNotes: BoundaryNote[];
  etymology: string;
  mnemonic: string;
  userMnemonic?: string;
  culturalNotes?: string;
  avoidWhen?: string;
  rolesMastered: Partial<Record<PosRole, boolean>>;
  userNotes?: string;
  notes?: string;
  customDefinition?: string;
}

// ─── Curriculum ──────────────────────────────────────────────────────────────

export type NodeStatus = 'locked' | 'active' | 'mastered';

export interface ContentBlock {
  type: 'text' | 'structural' | 'callout';
  content: string;
}

export interface CurriculumNode {
  id: string;
  title: string;
  requiredVocabIds: string[];
  requiredGrammarIds: string[];
  status: NodeStatus;
  sessionNotes?: string;
  richContent?: ContentBlock[];
  visualFramework?: string;
  requiredWordIds?: string[];
  infographicUrl?: string;
  suggestedMethod?: 'Jan Lina Chat' | 'Builder Drill' | 'Quiz';
  type?: 'Topic' | 'Drill' | 'Checkpoint';
  activities?: string[];
}

export interface CurriculumLevel {
  id: string;
  title: string;
  nodes: CurriculumNode[];
}

// ─── Top-level Map ────────────────────────────────────────────────────────────

export interface SavedPhrase {
  id: string;
  tp: string;
  en: string;
  notes: string;
}

// ─── Discography ──────────────────────────────────────────────────────────────

export interface CommonPhrase {
  category: string;
  tp: string;
  en: string;
}

export interface MasteryMap {
  studentName: string;
  profileImage: string;
  curriculumLevel: string;
  lastUpdated: string;
  levels: CurriculumLevel[];
  vocabulary: VocabWord[];

  // NEW FEATURES
  savedPhrases: (string | SavedPhrase)[];
  currentStreak: number;
  lastActiveDate: string;
}



// ─── Status summary helper type ───────────────────────────────────────────────

export type StatusSummary = Record<MasteryStatus, number>;

// ─── Ranks & Badges ─────────────────────────────────────────────────────────

export interface SmallRank {
  xpThreshold: number;
  title: string;           // Toki Pona title
}

export interface CeremonialRank {
  id: string;
  title: string;           // Mixed language title
  description: string;     // What was achieved
  achievedDate?: string;   // ISO date string, set when earned
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  icon: string;          // emoji
  earnedDate?: string;
}

export const SMALL_RANKS: SmallRank[] = [
  { xpThreshold: 0,       title: 'jan lili' },
  { xpThreshold: 500,     title: 'jan pi toki' },
  { xpThreshold: 1500,    title: 'jan toki' },
  { xpThreshold: 3000,    title: 'jan sona lili' },
  { xpThreshold: 5000,    title: 'jan sona' },
  { xpThreshold: 8000,    title: 'jan sona mute' },
  { xpThreshold: 12000,   title: 'jan pona pi toki pona' },
  { xpThreshold: 18000,   title: 'jan pi nasin toki' },
  { xpThreshold: 25000,   title: 'jan wawa pi toki pona' },
  { xpThreshold: 35000,   title: 'jan sona sewi' },
  { xpThreshold: 100000,  title: 'jan Sonja' },
];

export const CEREMONIAL_RANKS: CeremonialRank[] = [
  { id: 'initiate',        title: 'The Initiate',               description: '10 words reached Mastered' },
  { id: 'speaker',         title: 'Speaker of Simple Things',   description: '25 words at Confident or above' },
  { id: 'grammarian',      title: 'The Grammarian',             description: 'All Chapter 1 & 2 concepts mastered' },
  { id: 'sewi_speaker',    title: 'jan pi toki pona sewi',      description: '50 words at Confident or above' },
  { id: 'consistent',      title: 'The Consistent One',         description: '30-day streak achieved' },
  { id: 'toki_pona_lon',   title: 'toki pona li lon',           description: 'All 137 words at Confident or above' },
  { id: 'jan_sonja',       title: 'jan Sonja',                  description: 'All 137 words at Mastered — the highest honor' },
];

export const ALL_BADGES: Badge[] = [
  { id: 'first_session',    label: 'First Contact',        icon: '🛸', description: 'Completed your first jan Lina session' },
  { id: 'streak_7',         label: 'Week Warrior',         icon: '🔥', description: '7-day streak achieved' },
  { id: 'streak_14',        label: 'Fortnight Fighter',    icon: '⚡', description: '14-day streak achieved' },
  { id: 'streak_30',        label: 'The Consistent One',   icon: '💎', description: '30-day streak achieved' },
  { id: 'streak_60',        label: 'Relentless',           icon: '🌟', description: '60-day streak achieved' },
  { id: 'streak_100',       label: 'Legendary',            icon: '👑', description: '100-day streak achieved' },
  { id: 'first_master',     label: 'First Master',         icon: '✅', description: 'First word reached Mastered' },
  { id: 'ten_masters',      label: 'The Initiate',         icon: '🎯', description: '10 words at Mastered' },
  { id: 'first_hardened',   label: 'Ironclad',             icon: '🛡️', description: 'First word hardened' },
  { id: 'prove_it_5',       label: 'Prove It',             icon: '📝', description: 'Submitted 5 Prove It drills' },
  { id: 'confusion_clear',  label: 'No Longer Confused',   icon: '🧠', description: 'A confusion pair resolved after 10 correct uses' },
  { id: 'full_roles',       label: 'Master of Forms',      icon: '🎭', description: 'Achieved full role mastery on any word' },
  { id: 'comeback',         label: 'The Return',           icon: '🔄', description: 'Came back after missing 3+ days' },
  { id: 'court_session',    label: 'Objection!',           icon: '⚖️', description: 'Used the Mastery Court for the first time' },
  { id: 'jan_sonja_badge',  label: 'jan Sonja',            icon: '🌸', description: 'Mastered all 137 words' },
];

export interface SessionLogEntry {
  id: string;                        // UUID
  date: string;                      // ISO date string
  title: string;                     // Session title (from detectSessionTitle)
  context: string;                   // GENERAL, LESSON, DAILY_REVIEW, etc.
  xpEarned: number;                  // Total XP delta for the session
  grade: 'S' | 'A' | 'B' | 'C' | null;
  wordsChanged: {
    word: string;
    fromStatus: MasteryStatus;
    toStatus: MasteryStatus;
  }[];
  smallRankAtClose: string;          // Small rank title at session end
  sessionRecapText: string;          // The recap text jan Lina generated
  badgesEarned: string[];            // Badge IDs earned this session
  ceremonialRanksEarned: string[];   // Ceremonial rank IDs earned this session
  streakAtClose: number;
  durationMinutes?: number;
  curriculumNodeId?: string;         // The currentPositionNodeId at session end
}
export interface WeeklyChallenge {
  id: string;
  type: 'word_usage' | 'session_count' | 'word_progression' | 'prove_it_usage' | 'convo_length' | 'phrase_save';
  weekStartDate: string;
  title: string;
  description: string;
  targetWord?: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  xpReward: number;
  expiresDate: string;
}

export interface MasteryEvent {
  label: string;
  change: number;
  timestamp: string; // ISO timestamp
}

