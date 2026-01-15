/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  TrendingUp, ArrowLeft, Target, CheckCircle2, 
  Activity, BarChart3, AlertCircle, Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
        console.error("Erreur analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic animate-pulse">
      <BarChart3 size={40} className="mb-4 text-blue-600" />
      <span className="font-black uppercase tracking-[0.3em] text-[10px]">Calcul de la performance SMI...</span>
    </div>
  );

  return (
    <div className="p-8 bg-[#0B0F1A] min-h-screen text-white italic font-sans">
      
      {/* HEADER STRATÉGIQUE */}
      <header className="mb-12 flex justify-between items-start">
        <div>
          <button 
            onClick={() => router.push('/dashboard/process-review')} 
            className="text-[9px] font-black uppercase text-slate-500 mb-6 flex items-center gap-2 hover:text-white transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> Retour à l&apos;historique
          </button>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
            Intelligence <span className="text-blue-600">Décisionnelle</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-4 flex items-center gap-2">
            <Zap size={12} className="text-blue-500" /> Analyse de l&apos;efficacité du Plan d&apos;Actions de Direction
          </p>
        </div>
      </header>

      {/* CARTES KPI FLASH */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <CheckCircle2 className="text-emerald-500 mb-4" size={24}/>
          <div className="text-4xl font-black italic leading-none">{stats.reviews.validated}</div>
          <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-2">Revues Clôturées</div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <CheckCircle2 size={100} />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <Target className="text-blue-500 mb-4" size={24}/>
          <div className="text-4xl font-black italic leading-none">{stats.actions.total}</div>
          <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-2">Actions Générées</div>
        </div>

        <div className="md:col-span-2 bg-linear-to-br from-blue-600/20 to-emerald-600/20 border border-white/10 p-8 rounded-[3rem] flex items-center justify-between">
          <div>
            <div className="text-6xl font-black italic leading-none text-emerald-400">{stats.actions.executionRate}%</div>
            <div className="text-[10px] font-black uppercase text-white/60 tracking-[0.2em] mt-3 italic">Taux de réalisation global des décisions</div>
          </div>
          <TrendingUp size={60} className="text-emerald-500/30" />
        </div>
      </div>

      {/* GRAPHIQUE D'ÉVOLUTION MENSUELLE */}
      <div className="bg-slate-900/40 p-12 rounded-[4rem] border border-white/5 mb-10 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-16 relative z-10">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-3 italic">
            <TrendingUp size={20}/> Évolution Mensuelle de l&apos;Efficacité (6 mois)
          </h3>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 text-[8px] font-black uppercase text-slate-500">
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div> Taux d&apos;exécution
             </div>
          </div>
        </div>
        
        <div className="flex items-end justify-between h-64 gap-6 relative z-10">
          {stats.trend.map((item: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center group relative">
              {/* Infobulle au survol */}
              <div className="absolute -top-12 scale-0 group-hover:scale-100 transition-all duration-300 bg-white text-black text-[10px] font-black px-3 py-2 rounded-xl shadow-2xl z-20 pointer-events-none">
                {item.rate}% ({item.count} actions)
              </div>
              
              {/* Colonne de données */}
              <div className="w-full flex flex-col justify-end items-center h-full">
                 <div 
                    className="w-full max-w-12.5 bg-blue-600/20 group-hover:bg-blue-600/40 rounded-t-2xl transition-all duration-700 relative overflow-hidden flex items-end justify-center"
                    style={{ height: `${Math.max(item.rate, 2)}%` }}
                 >
                    {/* Effet visuel de remplissage */}
                    <div className="w-full bg-blue-500 h-1 absolute top-0" />
                    <div className="text-[9px] font-black text-white/50 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.rate}
                    </div>
                 </div>
              </div>
              
              <span className="text-[9px] font-black text-slate-600 mt-6 uppercase tracking-tighter group-hover:text-white transition-colors">
                {item.period}
              </span>
            </div>
          ))}
        </div>
        
        {/* Lignes de repère en arrière-plan */}
        <div className="absolute inset-x-12 bottom-18.5 h-64 flex flex-col justify-between pointer-events-none opacity-[0.03]">
            {[100, 75, 50, 25, 0].map(val => (
                <div key={val} className="w-full border-t border-white flex items-center text-[8px] font-black">{val}%</div>
            ))}
        </div>
      </div>

      {/* RÉPARTITION ET CONSEIL ISO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/40 p-12 rounded-[4rem] border border-white/5">
          <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-10 italic">Détails du Plan d&apos;Action Stratégique</h3>
          <div className="space-y-10">
            <ProgressBar label="Actions Clôturées" value={stats.actions.completed} total={stats.actions.total} color="bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
            <ProgressBar label="Actions en cours de traitement" value={stats.actions.inProgress} total={stats.actions.total} color="bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
            <ProgressBar label="Actions non démarrées" value={stats.actions.pending} total={stats.actions.total} color="bg-slate-700" />
          </div>
        </div>

        <div className="bg-blue-600/5 border border-blue-500/10 p-10 rounded-[4rem] flex flex-col justify-between">
           <div className="space-y-6">
              <AlertCircle className="text-blue-500" size={40} />
              <h4 className="text-xl font-black uppercase italic leading-tight">Expertise <br/> Certification</h4>
              <p className="text-slate-400 text-xs font-bold leading-relaxed italic">
                L&apos;évolution positive de ce graphique est votre meilleur argument lors des audits tierce-partie. 
                <br/><br/>
                Il démontre que les revues de processus ne sont pas de simples réunions administratives, mais un véritable moteur de changement pour l&apos;organisation.
              </p>
           </div>
           <button 
            onClick={() => window.print()}
            className="w-full mt-8 border border-white/10 p-5 rounded-3xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
           >
             Exporter le bilan annuel
           </button>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }: any) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-300 italic">{label}</span>
        <span className="text-white">{value} <span className="text-slate-600">/ {total}</span></span>
      </div>
      <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
        <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} 
            style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}