/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🏢 MODULE : ORG-UNITS MANAGER SDE (§5.3)
 * -------------------------------------------------------------------------
 * RÔLE : Gestion haute performance de la structure organique ISO 9001.
 * ARCHITECTURE : Zéro NextAuth • Intégration API SDE pure.
 * DESIGN : Transféré vers Sovereign Matrix Elite (Dark Industrial).
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 12:25 GMT
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Building2, MapPin, 
  RefreshCcw, X, Save, Loader2, GitGraph
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';

export default function OrgUnitsManager() {
  const [units, setUnits] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    OU_Id: '', OU_Name: '', OU_Code: '', OU_TypeId: '', 
    OU_SiteId: '', OU_ParentId: '', OU_IsActive: true
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, sRes, tRes] = await Promise.all([
        apiClient.get('/org-units'),
        apiClient.get('/sites'),
        apiClient.get('/org-unit-types')
      ]);
      setUnits(uRes.data?.data || uRes.data || []);
      setSites(sRes.data?.data || sRes.data || []);
      setTypes(tRes.data?.data || tRes.data || []);
    } catch (err) {
      toast.error("ERREUR DE SYNCHRONISATION MATRICIELLE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredUnits = useMemo(() => {
    return units.filter(u => u.OU_Name.toLowerCase().includes(search.toLowerCase()) || u.OU_Code?.toLowerCase().includes(search.toLowerCase()));
  }, [units, search]);

  const handleEdit = (unit: any) => {
    setFormData({
      OU_Id: unit.OU_Id, OU_Name: unit.OU_Name, OU_Code: unit.OU_Code || '',
      OU_TypeId: unit.OU_TypeId, OU_SiteId: unit.OU_SiteId,
      OU_ParentId: unit.OU_ParentId || '', OU_IsActive: unit.OU_IsActive
    });
    setShowDrawer(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ALERTE SDE : Confirmer la suppression ? Impact possible sur la hiérarchie ISO.")) return;
    try {
      await apiClient.delete(`/org-units/${id}`);
      toast.success("UNITÉ DÉCOMMISSIONNÉE");
      fetchData();
    } catch (err) {
      toast.error("ÉCHEC DE LA SUPPRESSION (DÉPENDANCES ACTIVES)");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData, OU_ParentId: formData.OU_ParentId === "" ? null : formData.OU_ParentId };
      if (formData.OU_Id) {
        await apiClient.patch(`/org-units/${formData.OU_Id}`, payload);
        toast.success("STRUCTURE MISE À JOUR");
      } else {
        await apiClient.post('/org-units', payload);
        toast.success("NOUVELLE UNITÉ SCELLÉE");
      }
      setShowDrawer(false);
      fetchData();
    } catch (err: any) {
      toast.error("ERREUR D'ÉCRITURE KERNEL");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 italic font-black uppercase tracking-widest">
      <Loader2 className="animate-spin mr-3" /> Synchronisation SDE...
    </div>
  );

  return (
    <div className="ml-0 lg:ml-72 flex flex-col min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER MATRIX */}
      <header className="h-24 bg-[#0F172A]/80 border-b border-white/5 px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <div className="p-3 bg-blue-600/10 text-blue-500 rounded-2xl border border-blue-500/20">
            <Building2 size={24} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
            Unités <span className="text-blue-500">Organiques</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto">
          <div className="relative group flex-1 sm:flex-none">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher unité..." 
              className="w-full sm:w-64 pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
          <button onClick={fetchData} className="p-3 text-slate-400 hover:text-white bg-white/5 rounded-2xl transition-all cursor-pointer border-none"><RefreshCcw size={16}/></button>
          <button onClick={() => { setFormData({OU_Id:'', OU_Name:'', OU_Code:'', OU_TypeId:'', OU_SiteId:'', OU_ParentId:'', OU_IsActive:true}); setShowDrawer(true); }} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 shadow-xl shadow-blue-900/20 transition-all cursor-pointer border-none">
            <Plus size={16} /> Créer
          </button>
        </div>
      </header>

      {/* 📊 CONTENU */}
      <main className="flex-1 p-8 flex flex-col gap-8 overflow-x-hidden">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#151A2D]/80 p-6 rounded-4xl shadow-xl border border-white/5 backdrop-blur-xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Unités</p>
            <p className="text-4xl font-black text-white mt-2">{units.length}</p>
          </div>
          <div className="bg-[#151A2D]/80 p-6 rounded-4xl shadow-xl border border-white/5 backdrop-blur-xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Maillage Hiérarchique</p>
            <p className="text-4xl font-black text-blue-500 mt-2">{units.filter(u => u.OU_ParentId).length}</p>
          </div>
          <div className="bg-[#151A2D]/80 p-6 rounded-4xl shadow-xl border border-white/5 backdrop-blur-xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ancrage Sites</p>
            <p className="text-4xl font-black text-emerald-500 mt-2">{sites.length}</p>
          </div>
        </div>

        <div className="bg-[#151A2D]/80 rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-200">
              <thead className="bg-black/40 border-b border-white/5">
                <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  <th className="px-8 py-5">Identité & Code</th>
                  <th className="px-8 py-5">Typologie</th>
                  <th className="px-8 py-5">Lien Hiérarchique</th>
                  <th className="px-8 py-5">Site Géographique</th>
                  <th className="px-8 py-5">Statut</th>
                  <th className="px-8 py-5 text-right">Pilotage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUnits.map((u) => (
                  <tr key={u.OU_Id} className="hover:bg-white/5 group transition-all duration-200">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-900/30 text-blue-400 flex items-center justify-center font-black text-xs uppercase border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {u.OU_Name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-tight">{u.OU_Name}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{u.OU_Code || 'SDE-UNIT'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-white/5 text-slate-400 px-3 py-1.5 rounded-lg border border-white/10">
                        {u.OU_Type?.OUT_Label || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <GitGraph size={14} className="text-blue-500" />
                        {u.OU_Parent?.OU_Name || <span className="text-slate-600 font-black">RACINE</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <MapPin size={14} className="text-slate-600" />
                        {u.OU_Site?.S_Name || 'NON LOCALISÉ'}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`h-1.5 w-10 rounded-full ${u.OU_IsActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"}`} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{u.OU_IsActive ? 'ACTIF' : 'INACTIF'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => handleEdit(u)} className="text-slate-500 hover:text-blue-500 bg-transparent border-none cursor-pointer"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(u.OU_Id)} className="text-slate-500 hover:text-red-500 bg-transparent border-none cursor-pointer"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🛠️ DRAWER MATRIX (MODAL LATÉRALE) */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#0F172A] border-l border-white/10 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <header className="h-24 border-b border-white/5 px-8 flex items-center justify-between shrink-0 bg-black/20">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tighter text-white">
                  {formData.OU_Id ? 'Édition' : 'Création'} <span className="text-blue-500">Unité</span>
                </h2>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Registre Organique §5.3</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="p-2 text-slate-500 hover:text-white bg-transparent border-none cursor-pointer"><X size={24}/></button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Désignation SDE *</label>
                <input required value={formData.OU_Name} onChange={(e)=>setFormData({...formData, OU_Name: e.target.value.toUpperCase()})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" placeholder="EX: DIRECTION DES OPÉRATIONS" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Code Unique</label>
                <input value={formData.OU_Code} onChange={(e)=>setFormData({...formData, OU_Code: e.target.value.toUpperCase()})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" placeholder="EX: DIR-OPS" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Typologie SDE *</label>
                <select required value={formData.OU_TypeId} onChange={(e)=>setFormData({...formData, OU_TypeId: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase text-white outline-none cursor-pointer appearance-none focus:border-blue-500">
                  <option value="">AFFECTATION...</option>
                  {types.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Ancrage Site *</label>
                <select required value={formData.OU_SiteId} onChange={(e)=>setFormData({...formData, OU_SiteId: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase text-white outline-none cursor-pointer appearance-none focus:border-blue-500">
                  <option value="">AFFECTATION...</option>
                  {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Hiérarchie (Unité Parente)</label>
                <select value={formData.OU_ParentId} onChange={(e)=>setFormData({...formData, OU_ParentId: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase text-white outline-none cursor-pointer appearance-none focus:border-blue-500">
                  <option value="">-- UNITÉ RACINE --</option>
                  {units.filter(u => u.OU_Id !== formData.OU_Id).map(u => <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>)}
                </select>
              </div>

              <div className="mt-auto pt-8">
                <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-3 border-none cursor-pointer">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                  {formData.OU_Id ? 'Mettre à jour' : 'Sceller l\'unité'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { height: 6px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }`}</style>
    </div>
  );
}