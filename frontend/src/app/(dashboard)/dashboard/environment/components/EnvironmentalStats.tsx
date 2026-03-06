/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 COMPOSANT : BARRE STATISTIQUE MATRIX
 * -------------------------------------------------------------------------
 * RÔLE : Synthèse rapide des tendances IPE mensuelles.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 05:22 GMT
 */

'use client';

import React from 'react';
import { Zap, Droplets, Recycle, Trash2, AlertTriangle } from 'lucide-react';

export default function EnvironmentalStats({ stats }: any) {
  const metrics = [
    { label: 'ÉLECTRICITÉ', val: `${stats.energy} kWh`, icon: Zap, color: 'text-amber-400', alert: stats.energy > 10000 },
    { label: 'RESOURCES EAU', val: `${stats.water} m³`, icon: Droplets, color: 'text-blue-400', alert: false },
    { label: 'VALORISATION', val: `${stats.recycling}%`, icon: Recycle, color: 'text-emerald-400', alert: stats.recycling < 75 },
    { label: 'VOLUME DÉCHETS', val: `${stats.waste} kg`, icon: Trash2, color: 'text-rose-400', alert: stats.waste > 5000 }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((m, i) => (
        <div key={i} className={`p-8 rounded-[3rem] border-2 border-white/5 bg-[#151B2B] flex flex-col items-center justify-center text-center transition-all hover:border-emerald-500/20 shadow-xl ${m.alert ? 'animate-pulse ring-1 ring-amber-500/20' : ''}`}>
           <div className={`p-4 rounded-2xl bg-white/5 mb-6 ${m.color}`}><m.icon size={28}/></div>
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic m-0">{m.label}</p>
           <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter m-0 leading-none">{m.val}</h4>
           {m.alert && <p className="text-[7px] font-black text-amber-500 uppercase mt-3 flex items-center gap-1"><AlertTriangle size={10}/> Seuil Critique</p>}
        </div>
      ))}
    </div>
  );
}