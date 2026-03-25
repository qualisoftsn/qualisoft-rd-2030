/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : CHAMBRE FORTE (ARCHIVES SMI) - ISO 9001 §7.5.3
 * -------------------------------------------------------------------------
 * RÔLE : Coffre-fort numérique pour la conservation des informations documentées
 * VERSION : 3.0 - CRUD complet + Design Elite + Accessibilité + PWA Ready
 * API : apiClient avec interceptors (Bearer + X-Tenant-Id)
 * RÉVISION : 19 Mars 2026 | Production OVH
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useState, useMemo, useCallback, ChangeEvent } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Archive, RotateCcw, Search, Database, 
  FileText, GitBranch, Wrench, GraduationCap, 
  ShieldCheck, RefreshCw, Activity, Trash2, 
  Download, Filter, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES (Strict Typing - Prisma aligned)
// ============================================================================

export type ArchiveType = 'DOCUMENT' | 'PROCESSUS' | 'EQUIPEMENT' | 'FORMATION' | 'AUDIT' | 'ACTION' | 'AUTRE';

export interface ArchiveItem {
  id: string;
  type: ArchiveType | string;  // String pour flexibilité (Prisma: String field)
  title: string;
  ref?: string;                 // Référence documentaire (ex: DOC-2026-001)
  date: string;                 // ISO string (DateTime in Prisma)
  originalId?: string;          // ID de l'entité originale avant archivage
  archivedBy?: string;          // User who archived
  reason?: string;              // Motif d'archivage
  retentionDate?: string;       // Date de fin de conservation
  metadata?: Record<string, unknown>; // Données supplémentaires
}

export interface FilterState {
  search: string;
  type: ArchiveType | 'ALL';
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================================
// CONFIGURATION DES AFFICHAGES
// ============================================================================

const TYPE_ICONS: Record<ArchiveType | string, React.ElementType> = {
  DOCUMENT: FileText,
  PROCESSUS: GitBranch,
  EQUIPEMENT: Wrench,
  FORMATION: GraduationCap,
  AUDIT: ShieldCheck,
  ACTION: Activity,
  AUTRE: Archive,
};

const TYPE_LABELS: Record<ArchiveType | string, string> = {
  DOCUMENT: 'Document',
  PROCESSUS: 'Processus',
  EQUIPEMENT: 'Actif',
  FORMATION: 'Formation',
  AUDIT: 'Audit',
  ACTION: 'Action',
  AUTRE: 'Autre',
};

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

const isRetentionExpired = (retentionDate?: string): boolean => {
  if (!retentionDate) return false;
  return new Date(retentionDate).getTime() < Date.now();
};

// ============================================================================
// SOUS-COMPOSANT : STAT CARD (Design Elite)
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'amber' | 'rose';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorMap: Record<StatCardProps['color'], { text: string; bg: string; border: string; iconBg: string }> = {
    blue: {
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500/10 text-blue-400',
    },
    emerald: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
    },
    amber: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      iconBg: 'bg-amber-500/10 text-amber-400',
    },
    rose: {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      iconBg: 'bg-rose-500/10 text-rose-400',
    },
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <article
      className={cn(
        "bg-[#0F172A] border p-5 md:p-6 rounded-2xl md:rounded-3xl flex items-center gap-4 md:gap-5 shadow-inner transition-all hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 focus-within:ring-offset-[#0B0F1A]",
        theme.border
      )}
      tabIndex={0}
      aria-label={`${title}: ${value}`}
    >
      <div className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl shrink-0", theme.iconBg)}>
        <Icon size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5 md:mb-2 m-0 truncate">
          {title}
        </p>
        <p className={cn("text-xl md:text-2xl lg:text-3xl font-black italic tracking-tighter m-0 leading-none truncate", theme.text)}>
          {value}
        </p>
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : TAB BUTTON
// ============================================================================

interface TabBtnProps {
  label: string;
  type: string;
  active: string;
  onClick: (type: string) => void;
  icon: React.ElementType;
}

