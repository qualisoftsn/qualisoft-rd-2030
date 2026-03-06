/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
'use client';

/**
 * 🛰️ MODULE : PUBLIC STRATEGIC FEEDBACK (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Collecte de preuves de satisfaction (§9.1.2) pour tiers externes.
 * DESIGN : Mobile-First, Matrix Industrial, High-Contrast.
 * SÉCURITÉ : Accès par ID Anonymisé (Kernel Public Route).
 * RÉVISION : 06 Mars 2026 | 21:15 GMT
 * -------------------------------------------------------------------------
 */

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Activity, Check, CheckCircle2, Loader2, MessageSquare, 
  Send, ShieldCheck, User, X, Star, Zap
} from "lucide-react";
import { toast, Toaster } from "sonner";
import apiClient from "@/core/api/api-client"; // Utilisation du client configuré

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

export default function PublicSurveyElite() {
  const params = useParams();
  const id = params?.id as string;

  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [respondentName, setRespondentName] = useState("");
  const [globalComment, setGlobalComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📡 RÉCUPÉRATION DU RÉFÉRENTIEL SANS AUTH
  const fetchSurvey = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/public/surveys/${id}`);
      setSurvey(res.data);
    } catch (err) {
      toast.error("LIEN EXSPIRÉ : Ce protocole d'enquête est clos ou introuvable.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchSurvey(); }, [fetchSurvey]);

  const handleValueChange = (qId: number, value: any) => {
    setResponses((prev) => ({ ...prev, [qId]: value }));
  };

  // 🚀 SCELLAGE ÉLECTRONIQUE DES RÉPONSES
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    const requiredCount = survey?.SC_Questions.length || 0;
    if (Object.keys(responses).length < requiredCount) {
      return toast.warning("ÉVALUATION INCOMPLÈTE : Veuillez renseigner tous les champs obligatoires.");
    }

    setIsSubmitting(true);
    const tid = toast.loading("Scellage de votre évaluation dans le Kernel Qualisoft...");

    try {
      await apiClient.post(`/public/surveys/${id}/respond`, {
        respondent: respondentName.toUpperCase(),
        responses: Object.entries(responses).map(([key, value]) => ({
          questionId: Number(key),
          value: value,
        })),
        comment: globalComment,
      });

      toast.success("FEEDBACK SCELLÉ (§9.1.2).", { id: tid });
      setSubmitted(true);
    } catch (err) {
      toast.error("ERREUR DE TRANSMISSION : Liaison Kernel interrompue.", { id: tid });
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingMatrix label="Initialisation du Protocole §9.1.2..." />;

  if (submitted) return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-white p-10 text-center italic animate-in zoom-in duration-700">
      <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mb-10 border border-emerald-500/20 shadow-4xl shadow-emerald-500/10">
        <CheckCircle2 size={48} className="text-emerald-500" />
      </div>
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-none m-0">Feedback <span className="text-emerald-500">Scellé</span></h1>
      <p className="text-slate-500 font-bold uppercase text-[11px] max-w-sm tracking-[0.2em] leading-relaxed m-0">Votre évaluation a été indexée avec succès dans le registre de performance Qualisoft Elite.</p>
      <button onClick={() => window.close()} className="mt-12 text-[10px] font-black uppercase text-blue-500 border-b border-blue-500 pb-1 cursor-pointer bg-transparent border-t-0 border-x-0 outline-none">Fermer la session</button>
      <footer className="mt-20 opacity-20 text-[8px] font-black uppercase tracking-[0.5em]">Qualisoft Elite SDE • Protocol Secured</footer>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30">
      <Toaster position="top-center" richColors theme="dark" />
      
      {/* 🔝 HEADER FIXE (Zéro Scroll Feel) */}
      <header className="sticky top-0 z-50 bg-[#0B0F1A]/80 backdrop-blur-xl border-b border-white/5 p-6 md:p-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-black uppercase tracking-tighter m-0 leading-none">Qualisoft <span className="text-blue-600">Elite</span></h2>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 m-0">Sovereign Performance Hub</p>
          </div>
        </div>
        <span className="bg-white/5 px-4 py-2 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 italic hidden sm:block">
          Ref : {id.slice(0, 8).toUpperCase()}
        </span>
      </header>

      <div className="max-w-3xl mx-auto py-16 px-6">
        <div className="mb-20 text-center space-y-6">
          <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest italic flex items-center gap-3 w-fit mx-auto">
            <Activity size={14} /> {survey?.SC_Target || 'EXTERNAL'} SATISFACTION PROTOCOL
          </span>
          <h1 className="text-5xl lg:text-8xl font-black uppercase italic tracking-tighter leading-none m-0">{survey?.SC_Title}</h1>
          <p className="text-slate-600 font-bold text-[10px] uppercase tracking-[0.5em] mt-5 italic">Collecte de preuves SMI / ISO 9001:2015</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 lg:space-y-20">
          {/* IDENTIFICATION CARTE */}
          <section className="bg-white/5 border border-white/5 p-8 lg:p-14 rounded-[3.5rem] shadow-2xl text-left relative overflow-hidden group">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4 italic block mb-6">Identification (Entité / Contact)</label>
            <div className="relative z-10">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
              <input 
                required 
                value={respondentName} 
                onChange={e => setRespondentName(e.target.value)} 
                placeholder="EX: DIRECTION GÉNÉRALE - CLIENT ALPHA" 
                className="w-full bg-black/40 border border-white/10 p-6 pl-16 rounded-3xl text-white font-black italic outline-none uppercase focus:border-blue-500 transition-all shadow-inner placeholder:text-slate-800" 
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
          </section>

          {/* QUESTIONS DYNAMIQUES */}
          <div className="space-y-10 lg:space-y-14">
            {survey?.SC_Questions.map((q, idx) => (
              <article key={q.id} className="bg-[#151B2B] border border-white/5 p-10 lg:p-16 rounded-[4rem] shadow-2xl group transition-all duration-500 text-left relative overflow-hidden">
                <div className="flex items-start gap-8 mb-12">
                  <span className="text-5xl lg:text-7xl font-black italic text-white/5 leading-none select-none group-hover:text-blue-600/20 transition-colors">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <h3 className="text-2xl lg:text-4xl font-black uppercase italic m-0 tracking-tighter leading-tight group-hover:translate-x-2 transition-transform">{q.text}</h3>
                </div>

                {/* LOGIQUE D'AFFICHAGE SELON TYPE */}
                {q.type === "SCALE" && (
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button 
                        key={score} 
                        type="button" 
                        onClick={() => handleValueChange(q.id, score)} 
                        className={`h-14 lg:h-16 rounded-xl lg:rounded-2xl font-black italic text-sm transition-all border cursor-pointer ${responses[q.id] === score ? "bg-blue-600 border-blue-400 text-white scale-110 shadow-2xl shadow-blue-600/40" : "bg-black/30 border-white/5 text-slate-600 hover:text-white hover:border-blue-600/30"}`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === "TEXT" && (
                  <textarea 
                    required={q.required}
                    onChange={e => handleValueChange(q.id, e.target.value)} 
                    value={responses[q.id] || ""} 
                    className="w-full bg-black/40 border border-white/10 rounded-3xl p-8 text-white font-bold h-44 italic outline-none focus:border-blue-500 transition-all shadow-inner placeholder:text-slate-800" 
                    placeholder="Saisissez votre analyse détaillée ici..." 
                  />
                )}

                {q.type === "BOOLEAN" && (
                  <div className="flex gap-6">
                    <button type="button" onClick={() => handleValueChange(q.id, true)} className={`flex-1 p-6 lg:p-10 rounded-3xl font-black italic uppercase transition-all border cursor-pointer flex justify-center items-center gap-4 ${responses[q.id] === true ? "bg-emerald-600 border-emerald-400 text-white scale-[1.02]" : "bg-black/30 border-white/5 text-slate-600"}`}>
                      <Check size={24} strokeWidth={4} /> Oui
                    </button>
                    <button type="button" onClick={() => handleValueChange(q.id, false)} className={`flex-1 p-6 lg:p-10 rounded-3xl font-black italic uppercase transition-all border cursor-pointer flex justify-center items-center gap-4 ${responses[q.id] === false ? "bg-rose-600 border-rose-400 text-white scale-[1.02]" : "bg-black/30 border-white/5 text-slate-600"}`}>
                      <X size={24} strokeWidth={4} /> Non
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* COMMENTAIRE FINAL */}
          <section className="bg-white/5 border border-white/5 p-10 lg:p-14 rounded-[3.5rem] shadow-2xl text-left">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4 italic block mb-8">
              <MessageSquare size={16} className="inline mr-2 text-blue-500" /> Remarque Finale / Suggestions d'amélioration
            </label>
            <textarea 
              value={globalComment} 
              onChange={e => setGlobalComment(e.target.value)} 
              placeholder="Vos recommandations stratégiques pour notre prochaine Revue de Direction..." 
              className="w-full bg-black/40 border border-white/10 rounded-4xl p-8 text-white font-bold h-48 italic outline-none focus:border-blue-500 transition-all shadow-inner placeholder:text-slate-800" 
            />
          </section>

          {/* BOUTON D'ENVOI MAÎTRE */}
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-10 lg:py-14 bg-blue-600 hover:bg-white hover:text-blue-900 text-white rounded-[3.5rem] lg:rounded-[4rem] font-black uppercase text-xs lg:text-sm tracking-[0.6em] shadow-4xl transition-all border-none flex items-center justify-center gap-6 active:scale-95 disabled:opacity-50 italic cursor-pointer group"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin" size={28} /> SCELLAGE EN COURS...</>
            ) : (
              <><Send size={28} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" /> ENVOYER ÉVALUATION MASTER</>
            )}
          </button>
        </form>

        <footer className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 italic">
          <p className="text-[9px] font-black uppercase tracking-widest m-0">Protocol Secured §9.1.2 • Qualisoft Elite Kernal v3.0</p>
          <div className="flex items-center gap-4">
            <ShieldCheck size={14} />
            <p className="text-[9px] font-black uppercase tracking-widest m-0 leading-none italic">Souveraineté Numérique</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ✅ COMPOSANT DE CHARGEMENT ÉLITE
function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-white gap-6 italic">
      <Loader2 className="animate-spin text-blue-500" size={50} strokeWidth={1} />
      <p className="text-[10px] font-black uppercase italic tracking-[0.8em] animate-pulse m-0 pl-[0.8em]">
        {label}
      </p>
    </div>
  );
}