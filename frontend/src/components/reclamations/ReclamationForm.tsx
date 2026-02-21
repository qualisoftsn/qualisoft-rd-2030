/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * ✍️ MODULE : ReclamationForm
 * -------------------------------------------------------------------------
 * RÔLE : Formulaire de saisie des réclamations Tiers.
 * FONCTION : Indexation initiale des faits, affectation au processus métier 
 * et définition de la gravité (§8.2.1 ISO 9001).
 */

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client'; // Utilisation du client scellé
import { Plus, Save, Loader2 } from 'lucide-react';
import Modal from '../shared/Modal';
import TierForm from '../tiers/TierForm';

interface Props {
  T_Id: string;
  U_Id: string;
  tiers: any[];
  processus: any[];
  onSuccess: () => void;
}

export default function ReclamationForm({ T_Id, U_Id, tiers, processus, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

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
    setLoading(true);
    try {
      // On utilise le chemin relatif via apiClient pour hériter des headers multi-tenant
      await apiClient.post('/reclamations', {
        ...form,
        tenantId: T_Id,
        REC_OwnerId: U_Id
      });
      
      setForm({ ...form, REC_Object: '', REC_Description: '', REC_TierId: '', REC_ProcessusId: '' });
      onSuccess();
    } catch (err) {
      console.error("Qualisoft : Erreur de capture réclamation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-xl relative overflow-hidden text-left">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
        <h2 className="text-xl font-black text-slate-900 mb-8 uppercase italic tracking-tighter">
          Saisie de l&apos;écart / Plainte
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* OBJET */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Objet de la plainte</label>
            <input
              required
              className="w-full mt-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-800"
              value={form.REC_Object}
              onChange={(e) => setForm({ ...form, REC_Object: e.target.value })}
              placeholder="Ex: Retard livraison lot #402"
            />
          </div>

          {/* TIERS / CLIENT */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Client / Tiers Concerné</label>
            <div className="flex gap-2 mt-1">
              <select
                required
                className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 cursor-pointer outline-none focus:ring-2 focus:ring-blue-600"
                value={form.REC_TierId}
                onChange={(e) => setForm({ ...form, REC_TierId: e.target.value })}
              >
                <option value="">-- Sélectionner le tiers --</option>
                {tiers.map((t) => (
                  <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsTierModalOpen(true)}
                className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            {/* PROCESSUS */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Processus Imputé</label>
              <select
                className="w-full mt-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold cursor-pointer outline-none focus:ring-2 focus:ring-blue-600"
                value={form.REC_ProcessusId}
                onChange={(e) => setForm({ ...form, REC_ProcessusId: e.target.value })}
              >
                <option value="">-- Aucun --</option>
                {processus.map((p) => (
                  <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>
                ))}
              </select>
            </div>
            {/* GRAVITE */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Gravité de l&apos;impact</label>
              <select
                className="w-full mt-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold cursor-pointer outline-none focus:ring-2 focus:ring-blue-600"
                value={form.REC_Gravity}
                onChange={(e) => setForm({ ...form, REC_Gravity: e.target.value })}
              >
                <option value="LOW">BASSE</option>
                <option value="MEDIUM">MOYENNE</option>
                <option value="HIGH">HAUTE</option>
                <option value="CRITICAL">CRITIQUE</option>
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest italic ml-1">Description des faits (Preuves)</label>
            <textarea
              required
              rows={4}
              className="w-full mt-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-medium italic"
              value={form.REC_Description}
              onChange={(e) => setForm({ ...form, REC_Description: e.target.value })}
              placeholder="Détaillez l'écart constaté..."
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase italic tracking-widest hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
            {loading ? "SCELLAGE KERNEL..." : "ARCHIVER LA RÉCLAMATION"}
          </button>
        </form>
      </div>

      <Modal isOpen={isTierModalOpen} onClose={() => setIsTierModalOpen(false)} title="Nouveau Tiers">
        <TierForm T_Id={T_Id} onSuccess={onSuccess} onClose={() => setIsTierModalOpen(false)} />
      </Modal>
    </>
  );
}