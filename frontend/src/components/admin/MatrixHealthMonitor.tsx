"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, Database, Cpu, Globe, Zap, ShieldCheck, 
  Terminal, Server, LucideIcon
} from "lucide-react";

/**
 * 🛰️ INTERFACES SOUVERAINES
 */
interface MatrixMetrics {
  apiLatency: string;
  dbStatus: string;
  activeSessions: number;
  cpuUsage: string;
  nodesActive: number;
}

interface StatusCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  statusColor: string;
}

/**
 * 🧩 SOUS-COMPOSANT : STATUS CARD (Défini hors du rendu parent)
 */
const StatusCard = ({ icon: Icon, label, value, statusColor }: StatusCardProps) => (
  <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
      <Icon size={80} />
    </div>
    <div className="flex items-start gap-4 relative z-10">
      <div className={`p-3 rounded-2xl bg-slate-50 ${statusColor} border border-transparent group-hover:border-current transition-all`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">{label}</p>
        <p className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">{value}</p>
      </div>
    </div>
  </div>
);

/**
 * 🏛️ UNITÉ DE SURVEILLANCE SOUVERAINE : QUALISOFT ELITE RD 2030
 */
export default function MatrixHealthMonitor() {
  const [metrics, setMetrics] = useState<MatrixMetrics>({
    apiLatency: "24ms",
    dbStatus: "SCELLÉ",
    activeSessions: 12,
    cpuUsage: "14%",
    nodesActive: 5
  });

  // Simulation de monitoring dynamique (Diagnostic Matrix)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        apiLatency: `${Math.floor(Math.random() * (35 - 18) + 18)}ms`,
        cpuUsage: `${Math.floor(Math.random() * (20 - 10) + 10)}%`
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 italic">
      
      {/* --- HEADER MONITOR --- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
            <Activity className="text-blue-600 animate-pulse" /> Système Health <span className="text-blue-600">Monitor</span>
          </h2>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mt-2 italic">Diagnostic temps réel du Noyau Matrix</p>
        </div>
        <div className="px-5 py-2 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Noyau Opérationnel</span>
        </div>
      </div>

      {/* --- GRILLE DE MÉTRIQUES --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard 
          icon={Globe} 
          label="Latence Matrix" 
          value={metrics.apiLatency} 
          statusColor="text-blue-600" 
        />
        <StatusCard 
          icon={Database} 
          label="Intégrité DB" 
          value={metrics.dbStatus} 
          statusColor="text-emerald-600" 
        />
        <StatusCard 
          icon={Cpu} 
          label="Charge CPU" 
          value={metrics.cpuUsage} 
          statusColor="text-amber-500" 
        />
        <StatusCard 
          icon={Zap} 
          label="Sessions Actives" 
          value={metrics.activeSessions} 
          statusColor="text-indigo-600" 
        />
      </div>

      {/* --- SECTION INFRASTRUCTURE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FLUX D'AUDIT SOUVERAIN */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <ShieldCheck size={150} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.4em] text-blue-400 mb-8 flex items-center gap-2">
            <Terminal size={14} /> Flux d&apos;Audit Souverain
          </h3>
          <div className="space-y-4 font-mono text-[11px] relative z-10">
            <div className="flex gap-4 text-emerald-400">
              <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
              <span className="font-bold uppercase tracking-tighter">SUCCESS:</span>
              <span className="text-slate-300 italic">Connexion Master Abdoulaye scellée (Bypass Active).</span>
            </div>
            <div className="flex gap-4 text-blue-400">
              <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
              <span className="font-bold uppercase tracking-tighter">INFO:</span>
              <span className="text-slate-300 italic">Optimisation Standalone effectuée sur le frontend.</span>
            </div>
          </div>
        </div>

        {/* CLUSTER STATUS */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 italic">Infrastructure Global</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-4xl font-black text-slate-900 leading-none">{metrics.nodesActive}</span>
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Nœuds Déployés</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-2/3" />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase italic">
                <Server size={12} /> Cluster: QS-RD-2030-ALPHA
              </div>
            </div>
          </div>
          <button className="w-full py-4 mt-8 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all cursor-pointer">
             Explorer Cluster
          </button>
        </div>

      </div>
    </div>
  );
}