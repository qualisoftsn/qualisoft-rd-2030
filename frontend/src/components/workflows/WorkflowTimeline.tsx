/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  ChevronRight, 
  Calendar,
  ShieldCheck,
  XCircle
} from 'lucide-react';

interface WorkflowTimelineProps {
  steps: any[];
}

export default function WorkflowTimeline({ steps }: WorkflowTimelineProps) {
  // --- LOGIQUE DE DÉTECTION DES RETARDS (§9.1 ISO 9001) ---
  const checkIsLate = (createdAt: string, status: string) => {
    if (status !== 'EN_ATTENTE') return false;
    const hours = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return hours > 48; // Seuil de 48h pour Qualisoft Elite
  };

  const sortedSteps = useMemo(() => {
    return [...steps].sort((a, b) => a.AW_Step - b.AW_Step);
  }, [steps]);

  if (!sortedSteps || sortedSteps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-[3rem] bg-white/2">
        <ShieldCheck className="text-slate-800 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] italic text-center">
          Aucun circuit de validation actif <br /> pour cette entité
        </p>
      </div>
    );
  }

  return (
    <div className="w-full py-16 overflow-x-auto scrollbar-hide">
      <div className="relative flex justify-between items-start min-w-200 max-w-7xl mx-auto px-10">
        
        {/* LIGNE DE CONNEXION DYNAMIQUE (BACKBONE) */}
        <div className="absolute top-7.75 left-15 right-15 h-0.75 bg-linear-to-r from-blue-600/20 via-slate-800 to-slate-800 z-0" />
        
        {sortedSteps.map((step, idx) => {
          const isLate = checkIsLate(step.AW_CreatedAt, step.AW_Status);
          const isDone = step.AW_Status === 'APPROUVE';
          const isCurrent = step.AW_Status === 'EN_ATTENTE' && !isLate;
          const isRejected = step.AW_Status === 'REJETE';

          return (
            <div key={step.AW_Id || idx} className="relative z-10 flex flex-col items-center group flex-1">
              
              {/* CERCLE D'ÉTAT (NODE) */}
              <div className={`
                w-16 h-16 rounded-4xl flex items-center justify-center border-2 transition-all duration-700 
                ${isDone ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.3)]' : 
                  isRejected ? 'bg-red-600 border-red-500 text-white shadow-[0_0_25px_rgba(220,38,38,0.3)]' :
                  isLate ? 'bg-red-600 border-red-500 text-white animate-bounce shadow-[0_0_30px_rgba(220,38,38,0.6)]' :
                  isCurrent ? 'bg-blue-600 border-blue-400 text-white animate-pulse' :
                  'bg-[#0F172A] border-white/10 text-slate-600'}
              `}>
                {isDone ? <CheckCircle2 size={28} /> : 
                 isRejected ? <XCircle size={28} /> : 
                 isLate ? <AlertCircle size={28} /> : 
                 <Clock size={28} />}
              </div>

              {/* CONTENU INFORMATIF */}
              <div className="mt-6 text-center space-y-2">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-1">
                    Étape {step.AW_Step}
                  </span>
                  <h4 className={`text-[11px] font-black uppercase italic tracking-tight transition-colors duration-300 ${isLate ? 'text-red-500' : 'text-slate-100'}`}>
                    {step.AW_Comment || 'Sans libellé'}
                  </h4>
                </div>

                {/* DÉTAILS APPROBATEUR (§5.3 ISO 9001) */}
                <div className="flex flex-col items-center bg-white/5 rounded-xl p-3 border border-white/5 group-hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={10} className="text-blue-500" />
                    <span className="text-[9px] font-bold text-slate-300 uppercase">
                      {step.AW_Approver?.U_FirstName} {step.AW_Approver?.U_LastName}
                    </span>
                  </div>
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">
                    {step.AW_Approver?.U_Role || 'Rôle non défini'}
                  </span>
                </div>

                {/* HORODATAGE (TRAÇABILITÉ §7.5.3) */}
                {isDone && step.AW_ApprovedAt && (
                  <div className="flex items-center justify-center gap-1.5 text-[8px] font-black text-emerald-500/70 uppercase italic">
                    <Calendar size={10} />
                    {new Date(step.AW_ApprovedAt).toLocaleDateString()}
                  </div>
                )}
                
                {isLate && (
                  <div className="flex items-center justify-center gap-1.5 text-[8px] font-black text-red-500 uppercase animate-pulse italic">
                    <AlertCircle size={10} />
                    Retard Critique
                  </div>
                )}
              </div>

              {/* TOOLTIP TECHNIQUE AU SURVOL */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                <div className="bg-[#0F172A] border border-blue-600/30 px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap">
                  <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic mb-1">Détails de l&apos;instance</p>
                  <p className="text-[9px] font-bold text-white uppercase italic">
                    Initiée le : {new Date(step.AW_CreatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-2 h-2 bg-[#0F172A] border-r border-b border-blue-600/30 rotate-45 mx-auto -mt-1" />
              </div>

              {/* FLÈCHE DE DIRECTION (Sauf dernier item) */}
              {idx < sortedSteps.length - 1 && (
                <div className="absolute top-9.5 -right-4 hidden xl:block opacity-20">
                  <ChevronRight size={16} className="text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}