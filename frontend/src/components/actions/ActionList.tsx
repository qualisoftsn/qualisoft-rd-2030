/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { Clock, Link as LinkIcon, AlertCircle, User } from 'lucide-react';

interface ActionListProps {
  actions: any[];
}

export default function ActionList({ actions }: ActionListProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      TERMINEE: "bg-emerald-50 text-emerald-700 border-emerald-100",
      EN_COURS: "bg-blue-50 text-blue-700 border-blue-100",
      A_FAIRE: "bg-amber-50 text-amber-700 border-amber-100",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase italic border ${styles[status as keyof typeof styles] || 'bg-slate-100'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-500">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Libellé de l&apos;Action Corrective</th>
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Pilote</th>
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Source ISO</th>
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Statut</th>
            <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Échéance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white">
          {actions.map((action) => (
            <tr key={action.ACT_Id} className="hover:bg-blue-50/30 transition-all duration-200 group">
              <td className="px-8 py-6">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900 uppercase italic tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
                    {action.ACT_Title}
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold mt-1 italic uppercase opacity-70 truncate max-w-xs">
                    {action.ACT_Description}
                  </span>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-[10px] font-black text-white italic border border-white/10 shadow-lg">
                    {action.ACT_Responsable?.U_FirstName[0]}{action.ACT_Responsable?.U_LastName[0]}
                  </div>
                  <span className="text-xs font-black text-slate-800 italic uppercase">
                    {action.ACT_Responsable?.U_FirstName} {action.ACT_Responsable?.U_LastName}
                  </span>
                </div>
              </td>
              <td className="px-8 py-6">
                {action.ACT_Reclamation ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-md">
                    <LinkIcon size={12} className="opacity-70" />
                    <span className="text-[9px] font-black uppercase italic tracking-tighter">
                      {action.ACT_Reclamation.REC_Reference}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">{action.ACT_Origin}</span>
                )}
              </td>
              <td className="px-8 py-6">{getStatusBadge(action.ACT_Status)}</td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-2 font-black text-slate-500 italic text-xs">
                  <Clock size={14} className="text-slate-300" />
                  {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString() : 'INDÉFINIE'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {actions.length === 0 && (
        <div className="p-32 text-center flex flex-col items-center">
          <AlertCircle size={48} className="text-slate-100 mb-4" />
          <p className="text-slate-400 font-black uppercase italic text-xs tracking-[0.3em]">Aucune action trouvée</p>
        </div>
      )}
    </div>
  );
}