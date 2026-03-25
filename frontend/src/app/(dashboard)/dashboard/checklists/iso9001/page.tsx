/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : CHECKLIST D'AUDIT ISO 9001:2015 (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Évaluation de la conformité du Système de Management de la Qualité
 * VERSION : 2.0 - Typing strict + Design Elite + Accessibilité + CRUD activé
 * API : apiClient Axios avec interceptors (Bearer + X-Tenant-Id)
 * RÉVISION : 19 Mars 2026 | 15:30 GMT
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useMemo, useState, useCallback, ChangeEvent } from 'react';
import {
  CheckCircle2, Download, RefreshCw, Search, Target, XCircle,
  Layers, Loader2, ExternalLink, Check, X, Minus, HelpCircle, ChevronRight,
  AlertCircle, FileText, Printer
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';
import apiClient, { ApiError } from '@/core/api/api-client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ResponseType = 'YES' | 'NO' | 'PARTIAL' | 'NA';

export interface ChecklistResponse {
  CR_Id?: string;
  CR_ChecklistId: string;
  CR_Response: ResponseType;
  CR_IsCompliant: boolean;
  CR_Comment?: string;
  CR_UpdatedAt?: string;
  CR_UpdatedBy?: string;
}

export interface ChecklistItem {
  LC_Id: string;
  LC_Clause: string;
  LC_Title: string;
  LC_Criteria: string;
  LC_IsMandatory: boolean;
  LC_SortOrder?: number;
  LC_Category?: string;
  response?: ChecklistResponse;
}

export interface ChecklistStats {
  total: number;
  compliant: number;
  nonCompliant: number;
  partial: number;
  na: number;
  rate: number;
}

interface Clause {
  id: string;
  title: string;
  description?: string;
}

// ============================================================================
// CONSTANTES : CLAUSES ISO 9001:2015
// ============================================================================

const CLAUSES_9001: Clause[] = [
  { id: '4', title: 'Contexte de l\'organisme', description: 'Enjeux internes/externes, parties intéressées' },
  { id: '5', title: 'Leadership', description: 'Engagement direction, politique, rôles' },
  { id: '6', title: 'Planification', description: 'Risques, opportunités, objectifs' },
  { id: '7', title: 'Support', description: 'Ressources, compétences, communication' },
  { id: '8', title: 'Réalisation des activités', description: 'Planification, conception, production' },
  { id: '9', title: 'Évaluation des performances', description: 'Surveillance, audit, revue' },
  { id: '10', title: 'Amélioration', description: 'Non-conformités, actions correctives' },
];

const RESPONSE_CONFIG: Record<ResponseType, { 
  label: string; 
  color: string; 
  bg: string; 
  icon: React.ElementType;
  compliant: boolean;
}> = {
  YES: { 
    label: 'Conforme', 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    icon: Check,
    compliant: true,
  },
  NO: { 
    label: 'Écart', 
    color: 'text-rose-400', 
    bg: 'bg-rose-500/10 border-rose-500/20',
    icon: X,
    compliant: false,
  },
  PARTIAL: { 
    label: 'Partiel', 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: Minus,
    compliant: false,
  },
  NA: { 
    label: 'N/A', 
    color: 'text-slate-400', 
    bg: 'bg-slate-500/10 border-slate-500/20',
    icon: HelpCircle,
    compliant: true, // N/A ne compte pas comme écart
  },
};

// ============================================================================
// UTILITAIRES
// ============================================================================

const calculateStats = (items: ChecklistItem[]): ChecklistStats => {
  const total = items.length;
  const compliant = items.filter(i => i.response?.CR_Response === 'YES').length;
  const nonCompliant = items.filter(i => i.response?.CR_Response === 'NO').length;
  const partial = items.filter(i => i.response?.CR_Response === 'PARTIAL').length;
  const na = items.filter(i => i.response?.CR_Response === 'NA').length;
  // Taux = (Conformes + N/A) / Total (car N/A n'est pas un échec)
  const rate = total > 0 ? Math.round(((compliant + na) / total) * 100) : 0;
  
  return { total, compliant, nonCompliant, partial, na, rate };
};

const getClauseTitle = (clauseId: string): string => {
  return CLAUSES_9001.find(c => c.id === clauseId)?.title || clauseId;
};

// ============================================================================
// SOUS-COMPOSANT : KPI STAT CARD
// ============================================================================

interface KpiStatProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: 'emerald' | 'blue' | 'rose' | 'amber' | 'slate';
  subtext?: string;
}

