'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
    const [text, setText] = useState('');
      const [isSupported, setIsSupported] = useState(true);

        // Browser Speech Recognition Setup
          useEffect(() => {
              if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                    setIsSupported(false);
                        }
                          }, []);

                            const startListening = () => {
                                // @ts-ignore
                                    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                                        const recognition = new SpeechRecognition();
                                            
                                                recognition.lang = 'my-MM'; // မြန်မာလို နားထောင်မယ်
                                                    recognition.continuous = false;
                                                        recognition.interimResults = false;

                                                            recognition.onstart = () => setIsListening(true);
                                                                
                                                                    recognition.onresult = (event: any) => {
                                                                          const transcript = event.results[0][0].transcript;
                                                                                setText(transcript); // စကားလုံးကို စာပြောင်းပြီး သိမ်းမယ်
                                                                                      // ဒီနားမှာ နောက်ပိုင်း AI ဆီ ပို့တဲ့ function ထည့်မယ်
                                                                                          };

                                                                                              recognition.onend = () => setIsListening(false);

                                                                                                  recognition.start();
                                                                                                    };

                                                                                                      if (!isSupported) return <div>သင့် Browser မှာ Voice မရပါ (Chrome သုံးပါ)</div>;

                                                                                                        return (
                                                                                                            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                                                                                                                  <h1 className="text-2xl font-bold mb-8 text-gray-800">Voice Expense Tracker</h1>
                                                                                                                        
                                                                                                                              <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
                                                                                                                                      <p className="mb-4 text-gray-600 text-lg min-h-[50px]">
                                                                                                                                                {text || "ပြောချင်တာကို မိုက်ခလုတ်နှိပ်ပြီး ပြောပါ..."}
                                                                                                                                                        </p>

                                                                                                                                                                <button
                                                                                                                                                                          onClick={startListening}
                                                                                                                                                                                    disabled={isListening}
                                                                                                                                                                                              className={`p-6 rounded-full transition-all ${
                                                                                                                                                                                                          isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
                                                                                                                                                                                                                    }`}
                                                                                                                                                                                                                            >
                                                                                                                                                                                                                                      {isListening ? <MicOff className="text-white w-8 h-8" /> : <Mic className="text-white w-8 h-8" />}
                                                                                                                                                                                                                                              </button>
                                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                                              <p className="mt-4 text-sm text-gray-500">
                                                                                                                                                                                                                                                                        {isListening ? "နားထောင်နေသည်..." : "နှိပ်ပြီး ပြောပါ"}
                                                                                                                                                                                                                                                                                </p>
                                                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                            );
                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                            