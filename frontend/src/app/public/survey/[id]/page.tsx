/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📡 MODULE : PORTAIL PUBLIC DE COLLECTE DE FEEDBACK
 * -------------------------------------------------------------------------
 * FONCTION : Interface de réponse aux enquêtes pour les acteurs externes (Clients/Partenaires).
 * RÔLE : Mesure de la satisfaction et collecte de preuves pour le SMI (§9.1.2).
 * SÉCURITÉ : Accès anonymisé par ID unique, scellage des réponses en base Master.
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { 
  Loader2, Send, CheckCircle2, Star, MessageSquare, 
  User, Activity, ShieldCheck, Check, X 
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// --- RÉFÉRENTIELS TYPES ---
interface Question { 
  id: number; 
  text: string; 
  type: 'SCALE' | 'TEXT' | 'BOOLEAN'; 
  required?: boolean;
}

interface SurveyData { 
  SC_Title: string; 
  SC_Target: string; 
  SC_Questions: Question[]; 
}

export default function PublicSurveyPage() {
  // 🛡️ RÉCUPÉRATION DE L'IDENTIFIANT D'ENQUÊTE
  const params = useParams();
  const id = params?.id as string;

  // --- ÉTATS DE GESTION DES DONNÉES ---
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  
  // --- ÉTATS DU FORMULAIRE DE RÉPONSE ---
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [respondentName, setRespondentName] = useState("");
  const [globalComment, setGlobalComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 📡 SYNCHRONISATION AVEC LE RÉFÉRENTIEL D'ENQUÊTE
   * Charge la structure de l'enquête (titre, cible, questions) depuis l'API publique.
   */
  const fetchSurvey = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/public/surveys/${id}`);
      if (!res.ok) throw new Error("Référentiel inaccessible ou expiré");
      const data = await res.json();
      setSurvey(data);
    } catch (err) {
      console.error("Erreur Matrix Survey:", err);
      toast.error("Impossible de charger l'enquête de satisfaction.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchSurvey(); }, [fetchSurvey]);

  /**
   * ✍️ GESTIONNAIRE D'ENTRÉE DES DONNÉES
   * Met à jour dynamiquement la carte des réponses selon l'ID de la question.
   */
  const handleValueChange = (qId: number, value: any) => {
    setResponses(prev => ({ ...prev, [qId]: value }));
  };

  /**
   * 🚀 SCELLAGE ET SOUMISSION DES RÉPONSES
   * Formate les données pour injection dans le registre de performance SMI.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    // Vérification de sécurité minimale
    if (Object.keys(responses).length === 0 && survey?.SC_Questions.length !== 0) {
      toast.error("Veuillez répondre aux questions avant de soumettre.");
      return;
    }

    setIsSubmitting(true);
    
    // Formatage des réponses pour le schéma Master
    const formattedResponses = Object.entries(responses).map(([key, value]) => ({ 
      questionId: Number(key), 
      value: value 
    }));

    try {
      const res = await fetch(`/api/public/surveys/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          respondent: respondentName, 
          responses: formattedResponses, 
          comment: globalComment 
        })
      });

      if (!res.ok) throw new Error("Erreur lors du scellage de la contribution");
      
      toast.success("Feedback scellé avec succès");
      setSubmitted(true);
    } catch (err) {
      toast.error("Erreur d'envoi : le serveur n'a pas pu valider votre retour.");
      setIsSubmitting(false);
    }
  };

  // --- RENDU : ÉTAT CHARGEMENT ---
  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-white gap-6">
      <Loader2 className="animate-spin text-blue-500" size={54} />
      <p className="text-[10px] font-black uppercase italic tracking-[0.5em] animate-pulse">Synchronisation de l&apos;enquête...</p>
    </div>
  );

  // --- RENDU : ÉTAT SOUMISSION TERMINÉE (§9.1.2) ---
  if (submitted) return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center text-white p-10 text-center italic animate-in fade-in duration-700">
      <div className="w-28 h-28 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mb-10 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
        <CheckCircle2 size={56} className="text-emerald-500" />
      </div>
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-none">Contribution <span className="text-emerald-500">Scellée</span></h1>
      <p className="text-slate-500 font-bold uppercase text-[11px] max-w-md tracking-widest leading-relaxed">
        Votre évaluation a été enregistrée dans le registre Qualité Qualisoft. <br/>
        Merci d&apos;aider à l&apos;amélioration continue de nos processus.
      </p>
      <footer className="mt-20 opacity-30 text-[9px] font-black uppercase tracking-[0.4em]">SMI Elite • RD 2026 • ISO 9001:2015</footer>
    </div>
  );

  // --- RENDU : ÉTAT ERREUR RÉFÉRENTIEL ---
  if (!survey) return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center text-white p-10">
      <div className="text-center p-12 border border-white/5 rounded-4xl bg-white/5">
        <Loader2 size={40} className="mx-auto mb-6 text-slate-700" />
        <p className="font-black uppercase italic tracking-widest">Enquête introuvable ou déjà clôturée.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30">
      <Toaster position="top-center" />
      
      {/* 🚀 FILIGRANE DE SÉCURITÉ */}
      <div className="fixed top-10 right-10 opacity-10 pointer-events-none">
        <ShieldCheck size={120} />
      </div>

      <div className="max-w-3xl mx-auto py-24 px-8 relative z-10">
        
        {/* 🚀 HEADER DE L'ENQUÊTE */}
        <header className="mb-20 text-center animate-in slide-in-from-top-6 duration-1000">
          <div className="flex justify-center mb-8">
            <span className="inline-block px-6 py-2 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">
              <Activity size={12} className="inline mr-2" /> {survey.SC_Target} FEEDBACK
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-6">
            {survey.SC_Title}
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.4em]">Protocole d&apos;Évaluation Stratégique</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-16 text-left">
          
          {/* 👤 IDENTIFICATION RÉPONDANT */}
          <section className="bg-white/5 border border-white/5 p-10 rounded-[3rem] shadow-2xl backdrop-blur-3xl animate-in slide-in-from-left-6 duration-700">
             <label className="flex items-center gap-4 text-xs font-black uppercase text-slate-400 mb-6 italic tracking-[0.3em]">
               <User size={18} className="text-blue-500" /> Identité (Société / Nom)
             </label>
             <input 
               required 
               value={respondentName} 
               onChange={e => setRespondentName(e.target.value)} 
               placeholder="EX: ENTREPRISE ABC / DIRECTION..." 
               className="w-full bg-black/40 border border-white/10 p-6 rounded-2xl text-white font-black outline-none uppercase italic focus:border-blue-500 transition-all shadow-inner placeholder:text-slate-800" 
             />
          </section>

          {/* 📋 LISTE DYNAMIQUE DES QUESTIONS (§9.1.2) */}
          <div className="space-y-10">
            {survey.SC_Questions.map((q: Question, idx: number) => (
              <article key={q.id} className="bg-slate-900/40 border border-white/5 p-12 rounded-[3.5rem] shadow-3xl relative overflow-hidden group hover:border-white/10 transition-all duration-500">
                  <div className="flex items-start gap-8 mb-10">
                    <span className="text-5xl font-black italic text-slate-800 leading-none select-none group-hover:text-blue-900 transition-colors">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <h3 className="text-2xl font-black uppercase mt-1 italic tracking-tight leading-tight text-white group-hover:translate-x-2 transition-transform duration-500">
                      {q.text}
                    </h3>
                  </div>

                  {/* CAS : ÉVALUATION SUR ÉCHELLE (1-10) */}
                  {q.type === 'SCALE' && (
                    <div className="flex flex-wrap justify-between items-center gap-3 mt-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <button 
                            key={score} 
                            type="button" 
                            onClick={() => handleValueChange(q.id, score)} 
                            className={`flex-1 min-w-11.25 h-16 rounded-2xl font-black italic text-sm border transition-all duration-300 cursor-pointer ${
                              responses[q.id] === score 
                              ? 'bg-blue-600 border-blue-400 text-white scale-110 shadow-[0_0_20px_rgba(37,99,235,0.4)] z-10' 
                              : 'bg-black/30 text-slate-500 border-white/5 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                    </div>
                  )}

                  {/* CAS : RÉPONSE TEXTUELLE LIBRE */}
                  {q.type === 'TEXT' && ( 
                    <textarea 
                      onChange={(e) => handleValueChange(q.id, e.target.value)} 
                      value={responses[q.id] || ""}
                      className="w-full bg-black/30 border border-white/5 rounded-3xl p-6 text-white font-bold h-40 italic focus:border-blue-500 outline-none transition-all shadow-inner placeholder:text-slate-800" 
                      placeholder="Détaillez votre avis ici pour une analyse SMI approfondie..." 
                    /> 
                  )}

                  {/* CAS : VÉRIFICATION BINAIRE (OUI/NON) */}
                  {q.type === 'BOOLEAN' && (
                    <div className="flex gap-6 mt-6">
                      <button 
                        type="button" 
                        onClick={() => handleValueChange(q.id, true)}
                        className={`flex-1 p-6 rounded-2xl flex items-center justify-center gap-3 font-black italic uppercase transition-all border cursor-pointer ${responses[q.id] === true ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-black/30 border-white/5 text-slate-500'}`}
                      >
                        <Check size={20} /> Oui
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleValueChange(q.id, false)}
                        className={`flex-1 p-6 rounded-2xl flex items-center justify-center gap-3 font-black italic uppercase transition-all border cursor-pointer ${responses[q.id] === false ? 'bg-red-600 border-red-400 text-white' : 'bg-black/30 border-white/5 text-slate-500'}`}
                      >
                        <X size={20} /> Non
                      </button>
                    </div>
                  )}
              </article>
            ))}
          </div>

          {/* 📝 COMMENTAIRE FINAL DE SYNTHÈSE */}
          <section className="bg-white/5 border border-white/5 p-10 rounded-[3rem] shadow-2xl">
             <label className="flex items-center gap-4 text-xs font-black uppercase text-slate-400 mb-6 italic tracking-[0.3em]">
               <MessageSquare size={18} className="text-emerald-500" /> Remarque Finale ou Suggestions
             </label>
             <textarea 
               value={globalComment} 
               onChange={e => setGlobalComment(e.target.value)} 
               placeholder="Souhaitez-vous ajouter une précision pour la Revue de Direction ?" 
               className="w-full bg-black/40 border border-white/10 p-6 rounded-3xl text-white font-bold h-40 italic outline-none focus:border-emerald-500 transition-all shadow-inner placeholder:text-slate-800" 
             />
          </section>

          {/* 🚀 ACTION DE SOUMISSION */}
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.5em] shadow-4xl transition-all border-none flex items-center justify-center gap-5 active:scale-95 disabled:opacity-50 italic cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} /> 
                Scellage en cours...
              </>
            ) : (
              <>
                <Send size={24} strokeWidth={3} /> 
                Envoyer l&apos;Évaluation Master
              </>
            )}
          </button>
          
          <div className="text-center opacity-20 text-[8px] font-black uppercase tracking-[0.6em] pt-10">
            SMI Sovereign Architecture • Qualisoft • Registre Digital 2026
          </div>
        </form>
      </div>
    </div>
  );
}