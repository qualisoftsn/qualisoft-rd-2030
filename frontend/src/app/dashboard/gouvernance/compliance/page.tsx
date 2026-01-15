/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { Scale, AlertCircle, Loader2 } from 'lucide-react';

export default function CompliancePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/gouvernance/planning?type=VEILLE_REGLEMENTAIRE')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A] text-blue-500 italic font-black uppercase tracking-widest">Analyse de conformité...</div>;

  return (
    <div className="ml-72 p-10 bg-[#0B0F1A] min-h-screen text-white italic text-left">
      <h1 className="text-5xl font-black uppercase mb-10 tracking-tighter italic">Veille <span className="text-blue-500 text-6xl">Légale</span></h1>
      <div className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <th className="p-8">Activité</th>
              <th className="p-8">Date Prévue</th>
              <th className="p-8">Date Limite</th>
              <th className="p-8">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((v: any) => (
              <tr key={v.GA_Id} className="hover:bg-white/2">
                <td className="p-8 font-black uppercase italic tracking-tighter text-lg">{v.GA_Title}</td>
                <td className="p-8 text-xs font-bold text-slate-400">{new Date(v.GA_DatePlanned).toLocaleDateString()}</td>
                <td className="p-8">
                  <span className="flex items-center gap-2 text-amber-500 font-black text-xs uppercase italic">
                    <AlertCircle size={14}/> {v.GA_Deadline ? new Date(v.GA_Deadline).toLocaleDateString() : 'N/A'}
                  </span>
                </td>
                <td className="p-8 text-[10px] font-black uppercase text-blue-500">{v.GA_Status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}