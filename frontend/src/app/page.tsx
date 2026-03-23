/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
'use client';

/**
 * 🌍 MODULE : LANDING PAGE (PORTAIL PUBLIC QUALISOFT ELITE)
 * -------------------------------------------------------------------------
 * FONCTION : Vitrine de présentation et capture de prospects (Lead Gen)
 * VERSION : 3.0 - Formulaire + Quiz + PDF + Design Elite + Accessibilité
 * API : /api/leads (email SMTP + Notification Prisma)
 * QUIZ : 15 questions ISO 9001, rapport PDF via pdfkit
 * DESIGN : Elite MS, Glassmorphism, Souveraineté, WCAG AA
 * RÉVISION : 19 Mars 2026
 * -------------------------------------------------------------------------
 */

import {
  Activity, CheckCircle2, ClipboardCheck, Facebook, FileDown,
  Fingerprint, Linkedin, Mail, MapPin, Phone, Rocket,
  ShieldCheck, Sparkles, Twitter, BrainCircuit, ArrowRight,
  Loader2, AlertCircle, X
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { toast, Toaster } from 'sonner';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface LeadFormData {
  nom: string;
  entreprise: string;
  email: string;
  telephone: string;
  plan?: string;
  source: string;
  timestamp?: string;
}

interface FormState {
  loading: boolean;
  submitted: boolean;
  error: string | null;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  premium: boolean;
  slug: string;
}

interface FeatureItem {
  label: string;
  icon: React.ElementType;
  desc: string;
}

interface QuizQuestion {
  id: string;
  clause: string;
  question: string;
}

interface QuizResult {
  percentage: number;
  level: 'NIVEAU_1' | 'NIVEAU_2' | 'NIVEAU_3' | 'NIVEAU_4' | 'NIVEAU_5';
  recommendations: string[];
}

// ============================================================================
// CONSTANTES & CONFIGURATION
// ============================================================================

const API_ENDPOINTS = {
  submitLead: '/api/leads',
  quizQuestions: '/api/quiz/questions',
  quizCalculate: '/api/quiz/calculate',
  quizPDF: '/api/quiz/pdf',
  downloadGuide: '/resources/guide-iso-2026.pdf',
} as const;

const PLANS: PricingPlan[] = [
  {
    name: 'ESSAI',
    price: '0 FCFA',
    period: '/14 jours',
    desc: 'Découverte totale de l\'écosystème.',
    features: ['1 Utilisateur Matrix', 'Conformité ISO 9001', 'Support Standard', 'Accès Cloud Souverain'],
    premium: false,
    slug: 'essai',
  },
  {
    name: 'ÉMERGENCE',
    price: '55.000 FCFA',
    period: '/mois',
    desc: 'Idéal pour les PME en phase de structuration.',
    features: ['5 Utilisateurs', 'ISO 9001 & 14001', 'Gestion Documentaire', 'Tableaux de bord'],
    premium: false,
    slug: 'emergence',
  },
  {
    name: 'CROISSANCE',
    price: '105.000 FCFA',
    period: '/mois',
    desc: 'Le standard industriel pour le multi-site.',
    features: ['20 Utilisateurs', 'Full Pack ISO', 'Audits & Non-Conformités', 'Analytique Avancée'],
    premium: true,
    slug: 'croissance',
  },
  {
    name: 'ENTREPRISE',
    price: '175.000 FCFA',
    period: '/mois',
    desc: 'Performance globale et gestion des risques.',
    features: ['Utilisateurs Illimités', 'Workflow Personnalisé', 'Gestion des Risques', 'Cockpit Direction'],
    premium: false,
    slug: 'entreprise',
  },
  {
    name: 'GROUPE',
    price: 'Sur Devis',
    period: '',
    desc: 'Souveraineté totale pour holdings.',
    features: ['Instance Dédiée', 'SLA Garanti 99.9%', 'Support Élite 24/7', 'Sécurité Matrix avancée'],
    premium: false,
    slug: 'groupe',
  },
];

const FEATURES: FeatureItem[] = [
  { label: 'ISO 9001/14001', icon: ShieldCheck, desc: 'Souveraineté Totale' },
  { label: 'Audits Digitaux', icon: ClipboardCheck, desc: 'Zéro Papier Garanti' },
  { label: 'Cockpit Direction', icon: Activity, desc: 'Pilotage Temps Réel' },
  { label: 'Sécurité Matrix', icon: Fingerprint, desc: 'Isolation Multi-Tenant' },
];

const LEVEL_CONFIG: Record<QuizResult['level'], { label: string; color: string; description: string }> = {
  NIVEAU_1: {
    label: 'Niveau 1 : Initial',
    color: 'text-rose-400',
    description: 'Processus non formalisés, réactions aux problèmes',
  },
  NIVEAU_2: {
    label: 'Niveau 2 : Géré',
    color: 'text-amber-400',
    description: 'Processus documentés, mais peu mesurés',
  },
  NIVEAU_3: {
    label: 'Niveau 3 : Défini',
    color: 'text-blue-400',
    description: 'Processus standardisés et mesurés',
  },
  NIVEAU_4: {
    label: 'Niveau 4 : Mesuré',
    color: 'text-emerald-400',
    description: 'Pilotage par indicateurs, amélioration proactive',
  },
  NIVEAU_5: {
    label: 'Niveau 5 : Optimisé',
    color: 'text-indigo-400',
    description: 'Innovation continue, référence sectorielle',
  },
};

// ============================================================================
// UTILITAIRES
// ============================================================================

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
};

