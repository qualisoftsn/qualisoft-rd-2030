/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 NOM ABSOLU : src/app/dashboard/quality/surveys/builder/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Architecte de questionnaires stratégiques SDE.
 * ARCHITECTURE : Création de campagnes réelles dans la BDD (apiClient).
 * DESIGN : Full-Space Matrix, inputs massifs, UX de création immersive.
 * -------------------------------------------------------------------------
 */

"use client";

import {
  AlertCircle, ChevronLeft, Globe, Layout,
  Plus, Save, Send, Settings, Trash2, Loader2,
  Target
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast, Toaster } from "sonner";
import apiClient from "@/core/api/api-client";

// --- 🏗️ TYPES STRICTS SDE ---
interface Question {
  id: number;
  text: string;
  type: string;
}

export default function SurveyBuilderMaster() {
  const router = useRouter();
  
  // --- 📦 ÉTATS DE CONSTRUCTION ---
  const [surveyTitle, setSurveyTitle] = useState("ENQUÊTE DE PERFORMANCE 2026");
  const [targetConfig, setTargetConfig] = useState("CLIENT");
  const [questions, setQuestions] = useState<Question[]>([
    { id: Date.now(), text: "Niveau de satisfaction globale par rapport au service ?", type: "SCALE" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  /** ➕ ACTION : AJOUTER UNE DIMENSION */
  const addQuestion = useCallback(() => {
    setQuestions((prev) => [
      ...prev,
      { id: Date.now(), text: "", type: "SCALE" },
    ]);
  }, []);

  /** 💾 ACTION : SCELLER LA CAMPAGNE DANS LE NOYAU SDE */
  const ValiderEnquete = useCallback(async () => {
    // Validation active SDE
    if (!surveyTitle.trim()) return toast.warning("ANOMALIE : LE TITRE EST REQUIS.");
    const invalidQuestions = questions.filter(q => !q.text.trim());
    if (invalidQuestions.length > 0) return toast.warning("ANOMALIE : DES DIMENSIONS SONT VIDES.");

    setSubmitting(true);
    const tid = toast.loading("Scellage de l'architecture de campagne...");

    try {
      // API call to create the survey campaign
      await apiClient.post('/surveys/campaigns', {
        CMP_Title: surveyTitle.toUpperCase(),
        CMP_Target: targetConfig,
        CMP_Questions: questions
      });

      toast.success("CAMPAGNE SCELLÉE DANS LA BDD SDE.", { id: tid });
      router.push("/dashboard/quality/surveys");
    } catch (error) {
      toast.error("ÉCHEC DE SCELLAGE DE LA CAMPAGNE.", { id: tid });
      setSubmitting(false); // Reset to allow retry
    }
  }, [surveyTitle, targetConfig, questions, router]);

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-16 ml-72 text-white font-sans italic text-left selection:bg-emerald-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="w-full max-w-500 mx-auto space-y-16 animate-in fade-in duration-1000">

        {/* 🛰️ BARRE DE CONTRÔLE BUILDER (HEADER FULL SPACE) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 border-b-4 border-white/5 pb-16">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-6 text-slate-500 font-black uppercase text-[12px] tracking-[0.5em] hover:text-white transition-all border-none bg-white/5 px-8 py-4 rounded-3xl cursor-pointer italic"
          >
            <ChevronLeft size={24} /> Retour Cockpit
          </button>
          
          <div className="flex gap-8 w-full lg:w-auto">
            <button className="bg-[#151A2D] border-4 border-white/5 px-10 py-6 rounded-[3rem] text-[12px] font-black uppercase italic tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-white hover:text-black transition-all cursor-pointer flex-1 lg:flex-none">
              <Settings size={24} /> Avancé
            </button>
            <button
              onClick={ValiderEnquete}
              disabled={submitting}
              className="bg-blue-600 px-14 py-6 rounded-[3rem] text-[13px] font-black uppercase italic tracking-[0.5em] flex items-center justify-center gap-6 shadow-[0_30px_80px_rgba(37,99,235,0.4)] hover:bg-white hover:text-blue-600 transition-all border-none cursor-pointer active:scale-95 disabled:opacity-50 flex-2 lg:flex-none text-white group"
            >
              {submitting ? <Loader2 className="animate-spin" size={28} /> : <Save size={28} strokeWidth={3} className="group-hover:scale-110 transition-transform" />} Valider l&apos;Architecture
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-20 text-left items-start">
          
          {/* COLONNE ÉDITION : STRUCTURE DU QUESTIONNAIRE */}
          <div className="xl:col-span-2 space-y-16">
            
            {/* MASTER TITLE INPUT */}
            <div className="bg-[#151A2D] p-16 rounded-[5rem] border-4 border-white/5 shadow-4xl relative overflow-hidden group backdrop-blur-3xl">
              <div className="absolute -right-10 -top-10 text-emerald-500/5 group-hover:rotate-12 transition-transform duration-1000">
                <Layout size={300} />
              </div>
              <input
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value.toUpperCase())}
                className="bg-transparent border-none text-6xl lg:text-7xl font-black uppercase italic tracking-tighter w-full outline-none text-emerald-500 relative z-10 leading-none placeholder:text-emerald-900"
                placeholder="TITRE DE LA CAMPAGNE..."
              />
              <div className="flex items-center gap-8 mt-12 relative z-10">
                <p className="text-[12px] text-slate-500 font-black uppercase tracking-[0.6em] flex items-center gap-4 italic leading-none bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                  <Layout size={20} className="text-emerald-500" /> Matrice ISO 9001
                </p>
                <div className="flex items-center gap-4 bg-black/40 px-6 py-2.5 rounded-2xl border border-white/5">
                   <Target size={18} className="text-blue-500" />
                   <select 
                     className="bg-transparent border-none outline-none text-[11px] font-black uppercase italic tracking-[0.4em] text-blue-400 cursor-pointer appearance-none"
                     value={targetConfig}
                     onChange={(e) => setTargetConfig(e.target.value)}
                   >
                     <option value="CLIENT" className="bg-[#0B0F1A]">Cible: CLIENTS</option>
                     <option value="SUPPLIER" className="bg-[#0B0F1A]">Cible: FOURNISSEURS</option>
                     <option value="EMPLOYEE" className="bg-[#0B0F1A]">Cible: COLLABORATEURS</option>
                   </select>
                </div>
              </div>
            </div>

            {/* QUESTIONS BUILDER */}
            <div className="space-y-8">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-black/60 border-4 border-white/5 p-12 rounded-[4rem] flex flex-col md:flex-row items-center gap-10 group hover:border-emerald-500/40 transition-all shadow-2xl animate-in fade-in slide-in-from-left-6 duration-700 backdrop-blur-md"
                >
                  <div className="text-7xl font-black text-slate-800 italic group-hover:text-emerald-500/30 transition-colors leading-none tracking-tighter">
                    0{idx + 1}
                  </div>
                  <input
                    placeholder="DÉFINIR LA DIMENSION D'ANALYSE..."
                    className="bg-transparent border-none outline-none flex-1 w-full font-black uppercase italic text-2xl text-white placeholder-slate-700 tracking-widest"
                    value={q.text}
                    onChange={(e) => {
                      const newQ = [...questions];
                      newQ[idx].text = e.target.value;
                      setQuestions(newQ);
                    }}
                  />
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <select 
                      className="bg-[#151A2D] border-2 border-white/10 rounded-4xl px-8 py-6 text-[12px] font-black uppercase italic text-slate-400 outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-inner tracking-[0.3em] flex-1 md:flex-none appearance-none"
                      value={q.type}
                      onChange={(e) => {
                         const newQ = [...questions];
                         newQ[idx].type = e.target.value;
                         setQuestions(newQ);
                      }}
                    >
                      <option value="SCALE" className="bg-[#0B0F1A]">ÉCHELLE (1-10)</option>
                      <option value="TEXT" className="bg-[#0B0F1A]">TEXTE LIBRE</option>
                      <option value="BOOLEAN" className="bg-[#0B0F1A]">OUI / NON</option>
                    </select>
                    <button
                      onClick={() => setQuestions(questions.filter((item) => item.id !== q.id))}
                      className="p-6 bg-white/5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-4xl border-none cursor-pointer active:scale-90"
                    >
                      <Trash2 size={28} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={addQuestion}
                className="w-full py-14 border-4 border-dashed border-white/5 rounded-[4.5rem] flex items-center justify-center gap-8 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all cursor-pointer font-black uppercase italic text-[14px] tracking-[0.5em] shadow-inner active:scale-95 bg-transparent"
              >
                <Plus size={32} strokeWidth={3} /> Ajouter une dimension d&apos;analyse
              </button>
            </div>
          </div>

          {/* COLONNE DIFFUSION : SOUVERAINETÉ ET CONSEILS */}
          <div className="space-y-16">
            
            {/* DIFFUSION MASTER SDE */}
            <div className="bg-[#151A2D] border-4 border-blue-600/30 p-16 rounded-[5rem] backdrop-blur-3xl shadow-4xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 text-blue-500/5 group-hover:scale-110 transition-transform duration-1000">
                <Globe size={250} />
              </div>
              <h3 className="text-4xl font-black uppercase italic mb-12 flex items-center gap-6 tracking-tighter relative z-10 leading-none text-white border-b-4 border-white/5 pb-8">
                <Globe className="text-blue-500" size={40} /> Diffusion Master
              </h3>
              <div className="space-y-10 relative z-10">
                <div className="text-left">
                  <label className="text-[12px] font-black text-slate-500 uppercase italic tracking-[0.5em] block mb-6 ml-6">
                    Point d&apos;entrée Public (SDE)
                  </label>
                  <div className="bg-black/60 border-2 border-white/10 p-8 rounded-[2.5rem] text-[12px] font-mono text-blue-400 truncate italic shadow-inner tracking-widest">
                    https://qualisoft.sn/survey/[ID_CAMPAGNE]
                  </div>
                </div>
                <button className="w-full bg-blue-600 py-8 rounded-[3rem] font-black uppercase text-[12px] tracking-[0.4em] shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center justify-center gap-5 italic hover:bg-white hover:text-blue-600 transition-all border-none cursor-pointer active:scale-95 text-white">
                  <Send size={24} /> Mail Groupé (CRM Sync)
                </button>
              </div>
            </div>

            {/* CONSEIL ISO 9001 */}
            <div className="bg-amber-500/5 border-4 border-amber-500/20 p-16 rounded-[5rem] shadow-2xl text-left relative overflow-hidden">
              <AlertCircle size={200} className="absolute -bottom-10 -right-10 text-amber-500 opacity-5" />
              <div className="flex items-center gap-6 text-amber-500 mb-10 leading-none relative z-10">
                <AlertCircle size={36} />
                <h4 className="text-2xl font-black uppercase italic tracking-[0.4em]">
                  Conseil ISO 9001
                </h4>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed italic font-bold uppercase tracking-widest relative z-10">
                Privilégiez des questions orientées sur la valeur perçue (§8.4 pour les fournisseurs). Un score est une preuve, mais le commentaire libre est la source de l&apos;action corrective. Ne surchargez pas le questionnaire pour garantir un taux de retour optimal.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        ::-webkit-scrollbar { width: 0px; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
    </div>
  );
}