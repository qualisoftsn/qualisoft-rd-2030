/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⚖️ MODULE : CONFORMITÉ LÉGALE SÉNÉGAL (ISO 9001 §6.1.3)
 * RÔLE : Gestion des textes légaux et obligations territoriales
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback, useMemo, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  Plus, CheckCircle, XCircle, Search, Calendar, ShieldCheck, 
  X, Save, Loader2, Scale, Activity, BookOpen, RefreshCw, ChevronRight, Download,
  AlertTriangle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type ComplianceStatus = 'A_RESPECTER' | 'RESPECTEE' | 'NON_CONFORME' | 'EN_COURS';
export type LegalCategory = 'Travail' | 'Environnement' | 'Fiscalité' | 'Social' | 'Sécurité' | 'Qualité' | 'AUTRE';

export interface SenegalLegalRequirement {
  SLR_Id?: string;
  SLR_Category: LegalCategory;
  SLR_Title: string;
  SLR_Description: string;
  SLR_Reference: string;
  SLR_Authority: string;
  SLR_Deadline: string | null;
  SLR_Evidence: string;
  SLR_Status: ComplianceStatus;
  SLR_CreatedAt?: string;
  SLR_UpdatedAt?: string;
}

export interface LegalStats {
  total: number;
  compliant: number;
  nonCompliant: number;
  rate: number;
}

export interface KPIBoxProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'rose' | 'amber';
}

export interface StatusBadgeProps {
  status: ComplianceStatus;
}

export interface SDEInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: string;
}

export interface SDESelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_FORM: SenegalLegalRequirement = {
  SLR_Category: 'Travail', SLR_Title: '', SLR_Description: '',
  SLR_Reference: '', SLR_Authority: '', SLR_Deadline: null, SLR_Evidence: '',
  SLR_Status: 'A_RESPECTER'
};

const LEGAL_CATEGORIES: LegalCategory[] = ['Travail', 'Environnement', 'Fiscalité', 'Social', 'Sécurité', 'Qualité', 'AUTRE'];

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI BOX
// ============================================================================

