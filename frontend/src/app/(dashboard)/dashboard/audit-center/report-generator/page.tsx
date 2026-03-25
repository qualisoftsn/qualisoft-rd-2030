/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : GÉNÉRATEUR DE RAPPORTS SDE (ISO 9001 §9.2)
 * -------------------------------------------------------------------------
 * RÔLE : Production de rapports PDF d'Audit normatifs (ISO 9001, 14001, etc.)
 * VERSION : 3.0 - Typing strict Prisma + Design Elite + Accessibilité + Export sécurisé
 * API : apiClient avec interceptors (Bearer + X-Tenant-Id)
 * RÉVISION : 19 Mars 2026 | Production OVH
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import type { LucideIcon } from 'lucide-react';
import { 
  FileText, Download, Printer, Users, Target, CheckCircle, 
  AlertTriangle, ChevronDown, Search, Loader2, Leaf, RefreshCw, Calendar,
  Info
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES (Strict Typing - Prisma aligned)
// ============================================================================

// Basé sur model User du schema.prisma
export interface AuditLeadRef {
  U_Id?: string;
  U_FirstName?: string;
  U_LastName?: string;
  U_Email?: string;
}

// Basé sur model NonConformite du schema.prisma (référence légère)
export interface NonConformiteRef {
  NC_Id: string;
  NC_Libelle: string;
  NC_Gravite: 'MINEURE' | 'MAJEURE' | 'CRITIQUE';
}

// Basé sur model Audit du schema.prisma
export interface Audit {
  AU_Id: string;
  AU_Reference: string;
  AU_Title: string;
  AU_Scope: string;
  AU_Type: 'INTERNE' | 'EXTERNE' | 'CERTIFICATION' | 'SURVEILLANCE' | 'TIERCE_PARTIE';
  AU_Status: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  AU_DateAudit: string; // ISO string
  AU_Lead?: AuditLeadRef;
  AU_NonConformites?: NonConformiteRef[];
  tenantId: string;
}

export interface TemplateOption {
  id: string;
  label: string;
  description: string;
  isoClause?: string;
  icon: LucideIcon;
  color: string;
}

export interface FilterState {
  search: string;
  type: Audit['AU_Type'] | 'ALL';
}

// ============================================================================
// CONFIGURATION DES TEMPLATES
// ============================================================================

const TEMPLATES: TemplateOption[] = [
  { 
    id: 'ISO_9001', 
    label: 'ISO 9001:2015 - Qualité',
    description: 'Rapport d\'audit conforme §9.2 / §10.2',
    isoClause: '§9.2 / §10.2',
    icon: Target, 
    color: 'text-blue-500' 
  },
  { 
    id: 'ISO_14001', 
    label: 'ISO 14001:2015 - Environnement',
    description: 'Rapport d\'audit environnemental §9.1 / §10.2',
    isoClause: '§9.1 / §10.2',
    icon: Leaf, 
    color: 'text-emerald-500' 
  },
  { 
    id: 'LEGAL_SENEGAL', 
    label: 'Conformité Légale Sénégal',
    description: 'Vérification Code Environnement & Travail',
    isoClause: 'Loi sénégalaise',
    icon: FileText, 
    color: 'text-amber-500' 
  },
  { 
    id: 'NON_CONFORMITE', 
    label: 'Rapport de Non-Conformité',
    description: 'Analyse CAPA et plan d\'actions correctives',
    isoClause: '§10.2',
    icon: AlertTriangle, 
    color: 'text-red-500' 
  },
  { 
    id: 'REVUE_DIRECTION', 
    label: 'Revue de Direction',
    description: 'Synthèse stratégique pour le comité de pilotage',
    isoClause: '§9.3',
    icon: Users, 
    color: 'text-purple-500' 
  }
];

const AUDIT_TYPES: Array<{ value: Audit['AU_Type'] | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Tous les types' },
  { value: 'INTERNE', label: 'Audit Interne' },
  { value: 'EXTERNE', label: 'Audit Externe' },
  { value: 'CERTIFICATION', label: 'Certification' },
  { value: 'SURVEILLANCE', label: 'Surveillance' },
  { value: 'TIERCE_PARTIE', label: 'Tierce Partie' },
];

// ============================================================================
// UTILITAIRES (Pure Functions - SSR Safe)
// ============================================================================

const formatDateFR = (dateString?: string): string => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('fr-SN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const getStatusColor = (status: Audit['AU_Status']): { bg: string; text: string; border: string } => {
  switch (status) {
    case 'TERMINE': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
    case 'EN_COURS': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
    case 'PLANIFIE': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
    default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
  }
};

// ============================================================================
// SOUS-COMPOSANT : AUDIT CARD (Accessible)
// ============================================================================

interface AuditCardProps {
  audit: Audit;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function AuditCard({ audit, isSelected, onSelect }: AuditCardProps) {
  const statusColors = getStatusColor(audit.AU_Status);
  const ncCount = audit.AU_NonConformites?.length || 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(audit.AU_Id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(audit.AU_Id);
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Sélectionner l'audit: ${audit.AU_Title}`}
      className={cn(
        "w-full p-5 md:p-6 text-left rounded-2xl md:rounded-3xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] group m-0",
        isSelected
          ? 'bg-linear-to-r from-purple-900/20 to-indigo-900/20 border-purple-500/50 shadow-lg shadow-purple-900/20'
          : 'bg-[#0B0F1A] border-white/5 hover:bg-white/5 hover:border-purple-500/30'
      )}
    >
      <div className="flex justify-between items-start mb-3 md:mb-4 gap-4">
        <div className="flex-1 min-w-0">
          <span className={cn(
            "text-[8px] font-black uppercase px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border tracking-widest truncate max-w-full inline-block",
            statusColors.bg, statusColors.text, statusColors.border
          )}>
            {audit.AU_Type?.replace('_', ' ') || 'STANDARD'}
          </span>
          <h3 className="text-sm md:text-base lg:text-lg font-black mt-2.5 md:mt-3 uppercase italic tracking-tight leading-tight m-0 group-hover:text-purple-400 transition-colors line-clamp-2">
            {audit.AU_Title || 'Audit sans titre'}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[8px] md:text-[9px] font-black text-slate-500 bg-[#0F172A] px-2.5 md:px-3 py-1.5 rounded-lg md:rounded-xl border border-white/5 shadow-inner">
            #{audit.AU_Reference || 'N/A'}
          </span>
        </div>
      </div>
      
      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 md:mb-5 line-clamp-2 italic m-0">
        {audit.AU_Scope || 'Périmètre non défini'}
      </p>
      
      <div className="flex flex-wrap items-center justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest gap-2 bg-[#0F172A] p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/5 shadow-inner">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <span className={cn(
            "px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl flex items-center gap-1.5 shrink-0 border",
            statusColors.bg, statusColors.text, statusColors.border
          )}>
            {audit.AU_Status?.replace('_', ' ') || 'INCONNU'}
          </span>
          {audit.AU_Lead && (
            <span className="text-slate-500 flex items-center gap-1.5 truncate">
              <Users size={12} className="w-3 h-3 text-purple-400 shrink-0" aria-hidden="true" /> 
              <span className="truncate">{audit.AU_Lead.U_FirstName} {audit.AU_Lead.U_LastName}</span>
            </span>
          )}
        </div>
        <span className="text-slate-400 flex items-center gap-1.5 bg-[#0B0F1A] px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-white/5 shrink-0">
          <Target size={12} className="w-3 h-3 text-red-400 shrink-0" aria-hidden="true" /> 
          {ncCount} NC
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : OPTION ITEM (Info-only)
// ============================================================================

interface OptionItemProps {
  label: string;
  description: string;
  autoIncluded: boolean;
}

function OptionItem({ label, description, autoIncluded }: OptionItemProps) {
  return (
    <div 
      className={cn(
        "flex items-start gap-3 md:gap-4 p-4 md:p-5 bg-[#0B0F1A] border border-white/5 rounded-2xl md:rounded-3xl transition-colors shadow-inner m-0",
        autoIncluded && "opacity-80"
      )}
      role="group"
      aria-label={`${label}: ${description}`}
    >
      <div className={cn(
        "w-4 h-4 md:w-5 md:h-5 rounded-md md:rounded-lg mt-0.5 border flex items-center justify-center shrink-0",
        autoIncluded 
          ? "bg-purple-500/20 border-purple-500/30 text-purple-400" 
          : "border-white/20 bg-black"
      )} aria-hidden="true">
        {autoIncluded && <CheckCircle size={10} className="w-2.5 h-2.5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-black uppercase text-[10px] md:text-xs italic tracking-tight m-0 truncate">
            {label}
          </p>
          {autoIncluded && (
            <span className="text-[7px] md:text-[8px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 uppercase tracking-wider">
              Auto
            </span>
          )}
        </div>
        <p className="text-[8px] md:text-[9px] text-slate-500 mt-1 md:mt-1.5 font-bold uppercase tracking-widest m-0 truncate">
          {description}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : REPORT GENERATOR PAGE
// ============================================================================

export default function ReportGeneratorPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('ISO_9001');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'ALL',
  });

  // --- 📡 READ: Fetch audits (CRUD) ---
  const fetchAudits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Audit[]>('/audits');
      const auditsData = Array.isArray(res.data) ? res.data : [];
      setAudits(auditsData);
    } catch (error) {
      console.error('❌ Erreur chargement audits:', error);
      toast.error('Erreur lors de la synchronisation des audits');
      setAudits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchAudits();
    }
  }, [fetchAudits]);

  // --- 📥 EXPORT: Generate & download report (CRUD: Read → Export) ---
  const handleGenerateReport = useCallback(async () => {
    if (!selectedAudit) {
      toast.error('Veuillez sélectionner un audit dans la liste');
      return;
    }
    
    setGenerating(true);
    const toastId = toast.loading("Génération du rapport en cours... (patientez)");
    
    try {
      const response = await apiClient.post(
        '/audit-report/generate',
        {
          auditId: selectedAudit,
          template: selectedTemplate,
          includePhotos: true,
          includeDigitalSignature: true,
        },
        { 
          responseType: 'blob',
          timeout: 60000,
          headers: { 'Accept': 'application/pdf' }
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      const audit = audits.find(a => a.AU_Id === selectedAudit);
      const template = TEMPLATES.find(t => t.id === selectedTemplate);
      const dateStr = new Date().toISOString().split('T')[0];
      
      link.href = url;
      link.setAttribute(
        'download', 
        `${template?.label.replace(/\s+/g, '_') || 'Rapport'}_${audit?.AU_Reference || 'audit'}_${dateStr}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Rapport compilé et téléchargé avec succès !', { id: toastId });
      
    } catch (error: unknown) {
      const apiError = error as ApiError;
      
      if (apiError?.code === 'ECONNABORTED' || apiError?.message?.includes('timeout')) {
        toast.error('Le délai de génération a expiré. Réessayez.', { id: toastId });
      } else if (apiError?.response?.status === 404) {
        toast.error('Audit non localisé dans la base.', { id: toastId });
      } else if (apiError?.response?.status === 403) {
        toast.error('Permissions insuffisantes pour générer ce rapport.', { id: toastId });
      } else {
        console.error('❌ Erreur génération rapport:', apiError);
        toast.error(
          apiError?.response?.data?.message || 'Erreur critique lors de la génération', 
          { id: toastId }
        );
      }
    } finally {
      setGenerating(false);
    }
  }, [selectedAudit, selectedTemplate, audits]);

  // --- 🔍 Filtering logic (memoized) ---
  const filteredAudits = useMemo(() => {
    return audits.filter(audit => {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = (audit.AU_Title || '').toLowerCase().includes(searchLower);
      const refMatch = (audit.AU_Reference || '').toLowerCase().includes(searchLower);
      const scopeMatch = (audit.AU_Scope || '').toLowerCase().includes(searchLower);
      const matchesSearch = !filters.search || titleMatch || refMatch || scopeMatch;
      const matchesType = filters.type === 'ALL' || audit.AU_Type === filters.type;
      return matchesSearch && matchesType;
    });
  }, [audits, filters]);

  // --- 🎨 Filter handlers ---
  const handleFilterChange = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // --- 🔄 Refresh handler ---
  const handleRefresh = useCallback(() => {
    fetchAudits();
    toast.info('Registre d\'audits actualisé');
  }, [fetchAudits]);

  // --- 🎯 LOADING STATE ---
  if (loading && audits.length === 0 && typeof window !== 'undefined') {
    return (
      <div 
        className="flex h-full w-full flex-col items-center justify-center bg-[#0B0F1A] gap-5 md:gap-6 text-white italic"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="animate-spin text-purple-400 w-12 h-12" aria-hidden="true" />
        <span className="text-purple-400 font-black uppercase tracking-widest text-[9px] md:text-[10px] animate-pulse m-0">
          Chargement des audits...
        </span>
      </div>
    );
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-purple-500/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 EN-TÊTE FIXE */}
      <header className="shrink-0 px-4 md:px-6 lg:px-10 py-4 md:py-6 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-5 md:gap-6">
          <div className="flex items-center gap-4 md:gap-6 min-w-0 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="bg-linear-to-br from-purple-600 to-indigo-700 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg shadow-purple-900/40 shrink-0">
              <FileText size={24} className="w-6 h-6 md:w-8 md:h-8 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase italic tracking-tighter m-0 leading-none truncate">
                Générateur de <span className="text-purple-400">Rapports</span>
              </h1>
              <p className="text-slate-500 font-black text-[7px] md:text-[8px] uppercase tracking-widest mt-1.5 md:mt-2 m-0 truncate">
                Rapports d&apos;Audit • Certification • Conformité Légale
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={handleRefresh}
            className="bg-[#0F172A] border border-white/10 hover:bg-white hover:text-slate-900 text-white px-5 md:px-7 py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[8px] md:text-[9px] tracking-widest flex items-center justify-center gap-2 md:gap-3 transition-all cursor-pointer shadow-xl active:scale-95 w-full xl:w-auto shrink-0 m-0 focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label="Actualiser la liste des audits"
          >
            <RefreshCw size={14} className={cn("w-3.5 h-3.5", loading && "animate-spin")} aria-hidden="true" /> 
            Actualiser
          </button>
        </div>

        {/* 🔍 FILTRES */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 bg-[#0F172A] p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 shadow-inner mt-4 md:mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Search */}
          <div className="relative flex-1">
            <label htmlFor="audit-search" className="sr-only">Rechercher un audit</label>
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
            <input
              id="audit-search"
              type="search"
              placeholder="Rechercher..."
              className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg md:rounded-xl pl-10 md:pl-12 pr-4 md:pr-5 py-2.5 md:py-3 text-[8px] md:text-[9px] font-black uppercase text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all placeholder:text-slate-600 italic tracking-widest"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              aria-label="Filtrer les audits par titre, référence ou périmètre"
            />
          </div>
          
          {/* Type filter */}
          <div className="relative w-full md:w-auto md:min-w-48 shrink-0">
            <label htmlFor="audit-type" className="sr-only">Filtrer par type d&apos;audit</label>
            <select
              id="audit-type"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value as FilterState['type'])}
              className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg md:rounded-xl px-4 md:px-5 py-2.5 md:py-3 text-[8px] md:text-[9px] font-black uppercase italic text-slate-400 focus:border-purple-500 outline-none cursor-pointer transition-colors shadow-inner appearance-none tracking-widest"
              aria-label="Filtrer par type d'audit"
            >
              {AUDIT_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0B0F1A]">{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
          </div>
        </div>
      </header>

      {/* 📜 ZONE DE DÉFILEMENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6">
        <div className="max-w-7xl mx-auto space-y-5 md:space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
            
            {/* COLONNE GAUCHE: SÉLECTION AUDIT */}
            <section className="bg-[#0F172A]/80 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl backdrop-blur-sm flex flex-col max-h-128 md:max-h-144" aria-label="Sélection d'un audit">
              <h2 className="text-lg md:text-xl font-black mb-4 md:mb-6 flex items-center gap-3 md:gap-4 uppercase italic tracking-tighter m-0 shrink-0">
                <Calendar size={20} className="w-5 h-5 md:w-6 md:h-6 text-purple-400" aria-hidden="true" /> 
                Sélection de l&apos;Audit
              </h2>
              
              <div className="space-y-3 md:space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1" role="listbox" aria-label="Liste des audits disponibles">
                {filteredAudits.length > 0 ? (
                  filteredAudits.map((audit) => (
                    <AuditCard 
                      key={audit.AU_Id} 
                      audit={audit} 
                      isSelected={selectedAudit === audit.AU_Id}
                      onSelect={setSelectedAudit}
                    />
                  ))
                ) : (
                  <div 
                    className="text-center py-12 md:py-16 border-2 border-dashed border-white/10 rounded-2xl md:rounded-3xl h-full flex flex-col items-center justify-center"
                    role="status"
                  >
                    <Search className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 md:mb-4 text-slate-600" aria-hidden="true" />
                    <p className="text-slate-500 font-black uppercase text-[9px] md:text-[10px] tracking-widest italic m-0 px-4">
                      {filters.search || filters.type !== 'ALL'
                        ? 'Aucun audit ne correspond aux filtres'
                        : 'Aucun audit disponible'}
                    </p>
                    {(filters.search || filters.type !== 'ALL') && (
                      <button
                        type="button"
                        onClick={() => setFilters({ search: '', type: 'ALL' })}
                        className="mt-3 text-[8px] md:text-[9px] text-purple-400 hover:text-purple-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-3 py-1"
                      >
                        Réinitialiser les filtres
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Selected audit summary */}
              {selectedAudit && (
                <div className="mt-5 md:mt-6 p-4 md:p-5 bg-purple-500/10 border border-purple-500/20 rounded-xl md:rounded-2xl shadow-inner shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <p className="text-[8px] md:text-[9px] font-black uppercase text-purple-400 tracking-widest mb-1.5 md:mb-2 m-0 flex items-center gap-2">
                    <CheckCircle size={12} className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" /> 
                    Cible Verrouillée
                  </p>
                  <p className="font-black text-base md:text-lg uppercase italic tracking-tight m-0 leading-tight truncate">
                    {audits.find(a => a.AU_Id === selectedAudit)?.AU_Title}
                  </p>
                  <p className="text-[8px] md:text-[9px] text-slate-500 mt-1.5 md:mt-2 font-bold uppercase tracking-widest m-0 truncate">
                    Réf: {audits.find(a => a.AU_Id === selectedAudit)?.AU_Reference} • 
                    Date: {formatDateFR(audits.find(a => a.AU_Id === selectedAudit)?.AU_DateAudit)}
                  </p>
                </div>
              )}
            </section>
            
            {/* COLONNE DROITE: OPTIONS & GÉNÉRATION */}
            <section className="bg-[#0F172A]/80 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl backdrop-blur-sm flex flex-col max-h-128 md:max-h-144" aria-label="Paramètres de génération de rapport">
              <h2 className="text-lg md:text-xl font-black mb-4 md:mb-6 flex items-center gap-3 md:gap-4 uppercase italic tracking-tighter m-0 shrink-0">
                <FileText size={20} className="w-5 h-5 md:w-6 md:h-6 text-purple-400" aria-hidden="true" /> 
                Paramètres d&apos;Export
              </h2>
              
              <div className="space-y-5 md:space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {/* TEMPLATE SELECTION */}
                <div>
                  <label className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2.5 md:mb-3 block m-0">
                    Modèle de Rapport
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 md:gap-3" role="radiogroup" aria-label="Choisir un modèle de rapport">
                    {TEMPLATES.map((template) => {
                      const Icon = template.icon;
                      const isSelected = selectedTemplate === template.id;
                      return (
                        <button
                          key={template.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={cn(
                            "w-full p-4 md:p-5 text-left rounded-2xl md:rounded-3xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400 m-0",
                            isSelected
                              ? `bg-linear-to-r ${template.color.replace('text-', 'from-').replace('-500', '-600/10')} to-purple-900/10 border-purple-500/50 shadow-lg shadow-purple-900/20`
                              : 'bg-[#0B0F1A] border-white/5 hover:bg-white/5 hover:border-purple-500/30'
                          )}
                          aria-label={`Sélectionner le modèle: ${template.label}`}
                        >
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className={cn(
                              "p-2 md:p-2.5 rounded-lg md:rounded-xl shrink-0",
                              isSelected ? template.color : 'text-slate-500',
                              "bg-black/40 shadow-inner"
                            )}>
                              <Icon size={18} className="w-4.5 h-4.5 md:w-5 md:h-5" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={cn(
                                "font-black uppercase italic tracking-tight m-0 text-xs md:text-sm truncate",
                                isSelected ? 'text-white' : 'text-slate-300'
                              )}>
                                {template.label}
                              </p>
                              {template.isoClause && (
                                <p className="text-[7px] md:text-[8px] text-slate-500 mt-1 md:mt-1.5 uppercase tracking-widest m-0 truncate">
                                  {template.isoClause}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* AUTO-INCLUDED OPTIONS (Info only) */}
                <div>
                  <div className="flex items-center gap-2 mb-2.5 md:mb-3">
                    <label className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest m-0">
                      Extensions (Auto-incluses)
                    </label>
                    <span className="relative group">
                      <Info size={10} className="w-2.5 h-2.5 text-slate-500 cursor-help" aria-hidden="true" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#0B0F1A] border border-white/10 rounded-lg text-[7px] text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Ces options sont incluses automatiquement
                      </span>
                    </span>
                  </div>
                  <div className="space-y-2 md:space-y-2.5">
                    <OptionItem 
                      label="Preuves photographiques" 
                      description="Annexer les visuels des constats" 
                      autoIncluded={true} 
                    />
                    <OptionItem 
                      label="Signature numérique" 
                      description="Approbation certifiée SDE" 
                      autoIncluded={true} 
                    />
                  </div>
                </div>
              </div>
                
              {/* GENERATE BUTTON */}
              <div className="pt-5 md:pt-6 border-t border-white/10 mt-5 md:mt-6 shrink-0">
                <button
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={generating || !selectedAudit}
                  className={cn(
                    "w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 md:gap-3 border-none m-0 focus:outline-none focus:ring-2 focus:ring-purple-400",
                    generating 
                      ? 'bg-purple-500/20 text-purple-400 cursor-wait' 
                      : selectedAudit 
                        ? 'bg-linear-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white cursor-pointer active:scale-95' 
                        : 'bg-[#0B0F1A] text-slate-600 border border-white/5 cursor-not-allowed'
                  )}
                  aria-busy={generating}
                  aria-disabled={!selectedAudit || generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
                      Compilation Matrix...
                    </>
                  ) : (
                    <>
                      <Download size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
                      Sceller & Télécharger
                    </>
                  )}
                </button>
                
                <p className="text-[7px] md:text-[8px] text-slate-500 mt-2 md:mt-3 font-bold uppercase tracking-widest italic text-center m-0">
                  {selectedAudit 
                    ? 'Génération sécurisée (max 60 secondes)'
                    : '⚠️ Sélection obligatoire dans le registre'}
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="pt-5 md:pt-6 border-t border-white/5 text-center shrink-0 pb-4">
             <p className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase italic tracking-widest m-0 leading-relaxed">
               Qualisoft SMI • Conforme AFNOR, Bureau Veritas, SGS, INNORPI Sénégal
             </p>
          </footer>

        </div>
      </main>

      {/* GLOBAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(168, 85, 247, 0.3); 
          border-radius: 10px; 
        }
        :focus-visible {
          outline: 2px solid #a855f7;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}