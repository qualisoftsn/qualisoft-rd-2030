/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🔔 MODULE : NotificationCenter (QHSE Monitoring Hub)
 * RÔLE : Hub central de monitoring QHSE avec notifications temps réel
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + WebSocket Ready
 */

import React, { useState, useEffect, useCallback, useRef, KeyboardEvent } from 'react';
import { 
  Bell, AlertCircle, CheckCircle2, X, ShieldAlert, 
  ChevronRight, Info, Clock, ExternalLink, Loader2
} from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { toast } from 'sonner';
import Link from 'next/link';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NotificationType = 'urgent' | 'warning' | 'success' | 'info';
export type NotificationCategory = 'audit' | 'maintenance' | 'compliance' | 'security' | 'general';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  category?: NotificationCategory;
  tenantId?: string;
}

export interface NotificationBellProps {
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
  pollInterval?: number;
}

export interface NotificationPanelProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  onViewAll: (notification?: Notification) => void;
  isLoading: boolean;
}

export interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onClick: (notification: Notification) => void;
}

// ============================================================================
// CONSTANTES & UTILITAIRES
// ============================================================================

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; label: string }> = {
  urgent: { icon: AlertCircle, color: 'text-rose-400', label: 'Urgent' },
  warning: { icon: ShieldAlert, color: 'text-amber-400', label: 'Attention' },
  success: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Succès' },
  info: { icon: Info, color: 'text-blue-400', label: 'Info' },
};

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  audit: 'Audit',
  maintenance: 'Maintenance',
  compliance: 'Conformité',
  security: 'Sécurité',
  general: 'Général',
};

const formatTimeAgo = (timestamp: string): string => {
  try {
    const now = new Date();
    const then = new Date(timestamp);
    const diffSec = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diffSec < 60) return 'À l\'instant';
    if (diffSec < 3600) return `Il y a ${Math.floor(diffSec / 60)}min`;
    if (diffSec < 86400) return `Il y a ${Math.floor(diffSec / 3600)}h`;
    return then.toLocaleDateString('fr-SN', { day: 'numeric', month: 'short' });
  } catch {
    return 'Date invalide';
  }
};

const getCategoryIcon = (category?: NotificationCategory): React.ElementType | null => {
  const icons: Record<NotificationCategory, React.ElementType> = {
    audit: ShieldAlert,
    maintenance: Clock,
    compliance: CheckCircle2,
    security: AlertCircle,
    general: Info,
  };
  return category ? icons[category] : null;
};

// ============================================================================
// SOUS-COMPOSANT : NOTIFICATION ITEM
// ============================================================================

