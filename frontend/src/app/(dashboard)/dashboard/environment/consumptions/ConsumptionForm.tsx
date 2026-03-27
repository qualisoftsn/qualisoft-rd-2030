/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛠️ FORMULAIRE DE SAISIE DES CONSOMMATIONS (ISO 14001 §9.1.1)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, ChangeEvent, FormEvent, KeyboardEvent, useEffect } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { X, Save, Loader2, Zap, Droplets, Flame, Fuel } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

export interface Site {
  S_Id: string;
  S_Name: string;
}

export interface ConsumptionFormData {
  CON_Type: 'ELECTRICITE' | 'EAU' | 'GAZ' | 'CARBURANT';
  CON_Value: number;
  CON_Unit: 'kWh' | 'm³' | 'L';
  CON_Month: number;
  CON_Year: number;
  CON_Cost: number;
  CON_SiteId: string;
}

interface ConsumptionFormProps {
  onClose: () => void;
  onSuccess: () => void;
  sites: Site[];
}

export default function ConsumptionForm({ onClose, onSuccess, sites }: ConsumptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ConsumptionFormData>({
    CON_Type: 'ELECTRICITE',
    CON_Value: 0,
    CON_Unit: 'kWh',
    CON_Month: new Date().getMonth() + 1,
    CON_Year: new Date().getFullYear(),
    CON_Cost: 0,
    CON_SiteId: sites[0]?.S_Id || '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.CON_SiteId) return toast.error("VEUILLEZ SÉLECTIONNER UN SITE");
    
    setLoading(true);
    const toastId = toast.loading("ENREGISTREMENT ISO 14001...");
    try {
      await apiClient.post('/consumptions', formData);
      toast.success("CONSOMMATION INDEXÉE DANS LE MATRIX KERNEL", { id: toastId });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || "ERREUR D'ENREGISTREMENT", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: ConsumptionFormData['CON_Type']) => {
    const units: Record<ConsumptionFormData['CON_Type'], ConsumptionFormData['CON_Unit']> = {
      ELECTRICITE: 'kWh',
      EAU: 'm³',
      GAZ: 'm³',
      CARBURANT: 'L',
    };
    setFormData(prev => ({ ...prev, CON_Type: type, CON_Unit: units[type] }));
  };

  const getIcon = () => {
    const icons: Record<ConsumptionFormData['CON_Type'], { icon: React.ElementType; color: string }> = {
      ELECTRICITE: { icon: Zap, color: 'text-amber-400' },
      EAU: { icon: Droplets, color: 'text-blue-400' },
      GAZ: { icon: Flame, color: 'text-rose-400' },
      CARBURANT: { icon: Fuel, color: 'text-emerald-400' },
    };
    const { icon: Icon, color } = icons[formData.CON_Type];
    return <Icon size={24} className={cn("w-6 h-6", color)} aria-hidden="true" />;
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
      className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4 md:p-6 italic font-black uppercase"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0F172A] w-full max-w-2xl rounded-2xl md:rounded-3xl border border-white/10 p-6 md:p-8 lg:p-12 space-y-6 md:space-y-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-start border-b border-white/10 pb-6 md:pb-8 text-left">
          <div>
            <h2 id="form-title" className="text-2xl md:text-3xl lg:text-4xl tracking-tighter text-white italic uppercase leading-none m-0">
              SAISIE <span className="text-amber-400">MESURE</span>
            </h2>
            <p className="text-[8px] md:text-[9px] text-slate-500 tracking-widest mt-2 md:mt-3 m-0">INDEXATION CONSOMMATION §9.1.1</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-white/5 rounded-lg transition-colors border-none bg-transparent cursor-pointer text-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Fermer le formulaire"
          >
            <X size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 text-left" noValidate>
          {/* Type + Site */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label htmlFor="CON_Type" className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest uppercase font-black block">TYPE DE RESSOURCE</label>
              <select 
                id="CON_Type"
                className="w-full bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-sm text-white outline-none focus:border-amber-500 transition-all font-black italic uppercase cursor-pointer"
                value={formData.CON_Type} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleTypeChange(e.target.value as ConsumptionFormData['CON_Type'])}
              >
                <option value="ELECTRICITE" className="bg-[#0F172A]">Électricité</option>
                <option value="EAU" className="bg-[#0F172A]">Eau</option>
                <option value="GAZ" className="bg-[#0F172A]">Gaz</option>
                <option value="CARBURANT" className="bg-[#0F172A]">Carburant</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="CON_SiteId" className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest uppercase font-black block">SITE D&apos;EXPLOITATION *</label>
              <select 
                id="CON_SiteId"
                className="w-full bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-sm text-white outline-none focus:border-amber-500 transition-all font-black italic uppercase cursor-pointer"
                value={formData.CON_SiteId} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, CON_SiteId: e.target.value})} 
                required
              >
                <option value="" className="bg-[#0F172A] text-slate-500">SÉLECTIONNER...</option>
                {sites.map((s) => <option key={s.S_Id} value={s.S_Id} className="bg-[#0F172A]">{s.S_Name}</option>)}
              </select>
            </div>
          </div>

          {/* Value + Unit + Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <label htmlFor="CON_Value" className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest uppercase font-black block">VALEUR *</label>
              <input 
                id="CON_Value"
                type="number" 
                step="0.01" 
                required 
                className="w-full bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-sm text-white outline-none focus:border-amber-500 font-black italic"
                value={formData.CON_Value || ''} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, CON_Value: parseFloat(e.target.value) || 0})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest uppercase font-black block">UNITÉ</label>
              <div className="w-full bg-white/5 border border-transparent p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-sm text-slate-400 font-black italic flex items-center justify-center">
                {formData.CON_Unit}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="CON_Cost" className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest uppercase font-black block">COÛT (XOF)</label>
              <input 
                id="CON_Cost"
                type="number" 
                className="w-full bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-sm text-white outline-none focus:border-amber-500 font-black italic"
                value={formData.CON_Cost || ''} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, CON_Cost: parseFloat(e.target.value) || 0})} 
              />
            </div>
          </div>

          {/* Month + Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
             <div className="space-y-2">
                <label htmlFor="CON_Month" className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest uppercase font-black block">MOIS RÉFÉRENCE</label>
                <select 
                  id="CON_Month"
                  className="w-full bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-sm text-white outline-none focus:border-amber-500 font-black italic uppercase cursor-pointer" 
                  value={formData.CON_Month} 
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, CON_Month: parseInt(e.target.value)})}
                >
                  {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1} className="bg-[#0F172A]">{new Date(0, i).toLocaleString('fr', {month: 'long'})}</option>)}
                </select>
             </div>
             <div className="space-y-2">
                <label htmlFor="CON_Year" className="text-[9px] md:text-[10px] text-slate-500 ml-2 tracking-widest uppercase font-black block">ANNÉE</label>
                <input 
                  id="CON_Year"
                  type="number" 
                  className="w-full bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-sm text-white outline-none focus:border-amber-500 font-black italic" 
                  value={formData.CON_Year} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, CON_Year: parseInt(e.target.value)})} 
                />
             </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-3 md:gap-4 pt-4 md:pt-6">
            <button 
              type="submit" 
              disabled={loading} 
              className={cn(
                "w-full bg-amber-600 py-4 md:py-6 lg:py-8 rounded-2xl md:rounded-3xl font-black uppercase text-white shadow-2xl hover:bg-amber-500 transition-all flex items-center justify-center gap-3 md:gap-4 active:scale-95 italic tracking-widest border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400",
                loading && "opacity-70 cursor-wait"
              )}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="w-5 h-5 animate-spin" aria-hidden="true" /> VALIDATION...
                </>
              ) : (
                <>
                  <Save size={20} className="w-5 h-5" aria-hidden="true" /> VALIDER L&apos;ENREGISTREMENT
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full text-[9px] md:text-[10px] text-slate-600 text-center hover:text-white transition-colors tracking-widest font-black border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 rounded py-2"
            >
              ABANDONNER LA PROCÉDURE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}