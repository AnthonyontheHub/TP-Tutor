import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";

const WORD_RELATIONSHIPS = {
  a: ['kin (Synonym)'],
  akesi: ['kala (Category)', 'pipi (Category)', 'soweli (Category)', 'waso (Category)'],
  ala: ['ali (Antonym)', 'mute (Antonym-ish)', 'wan (Opposite-ish)'],
  alasa: ['kama (Goal)', 'lukin (Action)'],
  ale: ['ala (Antonym)', 'mute (Synonym-ish)', 'wan (Opposite-ish)'],
  ali: ['ala (Antonym)', 'mute (Synonym-ish)', 'wan (Opposite-ish)'],
  anpa: ['monsi (Location)', 'noka (Location)', 'sewi (Antonym)', 'sinpin (Location)'],
  ante: ['sama (Antonym)'],
  anu: ['en (Conjunction)'],
  awen: ['pali (Opposite-ish)', 'tawa (Antonym)'],
  e: ['la (Particle)', 'li (Particle)', 'o (Particle)', 'pi (Particle)'],
  en: ['anu (Conjunction)'],
  esun: ['mani (Related)', 'pana (Action)'],
  ijo: ['jan (Antonym-ish)', 'kulupu (Opposite-ish)'],
  ike: ['jaki (Synonym-ish)', 'pakala (Result)', 'pona (Antonym)'],
  ilo: ['pali (Action)'],
  insa: ['monsi (Location)', 'poka (Location)', 'selo (Antonym)', 'sinpin (Location)'],
  jaki: ['ike (Synonym-ish)', 'pona (Antonym)'],
  jan: ['ijo (Antonym-ish)', 'kulupu (Plural)', 'meli (Subset)', 'mije (Subset)', 'tonsi (Subset)'],
  jelo: ['kule (Category)'],
  jo: ['lanpan (Action)', 'pana (Antonym)'],
  kala: ['akesi (Category)', 'pipi (Category)', 'soweli (Category)', 'waso (Category)'],
  kalama: ['kute (Action)', 'mu (Subset)', 'toki (Subset)'],
  kama: ['alasa (Action)', 'awen (Opposite-ish)', 'open (Synonym-ish)', 'tawa (Action)'],
  kasi: ['kili (Part)', 'pan (Subset)', 'soko (Subset)'],
  ken: ['wile (Related)'],
  kepeken: ['ilo (Related)'],
  kijetesantakalu: ['soweli (Category)'],
  kili: ['kasi (Source)', 'pan (Subset)', 'soko (Subset)'],
  kin: ['a (Synonym)'],
  kipisi: ['tu (Synonym-ish)'],
  kiwen: ['ko (Antonym)', 'telo (Opposite-ish)'],
  ko: ['kiwen (Antonym)', 'telo (Neighbor)'],
  kokosila: ['toki (Related)'],
  kon: ['telo (Opposite-ish)'],
  ku: ['lipu (Category)', 'pu (Related)'],
  kule: ['jelo (Subset)', 'laso (Subset)', 'loje (Subset)', 'pimeja (Opposite-ish)', 'walo (Opposite-ish)'],
  kulupu: ['ijo (Opposite-ish)', 'jan (Member)'],
  kute: ['kalama (Target)', 'lukin (Sense)', 'oko (Sense)'],
  la: ['e (Particle)', 'li (Particle)', 'o (Particle)', 'pi (Particle)'],
  lanpan: ['jo (Result)', 'pana (Antonym)'],
  lape: ['awen (Synonym-ish)', 'pali (Antonym)'],
  laso: ['kule (Category)'],
  lawa: ['noka (Antonym)'],
  len: ['selo (Synonym-ish)'],
  lete: ['seli (Antonym)'],
  li: ['e (Particle)', 'la (Particle)', 'o (Particle)', 'pi (Particle)'],
  lili: ['suli (Antonym)'],
  linja: ['palisa (Synonym-ish)', 'sike (Antonym-ish)'],
  lipu: ['ku (Specific)', 'pu (Specific)'],
  loje: ['kule (Category)'],
  lon: ['weka (Antonym)'],
  luka: ['noka (Opposite-ish)'],
  lukin: ['kute (Sense)', 'oko (Synonym)'],
  lupa: ['nena (Antonym)'],
  ma: ['telo (Antonym-ish)'],
  mama: ['jan (Category)'],
  mani: ['esun (Related)'],
  meli: ['jan (Category)', 'mije (Counterpart)', 'tonsi (Counterpart)'],
  mi: ['ona (Pronoun)', 'sina (Pronoun)'],
  mije: ['jan (Category)', 'meli (Counterpart)', 'tonsi (Counterpart)'],
  moku: ['pana (Opposite-ish)'],
  moli: ['pini (Synonym-ish)'],
  monsi: ['anpa (Location)', 'insa (Location)', 'sinpin (Antonym)'],
  mu: ['kalama (Category)', 'toki (Opposite-ish)'],
  mun: ['suno (Antonym)'],
  musi: ['pali (Antonym)'],
  mute: ['ala (Antonym-ish)', 'ali (Synonym-ish)', 'lili (Antonym)', 'wan (Antonym)'],
  nanpa: ['mute (Related)'],
  nasa: ['pona (Antonym-ish)'],
  nasin: ['tawa (Action)'],
  nena: ['lupa (Antonym)'],
  ni: ['ona (Synonym-ish)'],
  nimi: ['toki (Component)'],
  noka: ['anpa (Location)', 'lawa (Antonym)', 'luka (Opposite-ish)'],
  o: ['e (Particle)', 'la (Particle)', 'li (Particle)', 'pi (Particle)'],
  oko: ['kute (Sense)', 'lukin (Synonym)'],
  olin: ['ike (Antonym-ish)', 'pona (Synonym-ish)'],
  ona: ['mi (Pronoun)', 'ni (Synonym-ish)', 'sina (Pronoun)'],
  open: ['pini (Antonym)'],
  pakala: ['ike (Related)', 'pona (Antonym)'],
  pali: ['awen (Opposite-ish)', 'lape (Antonym)', 'musi (Antonym)'],
  palisa: ['linja (Synonym-ish)', 'sike (Antonym-ish)', 'supa (Opposite-ish)'],
  pan: ['kasi (Source)', 'kili (Neighbor)'],
  pana: ['esun (Action)', 'jo (Antonym)', 'lanpan (Antonym)', 'moku (Opposite-ish)'],
  pi: ['e (Particle)', 'la (Particle)', 'li (Particle)', 'o (Particle)'],
  pilin: ['toki (Expression)'],
  pimeja: ['kule (Category)', 'walo (Antonym)'],
  pini: ['kama (Antonym-ish)', 'moli (Synonym-ish)', 'open (Antonym)'],
  pipi: ['akesi (Category)', 'kala (Category)', 'soweli (Category)', 'waso (Category)'],
  poka: ['insa (Location)', 'weka (Antonym)'],
  poki: ['insa (Related)'],
  pona: ['ike (Antonym)', 'jaki (Antonym)', 'nasa (Antonym-ish)', 'pakala (Antonym)'],
  pu: ['ku (Related)', 'lipu (Category)'],
  sama: ['ante (Antonym)'],
  seli: ['lete (Antonym)'],
  selo: ['insa (Antonym)', 'len (Synonym-ish)'],
  seme: ['ni (Answer)'],
  sewi: ['anpa (Antonym)', 'noka (Opposite-ish)'],
  sijelo: ['kon (Opposite-ish)'],
  sike: ['linja (Antonym-ish)', 'palisa (Antonym-ish)', 'supa (Opposite-ish)'],
  sin: ['awen (Antonym-ish)'],
  sina: ['mi (Pronoun)', 'ona (Pronoun)'],
  sinpin: ['anpa (Location)', 'insa (Location)', 'monsi (Antonym)'],
  sitelen: ['toki (Representation)'],
  soko: ['kasi (Category)', 'kili (Neighbor)'],
  sona: ['wile (Related)'],
  soweli: ['akesi (Category)', 'kala (Category)', 'kijetesantakalu (Subset)', 'pipi (Category)', 'waso (Category)'],
  suli: ['lili (Antonym)'],
  suno: ['mun (Antonym)'],
  supa: ['palisa (Opposite-ish)', 'sike (Opposite-ish)'],
  suwi: ['ike (Antonym-ish)'],
  tan: ['kama (Result)'],
  taso: ['mute (Antonym)'],
  tawa: ['awen (Antonym)', 'kama (Action)', 'nasin (Context)', 'weka (Action)'],
  telo: ['kiwen (Opposite-ish)', 'ko (Neighbor)', 'kon (Opposite-ish)'],
  tenpo: ['sike (Measurement)'],
  toki: ['kalama (Category)', 'kokosila (Related)', 'mu (Opposite-ish)', 'nimi (Component)', 'pilin (Source)', 'sitelen (Form)'],
  tomo: ['ma (Antonym-ish)'],
  tonsi: ['jan (Category)', 'meli (Counterpart)', 'mije (Counterpart)'],
  tu: ['kipisi (Synonym-ish)', 'wan (Neighbor)'],
  unpa: ['olin (Related)'],
  uta: ['moku (Action)', 'toki (Action)'],
  utala: ['musi (Opposite-ish)', 'pona (Antonym-ish)'],
  walo: ['kule (Category)', 'pimeja (Antonym)'],
  wan: ['ala (Opposite-ish)', 'ale (Opposite-ish)', 'ali (Opposite-ish)', 'mute (Antonym)', 'tu (Neighbor)'],
  waso: ['akesi (Category)', 'kala (Category)', 'pipi (Category)', 'soweli (Category)'],
  wawa: ['lili (Antonym-ish)'],
  weka: ['lon (Antonym)', 'poka (Antonym)', 'tawa (Action)'],
  wile: ['ken (Related)', 'sona (Related)']
};