const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/[^0-9+]/g, '');
};

// ============================================================================
// COMPOSANT : QUIZ MODAL
// ============================================================================

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function QuizModal({ isOpen, onClose }: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, 'OUI' | 'UN PEU' | 'NON'>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Chargement des questions
  useEffect(() => {
    if (isOpen) {
      const fetchQuestions = async () => {
        try {
          const response = await fetch(API_ENDPOINTS.quizQuestions);
          if (!response.ok) throw new Error('Échec chargement questions');
          const data = await response.json();
          setQuestions(data.questions);
        } catch (error) {
          console.error('❌ Erreur chargement quiz:', error);
          toast.error('Impossible de charger le quiz. Réessayez.');
          onClose();
        } finally {
          setLoading(false);
        }
      };
      fetchQuestions();
    }
  }, [isOpen, onClose]);

  // Gestion des réponses
  const handleAnswer = useCallback((questionId: string, answer: 'OUI' | 'UN PEU' | 'NON') => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  // Navigation
  const goToNext = useCallback(() => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, questions.length]);

  const goToPrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Soumission du quiz
  const handleSubmit = useCallback(async () => {
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error(`Veuillez répondre à toutes les questions (${unanswered.length} restantes)`);
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Calcul de votre maturité SMI...');

    try {
      const response = await fetch(API_ENDPOINTS.quizCalculate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur de calcul');
      }

      const data = await response.json();
      setResult(data.result);
      toast.success('Diagnostic terminé !', { id: toastId });
    } catch (error) {
      console.error('❌ Erreur soumission quiz:', error);
      const message = error instanceof Error ? error.message : 'Erreur de calcul';
      toast.error(message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }, [answers, questions]);

  // Génération PDF
  const handleGeneratePDF = useCallback(async () => {
    if (!result) return;

    setGeneratingPDF(true);
    const toastId = toast.loading('Génération du rapport PDF...');

    try {
      const response = await fetch(API_ENDPOINTS.quizPDF, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, questions }),
      });

      if (!response.ok) throw new Error('Échec génération PDF');

      // Téléchargement du blob PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-maturite-smi-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('Rapport PDF téléchargé', { id: toastId });
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      toast.error('Échec de génération du PDF', { id: toastId });
    } finally {
      setGeneratingPDF(false);
    }
  }, [result, questions]);

  // Reset quand on ferme
  useEffect(() => {
    if (!isOpen) {
      setQuestions([]);
      setAnswers({});
      setCurrentStep(0);
      setResult(null);
      setLoading(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Écran de chargement
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-blue-500 mx-auto" size={48} />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 italic animate-pulse">
            Préparation du diagnostic...
          </p>
        </div>
      </div>
    );
  }

  // Écran de résultat
  if (result) {
    const levelConfig = LEVEL_CONFIG[result.level];

    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#0F172A] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <header className="flex justify-between items-center p-6 border-b border-white/5">
            <h2 className="text-xl font-black uppercase italic text-white">Votre Résultat</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </header>

          {/* Contenu */}
          <main className="p-6 space-y-6">
            {/* Score */}
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-linear-to-br from-blue-600/20 to-indigo-600/20 border-4 border-blue-500/30 mb-6">
                <span className="text-5xl font-black italic">{result.percentage}%</span>
              </div>
              <h3 className={cn('text-2xl font-black uppercase tracking-widest mb-2', levelConfig.color)}>
                {levelConfig.label}
              </h3>
              <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em] italic">
                {levelConfig.description}
              </p>
            </div>

            {/* Recommandations */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
              <h4 className="text-lg font-black uppercase italic text-white mb-4 flex items-center gap-2">
                <BrainCircuit size={20} className="text-blue-500" />
                Recommandations
              </h4>
              <ul className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-300 leading-relaxed">{rec}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleGeneratePDF}
                disabled={generatingPDF}
                className={cn(
                  'flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2',
                  generatingPDF && 'cursor-wait'
                )}
              >
                {generatingPDF ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Génération...
                  </>
                ) : (
                  <>
                    <FileDown size={16} /> Rapport PDF
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setAnswers({});
                  setCurrentStep(0);
                  setResult(null);
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Nouveau Diagnostic
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Écran du quiz
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <header className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              <ArrowRight size={14} className="rotate-180" /> Retour
            </button>
            <p className="text-[10px] font-black text-white">
              Question {currentStep + 1} / {questions.length}
            </p>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {/* Question */}
        <main className="p-6 space-y-6">
          {/* Clause */}
          <div className="text-center">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">
              {currentQuestion?.clause}
            </span>
          </div>

          {/* Question */}
          <h1 className="text-xl md:text-2xl font-black uppercase italic text-center leading-relaxed">
            {currentQuestion?.question}
          </h1>

          {/* Réponses */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { value: 'OUI', color: 'bg-emerald-500 hover:bg-emerald-600' },
              { value: 'UN PEU', color: 'bg-amber-500 hover:bg-amber-600' },
              { value: 'NON', color: 'bg-rose-500 hover:bg-rose-600' },
            ].map(({ value, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleAnswer(currentQuestion.id, value as 'OUI' | 'UN PEU' | 'NON')}
                className={cn(
                  'py-4 px-6 rounded-2xl font-black uppercase tracking-widest transition-all border-2',
                  answers[currentQuestion.id] === value
                    ? cn(color, 'border-white text-white shadow-lg scale-105')
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                )}
                aria-pressed={answers[currentQuestion.id] === value}
              >
                {value}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8">
            <button
              type="button"
              onClick={goToPrevious}
              disabled={currentStep === 0}
              className={cn(
                'flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors',
                currentStep === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'
              )}
            >
              <ArrowRight size={14} className="rotate-180" /> Précédent
            </button>

            {currentStep < questions.length - 1 ? (
              <button
                type="button"
                onClick={goToNext}
                disabled={!answers[currentQuestion.id]}
                className={cn(
                  'flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                  !answers[currentQuestion.id] && 'cursor-not-allowed'
                )}
              >
                Suivant <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length < questions.length}
                className={cn(
                  'flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                  submitting && 'cursor-wait'
                )}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Calcul...
                  </>
                ) : (
                  <>
                    Voir mon résultat <CheckCircle2 size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : LANDING PAGE
// ============================================================================

export default function LandingPage() {
  // États du formulaire
  const [formState, setFormState] = useState<FormState>({
    loading: false,
    submitted: false,
    error: null,
  });

  const [formData, setFormData] = useState<LeadFormData>({
    nom: '',
    entreprise: '',
    email: '',
    telephone: '',
    source: 'landing_page',
  });

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [quizOpen, setQuizOpen] = useState(false);

  // Montage PWA & Analytics
  useEffect(() => {
    setMounted(true);

    // Enregistrement du Service Worker pour PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('⚠️ SW registration failed:', err);
        });
      });
    }

    // Track page view (analytics placeholder)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'Landing Page Qualisoft Elite',
        page_location: window.location.href,
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('load', () => {});
      }
    };
  }, []);

  // Gestion des changements de formulaire
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'telephone' ? formatPhoneNumber(value) : value,
    }));
    // Clear error on change
    if (formErrors[name as keyof LeadFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [formErrors]);

  // Validation du formulaire
  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof LeadFormData, string>> = {};
    if (!formData.nom.trim()) errors.nom = 'Le nom est requis';
    if (!formData.entreprise.trim()) errors.entreprise = 'L\'entreprise est requise';
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Email professionnel invalide';
    }
    if (!formData.telephone.trim()) {
      errors.telephone = 'Le téléphone est requis';
    } else if (formData.telephone.replace(/[^0-9]/g, '').length < 8) {
      errors.telephone = 'Numéro invalide';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Soumission du formulaire vers l'API
  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormState(prev => ({ ...prev, loading: true, error: null }));
    const toastId = toast.loading('Enregistrement de votre demande...');

    try {
      const payload: LeadFormData = {
        ...formData,
        plan: selectedPlan || undefined,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(API_ENDPOINTS.submitLead, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de l\'envoi');
      }

      const result = await response.json();

      // Succès : tracking + état
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_lead', {
          event_category: 'form',
          event_label: 'landing_trial_signup',
          value: selectedPlan || 'unknown',
        });
      }

      setFormState(prev => ({ ...prev, submitted: true, loading: false }));
      toast.success('✅ Demande enregistrée ! L\'équipe vous contactera sous 48h', { id: toastId });

      // Reset form après succès (optionnel)
      setFormData({ nom: '', entreprise: '', email: '', telephone: '', source: 'landing_page' });
    } catch (error) {
      console.error('❌ Erreur soumission lead:', error);
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }));
      toast.error(`❌ ${message}`, { id: toastId });
    }
  }, [formData, selectedPlan, validateForm]);

  // Action : Lancer le quiz de maturité
  const handleStartQuiz = useCallback(() => {
    // Tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'start_quiz', {
        event_category: 'engagement',
        event_label: 'landing_quiz_start',
      });
    }
    setQuizOpen(true);
  }, []);

  // Action : Sélectionner un plan tarifaire
  const handleSelectPlan = useCallback((planSlug: string) => {
    setSelectedPlan(planSlug);
    // Scroll fluide vers le formulaire d'essai
    const formSection = document.getElementById('essai');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus sur le premier champ après le scroll
      setTimeout(() => {
        const firstInput = formSection.querySelector('input');
        firstInput?.focus();
      }, 500);
    }
    // Tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'select_plan', {
        event_category: 'pricing',
        event_label: planSlug,
      });
    }
  }, []);

  // Action : Télécharger le guide stratégique
  const handleDownloadGuide = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // Option 1: Lien direct vers fichier statique (recommandé pour PWA)
    const link = document.createElement('a');
    link.href = API_ENDPOINTS.downloadGuide;
    link.download = 'Guide-Strategique-ISO-2026-Qualisoft.pdf';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'file_download', {
        event_category: 'resource',
        event_label: 'guide_iso_2026',
      });
    }
    toast.info('📥 Téléchargement en cours...');
  }, []);

  // Affichage pendant l'hydratation (SSR/CSR)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-400 text-xs uppercase tracking-widest">Chargement Qualisoft Elite...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 selection:text-blue-200 font-sans italic overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* --- NAVBAR ELITE --- */}
      <nav
        className="fixed top-0 w-full z-50 bg-[#0B0F1A]/90 backdrop-blur-2xl border-b border-white/5 px-6 md:px-12 py-5 flex items-center justify-between shadow-2xl"
        role="navigation"
        aria-label="Navigation principale"
      >
        <Link href="/" className="flex items-center gap-5 group" aria-label="Accueil Qualisoft Elite">
          <div className="h-12 w-auto flex items-center justify-center">
            <img
              src="/images/qslogo.png"
              alt="Qualisoft Elite - Logo"
              className="h-full w-auto object-contain filter brightness-110 group-hover:scale-105 transition-transform duration-500"
              width={48}
              height={48}
              loading="eager"
            />
          </div>
          <div className="hidden md:block">
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none m-0">
              Qualisoft <span className="text-blue-500">ELITE</span>
            </h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1 m-0">
              RD 2030 Architecture
            </p>
          </div>
        </Link>
        <Link
          href="/auth/login"
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]"
          aria-label="Accéder à l'espace Matrix"
        >
          Accès Matrix
        </Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-12 px-6 overflow-hidden text-center" aria-labelledby="hero-title">
        <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-[#0B0F1A]/80 to-[#0B0F1A]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Badge Lancement */}
          <div className="relative inline-flex items-center justify-center mb-12 group">
            <div
              className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-40 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]"
              aria-hidden="true"
            />
            <div className="relative flex items-center gap-4 px-8 py-4 rounded-full bg-slate-900 border border-blue-500/50 text-white shadow-[0_0_40px_rgba(37,99,235,0.3)]">
              <div className="p-2 bg-blue-600/20 rounded-full" aria-hidden="true">
                <Rocket size={20} className="text-blue-400 animate-bounce" />
              </div>
              <span className="text-[13px] md:text-xs font-black uppercase tracking-[0.4em] text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-white to-blue-400 animate-[pulse_2.5s_ease-in-out_infinite]">
                Lancement Officiel : 5 Avril 2026
              </span>
            </div>
          </div>

          {/* Titre Principal */}
          <h1 id="hero-title" className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-10 italic drop-shadow-2xl">
            Pilotez notre <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-indigo-400 to-blue-600">
              Conformité.
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-2xl font-bold italic mb-16 leading-relaxed">
            L&apos;excellence ISO 9001, 14001 et 45001 digitalisée. <br className="hidden md:block" />
            Rejoignez l&apos;élite souveraine du pilotage d&apos;entreprise.
          </p>

          {/* DUAL ACTION : FORMULAIRE + QUIZ */}
          <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch max-w-5xl mx-auto mb-20">
            {/* FORMULAIRE D'ESSAI */}
            <section
              id="essai"
              className="flex-1 bg-white/5 border border-white/10 p-8 md:p-10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden"
              aria-labelledby="trial-form-title"
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,1)]"
                aria-hidden="true"
              />
              {!formState.submitted ? (
                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                  <div className="text-left mb-6">
                    <h3 id="trial-form-title" className="text-xl font-black uppercase tracking-tight text-white mb-2">
                      Essai Prioritaire (14 J)
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 italic">
                      Qualisoft Corporate
                    </p>
                  </div>

                  {/* Champs du formulaire */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nom" className="sr-only">
                        Nom Complet
                      </label>
                      <input
                        id="nom"
                        name="nom"
                        type="text"
                        required
                        placeholder="Nom Complet *"
                        value={formData.nom}
                        onChange={handleInputChange}
                        aria-required="true"
                        aria-invalid={!!formErrors.nom}
                        aria-describedby={formErrors.nom ? 'nom-error' : undefined}
                        className={`w-full bg-[#0B0F1A]/80 border-2 rounded-2xl py-4 px-5 text-xs text-white font-bold outline-none transition-all placeholder:text-slate-700 ${
                          formErrors.nom
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-white/10 focus:border-blue-500'
                        }`}
                      />
                      {formErrors.nom && (
                        <p id="nom-error" className="text-red-400 text-[9px] mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> {formErrors.nom}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="entreprise" className="sr-only">
                        Entreprise
                      </label>
                      <input
                        id="entreprise"
                        name="entreprise"
                        type="text"
                        required
                        placeholder="Entreprise *"
                        value={formData.entreprise}
                        onChange={handleInputChange}
                        aria-required="true"
                        aria-invalid={!!formErrors.entreprise}
                        aria-describedby={formErrors.entreprise ? 'entreprise-error' : undefined}
                        className={`w-full bg-[#0B0F1A]/80 border-2 rounded-2xl py-4 px-5 text-xs text-white font-bold outline-none transition-all placeholder:text-slate-700 ${
                          formErrors.entreprise
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-white/10 focus:border-blue-500'
                        }`}
                      />
                      {formErrors.entreprise && (
                        <p id="entreprise-error" className="text-red-400 text-[9px] mt-1 flex items-center gap-1">
                          <AlertCircle size={10} /> {formErrors.entreprise}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email Professionnel
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Email Professionnel (ex: nom@entreprise.sn) *"
                      value={formData.email}
                      onChange={handleInputChange}
                      aria-required="true"
                      aria-invalid={!!formErrors.email}
                      aria-describedby={formErrors.email ? 'email-error' : undefined}
                      className={`w-full bg-[#0B0F1A]/80 border-2 rounded-2xl py-4 px-5 text-xs text-white font-bold outline-none transition-all placeholder:text-slate-700 ${
                        formErrors.email
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/10 focus:border-blue-500'
                      }`}
                    />
                    {formErrors.email && (
                      <p id="email-error" className="text-red-400 text-[9px] mt-1 flex items-center gap-1">
                        <AlertCircle size={10} /> {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="telephone" className="sr-only">
                      Téléphone
                    </label>
                    <input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      required
                      placeholder="Téléphone / WhatsApp *"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      aria-required="true"
                      aria-invalid={!!formErrors.telephone}
                      aria-describedby={formErrors.telephone ? 'telephone-error' : undefined}
                      className={`w-full bg-[#0B0F1A]/80 border-2 rounded-2xl py-4 px-5 text-xs text-white font-bold outline-none transition-all placeholder:text-slate-700 ${
                        formErrors.telephone
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-white/10 focus:border-blue-500'
                      }`}
                    />
                    {formErrors.telephone && (
                      <p id="telephone-error" className="text-red-400 text-[9px] mt-1 flex items-center gap-1">
                        <AlertCircle size={10} /> {formErrors.telephone}
                      </p>
                    )}
                  </div>

                  {/* Message d'erreur global */}
                  {formState.error && (
                    <div
                      className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2"
                      role="alert"
                    >
                      <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-red-300 text-[10px]">{formState.error}</p>
                    </div>
                  )}

                  {/* Bouton de soumission */}
                  <button
                    type="submit"
                    disabled={formState.loading}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/40 active:scale-95 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]"
                    aria-busy={formState.loading}
                  >
                    {formState.loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> TRAITEMENT...
                      </>
                    ) : (
                      <>
                        DÉMARRER MON ESSAI <Sparkles size={18} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div
                  className="py-16 space-y-6 animate-in zoom-in duration-500 text-center flex flex-col items-center justify-center h-full"
                  role="status"
                  aria-live="polite"
                >
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} className="text-emerald-500" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">
                      Accès Réservé !
                    </h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase italic tracking-widest leading-relaxed">
                      Le Kernel a enregistré votre demande.
                      <br />
                      L&apos;équipe Qualisoft vous contactera sous 48h.
                    </p>
                  </div>
                  <Link
                    href="/auth/login"
                    className="text-blue-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors mt-4 inline-flex items-center gap-2"
                  >
                    Accéder à mon espace <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </section>

            {/* QUIZ DE MATURITÉ */}
            <button
              type="button"
              onClick={handleStartQuiz}
              className="flex-1 bg-linear-to-br from-indigo-900/40 to-blue-900/20 border border-blue-500/20 p-8 md:p-10 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-blue-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] cursor-pointer"
              aria-label="Lancer le quiz de maturité - Diagnostic gratuit de vos processus"
            >
              <div
                className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity"
                aria-hidden="true"
              >
                <BrainCircuit size={200} />
              </div>
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
                <BrainCircuit size={40} className="text-blue-400" aria-hidden="true" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4 relative z-10">
                Quiz de Maturité
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 italic mb-8 relative z-10 max-w-sm leading-relaxed">
                Évaluez la performance de votre Système de Management. Obtenez un diagnostic flash gratuit de vos
                processus et risques.
              </p>
              <span className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-50 transition-all flex items-center gap-3 relative z-10 shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                LANCER LE DIAGNOSTIC <ArrowRight size={16} />
              </span>
            </button>
          </div>

          {/* LIEN GUIDE STRATÉGIQUE */}
          <div className="mb-24">
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-2">
              Besoin de plus d&apos;informations ?
            </p>
            <a
              href={API_ENDPOINTS.downloadGuide}
              onClick={handleDownloadGuide}
              className="flex items-center justify-center gap-3 text-[10px] font-black text-blue-400 hover:text-white transition-colors uppercase tracking-widest group no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] rounded"
              download
            >
              <FileDown size={13} className="group-hover:translate-y-1 transition-transform" aria-hidden="true" />
              Télécharger le Guide Stratégique ISO 2026
            </a>
          </div>

          {/* --- VISUELS : 3 IMAGES DYNAMIQUES --- */}
          <div className="max-w-7xl mx-auto mb-32 px-4 perspective-1000">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
              {/* Effet de fond animé */}
              <div
                className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full animate-[spin_20s_linear_infinite]"
                aria-hidden="true"
              />

              {/* Image 1: Cockpit */}
              <figure className="group relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/50 shadow-2xl transition-all duration-700 hover:scale-[1.05] hover:-rotate-2 hover:z-10 animate-[float_6s_ease-in-out_infinite]">
                <figcaption className="p-6 text-left absolute z-10 top-0 left-0 w-full bg-linear-to-b from-black/80 to-transparent pt-6 pb-12">
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Elite V2</span>
                  <h4 className="text-lg font-black italic uppercase leading-tight mt-1 text-white">
                    Central Opérationnel
                  </h4>
                </figcaption>
                <img
                  src="/images/QS_cockpit.jpg"
                  alt="Interface du cockpit opérationnel Qualisoft Elite - Tableaux de bord financiers et QHSE"
                  className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-110"
                  width={400}
                  height={256}
                  loading="lazy"
                />
              </figure>

              {/* Image 2: Revue de Direction */}
              <figure className="group relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/50 shadow-2xl transition-all duration-700 hover:scale-[1.05] hover:rotate-2 hover:z-10 animate-[float_6s_ease-in-out_infinite_1s]">
                <figcaption className="p-6 text-left absolute z-10 top-0 left-0 w-full bg-linear-to-b from-black/80 to-transparent pt-6 pb-12">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                    Intelligence Stratégique
                  </span>
                  <h4 className="text-lg font-black italic uppercase leading-tight mt-1 text-white">
                    Revue de Direction
                  </h4>
                </figcaption>
                <img
                  src="/images/QS_Revuedirection.jpg"
                  alt="Module de revue de direction - Analytics et indicateurs de performance"
                  className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-110"
                  width={400}
                  height={256}
                  loading="lazy"
                />
              </figure>

              {/* Image 3: Architecture SMI */}
              <figure className="group relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/50 shadow-2xl transition-all duration-700 hover:scale-[1.05] hover:-rotate-1 hover:z-10 animate-[float_6s_ease-in-out_infinite_2s]">
                <figcaption className="p-6 text-left absolute z-10 top-0 left-0 w-full bg-linear-to-b from-black/80 to-transparent pt-6 pb-12">
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-500">
                    Pyramide Structurelle
                  </span>
                  <h4 className="text-lg font-black italic uppercase leading-tight mt-1 text-white">
                    Architecture SMI
                  </h4>
                </figcaption>
                <img
                  src="/images/qsorg01.gif"
                  alt="Architecture du Système de Management Intégré - Schéma organique"
                  className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-110"
                  width={400}
                  height={256}
                  loading="lazy"
                />
              </figure>
            </div>
          </div>

          {/* PLANS ET TARIFS */}
          <section
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left relative z-10"
            aria-labelledby="pricing-title"
          >
            <h2 id="pricing-title" className="sr-only">
              Plans et Tarifs Qualisoft Elite
            </h2>
            {PLANS.map(plan => (
              <article
                key={plan.slug}
                className={`relative p-8 rounded-[3rem] border-2 transition-all duration-500 hover:-translate-y-2 flex flex-col focus-within:ring-2 focus-within:ring-blue-400 ${
                  plan.premium
                    ? 'border-blue-500 bg-blue-900/10 shadow-2xl shadow-blue-900/30'
                    : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                {plan.premium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-[8px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/30 whitespace-nowrap text-white">
                    Recommandé
                  </div>
                )}
                <h3 className="text-lg font-black uppercase italic mb-2 tracking-tighter text-white">{plan.name}</h3>
                <p className="text-slate-500 text-[9px] mb-6 uppercase font-bold italic h-10 leading-relaxed">
                  {plan.desc}
                </p>
                <div className="mb-8 pb-8 border-b border-white/10">
                  <div className="text-2xl font-black italic text-white leading-none tracking-tighter">{plan.price}</div>
                  {plan.period && (
                    <div className="text-[10px] text-blue-400 uppercase font-black tracking-widest mt-2">
                      {plan.period}
                    </div>
                  )}
                </div>
                <ul
                  className="space-y-4 mb-10 flex-1"
                  aria-label={`Fonctionnalités du plan ${plan.name}`}
                >
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3 text-[10px] font-bold uppercase text-slate-300 italic leading-snug">
                      <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan.slug)}
                  className={`block w-full py-4 rounded-2xl text-center text-[9px] font-black uppercase tracking-[0.2em] transition-all no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] ${
                    plan.premium
                      ? 'bg-blue-600 text-white shadow-xl hover:bg-blue-500'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-label={`Sélectionner le plan ${plan.name}`}
                >
                  Sélectionner
                </button>
              </article>
            ))}
          </section>
        </div>
      </section>

      {/* --- MODULES ÉLITE --- */}
      <section
        className="py-32 px-6 border-t border-white/5 bg-black/40 relative"
        aria-labelledby="features-title"
      >
        <h2 id="features-title" className="sr-only">
          Modules Qualisoft Elite
        </h2>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 text-center">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex flex-col items-center space-y-5 group">
                  <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-500 shadow-xl">
                    <Icon
                      size={30}
                      className="text-blue-500 group-hover:text-white transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white m-0">
                      {feature.label}
                    </h4>
                    <p className="text-[9px] text-slate-500 font-black uppercase mt-2 italic tracking-widest m-0">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- FOOTER SOUVERAIN --- */}
      <footer
        className="pt-24 pb-12 px-6 border-t border-white/10 bg-[#0B0F1A] relative overflow-hidden"
        role="contentinfo"
      >
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-blue-600/10 blur-[100px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-left relative z-10 mb-20">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img
                src="/images/qslogo.png"
                alt="Qualisoft Elite"
                className="h-10 w-auto opacity-100 filter brightness-110"
                width={40}
                height={40}
              />
              <h4 className="text-2xl font-black uppercase tracking-tighter text-white leading-none m-0">
                Qualisoft <br />
                <span className="text-blue-600">ELITE</span>
              </h4>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-8 italic leading-relaxed">
              Le standard de la digitalisation QHSE : économies & conformité.
            </p>
            <div className="flex gap-4" role="navigation" aria-label="Réseaux sociaux">
              <a
                href="https://linkedin.com/company/qualisoft"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Qualisoft sur LinkedIn"
              >
                <Linkedin size={20} aria-hidden="true" />
              </a>
              <a
                href="https://twitter.com/qualisoft_sn"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Qualisoft sur X/Twitter"
              >
                <Twitter size={20} aria-hidden="true" />
              </a>
              <a
                href="https://facebook.com/qualisoft.elite"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Qualisoft sur Facebook"
              >
                <Facebook size={20} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 border-b border-white/5 pb-4 m-0">
              Siège Social
            </h4>
            <address className="not-italic flex items-start gap-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest leading-loose">
              <MapPin size={20} className="text-blue-500 shrink-0 mt-1" aria-hidden="true" />
              <span>
                Villa 247, Route du Lac Rose, <br />
                Cité Cheikh Hann <br />
                <span className="text-white font-black">Dakar, Sénégal</span>
              </span>
            </address>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 border-b border-white/5 pb-4 m-0">
              Contactez-nous
            </h4>
            <div className="flex items-start gap-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest leading-loose">
              <Phone size={20} className="text-blue-500 shrink-0 mt-1" aria-hidden="true" />
              <p className="italic m-0">
                <a href="tel:+221774410902" className="hover:text-blue-400 transition-colors no-underline">
                  +221 77 441 09 02
                </a>{' '}
                <br />
                <a href="tel:+221776310091" className="hover:text-blue-400 transition-colors no-underline">
                  +221 77 631 00 91
                </a>
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest pt-2">
              <Mail size={20} className="text-blue-500 shrink-0" aria-hidden="true" />
              <a
                href="mailto:ab.thiongane@qualisoft.sn"
                className="hover:text-blue-400 transition-colors italic border-b border-blue-500/30 pb-1 text-white no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
              >
                ab.thiongane@qualisoft.sn
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/5 text-center relative z-10">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] italic m-0">
            © 2026 QUALISOFT CORPORATE • TOUS DROITS RÉSERVÉS
          </p>
        </div>
      </footer>

      {/* --- QUIZ MODAL --- */}
      <QuizModal isOpen={quizOpen} onClose={() => setQuizOpen(false)} />

      {/* 🧪 ANIMATIONS CSS CUSTOM */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        .animate-\\[float_6s_ease-in-out_infinite\\] { animation: float 6s ease-in-out infinite; }
        .animate-\\[float_6s_ease-in-out_infinite_1s\\] { animation: float 6s ease-in-out infinite 1s; }
        .animate-\\[float_6s_ease-in-out_infinite_2s\\] { animation: float 6s ease-in-out infinite 2s; }
        /* Support PWA : zone tactile améliorée */
        @media (hover: none) {
          button:hover, a:hover { transform: none !important; }
        }
      `,
        }}
      />
    </div>
  );
}

// ============================================================================
// UTILS : CN (si pas déjà dans ton projet)
// ============================================================================

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}