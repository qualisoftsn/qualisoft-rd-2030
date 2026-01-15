/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { Save, X, Target, User, AlertCircle, Calendar, Loader2 } from 'lucide-react';

export default function NewActionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [paqs, setPaqs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    ACT_Title: '',
    ACT_Description: '',
    ACT_Priority: 'MEDIUM',
    ACT_Origin: 'AUTRE',
    ACT_ResponsableId: '',
    ACT_PAQId: '',
    ACT_Deadline: ''
  });

  useEffect(() => {
    // Charger les responsables et les PAQ pour les listes déroulantes
    const loadRefs = async () => {
      try {
        const [resU, resP] = await Promise.all([
          apiClient.get('/users'),
          apiClient.get('/paq') // S'assurer que cette route existe
        ]);
        setUsers(resU.data);
        setPaqs(resP.data);
      } catch (err) { console.error("Erreur refs actions"); }
    };
    loadRefs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/actions', formData);
      router.push('/dashboard/actions');
      router.refresh();
    } catch (err) {
      alert("Erreur lors de la création de l'action.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans text-left">
      <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Planifier une <span className="text-blue-500">Action</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">
            Nouvelle entrée au Plan d&apos;Amélioration Continue
          </p>
        </div>
        <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-slate-500 hover:text-white">
          <X size={24} />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Intitulé de l&apos;action</label>
            <input required className="w-full bg-white/2 border border-white/5 p-5 rounded-2xl font-bold text-white outline-none focus:border-blue-500" 
              placeholder="Ex: Mise en place du nouveau protocole SSE..."
              value={formData.ACT_Title} onChange={e => setFormData({...formData, ACT_Title: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest flex items-center gap-2"><Target size={12}/> PAQ de rattachement</label>
              <select required className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl font-bold text-xs outline-none"
                value={formData.ACT_PAQId} onChange={e => setFormData({...formData, ACT_PAQId: e.target.value})}>
                <option value="" className="bg-[#0B0F1A]">Sélectionner un PAQ...</option>
                {paqs.map(p => <option key={p.PAQ_Id} value={p.PAQ_Id} className="bg-[#0B0F1A]">{p.PAQ_Title} ({p.PAQ_Year})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest flex items-center gap-2"><User size={12}/> Responsable</label>
              <select required className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl font-bold text-xs outline-none"
                value={formData.ACT_ResponsableId} onChange={e => setFormData({...formData, ACT_ResponsableId: e.target.value})}>
                <option value="" className="bg-[#0B0F1A]">Assigner à...</option>
                {users.map(u => <option key={u.U_Id} value={u.U_Id} className="bg-[#0B0F1A]">{u.U_FirstName} {u.U_LastName}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Priorité</label>
                <select className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl font-bold text-xs outline-none text-amber-500"
                  value={formData.ACT_Priority} onChange={e => setFormData({...formData, ACT_Priority: e.target.value})}>
                  <option value="LOW" className="bg-[#0B0F1A]">BASSE</option>
                  <option value="MEDIUM" className="bg-[#0B0F1A]">MOYENNE</option>
                  <option value="HIGH" className="bg-[#0B0F1A]">HAUTE</option>
                  <option value="CRITICAL" className="bg-[#0B0F1A]">CRITIQUE</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">Origine</label>
                <select className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl font-bold text-xs outline-none text-blue-400"
                  value={formData.ACT_Origin} onChange={e => setFormData({...formData, ACT_Origin: e.target.value})}>
                  <option value="NON_CONFORMITE" className="bg-[#0B0F1A]">NON-CONFORMITÉ</option>
                  <option value="AUDIT" className="bg-[#0B0F1A]">AUDIT</option>
                  <option value="RECLAMATION" className="bg-[#0B0F1A]">RÉCLAMATION</option>
                  <option value="COPIL" className="bg-[#0B0F1A]">COPIL / REVUE</option>
                  <option value="AUTRE" className="bg-[#0B0F1A]">AUTRE</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest flex items-center gap-2"><Calendar size={12}/> Échéance</label>
                <input required type="date" className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl font-bold text-xs outline-none"
                  value={formData.ACT_Deadline} onChange={e => setFormData({...formData, ACT_Deadline: e.target.value})} />
             </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-4xl font-black uppercase italic shadow-2xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3">
          {loading ? <Loader2 className="animate-spin" /> : <><Save size={20}/> Engager l&apos;Action</>}
        </button>
      </form>
    </div>
  );
}