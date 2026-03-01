/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📍 MODULE : SITES & IMPLANTATIONS (CRUD)
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 16:20 GMT
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { MapPin, Plus, Loader2, Edit3, Trash2, X, Save, AlertCircle, Building2, Users, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface SiteEntry {
  S_Id: string; S_Name: string; S_Address: string;
  _count?: { S_Users: number; S_Departments: number; };
}

export default function SitesCrudPage() {
  const [sites, setSites] = useState<SiteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; mode: 'ADD' | 'EDIT'; data: Partial<SiteEntry> }>({
    open: false, mode: 'ADD', data: { S_Name: '', S_Address: '' }
  });

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/sites');
      setSites(res.data);
    } catch (err) {
      toast.error("Échec de synchronisation cartographique.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Scellage en cours...");
    try {
      if (modal.mode === 'ADD') {
        await apiClient.post('/sites', modal.data);
      } else {
        await apiClient.patch(`/sites/${modal.data.S_Id}`, modal.data);
      }
      setModal({ ...modal, open: false });
      refreshData();
      toast.success("Registre mis à jour.", { id: tid });
    } catch (err) { toast.error("Échec de l'opération technique.", { id: tid }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("PROCÉDURE CRITIQUE : Supprimer ce site supprimera toutes les entités rattachées. Confirmer ?")) return;
    try {
      await apiClient.delete(`/sites/${id}`);
      refreshData();
      toast.success("Site purgé.");
    } catch (err) { toast.error("Action refusée : Dépendances actives détectées."); }
  };

  if (loading) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-500" size={50} />
      <p className="text-blue-500 font-black uppercase italic tracking-widest text-[10px] mt-4">Calcul de la cartographie...</p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30">
      <header className="flex justify-between items-end mb-16 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Sites <span className="text-blue-500 text-5xl">Implantations</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-6 italic">Périmètre Géo-Organisationnel</p>
        </div>
        <button 
          onClick={() => setModal({open: true, mode: 'ADD', data: {S_Name: '', S_Address: ''}})} 
          className="bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-3xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-3xl shadow-blue-900/40 active:scale-95 border-none cursor-pointer text-white"
        >
          <Plus size={18} strokeWidth={3} /> Nouveau Site
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {sites.map(s => (
          <div key={s.S_Id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] relative group hover:border-blue-500 transition-all duration-500 shadow-2xl overflow-hidden backdrop-blur-3xl">
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:rotate-12 transition-all">
                <Building2 size={28}/>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                <button onClick={() => setModal({open: true, mode: 'EDIT', data: s})} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-blue-600 transition-all cursor-pointer border-none"><Edit3 size={18}/></button>
                <button onClick={() => handleDelete(s.S_Id)} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-red-600 transition-all cursor-pointer border-none"><Trash2 size={18}/></button>
              </div>
            </div>

            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-3 group-hover:text-blue-400 transition-colors leading-none">{s.S_Name}</h3>
            <div className="flex items-center gap-3 text-slate-500 mb-10">
                <MapPin size={14} className="text-blue-600" />
                <p className="text-[11px] font-black uppercase italic tracking-widest truncate">{s.S_Address || 'Sénégal, Dakar'}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-white/5 pt-8 relative z-10">
                <div className="flex items-center gap-4">
                    <Users size={18} className="text-blue-500" />
                    <div>
                        <p className="text-xl font-black leading-none">{s._count?.S_Users || 0}</p>
                        <p className="text-[9px] font-black text-slate-600 uppercase mt-2 tracking-widest italic">Staff</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Layers size={18} className="text-blue-500" />
                    <div>
                        <p className="text-xl font-black leading-none">{s._count?.S_Departments || 0}</p>
                        <p className="text-[9px] font-black text-slate-600 uppercase mt-2 tracking-widest italic">Dépts</p>
                    </div>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-all" />
          </div>
        ))}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-8 backdrop-blur-3xl bg-black/80">
          <form onSubmit={handleSave} className="relative bg-slate-900 border border-white/10 p-16 rounded-[4rem] w-full max-w-xl shadow-3xl animate-in zoom-in-95 duration-500 text-left">
            <button type="button" onClick={() => setModal({...modal, open: false})} className="absolute top-10 right-10 text-slate-500 hover:text-white bg-transparent border-none cursor-pointer"><X size={32} /></button>
            <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-3xl shadow-blue-900/40"><Plus size={32} className="text-white" /></div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
                    {modal.mode === 'ADD' ? 'Créer' : 'Éditer'} <span className="text-blue-500">Implantation</span>
                </h2>
            </div>
            <div className="space-y-10 font-sans">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Désignation Officielle</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-black text-white outline-none focus:border-blue-600 transition-all italic uppercase tracking-tighter" 
                  placeholder="EX: SIÈGE DAKAR" value={modal.data.S_Name} onChange={e => setModal({...modal, data: {...modal.data, S_Name: e.target.value}})} />
              </div>
              <div className="space-y-3 pb-8">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest">Zone Géographique</label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-black text-white outline-none focus:border-blue-600 transition-all italic uppercase tracking-tighter" 
                  placeholder="EX: PLATEAU, RUE 12" value={modal.data.S_Address} onChange={e => setModal({...modal, data: {...modal.data, S_Address: e.target.value}})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-white hover:text-blue-600 py-7 rounded-4xl font-black uppercase italic text-xs tracking-[0.3em] flex items-center justify-center gap-4 shadow-3xl shadow-blue-900/40 transition-all border-none cursor-pointer text-white active:scale-95">
                <Save size={20}/> Sceller les modifications
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}