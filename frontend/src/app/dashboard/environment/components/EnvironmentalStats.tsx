/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
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
  const getTrendIcon = (trend: string) => {
    if (trend.startsWith('+')) return <TrendingUp className="text-red-400" size={18} />;
    if (trend.startsWith('-')) return <TrendingDown className="text-green-400" size={18} />;
    return <TrendingUp className="text-slate-400" size={18} />;
  };

  const getTrendClass = (trend: string) => {
    if (trend.startsWith('+')) return 'text-red-400';
    if (trend.startsWith('-')) return 'text-green-400';
    return 'text-slate-400';
  };

  const metrics = [
    {
      label: 'Énergie Consommée',
      value: `${stats.energyConsumption.toLocaleString()} kWh`,
      icon: <Zap className="text-amber-400" size={24} />,
      trend: stats.energyTrend,
      alert: stats.energyConsumption > 9000
    },
    {
      label: 'Eau Consommée',
      value: `${stats.waterConsumption.toLocaleString()} m³`,
      icon: <Droplets className="text-blue-400" size={24} />,
      trend: stats.waterTrend,
      alert: stats.waterConsumption > 450
    },
    {
      label: 'Déchets Produits',
      value: `${stats.totalWaste.toLocaleString()} kg`,
      icon: <Flame className="text-red-400" size={24} />,
      trend: stats.wasteTrend,
      alert: stats.hazardousWaste > 0
    },
    {
      label: 'Taux de Recyclage',
      value: `${stats.recyclingRate}%`,
      icon: <Recycle className="text-green-400" size={24} />,
      trend: stats.recyclingTrend,
      alert: stats.recyclingRate < 60
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <div 
          key={idx} 
          className={`p-5 rounded-2xl border ${
            metric.alert 
              ? 'bg-amber-500/10 border-amber-500/30 animate-pulse' 
              : 'bg-slate-900/40 border-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white/5 rounded-lg">
              {metric.icon}
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(metric.trend)}
              <span className={`text-[10px] font-black ${getTrendClass(metric.trend)}`}>
                {metric.trend.replace('+', '').replace('-', '')}
              </span>
            </div>
          </div>
          
          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">{metric.label}</p>
          <p className="text-2xl font-black text-white">{metric.value}</p>
          
          {metric.alert && (
            <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-amber-400">
              <AlertTriangle size={14} />
              <span>Seuil critique atteint</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}