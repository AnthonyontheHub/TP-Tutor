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
import { initialMasteryMap } from '../data/initialMasteryMap';
import { curriculumRoadmap } from '../data/curriculum';
import { vocabContent } from '../data/vocabContent';
import { TOKI_PONA_DICTIONARY, WORD_FREQUENCY } from '../data/tokiPonaDictionary';
import aiVocabCache from '../data/aiVocabCache.json';
import { initialPhrasebook } from '../data/phrasebook';
import { useActivityStore } from './activityStore';
import type { Album } from '../types/discography';

const KU_SULI_WORDS = new Set(['kokosila', 'lanpan', 'misikeke', 'epiku', 'jasima', 'kijetesantakalu', 'leko', 'linluwi', 'nja', 'oke', 'soko', 'tonsi', 'usawi', 'yupekosi', 'meso', 'namako', 'oko', 'kipisi']);

function normalizePartOfSpeech(pos: string): string {
  if (!pos) return pos;
  return pos.split(',').map(part => {
    let p = part.trim();
    const lower = p.toLowerCase();
    
    if (lower === 'adjective' || lower === 'adverb' || lower === 'number') {
      p = 'Modifier';
    } else if (lower === 'interrogative' || lower === 'ordinal-marker') {
      p = 'Particle';
    } else {
      // Capitalize first letter of any other role (e.g. noun -> Noun)
      p = p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    }
    return p;
  }).join(', ');
}

function toFullVocabWord(v: { word: string; partOfSpeech?: string; status: MasteryStatus; type: 'word' | 'grammar'; sessionNotes: string; frequencyRank?: number; weight?: 'pillar' | 'working' | 'bonus' }): VocabWord {
  const score = STATUS_MIDPOINT[v.status];
  const staticData = vocabContent[v.word] || {};

  // HARDCODED RULE: partOfSpeech is ALWAYS derived from aiVocabCache.grammarExamples.
  // NEVER trust the partOfSpeech value stored in Firestore or localStorage.
  // If aiVocabCache has no grammarExamples for this word, fall back to initialMasteryMap.
  // Do NOT remove this logic or store partOfSpeech as a source of truth anywhere.
  const derivedPartOfSpeech = (() => {
    const cache = (aiVocabCache as Record<string, { grammarExamples?: Record<string, string> }>)[v.word];
    if (cache?.grammarExamples) {
      return normalizePartOfSpeech(Object.keys(cache.grammarExamples).join(', '));
    }
    return normalizePartOfSpeech(v.partOfSpeech || '');
  })();

  const roles = (derivedPartOfSpeech || '').split(',').map(p => p.trim().toLowerCase()).filter(Boolean);
  const scorePerRole = roles.length > 0 ? Math.floor(score / roles.length) : 0;
  const initialScores: PartOfSpeechScores = { noun: 0, verb: 0, modifier: 0, particle: 0 };
  roles.forEach(r => {
    if (r === 'noun') initialScores.noun = scorePerRole;
    else if (r === 'verb') initialScores.verb = scorePerRole;
    else if (r === 'modifier' || r === 'mod') initialScores.modifier = scorePerRole;
    else if (r === 'particle') initialScores.particle = scorePerRole;
  });

  return {
    id: v.word,
    word: v.word,
    partOfSpeech: derivedPartOfSpeech,
    meanings: TOKI_PONA_DICTIONARY[v.word.toLowerCase()] || '',
    type: v.type,
    baseScore: score,
    confidenceScore: score,
    status: v.status,
    weight: v.weight,
    useCount: 0,
    frequencyRank: v.frequencyRank ?? 999,
    isMasteryCandidate: false,
    sessionNotes: v.sessionNotes,
    partOfSpeechScores: initialScores,
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
    customDefinition: '',

    isKu: KU_SULI_WORDS.has(v.word.toLowerCase())
  };
}

const mappedVocabulary: VocabWord[] = initialMasteryMap.initialVocabulary.map(toFullVocabWord);

