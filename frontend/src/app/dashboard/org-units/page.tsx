/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { 
  Layers, Plus, Search, RefreshCw, Edit3, Trash2, Building2, 
  GitBranch, Activity, Fingerprint, Save, X, Loader2, ShieldCheck 
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
    } catch { toast.error("RUPTURE KERNEL SDE"); } 
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
      
      // PAYLOAD SCELLÉ SUR CreateOrgUnitDto / UpdateOrgUnitDto
      const payload: any = {
        OU_Name: formData.OU_Name.toUpperCase(),
        OU_Code: formData.OU_Code.toUpperCase(),
        OU_TypeId: formData.OU_TypeId,
        OU_SiteId: formData.OU_SiteId,
        OU_ParentId: formData.OU_ParentId && formData.OU_ParentId !== "" ? formData.OU_ParentId : null,
      };

      if (isEdit) {
        await apiClient.patch(`/org-units/${formData.OU_Id}`, payload);
      } else {
        await apiClient.post("/org-units", payload);
      }
      
      toast.success(isEdit ? "MUTATION SCELLÉE" : "UNITÉ CRÉÉE");
      setShowEditor(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "ERREUR VALIDATION KERNEL";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (u: any) => {
    setFormData({
      OU_Id: u.OU_Id,
      OU_Name: u.OU_Name,
      OU_Code: u.OU_Code || "",
      OU_TypeId: u.OU_TypeId,
      OU_SiteId: u.OU_SiteId,
      OU_ParentId: u.OU_ParentId || "",
    });
    setShowEditor(true);
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#0B0F1A] text-blue-500"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="flex h-screen w-full bg-[#0B0F1A] text-white italic font-sans overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* ZONE CENTRALE DYNAMIQUE */}
      <div className="flex-1 flex flex-col ml-72 overflow-hidden border-l border-white/5">
        
        {/* 🔝 HEADER FIXE HAUTE DENSITÉ */}
        <header className="h-20 bg-[#0B0F1A] border-b border-white/10 flex justify-between items-center px-8 shrink-0 z-20">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black uppercase tracking-tighter m-0 flex items-center gap-2">
              <Layers className="text-blue-500" size={24} /> Structure <span className="text-blue-500">Organique</span>
            </h1>
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.3em] m-0 italic">ISO 9001 §5.3 • Maillage Territorial</p>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="RECHERCHER..."
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 text-[10px] font-black uppercase italic outline-none focus:border-blue-600 transition-all text-white" 
              />
            </div>
            <button 
              onClick={() => { setFormData({OU_Id: "", OU_Name: "", OU_Code: "", OU_TypeId: "", OU_SiteId: "", OU_ParentId: ""}); setShowEditor(true); }} 
              className="bg-blue-600 hover:bg-white hover:text-blue-600 px-5 py-2 rounded-lg text-[9px] font-black uppercase italic transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Plus size={14} strokeWidth={3} /> Créer Unité
            </button>
            <button onClick={fetchData} className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"><RefreshCw size={14} /></button>
          </div>
        </header>

        {/* 📊 TABLEAU NO-SCROLL GLOBAL */}
        <main className="flex-1 overflow-hidden p-4 bg-[#0B0F1A]">
          <div className="h-full bg-[#151A2D] border border-white/5 rounded-4xl overflow-hidden flex flex-col relative shadow-2xl">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#151A2D] z-30 border-b border-white/10">
                  <tr className="text-[8px] text-slate-500 uppercase font-black italic tracking-widest">
                    <th className="px-6 py-4">Nom de l&apos;unité</th>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Typologie</th>
                    <th className="px-6 py-4">Parent</th>
                    <th className="px-6 py-4 text-right">Pilotage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[10px]">
                  {filteredUnits.map(u => (
                    <tr key={u.OU_Id} className="group hover:bg-blue-600/5 transition-all">
                      <td className="px-6 py-3 font-black text-white uppercase italic tracking-tight">{u.OU_Name}</td>
                      <td className="px-6 py-3 text-blue-500 font-bold tracking-widest uppercase">{u.OU_Code}</td>
                      <td className="px-6 py-3 text-slate-400 uppercase font-bold italic">{u.OU_Type?.OUT_Label}</td>
                      <td className="px-6 py-3 text-slate-500 italic uppercase">
                         {u.OU_Parent?.OU_Name || 'UNITÉ RACINE'}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => handleEdit(u)} className="p-2 bg-white/5 rounded-md text-slate-400 hover:text-blue-500 border border-white/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                          <Edit3 size={14}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <footer className="h-10 border-t border-white/5 flex justify-between items-center px-8 opacity-40 italic shrink-0 bg-[#0B0F1A]">
          <div className="flex items-center gap-3">
            <Fingerprint size={18} className="text-blue-600" />
            <span className="text-[8px] font-black uppercase tracking-widest text-white">Organic Matrix v4.0 • Kernel Scellé</span>
          </div>
          <Activity size={16} className="text-emerald-500 animate-pulse" />
        </footer>
      </div>

      {/* 🛠️ MODALE DRAWER (Z-100) */}
      {showEditor && (
        <div className="fixed inset-0 z-100 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-105 h-full bg-[#0B0F1A] border-l border-white/10 p-10 flex flex-col gap-8 shadow-5xl animate-in slide-in-from-right duration-300">
            <header className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase italic m-0 tracking-tighter">Édition <span className="text-blue-500">SDE</span></h2>
              <button onClick={() => setShowEditor(false)} className="text-slate-500 hover:text-red-500 transition-all cursor-pointer"><X size={24}/></button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase italic ml-2">Désignation Organique</label>
                <input value={formData.OU_Name} onChange={e => setFormData({...formData, OU_Name: e.target.value.toUpperCase()})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] font-bold text-white outline-none focus:border-blue-600 uppercase italic" required />
              </div>
              
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase italic ml-2">Code Unique (§5.3)</label>
                <input value={formData.OU_Code} onChange={e => setFormData({...formData, OU_Code: e.target.value.toUpperCase()})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] font-bold text-white outline-none focus:border-blue-600 uppercase italic" required />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase italic ml-2">Typologie Structurelle</label>
                <select value={formData.OU_TypeId} onChange={e => setFormData({...formData, OU_TypeId: e.target.value})} className="w-full bg-[#151A2D] border border-white/10 rounded-xl p-4 text-[11px] font-bold text-white outline-none italic cursor-pointer appearance-none" required>
                  <option value="">SÉLECTIONNER UUID...</option>
                  {types.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase italic ml-2">Ancrage Territorial (Site)</label>
                <select value={formData.OU_SiteId} onChange={e => setFormData({...formData, OU_SiteId: e.target.value})} className="w-full bg-[#151A2D] border border-white/10 rounded-xl p-4 text-[11px] font-bold text-white outline-none italic cursor-pointer appearance-none" required>
                  <option value="">SÉLECTIONNER UUID...</option>
                  {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-500 uppercase italic ml-2">Rattachement Hiérarchique</label>
                <select value={formData.OU_ParentId} onChange={e => setFormData({...formData, OU_ParentId: e.target.value})} className="w-full bg-[#151A2D] border border-white/10 rounded-xl p-4 text-[11px] font-bold text-white outline-none italic cursor-pointer appearance-none">
                  <option value="">-- UNITÉ RACINE --</option>
                  {units.filter(u => u.OU_Id !== formData.OU_Id).map(u => <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>)}
                </select>
              </div>

              <button disabled={submitting} type="submit" className="mt-auto bg-blue-600 hover:bg-white hover:text-blue-600 p-5 rounded-2xl font-black uppercase italic tracking-[0.3em] transition-all flex items-center justify-center gap-3 text-[10px] shadow-3xl cursor-pointer">
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Sceller le segment</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}