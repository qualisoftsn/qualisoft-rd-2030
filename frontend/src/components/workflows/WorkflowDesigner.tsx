/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⚙️ MODULE : WorkflowDesigner (Approval Chain Designer)
 * RÔLE : Modélisation séquentielle de la chaîne de responsabilité
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { Plus, Trash2, X, GitCommit, RefreshCw, ShieldCheck, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent, useRef } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type EntityType = 'DOCUMENT' | 'ACTION' | 'AUDIT' | 'SSE' | 'CAUSERIE';

export interface WorkflowStep {
  order: number;
  approverId: string;
  label: string;
}

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Role?: string;
  U_IsActive?: boolean;
}

export interface WorkflowDesignerProps {
  entityId: string;
  entityType: EntityType;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface FormErrors {
  steps?: string;
  [key: string]: string | undefined;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  DOCUMENT: 'Document',
  ACTION: 'Action',
  AUDIT: 'Audit',
  SSE: 'Événement SSE',
  CAUSERIE: 'Causerie',
};

const DEFAULT_STEP: WorkflowStep = {
  order: 1,
  approverId: '',
  label: 'APPROBATION INITIALE',
};

const MIN_STEPS = 1;
const MAX_STEPS = 10;

// ============================================================================
// SOUS-COMPOSANT : STEP CARD
// ============================================================================

interface StepCardProps {
  step: WorkflowStep;
  index: number;
  users: User[];
  onUpdate: (index: number, field: keyof WorkflowStep, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  error?: string;
}

function StepCard({ step, index, users, onUpdate, onRemove, canRemove, error }: StepCardProps) {
  const handleLabelChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, 'label', e.target.value.toUpperCase());
  }, [index, onUpdate]);

  const handleApproverChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    onUpdate(index, 'approverId', e.target.value);
  }, [index, onUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Delete' && canRemove) {
      e.preventDefault();
      handleRemove();
    }
  }, [canRemove, handleRemove]);

  return (
    <div 
      className={cn(
        "flex flex-col sm:flex-row gap-3 md:gap-4 items-start sm:items-center bg-black/40 p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-white/5 group hover:border-blue-500/50 transition-all shadow-inner focus-within:ring-2 focus-within:ring-blue-400",
        error && "border-red-500/50"
      )}
      role="group"
      aria-label={`Étape ${step.order}: ${step.label}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div 
        className={cn(
          "w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-lg md:rounded-xl flex items-center justify-center text-[10px] md:text-xs font-black text-white group-hover:bg-blue-600 transition-colors shrink-0",
          error && "bg-red-500/20"
        )}
        aria-hidden="true"
      >
        {step.order}
      </div>
      <div className="flex-1 space-y-2 md:space-y-3 w-full">
        <input 
          className={cn(
            "w-full bg-transparent border-b border-white/10 outline-none text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase italic text-white focus:border-blue-500 py-1.5 md:py-2 transition-colors",
            error && "border-red-500/50"
          )}
          value={step.label}
          onChange={handleLabelChange}
          placeholder={`ÉTAPE ${step.order}`}
          aria-label={`Libellé de l'étape ${step.order}`}
        />
        <div className="relative">
          <select 
            className={cn(
              "w-full bg-transparent border-none text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase italic text-slate-400 outline-none cursor-pointer appearance-none pr-6",
              error && "text-red-400"
            )}
            value={step.approverId}
            onChange={handleApproverChange}
            aria-label={`Sélectionner l'approbateur pour l'étape ${step.order}`}
            aria-invalid={!!error}
          >
            <option value="" className="bg-[#0F172A] text-slate-500">-- CHOISIR APPROBATEUR --</option>
            {users.map(u => (
              <option key={u.U_Id} value={u.U_Id} className="bg-[#0F172A] text-white">
                {u.U_FirstName} {u.U_LastName}{u.U_Email ? ` (${u.U_Email})` : ''}
              </option>
            ))}
          </select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" aria-hidden="true">
            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-red-400 text-[7px] md:text-[8px] flex items-center gap-1" role="alert">
            <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
          </p>
        )}
      </div>
      {canRemove && (
        <button 
          type="button"
          onClick={handleRemove}
          className="p-2 md:p-3 hover:bg-red-500/10 rounded-lg md:rounded-xl text-slate-500 hover:text-red-400 transition-all border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 shrink-0"
          aria-label={`Supprimer l'étape ${step.order}`}
          tabIndex={0}
        >
          <Trash2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function WorkflowDesigner({ entityId, entityType, onClose, onSuccess }: WorkflowDesignerProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([DEFAULT_STEP]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiClient.get<User[]>('/users');
      setUsers(Array.isArray(res.data) ? res.data.filter(u => u.U_IsActive !== false) : []);
    } catch (error) {
      console.error("❌ Erreur chargement utilisateurs:", error);
      toast.error("ERREUR : Registre des habilitations inaccessible.");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchUsers();
    }
  }, [fetchUsers]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const validateSteps = useCallback((): boolean => {
    const errors: Record<number, string> = {};
    let isValid = true;

    if (steps.length < MIN_STEPS) {
      toast.warning("CONFORMITÉ : Au moins une étape est requise.");
      return false;
    }

    steps.forEach((step, index) => {
      if (!step.approverId.trim()) {
        errors[index] = "L'approbateur est requis";
        isValid = false;
      }
      if (!step.label.trim()) {
        errors[index] = "Le libellé est requis";
        isValid = false;
      }
    });

    // Check for duplicate approvers in same workflow
    const approverIds = steps.map(s => s.approverId).filter(Boolean);
    const duplicates = approverIds.filter((id, index) => approverIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      toast.warning("CONFORMITÉ : Un approbateur ne peut apparaître qu'une seule fois.");
      isValid = false;
    }

    setStepErrors(errors);
    return isValid;
  }, [steps]);

  const updateStep = useCallback((index: number, field: keyof WorkflowStep, value: string) => {
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[index] = { ...newSteps[index], [field]: value };
      return newSteps;
    });
    if (stepErrors[index]) {
      setStepErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  }, [stepErrors]);

  const addStep = useCallback(() => {
    if (steps.length >= MAX_STEPS) {
      toast.warning(`Maximum ${MAX_STEPS} étapes autorisées`);
      return;
    }
    setSteps(prev => [...prev, { order: prev.length + 1, approverId: '', label: `ÉTAPE ${prev.length + 1}` }]);
  }, [steps.length]);

  const removeStep = useCallback((index: number) => {
    if (steps.length <= MIN_STEPS) {
      toast.warning("Au moins une étape est requise");
      return;
    }
    setSteps(prev => prev.filter((_, idx) => idx !== index).map((step, idx) => ({ ...step, order: idx + 1 })));
    setStepErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      // Re-index remaining errors
      const reindexed: Record<number, string> = {};
      Object.keys(newErrors).forEach(key => {
        const numKey = parseInt(key);
        if (numKey > index) {
          reindexed[numKey - 1] = newErrors[numKey];
        } else if (numKey < index) {
          reindexed[numKey] = newErrors[numKey];
        }
      });
      return reindexed;
    });
  }, [steps.length]);

  const saveCircuit = useCallback(async () => {
    if (!validateSteps()) {
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Scellage du circuit de validation...");

    try {
      await apiClient.post('/workflows/initiate', { 
        entityId, 
        entityType, 
        steps: steps.map(s => ({ ...s, label: s.label.toUpperCase() }))
      });
      toast.success("CIRCUIT DÉPLOYÉ ET SCELLÉ", { id: toastId });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "ÉCHEC MATRICIEL : Rejet de la configuration", { id: toastId });
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType, steps, validateSteps, onSuccess, onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const entityLabel = ENTITY_TYPE_LABELS[entityType] || 'Entité';

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0B0F1A]/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6 italic font-sans animate-in fade-in duration-500"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <article 
        ref={modalRef}
        className="bg-[#0F172A] border-2 border-white/5 w-full max-w-2xl rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-6 md:p-8 lg:p-10 lg:p-12 shadow-2xl relative overflow-hidden text-left max-h-[90vh] flex flex-col"
      >
        <GitCommit 
          className="absolute -bottom-4 md:-bottom-6 lg:-bottom-10 -left-4 md:-left-6 lg:-left-10 text-white opacity-5 rotate-12 w-48 h-48 md:w-56 md:h-56 lg:w-72 lg:h-72" 
          aria-hidden="true" 
        />

        <header className="flex justify-between items-center mb-6 md:mb-8 lg:mb-10 lg:mb-12 relative z-10 shrink-0">
          <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
            <div 
              className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-blue-600 rounded-xl md:rounded-2xl lg:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-600/40 animate-pulse shrink-0"
              aria-hidden="true"
            >
               <GitCommit size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-white m-0 leading-none">
                Circuit <span className="text-blue-400">Master</span>
              </h2>
              <p className="text-[7px] md:text-[8px] lg:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1 md:mt-1.5 lg:mt-2 lg:mt-3 m-0">
                Validation séquentielle • {entityLabel}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 md:p-3 lg:p-4 bg-white/5 hover:bg-red-500/20 rounded-lg md:rounded-xl lg:rounded-2xl text-slate-400 hover:text-white transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Fermer"
          >
            <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 lg:mb-10 lg:mb-12 max-h-[300px] md:max-h-[350px] lg:max-h-[400px] overflow-y-auto pr-2 md:pr-3 lg:pr-4 custom-scrollbar relative z-10 flex-1" role="list" aria-label="Étapes du workflow">
          {steps.map((step, i) => (
            <StepCard 
              key={`${i}-${step.order}`}
              step={step}
              index={i}
              users={users}
              onUpdate={updateStep}
              onRemove={removeStep}
              canRemove={steps.length > MIN_STEPS}
              error={stepErrors[i]}
            />
          ))}
          <button 
            type="button"
            onClick={addStep}
            disabled={steps.length >= MAX_STEPS}
            className={cn(
              "w-full py-4 md:py-5 lg:py-6 border-2 border-dashed border-white/10 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase text-slate-500 hover:text-blue-400 hover:border-blue-500/40 transition-all flex items-center justify-center gap-2 md:gap-3 bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
              steps.length >= MAX_STEPS && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Ajouter une étape de validation"
            aria-disabled={steps.length >= MAX_STEPS}
          >
            <Plus size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" strokeWidth={3} aria-hidden="true" /> 
            <span className="hidden sm:inline">Ajouter un maillon de validation</span>
            <span className="sm:hidden">Ajouter étape</span>
            {steps.length >= MAX_STEPS && <span className="text-[7px] md:text-[8px]">({steps.length}/{MAX_STEPS})</span>}
          </button>
        </div>

        <button 
          type="button"
          onClick={saveCircuit}
          disabled={loading}
          className={cn(
            "w-full bg-blue-600 py-4 md:py-5 lg:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[3rem] text-[8px] md:text-[9px] lg:text-xs font-black uppercase italic tracking-widest text-white shadow-xl hover:bg-blue-500 hover:text-white transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer relative z-10 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-2 md:gap-3 lg:gap-4",
            loading && "cursor-wait"
          )}
          aria-busy={loading}
          aria-label="Verrouiller le circuit master"
        >
          {loading ? (
            <><RefreshCw size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">SCELLAGE EN COURS...</span><span className="sm:hidden">En cours...</span></>
          ) : (
            <><ShieldCheck size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">VERROUILLER LE CIRCUIT MASTER</span><span className="sm:hidden">Verrouiller</span></>
          )}
        </button>
      </article>
    </div>
  );
}