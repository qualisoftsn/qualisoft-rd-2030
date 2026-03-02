/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📋 MODULE : ReclamationList.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Registre tabulaire des dossiers Qualité.
 * RÉVISION : 02 Mars 2026 | 18:55 GMT
 */

"use client";

import { ShieldAlert } from 'lucide-react';

export default function ReclamationList({ reclamations }: { reclamations: any[] }) {
  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      NOUVELLE: "bg-blue-100 text-blue-800 border-blue-200",
      EN_ANALYSE: "bg-amber-100 text-amber-800 border-amber-200",
      ACTION_EN_COURS: "bg-purple-100 text-purple-800 border-purple-200",
      TRAITEE: "bg-emerald-100 text-emerald-800 border-emerald-200",
      REJETEE: "bg-red-100 text-red-800 border-red-200"
    };
    return styles[status] || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="mt-12 overflow-hidden bg-white shadow-4xl rounded-[3rem] border border-slate-100 italic">
      <table className="min-w-full divide-y divide-slate-100 text-left">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Référence</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Objet</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Tiers</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Statut Workflow</th>
            <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Réception</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {reclamations?.length > 0 ? reclamations.map((rec) => (
            <tr key={rec.REC_Id} className="hover:bg-blue-50/30 transition-all cursor-pointer group">
              <td className="px-8 py-5 text-sm font-black text-blue-600 tracking-tighter">#{rec.REC_Reference}</td>
              <td className="px-8 py-5 text-sm font-bold text-slate-800 uppercase tracking-tight">{rec.REC_Object}</td>
              <td className="px-8 py-5 text-sm font-black text-slate-500 uppercase">{rec.REC_Tier?.TR_Name || "AGENT_EXT"}</td>
              <td className="px-8 py-5 text-center">
                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border italic ${getStatusStyle(rec.REC_Status)}`}>
                  {rec.REC_Status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-8 py-5 text-[11px] text-slate-400 font-mono text-right font-black">
                {new Date(rec.REC_DateReceipt).toLocaleDateString('fr-FR')}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={5} className="py-24 text-center">
                <ShieldAlert size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Le registre est vierge</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}