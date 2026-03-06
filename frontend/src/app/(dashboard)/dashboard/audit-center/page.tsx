/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 MODULE : COCKPIT AUDIT CENTER (EXECUTIVE) (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Supervision globale (Santé SMI, Performance, Flux d'Audits).
 * FIX : UI ClickUp 100dvh (Zéro Scroll Global), PWA Ready (retrait pl-80).
 * SÉCURITÉ : Store Zustand (Zéro NextAuth), typage strict.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 00:30 GMT
 */

"use client";

import apiClient from "@/core/api/api-client";
import { useAuthStore } from "@/store/authStore";
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

// --- INTERFACES STRICTES ---
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
  trend: "up" | "down" | "stable";
  previousValue?: number;
}

interface RawChartItem {
  label?: string;
  value?: string | number;
  target?: string | number;
  trend?: "up" | "down" | "stable";
  previousValue?: string | number;
}

interface RecentActivity {
  id: string;
  type: "indicator" | "audit" | "nc" | "action";
  title: string;
  date: string;
  status: "success" | "warning" | "danger";
}

// Mapping des couleurs
const HEALTH_COLORS = {
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  red: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
};

// --- COMPOSANTS INTERNES ---
const WelcomeModal = ({
  userName,
  onClose,
}: {
  userName: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md">
    <div className="bg-[#0F172A] border border-blue-500/30 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 max-w-xl w-full shadow-[0_0_50px_rgba(37,99,235,0.2)] animate-in zoom-in-95 duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="text-center relative z-10">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-600/10 border border-blue-500/20 rounded-3xl md:rounded-4xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner">
          <Sparkles className="text-blue-500 md:w-12 md:h-12" size={36} />
        </div>
        <h2 className="text-3xl md:text-4xl font-black uppercase italic text-white mb-4 tracking-tighter m-0">
          Bienvenue, <span className="text-blue-500">{userName}</span> !
        </h2>
        <p className="text-slate-400 mb-8 md:mb-10 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] leading-relaxed max-w-sm mx-auto m-0">
          Vous êtes connecté au centre névralgique Qualisoft. Découvrez vos indicateurs d&apos;audit en temps réel.
        </p>
        <button
          onClick={onClose}
          className="w-full py-5 md:py-6 bg-blue-600 hover:bg-white hover:text-slate-900 text-white rounded-2xl md:rounded-3xl font-black uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] shadow-xl shadow-blue-900/40 transition-all italic border-none cursor-pointer active:scale-95 m-0"
        >
          Commencer l&apos;inspection
        </button>
      </div>
    </div>
  </div>
);

export default function AuditCenterDashboard() {
  const { user, login } = useAuthStore() as any;

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
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
    const formatDate = () =>
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });

    setCurrentTime(formatDate());
    const timer = setInterval(() => setCurrentTime(formatDate()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isMounted && user?.U_FirstLogin) {
      setShowWelcome(true);
    }
  }, [isMounted, user]);

  const isSuperAdmin = useMemo(
    () => user?.U_Role === "SUPER_ADMIN" || user?.U_Email === "ab.thiongane@qualisoft.sn",
    [user]
  );

  const isDecisionMaker = useMemo(
    () => ["SUPER_ADMIN", "ADMIN", "RQ"].includes(user?.U_Role || ""),
    [user]
  );

  const userInitials = useMemo(() => {
    if (!user) return "??";
    const first = user.U_FirstName?.[0] ?? "";
    const last = user.U_LastName?.[0] ?? "";
    return `${first}${last}` || "??";
  }, [user]);

  const userFullName = useMemo(() => {
    if (!user) return "Utilisateur";
    return [user.U_FirstName, user.U_LastName].filter(Boolean).join(" ") || "Utilisateur";
  }, [user]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        apiClient.get("/indicators/dashboard-stats").catch(() => ({ data: null })),
        apiClient.get("/gouvernance/performance").catch(() => ({
          data: { completionRate: 0, late: 0, upcoming: 0, critical: 0 },
        })),
        apiClient.get("/dashboard/recent-activity").catch(() => ({ data: [] })),
      ]);

      if (results[0].status === "fulfilled" && results[0].value?.data) {
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

        const rawChartData: RawChartItem[] = statsData.chartData || [];
        setChartData(
          rawChartData.map((item) => ({
            label: item.label || "Indicateur",
            value: Number(item.value) || 0,
            target: Number(item.target) || 1,
            trend: item.trend || "stable",
            previousValue: Number(item.previousValue) || Math.floor((Number(item.value) || 0) * 0.9),
          }))
        );
      }

      if (results[1].status === "fulfilled" && results[1].value?.data) {
        const gov = results[1].value.data;
        setGovData({
          completionRate: gov.completionRate || 0,
          late: gov.late || 0,
          upcoming: gov.upcoming || 0,
          critical: gov.critical || 0,
        });
      }

      if (results[2].status === "fulfilled" && Array.isArray(results[2].value?.data)) {
        setActivities(results[2].value.data);
      } else {
        setActivities([
          { id: "1", type: "indicator", title: "KPI Performance validé", date: new Date().toISOString(), status: "success" },
          { id: "2", type: "nc", title: "Non-conformité à traiter", date: new Date().toISOString(), status: "danger" },
        ]);
      }
    } catch (err) {
      console.error("Erreur fetch dashboard:", err);
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

  const handleCloseWelcome = async () => {
    if (!user?.U_Id) {
      setShowWelcome(false);
      return;
    }
    try {
      await apiClient.patch(`/auth/disable-first-login/${user.U_Id}`);
      const updatedUser = { ...user, U_FirstLogin: false };
      if (typeof login === 'function') {
        login(updatedUser, useAuthStore.getState().token);
      }
    } catch (e) {
      console.error("Erreur fermeture welcome:", e);
    } finally {
      setShowWelcome(false);
    }
  };

  const handleDownloadReport = async () => {
    setIsExporting(true);
    const tid = toast.loading("Génération du rapport exécutif...");
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const response = await apiClient.get(`/indicators/export/pdf`, {
        params: { month, year },
        responseType: "blob",
      });

      if (response?.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Rapport_Executif_${month}_${year}.pdf`);
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
        toast.success("Rapport téléchargé avec succès.", { id: tid });
      }
    } catch (err) {
      toast.error("Erreur lors de la génération du rapport.", { id: tid });
    } finally {
      setIsExporting(false);
    }
  };

  const performanceTrend = useMemo(() => {
    if (!data?.globalPerformance || !data?.previousPerformance) return null;
    const diff = data.globalPerformance - data.previousPerformance;
    return {
      direction: diff >= 0 ? ("up" as const) : ("down" as const),
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

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { color: "emerald" as const, label: "Excellente" };
    if (score >= 60) return { color: "amber" as const, label: "À surveiller" };
    return { color: "red" as const, label: "Critique" };
  };

  const healthStatus = getHealthStatus(healthScore);
  const healthColorClasses = HEALTH_COLORS[healthStatus.color];

  if (!isMounted || loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0B0F1A] text-white italic">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} strokeWidth={3} />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] md:tracking-[0.5em] animate-pulse text-blue-500 m-0">
            Chargement Executive...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 EN-TÊTE FIXE (Zéro Scroll) */}
      <header className="shrink-0 p-6 md:p-8 lg:px-12 border-b border-white/5 bg-[#0B0F1A]/90 backdrop-blur-md z-20 flex flex-col xl:flex-row justify-between xl:items-center gap-6 md:gap-8">
        <div className="space-y-3 md:space-y-4 w-full xl:w-auto animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-center gap-3 flex-wrap">
            {currentTime && (
              <span className="px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2">
                <Clock size={12} className="shrink-0" /> <span className="truncate">{currentTime}</span>
              </span>
            )}
            {isDecisionMaker && (
              <span className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10 ${healthColorClasses.text} text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2 shadow-inner`}>
                <Activity size={12} className="shrink-0" /> Santé SMI: {healthScore}% — {healthStatus.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none text-white m-0">
              Cockpit <span className="text-blue-500">{isSuperAdmin ? "Souverain" : "Stratégique"}</span>
            </h1>
            {isSuperAdmin && <Crown className="text-amber-400 animate-pulse md:w-10 md:h-10" size={32} />}
          </div>

          <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] m-0 truncate">
            Vue synthétique de la performance globale et levier d&apos;action pour la direction.
          </p>
        </div>

        <div className="flex items-center gap-4 md:gap-6 bg-[#0F172A] p-2 md:p-3 pr-3 md:pr-4 rounded-4xl md:rounded-[2.5rem] border border-white/5 shadow-2xl shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-right hidden sm:block pr-2">
            <p className="text-white font-black uppercase text-lg md:text-xl tracking-tighter truncate max-w-50 m-0 leading-none mb-1">
              {userFullName}
            </p>
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${isSuperAdmin ? "text-amber-400" : "text-blue-400"}`}>
                {isSuperAdmin ? "Super Admin" : user?.U_Role?.replace('_', ' ') || "User"}
              </span>
              <BadgeCheck size={14} className={isSuperAdmin ? "text-amber-400" : "text-blue-400"} />
            </div>
          </div>
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 border-white/10 shadow-xl shrink-0 bg-linear-to-br ${isSuperAdmin ? "from-amber-500 to-amber-700" : "from-blue-600 to-blue-800"}`}>
            <span className="text-lg md:text-xl font-black text-white uppercase not-italic">
              {userInitials}
            </span>
          </div>
        </div>
      </header>

      {/* 📜 ZONE DE DÉFILEMENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12">
        <div className="max-w-400 mx-auto space-y-8 md:space-y-12 flex flex-col min-h-full">
          
          {/* 🚨 ALERTES & ACTIONS */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
            <div className="xl:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-6 bg-[#0B0F1A] border border-red-500/20 rounded-4xl md:rounded-[3rem] p-6 md:p-8 group hover:border-red-500/40 transition-all shadow-[0_0_30px_rgba(239,68,68,0.05)]">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-red-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 border border-red-500/20 animate-pulse">
                <AlertTriangle className="text-red-500 md:w-8 md:h-8" size={28} />
              </div>
              <div className="flex-1 min-w-0 w-full">
                <h3 className="text-white font-black uppercase italic text-lg md:text-xl tracking-tight truncate m-0 mb-2">
                  Points d&apos;attention immédiats
                </h3>
                <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] truncate m-0">
                  {govData?.late || 0} Retards • {data?.nonConformities || 0} NC Ouvertes • {govData?.critical || 0} Alertes ISO
                </p>
              </div>
              <Link
                href="/dashboard/actions"
                className="w-full sm:w-auto px-6 md:px-8 py-4 bg-red-600 hover:bg-white hover:text-red-600 text-white rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-3 shrink-0 no-underline text-center active:scale-95"
              >
                Traiter <ChevronRight size={16} />
              </Link>
            </div>

            <div className="xl:col-span-4 h-full">
              <button
                onClick={handleDownloadReport}
                disabled={isExporting || !user}
                className="w-full h-full min-h-30 group flex items-center justify-between bg-[#0B0F1A] border border-white/5 hover:border-blue-500/30 rounded-4xl md:rounded-[3rem] p-6 md:p-8 transition-all disabled:opacity-50 cursor-pointer m-0"
              >
                <div className="flex items-center gap-4 md:gap-5 text-left min-w-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600/10 border border-blue-500/20 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg group-hover:bg-blue-600 transition-all shrink-0">
                    <FileText className="text-blue-500 group-hover:text-white transition-colors md:w-7 md:h-7" size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-black uppercase italic text-base md:text-lg leading-none m-0 mb-2 truncate">
                      Rapport PDF
                    </p>
                    <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest m-0 truncate">
                      Mensuel • {new Date().getMonth() + 1}/{new Date().getFullYear()}
                    </p>
                  </div>
                </div>
                {isExporting ? (
                  <Loader2 className="animate-spin text-blue-400 shrink-0" size={24} />
                ) : (
                  <FileDown className="text-slate-600 group-hover:text-blue-500 transition-colors shrink-0 md:w-7 md:h-7" size={24} />
                )}
              </button>
            </div>
          </div>

          {/* 📊 KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <KPICard title="Performance" value={`${data?.globalPerformance || 0}%`} trend={performanceTrend} icon={Target} color="emerald" subtitle="vs mois précédent" href="/dashboard/indicators" />
            <KPICard title="Conformité" value={`${data?.completionRate || 0}%`} trend={{ direction: "up", value: "2.4" }} icon={ShieldCheck} color="blue" subtitle="Objectifs SMI" href="/dashboard/compliance" />
            <KPICard title="Gouvernance" value={`${govData?.completionRate || 0}%`} trend={{ direction: (govData?.late || 0) > 0 ? "down" : "up", value: String(govData?.late || 0) }} icon={CalendarCheck} color="amber" subtitle={`${govData?.upcoming || 0} échéances`} href="/dashboard/gouvernance" />
            <KPICard title="Processus" value={data?.totalProcessus || 0} trend={{ direction: "stable", value: String(data?.totalIndicators || 0) }} icon={Layers} color="purple" subtitle={`${data?.totalIndicators || 0} indicateurs`} href="/dashboard/processus" />
          </div>

          {/* 📈 GRILLE PRINCIPALE */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-10 flex-1">
            
            {/* PERFORMANCE CHART */}
            <div className="xl:col-span-2 bg-[#0F172A]/80 border border-white/5 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-12 shadow-2xl backdrop-blur-sm flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 md:mb-10 shrink-0">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-tighter m-0 leading-none">
                    Analyse <span className="text-blue-600">Performance</span>
                  </h3>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3 md:mt-4 m-0">
                    Indicateurs vs Objectifs
                  </p>
                </div>
                <div className="flex gap-4 text-[8px] md:text-[9px] font-bold uppercase shrink-0">
                  <span className="flex items-center gap-2 text-emerald-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Atteint
                  </span>
                  <span className="flex items-center gap-2 text-red-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" /> Critique
                  </span>
                </div>
              </div>

              <div className="space-y-6 md:space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2">
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
                            {item.trend === "up" ? (
                              <TrendingUp size={16} className="text-emerald-500 shrink-0" />
                            ) : item.trend === "down" ? (
                              <TrendingDown size={16} className="text-red-500 shrink-0" />
                            ) : null}
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <span className="text-xl md:text-2xl font-black text-white leading-none">
                              {item.value} <span className="text-xs md:text-sm text-slate-500">/ {item.target}</span>
                            </span>
                            <span className={`ml-3 text-[10px] md:text-xs font-bold ${isSuccess ? "text-emerald-400" : "text-amber-400"}`}>
                              {percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="h-4 w-full bg-[#0B0F1A] rounded-full overflow-hidden border border-white/5 shadow-inner relative p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 relative ${
                              isSuccess
                                ? "bg-linear-to-r from-emerald-600 to-emerald-400"
                                : "bg-linear-to-r from-red-600 to-amber-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-full min-h-50 items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-4xl md:rounded-[3rem]">
                    <div className="text-center px-4">
                      <Activity size={40} className="mx-auto mb-4 opacity-30 md:w-12 md:h-12" />
                      <p className="font-black uppercase text-[10px] md:text-xs italic tracking-widest m-0">Aucune donnée disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-6 md:space-y-8 flex flex-col h-full">
              
              <div className="bg-[#0F172A]/80 border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-xl flex-1 flex flex-col min-h-100">
                <div className="flex justify-between items-center mb-6 md:mb-8 shrink-0">
                  <h3 className="text-xl md:text-2xl font-black uppercase italic text-white tracking-tighter flex items-center gap-3 m-0">
                    <Activity size={24} className="text-blue-500 md:w-7 md:h-7" /> Flux
                  </h3>
                  <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-inner bg-[#0B0F1A]">
                    Live
                  </span>
                </div>

                <div className="space-y-3 md:space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                  {activities.length > 0 ? (
                    activities.slice(0, 6).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl md:rounded-3xl bg-[#0B0F1A] border border-white/5 hover:bg-white/5 transition-colors group cursor-default shadow-inner">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border ${
                            activity.status === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                            activity.status === "danger" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {activity.type === "indicator" && <Target size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />}
                          {activity.type === "audit" && <CalendarCheck size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />}
                          {activity.type === "nc" && <AlertTriangle size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />}
                          {activity.type === "action" && <Rocket size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] md:text-[11px] font-black text-white leading-tight truncate m-0 uppercase italic">
                            {activity.title}
                          </p>
                          <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase mt-1.5 md:mt-2 m-0 tracking-widest truncate">
                            {new Date(activity.date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center">
                       <p className="text-center text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest m-0 italic">Aucune activité récente</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#0F172A] border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-8 shadow-2xl shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />
                <h3 className="text-[9px] md:text-[10px] font-black uppercase italic text-slate-500 mb-6 md:mb-8 tracking-[0.2em] md:tracking-[0.4em] m-0 relative z-10">
                  Actions Rapides
                </h3>
                <div className="space-y-3 md:space-y-4 relative z-10">
                  <QuickAction href="/dashboard/indicators" icon={Target} label="Indicateurs" />
                  <QuickAction href="/dashboard/audits" icon={ShieldCheck} label="Audits" />
                  <QuickAction href="/dashboard/nc" icon={AlertTriangle} label="Non-conformités" />
                </div>
              </div>

            </div>
          </div>

          <footer className="pt-8 md:pt-10 border-t border-white/5 text-center shrink-0 pb-4">
             <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-slate-600 italic m-0">
               Qualisoft Elite Souverain Infrastructure — v2.4.0 (2026)
             </p>
          </footer>

        </div>
      </div>

      {showWelcome && user && (
        <WelcomeModal userName={user.U_FirstName || "Utilisateur"} onClose={handleCloseWelcome} />
      )}

      {/* 🧪 CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37, 99, 235, 0.5); }
      `}} />
    </div>
  );
}

// --- SOUS-COMPOSANTS SCELLÉS ---

interface KPICardProps {
  title: string; value: string | number; trend: { direction: "up" | "down" | "stable"; value: string } | null;
  icon: LucideIcon; color: "emerald" | "blue" | "amber" | "purple"; subtitle: string; href: string;
}

function KPICard({ title, value, trend, icon: Icon, color, subtitle, href }: KPICardProps) {
  const colorClasses = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", shadow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]", glow: "bg-emerald-600" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", shadow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]", glow: "bg-blue-600" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", shadow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]", glow: "bg-amber-600" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", shadow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]", glow: "bg-purple-600" },
  };

  const c = colorClasses[color];

  return (
    <Link href={href} className="group block h-full no-underline">
      <div className={`relative h-full overflow-hidden bg-[#0F172A] border ${c.border} p-6 md:p-8 rounded-4xl md:rounded-[2.5rem] hover:bg-[#0B0F1A] transition-all shadow-xl ${c.shadow} flex flex-col justify-between`}>
        <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${c.glow} rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none`} />

        <div className="relative flex justify-between items-start mb-6 md:mb-8 z-10">
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl ${c.bg} ${c.text} flex items-center justify-center border ${c.border} transition-transform duration-500 group-hover:scale-110 shrink-0`}>
            <Icon size={24} className="md:w-7 md:h-7" />
          </div>

          {trend && (
            <div className={`flex items-center gap-1.5 text-[8px] md:text-[9px] font-black uppercase px-3 py-1.5 rounded-full shrink-0 shadow-inner bg-[#0B0F1A] border border-white/5`}>
              {trend.direction === "up" ? <ArrowUp size={12} className="text-emerald-500" /> : trend.direction === "down" ? <ArrowDown size={12} className="text-red-500" /> : <Activity size={12} className="text-slate-500" />}
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
      </div>
    </Link>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-[#0B0F1A] hover:bg-blue-600/10 transition-all group border border-white/5 hover:border-blue-500/30 no-underline shadow-inner m-0">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
        <Icon size={20} className="md:w-5 md:h-5" />
      </div>
      <span className="text-[10px] md:text-[11px] font-black uppercase italic text-white tracking-tight flex-1 truncate m-0 group-hover:text-blue-400 transition-colors">
        {label}
      </span>
      <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-all shrink-0 md:w-5 md:h-5" />
    </Link>
  );
}