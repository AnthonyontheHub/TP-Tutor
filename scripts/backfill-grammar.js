import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";

async function main() {
  if (!API_KEY) {
    console.error("No API key found. Please set GEMINI_API_KEY in .env or run with GEMINI_API_KEY='...' node scripts/backfill-grammar.js");
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

  const mapPath = path.join(process.cwd(), 'src', 'data', 'initialMasteryMap.ts');
  const mapContent = await fs.readFile(mapPath, 'utf-8');
  
  const wordsToProcess = [];
  const matches = mapContent.matchAll(/\{ word: "([^"]+)", partOfSpeech: "([^"]+)"/g);
  for (const match of matches) {
    const word = match[1];
    const pos = match[2];
    if (cache[word] && !cache[word].grammarExamples) {
      wordsToProcess.push({ word, pos: pos.split(',').map(s => s.trim()) });
    }
  }

  console.log(`Found ${wordsToProcess.length} words to backfill with grammar examples.`);

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: "application/json" }
  });

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < wordsToProcess.length; i++) {
    const { word, pos } = wordsToProcess[i];
    console.log(`[${i + 1}/${wordsToProcess.length}] Generating grammar examples for: ${word} (${pos.join(', ')})`);
    
    const prompt = `Act as jan Lina, a Toki Pona teacher. For the word "${word}", provide one simple example sentence and its English translation for each of these parts of speech: ${pos.join(', ')}. Return ONLY a JSON object mapping each exact part of speech name to its example and translation, e.g. {"noun": "toki pona li pona. (Good speech is good.)", "verb": "mi toki. (I speak.)"}`;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const grammarExamples = JSON.parse(text);
      
      cache[word].grammarExamples = grammarExamples;
      await fs.writeFile(OUTPUT_FILE, JSON.stringify(cache, null, 2));
    } catch (e) {
      console.error(`Error for word "${word}":`, e.message);
    }

    await delay(1500); // rate limiting
  }

  console.log("Done! Cache saved to", OUTPUT_FILE);
}

main();