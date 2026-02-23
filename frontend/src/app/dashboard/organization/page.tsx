/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛡️ NOM ABSOLU : src/app/dashboard/organization/page.tsx
 * FONCTION : Cockpit de Pilotage de l'Architecture et des Ressources.
 * RÔLE : Monitoring de la structure (§5.3 Rôles, Responsabilités et Autorités ISO 9001).
 * ARCHITECTURE : One-Pager (No-Scroll Global), Densité Haute, Thème Dark Matrix.
 * DONNÉES : 100% Production. Calculées en temps réel via l'API.
 */

"use client";

import {
  Activity, AlertCircle, AlertTriangle, ArrowUpRight, BarChart3,
  Building2, ChevronRight, Clock, FolderTree, GitGraph, Globe,
  Layers, MapPin, Plus, ShieldCheck, Target, TrendingUp,
  UserCircle, Users, Loader2, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import apiClient from "@/core/api/api-client";
import { toast, Toaster } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 🛡️ INTERFACES SCELLÉES SDE ---
interface OrgUnit {
  UN_Id: string;
  UN_Type: string;
  UN_ManagerId: string | null;
}

interface OrgSite {
  SI_Id: string;
  SI_Name: string;
  SI_Location: string;
  SI_Status?: 'ACTIF' | 'WARNING';
  _count?: { units: number; users: number };
}

interface OrgUser {
  U_Id: string;
}

interface OrgAlert {
  AL_Id: string;
  AL_Priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  AL_Message: string;
  AL_Entity: string;
  AL_Action?: string;
}

interface CalculatedStats {
  totalUnits: number;
  totalSites: number;
  totalUsers: number;
  unitsByType: { type: string; count: number; color: string }[];
  coverageRate: number;
  alerts: OrgAlert[];
  sites: OrgSite[];
}

export default function OrganizationDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CalculatedStats>({
    totalUnits: 0, totalSites: 0, totalUsers: 0,
    unitsByType: [], coverageRate: 0, alerts: [], sites: []
  });

  /**
   * 🛰️ PROTOCOLE DE RÉCUPÉRATION ET CALCUL DES DONNÉES (PRODUCTION)
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Requêtes parallèles vers le Noyau SDE
      const [resUnits, resSites, resUsers, resAlerts] = await Promise.all([
        apiClient.get<OrgUnit[]>('/units').catch(() => ({ data: [] })),
        apiClient.get<OrgSite[]>('/sites').catch(() => ({ data: [] })),
        apiClient.get<OrgUser[]>('/users').catch(() => ({ data: [] })),
        apiClient.get<OrgAlert[]>('/alerts?category=ORGANIZATION').catch(() => ({ data: [] }))
      ]);

      const units = resUnits.data;
      const sites = resSites.data;
      const users = resUsers.data;
      const alerts = resAlerts.data;

      // 🧠 MOTEUR DE CALCUL DES KPIs
      const totalUnits = units.length;
      const managedUnits = units.filter(u => u.UN_ManagerId !== null).length;
      const coverageRate = totalUnits > 0 ? Math.round((managedUnits / totalUnits) * 100) : 0;

      // Agrégation par type d'unité
      const typeMap: Record<string, number> = {};
      units.forEach(u => { typeMap[u.UN_Type] = (typeMap[u.UN_Type] || 0) + 1; });
      
      const colors = ["bg-blue-600", "bg-emerald-600", "bg-amber-600", "bg-purple-600"];
      const unitsByType = Object.keys(typeMap).map((key, index) => ({
        type: key,
        count: typeMap[key],
        color: colors[index % colors.length]
      })).sort((a, b) => b.count - a.count); // Tri décroissant

      setStats({
        totalUnits,
        totalSites: sites.length,
        totalUsers: users.length,
        coverageRate,
        unitsByType,
        alerts,
        sites
      });

    } catch (error) {
      toast.error("ÉCHEC DE SYNCHRONISATION AVEC L'ARCHITECTURE MATRIX.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  /**
   * 🏥 CALCULATEUR DE SANTÉ ORGANISATIONNELLE
   */
  const globalHealth = useMemo(() => {
    if (stats.totalUnits === 0) return 0;
    return Math.round((stats.coverageRate + (stats.totalUsers > 0 ? 100 : 0)) / 2);
  }, [stats]);

  if (loading) {
    return (
      <div className="ml-80 h-screen flex items-center justify-center bg-[#0B0F1A] italic">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={40} />
          <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.5em] animate-pulse">
            Scan de l&apos;architecture Matrix en cours...
          </p>
        </div>
      </div>
    );
  }

  return (
    // 📏 Cadrage One-Pager : h-screen et overflow-hidden
    <div className="ml-80 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 selection:bg-blue-600/30 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🚀 HEADER : CONTEXTE ET ACTIONS RAPIDES */}
      <header className="shrink-0 flex justify-between items-end border-b-2 border-white/5 pb-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
              <Clock size={12} /> {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck size={12} /> ISO 9001 §5.3
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white leading-none m-0 flex items-center gap-3">
            Architecture <span className="text-blue-500">SMI</span>
            <button onClick={fetchDashboardData} className="p-1.5 bg-white/5 rounded-lg hover:text-blue-500 cursor-pointer border-none transition-colors"><RefreshCw size={14}/></button>
          </h1>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/organization/chart"
            className="px-6 py-3 bg-[#151A2D] border border-white/10 rounded-2xl text-slate-300 font-black uppercase text-[10px] tracking-widest shadow-sm hover:border-blue-500 hover:text-white transition-all flex items-center gap-2 group no-underline"
          >
            <GitGraph size={16} className="text-blue-500 group-hover:rotate-12 transition-transform" /> 
            Organigramme
          </Link>
          <button
            onClick={() => router.push("/dashboard/organization/units/new")}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all flex items-center gap-2 border-none cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} /> Créer Unité
          </button>
        </div>
      </header>

      {/* 📊 GRILLE DES KPIs (Hauteur Fixe) */}
      <div className="shrink-0 grid grid-cols-4 gap-4 mb-4 h-24">
        <KPICard icon={Building2} label="Unités Organiques" value={stats.totalUnits} trend="Actives" color="blue" />
        <KPICard icon={MapPin} label="Sites Gérés" value={stats.totalSites} trend="100% Connectés" color="emerald" />
        <KPICard icon={Users} label="Citoyens" value={stats.totalUsers} trend="Rattachés" color="amber" />
        <KPICard icon={Target} label="Conformité §5.3" value={`${stats.coverageRate}%`} trend={stats.coverageRate >= 85 ? "Optimal" : "Alerte"} trendUp={stats.coverageRate >= 85} color="purple" />
      </div>

      {/* 🧩 GRILLE PRINCIPALE (3 Colonnes) Extensible */}
      <div className="flex-1 min-h-0 flex gap-4">
        
        {/* COLONNE 1 : PYRAMIDE ET SANTÉ (30%) */}
        <div className="w-[30%] flex flex-col gap-4 min-h-0">
          
          {/* Santé Globale */}
          <div className="shrink-0 bg-[#151A2D] rounded-[2.5rem] p-6 border border-white/5 shadow-4xl relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 text-blue-500/10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
              <ShieldCheck size={120} />
            </div>
            <h3 className="text-[10px] font-black uppercase mb-3 tracking-[0.3em] text-slate-500 italic m-0">Santé Organisationnelle</h3>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl font-black italic tracking-tighter leading-none m-0 text-white">{globalHealth}%</span>
              <span className="text-[9px] font-black text-emerald-500 mb-1 flex items-center gap-1 uppercase italic">
                <TrendingUp size={12} /> Optimal
              </span>
            </div>
            <div className="h-2 bg-black/60 rounded-full overflow-hidden shadow-inner border border-white/5">
              <div className="h-full bg-linear-to-r from-blue-600 to-emerald-500 transition-all duration-1000" style={{ width: `${globalHealth}%` }} />
            </div>
          </div>

          {/* Pyramide Structurelle */}
          <div className="flex-1 bg-[#151A2D] rounded-[2.5rem] p-6 border border-white/5 shadow-4xl flex flex-col min-h-0">
            <div className="flex items-center gap-3 mb-4 shrink-0">
              <Layers className="text-blue-500" size={18} />
              <h2 className="text-[11px] font-black uppercase italic text-slate-400 tracking-[0.3em] m-0">Pyramide Structurelle</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {stats.unitsByType.length > 0 ? stats.unitsByType.map((item, idx) => (
                <div key={idx} className="group text-left">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[10px] font-black text-slate-300 uppercase italic flex items-center gap-2 m-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-[0_0_10px_currentColor]`} /> {item.type}
                    </span>
                    <span className="text-lg font-black text-white italic leading-none m-0">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-black/60 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${(item.count / stats.totalUnits) * 100}%` }}
                    />
                  </div>
                </div>
              )) : (
                 <p className="text-[10px] font-black italic uppercase text-slate-600 tracking-widest text-center mt-10">Aucune typologie scellée.</p>
              )}
            </div>
            
            <button onClick={() => router.push("/dashboard/organization/chart")} className="mt-4 pt-4 border-t border-white/5 text-blue-500 text-[9px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center justify-between w-full bg-transparent border-none cursor-pointer shrink-0">
              Inspecter l&apos;arbre <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* COLONNE 2 : MAILLAGE DES SITES (40%) */}
        <div className="w-[40%] bg-[#151A2D] rounded-[3rem] p-6 border border-white/5 shadow-4xl flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-6 shrink-0">
             <h2 className="text-[11px] font-black uppercase italic text-slate-400 tracking-[0.3em] m-0 flex items-center gap-2">
               <MapPin size={16} className="text-blue-500" /> Maillage Territorial
             </h2>
             <span className="bg-blue-600/20 text-blue-400 text-[9px] font-black px-3 py-1 rounded-lg border border-blue-500/20">
               {stats.sites.length} Sites
             </span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 gap-4">
            {stats.sites.length > 0 ? stats.sites.map((site, idx) => (
              <div
                key={site.SI_Id || idx}
                className="bg-black/40 rounded-3xl p-5 border border-white/5 hover:border-blue-500/30 transition-all group cursor-pointer shadow-inner flex flex-col justify-between"
                onClick={() => router.push(`/dashboard/sites/${site.SI_Id || idx + 1}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", site.SI_Status === "WARNING" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase italic text-white m-0 leading-none group-hover:text-blue-400 transition-colors">
                        {site.SI_Name}
                      </h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase mt-1 flex items-center gap-1.5 italic m-0 tracking-widest">
                        <MapPin size={10} className="text-blue-500" /> {site.SI_Location}
                      </p>
                    </div>
                  </div>
                  {site.SI_Status === "WARNING" && <AlertTriangle size={16} className="text-amber-500 animate-pulse" />}
                </div>
                
                <div className="flex gap-6 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white m-0 leading-none">{site._count?.units || 0}</span>
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Unités</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white m-0 leading-none">{site._count?.users || 0}</span>
                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Staff</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                 <Globe size={40} className="mb-3 text-slate-500" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] m-0">Aucun site déployé</p>
              </div>
            )}
          </div>
        </div>

        {/* COLONNE 3 : ALERTES & COMMANDES SOUVERAINES (30%) */}
        <div className="w-[30%] flex flex-col gap-4 min-h-0">
          
          {/* Anomalies Matrix */}
          <div className="flex-3 bg-[#151A2D] rounded-[3rem] p-6 border border-white/5 shadow-4xl flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-[11px] font-black uppercase italic text-rose-500 tracking-[0.3em] m-0 flex items-center gap-2">
                <AlertCircle size={16} /> Anomalies Matrix
              </h3>
              <span className="bg-rose-950/40 text-rose-500 border border-rose-500/20 text-[9px] font-black px-2.5 py-1 rounded-lg">
                {stats.alerts.length} Alertes
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {stats.alerts.length > 0 ? stats.alerts.map((alert, idx) => (
                <div key={alert.AL_Id || idx} className={cn(
                  "p-4 rounded-2xl border-l-4 shadow-inner text-left",
                  alert.AL_Priority === "CRITICAL" ? "bg-rose-950/20 border-rose-500" : alert.AL_Priority === "HIGH" ? "bg-amber-950/20 border-amber-500" : "bg-blue-950/20 border-blue-500"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "text-[7px] font-black uppercase px-2 py-0.5 rounded leading-none",
                      alert.AL_Priority === "CRITICAL" ? "bg-rose-600 text-white" : alert.AL_Priority === "HIGH" ? "bg-amber-500 text-black" : "bg-blue-600 text-white"
                    )}>
                      {alert.AL_Priority}
                    </span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">{alert.AL_Entity || 'SMI GLOBAL'}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-300 italic m-0 mb-2 leading-tight uppercase line-clamp-2">{alert.AL_Message}</p>
                  <button className="text-[8px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-all border-none bg-transparent cursor-pointer p-0 m-0">
                    {alert.AL_Action || 'TRAITER'} <ArrowUpRight size={10} />
                  </button>
                </div>
              )) : (
                 <div className="flex flex-col items-center justify-center h-full opacity-40">
                    <ShieldCheck size={32} className="text-emerald-500 mb-2" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-center m-0">Structure Conforme</p>
                 </div>
              )}
            </div>
          </div>

          {/* Commandes Souveraines */}
          <div className="flex-2 bg-blue-900/20 border border-blue-500/30 rounded-[3rem] p-6 shadow-4xl flex flex-col shrink-0">
            <h3 className="text-[10px] font-black uppercase mb-4 tracking-[0.4em] text-blue-400 italic text-center m-0">
              Commandes Souveraines
            </h3>
            <div className="flex-1 flex flex-col gap-2 justify-center">
              <QuickAction icon={Plus} label="Valider une Unité" onClick={() => router.push("/dashboard/organization/units/new")} />
              <QuickAction icon={UserCircle} label="Enrôler des Citoyens" onClick={() => router.push("/dashboard/users/assign")} />
              <QuickAction icon={Globe} label="Déployer un Site" onClick={() => router.push("/dashboard/sites")} />
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}</style>
    </div>
  );
}

// ============================================================================
// 🧩 COMPOSANTS INTERNES DÉDIÉS AU DASHBOARD
// ============================================================================

function KPICard({ icon: Icon, label, value, trend, trendUp, color }: { icon: any, label: string, value: string|number, trend: string, trendUp?: boolean, color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  };
  
  return (
    <div className="bg-[#151A2D] rounded-3xl p-5 border border-white/5 shadow-inner flex flex-col justify-between group overflow-hidden relative">
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none">
        <Icon size={80} />
      </div>
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110", colors[color])}>
          <Icon size={20} />
        </div>
        <div className={cn("flex items-center gap-1.5 text-[8px] font-black uppercase px-2.5 py-1 rounded-lg italic border", trendUp ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20")}>
          {trendUp ? <TrendingUp size={10} /> : <AlertCircle size={10} />} {trend}
        </div>
      </div>
      <div className="relative z-10 text-left">
        <p className="text-3xl font-black text-white italic tracking-tighter leading-none m-0 mb-1">{value}</p>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic m-0">{label}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 bg-black/40 hover:bg-blue-600/20 rounded-xl flex items-center gap-3 transition-all group text-left border border-white/5 hover:border-blue-500/30 outline-none cursor-pointer"
    >
      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 text-slate-400">
        <Icon size={14} />
      </div>
      <span className="text-[9px] font-black uppercase italic tracking-widest text-slate-300 group-hover:text-white transition-colors flex-1 m-0">
        {label}
      </span>
      <ChevronRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-400" />
    </button>
  );
}