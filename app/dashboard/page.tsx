'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setAllExpenses(data);
    setLoading(false);
  };

  // လပြောင်းမည့် Function
  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  // ရွေးထားသောလအလိုက် Data များကို စစ်ထုတ်ခြင်း
  const filteredData = useMemo(() => {
    return allExpenses.filter(item => {
      const itemDate = new Date(item.created_at);
      return (
        itemDate.getMonth() === selectedDate.getMonth() &&
        itemDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [allExpenses, selectedDate]);

  // စုစုပေါင်း ငွေပမာဏ
  const totalAmount = filteredData.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Pie Chart အတွက် Data ပြင်ဆင်ခြင်း
  const categoryData = useMemo(() => {
    const grouped = filteredData.reduce((acc: any[], curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += Number(curr.amount);
      } else {
        acc.push({ name: curr.category, value: Number(curr.amount) });
      }
      return acc;
    }, []);
    return grouped.sort((a, b) => b.value - a.value); // များရာမှ နည်းရာစီသည်
  }, [filteredData]);

  // Bar Chart (Daily) အတွက် Data ပြင်ဆင်ခြင်း
  const dailyData = useMemo(() => {
    // လတစ်လရဲ့ ရက်တွေကို 1-30/31 ထိ ဖြန့်ခင်းခြင်း
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      amount: 0
    }));

    filteredData.forEach(item => {
      const day = new Date(item.created_at).getDate();
      daysArray[day - 1].amount += Number(item.amount);
    });

    return daysArray;
  }, [filteredData, selectedDate]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' Ks';
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-50 z-10 py-2">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:bg-slate-100">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Overview</h1>
        </div>
      </div>

      {/* Month Selector Card */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-6 flex items-center justify-between">
        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-full">
          <ChevronLeft className="text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="text-blue-600" size={20} />
          <span className="font-bold text-lg text-slate-800">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-full">
          <ChevronRight className="text-slate-600" />
        </button>
      </div>
      
      {/* Total Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-3xl shadow-lg shadow-blue-200 mb-8 text-white">
        <p className="text-blue-100 font-medium mb-1">စုစုပေါင်း အသုံးစရိတ်</p>
        <h2 className="text-4xl font-black">{formatCurrency(totalAmount)}</h2>
        <p className="text-xs text-blue-200 mt-2 bg-blue-700/30 inline-block px-2 py-1 rounded-lg">
           {filteredData.length} transactions
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Trend (Bar Chart) */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">နေ့စဉ် သုံးစွဲမှု (Bar Chart)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{fontSize: 10}} interval={2} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (Pie Chart + List) */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">အမျိုးအစားအလိုက် ခွဲခြားချက်</h3>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Chart */}
            <div className="h-[200px] w-[200px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={categoryData} 
                    innerRadius={50} 
                    outerRadius={80} 
                    paddingAngle={5} 
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed List */}
            <div className="w-full space-y-3">
              {categoryData.map((cat, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-slate-700 font-medium text-sm">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm">{formatCurrency(cat.value)}</p>
                    <p className="text-[10px] text-slate-400">
                      {((cat.value / totalAmount) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 lg:col-span-2">
           <h3 className="font-bold text-slate-800 mb-4">အသေးစိတ် စာရင်းများ</h3>
           <div className="space-y-3">
             {filteredData.map((item) => (
               <div key={item.id} className="flex justify-between items-center p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                 <div className="flex items-center gap-3">
                   <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs">
                     {new Date(item.created_at).getDate()}
                   </div>
                   <div>
                     <p className="font-bold text-slate-800">{item.item}</p>
                     <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleTimeString()}</p>
                   </div>
                 </div>
                 <span className="font-bold text-slate-700">{formatCurrency(item.amount)}</span>
               </div>
             ))}
             {filteredData.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                    ဒီလအတွက် စာရင်းမရှိပါ
                </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}