import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash"; // User specifically requested 2.5-flash

async function getWords() {
  const dictPath = path.join(process.cwd(), 'src', 'data', 'tokiPonaDictionary.ts');
  const content = await fs.readFile(dictPath, 'utf-8');
  const matches = content.matchAll(/"([^"]+)":/g);
  const allKeys = Array.from(matches, m => m[1]);
  // We want the words from TOKI_PONA_DICTIONARY.
  // They are the ones that are likely short and listed before WORD_FREQUENCY.
  // A simple heuristic: take the first 137 unique keys that are not 'overall', 'production', etc.
  return [...new Set(allKeys)].filter(w => w.length > 0 && w !== 'overall' && w !== 'production' && w !== 'recognition').slice(0, 137);
}

const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'aiVocabCache.json');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateDataForWord(model, word) {
  const prompt = `Act as jan Lina, a Toki Pona teacher. For the word "${word}", generate a deep-dive response including:
1. Simple: A basic "Subject + Word" sentence.
2. Intermediate: "Word + Modifiers" sentence.
3. Advanced: A complex sentence using "la" or "e".
4. Explanation: A 2-3 sentence explanation of the word's deeper semantic meaning or common usage nuances.

Return ONLY a valid JSON object matching this exact format: 
{"aiExamples": {"simple": "tp (en)", "intermediate": "tp (en)", "advanced": "tp (en)"}, "aiExplanation": "..."}`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(text);
  } catch (e) {
    console.error(`Error for word "${word}":`, e.message);
    return null;
  }
}

async function main() {
  if (!API_KEY) {
    console.error("No API key found. Please set VITE_GEMINI_API_KEY or GEMINI_API_KEY in .env");
    process.exit(1);
  }

  const words = await getWords();
  console.log(`Found ${words.length} words to process.`);

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: "application/json" }
  });

  let cache = {};
  try {
    const existing = await fs.readFile(OUTPUT_FILE, 'utf-8');
    cache = JSON.parse(existing);
    console.log(`Loaded existing cache with ${Object.keys(cache).length} words.`);
  } catch (e) {
    console.log("Starting with new cache.");
  }

  const wordsToDo = words.filter(w => !cache[w]);
  console.log(`Processing ${wordsToDo.length} new words...`);

  for (let i = 0; i < wordsToDo.length; i++) {
    const word = wordsToDo[i];
    console.log(`[${i + 1}/${wordsToDo.length}] Generating for: ${word}`);
    
    const data = await generateDataForWord(model, word);
    if (data) {
      cache[word] = data;
      await fs.writeFile(OUTPUT_FILE, JSON.stringify(cache, null, 2));
    }

    await delay(2000);
  }

  console.log("Done! Cache saved to", OUTPUT_FILE);
}

main();
