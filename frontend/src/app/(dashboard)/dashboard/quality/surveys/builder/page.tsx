/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛠️ MODULE : SURVEY BUILDER (ISO 9001 §9.1.2)
 * RÔLE : Édition de la structure des enquêtes de performance
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useState, useCallback, ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { 
  ChevronLeft, Globe, Layout, Plus, Save, Send, 
  Settings, Trash2, Loader2, Target, Info, AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type QuestionType = 'SCALE' | 'TEXT' | 'BOOLEAN';
export type TargetType = 'CLIENT' | 'SUPPLIER' | 'EMPLOYEE';

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  required?: boolean;
  order?: number;
}

export interface SurveyFormData {
  CMP_Title: string;
  CMP_Target: TargetType;
  CMP_Questions: Question[];
}

export interface QuestionCardProps {
  question: Question;
  index: number;
  onUpdate: (id: number, updates: Partial<Question>) => void;
  onDelete: (id: number) => void;
}

// ============================================================================
// SOUS-COMPOSANT : QUESTION CARD
// ============================================================================

function QuestionCard({ question, index, onUpdate, onDelete }: QuestionCardProps) {
  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    onUpdate(question.id, { text: e.target.value });
  };

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onUpdate(question.id, { type: e.target.value as QuestionType });
  };

  return (
    <article 
      className="bg-slate-900/40 border-2 border-white/5 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3rem] flex flex-col xl:flex-row xl:items-center gap-4 md:gap-6 lg:gap-8 md:gap-10 group hover:border-emerald-500/30 transition-all shadow-2xl text-left animate-in slide-in-from-left-10 focus-within:border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      role="listitem"
      aria-label={`Question ${index + 1}`}
    >
      <span className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 italic group-hover:text-emerald-400 transition-colors leading-none m-0" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <label htmlFor={`question-${question.id}`} className="sr-only">
        Texte de la question {index + 1}
      </label>
      <input 
        id={`question-${question.id}`}
        value={question.text} 
        onChange={handleTextChange} 
        placeholder="Dimension d'évaluation..." 
        className="bg-transparent border-b-2 border-white/5 focus:border-emerald-500 outline-none flex-1 font-black text-base md:text-lg lg:text-xl italic text-white placeholder:text-slate-800 transition-all m-0 py-2"
        aria-required="true"
      />
      <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
        <label htmlFor={`type-${question.id}`} className="sr-only">
          Type de question
        </label>
        <select 
          id={`type-${question.id}`}
          value={question.type} 
          onChange={handleTypeChange} 
          className="bg-[#151A2D] border border-white/10 rounded-xl md:rounded-2xl px-3 md:px-4 lg:px-6 py-2 md:py-3 text-[9px] md:text-[10px] font-black text-slate-300 outline-none cursor-pointer italic focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="SCALE" className="bg-[#0B0F1A]">ÉCHELLE (1-10)</option>
          <option value="TEXT" className="bg-[#0B0F1A]">TEXTE LIBRE</option>
          <option value="BOOLEAN" className="bg-[#0B0F1A]">OUI / NON</option>
        </select>
        <button 
          type="button"
          onClick={() => onDelete(question.id)} 
          className="p-2 md:p-3 lg:p-4 bg-rose-600/10 text-rose-400 rounded-lg md:rounded-xl lg:rounded-2xl border border-rose-600/20 hover:bg-rose-600 hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
          aria-label={`Supprimer la question ${index + 1}`}
          title="Supprimer"
        >
          <Trash2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SurveyBuilderMaster() {
  const router = useRouter();
  const [surveyTitle, setSurveyTitle] = useState("ENQUÊTE DE PERFORMANCE 2026");
  const [targetConfig, setTargetConfig] = useState<TargetType>("CLIENT");
  const [questions, setQuestions] = useState<Question[]>([
    { id: Date.now(), text: "Niveau de satisfaction globale ?", type: "SCALE" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const addQuestion = useCallback(() => {
    setQuestions(prev => [...prev, { id: Date.now(), text: "", type: "SCALE" }]);
  }, []);

  const updateQuestion = useCallback((id: number, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  }, []);

  const deleteQuestion = useCallback((id: number) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    } else {
      toast.warning("Au moins une question est requise");
    }
  }, [questions.length]);

  const validateForm = (): boolean => {
    if (!surveyTitle.trim()) {
      setFormError('Le titre de la campagne est requis');
      return false;
    }
    if (questions.some(q => !q.text.trim())) {
      setFormError('Toutes les questions doivent avoir un texte');
      return false;
    }
    if (questions.length === 0) {
      setFormError('Au moins une question est requise');
      return false;
    }
    setFormError('');
    return true;
  };

  const saveSurvey = async () => {
    if (!validateForm()) {
      toast.warning(formError);
      return;
    }
    
    setSubmitting(true);
    const toastId = toast.loading("SCELLAGE DE L'ARCHITECTURE...");
    try {
      const payload: SurveyFormData = { 
        CMP_Title: surveyTitle.toUpperCase(), 
        CMP_Target: targetConfig, 
        CMP_Questions: questions.map((q, idx) => ({ ...q, order: idx + 1, required: true }))
      };
      await apiClient.post('/surveys/campaigns', payload);
      toast.success("ARCHITECTURE SCELLÉE DANS LE KERNEL", { id: toastId });
      router.push("/dashboard/quality/surveys");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ÉCHEC DE SCELLAGE SDE", { id: toastId });
    } finally { 
      setSubmitting(false); 
    }
  };

  const targetOptions: Array<{ value: TargetType; label: string }> = [
    { value: 'CLIENT', label: 'Cible : CLIENTS' },
    { value: 'SUPPLIER', label: 'Cible : FOURNISSEURS' },
    { value: 'EMPLOYEE', label: 'Cible : RH / SOCIAL' },
  ];

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-emerald-500/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="flex gap-3 md:gap-4 lg:gap-6 items-center w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="p-2 md:p-3 lg:p-4 bg-white/5 rounded-lg md:rounded-xl lg:rounded-2xl text-slate-500 hover:text-white border border-white/5 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Retour"
          >
            <ChevronLeft size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
          </button>
          <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl tracking-tighter italic m-0">
            Survey <span className="text-emerald-400">Builder</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-center sm:justify-end">
          <button 
            type="button"
            className="flex-1 sm:flex-none bg-slate-900 px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] tracking-widest text-slate-400 cursor-pointer flex items-center gap-2 md:gap-3 border-none hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Paramètres avancés"
          >
            <Settings size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
            <span className="hidden sm:inline">Avancé</span>
          </button>
          <button 
            type="button"
            disabled={submitting} 
            onClick={saveSurvey} 
            className={cn(
              "flex-1 sm:flex-none bg-blue-600 px-4 md:px-6 lg:px-8 lg:px-10 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] tracking-widest text-white shadow-2xl cursor-pointer hover:scale-105 transition-all border-none italic flex items-center gap-2 md:gap-3 justify-center focus:outline-none focus:ring-2 focus:ring-blue-400",
              submitting && "opacity-30 cursor-not-allowed hover:scale-100"
            )}
            aria-busy={submitting}
            aria-label="Enregistrer l'enquête"
          >
            {submitting ? (
              <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">Scellage...</span></>
            ) : (
              <><Save size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" /> <span className="hidden sm:inline">Sceller l&apos;Architecture</span></>
            )}
          </button>
        </div>
      </header>

      {/* 🧩 WORKSPACE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-10 flex flex-col xl:flex-row gap-4 md:gap-6 lg:gap-8 md:gap-10">
        <div className="flex-1 space-y-6 md:space-y-8 lg:space-y-10 pb-24 md:pb-28 lg:pb-32">
          {/* Main Config */}
          <section className="bg-[#151A2D] p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl lg:rounded-[4rem] border-2 border-white/5 relative overflow-hidden group shadow-2xl text-left">
            <Layout className="absolute -right-6 md:-right-8 lg:-right-12 -top-6 md:-top-8 lg:-top-12 text-white/5 group-hover:rotate-12 transition-transform duration-700 pointer-events-none w-40 h-40 md:w-50 md:h-50 lg:w-60 lg:h-60" aria-hidden="true" />
            <div className="relative z-10 flex flex-col xl:flex-row gap-6 md:gap-8 lg:gap-10 items-end">
              <div className="flex-1 w-full space-y-2 md:space-y-3 lg:space-y-4">
                <label htmlFor="survey-title" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-4 md:ml-6 italic block">
                  Désignation de la Campagne
                </label>
                <input 
                  id="survey-title"
                  value={surveyTitle} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setSurveyTitle(e.target.value.toUpperCase());
                    setFormError('');
                  }} 
                  className={cn(
                    "w-full bg-transparent border-none text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black italic tracking-tighter outline-none placeholder:text-emerald-900 m-0 uppercase py-2",
                    formError && !surveyTitle.trim() ? "text-rose-400" : "text-emerald-400"
                  )}
                  placeholder="TITRE DE LA CAMPAGNE"
                  aria-required="true"
                  aria-invalid={!!formError && !surveyTitle.trim()}
                />
                {formError && !surveyTitle.trim() && (
                  <p className="text-rose-400 text-[8px] md:text-[9px] ml-4 md:ml-6 flex items-center gap-1" role="alert">
                    <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formError}
                  </p>
                )}
              </div>
              <div className="bg-slate-950 p-4 md:p-5 lg:p-6 rounded-2xl md:rounded-3xl border-2 border-white/5 w-full xl:w-64 lg:w-80 shadow-inner">
                <Target size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400 mb-2" aria-hidden="true" />
                <label htmlFor="target-select" className="sr-only">
                  Cible de l'enquête
                </label>
                <select 
                  id="target-select"
                  value={targetConfig} 
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setTargetConfig(e.target.value as TargetType)} 
                  className="w-full bg-transparent border-none outline-none text-[9px] md:text-[10px] font-black uppercase text-blue-400 cursor-pointer italic appearance-none m-0"
                >
                  {targetOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#0B0F1A]">{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Questions Grid */}
          <div className="space-y-4 md:space-y-5 lg:space-y-6" role="list" aria-label="Liste des questions">
            {questions.map((q, idx) => (
              <QuestionCard 
                key={q.id} 
                question={q} 
                index={idx} 
                onUpdate={updateQuestion} 
                onDelete={deleteQuestion} 
              />
            ))}
            <button 
              type="button"
              onClick={addQuestion} 
              className="w-full py-6 md:py-8 lg:py-10 border-4 border-dashed border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3rem] bg-white/2 text-slate-600 hover:border-emerald-500/30 hover:text-emerald-400 transition-all font-black text-[10px] md:text-[11px] lg:text-[12px] tracking-widest cursor-pointer italic flex items-center justify-center gap-3 md:gap-4 lg:gap-6 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Ajouter une nouvelle question"
            >
              <Plus size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> 
              Ajouter Dimension d&apos;Analyse
            </button>
          </div>
        </div>

        {/* Info Side */}
        <aside className="w-full xl:w-72 lg:w-96 space-y-4 md:space-y-6 lg:space-y-8 shrink-0 pb-6 md:pb-8 lg:pb-10">
          <article className="bg-[#151A2D] border-2 border-blue-600/20 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] relative overflow-hidden shadow-2xl text-left">
            <Globe className="absolute -right-4 md:-right-6 lg:-right-10 -top-4 md:-top-6 lg:-top-10 text-blue-500/5 w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44" aria-hidden="true" />
            <h3 className="text-[10px] md:text-[11px] font-black italic mb-4 md:mb-6 lg:mb-8 border-b border-white/5 pb-4 md:pb-5 lg:pb-6 m-0 tracking-widest flex items-center gap-2 md:gap-3 lg:gap-4">
              <Globe size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-blue-400" aria-hidden="true" /> 
              Diffusion Master
            </h3>
            <div className="bg-slate-950 p-3 md:p-4 lg:p-6 rounded-xl md:rounded-2xl border border-white/10 font-mono text-[8px] md:text-[9px] lg:text-[10px] text-blue-400 truncate shadow-inner" role="code">
              https://qualisoft.sn/survey/[AUTO_ID]
            </div>
            <button 
              type="button"
              className="w-full bg-blue-600 text-white py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] tracking-widest mt-4 md:mt-6 lg:mt-8 flex items-center justify-center gap-2 md:gap-3 lg:gap-4 hover:scale-105 transition-all cursor-pointer border-none shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Envoyer par email groupé"
            >
              <Send size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
              Sync Mail Groupé
            </button>
          </article>
          <article className="bg-amber-600/5 border-2 border-amber-600/20 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] shadow-2xl text-left">
            <h4 className="text-[10px] md:text-[11px] font-black text-amber-400 italic mb-4 md:mb-6 m-0 flex items-center gap-2 md:gap-3 lg:gap-4">
              <Info size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
              Protocole §8.4 / §9
            </h4>
            <p className="text-[9px] md:text-[10px] lg:text-[11px] text-slate-400 leading-relaxed font-black uppercase italic tracking-widest m-0">
              <span className="text-amber-400">Recommandation :</span> Ne dépassez pas 8 dimensions pour maximiser le taux de retour. Chaque insatisfaction générera un scan NC automatique.
            </p>
          </article>
        </aside>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(16,185,129,0.3);border-radius:10px}:focus-visible{outline:2px solid #10b981;outline-offset:2px}`}</style>
    </div>
  );
}