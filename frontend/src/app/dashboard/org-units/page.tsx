/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, Search, MoreHorizontal, Edit2, Trash2, 
  ChevronRight, Building2, MapPin, Layers, 
  Filter, Download, RefreshCcw, LayoutGrid, 
  Settings2, X, Save, Loader2, GitGraph
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

/**
 * 🏢 ORG-UNITS MATRIX (CLICKUP-EDITION)
 * -------------------------------------------------------------------------
 * Gestion haute performance de la structure organique §5.3
 * -------------------------------------------------------------------------
 */

export default function OrgUnitsManager() {
  // --- ÉTATS ---
  const [units, setUnits] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire initialisé selon le modèle OrgUnit
  const [formData, setFormData] = useState({
    OU_Id: '',
    OU_Name: '',
    OU_Code: '',
    OU_TypeId: '',
    OU_SiteId: '',
    OU_ParentId: '',
    OU_IsActive: true
  });

  // --- SYNC DATA ---
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
      toast.error("Erreur de synchronisation Matrix");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- FILTRAGE ---
  const filteredUnits = useMemo(() => {
    return units.filter(u => 
      u.OU_Name.toLowerCase().includes(search.toLowerCase()) ||
      u.OU_Code?.toLowerCase().includes(search.toLowerCase())
    );
  }, [units, search]);

  // --- ACTIONS CRUD ---
  const handleEdit = (unit: any) => {
    setFormData({
      OU_Id: unit.OU_Id,
      OU_Name: unit.OU_Name,
      OU_Code: unit.OU_Code || '',
      OU_TypeId: unit.OU_TypeId,
      OU_SiteId: unit.OU_SiteId,
      OU_ParentId: unit.OU_ParentId || '',
      OU_IsActive: unit.OU_IsActive
    });
    setShowDrawer(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirmer la suppression ? Cela peut affecter la hiérarchie ISO.")) return;
    try {
      await apiClient.delete(`/org-units/${id}`);
      toast.success("Unité décommissionnée");
      fetchData();
    } catch (err) {
      toast.error("Échec de la suppression");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        OU_ParentId: formData.OU_ParentId === "" ? null : formData.OU_ParentId
      };

      if (formData.OU_Id) {
        await apiClient.patch(`/org-units/${formData.OU_Id}`, payload);
        toast.success("Structure mise à jour");
      } else {
        await apiClient.post('/org-units', payload);
        toast.success("Nouvelle unité scellée");
      }
      setShowDrawer(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur Matrix");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-white italic font-bold text-gray-400 uppercase tracking-widest">
      <Loader2 className="animate-spin mr-3 text-indigo-600" /> Synchronisation SDE...
    </div>
  );

  return (
    <div className="ml-72 flex flex-col h-screen bg-[#F9F9FB] font-sans">
      <Toaster position="top-right" richColors />

      {/* 🔝 HEADER CLICKUP-STYLE */}
      <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Building2 size={20} />
          </div>
          <h1 className="text-lg font-black uppercase tracking-tight text-gray-800 italic">
            Unités <span className="text-indigo-600">Organisationnelles</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une unité..." 
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-md text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-indigo-500/20 w-64 outline-none transition-all"
            />
          </div>
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><RefreshCcw size={18}/></button>
          <button 
            onClick={() => { setFormData({OU_Id:'', OU_Name:'', OU_Code:'', OU_TypeId:'', OU_SiteId:'', OU_ParentId:'', OU_IsActive:true}); setShowDrawer(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </header>

      {/* 📊 CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-hidden p-8 flex flex-col gap-6">
        
        {/* KPI BAR */}
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Unités</p>
            <p className="text-2xl font-black text-gray-800 italic">{units.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Maillage Hiérarchique</p>
            <p className="text-2xl font-black text-indigo-600 italic">{units.filter(u => u.OU_ParentId).length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ancrage Sites</p>
            <p className="text-2xl font-black text-emerald-600 italic">{sites.length}</p>
          </div>
        </div>

        {/* TABLE WRAPPER */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col">
          <div className="overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                  <th className="px-6 py-4">Désignation & Code</th>
                  <th className="px-6 py-4">Typologie</th>
                  <th className="px-6 py-4">Unité Parente</th>
                  <th className="px-6 py-4">Site Géo</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Pilotage</th>
                </tr>
              </thead>
             <tbody className="divide-y divide-gray-50 italic">
  {filteredUnits.map((u) => (
    <tr key={u.OU_Id} className="hover:bg-indigo-50/30 group transition-all duration-200">
      {/* IDENTIFICATION : NOM & CODE */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs uppercase shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            {u.OU_Name.slice(0, 2)}
          </div>
          <div>
            <p className="text-xs font-black text-gray-800 uppercase tracking-tight leading-none">
              {u.OU_Name}
            </p>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {u.OU_Code || 'SDE-UNIT'}
            </p>
          </div>
        </div>
      </td>

      {/* TYPOLOGIE */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg border border-gray-200">
          {u.OU_Type?.OUT_Label || 'N/A'}
        </span>
      </td>

      {/* HIÉRARCHIE (UNITÉ PARENTE) */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-tighter italic">
          <GitGraph size={14} className="text-indigo-400" />
          {u.OU_Parent?.OU_Name || (
            <span className="text-gray-300 font-black">UNITÉ RACINE</span>
          )}
        </div>
      </td>

      {/* ANCRAGE GÉOGRAPHIQUE (SITE) */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">
          <MapPin size={14} className="text-gray-300" />
          {u.OU_Site?.S_Name || 'NON LOCALISÉ'}
        </div>
      </td>

      {/* STATUT (INDICATEUR VISUEL) */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-1.5 w-10 rounded-full transition-all",
            u.OU_IsActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-red-400"
          )} />
          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
            {u.OU_IsActive ? 'On' : 'Off'}
          </span>
        </div>
      </td>

      {/* PILOTAGE (ACTIONS CRUD) */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button 
            onClick={() => handleEdit(u)} 
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-xl transition-all"
            title="Modifier l'unité"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={() => handleDelete(u.OU_Id)} 
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-white hover:shadow-sm rounded-xl transition-all"
            title="Supprimer l'unité"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🛠️ DRAWER (MODAL LATÉRALE) */}
      {showDrawer && (
        <div className="fixed inset-0 z-100 bg-black/20 backdrop-blur-sm flex justify-end">
          <div className="w-112.5 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <header className="h-20 border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-800 italic">
                  {formData.OU_Id ? 'Modifier' : 'Sceller'} <span className="text-indigo-600">Unité</span>
                </h2>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Registre Organique §5.3</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="p-2 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 italic">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Désignation Officielle *</label>
                <input 
                  required value={formData.OU_Name} onChange={(e)=>setFormData({...formData, OU_Name: e.target.value.toUpperCase()})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                  placeholder="EX: DIRECTION DES OPÉRATIONS"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Code SDE (Facultatif)</label>
                <input 
                  value={formData.OU_Code} onChange={(e)=>setFormData({...formData, OU_Code: e.target.value.toUpperCase()})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                  placeholder="EX: DIR-OPS"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Type d&apos;Unité *</label>
                <select 
                  required value={formData.OU_TypeId} onChange={(e)=>setFormData({...formData, OU_TypeId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs font-bold uppercase outline-none cursor-pointer"
                >
                  <option value="">Sélectionner...</option>
                  {types.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Ancrage sur Site *</label>
                <select 
                  required value={formData.OU_SiteId} onChange={(e)=>setFormData({...formData, OU_SiteId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs font-bold uppercase outline-none cursor-pointer"
                >
                  <option value="">Sélectionner...</option>
                  {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Hiérarchie (Unité Parente)</label>
                <select 
                  value={formData.OU_ParentId} onChange={(e)=>setFormData({...formData, OU_ParentId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs font-bold uppercase outline-none cursor-pointer"
                >
                  <option value="">-- UNITÉ RACINE --</option>
                  {units.filter(u => u.OU_Id !== formData.OU_Id).map(u => (
                    <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>
                  ))}
                </select>
              </div>

              <div className="mt-auto pt-6 flex gap-4">
                <button 
                  type="button" onClick={()=>setShowDrawer(false)}
                  className="flex-1 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-100 transition-all"
                >
                  Annuler
                </button>
                <button 
                  disabled={isSubmitting} type="submit"
                  className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                  {formData.OU_Id ? 'Mettre à jour' : 'Sceller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}