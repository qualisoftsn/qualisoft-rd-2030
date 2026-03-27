/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : REGISTRE ET PLANIFICATION DES AUDITS (ISO 9001 §9.2)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage stratégique des missions d'audit (ISO 9001, 14001, 45001)
 * VERSION : 3.0 - Typing strict Prisma + Design Elite + Accessibilité + CRUD complet
 * API : apiClient Axios avec interceptors (Bearer + X-Tenant-Id)
 * RÉVISION : 19 Mars 2026 | Production OVH
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useState, useCallback, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ClipboardCheck, MapPin, Plus, Calendar, Loader2, FolderTree, 
  FileText, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';
import apiClient, { type ApiError } from '@/core/api/api-client';

// ============================================================================
// TYPES & INTERFACES (Strict Typing - Prisma aligned)
// ============================================================================

// Basé sur model Processus du schema.prisma
export interface Processus {
  PR_Id: string;
  PR_Libelle: string;
  PR_Code?: string;
  PR_Actif?: boolean;
}

// Basé sur model Site du schema.prisma
export interface Site {
  S_Id: string;
  S_Name: string;
  S_Code?: string;
  S_Actif?: boolean;
}

// Basé sur model Audit du schema.prisma
export interface Audit {
  AU_Id: string;
  AU_Title: string;
  AU_Reference: string;
  AU_DateAudit: string; // ISO string
  AU_Status: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  AU_Site?: Site | null;
  AU_Processus?: Processus | null;
  AU_Scope?: string;
  AU_CreatedAt?: string;
  AU_UpdatedAt?: string;
  tenantId?: string;
}

export interface AuditFormData {
  AU_Title: string;
  AU_Reference: string;
  AU_DateAudit: string;
  AU_Scope: string;
  AU_SiteId: string;
  AU_ProcessusId: string;
}

// ============================================================================
// CONFIGURATION DES STATUTS
// ============================================================================

interface StatusConfig {
  label: string;
  color: string;
}

