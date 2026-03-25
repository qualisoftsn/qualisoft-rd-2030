/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📈 MODULE : ProgressStats.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Performance de clôture des actions du Tenant (§10.2 ISO).
 * RÉVISION : 02 Mars 2026 | 18:42 GMT
 */

"use client";

import React from 'react';
import { Activity, Target } from 'lucide-react';

export function ProgressStats({ total, done }: { total: number, done: number }) {
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-4xl animate-in zoom-in-95 duration-700 italic text-left relative overflow-hidden">
      <div className="flex justify-between items-end mb-10 relative z-10">
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3 m-0">
             <Activity size={14} className="text-blue-600" /> Taux de Clôture PAQ
          </p>
          <h3 className="text-7xl font-black text-slate-950 tracking-tighter leading-none italic m-0">{percentage}%</h3>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-slate-900 uppercase tracking-tighter m-0 italic">
            <span className="text-blue-600">{done}</span> / {total} Actions Clôturées
          </p>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 m-0 italic">Objectif SDE : 100%</p>
        </div>
      </div>
      
      {/* PROGRESS BAR ÉLITE */}
      <div className="h-7 w-full bg-slate-100 rounded-full overflow-hidden p-1.5 border border-slate-200/50 shadow-inner mb-10">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_25px_rgba(37,99,235,0.5)] flex items-center justify-end px-4"
          style={{ width: `${percentage}%` }}
        >
          <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse shadow-white shadow-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 relative z-10">
        <StatusBox label="Registre Clôturé" value={done} color="text-emerald-500" bg="bg-emerald-50" border="border-emerald-100" />
        <StatusBox label="Flux en Cours" value={total - done} color="text-amber-500" bg="bg-amber-50" border="border-amber-100" />
      </div>
      
      <Target className="absolute -left-10 -bottom-10 text-slate-50 opacity-10" size={200} />
    </div>
  );
}

function StatusBox({ label, value, color, bg, border }: any) {
  return (
    <div className={`${bg} ${border} p-8 rounded-4xl flex flex-col items-center text-center group hover:scale-[1.02] transition-all`}>
      <p className={`text-[9px] font-black uppercase tracking-widest italic leading-none mb-3 ${color}`}>{label}</p>
      <p className={`text-5xl font-black italic tracking-tighter leading-none m-0 ${color}`}>{value}</p>
    </div>
  );
}