function KpiStat({ title, value, icon: Icon, color, subtext }: KpiStatProps) {
  const colorMap: Record<KpiStatProps['color'], string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    rose: 'text-rose-400 bg-rose-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    slate: 'text-slate-400 bg-slate-500/10',
  };

  return (
    <div className="flex items-center gap-3 md:gap-4 bg-[#0F172A]/50 p-3 md:p-4 rounded-2xl border border-white/5">
      <div className={cn("w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0", colorMap[color])}>
        <Icon size={16} className="w-16 h-16 md:w-18 md:h-18 flex-shrink-0" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest m-0">{title}</p>
        <p className="text-lg md:text-xl font-black italic text-white m-0 leading-none mt-0.5">{value}</p>
        {subtext && <p className="text-[7px] text-slate-600 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : RESPONSE BADGE
// ============================================================================

function ResponseBadge({ response }: { response?: ResponseType }) {
  if (!response) {
    return (
      <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest italic">
        Non évalué
      </span>
    );
  }
  const config = RESPONSE_CONFIG[response];
  const Icon = config.icon;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-wider border",
      config.bg, config.color
    )}>
      <Icon size={10} aria-hidden="true" />
      {config.label}
    </span>
  );
}

// ============================================================================
// SOUS-COMPOSANT : RESPONSE BUTTON
// ============================================================================

interface RespBtnProps {
  type: ResponseType;
  active: boolean;
  onClick: () => void;
  saving: boolean;
  'aria-label': string;
}

function RespBtn({ type, active, onClick, saving, 'aria-label': ariaLabel }: RespBtnProps) {
  const config = RESPONSE_CONFIG[type];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cn(
        "w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg transition-all border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
        active 
          ? cn(config.bg, config.color, "shadow-lg") 
          : "text-slate-500 hover:bg-white/5 hover:text-white",
        saving && "opacity-50 cursor-wait"
      )}
    >
      {saving && active ? (
        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
      ) : (
        <Icon size={14} aria-hidden="true" />
      )}
    </button>
  );
}

// ============================================================================
// SOUS-COMPOSANT : CHECKLIST ITEM CARD
// ============================================================================

interface ChecklistItemCardProps {
  item: ChecklistItem;
  onUpdate: (id: string, response: ResponseType) => Promise<void>;
  savingId: string | null;
}

