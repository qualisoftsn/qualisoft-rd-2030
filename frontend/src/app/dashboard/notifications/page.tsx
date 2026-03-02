/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : CENTRE DE SURVEILLANCE ET NOTIFICATIONS (ALERTS-CENTER)
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation et acquittement des flux système et alertes.
 * NORME : Support transversal ISO 9001 (Communication, Écarts, Pilotage).
 * ARCHITECTURE : Zéro NextAuth • Isolation Multi-Tenant (Segment /me).
 * RÉFÉRENTIEL : types/elite-sde.ts (SCELLAGE PRISMA STRICT).
 * DESIGN : Elite Dark Industrial • Glassmorphism • UI Dense.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 12:15 GMT
 */

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Bell, AlertTriangle, CheckCircle, ShieldAlert, Clock, 
  ChevronRight, RefreshCw, Trash2, Info, Activity, Fingerprint
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import apiClient from '@/core/api/api-client';

// --- 🏗️ RÉFÉRENTIEL ÉLITE-SDE ---
import { Notification as INotification, NotificationType } from '@/types/elite-sde';

// --- 🛠️ UTILITAIRES DE PRODUCTION SDE ---

/**
 * Fusion de classes CSS pour le cockpit
 */
const cn = (...classes: (string | boolean | undefined | null)[]) => 
  classes.filter(Boolean).join(' ');

/**
 * Formatteur de date résilient (Gère String ISO et Objets Date)
 */
const formatSDE = (dateInput: string | Date | undefined | null) => {
  if (!dateInput) return "NON DÉFINI";
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(d);
  } catch (e) {
    return "FORMAT ERREUR";
  }
};

