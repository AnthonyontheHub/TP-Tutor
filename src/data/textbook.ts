export interface Chapter {
  id: string;
  title: string;
  sections: { subtitle: string; content: string }[];
  relatedNodeIds: string[];
}

export const textbookContent: Chapter[] = [
  // ─────────────────────────────────────────────
  // INTRODUCTION
  // ─────────────────────────────────────────────
  {
    id: 'intro-philosophy',
    title: 'Introduction: The Philosophy of Simplicity',
    sections: [
      {
        subtitle: 'Origins and Purpose',
        content:
          'To learn Toki Pona is to engage with more than just a language; it is to participate in a philosophical and artistic project. This minimalist constructed language, created by Sonja Lang and first published online in 2001, is built upon a foundation of intentional simplicity. The primary objective is to express maximal meaning with minimal complexity. Drawing inspiration from pidgin languages, Toki Pona focuses on simple, near-universal concepts common across human cultures, stripping away the linguistic baggage that often complicates natural languages. For example, instead of having separate words for "river," "lake," "ocean," and "rain," Toki Pona uses the single word "telo" (water/liquid) for all of them, relying on context to clarify which body of water is meant.',
      },
      {
        subtitle: 'Philosophical Foundations',
        content:
          'This minimalism is not merely an aesthetic choice but a functional one, designed to help users concentrate on basic things and become more aware of the present moment. Inspired by Taoist philosophy and the Sapir-Whorf hypothesis — the idea that language shapes thought — Toki Pona actively seeks to promote positive thinking by limiting the tools for complex, negative rumination. In practice, this means there is no single word for "war," "depression," or "hatred." A speaker must construct these ideas from simpler pieces (e.g., "utala mute" for widespread conflict), which forces a moment of reflection before expressing a negative idea.',
      },
      {
        subtitle: 'Evolution of the Vocabulary',
        content:
          'The language began as a draft in 2001 with approximately 118 words. Over the next decade this lexicon was refined, culminating in the 2014 publication of "Toki Pona: The Language of Good" (known to the community as lipu pu), which established a "completed form" of 120 core words. In 2021, Lang published the Toki Pona Dictionary (lipu ku), expanding the canon to 137 "essential" words (nimi ku suli), canonizing terms such as "tonsi" (non-binary person) and "kipisi" (to cut) that had gained widespread community acceptance.',
      },
      {
        subtitle: 'Common Misconceptions',
        content:
          'It is useful to clarify certain misconceptions from the outset. Anarcho-primitivism was only one of many perspectives that informed the project and was deliberately excluded from lipu pu as tangential. It is also critical to avoid reducing other cultures to an "exotic" aesthetic. Toki Pona shares some coincidental structural similarities with the Apáitisí (Pirahã) language — such as a small phonology and a simplified number system — but Lang only became aware of this language after 2008, well after Toki Pona\'s core design was established. The similarities are coincidental, not derivative.',
      },
      {
        subtitle: 'How to Use This Textbook',
        content:
          'Each chapter builds on the last. Chapter 1 covers sounds and spelling so you can read and write every word correctly. Chapter 2 introduces the core sentence, the single most important structure in the language. Chapters 3 and 4 show how to build complex descriptions. Chapters 5 and 6 add questions, negation, and nuance. Chapter 7 covers the "la" context particle. Chapter 8 covers commands and the word "taso." Chapters 9 and 10 cover vocabulary systems and community culture. Chapter 11 introduces the native scripts. Throughout, Toki Pona text is given first, followed by a natural English translation in quotes — for example: toki pona li pona → "Toki Pona is good."',
      },
    ],
    relatedNodeIds: ['phi_sim', 'lipu_pu', 'lipu_ku', 'sapir_whorf', 'taoism'],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 1: PHONOLOGY
  // ─────────────────────────────────────────────
  {
    id: 'ch1-phonology',
    title: 'Chapter 1: The Sounds of Simplicity — Phonology and Orthography',
    sections: [
      {
        subtitle: 'Phonemic Inventory',
        content:
          'Toki Pona\'s complete phonemic inventory consists of just nine consonants and five vowels. Consonants: p, t, k, s, m, n, l, j, w. Vowels: a, e, i, o, u. The vowels are pronounced as in Spanish or Italian — "a" as in "father," "e" as in "bed," "i" as in "machine," "o" as in "more," "u" as in "moon." This small inventory means that virtually any adult speaker, regardless of their native language, can produce every sound in Toki Pona with minimal effort. There are no clicks, tones, or sounds unique to a single language family.',
      },
      {
        subtitle: 'Syllable Structure',
        content:
          'Every syllable must contain a vowel. The first syllable of a word follows the pattern (C)V(N) — an optional consonant, a required vowel, and an optional final "n." All subsequent syllables follow CV(N), requiring a consonant before the vowel. The most common pattern by far is CV (consonant + vowel), accounting for roughly 75% of all syllables. Examples of syllable breakdown: "toki" = to-ki; "pona" = po-na; "moku" = mo-ku; "tenpo" = ten-po; "soweli" = so-we-li. Notice that "tenpo" has a syllable-final n (ten-), and "soweli" has three open CV syllables.',
      },
      {
        subtitle: 'Stress',
        content:
          'Stress always falls on the first syllable of every word, without exception. This creates a consistent, predictable rhythm — once you know the rule, you never need to memorize stress patterns individually. In "toki," stress falls on "TO-ki." In "soweli," stress falls on "SO-we-li." In "tenpo," stress falls on "TEN-po." In "kepeken," stress falls on "KE-pe-ken." Compare this with English, where stress placement is unpredictable and must be memorized for each word (e.g., "reCORD" vs. "RECord").',
      },
      {
        subtitle: 'Allophony — Flexible Pronunciation',
        content:
          'Because the phoneme inventory is so small, Toki Pona allows wide allophonic variation — different physical sounds that all count as the same phoneme. The voiceless stops /p t k/ can be pronounced as their voiced counterparts /b d g/. /s/ can be realized as /z/ or /ʃ/ (like "sh"). /l/ can be pronounced as a tap /ɾ/ (like the Spanish "r" in "pero"). In practice: a Spanish speaker saying "luka" like "ɾuka," a Japanese speaker saying "pona" like "bona," and an English speaker saying it normally are all equally correct. The design goal is accessibility, not phonetic uniformity.',
      },
      {
        subtitle: 'Final Nasal and Forbidden Elements',
        content:
          'The syllable-final n can be pronounced as any nasal — /n/, /m/, or /ŋ/ (as in "sing") — and typically assimilates to match the following consonant. So "tenpo" is naturally pronounced more like "tempo" by many speakers, and "kin pi" might sound like "kim pi." Three things are strictly forbidden: (1) Diphthongs — two vowels cannot occur in the same syllable, so "ae" must be two syllables. (2) Consonant clusters — two consonants cannot sit together without a vowel between them (the only exception is a syllable-final n followed by a consonant). (3) Tones — there are no tonal distinctions whatsoever.',
      },
      {
        subtitle: 'Forbidden Sound Combinations',
        content:
          'Certain consonant-vowel combinations are also banned to avoid cross-linguistic awkwardness or confusion: "ji," "ti," "wo," and "wu" do not occur in Toki Pona words. Additionally, "nm" and "nn" sequences do not occur. This is why you will never see a Toki Pona word spelled starting with "ti-" (it would be "si-" instead) or "wo-" (it would be "o-"). These constraints make the phonology feel smooth and internally consistent. When adapting foreign names, these forbidden combinations must be replaced.',
      },
      {
        subtitle: 'Adapting Proper Nouns (Phonological Borrowing)',
        content:
          'When borrowing names from other languages — for people, places, and languages — Toki Pona adapts them to fit its phonology. The adapted name is then treated as an unofficial word and always capitalized. Examples: "Japan" → Nijon (the "p" and "j" are reassigned, syllables restructured); "America" → Mewika (r→w, syllables broken into CV form); "English" → Inli (clusters reduced); "France" → Kanse; "Lisa" → Lisa (already fits). The rule of thumb: break the foreign name into (C)V(N) syllables, replace any illegal sounds with the nearest Toki Pona equivalent, and capitalize the result.',
      },
      {
        subtitle: 'Orthography — How Toki Pona Is Written',
        content:
          'Standard Toki Pona is written in the Latin alphabet, entirely in lowercase. Capitalization is reserved exclusively for proper nouns and borrowed names (unofficial words). A sentence like "mi toki e toki pona" (I speak Toki Pona) keeps "toki pona" lowercase when used as a generic description but would capitalize it as "Toki Pona" when naming the language as a proper entity. Sentences end with a period. Questions can end with a question mark for clarity, though the grammar already signals questions unambiguously. Exclamation marks are used for commands and exclamations.',
      },
    ],
    relatedNodeIds: [
      'phi_sim', 'vowels', 'consonants', 'syllables', 'stress',
      'allophony', 'name_adapt', 'orthography', 'forbidden_combos',
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 2: THE CORE SENTENCE
  // ─────────────────────────────────────────────
  {
    id: 'ch2-li-e',
    title: 'Chapter 2: The Core Sentence — Subjects, Predicates, and Objects',
    sections: [
      {
        subtitle: 'The SVO Framework and the Absence of Tense',
        content:
          'Toki Pona follows a strict Subject–Verb–Object (SVO) word order that never changes. There is no grammatical tense — no verb conjugation to mark past, present, or future. Instead, time is indicated through context words (like "tenpo pini" for past or "tenpo kama" for future) placed at the start of a sentence. So "mi moku" can mean "I eat," "I am eating," "I ate," or "I will eat" depending entirely on context. This simplicity keeps the grammar lean while trusting real-world communicative context to fill in the details.',
      },
      {
        subtitle: 'The li Particle — Separating Subject from Predicate',
        content:
          'The particle "li" sits between the subject and the predicate. It is a purely structural signal with no semantic meaning of its own. The predicate can be a verb, an adjective, or a noun phrase. Examples: | soweli li moku. | The animal eats. | (verb predicate) | | telo li pona. | Water is good. | (adjective predicate) | | kili li moku. | Fruit is food. | (noun predicate) | | ona li jan pona mi. | They are my friend. | (noun phrase predicate) | In every case, "li" simply announces: "the predicate starts here."',
      },
      {
        subtitle: 'The e Particle — Marking the Direct Object',
        content:
          '"e" introduces the direct object — the thing being acted upon. It appears after the verb and before the object noun phrase. Without "e," a second content word after the verb is read as a modifier of the verb, not as a separate object. Contrast: "ona li moku kili" (They eat fruitily / in a fruity way) versus "ona li moku e kili" (They eat fruit). The "e" is what makes "kili" a distinct object rather than a description of how eating happens. Multiple objects are handled by repeating "e": "mi lukin e soweli e waso" (I see an animal and a bird).',
      },
      {
        subtitle: 'Building Full Sentences — Step by Step',
        content:
          'To construct a full Toki Pona sentence: (1) State the subject. (2) Add "li" (unless the subject is bare "mi" or "sina"). (3) State the predicate. (4) Add "e" + the object if the verb is transitive. Examples: | jan li pali e tomo. | A person builds a house. | | soweli lili li moku e kili loje. | The small animal eats the red fruit. | | mi wile e tomo suli. | I want a big house. | (li omitted after bare mi) | | ona li pana e lipu tawa jan. | They give the document to the person. |',
      },
      {
        subtitle: 'The mi / sina Exception — Omitting li',
        content:
          'There is one absolute exception to the "li" rule: when the subject is the bare, unmodified pronoun "mi" (I/we) or "sina" (you), the particle "li" is dropped entirely. | mi moku. | I eat. | ✓ | | sina pona. | You are good. | ✓ | | mi toki. | I speak. | ✓ | | sina lon tomo. | You are in the house. | ✓ | The moment you add anything to "mi" or "sina," "li" must return: | mi mute li moku. | We (many of us) eat. | ✓ modified subject | | mi en sina li tawa. | You and I go. | ✓ joined subjects | | mi jan pona li tawa. | I, a friend, go. | ✓ mi with noun modifier |',
      },
      {
        subtitle: 'Multiple Predicates — Stacking li',
        content:
          'A single subject can have multiple predicates by repeating "li" for each one. This is how you express "X does A and B." | soweli li moku li lape. | The animal eats and sleeps. | | jan li toki li pali e tomo. | The person talks and builds a house. | | mi wile lape li wile moku. | I want to sleep and want to eat. | (li is restored even after mi when there are two predicates) | IMPORTANT: Do not use "en" to join predicates. "en" is for subjects only. "jan li toki en pali" is wrong.',
      },
      {
        subtitle: 'Multiple Objects — Stacking e',
        content:
          'Multiple objects are expressed by repeating "e" before each one: | mi moku e kili e pan. | I eat fruit and bread. | | ona li lukin e soweli e waso e pipi. | They watch an animal, a bird, and a bug. | | mi wile e moku e telo e lape. | I want food, water, and sleep. | Every "e" clearly marks the start of a new object. This keeps the structure transparent regardless of how many objects there are.',
      },
      {
        subtitle: 'Joining Subjects — The en Particle',
        content:
          '"en" joins two or more subjects together ("and" for subjects only). When "en" is used, "li" must appear even if one subject is "mi" or "sina," because the combined subject is no longer a bare "mi" or "sina." | mi en sina li tawa. | You and I go. | | jan en soweli li lon tomo. | The person and the animal are in the house. | | mi en ona li pali e ni. | They and I make this. | Reminder: "en" ONLY joins subjects. Never use "en" to join predicates or objects.',
      },
      {
        subtitle: 'li Is Not "To Be" — A Critical Warning',
        content:
          'The most common beginner mistake is treating "li" as a translation of the English verb "to be." It is not. "li" is a purely grammatical separator with no semantic content. The sentence "telo li pona" does not mean "Water [is] good" with "li" acting as "is" — it means "Water [predicate-marker] good," and we interpret it as "Water is good" only because the context calls for it. A predicate noun works the same way: "jan ni li mama mi" (This person [predicate-marker] my parent) — no "is" verb is needed or present. Think of "li" as a colon: "Water: good." The colon contributes nothing except separation.',
      },
    ],
    relatedNodeIds: [
      'svo_intro', 'li_rule', 'e_rule', 'mi_sina_exception',
      'en_particle', 'tense_context', 'multiple_li', 'multiple_e',
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 3: MODIFIERS
  // ─────────────────────────────────────────────
  {
    id: 'ch3-modifiers',
    title: 'Chapter 3: The Flexible Word — Vocabulary and Modification',
    sections: [
      {
        subtitle: 'Polysemy — One Word, Many Roles',
        content:
          'In Toki Pona, content words are not locked into a single grammatical category. The same word can be a noun, verb, or adjective depending solely on where it appears in the sentence. The word "pona," for example, means "good/positive" as an adjective, "goodness" as a noun, and "to fix/to improve" as a verb. There is no separate form for each role — grammatical position tells you everything. This is called polysemy: each word covers a wide semantic range, and context narrows it down. It is the most important concept to internalize as a Toki Pona learner.',
      },
      {
        subtitle: 'The Three Roles of a Content Word — moku as Example',
        content:
          'Consider the word "moku" (food / to eat / edible): | Position | Grammatical Role | Example | Translation | | Head of subject or object | Noun | moku li pona. | Food is good. | | Head of predicate (after li) | Verb | ona li moku. | They eat. | | Modifier after another head | Adjective | ijo moku | an edible thing | The same pattern applies to almost every content word. "Tomo" as a noun is "house/room." After "li," "tomo" becomes "to shelter/to house." After another noun, "tomo" becomes "indoor/domestic": "soweli tomo" (domestic animal → pet).',
      },
      {
        subtitle: 'The Head-Initial Rule',
        content:
          'All Toki Pona phrases are head-initial: the most important word — the "head" — comes first. Every word after it narrows or describes the head. Think of it as a camera starting wide and zooming in: "jan" (person) → "jan lili" (small person → child) → "jan lili sona" (knowledgeable child → child prodigy). The head is never moved from the front. This contrasts with languages like Japanese or Turkish, where modifiers come before the noun. In Toki Pona: head first, details after.',
      },
      {
        subtitle: 'Single-Modifier Phrases — Core Vocabulary in Action',
        content:
          'Here are common single-modifier phrases to internalize the head-first pattern. Study both the literal and natural readings: | Toki Pona | Literal Gloss | Natural Reading | | jan pona | good person | friend | | tomo telo | water building | bathroom / shower | | ilo moku | eating tool | spoon / fork / chopsticks | | lipu sona | knowledge document | book / textbook | | ma telo | water land | swamp / marsh / lake-shore | | kalama musi | fun sound | music | | tenpo pini | past time | yesterday / the past | | tenpo kama | coming time | tomorrow / the future | | jan ike | bad person | enemy / villain | | tomo lape | sleep building | bedroom |',
      },
      {
        subtitle: 'Multiple Modifiers — Flat, Parallel Stacking',
        content:
          'When you add more than one modifier after a head, each modifier applies directly and independently to the head — not to the modifier before it. This is flat (parallel) stacking. Example: "tomo lili pona" = a house that is (small) AND (good) — a nice little house. It does NOT mean a "good-small" kind of house, or that goodness is a property of smallness. All modifiers relate directly to the head. | tomo lili pona | small AND good house | a nice little house | | jan suli walo | big AND pale person | a tall, pale person | | kili loje suwi | red AND sweet fruit | a sweet red fruit | | soweli lili wawa | small AND strong animal | a small but powerful animal |',
      },
      {
        subtitle: 'Using Pronouns as Possessive Modifiers',
        content:
          'Pronouns (mi, sina, ona) function as modifiers and express possession when they follow a noun. There is no separate possessive form ("my," "your," "his/her/its") — the pronoun simply follows the head as a regular modifier: | tomo mi | house [of] me | my house | | lipu sina | document [of] you | your book | | soweli ona | animal [of] them | their pet | | ijo mi | thing [of] me | my stuff / my matter | You can also chain further modifiers after the pronoun: "tomo mi lili" (my small house) — all three words modify "tomo" in parallel.',
      },
      {
        subtitle: 'Expressing Abstract Concepts Through Modification',
        content:
          'Because the vocabulary is small, abstract concepts are expressed through creative modifier combinations. Some community-recognized examples: | Toki Pona | Literal Gloss | Concept | | pilin pona | good feeling | happiness / contentment | | pilin ike | bad feeling | sadness / distress | | sona pona | good knowledge | wisdom | | nasin pona | good way | virtue / ethics | | tenpo mute | many times | often / frequently | | jan pi sona mute | person of much knowledge | expert / scholar | | ijo ike | bad thing | problem / harm | These are not fixed dictionary entries — they are examples of how fluent speakers think. You are free to create your own combinations; context carries the specificity.',
      },
      {
        subtitle: 'Modifier Order and Emphasis',
        content:
          'While all modifiers are grammatically parallel, placement can shift nuance. The first modifier after the head tends to feel like the most salient descriptor. Compare: "jan lili suli" — a small person who is also important (lili is the primary descriptor); "jan suli lili" — an important person who is also small (suli is primary). This is a stylistic tool, not a hard grammatical rule. Use it consciously to guide your listener\'s attention to the quality you want to foreground.',
      },
    ],
    relatedNodeIds: [
      'head_initial', 'simple_mods', 'multiple_mods',
      'polysemy', 'syntactic_role', 'pronoun_possession',
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 4: pi
  // ─────────────────────────────────────────────
  {
    id: 'ch4-pi',
    title: 'Chapter 4: Grouping Ideas — The pi Particle',
    sections: [
      {
        subtitle: 'The Problem pi Solves',
        content:
          'As we saw in Chapter 3, multiple modifiers all apply in parallel to the head word. But what if you need a modifier to itself be modified? For example, suppose you want to say "a very strong person" — not just "a strong person" (jan wawa) but someone defined by the quality of being especially or intensely strong. Without a grouping tool, "jan wawa mute" would mean "many strong people," because "mute" (many) modifies "jan" in parallel with "wawa." The particle "pi" solves this problem by creating a sub-group of modifiers.',
      },
      {
        subtitle: 'How pi Works — Regrouping Modifiers',
        content:
          '"pi" takes everything that follows it (up to the next "pi," "li," "e," or "la") and treats it as a single, unified modifier phrase. That whole phrase then applies as one block to the head. Formula: HEAD pi [MODIFIER GROUP]. The key insight: without "pi," modifiers stack in parallel onto the head; with "pi," the modifiers after "pi" first combine with each other, then the result applies to the head. | jan wawa mute | many strong people | wawa and mute both modify jan equally | | jan pi wawa mute | a very strong person | wawa mute is first grouped (= "great strength"), then modifies jan |',
      },
      {
        subtitle: 'The Two-Word Rule',
        content:
          '"pi" must always be followed by at least two words. A single-word "pi" group is ungrammatical and redundant. | ✗ toki pi pona | WRONG — pi before only one word | | ✓ toki pona | CORRECT — pona directly modifies toki | | ✗ jan pi sona | WRONG | | ✓ jan sona | CORRECT | | ✓ jan pi sona mute | CORRECT — pi followed by two words | The reasoning: "pi" only earns its place when two or more words need to first combine before modifying the head. If you only have one modifier, place it directly after the head — no "pi" needed.',
      },
      {
        subtitle: 'pi and Possession — When to Use It',
        content:
          'Simple possession (one-word owner) does NOT use "pi" — use a pronoun or a simple modifier directly: | tomo mi | my house | ✓ no pi needed | | tomo sina | your house | ✓ no pi needed | "pi" is used for possession only when the owner is described by a multi-word phrase: | tomo pi jan Awi | the house of person Awi | ✓ "jan Awi" is two words | | lipu pi mama mije mi | the book of my father | ✓ "mama mije mi" is three words | | tomo pi jan pona mi | my friend\'s house | ✓ "jan pona mi" is three words | Rule of thumb: if the owner\'s description needs more than one word, use "pi."',
      },
      {
        subtitle: 'Contrasting Examples — With and Without pi',
        content:
          'Study these side-by-side comparisons carefully to feel the difference pi makes: | Phrase | Reading | Meaning | | jan wawa mute | jan + wawa + mute (parallel) | many strong people | | jan pi wawa mute | jan + [wawa mute] (grouped) | a very strong person | | jan wawa ala | jan + wawa + ala (parallel) | no strong people | | jan pi wawa ala | jan + [wawa ala] (grouped) | a weak person | | tomo telo nasa | tomo + telo + nasa (parallel) | a weird, watery building | | tomo pi telo nasa | tomo + [telo nasa] (grouped) | a house of strange liquid (= a bar/pub) | | lipu sona lili | lipu + sona + lili (parallel) | a small, knowledge-related document | | lipu pi sona lili | lipu + [sona lili] (grouped) | a document of limited knowledge (= a beginner\'s guide) |',
      },
      {
        subtitle: 'Multiple pi Phrases — Use with Caution',
        content:
          'It is grammatically possible to chain multiple "pi" phrases, but it creates comprehension difficulty quickly and is strongly discouraged by the community. | jan pi pali wawa pi nasin pona | a person of strong work of good method | While parseable, this is considered clumsy. The recommended approach is to split the idea across two simpler sentences: "jan li pali wawa. nasin ona li pona." (The person works hard. Their method is good.) The rule of thumb: if you feel tempted to use a second "pi" in the same noun phrase, rephrase.',
      },
      {
        subtitle: 'Community-Established pi Phrases',
        content:
          'Here are well-established uses of "pi" that appear regularly in community writing and conversation: | Toki Pona | Literal Gloss | Common Reading | | jan pi sona mute | person of much knowledge | expert / scholar | | jan pi pali kasi | person of plant work | gardener | | jan pi ma ante | person of another land | foreigner / immigrant | | tomo pi telo nasa | house of strange liquid | bar / pub | | nasin pi toki pona | way of Toki Pona | the Toki Pona lifestyle / philosophy | | jan pi olin mute | person of great love | a loving person | | lipu pi toki ante | document of another language | a translation |',
      },
    ],
    relatedNodeIds: [
      'pi_intro', 'pi_grouping', 'pi_2word',
      'pi_possession', 'pi_errors', 'pi_chaining',
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 5: NEGATION & QUESTIONS
  // ─────────────────────────────────────────────
  {
    id: 'ch5-questions',
    title: 'Chapter 5: Negation and Questions — ala, seme, and anu seme',
    sections: [
      {
        subtitle: 'Negation with ala — The Universal Negator',
        content:
          '"ala" means "no / not / nothing / zero." As a negator, it is placed directly after the word or phrase it negates. It does not move around — wherever you place it, that is what gets negated. | mi lape. | I sleep. | | mi lape ala. | I do not sleep. | (verb negated) | | jan ala li toki. | Nobody speaks. | (subject negated) | | mi jo e mani ala. | I have no money. | (object negated) | | tomo pona ala | not a good house | a bad / unsuitable house | (adjective negated) | The most common placement is after the verb or after the entire predicate phrase.',
      },
      {
        subtitle: 'Negating Adjectives, Nouns, and More',
        content:
          '"ala" can negate adjectives and nouns too, not just verbs, allowing fine-grained control over exactly what is being denied: | tomo suli ala | not a big house | a small / unsuitable house | | tenpo ala | no time | never / no occasion | | ijo ala | no thing | nothing | | jan sona ala | a non-knowledgeable person | an ignorant person | | mi tawa ala. | I do not go. | (verb negated) | | mi tawa nasin ala. | I go on no path. | (object modifier negated) | Experiment with where you place "ala" to express precisely what aspect you want to deny.',
      },
      {
        subtitle: 'Yes/No Questions — The A-not-A Structure',
        content:
          'Toki Pona forms polar (yes/no) questions with the "VERB ala VERB" structure. You present the verb and its negation side by side, asking the listener to pick one. Structure: Subject (li) VERB ala VERB (e Object)? | sina moku ala moku? | Do you eat? | | soweli li lape ala lape? | Is the animal sleeping? | | ona li pona ala pona? | Is she/he/it okay? | | sina ken ala ken toki e toki pona? | Can you speak Toki Pona? | To answer, repeat just the verb for "yes" or the verb followed by "ala" for "no": | moku. | Yes, I eat. | | moku ala. | No, I don\'t eat. | | ken. | Yes, I can. | | ken ala. | No, I can\'t. |',
      },
      {
        subtitle: 'The anu seme Tag Question',
        content:
          '"anu seme" literally means "or what?" Appended to any statement, it turns it into a casual yes/no question — equivalent to English tag questions ("...right?" / "...isn\'t it?"). | sina wile tawa anu seme? | Do you want to go? | | toki pona li pona anu seme? | Is Toki Pona good, right? | | ona li jan pona sina anu seme? | Is he/she your friend? | | moku li lon anu seme? | Is there food? | "anu seme" is less formal than the A-not-A structure and is common in casual conversation. It is especially useful when the verb phrase is long — repeating it for an A-not-A question would be cumbersome.',
      },
      {
        subtitle: 'Wh- Questions — The seme Pronoun',
        content:
          '"seme" is the interrogative placeholder — it stands in for the unknown piece of information, placed exactly where that information would go in a normal statement. Ask yourself: "What slot am I asking about?" Then put "seme" in that slot. | sina pali e seme? | What are you making? | (object slot) | | jan seme li toki? | Who is talking? | (subject slot) | | tomo seme li lon? | Which house is there? | (modifier slot) | | sina lon seme? | Where are you? | (location slot) | | sina tawa tan seme? | Why are you going? | (cause slot: tan seme = "from what" = why) | | tenpo seme la sina lape? | When do you sleep? | (time context slot) |',
      },
      {
        subtitle: 'Answering seme Questions',
        content:
          'To answer a "seme" question, simply replace "seme" with the actual information in the same grammatical position: | Q: sina pali e seme? | What are you making? | | A: mi pali e tomo. | I am making a house. | | Q: jan seme li toki? | Who is talking? | | A: jan Tomi li toki. | Tomi is talking. | | Q: sina lon seme? | Where are you? | | A: mi lon tomo mi. | I am in my house. | | Q: sina tawa tan seme? | Why are you going? | | A: mi tawa tan wile mi. | I am going because of my desire. | The parallel structure between question and answer makes Toki Pona question-and-answer exchanges very transparent.',
      },
      {
        subtitle: 'Distinguishing the Three Question Types',
        content:
          'Choose the right question type based on what you want to know: | Goal | Structure to Use | Example | | Formal yes/no confirmation | A-not-A (VERB ala VERB) | "sina lape ala lape?" | | Casual yes/no | anu seme tag | "sina lape anu seme?" | | Specific information | seme placeholder | "sina lape tan seme?" (Why do you sleep?) | A common learner mistake is using "seme" for yes/no questions. Remember: "seme" always asks for a specific piece of missing information — who, what, where, when, why, which — never just yes or no.',
      },
    ],
    relatedNodeIds: [
      'ala_negation', 'yes_no_quest', 'seme_quest',
      'anu_seme', 'negating_adjectives', 'answering_questions',
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 6: PREVERBS & PREPOSITIONS
  // ─────────────────────────────────────────────
  {
    id: 'ch6-prepositions',
    title: 'Chapter 6: Adding Nuance — Preverbs and Prepositions',
    sections: [
      {
        subtitle: 'What Is a Preverb?',
        content:
          'A preverb is a special word that sits immediately before the main verb (or immediately after "li") and modifies the entire action. Preverbs function like English modal or auxiliary verbs — "can," "want to," "try to," "keep doing," "begin to." Sentence structure: Subject (li) PREVERB main-verb (e object). The preverb and main verb together form a single predicate. Never insert "li" or "e" between a preverb and its main verb. The five core preverbs are wile, ken, kama, awen, and alasa.',
      },
      {
        subtitle: 'wile — Want / Need / Should',
        content:
          '"wile" as a preverb expresses desire, need, or obligation. It is the most common preverb. | soweli li wile moku. | The animal wants to eat. | | mi wile lape. | I need/want to sleep. | | sina wile ala wile tawa? | Do you want to go? | (A-not-A question with preverb) | | jan ali li wile pona. | Everyone wants to be well. | "wile" can also be a standalone verb meaning "to want [something]": "mi wile e moku" (I want food — the object is a thing, not an action). As a preverb ("mi wile moku"), the object of the wanting is the action itself.',
      },
      {
        subtitle: 'ken — Can / May / Is Possible',
        content:
          '"ken" as a preverb means ability or permission. | mi ken sitelen e waso. | I can draw a bird. | | ona li ken ala toki e toki pona. | They cannot speak Toki Pona. | | sina ken lape lon tomo ni. | You may sleep in this house. | | jan ni li ken pali e ijo mute. | This person can do many things. | As a standalone predicate, "ken" means "to be possible": "ni li ken" (this is possible). A-not-A question form: "sina ken ala ken pali e ni?" (Are you able to do this?)',
      },
      {
        subtitle: 'kama — Become / Come to / Begin to',
        content:
          '"kama" as a preverb expresses becoming, arriving at a state, or the onset of an action. | mi kama sona e toki pona. | I am learning Toki Pona. (lit. I come to know it) | | ona li kama pilin pona. | They began to feel good. | | mi kama jo e tomo. | I came to own a house. / I acquired a house. | | sina kama lon ni. | You arrive here. | As a standalone verb, "kama" means "to come / to arrive / to happen": "jan li kama" (the person arrives). The preverb sense focuses on "becoming" or "beginning."',
      },
      {
        subtitle: 'awen — Continue / Keep / Stay',
        content:
          '"awen" as a preverb expresses continuation of an action or state — that something keeps going rather than stopping. | ona li awen lape. | They continue to sleep. / They are still sleeping. | | mi awen toki. | I keep talking. | | o awen pali! | Keep working! | | ona li awen wile tawa. | They still want to go. | As a standalone verb/adjective, "awen" means "to remain / to stay / to be safe / to wait": "o awen" (wait / stay). Distinguish: "mi awen" (I stay) vs. "mi awen moku" (I keep eating).',
      },
      {
        subtitle: 'alasa — Try To / Seek To',
        content:
          '"alasa" as a preverb means to attempt or actively pursue an action. | mi alasa sona e nimi ni. | I try to understand this word. | | ona li alasa kama jo e mani. | They seek to obtain money. | | mi alasa ala pana e ike. | I try not to cause harm. | | mi alasa toki pona. | I try to speak well. | "alasa" has largely replaced the older preverb "lukin" (to try to) in modern usage, though "lukin" remains understood. As a standalone verb, "alasa" means "to hunt / to search / to gather."',
      },
      {
        subtitle: 'Additional Preverbs — sona, open, pini',
        content:
          'Several other words can function as preverbs: | sona | to know how to | mi sona sitelen. (I know how to write.) | | open | to begin to | ona li open toki. (They begin to speak.) | | pini | to finish / stop | mi pini moku. (I finish eating.) | "open" often overlaps with the "begin to" sense of "kama." Many speakers use "kama" more for "become" and "open" for "begin." "pini" as a preverb is less common but understood. These are accepted by the community but are less universal than the five core preverbs above.',
      },
      {
        subtitle: 'Core Prepositions — Overview and Position',
        content:
          'Prepositions in Toki Pona form a small, closed class with fixed grammatical roles. Unlike content words (which shift based on position), prepositions always introduce prepositional phrases. They appear at the end of a clause, after the object (if any), and do not take "e" — they introduce their object directly. The five core prepositions are: lon (at/in/on/exists), tawa (to/for/toward), tan (from/because of), kepeken (using/with), sama (like/as). Prepositions cannot be reordered arbitrarily; they follow the main predicate.',
      },
      {
        subtitle: 'lon — Location, Time, and Existence',
        content:
          '"lon" expresses physical location, a point in time, or existence itself. | mi lon tomo. | I am in the house. | | soweli li lape lon ma kasi. | The animal sleeps in the forest. | | mi moku lon tenpo suno. | I eat in the daytime. | | ni li lon. | This exists. / This is true. | | ni li lon ala. | This does not exist. / This is false. | As a standalone predicate, "lon" affirms existence or truth. "ona li lon tomo" (They are in the house) uses "lon" as both preposition and existence-marker. "tomo lon" as a modifier means "existing house" or "real building."',
      },
      {
        subtitle: 'tawa — Movement, Direction, and Perspective',
        content:
          '"tawa" expresses movement toward, benefit for, or the perspective from which something is judged. | mi tawa tomo mi. | I go to my house. | | ona li pana e kili tawa mi. | They give fruit to me. | | ni li pona tawa mi. | This is good to me. / I like this. | | ni li ike tawa ona. | This is bad to them. / They dislike this. | The phrase "pona tawa mi" (good to me) is the standard way to express "I like it." Conversely, "ike tawa mi" means "I dislike it." As a standalone adjective: "tomo tawa" (moving structure → vehicle / car).',
      },
      {
        subtitle: 'tan — Origin and Cause',
        content:
          '"tan" expresses where something comes from (source) or why something happens (cause). | mi kama tan ma Mewika. | I come from America. | | mi pilin ike tan ni. | I feel bad because of this. | | mi kama tan lape ala. | I became this way because of lack of sleep. | | tan seme? | Why? (lit. "from what?") | "tan seme?" is the standard way to ask "why?" It is simply "tan" + the question placeholder "seme" placed in the causal slot. Answer with "tan": "mi tawa tan wile mi" (I go because of my desire).',
      },
      {
        subtitle: 'kepeken — Using / By Means Of',
        content:
          '"kepeken" expresses the instrument or method used to perform an action. | mi sitelen kepeken ilo sitelen. | I write using a pen. | | ona li toki kepeken toki Inli. | They speak in English. (lit. using the English language) | | mi moku kepeken luka mi. | I eat with my hands. | | sina ken tawa kepeken tomo tawa. | You can go by car. | Note: "kepeken" is followed directly by its noun — no "e" appears between "kepeken" and its object. "kepeken" introduces its noun the same structural way "e" introduces direct objects.',
      },
      {
        subtitle: 'sama — Similarity and Comparison',
        content:
          '"sama" expresses similarity, equality, or comparison between things. | ona li toki sama waso. | They talk like a bird. | | mi en sina li sama. | You and I are the same / equal. | | jan ni li pali sama mama ona. | This person works like their parent. | | pilin mi li sama pilin sina. | My feeling is the same as your feeling. | As a standalone adjective: "sama" means "same / similar": "jan sama" (sibling — lit. "same-type person"). As a noun: "sama li pona" (equality/sameness is good).',
      },
      {
        subtitle: 'Stacking Multiple Prepositions',
        content:
          'Multiple prepositional phrases can appear in one sentence, each adding a different layer of context. | mi tawa tomo sina kepeken tomo tawa. | I go to your house by car. | | ona li pana e moku tawa jan lili lon tomo. | They give food to the child in the house. | | mi toki tawa ona kepeken ilo toki sama jan ante. | I speak to them by phone like another person. | Order matters for clarity: put the most structurally important preposition first (usually the destination or recipient), then method, then location.',
      },
    ],
    relatedNodeIds: [
      'prep_lon', 'prep_tawa', 'prep_tan', 'prep_kepeken', 'prep_sama',
      'preverb_wile', 'preverb_ken', 'preverb_kama',
      'preverb_awen', 'preverb_alasa', 'preverb_sona',
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 7: CONTEXT WITH la
  // ─────────────────────────────────────────────
  {
    id: 'ch7-la',
    title: 'Chapter 7: Setting the Scene — Context with la',
    sections: [
      {
        subtitle: 'What la Does',
        content:
          '"la" is a context-setting particle. It separates a context phrase or clause (before "la") from the main sentence (after "la"). Everything before "la" sets the frame — time, condition, cause, or perspective — within which the main sentence is understood. Structure: [CONTEXT] la [MAIN SENTENCE]. "la" itself carries no semantic meaning; like "li," it is a pure structural separator. A good mental translation of the "la" construction: "Given X, Y" or "In the context of X, Y."',
      },
      {
        subtitle: 'Time Context with la',
        content:
          'The most common use of "la" is to set a time frame cleanly at the front of a sentence. | tenpo pini la mi lon ma Nijon. | In the past, I was in Japan. | | tenpo ni la mi sona e toki pona. | Right now, I know Toki Pona. | | tenpo kama la mi tawa ma mute. | In the future, I will travel to many lands. | | suno pini la mi moku e kili. | Yesterday, I ate fruit. | | suno kama la o kama tomo mi. | Tomorrow, come to my house. | The time-frame word appears before "la," and the main statement about what happens in that time follows after.',
      },
      {
        subtitle: 'Conditional Sentences — If / When',
        content:
          '"la" is also used to express "if/when X, then Y" conditionals. The condition goes before "la," the result after. There is no separate Toki Pona word for "if" — the "la" structure handles it entirely. | sewi li jelo la suno li lon. | If the sky is yellow, the sun is present. | | sina moku la sina pilin pona. | When you eat, you feel good. | | mi jo e mani mute la mi tawa ma ante. | If I have a lot of money, I will travel to another country. | | sina toki ala la mi sona ala. | If you don\'t speak, I won\'t know. | Context generally makes clear whether a "la" clause is a time-frame or a condition.',
      },
      {
        subtitle: 'Perspective and Cause with la',
        content:
          '"la" can set a perspective ("as for X" / "in X\'s view") or a causal frame ("because of X"). | mi la ni li pona. | As for me / In my view, this is good. | | ona la ijo ni li ike. | For them, this thing is bad. | | sina la seme li pona? | For you, what is good? | | jan sona la toki pona li pona. | In the view of a wise person, Toki Pona is good. | The distinction between condition and cause is usually clear from context, though Toki Pona does not grammatically distinguish them — both use "la."',
      },
      {
        subtitle: 'Sentence la Sentence — Using a Full Clause as Context',
        content:
          'The context before "la" can be a full Toki Pona sentence rather than just a word or phrase. This is the most expressive use of "la" — entire scenarios become the frame for a resulting state or action. | sina toki e nimi ike la mi pilin ike. | If you say bad words, I feel bad. | | mi pana e moku tawa ona la ona li pilin pona. | When I give them food, they feel good. | | jan li lukin e mi la mi kama lape. | When someone watches me, I fall asleep. | These constructions allow complex, multi-part ideas to be expressed elegantly within Toki Pona\'s minimalist grammar.',
      },
      {
        subtitle: 'la with o — Conditional Commands',
        content:
          '"la" works smoothly with imperative "o" sentences to create conditional commands or advice. | sina wile moku la o kama tomo mi. | If you want to eat, come to my house. | | tenpo ni la o awen! | For now, stay! | | ona li toki tawa sina la o kute pona. | When they talk to you, listen well. | | sina jo ala e mani la o pali mute. | If you have no money, work hard. | These are natural in storytelling, instructions, and advice-giving — the "la" phrase sets the situation, and the "o" command tells the listener what to do in that situation.',
      },
      {
        subtitle: 'High-Frequency la Phrases',
        content:
          'Certain "la" phrases appear so frequently in Toki Pona writing and speech that they are worth memorizing as near-fixed expressions: | tenpo ni la | right now, currently | | tenpo pini la | in the past, previously | | tenpo kama la | in the future | | ken la | maybe, possibly (lit. "in the realm of possibility") | | poka la | nearby, beside | | ni la | therefore, in this context | | jan ale la | for everyone | | nasin ante la | on the other hand, in another way | "ken la" is particularly useful as a softener or hedge: "ken la mi tawa suno kama" (Maybe I\'ll go tomorrow).',
      },
    ],
    relatedNodeIds: [
      'la_intro', 'la_conditions', 'la_time', 'la_perspective',
      'la_cause', 'la_sentence', 'la_o',
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 8: o AND taso
  // ─────────────────────────────────────────────
  {
    id: 'ch8-particles',
    title: 'Chapter 8: Commands and Contrast — o and taso',
    sections: [
      {
        subtitle: 'o for Vocatives — Directly Addressing Someone',
        content:
          '"o" after a name or title signals that you are addressing that person or entity directly. It is a vocative marker, equivalent to placing someone\'s name at the start of a sentence with a comma in English. | jan Mawi o, ... | Hey Maria, ... | | mama o, ... | Hey mom, ... | | jan ale o, ... | Everyone, ... | | jan sona o, ... | Hey, wise one, ... | The vocative "o" immediately follows the name or title. It is often followed by a statement or command directed at that person. In writing, a comma after the vocative "o" is common but not required.',
      },
      {
        subtitle: 'o for Imperatives — Giving Commands',
        content:
          '"o" replaces "li" in the predicate position to turn a sentence into a command or instruction. The subject (who you are commanding) is typically omitted when it is obvious from context. | o moku! | Eat! | | o tawa! | Go! | | o awen. | Please wait. | | o lukin e lipu. | Look at the document. | | o pana e ni tawa mi. | Give this to me. | | o toki ala! | Don\'t speak! | (negated command) | When the command is negated, "ala" follows the verb as usual: "o moku ala" (don\'t eat).',
      },
      {
        subtitle: 'Combining Vocative and Imperative',
        content:
          'When addressing someone by name AND giving them a command, the two "o" particles merge into one: name/title + o + verb. This is the standard combined form. | jan Mawi o toki. | Maria, speak. | ✓ one o | | mama o pana e moku. | Mom, give food. | ✓ one o | | jan pona o kama! | Friend, come! | ✓ one o | Do NOT say "jan Mawi o, o toki" — this double-o is redundant and sounds unnatural. The name and the command share the single "o."',
      },
      {
        subtitle: 'o for Wishes — "Let me" and "Let\'s"',
        content:
          '"o" with explicit subjects expresses wishes or first-person commands. With "mi," it means "let me" or "I should." With "mi mute," it means "let\'s." | mi o tawa. | Let me go. / I should go. | | mi o lape. | I should sleep. | | mi mute o tawa! | Let\'s go! | | mi mute o moku e kili. | Let\'s eat fruit! | | mi mute o awen lon ni. | Let\'s stay here. | This is how Toki Pona handles the English "let\'s" — using "o" with the explicit subject "mi mute" (we, all of us).',
      },
      {
        subtitle: 'o for Blessings and Standard Expressions',
        content:
          '"o" also appears in common expressions of goodwill, farewell, and greeting: | o pona! | Be well! / Have a good one! | | o kama pona! | Welcome! (lit. "Come well!") | | o tawa pona! | Goodbye! (lit. "Go well!") | | o lape pona! | Sleep well! | | o moku pona! | Enjoy your meal! (lit. "Eat well!") | | o awen pona! | Stay safe! (lit. "Stay well!") | These are the community-standard expressions and are among the first phrases worth memorizing, as they appear in virtually every conversation.',
      },
      {
        subtitle: 'taso as a Conjunction — "But / However"',
        content:
          '"taso" has two grammatically distinct uses. As a sentence-initial conjunction, "taso" means "but" or "however," contrasting the current sentence with the previous one. | mi wile tawa. taso mi jo ala e mani. | I want to go. But I have no money. | | ona li pona. taso ona li toki mute. | They are good. However, they talk a lot. | | mi ken pali. taso tenpo li weka. | I can work. But there is no time. | | mi wile lape. taso mi wile moku taso. | I want to sleep. But I only want to eat. | "taso" as a sentence-opener is very common in storytelling and argument.',
      },
      {
        subtitle: 'taso as a Modifier — "Only"',
        content:
          'When "taso" appears after a noun, verb, or phrase as a modifier (not sentence-initial), it means "only" or "solely." | mi moku taso. | I only eat. / I do nothing but eat. | | jan wan taso li lon. | Only one person is there. | | mi wile e ni taso. | I want only this. | | ona li toki taso, li pali ala. | They only talk and do not work. | | tenpo lili taso | just a little while | The position of "taso" determines its function: first word of a sentence = "but/however"; after the element it restricts = "only."',
      },
      {
        subtitle: 'Distinguishing the Two taso Uses',
        content:
          'Pay close attention to position — it is the only signal: | taso mi moku. | But I eat. | (sentence-initial → contrast / "but") | | mi moku taso. | I only eat. | (post-verb → restriction / "only") | | taso kili taso li lon. | But only fruit is present. | (both uses in one sentence — first "taso" is "but," second is "only") | | mi ken pali taso. | I can only work. | (post-preverb → restriction) | This double function is a good example of how Toki Pona derives two meanings from one word purely through positional grammar.',
      },
    ],
    relatedNodeIds: [
      'o_vocative', 'o_imperative', 'o_wish', 'o_blessing',
      'taso_particle', 'taso_only', 'taso_but',
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 9: COLORS AND NUMBERS
  // ─────────────────────────────────────────────
  {
    id: 'ch9-lexicon',
    title: 'Chapter 9: The Lexicon in Practice — Colors and Numbers',
    sections: [
      {
        subtitle: 'The Five-Color System',
        content:
          'Toki Pona uses five basic color words that map onto broad, perceptually universal categories. Rather than aiming for the granularity of most natural languages, these five cover the entire visible spectrum through combination: | pimeja | black / dark | dark shades, shadow, deep blue, very dark gray | | walo | white / light | pale, bright, off-white, light-colored | | loje | red / warm | red, pink, burgundy, crimson | | jelo | yellow / warm-bright | yellow, amber, golden, orange-yellow | | laso | blue / green | blue, green, teal, cyan, turquoise, indigo | Speakers do not memorize dozens of color names — they describe colors by combining these five and using modifiers.',
      },
      {
        subtitle: 'laso — The "Grue" Category',
        content:
          'The most surprising feature of the color system is "laso," which covers both blue AND green. Linguists call this a "grue" category, and it appears in many natural languages (historical Welsh, historical Japanese, some African languages). In context, "laso" almost always resolves without ambiguity: "kasi li laso" (the plant is green) and "telo sewi li laso" (the sky-water / the sea is blue) are both perfectly clear. When ambiguity could arise, speakers specify with modifiers: "laso kasi" (plant-green → green) vs. "laso telo" (water-blue → blue).',
      },
      {
        subtitle: 'Mixing Colors — Expressing Specific Shades',
        content:
          'More specific shades are expressed by combining the basic five. The head color is followed by a secondary color as a modifier: | laso loje | reddish blue | purple | | jelo laso | yellowish green | lime green / chartreuse | | loje jelo | red-yellow | orange | | pimeja walo | dark-white / grayish | gray | | loje walo | reddish-white | pink / light red | For even greater precision, "pi" can group: "kule pi laso loje" (the color of reddish-blue → purple). A gray sky: "sewi pi pimeja walo" (sky of dark-white). A bronze color: "kule pi jelo pimeja" (dark yellow color).',
      },
      {
        subtitle: 'Using Colors in Sentences',
        content:
          'Colors are adjectives in Toki Pona and follow the head nouns they describe, per the head-initial rule: | kasi li laso. | The plant is green. | | suno li jelo. | The sun is yellow. | | telo sewi li laso. | The sea is blue. | | mi wile e len loje. | I want red clothing. | | tomo ona li walo. | Their house is white. | | loje li kule ike tawa mi. | Red is an unpleasant color to me. (I dislike red.) | | mi pana e len pi laso loje tawa ona. | I give them a purple piece of clothing. |',
      },
      {
        subtitle: 'The Simple Number System — wan, tu, mute',
        content:
          'The core number system consists of three words plus zero: | ala | 0 (zero / none) | | wan | 1 (one) | | tu | 2 (two) | | mute | 3 or more (many / a lot) | In everyday speech, this system is completely sufficient for most purposes. Numbers function as modifiers following the noun they quantify: | soweli wan | one animal | | jan tu | two people | | kili mute | many fruits | | ijo ala | no things / nothing | The philosophy: the existence, kind, and context of a thing matter more than its exact count.',
      },
      {
        subtitle: 'Numbers Combined with Other Modifiers',
        content:
          'Number words can be combined with other modifiers freely — they follow the same head-initial, parallel modifier rules: | jan lili tu | two children | | tomo suli wan | one big house | | lipu pona mute | many good books | | soweli wawa tu | two strong animals | Numbers can also modify predicates to express repetition, though this is less common: "mi tawa tu" (I went twice). Clarity is key — if the meaning is not obvious, rephrase or use a "la" time context instead.',
      },
      {
        subtitle: 'The Extended Number System',
        content:
          'When precision beyond "many" is needed, Toki Pona has an additive system using additional number-value words: | luka | 5 (lit. "hand" — five fingers) | | mute | 20 (in the extended system) | | ale / ali | 100 | Numbers are composed additively, largest first: | luka wan | 6 (5+1) | | luka tu | 7 (5+2) | | luka luka | 10 (5+5) | | luka luka tu | 12 (5+5+2) | | mute luka | 25 (20+5) | | ale mute luka luka wan | 136 (100+20+5+5+1) | This system is deliberately cumbersome for large numbers, reinforcing that exact large quantities are not a primary communicative goal.',
      },
      {
        subtitle: 'Ordinal Numbers with nanpa',
        content:
          'Ordinal numbers (first, second, third...) are expressed with "nanpa" (number/rank) followed by the cardinal number. "nanpa" functions as a modifier of the noun: | jan nanpa wan | first person | | tenpo nanpa tu | second time | | lipu nanpa mute | many-th document / a later document | Examples in sentences: | mi kama nanpa wan. | I arrived first. | | ona li pali e lipu nanpa tu. | They made the second document. | | mi tawa ma nanpa luka. | I am going to the fifth country. | "nanpa" + number is the consistent pattern — use it wherever you would say "first," "second," etc. in English.',
      },
    ],
    relatedNodeIds: [
      'colors_pimeja', 'colors_walo', 'colors_loje', 'colors_jelo', 'colors_laso',
      'numbers_simple', 'numbers_complex', 'luka_five', 'mute_twenty', 'ale_hundred',
      'nanpa_ordinal', 'color_mixing',
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 10: COMPOUNDING AND COMMUNITY
  // ─────────────────────────────────────────────
  {
    id: 'ch10-community',
    title: 'Chapter 10: Compounding, Context, and the Community',
    sections: [
      {
        subtitle: 'Compounding as the Primary Creative Tool',
        content:
          'With only 137 core words, Toki Pona relies on "compounding" — combining a head word with one or more modifiers — to express the full range of human experience. The process follows the same head-initial, modifier-stacking rules from Chapters 3 and 4. The result is not a fixed new word but a contextually meaningful phrase. Community-recognized examples: | jan pona | good person | friend | | telo nasa | strange liquid | alcohol / beer / wine | | tomo tawa | moving structure | vehicle / car | | ilo moku | eating tool | fork / spoon / chopsticks | | ma telo | water land | ocean / lake / swamp | | lipu toki | speaking document | letter / message | | jan lawa | leading person | boss / leader / president |',
      },
      {
        subtitle: 'The Lexicalization Debate',
        content:
          '"Lexicalization" is when a compound becomes so widely used and conventionalized that speakers treat it as a fixed, single-meaning word rather than a compositional phrase. The Toki Pona community actively resists this. The philosophy holds that meaning should emerge from context and speaker intention — not from a memorized dictionary of compound-words. For example, "tomo tawa" is conventionally understood as "car," but it could just as accurately describe a boat, a plane, a moving float, or even a person pacing in their room. Accepting the ambiguity and letting context decide is considered the authentic Toki Pona approach.',
      },
      {
        subtitle: 'Context Is Everything — Ambiguity as Feature',
        content:
          'The ambiguity of Toki Pona compounds is often cited as a weakness by critics, but fluent speakers see it as a strength. The compound "ko walo" (white substance) means "snow" in a weather conversation, "cocaine" in a crime drama, "flour" in a kitchen, "chalk" in a classroom, and "salt" at a dinner table. The word itself is not the meaning — the conversation is. This trains speakers to be extremely attentive to context and to communicate the situational frame of their message clearly, rather than relying on a word alone to carry specificity.',
      },
      {
        subtitle: 'Thinking in Toki Pona — Avoiding Translation Traps',
        content:
          'The community strongly favors "thinking in Toki Pona" over translating from a native language. Native-language thinking often creates clumsy, over-literal constructions. For example, an English speaker might try to render "I am going to the store to buy food" as a single complex sentence. A Toki Pona thinker splits it: "mi tawa esun. mi wile jo e moku." (I go to the market. I want to get food.) Two clean sentences communicate the same idea far more naturally. Splitting complex thoughts into multiple simple sentences is always preferred over long, convoluted chains.',
      },
      {
        subtitle: 'Stylistic Conventions — What Good Toki Pona Sounds Like',
        content:
          'Community style guides and discussions converge on several recurring preferences: (1) Avoid stacking more than one "pi" phrase per noun phrase. (2) Prefer multiple short sentences over one long sentence. (3) Avoid unnecessary repetition of words when pronouns suffice. (4) Let the listener use context — do not over-specify. (5) Use "la" clauses to set time and condition efficiently rather than embedding them in the main clause. These are not rigid rules but shared aesthetic standards that define fluent, natural Toki Pona.',
      },
      {
        subtitle: 'The Living Language — nimi sin (New Words)',
        content:
          'Even with a "complete" vocabulary, Toki Pona continues to evolve. The lipu ku dictionary process showed that community usage can canonize new words. Informal words not in lipu pu (called "nimi sin" or new words) circulate in the community. Examples: "epiku" (epic, cool — from English "epic"), "misikeke" (medicine / drug — possibly from French "médicament"), "lanpan" (to take, to seize — possibly coined for concepts without a clean Toki Pona equivalent). Whether to use these unofficial words is a personal stylistic choice — some speakers embrace them, others prefer to work strictly within the 137-word canon.',
      },
    ],
    relatedNodeIds: [
      'compounding', 'lexicalization', 'community_culture',
      'context_meaning', 'thinking_in_tp', 'nimi_sin',
    ],
  },

  // ─────────────────────────────────────────────
  // CHAPTER 11: WRITING SYSTEMS
  // ─────────────────────────────────────────────
  {
    id: 'ch11-writing',
    title: 'Chapter 11: Writing Toki Pona — sitelen pona and sitelen sitelen',
    sections: [
      {
        subtitle: 'The Latin Script — The Default',
        content:
          'The default writing system for Toki Pona is the Latin alphabet, written entirely in lowercase (except for proper nouns). This is the form used in most online communities, textbooks, and casual writing. Its advantages are universal recognizability and ease of digital input. Every word in this textbook uses the Latin script. Its disadvantage is that it is borrowed from the outside and does not visually reflect the philosophy of the language. The two native scripts below were created to address this.',
      },
      {
        subtitle: 'sitelen pona — The Simple Picture Script',
        content:
          '"sitelen pona" means "simple/good image." It is a logographic system: each core word has one unique grapheme (symbol). Many graphemes are pictographic — "telo" (water) looks like waves, "jan" (person) looks like a stick figure, "suno" (sun) looks like a sun with rays, "kasi" (plant) looks like a sprouting seedling, "moku" (food/eat) looks like a mouth or eating figure. Others are more abstract but consistently recognizable across the community. The script reads left to right, like the Latin alphabet.',
      },
      {
        subtitle: 'sitelen pona — Compound Symbols and Nesting',
        content:
          'One of sitelen pona\'s most distinctive features is how it handles modifier phrases: a modifier grapheme is written inside or above the head grapheme it modifies. This visually nests the relationship, making the head-initial structure immediately visible on the page. The official symbol for the language itself — "toki pona" — is written with the "pona" (good) grapheme nestled inside the "toki" (speech/language) grapheme. The visual result is a speech-bubble shape containing a simple positive symbol — profound simplicity in logo form.',
      },
      {
        subtitle: 'sitelen pona — Writing Proper Nouns with Cartouches',
        content:
          'Proper nouns (borrowed names) in sitelen pona are written using a "cartouche" — an oval or rectangular border enclosing a sequence of sitelen pona symbols used phonetically. Each symbol inside the cartouche represents the first sound of the Toki Pona word whose grapheme is being borrowed. For example, to write the name "Sonja," you would draw a cartouche and inside it place the graphemes for words beginning with s, o, n, j, a — each used for their initial sound only, not their meaning. This allows any foreign name to be transcribed without inventing new graphemes.',
      },
      {
        subtitle: 'sitelen sitelen — The Sacred Glyph Script',
        content:
          '"sitelen sitelen" was created by Jonathan Gabel and is a non-linear, decorative, and contemplative writing system. Unlike sitelen pona (which reads linearly left to right), sitelen sitelen is designed for two-dimensional arrangement — words and phrases are arranged around and inside each other in patterns inspired by Mayan hieroglyphic writing. It is explicitly NOT meant for quick everyday writing; it is an art form and a meditative practice. Assembling a sitelen sitelen text forces the writer to slow down and engage deeply with every word and its relationship to others.',
      },
      {
        subtitle: 'sitelen sitelen — Structure and Abugida',
        content:
          'Like sitelen pona, sitelen sitelen has a logographic component — each core word has its own glyph. But it also includes an abugida (a syllabic script) for writing syllables, which is essential for transcribing proper names and unofficial words. In this abugida, each consonant has a base shape, and vowels are indicated by modifications to that base — similar to Devanagari (Hindi) or Ethiopic scripts. This dual-system design makes sitelen sitelen capable of writing anything expressible in Toki Pona, not just the core vocabulary.',
      },
      {
        subtitle: 'Which Script Should You Learn?',
        content:
          'For beginners: focus entirely on the Latin script. It is all you need to participate fully in the Toki Pona community online and in written text. For intermediate learners seeking a richer connection to the language: sitelen pona is highly recommended. Its pictographic nature reinforces word meanings, and drawing it is genuinely enjoyable. The learning curve is gentle — most learners can read and write it within a week. For advanced learners interested in Toki Pona as an art form or contemplative practice: sitelen sitelen rewards deep study. It is difficult but uniquely beautiful, and the act of writing it is itself considered mindful engagement with the language.',
      },
    ],
    relatedNodeIds: [
      'sitelen_pona', 'sitelen_sitelen', 'logographic',
      'latin_script', 'jonathan_gabel', 'cartouche', 'abugida',
    ],
  },

  // ─────────────────────────────────────────────
  // APPENDIX
  // ─────────────────────────────────────────────
  {
    id: 'appendix-vocabulary',
    title: 'Appendix: Core Vocabulary Reference and Usage Notes',
    sections: [
      {
        subtitle: 'How to Read This Reference',
        content:
          'Each entry lists the word\'s primary grammatical role(s) and core meanings. Because Toki Pona words are grammatically fluid, "Part of Speech" indicates the most common role, not a rigid category. Almost all content words can serve as noun, verb, or adjective depending on sentence position. Reading guide: as a noun → head of subject/object phrase; as a verb → head of predicate after li; as an adjective → modifier after another head word; as a preverb → directly before a main verb. Particles and prepositions are the only true fixed-role words in the language.',
      },
      {
        subtitle: 'Structural Particles — The Grammar Skeleton',
        content:
          'These seven words carry grammatical function only. They have no standalone semantic meaning but create the architecture of every sentence: | li | predicate marker | separates subject from predicate | | e | object marker | introduces the direct object | | pi | regrouping particle | groups modifiers into one sub-phrase | | la | context marker | separates context frame from main sentence | | o | command / vocative marker | signals commands, wishes, or direct address | | en | subject conjunction | joins subjects only ("and" for subjects) | | anu | disjunction | or (presents alternatives) | Mastering these seven particles means mastering Toki Pona grammar.',
      },
      {
        subtitle: 'Pronouns',
        content:
          'Toki Pona has exactly three pronouns, all number-neutral (singular and plural): | mi | I / me / we / us | | sina | you (one person or many) | | ona | he / she / it / they | There is no gender distinction in any pronoun. "ona" covers all genders and all third-person referents — people, animals, and objects alike. Plurality is clarified by context or by adding "mute": "mi mute" (we, all of us), "ona mute" (they, all of them). To be fully explicit about gender (if desired), use modifiers: "jan mije" (male person), "jan meli" (female person), "jan tonsi" (non-binary person).',
      },
      {
        subtitle: 'Key Verbs — High-Frequency Action Words',
        content:
          'These content words appear most commonly as verbs in the predicate position: | pali | to work, make, create | | tawa | to go, move, travel | | kama | to come, arrive, become | | lape | to sleep, rest | | toki | to speak, say, communicate | | lukin | to see, look, watch | | kute | to hear, listen, obey | | jo | to have, own, contain | | pana | to give, send, put out | | moku | to eat, drink, consume | | alasa | to hunt, search, try | | utala | to fight, compete, struggle | | sitelen | to draw, write, depict | | sona | to know, understand | | wile | to want, need, wish |',
      },
      {
        subtitle: 'Key Nouns — High-Frequency Things and Concepts',
        content:
          'These content words appear most commonly as nouns: | jan | person, human, somebody | | soweli | land animal, mammal | | waso | bird, flying creature | | kala | fish, sea creature | | pipi | bug, insect | | kasi | plant, tree, leaf | | telo | water, liquid | | tomo | house, room, building | | ma | land, place, country | | suno | sun, light | | mun | moon, star | | kiwen | rock, stone, hard thing | | ko | powder, paste, clay | | kon | air, gas, spirit, essence | | sijelo | body, physical form | | linja | line, rope, hair | | palisa | stick, rod, branch |',
      },
      {
        subtitle: 'Key Adjectives — High-Frequency Descriptors',
        content:
          'These content words appear most commonly as modifiers in phrases: | pona | good, simple, positive | | ike | bad, harmful, complex | | suli | big, important, tall | | lili | small, little, young | | mute | many, much, a lot | | wan | one, united, unique | | tu | two | | wawa | strong, powerful, energetic | | nasa | strange, unusual, silly | | ante | different, other, changed | | sama | same, similar | | sin / namako | new, fresh, additional | | sewi | high, divine, sacred, above | | taso | only (when used as a modifier) |',
      },
      {
        subtitle: 'Prepositions — Quick Reference with Examples',
        content:
          'The five core prepositions (do not take "e" before their objects): | lon | at / in / on / exists | mi lon tomo. (I am in the house.) | | tawa | to / for / toward | mi tawa esun. (I go to the market.) | | tan | from / because of | mi kama tan ma Mewika. (I come from America.) | | kepeken | using / with | mi sitelen kepeken ilo. (I write with a tool.) | | sama | like / as / similar to | ona li toki sama waso. (They speak like a bird.) | Also: "pona tawa mi" = I like this. "ike tawa mi" = I dislike this. "tan seme?" = Why?',
      },
      {
        subtitle: 'Preverbs — Quick Reference with Examples',
        content:
          'The five core preverbs (sit between li/subject and main verb; no "e" between preverb and verb): | wile | want to / need to | mi wile moku. (I want to eat.) | | ken | can / be able to | mi ken tawa. (I can go.) | | kama | begin to / become | mi kama sona. (I begin to understand.) | | awen | continue to / keep | ona li awen lape. (They keep sleeping.) | | alasa | try to / seek to | mi alasa pona e ijo. (I try to improve things.) | Secondary preverbs: sona (know how to), open (begin to), pini (finish/stop). All preverbs can be negated with "ala" placed after them: "mi wile ala tawa" (I do not want to go).',
      },
      {
        subtitle: 'Common Sentence Patterns — A Cheat Sheet',
        content:
          'Here are the most important sentence patterns to memorize, covering the core grammar of the entire language: | A li B. | Statement | jan li toki. (Person speaks.) | | mi/sina B. | mi/sina statement | mi moku. (I eat.) | | A li B e C. | Transitive | ona li lukin e kili. (They see fruit.) | | A li B li C. | Multi-predicate | jan li toki li pali. (Person speaks and works.) | | B ala B? | Yes/No question | sina moku ala moku? (Do you eat?) | | seme li B? | Wh-subject question | jan seme li toki? (Who speaks?) | | A li B e seme? | Wh-object question | sina pali e seme? (What do you make?) | | [Context] la A li B. | Context + statement | tenpo pini la mi lape. (Earlier, I slept.) | | o B! | Command | o kama! (Come!) | | A li wile/ken/kama B. | Preverb | mi wile lape. (I want to sleep.) |',
      },
    ],
    relatedNodeIds: [
      'particles_all', 'pronouns', 'verb_words', 'noun_words',
      'adj_words', 'prep_reference', 'preverb_reference', 'sentence_patterns',
    ],
  },
];
