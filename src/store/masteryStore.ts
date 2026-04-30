/* src/store/masteryStore.ts */
import { db } from '../services/firebase';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import {
  type MasteryStatus, type VocabWord, type StatusSummary, type SavedPhrase,
  type UserProfile, type ReviewVibe,
  type CurriculumLevel, type NodeStatus, type CommonPhrase, type PosRole,
  type SmallRank, type CeremonialRank, type Badge, SMALL_RANKS,
  CEREMONIAL_RANKS, ALL_BADGES, type SessionLogEntry, type WeeklyChallenge
} from '../types/mastery';
import { scoreToStatus, STATUS_MIDPOINT } from '../types/mastery';
import type { Album } from '../types/discography';
import { initialMasteryMap } from '../data/initialMasteryMap';
import { curriculumRoadmap } from '../data/curriculum';
import { vocabContent } from '../data/vocabContent';
import { albumData } from '../data/albumData';
import { TOKI_PONA_DICTIONARY, WORD_FREQUENCY } from '../data/tokiPonaDictionary';
import aiVocabCache from '../data/aiVocabCache.json';

function toFullVocabWord(v: { word: string; partOfSpeech?: string; status: MasteryStatus; type: 'word' | 'grammar'; sessionNotes: string; frequencyRank?: number; weight?: 'pillar' | 'working' | 'bonus' }): VocabWord {
  const score = STATUS_MIDPOINT[v.status];
  const staticData = vocabContent[v.word] || {};
  const aiData = (aiVocabCache as Record<string, any>)[v.word.toLowerCase()] || {};

  // Distribute initial score across roles
  const perRole = Math.floor(score / 3);

  return {
    id: v.word,
    word: v.word,
    partOfSpeech: v.partOfSpeech || '',
    meanings: TOKI_PONA_DICTIONARY[v.word.toLowerCase()] || '',
    type: v.type,
    baseScore: score,
    roleMatrix: { noun: perRole, verb: perRole, mod: perRole },
    status: v.status,
    weight: v.weight,
    useCount: 0,
    frequencyRank: v.frequencyRank ?? 999,
    isMasteryCandidate: false,
    sessionNotes: v.sessionNotes,
    aiExplanation: aiData.aiExplanation || '',
    aiExamples: aiData.aiExamples,
    lastReviewed: new Date().toISOString(),
    scoreHistory: [],
    hardened: false,
    isBleeding: false,

    // Hydrate static fields from vocabContent
    phonetic: staticData.phonetic || '',
    syllables: staticData.syllables || [],
    anchor: staticData.anchor || '',
    semanticCluster: staticData.semanticCluster || [],
    connotation: staticData.connotation || 'neutral',
    roles: staticData.roles || [],
    examples: staticData.examples || [],
    collocations: staticData.collocations || [],
    relatedWordIds: staticData.relatedWordIds || [],
    boundaryNotes: staticData.boundaryNotes || [],
    etymology: staticData.etymology || '',
    mnemonic: staticData.mnemonic || '',
    userMnemonic: '',
    culturalNotes: staticData.culturalNotes || '',
    avoidWhen: staticData.avoidWhen || '',
    rolesMastered: {},
    userNotes: '',
    notes: '',
    customDefinition: ''
  };
}

const mappedVocabulary: VocabWord[] = initialMasteryMap.initialVocabulary.map(toFullVocabWord);

const defaultSongs: Album[] = [
  {
    id: 'telo-lon-kiwen',
    title: "telo lon kiwen",
    year: 2022,
    songs: [
      { id: 'suno-lon-insa', title: 'suno lon insa', blocks: [] },
      { id: 'telo-lon-kiwen-track', title: 'telo lon kiwen', blocks: [] },
      { id: 'tenpo-li-moku-e-mi', title: 'tenpo li moku e mi', blocks: [] },
      { id: 'eijelo-ilo', title: 'eijelo ilo', blocks: [] },
      { id: 'kon-li-pini-e-moli', title: 'kon li pini e moli', blocks: [] },
      { id: 'ma-suli-lon-monsi', title: 'ma suli lon monsi', blocks: [] },
      { id: 'nasin-pi-pakala-ken', title: 'nasin pi pakala ken', blocks: [] },
      { id: 'kalama-pi-pini-ala', title: 'kalama pi pini ala', blocks: [] },
      { id: 'ante-suli-track', title: 'ante Suli', blocks: [] },
      { id: 'pana-pi-wawa-pimeja', title: 'pana pi wawa pimeja', blocks: [] },
      { id: 'suno-sewi', title: 'suno sewi', blocks: [] },
      { id: 'awen-lape', title: 'awen lape', blocks: [] },
      { id: 'kon-pi-sewi', title: 'kon pi sewi', blocks: [] },
      { id: 'kon-kalama', title: 'kon kalama', blocks: [] },
      { id: 'o-lon-poka-mi', title: 'o lon poka mi', blocks: [] },
      { id: 'luka-mama', title: 'luka mama', blocks: [] },
      { id: 'tenpo-awen-pini-ala', title: 'tenpo awen pini ala', blocks: [] },
      { id: 'telo-suno', title: 'telo suno', blocks: [] }
    ]
  },
  {
    id: 'kalama-pi-kon-mi',
    title: "kalama pi kon mi",
    year: 2023,
    songs: [
      { id: 'mi-awen-lon-pimeja', title: 'mi awen lon pimeja', blocks: [] },
      { id: 'mi-lon-ma-lili', title: 'mi lon ma lili', blocks: [] },
      { id: 'seli-pi-sijelo', title: 'seli pi sijelo', blocks: [] },
      { id: 'oko-pikon-sewi', title: 'oko pikon sewi', blocks: [] },
      { id: 'mi-wile-pona', title: 'mi wile pona', blocks: [] },
      { id: 'toki-ala', title: 'toki ala', blocks: [] },
      { id: 'awa-en-awen', title: 'awa en awen', blocks: [] },
      { id: 'noka-en-ma', title: 'noka en ma', blocks: [] },
      { id: 'ni-li-nasa', title: 'ni li nasa', blocks: [] },
      { id: 'mi-mute-o-musi', title: 'mi mute o musi', blocks: [] },
      { id: 'mi-lon-ni-li-pona', title: 'mi lon ni li pona', blocks: [] },
      { id: 'kalama-pi-kon-mi-track', title: 'kalama pi kon mi', blocks: [] }
    ]
  },
  {
    id: 'utala-kon',
    title: "utala kon",
    year: 2024,
    songs: [
      { id: 'wawa-kama', title: 'wawa kama', blocks: [] },
      { id: 'nasin-li-ken-ala', title: 'nasin li ken ala', blocks: [] },
      { id: 'pini-li-kama', title: 'pini li kama', blocks: [] },
      { id: 'toki-ike', title: 'toki ike', blocks: [] },
      { id: 'lukin-moli', title: 'lukin moli', blocks: [] },
      { id: 'mi-olin-e-ike', title: 'mi olin e ike', blocks: [] },
      { id: 'mi-awen-lon-ni', title: 'mi awen lon ni', blocks: [] },
      { id: 'pini-ala', title: 'pini ala', blocks: [] },
      { id: 'pini-lon-tomo', title: 'pini lon tomo', blocks: [] }
    ]
  },
  {
    id: 'toki-nasa-kalama-pona-ep',
    title: "toki nasa, kalama pona ep",
    year: 2025,
    songs: [
      { 
        id: 'o-tawa-wawa', 
        title: 'o tawa wawa', 
        blocks: [
          { title: "Intro", tp: "(Hey!) (Hey!) (Hey!)", en: "(Hey!) (Hey!) (Hey!)" },
          { title: "Verse 1", tp: "kalama li open / mi kute e wawa / sijelo mi li seli / tenpo ni li wawa / (wawa!) / mi pali ala / musi li lawa / sina seli mute / mi seli kin", en: "The sound begins / I hear the power / My body is hot / This moment is powerful / (wawa!) / I am not doing anything / The music is leading / You are very hot / I am hot too" },
          { title: "Pre-Chorus", tp: "mi ken ala lawa e pilin / telo loje li seli mute / sina tawa lon kon mi / (lon kon mi) / musi li lon insa mi / (insa mi) / ona li wawa!", en: "I cannot control the feeling / My blood is very warm / You move in my spirit / (in my spirit) / The music is inside me / (inside me) / It is powerful!" },
          { title: "Chorus", tp: "o tawa! / musi li wawa / (musi li wawa) / o tawa! / seli li tawa / (seli li tawa) / mi musi / mi wawa / o tawa! / (TAWA!)", en: "Move! / The music is power / (the music is power) / Move! / The heat moves / (the heat moves) / I am having fun / I am strong / Move! / (MOVE!)" },
          { title: "Verse 2", tp: "musi li kute / mi kute e musi / ona li uta / li uta e mi / wan, tu, tawa! / mi tawa mute / ona li wawa / mi tawa mute / (tawa mute!)", en: "The music is hearing / I hear the music / It is a mouth / And it kisses me / One, two, move! / I move a lot / It is powerful / I move a lot / (move a lot!)" },
          { title: "Bridge", tp: "o kute e pilin / o kute e kalama / mi pali ala / musi li tawa e mi! / (ona li tawa e mi!) / mi seli! / mi wawa! / AH!", en: "Listen to the heart / Listen to the sound / I am not acting / The music moves me! / (it moves me!) / I'm burning! / I'm powerful! / AH!" },
          { title: "Outro", tp: "musi li wawa / (wawa!) / seli li tawa / (tawa!) / o tawa! / musi!", en: "The music is power / (power!) / The heat moves / (moves!) / Move! / Music!" }
        ] 
      },
      { 
        id: 'lukin-sama', 
        title: 'lukin sama', 
        blocks: [
          { title: "Intro", tp: "(Ooh-woah) (Ooh-woah)", en: "(Ooh-woah) (Ooh-woah)" },
          { title: "Verse 1", tp: "mi lon tomo musi suli ni / suno mute li suli e kon / jan mute li musi li kalama / taso lukin mi li tawa sina / (tawa sina, tawa sina)", en: "I am at this big, fun house / Many lights make the air feel big / Many people are having fun and making noise / But my gaze goes to you / (to you, to you)" },
          { title: "Pre-Chorus", tp: "tenpo li pona li open / pilin mi li wile e sina / o lukin tawa ma mi ni / o kama tawa mi", en: "The time is good and it is beginning / My heart wants you / Look toward this place of mine / Come to me" },
          { title: "Chorus", tp: "jan pona o, o lukin e mi / mi wile e ni: sina pona / pilin olin li kama suli / lukin sina li sama mi anu seme? / (anu seme? anu seme?) / o lukin e mi, jan pona o", en: "O good person, look at me / I want this: for you to be good / The feeling of love is becoming great / Is your gaze like mine, or what? / (or what? or what?) / Look at me, good person" },
          { title: "Post-Chorus", tp: "lukin, lukin, lukin / (o lukin e mi) / pona, pona, pona / (o pona e mi) / sama, sama, sama / (o sama e mi)", en: "Look, look, look / (look at me) / Good, good, good / (make me good) / Same, same, same / (make me the same)" },
          { title: "Verse 2", tp: "lipu kasi li open lon insa / kili lili li suli e olin / mi utala ala e tenpo / mi olin e toki pi lukin sina / (lukin sina, lukin sina)", en: "A book of plants opens inside / Small fruits make love grow / I don't fight against time / I love the language of your gaze / (your gaze, your gaze)" },
          { title: "Bridge", tp: "mu... mu... mu... (kalama pi pilin mi) / mu... mu... mu... (kalama pi pilin sina) / tenpo li awen lili / suno li tawa sike / o open e pilin pona", en: "mu... mu... mu... (sound of my heart) / mu... mu... mu... (sound of your heart) / Time stays a little while / The sun moves in a circle / Open up the good feeling" },
          { title: "Outro", tp: "jan pona o / (o lukin) / lukin sama / (o pona) / mi olin e sina / (o open) / sama... / pona...", en: "Good person / (look) / Looking the same / (good) / I love you / (open) / Same... / Good..." }
        ] 
      },
      { 
        id: 'o-kule-e-kon', 
        title: 'o kule e kon', 
        blocks: [
          { title: "Intro", tp: "Shimmering synth wash — no drums", en: "Shimmering synth wash — no drums" },
          { title: "Verse 1", tp: "lili li lon, o lukin. / kule li wawa, li sewi. / suno li pini, li kama. / pini la, kon li tawa. / mi lili, mi lon poka. / (mi lon poka...)", en: "Smallness exists, look at it. / Color is strong, it is divine. / The light fades, and it returns. / When it ends, the air moves. / I am small, I am right beside you. / (right beside you...)" },
          { title: "Chorus", tp: "o kule e kon! / o suno e wawa! / lili li sewi! / lete li pona! / mi mute li lon! / o pilin e ijo! / o pilin e ijo!", en: "Color the air! / Light up the energy! / Smallness is divine! / The cold is good! / We exist! / Feel something! / Feel something!" },
          { title: "Verse 2", tp: "lete li moku e sijelo. / kon li moku e kon mi. / kule li lon, li pini ala. / lili o, o tawa insa. / o kute e toki pi lili.", en: "The cold bites the body. / The air consumes my breath. / Color is present, it does not end. / Oh small things, move within. / Listen to the voice of smallness." },
          { title: "Outro", tp: "suno li lon. / (suno li lon.) / o lili. / (o lili.) / o kule.", en: "Light exists. / (light exists.) / Be small. / (be small.) / Be colorful." }
        ] 
      },
      { 
        id: 'kulupupona', 
        title: 'KULUPUPONA', 
        blocks: [
          { title: "Intro", tp: "(o!) (o!) (mi mute o!) / tenpo ni li pona mute / (ni li pona!)", en: "(oh!) (oh!) (all of us oh!) / This time is so good / (this is good!)" },
          { title: "Verse 1", tp: "o lukin e mi mute / mi lon ma pona / o pana e seli / (o pana!) / o moku e telo / (o moku!) / mi mute li tawa mute / nasin ante li ike / sina jo e suli / (sina jo!) / mi pana e wawa / (mi pana!)", en: "Look at all of us / We are in a good place / Give the warmth / (give!) / Drink the water / (drink!) / We are moving a lot / Other ways are bad / You have greatness / (you have!) / I give the strength / (I give!)" },
          { title: "Pre-Chorus", tp: "ma li pimeja lon poka / la ni li seli li suno / mi mute li ken ala pakala / tan ni: sina lon poka mi", en: "The world is dark outside / But here is warm and glowing / We cannot be broken / Because you are here by my side" },
          { title: "Chorus", tp: "kulupu pona li lon! / (li lon!) / mi mute li jo e mute! / (e mute!) / moku li pona / telo li pona / kalama ni li seli e pilin / kulupu pona li lon!", en: "The good community is here! / (is here!) / We have so much! / (so much!) / The food is good / The drink is good / This sound warms the heart / The good community is here!" },
          { title: "Verse 2", tp: "sina moku e telo / mi pana e moku / mi jo e kon pona / mi mute li kulupu / (a!) / o kalama mute / o tawa suli / tenpo li tawa / la mi mute li awen / (awen!) (awen!) / mi pana e pona tawa sina / sina pana e pona tawa mi", en: "You drink / I give the food / I have a good spirit / We are a community / (ah!) / Make a lot of noise / Move big / As time goes by / We remain / (remain!) (remain!) / I give goodness to you / You give goodness to me" },
          { title: "Bridge", tp: "ma li tawa mute / mi mute li lili / taso lon kulupu / mi suli / mi mute li jo e ni / ni li ale", en: "The world moves fast / We are small / But in the community / I am big / We have this / This is everything" },
          { title: "Outro", tp: "pona! (pona!) / mi mute li lon! (o!) / ni li ale!", en: "Good! (good!) / We are here! (oh!) / This is everything!" }
        ] 
      },
      { 
        id: 'alasa-tawa-sin', 
        title: 'alasa tawa sin', 
        blocks: [
          { title: "Verse 1", tp: "mi wile e wawa olin. / alasa li open lon poka. / mi utala e kon moku. / o awen lili, o lukin sin.", en: "I want the power of love. / The hunt begins nearby. / I fight against the consuming air. / Wait a little, look anew." },
          { title: "Chorus", tp: "o alasa! o awen ala! / pini li lon poka ala! / wile li tawa suli! / kon sin li lon poka! / lon! tawa! sin! / (lon tawa sin!)", en: "Hunt! Do not wait! / The end is nowhere near! / Wanting becomes motion! / A new spirit is near! / Real! Motion! New! / (real motion new!)" },
          { title: "Verse 2", tp: "pini li moku e wawa. / awen li moku e pilin. / mi wile e tawa suli. / alasa li suno sin.", en: "Endings consume strength. / Waiting consumes feeling. / I want great momentum. / The chase is a new sun." },
          { title: "Bridge", tp: "tenpo pini li moli. / tenpo sin li lon. / mi alasa e suli olin. / pini li lon ala!", en: "Past time is dead. / New time is alive. / I chase the greatness of love. / There is no end!" },
          { title: "Outro", tp: "alasa sin. / awen tawa. / (pona tawa mi.)", en: "A new hunt. / Keep moving. / (good for me.)" }
        ] 
      },
      { 
        id: 'kili-wawa', 
        title: 'kili wawa', 
        blocks: [
          { title: "Intro", tp: "(O! O! O!)", en: "(O! O! O!)" },
          { title: "Verse 1", tp: "moku li suli (suli) / kili li loje (loje) / mi pali e ni (mi pali) / tenpo li awen (awen)", en: "Eating is important (important) / The fruit is red (red) / I am doing this (I am doing) / Time remains (remains)" },
          { title: "Chorus", tp: "o kalama nasa mute! / (o kalama!) / o tawa wawa suli! / (o tawa!) / mi moku e kili lili / ona li suli tawa mi / (li suli!) / moku! wawa! / (moku! wawa!) / nasa! pona! / (nasa! pona!)", en: "Make a lot of strange noise! / (noise!) / Move with great strength! / (move!) / I am eating a tiny fruit / It is huge to me / (is huge!) / Food! Power! / (food! power!) / Strange! Good! / (strange! good!)" },
          { title: "Verse 2", tp: "wawa li pona (pona) / tawa li suli (suli) / mi lukin e ni (mi lukin) / tenpo li nasa (nasa)", en: "Power is good (good) / Movement is grand (grand) / I am looking at this (I am looking) / Time is strange (strange)" },
          { title: "Middle 8", tp: "sina lukin ala lukin? / kili ni li wawa. / mi lon. / mi suli. / tenpo li pini. / moku.", en: "Are you looking or not? / This fruit is powerful. / I am here. / I am important. / Time is finished. / Eat." },
          { title: "Outro", tp: "moku suli (moku suli) / mi wawa (mi wawa) / nasa (nasa) / pona (pona)", en: "Grand eating (grand eating) / I am strong (I am strong) / Strange (strange) / Good (good)" }
        ] 
      }
    ]
  },
  {
    id: 'pini-o-awen',
    title: "pini o awen",
    year: 2026,
    songs: [
      { id: 'lon-pimeja', title: 'lon pimeja', blocks: [] },
      { id: 'mi-olin-e-tenpo', title: 'mi olin e tenpo', blocks: [] },
      { id: 'mi-ala', title: 'mi ala', blocks: [] },
      { id: 'olin-li-awen', title: 'olin li awen', blocks: [] },
      { id: 'sona-pi-tenpo-pini', title: 'sona pi tenpo pini', blocks: [] },
      { id: 'toki-lon-kon', title: 'toki lon kon', blocks: [] },
      { id: 'tawa-awen', title: 'tawa awen', blocks: [] },
      { id: 'utala-insa', title: 'utala insa', blocks: [] },
      { id: 'ike-li-lawa', title: 'ike li lawa', blocks: [] },
      { id: 'toki-pi-utala', title: 'toki pi utala', blocks: [] },
      { id: 'lape-suli', title: 'lape suli', blocks: [] },
      { id: 'ale-li-lon-mi', title: 'ale li lon mi', blocks: [] },
      { id: 'sama-anu-seme', title: 'sama anu seme', blocks: [] },
      { id: 'olin-pi-pini', title: 'olin pi pini', blocks: [] },
      { id: 'tenpo-suno-tu', title: 'tenpo suno tu', blocks: [] },
      { id: 'pona-li-kama', title: 'pona li kama', blocks: [] }
    ]
  }
];

