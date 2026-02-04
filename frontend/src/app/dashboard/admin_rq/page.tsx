/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import apiClient from "@/core/api/api-client";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
  Clock,
  Crown,
  FileDown,
  FileText,
  Layers,
  Loader2,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  chartData?: any[];
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

interface RecentActivity {
  id: string;
  type: "indicator" | "audit" | "nc" | "action";
  title: string;
  date: string;
  status: "success" | "warning" | "danger";
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

const WelcomeModal = ({
  userName,
  onClose,
}: {
  userName: string;
  onClose: () => void;
}) => (
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
          Vous êtes connecté à votre tableau de bord Qualisoft. Découvrez vos
          indicateurs en temps réel.
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
    critical: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
    const formatDate = () =>
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    setCurrentTime(formatDate());
    const timer = setInterval(() => setCurrentTime(formatDate()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed: UserSession = JSON.parse(stored);
        setUser(parsed);
        if (parsed.U_FirstLogin) setShowWelcome(true);
      }
    } catch (e) {
      console.error("Erreur parsing user:", e);
    }
  }, []);

  const isSuperAdmin = useMemo(
    () => user?.U_Role === "SUPER_ADMIN" || user?.U_Email === "ab.thiongane@qualisoft.sn",
    [user],
  );

  const isDecisionMaker = useMemo(
    () => ["SUPER_ADMIN", "ADMIN", "RQ"].includes(user?.U_Role || ""),
    [user],
  );

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        apiClient.get("/indicators/dashboard-stats"),
        apiClient.get("/gouvernance/performance"),
        apiClient.get("/dashboard/recent-activity"),
      ]);

      if (results[0].status === "fulfilled" && results[0].value?.data) {
        const statsData = results[0].value.data;
        setData(statsData);
        setChartData((statsData.chartData || []).map((item: any) => ({
          label: item.label || "Indicateur",
          value: Number(item.value) || 0,
          target: Number(item.target) || 1,
          trend: item.trend || "stable",
        })));
      }

      if (results[1].status === "fulfilled" && results[1].value?.data) {
        setGovData(results[1].value.data);
      }

      if (results[2].status === "fulfilled" && Array.isArray(results[2].value?.data)) {
        setActivities(results[2].value.data);
      }
    } catch (err) {
      console.error("Erreur fetch dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isMounted && user) fetchDashboardData();
    else if (isMounted && !user) setLoading(false);
  }, [isMounted, user, fetchDashboardData]);

  const handleCloseWelcome = async () => {
    if (user?.U_Id) {
      await apiClient.patch(`/auth/disable-first-login/${user.U_Id}`).catch(() => {});
      const updatedUser = { ...user, U_FirstLogin: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    setShowWelcome(false);
  };

  const handleDownloadReport = async () => {
    setIsExporting(true);
    try {
      const response = await apiClient.get(`/indicators/export/pdf`, {
        params: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Rapport_Qualisoft_${Date.now()}.pdf`);
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  // 🟢 CORRECTION DE L'ERREUR DE TYPE ICI
  // const performanceTrend = useMemo((): { direction: "up" | "down" | "stable"; value: string } | null => {
  //   if (!data?.globalPerformance || !data?.previousPerformance) return null;
  //   const diff = data.globalPerformance - data.previousPerformance;
  //   return {
  //     direction: diff > 0 ? "up" : diff < 0 ? "down" : "stable",
  //     value: Math.abs(diff).toFixed(1),
  //   };
  // }, [data]);

  const healthScore = useMemo(() => {
    if (!data) return 0;
    const perf = data.globalPerformance || 0;
    const gov = govData?.completionRate || 0;
    const nc = data.nonConformities || 0;
    return Math.min(Math.round(perf * 0.4 + gov * 0.3 + Math.max(0, 100 - nc * 10) * 0.3), 100);
  }, [data, govData]);

  const healthStatus = useMemo(() => {
    if (healthScore >= 80) return { color: "emerald" as const, label: "Excellente" };
    if (healthScore >= 60) return { color: "amber" as const, label: "À surveiller" };
    return { color: "red" as const, label: "Critique" };
  }, [healthScore]);

  if (!isMounted || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F1A]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 lg:p-10 space-y-8 animate-in fade-in duration-700 italic font-sans bg-[#0B0F1A] overflow-y-auto">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/10 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Clock size={12} /> {currentTime}
            </span>
            <span className={`px-4 py-1.5 rounded-full bg-white/5 border border-white/10 ${HEALTH_COLORS[healthStatus.color].text} text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
              <Activity size={12} /> Santé SMI: {healthScore}% {healthStatus.label}
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none text-white">
            Cockpit <span className="text-blue-500">{isSuperAdmin ? "Souverain" : "Stratégique"}</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden lg:block">
            <p className="text-white font-black uppercase text-lg tracking-tighter">
              {user?.U_FirstName} {user?.U_LastName}
            </p>
            <span className="text-[10px] font-bold uppercase text-blue-400">{user?.U_Role}</span>
          </div>
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border-2 border-white/10 bg-linear-to-br ${isSuperAdmin ? "from-amber-500 to-amber-700" : "from-blue-600 to-blue-800"}`}>
            <span className="text-2xl font-black text-white">{user?.U_FirstName?.[0]}{user?.U_LastName?.[0]}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex items-center gap-4 bg-linear-to-r from-red-500/20 to-amber-500/20 border border-red-500/30 rounded-4xl p-6">
          <AlertTriangle className="text-red-400" size={32} />
          <div className="flex-1">
            <h3 className="text-white font-black uppercase italic text-lg">Points d&apos;attention</h3>
            <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">
              {govData.late} retards • {data?.nonConformities} NC • {govData.critical} alertes
            </p>
          </div>
          <Link href="/dashboard/actions" className="px-6 py-3 bg-red-600 text-white rounded-2xl font-black uppercase text-[11px]">Voir</Link>
        </div>
        <div className="lg:col-span-4">
          <button onClick={handleDownloadReport} className="w-full h-full bg-white/5 border border-white/10 rounded-4xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <FileText className="text-blue-500" size={32} />
               <span className="text-white font-black uppercase italic text-sm">Rapport Mensuel</span>
            </div>
            {isExporting ? <Loader2 className="animate-spin text-blue-400" /> : <FileDown className="text-slate-400" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Performance" value={`${data?.globalPerformance || 0}%`} trend={{ direction: "up", value: "2.4" }} icon={Target} color="emerald" subtitle="vs mois précédent" href="/dashboard/indicators" />
        <KPICard title="Conformité" value={`${data?.completionRate || 0}%`} trend={{ direction: "up", value: "2.4" }} icon={ShieldCheck} color="blue" subtitle="Objectifs SMI" href="/dashboard/compliance" />
        <KPICard title="Gouvernance" value={`${govData?.completionRate || 0}%`} trend={{ direction: (govData?.late || 0) > 0 ? "down" : "up", value: String(govData?.late || 0) }} icon={CalendarCheck} color="amber" subtitle={`${govData?.upcoming} échéances`} href="/dashboard/gouvernance" />
        <KPICard title="Processus" value={data?.totalProcessus || 0} trend={{ direction: "stable", value: String(data?.totalIndicators || 0) }} icon={Layers} color="purple" subtitle="Indicateurs actifs" href="/dashboard/processes" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-[3rem] p-8">
           <h3 className="text-2xl font-black uppercase italic text-white mb-8">Analyse Performance</h3>
           <div className="space-y-6">
             {chartData.map((item, idx) => (
               <div key={idx} className="space-y-2">
                 <div className="flex justify-between text-sm font-black uppercase text-white italic">
                   <span>{item.label}</span>
                   <span>{Math.round((item.value/item.target)*100)}%</span>
                 </div>
                 <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-600" style={{ width: `${Math.min((item.value/item.target)*100, 100)}%` }} />
                 </div>
               </div>
             ))}
           </div>
        </div>
        <div className="space-y-6">
           <div className="bg-slate-900/50 border border-white/10 rounded-[3rem] p-6">
             <h3 className="text-lg font-black uppercase italic text-white mb-6">Flux Activité</h3>
             <div className="space-y-4">
               {activities.slice(0, 5).map(act => (
                 <div key={act.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${act.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      <Activity size={16} />
                    </div>
                    <span className="text-xs font-bold text-white truncate">{act.title}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>

      {showWelcome && <WelcomeModal userName={user?.U_FirstName || ""} onClose={handleCloseWelcome} />}
    </div>
  );
}

// --- SUB-COMPONENTS ---
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
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    blue: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    purple: "text-purple-400 border-purple-500/20 bg-purple-500/10",
  };

  return (
    <Link href={href} className="group block">
      <div className={`bg-slate-900/50 border ${colors[color]} p-6 rounded-[2.5rem] hover:-translate-y-1 transition-all`}>
        <div className="flex justify-between mb-4">
          <Icon size={32} className={colors[color].split(' ')[0]} />
          {trend && (
            <span className={`text-[10px] font-black px-2 py-1 rounded-full bg-white/10`}>
              {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "●"} {trend.value}%
            </span>
          )}
        </div>
        <p className="text-4xl font-black text-white">{value}</p>
        <p className="text-xs font-bold uppercase text-slate-400 mt-1">{title}</p>
        <p className="text-[10px] uppercase text-slate-500">{subtitle}</p>
      </div>
    </Link>
  );
}