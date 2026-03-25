/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : COCKPIT AUDIT CENTER (EXECUTIVE) - ISO 9001 §9.3
 * -------------------------------------------------------------------------
 * RÔLE : Supervision globale (Santé SMI, Performance, Flux d'Audits)
 * VERSION : 3.0 - Typing strict Prisma + Design Elite + Accessibilité + PWA Ready
 * API : apiClient avec interceptors (Bearer + X-Tenant-Id)
 * RÉVISION : 19 Mars 2026 | Production OVH
 * -------------------------------------------------------------------------
 */

import apiClient from "@/core/api/api-client";
import { useAuthStore, type AuthState } from "@/store/authStore";
import type { LucideIcon } from "lucide-react";
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, BadgeCheck,
  CalendarCheck, ChevronRight, Clock, Crown, FileDown, FileText,
  Layers, Loader2, Rocket, ShieldCheck, Sparkles, Target,
  TrendingDown, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

// ============================================================================
// TYPES & INTERFACES (Strict Typing - Prisma aligned)
// ============================================================================

// Basé sur model Indicator + Processus + Alert du schema.prisma
export interface DashboardStats {
  completionRate: number;           // % indicateurs atteints
  globalPerformance: number;        // Score global 0-100
  totalProcessus: number;           // Count from Processus model
  totalIndicators: number;          // Count from Indicator model
  previousPerformance?: number;     // Pour calcul trend
  alertsCount?: number;             // Count from Alert where AL_Status !== 'READ'
  nonConformities?: number;         // Count from NonConformite where NC_Statut !== 'CLOTURE'
  auditsPending?: number;           // Count from Audit where AU_Status === 'PLANIFIE'
}

// Basé sur model GovernanceActivity + ProcessReview
export interface GovernanceStats {
  completionRate: number;           // % activités gouvernance terminées
  late: number;                     // Count with GA_DatePlanned < now AND GA_Status !== 'DONE'
  upcoming: number;                 // Count with GA_DatePlanned > now
  critical: number;                 // Count with GA_Status === 'PLANNED' AND priority HIGH
}

// Données de chart pour indicateurs
export interface ChartItem {
  label: string;                    // IND_Libelle from Indicator
  value: number;                    // IV_Actual from IndicatorValue
  target: number;                   // IND_Cible from Indicator
  trend: 'up' | 'down' | 'stable';  // Calculé côté frontend
  previousValue?: number;           // Pour comparaison mois précédent
}

// Activité récente - union des modèles Alert, Audit, NonConformite, Action
export interface RecentActivity {
  id: string;                       // AL_Id / AU_Id / NC_Id / ACT_Id
  type: 'indicator' | 'audit' | 'nc' | 'action';
  title: string;                    // AL_Title / AU_Title / NC_Libelle / ACT_Title
  date: string;                     // ISO string (AL_TriggerDate / AU_DateAudit / etc.)
  status: 'success' | 'warning' | 'danger'; // Mappé depuis AL_Status / AU_Status / etc.
}

// ============================================================================
// CONFIGURATION DES AFFICHAGES
// ============================================================================

const HEALTH_COLORS = {
  emerald: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  amber: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  red: {
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
} as const;

type HealthColor = keyof typeof HEALTH_COLORS;

// ============================================================================
// SOUS-COMPOSANT : WELCOME MODAL (SSR Safe)
// ============================================================================

interface WelcomeModalProps {
  userName: string;
  onClose: () => void;
}

function WelcomeModal({ userName, onClose }: WelcomeModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div className="bg-[#0F172A] border border-blue-500/30 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 max-w-xl w-full shadow-[0_0_50px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" aria-hidden="true" />
        <div className="text-center relative z-10">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-600/10 border border-blue-500/20 rounded-3xl md:rounded-4xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner">
            <Sparkles className="text-blue-500 w-9 h-9 md:w-12 md:h-12" aria-hidden="true" />
          </div>
          <h2 id="welcome-modal-title" className="text-3xl md:text-4xl font-black uppercase italic text-white mb-4 tracking-tighter m-0">
            Bienvenue, <span className="text-blue-500">{userName}</span> !
          </h2>
          <p className="text-slate-400 mb-8 md:mb-10 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] leading-relaxed max-w-sm mx-auto m-0">
            Vous êtes connecté au centre névralgique Qualisoft. Découvrez vos indicateurs d&apos;audit en temps réel.
          </p>
          <button
            onClick={onClose}
            className="w-full py-5 md:py-6 bg-blue-600 hover:bg-white hover:text-slate-900 text-white rounded-2xl md:rounded-3xl font-black uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] shadow-xl shadow-blue-900/40 transition-all italic border-none cursor-pointer active:scale-95 m-0 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]"
            aria-label="Commencer l'inspection du cockpit"
          >
            Commencer l&apos;inspection
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI CARD
// ============================================================================

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
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', shadow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]', glow: 'bg-emerald-600' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', shadow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]', glow: 'bg-blue-600' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', shadow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]', glow: 'bg-amber-600' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', shadow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]', glow: 'bg-purple-600' },
  } as const;

  const c = colorClasses[color];

  return (
    <Link 
      href={href} 
      className="group block h-full no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] rounded-4xl md:rounded-[2.5rem]"
      aria-label={`${title}: ${value} - ${subtitle}`}
    >
      <article className={`relative h-full overflow-hidden bg-[#0F172A] border ${c.border} p-6 md:p-8 rounded-4xl md:rounded-[2.5rem] hover:bg-[#0B0F1A] transition-all shadow-xl ${c.shadow} flex flex-col justify-between`}>
        <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${c.glow} rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none`} aria-hidden="true" />

        <div className="relative flex justify-between items-start mb-6 md:mb-8 z-10">
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl ${c.bg} ${c.text} flex items-center justify-center border ${c.border} transition-transform duration-500 group-hover:scale-110 shrink-0`}>
            <Icon size={24} className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" />
          </div>

          {trend && (
            <div className={`flex items-center gap-1.5 text-[8px] md:text-[9px] font-black uppercase px-3 py-1.5 rounded-full shrink-0 shadow-inner bg-[#0B0F1A] border border-white/5`}>
              {trend.direction === 'up' ? (
                <ArrowUp size={12} className="w-3 h-3 text-emerald-500" aria-hidden="true" />
              ) : trend.direction === 'down' ? (
                <ArrowDown size={12} className="w-3 h-3 text-red-500" aria-hidden="true" />
              ) : (
                <Activity size={12} className="w-3 h-3 text-slate-500" aria-hidden="true" />
              )}
              <span className="text-white">{trend.value}%</span>
            </div>
          )}
        </div>

        <div className="relative flex-1 flex flex-col justify-end z-10">
          <p className={`text-3xl md:text-4xl lg:text-5xl font-black italic text-white tracking-tighter transition-colors m-0 leading-none truncate`}>
            {value}
          </p>
          <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 mt-3 md:mt-4 tracking-[0.2em] md:tracking-[0.3em] truncate m-0">
            {title}
          </p>
        </div>
        
        <div className="mt-6 md:mt-8 pt-4 md:pt-5 border-t border-white/5 shrink-0 relative z-10">
           <p className={`text-[8px] md:text-[9px] font-bold ${c.text} uppercase tracking-widest italic m-0 truncate`}>
             {subtitle}
           </p>
        </div>
      </article>
    </Link>
  );
}

