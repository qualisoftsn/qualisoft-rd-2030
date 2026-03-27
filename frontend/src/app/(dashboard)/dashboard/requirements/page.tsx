/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⚖️ MODULE : REGULATORY REQUIREMENTS (ISO 14001 / 45001 §6.1.3)
 * RÔLE : Gestion centralisée des exigences légales
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback, useEffect, useMemo, useState, ChangeEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { type ApiError } from '@/core/api/api-client';
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Plus,
  Scale,
  Search,
  Filter,
  Download,
  ShieldCheck,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type RequirementStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING' | 'REVIEW';
export type RequirementPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RequirementCategory = 'ENVIRONNEMENT' | 'SÉCURITÉ' | 'QUALITÉ' | 'SOCIAL' | 'AUTRE';

export interface RegulatoryRequirement {
  RR_Id: string;
  RR_Title: string;
  RR_Reference: string;
  RR_Authority: string;
  RR_Category: RequirementCategory;
  RR_Status: RequirementStatus;
  RR_Priority: RequirementPriority;
  RR_DueDate: string;
  RR_Description?: string;
  RR_ComplianceNotes?: string;
  RR_Documents?: string[];
  RR_CreatedAt: string;
  RR_UpdatedAt: string;
}

export interface RequirementStats {
  total: number;
  compliant: number;
  nonCompliant: number;
  pending30d: number;
  complianceRate: number;
}

export interface KPIStatProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'amber' | 'red';
  subtext: string;
}

export interface PriorityBadgeProps {
  priority: RequirementPriority;
}

export interface StatusBadgeProps {
  status: RequirementStatus;
}

export interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-indigo-600 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI STAT
// ============================================================================

function KPIStat({ title, value, icon: Icon, color, subtext }: KPIStatProps) {
  const configs: Record<KPIStatProps['color'], string> = { 
    blue: 'bg-blue-50 text-blue-600', 
    emerald: 'bg-emerald-50 text-emerald-600', 
    amber: 'bg-amber-50 text-amber-600', 
    red: 'bg-red-50 text-red-600' 
  };
  
  return (
    <article className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-4 md:gap-5 group transition-all hover:border-indigo-100 focus-within:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400">
      <div className={cn(
        "h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border border-transparent transition-transform group-hover:scale-110 shadow-inner",
        configs[color]
      )}>
        <Icon size={20} className="w-5 h-5 md:w-7 md:h-7" aria-hidden="true" />
      </div>
      <div className="text-left">
        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest m-0">{title}</p>
        <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter m-0 italic">{value}</p>
        <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase italic m-0 mt-0.5 md:mt-1">{subtext}</p>
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : PRIORITY BADGE
// ============================================================================

function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config: Record<RequirementPriority, string> = { 
    CRITICAL: 'bg-rose-600 text-white border-transparent', 
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200', 
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200', 
    LOW: 'bg-slate-50 text-slate-600 border-slate-200' 
  };
  
  return (
    <span className={cn(
      "inline-flex rounded-lg px-2 md:px-3 py-1 text-[8px] md:text-[9px] font-black uppercase italic tracking-widest border",
      config[priority] || config.MEDIUM
    )}>
      {priority}
    </span>
  );
}

// ============================================================================
// SOUS-COMPOSANT : STATUS BADGE
// ============================================================================

function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<RequirementStatus, string> = { 
    COMPLIANT: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
    NON_COMPLIANT: 'bg-red-50 text-red-700 border-red-100', 
    PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
    REVIEW: 'bg-purple-50 text-purple-700 border-purple-100'
  };
  
  return (
    <span className={cn(
      "inline-flex rounded-lg px-2 md:px-3 py-1 text-[8px] md:text-[9px] font-black uppercase italic tracking-widest border",
      config[status] || config.PENDING
    )}>
      {status?.replace('_', ' ')}
    </span>
  );
}

