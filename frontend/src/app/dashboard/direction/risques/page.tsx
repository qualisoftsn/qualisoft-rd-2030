/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 IDENTIFICATION RAPIDE DES RISQUES SDE (§6.1 ISO 9001)
 * -------------------------------------------------------------------------
 * Rôle : Formulaire contextuel permettant d'injecter un risque dans la Matrix.
 * Fix : Ajustement du dimensionnement excessif, sécurisation apiClient.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 01:59 GMT
 */

'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { Save, AlertTriangle, Loader2, Target, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

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
    RS_Libelle: '', RS_Probabilite: 1, RS_Gravite: 1, RS_ProcessusId: '', RS_Description: ''
  });

  useEffect(() => {
    apiClient.get('/processus')
      .then(res => {
         const data = res.data?.data || res.data;
         setProcessus(Array.isArray(data) ? data : []);
      })
      .catch(() => toast.error("ÉCHEC DE LIAISON : PROCESSUS INACCESSIBLES."));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.RS_ProcessusId) return toast.warning("VEUILLEZ DÉFINIR LE PROCESSUS CIBLE.");

    setLoading(true);
    const tid = toast.loading("Scellage du risque dans le noyau SDE...");
    try {
      await apiClient.post('/risks', form);
      setForm({ RS_Libelle: '', RS_Probabilite: 1, RS_Gravite: 1, RS_ProcessusId: '', RS_Description: '' });
      onRiskCreated();
      toast.success("RISQUE SCELLÉ DANS LE REGISTRE MATRIX.", { id: tid });
    } catch (err) {
      toast.error("ERREUR CRITIQUE DE SCELLAGE.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = () => {
    const score = form.RS_Probabilite * form.RS_Gravite;
    if (score >= 12) return 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-105 border-red-500/30';
    if (score >= 8) return 'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] border-amber-500/30';
    return 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] border-emerald-500/30';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#151A2D] p-8 md:p-12 rounded-[3rem] border-2 border-white/5 space-y-10 shadow-2xl italic backdrop-blur-3xl group text-left relative overflow-hidden">
      <AlertTriangle size={200} className="absolute -bottom-10 -right-10 opacity-[0.03] text-blue-500 pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 relative z-10">
        <h3 className="text-2xl md:text-3xl font-black uppercase italic flex items-center gap-4 tracking-tighter text-white leading-none m-0">
          <div className="p-3 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
            <AlertTriangle className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
          </div>
          Identifier un Risque
        </h3>
        <span className="px-4 py-2 bg-black/40 border border-white/5 rounded-full text-[9px] font-black text-slate-500 tracking-[0.4em] italic uppercase shadow-inner whitespace-nowrap">
          ISO 31000 Compliance
        </span>
      </div>

      <div className="space-y-4 relative z-10 text-left">
        <label className="text-[10px] md:text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.4em] italic flex items-center gap-3 m-0">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" /> Menace identifiée
        </label>
        <input 
          type="text" required placeholder="EX: RUPTURE DE LA CHAÎNE LOGISTIQUE"
          className="w-full bg-black/60 border-2 border-white/5 p-6 rounded-4xl outline-none focus:border-blue-600 font-black italic transition-all text-white placeholder:text-slate-700 uppercase text-sm md:text-base tracking-widest shadow-inner"
          value={form.RS_Libelle} onChange={e => setForm({...form, RS_Libelle: e.target.value.toUpperCase()})}
        />
      </div>

      <div className="space-y-4 relative z-10 text-left">
        <label className="text-[10px] md:text-xs font-black uppercase text-slate-500 ml-4 tracking-[0.4em] italic flex items-center gap-3 m-0">
           <Target size={14} className="text-blue-600" /> Processus Impacté
        </label>
        <div className="relative">
          <select required className="w-full bg-black/60 border-2 border-white/5 p-6 rounded-4xl outline-none focus:border-blue-600 font-black italic transition-all cursor-pointer text-white appearance-none uppercase text-sm shadow-inner" value={form.RS_ProcessusId} onChange={e => setForm({...form, RS_ProcessusId: e.target.value})}>
            <option value="" className="text-slate-600">-- SÉLECTIONNER UN AXE MÉTIER --</option>
            {processus.map(p => <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0F172A] text-white">[{p.PR_Id.slice(0, 4)}] {p.PR_Libelle}</option>)}
          </select>
          <ChevronRight size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-600 rotate-90 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
        <div className="space-y-4 text-left bg-black/40 p-6 rounded-4xl border border-white/5 shadow-inner">
          <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between px-2 italic tracking-[0.3em] items-center m-0">
            Probabilité <span className="text-white text-base font-black italic bg-white/5 px-3 py-1 rounded-lg">{form.RS_Probabilite}/4</span>
          </label>
          <input type="range" min="1" max="4" step="1" className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-400 transition-all shadow-inner" value={form.RS_Probabilite} onChange={e => setForm({...form, RS_Probabilite: parseInt(e.target.value)})} />
        </div>

        <div className="space-y-4 text-left bg-black/40 p-6 rounded-4xl border border-white/5 shadow-inner">
          <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between px-2 italic tracking-[0.3em] items-center m-0">
            Gravité <span className="text-white text-base font-black italic bg-white/5 px-3 py-1 rounded-lg">{form.RS_Gravite}/4</span>
          </label>
          <input type="range" min="1" max="4" step="1" className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-400 transition-all shadow-inner" value={form.RS_Gravite} onChange={e => setForm({...form, RS_Gravite: parseInt(e.target.value)})} />
        </div>
      </div>

      <div className="p-6 md:p-8 bg-black/60 rounded-[2.5rem] flex items-center justify-between border-2 border-white/5 shadow-inner backdrop-blur-md relative z-10">
        <div className="text-left">
          <span className="text-[10px] md:text-xs font-black uppercase text-slate-500 tracking-[0.4em] italic m-0 block mb-2">Criticité calculée</span>
          <p className="text-[9px] text-slate-600 font-black italic uppercase tracking-widest flex items-center gap-2 m-0">
             <Target size={12} className="text-blue-600" /> Matrice Acceptabilité
          </p>
        </div>
        <div className={`text-5xl font-black italic transition-all duration-500 tracking-tighter bg-white/5 w-24 h-24 rounded-3xl flex items-center justify-center border-2 ${getScoreColor()}`}>
          {form.RS_Probabilite * form.RS_Gravite}
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase italic text-sm md:text-lg flex items-center justify-center gap-4 hover:bg-white hover:text-blue-600 transition-all shadow-[0_15px_40px_rgba(37,99,235,0.4)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none tracking-[0.4em] group/btn active:scale-95 relative z-10">
        {loading ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" /> Valider le risque</>}
      </button>
    </form>
  );
}