/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📍 MODULE : GESTION DES SITES GÉOGRAPHIQUES
 * -------------------------------------------------------------------------
 * FONCTION : Inventaire des implantations physiques du groupe.
 * RÔLE : Détermination du périmètre du SMI (§4.3 ISO 9001).
 * MODÈLE : Utilise le préfixe 'S_' pour la structure de données Master.
 */

'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  MapPin, Plus, Loader2, Navigation, ArrowLeft, 
  X, Save, Building2, Trash2, Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function SettingsSitesPage() {
  const router = useRouter();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({ S_Name: '', S_Address: '' });

  /**
   * 📡 SYNCHRONISATION DU RÉFÉRENTIEL SITES
   */
  const fetchSites = async () => {
    try {
      const res = await apiClient.get('/admin/sites');
      setSites(res.data || []);
    } catch (err) {
      toast.error("Échec de synchronisation des sites.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSites(); }, []);

  /**
   * ➕ CRÉATION D'UNE IMPLANTATION
   * Scelle un nouveau site dans le périmètre du SMI.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.post('/admin/sites', formData);
      toast.success("Site scellé avec succès.");
      setFormData({ S_Name: '', S_Address: '' });
      setIsModalOpen(false);
      fetchSites();
    } catch (err) {
      toast.error("Erreur d'écriture Master.");
    } finally { setIsSaving(false); }
  };

  /**
   * 🗑️ RÉVOCATION D'UN SITE
   */
  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ RÉVOCATION : Retirer ce site du périmètre SMI ?")) return;
    try {
      await apiClient.delete(`/admin/sites/${id}`);
      toast.success("Site révoqué.");
      fetchSites();
    } catch (e) { toast.error("Le site est lié à des processus actifs."); }
  };

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <p className="text-[10px] font-black uppercase italic text-blue-500 tracking-[0.5em] animate-pulse">Cartographie des sites...</p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left relative overflow-x-hidden">
      <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-10">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all text-white border-none cursor-pointer active:scale-95"><ArrowLeft size={20}/></button>
          <div className="text-left">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Gestion des <span className="text-blue-500">Sites</span></h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-3 italic leading-none">Périmètre géographique du SMI (§4.3)</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 rounded-2xl font-black uppercase italic text-xs shadow-xl shadow-blue-900/40 flex items-center gap-3 transition-all active:scale-95 border-none cursor-pointer">
          <Plus size={18} strokeWidth={3} /> Ajouter une implantation
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sites.length > 0 ? sites.map((site) => (
          <div key={site.S_Id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] group hover:border-blue-500/30 transition-all relative overflow-hidden shadow-2xl text-left">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><MapPin size={28}/></div>
              <button onClick={() => handleDelete(site.S_Id)} className="text-slate-800 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"><Trash2 size={20} /></button>
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-100 leading-tight mb-4">{site.S_Name}</h3>
              <div className="flex items-center gap-3 text-slate-500">
                <Navigation size={14} className="text-blue-500 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-widest italic truncate">{site.S_Address || 'ADRESSE NON SCÉLLÉE'}</p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all" />
          </div>
        )) : (
          <div className="col-span-full py-32 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10 opacity-30 italic">
            <Building2 size={60} className="mx-auto mb-6 text-slate-700" />
            <p className="font-black uppercase text-sm tracking-[0.5em]">Registre de sites vide</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-6 backdrop-blur-xl bg-black/80 animate-in fade-in duration-300">
          <form onSubmit={handleSubmit} className="relative bg-[#0F172A] border border-white/10 p-14 rounded-[4.5rem] w-full max-w-lg shadow-4xl animate-in zoom-in-95 duration-500 text-left italic">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-red-500 transition-all border-none cursor-pointer"><X size={24}/></button>
            <div className="mb-12">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-3">Nouveau <span className="text-blue-500">Site</span></h2>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic leading-none">Ajout au périmètre physique §4.3</p>
            </div>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-3 italic tracking-widest">Désignation Master (S_Name)</label>
                <input required placeholder="EX: SIÈGE SOCIAL / USINE NORD" className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm font-black uppercase italic outline-none focus:border-blue-500 transition-all text-white shadow-inner"
                  value={formData.S_Name} onChange={e => setFormData({...formData, S_Name: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-3 italic tracking-widest">Localisation Complète (S_Address)</label>
                <input placeholder="DAKAR, PLATEAU, RUE 12..." className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm font-black uppercase italic outline-none focus:border-blue-500 transition-all text-white shadow-inner"
                  value={formData.S_Address} onChange={e => setFormData({...formData, S_Address: e.target.value})} />
              </div>
              <button type="submit" disabled={isSaving} className="w-full bg-blue-600 py-7 mt-4 rounded-4xl font-black uppercase italic text-xs tracking-[0.4em] shadow-3xl hover:bg-blue-500 transition-all flex items-center justify-center gap-4 border-none cursor-pointer text-white">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Enregistrer au Registre</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}