function ChecklistItemCard({ item, onUpdate, savingId }: ChecklistItemCardProps) {
  const isSaving = savingId === item.LC_Id;

  return (
    <article className="bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-7 lg:p-8 hover:border-blue-500/30 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 group">
      
      {/* Contenu principal */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* En-tête : Clause + Badge obligatoire */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[8px] md:text-[9px] font-black italic rounded">
            §{item.LC_Clause}
          </span>
          {item.LC_IsMandatory && (
            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[7px] md:text-[8px] font-black uppercase rounded border border-rose-500/20">
              Obligatoire
            </span>
          )}
          {item.response?.CR_UpdatedAt && (
            <span className="text-[7px] text-slate-600 italic">
              • Modifié le {new Date(item.response.CR_UpdatedAt).toLocaleDateString('fr-SN')}
            </span>
          )}
        </div>
        
        {/* Titre */}
        <h3 className="text-base md:text-lg font-black uppercase italic text-white m-0 group-hover:text-blue-400 transition-colors leading-tight">
          {item.LC_Title}
        </h3>
        
        {/* Critères */}
        <p className="text-[10px] md:text-[11px] text-slate-400 italic m-0 border-l-2 border-white/10 pl-4 leading-relaxed">
          {item.LC_Criteria}
        </p>
        
        {/* Lien vers documentation (optionnel) */}
        {item.LC_Category && (
          <button 
            type="button"
            className="text-[8px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            aria-label={`Voir la documentation pour ${item.LC_Title}`}
          >
            <ExternalLink size={10} aria-hidden="true" /> Documentation ISO
          </button>
        )}
      </div>

      {/* Actions : Badge + Boutons de réponse */}
      <div className="flex flex-col items-end gap-3 shrink-0 w-full lg:w-auto">
        <ResponseBadge response={item.response?.CR_Response} />
        
        <div className="flex bg-[#0B0F1A] rounded-xl p-1 border border-white/5" role="radiogroup" aria-label={`Évaluer: ${item.LC_Title}`}>
          {(Object.keys(RESPONSE_CONFIG) as ResponseType[]).map((type) => (
            <RespBtn
              key={type}
              type={type}
              active={item.response?.CR_Response === type}
              onClick={() => onUpdate(item.LC_Id, type)}
              saving={isSaving}
              aria-label={`Marquer comme ${RESPONSE_CONFIG[type].label}`}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ISO9001ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClause, setActiveClause] = useState<string>('4');
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // ============================================================================
  // FETCH DATA
  // ============================================================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ChecklistItem[]>('/checklist?standard=ISO9001');
      const data = Array.isArray(response.data) ? response.data : [];
      setItems(data);
    } catch (error) {
      console.error('❌ Erreur chargement checklist ISO 9001:', error);
      toast.error("Échec de synchronisation avec le référentiel ISO 9001");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ============================================================================
  // CALCULS & FILTRES
  // ============================================================================

  const stats = useMemo((): ChecklistStats => calculateStats(items), [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchClause = item.LC_Clause.startsWith(activeClause);
      const matchSearch = !searchTerm || 
        item.LC_Title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.LC_Clause.includes(searchTerm) ||
        item.LC_Criteria.toLowerCase().includes(searchTerm.toLowerCase());
      return matchClause && matchSearch;
    });
  }, [items, activeClause, searchTerm]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const updateResponse = async (id: string, response: ResponseType) => {
    if (savingId) return; // Éviter les doubles clics
    
    setSavingId(id);
    const toastId = toast.loading("Enregistrement de l'évaluation...");
    
    try {
      await apiClient.post<ChecklistResponse>('/checklist/response', {
        LC_Id: id,
        CR_Response: response,
      });
      
      toast.success(`Évaluation §${id} mise à jour`, { id: toastId });
      // Rafraîchir pour avoir les données à jour
      await fetchData();
      
    } catch (error: any) {
      console.error('❌ Erreur mise à jour réponse:', error);
      const apiError = error?.response?.data as ApiError | undefined;
      const message = apiError?.message || error?.message || "Erreur de sauvegarde";
      toast.error(message, { id: toastId, duration: 5000 });
    } finally {
      setSavingId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    const toastId = toast.loading("Génération du rapport de conformité...");
    
    try {
      // Appel API pour export PDF/Excel
      const response = await apiClient.get<Blob>('/checklist/export?standard=ISO9001&format=pdf', {
        responseType: 'blob',
      });
      
      // Téléchargement du fichier
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `checklist-iso9001-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Rapport téléchargé avec succès", { id: toastId });
    } catch (error) {
      console.error('❌ Erreur export:', error);
      toast.error("Échec de génération du rapport", { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = async () => {
    const toastId = toast.loading("Synchronisation...");
    try {
      await fetchData();
      toast.success("Checklist mise à jour", { id: toastId });
    } catch {
      toast.error("Échec de synchronisation", { id: toastId });
    }
  };

  // ============================================================================
  // ÉTATS D'AFFICHAGE
  // ============================================================================

  if (loading && items.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0B0F1A]" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={48} aria-hidden="true" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse text-blue-400">
            Extraction Clause §9001...
          </span>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] text-white italic font-sans overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 EN-TÊTE FIXE */}
      <header className="shrink-0 p-4 md:p-6 lg:p-8 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-md z-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
        <div className="space-y-3 md:space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic rounded-full">
              SMI CORE
            </span>
            <span className={cn(
              "px-3 py-1 border rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest italic",
              stats.rate >= 90 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
              stats.rate >= 75 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
              "bg-rose-500/10 border-rose-500/20 text-rose-400"
            )}>
              {stats.rate}% Conformité
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter m-0 leading-none text-white">
            Checklist <span className="text-blue-500">ISO 9001</span>
          </h1>
          <p className="text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.3em] m-0">
            Évaluation Systémique des Clauses Qualité
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Recherche */}
          <div className="relative flex-1 md:w-64 lg:w-72">
            <label htmlFor="checklist-search" className="sr-only">Rechercher une exigence</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} aria-hidden="true" />
            <input 
              id="checklist-search"
              type="search"
              placeholder="FILTRER EXIGENCE..." 
              className="w-full bg-[#0F172A] border border-white/10 rounded-2xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 text-[9px] md:text-[10px] font-black uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-white italic placeholder:text-slate-600"
              value={searchTerm} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              aria-label="Filtrer les exigences ISO 9001"
            />
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExport}
              disabled={exporting}
              className="p-2.5 md:p-3 bg-white/5 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Exporter le rapport de conformité"
              title="Exporter en PDF"
            >
              {exporting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
            </button>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="p-2.5 md:p-3 bg-white/5 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Actualiser la checklist"
              title="Synchroniser"
            >
              <RefreshCw size={16} className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0" className={cn(loading && "animate-spin")} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* 📊 KPI BAR FIXE */}
      <div className="shrink-0 px-4 md:px-6 lg:px-10 py-3 md:py-4 bg-black/20 border-b border-white/5 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiStat title="Total" value={stats.total} icon={Layers} color="slate" subtext="exigences" />
        <KpiStat title="Conforme" value={stats.compliant} icon={CheckCircle2} color="emerald" />
        <KpiStat title="Écarts" value={stats.nonCompliant} icon={XCircle} color="rose" />
        <KpiStat title="Score" value={`${stats.rate}%`} icon={Target} color="blue" subtext="objectif: 95%" />
      </div>

      {/* 📜 ZONE DE TRAVAIL */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Navigation Clauses */}
        <aside className="w-full lg:w-72 xl:w-80 border-r border-white/5 bg-[#0F172A]/30 overflow-y-auto custom-scrollbar shrink-0">
          <div className="p-4 border-b border-white/5 bg-black/20 sticky top-0 z-10">
             <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest m-0">
               Structure de la Norme
             </p>
          </div>
          <nav className="divide-y divide-white/5" role="tablist" aria-label="Navigation des clauses ISO 9001">
            {CLAUSES_9001.map((clause) => {
              const isActive = activeClause === clause.id;
              return (
                <button 
                  key={clause.id} 
                  onClick={() => setActiveClause(clause.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveClause(clause.id);
                    }
                  }}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`clause-${clause.id}`}
                  className={cn(
                    "w-full p-4 text-left transition-all border-none cursor-pointer flex justify-between items-center group focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset",
                    isActive 
                      ? "bg-blue-600/10 border-l-4 border-l-blue-500" 
                      : "hover:bg-white/5 border-l-4 border-l-transparent"
                  )}
                >
                  <div className="min-w-0">
                    <p className={cn(
                      "text-[9px] md:text-[10px] font-black uppercase italic truncate m-0",
                      isActive ? "text-blue-400" : "text-slate-300 group-hover:text-slate-200"
                    )}>
                      §{clause.id}. {clause.title}
                    </p>
                    {clause.description && !isActive && (
                      <p className="text-[7px] text-slate-600 mt-0.5 truncate">{clause.description}</p>
                    )}
                  </div>
                  <ChevronRight 
                    size={14} 
                    className={cn("shrink-0 transition-transform", isActive ? "text-blue-500" : "text-slate-700")} 
                    aria-hidden="true" 
                  />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Checklist Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 xl:p-10">
          <div className="max-w-5xl mx-auto space-y-4 md:space-y-5">
            
            {/* En-tête de section */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h2 className="text-lg md:text-xl font-black uppercase italic text-white">
                Clause §{activeClause} — {getClauseTitle(activeClause)}
              </h2>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">
                {filteredItems.length} exigence{filteredItems.length > 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Liste des items */}
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <ChecklistItemCard 
                  key={item.LC_Id} 
                  item={item} 
                  onUpdate={updateResponse}
                  savingId={savingId}
                />
              ))
            ) : (
              <div 
                className="h-48 md:h-64 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-500"
                role="status"
                aria-live="polite"
              >
                <Search size={40} className="w-40 h-40 md:w-48 md:h-48 flex-shrink-0" className="mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                <p className="text-[9px] md:text-[10px] font-black uppercase italic tracking-widest text-center px-4">
                  {searchTerm 
                    ? 'Aucune exigence ne correspond au filtre' 
                    : 'Aucune exigence dans cette clause'}
                </p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-3 text-[8px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
                  >
                    Effacer le filtre
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Buffer pour mobile */}
          <div className="h-20 md:h-12" aria-hidden="true" />
        </main>
      </div>

      {/* 🧪 GLOBAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(37, 99, 235, 0.3); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(37, 99, 235, 0.5); 
        }
        :focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
