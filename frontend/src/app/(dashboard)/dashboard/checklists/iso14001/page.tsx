/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : CHECKLIST D'AUDIT ISO 14001:2015 (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Évaluation du Système de Management Environnemental (SME)
 * VERSION : 2.0 - Typing strict + Design Elite + Contexte Sénégal + Accessibilité
 * API : apiClient Axios avec interceptors
 * RÉVISION : 19 Mars 2026 | 15:45 GMT
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useMemo, useState, useCallback, ChangeEvent } from 'react';
import { 
  Leaf, Target, Flame, Recycle, Zap, CheckCircle, XCircle, AlertTriangle, 
  Minus, RefreshCw, Search, Download, UploadCloud, FileText, MapPin, ChevronDown, 
  Loader2, ExternalLink, Check, HelpCircle, Info
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';
import apiClient, { ApiError } from '@/core/api/api-client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type EnvResponseType = 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL' | 'NA' | 'RISK';

export interface EnvChecklistResponse {
  CR_Id?: string;
  CR_ChecklistId: string;
  CR_Response: EnvResponseType;
  CR_RiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  CR_Comment?: string;
  CR_ActionPlan?: string;
  CR_UpdatedAt?: string;
}

export interface EnvChecklistItem {
  LC_Id: string;
  LC_Clause: string;
  LC_Title: string;
  LC_Criteria: string;
  LC_SenegalSpecific?: boolean;
  LC_RegulationRef?: string;
  LC_EnvironmentalAspect?: 'AIR' | 'WATER' | 'WASTE' | 'SOIL' | 'BIODIVERSITY' | 'ENERGY' | 'NOISE';
  response?: EnvChecklistResponse;
}

interface EnvClause {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

// ============================================================================
// CONSTANTES : PILIERS ISO 14001:2015
// ============================================================================

const CLAUSE_GROUPS: EnvClause[] = [
  { id: '4', label: 'Contexte Organisationnel', icon: Leaf, color: 'text-emerald-400' },
  { id: '5', label: 'Leadership SME', icon: Target, color: 'text-blue-400' },
  { id: '6', label: 'Planification', icon: Target, color: 'text-amber-400' },
  { id: '7', label: 'Support & Ressources', icon: Zap, color: 'text-purple-400' },
  { id: '8', label: 'Opérations SME', icon: Recycle, color: 'text-cyan-400' },
  { id: '9', label: 'Performance', icon: Target, color: 'text-emerald-400' },
  { id: '10', label: 'Amélioration', icon: Flame, color: 'text-rose-400' },
];

const RESPONSE_CONFIG: Record<EnvResponseType, { 
  label: string; 
  color: string; 
  bg: string; 
  icon: React.ElementType;
}> = {
  COMPLIANT: { label: 'Conforme', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
  NON_COMPLIANT: { label: 'Non-conforme', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: XCircle },
  PARTIAL: { label: 'Partiel', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle },
  NA: { label: 'N/A', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: Minus },
  RISK: { label: 'Risque', color: 'text-rose-500', bg: 'bg-rose-600/20 border-rose-500/30', icon: AlertTriangle },
};

const ASPECT_ICONS: Record<NonNullable<EnvChecklistItem['LC_EnvironmentalAspect']>, React.ElementType> = {
  AIR: Flame,
  WATER: Recycle,
  WASTE: Recycle,
  SOIL: Leaf,
  BIODIVERSITY: Leaf,
  ENERGY: Zap,
  NOISE: AlertTriangle,
};

// ============================================================================
// UTILITAIRES
// ============================================================================

const getAspectLabel = (aspect?: EnvChecklistItem['LC_EnvironmentalAspect']): string => {
  const labels: Record<string, string> = {
    AIR: 'Émissions atmosphériques',
    WATER: 'Gestion de l\'eau',
    WASTE: 'Gestion des déchets',
    SOIL: 'Protection des sols',
    BIODIVERSITY: 'Biodiversité',
    ENERGY: 'Efficacité énergétique',
    NOISE: 'Pollution sonore',
  };
  return aspect ? labels[aspect] || aspect : '';
};

const getRiskBadge = (level?: EnvChecklistResponse['CR_RiskLevel']): { label: string; color: string } | null => {
  if (!level) return null;
  const config: Record<string, { label: string; color: string }> = {
    LOW: { label: 'Faible', color: 'text-emerald-400 bg-emerald-500/10' },
    MEDIUM: { label: 'Modéré', color: 'text-amber-400 bg-amber-500/10' },
    HIGH: { label: 'Élevé', color: 'text-orange-400 bg-orange-500/10' },
    CRITICAL: { label: 'Critique', color: 'text-rose-400 bg-rose-500/10' },
  };
  return config[level] || null;
};

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================

function ResponseBadge({ response }: { response?: EnvResponseType }) {
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

function RespBtn({ 
  type, 
  active, 
  onClick, 
  saving, 
  'aria-label': ariaLabel 
}: { 
  type: EnvResponseType; 
  active: boolean; 
  onClick: () => void; 
  saving: boolean;
  'aria-label': string;
}) {
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

function EnvChecklistCard({ 
  item, 
  onUpdate 
}: { 
  item: EnvChecklistItem; 
  onUpdate: (id: string, response: EnvResponseType) => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const AspectIcon = item.LC_EnvironmentalAspect ? ASPECT_ICONS[item.LC_EnvironmentalAspect] : null;
  const riskBadge = getRiskBadge(item.response?.CR_RiskLevel);

  const handleUpdate = async (response: EnvResponseType) => {
    setIsSaving(true);
    try {
      await onUpdate(item.LC_Id, response);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-7 lg:p-8 hover:border-green-500/30 transition-all flex flex-col gap-5 group">
      
      {/* En-tête */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[8px] md:text-[9px] font-black italic rounded">
          §{item.LC_Clause}
        </span>
        {item.LC_SenegalSpecific && (
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[7px] md:text-[8px] font-black uppercase rounded border border-amber-500/20 inline-flex items-center gap-1">
            <MapPin size={9} aria-hidden="true" /> Sénégal
          </span>
        )}
        {item.LC_RegulationRef && (
          <span className="text-[7px] text-slate-500 italic">
            • Réf: {item.LC_RegulationRef}
          </span>
        )}
        {AspectIcon && item.LC_EnvironmentalAspect && (
          <span className="inline-flex items-center gap-1.5 text-[7px] text-slate-400">
            <AspectIcon size={10} aria-hidden="true" />
            {getAspectLabel(item.LC_EnvironmentalAspect)}
          </span>
        )}
      </div>
      
      {/* Titre */}
      <h3 className="text-lg md:text-xl font-black uppercase italic text-white leading-tight m-0 group-hover:text-green-400 transition-colors">
        {item.LC_Title}
      </h3>
      
      {/* Critères */}
      <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed italic m-0 bg-black/40 p-4 md:p-5 rounded-2xl border border-white/5">
        {item.LC_Criteria}
      </p>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-white/5 gap-4">
        {/* Badge + Boutons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <ResponseBadge response={item.response?.CR_Response} />
          
          <div className="flex bg-[#0B0F1A] rounded-xl p-1 border border-white/5" role="radiogroup">
            {(Object.keys(RESPONSE_CONFIG) as EnvResponseType[]).map((type) => (
              <RespBtn
                key={type}
                type={type}
                active={item.response?.CR_Response === type}
                onClick={() => handleUpdate(type)}
                saving={isSaving}
                aria-label={`Marquer comme ${RESPONSE_CONFIG[type].label}`}
              />
            ))}
          </div>
        </div>
        
        {/* Actions secondaires */}
        <div className="flex items-center gap-2">
          {riskBadge && (
            <span className={cn(
              "px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-wider",
              riskBadge.color
            )}>
              Risque: {riskBadge.label}
            </span>
          )}
          <button 
            type="button"
            className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-green-400 hover:bg-green-500/10 transition-all border border-white/5 focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Joindre un document de preuve"
            title="Joindre une preuve"
          >
            <UploadCloud size={16} aria-hidden="true" />
          </button>
          <button 
            type="button"
            className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-green-400 hover:bg-green-500/10 transition-all border border-white/5 focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Consulter la réglementation"
            title="Voir la réglementation"
          >
            <FileText size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ISO14001ChecklistPage() {
  const [items, setItems] = useState<EnvChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<string>('4');
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);

  // ============================================================================
  // FETCH DATA
  // ============================================================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<EnvChecklistItem[]>('/checklist?standard=ISO_14001_2015');
      const data = Array.isArray(response.data) ? response.data : [];
      setItems(data);
    } catch (error) {
      console.error('❌ Erreur chargement checklist ISO 14001:', error);
      toast.error("Échec de synchronisation avec le référentiel ISO 14001");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ============================================================================
  // FILTRES
  // ============================================================================

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchGroup = item.LC_Clause.startsWith(activeGroup);
      const matchSearch = !searchTerm || 
        item.LC_Title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.LC_Clause.includes(searchTerm) ||
        item.LC_Criteria.toLowerCase().includes(searchTerm.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [items, activeGroup, searchTerm]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const updateResponse = async (id: string, response: EnvResponseType) => {
    const toastId = toast.loading("Enregistrement de l'évaluation environnementale...");
    
    try {
      await apiClient.post<EnvChecklistResponse>('/checklist/response', {
        CR_ChecklistId: id,
        CR_Response: response,
      });
      
      toast.success("Impact environnemental évalué", { id: toastId });
      await fetchData();
      
    } catch (error: any) {
      console.error('❌ Erreur mise à jour réponse:', error);
      const apiError = error?.response?.data as ApiError | undefined;
      const message = apiError?.message || error?.message || "Erreur de sauvegarde";
      toast.error(message, { id: toastId, duration: 5000 });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    const toastId = toast.loading("Génération du rapport environnemental...");
    
    try {
      const response = await apiClient.get<Blob>('/checklist/export?standard=ISO_14001&format=pdf', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `checklist-iso14001-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Rapport environnemental téléchargé", { id: toastId });
    } catch (error) {
      console.error('❌ Erreur export:', error);
      toast.error("Échec de génération du rapport", { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  // ============================================================================
  // ÉTATS D'AFFICHAGE
  // ============================================================================

  if (loading && items.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0B0F1A]" role="status" aria-live="polite">
        <Loader2 className="animate-spin text-green-500" size={48} aria-hidden="true" />
      </div>
    );
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] text-white italic font-sans overflow-hidden w-full selection:bg-green-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 p-4 md:p-6 lg:p-8 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-md z-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
        <div className="flex items-start gap-4 md:gap-5">
           <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-xl shadow-green-900/20 border border-green-500/20 shrink-0">
             <Leaf size={24} md:size={32} className="text-white" aria-hidden="true" />
           </div>
           <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black uppercase italic tracking-tighter m-0 leading-none text-white">
                ISO <span className="text-green-500">14001</span> Matrix
              </h1>
              <p className="text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.4em] mt-2 md:mt-3 italic m-0">
                Performance Durable & Protection de l&apos;Écosystème
              </p>
           </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Recherche */}
          <div className="relative flex-1 md:w-64">
            <label htmlFor="env-search" className="sr-only">Rechercher un aspect environnemental</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} aria-hidden="true" />
            <input 
              id="env-search"
              type="search"
              placeholder="ASPECTS ENVIRONNEMENTAUX..." 
              className="w-full bg-[#0F172A] border border-white/10 rounded-2xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 text-[9px] md:text-[10px] font-black uppercase outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/30 text-white italic placeholder:text-slate-600"
              value={searchTerm} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              aria-label="Filtrer les aspects environnementaux"
            />
          </div>
          
          {/* Actions */}
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="px-5 md:px-6 py-2.5 md:py-3 bg-green-600 hover:bg-white hover:text-green-700 rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest border-none text-white transition-all shadow-xl shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Download size={14} aria-hidden="true" />}
            <span className="hidden sm:inline">Rapport</span>
          </button>
        </div>
      </header>

      {/* 📜 WORKZONE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Navigation SME */}
        <aside className="w-full lg:w-72 xl:w-80 border-r border-white/5 bg-[#0F172A]/30 overflow-y-auto custom-scrollbar shrink-0">
           <div className="p-4 border-b border-white/5 bg-black/20 sticky top-0 z-10">
             <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest m-0">
               Piliers Environnementaux
             </p>
           </div>
           <nav className="divide-y divide-white/5" role="tablist" aria-label="Navigation des clauses ISO 14001">
             {CLAUSE_GROUPS.map((group) => {
               const isActive = activeGroup === group.id;
               const Icon = group.icon;
               return (
                 <button 
                   key={group.id} 
                   onClick={() => setActiveGroup(group.id)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' || e.key === ' ') {
                       e.preventDefault();
                       setActiveGroup(group.id);
                     }
                   }}
                   role="tab"
                   aria-selected={isActive}
                   className={cn(
                     "w-full p-4 text-left transition-all border-none cursor-pointer flex justify-between items-center group focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-inset",
                     isActive 
                       ? "bg-green-600/10 border-l-4 border-l-green-500" 
                       : "hover:bg-white/5 border-l-4 border-l-transparent"
                   )}
                 >
                    <span className={cn(
                      "text-[9px] md:text-[10px] font-black uppercase italic flex items-center gap-2",
                      isActive ? group.color : "text-slate-400 group-hover:text-slate-200"
                    )}>
                      <Icon size={14} aria-hidden="true" />
                      §{group.id}. {group.label}
                    </span>
                    <ChevronDown 
                      size={14} 
                      className={cn("shrink-0 transition-transform", isActive ? group.color : "text-slate-800")} 
                      aria-hidden="true" 
                    />
                 </button>
               );
             })}
           </nav>
        </aside>

        {/* List Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 xl:p-10 bg-[#0B0F1A]">
           <div className="max-w-4xl mx-auto space-y-5 md:space-y-6">
             
             {/* En-tête de section */}
             <div className="flex items-center justify-between pb-4 border-b border-white/5">
               <h2 className="text-lg md:text-xl font-black uppercase italic text-white flex items-center gap-2">
                 <Leaf size={18} className="text-green-500" aria-hidden="true" />
                 Pilier §{activeGroup}
               </h2>
               <span className="text-[9px] text-slate-500 uppercase tracking-widest">
                 {filteredItems.length} critère{filteredItems.length > 1 ? 's' : ''}
               </span>
             </div>
             
             {filteredItems.map(item => (
               <EnvChecklistCard 
                 key={item.LC_Id} 
                 item={item} 
                 onUpdate={updateResponse}
               />
             ))}
             
             {/* État vide */}
             {filteredItems.length === 0 && (
               <div className="h-40 md:h-48 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-500" role="status">
                 <Search size={40} className="mb-3 opacity-20" aria-hidden="true" />
                 <p className="text-[9px] md:text-[10px] font-black uppercase italic tracking-widest text-center px-4">
                   {searchTerm 
                     ? 'Aucun aspect ne correspond au filtre' 
                     : 'Aucun critère dans ce pilier'}
                 </p>
                 {searchTerm && (
                   <button 
                     onClick={() => setSearchTerm('')}
                     className="mt-3 text-[8px] text-green-400 hover:text-green-300 uppercase tracking-widest italic focus:outline-none focus:ring-2 focus:ring-green-400 rounded px-3 py-1"
                   >
                     Effacer le filtre
                   </button>
                 )}
               </div>
             )}
           </div>
           
           {/* Buffer mobile */}
           <div className="h-20 md:h-12" aria-hidden="true" />
        </main>
      </div>

      {/* 🧪 GLOBAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(34, 197, 94, 0.3); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(34, 197, 94, 0.5); 
        }
        :focus-visible {
          outline: 2px solid #22c55e;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}