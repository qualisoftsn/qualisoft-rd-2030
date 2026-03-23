/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : GED MATRIX ELITE (ISO 9001 §7.5)
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation, Maîtrise et Traçabilité documentaire SMI
 * VERSION : 2.0 - Typing strict + Design Elite + Accessibilité + Cycle de vie complet
 * API : apiClient Axios avec interceptors (Bearer + X-Tenant-Id)
 * RÉVISION : 19 Mars 2026 | 19:30 GMT
 * -------------------------------------------------------------------------
 */

import apiClient, { ApiError } from "@/core/api/api-client";
import { useAuthStore } from "@/store/authStore";
import { clsx, type ClassValue } from "clsx";
import { addMonths, format, isPast, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle, AlertTriangle, Archive, Calendar, CheckCircle2,
  CheckSquare, Clock, Download, Eye, FileEdit, FileText,
  Filter, GitCompare, History, LayoutGrid, List, Loader2, Plus,
  RefreshCw, Save, Search, ShieldCheck, UploadCloud, User, X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState, ChangeEvent, FormEvent } from "react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// ============================================================================
// TYPES & INTERFACES ISO 9001 §7.5
// ============================================================================

export type DocumentStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'OBSOLETE' | 'ARCHIVED';
export type DocumentCategory = 'PROCEDURE' | 'MANUEL' | 'NORME' | 'ENREGISTREMENT' | 'INSTRUCTION' | 'AUTRE';

export interface UserRef {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Avatar?: string;
}

export interface DocumentVersion {
  DV_Id: string;
  DV_VersionNumber: number;
  DV_Status: DocumentStatus;
  DV_CreatedAt: string;
  DV_CreatedBy: UserRef;
  DV_ApprovedBy?: UserRef;
  DV_ChangeDescription: string;
  DV_FileType: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'AUTRE';
  DV_FileUrl: string;
  DV_FileSize?: number;
}

export interface SMI_Document {
  DOC_Id: string;
  DOC_Reference: string;
  DOC_Title: string;
  DOC_Description: string;
  DOC_Category: DocumentCategory;
  DOC_Owner: UserRef;
  DOC_NextReviewDate?: string;
  DOC_Status: DocumentStatus;
  DOC_UpdatedAt: string;
  DOC_Versions: DocumentVersion[];
  DOC_Tags: string[];
  DOC_SiteId?: string;
}

export interface DocumentFormData {
  DOC_Title: string;
  DOC_Reference: string;
  DOC_Description: string;
  DOC_Category: DocumentCategory;
  DOC_NextReviewDate?: string;
  DOC_Tags: string[];
  file?: File;
}

export interface FilterState {
  category: DocumentCategory | 'ALL';
  status: DocumentStatus | 'ALL';
  search: string;
  overdue: boolean;
}

// ============================================================================
// CONFIGURATION DES STATUTS
// ============================================================================

interface StatusTheme {
  bg: string;
  border: string;
  text: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const STATUS_THEMES: Record<DocumentStatus, StatusTheme> = {
  APPROVED: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    label: 'Actif',
    icon: CheckCircle2,
    description: 'Document approuvé et en vigueur',
  },
  PENDING_REVIEW: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    label: 'En revue',
    icon: Clock,
    description: 'En attente de validation',
  },
  DRAFT: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    text: 'text-slate-400',
    label: 'Brouillon',
    icon: FileEdit,
    description: 'Document en cours de rédaction',
  },
  OBSOLETE: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    label: 'Obsolète',
    icon: Archive,
    description: 'Document remplacé ou annulé',
  },
  ARCHIVED: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    text: 'text-slate-400',
    label: 'Archivé',
    icon: Archive,
    description: 'Document conservé à titre historique',
  },
};

const CATEGORY_OPTIONS: Array<{ value: DocumentCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'PROCEDURE', label: 'Procédures' },
  { value: 'MANUEL', label: 'Manuels' },
  { value: 'NORME', label: 'Normes' },
  { value: 'ENREGISTREMENT', label: 'Enregistrements' },
  { value: 'INSTRUCTION', label: 'Instructions' },
  { value: 'AUTRE', label: 'Autres' },
];

// ============================================================================
// UTILITAIRES
// ============================================================================

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
};

const formatDateFR = (dateString?: string): string => {
  if (!dateString) return '—';
  try {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
  } catch {
    return dateString;
  }
};

const isReviewOverdue = (doc: SMI_Document): boolean => {
  return !!(doc.DOC_NextReviewDate && isPast(new Date(doc.DOC_NextReviewDate)) && doc.DOC_Status !== 'OBSOLETE' && doc.DOC_Status !== 'ARCHIVED');
};

// ============================================================================
// HOOK : GED CORE LOGIC
// ============================================================================

