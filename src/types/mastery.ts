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
    label: 'Not Started',
    meaning: 'Concept has not yet been introduced.',
  },
  introduced: {
    emoji: '🔵',
    label: 'Introduced',
    meaning: 'The word is new to you (0-50 pts).',
  },
  practicing: {
    emoji: '🟡',
    label: 'Practicing',
    meaning: "You're using it, but it's not fluid yet (51-150 pts).",
  },
  confident: {
    emoji: '🟢',
    label: 'Confident',
    meaning: 'You know it well in most contexts (151-400 pts).',
  },
  mastered: {
    emoji: '✅',
    label: 'Mastered',
    meaning:
      'The word is now part of your "mental map" (400+ pts).',
  },
};

// ─── Score → Status derivation ────────────────────────────────────────────────
// Status is derived from baseScore (0-1000); it is never stored independently.
// New thresholds per Lina's Scoring Engine:
// 0–200 = ⬜ Not Started
// 201–500 = 🔵 Introduced
// 501–750 = 🟡 Practicing
// 751–949 = 🟢 Confident
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
  name: string;
  age: string;
  location: string;
  sex: string;
  history: ProgressSnapshot[];
}

export type ReviewVibe = 'chill' | 'deep' | 'intense';

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

  // Deep Knowledge Scoring
  partOfSpeechScores: PartOfSpeechScores;
  lastReviewed: string; // ISO timestamp
  scoreHistory: ScoreHistoryEntry[];
  hardened: boolean;
  isBleeding: boolean;
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
