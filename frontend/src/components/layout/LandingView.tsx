/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🎭 MODULE : LandingView (Multi-Tenant Landing Page)
 * RÔLE : Interface de présentation dynamique (Elite vs Sagam vs Matrix)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + PWA
 */

import React, { useMemo, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Zap, ArrowRight, Globe, Database, Crown, 
  Building2, Users, FileText, CheckCircle2, LucideIcon
} from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type TenantType = 'elite' | 'sagam' | 'matrix' | 'custom';

export interface FeatureItem {
  label: string;
  icon: LucideIcon;
}

export interface TenantConfig {
  slug: string;
  type: TenantType;
  name: string;
  tagline: string;
  description: string;
  gradient: string;
  accentColor: string;
  logoIcon: LucideIcon;
  features: FeatureItem[];
  ctaPrimary: string;
  ctaSecondary: string;
  domain: string;
}

export interface LandingViewProps {
  slug?: string;
  type?: string;
  className?: string;
}

export interface Certification {
  name: string;
  verified: boolean;
}

// ============================================================================
// CONFIGURATIONS TENANT
// ============================================================================

const TENANT_CONFIGS: Record<string, TenantConfig> = {
  elite: {
    slug: 'elite',
    type: 'elite',
    name: 'Qualisoft Elite',
    tagline: 'L\'Excellence du Pilotage SDE',
    description: 'Exploitez la puissance du Noyau Matrix RD-2026 pour un pilotage QHSE sans compromis, conforme ISO 9001/14001/27001.',
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    accentColor: 'text-amber-400',
    logoIcon: Crown,
    features: [
      { label: 'ISO 9001:2015', icon: ShieldCheck },
      { label: 'Multi-Tenant', icon: Building2 },
      { label: 'Audit Ready', icon: FileText },
      { label: 'Cloud Souverain', icon: Globe },
    ],
    ctaPrimary: 'Déployer le Cockpit',
    ctaSecondary: 'Documentation SMI',
    domain: 'elite.qualisoft.sn',
  },
  sagam: {
    slug: 'sagam',
    type: 'sagam',
    name: 'SAGAM Connect',
    tagline: 'Performance & Souveraineté Opérationnelle',
    description: 'Plateforme dédiée à la gestion des associations et groupements, avec conformité OHADA et reporting automatisé.',
    gradient: 'from-blue-600 via-indigo-600 to-purple-700',
    accentColor: 'text-blue-400',
    logoIcon: Users,
    features: [
      { label: 'OHADA SYSCOA', icon: FileText },
      { label: 'Gestion Membres', icon: Users },
      { label: 'Reporting Auto', icon: Database },
      { label: 'Mobile First', icon: Globe },
    ],
    ctaPrimary: 'Accéder à l\'Espace',
    ctaSecondary: 'Guide Utilisateur',
    domain: 'sagam.qualisoft.sn',
  },
  matrix: {
    slug: 'matrix',
    type: 'matrix',
    name: 'Matrix Console',
    tagline: 'Administration Globale',
    description: 'Interface de supervision et de configuration pour les administrateurs système et architectes Qualisoft.',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    accentColor: 'text-emerald-400',
    logoIcon: Zap,
    features: [
      { label: 'RBAC Avancé', icon: ShieldCheck },
      { label: 'Audit Logs', icon: FileText },
      { label: 'API Gateway', icon: Database },
      { label: 'Monitoring 24/7', icon: Globe },
    ],
    ctaPrimary: 'Console Admin',
    ctaSecondary: 'Documentation API',
    domain: 'matrix.qualisoft.sn',
  },
};

