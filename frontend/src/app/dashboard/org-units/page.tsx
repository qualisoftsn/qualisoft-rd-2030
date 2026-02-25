/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { 
  Layers, Plus, Search, RefreshCw, Edit3, Trash2, Building2, 
  GitBranch, Activity, Fingerprint, Save, X, Loader2, ShieldCheck, MapPin
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
      
      /**
       * 🚀 NETTOYAGE CHIRURGICAL DU PAYLOAD (Fix Erreur 400)
       * On ne transmet QUE ce que le CreateOrgUnitDto / UpdateOrgUnitDto autorise.
       */
      const payload: any = {
        OU_Name: formData.OU_Name.toUpperCase(),
        OU_Code: formData.OU_Code.toUpperCase(),
        OU_TypeId: formData.OU_TypeId,
        OU_SiteId: formData.OU_SiteId,
        // ✅ CRITIQUE : Si ParentId est vide, on envoie NULL (pas une string vide "")
        OU_ParentId: formData.OU_ParentId && formData.OU_ParentId.trim() !== "" ? formData.OU_ParentId : null,
      };

      if (isEdit) {
        // En mode modification, on utilise PATCH comme défini dans ton contrôleur
        await apiClient.patch(`/org-units/${formData.OU_Id}`, payload);
      } else {
        // En mode création, on utilise POST
        await apiClient.post("/org-units", payload);
      }
      
      toast.success(isEdit ? "MUTATION SCELLÉE" : "UNITÉ DÉPLOYÉE");
      setShowEditor(false);
      fetchData();
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      const finalMsg = Array.isArray(serverMsg) ? serverMsg[0].erreurs[0] : serverMsg;
      toast.error(finalMsg || "ERREUR DE VALIDATION MATRIX");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#0B0F1A] text-blue-500"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="fixed inset-0 ml-72 flex flex-col bg-[#0B0F1A] text-white italic font-sans overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER HAUTE DENSITÉ */}
      <header className="h-20 border-b border-white/10 flex justify-between items-center px-8 shrink-0 bg-[#0B0F1A] z-40">
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
              placeholder="SCANNER..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 text-[10px] font-black uppercase italic outline-none focus:border-blue-600 transition-all text-white" 
            />
          </div>
          <button 
            onClick={() => { setFormData({OU_Id: "", OU_Name: "", OU_Code: "", OU_TypeId: "", OU_SiteId: "", OU_ParentId: ""}); setShowEditor(true); }} 
            className="bg-blue-600 hover:bg-white hover:text-blue-600 px-5 py-2 rounded-lg text-[9px] font-black uppercase italic transition-all flex items-center gap-2 shadow-lg cursor-pointer active:scale-95"
          >
            <Plus size={14} strokeWidth={3} /> Créer Unité
          </button>
          <button onClick={fetchData} className="p-2 bg-white/5 rounded-lg border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer shadow-md active:scale-90"><RefreshCw size={14} /></button>
        </div>
      </header>

      {/* 📊 CORE TABLE (No-Scroll Viewport) */}
      <main className="flex-1 overflow-hidden p-4">
        <div className="h-full bg-[#151A2D] border border-white/5 rounded-4xl overflow-hidden flex flex-col shadow-4xl relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="sticky top-0 bg-[#151A2D] z-30 border-b border-white/10">
                <tr className="text-[8px] text-slate-500 uppercase font-black italic tracking-widest">
                  <th className="px-6 py-4 w-1/3">Libellé & Code</th>
                  <th className="px-6 py-4">Typologie</th>
                  <th className="px-6 py-4">Parent</th>
                  <th className="px-6 py-4 text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[10px]">
                {filteredUnits.map(u => (
                  <tr key={u.OU_Id} className="group hover:bg-blue-600/5 transition-all">
                    <td className="px-6 py-3">
                      <div className="flex flex-col">
                        <span className="font-black text-white uppercase italic tracking-tight">{u.OU_Name}</span>
                        <span className="text-[8px] text-blue-500 font-bold uppercase">{u.OU_Code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase italic text-slate-400">
                        {u.OU_Type?.OUT_Label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 italic uppercase">
                       {u.OU_Parent?.OU_Name || 'UNITÉ RACINE'}
                    </td>
                    <td className="px-6 py-3 text-right">
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
                        className="p-2 bg-white/5 rounded-md text-slate-400 hover:text-blue-500 border border-white/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Edit3 size={12}/>
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
      <footer className="h-10 border-t border-white/5 flex justify-between items-center px-8 opacity-30 italic shrink-0">
        <div className="flex items-center gap-3">
          <Fingerprint size={18} className="text-blue-600" />
          <span className="text-[8px] font-black uppercase tracking-widest text-white">SDE Engine Matrix v4.0</span>
        </div>
        <Activity size={16} className="text-emerald-500 animate-pulse" />
      </footer>

      {/* 🛠️ DRAWER ÉDITION (Fixed Viewport) */}
      {showEditor && (
        <div className="fixed inset-0 z-100 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-105 h-full bg-[#0B0F1A] border-l border-white/10 p-10 flex flex-col gap-8 shadow-5xl animate-in slide-in-from-right duration-300">
            <header className="flex justify-between items-center shrink-0">
              <h2 className="text-xl font-black uppercase italic m-0 tracking-tighter">Éditeur <span className="text-blue-500">SDE</span></h2>
              <button onClick={() => setShowEditor(false)} className="text-slate-500 hover:text-red-500 cursor-pointer"><X size={24}/></button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-2 tracking-widest">Désignation</label>
                <input value={formData.OU_Name} onChange={e => setFormData({...formData, OU_Name: e.target.value.toUpperCase()})} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold italic outline-none focus:border-blue-500 text-white uppercase" required />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-2 tracking-widest">Code Structure</label>
                <input value={formData.OU_Code} onChange={e => setFormData({...formData, OU_Code: e.target.value.toUpperCase()})} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold italic outline-none focus:border-blue-500 text-white uppercase" required />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-2 tracking-widest">Typologie</label>
                <select value={formData.OU_TypeId} onChange={e => setFormData({...formData, OU_TypeId: e.target.value})} className="bg-[#151A2D] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none cursor-pointer" required>
                  <option value="">SÉLECTIONNER UUID...</option>
                  {types.map(t => <option key={t.OUT_Id} value={t.OUT_Id}>{t.OUT_Label}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-2 tracking-widest">Site Géographique</label>
                <select value={formData.OU_SiteId} onChange={e => setFormData({...formData, OU_SiteId: e.target.value})} className="bg-[#151A2D] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none cursor-pointer" required>
                  <option value="">CHOISIR SITE...</option>
                  {sites.map(s => <option key={s.S_Id} value={s.S_Id}>{s.S_Name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase italic ml-2 tracking-widest">Parent Hiérarchique</label>
                <select value={formData.OU_ParentId} onChange={e => setFormData({...formData, OU_ParentId: e.target.value})} className="bg-[#151A2D] border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none cursor-pointer">
                  <option value="">-- UNITÉ RACINE --</option>
                  {units.filter(u => u.OU_Id !== formData.OU_Id).map(u => (
                    <option key={u.OU_Id} value={u.OU_Id}>{u.OU_Name}</option>
                  ))}
                </select>
              </div>

              <button disabled={submitting} type="submit" className="mt-auto bg-blue-600 hover:bg-white hover:text-blue-600 p-5 rounded-2xl font-black uppercase italic tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-3xl">
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