const STATUS_CONFIG: Record<Audit['AU_Status'], StatusConfig> = {
  PLANIFIE: { label: 'Planifié', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  EN_COURS: { label: 'En cours', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  TERMINE: { label: 'Terminé', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  ANNULE: { label: 'Annulé', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

// ============================================================================
// UTILITAIRES (Pure Functions - SSR Safe)
// ============================================================================

const generateReference = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `AUD-${year}-${random}`;
};

const formatDateFR = (dateString?: string): string => {
  if (!dateString) return 'Date non fixée';
  try {
    return new Date(dateString).toLocaleDateString('fr-SN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// ============================================================================
// SOUS-COMPOSANT : BADGE
// ============================================================================

interface BadgeProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
}

function Badge({ icon, text, className }: BadgeProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 bg-[#0B0F1A] border border-white/5 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-widest italic truncate max-w-[150px]",
      className
    )}>
      <span className="text-blue-400 shrink-0" aria-hidden="true">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : AUDIT CARD
// ============================================================================

interface AuditCardProps {
  audit: Audit;
}

function AuditCard({ audit }: AuditCardProps) {
  const status = STATUS_CONFIG[audit.AU_Status];

  return (
    <article 
      className="p-6 md:p-8 bg-[#0F172A] rounded-2xl md:rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden focus-within:border-blue-500/30"
      role="article"
      aria-labelledby={`audit-title-${audit.AU_Id}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" aria-hidden="true" />
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
        <div className="space-y-4 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-black bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full uppercase tracking-widest">
              REF: {audit.AU_Reference}
            </span>
            <span className={cn("text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-wider border", status.color)}>
              {status.label}
            </span>
          </div>
          
          <h3 
            id={`audit-title-${audit.AU_Id}`}
            className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-white m-0 group-hover:text-blue-400 transition-colors truncate"
          >
            {audit.AU_Title}
          </h3>
          
          <div className="flex flex-wrap gap-2 md:gap-3">
            {audit.AU_Site && (
              <Badge icon={<MapPin size={12} className="w-3 h-3" aria-hidden="true" />} text={audit.AU_Site.S_Name} />
            )}
            {audit.AU_Processus && (
              <Badge icon={<FolderTree size={12} className="w-3 h-3" aria-hidden="true" />} text={audit.AU_Processus.PR_Libelle} />
            )}
            <Badge icon={<Calendar size={12} className="w-3 h-3" aria-hidden="true" />} text={formatDateFR(audit.AU_DateAudit)} />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <Link 
            href={`/dashboard/audits/${audit.AU_Id}/preuves`}
            className="flex-1 sm:flex-none px-4 py-3 bg-[#0B0F1A] rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center gap-2 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-inner no-underline focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={`Voir les preuves pour l'audit: ${audit.AU_Title}`}
          >
            <FileText size={18} className="w-4.5 h-4.5" aria-hidden="true" />
            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Preuves</span>
          </Link>
          <Link 
            href={`/dashboard/audits/${audit.AU_Id}/rapport`}
            className="flex-1 sm:flex-none px-4 md:px-6 py-3 md:py-4 bg-blue-600 text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 hover:bg-white hover:text-blue-900 transition-all border-none no-underline focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={`Voir le rapport pour l'audit: ${audit.AU_Title}`}
          >
            <span className="hidden sm:inline">Rapport</span>
            <ArrowRight size={16} className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : AUDITS PAGE
// ============================================================================

export default function AuditsPage() {
  const router = useRouter();
  
  const [audits, setAudits] = useState<Audit[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [formData, setFormData] = useState<AuditFormData>({
    AU_Title: '',
    AU_Reference: generateReference(),
    AU_DateAudit: '',
    AU_Scope: '',
    AU_SiteId: '',
    AU_ProcessusId: '',
  });
  
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AuditFormData, string>>>({});

  // ============================================================================
  // FETCH DATA (CRUD: READ)
  // ============================================================================

  const fetchAudits = useCallback(async (): Promise<Audit[]> => {
    const response = await apiClient.get<Audit[]>('/audits');
    return Array.isArray(response.data) ? response.data : [];
  }, []);

  const fetchSites = useCallback(async (): Promise<Site[]> => {
    try {
      const response = await apiClient.get<Site[]>('/sites');
      return Array.isArray(response.data) 
        ? response.data.filter(s => s.S_Actif !== false) 
        : [];
    } catch { 
      return []; 
    }
  }, []);

  const fetchProcesses = useCallback(async (): Promise<Processus[]> => {
    try {
      const response = await apiClient.get<Processus[]>('/processus');
      return Array.isArray(response.data) 
        ? response.data.filter(p => p.PR_Actif !== false) 
        : [];
    } catch { 
      return []; 
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [auditsData, sitesData, processesData] = await Promise.allSettled([
        fetchAudits(), fetchSites(), fetchProcesses(),
      ]);

      if (auditsData.status === 'fulfilled') setAudits(auditsData.value);
      else toast.error("Impossible de charger la liste des audits");
      
      if (sitesData.status === 'fulfilled') setSites(sitesData.value);
      if (processesData.status === 'fulfilled') setProcesses(processesData.value);
      
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      toast.error("Échec de synchronisation du registre SDE");
    } finally {
      setLoading(false);
    }
  }, [fetchAudits, fetchSites, fetchProcesses]);

  useEffect(() => { 
    if (typeof window !== 'undefined') {
      fetchData(); 
    }
  }, [fetchData]);

  // ============================================================================
  // FORM HANDLERS (CRUD: CREATE)
  // ============================================================================

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof AuditFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [formErrors]);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof AuditFormData, string>> = {};
    if (!formData.AU_Title.trim()) errors.AU_Title = 'Le titre est requis';
    if (!formData.AU_DateAudit) errors.AU_DateAudit = 'La date est requise';
    if (!formData.AU_SiteId) errors.AU_SiteId = 'Sélectionnez un site';
    if (!formData.AU_ProcessusId) errors.AU_ProcessusId = 'Sélectionnez un processus';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading("Planification de la mission d'audit...");
    
    try {
      await apiClient.post<Audit>('/audits', formData);
      
      toast.success("Audit programmé avec succès", { 
        id: toastId,
        action: { label: 'Voir', onClick: () => router.push('/dashboard/audits') },
      });
      
      setFormData({
        AU_Title: '',
        AU_Reference: generateReference(),
        AU_DateAudit: '',
        AU_Scope: '',
        AU_SiteId: '',
        AU_ProcessusId: '',
      });
      await fetchData();
      
    } catch (error: unknown) {
      console.error('❌ Erreur création audit:', error);
      
      const apiError = error as { response?: { data?: ApiError }; message?: string };
      const message = apiError?.response?.data?.message || apiError?.message || "Erreur de programmation";
      
      if (apiError?.response?.data && typeof apiError.response.data === 'object' && 'errors' in apiError.response.data) {
        const errors = (apiError.response.data as { errors?: Partial<Record<keyof AuditFormData, string>> }).errors;
        if (errors) setFormErrors(errors);
      }
      
      toast.error(message, { id: toastId, duration: 6000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const toastId = toast.loading("Synchronisation...");
    try {
      await fetchData();
      toast.success("Registre mis à jour", { id: toastId });
    } catch {
      toast.error("Échec de la synchronisation", { id: toastId });
    } finally {
      setIsRefreshing(false);
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading && audits.length === 0 && typeof window !== 'undefined') {
    return (
      <div 
        className="flex h-full items-center justify-center bg-[#0B0F1A] text-blue-400 font-black italic uppercase gap-4" 
        role="status" 
        aria-live="polite"
      >
        <Loader2 className="animate-spin w-10 h-10" aria-hidden="true" />
        <span>Synchronisation du Plan d&apos;Audit...</span>
      </div>
    );
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase italic tracking-tighter leading-none m-0 text-white">
            Gestion des <span className="text-blue-500">Audits</span>
          </h1>
          <p className="text-slate-500 font-black text-[8px] md:text-[9px] uppercase tracking-widest mt-1.5 md:mt-2 m-0">
            SURVEILLANCE DU SYSTÈME DE MANAGEMENT INTÉGRÉ
          </p>
        </div>
        <button 
          type="button"
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
          aria-label="Rafraîchir la liste des audits"
        >
          <RefreshCw size={18} className={cn("w-4.5 h-4.5", isRefreshing && "animate-spin")} aria-hidden="true" />
          <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest">
            {isRefreshing ? 'Sync...' : 'Actualiser'}
          </span>
        </button>
      </header>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        
        {/* FORMULAIRE */}
        <aside className="w-full xl:w-80 lg:w-96 p-4 md:p-6 lg:p-8 bg-[#0F172A]/50 border-r border-white/5 overflow-y-auto custom-scrollbar shrink-0" aria-label="Formulaire de planification d'audit">
          <h2 className="text-lg md:text-xl font-black uppercase italic mb-5 md:mb-6 flex items-center gap-3 m-0 text-white">
            <Plus className="text-blue-400 w-5 h-5 md:w-6 md:h-6" aria-hidden="true" /> Planifier
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5" noValidate>
            {/* Titre */}
            <div className="space-y-2">
              <label htmlFor="AU_Title" className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">
                Titre de la mission <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <input 
                id="AU_Title" 
                name="AU_Title" 
                required 
                placeholder="ex: Audit Interne Qualité Q1" 
                className={cn(
                  "w-full bg-[#0B0F1A] border rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-[11px] font-bold outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] text-white transition-all shadow-inner",
                  formErrors.AU_Title ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30" : "border-white/10 focus:border-blue-500 focus:ring-blue-500/30"
                )}
                value={formData.AU_Title} 
                onChange={handleInputChange}
                aria-required="true" 
                aria-invalid={!!formErrors.AU_Title}
                aria-describedby={formErrors.AU_Title ? "AU_Title-error" : undefined}
              />
              {formErrors.AU_Title && (
                <p id="AU_Title-error" className="text-rose-400 text-[9px] ml-2 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.AU_Title}
                </p>
              )}
            </div>
            
            {/* Référence */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">Référence (auto)</label>
              <input 
                type="text" 
                readOnly 
                className="w-full bg-[#0B0F1A]/50 border border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-[11px] font-bold text-slate-400 cursor-not-allowed" 
                value={formData.AU_Reference} 
                aria-readonly="true" 
              />
            </div>
            
            {/* Date */}
            <div className="space-y-2">
              <label htmlFor="AU_DateAudit" className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">
                Date d&apos;audit <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <input 
                id="AU_DateAudit" 
                name="AU_DateAudit" 
                type="date" 
                required 
                className={cn(
                  "w-full bg-[#0B0F1A] border rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-[11px] font-bold outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] text-white transition-all",
                  formErrors.AU_DateAudit ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30" : "border-white/10 focus:border-blue-500 focus:ring-blue-500/30"
                )}
                value={formData.AU_DateAudit} 
                onChange={handleInputChange}
                aria-required="true"
              />
              {formErrors.AU_DateAudit && (
                <p className="text-rose-400 text-[9px] ml-2 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.AU_DateAudit}
                </p>
              )}
            </div>
            
            {/* Processus */}
            <div className="space-y-2">
              <label htmlFor="AU_ProcessusId" className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">
                Processus Cible <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <select 
                id="AU_ProcessusId" 
                name="AU_ProcessusId" 
                required 
                className={cn(
                  "w-full bg-[#0B0F1A] border rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-[11px] font-bold outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] text-white cursor-pointer appearance-none",
                  formErrors.AU_ProcessusId ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30" : "border-white/10 focus:border-blue-500 focus:ring-blue-500/30"
                )}
                value={formData.AU_ProcessusId} 
                onChange={handleInputChange}
                aria-required="true"
              >
                <option value="" className="bg-[#0B0F1A] text-slate-500">-- Sélectionner --</option>
                {processes.map(p => (
                  <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0B0F1A] text-white">{p.PR_Libelle}</option>
                ))}
              </select>
              {formErrors.AU_ProcessusId && (
                <p className="text-rose-400 text-[9px] ml-2 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.AU_ProcessusId}
                </p>
              )}
            </div>
            
            {/* Site */}
            <div className="space-y-2">
              <label htmlFor="AU_SiteId" className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">
                Site concerné <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <select 
                id="AU_SiteId" 
                name="AU_SiteId" 
                required 
                className={cn(
                  "w-full bg-[#0B0F1A] border rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-[11px] font-bold outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] text-white cursor-pointer appearance-none",
                  formErrors.AU_SiteId ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30" : "border-white/10 focus:border-blue-500 focus:ring-blue-500/30"
                )}
                value={formData.AU_SiteId} 
                onChange={handleInputChange}
                aria-required="true"
              >
                <option value="" className="bg-[#0B0F1A] text-slate-500">-- Sélectionner --</option>
                {sites.map(s => (
                  <option key={s.S_Id} value={s.S_Id} className="bg-[#0B0F1A] text-white">{s.S_Name}</option>
                ))}
              </select>
              {formErrors.AU_SiteId && (
                <p className="text-rose-400 text-[9px] ml-2 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.AU_SiteId}
                </p>
              )}
            </div>
            
            {/* Scope */}
            <div className="space-y-2">
              <label htmlFor="AU_Scope" className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 block">Périmètre (optionnel)</label>
              <textarea 
                id="AU_Scope" 
                name="AU_Scope" 
                placeholder="Décrire le périmètre spécifique..." 
                className="w-full bg-[#0B0F1A] border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 text-[10px] md:text-[11px] font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white transition-all shadow-inner resize-none min-h-[80px]"
                value={formData.AU_Scope} 
                onChange={handleInputChange} 
              />
            </div>
            
            {/* Submit */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={cn(
                "w-full py-4 md:py-5 mt-4 md:mt-6 bg-blue-600 hover:bg-white hover:text-blue-900 text-white rounded-xl md:rounded-2xl font-black uppercase italic text-[10px] md:text-[11px] shadow-xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-none flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
                isSubmitting && "cursor-wait"
              )}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin w-4 h-4" aria-hidden="true" />
                  <span>Programmation...</span>
                </>
              ) : (
                <>
                  <Calendar size={18} className="w-4.5 h-4.5" aria-hidden="true" />
                  <span>Programmer l&apos;Audit</span>
                </>
              )}
            </button>
          </form>
        </aside>

        {/* REGISTRE */}
        <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 xl:px-12 py-5 md:py-6" aria-label="Registre des audits">
          <div className="flex items-center justify-between mb-5 md:mb-6">
            <h2 className="text-lg md:text-xl font-black uppercase italic flex items-center gap-3 m-0 text-white">
              <ClipboardCheck className="text-blue-400 w-6 h-6 md:w-7 md:h-7" aria-hidden="true" /> 
              Registre Souverain <span className="text-slate-500 font-normal not-italic text-sm md:text-base">({audits.length})</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:gap-6" role="list">
            {audits.length > 0 ? (
              audits.map((audit) => (
                <AuditCard key={audit.AU_Id} audit={audit} />
              ))
            ) : (
              <div 
                className="h-40 md:h-48 border-2 border-dashed border-white/10 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-slate-500" 
                role="status" 
                aria-live="polite"
              >
                <ClipboardCheck size={40} className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                <p className="uppercase font-black text-[9px] md:text-[10px] tracking-widest m-0 text-center px-4">
                  {loading ? 'Chargement du registre...' : 'Aucun audit planifié dans le SMI'}
                </p>
                {!loading && (
                  <p className="text-[8px] md:text-[9px] text-slate-600 mt-2 text-center">
                    Utilisez le formulaire pour créer votre premier audit
                  </p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* GLOBAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(37, 99, 235, 0.3); 
          border-radius: 10px; 
        }
        :focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}