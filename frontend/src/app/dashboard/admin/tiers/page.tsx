/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Truck, 
  UserPlus, 
  Search, 
  Globe, 
  MoreHorizontal, 
  Loader2, 
  Building,
  Mail,
  X,
  Save,
  CheckCircle2,
  Filter
} from 'lucide-react';

export default function TiersRegistryPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // État du formulaire pour un nouveau tiers
  const [formData, setFormData] = useState({
    TR_Name: '',
    TR_Type: 'CLIENT',
    TR_Email: '',
    TR_CodeExterne: ''
  });

  const fetchTiers = async () => {
    try {
      const res = await apiClient.get('/tiers');
      setTiers(res.data);
    } catch (err) {
      console.error("Erreur récupération tiers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.post('/tiers', formData);
      setFormData({ TR_Name: '', TR_Type: 'CLIENT', TR_Email: '', TR_CodeExterne: '' });
      setIsModalOpen(false);
      await fetchTiers();
    } catch (err) {
      alert("Erreur lors de la création du partenaire.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTiers = tiers.filter(t => 
    t.TR_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.TR_CodeExterne?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left relative overflow-x-hidden">
      
      {/* HEADER ELITE */}
      <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            Registre <span className="text-blue-500">Tiers</span>
          </h1>
          <div className="flex gap-6 mt-6">
            <StatCard count={tiers.length} label="Total Partenaires" color="blue" />
            <StatCard count={tiers.filter(t => t.TR_Type === 'CLIENT').length} label="Portefeuille Clients" color="emerald" />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-4 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold outline-none focus:border-blue-500 w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-lg shadow-blue-900/20 flex items-center gap-3 transition-all active:scale-95"
          >
            <UserPlus size={18} /> Nouveau Tiers
          </button>
        </div>
      </header>

      {/* GRID DES TIERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTiers.length > 0 ? filteredTiers.map((t) => (
          <div key={t.TR_Id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] hover:bg-white/2 transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 border border-white/10 group-hover:scale-110 transition-transform">
                <Truck size={24} />
              </div>
              <span className={`text-[8px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest ${
                t.TR_Type === 'CLIENT' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 
                t.TR_Type === 'FOURNISSEUR' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' : 
                'text-blue-400 border-blue-500/20 bg-blue-500/5'
              }`}>
                {t.TR_Type}
              </span>
            </div>

            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-1 text-slate-100">{t.TR_Name}</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 italic truncate">
              CODE: {t.TR_CodeExterne || 'SANS_ID'}
            </p>

            <div className="space-y-3 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold italic uppercase">
                <Mail size={12} className="text-blue-500" /> {t.TR_Email || 'Email non défini'}
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold italic uppercase">
                <Globe size={12} className="text-emerald-500" /> Partenaire Externe
              </div>
            </div>

            <button className="absolute top-8 right-8 text-slate-700 hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
        )) : (
          <div className="col-span-full py-24 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10 opacity-30">
            <Building size={48} className="mx-auto mb-4" />
            <p className="font-black uppercase italic text-xs tracking-[0.3em]">Aucun tiers identifié dans le registre</p>
          </div>
        )}
      </div>

      {/* MODAL D'AJOUT ELITE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="absolute inset-0 bg-[#0B0F1A]/80" onClick={() => setIsModalOpen(false)}></div>
          <form 
            onSubmit={handleSubmit}
            className="relative bg-slate-900 border border-white/10 p-12 rounded-[4rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                Ajouter un <span className="text-blue-500">Tiers</span>
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
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Raison Sociale</label>
                <input 
                  required
                  placeholder="Nom de l'entreprise"
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-inner"
                  value={formData.TR_Name}
                  onChange={e => setFormData({...formData, TR_Name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Type de relation</label>
                  <select 
                    className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-sm font-black text-blue-400 outline-none cursor-pointer"
                    value={formData.TR_Type}
                    onChange={e => setFormData({...formData, TR_Type: e.target.value})}
                  >
                    <option value="CLIENT">Client</option>
                    <option value="FOURNISSEUR">Fournisseur</option>
                    <option value="PARTENAIRE">Partenaire</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Code Externe</label>
                  <input 
                    placeholder="Ex: C-2024-001"
                    className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                    value={formData.TR_CodeExterne}
                    onChange={e => setFormData({...formData, TR_CodeExterne: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2 pb-6">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">Email de contact</label>
                <input 
                  type="email"
                  placeholder="contact@partenaire.com"
                  className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-5 text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  value={formData.TR_Email}
                  onChange={e => setFormData({...formData, TR_Email: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-blue-600 py-6 rounded-3xl font-black uppercase italic text-sm shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Valider l&apos;enrôlement</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// COMPOSANT STATS INTERNE
function StatCard({ count, label, color }: { count: number, label: string, color: string }) {
  const colorMap: any = {
    blue: "bg-blue-600/20 text-blue-500 border-blue-500/20",
    emerald: "bg-emerald-500/20 text-emerald-500 border-emerald-500/20"
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-4 min-w-45">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black italic border ${colorMap[color]}`}>
        {count}
      </div>
      <div>
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 italic">{label}</p>
        <p className="text-xs font-black text-white uppercase italic">Enregistrés</p>
      </div>
    </div>
  );
}