const useGEDCore = () => {
  const [documents, setDocuments] = useState<SMI_Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    category: 'ALL',
    status: 'ALL',
    search: '',
    overdue: false,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<SMI_Document[]>('/documents');
      const data = Array.isArray(res.data) ? res.data : [];
      setDocuments(data);
    } catch (error) {
      console.error('❌ Erreur chargement GED:', error);
      toast.error('SYNCHRONISATION GED INTERROMPUE');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    return documents.filter(d => {
      const matchSearch = !filters.search || 
        d.DOC_Title.toLowerCase().includes(filters.search.toLowerCase()) || 
        d.DOC_Reference.toLowerCase().includes(filters.search.toLowerCase());
      const matchCat = filters.category === 'ALL' || d.DOC_Category === filters.category;
      const matchStatus = filters.status === 'ALL' || d.DOC_Status === filters.status;
      const matchOverdue = !filters.overdue || isReviewOverdue(d);
      return matchSearch && matchCat && matchStatus && matchOverdue;
    });
  }, [documents, filters]);

  const stats = useMemo(() => ({
    total: documents.length,
    approved: documents.filter(d => d.DOC_Status === 'APPROVED').length,
    pending: documents.filter(d => d.DOC_Status === 'PENDING_REVIEW').length,
    overdue: documents.filter(d => isReviewOverdue(d)).length,
    draft: documents.filter(d => d.DOC_Status === 'DRAFT').length,
  }), [documents]);

  return { documents: filtered, allDocuments: documents, loading, filters, setFilters, stats, refetch: fetchData };
};

// ============================================================================
// SOUS-COMPOSANT : METRIC BADGE
// ============================================================================

interface MetricProps {
  title: string;
  value: number;
  color: 'emerald' | 'amber' | 'rose' | 'blue' | 'slate';
}

function Metric({ title, value, color }: MetricProps) {
  const colorMap: Record<MetricProps['color'], string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    slate: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <span className={cn(
        "px-2.5 md:px-3 py-1 rounded-lg text-[9px] md:text-[10px] font-black italic uppercase border",
        colorMap[color]
      )}>
        {value}
      </span>
      <span className="text-[7px] md:text-[8px] font-black uppercase text-slate-500 tracking-widest">{title}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ACTION BUTTON
// ============================================================================

interface ActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  color: 'blue' | 'emerald' | 'amber' | 'slate' | 'rose';
  label?: string;
  disabled?: boolean;
}

function ActionButton({ icon: Icon, onClick, color, label, disabled }: ActionButtonProps) {
  const colorMap: Record<ActionButtonProps['color'], string> = {
    blue: 'hover:bg-blue-600 hover:text-white',
    emerald: 'hover:bg-emerald-600 hover:text-white',
    amber: 'hover:bg-amber-600 hover:text-white',
    slate: 'hover:bg-white hover:text-slate-900',
    rose: 'hover:bg-rose-600 hover:text-white',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-2 md:p-2.5 bg-white/5 rounded-lg md:rounded-xl text-slate-400 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
        colorMap[color],
        disabled && "opacity-50 cursor-not-allowed hover:bg-white/5 hover:text-slate-400"
      )}
      aria-label={label}
      title={label}
    >
      <Icon size={14} md:size={16} aria-hidden="true" />
    </button>
  );
}

// ============================================================================
// SOUS-COMPOSANT : DOCUMENT NODE (CARD)
// ============================================================================

interface DocumentNodeProps {
  doc: SMI_Document;
  viewMode: 'grid' | 'list';
  onAction: (type: 'preview' | 'history' | 'revision' | 'edit', doc: SMI_Document) => void;
  onDownload: (doc: SMI_Document, versionId?: string) => void;
}

