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

export interface ProposedChange {
  type: 'vocab' | 'concept';
  wordId?: string;
  conceptId?: string;
  chapterId?: string;
  newStatus: MasteryStatus;
}

// Resolves the API key with env-var fallback for local dev.
export function resolveApiKey(overrideKey?: string): string {
  return overrideKey
    || localStorage.getItem('TP_GEMINI_KEY')
    || (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)
    || '';
}

export function buildSystemPrompt(vocabulary: VocabWord[], studentName: string) {
  const activeVocab = vocabulary
    .filter(v => v.status === 'introduced' || v.status === 'practicing')
    .map(v => `${v.word} (${v.status})`)
    .join(', ');

  return `You are an expert Toki Pona teacher. The student's name is ${studentName}.

CURRENT STUDENT PROGRESS:
Active words (introduced/practicing): ${activeVocab || 'None yet'}

If the student uses an active word correctly, append a PROPOSED CHANGES block at the end of your response using exactly this format:
---
CHANGE: vocab | [word_id] | [new_status]
---
Valid statuses: introduced, practicing, confident, mastered.`;
}

export async function* streamCompletion(
  apiKey: string,
  systemPrompt: string,
  history: { role: 'user' | 'assistant'; content: string }[]
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: systemPrompt });

  const chat = model.startChat({
    history: history.slice(0, -1).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    }))
  });

  const lastMessage = history[history.length - 1].content;
  const result = await chat.sendMessageStream(lastMessage);

  for await (const chunk of result.stream) {
    yield chunk.text();
  }
}

// Req 1: Use native JSON output mode — no regex parsing needed.
export async function fetchSentenceSuggestions(apiKey: string, words: string[]) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Act as a Toki Pona tutor. Given these words: [${words.join(', ')}], generate 3 short grammatically correct Toki Pona sentences using most or all of them. You MAY add particles like "li", "e", "en", "la", or "pi". Return a JSON array of strings: ["sentence 1", "sentence 2", "sentence 3"]`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as string[];
  } catch (e) {
    console.error("Lina Suggestion Error:", e);
    return [];
  }
}

export async function fetchQuickTranslation(apiKey: string, text: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Translate this Toki Pona phrase to English: "${text}". Provide ONLY the direct English translation, no other text, quotes, or explanation.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    console.error("Lina Translation Error:", e);
    return null;
  }
}

// Req 1: Use native JSON output mode — no regex parsing needed.
export async function fetchExamplesForWord(apiKey: string, word: string, partsOfSpeech: string[]) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Act as a Toki Pona dictionary. For the word "${word}", provide one simple example sentence for each of these parts of speech: ${partsOfSpeech.join(', ')}. Return ONLY a JSON object mapping each part of speech to a sentence, e.g. {"noun": "sentence", "verb": "sentence"}`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text()) as Record<string, string>;
  } catch (e) {
    console.error("Lina Dictionary Error:", e);
    return partsOfSpeech.reduce((acc, pos) => ({ ...acc, [pos]: `${word} li lon.` }), {} as Record<string, string>);
  }
}

export function stripProposedChanges(text: string) {
  return text.split('---')[0].trim();
}

export function parseProposedChanges(text: string): ProposedChange[] | null {
  const changes: ProposedChange[] = [];
  const lines = text.split('\n');

  lines.forEach(line => {
    if (line.includes('CHANGE: vocab')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        changes.push({ type: 'vocab', wordId: parts[1], newStatus: parts[2] as MasteryStatus });
      }
    }
  });

  return changes.length > 0 ? changes : null;
}
