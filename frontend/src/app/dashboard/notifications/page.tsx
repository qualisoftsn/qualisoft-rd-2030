/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Bell, AlertTriangle, CheckCircle, ShieldAlert, Clock, 
  ChevronRight, RefreshCw, Trash2, Info 
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import apiClient from '@/core/api/api-client';

/**
 * 🛰️ MODULE : NOTIFICATIONS & FLUX D'ALERTES
 * -------------------------------------------------------------------------
 * RÔLE : Centralisation et acquittement des événements système.
 * * FONCTIONNALITÉS :
 * 1. Synchronisation temps réel (Polling 30s / Heartbeat).
 * 2. Gestion optimiste de l'interface (Optimistic UI) pour une réactivité maximale.
 * 3. Filtrage multicritère des niveaux de priorité (Danger, Warning, Info).
 * 4. Workflow d'acquittement individuel ou groupé.
 */

// --- DÉFINITION DU SCHÉMA DE DONNÉES (PRISMA ALIGNED) ---
interface Notification {
  N_Id: string;
  N_Title: string;
  N_Message: string;
  N_Type: 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER' | 'SSE_ALERT';
  N_IsRead: boolean;
  N_CreatedAt: string;
}

type FilterType = 'ALL' | 'CRITICAL' | 'INFO';

