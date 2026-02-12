/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

// --- INTERFACES ALIGNÉES SMI ---
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
  chartData: any[];
  recentActivities: any[];
}

export default function ExecutiveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // 1. INITIALISATION & AUTH
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    const updateClock = () => setCurrentTime(new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    }));
    updateClock();
    const timer = setInterval(updateClock, 60000);
    return () => clearInterval(timer);
  }, []);

  // 2. SYNCHRONISATION MULTI-MODULES (PAQ + SSE + AUDIT + NC)
  const fetchGlobalIntelligence = useCallback(async () => {
    try {
      setLoading(true);
      // Appel vers une route agrégée ou plusieurs routes parallèles
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
      toast.error("Rupture de liaison avec le flux SMI");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchGlobalIntelligence();
  }, [user, fetchGlobalIntelligence]);

  // 3. LOGIQUE DÉCISIONNELLE (SCORE SMI)
  const smiHealth = useMemo(() => {
    if (!data) return 0;
    const { globalPerformance, completionRate, nonConformities } = data.stats;
    // Score pondéré : 40% Perf, 40% Conformité, -2% par NC ouverte
    const score = (globalPerformance * 0.4) + (completionRate * 0.4) - (nonConformities * 2);
    return Math.min(Math.round(Math.max(score, 0)), 100);
  }, [data]);

  const getHealthMeta = (score: number) => {
    if (score >= 85) return { color: 'text-emerald-400', label: 'OPTIMAL', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { color: 'text-amber-400', label: 'VIGILANCE', bg: 'bg-amber-500/10' };
    return { color: 'text-rose-400', label: 'ALERTE CRITIQUE', bg: 'bg-rose-500/10' };
  };

  const health = getHealthMeta(smiHealth);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0B0F1A]">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin text-blue-500 mx-auto" size={50} />
        <p className="text-[10px] font-black uppercase text-white tracking-[0.5em] animate-pulse">Synchronisation Souveraine...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-6 lg:p-10 italic font-sans selection:bg-blue-600/30">
      
      {/* 🔝 HEADER SOUVERAIN */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Clock size={12} /> {currentTime}
            </span>
            <span className={`px-4 py-1.5 rounded-full ${health.bg} ${health.color} text-[10px] font-black uppercase tracking-widest border border-current opacity-80`}>
               INDICE SMI : {smiHealth}% • {health.label}
            </span>
          </div>
          <h1 className="text-4xl lg:text-4xl font-black uppercase italic tracking-tighter leading-none">
            COCKPIT <span className="text-blue-500">EXÉCUTIF</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] opacity-60">SMI Core Protocol 2030 • {user?.U_TenantName}</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden lg:block">
            <p className="text-lg font-black uppercase italic leading-none">{user?.U_FirstName} {user?.U_LastName}</p>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center justify-end gap-2">
              {user?.U_Role} <BadgeCheck size={14} />
            </p>
          </div>
          <div className="w-20 h-20 rounded-[2.5rem] bg-linear-to-br from-blue-600 to-blue-900 border-4 border-white/5 flex items-center justify-center text-3xl font-black shadow-2xl">
            {user?.U_FirstName?.[0]}{user?.U_LastName?.[0]}
          </div>
        </div>
      </header>

      {/* ⚠️ BARRE D'ALERTE GÉNÉRALE (SSE + NC + AUDITS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        <div className="lg:col-span-9 bg-linear-to-r from-rose-500/20 to-amber-500/10 border border-rose-500/30 rounded-[3rem] p-8 flex items-center justify-between backdrop-blur-xl group">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-rose-500/20 rounded-3xl flex items-center justify-center animate-pulse">
              <ShieldAlert className="text-rose-500" size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">Vigilance Opérationnelle</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                {data?.stats.nonConformities} NC à traiter • {data?.stats.sseAlerts} Alertes Sécurité • {data?.stats.activeAudits} Audits en cours
              </p>
            </div>
          </div>
          <Link href="/dashboard/alerts" className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-rose-600 transition-all shadow-xl">
            Intervenir
          </Link>
        </div>

        <div className="lg:col-span-3">
          <button 
            onClick={() => setIsExporting(true)}
            className="w-full h-full bg-white/5 border border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-3 hover:bg-blue-600 transition-all group"
          >
            <FileDown className="group-hover:scale-125 transition-transform" />
            <span className="font-black uppercase text-[10px] tracking-widest">Rapport Exécutif</span>
          </button>
        </div>
      </div>

      {/* 📊 KPI CARDS DYNAMIQUES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <KPICard 
          title="Performance" value={`${data?.stats.globalPerformance || 0}%`} 
          icon={Target} color="blue" subtitle="Moyenne Indicateurs"
        />
        <KPICard 
          title="Conformité" value={`${data?.stats.completionRate || 0}%`} 
          icon={ShieldCheck} color="emerald" subtitle="Statut des Exigences"
        />
        <KPICard 
          title="Actions PAQ" value={data?.stats.nonConformities || 0} 
          icon={Rocket} color="amber" subtitle="Retards détectés"
        />
        <KPICard 
          title="Processus" value={data?.stats.totalProcessus || 0} 
          icon={Layers} color="purple" subtitle="Cartographie Active"
        />
      </div>

      {/* 📈 GRAPHIQUE & FLUX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Analyse de Performance */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-[4rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Flux de Performance</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Réalisation vs Cibles</p>
            </div>
            <button onClick={fetchGlobalIntelligence} className="p-3 bg-white/5 rounded-xl hover:text-blue-500 transition-colors">
              <RefreshCw size={20} />
            </button>
          </div>

          <div className="space-y-8 max-h-125 overflow-y-auto pr-4 custom-scrollbar">
            {data?.chartData.map((item, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-black uppercase italic text-slate-300 group-hover:text-blue-400 transition-colors">{item.label}</span>
                  <span className="text-xl font-black text-white">{item.value}%</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full bg-linear-to-r transition-all duration-1000 ${
                      item.value >= 80 ? 'from-emerald-600 to-emerald-400 shadow-[0_0_15px_#10b981]' : 'from-blue-600 to-blue-400'
                    }`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dernières Activités SMI */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-10 shadow-2xl">
          <h3 className="text-xl font-black uppercase italic text-white mb-8 flex items-center gap-3">
            <Activity className="text-blue-500" /> Flux d&apos;Activités
          </h3>
          <div className="space-y-6">
            {data?.recentActivities.map((act, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-3xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500`}>
                  <BadgeCheck size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase text-white truncate">{act.title}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 italic">{new Date(act.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Link href="/dashboard/audit/planning" className="w-full py-5 bg-white/5 rounded-3xl text-center mt-10 block font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-slate-900 transition-all">
            Voir le Planning Global
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function KPICard({ title, value, icon: Icon, color, subtitle }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-purple-500/5",
  };

  return (
    <div className={`p-10 bg-slate-900/40 border rounded-[3.5rem] shadow-2xl relative overflow-hidden group hover:-translate-y-2 transition-all ${colors[color]}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border-2 transition-transform group-hover:scale-110 ${colors[color]}`}>
        <Icon size={28} />
      </div>
      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 italic">{title}</p>
      <h2 className="text-5xl font-black text-white italic tracking-tighter leading-none mb-4">{value}</h2>
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">{subtitle}</p>
    </div>
  );
}