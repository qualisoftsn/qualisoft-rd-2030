/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : RECLAMATIONS REGISTRY (ISO 9001 §8.2.1)
 * RÔLE : Pilotage du registre des réclamations tiers
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback, useMemo, ChangeEvent, KeyboardEvent } from 'react';
import { toast, Toaster } from 'sonner';
import { Plus, RefreshCcw, FileText, Search, Filter, ShieldAlert, ChevronRight, Activity, AlertCircle } from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { useRouter } from 'next/navigation';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type ReclamationStatus = 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'CLOTURE' | 'REJETE';

export interface Tier {
  TR_Id: string;
  TR_Name: string;
  TR_Type?: 'CLIENT' | 'FOURNISSEUR' | 'PARTENAIRE';
  TR_Email?: string;
  TR_Phone?: string;
}

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
}

export interface Reclamation {
  REC_Id: string;
  REC_Reference: string;
  REC_Object: string;
  REC_Description?: string;
  REC_Status: ReclamationStatus;
  REC_DateReceipt: string;
  REC_DateResolution?: string;
  REC_TierId?: string;
  REC_Tier?: Tier;
  REC_ProcessusId?: string;
  REC_Processus?: Processus;
  REC_Priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  REC_AssignedTo?: string;
  REC_CreatedAt: string;
  REC_UpdatedAt: string;
}

