/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { 
  Loader2, ShieldCheck, Activity, Target, 
  AlertTriangle, TrendingUp, CheckCircle2, 
  FileText, Zap, Users
} from "lucide-react";
import { cn } from "@/core/utils/cn";

/**
 * 🛰️ MODULE : COCKPIT UNIVERSEL CENTRALISÉ (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Tableau de bord unique s'adaptant dynamiquement au rôle.
 * DESIGN : Héritage du design Régalien (Fond #0B0F1A, Italique, Haute Densité).
 * DYNAMIQUE : Affichage conditionnel selon U_Role (Zéro redirection externe).
 * -------------------------------------------------------------------------
 */
export default function UniversalCockpit() {
  const { user } = useAuthStore() as any;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Séquence d'initialisation du Cockpit (Effet visuel Matrix)
    if (user) {
      const timer = setTimeout(() => setIsReady(true), 800);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // 🌀 ÉCRAN DE CHARGEMENT SOUVERAIN (Ton design exact)
  if (!isReady || !user) {
    return (
      <div className="h-full min-h-[calc(100vh-2rem)] bg-[#0B0F1A] flex items-center justify-center font-sans italic select-none">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="w-20 h-20 border-b-2 border-blue-600 rounded-full animate-spin" />
            <Loader2
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse"
              size={24}
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-white font-black text-xs uppercase tracking-[0.4em] animate-pulse">
              Initialisation du Cockpit Central...
            </p>
            <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">
              Génération des modules selon l&apos;accréditation
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🛡️ ANALYSE DES DROITS POUR L'AFFICHAGE DYNAMIQUE
  const role = user?.U_Role?.toUpperCase() || "OBSERVATEUR";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isReadOnly = role === "OBSERVATEUR";

  return (
    <div className="h-full bg-[#0B0F1A] text-white p-6 lg:p-8 flex flex-col gap-6 font-sans italic overflow-y-auto custom-scrollbar select-none">
      
      {/* 👑 EN-TÊTE DU COCKPIT */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] m-0">
              {isSuperAdmin ? "Nœud Master (Siège)" : `Tenant : ${user?.tenantId}`} • Actif
            </p>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter m-0 leading-none">
            Cockpit <span className="text-blue-600">SMI</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
            {user?.U_FirstName} {user?.U_LastName} — Accréditation : <span className="text-white">{role}</span>
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex gap-3">
            <button className="px-5 py-3 bg-black/40 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:border-blue-500 hover:text-blue-400 transition-all cursor-pointer flex items-center gap-2 shadow-inner">
              <FileText size={14} /> Synthèse ISO
            </button>
            <button className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-white hover:text-black transition-all cursor-pointer flex items-center gap-2">
              <Zap size={14} /> Nouvelle Action
            </button>
          </div>
        )}
      </div>

      {/* 📊 GRILLE DES KPI (Adaptative) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0 animate-in fade-in duration-1000 delay-100">
        <KPICard 
          title="Taux de Conformité" 
          value="94.2%" 
          trend="+2.1%" 
          icon={ShieldCheck} 
          color="text-emerald-500" 
        />
        <KPICard 
          title={isSuperAdmin ? "Tenants Actifs" : "Objectifs Atteints"} 
          value={isSuperAdmin ? "12" : "18/24"} 
          trend={isSuperAdmin ? "Global" : "En cours"} 
          icon={isSuperAdmin ? Users : Target} 
          color="text-blue-500" 
        />
        <KPICard 
          title="Risques Critiques" 
          value="3" 
          trend="-1 ce mois" 
          icon={AlertTriangle} 
          color="text-amber-500" 
          isAlert 
        />
        <KPICard 
          title="Performance Globale" 
          value="A+" 
          trend="Stable" 
          icon={TrendingUp} 
          color="text-purple-500" 
        />
      </div>

      {/* 🗺️ ZONE DE TRAVAIL PRINCIPALE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-100">
        
        {/* COLONNE GAUCHE : FLUX D'ACTIVITÉ */}
        <div className="lg:col-span-2 flex flex-col bg-black/40 border border-white/5 rounded-3xl p-6 shadow-inner relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none">
            <Activity size={300} />
          </div>
          
          <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
            <h2 className="text-xs font-black uppercase tracking-widest text-white m-0">
              {role === 'AUDITEUR' ? "Planning des Audits" : "Programme d'Actions (PAQ)"}
            </h2>
            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg">
              ISO 9001 §10
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 relative z-10 pr-2">
            <ActionItem title="Mise à jour du document unique d'évaluation" status="Urgent" date="Aujourd'hui" />
            <ActionItem title="Revue de direction trimestrielle" status="Planifié" date="12 Mars 2026" />
            <ActionItem title="Audit interne processus Achat & Supply" status="En cours" date="En cours" />
            <ActionItem title="Sensibilisation SSE Nouveaux Arrivants" status="Planifié" date="15 Mars 2026" />
            <ActionItem title="Évaluation fournisseur IT Annuelle" status="Attente" date="20 Mars 2026" />
          </div>
        </div>

        {/* COLONNE DROITE : STATUT SYSTÈME */}
        <div className="flex flex-col bg-black/40 border border-white/5 rounded-3xl p-6 shadow-inner relative overflow-hidden">
          <h2 className="text-xs font-black uppercase tracking-widest text-white m-0 mb-8 shrink-0 relative z-10">Santé du Système</h2>
          
          <div className="flex-1 flex flex-col justify-center gap-6 relative z-10">
            <SystemStatus label="Gouvernance & Stratégie" score={98} />
            <SystemStatus label="Maîtrise Documentaire" score={100} />
            <SystemStatus label="Performance Processus" score={85} />
            <SystemStatus label="Santé & Sécurité (SSE)" score={92} />
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex gap-4 items-center">
              <ShieldCheck size={24} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest m-0">Audit Prêt</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest m-0 mt-1">Le système est aligné ISO.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 🧪 CSS POUR SCROLLBAR CACHÉE MAIS FONCTIONNELLE */}
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// --- SOUS-COMPOSANTS UI (Intégrés pour simplifier le fichier) ---

function KPICard({ title, value, trend, icon: Icon, color, isAlert = false }: any) {
  return (
    <div className="bg-black/40 border border-white/5 shadow-inner rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group hover:bg-white/2 transition-colors">
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={cn("p-3 rounded-2xl bg-[#0B0F1A] border border-white/5 shadow-lg", color)}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <span className={cn(
          "text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border",
          isAlert ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        )}>
          {trend}
        </span>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] m-0 mb-2">{title}</h3>
        <p className="text-3xl font-black text-white m-0 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function ActionItem({ title, status, date }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#0B0F1A] border border-white/5 rounded-2xl hover:border-blue-500/30 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4 min-w-0">
        <CheckCircle2 size={16} className="text-slate-700 group-hover:text-blue-500 shrink-0 transition-colors" />
        <span className="text-[11px] font-bold text-slate-300 truncate group-hover:text-white transition-colors tracking-wide">{title}</span>
      </div>
      <div className="flex items-center gap-4 shrink-0 ml-4">
        <span className={cn(
          "text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border",
          status === "Urgent" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-white/5 text-slate-400 border-white/5"
        )}>{status}</span>
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest w-24 text-right hidden md:block">{date}</span>
      </div>
    </div>
  );
}

function SystemStatus({ label, score }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-black text-white">{score}%</span>
      </div>
      <div className="h-2 w-full bg-[#0B0F1A] rounded-full overflow-hidden border border-white/5">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", score >= 95 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : score >= 85 ? "bg-blue-500" : "bg-amber-500")}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
