/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🔍 MODULE : ReclamationAnalysis (Claim Resolution & CAPA)
 * RÔLE : Résolution d'écarts et déclenchement CAPA (Plan d'Actions)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useCallback, ChangeEvent, KeyboardEvent, useRef } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { PlayCircle, CheckCircle2, XCircle, RotateCcw, ShieldAlert, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type WorkflowStatus = 'NOUVELLE' | 'EN_ANALYSE' | 'ACTION_EN_COURS' | 'TRAITEE' | 'REJETEE';

export interface Reclamation {
  REC_Id: string;
  REC_Reference: string;
  REC_Status: WorkflowStatus;
  REC_SolutionProposed?: string;
  REC_Description?: string;
  REC_CreatedAt?: string;
  REC_UpdatedAt?: string;
  REC_ClientId?: string;
  REC_ClientName?: string;
  REC_Priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ReclamationAnalysisProps {
  reclamation: Reclamation;
  onRefresh: () => void;
  className?: string;
}

export interface ActionButtonProps {
  onClick: () => void;
  color: string;
  colorClass: string;
  icon: React.ElementType;
  label: string;
  disabled: boolean;
  loading?: boolean;
}

export interface FormErrors {
  solution?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const STATUS_CONFIG: Record<WorkflowStatus, { label: string; color: string; bg: string; border: string }> = {
  NOUVELLE: { label: 'NOUVELLE', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
  EN_ANALYSE: { label: 'EN ANALYSE', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  ACTION_EN_COURS: { label: 'ACTION EN COURS', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  TRAITEE: { label: 'TRAITÉE', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  REJETEE: { label: 'REJETÉE', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
};

const MIN_SOLUTION_LENGTH = 20;

// ============================================================================
// SOUS-COMPOSANT : ACTION BUTTON
// ============================================================================

function ActionButton({ onClick, color, colorClass, icon: Icon, label, disabled, loading = false }: ActionButtonProps) {
  const handleClick = () => {
    if (!disabled && !loading) {
      onClick();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button 
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      className={cn(
        "text-white px-4 md:px-5 lg:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[9px] lg:text-[10px] uppercase tracking-widest flex items-center gap-1.5 md:gap-2 lg:gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2",
        color,
        colorClass
      )}
      aria-label={label}
      aria-busy={loading}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" aria-hidden="true" />
      ) : (
        <Icon size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(' ')[0]}</span>
    </button>
  );
}

// ============================================================================
// SOUS-COMPOSANT : STATUS BADGE
// ============================================================================

interface StatusBadgeProps {
  status: WorkflowStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOUVELLE;
  
  return (
    <span 
      className={cn(
        "px-3 md:px-4 lg:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase border-2 whitespace-nowrap",
        config.bg, config.border, config.color
      )}
      role="status"
      aria-label={`Statut: ${config.label}`}
    >
      {config.label}
    </span>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ReclamationAnalysis({ 
  reclamation, 
  onRefresh,
  className 
}: ReclamationAnalysisProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [solution, setSolution] = useState(reclamation.REC_SolutionProposed || '');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validateSolution = useCallback((): boolean => {
    const errors: FormErrors = {};
    
    if (!solution.trim()) {
      errors.solution = "L'analyse des causes est requise";
    } else if (solution.trim().length < MIN_SOLUTION_LENGTH) {
      errors.solution = `L'analyse doit contenir au moins ${MIN_SOLUTION_LENGTH} caractères`;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [solution]);

  const updateWorkflow = useCallback(async (targetStatus: WorkflowStatus) => {
    // Validate solution for certain status changes
    if (targetStatus === 'TRAITEE' && !validateSolution()) {
      toast.warning("Veuillez compléter l'analyse des causes avant de clôturer");
      textareaRef.current?.focus();
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading("Mise à jour du registre...");
    
    try {
      await apiClient.patch(`/reclamations/${reclamation.REC_Id}/status`, {
        status: targetStatus,
        solution: solution.trim(),
      });
      toast.success("Registre mis à jour avec succès", { id: toastId });
      onRefresh();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "Échec de synchronisation Kernel", { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  }, [reclamation.REC_Id, solution, validateSolution, onRefresh]);

  const launchCAPA = useCallback(async () => {
    if (!validateSolution()) {
      toast.warning("Analyse des causes requise avant CAPA");
      textareaRef.current?.focus();
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading("Génération du plan d'action...");
    
    try {
      await apiClient.post(`/actions/from-reclamation/${reclamation.REC_Id}`, {
        solution: solution.trim(),
      });
      toast.success("PLAN D'ACTION GÉNÉRÉ (§10.2)", { id: toastId });
      onRefresh();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "Erreur de génération CAPA", { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  }, [reclamation.REC_Id, solution, validateSolution, onRefresh]);

  const handleSolutionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setSolution(newValue);
    if (formErrors.solution) {
      setFormErrors({ solution: undefined });
    }
  }, [formErrors.solution]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      // Optional: reset form or close modal
      setFormErrors({});
    }
  }, []);

  const statusConfig = STATUS_CONFIG[reclamation.REC_Status] || STATUS_CONFIG.NOUVELLE;

  return (
    <article 
      className={cn(
        "bg-white p-4 md:p-6 lg:p-8 xl:p-10 rounded-2xl md:rounded-3xl border border-slate-100 shadow-xl md:shadow-2xl space-y-4 md:space-y-5 lg:space-y-6 lg:space-y-8 relative overflow-hidden italic text-left focus-within:ring-2 focus-within:ring-blue-400",
        className
      )}
      role="region"
      aria-labelledby="analysis-title"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="absolute top-0 right-0 p-4 md:p-6 lg:p-8 opacity-5" 
        aria-hidden="true"
      >
        <ShieldAlert size={80} className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28" />
      </div>
      
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 border-b border-slate-50 pb-4 md:pb-6">
        <div>
          <h3 id="analysis-title" className="text-lg md:text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tighter m-0">
            Expertise : <span className="text-blue-500">{reclamation.REC_Reference}</span>
          </h3>
          <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 md:mt-1.5 lg:mt-2">
            Maîtrise des sorties non conformes
          </p>
        </div>
        <StatusBadge status={reclamation.REC_Status} />
      </header>

      <div className="space-y-3 md:space-y-4 lg:space-y-6">
        <div role="group" aria-labelledby="solution-label">
          <label 
            id="solution-label"
            htmlFor="solution-textarea"
            className={cn(
              "block text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 md:mb-3 lg:mb-4 ml-1 md:ml-1.5 lg:ml-2",
              formErrors.solution && "text-red-400"
            )}
          >
            Analyse des causes (5 Pourquoi / Ishikawa) 
            <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <textarea
            id="solution-textarea"
            ref={textareaRef}
            className={cn(
              "w-full p-4 md:p-5 lg:p-6 bg-slate-50 border-2 rounded-xl md:rounded-2xl lg:rounded-3xl focus:border-blue-500 outline-none transition-all font-bold text-slate-800 italic text-[10px] md:text-sm shadow-inner resize-none",
              formErrors.solution 
                ? "border-red-500/50 focus:border-red-500" 
                : "border-slate-100"
            )}
            rows={4}
            value={solution}
            onChange={handleSolutionChange}
            placeholder="Détaillez ici l'expertise technique..."
            aria-required="true"
            aria-invalid={!!formErrors.solution}
            aria-describedby={formErrors.solution ? 'solution-error' : 'solution-hint'}
          />
          {formErrors.solution ? (
            <p id="solution-error" className="text-red-400 text-[7px] md:text-[8px] mt-1 ml-1 md:ml-1.5 flex items-center gap-1" role="alert">
              <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.solution}
            </p>
          ) : (
            <p id="solution-hint" className="text-slate-400 text-[7px] md:text-[8px] mt-1 ml-1 md:ml-1.5">
              Minimum {MIN_SOLUTION_LENGTH} caractères requis
            </p>
          )}
        </div>

        <div 
          className="flex flex-wrap gap-2 md:gap-3 lg:gap-4 pt-4 md:pt-6 border-t border-slate-50"
          role="group"
          aria-label="Actions sur la réclamation"
        >
          {reclamation.REC_Status === 'NOUVELLE' && (
            <ActionButton 
              onClick={() => updateWorkflow('EN_ANALYSE')} 
              color="bg-amber-500" 
              colorClass="hover:bg-amber-600 focus:ring-amber-400"
              icon={RotateCcw} 
              label="Initier l'Analyse" 
              disabled={isUpdating}
              loading={isUpdating}
            />
          )}
          <ActionButton 
            onClick={launchCAPA} 
            color="bg-blue-600" 
            colorClass="hover:bg-blue-500 focus:ring-blue-400"
            icon={PlayCircle} 
            label="Générer Action Corrective" 
            disabled={isUpdating || reclamation.REC_Status === 'TRAITEE'}
            loading={isUpdating}
          />
          <ActionButton 
            onClick={() => updateWorkflow('TRAITEE')} 
            color="bg-emerald-600" 
            colorClass="hover:bg-emerald-500 focus:ring-emerald-400"
            icon={CheckCircle2} 
            label="Clôturer le Dossier" 
            disabled={isUpdating}
            loading={isUpdating}
          />
          <ActionButton 
            onClick={() => updateWorkflow('REJETEE')} 
            color="bg-slate-700" 
            colorClass="hover:bg-slate-600 focus:ring-slate-400"
            icon={XCircle} 
            label="Rejeter" 
            disabled={isUpdating}
            loading={isUpdating}
          />
        </div>
      </div>
    </article>
  );
}