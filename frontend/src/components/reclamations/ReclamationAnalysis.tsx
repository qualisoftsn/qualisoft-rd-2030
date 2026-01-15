/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client'; // Importation du client sécurisé
import { PlayCircle, CheckCircle2, XCircle, RotateCcw, Loader2 } from 'lucide-react';

type RecStatus = 'NOUVELLE' | 'EN_ANALYSE' | 'ACTION_EN_COURS' | 'TRAITEE' | 'REJETEE';

interface ReclamationAnalysisProps {
  reclamation: any;
  onRefresh: () => void;
}

export default function ReclamationAnalysis({ reclamation, onRefresh }: ReclamationAnalysisProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [solution, setSolution] = useState(reclamation.REC_SolutionProposed || '');
  const [feedback, setFeedback] = useState(reclamation.REC_ClientFeedback || '');

  /**
   * 1. Mise à jour simple du statut (Analyse, Clôture, Rejet)
   */
  const handleStatusChange = async (targetStatus: RecStatus) => {
    setIsUpdating(true);
    try {
      // En SaaS/JWT, le TenantId est extrait du token par le backend
      await apiClient.patch(`/reclamations/${reclamation.REC_Id}/status`, {
        status: targetStatus,
        solution: solution,
        feedback: feedback
      });
      
      alert(`Qualisoft : Workflow mis à jour (${targetStatus})`);
      onRefresh();
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * 2. Lancement du Plan d'Action Correctif (CAPA)
   * Appelle l'endpoint transactionnel qui crée l'Action et change le statut
   */
  const handleLaunchActions = async () => {
    if (!solution) {
      alert("Veuillez saisir une analyse ou une solution avant de lancer des actions.");
      return;
    }
    
    setIsUpdating(true);
    try {
      // Appel vers ActionsController : POST /api/actions/from-reclamation/:id
      await apiClient.post(`/actions/from-reclamation/${reclamation.REC_Id}`);
      
      alert("Qualisoft : Action corrective générée dans le PAQ et liée à cette réclamation.");
      onRefresh();
    /// eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Erreur lors de la génération de l'action corrective.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">
            Analyse : {reclamation.REC_Reference}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Expertise Qualité ISO 9001</p>
        </div>
        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase italic ${
          reclamation.REC_Status === 'ACTION_EN_COURS' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {reclamation.REC_Status}
        </span>
      </div>

      <div className="space-y-5">
        {/* Analyse et Solution */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
            Analyse & Solution proposée (REC_SolutionProposed)
          </label>
          <textarea
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-slate-700"
            rows={4}
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Décrivez l'analyse des causes (5 Pourquoi, Ishikawa...)"
          />
        </div>

        {/* Retour Client */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
            Retour d&apos;information client (REC_ClientFeedback)
          </label>
          <input
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback client après traitement..."
          />
        </div>

        {/* Actions de Workflow */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-50">
          
          {/* Étape 1 : Démarrer l'Analyse */}
          {reclamation.REC_Status === 'NOUVELLE' && (
            <button
              onClick={() => handleStatusChange('EN_ANALYSE')}
              disabled={isUpdating}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase italic transition shadow-lg shadow-amber-500/20"
            >
              <RotateCcw size={14} />
              Démarrer l&apos;Analyse
            </button>
          )}

          {/* Étape 2 : Lancer des Actions (Transactionnel) */}
          {(reclamation.REC_Status === 'NOUVELLE' || reclamation.REC_Status === 'EN_ANALYSE') && (
            <button
              onClick={handleLaunchActions}
              disabled={isUpdating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase italic transition shadow-lg shadow-blue-500/20"
            >
              {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
              Lancer des Actions
            </button>
          )}

          {/* Étape 3 : Clôture */}
          <button
            onClick={() => handleStatusChange('TRAITEE')}
            disabled={isUpdating}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase italic transition shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 size={14} />
            Clôturer
          </button>
          
          {/* Rejet */}
          <button
            onClick={() => handleStatusChange('REJETEE')}
            disabled={isUpdating}
            className="flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase italic transition shadow-lg shadow-slate-900/20"
          >
            <XCircle size={14} />
            Rejeter
          </button>
        </div>
      </div>
    </div>
  );
}