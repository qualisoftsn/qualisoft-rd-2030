/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🚀 MODULE : ProspectConsole (Strategic Demo Interface)
 * RÔLE : Interface de démonstration des avantages stratégiques RD-2026
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { KeyboardEvent } from 'react';
import { 
  Play, ShieldCheck, Zap, Globe, FileBarChart, ArrowUpRight,
  Download, Video
} from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface FeatureItem {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  colorClass: string;
}

export interface ProspectConsoleProps {
  onDemoClick?: () => void;
  onBrochureClick?: () => void;
  className?: string;
}

export interface FeatureCardProps {
  feature: FeatureItem;
  index: number;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const FEATURES: FeatureItem[] = [
  { 
    title: "Zéro Papier", 
    description: "Digitalisation intégrale ISO", 
    icon: Zap, 
    color: "bg-amber-500",
    colorClass: "text-amber-400"
  },
  { 
    title: "Conformité", 
    description: "Monitoring §9.1 temps réel", 
    icon: ShieldCheck, 
    color: "bg-emerald-500",
    colorClass: "text-emerald-400"
  },
  { 
    title: "Multi-Tenant", 
    description: "Isolation Kernel souveraine", 
    icon: Globe, 
    color: "bg-blue-500",
    colorClass: "text-blue-400"
  },
  { 
    title: "Reporting", 
    description: "Revues de direction PDF", 
    icon: FileBarChart, 
    color: "bg-indigo-500",
    colorClass: "text-indigo-400"
  }
];

// ============================================================================
// SOUS-COMPOSANT : FEATURE CARD
// ============================================================================

function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Could trigger feature detail modal
      e.preventDefault();
    }
  };

  return (
    <article 
      className={cn(
        "bg-white/5 border border-white/10 p-4 md:p-5 lg:p-6 lg:p-7 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-default group/item focus-within:border-blue-500/30 focus-within:ring-2 focus-within:ring-blue-400",
        "animate-in fade-in slide-in-from-bottom-4 duration-700"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      role="article"
      aria-label={`Fonctionnalité: ${feature.title}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={cn(
        "w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-5 lg:mb-6 shadow-xl group-hover/item:scale-110 transition-transform",
        feature.color
      )}>
        <Icon size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-white" aria-hidden="true" />
      </div>
      <h4 className={cn(
        "text-[10px] md:text-xs font-black uppercase italic m-0 group-hover/item:text-blue-400 transition-colors"
      )}>
        {feature.title}
      </h4>
      <p className="text-[9px] md:text-[10px] text-slate-500 font-bold leading-tight lowercase italic mt-1 md:mt-1.5 lg:mt-2 m-0 opacity-70 group-hover/item:opacity-100">
        {feature.description}
      </p>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ProspectConsole({ 
  onDemoClick, 
  onBrochureClick,
  className 
}: ProspectConsoleProps) {

  const handleDemoClick = () => {
    onDemoClick?.();
  };

  const handleBrochureClick = () => {
    onBrochureClick?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDemoClick();
    }
  };

  return (
    <article 
      className={cn(
        "bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-6 md:p-8 lg:p-10 xl:p-12 lg:p-14 text-white shadow-xl md:shadow-2xl relative overflow-hidden italic font-sans text-left group focus-within:ring-2 focus-within:ring-blue-400",
        className
      )}
      role="region"
      aria-labelledby="prospect-console-title"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      
      {/* Badge Mode Présentation */}
      <div 
        className="absolute top-3 md:top-4 lg:top-6 right-3 md:right-4 lg:right-6 bg-blue-600 text-[6px] md:text-[7px] lg:text-[8px] font-black uppercase px-2 md:px-3 lg:px-4 py-1 md:py-1.5 rounded-full tracking-widest animate-pulse shadow-lg shadow-blue-900/40 z-20"
        role="status"
        aria-label="Mode présentation activé"
      >
        <span className="hidden sm:inline">Mode Présentation Elite</span>
        <span className="sm:hidden">Demo</span>
      </div>

      <div className="relative z-10">
        <header className="mb-8 md:mb-10 lg:mb-12">
          <h2 
            id="prospect-console-title"
            className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter m-0 italic"
          >
            Console <span className="text-blue-400 underline decoration-white/10">Prospects</span>
          </h2>
          <p className="text-slate-500 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest mt-2 md:mt-3 lg:mt-4 mb-6 md:mb-8 lg:mb-10 lg:mb-12 italic">
            Arguments stratégiques Qualisoft RD 2026
          </p>
        </header>

        {/* Features Grid */}
        <section 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6"
          role="list"
          aria-label="Fonctionnalités principales"
        >
          {FEATURES.map((feature, index) => (
            <FeatureCard 
              key={feature.title}
              feature={feature}
              index={index}
            />
          ))}
        </section>

        {/* Action Buttons */}
        <div className="mt-8 md:mt-10 lg:mt-12 flex flex-wrap gap-3 md:gap-4 lg:gap-6">
          <button 
            type="button"
            onClick={handleDemoClick}
            className={cn(
              "px-4 md:px-6 lg:px-8 xl:px-10 py-3 md:py-4 lg:py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl md:rounded-2xl text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase flex items-center gap-1.5 md:gap-2 lg:gap-3 transition-all border-none cursor-pointer italic tracking-widest shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            )}
            aria-label="Lancer la visite guidée"
          >
            <Video size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" fill="currentColor" aria-hidden="true" /> 
            <span className="hidden sm:inline">Lancer la Visite Guidée</span>
            <span className="sm:hidden">Visite</span>
          </button>
          <button 
            type="button"
            onClick={handleBrochureClick}
            className={cn(
              "px-4 md:px-6 lg:px-8 xl:px-10 py-3 md:py-4 lg:py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase text-white flex items-center gap-1.5 md:gap-2 lg:gap-3 transition-all cursor-pointer italic tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400"
            )}
            aria-label="Télécharger la plaquette SDE"
          >
            <Download size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" /> 
            <span className="hidden sm:inline">Plaquette SDE</span>
            <span className="sm:hidden">Plaquette</span>
            <ArrowUpRight size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* DÉCORATION DYNAMIQUE */}
      <div 
        className="absolute -bottom-16 md:-bottom-20 lg:-bottom-24 xl:-bottom-32 -right-16 md:-right-20 lg:-right-24 xl:-right-32 w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 bg-blue-600/10 rounded-full blur-[80px] md:blur-[100px] lg:blur-[120px] group-hover:bg-blue-600/20 transition-all duration-1000"
        aria-hidden="true"
      />
    </article>
  );
}