/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : PUBLIC STRATEGIC FEEDBACK (ELITE-SDE)
 * RÔLE : Collecte de preuves de satisfaction (§9.1.2) pour tiers externes
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback, useEffect, useState, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { useParams } from "next/navigation";
import { 
  Activity, Check, CheckCircle2, Loader2, MessageSquare, 
  Send, ShieldCheck, User, X, Star, Zap, AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export type QuestionType = 'SCALE' | 'TEXT' | 'BOOLEAN';

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  required?: boolean;
  order?: number;
}

export interface SurveyData {
  SC_Id?: string;
  SC_Title: string;
  SC_Target: string;
  SC_Questions: Question[];
  SC_Status?: string;
  SC_CreatedAt?: string;
}

export interface SurveyResponse {
  questionId: number;
  value: string | number | boolean;
}

export interface SubmitPayload {
  respondent: string;
  responses: SurveyResponse[];
  comment: string;
}

export interface FormErrors {
  respondentName?: string;
  questions?: Record<number, string>;
}

export interface LoadingMatrixProps {
  label: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING MATRIX
// ============================================================================

function LoadingMatrix({ label }: LoadingMatrixProps) {
  return (
    <div 
      className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-white gap-4 md:gap-6"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="animate-spin text-blue-400 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" strokeWidth={1} aria-hidden="true" />
      <p className="text-[9px] md:text-[10px] font-black uppercase italic tracking-widest animate-pulse m-0 px-4 text-center">
        {label}
      </p>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SCALE QUESTION
// ============================================================================

interface ScaleQuestionProps {
  question: Question;
  value: number | undefined;
  onChange: (value: number) => void;
  error?: string;
}

function ScaleQuestion({ question, value, onChange, error }: ScaleQuestionProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, score: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(score);
    }
  };

  return (
    <div role="radiogroup" aria-label={question.text} className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
        <button
          key={score}
          type="button"
          onClick={() => onChange(score)}
          onKeyDown={(e) => handleKeyDown(e, score)}
          className={cn(
            "h-10 md:h-12 lg:h-14 lg:h-16 rounded-lg md:rounded-xl lg:rounded-2xl font-black italic text-[10px] md:text-sm transition-all border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
            value === score 
              ? "bg-blue-600 border-blue-400 text-white scale-105 shadow-xl shadow-blue-600/40" 
              : "bg-black/30 border-white/5 text-slate-600 hover:text-white hover:border-blue-600/30"
          )}
          aria-pressed={value === score}
          aria-label={`Note: ${score} sur 10`}
        >
          {score}
        </button>
      ))}
      {error && (
        <p className="col-span-full text-red-400 text-[8px] md:text-[9px] flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : TEXT QUESTION
// ============================================================================

interface TextQuestionProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function TextQuestion({ question, value, onChange, error }: TextQuestionProps) {
  return (
    <div>
      <textarea
        required={question.required}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        value={value}
        className={cn(
          "w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-8 text-[10px] md:text-sm text-white font-bold h-32 md:h-36 lg:h-44 italic outline-none focus:border-blue-500 transition-all shadow-inner placeholder:text-slate-700",
          error && "border-red-500/50"
        )}
        placeholder="Saisissez votre analyse détaillée ici..."
        aria-required={question.required}
        aria-invalid={!!error}
        aria-label={question.text}
      />
      {error && (
        <p className="text-red-400 text-[8px] md:text-[9px] mt-2 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : BOOLEAN QUESTION
// ============================================================================

interface BooleanQuestionProps {
  question: Question;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  error?: string;
}

function BooleanQuestion({ question, value, onChange, error }: BooleanQuestionProps) {
  return (
    <div role="radiogroup" aria-label={question.text}>
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex-1 p-4 md:p-6 lg:p-8 lg:p-10 rounded-xl md:rounded-2xl lg:rounded-3xl font-black italic uppercase transition-all border cursor-pointer flex justify-center items-center gap-2 md:gap-3 lg:gap-4 focus:outline-none focus:ring-2 focus:ring-emerald-400",
            value === true 
              ? "bg-emerald-600 border-emerald-400 text-white scale-[1.02]" 
              : "bg-black/30 border-white/5 text-slate-600 hover:text-white hover:border-emerald-600/30"
          )}
          aria-pressed={value === true}
          aria-label="Oui"
        >
          <Check size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" strokeWidth={4} aria-hidden="true" /> 
          <span className="hidden sm:inline">Oui</span>
          <span className="sm:hidden">O</span>
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex-1 p-4 md:p-6 lg:p-8 lg:p-10 rounded-xl md:rounded-2xl lg:rounded-3xl font-black italic uppercase transition-all border cursor-pointer flex justify-center items-center gap-2 md:gap-3 lg:gap-4 focus:outline-none focus:ring-2 focus:ring-red-400",
            value === false 
              ? "bg-red-600 border-red-400 text-white scale-[1.02]" 
              : "bg-black/30 border-white/5 text-slate-600 hover:text-white hover:border-red-600/30"
          )}
          aria-pressed={value === false}
          aria-label="Non"
        >
          <X size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" strokeWidth={4} aria-hidden="true" /> 
          <span className="hidden sm:inline">Non</span>
          <span className="sm:hidden">N</span>
        </button>
      </div>
      {error && (
        <p className="text-red-400 text-[8px] md:text-[9px] mt-2 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function PublicSurveyElite() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<number, string | number | boolean>>({});
  const [respondentName, setRespondentName] = useState("");
  const [globalComment, setGlobalComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const fetchSurvey = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get<SurveyData>(`/public/surveys/${id}`);
      setSurvey(res.data?.data || res.data || null);
    } catch (error) {
      console.error('❌ Erreur chargement survey:', error);
      toast.error("LIEN EXPIRÉ : Ce protocole d'enquête est clos ou introuvable.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { if (typeof window !== 'undefined') fetchSurvey(); }, [fetchSurvey]);

  const handleValueChange = useCallback((qId: number, value: string | number | boolean) => {
    setResponses((prev) => ({ ...prev, [qId]: value }));
    if (formErrors.questions?.[qId]) {
      setFormErrors(prev => ({
        ...prev,
        questions: { ...prev.questions, [qId]: undefined }
      }));
    }
  }, [formErrors.questions]);

  const validateForm = (): boolean => {
    const errors: FormErrors = { questions: {} };
    
    if (!respondentName.trim()) {
      errors.respondentName = "L'identification est obligatoire";
    }
    
    survey?.SC_Questions.forEach(q => {
      if (q.required && responses[q.id] === undefined) {
        errors.questions![q.id] = "Cette question est obligatoire";
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors.questions || {}).length === 0 && !errors.respondentName;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    
    if (!validateForm()) {
      toast.warning("ÉVALUATION INCOMPLÈTE : Veuillez renseigner tous les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Scellage de votre évaluation dans le Kernel Qualisoft...");

    try {
      const payload: SubmitPayload = {
        respondent: respondentName.toUpperCase(),
        responses: Object.entries(responses).map(([key, value]) => ({
          questionId: Number(key),
          value: value,
        })),
        comment: globalComment,
      };

      await apiClient.post(`/public/surveys/${id}/respond`, payload);

      toast.success("FEEDBACK SCELLÉ (§9.1.2).", { id: toastId });
      setSubmitted(true);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ERREUR DE TRANSMISSION : Liaison Kernel interrompue.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingMatrix label="Initialisation du Protocole §9.1.2..." />;
  }

  if (submitted) {
    return (
      <div 
        className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-white p-4 md:p-6 lg:p-10 text-center italic animate-in zoom-in duration-700"
        role="main"
        aria-label="Confirmation de soumission"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-emerald-500/10 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] flex items-center justify-center mb-6 md:mb-8 lg:mb-10 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
          <CheckCircle2 size={32} className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-emerald-400" aria-hidden="true" />
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black uppercase tracking-tighter mb-4 md:mb-6 leading-none m-0">
          Feedback <span className="text-emerald-400">Scellé</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase text-[9px] md:text-[10px] lg:text-[11px] max-w-sm tracking-widest leading-relaxed m-0 px-4">
          Votre évaluation a été indexée avec succès dans le registre de performance Qualisoft Elite.
        </p>
        <button 
          type="button"
          onClick={handleClose} 
          className="mt-8 md:mt-10 lg:mt-12 text-[9px] md:text-[10px] font-black uppercase text-blue-400 border-b border-blue-400 pb-1 cursor-pointer bg-transparent border-t-0 border-x-0 outline-none focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
          aria-label="Fermer la session"
        >
          Fermer la session
        </button>
        <footer className="mt-12 md:mt-16 lg:mt-20 opacity-20 text-[7px] md:text-[8px] font-black uppercase tracking-widest">
          Qualisoft Elite SDE • Protocol Secured
        </footer>
      </div>
    );
  }

  if (!survey) {
    return (
      <div 
        className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-white gap-4 md:gap-6 p-4"
        role="status"
      >
        <AlertCircle className="text-red-400 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" aria-hidden="true" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center px-4">
          Enquête introuvable ou expirée
        </p>
        <button 
          type="button"
          onClick={() => typeof window !== 'undefined' && window.close()}
          className="mt-4 text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
        >
          Fermer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30">
      <Toaster position="top-center" richColors theme="dark" closeButton />
      
      {/* 🔝 HEADER */}
      <header className="sticky top-0 z-50 bg-[#0B0F1A]/80 backdrop-blur-md border-b border-white/5 p-4 md:p-6 lg:p-8 lg:p-10 flex justify-between items-center" role="banner">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Zap size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" fill="white" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h2 className="text-base md:text-lg lg:text-xl font-black uppercase tracking-tighter m-0 leading-none">
              Qualisoft <span className="text-blue-400">Elite</span>
            </h2>
            <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5 md:mt-1 m-0">
              Sovereign Performance Hub
            </p>
          </div>
        </div>
        <span className="bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/5 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 italic hidden sm:block">
          Ref : {id.slice(0, 8).toUpperCase()}
        </span>
      </header>

      <div className="max-w-3xl mx-auto py-8 md:py-12 lg:py-16 px-4 md:px-6">
        <div className="mb-12 md:mb-16 lg:mb-20 text-center space-y-4 md:space-y-6">
          <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2 md:gap-3 w-fit mx-auto" role="status">
            <Activity size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
            {survey?.SC_Target || 'EXTERNAL'} SATISFACTION PROTOCOL
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-none m-0">
            {survey?.SC_Title}
          </h1>
          <p className="text-slate-600 font-bold text-[8px] md:text-[9px] lg:text-[10px] uppercase tracking-widest mt-3 md:mt-4 lg:mt-5 italic">
            Collecte de preuves SMI / ISO 9001:2015
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10 lg:space-y-12 lg:space-y-16 lg:space-y-20" role="form" aria-label="Formulaire d'évaluation">
          {/* IDENTIFICATION */}
          <section 
            className="bg-white/5 border border-white/5 p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 lg:p-14 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] shadow-2xl text-left relative overflow-hidden group"
            aria-labelledby="identification-title"
          >
            <h2 id="identification-title" className="sr-only">Identification</h2>
            <label htmlFor="respondent-name" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 md:ml-4 italic block mb-4 md:mb-6">
              Identification (Entité / Contact) <span className="text-red-400">*</span>
            </label>
            <div className="relative z-10">
              <User className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
              <input
                id="respondent-name"
                required
                value={respondentName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setRespondentName(e.target.value);
                  if (formErrors.respondentName) {
                    setFormErrors(prev => ({ ...prev, respondentName: undefined }));
                  }
                }}
                placeholder="EX: DIRECTION GÉNÉRALE - CLIENT ALPHA"
                className={cn(
                  "w-full bg-black/40 border border-white/10 p-4 md:p-5 lg:p-6 pl-10 md:pl-12 lg:pl-16 rounded-xl md:rounded-2xl lg:rounded-3xl text-white font-black italic outline-none uppercase focus:border-blue-500 transition-all shadow-inner placeholder:text-slate-700",
                  formErrors.respondentName && "border-red-500/50"
                )}
                aria-required="true"
                aria-invalid={!!formErrors.respondentName}
              />
            </div>
            {formErrors.respondentName && (
              <p className="text-red-400 text-[8px] md:text-[9px] mt-2 ml-2 md:ml-4 flex items-center gap-1" role="alert">
                <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.respondentName}
              </p>
            )}
            <div className="absolute -bottom-6 md:-bottom-8 lg:-bottom-10 -right-6 md:-right-8 lg:-right-10 w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-blue-600/5 blur-3xl rounded-full" aria-hidden="true" />
          </section>

          {/* QUESTIONS */}
          <div className="space-y-6 md:space-y-8 lg:space-y-10 lg:space-y-12 lg:space-y-14 lg:space-y-16 lg:space-y-20" role="group" aria-label="Questions d'évaluation">
            {survey?.SC_Questions.map((q, idx) => (
              <article 
                key={q.id} 
                className="bg-[#0F172A] border border-white/5 p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 lg:p-14 lg:p-16 rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl group transition-all duration-500 text-left relative overflow-hidden"
                aria-labelledby={`question-${q.id}`}
              >
                <div className="flex items-start gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 lg:mb-10 lg:mb-12">
                  <span className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl lg:text-7xl font-black italic text-white/5 leading-none select-none group-hover:text-blue-600/20 transition-colors" aria-hidden="true">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <h3 id={`question-${q.id}`} className="text-lg md:text-xl lg:text-2xl xl:text-3xl lg:text-4xl font-black uppercase italic m-0 tracking-tighter leading-tight group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform">
                    {q.text}
                    {q.required && <span className="text-red-400 ml-1">*</span>}
                  </h3>
                </div>

                {q.type === "SCALE" && (
                  <ScaleQuestion 
                    question={q} 
                    value={responses[q.id] as number | undefined} 
                    onChange={(value) => handleValueChange(q.id, value)}
                    error={formErrors.questions?.[q.id]}
                  />
                )}

                {q.type === "TEXT" && (
                  <TextQuestion 
                    question={q} 
                    value={responses[q.id] as string || ""} 
                    onChange={(value) => handleValueChange(q.id, value)}
                    error={formErrors.questions?.[q.id]}
                  />
                )}

                {q.type === "BOOLEAN" && (
                  <BooleanQuestion 
                    question={q} 
                    value={responses[q.id] as boolean | undefined} 
                    onChange={(value) => handleValueChange(q.id, value)}
                    error={formErrors.questions?.[q.id]}
                  />
                )}
              </article>
            ))}
          </div>

          {/* COMMENTAIRE FINAL */}
          <section 
            className="bg-white/5 border border-white/5 p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 lg:p-14 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] shadow-2xl text-left"
            aria-labelledby="comment-title"
          >
            <h2 id="comment-title" className="sr-only">Commentaire final</h2>
            <label htmlFor="global-comment" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 md:ml-4 italic block mb-4 md:mb-6 lg:mb-8">
              <MessageSquare size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 inline mr-1 md:mr-2 text-blue-400" aria-hidden="true" /> 
              Remarque Finale / Suggestions d'amélioration
            </label>
            <textarea
              id="global-comment"
              value={globalComment}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setGlobalComment(e.target.value)}
              placeholder="Vos recommandations stratégiques pour notre prochaine Revue de Direction..."
              className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-6 lg:p-8 text-[10px] md:text-sm text-white font-bold h-32 md:h-36 lg:h-40 lg:h-48 italic outline-none focus:border-blue-500 transition-all shadow-inner placeholder:text-slate-700"
              aria-label="Commentaire final"
            />
          </section>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full py-6 md:py-8 lg:py-10 xl:py-12 lg:py-14 bg-blue-600 hover:bg-white hover:text-blue-700 text-white rounded-xl md:rounded-2xl lg:rounded-[3.5rem] xl:rounded-[4rem] font-black uppercase text-[9px] md:text-[10px] lg:text-xs tracking-widest shadow-2xl transition-all border-none flex items-center justify-center gap-3 md:gap-4 lg:gap-5 lg:gap-6 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed italic cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-400",
              isSubmitting && "cursor-wait"
            )}
            aria-busy={isSubmitting}
            aria-label="Envoyer l'évaluation"
          >
            {isSubmitting ? (
              <><Loader2 size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">SCELLAGE EN COURS...</span><span className="sm:hidden">Envoi...</span></>
            ) : (
              <><Send size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform" aria-hidden="true" /> <span className="hidden sm:inline">ENVOYER ÉVALUATION</span><span className="sm:hidden">Envoyer</span></>
            )}
          </button>
        </form>

        <footer className="mt-12 md:mt-16 lg:mt-20 xl:mt-24 pt-6 md:pt-8 lg:pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6 opacity-30 italic" role="contentinfo">
          <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest m-0 text-center sm:text-left">
            Protocol Secured §9.1.2 • Qualisoft Elite Kernel v3.0
          </p>
          <div className="flex items-center gap-3 md:gap-4">
            <ShieldCheck size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" />
            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest m-0 leading-none italic">
              Souveraineté Numérique
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}