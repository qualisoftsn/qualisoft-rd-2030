/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : DocumentWorkflowPanel.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Interface d'approbation pour le workflow documentaire (ISO 9001).
 * RÉVISION : 04 Mars 2026 | 09:30 GMT
 */

'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/core/api/api-client';

interface WorkflowProps {
  documentId: string;
  versionId: string;
  currentStatus: string;
  onUpdate?: () => void;
}

export default function DocumentWorkflowPanel({ documentId, versionId, currentStatus, onUpdate }: WorkflowProps) {
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * ⚖️ PROTOCOLE DE DÉCISION
   */
  const handleDecision = async (approved: boolean) => {
    if (!approved && !comment.trim()) {
      toast.error("MOTIF REQUIS : Un commentaire est obligatoire en cas de rejet.");
      return;
    }

    setIsProcessing(true);
    const tid = toast.loading(approved ? "Approbation du document..." : "Enregistrement du rejet...");

    try {
      await apiClient.post(`/documents/${documentId}/versions/${versionId}/approve`, {
        approved,
        comment: comment.trim()
      });

      toast.success(approved ? "DOCUMENT APPROUVÉ : Publication effective." : "DOCUMENT REJETÉ : Retour à l'expéditeur.", { id: tid });
      setComment('');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error("ÉCHEC DU WORKFLOW : Le Kernel a refusé la transaction.", { id: tid });
    } finally {
      setIsProcessing(false);
    }
  };

  if (currentStatus === 'APPROUVE' || currentStatus === 'OBSOLETE') {
    return (
      <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-4xl flex items-center gap-4 italic">
        <ShieldCheck className="text-emerald-600" size={24} />
        <p className="text-xs font-black text-emerald-900 uppercase tracking-widest">
          Cycle de vie : Ce document est actuellement {currentStatus}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl italic font-sans">
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl">
            <ShieldCheck size={18} />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">
            Décision d&apos;Approbation <span className="text-indigo-600">v.Master</span>
          </h3>
        </div>

        <div className="relative">
          <MessageSquare className="absolute left-4 top-4 text-slate-400" size={16} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Observations, motifs de rejet ou instructions de révision..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all min-h-30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleDecision(false)}
            disabled={isProcessing}
            className="flex items-center justify-center gap-3 py-4 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50 border-none cursor-pointer"
          >
            <XCircle size={16} />
            Rejeter la version
          </button>

          <button
            onClick={() => handleDecision(true)}
            disabled={isProcessing}
            className="flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 border-none cursor-pointer"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
            Approuver & Publier
          </button>
        </div>
      </div>

      <div className="bg-slate-50 px-8 py-4 border-t border-slate-200">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] m-0">
          Validation conforme ISO 9001:2015 — Signature Électronique Matrix
        </p>
      </div>
    </div>
  );
}