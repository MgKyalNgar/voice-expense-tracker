'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

  // Category အလိုက် ဒေတာ စုစည်းခြင်း
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
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Dashboard</h1>
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <p className="text-slate-500">စုစုပေါင်း အသုံးစရိတ်</p>
        <h2 className="text-4xl font-black text-blue-600">{total.toLocaleString()} Ks</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[350px]">
          <h3 className="font-bold mb-4">အမျိုးအစားအလိုက် ခွဲခြားချက်</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* List View */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 overflow-y-auto max-h-[350px]">
          <h3 className="font-bold mb-4">နောက်ဆုံးသုံးထားသည်များ</h3>
          {data.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-slate-700">{item.item}</p>
                <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p>
              </div>
              <p className="font-bold text-blue-600">{Number(item.amount).toLocaleString()} Ks</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}