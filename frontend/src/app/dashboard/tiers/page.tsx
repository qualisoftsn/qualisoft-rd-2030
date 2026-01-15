/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Import pour la redirection
import apiClient from '@/core/api/api-client';
import { 
  Plus, X, Loader2, Trash2, Edit3, Save, Users, 
  Briefcase, Building, ChevronRight, MessageSquare, Target, Mail
} from 'lucide-react';

export default function TiersPage() {
  const router = useRouter(); // ✅ Initialisation du router
  const [tiers, setTiers] = useState<any[]>([]);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    TR_Name: '',
    TR_Email: '',
    TR_Type: 'CLIENT'
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tiers');
      setTiers(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = async (id: string) => {
    try {
      const res = await apiClient.get(`/tiers/${id}`);
      setSelectedTier(res.data);
      setIsDetailOpen(true);
    } catch (e) { alert("Erreur de chargement."); }
  };

  const handleEdit = (e: React.MouseEvent, tier: any) => {
    e.stopPropagation();
    setEditingId(tier.TR_Id);
    setForm({ TR_Name: tier.TR_Name, TR_Email: tier.TR_Email || '', TR_Type: tier.TR_Type });
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Supprimer ce tiers ?")) return;
    try {
      await apiClient.delete(`/tiers/${id}`);
      fetchData();
    } catch (e) { alert("Erreur."); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await apiClient.patch(`/tiers/${editingId}`, form);
      else await apiClient.post('/tiers', form);
      setIsModalOpen(false);
      fetchData();
    } catch (e) { alert("Erreur."); }
  };

  // ✅ REDIRECTION RÉELLE POUR LES ACTIONS RAPIDES
  const handleQuickAction = (target: string) => {
    setIsDetailOpen(false); // Ferme le volet
    if (target === 'reclamation') {
      router.push(`/dashboard/non-conformites?tierId=${selectedTier.TR_Id}`);
    } else {
      router.push(`/dashboard/paq?tierId=${selectedTier.TR_Id}`);
    }
  };

  if (loading && tiers.length === 0) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase">
      <Loader2 className="animate-spin mb-4" size={40}/> Intelligence Tiers...
    </div>
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans relative flex flex-col items-center">
      
      {/* HEADER CENTRÉ */}
      <header className="mb-12 border-b border-white/5 pb-8 flex justify-between items-end w-full max-w-7xl">
        <div className="text-left">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Intelligence <span className="text-blue-500">Tiers</span></h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3 italic">Pilotage des Parties Intéressées</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setForm({TR_Name:'', TR_Email:'', TR_Type:'CLIENT'}); setIsModalOpen(true); }} 
          className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 shadow-xl shadow-blue-900/20"
        >
          <Plus size={18} strokeWidth={3} /> Nouveau Tiers
        </button>
      </header>

      {/* GRILLE CENTRÉE DANS LA PAGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full max-w-7xl">
        {tiers.map((tier) => (
          <div 
            key={tier.TR_Id} 
            onClick={() => openDetail(tier.TR_Id)}
            className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] relative group hover:border-blue-500/40 transition-all duration-500 cursor-pointer shadow-2xl text-left"
          >
            <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={(e) => handleEdit(e, tier)} className="p-2 bg-white/5 hover:bg-blue-600 rounded-lg"><Edit3 size={14}/></button>
              <button onClick={(e) => handleDelete(e, tier.TR_Id)} className="p-2 bg-white/5 hover:bg-red-600 rounded-lg"><Trash2 size={14}/></button>
            </div>

            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                {tier.TR_Type === 'CLIENT' ? <Users size={28}/> : tier.TR_Type === 'FOURNISSEUR' ? <Briefcase size={28}/> : <Building size={28}/>}
              </div>
              <ChevronRight size={20} className="text-slate-800 group-hover:text-blue-500 transition-colors mt-4" />
            </div>

            <h3 className="text-2xl font-black uppercase italic mb-8 group-hover:translate-x-2 transition-transform text-white">{tier.TR_Name}</h3>
            
            <div className="flex items-center gap-3 border-t border-white/5 pt-6">
               <span className="text-[9px] font-black uppercase px-4 py-1.5 bg-blue-600/10 text-blue-400 rounded-full border border-blue-500/20 italic">
                 {tier.TR_Type}
               </span>
            </div>
          </div>
        ))}
      </div>

      {/* PANNEAU DÉTAIL 360° */}
      {isDetailOpen && selectedTier && (
        <div className="fixed inset-0 z-150 flex justify-end">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsDetailOpen(false)} />
          <div className="relative w-full max-w-xl bg-[#0B0F1A] border-l border-white/10 h-full p-12 shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto italic">
            <button onClick={() => setIsDetailOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={32}/></button>
            
            <div className="mb-12 text-left">
                <span className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] italic">Intelligence Tiers</span>
                <h2 className="text-5xl font-black uppercase italic mt-2 text-white leading-none">{selectedTier.TR_Name}</h2>
                <p className="text-slate-500 text-xs mt-3 font-bold">{selectedTier.TR_Email}</p>
            </div>

            <div className="space-y-10">
              <div className="grid grid-cols-2 gap-6 text-left">
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem]">
                  <MessageSquare className="text-blue-500 mb-4" size={24} />
                  <p className="text-[10px] font-black uppercase text-slate-500">Réclamations</p>
                  <p className="text-4xl font-black italic text-white">{selectedTier.stats?.reclamations || 0}</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem]">
                  <Target className="text-emerald-500 mb-4" size={24} />
                  <p className="text-[10px] font-black uppercase text-slate-500">Actions SMI</p>
                  <p className="text-4xl font-black italic text-white">{selectedTier.stats?.actions || 0}</p>
                </div>
              </div>

              {/* ACTIONS RAPIDES CONNECTÉES */}
              <div className="space-y-4 pt-10 border-t border-white/10 text-left">
                <h4 className="text-[10px] font-black uppercase text-slate-600 ml-2 tracking-widest mb-4">Actions de pilotage</h4>
                <button 
                  onClick={() => handleQuickAction('reclamation')}
                  className="w-full flex items-center justify-between p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl hover:bg-blue-600/20 transition-all"
                >
                  <span className="text-[11px] font-black uppercase italic tracking-widest">Saisir une réclamation</span>
                  <Plus size={18} className="text-blue-500" />
                </button>
                <button 
                  onClick={() => handleQuickAction('action')}
                  className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all"
                >
                  <span className="text-[11px] font-black uppercase italic tracking-widest">Lancer une action (PAQ)</span>
                  <Target size={18} className="text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORMULAIRE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-200 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 text-left">
          <form onSubmit={handleSubmit} className="bg-[#0B0F1A] border border-white/10 p-14 rounded-[4rem] w-full max-w-xl shadow-2xl relative animate-in zoom-in duration-300 italic">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white"><X size={32}/></button>
            <h2 className="text-5xl font-black uppercase italic mb-10 text-white">Fiche <span className="text-blue-500">Tiers</span></h2>
            <div className="space-y-6">
              <input required className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-sm text-white outline-none focus:border-blue-500 uppercase font-black italic" value={form.TR_Name} onChange={e => setForm({...form, TR_Name: e.target.value})} placeholder="NOM DU TIERS" />
              <input type="email" className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-sm text-white outline-none focus:border-blue-500 font-black italic" value={form.TR_Email} onChange={e => setForm({...form, TR_Email: e.target.value})} placeholder="EMAIL DE CONTACT" />
              <select required className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl text-sm text-white outline-none font-black italic" value={form.TR_Type} onChange={e => setForm({...form, TR_Type: e.target.value})}>
                <option value="CLIENT">CLIENT</option>
                <option value="FOURNISSEUR">FOURNISSEUR</option>
                <option value="PARTENAIRE">PARTENAIRE</option>
                <option value="ETAT">ETAT / ADMINISTRATION</option>
              </select>
              <button type="submit" className="w-full py-7 bg-blue-600 rounded-4xl uppercase font-black italic text-[10px] tracking-[0.4em] shadow-2xl">Enregistrer au Registre</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}