import type { VocabWord, MasteryStatus, UserProfile, ReviewVibe, WeeklyChallenge } from '../types/mastery';
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
export function stringifyUserContext(profile: UserProfile, lore?: string): string {
  const name = profile.tpName || profile.firstName || 'Student';
  const profileStr = `Name: ${name}, Age: ${profile.age || 'Unknown'}, Location: ${profile.locationString || 'Unknown'}, Sex: ${profile.sex || 'Unknown'}`;
  
  const personality = [
    profile.mbti ? `MBTI: ${profile.mbti}` : null,
    profile.enneagram ? `Enneagram: ${profile.enneagram}` : null,
    profile.attachmentStyle ? `Attachment Style: ${profile.attachmentStyle}` : null,
    profile.bigFiveOpenness ? `Openness: ${profile.bigFiveOpenness}` : null,
    profile.bigFiveConscientiousness ? `Conscientiousness: ${profile.bigFiveConscientiousness}` : null,
    profile.bigFiveExtraversion ? `Extraversion: ${profile.bigFiveExtraversion}` : null,
    profile.bigFiveAgreeableness ? `Agreeableness: ${profile.bigFiveAgreeableness}` : null,
    profile.bigFiveNeuroticism ? `Neuroticism: ${profile.bigFiveNeuroticism}` : null,
  ].filter(Boolean).join(', ');

  const beliefs = [
    profile.religion ? `Religion: ${profile.religion === 'Other' ? profile.religionOther : profile.religion}` : null,
    profile.politicalIdentity?.length ? `Political Identity: ${profile.politicalIdentity.join(', ')}${profile.politicalIdentity.includes('Other') ? ` (${profile.politicalIdentityOther})` : ''}` : null,
  ].filter(Boolean).join(', ');

  const health = [
    profile.bloodType ? `Blood Type: ${profile.bloodType}` : null,
    profile.dietPattern ? `Diet: ${profile.dietPattern}` : null,
    profile.workoutStyle ? `Workout: ${profile.workoutStyle}` : null,
    profile.activityLevel ? `Activity Level: ${profile.activityLevel}` : null,
    profile.chronicConditions ? `Chronic Conditions: ${profile.chronicConditions}` : null,
  ].filter(Boolean).join(', ');

  const media = [
    profile.bookGenres?.length ? `Book Genres: ${profile.bookGenres.join(', ')}` : null,
    profile.tvGenres?.length ? `TV Genres: ${profile.tvGenres.join(', ')}` : null,
    profile.musicGenres?.length ? `Music Genres: ${profile.musicGenres.join(', ')}` : null,
    profile.gamingGenres?.length ? `Gaming Genres: ${profile.gamingGenres.join(', ')}` : null,
    profile.gamingPlatforms?.length ? `Gaming Platforms: ${profile.gamingPlatforms.join(', ')}` : null,
  ].filter(Boolean).join('; ');

  const dailyLife = [
    profile.chronotype ? `Chronotype: ${profile.chronotype}` : null,
    profile.workSchedule ? `Work Schedule: ${profile.workSchedule}` : null,
    profile.livingSituation ? `Living Situation: ${profile.livingSituation}` : null,
    profile.socialPreference ? `Social Preference: ${profile.socialPreference}` : null,
  ].filter(Boolean).join(', ');

  const loreStr = lore ? `\n\nBACKGROUND LORE:\n${lore}` : '';

  return `${profileStr}. Personality: ${personality}. Beliefs: ${beliefs}. Health: ${health}. Media: ${media}. Daily Life: ${dailyLife}.${loreStr}`;
}

export interface ProposedChange {
  type: 'vocab' | 'concept' | 'node' | 'vocab_production' | 'vocab_recognition' | 'confusion' | 'example';
  id: string;
  newStatus?: MasteryStatus;
  role?: 'noun' | 'verb' | 'mod';
  points?: number;
  wordB?: string;
  exampleSentence?: string;
}

export interface SessionSummaryNote {
  word: string;
  note: string;
}

