/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🤝 MODULE : TierForm.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Enrôlement des Tiers (Clients, Fournisseurs, Partenaires).
 * RÉVISION : 03 Mars 2026 | 00:15 GMT
 */

"use client";

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client';
import { Loader2, UserPlus, ShieldCheck } from 'lucide-react';
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
    const tid = toast.loading("Scellage au registre des tiers...");

    try {
      // 🚀 Transmission au Kernel Matrix (Liaison forcée au T_Id)
      await apiClient.post(`/tiers?T_Id=${T_Id}`, form);
      
      toast.success("TIERS ENRÔLÉ AVEC SUCCÈS", { id: tid });
      onSuccess(); 
      if (onClose) onClose(); 
      setForm({ TR_Name: '', TR_Type: 'CLIENT', TR_Email: '', TR_CodeExterne: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Échec de l'indexation.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 italic text-left font-sans">
      <div className="space-y-2">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Raison Sociale / Identité</label>
        <input
          required autoFocus
          className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-4xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all uppercase shadow-inner"
          value={form.TR_Name}
          onChange={(e) => setForm({ ...form, TR_Name: e.target.value.toUpperCase() })}
          placeholder="EX: GLOBAL INDUSTRIES SA"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Nature du Tiers</label>
          <select
            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-4xl font-black uppercase text-xs cursor-pointer outline-none focus:border-blue-600 appearance-none shadow-inner"
            value={form.TR_Type}
            onChange={(e) => setForm({ ...form, TR_Type: e.target.value })}
          >
            <option value="CLIENT">Client</option>
            <option value="FOURNISSEUR">Fournisseur</option>
            <option value="PARTENAIRE">Partenaire Stratégique</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Identifiant ERP</label>
          <input
            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-4xl font-black outline-none focus:border-blue-600 transition-all uppercase shadow-inner"
            value={form.TR_CodeExterne}
            onChange={(e) => setForm({ ...form, TR_CodeExterne: e.target.value })}
            placeholder="REF-2026-X"
          />
        </div>
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full py-7 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-4xl flex items-center justify-center gap-4 border-none cursor-pointer active:scale-95 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
        {loading ? "SCELLAGE..." : "ENRÔLER AU RÉFÉRENTIEL"}
      </button>
    </form>
  );
}
