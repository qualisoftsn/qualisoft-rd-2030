/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NCModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [audits, setAudits] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    NC_Libelle: '',
    NC_Description: '',
    NC_Gravite: 'MINEURE',
    NC_Source: 'INTERNAL_AUDIT',
    NC_AuditId: ''
  });

  useEffect(() => {
    // On charge les audits pour pouvoir lier la NC si besoin
    apiClient.get('/audits').then(res => setAudits(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/nc', formData);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Erreur lors de la déclaration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-red-50/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600" />
            <h2 className="text-xl font-black uppercase italic text-slate-900">Déclarer un écart</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1 italic">Libellé du constat</label>
            <input required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500" 
                   value={formData.NC_Libelle} onChange={e => setFormData({...formData, NC_Libelle: e.target.value})} placeholder="ex: Absence de marquage au sol" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1 italic">Gravité</label>
              <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold appearance-none"
                      value={formData.NC_Gravite} onChange={e => setFormData({...formData, NC_Gravite: e.target.value})}>
                <option value="MINEURE">Mineure</option>
                <option value="MAJEURE">Majeure</option>
                <option value="CRITIQUE">Critique</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1 italic">Source</label>
              <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold appearance-none"
                      value={formData.NC_Source} onChange={e => setFormData({...formData, NC_Source: e.target.value})}>
                <option value="INTERNAL_AUDIT">Audit Interne</option>
                <option value="CLIENT_COMPLAINT">Réclamation Client</option>
                <option value="INCIDENT_SAFETY">Incident SSE</option>
                <option value="EXTERNAL_AUDIT">Audit Externe</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1 italic">Audit Lié (Optionnel)</label>
            <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold appearance-none text-slate-500"
                    value={formData.NC_AuditId} onChange={e => setFormData({...formData, NC_AuditId: e.target.value})}>
              <option value="">Aucun audit spécifique</option>
              {audits.map(a => <option key={a.AU_Id} value={a.AU_Id}>{a.AU_Reference} - {a.AU_Title}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1 italic">Description détaillée</label>
            <textarea required className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold outline-none min-h-25" 
                      value={formData.NC_Description} onChange={e => setFormData({...formData, NC_Description: e.target.value})} placeholder="Détaillez l'écart constaté..." />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase italic text-white flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-red-100">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Confirmer l&apos;enregistrement
          </button>
        </form>
      </div>
    </div>
  );
}