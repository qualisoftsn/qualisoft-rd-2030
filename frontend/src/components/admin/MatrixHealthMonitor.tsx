/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📡 MODULE : MatrixHealthMonitor (SOC Dashboard)
 * RÔLE : Diagnostic de santé de la Matrix OS
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useState, useEffect } from "react";
import { Activity, Database, Cpu, Globe, Zap, Terminal, RefreshCw, ShieldCheck, Server, CheckCircle2 } from "lucide-react";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface MetricData {
  latency: string;
  cpu: string;
  nodes: number;
  sessions: number;
}

export interface LogEntry {
  time: string;
  msg: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}

// ============================================================================
// SOUS-COMPOSANT : METRIC CARD
// ============================================================================

function MetricCard({ icon: Icon, label, value, color }: MetricCardProps) {
  return (
    <article 
      className="bg-[#0F172A] p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all group shadow-2xl focus-within:ring-2 focus-within:ring-blue-400"
      role="article"
      aria-label={`${label}: ${value}`}
      tabIndex={0}
    >
      <div className={cn(
        "p-3 md:p-4 rounded-xl bg-white/5 w-fit mb-4 md:mb-6 border border-white/5 group-hover:scale-110 transition-transform",
        color
      )}>
        <Icon size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
      </div>
      <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest italic m-0 mb-1 md:mb-2">{label}</p>
      <p className="text-2xl md:text-3xl font-black text-white italic m-0 tracking-tighter uppercase tabular-nums">{value}</p>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function MatrixHealthMonitor() {
  const [metrics, setMetrics] = useState<MetricData>({ latency: "18ms", cpu: "12%", nodes: 5, sessions: 42 });
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const update = () => setMetrics(prev => ({
      ...prev,
      latency: `${Math.floor(Math.random() * 10 + 15)}ms`,
      cpu: `${Math.floor(Math.random() * 5 + 8)}%`,
      sessions: Math.max(0, prev.sessions + (Math.random() > 0.5 ? 1 : -1))
    }));
    
    const interval = setInterval(update, 3000);
    setLogs(prev => [...prev.slice(-9), { 
      time: new Date().toLocaleTimeString('fr-SN', { hour: '2-digit', minute: '2-digit' }), 
      msg: "Neuro-Cortex Matrix Synchronisé", 
      type: "success" 
    }]);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 italic text-left"
      aria-labelledby="health-title"
      role="region"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 border-b-2 border-white/5 pb-6 md:pb-8">
        <div>
          <h2 id="health-title" className="text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2 md:gap-3 lg:gap-4 m-0">
            <Activity className="text-blue-400 animate-pulse w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" aria-hidden="true" /> 
            Matrix <span className="text-blue-400 underline">Health</span> Monitor
          </h2>
          <p className="text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase text-slate-500 tracking-widest mt-1 md:mt-2 lg:mt-3 m-0">
            Diagnostic Souverain du Noyau Elite RD-2026
          </p>
        </div>
        <div 
          className="bg-emerald-500/20 border border-emerald-500/30 px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 lg:gap-4 shadow-xl"
          role="status"
          aria-live="polite"
        >
          <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-400 rounded-full animate-ping" aria-hidden="true" />
          <span className="text-[9px] md:text-[10px] lg:text-[11px] font-black text-emerald-400 uppercase tracking-widest italic leading-none">
            Système Scellé
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6" role="list" aria-label="Métriques système">
        <MetricCard icon={Globe} label="Latence Backbone" value={metrics.latency} color="text-blue-400" />
        <MetricCard icon={Database} label="État BDD" value="SCELLÉ" color="text-emerald-400" />
        <MetricCard icon={Cpu} label="Charge Kernel" value={metrics.cpu} color="text-amber-400" />
        <MetricCard icon={Zap} label="Sessions Actives" value={metrics.sessions} color="text-indigo-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        <article 
          className="lg:col-span-2 bg-[#020617] rounded-2xl md:rounded-3xl lg:rounded-[3rem] p-4 md:p-6 lg:p-8 xl:p-10 border border-white/5 shadow-inner group relative overflow-hidden"
          aria-labelledby="audit-console-title"
        >
          <ShieldCheck className="absolute -right-4 md:-right-6 lg:-right-10 -bottom-4 md:-bottom-6 lg:-bottom-10 text-white/5 scale-[2] md:scale-[2.5] lg:scale-[3] pointer-events-none" aria-hidden="true" />
          <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
            <h3 id="audit-console-title" className="text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-1.5 md:gap-2 lg:gap-3 m-0">
              <Terminal size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" /> 
              Console d&apos;Audit Temps Réel
            </h3>
            <RefreshCw size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-slate-700 animate-spin-slow" aria-hidden="true" />
          </div>
          <div 
            className="space-y-2 md:space-y-3 lg:space-y-4 font-mono text-[9px] md:text-[10px] lg:text-[11px] relative z-10 max-h-[300px] overflow-y-auto custom-scrollbar"
            role="log"
            aria-live="polite"
          >
            {logs.map((l, i) => (
              <div key={i} className="flex gap-2 md:gap-3 lg:gap-4 animate-in slide-in-from-left duration-300" role="listitem">
                <span className="text-slate-600 tabular-nums">[{l.time}]</span>
                <CheckCircle2 size={12} className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
                <span className="text-slate-400 italic">{l.msg}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 md:gap-2" aria-hidden="true">
              <div className="w-1 h-3 md:h-4 bg-blue-400 animate-pulse" />
              <span className="text-blue-400/30 italic">_ En attente de commande Master...</span>
            </div>
          </div>
        </article>

        <article 
          className="bg-white rounded-2xl md:rounded-3xl lg:rounded-[3rem] p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col justify-between shadow-2xl group"
          aria-labelledby="infrastructure-title"
        >
          <h3 id="infrastructure-title" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest italic m-0">
            Infrastructure Globale
          </h3>
          <div className="my-4 md:my-6 lg:my-8 md:my-10">
            <p className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tighter italic m-0 leading-none tabular-nums">
              0{metrics.nodes}
            </p>
            <p className="text-[9px] md:text-[10px] font-black uppercase text-blue-600 tracking-widest mt-1 md:mt-2 lg:mt-3 m-0">
              Nœuds Clients Scellés
            </p>
          </div>
          <button 
            type="button"
            className="w-full py-3 md:py-4 lg:py-5 bg-slate-950 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border-none cursor-pointer hover:bg-blue-600 transition-all shadow-xl italic focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Lancer un scan complet de l'infrastructure"
          >
            Lancer Scan Complet
          </button>
        </article>
      </div>
    </section>
  );
}