const DEFAULT_CONFIG: TenantConfig = {
  slug: 'default',
  type: 'custom',
  name: 'Qualisoft Platform',
  tagline: 'Digitalisation de votre Conformité',
  description: 'Solution intégrée de gestion QHSE, financière et documentaire pour les organisations exigeantes.',
  gradient: 'from-blue-600 via-blue-700 to-slate-800',
  accentColor: 'text-blue-400',
  logoIcon: Zap,
  features: [
    { label: 'ISO Certified', icon: ShieldCheck },
    { label: 'Secure Cloud', icon: Globe },
    { label: 'Real-time Analytics', icon: Database },
    { label: '24/7 Support', icon: Users },
  ],
  ctaPrimary: 'Commencer l\'Essai',
  ctaSecondary: 'En Savoir Plus',
  domain: 'qualisoft.sn',
};

const CERTIFICATIONS: Certification[] = [
  { name: 'ISO 9001', verified: true },
  { name: 'ISO 14001', verified: true },
  { name: 'ISO 27001', verified: true },
  { name: 'OHADA', verified: true },
];

// ============================================================================
// UTILITAIRES
// ============================================================================

const getTenantConfig = (slug?: string, type?: string): TenantConfig => {
  const normalizedSlug = slug?.toLowerCase() || 'default';
  const normalizedType = type?.toLowerCase() || 'default';
  
  // Priorité: slug explicite > type > default
  if (TENANT_CONFIGS[normalizedSlug]) return TENANT_CONFIGS[normalizedSlug];
  if (TENANT_CONFIGS[normalizedType]) return TENANT_CONFIGS[normalizedType];
  
  return DEFAULT_CONFIG;
};

// Safe analytics tracking
const trackEvent = (eventName: string, eventData: Record<string, string>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    try {
      (window as any).gtag('event', eventName, eventData);
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }
};

// ============================================================================
// SOUS-COMPOSANT : FEATURE BADGE
// ============================================================================

interface FeatureBadgeProps {
  feature: FeatureItem;
  accentColor: string;
}

function FeatureBadge({ feature, accentColor }: FeatureBadgeProps) {
  const Icon = feature.icon;
  
  return (
    <span 
      className="flex items-center gap-1 md:gap-1.5 lg:gap-2 px-2 md:px-3 lg:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[7px] md:text-[8px] lg:text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-slate-300 hover:border-blue-500/30 hover:text-blue-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="listitem"
    >
      <Icon size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 shrink-0" aria-hidden="true" />
      {feature.label}
    </span>
  );
}

// ============================================================================
// SOUS-COMPOSANT : CERTIFICATION BADGE
// ============================================================================

interface CertificationBadgeProps {
  certification: Certification;
}

