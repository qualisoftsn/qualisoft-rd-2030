/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ⏱️ MODULE : WorkflowTimeline.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Monitoring visuel de la chaîne d'approbation (§7.5.2).
 * RÉVISION : 03 Mars 2026 | 00:15 GMT
 */

"use client";

import React, { useMemo } from 'react';
import { CheckCircle2, Clock, AlertCircle, User, ChevronRight, Calendar, XCircle, GitMerge } from 'lucide-react';

export default function WorkflowTimeline({ steps }: { steps: any[] }) {
  const checkIsLate = (createdAt: string, status: string) => {
    if (status !== 'EN_ATTENTE') return false;
    const hours = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return hours > 48; // SLA Qualité RD-2026
  };

  const sortedSteps = useMemo(() => [...(steps || [])].sort((a, b) => a.AW_Step - b.AW_Step), [steps]);

  if (!sortedSteps.length) {
    return (
      <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-[4rem] bg-black/20 italic font-sans text-center">
        <GitMerge className="text-slate-800 mb-6 animate-pulse" size={64} />
        <p className="text-[11px] font-black uppercase text-slate-600 tracking-[0.5em] leading-relaxed">Aucun circuit de validation scellé détecté</p>
      </div>
    );
  }

  return (
    <div className="w-full py-16 overflow-x-auto custom-scrollbar italic font-sans bg-[#0B0F1A]/40 rounded-[4rem] border border-white/5">
      <div className="relative flex justify-between items-start min-w-250 max-w-7xl mx-auto px-20">
        <div className="absolute top-[2.4rem] left-28 right-28 h-1.5 bg-linear-to-r from-blue-600/40 via-slate-800 to-slate-900 z-0 rounded-full" />
        
        {sortedSteps.map((step, idx) => {
          const isLate = checkIsLate(step.AW_CreatedAt, step.AW_Status);
          const isDone = step.AW_Status === 'APPROUVE';
          const isCurrent = step.AW_Status === 'EN_ATTENTE' && !isLate;
          const isRejected = step.AW_Status === 'REJETE';

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center flex-1 group">
              <div className={`w-20 h-20 rounded-4xl flex items-center justify-center border-4 transition-all duration-1000 relative shadow-2xl
                ${isDone ? 'bg-emerald-500 border-emerald-400 text-white' : 
                  isRejected ? 'bg-red-600 border-red-500 text-white' :
                  isLate ? 'bg-red-600 border-red-500 text-white animate-bounce' :
                  isCurrent ? 'bg-blue-600 border-blue-400 text-white animate-pulse' :
                  'bg-slate-900 border-white/10 text-slate-600'}`}>
                {isDone ? <CheckCircle2 size={32} /> : isRejected ? <XCircle size={32} /> : isLate ? <AlertCircle size={32} /> : <Clock size={32} />}
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-black border-2 border-slate-700 rounded-2xl flex items-center justify-center text-[11px] font-black text-white">{step.AW_Step}</div>
              </div>

              <div className="mt-10 text-center space-y-4 w-48">
                <h4 className={`text-[11px] font-black uppercase tracking-widest ${isLate ? 'text-red-500' : 'text-slate-100'}`}>{step.AW_Comment || 'JALON VALIDATION'}</h4>
                <div className="bg-white/5 rounded-3xl p-5 border border-white/5 group-hover:border-blue-500/30 transition-all">
                  <p className="text-[10px] font-black text-slate-200 uppercase m-0 leading-none">{step.AW_Approver?.U_FirstName} {step.AW_Approver?.U_LastName}</p>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-3 m-0 italic">{step.AW_Approver?.U_Role}</p>
                </div>
                {isDone && (
                  <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    <Calendar size={14} /> {new Date(step.AW_ApprovedAt).toLocaleDateString()}
                  </div>
                )}
                {isLate && (
                  <div className="py-2 px-4 bg-red-600/10 border border-red-600/20 rounded-xl text-[9px] font-black text-red-500 uppercase italic tracking-widest animate-pulse">SLA EXPIREE</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
