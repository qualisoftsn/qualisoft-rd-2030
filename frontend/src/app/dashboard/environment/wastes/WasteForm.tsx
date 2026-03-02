/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ♻️ FORMULAIRE DE CRÉATION DÉCHETS (ISO 14001)
 * Focus : Traçabilité immuable des flux et conformité réglementaire.
 * Fix : Centrage z-index, gestion Sonner, et ergonomie Matrix.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:29 GMT
 */

'use client';

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, Loader2, Recycle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
    if (!formData.WAS_SiteId) return toast.error("VEUILLEZ SÉLECTIONNER UN SITE (§4.4)");
    
    setLoading(true);
    const tid = toast.loading("INDEXATION DU FLUX DÉCHET...");
    try {
      await apiClient.post('/wastes', {
        ...formData,
        WAS_Label: formData.WAS_Label.toUpperCase(),
        WAS_Weight: Number(formData.WAS_Weight)
      });
      toast.success("DÉCHET ENREGISTRÉ DANS LE REGISTRE SDE", { id: tid });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR DE SCELLAGE", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-600 flex items-center justify-center p-4 italic font-black uppercase">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-4xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-2xl">
               <Trash2 className="text-green-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none m-0">
                Nouveau <span className="text-green-600">Déchet</span>
              </h2>
              <p className="text-[8px] text-slate-400 tracking-widest mt-1 m-0">Traçabilité Flux ISO 14001</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors border-none bg-transparent cursor-pointer text-slate-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
          {/* LIBELLÉ */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic leading-none">Libellé du Flux *</label>
            <input 
              type="text" required
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-black text-slate-700 outline-none focus:border-green-500 transition-all italic uppercase"
              placeholder="EX: CARTONS, DÉCHETS ÉLECTRONIQUES..."
              value={formData.WAS_Label}
              onChange={(e) => setFormData({...formData, WAS_Label: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic leading-none">Type de Déchet</label>
              <select className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-black text-slate-700 focus:border-green-500 outline-none cursor-pointer italic appearance-none"
                value={formData.WAS_Type} onChange={(e) => setFormData({...formData, WAS_Type: e.target.value})} required>
                <option value="Banal">Banal (DIB)</option>
                <option value="Recyclable">Recyclable</option>
                <option value="Dangereux">Dangereux (DD)</option>
                <option value="Organique">Organique</option>
                <option value="Chimique">Chimique</option>
                <option value="Médical">Médical (DASRI)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic leading-none">Mode de Traitement</label>
              <select className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-black text-slate-700 focus:border-green-500 outline-none cursor-pointer italic appearance-none"
                value={formData.WAS_Treatment} onChange={(e) => setFormData({...formData, WAS_Treatment: e.target.value})} required>
                <option value="Enfouissement">Enfouissement</option>
                <option value="Recyclage">Recyclage</option>
                <option value="Incinération">Incinération</option>
                <option value="Valorisation">Valorisation Énergétique</option>
                <option value="Traitement Spécial">Traitement Spécial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic leading-none">Quantité (kg) *</label>
              <input type="number" step="0.1" required className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-black text-slate-700 outline-none focus:border-green-500 italic"
                value={formData.WAS_Weight} onChange={(e) => setFormData({...formData, WAS_Weight: parseFloat(e.target.value)})} />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic leading-none">Mois</label>
              <select className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-black text-slate-700 outline-none cursor-pointer italic appearance-none"
                value={formData.WAS_Month} onChange={(e) => setFormData({...formData, WAS_Month: parseInt(e.target.value)})} required>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i, 1).toLocaleString('fr-FR', { month: 'long' }).toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic leading-none">Année</label>
              <select className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-black text-slate-700 outline-none cursor-pointer italic appearance-none"
                value={formData.WAS_Year} onChange={(e) => setFormData({...formData, WAS_Year: parseInt(e.target.value)})} required>
                {[2026, 2025, 2024, 2023].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 italic leading-none">Site d&apos;Origine (§4.4) *</label>
            <select className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-5 font-black text-slate-700 focus:border-green-500 outline-none cursor-pointer italic appearance-none"
              value={formData.WAS_SiteId} onChange={(e) => setFormData({...formData, WAS_SiteId: e.target.value})} required>
              <option value="">CHOISIR SITE...</option>
              {sites.map(site => (
                <option key={site.S_Id} value={site.S_Id}>{site.S_Name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-green-600 transition-all shadow-3xl italic border-none cursor-pointer active:scale-95">
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Enregistrer dans le Registre SDE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}