/* src/data/curriculum.ts */
import type { CurriculumLevel, CurriculumNode } from '../types/mastery';

const stage1Nodes: CurriculumNode[] = [
  { 
    id: "phi_sim", title: "Philosophy of Simplicity", requiredVocabIds: ["toki", "pona"], requiredGrammarIds: [], status: 'active', suggestedMethod: 'Quiz', type: 'Topic',
    activities: ['word-scramble', 'true-false'],
    richContent: [
      { type: 'text', content: "Toki Pona is a constructed language with a philosophy of minimalism. It reduces complex thoughts to their core meaning." },
      { type: 'structural', content: "toki = language/speech, pona = good/simple." },
      { type: 'callout', content: "Rule: Context is critical. A word's meaning depends heavily on the surrounding situation." }
    ]
  },
  { 
    id: "vowels", title: "Universal Vowels (a e i o u)", requiredVocabIds: ["mi", "e"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Toki Pona has only 5 vowels. Each vowel has one fixed sound with no diphthongs." },
      { type: 'structural', content: "a = 'ah', e = 'eh', i = 'ee', o = 'oh', u = 'oo'." },
      { type: 'callout', content: "Rule: Never combine vowels into diphthongs. Pronounce each vowel distinctly." }
    ]
  },
  { 
    id: "consonants", title: "The Nine Consonants", requiredVocabIds: ["sina", "li"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "There are only 9 consonants in Toki Pona: j, k, l, m, n, p, s, t, w." },
      { type: 'structural', content: "j sounds like 'y' in 'yes'. All other consonants are pronounced roughly as they are in English." },
      { type: 'callout', content: "Rule: There are no voiced pairs like b/d/g or fricatives like v/z/f. Always use the unvoiced equivalent." }
    ]
  },
  { 
    id: "syllables", title: "The Syllable Equation", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Words are built from a strict syllable structure. Every syllable must have a vowel." },
      { type: 'structural', content: "Formula: (Consonant) + Vowel + (Optional 'n'). Example: (C)V(n)" },
      { type: 'callout', content: "Rule: The combinations 'ji', 'ti', 'wo', 'wu' are forbidden. A syllable cannot end with 'n' if the next begins with 'm' or 'n'." }
    ]
  },
  { 
    id: "stress", title: "The Pulse (Initial Stress)", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "In spoken Toki Pona, word stress is entirely predictable and regular." },
      { type: 'structural', content: "Stress = First Syllable." },
      { type: 'callout', content: "Rule: Always place the emphasis on the very first syllable of every word, regardless of its length." }
    ]
  },
  { 
    id: "name_adapt", title: "Name Adaptation", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Foreign names must be converted to fit Toki Pona's phonetic rules and are treated as proper adjectives." },
      { type: 'structural', content: "noun + adapted_name (e.g., jan Maikolo = Michael)." },
      { type: 'callout', content: "Rule: Never use a proper name by itself. It must always follow a head noun categorizing it." }
    ]
  },
  { 
    id: "cp1", title: "Checkpoint: The Sound of Simplicity", requiredVocabIds: ["mi", "sina", "toki", "pona", "li", "e"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Validates phonology knowledge before grammar begins." },
      { type: 'callout', content: "Rule: Master the 5 vowels, 9 consonants, and syllable structure to proceed." }
    ]
  },
];

