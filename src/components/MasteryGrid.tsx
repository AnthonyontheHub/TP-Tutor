/* src/types/mastery.ts */
export const MASTERY_STATUS = {
  NOT_STARTED: 'not_started',
  INTRODUCED: 'introduced',
  PRACTICING: 'practicing',
  CONFIDENT: 'confident',
  MASTERED: 'mastered',
} as const;

export type MasteryStatus = (typeof MASTERY_STATUS)[keyof typeof MASTERY_STATUS];

export const STATUS_META: Record<MasteryStatus, { emoji: string; label: string; meaning: string }> = {
  not_started: { emoji: '⬜', label: 'Not Started', meaning: 'Concept has not yet been introduced.' },
  introduced: { emoji: '🔵', label: 'Introduced', meaning: 'Concept has been presented but not yet practiced or tested.' },
  practicing: { emoji: '🟡', label: 'Practicing', meaning: 'Actively working on it; some errors or hesitation still present.' },
  confident: { emoji: '🟢', label: 'Confident', meaning: 'Consistently correct with some conscious effort.' },
  mastered: { emoji: '✅', label: 'Mastered', meaning: 'Fully automatic — confirmed correct across multiple sessions.' },
};

export interface GrammarConcept {
  id: string;
  concept: string;
  status: MasteryStatus;
  sessionNotes: string;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  concepts: GrammarConcept[];
}

export interface VocabWord {
  id: string;
  word: string;
  partOfSpeech: string;
  meanings: string;
  status: MasteryStatus;
  isMasteryCandidate: boolean;
  sessionNotes: string;
}

export interface SavedPhrase {
  id: string;
  tp: string;
  en: string;
  notes: string;
}

export interface MasteryMap {
  studentName: string;
  curriculumLevel: string;
  lastUpdated: string;
  chapters: Chapter[];   
  vocabulary: VocabWord[];
  savedPhrases: (string | SavedPhrase)[]; 
  currentStreak: number;
  lastActiveDate: string;
}

export type StatusSummary = Record<MasteryStatus, number>;
