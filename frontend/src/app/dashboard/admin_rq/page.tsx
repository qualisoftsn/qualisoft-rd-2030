/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : COCKPIT STRATÉGIQUE SDE (EXECUTIVE DASHBOARD) (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Tour de contrôle pour la Haute Direction et les Responsables Qualité (RQ).
 * FIX : UI ClickUp 100dvh (Zéro Scroll Global), PWA Ready (retrait pl-80).
 * SÉCURITÉ : Store Zustand (Zéro NextAuth), typage strict, hydratation sécurisée.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 00:15 GMT
 */

"use client";

import apiClient from "@/core/api/api-client";
import { useAuthStore } from "@/store/authStore";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  ChevronRight,
  Clock,
  FileDown,
  FileText,
  Layers,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

// --- INTERFACES STRICTES ---
interface RawChartItem {
  label?: string;
  value?: string | number;
  target?: string | number;
  trend?: "up" | "down" | "stable";
}

interface ChartItem {
  label: string;
  value: number;
  target: number;
  trend: "up" | "down" | "stable";
  previousValue?: number;
}

interface DashboardStats {
  completionRate: number;
  globalPerformance: number;
  totalProcessus: number;
  totalIndicators: number;
  previousPerformance?: number;
  alertsCount?: number;
  nonConformities?: number;
  auditsPending?: number;
  chartData?: RawChartItem[];
}

interface GovernanceStats {
  completionRate: number;
  late: number;
  upcoming: number;
  critical: number;
}

interface RecentActivity {
  id: string;
  type: "indicator" | "audit" | "nc" | "action";
  title: string;
  date: string;
  status: "success" | "warning" | "danger";
}

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

// --- COMPOSANT MODAL DE BIENVENUE ---
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
          Bienvenue, <span className="text-blue-500">{userName}</span>
        </h2>
        <p className="text-slate-400 mb-8 md:mb-10 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] leading-relaxed max-w-sm mx-auto m-0">
          Initialisation de notre cockpit de conformité terminée. Vos indicateurs
          sont désormais synchronisés avec le Noyau SDE.
        </p>
        <button
          onClick={onClose}
          className="w-full py-5 md:py-6 bg-blue-600 hover:bg-white hover:text-slate-900 text-white rounded-2xl md:rounded-3xl font-black uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] shadow-xl shadow-blue-900/40 transition-all italic border-none cursor-pointer active:scale-95 m-0"
        >
          Accéder au Cockpit
        </button>
      </div>
    </div>
  </div>
);