const stage2Nodes: CurriculumNode[] = [
  { 
    id: "svo_intro", title: "SVO Sentence Structure", requiredVocabIds: ["mi", "sina", "ona", "jan", "ijo"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Quiz', type: 'Topic',
    richContent: [
      { type: 'text', content: "Toki Pona sentences follow a Subject -> Verb -> Object (SVO) order, similar to English." },
      { type: 'structural', content: "Subject + Verb + Object" },
      { type: 'callout', content: "Rule: The basic flow of action is always linear from actor to action to target." }
    ]
  },
  { 
    id: "li_rule", title: "The Divider 'li'", requiredVocabIds: ["li", "ona", "jan", "suli", "moku"], requiredGrammarIds: ["particle_li"], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "The particle 'li' is used to separate the subject of the sentence from its verb or predicate." },
      { type: 'structural', content: "[Subject] + li + [Verb/Predicate]" },
      { type: 'callout', content: "Rule: You must use 'li' when the subject is anything OTHER than exactly 'mi' or 'sina'." }
    ]
  },
  { 
    id: "e_rule", title: "The Direct Object 'e'", requiredVocabIds: ["e", "mi", "sina", "ona", "moku", "kama", "tawa"], requiredGrammarIds: ["particle_e"], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "The particle 'e' marks the direct object of a sentence. It indicates the thing receiving the action." },
      { type: 'structural', content: "[Subject] + li + [Verb] + e + [Object]" },
      { type: 'callout', content: "Rule: Without 'e', the verb is considered intransitive. 'e' is required to explicitly state a direct object." }
    ]
  },
  { 
    id: "mi_sina_exception", title: "The mi/sina Exception", requiredVocabIds: ["mi", "sina"], requiredGrammarIds: ["particle_li"], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "There is exactly one exception to the 'li' rule: when the subject is exactly 'mi' or exactly 'sina'." },
      { type: 'structural', content: "mi + [Verb/Predicate]  OR  sina + [Verb/Predicate]" },
      { type: 'callout', content: "Rule: If 'mi' or 'sina' has any modifiers (e.g., 'mi mute'), the 'li' must be restored." }
    ]
  },
  { 
    id: "en_conjunction", title: "Connecting Subjects with 'en'", requiredVocabIds: ["en", "mi", "sina", "ona", "jan", "ijo"], requiredGrammarIds: ["particle_li"], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "The particle 'en' is used strictly to join multiple subjects together in a sentence." },
      { type: 'structural', content: "[Subject 1] + en + [Subject 2] + li + [Verb]" },
      { type: 'callout', content: "Rule: Using 'en' to join subjects ALWAYS requires the use of 'li', even if the subjects are 'mi' or 'sina'." }
    ]
  },
  { 
    id: "cp2", title: "Checkpoint: Building the Core", requiredVocabIds: ["mi", "sina", "ona", "li", "e", "en", "jan", "ijo", "moku", "suli", "tawa", "kama"], requiredGrammarIds: ["particle_li", "particle_e"], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Write 5 sentences covering: basic SVO, li usage, e usage, mi/sina exception, en compound subject." },
      { type: 'callout', content: "Includes Phrasebook integration: Basic Greetings." }
    ]
  },
];

const stage3Nodes: CurriculumNode[] = [
  { 
    id: "head_initial", title: "Head-Initial Rule", requiredVocabIds: ["jan", "tomo", "toki", "pona", "ike"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'drag-drop'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Toki Pona is strictly head-initial. The main word (noun or verb) comes first, and all words that modify or describe it must follow it." },
      { type: 'structural', content: "[Head Word] + [Modifier]" },
      { type: 'callout', content: "Rule: Modifiers always come AFTER the word they modify. For example, 'good person' is 'jan pona' (person good)." }
    ]
  },
  { 
    id: "simple_mods", title: "Simple Modifiers", requiredVocabIds: ["pona", "ike", "suli", "lili"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'drag-drop'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Any word in Toki Pona can act as a modifier for any other word, taking on the role of an adjective or an adverb depending on what it modifies." },
      { type: 'structural', content: "[Noun] + [Adjective]  OR  [Verb] + [Adverb]" },
      { type: 'callout', content: "Rule: There are no distinct word classes for adjectives or adverbs. A word's function is determined purely by its position." }
    ]
  },
  { 
    id: "multiple_mods", title: "Chain of Modifiers", requiredVocabIds: ["suli", "lili", "wawa", "mute"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'drag-drop'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "When multiple modifiers are used, each new modifier applies to the entire phrase that precedes it." },
      { type: 'structural', content: "[[Head Noun] + Modifier 1] + Modifier 2" },
      { type: 'callout', content: "Rule: The modifier order changes the meaning. 'jan pona suli' means a '(good person) who is big'." }
    ]
  },
  { 
    id: "polysemy", title: "The Art of Polysemy", requiredVocabIds: ["pona", "ike", "suli", "lili", "wawa", "mute"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'drag-drop'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Because Toki Pona has a small vocabulary, every word covers a broad semantic space. Words rely heavily on context for precise translation." },
      { type: 'structural', content: "Semantic Cluster -> Context -> Specific Interpretation" },
      { type: 'callout', content: "Rule: Do not look for 1-to-1 translations with English. Focus on the core concept and how the context shapes it." }
    ]
  },
  { 
    id: "cp3", title: "Checkpoint: The Art of Description", requiredVocabIds: ["pona", "ike", "suli", "lili", "wawa", "mute"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'drag-drop'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Build 3 phrases with modifiers; demonstrate the head-initial rule; explain how modifier order changes meaning in a chain of modifiers." },
      { type: 'callout', content: "Includes Phrasebook integration: Colors and Numbers." }
    ]
  },
];

