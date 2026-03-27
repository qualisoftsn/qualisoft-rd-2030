/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🚜 MODULE : EquipmentModal (Equipment Management & VGP Tracking)
 * RÔLE : Enregistrement et suivi VGP du matériel
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback, ChangeEvent, FormEvent, KeyboardEvent, useRef } from "react";
import { Loader2, Settings2, ShieldCheck, X, Calendar, AlertCircle } from "lucide-react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export type EquipmentStatus = 'OPERATIONNEL' | 'EN_MAINTENANCE' | 'HS';

export interface Equipment {
  EQ_Id: string;
  EQ_Reference: string;
  EQ_Name: string;
  EQ_DateService: string;
  EQ_ProchaineVGP: string;
  EQ_Status: EquipmentStatus;
  EQ_Description?: string;
  EQ_Location?: string;
  EQ_IsActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentFormData {
  EQ_Reference: string;
  EQ_Name: string;
  EQ_DateService: string;
  EQ_ProchaineVGP: string;
  EQ_Status: EquipmentStatus;
}

export interface EquipmentModalProps {
  equipment?: Equipment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export interface FormErrors {
  EQ_Reference?: string;
  EQ_Name?: string;
  EQ_DateService?: string;
  EQ_ProchaineVGP?: string;
  EQ_Status?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const STATUS_OPTIONS: Array<{ value: EquipmentStatus; label: string; icon: string }> = [
  { value: 'OPERATIONNEL', label: 'Opérationnel (Actif)', icon: '✅' },
  { value: 'EN_MAINTENANCE', label: 'En Maintenance', icon: '🛠️' },
  { value: 'HS', label: 'Hors Service / Réforme', icon: '🚨' },
];

const DEFAULT_FORM: EquipmentFormData = {
  EQ_Reference: '',
  EQ_Name: '',
  EQ_DateService: new Date().toISOString().split('T')[0],
  EQ_ProchaineVGP: new Date().toISOString().split('T')[0],
  EQ_Status: 'OPERATIONNEL',
};

// ============================================================================
// SOUS-COMPOSANT : INPUT FIELD
// ============================================================================

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  uppercase?: boolean;
}

function InputField({ id, label, value, onChange, placeholder, required = false, error, uppercase = true }: InputFieldProps) {
  return (
    <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black uppercase text-slate-500 block ml-2 md:ml-4 tracking-widest",
          error && "text-red-400"
        )}
      >
        {label} {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      <input 
        id={id}
        required={required}
        value={value} 
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)} 
        placeholder={placeholder}
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-xs text-white font-black outline-none focus:border-blue-500 transition-all italic",
          uppercase && "uppercase",
          error && "border-red-500/50 focus:border-red-500"
        )}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : DATE FIELD
// ============================================================================

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  iconColor?: string;
  borderColor?: string;
}