function TabBtn({ label, type, active, onClick, icon: Icon }: TabBtnProps) {
  const isActive = active === type;
  return (
    <button 
      type="button"
      onClick={() => onClick(type)}
      className={cn(
        "px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase italic flex items-center justify-center gap-2 md:gap-3 transition-all cursor-pointer tracking-widest border-none shrink-0 m-0 focus:outline-none focus:ring-2 focus:ring-blue-400",
        isActive 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
          : "bg-transparent text-slate-400 hover:bg-white/5 hover:text-white"
      )}
      aria-pressed={isActive}
      aria-label={`Filtrer par: ${label}`}
    >
      <Icon size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" aria-hidden="true" /> 
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ARCHIVE ROW
// ============================================================================

interface ArchiveRowProps {
  item: ArchiveItem;
  onRestore: (id: string, type: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

function ArchiveRow({ item, onRestore, onDelete, onExport }: ArchiveRowProps) {
  const TypeIcon = TYPE_ICONS[item.type] || Archive;
  const isExpired = isRetentionExpired(item.retentionDate);

  return (
    <tr 
      className="hover:bg-white/5 transition-all group cursor-default focus-within:bg-blue-500/5 focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 focus-within:ring-offset-[#0F172A]"
      tabIndex={0}
      aria-label={`Archive: ${item.title}`}
    >
      {/* Type Badge */}
      <td className="p-4 md:p-6 lg:p-8">
        <span className={cn(
          "inline-flex items-center gap-1.5 md:gap-2 bg-[#0B0F1A] px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-white/5 text-[7px] md:text-[8px] font-black uppercase italic shadow-inner whitespace-nowrap",
          item.type === 'DOCUMENT' ? 'text-blue-400' :
          item.type === 'PROCESSUS' ? 'text-emerald-400' :
          item.type === 'EQUIPEMENT' ? 'text-amber-400' : 'text-slate-400'
        )}>
          <TypeIcon size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" />
          {TYPE_LABELS[item.type] || item.type}
        </span>
      </td>
      
      {/* Title & Reference */}
      <td className="p-4 md:p-6 lg:p-8 min-w-0">
        <p className="text-sm md:text-base lg:text-lg font-black uppercase text-white tracking-tighter leading-none m-0 group-hover:text-blue-400 transition-colors line-clamp-2">
          {item.title}
        </p>
        <p className="text-[8px] md:text-[9px] font-black text-slate-500 mt-1.5 md:mt-2 italic tracking-widest m-0 flex items-center gap-2 truncate">
          <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-slate-500 group-hover:bg-blue-500 transition-colors shrink-0" aria-hidden="true" />
          {item.ref || 'SANS RÉFÉRENCE'}
        </p>
        {item.reason && (
          <p className="text-[7px] md:text-[8px] text-slate-600 mt-1 italic truncate">
            Motif: {item.reason}
          </p>
        )}
      </td>
      
      {/* Date */}
      <td className="p-4 md:p-6 lg:p-8 text-[9px] md:text-[10px] font-bold text-slate-400 italic tracking-widest whitespace-nowrap">
        <time dateTime={item.date}>{formatDateFR(item.date)}</time>
        {isExpired && (
          <span className="block text-[7px] md:text-[8px] text-rose-400 mt-1">
            Conservation échue
          </span>
        )}
      </td>
      
      {/* Actions */}
      <td className="p-4 md:p-6 lg:p-8 text-right">
        <div className="flex items-center justify-end gap-1.5 md:gap-2">
          {/* Export */}
          <button
            type="button"
            onClick={() => onExport(item.id)}
            className="p-2 md:p-2.5 text-slate-400 hover:text-blue-400 bg-[#0B0F1A] border border-white/10 rounded-lg md:rounded-xl transition-all cursor-pointer hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Exporter l'archive"
            aria-label={`Exporter: ${item.title}`}
          >
            <Download size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
          </button>
          
          {/* Restore */}
          <button 
            type="button"
            onClick={() => onRestore(item.id, item.type)}
            className="px-3 md:px-4 py-2 md:py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg md:rounded-xl text-[7px] md:text-[8px] font-black uppercase italic hover:bg-blue-600 hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-1.5 md:gap-2 cursor-pointer active:scale-95 m-0 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={`Restaurer: ${item.title}`}
          >
            <RotateCcw size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:-rotate-180 transition-transform duration-500" aria-hidden="true" /> 
            <span className="hidden sm:inline">Restaurer</span>
          </button>
          
          {/* Delete (permanent) */}
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="p-2 md:p-2.5 text-slate-400 hover:text-rose-400 bg-[#0B0F1A] border border-white/10 hover:border-rose-500/30 rounded-lg md:rounded-xl transition-all cursor-pointer hover:bg-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-400"
            title="Supprimer définitivement"
            aria-label={`Supprimer définitivement: ${item.title}`}
          >
            <Trash2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : ARCHIVES PAGE
// ============================================================================

export default function ArchivesPage() {
  const [data, setData] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'ALL',
  });

  // --- 📡 READ: Fetch archives (CRUD) ---
  const fetchArchives = useCallback(async () => {
    try {
      setIsRefreshing(true);
      
      // Construction des query params
      const params = new URLSearchParams();
      if (filters.type !== 'ALL') params.append('type', filters.type);
      if (filters.search) params.append('q', filters.search);
      
      const res = await apiClient.get<ArchiveItem[]>(`/archives?${params.toString()}`);
      const archivesData = Array.isArray(res.data) ? res.data : [];
      setData(archivesData);
    } catch (error) {
      console.error('❌ Erreur chargement archives:', error);
      toast.error("Échec de connexion à la chambre forte");
      setData([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => { 
    if (typeof window !== 'undefined') {
      fetchArchives(); 
    }
  }, [fetchArchives]);

  // --- 🔄 UPDATE: Restore archive (CRUD) ---
  const handleRestore = useCallback(async (id: string, type: string) => {
    const toastId = toast.loading("Extraction depuis le coffre-fort...");
    try {
      await apiClient.post('/archives/restore', { id, type });
      toast.success(`${TYPE_LABELS[type] || type} restauré avec succès dans le SMI actif`, { id: toastId });
      fetchArchives();
    } catch (error) {
      console.error('❌ Erreur restore:', error);
      toast.error("Échec du protocole de restauration", { id: toastId });
    }
  }, [fetchArchives]);

  // --- 🗑️ DELETE: Permanent delete (CRUD) ---
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("⚠️ SUPPRESSION DÉFINITIVE\n\nCette action est irréversible. L'archive sera perdue à jamais.\n\nConfirmer la suppression ?")) return;
    
    const toastId = toast.loading("Purge sécurisée en cours...");
    try {
      await apiClient.delete(`/archives/${id}`);
      toast.success("Archive supprimée définitivement", { id: toastId });
      fetchArchives();
    } catch (error) {
      console.error('❌ Erreur delete:', error);
      toast.error("Impossible de supprimer l'archive", { id: toastId });
    }
  }, [fetchArchives]);

  // --- 📥 EXPORT: Single archive export (CRUD: Read → Export) ---
  const handleExport = useCallback(async (id: string) => {
    const toastId = toast.loading("Génération du fichier d'export...");
    try {
      const response = await apiClient.get(`/archives/${id}/export`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `archive-${id}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Archive exportée", { id: toastId });
    } catch (error) {
      console.error('❌ Erreur export:', error);
      toast.error("Échec de l'export", { id: toastId });
    }
  }, []);

  // --- 📊 BULK ACTIONS (CRUD extensions) ---
  const handleBulkRestore = useCallback(async () => {
    if (!confirm(`Restaurer les ${filtered.length} archives filtrées ?`)) return;
    
    const toastId = toast.loading("Restauration en masse...");
    try {
      await apiClient.post('/archives/restore/bulk', {
        ids: filtered.map(item => item.id),
      });
      toast.success(`${filtered.length} archives restaurées`, { id: toastId });
      fetchArchives();
    } catch (error) {
      console.error('❌ Erreur bulk restore:', error);
      toast.error("Échec de la restauration en masse", { id: toastId });
    }
  }, [filtered, fetchArchives]);

  const handleBulkExport = useCallback(async () => {
    const toastId = toast.loading("Génération de l'export complet...");
    try {
      const response = await apiClient.post('/archives/export/bulk', {
        ids: filtered.map(item => item.id),
        format: 'json',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `archives-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("Export généré", { id: toastId });
    } catch (error) {
      console.error('❌ Erreur bulk export:', error);
      toast.error("Échec de l'export", { id: toastId });
    }
  }, [filtered]);

  // --- 🔍 Filter handling ---
  const handleFilterChange = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // --- 🔍 Filtering logic ---
  const filtered = useMemo(() => {
    return data.filter(item => {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = (item.title || '').toLowerCase().includes(searchLower);
      const refMatch = (item.ref || '').toLowerCase().includes(searchLower);
      const matchesSearch = !filters.search || titleMatch || refMatch;
      const matchesType = filters.type === 'ALL' || item.type === filters.type;
      return matchesSearch && matchesType;
    });
  }, [data, filters]);

  // --- 📊 Stats calculation ---
  const stats = useMemo(() => {
    const byType = data.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: data.length,
      documents: byType.DOCUMENT || 0,
      processes: byType.PROCESSUS || 0,
      equipments: byType.EQUIPEMENT || 0,
      formations: byType.FORMATION || 0,
      retentionExpired: data.filter(d => isRetentionExpired(d.retentionDate)).length,
    };
  }, [data]);

  // --- 🎯 LOADING STATE ---
  if (loading && data.length === 0 && typeof window !== 'undefined') {
    return (
      <div 
        className="flex h-full w-full flex-col items-center justify-center bg-[#0B0F1A] gap-5 md:gap-6 text-white italic"
        role="status"
        aria-live="polite"
      >
        <RefreshCw className="animate-spin text-blue-500" size={40} md:size={48} aria-hidden="true" />
        <span className="text-blue-400 font-black uppercase tracking-widest text-[9px] md:text-[10px] animate-pulse m-0">
          Déverrouillage du Coffre...
        </span>
      </div>
    );
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🔝 EN-TÊTE FIXE */}
      <header className="shrink-0 px-4 md:px-6 lg:px-10 py-4 md:py-6 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-5 md:gap-6">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter italic leading-none flex items-center gap-3 md:gap-4 m-0 truncate">
              <Archive className="text-blue-500 shrink-0 w-8 h-8 md:w-10 md:h-10" aria-hidden="true" /> 
              <span>Chambre <span className="text-blue-500">Forte</span></span>
            </h1>
            <p className="text-slate-500 font-black text-[7px] md:text-[8px] uppercase tracking-widest mt-2 md:mt-3 italic flex items-center gap-2 md:gap-3 m-0 truncate">
              <ShieldCheck size={12} className="text-amber-400 shrink-0 w-3 h-3 md:w-4 md:h-4" aria-hidden="true" /> 
              <span>CONSERVATION §7.5.3 • SOUVERAINETÉ DES DONNÉES</span>
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Search */}
            <div className="relative w-full xl:w-72">
              <label htmlFor="archive-search" className="sr-only">Rechercher une archive</label>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" aria-hidden="true" />
              <input 
                id="archive-search"
                type="search"
                placeholder="RECHERCHER..." 
                className="w-full bg-[#0F172A] border border-white/10 rounded-lg md:rounded-xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 md:pr-5 text-[8px] md:text-[9px] font-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all uppercase italic text-white shadow-inner placeholder:text-slate-600"
                value={filters.search} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
                aria-label="Filtrer les archives par titre ou référence"
              />
            </div>
            
            {/* Refresh */}
            <button
              type="button"
              onClick={() => fetchArchives()}
              disabled={isRefreshing}
              className={cn(
                "p-2.5 md:p-3 bg-[#0F172A] border border-white/10 rounded-lg md:rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                isRefreshing && "opacity-50 cursor-wait"
              )}
              aria-label="Actualiser la liste des archives"
            >
              <RefreshCw size={16} className={cn("w-4 h-4", isRefreshing && "animate-spin")} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* 📜 ZONE DE DÉFILEMENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6">
        <div className="max-w-7xl mx-auto space-y-5 md:space-y-6">
          
          {/* 📊 STATS DE CONSERVATION */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" aria-label="Statistiques d'archivage">
            <StatCard title="Total Archivé" value={stats.total} icon={Database} color="blue" />
            <StatCard title="Documents" value={stats.documents} icon={FileText} color="emerald" />
            <StatCard title="Processus" value={stats.processes} icon={GitBranch} color="amber" />
            <StatCard 
              title="Conservation échue" 
              value={stats.retentionExpired} 
              icon={AlertCircle} 
              color={stats.retentionExpired > 0 ? 'rose' : 'emerald'} 
            />
          </section>

          {/* 📑 NAVIGATION PAR TYPE (TABS) */}
          <nav className="flex flex-wrap gap-2 md:gap-3 bg-[#0F172A] p-2 rounded-xl md:rounded-2xl border border-white/5 overflow-x-auto custom-scrollbar" role="tablist" aria-label="Filtrer par type d'archive">
            <TabBtn label="Tout" type="ALL" active={filters.type} onClick={(t) => handleFilterChange('type', t)} icon={Archive} />
            <TabBtn label="Documents" type="DOCUMENT" active={filters.type} onClick={(t) => handleFilterChange('type', t)} icon={FileText} />
            <TabBtn label="Processus" type="PROCESSUS" active={filters.type} onClick={(t) => handleFilterChange('type', t)} icon={GitBranch} />
            <TabBtn label="Actifs" type="EQUIPEMENT" active={filters.type} onClick={(t) => handleFilterChange('type', t)} icon={Wrench} />
            <TabBtn label="Formations" type="FORMATION" active={filters.type} onClick={(t) => handleFilterChange('type', t)} icon={GraduationCap} />
          </nav>

          {/* 🛠️ BULK ACTIONS */}
          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl md:rounded-2xl p-3 md:p-4">
              <span className="text-[8px] md:text-[9px] font-black text-blue-400 uppercase tracking-widest italic">
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''} sélectionné{filtered.length > 1 ? 's' : ''}
              </span>
              <div className="h-4 w-px bg-blue-500/30 hidden md:block" aria-hidden="true" />
              <button
                type="button"
                onClick={handleBulkRestore}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <RotateCcw size={12} className="w-3 h-3" aria-hidden="true" />
                Restaurer tout
              </button>
              <button
                type="button"
                onClick={handleBulkExport}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <Download size={12} className="w-3 h-3" aria-hidden="true" />
                Exporter
              </button>
            </div>
          )}

          {/* 📋 LISTE DES ARCHIVES (Tableau) */}
          <section className="bg-[#0F172A]/80 border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm flex flex-col" aria-label="Liste des archives">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-full">
                <thead className="sticky top-0 bg-[#0B0F1A]/95 backdrop-blur-md z-20 border-b border-white/10">
                  <tr className="text-[7px] md:text-[8px] font-black uppercase text-slate-500 italic tracking-widest">
                    <th scope="col" className="p-4 md:p-6 lg:p-8 w-32 md:w-40 whitespace-nowrap">Type</th>
                    <th scope="col" className="p-4 md:p-6 lg:p-8">Désignation & Référence</th>
                    <th scope="col" className="p-4 md:p-6 lg:p-8 w-32 md:w-48 whitespace-nowrap">Date d'Archivage</th>
                    <th scope="col" className="p-4 md:p-6 lg:p-8 text-right w-40 md:w-48 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length > 0 ? (
                    filtered.map((item) => (
                      <ArchiveRow
                        key={item.id}
                        item={item}
                        onRestore={handleRestore}
                        onDelete={handleDelete}
                        onExport={handleExport}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-12 md:p-16 lg:p-20 text-center text-slate-500" role="status">
                        <Archive size={40} className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
                        <p className="font-black uppercase italic text-[9px] md:text-[10px] tracking-widest">
                          {filters.search || filters.type !== 'ALL'
                            ? 'Aucune archive ne correspond aux filtres'
                            : 'Aucune archive dans la chambre forte'}
                        </p>
                        {(filters.search || filters.type !== 'ALL') && (
                          <button
                            type="button"
                            onClick={() => setFilters({ search: '', type: 'ALL' })}
                            className="mt-3 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
                          >
                            Réinitialiser les filtres
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          
          {/* Footer info */}
          <footer className="mt-4 md:mt-6 text-center pb-4">
            <p className="text-[7px] md:text-[8px] text-slate-600 uppercase italic tracking-widest">
              Conformité ISO 9001:2015 §7.5.3 • Conservation des informations documentées • {data.length} archives au total
            </p>
          </footer>
        </div>
      </main>

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