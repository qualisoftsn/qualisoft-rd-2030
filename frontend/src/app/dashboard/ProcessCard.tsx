/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/components/dashboard/ProcessCard.tsx
import { ArrowUpRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ProcessCard({ process }: { process: any }) {
  const kpi = process.PR_Indicators?.[0];
  const risk = process.PR_Risks?.[0];
  const performance = kpi ? (kpi.IND_Values?.[0]?.IV_Actual / kpi.IND_Cible) * 100 : 0;

  return (
    <div className="bg-[#0F172A] border border-white/5 rounded-2xl p-5 hover:border-blue-500/50 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{process.PR_Code}</span>
          <h3 className="text-sm font-bold text-white mt-1 group-hover:text-blue-400 transition-colors">{process.PR_Libelle}</h3>
        </div>
        <div className={`p-2 rounded-lg ${performance >= 95 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
          {performance >= 95 ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
        </div>
      </div>

      {/* Jauge de Performance */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-medium">
          <span className="text-slate-500">Performance KPI</span>
          <span className="text-white">{performance.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${performance >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${performance}%` }}
          />
        </div>
      </div>

      {/* Info Risque */}
      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${risk?.RS_Score > 10 ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-[9px] text-slate-400 uppercase font-bold">Risque: {risk?.RS_Libelle?.substring(0, 15)}...</span>
        </div>
        <button className="text-slate-500 hover:text-white transition-colors">
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}