// ============================================================================
// SOUS-COMPOSANT : FILTER SELECT
// ============================================================================

function FilterSelect({ value, onChange, options, label }: FilterSelectProps) {
  return (
    <div className="relative">
      <label htmlFor={`filter-${label.toLowerCase()}`} className="sr-only">
        Filtrer par {label.toLowerCase()}
      </label>
      <select 
        id={`filter-${label.toLowerCase()}`}
        value={value} 
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)} 
        className="bg-slate-50 border border-slate-200 rounded-xl px-4 md:px-5 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black uppercase italic text-slate-600 outline-none focus:border-indigo-500 cursor-pointer appearance-none shadow-inner pr-8 md:pr-10"
      >
        <option value="ALL" className="bg-white">TOUT : {label.toUpperCase()}</option>
        {options.filter((o: string) => o !== 'ALL').map((o: string) => (
          <option key={o} value={o} className="bg-white">{o}</option>
        ))}
      </select>
      <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" aria-hidden="true">
        <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function RequirementsPage() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<RegulatoryRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const fetchRequirements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<RegulatoryRequirement[]>('/requirements');
      
      // Déballage hybride (Supporte les formats [Data] ou { data: [Data] })
      const rawPayload = res.data;
      const finalData = Array.isArray(rawPayload) 
        ? rawPayload 
        : (Array.isArray(rawPayload?.data) ? rawPayload.data : []);

      setRequirements(finalData);
    } catch (error) {
      console.error('❌ Erreur chargement exigences:', error);
      toast.error('RUPTURE DE FLUX : Échec de synchronisation réglementaire.');
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchRequirements(); }, [fetchRequirements]);

  const stats = useMemo((): RequirementStats => {
    const now = new Date();
    const limit30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
      total: requirements.length,
      compliant: requirements.filter((r) => r.RR_Status === 'COMPLIANT').length,
      nonCompliant: requirements.filter((r) => r.RR_Status === 'NON_COMPLIANT').length,
      pending30d: requirements.filter((r) => {
        if (r.RR_Status === 'COMPLIANT') return false;
        const due = new Date(r.RR_DueDate);
        return due >= now && due <= limit30Days;
      }).length,
      complianceRate: requirements.length > 0
        ? Math.round((requirements.filter((r) => r.RR_Status === 'COMPLIANT').length / requirements.length) * 100)
        : 0,
    };
  }, [requirements]);

  const filteredRequirements = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return requirements.filter((req) => {
      const matchText =
        req.RR_Title?.toLowerCase().includes(term) ||
        req.RR_Reference?.toLowerCase().includes(term) ||
        req.RR_Authority?.toLowerCase().includes(term);
      const matchCat = selectedCategory === 'ALL' || req.RR_Category === selectedCategory;
      const matchStat = selectedStatus === 'ALL' || req.RR_Status === selectedStatus;
      return matchText && matchCat && matchStat;
    });
  }, [requirements, searchTerm, selectedCategory, selectedStatus]);

  const handleRowClick = (reqId: string) => {
    router.push(`/dashboard/quality/requirements/${reqId}`);
  };

  const handleRowKeyDown = (e: KeyboardEvent<HTMLTableRowElement>, reqId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(`/dashboard/quality/requirements/${reqId}`);
    }
  };

  const categoryOptions = ['ALL', 'ENVIRONNEMENT', 'SÉCURITÉ', 'QUALITÉ', 'SOCIAL', 'AUTRE'];
  const statusOptions = ['ALL', 'COMPLIANT', 'NON_COMPLIANT', 'PENDING', 'REVIEW'];

  if (loading && requirements.length === 0 && typeof window !== 'undefined') {
    return <LoadingScreen label="Synchronisation Matrix §6.1.3..." />;
  }

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-indigo-600/10 italic font-medium uppercase">
      <Toaster position="top-right" richColors theme="light" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-slate-200 bg-white z-50">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-6">
          <div className="space-y-2 md:space-y-3 w-full xl:w-auto">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span className="bg-indigo-600 text-white px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black tracking-widest italic border-none">
                ISO 14001:2015 §6.1.3
              </span>
              <span className="bg-emerald-50 text-emerald-700 px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black tracking-widest border border-emerald-100 italic">
                {stats.complianceRate}% CONFORMITÉ
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter m-0 leading-none">
              Veille <span className="text-indigo-600">Réglementaire</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
            <button 
              type="button"
              className="flex-1 xl:flex-none inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 md:px-6 py-2.5 md:py-3 lg:py-4 text-[9px] md:text-[10px] font-black tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm italic cursor-pointer uppercase focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Télécharger le rapport global"
            >
              <Download className="mr-2 md:mr-3 h-4 w-4" aria-hidden="true" /> 
              <span className="hidden sm:inline">Rapport Global</span>
            </button>
            <button 
              type="button"
              onClick={() => router.push('/dashboard/quality/requirements/nouveau')} 
              className="flex-1 xl:flex-none inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 text-[9px] md:text-[10px] font-black tracking-widest text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all border-none italic cursor-pointer uppercase focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Créer une nouvelle exigence"
            >
              <Plus className="mr-2 md:mr-3 h-4 w-4" aria-hidden="true" /> 
              <span className="hidden sm:inline">Nouvelle Exigence</span>
            </button>
            <button 
              type="button"
              onClick={fetchRequirements} 
              disabled={loading}
              className="p-2 md:p-3 lg:p-4 bg-slate-100 rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
              aria-label="Actualiser la liste des exigences"
            >
               <RefreshCw size={16} className={cn("w-4 h-4 md:w-5 md:h-5", loading ? "animate-spin" : "")} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-6 md:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" role="list" aria-label="Statistiques de conformité">
          <KPIStat title="Textes Référencés" value={stats.total.toString()} icon={FileText} color="blue" subtext="Base Documentaire" />
          <KPIStat title="Statut Conforme" value={stats.compliant.toString()} icon={CheckCircle2} color="emerald" subtext={`${stats.complianceRate}% du total`} />
          <KPIStat title="Échéances 30J" value={stats.pending30d.toString()} icon={Clock} color="amber" subtext="Critique / Urgent" />
          <KPIStat title="Non-Conformités" value={stats.nonCompliant.toString()} icon={AlertTriangle} color="red" subtext="Actions Requises" />
        </div>
      </header>

      {/* 🧭 FILTRES */}
      <div className="shrink-0 px-4 md:px-6 lg:px-8 py-3 md:py-4 bg-white border-b border-slate-200 flex flex-col md:flex-row gap-3 md:gap-4" role="search" aria-label="Filtrer les exigences">
        <div className="relative flex-1 group">
          <label htmlFor="requirements-search" className="sr-only">Rechercher une exigence</label>
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" />
          <input 
            id="requirements-search"
            value={searchTerm} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
            placeholder="FILTRER PAR TITRE, RÉFÉRENCE, AUTORITÉ..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 md:py-3 lg:py-4 pl-10 md:pl-12 pr-4 text-[9px] md:text-[10px] lg:text-[11px] font-black italic outline-none focus:bg-white focus:border-indigo-500 transition-all uppercase"
            aria-label="Filtrer les exigences par titre, référence ou autorité"
          />
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <FilterSelect value={selectedCategory} onChange={setSelectedCategory} options={categoryOptions} label="Catégorie" />
          <FilterSelect value={selectedStatus} onChange={setSelectedStatus} options={statusOptions} label="Statut" />
        </div>
      </div>

      {/* 📋 DATA STREAM */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto space-y-3 md:space-y-4 pb-16 md:pb-20" role="region" aria-label="Liste des exigences réglementaires">
          {filteredRequirements.length > 0 ? (
            <article className="bg-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100" role="table">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 md:px-8 py-4 md:py-5 text-left text-[8px] md:text-[9px] font-black text-slate-500 tracking-widest italic" scope="col">Référence & Titre</th>
                      <th className="px-4 md:px-6 py-4 md:py-5 text-left text-[8px] md:text-[9px] font-black text-slate-500 tracking-widest italic" scope="col">Autorité</th>
                      <th className="px-4 md:px-6 py-4 md:py-5 text-left text-[8px] md:text-[9px] font-black text-slate-500 tracking-widest italic" scope="col">Priorité</th>
                      <th className="px-4 md:px-6 py-4 md:py-5 text-left text-[8px] md:text-[9px] font-black text-slate-500 tracking-widest italic" scope="col">Échéance</th>
                      <th className="px-4 md:px-6 py-4 md:py-5 text-left text-[8px] md:text-[9px] font-black text-slate-500 tracking-widest italic" scope="col">Statut</th>
                      <th className="px-4 md:px-6 py-4 md:py-5 text-right text-[8px] md:text-[9px] font-black text-slate-500 tracking-widest italic" scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {filteredRequirements.map((req) => (
                      <tr 
                        key={req.RR_Id} 
                        onClick={() => handleRowClick(req.RR_Id)}
                        onKeyDown={(e) => handleRowKeyDown(e, req.RR_Id)}
                        className="group cursor-pointer hover:bg-slate-50/80 transition-all focus-within:bg-slate-50/80 focus:outline-none"
                        role="row"
                        tabIndex={0}
                        aria-label={`Exigence: ${req.RR_Title}`}
                      >
                        <td className="px-6 md:px-8 py-4 md:py-6">
                          <div className="text-[11px] md:text-[13px] font-black text-slate-900 italic group-hover:text-indigo-600 leading-tight uppercase truncate max-w-md">{req.RR_Title}</div>
                          <div className="flex items-center gap-2 md:gap-3 mt-1">
                            <span className="text-[8px] md:text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">{req.RR_Reference}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-6">
                          <span className="text-[10px] md:text-[11px] font-black text-slate-600 italic uppercase">{req.RR_Authority}</span>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-6">
                          <PriorityBadge priority={req.RR_Priority} />
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-6 text-[10px] md:text-[11px] font-black text-slate-600 italic uppercase">
                          {new Date(req.RR_DueDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-6">
                          <StatusBadge status={req.RR_Status} />
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-6 text-right">
                          <ChevronRight className="inline h-4 w-4 md:h-5 md:w-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" aria-hidden="true" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ) : (
            <div className="bg-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border-2 border-dashed border-slate-200 p-12 md:p-16 lg:p-20 text-center opacity-60" role="status">
               <Scale className="h-12 w-12 md:h-16 md:w-16 mx-auto text-slate-300 mb-4 md:mb-6" aria-hidden="true" />
               <p className="text-lg md:text-xl font-black italic tracking-tighter uppercase">Référentiel non détecté</p>
               {requirements.length === 0 && !searchTerm && (
                 <button 
                   type="button"
                   onClick={() => router.push('/dashboard/quality/requirements/nouveau')}
                   className="mt-3 md:mt-4 text-[9px] md:text-[10px] text-indigo-600 hover:text-indigo-700 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-3 py-1"
                 >
                   Créer votre première exigence
                 </button>
               )}
            </div>
          )}
        </div>
      </main>

      {/* ℹ️ FOOTER */}
      <footer className="shrink-0 bg-white border-t border-slate-200 px-4 md:px-6 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3 md:gap-4 text-indigo-700 font-black text-[9px] md:text-[10px] tracking-widest uppercase italic">
          <ShieldCheck size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
          Compliance Matrix RD-2026 • Veille Légale Scellée
        </div>
        <div className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest italic">
          {filteredRequirements.length} TEXTES SUR {requirements.length}
        </div>
      </footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(79,70,229,0.3);border-radius:10px}:focus-visible{outline:2px solid #4f46e5;outline-offset:2px}`}</style>
    </div>
  );
}