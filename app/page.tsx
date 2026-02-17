'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, Save } from 'lucide-react';
import { parseExpense, ExpenseInfo } from '@/lib/gemini';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<ExpenseInfo | null>(null);
  const [error, setError] = useState('');

  const startListening = () => {
    setError('');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser supports မလုပ်ပါ");

    const recognition = new SpeechRecognition();
    recognition.lang = 'my-MM';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleAIDetection(transcript);
    };

    recognition.start();
  };

  const handleAIDetection = async (rawText: string) => {
    setIsParsing(true);
    try {
      const data = await parseExpense(rawText);
      setResult(data);
    } catch (err: any) {
      setError("AI အလုပ်လုပ်ရာတွင် အမှားရှိနေသည်: " + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-blue-600">Smart Expense AI</h1>

      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 text-center">
        {/* မိုက်ခရိုဖုန်း ခလုတ် */}
        <button
          onClick={startListening}
          disabled={isListening || isParsing}
          className={`p-8 rounded-full transition-all transform active:scale-95 ${
            isListening ? 'bg-red-500 animate-pulse shadow-red-200' : 'bg-blue-600 shadow-blue-200'
          } shadow-2xl mb-6`}
        >
          {isParsing ? <Loader2 className="text-white w-10 h-10 animate-spin" /> : 
           isListening ? <MicOff className="text-white w-10 h-10" /> : 
           <Mic className="text-white w-10 h-10" />}
        </button>

        <p className="text-slate-500 font-medium mb-6">
          {isParsing ? "AI က စဉ်းစားနေသည်..." : isListening ? "နားထောင်နေသည်..." : "နှိပ်ပြီး အသုံးစရိတ်ပြောပါ"}
        </p>

        {/* AI Result ပြသသည့်နေရာ */}
        {result && (
          <div className="mt-4 p-4 bg-blue-50 rounded-2xl text-left border border-blue-100 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-2">AI ခွဲခြားချက်</h2>
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-700 font-bold text-lg">{result.item}</span>
              <span className="text-blue-600 font-black text-xl">{result.amount.toLocaleString()} Ks</span>
            </div>
            <span className="inline-block bg-blue-200 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
              # {result.category}
            </span>
            <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
              <Save size={18} /> စာရင်းသွင်းမည်
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
}