function NotificationItem({ notification, onDismiss, onClick }: NotificationItemProps) {
  const config = TYPE_CONFIG[notification.type];
  const Icon = config.icon;
  const CategoryIcon = notification.category ? getCategoryIcon(notification.category) : null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss(notification.id);
  };

  const handleClick = () => {
    onClick(notification);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article 
      className={cn(
        "p-3 md:p-4 border-b border-white/5 hover:bg-white/5 transition-all flex gap-2 md:gap-3 group relative text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset",
        !notification.read && "bg-blue-500/5 border-l-2 border-l-blue-500"
      )}
      role="article"
      aria-label={`Notification: ${notification.title}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Icône de type */}
      <div className={cn("mt-0.5 shrink-0", config.color)}>
        <Icon size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
      </div>
      
      {/* Contenu */}
      <div className="flex-1 min-w-0 pr-6 md:pr-8">
        <div className="flex justify-between items-start mb-0.5 md:mb-1">
          <h4 className={cn(
            "text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-300 leading-none uppercase tracking-widest italic m-0 truncate",
            !notification.read && "text-white"
          )}>
            {notification.title}
          </h4>
          <time 
            className="flex items-center gap-0.5 md:gap-1 text-[6px] md:text-[7px] lg:text-[8px] font-black text-slate-500 uppercase italic shrink-0"
            dateTime={notification.timestamp}
          >
            <Clock size={8} className="w-2 h-2 md:w-2.5 md:h-2.5" aria-hidden="true" /> 
            {formatTimeAgo(notification.timestamp)}
          </time>
        </div>
        
        <p className="text-[8px] md:text-[9px] lg:text-[10px] text-slate-400 leading-relaxed font-medium italic m-0 line-clamp-2">
          {notification.description}
        </p>
        
        {/* Badge catégorie + Action */}
        <div className="flex items-center gap-1.5 md:gap-2 mt-1.5 md:mt-2 flex-wrap">
          {CategoryIcon && notification.category && (
            <span className="flex items-center gap-0.5 md:gap-1 text-[6px] md:text-[7px] text-slate-500 uppercase tracking-wider">
              <CategoryIcon size={8} className="w-2 h-2 md:w-2.5 md:h-2.5" aria-hidden="true" />
              {CATEGORY_LABELS[notification.category]}
            </span>
          )}
          {notification.actionUrl && notification.actionLabel && (
            <Link 
              href={notification.actionUrl}
              onClick={(e) => {
                e.stopPropagation();
                onClick(notification);
              }}
              className="text-[6px] md:text-[7px] lg:text-[8px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest italic flex items-center gap-0.5 md:gap-1 no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            >
              {notification.actionLabel} <ExternalLink size={8} className="w-2 h-2 md:w-2.5 md:h-2.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {/* Bouton fermer */}
      <button 
        type="button"
        onClick={handleDismiss}
        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 md:p-1.5 bg-rose-500/10 text-rose-400 rounded-lg md:rounded-xl hover:bg-rose-500 hover:text-white transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
        aria-label={`Fermer: ${notification.title}`}
        tabIndex={-1}
      >
        <X size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />
      </button>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : NOTIFICATION PANEL
// ============================================================================

function NotificationPanel({ 
  notifications, 
  onDismiss, 
  onMarkAllRead, 
  onViewAll,
  isLoading 
}: NotificationPanelProps) {
  const unreadCount = notifications.filter(n => !n.read).length;
  const panelRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onViewAll(); // This will close the panel via parent
    }
  };

  return (
    <div 
      ref={panelRef}
      className="absolute right-0 mt-2 md:mt-3 w-72 md:w-80 lg:w-96 bg-[#0B0F1A] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-4 duration-300"
      role="dialog"
      aria-label="Centre de notifications"
      aria-modal="true"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Header */}
      <header className="p-3 md:p-4 lg:p-5 border-b border-white/5 flex justify-between items-center bg-[#050810]/80 backdrop-blur-md">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 bg-blue-600/20 rounded-lg md:rounded-xl">
             <ShieldAlert className="text-blue-400 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-black text-white uppercase text-[9px] md:text-[10px] lg:text-[11px] tracking-widest italic m-0 leading-none">
              Tour de Contrôle
            </h4>
            <p className="text-[6px] md:text-[7px] lg:text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 m-0">
              {unreadCount > 0 ? `${unreadCount} non lu${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <button 
            type="button"
            onClick={onMarkAllRead}
            className="text-[7px] md:text-[8px] lg:text-[9px] font-black text-blue-400 hover:text-blue-300 transition-all uppercase italic border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1.5 md:px-2 py-1"
            aria-label="Marquer tout comme lu"
          >
            Tout acquitter
          </button>
        )}
      </header>

      {/* Liste des notifications */}
      <div 
        className="max-h-64 md:max-h-72 lg:max-h-80 overflow-y-auto custom-scrollbar bg-[#0B0F1A]"
        role="list"
        aria-label="Liste des notifications"
      >
        {isLoading ? (
          <div className="p-6 md:p-8 flex flex-col items-center justify-center gap-3 md:gap-4" role="status" aria-live="polite">
            <Loader2 size={20} className="text-blue-400 animate-spin w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
            <p className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-widest italic">Chargement...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 md:p-8 lg:p-12 text-center space-y-3 md:space-y-4" role="status">
            <Bell className="mx-auto opacity-10 text-slate-400 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12" aria-hidden="true" />
            <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-relaxed">
              Le registre est vierge <br/> Aucun signalement actif
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
              onDismiss={onDismiss}
              onClick={onViewAll}
            />
          ))
        )}
      </div>
      
      {/* Footer */}
      <footer className="p-2 md:p-3 lg:p-4 bg-[#050810] text-center border-t border-white/5">
         <Link 
           href="/dashboard/notifications" 
           className="text-[7px] md:text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-all flex items-center justify-center gap-1 md:gap-1.5 lg:gap-2 mx-auto no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded py-1"
           onClick={(e) => {
             e.preventDefault();
             onViewAll();
           }}
         >
           Journal complet <ChevronRight size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" />
         </Link>
      </footer>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : NOTIFICATION BELL
