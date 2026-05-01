/* src/data/curriculum.ts */
import type { CurriculumLevel, CurriculumNode } from '../types/mastery';

const stage1Nodes: CurriculumNode[] = [
  { 
    id: "phi_sim", title: "Philosophy of Simplicity", requiredVocabIds: [], requiredGrammarIds: [], status: 'active', suggestedMethod: 'Jan Lina Chat', type: 'Topic',
    activities: ['true-false', 'thought-translation'],
    infographicUrl: '/infographics/1 The Phonetic Foundations.png',
    richContent: [
      { type: 'text', content: "Conceptual intro to Toki Pona's design — ~120 words, intentional ambiguity, minimalism as a worldview." },
      { type: 'structural', content: "jan Lina explains the 'why' conversationally; discuss what simplicity means to the student personally." },
      { type: 'callout', content: "Practice: Student rephrases complex English concepts in simple terms (in English still)." }
    ]
  },
  { 
    id: "vowels", title: "Universal Vowels (a e i o u)", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Each vowel has one fixed sound, no diphthong ambiguity. a=ah, e=eh, i=ee, o=oh, u=oo" },
      { type: 'structural', content: "jan Lina demonstrates each sound with example words." },
      { type: 'callout', content: "Practice: Student sounds out written words aloud (or types phonetic pronunciation)." }
    ]
  },
  { 
    id: "consonants", title: "The Nine Consonants", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "j, k, l, m, n, p, s, t, w — no b/d/f/g/r/z etc." },
      { type: 'structural', content: "jan Lina contrasts with English consonants the student might try to use." },
      { type: 'callout', content: "Practice: Identify which English words CAN and CAN'T be directly used in Toki Pona." }
    ]
  },
  { 
    id: "syllables", title: "The Syllable Equation", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Structure is (C)V(n) — optional consonant, one vowel, optional trailing n. Forbidden combos: ji, ti, wo, wu, nn, nm" },
      { type: 'structural', content: "jan Lina walks through the formula with examples." },
      { type: 'callout', content: "Practice: Builder drill — is this syllable valid or not?" }
    ]
  },
  { 
    id: "stress", title: "The Pulse (Initial Stress)", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Stress always falls on the first syllable, without exception." },
      { type: 'structural', content: "jan Lina contrasts with English stress patterns (e.g. 'toKI' vs 'TOki')." },
      { type: 'callout', content: "Practice: Student marks stress on a list of words." }
    ]
  },
  { 
    id: "name_adapt", title: "Name Adaptation", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Jan Lina Chat', type: 'Topic',
    richContent: [
      { type: 'text', content: "Foreign names must be adapted to Toki Pona phonology. They become proper adjectives following 'jan' (or other head noun). E.g. 'Michael' -> 'jan Maikolo'" },
      { type: 'structural', content: "jan Lina adapts the student's own name together with them." },
      { type: 'callout', content: "Practice: Adapt 5 names the student knows (friends, cities, etc.) using lore." }
    ]
  },
  { 
    id: "cp1", title: "Checkpoint: The Sound of Simplicity", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Validates phonology knowledge before grammar begins." },
      { type: 'callout', content: "Criteria: Pronounce 3 words correctly; identify 2 invalid syllables; adapt their own name." }
    ]
  },
];

