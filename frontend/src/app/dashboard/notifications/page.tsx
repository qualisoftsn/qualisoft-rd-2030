/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : CENTRE DE SURVEILLANCE ET NOTIFICATIONS (ALERTS-CENTER)
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation et acquittement des flux système (§10.2).
 * ARCHITECTURE : Isolation Multi-Tenant (Segment /me).
 * RÉFÉRENTIEL : types/elite-sde.ts (SCELLAGE PRISMA).
 * -------------------------------------------------------------------------
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Bell, AlertTriangle, CheckCircle, ShieldAlert, Clock, 
  ChevronRight, RefreshCw, Trash2, Info, Zap, Activity, Fingerprint, Calendar
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import apiClient from '@/core/api/api-client';

// --- 🏗️ RÉFÉRENTIEL ÉLITE-SDE ---
import { Notification as INotification, NotificationType } from '@/types/elite-sde';

// --- 🛠️ UTILITAIRES DE PRODUCTION ---

/**
 * Fusion de classes CSS pour le cockpit
 */
const cn = (...classes: (string | boolean | undefined | null)[]) => 
  classes.filter(Boolean).join(' ');

/**
 * Formatteur de date résilient (Gère String ISO et Objets Date)
 */
const formatSDE = (dateInput: string | Date | undefined | null) => {
  if (!dateInput) return "00:00:00";
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(d);
  } catch (e) {
    return "Format Erreur";
  }
};

