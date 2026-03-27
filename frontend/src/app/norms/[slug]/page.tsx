/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : Normes ISO & Diagnostic Matrix
 * RÔLE : Information Publique + Infographie PDCA + Quiz Protégé
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useEffect, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeft, ShieldCheck, Zap, Lock, RefreshCcw, BarChart, 
  ExternalLink, User, Building, Phone, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export type NormSlug = 'iso-9001' | 'iso-14001' | 'iso-45001' | 'iso-27001';
export type QuizMode = 'info' | 'quiz';
export type QuizAnswer = 'OUI' | 'UN PEU' | 'NON';

export interface NormData {
  id: string;
  label: string;
  color: string;
  content: string;
  official: string;
  showPDCA: boolean;
}

export interface Question {
  q: string;
  weight: number;
  norm?: string;
}

export interface UserInfo {
  name: string;
  company: string;
  email: string;
  phone: string;
}

export interface FormErrors {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface PDCACardProps {
  step: string;
  title: string;
  description: string;
  color: string;
  background: string;
}

export interface QuizBtnProps {
  active: boolean;
  label: string;
  color: string;
  onClick: () => void;
  ariaLabel: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const NORMS_DATA: Record<NormSlug, NormData> = {
  "iso-9001": { 
    id: "ISO 9001", 
    label: "Management Qualité", 
    color: "text-blue-400", 
    content: "Standard mondial pour la satisfaction client et la maîtrise des processus (§4.4). Intègre nativement l'approche risques §6.1.",
    official: "https://www.iso.org/fr/iso-9001-quality-management.html",
    showPDCA: true
  },
  "iso-14001": { 
    id: "ISO 14001", 
    label: "Management Environnement", 
    color: "text-emerald-400", 
    content: "Référence pour la performance écologique et la conformité réglementaire environnementale (§6.1.3).",
    official: "https://www.iso.org/fr/iso-14001-environmental-management.html",
    showPDCA: false
  },
  "iso-45001": { 
    id: "ISO 45001", 
    label: "Santé & Sécurité", 
    color: "text-amber-400", 
    content: "Cadre pour la sécurité des travailleurs et la réduction des dangers SST (§6.1.2).",
    official: "https://www.iso.org/fr/iso-45001-occupational-health-and-safety.html",
    showPDCA: false
  },
  "iso-27001": { 
    id: "ISO 27001", 
    label: "Sécurité Information", 
    color: "text-red-400", 
    content: "Norme souveraine pour la cybersécurité et la protection des actifs informationnels Matrix.",
    official: "https://www.iso.org/fr/iso-iec-27001-information-security.html",
    showPDCA: false
  }
};

const QUESTIONS_POOL: Question[] = [
  // 10 ISO 9001
  { q: "[9001] Vos processus sont-ils cartographiés avec des interactions claires (§4.4) ?", weight: 5, norm: '9001' },
  { q: "[9001] La Direction démontre-t-elle un leadership actif et documenté (§5.1) ?", weight: 5, norm: '9001' },
  { q: "[9001] Réalisez-vous une analyse de risques et opportunités par processus (§6.1) ?", weight: 5, norm: '9001' },
  { q: "[9001] Les ressources nécessaires au SMI sont-elles identifiées et fournies (§7.1) ?", weight: 5, norm: '9001' },
  { q: "[9001] Votre GED garantit-elle l'intégrité des documents (§7.5) ?", weight: 5, norm: '9001' },
  { q: "[9001] Maîtrisez-vous la conformité des prestataires externes (§8.4) ?", weight: 5, norm: '9001' },
  { q: "[9001] Le processus d'écoute client est-il systématique (§9.1.2) ?", weight: 5, norm: '9001' },
  { q: "[9001] Les audits internes sont-ils réalisés selon un planning rigoureux (§9.2) ?", weight: 5, norm: '9001' },
  { q: "[9001] La Revue de Direction statue-t-elle sur l'efficacité du système (§9.3) ?", weight: 5, norm: '9001' },
  { q: "[9001] Les non-conformités font-elles l'objet d'une analyse de cause (§10.2) ?", weight: 5, norm: '9001' },
  // 3 ISO 14001
  { q: "[14001] Identifiez-vous vos aspects environnementaux significatifs ?", weight: 10, norm: '14001' },
  { q: "[14001] Avez-vous un plan d'urgence testé pour les incidents écologiques ?", weight: 10, norm: '14001' },
  { q: "[14001] Votre veille réglementaire environnementale est-elle à jour ?", weight: 10, norm: '14001' },
  // 3 ISO 45001
  { q: "[45001] Les travailleurs participent-ils à l'identification des dangers ?", weight: 10, norm: '45001' },
  { q: "[45001] Suivez-vous mensuellement vos taux de fréquence et gravité ?", weight: 10, norm: '45001' },
  { q: "[45001] Vos EPI sont-ils conformes et leur port contrôlé ?", weight: 10, norm: '45001' },
  // 3 ISO 27001
  { q: "[27001] Votre Déclaration d'Applicabilité (SoA) est-elle signée ?", weight: 10, norm: '27001' },
  { q: "[27001] Appliquez-vous le principe du moindre privilège informatique ?", weight: 10, norm: '27001' },
  { q: "[27001] Vos sauvegardes sont-elles immuables et testées ?", weight: 10, norm: '27001' }
];

const DEFAULT_USER_INFO: UserInfo = {
  name: '',
  company: '',
  email: '',
  phone: ''
};

// ============================================================================
// SOUS-COMPOSANT : PDCA CARD
// ============================================================================

function PDCACard({ step, title, description, color, background }: PDCACardProps) {
  return (
    <article 
      className={cn(
        "p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl border hover:scale-[1.02] transition-transform text-left focus-within:ring-2 focus-within:ring-blue-400",
        background,
        color
      )}
      role="article"
      aria-label={`Étape ${step}: ${title}`}
      tabIndex={0}
    >
      <div className="flex items-start gap-4 md:gap-6">
        <span className="text-3xl md:text-4xl font-black opacity-40" aria-hidden="true">{step}</span>
        <div>
          <p className="text-base md:text-lg font-black uppercase italic m-0 text-white mb-1 md:mb-2">{title}</p>
          <p className="text-[9px] md:text-[10px] lg:text-xs font-bold text-slate-400 uppercase m-0 leading-relaxed">{description}</p>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : QUIZ BUTTON
// ============================================================================

function QuizBtn({ active, label, color, onClick, ariaLabel }: QuizBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 py-2 md:py-3 lg:py-4 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] lg:text-[11px] uppercase tracking-widest transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
        active 
          ? cn(color, "text-white shadow-lg") 
          : "bg-[#0B0F1A] text-slate-500 hover:bg-white/10 border border-white/5"
      )}
      aria-pressed={active}
      aria-label={ariaLabel}
    >
      {label}
    </button>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function NormDetailPage() {
  const params = useParams();
  const slug = params?.slug as NormSlug | undefined;
  const norm = NORMS_DATA[slug || 'iso-9001'] || NORMS_DATA['iso-9001'];
  
  const [mode, setMode] = useState<QuizMode>('info');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>(DEFAULT_USER_INFO);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>(QUESTIONS_POOL);
  const [answers, setAnswers] = useState<Record<number, QuizAnswer>>({});
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (mode === 'quiz') {
      const mixed = [...QUESTIONS_POOL].sort(() => Math.random() - 0.5);
      setShuffledQuestions(mixed);
      setAnswers({});
      setScore(null);
      setIsUnlocked(false);
      setUserInfo(DEFAULT_USER_INFO);
      setFormErrors({});
    }
  }, [mode]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!userInfo.name.trim()) {
      errors.name = "Le nom est obligatoire";
    }
    if (!userInfo.company.trim()) {
      errors.company = "L'entreprise est obligatoire";
    }
    if (!userInfo.email.trim()) {
      errors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      errors.email = "Email invalide";
    }
    if (!userInfo.phone.trim()) {
      errors.phone = "Le téléphone est obligatoire";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUnlock = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setIsUnlocked(true);
    }
  };

  const calculateResult = () => {
    let totalPoints = 0;
    let maxPoints = 0;
    
    shuffledQuestions.forEach((q, idx) => {
      maxPoints += q.weight;
      if (answers[idx] === 'OUI') {
        totalPoints += q.weight;
      } else if (answers[idx] === 'UN PEU') {
        totalPoints += q.weight * 0.5;
      }
    });
    
    const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    setScore(percentage);
  };

  const handleAnswer = (idx: number, answer: QuizAnswer) => {
    setAnswers(prev => ({ ...prev, [idx]: answer }));
  };

  const handleReset = () => {
    setAnswers({});
    setScore(null);
  };

  const isFormValid = userInfo.name && userInfo.email && userInfo.company && userInfo.phone;
  const allQuestionsAnswered = Object.keys(answers).length === shuffledQuestions.length;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden">
      
      {/* NAV */}
      <nav 
        className="h-14 md:h-16 lg:h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-6 lg:px-8 xl:px-20 sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-md z-50"
        role="navigation"
        aria-label="Navigation principale"
      >
        <Link 
          href="/" 
          className="flex items-center gap-1.5 md:gap-2 lg:gap-3 text-slate-500 no-underline hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
          aria-label="Retour au portail"
        >
          <ChevronLeft size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
          <span className="font-black uppercase tracking-widest text-[8px] md:text-[9px] lg:text-[10px]">
            <span className="hidden sm:inline">Retour Portail</span>
            <span className="sm:hidden">Retour</span>
          </span>
        </Link>
        <button 
          type="button"
          onClick={() => setMode(mode === 'info' ? 'quiz' : 'info')} 
          className="flex items-center gap-1.5 md:gap-2 lg:gap-3 px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 bg-blue-600 rounded-lg md:rounded-xl lg:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[9px] lg:text-[10px] hover:bg-white hover:text-blue-700 transition-all shadow-lg border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={mode === 'info' ? 'Démarrer le quiz de conformité' : 'Fermer le quiz'}
        >
          {mode === 'info' ? (
            <><Zap size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">Quiz Conformité</span><span className="sm:hidden">Quiz</span></>
          ) : (
            <><X size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">Fermer Quiz</span><span className="sm:hidden">Fermer</span></>
          )}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto py-8 md:py-12 lg:py-16 xl:py-20 px-4 md:px-6 lg:px-8 text-left" role="main">
        {mode === 'info' ? (
          <article className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 md:space-y-10 lg:space-y-12 lg:space-y-16" aria-labelledby="norm-title">
            <header className="space-y-2 md:space-y-3 lg:space-y-4 text-left">
              <h1 id="norm-title" className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl xl:text-8xl font-black uppercase italic tracking-tighter m-0 leading-none">{norm.id}</h1>
              <p className={cn("text-lg md:text-xl lg:text-2xl font-black uppercase italic", norm.color)}>{norm.label}</p>
            </header>

            <section 
              className="p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl lg:rounded-[3rem] text-[10px] md:text-sm lg:text-xl font-bold leading-relaxed text-slate-300 italic shadow-2xl"
              aria-label="Description de la norme"
            >
              {norm.content}
            </section>

            {norm.showPDCA && (
              <section className="py-8 md:py-10 lg:py-12 xl:py-16 space-y-6 md:space-y-8 lg:space-y-10 lg:space-y-12" aria-labelledby="pdca-title">
                <div className="flex items-center gap-3 md:gap-4 border-b border-white/10 pb-4 md:pb-6">
                   <RefreshCcw className="text-blue-400 animate-spin-slow w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
                   <h2 id="pdca-title" className="text-2xl md:text-3xl font-black uppercase italic m-0">Le Cycle PDCA</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6" role="list">
                  <PDCACard step="P" title="PLAN (Planifier)" description="Établir les objectifs et les processus (§6.0)." color="border-blue-500/50" background="bg-blue-900/10" />
                  <PDCACard step="D" title="DO (Faire)" description="Mettre en œuvre ce qui a été planifié (§7.0 & §8.0)." color="border-emerald-500/50" background="bg-emerald-900/10" />
                  <PDCACard step="C" title="CHECK (Vérifier)" description="Surveiller et mesurer les processus (§9.0)." color="border-amber-500/50" background="bg-amber-900/10" />
                  <PDCACard step="A" title="ACT (Agir)" description="Entreprendre des actions pour améliorer (§10.0)." color="border-red-500/50" background="bg-red-900/10" />
                </div>
              </section>
            )}
            
            <a 
              href={norm.official} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 md:gap-3 lg:gap-4 w-full py-4 md:py-5 lg:py-6 bg-[#0F172A] text-blue-400 uppercase font-black tracking-widest rounded-xl md:rounded-2xl border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all no-underline shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={`Lien vers la référence officielle ${norm.id} sur ISO.ORG`}
            >
                Référence Officielle ISO.ORG <ExternalLink size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
            </a>
          </article>
        ) : (
          <article className="animate-in zoom-in-95 duration-500" aria-labelledby="quiz-title">
            {!isUnlocked ? (
              <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 lg:space-y-10 text-center">
                <Lock className="text-blue-400 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 mx-auto" aria-hidden="true" />
                <h2 id="quiz-title" className="text-2xl md:text-3xl lg:text-4xl font-black uppercase italic">Identification Diagnostic</h2>
                <p className="text-slate-400 font-bold tracking-widest uppercase text-[9px] md:text-[10px] lg:text-xs">Aiguillage sécurisé vers ab.thiongane@qualisoft.sn</p>
                <form 
                  onSubmit={handleUnlock} 
                  className="bg-[#0F172A] border border-blue-600/30 p-4 md:p-6 lg:p-8 xl:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3rem] grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6 text-left shadow-2xl"
                  role="form"
                  aria-label="Formulaire d'identification"
                >
                  <div className="space-y-1 md:space-y-1.5">
                    <label htmlFor="name" className="sr-only">Nom et prénom</label>
                    <input 
                      id="name"
                      required 
                      placeholder="NOM & PRÉNOM" 
                      className={cn(
                        "bg-[#0B0F1A] border border-white/10 p-3 md:p-4 lg:p-5 rounded-lg md:rounded-xl font-black text-white outline-none focus:border-blue-500 transition-colors w-full",
                        formErrors.name && "border-red-500/50"
                      )} 
                      value={userInfo.name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setUserInfo({...userInfo, name: e.target.value});
                        if (formErrors.name) setFormErrors({...formErrors, name: undefined});
                      }}
                      aria-required="true"
                      aria-invalid={!!formErrors.name}
                    />
                    {formErrors.name && (
                      <p className="text-red-400 text-[8px] flex items-center gap-1" role="alert">
                        <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1 md:space-y-1.5">
                    <label htmlFor="company" className="sr-only">Entreprise</label>
                    <input 
                      id="company"
                      required 
                      placeholder="ENTREPRISE" 
                      className={cn(
                        "bg-[#0B0F1A] border border-white/10 p-3 md:p-4 lg:p-5 rounded-lg md:rounded-xl font-black text-white outline-none focus:border-blue-500 transition-colors w-full",
                        formErrors.company && "border-red-500/50"
                      )} 
                      value={userInfo.company}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setUserInfo({...userInfo, company: e.target.value});
                        if (formErrors.company) setFormErrors({...formErrors, company: undefined});
                      }}
                      aria-required="true"
                      aria-invalid={!!formErrors.company}
                    />
                    {formErrors.company && (
                      <p className="text-red-400 text-[8px] flex items-center gap-1" role="alert">
                        <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.company}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1 md:space-y-1.5">
                    <label htmlFor="email" className="sr-only">Email professionnel</label>
                    <input 
                      id="email"
                      required 
                      type="email"
                      placeholder="EMAIL PROFESSIONNEL" 
                      className={cn(
                        "bg-[#0B0F1A] border border-white/10 p-3 md:p-4 lg:p-5 rounded-lg md:rounded-xl font-black text-white outline-none focus:border-blue-500 transition-colors w-full",
                        formErrors.email && "border-red-500/50"
                      )} 
                      value={userInfo.email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setUserInfo({...userInfo, email: e.target.value});
                        if (formErrors.email) setFormErrors({...formErrors, email: undefined});
                      }}
                      aria-required="true"
                      aria-invalid={!!formErrors.email}
                    />
                    {formErrors.email && (
                      <p className="text-red-400 text-[8px] flex items-center gap-1" role="alert">
                        <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1 md:space-y-1.5">
                    <label htmlFor="phone" className="sr-only">Mobile</label>
                    <input 
                      id="phone"
                      required 
                      placeholder="MOBILE" 
                      className={cn(
                        "bg-[#0B0F1A] border border-white/10 p-3 md:p-4 lg:p-5 rounded-lg md:rounded-xl font-black text-white outline-none focus:border-blue-500 transition-colors w-full",
                        formErrors.phone && "border-red-500/50"
                      )} 
                      value={userInfo.phone}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setUserInfo({...userInfo, phone: e.target.value});
                        if (formErrors.phone) setFormErrors({...formErrors, phone: undefined});
                      }}
                      aria-required="true"
                      aria-invalid={!!formErrors.phone}
                    />
                    {formErrors.phone && (
                      <p className="text-red-400 text-[8px] flex items-center gap-1" role="alert">
                        <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.phone}
                      </p>
                    )}
                  </div>
                  <button 
                    type="submit"
                    disabled={!isFormValid} 
                    className={cn(
                      "md:col-span-2 py-3 md:py-4 lg:py-6 rounded-lg md:rounded-xl lg:rounded-2xl font-black uppercase tracking-widest transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                      isFormValid 
                        ? 'bg-blue-600 text-white shadow-xl hover:bg-blue-500' 
                        : 'bg-white/5 text-slate-600 cursor-not-allowed'
                    )}
                    aria-busy={!isFormValid}
                  >
                    DÉGRISER LE QUIZ
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-8 md:mb-10 lg:mb-12 border-b border-white/10 pb-4 md:pb-6">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic m-0">Diagnostic Matrix SDE</h2>
                  <button 
                    type="button"
                    onClick={handleReset} 
                    className="text-slate-500 hover:text-blue-400 bg-transparent border-none cursor-pointer flex items-center gap-1.5 md:gap-2 font-black uppercase text-[8px] md:text-[9px] lg:text-[10px] tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
                    aria-label="Réinitialiser le quiz"
                  >
                    <RefreshCcw size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> Réinitialiser
                  </button>
                </div>
                <div role="form" aria-label="Questions du quiz">
                  {shuffledQuestions.map((q, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 md:p-6 lg:p-8 bg-[#0F172A] border border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl flex flex-col gap-4 md:gap-6 text-left shadow-lg hover:border-blue-600/30 transition-colors mb-3 md:mb-4 lg:mb-6"
                      role="group"
                      aria-labelledby={`question-${idx}`}
                    >
                      <span id={`question-${idx}`} className="text-[10px] md:text-sm lg:text-base font-black uppercase italic text-slate-300">{q.q}</span>
                      <div className="flex gap-2 md:gap-3" role="radiogroup" aria-labelledby={`question-${idx}`}>
                        <QuizBtn 
                          active={answers[idx] === 'OUI'} 
                          label="OUI" 
                          color="bg-blue-600" 
                          onClick={() => handleAnswer(idx, 'OUI')}
                          ariaLabel="Réponse: Oui"
                        />
                        <QuizBtn 
                          active={answers[idx] === 'UN PEU'} 
                          label="UN PEU" 
                          color="bg-amber-600" 
                          onClick={() => handleAnswer(idx, 'UN PEU')}
                          ariaLabel="Réponse: Un peu"
                        />
                        <QuizBtn 
                          active={answers[idx] === 'NON'} 
                          label="NON" 
                          color="bg-red-600" 
                          onClick={() => handleAnswer(idx, 'NON')}
                          ariaLabel="Réponse: Non"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 md:pt-8 lg:pt-10">
                   <button 
                     type="button"
                     onClick={calculateResult} 
                     disabled={!allQuestionsAnswered} 
                     className={cn(
                       "w-full py-4 md:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase tracking-widest text-base md:text-lg transition-all border-none shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400",
                       allQuestionsAnswered 
                         ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-500' 
                         : 'bg-[#0F172A] text-slate-600 cursor-not-allowed border border-white/5'
                     )}
                     aria-busy={!allQuestionsAnswered}
                     aria-label="Voir le résultat final"
                   >
                     VOIR MON RÉSULTAT FINAL
                   </button>
                </div>
                {score !== null && (
                  <section 
                    className="mt-8 md:mt-10 lg:mt-12 xl:mt-16 p-8 md:p-10 lg:p-12 xl:p-16 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-2xl md:rounded-3xl lg:rounded-[4rem] text-center shadow-2xl animate-in slide-in-from-bottom-10"
                    aria-label="Résultat du quiz"
                    role="region"
                  >
                    <h3 className="text-lg md:text-xl lg:text-2xl font-black uppercase mb-4 md:mb-6 italic tracking-widest text-blue-100">Score de Maturité Matrix</h3>
                    <div className="text-6xl md:text-7xl lg:text-8xl xl:text-[10rem] leading-none font-black italic mb-6 md:mb-8 lg:mb-10 drop-shadow-2xl" aria-label={`Score: ${score}%`}>
                      {score}%
                    </div>
                    <Link 
                      href="/#trial" 
                      className="px-8 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 bg-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-blue-900 no-underline inline-block hover:scale-105 transition-transform shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Passer à l'action - démarrer l'essai gratuit"
                    >
                      PASSER À L&apos;ACTION
                    </Link>
                  </section>
                )}
              </div>
            )}
          </article>
        )}
      </main>

      <footer className="py-8 md:py-10 lg:py-12 xl:py-16 border-t border-white/10 bg-[#05080F] text-center" role="contentinfo">
        <p className="text-[9px] md:text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest m-0 italic leading-relaxed px-4">
          Qualisoft International SDE <br/> Villa 247, Cité Cheikh Hann, Lac Rose
        </p>
      </footer>
    </div>
  );
}