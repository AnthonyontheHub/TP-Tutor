import type { VocabWord, MasteryStatus, UserProfile, LoreEntry, ReviewVibe } from '../types/mastery';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TOKI_PONA_DICTIONARY } from '../data/tokiPonaDictionary';

const GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Builds a simple literal translation for offline use or as a fallback.
 * Joins the primary English meanings of the selected Toki Pona words.
 */
export function buildOfflineTranslation(selectedWords: string[], vocabulary: VocabWord[]): string {
  if (selectedWords.length === 0) return '';
  return selectedWords
    .map(word => {
      const entry = vocabulary.find(v => v.word.toLowerCase() === word.toLowerCase());
      const dictMeaning = TOKI_PONA_DICTIONARY[word.toLowerCase()];
      
      // If we have an entry with meanings, use it
      if (entry && entry.meanings) {
        return entry.meanings.split(/[;,]/)[0].trim();
      }
      
      // Fallback to local dictionary
      if (dictMeaning) {
        return dictMeaning.split(/[;,]/)[0].trim();
      }
      
      return `(${word}?)`;
    })
    .join(' ');
}

// Helper to stringify user context for prompts
export function stringifyUserContext(profile: UserProfile, lore: LoreEntry[]): string {
  const name = profile.tpName || profile.tokiPonaName || profile.firstName || 'Student';
  const profileStr = `Name: ${name}, Age: ${profile.age || 'Unknown'}, Location: ${profile.locationString || 'Unknown'}, Sex: ${profile.sex || 'Unknown'}`;
  const loreStr = lore.map(l => `[${l.category}]: ${l.detail}`).join('; ');
  return `${profileStr}. Lore: ${loreStr}`;
}

export interface ProposedChange {
  type: 'vocab' | 'concept';
  id: string;
  newStatus: MasteryStatus;
}

// Resolves the API key with env-var fallback for local dev.
export function resolveApiKey(overrideKey?: string): string {
  // If sandbox mode is explicitly on via localStorage, return empty
  if (localStorage.getItem('tp_sandbox_mode') === 'true') return '';

  return overrideKey
    || localStorage.getItem('TP_GEMINI_KEY')
    || (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)
    || '';
}

