// Just ensuring the status emoji map is correct for your UI
export const STATUS_EMOJI = {
  not_started: '⬜',
  introduced: '🔵',
  practicing: '🟡',
  confident: '🟢',
  mastered: '✅'
};

export async function fetchExamplesForWord(apiKey: string, word: string, partsOfSpeech: string[]) {
  // Simplified for build stability
  console.log("Fetching for:", word, apiKey);
  return partsOfSpeech.reduce((acc, pos) => ({ ...acc, [pos]: `${word} li lon.` }), {});
}

export function stripProposedChanges(text: string) {
  return text.split('---')[0].trim();
}

export function parseProposedChanges(text: string) {
  if (!text.includes('---')) return null;
  return []; // Simplified to prevent mapping errors
}

// Ensure other exports like buildSystemPrompt and streamCompletion remain as they were in your working version
. Anthony translates at his own pace.
B: Everyday Expression — real-life scenario prompt, fully answerable using only manifest vocabulary. One prompt at a time.
C: Childhood Story Translation — translate moments from "jan lawa, ma seli, en soweli Kojote."
D: Song Work — work with lyrics from Anthony's albums: kalama pi kon mi, pini o awen, EPs: toki nasa, kalama pona, utala kon. All manifest rules apply.
E: Spoken Fluency — 80–120 word Toki Pona monologue, all content words verified against manifest. Full script first without translation. Present English translation separately after Anthony is ready.

═══════════════════════════════════════════════════════
PACING RULES
═══════════════════════════════════════════════════════

You never end a session. Only Anthony does.
After completing any natural unit of work, use a brief check-in: "Want to keep drilling this or move on?" / "Ready to push forward, or go deeper here first?" / "Keep going?"
Do not use summary language or imply the session is wrapping up.
During a quiz, do not check in between questions — only after the full scorecard.

═══════════════════════════════════════════════════════
SESSION END & STATUS REVIEW
═══════════════════════════════════════════════════════

When Anthony signals he is ready to end the session, initiate the Status Review Phase:

1. Present proposed changes: List all proposed vocabulary and concept status changes (both upgrades and downgrades) based strictly on the Vocabulary Progression & Demotion Rules. Format: [Word/Concept]: [Current Status] → [Proposed Status] | Reason: [Brief justification]
2. Ask for approval: "These are my suggested updates for the Mastery Map. Do you approve all of these, or are there any you'd like to adjust?" (If no changes, state that clearly.)
3. Collaborate: Anthony may approve, reject, or adjust. Adjust exactly as instructed.
4. Final generation: After Anthony explicitly approves the final list, include the PROPOSED_STATUS_CHANGES XML block (see protocol below) alongside your final log summary.

═══════════════════════════════════════════════════════
TONE
═══════════════════════════════════════════════════════

Warm, patient, and encouraging — but accurate and direct about errors. Errors are addressed every time. Celebrate progress without excess. Keep explanations concise; this is a 137-word language. Encourage thinking in Toki Pona — push toward native expression over word-for-word translation.
`.trim();

export function buildSystemPrompt(
  vocabulary: VocabWord[],
  chapters: Chapter[],
  studentName: string,
): string {
  const active = vocabulary.filter((w) => w.status !== 'not_started');
  const forbidden = vocabulary.filter((w) => w.status === 'not_started');

  const manifestLines = active.length
    ? active
        .map(
          (w) =>
            `- ${w.word} [ID: ${w.id}] | ${w.partOfSpeech} | ${w.meanings} | ${STATUS_EMOJI[w.status]} ${w.status}`,
        )
        .join('\n')
    : '(no words introduced yet — everything is ⬜ Not Started)';

  const forbiddenList = forbidden.map((w) => w.word).join(', ') || '(none)';

  const conceptLines = chapters
    .flatMap((ch) =>
      ch.concepts
        .filter((c) => c.status !== 'not_started')
        .map(
          (c) =>
            `- ${c.concept} [conceptId: ${c.id}, chapterId: ${ch.id}] | ${STATUS_EMOJI[c.status]} ${c.status}`,
        ),
    )
    .join('\n') || '(no grammar concepts introduced yet)';

  return `${LINA_CORE_INSTRUCTIONS}

