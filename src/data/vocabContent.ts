import { 
  VocabWord, 
  PosRole, 
  ExampleTier, 
  Connotation, 
  PosRoleEntry, 
  ExampleSentence, 
  Collocation, 
  BoundaryNote 
} from '../types/mastery';

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
  'avoidWhen'
>;

/*
export const vocabContent: Record<string, VocabContentEntry> = {
...
};
*/
export const vocabContent: Record<string, VocabContentEntry> = {};
