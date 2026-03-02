/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🧠 MODULE : ANALYTICS DES REVUES
 * -------------------------------------------------------------------------
 * RÔLE : Transforme les données de revue en indicateurs de performance.
 * ARCHITECTURE : Zéro NextAuth (100% apiClient), CSS Chart Custom.
 * DATE : 02 Mars 2026 | 13:01 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  AlertCircle, ArrowLeft, BarChart3, CheckCircle2,
  ShieldCheck, Target, TrendingUp, Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

export default function ReviewAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get("/process-reviews/analytics");
        setStats(res.data?.data || res.data);
      } catch (err) {
        toast.error("Erreur critique d'intelligence décisionnelle SDE.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !stats) return (
    <div className="ml-0 lg:ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic animate-pulse gap-6">
      <BarChart3 size={64} className="text-blue-600" />
      <span className="font-black uppercase tracking-[0.5em] text-[12px] italic">
        Calcul de la performance SMI...
      </span>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 p-6 lg:p-12 bg-[#0B0F1A] min-h-screen text-white italic font-sans selection:bg-blue-600/30 overflow-x-hidden text-left">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER STRATÉGIQUE */}
      <header className="mb-10 lg:mb-16 w-full max-w-7xl mx-auto animate-in slide-in-from-left duration-700">
        <button
          onClick={() => router.push("/dashboard/process-review")}
          className="text-[10px] lg:text-[11px] font-black uppercase text-slate-500 mb-6 lg:mb-8 flex items-center gap-3 hover:text-white transition-all group border-none bg-transparent cursor-pointer italic"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
          Retour à l&apos;historique
        </button>
        <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic leading-none m-0">
          Intelligence <span className="text-blue-600">Décisionnelle</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase text-[9px] lg:text-[11px] tracking-[0.2em] lg:tracking-[0.4em] mt-4 lg:mt-6 flex items-center gap-3 italic m-0">
          <Zap size={14} className="text-blue-500 shrink-0" /> Analyse de l&apos;efficacité du Plan d&apos;Actions de Direction
        </p>
      </header>

      <main className="w-full max-w-7xl mx-auto space-y-10 lg:space-y-12">
        {/* 📊 KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-10">
          <div className="bg-slate-900/40 border-2 border-white/5 p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
            <CheckCircle2 className="text-emerald-500 mb-6 lg:mb-8" size={28} />
            <div className="text-5xl lg:text-6xl font-black italic leading-none">{stats.reviews?.validated || 0}</div>
            <div className="text-[10px] lg:text-[11px] font-black uppercase text-slate-500 tracking-widest mt-4 italic">Revues Scellées</div>
            <CheckCircle2 size={120} className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none" />
          </div>

          <div className="bg-slate-900/40 border-2 border-white/5 p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
            <Target className="text-blue-500 mb-6 lg:mb-8" size={28} />
            <div className="text-5xl lg:text-6xl font-black italic leading-none">{stats.actions?.total || 0}</div>
            <div className="text-[10px] lg:text-[11px] font-black uppercase text-slate-500 tracking-widest mt-4 italic">Actions Générées</div>
            <Target size={120} className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none" />
          </div>

          <div className="sm:col-span-2 bg-linear-to-br from-blue-600/15 to-emerald-600/15 border-2 border-white/10 p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] flex flex-col lg:flex-row items-start lg:items-center justify-between shadow-2xl relative overflow-hidden gap-6">
            <TrendingUp size={150} className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none" />
            <div className="relative z-10">
              <div className="text-6xl lg:text-8xl font-black italic leading-none text-emerald-400 tracking-tighter">
                {stats.actions?.executionRate || 0}%
              </div>
              <div className="text-[10px] lg:text-[12px] font-black uppercase text-white/60 tracking-[0.2em] lg:tracking-[0.3em] mt-4 lg:mt-6 italic">
                Taux de réalisation global des décisions
              </div>
            </div>
            <ShieldCheck size={80} className="text-emerald-500/20 relative z-10 shrink-0 hidden sm:block" />
          </div>
        </div>

        {/* 📉 ILLUSTRATION PÉDAGOGIQUE PDCA */}
        <div className="bg-slate-900/20 p-8 rounded-3xl border border-white/5 text-center lg:text-left flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
             <h3 className="text-[12px] font-black uppercase text-blue-400 tracking-widest mb-2 italic">Dynamique d&apos;Amélioration Continue</h3>
             <p className="text-[10px] lg:text-[11px] text-slate-400 uppercase tracking-widest leading-relaxed italic m-0">
               Les indicateurs ci-dessus reflètent directement votre efficacité dans la boucle de Deming. Chaque revue de processus alimente le cycle de décision stratégique.
             </p>
          </div>
          <div className="shrink-0 max-w-50 opacity-70 mix-blend-screen">
             
          </div>
        </div>

        {/* 📈 GRAPHIQUE D'ÉVOLUTION (CUSTOM SVG/CSS RESTAURÉ) */}
        <div className="bg-slate-900/40 p-8 lg:p-16 rounded-[3rem] lg:rounded-[4.5rem] border-2 border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 lg:mb-20 relative z-10 gap-6">
            <h3 className="text-[11px] lg:text-[13px] font-black uppercase tracking-[0.2em] lg:tracking-[0.4em] text-emerald-500 flex items-center gap-3 lg:gap-4 italic leading-tight m-0">
              <TrendingUp size={24} className="shrink-0" /> Évolution Mensuelle de l&apos;Efficacité
            </h3>
            <div className="flex items-center gap-3 text-[9px] lg:text-[10px] font-black uppercase text-slate-500 italic shrink-0">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" /> 
              Taux d&apos;exécution
            </div>
          </div>

          <div className="flex items-end justify-between h-64 lg:h-96 gap-4 lg:gap-10 relative z-10 px-2 lg:px-8 overflow-x-auto custom-scrollbar pb-6 lg:pb-0">
            {stats.trend?.length > 0 ? stats.trend.map((item: any, i: number) => (
              <div key={i} className="flex-1 min-w-10 flex flex-col items-center group relative h-full">
                {/* Tooltip dynamique au survol */}
                <div className="absolute -top-12 lg:-top-16 scale-0 group-hover:scale-100 transition-all duration-300 bg-white text-black text-[10px] lg:text-[12px] font-black px-4 py-2 lg:px-5 lg:py-3 rounded-2xl lg:rounded-3xl shadow-2xl z-20 pointer-events-none italic whitespace-nowrap">
                  {item.rate}% ({item.count} mesures)
                </div>

                <div className="w-full flex flex-col justify-end items-center h-full">
                  <div
                    className="w-full max-w-15 lg:max-w-20 bg-blue-600/10 group-hover:bg-blue-600/30 rounded-t-2xl lg:rounded-t-4xl transition-all duration-1000 ease-out relative overflow-hidden flex items-end justify-center shadow-inner"
                    style={{ height: `${Math.max(item.rate || 0, 5)}%` }}
                  >
                    <div className="w-full bg-blue-500 h-1.5 lg:h-2 absolute top-0 shadow-[0_5px_15px_rgba(59,130,246,0.5)]" />
                    <span className="text-[10px] lg:text-[12px] font-black text-white/40 mb-2 lg:mb-4 opacity-0 group-hover:opacity-100 transition-opacity italic">
                      {item.rate || 0}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] lg:text-[11px] font-black text-slate-600 mt-4 lg:mt-8 uppercase tracking-widest group-hover:text-white transition-colors italic leading-none whitespace-nowrap">
                  {item.period}
                </span>
              </div>
            )) : (
               <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-600 italic">Données d&apos;évolution insuffisantes</div>
            )}
          </div>

          <div className="absolute inset-x-8 lg:inset-x-24 bottom-20 lg:bottom-34 h-64 lg:h-96 flex flex-col justify-between pointer-events-none opacity-[0.03]">
            {[100, 75, 50, 25, 0].map((val) => (
              <div key={val} className="w-full border-t-2 border-white flex items-center text-[9px] lg:text-[10px] font-black tracking-widest">{val}%</div>
            ))}
          </div>
        </div>

        {/* 📉 RÉPARTITION & EXPERTISE */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
          <div className="xl:col-span-2 bg-slate-900/40 p-8 lg:p-16 rounded-[3rem] lg:rounded-[4.5rem] border-2 border-white/5 shadow-2xl">
            <h3 className="text-[10px] lg:text-[12px] font-black uppercase tracking-[0.2em] lg:tracking-[0.4em] text-blue-500 mb-10 lg:mb-14 italic underline decoration-2 underline-offset-8 decoration-blue-500/30 leading-tight m-0">
              Détails du Plan d&apos;Action Stratégique
            </h3>
            <div className="space-y-10 lg:space-y-14">
              <ProgressBar label="Actions Clôturées" value={stats.actions?.completed || 0} total={stats.actions?.total || 0} color="bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)]" />
              <ProgressBar label="Actions en cours" value={stats.actions?.inProgress || 0} total={stats.actions?.total || 0} color="bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.3)]" />
              <ProgressBar label="Actions en attente" value={stats.actions?.pending || 0} total={stats.actions?.total || 0} color="bg-slate-800" />
            </div>
          </div>

          <div className="bg-blue-600/5 border-2 border-blue-500/10 p-8 lg:p-16 rounded-[3rem] lg:rounded-[4.5rem] flex flex-col justify-between shadow-xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 lg:-right-16 lg:-top-16 text-blue-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
              <ShieldCheck size={200} className="lg:w-62.5 lg:h-62.5" />
            </div>
            <div className="space-y-6 lg:space-y-8 relative z-10">
              <AlertCircle className="text-blue-500 animate-pulse" size={40} />
              <h4 className="text-3xl lg:text-4xl font-black uppercase italic leading-none tracking-tighter text-white m-0">
                Expertise <br /> Certification
              </h4>
              <p className="text-slate-400 text-[11px] lg:text-[13px] font-black leading-relaxed italic uppercase tracking-tighter opacity-80 m-0">
                L&apos;évolution positive de ce mapping est notre meilleur argument lors des audits tierce-partie.
                <br /><br />
                Il prouve que vos revues ne sont pas administratives mais un véritable moteur de changement pour l&apos;organisation (§10.3 Amélioration Continue).
              </p>
            </div>
            <button onClick={() => window.print()} className="w-full mt-10 lg:mt-12 border-2 border-white/10 p-6 lg:p-8 rounded-4xl lg:rounded-[3rem] text-[9px] lg:text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all cursor-pointer bg-transparent italic relative z-10 shadow-lg border-none">
              Exporter le bilan annuel
            </button>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }
      `}</style>
    </div>
  );
}

/** 📊 HELPER COMPONENT INTÉGRALEMENT CONSERVÉ */
function ProgressBar({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex justify-between text-[10px] lg:text-[12px] font-black uppercase tracking-widest italic m-0">
        <span className="text-slate-400 truncate pr-4">{label}</span>
        <span className="text-white shrink-0">
          {value} <span className="text-slate-600">/ {total} UNITÉ(S)</span>
        </span>
      </div>
      <div className="h-4 lg:h-5 bg-slate-950 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}