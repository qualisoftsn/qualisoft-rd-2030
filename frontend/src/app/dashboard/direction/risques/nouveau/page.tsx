/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : IDENTIFICATION ET ÉVALUATION DES RISQUES (§6.1 ISO 9001 / ISO 31000)
 * -------------------------------------------------------------------------
 * RÔLE : Page souveraine permettant d'indexer une nouvelle menace/opportunité.
 * FIX : Layout ClickUp 100dvh, Zéro Scroll Global, Matrix Scoring Dynamique.
 * SÉCURITÉ : Souveraineté API (Zéro NextAuth), Validation Matrix SDE.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 01:22 GMT
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Save, AlertTriangle, Loader2, Target, 
  ChevronRight, AlignLeft, Activity, Info, 
  ShieldAlert, Fingerprint, ArrowLeft
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- TYPES ---
interface Processus { PR_Id: string; PR_Libelle: string; }

export default function NouveauRisquePage() {
  const router = useRouter();
  
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [processus, setProcessus] = useState<Processus[]>([]);
  
  const [form, setForm] = useState({
    RS_Libelle: '', 
    RS_Probabilite: 1, 
    RS_Gravite: 1, 
    RS_ProcessusId: '', 
    RS_Description: ''
  });

  // --- CHARGEMENT RÉFÉRENTIEL ---
  useEffect(() => {
    apiClient.get('/processus')
      .then(res => {
          const data = res.data?.data || res.data;
          setProcessus(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("ÉCHEC KERNEL : RÉFÉRENTIEL PROCESSUS INACCESSIBLE."))
      .finally(() => setLoadingInitial(false));
  }, []);

  // --- LOGIQUE DE SCORING SDE ---
  const score = useMemo(() => form.RS_Probabilite * form.RS_Gravite, [form.RS_Probabilite, form.RS_Gravite]);

  const matrixConfig = useMemo(() => {
    if (score >= 12) return { 
      label: 'CRITIQUE (INACCEPTABLE)', 
      color: 'text-red-500', 
      border: 'border-red-500/50', 
      bg: 'bg-red-500/10',
      glow: 'shadow-[0_0_40px_rgba(239,68,68,0.2)]'
    };
    if (score >= 8) return { 
      label: 'MAJEUR (À TRAITER)', 
      color: 'text-amber-500', 
      border: 'border-amber-500/50', 
      bg: 'bg-amber-500/10',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]'
    };
    return { 
      label: 'ACCEPTABLE (SOUS SURVEILLANCE)', 
      color: 'text-emerald-500', 
      border: 'border-emerald-500/50', 
      bg: 'bg-emerald-500/10',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]'
    };
  }, [score]);

  // --- SCELLAGE DOCUMENTAIRE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.RS_ProcessusId) return toast.warning("RATEMENT DE PROCESSUS OBLIGATOIRE.");

    setSubmitting(true);
    const tid = toast.loading("Scellage de la menace dans le registre Matrix...");
    
    try {
      await apiClient.post('/risks', form);
      toast.success("MENACE SCELLÉE AVEC SUCCÈS DANS LE SMI.", { id: tid });
      router.push('/dashboard/direction');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR CRITIQUE DE SCELLAGE.", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-600 mb-6" size={60} strokeWidth={1} />
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[1em] animate-pulse">Initialisation Matrix v3.0...</p>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans overflow-hidden flex flex-col selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER SOUVERAIN */}
      <header className="shrink-0 p-6 md:px-10 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 flex flex-col md:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
             <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-500 hover:text-white border-none cursor-pointer"><ArrowLeft size={20}/></button>
             <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-full">SMI Protocol §6.1</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic m-0 leading-none">
            Indexer une <span className="text-amber-500">Menace</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 italic">
          <ShieldAlert size={20} className="text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analyse de Criticité ISO 31000</span>
        </div>
      </header>

      {/* 📜 ZONE DE TRAVAIL (Isolated Scroll) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-12 items-start h-full">
          
          {/* FORMULAIRE ELITE */}
          <form onSubmit={handleSubmit} className="flex-2 w-full bg-[#151B2B] p-8 lg:p-12 rounded-[3.5rem] border-2 border-white/5 space-y-12 shadow-4xl relative overflow-hidden group">
            <Fingerprint size={300} className="absolute -bottom-20 -right-20 opacity-[0.02] text-amber-500 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />

            {/* Identification */}
            <div className="space-y-4 relative z-10">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-[0.4em] flex items-center gap-2">
                <Target size={14} className="text-amber-500" /> Libellé du Risque Stratégique
              </label>
              <input 
                required
                value={form.RS_Libelle}
                onChange={e => setForm({...form, RS_Libelle: e.target.value.toUpperCase()})}
                placeholder="EX: DÉFAILLANCE CRITIQUE DU SERVEUR MASTER SDE..."
                className="w-full bg-black/40 border-2 border-white/10 p-6 lg:p-8 rounded-4xl outline-none focus:border-amber-500 font-black italic transition-all text-white placeholder:text-slate-800 uppercase text-lg lg:text-2xl shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-[0.4em]">Rattachement Processus</label>
                <div className="relative">
                  <select 
                    required 
                    value={form.RS_ProcessusId} 
                    onChange={e => setForm({...form, RS_ProcessusId: e.target.value})}
                    className="w-full bg-black/40 border-2 border-white/10 p-6 rounded-3xl outline-none focus:border-amber-500 font-black italic text-white appearance-none uppercase text-xs cursor-pointer shadow-inner"
                  >
                    <option value="">-- SÉLECTIONNER UN AXE --</option>
                    {processus.map(p => <option key={p.PR_Id} value={p.PR_Id}>[{p.PR_Id.slice(0,4)}] {p.PR_Libelle}</option>)}
                  </select>
                  <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-amber-500 rotate-90 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-[0.4em]">Description des causes</label>
                <textarea 
                  rows={1}
                  value={form.RS_Description}
                  onChange={e => setForm({...form, RS_Description: e.target.value})}
                  className="w-full bg-black/40 border-2 border-white/10 p-6 rounded-3xl outline-none focus:border-amber-500 font-bold italic text-white text-xs resize-none shadow-inner"
                  placeholder="Scénario Red-Team..."
                />
              </div>
            </div>

            {/* Matrix Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-black/20 p-8 rounded-[3rem] border border-white/5 relative z-10">
               <div className="space-y-6">
                 <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase italic">Probabilité (P)</span>
                    <span className="text-xl font-black italic text-amber-500 bg-amber-500/10 px-3 py-1 rounded-xl">{form.RS_Probabilite}</span>
                 </div>
                 <input 
                  type="range" min="1" max="4" step="1" 
                  value={form.RS_Probabilite}
                  onChange={e => setForm({...form, RS_Probabilite: parseInt(e.target.value)})}
                  className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500" 
                 />
                 <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase italic"><span>RARE</span><span>FRÉQUENT</span></div>
               </div>
               <div className="space-y-6">
                 <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase italic">Gravité (G)</span>
                    <span className="text-xl font-black italic text-amber-500 bg-amber-500/10 px-3 py-1 rounded-xl">{form.RS_Gravite}</span>
                 </div>
                 <input 
                  type="range" min="1" max="4" step="1" 
                  value={form.RS_Gravite}
                  onChange={e => setForm({...form, RS_Gravite: parseInt(e.target.value)})}
                  className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500" 
                 />
                 <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase italic"><span>MINEUR</span><span>CATASTROPHIQUE</span></div>
               </div>
            </div>

            {/* Real-time Result */}
            <div className={`p-8 lg:p-12 rounded-[4rem] border-2 transition-all duration-700 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 ${matrixConfig.bg} ${matrixConfig.border} ${matrixConfig.glow}`}>
               <div className="text-center md:text-left flex-1">
                 <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] block mb-4 italic">Résultat Criticité Brut</span>
                 <p className={`text-2xl lg:text-3xl font-black uppercase italic m-0 tracking-tighter ${matrixConfig.color}`}>
                   {matrixConfig.label}
                 </p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase italic mt-3 flex items-center justify-center md:justify-start gap-2">
                   <Activity size={12} className={matrixConfig.color} /> Conforme au protocole ISO 31000:2018
                 </p>
               </div>
               <div className={`w-32 h-32 lg:w-44 lg:h-44 rounded-[2.5rem] bg-black/40 border-2 flex items-center justify-center text-7xl lg:text-9xl font-black italic tracking-tighter shadow-2xl transition-all ${matrixConfig.color} ${matrixConfig.border}`}>
                 {score}
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 relative z-10">
              <button 
                type="submit" 
                disabled={submitting}
                className="flex-1 py-8 bg-amber-600 hover:bg-white hover:text-amber-600 text-slate-950 rounded-[2.5rem] font-black uppercase italic text-lg lg:text-2xl flex items-center justify-center gap-6 transition-all shadow-[0_20px_60px_rgba(245,158,11,0.3)] cursor-pointer border-none tracking-[0.5em] active:scale-95 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={32} /> : <><Save size={32} strokeWidth={3} /> Sceller dans la Matrix</>}
              </button>
              <button 
                type="button"
                onClick={() => router.back()}
                className="sm:w-1/3 py-8 bg-transparent text-slate-600 rounded-[2.5rem] font-black uppercase italic text-sm tracking-[0.3em] hover:text-white hover:bg-white/5 transition-all border-2 border-white/5 cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </form>

          {/* ASIDE INFO (ClickUp SidePanel Style) */}
          <aside className="w-full xl:w-96 space-y-8 shrink-0">
             <div className="bg-[#151B2B] border-2 border-white/5 p-10 rounded-[3rem] shadow-4xl relative overflow-hidden text-left">
                <Info size={150} className="absolute -top-10 -right-10 text-white opacity-[0.03]" />
                <h3 className="text-xl font-black uppercase italic text-amber-500 mb-8 flex items-center gap-4 m-0 leading-none">
                  <Info size={24} /> Aide Matrix
                </h3>
                <div className="space-y-10 relative z-10">
                   <p className="text-[10px] font-bold text-slate-400 italic uppercase leading-loose m-0">
                     Le scellage d&apos;un risque critique (12+) déclenche immédiatement une notification <span className="text-white underline decoration-rose-500 decoration-2 underline-offset-4">URGENCE CODIR</span>.
                   </p>
                   
                   

                   <div className="space-y-6">
                      <LegendBox color="bg-red-500" label="12 - 16 : INACCEPTABLE" desc="Arrêt ou mesures drastiques immédiates." />
                      <LegendBox color="bg-amber-500" label="8 - 9 : MAJEUR" desc="Plan d'action requis sous 15 jours." />
                      <LegendBox color="bg-emerald-500" label="1 - 6 : ACCEPTABLE" desc="Surveillance simple via tableau de bord." />
                   </div>
                </div>
             </div>

             <div className="bg-blue-600/10 border-2 border-blue-600/20 p-8 rounded-[2.5rem] flex items-center gap-4">
                <ShieldCheck size={40} className="text-blue-500 shrink-0" />
                <p className="text-[9px] font-black uppercase italic text-blue-400 m-0">Signature numérique SDE apposée à chaque indexation.</p>
             </div>
          </aside>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.2); border-radius: 10px; }` }} />
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

const LegendBox = ({ color, label, desc }: any) => (
  <div className="flex items-start gap-4">
    <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${color} shadow-lg`} />
    <div>
      <p className="text-[10px] font-black text-white uppercase italic m-0 leading-none">{label}</p>
      <p className="text-[8px] font-bold text-slate-500 uppercase italic mt-1.5 m-0 leading-tight">{desc}</p>
    </div>
  </div>
);

const ShieldCheck = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);