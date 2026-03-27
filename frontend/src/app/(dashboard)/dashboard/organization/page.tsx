/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛡️ MODULE : DASHBOARD ORGANISATIONNEL SMI (ISO 9001 §5.3)
 * RÔLE : Monitoring de l'architecture et des ressources
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  AlertCircle, Building2, 
  Globe, Layers, MapPin, Plus, ShieldCheck, Target, 
  Users, RefreshCw, ArrowUpRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
  OUT_Description?: string;
}

export interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_Code: string;
  OU_Type?: OrgUnitType;
  OU_ParentId?: string;
  OU_SiteId?: string;
  OU_IsActive: boolean;
  OU_CreatedAt: string;
}

export interface Site {
  SI_Id: string;
  SI_Name: string;
  SI_Location: string;
  SI_IsActive: boolean;
  _count?: { units: number; users: number };
}

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Actif?: boolean;
}

export interface Alert {
  AL_Id: string;
  AL_Message: string;
  AL_Type: string;
  AL_CreatedAt: string;
  AL_IsRead: boolean;
}

export interface DashboardStats {
  totalUnits: number;
  totalSites: number;
  totalUsers: number;
  coverageRate: number;
  unitsByType: Array<{ type: string; count: number; color: string }>;
  alerts: Alert[];
  sites: Site[];
}

export interface KPICardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI CARD
// ============================================================================