function CertificationBadge({ certification }: CertificationBadgeProps) {
  return (
    <span 
      className="flex items-center gap-1 md:gap-1.5 text-[7px] md:text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-slate-400"
      role="listitem"
    >
      <CheckCircle2 size={10} className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-400 shrink-0" aria-hidden="true" />
      {certification.name}
    </span>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function LandingView({ 
  slug = 'elite', 
  type = 'elite', 
  className 
}: LandingViewProps) {
  const [hasMounted, setHasMounted] = useState(false);
  
  const config = useMemo(() => getTenantConfig(slug, type), [slug, type]);
  const LogoIcon = config.logoIcon;

  useEffect(() => {
    setHasMounted(true);
    
    // Track page view
    trackEvent('page_view', {
      page_title: `${config.name} Landing`,
      tenant: config.slug,
    });
  }, [config.name, config.slug]);

  // Gestion du clic sur le CTA principal
  const handlePrimaryCta = useCallback((e: React.MouseEvent) => {
    trackEvent('click_landing_cta', {
      event_category: 'conversion',
      event_label: config.ctaPrimary,
      tenant: config.slug,
    });
  }, [config.ctaPrimary, config.slug]);

  // Gestion du clic sur le CTA secondaire
  const handleSecondaryCta = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    window.open('https://docs.qualisoft.sn', '_blank', 'noopener,noreferrer');
    trackEvent('click_docs_link', {
      event_category: 'navigation',
      tenant: config.slug,
    });
  }, [config.slug]);

  if (!hasMounted) {
    return (
      <div 
        className="min-h-screen bg-[#0B0F1A] flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Chargement de la page"
      >
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-blue-500 border-t-transparent mx-auto" aria-hidden="true" />
          <p className="text-slate-400 text-[9px] md:text-[10px] uppercase tracking-widest">Chargement {config.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "min-h-screen bg-[#0B0F1A] text-slate-200 flex flex-col items-center justify-center relative overflow-hidden italic font-sans selection:bg-blue-600/30 selection:text-white",
        className
      )}
      role="main"
      aria-label={`Page d'accueil ${config.name}`}
    >
      
      {/* 🌌 FOND MATRICIEL ANIMÉ */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        aria-hidden="true"
      >
        <div 
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-r rounded-full blur-[100px] md:blur-[120px] animate-pulse",
            config.gradient
          )} 
        />
        {/* Grille subtile */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* 🛡️ HEADER NAVIGATION */}
      <header 
        className="fixed top-0 w-full p-3 md:p-4 lg:p-6 flex justify-between items-center z-40 px-3 md:px-6 lg:px-12"
        role="banner"
        aria-label="Navigation principale"
      >
        <Link 
          href="/" 
          className="flex items-center gap-2 md:gap-3 lg:gap-4 group focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg md:rounded-xl p-1"
          aria-label={`Accueil ${config.name}`}
        >
          <div className={cn("drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]", config.accentColor)}>
            <LogoIcon size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 shrink-0" aria-hidden="true" />
          </div>
          <span className="text-base md:text-lg lg:text-xl font-black uppercase tracking-tighter italic text-white group-hover:text-blue-300 transition-colors truncate max-w-[150px] md:max-w-none">
            QUALISOFT <span className={config.accentColor}>{config.slug.toUpperCase()}</span>
          </span>
        </Link>
        
        <nav className="flex items-center gap-2 md:gap-3 lg:gap-4" role="navigation" aria-label="Menu principal">
          <Link 
            href="https://docs.qualisoft.sn" 
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 md:gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 md:px-4 lg:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[7px] md:text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all backdrop-blur-md no-underline focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Documentation Qualisoft"
          >
            <Database size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" /> 
            <span className="hidden md:inline">Docs</span>
          </Link>
          <Link 
            href="/auth/login" 
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 md:px-4 lg:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[7px] md:text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-white transition-all backdrop-blur-md no-underline shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Accéder à l'espace Matrix"
          >
            <span className="hidden sm:inline">Accès Matrix</span>
            <span className="sm:hidden">Login</span>
          </Link>
        </nav>
      </header>

      {/* 🚀 MAIN CONTENT */}
      <main className="relative z-10 text-center max-w-3xl md:max-w-4xl px-3 md:px-6 lg:px-8 xl:px-10 animate-in fade-in zoom-in-95 duration-700 mt-20 md:mt-24 lg:mt-28">
        
        {/* Badge Instance */}
        <div className="flex items-center justify-center gap-1.5 md:gap-2 lg:gap-3 mb-4 md:mb-6 lg:mb-8 opacity-50" role="status">
           <Globe size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 shrink-0" aria-hidden="true" />
           <span className="text-[7px] md:text-[8px] lg:text-[9px] font-black uppercase tracking-widest truncate">
             Instance: {config.domain}
           </span>
        </div>

        {/* Titre Principal */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black uppercase italic tracking-tighter leading-[0.85] text-white mb-4 md:mb-6 lg:mb-8">
          {config.name} <br />
          <span className={cn(
            "bg-clip-text text-transparent bg-gradient-to-r",
            config.gradient
          )}>
            Sovereign OS
          </span>
        </h1>

        {/* Sous-titre */}
        <p className="text-sm md:text-base lg:text-lg text-slate-400 font-medium max-w-xl md:max-w-2xl mx-auto mb-6 md:mb-8 lg:mb-12 leading-relaxed">
          {config.tagline}. <br className="hidden md:block"/>
          <span className="text-slate-300 font-bold italic">{config.description}</span>
        </p>

        {/* Features Grid */}
        <div 
          className="flex flex-wrap justify-center gap-1.5 md:gap-2 lg:gap-2.5 mb-8 md:mb-10 lg:mb-14"
          role="list"
          aria-label="Fonctionnalités principales"
        >
          {config.features.map((feature, index) => (
            <FeatureBadge 
              key={index}
              feature={feature}
              accentColor={config.accentColor}
            />
          ))}
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 lg:gap-6">
          <Link 
            href="/auth/login" 
            onClick={handlePrimaryCta}
            className={cn(
              "bg-gradient-to-r text-white px-4 md:px-6 lg:px-8 xl:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl font-black uppercase text-[8px] md:text-[9px] lg:text-[10px] italic flex items-center justify-center gap-2 md:gap-3 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all no-underline w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
              config.gradient
            )}
            aria-label={config.ctaPrimary}
          >
            {config.ctaPrimary} 
            <ArrowRight size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" aria-hidden="true" />
          </Link>
          
          <button 
            type="button"
            onClick={handleSecondaryCta}
            className="bg-white/5 border border-white/10 px-4 md:px-6 lg:px-8 xl:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl font-black uppercase text-[8px] md:text-[9px] lg:text-[10px] italic text-slate-400 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2 md:gap-3 cursor-pointer w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]"
            aria-label={config.ctaSecondary}
          >
            <Database size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" aria-hidden="true" /> 
            {config.ctaSecondary}
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 md:mt-12 lg:mt-16 pt-6 md:pt-8 lg:pt-10 border-t border-white/5">
          <p className="text-[7px] md:text-[8px] lg:text-[9px] text-slate-500 uppercase tracking-widest mb-3 md:mb-4">
            Certifications & Conformité
          </p>
          <div 
            className="flex flex-wrap justify-center items-center gap-3 md:gap-4 lg:gap-6 md:gap-8 opacity-60"
            role="list"
            aria-label="Certifications"
          >
            {CERTIFICATIONS.map((cert, i) => (
              <CertificationBadge key={i} certification={cert} />
            ))}
          </div>
        </div>
      </main>

      {/* 📡 FOOTER D'INTÉGRITÉ */}
      <footer 
        className="fixed bottom-3 md:bottom-4 lg:bottom-6 w-full flex justify-center gap-3 md:gap-4 lg:gap-6 md:gap-8 lg:gap-12 opacity-30 px-3 md:px-4 text-center flex-wrap"
        role="contentinfo"
        aria-label="Informations de système"
      >
        <div className="flex items-center gap-1.5 md:gap-2">
          <ShieldCheck size={10} className={cn("w-2.5 h-2.5 md:w-3 md:h-3", config.accentColor)} aria-hidden="true" />
          <span className="text-[6px] md:text-[7px] lg:text-[8px] font-black uppercase tracking-widest leading-none">
            Certifié Qualisoft SDE
          </span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <Zap size={10} className={cn("w-2.5 h-2.5 md:w-3 md:h-3", config.accentColor)} aria-hidden="true" />
          <span className="text-[6px] md:text-[7px] lg:text-[8px] font-black uppercase tracking-widest leading-none">
            Cluster Dakar Stable
          </span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <Globe size={10} className={cn("w-2.5 h-2.5 md:w-3 md:h-3", config.accentColor)} aria-hidden="true" />
          <span className="text-[6px] md:text-[7px] lg:text-[8px] font-black uppercase tracking-widest leading-none">
            Souveraineté Numérique
          </span>
        </div>
      </footer>

      {/* 🧪 PWA & ACCESSIBILITY OVERRIDES */}
      <style>{`
        body { 
          overscroll-behavior: none; 
          background: #0B0F1A;
          -webkit-tap-highlight-color: transparent;
        }
        :focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}