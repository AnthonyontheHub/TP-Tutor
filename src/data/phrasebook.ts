import type { PhrasebookEntry } from '../types/mastery';
     
export const initialPhrasebook: PhrasebookEntry[] = [
  { id: "g1", category: "Greetings & Farewells", tp: "toki", en: "Hello / Hi", literal: "Speech / language.", note: "The most basic greeting. Think of it as acknowledging someone with 'speech'.", coreWords: ["toki"], tags: ["greeting", "basic"], difficulty: 1 },
  { id: "g2", category: "Greetings & Farewells", tp: "suno pona", en: "Good morning", literal: "Good sun.", coreWords: ["suno", "pona"], tags: ["greeting", "time"], difficulty: 1 },
  { id: "g3", category: "Greetings & Farewells", tp: "tenpo pimeja pona", en: "Good evening / Good night", literal: "Good dark time.", coreWords: ["tenpo", "pimeja", "pona"], tags: ["greeting", "time"], difficulty: 1 },
  { id: "g4", category: "Greetings & Farewells", tp: "mi tawa", en: "I'm leaving / Goodbye", literal: "I go.", note: "Said by the person who is leaving.", coreWords: ["mi", "tawa"], tags: ["farewell", "action"], difficulty: 1 },
  { id: "g5", category: "Greetings & Farewells", tp: "tawa pona", en: "Safe travels / Goodbye", literal: "Go well.", note: "Said to the person who is leaving.", coreWords: ["tawa", "pona"], tags: ["farewell", "action"], difficulty: 1 },
  { id: "g6", category: "Greetings & Farewells", tp: "awen pona", en: "Stay well / Goodbye", literal: "Wait/stay well.", note: "Said by the person leaving, to the person staying behind.", coreWords: ["awen", "pona"], tags: ["farewell", "action"], difficulty: 1 },
  { id: "p1", category: "Basic Politeness", tp: "pona", en: "Thanks / Good", literal: "Good.", note: "Can be used as a simple thank you.", coreWords: ["pona"], tags: ["polite", "basic"], difficulty: 1 },
  { id: "p2", category: "Basic Politeness", tp: "pona tawa sina", en: "Thank you", literal: "Good to you.", note: "A more formal/direct way of saying thank you.", coreWords: ["pona", "tawa", "sina"], tags: ["polite", "directional"], difficulty: 2 },
  { id: "p3", category: "Basic Politeness", tp: "mi pakala", en: "I'm sorry / Oops", literal: "I break / I make a mistake.", note: "Used for apologies or when you mess something up.", coreWords: ["mi", "pakala"], tags: ["polite", "mistake"], difficulty: 1 },
  { id: "p4", category: "Basic Politeness", tp: "o pona e mi", en: "Excuse me / Help me", literal: "Make me good.", note: "Used when asking for a favor or trying to get past someone.", coreWords: ["o", "pona", "e", "mi"], tags: ["polite", "request", "grammar:o", "grammar:e"], difficulty: 2 },
  
  // --- INTRODUCTIONS & IDENTITY ---
  { id: "i1", category: "Introductions & Identity", tp: "mi jan [Name]", en: "I am [Name]", literal: "I am person [Name].", note: "The most common way to introduce yourself.", coreWords: ["mi", "jan"], tags: ["intro", "identity"], difficulty: 1 },
  { id: "i2", category: "Introductions & Identity", tp: "nimi mi li [Name]", en: "My name is [Name]", literal: "My name is [Name].", coreWords: ["nimi", "mi", "li"], tags: ["intro", "identity"], difficulty: 1 },
  { id: "i3", category: "Introductions & Identity", tp: "sina jan seme", en: "Who are you? / What's your name?", literal: "You are what person?", coreWords: ["sina", "jan", "seme"], tags: ["intro", "question"], difficulty: 2 },
  { id: "i4", category: "Introductions & Identity", tp: "mi kama tan ma [Place]", en: "I come from [Place]", literal: "I arrive from land [Place].", coreWords: ["mi", "kama", "tan", "ma"], tags: ["intro", "origin"], difficulty: 2 },

  // --- UNDERSTANDING & COMMUNICATION ---
  { id: "u1", category: "Understanding & Communication", tp: "mi sona", en: "I understand / I know", literal: "I know.", coreWords: ["mi", "sona"], tags: ["communication", "basic"], difficulty: 1 },
  { id: "u2", category: "Understanding & Communication", tp: "mi sona ala", en: "I don't understand / I don't know", literal: "I know not.", coreWords: ["mi", "sona", "ala"], tags: ["communication", "basic"], difficulty: 1 },
  { id: "u3", category: "Understanding & Communication", tp: "sina sona ala sona", en: "Do you understand?", literal: "You know or not know?", note: "Uses the classic 'A ala A' yes/no question structure.", coreWords: ["sina", "sona", "ala"], tags: ["communication", "question", "grammar:a_ala_a"], difficulty: 2 },
  { id: "u4", category: "Understanding & Communication", tp: "o toki lili", en: "Please speak slower / a little", literal: "Speak little.", coreWords: ["o", "toki", "lili"], tags: ["communication", "request"], difficulty: 2 },
  { id: "u5", category: "Understanding & Communication", tp: "toki pona li pona tawa mi", en: "I like Toki Pona", literal: "Good speech is good to me.", coreWords: ["toki", "pona", "li", "tawa", "mi"], tags: ["communication", "opinion"], difficulty: 2 },

  // --- FEELINGS & STATES ---
  { id: "f1", category: "Feelings & States", tp: "mi pilin pona", en: "I feel good / I'm happy", literal: "I feel good.", coreWords: ["mi", "pilin", "pona"], tags: ["feelings", "positive"], difficulty: 1 },
  { id: "f2", category: "Feelings & States", tp: "mi pilin ike", en: "I feel bad / I'm sad", literal: "I feel bad.", coreWords: ["mi", "pilin", "ike"], tags: ["feelings", "negative"], difficulty: 1 },
  { id: "f3", category: "Feelings & States", tp: "mi wile lape", en: "I am tired / I want to sleep", literal: "I want sleep.", coreWords: ["mi", "wile", "lape"], tags: ["feelings", "state"], difficulty: 1 },
  { id: "f4", category: "Feelings & States", tp: "mi lape", en: "I am sleeping", literal: "I sleep.", coreWords: ["mi", "lape"], tags: ["feelings", "state"], difficulty: 1 },

  // --- FOOD & DRINK ---
  { id: "fd1", category: "Food & Drink", tp: "mi wile moku", en: "I'm hungry / I want to eat", literal: "I want food/eating.", note: "'moku' covers both eating and drinking.", coreWords: ["mi", "wile", "moku"], tags: ["food", "need"], difficulty: 1 },
  { id: "fd2", category: "Food & Drink", tp: "telo ni li pona", en: "This water/drink is good", literal: "This liquid is good.", coreWords: ["telo", "ni", "li", "pona"], tags: ["food", "opinion"], difficulty: 2 },
  { id: "fd3", category: "Food & Drink", tp: "moku pona", en: "Enjoy your meal / Good food", literal: "Good food.", coreWords: ["moku", "pona"], tags: ["food", "polite"], difficulty: 1 },

  // --- ACTIONS & MOVEMENT ---
  { id: "a1", category: "Actions & Movement", tp: "sina pali e seme", en: "What are you doing?", literal: "You do what?", coreWords: ["sina", "pali", "e", "seme"], tags: ["action", "question", "grammar:e"], difficulty: 2 },
  { id: "a2", category: "Actions & Movement", tp: "mi pali", en: "I am working / doing something", literal: "I work.", coreWords: ["mi", "pali"], tags: ["action", "state"], difficulty: 1 },
  { id: "a3", category: "Actions & Movement", tp: "sina tawa seme", en: "Where are you going?", literal: "You go where?", coreWords: ["sina", "tawa", "seme"], tags: ["action", "movement", "question"], difficulty: 2 },
  { id: "a4", category: "Actions & Movement", tp: "mi tawa tomo", en: "I am going home / to the room", literal: "I go to structure.", coreWords: ["mi", "tawa", "tomo"], tags: ["action", "movement"], difficulty: 1 },

  // --- PEOPLE & RELATIONSHIPS ---
  { id: "pr1", category: "People & Relationships", tp: "jan pona", en: "Friend", literal: "Good person.", coreWords: ["jan", "pona"], tags: ["people", "relationship"], difficulty: 1 },
  { id: "pr2", category: "People & Relationships", tp: "jan ike", en: "Enemy / Bad person", literal: "Bad person.", coreWords: ["jan", "ike"], tags: ["people", "relationship"], difficulty: 1 },
  { id: "pr3", category: "People & Relationships", tp: "jan olin", en: "Partner / Loved one", literal: "Love person.", coreWords: ["jan", "olin"], tags: ["people", "relationship"], difficulty: 1 },
  { id: "pr4", category: "People & Relationships", tp: "jan pana sona", en: "Teacher", literal: "Person giving knowledge.", coreWords: ["jan", "pana", "sona"], tags: ["people", "role"], difficulty: 2 },

  // --- TIME & DAYS ---
  { id: "t1", category: "Time & Days", tp: "tenpo suno ni", en: "Today", literal: "This sun time.", coreWords: ["tenpo", "suno", "ni"], tags: ["time", "day"], difficulty: 1 },
  { id: "t2", category: "Time & Days", tp: "tenpo suno kama", en: "Tomorrow", literal: "Arriving sun time.", coreWords: ["tenpo", "suno", "kama"], tags: ["time", "day"], difficulty: 1 },
  { id: "t3", category: "Time & Days", tp: "tenpo suno pini", en: "Yesterday", literal: "Finished sun time.", coreWords: ["tenpo", "suno", "pini"], tags: ["time", "day"], difficulty: 1 },
  { id: "t4", category: "Time & Days", tp: "tenpo ni", en: "Now", literal: "This time.", coreWords: ["tenpo", "ni"], tags: ["time", "current"], difficulty: 1 },

  // --- DESCRIBING THINGS ---
  { id: "dt1", category: "Describing Things", tp: "ona li suli", en: "It is big / important", literal: "It is big.", coreWords: ["ona", "li", "suli"], tags: ["description", "size"], difficulty: 1 },
  { id: "dt2", category: "Describing Things", tp: "ona li lili", en: "It is small", literal: "It is small.", coreWords: ["ona", "li", "lili"], tags: ["description", "size"], difficulty: 1 },
  { id: "dt3", category: "Describing Things", tp: "ni li pona mute", en: "This is very good", literal: "This is many good.", note: "'mute' is used to mean 'very' or 'a lot'.", coreWords: ["ni", "li", "pona", "mute"], tags: ["description", "intensity"], difficulty: 2 },
  { id: "dt4", category: "Describing Things", tp: "ona li ike", en: "It is bad / complex", literal: "It is bad.", note: "In Toki Pona, complexity is often equated with badness.", coreWords: ["ona", "li", "ike"], tags: ["description", "negative", "cultural"], difficulty: 1 },

  // --- QUESTIONS & LOGIC ---
  { id: "q1", category: "Questions & Logic", tp: "seme li lon", en: "What is happening? / What exists?", literal: "What exists?", coreWords: ["seme", "li", "lon"], tags: ["question", "existential"], difficulty: 2 },
  { id: "q2", category: "Questions & Logic", tp: "tan seme", en: "Why?", literal: "From what?", coreWords: ["tan", "seme"], tags: ["question", "logic"], difficulty: 1 },
  { id: "q3", category: "Questions & Logic", tp: "ni li nasin seme", en: "How do you do this?", literal: "This is what method?", coreWords: ["ni", "li", "nasin", "seme"], tags: ["question", "logic"], difficulty: 2 },

  // --- NUMBERS & QUANTITIES ---
  { id: "n1", category: "Numbers & Quantities", tp: "mi jo e ijo wan", en: "I have one thing", literal: "I have one thing.", coreWords: ["mi", "jo", "e", "ijo", "wan"], tags: ["numbers", "grammar:e"], difficulty: 2 },
  { id: "n2", category: "Numbers & Quantities", tp: "jan tu li toki", en: "Two people are talking", literal: "Two people speak.", coreWords: ["jan", "tu", "li", "toki"], tags: ["numbers", "action"], difficulty: 1 },
  { id: "n3", category: "Numbers & Quantities", tp: "mani mute", en: "A lot of money", literal: "Many money.", note: "Toki Pona discourages exact counting above two or three.", coreWords: ["mani", "mute"], tags: ["numbers", "cultural"], difficulty: 1 },

  // --- NATURE & ELEMENTS ---
  { id: "ne1", category: "Nature & Elements", tp: "suno li seli", en: "The sun is hot", literal: "Sun is warm/hot.", coreWords: ["suno", "li", "seli"], tags: ["nature", "description"], difficulty: 1 },
  { id: "ne2", category: "Nature & Elements", tp: "telo sewi li kama", en: "It is raining", literal: "Sky water arrives.", coreWords: ["telo", "sewi", "li", "kama"], tags: ["nature", "weather"], difficulty: 2 },
  { id: "ne3", category: "Nature & Elements", tp: "kasi li kule laso", en: "The plant is green/blue", literal: "Plant is color green/blue.", coreWords: ["kasi", "li", "kule", "laso"], tags: ["nature", "colors"], difficulty: 2 },

  // --- DAILY ROUTINES ---
  { id: "dr1", category: "Daily Routines", tp: "mi suno e mi", en: "I wake up", literal: "I sun myself.", coreWords: ["mi", "suno", "e"], tags: ["routine", "basic"], difficulty: 2 },
  { id: "dr2", category: "Daily Routines", tp: "mi moku e moku pi tenpo suno open", en: "I eat breakfast", literal: "I eat food of day opening time.", coreWords: ["mi", "moku", "e", "pi", "tenpo", "suno", "open"], tags: ["routine", "food"], difficulty: 3 },
  { id: "dr3", category: "Daily Routines", tp: "mi telo e mi", en: "I bathe", literal: "I water myself.", coreWords: ["mi", "telo", "e"], tags: ["routine", "hygiene"], difficulty: 2 },

  // --- DIRECTIONS ---
  { id: "dir1", category: "Directions", tp: "ni li tawa soto", en: "This is to the left", literal: "This is to left.", coreWords: ["ni", "li", "tawa", "soto"], tags: ["direction"], difficulty: 2 },
  { id: "dir2", category: "Directions", tp: "ni li tawa te", en: "This is to the right", literal: "This is to right.", coreWords: ["ni", "li", "tawa", "te"], tags: ["direction"], difficulty: 2 },
  { id: "dir3", category: "Directions", tp: "ni li tawa sinpin", en: "This is to the front", literal: "This is to front.", coreWords: ["ni", "li", "tawa", "sinpin"], tags: ["direction"], difficulty: 1 },
  { id: "dir4", category: "Directions", tp: "ni li tawa monsi", en: "This is to the back", literal: "This is to back.", coreWords: ["ni", "li", "tawa", "monsi"], tags: ["direction"], difficulty: 1 },

  // --- HEALTH ---
  { id: "h1", category: "Health", tp: "mi pilin pakala", en: "I feel hurt", literal: "I feel broken.", coreWords: ["mi", "pilin", "pakala"], tags: ["health", "feeling"], difficulty: 1 },
  { id: "h2", category: "Health", tp: "mi pilin selo", en: "I feel itchy", literal: "I feel skin.", coreWords: ["mi", "pilin", "selo"], tags: ["health", "feeling"], difficulty: 2 },
  { id: "h3", category: "Health", tp: "sinpin mi li seli", en: "I have a fever", literal: "My face is hot.", coreWords: ["sinpin", "mi", "li", "seli"], tags: ["health", "description"], difficulty: 2 },

  // --- BODY ---
  { id: "b1", category: "Body", tp: "lawa mi li pakala", en: "My head hurts", literal: "My head is broken.", coreWords: ["lawa", "mi", "li", "pakala"], tags: ["body", "health"], difficulty: 1 },
  { id: "b2", category: "Body", tp: "noka mi li suli", en: "My leg is swollen", literal: "My leg is big.", coreWords: ["noka", "mi", "li", "suli"], tags: ["body", "health"], difficulty: 1 },
  { id: "b3", category: "Body", tp: "luka mi li wawa", en: "My arm is strong", literal: "My arm is strong.", coreWords: ["luka", "mi", "li", "wawa"], tags: ["body", "description"], difficulty: 1 },

  // --- WORK ---
  { id: "w1", category: "Work", tp: "pali mi li pona", en: "My work is good", literal: "My work is good.", coreWords: ["pali", "mi", "li", "pona"], tags: ["work", "opinion"], difficulty: 1 },
  { id: "w2", category: "Work", tp: "mi pali mute", en: "I work a lot", literal: "I work much.", coreWords: ["mi", "pali", "mute"], tags: ["work", "action"], difficulty: 1 },
  { id: "w3", category: "Work", tp: "tenpo pali li pini", en: "Work is finished", literal: "Work time is finished.", coreWords: ["tenpo", "pali", "li", "pini"], tags: ["work", "time"], difficulty: 1 }
];
