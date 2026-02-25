/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { 
  Layers, Plus, Search, RefreshCw, Edit3, Trash2, Building2, 
  GitBranch, Activity, Fingerprint, Save, X, Loader2, MapPin, ShieldCheck 
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { cn } from '@/core/utils/cn';
import { toast, Toaster } from 'sonner';

export default function OrgUnitsPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    OU_Id: '',
    OU_Name: '',
    OU_Code: '',
    OU_TypeId: '',
    OU_SiteId: '',
    OU_ParentId: '',
    OU_IsActive: true,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [uRes, sRes, tRes] = await Promise.all([
        apiClient.get('/org-units'),
        apiClient.get('/sites'),
        apiClient.get('/org-unit-types'),
      ]);
      setUnits(uRes.data?.data || uRes.data || []);
      setSites(sRes.data?.data || sRes.data || []);
      setTypes(tRes.data?.data || tRes.data || []);
    } catch { toast.error("RUPTURE KERNEL"); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredUnits = useMemo(() => units.filter(u => 
    u.OU_Name?.toLowerCase().includes(search.toLowerCase()) || 
    u.OU_Code?.toLowerCase().includes(search.toLowerCase())
  ), [units, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isEdit = !!formData.OU_Id;
      const payload: any = {
        OU_Name: formData.OU_Name.toUpperCase(),
        OU_Code: formData.OU_Code.toUpperCase(),
        OU_TypeId: formData.OU_TypeId,
        OU_SiteId: formData.OU_SiteId,
        OU_ParentId: formData.OU_ParentId || null,
      };

      if (isEdit) {
        payload.OU_IsActive = formData.OU_IsActive;
        await apiClient.patch(`/org-units/${formData.OU_Id}`, payload);
      } else {
        await apiClient.post("/org-units", payload);
      }
      
      toast.success(isEdit ? "SCELLAGE RÉUSSI" : "CRÉATION RÉUSSIE");
      setShowEditor(false);
      fetchData();
    } catch { toast.error("ERREUR DE VALIDATION MATRIX"); } 
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#0B0F1A] text-blue-500"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="fixed inset-0 ml-72 bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER FIXE */}
      <header className="h-24 border-b border-white/10 flex justify-between items-center px-8 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 m-0">
            <Layers className="text-blue-500" size={32} /> Unités <span className="text-blue-500">Organiques</span>
          </h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] m-0 leading-none">ISO 9001 §5.3 • Matrice SDE</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="relative w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="SCANNER LA STRUCTURE..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 text-[11px] font-black uppercase italic outline-none focus:border-blue-600 transition-all" 
            />
          </div>
          <button 
            onClick={() => { setFormData({OU_Id: "", OU_Name: "", OU_Code: "", OU_TypeId: "", OU_SiteId: "", OU_ParentId: "", OU_IsActive: true}); setShowEditor(true); }} 
            className="bg-blue-600 hover:bg-white hover:text-blue-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus size={16} /> Créer Unité
          </button>
          <button onClick={fetchData} className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all"><RefreshCw size={18} /></button>
        </div>
      </header>

      {/* 📊 TABLEAU - OCCUPE 100% DE L'ESPACE RESTANT */}
      <main className="flex-1 overflow-hidden p-6 flex flex-col">
        <div className="flex-1 bg-[#151A2D] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none"><ShieldCheck size={300} /></div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#151A2D] z-20 border-b border-white/10">
                <tr className="text-[9px] text-slate-500 uppercase font-black italic tracking-widest">
                  <th className="px-8 py-5">Code & Désignation</th>
                  <th className="px-8 py-5">Typologie</th>
                  <th className="px-8 py-5">Rattachement</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUnits.map(u => (
                  <tr key={u.OU_Id} className="group hover:bg-blue-600/5 transition-all">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500 border border-blue-500/20"><Building2 size={16} /></div>
                        <div className="flex flex-col">
                          <span className="font-black text-white uppercase text-sm tracking-tight">{u.OU_Name}</span>
                          <span className="text-[9px] text-blue-500 font-bold tracking-widest">{u.OU_Code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase text-slate-400 italic">
                        {u.OU_Type?.OUT_Label}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                       <div className="text-[10px] font-black uppercase text-slate-300 italic flex items-center gap-2">
                         <GitBranch size={12} className="text-blue-600" /> {u.OU_Parent?.OU_Name || 'ROOT'}
                       </div>
                       <div className="text-[8px] text-slate-500 font-bold uppercase mt-1">Site: {u.OU_Site?.S_Name}</div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setFormData(u); setShowEditor(true); }} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-blue-500 border border-white/10 cursor-pointer"><Edit3 size={14}/></button>
                        <button className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-red-500 border border-white/10 cursor-pointer"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🏁 FOOTER FIXE */}
      <footer className="h-16 border-t border-white/5 flex justify-between items-center px-8 opacity-40 italic shrink-0">
        <div className="flex items-center gap-4">
          <Fingerprint size={24} className="text-blue-600" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white">Organic Matrix v4.0</span>
        </div>
        <Activity size={20} className="text-emerald-500 animate-pulse" />
      </footer>

      {/* 🛠️ TIROIR D'ÉDITION DROIT */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-112.5 h-full bg-[#0B0F1A] border-l border-white/10 p-10 flex flex-col gap-8 shadow-5xl animate-in slide-in-from-right duration-300">
            <header className="flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-black uppercase italic m-0">Éditeur <span className="text-blue-500">SDE</span></h2>
              <button onClick={() => setShowEditor(false)} className="p-2 hover:text-red-500 cursor-pointer"><X size={24}/></button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-2 tracking-widest leading-none">Désignation</label>
                <input value={formData.OU_Name} onChange={e => setFormData({...formData, OU_Name: e.target.value.toUpperCase()})} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500 uppercase italic" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase italic ml-2 tracking-widest leading-none">Code</label>
                  <input value={formData.OU_Code} onChange={e => setFormData({...formData, OU_Code: e.target.value.toUpperCase()})} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500 uppercase italic" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase italic ml-2 tracking-widest leading-none">Statut</label>
                  <select value={formData.OU_IsActive ? "true" : "false"} onChange={e => setFormData({...formData, OU_IsActive: e.target.value === "true"})} className="bg-[#151A2D] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none italic">
                    <option value="true">ACTIF</option>
                    <option value="false">RÉVOQUÉ</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-2 tracking-widest leading-none">Type d&apos;unité</label>
                <select value={formData.OU_TypeId} onChange={e => setFormData({...formData, OU_TypeId: e.target.value})} className="bg-[#151A2D] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none italic" required>
                  <option value="">SÉLECTIONNER...</option>
                  {types.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-2 tracking-widest leading-none">Site géographique</label>
                <select value={formData.OU_SiteId} onChange={e => setFormData({...formData, OU_SiteId: e.target.value})} className="bg-[#151A2D] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none italic" required>
                  <option value="">CHOISIR SITE...</option>
                  {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-2 tracking-widest leading-none">Parent hiérarchique</label>
                <select value={formData.OU_ParentId} onChange={e => setFormData({...formData, OU_ParentId: e.target.value})} className="bg-[#151A2D] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none italic">
                  <option value="">-- UNITÉ RACINE --</option>
                  {units.filter(u => u.OU_Id !== formData.OU_Id).map(u => <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>)}
                </select>
              </div>

              <button disabled={submitting} type="submit" className="mt-auto bg-blue-600 hover:bg-white hover:text-blue-600 p-5 rounded-4xl font-black uppercase italic tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-3xl">
                {submitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Sceller le segment</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}