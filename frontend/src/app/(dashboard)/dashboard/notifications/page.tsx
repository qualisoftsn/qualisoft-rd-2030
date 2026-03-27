/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : ALERTS-CENTER §7.4 (ISO 9001)
 * RÔLE : Centralisation et acquittement des flux système et alertes
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Bell, AlertTriangle, CheckCircle, ShieldAlert, Clock, 
  ChevronRight, RefreshCw, Trash2, Info, Activity, Fingerprint, X
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER' | 'SSE_ALERT' | 'SYSTEM';
export type FilterType = 'ALL' | 'CRITICAL' | 'INFO';

export interface Notification {
  N_Id: string;
  N_Title: string;
  N_Message: string;
  N_Type: NotificationType;
  N_IsRead: boolean;
  N_CreatedAt: string;
  N_UserId: string;
  N_ActionUrl?: string;
  N_ActionLabel?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const CRITICAL_TYPES: NotificationType[] = ['DANGER', 'SSE_ALERT', 'WARNING'];
const INFO_TYPES: NotificationType[] = ['INFO', 'SUCCESS'];

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
// COMPOSANT PRINCIPAL
// ============================================================================

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- 📡 SYNCHRONISATION KERNEL ---
  const fetchNotifications = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const response = await apiClient.get<Notification[]>('/notifications/me');
      const data = Array.isArray(response.data) ? response.data : [];
      setNotifications(data);
      if (isManual) toast.success("FLUX MATRICIEL SYNCHRONISÉ");
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
      toast.error("RUPTURE DE LIAISON KERNEL");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchNotifications();
      const interval = setInterval(() => fetchNotifications(), 30000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    const backup = [...notifications];
    setNotifications(prev => prev.filter(n => n.N_Id !== id));
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      toast.success("Notification acquittée");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ÉCHEC DE L'ACQUITTEMENT");
      setNotifications(backup);
    }
  };

  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    if (!confirm("SCELLAGE : Confirmer l'acquittement global du flux ?")) return;
    
    const backup = [...notifications];
    setNotifications([]); 
    try {
      await apiClient.patch('/notifications/read-all');
      toast.success("REGISTRE RÉINITIALISÉ");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ERREUR DE PURGE");
      setNotifications(backup);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeFilter === 'CRITICAL') return CRITICAL_TYPES.includes(n.N_Type);
      if (activeFilter === 'INFO') return INFO_TYPES.includes(n.N_Type);
      return true;
    });
  }, [notifications, activeFilter]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Scan des fréquences d'alerte..." />;
  }

  const filterOptions: Array<{ value: FilterType; label: string }> = [
    { value: 'ALL', label: 'Flux Intégral' },
    { value: 'CRITICAL', label: 'Priorité Haute' },
    { value: 'INFO', label: 'Informations' },
  ];

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" theme="dark" richColors closeButton />
      
      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 md:gap-3 text-blue-400 text-[9px] md:text-[10px] tracking-widest">
            <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_12px_#2563eb]" aria-hidden="true" />
            Sovereign Alert System Active
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0">Alerts <span className="text-blue-400">Center</span></h1>
        </div>
        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button 
            type="button"
            onClick={handleMarkAllRead} 
            className="px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-[9px] md:text-[10px] cursor-pointer italic uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Acquitter toutes les notifications"
          >
            <Trash2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1.5 md:mr-2" aria-hidden="true" /> 
            <span className="hidden sm:inline">Purger Flux</span>
          </button>
          <button 
            type="button"
            onClick={() => fetchNotifications(true)} 
            disabled={isRefreshing}
            className={cn(
              "px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl bg-blue-600 text-white shadow-2xl text-[9px] md:text-[10px] cursor-pointer italic uppercase tracking-widest border-none focus:outline-none focus:ring-2 focus:ring-blue-400",
              isRefreshing && "opacity-70 cursor-wait"
            )}
            aria-label="Actualiser les notifications"
            aria-busy={isRefreshing}
          >
            <RefreshCw size={14} className={cn("w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1.5 md:mr-2", isRefreshing && "animate-spin")} aria-hidden="true" /> 
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </header>

      {/* 🧭 SEGMENTATION */}
      <nav className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-0 flex gap-2 md:gap-3 lg:gap-4 overflow-x-auto custom-scrollbar" role="tablist" aria-label="Filtrer les notifications">
        {filterOptions.map((f) => (
          <button 
            key={f.value} 
            type="button"
            onClick={() => setActiveFilter(f.value)} 
            className={cn(
              "px-4 md:px-6 lg:px-8 py-2 md:py-3 rounded-xl border text-[9px] md:text-[10px] transition-all cursor-pointer italic whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-400",
              activeFilter === f.value 
                ? 'bg-white text-slate-900 border-white shadow-2xl scale-105' 
                : 'bg-[#0F172A] text-slate-500 border-white/5 hover:text-white'
            )}
            role="tab"
            aria-selected={activeFilter === f.value}
            aria-controls={`${f.value.toLowerCase()}-panel`}
          >
            {f.label}
          </button>
        ))}
      </nav>

      {/* 📋 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pt-0 md:pt-4 space-y-4" role="region" aria-label="Liste des notifications">
        {filteredNotifications.length === 0 ? (
          <div className="h-64 md:h-80 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] opacity-20" role="status">
            <Bell size={48} className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 md:mb-6" aria-hidden="true" />
            <p className="text-[10px] md:text-[11px] tracking-widest">Canal Silencieux</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isCritical = CRITICAL_TYPES.includes(notif.N_Type);
            
            return (
              <article 
                key={notif.N_Id} 
                className="group relative rounded-2xl md:rounded-3xl lg:rounded-[3rem] bg-[#0F172A] border-2 border-white/5 p-4 md:p-6 lg:p-8 transition-all duration-500 hover:border-blue-500/30 hover:translate-x-1 md:hover:translate-x-2 lg:hover:translate-x-3 shadow-2xl flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 items-start md:items-center focus-within:border-blue-500/30"
                role="article"
                aria-labelledby={`notification-title-${notif.N_Id}`}
              >
                <div className={cn(
                  "absolute left-0 top-8 md:top-10 bottom-8 md:bottom-10 w-1 md:w-1.5 rounded-r-full",
                  isCritical ? 'bg-red-500' : 'bg-blue-600'
                )} aria-hidden="true" />
                
                <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-black/40 flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                  {isCritical ? (
                    <ShieldAlert size={24} className="w-6 h-6 md:w-8 md:h-8 text-red-400" aria-hidden="true" />
                  ) : (
                    <Info size={24} className="w-6 h-6 md:w-8 md:h-8 text-blue-400" aria-hidden="true" />
                  )}
                </div>
                
                <div className="flex-1 space-y-2 md:space-y-3 text-left min-w-0">
                  <h3 id={`notification-title-${notif.N_Id}`} className="text-lg md:text-xl lg:text-2xl tracking-tighter text-white m-0 group-hover:text-blue-400 transition-colors truncate">
                    {notif.N_Title}
                  </h3>
                  <p className="text-[10px] md:text-sm text-slate-400 normal-case font-bold leading-relaxed m-0 italic line-clamp-2">
                    {notif.N_Message}
                  </p>
                  <div className="flex flex-wrap gap-4 md:gap-6 text-[8px] md:text-[9px] text-slate-600 tracking-widest pt-1 md:pt-2">
                    <span className="flex items-center gap-1.5 md:gap-2">
                      <Clock size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" /> 
                      {new Date(notif.N_CreatedAt).toLocaleString('fr-SN')}
                    </span>
                    <span className="flex items-center gap-1.5 md:gap-2">
                      <Activity size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" /> 
                      {notif.N_Type}
                    </span>
                  </div>
                </div>
                
                <button 
                  type="button"
                  onClick={() => handleMarkAsRead(notif.N_Id)} 
                  className="w-full md:w-auto px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 bg-white/5 hover:bg-blue-600 hover:text-white rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] transition-all border-none cursor-pointer italic focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={`Acquitter: ${notif.N_Title}`}
                >
                  Acquitter <ChevronRight size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 inline ml-1 md:ml-2" aria-hidden="true" />
                </button>
              </article>
            );
          })
        )}
      </main>

      <footer className="shrink-0 px-4 md:px-6 py-3 md:py-4 lg:py-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 bg-black/20 opacity-60">
        <div className="flex items-center gap-3 md:gap-4">
          <Fingerprint size={24} className="w-6 h-6 md:w-8 md:h-8 text-blue-400" aria-hidden="true" />
          <span className="text-[9px] md:text-[10px] tracking-widest">Registre SMI • {notifications.length} Alertes Actives</span>
        </div>
        <div className="flex gap-1.5 md:gap-2" aria-hidden="true">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-emerald-600" />
        </div>
      </footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}