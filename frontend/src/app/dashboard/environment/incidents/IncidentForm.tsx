/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, Loader2, AlertTriangle, MapPin, Calendar, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function IncidentForm({ onClose, onSuccess, sites, users }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    SSE_Type: 'DOMMAGE_MATERIEL',
    SSE_DateEvent: new Date().toISOString().slice(0, 16),
    SSE_Lieu: '',
    SSE_Description: '',
    SSE_AvecArret: false,
    SSE_NbJoursArret: 0,
    SSE_SiteId: sites[0]?.S_Id || '',
    SSE_ReporterId: '',
    SSE_VictimId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.SSE_ReporterId) return toast.error("VEUILLEZ SÉLECTIONNER UN REPORTER");
    
    setLoading(true);
    const toastId = toast.loading("INDEXATION INCIDENT §10.2...");
    
    try {
      // ✅ CORRECTION CRITIQUE DES TYPES POUR ÉVITER L'ERREUR 400
      const payload = {
        ...formData,
        SSE_NbJoursArret: Number(formData.SSE_NbJoursArret), // Force Number
        SSE_DateEvent: new Date(formData.SSE_DateEvent).toISOString(), // Force ISO
        SSE_VictimId: formData.SSE_VictimId || null // Gère l'absence de victime
      };

      await apiClient.post('/sse', payload);
      toast.success("INCIDENT ENREGISTRÉ", { id: toastId });
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "ERREUR DE VALIDATION";
      toast.error(Array.isArray(msg) ? msg[0] : msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-500 flex items-center justify-center p-6 italic font-black uppercase">
      <div className="bg-[#0F172A] w-full max-w-3xl rounded-[4rem] border border-white/10 p-16 space-y-10 shadow-4xl animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh] scrollbar-hide">
        
        <div className="flex justify-between items-start border-b border-white/10 pb-8 text-left">
          <div>
            <h2 className="text-4xl tracking-tighter text-white italic uppercase leading-none">DÉCLARATION <span className="text-red-500">INCIDENT</span></h2>
            <p className="text-[10px] text-slate-500 tracking-[0.3em] mt-3 italic">PROTOCOLE D&apos;URGENCE ISO 14001</p>
          </div>
          <ShieldAlert className="text-red-500" size={48} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase">TYPE D&apos;INCIDENT *</label>
              <select className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl text-sm text-white outline-none focus:border-red-500 font-black italic uppercase cursor-pointer"
                value={formData.SSE_Type} onChange={(e) => setFormData({...formData, SSE_Type: e.target.value})}>
                <option value="DOMMAGE_MATERIEL" className="bg-[#0F172A]">DOMMAGE MATÉRIEL</option>
                <option value="POLLUTION" className="bg-[#0F172A]">POLLUTION / DÉVERSEMENT</option>
                <option value="SITUATION_DANGEREUSE" className="bg-[#0F172A]">SITUATION DANGEREUSE</option>
                <option value="PRESQU_ACCIDENT" className="bg-[#0F172A]">PRESQU&apos;ACCIDENT</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase">DATE & HEURE *</label>
              <input type="datetime-local" required className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl text-sm text-white outline-none focus:border-red-500 font-black italic"
                value={formData.SSE_DateEvent} onChange={(e) => setFormData({...formData, SSE_DateEvent: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase">LIEU PRÉCIS *</label>
              <input required className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl text-sm text-white outline-none focus:border-red-500 font-black italic uppercase"
                value={formData.SSE_Lieu} onChange={(e) => setFormData({...formData, SSE_Lieu: e.target.value})} placeholder="EX: ZONE DE STOCKAGE" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase">SITE CONCERNÉ *</label>
              <select className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl text-sm text-white outline-none focus:border-red-500 font-black italic uppercase cursor-pointer"
                value={formData.SSE_SiteId} onChange={(e) => setFormData({...formData, SSE_SiteId: e.target.value})}>
                {sites.map((s: any) => (
                  <option key={String(s.S_Id)} value={String(s.S_Id)} className="bg-[#0F172A]">
                  {String(s.S_Name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase">REPORTER (DÉCLARANT) *</label>
              <select required className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl text-sm text-white outline-none focus:border-red-500 font-black italic uppercase cursor-pointer"
                value={formData.SSE_ReporterId} onChange={(e) => setFormData({...formData, SSE_ReporterId: e.target.value})}>
                <option value="" className="bg-[#0F172A]">SÉLECTIONNER...</option>
                  {users.map((u: any) => (
                    <option key={String(u.U_Id)} value={String(u.U_Id)} className="bg-[#0F172A]">
                      {String(u.U_FirstName)} {String(u.U_LastName)}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase italic">AVEC ARRÊT DE TRAVAIL ?</label>
              <div className="flex gap-4">
                <button type="button" onClick={() => setFormData({...formData, SSE_AvecArret: !formData.SSE_AvecArret})} 
                  className={`flex-1 p-6 rounded-4xl border transition-all ${formData.SSE_AvecArret ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                  {formData.SSE_AvecArret ? 'OUI (CRITIQUE)' : 'NON (MINEUR)'}
                </button>
                {formData.SSE_AvecArret && (
                  <input type="number" className="w-24 bg-white/5 border border-white/10 p-6 rounded-4xl text-sm text-white text-center font-black"
                    value={formData.SSE_NbJoursArret} onChange={(e) => setFormData({...formData, SSE_NbJoursArret: parseInt(e.target.value) || 0})} />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase italic">DESCRIPTION DÉTAILLÉE DES FAITS (§10.2)</label>
            <textarea required className="w-full bg-white/5 border border-white/10 p-8 rounded-[3rem] text-sm text-white outline-none h-40 focus:border-red-500 resize-none font-black italic uppercase leading-relaxed"
              value={formData.SSE_Description} onChange={(e) => setFormData({...formData, SSE_Description: e.target.value})} placeholder="DÉCRIVEZ L'INCIDENT ET LES MESURES IMMÉDIATES..." />
          </div>

          <div className="flex flex-col gap-6 pt-6">
            <button type="submit" disabled={loading} className="w-full bg-red-600 py-8 rounded-[3rem] font-black uppercase text-white shadow-3xl hover:bg-red-500 transition-all flex items-center justify-center gap-4 active:scale-95 italic tracking-widest">
              {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
              VALIDER LA DÉCLARATION
            </button>
            <button type="button" onClick={onClose} className="w-full text-[11px] text-slate-600 text-center hover:text-white transition-colors tracking-[0.5em] font-black italic">ABANDONNER</button>
          </div>
        </form>
      </div>
    </div>
  );
}