/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⚖️ MODULE : DocumentWorkflowPanel (ISO 9001 Document Approval)
 * RÔLE : Interface d'approbation pour le workflow documentaire
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, FormEvent, KeyboardEvent, useRef, useCallback } from 'react';
import { CheckCircle, XCircle, MessageSquare, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export type DocumentStatus = 'BROUILLON' | 'EN_REVISION' | 'EN_APPROBATION' | 'APPROUVE' | 'OBSOLETE' | 'REJETE';

export interface WorkflowProps {
  documentId: string;
  versionId: string;
  currentStatus: DocumentStatus;
  onUpdate?: () => void;
  className?: string;
}

export interface DecisionPayload {
  approved: boolean;
  comment: string;
  documentId: string;
  versionId: string;
}

export interface FormErrors {
  comment?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; icon: React.ElementType }> = {
  BROUILLON: { label: 'Brouillon', color: 'text-slate-500', icon: MessageSquare },
  EN_REVISION: { label: 'En Révision', color: 'text-amber-500', icon: Loader2 },
  EN_APPROBATION: { label: 'En Approbation', color: 'text-blue-500', icon: ShieldCheck },
  APPROUVE: { label: 'Approuvé', color: 'text-emerald-500', icon: CheckCircle },
  OBSOLETE: { label: 'Obsolète', color: 'text-slate-400', icon: XCircle },
  REJETE: { label: 'Rejeté', color: 'text-red-500', icon: XCircle },
};

// ============================================================================
// SOUS-COMPOSANT : STATUS BADGE
// ============================================================================

interface StatusBadgeProps {
  status: DocumentStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border",
        status === 'APPROUVE' 
          ? "bg-emerald-50 border-emerald-100" 
          : status === 'OBSOLETE'
          ? "bg-slate-50 border-slate-100"
          : "bg-indigo-50 border-indigo-100"
      )}
      role="status"
      aria-label={`Statut: ${config.label}`}
    >
      <Icon size={16} className={cn("w-4 h-4 md:w-5 md:h-5", config.color)} aria-hidden="true" />
      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest m-0">
        Cycle de vie : <span className={config.color}>{config.label}</span>
      </p>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function DocumentWorkflowPanel({ 
  documentId, 
  versionId, 
  currentStatus, 
  onUpdate,
  className 
}: WorkflowProps) {
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    
    if (!comment.trim()) {
      errors.comment = "Un commentaire est obligatoire";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [comment]);

  /**
   * ⚖️ PROTOCOLE DE DÉCISION
   */
  const handleDecision = async (approved: boolean) => {
    // Comment required for rejection
    if (!approved && !comment.trim()) {
      setFormErrors({ comment: "Un motif est obligatoire en cas de rejet" });
      toast.error("MOTIF REQUIS : Un commentaire est obligatoire en cas de rejet.");
      textareaRef.current?.focus();
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading(approved ? "Approbation du document..." : "Enregistrement du rejet...");

    try {
      const payload: DecisionPayload = {
        approved,
        comment: comment.trim(),
        documentId,
        versionId
      };

      await apiClient.post(`/documents/${documentId}/versions/${versionId}/approve`, payload);

      toast.success(
        approved 
          ? "DOCUMENT APPROUVÉ : Publication effective." 
          : "DOCUMENT REJETÉ : Retour à l'expéditeur.", 
        { id: toastId }
      );
      setComment('');
      setFormErrors({});
      onUpdate?.();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(
        apiError?.response?.data?.message || apiError?.message || "ÉCHEC DU WORKFLOW : Le Kernel a refusé la transaction.", 
        { id: toastId }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setComment('');
      setFormErrors({});
    }
  };

  // Statuses that don't allow actions
  const isReadOnly = currentStatus === 'APPROUVE' || currentStatus === 'OBSOLETE';

  if (isReadOnly) {
    return (
      <article 
        className={cn("p-4 md:p-6 italic font-sans", className)}
        role="status"
        aria-label={`Statut du document: ${currentStatus}`}
      >
        <StatusBadge status={currentStatus} />
      </article>
    );
  }

  return (
    <article 
      className={cn(
        "bg-white border border-slate-200 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl italic font-sans focus-within:ring-2 focus-within:ring-indigo-400",
        className
      )}
      role="form"
      aria-labelledby="workflow-title"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 md:p-2.5 bg-indigo-600 text-white rounded-lg md:rounded-xl">
            <ShieldCheck size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          </div>
          <h3 id="workflow-title" className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tighter m-0">
            Décision d&apos;Approbation <span className="text-indigo-600">v.Master</span>
          </h3>
        </div>

        <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby="comment-label">
          <label 
            id="comment-label"
            htmlFor="workflow-comment"
            className={cn(
              "text-[9px] md:text-[10px] font-black uppercase text-slate-500 block ml-2 md:ml-4 tracking-widest",
              formErrors.comment && "text-red-400"
            )}
          >
            Commentaire {formErrors.comment && <span className="text-red-400">*</span>}
          </label>
          <div className="relative">
            <MessageSquare 
              className={cn(
                "absolute left-3 md:left-4 top-3 md:top-4 w-4 h-4 transition-colors",
                formErrors.comment ? "text-red-400" : "text-slate-400"
              )} 
              size={16} 
              aria-hidden="true" 
            />
            <textarea
              id="workflow-comment"
              ref={textareaRef}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (formErrors.comment) {
                  setFormErrors({ comment: undefined });
                }
              }}
              placeholder="Observations, motifs de rejet ou instructions de révision..."
              className={cn(
                "w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 text-[10px] md:text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all min-h-[100px] md:min-h-[120px] resize-none",
                formErrors.comment && "border-red-500/50 focus:border-red-500"
              )}
              aria-required="true"
              aria-invalid={!!formErrors.comment}
              aria-describedby={formErrors.comment ? 'comment-error' : undefined}
            />
          </div>
          {formErrors.comment && (
            <p id="comment-error" className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
              <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.comment}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => handleDecision(false)}
            disabled={isProcessing}
            className={cn(
              "flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 bg-white border-2 border-red-100 text-red-500 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400",
              isProcessing && "cursor-not-allowed"
            )}
            aria-label="Rejeter la version du document"
            aria-busy={isProcessing}
          >
            <XCircle size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Rejeter la version</span>
            <span className="sm:hidden">Rejeter</span>
          </button>

          <button
            type="button"
            onClick={() => handleDecision(true)}
            disabled={isProcessing}
            className={cn(
              "flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400",
              isProcessing && "cursor-not-allowed"
            )}
            aria-label="Approuver et publier le document"
            aria-busy={isProcessing}
          >
            {isProcessing ? (
              <><Loader2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">Traitement...</span><span className="sm:hidden">En cours...</span></>
            ) : (
              <><CheckCircle size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> <span className="hidden sm:inline">Approuver & Publier</span><span className="sm:hidden">Approuver</span></>
            )}
          </button>
        </div>
      </div>

      <footer className="bg-slate-50 px-4 md:px-6 lg:px-8 py-3 md:py-4 border-t border-slate-200">
        <p className="text-[6px] md:text-[7px] lg:text-[8px] font-black text-slate-400 uppercase tracking-widest m-0 text-center">
          Validation conforme ISO 9001:2015 — Signature Électronique Matrix
        </p>
      </footer>
    </article>
  );
}