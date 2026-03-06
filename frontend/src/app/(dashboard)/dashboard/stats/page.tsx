/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🧠 MODULE : CENTRE DE COMMANDEMENT DÉCISIONNEL (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Agrégation multi-normes, matrice des risques et prédiction IA.
 * CONFORMITÉ : ISO 9001, 14001, 45001 (§9.1 Monitoring & Mesure).
 * DESIGN : ClickUp High-Density / 100dvh / Matrix Layout.
 * ---------------------------------------------------------------------------
 * DATE DE RÉVISION : 05 Mars 2026 | 22:15 GMT
 */

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, ShieldCheck, AlertTriangle, Target, Zap, 
  BarChart3, RefreshCcw, ArrowUpRight, ArrowDownRight, 
  Clock, FileText, Brain, AlertOctagon, CheckCircle2,
  ChevronRight, Download
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';
import StatsChart from './StatsChart';

// --- CONFIGURATION CHROMATIQUE MATRIX ---
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  grid: 'rgba(255, 255, 255, 0.05)'
};

export default function StatsIntelligencePage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [period]);

  // Données de simulation scellées (Structure API Réelle)
  const kpis = useMemo(() => [
    { label: 'Conformité SMI', value: 94.2, unit: '%', trend: 2.1, target: 95, history: [{ m: 'J', v: 89 }, { m: 'F', v: 91 }, { m: 'M', v: 94.2 }] },
    { label: 'Couverture GPEC', value: 78.5, unit: '%', trend: 5.4, target: 80, history: [{ m: 'J', v: 65 }, { m: 'F', v: 72 }, { m: 'M', v: 78.5 }] },
    { label: 'Résolution NC', value: 12, unit: 'j', trend: -15, target: 10, history: [{ m: 'J', v: 18 }, { m: 'F', v: 15 }, { m: 'M', v: 12 }] },
    { label: 'Efficacité SMI', value: 88, unit: '%', trend: -1.2, target: 90, history: [{ m: 'J', v: 85 }, { m: 'F', v: 90 }, { m: 'M', v: 88 }] }
  ], []);

  const handleExport = (format: string) => {
    toast.promise(new Promise(res => setTimeout(res, 1500)), {
      loading: `Génération du rapport ${format}...`,
      success: 'Exportation scellée et téléchargée.',
      error: 'Erreur de liaison Kernel.'
    });
  };

  if (loading) return <LoadingScreen label="Synchronisation du Cerveau Statistique..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 EN-TÊTE DE COMMANDEMENT */}
      <header className="shrink-0 p-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2">
          <div className="flex items-center gap-3 text-blue-500 text-[10px] tracking-[0.4em]">
            <Brain size={16} className="animate-pulse" /> Algorithme Neural v5.4
          </div>
          <h1 className="text-4xl lg:text-6xl tracking-tighter leading-none m-0">
            Intelligence <span className="text-blue-600">Statistique</span>
          </h1>
          <p className="text-slate-500 text-[9px] tracking-[0.3em] m-0">
            {"Indice Global : $$I_g = \\frac{\\sum KPI_i}{n} = 88.4\\%$$"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="bg-white/5 p-1.5 rounded-2xl flex gap-1 border border-white/5 shadow-inner">
            {['7d', '30d', '90d', '1y'].map((p) => (
              <button key={p} onClick={() => setPeriod(p as any)} className={cn("px-5 py-2.5 rounded-xl text-[9px] font-black transition-all border-none cursor-pointer", period === p ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-slate-500 hover:text-white')}>{p}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleExport('PDF')} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:text-blue-500 transition-colors cursor-pointer"><FileText size={20}/></button>
            <button onClick={() => handleExport('EXCEL')} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:text-emerald-500 transition-colors cursor-pointer"><Download size={20}/></button>
          </div>
        </div>
      </header>

      {/* 📊 VIEWPORT ANALYTIQUE (Isolated Scroll) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-400 mx-auto space-y-10">
          
          {/* GRID KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            {kpis.map((kpi, i) => (
              <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] group relative overflow-hidden shadow-2xl hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className={cn("p-4 rounded-2xl bg-black/40 border border-white/5", kpi.trend > 0 ? 'text-emerald-500' : 'text-rose-500')}>
                    {i === 0 ? <ShieldCheck size={28} /> : i === 1 ? <Target size={28} /> : i === 2 ? <Clock size={28} /> : <Zap size={28} />}
                  </div>
                  <div className={cn("flex items-center gap-1 text-[10px] px-3 py-1 rounded-full border", kpi.trend > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20')}>
                    {kpi.trend > 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {Math.abs(kpi.trend)}%
                  </div>
                </div>
                <div className="text-5xl font-black italic tracking-tighter leading-none mb-1">{kpi.value}<span className="text-xl text-slate-500 ml-2">{kpi.unit}</span></div>
                <div className="text-[10px] text-slate-500 tracking-widest mb-8">{kpi.label}</div>
                <div className="h-16 w-full opacity-40 group-hover:opacity-100 transition-opacity">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={kpi.history}><Area type="monotone" dataKey="v" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} strokeWidth={3} /></AreaChart>
                   </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>

          {/* CENTRE DE FLUX */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-slate-900/40 border border-white/5 rounded-[4rem] p-10 shadow-4xl h-125 flex flex-col">
               <h3 className="text-2xl font-black italic m-0 mb-10">Flux de Conformité <span className="text-blue-500">§9.1.3</span></h3>
               <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpis[0].history}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                      <XAxis dataKey="m" stroke="#475569" fontSize={10} fontStyle="italic" />
                      <YAxis stroke="#475569" fontSize={10} fontStyle="italic" />
                      <Tooltip contentStyle={{backgroundColor: '#0B0F1A', border: 'none', borderRadius: '20px', fontWeight: '900'}} />
                      <Line type="monotone" dataKey="v" stroke={COLORS.primary} strokeWidth={5} dot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-10 shadow-4xl h-125 flex flex-col text-left">
               <h3 className="text-2xl font-black italic m-0 mb-6 flex justify-between">Matrice Risques <AlertOctagon className="text-rose-600 animate-pulse"/></h3>
               <div className="bg-rose-600/10 border border-rose-600/20 p-6 rounded-3xl mb-8">
                  <p className="text-[9px] text-rose-500 tracking-widest mb-2 font-black">ALERTE CRITIQUE</p>
                  <p className="text-sm font-black m-0 leading-tight">3 Menaces majeures détectées par l&apos;algorithme.</p>
               </div>
               <div className="flex-1 min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                      <XAxis type="number" dataKey="x" domain={[0, 100]} hide />
                      <YAxis type="number" dataKey="y" domain={[0, 100]} hide />
                      <Scatter data={[{x: 70, y: 85}, {x: 40, y: 60}, {x: 20, y: 90}]} fill={COLORS.danger} />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 border border-white/5 flex items-center justify-center opacity-10 font-black text-6xl">ISO 31000</div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-10">
                <h3 className="text-2xl font-black italic m-0 mb-10 flex items-center gap-4"><CheckCircle2 className="text-emerald-500" /> Conformité Processus §4.4</h3>
                <div className="space-y-8 text-left">
                   {['Pilotage SMI', 'Ressources Humaines', 'Relation Client'].map((p, i) => (
                      <div key={i} className="space-y-3">
                         <div className="flex justify-between text-xs font-black italic uppercase"><span>{p}</span><span className="text-blue-500">92%</span></div>
                         <div className="h-3 bg-black/60 rounded-full border border-white/10 p-1"><div className="h-full bg-blue-600 rounded-full" style={{width: '92%'}} /></div>
                      </div>
                   ))}
                </div>
             </div>
             
             <div className="bg-blue-600/5 border-2 border-blue-500/20 rounded-[4rem] p-10 flex flex-col justify-between relative overflow-hidden">
                <Brain className="absolute -right-10 -bottom-10 opacity-10" size={250} />
                <div className="relative z-10 space-y-6 text-left">
                   <h3 className="text-2xl lg:text-3xl font-black italic m-0 flex items-center gap-4"><Zap className="text-blue-400" /> Insights Neuraux</h3>
                   <div className="bg-white/5 p-6 rounded-3xl border border-white/10 italic font-bold text-[11px] leading-relaxed">
                      DÉVIATION DÉTECTÉE SUR LE PROCESSUS CLIENT (-9%). RISQUE D&apos;ÉCART MAJEUR LORS DU PROCHAIN AUDIT AFNOR.
                   </div>
                   <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all shadow-xl">GÉNÉRER ACTION CORRECTIVE</button>
                </div>
             </div>
          </div>
        </div>
      </main>

      <footer className="shrink-0 bg-black/40 border-t border-white/5 p-6 flex items-center justify-between text-[9px] text-slate-500 tracking-widest">
        <span>© Qualisoft RD-2026 • Neural Core v4.2.1-stable</span>
        <span className="text-blue-500 font-black">MASTER SYNC : {new Date().toLocaleTimeString()}</span>
      </footer>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-600 italic font-black uppercase tracking-[0.5em]">
      <div className="relative"><RefreshCcw className="animate-spin" size={70} strokeWidth={1} /><Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse text-blue-400" size={30} /></div>
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}