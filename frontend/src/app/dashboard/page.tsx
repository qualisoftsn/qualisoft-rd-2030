/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : Cockpit de Commandement (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Monitoring §9.1 (Surveillance) et §10.2 (Amélioration).
 * DESIGN : 100dvh / High-Density / Zero-Scroll.
 * ---------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 23:55 GMT
 */

"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { 
  Target, ShieldCheck, Zap, 
  AlertTriangle, ChevronRight, Loader2,
  Layers, Activity, TrendingUp
} from 'lucide-react';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { cn } from '@/core/utils/cn';

export default function DashboardPage() {
  const { user } = useAuthStore() as any;
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const context = useMemo(() => {
    if (!user) return null;
    const role = user.U_Role?.toUpperCase();
    const procId = user.U_AssignedProcessId || "TRANSVERSE";
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const sub = hostname.split(".")[0].toLowerCase();
    const isMaster = ["app", "elite", "localhost", "qualisoft"].includes(sub);
    return { role, procId, isMaster };
  }, [user]);

  if (!mounted || !user || !context) return <DashboardLoader />;

  return (
    <div className="h-full flex flex-col overflow-hidden text-left italic font-black uppercase">
      
      {/* 🔝 IDENTITY HEADER */}
      <header className="shrink-0 pb-10 border-b border-white/5 flex flex-col xl:flex-row justify-between items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <span className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[9px] text-blue-500 tracking-widest">
                {context.isMaster ? "Sovereign Master Node" : `Organisation : ${user.U_TenantName}`}
             </span>
             <span className="text-slate-600 text-[9px] tracking-[0.4em]">ADDR: {user.U_Id.slice(0, 8)}</span>
          </div>
          <h1 className="text-5xl lg:text-7xl tracking-tighter leading-none m-0">Salut, <span className="text-blue-600">{user.U_FirstName}</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.4em] m-0 flex items-center gap-3">
            <Layers size={14} className="text-blue-500" /> {context.isMaster ? "Matrix Control Tower" : `Pilotage : ${context.role}`} — §{context.procId}
          </p>
        </div>

        <div className="bg-slate-900/40 border border-white/10 p-6 rounded-[2.5rem] flex items-center gap-6 backdrop-blur-3xl shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 tracking-widest mb-2 leading-none">Indice SMI Global</p>
            <p className="text-3xl font-black text-white m-0 tracking-tighter">98.4%</p>
          </div>
        </div>
      </header>

      {/* 🧩 MATRIX GRID (§9.1) */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-10 pt-10">
        
        {/* 📋 COLONNE OPÉRATIONNELLE (65%) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-10 pr-4">
          
          <section className="bg-white/5 border border-white/5 p-12 rounded-[4rem] shadow-4xl relative overflow-hidden group hover:border-blue-600/20 transition-all">
            <div className="flex items-center justify-between mb-12 relative z-10">
              <h3 className="text-[11px] text-slate-500 tracking-[0.5em] flex items-center gap-4 m-0"><Target size={20} className="text-blue-500" /> Objectifs Stratégiques</h3>
              <button className="text-[9px] text-blue-500 hover:text-white transition-colors border-none bg-transparent cursor-pointer tracking-widest">SMI DETAILS §4.4</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <ProgressCard label="Performance Qualité" val={88} color="bg-blue-600" />
              <ProgressCard label="Traitement des NC" val={42} color="bg-amber-500" />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <QuickAlert icon={Zap} title="Actions Correctives" desc="4 actions en attente de validation d'efficacité." color="blue" />
            <QuickAlert icon={AlertTriangle} title="Non-Conformités" desc="Une anomalie critique (§10.2) détectée." color="red" />
          </div>

          {/* 📈 PERFORMANCE VISUAL (LTV/SMI FORMULA) */}
          <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] flex items-center justify-between shadow-inner">
             <div className="text-left space-y-2">
                <p className="text-[9px] text-slate-600 tracking-widest leading-none m-0 uppercase">Calcul de Maturité SMI</p>
                <p className="text-xs text-blue-500 font-bold m-0 italic lowercase tracking-tight">
                  {"$$SMI_{idx} = \\frac{\\sum KPI_n}{n} \\times Compliance_{rate} = 98.4\\%$$"}
                </p>
             </div>
             <TrendingUp size={40} className="text-blue-600 opacity-20" />
          </div>
        </div>

        {/* 🛰️ TRAÇABILITÉ TEMPS RÉEL (35%) */}
        <div className="w-full lg:w-96 shrink-0 bg-[#151A2D] border border-white/5 rounded-[4rem] flex flex-col shadow-4xl overflow-hidden">
           <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[11px] text-slate-500 tracking-[0.4em] m-0 flex items-center gap-3"><Activity size={18}/> Flux SDE</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar px-6">
              <ActivityFeed />
           </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// --- SOUS-COMPOSANTS ---
function ProgressCard({ label, val, color }: any) {
  return (
    <div className="bg-black/40 p-10 rounded-3xl border border-white/5 shadow-inner">
      <div className="flex justify-between items-end mb-6">
        <p className="text-sm font-black text-white m-0 tracking-tight">{label}</p>
        <p className="text-[11px] text-slate-500 m-0">{val}%</p>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${val}%` }} />
      </div>
    </div>
  );
}

function QuickAlert({ icon: Icon, title, desc, color }: any) {
  const themes: any = { blue: "bg-blue-600/5 border-blue-500/20 text-blue-500", red: "bg-red-600/5 border-red-500/20 text-red-500" };
  return (
    <div className={cn("p-10 rounded-[3rem] border transition-all cursor-pointer group shadow-2xl", themes[color])}>
      <div className="flex justify-between items-start mb-6">
        <Icon size={32} />
        <ChevronRight className="opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
      </div>
      <p className="text-lg font-black text-white m-0 mb-3">{title}</p>
      <p className="text-[10px] text-slate-500 tracking-widest leading-relaxed m-0">{desc}</p>
    </div>
  );
}

function DashboardLoader() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 italic font-black uppercase text-blue-600 tracking-[0.5em]">
      <Loader2 className="animate-spin" size={40} />
      <span className="text-[10px] animate-pulse leading-relaxed">Synchronisation des Flux Matrix...</span>
    </div>
  );
}