function DateField({ id, label, value, onChange, required = false, error, iconColor = 'text-blue-400', borderColor = 'border-white/10' }: DateFieldProps) {
  return (
    <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black uppercase block ml-2 md:ml-4 tracking-widest",
          error ? "text-red-400" : iconColor
        )}
      >
        {label} {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <Calendar size={14} className={cn("absolute left-3 md:left-4 lg:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4", iconColor)} aria-hidden="true" />
        <input 
          id={id}
          type="date" 
          required={required}
          value={value} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          className={cn(
            "w-full bg-white/5 border rounded-xl md:rounded-2xl p-3 md:p-4 pl-10 md:pl-12 text-[10px] md:text-xs font-black outline-none focus:border-blue-500 italic",
            error ? "border-red-500/50 focus:border-red-500" : borderColor,
            iconColor
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          style={{ colorScheme: 'dark' }}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function EquipmentModal({ equipment, onClose, onSuccess }: EquipmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<EquipmentFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize form with equipment data if editing
  useEffect(() => {
    if (equipment) {
      setForm({
        EQ_Reference: equipment.EQ_Reference || '',
        EQ_Name: equipment.EQ_Name || '',
        EQ_DateService: equipment.EQ_DateService ? new Date(equipment.EQ_DateService).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        EQ_ProchaineVGP: equipment.EQ_ProchaineVGP ? new Date(equipment.EQ_ProchaineVGP).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        EQ_Status: equipment.EQ_Status || 'OPERATIONNEL',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setFormErrors({});
  }, [equipment]);

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

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    
    if (!form.EQ_Reference.trim()) {
      errors.EQ_Reference = "La référence est obligatoire";
    }
    
    if (!form.EQ_Name.trim()) {
      errors.EQ_Name = "La désignation est obligatoire";
    }
    
    if (!form.EQ_DateService) {
      errors.EQ_DateService = "La date de mise en service est obligatoire";
    }
    
    if (!form.EQ_ProchaineVGP) {
      errors.EQ_ProchaineVGP = "L'échéance VGP est obligatoire";
    } else {
      // Check if VGP date is after service date
      const serviceDate = new Date(form.EQ_DateService);
      const vgpDate = new Date(form.EQ_ProchaineVGP);
      if (vgpDate <= serviceDate) {
        errors.EQ_ProchaineVGP = "La VGP doit être après la mise en service";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Scellage de l'actif matériel...");

    try {
      if (equipment) {
        await apiClient.patch(`/equipments/${equipment.EQ_Id}`, form);
        toast.success("REGISTRE MATÉRIEL MIS À JOUR", { id: toastId });
      } else {
        await apiClient.post('/equipments', form);
        toast.success("ACTIF ENRÔLÉ AVEC SUCCÈS", { id: toastId });
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "Rejet de l'enregistrement Kernel", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof EquipmentFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0B0F1A]/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6 italic font-sans text-left"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />

      <article 
        ref={modalRef}
        className="relative bg-[#0F172A] border border-white/10 w-full max-w-2xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col"
      >
        
        <header className="p-4 md:p-6 lg:p-8 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
          <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
            <div className="p-2 md:p-3 bg-blue-600/20 rounded-xl md:rounded-2xl">
              <Settings2 className="text-blue-400 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg md:text-xl lg:text-2xl font-black uppercase italic text-white tracking-tighter m-0 leading-none">
                {equipment ? "Rectifier" : "Nouvel"} <span className="text-blue-400">Matériel</span>
              </h2>
              <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest mt-1 md:mt-1.5 lg:mt-2 m-0 italic">
                Inventaire Souverain RD 2026
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 md:p-3 hover:bg-white/10 rounded-lg md:rounded-full text-slate-400 hover:text-white transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Fermer"
          >
            <X size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 xl:p-10 space-y-4 md:space-y-6 lg:space-y-8 overflow-y-auto custom-scrollbar flex-1" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <InputField 
              id="eq-reference"
              label="Référence / SN" 
              value={form.EQ_Reference} 
              onChange={(v) => updateForm('EQ_Reference', v)} 
              placeholder="EX: SN-2025-CH01"
              required
              error={formErrors.EQ_Reference}
            />
            <InputField 
              id="eq-name"
              label="Désignation" 
              value={form.EQ_Name} 
              onChange={(v) => updateForm('EQ_Name', v)} 
              placeholder="EX: CHARIOT TOYOTA"
              required
              error={formErrors.EQ_Name}
              uppercase={false}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <DateField 
              id="eq-date-service"
              label="Mise en Service" 
              value={form.EQ_DateService} 
              onChange={(v) => updateForm('EQ_DateService', v)}
              required
              error={formErrors.EQ_DateService}
              iconColor="text-blue-400"
              borderColor="border-white/10"
            />
            <DateField 
              id="eq-vgp"
              label="Échéance VGP" 
              value={form.EQ_ProchaineVGP} 
              onChange={(v) => updateForm('EQ_ProchaineVGP', v)}
              required
              error={formErrors.EQ_ProchaineVGP}
              iconColor="text-amber-400"
              borderColor="border-amber-500/30"
            />
          </div>

          <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby="status-label">
            <label 
              id="status-label"
              className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 block ml-2 md:ml-4 tracking-widest"
            >
              Statut Opérationnel Matrix
            </label>
            <div className="relative">
              <select 
                value={form.EQ_Status} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm('EQ_Status', e.target.value as EquipmentStatus)}
                className="w-full bg-[#161e31] border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 text-[10px] md:text-sm text-white font-black outline-none cursor-pointer uppercase italic appearance-none pr-10 md:pr-12 focus:ring-2 focus:ring-blue-400"
                aria-label="Statut opérationnel"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-[#0F172A] text-white">
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 md:right-6 bottom-3 md:bottom-4 pointer-events-none text-slate-500" aria-hidden="true">
                <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={cn(
              "w-full bg-blue-600 py-3 md:py-4 lg:py-5 lg:py-6 rounded-xl md:rounded-2xl lg:rounded-3xl font-black uppercase italic text-white flex items-center justify-center gap-2 md:gap-3 lg:gap-4 hover:bg-white hover:text-blue-700 transition-all shadow-xl active:scale-95 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
              loading && "opacity-50 cursor-not-allowed active:scale-100"
            )}
            aria-busy={loading}
            aria-label={equipment ? "Valider les modifications" : "Enregistrer au registre SDE"}
          >
            {loading ? (
              <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">TRAITEMENT EN COURS...</span><span className="sm:hidden">En cours...</span></>
            ) : (
              <><ShieldCheck size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">{equipment ? "Valider les Modifications" : "Enregistrer au Registre SDE"}</span><span className="sm:hidden">{equipment ? "Valider" : "Enregistrer"}</span></>
            )}
          </button>
        </form>
      </article>
    </div>
  );
}