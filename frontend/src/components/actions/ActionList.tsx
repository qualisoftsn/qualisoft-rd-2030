/**
 * 📋 COMPOSANT : ActionList.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Reporting tabulaire haute fidélité des actions correctives.
 * PHILOSOPHIE : Traçabilité totale des pilotes et des échéances (§10.2).
 * DESIGN : High-Density / Sovereign Theme.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 17:55 GMT
 */

"use client";

import { Clock, Link as LinkIcon, AlertCircle, ShieldCheck } from 'lucide-react';

interface IAction {
  ACT_Id: string;
  ACT_Title: string;
  ACT_Description?: string;
  ACT_Status: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE';
  ACT_Deadline: string;
  ACT_Origin: string;
  ACT_Responsable?: {
    U_FirstName: string;
    U_LastName: string;
  };
  ACT_Reclamation?: {
    REC_Reference: string;
  };
}

interface ActionListProps {
  actions: IAction[];
}

export default function ActionList({ actions }: ActionListProps) {
  
  const getStatusBadge = (status: string) => {
    const styles = {
      TERMINEE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
      EN_COURS: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]",
      A_FAIRE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    };
    
    return (
      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic border transition-all ${styles[status as keyof typeof styles] || 'bg-slate-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="bg-[#0F172A] rounded-[2.5rem] border border-white/5 shadow-4xl overflow-hidden animate-in fade-in duration-700 text-left">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5">
          <thead className="bg-white/2">
            <tr>
              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Libellé / Description</th>
              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Pilote Responsable</th>
              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Origine & Lien</th>
              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Statut Flux</th>
              <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Échéance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-transparent">
            {actions.map((action) => (
              <tr key={action.ACT_Id} className="hover:bg-blue-600/5 transition-all duration-300 group">
                <td className="px-8 py-7">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-blue-500 transition-colors truncate">
                      {action.ACT_Title}
                    </span>
                    <p className="text-[11px] text-slate-500 font-bold mt-2 italic uppercase opacity-60 truncate max-w-xs m-0">
                      {action.ACT_Description || "AUCUN DÉTAIL SCELLÉ"}
                    </p>
                  </div>
                </td>

                <td className="px-8 py-7">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-[11px] font-black text-white italic border border-white/10 shadow-lg group-hover:bg-blue-600 group-hover:border-blue-400 transition-all">
                      {action.ACT_Responsable?.U_FirstName?.[0]}{action.ACT_Responsable?.U_LastName?.[0]}
                    </div>
                    <span className="text-xs font-black text-slate-300 italic uppercase tracking-tight">
                      {action.ACT_Responsable?.U_FirstName} {action.ACT_Responsable?.U_LastName}
                    </span>
                  </div>
                </td>

                <td className="px-8 py-7">
                  {action.ACT_Reclamation ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-lg">
                      <LinkIcon size={12} />
                      <span className="text-[9px] font-black uppercase italic tracking-tighter leading-none">
                        {action.ACT_Reclamation.REC_Reference}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-600 group-hover:text-slate-400 transition-colors">
                      <ShieldCheck size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">{action.ACT_Origin}</span>
                    </div>
                  )}
                </td>

                <td className="px-8 py-7">{getStatusBadge(action.ACT_Status)}</td>

                <td className="px-8 py-7 text-right">
                  <div className="flex items-center justify-end gap-3 font-black text-slate-500 italic text-xs">
                    <Clock size={14} className="group-hover:text-blue-500 transition-colors" />
                    {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString('fr-FR') : '---'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {actions.length === 0 && (
        <div className="py-32 text-center flex flex-col items-center animate-in zoom-in duration-500">
          <AlertCircle size={48} className="text-slate-800 mb-6" />
          <p className="text-slate-600 font-black uppercase italic text-[10px] tracking-[0.5em]">Registre Vierge : Aucune action détectée</p>
        </div>
      )}
    </div>
  );
}