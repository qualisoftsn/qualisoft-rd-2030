/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ♻️ FORMULAIRE DE CRÉATION DÉCHETS (SDE-CORE)
 * FIX : Design Matrix Sombre, Z-index SDE, Validation ISO 14001.
 * DATE : 05 Mars 2026 | 14:20 GMT
 */
'use client';

import React, { useState } from 'react';
import apiClient from '@/core/api/api-client';
import { X, Save, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WasteForm({ onClose, onSuccess, sites }: any) {
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
    if (!formData.WAS_SiteId) return toast.error("SITE D'ORIGINE OBLIGATOIRE (§4.4)");
    
    setLoading(true);
    const tid = toast.loading("Scellage du flux déchet...");
    try {
      await apiClient.post('/wastes', {
        ...formData,
        WAS_Label: formData.WAS_Label.toUpperCase(),
        WAS_Weight: Number(formData.WAS_Weight)
      });
      toast.success("FLUX DÉCHET SCELLÉ AVEC SUCCÈS", { id: tid });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "ERREUR DE SCELLAGE", { id: tid });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6 italic font-black uppercase">
      <div className="bg-[#0F172A] w-full max-w-2xl rounded-[4rem] border-2 border-white/10 p-12 lg:p-16 space-y-10 shadow-4xl animate-in zoom-in-95 duration-300">
        
        <header className="flex justify-between items-center border-b border-white/5 pb-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500"><Trash2 size={24}/></div>
            <div>
              <h2 className="text-3xl text-white m-0 tracking-tighter italic">Nouveau <span className="text-emerald-500">Flux</span></h2>
              <p className="text-[9px] text-slate-500 tracking-[0.4em] m-0 italic mt-2 uppercase font-black">Traçabilité ISO 14001 §8.1</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all border-none bg-transparent cursor-pointer text-slate-600 hover:text-white"><X size={28}/></button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10 text-left">
          <div className="space-y-3">
            <label className="text-[10px] text-slate-500 ml-6 tracking-widest">DÉSIGNATION DU MATÉRIAU</label>
            <input required value={formData.WAS_Label} onChange={e => setFormData({...formData, WAS_Label: e.target.value})} placeholder="EX: CÂBLES CUIVRE HORS D'USAGE..." className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-4xl text-lg text-white outline-none focus:border-emerald-500 transition-all font-black italic uppercase placeholder:text-slate-800 shadow-inner" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
               <label className="text-[10px] text-slate-500 ml-6 tracking-widest">TYPE (§8.1)</label>
               <select className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-3xl text-xs text-white outline-none focus:border-emerald-500 italic appearance-none cursor-pointer" value={formData.WAS_Type} onChange={e => setFormData({...formData, WAS_Type: e.target.value})}>
                 <option value="Banal">Banal (DIB)</option>
                 <option value="Recyclable">Recyclable</option>
                 <option value="Dangereux">Dangereux (DD)</option>
               </select>
            </div>
            <div className="space-y-3">
               <label className="text-[10px] text-slate-500 ml-6 tracking-widest">SITE D&apos;ORIGINE</label>
               <select required className="w-full bg-black/40 border-2 border-white/5 p-6 rounded-3xl text-xs text-white outline-none focus:border-emerald-500 italic appearance-none cursor-pointer" value={formData.WAS_SiteId} onChange={e => setFormData({...formData, WAS_SiteId: e.target.value})}>
                 <option value="">CHOISIR SITE...</option>
                 {sites.map((s:any) => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
               </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-black/20 p-8 rounded-[3rem] border border-white/5 shadow-inner">
            <div className="space-y-3">
               <label className="text-[10px] text-slate-400 ml-4 tracking-widest">QUANTITÉ (KG)</label>
               <input type="number" step="0.1" required value={formData.WAS_Weight} onChange={e => setFormData({...formData, WAS_Weight: parseFloat(e.target.value)})} className="w-full bg-transparent border-b-2 border-white/10 p-2 text-2xl font-black text-emerald-500 outline-none focus:border-emerald-500 transition-all italic" />
            </div>
            <div className="space-y-3">
               <label className="text-[10px] text-slate-400 ml-4 tracking-widest">TRAITEMENT</label>
               <select className="w-full bg-transparent border-b-2 border-white/10 p-2 text-[11px] font-black text-white outline-none focus:border-emerald-500 italic cursor-pointer appearance-none" value={formData.WAS_Treatment} onChange={e => setFormData({...formData, WAS_Treatment: e.target.value})}>
                 <option value="Enfouissement">Enfouissement</option>
                 <option value="Recyclage">Recyclage</option>
                 <option value="Incinération">Incinération</option>
               </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-emerald-600 py-8 rounded-[2.5rem] font-black uppercase text-white shadow-3xl hover:bg-white hover:text-emerald-600 transition-all flex items-center justify-center gap-6 active:scale-95 italic tracking-[0.4em] border-none cursor-pointer">
            {loading ? <Loader2 className="animate-spin" size={32} /> : <Save size={32} strokeWidth={3} />} Sceller dans le SMI
          </button>
        </form>
      </div>
    </div>
  );
}