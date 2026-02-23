/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
//* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ChevronLeft, Globe, Layout, Plus, Save, Send, Settings, Trash2, Loader2, Target, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast, Toaster } from "sonner";
import apiClient from "@/core/api/api-client";

interface Question { id: number; text: string; type: string; }

export default function SurveyBuilderMaster() {
  const router = useRouter();
  const [surveyTitle, setSurveyTitle] = useState("ENQUÊTE DE PERFORMANCE 2026");
  const [targetConfig, setTargetConfig] = useState("CLIENT");
  const [questions, setQuestions] = useState<Question[]>([
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
    try {
      await apiClient.post('/surveys/campaigns', { CMP_Title: surveyTitle.toUpperCase(), CMP_Target: targetConfig, CMP_Questions: questions });
      toast.success("ARCHITECTURE SCELLÉE.");
      router.push("/dashboard/quality/surveys");
    } catch (e) { toast.error("ÉCHEC DE SCELLAGE"); setSubmitting(false); }
  };

  return (
    <div className="ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-6 overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER BUILDER */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
        <div className="flex gap-4 items-center">
          <button onClick={() => router.back()} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white border-none cursor-pointer"><ChevronLeft size={18}/></button>
          <h1 className="text-xl font-black uppercase m-0">Survey <span className="text-emerald-500">Builder</span></h1>
        </div>
        <div className="flex gap-3">
          <button className="bg-white/5 px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-white/10 text-slate-400 cursor-pointer hover:bg-white/10"><Settings size={14} className="inline mr-2"/> Avancé</button>
          <button disabled={submitting} onClick={saveSurvey} className="bg-blue-600 px-6 py-2 rounded-xl text-[9px] font-black uppercase italic shadow-lg border-none text-white cursor-pointer hover:bg-white hover:text-blue-600 transition-all">
            {submitting ? <Loader2 className="animate-spin" size={14}/> : <Save size={14} className="inline mr-2"/>} Sceller l&apos;Architecture
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* 🛠️ ÉDITION PRINCIPALE (8/12) */}
        <div className="col-span-8 overflow-y-auto custom-scrollbar pr-2 space-y-6">
          <div className="bg-[#151A2D] p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
            <Layout className="absolute -right-8 -top-8 text-white/5 group-hover:rotate-12 transition-transform" size={150} />
            <div className="relative z-10 flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Titre de la Campagne SDE</label>
                <input value={surveyTitle} onChange={e => setSurveyTitle(e.target.value.toUpperCase())} className="bg-transparent border-none text-3xl font-black uppercase tracking-tighter w-full outline-none text-emerald-500 italic placeholder:text-emerald-900" />
              </div>
              <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                <Target size={14} className="text-blue-500 mb-1" />
                <select value={targetConfig} onChange={e => setTargetConfig(e.target.value)} className="bg-transparent border-none outline-none text-[8px] font-black uppercase text-blue-400 cursor-pointer italic appearance-none">
                  <option value="CLIENT">Cible: CLIENTS</option>
                  <option value="SUPPLIER">Cible: FOURNISSEURS</option>
                  <option value="EMPLOYEE">Cible: RH / SOCIAL</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center gap-4 group hover:border-emerald-500/30 transition-all shadow-lg animate-in slide-in-from-left-4">
                <span className="text-2xl font-black text-slate-800 italic group-hover:text-emerald-500/20">{String(idx + 1).padStart(2, '0')}</span>
                <input 
                    placeholder="ÉNONCÉ DE LA DIMENSION..." 
                    className="bg-transparent border-none outline-none flex-1 font-black uppercase italic text-xs text-white placeholder:text-slate-800 tracking-widest"
                    value={q.text} onChange={e => { const n = [...questions]; n[idx].text = e.target.value; setQuestions(n); }}
                />
                <select value={q.type} onChange={e => { const n = [...questions]; n[idx].type = e.target.value; setQuestions(n); }} className="bg-[#151A2D] border border-white/10 rounded-lg px-3 py-1.5 text-[8px] font-black text-slate-400 outline-none cursor-pointer">
                  <option value="SCALE">ÉCHELLE (1-10)</option>
                  <option value="TEXT">TEXTE LIBRE</option>
                  <option value="BOOLEAN">OUI / NON</option>
                </select>
                <button onClick={() => setQuestions(questions.filter(i => i.id !== q.id))} className="p-2 text-slate-700 hover:text-rose-500 transition-colors border-none bg-transparent cursor-pointer"><Trash2 size={16}/></button>
              </div>
            ))}
            <button onClick={addQuestion} className="w-full py-4 border border-dashed border-white/10 rounded-2xl bg-white/2 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-500 transition-all font-black uppercase text-[9px] tracking-[0.3em] cursor-pointer italic"><Plus size={14} className="inline mr-2"/> Ajouter Dimension</button>
          </div>
        </div>

        {/* 📡 DIFFUSION & CONSEILS (4/12) */}
        <div className="col-span-4 space-y-6 shrink-0">
          <div className="bg-[#151A2D] border border-blue-600/20 p-6 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <Globe className="absolute -right-6 -top-6 text-blue-500/5" size={120} />
            <h3 className="text-[10px] font-black uppercase italic mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><Globe size={14} className="text-blue-500"/> Diffusion Master</h3>
            <div className="space-y-4">
              <div className="bg-black/60 p-3 rounded-xl border border-white/10 font-mono text-[8px] text-blue-400 truncate italic">https://qualisoft.sn/survey/[AUTO_ID]</div>
              <button className="w-full bg-blue-600/10 border border-blue-500/30 text-blue-500 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all cursor-pointer italic shadow-lg"><Send size={14}/> Sync Mail Groupé</button>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-[2.5rem] relative overflow-hidden">
            <div className="flex items-center gap-2 text-amber-500 mb-4"><Info size={14}/><h4 className="text-[10px] font-black uppercase m-0 italic">Protocol §8.4 / §9</h4></div>
            <p className="text-[9px] text-slate-400 leading-relaxed font-bold uppercase italic tracking-widest m-0">
              Un score est une preuve brute. Le commentaire libre est la source de l&apos;action corrective. Ne dépassez pas 8 dimensions pour maximiser le taux de retour.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}