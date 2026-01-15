/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  MapPin, Plus, Loader2, Edit3, Trash2, X, Save, 
  AlertCircle, Building2, Users, Layers, ShieldCheck 
} from 'lucide-react';

export default function SitesCrudPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{open: boolean, mode: 'ADD' | 'EDIT', data: any}>({
    open: false, mode: 'ADD', data: { S_Name: '', S_Address: '' }
  });

  // SYNCHRONISATION AVEC L'API /SITES (Pointée précédemment sur /admin/sites)
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/sites'); // Correction de la route
      setSites(res.data);
    } catch (err: any) {
      setError("Défaut de synchronisation avec le serveur central Qualisoft.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modal.mode === 'ADD') {
        await apiClient.post('/sites', {
            S_Name: modal.data.S_Name,
            S_Address: modal.data.S_Address
        });
      } else {
        await apiClient.patch(`/sites/${modal.data.S_Id}`, {
            S_Name: modal.data.S_Name,
            S_Address: modal.data.S_Address
        });
      }
      setModal({ ...modal, open: false });
      refreshData();
    } catch (err: any) { 
      const msg = err.response?.data?.message || "Échec de l'opération.";
      alert(msg); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("PROCÉDURE CRITIQUE : Supprimer ce site supprimera toutes les entités rattachées (Départements, SSE). Confirmer ?")) return;
    try {
      await apiClient.delete(`/sites/${id}`);
      refreshData();
    } catch (err) { 
      alert("Action refusée : Ce site possède des dépendances actives bloquantes."); 
    }
  };

  if (loading) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={50} />
      <p className="text-blue-500 font-black uppercase italic tracking-widest text-xs">Chargement de la cartographie...</p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left">
      <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            Sites <span className="text-blue-500">Implantations</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4 italic">Périmètre Organisationnel du SMQ Qualisoft</p>
        </div>
        <button 
          onClick={() => setModal({open: true, mode: 'ADD', data: {S_Name: '', S_Address: ''}})} 
          className="bg-blue-600 hover:bg-blue-500 px-8 py-5 rounded-2xl font-black uppercase text-xs flex items-center gap-3 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> Nouveau Site
        </button>
      </header>

      {error && (
        <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500">
          <AlertCircle size={20} />
          <p className="text-xs font-black uppercase italic">{error}</p>
        </div>
      )}

      {/* GRILLE DES SITES AVEC STATISTIQUES _COUNT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sites.map(s => (
          <div key={s.S_Id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] relative group hover:border-blue-500/40 transition-all duration-500 overflow-hidden shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:rotate-6 transition-transform">
                <Building2 size={24}/>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal({open: true, mode: 'EDIT', data: s})} className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-blue-500 transition-colors"><Edit3 size={16}/></button>
                <button onClick={() => handleDelete(s.S_Id)} className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>

            <h3 className="text-2xl font-black uppercase italic tracking-tight">{s.S_Name}</h3>
            <div className="flex items-center gap-2 text-slate-500 mt-2 mb-8">
                <MapPin size={12} className="text-blue-600" />
                <p className="text-[10px] font-bold uppercase italic truncate">{s.S_Address || 'Défaut de localisation'}</p>
            </div>

            {/* STATS RAPIDES (INTÉGRATION _COUNT) */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div className="flex items-center gap-3">
                    <Users size={14} className="text-blue-500" />
                    <div>
                        <p className="text-xs font-black leading-none">{s._count?.S_Users || 0}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase mt-1 leading-none">Membres</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Layers size={14} className="text-blue-500" />
                    <div>
                        <p className="text-xs font-black leading-none">{s._count?.S_Departments || 0}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase mt-1 leading-none">Unités</p>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CRUD RD 2030 */}
      {modal.open && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
          <form onSubmit={handleSave} className="relative bg-[#0B0F1A] border border-white/10 p-12 rounded-[4rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
                type="button"
                onClick={() => setModal({...modal, open: false})}
                className="absolute top-8 right-8 text-slate-500 hover:text-white"
            >
                <X size={24} />
            </button>
            
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center"><Plus size={24} className="text-white" /></div>
                <h2 className="text-3xl font-black uppercase italic leading-none">
                    {modal.mode === 'ADD' ? 'Créer' : 'Modifier'} <span className="text-blue-500">Implantation</span>
                </h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic">Désignation Officielle</label>
                <input required className="w-full bg-white/2 border border-white/5 rounded-2xl p-6 text-sm font-bold text-white outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all" 
                  placeholder="ex: SIÈGE DAKAR" value={modal.data.S_Name} onChange={e => setModal({...modal, data: {...modal.data, S_Name: e.target.value}})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic">Adresse / Zone Géographique</label>
                <input required className="w-full bg-white/2 border border-white/5 rounded-2xl p-6 text-sm font-bold text-white outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all" 
                  placeholder="ex: Plateau, Rue 12 x 15" value={modal.data.S_Address} onChange={e => setModal({...modal, data: {...modal.data, S_Address: e.target.value}})} />
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-3xl font-black uppercase italic flex items-center justify-center gap-4 shadow-xl shadow-blue-900/20 transition-all">
                  <Save size={20}/> {modal.mode === 'ADD' ? 'Enregistrer dans le SMI' : 'Mettre à jour le site'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}