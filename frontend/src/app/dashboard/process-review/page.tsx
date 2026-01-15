/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { Plus, ChevronRight, FileText, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProcessReviewListPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/process-reviews')
      .then(res => setReviews(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen text-white italic font-sans">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Revues de <span className="text-blue-600">Processus</span></h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] mt-2 tracking-[0.3em]">Pilotage de la Performance SMI</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/process-review/preparation')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-lg shadow-blue-900/40"
        >
          <Plus size={18} /> Lancer un Scan
        </button>
      </header>

      {loading ? <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl"/>)}</div> : (
        <div className="grid gap-4">
          {reviews.map((rev: any) => (
            <div 
              key={rev.PRV_Id}
              onClick={() => router.push(`/dashboard/process-review/session/${rev.PRV_Id}`)}
              className="bg-slate-900/40 border border-white/5 p-6 rounded-4xl flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-white/10 text-center min-w-17.5">
                  <span className="block text-[8px] font-black text-blue-500 uppercase">{rev.PRV_Month}/2025</span>
                  <span className="text-xs font-black text-slate-400 italic">{rev.PRV_DocRef}</span>
                </div>
                <div>
                  <h3 className="font-black uppercase text-sm tracking-tight group-hover:text-blue-400">{rev.PRV_Processus?.PR_Libelle}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 ${rev.PRV_Status === 'VALIDEE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {rev.PRV_Status === 'VALIDEE' ? <CheckCircle2 size={10}/> : <Clock size={10}/>} {rev.PRV_Status}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-slate-700 group-hover:text-white" size={20} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}