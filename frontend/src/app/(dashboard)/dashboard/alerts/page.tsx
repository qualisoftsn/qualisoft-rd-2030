/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : COCKPIT ALERTES (ISO 9001 §9.1.1)
 * -------------------------------------------------------------------------
 * RÔLE : Surveillance temps réel des échéances, risques et non-conformités
 * VERSION : 3.1 - STRICTEMENT aligné sur schema.prisma (Zéro invention)
 * API : apiClient avec interceptors (Bearer + X-Tenant-Id)
 * RÉVISION : 19 Mars 2026 | Production OVH
 * -------------------------------------------------------------------------
 */

import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import { 
  Bell, CheckCircle, Clock, Search, 
  RefreshCw, ShieldAlert, Loader2, Zap,
  AlertTriangle, Info, Activity, Target,
  ChevronDown, X, Trash2, Eye
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES - STRICTEMENT BASÉS SUR schema.prisma
// ============================================================================

// Alert model - EXACTEMENT comme dans Prisma (champs String, pas d'enum inventé)
export interface Alert {
  AL_Id: string;
  AL_Title: string;
  AL_Message: string;
  AL_Type: string;        // String dans Prisma, pas d'enum défini
  AL_Priority: string;    // String dans Prisma, default "MEDIUM"
  AL_Status: string;      // String dans Prisma, default "UNREAD"
  AL_TriggerDate: string; // ISO string depuis DateTime
  AL_DueDate?: string;    // ISO string depuis DateTime?
  AL_ResolveDate?: string;
  AL_IsActive: boolean;
  AL_RequirementId?: string;
  AL_AuditId?: string;
  AL_ActionId?: string;
  // Relations (optionnelles pour le frontend)
  AL_Requirement?: { RR_Title: string };
  AL_Audit?: { AU_Reference: string; AU_Title: string };
  AL_Action?: { ACT_Title: string };
  tenantId: string;
}

export interface AlertStats {
  unread: number;
  critical: number;
  overdue: number;
  total: number;
}

export interface FilterState {
  search: string;
  priority: string;    // String, pas d'enum restrictif
  type: string;        // String, pas d'enum restrictif
  status: string;      // String, pas d'enum restrictif
}

// ============================================================================
// CONFIGURATION DES AFFICHAGES (UI seulement, pas de contrainte backend)
// ============================================================================

// Couleurs pour l'affichage UI basées sur les valeurs courantes de AL_Priority
const getPriorityDisplay = (priority: string): { label: string; color: string; bg: string; border: string } => {
  const p = priority.toUpperCase();
  if (p === 'CRITICAL' || p === 'URGENT') {
    return { label: 'Critique', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
  }
  if (p === 'HIGH') {
    return { label: 'Élevée', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
  }
  if (p === 'MEDIUM') {
    return { label: 'Moyenne', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
  }
  return { label: priority, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
};

// Icônes pour l'affichage UI basées sur les valeurs courantes de AL_Type
const getTypeIcon = (type: string) => {
  const t = type.toUpperCase();
  if (t.includes('OVERDUE') || t.includes('RETARD')) return AlertTriangle;
  if (t.includes('DEADLINE') || t.includes('ECHEANCE')) return Clock;
  if (t.includes('SSE') || t.includes('SECURITE')) return ShieldAlert;
  if (t.includes('LEGAL') || t.includes('REGLEMENT')) return ShieldAlert;
  return Bell; // Default
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

const isOverdue = (dueDate?: string): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
};

// ============================================================================
// SOUS-COMPOSANT : KPI CARD
// ============================================================================

interface KpiCardProps {
  label: string;
  value: number;
  color: string;
  glow: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

function KpiCard({ label, value, color, glow, icon, onClick }: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "bg-[#0F172A]/80 p-5 md:p-7 lg:p-9 rounded-2xl md:rounded-3xl border border-white/5 relative overflow-hidden group backdrop-blur-xl transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
        glow
      )}
      aria-label={`${label}: ${value}`}
    >
      <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 md:mb-4 relative z-10 m-0">
        {label}
      </p>
      <p className={cn("text-3xl md:text-4xl lg:text-6xl font-black italic leading-none tracking-tighter relative z-10 m-0", color)}>
        {value}
      </p>
      <div className={cn("absolute -right-3 -bottom-3 md:-right-5 md:-bottom-5 opacity-[0.05] group-hover:opacity-[0.15] transition-all duration-700 group-hover:scale-110", color)}>
        {React.cloneElement(icon as React.ReactElement, {
          size: 40,
          className: cn("w-10 h-10 md:w-14 md:h-14 lg:w-18 lg:h-18", (icon as React.ReactElement).props.className),
        })}
      </div>
    </button>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ALERT ITEM
// ============================================================================

interface AlertItemProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

function AlertItem({ alert, onAcknowledge, onMarkRead, onDelete, onView }: AlertItemProps) {
  const priorityDisplay = getPriorityDisplay(alert.AL_Priority);
  const TypeIcon = getTypeIcon(alert.AL_Type);
  const isUnread = alert.AL_Status === 'UNREAD' || alert.AL_Status === 'NEW';
  const isOverdueAlert = isOverdue(alert.AL_DueDate);

  return (
    <article
      className={cn(
        "p-5 md:p-7 lg:p-9 flex flex-col xl:flex-row gap-5 md:gap-7 items-start xl:items-center transition-all hover:bg-white/5 relative overflow-hidden group/alert focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 focus-within:ring-offset-[#0B0F1A] rounded-xl",
        isUnread && "bg-blue-500/5"
      )}
      role="article"
      aria-labelledby={`alert-title-${alert.AL_Id}`}
    >
      {/* Indicateur Non-Lu */}
      {isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 md:w-2 bg-blue-500 shadow-[0_0_15px_#3b82f6]" aria-hidden="true" />
      )}
      
      {/* Icône de Type Dynamique */}
      <div className={cn(
        "shrink-0 w-14 h-14 md:w-18 md:h-18 lg:w-22 lg:h-22 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10 shadow-inner transition-transform group-hover/alert:scale-105",
        priorityDisplay.bg, priorityDisplay.color
      )}>
        <TypeIcon size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
      </div>

      {/* Contenu Texte de l'Alerte */}
      <div className="flex-1 space-y-3 md:space-y-4 w-full min-w-0">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <span className={cn(
            "px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg text-[7px] md:text-[8px] font-black uppercase tracking-widest italic border shrink-0",
            priorityDisplay.bg, priorityDisplay.color, priorityDisplay.border
          )}>
            {priorityDisplay.label}
          </span>
          <h3 
            id={`alert-title-${alert.AL_Id}`}
            className="text-lg md:text-xl lg:text-2xl font-black italic uppercase tracking-tighter text-white leading-none m-0 truncate w-full md:w-auto"
          >
            {alert.AL_Title}
          </h3>
          {isOverdueAlert && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[7px] md:text-[8px] font-black uppercase tracking-wider italic">
              Échue
            </span>
          )}
        </div>
        
        <p className="text-slate-400 font-medium text-[9px] md:text-[10px] leading-relaxed max-w-4xl italic tracking-wide m-0 line-clamp-2 md:line-clamp-3">
          {alert.AL_Message}
        </p>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-1 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-500 italic">
          <span className="flex items-center gap-1.5 bg-[#0B0F1A] px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg border border-white/5">
            <Clock size={10} className="text-blue-400 w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" /> 
            {alert.AL_Type}
          </span>
          <span className="bg-[#0B0F1A] px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg border border-white/5 truncate">
            {formatDateFR(alert.AL_TriggerDate)}
          </span>
          {alert.AL_DueDate && (
            <span className={cn(
              "px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg border truncate",
              isOverdueAlert 
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            )}>
              Échéance: {formatDateFR(alert.AL_DueDate)}
            </span>
          )}
          {alert.AL_Action?.ACT_Title && (
            <span className="bg-[#0B0F1A] px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg border border-white/5 truncate">
              Action: {alert.AL_Action.ACT_Title}
            </span>
          )}
        </div>
      </div>

      {/* 🛡️ BLOC DES BOUTONS - Actions CRUD */}
      <div className="flex flex-row xl:flex-col gap-2 md:gap-3 w-full xl:w-auto mt-4 xl:mt-0 shrink-0">
        {/* Voir détails */}
        <button
          type="button"
          onClick={() => onView(alert.AL_Id)}
          className="p-2.5 md:p-3.5 text-slate-400 hover:text-white bg-[#0B0F1A] border border-white/10 rounded-lg md:rounded-xl transition-all cursor-pointer flex items-center justify-center hover:bg-white/10 w-auto xl:w-full active:scale-95 m-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="Voir les détails"
          aria-label={`Voir les détails de l'alerte: ${alert.AL_Title}`}
        >
          <Eye size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
        </button>
        
        {/* Marquer comme lu */}
        {isUnread && (
          <button
            type="button"
            onClick={() => onMarkRead(alert.AL_Id)}
            className="p-2.5 md:p-3.5 text-blue-400 hover:text-white bg-[#0B0F1A] border border-blue-500/20 rounded-lg md:rounded-xl transition-all cursor-pointer flex items-center justify-center hover:bg-blue-600 w-auto xl:w-full active:scale-95 m-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Marquer comme lu"
            aria-label={`Marquer comme lu: ${alert.AL_Title}`}
          >
            <CheckCircle size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          </button>
        )}
        
        {/* Acquitter / Traiter */}
        {alert.AL_Status !== 'ACKNOWLEDGED' && alert.AL_Status !== 'ARCHIVED' ? (
          <button
            type="button"
            onClick={() => onAcknowledge(alert.AL_Id)}
            className={cn(
              "flex-1 px-4 md:px-5 py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-black uppercase tracking-widest transition-all cursor-pointer border-none text-center flex items-center justify-center gap-1.5 md:gap-2 group/btn italic active:scale-95 m-0 focus:outline-none focus:ring-2 focus:ring-blue-400",
              alert.AL_Priority.toUpperCase() === 'CRITICAL' 
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30"
                : "bg-blue-600 hover:bg-white hover:text-blue-700 text-white shadow-lg shadow-blue-900/20"
            )}
            aria-label={`Traiter l'alerte: ${alert.AL_Title}`}
          >
            <Zap size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover/btn:scale-125 transition-transform" aria-hidden="true" /> 
            <span className="hidden md:inline">Traiter</span>
          </button>
        ) : (
          <span className={cn(
            "flex-1 px-4 md:px-5 py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-1.5 md:gap-2 italic w-full text-center shadow-inner m-0",
            alert.AL_Status === 'ACKNOWLEDGED'
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
          )}>
            <CheckCircle size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
            {alert.AL_Status}
          </span>
        )}
        
        {/* Supprimer / Archiver */}
        <button
          type="button"
          onClick={() => onDelete(alert.AL_Id)}
          className="p-2.5 md:p-3.5 text-slate-400 hover:text-rose-400 bg-[#0B0F1A] border border-white/10 hover:border-rose-500/30 rounded-lg md:rounded-xl transition-all cursor-pointer flex items-center justify-center hover:bg-rose-500/10 w-auto xl:w-full active:scale-95 m-0 focus:outline-none focus:ring-2 focus:ring-rose-400"
          title={alert.AL_Status === 'ARCHIVED' ? 'Restaurer' : 'Archiver'}
          aria-label={alert.AL_Status === 'ARCHIVED' ? `Restaurer l'alerte: ${alert.AL_Title}` : `Archiver l'alerte: ${alert.AL_Title}`}
        >
          <Trash2 size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : ALERTS PAGE
// ============================================================================

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: '',    // String vide = tous
    type: '',        // String vide = tous
    status: '',      // String vide = tous
  });

  // --- 📡 RÉCUPÉRATION DES DONNÉES (CRUD: READ) ---
  const refreshData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setLoading(true);

      const [alertsRes, statsRes] = await Promise.all([
        apiClient.get<Alert[]>('/alerts').catch(() => ({ data: [] })),
        apiClient.get<AlertStats>('/alerts/stats').catch(() => ({ 
          data: { unread: 0, critical: 0, overdue: 0, total: 0 } 
        }))
      ]);
      
      const alertsData = Array.isArray(alertsRes.data) ? alertsRes.data : [];
      setAlerts(alertsData);
      setStats(statsRes.data);
      
      if (isManualRefresh) toast.success("FLUX D'ALERTES SYNCHRONISÉ.");
    } catch (err) {
      console.error('❌ Erreur chargement alerts:', err);
      toast.error("ÉCHEC DE SYNCHRONISATION AVEC LE MOTEUR D'ALERTES SDE.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { 
    if (typeof window !== 'undefined') {
      refreshData(); 
    }
  }, [refreshData]);

  // --- ⚡ ACTIONS CRUD COMPLÈTES ---

  // UPDATE: Acquitter une alerte (CRUD: UPDATE)
  const handleAcknowledge = useCallback(async (id: string) => {
    const toastId = toast.loading("Acquittement et génération de l'action corrective...");
    try {
      // PATCH /alerts/:id avec AL_Status = 'ACKNOWLEDGED'
      await apiClient.patch<Alert>(`/alerts/${id}`, { 
        AL_Status: 'ACKNOWLEDGED',
      });
      toast.success("ALERTE ACQUITTÉE. ACTION INJECTÉE DANS LE PAQ.", { id: toastId });
      refreshData();
    } catch (err) {
      console.error('❌ Erreur acknowledge:', err);
      toast.error("IMPOSSIBLE DE TRAITER CETTE ALERTE. VÉRIFIEZ VOS DROITS.", { id: toastId });
    }
  }, [refreshData]);

  // UPDATE: Marquer comme lu (CRUD: UPDATE)
  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.patch<Alert>(`/alerts/${id}`, {
        AL_Status: 'READ',
      });
      toast.success("SIGNAL MARQUÉ COMME LU.");
      refreshData(); 
    } catch (err) {
      console.error('❌ Erreur mark as read:', err);
      toast.error("ERREUR DE MUTATION LORS DE LA LECTURE.");
    }
  }, [refreshData]);

  // UPDATE: Archiver une alerte (CRUD: UPDATE)
  const handleArchive = useCallback(async (id: string) => {
    const toastId = toast.loading("Archivage de l'alerte...");
    try {
      await apiClient.patch<Alert>(`/alerts/${id}`, {
        AL_Status: 'ARCHIVED',
        AL_IsActive: false,
      });
      toast.success("Alerte archivée", { id: toastId });
      refreshData();
    } catch (err) {
      console.error('❌ Erreur archive:', err);
      toast.error("Impossible d'archiver l'alerte", { id: toastId });
    }
  }, [refreshData]);

  // DELETE: Supprimer définitivement une alerte (CRUD: DELETE)
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Supprimer définitivement cette alerte ? Cette action est irréversible.")) return;
    
    const toastId = toast.loading("Suppression de l'alerte...");
    try {
      await apiClient.delete(`/alerts/${id}`);
      toast.success("Alerte supprimée", { id: toastId });
      refreshData();
    } catch (err) {
      console.error('❌ Erreur delete:', err);
      toast.error("Impossible de supprimer l'alerte", { id: toastId });
    }
  }, [refreshData]);

  // READ: Voir les détails d'une alerte
  const handleViewDetails = useCallback((id: string) => {
    // Navigation vers une page de détails ou modal
    toast.info(`Détails de l'alerte ${id} - Fonctionnalité à implémenter`);
  }, []);

  // --- 🔍 MOTEUR DE FILTRAGE PUR ---
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = (a.AL_Title || '').toLowerCase().includes(searchLower);
      const messageMatch = (a.AL_Message || '').toLowerCase().includes(searchLower);
      const matchesSearch = !filters.search || titleMatch || messageMatch;
      
      // Filtres String flexibles (match partiel, case-insensitive)
      const matchesPriority = !filters.priority || a.AL_Priority.toUpperCase().includes(filters.priority.toUpperCase());
      const matchesType = !filters.type || a.AL_Type.toUpperCase().includes(filters.type.toUpperCase());
      const matchesStatus = !filters.status || a.AL_Status.toUpperCase().includes(filters.status.toUpperCase());
      
      return matchesSearch && matchesPriority && matchesType && matchesStatus;
    });
  }, [alerts, filters]);

  // --- 🎨 GESTION DES FILTRES ---
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // --- 🔄 REFRESH MANUAL ---
  const handleRefresh = useCallback(() => {
    refreshData(true);
  }, [refreshData]);

  // --- 🎯 LOADING STATE ---
  if (loading && alerts.length === 0 && typeof window !== 'undefined') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#0B0F1A] gap-5 md:gap-6 text-white italic" role="status" aria-live="polite">
        <Loader2 className="animate-spin text-blue-500" size={40} md:size={48} aria-hidden="true" />
        <p className="text-blue-400 font-black uppercase text-[9px] md:text-[10px] tracking-widest animate-pulse m-0">
          Synchronisation Matrix...
        </p>
      </div>
    );
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 EN-TÊTE FIXE (Zéro Scroll) */}
      <header className="shrink-0 px-4 md:px-6 lg:px-10 py-4 md:py-6 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-5 md:gap-6">
          <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-3 md:gap-4">
              <span className="px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[7px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-2 italic shadow-inner w-fit">
                <Activity size={12} className="animate-pulse w-3 h-3 md:w-4 md:h-4" aria-hidden="true" /> 
                Live Monitoring
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase italic tracking-tighter leading-none text-white m-0 truncate">
                Cockpit <span className="text-blue-500">Alertes</span>
              </h1>
              <p className="text-slate-500 font-black text-[7px] md:text-[8px] uppercase tracking-widest italic mt-2 md:mt-3 m-0 truncate">
                SURVEILLANCE ISO 9001 & RÉGLEMENTAIRE • TEMPS RÉEL
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Bouton Refresh */}
            <button 
              type="button"
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className={cn(
                "bg-[#0F172A] border border-white/10 px-4 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-slate-900 transition-all cursor-pointer shadow-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400",
                isRefreshing && "cursor-wait"
              )}
              aria-label="Actualiser le flux d'alertes"
            >
              <RefreshCw size={14} className={cn("w-3.5 h-3.5 md:w-4 md:h-4", isRefreshing && "animate-spin")} aria-hidden="true" /> 
              <span className="hidden sm:inline">{isRefreshing ? "Sync..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 📜 ZONE DE DÉFILEMENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

          {/* 📊 INDICATEURS DE PERFORMANCE (KPIs) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5" aria-label="Indicateurs clés">
            <KpiCard 
              label="Non lues" 
              value={stats?.unread || 0} 
              color="text-blue-400" 
              glow="shadow-[0_0_30px_rgba(59,130,246,0.1)]"
              icon={<Bell size={40} className="w-10 h-10 md:w-14 md:h-14 lg:w-18 lg:h-18" aria-hidden="true" />}
              onClick={() => handleFilterChange('status', 'UNREAD')}
            />
            <KpiCard 
              label="Critiques" 
              value={stats?.critical || 0} 
              color="text-rose-400" 
              glow="shadow-[0_0_30px_rgba(244,63,94,0.1)]"
              icon={<AlertTriangle size={40} className="w-10 h-10 md:w-14 md:h-14 lg:w-18 lg:h-18" aria-hidden="true" />}
              onClick={() => handleFilterChange('priority', 'CRITICAL')}
            />
            <KpiCard 
              label="En retard" 
              value={stats?.overdue || 0} 
              color="text-amber-400" 
              glow="shadow-[0_0_30px_rgba(245,158,11,0.1)]"
              icon={<Clock size={40} className="w-10 h-10 md:w-14 md:h-14 lg:w-18 lg:h-18" aria-hidden="true" />}
              onClick={() => {}}
            />
            <KpiCard 
              label="Total" 
              value={stats?.total || 0} 
              color="text-slate-400" 
              glow="shadow-[0_0_30px_rgba(148,163,184,0.1)]"
              icon={<Target size={40} className="w-10 h-10 md:w-14 md:h-14 lg:w-18 lg:h-18" aria-hidden="true" />}
              onClick={() => {
                setFilters({ search: '', priority: '', type: '', status: '' });
              }}
            />
          </section>

          {/* 🔍 FILTRES DE PRÉCISION */}
          <section className="bg-[#0F172A]/90 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 backdrop-blur-xl shadow-2xl sticky top-0 z-30" role="search">
            {/* Recherche */}
            <div className="relative w-full md:flex-1">
              <label htmlFor="alert-search" className="sr-only">Rechercher une alerte</label>
              <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
              <input 
                id="alert-search"
                type="search"
                placeholder="RECHERCHER..." 
                className="w-full bg-[#0B0F1A] border border-white/10 rounded-lg md:rounded-xl pl-10 md:pl-12 pr-4 md:pr-5 py-2.5 md:py-3 text-[8px] md:text-[9px] font-black uppercase text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-slate-600 italic tracking-widest"
                value={filters.search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
                aria-label="Filtrer les alertes par titre ou message"
              />
            </div>
            
            {/* Filtres */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
              {/* Priorité */}
              <div className="relative">
                <label htmlFor="filter-priority" className="sr-only">Filtrer par priorité</label>
                <input
                  id="filter-priority"
                  type="text"
                  placeholder="PRIORITÉ..."
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="px-4 md:px-5 py-2.5 md:py-3 bg-[#0B0F1A] border border-white/10 rounded-lg md:rounded-xl font-black uppercase text-[7px] md:text-[8px] tracking-widest text-slate-400 outline-none focus:border-blue-500 placeholder:text-slate-600 italic w-32 md:w-40"
                  aria-label="Filtrer par priorité (ex: CRITICAL, HIGH)"
                />
              </div>
              
              {/* Type */}
              <div className="relative">
                <label htmlFor="filter-type" className="sr-only">Filtrer par type</label>
                <input
                  id="filter-type"
                  type="text"
                  placeholder="TYPE..."
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="px-4 md:px-5 py-2.5 md:py-3 bg-[#0B0F1A] border border-white/10 rounded-lg md:rounded-xl font-black uppercase text-[7px] md:text-[8px] tracking-widest text-slate-400 outline-none focus:border-blue-500 placeholder:text-slate-600 italic w-32 md:w-40"
                  aria-label="Filtrer par type d'alerte"
                />
              </div>
              
              {/* Reset filters */}
              {(filters.search || filters.priority || filters.type || filters.status) && (
                <button
                  type="button"
                  onClick={() => setFilters({ search: '', priority: '', type: '', status: '' })}
                  className="px-3 md:px-4 py-2.5 md:py-3 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Réinitialiser les filtres"
                >
                  <X size={12} className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </section>

          {/* 📋 REGISTRE DES SIGNAUX */}
          <section className="bg-[#0F172A]/50 rounded-xl md:rounded-2xl shadow-2xl border border-white/5 overflow-hidden backdrop-blur-sm" aria-label="Liste des alertes">
            <div className="divide-y divide-white/5">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <AlertItem
                    key={alert.AL_Id}
                    alert={alert}
                    onAcknowledge={handleAcknowledge}
                    onMarkRead={handleMarkAsRead}
                    onDelete={handleArchive}
                    onView={handleViewDetails}
                  />
                ))
              ) : (
                <div className="py-16 md:py-24 text-center flex flex-col items-center justify-center gap-5 md:gap-6 border-2 border-dashed border-white/5 rounded-xl md:rounded-2xl m-4 md:m-6" role="status">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1 md:mb-2">
                    <CheckCircle className="text-emerald-400/50 w-8 h-8 md:w-10 md:h-10" size={32} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter m-0 px-4">
                    Système Nominal
                  </h3>
                  <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest italic max-w-sm m-0 px-4 md:px-6">
                    {filters.search || filters.priority || filters.type || filters.status
                      ? 'Aucune alerte ne correspond aux filtres'
                      : 'Aucune alerte en attente dans le registre souverain. La conformité est assurée.'}
                  </p>
                  {(filters.search || filters.priority || filters.type || filters.status) && (
                    <button
                      type="button"
                      onClick={() => setFilters({ search: '', priority: '', type: '', status: '' })}
                      className="mt-2 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
          
          {/* Footer info */}
          <footer className="mt-4 md:mt-6 text-center pb-4">
            <p className="text-[7px] md:text-[8px] text-slate-600 uppercase italic tracking-widest">
              Conformité ISO 9001:2015 §9.1.1 • Surveillance et mesure • {alerts.length} alertes au total
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