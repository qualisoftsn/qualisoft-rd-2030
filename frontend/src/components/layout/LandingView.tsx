/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🎭 MODULE : LandingView.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Interface de présentation dynamique (Elite vs Sagam vs Matrix)
 * VERSION : 2.0 - Corrections Tailwind + Accessibilité + PWA Ready
 * DESIGN : Hardened Matrix - Glassmorphism & Souveraineté, WCAG AA
 * LOGIQUE : Routing par sous-domaine + Personnalisation tenant
 * RÉVISION : 19 Mars 2026 | 12:30 GMT
 * -------------------------------------------------------------------------
 */

import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Zap, ArrowRight, Globe, Database, Crown, 
  Building2, Users, FileText, CheckCircle2
} from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TenantConfig {
  slug: string;
  type: 'elite' | 'sagam' | 'matrix' | 'custom';
  name: string;
  tagline: string;
  description: string;
  gradient: string;
  accentColor: string;
  logoIcon: React.ElementType;
  features: Array<{ label: string; icon: React.ElementType }>;
  ctaPrimary: string;
  ctaSecondary: string;
  domain: string;
}

interface LandingViewProps {
  slug?: string;
  type?: string;
  className?: string;
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

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function LandingView({ 
  slug = 'elite', 
  type = 'elite', 
  className 
}: LandingViewProps) {
  
  const config = useMemo(() => getTenantConfig(slug, type), [slug, type]);
  
  const LogoIcon = config.logoIcon;

  // Gestion du clic sur le CTA principal
  const handlePrimaryCta = useCallback((e: React.MouseEvent) => {
    // Tracking analytics (optionnel)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click_landing_cta', {
        event_category: 'conversion',
        event_label: config.ctaPrimary,
        tenant: config.slug,
      });
    }
    // La navigation est gérée par le composant Link
  }, [config]);

  // Gestion du clic sur le CTA secondaire
  const handleSecondaryCta = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // Ouvrir la documentation dans un nouvel onglet
    window.open('https://docs.qualisoft.sn', '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div 
      className={cn(
        "min-h-screen bg-[#0B0F1A] text-slate-200 flex flex-col items-center justify-center relative overflow-hidden italic font-sans selection:bg-blue-600/30 selection:text-white",
        className
      )}
    >
      
      {/* 🌌 FOND MATRICIEL ANIMÉ */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
        <div 
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 md:w-[500px] md:h-[500px] bg-gradient-to-r rounded-full blur-[120px] animate-pulse",
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
        className="fixed top-0 w-full p-4 md:p-6 flex justify-between items-center z-40 px-4 md:px-8 lg:px-16"
        role="banner"
      >
        <Link 
          href="/" 
          className="flex items-center gap-3 md:gap-4 group focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-xl p-1"
          aria-label={`Accueil ${config.name}`}
        >
          <div className={cn("drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]", config.accentColor)}>
            <LogoIcon size={28} md:size={36} aria-hidden="true" />
          </div>
          <span className="text-lg md:text-xl lg:text-2xl font-black uppercase tracking-tighter italic text-white group-hover:text-blue-300 transition-colors">
            QUALISOFT <span className={config.accentColor}>{config.slug.toUpperCase()}</span>
          </span>
        </Link>
        
        <nav className="flex items-center gap-3 md:gap-4">
          <Link 
            href="https://docs.qualisoft.sn" 
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all backdrop-blur-md no-underline focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Database size={14} aria-hidden="true" /> Docs
          </Link>
          <Link 
            href="/auth/login" 
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white transition-all backdrop-blur-md no-underline shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Accès Matrix
          </Link>
        </nav>
      </header>

      {/* 🚀 MAIN CONTENT */}
      <main className="relative z-10 text-center max-w-4xl px-4 md:px-8 lg:px-10 animate-in fade-in zoom-in-95 duration-700 mt-24 md:mt-28">
        
        {/* Badge Instance */}
        <div className="flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8 opacity-50">
           <Globe size={12} md:size={14} className="shrink-0" aria-hidden="true" />
           <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] truncate">
             Instance: {config.domain}
           </span>
        </div>

        {/* Titre Principal */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] text-white mb-6 md:mb-8">
          {config.name} <br />
          <span className={cn(
            "bg-clip-text text-transparent bg-gradient-to-r",
            config.gradient
          )}>
            Sovereign OS
          </span>
        </h1>

        {/* Sous-titre */}
        <p className="text-base md:text-lg lg:text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed">
          {config.tagline}. <br className="hidden md:block"/>
          <span className="text-slate-300 font-bold italic">{config.description}</span>
        </p>

        {/* Features Grid */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 md:mb-14">
          {config.features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <span 
                key={index}
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-slate-300 hover:border-blue-500/30 hover:text-blue-300 transition-all"
              >
                <FeatureIcon size={12} md:size={14} className="shrink-0" aria-hidden="true" />
                {feature.label}
              </span>
            );
          })}
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
          <Link 
            href="/auth/login" 
            onClick={handlePrimaryCta}
            className={cn(
              "bg-gradient-to-r text-white px-6 md:px-10 lg:px-12 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase text-[9px] md:text-[10px] italic flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all no-underline w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
              config.gradient
            )}
          >
            {config.ctaPrimary} <ArrowRight size={16} md:size={18} aria-hidden="true" />
          </Link>
          
          <button 
            type="button"
            onClick={handleSecondaryCta}
            className="bg-white/5 border border-white/10 px-6 md:px-10 lg:px-12 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase text-[9px] md:text-[10px] italic text-slate-400 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-3 cursor-pointer w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]"
          >
            <Database size={16} md:size={18} aria-hidden="true" /> {config.ctaSecondary}
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-white/5">
          <p className="text-[8px] md:text-[9px] text-slate-500 uppercase tracking-[0.3em] mb-4">
            Certifications & Conformité
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 opacity-60">
            {['ISO 9001', 'ISO 14001', 'ISO 27001', 'OHADA'].map((cert, i) => (
              <span 
                key={i}
                className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400"
              >
                <CheckCircle2 size={10} md:size={12} className="text-emerald-500" aria-hidden="true" />
                {cert}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* 📡 FOOTER D'INTÉGRITÉ */}
      <footer 
        className="fixed bottom-4 md:bottom-6 w-full flex justify-center gap-4 md:gap-8 lg:gap-12 opacity-30 px-4 text-center flex-wrap"
        role="contentinfo"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} className={config.accentColor} aria-hidden="true" />
          <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest leading-none">
            Certifié Qualisoft SDE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={12} className={config.accentColor} aria-hidden="true" />
          <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest leading-none">
            Cluster Dakar Stable
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Globe size={12} className={config.accentColor} aria-hidden="true" />
          <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest leading-none">
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