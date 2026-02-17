/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Send, CheckCircle2, Star, MessageSquare, User } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

interface Question { id: number; text: string; type: 'SCALE' | 'TEXT' | 'BOOLEAN'; }
interface SurveyData { SC_Title: string; SC_Target: string; SC_Questions: Question[]; }

export default function PublicSurveyPage() {
  // 🛡️ SÉCURISATION ID
  const params = useParams();
  const id = params?.id as string;

  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [respondentName, setRespondentName] = useState("");
  const [globalComment, setGlobalComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchSurvey = async () => {
      try {
        const res = await fetch(`/api/public/surveys/${id}`);
        if (!res.ok) throw new Error("Enquête inaccessible");
        const data = await res.json();
        setSurvey(data);
      } catch (err) { toast.error("Impossible de charger l'enquête."); }
      finally { setLoading(false); }
    };
    fetchSurvey();
  }, [id]);

  const handleValueChange = (qId: number, value: any) => {
    setResponses(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    const formattedResponses = Object.entries(responses).map(([key, value]) => ({ questionId: Number(key), value: value }));

    try {
      const res = await fetch(`/api/public/surveys/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respondent: respondentName, responses: formattedResponses, comment: globalComment })
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setSubmitted(true);
    } catch (err) { toast.error("Erreur d'envoi."); setIsSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center text-white"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;

  if (submitted) return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-white p-6 text-center italic">
      <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20"><CheckCircle2 size={48} className="text-emerald-500" /></div>
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Merci de votre retour</h1>
      <p className="text-slate-500 font-bold uppercase text-xs max-w-md">Contribution scellée dans le registre Qualité ISO 9001.</p>
    </div>
  );

  if (!survey) return <div className="text-white p-10">Enquête introuvable.</div>;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic">
      <Toaster position="top-center" />
      <div className="max-w-3xl mx-auto py-20 px-6">
        <div className="mb-12 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase mb-6">{survey.SC_Target} FEEDBACK</span>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-4">{survey.SC_Title}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 text-left">
          <div className="bg-white/5 border border-white/5 p-8 rounded-4xl">
             <label className="flex items-center gap-3 text-sm font-black uppercase text-slate-400 mb-4 italic tracking-widest"><User size={16} /> Identité (Société / Nom)</label>
             <input required value={respondentName} onChange={e => setRespondentName(e.target.value)} placeholder="EX: ENTREPRISE ABC..." className="w-full bg-black/20 border border-white/10 p-5 rounded-2xl text-white font-bold outline-none uppercase italic" />
          </div>

          <div className="space-y-6">
            {(survey.SC_Questions as any).map((q: Question, idx: number) => (
              <div key={q.id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[2.5rem] shadow-xl">
                 <div className="flex items-start gap-6 mb-6">
                    <span className="text-4xl font-black italic text-slate-800">0{idx + 1}</span>
                    <h3 className="text-xl font-bold uppercase mt-1 italic">{q.text}</h3>
                 </div>
                 {q.type === 'SCALE' && (
                    <div className="flex justify-between items-center gap-2 mt-8 px-4">
                       {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <button key={score} type="button" onClick={() => handleValueChange(q.id, score)} className={`w-10 h-14 rounded-xl font-black italic text-sm border ${responses[q.id] === score ? 'bg-blue-600 border-blue-500 text-white scale-110 shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white'}`}>{score}</button>
                       ))}
                    </div>
                 )}
                 {q.type === 'TEXT' && ( <textarea onChange={(e) => handleValueChange(q.id, e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white h-32 italic" placeholder="Votre réponse détaillée..." /> )}
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/5 p-8 rounded-4xl">
             <label className="flex items-center gap-3 text-sm font-black uppercase text-slate-400 mb-4 italic"><MessageSquare size={16} /> Remarque Globale</label>
             <textarea value={globalComment} onChange={e => setGlobalComment(e.target.value)} placeholder="Un dernier mot ?" className="w-full bg-black/20 border border-white/10 p-5 rounded-2xl text-white font-bold h-32 italic" />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-blue-600 text-white rounded-4xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl transition-all border-none flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 italic">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={20} />} Envoyer l&apos;Évaluation
          </button>
        </form>
      </div>
    </div>
  );
}