const stage2Nodes: CurriculumNode[] = [
  { 
    id: "svo_intro", title: "SVO Sentence Structure", requiredVocabIds: ["mi", "sina", "ona"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Jan Lina Chat', type: 'Topic',
    infographicUrl: '/infographics/2 Structural Foundations.png',
    richContent: [
      { type: 'text', content: "Toki Pona sentences follow Subject -> Verb -> Object order, like English." },
      { type: 'structural', content: "jan Lina introduces mi/sina/ona with simple action words." },
      { type: 'callout', content: "Practice: Arrange word tiles into valid SVO sentences." }
    ]
  },
  { 
    id: "li_rule", title: "The Divider 'li'", requiredVocabIds: ["li", "ona", "jan", "toki", "pona"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "'li' separates subject from verb/predicate when subject is NOT mi or sina alone." },
      { type: 'structural', content: "jan Lina contrasts 'mi pona' vs 'ona li pona' — why no li in the first case." },
      { type: 'callout', content: "Practice: Given sentences, decide where li goes (or doesn't)." }
    ]
  },
  { 
    id: "e_rule", title: "The Direct Object 'e'", requiredVocabIds: ["e", "mi", "sina", "ona", "moku", "toki", "pona", "ike"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "'e' marks the direct object; without it, the predicate is intransitive." },
      { type: 'structural', content: "'mi moku' (I eat) vs 'mi moku e kili' (I eat fruit)." },
      { type: 'callout', content: "Practice: Add e + object to intransitive sentences." }
    ]
  },
  { 
    id: "mi_sina_exception", title: "The mi/sina Exception", requiredVocabIds: ["mi", "sina"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "When subject is exactly 'mi' or 'sina' (alone, unmodified), li is dropped." },
      { type: 'structural', content: "jan Lina drills the contrast: 'mi pona' ✓ vs 'mi mute li pona' ✓" },
      { type: 'callout', content: "Practice: Given a subject, decide if li is needed." }
    ]
  },
  { 
    id: "en_conjunction", title: "Connecting Subjects with 'en'", requiredVocabIds: ["en", "mi", "sina", "ona", "jan"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "'en' joins multiple subjects; crucially, this always requires li (mi en sina li pona)." },
      { type: 'structural', content: "'mi en sina li toki' — en forces li even when mi/sina are present." },
      { type: 'callout', content: "Practice: Combine two subjects using en, then check li usage." }
    ]
  },
  { 
    id: "cp2", title: "Checkpoint: Building the Core", requiredVocabIds: ["mi", "sina", "ona", "li", "e", "en"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Write 5 sentences covering: basic SVO, li usage, e usage, mi/sina exception, en compound subject." }
    ]
  },
];

