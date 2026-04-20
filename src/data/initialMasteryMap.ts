import type { MasteryMap } from '../types/mastery';

// ---------------------------------------------------------------------------
// Seed data — mirrors the Toki Pona Mastery Map (Introduction Level)
// Last synced: April 15, 2026 through Study Session #22 / Learning Session #14
// / Immersion Session #11
// ---------------------------------------------------------------------------

export const initialMasteryMap: MasteryMap = {
  studentName: 'Anthony',
  curriculumLevel: 'Introduction',
  lastUpdated: '2026-04-15',

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
        },
        {
          id: 'intro-design-goals',
          concept: 'Core design goals (minimalism, present-moment focus)',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'intro-influences',
          concept: 'Philosophical influences (Taoism, Sapir-Whorf hypothesis)',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'intro-publications',
          concept:
            'Publication history: lipu pu (2014, 120 words) & lipu ku (2021, 137 words)',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'intro-misconceptions',
          concept:
            'Common misconceptions (anarcho-primitivism, Piraha similarities)',
          status: 'not_started',
          sessionNotes: '',
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
          status: 'introduced',
          sessionNotes:
            'Identified all 9 consonants and missing letters in drills.',
        },
        {
          id: 'ch1-vowels',
          concept: 'Vowel inventory (5): a, e, i, o, u',
          status: 'introduced',
          sessionNotes: 'Identified all 5 vowels.',
        },
        {
          id: 'ch1-syllable-structure',
          concept: 'Syllable structure / phonotactics: (C)V(N) and CV(N)',
          status: 'confident',
          sessionNotes:
            'Correctly identifies illegal words. Perfect recall of legal word shapes across multiple sessions. Mastery candidate.',
        },
        {
          id: 'ch1-stress',
          concept: 'Stress rule (always on first syllable)',
          status: 'introduced',
          sessionNotes:
            "Applied correctly to 'pakala' and name adaptation.",
        },
        {
          id: 'ch1-allophony',
          concept: 'Allophony (voiced/unvoiced variation, l as tap, etc.)',
          status: 'introduced',
          sessionNotes:
            "Correctly identified voicing (e.g., 'pona' → 'BO-na') as acceptable.",
        },
        {
          id: 'ch1-nasal-assimilation',
          concept: 'Final nasal assimilation',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch1-forbidden',
          concept: 'Forbidden elements: diphthongs, consonant clusters, tones',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch1-orthography',
          concept: 'Latin alphabet orthography — lowercase default',
          status: 'mastered',
          sessionNotes:
            "Any word mis-typed is a typo and shouldn't be considered an error/wrong answer.",
        },
        {
          id: 'ch1-capitalization',
          concept: 'Capitalization rules (proper nouns / unofficial words)',
          status: 'mastered',
          sessionNotes:
            'Any accidental capitalization for certain words and during the start of a sentence should be considered an automation of the keyboard and not as an error/wrong answer.',
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
          status: 'confident',
          sessionNotes:
            'Consistently places subject before predicate. Strong across multiple sessions.',
        },
        {
          id: 'ch2-li',
          concept: 'The li particle — separates subject from predicate',
          status: 'mastered',
          sessionNotes:
            'Perfect recall of mi/sina exception. No errors in subject-verb separation across multiple session types. Mastered in Study Session 3.',
        },
        {
          id: 'ch2-e',
          concept: 'The e particle — marks direct object',
          status: 'mastered',
          sessionNotes:
            'Consistently applied across multiple sessions without error. Mastered in Session 4. Confirmed perfect repetition in lists throughout Study Session #14 and beyond.',
        },
        {
          id: 'ch2-li-omission',
          concept:
            'li Omission Rule — dropped when subject is only mi or sina',
          status: 'mastered',
          sessionNotes:
            "Zero errors across multiple session types. Understands 'mi en sina' still requires li. Mastered in Study Session 3.",
        },
        {
          id: 'ch2-predicate-types',
          concept: 'Predicate types: verb, adjective, or noun after li',
          status: 'introduced',
          sessionNotes:
            'Used verb, adjective, and noun predicates in practice.',
        },
        {
          id: 'ch2-tense-free',
          concept: 'Tense-free grammar — context determines time',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch2-en',
          concept: 'The en particle — joins multiple subjects',
          status: 'mastered',
          sessionNotes:
            "Study Session 16: flawless. Study Session 19: confirmed error-free across subject/object distinction drills. Mastered per Study Sessions 16 & 19 consensus. Caution: Immersion Sessions 2–4 show recurring 'en trap' in free production. Monitor in future immersion.",
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
          status: 'practicing',
          sessionNotes:
            "Demonstrated through using words in different positions (e.g., noka as noun vs. verb). Identified 'word-creep' as a personal barrier.",
        },
        {
          id: 'ch3-head-initial',
          concept: 'Head-initial modifier system — first word is the head',
          status: 'confident',
          sessionNotes:
            'Consistently places descriptors after the noun without prompting. Automatic across all sessions. Correctly intuited that names feel more essential and come before general descriptors.',
        },
        {
          id: 'ch3-single-modifier',
          concept: 'Single-modifier phrases (e.g., jan lili = child)',
          status: 'confident',
          sessionNotes: 'Correctly uses phrases like jan lili, jan pona.',
        },
        {
          id: 'ch3-multiple-modifiers',
          concept:
            'Multiple modifiers — each applies independently to the head (not nested)',
          status: 'confident',
          sessionNotes:
            'Correctly stacks modifiers. Intuited that names come before general descriptors. Confirmed stable across many sessions.',
        },
        {
          id: 'ch3-context',
          concept: 'Context as primary meaning-carrier',
          status: 'introduced',
          sessionNotes:
            "Beginning to understand context-driven meaning; identified 'word-creep' as a barrier. Used words as different parts of speech (e.g., oko as a verb).",
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
          status: 'practicing',
          sessionNotes:
            "Introduced in Learning Session 10. Demonstrated 100% accuracy in Study Sessions 15 & 19. Anthony demonstrated 'teacher-level' awareness by correcting the tutor in Study Session 19. MIDTERM REGRESSION (Study Session 22): Failed to identify the core 2-word minimum rule in an error-check drill. Reverted from \u2705 Mastered to \uD83D\udfe1 Practicing pending re-demonstration.",
        },
        {
          id: 'ch4-pi-minimum',
          concept: 'pi requires at least 2 content words after it',
          status: 'introduced',
          sessionNotes: 'Introduced in Learning Session 10.',
        },
        {
          id: 'ch4-pi-vs-direct',
          concept:
            'pi vs. direct modification (simple possession: tomo mi, not tomo pi mi)',
          status: 'introduced',
          sessionNotes:
            'Introduced in Learning Session 10. Watch for tendency to place adjectives after pi when they describe the main headword.',
        },
        {
          id: 'ch4-pi-possession',
          concept: 'pi for multi-word possession (e.g., tomo pi jan Alu)',
          status: 'introduced',
          sessionNotes:
            'Introduced in Learning Session 10. Successfully chained multiple ownership layers.',
        },
        {
          id: 'ch4-pi-multiple',
          concept:
            'Multiple pi phrases — grammatically valid but strongly discouraged',
          status: 'not_started',
          sessionNotes: '',
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
          status: 'confident',
          sessionNotes:
            'Flawless application in translation and storytelling. Zero hesitation across multiple contexts. Used correctly after verbs and adjectives. Study Session 14: 100% accuracy. Learning Session 14: confirmed mastery of all negation functions. Midterm (Study Session 22): flawless logic in reading comprehension and X ala X.',
        },
        {
          id: 'ch5-ala-modifier',
          concept: 'ala as subject modifier (jan ala = nobody)',
          status: 'confident',
          sessionNotes:
            'Used correctly as noun, number, and adjective (zero/nothing).',
        },
        {
          id: 'ch5-a-not-a',
          concept: 'A-not-A structure — yes/no questions (verb ala verb)',
          status: 'confident',
          sessionNotes:
            'Perfect execution of X ala X pattern across multiple sessions. Midterm: confirmed.',
        },
        {
          id: 'ch5-a-not-a-answers',
          concept:
            'Answering A-not-A questions (repeat verb = yes; verb + ala = no)',
          status: 'confident',
          sessionNotes:
            'Correctly answers using verb repetition or verb + ala.',
        },
        {
          id: 'ch5-anu-seme',
          concept:
            'anu seme tag — turns any statement into a yes/no question',
          status: 'confident',
          sessionNotes:
            'Introduced in Learning Session 11. Rapidly demonstrated confident use across noun, verb, and sentence-level choices. Confirmed consistent in Study Session 15.',
        },
        {
          id: 'ch5-seme',
          concept:
            'seme pronoun — wh- questions (replaces the unknown element)',
          status: 'practicing',
          sessionNotes:
            'Study Session 7: placed seme correctly in SVO. Midterm (Study Session 22): reverted to English word order (seme jan instead of jan seme). Regressed from \uD83D\udfe2 Confident to \uD83D\udfe1 Practicing. Needs re-drilling.',
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
          status: 'practicing',
          sessionNotes:
            'Understands helper verbs stack before main verb. Learning Session 14: practiced stacking and negation. Midterm: occasionally inserted e before following verb. Needs more variety.',
        },
        {
          id: 'ch6-wile',
          concept: 'wile — to want to / need to',
          status: 'mastered',
          sessionNotes:
            'Confirmed \u2705 Mastered in Study Sessions 9, 12, and 19. Flawless use as both preverb and transitive verb across varied exercises. Midterm: flawless.',
        },
        {
          id: 'ch6-ken',
          concept: 'ken — to be able to / can',
          status: 'practicing',
          sessionNotes:
            'Gap-fill introduced in Study Session 19. Learning Session 14 & Study Session 21: correct structural placement. Midterm: misspelled (kan) and e insertion error, but X ala X logic was correct.',
        },
        {
          id: 'ch6-kama',
          concept: 'kama — to begin to / to become',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch6-awen',
          concept: 'awen — to continue to / keep',
          status: 'practicing',
          sessionNotes:
            'Introduced as a preverb concept in Session 4. Learning Session 14: initial application successful. Midterm (Study Session 22): failed recall.',
        },
        {
          id: 'ch6-alasa',
          concept: 'alasa — to try to',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch6-secondary-preverbs',
          concept: 'Secondary preverbs: sona, open, pini, lukin',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch6-lon',
          concept: 'lon — location / existence (at, in, on)',
          status: 'confident',
          sessionNotes:
            'Correctly navigates stillness/location logic across complex sentences. Corrected habit of adding e before prepositional heads.',
        },
        {
          id: 'ch6-tawa',
          concept: 'tawa — movement / perspective (to, for, toward)',
          status: 'practicing',
          sessionNotes:
            'Mastered Study Session 9; confirmed Study Sessions 13 & 19. MIDTERM REGRESSION (Study Session 22): failed error-check — did not catch incorrect e insertion with tawa as destination preposition. Reverted from \u2705 Mastered to \uD83D\udfe1 Practicing pending re-demonstration.',
        },
        {
          id: 'ch6-tan',
          concept: 'tan — source / cause (from, because of)',
          status: 'confident',
          sessionNotes:
            'Integrated into complex la structures to express cause. High accuracy in Study Sessions 8, 13, & 19.',
        },
        {
          id: 'ch6-kepeken',
          concept: 'kepeken — instrumentality (using, with)',
          status: 'confident',
          sessionNotes: "Quickly mastered the 'no e' rule for tools.",
        },
        {
          id: 'ch6-sama',
          concept: 'sama — similarity / comparison (like, as)',
          status: 'not_started',
          sessionNotes: '',
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
          status: 'introduced',
          sessionNotes:
            'jelo introduced and practiced in descriptor stacking drills. pimeja encountered in Study Session 8 and Immersion Session 3.',
        },
        {
          id: 'ch7-laso-grue',
          concept: 'laso covers both blue and green (grue category)',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch7-color-combos',
          concept:
            'Color combination for shades (e.g., laso loje = purple)',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch7-pi-colors',
          concept:
            'pi for complex color descriptions (e.g., sewi pi pimeja walo = gray sky)',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch7-basic-numbers',
          concept: 'Basic number system: wan (1), tu (2), mute (3+), ala (0)',
          status: 'confident',
          sessionNotes:
            "Immediate mastery of placement and meaning. Understood post-noun placement and 'very' vs 'many' distinction.",
        },
        {
          id: 'ch7-extended-numbers',
          concept: 'Extended number system: luka (5), mute (20), ale (100)',
          status: 'confident',
          sessionNotes:
            'Learning Session 13: covered the additive building-block system. Successfully built 7, 13, and 26. luka confirmed \uD83D\udfe2 Confident.',
        },
        {
          id: 'ch7-additive-construction',
          concept:
            'Additive number construction (e.g., tu wan = 3, tu tu = 4)',
          status: 'confident',
          sessionNotes:
            'Learning Session 13: successfully constructed multi-part sums (luka tu, luka luka tu wan, mute luka wan).',
        },
        {
          id: 'ch7-number-philosophy',
          concept:
            'Philosophy: precision in large numbers is intentionally discouraged',
          status: 'not_started',
          sessionNotes: '',
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
        },
        {
          id: 'ch8-fixed-compounds',
          concept:
            'Common fixed compounds (jan pona, telo nasa, tomo tawa)',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch8-lexicalization',
          concept:
            'Lexicalization debate — resistance to fixed compound meanings',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch8-context',
          concept: 'Context as the meaning-carrier, not vocabulary',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch8-thinking-tp',
          concept:
            "'Thinking in Toki Pona' — avoiding native language projection",
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch8-simplicity',
          concept:
            'Stylistic preference for simple, direct sentences over complex constructions',
          status: 'not_started',
          sessionNotes: '',
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
        },
        {
          id: 'ch9-sitelen-pona',
          concept:
            'sitelen pona — logographic system, one grapheme per word',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch9-sitelen-pona-compounding',
          concept:
            'sitelen pona compounding — modifier grapheme inside/above head grapheme',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch9-sitelen-sitelen',
          concept:
            'sitelen sitelen — non-linear, mixed logographic + syllabic system',
          status: 'not_started',
          sessionNotes: '',
        },
        {
          id: 'ch9-sitelen-sitelen-purpose',
          concept:
            'sitelen sitelen purpose — contemplative, slow engagement with language',
          status: 'not_started',
          sessionNotes: '',
        },
      ],
    },
  ],

  // -------------------------------------------------------------------------
  // Vocabulary — to be populated in the next step
  // -------------------------------------------------------------------------
  vocabulary: [],
};
