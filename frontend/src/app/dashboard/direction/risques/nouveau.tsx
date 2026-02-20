/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 IDENTIFICATION RAPIDE DES RISQUES (§6.1 ISO 9001)
 * ---------------------------------------------------
 * Rôle : Formulaire contextuel permettant d'injecter un risque dans la Matrix en 3 clics.
 * Design : Glassmorphism compact, sliders réactifs, calcul dynamique de criticité.
 */

'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { Save, AlertTriangle, Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';

// --- TYPES STRICTS ---
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
   * 📡 CHARGEMENT DES PROCESSUS MÉTIERS
   */
  useEffect(() => {
    apiClient.get<Processus[]>('/processus')
      .then(res => setProcessus(res.data))
      .catch(err => {
         console.error("❌ Échec chargement processus", err);
         toast.error("Lien Matrix interrompu : Impossible de charger les processus.");
      });
  }, []);

  /**
   * 💾 SOUMISSION SÉCURISÉE
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.RS_ProcessusId) {
      toast.warning("Champ requis : Veuillez isoler le processus impacté.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/risks', form);
      // Reset atomique du formulaire
      setForm({ RS_Libelle: '', RS_Probabilite: 1, RS_Gravite: 1, RS_ProcessusId: '', RS_Description: '' });
      onRiskCreated(); // Notification au parent pour re-calcul des Heatmaps
      toast.success("Risque indexé dans le registre SMI.");
    } catch (err) {
      console.error(err);
      toast.error("Erreur d'écriture Matrix : Validation échouée.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🎨 MOTEUR DE RENDU CHROMATIQUE (Score Color)
   */
  const getScoreColor = () => {
    const score = form.RS_Probabilite * form.RS_Gravite;
    if (score >= 12) return 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]';
    if (score >= 8) return 'text-orange-500';
    return 'text-emerald-500';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/60 p-10 rounded-[3rem] border border-white/10 space-y-8 shadow-2xl italic backdrop-blur-xl group">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-2xl font-black uppercase italic flex items-center gap-3 tracking-tighter text-white leading-none">
          <AlertTriangle className="text-blue-500 group-hover:scale-110 transition-transform" /> Identifier un Risque
        </h3>
        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-slate-500 tracking-[0.3em] italic uppercase">ISO 31000 Compliance</span>
      </div>

      {/* INTITULÉ DU RISQUE */}
      <div className="space-y-3 text-left">
        <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest italic leading-none">Intitulé du danger (Menace)</label>
        <input 
          type="text" 
          required 
          placeholder="EX: RUPTURE DE LA CHAÎNE LOGISTIQUE"
          className="w-full bg-black/20 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 font-black italic transition-all text-white placeholder:text-slate-700 uppercase"
          value={form.RS_Libelle} 
          onChange={e => setForm({...form, RS_Libelle: e.target.value})}
        />
      </div>

      {/* PROCESSUS IMPACTÉ */}
      <div className="space-y-3 text-left">
        <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest italic leading-none">Processus Impacté</label>
        <div className="relative">
          <select 
            required 
            className="w-full bg-[#0F172A] border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 font-black italic transition-all cursor-pointer text-white appearance-none uppercase"
            value={form.RS_ProcessusId} 
            onChange={e => setForm({...form, RS_ProcessusId: e.target.value})}
          >
            <option value="" className="text-slate-500">-- SÉLECTIONNER UN AXE MÉTIER --</option>
            {processus.map(p => (
              <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0F172A] text-white">{p.PR_Libelle}</option>
            ))}
          </select>
          <Target size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
        </div>
      </div>

      {/* CALCULATEUR P x G (Range Sliders) */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4 text-left">
          <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between px-2 italic tracking-widest leading-none">
            Probabilité <span className="text-white text-sm font-black italic tracking-tighter">{form.RS_Probabilite}/4</span>
          </label>
          <input 
            type="range" min="1" max="4" step="1" 
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-400 transition-all"
            value={form.RS_Probabilite} 
            onChange={e => setForm({...form, RS_Probabilite: parseInt(e.target.value)})}
          />
        </div>
        <div className="space-y-4 text-left">
          <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between px-2 italic tracking-widest leading-none">
            Gravité <span className="text-white text-sm font-black italic tracking-tighter">{form.RS_Gravite}/4</span>
          </label>
          <input 
            type="range" min="1" max="4" step="1" 
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-400 transition-all"
            value={form.RS_Gravite} 
            onChange={e => setForm({...form, RS_Gravite: parseInt(e.target.value)})}
          />
        </div>
      </div>

      {/* SCORE DE CRITICITÉ EN TEMPS RÉEL */}
      <div className="p-6 bg-white/5 rounded-3xl flex items-center justify-between border border-white/5 shadow-inner backdrop-blur-md">
        <div className="text-left">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic leading-none">Criticité calculée (SMI Score)</span>
          <p className="text-[9px] text-slate-600 font-black italic uppercase mt-1 tracking-widest">Matrice d&apos;acceptabilité Qualisoft</p>
        </div>
        <div className={`text-5xl font-black italic transition-all duration-500 tracking-tighter ${getScoreColor()}`}>
          {form.RS_Probabilite * form.RS_Gravite}
        </div>
      </div>

      {/* BOUTON D'ACTION SOUVERAIN */}
      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase italic text-xs flex items-center justify-center gap-4 hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none tracking-[0.2em] group/btn"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} className="group-hover/btn:rotate-12 transition-transform" /> Indexer le Risque</>}
      </button>
    </form>
  );
}