const defaultSongs: Album[] = [
  {
    id: "telo-lon-kiwen",
    title: "telo lon kiwen",
    titleEn: "Water on Stone",
    scUrl: "https://soundcloud.com/ansoni-482276927/sets/telo-lon-kiwen",
    breakdown: "telo = water, lon = on/in, kiwen = stone/hard",
    explanation: "I want to tell you something honest before I tell you anything else about this record... I built a cathedral. I built it alone in a 678 square foot apartment in Franklin, Tennessee using convolution reverb and a gut-strung baroque palette and a countertenor voice I had to reach up and find inside myself and hold there.\\n\\nToki pona forces reduction. It strips a concept down to its most essential components and makes you find the word inside the small set you are given. The language does not let you be indirect. It cannot support the architecture of avoidance that English can sustain for years if you are disciplined enough... I want you to sit in the cold of this record. I want you to feel the stone under you and the silence between the notes pressing against your ears. And then I want you to feel the warmth come, slowly.",
    tracks: [
      {
        title: "01 suno lon insa",
        titleEn: "Light Within",
        deepDive: "A work of Baroque Minimalism designed to evoke the feeling of dawn in a sacred, ancient space. The centerpiece is a solo male countertenor with an ethereal, glass-like quality, employing intricate melismatic runs — particularly on sewi and open. The recording utilizes a massive natural reverb profile simulating the acoustics of a large stone chapel. Tempo unhurried at 60 BPM, feeling more like a slow breath than a metronome.",
        blocks: [
          { title: "INTRO", tp: "(kalama lili pi ilo kute)", en: "(Sparse gut-strung baroque strings enter slowly beneath the voice like light filling a room. Harpsichord continuo barely present.)" },
          { title: "VERSE 1", tp: "suno sewi li kama,\\nmi open ala sona.\\npimeja li lon poka,\\nsuno li lon monsi.", en: "The divine light arrives,\\nI have not yet begun to understand.\\nDarkness is close by,\\nbut the light was already behind me." },
          { title: "CHORUS", tp: "o lukin e suno sin,\\nlon insa mi la open li lon.\\nwawa sewi li kama,\\nmi sin lon sewi.", en: "Behold the new light,\\nfor the beginning exists within me.\\nSacred power arrives,\\nI am made new in the divine." },
          { title: "VERSE 2", tp: "kalama sewi li kama,\\nkalama lon pimeja.\\nsitelen sewi li lon,\\nsitelen pi open pini.", en: "A sacred sound arrives,\\na sound within the darkness.\\nA divine image is present,\\nthe image of a beginning that never ends." },
          { title: "CHORUS", tp: "o lukin e suno sin,\\nlon insa mi la open li lon.\\nwawa sewi li kama,\\nmi sin lon sewi.", en: "Behold the new light,\\nfor the beginning exists within me.\\nSacred power arrives,\\nI am made new in the divine." },
          { title: "OUTRO", tp: "mi kama sona. suno sin.", en: "I come to know. New light." }
        ]
      },
      {
        title: "02 telo lon kiwen",
        titleEn: "Water in Stone",
        deepDive: "A study in Chamber Baroque Minimalism centered on a countertenor vocal delivered with close-mic'd intimacy. A theorbo provides a steady warm continuo pulse acting as the heartbeat of the piece. Gut-strung strings play slow undulating chords that mimic the movement of water. Mid-song, an oboe d'amore enters with a darker, veiled tone creating a haunting counter-melody.",
        blocks: [
          { title: "VERSE 1", tp: "tenpo ni la mi lukin e sina\\nmi lon tomo pi kalama ala\\nmi wile toki e ijo tawa sina\\ntaso uta mi li pini li kiwen\\nmi jo e pilin suli lon insa mi\\nona li tawa sama telo suli\\nmi kute e kalama pi tomo sina", en: "In this moment, I look at you\\nI am in a room of no sound\\nI want to say something to you\\nBut my mouth is closed and stone-like\\nI have a great feeling inside me\\nIt moves like a great water\\nI hear the sound of your room" },
          { title: "CHORUS", tp: "pilin ni li tawa telo\\nona li tawa lon kiwen pi sijelo mi\\nona li wawa anu ona li ike\\nmi sona ala e ijo lon insa\\ntelo li tawa lon kiwen pi sijelo mi", en: "This feeling is moving water\\nIt moves in the stone of my body\\nIs it power or is it bad/fear?\\nI do not know the thing inside\\nWater moves in the stone of my body" },
          { title: "VERSE 2", tp: "luka sina li pilin e sijelo mi\\nsina kute e kalama pi moku kon mi\\nkon ni li tawa lon pini pi sinpin\\nmi wile tawa weka lon ma ante\\ntaso mi lon ni tan sina taso\\nmi ken ala weka e telo ni\\nmi wile e ni: sina sona e mi", en: "Your hand feels my body\\nYou hear the sound of my breathing\\nThis breath moves at the edge of the face\\nI want to go away to another land\\nBut I am here only because of you\\nI cannot remove this water\\nI want this: that you know/understand me" },
          { title: "CHORUS", tp: "pilin ni li tawa telo\\nona li tawa lon kiwen pi sijelo mi\\nona li wawa anu ona li ike\\nmi sona ala e ijo lon insa\\ntelo li tawa lon kiwen pi sijelo mi", en: "This feeling is moving water\\nIt moves in the stone of my body\\nIs it power or is it bad/fear?\\nI do not know the thing inside\\nWater moves in the stone of my body" },
          { title: "BRIDGE", tp: "kiwen li pakala tan telo suli\\ninsa mi li pini lon ni\\nmi monsi ala anu mi olin e sina\\ntelo ni li wawa li lon tenpo ali\\nmi sona ala e pini pi tawa ni", en: "The stone breaks because of the great water\\nMy inside ends here\\nAm I turning away or do I love you?\\nThis water is strong and is there always\\nI do not know the end of this movement" },
          { title: "OUTRO", tp: "telo li tawa\\nkiwen li awen\\nmi lon ni", en: "Water moves\\nStone remains\\nI am here" }
        ]
      },
      {
        title: "03 tenpo li moku e mi",
        titleEn: "Time Consumes Me",
        deepDive: "A solo male countertenor performing with a 'held' quality — long sustained notes that seem to struggle against the air, creating a sense of physical weight and containment. The harpsichord continuo functions like a relentless mechanical clock, its steady metallic eighth-notes providing an unyielding rhythmic grid representing the inevitability of time.",
        blocks: [
          { title: "VERSE 1", tp: "lon li lon.\\ntenpo li tawa.\\nmi lon poka pi ala.\\nmi ken ala lon ni.", en: "Existence is existence.\\nTime moves.\\nI am at the side of nothingness.\\nI cannot exist in this way." },
          { title: "CHORUS", tp: "wile li suli!\\nwile li tawa!\\nken li lili!\\ntenpo li pini ala!\\nlon li wile ala!", en: "Desire is vast!\\nDesire reaches out!\\nPossibility is small!\\nTime does not end!\\nExistence does not want!" },
          { title: "VERSE 2", tp: "tenpo li lon olin.\\nolin li lon wile.\\nmi ken ala kama jo.\\ntenpo li moku e mi.", en: "Time exists within longing.\\nLonging exists within desire.\\nI cannot obtain what I want.\\nTime consumes me." },
          { title: "CHORUS", tp: "wile li suli!\\nwile li tawa!\\nken li lili!\\ntenpo li pini ala!\\nlon li wile ala!", en: "Desire is vast!\\nDesire reaches out!\\nPossibility is small!\\nTime does not end!\\nExistence does not want!" },
          { title: "BRIDGE", tp: "ala li lon wile.\\nala li lon lon.\\nwile li tenpo.", en: "Nothingness is within desire.\\nNothingness is within existence.\\nDesire is time." },
          { title: "OUTRO", tp: "lon li lon.\\ntenpo li lon.", en: "Being is being.\\nTime is here." }
        ]
      },
      {
        title: "04 Sijelo Ilo",
        titleEn: "The Body as Instrument",
        deepDive: "Composed as a traditional Da Capo Aria (A–B–A). The soloist employs a head voice that is pure and crystalline, mirroring the detachment of the soul watching its own reflection. Section A is stately and questioning while Section B shifts into a darker, more chromatic harmonic landscape to reflect the weight of the physical body.",
        blocks: [
          { title: "SECTION A", tp: "mi lukin e jan\\nlon insa pi mi\\njan ni li olin\\nmi sona ala\\n(jan ni li olin)\\njan ni li olin e olin\\nla ni li seme?\\no, lukin ni\\no, kon pi olin", en: "I watch the person\\ninside of me\\nthis person loves\\nI do not understand\\n(this person loves)\\nthis person loves the love\\nso, what is this?\\noh, this sight\\noh, the spirit of love" },
          { title: "SECTION B", tp: "sijelo li ilo\\npi kon pi mi\\nlawa li pali\\ne olin ni\\nkon mi li kalama\\ntan sijelo\\ntenpo li tawa\\nla mi awen", en: "the body is the tool\\nof my soul\\nthe mind creates\\nthis love\\nmy soul makes sound\\nbecause of the body\\ntime moves\\nand I remain" },
          { title: "SECTION A - REPRISE", tp: "mi lukin e jan\\nlon insa pi mi\\njan ni li olin\\nmi sona ala\\n(jan ni li olin)\\njan ni li olin e olin\\nla ni li seme?\\no, lukin ni\\no, kon pi olin", en: "I watch the person\\ninside of me\\nthis person loves\\nI do not understand\\n(this person loves)\\nthis person loves the love\\nso, what is this?\\noh, this sight\\noh, the spirit of love" },
          { title: "OUTRO", tp: "mi sona ala\\nolin li lon\\n(olin li lon)", en: "I do not understand\\nlove exists\\n(love exists)" }
        ]
      },
      {
        title: "05 kon li pini e moli",
        titleEn: "Breath Ends Death",
        deepDive: "A Baroque sacred aria designed to feel like a single four-minute exhale. The vocal line is built on long arching phrases that mimic the rise and fall of a chest breathing, with ornamental turns and melismas on kon and awen emphasizing the surrender in the lyrics. The bridge suspends four words alone in space.",
        blocks: [
          { title: "VERSE 1", tp: "pini li moli ala.\\npini li pana pi kon.\\nona li wawa pi awen.", en: "The end is not death.\\nThe end is the release of breath.\\nIt is the strength of what remains." },
          { title: "CHORUS", tp: "o pana e kon o awen.\\no pini e wawa o moli.\\no awen! o pana!", en: "Release the breath, let it stay.\\nLet the strength end, let it die (surrender).\\nStay! Give!" },
          { title: "VERSE 2", tp: "kon li tawa.\\nkon li awen.\\nkon li pini e moli.", en: "The breath moves.\\nThe breath remains.\\nThe breath brings an end to death." },
          { title: "BRIDGE", tp: "(kon... awen... pini... pana.)", en: "(Breath... stay... end... give.)" },
          { title: "OUTRO", tp: "awen li moli.\\nawen li pana.\\npini li awen.", en: "Staying is dying.\\nStaying is giving.\\nThe end is what remains." }
        ]
      },
      {
        title: "06 Ma Suli Lon Monsi",
        titleEn: "The Great Land Behind Me",
        deepDive: "A classical Da Capo Aria (A–B–A'). The initial section establishes a Grave tempo with a heavy repetitive pulse. The B section shifts into a darker more dissonant space with sharper harpsichord accents to reflect the intrusion of moli. The solo male countertenor utilizes long descending baroque phrases representing the physical and emotional press of ordinary days.",
        blocks: [
          { title: "MOVEMENT A", tp: "tenpo suli li suli\\n(tenpo suli li suli)\\nma suli li lon monsi\\n(ma suli li lon monsi)\\nmi lape lon ni\\n(lape)\\ntenpo suli li suli mute\\nma suli li lon monsi mi", en: "The grand time is heavy\\n(The grand time is heavy)\\nA vast land is behind me\\n(A vast land is behind me)\\nI sleep in this place\\n(sleep)\\nThe grand time is very heavy\\nThe great land is at my back" },
          { title: "MOVEMENT B", tp: "moli li kama\\nmoli li kama lili\\nmi wile ala weka\\ntenpo li tawa suli\\nmi lon monsi ma", en: "Death is coming\\nDeath comes slowly\\nI do not want to leave\\nTime moves with great weight\\nI am in the country of the past" },
          { title: "MOVEMENT A - DA CAPO", tp: "tenpo suli li suli\\n(tenpo suli li suli)\\nma suli li lon monsi\\n(ma suli li lon monsi)\\nmi lape lon ni\\n(lape)\\nli suli\\n(suli)\\nmi lape\\n(lape)", en: "The grand time is heavy\\n(The grand time is heavy)\\nA vast land is behind me\\n(A vast land is behind me)\\nI sleep in this place\\n(sleep)\\nit is heavy\\n(heavy)\\nI sleep\\n(sleep)" },
          { title: "OUTRO", tp: "lape\\nsuli\\nmonsi", en: "sleep\\nheavy\\nbehind" }
        ]
      },
      {
        title: "07 nasin pi pakala ken",
        titleEn: "The Path of Damage as Possibility",
        deepDive: "A classic Da Capo Aria with a dramatically contrasting middle section reaching maximum harmonic instability. Written for a solo countertenor utilizing a crystalline yet strained tone with chiaroscuro — the balance of light and dark. The driven basso continuo of harpsichord and theorbo uses rapid agitated figures representing the restless interior conflict. 135 BPM.",
        blocks: [
          { title: "SECTION A", tp: "utala suli li mama e kalama lon insa mi\\nmi pilin e moli pi nasin pimeja lon poka mi\\nwile mi li pakala e tomo pi lawa ni\\nlon pi mi lon tenpo ni li open e lipu pimeja\\ntenpo li tawa musi lon sewi pi telo suli mi\\nutala li lon; mi wile e ni: mi tawa e insa suli mi", en: "A great war gives birth to a sound within me\\nI feel the death of the dark path at my side\\nMy will shatters the house of this mind\\nMy existence in this moment opens a dark book\\nTime moves strangely upon the surface of my great tears\\nThe war exists; I desire this: that I move my deep inner self" },
          { title: "SECTION B", tp: "o lukin e mini pi pali mi lon kiwen\\nken mi li kama tan pakala suli pi sijelo mi\\npakala li ken; mi open e nena pi kon mi tan ni: mi pakala\\njan pali li pini e sitelen pi olin lon sijelo\\njan utala li open e nasin tawa suno pimeja\\nmi tawa tawa nena pi moli pi tenpo ali\\nsina wile e pakala mi tawa ni: mi lon", en: "Look at the words of my work upon the stone\\nMy ability comes from the great damage of my body\\nDamage is possibility; I open the ridge of my soul because I am broken\\nThe creator finishes the image of love upon the body\\nThe warrior opens the path toward the dark sun\\nI go toward the peak of eternal death\\nYou require my brokenness so that I may truly be" },
          { title: "SECTION A - DA CAPO", tp: "utala suli li mama e kalama lon insa mi\\n(mi utala e pilin mi)\\nmi pilin e moli pi nasin pimeja lon poka mi\\n(nasin pimeja li suli)\\nwile mi li pakala e tomo pi lawa ni\\nlon pi mi lon tenpo ni li open e lipu pimeja\\ntenpo li tawa musi lon sewi pi telo suli mi\\n(telo suli li moli)", en: "A great war gives birth to a sound within me\\n(I fight my own feeling)\\nI feel the death of the dark path at my side\\n(the dark path is great)\\nMy will shatters the house of this mind\\nMy existence in this moment opens a dark book\\nTime moves strangely upon the surface of my great tears\\n(the great water is death)" },
          { title: "OUTRO", tp: "mi pali e ken lon insa pi pakala mi\\nnasin li open tan utala pi lawa mi", en: "I create possibility inside my brokenness\\nThe path opens because of the war in my mind" }
        ]
      },
      {
        title: "08 kalama pi pini ala",
        titleEn: "Sound Without End",
        deepDive: "Composed as a traditional Baroque Sacred Aria following a strict da capo structure for solo male countertenor, utilizing a high ethereal vocal range to convey spiritual yearning and existential vulnerability. Set within a vast stone cathedral where the natural decay allows notes to hang and shimmer long after they are sung.",
        blocks: [
          { title: "SECTION A", tp: "pilin mi o, sina ken ala toki.\\nlukin o, sina lukin e kon.\\ntoki li lon, taso kon li suli.\\nawen o, o lon poka mi.", en: "O my feeling, you cannot speak.\\nO sight, you witness the unseen essence.\\nThe words are present, but the essence is vast.\\nO stillness, remain by my side." },
          { title: "SECTION B", tp: "toki pi wawa ala li lon kon o.\\nmu o tawa poka pi sewi o.\\no pilin e kalama mi o.\\nkalama mi li lon o kute o.", en: "Powerless words hang in the air.\\nLet the wordless cry reach the side of the divine.\\nFeel my sound.\\nMy sound is here; listen." },
          { title: "OUTRO", tp: "mu.", en: "A final, wordless sigh." }
        ]
      },
      {
        title: "09 Ante Suli",
        titleEn: "Great Change",
        deepDive: "The album's peak. Structured as a formal Da Capo Aria (A–B–A), utilizing a historically informed Baroque palette. Begins with a grave basso continuo of harpsichord and theorbo establishing urgent rhythmic drive in a minor key. The gut-strung strings provide a raw agitated texture mimicking the internal tension of the moment of realization.",
        blocks: [
          { title: "SECTION A", tp: "tenpo pimeja li lon\\nmi pilin e suli ni\\n(o suli)\\nmi sona e ijo suli\\nmi lon ma pi tenpo pini\\n(lon tenpo pini)", en: "The dark time is here\\nI feel this greatness\\n(Oh, greatness)\\nI know a great thing\\nI am in the land of the past\\n(In the past)" },
          { title: "SECTION B", tp: "mi kama ante lon sewi\\nmi sona e sin pi kon ni\\no lukin e mi lon tenpo ni\\nmi ante pi wile ala\\n(mi ante pi wile ala)\\nselo mi li kama sin\\nkon sewi li kama tawa mi", en: "I am becoming different in the heights\\nI know the newness of this soul/air\\nBehold me in this moment\\nI am different without choosing it\\n(I am different without choosing it)\\nMy skin/surface is becoming new\\nA divine spirit comes to me" },
          { title: "SECTION A - REPRISE", tp: "tenpo pimeja li lon\\nmi pilin e suli ni\\n(o suli)\\nmi sona e ijo suli\\nmi lon ma pi tenpo pini\\n(lon tenpo pini)", en: "The dark time is here\\nI feel this greatness\\n(Oh, greatness)\\nI know a great thing\\nI am in the land of the past\\n(In the past)" },
          { title: "OUTRO", tp: "mi sona e ni\\nmi lon\\nmi lon\\n(mi lon)", en: "I know this\\nI am here\\nI exist\\n(I am)" }
        ]
      },
      {
        title: "10 pana pi wawa pimeja",
        titleEn: "The Giving of Dark Strength",
        deepDive: "Structured as a classical da capo aria subverting the traditional return to create a sense of emotional exhaustion rather than vocal display. The strings are gut-strung providing a raw slightly unstable texture that lacks the polished sheen of modern instruments, emphasizing vulnerability.",
        blocks: [
          { title: "SECTION A", tp: "mi pana e wawa lon kipisi pimeja pi insa mi\\n(olin)\\ntenpo olin li pakala e suli pi pali mi\\nolin wawa li ken ala kute e wile sina\\n(pana)\\nmi pali e nasin pi moli wawa tawa sina\\njan li jo e kon pi pini lon luka lili\\n(olin)\\ntenpo ni li pana e olin pi nanpa pini\\n(pana)", en: "I give strength from the dark parts of my inner self\\n(Love)\\nThe time of love destroys the greatness of my work\\nStrong love cannot hear your desires\\n(Giving)\\nI create a path of strong death for you\\nA person holds the spirit of the end in small hands\\n(Love)\\nThis time gives the final love\\n(Giving)" },
          { title: "SECTION B", tp: "ike li suli lon kon pi kule pi pali sina\\nmi lukin e seli pi moli lon lawa ni\\nnasin pi olin wawa li utala e nimi\\nwawa mi li moli tan tawa pi pilin ike\\nsina wile ala e selo pi mi suli\\n(ike)\\nmi kipisi e sijelo ni tawa olin monsi", en: "Evil is great in the spirit of the color of your actions\\nI see the fire of death in this head\\nThe way of strong love fights against names/words\\nMy strength dies because of the movement of bad feelings\\nYou do not want the skin of my greatness\\n(Pain/Evil)\\nI cut this body for a hidden love" },
          { title: "SECTION A - DEVASTATION", tp: "mi pana e wawa lon kipisi pimeja pi insa mi\\n(olin)\\ntenpo olin li pakala e suli pi pali mi\\nolin wawa li ken ala kute e wile sina\\n(pana)\\nmi pali e nasin pi moli wawa tawa sina\\njan li jo e kon pi pini lon luka lili\\n(olin)\\ntenpo ni li pana e olin pi nanpa pini\\n(pana)", en: "I give strength from the dark parts of my inner self\\n(Love)\\nThe time of love destroys the greatness of my work\\nStrong love cannot hear your desires\\n(Giving)\\nI create a path of strong death for you\\nA person holds the spirit of the end in small hands\\n(Love)\\nThis time gives the final love\\n(Giving)" }
        ]
      },
      {
        title: "11 suno sewi",
        titleEn: "Sacred Light",
        deepDive: "A formal Baroque Da Capo Aria for solo male countertenor, designed to evoke the reverberant sacred atmosphere of a 17th-century stone cathedral. The vocal line is characterized by long arching phrases that prioritize ascending intervals, moving away from weight toward light.",
        blocks: [
          { title: "SECTION A", tp: "meli o, suno li sewi mute.\\nsuno wawa li pini ala.\\nona li lon poka mi.\\nkalama suli li open e wawa.\\npimeja li moku e mi ala.\\nsuno sewi li kule e mi.\\nmeli o, o lukin e wawa.", en: "O beloved, the sun is most sacred.\\nThe powerful radiance never ends.\\nIt stays here by my side.\\nA great sound awakens the strength.\\nThe darkness does not consume me.\\nSacred light colors my being.\\nO beloved, behold the power." },
          { title: "SECTION B & C", tp: "o open e wawa o open e pilin!\\nsuno li jo e wawa open suli!\\ntenpo li kama lon open suli!\\nsewi li lukin e mi sumele!\\nwawa o, sewi li pini ala.\\nmeli o, o awen lon poka.\\nsuno li wawa li sewi mute.", en: "Open the power, open the heart!\\nThe sun possesses a great unfolding strength!\\nThe moment arrives in a grand beginning!\\nThe divine looks upon me with tenderness!\\nO power, the sacred has no end.\\nO beloved, remain close by.\\nThe light is strong and most divine." },
          { title: "SECTION A - RETURN", tp: "meli o, suno li sewi mute.\\nsuno wawa li pini ala.\\nona li lon poka mi.\\npimeja li moku e mi ala.\\nsuno sewi li kule e mi.", en: "O beloved, the sun is most sacred.\\nThe powerful radiance never ends.\\nIt stays here by my side.\\nThe darkness does not consume me.\\nSacred light colors my being." }
        ]
      },
      {
        title: "12 Awen Lape",
        titleEn: "Remaining in Rest",
        deepDive: "The vocal line is written for a high male countertenor utilizing a breathy straight-tone delivery that avoids modern operatic vibrato in favor of period-accurate ornaments. Delicate trills and mordents are applied to lape and lon, emphasizing the arrival at a state of being rather than doing.",
        blocks: [
          { title: "SECTION A", tp: "tenpo pini li pini a lon ni\\nmi awen lon sewi pi musi pona\\nlape li weka li lon suli\\nawen li pini li pona suli\\ntenpo ni li lon li weka ala\\nkon pona li tawa lon insa mi\\nmi pilin pona e selo mi ni\\ntomo mi li jo e kalama ala", en: "The past time has truly ended here\\nI remain in the heights of beautiful rest\\nSleep is not absence, it is a great presence\\nWaiting is over and it is deeply good\\nThis moment is present and does not depart\\nA good spirit moves within me\\nI feel the peace of my own skin\\nMy room holds no sound" },
          { title: "SECTION B", tp: "mi wile ala pali e ijo ante\\npini pi wile nasa li lon ni\\nsuno li tawa kepeken musi lili\\nsina lon ni li pona tawa mi\\nakesi lili li lon kasi anpa\\ntenpo li tawa pi wawa ala\\nmi kute e kalama pi kasi kasi\\nilo li pali ala lon tenpo ni", en: "I do not want to do anything else\\nThe end of strange desires is here\\nThe sun moves with a small rhythm\\nYour presence here is good to me\\nSmall lizards are in the plants below\\nTime moves without any force\\nI hear the sound of the rustling leaves\\nNo tools are working in this time" },
          { title: "SECTION A - DA CAPO", tp: "tenpo pini li pini a lon ni\\n(pini a lon ni)\\nmi awen lon sewi pi musi pona\\n(musi pona)\\nlape li weka li lon suli\\n(li lon suli)\\nawen li pini li pona suli\\n(pona suli)\\ntomo mi li jo e kalama ala\\n(kalama ala)", en: "The past time has truly ended here\\n(truly ended here)\\nI remain in the heights of beautiful rest\\n(beautiful rest)\\nSleep is not absence, it is a great presence\\n(it is a great presence)\\nWaiting is over and it is deeply good\\n(deeply good)\\nMy room holds no sound\\n(no sound)" }
        ]
      },
      {
        title: "13 kon pi sewi",
        titleEn: "Spirit of the Divine / Sacred Air",
        deepDive: "Composed as a Baroque sacred aria in a da capo style for solo male countertenor. Set within the immersive reverberant acoustics of a stone cathedral with the longest natural decay on the album to emphasize the theme of vastness. The dynamics do not build in a traditional sense; the piece begins in a state of spiritual arrival and simply deepens in intensity and resonance.",
        blocks: [
          { title: "SECTION A", tp: "kon mi o ante, mi lon sewi.\\nsuli o kon, olin o weka.\\ntenpo pini la, mi lon poka.\\nlon ni la, mi suli, mi olin.\\nma lili li lon poka pi kon mi.\\npimeja li open e wawa sewi.", en: "Let my soul transform, I am in the divine.\\nThe greatness is spirit, love has moved beyond.\\nIn the past time, I was alongside.\\nIn this moment, I am vast, I am love.\\nThe small world is beside my spirit.\\nThe darkness opens the divine strength." },
          { title: "SECTION B", tp: "olin li ante, olin li suli.\\n(olin li suli)\\nkon pi sewi o lon ante mi.\\n(o lon ante mi)\\nwawa pi olin li kama kon sewi.\\n(kon sewi)\\nmi olin e kon, olin li suli.\\n(olin li suli)", en: "Love is transformed, love is vast.\\n(Love is vast)\\nMay the divine spirit be within my change.\\n(Be within my change)\\nThe power of love becomes the sacred air.\\n(Sacred air)\\nI love the spirit, love is vast.\\n(Love is vast)" },
          { title: "CONCLUSION", tp: "kon mi li ante. mi olin.", en: "My soul has transformed. I am love." }
        ]
      },
      {
        title: "14 Kon Kalama",
        titleEn: "Breath Sound",
        deepDive: "Built around a single sustained Baroque affekt of wonder and interior revelation. The male countertenor provides a dark chesty resonance even in the high register with phrasing heavily melismatic, particularly on the word sewi where the voice explores long ornamental runs that mimic the breath becoming sound. Disc 2 begins.",
        blocks: [
          { title: "VERSE 1", tp: "toki li pakala\\ntoki li lili pi pilin mi\\nmi wile toki e suli\\ntaso nena pi insa mi li kiwen\\nmi pana e kon\\nkon mi li tawa lon uta\\nkon li ante\\nkon li pini e utala", en: "Language is broken / incomplete\\nWords are too small for my feeling\\nI want to speak the greatness\\nBut the hills of my inside are stone\\nI give my breath\\nMy breath moves in my mouth\\nThe breath changes\\nThe breath ends the struggle" },
          { title: "CHORUS", tp: "kon li kalama\\nmusi li sewi\\npilin li toki taso\\n(toki taso)", en: "Breath is sound\\nArt/Music is divine\\nFeeling is the only speech\\n(the only speech)" },
          { title: "VERSE 2", tp: "selo mi li seli\\ntelo li lon sinpin mi\\nmi kute e musi\\nmusi li ken pali e mi\\nmusi li sona e ali\\nmusi li pana e open\\npilin mi li tawa ala\\npilin mi li kute taso", en: "My skin is warm\\nWater (sweat/tears) is on my face\\nI hear the music\\nMusic can build/create me\\nMusic knows everything\\nMusic gives a beginning\\nMy feeling does not move (resist)\\nMy feeling only listens" },
          { title: "BRIDGE", tp: "sewi li lon kon\\n(sewi li lon kon)\\nsewi li lon kalama\\n(sewi li lon kalama)\\nutala li pini\\npilin li open\\ntoki li musi\\nmusi li toki", en: "The sacred is in the breath\\n(the sacred is in the breath)\\nThe sacred is in the sound\\n(the sacred is in the sound)\\nThe struggle ends\\nFeeling opens\\nSpeech is music\\nMusic is speech" },
          { title: "CLIMAX", tp: "kon li kalama\\nmusi li sewi\\npilin li toki taso\\n(toki taso)\\n(kon li kalama)\\n(musi li sewi)", en: "Breath is sound\\nArt/Music is divine\\nFeeling is the only speech\\n(the only speech)\\n(breath is sound)\\n(music is divine)" },
          { title: "OUTRO", tp: "musi li sewi\\n(sewi)\\npilin li toki\\n(toki)\\nkon li pini ala\\n(kon li pini ala)\\no kute\\no kute\\no kute", en: "Music is divine\\n(divine)\\nFeeling speaks\\n(speaks)\\nThe breath does not end\\n(the breath does not end)\\nListen\\nListen\\nListen" }
        ]
      },
      {
        title: "15 o lon poka mi",
        titleEn: "Remain by My Side",
        deepDive: "Anchored in a single sustained Baroque affekt of yearning incomprehension, illustrating the vast space between speaking and true understanding. The centerpiece is a solo male countertenor sung with complete emotional exposure, featuring a warm slightly dark timbre with mature grounded weight in the upper register and audible chest resonance beneath the falsetto.",
        blocks: [
          { title: "VERSE 1", tp: "uta o, o toki tawa mi.\\nkalama li lon poka lili.\\nkon lili li open e wawa.\\npimeja li lon ma pilin.", en: "O voice/mouth, speak to me.\\nThe sound is intimately close.\\nA subtle breath unlocks the power.\\nDarkness rests within the realm of feeling." },
          { title: "CHORUS", tp: "pilin mi o, sina ken ala toki.\\nlukin o, sina lukin e kon.\\ntoki li lon, taso kon li suli.\\nawen o, o lon poka mi.", en: "O my feeling, you cannot speak.\\nO sight, you witness the unseen essence.\\nThe words are present, but the essence is vast.\\nO stillness, remain by my side." },
          { title: "VERSE 2", tp: "ona li toki e ijo lili.\\nijo pi wawa ala li tawa.\\ntaso kon li weka mute.\\nlukin mi li wawa lili.", en: "They speak of little things.\\nThings without weight simply pass by.\\nBut the true meaning is hidden deep away.\\nMy sight is fragile/weak." },
          { title: "CHORUS", tp: "pilin mi o, sina ken ala toki.\\nlukin o, sina lukin e kon.\\ntoki li lon, taso kon li suli.\\nawen o, o lon poka mi.", en: "O my feeling, you cannot speak.\\nO sight, you witness the unseen essence.\\nThe words are present, but the essence is vast.\\nO stillness, remain by my side." },
          { title: "BRIDGE", tp: "kon o, o tawa.\\ntoki o, o pimeja.\\npilin li wawa mute.\\nwawa li lon poka.", en: "O breath/spirit, move.\\nO speech, fade into the dark.\\nThe feeling is overwhelmingly strong.\\nThe power is near." },
          { title: "FINAL CHORUS", tp: "pilin mi o, sina ken ala toki!\\nlukin o, sina lukin e kon!\\ntoki li lon, taso kon li suli!\\nawen o, o lon poka mi!", en: "O my feeling, you cannot speak!\\nO sight, you witness the unseen essence!\\nThe words are present, but the essence is vast!\\nO stillness, remain by my side!" },
          { title: "OUTRO", tp: "kon...", en: "Essence... / Breath..." }
        ]
      },
      {
        title: "16 luka mama",
        titleEn: "The Hand of the Parent",
        deepDive: "Built around a single sustained affekt of longing and transformation. The foundation is a continuo of theorbo and baroque cello providing a steady clock-like harmonic pulse representing the inevitability of growth. The violins serve as the primary dynamic force alternating between haunting sustained unisons that pull the listener upward and rapid ornamental runs.",
        blocks: [
          { title: "VERSE 1", tp: "mi lon anpa pi kiwen lete, mi lili mute lon ma ni.\\nmama o, sina pali e mi tan ma pimeja pi kalama ala.\\ntenpo ni la sewi suli li lon ante mute pi sijelo mi.", en: "I am at the base of cold stone, I am very small in this land.\\nO creator/parent, you made me from a dark land of no sound.\\nIn this time, the great height exists in the many changes of my body." },
          { title: "CHORUS", tp: "luka mi li alasa e suno suli pi sewi pona.\\nmama li pana e kon seli tawa sijelo mi pi pali sin.\\nmi open kama jan lon pini pi tenpo pimeja.", en: "My hands hunt for the great light of the good heaven.\\nThe parent gives warm breath to my body of new creation.\\nI begin to become a person at the end of the dark time." },
          { title: "VERSE 2", tp: "tenpo li tawa la mi suli tan wawa sina pi suli mute.\\nmi ken lukin e nasin pi pali sina lon sewi pi pini ala.\\nmi weka tan anpa pi kiwen lete, mi tawa nena walo.", en: "As time moves, I grow from your very great strength.\\nI can see the path of your work in the endless height.\\nI am away from the base of cold stone; I go toward the white mountain." },
          { title: "OUTRO", tp: "mi jan pi tenpo kama, mi suli lon sinpin sina.\\nsewi li poka mi li pini e pimeja lon ma.\\nmi jan lon sewi, mi jan lon ni.", en: "I am the person of the future; I am great before your face.\\nThe sky is with me and ends the darkness in the land.\\nI am a person in the height; I am a person here." }
        ]
      },
      {
        title: "17 tenpo awen pini ala",
        titleEn: "The Time of Waiting Does Not End",
        deepDive: "A male countertenor singing in his pure upper register — bright, crystalline, and almost disembodied, soaring with luminous clarity. The vocal delivery is highly exposed, featuring audible vulnerable inhalations between phrases. During the emotionally heavy choruses, the voice utilizes complex multi-note melismatic ornamentation, particularly stretching the vowel on kon to elongate its emotional weight.",
        blocks: [
          { title: "VERSE 1", tp: "Tenpo pini li lon poka mi.\\n(pini li lon poka mi...)\\nPilin pi weka li awen lili.\\n(awen lili...)\\nKon li tawa, taso pilin li awen.\\n(pilin li awen.)", en: "The past is right beside me.\\n(the past is beside me...)\\nThe feeling of absence lingers a little.\\n(lingers a little...)\\nThe spirit departs, but the feeling remains.\\n(the feeling remains.)" },
          { title: "CHORUS", tp: "Ona li lon ala, taso ona li lon!\\nPilin pi weka li jo e kon!\\nTenpo awen li pini ala!\\nTenpo awen li pini ala!", en: "It is not here, but it is here!\\nThe feeling of absence has a life/spirit of its own!\\nThe time of waiting does not end!\\nThe time of waiting does not end!" },
          { title: "VERSE 2", tp: "Mi awen. mi sona ala.\\nPilin li awen lili.\\nTenpo li tawa ala.", en: "I wait. I do not know.\\nThe feeling lingers a little.\\nTime does not move." },
          { title: "CHORUS", tp: "Ona li lon ala, taso ona li lon!\\nPilin pi weka li jo e kon!\\nTenpo awen li pini ala!\\nTenpo awen li pini ala!", en: "It is not here, but it is here!\\nThe feeling of absence has a life/spirit of its own!\\nThe time of waiting does not end!\\nThe time of waiting does not end!" },
          { title: "OUTRO", tp: "Pilin li awen...\\nPilin li awen lili...\\nAw-en...", en: "The feeling remains...\\nThe feeling lingers a little...\\nRe-main..." }
        ]
      },
      {
        title: "18 Telo Suno",
        titleEn: "Liquid Light",
        deepDive: "Engineered to sit in a dry domestic room — wood floors and heavy tapestries rather than stone arches. There is no artificial reverb tail; instead, the close-mic'd mechanical click of the harpsichord jacks and the singer's breath create an almost uncomfortably intimate proximity. The phrasing is parlando — modeled after natural speech patterns.",
        blocks: [
          { title: "SECTION A", tp: "suno pi pona li kama lon ma\\ntelo pi suno li seli e mi\\nnasin pi pini li weka tan mi\\nmi pilin e ni lon insa mi\\nkon pi tenpo li sin tawa mi\\ntelo pi pini li weka tan ni\\noko mi li lukin e suno\\noko mi li lukin e sin", en: "A good sun arrives upon the earth\\nThe liquid light warms me\\nThe path of the past is gone from me\\nI feel this deep within\\nThe air of the moment is new to me\\nThe water of what ended is far from here\\nMy eyes behold the sun\\nMy eyes behold the new" },
          { title: "SECTION B", tp: "sona li lon la mi pilin pona\\nwile pi sona li weka tan mi\\nmi pali ala e ni lon tenpo\\ntenpo li seli e pilin mi\\ntoki pi pini li weka lon kon\\nmi pali ala e pali pi suli\\nmi lon insa pi sona ni\\nmi sona ala e wile pini", en: "When the answer is here, I feel good\\nThe desire to know has left me\\nI do not struggle with this time\\nTime warms my heart\\nThe old talk is lost in the wind\\nI do not do great labors\\nI am inside this knowing\\nI do not remember the old questions" },
          { title: "SECTION A - REPRISE", tp: "suno pi pona li kama lon ma\\ntelo pi suno li seli e mi\\nnasin pi pini li weka tan mi\\nmi pilin e ni lon insa mi\\n(lon insa mi)\\n(pilin e ni)\\nkon pi tenpo li sin tawa mi\\noko mi li lukin e suno\\noko mi li lukin e sin", en: "A good sun arrives upon the earth\\nThe liquid light warms me\\nThe path of the past is gone from me\\nI feel this deep within\\n(deep within)\\n(I feel this)\\nThe air of the moment is new to me\\nMy eyes behold the sun\\nMy eyes behold the new" },
          { title: "OUTRO", tp: "(suno li sin)\\n(suno li sin)\\n(suno)", en: "(the light is new)\\n(the light is new)\\n(light)" }
        ]
      }
    ]
  },
  {
    id: "kalama-pi-kon-mi",
    title: "kalama pi kon mi",
    titleEn: "The Sound of My Spirit",
    scUrl: "https://soundcloud.com/ansoni-482276927/sets/kalama-pi-kon-mi",
    breakdown: "kalama = sound, pi = of, kon = spirit/air, mi = my",
    explanation: "I made this record because I was suffocating in silence and did not fully realize it until I was already halfway through building something completely different... kalama pi kon mi is the sound of my apartment. Not idealized, not expanded into something grander than it is. Just the room. I made a decision early in this record that I was going to stop hiding the evidence of the making. Every pristine production choice is also a choice about what to conceal. This time I wanted the seams visible. I wanted you to hear that this was made by a person sitting alone in a small space trying to say something they did not have a clean way to say.",
    tracks: [
      {
        title: "01 mi awen lon pimeja",
        titleEn: "I remain in the dark",
        deepDive: "A hazy, atmospheric bedroom pop track built around clean electric guitars playing slow, shimmering arpeggios and echoing vibrato-heavy melodies, anchored by a deep sustaining sub-bass and a slow, muffled drum machine with a lazy, slightly behind-the-grid feel.",
        blocks: [
          { title: "VERSE 1", tp: "pimeja li lon poka mi.\\ntenpo li awen taso.\\nlawa mi li tawa lili.\\nlape li kama, lape li ken.\\n(lape li ken.)", en: "Darkness is beside me.\\nTime only waits.\\nMy mind drifts a little.\\nSleep is coming, sleep is possible.\\n(sleep is possible.)" },
          { title: "CHORUS", tp: "pilin ala li lon kon mi.\\nkon li tawa, mi awen.\\nmi ken ala pili e lon.\\ntaso ona li lon pimeja.\\nona li lon pimeja!", en: "A lack of feeling is in my spirit.\\nThe unseen moves, I remain.\\nI cannot touch reality/what exists.\\nBut it exists in the dark.\\nIt is in the dark!" },
          { title: "VERSE 2", tp: "mi lape. mi pimeja.\\nmi pilin e kon.\\ntenpo li pini ala.\\nmi awen lili. mi awen o.", en: "I sleep. I am the dark.\\nI feel the unseen.\\nTime does not end.\\nI linger a little. Oh, I remain." },
          { title: "CHORUS", tp: "pilin ala li lon kon mi.\\nkon li tawa, mi awen.\\nmi ken ala pili e lon.\\ntaso ona li lon pimeja.\\nona li lon pimeja!", en: "A lack of feeling is in my spirit.\\nThe unseen moves, I remain.\\nI cannot touch reality/what exists.\\nBut it exists in the dark.\\nIt is in the dark!" },
          { title: "OUTRO", tp: "kon li awen.\\npilin li awen.\\nmi awen... o.\\n(mi awen... o.)", en: "The Unseen stays.\\nThe feeling stays.\\nI remain… oh.\\n(I remain… oh.)" }
        ]
      },
      {
        title: "02 mi lon ma lili",
        titleEn: "I am in a small place",
        deepDive: "A celestial dream pop companion piece to the opening track, built on warm detuned electric guitar chords and the subtle rhythmic hiss of a cassette tape. The verses are intentionally sparse, emphasizing negative space.",
        blocks: [
          { title: "VERSE 1", tp: "sewi li pimeja.\\nkon li wawa.\\nmi lon ma lili.\\n(lon ma lili.)", en: "The sky is dark.\\nThe air is strong.\\nI am in a small place.\\n(In a small place.)" },
          { title: "CHORUS", tp: "mun o, o lape.\\nsuno li weka.\\no pimeja.\\no pimeja.", en: "O moon, sleep.\\nThe sun is gone.\\nBe dark.\\nBe dark." },
          { title: "VERSE 2", tp: "kon sewi li awen.\\nmi lili, mi pona.\\npimeja li suli.\\n(pimeja li suli.)", en: "The divine air remains.\\nI am small, I am good.\\nThe darkness is vast.\\n(The darkness is vast.)" },
          { title: "CHORUS", tp: "mun o, o lape.\\nsuno li weka.\\no pimeja.\\no pimeja.", en: "O moon, sleep.\\nThe sun is gone.\\nBe dark.\\nBe dark." },
          { title: "OUTRO", tp: "mi lape.\\nmun li awen.", en: "I sleep.\\nThe moon remains." }
        ]
      },
      {
        title: "03 seli pi sijelo",
        titleEn: "Warmth of the body",
        deepDive: "A devotional baroque and contemporary folk crossover featuring a male countertenor vocal as its centerpiece. The accompaniment is strictly a monophonic solo acoustic guitar with heavy baroque ornamentation — rapid finger-taps, trills, and cascading melodic runs.",
        blocks: [
          { title: "VERSE 1", tp: "sijelo mi o awen.\\nlete li lon tomo pi pilin.\\ntelo li tawa insa.\\no awen, o awen.", en: "My body, please hold on.\\nColdness is in the room of feeling.\\nWater moves inside.\\nHold on, hold on." },
          { title: "CHORUS", tp: "seli li kama, seli li awen!\\n(seli li kama, seli li awen)!\\npilin tomo li wawa!\\no awen, sijelo mi!", en: "Warmth arrives, warmth endures!\\n(Warmth arrives, warmth endures)!\\nThe internal feeling is strong!\\nHold on, my body!" },
          { title: "VERSE 2", tp: "telo pi seli li tawa.\\npimeja li open lili.\\npilin li jo e seli.", en: "Warm water moves.\\nThe darkness begins to fade.\\nThe heart holds warmth." },
          { title: "CHORUS", tp: "seli li kama, seli li awen!\\n(seli li kama, seli li awen)!\\npilin tomo li wawa!\\no awen, sijelo mi!", en: "Warmth arrives, warmth endures!\\n(Warmth arrives, warmth endures)!\\nThe internal feeling is strong!\\nHold on, my body!" },
          { title: "OUTRO", tp: "sijelo o awen.\\npilin o awen.\\nawen.\\n(awen...)", en: "Body, endure.\\nFeeling, endure.\\nEndure.\\n(Endure...)" }
        ]
      },
      {
        title: "04 oko pi kon sewi",
        titleEn: "Eye of the sacred spirit",
        deepDive: "A baroque sacred duet for two male countertenor voices and solo acoustic guitar, capturing a high-stakes devotional energy. The two voices weave through each other with complex melismatic ornaments in a call-and-response structure.",
        blocks: [
          { title: "VERSE 1", tp: "mi lukin e sewi\\noko mi li open\\nkon suli li lon\\nni li kon sewi", en: "I look at the sacred sky.\\nMy eyes are open.\\nA great spirit is there.\\nThis is a divine spirit." },
          { title: "CHORUS", tp: "ni li seme?\\nseme li lon?\\nseme li lon?\\nkon mi li tawa\\ntawa sewi suli", en: "What is this?\\nWhat exists?\\nWhat exists?\\nMy spirit travels.\\nToward the great sacred." },
          { title: "VERSE 2", tp: "ni li kon mi\\nmi lukin e ni\\noko li suno\\nmi pilin e ni", en: "This is my spirit.\\nI see this.\\nThe eye is light.\\nI feel this." },
          { title: "CHORUS", tp: "ni li seme?\\nseme li lon?\\nkon mi li tawa\\ntawa sewi suli", en: "What is this?\\nWhat exists?\\nMy spirit travels.\\nToward the great sacred." },
          { title: "BRIDGE", tp: "(sewi suli)\\nsewi suli\\n(kon o)\\nkon o\\n(ni li seme)\\nni li seme", en: "(Great sacred.)\\nGreat sacred.\\n(O spirit.)\\nO spirit.\\n(What is this?)\\nWhat is this?" },
          { title: "OUTRO", tp: "(seme)\\n(ni li kon)\\n(sewi)", en: "(What?)\\n(This is spirit.)\\n(Sacred.)" }
        ]
      },
      {
        title: "05 mi wile pona",
        titleEn: "I want to be good",
        deepDive: "A warm, bittersweet indie folk and contemporary harmonic folk track built on minimalist acoustic fingerstyle guitar with gentle brush percussion and warm layered male and female vocal harmonies.",
        blocks: [
          { title: "VERSE 1", tp: "mi lon poka pi kasi suli\\nkasi li pimeja lon ni\\ntelo li tawa lon kiwen\\nmi wile pona tawa ali\\nmi wile pali e pona\\nmi wile e kon pona", en: "I am beside the great tree.\\nThe tree is dark here.\\nWater moves over stone.\\nI want to be good to all.\\nI want to create goodness.\\nI want good air — a good spirit." },
          { title: "CHORUS", tp: "taso jan li lukin e mi\\nmi pilin e ike ona\\n(mi pilin e ike ona)\\nmi mute li wile pona\\nmi mute li ken ala\\ntaso jan li lukin\\n(ken ala pona)", en: "But people are watching me.\\nI feel their judgment.\\n(I feel their judgment.)\\nWe all want to be good.\\nWe all cannot.\\nBut people are watching.\\n(Cannot be good.)" },
          { title: "VERSE 2", tp: "suno li tawa anpa ma\\nko lete li lon e kasi\\nmi tawa lon nasin suli\\ntoki pi jan li lete\\nmi toki tawa kon lete\\nona li kute e mi", en: "The sun moves down to the earth.\\nCold paste — frost — is on the plant.\\nI walk on the long road.\\nThe words of people are cold.\\nI speak to the cold air.\\nIt listens to me." },
          { title: "CHORUS", tp: "taso jan li lukin e mi\\nmi pilin e ike ona\\n(mi pilin e ike ona)\\nmi mute li wile pona\\nmi mute li ken ala\\ntaso jan li lukin\\n(ken ala pona)", en: "But people are watching me.\\nI feel their judgment.\\n(I feel their judgment.)\\nWe all want to be good.\\nWe all cannot.\\nBut people are watching.\\n(Cannot be good.)" },
          { title: "BRIDGE", tp: "(Oooooh)\\n(Aaaaah)\\no lukin ala e mi\\no kute e kalama kon\\n(kalama kon)\\nmi wile pona lon ni\\no kute e mi\\n(mi wile pona)", en: "(Oooooh)\\n(Aaaaah)\\nDo not watch me.\\nListen to the sound of the air.\\n(Sound of the air.)\\nI want to be good here.\\nListen to me.\\n(I want to be good.)" },
          { title: "CHORUS", tp: "taso jan li lukin e mi\\nmi pilin e ike ona\\n(mi pilin e ike ona)\\nmi mute li wile pona\\nmi mute li ken ala\\ntaso jan li lukin\\n(ken ala pona)", en: "But people are watching me.\\nI feel their judgment.\\n(I feel their judgment.)\\nWe all want to be good.\\nWe all cannot.\\nBut people are watching.\\n(Cannot be good.)" },
          { title: "OUTRO", tp: "mi lon ma pini\\njan li ala lon ni\\npona li lon\\n(pona li lon)\\nmi lon ni\\n(mi lon ni)", en: "I am at the end of the land.\\nThere are no people here.\\nGoodness exists.\\n(Goodness exists.)\\nI am here.\\n(I am here.)" }
        ]
      },
      {
        title: "06 toki ala",
        titleEn: "No talking",
        deepDive: "A raw confessional folk track with indie rock and minimalist ambient influences, featuring a single prominent acoustic guitar played with delicate fingerpicking — intentionally unpolished with audible fret buzz and room noise.",
        blocks: [
          { title: "VERSE 1", tp: "mi lon supa\\nsina lon supa\\ntelo li lon poki\\npoki li seli ala\\nkiwen li lon uta mi\\nmi wile toki e ijo\\ntaso mi ken ala\\njan li wile e jan\\nlen mi li pimeja\\nkiwen pi supa noka li lete\\n(mi wile toki)", en: "I am on the surface.\\nYou are on the surface.\\nWater is in the container.\\nThe container is not warm.\\nStone is in my mouth.\\nI want to say something.\\nBut I cannot.\\nPeople need people.\\nMy covering is dark.\\nThe stone of the floor is cold.\\n(I want to speak.)" },
          { title: "CHORUS", tp: "mi wile e ni:\\nsina sona e pilin mi\\nmi jan pi toki ala\\nsina jan pi kute ala\\n(o sona e mi)\\n(o sona e mi)", en: "I want this:\\nYou know my feeling.\\nI am a person without words.\\nYou are a person without listening.\\n(Know me.)\\n(Know me.)" },
          { title: "VERSE 2", tp: "ko lili li tawa lon kon\\nsuno li lon selo sina\\nmi lukin e nena sijelo\\nmi kute e kalama ala\\nijo mute li lon insa\\nona li moli lon ni\\nselo mi li pilin seli\\nlipu li lon poki pi moku ala\\nsina tawa e luka sina\\ntaso kute li pini", en: "Small dust moves in the air.\\nSun is on your skin.\\nI look at the contours of the body.\\nI hear no sound.\\nMany things are inside.\\nThey die here.\\nMy skin feels warm.\\nA paper is in a container with no food.\\nYou move your hand.\\nBut listening ends." },
          { title: "CHORUS", tp: "mi wile e ni:\\nsina sona e pilin mi\\nmi jan pi toki ala\\nsina jan pi kute ala\\n(o sona e mi)\\n(o sona e mi)", en: "I want this:\\nYou know my feeling.\\nI am a person without words.\\nYou are a person without listening.\\n(Know me.)\\n(Know me.)" },
          { title: "BRIDGE", tp: "o kute e pilin mi\\no kute e pilin mi\\no kute e pilin mi\\no kute e pilin mi\\n(o kute)\\n(o kute)\\n(o kute)\\n(o kute)", en: "Listen to my feeling.\\nListen to my feeling.\\nListen to my feeling.\\nListen to my feeling.\\n(Listen.)\\n(Listen.)\\n(Listen.)\\n(Listen.)" },
          { title: "OUTRO", tp: "jan li ante\\ntoki li weka\\nsina sona anu seme?\\n(sina sona)\\nmi wile e sina\\n(mi wile)\\npini", en: "People are different.\\nSpeech is gone.\\nDo you know, or not?\\n(You know.)\\nI need you.\\n(I need.)\\nEnd." }
        ]
      },
      {
        title: "07 awa en awen",
        titleEn: "Rejection and remaining",
        deepDive: "A glossy, radio-ready synth-pop track with new romantic influences, built on shimmering FM synthesis, staccato synth leads, and a driving 808 beat that feels both nostalgic and modern.",
        blocks: [
          { title: "VERSE 1", tp: "telo li anpa lon sinpin\\nmi sona e lon\\nkon seli li pona tawa mi\\ntaso mi tawa ala\\n(tawa ala)\\nlawa mi li kepeken wawa\\nmi awen lon tomo\\npali li musi ala\\nmi lukin e suno tan lupa", en: "Water is low on the face — tears fall.\\nI know existence.\\nWarm air is good to me.\\nBut I do not move.\\n(Do not move.)\\nMy mind uses strength.\\nI stay in the house.\\nWork is not fun.\\nI look at the sun through the opening." },
          { title: "CHORUS", tp: "mi wile taso mi ken ala\\n(mi ken ala)\\nlawa mi li toki tawa mi\\ntenpo li tawa wawa\\nmi sona e nasin pona\\nmi awen lon lipu\\n(lon lipu)\\no tawa! o tawa!\\nmi sona e nasin pona\\nmi awen lon ni", en: "I want to but I cannot.\\n(I cannot.)\\nMy mind speaks to me.\\nTime moves fast.\\nI know the good path.\\nI stay on the page.\\n(On the page.)\\nGo! Go!\\nI know the good path.\\nI stay here." },
          { title: "VERSE 2", tp: "toki mi li suwi tawa jan\\nante li lon insa\\nmi len e pilin ike\\ntan ni: mi wile pona\\n(wile pona)\\nutala li lon lawa mi\\nmi sona e pali\\ntaso luka mi li kiwen\\ntenpo pimeja li kama", en: "My words are sweet to people.\\nSomething different is inside.\\nI cover the bad feeling.\\nBecause I want to be good.\\n(Want to be good.)\\nA battle is in my mind.\\nI know the work.\\nBut my hand is stone.\\nDark time comes." },
          { title: "CHORUS", tp: "mi wile taso mi ken ala\\n(mi ken ala)\\nlawa mi li toki tawa mi\\ntenpo li tawa wawa\\nmi sona e nasin pona\\nmi awen lon lipu\\n(lon lipu)\\no tawa! o tawa!\\nmi sona e nasin pona\\nmi awen lon ni", en: "I want to but I cannot.\\n(I cannot.)\\nMy mind speaks to me.\\nTime moves fast.\\nI know the good path.\\nI stay on the page.\\n(On the page.)\\nGo! Go!\\nI know the good path.\\nI stay here." },
          { title: "BRIDGE", tp: "sona li suli\\n(sona li suli)\\npali li lili\\n(pali li lili)\\nmi lon insa pi kon wawa\\nmi tawa ala\\nmi tawa ala\\n(ken ala, ken ala)", en: "Knowledge is great.\\n(Knowledge is great.)\\nThe work is small.\\n(The work is small.)\\nI am inside the strong wind.\\nI do not move.\\nI do not move.\\n(Cannot, cannot.)" },
          { title: "CHORUS", tp: "mi wile taso mi ken ala\\n(mi ken ala)\\nlawa mi li toki tawa mi\\ntenpo li tawa wawa\\nmi sona e nasin pona\\nmi awen lon lipu\\n(lon lipu)\\no tawa! o tawa!\\nmi sona e nasin pona\\nmi awen lon ni", en: "I want to but I cannot.\\n(I cannot.)\\nMy mind speaks to me.\\nTime moves fast.\\nI know the good path.\\nI stay on the page.\\n(On the page.)\\nGo! Go!\\nI know the good path.\\nI stay here." },
          { title: "OUTRO", tp: "mi awen lon ni\\n(toki tawa mi)\\nmi awen lon ni\\n(sona e pali)\\nmi awen", en: "I stay here.\\n(Speak to me.)\\nI stay here.\\n(Know the work.)\\nI remain." }
        ]
      },
      {
        title: "08 mi tawa e ma suli",
        titleEn: "I travel the great land",
        deepDive: "A hyperpop-infused companion piece pushing the brightness and tempo with high-pitched bouncy digital synths and a very prominent tight electronic kick drum.",
        blocks: [
          { title: "VERSE 1", tp: "jan li tawa.\\n(jan li tawa...)\\njan li ala.\\nwawa li lon insa.\\nike li pini.\\n(ike li pini...)", en: "People move.\\n(People move...)\\nThere are no people.\\nStrength is inside.\\nThe bad thing ends.\\n(The bad thing ends...)" },
          { title: "CHORUS", tp: "mi utala e ijo ala.\\npimeja li wawa.\\nwawa li jo e nasin ala.\\nmi tawa. mi utala.\\nike li lon ala.\\ninsa mi li wawa.\\no pini e utala pi ijo ala.\\no pini e utala pi ijo ala.", en: "I fight nothing.\\nThe darkness is strong.\\nStrength has no path.\\nI move. I fight.\\nThe bad thing does not exist.\\nMy inside is strong.\\nEnd the battle of nothing.\\nEnd the battle of nothing." },
          { title: "VERSE 2", tp: "mi lukin e jan ala.\\n(jan ala...)\\nmi tawa e ma suli.\\nwawa li ike.\\nike li tawa.\\nlawa mi li wawa mute.\\n(wawa mute...)\\npini li lon ala.", en: "I see no one.\\n(No one...)\\nI move through the great land.\\nStrength is bad.\\nThe bad thing moves.\\nMy mind is very strong.\\n(Very strong...)\\nThe end does not exist." },
          { title: "CHORUS", tp: "wawa li jo e nasin ala.\\nmi tawa. mi utala.\\nike li lon ala.\\ninsa mi li wawa.\\no pini e utala pi ijo ala.\\no pini e utala pi ijo ala.", en: "Strength has no path.\\nI move. I fight.\\nThe bad thing does not exist.\\nMy inside is strong.\\nEnd the battle of nothing.\\nEnd the battle of nothing." },
          { title: "OUTRO", tp: "ala... ala... wawa... ala...\\njan ala...\\nnasin ala...\\nike li lon ala.\\nala.\\nala.\\nala.", en: "Nothing... nothing... strength... nothing...\\nNo one...\\nNo path...\\nThe bad thing does not exist.\\nNothing.\\nNothing.\\nNothing." }
        ]
      },
      {
        title: "09 ni li nasa",
        titleEn: "This is crazy",
        deepDive: "A high-octane skate punk and melodic hardcore track opening with dual-layered distorted electric guitars playing fast down-picked power chords in a bright major key.",
        blocks: [
          { title: "VERSE 1", tp: "mi lukin e ni\\nseme li lon kon?\\nni li ike. ni li nasa.\\nmi wawa ala!\\nkon li pini ala.", en: "I see this.\\nWhat is in the air?\\nThis is bad. This is strange.\\nI have no power!\\nThe unseen never ends." },
          { title: "CHORUS 1", tp: "seme? seme?\\nni li nasa!\\nwawa mi li lili!\\nwawa ala! wawa ala!", en: "What? What?\\nThis is crazy!\\nMy strength is so little!\\nPowerless! Powerless!" },
          { title: "VERSE 2", tp: "kon li tawa. mi tawa ala.\\nmi wawa. mi wawa ala.\\nike o tawa! nasa o tawa!\\nseme li lon poka mi?", en: "The unseen moves. I am frozen.\\nI am strong. I am not strong.\\nBadness, go away! Strangeness, go away!\\nWhat is right beside me?" },
          { title: "CHORUS 2", tp: "seme? seme?\\nni li nasa!\\nwawa mi li lili!\\nwawa ala! wawa ala!", en: "What? What?\\nThis is crazy!\\nMy strength is so little!\\nPowerless! Powerless!" },
          { title: "BREAKDOWN", tp: "ala... ala... seme?\\nni li ike... ni li nasa...\\nkon li wawa...\\nmi ala.", en: "Nothing... nothing... what?\\nThis is bad... this is strange...\\nThe unseen is powerful...\\nI am nothing." },
          { title: "FINAL CHORUS", tp: "seme! seme!\\nni li nasa!\\nwawa mi li lili!\\nwawa ala! wawa ala!", en: "What! What!\\nThis is crazy!\\nMy strength is so little!\\nPowerless! Powerless!" },
          { title: "OUTRO", tp: "ala!\\nseme ala!", en: "Nothing!\\nNo more questions!" }
        ]
      },
      {
        title: "10 mi mute o musi",
        titleEn: "Let us all play",
        deepDive: "A euphoric hyperpop anthem opening with jittery high-pitched sawtooth arpeggios and metallic textures simulating chaotic digital noise powering up.",
        blocks: [
          { title: "VERSE 1", tp: "kalama mute li lon poka mi.\\npilin wawa li kama.\\nlon lawa mi la, wawa li suli.\\nmi mute o toki.\\nmi mute o musi.", en: "Many sounds are beside me.\\nStrong feeling comes.\\nIn my mind, strength is great.\\nLet us all speak.\\nLet us all play." },
          { title: "CHORUS", tp: "toki o kama!\\nkalama o kama!\\npilin wawa li open!\\nmi mute o musi mute!\\nmi mute o musi mute!", en: "Let speech come!\\nLet sound come!\\nStrong feeling opens!\\nLet us all play loud!\\nLet us all play loud!" },
          { title: "VERSE 2", tp: "pimeja li lon la, mi mute li toki.\\n(o toki, o toki!)\\nwawa pilin li kama suli.\\n(kama suli!)\\nkon pona li lon poka mi.\\n(kon pona!)", en: "When darkness is present, we speak.\\n(Speak! Speak!)\\nStrong feeling becomes great.\\n(Become great!)\\nGood spirit is beside me.\\n(Good spirit!)" },
          { title: "CHORUS", tp: "toki o kama!\\nkalama o kama!\\npilin wawa li open!\\nmi mute o musi mute!\\nmi mute o musi mute!", en: "Let speech come!\\nLet sound come!\\nStrong feeling opens!\\nLet us all play loud!\\nLet us all play loud!" },
          { title: "BRIDGE", tp: "mute mute mute mute...\\nmute mute mute mute...\\nmute!", en: "Many many many many...\\nMany many many many...\\nMany!" },
          { title: "FINAL CHORUS", tp: "toki o kama!\\nkalama o kama!\\npilin wawa li open!\\nmi mute o musi mute!\\nmi mute o musi mute!", en: "Let speech come!\\nLet sound come!\\nStrong feeling opens!\\nLet us all play loud!\\nLet us all play loud!" },
          { title: "OUTRO", tp: "pona o lon.\\nmusi o pini.\\npilin wawa li lon.", en: "Let goodness exist.\\nLet play end.\\nStrong feeling exists." }
        ]
      },
      {
        title: "11 noka en ma",
        titleEn: "Feet and earth",
        deepDive: "An atmospheric heartland rock track driven by a steady motorik rhythm at 108 BPM, featuring warm distorted guitars, hazy layered synths, and a gritty resonant bass.",
        blocks: [
          { title: "VERSE 1", tp: "mi tawa lon nasin ni\\nnoka mi li pilin e ma\\nma li seli\\nma li lete kin\\ntenpo li tawa mawa\\nmi sona ala e ni\\nmi lon seme a\\n(lon seme a)\\nma li kute e mi", en: "I walk on this road.\\nMy feet feel the earth.\\nThe land is warm.\\nThe land is also cold.\\nTime drifts away.\\nI do not know this.\\nWhere am I?\\n(Where?)\\nThe land hears me." },
          { title: "CHORUS", tp: "ma li lon noka mi\\nmi tawa tan ma mi\\ntelo li pini e weka\\nma li lon noka mi\\n(ma li lon noka mi)\\nma li lon noka mi\\n(lon noka mi)", en: "The earth is under my feet.\\nI move away from my land.\\nWater ends the distance.\\nThe earth is under my feet.\\n(The earth is under my feet.)\\nThe earth is under my feet.\\n(Under my feet.)" },
          { title: "VERSE 2", tp: "telo li anpa tan sewi\\nmi weka e ijo mute\\nmi weka e pilin pi tenpo pini\\ntelo li telo e len mi\\nma li weka ala\\nma li awen lon noka\\n(li awen lon noka)\\nmi tawa mute\\nmi tawa mute a", en: "Water falls from above.\\nI leave many things behind.\\nI leave behind the feeling of past time.\\nWater soaks my clothing.\\nThe land does not go away.\\nThe land remains underfoot.\\n(Remains underfoot.)\\nI move far.\\nI move so far." },
          { title: "CHORUS", tp: "ma li lon noka mi\\nmi tawa tan ma mi\\ntelo li pini e weka\\nma li lon noka mi\\n(ma li lon noka mi)\\nma li lon noka mi\\n(lon noka mi)", en: "The earth is under my feet.\\nI move away from my land.\\nWater ends the distance.\\nThe earth is under my feet.\\n(The earth is under my feet.)\\nThe earth is under my feet.\\n(Under my feet.)" },
          { title: "BRIDGE", tp: "noka li sona\\nnoka li sona e ma\\n(sona e ma)\\ntan tenpo pini\\ntan tenpo pini a\\nnoka li sona\\nnoka li sona e ma\\n(sona e ma)\\ntan tenpo pini\\n(noka li sona)", en: "Feet know.\\nFeet know the earth.\\n(Know the earth.)\\nFrom past time.\\nFrom so long ago.\\nFeet know.\\nFeet know the earth.\\n(Know the earth.)\\nFrom past time.\\n(Feet know.)" },
          { title: "FINAL CHORUS", tp: "ma li lon noka mi\\nmi tawa tan ma mi\\ntelo li pini e weka\\nma li lon noka mi\\n(ma li lon noka mi)\\nma li lon noka mi\\n(lon noka mi)", en: "The earth is under my feet.\\nI move away from my land.\\nWater ends the distance.\\nThe earth is under my feet.\\n(The earth is under my feet.)\\nThe earth is under my feet.\\n(Under my feet.)" },
          { title: "OUTRO", tp: "mi tawa\\n(mi tawa)\\nmi tawa\\n(mi tawa)\\nnoka mi\\nma mi\\nnoka mi\\nma mi\\n(ma li lon)", en: "I move.\\n(I move.)\\nI move.\\n(I move.)\\nMy feet.\\nMy land.\\nMy feet.\\nMy land.\\n(The land exists.)" }
        ]
      },
      {
        title: "12 mi lon",
        titleEn: "I exist",
        deepDive: "A cinematic post-rock journey opening as a meditative minimalist ambient track with slow reverb-drenched electric guitar swells and no traditional rhythm.",
        blocks: [
          { title: "VERSE 1", tp: "mi pilin e ma\\ntelo li kama\\nmi lon ni\\nma li jo e mi\\nsuno li kama\\ntomo ala li lon\\nmi pilin e kon\\nali li pona", en: "I feel the earth.\\nWater comes.\\nI am here.\\nThe land holds me.\\nThe sun comes.\\nThere are no buildings.\\nI feel the air.\\nEverything is good." },
          { title: "CHORUS", tp: "kala lon telo!\\nsoweli lon ma!\\nwaso lon kon!", en: "Fish are in the water!\\nAnimals are on the land!\\nBirds are in the air!" },
          { title: "BRIDGE", tp: "ni li lon\\nmi lon\\nsina lon\\nali li lon", en: "This exists.\\nI exist.\\nYou exist.\\nEverything exists." },
          { title: "CLIMAX", tp: "lon!\\nlon!\\nlon!", en: "Exist!\\nExist!\\nExist!" },
          { title: "OUTRO", tp: "(lon...)", en: "(Existing...)" }
        ]
      },
      {
        title: "13 ni li pona",
        titleEn: "This is good",
        deepDive: "A gentle sun-drenched bossa nova anchored by a classic nylon-string guitar progression with a soft unhurried rhythm, light brushed percussion, and a swaying bassline.",
        blocks: [
          { title: "VERSE 1", tp: "suno li lon supa\\ntelo seli li seli lon luka\\n(seli pona)\\nmi mute li lape pona\\ntomo li seli\\njan pona li lon ni", en: "Sun is on the surface.\\nWarm water warms the hand.\\n(Good warmth.)\\nWe all rest well.\\nThe home is warm.\\nA good person is here." },
          { title: "VERSE 2", tp: "moku pona li lon supa\\nkiwen lili li kalama lon sewi\\ntelo li pana e seli\\n(telo li pana)\\nmi mute li pilin e ona\\nmi mute li lon", en: "Good food is on the surface.\\nA small stone makes sound above.\\nWater gives warmth.\\n(Water gives.)\\nWe all feel it.\\nWe all exist." },
          { title: "CHORUS", tp: "ni li pona\\nni li pona tawa mi\\n(pona mute)\\ntomo li seli\\nmi mute li pona\\n(ni li pona)", en: "This is good.\\nThis is good to me.\\n(So much goodness.)\\nThe home is warm.\\nWe are all good.\\n(This is good.)" },
          { title: "BRIDGE", tp: "kasi li tawa lon monsi\\ntelo li anpa tan sewi\\nmi mute li lon tomo\\nmi mute li lon seli\\n(mi lon ni)", en: "Plants sway behind.\\nWater falls from above.\\nWe are all in the home.\\nWe are all in the warmth.\\n(I am here.)" },
          { title: "VERSE 3", tp: "luka mi li pilin e supa\\nkasi lili li lon poka\\njan pona li toki lili\\n(toki lili)\\ntenpo li tawa pi kalama ala\\nmi mute li pona", en: "My hand feels the surface.\\nA small plant is in the container.\\nA good person speaks softly.\\n(Soft words.)\\nTime passes without sound.\\nWe are all good." },
          { title: "CHORUS", tp: "ni li pona\\nni li pona tawa mi\\n(pona mute)\\ntomo li seli\\nmi mute li pona\\n(ni li pona)", en: "This is good.\\nThis is good to me.\\n(So much goodness.)\\nThe home is warm.\\nWe are all good.\\n(This is good.)" },
          { title: "OUTRO", tp: "ni li pona\\n(pona)\\nni li pona\\n(pona)", en: "This is good.\\n(Good.)\\nThis is good.\\n(Good.)" }
        ]
      }
    ]
  },
  {
    id: "utala-kon",
    title: "utala kon",
    titleEn: "Spirit War",
    scUrl: "https://soundcloud.com/ansoni-482276927/sets/utala-kon",
    breakdown: "utala = fight/war, kon = air/spirit",
    explanation: "I titled this record war of air because that is the most accurate description I have for what the whole recording process felt like. Not a war with something you can see or touch or reason with. A war with pressure. With atmosphere... I traded everything delicate for this record. What replaced all of that is down-tuned guitars so low they buzz before you even play a note, sub-bass pulses you feel in your sternum, programmed breakbeats running at 160 BPM that sound erratic and cornered from the first second, and turntable scratches cutting through the mix like something being interrupted mid-sentence. I made those choices deliberately. This was not me losing control of the production. This was me deciding that control was the wrong tool for what I was trying to say.",
    tracks: [
      {
        title: "01 wawa kama",
        titleEn: "Arriving power",
        breakdown: "wawa = power/energy, kama = coming/arriving",
        explanation: "The build-up of energy or tension before a struggle.",
        deepDive: "The first vocal sound on the record is a long, strained exhale, like someone bracing for impact. It is immediately swallowed by a distorted sub-bass drop and a frantic drum break. There is no melodic introduction. The track starts in a state of panic and stays there.",
        blocks: [
          { title: "INTRO", tp: "(kon li kama)\n(kon li kama...)", en: "(The air is coming)\n(The air is coming...)" },
          { title: "VERSE 1", tp: "mi kute e kalama lon pimeja.\nona li lili, taso ona li suli.\nmi lukin ala e ijo,\ntaso mi pilin e seli.\nwawa li kama.\nona li kama suli.", en: "I hear a sound in the dark.\nIt is small, but it is huge.\nI don't see anything,\nbut I feel the heat.\nPower is coming.\nIt is becoming massive." },
          { title: "CHORUS", tp: "wawa kama!\n(wawa kama!)\nmi ken ala awen!\n(ken ala!)\nkon li utala e mi!\n(utala!)\no lukin e noka mi,\nona li tawa ala!", en: "Arriving power!\n(Arriving power!)\nI cannot wait!\n(Cannot!)\nThe air fights me!\n(Fights!)\nLook at my feet,\nthey are not moving!" },
          { title: "VERSE 2", tp: "seli li moku e kon.\nmi wile toki, taso uta mi li kiwen.\nnena mi li pilin e suli.\nni li pakala.\nni li pakala pi wawa.", en: "The heat consumes the air.\nI want to speak, but my mouth is stone.\nMy chest feels the weight.\nThis is destruction.\nThis is the destruction of power." },
          { title: "CHORUS", tp: "wawa kama!\n(wawa kama!)\nmi ken ala awen!\n(ken ala!)\nkon li utala e mi!\n(utala!)\no lukin e noka mi,\nona li tawa ala!", en: "Arriving power!\n(Arriving power!)\nI cannot wait!\n(Cannot!)\nThe air fights me!\n(Fights!)\nLook at my feet,\nthey are not moving!" },
          { title: "OUTRO", tp: "wawa.\nkama.\n(pakala...)", en: "Power.\nComing.\n(Destruction...)" }
        ]
      },
      {
        title: "02 nasin li ken ala",
        titleEn: "The path is impossible",
        breakdown: "nasin = path, li = [verb marker], ken ala = cannot/impossible",
        explanation: "Facing an impassable obstacle or feeling stuck.",
        deepDive: "Built around a jagged, repeating bassline that trips over itself in a 7/8 time signature, creating a visceral sensation of stumbling or walking with a limp. The vocals are delivered through heavy distortion, sounding like they are being shouted through a broken intercom.",
        blocks: [
          { title: "VERSE 1", tp: "nasin li lon, taso mi ken ala tawa.\nkiwen li suli mute.\nmi wile tawa sewi.\nmi wile tawa monsi.\\ntaso nasin li pini.\\n(nasin li pini.)", en: "The path is here, but I cannot move.\\nThe rocks are too big.\\nI want to go up.\\nI want to go back.\\nBut the path is finished.\\n(The path is finished.)" },
          { title: "CHORUS", tp: "ken ala!\\n(nasin li ken ala!)\\nmi lukin e ma, taso ma li kiwen!\\n(ma li kiwen!)\\nken ala!\\n(mi ken ala tawa!)\\nmi awen lon pimeja ni!", en: "Impossible!\\n(The path is impossible!)\\nI look at the land, but the land is stone!\\n(The land is stone!)\\nImpossible!\\n(I cannot move!)\\nI stay in this darkness!" },
          { title: "VERSE 2", tp: "luka mi li pakala tan kiwen.\\nmi utala e nasin.\\nnasin li kute ala.\\nona li lukin e mi.\\nona li musi e mi.", en: "My hands are broken from the rocks.\\nI fight the path.\\nThe path does not listen.\\nIt looks at me.\\nIt laughs at me (makes fun of me)." },
          { title: "CHORUS", tp: "ken ala!\\n(nasin li ken ala!)\\nmi lukin e ma, taso ma li kiwen!\\n(ma li kiwen!)\\nken ala!\\n(mi ken ala tawa!)\\nmi awen lon pimeja ni!", en: "Impossible!\\n(The path is impossible!)\\nI look at the land, but the land is stone!\\n(The land is stone!)\\nImpossible!\\n(I cannot move!)\\nI stay in this darkness!" },
          { title: "OUTRO", tp: "nasin... ken ala.\\n(ken ala...)\\nmi awen.\\nmi awen.", en: "The path... impossible.\\n(Impossible...)\\nI stay.\\nI stay." }
        ]
      },
      {
        title: "03 pini li kama",
        titleEn: "The end is coming",
        breakdown: "pini = end, kama = come",
        explanation: "Anticipating the conclusion of the struggle.",
        deepDive: "The lead single. It features a relentless 160 BPM drum 'n' bass rhythm that feels entirely out of breath. The guitars are heavily palm-muted, churning aggressively in the low frequencies while the lead vocal rides directly on the snare hits, spitting out the words with venomous precision.",
        blocks: [
          { title: "VERSE 1", tp: "tenpo li tawa wawa.\\nmi kute e kalama pi noka suli.\\nijo li kama lon monsi mi.\\nmi tawa wawa, taso ona li wawa mute.\\n(ona li wawa mute!)", en: "Time is moving fast.\\nI hear the sound of heavy footsteps.\\nSomething is coming behind me.\\nI run fast, but it is much faster.\\n(It is much faster!)" },
          { title: "CHORUS", tp: "pini li kama!\\no lukin! o kute!\\npini li kama!\\nmi ken ala weka!\\n(weka! weka!)\\nijo suli li lon poka!\\npini li kama!", en: "The end is coming!\\nLook! Listen!\\nThe end is coming!\\nI cannot get away!\\n(Away! Away!)\\nA massive thing is near!\\nThe end is coming!" },
          { title: "VERSE 2", tp: "mi lukin e suno lon sinpin.\\ntaso pimeja li moku e suno.\\nmi utala e kon.\\nmi utala e tenpo.\\ntaso pini li lawa.", en: "I see the light ahead.\\nBut the darkness consumes the light.\\nI fight the air.\\nI fight the time.\\nBut the end is in control." },
          { title: "CHORUS", tp: "pini li kama!\\o lukin! o kute!\\npini li kama!\\nmi ken ala weka!\\n(weka! weka!)\\nijo suli li lon poka!\\npini li kama!", en: "The end is coming!\\nLook! Listen!\\nThe end is coming!\\nI cannot get away!\\n(Away! Away!)\\nA massive thing is near!\\nThe end is coming!" },
          { title: "BRIDGE", tp: "pini! pini!\\no kama wawa!\\nmi pini e utala.\\nmi lukin e sina.\\n(kama!)", en: "End! End!\\nCome quickly!\\nI finish the fight.\\nI look at you.\\n(Come!)" },
          { title: "OUTRO", tp: "pini li lon.\\npini.\\n(a!)", en: "The end is here.\\nEnd.\\n(Ah!)" }
        ]
      },
      {
        title: "04 toki ike",
        titleEn: "Bad talk",
        breakdown: "toki = talk, ike = bad/negative",
        explanation: "Dealing with negativity or harsh internal dialogue.",
        deepDive: "A claustrophobic track where the vocals overlap each other aggressively, panning left and right to mimic racing, intrusive thoughts. Turntable scratches act like violently intrusive corrections, stopping lines abruptly mid-sentence.",
        blocks: [
          { title: "VERSE 1", tp: "lawa mi li toki.\\nona li toki mute.\\nona li toki ike tawa mi.\\n\\\"sina pakala. sina lili. sina wawa ala.\\\"\\n(wawa ala... wawa ala...)", en: "My head is speaking.\\nIt speaks a lot.\\nIt speaks badly to me.\\n\\\"You are broken. You are small. You are not strong.\\\"\\n(Not strong... not strong...)" },
          { title: "CHORUS", tp: "toki ike!\\no pini! o pini!\\ntoki ike li seli e lawa mi!\\nmi wile kute e ala!\\n(e ala!)\\ntoki ike li utala e mi!", en: "Bad talk!\\nStop! Stop!\\nBad talk burns my head!\\nI want to hear nothing!\\n(Nothing!)\\nBad talk attacks me!" },
          { title: "VERSE 2", tp: "mi olin ala e toki ni.\\ntaso ona li lon insa.\\nmi tawa weka, taso lawa li tawa poka.\\nkalama li suli.\\nkalama li ike.", en: "I do not love this talk.\\nBut it is inside.\\nI walk away, but my head walks with me.\\nThe sound is loud.\\nThe sound is bad." },
          { title: "CHORUS", tp: "toki ike!\\no pini! o pini!\\ntoki ike li seli e lawa mi!\\nmi wile kute e ala!\\n(e ala!)\\ntoki ike li utala e mi!", en: "Bad talk!\\nStop! Stop!\\nBad talk burns my head!\\nI want to hear nothing!\\n(Nothing!)\\nBad talk attacks me!" },
          { title: "OUTRO", tp: "toki... toki...\\n(ike...)\\no pini.", en: "Talk... talk...\\n(Bad...)\\nStop." }
        ]
      },
      {
        title: "05 lukin moli",
        titleEn: "Deadly look",
        breakdown: "lukin = look/see, moli = death",
        explanation: "A severe or final perspective.",
        deepDive: "A grinding, mechanical dirge. Slower than the rest of the EP (around 85 BPM), it uses heavily compressed snare hits that sound like factory machinery stamping metal. The synths are harsh and abrasive, mimicking the feeling of being scrutinized by something hostile.",
        blocks: [
          { title: "VERSE 1", tp: "oko sina li sewi.\\nona li lukin e mi.\\nmi ken ala len e mi.\\noko sina li seli e selo mi.\\n(seli e selo mi...)", en: "Your eyes are above.\\nThey look at me.\\nI cannot hide myself.\\nYour eyes burn my skin.\\n(Burn my skin...)" },
          { title: "CHORUS", tp: "lukin moli!\\n(lukin moli!)\\nsina lukin la, mi pakala!\\nsina sona e ike mi ale!\\nlukin moli li moku e mi!\\n(moku e mi!)", en: "Deadly look!\\n(Deadly look!)\\nWhen you look, I break!\\nYou know all my flaws!\\nThe deadly look consumes me!\\n(Consumes me!)" },
          { title: "VERSE 2", tp: "mi wile e pimeja.\\npimeja li len e pakala.\\ntaso suno sina li wawa.\\nona li lukin e insa mi.\\ninsa mi li ike.", en: "I want the darkness.\\nThe darkness hides the brokenness.\\nBut your light is strong.\\nIt looks at my insides.\\nMy insides are bad." },
          { title: "CHORUS", tp: "lukin moli!\\n(lukin moli!)\\nsina lukin la, mi pakala!\\nsina sona e ike mi ale!\\nlukin moli li moku e mi!\\n(moku e mi!)", en: "Deadly look!\\n(Deadly look!)\\nWhen you look, I break!\\nYou know all my flaws!\\nThe deadly look consumes me!\\n(Consumes me!)" },
          { title: "OUTRO", tp: "lukin.\\n(moli.)\\no weka e oko sina.", en: "Look.\\n(Death.)\\nTake your eyes away." }
        ]
      },
      {
        title: "06 mi olin e ike",
        titleEn: "I love the bad",
        breakdown: "mi = I, olin = love, e = [object marker], ike = bad",
        explanation: "Embracing flaws or finding comfort in difficult things.",
        deepDive: "A twisted, warped groove that almost feels like a perverse waltz. The bass is thick and detuned, sliding woozily between notes. It is the sound of giving up and finding comfort in the mud.",
        blocks: [
          { title: "VERSE 1", tp: "pona li suli.\\npona li wile e pali mute.\\nmi wawa ala tawa pona.\\nike li anpa.\\nike li seli e mi.", en: "Good is high up.\\nGood requires a lot of work.\\nI am not strong enough for good.\\nBad is down low.\\nBad warms me." },
          { title: "CHORUS", tp: "mi olin e ike!\\n(olin e ike!)\\nona li lon poka mi!\\nona li wile ala e ante!\\nmi pakala, ona li pakala!\\nmi mute li wan lon pakala!", en: "I love the bad!\\n(Love the bad!)\\nIt is right beside me!\\nIt does not want change!\\nI am broken, it is broken!\\nWe are united in brokenness!" },
          { title: "VERSE 2", tp: "mi lape lon ko.\\nko li pimeja, li pona tawa mi.\\njan pona li tawa weka.\\njan ike li awen.\\nmi awen poka ona.", en: "I sleep in the dirt.\\nThe dirt is dark, it is good to me.\\nGood people walk away.\\nJan ike li awen.\\nI stay beside them." },
          { title: "CHORUS", tp: "mi olin e ike!\\n(olin e ike!)\\nona li lon poka mi!\\nona li wile ala e ante!\\nmi pakala, ona li pakala!\\nmi mute li wan lon pakala!", en: "I love the bad!\\n(Love the bad!)\\nIt is right beside me!\\nIt does not want change!\\nI am broken, it is broken!\\nWe are united in brokenness!" },
          { title: "OUTRO", tp: "olin... ike.\\n(ike li pona.)\\nmi lape.", en: "Love... bad.\\n(Bad is good.)\\nI sleep." }
        ]
      },
      {
        title: "07 mi awen lon ni",
        titleEn: "I stay right here",
        breakdown: "mi = I, awen = stay/wait, lon ni = at this",
        explanation: "Holding one's ground.",
        deepDive: "The turning point of the EP. The frantic breakbeats stop. The track is built on a slow, monolithic fuzz bass that hits like a battering ram, and a massive, echoing snare. It is the sound of planting your feet and refusing to be pushed anymore.",
        blocks: [
          { title: "VERSE 1", tp: "utala li suli.\\nmi anpa lon tenpo mute.\\ntaso tenpo ni la,\\nmi anpa ala.\\nnoka mi li kiwen.", en: "The fight is massive.\\nI have fallen down many times.\\nBut this time,\\nI do not fall.\\nMy feet are stone." },
          { title: "CHORUS", tp: "mi awen lon ni!\\n(awen lon ni!)\\no kama, o utala e mi!\\nmi tawa weka ala!\\nkon ike o tawa!\\nmi awen!", en: "I stay right here!\\n(Stay right here!)\\nCome, attack me!\\nI will not run away!\\nBad wind, blow!\\nI stay!" },
          { title: "VERSE 2", tp: "pakala li kama.\\nmi kute e ona.\\nmi lukin e ona.\\nmi pilin e ona.\\ntaso mi lon.\\n(mi lon!)", en: "Destruction is coming.\\nI hear it.\\nI see it.\\nI feel it.\\nBut I am here.\\n(I am here!)" },
          { title: "CHORUS", tp: "mi awen lon ni!\\n(awen lon ni!)\\no kama, o utala e mi!\\nmi tawa weka ala!\\nkon ike o tawa!\\nmi awen!", en: "I stay right here!\\n(Stay right here!)\\nCome, attack me!\\nI will not run away!\\nBad wind, blow!\\nI stay!" },
          { title: "BRIDGE", tp: "kiwen! wawa!\\nawen! lon!\\nmi weka ala!", en: "Stone! Power!\\nStay! Real!\\nI will not leave!" },
          { title: "OUTRO", tp: "mi awen.\\n(awen.)\\nlon ni.", en: "I stay.\\n(Stay.)\\nRight here." }
        ]
      },
      {
        title: "08 pini ala",
        titleEn: "No end",
        breakdown: "pini = end, ala = no/not",
        explanation: "A continuous cycle without a clear resolution.",
        deepDive: "The bonus track and the EP's true final word, designed to occupy the specific moment the main sequence never shows: the strange quiet after the anger has fully discharged. A single down-tuned electric guitar with long natural decay, muffled kick and distant hi-hat. The track has no build, no release, and no resolution by design.",
        blocks: [
          { title: "VERSE 1", tp: "utala li pini.\\ntaso pona li kama ala.\\nkalama li weka.\\nmi lon insa pi kalama ala.\\n(kalama ala...)", en: "The fight is finished.\\nBut peace does not come.\\nThe sound is gone.\\nI am inside the silence.\\n(Silence...)" },
          { title: "CHORUS", tp: "o pilin sama ni:\\nmi ante lon ni.\\nmi sama ala.\\n(mi sama ala...)", en: "Feel it like this:\\nI have changed here.\\nI am not the same.\\n(I am not the same...)" },
          { title: "VERSE 2", tp: "lon li ante,\\nlon li pini.\\npilin mi li lon,\\ntaso ona li ante.", en: "Reality is different,\\npresence comes to an end.\\nMy feeling remains,\\nbut it has changed." },
          { title: "CHORUS", tp: "o pilin sama ni:\\nmi ante lon ni.\\nmi sama ala.\\n(mi sama ala...)", en: "Feel it like this:\\nI have changed here.\\nI am not the same.\\n(I am not the same...)" },
          { title: "BRIDGE", tp: "lon li lon...\\npilin li lon...", en: "Existence is just existence...\\nFeeling is just presence..." },
          { title: "CHORUS", tp: "o pilin sama ni:\\nmi ante lon ni.\\nmi sama ala.\\n(mi sama ala...)", en: "Feel it like this:\\nI have changed here.\\nI am not the same.\\n(I am not the same...)" },
          { title: "OUTRO", tp: "pini.", en: "Finished." }
        ]
      }
    ]
  },
  {
    id: "toki-nasa",
    title: "toki nasa, kalama pona",
    titleEn: "Weird Speech, Good Sounds",
    scUrl: "https://soundcloud.com/ansoni-482276927/sets/toki-nasa-kalama-pona",
    breakdown: "toki nasa = weird talking, kalama pona = good music",
    explanation: "An upbeat, experimental EP. It contrasts 'nasa' (strange, unconventional) with 'pona' (good, simple) to show that weird things can still be beautiful.\\n\\nI want to be honest with you about why this record exists... I was exhausted from the weight of interiority. So I sat alone in my apartment and I built a stadium. I want you to put this on when you are exhausted from being inside your own head and let the structure of it make the decision for you.",
    tracks: [
      {
        title: "01 o tawa wawa",
        titleEn: "Go fast!",
        breakdown: "o = [command], tawa = move, wawa = power/fast",
        explanation: "An energetic push forward.",
        deepDive: "A driving idol-pop opener built on a four-on-the-floor kick at 126 BPM in B Major. The track's DNA is a bright interlocking synth melody that anchors every section, returning in the intro and exploding wide in the stereo chorus. The rhythmic foundation pairs a relentless kick with a crisp multi-layered snare that cuts through the mix, while the lead vocals alternate between a confident melodic delivery and punchy call-and-response ad-libs.",
        blocks: [
          { title: "INTRO", tp: "(a!) (a!) (a!)", en: "(Hey!) (Hey!) (Hey!)" },
          { title: "VERSE 1", tp: "kalama li open\\nmi kute e wawa\\nsijelo mi li seli\\ntenpo ni li wawa\\n(wawa!)\\nmi pali ala\\nmusi li lawa\\nsina seli mute\\nmi seli kin", en: "The sound begins\\nI hear the power\\nMy body is hot\\nThis moment is powerful\\n(wawa!)\\nI am not doing anything\\nThe music is leading\\nYou are very hot\\nI am hot too" },
          { title: "PRE-CHORUS", tp: "mi ken ala lawa e pilin\\ntelo loje li seli mute\\nsina tawa lon kon mi\\n(lon kon mi)\\nmusi li lon insa mi\\n(insa mi)\\nona li wawa!", en: "I cannot control the feeling\\nMy blood is very warm\\nYou move in my spirit\\n(in my spirit)\\nThe music is inside me\\n(inside me)\\nIt is powerful!" },
          { title: "CHORUS", tp: "o tawa!\\nmusi li wawa\\n(musi li wawa)\\no tawa!\\nseli li tawa\\n(seli li tawa)\\nmi musi\\nmi wawa\\no tawa!\\n(TAWA!)", en: "Move!\\nThe music is power\\n(The music is power)\\nMove!\\nThe heat moves\\n(The heat moves)\\nI am having fun\\nI am strong\\nMove!\\n(MOVE!)" },
          { title: "VERSE 2", tp: "musi li kute\\nmi kute e musi\\nona li uta\\nli uta e mi\\nwan, tu, tawa!\\nmi tawa mute\\nona li wawa\\nmi tawa mute\\n(tawa mute!)", en: "The music is hearing\\nI hear the music\\nIt is a mouth\\nAnd it kisses me\\nOne, two, move!\\nI move a lot\\nIt is powerful\\nI move a lot\\n(move a lot!)" },
          { title: "BRIDGE", tp: "o kute e pilin\\no kute e kalama\\nmi pali ala\\nmusi li tawa e mi!\\n(ona li tawa e mi!)\\nmi seli!\\nmi wawa!\\na!", en: "Listen to the heart\\nListen to the sound\\nI am not acting\\nThe music moves me!\\n(It moves me!)\\nI'm burning!\\nI'm powerful!\\nAH!" },
          { title: "OUTRO", tp: "musi li wawa\\n(wawa!)\\nseli li tawa\\n(tawa!)\\no tawa!\\nmusi!", en: "The music is power\\n(power!)\\nThe heat moves\\n(moves!)\\nMove!\\nMusic!" }
        ]
      },
      {
        title: "02 lukin sama",
        titleEn: "Looking the same",
        breakdown: "lukin = look, sama = same",
        explanation: "Observing similarities or feeling stuck in a loop.",
        deepDive: "A mid-tempo track at 115 BPM in A Major, built on a bouncy melodic synth bass that interlocks with rhythmic mallet accents and lush string swells in the pre-chorus. The production stays intimate and close-mic'd through the verses, then expands into a wide layered vocal hook on the chorus without ever losing its warmth.",
        blocks: [
          { title: "INTRO", tp: "(u-wa) (u-wa)", en: "(Ooh-woah) (Ooh-woah)" },
          { title: "VERSE 1", tp: "mi lon tomo musi suli ni\\nsuno mute li suli e kon\\njan mute li musi li kalama\\ntaso lukin mi li tawa sina\\n(tawa sina, tawa sina)", en: "I am at this big, fun house\\nMany lights make the air feel big\\nMany people are having fun and making noise\\nBut my gaze goes to you\\n(goes to you, goes to you)" },
          { title: "PRE-CHORUS", tp: "tenpo li pona li open\\npilin mi li wile e sina\\no lukin tawa ma mi ni\\no kama tawa mi", en: "The time is good and it is beginning\\nMy heart wants you\\nLook toward this place of mine\\nCome to me" },
          { title: "CHORUS", tp: "jan pona o, o lukin e mi\\nmi wile e ni: sina pona\\npilin olin li kama suli\\nlukin sina li sama mi anu seme?\\n(anu seme? anu seme?)\\no lukin e mi, jan pona o", en: "O good person, look at me\\nI want this: for you to be good\\nThe feeling of love is becoming great\\nIs your gaze like mine, or what?\\n(or what? or what?)\\nLook at me, good person" },
          { title: "POST-CHORUS", tp: "lukin, lukin, lukin\\n(o lukin e mi)\\npona, pona, pona\\n(o pona e mi)\\nsama, sama, sama\\n(o sama e mi)", en: "Look, look, look\\n(Look at me)\\nGood, good, good\\n(Be good to me)\\nSame, same, same\\n(Be the same as me)" },
          { title: "VERSE 2", tp: "lipu kasi li open lon insa\\nkili lili li suli e olin\\nmi utala ala e tenpo\\nmi olin e toki pi lukin sina\\n(lukin sina, lukin sina)", en: "A book of plants opens inside\\nSmall fruits make love grow\\nI don't fight against time\\nI love the language of your gaze\\n(your gaze, your gaze)" },
          { title: "BRIDGE", tp: "mu... mu... mu... (kalama pi pilin mi)\\nmu... mu... mu... (kalama pi pilin sina)\\ntenpo li awen lili\\nsuno li tawa sike\\no open e pilin pona", en: "mu... mu... mu... (the sound of my heart)\\nmu... mu... mu... (the sound of your heart)\\nTime stays a little while\\nThe sun moves in a circle\\nOpen up the good feeling" },
          { title: "OUTRO", tp: "jan pona o\\n(o lukin)\\nlukin sama\\n(o pona)\\nmi olin e sina\\n(o open)\\nsama...\\npona...", en: "Good person\\n(look)\\nLooking the same\\n(be good)\\nI love you\\n(open)\\nSame...\\nGood..." },
          { title: "POST-CHORUS", tp: "lukin, lukin, lukin\\n(o lukin e mi)\\npona, pona, pona\\n(o pona e mi)\\nsama, sama, sama\\n(o sama e mi)", en: "Look, look, look\\n(Look at me)\\nGood, good, good\\n(Be good to me)\\nSame, same, same\\n(Be the same as me)" }
        ]
      },
      {
        title: "03 o kule e kon",
        titleEn: "Color the air",
        breakdown: "o = [command], kule = color, e = [object marker], kon = air",
        explanation: "A creative directive to liven up the atmosphere.",
        deepDive: "The EP's breath — an airy, dreamy track that opens without drums, establishing wide open space through shimmering synth pads, crystalline reverb tails, and wind chime percussion. The verses are built on a warm bell-like electric piano with jazz-influenced chords, a muffled kick, and a dry quiet snare sitting slightly behind the beat.",
        blocks: [
          { title: "INTRO", tp: "(kalama musi kule)", en: "(Shimmering synth wash — no drums — wide open space)" },
          { title: "VERSE 1", tp: "lili li lon, o lukin.\\nkule li wawa, li sewi.\\nsuno li pini, li kama.\\npini la, kon li tawa.\\nmi lili, mi lon poka.\\n(mi lon poka...)", en: "Smallness exists, look at it.\\nColor is strong, it is divine.\\nThe light fades, and it returns.\\nWhen it ends, the air moves.\\nI am small, I am right beside you.\\n(I am right beside you...)" },
          { title: "CHORUS", tp: "o kule e kon!\\no suno e wawa!\\nlili li sewi!\\nlete li pona!\\nmi mute li lon!\\no pilin e ijo!\\no pilin e ijo!", en: "Color the air!\\nLight up the energy!\\nSmallness is divine!\\nThe cold is good!\\nWe exist!\\nFeel something!\\nFeel something!" },
          { title: "VERSE 2", tp: "lete li moku e sijelo.\\nkon li moku e kon mi.\\nkule li lon, li pini ala.\\nlili o, o tawa insa.\\no kute e toki pi lili.", en: "The cold bites the body.\\nThe air consumes my breath.\\nColor is present, it does not end.\\nOh small things, move within.\\nListen to the voice of smallness." },
          { title: "CHORUS", tp: "o kule e kon!\\no suno e wawa!\\nlili li sewi!\\nlete li pona!\\nmi mute li lon!\\no pilin e ijo!\\no pilin e ijo!", en: "Color the air!\\nLight up the energy!\\nSmallness is divine!\\nThe cold is good!\\nWe exist!\\nFeel something!\\nFeel something!" },
          { title: "OUTRO", tp: "suno li lon.\\n(suno li lon.)\\no lili.\\n(o lili.)\\no kule.", en: "Light exists.\\n(Light exists.)\\nBe small.\\n(Be small.)\\nBe colorful." }
        ]
      },
      {
        title: "04 KULUPU PONA",
        titleEn: "GOOD GROUP",
        breakdown: "kulupu = group/community, pona = good",
        explanation: "Celebrating a positive community.",
        deepDive: "The peak of the EP and the hardest hitting track on the record. Built at 128 BPM with a four-on-the-floor kick accented by syncopated double snare hits, thick distorted synth bass layers, and aggressive brass stabs that punctuate the intro and choruses like exclamation points.",
        blocks: [
          { title: "INTRO", tp: "(o!) (o!) (mi mute o!)\\ntenpo ni li pona mute\\n(ni li pona!)", en: "(Oh!) (Oh!) (All of us!)\\nThis time is so good\\n(This is good!)" },
          { title: "VERSE 1", tp: "o lukin e mi mute\\nmi lon ma pona\\no pana e seli\\n(o pana!)\\no moku e telo\\n(o moku!)\\nmi mute li tawa mute\\nnasin ante li ike\\nsina jo e suli\\n(sina jo!)\\nmi pana e wawa\\n(mi pana!)", en: "Look at all of us\\nWe are in a good place\\nGive the warmth\\n(Give!)\\nDrink the water\\n(Drink!)\\nWe are moving a lot\\nOther ways are bad\\nYou have greatness\\n(You have!)\\nI give the strength\\n(I give!)" },
          { title: "PRE-CHORUS", tp: "ma li pimeja lon poka\\nla ni li seli li suno\\nmi mute li ken ala pakala\\ntan ni: sina lon poka mi", en: "The world is dark outside\\nBut here is warm and glowing\\nWe cannot be broken\\nBecause you are here by my side" },
          { title: "CHORUS", tp: "kulupu pona li lon!\\n(li lon!)\\nmi mute li jo e mute!\\n(e mute!)\\nmoku li pona\\ntelo li pona\\nkalama ni li seli e pilin\\nkulupu pona li lon!\\n(li lon!)\\nmi mute li pilin pona!\\n(pona!)", en: "The good community is here!\\n(Is here!)\\nWe have so much!\\n(So much!)\\nThe food is good\\nThe drink is good\\nThis sound warms the heart\\nThe good community is here!\\n(Is here!)\\nWe feel so good!\\n(Good!)" },
          { title: "VERSE 2", tp: "sina moku e telo\\nmi pana e moku\\nmi jo e kon pona\\nmi mute li kulupu\\n(a!)\\no kalama mute\\no tawa suli\\ntenpo li tawa\\nla mi mute li awen\\n(awen!) (awen!)\\nmi pana e pona tawa sina\\nsina pana e pona tawa mi", en: "You drink\\nI give the food\\nI have a good spirit\\nWe are a community\\n(Ah!)\\nMake a lot of noise\\nMove big\\nAs time goes by\\nWe remain\\n(Remain!) (Remain!)\\nI give goodness to you\\nYou give goodness to me" },
          { title: "PRE-CHORUS", tp: "ma li pimeja lon poka\\nla ni li seli li suno\\nmi mute li ken ala pakala\\ntan ni: sina lon poka mi", en: "The world is dark outside\\nBut here is warm and glowing\\nWe cannot be broken\\nBecause you are here by my side" },
          { title: "CHORUS", tp: "kulupu pona li lon!\\n(li lon!)\\nmi mute li jo e mute!\\n(e mute!)\\nmoku li pona\\ntelo li pona\\nkalama ni li seli e pilin\\nkulupu pona li lon!\\n(li lon!)\\nmi mute li pilin pona!\\n(pona!)", en: "The good community is here!\\n(Is here!)\\nWe have so much!\\n(So much!)\\nThe food is good\\nThe drink is good\\nThis sound warms the heart\\nThe good community is here!\\n(Is here!)\\nWe feel so good!\\n(Good!)" },
          { title: "BRIDGE", tp: "ma li tawa mute\\nmi mute li lili\\ntaso lon kulupu\\nmi suli\\nmi mute li jo e ni\\nni li ale", en: "The world moves fast\\nWe are small\\nBut in the community\\nI am big\\nWe have this\\nThis is everything" },
          { title: "CHORUS", tp: "kulupu pona li lon!\\n(li lon!)\\nmi mute li jo e mute!\\n(e mute!)\\nmoku li pona\\ntelo li pona\\nkalama ni li seli e pilin\\nkulupu pona li lon!\\n(li lon!)\\nmi mute li pilin pona!\\n(pona!)", en: "The good community is here!\\n(Is here!)\\nWe have so much!\\n(So much!)\\nThe food is good\\nThe drink is good\\nThis sound warms the heart\\nThe good community is here!\\n(Is here!)\\nWe feel so good!\\n(Good!)" },
          { title: "OUTRO", tp: "pona!\\n(pona!)\\nmi mute li lon!\\n(o!)\\nni li ale!", en: "Good!\\n(Good!)\\nWe are here!\\n(Oh!)\\nThis is everything!" }
        ]
      },
      {
        title: "05 alasa tawa sin",
        titleEn: "Hunting for a new movement",
        breakdown: "alasa = hunt/seek, tawa = move, sin = new",
        explanation: "Seeking fresh directions or experiences.",
        deepDive: "A propulsive anthem at 120 BPM that never resolves downward. The verses are carried by sharp staccato sawtooth synths, bubbling sub-bass, and bright digital bells, while the choruses explode into massive supersaw leads, lush oceanic pads, and heavy layered handclaps.",
        blocks: [
          { title: "VERSE 1", tp: "mi wile e wawa olin.\\nalasa li open lon poka.\\nmi utala e kon moku.\\no awen lili, o lukin sin.", en: "I want the power of love.\\nThe hunt begins nearby.\\nI fight against the consuming air.\\nWait a little, look anew." },
          { title: "CHORUS", tp: "o alasa! o awen ala!\\npini li lon poka ala!\\nwile li tawa suli!\\nkon sin li lon poka!\\nlon! tawa! sin!\\n(lon tawa sin!)", en: "Hunt! Do not wait!\\nThe end is nowhere near!\\nWanting becomes motion!\\nA new spirit is near!\\nReal! Motion! New!\\n(Real, motion, new!)" },
          { title: "VERSE 2", tp: "pini li moku e wawa.\\nawen li moku e pilin.\\nmi wile e tawa suli.\\nalasa li suno sin.", en: "Endings consume strength.\\nWaiting consumes feeling.\\nI want great momentum.\\nThe chase is a new sun." },
          { title: "CHORUS", tp: "o alasa! o awen ala!\\npini li lon poka ala!\\nwile li tawa suli!\\nkon sin li lon poka!\\nlon! tawa! sin!\\n(lon tawa sin!)", en: "Hunt! Do not wait!\\nThe end is nowhere near!\\nWanting becomes motion!\\nA new spirit is near!\\nReal! Motion! New!\\n(Real, motion, new!)" },
          { title: "BRIDGE", tp: "tenpo pini li moli.\\ntenpo sin li lon.\\nmi alasa e suli olin.\\npini li lon ala!", en: "Past time is dead.\\nNew time is alive.\\nI chase the greatness of love.\\nThere is no end!" },
          { title: "FINAL CHORUS", tp: "o alasa! o awen ala!\\npini li lon poka ala!\\nwile li tawa suli!\\nkon sin li lon poka!\\nlon! tawa! sin!\\n(lon tawa sin!)\\nwawa li lon! wawa li lon!\\nalasa li suli!\\n(alasa li suli!)", en: "Hunt! Do not wait!\\nThe end is nowhere near!\\nWanting becomes motion!\\nA new spirit is near!\\nReal! Motion! New!\\n(Real, motion, new!)\\nPower is here! Power is here!\\nThe chase is great!\\n(The chase is great!)" },
          { title: "OUTRO", tp: "alasa sin.\\nawen tawa.\\n(pona tawa mi.)", en: "A new hunt.\\nKeep moving.\\n(Good to me.)" }
        ]
      },
      {
        title: "06 kili wawa (Bonus Track)",
        titleEn: "Power Fruit",
        breakdown: "kili = fruit, wawa = power",
        explanation: "A playful bonus track about an energizing item.",
        deepDive: "An absurdist banger at 130 BPM built around a synth bass riff that repeats past the point of reason and punchy brass stabs deployed as comic punctuation throughout. The verses are deadpan and minimal — spare call-and-response lines delivered with complete unearned confidence — before the chorus erupts into a fully committed melodic hook about the profound significance of eating a small red fruit.",
        blocks: [
          { title: "INTRO", tp: "(o! o! o!)", en: "(Oh! Oh! Oh!)" },
          { title: "VERSE 1", tp: "moku li suli\\n(suli)\\nkili li loje\\n(loje)\\nmi pali e ni\\n(mi pali)\\ntenpo li awen\\n(awen)", en: "Eating is important\\n(important)\\nThe fruit is red\\n(red)\\nI am doing this\\n(I am doing)\\nTime remains\\n(remains)" },
          { title: "CHORUS", tp: "o kalama nasa mute!\\n(o kalama!)\\no tawa wawa suli!\\n(o tawa!)\\nmi moku e kili lili\\nona li suli tawa mi\\n(li suli!)\\nmoku! wawa!\\n(moku! wawa!)\\nnasa! pona!\\n(nasa! pona!)", en: "Make a lot of strange noise!\\n(Make noise!)\\nMove with great strength!\\n(Move!)\\nI am eating a tiny fruit\\nIt is huge to me\\n(It is huge!)\\nFood! Power!\\n(Food! Power!)\\nStrange! Good!\\n(Strange! Good!)" },
          { title: "VERSE 2", tp: "wawa li pona\\n(pona)\\ntawa li suli\\n(suli)\\nmi lukin e ni\\n(mi lukin)\\ntenpo li nasa\\n(nasa)", en: "Power is good\\n(good)\\nMovement is grand\\n(grand)\\nI am looking at this\\n(I am looking)\\nTime is strange\\n(strange)" },
          { title: "CHORUS", tp: "o kalama nasa mute!\\n(o kalama!)\\no tawa wawa suli!\\n(o tawa!)\\nmi moku e kili lili\\nona li suli tawa mi\\n(li suli!)\\nmoku! wawa!\\n(moku! wawa!)\\nnasa! pona!\\n(nasa! pona!)", en: "Make a lot of strange noise!\\n(Make noise!)\\nMove with great strength!\\n(Move!)\\nI am eating a tiny fruit\\nIt is huge to me\\n(It is huge!)\\nFood! Power!\\n(Food! Power!)\\nStrange! Good!\\n(Strange! Good!)" },
          { title: "MIDDLE 8", tp: "sina lukin ala lukin?\\nkili ni li wawa.\\nmi lon.\\nmi suli.\\ntenpo li pini.\\nmoku.", en: "Are you looking or not?\\nThis fruit is powerful.\\nI am here.\\nI am important.\\nTime is finished.\\nEat." },
          { title: "CHORUS", tp: "o kalama nasa mute!\\n(o kalama!)\\no tawa wawa suli!\\n(o tawa!)\\nmi moku e kili lili\\nona li suli tawa mi\\n(li suli!)\\nmoku! wawa!\\n(moku! wawa!)\\nnasa! pona!\\n(nasa! pona!)", en: "Make a lot of strange noise!\\n(Make noise!)\\nMove with great strength!\\n(Move!)\\nI am eating a tiny fruit\\nIt is huge to me\\n(It is huge!)\\nFood! Power!\\n(Food! Power!)\\nStrange! Good!\\n(Strange! Good!)" },
          { title: "OUTRO", tp: "moku suli\\n(moku suli)\\nmi wawa\\n(mi wawa)\\nnasa\\n(nasa)\\npona\\n(pona)", en: "Grand eating\\n(grand eating)\\nI am strong\\n(I am strong)\\nStrange\\n(strange)\\nGood\\n(good)" }
        ]
      }
    ]
  },
  {
    id: "pini-o-awen",
    title: "pini o awen",
    titleEn: "End, Please Wait",
    scUrl: "https://soundcloud.com/ansoni-482276927/sets/pini-o-awen",
    breakdown: "pini = end, o = [command/wish], awen = wait/stay",
    explanation: "I realized sometime during the making of this record that you cannot hide grief inside a production choice... So I stripped everything down. I sat with an acoustic guitar and I put the microphone close enough to hear everything, every finger slide, every fret rattle, every breath before the word arrived, every moment of hesitation that a cleaner production would have edited out. I did not edit it out. The mess is the record. The mess is the point.",
    tracks: [
      {
        title: "lon pimeja",
        titleEn: "In the Darkness",
        deepDive: "A fingerpicked acoustic guitar opens with a slow, rhythmic pattern — fret buzz audible, deliberately unpolished. The song follows a whisper-to-shout dynamic arc, beginning with close-mic'd vocals barely above a breath and escalating through increasingly forceful strumming until the bridge breaks into a full shout before collapsing back into fragile quiet for the final chorus.",
        blocks: [
          { title: "VERSE 1", tp: "suno li open e oko mi\\nmi wile ala lukin e suno\\ntelo seli li lon sinpin mi\\nsina lon ala\\nlon mi li pakala\\nmi awen lon supa pi tomo ni\\nmi wile ala e tenpo suno\\nmi wile e pimeja", en: "The sun opens my eyes\\nI don't want to see the sun\\nWarm tears are on my face\\nYou are not here\\nMy reality is broken\\nI stay on the bed of this room\\nI don't want the daytime\\nI want the darkness" },
          { title: "CHORUS", tp: "tenpo li tawa li ante ala\\nsina lon ala la ale li sama\\nmun li pona tawa mi\\nmun li toki ala\\nlon mi li sama tenpo pimeja\\n(sama tenpo pimeja)\\nlon mi li sama tenpo pimeja", en: "Time goes but does not change\\nWhen you aren't here, everything is the same\\nThe moon is good to me\\nThe moon doesn't speak\\nMy existence is like the nighttime\\n(Like the nighttime)\\nMy existence is like the nighttime" },
          { title: "VERSE 2", tp: "sina toki e ni: \\\"o awen pona\\\"\\nmi ken ala awen pona\\nlen mi li lete lon insa pi tomo ni\\nmi moku e telo\\nmi tawa ala e nena\\nmi kepeken e luka mi\\nmi lukin e ona\\nona li sama luka pi tenpo pimeja", en: "You said this: \\\"Stay well\\\"\\nI cannot stay well\\nMy sheets are cold inside this house\\nI drink water\\nI'm going nowhere\\nI use my hands\\nI look at them\\nThey are like the hands of the darkness" },
          { title: "CHORUS", tp: "tenpo li tawa li ante ala\\nsina lon ala la ale li sama\\nmun li pona tawa mi\\nmun li toki ala\\nlon mi li sama tenpo pimeja\\n(sama tenpo pimeja)\\nlon mi li sama tenpo pimeja", en: "Time goes but does not change\\nWhen you aren't here, everything is the same\\nThe moon is good to me\\nThe moon doesn't speak\\nMy existence is like the nighttime\\n(Like the nighttime)\\nMy existence is like the nighttime" },
          { title: "BRIDGE", tp: "suno li kama!\\nsuno li kama!\\nmi wile ala e suno sina!\\nmi pimeja!\\nmi wile ala e suno ni!\\nsina lon ala la suno li seme?\\nsina lon ala la suno li pakala!", en: "The sun comes!\\nThe sun comes!\\nI don't want your sun!\\nI am dark!\\nI don't want this sun!\\nIf you aren't here, what is the sun?\\nIf you aren't here, the sun is broken!" },
          { title: "CHORUS", tp: "tenpo li tawa li ante ala\\nsina lon ala la ale li sama\\nmun li pona tawa mi\\nmun li toki ala\\nlon mi li sama tenpo pimeja\\n(sama tenpo pimeja)\\nlon mi li sama tenpo pimeja", en: "Time goes but does not change\\nWhen you aren't here, everything is the same\\nThe moon is good to me\\nThe moon doesn't speak\\nMy existence is like the nighttime\\n(Like the nighttime)\\nMy existence is like the nighttime" },
          { title: "OUTRO", tp: "sina lon ala\\ntenpo li sama\\nmi pimeja\\n(mi pimeja)\\n(mi pimeja)\\npimeja\\npimeja", en: "You are not here\\nTime is the same\\nI am in the dark\\n(I am in the dark)\\n(I am in the dark)\\nDarkness\\nDarkness" }
        ]
      },
      {
        title: "mi olin e tenpo",
        titleEn: "I Love This Time",
        deepDive: "A clean electric guitar with warm, glassy tone anchors a slow groove that sits deliberately behind the beat. Muffled kick drum, quiet wooden rim-clicks, a soft shaker, and a melodic sustaining electric bass create a gentle swaying motion. The male vocals are close-mic'd and conversational.",
        blocks: [
          { title: "VERSE 1", tp: "tenpo kama li lon poka mi.\\nmi pilin e ni: ona li suli.\\nsuno li tawa, tenpo li lili.\\nkama li pini, mi lon olin.", en: "The future is approaching right beside me.\\nI feel this: it carries so much weight.\\nThe sun moves on, and time grows short.\\nWhat was to come is already gone, and I rest in love." },
          { title: "CHORUS", tp: "tenpo suli li lon pini.\\ntenpo lili li lon kama.\\nmi olin e tenpo ni.\\ntenpo kama li kama pini.\\n(tenpo kama li kama pini)", en: "The long years are now in the past.\\nOnly a little time remains in the future.\\nI cherish this very moment.\\nThe future just becomes the past.\\n(The future just becomes the past.)" },
          { title: "VERSE 2", tp: "wawa li lili, kon li suli.\\nmi lukin e suno lon lupa.\\ntenpo li tawa, mi pini ala.\\npini li kama, mi lon poka.", en: "My energy is fading, but my spirit feels vast.\\nI watch the sunlight shifting in the window.\\nTime keeps moving, but I am not finished yet.\\nThe end draws near, but I am present with it." },
          { title: "CHORUS", tp: "tenpo suli li lon pini!\\ntenpo lili li lon kama!\\nmi olin e tenpo ni!\\ntenpo kama li kama pini!\\ntenpo kama li kama pini!", en: "The long years are now in the past!\\nOnly a little time remains in the future!\\nI cherish this very moment!\\nThe future just becomes the past!\\nThe future just becomes the past!" },
          { title: "OUTRO", tp: "tenpo kama li kama pini...\\n(mmm-hmmm...)\\n(tenpo kama li kama pini)", en: "The future just becomes the past...\\n(mmm-hmmm...)\\n(The future just becomes the past.)" }
        ]
      },
      {
        title: "mi ala",
        titleEn: "I Am Nothing",
        deepDive: "Built on a single fingerpicked steel-string guitar recorded close enough to capture every fret noise and breath. The arrangement is deliberately spare — just guitar and layered male vocals with no percussion, creating a bedroom-studio intimacy. A cello enters unexpectedly in the bridge with a single low, vibrating note.",
        blocks: [
          { title: "VERSE 1", tp: "tomo li seli ala\\nmi lon poka pi kasi moli\\nmi lukin e anpa\\nmi jo e seli lili lon luka\\nmi sona ala e ni:\\nmi wile suli e seli ni\\nona li seli e mi", en: "The house is not warm\\nI am beside the dying plants\\nI look downward\\nI hold a little warmth in my hands\\nI do not know this:\\nI deeply need this warmth\\nIt keeps me warm" },
          { title: "VERSE 2", tp: "jan o, sina lon poka\\nsina lukin ala e mi\\nsina lukin e ma ante\\nmi wile e ni: sina olin e mi\\nmi wile e ni: sina lukin\\nmi wile e ni: sina lukin\\nmi pana e seli mi tawa sina\\n(tawa sina)", en: "O person, you are nearby\\nYou do not look at me\\nYou look toward other lands\\nI want this: that you love me\\nI want this: that you see\\nI want this: that you see\\nI give my warmth to you\\n(To you)" },
          { title: "REFRAIN", tp: "jan o, o olin e mi\\n(o olin e mi)\\nmi pana e ale\\n(mi pana e ale)\\nmi seli ala\\nmi jo ala", en: "O person, please love me\\n(Please love me)\\nI give everything\\n(I give everything)\\nI am not warm\\nI have nothing" },
          { title: "BRIDGE", tp: "kiwen tomo li pakala\\nmi pilin lili\\nmi wile e olin sina taso\\nmi pana e seli mi pi nanpa wan\\nmi pana e kon mi\\nmi pana e wile mi\\n(sina olin ala)", en: "The bricks of the house are broken\\nI feel small\\nI only want your love\\nI give my very first warmth\\nI give my breath\\nI give my desire\\n(You do not love)" },
          { title: "VERSE 3", tp: "sina seli lon tenpo ni\\nsina pona, sina tawa\\nmi lon pimeja\\nmi jo ala e seli\\nmi seli ala\\nmi ala\\n(mi ala)", en: "You are warm in this moment\\nYou are good, you go away\\nI am in the darkness\\nI have no warmth\\nI am not warm\\nI am nothing\\n(I am nothing)" },
          { title: "OUTRO", tp: "mi ala\\no olin e mi\\njan o", en: "I am nothing\\nPlease love me\\nO person" }
        ]
      },
      {
        title: "olin li awen",
        titleEn: "Love Remains",
        deepDive: "A solo electric guitar with a warm, glassy tone on the edge of distortion plays sustained notes with long natural decay. A syncopated bass and muffled drum groove sits heavily behind the beat, creating a drunken, weighted Neo-Soul feel that physically mimics the drag of memory.",
        blocks: [
          { title: "VERSE 1", tp: "olin li kama tan seme?\\n(tan seme?)\\nmi pilin e sijelo olin.\\njan li weka la, pilin li awen.\\nmama pi olin li lon poka mi.\\n(lon poka mi.)", en: "Where does love come from?\\n(From where?)\\nI feel the body of love.\\nWhen the person is gone, the feeling stays.\\nThe source of this love is beside me.\\n(Beside me.)" },
          { title: "CHORUS", tp: "jan li lon ala la, sijelo li sona.\\nolin pi wawa li pini ala.\\nmi awen pilin e sijelo mama.\\n(sijelo mama.)", en: "When the person is not here, the body remembers.\\nThe intense love does not end.\\nI continue to feel the origin's body.\\n(The origin body.)" },
          { title: "VERSE 2", tp: "mi wile ala e ni.\\n(wile ala e ni.)\\ntaso olin li lon sike mi.\\nmi pini e wawa, taso sijelo li awen.\\npilin li kama, li tawa ala.\\n(li tawa ala.)", en: "I didn't want this.\\n(Didn't want this.)\\nBut the love is all around me.\\nI have run out of strength, but the body remains.\\nThe feeling comes, and it doesn't leave.\\n(It doesn't leave.)" },
          { title: "CHORUS", tp: "jan li lon ala la, sijelo li sona.\\nolin pi wawa li pini ala.\\nmi awen pilin e sijelo mama.\\n(sijelo mama.)", en: "When the person is not here, the body remembers.\\nThe intense love does not end.\\nI continue to feel the origin's body.\\n(The origin body.)" },
          { title: "BRIDGE", tp: "sijelo o, weka e ni.\\nsijelo o, pini e olin.\\njan li moli, olin li awen.\\nmi pilin e ni.\\nmi sona e ni.", en: "O body, get rid of this.\\nO body, put an end to the love.\\nThe person is gone (dead), but the love stays.\\nI feel this.\\nI know this." },
          { title: "CHORUS", tp: "jan li lon ala la, sijelo li sona.\\nolin pi wawa li pini ala.\\nmi awen pilin e sijelo mama.\\n(sijelo mama.)", en: "When the person is not here, the body remembers.\\nThe intense love does not end.\\nI continue to feel the origin's body.\\n(The origin body.)" },
          { title: "OUTRO", tp: "awen...\\npilin li awen.\\n(pini.)", en: "Remaining...\\nThe feeling remains.\\n(It ends.)" }
        ]
      },
      {
        title: "sona pi tenpo pini",
        titleEn: "Knowledge of the Past",
        deepDive: "A fingerpicked acoustic guitar opens at a slow, steady 72 BPM with light rhythmic thumping on the guitar body replacing a drum kit. Brushed snare hits land on beats two and four, keeping the groove without adding weight. The male vocals are hushed and observational.",
        blocks: [
          { title: "VERSE 1", tp: "poki telo li seli lon luka sina\\nsuno li anpa lon supa tomo\\nsina lukin e kasi lon selo tomo\\nmi mute li lon poka. mi mute li toki ala\\n(mi mute li toki ala)", en: "The bowl of water is warm in your hands\\nThe sun is low on the house floor\\nYou look at the plants by the wall\\nWe are together. We do not talk.\\n(We do not talk)" },
          { title: "REFRAIN", tp: "tenpo ni la mi sona e pilin sina\\ntaso tenpo li tawa ala monsi\\n(tawa ala monsi)", en: "Now I know your feelings\\nBut time does not go backward\\n(Does not go backward)" },
          { title: "VERSE 2", tp: "kon lete li lon poka pi mi mute\\nsina sitelen e ijo lon ko pi supa\\nmi tawa ala poka sina. mi awen\\nmi sona ala e ni: sina pakala lon insa", en: "Cold air is beside us both\\nYou draw things in the dust of the floor\\nI do not go to your side. I stay.\\nI did not know this: you were hurting inside" },
          { title: "REFRAIN", tp: "tenpo ni la mi sona e pilin sina\\ntaso tenpo li tawa ala monsi\\n(mi sona e pilin sina)", en: "Now I know your feelings\\nBut time does not go backward\\n(I know your feelings)" },
          { title: "OUTRO", tp: "telo li lete lon poki sina\\nsuno li tawa. pimeja li kama\\nsina lukin ala e mi\\nmi sona\\n(mi sona ala)", en: "The water is cold in your bowl\\nThe sun goes. The darkness comes.\\nYou do not look at me\\nI know\\n(I did not know)" }
        ]
      },
      {
        title: "toki lon kon",
        titleEn: "Words in the Mind",
        deepDive: "Sparse, deep resonant piano chords in the lower register intertwine with a clean electric guitar playing slow arpeggiated melodies with subtle reverb — creating a distinct sense of distance and empty space in the mix.",
        blocks: [
          { title: "VERSE 1", tp: "mi wile toki.\\nuta mi li ante.\\nkon mi li jo e toki.\\nkute mi li kute e toki.", en: "I want to speak.\\nMy mouth changes things.\\nMy mind holds the right words.\\nMy ears hear the spoken words." },
          { title: "CHORUS", tp: "toki lon uta li ante e wile.\\ntoki lon kon li ante e wile.\\ntoki lon kon li ante e wile.", en: "Words in the mouth distort the intention.\\nWords in the air distort the intention.\\nWords in the air distort the intention." },
          { title: "VERSE 2", tp: "mi kute e toki mi.\\nona li ike.\\nkon mi li toki e ante.\\nmi wile ante.\\n(mi wile ante.)", en: "I listen to my own words.\\nThey are wrong / bad.\\nMy mind was saying something else.\\nI want to change it.\\n(I want to change it.)" },
          { title: "CHORUS", tp: "toki lon uta li ante e wile.\\ntoki lon kon li ante e wile.\\ntoki lon kon li ante e wile.", en: "Words in the mouth distort the intention.\\nWords in the air distort the intention.\\nWords in the air distort the intention." },
          { title: "BRIDGE", tp: "kon mi o kute.\\nwile mi o suli.", en: "Listen to my spirit.\\nLet my true intention matter." },
          { title: "OUTRO", tp: "toki lon kon.\\n(toki lon kon...)\\ntoki lon kon.\\n(toki lon kon...)\\nwile mi li lon.", en: "Unspoken words.\\n(Unspoken words...)\\nUnspoken words.\\n(Unspoken words...)\\nMy true intention is still there." }
        ]
      },
      {
        title: "tawa awen",
        titleEn: "Traveling Remaining",
        deepDive: "A single fingerpicked acoustic guitar plays a circular, repetitive pattern that deliberately mimics the feeling of being stuck while the mind wanders. Soft body percussion — thumps on the guitar's wood — provides a steady heartbeat-like rhythm.",
        blocks: [
          { title: "VERSE 1", tp: "mi lon supa kiwen\\nsuno li anpa lili\\njan mute li tawa\\nnoka mi li tawa ala\\nmi jo e len pimeja\\nmi kute e kon lete\\nsina pilin e ni: mi lon\\n(mi lon ala)", en: "I am on a stone bench\\nThe sun is a little low\\nMany people are moving\\nMy feet do not move\\nI have a dark coat\\nI hear the cold wind\\nYou think this: I am here\\n(I am not here)" },
          { title: "CHORUS", tp: "mi tawa lon ma insa\\nmi awen lon ma ni\\npilin mi li weka\\nmi tawa weka lon tomo\\n(tawa weka)", en: "I travel in the internal land\\nI stay in this place\\nMy feelings are away\\nI travel away inside the house\\n(Traveling away)" },
          { title: "VERSE 2", tp: "noka mi li pali ala\\ntaso kon mi li tawa suli\\nmi lukin e lipu pi sitelen weka\\ntenpo li tawa musi\\nmi pilin e seli pi telo nena\\nmi lon ni taso mi lon ala\\n(mi weka)", en: "My feet do nothing\\nBut my spirit travels far\\nI look at the pages of distant pictures\\nTime moves strangely\\nI feel the warmth of tears\\nI am here but I am not here\\n(I am away)" },
          { title: "CHORUS", tp: "mi tawa lon ma insa\\nmi awen lon ma ni\\npilin mi li weka\\nmi tawa weka lon tomo\\n(tawa weka)", en: "I travel in the internal land\\nI stay in this place\\nMy feelings are away\\nI travel away inside the house\\n(Traveling away)" },
          { title: "BRIDGE", tp: "kili li anpa tan kasi\\nma li lete lili\\nmi awen\\nmi tawa\\nmi awen lon ni\\nmi tawa weka", en: "The fruit falls from the tree\\nThe land is a little cold\\nI stay\\nI go\\nI stay here\\nI go away" },
          { title: "CHORUS", tp: "mi tawa lon ma insa\\nmi awen lon ma ni\\npilin mi li weka\\nmi tawa weka lon tomo\\n(tawa weka)", en: "I travel in the internal land\\nI stay in this place\\nMy feelings are away\\nI travel away inside the house\\n(Traveling away)" },
          { title: "OUTRO", tp: "mi awen\\nmi tawa\\n(pilin weka)\\n(ma insa)", en: "I stay\\nI go\\n(Absent feeling)\\n(Internal land)" }
        ]
      },
      {
        title: "utala insa",
        titleEn: "Inner Battle",
        deepDive: "A slow, heavy electric guitar with a warm glassy tone sits on the edge of distortion breakup throughout, playing single sustained notes that dissolve into analog hiss between phrases. A deep resonant bass anchors the low end.",
        blocks: [
          { title: "VERSE 1", tp: "wawa insa li suno lili.\\npimeja li lon insa mi.\\nmi awen lili.\\nike o weka.", en: "Inner strength is a dim light.\\nThere is darkness inside of me.\\nI am barely holding on.\\nLet the pain go away." },
          { title: "CHORUS", tp: "mi utala e insa mi.\\npona li wawa.\\nawen o lon.\\nmi pilin e wawa ike.\\nmi pilin e wawa ike.", en: "I am fighting my own mind.\\nPeace requires strength.\\nLet endurance remain.\\nI feel a heavy, punishing strength.\\nI feel a heavy, punishing strength." },
          { title: "VERSE 2", tp: "lawa mi li tawa lili.\\nmi awen kepeken utala.\\npilin o kama.\\no awen.", en: "My mind is moving so slowly.\\nI endure through the struggle.\\nLet the feeling come.\\nJust hold on." },
          { title: "CHORUS", tp: "mi utala e insa mi.\\npona li wawa.\\nawen o lon.\\nmi pilin e wawa ike.\\nmi pilin e wawa ike.", en: "I am fighting my own mind.\\nPeace requires strength.\\nLet endurance remain.\\nI feel a heavy, punishing strength.\\nI feel a heavy, punishing strength." },
          { title: "BRIDGE", tp: "ike o kama.\\npona o awen.\\nwawa li lon lili.\\n(lon lili)", en: "Let the hardship come.\\nLet the peace stay.\\nThere is only a little strength left.\\n(Just a little)" },
          { title: "OUTRO", tp: "awen...\\npona.", en: "Enduring...\\nPeace." }
        ]
      },
      {
        title: "ike li lawa",
        titleEn: "The Head and the Hand",
        deepDive: "A fingerpicked acoustic guitar with deep, wooden resonance recorded close-mic'd to capture every string vibration and fret noise. Gentle brushed snare enters slowly and stays minimal throughout.",
        blocks: [
          { title: "VERSE 1", tp: "mi suli e seli lili lon tomo\\nmi kute e telo lon selo pi sinpin tomo\\nmi sona e ni: mi wile tawa\\ntaso mi awen lon lete", en: "I stoke a small fire in the house\\nI hear the rain on the window pane\\nI know this: I want to leave\\nBut I stay here in the cold" },
          { title: "CHORUS", tp: "sona pona li lon lawa mi\\ntaso ike li lawa e pali mi\\nmi ken ala tawa pona\\nmi ken ala ante e mi", en: "Good wisdom is in my head\\nBut the badness leads my hand\\nI cannot walk toward the light\\nI cannot change who I am" },
          { title: "VERSE 2", tp: "mi lukin e noka mi lon supa kasi\\nnoka mi li wile ala tawa nasin pona\\nmi pali e suno, taso mi wile e pimeja\\nmi jan pi sona mute, taso mi jan pi pali ike", en: "I look at my feet on the wooden floor\\nMy feet don't want to walk the good path\\nI make light, but I want the dark\\nI'm a man of much knowledge, but a man of bad deeds" },
          { title: "CHORUS", tp: "sona pona li lon lawa mi\\ntaso ike li lawa e pali mi\\nmi ken ala tawa pona\\nmi ken ala ante e mi", en: "Good wisdom is in my head\\nBut the badness leads my hand\\nI cannot walk toward the light\\nI cannot change who I am" },
          { title: "BRIDGE", tp: "tenpo li tawa\\ntenpo li pini ala\\nmi toki tawa mi:\\n\\\"tenpo ni la, o pona\\\"\\ntaso mi ala", en: "Time is moving\\nTime never stops\\nI say to myself:\\n\\\"This time, be good\\\"\\nBut it isn't me" },
          { title: "VERSE 3", tp: "suno li anpa lon ma\\nmi mute e seli lili mi\\nmi sona e ike mi\\nmi lape lon ona", en: "The sun goes down into the earth\\nI put out my little fire\\nI know my own faults\\nAnd I sleep inside them" },
          { title: "CHORUS", tp: "sona pona li lon lawa mi\\ntaso ike li lawa e pali mi\\nmi ken ala tawa pona\\nmi ken ala ante e mi", en: "Good wisdom is in my head\\nBut the badness leads my hand\\nI cannot walk toward the light\\nI cannot change who I am" },
          { title: "OUTRO", tp: "ike li lawa e mi\\nike li lawa", en: "Badness leads me\\nBadness leads" }
        ]
      },
      {
        title: "toki pi utala",
        titleEn: "Words of Conflict",
        deepDive: "Opens with a thick, overdriven solo bass guitar playing a descending minor-key riff before drums kick in with a half-time beat and heavy resonating kick. Verses are tight and claustrophobic — palm-muted power chords pulse against dry, punchy percussion.",
        blocks: [
          { title: "VERSE 1", tp: "wawa pi toki li lon ala.\\n(lon ala...)\\nmi toki mute. sina kute ala.\\n(kute ala...)\\nike li kama tan toki mi.\\n(toki mi...)\\nmi utala kepeken wawa lili.\\n(wawa lili...)", en: "The power of speech is gone.\\n(gone...)\\nI say so much. You do not listen.\\n(do not listen...)\\nBad things come from my talking.\\n(my talking...)\\nI fight with so little strength.\\n(little strength...)" },
          { title: "CHORUS", tp: "utala o! ike o! wawa o!\\ntoki mi li kama e ala!\\nsina wawa, mi wawa!\\nala li lon poka pi toki mi!\\nala li lon poka pi toki mi!", en: "Oh conflict! Oh pain! Oh power!\\nMy words accomplish nothing!\\nYou are stubborn, I am stubborn!\\nThere is only emptiness beside my words!\\nThere is only emptiness beside my words!" },
          { title: "VERSE 2", tp: "lukin o, mi lon. sina lukin ala.\\n(lukin ala...)\\o kute e kon mi. kon mi li ike.\\n(kon mi li ike...)\\nwawa o, kama e pini.\\n(kama e pini...)\\nmi toki mute, mi kama e ala.\\n(mi kama e ala...)", en: "Look here, I exist. You do not see.\\n(do not see...)\\nListen to my spirit. My spirit is angry.\\n(my spirit is angry...)\\nOh strength, bring an end to this.\\n(bring an end...)\\nI talk so much, and amount to nothing.\\n(amount to nothing...)" },
          { title: "CHORUS", tp: "utala o! ike o! wawa o!\\ntoki mi li kama e ala!\\nsina wawa, mi wawa!\\nala li lon poka pi toki mi!\\nala li lon poka pi toki mi!", en: "Oh conflict! Oh pain! Oh power!\\nMy words accomplish nothing!\\nYou are stubborn, I am stubborn!\\nThere is only emptiness beside my words!\\nThere is only emptiness beside my words!" },
          { title: "BREAKDOWN", tp: "ala... ala... ala!\\ntoki ala! kute ala!\\nutala! utala! utala!\\nwawa mi li ike!\\nmi wawa ala!", en: "Nothing... nothing... nothing!\\nNo speaking! No listening!\\nFight! Fight! Fight!\\nMy strength is toxic!\\nI have no strength left!" },
          { title: "FINAL CHORUS", tp: "utala o! ike o! wawa o!\\ntoki mi li kama e ala!\\nsina wawa, mi wawa!\\nala li lon poka pi toki mi!\\nala li lon poka pi toki mi!", en: "Oh conflict! Oh pain! Oh power!\\nMy words accomplish nothing!\\nYou are stubborn, I am stubborn!\\nThere is only emptiness beside my words!\\nThere is only emptiness beside my words!" },
          { title: "OUTRO", tp: "toki ala. ala. pini.", en: "No more words. Nothing. Done." }
        ]
      },
      {
        title: "lape suli",
        titleEn: "Heavy Rest",
        deepDive: "A heavily alternate-tuned acoustic guitar opens in a low register, fingerpicked with slow thumb-driven bass notes emphasizing physical weight. The production is lo-fi and warm, capturing finger slides and string resonance.",
        blocks: [
          { title: "VERSE 1", tp: "tenpo suno li open\\nmi lon supa pi ilo moku\\ntelo seli mi li lete\\nmi lukin e luka mi\\nona li jo e pali mute\\nmi pali suli lon tenpo pimeja\\ntaso mi ken ala pini", en: "The sun-time begins\\nI am at the table\\nMy warm water has gone cold\\nI look at my hands\\nThey hold too much work\\nI worked hard in the darkness\\nBut I cannot finish" },
          { title: "CHORUS", tp: "mi lape, taso mi lape ala\\nlon li suli mute tawa mi\\nkon mi li suli lon nena\\ntenpo li tawa lon monsi\\nmi wile e lape pi moli lili", en: "I sleep, but I do not rest\\nExistence is too heavy for me\\nMy breath is heavy in my chest\\nTime moves behind me\\nI want the sleep of a small death" },
          { title: "VERSE 2", tp: "sina lape lon supa pi mi mute\\nmi kute e kon sina\\nmi wile toki e ijo pona\\ntaso uta mi li seli ala\\nmi suli sama mama mi\\nona li moli lon tenpo suli\\ntaso ona li lon insa mi", en: "You sleep on our bed\\nI hear your breath\\nI want to say something good\\nBut my mouth is not warm\\nI am heavy like my father\\nHe died a long time ago\\nBut he is inside me" },
          { title: "CHORUS", tp: "mi lape, taso mi lape ala\\nlon li suli mute tawa mi\\nkon mi li suli lon nena\\ntenpo li tawa lon monsi\\nmi wile e lape pi moli lili", en: "I sleep, but I do not rest\\nExistence is too heavy for me\\nMy breath is heavy in my chest\\nTime moves behind me\\nI want the sleep of a small death" },
          { title: "BRIDGE", tp: "moli li lape suli\\nlape li moli lili\\nmi wile ala e moli\\nmi wile e lape pi lon ni\\ntaso lon ni li suli kiwen", en: "Death is the big sleep\\nSleep is the small death\\nI do not want death\\nI want the rest of this existence\\nBut this existence is a hard rock" },
          { title: "CHORUS", tp: "mi lape, taso mi lape ala\\nlon li suli mute tawa mi\\nkon mi li suli lon nena\\ntenpo li tawa lon monsi\\nmi wile e lape pi moli lili", en: "I sleep, but I do not rest\\nExistence is too heavy for me\\nMy breath is heavy in my chest\\nTime moves behind me\\nI want the sleep of a small death" },
          { title: "OUTRO", tp: "telo seli li lete\\nkon li suli\\nlon li suli\\n\\nlape\\nlape", en: "The warm water is cold\\nThe breath is heavy\\nExistence is heavy\\n\\nRest\\nRest" }
        ]
      },
      {
        title: "ale li lon mi",
        titleEn: "The Vastness Within Me",
        deepDive: "A clean electric guitar plays slow arpeggiated chords with warm, glassy sustained notes treated with subtle chorus effect and analog tape saturation. The rhythm section is skeletal.",
        blocks: [
          { title: "VERSE 1", tp: "ale li suli mute.\\nmi li lili lili.\\nkon mi li lon poka.\\nsona mi li wawa.\\no pini e pilin o lili.", en: "Everything is vastly huge.\\nI am incredibly small.\\nMy spirit is close by.\\nMy self-knowledge is intense.\\nLet the feeling end, let it be small." },
          { title: "CHORUS", tp: "mi lon ale!\\n(mi lon ale.)\\nale li lon mi!\\n(ale li lon mi.)\\no lili, o suli!\\n(o lili, o suli.)\\no sona e kon mi!\\n(o sona e kon mi.)", en: "I exist in the vastness!\\n(I exist in the vastness.)\\nThe vastness exists within me!\\n(The vastness exists within me.)\\nTo be small, to be huge!\\n(To be small, to be huge.)\\nTo truly know my own spirit!\\n(To truly know my own spirit.)" },
          { title: "VERSE 2", tp: "mi sona e mi.\\nsona li suli.\\nale li lili tan ni.\\nkon mi li olin.\\no lukin e lili mi.", en: "I know myself.\\nThis knowledge is massive.\\nEverything else feels small because of this.\\nMy essence is love.\\nLook upon my smallness." },
          { title: "BRIDGE", tp: "ale li wawa.\\nmi li wawa.\\no lili, o pini.\\nmi lon.", en: "The universe is powerful.\\nI am powerful.\\nShrink down, come to an end.\\nI am here." },
          { title: "CHORUS", tp: "mi lon ale!\\n(mi lon ale!)\\nale li lon mi!\\n(ale li lon mi!)\\no lili, o suli!\\n(o lili, o suli!)\\no sona e kon mi!\\n(o sona e kon mi!)", en: "I exist in the vastness!\\n(I exist in the vastness!)\\nThe vastness exists within me!\\n(The vastness exists within me!)\\nTo be small, to be huge!\\n(To be small, to be huge!)\\nTo truly know my own spirit!\\n(To truly know my own spirit!)" },
          { title: "OUTRO", tp: "lili... mi lili...\\nale... o pini...", en: "Small... I am small...\\nEverything... it ends..." }
        ]
      },
      {
        title: "sama anu seme",
        titleEn: "Am I the Same?",
        deepDive: "A sparse fingerpicked acoustic guitar with a mahogany tone, the low E string left to ring out like a distant bell at the opening. The production is warm and analog with no traditional percussion.",
        blocks: [
          { title: "VERSE 1", tp: "mi lon ma pi kasi pini\\nsijelo mi li seli, li lete\\ntenpo li ante e lipu pi kasi suli\\nmi pilin e nena pi luka mi\\nkiwen li awen lon anpa pi telo", en: "I am in a land of dead plants.\\nMy body is warm, then cold.\\nTime changes the leaves of the great tree.\\nI feel the ridges of my hand.\\nThe stone remains at the bottom of the water." },
          { title: "CHORUS", tp: "mi sama anu seme?\\nnimi mi li moku pi kon\\nmi lon\\nmi lon taso", en: "Am I the same or what?\\nMy name is the food of the wind.\\nI exist.\\nI only exist." },
          { title: "VERSE 2", tp: "nimi mi li poki pi ijo pini\\nmi pana e ona tawa telo suli\\nmi sona ala e nimi lon pimeja\\nko ma li kule e noka mi\\nmi moku e kon lete pi tenpo ni", en: "My name is a container for finished things.\\nI give it to the great water.\\nI do not know the name in the darkness.\\nThe clay of the earth colors my feet.\\nI swallow the cold breath of this moment." },
          { title: "REFRAIN", tp: "mi sama anu seme?\\n(kon li tawa)\\nmi lon", en: "Am I the same or what?\\n(The breath moves)\\nI exist." },
          { title: "BRIDGE", tp: "palisa mi li kiwen pi tenpo mute\\nona li ante ala\\ntaso, mi ante\\nmi tawa lon nasin pi suli ala", en: "My bones are the hard stones of long ago.\\nThey do not change.\\nBut, I change.\\nI move on a path of no importance." },
          { title: "CHORUS", tp: "mi sama anu seme?\\nnimi mi li moku pi kon\\nmi lon\\nmi lon taso", en: "Am I the same or what?\\nMy name is the food of the wind.\\nI exist.\\nI only exist." },
          { title: "OUTRO", tp: "nimi li pini\\nsijelo li ma\\nmi awen", en: "The name ends.\\nThe body is earth.\\nI remain." }
        ]
      },
      {
        title: "olin pi pini",
        titleEn: "A Finished Love",
        deepDive: "A close-mic'd acoustic guitar plays a slow cyclical arpeggiated melody emphasizing bittersweet major 7th intervals. Brushes sweep softly across a snare drum head — a texture rather than a beat.",
        blocks: [
          { title: "VERSE 1", tp: "olin pi mama o awen.\\nkalama lon weka li pini.\\npini o pilin e kon.", en: "The love of who you first were, please stay.\\nThe sound from far away has stopped.\\nThe ending feels like empty air." },
          { title: "CHORUS", tp: "mi olin e olin pi pini.\\nmi awen e weka pi mama.\\nlon li awen, taso olin li weka.\\no pilin e pini.\\no pilin e pini.", en: "I love a love that is finished.\\nI hold onto the absence of the person you used to be.\\nReality remains, but the love is gone.\\nFeel the end.\\nFeel the end." },
          { title: "VERSE 2", tp: "tenpo pini li lon mi.\\no awen e sitelen pi mama.\\nweka li lili, weka li suli.", en: "The past lives within me.\\nI keep the image of who you originally were.\\nThe absence feels small, the absence feels overwhelming." },
          { title: "CHORUS", tp: "mi olin e olin pi pini.\\nmi awen e weka pi mama.\\nlon li awen, taso olin li weka.\\no pilin e pini.\\no pilin e pini.", en: "I love a love that is finished.\\nI hold onto the absence of the person you used to be.\\nReality remains, but the love is gone.\\nFeel the end.\\nFeel the end." },
          { title: "OUTRO", tp: "olin... olin... pini o awen.\\n(pini o awen)", en: "Love... love... let the ending remain.\\n(Let the ending remain)" }
        ]
      },
      {
        title: "tenpo suno tu",
        titleEn: "Tuesday",
        deepDive: "A single acoustic guitar with warm resonant wood tones, fingerpicked slowly and deliberately with audible fret buzz — recorded close enough to hear the room. No percussion whatsoever.",
        blocks: [
          { title: "VERSE 1", tp: "tenpo suno ni li tenpo suno tu\\nsuno li suli lon supa pi moku mi\\npoki telo li lon\\ntaso jan pona mi li moli", en: "Today is Tuesday.\\nThe sun is big on my dining table.\\nThe cup is there.\\nBut my dear one is dead." },
          { title: "CHORUS", tp: "tenpo li tawa sama\\njan ante li pali li musi\\nlon li ike tawa mi\\ntaso ona li pini ala", en: "Time moves the same way.\\nOther people work and play.\\nReality is hard for me.\\nBut it does not end." },
          { title: "VERSE 2", tp: "mi seli e pan pi tenpo pini\\nona li lon uta mi\\ntenpo pini la mi tu li moku e ona\\ntenpo ni la ona li pi pilin ala", en: "I warm the bread from before.\\nIt is in my mouth.\\nBefore, the two of us ate it.\\nNow, it tastes like nothing." },
          { title: "CHORUS", tp: "tenpo li tawa sama\\njan ante li pali li musi\\nlon li ike tawa mi\\ntaso ona li pini ala", en: "Time moves the same way.\\nOther people work and play.\\nReality is hard for me.\\nBut it does not end." },
          { title: "VERSE 3", tp: "tomo tawa li tawa lon nasin\\nkalama li pona li suli\\nale li sona ala e moli sina\\nni li ike mute tawa mi", en: "Cars move on the street.\\nThe sound is fine and loud.\\nThe world does not know of your death.\\nThis is very hard for me." },
          { title: "OUTRO", tp: "tenpo suno tu\\nsuno li lon supa\\nmi wan", en: "Tuesday.\\nSun is on the table.\\nI am alone." }
        ]
      },
      {
        title: "pona li kama",
        titleEn: "Goodness Is Coming",
        deepDive: "An acoustic guitar plays arpeggiated chords with a clean, warm tone while the song follows a contrasting loud-soft dynamic — sparse quiet verses giving way to choruses where rock drums, bass, and distorted electric guitar layers lift the energy.",
        blocks: [
          { title: "VERSE 1", tp: "poka mi li wawa ike\\ninsa mi li wawa lili\\nwawa li awen lon poka\\nnasa li kama\\nmi awen", en: "My surroundings have a harsh energy.\\nMy core has a little strength.\\nThe energy remains close by.\\nChaos comes.\\nI endure." },
          { title: "CHORUS", tp: "awen pona li wawa\\ninsa awen li tawa la,\\nwawa ike li awen poka\\nmi pilin e wawa pona", en: "Good stability is strong.\\nWhen inner endurance shifts,\\nHarsh energy remains at my side.\\nI feel a positive energy." },
          { title: "VERSE 2", tp: "poka mi li jo e utala\\ninsa mi li jo e pona\\nwawa li tawa, li awen\\ntenpo ike li awen lili\\nwawa o kama\\ninsa o awen\\nutala li awen\\npona li kama", en: "My surroundings contain conflict.\\nMy core contains goodness.\\nEnergy moves, and it stays.\\nThe bad times remain only briefly.\\nEnergy, come!\\nInside, stay strong!\\nThe conflict remains.\\nGoodness is coming." },
          { title: "CHORUS", tp: "awen pona li wawa\\ninsa awen li tawa la,\\nwawa ike li awen poka\\nmi pilin e wawa pona", en: "Good stability is strong.\\nWhen inner endurance shifts,\\nHarsh energy remains at my side.\\nI feel a positive energy." },
          { title: "OUTRO", tp: "pona o awen\\npona li awen\\npona", en: "Goodness, stay.\\nGoodness stays.\\nGood." }
        ]
      }
    ]
  }
];const defaultCommonPhrases = initialPhrasebook;

