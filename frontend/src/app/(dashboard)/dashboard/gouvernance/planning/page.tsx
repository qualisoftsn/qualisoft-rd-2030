/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📅 MODULE : CHRONOGRAMME MASTER §9.3 (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage temporel des instances et jalons critiques.
 * DESIGN : Timeline Matrix, 100dvh, PWA Optimisé.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 15:05 GMT
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { Plus, Trash2, RefreshCcw } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

export default function PerformancePlanning() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/gouvernance/planning');
      setActivities(res.data?.data || res.data || []);
    /// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) { toast.error("SYNCHRO CHRONO ÉCHOUÉE"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = activities.length;
    const done = activities.filter(a => a.GA_Status === 'DONE').length;
    const late = activities.filter(a => a.GA_Status !== 'DONE' && a.GA_Deadline && new Date(a.GA_Deadline) < new Date()).length;
    return { completion: total > 0 ? Math.round((done/total)*100) : 0, late, total };
  }, [activities]);

  if (loading) return <LoadingScreen label="Sync Master Chronos §9.3..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-xl z-40">
        <div className="text-left space-y-2">
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Chronogramme <span className="text-blue-500">Master</span></h1>
          <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0 italic">Ordonnancement Temporel SMI §9.3</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 px-10 py-4 rounded-2xl text-[10px] flex items-center gap-3 shadow-2xl hover:bg-white hover:text-blue-600 transition-all border-none italic text-white cursor-pointer">
          <Plus size={20} strokeWidth={3} /> Nouvelle Activité
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="bg-[#151B2B] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
             <p className="text-[10px] text-slate-500 tracking-widest mb-4">Réalisation</p>
             <span className="text-6xl font-black italic text-emerald-500 tracking-tighter leading-none">{stats.completion}%</span>
          </div>
          <div className="bg-[#151B2B] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
             <p className="text-[10px] text-slate-500 tracking-widest mb-4">Retards</p>
             <span className="text-6xl font-black italic text-rose-500 tracking-tighter leading-none">{stats.late}</span>
          </div>
          <div className="bg-[#151B2B] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
             <p className="text-[10px] text-slate-500 tracking-widest mb-4">Instances</p>
             <span className="text-6xl font-black italic text-blue-500 tracking-tighter leading-none">{stats.total}</span>
          </div>
        </div>

        <div className="space-y-6">
          {activities.map(act => (
            <div key={act.GA_Id} className="bg-[#151B2B] border border-white/5 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-blue-500/40 transition-all shadow-4xl">
              <div className="flex items-center gap-10 flex-1">
                <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-4xl flex flex-col items-center justify-center text-blue-500 shrink-0">
                   <span className="text-[9px] font-black uppercase mb-1">{new Date(act.GA_DatePlanned).toLocaleString('fr', {month: 'short'})}</span>
                   <span className="text-3xl font-black leading-none">{new Date(act.GA_DatePlanned).getDate()}</span>
                </div>
                <div className="text-left">
                  <span className="px-4 py-1.5 bg-black/40 rounded-full text-[8px] text-slate-500 border border-white/5 tracking-widest uppercase mb-4 inline-block">{act.GA_Type}</span>
                  <h4 className="text-2xl font-black m-0 tracking-tighter group-hover:text-blue-500 transition-colors leading-none">{act.GA_Title}</h4>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={cn("px-6 py-2 rounded-xl text-[9px] font-black border", act.GA_Status === 'DONE' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-white/5 text-slate-500 border-white/5")}>{act.GA_Status}</span>
                <button className="p-4 bg-white/5 rounded-2xl hover:bg-rose-600 transition-all border-none text-white cursor-pointer opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 lg:pl-72 text-blue-500">
      <RefreshCcw className="animate-spin" size={60} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] animate-pulse italic">{label}</span>
    </div>
  );
}
