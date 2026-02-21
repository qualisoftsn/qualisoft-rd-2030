/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
/**
 * 📋 MODULE : ActionsView
 * -------------------------------------------------------------------------
 * FONCTION : Liste dynamique des actions d'un processus (§10 ISO 9001).
 * RÔLE : Suivi opérationnel des levées d'écarts et des plans d'actions.
 * SÉCURITÉ : Isolation au niveau de l'ID Action (ACT_).
 */

import React from 'react';
import { Clock, CheckCircle, AlertTriangle, Users, ArrowRight } from 'lucide-react';

export default function ActionsView({ actions }: { actions: any[] }) {
  // 🛡️ GESTION DE L'ÉTAT VIDE : Garantit que l'UI reste propre si aucune data n'est injectée
  if (!actions || actions.length === 0) {
    return (
        <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-4xl bg-white/2">
            <div className="flex flex-col items-center gap-3 opacity-20">
                <AlertTriangle size={32} className="text-slate-500" />
                <p className="text-slate-500 italic text-xs font-black uppercase tracking-widest">
                  Aucun plan d&apos;action actif
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {actions.map((action) => (
        <div 
          key={action.ACT_Id || `act-${Math.random()}`} 
          className="bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden"
        >
           {/* En-tête de l'action : Titre et Badge de Statut */}
           <div className="flex justify-between items-start mb-3">
              <h4 className="font-black text-white text-xs uppercase italic truncate pr-4 group-hover:text-blue-400 transition-colors">
                {action.ACT_Title}
              </h4>
              <span className={`shrink-0 px-3 py-1 rounded-full text-[8px] font-black border transition-all ${
                  action.ACT_Status === 'CLOTUREE' 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-blue-600/10 text-blue-400 border-blue-600/20 shadow-[0_0_10px_rgba(37,99,235,0.1)]'
              }`}>
                {action.ACT_Status || 'EN_COURS'}
              </span>
           </div>
           
           {/* Description scellée de l'action */}
           <p className="text-slate-400 text-[10px] mb-4 line-clamp-3 font-medium leading-relaxed italic">
             {action.ACT_Description || "Description technique en attente de rédaction..."}
           </p>

           {/* Métadonnées de Traçabilité (Propriété du Tenant) */}
           <div className="flex items-center gap-6 text-[8px] font-black text-slate-500 uppercase italic border-t border-white/5 pt-4">
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Clock size={12} className="text-slate-600" /> 
                Échéance : <span className="text-slate-300">{action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString('fr-FR') : 'INDÉFINIE'}</span>
              </span>
              <span className="flex items-center gap-1.5 text-blue-500 group-hover:text-blue-300 transition-colors">
                <Users size={12} /> 
                Agent : <span className="underline decoration-blue-500/30">{action.ACT_Responsable?.U_LastName || 'MATRICULE_NON_ASSIGNÉ'}</span>
              </span>
           </div>
           
           {/* Décoration Matrix discrète au survol */}
           <div className="absolute -right-2.5 -bottom-2.5 opacity-0 group-hover:opacity-5 transition-opacity">
              <ArrowRight size={80} className="-rotate-45 text-white" />
           </div>
        </div>
      ))}
    </div>
  );
}