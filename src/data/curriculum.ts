/* src/data/curriculum.ts */
import type { CurriculumLevel } from '../types/mastery';

export const curriculumRoadmap: CurriculumLevel[] = [
  {
    id: "book_1",
    title: "Book 1: Introduction (The Core)",
    nodes: [
      { 
        id: "phonology", 
        title: "Phonology and Orthography", 
        requiredVocabIds: ["a", "mu", "toki", "pona"], 
        requiredGrammarIds: [],
        status: 'active'
      },
      { 
        id: "basic_sentences", 
        title: "Basic Sentences (li/e)", 
        requiredVocabIds: ["mi", "sina", "ona", "moku", "pali", "suli", "lili"], 
        requiredGrammarIds: ["particle_li", "particle_e"],
        status: 'locked'
      },
      { 
        id: "modifiers", 
        title: "Modifiers & Colors", 
        requiredVocabIds: ["pimeja", "walo", "loje", "jelo", "laso", "kule"], 
        requiredGrammarIds: [],
        status: 'locked'
      },
      { 
        id: "prepositions", 
        title: "Prepositions", 
        requiredVocabIds: ["lon", "kepeken", "tawa", "tan", "poka"], 
        requiredGrammarIds: [],
        status: 'locked'
      },
      { 
        id: "pi_particle", 
        title: "The 'pi' Particle", 
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
      },
      { 
        id: "metaphors", 
        title: "Abstract Metaphors", 
        requiredVocabIds: ["pilin", "sona", "nasin", "wawa", "kon"], 
        requiredGrammarIds: [],
        status: 'locked'
      },
      { 
        id: "preverbs", 
        title: "Complex Preverbs", 
        requiredVocabIds: ["wile", "kama", "awen", "ken", "lukin"], 
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
      },
      { 
        id: "community_dialects", 
        title: "Community Dialects", 
        requiredVocabIds: ["kipisi", "namako", "ali", "ali", "pu"], 
        requiredGrammarIds: [],
        status: 'locked'
      },
      { 
        id: "poetic_mastery", 
        title: "Poetic Mastery", 
        requiredVocabIds: ["musi", "kalama", "sitelen", "olin", "suwi"], 
        requiredGrammarIds: [],
        status: 'locked'
      }
    ]
  }
];
