/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { Plus, Edit3, Save, X, Loader2, Target, ShieldCheck, Layers, GitBranch, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProcessusPage() {
  const [items, setItems] = useState<any[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [formData, setFormData] = useState({ PR_Code: '', PR_Libelle: '', PR_TypeId: '', PR_PiloteId: '' });

  const loadData = useCallback(async () => {
    try {
      const [resP, resU, resT] = await Promise.all([
        apiClient.get('/processus'),
        apiClient.get('/users'), 
        apiClient.get('/processus-types')
      ]);
      setItems(resP.data);
      setCollaborateurs(resU.data);
      setTypes(resT.data);
    } catch (e) {
      toast.error("Erreur de synchronisation Matrix");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selected) {
        await apiClient.patch(`/processus/${selected.PR_Id}`, formData);
        toast.success("Mise à jour validée");
      } else {
        await apiClient.post('/processus', formData);
        toast.success("Nouveau processus intégré");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error("Échec de l'enregistrement");
    }
  };

  if (loading) return (
    <div className="ml-72 h-screen flex flex-col items-center justify-center bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-500 mb-6" size={50} />
      <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">SMI CORE PROTOCOL...</span>
    </div>
  );

  return (
    <div className="p-12 bg-[#0B0F1A] min-h-screen ml-72 text-white italic text-left">
      <header className="mb-16 flex justify-between items-end border-b border-white/5 pb-10">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
            CARTOGRAPHIE <span className="text-blue-600">SMI</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase mt-4 tracking-[0.5em]">ISO 9001 §4.4 • GOUVERNANCE OPÉRATIONNELLE</p>
        </div>
        <button onClick={() => { setSelected(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-white hover:text-slate-900 px-10 py-6 rounded-2xl font-black uppercase text-xs transition-all shadow-2xl border-none cursor-pointer">
          <Plus size={20} className="inline mr-2" /> AJOUTER UN PROCESSUS
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((pr) => (
          <div key={pr.PR_Id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] group hover:border-blue-500/40 transition-all flex flex-col justify-between min-h-80 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-white/5 group-hover:text-blue-500/5 transition-colors">
                <GitBranch size={160} />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <span className="px-4 py-1.5 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-xl text-[10px] font-black uppercase italic tracking-widest">{pr.PR_Code}</span>
                <button onClick={() => { setSelected(pr); setFormData({PR_Code: pr.PR_Code, PR_Libelle: pr.PR_Libelle, PR_TypeId: pr.PR_TypeId, PR_PiloteId: pr.PR_PiloteId}); setIsModalOpen(true); }} className="text-slate-600 hover:text-white bg-transparent border-none cursor-pointer"><Edit3 size={18} /></button>
              </div>
              <h4 className="text-3xl font-black uppercase italic leading-tight tracking-tighter mb-4 group-hover:text-blue-400 transition-colors">{pr.PR_Libelle}</h4>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6 italic">{pr.PR_Type?.PT_Label || 'FAMILLE NON DÉFINIE'}</p>
              
              <div className="flex items-center gap-3 bg-white/2 p-4 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-blue-500 text-xs">
                    {pr.PR_Pilote?.U_FirstName?.[0]}{pr.PR_Pilote?.U_LastName?.[0]}
                </div>
                <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">PILOTE TITULAIRE</p>
                    <p className="text-xs font-black uppercase italic text-slate-200">{pr.PR_Pilote?.U_FirstName} {pr.PR_Pilote?.U_LastName}</p>
                </div>
              </div>
            </div>

            <Link href={`/dashboard/processus/cockpit/${pr.PR_Id}`} className="mt-8 flex justify-between items-center bg-blue-600 text-white p-6 rounded-2xl font-black uppercase italic text-[10px] tracking-widest hover:bg-white hover:text-slate-900 transition-all no-underline shadow-xl relative z-10">
                OUVRIR LE COCKPIT <ArrowUpRight size={18} />
            </Link>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-100" onClick={() => setIsModalOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-137.5 bg-[#0F172A] z-110 p-16 animate-in slide-in-from-right duration-500 italic text-left border-l border-white/10 overflow-y-auto">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-12 border-b border-white/5 pb-8">CONFIG. <span className="text-blue-600">SMI</span></h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Code ID (Radicale)</label>
              <input value={formData.PR_Code} onChange={e => setFormData({...formData, PR_Code: e.target.value.toUpperCase()})} placeholder="EX: PR-MAINTENANCE" className="w-full p-6 bg-slate-900 border border-white/10 rounded-2xl text-sm font-black uppercase italic outline-none focus:border-blue-600" required /></div>
              
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Libellé du Processus</label>
              <input value={formData.PR_Libelle} onChange={e => setFormData({...formData, PR_Libelle: e.target.value})} placeholder="DÉSIGNATION" className="w-full p-6 bg-slate-900 border border-white/10 rounded-2xl text-sm font-black uppercase italic outline-none focus:border-blue-600" required /></div>

              <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Famille ISO 9001</label>
              <select value={formData.PR_TypeId} onChange={e => setFormData({...formData, PR_TypeId: e.target.value})} className="w-full p-6 bg-slate-900 border border-white/10 rounded-2xl text-[10px] font-black uppercase italic outline-none">
                <option value="">SÉLECTIONNER</option>
                {types.map(t => <option key={t.PT_Id} value={t.PT_Id}>{t.PT_Label}</option>)}
              </select></div>

              <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Pilote Titulaire</label>
              <select value={formData.PR_PiloteId} onChange={e => setFormData({...formData, PR_PiloteId: e.target.value})} className="w-full p-6 bg-slate-900 border border-white/10 rounded-2xl text-[10px] font-black uppercase italic outline-none">
                <option value="">CHOISIR LE RESPONSABLE</option>
                {collaborateurs.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
              </select></div>

              <button type="submit" className="w-full py-8 bg-blue-600 rounded-3xl font-black uppercase text-xs transition-all shadow-2xl border-none cursor-pointer mt-6 hover:bg-white hover:text-slate-900">
                SCELLER DANS LA CARTOGRAPHIE
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}