export default function NotificationsPage() {
  // --- ÉTATS DU NOYAU ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * 📡 MOTEUR DE RÉCUPÉRATION DU FLUX
   * Interroge le backend pour récupérer les notifications non lues.
   * L'ID utilisateur est géré par le middleware via le token Bearer.
   */
  const fetchNotifications = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    
    try {
      // Appel vers le endpoint de production
      const response = await apiClient.get<Notification[]>('/notifications/me');
      
      // Validation du format de données
      const data = Array.isArray(response.data) ? response.data : [];
      setNotifications(data);
      
      if (isManual) toast.success("Flux synchronisé avec le Noyau.");

    } catch (err) {
      console.error("ERREUR_FLUX_NOTIF:", err);
      // On n'affiche l'erreur que lors d'une action manuelle pour éviter le spam visuel
      if (isManual) toast.error("Échec de synchronisation du flux.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /**
   * ✅ GESTIONNAIRE D'ACQUITTEMENT INDIVIDUEL
   * Utilise une mise à jour optimiste pour supprimer l'alerte immédiatement de la vue.
   */
  const handleMarkAsRead = async (id: string) => {
    // 1. Sauvegarde pour rollback éventuel et mise à jour immédiate
    const targetNotif = notifications.find(n => n.N_Id === id);
    setNotifications(prev => prev.filter(n => n.N_Id !== id));

    try {
      // 2. Persistance côté serveur
      await apiClient.patch(`/notifications/${id}/read`);
      
      toast.success("Alerte acquittée", {
        description: targetNotif?.N_Title,
        icon: <CheckCircle className="text-emerald-500" size={16}/>,
        duration: 2000
      });
    } catch (err) {
      // 3. Rollback en cas d'échec de communication API
      toast.error("Erreur d'acquittement réseau");
      fetchNotifications(); 
    }
  };

  /**
   * 🧹 ACQUITTEMENT GLOBAL
   * Permet de purger le cockpit de toutes les alertes en attente.
   */
  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    if(!confirm("Voulez-vous acquitter l'intégralité du flux visible ?")) return;

    // Mise à jour optimiste de la liste
    const backup = [...notifications];
    setNotifications([]); 

    try {
        await apiClient.patch('/notifications/read-all');
        toast.success("Cockpit de notifications réinitialisé.");
    } catch (err) {
        toast.error("Échec de l'opération groupée.");
        setNotifications(backup); // Restauration des données en cas d'échec
    }
  };

  /**
   * 💓 CYCLE DE VIE & HEARTBEAT
   * Mise en place du rafraîchissement automatique toutes les 30 secondes.
   */
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(() => fetchNotifications(), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  /**
   * 🔍 LOGIQUE DE FILTRAGE (MÉMOÏSÉE)
   * Optimise les performances lors des changements de filtres ou de données.
   */
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (activeFilter === 'CRITICAL') {
        return ['DANGER', 'SSE_ALERT', 'WARNING'].includes(n.N_Type);
      }
      if (activeFilter === 'INFO') {
        return ['INFO', 'SUCCESS'].includes(n.N_Type);
      }
      return true;
    });
  }, [notifications, activeFilter]);

  // --- RENDU VISUEL : HELPERS ---

  const getIcon = (type: string) => {
    switch (type) {
      case 'DANGER': 
      case 'SSE_ALERT': return <ShieldAlert size={32} />;
      case 'WARNING': return <AlertTriangle size={32} />;
      case 'SUCCESS': return <CheckCircle size={32} />;
      default: return <Info size={32} />;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'DANGER': 
      case 'SSE_ALERT': return 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/10';
      case 'WARNING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/10';
      case 'SUCCESS': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-[#2563eb]/30 font-sans italic relative overflow-hidden">
      {/* Gestionnaire de notifications flottantes */}
      <Toaster position="top-right" theme="dark" />
      
      {/* EFFET DE PROFONDEUR DE FOND */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent_50%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10 text-left">
        
        {/* 🔝 EN-TÊTE : ÉTAT DU CANAL */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse shadow-[0_0_10px_#2563eb]" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Station de Surveillance</p>
            </div>
            <h1 className="text-4xl md:text-3xl font-black italic tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-linear-to-r from-white to-slate-500">
              Alertes <span className="text-[#2563eb]">Center</span>
            </h1>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => handleMarkAllRead()}
              disabled={notifications.length === 0}
              className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              <Trash2 size={14} /> Tout Acquitter
            </button>
            <button 
              onClick={() => fetchNotifications(true)}
              disabled={isRefreshing}
              className="px-6 py-4 rounded-2xl bg-[#2563eb] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2 cursor-pointer border-none"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? 'Sync...' : 'Actualiser'}
            </button>
          </div>
        </header>

        {/* 🎛️ FILTRES DE PRIORITÉ */}
        <nav className="flex flex-wrap gap-4 mb-10">
          {(['ALL', 'CRITICAL', 'INFO'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-8 py-3 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                activeFilter === filter 
                ? 'bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                : 'bg-transparent text-slate-500 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {filter === 'ALL' ? 'Tout le flux' : filter === 'CRITICAL' ? 'Priorité Haute' : 'Informations'}
            </button>
          ))}
        </nav>

        {/* 📋 LISTE DES ÉVÉNEMENTS */}
        <main className="min-h-100">
          {loading ? (
             <div className="space-y-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-32 rounded-4xl bg-white/5 animate-pulse border border-white/5" />
               ))}
             </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-[3rem] bg-white/2">
              <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                <Bell className="text-slate-600" size={40} />
              </div>
              <h3 className="text-xl font-black italic uppercase text-slate-300 mb-2 tracking-tighter">Canal Silencieux</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 italic">Aucun événement répertorié pour &quot;{activeFilter}&quot;</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredNotifications.map((notif) => (
                <article 
                  key={notif.N_Id}
                  className="group relative rounded-[2.5rem] bg-[#131825] border border-white/5 p-8 transition-all duration-300 hover:border-white/10 hover:bg-[#1a2030] hover:translate-x-2"
                >
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    
                    {/* SYMBOLE D'ALERTE */}
                    <div className={`shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center border shadow-lg ${getColorClass(notif.N_Type)}`}>
                      {getIcon(notif.N_Type)}
                    </div>

                    {/* CORPS DE L'ALERTE */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-4">
                        <span className={`w-2 h-2 rounded-full ${notif.N_Type === 'DANGER' || notif.N_Type === 'SSE_ALERT' ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                        <h3 className="text-2xl font-black italic uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors">
                          {notif.N_Title}
                        </h3>
                      </div>
                      
                      <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-2xl italic">
                        {notif.N_Message}
                      </p>

                      <div className="flex items-center gap-6 pt-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">
                        <span className="flex items-center gap-2"><Clock size={10} /> {new Date(notif.N_CreatedAt).toLocaleTimeString()}</span>
                        <span>•</span>
                        <span>{new Date(notif.N_CreatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* BOUTON D'ACQUITTEMENT */}
                    <button 
                      onClick={() => handleMarkAsRead(notif.N_Id)}
                      className="shrink-0 self-end md:self-center px-8 py-4 bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 group/btn cursor-pointer"
                    >
                      Acquitter <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  
                  {/* BARRE LATÉRALE DE STATUS */}
                  <div className={`absolute left-0 top-8 bottom-8 w-1 rounded-r-full ${
                    notif.N_Type === 'DANGER' || notif.N_Type === 'SSE_ALERT' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 
                    notif.N_Type === 'WARNING' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-slate-700'
                  }`} />
                </article>
              ))}
            </div>
          )}
        </main>

        {/* 🔐 PIED DE PAGE : INTÉGRITÉ SYSTÈME */}
        <footer className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
            <div>
                <span className="text-slate-400 font-black">{notifications.length}</span> Éléments en attente de traitement
            </div>
            <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="italic">Noyau de données opérationnel</span>
            </div>
        </footer>

      </div>
    </div>
  );
}