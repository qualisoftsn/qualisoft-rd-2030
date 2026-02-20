/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : COCKPIT EXÉCUTIF SMI GLOBAL
 * -------------------------------------------------------------------------
 * RÔLE : Centre de commandement et de pilotage stratégique du SMI.
 * FONCTION : Agrégation multi-sources (NC, SSE, Audits, Indicateurs).
 * LOGIQUE : Moteur de score prédictif Indice SMI (§9.1.3 ISO 9001).
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import { 
  Loader2, FileDown, Sparkles, Layers, Activity, Target, 
  ShieldCheck, TrendingUp, TrendingDown, BadgeCheck, Crown, CalendarCheck,
  AlertTriangle, Clock, FileText, Rocket, ChevronRight, 
  ArrowDown, ArrowUp, RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

// --- INTERFACES STRUCTURELLES DU SMI ---
interface DashboardData {
  stats: {
    completionRate: number;      // Taux de réalisation des exigences
    globalPerformance: number;   // Performance moyenne des indicateurs (%)
    totalProcessus: number;      // Nombre de processus cartographiés
    totalIndicators: number;     // Volume total des KPIs pilotés
    nonConformities: number;     // Volume de NC ouvertes à traiter
    activeAudits: number;        // Audits en cours de réalisation
    sseAlerts: number;           // Alertes SSE critiques non traitées
  };
  chartData: { label: string; value: number }[]; // Données pour les barres de flux
  recentActivities: { title: string; date: string; type: string }[]; // Historique récent
}

export default function ExecutiveDashboard() {
  // --- ÉTATS SOUVERAINS ---
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  /**
   * 🛠️ INITIALISATION & AUTHENTIFICATION
   * Charge le profil utilisateur depuis le stockage local et initialise l'horloge système.
   */
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Erreur de parsing utilisateur");
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
   * 📡 SYNCHRONISATION MULTI-MODULES
   * Interroge le noyau Qualisoft pour récupérer l'intelligence agrégée.
   * Centralise les données PAQ, SSE, AUDIT et NC.
   */
  const fetchGlobalIntelligence = useCallback(async () => {
    try {
      setLoading(true);
      const [resStats, resActivity] = await Promise.all([
        apiClient.get('/indicators/dashboard-stats'),
        apiClient.get('/dashboard/recent-activity')
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
    if (user) fetchGlobalIntelligence();
  }, [user, fetchGlobalIntelligence]);

  /**
   * 🧠 MOTEUR DÉCISIONNEL (SCORE SMI)
   * Calcule un score de santé pondéré basé sur la performance et la conformité.
   * La formule mathématique est scellée pour l'audit :
   * $$Score = (Perf \times 0.4) + (Conf \times 0.4) - (NC \times 2)$$
   */
  const smiHealth = useMemo(() => {
    if (!data) return 0;
    const { globalPerformance, completionRate, nonConformities } = data.stats;
    const score = (globalPerformance * 0.4) + (completionRate * 0.4) - (nonConformities * 2);
    return Math.min(Math.round(Math.max(score, 0)), 100);
  }, [data]);

  /**
   * 🎨 GESTIONNAIRE DE MÉTA-ÉCHELLE
   * Détermine l'aspect visuel en fonction de l'Indice SMI.
   */
  const getHealthMeta = (score: number) => {
    if (score >= 85) return { color: 'text-emerald-400', label: 'OPTIMAL', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { color: 'text-amber-400', label: 'VIGILANCE', bg: 'bg-amber-500/10' };
    return { color: 'text-rose-400', label: 'ALERTE CRITIQUE', bg: 'bg-rose-500/10' };
  };

  const health = getHealthMeta(smiHealth);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0B0F1A]">
      <div className="text-center space-y-6">
        <Loader2 className="animate-spin text-blue-500 mx-auto" size={60} />
        <p className="text-[10px] font-black uppercase text-white tracking-[0.6em] animate-pulse italic">Synchronisation Souveraine du SMI...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6 lg:p-10 italic font-sans selection:bg-blue-600/30 text-left">
      
      {/* 🔝 HEADER SOUVERAIN : IDENTITÉ ET SANTÉ GLOBALE */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 italic">
              <Clock size={14} /> {currentTime}
            </span>
            <span className={`px-5 py-2 rounded-full ${health.bg} ${health.color} text-[10px] font-black uppercase tracking-widest border border-current shadow-2xl shadow-current/10`}>
               INDICE SANTÉ SMI : {smiHealth}% • {health.label}
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none">
            COCKPIT <span className="text-blue-500">EXÉCUTIF</span>
          </h1>
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] opacity-80 italic">Qualisoft SMI Core Protocol 2026 • {user?.U_TenantName || 'INSTANCE MASTER'}</p>
        </div>

        <div className="flex items-center gap-6 group">
          <div className="text-right hidden lg:block">
            <p className="text-xl font-black uppercase italic leading-none group-hover:text-blue-500 transition-colors">{user?.U_FirstName} {user?.U_LastName}</p>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center justify-end gap-2">
              {user?.U_Role || 'Administrateur'} <BadgeCheck size={14} className="text-blue-500" />
            </p>
          </div>
          <div className="w-24 h-24 rounded-[3rem] bg-linear-to-br from-blue-600 to-blue-950 border-4 border-white/5 flex items-center justify-center text-4xl font-black shadow-[0_20px_50px_rgba(37,99,235,0.2)] group-hover:scale-105 transition-transform">
            {user?.U_FirstName?.[0] || 'A'}{user?.U_LastName?.[0] || 'U'}
          </div>
        </div>
      </header>

      {/* ⚠️ BARRE D'ALERTE GÉNÉRALE : DÉVIATIONS ET RISQUES (§10.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-9 bg-linear-to-r from-rose-600/20 to-amber-600/5 border border-rose-500/30 rounded-[4rem] p-10 flex flex-col md:flex-row items-center justify-between backdrop-blur-3xl gap-6">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-rose-600/20 rounded-4xl flex items-center justify-center shadow-inner border border-rose-500/20">
              <ShieldAlert className="text-rose-500 animate-pulse" size={40} />
            </div>
            <div className="text-left">
              <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">Vigilance Opérationnelle</h3>
              <p className="text-rose-200/60 text-[11px] font-black uppercase tracking-widest mt-2 italic leading-relaxed">
                {data?.stats.nonConformities} NC CRITIQUES • {data?.stats.sseAlerts} ÉCARTS SSE • {data?.stats.activeAudits} AUDITS EN COURS
              </p>
            </div>
          </div>
          <Link href="/dashboard/alerts" className="px-12 py-5 bg-rose-600 text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] hover:bg-white hover:text-rose-600 transition-all shadow-2xl active:scale-95 italic">
            Intervenir
          </Link>
        </div>

        <div className="lg:col-span-3">
          <button 
            onClick={() => setIsExporting(true)}
            className="w-full h-full bg-white/5 border border-white/10 rounded-[4rem] flex flex-col items-center justify-center gap-4 hover:bg-blue-600 hover:border-blue-500 transition-all group shadow-2xl border-none cursor-pointer"
          >
            <FileDown className="group-hover:scale-125 transition-transform text-blue-500 group-hover:text-white" size={32} />
            <span className="font-black uppercase text-[11px] tracking-[0.3em] italic">Rapport Exécutif</span>
          </button>
        </div>
      </div>

      {/* 📊 MATRICE KPI : PILOTAGE DE LA PERFORMANCE (§9.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <KPICard 
          title="Performance" value={`${data?.stats.globalPerformance || 0}%`} 
          icon={Target} color="blue" subtitle="Index Moyenne Indicateurs"
        />
        <KPICard 
          title="Conformité" value={`${data?.stats.completionRate || 0}%`} 
          icon={ShieldCheck} color="emerald" subtitle="Respect des Exigences"
        />
        <KPICard 
          title="Actions PAQ" value={data?.stats.nonConformities || 0} 
          icon={Rocket} color="amber" subtitle="Déviations à traiter"
        />
        <KPICard 
          title="Architecture" value={data?.stats.totalProcessus || 0} 
          icon={Layers} color="purple" subtitle="Cartographie Active"
        />
      </div>

      {/* 📈 ANALYSE DE FLUX ET ACTIVITÉS (§9.3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* FLUX DE PERFORMANCE PAR PROCESSUS */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-[4.5rem] p-12 shadow-4xl relative overflow-hidden backdrop-blur-md">
          <div className="flex justify-between items-end mb-12">
            <div className="text-left">
              <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">Flux de Performance</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3 italic leading-none">Analyse Comparative vs Cibles ISO</p>
            </div>
            <button onClick={fetchGlobalIntelligence} className="p-4 bg-white/5 rounded-2xl hover:text-blue-500 transition-all border-none cursor-pointer">
              <RefreshCw size={24} className="hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          <div className="space-y-10 max-h-140 overflow-y-auto pr-6 custom-scrollbar text-left">
            {data?.chartData.map((item, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-sm font-black uppercase italic text-slate-300 group-hover:text-blue-500 transition-colors tracking-tight">{item.label}</span>
                  <span className="text-2xl font-black text-white italic tracking-tighter">{item.value}%</span>
                </div>
                <div className="h-4 w-full bg-slate-950/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div 
                    className={`h-full bg-linear-to-r transition-all duration-1000 ease-out ${
                      item.value >= 85 ? 'from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 
                      item.value >= 60 ? 'from-blue-600 to-blue-400' : 'from-rose-600 to-rose-400'
                    }`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FLUX D'ACTIVITÉS RECENTES SMI (§10.3) */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[4.5rem] p-12 shadow-4xl text-left backdrop-blur-md">
          <h3 className="text-2xl font-black uppercase italic text-white mb-10 flex items-center gap-4 tracking-tighter leading-none">
            <Activity className="text-blue-500" /> Flux d&apos;Activités
          </h3>
          <div className="space-y-6">
            {data?.recentActivities.map((act, i) => (
              <div key={i} className="flex gap-5 p-6 rounded-4xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-blue-500/20 transition-all group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner`}>
                  <BadgeCheck size={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-black uppercase text-white truncate italic tracking-tighter group-hover:text-blue-400 transition-colors leading-none">{act.title}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-2 italic tracking-[0.2em]">{new Date(act.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Link href="/dashboard/audit/planning" className="w-full py-6 bg-white/5 rounded-4xl text-center mt-12 block font-black uppercase text-[10px] tracking-[0.4em] italic hover:bg-white hover:text-slate-950 transition-all shadow-2xl no-underline">
            Voir le Planning Global
          </Link>
        </div>
      </div>

      {/* 🧪 INJECTION CSS SOUVERAIN */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.3); }
      `}</style>
    </div>
  );
}

// --- SOUS-COMPOSANTS TACTIQUES ---

/**
 * 🏷️ COMPOSANT : CARTE KPI SOUVERAINE
 * Affiche une métrique clé avec son icône, sa valeur et son segment de performance.
 */
function KPICard({ title, value, icon: Icon, color, subtitle }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/5 border-blue-500/20 shadow-blue-500/10",
    emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/10",
    amber: "text-amber-500 bg-amber-500/5 border-amber-500/20 shadow-amber-500/10",
    purple: "text-purple-500 bg-purple-500/5 border-purple-500/20 shadow-purple-500/10",
  };

  return (
    <div className={`p-10 bg-slate-900/40 border rounded-[4rem] shadow-4xl relative overflow-hidden group hover:-translate-y-3 transition-all duration-500 ${colors[color]}`}>
      <div className={`absolute -right-6 -bottom-6 opacity-5 rotate-12 group-hover:scale-125 transition-transform duration-700`}>
        <Icon size={180} />
      </div>
      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 border transition-all duration-500 group-hover:rotate-6 bg-black/40 ${colors[color]}`}>
        <Icon size={32} />
      </div>
      <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] mb-3 italic leading-none">{title}</p>
      <h2 className="text-6xl font-black text-white italic tracking-tighter leading-none mb-6 drop-shadow-2xl">{value}</h2>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">{subtitle}</p>
    </div>
  );
}