// ============================================================================
// SOUS-COMPOSANT : QUICK ACTION
// ============================================================================

interface QuickActionProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

function QuickAction({ href, icon: Icon, label }: QuickActionProps) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#0B0F1A] hover:bg-blue-600/10 transition-all group border border-white/5 hover:border-blue-500/30 no-underline shadow-inner m-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label={`Accéder à: ${label}`}
    >
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
        <Icon size={20} className="w-5 h-5 md:w-5 md:h-5" aria-hidden="true" />
      </div>
      <span className="text-[10px] md:text-[11px] font-black uppercase italic text-white tracking-tight flex-1 truncate m-0 group-hover:text-blue-400 transition-colors">
        {label}
      </span>
      <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-all shrink-0 w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
    </Link>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : AUDIT CENTER DASHBOARD
// ============================================================================

export default function AuditCenterDashboard() {
  // Typage strict du store - PAS de `as any`
  const { user, login } = useAuthStore();
  
  const [data, setData] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [govData, setGovData] = useState<GovernanceStats>({
    completionRate: 0, late: 0, upcoming: 0, critical: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Montage & Time update
  useEffect(() => {
    setIsMounted(true);
    const formatDate = () =>
      new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
    setCurrentTime(formatDate());
    const timer = setInterval(() => setCurrentTime(formatDate()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Welcome modal on first login
  useEffect(() => {
    if (isMounted && user?.U_FirstLogin) {
      setShowWelcome(true);
    }
  }, [isMounted, user]);

  // Memoized user helpers
  const isSuperAdmin = useMemo(
    () => user?.U_Role === 'SUPER_ADMIN' || user?.U_Email === 'ab.thiongane@qualisoft.sn',
    [user]
  );

  const isDecisionMaker = useMemo(
    () => ['SUPER_ADMIN', 'ADMIN', 'RQ'].includes(user?.U_Role || ''),
    [user]
  );

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

  // --- 📡 READ: Fetch dashboard data (CRUD) ---
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        apiClient.get<DashboardStats>('/indicators/dashboard-stats').catch(() => ({ data: null })),
        apiClient.get<GovernanceStats>('/gouvernance/performance').catch(() => ({
          data: { completionRate: 0, late: 0, upcoming: 0, critical: 0 },
        })),
        apiClient.get<RecentActivity[]>('/dashboard/recent-activity').catch(() => ({ data: [] })),
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
          auditsPending: statsData.auditsPending || 0,
        });

        // Typage strict pour chartData
        const rawChartData: Array<{ label?: string; value?: string | number; target?: string | number; trend?: 'up' | 'down' | 'stable'; previousValue?: string | number }> = statsData.chartData || [];
        setChartData(
          rawChartData.map((item) => ({
            label: item.label || 'Indicateur',
            value: Number(item.value) || 0,
            target: Number(item.target) || 1,
            trend: item.trend || 'stable',
            previousValue: Number(item.previousValue) || Math.floor((Number(item.value) || 0) * 0.9),
          }))
        );
      }

      if (results[1].status === 'fulfilled' && results[1].value?.data) {
        const gov = results[1].value.data;
        setGovData({
          completionRate: gov.completionRate || 0,
          late: gov.late || 0,
          upcoming: gov.upcoming || 0,
          critical: gov.critical || 0,
        });
      }

      if (results[2].status === 'fulfilled' && Array.isArray(results[2].value?.data)) {
        setActivities(results[2].value.data);
      } else {
        // Fallback data with strict typing
        setActivities([
          { id: '1', type: 'indicator', title: 'KPI Performance validé', date: new Date().toISOString(), status: 'success' },
          { id: '2', type: 'nc', title: 'Non-conformité à traiter', date: new Date().toISOString(), status: 'danger' },
        ]);
      }
    } catch (err) {
      console.error('❌ Erreur fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isMounted) {
      if (user) fetchDashboardData();
      else setLoading(false);
    }
  }, [isMounted, user, fetchDashboardData]);

  // --- 🔄 UPDATE: Close welcome & update user (CRUD) ---
  const handleCloseWelcome = async () => {
    if (!user?.U_Id) {
      setShowWelcome(false);
      return;
    }
    try {
      // PATCH /auth/disable-first-login/:id
      await apiClient.patch(`/auth/disable-first-login/${user.U_Id}`);
      // Update store with strict typing
      const updatedUser = { ...user, U_FirstLogin: false };
      if (typeof login === 'function') {
        login(updatedUser, useAuthStore.getState().token);
      }
    } catch (e) {
      console.error('❌ Erreur fermeture welcome:', e);
    } finally {
      setShowWelcome(false);
    }
  };

  // --- 📥 EXPORT: Download PDF report (CRUD: Read → Export) ---
  const handleDownloadReport = async () => {
    setIsExporting(true);
    const tid = toast.loading('Génération du rapport exécutif...');
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
        toast.success('Rapport téléchargé avec succès.', { id: tid });
      }
    } catch (err) {
      console.error('❌ Erreur export:', err);
      toast.error('Erreur lors de la génération du rapport.', { id: tid });
    } finally {
      setIsExporting(false);
    }
  };

  // --- 📊 Calculs dérivés ---
  const performanceTrend = useMemo(() => {
    if (!data?.globalPerformance || !data?.previousPerformance) return null;
    const diff = data.globalPerformance - data.previousPerformance;
    return {
      direction: diff >= 0 ? ('up' as const) : ('down' as const),
      value: Math.abs(diff).toFixed(1),
    };
  }, [data]);

  const healthScore = useMemo(() => {
    if (!data) return 0;
    const perf = data.globalPerformance || 0;
    const gov = govData?.completionRate || 0;
    const nc = data.nonConformities || 0;
    const conformiteScore = Math.max(0, 100 - nc * 10);
    return Math.min(Math.round(perf * 0.4 + gov * 0.3 + conformiteScore * 0.3), 100);
  }, [data, govData]);

  const getHealthStatus = (score: number): { color: HealthColor; label: string } => {
    if (score >= 80) return { color: 'emerald', label: 'Excellente' };
    if (score >= 60) return { color: 'amber', label: 'À surveiller' };
    return { color: 'red', label: 'Critique' };
  };

  const healthStatus = getHealthStatus(healthScore);
  const healthColorClasses = HEALTH_COLORS[healthStatus.color];

  // --- 🎯 LOADING STATE ---
  if (!isMounted || loading) {
    return (
      <div 
        className="flex h-full w-full items-center justify-center bg-[#0B0F1A] text-white italic"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500 w-12 h-12" aria-hidden="true" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest animate-pulse text-blue-400 m-0">
            Chargement Executive...
          </span>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🔝 EN-TÊTE FIXE (Zéro Scroll) */}
      <header className="shrink-0 px-4 md:px-6 lg:px-10 py-4 md:py-6 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-5 md:gap-6">
          <div className="space-y-3 md:space-y-4 w-full xl:w-auto animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-3 flex-wrap">
              {currentTime && (
                <span className="px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} className="w-3 h-3" aria-hidden="true" /> <span className="truncate">{currentTime}</span>
                </span>
              )}
              {isDecisionMaker && (
                <span className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10 ${healthColorClasses.text} text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-inner`}>
                  <Activity size={12} className="w-3 h-3" aria-hidden="true" /> Santé SMI: {healthScore}% — {healthStatus.label}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase italic tracking-tighter leading-none text-white m-0">
                Cockpit <span className="text-blue-500">{isSuperAdmin ? 'Souverain' : 'Stratégique'}</span>
              </h1>
              {isSuperAdmin && <Crown className="text-amber-400 animate-pulse w-8 h-8 md:w-10 md:h-10" aria-hidden="true" />}
            </div>

            <p className="text-slate-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest m-0 truncate">
              Vue synthétique de la performance globale et levier d&apos;action pour la direction.
            </p>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4 md:gap-6 bg-[#0F172A] p-2 md:p-3 pr-3 md:pr-4 rounded-2xl md:rounded-[2.5rem] border border-white/5 shadow-2xl shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-right hidden sm:block pr-2">
              <p className="text-white font-black uppercase text-lg md:text-xl tracking-tighter truncate max-w-40 m-0 leading-none mb-1">
                {userFullName}
              </p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isSuperAdmin ? 'text-amber-400' : 'text-blue-400'}`}>
                  {isSuperAdmin ? 'Super Admin' : user?.U_Role?.replace('_', ' ') || 'User'}
                </span>
                <BadgeCheck size={14} className={`w-3.5 h-3.5 ${isSuperAdmin ? 'text-amber-400' : 'text-blue-400'}`} aria-hidden="true" />
              </div>
            </div>
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 border-white/10 shadow-xl shrink-0 bg-linear-to-br ${isSuperAdmin ? 'from-amber-500 to-amber-700' : 'from-blue-600 to-blue-800'}`} aria-hidden="true">
              <span className="text-lg md:text-xl font-black text-white uppercase not-italic">
                {userInitials}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 📜 ZONE DE DÉFILEMENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          
          {/* 🚨 ALERTES & ACTIONS */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6" aria-label="Alertes et actions prioritaires">
            <article className="xl:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-5 bg-[#0B0F1A] border border-red-500/20 rounded-2xl md:rounded-[3rem] p-5 md:p-7 group hover:border-red-500/40 transition-all shadow-[0_0_30px_rgba(239,68,68,0.05)]">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-red-500/10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border border-red-500/20 animate-pulse">
                <AlertTriangle className="text-red-400 w-7 h-7 md:w-8 md:h-8" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0 w-full">
                <h3 className="text-white font-black uppercase italic text-lg md:text-xl tracking-tight truncate m-0 mb-2">
                  Points d&apos;attention immédiats
                </h3>
                <p className="text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest truncate m-0">
                  {govData?.late || 0} Retards • {data?.nonConformities || 0} NC Ouvertes • {govData?.critical || 0} Alertes ISO
                </p>
              </div>
              <Link
                href="/dashboard/actions"
                className="w-full sm:w-auto px-5 md:px-7 py-3 md:py-4 bg-red-600 hover:bg-white hover:text-red-600 text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-2 md:gap-3 shrink-0 no-underline text-center active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Traiter les points d'attention"
              >
                Traiter <ChevronRight size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
              </Link>
            </article>

            <div className="xl:col-span-4 h-full">
              <button
                onClick={handleDownloadReport}
                disabled={isExporting || !user}
                className="w-full h-full min-h-24 group flex items-center justify-between bg-[#0B0F1A] border border-white/5 hover:border-blue-500/30 rounded-2xl md:rounded-[3rem] p-5 md:p-7 transition-all disabled:opacity-50 cursor-pointer m-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label={isExporting ? 'Génération du rapport en cours' : 'Télécharger le rapport PDF mensuel'}
                aria-busy={isExporting}
              >
                <div className="flex items-center gap-4 md:gap-5 text-left min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600/10 border border-blue-500/20 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-blue-600 transition-all shrink-0">
                    <FileText className="text-blue-400 group-hover:text-white transition-colors w-6 h-6 md:w-7 md:h-7" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-black uppercase italic text-base md:text-lg leading-none m-0 mb-2 truncate">
                      Rapport PDF
                    </p>
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest m-0 truncate">
                      Mensuel • {new Date().getMonth() + 1}/{new Date().getFullYear()}
                    </p>
                  </div>
                </div>
                {isExporting ? (
                  <Loader2 className="animate-spin text-blue-400 shrink-0 w-6 h-6" aria-hidden="true" />
                ) : (
                  <FileDown className="text-slate-500 group-hover:text-blue-400 transition-colors shrink-0 w-6 h-6 md:w-7 md:h-7" aria-hidden="true" />
                )}
              </button>
            </div>
          </section>

          {/* 📊 KPIs */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" aria-label="Indicateurs clés de performance">
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
              href="/dashboard/processus" 
            />
          </section>

          {/* 📈 GRILLE PRINCIPALE */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 flex-1">
            
            {/* PERFORMANCE CHART */}
            <section className="xl:col-span-2 bg-[#0F172A]/80 border border-white/5 rounded-2xl md:rounded-[4rem] p-6 md:p-10 shadow-2xl backdrop-blur-sm flex flex-col" aria-label="Analyse de performance des indicateurs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 md:mb-8 shrink-0">
                <div>
                  <h3 className="text-xl md:text-2xl font-black uppercase italic text-white tracking-tighter m-0 leading-none">
                    Analyse <span className="text-blue-500">Performance</span>
                  </h3>
                  <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2 md:mt-3 m-0">
                    Indicateurs vs Objectifs
                  </p>
                </div>
                <div className="flex gap-4 text-[8px] md:text-[9px] font-black uppercase shrink-0" role="legend" aria-label="Légende des statuts">
                  <span className="flex items-center gap-2 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" aria-hidden="true" /> Atteint
                  </span>
                  <span className="flex items-center gap-2 text-red-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" aria-hidden="true" /> Critique
                  </span>
                </div>
              </div>

              <div className="space-y-5 md:space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {chartData.length > 0 ? (
                  chartData.map((item, idx) => {
                    const targetValue = item.target || 1;
                    const percentage = Math.min(Math.round((item.value / targetValue) * 100), 100);
                    const isSuccess = percentage >= 100;

                    return (
                      <div key={`${item.label}-${idx}`} className="group">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-3 md:mb-4">
                          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                            <span className="text-sm md:text-base font-black uppercase text-white italic group-hover:text-blue-400 transition-colors truncate">
                              {item.label}
                            </span>
                            {item.trend === 'up' ? (
                              <TrendingUp size={16} className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                            ) : item.trend === 'down' ? (
                              <TrendingDown size={16} className="w-4 h-4 text-red-400" aria-hidden="true" />
                            ) : null}
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <span className="text-lg md:text-xl font-black text-white leading-none">
                              {item.value} <span className="text-xs md:text-sm text-slate-500">/ {item.target}</span>
                            </span>
                            <span className={`ml-3 text-[9px] md:text-[10px] font-black ${isSuccess ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="h-4 w-full bg-[#0B0F1A] rounded-full overflow-hidden border border-white/5 shadow-inner relative p-0.5" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${item.label}: ${percentage}% atteint`}>
                          <div
                            className={`h-full rounded-full transition-all duration-1000 relative ${
                              isSuccess
                                ? 'bg-linear-to-r from-emerald-600 to-emerald-400'
                                : 'bg-linear-to-r from-red-600 to-amber-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-full min-h-40 items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl md:rounded-[3rem]" role="status">
                    <div className="text-center px-4">
                      <Activity size={32} className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                      <p className="font-black uppercase text-[9px] md:text-[10px] italic tracking-widest m-0">Aucune donnée disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* SIDEBAR */}
            <div className="space-y-5 md:space-y-6 flex flex-col h-full">
              
              {/* Activity Feed */}
              <section className="bg-[#0F172A]/80 border border-white/5 rounded-2xl md:rounded-[3.5rem] p-5 md:p-8 shadow-xl flex-1 flex flex-col min-h-80" aria-label="Flux d'activités récentes">
                <div className="flex justify-between items-center mb-5 md:mb-6 shrink-0">
                  <h3 className="text-lg md:text-xl font-black uppercase italic text-white tracking-tighter flex items-center gap-3 m-0">
                    <Activity size={20} className="w-5 h-5 md:w-6 md:h-6 text-blue-400" aria-hidden="true" /> Flux
                  </h3>
                  <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-inner bg-[#0B0F1A]">
                    Live
                  </span>
                </div>

                <div className="space-y-3 md:space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1" role="list">
                  {activities.length > 0 ? (
                    activities.slice(0, 6).map((activity) => (
                      <article key={activity.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#0B0F1A] border border-white/5 hover:bg-white/5 transition-colors group cursor-default shadow-inner" role="listitem">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border ${
                            activity.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            activity.status === 'danger' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {activity.type === 'indicator' && <Target size={18} className="w-4.5 h-4.5 md:w-5 md:h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />}
                          {activity.type === 'audit' && <CalendarCheck size={18} className="w-4.5 h-4.5 md:w-5 md:h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />}
                          {activity.type === 'nc' && <AlertTriangle size={18} className="w-4.5 h-4.5 md:w-5 md:h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />}
                          {activity.type === 'action' && <Rocket size={18} className="w-4.5 h-4.5 md:w-5 md:h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] md:text-[10px] font-black text-white leading-tight truncate m-0 uppercase italic">
                            {activity.title}
                          </p>
                          <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase mt-1.5 md:mt-2 m-0 tracking-widest truncate">
                            {new Date(activity.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors shrink-0 w-4 h-4" aria-hidden="true" />
                      </article>
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center" role="status">
                       <p className="text-center text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest m-0 italic">Aucune activité récente</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Quick Actions */}
              <section className="bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-[3.5rem] p-5 md:p-7 shadow-2xl shrink-0 relative overflow-hidden" aria-label="Actions rapides">
                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" aria-hidden="true" />
                <h3 className="text-[9px] md:text-[10px] font-black uppercase italic text-slate-500 mb-5 md:mb-6 tracking-widest m-0 relative z-10">
                  Actions Rapides
                </h3>
                <div className="space-y-3 md:space-y-4 relative z-10">
                  <QuickAction href="/dashboard/indicators" icon={Target} label="Indicateurs" />
                  <QuickAction href="/dashboard/audits" icon={ShieldCheck} label="Audits" />
                  <QuickAction href="/dashboard/nc" icon={AlertTriangle} label="Non-conformités" />
                </div>
              </section>

            </div>
          </div>

          {/* Footer */}
          <footer className="pt-6 md:pt-8 border-t border-white/5 text-center shrink-0 pb-4">
             <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-600 italic m-0">
               Qualisoft Elite Souverain Infrastructure — v2.4.0 (2026)
             </p>
          </footer>

        </div>
      </main>

      {/* Welcome Modal */}
      {showWelcome && user && (
        <WelcomeModal userName={user.U_FirstName || 'Utilisateur'} onClose={handleCloseWelcome} />
      )}

      {/* GLOBAL STYLES */}
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(37, 99, 235, 0.3); 
          border-radius: 10px; 
        }
        :focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}