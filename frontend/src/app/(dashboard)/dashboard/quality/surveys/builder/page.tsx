/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛠️ MODULE : SURVEY BUILDER (SDE MATRIX)
 * -------------------------------------------------------------------------
 * RÔLE : Édition de la structure des enquêtes de performance.
 * DESIGN : 100dvh, Clean-Workspace, ClickUp Form Factor.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 21:50 GMT
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/core/api/api-client";
import { 
  ChevronLeft, Globe, Layout, Plus, Save, Send, 
  Settings, Trash2, Loader2, Target, Info} from "lucide-react";
import { toast, Toaster } from "sonner";

export default function SurveyBuilderMaster() {
  const router = useRouter();
  const [surveyTitle, setSurveyTitle] = useState("ENQUÊTE DE PERFORMANCE 2026");
  const [targetConfig, setTargetConfig] = useState("CLIENT");
  const [questions, setQuestions] = useState<any[]>([
    { id: Date.now(), text: "Niveau de satisfaction globale ?", type: "SCALE" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addQuestion = useCallback(() => {
    setQuestions(prev => [...prev, { id: Date.now(), text: "", type: "SCALE" }]);
  }, []);

  const saveSurvey = async () => {
    if (!surveyTitle.trim() || questions.some(q => !q.text.trim())) {
      return toast.warning("ANOMALIE : CHAMPS OBLIGATOIRES VIDES.");
    }
    setSubmitting(true);
    const tid = toast.loading("SCELLAGE DE L'ARCHITECTURE...");
    try {
      await apiClient.post('/surveys/campaigns', { 
        CMP_Title: surveyTitle.toUpperCase(), 
        CMP_Target: targetConfig, 
        CMP_Questions: questions 
      });
      toast.success("ARCHITECTURE SCELLÉE DANS LE KERNEL", { id: tid });
      router.push("/dashboard/quality/surveys");
    } catch { toast.error("ÉCHEC DE SCELLAGE SDE", { id: tid }); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-emerald-500/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-6 mt-12 lg:mt-0">
        <div className="flex gap-6 items-center">
          <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white border border-white/5 cursor-pointer transition-all"><ChevronLeft size={20}/></button>
          <h1 className="text-3xl lg:text-4xl tracking-tighter italic m-0">Survey <span className="text-emerald-500">Builder</span></h1>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none bg-slate-900 px-8 py-4 rounded-2xl text-[10px] tracking-widest text-slate-400 cursor-pointer flex items-center gap-3 border-none hover:text-white transition-all"><Settings size={16}/> Avancé</button>
          <button disabled={submitting} onClick={saveSurvey} className="flex-1 sm:flex-none bg-blue-600 px-10 py-4 rounded-2xl text-[10px] tracking-widest text-white shadow-4xl cursor-pointer hover:scale-105 transition-all border-none italic flex items-center gap-3 justify-center disabled:opacity-30">
            {submitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Sceller l&apos;Architecture
          </button>
        </div>
      </header>

      {/* 🧩 WORKSPACE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-10 flex flex-col xl:flex-row gap-10">
        <div className="flex-1 space-y-10 pb-32">
          {/* Main Config */}
          <section className="bg-[#151A2D] p-12 rounded-[4rem] border-2 border-white/5 relative overflow-hidden group shadow-4xl text-left">
            <Layout className="absolute -right-12 -top-12 text-white/5 group-hover:rotate-12 transition-transform duration-700 pointer-events-none" size={250} />
            <div className="relative z-10 flex flex-col xl:flex-row gap-10 items-end">
              <div className="flex-1 w-full space-y-4">
                <label className="text-[10px] text-slate-500 tracking-widest ml-6 italic">Désignation de la Campagne</label>
                <input value={surveyTitle} onChange={e => setSurveyTitle(e.target.value.toUpperCase())} className="w-full bg-transparent border-none text-3xl lg:text-5xl font-black italic tracking-tighter text-emerald-500 outline-none placeholder:text-emerald-900 m-0 uppercase" />
              </div>
              <div className="bg-slate-950 p-6 rounded-3xl border-2 border-white/5 w-full xl:w-80 shadow-inner">
                <Target size={16} className="text-blue-500 mb-2" />
                <select value={targetConfig} onChange={e => setTargetConfig(e.target.value)} className="w-full bg-transparent border-none outline-none text-[10px] font-black uppercase text-blue-400 cursor-pointer italic appearance-none m-0">
                  <option value="CLIENT">Cible : CLIENTS</option>
                  <option value="SUPPLIER">Cible : FOURNISSEURS</option>
                  <option value="EMPLOYEE">Cible : RH / SOCIAL</option>
                </select>
              </div>
            </div>
          </section>

          {/* Questions Grid */}
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-900/40 border-2 border-white/5 p-8 rounded-[3rem] flex flex-col xl:flex-row xl:items-center gap-10 group hover:border-emerald-500/30 transition-all shadow-4xl text-left animate-in slide-in-from-left-10">
                <span className="text-5xl font-black text-slate-800 italic group-hover:text-emerald-500 transition-colors leading-none m-0">{String(idx + 1).padStart(2, '0')}</span>
                <input value={q.text} onChange={e => { const n = [...questions]; n[idx].text = e.target.value; setQuestions(n); }} placeholder="Dimension d'évaluation..." className="bg-transparent border-b-2 border-white/5 focus:border-emerald-500 outline-none flex-1 font-black text-lg italic text-white placeholder:text-slate-800 transition-all m-0" />
                <div className="flex items-center gap-6">
                  <select value={q.type} onChange={e => { const n = [...questions]; n[idx].type = e.target.value; setQuestions(n); }} className="bg-[#151A2D] border border-white/10 rounded-2xl px-6 py-3 text-[10px] font-black text-slate-300 outline-none cursor-pointer italic">
                    <option value="SCALE">ÉCHELLE (1-10)</option>
                    <option value="TEXT">TEXTE LIBRE</option>
                    <option value="BOOLEAN">OUI / NON</option>
                  </select>
                  <button onClick={() => setQuestions(questions.filter(i => i.id !== q.id))} className="p-4 bg-rose-600/10 text-rose-600 rounded-2xl border border-rose-600/20 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
            <button onClick={addQuestion} className="w-full py-10 border-4 border-dashed border-white/5 rounded-[3rem] bg-white/2 text-slate-600 hover:border-emerald-500/30 hover:text-emerald-500 transition-all font-black text-[12px] tracking-[0.4em] cursor-pointer italic flex items-center justify-center gap-6 uppercase">
              <Plus size={24} /> Ajouter Dimension d&apos;Analyse
            </button>
          </div>
        </div>

        {/* Info Side */}
        <aside className="w-full xl:w-96 space-y-8 shrink-0 pb-10">
          <div className="bg-[#151A2D] border-2 border-blue-600/20 p-10 rounded-[3.5rem] relative overflow-hidden shadow-4xl text-left">
            <Globe className="absolute -right-10 -top-10 text-blue-500/5" size={180} />
            <h3 className="text-[11px] font-black italic mb-8 border-b border-white/5 pb-6 m-0 tracking-widest"><Globe size={18} className="text-blue-500 inline mr-4"/> Diffusion Master</h3>
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/10 font-mono text-[9px] text-blue-400 truncate shadow-inner">https://qualisoft.sn/survey/[AUTO_ID]</div>
            <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-[10px] tracking-widest mt-8 flex items-center justify-center gap-4 hover:scale-105 transition-all cursor-pointer border-none shadow-4xl"><Send size={18}/> Sync Mail Groupé</button>
          </div>
          <div className="bg-amber-600/5 border-2 border-amber-600/20 p-10 rounded-[3.5rem] shadow-4xl text-left">
            <h4 className="text-[11px] font-black text-amber-500 italic mb-6 m-0 flex items-center gap-4"><Info size={18}/> Protocole §8.4 / §9</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-black uppercase italic tracking-widest m-0">Ne dépassez pas 8 dimensions pour maximiser le taux de retour. Chaque insatisfaction générera un scan NC automatique.</p>
          </div>
        </aside>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}
