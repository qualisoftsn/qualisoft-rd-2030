/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📂 MODULE : DocumentUploadModal (ISO 7.5 Document Control)
 * RÔLE : Indexation et archivage scellé au coffre-fort (§7.5 ISO)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback, ChangeEvent, FormEvent, KeyboardEvent, useRef } from "react";
import { 
  AlertCircle, CheckCircle2, Loader2, ShieldCheck, Upload, X, FileText, AlertTriangle
} from "lucide-react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface ProcessusEntry {
  PR_Id: string;
  PR_Libelle: string;
  PR_Code?: string;
  PR_IsActive?: boolean;
}

export type DocumentCategory = 'PROCEDURE' | 'MANUEL' | 'ENREGISTREMENT' | 'RAPPORT' | 'INSTRUCTION' | 'AUTRE';

export interface DocumentFormData {
  DOC_Title: string;
  DOC_Description: string;
  DOC_Category: DocumentCategory;
  DOC_ProcessusId: string;
  DOC_Version?: string;
}

export interface DocumentUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultProcessusId?: string;
}

export interface FormErrors {
  DOC_Title?: string;
  DOC_Category?: string;
  DOC_ProcessusId?: string;
  file?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
];

const DOCUMENT_CATEGORIES: Array<{ value: DocumentCategory; label: string }> = [
  { value: 'PROCEDURE', label: 'Procédure Opérationnelle' },
  { value: 'MANUEL', label: 'Manuel SMI / Qualité' },
  { value: 'ENREGISTREMENT', label: 'Enregistrement (Preuve)' },
  { value: 'RAPPORT', label: "Rapport d'Audit" },
  { value: 'INSTRUCTION', label: "Instruction de Travail" },
  { value: 'AUTRE', label: 'Autre Document' },
];

const DEFAULT_FORM: DocumentFormData = {
  DOC_Title: '',
  DOC_Description: '',
  DOC_Category: 'PROCEDURE',
  DOC_ProcessusId: '',
  DOC_Version: 'V1.0',
};

// ============================================================================
// SOUS-COMPOSANT : INPUT BLOCK
// ============================================================================

interface InputBlockProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

