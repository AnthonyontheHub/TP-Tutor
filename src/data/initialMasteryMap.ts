import type { MasteryMap } from '../types/mastery';

// ---------------------------------------------------------------------------
// Seed data — mirrors the Toki Pona Mastery Map (Introduction Level)
// Fresh-slate default — all statuses start at Not Started.
// / Immersion Session #11
// ---------------------------------------------------------------------------

export const initialMasteryMap: MasteryMap = {
  studentName: '',
  profileImage: '',
  curriculumLevel: 'Introduction',
  lastUpdated: '',

  // NEW FEATURES INITIALIZATION
  savedPhrases: [],
  currentStreak: 0,
  lastActiveDate: '',

  // -------------------------------------------------------------------------
  // Chapters  (index 0 = Introduction, 1–9 = content chapters)
// ... rest of the file remains exactly the same

  // -------------------------------------------------------------------------
  // Chapters  (index 0 = Introduction, 1–9 = content chapters)
  // -------------------------------------------------------------------------
  chapters: [
    // ── Introduction: The Philosophy of Simplicity ──────────────────────────
    {
      id: 'intro',
      title: 'Introduction: The Philosophy of Simplicity',
      order: 0,
      concepts: [
        {
          id: 'intro-origins',
          concept: 'Origins & authorship (Sonja Lang, 2001)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'intro-design-goals',
          concept: 'Core design goals (minimalism, present-moment focus)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'intro-influences',
          concept: 'Philosophical influences (Taoism, Sapir-Whorf hypothesis)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'intro-publications',
          concept:
            'Publication history: lipu pu (2014, 120 words) & lipu ku (2021, 137 words)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'intro-misconceptions',
          concept:
            'Common misconceptions (anarcho-primitivism, Piraha similarities)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
      ],
    },

    // ── Chapter 1: Phonology & Orthography ──────────────────────────────────
    {
      id: 'ch1',
      title: 'Chapter 1: Phonology & Orthography',
      order: 1,
      concepts: [
        {
          id: 'ch1-consonants',
          concept: 'Consonant inventory (9): p, t, k, s, m, n, l, j, w',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch1-vowels',
          concept: 'Vowel inventory (5): a, e, i, o, u',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch1-syllable-structure',
          concept: 'Syllable structure / phonotactics: (C)V(N) and CV(N)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch1-stress',
          concept: 'Stress rule (always on first syllable)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch1-allophony',
          concept: 'Allophony (voiced/unvoiced variation, l as tap, etc.)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch1-nasal-assimilation',
          concept: 'Final nasal assimilation',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch1-forbidden',
          concept: 'Forbidden elements: diphthongs, consonant clusters, tones',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch1-orthography',
          concept: 'Latin alphabet orthography — lowercase default',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch1-capitalization',
          concept: 'Capitalization rules (proper nouns / unofficial words)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
      ],
    },

    // ── Chapter 2: Core Sentence Structure ──────────────────────────────────
    {
      id: 'ch2',
      title: 'Chapter 2: Core Sentence Structure',
      order: 2,
      concepts: [
        {
          id: 'ch2-svo',
          concept: 'SVO word order (Subject-Verb-Object)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch2-li',
          concept: 'The li particle — separates subject from predicate',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch2-e',
          concept: 'The e particle — marks direct object',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch2-li-omission',
          concept:
            'li Omission Rule — dropped when subject is only mi or sina',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch2-predicate-types',
          concept: 'Predicate types: verb, adjective, or noun after li',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch2-tense-free',
          concept: 'Tense-free grammar — context determines time',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch2-en',
          concept: 'The en particle — joins multiple subjects',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
      ],
    },

    // ── Chapter 3: Vocabulary & Modification ────────────────────────────────
    {
      id: 'ch3',
      title: 'Chapter 3: Vocabulary & Modification',
      order: 3,
      concepts: [
        {
          id: 'ch3-polysemy',
          concept:
            'Polysemy — words change function based on syntactic position',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch3-head-initial',
          concept: 'Head-initial modifier system — first word is the head',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch3-single-modifier',
          concept: 'Single-modifier phrases (e.g., jan lili = child)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch3-multiple-modifiers',
          concept:
            'Multiple modifiers — each applies independently to the head (not nested)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch3-context',
          concept: 'Context as primary meaning-carrier',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
      ],
    },

    // ── Chapter 4: The pi Particle ───────────────────────────────────────────
    {
      id: 'ch4',
      title: 'Chapter 4: The pi Particle',
      order: 4,
      concepts: [
        {
          id: 'ch4-pi-function',
          concept:
            'pi function — regroups following words into a single modifier phrase',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch4-pi-minimum',
          concept: 'pi requires at least 2 content words after it',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch4-pi-vs-direct',
          concept:
            'pi vs. direct modification (simple possession: tomo mi, not tomo pi mi)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch4-pi-possession',
          concept: 'pi for multi-word possession (e.g., tomo pi jan Alu)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch4-pi-multiple',
          concept:
            'Multiple pi phrases — grammatically valid but strongly discouraged',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
      ],
    },

    // ── Chapter 5: Negation & Questions ─────────────────────────────────────
    {
      id: 'ch5',
      title: 'Chapter 5: Negation & Questions',
      order: 5,
      concepts: [
        {
          id: 'ch5-ala-negation',
          concept:
            'ala — universal negation (placed after the word it negates)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch5-ala-modifier',
          concept: 'ala as subject modifier (jan ala = nobody)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch5-a-not-a',
          concept: 'A-not-A structure — yes/no questions (verb ala verb)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch5-a-not-a-answers',
          concept:
            'Answering A-not-A questions (repeat verb = yes; verb + ala = no)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch5-anu-seme',
          concept:
            'anu seme tag — turns any statement into a yes/no question',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch5-seme',
          concept:
            'seme pronoun — wh- questions (replaces the unknown element)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
      ],
    },

    // ── Chapter 6: Preverbs & Prepositions ──────────────────────────────────
    {
      id: 'ch6',
      title: 'Chapter 6: Preverbs & Prepositions',
      order: 6,
      concepts: [
        {
          id: 'ch6-preverb-position',
          concept:
            'Preverb position — after subject/li, before the main verb',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch6-wile',
          concept: 'wile — to want to / need to',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch6-ken',
          concept: 'ken — to be able to / can',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch6-kama',
          concept: 'kama — to begin to / to become',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch6-awen',
          concept: 'awen — to continue to / keep',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch6-alasa',
          concept: 'alasa — to try to',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch6-secondary-preverbs',
          concept: 'Secondary preverbs: sona, open, pini, lukin',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch6-lon',
          concept: 'lon — location / existence (at, in, on)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch6-tawa',
          concept: 'tawa — movement / perspective (to, for, toward)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch6-tan',
          concept: 'tan — source / cause (from, because of)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch6-kepeken',
          concept: 'kepeken — instrumentality (using, with)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch6-sama',
          concept: 'sama — similarity / comparison (like, as)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
      ],
    },

    // ── Chapter 7: Colors & Numbers ──────────────────────────────────────────
    {
      id: 'ch7',
      title: 'Chapter 7: Colors & Numbers',
      order: 7,
      concepts: [
        {
          id: 'ch7-five-colors',
          concept: 'Five-color schema: pimeja, walo, loje, jelo, laso',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch7-laso-grue',
          concept: 'laso covers both blue and green (grue category)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch7-color-combos',
          concept:
            'Color combination for shades (e.g., laso loje = purple)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch7-pi-colors',
          concept:
            'pi for complex color descriptions (e.g., sewi pi pimeja walo = gray sky)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch7-basic-numbers',
          concept: 'Basic number system: wan (1), tu (2), mute (3+), ala (0)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch7-extended-numbers',
          concept: 'Extended number system: luka (5), mute (20), ale (100)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch7-additive-construction',
          concept:
            'Additive number construction (e.g., tu wan = 3, tu tu = 4)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch7-number-philosophy',
          concept:
            'Philosophy: precision in large numbers is intentionally discouraged',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
      ],
    },

    // ── Chapter 8: Compounding, Context & Community ──────────────────────────
    {
      id: 'ch8',
      title: 'Chapter 8: Compounding, Context & Community',
      order: 8,
      concepts: [
        {
          id: 'ch8-compounding',
          concept:
            'Compounding — head + modifier(s) to express specific ideas',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch8-fixed-compounds',
          concept:
            'Common fixed compounds (jan pona, telo nasa, tomo tawa)',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch8-lexicalization',
          concept:
            'Lexicalization debate — resistance to fixed compound meanings',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch8-context',
          concept: 'Context as the meaning-carrier, not vocabulary',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch8-thinking-tp',
          concept:
            "'Thinking in Toki Pona' — avoiding native language projection",
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch8-simplicity',
          concept:
            'Stylistic preference for simple, direct sentences over complex constructions',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
      ],
    },

    // ── Chapter 9: Writing Systems ───────────────────────────────────────────
    {
      id: 'ch9',
      title: 'Chapter 9: Writing Systems',
      order: 9,
      concepts: [
        {
          id: 'ch9-latin',
          concept: 'Latin alphabet as the default writing system',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch9-sitelen-pona',
          concept:
            'sitelen pona — logographic system, one grapheme per word',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch9-sitelen-pona-compounding',
          concept:
            'sitelen pona compounding — modifier grapheme inside/above head grapheme',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch9-sitelen-sitelen',
          concept:
            'sitelen sitelen — non-linear, mixed logographic + syllabic system',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
        {
          id: 'ch9-sitelen-sitelen-purpose',
          concept:
            'sitelen sitelen purpose — contemplative, slow engagement with language',
          status: 'not_started',
          sessionNotes: '',
      confidenceScore: 0,
        },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  // Vocabulary  (124 words — appended in batches)
  // -------------------------------------------------------------------------
  vocabulary: [
    // ── a ──────────────────────────────────────────────────────────────────
    {
      id: 'a',
      word: 'a',
      partOfSpeech: 'Interjection',
      meanings: 'ah, oh, ha, um, wow',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── akesi ───────────────────────────────────────────────────────────────
    {
      id: 'akesi',
      word: 'akesi',
      partOfSpeech: 'Noun',
      meanings: 'reptile, amphibian, non-cute animal',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── ala ─────────────────────────────────────────────────────────────────
    {
      id: 'ala',
      word: 'ala',
      partOfSpeech: 'Adj / Negator / Number',
      meanings: 'not, no, nothing, zero',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── alasa ────────────────────────────────────────────────────────────────
    {
      id: 'alasa',
      word: 'alasa',
      partOfSpeech: 'Verb / Pre-verb',
      meanings: 'to hunt, gather, search; to try to...',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── ale / ali ────────────────────────────────────────────────────────────
    {
      id: 'ale-ali',
      word: 'ale / ali',
      partOfSpeech: 'Adj / Noun / Number',
      meanings: 'all, every, abundance; (number) 100',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── ante ─────────────────────────────────────────────────────────────────
    {
      id: 'ante',
      word: 'ante',
      partOfSpeech: 'Adj / Noun / Verb',
      meanings: 'different, other; difference; to change',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── anu ──────────────────────────────────────────────────────────────────
    {
      id: 'anu',
      word: 'anu',
      partOfSpeech: 'Particle',
      meanings: 'or',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── awen ─────────────────────────────────────────────────────────────────
    {
      id: 'awen',
      word: 'awen',
      partOfSpeech: 'Verb / Adj / Pre-verb',
      meanings: 'to stay, keep, protect; safe; to continue to...',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── e ────────────────────────────────────────────────────────────────────
    {
      id: 'e',
      word: 'e',
      partOfSpeech: 'Particle',
      meanings: '(marks a direct object)',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── en ───────────────────────────────────────────────────────────────────
    {
      id: 'en',
      word: 'en',
      partOfSpeech: 'Particle',
      meanings: 'and (joins subjects)',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── esun ─────────────────────────────────────────────────────────────────
    {
      id: 'esun',
      word: 'esun',
      partOfSpeech: 'Noun / Verb',
      meanings: 'market, shop, trade; to buy, sell, trade',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── ijo ──────────────────────────────────────────────────────────────────
    {
      id: 'ijo',
      word: 'ijo',
      partOfSpeech: 'Noun / Adj',
      meanings: 'thing, object, matter; material, physical',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── ike ──────────────────────────────────────────────────────────────────
    {
      id: 'ike',
      word: 'ike',
      partOfSpeech: 'Adj / Noun',
      meanings: 'bad, evil, negative, complex, wrong',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── ilo ──────────────────────────────────────────────────────────────────
    {
      id: 'ilo',
      word: 'ilo',
      partOfSpeech: 'Noun',
      meanings: 'tool, device, machine',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── insa ─────────────────────────────────────────────────────────────────
    {
      id: 'insa',
      word: 'insa',
      partOfSpeech: 'Noun / Adj',
      meanings: 'inside, center, interior, stomach; central',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── jaki ─────────────────────────────────────────────────────────────────
    {
      id: 'jaki',
      word: 'jaki',
      partOfSpeech: 'Adj / Noun',
      meanings: 'dirty, gross, unclean; dirt, waste',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── jan ──────────────────────────────────────────────────────────────────
    {
      id: 'jan',
      word: 'jan',
      partOfSpeech: 'Noun',
      meanings: 'person, human, people, somebody',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── jelo ─────────────────────────────────────────────────────────────────
    {
      id: 'jelo',
      word: 'jelo',
      partOfSpeech: 'Adj / Noun',
      meanings: 'yellow',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── jo ───────────────────────────────────────────────────────────────────
    {
      id: 'jo',
      word: 'jo',
      partOfSpeech: 'Verb',
      meanings: 'to have, possess, own, contain, hold',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── kala ─────────────────────────────────────────────────────────────────
    {
      id: 'kala',
      word: 'kala',
      partOfSpeech: 'Noun',
      meanings: 'fish, sea creature',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── kalama ───────────────────────────────────────────────────────────────
    {
      id: 'kalama',
      word: 'kalama',
      partOfSpeech: 'Noun / Verb',
      meanings: 'sound, noise; to make sound',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── kama ─────────────────────────────────────────────────────────────────
    {
      id: 'kama',
      word: 'kama',
      partOfSpeech: 'Verb / Pre-verb',
      meanings: 'to come, arrive, become, happen; to begin to...',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── kasi ─────────────────────────────────────────────────────────────────
    {
      id: 'kasi',
      word: 'kasi',
      partOfSpeech: 'Noun',
      meanings: 'plant, tree, leaf, wood',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── ken ──────────────────────────────────────────────────────────────────
    {
      id: 'ken',
      word: 'ken',
      partOfSpeech: 'Verb / Pre-verb',
      meanings: 'to be able to, can, may; to be possible',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── kepeken ──────────────────────────────────────────────────────────────
    {
      id: 'kepeken',
      word: 'kepeken',
      partOfSpeech: 'Preposition / Verb',
      meanings: 'using, with, by means of; to use',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── kili ─────────────────────────────────────────────────────────────────
    {
      id: 'kili',
      word: 'kili',
      partOfSpeech: 'Noun',
      meanings: 'fruit, vegetable',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── kin ──────────────────────────────────────────────────────────────────
    {
      id: 'kin',
      word: 'kin',
      partOfSpeech: 'Particle / Adj',
      meanings: 'also, too',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── kipisi ───────────────────────────────────────────────────────────────
    {
      id: 'kipisi',
      word: 'kipisi',
      partOfSpeech: 'Verb / Noun',
      meanings: 'to cut, divide, split; a slice, section',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── kiwen ────────────────────────────────────────────────────────────────
    {
      id: 'kiwen',
      word: 'kiwen',
      partOfSpeech: 'Noun / Adj',
      meanings: 'rock, stone, metal; hard, solid',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── ko ───────────────────────────────────────────────────────────────────
    {
      id: 'ko',
      word: 'ko',
      partOfSpeech: 'Noun',
      meanings: 'powder, paste, clay, semisolid substance',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── kon ──────────────────────────────────────────────────────────────────
    {
      id: 'kon',
      word: 'kon',
      partOfSpeech: 'Noun',
      meanings: 'air, gas, spirit, soul, meaning, unseen agent',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── kule ─────────────────────────────────────────────────────────────────
    {
      id: 'kule',
      word: 'kule',
      partOfSpeech: 'Noun',
      meanings: 'color, aspect of a sense (timbre, flavor, etc.)',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── kulupu ───────────────────────────────────────────────────────────────
    {
      id: 'kulupu',
      word: 'kulupu',
      partOfSpeech: 'Noun',
      meanings: 'group, community, society',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── kute ─────────────────────────────────────────────────────────────────
    {
      id: 'kute',
      word: 'kute',
      partOfSpeech: 'Noun / Verb',
      meanings: 'ear; to hear, listen, obey',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── la ───────────────────────────────────────────────────────────────────
    {
      id: 'la',
      word: 'la',
      partOfSpeech: 'Particle',
      meanings: '(separates context from the main sentence)',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── lape ─────────────────────────────────────────────────────────────────
    {
      id: 'lape',
      word: 'lape',
      partOfSpeech: 'Noun / Verb / Adj',
      meanings: 'sleep, rest; to sleep, to rest; sleeping',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── laso ─────────────────────────────────────────────────────────────────
    {
      id: 'laso',
      word: 'laso',
      partOfSpeech: 'Adj / Noun',
      meanings: 'blue, green',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── lawa ─────────────────────────────────────────────────────────────────
    {
      id: 'lawa',
      word: 'lawa',
      partOfSpeech: 'Noun / Verb',
      meanings: 'head, mind; to lead, control, rule, plan',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── len ──────────────────────────────────────────────────────────────────
    {
      id: 'len',
      word: 'len',
      partOfSpeech: 'Noun',
      meanings: 'cloth, clothing, fabric, layer',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── lete ─────────────────────────────────────────────────────────────────
    {
      id: 'lete',
      word: 'lete',
      partOfSpeech: 'Adj',
      meanings: 'cold, cool, raw',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── li ───────────────────────────────────────────────────────────────────
    {
      id: 'li',
      word: 'li',
      partOfSpeech: 'Particle',
      meanings: '(separates subject from predicate)',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── lili ─────────────────────────────────────────────────────────────────
    {
      id: 'lili',
      word: 'lili',
      partOfSpeech: 'Adj',
      meanings: 'little, small, short, few, young',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── linja ────────────────────────────────────────────────────────────────
    {
      id: 'linja',
      word: 'linja',
      partOfSpeech: 'Noun',
      meanings: 'line, rope, string, hair, long flexible thing',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── lipu ─────────────────────────────────────────────────────────────────
    {
      id: 'lipu',
      word: 'lipu',
      partOfSpeech: 'Noun',
      meanings: 'flat object, book, paper, document, website',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── loje ─────────────────────────────────────────────────────────────────
    {
      id: 'loje',
      word: 'loje',
      partOfSpeech: 'Adj / Noun',
      meanings: 'red, reddish',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── lon ──────────────────────────────────────────────────────────────────
    {
      id: 'lon',
      word: 'lon',
      partOfSpeech: 'Prep / Verb / Adj',
      meanings: 'in, at, on; to be present, to exist; true, real',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── luka ─────────────────────────────────────────────────────────────────
    {
      id: 'luka',
      word: 'luka',
      partOfSpeech: 'Noun / Number',
      meanings: 'hand, arm; five',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── lukin ────────────────────────────────────────────────────────────────
    {
      id: 'lukin',
      word: 'lukin',
      partOfSpeech: 'Noun / Verb / Pre-verb',
      meanings: 'eye; to see, look, watch; to try to...',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── lupa ─────────────────────────────────────────────────────────────────
    {
      id: 'lupa',
      word: 'lupa',
      partOfSpeech: 'Noun',
      meanings: 'hole, opening, window, door',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── ma ───────────────────────────────────────────────────────────────────
    {
      id: 'ma',
      word: 'ma',
      partOfSpeech: 'Noun',
      meanings: 'land, place, location, country, ground',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── mama ─────────────────────────────────────────────────────────────────
    {
      id: 'mama',
      word: 'mama',
      partOfSpeech: 'Noun',
      meanings: 'parent, ancestor, creator, caretaker',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── mani ─────────────────────────────────────────────────────────────────
    {
      id: 'mani',
      word: 'mani',
      partOfSpeech: 'Noun',
      meanings: 'money, currency, livestock (as value measure)',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── meli ─────────────────────────────────────────────────────────────────
    {
      id: 'meli',
      word: 'meli',
      partOfSpeech: 'Noun / Adj',
      meanings: 'woman, female; feminine',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── mi ───────────────────────────────────────────────────────────────────
    {
      id: 'mi',
      word: 'mi',
      partOfSpeech: 'Pronoun',
      meanings: 'I, me, we, us',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── mije ─────────────────────────────────────────────────────────────────
    {
      id: 'mije',
      word: 'mije',
      partOfSpeech: 'Noun / Adj',
      meanings: 'man, male; masculine',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── moku ─────────────────────────────────────────────────────────────────
    {
      id: 'moku',
      word: 'moku',
      partOfSpeech: 'Noun / Verb / Adj',
      meanings: 'food, drink; to eat, drink, consume; edible',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── moli ─────────────────────────────────────────────────────────────────
    {
      id: 'moli',
      word: 'moli',
      partOfSpeech: 'Noun / Verb / Adj',
      meanings: 'death; to die, to kill; dead',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── monsi ────────────────────────────────────────────────────────────────
    {
      id: 'monsi',
      word: 'monsi',
      partOfSpeech: 'Noun',
      meanings: 'back, rear, behind',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── mu ───────────────────────────────────────────────────────────────────
    {
      id: 'mu',
      word: 'mu',
      partOfSpeech: 'Interjection / Noun',
      meanings: '(any animal sound)',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── mun ──────────────────────────────────────────────────────────────────
    {
      id: 'mun',
      word: 'mun',
      partOfSpeech: 'Noun',
      meanings: 'moon, star, night sky object',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── musi ─────────────────────────────────────────────────────────────────
    {
      id: 'musi',
      word: 'musi',
      partOfSpeech: 'Noun / Adj / Verb',
      meanings: 'game, art, fun; entertaining, amusing; to play',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── mute ─────────────────────────────────────────────────────────────────
    {
      id: 'mute',
      word: 'mute',
      partOfSpeech: 'Adj / Noun / Number',
      meanings: 'many, a lot; (number) 3+ or 20 in complex system',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── namako ───────────────────────────────────────────────────────────────
    {
      id: 'namako',
      word: 'namako',
      partOfSpeech: 'Adj / Noun',
      meanings: 'additional, extra; spice',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── nasa ─────────────────────────────────────────────────────────────────
    {
      id: 'nasa',
      word: 'nasa',
      partOfSpeech: 'Adj',
      meanings: 'strange, weird, silly, unusual',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── nasin ────────────────────────────────────────────────────────────────
    {
      id: 'nasin',
      word: 'nasin',
      partOfSpeech: 'Noun',
      meanings: 'way, path, method, road, doctrine',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── nena ─────────────────────────────────────────────────────────────────
    {
      id: 'nena',
      word: 'nena',
      partOfSpeech: 'Noun',
      meanings: 'bump, hill, mountain, nose',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── ni ───────────────────────────────────────────────────────────────────
    {
      id: 'ni',
      word: 'ni',
      partOfSpeech: 'Adj / Pronoun',
      meanings: 'this, that, these, those',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── nimi ─────────────────────────────────────────────────────────────────
    {
      id: 'nimi',
      word: 'nimi',
      partOfSpeech: 'Noun',
      meanings: 'word, name',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── noka ─────────────────────────────────────────────────────────────────
    {
      id: 'noka',
      word: 'noka',
      partOfSpeech: 'Noun',
      meanings: 'leg, foot, bottom part',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── o ────────────────────────────────────────────────────────────────────
    {
      id: 'o',
      word: 'o',
      partOfSpeech: 'Particle',
      meanings: '(marks vocatives and commands)',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── oko ──────────────────────────────────────────────────────────────────
    {
      id: 'oko',
      word: 'oko',
      partOfSpeech: 'Noun',
      meanings: 'eye',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── olin ─────────────────────────────────────────────────────────────────
    {
      id: 'olin',
      word: 'olin',
      partOfSpeech: 'Noun / Verb / Adj',
      meanings: 'love, compassion; to love; romantic, loving',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── ona ──────────────────────────────────────────────────────────────────
    {
      id: 'ona',
      word: 'ona',
      partOfSpeech: 'Pronoun',
      meanings: 'he, she, it, they',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── open ─────────────────────────────────────────────────────────────────
    {
      id: 'open',
      word: 'open',
      partOfSpeech: 'Verb / Adj',
      meanings: 'to open, begin, start; open',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── pakala ───────────────────────────────────────────────────────────────
    {
      id: 'pakala',
      word: 'pakala',
      partOfSpeech: 'Verb / Noun / Interjection',
      meanings: 'to break, damage, harm; mistake, accident; darn!',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── pali ─────────────────────────────────────────────────────────────────
    {
      id: 'pali',
      word: 'pali',
      partOfSpeech: 'Noun / Verb',
      meanings: 'work, job, activity, creation; to do, make, work, create',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── palisa ───────────────────────────────────────────────────────────────
    {
      id: 'palisa',
      word: 'palisa',
      partOfSpeech: 'Noun',
      meanings: 'long solid object, stick, branch',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── pan ──────────────────────────────────────────────────────────────────
    {
      id: 'pan',
      word: 'pan',
      partOfSpeech: 'Noun',
      meanings: 'grain, bread, pasta, rice, starchy staple',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── pi ───────────────────────────────────────────────────────────────────
    {
      id: 'pi',
      word: 'pi',
      partOfSpeech: 'Particle',
      meanings: 'of (regroups modifiers)',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── pilin ────────────────────────────────────────────────────────────────
    {
      id: 'pilin',
      word: 'pilin',
      partOfSpeech: 'Noun / Verb',
      meanings: 'feeling, emotion, heart; to feel, think',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── pimeja ───────────────────────────────────────────────────────────────
    {
      id: 'pimeja',
      word: 'pimeja',
      partOfSpeech: 'Adj / Noun',
      meanings: 'black, dark',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── pini ─────────────────────────────────────────────────────────────────
    {
      id: 'pini',
      word: 'pini',
      partOfSpeech: 'Verb / Adj / Noun',
      meanings: 'to finish, end, close; final, completed; end',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── pipi ─────────────────────────────────────────────────────────────────
    {
      id: 'pipi',
      word: 'pipi',
      partOfSpeech: 'Noun',
      meanings: 'bug, insect, spider',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── poka ─────────────────────────────────────────────────────────────────
    {
      id: 'poka',
      word: 'poka',
      partOfSpeech: 'Noun',
      meanings: 'side, hip, nearby area',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── poki ─────────────────────────────────────────────────────────────────
    {
      id: 'poki',
      word: 'poki',
      partOfSpeech: 'Noun',
      meanings: 'container, box, bag, bowl',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── pona ─────────────────────────────────────────────────────────────────
    {
      id: 'pona',
      word: 'pona',
      partOfSpeech: 'Noun / Adj / Verb',
      meanings: "good, simplicity, positive; to fix, to make good",
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── pu ───────────────────────────────────────────────────────────────────
    {
      id: 'pu',
      word: 'pu',
      partOfSpeech: 'Noun / Adj',
      meanings: 'interacting with the official Toki Pona book',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── sama ─────────────────────────────────────────────────────────────────
    {
      id: 'sama',
      word: 'sama',
      partOfSpeech: 'Prep / Adj',
      meanings: 'as, like, similar to; same, similar, sibling',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── seli ─────────────────────────────────────────────────────────────────
    {
      id: 'seli',
      word: 'seli',
      partOfSpeech: 'Noun / Adj / Verb',
      meanings: 'heat, warmth; hot, warm; to heat, to cook',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── selo ─────────────────────────────────────────────────────────────────
    {
      id: 'selo',
      word: 'selo',
      partOfSpeech: 'Noun',
      meanings: 'outside, outer layer, skin, shell, boundary',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── seme ─────────────────────────────────────────────────────────────────
    {
      id: 'seme',
      word: 'seme',
      partOfSpeech: 'Particle',
      meanings: 'what? which? (interrogative pronoun)',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── sewi ─────────────────────────────────────────────────────────────────
    {
      id: 'sewi',
      word: 'sewi',
      partOfSpeech: 'Noun / Adj',
      meanings: 'top, sky, area above; high, divine, sacred',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── sijelo ───────────────────────────────────────────────────────────────
    {
      id: 'sijelo',
      word: 'sijelo',
      partOfSpeech: 'Noun',
      meanings: 'body, physical state, torso',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── sike ─────────────────────────────────────────────────────────────────
    {
      id: 'sike',
      word: 'sike',
      partOfSpeech: 'Noun / Adj',
      meanings: 'circle, ball, wheel, cycle, year; round',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── sin ──────────────────────────────────────────────────────────────────
    {
      id: 'sin',
      word: 'sin',
      partOfSpeech: 'Adj / Noun',
      meanings: 'new, fresh, another, more',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── sina ─────────────────────────────────────────────────────────────────
    {
      id: 'sina',
      word: 'sina',
      partOfSpeech: 'Pronoun',
      meanings: 'you',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── sinpin ───────────────────────────────────────────────────────────────
    {
      id: 'sinpin',
      word: 'sinpin',
      partOfSpeech: 'Noun',
      meanings: 'front, face, wall',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── sitelen ──────────────────────────────────────────────────────────────
    {
      id: 'sitelen',
      word: 'sitelen',
      partOfSpeech: 'Noun / Verb',
      meanings: 'image, picture, writing, symbol; to draw, write',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── sona ─────────────────────────────────────────────────────────────────
    {
      id: 'sona',
      word: 'sona',
      partOfSpeech: 'Noun / Verb / Pre-verb',
      meanings: 'knowledge, information; to know; to know how to...',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── soweli ───────────────────────────────────────────────────────────────
    {
      id: 'soweli',
      word: 'soweli',
      partOfSpeech: 'Noun',
      meanings: 'land mammal, animal',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── suli ─────────────────────────────────────────────────────────────────
    {
      id: 'suli',
      word: 'suli',
      partOfSpeech: 'Adj / Noun',
      meanings: 'big, large, tall, long, important, adult; size',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── suno ─────────────────────────────────────────────────────────────────
    {
      id: 'suno',
      word: 'suno',
      partOfSpeech: 'Noun / Adj',
      meanings: 'sun, light; bright',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── supa ─────────────────────────────────────────────────────────────────
    {
      id: 'supa',
      word: 'supa',
      partOfSpeech: 'Noun',
      meanings: 'horizontal surface (table, bed, floor)',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── suwi ─────────────────────────────────────────────────────────────────
    {
      id: 'suwi',
      word: 'suwi',
      partOfSpeech: 'Adj',
      meanings: 'sweet, fragrant, cute, adorable',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── tan ──────────────────────────────────────────────────────────────────
    {
      id: 'tan',
      word: 'tan',
      partOfSpeech: 'Preposition / Noun',
      meanings: 'from, because of; cause, reason, origin',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── taso ─────────────────────────────────────────────────────────────────
    {
      id: 'taso',
      word: 'taso',
      partOfSpeech: 'Particle / Adj',
      meanings: 'but, however; only',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── tawa ─────────────────────────────────────────────────────────────────
    {
      id: 'tawa',
      word: 'tawa',
      partOfSpeech: 'Prep / Verb / Adj',
      meanings: 'to, for, toward; to go, to move; moving',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── telo ─────────────────────────────────────────────────────────────────
    {
      id: 'telo',
      word: 'telo',
      partOfSpeech: 'Noun / Adj',
      meanings: 'water, liquid; wet',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── tenpo ────────────────────────────────────────────────────────────────
    {
      id: 'tenpo',
      word: 'tenpo',
      partOfSpeech: 'Noun',
      meanings: 'time, duration, occasion, situation',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── toki ─────────────────────────────────────────────────────────────────
    {
      id: 'toki',
      word: 'toki',
      partOfSpeech: 'Noun / Verb / Interjection',
      meanings: 'language, speech; to talk, speak, say; hello!',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── tomo ─────────────────────────────────────────────────────────────────
    {
      id: 'tomo',
      word: 'tomo',
      partOfSpeech: 'Noun',
      meanings: 'indoor space, building, house, room',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── tonsi ────────────────────────────────────────────────────────────────
    {
      id: 'tonsi',
      word: 'tonsi',
      partOfSpeech: 'Noun / Adj',
      meanings: 'non-binary person, trans person; gender-nonconforming',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── tu ───────────────────────────────────────────────────────────────────
    {
      id: 'tu',
      word: 'tu',
      partOfSpeech: 'Number / Verb',
      meanings: 'two; to divide',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── unpa ─────────────────────────────────────────────────────────────────
    {
      id: 'unpa',
      word: 'unpa',
      partOfSpeech: 'Noun / Verb',
      meanings: 'sex, sexual relations; to have sex with',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── uta ──────────────────────────────────────────────────────────────────
    {
      id: 'uta',
      word: 'uta',
      partOfSpeech: 'Noun',
      meanings: 'mouth, lips, jaw',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── utala ────────────────────────────────────────────────────────────────
    {
      id: 'utala',
      word: 'utala',
      partOfSpeech: 'Noun / Verb',
      meanings: 'battle, conflict, competition; to fight, struggle against',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── walo ─────────────────────────────────────────────────────────────────
    {
      id: 'walo',
      word: 'walo',
      partOfSpeech: 'Adj / Noun',
      meanings: 'white, light-colored, pale',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── wan ──────────────────────────────────────────────────────────────────
    {
      id: 'wan',
      word: 'wan',
      partOfSpeech: 'Number / Adj',
      meanings: 'one; unique, united',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── waso ─────────────────────────────────────────────────────────────────
    {
      id: 'waso',
      word: 'waso',
      partOfSpeech: 'Noun',
      meanings: 'bird, flying creature',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── wawa ─────────────────────────────────────────────────────────────────
    {
      id: 'wawa',
      word: 'wawa',
      partOfSpeech: 'Adj',
      meanings: 'strong, powerful, energetic, intense',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── weka ─────────────────────────────────────────────────────────────────
    {
      id: 'weka',
      word: 'weka',
      partOfSpeech: 'Adj',
      meanings: 'away, absent, ignored',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── wile ─────────────────────────────────────────────────────────────────
    {
      id: 'wile',
      word: 'wile',
      partOfSpeech: 'Verb / Pre-verb',
      meanings: 'to want, need, wish, should',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
    // ── nanpa ────────────────────────────────────────────────────────────────
    {
      id: 'nanpa',
      word: 'nanpa',
      partOfSpeech: 'Particle / Noun',
      meanings: 'number; ordinal marker',
      status: 'not_started',
      isMasteryCandidate: false,
      sessionNotes: '',
      confidenceScore: 0,
    },
  ],
};
