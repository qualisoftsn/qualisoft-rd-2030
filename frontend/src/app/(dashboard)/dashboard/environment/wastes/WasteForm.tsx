/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * ♻️ FORMULAIRE DE CRÉATION DÉCHETS (ISO 14001 §8.1)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, ChangeEvent, FormEvent } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { X, Save, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

export interface Site {
  S_Id: string;
  S_Name: string;
}

export interface WasteFormData {
  WAS_Label: string;
  WAS_Weight: number;
  WAS_Type: 'BANAL' | 'RECYCLABLE' | 'DANGEREUX' | 'INDUSTRIEL' | 'AUTRE';
  WAS_Treatment: 'ENFOUISSEMENT' | 'RECYCLAGE' | 'INCINERATION' | 'VALORISATION';
  WAS_Month: number;
  WAS_Year: number;
  WAS_SiteId: string;
}

interface WasteFormProps {
  onClose: () => void;
  onSuccess: () => void;
  sites: Site[];
}

export default function WasteForm({ onClose, onSuccess, sites }: WasteFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<WasteFormData>({
    WAS_Label: '',
    WAS_Weight: 0,
    WAS_Type: 'BANAL',
    WAS_Treatment: 'ENFOUISSEMENT',
    WAS_Month: new Date().getMonth() + 1,
    WAS_Year: new Date().getFullYear(),
    WAS_SiteId: sites[0]?.S_Id || ''
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.WAS_SiteId) return toast.error("SITE D'ORIGINE OBLIGATOIRE (§4.4)");
    
    setLoading(true);
    const toastId = toast.loading("Scellage du flux déchet...");
    try {
      await apiClient.post('/wastes', {
        ...formData,
        WAS_Label: formData.WAS_Label.toUpperCase(),
        WAS_Weight: Number(formData.WAS_Weight)
      });
      toast.success("FLUX DÉCHET SCELLÉ AVEC SUCCÈS", { id: toastId });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || "ERREUR DE SCELLAGE", { id: toastId });
    } finally { 
      setLoading(false); 
    }
  };

  // Close on Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4 md:p-6 italic font-black uppercase"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0F172A] w-full max-w-2xl rounded-2xl md:rounded-3xl border-2 border-white/10 p-6 md:p-8 lg:p-12 space-y-6 md:space-y-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        
        <header className="flex justify-between items-center border-b border-white/5 pb-6 md:pb-8">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="p-3 md:p-4 bg-emerald-500/10 rounded-xl md:rounded-2xl border border-emerald-500/20 text-emerald-400">
              <Trash2 size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 id="form-title" className="text-xl md:text-2xl lg:text-3xl text-white m-0 tracking-tighter italic">
                Nouveau <span className="text-emerald-400">Flux</span>
              </h2>
              <p className="text-[8px] md:text-[9px] text-slate-500 tracking-widest m-0 italic mt-1 md:mt-2 uppercase font-black">
                Traçabilité ISO 14001 §8.1
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-white/5 rounded-lg transition-all border-none bg-transparent cursor-pointer text-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Fermer le formulaire"
          >
            <X size={20} className="w-5 h-5 md:w-7 md:h-7" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 text-left" noValidate>
          {/* Label */}
          <div className="space-y-2 md:space-y-3">
            <label htmlFor="WAS_Label" className="text-[9px] md:text-[10px] text-slate-500 ml-2 md:ml-4 tracking-widest block">
              DÉSIGNATION DU MATÉRIAU <span className="text-rose-400">*</span>
            </label>
            <input 
              id="WAS_Label"
              required 
              value={formData.WAS_Label} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, WAS_Label: e.target.value})} 
              placeholder="EX: CÂBLES CUIVRE HORS D'USAGE..." 
              className="w-full bg-black/40 border-2 border-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl text-sm md:text-base text-white outline-none focus:border-emerald-500 transition-all font-black italic uppercase placeholder:text-slate-700 shadow-inner"
              aria-required="true"
            />
          </div>

          {/* Type + Site */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2 md:space-y-3">
               <label htmlFor="WAS_Type" className="text-[9px] md:text-[10px] text-slate-500 ml-2 md:ml-4 tracking-widest block">TYPE (§8.1)</label>
               <select 
                 id="WAS_Type"
                 className="w-full bg-black/40 border-2 border-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-xs text-white outline-none focus:border-emerald-500 italic appearance-none cursor-pointer" 
                 value={formData.WAS_Type} 
                 onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, WAS_Type: e.target.value as WasteFormData['WAS_Type']})}
               >
                 <option value="BANAL" className="bg-[#0B0F1A]">Banal (DIB)</option>
                 <option value="RECYCLABLE" className="bg-[#0B0F1A]">Recyclable</option>
                 <option value="DANGEREUX" className="bg-[#0B0F1A]">Dangereux (DD)</option>
                 <option value="INDUSTRIEL" className="bg-[#0B0F1A]">Industriel</option>
                 <option value="AUTRE" className="bg-[#0B0F1A]">Autre</option>
               </select>
            </div>
            <div className="space-y-2 md:space-y-3">
               <label htmlFor="WAS_SiteId" className="text-[9px] md:text-[10px] text-slate-500 ml-2 md:ml-4 tracking-widest block">
                 SITE D&apos;ORIGINE <span className="text-rose-400">*</span>
               </label>
               <select 
                 id="WAS_SiteId"
                 required 
                 className="w-full bg-black/40 border-2 border-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-xs text-white outline-none focus:border-emerald-500 italic appearance-none cursor-pointer" 
                 value={formData.WAS_SiteId} 
                 onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, WAS_SiteId: e.target.value})}
                 aria-required="true"
               >
                 <option value="" className="bg-[#0B0F1A] text-slate-500">CHOISIR SITE...</option>
                 {sites.map((s) => <option key={s.S_Id} value={s.S_Id} className="bg-[#0B0F1A] text-white">{s.S_Name}</option>)}
               </select>
            </div>
          </div>

          {/* Weight + Treatment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 bg-black/20 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 shadow-inner">
            <div className="space-y-2 md:space-y-3">
               <label htmlFor="WAS_Weight" className="text-[8px] md:text-[9px] text-slate-500 ml-2 md:ml-4 tracking-widest block">QUANTITÉ (KG) <span className="text-rose-400">*</span></label>
               <input 
                 id="WAS_Weight"
                 type="number" 
                 step="0.1" 
                 required 
                 value={formData.WAS_Weight || ''} 
                 onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, WAS_Weight: parseFloat(e.target.value) || 0})} 
                 className="w-full bg-transparent border-b-2 border-white/10 p-2 md:p-3 text-xl md:text-2xl font-black text-emerald-400 outline-none focus:border-emerald-500 transition-all italic"
                 aria-required="true"
               />
            </div>
            <div className="space-y-2 md:space-y-3">
               <label htmlFor="WAS_Treatment" className="text-[8px] md:text-[9px] text-slate-500 ml-2 md:ml-4 tracking-widest block">TRAITEMENT</label>
               <select 
                 id="WAS_Treatment"
                 className="w-full bg-transparent border-b-2 border-white/10 p-2 md:p-3 text-[10px] md:text-[11px] font-black text-white outline-none focus:border-emerald-500 italic cursor-pointer appearance-none" 
                 value={formData.WAS_Treatment} 
                 onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({...formData, WAS_Treatment: e.target.value as WasteFormData['WAS_Treatment']})}
               >
                 <option value="ENFOUISSEMENT" className="bg-[#0B0F1A]">Enfouissement</option>
                 <option value="RECYCLAGE" className="bg-[#0B0F1A]">Recyclage</option>
                 <option value="INCINERATION" className="bg-[#0B0F1A]">Incinération</option>
                 <option value="VALORISATION" className="bg-[#0B0F1A]">Valorisation</option>
               </select>
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading} 
            className={cn(
              "w-full bg-emerald-600 py-4 md:py-6 md:py-8 rounded-xl md:rounded-3xl font-black uppercase text-white shadow-2xl hover:bg-white hover:text-emerald-600 transition-all flex items-center justify-center gap-4 md:gap-6 active:scale-95 italic tracking-widest border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400",
              loading && "opacity-70 cursor-wait"
            )}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 size={24} className="w-6 h-6 md:w-8 md:h-8 animate-spin" aria-hidden="true" /> 
                TRAITEMENT...
              </>
            ) : (
              <>
                <Save size={24} className="w-6 h-6 md:w-8 md:h-8" strokeWidth={3} aria-hidden="true" /> 
                Sceller dans le SMI
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}