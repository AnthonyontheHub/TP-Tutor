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
export function buildOfflineTranslation(selectedWords: string[], _vocabulary: VocabWord[]): string {
  return selectedWords.join(' · ');
}

export interface ProposedChange {
  type: 'vocab' | 'concept';
  id: string;
  newStatus: MasteryStatus;
}

// Resolves the API key with env-var fallback for local dev.
export function resolveApiKey(overrideKey?: string): string {
  return overrideKey
    || localStorage.getItem('TP_GEMINI_KEY')
    || (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)
    || '';
}

export function buildSystemPrompt(
  vocabulary: any[],
  concepts: any[],
  studentName: string,
  activeCurriculumTitle?: string,
  activeModuleTitle?: string
) {
  const activeVocab = vocabulary
    .filter(v => v.status === 'introduced' || v.status === 'practicing' || v.status === 'confident')
    .map(v => `${v.word} (${v.status}) - Notes: ${v.sessionNotes || 'None'}`)
    .join('\n');

  const activeConcepts = concepts
    .filter(c => c.status === 'introduced' || c.status === 'practicing' || c.status === 'confident')
    .map(c => `${c.title} (${c.status}) - Notes: ${c.sessionNotes || 'None'}`)
    .join('\n');

  const lessonContext = activeModuleTitle
    ? `CURRENT LESSON GOAL:\nThe student has explicitly chosen to study: ${activeCurriculumTitle} - ${activeModuleTitle}. Focus your teaching and drills entirely on this topic today.`
    : `CURRENT LESSON GOAL:\nFree practice. Chat naturally and test them on their active vocabulary.`;

  return `
    You are an expert Toki Pona teacher.
    The student's name is ${studentName}.

    ${lessonContext}

    CURRENT STUDENT PROGRESS & MEMORY:
    You must use these session notes to remember what the student struggled with last time.
    Active Words:
    ${activeVocab || 'None'}

    Active Concepts:
    ${activeConcepts || 'None'}

    YOUR RULES:
    1. At the end of every response, if the student demonstrated knowledge, append a "PROPOSED CHANGES" section.

    FORMAT FOR PROPOSED CHANGES:
    ---
    CHANGE: vocab | [word_id] | [new_status]
    CHANGE: concept | [concept_id] | [new_status]
    ---
    Statuses: introduced, practicing, confident, mastered.
  `;
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

// Parses "CHANGE: vocab | word_id | new_status" and "CHANGE: concept | id | new_status"
export function parseProposedChanges(text: string): ProposedChange[] | null {
  const VALID_STATUSES: MasteryStatus[] = ['not_started', 'introduced', 'practicing', 'confident', 'mastered'];
  const changes: ProposedChange[] = [];
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    if (!/change:\s*(vocab|concept)/i.test(line)) continue;
    const parts = line.split('|').map(p => p.trim());
    if (parts.length < 3) continue;
    const typeMatch = parts[0].match(/change:\s*(vocab|concept)/i);
    if (!typeMatch) continue;
    const type = typeMatch[1].toLowerCase() as 'vocab' | 'concept';
    const id = parts[1];
    const rawStatus = parts[2].toLowerCase().replace(/[^a-z_]/g, '') as MasteryStatus;
    if (id && VALID_STATUSES.includes(rawStatus)) {
      changes.push({ type, id, newStatus: rawStatus });
    }
  }
  return changes.length > 0 ? changes : null;
}

export async function fetchSessionRecap(
  apiKey: string,
  changes: ProposedChange[]
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const summary = changes
    .map(c => `${c.id}: → ${c.newStatus}`)
    .join(', ');
  const prompt = `You are a Toki Pona teacher giving a student a brief end-of-session summary. The following words and concepts had their mastery status updated this session: ${summary}. Write 2–3 sentences in plain English (no bullet points, no headers) describing what improved. Keep it concise and encouraging.`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    console.error('Session recap error:', e);
    const improved = changes.filter(c => c.newStatus !== 'not_started').map(c => c.id);
    return improved.length
      ? `Session complete! Great work on: ${improved.join(', ')}.`
      : 'Session complete! Keep practising.';
  }
}
