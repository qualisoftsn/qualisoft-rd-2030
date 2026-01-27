"use client";

import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  TrendingUp, ShieldCheck, AlertTriangle, Users, 
  Target, Zap, BarChart3, PieChart, RefreshCcw, 
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';

// --- COMPOSANT DE GRAPHIQUE SIMPLIFIÉ (SVG) ---
const MiniChart = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 40" className="w-24 h-10 opacity-50">
    <path 
      d="M0 35 Q 20 10, 40 25 T 80 5 T 100 20" 
      fill="none" 
      stroke={color} 
      strokeWidth="3" 
      className="animate-pulse"
    />
  </svg>
);

export default function StatsIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200); // Simulation synchro
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen text-white italic ml-72 selection:bg-blue-600/30">
      
      {/* HEADER : SYNTHÈSE SOUVERAINE */}
      <header className="flex justify-between items-end border-b border-white/5 pb-10 mb-12">
        <div>
          <div className="flex items-center gap-3 text-blue-500 mb-3 font-black uppercase tracking-[0.5em] text-[10px]">
            <Activity size={16} /> Business Intelligence Module
          </div>
          <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none">
            Stats <span className="text-blue-600">Intelligence</span>
          </h1>
        </div>
        <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl flex items-center gap-4 backdrop-blur-xl">
            <div className="text-right">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Période d&apos;analyse</p>
                <p className="text-xs font-black uppercase tracking-tight">Année Civile 2026</p>
            </div>
            <RefreshCcw size={20} className="text-blue-500 cursor-pointer hover:rotate-180 transition-all duration-700" />
        </div>
      </header>

      {/* ZONE 1 : KPI MAÎTRES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {[
          { label: 'Conformité SMI', val: '94.2%', trend: '+2.1%', icon: ShieldCheck, col: 'text-blue-500', trendCol: 'text-emerald-500' },
          { label: 'Couverture GPEC', val: '78.5%', trend: '+5.4%', icon: Target, col: 'text-purple-500', trendCol: 'text-emerald-500' },
          { label: 'Non-Conformités', val: '12', trend: '-15%', icon: AlertTriangle, col: 'text-red-500', trendCol: 'text-emerald-500' },
          { label: 'Efficacité Actions', val: '88%', trend: '-1.2%', icon: Zap, col: 'text-amber-500', trendCol: 'text-red-500' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[3rem] hover:border-white/20 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <kpi.icon className={kpi.col} size={28} />
                <div className={`flex items-center text-[10px] font-black ${kpi.trendCol}`}>
                    {kpi.trend.startsWith('+') ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {kpi.trend}
                </div>
            </div>
            <p className="text-5xl font-black italic tracking-tighter mb-1">{kpi.val}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">{kpi.label}</p>
            <div className="mt-6 pt-6 border-t border-white/5">
                <MiniChart color={kpi.col === 'text-blue-500' ? '#3b82f6' : kpi.col === 'text-red-500' ? '#ef4444' : '#f59e0b'} />
            </div>
          </div>
        ))}
      </div>

      {/* ZONE 2 : ANALYSE PROFONDE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Graphique 1 : Évolution des Performances */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 backdrop-blur-3xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-12">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none text-left">
                    Évolution <span className="text-blue-600">Performance Trimestrielle</span>
                </h3>
                <BarChart3 className="text-slate-700" size={24} />
            </div>
            
            <div className="h-64 flex items-end justify-between gap-4">
                {[45, 60, 85, 70, 95, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                        <div 
                          style={{ height: `${h}%` }} 
                          className="w-full bg-gradient-to-t from-blue-600/10 to-blue-600 rounded-2xl transition-all duration-1000 group-hover:scale-x-110 shadow-lg shadow-blue-900/20"
                        />
                        <span className="text-[9px] font-black uppercase text-slate-600">T{i+1}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Graphique 2 : Répartition des Risques */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 backdrop-blur-3xl flex flex-col">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-10 text-left">
                Statut <span className="text-blue-600">Actions</span>
            </h3>
            
            <div className="flex-1 flex items-center justify-center relative">
                <div className="w-48 h-48 rounded-full border-[16px] border-white/5 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-4xl font-black italic">342</p>
                        <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Total Actions</p>
                    </div>
                </div>
                {/* Overlay de couleur pour simuler un donut */}
                <div className="absolute inset-0 border-[16px] border-transparent border-t-blue-600 border-r-blue-400 rounded-full rotate-45 opacity-20" />
            </div>

            <div className="mt-10 space-y-4">
                {[
                  { label: 'Terminées', val: '72%', col: 'bg-blue-600' },
                  { label: 'En cours', val: '18%', col: 'bg-blue-400' },
                  { label: 'En retard', val: '10%', col: 'bg-red-500' }
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${item.col}`} />
                            <span className="text-[10px] font-black uppercase text-slate-300 italic">{item.label}</span>
                        </div>
                        <span className="text-[10px] font-black italic">{item.val}</span>
                    </div>
                ))}
            </div>
        </div>

      </div>

      {/* ZONE 3 : ALERTES CRITIQUES & GPEC */}
      <div className="mt-12 bg-white/5 border border-white/10 rounded-[3.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8 text-left">
              <div className="w-20 h-20 bg-amber-500/10 rounded-[2.5rem] flex items-center justify-center text-amber-500">
                  <AlertTriangle size={36} />
              </div>
              <div>
                  <h4 className="text-2xl font-black uppercase italic leading-none mb-2">Alerte <span className="text-amber-500">Efficacité GPEC</span></h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-tight italic">3 habilitations arrivent à expiration dans les 15 prochains jours.</p>
              </div>
          </div>
          <button className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all">
              Consulter le rapport détaillé
          </button>
      </div>

    </div>
  );
}