// Cache invalidation
import type { VocabWord } from '../types/mastery';

export type VocabContentEntry = Pick<VocabWord, 
  'anchor' | 
  'phonetic' | 
  'syllables' | 
  'semanticCluster' | 
  'connotation' | 
  'roles' | 
  'examples' | 
  'collocations' | 
  'relatedWordIds' | 
  'boundaryNotes' |
  'etymology' | 
  'mnemonic' | 
  'culturalNotes' | 
  'avoidWhen' |
  'isKu' |
  'ku'
>;

export const vocabContent: Record<string, VocabContentEntry> = {};
