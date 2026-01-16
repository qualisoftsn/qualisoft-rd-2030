"use client";

import React, { useState } from 'react';
import axios from 'axios';

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

    try {
      await axios.post(`https://elite.qualisoft.sn/api/tiers?T_Id=${T_Id}`, form);
      onSuccess(); // Rafraîchit la liste dans le formulaire de réclamation
      if (onClose) onClose(); // Ferme la modal
      setForm({ TR_Name: '', TR_Type: 'CLIENT', TR_Email: '', TR_CodeExterne: '' });
    } catch (error) {
      alert("Erreur lors de la création du tiers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom / Raison Sociale</label>
        <input
          required
          autoFocus
          className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold"
          value={form.TR_Name}
          onChange={(e) => setForm({ ...form, TR_Name: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
          <select
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold cursor-pointer"
            value={form.TR_Type}
            onChange={(e) => setForm({ ...form, TR_Type: e.target.value })}
          >
            <option value="CLIENT">CLIENT</option>
            <option value="FOURNISSEUR">FOURNISSEUR</option>
            <option value="PARTENAIRE">PARTENAIRE</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Code Externe</label>
          <input
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            value={form.TR_CodeExterne}
            onChange={(e) => setForm({ ...form, TR_CodeExterne: e.target.value })}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-blue-700 text-white rounded-xl font-black uppercase italic tracking-tighter hover:bg-slate-900 transition-all shadow-lg"
      >
        {loading ? "ENREGISTREMENT..." : "AJOUTER AU RÉFÉRENTIEL"}
      </button>
    </form>
  );
}