/**
 * 📈 MODULE : ProgressStats
 * -------------------------------------------------------------------------
 * FONCTION : Monitoring du taux de levée d'écarts (KPI ISO).
 * RÔLE : Visualisation graphique de la performance corrective du Tenant.
 * DESIGN : Elite (Black labels, Progress glow, Emerald/Amber variants).
 */

'use client';

import React from 'react';
import { Activity } from 'lucide-react';

export function ProgressStats({ total, done }: { total: number, done: number }) {
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-2xl animate-in zoom-in duration-700 italic text-left">
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-2">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
             <Activity size={12} className="text-blue-600" /> Taux de levée d&apos;actions
          </p>
          <h3 className="text-6xl font-black text-slate-900 tracking-tighter leading-none italic">{percentage}%</h3>
        </div>
        <p className="text-sm font-black text-slate-500 uppercase tracking-tighter">
          <span className="text-blue-600">{done}</span> / {total} Dossiers Clôturés
        </p>
      </div>
      
      {/* BARRE DE PROGRESSION ÉLITE */}
      <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden p-1.5 border border-slate-200/50 shadow-inner">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(37,99,235,0.6)]"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mt-12">
        <div className="p-6 bg-emerald-50 rounded-4xl border border-emerald-100 flex flex-col items-center text-center group hover:bg-emerald-100 transition-colors">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic leading-none mb-3">Registre Clôturé</p>
          <p className="text-4xl font-black text-emerald-700 italic tracking-tighter leading-none">{done}</p>
        </div>
        <div className="p-6 bg-amber-50 rounded-4xl border border-amber-100 flex flex-col items-center text-center group hover:bg-amber-100 transition-colors">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest italic leading-none mb-3">En cours (Flux)</p>
          <p className="text-4xl font-black text-amber-700 italic tracking-tighter leading-none">{total - done}</p>
        </div>
      </div>
    </div>
  );
}