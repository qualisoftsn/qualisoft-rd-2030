/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🔍 MODULE : ReclamationAnalysis.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Résolution d'écarts et déclenchement CAPA (Plan d'Actions).
 * RÉVISION : 02 Mars 2026 | 18:55 GMT
 */

"use client";

import { useState } from 'react';
import apiClient from '@/core/api/api-client';
import { PlayCircle, CheckCircle2, XCircle, RotateCcw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function ReclamationAnalysis({ reclamation, onRefresh }: { reclamation: any, onRefresh: () => void }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [solution, setSolution] = useState(reclamation.REC_SolutionProposed || '');

  const updateWorkflow = async (targetStatus: string) => {
    setIsUpdating(true);
    const tid = toast.loading("Mise à jour du registre...");
    try {
      await apiClient.patch(`/reclamations/${reclamation.REC_Id}/status`, {
        status: targetStatus,
        solution
      });
      toast.success("Registre mis à jour avec succès", { id: tid });
      onRefresh();
    } catch (error) {
      toast.error("Échec de synchronisation Kernel", { id: tid });
    } finally {
      setIsUpdating(false);
    }
  };

  const launchCAPA = async () => {
    if (!solution) return toast.warning("Analyse des causes requise avant CAPA");
    setIsUpdating(true);
    try {
      await apiClient.post(`/actions/from-reclamation/${reclamation.REC_Id}`);
      toast.success("PLAN D'ACTION GÉNÉRÉ (§10.2)");
      onRefresh();
    } catch (error) {
      toast.error("Erreur de génération CAPA");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-4xl space-y-8 relative overflow-hidden italic text-left">
      <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldAlert size={120}/></div>
      
      <header className="flex items-center justify-between border-b border-slate-50 pb-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter m-0">
            Expertise : <span className="text-blue-600">{reclamation.REC_Reference}</span>
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Maîtrise des sorties non conformes</p>
        </div>
        <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase border-2 ${
          reclamation.REC_Status === 'ACTION_EN_COURS' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-500'
        }`}>
          {reclamation.REC_Status.replace(/_/g, ' ')}
        </div>
      </header>

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Analyse des causes (5 Pourquoi / Ishikawa)</label>
          <textarea
            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-blue-600 outline-none transition-all font-bold text-slate-800 italic text-sm shadow-inner"
            rows={5}
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Détaillez ici l'expertise technique..."
          />
        </div>

        <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-50">
          {reclamation.REC_Status === 'NOUVELLE' && (
            <ActionButton onClick={() => updateWorkflow('EN_ANALYSE')} color="bg-amber-500" icon={RotateCcw} label="Initier l'Analyse" disabled={isUpdating} />
          )}
          <ActionButton onClick={launchCAPA} color="bg-blue-600" icon={PlayCircle} label="Générer Action Corrective" disabled={isUpdating || reclamation.REC_Status === 'TRAITEE'} />
          <ActionButton onClick={() => updateWorkflow('TRAITEE')} color="bg-emerald-600" icon={CheckCircle2} label="Clôturer le Dossier" disabled={isUpdating} />
          <ActionButton onClick={() => updateWorkflow('REJETEE')} color="bg-slate-900" icon={XCircle} label="Rejeter" disabled={isUpdating} />
        </div>
      </div>
    </div>
  );
}

function ActionButton({ onClick, color, icon: Icon, label, disabled }: any) {
  return (
    <button onClick={onClick} disabled={disabled} className={`${color} text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl border-none cursor-pointer disabled:opacity-50`}>
      <Icon size={16} /> {label}
    </button>
  );
}