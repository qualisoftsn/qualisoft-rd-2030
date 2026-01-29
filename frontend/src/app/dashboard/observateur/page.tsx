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
  U_Tenant?: {
    T_SubscriptionStatus: string;
    T_Plan: string;
  };
}

// Mapping des couleurs pour éviter les classes dynamiques Tailwind
const HEALTH_COLORS = {
  emerald: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  },
  amber: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20'
  },
  red: {
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20'
  }
};

// WelcomeModal
const WelcomeModal = ({ userName, onClose }: { userName: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="text-blue-600" size={40} />
        </div>
        <h2 className="text-3xl font-black uppercase italic text-slate-900 mb-4">
          Bienvenue, {userName} !
        </h2>
        <p className="text-slate-600 mb-8 font-medium">
          Vous êtes connecté à votre tableau de bord Qualisoft. Découvrez vos indicateurs en temps réel.
        </p>
        <button 
          onClick={onClose}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-lg transition-all"
        >
          Commencer
        </button>
      </div>
    </div>
  </div>
);

export default function ExecutiveDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [govData, setGovData] = useState<GovernanceStats>({ 
    completionRate: 0, 
    late: 0, 
    upcoming: 0, 
    critical: 0 
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Horloge côté client
  useEffect(() => {
    setIsMounted(true);
    const formatDate = () => new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
    
    setCurrentTime(formatDate());
    
    const timer = setInterval(() => {
      setCurrentTime(formatDate());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Chargement utilisateur depuis localStorage (FONCTIONNALITÉ CONSERVÉE)
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
      console.error('Erreur parsing user:', e);
      localStorage.removeItem('user');
    }
  }, []);

  const isSuperAdmin = useMemo(() => 
    user?.U_Role === 'SUPER_ADMIN' || user?.U_Email === 'ab.thiongane@qualisoft.sn', 
  [user]);

  const isDecisionMaker = useMemo(() => 
    ['SUPER_ADMIN', 'ADMIN', 'RQ'].includes(user?.U_Role || ''), 
  [user]);

  // Données utilisateur sécurisées
  const userInitials = useMemo(() => {
    if (!user) return '??';
    const first = user.U_FirstName?.[0] ?? '';
    const last = user.U_LastName?.[0] ?? '';
    return `${first}${last}` || '??';
  }, [user]);

  const userFullName = useMemo(() => {
    if (!user) return 'Utilisateur';
    return [user.U_FirstName, user.U_LastName].filter(Boolean).join(' ') || 'Utilisateur';
  }, [user]);

  // Fetch data
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const results = await Promise.allSettled([
        apiClient.get('/indicators/dashboard-stats').catch(() => ({ data: null })),
        apiClient.get('/gouvernance/performance').catch(() => ({ data: { completionRate: 0, late: 0, upcoming: 0, critical: 0 } })),
        apiClient.get('/dashboard/recent-activity').catch(() => ({ data: [] }))
      ]);

      if (results[0].status === 'fulfilled' && results[0].value?.data) {
        const statsData = results[0].value.data;
        setData({
          completionRate: statsData.completionRate || 0,
          globalPerformance: statsData.globalPerformance || 0,
          totalProcessus: statsData.totalProcessus || 0,
          totalIndicators: statsData.totalIndicators || 0,
          previousPerformance: statsData.previousPerformance || 0,
          alertsCount: statsData.alertsCount || 0,
          nonConformities: statsData.nonConformities || 0,
          auditsPending: statsData.auditsPending || 0
        });
        
        const rawChartData = statsData.chartData || [];
        setChartData(rawChartData.map((item: any) => ({
          label: item.label || 'Indicateur',
          value: Number(item.value) || 0,
          target: Number(item.target) || 1,
          trend: item.trend || 'stable',
          previousValue: item.previousValue || Math.floor((Number(item.value) || 0) * 0.9)
        })));
      }

      if (results[1].status === 'fulfilled' && results[1].value?.data) {
        const gov = results[1].value.data;
        setGovData({
          completionRate: gov.completionRate || 0,
          late: gov.late || 0,
          upcoming: gov.upcoming || 0,
          critical: gov.critical || 0
        });
      }

      if (results[2].status === 'fulfilled' && Array.isArray(results[2].value?.data)) {
        setActivities(results[2].value.data);
      } else {
        setActivities([
          { id: '1', type: 'indicator', title: 'KPI Performance validé', date: new Date().toISOString(), status: 'success' },
          { id: '2', type: 'nc', title: 'Non-conformité à traiter', date: new Date().toISOString(), status: 'danger' },
        ]);
      }
    } catch (err) {
      console.error("Erreur fetch dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // CORRECTION CLÉ : Gestion du chargement selon présence utilisateur
  useEffect(() => {
    if (isMounted) {
      if (user) {
        fetchDashboardData();
      } else {
        // CORRECTION : Si pas d'utilisateur, on arrête le chargement pour éviter la boucle infinie
        setLoading(false);
      }
    }
  }, [isMounted, user, fetchDashboardData]);

  const handleCloseWelcome = async () => {
    if (!user?.U_Id) {
      setShowWelcome(false);
      return;
    }
    try {
      await apiClient.patch(`/auth/disable-first-login/${user.U_Id}`);
      const updatedUser = { ...user, U_FirstLogin: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowWelcome(false);
    } catch (e) {
      console.error('Erreur fermeture welcome:', e);
      setShowWelcome(false);
    }
  };

  const handleDownloadReport = async () => {
    setIsExporting(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const response = await apiClient.get(`/indicators/export/pdf`, {
        params: { month, year },
        responseType: 'blob',
      });
      
      if (response?.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Rapport_Executif_${month}_${year}.pdf`);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
      }
    } catch (err) {
      console.error("Erreur export:", err);
      alert("Erreur lors de la génération du rapport");
    } finally { 
      setIsExporting(false); 
    }
  };

  // Calculs métier
  const performanceTrend = useMemo(() => {
    if (!data?.globalPerformance || !data?.previousPerformance) return null;
    const diff = data.globalPerformance - data.previousPerformance;
    return {
      direction: diff >= 0 ? 'up' : 'down',
      value: Math.abs(diff).toFixed(1)
    };
  }, [data]);

  const healthScore = useMemo(() => {
    if (!data) return 0;
    const perf = data.globalPerformance || 0;
    const gov = govData?.completionRate || 0;
    const nc = data.nonConformities || 0;
    const conformiteScore = Math.max(0, 100 - (nc * 10));
    return Math.min(Math.round((perf * 0.4) + (gov * 0.3) + (conformiteScore * 0.3)), 100);
  }, [data, govData]);

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { color: 'emerald' as const, label: 'Excellente' };
    if (score >= 60) return { color: 'amber' as const, label: 'À surveiller' };
    return { color: 'red' as const, label: 'Critique' };
  };

  const healthStatus = getHealthStatus(healthScore);
  const healthColorClasses = HEALTH_COLORS[healthStatus.color];

  // État de montage initial
  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F1A]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  // Chargement des données (uniquement si utilisateur connecté)
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 italic">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin" size={48} />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse text-white">
            Chargement Executive...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 lg:p-10 space-y-8 animate-in fade-in duration-700 italic font-sans bg-[#0B0F1A] overflow-y-auto selection:bg-blue-600/30">
      
      {/* HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/10 pb-8">
        <div className="space-y-3 w-full lg:w-auto">
          <div className="flex items-center gap-3 flex-wrap">
            {currentTime && (
              <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> 
                {currentTime}
              </span>
            )}
            {isDecisionMaker && (
              <span className={`px-4 py-1.5 rounded-full bg-white/5 border border-white/10 ${healthColorClasses.text} text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
                <Activity size={12} /> Santé SMI: {healthScore}% {healthStatus.label}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none text-white">
              Cockpit <span className="text-blue-500">
                {isSuperAdmin ? 'Souverain' : 'Stratégique'}
              </span>
            </h1>
            {isSuperAdmin && <Crown className="text-amber-400 animate-pulse" size={32} />}
          </div>
          
          <p className="text-slate-400 text-sm font-medium max-w-2xl">
            Vue synthétique de la performance globale et levier d&apos;action pour la direction.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
          <div className="text-right hidden lg:block">
            <p className="text-white font-black uppercase text-lg tracking-tighter truncate max-w-50">{userFullName}</p>
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isSuperAdmin ? 'text-amber-400' : 'text-blue-400'}`}>
                {isSuperAdmin ? 'Super Admin' : (user?.U_Role || 'User')}
              </span>
              <BadgeCheck size={14} className={isSuperAdmin ? 'text-amber-400' : 'text-blue-400'} />
            </div>
          </div>
          
          <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-3xl flex items-center justify-center border-2 border-white/10 shadow-2xl bg-linear-to-br ${isSuperAdmin ? 'from-amber-500 to-amber-700' : 'from-blue-600 to-blue-800'}`}>
            <span className="text-xl lg:text-2xl font-black text-white uppercase not-italic">
              {userInitials}
            </span>
          </div>
        </div>
      </header>

      {/* ALERTES & ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex items-center gap-4 bg-linear-to-r from-red-500/20 to-amber-500/20 border border-red-500/30 rounded-4xl p-6 backdrop-blur-sm">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle className="text-red-400" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-black uppercase italic text-lg tracking-tight truncate">
              Points d&apos;attention immédiats
            </h3>
            <p className="text-slate-300 text-xs font-bold uppercase tracking-widest truncate">
              {govData?.late || 0} activités en retard • {data?.nonConformities || 0} NC ouvertes • {govData?.critical || 0} alertes critiques
            </p>
          </div>
          <Link 
            href="/dashboard/actions" 
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-red-900/20 transition-all flex items-center gap-2 shrink-0"
          >
            Voir <ChevronRight size={16} className="hidden sm:inline" />
          </Link>
        </div>

        <div className="lg:col-span-4">
          <button 
            onClick={handleDownloadReport}
            disabled={isExporting || !user}
            className="w-full h-full min-h-20 group flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-4xl p-6 transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FileText className="text-white" size={24} />
              </div>
              <div className="text-left">
                <p className="text-white font-black uppercase italic text-sm">Rapport PDF</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mensuel • {new Date().getMonth() + 1}/{new Date().getFullYear()}</p>
              </div>
            </div>
            {isExporting ? (
              <Loader2 className="animate-spin text-blue-400" size={24} />
            ) : (
              <FileDown className="text-slate-400 group-hover:text-white transition-colors" size={24} />
            )}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Performance" 
          value={`${data?.globalPerformance || 0}%`} 
          trend={performanceTrend}
          icon={Target} 
          color="emerald"
          subtitle="vs mois précédent"
          href="/dashboard/indicators"
        />
        
        <KPICard 
          title="Conformité" 
          value={`${data?.completionRate || 0}%`} 
          trend={{ direction: 'up', value: '2.4' }}
          icon={ShieldCheck} 
          color="blue"
          subtitle="Objectifs SMI"
          href="/dashboard/compliance"
        />
        
        <KPICard 
          title="Gouvernance" 
          value={`${govData?.completionRate || 0}%`} 
          trend={{ direction: (govData?.late || 0) > 0 ? 'down' : 'up', value: String(govData?.late || 0) }}
          icon={CalendarCheck} 
          color="amber"
          subtitle={`${govData?.upcoming || 0} échéances`}
          href="/dashboard/gouvernance"
        />
        
        <KPICard 
          title="Processus" 
          value={data?.totalProcessus || 0} 
          trend={{ direction: 'stable', value: String(data?.totalIndicators || 0) }}
          icon={Layers} 
          color="purple"
          subtitle={`${data?.totalIndicators || 0} indicateurs`}
          href="/dashboard/processes"
        />
      </div>

      {/* GRILLE PRINCIPALE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* PERFORMANCE CHART */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-[3rem] p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">Analyse Performance</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Indicateurs vs Objectifs</p>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase">
              <span className="flex items-center gap-2 text-emerald-400">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Atteint
              </span>
              <span className="flex items-center gap-2 text-red-400">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" /> Critique
              </span>
            </div>
          </div>
          
          <div className="space-y-6 max-h-125 overflow-y-auto pr-2 custom-scrollbar">
            {chartData.length > 0 ? chartData.map((item, idx) => {
              const percentage = Math.min(Math.round((item.value / (item.target || 1)) * 100), 100);
              const isSuccess = percentage >= 100;
              
              return (
                <div key={`${item.label}-${idx}`} className="group">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-2 px-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black uppercase text-white italic group-hover:text-blue-400 transition-colors">
                        {item.label}
                      </span>
                      {item.trend === 'up' ? (
                        <TrendingUp size={14} className="text-emerald-400" />
                      ) : item.trend === 'down' ? (
                        <TrendingDown size={14} className="text-red-400" />
                      ) : null}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-white">
                        {item.value} <span className="text-xs text-slate-500">/ {item.target}</span>
                      </span>
                      <span className={`ml-3 text-xs font-bold ${isSuccess ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 relative ${isSuccess 
                        ? 'bg-linear-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                        : 'bg-linear-to-r from-red-600 to-amber-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      }`} 
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="flex h-64 items-center justify-center text-slate-600 border-2 border-dashed border-white/10 rounded-3xl">
                <div className="text-center">
                  <Activity size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-black uppercase text-[10px] italic tracking-widest">Aucune donnée disponible</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-white/10 rounded-[3rem] p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black uppercase italic text-white tracking-tight flex items-center gap-2">
                <Activity size={20} className="text-blue-500" /> Flux
              </h3>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Live</span>
            </div>
            
            <div className="space-y-4">
              {activities.length > 0 ? activities.slice(0, 5).map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    activity.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                    activity.status === 'danger' ? 'bg-red-500/20 text-red-400' : 
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {activity.type === 'indicator' && <Target size={18} />}
                    {activity.type === 'audit' && <CalendarCheck size={18} />}
                    {activity.type === 'nc' && <AlertTriangle size={18} />}
                    {activity.type === 'action' && <Rocket size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-tight truncate group-hover:text-blue-400 transition-colors">
                      {activity.title}
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">
                      {new Date(activity.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors shrink-0" />
                </div>
              )) : (
                <p className="text-center text-slate-500 text-xs py-8">Aucune activité récente</p>
              )}
            </div>
          </div>

          <div className="bg-linear-to-br from-blue-600 to-blue-800 rounded-[3rem] p-6 shadow-2xl border border-blue-500/30">
            <h3 className="text-sm font-black uppercase italic text-white mb-4 tracking-widest opacity-90">Actions</h3>
            <div className="space-y-3">
              <QuickAction href="/dashboard/indicators" icon={Target} label="Indicateurs" />
              <QuickAction href="/dashboard/audits" icon={ShieldCheck} label="Audits" />
              <QuickAction href="/dashboard/nc" icon={AlertTriangle} label="Non-conformités" />
            </div>
          </div>

          {(govData?.upcoming || 0) > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-4xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="text-amber-400" size={24} />
                <h3 className="text-lg font-black uppercase italic text-white">Échéances</h3>
              </div>
              <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">
                {govData.upcoming} événement{govData.upcoming > 1 ? 's' : ''} à venir
              </p>
              <Link 
                href="/dashboard/calendar" 
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all text-center block"
              >
                Voir l&apos;agenda
              </Link>
            </div>
          )}
        </div>
      </div>

      {showWelcome && user && (
        <WelcomeModal 
          userName={user.U_FirstName || 'Utilisateur'} 
          onClose={handleCloseWelcome} 
        />
      )}

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}

// SUB-COMPONENTS

interface KPICardProps {
  title: string; 
  value: string | number; 
  trend: { direction: 'up' | 'down' | 'stable'; value: string } | null;
  icon: LucideIcon; 
  color: 'emerald' | 'blue' | 'amber' | 'purple'; 
  subtitle: string;
  href: string;
}

function KPICard({ title, value, trend, icon: Icon, color, subtitle, href }: KPICardProps) {
  const colorClasses = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/10', gradient: 'from-emerald-600 to-emerald-400' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', shadow: 'shadow-blue-500/10', gradient: 'from-blue-600 to-blue-400' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', shadow: 'shadow-amber-500/10', gradient: 'from-amber-600 to-amber-400' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', shadow: 'shadow-purple-500/10', gradient: 'from-purple-600 to-purple-400' }
  };

  const c = colorClasses[color];

  return (
    <Link href={href} className="group block h-full">
      <div className={`relative h-full overflow-hidden bg-slate-900/50 border ${c.border} p-6 rounded-[2.5rem] hover:bg-white/5 transition-all shadow-xl ${c.shadow} hover:-translate-y-1`}>
        <div className={`absolute -top-10 -right-10 w-32 h-32 ${c.bg} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
        
        <div className="relative flex justify-between items-start mb-4">
          <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center border ${c.border} transition-transform group-hover:scale-110`}>
            <Icon size={28} />
          </div>
          
          {trend && (
            <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${
              trend.direction === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
              trend.direction === 'down' ? 'bg-red-500/20 text-red-400' :
              'bg-slate-700 text-slate-400'
            }`}>
              {trend.direction === 'up' ? <ArrowUp size={12} /> : 
               trend.direction === 'down' ? <ArrowDown size={12} /> : <Activity size={12} />}
              {trend.value}%
            </div>
          )}
        </div>
        
        <div className="relative">
          <p className={`text-4xl lg:text-5xl font-black italic text-white tracking-tighter ${c.text} transition-colors`}>
            {value}
          </p>
          <p className="text-sm font-black uppercase text-slate-300 mt-2 tracking-wide truncate">{title}</p>
          <p className={`text-[10px] font-bold ${c.text} uppercase tracking-widest mt-1 opacity-80`}>
            {subtitle}
          </p>
        </div>

        <div className={`absolute bottom-0 left-0 h-1 bg-linear-to-r ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity w-full`} />
      </div>
    </Link>
  );
}

interface QuickActionProps {
  href: string; 
  icon: LucideIcon; 
  label: string;
}

function QuickAction({ href, icon: Icon, label }: QuickActionProps) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all group border border-white/10"
    >
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
        <Icon size={20} />
      </div>
      <span className="text-sm font-black uppercase italic text-white tracking-tight flex-1">{label}</span>
      <ChevronRight size={16} className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </Link>
  );
}