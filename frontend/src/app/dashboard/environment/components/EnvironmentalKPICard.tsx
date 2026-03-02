/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface EnvironmentalKPICardProps {
  title: string;
  value: string | number;
  target?: string | number;
  progress?: number;
  trend: string;
  icon: any; 
  color: string;
  isoRef?: string;
  alert?: boolean;
  onClick?: () => void;
}

export default function EnvironmentalKPICard({
  title, value, target, progress, trend, icon: Icon, color, isoRef, alert = false, onClick
}: EnvironmentalKPICardProps) {
  
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    return <Icon className="w-8 h-8" />;
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-linear-to-br ${color} p-8 rounded-[2.5rem] cursor-pointer transition-all hover:scale-[1.02] shadow-2xl relative overflow-hidden group ${
        alert ? 'ring-4 ring-amber-400/50 animate-pulse' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm text-white group-hover:scale-110 transition-transform">
          {renderIcon()}
        </div>
        {isoRef && (
          <span className="text-[8px] font-black bg-black/20 text-white px-3 py-1 rounded-full border border-white/20 italic tracking-widest uppercase">
            {isoRef}
          </span>
        )}
      </div>
      
      <div className="space-y-1 text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 italic m-0">{title}</p>
        <p className="text-4xl font-black italic text-white mt-1 uppercase leading-none tracking-tighter">{value}</p>
        {target && (
          <p className="text-[11px] font-bold text-white/60 mt-2 italic uppercase m-0 tracking-widest">
            Objectif: {target}
          </p>
        )}
      </div>
      
      {progress !== undefined && (
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mt-6 shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              progress > 90 ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b]' : 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
            }`} 
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
      
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/20">
        <p className="text-[9px] font-black uppercase italic text-white/90 m-0 tracking-widest">Performance Matrix</p>
        <div className={`flex items-center text-[10px] font-black italic ${
          trend.startsWith('+') ? 'text-emerald-200' : 'text-amber-200'
        }`}>
          {trend.startsWith('+') ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {trend}
        </div>
      </div>
    </div>
  );
}