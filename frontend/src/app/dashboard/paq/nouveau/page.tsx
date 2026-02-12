/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { Save, Target, Loader2, FolderTree, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function NouveauPAQ() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processus, setProcessus] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ PAQ_Title: '', PAQ_Year: new Date().getFullYear(), PAQ_Description: '', PAQ_ProcessusId: '', PAQ_QualityManagerId: '' });

  useEffect(() => {
    apiClient.get('/processus').then(r => setProcessus(r.data));
    apiClient.get('/users').then(r => { setUsers(r.data); setLoading(false); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/paq', form);
      toast.success("PAQ Initialisé");
      router.push('/dashboard/paq');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur critique");
    }
  };

  if (loading) return <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white italic text-left">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-12 flex items-center gap-6"><Target className="text-blue-500" size={50}/> Initialiser un <span className="text-blue-500">PAQ</span></h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-10 bg-slate-900/40 p-16 rounded-[4rem] border border-white/5 shadow-2xl">
          <div className="col-span-2 space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Titre du Plan Annuel</label>
            <input type="text" placeholder="EX: STRATÉGIE QUALITÉ 2026" className="w-full bg-white/5 border border-white/10 p-7 rounded-3xl outline-none focus:border-blue-500 font-bold uppercase italic" onChange={e => setForm({...form, PAQ_Title: e.target.value})} required />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Processus Pilote</label>
            <select className="w-full bg-[#0F172A] border border-white/10 p-7 rounded-3xl outline-none focus:border-blue-500 font-bold italic" onChange={e => setForm({...form, PAQ_ProcessusId: e.target.value})} required>
              <option value="">SÉLECTIONNER</option>
              {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Responsable Qualité</label>
            <select className="w-full bg-[#0F172A] border border-white/10 p-7 rounded-3xl outline-none focus:border-blue-500 font-bold italic" onChange={e => setForm({...form, PAQ_QualityManagerId: e.target.value})} required>
              <option value="">SÉLECTIONNER</option>
              {users.map((u: any) => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex gap-8 pt-10">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-white hover:text-slate-900 py-6 rounded-3xl font-black uppercase italic text-xs transition-all border-none cursor-pointer shadow-2xl">CONFIRMER L&apos;INITIALISATION</button>
            <button type="button" onClick={() => router.back()} className="px-12 py-6 border border-white/10 rounded-3xl font-black uppercase italic text-xs hover:bg-white/5 transition-all cursor-pointer text-white">ANNULER</button>
          </div>
        </form>
      </div>
    </div>
  );
}