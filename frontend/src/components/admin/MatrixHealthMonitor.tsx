/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📡 MODULE : MatrixHealthMonitor.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Diagnostic de santé de la Matrix OS.
 * DESIGN : Sovereign SOC (Security Operations Center).
 * RÉVISION : 02 Mars 2026 | 18:05 GMT
 */

"use client";

import { useState, useEffect } from "react";
import { Activity, Database, Cpu, Globe, Zap, Terminal, RefreshCw, ShieldCheck } from "lucide-react";

export default function MatrixHealthMonitor() {
  const [metrics, setMetrics] = useState({ latency: "18ms", cpu: "12%", nodes: 5, sessions: 42 });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const update = () => setMetrics(p => ({
      ...p,
      latency: `${Math.floor(Math.random() * 10 + 15)}ms`,
      cpu: `${Math.floor(Math.random() * 5 + 8)}%`,
      sessions: p.sessions + (Math.random() > 0.5 ? 1 : -1)
    }));
    
    const interval = setInterval(update, 3000);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLogs([{ time: "18:05", msg: "Neuro-Cortex Matrix Synchronisé", type: "success" }]);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 italic text-left">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-white/5 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4 m-0">
            <Activity className="text-blue-600 animate-pulse" size={40} /> Matrix <span className="text-blue-600 underline">Health</span> Monitor
          </h2>
          <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] mt-3 m-0">Diagnostic Souverain du Noyau Elite RD-2026</p>
        </div>
        <div className="bg-emerald-500 px-8 py-4 rounded-2xl flex items-center gap-4 shadow-3xl shadow-emerald-500/20">
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
          <span className="text-[11px] font-black text-white uppercase tracking-widest italic leading-none">Système Scellé</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Metric icon={Globe} label="Latence Backbone" value={metrics.latency} color="text-blue-500" />
        <Metric icon={Database} label="État BDD" value="SCELLÉ" color="text-emerald-500" />
        <Metric icon={Cpu} label="Charge Kernel" value={metrics.cpu} color="text-orange-500" />
        <Metric icon={Zap} label="Sessions" value={metrics.sessions} color="text-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#020617] rounded-[3rem] p-10 border border-white/5 shadow-inner group relative overflow-hidden">
          <ShieldCheck className="absolute -right-10 -bottom-10 text-white/5 scale-[3] pointer-events-none" />
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-3 m-0"><Terminal size={18} /> Console d&apos;Audit Temps Réel</h3>
            <RefreshCw size={14} className="text-slate-800 animate-spin-slow" />
          </div>
          <div className="space-y-4 font-mono text-[11px] relative z-10">
            {logs.map((l, i) => (
              <div key={i} className="flex gap-4 animate-in slide-in-from-left duration-300">
                <span className="text-slate-700">[{l.time}]</span>
                <span className="text-emerald-500 font-bold uppercase shrink-0">✓ OK :</span>
                <span className="text-slate-400 italic">{l.msg}</span>
              </div>
            ))}
            <div className="flex items-center gap-2"><div className="w-1 h-4 bg-blue-500 animate-pulse" /><span className="text-blue-500/30 italic">_ En attente de commande Master...</span></div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 flex flex-col justify-between shadow-4xl group">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic m-0">Infrastructure Globale</h3>
          <div className="my-10">
            <p className="text-7xl font-black text-slate-900 tracking-tighter italic m-0 leading-none">0{metrics.nodes}</p>
            <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mt-3 m-0">Nœuds Clients Scellés</p>
          </div>
          <button className="w-full py-5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border-none cursor-pointer hover:bg-blue-600 transition-all shadow-xl italic">Lancer Scan Complet</button>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-[#0F172A] p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all group shadow-2xl">
      <div className={`p-4 rounded-xl bg-white/2 w-fit mb-6 ${color} border border-white/5 group-hover:scale-110 transition-transform`}><Icon size={24} /></div>
      <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic m-0 mb-2">{label}</p>
      <p className="text-3xl font-black text-white italic m-0 tracking-tighter uppercase">{value}</p>
    </div>
  );
}
