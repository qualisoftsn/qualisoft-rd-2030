/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * ⏱️ MODULE : WORKFLOW TIMELINE (TRAÇABILITÉ VISUELLE)
 * -------------------------------------------------------------------------
 * FONCTION : Représentation graphique de la chaîne d'approbation (§7.5.2).
 * RÔLE : Identifier les retards de validation (SLA interne de 48h).
 * ISOLATION : Affichage conditionné par les données du Tenant scellé.
 */

import { useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  ChevronRight, 
  Calendar,
  XCircle,
  GitMerge
} from 'lucide-react';

interface WorkflowTimelineProps {
  steps: any[];
}

export default function WorkflowTimeline({ steps }: WorkflowTimelineProps) {
  // 🚨 LOGIQUE DE DÉTECTION DES RETARDS (SLA Qualité = 48h)
  const checkIsLate = (createdAt: string, status: string) => {
    if (status !== 'EN_ATTENTE') return false;
    const hours = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return hours > 48; 
  };

  const sortedSteps = useMemo(() => {
    return [...(steps || [])].sort((a, b) => a.AW_Step - b.AW_Step);
  }, [steps]);

  // ÉTAT VIDE SÉCURISÉ
  if (!sortedSteps || sortedSteps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-white/5 rounded-[3.5rem] bg-[#0F172A]/50 italic font-sans">
        <GitMerge className="text-slate-700 mb-6" size={48} />
        <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] text-center leading-relaxed">
          Aucun circuit de validation matriciel <br /> actif pour cette entité
        </p>
      </div>
    );
  }

  return (
    <div className="w-full py-20 overflow-x-auto custom-scrollbar italic font-sans bg-[#0B0F1A]/30 rounded-[3rem] border border-white/5">
      <div className="relative flex justify-between items-start min-w-200 max-w-7xl mx-auto px-12">
        
        {/* 🔗 LIGNE DE CONNEXION DYNAMIQUE (BACKBONE SCELLÉ) */}
        <div className="absolute top-[2.2rem] left-20 right-20 h-1 bg-linear-to-r from-blue-600/30 via-slate-800 to-slate-900 z-0 rounded-full" />
        
        {sortedSteps.map((step, idx) => {
          const isLate = checkIsLate(step.AW_CreatedAt, step.AW_Status);
          const isDone = step.AW_Status === 'APPROUVE';
          const isCurrent = step.AW_Status === 'EN_ATTENTE' && !isLate;
          const isRejected = step.AW_Status === 'REJETE';

          return (
            <div key={step.AW_Id || `step-${idx}`} className="relative z-10 flex flex-col items-center group flex-1">
              
              {/* 🟢 CERCLE D'ÉTAT (NODE D'APPROBATION) */}
              <div className={`
                w-20 h-20 rounded-4xl flex items-center justify-center border-4 transition-all duration-700 relative
                ${isDone ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_35px_rgba(16,185,129,0.4)]' : 
                  isRejected ? 'bg-red-600 border-red-500 text-white shadow-[0_0_35px_rgba(220,38,38,0.4)]' :
                  isLate ? 'bg-red-600 border-red-500 text-white animate-bounce shadow-[0_0_40px_rgba(220,38,38,0.6)]' :
                  isCurrent ? 'bg-blue-600 border-blue-400 text-white animate-pulse shadow-[0_0_30px_rgba(37,99,235,0.4)]' :
                  'bg-[#0F172A] border-white/10 text-slate-600'}
              `}>
                {isDone ? <CheckCircle2 size={32} /> : 
                 isRejected ? <XCircle size={32} /> : 
                 isLate ? <AlertCircle size={32} /> : 
                 <Clock size={32} />}
                 
                 {/* Badge Numérotation */}
                 <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-950 border-2 border-slate-800 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                    {step.AW_Step}
                 </div>
              </div>

              {/* 📝 CONTENU INFORMATIF SCELLÉ */}
              <div className="mt-8 text-center space-y-4 w-48">
                <div className="flex flex-col items-center">
                  <h4 className={`text-xs font-black uppercase tracking-widest transition-colors duration-300 ${isLate ? 'text-red-500' : 'text-slate-200'}`}>
                    {step.AW_Comment || 'SANS LIBELLÉ'}
                  </h4>
                </div>

                {/* DÉTAILS APPROBATEUR */}
                <div className="flex flex-col items-center bg-white/5 rounded-2xl p-4 border border-white/5 group-hover:border-blue-500/40 transition-all shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">
                      {step.AW_Approver?.U_FirstName} {step.AW_Approver?.U_LastName}
                    </span>
                  </div>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] bg-black/40 px-2 py-1 rounded-md">
                    {step.AW_Approver?.U_Role || 'RÔLE NON DÉFINI'}
                  </span>
                </div>

                {/* HORODATAGE DE CERTIFICATION */}
                {isDone && step.AW_ApprovedAt && (
                  <div className="flex items-center justify-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                    <Calendar size={12} />
                    {new Date(step.AW_ApprovedAt).toLocaleDateString('fr-FR')}
                  </div>
                )}
                
                {isLate && (
                  <div className="flex items-center justify-center gap-2 text-[9px] font-black text-red-500 uppercase tracking-widest animate-pulse bg-red-500/10 py-1.5 px-3 rounded-lg border border-red-500/20">
                    <AlertCircle size={12} /> Retard SLA
                  </div>
                )}
              </div>

              {/* ➡️ FLÈCHE DE DIRECTION */}
              {idx < sortedSteps.length - 1 && (
                <div className="absolute top-8 -right-8 hidden xl:block opacity-30 text-slate-500">
                  <ChevronRight size={24} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}