'use client';

/**
 * 🛰️ MODULE : COCKPIT UNIVERSEL (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Tableau de bord principal, Hub de pilotage QHSE.
 * DESIGN : ClickUp High-Density, Bords nets, Mode sombre industriel.
 * DYNAMIQUE : Métriques adaptées au rôle (Zustand).
 * RÉVISION : 09 Mars 2026
 * -------------------------------------------------------------------------
 */

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { 
  TrendingUp, ShieldCheck, AlertTriangle, 
  Target, Activity, Zap, FileText, CheckCircle2 
} from 'lucide-react';
import { cn } from '@/core/utils/cn';

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useAuthStore() as any;

  return (
    <div className="h-full w-full bg-[#050810] text-white p-6 lg:p-8 flex flex-col gap-6 font-sans italic overflow-y-auto custom-scrollbar">
      
      {/* 👑 EN-TÊTE DU COCKPIT */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] m-0">
              Nœud {user?.tenantId || 'Souverain'} • En Ligne
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter m-0 leading-none">
            Cockpit <span className="text-blue-600">Global</span>
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">
            Bienvenue, {user?.U_FirstName} {user?.U_LastName} — {user?.U_Role || 'Opérateur'}
          </p>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2.5 bg-[#0B0F1A] border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-400 transition-all cursor-pointer flex items-center gap-2">
            <FileText size={14} /> Rapport Mensuel
          </button>
          <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-500 transition-all cursor-pointer flex items-center gap-2">
            <Zap size={14} /> Action Rapide
          </button>
        </div>
      </div>

      {/* 📊 GRILLE DES KPI (INDICATEURS CLÉS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <KPICard 
          title="Taux de Conformité" 
          value="94.2%" 
          trend="+2.1%" 
          icon={ShieldCheck} 
          color="text-emerald-500" 
          bg="bg-emerald-500/10" 
          border="border-emerald-500/20"
        />
        <KPICard 
          title="Risques Critiques" 
          value="3" 
          trend="-1" 
          trendDownIsGood 
          icon={AlertTriangle} 
          color="text-amber-500" 
          bg="bg-amber-500/10" 
          border="border-amber-500/20"
        />
        <KPICard 
          title="Objectifs Atteints" 
          value="18/24" 
          trend="En cours" 
          icon={Target} 
          color="text-blue-500" 
          bg="bg-blue-500/10" 
          border="border-blue-500/20"
        />
        <KPICard 
          title="Performance SMI" 
          value="A+" 
          trend="Stable" 
          icon={TrendingUp} 
          color="text-purple-500" 
          bg="bg-purple-500/10" 
          border="border-purple-500/20"
        />
      </div>

      {/* 🗺️ ZONE DE TRAVAIL PRINCIPALE (SPLIT SCREEN) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-100">
        
        {/* COLONNE GAUCHE : FLUX D'ACTIVITÉ */}
        <div className="lg:col-span-2 flex flex-col bg-[#0B0F1A] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Activity size={200} />
          </div>
          
          <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
            <h2 className="text-sm font-black uppercase tracking-widest text-white m-0">Programme d&apos;Amélioration (PAQ)</h2>
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-lg">ISO 9001 §10</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 relative z-10 pr-2">
            <ActionItem title="Mise à jour du document unique" status="Urgent" date="Aujourd'hui" />
            <ActionItem title="Revue de direction trimestrielle" status="Planifié" date="12 Mars 2026" />
            <ActionItem title="Audit interne processus Achat" status="En cours" date="En cours" />
            <ActionItem title="Sensibilisation SSE Nouveaux" status="Planifié" date="15 Mars 2026" />
            <ActionItem title="Évaluation fournisseur IT" status="En attente" date="20 Mars 2026" />
          </div>
        </div>

        {/* COLONNE DROITE : STATUT SYSTÈME */}
        <div className="flex flex-col bg-[#0B0F1A] border border-white/5 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-sm font-black uppercase tracking-widest text-white m-0 mb-6 shrink-0">Santé du Système</h2>
          
          <div className="flex-1 flex flex-col gap-4">
            <SystemStatus label="Gouvernance & Stratégie" score={98} />
            <SystemStatus label="Maîtrise Documentaire" score={100} />
            <SystemStatus label="Performance Processus" score={85} />
            <SystemStatus label="Santé & Sécurité (SSE)" score={92} />
            
            <div className="mt-auto pt-6 border-t border-white/5">
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex gap-4 items-center">
                <ShieldCheck size={24} className="text-blue-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest m-0">Audit Prêt</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest m-0 mt-1">Le système répond aux exigences ISO.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS UI ---

function KPICard({ title, value, trend, icon: Icon, color, bg, border, trendDownIsGood = false }: { title: string, value: string, trend: string, icon: React.ElementType, color: string, bg: string, border: string, trendDownIsGood?: boolean }) {
  const isPositiveTrend = trend.startsWith('+') || (trendDownIsGood && trend.startsWith('-'));
  
  return (
    <div className={cn("bg-[#0B0F1A] border rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group transition-all hover:scale-[1.02]", border)}>
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40", bg)} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={cn("p-2.5 rounded-xl", bg, color)}>
          <Icon size={20} />
        </div>
        <span className={cn(
          "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg",
          isPositiveTrend ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-400"
        )}>
          {trend}
        </span>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] m-0 mb-1">{title}</h3>
        <p className="text-2xl font-black text-white m-0 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function ActionItem({ title, status, date }: { title: string, status: string, date: string }) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-black/20 border border-white/5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3 min-w-0">
        <CheckCircle2 size={16} className="text-slate-600 group-hover:text-blue-500 shrink-0 transition-colors" />
        <span className="text-xs font-bold text-slate-300 truncate group-hover:text-white transition-colors">{title}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className={cn(
          "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
          status === "Urgent" ? "bg-rose-500/10 text-rose-500" : "bg-slate-800 text-slate-400"
        )}>{status}</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest w-20 text-right">{date}</span>
      </div>
    </div>
  );
}

function SystemStatus({ label, score }: { label: string, score: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-black text-white">{score}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", score >= 95 ? "bg-emerald-500" : score >= 85 ? "bg-blue-500" : "bg-amber-500")}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}