/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { 
  Zap, Droplets, Flame, Recycle, Leaf, 
  TrendingUp, TrendingDown, AlertTriangle 
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
  // --- FONCTION : ICONE DE TENDANCE ---
  const getTrendIcon = (trend: string = '') => {
    if (trend.startsWith('+')) return <TrendingUp className="text-red-400" size={18} />;
    if (trend.startsWith('-')) return <TrendingDown className="text-green-400" size={18} />;
    return <TrendingUp className="text-slate-400" size={18} />;
  };

  // --- FONCTION : CLASSE CSS DE TENDANCE ---
  const getTrendClass = (trend: string = '') => {
    if (trend.startsWith('+')) return 'text-red-400';
    if (trend.startsWith('-')) return 'text-green-400';
    return 'text-slate-400';
  };

  // ✅ SECURISATION : Valeurs par défaut si stats est incomplet lors du changement de site
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
    {
      label: 'Énergie Consommée',
      value: `${s.energyConsumption.toLocaleString()} kWh`,
      icon: <Zap className="text-amber-400" size={24} />,
      trend: s.energyTrend,
      alert: s.energyConsumption > 9000
    },
    {
      label: 'Eau Consommée',
      value: `${s.waterConsumption.toLocaleString()} m³`,
      icon: <Droplets className="text-blue-400" size={24} />,
      trend: s.waterTrend,
      alert: s.waterConsumption > 450
    },
    {
      label: 'Déchets Produits',
      value: `${s.totalWaste.toLocaleString()} kg`,
      icon: <Flame className="text-red-400" size={24} />,
      trend: s.wasteTrend,
      alert: s.hazardousWaste > 0
    },
    {
      label: 'Taux de Recyclage',
      value: `${s.recyclingRate}%`,
      icon: <Recycle className="text-green-400" size={24} />,
      trend: s.recyclingTrend,
      alert: s.recyclingRate < 60
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {metrics.map((metric, idx) => (
        <div 
          key={idx} 
          className={`group relative p-6 rounded-[2rem] border transition-all duration-300 hover:scale-[1.02] ${
            metric.alert 
              ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
              : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60 hover:border-white/10'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors shadow-inner">
              {metric.icon}
            </div>
            <div className="flex flex-col items-end gap-1 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-1">
                {getTrendIcon(metric.trend)}
                <span className={`text-[10px] font-black italic ${getTrendClass(metric.trend)}`}>
                  {metric.trend.replace('+', '').replace('-', '')}
                </span>
              </div>
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">vs mois dernier</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
              {metric.label}
            </p>
            <p className="text-3xl font-black italic text-white tracking-tighter">
              {metric.value}
            </p>
          </div>
          
          {metric.alert && (
            <div className="mt-4 flex items-center gap-2 p-2 bg-amber-500/20 rounded-xl text-[9px] font-black text-amber-400 uppercase italic animate-pulse">
              <AlertTriangle size={14} className="shrink-0" />
              <span>Seuil ISO-14001 Dépassé</span>
            </div>
          )}

          {/* Décoration subtile en arrière-plan */}
          <div className="absolute -bottom-2 -right-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
             {metric.icon}
          </div>
        </div>
      ))}
    </div>
  );
}