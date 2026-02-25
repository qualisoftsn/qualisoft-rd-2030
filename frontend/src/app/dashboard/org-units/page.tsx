/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { 
  Layers, Plus, Search, RefreshCw, Edit3, Trash2, Building2, 
  GitBranch, Activity, Fingerprint, Save, X, Loader2, ShieldCheck,
  LayoutGrid, MapPin, Database, ChevronRight, Globe
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
      
      const payload: any = {
        OU_Name: formData.OU_Name.toUpperCase(),
        OU_Code: formData.OU_Code?.toUpperCase() || null,
        OU_TypeId: formData.OU_TypeId,
        OU_SiteId: formData.OU_SiteId,
        OU_ParentId: formData.OU_ParentId && formData.OU_ParentId !== "" ? formData.OU_ParentId : null,
      };

      if (isEdit) {
        await apiClient.patch(`/org-units/${formData.OU_Id}`, payload);
      } else {
        await apiClient.post("/org-units", payload);
      }
      
      toast.success(isEdit ? "SCELLAGE RÉUSSI" : "DÉPLOIEMENT RÉUSSI");
      setShowEditor(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "ERREUR VALIDATION KERNEL";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#0B0F1A] text-blue-500"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="fixed inset-0 ml-72 flex flex-col bg-[#0B0F1A] text-white italic font-sans overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER FIXE & VISIBLE */}
      <header className="h-24 border-b border-white/10 flex justify-between items-center px-10 shrink-0 bg-[#0B0F1A] z-40">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black uppercase tracking-tighter m-0 flex items-center gap-3">
              <Layers className="text-blue-500" size={32} /> Maillage <span className="text-blue-500">Organique</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] m-0 italic mt-1 leading-none">ISO 9001 §5.3 • Hiérarchie des Autorités</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="relative group w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="SCANNER LA STRUCTURE..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 text-[11px] font-black uppercase italic outline-none focus:border-blue-600 transition-all text-white" 
            />
          </div>
          <button 
            onClick={() => { setFormData({OU_Id: "", OU_Name: "", OU_Code: "", OU_TypeId: "", OU_SiteId: "", OU_ParentId: ""}); setShowEditor(true); }} 
            className="bg-blue-600 hover:bg-white hover:text-blue-600 px-8 py-3 rounded-2xl text-[10px] font-black uppercase italic transition-all flex items-center gap-3 shadow-2xl shadow-blue-600/30 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={3} /> Ajouter Unité
          </button>
          <button onClick={fetchData} className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"><RefreshCw size={20} /></button>
        </div>
      </header>

      {/* 📊 CORE CONTENT (TABLEAU VISIBLE 100%) */}
      <main className="flex-1 overflow-hidden p-6 bg-[#0B0F1A]">
        <div className="h-full bg-[#151A2D] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col relative shadow-4xl group">
          <div className="absolute top-0 right-0 p-20 opacity-[0.01] pointer-events-none rotate-12"><ShieldCheck size={500} /></div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="sticky top-0 bg-[#151A2D] z-30 border-b border-white/10">
                <tr className="text-[9px] text-slate-500 uppercase font-black italic tracking-widest">
                  <th className="px-10 py-6 w-1/3">Désignation & Code</th>
                  <th className="px-10 py-6">Type d&apos;Unité</th>
                  <th className="px-10 py-6">Parent</th>
                  <th className="px-10 py-6">Site</th>
                  <th className="px-10 py-6 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px]">
                {filteredUnits.map(u => (
                  <tr key={u.OU_Id} className="group hover:bg-blue-600/5 transition-all">
                    <td className="px-10 py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 border border-blue-500/20"><Building2 size={18} /></div>
                        <div className="flex flex-col">
                          <span className="font-black text-white uppercase italic text-sm">{u.OU_Name}</span>
                          <span className="text-[9px] text-blue-500 font-bold tracking-widest uppercase">{u.OU_Code || 'SANS CODE'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-4">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase italic text-slate-400">{u.OU_Type?.OUT_Label}</span>
                    </td>
                    <td className="px-10 py-4">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-300 italic">
                         <GitBranch size={14} className="text-blue-600" />
                         {u.OU_Parent?.OU_Name || 'UNITÉ RACINE'}
                       </div>
                    </td>
                    <td className="px-10 py-4">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 italic">
                         <MapPin size={14} className="text-slate-600" /> {u.OU_Site?.S_Name}
                       </div>
                    </td>
                    <td className="px-10 py-4 text-right">
                      <button 
                        onClick={() => {
                          setFormData({
                            OU_Id: u.OU_Id,
                            OU_Name: u.OU_Name,
                            OU_Code: u.OU_Code || "",
                            OU_TypeId: u.OU_TypeId,
                            OU_SiteId: u.OU_SiteId,
                            OU_ParentId: u.OU_ParentId || "",
                          });
                          setShowEditor(true);
                        }} 
                        className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-blue-500 border border-white/10 cursor-pointer shadow-lg active:scale-90 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Edit3 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🏁 FOOTER FIXE */}
      <footer className="h-14 border-t border-white/5 flex justify-between items-center px-10 opacity-40 italic shrink-0 z-40 bg-[#0B0F1A]">
        <div className="flex items-center gap-5">
          <Fingerprint size={28} className="text-blue-600" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white italic">SDE Matrix Engine v4.0</span>
        </div>
        <div className="flex items-center gap-6">
           <Database size={20} className="text-blue-600" />
           <Activity size={24} className="text-emerald-500 animate-pulse" />
        </div>
      </footer>

      {/* 🛠️ EDITEUR LATÉRAL (DRAWER) */}
      {showEditor && (
        <div className="fixed inset-0 z-100 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-120 h-full bg-[#0B0F1A] border-l border-white/10 p-12 flex flex-col gap-10 shadow-5xl animate-in slide-in-from-right duration-500">
            <header className="flex justify-between items-center shrink-0">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black uppercase italic m-0 tracking-tighter">Éditeur <span className="text-blue-500">SDE</span></h2>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-2 leading-none italic">Scellage Structurel §5.3</p>
              </div>
              <button onClick={() => setShowEditor(false)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-red-500 transition-all border border-white/10 cursor-pointer shadow-xl"><X size={24}/></button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8 overflow-y-auto pr-4 custom-scrollbar">
              <div className="flex flex-col gap-3">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-3 tracking-[0.2em]">Libellé Unité</label>
                <input value={formData.OU_Name} onChange={(e) => setFormData({...formData, OU_Name: e.target.value.toUpperCase()})} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold italic outline-none focus:border-blue-600 transition-all text-white" required placeholder="NOM DE L'UNITÉ" />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-3 tracking-[0.2em]">Code Unique SDE</label>
                <input value={formData.OU_Code} onChange={(e) => setFormData({...formData, OU_Code: e.target.value.toUpperCase()})} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold italic outline-none focus:border-blue-600 transition-all text-white" placeholder="CODE (OPTIONNEL)" />
              </div>
              
              <div className="flex flex-col gap-3">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-3 tracking-[0.2em]">Type d&apos;Unité</label>
                <select value={formData.OU_TypeId} onChange={(e) => setFormData({...formData, OU_TypeId: e.target.value})} className="w-full bg-[#151A2D] border border-white/10 rounded-2xl p-5 text-sm font-bold italic outline-none focus:border-blue-600 transition-all text-white appearance-none cursor-pointer" required>
                  <option value="">SÉLECTIONNER UUID...</option>
                  {types.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-3 tracking-[0.2em]">Site Géographique</label>
                <select value={formData.OU_SiteId} onChange={(e) => setFormData({...formData, OU_SiteId: e.target.value})} className="w-full bg-[#151A2D] border border-white/10 rounded-2xl p-5 text-sm font-bold italic outline-none focus:border-blue-600 transition-all text-white appearance-none cursor-pointer" required>
                  <option value="">CHOISIR LE SITE...</option>
                  {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-3 tracking-[0.2em]">Rattachement (Relation Réflexive)</label>
                <select value={formData.OU_ParentId} onChange={(e) => setFormData({...formData, OU_ParentId: e.target.value})} className="w-full bg-[#151A2D] border border-white/10 rounded-2xl p-5 text-sm font-bold italic outline-none focus:border-blue-600 transition-all text-white appearance-none cursor-pointer">
                  <option value="">-- UNITÉ RACINE --</option>
                  {/* ✅ FILTRE ANTI-BOUCLE : On ne peut pas être son propre parent */}
                  {units.filter(u => u.OU_Id !== formData.OU_Id).map(u => (
                    <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>
                  ))}
                </select>
              </div>

              <button disabled={submitting} type="submit" className="mt-auto bg-blue-600 hover:bg-white hover:text-blue-600 p-6 rounded-[2.5rem] font-black uppercase italic tracking-[0.5em] transition-all flex items-center justify-center gap-4 text-xs shadow-3xl active:scale-95 cursor-pointer">
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