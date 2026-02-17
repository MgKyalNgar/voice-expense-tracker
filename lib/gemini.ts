import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface ExpenseInfo {
  item: string;
  amount: number;
  category: string;
}

export async function parseExpense(raw: string): Promise<ExpenseInfo> {
  const model: GenerativeModel = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Extract the following details from the input string: item, amount, and category. Respond ONLY with a JSON object with keys item, amount, and category.\nInput: ${raw}`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    const json = JSON.parse(text);
    return json as ExpenseInfo;
  } catch (e) {
    throw new Error("Failed to parse expense information from model response: " + text);
  }
}