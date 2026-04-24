/* src/services/linaService.ts */
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VocabWord, MasteryStatus } from '../types/mastery';

export const STATUS_EMOJI: Record<string, string> = {
  not_started: '⬜',
  introduced: '🔵',
  practicing: '🟡',
  confident: '🟢',
  mastered: '✅'
};

// Offline word-by-word gloss built from local vocabulary data — no API needed.
export function buildOfflineTranslation(selectedWords: string[], vocabulary: VocabWord[]): string {
  const glosses = selectedWords.map(w => {
    const entry = vocabulary.find(v => v.word === w);
    if (!entry) return w;
    const firstMeaning = entry.meanings.split(/[,;]/)[0].trim().replace(/^to /, '');
    return firstMeaning;
  });
  return glosses.join(' · ');
}

// Change 3: delta-based proposed change — wordId + signed integer delta.
export interface ProposedChange {
  wordId: string;
  delta: number;
}

// Resolves the API key with env-var fallback for local dev.
export function resolveApiKey(overrideKey?: string): string {
  return overrideKey
    || localStorage.getItem('TP_GEMINI_KEY')
    || (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)
    || '';
}

// Change 3: include confidenceScore in the prompt and use the new delta format.
export function buildSystemPrompt(vocabulary: VocabWord[], studentName: string) {
  const activeVocab = vocabulary
    .filter(v => v.status === 'introduced' || v.status === 'practicing')
    .map(v => `${v.word} (score:${v.confidenceScore}, status:${v.status})`)
    .join(', ');

  return `You are an expert Toki Pona teacher. The student's name is ${studentName}.

CURRENT STUDENT PROGRESS:
Active words (introduced/practicing): ${activeVocab || 'None yet'}

SCORING RULES — only propose changes for words actually used or tested this session:
  Correct, confident use in a new context: +8 to +12
  Correct but hesitant or prompted use:    +3 to +6
  Minor error, self-corrected:             -3 to -5
  Clear mistake or misuse:                 -8 to -15

If any active words were used or tested, append a PROPOSED CHANGES block using exactly this format:
---
CHANGE: vocab | [word_id] | [delta]
---
[delta] is a signed integer, e.g. +8 or -10. Only include words from the active list above.`;
}

export async function* streamCompletion(
  apiKey: string,
  systemPrompt: string,
  history: { role: 'user' | 'assistant'; content: string }[]
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: systemPrompt });

  const chat = model.startChat({
    history: history.slice(0, -1).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    }))
  });

  const lastMessage = history[history.length - 1].content;
  const result = await chat.sendMessageStream(lastMessage);
  for await (const chunk of result.stream) yield chunk.text();
}

// Strips markdown code fences before JSON.parse.
function sanitizeJson(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
}

export async function fetchSentenceSuggestions(apiKey: string, words: string[]) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = `Act as a Toki Pona tutor. Given these words: [${words.join(', ')}], generate 3 short grammatically correct Toki Pona sentences using most or all of them. You MAY add particles like "li", "e", "en", "la", or "pi". Return a JSON array of strings: ["sentence 1", "sentence 2", "sentence 3"]`;
  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(sanitizeJson(result.response.text())) as string[];
  } catch (e) {
    console.error('Lina Suggestion Error:', e);
    return [];
  }
}

export async function fetchQuickTranslation(apiKey: string, text: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Translate this Toki Pona phrase to English: "${text}". Provide ONLY the direct English translation, no other text, quotes, or explanation.`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    console.error('Lina Translation Error:', e);
    return null;
  }
}

export async function fetchExamplesForWord(apiKey: string, word: string, partsOfSpeech: string[]) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
  const prompt = `Act as a Toki Pona dictionary. For the word "${word}", provide one simple example sentence for each of these parts of speech: ${partsOfSpeech.join(', ')}. Return ONLY a JSON object mapping each part of speech to a sentence, e.g. {"noun": "sentence", "verb": "sentence"}`;
  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(sanitizeJson(result.response.text())) as Record<string, string>;
  } catch (e) {
    console.error('Lina Dictionary Error:', e);
    return partsOfSpeech.reduce((acc, pos) => ({ ...acc, [pos]: `${word} li lon.` }), {} as Record<string, string>);
  }
}

export function stripProposedChanges(text: string) {
  return text.split('---')[0].trim();
}

// Change 3: parses "CHANGE: vocab | word_id | +8" → { wordId, delta }.
// Case-insensitive, strips markdown bold, collapses whitespace.
export function parseProposedChanges(text: string): ProposedChange[] | null {
  const changes: ProposedChange[] = [];
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    if (!/change:\s*vocab/i.test(line)) continue;
    const parts = line.split('|').map(p => p.trim());
    if (parts.length < 3) continue;
    const wordId = parts[1];
    const delta = parseInt(parts[2].replace(/[^-+\d]/g, ''), 10);
    if (wordId && !isNaN(delta)) changes.push({ wordId, delta });
  }
  return changes.length > 0 ? changes : null;
}

// Generates a brief plain-language recap of score changes for the end of session.
export async function fetchSessionRecap(
  apiKey: string,
  deltas: { wordId: string; delta: number }[]
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const summary = deltas
    .map(d => `${d.wordId}: ${d.delta > 0 ? '+' : ''}${d.delta}`)
    .join(', ');
  const prompt = `You are a Toki Pona teacher giving a student a brief end-of-session summary. The following words had their confidence scores adjusted this session: ${summary}. Write 2–3 sentences in plain English (no bullet points, no headers) describing which words improved, which dropped, and offer one encouraging word. Keep it concise.`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    console.error('Session recap error:', e);
    // Fallback: build a plain summary without the API
    const ups = deltas.filter(d => d.delta > 0).map(d => d.wordId);
    const downs = deltas.filter(d => d.delta < 0).map(d => d.wordId);
    const parts: string[] = [];
    if (ups.length) parts.push(`${ups.join(', ')} moved up`);
    if (downs.length) parts.push(`${downs.join(', ')} dropped a little`);
    return parts.length ? `Session complete! ${parts.join('; ')}.` : 'Session complete! Keep practising.';
  }
}
