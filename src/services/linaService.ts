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

export function buildSystemPrompt(vocabulary: VocabWord[], studentName: string) {
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

export async function* streamCompletion(
  apiKey: string,
  systemPrompt: string,
  history: { role: 'user' | 'assistant'; content: string }[]
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt 
  });

  const chat = model.startChat({
    history: history.slice(0, -1).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    }))
  });

  const lastMessage = history[history.length - 1].content;
  const result = await chat.sendMessageStream(lastMessage);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    yield chunkText;
  }
}

export async function fetchSentenceSuggestions(apiKey: string, words: string[]) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Act as a Toki Pona tutor. Given these specific words: [${words.join(', ')}], 
    generate 3 short, grammatically correct Toki Pona sentences using most or all of them. 
    You MAY add necessary particles like "li", "e", "en", "la", or "pi".
    Return ONLY a JSON array of strings: ["sentence 1", "sentence 2", "sentence 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // FIX: Fortified JSON extraction handling code block wrappers
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in response");
    
    return JSON.parse(jsonMatch[0]) as string[];
  } catch (e) {
    console.error("Lina Suggestion Error:", e);
    return ["mi wile e sona.", "toki pona li pona.", "sina sona e toki pona."]; // Safe offline/error fallback
  }
}

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

export async function fetchExamplesForWord(apiKey: string, word: string, partsOfSpeech: string[]) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Act as a Toki Pona dictionary. For the word "${word}", provide one simple example sentence for each of these parts of speech: ${partsOfSpeech.join(', ')}. Return ONLY a JSON object: {"noun": "sentence", "verb": "sentence"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // FIX: Fortified JSON extraction handling code block wrappers
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON object found in response");
    
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("Lina Dictionary Error:", e);
    return partsOfSpeech.reduce((acc, pos) => ({ ...acc, [pos]: `${word} li lon.` }), {}); // Safe fallback
  }
}
