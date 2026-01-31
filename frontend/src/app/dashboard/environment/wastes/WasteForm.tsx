'use client';

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WasteFormProps {
  onClose: () => void;
  onSuccess: () => void;
  sites: any[];
}

export default function WasteForm({ onClose, onSuccess, sites }: WasteFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    WAS_Label: '',
    WAS_Weight: 0,
    WAS_Type: 'Banal',
    WAS_Treatment: 'Enfouissement',
    WAS_Month: new Date().getMonth() + 1,
    WAS_Year: new Date().getFullYear(),
    WAS_SiteId: sites[0]?.S_Id || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/wastes', formData);
      toast.success("Déchet enregistré avec succès");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erreur création déchet:", err);
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
            Nouveau <span className="text-green-600">Déchet</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Libellé</label>
            <input 
              type="text"
              required
              className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
              placeholder="Ex: Déchets électroniques, Cartons, etc."
              value={formData.WAS_Label}
              onChange={(e) => setFormData({...formData, WAS_Label: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Type de déchet</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.WAS_Type}
                onChange={(e) => setFormData({...formData, WAS_Type: e.target.value})}
                required
              >
                <option value="Banal">Banal</option>
                <option value="Recyclable">Recyclable</option>
                <option value="Dangereux">Dangereux</option>
                <option value="Organique">Organique</option>
                <option value="Chimique">Chimique</option>
                <option value="Médical">Médical</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Traitement</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.WAS_Treatment}
                onChange={(e) => setFormData({...formData, WAS_Treatment: e.target.value})}
                required
              >
                <option value="Enfouissement">Enfouissement</option>
                <option value="Recyclage">Recyclage</option>
                <option value="Incinération">Incinération</option>
                <option value="Valorisation">Valorisation Énergétique</option>
                <option value="Traitement Spécial">Traitement Spécial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Quantité (kg)</label>
              <input 
                type="number"
                step="0.1"
                required
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
                value={formData.WAS_Weight}
                onChange={(e) => setFormData({...formData, WAS_Weight: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Mois</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
                value={formData.WAS_Month}
                onChange={(e) => setFormData({...formData, WAS_Month: parseInt(e.target.value)})}
                required
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleString('fr-FR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Année</label>
              <select 
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 outline-none"
                value={formData.WAS_Year}
                onChange={(e) => setFormData({...formData, WAS_Year: parseInt(e.target.value)})}
                required
              >
                {[2024, 2023, 2022, 2021, 2020].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-2">Site</label>
            <select 
              className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.WAS_SiteId}
              onChange={(e) => setFormData({...formData, WAS_SiteId: e.target.value})}
              required
            >
              {sites.map(site => (
                <option key={site.S_Id} value={site.S_Id}>{site.S_Name}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Enregistrer le Déchet
          </button>
        </form>
      </div>
    </div>
  );
}