// ============================================================================

export default function NotificationBell({ 
  className, 
  onNotificationClick,
  pollInterval = 30000
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Chargement initial des notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/notifications?limit=10', {
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data: Notification[] = await response.json();
      
      // Fallback avec données de démo si l'API n'est pas dispo
      const demoNotifications: Notification[] = [
        { 
          id: 'demo-1', 
          title: 'ACTION EN RETARD', 
          description: 'Fuite cuve Zone A - Échéance dépassée §14001', 
          type: 'urgent', 
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/workspace/incidents/INC-2026-042',
          actionLabel: 'Traiter',
          category: 'compliance',
        },
        { 
          id: 'demo-2', 
          title: 'AUDIT ISO VALIDÉ', 
          description: 'Rapport d\'audit interne 9001 conforme - Certificat disponible', 
          type: 'success', 
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/workspace/audits/AUD-2026-Q1',
          actionLabel: 'Voir',
          category: 'audit',
        },
        { 
          id: 'demo-3', 
          title: 'VEILLE RÉGLEMENTAIRE', 
          description: 'Nouvelle mise à jour Code du Travail Sénégal - À intégrer au SMS', 
          type: 'info', 
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          category: 'compliance',
        },
      ];
      
      const list: Notification[] = Array.isArray(data) && data.length > 0 ? data : demoNotifications;
      setNotifications(list);
      
    } catch (err) {
      console.error("❌ Erreur chargement notifications:", err);
      setError("Impossible de charger les notifications");
      
      // Fallback vers données de démo en cas d'erreur
      setNotifications([
        { 
          id: 'fallback-1', 
          title: 'Mode Démo', 
          description: 'Connectez l\'API /notifications pour activer les alertes temps réel', 
          type: 'info', 
          timestamp: new Date().toISOString(),
          read: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Polling des nouvelles notifications
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchNotifications();
      
      pollTimerRef.current = setInterval(fetchNotifications, pollInterval);
      
      return () => {
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
        }
      };
    }
  }, [fetchNotifications, pollInterval]);

  // Fermeture du panel au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Gestion clavier (Escape pour fermer)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape as any);
    }
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [isOpen]);

  // Gestion de l'ouverture/fermeture
  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      markAllAsRead();
    }
  }, [isOpen]);

  // Dismiss une notification
  const handleDismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.info("Notification masquée", { duration: 2000 });
  }, []);

  // Marquer tout comme lu
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Clic sur une notification
  const handleNotificationClick = useCallback((notification?: Notification) => {
    if (notification) {
      onNotificationClick?.(notification);
    }
    setIsOpen(false);
  }, [onNotificationClick]);

  // Calcul du badge
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div 
      className={cn("relative font-sans italic", className)}
      ref={panelRef}
      role="region"
      aria-label="Notifications"
    >
      {/* 🔔 Bouton Cloche */}
      <button 
        type="button"
        onClick={togglePanel}
        className={cn(
          "relative p-2 md:p-2.5 lg:p-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl hover:bg-white/10 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] active:scale-95",
          isOpen && "bg-white/10 border-blue-500/30"
        )}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} non lues)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell 
          size={16} 
          className={cn(
            "transition-colors w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5", 
            unreadCount > 0 ? "text-blue-400" : "text-slate-400"
          )} 
          aria-hidden="true" 
        />
        
        {/* Badge non-lu */}
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 md:-top-1.5 -right-1 md:-right-1.5 h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 bg-rose-600 border-2 border-[#0B0F1A] rounded-full flex items-center justify-center text-[6px] md:text-[7px] lg:text-[8px] font-black text-white shadow-lg animate-pulse"
            aria-label={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 📂 Panel de notifications */}
      {isOpen && (
        <>
          {/* Overlay mobile */}
          <div 
            className="fixed inset-0 z-40 md:hidden" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          <NotificationPanel 
            notifications={notifications}
            onDismiss={handleDismiss}
            onMarkAllRead={markAllAsRead}
            onViewAll={handleNotificationClick}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}