const stage3Nodes: CurriculumNode[] = [
  { 
    id: "head_initial", title: "Head-Initial Rule", requiredVocabIds: ["jan", "tomo", "toki", "pona", "ike", "suli", "lili"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Jan Lina Chat', type: 'Topic',
    infographicUrl: '/infographics/3 Syntactic Fluidity.png',
    richContent: [
      { type: 'text', content: "The main noun comes first; modifiers follow and narrow it. 'tomo pona' = good house (not 'good' + 'house' as equals)." },
      { type: 'structural', content: "Contrast with English adjective-first. jan Lina gives examples with words student knows." },
      { type: 'callout', content: "Practice: Given an English phrase, flip the order correctly into Toki Pona." }
    ]
  },
  { 
    id: "simple_mods", title: "Simple Modifiers", requiredVocabIds: ["pona", "ike", "jan", "tomo", "toki", "moku"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Any word can modify any other word. One modifier after the head." },
      { type: 'structural', content: "jan Lina builds phrases using things in the student's life (lore)." },
      { type: 'callout', content: "Practice: Build 5 modified noun phrases from a word bank." }
    ]
  },
  { 
    id: "multiple_mods", title: "Chain of Modifiers", requiredVocabIds: ["suli", "lili", "pona", "ike", "jan", "tomo", "toki"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Each successive modifier narrows the previous — 'jan pona suli' = big good-person (not big + good + person independently)." },
      { type: 'structural', content: "jan Lina shows how meaning stacks and how order changes nuance." },
      { type: 'callout', content: "Practice: Add a second modifier to existing phrases; discuss how meaning shifts." }
    ]
  },
  { 
    id: "polysemy", title: "The Art of Polysemy", requiredVocabIds: ["telo", "seli", "kon", "lawa", "pona", "ike", "suli"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Jan Lina Chat', type: 'Topic',
    richContent: [
      { type: 'text', content: "Every word carries a semantic cluster, not a single meaning. Context determines interpretation." },
      { type: 'structural', content: "jan Lina gives 3 readings of the same sentence; discuss which fits context." },
      { type: 'callout', content: "Practice: Student interprets 4 ambiguous sentences; defends their reading." }
    ]
  },
  { 
    id: "cp3", title: "Checkpoint: The Art of Description", requiredVocabIds: ["pona", "ike", "suli", "lili"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Build 3 noun phrases with modifiers; explain why order matters in one; give two readings of an ambiguous phrase." }
    ]
  },
];

const stage4Nodes: CurriculumNode[] = [
  { 
    id: "pi_intro", title: "Intro to 'pi'", requiredVocabIds: ["pi", "jan", "tomo", "toki", "pona", "suli", "lili"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Jan Lina Chat', type: 'Topic',
    infographicUrl: '/infographics/4 The Architecture of Pi.png',
    richContent: [
      { type: 'text', content: "'pi' regroups modifiers so that what follows it modifies the head as a unit, rather than stacking." },
      { type: 'structural', content: "'jan toki pona' vs 'jan pi toki pona' — person who speaks well vs. person of Toki Pona." },
      { type: 'callout', content: "Practice: Decide whether pi is needed in 5 phrases." }
    ]
  },
  { 
    id: "pi_grouping", title: "Grouping with 'pi'", requiredVocabIds: ["pi", "jan", "tomo", "toki", "pona", "ike", "suli", "lili", "mute"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Pi takes everything after it as a single modifying unit until the next pi or end of phrase." },
      { type: 'structural', content: "Diagram-style breakdown of how pi 'captures' what follows it." },
      { type: 'callout', content: "Practice: Bracket phrases to show what pi groups; rephrase English possessives using pi." }
    ]
  },
  { 
    id: "pi_2word", title: "The 2-Word Rule", requiredVocabIds: ["pi"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Pi must be followed by at least 2 words — 'pi pona' alone is invalid." },
      { type: 'structural', content: "jan Lina explains why: a single word after pi just means use a regular modifier." },
      { type: 'callout', content: "Practice: Spot invalid pi usage in a list of phrases." }
    ]
  },
  { 
    id: "pi_stacks", title: "pi Stacks", requiredVocabIds: ["pi", "jan", "tomo", "toki", "pona", "suli", "mute", "lili"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "Multiple pi phrases can chain on one head noun; each pi starts a new modifying group." },
      { type: 'structural', content: "Walk through a 2-pi sentence step by step." },
      { type: 'callout', content: "Practice: Build a sentence using 2 pi groups from a scenario." }
    ]
  },
  { 
    id: "cp4", title: "Checkpoint: Complex Concepts", requiredVocabIds: ["pi"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Explain when pi is/isn't needed; fix a broken pi sentence; translate one complex English phrase using pi." }
    ]
  },
];

const stage5Nodes: CurriculumNode[] = [
  { 
    id: "ala_negation", title: "Negation with 'ala'", requiredVocabIds: ["ala", "mi", "sina", "ona", "li", "pona", "toki", "moku"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    infographicUrl: '/infographics/5 The Grammar of Negation.png',
    richContent: [
      { type: 'text', content: "'ala' follows the verb to negate it — 'mi moku ala' = I don't eat." },
      { type: 'structural', content: "Position of ala matters; contrast with using ala as a noun modifier." },
      { type: 'callout', content: "Practice: Negate 5 sentences; distinguish 'moku ala' (not eat) from 'ijo ala' (nothing)." }
    ]
  },
  { 
    id: "yes_no_quest", title: "Yes/No Questions", requiredVocabIds: ["ala", "mi", "sina", "ona", "li", "pona", "toki", "moku"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Jan Lina Chat', type: 'Topic',
    richContent: [
      { type: 'text', content: "Repeat the verb, insert ala between, append nothing — 'sina moku ala moku?' (Do you eat?)" },
      { type: 'structural', content: "jan Lina asks the student yes/no questions and models the pattern conversationally." },
      { type: 'callout', content: "Practice: Turn 5 statements into yes/no questions." }
    ]
  },
  { 
    id: "seme_quest", title: "Information with 'seme'", requiredVocabIds: ["seme", "mi", "sina", "ona", "li", "jan", "tomo", "toki"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "'seme' is a question word placeholder replacing the unknown — sits where the answer would go." },
      { type: 'structural', content: "'sina toki e seme?' (What are you saying?) — seme holds the object slot." },
      { type: 'callout', content: "Practice: Build questions using seme in subject, verb, and object positions." }
    ]
  },
  { 
    id: "anu_seme", title: "Choice with 'anu seme'", requiredVocabIds: ["anu", "seme", "mi", "sina", "ona", "li"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "'anu seme' at the end of a statement turns it into an 'or what?' / 'right?' question." },
      { type: 'structural', content: "Contrast with verb-ala-verb questions; anu seme is softer, more conversational." },
      { type: 'callout', content: "Practice: Add anu seme to 4 statements; role-play short exchanges with jan Lina." }
    ]
  },
  { 
    id: "cp5", title: "Checkpoint: Interaction", requiredVocabIds: ["ala", "seme", "anu"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Form one of each question type; negate a sentence; correctly answer a yes/no question." }
    ]
  },
];

const stage6Nodes: CurriculumNode[] = [
  { 
    id: "preverb_wile", title: "Desire: wile", requiredVocabIds: ["wile", "mi", "sina", "ona", "li", "moku", "toki", "pali", "tawa"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Drill',
    infographicUrl: '/infographics/6 Preverbs and Prepositions .png',
    richContent: [
      { type: 'text', content: "'wile' precedes the main verb to mean want/need to — 'mi wile moku' (I want to eat)." },
      { type: 'structural', content: "Position before main verb; can also be a regular verb/noun." },
      { type: 'callout', content: "Practice: Express 5 wants/needs using lore (what does the student actually want?)." }
    ]
  },
  { 
    id: "preverb_ken", title: "Ability: ken", requiredVocabIds: ["ken", "mi", "sina", "ona", "li", "toki", "pali", "tawa"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Drill',
    richContent: [
      { type: 'text', content: "'ken' = can/is able to — 'sina ken toki' (you can speak)." },
      { type: 'structural', content: "Contrast wile (want) vs ken (can); both are preverbs with same position." },
      { type: 'callout', content: "Practice: Role-play a scenario where student asks what they can do." }
    ]
  },
  { 
    id: "preverb_kama", title: "Becoming: kama", requiredVocabIds: ["kama", "mi", "sina", "ona", "li", "sona", "pona", "jo"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Drill',
    richContent: [
      { type: 'text', content: "'kama' as preverb = to come to do / to become — 'kama sona' (to learn, lit. come to know)." },
      { type: 'structural', content: "'kama sona' is the idiomatic word for learning — very relevant to this app's context." },
      { type: 'callout', content: "Practice: Use kama + verb to express becoming or starting 4 actions." }
    ]
  },
  { 
    id: "prep_lon", title: "Locality: lon", requiredVocabIds: ["lon", "mi", "sina", "tomo", "ma", "tenpo", "ni"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Drill',
    richContent: [
      { type: 'text', content: "'lon' = at/in/on (location) or 'to exist/be present' — 'mi lon tomo' (I am at home)." },
      { type: 'structural', content: "lon as preposition vs lon as verb; 'lon' alone = 'it exists / it's true'." },
      { type: 'callout', content: "Practice: Describe where 5 things are using lore (student's actual location/room)." }
    ]
  },
  { 
    id: "prep_tawa", title: "Motion: tawa", requiredVocabIds: ["tawa", "mi", "sina", "ona", "tomo", "ma", "jan"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Drill',
    richContent: [
      { type: 'text', content: "'tawa' = to/toward (direction) or 'to move' as verb; also 'in the opinion of' subjectively." },
      { type: 'structural', content: "'mi tawa tomo' (I go home) vs 'pona tawa mi' (good to me = I like it)." },
      { type: 'callout', content: "Practice: Use tawa in motion and opinion sentences." }
    ]
  },
  { 
    id: "prep_tan", title: "Origin: tan", requiredVocabIds: ["tan", "mi", "sina", "ona", "ma", "jan", "tomo"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Drill',
    richContent: [
      { type: 'text', content: "'tan' = from/because of — origin or cause." },
      { type: 'structural', content: "'mi tan ma Mewika' (I'm from America) + causal use." },
      { type: 'callout', content: "Practice: Student describes their own origin and the reason for 3 things (using lore)." }
    ]
  },
  { 
    id: "prep_kepeken", title: "Utility: kepeken", requiredVocabIds: ["kepeken", "mi", "sina", "ona", "ilo", "toki", "pali"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Drill',
    richContent: [
      { type: 'text', content: "'kepeken' = using/with (instrument) — 'mi toki kepeken toki pona' (I speak using Toki Pona)." },
      { type: 'structural', content: "Contrast with English 'with' — kepeken specifically means by means of." },
      { type: 'callout', content: "Practice: Describe 5 actions and what tool/method is used." }
    ]
  },
  { 
    id: "cp6", title: "Checkpoint: Action & Location", requiredVocabIds: ["wile", "ken", "kama", "lon", "tawa", "tan", "kepeken"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Use each preverb once; describe a location; describe motion; explain origin; describe a tool used." }
    ]
  },
];

const stage7Nodes: CurriculumNode[] = [
  { 
    id: "colors_primary", title: "Primary Colors", requiredVocabIds: ["loje", "laso", "jelo", "kule", "ni", "li", "ona"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "loje = red, laso = blue/green, jelo = yellow — Toki Pona has fewer color words than English." },
      { type: 'structural', content: "laso covers both blue and green; context or modifiers distinguish." },
      { type: 'callout', content: "Practice: Describe 5 colored objects from the student's environment." }
    ]
  },
  { 
    id: "light_dark", title: "Light & Dark", requiredVocabIds: ["walo", "pimeja", "kule", "suno", "tenpo"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "walo = white/light/pale, pimeja = black/dark — also extend to time of day." },
      { type: 'structural', content: "'tenpo pimeja' (night), 'tenpo walo' (day/morning) — show extended uses." },
      { type: 'callout', content: "Practice: Describe time of day and light conditions using lore (student's timezone)." }
    ]
  },
  { 
    id: "numbers_base", title: "Numbers: wan & tu", requiredVocabIds: ["wan", "tu", "mute", "ale", "ala"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "wan = 1/unique, tu = 2/divided — number words stack additively: 'tu wan' = 3." },
      { type: 'structural', content: "Numbers as modifiers following the noun; contrast with English pre-noun placement." },
      { type: 'callout', content: "Practice: Express quantities 1–5 in Toki Pona; note luka (5) if student is curious." }
    ]
  },
  { 
    id: "quantities", title: "Quantities: mute & ale", requiredVocabIds: ["mute", "ale", "ali", "wan", "ala", "jan", "ijo"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "mute = many/very (also intensifier), ale/ali = all/everything/universe." },
      { type: 'structural', content: "'jan mute' (many people), 'ijo ale' (everything); mute as intensifier 'pona mute' (very good)." },
      { type: 'callout', content: "Practice: Describe quantities of things in student's life." }
    ]
  },
  { 
    id: "zero_ala", title: "Zero: ala", requiredVocabIds: ["ala", "wan", "tu", "mute", "jan", "ijo"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Builder Drill', type: 'Topic',
    richContent: [
      { type: 'text', content: "ala = zero as a number, but also none/nothing as a quantity modifier." },
      { type: 'structural', content: "Distinguish ala-as-zero from ala-as-negation; 'jan ala' (no one) vs 'mi moku ala' (I don't eat)." },
      { type: 'callout', content: "Practice: Use ala in quantity context in 4 sentences." }
    ]
  },
  { 
    id: "cp7", title: "Checkpoint: Specifics", requiredVocabIds: ["loje", "laso", "jelo", "walo", "pimeja", "wan", "tu", "mute", "ale", "ala"], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Describe a colored object; express a quantity; use ala correctly as zero vs negation; describe time of day." }
    ]
  },
];

const stage8Nodes: CurriculumNode[] = [
  { 
    id: "think_tp", title: "Thinking in Toki Pona", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Jan Lina Chat', type: 'Topic',
    infographicUrl: '/infographics/8 The Fluid Lexicon.png',
    richContent: [
      { type: 'text', content: "Meta-cognitive stage — using Toki Pona's constraints to reframe complex ideas, accept ambiguity, and communicate intent over precision." },
      { type: 'structural', content: "jan Lina poses a complex topic (from student's lore) and they work through expressing it together." },
      { type: 'callout', content: "Practice: Student initiates a topic entirely in Toki Pona; jan Lina responds only in Toki Pona." }
    ]
  },
  { 
    id: "sitelen_pona", title: "sitelen pona Hieroglyphs", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Jan Lina Chat', type: 'Topic',
    richContent: [
      { type: 'text', content: "The logographic writing system for Toki Pona — one glyph per word, composable." },
      { type: 'structural', content: "jan Lina introduces the glyph for each word the student has mastered." },
      { type: 'callout', content: "Practice: Student 'reads' simple sitelen pona sentences (described in text); draws/describes glyphs." }
    ]
  },
  { 
    id: "final_exam", title: "Final Mastery Exam", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', activities: ['word-scramble'], suggestedMethod: 'Quiz', type: 'Checkpoint',
    richContent: [
      { type: 'text', content: "Sustain a 10-exchange conversation with jan Lina in Toki Pona; use all particle types correctly; express a complex idea using pi; use a preverb; ask and answer a question; describe a location." }
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
  { id: "stage7", title: "Stage 7: Specifics", nodes: stage7Nodes },
  { id: "stage8", title: "Stage 8: Final Mastery", nodes: stage8Nodes },
];
