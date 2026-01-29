/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { CheckSquare, Clock, AlertCircle, ChevronRight, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function ActionsView({ process }: any) {
  // On récupère toutes les actions rattachées au PAQ du processus
  const actions = process?.PR_PAQ?.[0]?.PAQ_Actions || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-xl font-black uppercase italic flex items-center gap-3">
            <CheckSquare className="text-blue-500" /> Plan d&apos;Amélioration (PAQ)
          </h2>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2 italic">
            Cycle PDCA : Traitement des écarts et opportunités §10.2
          </p>
        </div>
        <div className="flex gap-4">
            <StatSmall label="En retard" val={actions.filter((a: any) => a.ACT_Status === 'EN_RETARD').length} color="text-red-500" />
            <StatSmall label="En cours" val={actions.filter((a: any) => a.ACT_Status === 'EN_COURS').length} color="text-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {actions.length > 0 ? actions.map((action: any) => (
          <div key={action.ACT_Id} className="group bg-white/2 border border-white/5 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className={cn("p-4 rounded-2xl", getStatusBg(action.ACT_Status))}>
                  {getStatusIcon(action.ACT_Status)}
               </div>
               <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[7px] font-black px-2 py-0.5 bg-white/5 rounded text-slate-500 uppercase">{action.ACT_Type}</span>
                    <h4 className="text-[11px] font-black uppercase text-white tracking-tight">{action.ACT_Title}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-[8px] font-black text-slate-500 uppercase italic">
                    <span className="flex items-center gap-1"><Clock size={10} /> Échéance : {new Date(action.ACT_Deadline).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users size={10} /> Responsable : {action.ACT_Responsable?.U_LastName}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Progression</p>
                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: action.ACT_Status === 'TERMINEE' ? '100%' : '45%' }} />
                    </div>
                </div>
                <button className="p-3 bg-white/5 rounded-xl group-hover:bg-blue-600 transition-all">
                    <ChevronRight size={16} />
                </button>
            </div>
          </div>
        )) : (
          <div className="py-20 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center opacity-20">
             <CheckSquare size={48} />
             <p className="text-[10px] font-black uppercase mt-4 italic tracking-widest">Aucune action planifiée</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- HELPERS ---
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

function getStatusIcon(status: string) {
    if (status === 'TERMINEE') return <CheckCircle2 size={20} className="text-emerald-500" />;
    if (status === 'EN_RETARD') return <AlertCircle size={20} className="text-red-500" />;
    return <PlayCircle size={20} className="text-blue-500" />;
}

function getStatusBg(status: string) {
    if (status === 'TERMINEE') return 'bg-emerald-500/10';
    if (status === 'EN_RETARD') return 'bg-red-500/10';
    return 'bg-blue-500/10';
}

function StatSmall({ label, val, color }: any) {
    return (
        <div className="text-right">
            <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
            <p className={cn("text-lg font-black italic leading-none", color)}>{val}</p>
        </div>
    );
}