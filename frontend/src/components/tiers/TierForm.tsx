/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
/**
 * 🤝 MODULE : TIER FORM (RÉFÉRENTIEL TIERS)
 * -------------------------------------------------------------------------
 * FONCTION : Indexation des clients, fournisseurs et partenaires.
 * RÔLE : Alimenter la base de données relationnelle du Tenant (§8.4 ISO 9001).
 * ISOLATION : Utilise apiClient pour garantir l'injection du T_Id en Header.
 */

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client'; // Remplacement d'axios par apiClient pour la sécurité
import { Loader2, Save, UserPlus, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface TierFormProps {
  T_Id: string;
  onSuccess: () => void;
  onClose?: () => void;
}

export default function TierForm({ T_Id, onSuccess, onClose }: TierFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    TR_Name: '',
    TR_Type: 'CLIENT',
    TR_Email: '',
    TR_CodeExterne: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Scellage du tiers au référentiel...");

    try {
      // 🚀 Transmission au Kernel Matrix (T_Id passé en paramètre de sécurité)
      await apiClient.post(`/tiers?T_Id=${T_Id}`, form);
      
      toast.success("TIERS ENRÔLÉ AVEC SUCCÈS", { id: tid });
      onSuccess(); 
      if (onClose) onClose(); 
      setForm({ TR_Name: '', TR_Type: 'CLIENT', TR_Email: '', TR_CodeExterne: '' });
    } catch (error) {
      toast.error("Échec de l'indexation. Vérifiez les doublons.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 italic text-left">
      <div>
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-2 italic">Raison Sociale / Nom</label>
        <input
          required
          autoFocus
          className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-slate-900 outline-none focus:border-blue-500 transition-all uppercase"
          value={form.TR_Name}
          onChange={(e) => setForm({ ...form, TR_Name: e.target.value.toUpperCase() })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-2 italic">Nature du Tiers</label>
          <select
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black uppercase text-xs cursor-pointer outline-none focus:border-blue-500"
            value={form.TR_Type}
            onChange={(e) => setForm({ ...form, TR_Type: e.target.value })}
          >
            <option value="CLIENT">Client</option>
            <option value="FOURNISSEUR">Fournisseur</option>
            <option value="PARTENAIRE">Partenaire Stratégique</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-2 italic">Identifiant ERP / Externe</label>
          <input
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold outline-none focus:border-blue-500 transition-all uppercase"
            value={form.TR_CodeExterne}
            onChange={(e) => setForm({ ...form, TR_CodeExterne: e.target.value })}
            placeholder="EX: REF-2026-X"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-6 bg-blue-700 text-white rounded-4xl font-black uppercase italic tracking-[0.2em] hover:bg-slate-900 transition-all shadow-2xl flex items-center justify-center gap-4 border-none cursor-pointer"
      >
        {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={18} />}
        {loading ? "SCÉLLAGE..." : "Enrôler au Référentiel"}
      </button>
    </form>
  );
}