interface MasteryActions {
  applyScoreUpdate: (nodeId: string, points: number, context: string, targetRole?: PosRole) => void;
  calculateDecay: () => void;
  applyScoreDeltas: (deltas: { wordId: string; delta: number }[]) => void;
  updateVocabStatus: (wordIdOrText: string, status: MasteryStatus) => void;
  cycleWordStatus: (wordId: string) => void;
  setLastUpdated: (date: string) => void;
  savePhrase: (phrase: string | SavedPhrase) => void;
  recordActivity: () => void;
  syncPhrasebook: () => void;
  setStudentName: (name: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setReviewVibe: (vibe: ReviewVibe) => void;
  setProfileImage: (url: string) => void;
  updatePhraseNote: (id: string, notes: string) => void;
  deletePhrase: (id: string) => void;
  resetAsNewUser: () => Promise<void>;
  resetProfileAndRunSetup: () => Promise<void>;
  randomizeVocab: () => void;
  masterAllVocab: () => void;
  clearLocalData: () => void;
  syncFromCloud: (userId: string, initialName?: string, initialProfileImage?: string) => Promise<Unsubscribe | void>;
  syncToCloud: (userId?: string, merge?: boolean, force?: boolean) => Promise<void>;
  getStatusSummary: () => StatusSummary & { xp: number; level: number; rankTitle: string };
  setHasCompletedSetup: (val: boolean) => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
  awardBadge: (badgeId: string) => void;
  checkAndAwardRanks: () => void;
  clearNewRankUnlocked: () => void;
  updateSessionXPRecord: (xp: number) => void;
  refreshCurriculumStatus: () => void;
  setWidgetDensity: (val: 'Compact' | 'Expanded') => void;
  setFogOfWar: (val: 'Strict' | 'Visible') => void;
  setShowCircuitPaths: (val: boolean) => void;
  setKnowledgeCheckFrequency: (freq: 'daily' | 'session' | 'never') => void;
  setLastKnowledgeCheckDate: (date: string) => void;
  setSelectedWords: (words: string[]) => void;
  addWordToSelection: (word: string) => void;
  removeWordFromSelection: (word: string) => void;
  toggleWordSelection: (word: string) => void;
  setLessonFilter: (wordIds: string[] | null) => void;
  hardenWord: (wordId: string) => void;
  clearAllSavedPhrases: () => void;
  checkAssessments: (onTrigger: (word: VocabWord) => void) => void;
  switchProfile: (name: string) => void;
  updateVocabAIContent: (wordId: string, content: { aiExplanation?: string; aiExamples?: Record<string, string>; grammarExamples?: Record<string, string> | null; neighborConnections?: Record<string, string> | null }) => void;
  updateSessionNotes: (wordId: string, notes: string) => void;
  setActiveScUrl: (url: string | null) => void;

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
  addXPToWord: (wordId: string, xp: number) => void;

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
  getDueWords: () => VocabWord[];
  getDueCount: () => number;
  processFlashcardResult: (wordId: string, isCorrect: boolean) => void;
  addLoreEntry: (text: string) => void;
  calculateReadinessScore: () => number;
  saveComposition: (text: string, translation?: string) => void;
  hydrateStoreFromExternalData: (data: any) => void;
  completeBossFight: (wordIds: string[]) => void;
  recalibrateXP: (wordId: string) => void;
}

interface MasteryState {
  userId: string | null;
  studentName: string;
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
  compositionLog: { date: string, text: string, translation?: string }[];
  // Dashboard settings
  widgetDensity: 'Compact' | 'Expanded';
  fogOfWar: 'Strict' | 'Visible';
  showCircuitPaths: boolean;
  knowledgeCheckFrequency: 'daily' | 'session' | 'never';
  lastKnowledgeCheckDate: string;

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
  activeScUrl: string | null;

