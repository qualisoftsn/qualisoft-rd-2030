/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, GitGraph, MapPin, Layers, 
  Loader2, AlertCircle, CheckCircle2, Trash2, ChevronRight 
} from 'lucide-react';
import apiClient from '@/core/api/api-client';

export default function OrgUnitsPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [unitTypes, setUnitTypes] = useState<any[]>([]); // ✅ Pour le nouveau système CRUD
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    OU_Name: '',
    OU_TypeId: '',
    OU_SiteId: '',
    OU_ParentId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, sRes, tRes] = await Promise.all([
        apiClient.get('/org-units'),
        apiClient.get('/sites'),
        apiClient.get('/org-unit-types') // ✅ Récupération des types dynamiques
      ]);
      setUnits(uRes.data);
      setSites(sRes.data);
      setUnitTypes(tRes.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur de synchronisation avec le serveur.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await apiClient.post('/org-units', {
        ...formData,
        OU_ParentId: formData.OU_ParentId || null
      });
      setMessage({ type: 'success', text: `L'unité "${formData.OU_Name}" a été rattachée au SMI.` });
      setFormData({ OU_Name: '', OU_TypeId: '', OU_SiteId: '', OU_ParentId: '' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la création.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen italic font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-3">
            <Layers className="text-blue-600" size={32} /> Unités Organiques
          </h1>
          <p className="text-slate-500 font-medium lowercase">Définition de la hiérarchie SMI et des centres de responsabilités.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FORMULAIRE */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 sticky top-8">
            <h2 className="text-xs font-black uppercase mb-6 text-slate-800 flex items-center gap-2">
              <Plus size={16} className="text-blue-600" /> Nouvel Elément
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom de l&apos;unité</label>
                <input 
                  required
                  placeholder="Ex: Service Maintenance" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={formData.OU_Name}
                  onChange={(e) => setFormData({...formData, OU_Name: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Type de structure</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none cursor-pointer"
                  value={formData.OU_TypeId}
                  onChange={(e) => setFormData({...formData, OU_TypeId: e.target.value})}
                >
                  <option value="">-- Sélectionner --</option>
                  {unitTypes.map(t => (
                    <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Site de rattachement</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none cursor-pointer"
                  value={formData.OU_SiteId}
                  onChange={(e) => setFormData({...formData, OU_SiteId: e.target.value})}
                >
                  <option value="">-- Choisir un site --</option>
                  {sites.map(s => (
                    <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Parent Hiérarchique</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none cursor-pointer"
                  value={formData.OU_ParentId}
                  onChange={(e) => setFormData({...formData, OU_ParentId: e.target.value})}
                >
                  <option value="">-- Racine (Aucun) --</option>
                  {units.map(u => (
                    <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black uppercase py-4 rounded-xl text-[10px] shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={14} /> : <GitGraph size={14} />}
                Enregistrer dans le SMI
              </button>

              {message && (
                <div className={`flex items-center gap-2 p-3 rounded-xl border text-[10px] font-bold animate-in fade-in slide-in-from-top-1 ${
                  message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {message.text}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* LISTE DES UNITÉS */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Unité / Département</th>
                  <th className="px-8 py-5">Type</th>
                  <th className="px-8 py-5">Localisation</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.map((u) => (
                  <tr key={u.OU_Id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{u.OU_Name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
                            <ChevronRight size={10} /> {u.OU_Parent?.OU_Name || 'Racine'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[9px] font-black px-3 py-1 rounded-full bg-slate-900 text-white uppercase italic">
                        {u.OU_Type?.OUT_Label} {/* ✅ Affichage dynamique du Label CRUD */}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase">
                        <MapPin size={12} className="text-blue-500" /> {u.OU_Site?.S_Name}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {units.length === 0 && (
              <div className="p-20 text-center text-slate-400 font-black uppercase italic text-xs">
                Aucune unité organique répertoriée.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}