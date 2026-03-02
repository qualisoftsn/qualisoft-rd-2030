/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛠️ MODULE : SURVEY BUILDER (SDE MATRIX)
 * -------------------------------------------------------------------------
 * RÔLE : Édition de la structure des enquêtes de performance.
 * ARCHITECTURE : Zéro NextAuth (100% apiClient JWT).
 * DATE : 02 Mars 2026 | 13:31 GMT
 * -------------------------------------------------------------------------
 */

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
    const tid = toast.loading("Scellage de l'architecture en cours...");
    try {
      await apiClient.post('/surveys/campaigns', { CMP_Title: surveyTitle.toUpperCase(), CMP_Target: targetConfig, CMP_Questions: questions });
      toast.success("ARCHITECTURE SCELLÉE DANS LE KERNEL.", { id: tid });
      router.push("/dashboard/quality/surveys");
    } catch (e) { 
      toast.error("ÉCHEC DE SCELLAGE SDE.", { id: tid }); 
      setSubmitting(false); 
    }
  };

  return (
    <div className="ml-0 lg:ml-72 min-h-screen lg:h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col p-4 lg:p-6 overflow-hidden selection:bg-emerald-500/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER BUILDER */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-white/10 pb-6 mb-6 shrink-0 gap-6">
        <div className="flex gap-4 items-center">
          <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white border border-white/5 cursor-pointer transition-colors shadow-sm">
             <ChevronLeft size={20}/>
          </button>
          <h1 className="text-2xl lg:text-3xl font-black uppercase m-0 tracking-tighter">Survey <span className="text-emerald-500">Builder</span></h1>
        </div>
        <div className="flex gap-3 lg:gap-4 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none bg-slate-900 px-5 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] lg:text-[11px] font-black uppercase border border-white/10 text-slate-400 cursor-pointer hover:text-white transition-colors shadow-sm tracking-widest flex items-center justify-center">
             <Settings size={16} className="mr-3"/> Avancé
          </button>
          <button disabled={submitting} onClick={saveSurvey} className="flex-1 sm:flex-none bg-blue-600 px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] lg:text-[11px] font-black uppercase italic shadow-[0_10px_20px_rgba(37,99,235,0.3)] border-none text-white cursor-pointer hover:bg-blue-500 active:scale-95 transition-all tracking-widest flex items-center justify-center disabled:opacity-50">
            {submitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} className="mr-3"/>} 
            <span className="hidden sm:inline">Sceller l&apos;Architecture</span>
            <span className="inline sm:hidden">Sceller</span>
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col xl:grid xl:grid-cols-12 gap-6 overflow-hidden">
        
        {/* 🛠️ ÉDITION PRINCIPALE (8/12) */}
        <div className="xl:col-span-8 overflow-y-auto custom-scrollbar lg:pr-4 space-y-6 lg:space-y-8 pb-6 lg:pb-0">
          
          <div className="bg-[#151A2D] p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] border-2 border-white/5 relative overflow-hidden group shadow-xl">
            <Layout className="absolute -right-10 -top-10 text-white/5 group-hover:rotate-12 transition-transform duration-700 pointer-events-none" size={200} />
            <div className="relative z-10 flex flex-col sm:flex-row gap-6 lg:gap-8 items-start sm:items-end">
              <div className="flex-1 w-full">
                <label className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 mb-3 block italic m-0">Titre de la Campagne SDE</label>
                <input 
                  value={surveyTitle} 
                  onChange={e => setSurveyTitle(e.target.value.toUpperCase())} 
                  className="bg-transparent border-none text-2xl lg:text-4xl font-black uppercase tracking-tighter w-full outline-none text-emerald-500 italic placeholder:text-emerald-900 m-0" 
                  placeholder="NOM DE LA CAMPAGNE..."
                />
              </div>
              <div className="bg-slate-900/60 px-5 py-3 rounded-2xl border-2 border-white/5 w-full sm:w-auto shrink-0">
                <Target size={16} className="text-blue-500 mb-2" />
                <select 
                  value={targetConfig} 
                  onChange={e => setTargetConfig(e.target.value)} 
                  className="w-full bg-transparent border-none outline-none text-[9px] lg:text-[10px] font-black uppercase text-blue-400 cursor-pointer italic appearance-none tracking-widest m-0"
                >
                  <option value="CLIENT">Cible: CLIENTS</option>
                  <option value="SUPPLIER">Cible: FOURNISSEURS</option>
                  <option value="EMPLOYEE">Cible: RH / SOCIAL</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-900/40 border-2 border-white/5 p-4 lg:p-6 rounded-4xl flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 group hover:border-emerald-500/30 transition-all shadow-md animate-in slide-in-from-left-4">
                <span className="text-3xl lg:text-4xl font-black text-slate-800 italic group-hover:text-emerald-500/20 leading-none m-0 shrink-0 select-none">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <input 
                    placeholder="ÉNONCÉ DE LA DIMENSION D'ÉVALUATION..." 
                    className="bg-transparent border-b-2 border-white/5 focus:border-emerald-500/50 outline-none flex-1 font-black uppercase italic text-sm lg:text-base text-white placeholder:text-slate-700 tracking-widest py-2 m-0 transition-colors"
                    value={q.text} onChange={e => { const n = [...questions]; n[idx].text = e.target.value; setQuestions(n); }}
                />
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select 
                    value={q.type} 
                    onChange={e => { const n = [...questions]; n[idx].type = e.target.value; setQuestions(n); }} 
                    className="flex-1 sm:flex-none bg-[#151A2D] border border-white/10 rounded-xl px-4 py-3 text-[9px] lg:text-[10px] font-black text-slate-300 outline-none cursor-pointer tracking-widest"
                  >
                    <option value="SCALE">ÉCHELLE (1-10)</option>
                    <option value="TEXT">TEXTE LIBRE</option>
                    <option value="BOOLEAN">OUI / NON</option>
                  </select>
                  <button 
                    onClick={() => setQuestions(questions.filter(i => i.id !== q.id))} 
                    className="p-3 text-slate-600 hover:text-white hover:bg-rose-500 rounded-xl transition-colors border-none bg-slate-900 cursor-pointer shrink-0"
                    title="Supprimer la dimension"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={addQuestion} 
              className="w-full py-6 lg:py-8 border-4 border-dashed border-white/5 rounded-[2.5rem] bg-white/2 text-slate-500 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-500 transition-all font-black uppercase text-[10px] lg:text-[11px] tracking-[0.4em] cursor-pointer italic m-0"
            >
              <Plus size={18} className="inline mr-3 align-text-bottom"/> Ajouter Dimension d&apos;Analyse
            </button>
          </div>
        </div>

        {/* 📡 DIFFUSION & CONSEILS (4/12) */}
        <div className="xl:col-span-4 space-y-6 lg:space-y-8 shrink-0 pb-6 xl:pb-0">
          <div className="bg-[#151A2D] border-2 border-blue-600/20 p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] relative overflow-hidden shadow-2xl">
            <Globe className="absolute -right-10 -top-10 text-blue-500/5 pointer-events-none" size={180} />
            <h3 className="text-[11px] lg:text-[12px] font-black uppercase italic mb-8 flex items-center gap-3 border-b-2 border-white/5 pb-6 m-0 tracking-widest">
              <Globe size={18} className="text-blue-500"/> Diffusion Master
            </h3>
            <div className="space-y-6 relative z-10">
              <div className="bg-slate-900 p-4 rounded-2xl border border-white/10 font-mono text-[9px] lg:text-[10px] text-blue-400 truncate italic shadow-inner">
                https://qualisoft.sn/survey/[AUTO_ID]
              </div>
              <button className="w-full bg-blue-600/10 border-2 border-blue-500/30 text-blue-500 py-4 lg:py-5 rounded-2xl font-black uppercase text-[10px] lg:text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all cursor-pointer italic shadow-lg">
                <Send size={16}/> Sync Mail Groupé
              </button>
            </div>
          </div>

          <div className="bg-amber-500/5 border-2 border-amber-500/20 p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-3 text-amber-500 mb-6">
              <Info size={18}/>
              <h4 className="text-[11px] lg:text-[12px] font-black uppercase m-0 italic tracking-widest">Protocol §8.4 / §9</h4>
            </div>
            <p className="text-[10px] lg:text-[11px] text-slate-300 leading-relaxed font-bold uppercase italic tracking-widest m-0">
              Un score quantitatif est une preuve brute. Le commentaire libre est la véritable source de l&apos;action corrective. Ne dépassez pas <span className="text-amber-500 font-black">8 dimensions</span> pour maximiser le taux de retour.
            </p>
            <div className="mt-8 opacity-70 mix-blend-screen text-center text-[9px] font-black uppercase text-amber-600/50 tracking-widest italic">
               
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </div>
  );
}