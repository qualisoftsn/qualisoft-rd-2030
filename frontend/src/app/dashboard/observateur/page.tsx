/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : COCKPIT OBSERVATEUR (EXECUTIVE DASHBOARD)
 * -------------------------------------------------------------------------
 * RÔLE : Instance de surveillance macroscopique du SMI.
 * ARCHITECTURE : Zéro NextAuth • Authentification via API Client & LocalStorage.
 * DESIGN : Elite Dark Industrial • Glassmorphism.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 12:25 GMT
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import { 
  Loader2, FileDown, Sparkles, Layers, Activity, Target, 
  ShieldCheck, TrendingUp, TrendingDown, BadgeCheck, Crown, CalendarCheck,
  AlertTriangle, Clock, FileText, ChevronRight, ArrowDown, ArrowUp
} from 'lucide-react';

// --- INTERFACES ---
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
  U_FirstLogin?: boolean;
}

const HEALTH_COLORS = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' }
};

const WelcomeModal = ({ userName, onClose }: { userName: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div className="bg-[#0F172A] border border-blue-500/30 rounded-[3rem] p-12 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="text-center">
        <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/30">
          <Sparkles className="text-blue-500" size={48} />
        </div>
        <h2 className="text-4xl font-black uppercase italic text-white mb-6 tracking-tighter">
          Bienvenue, <span className="text-blue-500">{userName}</span>
        </h2>
        <p className="text-slate-400 mb-10 font-bold text-sm uppercase tracking-wide leading-relaxed">
          Accès sécurisé au Cockpit de Décision Elite 2026 activé. 
        </p>
        <button onClick={onClose} className="w-full py-5 bg-blue-600 hover:bg-white hover:text-blue-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all border-none cursor-pointer">
          Initialiser le pilotage
        </button>
      </div>
    </div>
  </div>
);

export default function ExecutiveDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [govData, setGovData] = useState<GovernanceStats>({ completionRate: 0, late: 0, upcoming: 0, critical: 0 });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const updateTime = () => setCurrentTime(new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // --- SÉCURITÉ : HYDRATATION DE SESSION LOCALE ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed: UserSession = JSON.parse(stored);
          setUser(parsed);
          if (parsed.U_FirstLogin) setShowWelcome(true);
        }
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const isSuperAdmin = useMemo(() => user?.U_Role === 'SUPER_ADMIN' || user?.U_Email === 'ab.thiongane@qualisoft.sn', [user]);
  const isDecisionMaker = useMemo(() => ['SUPER_ADMIN', 'ADMIN', 'RQ'].includes(user?.U_Role || ''), [user]);
  const userInitials = useMemo(() => `${user?.U_FirstName?.[0] ?? ''}${user?.U_LastName?.[0] ?? ''}`.toUpperCase() || '??', [user]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [resStats, resGov, resAct] = await Promise.allSettled([
        apiClient.get('/indicators/dashboard-stats'),
        apiClient.get('/gouvernance/performance'),
        apiClient.get('/dashboard/recent-activity')
      ]);

      if (resStats.status === 'fulfilled' && resStats.value?.data) {
        setData(resStats.value.data);
        setChartData(resStats.value.data.chartData?.map((item: any) => ({ ...item, value: Number(item.value) || 0, target: Number(item.target) || 1 })) || []);
      }
      if (resGov.status === 'fulfilled' && resGov.value?.data) setGovData(resGov.value.data);
      if (resAct.status === 'fulfilled' && Array.isArray(resAct.value?.data)) setActivities(resAct.value.data);
    } catch (err) {
      console.error("Dashboard Sync Error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isMounted && user) fetchDashboardData();
    else if (isMounted && !user) setLoading(false);
  }, [isMounted, user, fetchDashboardData]);

  const handleDownloadReport = async () => {
    setIsExporting(true);
    try {
      const now = new Date();
      const response = await apiClient.get('/indicators/export/pdf', { params: { month: now.getMonth() + 1, year: now.getFullYear() }, responseType: 'blob' });
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
      alert("Erreur de génération du rapport");
    } finally { setIsExporting(false); }
  };

  const handleCloseWelcome = async () => {
    if (!user?.U_Id) return setShowWelcome(false);
    try {
      await apiClient.patch(`/auth/disable-first-login/${user.U_Id}`);
      const updatedUser = { ...user, U_FirstLogin: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (e) {}
    setShowWelcome(false);
  };

  const healthScore = useMemo(() => {
    const perf = data?.globalPerformance || 0;
    const gov = govData?.completionRate || 0;
    const ncScore = Math.max(0, 100 - ((data?.nonConformities || 0) * 8));
    return Math.min(Math.round((perf * 0.45) + (gov * 0.3) + (ncScore * 0.25)), 100);
  }, [data, govData]);

  const healthStatus = useMemo(() => {
    if (healthScore >= 80) return { color: 'emerald' as const, label: 'Excellente' };
    if (healthScore >= 55) return { color: 'amber' as const, label: 'En surveillance' };
    return { color: 'red' as const, label: 'Risque Majeur' };
  }, [healthScore]);

  const hc = HEALTH_COLORS[healthStatus.color];

  if (!isMounted) return <div className="h-screen bg-[#0B0F1A] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={50} /></div>;
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0B0F1A] text-white italic">
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="animate-spin text-blue-500" size={60} />
        <span className="text-xs font-black uppercase tracking-[0.5em] animate-pulse">Initialisation SDE...</span>
      </div>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 min-h-screen bg-[#0B0F1A] flex flex-col p-6 lg:p-12 space-y-10 animate-in fade-in duration-1000 italic font-sans overflow-x-hidden selection:bg-blue-600/30">
      
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
              <Clock size={14} /> {currentTime}
            </span>
            {isDecisionMaker && (
              <span className={`px-5 py-2 rounded-full ${hc.bg} border ${hc.border} ${hc.text} text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg`}>
                <Activity size={14} /> Santé Système: {healthScore}% — {healthStatus.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-5">
            <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter text-white leading-none">
              Cockpit <span className="text-blue-500">{isSuperAdmin ? 'Souverain' : 'Exécutif'}</span>
            </h1>
            {isSuperAdmin && <Crown className="text-amber-400 animate-bounce" size={32} />}
          </div>
        </div>

        <div className="flex items-center gap-6 group">
          <div className="text-right hidden lg:block">
            <p className="text-white font-black uppercase text-xl tracking-tighter italic">{user?.U_FirstName} {user?.U_LastName}</p>
            <div className="flex items-center justify-end gap-3 mt-1">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isSuperAdmin ? 'text-amber-500' : 'text-blue-500'}`}>
                {isSuperAdmin ? 'Master Admin' : (user?.U_Role || 'Observateur')}
              </span>
              <BadgeCheck size={16} className={isSuperAdmin ? 'text-amber-500' : 'text-blue-500'} />
            </div>
          </div>
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl bg-linear-to-br ${isSuperAdmin ? 'from-amber-600 to-amber-900' : 'from-blue-600 to-blue-900'}`}>
            <span className="text-2xl font-black text-white not-italic">{userInitials}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col sm:flex-row items-center gap-6 bg-linear-to-r from-red-900/40 to-amber-900/20 border border-red-500/30 rounded-[2.5rem] p-8 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><AlertTriangle size={120} /></div>
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
            <AlertTriangle className="text-red-500 animate-pulse" size={32} />
          </div>
          <div className="flex-1 text-center sm:text-left z-10">
            <h3 className="text-white font-black uppercase italic text-xl tracking-tighter mb-1">Attention Requise (§10.2)</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{govData?.late || 0} Retards cumulés • {data?.nonConformities || 0} NC ouvertes</p>
          </div>
          <Link href="/dashboard/improvement" className="px-8 py-4 bg-red-600 hover:bg-white hover:text-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all z-10 border-none cursor-pointer text-center">
            Gérer les écarts
          </Link>
        </div>

        <div className="lg:col-span-4">
          <button onClick={handleDownloadReport} disabled={isExporting} className="w-full h-full group flex items-center justify-between bg-[#151A2D]/80 border border-white/5 hover:border-blue-500/40 rounded-[2.5rem] p-8 transition-all shadow-xl disabled:opacity-50 cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform"><FileText className="text-white" size={32} /></div>
              <div className="text-left">
                <p className="text-white font-black uppercase italic text-lg tracking-tighter">Export Exécutif</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Rapport Mensuel</p>
              </div>
            </div>
            {isExporting ? <Loader2 className="animate-spin text-blue-500" size={24} /> : <FileDown className="text-slate-500 group-hover:text-blue-500" size={24} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Performance" value={`${data?.globalPerformance || 0}%`} trend={{ direction: 'up', value: '0' }} icon={Target} color="emerald" subtitle="Rendement global" href="/dashboard/indicators" />
        <KPICard title="Conformité" value={`${data?.completionRate || 0}%`} trend={null} icon={ShieldCheck} color="blue" subtitle="Index Normatif" href="/dashboard/non-conformites" />
        <KPICard title="Gouvernance" value={`${govData?.completionRate || 0}%`} trend={{ direction: (govData?.late || 0) > 0 ? 'down' : 'up', value: String(govData?.late || 0) }} icon={CalendarCheck} color="amber" subtitle="Échéancier Actif" href="/dashboard/gouvernance" />
        <KPICard title="Structure" value={data?.totalProcessus || 0} trend={null} icon={Layers} color="purple" subtitle={`${data?.totalIndicators || 0} Mesures`} href="/dashboard/processus" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-[#151A2D]/80 border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">Trajectoire Performance</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">vs Objectifs Qualité</p>
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Atteint</span>
              <span className="flex items-center gap-2 text-[9px] font-black uppercase text-red-500"><div className="w-2 h-2 rounded-full bg-red-600" /> Critique</span>
            </div>
          </div>
          
          <div className="space-y-8 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
            {chartData.length > 0 ? chartData.map((item, idx) => {
              const score = Math.min(Math.round((item.value / item.target) * 100), 100);
              const isCrit = score < 60;
              return (
                <div key={idx}>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-xs font-black uppercase text-white italic tracking-widest">{item.label}</span>
                    <span className="text-xl font-black text-white">{item.value} <span className="text-xs text-slate-500">/ {item.target}</span></span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div className={`h-full rounded-full transition-all duration-1000 ${isCrit ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              );
            }) : <div className="text-center py-10 opacity-30"><Activity size={40} className="mx-auto mb-4" /><p className="font-black uppercase text-xs tracking-widest">Aucune donnée</p></div>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#151A2D]/80 border border-white/5 rounded-[3rem] p-8 shadow-2xl backdrop-blur-xl">
            <h3 className="text-sm font-black uppercase italic text-white tracking-widest mb-6 flex items-center gap-3">
              <Sparkles size={16} className="text-blue-500" /> Flux Temps Réel
            </h3>
            <div className="space-y-4">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${act.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {act.type === 'indicator' ? <Target size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase text-white truncate">{act.title}</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase mt-1 tracking-widest">{new Date(act.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-linear-to-br from-blue-700 to-blue-900 rounded-[3rem] p-8 shadow-2xl">
            <h3 className="text-[10px] font-black uppercase text-white mb-6 tracking-[0.4em] opacity-80">Leviers Action</h3>
            <div className="space-y-3">
              <QuickAction href="/dashboard/indicators" icon={Target} label="Indicateurs" />
              <QuickAction href="/dashboard/nc" icon={AlertTriangle} label="Registre NC" />
            </div>
          </div>
        </div>
      </div>

      {showWelcome && user && <WelcomeModal userName={user.U_FirstName} onClose={handleCloseWelcome} />}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}

function KPICard({ title, value, trend, icon: Icon, color, subtitle, href }: any) {
  const ciplo = { emerald: 'text-emerald-400 border-emerald-500/20', blue: 'text-blue-400 border-blue-500/20', amber: 'text-amber-400 border-amber-500/20', purple: 'text-purple-400 border-purple-500/20' }[color as string];
  return (
    <Link href={href} className="group block">
      <div className={`h-full bg-[#151A2D]/80 border ${ciplo} p-8 rounded-[2.5rem] transition-all hover:bg-[#1a2030] shadow-xl hover:-translate-y-1 backdrop-blur-xl`}>
        <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 rounded-2xl bg-white/5 ${ciplo.split(' ')[0]} flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110`}><Icon size={24} /></div>
        </div>
        <div>
          <p className="text-4xl font-black italic text-white tracking-tighter leading-none mb-2">{value}</p>
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{title}</p>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ href, icon: Icon, label }: any) {
  return (
    <Link href={href} className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/5 cursor-pointer">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><Icon size={18} /></div>
      <span className="text-[10px] font-black uppercase text-white tracking-widest flex-1">{label}</span>
      <ChevronRight size={14} className="text-white/50" />
    </Link>
  );
}