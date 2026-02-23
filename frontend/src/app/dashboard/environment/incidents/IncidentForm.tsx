//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🚨 MODULE : FORMULAIRE DE SCELLAGE INCIDENT (SDE KERNEL)
 * -------------------------------------------------------------------------
 * RÔLE : Enregistrement immuable des écarts SSE (§8.2 / §10.2).
 * DESIGN : Elite High-Density / Matrix Cockpit / No-Overflow.
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, Loader2, ShieldAlert, MapPin, Calendar, Activity, User, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/core/utils/cn';

interface IncidentFormProps {
  onClose: () => void;
  onSuccess: () => void;
  sites: any[];
  users: any[];
}

export default function IncidentForm({ onClose, onSuccess, sites, users }: IncidentFormProps) {
  const [loading, setLoading] = useState(false);
  
  // --- 📦 ÉTAT INITIAL SCELLÉ (Référentiel SDE) ---
  const [formData, setFormData] = useState({
    SSE_Type: 'INCIDENT',
    SSE_DateEvent: new Date().toISOString().slice(0, 16),
    SSE_Lieu: '',
    SSE_Description: '',
    SSE_AvecArret: false,
    SSE_NbJoursArret: 0,
    SSE_SiteId: sites?.[0]?.S_Id || '',
    SSE_ReporterId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.SSE_ReporterId) return toast.error("REPORTER OBLIGATOIRE (§7.2)");
    
    setLoading(true);
    const tid = toast.loading("TRANSMISSION AU NOYAU SSE...");
    
    try {
      const payload = {
        ...formData,
        SSE_NbJoursArret: Number(formData.SSE_NbJoursArret),
        SSE_DateEvent: new Date(formData.SSE_DateEvent).toISOString(),
        SSE_Description: formData.SSE_Description.toUpperCase(),
        SSE_Lieu: formData.SSE_Lieu.toUpperCase()
      };

      await apiClient.post('/sse-events', payload);
      toast.success("INCIDENT SCELLÉ DANS LE REGISTRE", { id: tid });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR DE MUTATION SDE", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-600 flex items-center justify-center p-4 selection:bg-red-600/30">
      <div className="bg-[#0F172A] w-full max-w-2xl rounded-[2.5rem] border border-white/10 flex flex-col shadow-4xl animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-hidden italic font-black uppercase">
        
        {/* 🔝 HEADER COMPACT */}
        <header className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2 shrink-0">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-red-600/10 rounded-xl border border-red-600/20">
              <ShieldAlert size={20} className="text-red-600 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl tracking-tighter text-white m-0 leading-none italic">DÉCLARATION <span className="text-red-500">SSE</span></h2>
              <p className="text-[8px] text-slate-500 tracking-[0.4em] mt-1 m-0">PROTOCOLE D&apos;URGENCE ISO 14001</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors border-none bg-transparent cursor-pointer text-slate-500"><X size={20}/></button>
        </header>

        {/* 📋 CORPS DU FORMULAIRE (Scrollable si nécessaire) */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6 text-left">
          
          {/* Section 1 : Nature & Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] text-slate-500 ml-2 tracking-widest leading-none flex items-center gap-2"><Activity size={10}/> TYPE D&apos;ÉCART *</label>
              <select className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-[10px] text-white outline-none focus:border-red-600 font-black italic uppercase cursor-pointer appearance-none"
                value={formData.SSE_Type} onChange={(e) => setFormData({...formData, SSE_Type: e.target.value})}>
                <option value="INCIDENT">INCIDENT ENV</option>
                <option value="ACCIDENT">ACCIDENT TRAVAIL</option>
                <option value="POLLUTION">POLLUTION / FUITE</option>
                <option value="DOMMAGE">DOMMAGE MATÉRIEL</option>
                <option value="SITUATION_DANGEREUSE">SITUATION DANGEREUSE</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-slate-500 ml-2 tracking-widest leading-none flex items-center gap-2"><Calendar size={10}/> DATE & HEURE *</label>
              <input type="datetime-local" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-[10px] text-white outline-none focus:border-red-600 font-black italic appearance-none"
                value={formData.SSE_DateEvent} onChange={(e) => setFormData({...formData, SSE_DateEvent: e.target.value})} />
            </div>
          </div>

          {/* Section 2 : Localisation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] text-slate-500 ml-2 tracking-widest leading-none flex items-center gap-2"><MapPin size={10}/> LIEU PRÉCIS *</label>
              <input required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-[10px] text-white outline-none focus:border-red-600 font-black italic uppercase"
                value={formData.SSE_Lieu} onChange={(e) => setFormData({...formData, SSE_Lieu: e.target.value})} placeholder="EX: ZONE DE DÉPOT" />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-slate-500 ml-2 tracking-widest leading-none flex items-center gap-2"><AlertTriangle size={10}/> SITE (§4.4) *</label>
              <select required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-[10px] text-white outline-none focus:border-red-600 font-black italic cursor-pointer appearance-none"
                value={formData.SSE_SiteId} onChange={(e) => setFormData({...formData, SSE_SiteId: e.target.value})}>
                <option value="">SÉLECTIONNER SITE...</option>
                {sites.map((s: any) => (
                  <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3 : Identification & Gravité */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] text-slate-500 ml-2 tracking-widest leading-none flex items-center gap-2"><User size={10}/> REPORTER *</label>
              <select required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-[10px] text-white outline-none focus:border-red-600 font-black italic cursor-pointer appearance-none"
                value={formData.SSE_ReporterId} onChange={(e) => setFormData({...formData, SSE_ReporterId: e.target.value})}>
                <option value="">CHOISIR AGENT...</option>
                {users.map((u: any) => (
                  <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-slate-500 ml-2 tracking-widest leading-none">ARRÊT DE TRAVAIL ?</label>
              <div className="flex gap-2 h-9.5">
                <button type="button" onClick={() => setFormData({...formData, SSE_AvecArret: !formData.SSE_AvecArret})} 
                  className={cn("flex-1 rounded-xl border transition-all font-black italic text-[9px] cursor-pointer", 
                  formData.SSE_AvecArret ? "bg-red-600 border-red-500 text-white" : "bg-white/5 border-white/10 text-slate-600")}>
                  {formData.SSE_AvecArret ? 'OUI' : 'NON'}
                </button>
                {formData.SSE_AvecArret && (
                  <input type="number" className="w-16 bg-white/5 border border-white/10 rounded-xl text-center text-[10px] font-black italic text-white"
                    value={formData.SSE_NbJoursArret} onChange={(e) => setFormData({...formData, SSE_NbJoursArret: parseInt(e.target.value) || 0})} />
                )}
              </div>
            </div>
          </div>

          {/* Section 4 : Récit des faits */}
          <div className="space-y-1">
            <label className="text-[8px] text-slate-500 ml-2 tracking-widest leading-none">DESCRIPTION ANALYTIQUE (§10.2)</label>
            <textarea required className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-[10px] text-white outline-none h-24 focus:border-red-600 resize-none font-black italic uppercase leading-relaxed placeholder:opacity-10"
              value={formData.SSE_Description} onChange={(e) => setFormData({...formData, SSE_Description: e.target.value})} placeholder="DÉCRIRE PRÉCISÉMENT LES ÉCARTS ET ÉVIDENCES..." />
          </div>

          {/* 🏁 ACTIONS FINALES */}
          <div className="flex flex-col gap-3 pt-4">
            <button type="submit" disabled={loading} className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase text-white shadow-xl hover:bg-white hover:text-red-600 transition-all flex items-center justify-center gap-3 active:scale-95 italic text-[10px] border-none cursor-pointer">
              {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />} VALIDER LE SCELLAGE SDE
            </button>
            <button type="button" onClick={onClose} className="w-full text-[9px] text-slate-600 hover:text-white transition-colors tracking-widest font-black italic border-none bg-transparent cursor-pointer">ABANDONNER LA PROCÉDURE</button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}