function InputBlock({ id, label, value, onChange, placeholder, required = false, error }: InputBlockProps) {
  return (
    <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "block text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 md:ml-4",
          error && "text-red-400"
        )}
      >
        {label} {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      <input 
        id={id}
        type="text" 
        value={value} 
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        placeholder={placeholder}
        required={required}
        className={cn(
          "w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase transition-all shadow-inner",
          error && "border-red-500/50 focus:ring-red-500"
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
// SOUS-COMPOSANT : SELECT BLOCK
// ============================================================================

interface SelectBlockProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}

function SelectBlock({ id, label, value, onChange, children, required = false, error }: SelectBlockProps) {
  return (
    <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "block text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2 md:ml-4",
          error && "text-red-400"
        )}
      >
        {label} {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <select 
          id={id}
          required={required} 
          value={value} 
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
          className={cn(
            "w-full bg-[#161e31] border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer italic uppercase appearance-none pr-10 md:pr-12",
            error && "border-red-500/50 focus:ring-red-500"
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          {children}
        </select>
        <div className="absolute right-4 md:right-6 bottom-4 md:bottom-5 lg:bottom-6 pointer-events-none text-slate-500" aria-hidden="true">
          <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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
// SOUS-COMPOSANT : FILE DROP ZONE
// ============================================================================

interface FileDropZoneProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}

function FileDropZone({ selectedFile, onFileChange, error, disabled = false }: FileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Fichier trop volumineux (max ${MAX_FILE_SIZE_MB}MB)`;
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Type de fichier non autorisé (PDF, Word, Excel, Image uniquement)';
    }

    return null;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const validationError = validateFile(file);
      
      if (validationError) {
        toast.error(validationError);
        onFileChange(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        onFileChange(file);
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      const validationError = validateFile(file);
      
      if (validationError) {
        toast.error(validationError);
      } else {
        onFileChange(file);
      }
    }
  }, [onFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative" role="group" aria-labelledby="file-upload-label">
      <input 
        ref={fileInputRef}
        type="file" 
        required={!selectedFile}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        disabled={disabled}
        accept={ALLOWED_FILE_TYPES.join(',')}
        aria-label="Sélectionner un fichier à télécharger"
        aria-required={!selectedFile}
        aria-invalid={!!error}
        aria-describedby={error ? 'file-error' : undefined}
      />
      <div 
        className={cn(
          "border-4 border-dashed rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 lg:p-12 text-center transition-all duration-500",
          disabled && "opacity-50 cursor-not-allowed",
          selectedFile 
            ? "border-emerald-500/40 bg-emerald-500/5" 
            : "border-white/10 bg-white/2 hover:border-blue-500/30"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        id="file-upload-label"
      >
        {selectedFile ? (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8 animate-in zoom-in duration-500">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/20 rounded-2xl md:rounded-3xl flex items-center justify-center text-emerald-400 shadow-xl shrink-0">
              <CheckCircle2 size={32} className="w-8 h-8 md:w-10 md:h-10" aria-hidden="true" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-base md:text-lg lg:text-xl font-black text-white uppercase italic tracking-tighter m-0 truncate max-w-xs md:max-w-md">
                {selectedFile.name}
              </p>
              <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 md:mt-2 m-0">
                Version {DEFAULT_FORM.DOC_Version} • {formatFileSize(selectedFile.size)}
              </p>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onFileChange(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="mt-2 text-[8px] md:text-[9px] text-red-400 hover:text-red-300 uppercase tracking-widest underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                  aria-label="Supprimer le fichier sélectionné"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-5 lg:space-y-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto text-blue-400 shadow-inner hover:scale-110 transition-transform">
              <Upload size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
            </div>
            <p className="text-[10px] md:text-sm font-black uppercase text-slate-300 tracking-widest m-0">
              Sélectionnez le fichier source
            </p>
            <p className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-widest font-bold m-0">
              PDF, Word, Excel, Image • Max {MAX_FILE_SIZE_MB}MB
            </p>
          </div>
        )}
      </div>
      {error && (
        <p id="file-error" className="text-red-400 text-[7px] md:text-[8px] mt-2 ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function DocumentUploadModal({ 
  onClose, 
  onSuccess,
  defaultProcessusId 
}: DocumentUploadModalProps) {
  const [loading, setLoading] = useState(false);
  const [processus, setProcessus] = useState<ProcessusEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState<DocumentFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // 📡 SYNCHRONISATION DU RÉFÉRENTIEL PROCESSUS
  useEffect(() => {
    const fetchProcessus = async () => {
      try {
        const res = await apiClient.get<ProcessusEntry[]>('/processus');
        setProcessus(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('❌ Erreur chargement processus:', error);
        toast.error("ERREUR : Liaison processus rompue.");
      }
    };
    
    if (typeof window !== 'undefined') {
      fetchProcessus();
    }
  }, []);

  // Set default processus if provided
  useEffect(() => {
    if (defaultProcessusId) {
      setForm(prev => ({ ...prev, DOC_ProcessusId: defaultProcessusId }));
    }
  }, [defaultProcessusId]);

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

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!selectedFile) {
      errors.file = "Le fichier est obligatoire";
    }
    
    if (!form.DOC_Title.trim()) {
      errors.DOC_Title = "Le titre est obligatoire";
    }
    
    if (!form.DOC_Category) {
      errors.DOC_Category = "La catégorie est obligatoire";
    }
    
    if (!form.DOC_ProcessusId) {
      errors.DOC_ProcessusId = "Le processus est obligatoire";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Scellage et indexation GED en cours...");

    const data = new FormData();
    if (selectedFile) {
      data.append("file", selectedFile);
    }
    data.append("DOC_Title", form.DOC_Title.toUpperCase());
    data.append("DOC_Description", form.DOC_Description.toUpperCase());
    data.append("DOC_Category", form.DOC_Category);
    data.append("DOC_ProcessusId", form.DOC_ProcessusId);
    if (form.DOC_Version) {
      data.append("DOC_Version", form.DOC_Version);
    }

    try {
      await apiClient.post('/documents/upload', data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("DOCUMENT INDEXÉ DANS LE COFFRE-FORT", { id: toastId });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "Rejet de l'indexation Matrix", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof DocumentFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = useCallback((file: File | null) => {
    setSelectedFile(file);
    if (file && !form.DOC_Title) {
      const fileName = file.name.split('.')[0].toUpperCase();
      setForm(prev => ({ ...prev, DOC_Title: fileName }));
    }
    if (formErrors.file) {
      setFormErrors(prev => ({ ...prev, file: undefined }));
    }
  }, [form.DOC_Title, formErrors.file]);

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
        className="relative bg-[#0F172A] w-full max-w-3xl lg:max-w-4xl rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col"
      >
        
        {/* HEADER */}
        <header className="p-4 md:p-6 lg:p-8 xl:p-10 border-b border-white/5 flex justify-between items-center bg-white/2 relative shrink-0">
          <div className="absolute top-0 left-4 md:left-6 lg:left-10 w-16 md:w-20 lg:w-32 h-1 bg-blue-600 shadow-[0_0_15px_#2563eb]" aria-hidden="true" />
          <div>
            <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tighter text-white m-0">
              Indexation <span className="text-blue-400">Documentaire</span>
            </h2>
            <p className="text-[9px] md:text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1 md:mt-2 lg:mt-3 m-0">
              Qualisoft RD 2026 • Coffre-fort numérique scellé
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 md:p-3 lg:p-4 bg-white/5 rounded-lg md:rounded-xl lg:rounded-2xl text-slate-400 hover:text-white hover:bg-red-500/20 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Fermer"
          >
            <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 space-y-6 md:space-y-8 lg:space-y-10 lg:space-y-12 overflow-y-auto custom-scrollbar flex-1" noValidate>
          {/* ZONE DE DÉPÔT */}
          <FileDropZone 
            selectedFile={selectedFile} 
            onFileChange={handleFileChange}
            error={formErrors.file}
            disabled={loading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
            <div className="space-y-4 md:space-y-6 lg:space-y-8">
              <InputBlock 
                id="doc-title"
                label="Titre Qualité du Document" 
                value={form.DOC_Title} 
                onChange={(v) => updateForm('DOC_Title', v)} 
                placeholder="EX: PROCÉDURE GESTION DÉCHETS"
                required
                error={formErrors.DOC_Title}
              />
              <SelectBlock 
                id="doc-category"
                label="Catégorie Normative" 
                value={form.DOC_Category} 
                onChange={(v) => updateForm('DOC_Category', v as DocumentCategory)}
                error={formErrors.DOC_Category}
              >
                {DOCUMENT_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value} className="bg-[#0F172A] text-white">
                    {cat.label}
                  </option>
                ))}
              </SelectBlock>
            </div>

            <div className="space-y-4 md:space-y-6 lg:space-y-8">
              <SelectBlock 
                id="doc-processus"
                label="Ancrage Processus (Lien Fort)" 
                value={form.DOC_ProcessusId} 
                onChange={(v) => updateForm('DOC_ProcessusId', v)}
                required
                error={formErrors.DOC_ProcessusId}
              >
                <option value="" className="bg-[#0F172A] text-slate-500">-- Assigner un processus --</option>
                {processus.map(p => (
                  <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0F172A] text-white">
                    {p.PR_Libelle}
                  </option>
                ))}
              </SelectBlock>
              
              <div 
                className="p-4 md:p-5 lg:p-6 bg-blue-600/5 border border-blue-500/20 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-5 relative overflow-hidden"
                role="note"
                aria-label="Information de conformité ISO"
              >
                <ShieldCheck size={40} className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 absolute -right-2 md:-right-4 -bottom-2 md:-bottom-4 opacity-5" aria-hidden="true" />
                <AlertCircle size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-blue-400 shrink-0" aria-hidden="true" />
                <p className="text-[8px] md:text-[9px] lg:text-[10px] text-slate-400 leading-relaxed font-black italic uppercase tracking-tighter m-0 relative z-10">
                  Conformité ISO : Statut initial <span className="text-blue-400">BROUILLON</span>. Circuit de validation requis pour passage en <span className="text-emerald-400">DIFFUSÉ</span>.
                </p>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !selectedFile} 
            className={cn(
              "w-full bg-blue-600 text-white p-4 md:p-5 lg:p-6 lg:p-7 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 md:gap-4 lg:gap-5 hover:bg-white hover:text-blue-700 transition-all shadow-xl border-none cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400",
              (loading || !selectedFile) && "opacity-30 cursor-not-allowed active:scale-100"
            )}
            aria-busy={loading}
            aria-label="Indexer le document au coffre-fort"
          >
            {loading ? (
              <><Loader2 size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">INDEXATION EN COURS...</span><span className="sm:hidden">En cours...</span></>
            ) : (
              <><ShieldCheck size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> <span className="hidden sm:inline">Indexer au Coffre-fort (V1.0)</span><span className="sm:hidden">Indexer</span></>
            )}
          </button>
        </form>
      </article>
    </div>
  );
}