  // Feature Flag State Persistence
  drills: any[];
  quizzes: any[];
  linaChat: any[];
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
      activeScUrl: null,

      // Initial Feature Flags
      drills: [],
      quizzes: [],
      linaChat: [],

      setHasCompletedSetup: (val) => { set({ hasCompletedSetup: val }); void get().syncToCloud(); },

      setActiveScUrl: (url) => set({ activeScUrl: url }),

      refreshCurriculumStatus: () => {
        set((state) => {
          let lastNodeMastery = 0; // Conceptual nodes stay active until sign-off

          const newCurriculums = state.curriculums.map((level, lIdx) => ({
            ...level,
            nodes: level.nodes.map((node, nIdx) => {
              const allReqs = [...(node.requiredVocabIds || []), ...(node.requiredGrammarIds || [])];
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
        void get().syncToCloud();
      },

      checkNodeReadiness: (nodeId) => {
        return get().getNodeReadinessPercentage(nodeId) >= 100;
      },

      getNodeReadinessPercentage: (nodeId) => {
        const { vocabulary, curriculums, completedActivities } = get();
        const node = curriculums.flatMap(l => l.nodes).find(n => n.id === nodeId);
        if (!node) return 0;

        const allReqs = [...(node.requiredVocabIds || []), ...(node.requiredGrammarIds || [])];
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
              ...(state.completedActivities || {}),
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

      applyScoreUpdate: (nodeId, points, context, targetRole) => {
        const now = new Date().toISOString();
        if (Math.abs(points) >= 20) {
          useActivityStore.getState().logEvent('XP_SHIFT', `[[${nodeId}]] resonance shifted by ${points > 0 ? '+' : ''}${Math.round(points)}`);
        }
        set((state) => {
          const vocab = state.vocabulary.map((w) => {
            if (w.id !== nodeId && w.word.toLowerCase() !== nodeId.toLowerCase()) return w;
            const maxScore = (w.status === 'mastered' || points < 0) ? 1000 : 850;
            const newScore = clamp(w.baseScore + points, 0, maxScore);
            const historyEntry = { date: now, change: points, reason: context };
            
            const recentDrops = [historyEntry, ...(w.scoreHistory || [])]
              .filter(h => h.change < 0 && (new Date(now).getTime() - new Date(h.date).getTime() < 48 * 3600000));
            const totalDrop = Math.abs(recentDrops.reduce((acc, h) => acc + h.change, 0));
            const isBleeding = totalDrop > 50;

            const roleParts = (w.partOfSpeech || '').split(',').map((p: string) => p.trim().toLowerCase()).filter(Boolean);
            const roleKeys = roleParts.map((r: string) => {
              if (r === 'noun') return 'noun';
              if (r === 'verb') return 'verb';
              if (r === 'modifier' || r === 'mod' || r === 'adjective' || r === 'adverb') return 'modifier';
              if (r === 'particle') return 'particle';
              return null;
            }).filter(Boolean) as (keyof PartOfSpeechScores)[];

            const newScores = { ...(w.partOfSpeechScores || { noun: 0, verb: 0, modifier: 0, particle: 0 }) };
            
            if (targetRole && roleKeys.includes(targetRole.toLowerCase() as any)) {
              // Targeted Role Update
              const key = targetRole.toLowerCase() as keyof PartOfSpeechScores;
              const maxPerRole = Math.floor(maxScore / roleKeys.length);
              newScores[key] = clamp((newScores[key] || 0) + points, 0, maxPerRole);
            } else if (roleKeys.length > 0) {
              // Distributed Update
              const pointsPerRole = Math.floor(points / roleKeys.length);
              const maxPerRole = Math.floor(maxScore / roleKeys.length);
              roleKeys.forEach(k => {
                newScores[k] = clamp((newScores[k] || 0) + pointsPerRole, 0, maxPerRole);
              });
            }

            return {
              ...w,
              baseScore: newScore,
              confidenceScore: newScore,
              status: scoreToStatus(newScore),
              lastReviewed: now,
              scoreHistory: [historyEntry, ...(w.scoreHistory || [])].slice(0, 5),
              useCount: w.useCount + 1,
              isBleeding,
              partOfSpeechScores: newScores
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

      calculateDecay: () => {
        const now = new Date();
        const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.hardened) return w;
            const last = new Date(w.lastReviewed || 0).getTime();
            const interval = w.status === 'mastered' ? FORTY_EIGHT_HOURS * 3 : FORTY_EIGHT_HOURS;
            if (now.getTime() - last > interval) {
              const decayAmount = -15; 
              const newScore = clamp(w.baseScore - 15, 0, 1000);
              if (newScore === w.baseScore) return w;
              
              const history = [{ date: now.toISOString(), change: decayAmount, reason: 'decay' }, ...(w.scoreHistory || [])].slice(0, 5);
              const recentDrops = history.filter(h => h.change < 0 && (now.getTime() - new Date(h.date).getTime() < 48 * 3600000));
              const totalDrop = Math.abs(recentDrops.reduce((acc, h) => acc + h.change, 0));

              return {
                ...w,
                baseScore: newScore,
                confidenceScore: newScore,
                status: scoreToStatus(newScore),
                scoreHistory: history,
                isBleeding: totalDrop > 50
              };
            }
            return w;
          })
        }));
        void get().syncToCloud();
      },

      hardenWord: (wordId) => {
        set(state => ({
          vocabulary: state.vocabulary.map(w => (w.id === wordId || w.word === wordId) ? { ...w, hardened: true, baseScore: 1000, status: 'mastered' } : w)
        }));
        get().awardBadge('first_hardened');
        void get().syncToCloud();
      },

      clearAllSavedPhrases: () => {
        set({ savedPhrases: [] });
        void get().syncToCloud();
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
        let totalXPChange = 0;

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

            totalXPChange += effectiveDelta;
            if (Math.abs(effectiveDelta) >= 20) {
              useActivityStore.getState().logEvent('XP_SHIFT', `[[${w.word}]] resonance shifted by ${effectiveDelta > 0 ? '+' : ''}${Math.round(effectiveDelta)}`);
            }

            const maxScore = (w.status === 'mastered' || effectiveDelta < 0) ? 1000 : 850;
            const newScore = clamp((w.baseScore ?? 0) + effectiveDelta, 0, maxScore);

            // Distribute XP delta equally across the word's actual roles
            const roles = (w.partOfSpeech || '').split(',').map(p => p.trim().toLowerCase()).filter(Boolean);
            const roleKeys = roles.map(r => {
              if (r === 'noun') return 'noun';
              if (r === 'verb') return 'verb';
              if (r === 'modifier' || r === 'mod' || r === 'adjective' || r === 'adverb') return 'modifier';
              if (r === 'particle') return 'particle';
              return null;
            }).filter(Boolean) as (keyof PartOfSpeechScores)[];
            
            const pointsPerRole = roleKeys.length > 0 ? Math.floor(effectiveDelta / roleKeys.length) : 0;
            const newScores = { ...(w.partOfSpeechScores || { noun: 0, verb: 0, modifier: 0, particle: 0 }) };
            roleKeys.forEach(k => {
              newScores[k] = clamp((newScores[k] || 0) + pointsPerRole, 0, Math.floor(maxScore / roleKeys.length));
            });

            const historyReason = (pendingComebackBonus && idx === 0) ? 'manual_delta + comeback_bonus' : 'manual_delta';
            
            const newStatus = scoreToStatus(newScore);
            if (newStatus === 'mastered' && w.status !== 'mastered') {
               setTimeout(() => get().awardBadge('first_master'), 0);
            }
            if (newStatus === 'practicing' && w.status === 'introduced') {
               setTimeout(() => get().progressChallenge(1, 'word_progression'), 0);
            }

            return {
              ...w,
              baseScore: newScore,
              confidenceScore: newScore,
              status: newStatus,
              useCount: (w.useCount ?? 0) + 1,
              partOfSpeechScores: newScores,
              lastReviewed: now,
              scoreHistory: [{ date: now, change: effectiveDelta, reason: historyReason }, ...(w.scoreHistory || [])].slice(0, 5)
            };
          });

          const insightEntry = {
            label: deltas.length === 1 ? deltas[0].wordId.toUpperCase() : "SESSION INSIGHTS",
            change: Math.round(totalXPChange),
            timestamp: now
          };

          return {
            vocabulary: updatedVocab,
            masteryHistory: [insightEntry, ...(state.masteryHistory || [])].slice(0, 50),
            pendingComebackBonus: false
          };
        });

        if (comebackApplied) {
          get().awardBadge('comeback');
        }

        get().refreshCurriculumStatus();
        get().recordActivity();
        void get().syncToCloud();
      },

      updateVocabStatus: (wordIdOrText, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordIdOrText && w.word.toLowerCase() !== wordIdOrText.toLowerCase()) return w;
            
            if (status === 'practicing' && w.status === 'introduced') {
              setTimeout(() => get().progressChallenge(1, 'word_progression'), 0);
            }

            const targetScore = STATUS_MIDPOINT[status];
            const diff = targetScore - (w.baseScore || 0);
            return { 
              ...w, 
              baseScore: targetScore, 
              confidenceScore: targetScore, 
              status,
              lastReviewed: now,
              scoreHistory: [{ date: now, change: diff, reason: 'status_override' }, ...(w.scoreHistory || [])].slice(0, 5)
            };
          }),
        }));
        get().refreshCurriculumStatus();
        get().recordActivity();
        void get().syncToCloud();
      },

      cycleWordStatus: (wordId) => {
        if (localStorage.getItem('tp_sandbox_mode') !== 'true') return;
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId) return w;
            const currentIndex = STATUS_ORDER.indexOf(w.status);
            const nextStatus = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];
            const targetScore = STATUS_MIDPOINT[nextStatus];
            const diff = targetScore - (w.baseScore || 0);
            return { 
              ...w, 
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
        const tp = typeof phrase === 'string' ? phrase : phrase.tp;
        const en = typeof phrase === 'string' ? 'Saved Phrase *' : phrase.en;
        useActivityStore.getState().logEvent('PHRASE_SAVED', `New phrase transcribed: [[${tp}]] - ${en}`);
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

      syncPhrasebook: () => {
        set({ commonPhrases: initialPhrasebook });
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
      addXPToWord: (wordId, xp) => {
        set((state) => ({
          vocabulary: state.vocabulary.map((w) => {
            if (w.id !== wordId && w.word.toLowerCase() !== wordId.toLowerCase()) return w;
            const currentXP = w.baseScore || 0;
            const newXP = Math.min(1000, currentXP + xp); // Cap at 1000 (Mastered)
            let newStatus: MasteryStatus = w.status;
            if (newXP >= 500) newStatus = 'confident';
            if (newXP >= 950) newStatus = 'mastered';
            return { ...w, baseScore: newXP, status: newStatus };
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
            useActivityStore.getState().logEvent('RANK_AWARDED', `Ceremonial Rank Achieved: ${newlyEarned[0].title}`, { xp: summary.xp });
          } else if (currentSmallRank.title !== lastSmallRankTitle) {
            updates.newRankUnlocked = currentSmallRank;
            updates.lastSmallRankTitle = currentSmallRank.title;
            useActivityStore.getState().logEvent('RANK_AWARDED', `New Rank Achieved: ${currentSmallRank.title}`, { xp: summary.xp });
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
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map(v => ({ 
            ...v, 
            baseScore: 0, 
            status: 'not_started' as MasteryStatus, 
            confidenceScore: 0, 
            sessionNotes: '', 
            scoreHistory: [], 
            useCount: 0, 
            hardened: false, 
            isBleeding: false, 
            productionStatus: 'not_started' as MasteryStatus, 
            recognitionStatus: 'not_started' as MasteryStatus,
            lastReviewed: now
          })),
          masteryHistory: [],
          currentStreak: 0,
          lastActiveDate: '',
          savedPhrases: [],
          earnedBadges: [],
          earnedCeremonialRanks: [],
          completedNodeIds: [],
          confusionPairs: [],
          pendingProveItResponses: [],
          sessionXPRecord: 0,
          streakShields: 0,
          xpMultiplier: 1.0,
          currentChallenge: null,
          completedChallenges: [],
          completedActivities: {},
          learningDays: [],
          seenIntroductions: [],
          newRankUnlocked: null,
          pendingRankAcknowledgement: null,
          lastSmallRankTitle: 'jan lili',
          totalProveItSubmitted: 0,
          lessonFilter: null,
          selectedWords: [],
          currentPositionNodeId: 'phi_sim',
          curriculums: curriculumRoadmap,
          activeCurriculumId: null,
          activeModuleId: null,
          sessionLog: [],
          lastStreakCheck: '',
          lastStreakMilestone: 0,
          pendingComebackBonus: false,
          reviewVibe: null
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

      getDueWords: () => {
        const { vocabulary } = get();
        const now = new Date();
        const intervals: Record<MasteryStatus, number> = {
          not_started: Infinity,
          introduced: 1,
          practicing: 3,
          confident: 7,
          mastered: 21,
        };

        return vocabulary
          .filter(v => v.status !== 'not_started')
          .map(v => {
            const last = new Date(v.lastReviewed || 0);
            const interval = intervals[v.status] || 1;
            const dueDate = new Date(last.getTime() + interval * 24 * 60 * 60 * 1000);
            return { word: v, overdueMs: now.getTime() - dueDate.getTime() };
          })
          .filter(v => v.overdueMs >= 0)
          .sort((a, b) => b.overdueMs - a.overdueMs)
          .slice(0, 10)
          .map(v => v.word);
      },

      getDueCount: () => get().getDueWords().length,

      calculateReadinessScore: () => {
        const state = get();
        const dueCount = state.getDueWords().length;
        
        const today = new Date().toDateString();
        const loggedToday = state.profile.loreLog?.some(l => new Date(l.date).toDateString() === today) ? 1 : 0;
        
        const activeWords = state.vocabulary.filter(v => v.status === 'practicing' || v.status === 'confident');
        const avgScore = activeWords.length > 0 
          ? activeWords.reduce((sum, w) => sum + (w.baseScore || 0), 0) / activeWords.length 
          : 500;
          
        let score = 100;
        score -= (dueCount * 2);
        if (!loggedToday) score -= 15;
        score += (avgScore - 500) / 25;
        
        if (score > 100) score = 100;
        if (score < 0) score = 0;
        
        return Math.round(score);
      },

      saveComposition: (text, translation) => {
        set(state => ({
          compositionLog: [...(state.compositionLog || []), { date: new Date().toISOString(), text, translation }]
        }));
        get().syncToCloud();
      },

      hydrateStoreFromExternalData: (data: any) => {
        // Validate basic structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format');
        }
        
        // Merge state carefully
        set(state => ({
          ...state,
          vocabulary: data.vocabulary || state.vocabulary,
          sessionLog: data.sessionLog || state.sessionLog,
          profile: data.profile || state.profile,
          savedPhrases: data.savedPhrases || state.savedPhrases,
          compositionLog: data.compositionLog || state.compositionLog || [],
          commonPhrases: data.commonPhrases || state.commonPhrases,
          curriculums: data.curriculums || state.curriculums,
          songs: data.songs || state.songs,
        }));
        
        // Push full state to cloud
        get().syncToCloud();
      },

      processFlashcardResult: (wordId, isCorrect) => {
        const now = new Date();
        set((state) => {
          const vocabulary = state.vocabulary.map((w) => {
            if (w.id !== wordId && w.word !== wordId) return w;

            const lastReviewedDate = w.lastReviewedAt ? new Date(w.lastReviewedAt) : null;
            const hoursSince = lastReviewedDate ? (now.getTime() - lastReviewedDate.getTime()) / (1000 * 60 * 60) : 24;

            let newBaseScore = w.baseScore || 0;
            let newConsecutive = w.consecutiveCorrect || 0;
            let pointsChange = 0;

            if (isCorrect) {
              newConsecutive += 1;
              let pointsGained = 15;
              
              // Anti-Cramming
              if (hoursSince < 4) {
                pointsGained = 2;
              } 
              // SRS Bonus
              else if (hoursSince > 48) {
                pointsGained = Math.floor(pointsGained * 1.5);
              }

              pointsChange = pointsGained;
              const maxScore = (w.status === 'mastered') ? 1000 : 850;
              newBaseScore = Math.min(newBaseScore + pointsGained, maxScore);
            } else {
              newConsecutive = 0;
              let pointsLost = Math.floor(newBaseScore * 0.10);
              if (pointsLost < 10) pointsLost = 10;
              if (pointsLost > 100) pointsLost = 100;

              pointsChange = -pointsLost;
              newBaseScore = Math.max(newBaseScore - pointsLost, 0);
            }

            const newStatus = scoreToStatus(newBaseScore);
            
            const historyEntry = { date: now.toISOString(), change: pointsChange, reason: isCorrect ? 'flashcard_correct' : 'flashcard_incorrect' };

            return {
              ...w,
              baseScore: newBaseScore,
              confidenceScore: newBaseScore,
              status: newStatus,
              consecutiveCorrect: newConsecutive,
              lastReviewedAt: now.toISOString(),
              scoreHistory: [historyEntry, ...(w.scoreHistory || [])].slice(0, 5)
            };
          });

          return { vocabulary };
        });

        get().refreshCurriculumStatus();
        void get().syncToCloud();
      },

      setStudentName: (name) => { set({ studentName: name }); get().updateProfile({ firstName: name }); },
      updateProfile: (profileUpdate) => { 
        set((state) => ({ 
          profile: { ...state.profile, ...profileUpdate } 
        })); 
        void get().syncToCloud(); 
      },
      setReviewVibe: (vibe) => { set({ reviewVibe: vibe }); void get().syncToCloud(); },
      setProfileImage: (url) => { set({ profileImage: url }); void get().syncToCloud(); },

      addLoreEntry: (text) => {
        set((state) => ({
          profile: {
            ...state.profile,
            loreLog: [
              ...(state.profile.loreLog || []),
              { date: new Date().toISOString(), text }
            ]
          }
        }));
        void get().syncToCloud();
      },

      updatePhraseNote: (id, notes) => {
        set((state) => ({
          savedPhrases: state.savedPhrases.map(p => {
            if (typeof p === 'string') return p === id ? { id, tp: p, en: 'Saved Phrase *', notes } : p;
            return p.id === id ? { ...p, notes } : p;
          })
        }));
        void get().syncToCloud();
      },

      deletePhrase: (id) => {
        set((state) => ({
          savedPhrases: state.savedPhrases.filter(p =>
            typeof p === 'string' ? p !== id : p.id !== id
          )
        }));
        void get().syncToCloud();
      },

      resetAsNewUser: async () => {
        const { userId } = get();
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map(v => ({ 
            ...v, 
            baseScore: 0, 
            status: 'not_started' as MasteryStatus, 
            confidenceScore: 0, 
            sessionNotes: '', 
            scoreHistory: [], 
            useCount: 0, 
            hardened: false, 
            isBleeding: false, 
            productionStatus: 'not_started' as MasteryStatus, 
            recognitionStatus: 'not_started' as MasteryStatus,
            lastReviewed: now
          })),
          masteryHistory: [],
          currentStreak: 0,
          lastActiveDate: '',
          savedPhrases: [],
          earnedBadges: [],
          earnedCeremonialRanks: [],
          completedNodeIds: [],
          confusionPairs: [],
          pendingProveItResponses: [],
          sessionXPRecord: 0,
          streakShields: 0,
          xpMultiplier: 1.0,
          currentChallenge: null,
          completedChallenges: [],
          completedActivities: {},
          learningDays: [],
          seenIntroductions: [],
          newRankUnlocked: null,
          pendingRankAcknowledgement: null,
          lastSmallRankTitle: 'jan lili',
          totalProveItSubmitted: 0,
          lessonFilter: null,
          selectedWords: [],
          currentPositionNodeId: 'phi_sim',
          curriculums: curriculumRoadmap,
          activeCurriculumId: null,
          activeModuleId: null,
          sessionLog: [],
          lastStreakCheck: '',
          lastStreakMilestone: 0,
          pendingComebackBonus: false,
          reviewVibe: null,
          songs: defaultSongs,
          commonPhrases: defaultCommonPhrases,
        }));
        localStorage.setItem('tp_sandbox_mode', 'false');
        get().refreshCurriculumStatus();
        if (userId) {
          await get().syncToCloud(userId, false, true);
        }
      },

      resetProfileAndRunSetup: async () => {
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map(v => ({ 
            ...v, 
            baseScore: 0, 
            status: 'not_started' as MasteryStatus, 
            confidenceScore: 0, 
            sessionNotes: '', 
            scoreHistory: [], 
            useCount: 0, 
            hardened: false, 
            isBleeding: false, 
            productionStatus: 'not_started' as MasteryStatus, 
            recognitionStatus: 'not_started' as MasteryStatus,
            lastReviewed: now
          })),
          masteryHistory: [],
          currentStreak: 0,
          lastActiveDate: '',
          savedPhrases: [],
          earnedBadges: [],
          earnedCeremonialRanks: [],
          completedNodeIds: [],
          confusionPairs: [],
          pendingProveItResponses: [],
          sessionXPRecord: 0,
          streakShields: 0,
          xpMultiplier: 1.0,
          currentChallenge: null,
          completedChallenges: [],
          completedActivities: {},
          learningDays: [],
          seenIntroductions: [],
          newRankUnlocked: null,
          pendingRankAcknowledgement: null,
          lastSmallRankTitle: 'jan lili',
          totalProveItSubmitted: 0,
          lessonFilter: null,
          selectedWords: [],
          currentPositionNodeId: 'phi_sim',
          curriculums: curriculumRoadmap,
          activeCurriculumId: null,
          activeModuleId: null,
          sessionLog: [],
          lastStreakCheck: '',
          lastStreakMilestone: 0,
          pendingComebackBonus: false,
          reviewVibe: null,
          songs: defaultSongs,
          commonPhrases: defaultCommonPhrases,
        }));
        localStorage.setItem('tp_sandbox_mode', 'false');
        get().refreshCurriculumStatus();
        await get().syncToCloud(undefined, false, true);
      },

      randomizeVocab: () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(w => {
            const score = Math.floor(Math.random() * 1001);
            return { ...w, baseScore: score, confidenceScore: score, status: scoreToStatus(score) };
          })
        }));
        get().refreshCurriculumStatus();
        void get().syncToCloud();
      },

      masterAllVocab: () => {
        set((state) => ({
          vocabulary: state.vocabulary.map(w => ({ ...w, baseScore: 975, confidenceScore: 975, status: 'mastered' as MasteryStatus })),
          curriculums: state.curriculums.map(level => ({
            ...level,
            nodes: level.nodes.map(node => ({ ...node, status: 'mastered' as const }))
          }))
        }));
        get().refreshCurriculumStatus();
        void get().syncToCloud();
      },

      clearLocalData: () => {
        set((state) => ({
          userId: null,
          savedPhrases: [],
          currentStreak: 0,
          lastActiveDate: '',
          vocabulary: state.vocabulary.map(v => ({ 
            ...v, 
            baseScore: 0, 
            status: 'not_started' as MasteryStatus, 
            confidenceScore: 0, 
            sessionNotes: '', 
            scoreHistory: [], 
            useCount: 0, 
            hardened: false, 
            isBleeding: false, 
            productionStatus: 'not_started' as MasteryStatus, 
            recognitionStatus: 'not_started' as MasteryStatus,
            lastReviewed: new Date().toISOString()
          })),
          masteryHistory: [],
          curriculums: curriculumRoadmap,
          earnedBadges: [],
          earnedCeremonialRanks: [],
          completedNodeIds: [],
          confusionPairs: [],
          pendingProveItResponses: [],
          sessionXPRecord: 0,
          streakShields: 0,
          xpMultiplier: 1.0,
          currentChallenge: null,
          completedChallenges: [],
          completedActivities: {},
          learningDays: [],
          seenIntroductions: [],
          newRankUnlocked: null,
          pendingRankAcknowledgement: null,
          lastSmallRankTitle: 'jan lili',
          totalProveItSubmitted: 0,
          lessonFilter: null,
          selectedWords: [],
          currentPositionNodeId: 'phi_sim',
          activeCurriculumId: null,
          activeModuleId: null,
          sessionLog: [],
          lastStreakCheck: '',
          lastStreakMilestone: 0,
          pendingComebackBonus: false,
          reviewVibe: null,
          songs: defaultSongs,
          commonPhrases: defaultCommonPhrases,
        }));
      },

      setLastUpdated: (date) => set({ lastUpdated: date }),

      setWidgetDensity: (val) => { set({ widgetDensity: val }); void get().syncToCloud(); },
      setFogOfWar: (val) => { set({ fogOfWar: val }); void get().syncToCloud(); },
      setShowCircuitPaths: (val) => { set({ showCircuitPaths: val }); void get().syncToCloud(); },
      setKnowledgeCheckFrequency: (freq) => { set({ knowledgeCheckFrequency: freq }); void get().syncToCloud(); },
      setLastKnowledgeCheckDate: (date) => { set({ lastKnowledgeCheckDate: date }); void get().syncToCloud(); },

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
        const { vocabulary } = get();
        const summary = { not_started: 0, introduced: 0, practicing: 0, confident: 0, mastered: 0, xp: 0 };
        for (const word of vocabulary) {
          summary[word.status]++;
          const multiplier = WORD_FREQUENCY[word.word.toLowerCase()] ?? 1.0;
          summary.xp += (word.baseScore || 0) * multiplier;
        }
        summary.xp = Math.round(summary.xp);
        const level = Math.floor(summary.xp / 500) + 1;
        
        const rank = [...SMALL_RANKS].reverse().find(r => summary.xp >= r.xpThreshold) || SMALL_RANKS[0];
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
        const { vocabulary, curriculums, lastUpdated, studentName, profile, profileImage, savedPhrases, currentStreak, lastActiveDate, userId, hasCompletedSetup, currentPositionNodeId, isMainProfile, widgetDensity, fogOfWar, showCircuitPaths, knowledgeCheckFrequency, lastKnowledgeCheckDate, cloudSynced, songs, commonPhrases, lastStreakCheck, learningDays, completedNodeIds, seenIntroductions, confusionPairs, pendingProveItResponses,
            earnedCeremonialRanks, lastSmallRankTitle, earnedBadges, totalProveItSubmitted,
            streakShields, xpMultiplier, lastStreakMilestone, pendingComebackBonus, sessionXPRecord,
            sessionLog, currentChallenge, completedChallenges, pendingRankAcknowledgement, newRankUnlocked,
            activeCurriculumId, activeModuleId, selectedWords, lessonFilter, completedActivities, masteryHistory } = get();
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
          // HARDCODED RULE: partOfSpeech is NEVER stored in Firestore.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const partialVocab = vocabulary.map(({ 
            phonetic, syllables, anchor, semanticCluster, connotation, roles, 
            examples, collocations, relatedWordIds, boundaryNotes, etymology, 
            mnemonic, culturalNotes, avoidWhen, partOfSpeech, ...dynamicData 
          }) => dynamicData);

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
            curriculums, lastUpdated, studentName, profile, profileImage,
            savedPhrases, currentStreak, lastActiveDate, hasCompletedSetup, currentPositionNodeId, isMainProfile,
            widgetDensity, fogOfWar, showCircuitPaths, knowledgeCheckFrequency, lastKnowledgeCheckDate, songs, commonPhrases,
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

          // 1. AUTO-MIGRATION: Normalize Firestore data on load and add missing words
          let needsUpdate = false;
          const cloudVocab = Array.isArray(data.vocabulary) ? data.vocabulary : [];
          
          // Identify missing words from code's ground truth
          const cloudWordIds = new Set(cloudVocab.map(w => w.word?.toLowerCase()));
          const missingFromCloud = initialMasteryMap.initialVocabulary.filter(
            iv => !cloudWordIds.has(iv.word.toLowerCase())
          );

          const OLD_POS = ['Adjective', 'Adverb', 'Number', 'Interrogative', 'Ordinal-marker'];
          let normalizedCloudVocab = cloudVocab.map(w => {
            const currentPOS = w.partOfSpeech || '';
            if (OLD_POS.includes(currentPOS)) {
              needsUpdate = true;
              return { ...w, partOfSpeech: normalizePartOfSpeech(currentPOS) };
            }
            return { ...w };
          });

          if (missingFromCloud.length > 0) {
            needsUpdate = true;
            // Add missing words fresh using the standard hydration logic
            const newEntries = missingFromCloud.map(toFullVocabWord);
            normalizedCloudVocab = [...normalizedCloudVocab, ...newEntries];
          }

          if (needsUpdate && uid !== 'guest_user') {
            // Strip partOfSpeech before writing back to Firestore to prevent corruption
            const strippedVocab = normalizedCloudVocab.map(({ partOfSpeech, ...rest }) => rest);
            void setDoc(userDocRef, { vocabulary: strippedVocab }, { merge: true });
          }

          const sourceVocab = Array.isArray(data.vocabulary) ? normalizedCloudVocab : mappedVocabulary;
          const vocabulary = sourceVocab.map(
            (w: { word?: string; useCount?: number; frequencyRank?: number; type?: string; status?: MasteryStatus; [key: string]: unknown }) => {
              const base = mappedVocabulary.find(iv => iv.word === w.word);
              const staticData = vocabContent[w.word || ''] || {};
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
              let baseScore = w.baseScore;
              if (baseScore === undefined) {
                // If we only have confidenceScore (0-500), map it
                if (typeof w.confidenceScore === 'number') {
                  baseScore = w.confidenceScore * 2;
                } else {
                  baseScore = STATUS_MIDPOINT[w.status as MasteryStatus || 'not_started'];
                }
                }

                // HARDCODED RULE: partOfSpeech is ALWAYS derived from aiVocabCache.grammarExamples.
                // NEVER trust the partOfSpeech value stored in Firestore or localStorage.
                // If aiVocabCache has no grammarExamples for this word, fall back to initialMasteryMap.
                // Do NOT remove this logic or store partOfSpeech as a source of truth anywhere.
                const cache = (aiVocabCache as Record<string, { grammarExamples?: Record<string, string> }>)[w.word || ''];
                const derivedPOS = cache?.grammarExamples 
                ? normalizePartOfSpeech(Object.keys(cache.grammarExamples).join(', '))
                : normalizePartOfSpeech(w.partOfSpeech || (base?.partOfSpeech ?? ''));

                return { 
                ...w, 
                baseScore,
                confidenceScore: baseScore, // sync legacy
                useCount, 
                frequencyRank, 
                type,
                weight,
                meanings,
                sessionNotes,
                partOfSpeech: derivedPOS,
                partOfSpeechScores: w.partOfSpeechScores || { noun: 0, verb: 0, modifier: 0 },
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
                isBleeding: !!w.isBleeding,

                isKu: KU_SULI_WORDS.has(w.word.toLowerCase())
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

      completeBossFight: (wordIds) => {
        const now = new Date().toISOString();
        set((state) => ({
          vocabulary: state.vocabulary.map(w => {
            if (wordIds.includes(w.id) || wordIds.includes(w.word)) {
              return {
                ...w,
                baseScore: 1000,
                status: 'mastered',
                lastReviewed: now,
                lastReviewedAt: now,
                scoreHistory: [{ date: now, change: 150, reason: 'boss_fight_victory' }, ...(w.scoreHistory || [])].slice(0, 5)
              };
            }
            return w;
          })
        }));
        get().refreshCurriculumStatus();
        void get().syncToCloud();
      },

      recalibrateXP: (wordId) => {
        set((state) => ({
          vocabulary: state.vocabulary.map(w => {
            if (w.id === wordId || w.word === wordId) {
              const roles = (w.partOfSpeech || '').split(',').map(p => p.trim().toLowerCase()).filter(Boolean);
              if (roles.length === 0) return w;

              const roleKeys = roles.map(r => {
                if (r === 'noun') return 'noun';
                if (r === 'verb') return 'verb';
                if (r === 'modifier' || r === 'mod' || r === 'adjective' || r === 'adverb') return 'modifier';
                if (r === 'particle') return 'particle';
                return null;
              }).filter(Boolean) as (keyof PartOfSpeechScores)[];

              if (roleKeys.length === 0) return w;

              const currentTotal = Object.values(w.partOfSpeechScores).reduce((a, b) => a + b, 0);
              if (currentTotal !== w.baseScore) {
                const distributed = Math.floor(w.baseScore / roleKeys.length);
                const newScores = { noun: 0, verb: 0, modifier: 0, particle: 0 };
                roleKeys.forEach(k => { newScores[k] = distributed; });
                return { ...w, partOfSpeechScores: newScores };
              }
            }
            return w;
          })
        }));
      },
    }),
// ─── MIGRATION SYSTEM ────────────────────────────────────────────────────────
// IMPORTANT: Any time you change src/data/initialMasteryMap.ts (adding words,
// changing partOfSpeech values, etc.), you MUST:
// 1. Bump the `version` number in the persist config below by 1.
// 2. Add a new migration case handling the old version → new version, applying
//    your changes to any persisted vocabulary so existing users get the update
//    without losing their progress.
// Failing to do this means existing users will never see your changes.
// ─────────────────────────────────────────────────────────────────────────────
    { 
      name: 'tp-tutor-mastery',
      version: 4,
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          if (persistedState && Array.isArray(persistedState.vocabulary)) {
            // Apply normalization to all words
            persistedState.vocabulary = persistedState.vocabulary.map((v: any) => ({
              ...v,
              partOfSpeech: normalizePartOfSpeech(v.partOfSpeech || '')
            }));

            const persistedVocab = persistedState.vocabulary;
            const persistedMap = new Map(persistedVocab.map((v: any) => [v.word.toLowerCase(), v]));

            // mappedVocabulary is our ground truth from code (already POS-normalized)
            persistedState.vocabulary = mappedVocabulary.map(staticWord => {
              const persistedWord = persistedMap.get(staticWord.id.toLowerCase());
              if (persistedWord) {
                // Determine if we should patch partOfSpeech
                let partOfSpeech = persistedWord.partOfSpeech;
                // If the static word has multiple roles, and the persisted one doesn't match the normalized ground truth, 
                // we might want to ensure it matches the static one if it's currently an outdated single role.
                const oldPOS = ['Adjective', 'Adverb', 'Interrogative', 'Ordinal-marker', 'Number'];
                const isOutdated = oldPOS.includes(partOfSpeech);

                if (isOutdated || !partOfSpeech) {
                  partOfSpeech = staticWord.partOfSpeech;
                }

                // Merge: preserve user progress, but update static linguistics
                return {
                  ...staticWord, 
                  ...persistedWord,
                  // Re-force fields that must match current code normalization
                  partOfSpeech,
                  meanings: staticWord.meanings,
                  isKu: staticWord.isKu
                };
              }
              return staticWord; // This word was missing from user's state, add it fresh
            });
          }
        }

        if (version < 4) {
          if (persistedState && Array.isArray(persistedState.vocabulary)) {
            const REMOVED_IDS = new Set(['ali', 'particle_li', 'particle_e', 'particle_pi', 'particle_la']);
            persistedState.vocabulary = persistedState.vocabulary.filter(
              (v: any) => !REMOVED_IDS.has(v.word) && !REMOVED_IDS.has(v.id)
            );
          }
        }
        return persistedState as MasteryStore;
      },
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { userId, cloudSynced, ...rest } = state;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Normalize vocabulary partOfSpeech
          if (Array.isArray(state.vocabulary)) {
            state.vocabulary = state.vocabulary.map(v => ({
              ...v,
              partOfSpeech: normalizePartOfSpeech(v.partOfSpeech)
            }));
          }

          // Ensure critical array fields are always arrays and not empty if defaults exist
          if (!Array.isArray(state.commonPhrases) || state.commonPhrases.length === 0) {
            state.commonPhrases = defaultCommonPhrases;
          }
          state.songs = defaultSongs;
          if (!Array.isArray(state.savedPhrases)) {
            state.savedPhrases = [];
          }

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
          state.refreshCurriculumStatus();
        }
      }
    }
  )
);
