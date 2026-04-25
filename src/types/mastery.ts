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
// Status is derived from confidenceScore; it is never stored independently.
// New thresholds per Requirement 5:
//  0      → not_started (usually 0)
//  1–50   → introduced
//  51–150 → practicing
//  151–400→ confident
//  401+   → mastered

export function scoreToStatus(score: number): MasteryStatus {
  if (score > 400) return 'mastered';
  if (score > 150) return 'confident';
  if (score > 50) return 'practicing';
  if (score > 0) return 'introduced';
  return 'not_started';
}

// Midpoint of each tier's range — used to seed confidenceScore when reading
// legacy cloud data that only has a status field.
export const STATUS_MIDPOINT: Record<MasteryStatus, number> = {
  not_started: 0,
  introduced:  25,
  practicing:  100,
  confident:   275,
  mastered:    450,
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

export type ReviewVibe = 'chill' | 'deep';

// ─── Grammar Concepts ─────────────────────────────────────────────────────────

export interface GrammarConcept {
  id: string;
  concept: string;
  status: MasteryStatus;
  sessionNotes: string;
}

// ─── Chapters ─────────────────────────────────────────────────────────────────

export interface Chapter {
  id: string;
  title: string;
  order: number;
  // order === 0 is reserved for the Introduction section
  concepts: GrammarConcept[];
}

// ─── Vocabulary ───────────────────────────────────────────────────────────────

export interface VocabWord {
  id: string;
  word: string;
  partOfSpeech: string;
  meanings: string;
  // confidenceScore is the source of truth (0–100).
  // status is derived from it via scoreToStatus() and kept in sync.
  confidenceScore: number;
  status: MasteryStatus;
  useCount: number;
  frequencyRank: number;
  isMasteryCandidate: boolean;
  sessionNotes: string;
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
  chapters: Chapter[];   // index 0 = Introduction
  vocabulary: VocabWord[];

  // NEW FEATURES
  savedPhrases: (string | SavedPhrase)[];
  currentStreak: number;
  lastActiveDate: string;
}


// ─── Status summary helper type ───────────────────────────────────────────────

export type StatusSummary = Record<MasteryStatus, number>;
