//* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { 
  Zap, Droplets, Flame, Recycle, TrendingUp, TrendingDown, AlertTriangle 
} from 'lucide-react';

interface EnvironmentalStatsProps {
  stats: {
    energyConsumption: number;
    waterConsumption: number;
    totalWaste: number;
    recyclingRate: number;
    hazardousWaste: number;
    energyTrend: string;
    waterTrend: string;
    recyclingTrend: string;
    wasteTrend: string;
  };
}

export default function EnvironmentalStats({ stats }: EnvironmentalStatsProps) {
  const getTrendIcon = (trend: string = '') => {
    if (trend.startsWith('+')) return <TrendingUp className="text-red-400" size={18} />;
    if (trend.startsWith('-')) return <TrendingDown className="text-green-400" size={18} />;
    return <TrendingUp className="text-slate-400" size={18} />;
  };

  const getTrendClass = (trend: string = '') => {
    if (trend.startsWith('+')) return 'text-red-400';
    if (trend.startsWith('-')) return 'text-green-400';
    return 'text-slate-400';
  };

  const s = {
    energyConsumption: stats?.energyConsumption || 0,
    waterConsumption: stats?.waterConsumption || 0,
    totalWaste: stats?.totalWaste || 0,
    recyclingRate: stats?.recyclingRate || 0,
    hazardousWaste: stats?.hazardousWaste || 0,
    energyTrend: stats?.energyTrend || '0%',
    waterTrend: stats?.waterTrend || '0%',
    wasteTrend: stats?.wasteTrend || '0%',
    recyclingTrend: stats?.recyclingTrend || '0%',
  };

  const metrics = [
    { label: 'ÉNERGIE (kWh)', value: s.energyConsumption.toLocaleString(), icon: <Zap className="text-amber-400" />, trend: s.energyTrend, alert: s.energyConsumption > 10000 },
    { label: 'EAU (m³)', value: s.waterConsumption.toLocaleString(), icon: <Droplets className="text-blue-400" />, trend: s.waterTrend, alert: s.waterConsumption > 500 },
    { label: 'DÉCHETS (kg)', value: s.totalWaste.toLocaleString(), icon: <Flame className="text-red-400" />, trend: s.wasteTrend, alert: s.hazardousWaste > 0 },
    { label: 'RECYCLAGE (%)', value: `${s.recyclingRate}%`, icon: <Recycle className="text-green-400" />, trend: s.recyclingTrend, alert: s.recyclingRate < 75 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {metrics.map((m, i) => (
        <div key={i} className={`p-8 rounded-[2.5rem] border-2 transition-all hover:scale-[1.02] relative group overflow-hidden ${
          m.alert ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/40 border-white/5'
        }`}>
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 shrink-0">{m.icon}</div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                {getTrendIcon(m.trend)}
                <span className={`text-[10px] font-black italic ${getTrendClass(m.trend)}`}>{m.trend}</span>
              </div>
              <span className="text-[7px] font-black text-slate-500 uppercase italic">vs L-1</span>
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">{m.label}</p>
          <p className="text-3xl font-black italic text-white tracking-tighter m-0">{m.value}</p>
          {m.alert && <div className="mt-4 p-2 bg-amber-500/20 rounded-xl text-[8px] font-black text-amber-400 uppercase italic flex items-center gap-2 animate-pulse"><AlertTriangle size={12}/> Seuil Critique</div>}
        </div>
      ))}
    </div>
  );
}