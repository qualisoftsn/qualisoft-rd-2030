/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🧠 MODULE : QUIZ DE MATURITÉ SMI (ISO 9001)
 * -------------------------------------------------------------------------
 * RÔLE : Diagnostic flash de la maturité du Système de Management
 * VERSION : 1.0 - 15 questions, réponses OUI/UN PEU/NON, rapport PDF
 * DESIGN : Elite Matrix, Progressif, PWA Ready
 * RÉVISION : 19 Mars 2026
 * -------------------------------------------------------------------------
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BrainCircuit, ArrowLeft, ArrowRight, CheckCircle2, 
  Download, Loader2, RefreshCcw, Share2, FileText
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Types
type QuizAnswer = 'OUI' | 'UN PEU' | 'NON';

interface QuizQuestion {
  id: string;
  clause: string;
  question: string;
}

interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  level: 'NIVEAU_1' | 'NIVEAU_2' | 'NIVEAU_3' | 'NIVEAU_4' | 'NIVEAU_5';
  recommendations: string[];
  details: Array<{
    clause: string;
    question: string;
    answer: QuizAnswer;
    weight: number;
  }>;
}

const ANSWER_OPTIONS: Array<{ value: QuizAnswer; label: string; color: string }> = [
  { value: 'OUI', label: 'OUI', color: 'bg-emerald-500 hover:bg-emerald-600' },
  { value: 'UN PEU', label: 'UN PEU', color: 'bg-amber-500 hover:bg-amber-600' },
  { value: 'NON', label: 'NON', color: 'bg-rose-500 hover:bg-rose-600' },
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

export default function MaturityQuizPage() {
  const router = useRouter();
  
  // États
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Chargement des questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/quiz/questions');
        if (!response.ok) throw new Error('Échec chargement questions');
        const data = await response.json();
        setQuestions(data.questions);
      } catch (error) {
        console.error('❌ Erreur chargement quiz:', error);
        toast.error('Impossible de charger le quiz. Réessayez.');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [router]);

  // Gestion des réponses
  const handleAnswer = useCallback((questionId: string, answer: QuizAnswer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Auto-advance après 300ms pour fluidité (optionnel)
    // setTimeout(() => {
    //   if (currentStep < (questions.length - 1)) {
    //     setCurrentStep(prev => prev + 1);
    //   }
    // }, 300);
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
    // Vérifier que toutes les questions ont une réponse
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error(`Veuillez répondre à toutes les questions (${unanswered.length} restantes)`);
      return;
    }
    
    setSubmitting(true);
    const toastId = toast.loading('Calcul de votre maturité SMI...');
    
    try {
      const response = await fetch('/api/quiz/calculate', {
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
      setShowReport(true);
      
      toast.success('Diagnostic terminé !', { id: toastId });
      
      // Tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'quiz_completed', {
          event_category: 'conversion',
          event_label: 'maturity_quiz',
          value: data.result.percentage,
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur soumission quiz:', error);
      const message = error instanceof Error ? error.message : 'Erreur de calcul';
      toast.error(message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }, [answers, questions]);

  // Génération du rapport PDF
  const generatePDF = useCallback(() => {
    if (!result) return;
    
    const doc = new jsPDF();
    
    // En-tête
    doc.setFillColor(11, 15, 26); // #0B0F1A
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Qualisoft Elite - Rapport de Maturité SMI', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-SN')}`, 105, 30, { align: 'center' });
    
    // Score principal
    doc.setTextColor(59, 130, 246); // blue-500
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text(`${result.percentage}%`, 105, 60, { align: 'center' });
    
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Score de maturité global', 105, 70, { align: 'center' });
    
    // Niveau
    const levelConfig = LEVEL_CONFIG[result.level];
    doc.setTextColor(levelConfig.color.replace('text-', '').replace('-400', '')); // Simplifié
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(levelConfig.label, 105, 90, { align: 'center' });
    
    // Recommandations
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommandations prioritaires', 14, 110);
    
    result.recommendations.forEach((rec, i) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`• ${rec}`, 14, 120 + (i * 8));
    });
    
    // Détails par clause (tableau)
    const tableData = result.details.map(d => [
      d.clause,
      d.question.substring(0, 50) + (d.question.length > 50 ? '...' : ''),
      d.answer,
      `${d.weight} pts`,
    ]);
    
    (doc as any).autoTable({
      startY: 120 + (result.recommendations.length * 8) + 10,
      head: [['Clause', 'Question', 'Réponse', 'Poids']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3 },
    });
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Rapport généré par Qualisoft Elite • ISO 9001:2015 • Confidential', 105, finalY, { align: 'center' });
    
    // Téléchargement
    doc.save(`rapport-maturite-smi-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Rapport PDF téléchargé');
    
  }, [result]);

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 italic animate-pulse">
          Préparation du diagnostic...
        </p>
      </div>
    );
  }

  // Écran de résultat
  if (showReport && result) {
    const levelConfig = LEVEL_CONFIG[result.level];
    
    return (
      <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans">
        <Toaster position="top-right" richColors theme="dark" />
        
        {/* Header */}
        <header className="p-6 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => { setShowReport(false); setResult(null); setAnswers({}); setCurrentStep(0); }}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-2"
            >
              <ArrowLeft size={14} /> Nouveau diagnostic
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={generatePDF}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <Download size={14} /> Rapport PDF
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Retour à l&apos;accueil
              </button>
            </div>
          </div>
        </header>
        
        {/* Contenu */}
        <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
          {/* Score principal */}
          <section className="text-center py-12">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-linear-to-br from-blue-600/20 to-indigo-600/20 border-4 border-blue-500/30 mb-6">
              <span className="text-5xl font-black italic">{result.percentage}%</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">
              Votre maturité SMI
            </h1>
            <p className={cn("text-lg font-black uppercase tracking-widest", levelConfig.color)}>
              {levelConfig.label}
            </p>
            <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em] mt-4 italic max-w-lg mx-auto">
              {levelConfig.description}
            </p>
          </section>
          
          {/* Recommandations */}
          <section className="bg-[#0F172A] border border-white/5 rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-3">
              <BrainCircuit className="text-blue-500" size={24} />
              Recommandations Prioritaires
            </h2>
            <ul className="space-y-4">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-1" />
                  <p className="text-[11px] text-slate-300 leading-relaxed">{rec}</p>
                </li>
              ))}
            </ul>
          </section>
          
          {/* Détails par clause */}
          <section className="bg-[#0F172A] border border-white/5 rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-3">
              <FileText className="text-blue-500" size={24} />
              Détail par Clause ISO 9001
            </h2>
            <div className="space-y-3">
              {result.details.map((detail, i) => {
                const answerColor = detail.answer === 'OUI' ? 'text-emerald-400' : 
                                   detail.answer === 'UN PEU' ? 'text-amber-400' : 'text-rose-400';
                return (
                  <div key={i} className="flex items-start gap-4 p-4 bg-black/20 rounded-xl">
                    <div className="w-16 shrink-0">
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                        {detail.clause}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-300 mb-2 line-clamp-2">{detail.question}</p>
                      <div className="flex items-center gap-3">
                        <span className={cn("text-[9px] font-black uppercase tracking-wider", answerColor)}>
                          {detail.answer}
                        </span>
                        <span className="text-[8px] text-slate-500">
                          Poids: {detail.weight}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          
          {/* CTA final */}
          <section className="text-center py-8 border-t border-white/5">
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-6 italic">
              Prêt à passer au niveau supérieur ?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push('/auth/login')}
                className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/30 flex items-center gap-3"
              >
                Démarrer mon essai gratuit <ArrowRight size={16} />
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Lien copié !'); }}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
              >
                <Share2 size={14} /> Partager ce rapport
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Écran du quiz
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* Header */}
      <header className="p-6 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-2"
          >
            <ArrowLeft size={14} /> Retour
          </button>
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
              Diagnostic SMI
            </p>
            <p className="text-[10px] font-black text-white">
              Question {currentStep + 1} / {questions.length}
            </p>
          </div>
          <div className="w-20" /> {/* Spacer pour équilibrer */}
        </div>
        
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mt-4">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>
      
      {/* Question */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-8">
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
            {ANSWER_OPTIONS.map(({ value, label, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleAnswer(currentQuestion.id, value)}
                className={cn(
                  "py-4 px-6 rounded-2xl font-black uppercase tracking-widest transition-all border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
                  answers[currentQuestion.id] === value
                    ? cn(color, "border-white text-white shadow-lg scale-105")
                    : "bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-white"
                )}
                aria-pressed={answers[currentQuestion.id] === value}
              >
                {label}
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
                "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-4 py-2",
                currentStep === 0 
                  ? "text-slate-600 cursor-not-allowed" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              <ArrowLeft size={14} /> Précédent
            </button>
            
            {currentStep < questions.length - 1 ? (
              <button
                type="button"
                onClick={goToNext}
                disabled={!answers[currentQuestion.id]}
                className={cn(
                  "flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-400",
                  !answers[currentQuestion.id] && "cursor-not-allowed"
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
                  "flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400",
                  submitting && "cursor-wait"
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
        </div>
      </main>
      
      {/* Footer info */}
      <footer className="p-4 text-center border-t border-white/5">
        <p className="text-[8px] text-slate-600 uppercase tracking-[0.3em] italic">
          Diagnostic basé sur ISO 9001:2015 • 15 questions • ~5 minutes
        </p>
      </footer>
    </div>
  );
}