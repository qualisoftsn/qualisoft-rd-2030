/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : COCKPIT UNIVERSEL CENTRALISÉ (ELITE-SDE)
 * RÔLE : Tableau de bord unique s'adaptant dynamiquement au rôle
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { 
  Loader2, ShieldCheck, Activity, Target, 
  AlertTriangle, TrendingUp, CheckCircle2, 
  FileText, Zap, Users, AlertCircle
} from "lucide-react";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'AUDITEUR' | 'OBSERVATEUR' | 'USER';

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email: string;
  U_Role: UserRole;
  tenantId?: string;
  U_Actif?: boolean;
}

export interface KPICardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ElementType;
  color: 'emerald' | 'blue' | 'amber' | 'purple';
  isAlert?: boolean;
}

export interface ActionItemProps {
  title: string;
  status: 'Urgent' | 'Planifié' | 'En cours' | 'Attente';
  date: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface SystemStatusProps {
  label: string;
  score: number;
}

export interface LoadingStateProps {
  label: string;
  sublabel: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING STATE
// ============================================================================

function LoadingState({ label, sublabel }: LoadingStateProps) {
  return (
    <div 
      className="h-full min-h-[calc(100vh-2rem)] bg-[#0B0F1A] flex items-center justify-center font-sans italic select-none"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6 md:gap-8">
        <div className="relative" aria-hidden="true">
          <div className="w-16 h-16 md:w-20 md:h-20 border-b-2 border-blue-600 rounded-full animate-spin" />
          <Loader2
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-pulse w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8"
            aria-hidden="true"
          />
        </div>
        <div className="text-center space-y-1 md:space-y-2">
          <p className="text-white font-black text-[10px] md:text-xs uppercase tracking-widest animate-pulse m-0">
            {label}
          </p>
          <p className="text-slate-600 text-[8px] md:text-[9px] font-bold uppercase tracking-widest m-0">
            {sublabel}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI CARD
// ============================================================================

function KPICard({ title, value, trend, icon: Icon, color, isAlert = false }: KPICardProps) {
  const colorClasses: Record<KPICardProps['color'], string> = {
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
    purple: "text-purple-400"
  };

  return (
    <article 
      className="bg-black/40 border border-white/5 shadow-inner rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between relative overflow-hidden group hover:bg-white/5 transition-colors focus-within:ring-2 focus-within:ring-blue-400"
      role="article"
      aria-label={`${title}: ${value}`}
      tabIndex={0}
    >
      <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
        <div className={cn(
          "p-2 md:p-3 rounded-xl md:rounded-2xl bg-[#0B0F1A] border border-white/5 shadow-lg",
          colorClasses[color]
        )}>
          <Icon size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" strokeWidth={2.5} aria-hidden="true" />
        </div>
        <span className={cn(
          "text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border",
          isAlert ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        )}>
          {trend}
        </span>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest m-0 mb-1 md:mb-2">{title}</h3>
        <p className="text-2xl md:text-3xl font-black text-white m-0 tracking-tighter">{value}</p>
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ACTION ITEM
// ============================================================================

function ActionItem({ title, status, date, onClick, onKeyDown }: ActionItemProps) {
  const isUrgent = status === 'Urgent';

  return (
    <div 
      className="flex items-center justify-between p-3 md:p-4 bg-[#0B0F1A] border border-white/5 rounded-xl md:rounded-2xl hover:border-blue-500/30 transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="listitem"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={`Action: ${title}`}
    >
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <CheckCircle2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-700 group-hover:text-blue-400 shrink-0 transition-colors" aria-hidden="true" />
        <span className="text-[10px] md:text-[11px] font-bold text-slate-300 truncate group-hover:text-white transition-colors tracking-wide">{title}</span>
      </div>
      <div className="flex items-center gap-3 md:gap-4 shrink-0 ml-3 md:ml-4">
        <span className={cn(
          "text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border",
          isUrgent ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-white/5 text-slate-400 border-white/5"
        )}>{status}</span>
        <span className="text-[8px] md:text-[9px] font-bold text-slate-600 uppercase tracking-widest w-20 md:w-24 text-right hidden md:block">{date}</span>
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SYSTEM STATUS
// ============================================================================

function SystemStatus({ label, score }: SystemStatusProps) {
  const getColorClass = (score: number): string => {
    if (score >= 95) return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    if (score >= 85) return "bg-blue-500";
    return "bg-amber-500";
  };

  return (
    <div className="space-y-2 md:space-y-3" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${score}%`}>
      <div className="flex justify-between items-end">
        <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[9px] md:text-[10px] font-black text-white">{score}%</span>
      </div>
      <div 
        className="h-1.5 md:h-2 w-full bg-[#0B0F1A] rounded-full overflow-hidden border border-white/5"
        role="presentation"
      >
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", getColorClass(score))}
          style={{ width: `${score}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function UniversalCockpit() {
  const { user } = useAuthStore() as { user: User | null };
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => setIsReady(true), 800);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const role: UserRole = (user?.U_Role?.toUpperCase() as UserRole) || 'OBSERVATEUR';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isReadOnly = role === 'OBSERVATEUR';

  const kpiData = useMemo(() => [
    { title: 'Taux de Conformité', value: '94.2%', trend: '+2.1%', icon: ShieldCheck, color: 'emerald' as const },
    { 
      title: isSuperAdmin ? 'Tenants Actifs' : 'Objectifs Atteints', 
      value: isSuperAdmin ? '12' : '18/24', 
      trend: isSuperAdmin ? 'Global' : 'En cours', 
      icon: isSuperAdmin ? Users : Target, 
      color: 'blue' as const 
    },
    { title: 'Risques Critiques', value: '3', trend: '-1 ce mois', icon: AlertTriangle, color: 'amber' as const, isAlert: true },
    { title: 'Performance Globale', value: 'A+', trend: 'Stable', icon: TrendingUp, color: 'purple' as const }
  ], [isSuperAdmin]);

  const actionItems = useMemo(() => [
    { title: "Mise à jour du document unique d'évaluation", status: 'Urgent' as const, date: "Aujourd'hui" },
    { title: "Revue de direction trimestrielle", status: 'Planifié' as const, date: "12 Mars 2026" },
    { title: "Audit interne processus Achat & Supply", status: 'En cours' as const, date: "En cours" },
    { title: "Sensibilisation SSE Nouveaux Arrivants", status: 'Planifié' as const, date: "10 Avril 2026" },
    { title: "Évaluation fournisseur IT Annuelle", status: 'Attente' as const, date: "20 Mars 2026" }
  ], []);

  const systemStatuses = useMemo(() => [
    { label: 'Gouvernance & Stratégie', score: 98 },
    { label: 'Maîtrise Documentaire', score: 100 },
    { label: 'Performance Processus', score: 85 },
    { label: 'Santé & Sécurité (SSE)', score: 92 }
  ], []);

  if (!isReady || !user) {
    return <LoadingState label="Initialisation du Cockpit Central..." sublabel="Génération des modules selon l'accréditation" />;
  }

  return (
    <div className="h-full bg-[#0B0F1A] text-white p-4 md:p-6 lg:p-8 flex flex-col gap-4 md:gap-6 font-sans italic overflow-y-auto custom-scrollbar select-none">
      
      {/* 👑 HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-1 md:space-y-2">
          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]" aria-hidden="true" />
            <p className="text-[8px] md:text-[9px] font-black text-blue-400 uppercase tracking-widest m-0">
              {isSuperAdmin ? "Nœud Master (Siège)" : `Tenant : ${user?.tenantId || 'N/A'}`} • Actif
            </p>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black uppercase tracking-tighter m-0 leading-none">
            Cockpit <span className="text-blue-400">SMI</span>
          </h1>
          <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 md:mt-2 m-0">
            {user?.U_FirstName} {user?.U_LastName} — Accréditation : <span className="text-white">{role}</span>
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button 
              type="button"
              className="px-4 md:px-5 py-2.5 md:py-3 bg-black/40 border border-white/10 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-400 transition-all cursor-pointer flex items-center gap-1.5 md:gap-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Voir la synthèse ISO"
            >
              <FileText size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
              <span className="hidden sm:inline">Synthèse ISO</span>
            </button>
            <button 
              type="button"
              className="px-4 md:px-5 py-2.5 md:py-3 bg-blue-600 text-white rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-white hover:text-blue-700 transition-all cursor-pointer flex items-center gap-1.5 md:gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Créer une nouvelle action"
            >
              <Zap size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
              <span className="hidden sm:inline">Nouvelle Action</span>
            </button>
          </div>
        )}
      </header>

      {/* 📊 KPI GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5 shrink-0 animate-in fade-in duration-1000 delay-100" role="list" aria-label="Indicateurs clés de performance">
        {kpiData.map((kpi, i) => (
          <KPICard 
            key={i}
            title={kpi.title}
            value={kpi.value}
            trend={kpi.trend}
            icon={kpi.icon}
            color={kpi.color}
            isAlert={kpi.isAlert}
          />
        ))}
      </section>

      {/* 🗺️ MAIN WORKSPACE */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 min-h-[400px] md:min-h-[500px]">
        
        {/* COLONNE GAUCHE : FLUX D'ACTIVITÉ */}
        <section className="lg:col-span-2 flex flex-col bg-black/40 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-inner relative overflow-hidden">
          <div className="absolute -top-6 md:-top-8 lg:-top-10 -right-6 md:-right-8 lg:-right-10 opacity-[0.03] pointer-events-none" aria-hidden="true">
            <Activity size={200} className="w-40 h-40 md:w-50 md:h-50 lg:w-60 lg:h-60" />
          </div>
          
          <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0 relative z-10">
            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white m-0">
              {role === 'AUDITEUR' ? "Planning des Audits" : "Programme d'Actions (PAQ)"}
            </h2>
            <span className="text-[7px] md:text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl">
              ISO 9001 §10
            </span>
          </div>

          <div 
            className="flex-1 overflow-y-auto custom-scrollbar space-y-2 relative z-10 pr-1 md:pr-2" 
            role="list"
            aria-label="Liste des actions"
          >
            {actionItems.map((item, i) => (
              <ActionItem 
                key={i}
                title={item.title}
                status={item.status}
                date={item.date}
              />
            ))}
          </div>
        </section>

        {/* COLONNE DROITE : STATUT SYSTÈME */}
        <section className="flex flex-col bg-black/40 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-inner relative overflow-hidden">
          <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white m-0 mb-4 md:mb-6 lg:mb-8 shrink-0 relative z-10">Santé du Système</h2>
          
          <div className="flex-1 flex flex-col justify-center gap-4 md:gap-5 lg:gap-6 relative z-10">
            {systemStatuses.map((status, i) => (
              <SystemStatus 
                key={i}
                label={status.label}
                score={status.score}
              />
            ))}
          </div>

          <div className="mt-4 md:mt-6 lg:mt-8 pt-4 md:pt-6 border-t border-white/5 relative z-10">
            <article className="bg-blue-600/10 border border-blue-500/20 rounded-xl md:rounded-2xl p-3 md:p-4 flex gap-3 md:gap-4 items-center" role="status">
              <ShieldCheck size={20} className="w-5 h-5 md:w-6 md:h-6 text-blue-400 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest m-0">Audit Prêt</p>
                <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest m-0 mt-0.5 md:mt-1">Le système est aligné ISO.</p>
              </div>
            </article>
          </div>
        </section>

      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}