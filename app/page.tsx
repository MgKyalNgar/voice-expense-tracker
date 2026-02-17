'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, Save, LayoutDashboard, Keyboard } from 'lucide-react';
import { parseExpense, ExpenseInfo } from '@/lib/gemini';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { getDeviceId } from '@/lib/device';


export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<ExpenseInfo | null>(null);
  const [error, setError] = useState('');

  const startListening = () => {
    setError('');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("သင့် Browser က Voice စနစ်ကို Support မလုပ်ပါ (Chrome သုံးပေးပါ)");

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
      setError("AI အမှားရှိနေသည်: " + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const saveExpense = async () => {
    if (!result) return;
    try {
      const { error } = await supabase.from('expenses').insert([
        { item: result.item, amount: result.amount, category: result.category, user_id: getDeviceId() }
      ]);
      if (error) throw error;
      alert("စာရင်းသွင်းပြီးပါပြီ!");
      setResult(null);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // app/page.tsx ၏ return အပိုင်း
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">

      {/* Top Navigation - အရောင်နှင့် Icon ညှိထားသည် */}
      <div className="absolute top-8 w-full max-w-md px-4 flex justify-between items-start">

        {/* Manual Add Side */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-purple-600 font-bold text-[12px]">စာဖြင့်ရိုက်ရန်</span>
          <Link href="/add" className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100 text-slate-700 font-bold hover:bg-purple-50 hover:border-purple-200 transition-all">
            <Keyboard size={18} className="text-purple-600" />
            Manual Add
          </Link>
        </div>

        {/* Dashboard Side */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-purple-600 font-bold text-[12px]">စာရင်းကြည့်ရန်</span>
          <Link href="/dashboard" className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100 text-slate-700 font-bold hover:bg-purple-50 hover:border-purple-200 transition-all">
            Dashboard
            <LayoutDashboard size={18} className="text-purple-600" />
          </Link>
        </div>

      </div>

      {/* Title - Size ကို သေးလိုက်သည် */}
      <div className="mt-20 flex flex-col items-center">
        <h1 className="text-2xl font-black mb-10 text-blue-600 tracking-tight text-center">
          Smart Expense AI
        </h1>

        {/* Mic Button Card */}
        <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-blue-100 w-full max-w-[320px] border border-slate-50 text-center">
          <button
            onClick={startListening}
            disabled={isListening || isParsing}
            className={`p-10 rounded-full transition-all transform active:scale-95 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600'
              } shadow-xl mb-6`}
          >
            {isParsing ? <Loader2 className="text-white w-10 h-10 animate-spin" /> :
              <Mic className="text-white w-10 h-10" />}
          </button>
          <p className="text-slate-500 font-medium italic">
            {isParsing ? "AI က စဉ်းစားနေသည်..." : isListening ? "နားထောင်နေသည်..." : "နှိပ်ပြီး အသုံးစရိတ်ပြောပါ"}
          </p>
        </div>
      </div>

      {/* Footer - အသစ်ပြင်ဆင်ထားသည် */}
      <div className="mt-16 text-center">
        <p className="text-slate-400 text-[11px] font-medium leading-relaxed">
          Developed by ❤️ by <span className="text-slate-600 font-bold">Mg Kyal Ngar</span><br />
          Voice Expense Tracker AI v 2.0
        </p>


        {/* Result Overlay (If any) */}
        {result && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100">
            <div className="mt-4 p-5 bg-blue-50 rounded-2xl text-left border border-blue-100 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">AI Result</h2>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-700 font-bold text-lg">{result.item}</span>
                <span className="text-blue-600 font-black text-xl">{result.amount.toLocaleString()} Ks</span>
              </div>
              <span className="inline-block bg-blue-200 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">
                # {result.category}
              </span>
              <button
                onClick={saveExpense}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-100"
              >
                <Save size={18} /> စာရင်းသွင်းမည်
              </button>
            </div>
          </div>
        </div>
        )}

        {error && <p className="mt-4 text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
      </div>

      <p className="mt-8 text-slate-400 text-sm">Created with AI Collaboration</p>
    </div>

  );
}