const stage4Nodes: CurriculumNode[] = [
  { 
    id: "pi_intro", title: "Intro to 'pi'", requiredVocabIds: ["pi", "jan", "tomo", "toki", "pona"], requiredGrammarIds: ["particle_pi"], status: 'locked', activities: ['word-scramble', 'drag-drop', 'thought-translation'], suggestedMethod: 'Quiz', type: 'Topic',
    richContent: [
      { type: 'text', content: "The particle 'pi' is used to regroup modifiers. Instead of each modifier applying back to the head noun independently, 'pi' turns the words following it into a single modifying unit." },
      { type: 'structural', content: "[Head Noun] + pi + [Modifier 1 + Modifier 2]" },
      { type: 'callout', content: "Rule: 'pi' does NOT mean 'of' and it is not a preposition. It purely regroups adjectives/adverbs." }
    ]
  },
  { 
    id: "pi_grouping", title: "Grouping with 'pi'", requiredVocabIds: ["pi", "jan", "tomo", "lawa", "pona", "mute"], requiredGrammarIds: ["particle_pi"], status: 'locked', activities: ['word-scramble', 'drag-drop', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Without 'pi', words stack strictly right-to-left. With 'pi', everything after 'pi' groups together first, then applies to the head noun as a whole." },
      { type: 'structural', content: "'jan lawa pona' = good leader. 'jan pi lawa pona' = person of good leadership." },
      { type: 'callout', content: "Rule: English possessives are often translated using 'pi', but only because possessives act like a grouped modifier." }
    ]
  },
  { 
    id: "pi_2word", title: "The 2-Word Rule", requiredVocabIds: ["pi", "tomo", "mi", "jan"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'drag-drop', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Because 'pi' exists to group multiple words together, it makes no logical sense to use it before a single word." },
      { type: 'structural', content: "INVALID: tomo pi mi. VALID: tomo mi." },
      { type: 'callout', content: "Rule: 'pi' must ALWAYS be followed by at least two words. Never use 'pi' before a single modifier." }
    ]
  },
  { 
    id: "pi_stacks", title: "pi Stacks", requiredVocabIds: ["pi", "jan", "tomo", "toki", "pona", "lawa", "mute"], requiredGrammarIds: ["particle_pi"], status: 'locked', activities: ['word-scramble', 'drag-drop', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Multiple 'pi' groups can follow a single head noun. Each 'pi' resets the grouping boundary, starting a new modifying phrase." },
      { type: 'structural', content: "[Head] + pi + [Mod A + Mod B] + pi + [Mod C + Mod D]" },
      { type: 'callout', content: "Rule: Avoid overusing 'pi' stacks. While grammatically valid, they become difficult to parse and violate the philosophy of simplicity." }
    ]
  },
  { 
    id: "cp4", title: "Checkpoint: Complex Concepts", requiredVocabIds: ["pi", "jan", "tomo", "lawa", "pona", "mute"], requiredGrammarIds: ["particle_pi"], status: 'locked', activities: ['word-scramble', 'drag-drop', 'thought-translation'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Explain when 'pi' is and isn't needed; fix sentences violating the 2-word rule; translate complex grouped concepts." },
      { type: 'callout', content: "Includes Phrasebook integration: Family and Relationships." }
    ]
  },
];