const defaultCommonPhrases = [
  { category: "GREETINGS", tp: "toki!", en: "Hello / Hi" },
  { category: "GREETINGS", tp: "sina pilin seme?", en: "How are you?" },
  { category: "GREETINGS", tp: "mi tawa", en: "Goodbye (I am leaving)" },
  { category: "SOCIAL", tp: "nimi mi li jan User", en: "My name is User" },
  { category: "SOCIAL", tp: "mi kama sona e toki pona", en: "I'm learning Toki Pona" },
  { category: "POLITE", tp: "sina pona", en: "Thank you / You are good" },
  { category: "POLITE", tp: "mi pakala", en: "I'm sorry / I messed up" },
  { category: "POLITE", tp: "ale li pona", en: "Everything is good" },
  { category: "FEELINGS", tp: "mi pilin pona", en: "I feel good / happy" },
  { category: "FEELINGS", tp: "mi pilin seli", en: "I feel hot / angry" }
];

interface MasteryActions {
  applyScoreUpdate: (nodeId: string, points: number, context: string) => void;
  calculateDecay: () => void;
  applyScoreDeltas: (deltas: { wordId: string; role?: keyof RoleMatrix; delta: number }[]) => void;
  updateVocabStatus: (wordIdOrText: string, role: keyof RoleMatrix, points: number) => void;
  cycleWordStatus: (wordId: string) => void;
  setLastUpdated: (date: string) => void;
  savePhrase: (phrase: string | SavedPhrase) => void;
  recordActivity: () => void;
  setStudentName: (name: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  setReviewVibe: (vibe: ReviewVibe) => Promise<void>;
  setProfileImage: (url: string) => Promise<void>;
  updatePhraseNote: (id: string, notes: string) => Promise<void>;
  deletePhrase: (id: string) => Promise<void>;
  resetAsNewUser: () => Promise<void>;
  resetProfileAndRunSetup: () => Promise<void>;
  randomizeVocab: () => Promise<void>;
  masterAllVocab: () => Promise<void>;
  clearLocalData: () => void;
  syncFromCloud: (userId: string, initialName?: string, initialProfileImage?: string) => Promise<Unsubscribe | void>;
  syncToCloud: (userId?: string, merge?: boolean, force?: boolean) => Promise<void>;
  getStatusSummary: () => StatusSummary & { xp: number; level: number; rankTitle: string };
  setHasCompletedSetup: (val: boolean) => void;
  setSongs: (songs: Album[]) => void;
  syncSongsWithData: () => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
  awardBadge: (badgeId: string) => void;
  checkAndAwardRanks: () => void;
  clearNewRankUnlocked: () => void;
  updateSessionXPRecord: (xp: number) => void;
  refreshCurriculumStatus: () => void;
  setWidgetDensity: (val: 'Compact' | 'Expanded') => void;
  setFogOfWar: (val: 'Strict' | 'Visible') => void;
  setShowCircuitPaths: (val: boolean) => void;
  setKnowledgeCheckFrequency: (freq: 'daily' | 'session' | 'never') => Promise<void>;
  setLastKnowledgeCheckDate: (date: string) => Promise<void>;
  setSelectedWords: (words: string[]) => void;
  addWordToSelection: (word: string) => void;
  removeWordFromSelection: (word: string) => void;
  toggleWordSelection: (word: string) => void;
  setLessonFilter: (wordIds: string[] | null) => void;
  hardenWord: (wordId: string) => Promise<void>;
  clearAllSavedPhrases: () => Promise<void>;
  checkAssessments: (onTrigger: (word: VocabWord) => void) => void;
  switchProfile: (name: string) => void;
  updateVocabAIContent: (wordId: string, content: { aiExplanation?: string; aiExamples?: Record<string, string> }) => void;
  updateSessionNotes: (wordId: string, notes: string) => void;
  resetProgress: () => void;
  chargeGrid: () => void;

  // Feature 5
  recordLearningDay: (date: string) => void;
  runMorningStreakCheck: () => boolean;

  // Feature 6
  recordWordOutcome: (wordId: string, outcome: 'correct' | 'struggled', date: string) => void;
  getRegressionCandidates: (windowDays: number) => string[];

  // Feature 7
  recordConfusion: (wordA: string, wordB: string) => void;
  getTopConfusionPairs: (limit: number) => { wordA: string, wordB: string, count: number }[];
  completeIntroduction: (introId: string) => void;

  // Feature 8
  updateProductionStatus: (wordId: string, status: MasteryStatus) => void;
  updateRecognitionStatus: (wordId: string, status: MasteryStatus) => void;

  // Feature 10
  addProveItResponse: (entry: { word: string, sentence: string, date: string }) => void;
  clearProveItResponses: () => void;

  // Feature 11
  setPinnedExample: (wordId: string, example: string) => void;
  markRoleMastered: (wordId: string, role: PosRole) => void;
  resetLearningProgress: () => Promise<void>;
  completeNode: (nodeId: string) => void;
  checkNodeReadiness: (nodeId: string) => boolean;
  getNodeReadinessPercentage: (nodeId: string) => number;
  recordActivityCompletion: (nodeId: string, activityId: string, stats?: { score: number, total: number }) => void;
  setActiveActivity: (act: { type: string, nodeId: string } | null) => void;
  recordInsight: (label: string, change: number) => void;

  // Prompt C Actions
  startSessionTimer: () => void;
  commitSessionLog: (entry: Omit<SessionLogEntry, 'id' | 'durationMinutes'>) => void;
  generateWeeklyChallenge: () => void;
  progressChallenge: (amount?: number, type?: WeeklyChallenge['type'], wordId?: string) => void;
  clearRankAcknowledgement: () => void;
}

interface MasteryState {
  userId: string | null;
  studentName: string;
  totalXP: number;
  profile: UserProfile;
  reviewVibe: ReviewVibe;
  profileImage: string;
  lastUpdated: string;
  vocabulary: VocabWord[];
  curriculums: CurriculumLevel[];
  savedPhrases: (string | SavedPhrase)[];
  currentStreak: number;
  lastActiveDate: string;
  hasCompletedSetup: boolean;
  currentPositionNodeId: string;
  activeCurriculumId: string | null;
  activeModuleId: string | null;
  selectedWords: string[];
  lessonFilter: string[] | null;
  activeActivity: { type: string, nodeId: string } | null;
  isMainProfile: boolean;
  cloudSynced: boolean;
  songs: Album[];
  commonPhrases: CommonPhrase[];
  // Dashboard settings
  widgetDensity: 'Compact' | 'Expanded';
  fogOfWar: 'Strict' | 'Visible';
  showCircuitPaths: boolean;
  knowledgeCheckFrequency: 'daily' | 'session' | 'never';
  lastKnowledgeCheckDate: string;
  gridChargeUntil: string | null;

