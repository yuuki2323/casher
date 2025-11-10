"use client";

import { useState } from "react";
import Link from "next/link";
import { addRecord } from "../../lib/supabaseCRUD";

export default function InputPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [person, setPerson] = useState("SHIHO");
  const [money, setMoney] = useState({
    1: 0, 5: 0, 10: 0, 50: 0, 100: 0, 500: 0, 1000: 0, 5000: 0, 10000: 0
  });

  const total = Object.entries(money).reduce((sum, [k,v])=>sum + Number(k)*Number(v),0);

  const handleChange = (key,value) => setMoney({...money, [key]: Number(value)});

  const saveData = async () => {
    try {
      await addRecord({ date, person, money, total });
      alert("保存しました！");
      setMoney({1:0,5:0,10:0,50:0,100:0,500:0,1000:0,5000:0,10000:0});
    } catch(e) {
      alert("保存に失敗しました");
      console.error(e);
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-lg space-y-6">
      <Link href="/history" className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 rounded-full py-2 px-4 text-lg font-semibold transition">
        履歴
      </Link>

      <h1 className="text-4xl font-bold text-center">レジ締め入力</h1>

      <div className="flex md:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-xl font-semibold mb-2">日付</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border rounded-lg p-4 w-full text-xl focus:ring-2 focus:ring-blue-400"/>
        </div>
        <div className="flex-1">
          <label className="block text-xl font-semibold mb-2">担当者</label>
          <select value={person} onChange={e=>setPerson(e.target.value)} className="border rounded-lg p-4 w-full text-xl focus:ring-2 focus:ring-blue-400">
            <option>SHIHO</option>
            <option>MAMI</option>
            <option>SUZU</option>
          </select>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-3 border-b pb-1">金額の入力</h2>
      <div className="grid grid-cols-2 gap-4">
        {Object.keys(money).map(k=>(
          <div key={k} className="flex items-center justify-between border p-4 rounded-2xl">
            <span className="text-xl">{k}円</span>
            <span className="text-xl font-bold">×</span>
            <input
              value={money[k]}
              onChange={e=>handleChange(k,e.target.value)}
              className="w-20 border rounded-md p-3 text-right text-xl"
              inputMode="numeric"
            />
            <span>枚</span>
          </div>
        ))}
      </div>

      <div className="text-right font-bold text-3xl border-t pt-3 text-blue-600">
        合計：¥{total.toLocaleString()}
      </div>

      <button onClick={saveData} className="w-full bg-blue-500 text-white rounded-3xl p-4 text-2xl hover:bg-blue-600 transition">
        保存
      </button>
    </div>
  );
}