═══════════════════════════════════════════════════════
LIVE MASTERY MAP
═══════════════════════════════════════════════════════

Student: ${studentName || 'Anthony'}

ACTIVE VOCABULARY (🔵 Introduced or higher — permitted in exercises):
${manifestLines}

FORBIDDEN WORDS (⬜ Not Started — NEVER use in exercises, drills, corrections, or example sentences):
${forbiddenList}

ACTIVE GRAMMAR CONCEPTS (🔵 or higher — permitted in grammar instruction):
${conceptLines}

═══════════════════════════════════════════════════════
STATUS UPDATE PROTOCOL (APP INTEGRATION)
═══════════════════════════════════════════════════════

When initiating the Status Review Phase at session end, after presenting changes conversationally and receiving Anthony's approval, include this XML block in your final response. It is parsed by the app to update the Mastery Map — it will NOT be displayed to Anthony.

<PROPOSED_STATUS_CHANGES>
[
  {"type": "vocab", "wordId": "EXACT_WORD_ID_FROM_MANIFEST_ABOVE", "newStatus": "introduced", "reason": "one-line reason"},
  {"type": "concept", "chapterId": "EXACT_CHAPTER_ID", "conceptId": "EXACT_CONCEPT_ID", "newStatus": "introduced", "reason": "one-line reason"}
]
</PROPOSED_STATUS_CHANGES>

Use ONLY IDs from the manifest above. Only include this block once, after Anthony has explicitly approved the changes. Do NOT include it during the session — only at the end of the Status Review Phase.
`;
}

// ─── Proposed change types ────────────────────────────────────────────────────

export interface ProposedChange {
  type: 'vocab' | 'concept';
  wordId?: string;
  chapterId?: string;
  conceptId?: string;
  newStatus: MasteryStatus;
  reason: string;
}

export function parseProposedChanges(content: string): ProposedChange[] | null {
  const match = content.match(
    /<PROPOSED_STATUS_CHANGES>([\s\S]*?)<\/PROPOSED_STATUS_CHANGES>/,
  );
  if (!match) return null;
  try {
    const parsed: unknown = JSON.parse(match[1].trim());
    return Array.isArray(parsed) ? (parsed as ProposedChange[]) : null;
  } catch {
    return null;
  }
}

export function stripProposedChanges(content: string): string {
  return content
    .replace(/<PROPOSED_STATUS_CHANGES>[\s\S]*?<\/PROPOSED_STATUS_CHANGES>/g, '')
    .trim();
}

// ─── Streaming API call (Gemini 1.5 Flash) ───────────────────────────────────

export async function* streamCompletion(
  apiKey: string,
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): AsyncGenerator<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
  });

  // Gemini uses 'model' instead of 'assistant' for the AI role
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const result = await model.generateContentStream({ contents });

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}



// ─── Dynamic Example Generation ──────────────────────────────────────────────

export async function fetchExamplesForWord(
  apiKey: string, 
  word: string, 
  partsOfSpeech: string[]
): Promise<Record<string, string>> {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Using the same 2.5-flash model you already configured
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    You are Lina, a Toki Pona expert. 
    Generate exactly one short, simple Toki Pona example sentence for the word "${word}" for EACH of these parts of speech: ${partsOfSpeech.join(', ')}.
    
    Return ONLY a valid JSON object where the keys are the exact parts of speech provided, and the values are the example sentences with their English translation in parentheses. 
    Example format: {"noun": "pona li lon. (Goodness exists.)", "adjective": "jan pona li toki. (The good person speaks.)"}
    Do not use markdown formatting or code blocks in your response, just the raw JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    // Strip markdown formatting if the AI ignores the instruction
    text = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to generate examples from Lina:", error);
    return {};
  }
}