  // New Features
  completedActivities: Record<string, { id: string, stats?: { score: number, total: number } }[]>;
  lastStreakCheck: string;
  learningDays: string[];
  completedNodeIds: string[];
  seenIntroductions: string[];
  confusionPairs: { wordA: string, wordB: string, count: number }[];
  pendingProveItResponses: { word: string, sentence: string, date: string }[];
  earnedCeremonialRanks: CeremonialRank[];
  newRankUnlocked: SmallRank | CeremonialRank | null;
  lastSmallRankTitle: string;
  earnedBadges: Badge[];
  totalProveItSubmitted: number;
  streakShields: number;
  xpMultiplier: number;
  lastStreakMilestone: number;
  pendingComebackBonus: boolean;
  sessionXPRecord: number;
  masteryHistory: MasteryEvent[];

  // Prompt C State
  sessionLog: SessionLogEntry[];
  sessionStartTime: string;
  currentChallenge: WeeklyChallenge | null;
  completedChallenges: WeeklyChallenge[];
  pendingRankAcknowledgement: string | null;
}

type MasteryStore = MasteryState & MasteryActions;

const STATUS_ORDER: MasteryStatus[] = ['not_started', 'introduced', 'practicing', 'confident', 'mastered'];
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const defaultProfile: UserProfile = {
  firstName: '',
  lastName: '',
  tpName: '',
  difficulty: 'Beginner',
  interests: [],
  history: [],
  
  age: '',
  sex: null,
  locationString: '',
  
  // Personality
  mbti: '',
  enneagram: '',
  bigFiveOpenness: null,
  bigFiveConscientiousness: null,
  bigFiveExtraversion: null,
  bigFiveAgreeableness: null,
  bigFiveNeuroticism: null,
  attachmentStyle: '',

  // Beliefs
  religion: '',
  religionOther: '',
  politicalIdentity: [],
  politicalIdentityOther: '',

  // Health
  bloodType: '',
  dietPattern: '',
  workoutStyle: '',
  activityLevel: '',
  chronicConditions: '',

  // Media
  bookGenres: [],
  tvGenres: [],
  musicGenres: [],
  gamingGenres: [],
  gamingPlatforms: [],

  // Daily Life
  chronotype: '',
  workSchedule: '',
  livingSituation: '',
  socialPreference: '',
};

export const useMasteryStore = create<MasteryStore>()(
  persist(
    (set, get) => ({
      userId: null,
      studentName: '',
      totalXP: 0,
      profile: defaultProfile,
      reviewVibe: null,
      profileImage: '',
      lastUpdated: '',
      vocabulary: mappedVocabulary,
      curriculums: curriculumRoadmap,
      savedPhrases: [],
      currentStreak: 0,
      lastActiveDate: '',
      hasCompletedSetup: false,
      currentPositionNodeId: 'phi_sim',
          activeCurriculumId: null,
          activeModuleId: null,
      selectedWords: [],
      lessonFilter: null,
      activeActivity: null,
      widgetDensity: 'Expanded',
      isMainProfile: true,
      fogOfWar: 'Visible',
      showCircuitPaths: true,
      knowledgeCheckFrequency: 'session',
      lastKnowledgeCheckDate: '',
      gridChargeUntil: null,
      cloudSynced: false,
      commonPhrases: defaultCommonPhrases,
      songs: defaultSongs,

      // New Features Defaults
      completedActivities: {},
      lastStreakCheck: '',
      learningDays: [],
      completedNodeIds: [],
      seenIntroductions: [],
      confusionPairs: [],
      pendingProveItResponses: [],
      earnedCeremonialRanks: [],
      newRankUnlocked: null,
      lastSmallRankTitle: 'jan lili',
      earnedBadges: [],
      totalProveItSubmitted: 0,
      streakShields: 0,
      xpMultiplier: 1.0,
      lastStreakMilestone: 0,
      pendingComebackBonus: false,
      sessionXPRecord: 0,
      masteryHistory: [],

      // Prompt C Defaults
      sessionLog: [],
      sessionStartTime: '',
      currentChallenge: null,
      completedChallenges: [],
      pendingRankAcknowledgement: null,

      setHasCompletedSetup: (val) => { set({ hasCompletedSetup: val }); void get().syncToCloud(); },
      setSongs: (songs) => { set({ songs }); void get().syncToCloud(); },
      syncSongsWithData: () => {
        const { songs } = get();
        console.log("Current songs in store:", songs);
        const hasTelo = Array.isArray(songs) && songs.some(a => a.id === 'telo-lon-kiwen');
        if (!Array.isArray(songs) || songs.length === 0 || !hasTelo) {
          console.log('Force-syncing songs to latest albumData...');
          set({ songs: defaultSongs });
          void get().syncToCloud();
        }
      },
      refreshCurriculumStatus: () => {
        set((state) => {
          let lastNodeMastery = 0; // Conceptual nodes stay active until sign-off

          const newCurriculums = state.curriculums.map((level, lIdx) => ({
            ...level,
            nodes: level.nodes.map((node, nIdx) => {
              const allReqs = [...node.requiredVocabIds, ...node.requiredGrammarIds];
              const vocabReqs = state.vocabulary.filter(v => allReqs.includes(v.id) || allReqs.includes(v.word));
              
              const avgScore = vocabReqs.length > 0 
                ? vocabReqs.reduce((acc, v) => acc + v.baseScore, 0) / vocabReqs.length 
                : (isFinite(lastNodeMastery) ? lastNodeMastery : 0);

              const isMastered = 
                state.completedNodeIds.includes(node.id) ||
                (vocabReqs.length > 0 && vocabReqs.every(v => v.status === 'mastered')) || 
                (vocabReqs.length === 0 && lastNodeMastery >= 950 && nIdx > 0);

              const isUnlocked = lastNodeMastery > 700 || (lIdx === 0 && nIdx === 0);

              let newStatus: NodeStatus = 'locked';
              if (isMastered) newStatus = 'mastered';
              else if (isUnlocked) newStatus = 'active';

              // Activity Mapping Logic
              let activities = node.activities || [];
              if (node.id === 'phi_sim') {
                activities = ['true-false', 'thought-translation'];
              } else if (node.id === 'vowels') {
                activities = ['word-scramble', 'drag-drop'];
              } else if (node.id === 'consonants') {
                activities = ['word-scramble'];
              } else if ((allReqs.length > 0 || node.type === 'Drill' || node.type === 'Checkpoint') && !activities.includes('word-scramble')) {
                // Ensure nodes with vocab/grammar requirements have word-scramble
                activities = [...new Set([...activities, 'word-scramble'])];
              }

              lastNodeMastery = isMastered ? 1000 : avgScore;

              return { ...node, status: newStatus, activities };
            })
          }));
          const allNodes = newCurriculums.flatMap(l => l.nodes);
          const firstActive = allNodes.find(n => n.status === 'active')?.id || state.currentPositionNodeId;

          return { curriculums: newCurriculums, currentPositionNodeId: firstActive };
        });
      },

      completeNode: (nodeId) => {
        set((state) => ({
          completedNodeIds: [...new Set([...state.completedNodeIds, nodeId])]
        }));
        get().refreshCurriculumStatus();
        get().chargeGrid();
        void get().syncToCloud();
      },

      checkNodeReadiness: (nodeId) => {
        return get().getNodeReadinessPercentage(nodeId) >= 100;
      },

      getNodeReadinessPercentage: (nodeId) => {
        const { vocabulary, curriculums, completedActivities } = get();
        const node = curriculums.flatMap(l => l.nodes).find(n => n.id === nodeId);
        if (!node) return 0;

        const allReqs = [...node.requiredVocabIds, ...node.requiredGrammarIds];
        const words = vocabulary.filter(v => allReqs.includes(v.id) || allReqs.includes(v.word));

        const pillars = words.filter(v => v.weight === 'pillar');
        const working = words.filter(v => v.weight === 'working');

        const getStatusWeight = (status: string) => {
          switch(status) {
            case 'mastered': return 10;
            case 'confident': return 10;
            case 'practicing': return 5;
            case 'introduced': return 2;
            default: return 0;
          }
        };

        let currentPoints = 0;
        let maxPoints = 0;

        pillars.forEach(v => {
          maxPoints += 20; // 2 * 10
          currentPoints += 2 * getStatusWeight(v.status);
        });

        working.forEach(v => {
          maxPoints += 10; // 1 * 10
          currentPoints += 1 * getStatusWeight(v.status);
        });

        let basePercentage = 0;
        if (maxPoints > 0) {
          basePercentage = (currentPoints / maxPoints) * 100;
        } else {
          basePercentage = node.status === 'mastered' ? 100 : 0;
        }

        const nodeActivities = node.activities || [];
        let activityBonus = 0;
        if (nodeActivities.length > 0) {
          const completions = completedActivities[nodeId] || [];
          const slicePerActivity = 30 / nodeActivities.length;

          nodeActivities.forEach(actId => {
            const record = completions.find(c => c.id === actId);
            if (record) {
              if (record.stats) {
                // Award based on accuracy: (score/total) * slice
                const accuracy = record.stats.total > 0 ? (record.stats.score / record.stats.total) : 1;
                activityBonus += accuracy * slicePerActivity;
              } else {
                activityBonus += slicePerActivity;
              }
            }
          });
        }
        
        return Math.min(100, Math.round(basePercentage * 0.7 + activityBonus));
      },

      recordActivityCompletion: (nodeId, activityId, stats) => {
        set((state) => {
          const current = state.completedActivities[nodeId] || [];
          const existingIdx = current.findIndex(a => a.id === activityId);
          
          let updated;
          if (existingIdx !== -1) {
            updated = [...current];
            const prev = updated[existingIdx];
            const newAccuracy = stats ? (stats.score / stats.total) : 1;
            const oldAccuracy = prev.stats ? (prev.stats.score / prev.stats.total) : (prev ? 1 : 0);
            
            if (newAccuracy >= oldAccuracy) {
              updated[existingIdx] = { id: activityId, stats };
            }
          } else {
            updated = [...current, { id: activityId, stats }];
          }

          const newState = {
            completedActivities: {
              ...state.completedActivities,
              [nodeId]: updated
            }
          };

          if (stats) {
            const insightEntry = {
              label: activityId.toUpperCase().replace('-', ' '),
              change: Math.round(stats.score),
              timestamp: new Date().toISOString()
            };
            (newState as any).masteryHistory = [insightEntry, ...(state.masteryHistory || [])].slice(0, 50);
          }

          return newState;
        });
        get().refreshCurriculumStatus();
        void get().syncToCloud();
      },

      setActiveActivity: (act) => set({ activeActivity: act }),

      recordInsight: (label, change) => set(state => ({
        masteryHistory: [{ label, change, timestamp: new Date().toISOString() }, ...(state.masteryHistory || [])].slice(0, 50)
      })),

      applyScoreUpdate: (nodeId, points, context) => {
        const now = new Date().toISOString();
        set((state) => {
          const vocab = state.vocabulary.map((w) => {
            if (w.id !== nodeId && w.word.toLowerCase() !== nodeId.toLowerCase()) return w;
            
            // Distribute points across roles while maintaining balance
            const perRole = Math.floor(points / 3);
            const remainder = points % 3;
            const updatedMatrix = { ...w.roleMatrix };
            
            updatedMatrix.noun = clamp(updatedMatrix.noun + perRole + (remainder > 0 ? 1 : 0), 0, 333);
            updatedMatrix.verb = clamp(updatedMatrix.verb + perRole + (remainder > 1 ? 1 : 0), 0, 333);
            updatedMatrix.mod = clamp(updatedMatrix.mod + perRole, 0, 333);
            
            const newScore = Object.values(updatedMatrix).reduce((a, b) => a + b, 0);
            const actualPoints = newScore - w.baseScore;
            const historyEntry = { date: now, change: actualPoints, reason: context };
            
            const recentDrops = [historyEntry, ...(w.scoreHistory || [])]
              .filter(h => h.change < 0 && (new Date(now).getTime() - new Date(h.date).getTime() < 48 * 3600000));
            const totalDrop = Math.abs(recentDrops.reduce((acc, h) => acc + h.change, 0));
            const isBleeding = totalDrop > 50;

            return {
              ...w,
              roleMatrix: updatedMatrix,
              baseScore: newScore,
              confidenceScore: newScore,
              status: scoreToStatus(newScore),
              lastReviewed: now,
              scoreHistory: [historyEntry, ...(w.scoreHistory || [])].slice(0, 5),
              useCount: w.useCount + 1,
              isBleeding
            };
          });

          const insightEntry = {
            label: nodeId.toUpperCase(),
            change: points,
            timestamp: now
          };

          return {
            vocabulary: vocab,
            masteryHistory: [insightEntry, ...(state.masteryHistory || [])].slice(0, 50)
          };
        });
        get().refreshCurriculumStatus();
        get().recordActivity();
        void get().syncToCloud();
      },

      chargeGrid: () => {
        const until = new Date();
        until.setHours(until.getHours() + 24);
        set({ gridChargeUntil: until.toISOString() });
        void get().syncToCloud();
      },

      calculateDecay: () => {
        const now = new Date();
        const chargeUntil = get().gridChargeUntil;
        if (chargeUntil && now < new Date(chargeUntil)) {
          console.log("Decay frozen: Grid is charged.");
          return;
        }

        const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            const last = new Date(w.lastReviewed || 0).getTime();
            if (now.getTime() - last <= FORTY_EIGHT_HOURS) return w;

            let updatedMatrix = { ...w.roleMatrix };
            let totalDecay = 0;

            (['noun', 'verb', 'mod'] as const).forEach(role => {
              if (updatedMatrix[role] < 950) {
                const prev = updatedMatrix[role];
                updatedMatrix[role] = Math.max(0, prev - 5); // Decay 5 points per role if not hardened
                totalDecay += (prev - updatedMatrix[role]);
              }
            });

            if (totalDecay === 0) return w;

            const newScore = Object.values(updatedMatrix).reduce((a, b) => a + b, 0);
            const history = [{ date: now.toISOString(), change: -totalDecay, reason: 'neural_decay' }, ...(w.scoreHistory || [])].slice(0, 5);
            
            return {
              ...w,
              roleMatrix: updatedMatrix,
              baseScore: newScore,
              status: scoreToStatus(newScore),
              scoreHistory: history,
              isBleeding: totalDecay > 10
            };
          })
        }));
        void get().syncToCloud();
      },

      hardenWord: async (wordId) => {
        set(state => ({
          vocabulary: state.vocabulary.map(w => (w.id === wordId || w.word === wordId) ? { 
            ...w, 
            hardened: true, 
            baseScore: 1000, 
            status: 'mastered',
            roleMatrix: { noun: 334, verb: 333, mod: 333 } 
          } : w)
        }));
        get().awardBadge('first_hardened');
        await get().syncToCloud();
      },

      clearAllSavedPhrases: async () => {
        set({ savedPhrases: [] });
        await get().syncToCloud();
      },

      checkAssessments: (onTrigger) => {
        const { vocabulary } = get();
        const candidates = vocabulary.filter(w => w.baseScore >= 500 && w.status !== 'mastered' && !w.hardened);
        if (candidates.length > 0) {
          onTrigger(candidates[0]);
        }
      },

      applyScoreDeltas: (deltas) => {
        const now = new Date().toISOString();
        const { xpMultiplier, pendingComebackBonus } = get();
        let comebackApplied = false;
        let sessionXPChange = 0;

        set((state) => {
          const updatedVocab = state.vocabulary.map((w, idx) => {
            const d = deltas.find(
              (delta) =>
                delta.wordId === w.id ||
                delta.wordId.toLowerCase() === w.word.toLowerCase()
            );
            if (!d) return w;
            
            const multiplier = WORD_FREQUENCY[w.word.toLowerCase()] ?? 1.0;
            let effectiveDelta = d.delta * multiplier;
            
            if (effectiveDelta > 0) {
              effectiveDelta *= xpMultiplier;
            }

            if (pendingComebackBonus && !comebackApplied) {
               effectiveDelta += 100;
               comebackApplied = true;
            }

            const targetRole = d.role || (w.partOfSpeech.toLowerCase().includes('verb') ? 'verb' : (w.partOfSpeech.toLowerCase().includes('adj') ? 'mod' : 'noun')) as keyof RoleMatrix;
            
            // NODE LOCKING: Role cannot gain points if > 100 ahead of lowest
            const lowestRoleScore = Math.min(w.roleMatrix.noun, w.roleMatrix.verb, w.roleMatrix.mod);
            if (effectiveDelta > 0 && w.roleMatrix[targetRole] >= lowestRoleScore + 100) {
              console.log(`Node Locked: ${w.word} ${targetRole} is too far ahead.`);
              effectiveDelta = 0;
            }

            const updatedMatrix = { ...w.roleMatrix };
            updatedMatrix[targetRole] = clamp(updatedMatrix[targetRole] + effectiveDelta, 0, 334);
            const newScore = Object.values(updatedMatrix).reduce((a, b) => a + b, 0);
            
            sessionXPChange += effectiveDelta;

            const historyReason = (pendingComebackBonus && idx === 0) ? 'neural_resonance + comeback_bonus' : 'neural_resonance';
            
            const newStatus = scoreToStatus(newScore);
            if (newStatus === 'mastered' && w.status !== 'mastered') {
               setTimeout(() => get().awardBadge('first_master'), 0);
            }

            return {
              ...w,
              roleMatrix: updatedMatrix,
              baseScore: newScore,
              status: newStatus,
              useCount: (w.useCount ?? 0) + 1,
              lastReviewed: now,
              scoreHistory: [{ date: now, change: effectiveDelta, reason: historyReason }, ...(w.scoreHistory || [])].slice(0, 5)
            };
          });

          const insightEntry = {
            label: deltas.length === 1 ? deltas[0].wordId.toUpperCase() : "SESSION SYNC",
            change: Math.round(sessionXPChange),
            timestamp: now
          };

          return {
            vocabulary: updatedVocab,
            totalXP: state.totalXP + Math.round(sessionXPChange),
            masteryHistory: [insightEntry, ...(state.masteryHistory || [])].slice(0, 50),
            pendingComebackBonus: false
          };
        });

        if (comebackApplied) get().awardBadge('comeback');
        get().refreshCurriculumStatus();
        get().recordActivity();
        void get().syncToCloud();
      },

      updateVocabStatus: (wordIdOrText, role, points) => {
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordIdOrText && w.word.toLowerCase() !== wordIdOrText.toLowerCase()) return w;
            
            let effectivePoints = points;
            const lowestRoleScore = Math.min(w.roleMatrix.noun, w.roleMatrix.verb, w.roleMatrix.mod);
            if (effectivePoints > 0 && w.roleMatrix[role] >= lowestRoleScore + 100) {
              console.log(`Node Locked: ${w.word} ${role} is too far ahead.`);
              effectivePoints = 0;
            }

            const updatedMatrix = { ...w.roleMatrix };
            updatedMatrix[role] = clamp(updatedMatrix[role] + effectivePoints, 0, 334);
            const newScore = Object.values(updatedMatrix).reduce((a, b) => a + b, 0);

            return { 
              ...w, 
              roleMatrix: updatedMatrix,
              baseScore: newScore, 
              status: scoreToStatus(newScore),
              lastReviewed: now,
              scoreHistory: [{ date: now, change: effectivePoints, reason: 'neural_override' }, ...(w.scoreHistory || [])].slice(0, 5)
            };
          }),
        }));
        get().refreshCurriculumStatus();
        get().recordActivity();
        void get().syncToCloud();
      },

      cycleWordStatus: (wordId) => {
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId) return w;
            const currentIndex = STATUS_ORDER.indexOf(w.status);
            const nextStatus = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];
            const targetScore = STATUS_MIDPOINT[nextStatus];
            
            // Force balance roles to targetScore
            const perRole = Math.floor(targetScore / 3);
            const remainder = targetScore % 3;
            const updatedMatrix = {
              noun: perRole + (remainder > 0 ? 1 : 0),
              verb: perRole + (remainder > 1 ? 1 : 0),
              mod: perRole
            };

            const diff = targetScore - (w.baseScore || 0);
            return { 
              ...w, 
              roleMatrix: updatedMatrix,
              baseScore: targetScore, 
              confidenceScore: targetScore, 
              status: nextStatus,
              lastReviewed: now,
              scoreHistory: [{ date: now, change: diff, reason: 'status_cycle' }, ...(w.scoreHistory || [])].slice(0, 5)
            };
          }),
        }));
        get().refreshCurriculumStatus();
        get().recordActivity();
        void get().syncToCloud();
      },

      updateNodeStatus: (nodeId, status) => {
        set((state) => ({
          curriculums: state.curriculums.map(l => ({
            ...l,
            nodes: l.nodes.map(n => n.id === nodeId ? { ...n, status } : n)
          }))
        }));
        void get().syncToCloud();
      },

      savePhrase: (phrase) => {
        set((state) => {
          const key = typeof phrase === 'string' ? phrase : phrase.tp;
          const already = state.savedPhrases.some(p =>
            typeof p === 'string' ? p === key : p.tp === key
          );
          if (already) return state;
          return { savedPhrases: [...state.savedPhrases, phrase] };
        });
        get().progressChallenge(1, 'phrase_save');
        void get().syncToCloud();
      },

      recordActivity: () => {
        const today = new Date().toDateString();
        const lastDate = get().lastActiveDate;
        
        let newStreak = get().currentStreak;
        let streakChanged = false;

        if (lastDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastDate === yesterday.toDateString()) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          streakChanged = true;
          set({ currentStreak: newStreak, lastActiveDate: today });
        }

        if (streakChanged) {
          const summary = get().getStatusSummary();
          const totalLearned = summary.introduced + summary.practicing + summary.confident + summary.mastered;
          const snapshot = {
            date: today,
            xp: summary.xp,
            totalLearned,
            streak: newStreak
          };
          
          set(state => ({
            profile: {
              ...state.profile,
              history: [...(state.profile.history || []), snapshot]
            }
          }));
        }
      },

      recordLearningDay: (date) => {
        set((state) => {
          if (state.learningDays.includes(date)) return state;
          return { learningDays: [...state.learningDays, date] };
        });
        void get().syncToCloud();
      },
      runMorningStreakCheck: () => {
        const today = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        let wasActiveYesterday = false;

        set((state) => {
          if (state.lastStreakCheck === today) {
            wasActiveYesterday = state.learningDays.includes(yesterday);
            return state; // Already checked today
          }

          wasActiveYesterday = state.learningDays.includes(yesterday);
          let newStreak = state.currentStreak;
          let newShields = state.streakShields;
          let newLastStreakMilestone = state.lastStreakMilestone;
          let newPendingComebackBonus = state.pendingComebackBonus;
          let shieldWasUsed = false;

          if (wasActiveYesterday) {
            newStreak += 1;
            
            // Award shield every 7 days
            if (newStreak > 0 && newStreak % 7 === 0 && newStreak > newLastStreakMilestone) {
              if (newShields < 2) newShields += 1;
              newLastStreakMilestone = newStreak;
            }
          } else {
            // Missed a day
            if (newShields > 0) {
              newShields -= 1;
              shieldWasUsed = true;
              // Streak maintained by shield
            } else {
              // Comeback bonus check
              if (newStreak >= 3) {
                newPendingComebackBonus = true;
              }
              newStreak = 0;
            }
          }

          // Recalculate Multiplier
          let newMultiplier = 1.0;
          if (newStreak >= 30) newMultiplier = 1.75;
          else if (newStreak >= 14) newMultiplier = 1.50;
          else if (newStreak >= 7) newMultiplier = 1.25;
          else if (newStreak >= 3) newMultiplier = 1.10;

          return { 
            lastStreakCheck: today, 
            currentStreak: newStreak,
            streakShields: newShields,
            lastStreakMilestone: newLastStreakMilestone,
            xpMultiplier: newMultiplier,
            pendingComebackBonus: newPendingComebackBonus
          };
        });
        get().generateWeeklyChallenge();
        void get().syncToCloud();
        return wasActiveYesterday;
      },
      recordWordOutcome: (wordId, outcome, date) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId && w.word.toLowerCase() !== wordId.toLowerCase()) return w;
            const recentPerformance = [{ date, outcome }, ...(w.recentPerformance || [])].slice(0, 10);
            return { ...w, recentPerformance };
          })
        }));
        void get().syncToCloud();
      },
      getRegressionCandidates: (windowDays) => {
        const { vocabulary } = get();
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - windowDays);
        const limitTime = limitDate.getTime();

        const candidates: { word: string, ratio: number }[] = [];

        vocabulary.forEach(w => {
          if (!w.recentPerformance) return;
          const windowEntries = w.recentPerformance.filter(e => new Date(e.date).getTime() >= limitTime);
          if (windowEntries.length === 0) return;

          const struggledCount = windowEntries.filter(e => e.outcome === 'struggled').length;
          const correctCount = windowEntries.filter(e => e.outcome === 'correct').length;

          if (struggledCount > correctCount) {
            candidates.push({ word: w.word, ratio: struggledCount / windowEntries.length });
          }
        });

        return candidates.sort((a, b) => b.ratio - a.ratio).map(c => c.word);
      },
      recordConfusion: (wordA, wordB) => {
        set((state) => {
          const pairs = [...state.confusionPairs];
          const a = wordA.toLowerCase();
          const b = wordB.toLowerCase();
          const existing = pairs.find(p => 
            (p.wordA.toLowerCase() === a && p.wordB.toLowerCase() === b) || 
            (p.wordA.toLowerCase() === b && p.wordB.toLowerCase() === a)
          );
          if (existing) {
            existing.count += 1;
          } else {
            pairs.push({ wordA, wordB, count: 1 });
          }
          return { confusionPairs: pairs };
        });
        void get().syncToCloud();
      },
      getTopConfusionPairs: (limit) => {
        const pairs = [...get().confusionPairs];
        return pairs.sort((a, b) => b.count - a.count).slice(0, limit);
      },
      completeIntroduction: (introId) => {
        set((state) => ({
          seenIntroductions: [...new Set([...state.seenIntroductions, introId])]
        }));
        void get().syncToCloud();
      },
      updateProductionStatus: (wordId, status) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId && w.word.toLowerCase() !== wordId.toLowerCase()) return w;
            return { ...w, productionStatus: status };
          })
        }));
        void get().syncToCloud();
      },
      updateRecognitionStatus: (wordId, status) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId && w.word.toLowerCase() !== wordId.toLowerCase()) return w;
            return { ...w, recognitionStatus: status };
          })
        }));
        void get().syncToCloud();
      },
      addProveItResponse: (entry) => {
        set((state) => {
          const total = state.totalProveItSubmitted + 1;
          if (total === 5) {
            // awardBadge will handle firestore sync
            setTimeout(() => get().awardBadge('prove_it_5'), 0);
          }
          return { 
            pendingProveItResponses: [...state.pendingProveItResponses, entry],
            totalProveItSubmitted: total
          };
        });
        get().progressChallenge(1, 'prove_it_usage', entry.word);
        void get().syncToCloud();
      },
      awardBadge: (badgeId) => {
        const badge = ALL_BADGES.find(b => b.id === badgeId);
        if (!badge) return;

        set((state) => {
          if (state.earnedBadges.some(b => b.id === badgeId)) return state;
          const newBadge = { ...badge, earnedDate: new Date().toISOString() };
          return { earnedBadges: [...state.earnedBadges, newBadge] };
        });
        void get().syncToCloud();
      },
      checkAndAwardRanks: () => {
        const summary = get().getStatusSummary();
        const { vocabulary, curriculums, currentStreak, earnedCeremonialRanks, lastSmallRankTitle } = get();
        const today = new Date().toISOString();

        // 1. Small Rank
        const currentSmallRank = [...SMALL_RANKS].reverse().find(r => summary.xp >= r.xpThreshold) || SMALL_RANKS[0];
        
        // 2. Ceremonial Ranks
        const newlyEarned: CeremonialRank[] = [];
        
        const checkRank = (id: string, condition: boolean) => {
          if (earnedCeremonialRanks.some(r => r.id === id)) return;
          if (condition) {
            const rank = CEREMONIAL_RANKS.find(r => r.id === id);
            if (rank) newlyEarned.push({ ...rank, achievedDate: today });
          }
        };

        checkRank('initiate', vocabulary.filter(w => w.status === 'mastered').length >= 10);
        checkRank('speaker', vocabulary.filter(w => w.status === 'confident' || w.status === 'mastered').length >= 25);
        
        const ch12Mastered = curriculums
          .filter(c => c.id === 'book_1' || c.id === 'book_2') // Assuming Book 1 & 2 are Chapter 1 & 2
          .every(c => c.nodes.every(n => n.status === 'mastered'));
        checkRank('grammarian', ch12Mastered);
        
        checkRank('sewi_speaker', vocabulary.filter(w => w.status === 'confident' || w.status === 'mastered').length >= 50);
        checkRank('consistent', currentStreak >= 30);
        checkRank('toki_pona_lon', vocabulary.filter(w => w.status === 'confident' || w.status === 'mastered').length >= 137);
        checkRank('jan_sonja', vocabulary.filter(w => w.status === 'mastered').length >= 137);

        // Badges related to ranks
        if (vocabulary.some(w => w.status === 'mastered')) get().awardBadge('first_master');
        if (vocabulary.filter(w => w.status === 'mastered').length >= 10) get().awardBadge('ten_masters');
        if (currentStreak >= 7) get().awardBadge('streak_7');
        if (currentStreak >= 14) get().awardBadge('streak_14');
        if (currentStreak >= 30) get().awardBadge('streak_30');
        if (currentStreak >= 60) get().awardBadge('streak_60');
        if (currentStreak >= 100) get().awardBadge('streak_100');
        if (vocabulary.filter(w => w.status === 'mastered').length >= 137) get().awardBadge('jan_sonja_badge');

        set((state) => {
          const updates: Partial<MasteryState> = {};
          if (newlyEarned.length > 0) {
            updates.earnedCeremonialRanks = [...state.earnedCeremonialRanks, ...newlyEarned];
            updates.newRankUnlocked = newlyEarned[0];
            updates.pendingRankAcknowledgement = newlyEarned[0].title;
          } else if (currentSmallRank.title !== lastSmallRankTitle) {
            updates.newRankUnlocked = currentSmallRank;
            updates.lastSmallRankTitle = currentSmallRank.title;
          }
          return updates;
        });

        void get().syncToCloud();
      },
      clearNewRankUnlocked: () => {
        set({ newRankUnlocked: null });
      },
      updateSessionXPRecord: (xp) => {
        if (xp > get().sessionXPRecord) {
          set({ sessionXPRecord: xp });
          void get().syncToCloud();
        }
      },
      clearProveItResponses: () => {
        set({ pendingProveItResponses: [] });
        void get().syncToCloud();
      },
      setPinnedExample: (wordId, example) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId && w.word.toLowerCase() !== wordId.toLowerCase()) return w;
            return { ...w, pinnedExample: example };
          })
        }));
        void get().syncToCloud();
      },
      markRoleMastered: (wordId, role) => {
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId && w.word.toLowerCase() !== wordId.toLowerCase()) return w;
            
            const rolesMastered = { ...w.rolesMastered, [role]: true };
            const masteredCount = Object.values(rolesMastered).filter(Boolean).length;
            
            let extraBonus = 0;
            let bonusReason = "";

            if (masteredCount >= 2 && !w.rolesMastered[role]) {
              // One-time bonus for 2+ roles
              const alreadyHad2 = Object.values(w.rolesMastered).filter(Boolean).length >= 2;
              if (!alreadyHad2) {
                extraBonus += 50;
                bonusReason = `Role mastery bonus: ${role} confirmed (2+ roles)`;
              }
            }

            // Check if all roles are mastered
            const allRolesDefined = w.roles.map(r => r.role);
            const allMastered = allRolesDefined.every(r => rolesMastered[r]);
            const wasAllMastered = allRolesDefined.every(r => w.rolesMastered[r]);
            
            if (allMastered && !wasAllMastered && allRolesDefined.length > 0) {
              extraBonus += 100;
              bonusReason = bonusReason ? bonusReason + " + Full Role Mastery" : `Full Role Mastery: ${wordId}`;
              setTimeout(() => get().awardBadge('full_roles'), 0);
              // Note: No specific challenge for markRoleMastered mentioned in Prompt C wiring list, 
              // but I'll keep the previous progressChallenge if it fits. 
              // Actually Prompt C says "Achieved full role mastery on any word" badge, 
              // but doesn't list a weekly challenge for it.
              // I will remove the generic progressChallenge(1) I added earlier.
            }

            if (extraBonus > 0) {
              const newScore = clamp((w.baseScore ?? 0) + extraBonus, 0, 1000);
              return {
                ...w,
                rolesMastered,
                baseScore: newScore,
                confidenceScore: newScore,
                status: scoreToStatus(newScore),
                scoreHistory: [{ date: now, change: extraBonus, reason: bonusReason }, ...(w.scoreHistory || [])].slice(0, 5)
              };
            }

            return { ...w, rolesMastered };
          })
        }));
        void get().syncToCloud();
      },

      resetLearningProgress: async () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(v => ({ 
            ...v, 
            baseScore: 0, 
            confidenceScore: 0, 
            status: 'not_started' as MasteryStatus,
            useCount: 0,
            scoreHistory: [],
            rolesMastered: {},
            hardened: false,
            isBleeding: false,
            recentPerformance: [],
            productionStatus: undefined,
            recognitionStatus: undefined,
            pinnedExample: undefined
          })),
          curriculums: curriculumRoadmap,
          activeCurriculumId: null,
          activeModuleId: null,
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          currentPositionNodeId: 'phi_sim',
          earnedBadges: [],
          earnedCeremonialRanks: [],
          newRankUnlocked: null,
          lastSmallRankTitle: 'jan lili',
          sessionXPRecord: 0,
          xpMultiplier: 1.0,
          streakShields: 0,
          lastStreakMilestone: 0,
          pendingComebackBonus: false,
          learningDays: [],
          completedNodeIds: [],
          seenIntroductions: [],
          confusionPairs: [],
          sessionLog: [],
          currentChallenge: null,
          completedChallenges: [],
          pendingRankAcknowledgement: null,
          lastStreakCheck: '',
          pendingProveItResponses: [],
          totalProveItSubmitted: 0,
          completedActivities: {},
          masteryHistory: []
        }));
        localStorage.setItem('tp_sandbox_mode', 'false');
        get().refreshCurriculumStatus();
        await get().syncToCloud(undefined, false, true);
      },

      startSessionTimer: () => set({ sessionStartTime: new Date().toISOString() }),
      
      commitSessionLog: (entry) => {
        const id = crypto.randomUUID();
        const startTime = get().sessionStartTime;
        const now = new Date();
        const start = startTime ? new Date(startTime) : now;
        const durationMinutes = Math.round((now.getTime() - start.getTime()) / 60000);

        set(state => ({
          sessionLog: [{ ...entry, id, durationMinutes }, ...state.sessionLog].slice(0, 100)
        }));
        void get().syncToCloud();
      },

      generateWeeklyChallenge: () => {
        const now = new Date();
        const day = now.getDay(); // 0 (Sun) to 6 (Sat)
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(now.setDate(diff));
        monday.setHours(0,0,0,0);
        const weekStartDate = monday.toISOString().split('T')[0];

        const { currentChallenge, vocabulary } = get();
        if (currentChallenge && currentChallenge.weekStartDate === weekStartDate) return;

        if (currentChallenge && new Date(currentChallenge.expiresDate) < new Date()) {
           set(state => ({ completedChallenges: [currentChallenge, ...state.completedChallenges] }));
        }

        const templates: { type: WeeklyChallenge['type'], title: string, description: string, targetCount: number, xpReward: number }[] = [
          {
            type: 'word_usage',
            title: "Use [word] in 3 different sentences",
            description: "Show jan Lina you can use [word] as a noun, verb, and modifier.",
            targetCount: 3, xpReward: 150
          },
          {
            type: 'session_count',
            title: "Complete 3 sessions this week",
            description: "Show up three times. Consistency beats intensity.",
            targetCount: 3, xpReward: 200
          },
          {
            type: 'word_progression',
            title: "Get any word from Introduced to Practicing",
            description: "Push a new word deeper into your memory.",
            targetCount: 1, xpReward: 175
          },
          {
            type: 'prove_it_usage',
            title: "Use [word] correctly in a Prove It drill",
            description: "Submit a Prove It sentence using [word] and have jan Lina confirm it.",
            targetCount: 1, xpReward: 125
          },
          {
            type: 'convo_length',
            title: "Have a 10-message conversation with jan Lina",
            description: "Go deep. Ten messages back and forth in one session.",
            targetCount: 10, xpReward: 225
          },
          {
            type: 'phrase_save',
            title: "Save 2 new phrases to The Archive",
            description: "Build your personal phrase library.",
            targetCount: 2, xpReward: 100
          },
        ];

        const template = templates[Math.floor(Math.random() * templates.length)];
        const candidates = vocabulary.filter(w => w.status === 'introduced' || w.status === 'practicing');
        const randomWord = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)].word : 'toki';
        
        const expires = new Date(monday);
        expires.setDate(expires.getDate() + 6);
        expires.setHours(23, 59, 59, 999);

        const newChallenge: WeeklyChallenge = {
          id: crypto.randomUUID(),
          type: template.type,
          weekStartDate,
          title: template.title.replace('[word]', randomWord),
          description: template.description.replace('[word]', randomWord),
          targetWord: randomWord,
          targetCount: template.targetCount,
          currentCount: 0,
          completed: false,
          xpReward: template.xpReward,
          expiresDate: expires.toISOString()
        };

        set({ currentChallenge: newChallenge });
        void get().syncToCloud();
      },

      progressChallenge: (amount = 1, type?: WeeklyChallenge['type'], wordId?: string) => {
        const { currentChallenge, vocabulary } = get();
        if (!currentChallenge || currentChallenge.completed) return;

        // If type is specified, only progress if it matches
        if (type && currentChallenge.type !== type) return;
        
        // If targetWord is specified for the challenge, check if it matches
        if (currentChallenge.targetWord && wordId && currentChallenge.targetWord.toLowerCase() !== wordId.toLowerCase()) return;

        const newCount = Math.min(currentChallenge.currentCount + amount, currentChallenge.targetCount);
        const completed = newCount >= currentChallenge.targetCount;

        set(state => ({
          currentChallenge: state.currentChallenge ? {
            ...state.currentChallenge,
            currentCount: newCount,
            completed
          } : null
        }));

        if (completed) {
          const sorted = [...vocabulary].sort((a,b) => (b.baseScore || 0) - (a.baseScore || 0));
          const bestWord = sorted[0];
          if (bestWord) {
            const now = new Date().toISOString();
            const newScore = Math.min((bestWord.baseScore || 0) + currentChallenge.xpReward, 1000);
            set(state => ({
              vocabulary: state.vocabulary.map(w => w.id === bestWord.id ? {
                ...w,
                baseScore: newScore,
                confidenceScore: newScore,
                status: scoreToStatus(newScore),
                scoreHistory: [{ date: now, change: currentChallenge.xpReward, reason: `Weekly challenge complete: ${currentChallenge.title}` }, ...(w.scoreHistory || [])].slice(0, 5)
              } : w)
            }));
          }
        }
        void get().syncToCloud();
      },

      clearRankAcknowledgement: () => set({ pendingRankAcknowledgement: null }),

      setStudentName: (name) => { set({ studentName: name }); void get().updateProfile({ firstName: name }); },
      updateProfile: async (profileUpdate) => { 
        set((state) => ({ 
          profile: { ...state.profile, ...profileUpdate } 
        })); 
        await get().syncToCloud(); 
      },
      setReviewVibe: async (vibe) => { set({ reviewVibe: vibe }); await get().syncToCloud(); },
      setProfileImage: async (url) => { set({ profileImage: url }); await get().syncToCloud(); },

      updatePhraseNote: async (id, notes) => {
        set((state) => ({
          savedPhrases: state.savedPhrases.map(p => {
            if (typeof p === 'string') return p === id ? { id, tp: p, en: 'Saved Phrase *', notes } : p;
            return p.id === id ? { ...p, notes } : p;
          })
        }));
        await get().syncToCloud();
      },

      resetProgress: () => {
        set({
          vocabulary: mappedVocabulary,
          curriculums: curriculumRoadmap,
          activeCurriculumId: null,
          activeModuleId: null,
          currentPositionNodeId: 'phi_sim',
          completedNodeIds: [],
          completedActivities: {},
          currentStreak: 0,
          lastActiveDate: '',
          lastStreakCheck: '',
          learningDays: [],
          seenIntroductions: [],
          confusionPairs: [],
          sessionLog: [],
          currentChallenge: null,
          completedChallenges: [],
          pendingRankAcknowledgement: null,
          pendingProveItResponses: [],
          totalProveItSubmitted: 0,
          sessionXPRecord: 0,
          masteryHistory: [],
          newRankUnlocked: null,
          lastSmallRankTitle: 'jan lili',
          earnedBadges: [],
          earnedCeremonialRanks: [],
        });
        get().refreshCurriculumStatus();
        void get().syncToCloud();
      },

      deletePhrase: async (id) => {
        set((state) => ({
          savedPhrases: state.savedPhrases.filter(p =>
            typeof p === 'string' ? p !== id : p.id !== id
          )
        }));
        await get().syncToCloud();
      },

      resetAsNewUser: async () => {
        const { userId } = get();
        set({
          studentName: '',
          profile: defaultProfile,
          reviewVibe: null,
          profileImage: '',
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: mappedVocabulary.map(v => ({ ...v, baseScore: 0, confidenceScore: 0, status: 'not_started' as MasteryStatus })),
          curriculums: curriculumRoadmap,
          currentPositionNodeId: 'phi_sim',
          activeCurriculumId: null,
          activeModuleId: null,
          hasCompletedSetup: false,
          songs: defaultSongs,
          commonPhrases: defaultCommonPhrases,
          earnedBadges: [],
          earnedCeremonialRanks: [],
          newRankUnlocked: null,
          lastSmallRankTitle: 'jan lili',
          sessionXPRecord: 0,
          xpMultiplier: 1.0,
          streakShields: 0,
          lastStreakMilestone: 0,
          pendingComebackBonus: false,
          learningDays: [],
          completedNodeIds: [],
          seenIntroductions: [],
          confusionPairs: [],
          sessionLog: [],
          currentChallenge: null,
          completedChallenges: [],
          pendingRankAcknowledgement: null,
          lastStreakCheck: '',
          pendingProveItResponses: [],
          totalProveItSubmitted: 0,
          completedActivities: {}
        });
        localStorage.setItem('tp_sandbox_mode', 'false');
        get().refreshCurriculumStatus();
        if (userId) {
          await get().syncToCloud(userId, false, true);
        }
      },

      resetProfileAndRunSetup: async () => {
        set({
          studentName: '',
          profile: defaultProfile,
          reviewVibe: null,
          profileImage: '',
          curriculums: curriculumRoadmap,
          vocabulary: mappedVocabulary.map(v => ({ ...v, baseScore: 0, confidenceScore: 0, status: 'not_started' as MasteryStatus })),
          currentPositionNodeId: 'phi_sim',
          activeCurriculumId: null,
          activeModuleId: null,
          hasCompletedSetup: false,
          songs: defaultSongs,
          commonPhrases: defaultCommonPhrases,
          earnedBadges: [],
          earnedCeremonialRanks: [],
          newRankUnlocked: null,
          lastSmallRankTitle: 'jan lili',
          sessionXPRecord: 0,
          xpMultiplier: 1.0,
          streakShields: 0,
          lastStreakMilestone: 0,
          pendingComebackBonus: false,
          learningDays: [],
          completedNodeIds: [],
          seenIntroductions: [],
          confusionPairs: [],
          sessionLog: [],
          currentChallenge: null,
          completedChallenges: [],
          pendingRankAcknowledgement: null,
          lastStreakCheck: '',
          pendingProveItResponses: [],
          totalProveItSubmitted: 0,
          completedActivities: {}
        });
        localStorage.setItem('tp_sandbox_mode', 'false');
        get().refreshCurriculumStatus();
        await get().syncToCloud(undefined, false, true);
      },

      randomizeVocab: async () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(w => {
            const score = Math.floor(Math.random() * 1001);
            return { ...w, baseScore: score, confidenceScore: score, status: scoreToStatus(score) };
          }),
          curriculums: state.curriculums.map(level => ({
            ...level,
            nodes: level.nodes.map(node => {
              const rand = Math.random();
              const status = rand > 0.6 ? 'mastered' : (rand > 0.3 ? 'active' : 'locked');
              return { ...node, status };
            })
          }))
        }));
        get().refreshCurriculumStatus();
        await get().syncToCloud();
      },

      masterAllVocab: async () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(w => ({ ...w, baseScore: 975, confidenceScore: 975, status: 'mastered' as MasteryStatus })),
          curriculums: state.curriculums.map(level => ({
            ...level,
            nodes: level.nodes.map(node => ({ ...node, status: 'mastered' as const }))
          }))
        }));
        get().refreshCurriculumStatus();
        await get().syncToCloud();
      },

      clearLocalData: () => {
        set({
          userId: null,
          studentName: '',
          profile: defaultProfile,
          reviewVibe: null,
          profileImage: '',
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: mappedVocabulary,
          curriculums: curriculumRoadmap,
          hasCompletedSetup: false,
          songs: defaultSongs,
          commonPhrases: defaultCommonPhrases,
        });
      },

      setLastUpdated: (date) => set({ lastUpdated: date }),

      setWidgetDensity: (val) => { set({ widgetDensity: val }); void get().syncToCloud(); },
      setFogOfWar: (val) => { set({ fogOfWar: val }); void get().syncToCloud(); },
      setShowCircuitPaths: (val) => { set({ showCircuitPaths: val }); void get().syncToCloud(); },
      setKnowledgeCheckFrequency: async (freq) => { set({ knowledgeCheckFrequency: freq }); await get().syncToCloud(); },
      setLastKnowledgeCheckDate: async (date) => { set({ lastKnowledgeCheckDate: date }); await get().syncToCloud(); },

      setSelectedWords: (words) => set({ selectedWords: words }),
      addWordToSelection: (word) => set((state) => ({ selectedWords: [...state.selectedWords, word] })),
      removeWordFromSelection: (word) => set((state) => {
        const index = state.selectedWords.indexOf(word);
        if (index === -1) return state;
        const newSelected = [...state.selectedWords];
        newSelected.splice(index, 1);
        return { selectedWords: newSelected };
      }),
      toggleWordSelection: (word) => set((state) => {
        const index = state.selectedWords.indexOf(word);
        if (index === -1) {
          return { selectedWords: [...state.selectedWords, word] };
        } else {
          const newSelected = [...state.selectedWords];
          newSelected.splice(index, 1);
          return { selectedWords: newSelected };
        }
      }),

      setLessonFilter: (wordIds) => set({ lessonFilter: wordIds }),

      getStatusSummary: () => {
        const { vocabulary, totalXP } = get();
        const summary = { not_started: 0, introduced: 0, practicing: 0, confident: 0, mastered: 0, xp: totalXP };
        for (const word of vocabulary) {
          summary[word.status]++;
        }
        
        // 100,000 XP scale level calculation
        const level = Math.floor(totalXP / 1000) + 1;
        
        const rank = [...SMALL_RANKS].reverse().find(r => totalXP >= r.xpThreshold) || SMALL_RANKS[0];
        const rankTitle = rank.title;

        return { ...summary, level, rankTitle };
      },

      switchProfile: (name: string) => {
        set({
          studentName: name,
          profile: { ...defaultProfile, firstName: name },
          reviewVibe: null,
          profileImage: '',
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: mappedVocabulary,
          curriculums: curriculumRoadmap,
          hasCompletedSetup: false,
          songs: defaultSongs,
          commonPhrases: defaultCommonPhrases,
          currentPositionNodeId: 'phi_sim',
          activeCurriculumId: null,
          activeModuleId: null,
          isMainProfile: false,
        });
      },

      updateVocabAIContent: (wordId, content) => {
        set((state) => ({
          vocabulary: state.vocabulary.map(v => (v.id === wordId || v.word === wordId) ? { ...v, ...content } : v)
        }));
        void get().syncToCloud();
      },
      updateSessionNotes: (wordId, notes) => {
        set((state) => ({
          vocabulary: state.vocabulary.map(v => (v.id === wordId || v.word === wordId) ? { ...v, sessionNotes: notes } : v)
        }));
        void get().syncToCloud();
      },

      syncToCloud: async (explicitUserId, merge = true, force = false) => {
        const { vocabulary, curriculums, lastUpdated, studentName, profile, profileImage, savedPhrases, currentStreak, lastActiveDate, userId, hasCompletedSetup, currentPositionNodeId, isMainProfile, widgetDensity, fogOfWar, showCircuitPaths, knowledgeCheckFrequency, lastKnowledgeCheckDate, cloudSynced, songs, commonPhrases, lastStreakCheck, learningDays, confusionPairs, pendingProveItResponses,
            earnedCeremonialRanks, lastSmallRankTitle, earnedBadges, totalProveItSubmitted,
            streakShields, xpMultiplier, lastStreakMilestone, pendingComebackBonus, sessionXPRecord,
            sessionLog, currentChallenge, completedChallenges, pendingRankAcknowledgement, newRankUnlocked,
            activeCurriculumId, activeModuleId, selectedWords, lessonFilter,
            completedNodeIds, seenIntroductions, completedActivities, masteryHistory } = get();
        const targetId = explicitUserId || userId;

        // Block premature syncs before cloud data has loaded — prevents stale
        // localStorage data from overwriting Firestore during the auth race window
        if (!cloudSynced && !explicitUserId && !force) return;

        // Prevent sync for guest users and any non-main profile (Sandbox mode)
        // Unless force=true (used for resets)
        if (!targetId || targetId === 'guest_user') return;
        if (!force && (!isMainProfile || localStorage.getItem('tp_sandbox_mode') === 'true')) return;

        try {
          // Strip static content before sending to Firestore
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const partialVocab = vocabulary.map(({ phonetic, syllables, anchor, semanticCluster, connotation, roles, examples, collocations, relatedWordIds, boundaryNotes, etymology, mnemonic, culturalNotes, avoidWhen, ...dynamicData }) => dynamicData);

          // Deep sanitize object to convert undefined -> null for Firestore reliability
          const sanitize = (obj: any): any => {
            if (Array.isArray(obj)) return obj.map(sanitize);
            if (obj !== null && typeof obj === 'object') {
              return Object.entries(obj).reduce((acc, [key, value]) => ({
                ...acc,
                [key]: value === undefined ? null : sanitize(value)
              }), {});
            }
            return obj === undefined ? null : obj;
          };

          await setDoc(doc(db, 'users', targetId), sanitize({
            vocabulary: partialVocab,
            curriculums, lastUpdated, studentName, totalXP, profile, profileImage,
            savedPhrases, currentStreak, lastActiveDate, hasCompletedSetup, currentPositionNodeId, isMainProfile,
            widgetDensity, fogOfWar, showCircuitPaths, knowledgeCheckFrequency, lastKnowledgeCheckDate, gridChargeUntil, songs, commonPhrases,
            lastStreakCheck, learningDays, completedNodeIds, seenIntroductions, confusionPairs, pendingProveItResponses,
            earnedCeremonialRanks, lastSmallRankTitle, earnedBadges, totalProveItSubmitted,
            streakShields, xpMultiplier, lastStreakMilestone, pendingComebackBonus, sessionXPRecord,
            sessionLog, currentChallenge, completedChallenges, pendingRankAcknowledgement, newRankUnlocked,
            activeCurriculumId, activeModuleId, selectedWords, lessonFilter, completedActivities, masteryHistory
          }), { merge });
        } catch (err) {
          console.error('Firebase Sync Error:', err);
        }
      },

      syncFromCloud: async (uid: string, initialName?: string, initialProfileImage?: string) => {
        set({ userId: uid, cloudSynced: false });
        if (uid === 'guest_user') return;
        
        const userDocRef = doc(db, 'users', uid);
        
        try {
          const docSnap = await getDoc(userDocRef);
          
          if (!docSnap.exists()) {
            const localName = get().studentName;
            const isOtherUsersData = initialName && localName &&
              localName !== '' &&
              localName.toLowerCase() !== initialName.toLowerCase();

            if (isOtherUsersData) {
              // Local data belongs to a different user — start fresh for this account
              set({
                studentName: initialName,
                profile: { ...defaultProfile, firstName: initialName },
                reviewVibe: null,
                profileImage: initialProfileImage || '',
                savedPhrases: [],
                currentStreak: 0,
                lastActiveDate: '',
                vocabulary: mappedVocabulary,
                curriculums: curriculumRoadmap,
                currentPositionNodeId: 'phi_sim',
          activeCurriculumId: null,
          activeModuleId: null,
                hasCompletedSetup: false,
                songs: defaultSongs,
                commonPhrases: defaultCommonPhrases,
              });
            } else {
              if (initialName && (localName === '' || !localName)) {
                set({ studentName: initialName });
                get().updateProfile({ firstName: initialName });
              }
              if (initialProfileImage && !get().profileImage) {
                set({ profileImage: initialProfileImage });
              }
              const { vocabulary } = get();
              const isFresh = vocabulary.every(w => w.status === 'not_started');
              if (!isFresh) {
                await get().syncToCloud(uid);
              }
            }
          }
        } catch (err) {
          console.error('Error checking for migration:', err);
        } finally {
          // Unblock syncToCloud now that the initial Firestore check is complete
          set({ cloudSynced: true });
        }

        return onSnapshot(userDocRef, (snapshot) => {
          if (!snapshot.exists()) return;
          const data = snapshot.data();

          // Detect contaminated cloud data: a different name + all vocab mastered
          // indicates test/debug data was accidentally synced to this account
          const cloudName = data.studentName as string | undefined;
          const allVocabMastered = Array.isArray(data.vocabulary) &&
            data.vocabulary.length > 0 &&
            (data.vocabulary as Array<{ status: MasteryStatus }>).every((w) => w.status === 'mastered');
          const nameMismatch = initialName && cloudName &&
            cloudName.toLowerCase() !== initialName.toLowerCase();

          if (nameMismatch && allVocabMastered) {
            set({
              studentName: initialName,
              profile: { ...defaultProfile, firstName: initialName },
              profileImage: initialProfileImage || '',
              savedPhrases: [],
              currentStreak: 0,
              lastActiveDate: '',
              vocabulary: mappedVocabulary,
              curriculums: curriculumRoadmap,
              currentPositionNodeId: 'phi_sim',
          activeCurriculumId: null,
          activeModuleId: null,
              hasCompletedSetup: false,
              songs: defaultSongs,
              commonPhrases: defaultCommonPhrases,
              cloudSynced: true,
            });
            void get().syncToCloud(uid);
            return;
          }

          const vocabulary = (data.vocabulary || mappedVocabulary).map(
            (w: { word?: string; useCount?: number; frequencyRank?: number; type?: string; status?: MasteryStatus; [key: string]: unknown }) => {
              const base = mappedVocabulary.find(iv => iv.word === w.word);
              const staticData = vocabContent[w.word || ''] || {};
              const wordLower = (w.word || '').toLowerCase();
              const aiData = (aiVocabCache as Record<string, any>)[wordLower] || {};
              const useCount = typeof w.useCount === 'number' ? w.useCount : 0;
              const frequencyRank = typeof w.frequencyRank === 'number' ? w.frequencyRank : (base?.frequencyRank ?? 999);
              const type = w.type || (base?.type ?? 'word');
              const weight = w.weight || base?.weight;
              
              let sessionNotes = w.sessionNotes || '';
              let meanings = w.meanings || (base?.meanings ?? '');

              // DATA MIGRATION: If meanings is missing/generic and sessionNotes contains definition-like text
              if ((!meanings || meanings === '') && sessionNotes.includes('.')) {
                const parts = sessionNotes.split('.');
                const firstPart = parts[0].trim();
                // Check if the first part looks like a dictionary definition (no "Study Session" or "Learning" keywords)
                if (!firstPart.match(/session|improvement|accuracy|mastery|learned/i)) {
                   meanings = firstPart;
                   sessionNotes = parts.slice(1).join('.').trim();
                }
              }

              // Handle Migration to baseScore (0-1000)
              let baseScore = (w.baseScore as number);
              if (baseScore === undefined) {
                // If we only have confidenceScore (0-500), map it
                if (typeof w.confidenceScore === 'number') {
                  baseScore = w.confidenceScore * 2;
                } else {
                  baseScore = STATUS_MIDPOINT[w.status as MasteryStatus || 'not_started'];
                }
              }

              const roleMatrix = (w.roleMatrix as RoleMatrix) || { noun: Math.floor(baseScore / 3), verb: Math.floor(baseScore / 3), mod: Math.floor(baseScore / 3) };

              return {
                ...w,
                baseScore,
                roleMatrix,
                useCount,
                frequencyRank,
                type,
                weight,
                meanings,
                sessionNotes,
                aiExplanation: (w.aiExplanation as string) || aiData?.aiExplanation || '',
                aiExamples: (w.aiExamples as Record<string, string>) || aiData?.aiExamples,
                partOfSpeech: w.partOfSpeech || (base?.partOfSpeech ?? ''),
                lastReviewed: w.lastReviewed || new Date().toISOString(),
                scoreHistory: w.scoreHistory || [],
                // Always hydrate from ground truth in code
                phonetic: staticData.phonetic || '',
                syllables: staticData.syllables || [],
                anchor: staticData.anchor || '',
                semanticCluster: staticData.semanticCluster || [],
                connotation: staticData.connotation || 'neutral',
                roles: staticData.roles || [],
                examples: staticData.examples || [],
                collocations: staticData.collocations || [],
                relatedWordIds: staticData.relatedWordIds || [],
                boundaryNotes: staticData.boundaryNotes || [],
                etymology: staticData.etymology || '',
                mnemonic: staticData.mnemonic || '',
                // User fields should remain as loaded from data
                userMnemonic: w.userMnemonic || '',
                userNotes: w.userNotes || '',
                notes: w.notes || '',
                customDefinition: w.customDefinition || '',
                culturalNotes: staticData.culturalNotes || '',
                avoidWhen: staticData.avoidWhen || '',
                rolesMastered: w.rolesMastered || {},
                hardened: !!w.hardened,
                isBleeding: !!w.isBleeding
              };
            }
          );

          // Merge static curriculum content (richContent, etc.) with stored status
          const mergedCurriculums = curriculumRoadmap.map(staticLevel => {
            const storedLevel = (data.curriculums || []).find((l: { id?: string }) => l.id === staticLevel.id);
            return {
              ...staticLevel,
              nodes: staticLevel.nodes.map(staticNode => {
                const storedNode = (storedLevel?.nodes || []).find((n: { id?: string; status?: NodeStatus }) => n.id === staticNode.id);
                return {
                  ...staticNode,
                  status: storedNode?.status || staticNode.status
                };
              })
            };
          });

          // Build the patch incrementally so empty/missing fields in the
          // cloud doc don't clobber local state (e.g. a fresh Firestore doc
          // would otherwise reset studentName back to "Anthony" and wipe the
          // profileImage on every snapshot).
          const update: Partial<MasteryState> = {
            cloudSynced: true,
            vocabulary,
            curriculums: mergedCurriculums,
            totalXP: data.totalXP || 0,
            gridChargeUntil: data.gridChargeUntil || null,
            lastUpdated: data.lastUpdated || '',
            savedPhrases: data.savedPhrases || [],
            currentStreak: data.currentStreak || 0,
            lastActiveDate: data.lastActiveDate || '',
            hasCompletedSetup: data.hasCompletedSetup || false,
            currentPositionNodeId: data.currentPositionNodeId || 'phi_sim',
            isMainProfile: data.isMainProfile !== undefined ? data.isMainProfile : true,
            widgetDensity: data.widgetDensity || 'Expanded',
            fogOfWar: data.fogOfWar || 'Visible',
            showCircuitPaths: data.showCircuitPaths !== undefined ? data.showCircuitPaths : true,
            knowledgeCheckFrequency: data.knowledgeCheckFrequency || 'session',
            lastKnowledgeCheckDate: data.lastKnowledgeCheckDate || '',
            songs: (Array.isArray(data.songs) && data.songs.length > 0) ? data.songs : defaultSongs,
            commonPhrases: (Array.isArray(data.commonPhrases) && data.commonPhrases.length > 0) ? data.commonPhrases : defaultCommonPhrases,
            lastStreakCheck: data.lastStreakCheck || '',
            learningDays: data.learningDays || [],
            completedNodeIds: data.completedNodeIds || [],
            seenIntroductions: data.seenIntroductions || [],
            confusionPairs: data.confusionPairs || [],
            pendingProveItResponses: data.pendingProveItResponses || [],
            earnedCeremonialRanks: data.earnedCeremonialRanks || [],
            lastSmallRankTitle: data.lastSmallRankTitle || 'jan lili',
            earnedBadges: data.earnedBadges || [],
            totalProveItSubmitted: data.totalProveItSubmitted || 0,
            streakShields: data.streakShields || 0,
            xpMultiplier: data.xpMultiplier || 1.0,
            lastStreakMilestone: data.lastStreakMilestone || 0,
            pendingComebackBonus: !!data.pendingComebackBonus,
            sessionXPRecord: data.sessionXPRecord || 0,
            sessionLog: data.sessionLog || [],
            currentChallenge: data.currentChallenge || null,
            completedChallenges: data.completedChallenges || [],
            pendingRankAcknowledgement: data.pendingRankAcknowledgement || null,
            newRankUnlocked: data.newRankUnlocked || null,
            activeCurriculumId: data.activeCurriculumId || null,
            activeModuleId: data.activeModuleId || null,
            selectedWords: data.selectedWords || [],
            lessonFilter: data.lessonFilter || null,
            completedActivities: data.completedActivities || {},
            masteryHistory: data.masteryHistory || [],
          };

          if (data.studentName) update.studentName = data.studentName;
          if (data.profileImage) update.profileImage = data.profileImage;
          if (data.profile) {
            const incomingProfile = data.profile || {};
            update.profile = { 
              ...get().profile, 
              ...incomingProfile,
              firstName: incomingProfile.firstName || data.studentName || defaultProfile.firstName,
              lastName: incomingProfile.lastName || defaultProfile.lastName,
              tpName: incomingProfile.tpName || defaultProfile.tpName,
              age: incomingProfile.age || defaultProfile.age,
              sex: incomingProfile.sex || defaultProfile.sex,
              locationString: incomingProfile.locationString || defaultProfile.locationString,
              difficulty: incomingProfile.difficulty || defaultProfile.difficulty,
              interests: incomingProfile.interests || defaultProfile.interests,
              mbti: incomingProfile.mbti || defaultProfile.mbti,
              enneagram: incomingProfile.enneagram || defaultProfile.enneagram,
              bigFiveOpenness: incomingProfile.bigFiveOpenness || defaultProfile.bigFiveOpenness,
              bigFiveConscientiousness: incomingProfile.bigFiveConscientiousness || defaultProfile.bigFiveConscientiousness,
              bigFiveExtraversion: incomingProfile.bigFiveExtraversion || defaultProfile.bigFiveExtraversion,
              bigFiveAgreeableness: incomingProfile.bigFiveAgreeableness || defaultProfile.bigFiveAgreeableness,
              bigFiveNeuroticism: incomingProfile.bigFiveNeuroticism || defaultProfile.bigFiveNeuroticism,
              attachmentStyle: incomingProfile.attachmentStyle || defaultProfile.attachmentStyle,
              religion: incomingProfile.religion || defaultProfile.religion,
              religionOther: incomingProfile.religionOther || defaultProfile.religionOther,
              politicalIdentity: incomingProfile.politicalIdentity || defaultProfile.politicalIdentity,
              politicalIdentityOther: incomingProfile.politicalIdentityOther || defaultProfile.politicalIdentityOther,
              bloodType: incomingProfile.bloodType || defaultProfile.bloodType,
              dietPattern: incomingProfile.dietPattern || defaultProfile.dietPattern,
              workoutStyle: incomingProfile.workoutStyle || defaultProfile.workoutStyle,
              activityLevel: incomingProfile.activityLevel || defaultProfile.activityLevel,
              chronicConditions: incomingProfile.chronicConditions || defaultProfile.chronicConditions,
              bookGenres: incomingProfile.bookGenres || defaultProfile.bookGenres,
              tvGenres: incomingProfile.tvGenres || defaultProfile.tvGenres,
              musicGenres: incomingProfile.musicGenres || defaultProfile.musicGenres,
              gamingGenres: incomingProfile.gamingGenres || defaultProfile.gamingGenres,
              gamingPlatforms: incomingProfile.gamingPlatforms || defaultProfile.gamingPlatforms,
              chronotype: incomingProfile.chronotype || defaultProfile.chronotype,
              workSchedule: incomingProfile.workSchedule || defaultProfile.workSchedule,
              livingSituation: incomingProfile.livingSituation || defaultProfile.livingSituation,
              socialPreference: incomingProfile.socialPreference || defaultProfile.socialPreference,
            };
          }

          set(update);
          get().refreshCurriculumStatus();
        });
      },
    }),
    { 
      name: 'tp-tutor-mastery',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { userId, cloudSynced, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("Current songs in store (pre-hydration):", state.songs);

          // Ensure critical array fields are always arrays and not empty if defaults exist
          if (!Array.isArray(state.commonPhrases) || state.commonPhrases.length === 0) {
            state.commonPhrases = defaultCommonPhrases;
          }
          
          const hasTelo = Array.isArray(state.songs) && state.songs.some((a: Album) => a.id === 'telo-lon-kiwen');
          if (!Array.isArray(state.songs) || state.songs.length < 6 || !hasTelo) {
            console.log('Force-syncing songs to latest albumData (missing albums or telo-lon-kiwen missing)...');
            state.songs = defaultSongs;
          }

          if (!Array.isArray(state.savedPhrases)) {
            state.savedPhrases = [];
          }

          console.log("Current songs in store (post-hydration):", state.songs);

          // Merge static content on rehydration
          const mergedCurriculums = curriculumRoadmap.map(staticLevel => {
            const storedLevel = (state.curriculums || []).find((l: { id?: string }) => l.id === staticLevel.id);
            return {
              ...staticLevel,
              nodes: staticLevel.nodes.map(staticNode => {
                const storedNode = (storedLevel?.nodes || []).find((n: { id?: string; status?: NodeStatus }) => n.id === staticNode.id);
                return {
                  ...staticNode,
                  status: storedNode?.status || staticNode.status
                };
              })
            };
          });
          state.curriculums = mergedCurriculums;

          // Inject AI Cache Data on rehydration if missing
          if (Array.isArray(state.vocabulary)) {
            state.vocabulary = state.vocabulary.map(v => {
              if (v.aiExplanation) return v;
              const aiData = (aiVocabCache as Record<string, any>)[v.word.toLowerCase()] || {};
              if (aiData.aiExplanation) {
                return { ...v, aiExplanation: aiData.aiExplanation, aiExamples: aiData.aiExamples };
              }
              return v;
            });
          }

          state.refreshCurriculumStatus();
        }
      }
    }
  )
);
