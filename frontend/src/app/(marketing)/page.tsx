/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💎 MODULE : ELITE LANDING ENGINE (ELITE-SDE)
 * RÔLE : Conversion & Acquisition Clients
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + SEO
 */

import React from "react";
import Link from "next/link";
import { ShieldCheck, BarChart3, HardHat, CheckCircle2, ArrowRight, Zap, Globe, Menu, X } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  highlight?: boolean;
}

export interface PricingItemProps {
  text: string;
  light?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const NAV_ITEMS: NavItem[] = [
  { label: 'Technologies', href: '#features' },
  { label: 'Solutions', href: '#pricing' }
];

const FEATURES = [
  { 
    icon: Globe, 
    title: "Souveraineté", 
    description: "Vos données résident dans votre propre nœud Matrix. Isolation cryptographique totale entre les locataires." 
  },
  { 
    icon: BarChart3, 
    title: "Dashboard Pulse", 
    description: "Visualisez votre conformité ISO en temps réel avec des indicateurs prédictifs et automatisés.",
    highlight: true 
  },
  { 
    icon: HardHat, 
    title: "Mobilité Terrain", 
    description: "Déclarez incidents et anomalies en 3 clics sur mobile, même hors ligne. Synchronisation atomique." 
  }
];

const PRICING_PLANS = [
  {
    name: "Emergence",
    subtitle: "PME & STARTUPS INDUSTRIELLES",
    price: "0 FCFA",
    period: "/ mois",
    features: ["3 Processus Métier", "Plan d'Actions Standard", "GED Cloud Sécurisée"],
    cta: "Démarrer Gratuitement",
    highlighted: false
  },
  {
    name: "Elite",
    subtitle: "GRANDS COMPTES & MULTI-SITES",
    price: "Sur Devis",
    period: "",
    features: ["Processus Illimités", "Module Risques & Opportunités", "Audit Interne Automatisé", "Support Premium 24/7"],
    cta: "Contacter le Hub Elite",
    highlighted: true,
    badge: "Standard Industriel"
  }
];

// ============================================================================
// SOUS-COMPOSANT : FEATURE CARD
// ============================================================================

function FeatureCard({ icon: Icon, title, description, highlight = false }: FeatureCardProps) {
  return (
    <article 
      className={cn(
        "p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl transition-all duration-500 border-2 focus-within:ring-2 focus-within:ring-blue-400",
        highlight 
          ? 'bg-white shadow-2xl border-blue-600 -translate-y-2 md:-translate-y-4' 
          : 'bg-white border-slate-50 hover:shadow-xl'
      )}
      role="article"
      aria-label={`Fonctionnalité: ${title}`}
    >
      <div className={cn(
        "w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8",
        highlight ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
      )}>
        <Icon size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" strokeWidth={2.5} aria-hidden="true" />
      </div>
      <h3 className="text-xl md:text-2xl font-black uppercase italic mb-3 md:mb-4 tracking-tighter">{title}</h3>
      <p className="text-slate-500 font-bold leading-relaxed italic text-[10px] md:text-sm uppercase tracking-tight">{description}</p>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : PRICING ITEM
// ============================================================================

function PricingItem({ text, light = false }: PricingItemProps) {
  return (
    <li className="flex items-center gap-3 md:gap-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest italic">
      <CheckCircle2 
        size={16} 
        className={cn("w-4 h-4 md:w-4.5 md:h-4.5", light ? 'text-blue-400' : 'text-blue-600')} 
        aria-hidden="true" 
      />
      <span className={light ? 'text-slate-200' : 'text-slate-600'}>{text}</span>
    </li>
  );
}

// ============================================================================
// SOUS-COMPOSANT : MOBILE MENU
// ============================================================================

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-white md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navigation"
    >
      <div className="flex flex-col h-full p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 rotate-3">
              <span className="text-white font-black text-2xl italic leading-none">Q</span>
            </div>
            <div className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              Qualisoft <span className="text-blue-600">Elite</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 transition-colors bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            aria-label="Fermer le menu"
          >
            <X size={20} className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex flex-col gap-4" role="navigation" aria-label="Menu principal">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="text-slate-500 hover:text-blue-600 transition-colors font-black text-[11px] uppercase tracking-widest py-3 border-b border-slate-100"
            >
              {item.label}
            </Link>
          ))}
          <Link 
            href="/auth/login"
            onClick={onClose}
            className="bg-slate-900 text-white px-8 py-4 rounded-full hover:bg-blue-600 transition-all font-black text-[11px] uppercase tracking-widest text-center mt-4"
          >
            S'identifier
          </Link>
        </nav>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-950 font-sans selection:bg-blue-600 selection:text-white scroll-smooth overflow-x-hidden italic">
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest z-[100]"
      >
        Aller au contenu principal
      </a>

      <Toaster position="top-right" richColors theme="light" closeButton />
      
      {/* 🔝 HEADER */}
      <nav 
        className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100"
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 md:py-5 px-4 md:px-6 lg:px-12">
          <Link href="/" className="flex items-center gap-2 md:gap-3 no-underline" aria-label="Accueil Qualisoft Elite">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 rotate-3">
              <span className="text-white font-black text-xl md:text-2xl italic leading-none">Q</span>
            </div>
            <div className="text-lg md:text-xl lg:text-2xl font-black text-slate-900 uppercase tracking-tighter">
              Qualisoft <span className="text-blue-600">Elite</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8 lg:space-x-12 font-black text-[10px] md:text-[11px] uppercase tracking-widest text-slate-500">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className="hover:text-blue-600 transition-colors no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
              >
                {item.label}
              </Link>
            ))}
            <Link 
              href="/auth/login" 
              className="bg-slate-900 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full hover:bg-blue-600 transition-all shadow-xl no-underline focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              S'identifier
            </Link>
          </div>

          <button 
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            aria-label="Ouvrir le menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={20} className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* 🚀 HERO SECTION */}
      <section 
        className="relative pt-32 md:pt-40 pb-16 md:pb-20 lg:pb-24 px-4 md:px-6 overflow-hidden flex flex-col items-center justify-center min-h-screen md:min-h-[95vh] text-center"
        aria-labelledby="hero-title"
      >
        {/* HALO DÉCORATIF */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] md:h-[700px] lg:h-[800px] bg-gradient-to-b from-blue-50 to-transparent -z-10 opacity-60"
          aria-hidden="true"
        />
        
        <div className="max-w-4xl md:max-w-5xl lg:max-w-6xl mx-auto space-y-6 md:space-y-8 lg:space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div 
            className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white rounded-full text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-600/40"
            role="status"
          >
            <ShieldCheck size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
            Certifié ISO-READY 2026
          </div>
          
          <h1 id="hero-title" className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl xl:text-9xl font-black leading-[0.85] md:leading-[0.85] tracking-tighter text-slate-950 italic">
            MAÎTRISEZ VOTRE <br />
            <span className="text-blue-600">CONFORMITÉ.</span>
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-slate-500 max-w-2xl md:max-w-3xl mx-auto font-bold leading-relaxed px-2 md:px-4 italic uppercase tracking-tight">
            Le noyau QHSE nouvelle génération pour l'industrie africaine. 
            <span className="text-slate-900 underline decoration-blue-600 decoration-2 md:decoration-4 underline-offset-4 md:underline-offset-8"> Zéro papier. Zéro risque.</span>
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 lg:gap-8 pt-6 md:pt-8 lg:pt-10">
            <Link
              href="/auth/login"
              className="w-full md:w-auto bg-blue-600 text-white px-8 md:px-10 lg:px-12 py-4 md:py-5 lg:py-6 rounded-xl md:rounded-2xl lg:rounded-[2rem] text-[9px] md:text-[10px] lg:text-sm font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-2 md:gap-3 lg:gap-4 no-underline focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Lancer l'Expérience <ArrowRight size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
            </Link>
            <div className="flex items-center gap-2 md:gap-3 lg:gap-4 text-slate-400 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
              <Zap size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-amber-500" aria-hidden="true" /> 
              SÉCURISÉ PAR MATRIX CORE
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ FEATURES SECTION */}
      <section id="features" className="py-20 md:py-24 lg:py-28 xl:py-32 bg-slate-50/50" aria-labelledby="features-title">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 id="features-title" className="sr-only">Fonctionnalités</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {FEATURES.map((feature, i) => (
              <FeatureCard 
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                highlight={feature.highlight}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 💰 PRICING SECTION */}
      <section id="pricing" className="py-28 md:py-32 lg:py-36 xl:py-40 px-4 md:px-6" aria-labelledby="pricing-title">
        <div className="max-w-5xl mx-auto text-center">
          <h2 id="pricing-title" className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:text-7xl font-black mb-6 md:mb-8 lg:mb-10 uppercase tracking-tighter italic">
            L'INVESTISSEMENT <span className="text-blue-600">SÛR</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 xl:gap-12 items-stretch pt-6 md:pt-8 lg:pt-10 text-left">
            {PRICING_PLANS.map((plan, i) => (
              <article 
                key={i}
                className={cn(
                  "p-6 md:p-8 lg:p-10 xl:p-12 rounded-2xl md:rounded-3xl lg:rounded-[3rem] flex flex-col focus-within:ring-2 focus-within:ring-blue-400",
                  plan.highlighted 
                    ? 'bg-slate-950 text-white border-4 border-blue-600 shadow-2xl relative overflow-hidden' 
                    : 'border-4 border-slate-100 hover:border-blue-600/10 transition-all'
                )}
                aria-label={`Offre ${plan.name}`}
                tabIndex={0}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-blue-600 px-4 md:px-6 py-1.5 md:py-2 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest italic">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-2xl md:text-3xl font-black uppercase italic mb-1 md:mb-2 tracking-tighter text-slate-900">
                  {plan.name}
                </h3>
                <p className={cn(
                  "text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest mb-6 md:mb-8 lg:mb-10",
                  plan.highlighted ? 'text-blue-400' : 'text-slate-400'
                )}>
                  {plan.subtitle}
                </p>
                <div className="flex items-baseline gap-1 md:gap-2 mb-8 md:mb-10 lg:mb-12">
                  <span className="text-3xl md:text-4xl lg:text-5xl font-black italic">{plan.price}</span>
                  {plan.period && (
                    <span className="text-[8px] md:text-[9px] lg:text-xs uppercase text-slate-400 tracking-widest">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-4 md:space-y-5 lg:space-y-6 flex-1 mb-8 md:mb-10 lg:mb-12" role="list">
                  {plan.features.map((feature, j) => (
                    <PricingItem key={j} text={feature} light={plan.highlighted} />
                  ))}
                </ul>
                <Link 
                  href="/auth/login" 
                  className={cn(
                    "w-full py-4 md:py-5 lg:py-6 rounded-xl md:rounded-2xl lg:rounded-3xl text-center font-black uppercase text-[9px] md:text-[10px] lg:text-[11px] tracking-widest transition-all no-underline focus:outline-none focus:ring-2 focus:ring-blue-400",
                    plan.highlighted 
                      ? 'bg-blue-600 hover:bg-white hover:text-blue-600 shadow-xl shadow-blue-900/40' 
                      : 'border-4 border-slate-900 hover:bg-slate-900 hover:text-white'
                  )}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 md:py-16 lg:py-20 border-t border-slate-50 text-center opacity-40" role="contentinfo">
        <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
          Qualisoft Elite RD 2030 • Digital Sovereignty
        </p>
      </footer>
    </div>
  );
}

// ============================================================================
// UTILS
// ============================================================================

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}