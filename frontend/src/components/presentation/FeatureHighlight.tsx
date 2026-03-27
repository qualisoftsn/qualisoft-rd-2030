/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : FeatureHighlight (Matrix Capabilities)
 * RÔLE : Présentation stratégique des capacités Matrix
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { KeyboardEvent, useCallback } from 'react';
import { PieChart, ShieldCheck, Users, Zap, ArrowUpRight, LucideIcon } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  colorClass: string;
}

export interface FeatureHighlightProps {
  className?: string;
  onFeatureClick?: (feature: FeatureItem) => void;
}

export interface FeatureCardProps {
  feature: FeatureItem;
  index: number;
  onClick?: (feature: FeatureItem) => void;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const HIGHLIGHTS: FeatureItem[] = [
  { 
    title: 'SMI 100% Digital', 
    description: 'Digitalisation intégrale des processus ISO avec scellage.', 
    icon: Zap, 
    color: 'bg-amber-500',
    colorClass: 'text-amber-400'
  },
  { 
    title: 'Gestion des Risques', 
    description: 'Anticipation proactive via le monitoring Kernel Matrix.', 
    icon: ShieldCheck, 
    color: 'bg-emerald-500',
    colorClass: 'text-emerald-400'
  },
  { 
    title: 'Rapports IA', 
    description: 'Génération de PDF analytiques pour vos audits de certification.', 
    icon: PieChart, 
    color: 'bg-blue-600',
    colorClass: 'text-blue-400'
  },
  { 
    title: 'Multi-Tenant', 
    description: 'Isolation scellée des données filiales sans fuite de flux.', 
    icon: Users, 
    color: 'bg-indigo-600',
    colorClass: 'text-indigo-400'
  },
];

// ============================================================================
// SOUS-COMPOSANT : FEATURE CARD
// ============================================================================

function FeatureCard({ feature, index, onClick }: FeatureCardProps) {
  const Icon = feature.icon;

  const handleClick = useCallback(() => {
    onClick?.(feature);
  }, [feature, onClick]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article 
      className={cn(
        "p-4 md:p-6 lg:p-8 space-y-3 md:space-y-4 lg:space-y-5 group/item transition-all duration-500 hover:bg-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer relative z-10 border border-transparent hover:border-blue-500/10 focus-within:border-blue-500/30 focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 focus-within:ring-offset-[#0B0F1A]",
        "animate-in fade-in slide-in-from-bottom-4 duration-700"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      role="article"
      aria-label={`Fonctionnalité: ${feature.title}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div 
        className={cn(
          "w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl group-hover/item:rotate-12 transition-all duration-500",
          feature.color
        )}
        aria-hidden="true"
      >
        <Icon size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" />
      </div>
      <div>
        <h4 
          className={cn(
            "text-[10px] md:text-[11px] lg:text-[12px] font-black uppercase text-slate-900 tracking-tighter italic m-0 flex items-center gap-1 md:gap-1.5 lg:gap-2"
          )}
        >
          {feature.title} 
          <ArrowUpRight 
            size={12} 
            className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" 
            aria-hidden="true" 
          />
        </h4>
        <p 
          className="text-[8px] md:text-[9px] lg:text-[10px] text-slate-500 font-bold leading-relaxed mt-2 md:mt-2.5 lg:mt-3 m-0 opacity-80 group-hover/item:opacity-100 transition-opacity duration-500"
        >
          {feature.description}
        </p>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function FeatureHighlight({ className, onFeatureClick }: FeatureHighlightProps) {
  const handleFeatureClick = useCallback((feature: FeatureItem) => {
    onFeatureClick?.(feature);
    // Optional: Track feature click for analytics
    console.log('Feature clicked:', feature.title);
  }, [onFeatureClick]);

  return (
    <section 
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 p-4 md:p-6 lg:p-8 bg-blue-600/5 border border-blue-500/20 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] italic font-sans text-left relative overflow-hidden group",
        className
      )}
      role="region"
      aria-label="Fonctionnalités principales de Matrix"
    >
      {/* Decorative glow */}
      <div 
        className="absolute -right-10 md:-right-14 lg:-right-20 -top-10 md:-top-14 lg:-top-20 w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-blue-500/5 blur-[80px] md:blur-[100px] lg:blur-[120px] rounded-full" 
        aria-hidden="true" 
      />
      
      {HIGHLIGHTS.map((feature, index) => (
        <FeatureCard 
          key={index}
          feature={feature}
          index={index}
          onClick={handleFeatureClick}
        />
      ))}
    </section>
  );
}