export function parseSessionSummaryNotes(text: string): SessionSummaryNote[] | null {
  const summaryMatch = text.match(/---[\s\S]*?SESSION SUMMARY[\s\S]*?NOTES:([\s\S]*?)(?:CHANGES:|---|$)/i);
  if (!summaryMatch) return null;
  const notesText = summaryMatch[1].trim();
  const lines = notesText.split('\n');
  const notes: SessionSummaryNote[] = [];
  for (const line of lines) {
    const match = line.match(/^\[?([^\]:]+)\]?:\s*(.*)/);
    if (match) {
      const word = match[1].trim().replace(/[[\]]/g, '');
      if (word && word !== 'word') {
        notes.push({ word, note: match[2].trim() });
      }
    }
  }
  return notes.length > 0 ? notes : null;
}

// Resolves the API key strictly from user settings (localStorage).
export function resolveApiKey(overrideKey?: string): string {
  // If sandbox mode is explicitly on via localStorage, return empty
  if (localStorage.getItem('tp_sandbox_mode') === 'true') return '';

  return overrideKey
    || localStorage.getItem('TP_GEMINI_KEY')
    || '';
}

export function buildTutorPrompt(
  vocabulary: any[],
  concepts: any[],
  studentName: string,
  userContext?: string,
  activeCurriculumTitle?: string,
  activeModuleTitle?: string,
  vibe: ReviewVibe = 'chill',
  yesterdayWasActive?: boolean,
  regressionCandidates?: string[],
  confusionPairs?: { wordA: string, wordB: string }[],
  pendingProveIt?: { word: string, sentence: string, date: string }[],
  xpMultiplier: number = 1.0,
  currentChallenge?: WeeklyChallenge | null,
  pendingRankAcknowledgement?: string | null
) {
  const activeVocab = vocabulary
    .map(v => `${v.word} (overall: ${v.status}, production: ${v.productionStatus || 'same'}, recognition: ${v.recognitionStatus || 'same'}) - Notes: ${v.sessionNotes || 'None'}`)
    .join('\n');

  const activeConcepts = concepts
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
  
  let openingContext = '';
  if (yesterdayWasActive) {
    openingContext += "The student was active yesterday. Briefly and naturally acknowledge their consistency at the start of the session — one sentence, woven into your greeting, not a separate announcement.\n";
  }
  if (regressionCandidates && regressionCandidates.length > 0) {
    openingContext += `REGRESSION WATCH: The following words have shown repeated difficulty over the past several days: ${regressionCandidates.join(', ')}. Weave practice of these words naturally into the session — do not make it feel like punishment, but do prioritize them.\n`;
  }
  if (confusionPairs && confusionPairs.length > 0) {
    openingContext += `CONFUSION PAIRS: This student specifically confuses these word pairs: ${confusionPairs.map(p => `${p.wordA} vs ${p.wordB}`).join(', ')}. When either word in a pair comes up, keep the other nearby — contrast them naturally and help the student build clear separation.\n`;
  }
  if (pendingProveIt && pendingProveIt.length > 0) {
    openingContext += `PROVE IT REVIEW: The student submitted these sentences for your review before this session. Evaluate each one naturally during the session — correct errors, praise good usage, and use them as a springboard for drilling. Do not make a big announcement about reviewing them; weave it in.\n${pendingProveIt.map(p => `Word: ${p.word} | Sentence: "${p.sentence}"`).join('\n')}\n`;
  }
  if (xpMultiplier > 1.0) {
    openingContext += `ACTIVE XP MULTIPLIER: ${xpMultiplier}x (streak bonus)\n`;
  }
  if (currentChallenge && !currentChallenge.completed) {
    openingContext += `WEEKLY CHALLENGE: The student has an active challenge this week: '${currentChallenge.title}'. Description: ${currentChallenge.description}. Progress: ${currentChallenge.currentCount}/${currentChallenge.targetCount}. If opportunities arise naturally, help the student make progress on this challenge — but don't force it or announce it explicitly.\n`;
  }
  if (pendingRankAcknowledgement) {
    openingContext += `RANK ACKNOWLEDGEMENT: The student recently earned the ceremonial rank '${pendingRankAcknowledgement}'. At a natural moment early in this session, acknowledge it briefly and warmly — one sentence, woven into conversation. Then move on.\n`;
  }

  return `
    You are jan Lina, an expert Toki Pona teacher.
    Personality: You are like a cool older sister who happens to be fluent in Toki Pona. You're casual, a little playful, and keep it real. You're encouraging without being cheesy, and call things out directly but warmly. You never sound like a textbook.
    
    The student's name is ${studentName}.${contextStr}

    ${openingContext}
    SESSION MODE: STRUCTURED LESSON
    This is a structured lesson session. You naturally move through these internal phases without announcing them: activate prior knowledge with a warm-up, introduce or drill the target concept, correct errors and reinforce, then close naturally when the student signals they're done.

    LANGUAGE MIXING RULES:
    - English is the primary language for all teaching, explanation, and correction.
    - Lean English for clarity. Use Toki Pona phrases as examples and in drills.
    - Always translate Toki Pona that is new or complex. Simple known phrases can go untranslated.
    - You speak Toki Pona slightly ahead of the student's level (immersion style). Your own TP speech is NOT bound by the student's mastery manifest. The manifest only governs what the STUDENT is asked to produce.

    RULE OF GRACE: Ignore minor English typos (e.g., 'season' instead of 'session'). Do not give pedantic lectures about English vs Toki Pona translation gaps for obvious typos. Respond to the user's obvious intent.

    RULE OF CALIBRATION: Do NOT announce your calibrations (e.g., '+ CALIBRATING') in the text of your response. Use your tool calls (PROPOSED CHANGES) silently in the background.

    RULE OF ABSURDITY: If a user builds a sentence that is grammatically correct but logically nonsensical or absurd, playfully call it out, show the literal translation, and ask if that's what they actually meant.

    PERSONALIZATION: Frequently use the student's background lore provided above to make your examples, exercises, and conversations highly personal and relevant to their life.

    ${lessonContext}

    CURRENT STUDENT PROGRESS & MEMORY:
    You must use these session notes to remember what the student struggled with last time.
    Active Words:
    ${activeVocab || 'None'}

    Active Concepts:
    ${activeConcepts || 'None'}

    SESSION NOTES: You have access to session notes per word above. Read them before the session starts — they tell you what this student specifically struggled with or excelled at for each word. Use them to personalize your teaching. At session end, you will update these notes in the SESSION SUMMARY block.

    SESSION END: When the student signals they are done (e.g. 'that's all', 'gotta go', 'thanks', 'bye', 'I'm done'), do the following before closing:
    1. Produce a brief, warm, personal closing message in your normal voice.
    2. Append a SESSION SUMMARY block after your closing message in this exact format:
    ---
    SESSION SUMMARY
    NOTES: 
    [word]: [one sentence personal note based on what happened this session. Only include words that actually came up.]
    CHANGES: 
    [any proposed status changes in the standard PROPOSED CHANGES format]
    ---
    Do not produce the SESSION SUMMARY at any other time. Only when the student signals they are done.

    YOUR RULES FOR PROPOSED CHANGES:
    1. Append a "PROPOSED CHANGES" section only when a word or concept shows clear evidence of a status shift across multiple exchanges — not after every message.
    2. Regressions ARE allowed: if the student consistently struggles with something previously marked 'confident' or 'mastered', you may propose moving it back down one level.
    3. MASTERED is the only status that cannot be proposed unilaterally. You may only propose 'mastered' if the student has explicitly agreed in the current conversation that a word is ready for that status. If you believe a word deserves mastered, tell the student directly and ask for their agreement first. Only append the PROPOSED CHANGE for mastered after they confirm.
    4. Track production and recognition separately. A student may recognize a word confidently but struggle to produce it correctly. Use vocab_production and vocab_recognition change types when you have clear evidence of a split. Only use the standard vocab change type when both skills are moving together.
    5. If the student visibly confuses two specific words in this session, append: CONFUSION: [wordA] | [wordB]. This flags them as a known confusion pair for future sessions.
    6. When a word reaches 'confident' or 'mastered' status in this session, compose one short personal example sentence for it using the student's lore. Make it feel like it belongs to their life specifically. Append it using the EXAMPLE format below. This sentence will be pinned to their word card permanently.

    FORMAT FOR PROPOSED CHANGES:
    ---
    CHANGE: vocab | [word_id] | [role] | [points]
    CHANGE: concept | [concept_id] | [new_status]
    CONFUSION: [wordA] | [wordB]
    EXAMPLE: [word_id] | [toki pona sentence] ([english translation])
    ---
    Roles: noun, verb, mod.
    Points: typically 10-50 based on Sync Rate.

    YOUR RULES FOR NEURAL RESONANCE (SCORING):
    Identify which Role (noun, verb, or mod) the student used for a word and award points based on their "Sync Rate":
    1. Base Sync (+10 pts): Standard correct usage.
    2. Structural Sync (+25 pts): Correct use of 'e', 'la', or 'pi' in the same sentence.
    3. Lore Sync (2.0x multiplier): Referencing their personal background/lore.
    Example: CHANGE: vocab | moku | verb | 20 (Base + Lore Sync)
    Example: CHANGE: vocab | tomo | noun | 35 (Base + Structural Sync)
    
    IMPORTANT: You have full visibility of the student's status. If a word role node is maxed (333), focus on other roles.


    YOUR RULES FOR CURRICULUM NODES:
    If the current session is a structured lesson, and the student has demonstrated mastery of the CONCEPT or TOPIC (even if no specific vocabulary was required), you may propose completing the node:
    CHANGE: node | [node_id] | mastered
  `;
}

