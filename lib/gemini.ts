import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

// Next.js Frontend က သိအောင် NEXT_PUBLIC_ ထည့်ပေးရပါမယ်
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set yet.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

export interface ExpenseInfo {
  item: string;
  amount: number;
  category: string;
}

export async function parseExpense(raw: string): Promise<ExpenseInfo> {
  // Flash model က ပိုမြန်ပြီး မြန်မာစာ ပိုကျွမ်းကျင်ပါတယ်
  const model: GenerativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `
    You are a smart expense parser for Myanmar people.
    The input text might be in Burmese or Romanized Burmese (e.g., 'mohinga' or 'မုန့်ဟင်းခါး').
    Correct any spelling mistakes in the item name.
    
    Input: "${raw}"
    
    Return ONLY a valid JSON object with:
    { "item": "corrected item name in Burmese", "amount": number, "category": "Food|Transport|Bills|Shopping|Other" }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text().replace(/```json|```/g, "").trim(); // JSON သန့်သန့်လေး ရအောင် ရှင်းထုတ်တာပါ

  try {
    return JSON.parse(text) as ExpenseInfo;
  } catch (e) {
    throw new Error("AI က အချက်အလက် ထုတ်ယူပေးနိုင်ခြင်း မရှိပါ: " + text);
  }
}