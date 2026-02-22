/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛠️ MODULE : PLANIFICATION D'ACTION (CAPA)
 * -------------------------------------------------------------------------
 * RÔLE : Indexation d'une nouvelle mesure d'amélioration (§10.2).
 * RÉFÉRENTIEL : types/elite-sde (Strict Enums).
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { Save, X, Target, User, Calendar, Loader2, Zap, ShieldAlert } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Référentiel Elite
import { Priority, ActionOrigin, ActionType, ActionStatus } from '@/types/elite-sde';

export default function NewActionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [paqs, setPaqs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    ACT_Title: '',
    ACT_Description: '',
    ACT_Priority: Priority.MEDIUM,
    ACT_Origin: ActionOrigin.AUTRE,
    ACT_Type: ActionType.CORRECTIVE,
    ACT_ResponsableId: '',
    ACT_PAQId: '',
    ACT_Deadline: ''
  });

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [resU, resP] = await Promise.all([
          apiClient.get('/users'),
          apiClient.get('/paq')
        ]);
        setUsers(resU.data?.data || resU.data);
        setPaqs(resP.data?.data || resP.data);
      } catch (err) { toast.error("ERREUR DE LIAISON RÉFÉRENTIEL"); }
    };
    loadRefs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading("DÉPLOIEMENT DE L'ACTION...");
    try {
      await apiClient.post('/actions', { ...formData, ACT_Status: ActionStatus.A_FAIRE });
      toast.success("ACTION SCELLÉE DANS LE SMI", { id: tid });
      router.push('/dashboard/actions');
    } catch (err) {
      toast.error("ERREUR DE SCELLAGE SDE", { id: tid });
    } finally { setLoading(false); }
  };

  return (
    <div className="p-16 bg-[#0B0F1A] min-h-screen ml-72 text-white italic font-sans overflow-y-auto">
      <Toaster richColors />
      <header className="flex justify-between items-center mb-20 border-b-2 border-white/5 pb-12 max-w-500 mx-auto w-full">
        <div className="flex items-center gap-8">
          <div className="p-6 bg-blue-600 rounded-4xl shadow-4xl animate-pulse"><Zap size={40} /></div>
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              Planifier <span className="text-blue-500">CAPA</span>
            </h1>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.6em] mt-3 italic">Nouvelle Mesure d&apos;Amélioration Continue</p>
          </div>
        </div>
        <button onClick={() => router.back()} className="p-6 bg-white/5 rounded-2xl hover:bg-red-600 transition-all text-slate-500 hover:text-white border-none cursor-pointer"><X size={32} /></button>
      </header>

      <form onSubmit={handleSubmit} className="max-w-500 mx-auto w-full space-y-12">
        <div className="bg-slate-900/30 border-2 border-white/5 p-16 rounded-[4rem] shadow-4xl space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5"><ShieldAlert size={120} /></div>
          
          <div className="space-y-4 text-left">
            <label className="text-[12px] font-black uppercase text-slate-500 ml-8 tracking-[0.4em]">Désignation de l&apos;action *</label>
            <input 
              required 
              className="w-full bg-[#0B0F1A] border-2 border-white/10 p-10 rounded-[2.5rem] text-xl font-black italic text-white outline-none focus:border-blue-600 shadow-inner" 
              placeholder="INTITULÉ TECHNIQUE..."
              value={formData.ACT_Title} 
              onChange={e => setFormData({...formData, ACT_Title: e.target.value.toUpperCase()})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-4 text-left">
              <label className="text-[12px] font-black uppercase text-slate-500 ml-8 tracking-[0.4em] flex items-center gap-3"><Target size={16} className="text-blue-500" /> Plan PAQ §10.2</label>
              <select required className="w-full bg-[#0B0F1A] border-2 border-white/10 p-8 rounded-2xl font-black text-sm outline-none appearance-none cursor-pointer shadow-inner uppercase italic"
                value={formData.ACT_PAQId} onChange={e => setFormData({...formData, ACT_PAQId: e.target.value})}>
                <option value="">LIER AU PAQ...</option>
                {paqs.map(p => <option key={p.PAQ_Id} value={p.PAQ_Id}>{p.PAQ_Title} ({p.PAQ_Year})</option>)}
              </select>
            </div>
            <div className="space-y-4 text-left">
              <label className="text-[12px] font-black uppercase text-slate-500 ml-8 tracking-[0.4em] flex items-center gap-3"><User size={16} className="text-blue-500" /> Pilote Action</label>
              <select required className="w-full bg-[#0B0F1A] border-2 border-white/10 p-8 rounded-2xl font-black text-sm outline-none appearance-none cursor-pointer shadow-inner uppercase italic"
                value={formData.ACT_ResponsableId} onChange={e => setFormData({...formData, ACT_ResponsableId: e.target.value})}>
                <option value="">ASSIGNER LE RESPONSABLE...</option>
                {users.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-10">
             <div className="space-y-4 text-left">
                <label className="text-[12px] font-black uppercase text-slate-500 ml-8 tracking-[0.4em]">Priorité</label>
                <select className="w-full bg-[#0B0F1A] border-2 border-white/10 p-8 rounded-2xl font-black text-xs outline-none text-amber-500 appearance-none shadow-inner italic"
                  value={formData.ACT_Priority} onChange={e => setFormData({...formData, ACT_Priority: e.target.value as Priority})}>
                  {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
             </div>
             <div className="space-y-4 text-left">
                <label className="text-[12px] font-black uppercase text-slate-500 ml-8 tracking-[0.4em]">Origine</label>
                <select className="w-full bg-[#0B0F1A] border-2 border-white/10 p-8 rounded-2xl font-black text-xs outline-none text-blue-400 appearance-none shadow-inner italic"
                  value={formData.ACT_Origin} onChange={e => setFormData({...formData, ACT_Origin: e.target.value as ActionOrigin})}>
                  {Object.values(ActionOrigin).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
             </div>
             <div className="space-y-4 text-left">
                <label className="text-[12px] font-black uppercase text-slate-500 ml-8 tracking-[0.4em] flex items-center gap-3"><Calendar size={16} className="text-blue-500" /> Échéance</label>
                <input required type="date" className="w-full bg-[#0B0F1A] border-2 border-white/10 p-8 rounded-2xl font-black text-xs outline-none text-white shadow-inner uppercase"
                  value={formData.ACT_Deadline} onChange={e => setFormData({...formData, ACT_Deadline: e.target.value})} />
             </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-white hover:text-blue-600 py-12 rounded-[3rem] font-black uppercase italic text-lg shadow-4xl transition-all flex items-center justify-center gap-6 border-none cursor-pointer group active:scale-95">
          {loading ? <Loader2 className="animate-spin" size={32} /> : <><Save size={32} className="group-hover:rotate-12 transition-transform" /> Sceller l&apos;Action Corrective</>}
        </button>
      </form>
    </div>
  );
}