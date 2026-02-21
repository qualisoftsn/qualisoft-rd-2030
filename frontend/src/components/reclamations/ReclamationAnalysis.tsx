/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🔍 MODULE : ReclamationAnalysis
 * -------------------------------------------------------------------------
 * RÔLE : Interface d'expertise et de résolution des réclamations.
 * FONCTION : Permet l'analyse des causes, le feedback client et le déclenchement 
 * automatisé du Plan d'Action Correctif (CAPA).
 */

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client';
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
   * 🔄 handleStatusChange
   * Met à jour le cycle de vie de la réclamation.
   * L'isolation est garantie car l'API n'autorise la modif que sur le Tenant de l'utilisateur.
   */
  const handleStatusChange = async (targetStatus: RecStatus) => {
    setIsUpdating(true);
    try {
      await apiClient.patch(`/reclamations/${reclamation.REC_Id}/status`, {
        status: targetStatus,
        solution: solution,
        feedback: feedback
      });
      
      onRefresh();
    } catch (error) {
      console.error("Qualisoft Error : Mise à jour workflow échouée.");
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * ⚡ handleLaunchActions
   * Transformation transactionnelle : Crée une action dans le PAQ (Plan d'Action Qualité)
   * et lie l'ID de l'action à cette réclamation spécifique.
   */
  const handleLaunchActions = async () => {
    if (!solution) {
      alert("Analyse requise avant lancement du plan d'action.");
      return;
    }
    
    setIsUpdating(true);
    try {
      // Déclenche la création d'une action corrective au niveau du noyau
      await apiClient.post(`/actions/from-reclamation/${reclamation.REC_Id}`);
      onRefresh();
    } catch (error) {
      console.error("Qualisoft Error : Échec de génération CAPA.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-xl space-y-6 relative overflow-hidden text-left">
      {/* HEADER DE L'ANALYSE */}
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
        {/* CHAMP SOLUTION / CAUSES */}
        <div className="text-left">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 italic">
            Analyse des causes & Solutions (5 Pourquoi / Ishikawa)
          </label>
          <textarea
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-slate-700 italic"
            rows={4}
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Détaillez ici l'analyse technique..."
          />
        </div>

        {/* FEEDBACK CLIENT */}
        <div className="text-left">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 italic">
            Validation / Feedback Client
          </label>
          <input
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 italic"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Retour après traitement..."
          />
        </div>

        {/* WORKFLOW ACTIONS */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-50">
          {reclamation.REC_Status === 'NOUVELLE' && (
            <button
              onClick={() => handleStatusChange('EN_ANALYSE')}
              disabled={isUpdating}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase italic transition shadow-lg shadow-amber-500/20"
            >
              <RotateCcw size={14} /> Démarrer l&apos;Analyse
            </button>
          )}

          {(reclamation.REC_Status === 'NOUVELLE' || reclamation.REC_Status === 'EN_ANALYSE') && (
            <button
              onClick={handleLaunchActions}
              disabled={isUpdating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase italic transition shadow-lg shadow-blue-500/20"
            >
              {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <PlayCircle size={14} />}
              Lancer des Actions Correctives
            </button>
          )}

          <button
            onClick={() => handleStatusChange('TRAITEE')}
            disabled={isUpdating}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase italic transition shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 size={14} /> Clôturer l&apos;Ecart
          </button>
          
          <button
            onClick={() => handleStatusChange('REJETEE')}
            disabled={isUpdating}
            className="flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase italic transition shadow-lg shadow-slate-900/20"
          >
            <XCircle size={14} /> Rejeter
          </button>
        </div>
      </div>
    </div>
  );
}