function DocumentNode({ doc, viewMode, onAction, onDownload }: DocumentNodeProps) {
  const theme = STATUS_THEMES[doc.DOC_Status];
  const overdue = isReviewOverdue(doc);
  const latestVersion = doc.DOC_Versions[0];

  if (viewMode === 'list') {
    return (
      <article className="bg-[#0F172A] border border-white/5 rounded-xl md:rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 group hover:border-blue-500/30 transition-all focus-within:border-blue-500/30">
        {/* Icon */}
        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-blue-600 transition-all">
          <FileText size={18} md:size={20} className="text-blue-400 group-hover:text-white" aria-hidden="true" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
            <span className="text-[8px] md:text-[9px] font-black text-blue-400 uppercase tracking-widest italic">
              {doc.DOC_Reference}
            </span>
            <span className={cn(
              "text-[7px] md:text-[8px] px-2 py-0.5 rounded-full border font-black uppercase italic",
              theme.bg, theme.text, theme.border
            )}>
              {theme.label}
            </span>
            {overdue && (
              <span className="text-[7px] md:text-[8px] px-2 py-0.5 rounded-full border font-black uppercase italic bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-center gap-1">
                <AlertTriangle size={8} aria-hidden="true" /> Revue échue
              </span>
            )}
          </div>
          <h3 className="text-sm md:text-base font-black uppercase italic m-0 truncate group-hover:text-blue-400 transition-colors">
            {doc.DOC_Title}
          </h3>
          <p className="text-[8px] md:text-[9px] text-slate-500 mt-1 line-clamp-1">
            {doc.DOC_Category} • v{latestVersion?.DV_VersionNumber || 1}.0
          </p>
        </div>
        
        {/* Meta + Actions */}
        <div className="flex items-center gap-4 md:gap-8 shrink-0 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right hidden lg:block">
            <p className="text-[7px] md:text-[8px] text-slate-500 font-black uppercase m-0">PROCHAINE REVUE</p>
            <p className={cn(
              "text-[9px] md:text-[10px] font-black mt-1 m-0 italic",
              overdue ? "text-rose-400" : "text-white"
            )}>
              {doc.DOC_NextReviewDate ? formatDateFR(doc.DOC_NextReviewDate) : 'NON FIXÉE'}
            </p>
          </div>
          <div className="flex gap-1 md:gap-2">
            <ActionButton 
              icon={Eye} 
              onClick={() => onAction('preview', doc)} 
              color="blue" 
              label={`Aperçu de ${doc.DOC_Title}`} 
            />
            <ActionButton 
              icon={History} 
              onClick={() => onAction('history', doc)} 
              color="slate" 
              label="Historique des versions" 
            />
            <ActionButton 
              icon={Download} 
              onClick={() => onDownload(doc)} 
              color="emerald" 
              label="Télécharger" 
            />
            {doc.DOC_Status === 'APPROVED' && (
              <ActionButton 
                icon={GitCompare} 
                onClick={() => onAction('revision', doc)} 
                color="amber" 
                label="Créer une révision" 
              />
            )}
          </div>
        </div>
      </article>
    );
  }

  // Grid view
  return (
    <article className="bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-7 lg:p-8 flex flex-col h-full group hover:border-blue-500/30 transition-all relative overflow-hidden shadow-2xl focus-within:border-blue-500/30">
      {/* Background effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full pointer-events-none" aria-hidden="true" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-5 md:mb-6 relative z-10">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/5 group-hover:bg-blue-600 transition-all">
          <FileText size={24} md:size={28} className="text-blue-400 group-hover:text-white" aria-hidden="true" />
        </div>
        <span className={cn(
          "px-3 md:px-4 py-1 md:py-1.5 rounded-full border text-[8px] md:text-[9px] font-black uppercase italic tracking-widest",
          theme.bg, theme.text, theme.border
        )}>
          {theme.label}
        </span>
      </div>
      
      {/* Content */}
      <div className="flex-1 mb-6 md:mb-8 relative z-10">
        <p className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">
          {doc.DOC_Reference}
        </p>
        <h3 className="text-lg md:text-xl font-black uppercase italic m-0 tracking-tighter leading-tight group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[48px]">
          {doc.DOC_Title}
        </h3>
        <p className="text-[10px] md:text-[11px] text-slate-500 mt-3 md:mt-4 line-clamp-3 italic leading-relaxed m-0">
          {doc.DOC_Description}
        </p>
      </div>
      
      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8 pt-4 md:pt-6 border-t border-white/5 relative z-10">
        <div>
          <p className="text-[7px] md:text-[8px] text-slate-500 font-black uppercase m-0">DERNIÈRE V.</p>
          <p className="text-xs md:text-sm font-black text-white m-0">v{latestVersion?.DV_VersionNumber || 1}.0</p>
        </div>
        <div className="text-right">
          <p className="text-[7px] md:text-[8px] text-slate-500 font-black uppercase m-0">REVUE</p>
          <p className={cn(
            "text-xs md:text-sm font-black m-0 italic",
            overdue ? "text-rose-400" : "text-white"
          )}>
            {doc.DOC_NextReviewDate ? formatDateFR(doc.DOC_NextReviewDate) : 'N/A'}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 relative z-10">
        <button 
          type="button"
          onClick={() => onAction('preview', doc)}
          className="flex-1 py-2.5 md:py-3 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase italic transition-all border-none text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Aperçu
        </button>
        <button 
          type="button"
          onClick={() => onAction('history', doc)}
          className="flex-1 py-2.5 md:py-3 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase italic transition-all border-none text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Historique
        </button>
        <button 
          type="button"
          onClick={() => onDownload(doc)}
          className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-blue-700 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={`Télécharger ${doc.DOC_Title}`}
        >
          <Download size={16} md:size={18} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : MODAL FRAME
// ============================================================================

interface ModalFrameProps {
  title: string;
  icon: LucideIcon;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  'aria-labelledby'?: string;
}

function ModalFrame({ title, icon: Icon, onClose, children, width = 'max-w-xl', 'aria-labelledby': ariaLabelledBy }: ModalFrameProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy || 'modal-title'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={cn(
        "bg-[#0F172A] border border-white/10 rounded-2xl md:rounded-3xl w-full shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar relative",
        width
      )}>
        {/* Header */}
        <header className="sticky top-0 bg-[#0F172A]/95 backdrop-blur-md z-20 flex justify-between items-center px-5 md:px-8 py-4 md:py-6 border-b border-white/5">
          <h2 id="modal-title" className="text-lg md:text-xl font-black uppercase italic text-white m-0 flex items-center gap-3">
            <Icon className="text-blue-400" size={20} md:size={24} aria-hidden="true" /> 
            {title}
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Fermer"
          >
            <X size={20} md:size={24} aria-hidden="true" />
          </button>
        </header>
        
        {/* Content */}
        <div className="p-5 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL : CREATE/EDIT DOCUMENT
// ============================================================================

interface DocumentModalProps {
  initialData?: SMI_Document | null;
  onClose: () => void;
  onSuccess: () => void;
}

function DocumentModal({ initialData, onClose, onSuccess }: DocumentModalProps) {
  const [formData, setFormData] = useState<DocumentFormData>({
    DOC_Title: initialData?.DOC_Title || '',
    DOC_Reference: initialData?.DOC_Reference || '',
    DOC_Description: initialData?.DOC_Description || '',
    DOC_Category: initialData?.DOC_Category || 'PROCEDURE',
    DOC_NextReviewDate: initialData?.DOC_NextReviewDate?.split('T')[0] || '',
    DOC_Tags: initialData?.DOC_Tags || [],
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof DocumentFormData, string>>>({});
  const [tagInput, setTagInput] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof DocumentFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.DOC_Tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, DOC_Tags: [...prev.DOC_Tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, DOC_Tags: prev.DOC_Tags.filter(t => t !== tag) }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof DocumentFormData, string>> = {};
    if (!formData.DOC_Title.trim()) errors.DOC_Title = 'Le titre est requis';
    if (!formData.DOC_Reference.trim()) errors.DOC_Reference = 'La référence est requise';
    if (!formData.DOC_Description.trim()) errors.DOC_Description = 'La description est requise';
    if (!file && !initialData) errors.file = 'Un fichier est requis pour la création';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Veuillez compléter tous les champs requis');
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading(initialData ? 'Mise à jour du document...' : 'Création du document...');
    
    try {
      // Upload file first if present
      let fileUrl = initialData?.DOC_Versions[0]?.DV_FileUrl;
      if (file) {
        const uploadRes = await apiClient.post<{ fileUrl: string }>('/documents/upload', {
          file: file,
          fileName: file.name,
          fileType: file.type.split('/')[1]?.toUpperCase() || 'AUTRE',
        }, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        fileUrl = uploadRes.data.fileUrl;
      }
      
      const payload = {
        ...formData,
        DOC_NextReviewDate: formData.DOC_NextReviewDate ? new Date(formData.DOC_NextReviewDate).toISOString() : undefined,
        fileUrl,
      };
      
      if (initialData) {
        await apiClient.put<SMI_Document>(`/documents/${initialData.DOC_Id}`, payload);
        toast.success('Document mis à jour avec succès', { id: toastId });
      } else {
        await apiClient.post<SMI_Document>('/documents', payload);
        toast.success('Document créé avec succès', { id: toastId });
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Erreur document:', error);
      const message = error?.response?.data?.message || error?.message || 'Erreur de sauvegarde';
      toast.error(message, { id: toastId, duration: 6000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalFrame 
      title={initialData ? 'Modifier le Document' : 'Nouveau Document SMI'} 
      icon={ShieldCheck} 
      onClose={onClose}
      aria-labelledby="modal-title"
    >
      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6 font-black italic uppercase">
        
        {/* Category + Reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="DOC_Category" className="text-[9px] text-slate-500 tracking-widest ml-2 block">
              Catégorie *
            </label>
            <select 
              id="DOC_Category"
              name="DOC_Category"
              value={formData.DOC_Category}
              onChange={handleChange}
              className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 cursor-pointer"
            >
              {CATEGORY_OPTIONS.filter(o => o.value !== 'ALL').map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#0B0F1A]">{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="DOC_Reference" className="text-[9px] text-slate-500 tracking-widest ml-2 block">
              Référence *
            </label>
            <input 
              id="DOC_Reference"
              name="DOC_Reference"
              value={formData.DOC_Reference}
              onChange={handleChange}
              placeholder="ex: SDE-PROC-01"
              className={cn(
                "w-full bg-[#0B0F1A] border rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-blue-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 placeholder:text-slate-600",
                formErrors.DOC_Reference ? "border-rose-500/50" : "border-white/10"
              )}
            />
            {formErrors.DOC_Reference && (
              <p className="text-rose-400 text-[9px] ml-2 flex items-center gap-1" role="alert">
                <AlertCircle size={10} aria-hidden="true" /> {formErrors.DOC_Reference}
              </p>
            )}
          </div>
        </div>
        
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="DOC_Title" className="text-[9px] text-slate-500 tracking-widest ml-2 block">
            Désignation Officielle *
          </label>
          <input 
            id="DOC_Title"
            name="DOC_Title"
            value={formData.DOC_Title}
            onChange={handleChange}
            required
            placeholder="Titre complet du document..."
            className={cn(
              "w-full bg-[#0B0F1A] border rounded-xl p-3 md:p-4 text-[11px] md:text-[12px] text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 placeholder:text-slate-600",
              formErrors.DOC_Title ? "border-rose-500/50" : "border-white/10"
            )}
          />
          {formErrors.DOC_Title && (
            <p className="text-rose-400 text-[9px] ml-2 flex items-center gap-1" role="alert">
              <AlertCircle size={10} aria-hidden="true" /> {formErrors.DOC_Title}
            </p>
          )}
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="DOC_Description" className="text-[9px] text-slate-500 tracking-widest ml-2 block">
            Description
          </label>
          <textarea 
            id="DOC_Description"
            name="DOC_Description"
            value={formData.DOC_Description}
            onChange={handleChange}
            rows={3}
            placeholder="Objet, périmètre, responsables..."
            className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 resize-none placeholder:text-slate-600"
          />
        </div>
        
        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-[9px] text-slate-500 tracking-widest ml-2 block">
            Fichier {!initialData && '*'}
          </label>
          <div className={cn(
            "border-2 border-dashed rounded-xl md:rounded-2xl p-6 md:p-8 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600",
            formErrors.file ? "border-rose-500/50 bg-rose-500/5" : "border-white/10 hover:border-blue-500 hover:bg-blue-500/5"
          )}
          onClick={() => document.getElementById('file-input')?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              document.getElementById('file-input')?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Sélectionner un fichier"
          >
            <input 
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.docx,.xlsx,.pptx"
            />
            <UploadCloud size={32} md:size={40} className="text-blue-400 mb-3 mx-auto" aria-hidden="true" />
            <p className="text-[9px] md:text-[10px] text-white m-0">
              {file ? file.name : 'DÉPOSER LE FICHIER ISO (PDF/WORD/EXCEL)'}
            </p>
            {file && <p className="text-[8px] text-slate-500 mt-1">{formatFileSize(file.size)}</p>}
          </div>
          {formErrors.file && (
            <p className="text-rose-400 text-[9px] ml-2 flex items-center gap-1" role="alert">
              <AlertCircle size={10} aria-hidden="true" /> {formErrors.file}
            </p>
          )}
        </div>
        
        {/* Review Date + Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="DOC_NextReviewDate" className="text-[9px] text-slate-500 tracking-widest ml-2 block">
              Prochaine revue
            </label>
            <input 
              id="DOC_NextReviewDate"
              name="DOC_NextReviewDate"
              type="date"
              value={formData.DOC_NextReviewDate}
              onChange={handleChange}
              className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl p-3 md:p-4 text-[10px] md:text-[11px] text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] text-slate-500 tracking-widest ml-2 block">
              Tags
            </label>
            <div className="flex gap-2">
              <input 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Ajouter un tag..."
                className="flex-1 bg-[#0B0F1A] border border-white/10 rounded-xl p-3 text-[10px] text-white outline-none focus:border-blue-600"
              />
              <button 
                type="button"
                onClick={addTag}
                className="px-4 bg-blue-600 rounded-xl text-white hover:bg-blue-500 transition-all"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.DOC_Tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[8px] font-black uppercase flex items-center gap-1">
                  {tag}
                  <button 
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-white"
                    aria-label={`Supprimer le tag ${tag}`}
                  >
                    <X size={10} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Submit */}
        <button 
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full bg-blue-600 py-4 md:py-5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] text-white border-none shadow-xl flex items-center justify-center gap-3 uppercase italic transition-all focus:outline-none focus:ring-2 focus:ring-blue-400",
            isSubmitting ? "opacity-70 cursor-wait" : "hover:bg-white hover:text-blue-700 active:scale-95 cursor-pointer"
          )}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" /> 
              <span>TRAITEMENT...</span>
            </>
          ) : (
            <>
              <Save size={16} aria-hidden="true" /> 
              <span>{initialData ? 'METTRE À JOUR' : 'SCeller LE DOCUMENT'}</span>
            </>
          )}
        </button>
      </form>
    </ModalFrame>
  );
}

// ============================================================================
// MODAL : HISTORY TIMELINE
// ============================================================================

interface HistoryModalProps {
  doc: SMI_Document;
  onClose: () => void;
  onDownload: (versionId: string) => void;
}

function HistoryTimelineModal({ doc, onClose, onDownload }: HistoryModalProps) {
  return (
    <ModalFrame title="Historique des Versions" icon={History} onClose={onClose} width="max-w-2xl">
      <div className="space-y-4 md:space-y-6">
        {doc.DOC_Versions.map((v, i) => {
          const isLatest = i === 0;
          return (
            <div key={v.DV_Id} className="flex gap-4 md:gap-6 relative before:absolute before:left-5 md:before:left-6 before:top-12 md:before:top-14 before:-bottom-4 md:before:-bottom-6 before:w-px before:bg-white/5 last:before:hidden">
              {/* Version badge */}
              <div className={cn(
                "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 border-2 border-[#0B0F1A] z-10 shadow-xl",
                isLatest ? "bg-blue-600 text-white" : "bg-white/5 text-slate-500"
              )}>
                <span className="text-[9px] md:text-[10px] font-black uppercase">v{v.DV_VersionNumber}</span>
              </div>
              
              {/* Content card */}
              <div className="bg-white/5 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-6 flex-1 hover:border-blue-500/30 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 md:mb-4">
                  <p className="text-[10px] md:text-[11px] font-black text-white m-0 italic uppercase">
                    {v.DV_CreatedBy.U_FirstName} {v.DV_CreatedBy.U_LastName}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[7px] md:text-[8px] px-2 py-0.5 rounded-full border font-black uppercase",
                      STATUS_THEMES[v.DV_Status].bg,
                      STATUS_THEMES[v.DV_Status].text,
                      STATUS_THEMES[v.DV_Status].border
                    )}>
                      {STATUS_THEMES[v.DV_Status].label}
                    </span>
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 m-0 uppercase tracking-widest">
                      {formatDateFR(v.DV_CreatedAt)}
                    </p>
                  </div>
                </div>
                
                <p className="text-[10px] md:text-[11px] text-slate-400 italic m-0 bg-black/40 p-3 md:p-4 rounded-xl border border-white/5 leading-relaxed">
                  &quot;{v.DV_ChangeDescription || "Initialisation de l'information documentée."}&quot;
                </p>
                
                <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/5">
                  <span className="text-[8px] text-slate-500 uppercase">
                    {v.DV_FileType} • {formatFileSize(v.DV_FileSize)}
                  </span>
                  <button 
                    type="button"
                    onClick={() => onDownload(v.DV_Id)}
                    className="text-[8px] md:text-[9px] font-black text-blue-400 hover:text-blue-300 transition-all uppercase italic tracking-widest bg-transparent border-none cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
                  >
                    <Download size={12} aria-hidden="true"/> Télécharger v{v.DV_VersionNumber}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ModalFrame>
  );
}

// ============================================================================
// MODAL : PREVIEW
// ============================================================================

interface PreviewModalProps {
  doc: SMI_Document;
  onClose: () => void;
  onDownload: () => void;
}

function PreviewMatrixModal({ doc, onClose, onDownload }: PreviewModalProps) {
  const latestVersion = doc.DOC_Versions[0];
  
  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 md:p-6 border-b border-white/5 bg-[#0B0F1A] rounded-t-2xl">
        <div>
          <h2 className="text-lg md:text-xl font-black uppercase italic text-white m-0 tracking-tighter">
            {doc.DOC_Title}
          </h2>
          <p className="text-[8px] md:text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1 md:mt-2">
            {doc.DOC_Reference} • VERSION {latestVersion?.DV_VersionNumber}.0 • {latestVersion?.DV_FileType}
          </p>
        </div>
        <div className="flex gap-2 md:gap-4">
          <button 
            type="button"
            onClick={onDownload}
            className="px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 rounded-xl text-[8px] md:text-[9px] font-black text-white uppercase italic border-none cursor-pointer flex items-center gap-2 hover:bg-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Download size={14} md:size={16} aria-hidden="true"/> Télécharger
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="p-2.5 md:p-3 bg-white/5 rounded-xl text-white border-none cursor-pointer hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Fermer l'aperçu"
          >
            <X size={18} md:size={20} aria-hidden="true"/>
          </button>
        </div>
      </header>
      
      {/* Preview area */}
      <div className="flex-1 bg-[#0F172A] rounded-b-2xl mt-2 md:mt-4 relative overflow-hidden flex items-center justify-center">
        {latestVersion?.DV_FileType === 'PDF' ? (
          <iframe 
            src={latestVersion.DV_FileUrl} 
            className="w-full h-full border-none relative z-10"
            title={`Aperçu de ${doc.DOC_Title}`}
            aria-label={`Document ${doc.DOC_Title}`}
          />
        ) : (
          <div className="text-center p-8">
            <FileText size={48} md:size={64} className="mx-auto mb-4 text-slate-600" aria-hidden="true" />
            <p className="text-[10px] md:text-[11px] text-slate-400 italic mb-4">
              Aperçu non disponible pour le format {latestVersion?.DV_FileType}
            </p>
            <button 
              type="button"
              onClick={onDownload}
              className="px-6 py-3 bg-blue-600 rounded-xl text-[9px] font-black text-white uppercase italic border-none cursor-pointer hover:bg-blue-500 transition-all"
            >
              Télécharger le fichier
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function GEDMatrixPage() {
  const { user } = useAuthStore();
  const { documents, allDocuments, loading, filters, setFilters, stats, refetch } = useGEDCore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [modal, setModal] = useState<{ type: 'create' | 'edit' | 'revision' | 'history' | 'preview' | null; doc: SMI_Document | null }>({ type: null, doc: null });

  // Actions handlers
  const handleDownload = useCallback(async (doc: SMI_Document, versionId?: string) => {
    const toastId = toast.loading('Extraction sécurisée du document...');
    try {
      const targetV = versionId || doc.DOC_Versions[0]?.DV_Id;
      const res = await apiClient.get(`/documents/${doc.DOC_Id}/versions/${targetV}/download`, { 
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.DOC_Reference}_v${doc.DOC_Versions[0]?.DV_VersionNumber}.${doc.DOC_Versions[0]?.DV_FileType?.toLowerCase() || 'pdf'}`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Document téléchargé', { id: toastId });
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      toast.error('Échec de l\'export', { id: toastId });
    }
  }, []);

  const handleAction = useCallback((type: 'preview' | 'history' | 'revision' | 'edit', doc: SMI_Document) => {
    setModal({ type, doc });
  }, []);

  const handleRefresh = async () => {
    const toastId = toast.loading('Synchronisation...');
    try {
      await refetch();
      toast.success('Registre mis à jour', { id: toastId });
    } catch {
      toast.error('Échec de synchronisation', { id: toastId });
    }
  };

  // Loading state
  if (loading && documents.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 md:gap-6" role="status" aria-live="polite">
        <Loader2 className="animate-spin text-blue-500" size={40} md:size={48} aria-hidden="true" />
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.35em] italic text-slate-400">
          Extraction de la Matrix...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-3 md:py-4 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-6">
        <div className="flex items-center gap-4 md:gap-6 w-full xl:w-auto">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter italic leading-none m-0 text-white">
              GED <span className="text-blue-500">Matrix</span>
            </h1>
            <p className="text-slate-500 text-[8px] md:text-[9px] font-black uppercase mt-1 md:mt-2 tracking-[0.3em] m-0 italic">
              §7.5 • Maîtrise Documentaire SDE
            </p>
          </div>
          {/* Stats desktop */}
          <div className="hidden xl:flex gap-4 md:gap-6 ml-4 md:ml-8 border-l border-white/10 pl-4 md:pl-8">
            <Metric title="Actifs" value={stats.approved} color="emerald" />
            <Metric title="À valider" value={stats.pending} color="amber" />
            <Metric title="Retards" value={stats.overdue} color="rose" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
          {/* Search */}
          <div className="relative flex-1 xl:w-64 lg:w-80">
            <label htmlFor="doc-search" className="sr-only">Rechercher un document</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} aria-hidden="true" />
            <input 
              id="doc-search"
              type="search"
              value={filters.search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="RÉFÉRENCE OU TITRE..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 md:pl-12 pr-4 text-[8px] md:text-[9px] font-black uppercase outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/30 transition-all text-white italic placeholder:text-slate-600"
              aria-label="Filtrer les documents par référence ou titre"
            />
          </div>
          
          {/* Actions */}
          <button 
            type="button"
            onClick={handleRefresh}
            className="p-2.5 md:p-3 bg-white/5 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-white/10 text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Actualiser le registre"
            title="Synchroniser"
          >
            <RefreshCw size={16} md:size={18} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          </button>
          
          <button 
            type="button"
            onClick={() => setModal({ type: 'create', doc: null })}
            className="bg-blue-600 hover:bg-white hover:text-blue-700 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-[8px] md:text-[9px] font-black uppercase italic border-none text-white cursor-pointer active:scale-95 transition-all shadow-xl shadow-blue-900/20 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Plus size={16} md:size={18} strokeWidth={3} aria-hidden="true" /> 
            <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>
      </header>

      {/* 🎛️ FILTERS & TOOLBAR */}
      <nav className="shrink-0 px-4 md:px-6 py-2 md:py-3 border-b border-white/5 bg-black/20 flex flex-wrap justify-between items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar">
        {/* Category filters */}
        <div className="flex gap-1.5 md:gap-2">
          {CATEGORY_OPTIONS.slice(0, 5).map((cat) => (
            <button 
              key={cat.value}
              type="button"
              onClick={() => setFilters(f => ({ ...f, category: cat.value }))}
              className={cn(
                "px-3 md:px-4 py-1.5 rounded-lg md:rounded-xl text-[7px] md:text-[8px] font-black uppercase italic transition-all border tracking-widest cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                filters.category === cat.value 
                  ? "bg-blue-600 border-blue-600 text-white" 
                  : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
              )}
              aria-pressed={filters.category === cat.value}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        {/* Right controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Overdue filter */}
          <button 
            type="button"
            onClick={() => setFilters(f => ({ ...f, overdue: !f.overdue }))}
            className={cn(
              "flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-lg md:rounded-xl text-[7px] md:text-[8px] font-black uppercase transition-all border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
              filters.overdue 
                ? "bg-rose-500 border-rose-500 text-white" 
                : "bg-white/5 border-white/10 text-rose-400 hover:text-rose-300"
            )}
            aria-pressed={filters.overdue}
          >
            <AlertTriangle size={10} md:size={12} aria-hidden="true" /> 
            <span className="hidden sm:inline">Revues échues</span>
          </button>
          
          <div className="h-4 w-px bg-white/10 hidden md:block" aria-hidden="true" />
          
          {/* View toggle */}
          <div className="flex bg-black/40 rounded-lg md:rounded-xl p-1 border border-white/10" role="tablist" aria-label="Mode d'affichage">
            <button 
              type="button"
              onClick={() => setViewMode('grid')}
              role="tab"
              aria-selected={viewMode === 'grid'}
              className={cn(
                "p-1.5 md:p-2 rounded-lg md:rounded-lg transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                viewMode === 'grid' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"
              )}
              aria-label="Vue grille"
            >
              <LayoutGrid size={14} md:size={16} aria-hidden="true"/>
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('list')}
              role="tab"
              aria-selected={viewMode === 'list'}
              className={cn(
                "p-1.5 md:p-2 rounded-lg md:rounded-lg transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                viewMode === 'list' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"
              )}
              aria-label="Vue liste"
            >
              <List size={14} md:size={16} aria-hidden="true"/>
            </button>
          </div>
        </div>
      </nav>

      {/* 📜 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-[#0B0F1A]">
        {documents.length > 0 ? (
          <div className={cn(
            "gap-4 md:gap-6", 
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3" 
              : "flex flex-col"
          )}>
            {documents.map((doc) => (
              <DocumentNode 
                key={doc.DOC_Id} 
                doc={doc} 
                viewMode={viewMode} 
                onAction={handleAction}
                onDownload={handleDownload}
              />
            ))}
          </div>
        ) : (
          <div className="h-64 md:h-80 border-2 border-dashed border-white/10 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-slate-500" role="status">
            <Archive size={48} md:size={64} className="mb-3 md:mb-4 opacity-10" aria-hidden="true" />
            <p className="font-black uppercase italic text-[9px] md:text-[10px] tracking-widest text-center px-4">
              {filters.search || filters.category !== 'ALL' || filters.status !== 'ALL' || filters.overdue
                ? 'Aucun document ne correspond aux filtres'
                : 'Aucune information documentée scellée'}
            </p>
            {!filters.search && filters.category === 'ALL' && filters.status === 'ALL' && !filters.overdue && (
              <button 
                type="button"
                onClick={() => setModal({ type: 'create', doc: null })}
                className="mt-3 md:mt-4 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
              >
                Créer votre premier document
              </button>
            )}
          </div>
        )}
        
        {/* Footer info */}
        <footer className="mt-6 md:mt-8 text-center pb-4">
          <p className="text-[7px] md:text-[8px] text-slate-600 uppercase italic tracking-[0.3em]">
            Conformité ISO 9001:2015 §7.5 • Informations documentées • {allDocuments.length} documents au total
          </p>
        </footer>
      </main>

      {/* 🚀 MODALS */}
      {modal.type === 'create' && (
        <DocumentModal 
          onClose={() => setModal({ type: null, doc: null })} 
          onSuccess={refetch} 
        />
      )}
      {modal.type === 'edit' && modal.doc && (
        <DocumentModal 
          initialData={modal.doc}
          onClose={() => setModal({ type: null, doc: null })} 
          onSuccess={refetch} 
        />
      )}
      {modal.type === 'revision' && modal.doc && (
        <DocumentModal 
          initialData={{ ...modal.doc, DOC_Status: 'DRAFT', DOC_Reference: `${modal.doc.DOC_Reference}-REV` }}
          onClose={() => setModal({ type: null, doc: null })} 
          onSuccess={refetch} 
        />
      )}
      {modal.type === 'history' && modal.doc && (
        <HistoryTimelineModal 
          doc={modal.doc} 
          onClose={() => setModal({ type: null, doc: null })} 
          onDownload={(vId: string) => handleDownload(modal.doc!, vId)} 
        />
      )}
      {modal.type === 'preview' && modal.doc && (
        <PreviewMatrixModal 
          doc={modal.doc} 
          onClose={() => setModal({ type: null, doc: null })} 
          onDownload={() => handleDownload(modal.doc!)} 
        />
      )}

      {/* GLOBAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(37, 99, 235, 0.3); 
          border-radius: 10px; 
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        :focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}