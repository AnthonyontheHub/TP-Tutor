/* src/types/mastery.ts */
export const MASTERY_STATUS = {
  NOT_STARTED: 'not_started',
  INTRODUCED: 'introduced',
  PRACTICING: 'practicing',
  CONFIDENT: 'confident',
  MASTERED: 'mastered',
} as const;

export type MasteryStatus = (typeof MASTERY_STATUS)[keyof typeof MASTERY_STATUS];

export const STATUS_META: Record<MasteryStatus, { emoji: string; label: string; meaning: string; color: string; glow: string }> = {
  not_started: { emoji: '⬜', label: 'Not Started', meaning: 'Concept not introduced.', color: '#505050', glow: 'rgba(255,255,255,0.1)' },
  introduced: { emoji: '🔵', label: 'Introduced', meaning: 'Concept presented.', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
  practicing: { emoji: '🟡', label: 'Practicing', meaning: 'Actively working.', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
  confident: { emoji: '🟢', label: 'Confident', meaning: 'Consistently correct.', color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
  mastered: { emoji: '✅', label: 'Mastered', meaning: 'Fully automatic.', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)' },
};

export interface SavedPhrase {
  id: string;
  text: string;
  comment: string;
  timestamp: number;
}

export interface MasteryMap {
  studentName: string;
  curriculumLevel: string;
  lastUpdated: string;
  chapters: any[]; 
  vocabulary: any[];
  savedPhrases: SavedPhrase[]; 
  currentStreak: number;
  lastActiveDate: string;
}

export type StatusSummary = Record<MasteryStatus, number>;