function KPICard({ icon: Icon, label, value, color }: KPICardProps) {
  const colors: Record<KPICardProps['color'], string> = { 
    blue: "text-blue-400 border-blue-500/10", 
    emerald: "text-emerald-400 border-emerald-500/10", 
    amber: "text-amber-400 border-amber-500/10", 
    purple: "text-purple-400 border-purple-500/10" 
  };
  
  return (
    <article className={cn(
      "bg-[#0F172A] p-6 md:p-7 rounded-2xl md:rounded-3xl border-2 shadow-2xl group transition-all hover:-translate-y-1 relative overflow-hidden focus-within:ring-2 focus-within:ring-blue-400",
      colors[color]
    )}>
      <div className="absolute -right-2 md:-right-4 -bottom-2 md:-bottom-4 opacity-5 pointer-events-none group-hover:scale-125 transition-transform" aria-hidden="true">
        <Icon size={64} className="w-16 h-16 md:w-20 md:h-20" />
      </div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 md:p-4 bg-black/40 rounded-xl md:rounded-2xl border border-white/5">
          <Icon size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
        </div>
      </div>
      <div className="relative z-10 text-left">
        <p className="text-3xl md:text-4xl font-black italic m-0 tracking-tighter text-white leading-none">{value}</p>
        <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mt-2 m-0 uppercase leading-none">{label}</p>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function OrganizationDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUnits: 0, totalSites: 0, totalUsers: 0,
    unitsByType: [], coverageRate: 0, alerts: [], sites: []
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [resUnits, resSites, resUsers, resAlerts] = await Promise.all([
        apiClient.get<OrgUnit[]>('/org-units'),
        apiClient.get<Site[]>('/sites'),
        apiClient.get<User[]>('/users'),
        apiClient.get<Alert[]>('/notifications/me?category=ORGANIZATION')
      ]);

      const units = Array.isArray(resUnits.data) ? resUnits.data : [];
      const sites = Array.isArray(resSites.data) ? resSites.data : [];
      const users = Array.isArray(resUsers.data) ? resUsers.data : [];
      const alerts = Array.isArray(resAlerts.data) ? resAlerts.data : [];

      // Logique de calcul SDE
      const typeMap: Record<string, number> = {};
      units.forEach((u) => { 
        const type = u.OU_Type?.OUT_Label || 'Inconnu';
        typeMap[type] = (typeMap[type] || 0) + 1; 
      });
      
      const colorPalette = ["bg-blue-600", "bg-emerald-600", "bg-amber-600", "bg-purple-600"];
      const unitsByType = Object.keys(typeMap).map((key, i) => ({
        type: key, count: typeMap[key], color: colorPalette[i % 4]
      })).sort((a, b) => b.count - a.count);

      setStats({
        totalUnits: units.length,
        totalSites: sites.length,
        totalUsers: users.length,
        coverageRate: units.length > 0 ? Math.round((units.filter((u) => u.OU_ParentId).length / units.length) * 100) : 0,
        unitsByType,
        alerts: alerts.slice(0, 5),
        sites: sites.slice(0, 6)
      });
    } catch (error) {
      console.error('❌ Erreur chargement organisation:', error);
      toast.error("ÉCHEC DE SYNCHRONISATION ARCHITECTURALE");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchDashboardData(); }, [fetchDashboardData]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Scan de l'architecture Matrix..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
             <span className="bg-blue-600/10 border border-blue-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] text-blue-400 flex items-center gap-1.5 md:gap-2 tracking-widest">
                <ShieldCheck size={12} className="w-3 h-3" aria-hidden="true" /> 
                ISO 9001 §5.3
             </span>
             <span className="text-slate-500 text-[8px] md:text-[9px] tracking-widest">
               {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
             </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0">Architecture <span className="text-blue-400">SMI</span></h1>
        </div>
        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button 
            type="button"
            onClick={() => router.push("/dashboard/organization/units/new")} 
            className="bg-blue-600 hover:bg-white hover:text-blue-700 px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] flex items-center gap-2 md:gap-3 shadow-2xl border-none cursor-pointer text-white italic transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 w-full xl:w-auto justify-center"
            aria-label="Créer une nouvelle unité organisationnelle"
          >
            <Plus size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
            <span className="hidden sm:inline">Créer Unité</span>
          </button>
        </div>
      </header>

      {/* 📊 KPI ROW */}
      <section className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-0 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" aria-label="Statistiques organisationnelles">
        <KPICard icon={Building2} label="Unités Organiques" value={stats.totalUnits} color="blue" />
        <KPICard icon={MapPin} label="Sites Gérés" value={stats.totalSites} color="emerald" />
        <KPICard icon={Users} label="Collaborateurs" value={stats.totalUsers} color="amber" />
        <KPICard icon={Target} label="Conformité" value={`${stats.coverageRate}%`} color="purple" />
      </section>

      {/* 📋 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pt-0 md:pt-4">
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 lg:gap-8 pb-10 md:pb-16">
          
          {/* Pyramide Structurelle */}
          <aside className="col-span-12 xl:col-span-3 bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-4 md:p-6 lg:p-10 shadow-2xl flex flex-col gap-4 md:gap-6 lg:gap-8">
            <h2 className="text-[10px] md:text-[11px] text-slate-500 tracking-widest m-0 flex items-center gap-2 md:gap-3">
              <Layers size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" aria-hidden="true" /> 
              Pyramide
            </h2>
            <div className="space-y-4 md:space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4" role="list" aria-label="Répartition des unités par type">
              {stats.unitsByType.map((item, idx) => (
                <div key={idx} className="space-y-2 md:space-y-3" role="listitem">
                  <div className="flex justify-between items-end italic">
                    <span className="text-[9px] md:text-[10px] text-slate-300 flex items-center gap-1.5 md:gap-2">
                      <div className={cn("w-2 h-2 rounded-full", item.color)} aria-hidden="true" /> 
                      {item.type}
                    </span>
                    <span className="text-lg md:text-xl leading-none">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden" role="progressbar" aria-valuenow={(item.count / stats.totalUnits) * 100} aria-valuemin={0} aria-valuemax={100}>
                    <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: `${(item.count / stats.totalUnits) * 100}%` }} aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
            <button 
              type="button"
              onClick={() => router.push("/dashboard/organization/chart")} 
              className="w-full py-3 md:py-4 bg-white/5 text-[9px] md:text-[10px] text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl md:rounded-2xl transition-all border-none cursor-pointer italic uppercase focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Inspecter l&apos;arbre
            </button>
          </aside>

          {/* Maillage Territorial */}
          <section className="col-span-12 xl:col-span-6 bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-4 md:p-6 lg:p-10 shadow-2xl flex flex-col gap-4 md:gap-6 lg:gap-8">
            <h2 className="text-[10px] md:text-[11px] text-slate-500 tracking-widest m-0 flex items-center gap-2 md:gap-3">
              <MapPin size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" aria-hidden="true" /> 
              Maillage Sites
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-y-auto custom-scrollbar pr-1 md:pr-2" role="list" aria-label="Liste des sites">
              {stats.sites.map((site) => (
                <article 
                  key={site.SI_Id} 
                  className="bg-black/40 border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl hover:border-blue-500/40 transition-all group cursor-pointer shadow-inner focus-within:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Site: ${site.SI_Name}`}
                  onClick={() => router.push(`/dashboard/organization/sites/${site.SI_Id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/dashboard/organization/sites/${site.SI_Id}`); }}
                >
                  <div className="flex items-center gap-3 md:gap-5 mb-3 md:mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Globe size={18} className="w-4.5 h-4.5 md:w-5 md:h-5" aria-hidden="true" />
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="text-base md:text-lg m-0 leading-none group-hover:text-blue-400 truncate">{site.SI_Name}</h3>
                      <p className="text-[8px] md:text-[9px] text-slate-600 mt-1 md:mt-2 m-0 tracking-widest truncate">{site.SI_Location}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 md:gap-6 border-t border-white/5 pt-3 md:pt-4">
                     <div className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase">
                       <span className="text-white text-base md:text-lg mr-1 md:mr-2">{site._count?.units || 0}</span>
                       UNITÉS
                     </div>
                     <div className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase">
                       <span className="text-white text-base md:text-lg mr-1 md:mr-2">{site._count?.users || 0}</span>
                       CITOYENS
                     </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Anomalies & Commandes */}
          <aside className="col-span-12 xl:col-span-3 space-y-4 md:space-y-6 lg:space-y-8 flex flex-col">
            <article className="flex-1 bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-4 md:p-6 lg:p-10 shadow-2xl flex flex-col">
              <h2 className="text-[10px] md:text-[11px] text-rose-400 tracking-widest m-0 flex items-center gap-2 md:gap-3 mb-4 md:mb-6 lg:mb-8">
                <AlertCircle size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
                Anomalies
              </h2>
              <div className="space-y-3 md:space-y-4 overflow-y-auto custom-scrollbar pr-2 md:pr-4" role="list" aria-label="Liste des anomalies">
                {stats.alerts.length > 0 ? stats.alerts.map((a) => (
                  <article key={a.AL_Id} className="bg-rose-500/5 border-l-4 border-rose-500 p-3 md:p-4 rounded-xl space-y-1.5 md:space-y-2" role="listitem">
                    <p className="text-[9px] md:text-[10px] m-0 font-bold leading-tight">{a.AL_Message}</p>
                    <button 
                      type="button"
                      className="text-[8px] md:text-[9px] text-blue-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer uppercase font-black focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
                      aria-label={`Traiter l'anomalie: ${a.AL_Message}`}
                    >
                      Traiter <ArrowUpRight size={10} className="w-2.5 h-2.5 inline ml-1" aria-hidden="true" />
                    </button>
                  </article>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20" role="status">
                    <ShieldCheck size={32} className="w-8 h-8 md:w-10 md:h-10" aria-hidden="true" />
                    <p className="text-[8px] md:text-[9px] mt-3 md:mt-4">Conformité Totale</p>
                  </div>
                )}
              </div>
            </article>
            <article className="bg-blue-600/10 border-2 border-blue-500/20 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-4 md:p-6 lg:p-10 flex flex-col gap-2 md:gap-3">
               <h3 className="text-[9px] md:text-[10px] text-blue-400 tracking-widest mb-3 md:mb-4">Actions Souveraines</h3>
               <button 
                 type="button"
                 onClick={() => router.push("/dashboard/organization/chart")} 
                 className="w-full py-3 md:py-4 bg-black/40 hover:bg-blue-600 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] transition-all border-none cursor-pointer italic font-black uppercase focus:outline-none focus:ring-2 focus:ring-blue-400"
               >
                 Organigramme Interactif
               </button>
               <button 
                 type="button"
                 onClick={() => router.push("/dashboard/organization/units")} 
                 className="w-full py-3 md:py-4 bg-black/40 hover:bg-blue-600 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] transition-all border-none cursor-pointer italic font-black uppercase focus:outline-none focus:ring-2 focus:ring-blue-400"
               >
                 Registre des Unités
               </button>
            </article>
          </aside>

        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}