type FilterType = 'ALL' | 'CRITICAL' | 'INFO';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * 📡 SYNCHRONISATION DU NOYAU (Heartbeat)
   */
  const fetchNotifications = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const response = await apiClient.get<INotification[]>('/notifications/me');
      // Extraction sécurisée selon la structure de réponse API
      const data = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
      setNotifications(data);
      if (isManual) toast.success("SMI : Flux synchronisé.");
    } catch (err) {
      if (isManual) toast.error("Rupture de liaison avec le Noyau.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /**
   * ✅ ACQUITTEMENT OPTIMISTE (Zero-Latency)
   */
  const handleMarkAsRead = async (id: string) => {
    const backup = [...notifications];
    setNotifications(prev => prev.filter(n => n.N_Id !== id));
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch (err) {
      toast.error("Échec de l'acquittement réseau.");
      setNotifications(backup);
    }
  };

  /**
   * 🧹 PURGE DU COCKPIT
   */
  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    if(!confirm("ALERTE : Confirmer l'acquittement global du flux ?")) return;
    const backup = [...notifications];
    setNotifications([]); 
    try {
        await apiClient.patch('/notifications/read-all');
        toast.success("Registre réinitialisé.");
    } catch (err) {
        setNotifications(backup);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  /**
   * 🔍 FILTRAGE PAR PRIORITÉ
   */
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeFilter === 'CRITICAL') {
        return [NotificationType.DANGER, NotificationType.SSE_ALERT, NotificationType.WARNING].includes(n.N_Type);
      }
      if (activeFilter === 'INFO') {
        return [NotificationType.INFO, NotificationType.SUCCESS].includes(n.N_Type);
      }
      return true;
    });
  }, [notifications, activeFilter]);

  /**
   * 🎨 CONFIGURATION DES SIGNAUX
   */
  const getSignalConfig = (type: NotificationType) => {
    switch (type) {
      case NotificationType.DANGER: 
      case NotificationType.SSE_ALERT: 
        return { icon: <ShieldAlert size={44} />, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
      case NotificationType.WARNING: 
        return { icon: <AlertTriangle size={44} />, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      case NotificationType.SUCCESS: 
        return { icon: <CheckCircle size={44} />, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
      default: 
        return { icon: <Info size={44} />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] ml-72 text-white italic font-sans relative overflow-x-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" theme="dark" richColors />
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-500 mx-auto px-16 py-16 relative z-10 text-left">
        
        {/* 🔝 HEADER COCKPIT */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20 border-b-4 border-white/5 pb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-6 text-slate-500 italic font-black uppercase tracking-[0.8em] text-[12px]">
              <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse shadow-[0_0_15px_blue]" />
              Sovereign Alert System
            </div>
            <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">
              Alertes <span className="text-blue-600">Center</span>
            </h1>
          </div>
          <div className="flex gap-8">
            <button onClick={handleMarkAllRead} className="px-14 py-7 rounded-[3rem] border-2 border-white/10 bg-white/5 hover:bg-red-600/10 hover:text-red-500 text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-2xl italic border-none">
              <Trash2 size={24} /> Purger le Flux
            </button>
            <button onClick={() => fetchNotifications(true)} className="px-16 py-7 rounded-[3rem] bg-blue-600 text-white text-[12px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-4xl flex items-center gap-6 border-none cursor-pointer italic shadow-blue-900/40">
              <RefreshCw size={24} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? 'Sync...' : 'Actualiser'}
            </button>
          </div>
        </header>

        {/* 🎛️ FILTRES */}
        <nav className="flex gap-8 mb-20">
          {(['ALL', 'CRITICAL', 'INFO'] as FilterType[]).map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={cn(
                "px-12 py-5 rounded-full border-2 text-[14px] font-black uppercase tracking-[0.4em] transition-all cursor-pointer italic",
                activeFilter === filter ? 'bg-white text-slate-900 border-white shadow-4xl scale-105' : 'bg-transparent text-slate-600 border-white/10 hover:border-white/30 hover:text-white'
              )}>
              {filter === 'ALL' ? 'Flux Intégral' : filter === 'CRITICAL' ? 'Priorité Haute' : 'Informations'}
            </button>
          ))}
        </nav>

        {/* 📋 LISTE DES ALERTES (Saturation Spatiale) */}
        <main className="min-h-150 space-y-12">
          {loading ? (
             <div className="space-y-12">
               {[1, 2, 3].map(i => <div key={i} className="h-56 rounded-[5rem] bg-white/5 animate-pulse border-2 border-white/5" />)}
             </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-64 border-4 border-dashed border-white/5 rounded-[7rem] bg-white/2">
              <Bell className="text-slate-800 mb-10" size={100} />
              <p className="text-[18px] font-black uppercase tracking-[1em] text-slate-800 italic">Canal Silencieux</p>
            </div>
          ) : (
            <div className="grid gap-10">
              {filteredNotifications.map((notif) => {
                const config = getSignalConfig(notif.N_Type);
                return (
                  <article key={notif.N_Id} className="group relative rounded-[5.5rem] bg-[#131825]/90 border-2 border-white/5 p-16 transition-all duration-500 hover:border-blue-600/30 hover:bg-[#1a2030] hover:translate-x-10 shadow-4xl backdrop-blur-2xl">
                    <div className="flex flex-col md:flex-row gap-16 items-start md:items-center">
                      <div className={cn("shrink-0 w-36 h-36 rounded-4xl flex items-center justify-center border-2 shadow-2xl transition-transform group-hover:scale-110", config.bg, config.color, config.border)}>
                        {config.icon}
                      </div>
                      <div className="flex-1 space-y-8 text-left">
                        <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white group-hover:text-blue-500 transition-colors leading-none">
                          {notif.N_Title}
                        </h3>
                        <p className="text-slate-400 text-3xl font-bold leading-relaxed max-w-5xl italic opacity-90 group-hover:opacity-100 transition-opacity">
                          {notif.N_Message}
                        </p>
                        <div className="flex items-center gap-14 pt-10 text-[14px] font-black uppercase tracking-[0.8em] text-slate-600">
                          {/* SÉCURISATION LIGNE DE DATE : formatSDE(notif.N_CreatedAt) */}
                          <span className="flex items-center gap-6"><Clock size={24} className="text-blue-600" /> {formatSDE(notif.N_CreatedAt)}</span>
                          <span className="text-slate-800">•</span>
                          <span className="flex items-center gap-6"><Activity size={24} className="text-blue-600" /> {notif.N_Type}</span>
                        </div>
                      </div>
                      <button onClick={() => handleMarkAsRead(notif.N_Id)} className="shrink-0 self-end md:self-center px-16 py-8 bg-white/5 hover:bg-blue-600 hover:text-white border-2 border-white/10 rounded-[3rem] text-[13px] font-black uppercase tracking-widest transition-all flex items-center gap-8 group/btn cursor-pointer shadow-2xl italic border-none">
                        Acquitter <ChevronRight size={28} className="group-hover/btn:translate-x-5 transition-transform" />
                      </button>
                    </div>
                    <div className={cn("absolute left-0 top-24 bottom-24 w-3 rounded-r-full shadow-2xl transition-all", [NotificationType.DANGER, NotificationType.SSE_ALERT].includes(notif.N_Type) ? 'bg-red-600' : notif.N_Type === NotificationType.WARNING ? 'bg-amber-600' : 'bg-blue-900')} />
                  </article>
                );
              })}
            </div>
          )}
        </main>

        {/* 🔐 FOOTER SDE */}
        <footer className="mt-56 pt-24 border-t-8 border-white/5 flex justify-between items-center group opacity-40">
            <div className="flex items-center gap-14 text-left">
                <Fingerprint size={100} className="text-blue-600 group-hover:rotate-360 transition-all duration-4000" strokeWidth={2.5} />
                <div className="space-y-4">
                  <p className="text-[18px] font-black uppercase tracking-[2em] text-slate-500 italic leading-none">Noyau de Données 2030</p>
                  <p className="text-[14px] font-bold text-slate-700 uppercase tracking-[1em] mt-6 italic leading-none">
                    Registre SMI • <span className="text-blue-600 font-black">{notifications.length}</span> Entrées Actives
                  </p>
                </div>
            </div>
            <div className="flex items-center gap-24">
                <div className="flex flex-col items-end italic">
                  <span className="text-[14px] font-black text-slate-600 uppercase tracking-widest mb-6">Matrix Heartbeat</span>
                  <div className="flex gap-8">
                    <div className="w-6 h-6 rounded-full bg-blue-600 shadow-[0_0_20px_blue] animate-pulse" />
                    <div className="w-6 h-6 rounded-full bg-emerald-600 shadow-[0_0_20px_emerald]" />
                  </div>
                </div>
            </div>
        </footer>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
    </div>
  );
}