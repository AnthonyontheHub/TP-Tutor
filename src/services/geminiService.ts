import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveApiKey } from './linaService';
import type { UserProfile } from '../types/mastery';

const GEMINI_MODEL = "gemini-2.5-flash";

export async function generateChallenge(mode: 'selection' | 'input', userProfile?: UserProfile, curriculumContext?: string) {
  const apiKey = resolveApiKey();
  if (!apiKey) throw new Error("API Key missing");

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
  if (!apiKey) return { score: 0, feedback: "API Key missing" };

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
  if (!apiKey) throw new Error("API Key missing");

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
