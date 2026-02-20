/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import type { LucideIcon } from 'lucide-react';
import { 
  Loader2, 
  FileDown, Sparkles, Layers, Activity, Target, 
  ShieldCheck, TrendingUp, TrendingDown, BadgeCheck, Crown, CalendarCheck,
  AlertTriangle, Clock, 
  FileText,
  Rocket, 
  ChevronRight, 
  ArrowDown, ArrowUp
} from 'lucide-react';

/**
 * -------------------------------------------------------------------------
 * 🛰️ MODULE : COCKPIT OBSERVATEUR (EXECUTIVE DASHBOARD)
 * -------------------------------------------------------------------------
 * RÔLE : 
 * Instance de surveillance macroscopique du SMI. Permet de transformer 
 * la donnée brute en information décisionnelle pour la Direction.
 * -------------------------------------------------------------------------
 */

// --- DÉFINITIONS DES INTERFACES ---

interface DashboardStats {
  completionRate: number;
  globalPerformance: number;
  totalProcessus: number;
  totalIndicators: number;
  previousPerformance?: number;
  alertsCount?: number;
  nonConformities?: number;
  auditsPending?: number;
}

interface GovernanceStats {
  completionRate: number;
  late: number;
  upcoming: number;
  critical: number;
}

interface ChartItem {
  label: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  previousValue?: number;
}

interface RecentActivity {
  id: string;
  type: 'indicator' | 'audit' | 'nc' | 'action';
  title: string;
  date: string;
  status: 'success' | 'warning' | 'danger';
}

interface UserSession {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email: string;
  U_Role: string;
  U_TenantName?: string;
  U_FirstLogin?: boolean;
}

// Configuration des états de santé (Sémantique SMI)
const HEALTH_COLORS = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' }
};

/**
 * 🏷️ COMPOSANT : MODAL DE BIENVENUE
 * S'affiche lors de la première connexion pour orienter le décideur.
 */
