/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📍 MODULE : SITES & IMPLANTATIONS (CRUD) (elite-sde)
 * -------------------------------------------------------------------------
 * FIX : PWA Ready, Modale Responsive, Scroll localisé.
 * DATE : 05 Mars 2026 | 00:10 GMT
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { MapPin, Plus, Loader2, Edit3, Trash2, X, Save, Building2, Users, Layers } from 'lucide-react';
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
      const res = await apiClient.get('/sites').catch(() => ({ data: [] }));
      setSites(res.data || []);
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
      toast.success("Site purgé avec succès.");
    } catch (err) { toast.error("Action refusée : Dépendances actives détectées."); }
  };

  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={48} strokeWidth={3} />
      <p className="text-blue-500 font-black uppercase tracking-widest text-[10px] m-0 animate-pulse">Calcul de la cartographie...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full">
      
      {/* 🔝 EN-TÊTE FIXE */}
      <header className="shrink-0 p-6 md:p-8 lg:p-12 border-b border-white/5 bg-[#0B0F1A]/90 backdrop-blur-md z-20 flex flex-col md:flex-row justify-between md:items-end gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none m-0">
            Sites <span className="text-blue-500">Implantations</span>
          </h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] mt-3 md:mt-4 italic m-0">
            Périmètre Géo-Organisationnel
          </p>
        </div>
        <button 
          onClick={() => setModal({open: true, mode: 'ADD', data: {S_Name: '', S_Address: ''}})} 
          className="w-full md:w-auto bg-blue-600 hover:bg-white hover:text-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black uppercase text-[10px] md:text-xs tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/40 active:scale-95 border-none cursor-pointer m-0"
        >
          <Plus size={18} strokeWidth={3} /> Nouveau Site
        </button>
      </header>

      {/* 📜 ZONE DE DÉFILEMENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-8 w-full">
          {sites.length === 0 ? (
             <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-[3rem] text-slate-500 text-xs font-black uppercase tracking-widest">
                Aucun site géographique scellé.
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {sites.map(s => (
                <div key={s.S_Id} className="bg-[#0F172A]/80 border border-white/5 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] relative group hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(37,99,235,0.1)] transition-all duration-500 shadow-2xl overflow-hidden backdrop-blur-sm flex flex-col h-full">
                  <div className="flex justify-between items-start mb-8 md:mb-10 relative z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:rotate-12 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shrink-0">
                      <Building2 size={24} className="md:w-7 md:h-7" />
                    </div>
                    <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all lg:translate-y-4 lg:group-hover:translate-y-0">
                      <button onClick={() => setModal({open: true, mode: 'EDIT', data: s})} className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-blue-600 transition-all cursor-pointer shadow-inner m-0 active:scale-95"><Edit3 size={16}/></button>
                      <button onClick={() => handleDelete(s.S_Id)} className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-rose-600 transition-all cursor-pointer shadow-inner m-0 active:scale-95"><Trash2 size={16}/></button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white mb-3 group-hover:text-blue-400 transition-colors leading-none m-0 truncate">{s.S_Name}</h3>
                    <div className="flex items-center gap-3 text-slate-500 mb-8 md:mb-10">
                        <MapPin size={14} className="text-blue-500 shrink-0" />
                        <p className="text-[9px] md:text-[10px] font-black uppercase italic tracking-widest truncate m-0">{s.S_Address || 'Sénégal, Dakar'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:gap-6 border-t border-white/10 pt-6 md:pt-8 relative z-10 mt-auto">
                      <div className="flex items-center gap-3 md:gap-4">
                          <Users size={16} className="text-blue-500 md:w-5 md:h-5" />
                          <div>
                              <p className="text-lg md:text-xl font-black leading-none m-0 text-white">{s._count?.S_Users || 0}</p>
                              <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase mt-1 md:mt-2 tracking-widest italic m-0">Staff</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3 md:gap-4">
                          <Layers size={16} className="text-blue-500 md:w-5 md:h-5" />
                          <div>
                              <p className="text-lg md:text-xl font-black leading-none m-0 text-white">{s._count?.S_Departments || 0}</p>
                              <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase mt-1 md:mt-2 tracking-widest italic m-0">Dépts</p>
                          </div>
                      </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🧾 MODAL SÉCURISÉE */}
      {modal.open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm bg-black/80 animate-in fade-in duration-300">
          <form onSubmit={handleSave} className="relative bg-[#0F172A] border border-white/10 p-6 md:p-10 lg:p-14 rounded-[2.5rem] md:rounded-[4rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-500 text-left flex flex-col max-h-[90vh]">
            <button type="button" onClick={() => setModal({...modal, open: false})} className="absolute top-6 md:top-10 right-6 md:right-10 text-slate-500 hover:text-rose-500 bg-transparent border-none cursor-pointer p-2 m-0"><X size={24} className="md:w-8 md:h-8" /></button>
            
            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12 shrink-0">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/40 text-white shrink-0"><Plus size={24} className="md:w-8 md:h-8" /></div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-white leading-none m-0">
                    {modal.mode === 'ADD' ? 'Créer' : 'Éditer'} <span className="text-blue-500">Site</span>
                </h2>
            </div>
            
            <div className="space-y-6 md:space-y-8 font-sans overflow-y-auto custom-scrollbar flex-1 pr-2">
              <div className="space-y-2 md:space-y-3">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest block">Désignation Officielle *</label>
                <input required className="w-full bg-black/40 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 text-xs md:text-sm font-black text-white outline-none focus:border-blue-500 transition-all italic uppercase tracking-tighter shadow-inner placeholder:text-slate-600" 
                  placeholder="EX: SIÈGE DAKAR" value={modal.data.S_Name} onChange={e => setModal({...modal, data: {...modal.data, S_Name: e.target.value}})} />
              </div>
              <div className="space-y-2 md:space-y-3 pb-4">
                <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-4 italic tracking-widest block">Zone Géographique *</label>
                <input required className="w-full bg-black/40 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 text-xs md:text-sm font-black text-white outline-none focus:border-blue-500 transition-all italic uppercase tracking-tighter shadow-inner placeholder:text-slate-600" 
                  placeholder="EX: PLATEAU, RUE 12" value={modal.data.S_Address} onChange={e => setModal({...modal, data: {...modal.data, S_Address: e.target.value}})} />
              </div>
            </div>

            <div className="pt-6 md:pt-8 shrink-0">
              <button type="submit" className="w-full bg-blue-600 hover:bg-white hover:text-slate-900 py-5 md:py-7 rounded-2xl md:rounded-4xl font-black uppercase italic text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] flex items-center justify-center gap-3 md:gap-4 shadow-xl shadow-blue-900/40 transition-all border-none cursor-pointer text-white active:scale-95 m-0">
                <Save size={18} className="md:w-5 md:h-5" /> Sceller les modifications
              </button>
            </div>
          </form>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}} />
    </div>
  );
}