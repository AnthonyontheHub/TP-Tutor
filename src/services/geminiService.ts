import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveApiKey } from './linaService';

const GEMINI_MODEL = "gemini-2.5-flash";

export async function generateChallenge(mode: 'selection' | 'input', userProfile?: any, curriculumContext?: string) {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    return {
      complexThought: "The light from the window is beautiful and makes me feel peaceful.",
      options: ["suno li pona", "suno li suli", "suno li ike"],
      correctEssence: "suno li pona"
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  });

  let prompt = mode === 'selection' 
    ? `Generate a complex English thought and 3 Toki Pona simplifications (essences). One must be the "correct" essence, and 2 should be slightly "ike" (wrong/complex). Return JSON: {"complexThought": "...", "options": ["...", "...", "..."], "correctEssence": "..."}`
    : `Generate a complex English thought and its ideal Toki Pona essence. Return JSON: {"complexThought": "...", "correctEssence": "..."}`;

  if (userProfile || curriculumContext) {
    prompt += `\n\nContext for personalization:
    User Profile: ${JSON.stringify(userProfile || {})}
    Curriculum Progress: ${curriculumContext || 'Entire unlocked curriculum'}`;
  }

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (e) {
    console.error("Gemini Challenge Error:", e);
    // Fallback
    return {
      complexThought: "The light from the window is beautiful and makes me feel peaceful.",
      options: ["suno li pona", "suno li suli", "suno li ike"],
      correctEssence: "suno li pona"
    };
  }
}

export async function evaluateInput(complexThought: string, correctEssence: string, userInput: string) {
  const apiKey = resolveApiKey();
  if (!apiKey) return { score: 50, feedback: "I couldn't quite analyze that, but keep trying!" };

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Task: Evaluate a student's Toki Pona simplification.
Original Thought: "${complexThought}"
Ideal Essence: "${correctEssence}"
Student Input: "${userInput}"

Evaluate based on:
1. Accuracy: Does it capture the core meaning?
2. Simplicity: Did they use simple words correctly?
3. Grammar: Is the Toki Pona valid?

Return JSON: {"score": number (0-100), "feedback": "Brief encouragement/correction in jan Lina's persona"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (e) {
    console.error("Gemini Evaluation Error:", e);
    return { score: 50, feedback: "I couldn't quite analyze that, but keep trying!" };
  }
}

export async function generateSortItems(userProfile: string | object, curriculumContext?: string) {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    return [
      { label: "A complicated tax form", category: "ike" },
      { label: "A hand-drawn map", category: "pona" },
      { label: "Fresh water from a stream", category: "pona" },
      { label: "A 500-page contract", category: "ike" },
      { label: "A shared meal with a friend", category: "pona" }
    ];
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Generate 5 "Life Concepts" that can be categorized as 'pona' (simple, good, essential) or 'ike' (complex, bad, unnecessary). 
  Make them relevant to this user profile context: ${JSON.stringify(userProfile)}.
  Curriculum Context: ${curriculumContext || 'General philosophy and basic vocab'}
  Return JSON array of objects: [{"label": "...", "category": "pona" | "ike"}]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (e) {
    console.error("Gemini Sort Items Error:", e);
    return [
      { label: "A complicated tax form", category: "ike" },
      { label: "A hand-drawn map", category: "pona" },
      { label: "Fresh water from a stream", category: "pona" },
      { label: "A 500-page contract", category: "ike" },
      { label: "A shared meal with a friend", category: "pona" }
    ];
  }
}

export async function generateLogicStatements(userProfile: any, curriculumContext?: string) {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    return [
      { statement: "Choosing a few high-quality tools is 'pona' compared to many cheap ones.", isPona: true, explanation: "Simplicity is about focus and depth, not clutter." },
      { statement: "A complex solution is always better if it is more precise.", isPona: false, explanation: "In Toki Pona, clarity comes from simplicity, not complexity." },
      { statement: "The best way to live is to have only what you truly use and love.", isPona: true, explanation: "This is the essence of nasin pona." },
      { statement: "More words make a thought more accurate.", isPona: false, explanation: "Fewer words force you to find the core truth." },
      { statement: "Simplicity is a path, not a destination.", isPona: true, explanation: "It is a way of walking through the world." },
      { statement: "Ambiguity is an error that should always be removed.", isPona: false, explanation: "Toki Pona embraces intentional ambiguity as a tool for connection." },
      { statement: "A small vocabulary frees the mind from over-analysis.", isPona: true, explanation: "When you have fewer words, you focus on the direct experience." }
    ];
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Generate 5 "Philosophy Statements" about simplicity and Toki Pona values.
  Each statement should be something a student can evaluate as 'pona' (true/aligned with simplicity) or 'ike' (false/aligned with complexity).
  Make them relevant to this user profile context: ${JSON.stringify(userProfile)}.
  Curriculum Context: ${curriculumContext || 'General philosophy and basic vocab'}
  Return JSON array of objects: [{"statement": "...", "isPona": boolean, "explanation": "Brief explanation why"}]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (e) {
    console.error("Gemini Logic Statements Error:", e);
    return [
      { statement: "Choosing a few high-quality tools is 'pona' compared to many cheap ones.", isPona: true, explanation: "Simplicity is about focus and depth, not clutter." },
      { statement: "A complex solution is always better if it is more precise.", isPona: false, explanation: "In Toki Pona, clarity comes from simplicity, not complexity." },
      { statement: "The best way to live is to have only what you truly use and love.", isPona: true, explanation: "This is the essence of nasin pona." },
      { statement: "More words make a thought more accurate.", isPona: false, explanation: "Fewer words force you to find the core truth." },
      { statement: "Simplicity is a path, not a destination.", isPona: true, explanation: "It is a way of walking through the world." },
      { statement: "Ambiguity is an error that should always be removed.", isPona: false, explanation: "Toki Pona embraces intentional ambiguity as a tool for connection." },
      { statement: "A small vocabulary frees the mind from over-analysis.", isPona: true, explanation: "When you have fewer words, you focus on the direct experience." }
    ];
  }
}

