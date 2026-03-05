/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🎙️ MODULE : SÉANCES PROCESSUS §9.3 (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Traçabilité des arbitrages opérationnels et décisions SMI.
 * DESIGN : Cockpit Matrix, 100dvh, Design ClickUp Hybrid.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 15:12 GMT
 */

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { Presentation, Plus, Edit3, Trash2, MapPin, Target, RefreshCcw, Database, X, Save, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function SeancesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/gouvernance/planning?type=SEANCE_PROCESSUS');
      setData(res.data?.data || res.data || []);
    } catch (err) { toast.error("RUPTURE REGISTRE SÉANCES"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingScreen label="Ouverture du Registre Séances..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-xl z-50">
        <div className="text-left space-y-2">
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Sessions <span className="text-blue-600">Processus</span></h1>
          <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0 italic"><Presentation size={12} className="text-blue-500" /> Surveillance Opérationnelle §9.3</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-10 py-4 rounded-2xl text-[10px] flex items-center gap-4 transition-all shadow-2xl border-none cursor-pointer italic text-white hover:bg-white hover:text-blue-600">
          <Plus size={20} /> Programmer Séance
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-10">
        <div className="grid grid-cols-1 gap-8">
          {data.length > 0 ? data.map(s => (
            <div key={s.GA_Id} className="bg-[#151B2B] border border-white/5 p-10 rounded-[4rem] flex flex-col xl:flex-row justify-between gap-10 group hover:border-blue-500/40 transition-all shadow-4xl">
              <div className="flex items-center gap-10 flex-1">
                <div className="w-24 h-24 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] flex flex-col items-center justify-center text-blue-500 shrink-0">
                   <span className="text-[10px] font-black mb-1 uppercase tracking-widest">{new Date(s.GA_DatePlanned).toLocaleString('fr', {month: 'short'})}</span>
                   <span className="text-4xl font-black italic m-0">{new Date(s.GA_DatePlanned).getDate()}</span>
                </div>
                <div className="text-left space-y-4">
                  <div className="flex items-center gap-5">
                    <span className="px-5 py-2 bg-blue-600/20 text-blue-400 rounded-full text-[10px] border border-blue-500/20">{s.GA_Num || 'SDE-SESSION'}</span>
                    <span className="flex items-center gap-2 text-[10px] text-slate-500 italic"><MapPin size={14} className="text-blue-500"/> {s.GA_Location || 'PLATEFORME MATRIX'}</span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter m-0 leading-none group-hover:text-blue-400 transition-colors uppercase">{s.GA_Title}</h2>
                  <div className="flex flex-wrap gap-3">
                    {s.GA_Processes?.map((p: any) => (
                      <span key={p.PR_Id} className="px-4 py-1 bg-white/5 border border-white/5 rounded-xl text-[8px] text-blue-500 tracking-widest"><Target size={10} className="inline mr-2"/> {p.PR_Code}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                <button className="p-5 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all border-none text-white cursor-pointer"><Edit3 size={20}/></button>
                <button className="p-5 bg-white/5 rounded-2xl hover:bg-red-600 transition-all border-none text-white cursor-pointer"><Trash2 size={20}/></button>
              </div>
            </div>
          )) : (
            <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[5rem] bg-white/2 opacity-20">
               <Database size={80} className="mx-auto mb-8" />
               <p className="text-sm tracking-[0.5em] font-black uppercase">Registre Sessions Vierge §9.3</p>
            </div>
          )}
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 lg:pl-72 text-blue-500">
      <Loader2 className="animate-spin" size={60} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] animate-pulse italic">{label}</span>
    </div>
  );
}