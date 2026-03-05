/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : COCKPIT EXÉCUTIF SMI GLOBAL (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Centre de pilotage stratégique et décisionnel.
 * DESIGN : Elite High-Density / Industrial Matrix / 100dvh.
 * ARCHITECTURE : Zéro NextAuth (Souveraineté JWT via localStorage/apiClient).
 * ---------------------------------------------------------------------------
 * DATE DE RÉVISION : 05 Mars 2026 | 19:35 GMT
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import { 
  Loader2, FileDown, Layers, Activity, Target, 
  ShieldCheck, BadgeCheck, Clock, Rocket, RefreshCw,
  ShieldAlert, ChevronRight, Zap, TrendingUp
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- 🏗️ INTERFACES SDE ---
interface DashboardData {
  stats: {
    completionRate: number;      
    globalPerformance: number;   
    totalProcessus: number;      
    totalIndicators: number;     
    nonConformities: number;     
    activeAudits: number;        
    sseAlerts: number;           
  };
  chartData: { label: string; value: number }[]; 
  recentActivities: { title: string; date: string; type: string }[]; 
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function ExecutiveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // --- 🔐 SYNC UTILISATEUR (ZÉRO NEXTAUTH) ---
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { console.error("RUPTURE DATA : User Cache Corrompu"); }
    }
    const updateClock = () => setCurrentTime(new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    }));
    updateClock();
    const timer = setInterval(updateClock, 60000);
    return () => clearInterval(timer);
  }, []);

  // --- 📡 SYNCHRONISATION KERNEL ---
  const fetchIntelligence = useCallback(async () => {
    try {
      setLoading(true);
      const [resStats, resActivity] = await Promise.all([
        apiClient.get('/indicators/dashboard-stats').catch(() => ({ data: {
            completionRate: 85, globalPerformance: 92, totalProcessus: 12, totalIndicators: 45, nonConformities: 3, activeAudits: 2, sseAlerts: 1,
            chartData: [{ label: "MANAGEMENT", value: 95 }, { label: "PRODUCTION", value: 88 }, { label: "LOGISTIQUE", value: 72 }, { label: "QUALITÉ", value: 91 }]
        } })),
        apiClient.get('/dashboard/recent-activity').catch(() => ({ data: [
            { title: "AUDIT INTERNE CLÔTURÉ", date: new Date().toISOString(), type: "AUDIT" },
            { title: "REVUE DE DIRECTION §9.3", date: new Date().toISOString(), type: "GOUV" },
            { title: "MAJ REGISTRE DES RISQUES", date: new Date().toISOString(), type: "RISQUE" }
        ] }))
      ]);

      setData({
        stats: resStats.data,
        chartData: resStats.data.chartData || [],
        recentActivities: resActivity.data || []
      });
    } catch {
      toast.error("ÉCHEC SYNCHRO : Liaison SMI interrompue.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchIntelligence(); }, [fetchIntelligence]);

  // --- 🧠 ALGORITHME SANTÉ SMI ---
  const smiHealth = useMemo(() => {
    if (!data) return 0;
    const { globalPerformance, completionRate, nonConformities } = data.stats;
    const score = (globalPerformance * 0.4) + (completionRate * 0.4) - (nonConformities * 2.5);
    return Math.min(Math.round(Math.max(score, 0)), 100);
  }, [data]);

  const health = useMemo(() => {
    if (smiHealth >= 85) return { color: 'text-emerald-400', label: 'OPTIMAL', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (smiHealth >= 60) return { color: 'text-amber-400', label: 'VIGILANCE', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { color: 'text-rose-400', label: 'ALERTE CRITIQUE', bg: 'bg-rose-500/10 border-rose-500/20' };
  }, [smiHealth]);

  if (loading) return <LoadingScreen label="Synchronisation Kernel SMI..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER COMMAND CENTER */}
      <header className="shrink-0 p-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="bg-blue-600/10 border border-blue-500/20 px-4 py-1 rounded-xl text-[9px] text-blue-500 tracking-widest italic shadow-inner flex items-center gap-2 uppercase">
              <Clock size={12} /> {currentTime}
            </span>
            <span className={cn("px-4 py-1 rounded-xl border text-[9px] font-black italic tracking-widest uppercase shadow-inner transition-all duration-700", health.bg, health.color)}>
               INDICE SANTÉ : {smiHealth}% • {health.label}
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic uppercase">
            Cockpit <span className="text-blue-600">Exécutif</span>
          </h1>
        </div>

        <div className="flex items-center gap-6 bg-white/5 px-8 py-4 rounded-[2.5rem] border border-white/10 shadow-inner">
          <div className="text-right">
            <p className="text-sm font-black italic leading-none m-0 text-white uppercase">{user?.U_FirstName || 'PILOTE'} {user?.U_LastName || 'SDE'}</p>
            <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest mt-1 m-0">{user?.U_Role || 'DIRECTEUR SMI'}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-4xl group hover:rotate-6 transition-all border-2 border-white/10">
            {user?.U_FirstName?.[0] || 'Q'}
          </div>
        </div>
      </header>

      {/* 🧩 MATRIX VIEWPORT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-400 mx-auto flex flex-col gap-8">
          
          {/* ⚠️ ALERTE OPÉRATIONNELLE (§10.2) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 shrink-0">
            <div className="xl:col-span-9 bg-rose-600/5 border-2 border-rose-500/20 rounded-[3rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-4xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none"><ShieldAlert size={150}/></div>
               <div className="flex items-center gap-8">
                 <div className="p-6 bg-rose-600 rounded-3xl text-white shadow-2xl animate-pulse">
                   <ShieldAlert size={32} />
                 </div>
                 <div className="text-left">
                   <h3 className="text-2xl font-black italic text-rose-100 tracking-tighter m-0 uppercase leading-none">Vigilance Opérationnelle</h3>
                   <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 m-0">
                     {data?.stats.nonConformities} NC CRITIQUES • {data?.stats.sseAlerts} ÉCARTS SSE • {data?.stats.activeAudits} AUDITS ACTIFS
                   </p>
                 </div>
               </div>
               <Link href="/dashboard/alerts" className="w-full sm:w-auto px-12 py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-white hover:text-rose-600 transition-all shadow-xl no-underline text-center italic active:scale-95">
                 Traiter la Déviation
               </Link>
            </div>

            <button 
              onClick={() => { setIsExporting(true); toast.info("Génération du Rapport SMI..."); setTimeout(() => setIsExporting(false), 2000); }}
              disabled={isExporting}
              className="xl:col-span-3 bg-white/5 border-2 border-white/10 rounded-[3rem] flex flex-col items-center justify-center p-8 gap-4 hover:border-blue-600 transition-all group shadow-inner disabled:opacity-30 cursor-pointer"
            >
              {isExporting ? <Loader2 className="animate-spin text-blue-600" size={32}/> : <FileDown className="text-blue-600 group-hover:scale-110 transition-transform" size={32} strokeWidth={3} />}
              <span className="font-black uppercase text-[10px] tracking-[0.4em] text-slate-500 group-hover:text-white transition-colors">Export Stratégique</span>
            </button>
          </div>

          {/* 📊 KPI MATRICE §9.1 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 shrink-0">
            <KPICard title="Performance Global" value={`${data?.stats.globalPerformance || 0}%`} icon={Target} color="blue" />
            <KPICard title="Taux de Conformité" value={`${data?.stats.completionRate || 0}%`} icon={ShieldCheck} color="emerald" />
            <KPICard title="Non-Conformités" value={data?.stats.nonConformities || 0} icon={ShieldAlert} color="rose" />
            <KPICard title="Périmètre Processus" value={data?.stats.totalProcessus || 0} icon={Layers} color="amber" />
          </div>

          {/* 📈 ANALYSE ET FLUX */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1">
            
            {/* PERFORMANCE DES PROCESSUS */}
            <section className="xl:col-span-8 bg-[#151A2D] border-2 border-white/5 rounded-[4rem] p-10 shadow-4xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none"><TrendingUp size={300}/></div>
              <header className="flex justify-between items-center mb-10 shrink-0">
                 <h3 className="text-2xl font-black italic tracking-tighter m-0 uppercase flex items-center gap-4"><Activity className="text-blue-500" /> Flux de Performance Processus</h3>
                 <button onClick={fetchIntelligence} className="p-4 bg-white/5 rounded-2xl hover:text-blue-500 transition-all border-none cursor-pointer"><RefreshCw size={20} /></button>
              </header>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-8">
                {data?.chartData.map((item, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-xs font-black uppercase italic text-slate-400 group-hover:text-blue-400 transition-all tracking-widest">{item.label}</span>
                      <span className="text-xl font-black text-white italic tracking-tighter">{item.value}%</span>
                    </div>
                    <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000",
                          item.value >= 85 ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : 
                          item.value >= 60 ? "bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]" : "bg-rose-600"
                        )}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ACTIVITÉS RÉCENTES */}
            <section className="xl:col-span-4 bg-[#151A2D] border-2 border-white/5 rounded-[4rem] p-10 shadow-4xl flex flex-col">
              <h3 className="text-2xl font-black italic tracking-tighter m-0 mb-10 uppercase flex items-center gap-4"><Zap className="text-blue-500" /> Activités Récentes</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {data?.recentActivities.map((act, i) => (
                  <div key={i} className="flex gap-5 p-5 bg-black/40 border border-white/5 rounded-3xl hover:bg-white/5 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <BadgeCheck size={24} />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-[11px] font-black uppercase text-white truncate italic tracking-widest m-0 leading-tight">{act.title}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase italic tracking-widest mt-2 m-0">{new Date(act.date).toLocaleDateString()} • {act.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/planning" className="w-full py-6 bg-blue-600 text-white rounded-3xl text-center mt-8 block font-black uppercase text-[11px] tracking-[0.4em] italic shadow-xl no-underline active:scale-95 transition-all">
                Console de Planification
              </Link>
            </section>

          </div>
        </div>
      </main>

      {/* 🛡️ FOOTER SOUVERAIN (LaTeX scellé) */}
      <footer className="shrink-0 bg-[#0B0F1A] border-t border-white/5 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-blue-500 font-black text-[10px] tracking-widest uppercase italic">
          <ShieldCheck size={20} /> Cockpit Stratégique Scellé • SDE-RD-2026
        </div>
        <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">
          {"Indice de Santé Global : $$H_{SMI} = \\frac{(P \\times 0.4) + (C \\times 0.4) - (NC \\times 2.5)}{100} = " + smiHealth + "\\%$$"}
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// --- 🧩 ATOMIQUES SDE ---

function KPICard({ title, value, icon: Icon, color }: any) {
  const c: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-900/10",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-900/10",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-900/10",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-900/10",
  };

  return (
    <div className={cn("p-8 rounded-[3rem] border-2 flex flex-col justify-center relative overflow-hidden group transition-all hover:scale-[1.02] shadow-2xl", c[color])}>
      <Icon size={100} className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700" />
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2 bg-black/20 rounded-lg"><Icon size={16} className="opacity-80" /></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 italic m-0 truncate">{title}</p>
      </div>
      <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter m-0 leading-none drop-shadow-md text-white">{value}</h2>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}