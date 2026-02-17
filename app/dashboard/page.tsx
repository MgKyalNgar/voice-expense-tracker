'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (expenses) {
      setData(expenses);
      const sum = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
      setTotal(sum);
    }
  };

  const chartData = data.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += Number(curr.amount);
    } else {
      acc.push({ name: curr.category, value: Number(curr.amount) });
    }
    return acc;
  }, []);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 bg-white rounded-full shadow-sm text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      </div>
      
      {/* Total Amount Card */}
      <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200 mb-8">
        <p className="text-slate-800 font-bold mb-1">စုစုပေါင်း အသုံးစရိတ်</p>
        <h2 className="text-4xl font-black text-blue-600">{total.toLocaleString()} Ks</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart Card */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200 min-h-[400px]">
          <h3 className="font-bold text-slate-900 mb-6 border-b pb-2">အမျိုးအစားအလိုက် ခွဲခြားချက်</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={chartData} 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* List View Card */}
        <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-6 border-b pb-2">နောက်ဆုံးသုံးထားသည်များ</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {data.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900 text-lg">{item.item}</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {new Date(item.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-blue-700">{Number(item.amount).toLocaleString()} Ks</p>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
            {data.length === 0 && (
              <p className="text-center text-slate-400 py-10 italic">စာရင်းများ မရှိသေးပါ</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}