const stage5Nodes: CurriculumNode[] = [
  { 
    id: "ala_negation", title: "Negation with 'ala'", requiredVocabIds: ["ala", "mi", "sina", "ona", "li", "pona", "toki", "moku"], requiredGrammarIds: ["particle_li"], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "The word 'ala' acts as a negator. When placed immediately after a verb or adjective, it negates that word." },
      { type: 'structural', content: "[Verb/Adjective] + ala" },
      { type: 'callout', content: "Rule: 'ala' always follows the word it negates. 'mi moku ala' means 'I do not eat'." }
    ]
  },
  { 
    id: "yes_no_quest", title: "Yes/No Questions", requiredVocabIds: ["ala", "mi", "sina", "ona", "li", "pona", "toki", "moku"], requiredGrammarIds: ["particle_li"], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Yes/No questions are formed by stating the verb, followed by 'ala', and then repeating the verb." },
      { type: 'structural', content: "[Verb] + ala + [Verb]" },
      { type: 'callout', content: "Rule: Yes/No questions are formed using the [verb] ala [verb] structure. To answer yes, repeat the verb. To answer no, reply with [verb] + ala." }
    ]
  },
  { 
    id: "seme_quest", title: "Information with 'seme'", requiredVocabIds: ["seme", "mi", "sina", "ona", "li", "jan", "tomo", "toki"], requiredGrammarIds: ["particle_li", "particle_e"], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "The word 'seme' is used to ask 'what' or 'who'. It acts as a placeholder for the unknown information." },
      { type: 'structural', content: "Subject + li + seme?  OR  Subject + li + Verb + e + seme?" },
      { type: 'callout', content: "Rule: 'seme' simply replaces the missing information in the sentence. It does not move to the front like in English." }
    ]
  },
  { 
    id: "anu_seme", title: "Choice with 'anu seme'", requiredVocabIds: ["anu", "seme", "mi", "sina", "ona", "li"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Adding 'anu seme' at the end of a statement turns it into a question asking 'or what?' or 'right?'." },
      { type: 'structural', content: "[Statement] + anu seme?" },
      { type: 'callout', content: "Rule: This is a softer, more conversational alternative to the strict 'verb ala verb' structure." }
    ]
  },
  { 
    id: "cp5", title: "Checkpoint: Interaction", requiredVocabIds: ["ala", "seme", "anu"], requiredGrammarIds: ["particle_li", "particle_e"], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Form one of each question type; negate a sentence; correctly answer a yes/no question." },
      { type: 'callout', content: "Includes Phrasebook integration: Questions and Small Talk." }
    ]
  },
];

