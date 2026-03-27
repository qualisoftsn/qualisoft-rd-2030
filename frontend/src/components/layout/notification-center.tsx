/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🔔 MODULE : NotificationCenter (QHSE Monitoring Hub)
 * RÔLE : Hub central de monitoring QHSE
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useEffect, useCallback, KeyboardEvent, useRef } from 'react';
import { 
  Bell, AlertCircle, CheckCircle2, X, ShieldAlert, 
  ChevronRight, Info, Clock, Trash2, AlertTriangle
} from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { toast } from 'sonner';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NotificationType = 'urgent' | 'warning' | 'success' | 'info';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationBellProps {
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
  onDismiss?: (notificationId: string) => void;
  onMarkAllRead?: () => void;
}

export interface NotificationPanelProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; label: string }> = {
  urgent: { icon: AlertCircle, color: 'text-red-400', label: 'Urgent' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', label: 'Attention' },
  success: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Succès' },
  info: { icon: Info, color: 'text-blue-400', label: 'Info' },
};

const formatTimeAgo = (timestamp: string): string => {
  try {
    const now = new Date();
    const then = new Date(timestamp);
    const diffSec = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diffSec < 0) return 'À l\'instant';
    if (diffSec < 60) return 'À l\'instant';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}min`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
    return then.toLocaleDateString('fr-SN', { day: 'numeric', month: 'short' });
  } catch {
    return timestamp;
  }
};

// ============================================================================
// SOUS-COMPOSANT : NOTIFICATION ITEM
// ============================================================================

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

function NotificationItem({ notification, onDismiss, onClick }: NotificationItemProps) {
  const config = NOTIFICATION_TYPE_CONFIG[notification.type];
  const Icon = config.icon;
  const timeAgo = formatTimeAgo(notification.timestamp);

  const handleClick = () => {
    onClick?.(notification);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss(notification.id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleDismiss(e as any);
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
        <Icon size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" />
      </div>
      
      {/* Contenu */}
      <div className="flex-1 min-w-0 pr-6 md:pr-8">
        <div className="flex justify-between items-start mb-0.5 md:mb-1">
          <h4 className={cn(
            "text-[8px] md:text-[9px] font-black text-slate-300 leading-none uppercase tracking-widest italic m-0 truncate",
            !notification.read && "text-white"
          )}>
            {notification.title}
          </h4>
          <time 
            className="flex items-center gap-0.5 md:gap-1 text-[6px] md:text-[7px] font-black text-slate-500 uppercase italic shrink-0"
            dateTime={notification.timestamp}
          >
            <Clock size={8} className="w-2 h-2 md:w-2.5 md:h-2.5" aria-hidden="true" /> 
            {timeAgo}
          </time>
        </div>
        
        <p className="text-[8px] md:text-[9px] text-slate-400 leading-relaxed font-medium italic m-0 line-clamp-2">
          {notification.description}
        </p>
        
        {/* Action link if available */}
        {notification.actionUrl && notification.actionLabel && (
          <a
            href={notification.actionUrl}
            className="text-[7px] md:text-[8px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest italic inline-flex items-center gap-0.5 md:gap-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {notification.actionLabel}
            <ChevronRight size={8} className="w-2 h-2 md:w-2.5 md:h-2.5" aria-hidden="true" />
          </a>
        )}
      </div>

      {/* Bouton fermer */}
      <button 
        type="button"
        onClick={handleDismiss}
        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 md:p-1.5 bg-red-500/10 text-red-400 rounded-lg md:rounded-xl hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
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
  onClose,
  onNotificationClick 
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleMarkAllRead = () => {
    onMarkAllRead();
    toast.info("Toutes les notifications ont été marquées comme lues");
  };

  return (
    <div 
      ref={panelRef}
      className="absolute right-0 mt-2 md:mt-3 w-72 md:w-80 lg:w-96 bg-[#0B0F1A] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300"
      role="dialog"
      aria-label="Centre de notifications"
      aria-modal="true"
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
            onClick={handleMarkAllRead}
            className="text-[7px] md:text-[8px] font-black text-blue-400 hover:text-blue-300 transition-all uppercase italic border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1 md:px-1.5 py-0.5 md:py-1"
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
        {notifications.length === 0 ? (
          <div className="p-6 md:p-8 lg:p-12 text-center space-y-3 md:space-y-4" role="status">
            <Bell className="mx-auto opacity-10 text-slate-400 w-10 h-10 md:w-12 md:h-12" aria-hidden="true" />
            <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest italic leading-relaxed">
              Le registre est vierge <br/> Aucun signalement actif
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
              onDismiss={onDismiss}
              onClick={onNotificationClick}
            />
          ))
        )}
      </div>
      
      {/* Footer */}
      <footer className="p-2 md:p-3 lg:p-4 bg-[#050810] text-center border-t border-white/5">
         <button 
           type="button"
           className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-all flex items-center justify-center gap-1 md:gap-1.5 lg:gap-2 mx-auto border-none bg-transparent cursor-pointer italic focus:outline-none focus:ring-2 focus:ring-blue-400 rounded py-0.5 md:py-1"
           aria-label="Voir le journal complet"
         >
           Journal complet <ChevronRight size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" />
         </button>
      </footer>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : NOTIFICATION BELL
// ============================================================================

export default function NotificationCenter({ 
  className, 
  onNotificationClick,
  onDismiss,
  onMarkAllRead 
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: '1', 
      title: 'ACTION EN RETARD', 
      description: 'Fuite cuve Zone A - Échéance dépassée §14001', 
      type: 'urgent', 
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: '/workspace/incidents/INC-2026-042',
      actionLabel: 'Traiter',
    },
    { 
      id: '2', 
      title: 'AUDIT ISO VALIDÉ', 
      description: 'Rapport d\'audit interne 9001 conforme - Certificat disponible', 
      type: 'success', 
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: '/workspace/audits/AUD-2026-Q1',
      actionLabel: 'Voir',
    },
    { 
      id: '3', 
      title: 'VEILLE RÉGLEMENTAIRE', 
      description: 'Nouvelle mise à jour Code du Travail Sénégal - À intégrer au SMS', 
      type: 'info', 
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close on Escape key
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

  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
    // Mark all as read when opening
    if (!isOpen) {
      handleMarkAllReadInternal();
    }
  }, [isOpen]);

  const handleDismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    onDismiss?.(id);
    toast.info("Notification masquée", { duration: 2000 });
  }, [onDismiss]);

  const handleMarkAllReadInternal = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onMarkAllRead?.();
  }, [onMarkAllRead]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read
    setNotifications(prev => prev.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    ));
    onNotificationClick?.(notification);
    setIsOpen(false);
  }, [onNotificationClick]);

  return (
    <div 
      className={cn("relative font-sans italic", className)}
      role="region"
      aria-label="Notifications"
    >
      {/* 🔔 Bouton Cloche */}
      <button 
        type="button"
        onClick={togglePanel}
        className={cn(
          "relative p-2 md:p-2.5 lg:p-3 bg-white/5 border border-white/10 rounded-lg md:rounded-xl hover:bg-white/10 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] active:scale-95",
          isOpen && "bg-white/10 border-blue-500/30"
        )}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} non lues)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell 
          size={16} 
          className={cn(
            "w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 transition-colors", 
            unreadCount > 0 ? "text-blue-400" : "text-slate-400"
          )} 
          aria-hidden="true" 
        />
        
        {/* Badge non-lu */}
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 md:-top-1.5 -right-1 md:-right-1.5 h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 bg-red-600 border-2 border-[#0B0F1A] rounded-full flex items-center justify-center text-[6px] md:text-[7px] lg:text-[8px] font-black text-white shadow-lg animate-pulse"
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
            onClick={handleClose}
            aria-hidden="true"
          />
          
          <NotificationPanel 
            notifications={notifications}
            onDismiss={handleDismiss}
            onMarkAllRead={handleMarkAllReadInternal}
            onClose={handleClose}
            onNotificationClick={handleNotificationClick}
          />
        </>
      )}
    </div>
  );
}