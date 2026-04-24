import type { MasteryStatus } from '../types/mastery';

export const curriculums = [
  {
    id: "intro",
    title: "Introduction Level",
    modules: [
      { id: "intro_ch1", title: "Chapter 1: Phonology and Orthography" },
      { id: "intro_ch2", title: "Chapter 2: Subjects, Predicates, and Objects (li and e)" },
      { id: "intro_ch3", title: "Chapter 3: Vocabulary and Modification" },
      { id: "intro_ch4", title: "Chapter 4: The pi Particle" },
      { id: "intro_ch5", title: "Chapter 5: Negation and Questions (ala, seme, anu seme)" }
    ]
  },
  {
    id: "intermediate",
    title: "Intermediate Level",
    modules: [
      { id: "inter_ch1", title: "Chapter 1: The Power of Particles (la and o)" },
      { id: "inter_ch2", title: "Chapter 2: Modification from Words to Concepts with pi" },
      { id: "inter_ch3", title: "Chapter 3: Preverbs" }
    ]
  },
  {
    id: "advanced",
    title: "Advanced Level",
    modules: [
      { id: "adv_ch7", title: "Chapter 7: Context and Condition: The la Particle" },
      { id: "adv_ch11", title: "Chapter 11: The Lexicalization Debate" }
    ]
  }
];

export const initialVocabulary = [
  { word: "pona", status: "mastered" as MasteryStatus, sessionNotes: "Flawless usage in both basic and modified forms." },
  { word: "toki", status: "confident" as MasteryStatus, sessionNotes: "Used correctly most of the time, occasionally used as a preverb incorrectly." },
  { word: "tu", status: "mastered" as MasteryStatus, sessionNotes: "Learning Session 13: confirmed Mastered. Flawless use in counting, ranking, and as 'half/divide'." },
  { word: "uta", status: "confident" as MasteryStatus, sessionNotes: "Study Session #4: one typo (uto) corrected; used correctly in final drills." },
  { word: "wan", status: "mastered" as MasteryStatus, sessionNotes: "Learning Session 13: confirmed Mastered. Flawless use in counting." },
  { word: "wile", status: "confident" as MasteryStatus, sessionNotes: "Good usage, occasionally forgets it functions as a preverb." },
  { word: "tonsi", status: "not_started" as MasteryStatus, sessionNotes: "" },
  { word: "unpa", status: "not_started" as MasteryStatus, sessionNotes: "" }
];

export const initialConcepts = [
  { id: "particle_li", title: "Subject Separator (li)", status: "mastered" as MasteryStatus, sessionNotes: "Understands exception for mi/sina." },
  { id: "particle_e", title: "Direct Object Marker (e)", status: "confident" as MasteryStatus, sessionNotes: "Sometimes forgets to use multiple 'e' for multiple objects." },
  { id: "particle_pi", title: "Modifier Grouping (pi)", status: "practicing" as MasteryStatus, sessionNotes: "Failed to identify the core 2-word minimum rule in an error-check drill. Reverted to Practicing." },
  { id: "pronoun_seme", title: "Question Word (seme)", status: "practicing" as MasteryStatus, sessionNotes: "Regressed to Practicing. Keep drilling question formations." }
];
