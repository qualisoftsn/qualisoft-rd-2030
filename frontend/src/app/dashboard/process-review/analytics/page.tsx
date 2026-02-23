/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🧠 MODULE : ANALYTICS DES REVUES
 * -------------------------------------------------------------------------
 * RÔLE : Transforme les données de revue en indicateurs de performance.
 * CONSOLIDATION : Maintien intégral du composant ProgressBar et du chart CSS.
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
        setStats(res.data);
      } catch (err) {
        toast.error("Erreur critique d'intelligence décisionnelle SDE.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !stats) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic animate-pulse gap-6">
      <BarChart3 size={64} className="text-blue-600" />
      <span className="font-black uppercase tracking-[0.5em] text-[12px] italic">
        Calcul de la performance SMI...
      </span>
    </div>
  );

  return (
    <div className="ml-72 p-12 bg-[#0B0F1A] min-h-screen text-white italic font-sans selection:bg-blue-600/30 overflow-x-hidden text-left">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER STRATÉGIQUE */}
      <header className="mb-16 w-full max-w-7xl mx-auto animate-in slide-in-from-left duration-700">
        <button
          onClick={() => router.push("/dashboard/process-review")}
          className="text-[11px] font-black uppercase text-slate-500 mb-8 flex items-center gap-3 hover:text-white transition-all group border-none bg-transparent cursor-pointer italic"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
          Retour à l&apos;historique
        </button>
        <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none">
          Intelligence <span className="text-blue-600">Décisionnelle</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.4em] mt-6 flex items-center gap-3 italic">
          <Zap size={16} className="text-blue-500" /> Analyse de l&apos;efficacité du Plan d&apos;Actions de Direction
        </p>
      </header>

      <main className="w-full max-w-7xl mx-auto space-y-12">
        {/* 📊 KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="bg-slate-900/40 border-2 border-white/5 p-12 rounded-[3.5rem] relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
            <CheckCircle2 className="text-emerald-500 mb-8" size={32} />
            <div className="text-6xl font-black italic leading-none">{stats.reviews?.validated || 0}</div>
            <div className="text-[11px] font-black uppercase text-slate-500 tracking-widest mt-4 italic">Revues Scellées</div>
            <CheckCircle2 size={160} className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity" />
          </div>

          <div className="bg-slate-900/40 border-2 border-white/5 p-12 rounded-[3.5rem] relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
            <Target className="text-blue-500 mb-8" size={32} />
            <div className="text-6xl font-black italic leading-none">{stats.actions?.total || 0}</div>
            <div className="text-[11px] font-black uppercase text-slate-500 tracking-widest mt-4 italic">Actions Générées</div>
            <Target size={160} className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity" />
          </div>

          <div className="md:col-span-2 bg-linear-to-br from-blue-600/15 to-emerald-600/15 border-2 border-white/10 p-12 rounded-[4rem] flex items-center justify-between shadow-2xl relative">
            <TrendingUp size={200} className="absolute top-0 right-0 p-8 opacity-5" />
            <div className="relative z-10">
              <div className="text-8xl font-black italic leading-none text-emerald-400 tracking-tighter">
                {stats.actions?.executionRate || 0}%
              </div>
              <div className="text-[12px] font-black uppercase text-white/60 tracking-[0.3em] mt-6 italic">
                Taux de réalisation global des décisions
              </div>
            </div>
            <ShieldCheck size={100} className="text-emerald-500/20 relative z-10" />
          </div>
        </div>

        {/* 📈 GRAPHIQUE D'ÉVOLUTION (CUSTOM SVG/CSS RESTAURÉ À L'IDENTIQUE) */}
        <div className="bg-slate-900/40 p-16 rounded-[4.5rem] border-2 border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-20 relative z-10">
            <h3 className="text-[13px] font-black uppercase tracking-[0.4em] text-emerald-500 flex items-center gap-4 italic leading-none">
              <TrendingUp size={28} /> Évolution Mensuelle de l&apos;Efficacité (Flux 6 mois)
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 italic">
              <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" /> 
              Taux d&apos;exécution
            </div>
          </div>

          <div className="flex items-end justify-between h-96 gap-10 relative z-10 px-8">
            {stats.trend?.map((item: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center group relative h-full">
                {/* Tooltip dynamique au survol conservé */}
                <div className="absolute -top-16 scale-0 group-hover:scale-100 transition-all duration-500 bg-white text-black text-[12px] font-black px-5 py-3 rounded-3xl shadow-2xl z-20 pointer-events-none italic whitespace-nowrap">
                  {item.rate}% ({item.count} mesures)
                </div>

                <div className="w-full flex flex-col justify-end items-center h-full">
                  <div
                    className="w-full max-w-20 bg-blue-600/10 group-hover:bg-blue-600/30 rounded-t-4xl transition-all duration-1000 ease-out relative overflow-hidden flex items-end justify-center shadow-inner"
                    style={{ height: `${Math.max(item.rate, 2)}%` }}
                  >
                    <div className="w-full bg-blue-500 h-2 absolute top-0 shadow-[0_5px_15px_rgba(59,130,246,0.5)]" />
                    <span className="text-[12px] font-black text-white/40 mb-4 opacity-0 group-hover:opacity-100 transition-opacity italic">
                      {item.rate}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-black text-slate-600 mt-8 uppercase tracking-widest group-hover:text-white transition-colors italic leading-none">
                  {item.period}
                </span>
              </div>
            ))}
          </div>

          <div className="absolute inset-x-24 bottom-34 h-96 flex flex-col justify-between pointer-events-none opacity-[0.03]">
            {[100, 75, 50, 25, 0].map((val) => (
              <div key={val} className="w-full border-t-2 border-white flex items-center text-[10px] font-black tracking-widest">{val}%</div>
            ))}
          </div>
        </div>

        {/* 📉 RÉPARTITION & EXPERTISE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 bg-slate-900/40 p-16 rounded-[4.5rem] border-2 border-white/5 shadow-2xl">
            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-500 mb-14 italic underline decoration-2 underline-offset-8 decoration-blue-500/30">
              Détails du Plan d&apos;Action Stratégique
            </h3>
            <div className="space-y-14">
              <ProgressBar label="Actions Clôturées" value={stats.actions?.completed || 0} total={stats.actions?.total || 0} color="bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)]" />
              <ProgressBar label="Actions en cours de traitement" value={stats.actions?.inProgress || 0} total={stats.actions?.total || 0} color="bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.3)]" />
              <ProgressBar label="Actions en attente d'initialisation" value={stats.actions?.pending || 0} total={stats.actions?.total || 0} color="bg-slate-800" />
            </div>
          </div>

          <div className="bg-blue-600/5 border-2 border-blue-500/10 p-16 rounded-[4.5rem] flex flex-col justify-between shadow-xl relative overflow-hidden group">
            <div className="absolute -right-16 -top-16 text-blue-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <ShieldCheck size={250} />
            </div>
            <div className="space-y-8 relative z-10">
              <AlertCircle className="text-blue-500 animate-pulse" size={56} />
              <h4 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-white">
                Expertise <br /> Certification
              </h4>
              <p className="text-slate-400 text-[13px] font-black leading-relaxed italic uppercase tracking-tighter opacity-80">
                L&apos;évolution positive de ce mapping est notre meilleur argument lors des audits tierce-partie.
                <br /><br />
                Il prouve que vos revues ne sont pas administratives mais un véritable moteur de changement pour l&apos;organisation (§10.3 Amélioration Continue).
              </p>
            </div>
            <button onClick={() => window.print()} className="w-full mt-12 border-2 border-white/10 p-8 rounded-[3rem] text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all cursor-pointer bg-transparent italic relative z-10 shadow-lg">
              Exporter le bilan annuel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/** 📊 HELPER COMPONENT INTÉGRALEMENT CONSERVÉ */
function ProgressBar({ label, value, total, color }: any) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-6">
      <div className="flex justify-between text-[12px] font-black uppercase tracking-widest italic">
        <span className="text-slate-400">{label}</span>
        <span className="text-white">
          {value} <span className="text-slate-600">/ {total} UNITÉ(S)</span>
        </span>
      </div>
      <div className="h-5 bg-slate-950 rounded-full overflow-hidden p-1 border-2 border-white/5 shadow-inner">
        <div className={`h-full rounded-full transition-all duration-1500 ease-out ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}