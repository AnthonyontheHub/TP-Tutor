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
  status: MasteryStatus;
  // Flagged when a word consistently performs at Mastered level but mutual
  // agreement has not yet been given to officially promote it.
  isMasteryCandidate: boolean;
  sessionNotes: string;
}

// ─── Top-level Map ────────────────────────────────────────────────────────────

export interface SavedPhrase {
  id: string;
  text: string;
  comment: string;
}

export interface MasteryMap {
  studentName: string;
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