type FilterType = 'ALL' | 'CRITICAL' | 'INFO';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * 📡 SYNCHRONISATION DU NOYAU (Heartbeat SDE)
   * Connexion directe via API Client (sécurisée par l'intercepteur de token)
   */
  const fetchNotifications = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const response = await apiClient.get<INotification[]>('/notifications/me');
      // Extraction sécurisée selon la structure de réponse API SDE
      const data = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
      setNotifications(data);
      if (isManual) toast.success("SYNCHRONISATION MATRICIELLE RÉUSSIE");
    } catch (err) {
      if (isManual) toast.error("RUPTURE DE LIAISON AVEC LE NOYAU");
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
    setNotifications(prev => prev.filter(n => n.N_Id !== id)); // Retrait immédiat de l'UI
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch (err) {
      toast.error("ÉCHEC DE L'ACQUITTEMENT RÉSEAU");
      setNotifications(backup); // Rollback en cas d'erreur
    }
  };

  /**
   * 🧹 PURGE DU COCKPIT (Clear All)
   */
  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    if(!confirm("ALERTE SDE : Confirmer l'acquittement global de tout le flux ?")) return;
    
    const backup = [...notifications];
    setNotifications([]); 
    try {
        await apiClient.patch('/notifications/read-all');
        toast.success("REGISTRE DES ALERTES RÉINITIALISÉ");
    } catch (err) {
        toast.error("ÉCHEC DE LA PURGE GLOBALE");
        setNotifications(backup);
    }
  };

  // 🔄 Polling passif toutes les 30 secondes pour rafraîchir le flux
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
   * 🎨 CONFIGURATION DES SIGNAUX VISUELS
   */
  const getSignalConfig = (type: NotificationType) => {
    switch (type) {
      case NotificationType.DANGER: 
      case NotificationType.SSE_ALERT: 
        return { icon: <ShieldAlert size={28} />, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", glow: "shadow-red-500/20" };
      case NotificationType.WARNING: 
        return { icon: <AlertTriangle size={28} />, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/20" };
      case NotificationType.SUCCESS: 
        return { icon: <CheckCircle size={28} />, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/20" };
      default: 
        return { icon: <Info size={28} />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/20" };
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] ml-0 lg:ml-72 p-8 lg:p-12 text-white italic font-sans relative overflow-x-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" theme="dark" richColors />
      
      {/* 🔮 EFFET MATRICIEL DE FOND */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent_60%)] pointer-events-none z-0" />

      <div className="w-full max-w-6xl mx-auto relative z-10 text-left">
        
        {/* 🔝 HEADER COCKPIT */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-12 border-b border-white/5 pb-10 mt-12 lg:mt-0 animate-in fade-in slide-in-from-top-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-blue-500 italic font-black uppercase tracking-[0.4em] text-[10px]">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_12px_#2563eb]" />
              Sovereign Alert System Active
            </div>
            <h1 className="text-5xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none m-0">
              Alerts <span className="text-blue-600">Center</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-4">
            <button onClick={handleMarkAllRead} className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-red-600/10 hover:border-red-500/30 text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-xl italic border border-white/5 flex items-center gap-3">
              <Trash2 size={16} /> Purger Flux
            </button>
            <button onClick={() => fetchNotifications(true)} disabled={isRefreshing} className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-3xl shadow-blue-900/40 flex items-center gap-3 border-none cursor-pointer italic disabled:opacity-50 disabled:cursor-wait">
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? 'Sync...' : 'Actualiser'}
            </button>
          </div>
        </header>

        {/* 🎛️ FILTRES DE SEGMENTATION */}
        <nav className="flex flex-wrap gap-4 mb-12 animate-in fade-in zoom-in-95">
          {(['ALL', 'CRITICAL', 'INFO'] as FilterType[]).map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={cn(
                "px-8 py-3 rounded-xl border text-[10px] font-black uppercase tracking-[0.3em] transition-all cursor-pointer italic",
                activeFilter === filter ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-[#151A2D] text-slate-500 border-white/5 hover:border-white/20 hover:text-white'
              )}>
              {filter === 'ALL' ? 'Flux Intégral' : filter === 'CRITICAL' ? 'Priorité Haute' : 'Informations'}
            </button>
          ))}
        </nav>

        {/* 📋 LISTE DES ALERTES (Saturation Spatiale Optimisée) */}
        <main className="min-h-[50vh] space-y-6">
          {loading ? (
             <div className="space-y-6">
               {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-[2.5rem] bg-slate-900/50 animate-pulse border border-white/5" />)}
             </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[3.5rem] bg-slate-900/20 backdrop-blur-sm animate-in fade-in">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Bell className="text-slate-600" size={40} />
              </div>
              <p className="text-sm font-black uppercase tracking-[0.8em] text-slate-500 italic m-0">Canal Silencieux</p>
              <p className="text-[10px] font-bold text-slate-600 mt-3 uppercase tracking-widest m-0">Aucune alerte en attente dans ce segment</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredNotifications.map((notif, idx) => {
                const config = getSignalConfig(notif.N_Type);
                return (
                  <article key={notif.N_Id} className="group relative rounded-[2.5rem] bg-slate-900/60 border border-white/5 p-8 transition-all duration-500 hover:border-blue-500/30 hover:bg-[#1a2030] hover:translate-x-3 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row gap-8 items-start md:items-center animate-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                    
                    {/* Indicateur visuel d'urgence (Ligne gauche) */}
                    <div className={cn("absolute left-0 top-8 bottom-8 w-1.5 rounded-r-full shadow-lg transition-all", [NotificationType.DANGER, NotificationType.SSE_ALERT].includes(notif.N_Type) ? 'bg-red-500' : notif.N_Type === NotificationType.WARNING ? 'bg-amber-500' : 'bg-blue-600')} />

                    {/* Icône */}
                    <div className={cn("shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110", config.bg, config.color, config.border, config.glow)}>
                      {config.icon}
                    </div>

                    {/* Contenu textuel */}
                    <div className="flex-1 space-y-3 text-left w-full">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter text-white group-hover:text-blue-400 transition-colors leading-none m-0">
                        {notif.N_Title}
                      </h3>
                      <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-3xl italic opacity-80 group-hover:opacity-100 transition-opacity m-0">
                        {notif.N_Message}
                      </p>
                      <div className="flex flex-wrap items-center gap-6 pt-2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
                        <span className="flex items-center gap-2"><Clock size={14} className="text-blue-500" /> {formatSDE(notif.N_CreatedAt)}</span>
                        <span className="hidden md:inline text-slate-800">•</span>
                        <span className="flex items-center gap-2"><Activity size={14} className={config.color} /> {notif.N_Type}</span>
                      </div>
                    </div>

                    {/* Action d'acquittement */}
                    <button onClick={() => handleMarkAsRead(notif.N_Id)} className="shrink-0 w-full md:w-auto px-8 py-4 bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-4 group/btn cursor-pointer shadow-lg italic">
                      Acquitter <ChevronRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        {/* 🔐 FOOTER KERNEL SDE */}
        <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 group opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-6 text-left">
                <Fingerprint size={48} className="text-blue-600/50 group-hover:text-blue-500 group-hover:rotate-180 transition-all duration-1000" strokeWidth={1.5} />
                <div>
                  <p className="text-[12px] font-black uppercase tracking-[0.8em] text-slate-500 italic leading-none m-0 mb-2">Noyau de Sécurité</p>
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic leading-none m-0">
                    Registre SMI • <span className="text-blue-500 font-black">{notifications.length}</span> Entrées Actives
                  </p>
                </div>
            </div>
            <div className="flex flex-col md:items-end italic text-center md:text-right">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-3">Matrix Heartbeat Sync</span>
              <div className="flex justify-center md:justify-end gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_10px_#2563eb] animate-pulse" />
                <div className="w-3 h-3 rounded-full bg-emerald-600 shadow-[0_0_10px_#10b981]" />
              </div>
            </div>
        </footer>
      </div>

      <style jsx global>{`
        /* Suppression radicale des barres de scroll pour le style cockpit */
        .custom-scrollbar::-webkit-scrollbar { width: 0px; display: none; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
    </div>
  );
}