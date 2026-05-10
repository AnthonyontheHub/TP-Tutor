import type { PhrasebookEntry } from '../types/mastery';

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
