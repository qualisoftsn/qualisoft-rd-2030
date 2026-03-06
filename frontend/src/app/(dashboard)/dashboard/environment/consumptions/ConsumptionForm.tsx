/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛠️ FORMULAIRE DE SAISIE DES CONSOMMATIONS (ISO 14001)
 * Fix : Standardisation de Sonner pour les notifications et typage des props.
 * Focus : Conservation intégrale de la logique de changement d'unité.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:22 GMT
 */

'use client';

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, Loader2, Zap, Droplets, Flame, Fuel } from 'lucide-react';
import { toast } from 'sonner';

interface ConsumptionFormProps {
  onClose: () => void;
  onSuccess: () => void;
  sites: any[];
}

export default function ConsumptionForm({ onClose, onSuccess, sites }: ConsumptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    CON_Type: 'Électricité',
    CON_Value: 0,
    CON_Unit: 'kWh',
    CON_Month: new Date().getMonth() + 1,
    CON_Year: new Date().getFullYear(),
    CON_Cost: 0,
    CON_SiteId: sites.length > 0 ? sites[0].S_Id : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.CON_SiteId) return toast.error("VEUILLEZ SÉLECTIONNER UN SITE");
    
    setLoading(true);
    const tid = toast.loading("ENREGISTREMENT ISO 14001...");
    try {
      await apiClient.post('/consumptions', formData);
      toast.success("CONSOMMATION INDEXÉE DANS LE MATRIX KERNEL", { id: tid });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR D'ENREGISTREMENT", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    let unit = 'kWh';
    if (type === 'Eau' || type === 'Gaz') unit = 'm³';
    if (type === 'Carburant') unit = 'LITRES';
    setFormData(prev => ({ ...prev, CON_Type: type, CON_Unit: unit }));
  };

  const getIcon = () => {
    if (formData.CON_Type === 'Eau') return <Droplets className="text-blue-500" />;
    if (formData.CON_Type === 'Gaz') return <Flame className="text-red-500" />;
    if (formData.CON_Type === 'Carburant') return <Fuel className="text-emerald-500" />;
    return <Zap className="text-amber-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-600 flex items-center justify-center p-6 italic font-black uppercase">
      <div className="bg-[#0F172A] w-full max-w-2xl rounded-[4rem] border border-white/10 p-12 lg:p-16 space-y-10 shadow-4xl animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-start border-b border-white/10 pb-8 text-left">
          <div>
            <h2 className="text-4xl tracking-tighter text-white italic uppercase leading-none m-0">
              SAISIE <span className="text-amber-500">MESURE</span>
            </h2>
            <p className="text-[9px] text-slate-500 tracking-[0.3em] mt-3 m-0">INDEXATION CONSOMMATION §9.1.1</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl shrink-0">
            {getIcon()}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase font-black">TYPE DE RESSOURCE</label>
              <select className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl text-sm text-white outline-none focus:border-amber-500 transition-all font-black italic uppercase cursor-pointer"
                value={formData.CON_Type} onChange={(e) => handleTypeChange(e.target.value)}>
                <option value="Électricité" className="bg-[#0F172A]">Électricité</option>
                <option value="Eau" className="bg-[#0F172A]">Eau</option>
                <option value="Gaz" className="bg-[#0F172A]">Gaz</option>
                <option value="Carburant" className="bg-[#0F172A]">Carburant</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase font-black">SITE D&apos;EXPLOITATION</label>
              <select className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl text-sm text-white outline-none focus:border-amber-500 transition-all font-black italic uppercase cursor-pointer"
                value={formData.CON_SiteId} onChange={(e) => setFormData({...formData, CON_SiteId: e.target.value})} required>
                <option value="" className="bg-[#0F172A]">SÉLECTIONNER...</option>
                {sites.map((s:any) => <option key={s.S_Id} value={s.S_Id} className="bg-[#0F172A]">{s.S_Name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase font-black">VALEUR</label>
              <input type="number" step="0.01" required className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl text-sm text-white outline-none focus:border-amber-500 font-black italic"
                value={formData.CON_Value} onChange={(e) => setFormData({...formData, CON_Value: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase font-black">UNITÉ</label>
              <div className="w-full bg-white/5 border border-transparent p-6 rounded-4xl text-sm text-slate-500 font-black italic flex items-center justify-center">
                {formData.CON_Unit}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase font-black">COÛT (XOF)</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl text-sm text-white outline-none focus:border-amber-500 font-black italic"
                value={formData.CON_Cost} onChange={(e) => setFormData({...formData, CON_Cost: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-3">
                <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase font-black">MOIS RÉFÉRENCE</label>
                <select className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl text-sm text-white outline-none focus:border-amber-500 font-black italic uppercase cursor-pointer" value={formData.CON_Month} onChange={(e) => setFormData({...formData, CON_Month: parseInt(e.target.value)})}>
                  {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1} className="bg-[#0F172A]">{new Date(0, i).toLocaleString('fr', {month: 'long'})}</option>)}
                </select>
             </div>
             <div className="space-y-3">
                <label className="text-[10px] text-slate-500 ml-6 tracking-widest uppercase font-black">ANNÉE</label>
                <input type="number" className="w-full bg-white/5 border border-white/10 p-6 rounded-4xl text-sm text-white outline-none focus:border-amber-500 font-black italic" value={formData.CON_Year} onChange={(e) => setFormData({...formData, CON_Year: parseInt(e.target.value)})} />
             </div>
          </div>

          <div className="flex flex-col gap-6 pt-6">
            <button type="submit" disabled={loading} className="w-full bg-amber-600 py-8 rounded-[2.5rem] font-black uppercase text-white shadow-3xl hover:bg-amber-500 transition-all flex items-center justify-center gap-4 active:scale-95 italic tracking-widest border-none cursor-pointer">
              {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />} VALIDER L&apos;ENREGISTREMENT
            </button>
            <button type="button" onClick={onClose} className="w-full text-[11px] text-slate-600 text-center hover:text-white transition-colors tracking-[0.5em] font-black border-none bg-transparent cursor-pointer">
              ABANDONNER LA PROCÉDURE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}