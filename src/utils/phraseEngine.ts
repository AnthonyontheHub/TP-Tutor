import type { PhrasebookEntry } from '../types/mastery';

import { useMasteryStore } from '../store/masteryStore';
import { extractLyricsToPhrases } from './lyricExtractor';

// Memoize the lyrics so we don't recalculate them on every keystroke
let cachedLyrics: PhrasebookEntry[] | null = null;

export const getPhrasebook = (): PhrasebookEntry[] => {
  if (!cachedLyrics) {
    try {
      // Pull directly from your live discography
      const songs = useMasteryStore.getState().songs || [];
      cachedLyrics = extractLyricsToPhrases(songs);
    } catch (e) {
      cachedLyrics = [];
    }
  }
  return [...standardPhrasebook, ...cachedLyrics!];
};

export const getPhrasesByCategory = (phrases: PhrasebookEntry[]) => {
  const groups: Record<string, PhrasebookEntry[]> = {};
  phrases.forEach(phrase => {
    const cat = phrase.category || "General";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(phrase);
  });
  return groups;
};

export const getPhrasesByWord = (phrases: PhrasebookEntry[], word: string) => {
  return phrases.filter(p => p.coreWords.includes(word));
};

export const getQuizPool = (phrases: PhrasebookEntry[], maxDifficulty: number, tag?: string) => {
  return phrases.filter(p => p.difficulty <= maxDifficulty && (!tag || p.tags.includes(tag)));
};