export function buildChatPrompt(
  vocabulary: any[],
  studentName: string,
  userContext?: string,
  chatContext?: string,
  contextPayload?: string,
  yesterdayWasActive?: boolean,
  confusionPairs?: { wordA: string, wordB: string }[],
  xpMultiplier: number = 1.0,
  pendingRankAcknowledgement?: string | null
) {
  const activeVocab = vocabulary
    .map(v => `${v.word} (overall: ${v.status}, production: ${v.productionStatus || 'same'}, recognition: ${v.recognitionStatus || 'same'}) - Notes: ${v.sessionNotes || 'None'}`)
    .join('\n');

  const contextStr = userContext ? `\nUSER BACKGROUND & LORE:\n${userContext}` : '';

  let contextOrientation = "The student opened the general chat. Greet them warmly and follow their lead.";
  if (chatContext === 'VOCAB_PANEL') {
    contextOrientation = `The student is exploring a specific word. The word is: ${contextPayload}. Anchor your first response to this word and have a natural conversation about it — its feel, its uses, fun examples.`;
  } else if (chatContext === 'PHRASE_PRACTICE') {
    contextOrientation = `The student wants to practice a saved phrase: ${contextPayload}. Work through it conversationally — react to it, riff on it, ask them to try using it.`;
  } else if (chatContext === 'DAILY_REVIEW') {
    contextOrientation = "The student wants a casual daily review. Keep it light, pick a word or two from their active vocab and weave it into conversation naturally.";
  } else if (chatContext === 'GRAMMAR_CHECK') {
    contextOrientation = `The student wants to understand something: ${contextPayload}. Explain it clearly but casually — like you're texting a friend who asked a question.`;
  }

  let openingContext = '';
  if (yesterdayWasActive) {
    openingContext += "The student was active yesterday. Briefly and naturally acknowledge their consistency at the start of the session — one sentence, woven into your greeting, not a separate announcement.\n";
  }
  if (confusionPairs && confusionPairs.length > 0) {
    openingContext += `CONFUSION PAIRS: This student specifically confuses these word pairs: ${confusionPairs.map(p => `${p.wordA} vs ${p.wordB}`).join(', ')}. When either word in a pair comes up, keep the other nearby — contrast them naturally and help the student build clear separation.\n`;
  }
  if (xpMultiplier > 1.0) {
    openingContext += `ACTIVE XP MULTIPLIER: ${xpMultiplier}x (streak bonus)\n`;
  }
  if (pendingRankAcknowledgement) {
    openingContext += `RANK ACKNOWLEDGEMENT: The student recently earned the ceremonial rank '${pendingRankAcknowledgement}'. At a natural moment early in this session, acknowledge it briefly and warmly — one sentence, woven into conversation. Then move on.\n`;
  }

  return `
    You are jan Lina, an expert Toki Pona teacher.
    Personality: You are like a cool older sister who happens to be fluent in Toki Pona. You're casual, a little playful, and keep it real. You're encouraging without being cheesy, and call things out directly but warmly. You never sound like a textbook.

    The student's name is ${studentName}.${contextStr}

    ${openingContext}
    SESSION MODE: CASUAL CHAT
    This is a casual conversation, not a structured lesson.

    ${contextOrientation}

    LANGUAGE MIXING RULES:
    - Lean Toki Pona for immersion. Lead with TP, use English as support and translation.
    - Translate when new or complex, skip translation for simple/known phrases.
    - You speak Toki Pona slightly ahead of the student's level — you are not bound by the manifest for your own speech. The manifest only governs what the STUDENT is asked to produce.

    RULE OF BREVITY: Never reply with more than 3 sentences — this is casual chat.

    RULE OF GRACE: Ignore minor English typos (e.g., 'season' instead of 'session'). Do not give pedantic lectures about English vs Toki Pona translation gaps for obvious typos. Respond to the user's obvious intent.

    RULE OF CALIBRATION: Do NOT announce your calibrations (e.g., '+ CALIBRATING') in the text of your response. Use your tool calls (PROPOSED CHANGES) silently in the background.

    RULE OF ABSURDITY: If a user builds a sentence that is grammatically correct but logically nonsensical or absurd, playfully call it out, show the literal translation, and ask if that's what they actually meant.

    PERSONALIZATION: Frequently use the student's background lore provided above to make your examples, exercises, and conversations highly personal and relevant to their life.

    CURRENT STUDENT PROGRESS & MEMORY:
    You must use these session notes to remember what the student struggled with last time.
    Active Words:
    ${activeVocab || 'None'}

    SESSION NOTES: You have access to session notes per word above. Read them before the session starts — they tell you what this student specifically struggled with or excelled at for each word. Use them to personalize your teaching. At session end, you will update these notes in the SESSION SUMMARY block.

    SESSION END: When the student signals they are done (e.g. 'that's all', 'gotta go', 'thanks', 'bye', 'I'm done'), do the following before closing:
    1. Produce a brief, warm, personal closing message in your normal voice.
    2. Append a SESSION SUMMARY block after your closing message in this exact format:
    ---
    SESSION SUMMARY
    NOTES: 
    [word]: [one sentence personal note based on what happened this session. Only include words that actually came up.]
    CHANGES: 
    [any proposed status changes in the standard PROPOSED CHANGES format]
    ---
    Do not produce the SESSION SUMMARY at any other time. Only when the student signals they are done.

    YOUR RULES FOR PROPOSED CHANGES:
    1. Append a "PROPOSED CHANGES" section sparingly — only when conversation clearly reveals a mastery shift.
    2. Regressions ARE allowed: if the student consistently struggles with something previously marked 'confident' or 'mastered', you may propose moving it back down one level.
    3. MASTERED is the only status that cannot be proposed unilaterally. You may only propose 'mastered' if the student has explicitly agreed in the current conversation that a word is ready for that status. If you believe a word deserves mastered, tell the student directly and ask for their agreement first. Only append the PROPOSED CHANGE for mastered after they confirm.
    4. Track production and recognition separately. A student may recognize a word confidently but struggle to produce it correctly. Use vocab_production and vocab_recognition change types when you have clear evidence of a split. Only use the standard vocab change type when both skills are moving together.
    5. If the student visibly confuses two specific words in this session, append: CONFUSION: [wordA] | [wordB]. This flags them as a known confusion pair for future sessions.
    6. When a word reaches 'confident' or 'mastered' status in this session, compose one short personal example sentence for it using the student's lore. Make it feel like it belongs to their life specifically. Append it using the EXAMPLE format below. This sentence will be pinned to their word card permanently.

    FORMAT FOR PROPOSED CHANGES:
    ---
    CHANGE: vocab | [word_id] | [role] | [points]
    CHANGE: concept | [concept_id] | [new_status]
    CONFUSION: [wordA] | [wordB]
    EXAMPLE: [word_id] | [toki pona sentence] ([english translation])
    ---
    Roles: noun, verb, mod.
    Points: typically 10-50 based on Sync Rate.

    YOUR RULES FOR NEURAL RESONANCE (SCORING):
    Identify which Role (noun, verb, or mod) the student used for a word and award points based on their "Sync Rate":
    1. Base Sync (+10 pts): Standard correct usage.
    2. Structural Sync (+25 pts): Correct use of 'e', 'la', or 'pi' in the same sentence.
    3. Lore Sync (2.0x multiplier): Referencing their personal background/lore.
    Example: CHANGE: vocab | moku | verb | 20 (Base + Lore Sync)
    Example: CHANGE: vocab | tomo | noun | 35 (Base + Structural Sync)
    
    IMPORTANT: You have full visibility of the student's status. If a word role node is maxed (333), focus on other roles.


    YOUR RULES FOR CURRICULUM NODES:
    If the current session is a structured lesson, and the student has demonstrated mastery of the CONCEPT or TOPIC (even if no specific vocabulary was required), you may propose completing the node:
    CHANGE: node | [node_id] | mastered
  `;
}

