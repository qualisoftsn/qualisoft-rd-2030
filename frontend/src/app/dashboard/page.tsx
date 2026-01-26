/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import apiClient from '../../core/api/api-client';
import WelcomeModal from '@/components/WelcomeModal';

import { 
  ShieldAlert, Zap, Loader2, ArrowUpRight, Building2, 
  FileDown, Sparkles, Layers, Activity, Target, 
  ShieldCheck, TrendingUp, BadgeCheck, Crown
} from 'lucide-react';

// --- INTERFACES DE DONNÉES STRICTES ---
interface DashboardStats {
  completionRate: number;
  globalPerformance: number;
  totalProcessus: number;
  totalIndicators: number;
}

interface ChartItem {
  label: string;
  value: number;
  target: number;
}

interface DashboardData {
  stats: DashboardStats;
  chartData: ChartItem[];
}

interface UserSession {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email: string;
  U_Role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  U_TenantName?: string;
  U_FirstLogin?: boolean;
  U_Tenant?: {
    T_SubscriptionStatus: string;
    T_Plan: string;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 1. GESTION DE L'HYDRATATION ET DE LA SESSION
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed: UserSession = JSON.parse(stored);
        setUser(parsed);
        if (parsed.U_FirstLogin) setShowWelcome(true);
      } catch {
        console.error("Échec lecture session");
        setLoading(false);
      }
    } else {
      setLoading(false); // Pas d'utilisateur, on arrête de charger
    }
  }, []);

  // 2. LOGIQUE D'AUTORITÉ SUPRÊME
  const isSuperAdmin = useMemo(() => 
    user?.U_Role === 'SUPER_ADMIN' || user?.U_Email === 'ab.thiongane@qualisoft.sn', 
  [user]);

  const canAccessAdminFeatures = useMemo(() => 
    isSuperAdmin || user?.U_Role === 'SUPER_ADMIN', 
  [isSuperAdmin, user]);

  // 3. RÉCUPÉRATION DES DONNÉES (Wrappé pour éviter les recréations)
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<DashboardData>('/indicators/dashboard-stats');
      setData(response.data);
    } catch {
      console.error("❌ Erreur de synchronisation des flux");
    } finally {
      setLoading(false); // ✅ Crucial pour briser la boucle
    }
  }, []);

  // 4. DÉCLENCHEMENT DU FETCH (Sécurisé par isMounted et user)
  useEffect(() => {
    if (isMounted && user) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, isMounted, user]);

  const handleCloseWelcome = async () => {
    if (!user) return;
    try {
      await apiClient.patch(`/auth/disable-first-login/${user.U_Id}`);
      const updatedUser = { ...user, U_FirstLogin: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowWelcome(false);
    } catch { 
      setShowWelcome(false); 
    }
  };

  const handleDownloadReport = async () => {
    setIsExporting(true);
    try {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      const response = await apiClient.get(`/indicators/export/pdf`, {
        params: { month, year },
        responseType: 'blob', 
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rapport_Performance_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Erreur génération rapport.");
    } finally { 
      setIsExporting(false); 
    }
  };

  // 🛡️ Gardien de chargement
  if (!isMounted || (loading && !data)) return (
    <div className="flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 italic">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin" size={40} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initialisation du Noyau Élite...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col p-8 space-y-8 animate-in fade-in duration-700 italic font-sans bg-[#0B0F1A] ml-72 overflow-y-auto">
      
      {/* 1. HEADER SOUVERAIN */}
      <header className="flex justify-between items-center border-b border-white/5 pb-8 shrink-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-blue-400">
            <Building2 size={18} />
            <span className="text-[12px] font-black uppercase tracking-[0.5em]">
              {isSuperAdmin ? "QUALISOFT PROPRIÉTAIRE" : (user?.U_TenantName || "INSTANCE ACTIVE")}
            </span>
            {isSuperAdmin && <Crown className="text-amber-400 animate-pulse" size={16} />}
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-white">
            Cockpit <span className="text-blue-600">
              {isSuperAdmin ? 'Souverain' : user?.U_Role === 'ADMIN' ? 'Stratégique' : 'Opérationnel'}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end leading-none">
            <span className="text-white font-black uppercase text-sm tracking-tighter">
              {user?.U_FirstName} {user?.U_LastName}
            </span>
            <div className="flex items-center gap-2 mt-1">
               <span className={`text-[9px] font-bold uppercase tracking-widest italic ${isSuperAdmin ? 'text-amber-500' : 'text-slate-500'}`}>
                 {isSuperAdmin ? 'SUPER ADMIN' : user?.U_Role}
               </span>
               <BadgeCheck size={12} className={isSuperAdmin ? 'text-amber-500' : 'text-blue-500'} />
            </div>
          </div>
          
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl ${isSuperAdmin ? 'bg-amber-600 shadow-amber-900/20' : 'bg-linear-to-br from-blue-600 to-indigo-700 shadow-blue-900/20'}`}>
             <span className="text-xl font-black text-white uppercase">
               {user?.U_FirstName.charAt(0)}{user?.U_LastName.charAt(0)}
             </span>
          </div>

          <button onClick={fetchDashboardData} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90">
            <Zap size={20} />
          </button>
        </div>
      </header>

      {/* 2. ACTIONS & TRIAL BANNER */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
           {user?.U_Tenant?.T_SubscriptionStatus === 'TRIAL' && (
             <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] px-4 py-2 rounded-full font-black uppercase italic animate-pulse">
               ⚡ Accès Intégral Élite (Période d&apos;essai)
             </span>
           )}
        </div>

        {canAccessAdminFeatures && (
          <button 
            onClick={handleDownloadReport}
            disabled={isExporting}
            className="group flex items-center gap-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <Sparkles className="text-amber-400" size={18} />
                <span>Rapport Performance PDF</span>
                <FileDown size={18} />
              </>
            )}
          </button>
        )}
      </div>

      {/* 3. GRILLE KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <StatCard title="Taux de Saisie" value={`${data?.stats?.completionRate || 0}%`} icon={Activity} color="blue" trend="État Mensuel" />
        <StatCard title="Performance" value={`${data?.stats?.globalPerformance || 0}%`} icon={Target} color="emerald" trend="Objectifs SMQ" />
        <StatCard title="Processus" value={data?.stats?.totalProcessus || 0} icon={Layers} color="purple" trend="Cartographie" />
        <StatCard title="Indicateurs" value={data?.stats?.totalIndicators || 0} icon={TrendingUp} color="orange" trend="Global" />
      </div>

      {/* 4. ANALYSE TEMPS RÉEL */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] shadow-3xl flex flex-col overflow-hidden">
          <div className="mb-10">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Focus Processus</h3>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Analyse temps réel de la performance</p>
          </div>
          
          <div className="space-y-8 flex-1 overflow-y-auto pr-4 custom-scrollbar">
            {data?.chartData && data.chartData.length > 0 ? data.chartData.map((item, idx) => (
              <ProgressBar 
                key={idx} 
                label={item.label} 
                count={item.value} 
                total={item.target} 
                color={item.value >= item.target ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"} 
              />
            )) : (
              <div className="flex h-full items-center justify-center text-slate-600 font-black uppercase text-[10px] italic border-2 border-dashed border-white/5 rounded-3xl">
                Synchronisation des données de performance...
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Link href="/dashboard/indicators" className="flex-1 group">
            <div className="h-full bg-blue-600 p-8 rounded-[3rem] flex flex-col justify-between shadow-2xl transition-all hover:-translate-y-1 border border-blue-400/20 group-hover:shadow-blue-500/30">
              <ShieldCheck size={32} className="text-white mb-4" />
              <h3 className="text-white text-3xl font-black uppercase italic tracking-tighter leading-none">Matrice de <br/>Pilotage</h3>
              <div className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-xl self-end group-hover:scale-110 transition-transform">
                <ArrowUpRight size={20}/>
              </div>
            </div>
          </Link>
          
          <div className="flex-1 bg-slate-900/60 border border-white/10 p-8 rounded-[3rem] flex flex-col justify-center items-center text-center shadow-xl">
             <ShieldAlert className="text-orange-500 mb-4 animate-bounce" size={40} />
             <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Retards de Saisie</span>
             <span className="text-4xl font-black italic text-white mt-2">
               {Math.max(0, (data?.stats?.totalIndicators || 0) - (Math.floor((data?.stats?.totalIndicators || 0) * ((data?.stats?.completionRate || 0)/100))))}
             </span>
             <p className="text-[9px] text-slate-600 uppercase font-bold mt-2 italic tracking-widest">Saisies requises</p>
          </div>
        </div>
      </div>

      {showWelcome && user && (
        <WelcomeModal 
          userName={user.U_FirstName} 
          onClose={handleCloseWelcome} 
        />
      )}
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function StatCard({ title, value, icon: Icon, color, trend }: { title: string; value: string | number; icon: any; color: string; trend: string }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20"
  };

  return (
    <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] hover:border-blue-500/30 transition-all shadow-xl group cursor-default">
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">{trend}</span>
      </div>
      <div className="mt-6">
        <p className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest">{title}</p>
        <span className="text-4xl font-black italic text-white">{value}</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = Math.min(Math.round((count / (total || 1)) * 100), 100);
  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-end px-2">
        <span className="text-[10px] font-black uppercase text-slate-400 italic group-hover:text-blue-400 transition-colors">{label}</span>
        <span className="text-sm font-black italic text-white">
          {count} <span className="text-[10px] text-slate-600 ml-1">/ {total}</span>
          <span className={`ml-3 text-[10px] ${percentage >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
            ({percentage}%)
          </span>
        </span>
      </div>
      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}