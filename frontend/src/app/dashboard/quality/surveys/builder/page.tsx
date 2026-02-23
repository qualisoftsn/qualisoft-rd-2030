/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NOM ABSOLU : src/app/dashboard/quality/surveys/builder/page.tsx
 * FONCTION : Architecte de questionnaires stratégiques Qualisoft.
 * RÔLE : Définition des dimensions d'analyse et scellage de l'enquête.
 */

"use client";

import {
  AlertCircle,
  ChevronLeft,
  Globe,
  Layout,
  Plus,
  Save,
  Send,
  Settings,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

export default function SurveyBuilderMaster() {
  const router = useRouter();
  const [surveyTitle, setSurveyTitle] = useState("ENQUÊTE DE PERFORMANCE 2026");
  const [questions, setQuestions] = useState([
    { id: 1, text: "Niveau de satisfaction globale ?", type: "SCALE" },
  ]);

  /** ➕ ACTION : AJOUTER UNE DIMENSION */
  const addQuestion = useCallback(() => {
    setQuestions((prev) => [
      ...prev,
      { id: Date.now(), text: "", type: "SCALE" },
    ]);
  }, []);

  /** 💾 ACTION : Valider L'ENQUÊTE */
  const ValiderEnquete = useCallback(() => {
    toast.success("Enquête scellée dans le Noyau Qualisoft");
    router.push("/dashboard/quality/surveys");
  }, [router]);

  return (
    <div className="p-12 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans overflow-hidden selection:bg-emerald-600/30">
      {/* 🛰️ BARRE DE CONTRÔLE BUILDER */}
      <div className="flex justify-between items-center mb-16 animate-in slide-in-from-top-6 duration-700">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-4 text-slate-500 font-black uppercase text-[11px] tracking-[0.3em] hover:text-white transition-all border-none bg-transparent cursor-pointer italic"
        >
          <ChevronLeft size={20} /> Retour au Cockpit
        </button>
        <div className="flex gap-6">
          <button className="bg-white/5 border border-white/10 px-8 py-5 rounded-2xl text-[10px] font-black uppercase italic tracking-[0.4em] flex items-center gap-3 hover:bg-white hover:text-black transition-all cursor-pointer">
            <Settings size={18} /> Paramètres Avancés
          </button>
          <button
            onClick={ValiderEnquete}
            className="bg-blue-600 px-12 py-5 rounded-2xl text-[10px] font-black uppercase italic tracking-[0.4em] flex items-center gap-4 shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all border-none cursor-pointer active:scale-95"
          >
            <Save size={20} /> Valider l&apos;Architecture
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 text-left">
        {/* COLONNE ÉDITION : STRUCTURE DU QUESTIONNAIRE */}
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-slate-900/40 p-12 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 text-emerald-500/5 group-hover:rotate-12 transition-transform duration-1000">
              <Layout size={200} />
            </div>
            <input
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value.toUpperCase())}
              className="bg-transparent border-none text-6xl font-black uppercase italic tracking-tighter w-full outline-none text-emerald-500 relative z-10 leading-none"
            />
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.5em] mt-6 flex items-center gap-4 italic relative z-10 leading-none">
              <Layout size={18} className="text-emerald-500" /> Matrice de
              collecte dynamique § ISO 9001
            </p>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-slate-900/60 border border-white/5 p-10 rounded-[3rem] flex items-center gap-10 group hover:border-emerald-500/30 transition-all shadow-xl animate-in fade-in slide-in-from-left-4 duration-500"
              >
                <div className="text-5xl font-black text-slate-800 italic group-hover:text-emerald-500/30 transition-colors leading-none tracking-tighter">
                  0{idx + 1}
                </div>
                <input
                  placeholder="DÉFINIR LA QUESTION STRATÉGIQUE..."
                  className="bg-transparent border-none outline-none flex-1 font-black uppercase italic text-xl text-white placeholder-slate-800 tracking-tighter"
                  value={q.text}
                  onChange={(e) => {
                    const newQ = [...questions];
                    newQ[idx].text = e.target.value;
                    setQuestions(newQ);
                  }}
                />
                <select className="bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black uppercase italic text-slate-400 outline-none focus:border-emerald-500 transition-all cursor-pointer">
                  <option>ÉCHELLE (1-10)</option>
                  <option>TEXTE LIBRE</option>
                  <option>OUI / NON</option>
                </select>
                <button
                  onClick={() =>
                    setQuestions(questions.filter((item) => item.id !== q.id))
                  }
                  className="p-4 text-slate-700 hover:text-rose-500 transition-all border-none bg-transparent cursor-pointer"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full py-10 border-2 border-dashed border-white/5 rounded-[3.5rem] flex items-center justify-center gap-6 text-slate-600 hover:border-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all cursor-pointer font-black uppercase italic text-xs tracking-[0.4em] shadow-inner"
            >
              <Plus size={24} /> Ajouter une dimension d&apos;analyse
            </button>
          </div>
        </div>

        {/* COLONNE DIFFUSION : SOUVERAINETÉ ET CONSEILS */}
        <div className="space-y-12">
          <div className="bg-linear-to-br from-blue-600/10 to-transparent border border-blue-600/20 p-12 rounded-[4.5rem] backdrop-blur-3xl shadow-3xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-blue-500/5 group-hover:scale-110 transition-transform duration-1000">
              <Globe size={180} />
            </div>
            <h3 className="text-3xl font-black uppercase italic mb-10 flex items-center gap-5 tracking-tighter relative z-10 leading-none">
              <Globe className="text-blue-500" size={32} /> Diffusion Master
            </h3>
            <div className="space-y-8 relative z-10">
              <div className="text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase italic tracking-[0.4em] block mb-4 ml-4">
                  Point d&apos;entrée Public
                </label>
                <div className="bg-black/40 border border-white/10 p-6 rounded-2xl text-[10px] font-mono text-blue-400 truncate italic shadow-inner">
                  https://qualisoft.sn/survey/RD2026-XQ-ELITE
                </div>
              </div>
              <button className="w-full bg-blue-600 py-6 rounded-3xl font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_20px_40px_rgba(37,99,235,0.2)] flex items-center justify-center gap-4 italic hover:bg-blue-500 transition-all border-none cursor-pointer">
                <Send size={20} /> Mail Groupé (CRM Sync)
              </button>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[4rem] shadow-2xl text-left">
            <div className="flex items-center gap-4 text-amber-500 mb-8 leading-none">
              <AlertCircle size={24} />
              <h4 className="text-base font-black uppercase italic tracking-[0.3em]">
                Conseil ISO 9001
              </h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed italic font-bold uppercase tracking-tighter opacity-80">
              Privilégiez des questions orientées sur la valeur perçue (§8.4
              pour les fournisseurs). Un score est une preuve, mais le
              commentaire libre est la source de l&apos;action corrective. Ne
              surchargez pas le questionnaire pour garantir un taux de retour
              optimal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
