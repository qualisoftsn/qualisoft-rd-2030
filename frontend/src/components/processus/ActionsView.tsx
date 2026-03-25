/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 📋 MODULE : ActionsView.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Suivi des levées d'écarts par processus.
 * RÉVISION : 02 Mars 2026 | 18:50 GMT
 */

"use client";

import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, Users, Shield } from 'lucide-react';

export default function ActionsView({ actions }: { actions: any[] }) {
  if (!actions || actions.length === 0) {
    return (
      <div className="p-20 text-center border-4 border-dashed border-white/5 rounded-[3rem] bg-white/2 italic">
        <Shield size={64} className="text-slate-800 mx-auto mb-6 opacity-20" />
        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] m-0">Registre des actions vierge</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 italic font-sans text-left">
      {actions.map((action) => (
        <div key={action.ACT_Id} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-600/40 hover:bg-blue-600/5 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <h4 className="font-black text-white text-lg uppercase italic tracking-tighter m-0 pr-10 group-hover:text-blue-400 transition-colors">
              {action.ACT_Title}
            </h4>
            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-widest ${
              action.ACT_Status === 'CLOTUREE' 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-blue-600/10 text-blue-400 border-blue-600/20'
            }`}>
              {action.ACT_Status || 'EN_COURS'}
            </span>
          </div>
          
          <p className="text-slate-400 text-xs mb-8 font-medium leading-relaxed italic pr-12 line-clamp-2">
            {action.ACT_Description || "Description scellée en attente..."}
          </p>

          <div className="flex items-center gap-10 text-[9px] font-black text-slate-500 uppercase italic border-t border-white/5 pt-6">
            <div className="flex items-center gap-2 group-hover:text-white transition-colors">
              <Clock size={14} className="text-blue-500" /> 
              <span>Échéance : <span className="text-slate-200">{action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString('fr-FR') : 'INDÉFINIE'}</span></span>
            </div>
            <div className="flex items-center gap-2 text-blue-500">
              <Users size={14} /> 
              <span>Agent : <span className="underline decoration-blue-500/30 text-white">{action.ACT_Responsable?.U_LastName || 'MATRICULE_NC'}</span></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