export function buildSystemPrompt(
  vocabulary: any[],
  concepts: any[],
  studentName: string,
  userContext?: string,
  activeCurriculumTitle?: string,
  activeModuleTitle?: string,
  vibe: ReviewVibe = 'chill'
) {
  const activeVocab = vocabulary
    .filter(v => v.status === 'introduced' || v.status === 'practicing' || v.status === 'confident')
    .map(v => `${v.word} (${v.status}) - Notes: ${v.sessionNotes || 'None'}`)
    .join('\n');

  const activeConcepts = concepts
    .filter(c => c.status === 'introduced' || c.status === 'practicing' || c.status === 'confident')
    .map(c => `${c.title} (${c.status}) - Notes: ${c.sessionNotes || 'None'}`)
    .join('\n');

  const vibeContext = vibe === 'chill' 
    ? "The student wants a 'Chill' session focusing on **Reviewing personal saved phrases**. Use their known vocabulary to reinforce progress."
    : vibe === 'deep'
    ? "The student wants a 'Deep' session focusing on **Learning everyday phrases and common expressions** from THE ARCHIVE. Introduce and drill standard Toki Pona idioms and daily speech."
    : vibe === 'intense'
    ? "The student wants an 'Intense' session focusing on **Mastering song lyrics from the discography** in THE ARCHIVE. Use lyrics from their album library to deep-dive into grammar and poetic usage."
    : "The student wants a balanced session. Chat naturally and test them on their active vocabulary.";

  const lessonContext = activeModuleTitle
    ? `CURRENT LESSON GOAL:\nThe student has explicitly chosen to study: ${activeCurriculumTitle} - ${activeModuleTitle}. Focus your teaching and drills entirely on this topic today.`
    : `CURRENT LESSON GOAL:\nFree practice. Chat naturally and test them on their active vocabulary. ${vibeContext}`;

  const contextStr = userContext ? `\nUSER BACKGROUND & LORE:\n${userContext}` : '';

  return `
    You are jan Lina, an expert Toki Pona teacher and a friendly conversational partner.
    The student's name is ${studentName}.${contextStr}

    CRITICAL INSTRUCTION: You must act as a natural conversational partner. Answer the student's questions organically using your broad AI knowledge, but always maintain your persona as a Toki Pona teacher. 

    TEACHING PHILOSOPHY: You provide immersive Toki Pona practice. 
    1. Always provide an English translation in parentheses immediately following any Toki Pona phrase you use.
    2. Check the student's progress below. Use simple Toki Pona sentences that specifically target their current "Introduced" or "Practicing" words. Avoid complex words they haven't learned yet.
    3. Encourage the student to speak Toki Pona, but ensure they understand everything you say by providing clear translations.
    4. You are a teacher: speaking Toki Pona is for immersion, but translation is for comprehension. Ensure both are present.
    5. Strictly match the student's current mastery level: do not use complex sentence structures or rare vocabulary if the student is a Beginner. Use their "Mastered" and "Confident" words for conversation, and "Introduced" words for teaching.

    RULE OF BREVITY: Never reply with more than 3 sentences. Focus on exactly ONE concept, vocabulary word, or correction per message. Do not info-dump. Always end with a single, simple question to keep the user engaged.

    RULE OF GRACE: Ignore minor English typos (e.g., 'season' instead of 'session'). Do not give pedantic lectures about English vs Toki Pona translation gaps for obvious typos. Respond to the user's obvious intent.

    RULE OF CALIBRATION: Do NOT announce your calibrations (e.g., '+ CALIBRATING') in the text of your response. Use your tool calls (PROPOSED CHANGES) silently in the background. Follow the Mastery Map rules: ONLY suggest '✅ Mastered' by mutual agreement, and do major note/status updates at the END of a study session, not after every single user message.

    RULE OF ABSURDITY: If a user builds a sentence that is grammatically correct but logically nonsensical or absurd, playfully call it out, show the literal translation, and ask if that's what they actually meant.

    PERSONALIZATION: Frequently use the student's background lore provided above to make your examples, exercises, and conversations highly personal and relevant to their life.

    ${lessonContext}

    CURRENT STUDENT PROGRESS & MEMORY:
    You must use these session notes to remember what the student struggled with last time.
    Active Words:
    ${activeVocab || 'None'}

    Active Concepts:
    ${activeConcepts || 'None'}

    YOUR RULES:
    1. At the end of every response, if the student demonstrated knowledge, append a "PROPOSED CHANGES" section.
    2. Be conversational. Don't just drill; talk with them!

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
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction: systemPrompt });

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

export async function fetchSentenceSuggestions(apiKey: string, words: string[], userContext?: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  });
  const contextInstruction = userContext ? ` Context: ${userContext}.` : '';
  const prompt = `Act as jan Lina, a Toki Pona tutor. Given these words: [${words.join(', ')}], generate 3 short grammatically correct Toki Pona sentences using most or all of them.${contextInstruction} Provide English translations. You MAY add particles like "li", "e", "en", "la", or "pi". Return a JSON array of strings: ["sentence 1 (translation)", "sentence 2 (translation)", "sentence 3 (translation)"]`;
  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(sanitizeJson(result.response.text())) as string[];
  } catch (e) {
    console.error('jan Lina Suggestion Error:', e);
    return [];
  }
}

export async function fetchQuickTranslation(apiKey: string, text: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const prompt = `Translate this Toki Pona phrase to English: "${text}". Provide ONLY the direct English translation, no other text, quotes, or explanation.`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    console.error('jan Lina Translation Error:', e);
    return null;
  }
}

export async function fetchDeepDiveExamples(apiKey: string, word: string, userContext?: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  });
  const contextInstruction = userContext ? ` User Context: ${userContext}.` : '';
  const prompt = `Act as jan Lina, a Toki Pona teacher. For the word "${word}", generate a deep-dive response including:
1. Simple: A basic "Subject + Word" sentence.
2. Intermediate: "Word + Modifiers" sentence.
3. Advanced: A complex sentence using "la" or "e".
4. Personal Take: A sentence combining the word "${word}" with a random piece of background lore.
5. Explanation: A 2-3 sentence explanation of the word's deeper semantic meaning or common usage nuances.

${contextInstruction}
Return a JSON object: {"simple": "tp (en)", "intermediate": "tp (en)", "advanced": "tp (en)", "personal": "tp (en)", "explanation": "..."}`;
  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(sanitizeJson(result.response.text())) as Record<string, string>;
  } catch (e) {
    console.error('jan Lina Deep Dive Error:', e);
    return null;
  }
}

export async function fetchExamplesForWord(apiKey: string, word: string, partsOfSpeech: string[], userContext?: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  });
  const contextInstruction = userContext ? ` Context: ${userContext}.` : '';
  const prompt = `Act as jan Lina, a Toki Pona teacher. For the word "${word}", provide one simple example sentence and its English translation for each of these parts of speech: ${partsOfSpeech.join(', ')}.${contextInstruction} Return ONLY a JSON object mapping each part of speech to its example and translation, e.g. {"noun": "toki pona li pona. (Good speech is good.)", "verb": "mi toki. (I speak.)"}`;
  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(sanitizeJson(result.response.text())) as Record<string, string>;
  } catch (e) {
    console.error('jan Lina Examples Error:', e);
    return partsOfSpeech.reduce((acc, pos) => ({ ...acc, [pos]: `${word} li lon. (${word} is here.)` }), {} as Record<string, string>);
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
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const summary = changes
    .map(c => `${c.id}: → ${c.newStatus}`)
    .join(', ');
  const prompt = `You are jan Lina, a Toki Pona teacher giving a student a brief end-of-session summary. The following words and concepts had their mastery status updated this session: ${summary}. Write 2–3 sentences in plain English (no bullet points, no headers) describing what improved. Keep it concise and encouraging.`;
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
