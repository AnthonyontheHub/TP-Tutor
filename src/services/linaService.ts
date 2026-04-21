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

/**
 * Builds the personality and knowledge base for Lina
 */
export function buildSystemPrompt(vocabulary: VocabWord[], chapters: any[], studentName: string) {
  const knownVocab = vocabulary
    .filter(v => v.status !== 'not_started')
    .map(v => `${v.word} (${v.status})`)
    .join(', ');

  return `
    You are Lina, an encouraging and expert Toki Pona tutor.
    The student's name is ${studentName}.
    
    CURRENT STUDENT PROGRESS:
    Known Words: ${knownVocab || 'None yet'}
    
    YOUR RULES:
    1. Speak naturally, but occasionally use Toki Pona words the student knows.
    2. If a student builds a sentence, celebrate it! Correct it gently if needed.
    3. At the end of every response, if the student demonstrated knowledge, append a "PROPOSED CHANGES" section.
    
    FORMAT FOR PROPOSED CHANGES:
    ---
    CHANGE: vocab | [word_id] | [new_status]
    ---
    Statuses: introduced, practicing, confident, mastered.
  `;
}

/**
 * Streams completion from Gemini
 */
export async function* streamCompletion(
  apiKey: string,
  systemPrompt: string,
  history: { role: 'user' | 'assistant'; content: string }[]
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const chat = model.startChat({
    history: history.slice(0, -1).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    })),
    systemInstruction: systemPrompt,
  });

  const lastMessage = history[history.length - 1].content;
  const result = await chat.sendMessageStream(lastMessage);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    yield chunkText;
  }
}

/**
 * UI Utilities
 */
export function stripProposedChanges(text: string) {
  return text.split('---')[0].trim();
}

export function parseProposedChanges(text: string): ProposedChange[] | null {
  if (!text.includes('---')) return null;
  const sections = text.split('---');
  const changeSection = sections[sections.length - 1] || sections[1];
  
  const changes: ProposedChange[] = [];
  const lines = changeSection.split('\n');
  
  lines.forEach(line => {
    if (line.includes('CHANGE: vocab')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        changes.push({
          type: 'vocab',
          wordId: parts[1],
          newStatus: parts[2] as MasteryStatus
        });
      }
    }
  });

  return changes.length > 0 ? changes : null;
}

/**
 * Dictionary Helper for the Drawers
 */
export async function fetchExamplesForWord(apiKey: string, word: string, partsOfSpeech: string[]) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Act as a Toki Pona dictionary. For the word "${word}", provide one simple example sentence for each of these parts of speech: ${partsOfSpeech.join(', ')}. Return ONLY a JSON object: {"noun": "sentence", "verb": "sentence"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json|```/g, ''));
  } catch (e) {
    console.error("Lina Dictionary Error:", e);
    return partsOfSpeech.reduce((acc, pos) => ({ ...acc, [pos]: `${word} li lon.` }), {});
  }
}
