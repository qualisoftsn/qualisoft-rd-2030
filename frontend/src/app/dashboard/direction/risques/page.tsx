/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 IDENTIFICATION RAPIDE DES RISQUES SDE (§6.1 ISO 9001)
 * -------------------------------------------------------------------------
 * Rôle : Formulaire contextuel permettant d'injecter un risque dans la Matrix.
 * Architecture : Liaison stricte avec API /risks et référentiel Processus.
 * Design : Cockpit compact, sliders réactifs, criticité temps réel.
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { Save, AlertTriangle, Loader2, Target, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

// --- TYPES STRICTS MATRIX SDE ---
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

interface QuickRiskFormProps {
  onRiskCreated: () => void;
}

export default function QuickRiskForm({ onRiskCreated }: QuickRiskFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [processus, setProcessus] = useState<Processus[]>([]);
  const [form, setForm] = useState<RiskFormState>({
    RS_Libelle: '',
    RS_Probabilite: 1,
    RS_Gravite: 1,
    RS_ProcessusId: '',
    RS_Description: ''
  });

  /**
   * 📡 CHARGEMENT DES PROCESSUS MÉTIERS SDE
   */
  useEffect(() => {
    apiClient.get('/processus')
      .then(res => {
         const data = res.data?.data || res.data;
         setProcessus(Array.isArray(data) ? data : []);
      })
      .catch(err => {
         console.error("❌ Échec chargement processus SDE", err);
         toast.error("ÉCHEC DE LIAISON : PROCESSUS INACCESSIBLES.");
      });
  }, []);

  /**
   * 💾 SOUMISSION SÉCURISÉE MATRIX
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.RS_ProcessusId) {
      toast.warning("ANOMALIE DE SAISIE : VEUILLEZ DÉFINIR LE PROCESSUS CIBLE.");
      return;
    }

    setLoading(true);
    const tid = toast.loading("Scellage du risque dans le noyau SDE...");
    try {
      await apiClient.post('/risks', form);
      // Reset atomique du formulaire
      setForm({ RS_Libelle: '', RS_Probabilite: 1, RS_Gravite: 1, RS_ProcessusId: '', RS_Description: '' });
      onRiskCreated(); // Notification au composant parent
      toast.success("RISQUE SCELLÉ DANS LE REGISTRE MATRIX.", { id: tid });
    } catch (err) {
      toast.error("ERREUR CRITIQUE DE SCELLAGE.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎨 MOTEUR DE RENDU CHROMATIQUE SDE (SMI Score)
   */
  const getScoreColor = () => {
    const score = form.RS_Probabilite * form.RS_Gravite;
    if (score >= 12) return 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-110';
    if (score >= 8) return 'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    return 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#151A2D] p-16 rounded-[5rem] border-4 border-white/5 space-y-12 shadow-4xl italic backdrop-blur-3xl group text-left relative overflow-hidden">
      
      {/* Filigrane Matrix */}
      <AlertTriangle size={300} className="absolute -bottom-10 -right-10 opacity-[0.03] text-blue-500 pointer-events-none" />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="text-4xl font-black uppercase italic flex items-center gap-6 tracking-tighter text-white leading-none">
          <div className="p-4 bg-black/40 rounded-3xl border-2 border-white/5 shadow-inner"><AlertTriangle className="text-blue-500 group-hover:scale-110 transition-transform" size={32} /></div>
          Identifier un Risque
        </h3>
        <span className="px-6 py-2 bg-black/40 border-2 border-white/5 rounded-3xl text-[10px] font-black text-slate-500 tracking-[0.4em] italic uppercase shadow-inner">
          ISO 31000 Compliance
        </span>
      </div>

      {/* INTITULÉ DU RISQUE */}
      <div className="space-y-6 relative z-10 text-left">
        <label className="text-[12px] font-black uppercase text-slate-500 ml-6 tracking-[0.5em] italic leading-none flex items-center gap-4">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span> Intitulé du danger (Menace)
        </label>
        <input 
          type="text" 
          required 
          placeholder="EX: RUPTURE DE LA CHAÎNE LOGISTIQUE"
          className="w-full bg-black/60 border-4 border-white/5 p-10 rounded-[3rem] outline-none focus:border-blue-600 font-black italic transition-all text-white placeholder:text-slate-700 uppercase text-xl tracking-widest shadow-inner"
          value={form.RS_Libelle} 
          onChange={e => setForm({...form, RS_Libelle: e.target.value.toUpperCase()})}
        />
      </div>

      {/* PROCESSUS IMPACTÉ */}
      <div className="space-y-6 relative z-10 text-left">
        <label className="text-[12px] font-black uppercase text-slate-500 ml-6 tracking-[0.5em] italic leading-none flex items-center gap-4">
           <Target size={16} className="text-blue-600" /> Processus Impacté
        </label>
        <div className="relative">
          <select 
            required 
            className="w-full bg-black/60 border-4 border-white/5 p-10 rounded-[3rem] outline-none focus:border-blue-600 font-black italic transition-all cursor-pointer text-white appearance-none uppercase text-lg shadow-inner"
            value={form.RS_ProcessusId} 
            onChange={e => setForm({...form, RS_ProcessusId: e.target.value})}
          >
            <option value="" className="text-slate-600">-- SÉLECTIONNER UN AXE MÉTIER --</option>
            {processus.map(p => (
              <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0F172A] text-white">[{p.PR_Id.slice(0, 4)}] {p.PR_Libelle}</option>
            ))}
          </select>
          <ChevronRight size={28} className="absolute right-8 top-1/2 -translate-y-1/2 text-blue-600 rotate-90 pointer-events-none" />
        </div>
      </div>

      {/* CALCULATEUR P x G (Range Sliders) */}
      <div className="grid grid-cols-2 gap-12 relative z-10">
        <div className="space-y-6 text-left bg-black/40 p-8 rounded-[3rem] border-2 border-white/5 shadow-inner">
          <label className="text-[12px] font-black uppercase text-slate-400 flex justify-between px-4 italic tracking-[0.4em] leading-none">
            Probabilité <span className="text-white text-xl font-black italic tracking-tighter bg-white/5 px-4 py-1 rounded-xl">{form.RS_Probabilite}/4</span>
          </label>
          <div className="px-2">
            <input 
                type="range" min="1" max="4" step="1" 
                className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-400 transition-all shadow-inner"
                value={form.RS_Probabilite} 
                onChange={e => setForm({...form, RS_Probabilite: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-6 text-left bg-black/40 p-8 rounded-[3rem] border-2 border-white/5 shadow-inner">
          <label className="text-[12px] font-black uppercase text-slate-400 flex justify-between px-4 italic tracking-[0.4em] leading-none">
            Gravité <span className="text-white text-xl font-black italic tracking-tighter bg-white/5 px-4 py-1 rounded-xl">{form.RS_Gravite}/4</span>
          </label>
          <div className="px-2">
            <input 
                type="range" min="1" max="4" step="1" 
                className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-400 transition-all shadow-inner"
                value={form.RS_Gravite} 
                onChange={e => setForm({...form, RS_Gravite: parseInt(e.target.value)})}
            />
          </div>
        </div>
      </div>

      {/* SCORE DE CRITICITÉ EN TEMPS RÉEL */}
      <div className="p-10 bg-black/60 rounded-[3rem] flex items-center justify-between border-4 border-white/5 shadow-inner backdrop-blur-md relative z-10">
        <div className="text-left">
          <span className="text-[12px] font-black uppercase text-slate-500 tracking-[0.5em] italic leading-none block mb-3">Criticité calculée</span>
          <p className="text-[10px] text-slate-600 font-black italic uppercase mt-1 tracking-widest flex items-center gap-3">
             <Target size={12} className="text-blue-600" /> Matrice d&apos;acceptabilité
          </p>
        </div>
        <div className={`text-8xl font-black italic transition-all duration-500 tracking-tighter bg-white/5 w-32 h-32 rounded-4xl flex items-center justify-center border-2 border-white/10 ${getScoreColor()}`}>
          {form.RS_Probabilite * form.RS_Gravite}
        </div>
      </div>

      {/* BOUTON D'ACTION SOUVERAIN */}
      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-10 bg-blue-600 text-white rounded-[3.5rem] font-black uppercase italic text-xl flex items-center justify-center gap-6 hover:bg-white hover:text-blue-600 transition-all shadow-[0_30px_80px_rgba(37,99,235,0.4)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none tracking-[0.6em] group/btn active:scale-95 relative z-10"
      >
        {loading ? <Loader2 className="animate-spin" size={32} /> : <><Save size={32} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" /> Valider</>}
      </button>
    </form>
  );
}