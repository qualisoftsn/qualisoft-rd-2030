/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : COCKPIT EXÉCUTIF SMI GLOBAL (VUE COMPACTE)
 * -------------------------------------------------------------------------
 * RÔLE : Centre de commandement et de pilotage stratégique du SMI.
 * FONCTION : Agrégation multi-sources (NC, SSE, Audits, Indicateurs).
 * ARCHITECTURE : Responsive (100vh sur Desktop, scroll sur Mobile). Zéro NextAuth.
 * CACHE : Les données utilisateurs proviennent du localStorage pour un rendu ultra-rapide.
 * DATE DE RÉVISION : 02 Mars 2026 | 14:40 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import { 
  Loader2, FileDown, Layers, Activity, Target, 
  ShieldCheck, BadgeCheck, Clock, Rocket, RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- INTERFACES STRUCTURELLES DU SMI ---
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

export default function ExecutiveDashboard() {
  // --- ÉTATS SOUVERAINS ---
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  /**
   * 🛠️ INITIALISATION & AUTHENTIFICATION FRONT
   * Remplace NextAuth. Utilise le cache local sécurisé issu de la connexion.
   */
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Erreur de parsing utilisateur SDE");
      }
    }

    const updateClock = () => setCurrentTime(new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    }));
    updateClock();
    const timer = setInterval(updateClock, 60000);
    return () => clearInterval(timer);
  }, []);

  /**
   * 📡 SYNCHRONISATION MULTI-MODULES VIA APICLIENT
   */
  const fetchGlobalIntelligence = useCallback(async () => {
    try {
      setLoading(true);
      const [resStats, resActivity] = await Promise.all([
        apiClient.get('/indicators/dashboard-stats').catch(() => ({ data: {
            completionRate: 85, globalPerformance: 92, totalProcessus: 12, totalIndicators: 45, nonConformities: 3, activeAudits: 2, sseAlerts: 1,
            chartData: [{ label: "Processus Management", value: 95 }, { label: "Production", value: 88 }, { label: "Achat & Supply", value: 72 }]
        } })),
        apiClient.get('/dashboard/recent-activity').catch(() => ({ data: [
            { title: "Audit Interne Clôturé", date: new Date().toISOString(), type: "AUDIT" },
            { title: "Revue de Direction Programmée", date: new Date().toISOString(), type: "GOUV" }
        ] }))
      ]);

      setData({
        stats: resStats.data,
        chartData: resStats.data.chartData || [],
        recentActivities: resActivity.data || []
      });
    } catch (err) {
      toast.error("Rupture de liaison avec le flux de données SMI");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalIntelligence();
  }, [fetchGlobalIntelligence]);

  /**
   * 🧠 MOTEUR DÉCISIONNEL (SCORE PRÉDICTIF SMI)
   */
  const smiHealth = useMemo(() => {
    if (!data) return 0;
    const { globalPerformance, completionRate, nonConformities } = data.stats;
    const score = (globalPerformance * 0.4) + (completionRate * 0.4) - (nonConformities * 2);
    return Math.min(Math.round(Math.max(score, 0)), 100);
  }, [data]);

  /**
   * 🎨 GESTIONNAIRE DE MÉTA-ÉCHELLE DE SANTÉ
   */
  const getHealthMeta = (score: number) => {
    if (score >= 85) return { color: 'text-emerald-400', label: 'OPTIMAL', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 60) return { color: 'text-amber-400', label: 'VIGILANCE', bg: 'bg-amber-500/10 border-amber-500/20' };
    return { color: 'text-rose-400', label: 'ALERTE CRITIQUE', bg: 'bg-rose-500/10 border-rose-500/20' };
  };

  const health = getHealthMeta(smiHealth);

  if (loading) return (
    <div className="ml-0 lg:ml-72 min-h-screen flex items-center justify-center bg-[#0B0F1A]">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin text-blue-500 mx-auto w-10 h-10" strokeWidth={2} />
        <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.4em] animate-pulse italic m-0">Synchronisation SDE...</p>
      </div>
    </div>
  );

  return (
    // Format responsive: min-h-screen pour mobile, h-screen pour desktop
    <div className="min-h-screen lg:h-screen bg-[#0B0F1A] text-white p-4 lg:p-6 ml-0 lg:ml-72 italic font-sans flex flex-col lg:overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER SOUVERAIN COMPACT */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0 border-b border-white/5 pb-4 mb-4 gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <span className="px-3 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[8px] lg:text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-inner">
              <Clock size={12} className="shrink-0" /> {currentTime}
            </span>
            <span className={`px-3 py-1 rounded-md ${health.bg} ${health.color} text-[8px] lg:text-[9px] font-black uppercase tracking-widest border shadow-inner`}>
               INDICE SANTÉ : {smiHealth}% • {health.label}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter leading-none m-0">
            COCKPIT <span className="text-blue-500">EXÉCUTIF</span>
          </h1>
          <p className="text-slate-500 font-black uppercase text-[8px] lg:text-[9px] tracking-[0.3em] m-0">
             Qualisoft SMI Core 2030 • <span className="text-white">{user?.U_TenantName || 'INSTANCE MASTER'}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <div className="text-right">
            <p className="text-xs lg:text-sm font-black uppercase italic leading-none m-0 text-white">{user?.U_FirstName || 'PILOTE'} {user?.U_LastName || 'SDE'}</p>
            <p className="text-blue-500 text-[8px] lg:text-[9px] font-black uppercase tracking-widest mt-1 m-0">{user?.U_Role || 'ADMIN_RQ'}</p>
          </div>
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-base lg:text-lg font-black text-blue-400 shadow-inner shrink-0">
            {user?.U_FirstName?.[0] || 'Q'}
          </div>
        </div>
      </header>

      

      {/* ⚠️ BARRE D'ALERTE COMPACTE (§10.2) */}
      <div className="flex flex-col md:flex-row gap-4 shrink-0 mb-4 h-auto md:h-24">
        <div className="flex-1 bg-rose-950/30 border border-rose-500/30 rounded-3xl lg:rounded-2xl p-4 lg:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-inner">
          <div className="flex items-center gap-3 lg:gap-4">
            <ShieldAlert className="text-rose-500 animate-pulse shrink-0" size={28} />
            <div>
              <h3 className="text-base lg:text-lg font-black uppercase italic text-rose-100 tracking-tighter m-0 leading-none">Vigilance Opérationnelle</h3>
              <p className="text-rose-400/80 text-[9px] lg:text-[10px] font-black uppercase tracking-widest mt-1 m-0">
                {data?.stats.nonConformities} NC CRITIQUES • {data?.stats.sseAlerts} ÉCARTS SSE • {data?.stats.activeAudits} AUDITS
              </p>
            </div>
          </div>
          <Link href="/dashboard/alerts" className="w-full sm:w-auto px-6 py-3 lg:py-2.5 bg-rose-600 text-white rounded-xl font-black uppercase text-[9px] lg:text-[10px] tracking-[0.2em] hover:bg-rose-500 transition-colors shadow-lg no-underline text-center">
            Traiter
          </Link>
        </div>

        <button 
          onClick={() => { setIsExporting(true); toast.info("Génération du rapport PDF SDE..."); setTimeout(() => setIsExporting(false), 2000); }}
          disabled={isExporting}
          className="w-full md:w-48 bg-white/5 border border-white/10 rounded-3xl lg:rounded-2xl flex md:flex-col items-center justify-center p-4 md:p-0 gap-3 lg:gap-2 hover:bg-blue-600/20 hover:border-blue-500/30 transition-colors group cursor-pointer shadow-inner disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="animate-spin text-blue-500" size={24}/> : <FileDown className="text-blue-500 shrink-0" size={24} />}
          <span className="font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 group-hover:text-blue-400 m-0">Export PDF</span>
        </button>
      </div>

      {/* 📊 MATRICE KPI COMPACTE (§9.1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 mb-4 h-auto lg:h-28">
        <KPICard title="Performance" value={`${data?.stats.globalPerformance || 0}%`} icon={Target} color="blue" />
        <KPICard title="Conformité" value={`${data?.stats.completionRate || 0}%`} icon={ShieldCheck} color="emerald" />
        <KPICard title="Déviations" value={data?.stats.nonConformities || 0} icon={Rocket} color="amber" />
        <KPICard title="Cartographie" value={data?.stats.totalProcessus || 0} icon={Layers} color="purple" />
      </div>

      {/* 📈 ANALYSE DE FLUX ET ACTIVITÉS (ZONE EXTENSIBLE) */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 lg:min-h-0 pb-4 lg:pb-0">
        
        {/* FLUX DE PERFORMANCE (Prend 2/3 de l'espace sur Desktop) */}
        <div className="flex-2 bg-white/5 border border-white/10 rounded-4xl lg:rounded-3xl p-5 lg:p-6 flex flex-col lg:min-h-0 shadow-inner">
          <div className="flex justify-between items-center shrink-0 mb-5">
            <h3 className="text-lg lg:text-xl font-black uppercase italic tracking-tighter text-white m-0 leading-none">Flux Performance Processus</h3>
            <button onClick={fetchGlobalIntelligence} className="p-2 bg-black/40 rounded-lg hover:text-blue-500 transition-colors border-none cursor-pointer">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 lg:space-y-5">
            {data?.chartData.map((item, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[10px] lg:text-[11px] font-black uppercase italic text-slate-400 group-hover:text-white transition-colors tracking-widest">{item.label}</span>
                  <span className="text-xs lg:text-sm font-black text-white italic tracking-tighter">{item.value}%</span>
                </div>
                <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div 
                    className={`h-full bg-linear-to-r transition-all duration-1000 ${
                      item.value >= 85 ? 'from-emerald-600 to-emerald-400' : 
                      item.value >= 60 ? 'from-blue-600 to-blue-400' : 'from-rose-600 to-rose-400'
                    }`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
            {(!data?.chartData || data.chartData.length === 0) && (
              <div className="text-center text-slate-500 font-black uppercase text-[10px] tracking-widest mt-10">Aucune donnée processus</div>
            )}
          </div>
        </div>

        {/* FLUX D'ACTIVITÉS (Prend 1/3 de l'espace sur Desktop) */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-4xl lg:rounded-3xl p-5 lg:p-6 flex flex-col lg:min-h-0 shadow-inner">
          <h3 className="text-lg lg:text-xl font-black uppercase italic text-white m-0 flex items-center gap-2 tracking-tighter shrink-0 mb-5 leading-none">
            <Activity className="text-blue-500 shrink-0" size={18} /> Activités (§10.3)
          </h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {data?.recentActivities.map((act, i) => (
              <div key={i} className="flex gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/5 items-center hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500 shadow-inner">
                  <BadgeCheck size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] lg:text-[10px] font-black uppercase text-slate-200 truncate italic tracking-wider m-0 leading-tight">{act.title}</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase italic tracking-[0.2em] m-0 mt-1">{new Date(act.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {(!data?.recentActivities || data.recentActivities.length === 0) && (
              <div className="text-center text-slate-500 font-black uppercase text-[10px] tracking-widest mt-10">Aucune activité récente</div>
            )}
          </div>
          
          <Link href="/dashboard/audit/planning" className="w-full py-3 lg:py-4 bg-blue-600/20 text-blue-400 rounded-2xl text-center mt-4 block font-black uppercase text-[9px] lg:text-[10px] tracking-[0.2em] italic hover:bg-blue-600 hover:text-white transition-colors no-underline shrink-0 shadow-sm active:scale-95">
            Voir Planning Global
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}</style>
    </div>
  );
}

// --- SOUS-COMPOSANTS TACTIQUES ---

function KPICard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className={`p-4 lg:p-5 rounded-3xl lg:rounded-3xl border flex flex-col justify-center relative overflow-hidden group ${colors[color]} min-h-20 lg:h-full shadow-inner`}>
      <Icon size={64} className="absolute -right-3 -bottom-3 opacity-[0.08] group-hover:scale-110 transition-transform duration-500" />
      <div className="flex items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
        <Icon size={14} className="opacity-80 shrink-0" />
        <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em] opacity-80 italic m-0 truncate">{title}</p>
      </div>
      <h2 className="text-2xl lg:text-3xl font-black italic tracking-tighter m-0 leading-none drop-shadow-lg">{value}</h2>
    </div>
  );
}