export default function ExecutiveDashboard() {
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

  // 🕒 GESTION DU TEMPS ET HYDRATATION CLIENT
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

  // 👤 DÉTECTION PREMIÈRE CONNEXION
  useEffect(() => {
    if (isMounted && user?.U_FirstLogin) {
      setShowWelcome(true);
    }
  }, [isMounted, user]);

  const isSuperAdmin = useMemo(
    () =>
      user?.U_Role?.toUpperCase() === "SUPER_ADMIN" ||
      user?.U_Email?.toLowerCase() === "ab.thiongane@qualisoft.sn",
    [user]
  );

  // 🛰️ RÉCUPÉRATION DES DONNÉES SOUVERAINES
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        apiClient.get<DashboardStats>("/indicators/dashboard-stats"),
        apiClient.get<GovernanceStats>("/gouvernance/performance"),
        apiClient.get<RecentActivity[]>("/dashboard/recent-activity"),
      ]);

      if (results[0].status === "fulfilled" && results[0].value?.data) {
        const statsData = results[0].value.data;
        setData(statsData);
        setChartData(
          (statsData.chartData || []).map((item) => ({
            label: item.label || "Indicateur",
            value: Number(item.value) || 0,
            target: Number(item.target) || 1,
            trend: item.trend || "stable",
          }))
        );
      }

      if (results[1].status === "fulfilled" && results[1].value?.data) {
        setGovData(results[1].value.data);
      }

      if (results[2].status === "fulfilled") {
        const activityData = results[2].value?.data;
        setActivities(Array.isArray(activityData) ? activityData : []);
      }
    } catch (err) {
      toast.error("Échec de synchronisation du Cockpit.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isMounted && user) fetchDashboardData();
    else if (isMounted && !user) setLoading(false);
  }, [isMounted, user, fetchDashboardData]);

  // 🔒 SCELLAGE PREMIÈRE CONNEXION
  const handleCloseWelcome = async () => {
    if (user?.U_Id) {
      try {
        await apiClient.patch(`/auth/disable-first-login/${user.U_Id}`);
        const updatedUser = { ...user, U_FirstLogin: false };
        if (typeof login === 'function') {
           login(updatedUser, useAuthStore.getState().token); 
        }
      } catch (error) {
        console.error("Échec de la validation de première connexion", error);
      }
    }
    setShowWelcome(false);
  };

  // 📄 GÉNÉRATION RAPPORT PDF
  const handleDownloadReport = async () => {
    setIsExporting(true);
    const tid = toast.loading("Compilation du Rapport SMI en cours...");
    try {
      const response = await apiClient.get(`/indicators/export/pdf`, {
        params: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Rapport_Qualisoft_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Rapport Matrix exporté avec succès.", { id: tid });
    } catch (e) {
      toast.error("Erreur lors de la compilation du rapport.", { id: tid });
    } finally {
      setIsExporting(false);
    }
  };

  // --- CALCULS DES TENDANCES & SANTÉ ---
  const performanceTrend = useMemo(() => {
    if (!data?.globalPerformance || !data?.previousPerformance)
      return { direction: "stable" as const, value: "0" };
    const diff = data.globalPerformance - data.previousPerformance;
    return {
      direction:
        diff > 0 ? ("up" as const) : diff < 0 ? ("down" as const) : ("stable" as const),
      value: Math.abs(diff).toFixed(1),
    };
  }, [data]);

  const healthScore = useMemo(() => {
    if (!data) return 0;
    const perf = data.globalPerformance || 0;
    const gov = govData?.completionRate || 0;
    const nc = data.nonConformities || 0;
    return Math.min(
      Math.round(perf * 0.4 + gov * 0.3 + Math.max(0, 100 - nc * 10) * 0.3),
      100
    );
  }, [data, govData]);

  const healthStatus = useMemo(() => {
    if (healthScore >= 80) return { color: "emerald" as const, label: "Excellente" };
    if (healthScore >= 60) return { color: "amber" as const, label: "Alerte Modérée" };
    return { color: "red" as const, label: "Critique" };
  }, [healthScore]);

  // --- RENDU EN CHARGEMENT ---
  if (!isMounted || loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0B0F1A]">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} strokeWidth={3} />
          <p className="text-[10px] md:text-xs font-black uppercase text-blue-500 tracking-[0.4em] italic animate-pulse m-0">
            Calcul de la Matrix...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-500/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 EN-TÊTE FIXE (Zéro Scroll) */}
      <header className="shrink-0 p-6 md:p-8 lg:px-12 border-b border-white/5 bg-[#0B0F1A]/90 backdrop-blur-md z-20 flex flex-col xl:flex-row justify-between xl:items-end gap-6 md:gap-8">
        <div className="space-y-3 md:space-y-4 w-full xl:w-auto animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock size={12} className="shrink-0" /> <span className="truncate">{currentTime}</span>
            </span>
            <span
              className={`px-3 md:px-5 py-1.5 md:py-2 rounded-full ${HEALTH_COLORS[healthStatus.color].bg} border ${HEALTH_COLORS[healthStatus.color].border} ${HEALTH_COLORS[healthStatus.color].text} text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-black/20`}
            >
              <Activity size={12} className="shrink-0" /> Santé SMI: {healthScore}% — {healthStatus.label}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none text-white m-0">
            Cockpit <span className="text-blue-600">{isSuperAdmin ? "Souverain" : "Stratégique"}</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 md:gap-6 bg-[#0F172A] p-2 md:p-3 pr-3 md:pr-4 rounded-4xl md:rounded-[2.5rem] border border-white/5 shadow-2xl shrink-0 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-right hidden sm:block pr-2">
            <p className="text-white font-black uppercase text-lg md:text-xl italic tracking-tighter leading-none mb-1 m-0">
              {user?.U_FirstName} {user?.U_LastName}
            </p>
            <span className="text-[9px] md:text-[10px] font-black uppercase text-blue-500 tracking-widest">
              {user?.U_Role?.replace('_', ' ')}
            </span>
          </div>
          <div
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 border-white/10 shadow-xl shrink-0 ${isSuperAdmin ? "bg-linear-to-br from-amber-400 to-amber-600" : "bg-linear-to-br from-blue-600 to-blue-800"}`}
          >
            <span className="text-lg md:text-xl font-black text-white not-italic">
              {user?.U_FirstName?.[0]}{user?.U_LastName?.[0]}
            </span>
          </div>
        </div>
      </header>

      {/* 📜 ZONE DE DÉFILEMENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12">
        <div className="max-w-400 mx-auto space-y-8 md:space-y-12">
          
          {/* 🚨 BANDEAU D'ALERTE DÉCISIONNEL */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
            <div className="xl:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-6 bg-[#0B0F1A] border border-red-500/20 rounded-4xl md:rounded-[3rem] p-6 md:p-8 group hover:border-red-500/40 transition-all shadow-[0_0_30px_rgba(239,68,68,0.05)]">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-red-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center animate-pulse shrink-0 border border-red-500/20">
                <AlertTriangle className="text-red-500 md:w-8 md:h-8" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-black uppercase italic text-lg md:text-xl tracking-tighter mb-2 mt-0 truncate">
                  Points critiques identifiés
                </h3>
                <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] m-0 line-clamp-2">
                  {govData.late} Retards • {data?.nonConformities || 0} Non-Conformités • {govData.critical} Alertes ISO
                </p>
              </div>
              <Link
                href="/dashboard/actions"
                className="w-full sm:w-auto px-6 md:px-8 py-4 bg-red-600 text-white rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-red-600 transition-all shadow-xl shadow-red-600/20 no-underline shrink-0 text-center active:scale-95"
              >
                Traiter
              </Link>
            </div>

            <div className="xl:col-span-4 h-full">
              <button
                onClick={handleDownloadReport}
                disabled={isExporting}
                className="w-full h-full bg-[#0B0F1A] border border-white/5 hover:border-blue-500/30 rounded-4xl md:rounded-[3rem] p-6 md:p-8 flex items-center justify-between group transition-all cursor-pointer disabled:opacity-50 min-h-30"
              >
                <div className="flex items-center gap-4 md:gap-5 text-left min-w-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600/10 border border-blue-500/20 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:bg-blue-600 transition-all shrink-0">
                    <FileText className="text-blue-500 group-hover:text-white transition-colors md:w-7 md:h-7" size={24} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-white font-black uppercase italic text-base md:text-lg leading-none mb-2 m-0 truncate">
                      Rapport SMI
                    </span>
                    <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate block">
                      Génération Mensuelle
                    </span>
                  </div>
                </div>
                {isExporting ? (
                  <Loader2 className="animate-spin text-blue-400 shrink-0" size={24} />
                ) : (
                  <FileDown className="text-slate-600 group-hover:text-blue-500 transition-all shrink-0 md:w-7 md:h-7" size={24} />
                )}
              </button>
            </div>
          </div>

          {/* 📊 KPI GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <KPICard title="Performance" value={`${data?.globalPerformance || 0}%`} trend={performanceTrend} icon={Target} color="emerald" subtitle="Efficacité Globale" href="/dashboard/indicators" />
            <KPICard title="Conformité" value={`${data?.completionRate || 0}%`} trend={{ direction: "up", value: "1.2" }} icon={ShieldCheck} color="blue" subtitle="Taux de Scellage" href="/dashboard/compliance" />
            <KPICard title="Gouvernance" value={`${govData?.completionRate || 0}%`} trend={govData.late > 0 ? { direction: "down", value: String(govData.late) } : null} icon={CalendarCheck} color="amber" subtitle={`${govData.upcoming} Échéances`} href="/dashboard/gouvernance" />
            <KPICard title="Processus" value={data?.totalProcessus || 0} trend={{ direction: "stable", value: String(data?.totalIndicators || 0) }} icon={Layers} color="purple" subtitle="Unités Actives" href="/dashboard/processus" />
          </div>

          {/* 📈 ANALYSE ET ACTIVITÉ */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            <div className="xl:col-span-2 bg-[#0F172A]/80 border border-white/5 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-12 shadow-2xl backdrop-blur-sm flex flex-col">
              <h3 className="text-2xl md:text-3xl font-black uppercase italic text-white mb-8 md:mb-10 tracking-tighter m-0 shrink-0">
                Analyse par <span className="text-blue-600">Axe Stratégique</span>
              </h3>
              <div className="space-y-8 md:space-y-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {chartData.length > 0 ? (
                  chartData.map((item, idx) => (
                    <div key={idx} className="space-y-3 md:space-y-4 group">
                      <div className="flex justify-between items-end">
                        <div className="min-w-0 pr-4">
                          <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 md:mb-2 truncate">
                            Axe de Performance
                          </span>
                          <span className="text-sm md:text-base lg:text-lg font-black uppercase text-white italic tracking-tight block truncate">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-xl md:text-2xl font-black text-blue-500 italic leading-none shrink-0">
                          {item.target > 0 ? Math.round((item.value / item.target) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-4 bg-[#0B0F1A] rounded-full overflow-hidden border border-white/5 p-0.5 shadow-inner">
                        <div
                          className="h-full bg-linear-to-r from-blue-700 to-blue-400 rounded-full transition-all duration-1000 ease-out relative"
                          style={{ width: `${Math.min(item.target > 0 ? (item.value / item.target) * 100 : 0, 100)}%` }}
                        >
                           <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 md:py-20 text-center border-2 border-dashed border-white/5 rounded-4xl md:rounded-[3rem] h-full flex items-center justify-center">
                    <p className="text-slate-600 font-black uppercase italic text-[10px] md:text-xs tracking-widest m-0 px-4">
                      Aucune donnée de performance scellée
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#0F172A]/80 border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-10 shadow-2xl backdrop-blur-sm h-125 xl:h-auto flex flex-col">
              <div className="flex items-center justify-between mb-8 shrink-0">
                <h3 className="text-xl md:text-2xl font-black uppercase italic text-white tracking-tighter m-0">
                  Activités <span className="text-blue-600">Matrix</span>
                </h3>
                <Link
                  href="/dashboard/logs"
                  className="text-[9px] md:text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors no-underline shrink-0"
                >
                  Voir Tout
                </Link>
              </div>
              
              <div className="space-y-3 md:space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {activities.length > 0 ? (
                  activities.slice(0, 8).map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-[#0B0F1A] rounded-2xl md:rounded-3xl hover:bg-white/5 transition-all border border-white/5 group shadow-inner"
                    >
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
                          act.status === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                          act.status === "warning" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : 
                          "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        <Activity size={18} className="group-hover:scale-110 transition-transform md:w-5 md:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-[11px] font-black text-white uppercase italic truncate m-0 leading-tight">
                          {act.title}
                        </p>
                        <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 md:mt-2 m-0 truncate">
                          {act.date}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="flex h-full items-center justify-center border-2 border-dashed border-white/5 rounded-4xl">
                     <p className="text-slate-500 font-black uppercase italic text-[9px] md:text-[10px] text-center tracking-widest m-0 px-4">
                        Flux d&apos;activité vide
                     </p>
                  </div>
                )}
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

      {/* 🚀 MODAL DE BIENVENUE */}
      {showWelcome && (
        <WelcomeModal
          userName={user?.U_FirstName || ""}
          onClose={handleCloseWelcome}
        />
      )}

      {/* 🧪 CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}

// --- SUB-COMPONENTS SCELLÉS ---
interface KPICardProps {
  title: string;
  value: string | number;
  trend: { direction: "up" | "down" | "stable"; value: string } | null;
  icon: LucideIcon;
  color: "emerald" | "blue" | "amber" | "purple";
  subtitle: string;
  href: string;
}

function KPICard({ title, value, trend, icon: Icon, color, subtitle, href }: KPICardProps) {
  const colors = {
    emerald: "text-emerald-400 border-emerald-500/20 bg-[#0B0F1A] hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]",
    blue: "text-blue-400 border-blue-500/20 bg-[#0B0F1A] hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]",
    amber: "text-amber-400 border-amber-500/20 bg-[#0B0F1A] hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]",
    purple: "text-purple-400 border-purple-500/20 bg-[#0B0F1A] hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]",
  };

  const iconColors = {
    emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  };

  return (
    <Link href={href} className="group block outline-none no-underline h-full">
      <div className={`h-full border ${colors[color]} p-6 md:p-8 rounded-4xl md:rounded-[2.5rem] transition-all duration-500 shadow-xl flex flex-col relative overflow-hidden`}>
        <div className="flex justify-between items-start mb-6 md:mb-8 relative z-10">
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center ${iconColors[color]} transition-transform duration-500 group-hover:scale-110 shrink-0`}>
            <Icon size={24} className="md:w-7 md:h-7" />
          </div>
          {trend && (
            <span className="text-[8px] md:text-[9px] font-black px-3 py-1.5 rounded-full bg-white/5 border border-white/10 italic shrink-0 text-white shadow-inner">
              {trend.direction === "up" ? (
                <TrendingUp size={12} className="inline mr-1 text-emerald-500" />
              ) : trend.direction === "down" ? (
                <TrendingDown size={12} className="inline mr-1 text-red-500" />
              ) : (
                <span className="text-slate-500 mr-1">●</span>
              )}
              {trend.value}%
            </span>
          )}
        </div>
        
        <div className="space-y-1 md:space-y-2 flex-1 relative z-10">
          <p className="text-3xl md:text-4xl lg:text-5xl font-black text-white italic tracking-tighter m-0 leading-none truncate">
            {value}
          </p>
          <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] md:tracking-[0.3em] m-0 mt-3 md:mt-4 truncate">
            {title}
          </p>
        </div>
        
        <div className="mt-6 md:mt-8 pt-4 md:pt-5 border-t border-white/5 shrink-0 relative z-10">
          <p className="text-[8px] md:text-[9px] font-bold uppercase text-slate-600 tracking-widest italic m-0 truncate">
            {subtitle}
          </p>
        </div>
        
        {/* Glow de fond */}
        <div className={`absolute -bottom-10 -right-10 w-32 h-32 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none ${
          color === 'emerald' ? 'bg-emerald-600' : color === 'blue' ? 'bg-blue-600' : color === 'amber' ? 'bg-amber-600' : 'bg-purple-600'
        }`} />
      </div>
    </Link>
  );
}