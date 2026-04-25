/* src/data/curriculum.ts */
import type { CurriculumLevel } from '../types/mastery';

export const curriculumRoadmap: CurriculumLevel[] = [
  {
    id: "book_1",
    title: "Book 1: Introduction (The Core)",
    nodes: [
      { 
        id: "phonology", 
        title: "Phonology", 
        requiredVocabIds: ["a", "mu", "toki", "pona"], 
        requiredGrammarIds: [],
        status: 'active'
      },
      { 
        id: "subject_predicate", 
        title: "Subjects and Predicates", 
        requiredVocabIds: ["mi", "sina", "pona", "ike", "li"], 
        requiredGrammarIds: ["particle_li"],
        status: 'locked',
        richContent: [
          { type: 'text', content: "Mechanical dividers lock fluid words into strict syntax." },
          { type: 'structural', content: "The Assembly Line Equation: [Subject] + li + [Predicate]. In Toki Pona, the subject always comes first, followed by the action or state." },
          { type: 'callout', content: "The Omission Rule: 'li' is strictly omitted ONLY when the entire subject is the unmodified pronoun 'mi' or 'sina'." }
        ]
      },
      { 
        id: "direct_objects", 
        title: "Direct Objects", 
        requiredVocabIds: ["moku", "pana", "lukin", "e"], 
        requiredGrammarIds: ["particle_e"],
        status: 'locked'
      },
      { 
        id: "modifiers", 
        title: "Modifiers", 
        requiredVocabIds: ["suli", "lili", "jelo", "laso"], 
        requiredGrammarIds: [],
        status: 'locked'
      },
      { 
        id: "prepositions", 
        title: "Prepositions", 
        requiredVocabIds: ["lon", "tawa", "tan"], 
        requiredGrammarIds: [],
        status: 'locked'
      },
      { 
        id: "pi_pivot", 
        title: "The 'pi' Pivot", 
        requiredVocabIds: ["pi", "ilo", "kasi", "tomo"], 
        requiredGrammarIds: ["particle_pi"],
        status: 'locked'
      }
    ]
  },
  {
    id: "book_2",
    title: "Book 2: pona sona (Intermediate)",
    nodes: [
      { 
        id: "compounds", 
        title: "Compound Concepts", 
        requiredVocabIds: ["jan", "ma", "seli", "telo", "suno"], 
        requiredGrammarIds: [],
        status: 'locked'
      }
    ]
  },
  {
    id: "book_3",
    title: "Book 3: Advanced Guide (Fluency)",
    nodes: [
      { 
        id: "speed_nasin", 
        title: "Speed Nasin", 
        requiredVocabIds: ["la", "tenpo", "pini", "open", "sin"], 
        requiredGrammarIds: ["particle_la"],
        status: 'locked'
      }
    ]
  }
];
