/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { Presentation, Calendar, Loader2 } from 'lucide-react';

export default function SeancesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/gouvernance/planning?type=SEANCE_PROCESSUS')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="ml-72 h-screen flex items-center justify-center bg-[#0B0F1A] text-blue-500 italic font-black uppercase tracking-widest">Chargement des séances...</div>;

  return (
    <div className="ml-72 p-10 bg-[#0B0F1A] min-h-screen text-white italic text-left">
      <h1 className="text-5xl font-black uppercase mb-10 tracking-tighter italic">Séances <span className="text-blue-500 text-6xl">Processus</span></h1>
      <div className="grid gap-6">
        {data.map((s: any) => (
          <div key={s.GA_Id} className="bg-slate-900/50 border border-white/5 p-8 rounded-4xl hover:border-blue-500/50 transition-all group">
             <div className="flex justify-between items-start">
               <div>
                 <span className="bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">{s.GA_Num}</span>
                 <h2 className="text-2xl font-black uppercase mb-2">{s.GA_Title}</h2>
                 <p className="text-slate-400 text-sm mb-4 leading-relaxed">{s.GA_Theme}</p>
                 <div className="flex gap-4">
                    {s.GA_Processes?.map((p: any) => (
                      <span key={p.PR_Id} className="text-[10px] font-black text-slate-500 border border-white/10 px-3 py-1 rounded-lg uppercase">{p.PR_Code}</span>
                    ))}
                 </div>
               </div>
               <div className="text-right">
                 <div className="flex items-center gap-2 text-blue-500 font-black text-xs uppercase"><Calendar size={14}/> {new Date(s.GA_DatePlanned).toLocaleDateString()}</div>
                 <div className="mt-2 text-[10px] font-black text-slate-600 uppercase">Deadline: {s.GA_Deadline ? new Date(s.GA_Deadline).toLocaleDateString() : 'N/A'}</div>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}