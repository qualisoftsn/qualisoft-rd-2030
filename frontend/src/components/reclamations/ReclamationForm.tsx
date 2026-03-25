/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ✍️ MODULE : ReclamationForm.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Saisie et indexation légale des plaintes (§8.2.1 ISO 9001).
 * RÉVISION : 02 Mars 2026 | 18:55 GMT
 */

"use client";

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReclamationForm({ tiers, processus, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    REC_Object: '',
    REC_Description: '',
    REC_Source: 'E-mail',
    REC_Gravity: 'MEDIUM',
    REC_TierId: '',
    REC_ProcessusId: '',
    REC_DateReceipt: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.REC_TierId) return toast.error("Veuillez sélectionner un tiers");
    
    setLoading(true);
    const tid = toast.loading("Archivage au registre...");
    try {
      await apiClient.post('/reclamations', form);
      toast.success("RÉCLAMATION ARCHIVÉE (§8.2.1)", { id: tid });
      onSuccess();
    } catch (err) {
      toast.error("Erreur de capture SDE", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-4xl relative overflow-hidden text-left italic">
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
      <h2 className="text-3xl font-black text-slate-900 mb-10 uppercase tracking-tighter">
        Saisie de <span className="text-blue-600">Plainite Tiers</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputBlock label="Objet de la plainte" value={form.REC_Object} onChange={(v: any) => setForm({...form, REC_Object: v})} placeholder="Ex: Retard livraison lot #402" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectBlock label="Client / Tiers Concerné" value={form.REC_TierId} onChange={(v: any) => setForm({...form, REC_TierId: v})}>
            <option value="">-- Sélectionner --</option>
            {tiers.map((t: any) => <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>)}
          </SelectBlock>
          <SelectBlock label="Processus Imputé" value={form.REC_ProcessusId} onChange={(v: any) => setForm({...form, REC_ProcessusId: v})}>
            <option value="">-- Aucun --</option>
            {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
          </SelectBlock>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <SelectBlock label="Gravité" value={form.REC_Gravity} onChange={(v: any) => setForm({...form, REC_Gravity: v})}>
            <option value="LOW">BASSE</option>
            <option value="MEDIUM">MOYENNE</option>
            <option value="HIGH">HAUTE</option>
            <option value="CRITICAL">CRITIQUE</option>
          </SelectBlock>
          <InputBlock label="Date de Réception" type="date" value={form.REC_DateReceipt} onChange={(v: any) => setForm({...form, REC_DateReceipt: v})} />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description des faits</label>
          <textarea required rows={4} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-600 font-bold italic text-sm shadow-inner" value={form.REC_Description} onChange={e => setForm({...form, REC_Description: e.target.value})} placeholder="Détaillez l'écart constaté..." />
        </div>

        <button type="submit" disabled={loading} className="w-full py-6 bg-slate-950 text-white rounded-2xl font-black uppercase italic tracking-[0.3em] hover:bg-blue-600 transition-all shadow-3xl flex items-center justify-center gap-4 border-none cursor-pointer active:scale-95">
          {loading ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>}
          {loading ? "SCELLAGE KERNEL..." : "ARCHIVER LA RÉCLAMATION"}
        </button>
      </form>
    </div>
  );
}

function InputBlock({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
      <input type={type} required className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black italic text-slate-800 outline-none focus:border-blue-600 shadow-inner" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function SelectBlock({ label, value, onChange, children }: any) {
  return (
    <div className="space-y-2 text-left">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
      <select className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black italic text-slate-800 outline-none focus:border-blue-600 appearance-none shadow-inner" value={value} onChange={e => onChange(e.target.value)}>{children}</select>
    </div>
  );
}
