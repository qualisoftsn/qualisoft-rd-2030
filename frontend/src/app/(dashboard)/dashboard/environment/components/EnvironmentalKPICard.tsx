/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 COMPOSANT : KPI CARD ENVIRONNEMENTALE
 * -------------------------------------------------------------------------
 * RÔLE : Visualisation atomique d'un indicateur de performance (IPE).
 * DESIGN : Style "ClickUp Glass", barres de progression néon.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 05:15 GMT
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

export default function EnvironmentalKPICard({
  title, value, target, progress, trend, icon: Icon, color, isoRef, alert = false, onClick
}: any) {
  
  return (
    <div 
      onClick={onClick}
      className={`bg-[#151B2B] p-8 rounded-[2.5rem] border-2 border-white/5 cursor-pointer transition-all hover:border-emerald-500/20 group relative overflow-hidden shadow-4xl ${alert ? 'animate-pulse border-amber-500/30' : ''}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-emerald-500 group-hover:scale-110 transition-transform">
          <Icon size={24} />
        </div>
        {isoRef && <span className="text-[8px] font-black bg-black/40 text-slate-500 px-3 py-1 rounded-full border border-white/5 italic">{isoRef}</span>}
      </div>
      
      <div className="space-y-1 text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic m-0">{title}</p>
        <h3 className="text-4xl font-black italic text-white tracking-tighter m-0 uppercase leading-none">{value}</h3>
        {target && <p className="text-[9px] font-bold text-slate-600 mt-3 italic uppercase m-0 tracking-widest">Target: {target}</p>}
      </div>
      
      {progress !== undefined && (
        <div className="w-full bg-white/5 h-1.5 rounded-full mt-6 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${progress > 90 ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
      
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
        <p className="text-[9px] font-black uppercase italic text-slate-500 m-0 tracking-widest flex items-center gap-2">Matrix Analytics <ArrowUpRight size={10}/></p>
        <div className={`flex items-center text-[10px] font-black italic ${trend.startsWith('-') ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend.startsWith('-') ? <TrendingDown size={14} className="mr-1" /> : <TrendingUp size={14} className="mr-1" />}
          {trend}
        </div>
      </div>
    </div>
  );
}