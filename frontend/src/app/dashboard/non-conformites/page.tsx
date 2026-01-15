/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import { 
  AlertOctagon, Plus, Loader2, X, Save, 
  MessageSquare, ClipboardCheck, ShieldAlert, Truck, 
  Building2, FileText, Search, Zap, Clock, Activity, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SOURCE_UI: any = {
  CLIENT_COMPLAINT: { label: "Client", icon: <MessageSquare size={14}/>, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  INTERNAL_AUDIT: { label: "Audit Int.", icon: <ClipboardCheck size={14}/>, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  EXTERNAL_AUDIT: { label: "Audit Ext.", icon: <ShieldAlert size={14}/>, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  SUPPLIER: { label: "Fournisseur", icon: <Truck size={14}/>, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  INCIDENT_SAFETY: { label: "SST / SSE", icon: <AlertOctagon size={14}/>, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
};

export default function NonConformitesGlobalPage() {
  const [ncs, setNcs] = useState<any[]>([]);
  const [meta, setMeta] = useState({ processes: [], sites: [], counts: {} as any });
  const [loading, setLoading] = useState(true);
  const [filtreSource, setFiltreSource] = useState('TOUS');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [recherche, setRecherche] = useState('');

  const [formData, setFormData] = useState({
    NC_Libelle: '', NC_Description: '', NC_Diagnostic: '',
    NC_Source: 'INTERNAL_AUDIT', NC_Gravite: 'MINEURE',
    NC_ProcessusId: '', NC_DetectorId: ''
  });

  const chargerDonnees = useCallback(async () => {
    setLoading(true);
    try {
      const [ncRes, prRes, stRes] = await Promise.all([
        apiClient.get('/non-conformites'),
        apiClient.get('/processus'),
        apiClient.get('/sites')
      ]);
      setNcs(ncRes.data);
      setMeta({ 
        processes: prRes.data, 
        sites: stRes.data,
        counts: ncRes.data.reduce((acc: any, curr: any) => ({...acc, [curr.NC_Source]: (acc[curr.NC_Source] || 0) + 1}), {})
      });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    chargerDonnees();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.U_Id) setFormData(prev => ({ ...prev, NC_DetectorId: user.U_Id }));
  }, [chargerDonnees]);

  const ncsFiltrees = ncs.filter(n => 
    (filtreSource === 'TOUS' || n.NC_Source === filtreSource) &&
    n.NC_Libelle.toLowerCase().includes(recherche.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/non-conformites', formData);
      toast.success("NC déclarée avec succès");
      setIsSlideOverOpen(false);
      chargerDonnees();
    } catch (error) {
      toast.error("Erreur lors de la déclaration");
    }
  };

  if (loading) return <div className="ml-72 h-screen flex items-center justify-center bg-[#0F172A] text-red-600 animate-pulse">SMI Qualisoft 2026...</div>;

  return (
    <div className="h-screen bg-[#0F172A] ml-72 flex flex-col font-sans italic text-left relative overflow-hidden">
      
      {/* 1. HEADER FIXE */}
      <header className="h-24 px-8 flex items-center justify-between border-b border-white/5 bg-slate-900/50 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-red-600 rounded-xl shadow-lg"><Zap size={24} className="text-white fill-white" /></div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none italic">Pilotage <span className="text-red-500">NC</span></h1>
            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest mt-1 italic">Qualisoft Sénégal • {ncs.length} Écarts</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-xl border border-white/5">
            <Search size={14} className="text-slate-500" />
            <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Recherche rapide..." className="bg-transparent border-none outline-none text-[10px] font-bold w-48 text-white italic" />
          </div>
          <button onClick={() => setIsSlideOverOpen(true)} className="bg-red-600 px-6 py-3 rounded-xl font-black uppercase text-[10px] text-white flex items-center gap-2 shadow-lg hover:bg-red-500 transition-all">
            <Plus size={16} /> Déclarer
          </button>
        </div>
      </header>

      {/* 2. BARRE DE FILTRES */}
      <div className="h-20 px-8 flex items-center gap-4 bg-slate-900/30 border-b border-white/5 shrink-0 z-10">
        <div className="flex items-center gap-2 bg-slate-800/40 p-1 rounded-xl">
           <button onClick={() => setFiltreSource('TOUS')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${filtreSource === 'TOUS' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:bg-white/5'}`}>TOUS</button>
           {Object.entries(SOURCE_UI).map(([key, config]: any) => (
             <button key={key} onClick={() => setFiltreSource(key)} className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${filtreSource === key ? `${config.bg} ${config.color} border ${config.border}` : 'text-slate-500 hover:bg-white/5'}`}>
               <span className="text-[9px] font-black uppercase">{config.label}</span>
             </button>
           ))}
        </div>
      </div>

      {/* 3. TABLEAU (AUTO-SCROLL) */}
      <main className="flex-1 overflow-y-auto p-8 bg-black/10">
        <div className="bg-slate-900/40 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left italic">
            <thead className="bg-white/5 border-b border-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest">
              <tr>
                <th className="px-8 py-6">Source</th>
                <th className="px-8 py-6 w-1/3">Objet de la NC</th>
                <th className="px-8 py-6">Processus</th>
                <th className="px-8 py-6 text-center">État</th>
                <th className="px-8 py-6 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ncsFiltrees.map((nc) => (
                <tr key={nc.NC_Id} className="hover:bg-white/2 transition-all group">
                  <td className="px-8 py-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${SOURCE_UI[nc.NC_Source]?.bg} ${SOURCE_UI[nc.NC_Source]?.color} border ${SOURCE_UI[nc.NC_Source]?.border}`}>
                      {SOURCE_UI[nc.NC_Source]?.icon}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <h4 className="text-sm font-black text-white tracking-tighter uppercase leading-tight truncate">{nc.NC_Libelle}</h4>
                    <p className="text-[8px] font-bold text-slate-600 uppercase mt-1 flex items-center gap-2">
                       <Clock size={10}/> {new Date(nc.NC_CreatedAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-blue-400 uppercase italic tracking-tighter">{nc.NC_Processus?.PR_Libelle || 'SMI'}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border ${nc.NC_Statut === 'TERMINE' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
                      {nc.NC_Statut}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link href={`/dashboard/non-conformites/${nc.NC_Id}`} className="p-3 bg-white/5 rounded-xl hover:bg-red-600 transition-all text-slate-500 hover:text-white border border-transparent hover:border-red-400/30 inline-block">
                      <FileText size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* 🟢 SLIDE-OVER (REMPLACE LA MODALE CENTRALE) */}
      {isSlideOverOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-100" onClick={() => setIsSlideOverOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-137.5 bg-[#0F172A] border-l border-white/10 shadow-4xl z-110 p-12 overflow-y-auto animate-in slide-in-from-right duration-500 italic">
            <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Saisie <span className="text-red-600">NC</span></h2>
              <button onClick={() => setIsSlideOverOpen(false)} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 italic mb-3 block tracking-widest text-left">Objet de l&apos;écart</label>
                <input required value={formData.NC_Libelle} onChange={e => setFormData({...formData, NC_Libelle: e.target.value})} type="text" className="w-full bg-slate-900 border border-white/10 rounded-2xl p-6 text-sm font-bold italic outline-none focus:border-red-600 transition-all shadow-inner" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 italic mb-3 block tracking-widest text-left">Description factuelle</label>
                <textarea required rows={5} value={formData.NC_Description} onChange={e => setFormData({...formData, NC_Description: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-3xl p-6 text-sm font-bold italic outline-none focus:border-red-600 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-500 italic mb-1 block tracking-widest text-left">Source</label>
                   <select value={formData.NC_Source} onChange={e => setFormData({...formData, NC_Source: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl p-5 text-[10px] font-black uppercase italic text-white outline-none appearance-none cursor-pointer">
                      {Object.entries(SOURCE_UI).map(([key, config]: any) => <option key={key} value={key}>{config.label}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-blue-500 italic mb-1 block tracking-widest text-left">Processus</label>
                   <select required value={formData.NC_ProcessusId} onChange={e => setFormData({...formData, NC_ProcessusId: e.target.value})} className="w-full bg-slate-950 border border-blue-500/20 rounded-xl p-5 text-[10px] font-black uppercase italic text-blue-400 outline-none appearance-none cursor-pointer">
                      <option value="">-- CHOISIR --</option>
                      {meta.processes.map((pr: any) => <option key={pr.PR_Id} value={pr.PR_Id}>{pr.PR_Libelle}</option>)}
                   </select>
                </div>
              </div>

              <button type="submit" className="w-full py-6 mt-8 bg-red-600 rounded-[2.5rem] text-[11px] font-black uppercase italic hover:bg-red-500 transition-all shadow-xl flex items-center justify-center gap-3">
                <Save size={18}/> Enregistrer & Diffuser
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}