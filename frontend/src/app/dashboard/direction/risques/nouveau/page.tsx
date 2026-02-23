/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : IDENTIFICATION ET ÉVALUATION DES RISQUES (§6.1 ISO 9001 / ISO 31000)
 * -------------------------------------------------------------------------
 * Rôle : Page souveraine permettant d'indexer une nouvelle menace/opportunité dans la Matrix.
 * Architecture : Multi-Tenant, liaison stricte avec l'API `/risks` et le référentiel SDE.
 * Consolidation :
 * 1. Transformation du mini-formulaire en une page Full-Space (ml-72).
 * 2. Restauration du champ "RS_Description" manquant dans l'UI d'origine.
 * 3. Panneau latéral d'aide à la cotation (Matrice d'acceptabilité).
 * 4. Redirection automatique vers le registre après scellage.
 * -------------------------------------------------------------------------
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

// --- 🏗️ TYPES STRICTS MATRIX SDE ---
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
  
  // --- 📦 ÉTATS SCELLÉS ---
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [processus, setProcessus] = useState<Processus[]>([]);
  
  const [form, setForm] = useState<RiskFormState>({
    RS_Libelle: '',
    RS_Probabilite: 1,
    RS_Gravite: 1,
    RS_ProcessusId: '',
    RS_Description: '' // Champ restauré et actif
  });

  /**
   * 📡 CHARGEMENT DU RÉFÉRENTIEL PROCESSUS (Moteur SDE)
   * Aucune donnée factice. Connexion stricte à la base de données du Tenant.
   */
  useEffect(() => {
    apiClient.get('/processus')
      .then(res => {
         const data = res.data?.data || res.data;
         setProcessus(Array.isArray(data) ? data : []);
      })
      .catch(err => {
         console.error("❌ Échec chargement processus SDE", err);
         toast.error("ÉCHEC KERNEL : IMPOSSIBLE DE CHARGER LES PROCESSUS.");
      })
      .finally(() => {
         setLoadingInitial(false);
      });
  }, []);

  /**
   * 💾 SOUMISSION SÉCURISÉE MATRIX
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.RS_ProcessusId) {
      toast.warning("ANOMALIE : LE RATTACHEMENT À UN PROCESSUS EST OBLIGATOIRE.");
      return;
    }

    setSubmitting(true);
    const tid = toast.loading("Scellage de la menace dans le registre SDE...");
    
    try {
      await apiClient.post('/risks', form);
      toast.success("RISQUE SCELLÉ AVEC SUCCÈS.", { id: tid });
      // Redirection vers le cockpit de direction ou le registre des risques
      router.push('/dashboard/direction');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR CRITIQUE DE SCELLAGE.", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 🎨 MOTEUR DE RENDU CHROMATIQUE SDE (SMI Score)
   * Calcule le niveau de criticité et ajuste le design en temps réel.
   */
  const getScoreColor = () => {
    const score = form.RS_Probabilite * form.RS_Gravite;
    if (score >= 12) return 'text-red-500 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)] bg-red-500/10 scale-105';
    if (score >= 8) return 'text-amber-500 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.2)] bg-amber-500/10';
    return 'text-emerald-500 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-emerald-500/10';
  };

  const getScoreLabel = () => {
    const score = form.RS_Probabilite * form.RS_Gravite;
    if (score >= 12) return 'RISQUE CRITIQUE (INACCEPTABLE)';
    if (score >= 8) return 'RISQUE MAJEUR (À TRAITER)';
    return 'RISQUE ACCEPTABLE (À SURVEILLER)';
  };

  if (loadingInitial) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-12">
      <Loader2 className="animate-spin text-blue-600" size={120} strokeWidth={1} />
      <p className="text-blue-500 font-black uppercase italic text-[14px] tracking-[1.5em] animate-pulse">
        Initialisation du Module Risques...
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-16 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="w-full max-w-500 mx-auto space-y-20 animate-in fade-in duration-1000">
        
        {/* 🔝 EN-TÊTE STRATÉGIQUE (§6.1) */}
        <header className="flex flex-col gap-8 border-b-4 border-white/5 pb-16">
          <div className="flex items-center gap-6 text-amber-500 bg-amber-500/5 w-fit px-8 py-3 rounded-full border border-amber-500/10 shadow-inner">
            <Fingerprint size={24} className="animate-pulse" />
            <span className="text-[12px] font-black uppercase tracking-[0.5em]">Protocole de risque</span>
          </div>
          <h1 className="text-8xl font-black uppercase italic tracking-tighter mb-4 flex items-center gap-10 leading-none text-white">
            <div className="p-8 bg-amber-600 rounded-[3rem] shadow-[0_0_50px_rgba(245,158,11,0.4)] text-white">
              <ShieldAlert size={64} strokeWidth={2.5}/>
            </div> 
            Identifier une <span className="text-amber-500">Menace</span>
          </h1>
          <p className="text-slate-500 font-black text-[14px] uppercase tracking-[1em] italic ml-36 opacity-60">
            DÉTECTION PROACTIVE • MATRICE D&apos;ACCEPTABILITÉ SDE
          </p>
        </header>

        {/* 🏛️ GRID PRINCIPALE : FORMULAIRE ET PANNEAU D'INFORMATION */}
        <div className="grid grid-cols-12 gap-20 items-start">
          
          {/* FORMULAIRE DE SAISIE SOUVERAIN */}
          <form onSubmit={handleSubmit} className="col-span-12 lg:col-span-8 bg-[#151A2D] p-24 rounded-[6rem] border-4 border-white/5 space-y-16 shadow-4xl backdrop-blur-3xl relative overflow-hidden text-left">
            
            {/* Filigrane Matrix */}
            <AlertTriangle size={400} className="absolute -bottom-16 -right-16 opacity-[0.02] text-amber-500 pointer-events-none" />

            {/* INTITULÉ DU RISQUE */}
            <div className="space-y-8 relative z-10">
              <label className="text-[14px] font-black uppercase text-slate-500 ml-8 tracking-[0.6em] italic leading-none flex items-center gap-5">
                <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.8)]"></span> Intitulé de la menace ou opportunité
              </label>
              <input 
                type="text" 
                required 
                placeholder="EX: RUPTURE DE LA CHAÎNE LOGISTIQUE GLOBALE..."
                className="w-full bg-black/40 border-4 border-white/5 p-12 rounded-[4rem] outline-none focus:border-amber-500 font-black italic transition-all text-white placeholder:text-slate-700 uppercase text-2xl tracking-widest shadow-inner"
                value={form.RS_Libelle} 
                onChange={e => setForm({...form, RS_Libelle: e.target.value.toUpperCase()})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
              {/* PROCESSUS IMPACTÉ */}
              <div className="space-y-8 text-left">
                <label className="text-[14px] font-black uppercase text-slate-500 ml-8 tracking-[0.6em] italic leading-none flex items-center gap-5">
                  <Target size={24} className="text-amber-500" /> Processus Impacté
                </label>
                <div className="relative">
                  <select 
                    required 
                    className="w-full bg-black/40 border-4 border-white/5 p-12 rounded-[3.5rem] outline-none focus:border-amber-500 font-black italic transition-all cursor-pointer text-white appearance-none uppercase text-lg shadow-inner"
                    value={form.RS_ProcessusId} 
                    onChange={e => setForm({...form, RS_ProcessusId: e.target.value})}
                  >
                    <option value="" className="text-slate-600">-- CHOISIR UN SEGMENT --</option>
                    {processus.map(p => (
                      <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0F172A] text-white">[{p.PR_Id.slice(0, 4)}] {p.PR_Libelle}</option>
                    ))}
                  </select>
                  <ChevronRight size={32} className="absolute right-10 top-1/2 -translate-y-1/2 text-amber-500 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* DESCRIPTION DÉTAILLÉE (RESTAURÉE) */}
              <div className="space-y-8 text-left">
                <label className="text-[14px] font-black uppercase text-slate-500 ml-8 tracking-[0.6em] italic leading-none flex items-center gap-5">
                  <AlignLeft size={24} className="text-amber-500" /> Description (Causes / Conséquences)
                </label>
                <textarea 
                  rows={3}
                  placeholder="Détailler le scénario du risque..."
                  className="w-full bg-black/40 border-4 border-white/5 p-10 rounded-[3.5rem] outline-none focus:border-amber-500 font-bold italic transition-all text-white placeholder:text-slate-700 text-lg shadow-inner resize-none"
                  value={form.RS_Description} 
                  onChange={e => setForm({...form, RS_Description: e.target.value})}
                />
              </div>
            </div>

            {/* CALCULATEUR P x G (Range Sliders Massive Design) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10 bg-black/20 p-12 rounded-[5rem] border-2 border-white/5 shadow-inner">
              <div className="space-y-10 text-left">
                <label className="text-[14px] font-black uppercase text-slate-400 flex justify-between px-6 italic tracking-[0.5em] leading-none items-center">
                  Probabilité (P) 
                  <span className="text-amber-500 text-3xl font-black italic tracking-tighter bg-amber-500/10 px-6 py-2 rounded-2xl border border-amber-500/20">{form.RS_Probabilite}/4</span>
                </label>
                <div className="px-4">
                  <input 
                      type="range" min="1" max="4" step="1" 
                      className="w-full h-4 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all shadow-inner"
                      value={form.RS_Probabilite} 
                      onChange={e => setForm({...form, RS_Probabilite: parseInt(e.target.value)})}
                  />
                  <div className="flex justify-between mt-6 text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">
                    <span>Rare (1)</span><span>Improbable (2)</span><span>Probable (3)</span><span>Fréquent (4)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-10 text-left">
                <label className="text-[14px] font-black uppercase text-slate-400 flex justify-between px-6 italic tracking-[0.5em] leading-none items-center">
                  Gravité (G)
                  <span className="text-amber-500 text-3xl font-black italic tracking-tighter bg-amber-500/10 px-6 py-2 rounded-2xl border border-amber-500/20">{form.RS_Gravite}/4</span>
                </label>
                <div className="px-4">
                  <input 
                      type="range" min="1" max="4" step="1" 
                      className="w-full h-4 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all shadow-inner"
                      value={form.RS_Gravite} 
                      onChange={e => setForm({...form, RS_Gravite: parseInt(e.target.value)})}
                  />
                  <div className="flex justify-between mt-6 text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">
                    <span>Mineure (1)</span><span>Significative (2)</span><span>Majeure (3)</span><span>Catastrophique (4)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SCORE DE CRITICITÉ EN TEMPS RÉEL */}
            <div className="p-16 bg-black/60 rounded-[4rem] flex flex-col md:flex-row items-center justify-between border-4 border-white/5 shadow-inner backdrop-blur-md relative z-10 gap-10">
              <div className="text-left flex-1">
                <span className="text-[14px] font-black uppercase text-slate-500 tracking-[0.6em] italic leading-none block mb-6">Criticité calculée (Score PxG)</span>
                <p className="text-[12px] text-slate-400 font-black italic uppercase mt-2 tracking-[0.4em] flex items-center gap-4 bg-white/5 w-fit px-6 py-3 rounded-full border border-white/10">
                   <Activity size={16} className="text-amber-500" /> {getScoreLabel()}
                </p>
              </div>
              <div className={`text-9xl font-black italic transition-all duration-700 tracking-tighter w-48 h-48 rounded-[3rem] flex items-center justify-center border-4 ${getScoreColor()}`}>
                {form.RS_Probabilite * form.RS_Gravite}
              </div>
            </div>

            {/* ACTIONS SOUVERAINES */}
            <div className="flex gap-12 relative z-10">
               <button 
                 type="submit" 
                 disabled={submitting}
                 className="flex-2 py-12 bg-amber-600 text-slate-950 rounded-[4rem] font-black uppercase italic text-2xl flex items-center justify-center gap-8 hover:bg-white transition-all shadow-[0_30px_80px_rgba(245,158,11,0.4)] cursor-pointer disabled:opacity-50 border-none tracking-[0.6em] group/btn active:scale-95"
               >
                 {submitting ? <Loader2 className="animate-spin text-slate-950" size={36} /> : <><Save size={36} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" /> Sceller le Risque</>}
               </button>
               <button 
                  type="button" 
                  onClick={() => router.back()} 
                  className="flex-1 py-12 bg-transparent text-slate-500 rounded-[4rem] font-black uppercase italic text-xl tracking-[0.4em] hover:text-white hover:bg-white/5 transition-all border-4 border-white/5 cursor-pointer"
               >
                  Annuler
               </button>
            </div>
          </form>

          {/* ℹ️ PANNEAU LATÉRAL : MATRICE D'ACCEPTABILITÉ ISO 31000 */}
          <aside className="col-span-12 lg:col-span-4 space-y-16 animate-in slide-in-from-right-10 duration-1000">
             <div className="bg-[#151A2D] border-4 border-amber-500/10 p-16 rounded-[6rem] shadow-4xl backdrop-blur-md text-left relative overflow-hidden">
                <Info size={250} className="absolute -top-10 -right-10 text-amber-500 opacity-[0.03]" />
                <h3 className="text-3xl font-black uppercase italic text-amber-500 mb-12 flex items-center gap-6 leading-none tracking-tighter relative z-10">
                  <Info size={40} /> Matrice ISO 31000
                </h3>
                <div className="space-y-12 relative z-10">
                  <p className="text-[16px] font-bold text-slate-300 leading-relaxed uppercase italic opacity-80">
                    L&apos;évaluation du risque repose sur le croisement de la <span className="text-white">Probabilité d&apos;occurrence</span> (P) et de la <span className="text-white">Gravité des conséquences</span> (G).
                  </p>
                  
                  <div className="space-y-6">
                     <div className="p-8 bg-red-500/10 rounded-[2.5rem] border-2 border-red-500/20 shadow-inner">
                        <h4 className="text-[12px] font-black uppercase text-red-500 tracking-[0.4em] mb-2 italic">Score 12 à 16 : Inacceptable</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase italic">Traitement immédiat requis. Plan d&apos;actions correctives obligatoire.</p>
                     </div>
                     <div className="p-8 bg-amber-500/10 rounded-[2.5rem] border-2 border-amber-500/20 shadow-inner">
                        <h4 className="text-[12px] font-black uppercase text-amber-500 tracking-[0.4em] mb-2 italic">Score 8 à 9 : Majeur</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase italic">Réduction du risque nécessaire via des mesures de mitigation.</p>
                     </div>
                     <div className="p-8 bg-emerald-500/10 rounded-[2.5rem] border-2 border-emerald-500/20 shadow-inner">
                        <h4 className="text-[12px] font-black uppercase text-emerald-500 tracking-[0.4em] mb-2 italic">Score 1 à 6 : Acceptable</h4>
                        <p className="text-[11px] font-bold text-slate-400 uppercase italic">Risque sous contrôle. Surveillance périodique suffisante.</p>
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