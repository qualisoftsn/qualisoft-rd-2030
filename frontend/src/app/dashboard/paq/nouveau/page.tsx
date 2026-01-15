/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { Save, X, Target, Loader2, FolderTree, UserCheck } from 'lucide-react';

export default function NouveauPAQ() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processus, setProcessus] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [form, setForm] = useState({
    PAQ_Title: '',
    PAQ_Year: new Date().getFullYear(),
    PAQ_Description: '',
    PAQ_ProcessusId: '',
    PAQ_QualityManagerId: ''
  });

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const [resProc, resUsers] = await Promise.all([
          apiClient.get('/processus'),
          apiClient.get('/users')
        ]);
        setProcessus(resProc.data);
        setUsers(resUsers.data);
      } catch (err) {
        console.error("Erreur de chargement des référentiels", err);
      } finally {
        setLoading(false);
      }
    };
    loadDependencies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.PAQ_ProcessusId || !form.PAQ_QualityManagerId) {
      alert("Veuillez sélectionner un processus et un responsable.");
      return;
    }
    try {
      await apiClient.post('/paq', form);
      router.push('/dashboard/paq');
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'initialisation.");
    }
  };

  if (loading) return <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white italic">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4">
            <Target className="text-blue-500" size={40}/> Initialiser un <span className="text-blue-500">PAQ</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/40 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl">
          <div className="md:col-span-2 space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Titre du Plan Annuel</label>
            <input type="text" placeholder="Ex: Plan d'Amélioration Qualité 2026" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" 
              onChange={e => setForm({...form, PAQ_Title: e.target.value})} required />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 flex items-center gap-2"><FolderTree size={12}/> Processus Pilote</label>
            <select 
              className="w-full bg-[#0F172A] border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold"
              onChange={e => setForm({...form, PAQ_ProcessusId: e.target.value})}
              required
            >
              <option value="">Sélectionner un processus</option>
              {processus.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 flex items-center gap-2"><UserCheck size={12}/> Responsable Qualité</label>
            <select 
              className="w-full bg-[#0F172A] border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-500 font-bold"
              onChange={e => setForm({...form, PAQ_QualityManagerId: e.target.value})}
              required
            >
              <option value="">Sélectionner un manager</option>
              {users.map((u: any) => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
            </select>
          </div>

          <div className="md:col-span-2 flex gap-6 pt-6">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 py-5 rounded-3xl font-black uppercase italic text-xs shadow-xl shadow-blue-900/20 transition-all active:scale-95">
              Confirmer l&apos;initialisation
            </button>
            <button type="button" onClick={() => router.back()} className="px-10 py-5 border border-white/10 rounded-3xl font-black uppercase italic text-xs hover:bg-white/5 transition-all">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}