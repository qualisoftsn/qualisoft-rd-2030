/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛰️ MODULE : UNIFIED STRATEGIC COCKPIT (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Hub décisionnel unique - Adaptation dynamique selon le Rôle.
 * DESIGN : 100dvh, Zero Global Scroll, ClickUp Glassmorphism.
 * RÉVISION : 06 Mars 2026 | 17:50 GMT
 * -------------------------------------------------------------------------
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, Target, ShieldCheck, Layers, AlertTriangle, 
  Loader2, TrendingUp, Zap, ShieldAlert 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';

export default function UnifiedDashboard() {
  const { user } = useAuthStore() as any;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/indicators/dashboard-stats');
      setData(res.data?.data || res.data);
    } catch {
      toast.error("Liaison Kernel dégradée. Données de secours actives.");
      setData({ globalPerformance: 78, completionRate: 85, nonConformities: 2, totalProcessus: 12 });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user) fetchStats(); }, [user, fetchStats]);

  // Définition des accès selon le rôle
  const isObserver = user?.U_Role === 'OBSERVATEUR';
  const isManager = ['SUPER_ADMIN', 'ADMIN', 'RQ'].includes(user?.U_Role);

  // 🧠 ALGORITHME DE SANTÉ SDE (À placer juste avant le return)
  const healthScore = useMemo(() => {
    if (!data) return 0;
    const perf = data.globalPerformance || 0;
    const conf = data.completionRate || 0;
    const nc = data.nonConformities || 0;
  
    // Formule Elite : Équilibre entre Performance et Conformité avec malus NC
    const score = (perf * 0.4) + (conf * 0.4) - (nc * 2);
    return Math.min(Math.round(Math.max(score, 0)), 100);
  }, [data]);

  if (loading) return <LoadingMatrix label="Initialisation du Hub..." />;

  return (
    <div className="h-full flex flex-col font-sans italic selection:bg-blue-600/30 text-white animate-in fade-in duration-500">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER DYNAMIQUE */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 shrink-0">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${healthScore > 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              <Activity size={12} className={healthScore < 80 ? 'animate-pulse' : ''} />
              Santé SMI : {healthScore}%
            </span>
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Node : {user?.U_TenantDomain || 'Elite'}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter m-0 leading-none">
            Cockpit <span className="text-blue-600">{isObserver ? 'Vision' : 'Stratégique'}</span>
          </h1>
        </div>
        
        {isManager && (
          <div className="flex gap-4">
             <button onClick={fetchStats} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all border-none cursor-pointer"><RefreshCwIcon size={18}/></button>
             <Link href="/risques/nouveau" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-xl no-underline flex items-center gap-3">
               <Zap size={16} /> Action SMI
             </Link>
          </div>
        )}
      </header>

      {/* 📜 CONTENU SCROLLABLE ISOLÉ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8">
        
        

        {/* 📊 KPI ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Performance" val={`${data?.globalPerformance}%`} icon={Target} color="blue" />
          <KPICard title="Conformité" val={`${data?.completionRate}%`} icon={ShieldCheck} color="emerald" />
          <KPICard title="Alertes NC" val={data?.nonConformities || 0} icon={AlertTriangle} color="rose" />
          <KPICard title="Processus" val={data?.totalProcessus || 0} icon={Layers} color="amber" />
        </div>

        {/* 📈 ANALYSE & ACTIVITÉ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10">
          <div className="xl:col-span-2 bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] p-10 shadow-4xl relative overflow-hidden group">
            <TrendingUp size={200} className="absolute -bottom-10 -right-10 text-blue-600 opacity-5 group-hover:rotate-6 transition-all" />
            <h3 className="text-2xl font-black uppercase italic text-white mb-10 tracking-tighter m-0">Trajectoire ISO §9.1</h3>
            <div className="space-y-10">
              <ObjectiveLine label="Performance SMI" current={data?.globalPerformance || 0} color="bg-blue-600" />
              <ObjectiveLine label="Conformité Normative" current={data?.completionRate || 0} color="bg-emerald-500" />
            </div>
          </div>

          <div className="flex flex-col gap-6">
             <div className="bg-[#0B0F1A] border-2 border-white/5 rounded-[3rem] p-8 space-y-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center m-0">Flux Critique</h4>
                <div className="space-y-4">
                   <AlerteMin label="Audit Site Dakar" status="warning" />
                   <AlerteMin label="Revue de Direction" status="success" />
                </div>
                <Link href="/risques" className="w-full flex justify-between items-center p-4 bg-white/5 hover:bg-amber-600/10 rounded-2xl transition-all no-underline text-slate-400 group">
                  <span className="text-[9px] font-black uppercase italic tracking-widest"><ShieldAlert size={14} className="inline mr-2 text-amber-500" /> Registre Risques</span>
                  <ChevronRightIcon size={16} />
                </Link>
             </div>
          </div>
        </div>
      </div>

     {/* 🛡️ FOOTER SOUVERAIN (Télémétrie scellée) */}
    <footer className="shrink-0 bg-[#0B0F1A] border-t border-white/5 p-6 flex items-center justify-between opacity-40">
      <div className="flex items-center gap-4 text-blue-500 font-black text-[9px] tracking-widest uppercase italic">
        <ShieldCheck size={18} /> Cockpit Stratégique Scellé • SDE-RD-2026
      </div>
      
      {/* Affichage de l'équation en texte brut stylisé pour éviter les erreurs TS */}
      <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">
        {`Indice Santé : H_smi = [(P_perf × 0.4) + (C_conf × 0.4) - (NC × 2)] = ${healthScore}%`}
      </div>
    </footer>
    </div>
  );
}

// COMPOSANTS ATOMIQUES SDE
function KPICard({ title, val, icon: Icon, color }: any) {
  const themes: any = { 
    blue: "text-blue-500 border-blue-500/20 bg-blue-500/5", 
    emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5", 
    rose: "text-rose-500 border-rose-500/20 bg-rose-500/5", 
    amber: "text-amber-500 border-amber-500/20 bg-amber-500/5" 
  };
  return (
    <div className={`p-8 rounded-[3rem] border-2 transition-all hover:-translate-y-2 shadow-2xl flex items-center gap-6 ${themes[color]}`}>
      <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5"><Icon size={28} /></div>
      <div className="text-left">
        <p className="text-4xl font-black italic m-0 tracking-tighter text-white">{val}</p>
        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-2 m-0">{title}</p>
      </div>
    </div>
  );
}

function ObjectiveLine({ label, current, color }: any) {
  return (
    <div className="space-y-3 text-left">
      <div className="flex justify-between items-end"><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</span><span className="text-xl font-black italic">{current}%</span></div>
      <div className="h-3 bg-black/40 rounded-full border border-white/5 p-0.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${current}%` }} />
      </div>
    </div>
  );
}

function AlerteMin({ label, status }: any) {
  return (
    <div className="flex items-center gap-4 text-left">
      <div className={`w-2 h-2 rounded-full ${status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
      <span className="text-[10px] font-black uppercase italic text-slate-300">{label}</span>
    </div>
  );
}

function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-blue-600" size={60} strokeWidth={1} />
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[1em] animate-pulse m-0">{label}</p>
    </div>
  );
}

const RefreshCwIcon = ({ size }: any) => <Activity size={size} />;
const ChevronRightIcon = ({ size }: any) => <Activity size={size} />;