export interface Chapter {
  id: string;
  title: string;
  sections: { subtitle: string; content: string }[];
  relatedNodeIds: string[];
}

export const textbookContent: Chapter[] = [
  {
    id: 'ch1-phonology',
    title: 'Chapter 1: The Phonetic Foundations',
    sections: [
      { subtitle: 'Vowels and Consonants', content: 'Toki Pona uses 5 vowels (a, e, i, o, u) and 9 consonants (j, k, l, m, n, p, s, t, w).' },
      { subtitle: 'The Syllable', content: 'The structure is (C)V(n). Every syllable must contain a vowel.' },
      { subtitle: 'Stress', content: 'Stress always falls on the first syllable of the word.' }
    ],
    relatedNodeIds: ['phi_sim', 'vowels', 'consonants', 'syllables', 'stress', 'name_adapt']
  },
  {
    id: 'ch2-li-e',
    title: 'Chapter 2: The Core Sentence',
    sections: [
      { subtitle: 'Subject and Verb', content: 'The particle "li" introduces the predicate or action.' },
      { subtitle: 'The Object', content: 'The particle "e" introduces the direct object, the target of the action.' },
      { subtitle: 'Exception', content: 'If the subject is mi or sina alone, "li" is omitted.' }
    ],
    relatedNodeIds: ['svo_intro', 'li_rule', 'e_rule', 'mi_sina_exception']
  },
  {
    id: 'ch3-modifiers',
    title: 'Chapter 3: Modifiers',
    sections: [
      { subtitle: 'Head-Initial Rule', content: 'The head noun or verb always comes first.' },
      { subtitle: 'Modifier Order', content: 'Modifiers follow the head. Each subsequent modifier applies to the entire preceding phrase.' }
    ],
    relatedNodeIds: ['head_initial', 'simple_mods', 'multiple_mods']
  },
  {
    id: 'ch4-pi',
    title: 'Chapter 4: pi Grouping',
    sections: [
      { subtitle: 'Grouping', content: 'Use "pi" to regroup modifiers as a single logical unit.' },
      { subtitle: 'Two-Word Rule', content: '"pi" must be followed by at least two words.' }
    ],
    relatedNodeIds: ['pi_intro', 'pi_grouping', 'pi_2word']
  },
  {
    id: 'ch5-questions',
    title: 'Chapter 5: Questions',
    sections: [
      { subtitle: 'Information Questions', content: 'Use "seme" to replace missing information.' },
      { subtitle: 'Yes/No Questions', content: 'Use the [verb] ala [verb] structure.' }
    ],
    relatedNodeIds: ['ala_negation', 'yes_no_quest', 'seme_quest']
  },
  {
    id: 'ch6-prepositions',
    title: 'Chapter 6: Prepositions',
    sections: [
      { subtitle: 'Context', content: 'Use lon, tawa, tan, kepeken to add context at the end of sentences.' }
    ],
    relatedNodeIds: ['prep_lon', 'prep_tawa', 'prep_tan', 'prep_kepeken']
  },
  {
    id: 'ch7-la',
    title: 'Chapter 7: Context with la',
    sections: [
      { subtitle: 'Context Separation', content: 'Use "la" to separate context (time/condition) from the main sentence.' }
    ],
    relatedNodeIds: ['la_intro', 'la_conditions']
  },
  {
    id: 'ch8-particles',
    title: 'Chapter 8: o and taso',
    sections: [
      { subtitle: 'Imperatives', content: 'Use "o" for commands or vocatives.' },
      { subtitle: 'Logic', content: 'Use "taso" for "but" (start) or "only" (post-modifier).' }
    ],
    relatedNodeIds: ['o_vocative', 'o_imperative', 'taso_particle']
  }
];
