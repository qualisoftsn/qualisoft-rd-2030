/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛡️ MODULE : DASHBOARD ORGANISATIONNEL SMI
 * -------------------------------------------------------------------------
 * RÔLE : Monitoring de l'architecture et des ressources §5.3.
 * DESIGN : Elite High-Density, 100dvh, ClickUp Layout, Zero-Scroll Global.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 18:20 GMT
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertCircle, Building2, 
  Globe, Layers, MapPin, Plus, ShieldCheck, Target, 
  Users, RefreshCw, ArrowUpRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient from "@/core/api/api-client";
import { toast, Toaster } from "sonner";

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function OrganizationDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalUnits: 0, totalSites: 0, totalUsers: 0,
    unitsByType: [], coverageRate: 0, alerts: [], sites: []
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [resUnits, resSites, resUsers, resAlerts] = await Promise.all([
        apiClient.get('/org-units'),
        apiClient.get('/sites'),
        apiClient.get('/users'),
        apiClient.get('/notifications/me?category=ORGANIZATION')
      ]);

      const units = resUnits.data?.data || resUnits.data || [];
      const sites = resSites.data?.data || resSites.data || [];
      const users = resUsers.data?.data || resUsers.data || [];
      const alerts = resAlerts.data?.data || resAlerts.data || [];

      // Logique de calcul SDE
      const typeMap: Record<string, number> = {};
      units.forEach((u: any) => { 
        const type = u.OU_Type?.OUT_Label || 'Inconnu';
        typeMap[type] = (typeMap[type] || 0) + 1; 
      });
      
      const unitsByType = Object.keys(typeMap).map((key, i) => ({
        type: key, count: typeMap[key], color: ["bg-blue-600", "bg-emerald-600", "bg-amber-600", "bg-purple-600"][i % 4]
      })).sort((a, b) => b.count - a.count);

      setStats({
        totalUnits: units.length,
        totalSites: sites.length,
        totalUsers: users.length,
        coverageRate: units.length > 0 ? Math.round((units.filter((u:any) => u.OU_ParentId).length / units.length) * 100) : 0,
        unitsByType,
        alerts: alerts.slice(0, 5),
        sites: sites.slice(0, 6)
      });
    } catch {
      toast.error("ÉCHEC DE SYNCHRONISATION ARCHITECTURALE");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  if (loading) return <LoadingScreen label="Scan de l'architecture Matrix..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER SDE (Fixe) */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4">
             <span className="bg-blue-600/10 border border-blue-500/20 px-4 py-1 rounded-xl text-[9px] text-blue-500 flex items-center gap-2 tracking-widest">
                <ShieldCheck size={12} /> ISO 9001 §5.3
             </span>
             <span className="text-slate-500 text-[9px] tracking-[0.4em]">{new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Architecture <span className="text-blue-600">SMI</span></h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => router.push("/dashboard/organization/units/new")} className="bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-3xl text-[10px] flex items-center gap-3 shadow-4xl border-none cursor-pointer text-white italic transition-all"><Plus size={18} /> Créer Unité</button>
        </div>
      </header>

      {/* 📊 KPI ROW (Fixe) */}
      <div className="shrink-0 p-8 pb-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard icon={Building2} label="Unités Organiques" value={stats.totalUnits} color="blue" />
        <KPICard icon={MapPin} label="Sites Gérés" value={stats.totalSites} color="emerald" />
        <KPICard icon={Users} label="Collaborateurs" value={stats.totalUsers} color="amber" />
        <KPICard icon={Target} label="Conformité" value={`${stats.coverageRate}%`} color="purple" />
      </div>

      {/* 📋 WORKZONE (Isolated Scroll) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4">
        <div className="max-w-400 mx-auto grid grid-cols-12 gap-8 pb-10">
          
          {/* Pyramide Structurelle */}
          <section className="col-span-12 xl:col-span-3 bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] p-10 shadow-4xl flex flex-col gap-8">
            <h2 className="text-[11px] text-slate-500 tracking-[0.4em] m-0 flex items-center gap-3"><Layers size={16} className="text-blue-500" /> Pyramide</h2>
            <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-4">
              {stats.unitsByType.map((item: any, idx: number) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between items-end italic">
                    <span className="text-[10px] text-slate-300 flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", item.color)} /> {item.type}
                    </span>
                    <span className="text-xl leading-none">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: `${(item.count / stats.totalUnits) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => router.push("/dashboard/organization/chart")} className="w-full py-4 bg-white/5 text-[9px] text-blue-500 hover:bg-blue-600 hover:text-white rounded-2xl transition-all border-none cursor-pointer italic uppercase">Inspecter l&apos;arbre</button>
          </section>

          {/* Maillage Territorial */}
          <section className="col-span-12 xl:col-span-6 bg-[#151B2B] border-2 border-white/5 rounded-[4rem] p-10 shadow-4xl flex flex-col gap-8">
            <h2 className="text-[11px] text-slate-500 tracking-[0.4em] m-0 flex items-center gap-3"><MapPin size={16} className="text-emerald-500" /> Maillage Sites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar pr-2">
              {stats.sites.map((site: any) => (
                <div key={site.SI_Id} className="bg-black/40 border border-white/5 p-6 rounded-[2.5rem] hover:border-blue-500/40 transition-all group cursor-pointer shadow-inner">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all"><Globe size={20} /></div>
                    <div className="text-left">
                      <h3 className="text-lg m-0 leading-none group-hover:text-blue-400">{site.SI_Name}</h3>
                      <p className="text-[8px] text-slate-600 mt-2 m-0 tracking-widest">{site.SI_Location}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 border-t border-white/5 pt-4">
                     <div className="text-[8px] text-slate-500 font-bold uppercase"><span className="text-white text-base mr-2">{site._count?.units || 0}</span>UNITÉS</div>
                     <div className="text-[8px] text-slate-500 font-bold uppercase"><span className="text-white text-base mr-2">{site._count?.users || 0}</span>CITOYENS</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Anomalies & Commandes */}
          <section className="col-span-12 xl:col-span-3 space-y-8 flex flex-col">
            <div className="flex-1 bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] p-10 shadow-4xl flex flex-col">
              <h2 className="text-[11px] text-rose-500 tracking-[0.4em] m-0 flex items-center gap-3 mb-8"><AlertCircle size={16} /> Anomalies</h2>
              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-4">
                {stats.alerts.length > 0 ? stats.alerts.map((a: any) => (
                  <div key={a.AL_Id} className="bg-rose-500/5 border-l-4 border-rose-500 p-4 rounded-xl space-y-2">
                    <p className="text-[10px] m-0 font-bold leading-tight">{a.AL_Message}</p>
                    <button className="text-[8px] text-blue-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer uppercase font-black">Traiter <ArrowUpRight size={10} className="inline ml-1" /></button>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20"><ShieldCheck size={40} /><p className="text-[8px] mt-4">Conformité Totale</p></div>
                )}
              </div>
            </div>
            <div className="bg-blue-600/10 border-2 border-blue-500/20 rounded-[3.5rem] p-10 flex flex-col gap-3">
               <h3 className="text-[10px] text-blue-500 tracking-widest mb-4">Actions Souveraines</h3>
               <button onClick={() => router.push("/dashboard/organization/chart")} className="w-full py-4 bg-black/40 hover:bg-blue-600 text-white rounded-2xl text-[9px] transition-all border-none cursor-pointer italic font-black uppercase">Organigramme Interactif</button>
               <button onClick={() => router.push("/dashboard/organization/units")} className="w-full py-4 bg-black/40 hover:bg-blue-600 text-white rounded-2xl text-[9px] transition-all border-none cursor-pointer italic font-black uppercase">Registre des Unités</button>
            </div>
          </section>

        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function KPICard({ icon: Icon, label, value, color }: any) {
  const c: any = { blue: "text-blue-500 border-blue-500/10", emerald: "text-emerald-500 border-emerald-500/10", amber: "text-amber-500 border-amber-500/10", purple: "text-purple-500 border-purple-500/10" };
  return (
    <div className={cn("bg-[#151B2B] p-7 rounded-[3rem] border-2 shadow-4xl group transition-all hover:-translate-y-1 relative overflow-hidden", c[color])}>
      <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-125 transition-transform"><Icon size={80} /></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-4 bg-black/40 rounded-2xl border border-white/5"><Icon size={24} /></div>
      </div>
      <div className="relative z-10 text-left">
        <p className="text-4xl font-black italic m-0 tracking-tighter text-white leading-none">{value}</p>
        <p className="text-[10px] text-slate-500 tracking-widest mt-2 m-0 uppercase leading-none">{label}</p>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}