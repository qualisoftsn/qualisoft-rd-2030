/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📍 MODULE : SITES & IMPLANTATIONS (ELITE-SDE)
 * RÔLE : Gestion cartographique des points d'exploitation
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useEffect, useCallback, KeyboardEvent } from 'react';
import { MapPin, Plus, Loader2, Edit3, Trash2, Building2, ChevronLeft, Save, AlertCircle, MoreVertical } from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Site {
  S_Id: string;
  S_Name: string;
  S_Address?: string;
  S_City?: string;
  S_Country?: string;
  S_Latitude?: number;
  S_Longitude?: number;
  S_IsActive?: boolean;
  S_CreatedAt?: string;
  S_Description?: string;
  S_Code?: string;
}

export interface SiteCardProps {
  site: Site;
  onEdit?: (site: Site) => void;
  onDelete?: (site: Site) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
}

export interface LoadingStateProps {
  label: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING STATE
// ============================================================================

function LoadingState({ label }: LoadingStateProps) {
  return (
    <div 
      className="h-full flex items-center justify-center bg-[#0B0F1A]"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 md:gap-6">
        <Loader2 className="animate-spin text-blue-400 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" aria-hidden="true" />
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">{label}</p>
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SITE CARD
// ============================================================================

function SiteCard({ site, onEdit, onDelete, onKeyDown }: SiteCardProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit?.(site);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(site);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Supprimer le site "${site.S_Name}" ?`)) {
      onDelete?.(site);
    }
  };

  return (
    <article 
      className="bg-white/5 border border-white/5 p-4 md:p-6 lg:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] group hover:border-blue-500/50 transition-all duration-500 shadow-inner relative flex flex-col focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="article"
      aria-label={`Site: ${site.S_Name}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex justify-between items-start mb-4 md:mb-6 lg:mb-8 lg:mb-10">
        <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-blue-600/10 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg shrink-0">
          <Building2 size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <button 
            type="button"
            onClick={handleEditClick}
            className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl text-slate-400 hover:text-white hover:bg-blue-600 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={`Modifier ${site.S_Name}`}
            title="Modifier"
          >
            <Edit3 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
          </button>
          <button 
            type="button"
            onClick={handleDeleteClick}
            className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label={`Supprimer ${site.S_Name}`}
            title="Supprimer"
          >
            <Trash2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="flex-1 space-y-2 md:space-y-3">
        <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tighter m-0 truncate text-white">
          {site.S_Name}
        </h3>
        <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 md:gap-2 m-0">
          <MapPin size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" aria-hidden="true" /> 
          {site.S_Address || 'Afrique de l\'Ouest'}
        </p>
      </div>
      <div className="absolute -bottom-6 md:-bottom-8 lg:-bottom-10 -right-6 md:-right-8 lg:-right-10 w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-blue-600/5 blur-3xl rounded-full group-hover:bg-blue-600/10 transition-all duration-700" aria-hidden="true" />
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SitesRegistry() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Site[]>('/sites');
      setSites(Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []));
    } catch (error) {
      console.error('❌ Erreur chargement sites:', error);
      toast.error("Rupture de liaison avec le registre des sites.");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') refresh(); }, [refresh]);

  const handleEditSite = (site: Site) => {
    toast.info(`Modification: ${site.S_Name}`);
    // router.push(`/sites/${site.S_Id}`);
  };

  const handleDeleteSite = async (site: Site) => {
    const toastId = toast.loading("Suppression en cours...");
    try {
      await apiClient.delete(`/sites/${site.S_Id}`);
      toast.success("Site supprimé", { id: toastId });
      refresh();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Échec de la suppression", { id: toastId });
    }
  };

  const handleSiteKeyDown = (e: KeyboardEvent<HTMLDivElement>, site: Site) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleEditSite(site);
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingState label="Chargement des sites..." />;
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 md:p-12 font-sans italic text-white animate-in fade-in duration-500">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 mb-6 md:mb-8 lg:mb-10 lg:mb-12 shrink-0">
        <div className="space-y-2 md:space-y-3 lg:space-y-4 w-full md:w-auto">
          <Link 
            href="/workspace/setup" 
            className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[9px] font-black uppercase text-slate-500 hover:text-blue-400 transition-colors no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
          >
            <ChevronLeft size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
            <span className="hidden sm:inline">Retour Setup</span>
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:text-7xl font-black uppercase tracking-tighter italic m-0">
            Sites <span className="text-blue-400">SDE</span>
          </h1>
        </div>
        <button 
          type="button"
          className="bg-blue-600 text-white px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-white hover:text-blue-700 transition-all border-none cursor-pointer shadow-xl active:scale-95 flex items-center justify-center gap-1.5 md:gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Créer un nouveau site"
        >
          <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 inline" aria-hidden="true" /> 
          <span className="hidden sm:inline">Nouveau Site</span>
        </button>
      </header>

      <main 
        className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2 pb-6 md:pb-8 lg:pb-10"
        role="region"
        aria-label="Liste des sites"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8" role="list">
          {sites.length > 0 ? sites.map(site => (
            <SiteCard 
              key={site.S_Id} 
              site={site}
              onEdit={handleEditSite}
              onDelete={handleDeleteSite}
              onKeyDown={(e) => handleSiteKeyDown(e, site)}
            />
          )) : (
            <div 
              className="col-span-full h-40 md:h-48 lg:h-56 flex flex-col items-center justify-center text-slate-500 bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl"
              role="status"
            >
              <MapPin size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mb-3 md:mb-4 opacity-20" aria-hidden="true" />
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center px-4">
                Aucun site enregistré
              </p>
              <button 
                type="button"
                className="mt-2 md:mt-3 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
              >
                Créer votre premier site
              </button>
            </div>
          )}
        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}