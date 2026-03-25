/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📊 MODULE : REPORTING ANALYTIQUE PAQ — ÉDITION ÉLITE
 * -------------------------------------------------------------------------
 * RÔLE : Analyse et évaluation de la performance (§9.1.3 ISO 9001).
 * DESIGN : Elite High-Density, 100dvh, No-Scroll Global, Industrial Dark.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 17:30 GMT
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldAlert, CheckCircle2, Clock, Users, Target, 
  Printer, BarChart3, TrendingUp, RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function PAQReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/paq/dashboard');
      setData(res.data?.data || res.data);
    } catch {
      toast.error("RUPTURE DU FLUX ANALYTIQUE MATRIX");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) return <LoadingScreen label="Compilation de l'Index de Performance §9.1.3..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 ANALYTICS HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <h1 className="text-4xl lg:text-6xl tracking-tighter leading-none m-0 italic">Reporting <span className="text-blue-500 italic">Analytique</span></h1>
          <p className="text-blue-400 font-bold text-[10px] tracking-[0.4em] m-0 italic opacity-80 uppercase">Performance & Amélioration Continue (§9.1.3)</p>
        </div>
        <div className="flex gap-4 w-full xl:w-auto">
          <button onClick={() => window.print()} className="flex-1 xl:flex-none p-5 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 text-slate-400 transition-all cursor-pointer"><Printer size={20}/></button>
          <button onClick={() => router.push('/dashboard/paq')} className="flex-1 xl:flex-none bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-3xl text-[10px] shadow-4xl border-none cursor-pointer text-white italic transition-all font-black uppercase">Fermer Rapport</button>
        </div>
      </header>

      {/* 📊 KPI ROW */}
      <div className="shrink-0 p-8 pb-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBadge label="Actions Totales" val={data?.total || 0} icon={Target} color="blue" />
        <StatBadge label="Retards" val={data?.enRetard?.length || 0} icon={ShieldAlert} color="red" />
        <StatBadge label="En Attente" val={data?.aValider?.length || 0} icon={Clock} color="orange" />
        <StatBadge label="Taux de Clôture" val={`${data?.tauxEfficacite || 0}%`} icon={CheckCircle2} color="emerald" />
      </div>

      {/* 📋 ANALYTICS WORKZONE (Scroll Isolé) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4">
        <div className="max-w-400 mx-auto grid grid-cols-12 gap-8 pb-20">
          
          {/* Radar des Écarts (§10.2) */}
          <section className="col-span-12 xl:col-span-8 bg-[#151B2B] border-2 border-white/5 rounded-[4rem] p-12 shadow-4xl flex flex-col gap-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
               <h3 className="text-2xl m-0 tracking-tighter italic flex items-center gap-4"><div className="w-2 h-8 bg-red-600 rounded-full animate-pulse" /> Analyse des Écarts Critiques</h3>
               <span className="text-[10px] text-red-500 font-black tracking-widest">{data?.enRetard?.length || 0} RETARDS DÉTECTÉS</span>
            </div>
            <div className="space-y-4">
              {data?.enRetard?.map((action: any) => (
                <div key={action.ACT_Id} className="bg-black/40 border border-white/5 p-8 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-red-600/30 transition-all">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-14 h-14 rounded-2xl bg-red-600/10 text-red-500 flex items-center justify-center border border-red-600/20 font-black text-xl italic group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg">!</div>
                    <div className="text-left">
                       <h4 className="text-xl m-0 tracking-tighter group-hover:text-red-400 transition-colors uppercase italic">{action.ACT_Title}</h4>
                       <p className="text-[9px] text-slate-500 mt-2 m-0 tracking-widest uppercase italic">{action.ACT_Responsable?.U_FirstName} {action.ACT_Responsable?.U_LastName || 'Non assigné'}</p>
                    </div>
                  </div>
                  <div className="text-right w-full md:w-auto">
                    <p className="text-[10px] text-red-500 m-0 tracking-widest font-black italic uppercase">Échéance dépassée : {new Date(action.ACT_Deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Effort Pilotes & Index */}
          <section className="col-span-12 xl:col-span-4 space-y-8 flex flex-col">
            <div className="bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] p-10 shadow-4xl relative overflow-hidden flex-1">
               <TrendingUp className="absolute -right-6 -top-6 opacity-5 text-blue-500" size={150} />
               <h3 className="text-[11px] text-blue-500 tracking-[0.4em] m-0 mb-10 italic flex items-center gap-3 uppercase font-black"><Users size={18} /> Effort par Pilote</h3>
               <div className="space-y-8">
                  {data?.chargeTravail?.map((pilot: any, i: number) => (
                    <div key={i} className="group">
                      <div className="flex justify-between items-end italic mb-3">
                        <span className="text-[10px] text-slate-400 tracking-widest uppercase group-hover:text-white transition-colors">{pilot.name}</span>
                        <span className="text-xl leading-none text-blue-500 font-black">{pilot.count}</span>
                      </div>
                      <div className="h-1.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                        <div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${(pilot.count / (data.total || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="bg-white/5 border-2 border-white/5 rounded-[3.5rem] p-8 flex items-center gap-6 group hover:border-blue-500/30 transition-all cursor-help">
               <BarChart3 className="text-blue-500 group-hover:scale-110 transition-transform" size={28} />
               <div className="text-left">
                  <p className="text-[8px] text-slate-500 tracking-widest italic mb-1 m-0 uppercase font-black">Indice de Fiabilité Matrix</p>
                  <p className="text-xl leading-none m-0 italic font-black text-white">SDE ANALYTICS v3.1</p>
               </div>
            </div>
          </section>

        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function StatBadge({ label, val, icon: Icon, color }: any) {
  const themes: any = { 
    blue: "text-blue-500 border-blue-500/10", 
    red: "text-red-500 border-red-500/10", 
    orange: "text-orange-500 border-orange-500/10", 
    emerald: "text-emerald-500 border-emerald-500/10" 
  };
  return (
    <div className={cn("bg-[#151B2B] p-8 rounded-[3rem] border-2 flex items-center gap-6 shadow-4xl transition-all hover:-translate-y-1", themes[color])}>
      <div className="p-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner"><Icon size={24} /></div>
      <div className="text-left">
        <p className="text-3xl font-black italic m-0 tracking-tighter text-white leading-none">{val}</p>
        <p className="text-[9px] text-slate-500 tracking-widest mt-2 m-0 uppercase font-black italic">{label}</p>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed">{label}</span>
    </div>
  );
}
