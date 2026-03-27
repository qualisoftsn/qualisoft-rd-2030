/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : ActivityFeed (Real-Time Activity Stream)
 * RÔLE : Flux de traçabilité en temps réel des actions du SMI
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Activity as ActivityIcon,
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Loader2,
  AlertCircle,
  FileText,
  ClipboardCheck
} from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export type ActivityType = 'DOCUMENT' | 'NON_CONFORMITE' | 'AUDIT' | 'ACTION' | 'SSE' | 'NC' | 'DOC';

export interface Activity {
  id: string;
  type: ActivityType;
  userName: string;
  userId?: string;
  description: string;
  module: string;
  createdAt: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, any>;
}

export interface ActivityFeedProps {
  limit?: number;
  onActivityClick?: (activity: Activity) => void;
  className?: string;
  showModule?: boolean;
  showTime?: boolean;
}

export interface LoadingStateProps {
  label: string;
}

export interface EmptyStateProps {
  message: string;
}

export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const ACTIVITY_ICON_CONFIG: Record<ActivityType, { icon: React.ElementType; color: string }> = {
  ACTION: { icon: Zap, color: 'text-amber-400' },
  NC: { icon: AlertTriangle, color: 'text-red-400' },
  NON_CONFORMITE: { icon: AlertTriangle, color: 'text-red-400' },
  DOC: { icon: CheckCircle2, color: 'text-emerald-400' },
  DOCUMENT: { icon: FileText, color: 'text-emerald-400' },
  AUDIT: { icon: ClipboardCheck, color: 'text-blue-400' },
  SSE: { icon: ActivityIcon, color: 'text-blue-400' }
};

const DEFAULT_LIMIT = 10;

// ============================================================================
// SOUS-COMPOSANT : LOADING STATE
// ============================================================================

function LoadingState({ label }: LoadingStateProps) {
  return (
    <div 
      className="p-4 md:p-6 lg:p-8 lg:p-10 flex justify-center"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <Loader2 size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-blue-400 animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : EMPTY STATE
// ============================================================================

function EmptyState({ message }: EmptyStateProps) {
  return (
    <div 
      className="py-8 md:py-10 lg:py-12 text-center"
      role="status"
      aria-label={message}
    >
      <ActivityIcon size={32} className="w-8 h-8 md:w-10 md:h-10 text-slate-700 mx-auto mb-3 md:mb-4 opacity-20" aria-hidden="true" />
      <p className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest opacity-20">
        {message}
      </p>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ERROR STATE
// ============================================================================

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div 
      className="py-8 md:py-10 lg:py-12 text-center"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle size={32} className="w-8 h-8 md:w-10 md:h-10 text-red-400 mx-auto mb-3 md:mb-4" aria-hidden="true" />
      <p className="text-[9px] md:text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 md:mb-4">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 md:px-6 py-2 md:py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all border border-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400"
        aria-label="Réessayer de charger le flux"
      >
        Réessayer
      </button>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ACTIVITY ITEM
// ============================================================================

interface ActivityItemProps {
  activity: Activity;
  onClick?: (activity: Activity) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>, activity: Activity) => void;
  showModule?: boolean;
  showTime?: boolean;
}

function ActivityItem({ activity, onClick, onKeyDown, showModule = true, showTime = true }: ActivityItemProps) {
  const config = ACTIVITY_ICON_CONFIG[activity.type] || ACTIVITY_ICON_CONFIG.ACTION;
  const Icon = config.icon;
  
  const handleClick = () => {
    onClick?.(activity);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
    onKeyDown?.(e, activity);
  };

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <article 
      className="group flex items-start gap-3 md:gap-4 lg:gap-5 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-white/5 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="article"
      aria-label={`Activité: ${activity.description}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="mt-0.5 md:mt-1 shrink-0">
        <div className={cn(
          "p-1.5 md:p-2 rounded-lg md:rounded-xl bg-white/5",
          config.color
        )}>
          <Icon size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" />
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-1 md:space-y-1.5">
        <p className="text-[10px] md:text-xs font-bold text-slate-200 m-0 line-clamp-2">
          <span className="font-black text-blue-400 uppercase">{activity.userName}</span>{' '}
          <span className="text-slate-300">{activity.description}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {showTime && (
            <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest italic flex items-center gap-1">
              <Clock size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" /> 
              {formatTime(activity.createdAt)}
            </span>
          )}
          {showModule && activity.module && (
            <span className="text-[8px] md:text-[9px] font-black text-slate-700 uppercase tracking-widest">
              #{activity.module}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ActivityFeed({ 
  limit = DEFAULT_LIMIT, 
  onActivityClick, 
  className,
  showModule = true,
  showTime = true
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<Activity[]>(`/activities/latest?limit=${limit}`);
      const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setActivities(data);
    } catch (err) {
      console.error("ERREUR KERNEL : Impossible de synchroniser le flux.", err);
      setError("Impossible de charger le flux d'activité");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchActivities();
    }
  }, [fetchActivities]);

  const handleRetry = useCallback(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleActivityClick = useCallback((activity: Activity) => {
    onActivityClick?.(activity);
  }, [onActivityClick]);

  const handleActivityKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, activity: Activity) => {
    // Can add additional keyboard handling here
  }, []);

  if (loading) {
    return (
      <LoadingState label="Chargement du flux d'activité..." />
    );
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={handleRetry} />
    );
  }

  return (
    <article 
      className={cn(
        "bg-[#0F172A]/40 border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3rem] p-4 md:p-6 lg:p-8 xl:p-10 backdrop-blur-md animate-in fade-in duration-700 font-sans italic",
        className
      )}
      aria-labelledby="activity-feed-title"
      role="region"
    >
      
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-10" role="banner">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-blue-600/10 rounded-xl md:rounded-2xl">
            <ActivityIcon size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-blue-400" aria-hidden="true" />
          </div>
          <div>
            <h3 id="activity-feed-title" className="text-base md:text-lg font-black text-white uppercase tracking-tighter italic m-0 leading-none">
              Flux d&apos;activité
            </h3>
            <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5 md:mt-1 m-0">
              Traçabilité temps réel Matrix
            </p>
          </div>
        </div>
        <div 
          className="px-3 md:px-4 py-1 md:py-1.5 bg-white/5 rounded-full border border-white/5 text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"
          role="status"
          aria-live="polite"
        >
          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true" />
          Live Stream
        </div>
      </header>

      {/* LISTE DES ÉVÉNEMENTS */}
      <div 
        className="space-y-3 md:space-y-4 lg:space-y-6" 
        role="list"
        aria-label="Liste des activités récentes"
      >
        {activities.length > 0 ? activities.map((act) => (
          <ActivityItem 
            key={act.id}
            activity={act}
            onClick={handleActivityClick}
            onKeyDown={handleActivityKeyDown}
            showModule={showModule}
            showTime={showTime}
          />
        )) : (
          <EmptyState message="Aucun signal détecté" />
        )}
      </div>
    </article>
  );
}