const WORD_EXTRA_DATA = {
  'pona': { etymology: 'From Esperanto: bona', neighbors: ['ike (Antonym)', 'suwi (Synonym-ish)'], compounds: ['jan pona (friend)', 'toki pona (good language)'] },
  'ike': { etymology: 'From Finnish: ilkeä', neighbors: ['pona (Antonym)', 'jaki (Synonym-ish)'], compounds: ['toki ike (insult)', 'pilin ike (sad)'] },
  'telo': { etymology: 'From Portuguese: óleo', neighbors: ['ko (Opposite-ish)', 'kon (Opposite-ish)'], compounds: ['telo nasa (alcohol)', 'telo suli (ocean)'] },
  'toki': { etymology: 'From Tok Pisin: tok', neighbors: ['kalama (Neighbor)', 'nimi (Neighbor)'], compounds: ['toki pona (good language)', 'toki utala (argument)'] },
  'pali': { etymology: 'From Acadian French: palier', neighbors: ['musi (Antonym-ish)', 'awen (Opposite-ish)'], compounds: ['pali pona (good work)', 'ilo pali (tool)'] },
  'jan': { etymology: 'From Cantonese: 人 (jan)', neighbors: ['soweli (Neighbor)', 'ijoa (Neighbor)'], compounds: ['jan pona (friend)', 'jan utala (soldier)'] },
  'moku': { etymology: 'From Japanese: もぐもぐ (mogumogu)', neighbors: ['telo (Neighbor)', 'pan (Neighbor)'], compounds: ['moku pona (good food)', 'moku telo (drink)'] },
  'sona': { etymology: 'From Georgian: ცოდな (tsodna)', neighbors: ['nasa (Antonym-ish)', 'kute (Neighbor)'], compounds: ['sona pona (wisdom)', 'jan sona (expert)'] },
};

