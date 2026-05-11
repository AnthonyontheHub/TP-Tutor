export interface Chapter {
  id: string;
  title: string;
  sections: { subtitle: string; content: string }[];
  relatedNodeIds: string[];
}

export const textbookContent: Chapter[] = [
  {
    id: 'intro-philosophy',
    title: 'Introduction: The Philosophy of Simplicity',
    sections: [
      {
        subtitle: 'Origins and Purpose',
        content: 'To learn Toki Pona is to engage with more than just a language; it is to participate in a philosophical and artistic project. This minimalist constructed language, created by Sonja Lang and first published online in 2001, is built upon a foundation of intentional simplicity. The language was engineered with several interconnected design goals. The primary objective is to express maximal meaning with minimal complexity. Drawing inspiration from pidgin languages, Toki Pona focuses on simple, near-universal concepts common across human cultures, stripping away the linguistic baggage that often complicates natural languages.'
      },
      {
        subtitle: 'Philosophical Foundations',
        content: 'This minimalism is not merely an aesthetic choice but a functional one, designed to help users concentrate on basic things and become more aware of the present moment. Inspired by Taoist philosophy and the Sapir-Whorf hypothesis—the idea that language shapes thought—Toki Pona actively seeks to promote positive thinking by limiting the tools for complex, negative rumination and focusing instead on the fundamental elements of experience.'
      },
      {
        subtitle: 'Evolution of the Vocabulary',
        content: 'The language began as a draft in 2001 with approximately 118 words. Over the next decade, this lexicon was refined, culminating in the 2014 publication of Toki Pona: The Language of Good (known to the community as lipu pu), which established a "completed form" of 120 core words. In 2021, Lang published the Toki Pona Dictionary (lipu ku), which expanded the canon to 137 "essential" words (nimi ku suli), canonizing several terms that had gained widespread community acceptance.'
      },
      {
        subtitle: 'Common Misconceptions',
        content: 'It is useful to clarify certain misconceptions. While Sonja Lang was reading works challenging Western stereotypes about hunter-gatherer societies around the time of creation, anarcho-primitivism was only one of many perspectives that informed the project and was deliberately excluded from lipu pu. It is also critical to avoid reducing other cultures to an "exotic" aesthetic. Toki Pona shares some coincidental structural similarities with the Apáitisí (Pirahã) language, such as a small phonology and simplified number system, but Lang only became aware of this language after 2008, well after Toki Pona\'s core design was established.'
      }
    ],
    relatedNodeIds: ['phi_sim', 'lipu_pu', 'lipu_ku', 'sapir_whorf', 'taoism']
  },
  {
    id: 'ch1-phonology',
    title: 'Chapter 1: The Sounds of Simplicity: Phonology and Orthography',
    sections: [
      {
        subtitle: 'Phonemic Inventory',
        content: 'The strategic simplicity of Toki Pona is immediately apparent in its phonology. The language\'s small and accessible inventory of sounds is a deliberate design choice, engineered to be easy to pronounce for speakers from a wide variety of linguistic backgrounds. The complete phonemic inventory consists of just nine consonants (p, t, k, s, m, n, l, j, w) and five vowels (a, e, i, o, u).'
      },
      {
        subtitle: 'Syllable Structure',
        content: 'The rules governing how these sounds can be combined into syllables (phonotactics) are equally straightforward. The first syllable of a word follows the form (C)V(N)—an optional consonant, a vowel, and an optional final n. Subsequent syllables follow the structure CV(N), meaning the leading consonant is required. The most common syllable type by a significant margin is CV, accounting for 75% of all syllables.'
      },
      {
        subtitle: 'Stress',
        content: 'Stress always falls on the initial syllable of every word, providing a consistent and predictable rhythm.'
      },
      {
        subtitle: 'Allophony',
        content: 'The small number of phonemes allows for extensive allophonic variation. Speakers are free to pronounce sounds in ways that are most natural to them. For example, the voiceless stops /p t k/ can be pronounced as their voiced counterparts b d g, /s/ can be realized as z or ʃ, and /l/ can be pronounced as a tap ɾ.'
      },
      {
        subtitle: 'Final Nasal and Forbidden Elements',
        content: 'The syllable-final n can be pronounced as any nasal stop (such as m or ŋ) and is typically assimilated to the sound of the following consonant. The language explicitly forbids diphthongs, consonant clusters (other than those formed with a syllable-final n), and tones. This ensures that every syllable is clean and simple.'
      },
      {
        subtitle: 'Orthography',
        content: 'For its standard writing convention, Toki Pona uses the Latin alphabet. Sentences are typically written entirely in lowercase letters. Capitalization is reserved for proper nouns and other "unofficial" words to distinguish them from the core vocabulary, signaling to the reader that a word falls outside the established lexicon.'
      }
    ],
    relatedNodeIds: ['phi_sim', 'vowels', 'consonants', 'syllables', 'stress', 'allophony', 'name_adapt', 'orthography']
  },
  {
    id: 'ch2-li-e',
    title: 'Chapter 2: The Core Sentence: Subjects, Predicates, and Objects',
    sections: [
      {
        subtitle: 'SVO Structure and Tense',
        content: 'The grammatical core of Toki Pona is built on a foundation of clarity and predictability. Its rigid Subject-Verb-Object (SVO) word order, governed by a small set of grammatical particles, provides an unambiguous framework for communication. The lack of verb tense structurally reinforces the philosophical goal of focusing on the present moment; context alone determines if an action is past, present, or future.'
      },
      {
        subtitle: 'The li Particle',
        content: 'The fundamental sentence structure is A li B e C, which translates to "A does B to C." The particle li separates the subject from the predicate (verb/adjective phrase). The predicate introduced by li can be a verb, an adjective, or even a noun. Examples: soweli li moku (The cat is eating); telo li pona (Water is good); kili li moku (Fruits are food); ona li lukin e soweli suwi (They are looking at a cute animal).'
      },
      {
        subtitle: 'The e Particle',
        content: 'The particle e separates the predicate from the direct object, marking the preceding word as a transitive verb and introducing the target of the action. Example: ona li lukin e soweli suwi (They are looking at a cute animal).'
      },
      {
        subtitle: 'The li Omission Rule',
        content: 'A critical and absolute rule: the particle li is always omitted when the subject of the sentence is only the unmodified pronoun mi (I) or sina (you). Examples: mi moku (I eat); sina pona (You are good). This rule applies only when mi or sina stand alone as the complete subject. If the subject is modified (e.g., mi mute li moku for "We eat") or joined to another subject with en (e.g., mi en sina li tawa for "You and I go"), the li particle must be used.'
      },
      {
        subtitle: 'Common Misconception About li',
        content: 'Learners often mistake li for a verb meaning "to be." This is incorrect. li has no semantic meaning; it is a purely structural particle that unambiguously signals the beginning of the predicate phrase. Resisting the urge to translate it directly will lead to a more authentic understanding of Toki Pona grammar.'
      }
    ],
    relatedNodeIds: ['svo_intro', 'li_rule', 'e_rule', 'mi_sina_exception', 'en_particle', 'tense_context']
  },
  {
    id: 'ch3-modifiers',
    title: 'Chapter 3: The Flexible Word: Vocabulary and Modification',
    sections: [
      {
        subtitle: 'Polysemy and Syntactic Role',
        content: 'One of the most elegant features of Toki Pona is its approach to vocabulary, which relies heavily on polysemy. Unlike in many languages where words are rigidly categorized as nouns, verbs, or adjectives, Toki Pona\'s content words are grammatically fluid. Their function is derived almost entirely from their syntactic role within a phrase, a design that allows a very small lexicon to express a vast range of ideas.'
      },
      {
        subtitle: 'Word Flexibility in Context',
        content: 'A single content word like moku demonstrates this flexibility. When it serves as the head of the predicate (following li), it functions as a verb ("to eat"). When it is the head of the subject or object phrase, it is a noun ("food"). When it follows another word as a modifier, it becomes an adjective ("edible"). This system allows context and syntax, rather than a large vocabulary, to carry the primary burden of meaning.'
      },
      {
        subtitle: 'Head-Initial Rule',
        content: 'Toki Pona employs a strict head-initial modifier system. In any descriptive phrase, the first word is the "head," establishing the core concept. Every word that follows acts as a modifier, making the meaning of the head word more specific. Examples: jan lili (child, literally "small person"); tomo mi (my house); pilin pona (happy, literally "good feeling").'
      },
      {
        subtitle: 'Multiple Modifiers',
        content: 'When multiple modifiers are used, each one applies individually to the head noun. The order of the modifiers does not create nested meanings. For example, in jan li toki musi suwi ("Somebody is telling a sweet, funny story"), both musi (funny) and suwi (sweet) are modifying the head word toki (story/speech). The phrase does not mean "a sweetly funny story" but rather "a story that is funny and is sweet."'
      }
    ],
    relatedNodeIds: ['head_initial', 'simple_mods', 'multiple_mods', 'polysemy', 'syntactic_role']
  },
  {
    id: 'ch4-pi',
    title: 'Chapter 4: Grouping Ideas: The pi Particle',
    sections: [
      {
        subtitle: 'Function of pi',
        content: 'When a descriptive phrase requires more complexity than simple, parallel modification can offer, Toki Pona employs the particle pi. This particle is the primary grammatical tool for creating complex, nested phrases and avoiding ambiguity. It allows a speaker to group modifiers together, ensuring that they modify each other before modifying the original head noun. The function of pi is to regroup the words that follow it into a new, single modifier phrase.'
      },
      {
        subtitle: 'Grouping Example',
        content: 'This is best understood through an example. The phrase jan pali kasi would mean a "plant-like worker," as both pali and kasi modify jan. However, jan pi pali kasi regroups pali kasi ("plant work") into a single idea that then modifies jan, creating the meaning "gardener" or "person of plant work."'
      },
      {
        subtitle: 'Two-Word Rule',
        content: 'A critical grammatical rule governs the use of pi: it must be followed by at least two content words. Using pi before a single word (e.g., toki pi pona) is ungrammatical and redundant. The simple phrase toki pona already achieves the intended meaning ("good speech"), with pona directly modifying toki. The particle pi is exclusively for grouping multiple words into a new adjectival phrase.'
      },
      {
        subtitle: 'Common Errors with pi',
        content: 'A frequent error is to use pi as a general equivalent of the English word "of." Simple possession does not use pi; it is expressed through direct modification, as in tomo mi ("my house"). The particle pi is only used for possession when the owner is described by a multi-word phrase, such as tomo pi jan Alu ("the house of Person Alu"). While grammatically possible, stacking multiple pi phrases can create significant confusion. Community members strongly advise against this practice, recommending instead that speakers rephrase complex ideas into multiple, simpler sentences.'
      },
      {
        subtitle: 'Contrasting Examples',
        content: 'jan wawa mute means "many strong people" (both wawa and mute modify jan). jan pi wawa mute means "a person of much strength; a very strong person" (wawa mute is regrouped by pi). Similarly, jan wawa ala means "no strong people," while jan pi wawa ala means "a person of no strength; a weak person."'
      }
    ],
    relatedNodeIds: ['pi_intro', 'pi_grouping', 'pi_2word', 'pi_possession', 'pi_errors']
  },
  {
    id: 'ch5-questions',
    title: 'Chapter 5: Negation and Questions: ala, seme, and anu seme',
    sections: [
      {
        subtitle: 'Negation with ala',
        content: 'Toki Pona\'s systems for negation and questions are designed for clarity and simplicity. The particle ala provides a universal strategy for negation. It is placed directly after the word it negates, whether that word is a verb, adjective, or noun. To negate a verb, ala follows the verb phrase: mi lape (I am sleeping) becomes mi lape ala (I am not sleeping). ala can also function as a modifier to negate a subject: jan ala li toki (Nobody is talking, literally "person-not is talking").'
      },
      {
        subtitle: 'A-not-A Structure (Yes/No Questions)',
        content: 'This structure is used to ask polar (yes/no) questions by presenting a verb and its negation as a choice. Structure: Subject li verb ala verb e Object? Example: sina ken ala ken lape? (Are you able to sleep?) To answer, one simply repeats the verb for "yes" or the verb followed by ala for "no."'
      },
      {
        subtitle: 'The anu seme Tag',
        content: 'Any declarative statement can be turned into a question by adding the tag anu seme ("or what?") to the end. Structure: Statement anu seme? Example: sina wile uta e mi anu seme? (Do you want to kiss me?)'
      },
      {
        subtitle: 'The seme Pronoun (Wh- Questions)',
        content: 'For questions seeking specific information (who, what, where, etc.), the interrogative pronoun seme ("what") replaces the unknown element in a standard sentence. seme is placed in the grammatical slot of the missing information. Example (Object): sina pali e seme? (What are you doing?) Example (Subject): jan seme li toki? (Who is talking?)'
      }
    ],
    relatedNodeIds: ['ala_negation', 'yes_no_quest', 'seme_quest', 'anu_seme']
  },
  {
    id: 'ch6-prepositions',
    title: 'Chapter 6: Adding Nuance: Preverbs and Prepositions',
    sections: [
      {
        subtitle: 'Preverbs',
        content: 'Preverbs are words that appear directly after the subject (or the li particle, if present) and immediately before the main verb. They function similarly to auxiliary or modal verbs in English, modifying the action that follows. The most widely used preverbs are: wile (to want to... — soweli li wile moku: The cat wants to eat), ken (to be able to... — mi ken sitelen e waso: I can draw a bird), kama (to begin to/become... — mi kama sona: I begin to know), awen (to continue to/keep... — ona li awen lape: They continue to sleep), alasa (to try to... — mi alasa sona e nimi: I try to learn the words).'
      },
      {
        subtitle: 'Additional Preverbs and Community Usage',
        content: 'A few other words can function as preverbs, though their use is less universal. These include sona (to know how to), open (to begin to), and pini (to finish). The community\'s usage patterns reveal the language\'s living evolution: many speakers adopted open as an alternative to kama\'s "begin to" sense, focusing kama more on "become." Similarly, alasa has largely superseded the older preverb lukin ("to try to"), likely because its core meaning is more obviously linked to "trying."'
      },
      {
        subtitle: 'Prepositions',
        content: 'Prepositions in Toki Pona form a closed and inflexible class of words. This rigidity is a crucial design feature, avoiding a level of ambiguity that would border on genuine incomprehensibility. There are five core prepositions: lon (location, existence, at/in/on — mi lon tomo sina: I am in your house), tawa (movement, perspective, to/for — mi tawa esun: I go to the market), tan (source, cause, from/because of — mi kama tan esun: I come from the market), kepeken (instrumentality, using/with — mi moku kepeken ilo: I eat using a tool), sama (similarity, comparison, like/as — sina toki sama kala: You talk like a fish).'
      }
    ],
    relatedNodeIds: ['prep_lon', 'prep_tawa', 'prep_tan', 'prep_kepeken', 'prep_sama', 'preverb_wile', 'preverb_ken', 'preverb_kama', 'preverb_awen', 'preverb_alasa']
  },
  {
    id: 'ch7-lexicon',
    title: 'Chapter 7: The Lexicon in Practice: Colors and Numbers',
    sections: [
      {
        subtitle: 'The Five-Color System',
        content: 'The minimalist philosophy of Toki Pona is nowhere more evident than in its systems for describing colors. The language operates on a five-color schema using basic terms that correspond to fundamental light and pigment categories: pimeja (Black — dark shades, shadow, deep blue, dark gray), walo (White — light colors, pale, bright), loje (Red — red, pink, burgundy), jelo (Yellow — yellow, amber, golden, yellowish-orange), laso (Blue/Green — blue, green, turquoise, cyan, indigo).'
      },
      {
        subtitle: 'Color Combinations',
        content: 'The most notable feature is the word laso, which covers both blue and green, similar to the "grue" category found in many natural languages. To express more specific shades, speakers combine basic terms using modification. For example, laso loje (literally "reddish blue") is used for purple, while jelo laso ("bluish yellow") can specify green. For even greater clarity, the pi particle can be employed, as in sewi pi pimeja walo (sky of dark-white) to unambiguously describe a gray sky.'
      },
      {
        subtitle: 'The Number System',
        content: 'The number system is similarly minimalist and context-dependent. It is built upon three primary words: wan (one), tu (two), mute (many). The word ala (not/nothing) can also signify zero. In the simplest and most common usage, any quantity greater than two is simply referred to as mute. This system intentionally discourages a focus on large, precise quantities.'
      },
      {
        subtitle: 'Extended Number System',
        content: 'For contexts where more specificity is needed, a more complex additive system exists. This system combines basic number words, such as tu wan for three and tu tu for four. For larger numbers, this system can be extended using luka ("hand") for five, mute for twenty, and ale ("all") for one hundred. For example, ale tu would mean 102. This structure is deliberately cumbersome, reinforcing the idea that communicating large, exact numbers is not a primary goal of the language.'
      }
    ],
    relatedNodeIds: ['colors_pimeja', 'colors_walo', 'colors_loje', 'colors_jelo', 'colors_laso', 'numbers_simple', 'numbers_complex', 'luka_five', 'mute_twenty', 'ale_hundred']
  },
  {
    id: 'ch8-community',
    title: 'Chapter 8: Compounding, Context, and the Community',
    sections: [
      {
        subtitle: 'Compounding and Lexicalization',
        content: 'The primary method for expressing complex or specific ideas in Toki Pona is "compounding"—the practice of combining a head word with one or more modifiers to create a new concept. This process is essential to the language\'s expressive power, but it also sits at the center of a key cultural tension: the debate over "lexicalization," where a compound becomes so conventional that it functions as a fixed new word. Common examples include: jan pona (literally "good person," often understood as "friend"), telo nasa (literally "strange liquid," often understood as "alcohol"), tomo tawa (literally "moving structure," often understood as "car").'
      },
      {
        subtitle: 'Community Resistance to Fixed Meanings',
        content: 'While speakers are free to create such compounds, the community culture actively resists allowing them to settle into a single, concrete meaning. The philosophy of the language dictates that meaning should be derived from context, not from a large, memorized vocabulary of fixed compounds. A prime example of this ambiguity is the compound ko walo (white powder/paste). In a conversation about weather, it would almost certainly mean "snow"; in a different context, it could just as easily refer to "cocaine."'
      },
      {
        subtitle: 'Thinking in Toki Pona',
        content: 'Community discussions reveal a strong stylistic preference for "thinking in Toki Pona" rather than translating concepts directly. This is a conscious effort to avoid projecting the structures of one\'s native language onto Toki Pona. As one speaker reflects, "I suspect, since the majority of TP speakers grew up with a natural language, we tend to project the complexity and grammar of that language back onto TP." Consequently, constructions that are seen as grammatically valid but "clumsy," such as sentences with multiple pi phrases, are generally discouraged in favor of rephrasing ideas into simpler, more direct statements.'
      }
    ],
    relatedNodeIds: ['compounding', 'lexicalization', 'community_culture', 'context_meaning', 'thinking_in_tp']
  },
  {
    id: 'ch9-writing',
    title: 'Chapter 9: Writing Toki Pona: sitelen pona and sitelen sitelen',
    sections: [
      {
        subtitle: 'Overview of Writing Systems',
        content: 'While Toki Pona is most commonly written using the Latin alphabet, it is not intrinsically tied to any single script. In keeping with its minimalist and playful ethos, the language has inspired the creation of unique, visually intuitive writing systems that reflect its core philosophy. These systems offer speakers alternative ways to engage with the language, transforming the act of writing into an artistic practice.'
      },
      {
        subtitle: 'sitelen pona',
        content: 'The most popular of these is sitelen pona. This is a logographic system where each word in the language is represented by a single, simple grapheme. Many of these symbols are pictographic or derived from universal signs (like road signs or emoticons), making them remarkably easy to learn and recognize. The script is typically written from left to right. One of its most distinctive features is its method for compounding: a modifier grapheme is written inside or above the head grapheme it modifies. The official symbol for the language itself is a perfect example, with the pona (good) grapheme nested inside the toki (speech) grapheme.'
      },
      {
        subtitle: 'sitelen sitelen',
        content: 'A second, more elaborate system is sitelen sitelen. Created by Jonathan Gabel, this is a non-linear, mixed writing system that is both decorative and complex. It combines logographs for core words with an abugida (a syllabic alphabet) for writing syllables, which is particularly useful for transcribing proper names. The purpose of sitelen sitelen is explicitly contemplative; its intricate forms encourage users to slow down and explore how the method of communication itself can influence thought.'
      },
      {
        subtitle: 'Conclusion',
        content: 'Whether written in the familiar Latin alphabet or in one of its unique native scripts, Toki Pona remains a language centered on the principle of profound simplicity. It is an invitation to see the world through a minimalist lens and to find creative expression within clear constraints. To continue your journey, the most important step is to connect with the vibrant and welcoming online community, where you can put these concepts into practice through conversation and shared creation.'
      }
    ],
    relatedNodeIds: ['sitelen_pona', 'sitelen_sitelen', 'logographic', 'latin_script', 'jonathan_gabel']
  }
];
