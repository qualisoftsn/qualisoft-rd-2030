/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : IDENTIFICATION ET ÉVALUATION DES RISQUES (§6.1 ISO 9001 / ISO 31000)
 * -------------------------------------------------------------------------
 * Rôle : Page souveraine permettant d'indexer une nouvelle menace/opportunité dans la Matrix.
 * Fix : Correction du responsive (flex-col -> lg:flex-row), suppression des 
 * classes Tailwind invalides (max-w-500, flex-2), et adaptation des marges.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 01:59 GMT
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Save, AlertTriangle, Loader2, Target, 
  ChevronRight, AlignLeft, Activity, Info, 
  ShieldAlert, Fingerprint 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface Processus {
  PR_Id: string;
  PR_Libelle: string;
}

interface RiskFormState {
  RS_Libelle: string;
  RS_Probabilite: number;
  RS_Gravite: number;
  RS_ProcessusId: string;
  RS_Description: string;
}

export default function NouveauRisquePage() {
  const router = useRouter();
  
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [processus, setProcessus] = useState<Processus[]>([]);
  
  const [form, setForm] = useState<RiskFormState>({
    RS_Libelle: '', RS_Probabilite: 1, RS_Gravite: 1, RS_ProcessusId: '', RS_Description: ''
  });

  useEffect(() => {
    apiClient.get('/processus')
      .then(res => {
         const data = res.data?.data || res.data;
         setProcessus(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("ÉCHEC KERNEL : IMPOSSIBLE DE CHARGER LES PROCESSUS."))
      .finally(() => setLoadingInitial(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.RS_ProcessusId) return toast.warning("LE RATTACHEMENT À UN PROCESSUS EST OBLIGATOIRE.");

    setSubmitting(true);
    const tid = toast.loading("Scellage de la menace dans le registre SDE...");
    
    try {
      await apiClient.post('/risks', form);
      toast.success("RISQUE SCELLÉ AVEC SUCCÈS.", { id: tid });
      router.push('/dashboard/direction');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR CRITIQUE DE SCELLAGE.", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = () => {
    const score = form.RS_Probabilite * form.RS_Gravite;
    if (score >= 12) return 'text-red-500 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)] bg-red-500/10 scale-105';
    if (score >= 8) return 'text-amber-500 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-amber-500/10';
    return 'text-emerald-500 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-emerald-500/10';
  };

  const getScoreLabel = () => {
    const score = form.RS_Probabilite * form.RS_Gravite;
    if (score >= 12) return 'RISQUE CRITIQUE (INACCEPTABLE)';
    if (score >= 8) return 'RISQUE MAJEUR (À TRAITER)';
    return 'RISQUE ACCEPTABLE (À SURVEILLER)';
  };

  if (loadingInitial) return (
    <div className="ml-0 lg:ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-8">
      <Loader2 className="animate-spin text-blue-600" size={80} strokeWidth={1} />
      <p className="text-blue-500 font-black uppercase italic text-xs tracking-[1em] animate-pulse">
        Initialisation Module Risques...
      </p>
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 flex-1 bg-[#0B0F1A] min-h-screen p-6 lg:p-12 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden pb-24">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="w-full max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 mt-12 lg:mt-0">
        
        {/* 🔝 EN-TÊTE STRATÉGIQUE */}
        <header className="flex flex-col gap-6 border-b-2 border-white/5 pb-10">
          <div className="flex items-center gap-4 text-amber-500 bg-amber-500/10 w-fit px-6 py-2 rounded-full border border-amber-500/20 shadow-inner">
            <Fingerprint size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest m-0">Protocole de risque</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter m-0 flex flex-col md:flex-row md:items-center gap-6 leading-none text-white">
            <div className="p-5 lg:p-6 bg-amber-600 rounded-4xl shadow-[0_0_40px_rgba(245,158,11,0.4)] text-white w-fit">
              <ShieldAlert size={40} strokeWidth={2.5}/>
            </div> 
            <span>Identifier une <span className="text-amber-500">Menace</span></span>
          </h1>
          <p className="text-slate-500 font-black text-[10px] lg:text-xs uppercase tracking-[0.8em] italic md:ml-24 opacity-80 m-0">
            DÉTECTION PROACTIVE • MATRICE SDE
          </p>
        </header>

        {/* 🏛️ GRID PRINCIPALE */}
        <div className="flex flex-col xl:flex-row gap-10 items-start">
          
          {/* FORMULAIRE DE SAISIE */}
          <form onSubmit={handleSubmit} className="flex-2 bg-[#151A2D] p-8 lg:p-12 rounded-[3rem] border-2 border-white/5 space-y-10 shadow-2xl backdrop-blur-3xl relative overflow-hidden text-left w-full">
            <AlertTriangle size={300} className="absolute -bottom-10 -right-10 opacity-[0.02] text-amber-500 pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <label className="text-[10px] lg:text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.4em] italic flex items-center gap-3 m-0">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" /> Intitulé de la menace
              </label>
              <input 
                type="text" required placeholder="EX: RUPTURE DE LA CHAÎNE LOGISTIQUE GLOBALE..."
                className="w-full bg-black/40 border-2 border-white/5 p-6 lg:p-8 rounded-4xl outline-none focus:border-amber-500 font-black italic transition-all text-white placeholder:text-slate-700 uppercase text-sm lg:text-xl tracking-widest shadow-inner"
                value={form.RS_Libelle} onChange={e => setForm({...form, RS_Libelle: e.target.value.toUpperCase()})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4 text-left">
                <label className="text-[10px] lg:text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.4em] italic flex items-center gap-3 m-0">
                  <Target size={18} className="text-amber-500" /> Processus Impacté
                </label>
                <div className="relative">
                  <select required className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-4xl outline-none focus:border-amber-500 font-black italic transition-all cursor-pointer text-white appearance-none uppercase text-xs lg:text-sm shadow-inner" value={form.RS_ProcessusId} onChange={e => setForm({...form, RS_ProcessusId: e.target.value})}>
                    <option value="" className="text-slate-600">-- CHOISIR UN SEGMENT --</option>
                    {processus.map(p => <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0F172A] text-white">[{p.PR_Id.slice(0, 4)}] {p.PR_Libelle}</option>)}
                  </select>
                  <ChevronRight size={24} className="absolute right-6 top-1/2 -translate-y-1/2 text-amber-500 rotate-90 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-4 text-left">
                <label className="text-[10px] lg:text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.4em] italic flex items-center gap-3 m-0">
                  <AlignLeft size={18} className="text-amber-500" /> Description (Causes)
                </label>
                <textarea rows={2} placeholder="Scénario du risque..." className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-4xl outline-none focus:border-amber-500 font-bold italic transition-all text-white placeholder:text-slate-700 text-sm shadow-inner resize-none" value={form.RS_Description} onChange={e => setForm({...form, RS_Description: e.target.value})} />
              </div>
            </div>

            {/* CALCULATEUR P x G */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 bg-black/20 p-6 lg:p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
              <div className="space-y-6 text-left">
                <label className="text-[10px] lg:text-xs font-black uppercase text-slate-400 flex justify-between px-4 italic tracking-[0.3em] items-center m-0">
                  Probabilité (P) <span className="text-amber-500 text-xl font-black italic bg-amber-500/10 px-4 py-1 rounded-xl border border-amber-500/20">{form.RS_Probabilite}/4</span>
                </label>
                <div className="px-2">
                  <input type="range" min="1" max="4" step="1" className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all shadow-inner" value={form.RS_Probabilite} onChange={e => setForm({...form, RS_Probabilite: parseInt(e.target.value)})} />
                  <div className="flex justify-between mt-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    <span>Rare (1)</span><span className="hidden sm:inline">Improbable (2)</span><span className="hidden sm:inline">Probable (3)</span><span>Fréq. (4)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-left">
                <label className="text-[10px] lg:text-xs font-black uppercase text-slate-400 flex justify-between px-4 italic tracking-[0.3em] items-center m-0">
                  Gravité (G) <span className="text-amber-500 text-xl font-black italic bg-amber-500/10 px-4 py-1 rounded-xl border border-amber-500/20">{form.RS_Gravite}/4</span>
                </label>
                <div className="px-2">
                  <input type="range" min="1" max="4" step="1" className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all shadow-inner" value={form.RS_Gravite} onChange={e => setForm({...form, RS_Gravite: parseInt(e.target.value)})} />
                  <div className="flex justify-between mt-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    <span>Min. (1)</span><span className="hidden sm:inline">Significative (2)</span><span className="hidden sm:inline">Majeure (3)</span><span>Cata. (4)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SCORE EN TEMPS RÉEL */}
            <div className="p-6 lg:p-10 bg-black/60 rounded-[3rem] flex flex-col sm:flex-row items-center justify-between border-2 border-white/5 shadow-inner backdrop-blur-md relative z-10 gap-6">
              <div className="text-center sm:text-left flex-1">
                <span className="text-xs font-black uppercase text-slate-500 tracking-[0.4em] italic m-0 block mb-4">Criticité (P x G)</span>
                <p className="text-[10px] text-slate-400 font-black italic uppercase tracking-widest flex items-center justify-center sm:justify-start gap-3 bg-white/5 w-fit mx-auto sm:mx-0 px-4 py-2 rounded-full border border-white/10 m-0">
                   <Activity size={14} className="text-amber-500" /> {getScoreLabel()}
                </p>
              </div>
              <div className={`text-6xl lg:text-8xl font-black italic transition-all duration-700 tracking-tighter w-32 h-32 lg:w-40 lg:h-40 rounded-[2.5rem] flex items-center justify-center border-2 shrink-0 ${getScoreColor()}`}>
                {form.RS_Probabilite * form.RS_Gravite}
              </div>
            </div>

            {/* BOUTONS */}
            <div className="flex flex-col sm:flex-row gap-6 relative z-10">
               <button type="submit" disabled={submitting} className="flex-1 py-6 lg:py-8 bg-amber-600 text-slate-950 rounded-4xl font-black uppercase italic text-sm lg:text-lg flex items-center justify-center gap-4 hover:bg-white transition-all shadow-[0_15px_40px_rgba(245,158,11,0.3)] cursor-pointer disabled:opacity-50 border-none tracking-[0.3em] lg:tracking-[0.5em] group/btn">
                 {submitting ? <Loader2 className="animate-spin text-slate-950" size={24} /> : <><Save size={24} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" /> Sceller Risque</>}
               </button>
               <button type="button" onClick={() => router.back()} className="sm:w-1/3 py-6 lg:py-8 bg-transparent text-slate-500 rounded-4xl font-black uppercase italic text-sm tracking-[0.3em] hover:text-white hover:bg-white/5 transition-all border-2 border-white/5 cursor-pointer">
                 Annuler
               </button>
            </div>
          </form>

          {/* ℹ️ PANNEAU LATÉRAL : MATRICE */}
          <aside className="flex-1 space-y-8 animate-in slide-in-from-right-10 duration-1000 w-full">
             <div className="bg-[#151A2D] border-2 border-amber-500/10 p-8 lg:p-10 rounded-[3rem] shadow-2xl backdrop-blur-md text-left relative overflow-hidden">
                <Info size={150} className="absolute -top-10 -right-10 text-amber-500 opacity-[0.03] pointer-events-none" />
                <h3 className="text-xl lg:text-2xl font-black uppercase italic text-amber-500 mb-8 flex items-center gap-4 leading-none tracking-tighter relative z-10 m-0">
                  <Info size={28} /> Matrice ISO 31000
                </h3>
                <div className="space-y-8 relative z-10">
                  <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase italic m-0">
                    Croisement de la <span className="text-white">Probabilité d&apos;occurrence</span> (P) et de la <span className="text-white">Gravité des conséquences</span> (G).
                  </p>
                  
                  <div className="space-y-4">
                     <div className="p-5 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-inner">
                        <h4 className="text-[10px] font-black uppercase text-red-500 tracking-[0.3em] mb-1 italic m-0">Score 12 à 16 : Inacceptable</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase italic m-0 leading-tight">Traitement immédiat requis. Plan d&apos;actions obligatoire.</p>
                     </div>
                     <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-inner">
                        <h4 className="text-[10px] font-black uppercase text-amber-500 tracking-[0.3em] mb-1 italic m-0">Score 8 à 9 : Majeur</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase italic m-0 leading-tight">Réduction du risque nécessaire via mitigation.</p>
                     </div>
                     <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
                        <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.3em] mb-1 italic m-0">Score 1 à 6 : Acceptable</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase italic m-0 leading-tight">Risque sous contrôle. Surveillance périodique.</p>
                     </div>
                  </div>
                </div>
             </div>
          </aside>
        </div>
      </div>
      
      <style jsx global>{`
        ::-webkit-scrollbar { width: 0px; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
    </div>
  );
}