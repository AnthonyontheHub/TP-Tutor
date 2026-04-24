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
    meaning: 'Concept has been presented but not yet practiced or tested.',
  },
  practicing: {
    emoji: '🟡',
    label: 'Practicing',
    meaning: 'Actively working on it; some errors or hesitation still present.',
  },
  confident: {
    emoji: '🟢',
    label: 'Confident',
    meaning: 'Consistently correct with some conscious effort.',
  },
  mastered: {
    emoji: '✅',
    label: 'Mastered',
    meaning:
      'Fully automatic — confirmed correct across multiple sessions. Set by mutual agreement.',
  },
};

// ─── Score → Status derivation ────────────────────────────────────────────────
// Status is derived from confidenceScore; it is never stored independently.
//   0–19  → not_started
//  20–39  → introduced
//  40–64  → practicing
//  65–84  → confident
//  85–100 → mastered

export function scoreToStatus(score: number): MasteryStatus {
  if (score >= 85) return 'mastered';
  if (score >= 65) return 'confident';
  if (score >= 40) return 'practicing';
  if (score >= 20) return 'introduced';
  return 'not_started';
}

// Midpoint of each tier's range — used to seed confidenceScore when reading
// legacy cloud data that only has a status field.
export const STATUS_MIDPOINT: Record<MasteryStatus, number> = {
  not_started: 9,
  introduced:  29,
  practicing:  52,
  confident:   74,
  mastered:    92,
};

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
