/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🌍 COMPONENT : LandingContent (Elite Showcase)
 * RÔLE : Présentation de l'offre Qualisoft ELITE ISO 9001
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import {
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Sparkles,
  Linkedin,
  Twitter,
  Facebook,
  Loader2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { useEffect, useState, useCallback, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  premium: boolean;
}

export interface ShowcaseItem {
  tag: string;
  title: string;
  img: string;
  tagColor: string;
}

export interface FormData {
  email: string;
}

export interface FormState {
  loading: boolean;
  submitted: boolean;
  error: string | null;
}

export interface FormErrors {
  email?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const PLANS: PricingPlan[] = [
  {
    name: "ESSAI",
    price: "0 FCFA",
    period: "/14 jours",
    desc: "Découverte totale de l'écosystème.",
    features: ["1 Utilisateur Matrix", "Conformité ISO 9001", "Support Standard", "Accès Cloud Souverain"],
    premium: false,
  },
  {
    name: "ÉMERGENCE",
    price: "55.000 FCFA",
    period: "/mois",
    desc: "Idéal pour les PME en phase de structuration.",
    features: ["5 Utilisateurs", "ISO 9001 & 14001", "Gestion Documentaire", "Tableaux de bord"],
    premium: false,
  },
  {
    name: "CROISSANCE",
    price: "105.000 FCFA",
    period: "/mois",
    desc: "Le standard industriel pour le multi-site.",
    features: ["20 Utilisateurs", "Full Pack ISO", "Audits & Non-Conformités", "Analytique Avancée"],
    premium: true,
  },
  {
    name: "ENTREPRISE",
    price: "175.000 FCFA",
    period: "/mois",
    desc: "Performance globale et gestion des risques.",
    features: ["Utilisateurs Illimités", "Workflow Personnalisé", "Gestion des Risques", "Cockpit Direction"],
    premium: false,
  },
  {
    name: "GROUPE",
    price: "Sur Devis",
    period: "",
    desc: "Souveraineté totale pour holdings.",
    features: ["Instance Dédiée", "SLA Garanti 99.9%", "Support Élite 24/7", "Sécurité Matrix avancée"],
    premium: false,
  },
];

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  { tag: "QS Matrix V2", title: "Cockpit Opérationnel", img: "/images/qs_cockpit.jpg", tagColor: "text-blue-400" },
  { tag: "Intelligence Stratégique", title: "Revue de Direction", img: "/images/qs_revuedirection.jpg", tagColor: "text-emerald-400" },
  { tag: "Pyramide Structurelle", title: "Architecture SMI", img: "/images/qsorg01.gif", tagColor: "text-purple-400" }
];

const SOCIAL_LINKS = [
  { name: 'LinkedIn', url: 'https://linkedin.com/company/qualisoft', icon: Linkedin },
  { name: 'Twitter', url: 'https://twitter.com/qualisoft_sn', icon: Twitter },
  { name: 'Facebook', url: 'https://facebook.com/qualisoft.elite', icon: Facebook },
];

// ============================================================================
// UTILITAIRES
// ============================================================================

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
};

// ============================================================================
// SOUS-COMPOSANT : PRICING CARD
// ============================================================================

interface PricingCardProps {
  plan: PricingPlan;
  onSelect: (planName: string) => void;
}

