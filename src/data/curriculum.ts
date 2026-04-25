/* src/data/curriculum.ts */
import type { CurriculumLevel } from '../types/mastery';

export const curriculumRoadmap: CurriculumLevel[] = [
  {
    id: "book_1",
    title: "Book 1: Introduction (The Core)",
    nodes: [
      { 
        id: "phonology", 
        title: "The Sound of Reality (Phonology)", 
        requiredVocabIds: [], 
        requiredGrammarIds: [],
        status: 'active',
        visualFramework: "/assets/NotebookLM Mind Map.png",
        requiredWordIds: [],
        richContent: [
          { type: 'text', content: "Filtering the noise into fourteen universal sounds." },
          { type: 'structural', content: "The (C)V(N) Syllable Equation: Every syllable follows a strict pattern of an optional consonant, a vowel, and an optional closing 'n'." },
          { type: 'callout', content: "The Rhythm Rule: Stress always falls on the initial syllable of every word. This creates the 'pulse' of the language." }
        ]
      },
      { 
        id: "subject_predicate", 
        title: "Simple Existence (Subject + Predicate)", 
        requiredVocabIds: ["mi", "sina", "ona", "li", "pona", "ike"], 
        requiredGrammarIds: ["particle_li"],
        status: 'locked',
        visualFramework: "/assets/Subjects and Predicates.png",
        requiredWordIds: ["mi", "sina", "ona", "li", "pona", "ike"],
        richContent: [
          { type: 'text', content: "Mechanical dividers lock fluid words into strict syntax." },
          { type: 'structural', content: "The Assembly Line Equation: [Subject] + li + [Predicate]. In Toki Pona, the subject always comes first, followed by the action or state." },
          { type: 'callout', content: "The Omission Rule: 'li' is strictly omitted ONLY when the entire subject is the unmodified pronoun 'mi' or 'sina'." }
        ]
      },
      { 
        id: "direct_objects", 
        title: "The Object of Desire (Direct Objects)", 
        requiredVocabIds: ["moku", "pana", "lukin", "e"], 
        requiredGrammarIds: ["particle_e"],
        status: 'locked',
        richContent: [
          { type: 'text', content: "Action requires a target. 'e' is the arrow." },
          { type: 'structural', content: "The Targeting System: [Verb] + e + [Object]. The particle 'e' tells the listener exactly what is being acted upon." },
          { type: 'callout', content: "The Double Arrow Rule: You can have multiple 'e' particles to act on multiple targets in a single sentence." }
        ]
      },
      { 
        id: "modifiers", 
        title: "The Art of Describing (Modifiers)", 
        requiredVocabIds: ["suli", "lili", "jelo", "laso"], 
        requiredGrammarIds: [],
        status: 'locked',
        richContent: [
          { type: 'text', content: "Nouns are fluid; context is everything. Describe what it does, not just what it is." },
          { type: 'structural', content: "The Law of Succession: Adjectives and modifiers always follow the word they describe. [Head] + [Modifier]." },
          { type: 'callout', content: "Contextual Fluidity: A single word like 'suli' can mean big, long, tall, important, or adult depending on what it follows." }
        ]
      },
      { 
        id: "prepositions", 
        title: "Space and Time (Prepositions)", 
        requiredVocabIds: ["lon", "tawa", "tan"], 
        requiredGrammarIds: [],
        status: 'locked',
        richContent: [
          { type: 'text', content: "Grounding abstract thoughts into the physical reality of the present moment." },
          { type: 'structural', content: "Location as Logic: [Verb] + [Preposition] + [Place]. Prepositions can also function as the main predicate of a sentence." },
          { type: 'callout', content: "Temporal Mapping: Expressing time in Toki Pona is often done by treating it as a physical location (e.g., 'tenpo ni' = this time/place)." }
        ]
      },
      { 
        id: "pi_pivot", 
        title: "The 'pi' Pivot (Complex Grouping)", 
        requiredVocabIds: ["pi"], 
        requiredGrammarIds: ["particle_pi"],
        status: 'locked',
        richContent: [
          { type: 'text', content: "Resisting the gravity of natural languages. Fluency is simplifying your thoughts." },
          { type: 'structural', content: "The Rule of Two: 'pi' is used to group two or more modifiers together before they apply to the head word." },
          { type: 'callout', content: "The Anti-Of Rule: Do not translate 'pi' as the English 'of'. It is a separator for grouping, not a possessive marker." }
        ]
      }
    ]
  }
];
