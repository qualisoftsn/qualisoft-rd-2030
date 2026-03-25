/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🧠 MODULE : ANALYTICS DES REVUES (INTELLIGENCE DÉCISIONNELLE)
 * -------------------------------------------------------------------------
 * RÔLE : Analyse de l'efficacité du SMQ (§9.1.3).
 * DESIGN : Cockpit Analytique SDE, Dark High-Contrast, 100dvh.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 17:55 GMT
 */

"use client";

import { useEffect, useState } from "react";
import apiClient from "@/core/api/api-client";
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, Target, TrendingUp, RefreshCw 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

export default function ReviewAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiClient.get("/process-reviews/analytics")
      .then(res => setStats(res.data?.data || res.data))
      .catch(() => toast.error("ERREUR CRITIQUE D'INTELLIGENCE MATRIX"))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <LoadingScreen label="Compilation de l'Intelligence Décisionnelle..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-xl z-50 mt-12 lg:mt-0">
        <button onClick={() => router.back()} className="flex items-center gap-3 text-[10px] text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer italic tracking-widest mb-6 uppercase">
          <ArrowLeft size={16} /> Retour Cockpit
        </button>
        <h1 className="text-4xl lg:text-6xl tracking-tighter leading-none m-0 italic">Intelligence <span className="text-blue-600">Décisionnelle</span></h1>
      </header>

      {/* 📊 KPI GRID */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-400 mx-auto space-y-12 pb-20">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatBox icon={CheckCircle2} val={stats.reviews?.validated || 0} label="Revues Scellées" color="emerald" />
            <StatBox icon={Target} val={stats.actions?.total || 0} label="Actions Générées" color="blue" />
            <div className="md:col-span-2 bg-linear-to-br from-blue-600/20 to-emerald-600/20 border-2 border-white/10 rounded-[3.5rem] p-10 flex items-center justify-between relative overflow-hidden group shadow-4xl transition-all hover:scale-[1.01]">
              <TrendingUp className="absolute right-0 top-0 p-8 opacity-5" size={180} />
              <div className="relative z-10">
                <p className="text-7xl lg:text-8xl italic tracking-tighter leading-none text-emerald-400 m-0">{stats.actions?.executionRate || 0}%</p>
                <p className="text-[11px] text-white/50 tracking-[0.4em] mt-4 m-0 uppercase font-black italic">Taux Global de Réalisation</p>
              </div>
              <ShieldCheck size={80} className="text-emerald-500/20 hidden xl:block" />
            </div>
          </div>

          {/* 📈 DYNAMIC BAR CHART */}
          <section className="bg-[#151B2B] border-2 border-white/5 rounded-[4.5rem] p-12 lg:p-16 shadow-4xl space-y-12">
            <h3 className="text-[12px] text-emerald-500 tracking-[0.5em] m-0 italic flex items-center gap-4"><TrendingUp size={24} /> Évolution de l&apos;Efficacité Mensuelle</h3>
            <div className="flex items-end justify-between h-96 gap-6 px-10">
              {stats.trend?.map((item: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                   <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all bg-white text-black text-[10px] px-4 py-2 rounded-xl font-black italic">{item.rate}%</div>
                   <div className="w-full bg-blue-600/10 group-hover:bg-blue-600 transition-all duration-700 rounded-t-3xl relative" style={{ height: `${item.rate}%` }}>
                     <div className="absolute top-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                   </div>
                   <span className="text-[10px] text-slate-500 mt-6 tracking-widest font-black uppercase italic group-hover:text-white">{item.period}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 📉 PROGRESSION PLAN D'ACTIONS */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            <div className="xl:col-span-2 bg-[#151B2B] p-12 lg:p-16 border-2 border-white/5 rounded-[4rem] space-y-12 shadow-4xl">
              <h3 className="text-[12px] text-blue-500 tracking-[0.5em] m-0 italic">Détails du Plan d&apos;Action Stratégique</h3>
              <div className="space-y-10">
                <AnalitycProgress label="Actions Clôturées" val={stats.actions?.completed || 0} total={stats.actions?.total || 1} color="bg-emerald-500" />
                <AnalitycProgress label="Actions en Cours" val={stats.actions?.inProgress || 0} total={stats.actions?.total || 1} color="bg-blue-500" />
                <AnalitycProgress label="Actions en Attente" val={stats.actions?.pending || 0} total={stats.actions?.total || 1} color="bg-slate-700" />
              </div>
            </div>
            <div className="bg-blue-600/5 border-2 border-blue-500/10 p-12 lg:p-16 rounded-[4rem] shadow-4xl flex flex-col justify-between">
              <ShieldCheck size={48} className="text-blue-500 animate-pulse" />
              <div className="space-y-6">
                <h4 className="text-4xl leading-none italic tracking-tighter m-0 uppercase">Expertise Audit Ready</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-black uppercase tracking-widest italic m-0">La progression de ce mapping prouve l&apos;amélioration continue de l&apos;organisation (§10.3).</p>
              </div>
              <button onClick={() => window.print()} className="w-full py-5 bg-black/40 hover:bg-white hover:text-black text-white rounded-3xl text-[10px] transition-all border-none cursor-pointer italic font-black uppercase tracking-widest">Exporter Bilan Annuel</button>
            </div>
          </div>

        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function StatBox({ icon: Icon, val, label, color }: any) {
  const c: any = { emerald: "text-emerald-500", blue: "text-blue-500" };
  return (
    <div className="bg-[#151B2B] border-2 border-white/5 p-10 rounded-[3.5rem] relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-4xl">
      <Icon className={cn("mb-8", c[color])} size={28} />
      <div className="text-6xl font-black italic leading-none text-white m-0 tracking-tighter">{val}</div>
      <p className="text-[10px] text-slate-500 tracking-widest mt-4 m-0 uppercase font-black italic">{label}</p>
    </div>
  );
}

function AnalitycProgress({ label, val, total, color }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end text-[11px] font-black italic uppercase tracking-widest"><span className="text-slate-400">{label}</span><span className="text-white text-xl">{val} <small className="text-slate-600">/ {total}</small></span></div>
      <div className="h-4 bg-black/40 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
        <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${(val / total) * 100}%` }} />
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-indigo-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}