function KPIBox({ label, value, icon, color }: KPIBoxProps) {
  const c: Record<KPIBoxProps['color'], string> = { 
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20", 
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", 
    rose: "text-red-400 bg-red-500/10 border-red-500/20", 
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20" 
  };
  
  return (
    <article className={cn("p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border flex items-center justify-between shadow-2xl transition-all hover:scale-[1.02] focus-within:ring-2 focus-within:ring-blue-400", c[color])}>
      <div className="flex items-center gap-3 md:gap-4">
        <div className="p-3 md:p-4 bg-black/40 rounded-xl md:rounded-2xl shadow-inner text-white">
          {icon}
        </div>
        <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 italic tracking-widest m-0 text-left hidden lg:inline">{label}</span>
      </div>
      <span className="text-3xl md:text-4xl font-black italic m-0 text-white leading-none tracking-tighter drop-shadow-md">{value}</span>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : STATUS BADGE
// ============================================================================

function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<ComplianceStatus, string> = {
    'A_RESPECTER': 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    'RESPECTEE': 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    'NON_CONFORME': 'text-red-400 border-red-500/30 bg-red-500/10',
    'EN_COURS': 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  };
  
  return (
    <span className={cn(
      "px-4 md:px-6 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] border uppercase font-black italic tracking-widest shadow-inner inline-flex justify-center min-w-[120px] md:min-w-[140px]",
      config[status]
    )}>
      {status.replace('_', ' ')}
    </span>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SDE INPUT
// ============================================================================

function SDEInput({ label, value, onChange, placeholder, required, error, type = 'text' }: SDEInputProps) {
  return (
    <div className="space-y-2 md:space-y-3 text-left w-full">
      <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4 italic m-0 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input 
        type={type}
        value={value || ""} 
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        placeholder={placeholder}
        required={required}
        className={cn(
          "w-full bg-black/40 border-2 rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 text-[11px] md:text-[12px] font-black text-white outline-none italic focus:border-blue-500 focus:bg-white/5 transition-all uppercase shadow-inner",
          error ? "border-red-500/50" : "border-white/5"
        )}
        aria-required={required}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertTriangle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SDE SELECT
// ============================================================================

function SDESelect({ label, value, onChange, children, required, error }: SDESelectProps) {
  return (
    <div className="space-y-2 md:space-y-3 text-left w-full relative">
      <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4 italic m-0 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <select 
          value={value || ""} 
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)} 
          required={required}
          className={cn(
            "w-full bg-black/40 border-2 rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 text-[11px] md:text-[12px] font-black text-white outline-none italic focus:border-blue-500 focus:bg-white/5 appearance-none cursor-pointer shadow-inner pr-10 md:pr-12",
            error ? "border-red-500/50" : "border-white/5"
          )}
          aria-required={required}
          aria-invalid={!!error}
        >
          {children}
        </select>
        <div className="absolute right-4 md:right-6 bottom-4 md:bottom-5 lg:bottom-6 pointer-events-none text-blue-400" aria-hidden="true">
          <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertTriangle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SenegalLegalPage() {
  const [requirements, setRequirements] = useState<SenegalLegalRequirement[]>([]);
  const [stats, setStats] = useState<LegalStats>({ total: 0, compliant: 0, nonCompliant: 0, rate: 100 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<SenegalLegalRequirement>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SenegalLegalRequirement, string>>>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<SenegalLegalRequirement[]>('/senegal-legal');
      const rawContent = res.data;
      const reqs: SenegalLegalRequirement[] = Array.isArray(rawContent) 
        ? rawContent 
        : (Array.isArray(rawContent?.data) ? rawContent.data : []);
      
      setRequirements(reqs);

      const total = reqs.length;
      const compliant = reqs.filter(r => r.SLR_Status === 'RESPECTEE').length;
      setStats({
        total,
        compliant,
        nonCompliant: reqs.filter(r => r.SLR_Status === 'NON_CONFORME').length,
        rate: total > 0 ? Math.round((compliant / total) * 100) : 100
      });
    } catch (error) {
      console.error('❌ Erreur chargement exigences légales:', error);
      toast.error('RUPTURE KERNEL : Référentiel Sénégal Légal inaccessible.');
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase().trim();
    return requirements.filter(r => 
      r.SLR_Title?.toLowerCase().includes(t) || 
      r.SLR_Reference?.toLowerCase().includes(t)
    );
  }, [requirements, searchTerm]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof SenegalLegalRequirement, string>> = {};
    
    if (!formData.SLR_Title.trim()) {
      errors.SLR_Title = "Le libellé du texte est requis";
    }
    if (!formData.SLR_Reference.trim()) {
      errors.SLR_Reference = "La référence du texte est requise";
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
    
    setSubmitting(true);
    const toastId = toast.loading("SCELLAGE DE L'EXIGENCE LÉGALE...");
    try {
      const payload = { 
        ...formData, 
        SLR_Deadline: formData.SLR_Deadline || null,
        SLR_Title: formData.SLR_Title.toUpperCase(),
        SLR_Reference: formData.SLR_Reference.toUpperCase(),
        SLR_Authority: formData.SLR_Authority.toUpperCase(),
        SLR_Evidence: formData.SLR_Evidence.toLowerCase()
      };
      await apiClient.post('/senegal-legal', payload);
      toast.success('EXIGENCE INDEXÉE DANS LE REGISTRE SDE.', { id: toastId });
      setIsModalOpen(false);
      setFormErrors({});
      setFormData(DEFAULT_FORM);
      fetchData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || 'ERREUR DE SCELLAGE', { id: toastId });
    } finally { 
      setSubmitting(false); 
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
    setFormData(DEFAULT_FORM);
  };

  const updateForm = useCallback((field: keyof SenegalLegalRequirement, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof SenegalLegalRequirement]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  // Close modal on Escape
  useEffect(() => {
    if (!isModalOpen || typeof window === 'undefined') return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [isModalOpen]);

  if (loading && requirements.length === 0 && typeof window !== 'undefined') {
    return <LoadingScreen label="Synchronisation Matrix Sénégal..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex flex-wrap gap-2 md:gap-3">
            <span className="bg-emerald-600/10 border border-emerald-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] text-emerald-400 tracking-widest italic shadow-inner">
              Veille Sénégal
            </span>
            <span className="bg-blue-600/10 border border-blue-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] text-blue-400 tracking-widest italic shadow-inner">
              ISO 9001 §6.1.3
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic flex items-center gap-3 md:gap-4 lg:gap-5">
            <Scale className="text-blue-400 w-8 h-8 md:w-10 md:h-10 lg:w-10 lg:h-10" strokeWidth={2.5} aria-hidden="true" /> 
            Conformité <span className="text-blue-400">Légale</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <div className="relative flex-1 xl:flex-none group">
            <label htmlFor="legal-search" className="sr-only">Rechercher une exigence légale</label>
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-400 transition-all pointer-events-none w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
            <input 
              id="legal-search"
              value={searchTerm} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
              placeholder="SCANNER RÉFÉRENTIEL..." 
              className="w-full xl:w-64 lg:w-80 bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] py-2.5 md:py-3 lg:py-5 pl-10 md:pl-16 pr-4 md:pr-6 lg:pr-8 text-[9px] md:text-[10px] lg:text-[11px] font-black italic text-white outline-none focus:border-blue-500 shadow-inner uppercase"
              aria-label="Filtrer les exigences légales par titre ou référence"
            />
          </div>
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)} 
            className="flex-1 xl:flex-none bg-blue-600 hover:bg-white hover:text-blue-700 px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] shadow-2xl border-none cursor-pointer text-white italic transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3 tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Indexer une nouvelle exigence légale"
          >
            <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" strokeWidth={3} aria-hidden="true" /> 
            <span className="hidden sm:inline">Indexer Exigence</span>
          </button>
        </div>
      </header>

      {/* 📊 KPI BAR */}
      <section className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 bg-[#0B1222]/50 border-b border-white/5" role="list" aria-label="Statistiques de conformité légale">
        <KPIBox label="Registre Légal" value={stats.total} icon={<BookOpen size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />} color="blue" />
        <KPIBox label="Textes Conformés" value={stats.compliant} icon={<CheckCircle size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />} color="emerald" />
        <KPIBox label="Écarts Détectés" value={stats.nonCompliant} icon={<XCircle size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />} color="rose" />
        <KPIBox label="Indice de Maîtrise" value={`${stats.rate}%`} icon={<Activity size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />} color="amber" />
      </section>

      {/* 🏛️ LEGAL DATAMATRIX */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <article className="max-w-[100rem] mx-auto bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] overflow-hidden shadow-2xl relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full md:min-w-[250px]" role="table" aria-label="Registre des exigences légales">
              <thead className="sticky top-0 bg-[#0F172A] z-10 border-b-2 border-white/5">
                <tr className="text-[8px] md:text-[9px] lg:text-[10px] text-slate-500 uppercase font-black italic tracking-widest">
                  <th className="px-6 md:px-8 lg:px-10 py-4 md:py-6 lg:py-8" scope="col">Référence & Texte</th>
                  <th className="px-4 md:px-6 py-4 md:py-6 lg:py-8" scope="col">Autorité Régulatrice</th>
                  <th className="px-4 md:px-6 py-4 md:py-6 lg:py-8" scope="col">Échéance</th>
                  <th className="px-4 md:px-6 py-4 md:py-6 lg:py-8 text-center" scope="col">Statut SMI</th>
                  <th className="px-6 md:px-8 lg:px-10 py-4 md:py-6 lg:py-8 text-right" scope="col">
                    <button 
                      type="button"
                      onClick={fetchData} 
                      disabled={loading}
                      className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl text-slate-500 hover:text-blue-400 border-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                      aria-label="Actualiser le registre"
                    >
                      <RefreshCw size={16} className={cn("w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5", loading ? "animate-spin" : "")} aria-hidden="true" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-white/5">
                {filtered.length > 0 ? filtered.map(req => (
                  <tr key={req.SLR_Id} className="group hover:bg-blue-600/5 transition-all italic focus-within:bg-blue-600/5 focus:outline-none" role="row">
                    <td className="px-6 md:px-8 lg:px-10 py-4 md:py-6 max-w-xl">
                      <div className="flex flex-col gap-1 md:gap-2">
                        <span className="text-[8px] md:text-[9px] font-black text-blue-400 tracking-widest">{req.SLR_Category}</span>
                        <span className="text-[11px] md:text-sm font-black text-white uppercase tracking-tighter truncate group-hover:text-blue-400 transition-colors">{req.SLR_Title}</span>
                        <span className="text-[9px] md:text-[10px] text-slate-500 font-bold normal-case tracking-wider">{req.SLR_Reference}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6 whitespace-nowrap">
                      <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase italic tracking-widest">{req.SLR_Authority || "N/A"}</span>
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6">
                      {req.SLR_Deadline ? (
                        <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] lg:text-[11px] font-black text-amber-400 bg-amber-500/10 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-amber-500/20 w-fit">
                          <Calendar size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" /> 
                          {new Date(req.SLR_Deadline).toLocaleDateString('fr-SN')}
                        </div>
                      ) : (
                        <span className="text-[8px] md:text-[9px] font-black text-slate-600 tracking-widest bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-white/5 uppercase">
                          Permanente
                        </span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-4 md:py-6 text-center">
                      <StatusBadge status={req.SLR_Status} />
                    </td>
                    <td className="px-6 md:px-8 lg:px-10 py-4 md:py-6 text-right">
                      <button 
                        type="button"
                        className="p-2 md:p-3 lg:p-4 bg-white/5 rounded-lg md:rounded-xl lg:rounded-2xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label={`Vérifier la conformité de: ${req.SLR_Title}`}
                      >
                        <ShieldCheck size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 md:px-8 lg:px-10 py-12 md:py-16 lg:py-20 text-center text-slate-500" role="status">
                      <Scale size={48} className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                      <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest italic opacity-50">
                        {searchTerm ? 'Aucune exigence ne correspond à la recherche' : 'Aucune exigence détectée dans ce périmètre'}
                      </p>
                      {!searchTerm && (
                        <button 
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="mt-3 md:mt-4 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
                        >
                          Créer votre première exigence
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </main>

      {/* 🛡️ FOOTER */}
      <footer className="shrink-0 bg-[#0B0F1A] border-t border-white/5 px-4 md:px-6 py-3 md:py-4 lg:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-blue-400 font-black text-[9px] md:text-[10px] tracking-widest uppercase italic">
          <ShieldCheck size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
          Matrice Légale Territoriale Scellée • Sénégal RD-2026
        </div>
        <div 
          className="text-[8px] md:text-[9px] lg:text-[10px] text-slate-500 font-black uppercase tracking-widest italic"
          role="img"
          aria-label={`Indice de conformité légale: ${stats.rate}%`}
        >
          Indice de Conformité Légale: {stats.rate}%
        </div>
      </footer>

      {/* 📟 MODAL */}
      {isModalOpen && typeof window !== 'undefined' && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-6 lg:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <form onSubmit={handleSubmit} className="bg-[#0B0F1A] border-2 border-white/10 rounded-2xl md:rounded-3xl lg:rounded-[4rem] w-full max-w-3xl lg:max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden italic font-black uppercase">
            
            <header className="px-6 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
              <div className="text-left space-y-1 md:space-y-2">
                <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl font-black italic m-0 tracking-tighter uppercase">
                  Indexation <span className="text-blue-400">Légale</span>
                </h2>
                <p className="text-[9px] md:text-[10px] text-slate-600 tracking-widest m-0 font-black italic uppercase">
                  CONFORMITÉ RÉGLEMENTAIRE §6.1.3
                </p>
              </div>
              <button 
                type="button"
                onClick={closeModal} 
                className="p-2 md:p-3 lg:p-5 bg-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl text-slate-500 hover:text-white border-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Fermer"
              >
                <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 lg:px-12 py-6 md:py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-2 gap-x-6 md:gap-x-8 lg:gap-x-12 gap-y-4 md:gap-y-5 lg:gap-y-6">
              <SDEInput 
                label="Libellé du Texte (Titre)" 
                value={formData.SLR_Title} 
                onChange={(v) => updateForm('SLR_Title', v.toUpperCase())} 
                placeholder="EX: LOI N° 2024-001"
                required
                error={formErrors.SLR_Title}
              />
              <SDESelect 
                label="Domaine Applicatif" 
                value={formData.SLR_Category} 
                onChange={(v) => updateForm('SLR_Category', v)}
                required
              >
                {LEGAL_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0B0F1A] text-white">{c.toUpperCase()}</option>)}
              </SDESelect>
              <SDEInput 
                label="Référence du Texte (Loi / Décret)" 
                value={formData.SLR_Reference} 
                onChange={(v) => updateForm('SLR_Reference', v.toUpperCase())} 
                placeholder="EX: JO N° 12345"
                required
                error={formErrors.SLR_Reference}
              />
              <SDEInput 
                label="Autorité de Régulation" 
                value={formData.SLR_Authority} 
                onChange={(v) => updateForm('SLR_Authority', v.toUpperCase())} 
                placeholder="EX: DGID"
              />
              
              <div className="space-y-2 md:space-y-3 text-left w-full">
                <label htmlFor="slr-deadline" className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4 italic m-0 block">
                  Échéance de Conformité
                </label>
                <input 
                  id="slr-deadline"
                  type="date" 
                  value={formData.SLR_Deadline || ""} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('SLR_Deadline', e.target.value)} 
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black text-white outline-none focus:border-blue-500 italic uppercase"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <SDEInput 
                label="Lien Preuve (URL Journal Officiel)" 
                value={formData.SLR_Evidence} 
                onChange={(v) => updateForm('SLR_Evidence', v.toLowerCase())} 
                placeholder="https://..."
                type="url"
              />
            </div>

            <footer className="px-6 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-4 md:gap-6 bg-black/40 shrink-0">
              <button 
                type="button"
                onClick={closeModal} 
                className="px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6 bg-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] text-slate-500 font-black uppercase text-[10px] md:text-[11px] lg:text-[12px] tracking-widest border-none cursor-pointer hover:bg-white hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Abandonner
              </button>
              <button 
                type="submit" 
                disabled={submitting} 
                className={cn(
                  "px-8 md:px-12 lg:px-16 py-4 md:py-5 lg:py-6 bg-blue-600 text-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase text-[10px] md:text-[11px] lg:text-[12px] tracking-widest italic shadow-2xl border-none cursor-pointer hover:bg-white hover:text-blue-700 transition-all flex items-center justify-center gap-3 md:gap-4 focus:outline-none focus:ring-2 focus:ring-blue-400",
                  submitting && "opacity-30 cursor-not-allowed"
                )}
                aria-busy={submitting}
              >
                {submitting ? (
                  <><Loader2 size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">SCELLAGE EN COURS...</span></>
                ) : (
                  <><Save size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" strokeWidth={3} aria-hidden="true" /> <span className="hidden sm:inline">Sceller l&apos;Exigence</span></>
                )}
              </button>
            </footer>
          </form>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}