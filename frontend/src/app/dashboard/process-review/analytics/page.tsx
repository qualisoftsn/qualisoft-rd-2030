/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  TrendingUp, ArrowLeft, Target, CheckCircle2, 
  Activity, BarChart3, AlertCircle, Zap, ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * 🧠 MODULE : ANALYTICS DES REVUES
 * -------------------------------------------------------------------------
 * RÔLE : 
 * Transforme les données de revue en indicateurs de performance stratégique.
 * Calcule le taux de réalisation des décisions prises en revue.
 * -------------------------------------------------------------------------
 */

export default function ReviewAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get('/process-reviews/analytics');
        setStats(res.data);
      } catch (err) {
        console.error("Erreur critique d'intelligence decisionnelle :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic animate-pulse">
      <BarChart3 size={48} className="mb-6 text-blue-600" />
      <span className="font-black uppercase tracking-[0.4em] text-[10px] italic">Calcul de la performance SMI...</span>
    </div>
  );

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen text-white italic font-sans selection:bg-blue-600/30">
      
      {/* 🔝 HEADER STRATÉGIQUE */}
      <header className="mb-12 flex justify-between items-start animate-in slide-in-from-left duration-700">
        <div className="text-left">
          <button 
            onClick={() => router.push('/dashboard/process-review')} 
            className="text-[10px] font-black uppercase text-slate-500 mb-8 flex items-center gap-3 hover:text-white transition-all group border-none bg-transparent cursor-pointer italic"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Retour à l&apos;historique
          </button>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
            Intelligence <span className="text-blue-600">Décisionnelle</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-5 flex items-center gap-3 italic">
            <Zap size={14} className="text-blue-500" /> Analyse de l&apos;efficacité du Plan d&apos;Actions de Direction
          </p>
        </div>
      </header>

      {/* 📊 KPI GRID : LES PILIERS DE L'AMÉLIORATION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-left">
        <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
          <CheckCircle2 className="text-emerald-500 mb-6" size={28}/>
          <div className="text-5xl font-black italic leading-none">{stats.reviews.validated}</div>
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-4 italic">Revues Scellées</div>
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity"><CheckCircle2 size={120} /></div>
        </div>

        <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl">
          <Target className="text-blue-500 mb-6" size={28}/>
          <div className="text-5xl font-black italic leading-none">{stats.actions.total}</div>
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-4 italic">Actions Générées</div>
        </div>

        <div className="md:col-span-2 bg-linear-to-br from-blue-600/15 to-emerald-600/15 border border-white/10 p-10 rounded-[4rem] flex items-center justify-between shadow-2xl relative">
          <div className="absolute top-0 right-0 p-8 opacity-5"><TrendingUp size={150} /></div>
          <div>
            <div className="text-7xl font-black italic leading-none text-emerald-400 tracking-tighter">{stats.actions.executionRate}%</div>
            <div className="text-[11px] font-black uppercase text-white/60 tracking-[0.3em] mt-4 italic">Taux de réalisation global des décisions</div>
          </div>
          <ShieldCheck size={80} className="text-emerald-500/20" />
        </div>
      </div>

      {/* 📈 GRAPHIQUE D'ÉVOLUTION (CUSTOM SVG/CSS) */}
      <div className="bg-slate-900/40 p-16 rounded-[5rem] border border-white/5 mb-12 shadow-3xl relative overflow-hidden text-left">
        <div className="flex justify-between items-center mb-20 relative z-10">
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500 flex items-center gap-4 italic leading-none">
            <TrendingUp size={24}/> Évolution Mensuelle de l&apos;Efficacité (Flux 6 mois)
          </h3>
          <div className="flex gap-6">
             <div className="flex items-center gap-3 text-[9px] font-black uppercase text-slate-500 italic">
                <div className="w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div> Taux d&apos;exécution
             </div>
          </div>
        </div>
        
        <div className="flex items-end justify-between h-80 gap-8 relative z-10 px-4">
          {stats.trend.map((item: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center group relative h-full">
              {/* Tooltip dynamique au survol */}
              <div className="absolute -top-16 scale-0 group-hover:scale-100 transition-all duration-500 bg-white text-black text-[11px] font-black px-4 py-3 rounded-3xl shadow-3xl z-20 pointer-events-none italic whitespace-nowrap">
                {item.rate}% ({item.count} mesures)
              </div>
              
              <div className="w-full flex flex-col justify-end items-center h-full">
                 <div 
                    className="w-full max-w-15 bg-blue-600/10 group-hover:bg-blue-600/30 rounded-t-4xl transition-all duration-1000 ease-out relative overflow-hidden flex items-end justify-center shadow-inner"
                    style={{ height: `${Math.max(item.rate, 2)}%` }}
                 >
                    {/* Indicateur de sommet */}
                    <div className="w-full bg-blue-500 h-1 absolute top-0 shadow-[0_5px_15px_rgba(59,130,246,0.5)]" />
                    <span className="text-[10px] font-black text-white/20 mb-4 opacity-0 group-hover:opacity-100 transition-opacity italic">
                        {item.rate}
                    </span>
                 </div>
              </div>
              
              <span className="text-[10px] font-black text-slate-600 mt-8 uppercase tracking-widest group-hover:text-white transition-colors italic leading-none">
                {item.period}
              </span>
            </div>
          ))}
        </div>
        
        {/* Grillage de fond (Repères 0-100%) */}
        <div className="absolute inset-x-20 bottom-26.25 h-80 flex flex-col justify-between pointer-events-none opacity-[0.02] text-left">
            {[100, 75, 50, 25, 0].map(val => (
                <div key={val} className="w-full border-t border-white flex items-center text-[9px] font-black tracking-widest">{val}%</div>
            ))}
        </div>
      </div>

      {/* 📉 RÉPARTITION & EXPERTISE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
        <div className="lg:col-span-2 bg-slate-900/40 p-16 rounded-[5rem] border border-white/5 shadow-2xl">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 mb-12 italic text-left underline decoration-2 underline-offset-8 decoration-blue-500/30">
            Détails du Plan d&apos;Action Stratégique
          </h3>
          <div className="space-y-12">
            <ProgressBar label="Actions Clôturées" value={stats.actions.completed} total={stats.actions.total} color="bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)]" />
            <ProgressBar label="Actions en cours de traitement" value={stats.actions.inProgress} total={stats.actions.total} color="bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.3)]" />
            <ProgressBar label="Actions en attente d'initialisation" value={stats.actions.pending} total={stats.actions.total} color="bg-slate-800" />
          </div>
        </div>

        <div className="bg-blue-600/5 border border-blue-500/10 p-12 rounded-[5rem] flex flex-col justify-between shadow-xl relative overflow-hidden group text-left">
            <div className="absolute -right-10 -top-10 text-blue-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700"><ShieldCheck size={200} /></div>
            <div className="space-y-8 relative z-10 text-left">
              <AlertCircle className="text-blue-500 animate-pulse" size={48} />
              <h4 className="text-3xl font-black uppercase italic leading-[0.9] tracking-tighter text-white">Expertise <br/> Certification</h4>
              <p className="text-slate-400 text-xs font-black leading-relaxed italic uppercase tracking-tighter opacity-80">
                L&apos;évolution positive de ce mapping est votre meilleur argument lors des audits tierce-partie. 
                <br/><br/>
                Il prouve que vos revues ne sont pas administratives mais un véritable moteur de changement pour l&apos;organisation (§10.3 Amélioration Continue).
              </p>
            </div>
            <button 
              onClick={() => window.print()}
              className="w-full mt-10 border border-white/10 p-6 rounded-4xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all cursor-pointer bg-transparent italic relative z-10 shadow-lg"
            >
              Exporter le bilan annuel
            </button>
        </div>
      </div>
    </div>
  );
}

/** 📊 HELPER COMPONENT : BARRE DE PROGRESSION ÉLITE */
function ProgressBar({ label, value, total, color }: any) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-5 text-left">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest italic">
        <span className="text-slate-400">{label}</span>
        <span className="text-white">{value} <span className="text-slate-700">/ {total} UNITÉ(S)</span></span>
      </div>
      <div className="h-4 bg-slate-950 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
        <div 
            className={`h-full rounded-full transition-all duration-1500 ease-out ${color}`} 
            style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}