export interface ReclamationStats {
  total: number;
  open: number;
  resolved: number;
  overdue: number;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING STATE
// ============================================================================

function LoadingState() {
  return (
    <div className="h-[300px] md:h-[400px] flex flex-col items-center justify-center gap-4 md:gap-6 opacity-30" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" aria-hidden="true" />
      <p className="text-[10px] md:text-[11px] lg:text-[12px] tracking-widest">Synchronisation SDE...</p>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : EMPTY STATE
// ============================================================================

function EmptyState() {
  return (
    <div className="h-[300px] md:h-[400px] flex flex-col items-center justify-center opacity-10 gap-4 md:gap-6 lg:gap-8 italic grayscale" role="status">
      <FileText size={48} className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" strokeWidth={1} aria-hidden="true" />
      <p className="text-xl md:text-2xl tracking-widest font-black">Aucun signal détecté</p>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : RECLAMATION CARD
// ============================================================================

interface ReclamationCardProps {
  rec: Reclamation;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
}

function ReclamationCard({ rec, onClick, onKeyDown }: ReclamationCardProps) {
  const isResolved = rec.REC_Status === 'RESOLU' || rec.REC_Status === 'CLOTURE';
  
  return (
    <article 
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="p-4 md:p-6 lg:p-8 bg-[#0F172A] border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-6 lg:gap-8 group hover:border-blue-500/30 hover:shadow-2xl transition-all cursor-pointer text-left focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="article"
      tabIndex={0}
      aria-label={`Réclamation: ${rec.REC_Object}`}
    >
      <div className="flex items-center gap-4 md:gap-6 lg:gap-8 flex-1 min-w-0">
        <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl bg-black/40 border-2 border-white/5 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform shadow-inner">
          <FileText size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
        </div>
        <div className="space-y-2 md:space-y-3 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4">
            <span className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-500 tracking-widest italic">
              {rec.REC_Reference} • {new Date(rec.REC_DateReceipt).toLocaleDateString('fr-SN')}
            </span>
            <span className={cn(
              "text-[8px] md:text-[9px] px-2 md:px-3 py-1 rounded-lg border font-black uppercase tracking-widest",
              isResolved 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-blue-600/10 border-blue-500/20 text-blue-400"
            )}>
              {rec.REC_Status?.replace('_', ' ')}
            </span>
          </div>
          <h3 className="text-base md:text-lg lg:text-xl font-black italic m-0 uppercase text-white truncate group-hover:text-blue-400 transition-colors">
            {rec.REC_Object}
          </h3>
          <p className="text-[9px] md:text-[10px] text-slate-500 flex items-center gap-1.5 md:gap-2 m-0 font-bold uppercase tracking-widest">
            <ShieldAlert size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-700" aria-hidden="true" /> 
            Tiers : <span className="text-slate-300">{rec.REC_Tier?.TR_Name || "ANONYME"}</span>
          </p>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-4 md:gap-6 w-full xl:w-auto justify-between xl:justify-end">
        <div className="text-right hidden xl:block min-w-[100px]">
          <p className="text-[8px] md:text-[9px] text-slate-700 font-black uppercase tracking-widest m-0">Imputation</p>
          <p className="text-[10px] md:text-[11px] text-slate-400 font-black italic m-0 truncate">
            {rec.REC_Processus?.PR_Libelle || "QUALITÉ GLOBALE"}
          </p>
        </div>
        <ChevronRight 
          size={20} 
          className="w-5 h-5 md:w-6 md:h-6 text-slate-800 group-hover:text-blue-400 group-hover:translate-x-1 md:group-hover:translate-x-2 transition-all" 
          aria-hidden="true" 
        />
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ReclamationsPage() {
  const router = useRouter();
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReclamations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Reclamation[]>('/reclamations');
      const data = Array.isArray(res.data) ? res.data : [];
      setReclamations(data);
    } catch (error) {
      console.error('❌ Erreur chargement réclamations:', error);
      toast.error('ÉCHEC KERNEL : Synchronisation registre ISO 10002 interrompue.');
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchReclamations(); }, [fetchReclamations]);

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase().trim();
    if (!t) return reclamations;
    return reclamations.filter(r => 
      r.REC_Reference?.toLowerCase().includes(t) || 
      r.REC_Object?.toLowerCase().includes(t) ||
      r.REC_Tier?.TR_Name?.toLowerCase().includes(t)
    );
  }, [searchTerm, reclamations]);

  const handleCardClick = (recId: string) => {
    router.push(`/dashboard/quality/reclamations/${recId}`);
  };

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>, recId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      router.push(`/dashboard/quality/reclamations/${recId}`);
    }
  };

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <span className="bg-blue-600/10 border border-blue-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] text-blue-400 tracking-widest italic shadow-inner">
              ISO 9001 §8.2.1 Compliance
            </span>
            <span className="text-slate-500 text-[8px] md:text-[9px] tracking-widest uppercase">
              {reclamations.length} DOSSIER(S) ACTIFS
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic">
            Registre <span className="text-blue-400 underline decoration-white/10">Réclamations</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button 
            type="button"
            onClick={() => router.push('/dashboard/quality/reclamations/nouveau')} 
            className="flex-1 xl:flex-none bg-blue-600 hover:bg-white hover:text-blue-700 px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] shadow-2xl border-none cursor-pointer text-white italic transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3 tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Créer une nouvelle réclamation"
          >
            <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" strokeWidth={3} aria-hidden="true" /> 
            <span className="hidden sm:inline">Nouvel Écart</span>
          </button>
          <button 
            type="button"
            onClick={fetchReclamations} 
            disabled={loading}
            className="p-2.5 md:p-3 lg:p-5 bg-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl hover:bg-white/10 hover:text-blue-400 border border-white/10 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            aria-label="Actualiser la liste des réclamations"
          >
            <RefreshCcw size={20} className={cn("w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8", loading ? "animate-spin" : "")} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* 🔍 FILTRAGE */}
      <nav className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 bg-[#0B1222]/50 border-b border-white/5 flex flex-col md:flex-row gap-4 md:gap-6" role="search" aria-label="Filtrer les réclamations">
        <div className="relative flex-1 group">
          <label htmlFor="reclamation-search" className="sr-only">Rechercher une réclamation</label>
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-400 transition-all pointer-events-none w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          <input 
            id="reclamation-search"
            value={searchTerm} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
            placeholder="FILTRER PAR RÉFÉRENCE, TIERS OU OBJET..." 
            className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] py-2.5 md:py-3 lg:py-5 pl-10 md:pl-16 pr-4 md:pr-6 lg:pr-8 text-[9px] md:text-[10px] lg:text-[11px] font-black italic text-white outline-none focus:border-blue-500 shadow-inner uppercase"
            aria-label="Filtrer les réclamations par référence, tiers ou objet"
          />
        </div>
        <div className="flex gap-3 md:gap-4">
          <button 
            type="button"
            className="px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-5 bg-slate-900 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] font-black text-slate-500 italic flex items-center gap-2 md:gap-3 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Ouvrir les filtres avancés"
          >
            <Filter size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
            <span className="hidden sm:inline">Filtres Avancés</span>
          </button>
        </div>
      </nav>

      {/* 📊 DATA STREAM */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div className="max-w-[100rem] mx-auto space-y-3 md:space-y-4 pb-24 md:pb-28 lg:pb-32" role="list" aria-label="Liste des réclamations">
          {loading ? (
            <LoadingState />
          ) : filtered.length > 0 ? (
            filtered.map((rec) => (
              <ReclamationCard 
                key={rec.REC_Id} 
                rec={rec} 
                onClick={() => handleCardClick(rec.REC_Id)}
                onKeyDown={(e) => handleCardKeyDown(e, rec.REC_Id)}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

      {/* ℹ️ FOOTER */}
      <footer className="shrink-0 px-4 md:px-6 py-3 md:py-4 lg:py-6 border-t border-white/5 bg-black/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-3">
        <p className="text-[8px] md:text-[9px] font-black text-slate-700 tracking-widest m-0 flex items-center gap-2 md:gap-3 uppercase italic">
          <ShieldAlert size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" /> 
          Système de Management de la Satisfaction Client • ISO 10002 • MATRIX RD-2026
        </p>
      </footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}