// src/types/mastery.ts

export const MASTERY_STATUS = {
  NOT_STARTED: 'not_started',
  INTRODUCED: 'introduced',
  PRACTICING: 'practicing',
  CONFIDENT: 'confident',
  MASTERED: 'mastered',
} as const;

export type MasteryStatus = (typeof MASTERY_STATUS)[keyof typeof MASTERY_STATUS];

export const STATUS_META: Record<MasteryStatus, { emoji: string; label: string; meaning: string }> = {
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
    meaning: 'Fully automatic — confirmed correct across multiple sessions.',
  },
};

export function scoreToStatus(score: number): MasteryStatus {
  if (score >= 85) return 'mastered';
  if (score >= 65) return 'confident';
  if (score >= 40) return 'practicing';
  if (score >= 20) return 'introduced';
  return 'not_started';
}

export const STATUS_MIDPOINT: Record<MasteryStatus, number> = {
  not_started: 9,
  introduced:  29,
  practicing:  52,
  confident:   74,
  mastered:    92,
};

export interface VocabWord {
  word: string;
  status: MasteryStatus;
  sessionNotes: string;
}

export type StatusSummary = Record<MasteryStatus, number>;
