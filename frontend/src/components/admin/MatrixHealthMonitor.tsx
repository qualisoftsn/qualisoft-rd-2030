/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { Activity, Database, Cpu, Globe, Zap, ShieldCheck, Terminal, Server, LucideIcon } from "lucide-react";

interface MatrixMetrics {
  apiLatency: string;
  dbStatus: string;
  activeSessions: number;
  cpuUsage: string;
  nodesActive: number;
}

const StatusCard = ({ icon: Icon, label, value, statusColor }: { icon: LucideIcon; label: string; value: string | number; statusColor: string }) => (
  <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-blue-500 transition-all group relative overflow-hidden">
    <Icon className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity ${statusColor}`} size={100} />
    <div className="flex items-center gap-4 relative z-10">
      <div className={`p-4 rounded-2xl bg-slate-50 ${statusColor} border border-slate-100`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">{label}</p>
        <p className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">{value}</p>
      </div>
    </div>
  </div>
);

export default function MatrixHealthMonitor() {
  const [metrics, setMetrics] = useState<MatrixMetrics>({
    apiLatency: "24ms", dbStatus: "SCELLÉ", activeSessions: 12, cpuUsage: "14%", nodesActive: 5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        apiLatency: `${Math.floor(Math.random() * 10 + 15)}ms`,
        cpuUsage: `${Math.floor(Math.random() * 8 + 10)}%`
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans italic">
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-4">
            <Activity className="text-blue-600 animate-pulse" size={32} /> Matrix <span className="text-blue-600">Health</span>
          </h2>
          <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] mt-2 italic pl-1">Monitoring Souverain Qualisoft Elite RD 2030</p>
        </div>
        <div className="px-6 py-3 bg-emerald-500 text-white rounded-full flex items-center gap-3 shadow-lg shadow-emerald-500/20">
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
          <span className="text-[11px] font-black uppercase tracking-widest">Core Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard icon={Globe} label="Latence Backbone" value={metrics.apiLatency} statusColor="text-blue-600" />
        <StatusCard icon={Database} label="Intégrité DB" value={metrics.dbStatus} statusColor="text-emerald-600" />
        <StatusCard icon={Cpu} label="Charge Système" value={metrics.cpuUsage} statusColor="text-orange-600" />
        <StatusCard icon={Zap} label="Flux Actifs" value={metrics.activeSessions} statusColor="text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-950 rounded-[2.5rem] p-8 text-white relative border-4 border-slate-900 shadow-2xl">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 flex items-center gap-3">
            <Terminal size={16} /> Console d&apos;Audit Souverain
          </h3>
          <div className="space-y-3 font-mono text-[12px] text-emerald-400">
             <p><span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> <span className="font-bold">SYS_SYNC:</span> Nœud SDE synchronisé avec succès.</p>
             <p className="text-blue-400"><span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> <span className="font-bold">LOG_AUTH:</span> Accréditation Master scellée (IP: 197.xx.xx.xx).</p>
             <p className="text-slate-500 animate-pulse">_ En attente de nouvelles instructions...</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Cluster Infrastructure</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-5xl font-black text-slate-900">{metrics.nodesActive}</span>
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">Nœuds Déployés</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-600 w-2/3 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-tighter">
                <Server size={14} /> Cluster Instance: ALPHA-ROOT-2030
              </p>
            </div>
          </div>
          <button className="w-full py-5 mt-8 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all cursor-pointer">Explorer Cluster</button>
        </div>
      </div>
    </div>
  );
}