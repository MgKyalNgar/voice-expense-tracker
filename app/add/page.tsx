'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getDeviceId } from '@/lib/device';

// အမျိုးအစားအသစ်များ
const CATEGORIES = ['Food & Drink', 'Transport', 'Shopping', 'Clothes', 'Bills', 'Other'];


export default function ManualAdd() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [otherDetail, setOtherDetail] = useState(''); // Other အတွက် state
  const [formData, setFormData] = useState({
    item: '',
    amount: '',
    category: 'Food & Drink'
  });
  


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item || !formData.amount) return alert("အချက်အလက်များ ပြည့်စုံအောင် ဖြည့်ပါ");

    setLoading(true);
    
    // Other ဖြစ်ရင် category နာမည်ကို format ပြောင်းမယ်
    const finalCategory = formData.category === 'Other' && otherDetail 
      ? `Other (${otherDetail})` 
      : formData.category;
      

    try {
      const { error } = await supabase.from('expenses').insert([
        {
          item: formData.item,
          amount: Number(formData.amount),
          category: finalCategory,
          user_id: getDeviceId()
        }
      ]);

      if (error) throw error;
      alert("စာရင်းသွင်းပြီးပါပြီ!");
      router.push('/'); 
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-md flex items-center mb-8">
        <Link href="/" className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:bg-slate-100 transition">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold ml-4 text-slate-800">စာရင်းအသစ် ထည့်မည်</h1>
      </div>

      {/* Form Card */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Item Name */}
          <div>
            <label className="block text-slate-500 font-bold mb-2 text-sm">အသုံးစရိတ် အမည်</label>
            <input
              type="text"
              placeholder="ဥပမာ - မုန့်ဟင်းခါး"
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-slate-500 font-bold mb-2 text-sm">ပမာဏ (ကျပ်)</label>
            <input
              type="number"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-bold text-lg"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-slate-500 font-bold mb-2 text-sm">အမျိုးအစား</label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`p-3 rounded-xl text-sm font-bold border transition-all ${
                    formData.category === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Other ကိုနှိပ်မှ ပေါ်လာမယ့် Box */}
            {formData.category === 'Other' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  placeholder="ဘာအတွက်လဲ ရေးပေးပါ (ဥပမာ - ပရိဘောဂ)"
                  value={otherDetail}
                  onChange={(e) => setOtherDetail(e.target.value)}
                  className="w-full p-3 bg-blue-50 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm italic"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            စာရင်းသိမ်းမည်
          </button>
        </form>
      </div>
    </div>
  );
}