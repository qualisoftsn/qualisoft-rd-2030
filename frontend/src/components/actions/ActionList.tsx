/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📋 COMPOSANT : ActionList
 * -------------------------------------------------------------------------
 * RÔLE : Affichage tabulaire des actions correctives et préventives.
 * PHILOSOPHIE : Traçabilité totale des pilotes et des échéances.
 * ISOLATION : Affiche uniquement les données injectées par le contrôleur de tenant.
 */

"use client";

import React from 'react';
import { Clock, Link as LinkIcon, AlertCircle, User, ShieldCheck } from 'lucide-react';

// --- INTERFACES DU NOYAU ---
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
  /**
   * 🎨 GÉNÉRATEUR DE BADGE DE STATUT
   * Aligné sur la charte visuelle Qualisoft Sovereign.
   */
  const getStatusBadge = (status: string) => {
    const styles = {
      TERMINEE: "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
      EN_COURS: "bg-blue-50 text-blue-700 border-blue-100 shadow-[0_0_10px_rgba(37,99,235,0.1)]",
      A_FAIRE: "bg-amber-50 text-amber-700 border-amber-100",
    };
    
    return (
      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic border transition-all ${styles[status as keyof typeof styles] || 'bg-slate-100'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in duration-700 text-left">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Libellé de l&apos;Action Corrective</th>
            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Pilote Responsable</th>
            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Source / Origine</th>
            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Statut Flux</th>
            <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Échéance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white">
          {actions.map((action) => (
            <tr key={action.ACT_Id} className="hover:bg-blue-50/20 transition-all duration-300 group cursor-default">
              {/* CELLULE : TITRE & DESCRIPTION */}
              <td className="px-8 py-7">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900 uppercase italic tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
                    {action.ACT_Title}
                  </span>
                  <p className="text-[11px] text-slate-500 font-bold mt-2 italic uppercase opacity-60 truncate max-w-xs leading-none">
                    {action.ACT_Description || "Aucun détail complémentaire scellé"}
                  </p>
                </div>
              </td>

              {/* CELLULE : PILOTE (MULTI-TENANT USER) */}
              <td className="px-8 py-7">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-[11px] font-black text-white italic border border-white/10 shadow-lg group-hover:bg-blue-600 transition-colors">
                    {action.ACT_Responsable?.U_FirstName?.[0]}{action.ACT_Responsable?.U_LastName?.[0]}
                  </div>
                  <span className="text-xs font-black text-slate-800 italic uppercase tracking-tight">
                    {action.ACT_Responsable?.U_FirstName} {action.ACT_Responsable?.U_LastName}
                  </span>
                </div>
              </td>

              {/* CELLULE : TRAÇABILITÉ ORIGINE */}
              <td className="px-8 py-7">
                {action.ACT_Reclamation ? (
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg shadow-lg">
                    <LinkIcon size={12} className="opacity-70" />
                    <span className="text-[9px] font-black uppercase italic tracking-tighter leading-none">
                      {action.ACT_Reclamation.REC_Reference}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-slate-300" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{action.ACT_Origin}</span>
                  </div>
                )}
              </td>

              {/* CELLULE : ÉTAT D'AVANCEMENT */}
              <td className="px-8 py-7">{getStatusBadge(action.ACT_Status)}</td>

              {/* CELLULE : TEMPS RESTANT */}
              <td className="px-8 py-7">
                <div className="flex items-center gap-3 font-black text-slate-500 italic text-xs">
                  <Clock size={15} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString('fr-FR') : 'INDÉFINIE'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ÉTAT VIDE SÉCURISÉ */}
      {actions.length === 0 && (
        <div className="p-40 text-center flex flex-col items-center animate-in zoom-in duration-500">
          <AlertCircle size={64} className="text-slate-100 mb-6" />
          <p className="text-slate-400 font-black uppercase italic text-xs tracking-[0.5em]">Aucune action corrective détectée dans le périmètre</p>
        </div>
      )}
    </div>
  );
}