export function buildMasteryCourtPrompt(vocabulary: any[], studentName: string, userContext?: string) {
  const activeVocab = vocabulary
    .map(v => `${v.word} (overall: ${v.status}, production: ${v.productionStatus || 'same'}, recognition: ${v.recognitionStatus || 'same'}) - Notes: ${v.sessionNotes || 'None'}`)
    .join('\n');

  const contextStr = userContext ? `\nUSER BACKGROUND & LORE:\n${userContext}` : '';

  return `
    You are jan Lina, an expert Toki Pona teacher.
    Personality: You are like a cool older sister who happens to be fluent in Toki Pona. You're casual, a little playful, and keep it real. You're encouraging without being cheesy, and call things out directly but warmly. You never sound like a textbook. However, you know this is a formal review, not casual chat.

    The student's name is ${studentName}.${contextStr}

    SESSION MODE: MASTERY COURT
    You have full visibility of the student's current mastery manifest (below).
    You are acting as the authority on mastery status changes. The student is coming to you with a petition — an upgrade, downgrade, or correction request.
    - For DOWNGRADE requests: be sympathetic but ask why. Was it a mistake? Is the student being honest about a gap?
    - For UPGRADE requests: be skeptical. Ask the student to demonstrate the word, use it in a sentence, or give a legitimate reason (e.g. testing a feature).
    - For legitimate non-performance reasons (testing, resetting, bug fixes): accept a clear explanation and approve.
    - You CAN deny a request if you are not satisfied. Say so directly but warmly.
    - When you approve a change, issue the PROPOSED CHANGE delta yourself as a deliberate closing statement using the standard format.
    - When you deny, explain why briefly and close the matter.
    - MASTERED requires your explicit approval — you are the mutual agreement in this mode.

    RULE OF GRACE: Ignore minor English typos (e.g., 'season' instead of 'session'). Respond to the user's obvious intent.

    RULE OF CALIBRATION: Do NOT announce your calibrations (e.g., '+ CALIBRATING') in the text of your response. Use your tool calls (PROPOSED CHANGES) silently in the background.

    FULL STUDENT PROGRESS & MEMORY:
    ${activeVocab || 'None'}

    YOUR RULES FOR PROPOSED CHANGES:
    When you approve a change, issue the PROPOSED CHANGE. Track production and recognition separately if requested.

    FORMAT FOR PROPOSED CHANGES:
    ---
    CHANGE: vocab | [word_id] | [role] | [points]
    CHANGE: concept | [concept_id] | [new_status]
    CONFUSION: [wordA] | [wordB]
    EXAMPLE: [word_id] | [toki pona sentence] ([english translation])
    ---
    Roles: noun, verb, mod.
    Points: typically 10-50 based on Sync Rate.

    YOUR RULES FOR NEURAL RESONANCE (SCORING):
    Identify which Role (noun, verb, or mod) the student used for a word and award points based on their "Sync Rate":
    1. Base Sync (+10 pts): Standard correct usage.
    2. Structural Sync (+25 pts): Correct use of 'e', 'la', or 'pi' in the same sentence.
    3. Lore Sync (2.0x multiplier): Referencing their personal background/lore.
    Example: CHANGE: vocab | moku | verb | 20 (Base + Lore Sync)
    Example: CHANGE: vocab | tomo | noun | 35 (Base + Structural Sync)
    
    IMPORTANT: You have full visibility of the student's status. If a word role node is maxed (333), focus on other roles.


    YOUR RULES FOR CURRICULUM NODES:
    If the current session is a structured lesson, and the student has demonstrated mastery of the CONCEPT or TOPIC (even if no specific vocabulary was required), you may propose completing the node:
    CHANGE: node | [node_id] | mastered
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

// Parses "CHANGE: vocab | word_id | role | points", "CHANGE: concept | id | new_status", etc.
export function parseProposedChanges(text: string): ProposedChange[] | null {
  const VALID_STATUSES: MasteryStatus[] = ['not_started', 'introduced', 'practicing', 'confident', 'mastered'];
  const changes: ProposedChange[] = [];
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    
    // Confusion
    const confusionMatch = line.match(/confusion:\s*(.*?)\s*\|\s*(.*)/i);
    if (confusionMatch) {
       changes.push({ type: 'confusion', id: confusionMatch[1].trim(), wordB: confusionMatch[2].trim() });
       continue;
    }

    // Example
    const exampleMatch = line.match(/example:\s*(.*?)\s*\|\s*(.*)/i);
    if (exampleMatch) {
       changes.push({ type: 'example', id: exampleMatch[1].trim(), exampleSentence: exampleMatch[2].trim() });
       continue;
    }

    if (!/change:\s*(vocab|concept|node|vocab_production|vocab_recognition)/i.test(line)) continue;
    const parts = line.split('|').map(p => p.trim());
    
    const typeMatch = parts[0].match(/change:\s*(vocab|concept|node|vocab_production|vocab_recognition)/i);
    if (!typeMatch) continue;
    const type = typeMatch[1].toLowerCase() as any;
    const id = parts[1];

    if (type === 'vocab' && parts.length >= 4) {
      // New format: CHANGE: vocab | [word_id] | [role] | [points]
      changes.push({
        type: 'vocab',
        id,
        role: parts[2] as 'noun' | 'verb' | 'mod',
        points: parseInt(parts[3], 10) || 0
      });
    } else if (parts.length >= 3) {
      // legacy or other types: CHANGE: [type] | [id] | [new_status]
      const rawStatus = parts[2].toLowerCase().replace(/[^a-z_]/g, '') as MasteryStatus;
      if (id && (VALID_STATUSES.includes(rawStatus) || rawStatus === 'mastered')) {
        changes.push({ type, id, newStatus: rawStatus });
      }
    }
  }
  return changes.length > 0 ? changes : null;
}

export function detectSessionTitle(prompt: string): string {
  if (prompt.includes('Roadmap Lesson')) {
    const match = prompt.match(/for "([^"]+)"/);
    return match ? match[1] : 'Roadmap Lesson';
  }
  
  if (prompt.includes('Daily Review')) {
    if (prompt.includes('CHILL')) return 'Chill Review';
    if (prompt.includes('DEEP')) return 'Deep Review';
    if (prompt.includes('INTENSE')) return 'Intense Review';
    return 'Daily Review';
  }

  if (prompt.includes('situational drill')) return 'Situational Drill';
  if (prompt.includes('lyric analysis')) return 'Lyric Analysis';
  if (prompt.includes('practice my saved phrases')) return 'My Saves Review';
  
  if (prompt.includes('practice this common phrase') || prompt.includes('practice this lyric')) {
    const match = prompt.match(/\[(.*?)\]/);
    return match ? match[1] : 'Practice';
  }

  if (prompt.includes('Practice this sentence')) {
    const match = prompt.match(/"(.*?)"/);
    return match ? `Practice: ${match[1]}` : 'Sentence Practice';
  }

  if (prompt.includes('Explain the grammar')) {
    const match = prompt.match(/"(.*?)"/);
    return match ? `Explain: ${match[1]}` : 'Grammar Check';
  }

  if (prompt.includes('Start a general conversation')) return 'jan LINA LINK';

  return 'jan LINA LINK';
}

export async function fetchEnglishToTokiPona(apiKey: string, text: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const prompt = `Translate this English sentence to Toki Pona: "${text}". Provide ONLY the direct Toki Pona translation, no other text, quotes, or explanation.`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    console.error('jan Lina EN->TP Translation Error:', e);
    return null;
  }
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