const stage6Nodes: CurriculumNode[] = [
  { 
    id: "preverb_wile", title: "Desire: wile", requiredVocabIds: ["wile", "mi", "sina", "ona", "li", "moku", "toki", "pali", "tawa", "ken", "awen", "kama", "sona", "lukin"], requiredGrammarIds: ["particle_li", "particle_e"], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Drill',
    richContent: [
      { type: 'text', content: "A preverb modifies the action of the main verb (e.g., wanting to do it, being able to do it). 'wile' means to want or need to do the action." },
      { type: 'structural', content: "[Subject] li [Preverb] + [Verb]" },
      { type: 'callout', content: "Rule: Preverbs like 'wile' must come directly before the main verb they modify." }
    ]
  },
  { 
    id: "preverb_ken", title: "Ability: ken", requiredVocabIds: ["ken", "mi", "sina", "ona", "li", "toki", "pali", "tawa", "wile", "awen", "kama", "sona", "lukin"], requiredGrammarIds: ["particle_li"], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Drill',
    richContent: [
      { type: 'text', content: "'ken' is a preverb that means 'can' or 'is able to' perform the following action." },
      { type: 'structural', content: "sina ken toki (You are able to speak)." },
      { type: 'callout', content: "Rule: Just like 'wile', 'ken' is placed immediately before the main verb." }
    ]
  },
  { 
    id: "preverb_kama", title: "Becoming: kama", requiredVocabIds: ["kama", "mi", "sina", "ona", "li", "sona", "pona", "jo", "wile", "ken", "awen", "lukin"], requiredGrammarIds: ["particle_li"], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Drill',
    richContent: [
      { type: 'text', content: "'kama' as a preverb indicates an action is starting, becoming, or coming to pass. For example, 'kama sona' literally means 'to come to know', which is the phrase for 'learning'." },
      { type: 'structural', content: "[Subject] li kama + [Verb]" },
      { type: 'callout', content: "Rule: Preverbs precede the verb but follow the subject marker 'li'." }
    ]
  },
  { 
    id: "prep_lon", title: "Locality: lon", requiredVocabIds: ["lon", "mi", "sina", "tomo", "ma", "tenpo", "ni", "tawa", "tan", "sama", "kepeken"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Drill',
    richContent: [
      { type: 'text', content: "Prepositions like 'lon' (in/at/on) usually attach to the end of a sentence to provide location context." },
      { type: 'structural', content: "[Subject] li [Verb] e [Object] + lon + [Noun]" },
      { type: 'callout', content: "Rule: A preposition phrase always follows the direct object (if there is one). 'mi moku e kili lon tomo' (I eat fruit in the house)." }
    ]
  },
  { 
    id: "prep_tawa", title: "Motion: tawa", requiredVocabIds: ["tawa", "mi", "sina", "ona", "tomo", "ma", "jan", "lon", "tan", "sama", "kepeken"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Drill',
    richContent: [
      { type: 'text', content: "'tawa' acting as a preposition indicates direction (to/toward) or opinion (from the perspective of). It attaches at the end of the sentence." },
      { type: 'structural', content: "[Subject] li [Verb] + tawa + [Noun]" },
      { type: 'callout', content: "Rule: When providing context like destination, add the prepositional phrase to the end of the action." }
    ]
  },
  { 
    id: "prep_tan", title: "Origin: tan", requiredVocabIds: ["tan", "mi", "sina", "ona", "ma", "jan", "tomo", "lon", "tawa", "sama", "kepeken"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Drill',
    richContent: [
      { type: 'text', content: "The preposition 'tan' denotes origin (from) or cause (because of)." },
      { type: 'structural', content: "[Subject] li [Verb] + tan + [Noun]" },
      { type: 'callout', content: "Rule: Place the 'tan' phrase at the end of the sentence to show where the action originated." }
    ]
  },
  { 
    id: "prep_kepeken", title: "Utility: kepeken", requiredVocabIds: ["kepeken", "mi", "sina", "ona", "ilo", "toki", "pali", "lon", "tawa", "tan", "sama"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Drill',
    richContent: [
      { type: 'text', content: "The preposition 'kepeken' denotes utility, meaning 'using' or 'by means of' an instrument or tool." },
      { type: 'structural', content: "[Subject] li [Verb] + kepeken + [Noun]" },
      { type: 'callout', content: "Rule: Append the 'kepeken' phrase to the end of the sentence to explain the tool used for the action." }
    ]
  },
  { 
    id: "cp6", title: "Checkpoint: Action & Location", requiredVocabIds: ["wile", "ken", "awen", "kama", "sona", "lukin", "lon", "tawa", "tan", "sama", "kepeken"], requiredGrammarIds: ["particle_li", "particle_e"], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Use each preverb correctly before a main verb; build sentences with prepositional phrases at the end indicating location, movement, origin, and tool used." },
      { type: 'callout', content: "Includes Phrasebook integration: Travel and Needs." }
    ]
  },
  {
    id: "midterm_exam", title: "Midterm Exam", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['exam-mode'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Comprehensive assessment covering Stages 1 through 6." },
      { type: 'callout', content: "Format: Translation, Multiple Choice, and True/False." }
    ]
  },
];

const stage7Nodes: CurriculumNode[] = [
  { 
    id: "la_intro", title: "Context with 'la'", requiredVocabIds: ["la", "tenpo", "ma", "jan"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "The particle 'la' separates the context of a sentence from the main statement. The context can be a time, a location, or a condition." },
      { type: 'structural', content: "[Context Phrase] la [Main Sentence]" },
      { type: 'callout', content: "Rule: Everything before 'la' sets the stage. The main action happens after 'la'." }
    ]
  },
  { 
    id: "la_conditions", title: "If / Then Conditions", requiredVocabIds: ["la", "ken", "wile", "pona", "ike"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Toki Pona does not have distinct words for 'if' or 'then'. Instead, 'la' handles conditional statements naturally by making the condition the context." },
      { type: 'structural', content: "[If X] la [Then Y]" },
      { type: 'callout', content: "Rule: To say 'If it is good, I will eat', say 'ona li pona la mi moku' (It is good [context] -> I eat)." }
    ]
  },
  { 
    id: "la_tenpo", title: "Time Context: tenpo ni la", requiredVocabIds: ["la", "tenpo", "ni", "suno", "pimeja"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Time is frequently established using 'la'. Common time phrases include 'tenpo ni la' (now/today) or 'tenpo suno la' (during the day)." },
      { type: 'structural', content: "tenpo ni la + [Main Sentence]" },
      { type: 'callout', content: "Rule: Time phrases almost always come at the beginning of the sentence before 'la', rather than at the end." }
    ]
  },
  { 
    id: "la_ken", title: "Possibility: ken la", requiredVocabIds: ["la", "ken", "lon", "ala"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "The phrase 'ken la' translates to 'maybe' or 'possibly'. It sets the context that the following statement is only a possibility." },
      { type: 'structural', content: "ken la + [Main Sentence]" },
      { type: 'callout', content: "Rule: Use 'ken la' at the start of a sentence to express uncertainty." }
    ]
  },
  { 
    id: "la_multiple", title: "Single Context Rule", requiredVocabIds: ["la", "tenpo", "ma", "ken"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "A sentence should generally only have one 'la' phrase to maintain simplicity. Multiple contexts can become confusing." },
      { type: 'structural', content: "[Context] la [Sentence]" },
      { type: 'callout', content: "Rule: Avoid stacking multiple 'la' phrases. Combine context words if necessary, but keep it simple." }
    ]
  },
  { 
    id: "cp7", title: "Checkpoint: Context & Conditions", requiredVocabIds: ["la", "tenpo", "ken", "ni"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Create sentences using 'la' to establish a time context; translate an if/then conditional statement; express possibility using 'ken la'." },
      { type: 'callout', content: "Includes Phrasebook integration: Time, Weather, and Conditions." }
    ]
  },
];