function PricingCard({ plan, onSelect }: PricingCardProps) {
  const handleSelect = () => {
    onSelect(plan.name);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect();
    }
  };

  return (
    <article 
      className={cn(
        "relative p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl border-2 transition-all duration-500 hover:-translate-y-2 flex flex-col focus-within:ring-2 focus-within:ring-blue-400",
        plan.premium 
          ? "border-blue-500 bg-blue-900/10 shadow-2xl shadow-blue-900/30" 
          : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"
      )}
      role="article"
      aria-label={`Plan ${plan.name}: ${plan.price}${plan.period}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {plan.premium && (
        <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-[6px] md:text-[7px] lg:text-[8px] font-black px-4 md:px-6 py-1 md:py-2 rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/30 whitespace-nowrap text-white">
          Recommandé
        </div>
      )}
      <h3 className="text-base md:text-lg font-black uppercase italic mb-2 tracking-tighter text-white">{plan.name}</h3>
      <p className="text-slate-500 text-[8px] md:text-[9px] mb-4 md:mb-6 uppercase font-bold italic h-8 md:h-10 leading-relaxed">{plan.desc}</p>
      <div className="mb-6 md:mb-8 pb-6 md:pb-8 border-b border-white/10">
        <div className="text-xl md:text-2xl font-black italic tracking-tighter text-white">{plan.price}</div>
        {plan.period && (
          <div className="text-[8px] md:text-[9px] lg:text-[10px] text-blue-400 uppercase font-black mt-1 md:mt-2">{plan.period}</div>
        )}
      </div>
      <ul 
        className="space-y-3 md:space-y-4 mb-8 md:mb-10 flex-1 text-left"
        aria-label={`Fonctionnalités du plan ${plan.name}`}
      >
        {plan.features.map((feat, j) => (
          <li key={j} className="flex items-start gap-2 md:gap-3 text-[8px] md:text-[9px] lg:text-[10px] font-bold uppercase text-slate-300 italic leading-snug">
            <CheckCircle2 size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{feat}</span>
          </li>
        ))}
      </ul>
      <button 
        type="button"
        onClick={handleSelect}
        className={cn(
          "block w-full py-3 md:py-4 rounded-xl md:rounded-2xl text-center text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-400",
          plan.premium 
            ? "bg-blue-600 text-white shadow-xl hover:bg-blue-500" 
            : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
        )}
        aria-label={`Sélectionner le plan ${plan.name}`}
      >
        Sélectionner
      </button>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SHOWCASE CARD
// ============================================================================

interface ShowcaseCardProps {
  item: ShowcaseItem;
  index: number;
}

function ShowcaseCard({ item, index }: ShowcaseCardProps) {
  return (
    <figure 
      className={cn(
        "group relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-slate-900/50 shadow-xl transition-all hover:scale-[1.02] focus-within:ring-2 focus-within:ring-blue-400",
        "animate-in fade-in slide-in-from-bottom-4 duration-700"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-4 md:p-6 text-left relative z-10 bg-gradient-to-b from-black/80 to-transparent pt-4 md:pt-6 pb-8 md:pb-12">
        <span className={cn("text-[7px] md:text-[8px] lg:text-[9px] font-black uppercase tracking-widest", item.tagColor)}>
          {item.tag}
        </span>
        <h4 className="text-base md:text-lg font-black italic uppercase leading-tight mt-0.5 md:mt-1 text-white">
          {item.title}
        </h4>
      </div>
      <img 
        src={item.img} 
        alt={item.title} 
        className="w-full h-48 md:h-56 lg:h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-110"
        loading="lazy"
        width={400}
        height={256}
      />
    </figure>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function LandingContent() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    loading: false,
    submitted: false,
    error: null,
  });
  const [formData, setFormData] = useState<FormData>({
    email: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  /**
   * 🛡️ PROTECTION D'HYDRATATION
   */
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Email professionnel invalide";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, email: value }));
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
  }, [formErrors.email]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez entrer un email valide");
      return;
    }

    setFormState(prev => ({ ...prev, loading: true, error: null }));
    const toastId = toast.loading('Enregistrement de votre demande...');

    try {
      // TODO: Replace with actual API call
      // await apiClient.post('/api/leads', { email: formData.email });
      
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setFormState(prev => ({ ...prev, submitted: true, loading: false }));
      setSubmitted(true);
      toast.success('✅ Demande enregistrée ! L\'équipe vous contactera sous 48h', { id: toastId });
      setFormData({ email: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      setFormState(prev => ({ ...prev, loading: false, error: message }));
      toast.error(`❌ ${message}`, { id: toastId });
    }
  }, [formData.email, validateForm]);

  const handlePlanSelect = useCallback((planName: string) => {
    // Scroll to trial form
    const formSection = document.getElementById('essai');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const firstInput = formSection.querySelector('input');
        firstInput?.focus();
      }, 500);
    }
    toast.info(`Plan ${planName} sélectionné`);
  }, []);

  const handleSocialClick = useCallback((name: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    // Track social click
    console.log(`Social click: ${name}`);
  }, []);

  if (!hasMounted) {
    return (
      <div 
        className="min-h-screen bg-[#0B0F1A] flex items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Chargement de la page"
      >
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-blue-400 animate-spin mx-auto" aria-hidden="true" />
          <p className="text-slate-400 text-[9px] md:text-[10px] uppercase tracking-widest">Chargement Qualisoft Elite...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 selection:text-blue-200 font-sans italic overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* --- NAVBAR ELITE --- */}
      <nav 
        className="fixed top-0 w-full z-50 bg-[#0B0F1A]/90 backdrop-blur-md border-b border-white/5 px-4 md:px-6 lg:px-12 py-3 md:py-4 lg:py-5 flex items-center justify-between shadow-2xl"
        role="navigation"
        aria-label="Navigation principale"
      >
        <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
          <div 
            className="h-10 md:h-12 w-auto flex items-center justify-center relative group cursor-pointer" 
            onClick={() => router.push('/')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push('/');
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Retour à l'accueil"
          >
            <img
              src="/images/qslogo.png"
              alt="Qualisoft Logo"
              className="h-full w-auto object-contain filter brightness-110 group-hover:scale-105 transition-transform duration-500"
              width={40}
              height={40}
              loading="eager"
            />
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg md:text-xl lg:text-2xl font-black uppercase tracking-tighter leading-none m-0">
              Qualisoft <span className="text-blue-400">ELITE</span>
            </h1>
            <p className="text-[7px] md:text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5 md:mt-1 m-0">
              RD 2030 Architecture
            </p>
          </div>
        </div>

        <a 
          href="https://app.qualisoft.sn/auth/login"
          className="bg-white/5 hover:bg-blue-600 border border-white/10 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 rounded-lg md:rounded-xl transition-all shadow-lg shadow-black/20 focus:outline-none focus:ring-2 focus:ring-blue-400 no-underline"
          aria-label="Accéder à la console Matrix"
        >
          <span className="hidden sm:inline">Accès Matrix Console</span>
          <span className="sm:hidden">Matrix</span>
        </a>
      </nav>

      {/* --- HERO SECTION --- */}
      <section 
        className="relative pt-40 md:pt-48 lg:pt-56 pb-8 md:pb-12 px-4 md:px-6 overflow-hidden text-center"
        aria-labelledby="hero-title"
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true">
          <img
            src="/images/qs_fondecran.webp"
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A] via-[#0B0F1A]/80 to-[#0B0F1A]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Launch Badge */}
          <div className="relative inline-flex items-center justify-center mb-8 md:mb-10 lg:mb-12 group">
            <div 
              className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-40 animate-pulse"
              aria-hidden="true"
            ></div>
            <div className="relative flex items-center gap-2 md:gap-3 lg:gap-4 px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-full bg-slate-900 border border-blue-500/50 text-white shadow-[0_0_40px_rgba(37,99,235,0.3)]">
              <div className="p-1.5 md:p-2 bg-blue-600/20 rounded-full" aria-hidden="true">
                <Rocket size={16} className="w-4 h-4 md:w-5 md:h-5 text-blue-400 animate-bounce" />
              </div>
              <span className="text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-blue-100">
                Lancement Officiel : 02 Mars 2026
              </span>
            </div>
          </div>

          {/* Main Title */}
          <h1 id="hero-title" className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-6 md:mb-8 lg:mb-10 italic">
            Pilotez votre <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-600">
              Conformité.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl md:max-w-3xl mx-auto text-slate-400 text-base md:text-lg lg:text-xl xl:text-2xl font-bold italic mb-8 md:mb-10 lg:mb-12 leading-relaxed px-4">
            L&apos;excellence ISO 9001, 14001 et 45001 digitalisée.{" "}
            <br className="hidden md:block" />
            Rejoignez l&apos;élite souveraine du pilotage d&apos;entreprise.
          </p>

          {/* Trial Form */}
          <section
            id="essai"
            className="max-w-md lg:max-w-lg mx-auto bg-white/5 border border-white/10 p-4 md:p-6 lg:p-8 xl:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] shadow-2xl backdrop-blur-md mb-8 md:mb-10 lg:mb-12 relative overflow-hidden"
            aria-labelledby="trial-form-title"
          >
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-16 md:w-20 lg:w-32 h-1 bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,1)]"
              aria-hidden="true"
            ></div>
            {!formState.submitted ? (
              <form
                className="space-y-4 md:space-y-5 lg:space-y-6"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="text-left space-y-2 md:space-y-3">
                  <label 
                    htmlFor="email"
                    className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-blue-400 ml-2 md:ml-4 italic block"
                  >
                    Réserver mon ESSAI prioritaire (14 Jours)
                  </label>
                  <div className="relative group">
                    <Mail
                      className={cn(
                        "absolute left-4 md:left-5 lg:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 transition-colors",
                        formErrors.email ? "text-red-400" : "text-slate-500 group-focus-within:text-blue-400"
                      )}
                      size={20}
                      aria-hidden="true"
                    />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="votre.nom@entreprise.sn"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={cn(
                        "w-full bg-[#0B0F1A]/80 border-2 rounded-xl md:rounded-2xl lg:rounded-3xl py-3 md:py-4 lg:py-6 pl-10 md:pl-12 lg:pl-16 text-[10px] md:text-sm text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-700",
                        formErrors.email ? "border-red-500 focus:border-red-500" : "border-white/10"
                      )}
                      aria-required="true"
                      aria-invalid={!!formErrors.email}
                      aria-describedby={formErrors.email ? 'email-error' : undefined}
                    />
                  </div>
                  {formErrors.email && (
                    <p id="email-error" className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                      <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.email}
                    </p>
                  )}
                  {formState.error && (
                    <div className="p-2 md:p-3 bg-red-500/10 border border-red-500/30 rounded-lg md:rounded-xl flex items-start gap-2" role="alert">
                      <AlertCircle size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-red-300 text-[9px] md:text-[10px]">{formState.error}</p>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={formState.loading}
                  className={cn(
                    "w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-black py-3 md:py-4 lg:py-6 rounded-xl md:rounded-2xl lg:rounded-3xl transition-all flex items-center justify-center gap-2 md:gap-3 lg:gap-4 text-[9px] md:text-[10px] lg:text-xs uppercase tracking-widest shadow-2xl shadow-blue-600/40 active:scale-95 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                    formState.loading && "cursor-wait"
                  )}
                  aria-busy={formState.loading}
                  aria-label="Démarrer mon essai Elite"
                >
                  {formState.loading ? (
                    <><Loader2 size={16} className="w-4 h-4 md:w-5 md:h-5 animate-spin" aria-hidden="true" /> TRAITEMENT...</>
                  ) : (
                    <><span className="hidden sm:inline">DÉMARRER MON ESSAI ÉLITE</span><span className="sm:hidden">ESSAI ÉLITE</span> <Sparkles size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /></>
                  )}
                </button>
              </form>
            ) : (
              <div 
                className="py-8 md:py-10 lg:py-12 space-y-4 md:space-y-6 animate-in zoom-in duration-500 text-center"
                role="status"
                aria-live="polite"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-emerald-400" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-white mb-2">
                    Accès Réservé !
                  </h3>
                  <p className="text-slate-400 text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase italic tracking-widest leading-relaxed">
                    Elite a enregistré votre demande. <br /> L&apos;équipe Qualisoft vous contactera sous 48h.
                  </p>
                </div>
                <a
                  href="https://app.qualisoft.sn/auth/login"
                  className="text-blue-400 hover:text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors mt-4 inline-flex items-center gap-1.5 md:gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
                >
                  Accéder à mon espace <ArrowRight size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />
                </a>
              </div>
            )}
          </section>
        </div>
      </section>

      {/* --- SHOWCASE SECTION --- */}
      <section 
        className="max-w-7xl mx-auto mb-16 md:mb-20 lg:mb-24 xl:mb-32 px-4 text-center"
        aria-labelledby="showcase-title"
      >
        <h2 id="showcase-title" className="sr-only">Présentation des modules Qualisoft Elite</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {SHOWCASE_ITEMS.map((item, idx) => (
            <ShowcaseCard key={idx} item={item} index={idx} />
          ))}
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section 
        className="max-w-7xl mx-auto px-4 md:px-6 mb-16 md:mb-20 lg:mb-24 xl:mb-32"
        aria-labelledby="pricing-title"
      >
        <h2 id="pricing-title" className="sr-only">Plans et tarifs Qualisoft Elite</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {PLANS.map((plan, i) => (
            <PricingCard key={i} plan={plan} onSelect={handlePlanSelect} />
          ))}
        </div>
      </section>

      {/* --- FOOTER SOUVERAIN --- */}
      <footer 
        className="pt-16 md:pt-20 lg:pt-24 pb-8 md:pb-10 lg:pb-12 px-4 md:px-6 border-t border-white/10 bg-[#0B0F1A] relative overflow-hidden"
        role="contentinfo"
      >
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-24 md:h-28 lg:h-32 bg-blue-600/10 blur-[80px] md:blur-[100px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 relative z-10 mb-12 md:mb-16 lg:mb-20">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <img 
                src="/images/qslogo.png" 
                alt="Qualisoft Elite" 
                className="h-8 md:h-10 w-auto"
                width={32}
                height={32}
              />
              <h4 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white leading-none m-0">
                Qualisoft <br />
                <span className="text-blue-400">ELITE</span>
              </h4>
            </div>
            <p className="text-[9px] md:text-[10px] text-slate-400 uppercase font-bold italic leading-relaxed mb-6 md:mb-8">
              Le standard industriel de la digitalisation QHSE avec des économies réelles.
            </p>
            <div className="flex gap-3 md:gap-4" role="navigation" aria-label="Réseaux sociaux">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleSocialClick(social.name, social.url)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label={`Qualisoft sur ${social.name}`}
                  >
                    <Icon size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
          
          {/* Address */}
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-3 md:pb-4 m-0">
              Siège Social
            </h4>
            <address className="not-italic flex items-start gap-3 md:gap-4 text-[9px] md:text-[10px] lg:text-[11px] font-bold text-slate-300 uppercase italic leading-loose">
              <MapPin size={16} className="w-4 h-4 md:w-5 md:h-5 text-blue-400 shrink-0 mt-0.5 md:mt-1" aria-hidden="true" />
              <span>
                Villa 247, Route du Lac Rose, <br />
                Dakar, Sénégal
              </span>
            </address>
          </div>
          
          {/* Contact */}
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-3 md:pb-4 m-0">
              Contact
            </h4>
            <div className="flex items-start gap-3 md:gap-4 text-[9px] md:text-[10px] lg:text-[11px] font-bold text-slate-300 uppercase italic leading-loose">
              <Phone size={16} className="w-4 h-4 md:w-5 md:h-5 text-blue-400 shrink-0 mt-0.5 md:mt-1" aria-hidden="true" />
              <p className="italic m-0">
                <a href="tel:+221774410902" className="hover:text-blue-400 transition-colors no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1">
                  +221 77 441 09 02
                </a>
              </p>
            </div>
            <div className="flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] lg:text-[11px] font-bold text-slate-300 uppercase pt-2">
              <Mail size={16} className="w-4 h-4 md:w-5 md:h-5 text-blue-400 shrink-0" aria-hidden="true" />
              <a
                href="mailto:ab.thiongane@qualisoft.sn"
                className="hover:text-blue-400 transition-colors italic focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1 py-0.5"
              >
                ab.thiongane@qualisoft.sn
              </a>
            </div>
          </div>
        </div>
        <div className="pt-6 md:pt-8 border-t border-white/5 text-center relative z-10">
          <p className="text-[7px] md:text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest italic m-0">
            © 2026 QUALISOFT RD 2030 • RaaS
          </p>
        </div>
      </footer>
    </div>
  );
}