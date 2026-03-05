/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 👑 MODULE : COCKPIT OBSERVATEUR (EXECUTIVE DASHBOARD)
 * -------------------------------------------------------------------------
 * RÔLE : Instance de surveillance macroscopique et aide à la décision.
 * DESIGN : Elite High-Density, 100dvh, Dark Matrix, Zéro Scroll Global.
 * FIX : Intégration locale du LoadingScreen pour éradiquer l'erreur Jsx-no-undef.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 12:12 GMT
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  FileDown, Layers, Activity, Target, 
  ShieldCheck, TrendingUp, CalendarCheck, AlertTriangle, 
  RefreshCw, BadgeCheck, ChevronRight, Fingerprint
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function ExecutiveDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore() as any;

  // --- 📡 SYNCHRONISATION KERNEL ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/indicators/dashboard-stats');
      const result = res.data?.data || res.data;
      setData(result);
    } catch {
      toast.error("RUPTURE DE FLUX : ÉCHEC SYNC DASHBOARD");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const healthScore = useMemo(() => {
    if (!data) return 0;
    return Math.min(Math.round(((data.globalPerformance || 0) * 0.6) + ((data.completionRate || 0) * 0.4)), 100);
  }, [data]);

  if (loading) return <LoadingScreen label="Initialisation du Pilotage Exécutif..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER SDE (Fixe) */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-4">
          <div className="flex items-center gap-4">
             <span className={cn(
               "px-5 py-2 rounded-full border text-[10px] flex items-center gap-3 transition-all",
               healthScore >= 75 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
             )}>
                <Activity size={14} className={healthScore < 75 ? "animate-pulse" : ""} /> Santé Système : {healthScore}%
             </span>
             <span className="text-[10px] text-slate-500 tracking-[0.4em] italic leading-none">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter m-0 leading-none">Cockpit <span className="text-blue-500">{user?.U_Role === 'SUPER_ADMIN' ? 'Souverain' : 'Exécutif'}</span></h1>
        </div>

        <div className="flex items-center gap-6 group">
          <div className="text-right hidden lg:block">
            <p className="text-2xl tracking-tighter m-0 leading-none uppercase">{user?.U_FirstName} {user?.U_LastName}</p>
            <div className="flex items-center justify-end gap-2 mt-2">
               <span className="text-[9px] text-blue-500 tracking-widest">{user?.U_Role || 'OBSERVATEUR'}</span>
               <BadgeCheck size={14} className="text-blue-500" />
            </div>
          </div>
          <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center border border-white/10 shadow-3xl rotate-3 group-hover:rotate-0 transition-transform">
             <span className="text-2xl font-black not-italic text-white">{user?.U_FirstName?.[0]}{user?.U_LastName?.[0]}</span>
          </div>
        </div>
      </header>

      {/* 📊 KPI DASHBOARD (Fixe) */}
      <div className="shrink-0 p-8 pb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         <KPICard title="Performance" val={`${data?.globalPerformance || 0}%`} icon={Target} color="emerald" sub="Rendement Global" />
         <KPICard title="Conformité" val={`${data?.completionRate || 0}%`} icon={ShieldCheck} color="blue" sub="Index Normatif" />
         <KPICard title="Gouvernance" val="94%" icon={CalendarCheck} color="amber" sub="Échéancier Actif" />
         <KPICard title="Processus" val={data?.totalProcessus || 0} icon={Layers} color="purple" sub="Unités Cartographiées" />
      </div>

      {/* 📋 ZONE D'ANALYSE (Scroll Isolé) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4 space-y-10">
        <div className="max-w-400 mx-auto space-y-10 pb-10">
          
          {/* BANNIÈRE D'ALERTE §10.2 */}
          <div className="bg-linear-to-r from-red-900/40 to-transparent border-2 border-red-600/30 rounded-[4rem] p-10 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-4xl group">
            <div className="flex items-center gap-8 text-left z-10">
               <div className="w-20 h-20 bg-red-600 rounded-4xl flex items-center justify-center shadow-3xl animate-pulse"><AlertTriangle size={40} className="text-white" /></div>
               <div>
                  <h3 className="text-3xl tracking-tighter m-0 leading-none mb-3">Attention Requise §10.2</h3>
                  <p className="text-slate-400 text-[10px] tracking-[0.4em] m-0 italic font-bold">{data?.nonConformities || 0} ÉCARTS EN COURS DE RÉSOLUTION • AUDIT CRITIQUE</p>
               </div>
            </div>
            <button className="bg-white text-red-600 px-12 py-5 rounded-3xl text-[10px] transition-all border-none cursor-pointer shadow-4xl z-10 font-black italic">GÉRER LES NC</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             {/* GRAPHE DE TRAJECTOIRE */}
             <div className="lg:col-span-8 bg-[#151B2B] border-2 border-white/5 rounded-[4rem] p-12 shadow-4xl text-left relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12 pointer-events-none"><TrendingUp size={300} /></div>
                <h3 className="text-2xl mb-12 m-0 tracking-tighter italic">Trajectoire Performance SMI</h3>
                <div className="space-y-10">
                   {['Satisfaction Client', 'Efficacité Opérationnelle', 'Maturité Normative'].map((label, i) => (
                     <div key={i} className="space-y-4">
                        <div className="flex justify-between items-end italic"><span className="text-[11px] text-slate-400 tracking-widest">{label}</span><span className="text-2xl leading-none">8{5-i}%</span></div>
                        <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                           <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `8${5-i}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             
             {/* EXPORT RAPPORT */}
             <div className="lg:col-span-4 flex flex-col gap-8">
                <button className="flex-1 bg-linear-to-br from-blue-700 to-blue-900 rounded-[4rem] p-12 flex flex-col justify-between items-center shadow-4xl border-none transition-all hover:scale-[0.98] group cursor-pointer relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10"><Fingerprint size={120} /></div>
                   <div className="w-20 h-20 bg-white/10 rounded-4xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform"><FileDown size={40} className="text-white" /></div>
                   <div className="text-center space-y-4 relative z-10">
                      <h4 className="text-3xl m-0 leading-none italic tracking-tighter">Export Exécutif</h4>
                      <p className="text-[9px] text-blue-200 tracking-[0.4em] m-0 opacity-60">GÉNÉRER RAPPORT §9.3</p>
                   </div>
                   <ChevronRight size={32} className="opacity-40" />
                </button>
             </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

// --- 🧩 COMPOSANTS D'ARCHITECTURE SDE ---

function KPICard({ title, val, icon: Icon, color, sub }: any) {
  const themes: any = { 
    emerald: "text-emerald-500 border-emerald-500/10", 
    blue: "text-blue-500 border-blue-500/10", 
    amber: "text-amber-500 border-amber-500/10", 
    purple: "text-purple-500 border-purple-500/10" 
  };
  return (
    <div className={cn("bg-[#151B2B] p-8 rounded-[3rem] border-2 flex items-center gap-6 shadow-4xl transition-all hover:-translate-y-2", themes[color])}>
      <div className="p-4 bg-black/40 rounded-2xl shadow-inner border border-white/5"><Icon size={28} /></div>
      <div className="text-left">
        <p className="text-4xl font-black italic m-0 tracking-tighter text-white leading-none">{val}</p>
        <p className="text-[10px] text-slate-500 tracking-widest mt-2 m-0 uppercase leading-none">{title}</p>
        <p className="text-[8px] text-slate-700 mt-1 m-0 tracking-[0.3em] font-bold">{sub}</p>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed">{label}</span>
    </div>
  );
}