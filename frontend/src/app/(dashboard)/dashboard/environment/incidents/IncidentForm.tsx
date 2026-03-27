/* eslint-disable react-hooks/exhaustive-deps */
'use client';

/**
 * 🚨 COMPOSANT FORMULAIRE INCIDENT (ISO 14001 §8.2)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, ChangeEvent, FormEvent, KeyboardEvent, useEffect } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { X, Save, Loader2, ShieldAlert, MapPin, Calendar, Activity, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

export interface Site {
  S_Id: string;
  S_Name: string;
}

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
}

export interface IncidentFormData {
  SSE_Type: 'INCIDENT' | 'ACCIDENT' | 'POLLUTION' | 'DOMMAGE' | 'SITUATION_DANGEREUSE';
  SSE_DateEvent: string;
  SSE_Lieu: string;
  SSE_Description: string;
  SSE_AvecArret: boolean;
  SSE_NbJoursArret: number;
  SSE_SiteId: string;
  SSE_ReporterId: string;
}

interface IncidentFormProps {
  onClose: () => void;
  onSuccess: () => void;
  sites: Site[];
  users: User[];
}

export default function IncidentForm({ onClose, onSuccess, sites, users }: IncidentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IncidentFormData>({
    SSE_Type: 'INCIDENT',
    SSE_DateEvent: new Date().toISOString().slice(0, 16),
    SSE_Lieu: '',
    SSE_Description: '',
    SSE_AvecArret: false,
    SSE_NbJoursArret: 0,
    SSE_SiteId: sites?.[0]?.S_Id || '',
    SSE_ReporterId: '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.SSE_ReporterId) return toast.error("REPORTER OBLIGATOIRE (§7.2)");
    
    setLoading(true);
    const toastId = toast.loading("TRANSMISSION AU NOYAU SSE...");
    try {
      const payload = {
        ...formData,
        SSE_NbJoursArret: Number(formData.SSE_NbJoursArret),
        SSE_DateEvent: new Date(formData.SSE_DateEvent).toISOString(),
        SSE_Description: formData.SSE_Description.toUpperCase(),
        SSE_Lieu: formData.SSE_Lieu.toUpperCase()
      };
      await apiClient.post('/sse-events', payload);
      toast.success("INCIDENT SCELLÉ DANS LE REGISTRE SSE", { id: toastId });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || "ERREUR DE MUTATION SDE", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 italic font-black uppercase"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0F172A] w-full max-w-2xl rounded-2xl md:rounded-3xl border border-white/10 flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden">
        
        <header className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="p-3 md:p-4 bg-red-600/10 rounded-xl md:rounded-2xl border border-red-600/20">
              <ShieldAlert size={20} className="w-5 h-5 md:w-6 md:h-6 text-red-400 animate-pulse" aria-hidden="true" />
            </div>
            <div>
              <h2 id="form-title" className="text-xl md:text-2xl tracking-tighter text-white m-0 leading-none italic uppercase">
                DÉCLARATION <span className="text-red-400">SSE</span>
              </h2>
              <p className="text-[8px] md:text-[9px] text-slate-500 tracking-widest mt-1 md:mt-2 m-0 uppercase font-black">
                PROTOCOLE D&apos;URGENCE ISO 14001
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors border-none bg-transparent cursor-pointer text-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            aria-label="Fermer le formulaire"
          >
            <X size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true"/>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar space-y-6 md:space-y-8 text-left" noValidate>
          {/* Type + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label htmlFor="SSE_Type" className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest flex items-center gap-2">
                <Activity size={12} className="w-3 h-3" aria-hidden="true"/> TYPE D&apos;ÉCART *
              </label>
              <select 
                id="SSE_Type"
                className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] text-white outline-none focus:border-red-600 font-black italic cursor-pointer appearance-none"
                value={formData.SSE_Type} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, SSE_Type: e.target.value as IncidentFormData['SSE_Type']})}
              >
                <option value="INCIDENT" className="bg-[#0B0F1A]">INCIDENT ENV</option>
                <option value="ACCIDENT" className="bg-[#0B0F1A]">ACCIDENT TRAVAIL</option>
                <option value="POLLUTION" className="bg-[#0B0F1A]">POLLUTION / FUITE</option>
                <option value="DOMMAGE" className="bg-[#0B0F1A]">DOMMAGE MATÉRIEL</option>
                <option value="SITUATION_DANGEREUSE" className="bg-[#0B0F1A]">SITUATION DANGEREUSE</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="SSE_DateEvent" className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest flex items-center gap-2">
                <Calendar size={12} className="w-3 h-3" aria-hidden="true"/> DATE & HEURE *
              </label>
              <input 
                id="SSE_DateEvent"
                type="datetime-local" 
                required 
                className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] text-white outline-none focus:border-red-600 font-black italic"
                value={formData.SSE_DateEvent} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, SSE_DateEvent: e.target.value})} 
              />
            </div>
          </div>

          {/* Lieu + Site */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label htmlFor="SSE_Lieu" className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest flex items-center gap-2">
                <MapPin size={12} className="w-3 h-3" aria-hidden="true"/> LIEU PRÉCIS *
              </label>
              <input 
                id="SSE_Lieu"
                required 
                className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] text-white outline-none focus:border-red-600 font-black italic uppercase"
                value={formData.SSE_Lieu} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, SSE_Lieu: e.target.value})} 
                placeholder="EX: ATELIER PRINCIPAL" 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="SSE_SiteId" className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest flex items-center gap-2">
                <AlertTriangle size={12} className="w-3 h-3" aria-hidden="true"/> SITE (§4.4) *
              </label>
              <select 
                id="SSE_SiteId"
                required 
                className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] text-white outline-none focus:border-red-600 font-black italic cursor-pointer appearance-none"
                value={formData.SSE_SiteId} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, SSE_SiteId: e.target.value})}
              >
                <option value="" className="bg-[#0B0F1A] text-slate-500">SÉLECTIONNER SITE...</option>
                {sites.map((s) => <option key={s.S_Id} value={s.S_Id} className="bg-[#0B0F1A]">{s.S_Name}</option>)}
              </select>
            </div>
          </div>

          {/* Reporter + Arret */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label htmlFor="SSE_ReporterId" className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest flex items-center gap-2">
                <User size={12} className="w-3 h-3" aria-hidden="true"/> REPORTER (§7.2) *
              </label>
              <select 
                id="SSE_ReporterId"
                required 
                className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] text-white outline-none focus:border-red-600 font-black italic cursor-pointer appearance-none"
                value={formData.SSE_ReporterId} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, SSE_ReporterId: e.target.value})}
              >
                <option value="" className="bg-[#0B0F1A] text-slate-500">CHOISIR AGENT...</option>
                {users.map((u) => <option key={u.U_Id} value={u.U_Id} className="bg-[#0B0F1A]">{u.U_FirstName} {u.U_LastName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest">ARRÊT DE TRAVAIL ?</label>
              <div className="flex gap-3 md:gap-4">
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, SSE_AvecArret: !formData.SSE_AvecArret})} 
                  className={cn(
                    "flex-1 rounded-xl md:rounded-2xl border transition-all font-black italic text-[10px] md:text-[11px] cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-rose-400", 
                    formData.SSE_AvecArret ? "bg-red-600 text-white" : "bg-white/5 border-white/10 text-slate-600 hover:text-white"
                  )}
                  aria-pressed={formData.SSE_AvecArret}
                >
                  {formData.SSE_AvecArret ? 'OUI (ARRÊT)' : 'NON (CONTINUITÉ)'}
                </button>
                {formData.SSE_AvecArret && (
                  <input 
                    type="number" 
                    min="0"
                    className="w-20 md:w-24 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-center text-[10px] md:text-[12px] font-black italic text-white outline-none focus:border-red-600"
                    value={formData.SSE_NbJoursArret || ''} 
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, SSE_NbJoursArret: parseInt(e.target.value) || 0})} 
                    placeholder="Jours"
                    aria-label="Nombre de jours d'arrêt"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="SSE_Description" className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest">
              RÉCIT CIRCONSTANCIÉ (§10.2) *
            </label>
            <textarea 
              id="SSE_Description"
              required 
              className="w-full bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] text-white outline-none focus:border-red-600 resize-none font-black italic uppercase leading-relaxed min-h-[100px] md:min-h-[120px]"
              value={formData.SSE_Description} 
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, SSE_Description: e.target.value})} 
              placeholder="DÉCRIRE PRÉCISÉMENT LES FAITS ET PREUVES..." 
            />
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-3 md:gap-4 pt-2 md:pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className={cn(
                "w-full bg-red-600 py-4 md:py-5 lg:py-6 rounded-2xl md:rounded-3xl font-black uppercase text-white shadow-xl hover:bg-white hover:text-red-600 transition-all flex items-center justify-center gap-3 md:gap-4 active:scale-95 italic text-[10px] md:text-[11px] lg:text-sm border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400",
                loading && "opacity-70 cursor-wait"
              )}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="w-5 h-5 animate-spin" aria-hidden="true"/> VALIDATION...
                </>
              ) : (
                <>
                  <Save size={20} className="w-5 h-5" aria-hidden="true"/> VALIDER LE SCELLAGE SDE
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full text-[9px] md:text-[10px] text-slate-600 hover:text-white transition-colors tracking-widest font-black italic border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 rounded py-2"
            >
              ABANDONNER LA PROCÉDURE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}