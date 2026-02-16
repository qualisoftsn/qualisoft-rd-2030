"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, Database, Cpu, Globe, Zap, ShieldCheck, 
  Terminal, Server, LucideIcon, RefreshCw 
} from "lucide-react";

/**
 * 🛰️ INTERFACE DES MÉTRIQUES SYSTÈME
 */
interface MatrixMetrics {
  apiLatency: string;
  dbStatus: "SCELLÉ" | "SYNCHRO" | "MAINTENANCE";
  activeSessions: number;
  cpuUsage: string;
  nodesActive: number;
}

/**
 * 🧩 COMPOSANT INTERNE : CARTE DE STATUT HAUTE-VISIBILITÉ
 */
const MetricCard = ({ icon: Icon, label, value, color, trend }: { 
  icon: LucideIcon, label: string, value: string | number, color: string, trend?: string 
}) => (
  <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all group relative overflow-hidden">
    <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
      <Icon size={120} />
    </div>
    <div className="flex items-start gap-4 relative z-10">
      <div className={`p-4 rounded-2xl bg-slate-50 ${color} border border-slate-100 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">{value}</p>
          {trend && <span className="text-[10px] font-bold text-emerald-500 animate-pulse">{trend}</span>}
        </div>
      </div>
    </div>
  </div>
);

/**
 * 🏛️ UNITÉ DE SURVEILLANCE SOUVERAINE
 */
export default function MatrixHealthMonitor() {
  const [metrics, setMetrics] = useState<MatrixMetrics>({
    apiLatency: "22ms",
    dbStatus: "SCELLÉ",
    activeSessions: 42,
    cpuUsage: "12%",
    nodesActive: 0
  });

  const [logs, setLogs] = useState<{time: string, msg: string, type: 'success' | 'info' | 'warn'}[]>([]);

  // Simulation du monitoring dynamique (Prêt pour intégration API réelle)
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(prev => ({
        ...prev,
        apiLatency: `${Math.floor(Math.random() * (28 - 18) + 18)}ms`,
        cpuUsage: `${Math.floor(Math.random() * (18 - 8) + 8)}%`,
        activeSessions: prev.activeSessions + (Math.random() > 0.5 ? 1 : -1)
      }));
    };

    const addLog = (msg: string, type: 'success' | 'info' | 'warn' = 'info') => {
      const time = new Date().toLocaleTimeString('fr-FR', { hour12: false });
      setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 5));
    };

    // Initialisation
    addLog("Initialisation du Neuro-Cortex Matrix...", "success");
    addLog("Synchronisation avec les nœuds SDE et PAD établie.", "info");

    const mInterval = setInterval(updateMetrics, 3000);
    return () => clearInterval(mInterval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 font-sans italic">
      
      {/* --- HEADER SOC --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-slate-50 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-4">
            <Activity className="text-blue-600 animate-pulse" size={40} /> 
            Matrix <span className="text-blue-600 underline">Health</span> Monitor
          </h2>
          <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] mt-3 pl-1">
            Diagnostic souverain du noyau Qualisoft Elite RD 2030
          </p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Uptime Global</span>
                <span className="text-sm font-black text-slate-900">99.99% SANS INTERRUPTION</span>
            </div>
            <div className="bg-emerald-500 px-8 py-4 rounded-3xl flex items-center gap-3 shadow-xl shadow-emerald-500/20">
                <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                <span className="text-xs font-black text-white uppercase tracking-widest">Système Scellé</span>
            </div>
        </div>
      </div>

      {/* --- GRILLE DE MÉTRIQUES --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={Globe} label="Latence Backbone" 
          value={metrics.apiLatency} color="text-blue-600" trend="-2ms" 
        />
        <MetricCard 
          icon={Database} label="État Base de Données" 
          value={metrics.dbStatus} color="text-emerald-600" 
        />
        <MetricCard 
          icon={Cpu} label="Charge Kernel" 
          value={metrics.cpuUsage} color="text-orange-600" trend="STABLE" 
        />
        <MetricCard 
          icon={Zap} label="Sessions Concurrentes" 
          value={metrics.activeSessions} color="text-indigo-600" 
        />
      </div>

      {/* --- CONSOLE D'AUDIT ET INFRA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TERMINAL LOGS */}
        <div className="lg:col-span-2 bg-slate-950 rounded-[2.5rem] p-8 text-white relative border-4 border-slate-900 shadow-2xl overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
             <ShieldCheck size={180} />
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 flex items-center gap-3">
              <Terminal size={18} /> Console d&apos;Audit en Temps Réel
            </h3>
            <RefreshCw size={14} className="text-slate-700 animate-spin-slow" />
          </div>

          <div className="space-y-3 font-mono text-[12px] relative z-10">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4 animate-in slide-in-from-left duration-300">
                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                <span className={`font-bold uppercase shrink-0 ${
                  log.type === 'success' ? 'text-emerald-500' : 
                  log.type === 'warn' ? 'text-orange-500' : 'text-blue-400'
                }`}>
                  {log.type === 'success' ? '✓ OK' : log.type === 'warn' ? '⚠ WARN' : 'ℹ INFO'} :
                </span>
                <span className="text-slate-300 italic truncate">{log.msg}</span>
              </div>
            ))}
            <div className="pt-2 flex items-center gap-2">
               <div className="w-1 h-4 bg-blue-500 animate-pulse" />
               <span className="text-blue-500/50 italic">_ En attente de commande Master...</span>
            </div>
          </div>
        </div>

        {/* CLUSTER MONITOR */}
        <div className="bg-white rounded-[2.5rem] p-10 border-4 border-slate-50 shadow-xl flex flex-col justify-between group">
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-8 italic">État de l&apos;Infrastructure</h3>
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                    <p className="text-6xl font-black text-slate-900 tracking-tighter leading-none">05</p>
                    <p className="text-[10px] font-black uppercase text-blue-600 mt-2 tracking-widest">Nœuds Clients Actifs</p>
                </div>
                <Server className="text-slate-100 group-hover:text-blue-100 transition-colors" size={60} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase italic">
                    <span className="text-slate-400">Capacité Serveur</span>
                    <span className="text-slate-900">68%</span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
                   <div className="h-full bg-blue-600 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.6)] transition-all duration-1000" style={{ width: '68%' }} />
                </div>
              </div>
            </div>
          </div>

          <button className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all cursor-pointer shadow-lg shadow-slate-900/20 active:scale-95 mt-8">
              Lancer Scan Complet
          </button>
        </div>

      </div>
    </div>
  );
}