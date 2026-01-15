/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { Save, AlertTriangle, ShieldCheck, Target, Loader2 } from 'lucide-react';

export default function QuickRiskForm({ onRiskCreated }: { onRiskCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [processus, setProcessus] = useState<any[]>([]);
  const [form, setForm] = useState({
    RS_Libelle: '',
    RS_Probabilite: 1,
    RS_Gravite: 1,
    RS_ProcessusId: '',
    RS_Description: ''
  });

  // Chargement des processus pour le menu déroulant
  useEffect(() => {
    apiClient.get('/processus').then(res => setProcessus(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/risks', form);
      setForm({ RS_Libelle: '', RS_Probabilite: 1, RS_Gravite: 1, RS_ProcessusId: '', RS_Description: '' });
      onRiskCreated(); // Déclenche le rafraîchissement de la Heatmap
      alert("Risque répertorié !");
    } catch (err) {
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = () => {
    const score = form.RS_Probabilite * form.RS_Gravite;
    if (score >= 12) return 'text-red-500';
    if (score >= 8) return 'text-orange-500';
    return 'text-emerald-500';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl italic">
      <h3 className="text-xl font-black uppercase italic flex items-center gap-3">
        <AlertTriangle className="text-blue-500" /> Identifier un Risque
      </h3>

      {/* Libellé */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Intitulé du danger</label>
        <input 
          type="text" required placeholder="Ex: Panne serveur critique"
          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold"
          value={form.RS_Libelle} onChange={e => setForm({...form, RS_Libelle: e.target.value})}
        />
      </div>

      {/* Processus */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-slate-500 ml-2">Processus Impacté</label>
        <select 
          required className="w-full bg-[#0F172A] border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold"
          value={form.RS_ProcessusId} onChange={e => setForm({...form, RS_ProcessusId: e.target.value})}
        >
          <option value="">Sélectionner un processus</option>
          {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
        </select>
      </div>

      {/* Probabilité & Gravité */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-500 flex justify-between">
            Probabilité <span>{form.RS_Probabilite}/4</span>
          </label>
          <input 
            type="range" min="1" max="4" step="1" 
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
            value={form.RS_Probabilite} onChange={e => setForm({...form, RS_Probabilite: parseInt(e.target.value)})}
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-500 flex justify-between">
            Gravité <span>{form.RS_Gravite}/4</span>
          </label>
          <input 
            type="range" min="1" max="4" step="1" 
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600"
            value={form.RS_Gravite} onChange={e => setForm({...form, RS_Gravite: parseInt(e.target.value)})}
          />
        </div>
      </div>

      {/* Résumé du Score */}
      <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
        <span className="text-[10px] font-black uppercase text-slate-400">Criticité calculée</span>
        <div className={`text-3xl font-black italic ${getScoreColor()}`}>
          {form.RS_Probabilite * form.RS_Gravite}
        </div>
      </div>

      <button 
        type="submit" disabled={loading}
        className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase italic text-xs flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20"
      >
        {loading ? <Loader2 className="animate-spin" /> : <><Save size={16}/> Enregistrer le risque</>}
      </button>
    </form>
  );
}