/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * ⚠️ MODULE : NON-CONFORMITY ENROLMENT (NC)
 * -------------------------------------------------------------------------
 * FONCTION : Signalement et indexation des écarts normatifs (§10.2 ISO 9001).
 * RÔLE : Initier le processus correctif et lier le constat à sa source (Audit, SSE, Client).
 * ISOLATION : Uniquement les données d'audits du Tenant actif sont proposées.
 */

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { X, AlertTriangle, Loader2, Link2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NCModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [audits, setAudits] = useState<any[]>([]);
  
  // Schéma de données Elite (Préfixes NC_)
  const [formData, setFormData] = useState({
    NC_Libelle: '',
    NC_Description: '',
    NC_Gravite: 'MINEURE',
    NC_Source: 'INTERNAL_AUDIT',
    NC_AuditId: ''
  });

  useEffect(() => {
    // 📡 Synchronisation sélective des audits du Tenant
    apiClient.get('/audits')
      .then(res => setAudits(Array.isArray(res.data) ? res.data : []))
      .catch(() => console.error("Échec Sync Registre Audits"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("Scellage de l'écart au registre...");
    
    try {
      await apiClient.post('/nc', formData);
      toast.success("NON-CONFORMITÉ INDEXÉE", { id: tid });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la déclaration", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-100 flex items-center justify-center p-4 italic font-sans">
      <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-4xl animate-in zoom-in duration-300 border border-slate-100">
        
        {/* HEADER CRITIQUE */}
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-red-50/40">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-500/20">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">Déclarer un <span className="text-red-600">Écart</span></h2>
              <p className="text-[9px] font-black text-red-600/60 uppercase tracking-widest mt-2 italic">Signalement d&apos;Anomalie Matrix</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-600 transition-all border-none bg-transparent cursor-pointer">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 block ml-2 italic tracking-widest">Intitulé du constat</label>
            <input required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:border-red-500 focus:bg-white transition-all uppercase" 
                   value={formData.NC_Libelle} onChange={e => setFormData({...formData, NC_Libelle: e.target.value.toUpperCase()})} placeholder="EX: ABSENCE DE MARQUAGE AU SOL - ZONE B" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 block ml-2 italic tracking-widest">Niveau de Gravité</label>
              <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-xs font-black outline-none appearance-none cursor-pointer uppercase italic focus:border-red-500"
                      value={formData.NC_Gravite} onChange={e => setFormData({...formData, NC_Gravite: e.target.value})}>
                <option value="MINEURE">⚪ Mineure</option>
                <option value="MAJEURE">🟠 Majeure</option>
                <option value="CRITIQUE">🔴 Critique</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 block ml-2 italic tracking-widest">Provenance (Source)</label>
              <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-xs font-black outline-none appearance-none cursor-pointer uppercase italic focus:border-red-500"
                      value={formData.NC_Source} onChange={e => setFormData({...formData, NC_Source: e.target.value})}>
                <option value="INTERNAL_AUDIT">Audit Interne</option>
                <option value="CLIENT_COMPLAINT">Réclamation Client</option>
                <option value="INCIDENT_SAFETY">Incident SSE</option>
                <option value="EXTERNAL_AUDIT">Audit Externe</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 block ml-2 italic tracking-[0.2em] items-center gap-2">
              <Link2 size={12}/> Audit Scellé (Optionnel)
            </label>
            <select className={`w-full bg-slate-50 border-2 rounded-2xl p-5 text-xs font-black outline-none appearance-none cursor-pointer uppercase italic transition-all ${formData.NC_AuditId ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100'}`}
                    value={formData.NC_AuditId} onChange={e => setFormData({...formData, NC_AuditId: e.target.value})}>
              <option value="">-- Aucun lien audit détecté --</option>
              {audits.map(a => <option key={a.AU_Id} value={a.AU_Id}>{a.AU_Reference} : {a.AU_Title}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 block ml-2 italic tracking-widest">Analyse circonstanciée</label>
            <textarea required className="w-full bg-slate-50 border-2 border-slate-100 rounded-4xl p-6 text-sm font-bold text-slate-700 outline-none focus:border-red-500 focus:bg-white transition-all min-h-32 italic leading-relaxed" 
                      value={formData.NC_Description} onChange={e => setFormData({...formData, NC_Description: e.target.value})} placeholder="Détaillez les preuves objectives de l'écart..." />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-950 py-6 rounded-3xl font-black uppercase italic text-white flex items-center justify-center gap-4 hover:bg-red-600 transition-all shadow-3xl shadow-red-100 active:scale-95 border-none cursor-pointer mt-4">
            {loading ? <Loader2 className="animate-spin" /> : <ShieldAlert size={20} />} 
            Sceller au Registre Qualité
          </button>
        </form>
      </div>
    </div>
  );
}