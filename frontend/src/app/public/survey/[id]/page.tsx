/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📡 MODULE : src/app/public/survey/[id]/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Interface Feedback pour acteurs externes (Clients/Partenaires).
 * RÔLE : Mesure de la satisfaction & preuves audit SMI (§9.1.2).
 * SÉCURITÉ : Accès par ID anonymisé. Scellage immuable des données.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 17:11 GMT
 */

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Activity, Check, CheckCircle2, Loader2, MessageSquare, 
  Send, ShieldCheck, User, X 
} from "lucide-react";
import { toast, Toaster } from "sonner";

interface Question {
  id: number;
  text: string;
  type: "SCALE" | "TEXT" | "BOOLEAN";
  required?: boolean;
}

interface SurveyData {
  SC_Title: string;
  SC_Target: string;
  SC_Questions: Question[];
}

export default function PublicSurveyPage() {
  const params = useParams();
  const id = params?.id as string;

  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [respondentName, setRespondentName] = useState("");
  const [globalComment, setGlobalComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 📡 SYNCHRONISATION MASTER SURVEY
   */
  const fetchSurvey = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/public/surveys/${id}`);
      if (!res.ok) throw new Error("Référentiel inaccessible ou clos.");
      const data = await res.json();
      setSurvey(data);
    } catch (err) {
      toast.error("ÉCHEC LIAISON : L'enquête n'est plus disponible.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchSurvey(); }, [fetchSurvey]);

  const handleValueChange = (qId: number, value: any) => {
    setResponses((prev) => ({ ...prev, [qId]: value }));
  };

  /**
   * 🚀 SCELLAGE DES RÉPONSES (§9.1.2)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (Object.keys(responses).length < (survey?.SC_Questions.length || 0)) {
      return toast.warning("ÉVALUATION INCOMPLÈTE : Veuillez répondre à toutes les questions.");
    }

    setIsSubmitting(true);
    const formattedResponses = Object.entries(responses).map(([key, value]) => ({
      questionId: Number(key),
      value: value,
    }));

    try {
      const res = await fetch(`/api/public/surveys/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respondent: respondentName.toUpperCase(),
          responses: formattedResponses,
          comment: globalComment,
        }),
      });

      if (!res.ok) throw new Error("Erreur de scellage.");
      toast.success("FEEDBACK SCELLÉ AVEC SUCCÈS.");
      setSubmitted(true);
    } catch (err) {
      toast.error("ERREUR RÉSEAU : Impossible de valider votre retour.");
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-white gap-6 italic">
      <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
      <p className="text-[10px] font-black uppercase italic tracking-[0.5em] animate-pulse">Synchronisation Performance SMI...</p>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-white p-10 text-center italic animate-in zoom-in duration-700">
      <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mb-10 border border-emerald-500/20 shadow-4xl shadow-emerald-500/5">
        <CheckCircle2 size={48} className="text-emerald-500" />
      </div>
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-none m-0">Évaluation <span className="text-emerald-500">Scellée</span></h1>
      <p className="text-slate-500 font-bold uppercase text-[11px] max-w-sm tracking-[0.2em] leading-relaxed m-0">Votre contribution a été enregistrée dans le registre Qualité. Merci pour votre évaluation stratégique.</p>
      <footer className="mt-20 opacity-20 text-[8px] font-black uppercase tracking-[0.5em]">Qualisoft Elite SDE • ISO 9001:2015</footer>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 p-6">
      <Toaster position="top-center" richColors theme="dark" />
      <ShieldCheck className="fixed top-10 right-10 opacity-5 pointer-events-none w-32 h-32" />

      <div className="max-w-3xl mx-auto py-16 lg:py-24">
        <header className="mb-20 text-center">
          <div className="flex justify-center mb-8">
            <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest italic flex items-center gap-3">
              <Activity size={14} /> {survey?.SC_Target} FEEDBACK PROTOCOL
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none m-0">{survey?.SC_Title}</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-5">Mesure de la Satisfaction Client (§9.1.2)</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12 lg:space-y-16">
          <section className="bg-slate-900/40 border border-white/5 p-8 lg:p-12 rounded-[3rem] shadow-xl backdrop-blur-3xl text-left">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4 italic block mb-6">Identification (Société / Nom)</label>
            <div className="relative">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
              <input required value={respondentName} onChange={e => setRespondentName(e.target.value)} placeholder="EX: CLIENT ALPHA / DIRECTION" className="w-full bg-black/40 border border-white/5 p-6 pl-16 rounded-2xl text-white font-black italic outline-none uppercase focus:border-blue-500 transition-all shadow-inner placeholder:opacity-10" />
            </div>
          </section>

          <div className="space-y-10">
            {survey?.SC_Questions.map((q, idx) => (
              <article key={q.id} className="bg-slate-900/40 border border-white/5 p-10 lg:p-14 rounded-[3.5rem] shadow-2xl group transition-all duration-500 text-left">
                <div className="flex items-start gap-8 mb-10">
                  <span className="text-5xl font-black italic text-slate-800 leading-none group-hover:text-blue-900 transition-colors select-none">{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                  <h3 className="text-2xl lg:text-3xl font-black uppercase italic m-0 tracking-tighter leading-tight">{q.text}</h3>
                </div>

                {q.type === "SCALE" && (
                  <div className="flex flex-wrap justify-between gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button key={score} type="button" onClick={() => handleValueChange(q.id, score)} className={`flex-1 h-14 rounded-xl lg:rounded-2xl font-black italic text-sm transition-all border cursor-pointer ${responses[q.id] === score ? "bg-blue-600 border-blue-400 text-white scale-110 shadow-2xl shadow-blue-600/20" : "bg-black/30 border-white/5 text-slate-600 hover:text-white"}`}>{score}</button>
                    ))}
                  </div>
                )}

                {q.type === "TEXT" && (
                  <textarea onChange={e => handleValueChange(q.id, e.target.value)} value={responses[q.id] || ""} className="w-full bg-black/40 border border-white/5 rounded-4xl p-6 text-white font-bold h-40 italic outline-none focus:border-blue-500 transition-all shadow-inner" placeholder="Votre analyse ici..." />
                )}

                {q.type === "BOOLEAN" && (
                  <div className="flex gap-6">
                    <button type="button" onClick={() => handleValueChange(q.id, true)} className={`flex-1 p-6 rounded-2xl font-black italic uppercase transition-all border cursor-pointer flex justify-center gap-3 ${responses[q.id] === true ? "bg-emerald-600 border-emerald-400 text-white" : "bg-black/30 border-white/5 text-slate-600"}`}><Check size={18} /> Oui</button>
                    <button type="button" onClick={() => handleValueChange(q.id, false)} className={`flex-1 p-6 rounded-2xl font-black italic uppercase transition-all border cursor-pointer flex justify-center gap-3 ${responses[q.id] === false ? "bg-red-600 border-red-400 text-white" : "bg-black/30 border-white/5 text-slate-600"}`}><X size={18} /> Non</button>
                  </div>
                )}
              </article>
            ))}
          </div>

          <section className="bg-slate-900/40 border border-white/5 p-10 lg:p-14 rounded-[3rem] shadow-2xl text-left">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4 italic block mb-6"><MessageSquare size={16} className="inline mr-2 text-emerald-500" /> Remarque Finale / Suggestions</label>
            <textarea value={globalComment} onChange={e => setGlobalComment(e.target.value)} placeholder="Précisions pour la Revue de Direction..." className="w-full bg-black/40 border border-white/5 rounded-4xl p-6 text-white font-bold h-40 italic outline-none focus:border-emerald-500 transition-all shadow-inner" />
          </section>

          <button type="submit" disabled={isSubmitting} className="w-full py-8 lg:py-10 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] lg:rounded-[3.5rem] font-black uppercase text-xs lg:text-sm tracking-[0.6em] shadow-4xl transition-all border-none flex items-center justify-center gap-6 active:scale-95 disabled:opacity-50 italic cursor-pointer">
            {isSubmitting ? <><Loader2 className="animate-spin" size={24} /> Scellage Master...</> : <><Send size={24} strokeWidth={3} /> Envoyer Évaluation Master</>}
          </button>
        </form>
      </div>
    </div>
  );
}