const WelcomeModal = ({ userName, onClose }: { userName: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-3xl animate-in zoom-in-95 duration-300 border-none">
      <div className="text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <Sparkles className="text-blue-600" size={48} />
        </div>
        <h2 className="text-4xl font-black uppercase italic text-slate-900 mb-6 tracking-tighter">
          Bienvenue, <span className="text-blue-600">{userName}</span>
        </h2>
        <p className="text-slate-600 mb-10 font-bold text-sm uppercase tracking-wide leading-relaxed">
          Accès sécurisé au Cockpit de Décision Qualisoft Elite 2026 activé. 
          Vérifiez vos indicateurs et pilotez la performance.
        </p>
        <button 
          onClick={onClose}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl transition-all"
        >
          Initialiser le pilotage
        </button>
      </div>
    </div>
  </div>
);

export default function ExecutiveDashboard() {
  // --- ÉTATS DU SYSTÈME ---
  const [data, setData] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [govData, setGovData] = useState<GovernanceStats>({ completionRate: 0, late: 0, upcoming: 0, critical: 0 });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Initialisation de l'horloge système
  useEffect(() => {
    setIsMounted(true);
    const formatDate = () => new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });
    setCurrentTime(formatDate());
    const timer = setInterval(() => setCurrentTime(formatDate()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Récupération de la session utilisateur
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed: UserSession = JSON.parse(stored);
        setUser(parsed);
        if (parsed.U_FirstLogin) setShowWelcome(true);
      }
    } catch (e) {
      console.error('Erreur session:', e);
      localStorage.removeItem('user');
    }
  }, []);

  // Définition des privilèges
  const isSuperAdmin = useMemo(() => 
    user?.U_Role === 'SUPER_ADMIN' || user?.U_Email === 'ab.thiongane@qualisoft.sn', [user]);

  const isDecisionMaker = useMemo(() => 
    ['SUPER_ADMIN', 'ADMIN', 'RQ'].includes(user?.U_Role || ''), [user]);

  const userInitials = useMemo(() => {
    if (!user) return '??';
    return `${user.U_FirstName?.[0] ?? ''}${user.U_LastName?.[0] ?? ''}`.toUpperCase() || '??';
  }, [user]);

  /**
   * 📡 RÉCUPÉRATION DES DONNÉES DU COCKPIT
   * Agrégation des flux Performance, Gouvernance et Activités Récentes.
   */
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        apiClient.get('/indicators/dashboard-stats'),
        apiClient.get('/gouvernance/performance'),
        apiClient.get('/dashboard/recent-activity')
      ]);

      // Traitement du flux Statistiques
      if (results[0].status === 'fulfilled' && results[0].value?.data) {
        const statsData = results[0].value.data;
        setData(statsData);
        setChartData(statsData.chartData?.map((item: any) => ({
          ...item,
          value: Number(item.value) || 0,
          target: Number(item.target) || 1,
        })) || []);
      }

      // Traitement du flux Gouvernance
      if (results[1].status === 'fulfilled' && results[1].value?.data) {
        setGovData(results[1].value.data);
      }

      // Traitement du flux Activités
      if (results[2].status === 'fulfilled' && Array.isArray(results[2].value?.data)) {
        setActivities(results[2].value.data);
      }
    } catch (err) {
      console.error("Erreur Dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isMounted) {
      user ? fetchDashboardData() : setLoading(false);
    }
  }, [isMounted, user, fetchDashboardData]);

  /**
   * 💾 ACTION : EXPORT DU RAPPORT EXÉCUTIF
   * Génération et téléchargement du dossier PDF mensuel (§9.3).
   */
  const handleDownloadReport = async () => {
    setIsExporting(true);
    try {
      const now = new Date();
      const response = await apiClient.get(`/indicators/export/pdf`, {
        params: { month: now.getMonth() + 1, year: now.getFullYear() },
        responseType: 'blob',
      });
      if (response?.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Executive_Report_${now.getMonth()+1}_${now.getFullYear()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      alert("Erreur génération PDF");
    } finally { setIsExporting(false); }
  };

  const handleCloseWelcome = async () => {
    if (!user?.U_Id) return setShowWelcome(false);
    try {
      await apiClient.patch(`/auth/disable-first-login/${user.U_Id}`);
      const updatedUser = { ...user, U_FirstLogin: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowWelcome(false);
    } catch (e) { setShowWelcome(false); }
  };

  // --- LOGIQUE MÉTIER SMI ---

  const healthScore = useMemo(() => {
    if (!data) return 0;
    const perf = data.globalPerformance || 0;
    const gov = govData?.completionRate || 0;
    const ncScore = Math.max(0, 100 - ((data.nonConformities || 0) * 8));
    return Math.min(Math.round((perf * 0.45) + (gov * 0.3) + (ncScore * 0.25)), 100);
  }, [data, govData]);

  const healthStatus = useMemo(() => {
    if (healthScore >= 80) return { color: 'emerald' as const, label: 'Excellente' };
    if (healthScore >= 55) return { color: 'amber' as const, label: 'En surveillance' };
    return { color: 'red' as const, label: 'Risque Majeur' };
  }, [healthScore]);

  const healthColorClasses = HEALTH_COLORS[healthStatus.color];

  // États de chargement et montage
  if (!isMounted) return <div className="h-screen bg-[#0B0F1A] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={50} /></div>;
  
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0B0F1A] text-white italic">
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="animate-spin text-blue-500" size={60} />
        <span className="text-xs font-black uppercase tracking-[0.5em] animate-pulse">Initialisation Executive Dashboard...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col p-6 lg:p-12 space-y-10 animate-in fade-in duration-1000 italic font-sans overflow-y-auto selection:bg-blue-600/30">
      
      {/* 🔝 SECTION HEADER : IDENTITÉ ET SANTÉ SMI */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
              <Clock size={14} /> {currentTime}
            </span>
            {isDecisionMaker && (
              <span className={`px-5 py-2 rounded-full ${healthColorClasses.bg} border ${healthColorClasses.border} ${healthColorClasses.text} text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl`}>
                <Activity size={14} /> Santé Système: {healthScore}% — {healthStatus.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-5">
            <h1 className="text-5xl lg:text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
              Cockpit <span className="text-blue-500">{isSuperAdmin ? 'Souverain' : 'Exécutif'}</span>
            </h1>
            {isSuperAdmin && <Crown className="text-amber-400 animate-bounce" size={40} />}
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">Surveillance ISO 9001:2015 • Intelligence Opérationnelle Elite 2026</p>
        </div>

        <div className="flex items-center gap-6 group">
          <div className="text-right hidden lg:block">
            <p className="text-white font-black uppercase text-xl tracking-tighter italic">
              {user?.U_FirstName} {user?.U_LastName}
            </p>
            <div className="flex items-center justify-end gap-3 mt-1">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isSuperAdmin ? 'text-amber-500' : 'text-blue-500'}`}>
                {isSuperAdmin ? 'Master Admin' : (user?.U_Role || 'Observateur')}
              </span>
              <BadgeCheck size={16} className={isSuperAdmin ? 'text-amber-500 shadow-amber-500' : 'text-blue-500'} />
            </div>
          </div>
          <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-4xl flex items-center justify-center border-4 border-white/5 shadow-3xl bg-linear-to-br ${isSuperAdmin ? 'from-amber-500 to-amber-700' : 'from-blue-600 to-blue-800'}`}>
            <span className="text-2xl lg:text-3xl font-black text-white uppercase not-italic tracking-tighter">
              {userInitials}
            </span>
          </div>
        </div>
      </header>

      {/* 🧨 SECTION CRITIQUE : ALERTES ET RAPPORT PDF */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex items-center gap-6 bg-linear-to-r from-red-600/10 to-amber-600/10 border border-red-500/20 rounded-[3rem] p-8 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle size={120} />
          </div>
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
            <AlertTriangle className="text-red-500 animate-pulse" size={32} />
          </div>
          <div className="flex-1 min-w-0 z-10">
            <h3 className="text-white font-black uppercase italic text-xl tracking-tighter mb-1">Attention Requise (§10.2)</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              {govData?.late || 0} Retards cumulés • {data?.nonConformities || 0} NC ouvertes • Action immédiate suggérée
            </p>
          </div>
          <Link href="/dashboard/improvement" className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all z-10 border-none">
            Gérer les écarts
          </Link>
        </div>

        <div className="lg:col-span-4">
          <button 
            onClick={handleDownloadReport} 
            disabled={isExporting}
            className="w-full h-full group flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/40 rounded-[3rem] p-8 transition-all shadow-xl disabled:opacity-40"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                <FileText className="text-white" size={32} />
              </div>
              <div className="text-left">
                <p className="text-white font-black uppercase italic text-lg tracking-tighter">Export Exécutif</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Génération PDF Mensuel</p>
              </div>
            </div>
            {isExporting ? <Loader2 className="animate-spin text-blue-500" size={30} /> : <FileDown className="text-slate-500 group-hover:text-blue-500 transition-colors" size={30} />}
          </button>
        </div>
      </div>

      {/* 📊 GRILLE DES INDICATEURS CLÉS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <KPICard title="Performance" value={`${data?.globalPerformance || 0}%`} trend={performance} icon={Target} color="emerald" subtitle="Rendement global" href="/dashboard/indicators" />
        <KPICard title="Conformité" value={`${data?.completionRate || 0}%`} trend={null} icon={ShieldCheck} color="blue" subtitle="Index Normatif" href="/dashboard/non-conformites" />
        <KPICard title="Gouvernance" value={`${govData?.completionRate || 0}%`} trend={{ direction: (govData?.late || 0) > 0 ? 'down' : 'up', value: String(govData?.late || 0) }} icon={CalendarCheck} color="amber" subtitle="Échéancier Actif" href="/dashboard/gouvernance" />
        <KPICard title="Structure" value={data?.totalProcessus || 0} trend={null} icon={Layers} color="purple" subtitle={`${data?.totalIndicators || 0} Mesures`} href="/dashboard/processus" />
      </div>

      {/* 📉 SECTION ANALYSE PERFORMANCE & FLUX D'ACTIVITÉ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* CHART : ANALYSE DES INDICATEURS STRATÉGIQUES */}
        <div className="lg:col-span-2 bg-[#131825] border border-white/5 rounded-[4rem] p-10 shadow-3xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">Trajectoire Performance</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 italic">Analyse comparative vs Objectifs Qualité</p>
            </div>
            <div className="flex gap-6">
              <span className="flex items-center gap-3 text-[10px] font-black uppercase text-emerald-400">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" /> Atteint
              </span>
              <span className="flex items-center gap-3 text-[10px] font-black uppercase text-red-500">
                <div className="w-3 h-3 rounded-full bg-red-600 shadow-lg shadow-red-500/20" /> Critique
              </span>
            </div>
          </div>
          
          <div className="space-y-10 max-h-125 overflow-y-auto pr-4 custom-scrollbar">
            {chartData.length > 0 ? chartData.map((item, idx) => {
              const score = Math.min(Math.round((item.value / item.target) * 100), 100);
              const isCrit = score < 60;
              return (
                <div key={idx} className="group cursor-default">
                  <div className="flex justify-between items-end mb-4 px-2">
                    <div className="flex items-center gap-4">
                      <span className="text-[15px] font-black uppercase text-white italic group-hover:text-blue-500 transition-colors tracking-tight">{item.label}</span>
                      {item.trend === 'up' ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-500" />}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white tracking-tighter">{item.value} <span className="text-xs text-slate-600">/ {item.target}</span></span>
                      <span className={`ml-4 text-sm font-black italic ${isCrit ? 'text-red-500' : 'text-emerald-500'}`}>{score}%</span>
                    </div>
                  </div>
                  <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1 shadow-inner relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-1500 ease-out relative ${isCrit ? 'bg-linear-to-r from-red-600 to-amber-500 shadow-lg shadow-red-500/20' : 'bg-linear-to-r from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/20'}`} 
                      style={{ width: `${score}%` }}
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-[shimmer_3s_infinite]" />
                    </div>
                  </div>
                </div>
              );
            }) : <div className="text-center py-20 opacity-20"><Activity size={60} className="mx-auto mb-4" /><p className="font-black uppercase italic">Flux de données vide</p></div>}
          </div>
        </div>

        {/* 🎢 SIDEBAR : FLUX RÉCENT ET ACTIONS RAPIDES */}
        <div className="space-y-8">
          <div className="bg-[#131825] border border-white/5 rounded-[3.5rem] p-8 shadow-2xl">
            <h3 className="text-lg font-black uppercase italic text-white tracking-widest mb-8 flex items-center gap-3">
              <Sparkles size={20} className="text-blue-500" /> Flux Temps Réel
            </h3>
            <div className="space-y-5">
              {activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-center gap-4 p-4 rounded-3xl bg-white/2 border border-white/5 hover:bg-white/5 hover:border-blue-500/30 transition-all group cursor-pointer">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    act.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {act.type === 'indicator' ? <Target size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase italic text-white truncate group-hover:text-blue-500 transition-colors tracking-tight">{act.title}</p>
                    <p className="text-[9px] font-black text-slate-600 uppercase mt-1 tracking-widest">{new Date(act.date).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-800 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-linear-to-br from-blue-600 to-blue-800 rounded-[3.5rem] p-8 shadow-3xl">
            <h3 className="text-sm font-black uppercase italic text-white mb-6 tracking-[0.4em] opacity-80">Leviers Action</h3>
            <div className="space-y-4">
              <QuickAction href="/dashboard/indicators" icon={Target} label="Piloter Indicateurs" />
              <QuickAction href="/dashboard/nc" icon={AlertTriangle} label="Registre des NC" />
              <QuickAction href="/dashboard/management-review" icon={ShieldCheck} label="Revues Direction" />
            </div>
          </div>
        </div>
      </div>

      {showWelcome && user && (
        <WelcomeModal userName={user.U_FirstName} onClose={handleCloseWelcome} />
      )}

      {/* STYLES TECHNIQUES */}
      <style jsx global>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.3); }
      `}</style>
    </div>
  );
}

// --- 🧩 SOUS-COMPOSANTS UI ---

function KPICard({ title, value, trend, icon: Icon, color, subtitle, href }: any) {
  const c = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/5'
  }[color as 'emerald' | 'blue' | 'amber' | 'purple'];

  return (
    <Link href={href} className="group block h-full">
      <div className={`relative h-full bg-[#131825] border ${c} p-8 rounded-[3.5rem] transition-all hover:bg-white/5 shadow-2xl hover:-translate-y-2`}>
        <div className="flex justify-between items-start mb-6">
          <div className={`w-16 h-16 rounded-3xl bg-white/5 ${c.split(' ')[0]} flex items-center justify-center border border-white/5 transition-transform group-hover:rotate-6`}>
            <Icon size={32} />
          </div>
          {trend && (
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase px-4 py-2 rounded-full ${trend.direction === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
              {trend.direction === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />} {trend.value}%
            </div>
          )}
        </div>
        <div>
          <p className="text-5xl font-black italic text-white tracking-tighter leading-none mb-3">{value}</p>
          <p className="text-sm font-black uppercase text-slate-300 tracking-tight">{title}</p>
          <p className="text-[10px] font-black uppercase text-slate-600 mt-2 tracking-widest">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ href, icon: Icon, label }: any) {
  return (
    <Link href={href} className="flex items-center gap-5 p-5 rounded-3xl bg-white/10 hover:bg-white/20 transition-all group border border-white/5">
      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform"><Icon size={24} /></div>
      <span className="text-xs font-black uppercase italic text-white tracking-tighter flex-1">{label}</span>
      <ChevronRight size={18} className="text-white/50 group-hover:translate-x-2 transition-transform" />
    </Link>
  );
}