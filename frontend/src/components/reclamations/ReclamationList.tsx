/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 📋 MODULE : ReclamationList
 * -------------------------------------------------------------------------
 * RÔLE : Registre visuel des réclamations du SDE.
 * FONCTION : Affichage tabulaire des dossiers avec codes couleurs de statut 
 * pour un pilotage rapide par le Responsable SMI.
 */

import React from 'react';

interface ReclamationListProps {
  reclamations: any[];
  T_Id: string;
  onRefresh: () => Promise<void>;
}

export default function ReclamationList({
  reclamations,
  T_Id,
  onRefresh,
}: ReclamationListProps) {
  
  // Moteur de rendu des badges de statut
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "NOUVELLE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "EN_ANALYSE":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "ACTION_EN_COURS":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "TRAITEE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "REJETEE":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="mt-8 overflow-hidden bg-white shadow-2xl rounded-[2.5rem] border border-slate-100">
      <table className="min-w-full divide-y divide-slate-100 text-left">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 italic tracking-widest">Référence</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 italic tracking-widest">Objet du dossier</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 italic tracking-widest">Client / Tiers</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 italic tracking-widest text-center">Statut Workflow</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 italic tracking-widest text-right">Réception</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {reclamations && reclamations.length > 0 ? (
            reclamations.map((rec) => (
              <tr key={rec.REC_Id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-black text-blue-600 tracking-tighter italic">
                  {rec.REC_Reference}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-700">
                  {rec.REC_Object}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                  {rec.REC_Tier?.TR_Name || "Non spécifié"}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex rounded-xl px-3 py-1 text-[9px] font-black uppercase border italic ${getStatusStyle(rec.REC_Status)}`}>
                    {rec.REC_Status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400 font-mono text-right font-bold">
                  {rec.REC_DateReceipt ? new Date(rec.REC_DateReceipt).toLocaleDateString() : "--/--/----"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic text-sm font-medium">
                Aucune donnée scellée détectée dans ce registre.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}