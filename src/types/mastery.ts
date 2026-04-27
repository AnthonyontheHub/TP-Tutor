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
    meaning: 'Concept has not yet been introduced.',
  },
  introduced: {
    emoji: '🟣',
    label: 'INTRODUCED',
    meaning: 'The word is new to you (0-50 pts).',
  },
  practicing: {
    emoji: '🔵',
    label: 'PRACTICING',
    meaning: "You're using it, but it's not fluid yet (51-150 pts).",
  },
  confident: {
    emoji: '🟡',
    label: 'CONFIDENT',
    meaning: 'You know it well in most contexts (151-400 pts).',
  },
  mastered: {
    emoji: '✅',
    label: 'MASTERED',
    meaning:
      'The word is now part of your "mental map" (400+ pts).',
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
  not_started: 100,
  introduced:  350,
  practicing:  625,
  confident:   850,
  mastered:    975,
};

// ─── Lore & Profile ──────────────────────────────────────────────────────────

export type LoreCategory = 'Work' | 'Hobbies' | 'Pets' | 'Projects' | 'Lifestyle';

export interface LoreEntry {
  id: string;
  category: LoreCategory;
  detail: string;
}

export interface ProgressSnapshot {
  date: string;
  xp: number;
  totalLearned: number;
  streak: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  tpName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  interests?: string[];
  history: ProgressSnapshot[];
}

export type ReviewVibe = 'chill' | 'deep' | 'intense' | 'new_concept' | 'review' | 'quiz' | null;

// ─── Scoring Engine Types ─────────────────────────────────────────────────────

export interface ScoreHistoryEntry {
  date: string;
  change: number;
  reason: string;
}

export interface PartOfSpeechScores {
  noun: number;
  verb: number;
  modifier: number;
}

// ─── New Linguistic & Teaching Types ────────────────────────────────────────

export type PosRole = 'noun' | 'verb' | 'modifier' | 'preverb' | 'preposition' | 'particle' | 'interjection';

export type ExampleTier = 'simple' | 'intermediate' | 'advanced' | 'philosophical';

export type Connotation = 'positive' | 'negative' | 'neutral' | 'contextual';

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

export interface BoundaryNote {
  id: string;
  wordId: string;
  note: string;
  timestamp: string;
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

export interface VocabWord {
  id: string;
  word: string;
  partOfSpeech: string;
  meanings: string;
  type: ItemType; 
  // baseScore is the source of truth (0–1000).
  // status is derived from it via scoreToStatus() and kept in sync.
  baseScore: number;
  confidenceScore: number; // Legacy support
  status: MasteryStatus;
  useCount: number;
  frequencyRank: number;
  isMasteryCandidate: boolean;
  sessionNotes: string;
  aiExplanation?: string;
  aiExamples?: Record<string, string>;

  // Deep Knowledge Scoring
  partOfSpeechScores: PartOfSpeechScores;
  lastReviewed: string; // ISO timestamp
  scoreHistory: ScoreHistoryEntry[];
  hardened: boolean;
  isBleeding: boolean;

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
  richContent?: ContentBlock[];
  visualFramework?: string;
  requiredWordIds?: string[];
  suggestedMethod?: 'Jan Lina Chat' | 'Builder Drill' | 'Quiz';
  type?: 'Topic' | 'Drill' | 'Checkpoint';
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

export interface SongBlock {
  type: 'verse' | 'chorus' | 'bridge' | 'outro';
  tp: string;
  en: string;
}

export interface Song {
  id: string;
  title: string;
  blocks: SongBlock[];
}

export interface Album {
  id: string;
  title: string;
  songs: Song[];
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

