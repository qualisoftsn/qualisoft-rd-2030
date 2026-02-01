/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
    if (!formData.CON_SiteId) {
      toast.error("Veuillez sélectionner un site");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/consumptions', formData);
      toast.success("Consommation enregistrée");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur d'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    let unit = 'kWh';
    if (type === 'Eau' || type === 'Gaz') unit = 'm³';
    if (type === 'Carburant') unit = 'litres';
    setFormData(prev => ({ ...prev, CON_Type: type, CON_Unit: unit }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">
            Saisie <span className="text-amber-600">Consommation</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Type</label>
              <select 
                className="w-full bg-slate-100 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500"
                value={formData.CON_Type}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="Électricité">Électricité</option>
                <option value="Eau">Eau</option>
                <option value="Gaz">Gaz</option>
                <option value="Carburant">Carburant</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Site</label>
              <select 
                className="w-full bg-slate-100 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500"
                value={formData.CON_SiteId}
                onChange={(e) => setFormData({...formData, CON_SiteId: e.target.value})}
                required
              >
                <option value="">Sélectionner...</option>
                {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Valeur</label>
              <input type="number" step="0.01" required className="w-full bg-slate-100 rounded-2xl p-4 font-bold"
                value={formData.CON_Value} onChange={(e) => setFormData({...formData, CON_Value: parseFloat(e.target.value)})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Unité</label>
              <input readOnly className="w-full bg-slate-50 rounded-2xl p-4 font-bold text-slate-400" value={formData.CON_Unit} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Coût (XOF)</label>
              <input type="number" className="w-full bg-slate-100 rounded-2xl p-4 font-bold"
                value={formData.CON_Cost} onChange={(e) => setFormData({...formData, CON_Cost: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <select className="bg-slate-100 rounded-2xl p-4 font-bold" value={formData.CON_Month} onChange={(e) => setFormData({...formData, CON_Month: parseInt(e.target.value)})}>
                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('fr', {month: 'long'})}</option>)}
             </select>
             <input type="number" className="bg-slate-100 rounded-2xl p-4 font-bold" value={formData.CON_Year} onChange={(e) => setFormData({...formData, CON_Year: parseInt(e.target.value)})} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 transition-all">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            VALIDER L'ENREGISTREMENT
          </button>
        </form>
      </div>
    </div>
  );
}