async function main() {
  if (!API_KEY) {
    console.error("No API key found. Please set GEMINI_API_KEY in .env");
    process.exit(1);
  }

  const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'aiVocabCache.json');
  let cache = {};
  try {
    const existing = await fs.readFile(OUTPUT_FILE, 'utf-8');
    cache = JSON.parse(existing);
    console.log(`Loaded existing cache with ${Object.keys(cache).length} words.`);
  } catch (e) {
    console.error("Failed to load aiVocabCache.json", e.message);
    process.exit(1);
  }

  const wordsToProcess = [];
  
  for (const word of Object.keys(cache)) {
    const baseNeighbors = WORD_RELATIONSHIPS[word] || [];
    const extra = WORD_EXTRA_DATA[word] || {};
    const extraNeighbors = extra.neighbors || [];
    
    const neighbors = Array.from(new Set([...extraNeighbors, ...baseNeighbors]));
    const filteredNeighbors = neighbors.filter(n => {
      if (extraNeighbors.includes(n)) return true;
      return !extraNeighbors.some(en => en.startsWith(n.split(' ')[0] + ' '));
    });

    if (filteredNeighbors.length > 0 && (!cache[word].neighborConnections || Object.keys(cache[word].neighborConnections).length !== filteredNeighbors.length)) {
      wordsToProcess.push({ word, filteredNeighbors });
    }
  }

  console.log(`Found ${wordsToProcess.length} words to backfill with neighbor connections.`);

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: "application/json" }
  });

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < wordsToProcess.length; i++) {
    const { word, filteredNeighbors } = wordsToProcess[i];
    console.log(`[${i + 1}/${wordsToProcess.length}] Generating neighbor connections for: ${word} (${filteredNeighbors.join(', ')})`);
    
    const prompt = `Act as jan Lina, a Toki Pona teacher. For the word "${word}", briefly explain its connection (e.g. Opposite, Synonym, Category, etc.) to each of these neighbors: ${filteredNeighbors.join(', ')}. Return ONLY a JSON object mapping each exact neighbor string provided to a 1-sentence explanation of the connection, e.g. {"ala (Antonym)": "Opposite: 'ali' means all, while 'ala' means none."}`;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const neighborConnections = JSON.parse(text);
      
      cache[word].neighborConnections = neighborConnections;
      await fs.writeFile(OUTPUT_FILE, JSON.stringify(cache, null, 2));
    } catch (e) {
      console.error(`Error for word "${word}":`, e.message);
    }

    await delay(1500); // rate limiting
  }

  console.log("Done! Cache saved to", OUTPUT_FILE);
}

main();