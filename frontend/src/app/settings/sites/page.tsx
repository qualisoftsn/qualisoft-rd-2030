/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  MapPin, 
  Plus, 
  Loader2, 
  Navigation, 
  ArrowLeft, 
  X, 
  Save, 
  Building2,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsSitesPage() {
  const router = useRouter();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // État du formulaire avec les préfixes S_
  const [formData, setFormData] = useState({
    S_Name: '',
    S_Address: ''
  });

  const fetchSites = async () => {
    try {
      const res = await apiClient.get('/admin/sites');
      setSites(res.data);
    } catch (err) {
      console.error("Erreur de récupération des sites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.post('/admin/sites', formData);
      setFormData({ S_Name: '', S_Address: '' });
      setIsModalOpen(false);
      fetchSites();
    } catch (err) {
      alert("Erreur lors de la création du site.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left relative overflow-x-hidden">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()} 
            className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20}/>
          </button>
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              Gestion des <span className="text-blue-500">Sites</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 italic">
              Configuration des implantations géographiques du groupe
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-xl shadow-blue-900/40 flex items-center gap-3 transition-all active:scale-95"
        >
          <Plus size={18} /> Ajouter une implantation
        </button>
      </header>

      {/* GRILLE DES SITES CORRIGÉE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.length > 0 ? sites.map((site) => (
          <div key={site.S_Id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] group hover:border-blue-500/30 transition-all relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <MapPin size={24}/>
              </div>
              <button className="text-slate-700 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="relative z-10">
              {/* Utilisation de S_Name et S_Address au lieu de name/address */}
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-100">{site.S_Name}</h3>
              <div className="flex items-center gap-2 text-slate-500 mt-2">
                <Navigation size={12} className="text-blue-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest italic truncate">
                  {site.S_Address || 'Adresse non renseignée'}
                </p>
              </div>
            </div>

            {/* Glow décoratif */}
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-all"></div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10 opacity-40">
            <Building2 size={48} className="mx-auto mb-4 text-slate-600" />
            <p className="font-black uppercase italic text-xs tracking-[0.4em]">Aucun site configuré</p>
          </div>
        )}
      </div>

      {/* MODAL D'AJOUT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="absolute inset-0 bg-[#0B0F1A]/80" onClick={() => setIsModalOpen(false)}></div>
          <form 
            onSubmit={handleSubmit}
            className="relative bg-slate-900 border border-white/10 p-12 rounded-[4rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                Nouveau <span className="text-blue-500">Site</span>
              </h2>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="p-3 bg-white/5 rounded-2xl hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic text-left block">Nom du Site (S_Name)</label>
                <input 
                  required
                  placeholder="Ex: Siège Social / Usine 1" 
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500 transition-all text-white"
                  value={formData.S_Name}
                  onChange={e => setFormData({...formData, S_Name: e.target.value})}
                />
              </div>

              <div className="space-y-2 pb-6">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic text-left block">Localisation (S_Address)</label>
                <input 
                  placeholder="Ville, Quartier, Rue..." 
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500 transition-all text-white"
                  value={formData.S_Address}
                  onChange={e => setFormData({...formData, S_Address: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-blue-600 py-6 rounded-3xl font-black uppercase italic text-sm shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Enregistrer le site</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}