/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛠️ MODULE : WORKSPACE SETUP (ELITE-SDE)
 * RÔLE : Point d'entrée configuration pour Tenant Admin
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, Layers, ChevronRight, 
  ShieldCheck, Loader2, Globe, Activity, Building2, Users
} from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import Link from 'next/link';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface SetupStats {
  sites: number;
  units: number;
  users: number;
}

export interface SetupTileProps {
  title: string;
  count: number | string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'purple';
  link: string;
  description: string;
}

export interface LoadingMatrixProps {
  label: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const TILE_COLORS: Record<SetupTileProps['color'], string> = {
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-600",
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-600",
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-600"
};

// ============================================================================
// SOUS-COMPOSANT : LOADING MATRIX
// ============================================================================

function LoadingMatrix({ label }: LoadingMatrixProps) {
  return (
    <div 
      className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 md:gap-6"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="animate-spin text-blue-400 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" strokeWidth={1} aria-hidden="true" />
      <p className="text-blue-400 font-black uppercase italic text-[9px] md:text-[10px] tracking-widest animate-pulse">{label}</p>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SETUP TILE
// ============================================================================

function SetupTile({ title, count, icon: Icon, color, link, description }: SetupTileProps) {
  const colorClass = TILE_COLORS[color];

  return (
    <Link 
      href={link} 
      className="no-underline group h-full block focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-2xl md:rounded-3xl"
      role="article"
      aria-label={`${title}: ${count} entités`}
    >
      <article className="h-full bg-white/5 border border-white/10 p-4 md:p-6 lg:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] flex flex-col justify-between transition-all duration-500 group-hover:border-transparent group-hover:shadow-2xl relative overflow-hidden shadow-inner">
        <div className="relative z-10">
          <div className={cn(
            "w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 lg:mb-8 lg:mb-10 transition-all shadow-lg",
            colorClass,
            "group-hover:text-white group-hover:scale-110"
          )}>
            <Icon size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />
          </div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-white m-0 leading-none group-hover:scale-[1.02] transition-transform origin-left">
            {title}
          </h2>
          <p className="mt-4 md:mt-6 text-slate-500 text-[10px] md:text-[11px] font-bold uppercase leading-relaxed tracking-wider group-hover:text-white/70">
            {description}
          </p>
        </div>
        <div className="mt-4 md:mt-6 lg:mt-8 lg:mt-10 flex justify-between items-end relative z-10">
          <div className="text-left">
            <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-600 mb-1 md:mb-2">Entités Enrôlées</p>
            <p className="text-3xl md:text-4xl font-black italic m-0 text-white leading-none">{count}</p>
          </div>
          <ChevronRight 
            size={20} 
            className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-slate-700 group-hover:text-white group-hover:translate-x-1 md:group-hover:translate-x-2 transition-all" 
            aria-hidden="true" 
          />
        </div>
        <div className="absolute -bottom-10 md:-bottom-14 lg:-bottom-20 -right-10 md:-right-14 lg:-right-20 w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-all duration-1000" aria-hidden="true" />
      </article>
    </Link>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function WorkspaceSetup() {
  const [stats, setStats] = useState<SetupStats>({ sites: 0, units: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [sitesRes, unitsRes, usersRes] = await Promise.all([
        apiClient.get('/sites'),
        apiClient.get('/org-units'),
        apiClient.get('/users')
      ]);
      
      const sitesData = Array.isArray(sitesRes.data) ? sitesRes.data : (Array.isArray(sitesRes.data?.data) ? sitesRes.data.data : []);
      const unitsData = Array.isArray(unitsRes.data) ? unitsRes.data : (Array.isArray(unitsRes.data?.data) ? unitsRes.data.data : []);
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : (Array.isArray(usersRes.data?.data) ? usersRes.data.data : []);
      
      setStats({ 
        sites: sitesData.length, 
        units: unitsData.length, 
        users: usersData.length 
      });
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
      // Silent fallback - keep default zeros
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchStats(); }, [fetchStats]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingMatrix label="Initialisation du Workspace..." />;
  }

  const tiles: SetupTileProps[] = [
    { 
      title: "Sites & Implantations", 
      count: stats.sites, 
      icon: MapPin, 
      color: "blue", 
      link: "/workspace/sites", 
      description: "Définissez vos zones géographiques et adresses d'exploitation." 
    },
    { 
      title: "Unités & Services", 
      count: stats.units, 
      icon: Layers, 
      color: "emerald", 
      link: "/workspace/structure", 
      description: "Organisez vos départements et directions hiérarchiques." 
    },
    { 
      title: "Registre des Tiers", 
      count: "SCELLÉ", 
      icon: Globe, 
      color: "purple", 
      link: "/workspace/tiers", 
      description: "Administration des clients et partenaires stratégiques." 
    }
  ];

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 md:p-12 gap-6 md:gap-8 lg:gap-10 font-sans italic animate-in fade-in duration-700">
      
      <header className="space-y-2 md:space-y-3 lg:space-y-4 shrink-0">
        <div className="flex items-center gap-2 md:gap-3 text-emerald-400 font-black uppercase tracking-widest text-[8px] md:text-[9px]">
          <ShieldCheck size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
          Noyau SMI Configuré & Scellé
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:text-7xl font-black uppercase tracking-tighter italic m-0 text-white leading-none">
          Workspace <span className="text-emerald-400">SDE</span>
        </h1>
        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest m-0">
          Pilotage de la structure géo-fonctionnelle de votre organisation.
        </p>
      </header>

      {/* GRILLE TACTIQUE */}
      <main 
        className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 min-h-[400px] md:min-h-[500px]"
        role="region"
        aria-label="Modules de configuration du workspace"
      >
        {tiles.map((tile, i) => (
          <SetupTile 
            key={i}
            title={tile.title}
            count={tile.count}
            icon={tile.icon}
            color={tile.color}
            link={tile.link}
            description={tile.description}
          />
        ))}
      </main>

      <footer className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-3 opacity-30" role="contentinfo">
        <div className="flex items-center gap-3 md:gap-4 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic">
          <Activity size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
          Node Status : Opérationnel
        </div>
        <div className="text-[8px] md:text-[9px] font-black italic">Qualisoft SDE Workspace v2.4</div>
      </footer>
    </div>
  );
}