const stage8Nodes: CurriculumNode[] = [
  { 
    id: "o_vocative", title: "Addressing: o", requiredVocabIds: ["o", "jan", "mi", "sina"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "The particle 'o' is used to address someone directly, getting their attention before speaking to them." },
      { type: 'structural', content: "[Name/Noun] o, [Sentence]" },
      { type: 'callout', content: "Rule: When addressing someone, put 'o' after their name or title, often followed by a pause (comma)." }
    ]
  },
  { 
    id: "o_imperative", title: "Commands: o", requiredVocabIds: ["o", "moku", "toki", "pali", "tawa", "e"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "To issue a command, request, or instruction, start the sentence directly with 'o' followed by the verb." },
      { type: 'structural', content: "o [Verb] e [Object]" },
      { type: 'callout', content: "Rule: Do not use 'sina li' for commands. Start directly with 'o'. Example: 'o moku' (Eat!)." }
    ]
  },
  { 
    id: "o_optative", title: "Wishes & Let's: o", requiredVocabIds: ["o", "mi", "ona", "jan", "pona"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "When 'o' replaces 'li' in a regular sentence, it expresses a wish, a desire, or a 'let's' statement." },
      { type: 'structural', content: "mi / ona / [Subject] o [Verb]" },
      { type: 'callout', content: "Rule: 'mi o tawa' means 'Let's go' or 'I should go'. 'ona o pona' means 'May they be well'." }
    ]
  },
  { 
    id: "taso_particle", title: "But & Only: taso", requiredVocabIds: ["taso", "pona", "ike", "mi", "sina"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "The word 'taso' serves two functions depending on its position. At the beginning of a sentence, it means 'but'. After a word, it acts as a modifier meaning 'only'." },
      { type: 'structural', content: "taso, [Sentence] (But, ...) OR [Noun] taso (Only [Noun])" },
      { type: 'callout', content: "Rule: 'taso, mi wile ala' (But, I don't want to). 'mi taso li moku' (Only I eat)." }
    ]
  },
  { 
    id: "cp8", title: "Checkpoint: Expression & Final Mastery", requiredVocabIds: ["o", "taso", "jan", "pona", "wile"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble', 'true-false', 'thought-translation'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Translate a vocative address; form a command using 'o'; express a wish; use 'taso' correctly as both 'but' and 'only'." },
      { type: 'callout', content: "Includes Phrasebook integration: Advanced Expressions and Philosophy." }
    ]
  },
  {
    id: "final_exam", title: "Final Exam", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['exam-mode'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Comprehensive assessment covering all foundational Toki Pona concepts." },
      { type: 'callout', content: "Format: Translation, Multiple Choice, and True/False." }
    ]
  },
];

export const curriculumRoadmap: CurriculumLevel[] = [
  { id: "stage1", title: "Stage 1: The Sound of Simplicity", nodes: stage1Nodes },
  { id: "stage2", title: "Stage 2: Building the Core", nodes: stage2Nodes },
  { id: "stage3", title: "Stage 3: The Art of Description", nodes: stage3Nodes },
  { id: "stage4", title: "Stage 4: Complex Concepts", nodes: stage4Nodes },
  { id: "stage5", title: "Stage 5: Interaction", nodes: stage5Nodes },
  { id: "stage6", title: "Stage 6: Action & Location", nodes: stage6Nodes },
  { id: "stage7", title: "Stage 7: Context & Conditions", nodes: stage7Nodes },
  { id: "stage8", title: "Stage 8: Expression & Final Mastery", nodes: stage8Nodes },
];
