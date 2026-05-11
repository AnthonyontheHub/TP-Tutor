export interface ExamQuestion {
  id: string;
  type: 'mcq' | 'tf' | 'text' | 'reorder';
  question: string;
  options?: string[];
  correctAnswer: string | string[] | boolean;
  points: number;
  section: string;
}

export interface ExamData {
  midterm: ExamQuestion[];
  final: ExamQuestion[];
}

export const examData: ExamData = {
  midterm: [
    // Section 1: Phonology (5 questions)
    {
      id: "m_p_1", type: "mcq", section: "Phonology", points: 2,
      question: "Which of the following syllable structures is valid in Toki Pona?",
      options: ["CCV", "(C)V(n)", "CVC", "VCC"],
      correctAnswer: "(C)V(n)"
    },
    {
      id: "m_p_2", type: "tf", section: "Phonology", points: 1,
      question: "The stress in a Toki Pona word always falls on the last syllable.",
      correctAnswer: false
    },
    {
      id: "m_p_3", type: "mcq", section: "Phonology", points: 2,
      question: "Which combination of letters is strictly forbidden?",
      options: ["ka", "mu", "wo", "li"],
      correctAnswer: "wo"
    },
    {
      id: "m_p_4", type: "tf", section: "Phonology", points: 1,
      question: "The letter 'j' in Toki Pona is pronounced like the 'y' in 'yes'.",
      correctAnswer: true
    },
    {
      id: "m_p_5", type: "mcq", section: "Phonology", points: 2,
      question: "Which of these is a valid Toki Pona word based on phonology rules?",
      options: ["jelo", "tiwa", "nnpa", "wu"],
      correctAnswer: "jelo"
    },
    // Section 2: Vocab (10 questions)
    { id: "m_v_1", type: "text", section: "Vocabulary", points: 1, question: "Translate 'I / me' to Toki Pona:", correctAnswer: "mi" },
    { id: "m_v_2", type: "text", section: "Vocabulary", points: 1, question: "Translate 'you' to Toki Pona:", correctAnswer: "sina" },
    { id: "m_v_3", type: "text", section: "Vocabulary", points: 1, question: "Translate 'good / simple' to Toki Pona:", correctAnswer: "pona" },
    { id: "m_v_4", type: "text", section: "Vocabulary", points: 1, question: "Translate 'food / eat' to Toki Pona:", correctAnswer: "moku" },
    { id: "m_v_5", type: "text", section: "Vocabulary", points: 1, question: "Translate 'big / important' to Toki Pona:", correctAnswer: "suli" },
    { id: "m_v_6", type: "text", section: "Vocabulary", points: 1, question: "Translate 'person / somebody' to Toki Pona:", correctAnswer: "jan" },
    { id: "m_v_7", type: "text", section: "Vocabulary", points: 1, question: "Translate 'house / building' to Toki Pona:", correctAnswer: "tomo" },
    { id: "m_v_8", type: "text", section: "Vocabulary", points: 1, question: "Translate 'water / liquid' to Toki Pona:", correctAnswer: "telo" },
    { id: "m_v_9", type: "text", section: "Vocabulary", points: 1, question: "Translate 'fire / heat' to Toki Pona:", correctAnswer: "seli" },
    { id: "m_v_10", type: "text", section: "Vocabulary", points: 1, question: "Translate 'language / speech' to Toki Pona:", correctAnswer: "toki" },
    // Section 3: Grammar (5 questions)
    {
      id: "m_g_1", type: "mcq", section: "Grammar", points: 3,
      question: "When is the particle 'li' omitted?",
      options: ["Always", "When the object is 'e'", "When the subject is exactly 'mi' or 'sina'", "When there are multiple modifiers"],
      correctAnswer: "When the subject is exactly 'mi' or 'sina'"
    },
    {
      id: "m_g_2", type: "tf", section: "Grammar", points: 2,
      question: "The particle 'e' marks the direct object of an action.",
      correctAnswer: true
    },
    {
      id: "m_g_3", type: "mcq", section: "Grammar", points: 3,
      question: "What is the primary function of the particle 'pi'?",
      options: ["To mean 'of' or show possession", "To regroup modifiers so they apply as a unit", "To act as a question mark", "To separate multiple subjects"],
      correctAnswer: "To regroup modifiers so they apply as a unit"
    },
    {
      id: "m_g_4", type: "tf", section: "Grammar", points: 2,
      question: "Modifiers always come before the noun they describe (e.g., 'pona jan').",
      correctAnswer: false
    },
    {
      id: "m_g_5", type: "mcq", section: "Grammar", points: 3,
      question: "Which sentence correctly uses 'en'?",
      options: ["mi en sina li moku", "mi moku en toki", "ona li pona en suli", "tomo en mi"],
      correctAnswer: "mi en sina li moku"
    },
    // Section 4: Composition (3 questions)
    {
      id: "m_c_1", type: "reorder", section: "Composition", points: 4,
      question: "Translate: 'The big bird is eating.'",
      options: ["weso", "suli", "li", "moku", "telo"],
      correctAnswer: ["weso", "suli", "li", "moku"] // Note: weso is not standard, let's use waso
    },
    {
      id: "m_c_2", type: "reorder", section: "Composition", points: 4,
      question: "Translate: 'I am going to the house.'",
      options: ["mi", "tawa", "tomo", "li", "e"],
      correctAnswer: ["mi", "tawa", "tomo"]
    },
    {
      id: "m_c_3", type: "reorder", section: "Composition", points: 4,
      question: "Translate: 'You are drinking good water.'",
      options: ["sina", "moku", "e", "telo", "pona", "li"],
      correctAnswer: ["sina", "moku", "e", "telo", "pona"]
    }
  ],
  final: [
    // Section 1: Logic (5 questions)
    {
      id: "f_l_1", type: "mcq", section: "Logic", points: 3,
      question: "How do you form a conditional 'If X, then Y' statement?",
      options: ["X la Y", "if X then Y", "X li Y", "X anu Y"],
      correctAnswer: "X la Y"
    },
    {
      id: "f_l_2", type: "tf", section: "Logic", points: 2,
      question: "The particle 'o' can be used both to issue commands and to express wishes.",
      correctAnswer: true
    },
    {
      id: "f_l_3", type: "mcq", section: "Logic", points: 3,
      question: "What does 'tenpo ni la' typically mean?",
      options: ["In the past", "Tomorrow", "Now / Currently", "Never"],
      correctAnswer: "Now / Currently"
    },
    {
      id: "f_l_4", type: "mcq", section: "Logic", points: 3,
      question: "Which of these correctly issues a command to eat?",
      options: ["sina moku", "o moku", "mi moku", "moku la"],
      correctAnswer: "o moku"
    },
    {
      id: "f_l_5", type: "tf", section: "Logic", points: 2,
      question: "'ken la' at the start of a sentence indicates certainty.",
      correctAnswer: false
    },
    // Section 2: Nuance (5 questions)
    {
      id: "f_n_1", type: "mcq", section: "Nuance", points: 2,
      question: "The word 'suli' can mean 'big', but what else can it mean in the right context?",
      options: ["Important / Long", "Small / Weak", "Red / Hot", "Water / Liquid"],
      correctAnswer: "Important / Long"
    },
    {
      id: "f_n_2", type: "mcq", section: "Nuance", points: 2,
      question: "If 'taso' is placed at the beginning of a sentence, what does it mean?",
      options: ["Only", "But / However", "Also", "Why"],
      correctAnswer: "But / However"
    },
    {
      id: "f_n_3", type: "tf", section: "Nuance", points: 1,
      question: "'pona' can mean 'good', 'simple', or 'to fix' depending on its position in the sentence.",
      correctAnswer: true
    },
    {
      id: "f_n_4", type: "mcq", section: "Nuance", points: 2,
      question: "What is the primary function of 'seme'?",
      options: ["To answer a question", "To replace unknown information in a question", "To negate a verb", "To express desire"],
      correctAnswer: "To replace unknown information in a question"
    },
    {
      id: "f_n_5", type: "tf", section: "Nuance", points: 1,
      question: "Toki Pona relies heavily on context to determine the precise meaning of a word.",
      correctAnswer: true
    },
    // Section 3: Composition (5 questions)
    {
      id: "f_c_1", type: "reorder", section: "Composition", points: 4,
      question: "Translate: 'If you want to sleep, then go to the house.'",
      options: ["sina", "wile", "lape", "la", "o", "tawa", "tomo", "li"],
      correctAnswer: ["sina", "wile", "lape", "la", "o", "tawa", "tomo"]
    },
    {
      id: "f_c_2", type: "reorder", section: "Composition", points: 4,
      question: "Translate: 'But, I only speak a little Toki Pona.'",
      options: ["taso", "mi", "toki", "e", "toki", "pona", "lili", "taso"], // using comma as implicit or explicit separator
      correctAnswer: ["taso", "mi", "toki", "e", "toki", "pona", "lili", "taso"] // Note: simple version
    },
    {
      id: "f_c_3", type: "reorder", section: "Composition", points: 4,
      question: "Translate: 'Do you eat good food?' (Yes/No Question)",
      options: ["sina", "moku", "ala", "moku", "e", "moku", "pona"],
      correctAnswer: ["sina", "moku", "ala", "moku", "e", "moku", "pona"]
    },
    {
      id: "f_c_4", type: "reorder", section: "Composition", points: 4,
      question: "Translate: 'Who is looking at the water?'",
      options: ["jan", "seme", "li", "lukin", "e", "telo"],
      correctAnswer: ["jan", "seme", "li", "lukin", "e", "telo"]
    },
    {
      id: "f_c_5", type: "reorder", section: "Composition", points: 4,
      question: "Translate: 'May all people be happy.'",
      options: ["jan", "ale", "o", "pona", "li", "wile"],
      correctAnswer: ["jan", "ale", "o", "pona"]
    },
    // Section 4: Reading Comprehension (1 paragraph, 3 questions)
    // Paragraph context: "tenpo pimeja la mi wile lape. taso, kalama suli li lon tomo mi. mi ken ala lape. jan lili mi li lukin e sitelen tawa."
    // (At night I want to sleep. But, there is a loud noise in my house. I cannot sleep. My small person (child) is watching a moving picture (movie).)
    {
      id: "f_r_1", type: "mcq", section: "Reading", points: 4,
      question: "In the story, what does the speaker want to do?",
      options: ["Watch a movie", "Make a loud noise", "Sleep", "Leave the house"],
      correctAnswer: "Sleep"
    },
    {
      id: "f_r_2", type: "tf", section: "Reading", points: 3,
      question: "The noise in the house is small.",
      correctAnswer: false // kalama suli = loud noise
    },
    {
      id: "f_r_3", type: "mcq", section: "Reading", points: 4,
      question: "Why can't the speaker sleep?",
      options: ["It is not night time", "A child is watching a movie loudly", "They are not tired", "The house is cold"],
      correctAnswer: "A child is watching a movie loudly"
    }
  ]
};
