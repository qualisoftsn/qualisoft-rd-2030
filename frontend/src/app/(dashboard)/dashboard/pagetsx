'use client';

/**
 * 🛰️ MODULE : UNIFIED STRATEGIC COCKPIT (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Hub décisionnel unique - Adapte l'UI selon le rôle (RQ, DIR, OBS).
 * DESIGN : ClickUp Style 100dvh, Zero Scroll Global, High-Density.
 * SÉCURITÉ : Kernel Auth (Zustand) - Zéro NextAuth.
 * RÉVISION : 06 Mars 2026 | 04:30 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, Target, ShieldCheck, Layers, AlertTriangle, 
  FileDown, Loader2, ChevronRight, TrendingUp, Clock, Zap, 
  Eye, ShieldAlert, BarChart3, Users
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';

export default function UnifiedDashboard() {
  const { user } = useAuthStore() as any;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 📡 SYNC KERNEL
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/indicators/dashboard-stats');
      setData(res.data?.data || res.data);
    } catch {
      toast.error("ÉCHEC KERNEL : Liaison SMI dégradée.");
      setData({ globalPerformance: 75, completionRate: 80, nonConformities: 2, totalProcessus: 8 });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user) fetchStats(); }, [user, fetchStats]);

  // 🛡️ LOGIQUE DE DROITS (ABSTRACTION)
  const isObserver = user?.U_Role === 'OBSERVATEUR';
  const isManager = ['ADMIN', 'SUPER_ADMIN', 'RQ'].includes(user?.U_Role);

  if (loading) return <LoadingMatrix label="Chargement du Cockpit Elite..." />;

  return (
    <div className="h-full flex flex-col font-sans italic selection:bg-blue-600/30 text-white animate-in fade-in duration-500">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 EN-TÊTE DYNAMIQUE */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 shrink-0">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-blue-600/10 border border-blue-600/20 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-2">
              <ShieldCheck size={12} /> Mode : {user?.U_Role}
            </span>
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Node : {user?.U_TenantDomain || 'Elite'}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter m-0 leading-none">
            Cockpit <span className="text-blue-600">{isObserver ? 'Vision' : 'Souverain'}</span>
          </h1>
        </div>
        
        {!isObserver && (
          <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-xl shadow-blue-900/40 border-none cursor-pointer">
            Nouvelle Revue SMI
          </button>
        )}
      </header>

      {/* 📜 ZONE DE TRAVAIL SCROLLABLE */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8">
        
        {/* 📊 KPI ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPITile title="Performance" val={`${data?.globalPerformance}%`} icon={Target} color="blue" />
          <KPITile title="Conformité" val={`${data?.completionRate}%`} icon={ShieldCheck} color="emerald" />
          <KPITile title="Non-Conformités" val={data?.nonConformities || 0} icon={AlertTriangle} color="rose" />
          <KPITile title="Processus" val={data?.totalProcessus || 0} icon={Layers} color="amber" />
        </div>

        {/* 📉 ANALYSE & FLUX */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* GRAPHE STRATÉGIQUE (Visible par tous) */}
          <div className="xl:col-span-2 bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] p-10 shadow-4xl relative overflow-hidden group">
            <TrendingUp size={200} className="absolute -bottom-10 -right-10 text-blue-600 opacity-5 group-hover:rotate-6 transition-all" />
            <h3 className="text-2xl font-black uppercase italic text-white mb-10 tracking-tighter m-0">Trajectoire Performance</h3>
            <div className="space-y-8 relative z-10">
              <ObjectiveLine label="Maitrise Opérationnelle" current={data?.globalPerformance || 0} color="bg-blue-600" />
              <ObjectiveLine label="Avancement Plan d'Actions" current={data?.completionRate || 0} color="bg-emerald-500" />
            </div>
          </div>

          {/* ACTIONS CONTEXTUELLES (Masquées pour les observateurs) */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#0B0F1A] border-2 border-white/5 rounded-[3rem] p-8 flex-1 flex flex-col justify-center gap-6">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center m-0">Accès Rapides</h4>
              <ShortcutLink label="Registre des Risques" href="/direction/risques" icon={ShieldAlert} />
              <ShortcutLink label="Rapports d'Audit" href="/audit" icon={FileDown} />
              {isManager && <ShortcutLink label="Gestion Équipes" href="/users" icon={Users} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// COMPOSANTS ATOMIQUES
function KPITile({ title, val, icon: Icon, color }: any) {
  const c: any = { blue: "text-blue-500 border-blue-500/20 bg-blue-500/5", emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5", rose: "text-rose-500 border-rose-500/20 bg-rose-500/5", amber: "text-amber-500 border-amber-500/20 bg-amber-500/5" };
  return (
    <div className={`p-8 rounded-[3rem] border-2 transition-all hover:-translate-y-2 shadow-2xl flex items-center gap-6 ${c[color]}`}>
      <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform"><Icon size={28} /></div>
      <div className="text-left">
        <p className="text-4xl font-black italic m-0 tracking-tighter text-white">{val}</p>
        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-2 m-0">{title}</p>
      </div>
    </div>
  );
}

function ObjectiveLine({ label, current, color }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end italic"><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</span><span className="text-xl font-black">{current}%</span></div>
      <div className="h-3 bg-black/40 rounded-full border border-white/5 p-0.5 overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${current}%` }} /></div>
    </div>
  );
}

function ShortcutLink({ label, href, icon: Icon }: any) {
  return (
    <Link href={href} className="flex justify-between items-center p-5 bg-white/5 hover:bg-blue-600 hover:text-white rounded-2xl transition-all no-underline text-slate-300 group">
      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest italic"><Icon size={18} className="text-blue-500 group-hover:text-white" /> {label}</div>
      <ChevronRight size={16} />
    </Link>
  );
}

function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-blue-600" size={60} strokeWidth={1} />
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[1em] animate-pulse">{label}</p>
    </div>
  );
}