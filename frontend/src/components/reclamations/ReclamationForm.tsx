/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import Modal from '../shared/Modal';
import TierForm from '../tiers/TierForm';

interface Props {
  T_Id: string;
  U_Id: string;
  tiers: any[];
  processus: any[];
  onSuccess: () => void; // Fonction pour rafraîchir les données de la page
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
      await axios.post('https://elite.qualisoft.sn/api/reclamations', {
        ...form,
        tenantId: T_Id,
        REC_OwnerId: U_Id
      });
      alert("Réclamation Qualisoft enregistrée.");
      setForm({ ...form, REC_Object: '', REC_Description: '', REC_TierId: '', REC_ProcessusId: '' });
      onSuccess();
    } catch (err) {
      alert("Erreur lors de l'enregistrement de la plainte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
        <h2 className="text-xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter">
          Saisie de la plainte
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Objet (REC_Object)</label>
            <input
              required
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-800"
              value={form.REC_Object}
              onChange={(e) => setForm({ ...form, REC_Object: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Concerné</label>
            <div className="flex gap-2 mt-1">
              <select
                required
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                value={form.REC_TierId}
                onChange={(e) => setForm({ ...form, REC_TierId: e.target.value })}
              >
                <option value="">-- Sélectionner le tiers --</option>
                {tiers.map((t) => (
                  <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>
                ))}
              </select>
              {/* Bouton pour ouvrir la modal de création de tiers */}
              <button
                type="button"
                onClick={() => setIsTierModalOpen(true)}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-slate-900 transition-all shadow-md"
                title="Ajouter un nouveau client"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Processus Imputé</label>
              <select
                className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                value={form.REC_ProcessusId}
                onChange={(e) => setForm({ ...form, REC_ProcessusId: e.target.value })}
              >
                <option value="">-- Aucun --</option>
                {processus.map((p) => (
                  <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Gravité</label>
              <select
                className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
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

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Description des faits</label>
            <textarea
              required
              rows={4}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              value={form.REC_Description}
              onChange={(e) => setForm({ ...form, REC_Description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase italic tracking-tighter hover:bg-blue-700 transition-all shadow-lg"
          >
            {loading ? "SYNCHRONISATION..." : "ENREGISTRER LA RÉCLAMATION"}
          </button>
        </form>
      </div>

      {/* Modal pour le nouveau tiers */}
      <Modal 
        isOpen={isTierModalOpen} 
        onClose={() => setIsTierModalOpen(false)} 
        title="Ajouter un Tiers"
      >
        <TierForm 
          T_Id={T_Id} 
          onSuccess={onSuccess} 
          onClose={() => setIsTierModalOpen(false)} 
        />
      </Modal>
    </>
  );
}