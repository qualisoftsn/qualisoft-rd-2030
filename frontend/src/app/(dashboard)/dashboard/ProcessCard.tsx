/**
 * 📊 COMPOSANT : ProcessCard.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Monitoring Performance (KPI) & Risques ISO §4.4 / §9.1.
 * FORMULE : Performance = Min((Réel / Cible) * 100, 100).
 * RÉVISION : 02 Mars 2026 | 17:23 GMT
 */

import React from 'react';
import { ArrowUpRight, AlertTriangle, CheckCircle2, Target } from 'lucide-react';

interface ProcessCardProps {
  process: {
    PR_Id: string;
    PR_Code: string;
    PR_Libelle: string;
    PR_Indicators?: Array<{ IND_Cible: number; IND_Values?: Array<{ IV_Actual: number }> }>;
    PR_Risks?: Array<{ RS_Score: number; RS_Libelle: string }>;
  };
}

export default function ProcessCard({ process }: ProcessCardProps) {
  const kpi = process.PR_Indicators?.[0];
  const actual = kpi?.IND_Values?.[0]?.IV_Actual ?? 0;
  const target = kpi?.IND_Cible || 1; 
  const performance = Math.min((actual / target) * 100, 100);

  const risk = process.PR_Risks?.[0];
  const isHighRisk = (risk?.RS_Score ?? 0) > 10;
  const isOptimal = performance >= 95;

  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-4xl p-6 hover:border-blue-500/50 transition-all group shadow-2xl relative overflow-hidden text-left">
      <div className="absolute -inset-px bg-linear-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="min-w-0">
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic leading-none">{process.PR_Code || 'PROC-000'}</span>
          <h3 className="text-lg font-black text-white mt-1.5 group-hover:text-blue-400 transition-colors tracking-tighter italic leading-tight truncate">{process.PR_Libelle}</h3>
        </div>
        <div className={`p-2.5 rounded-xl border transition-all shrink-0 ${isOptimal ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
          {isOptimal ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <AlertTriangle size={18} strokeWidth={2.5} />}
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-end text-[9px] font-black uppercase italic tracking-widest leading-none">
          <div className="flex items-center gap-2 text-slate-500"><Target size={12} /> Indice Performance</div>
          <span className={isOptimal ? 'text-emerald-500' : 'text-white'}>{performance.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <div className={`h-full transition-all duration-1000 ease-out ${isOptimal ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]'}`} style={{ width: `${performance}%` }} />
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isHighRisk ? 'bg-red-500 animate-pulse shadow-[0_0_10px_red]' : 'bg-slate-700'}`} />
          <div className="min-w-0">
            <p className="text-[8px] text-slate-600 uppercase font-black italic tracking-tighter m-0">Risque Majeur</p>
            <p className="text-[10px] text-white font-bold uppercase italic mt-1 truncate m-0">{risk?.RS_Libelle || 'R.A.S'}</p>
          </div>
        </div>
        <button className="p-2 text-slate-600 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all cursor-pointer bg-transparent border-none shrink-0"><ArrowUpRight size={20} /></button>
      </div>
      
      {isHighRisk && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600/30" />}
    </div>
  );
}