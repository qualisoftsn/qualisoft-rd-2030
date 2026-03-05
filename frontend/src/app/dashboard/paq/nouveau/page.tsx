/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : INITIALISATION PAQ — COMMAND CENTER
 * -------------------------------------------------------------------------
 * RÔLE : Déploiement de nouveaux plans d'actions (§10.3 ISO 9001).
 * DESIGN : Elite High-Density, 100dvh, Zéro Scroll, ClickUp Style.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 18:50 GMT
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldCheck, Save, Loader2, 
  Calendar, RefreshCw, ArrowLeft, Building2,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function NouveauPAQPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processes, setProcesses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [form, setForm] = useState({
    PAQ_Title: '',
    PAQ_Year: new Date().getFullYear(),
    PAQ_ProcessusId: '',
    PAQ_QualityManagerId: '',
    PAQ_Description: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resP, resU] = await Promise.all([
        apiClient.get('/processus'),
        apiClient.get('/users')
      ]);
      setProcesses(resP.data?.data || resP.data || []);
      setUsers(resU.data?.data || resU.data || []);
    } catch {
      toast.error("ERREUR DE SYNCHRONISATION DES RÉFÉRENTIELS");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/paq', form);
      toast.success("PLAN ANNUEL SCELLÉ AVEC SUCCÈS");
      router.push('/dashboard/paq');
    } catch {
      toast.error("ÉCHEC DE L'ÉCRITURE MATRICIELLE");
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingScreen label="Chargement des Référentiels SMI..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[9px] text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer mb-2">
            <ArrowLeft size={14} /> Retour Registre
          </button>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0 italic">Initialiser <span className="text-blue-600">PAQ</span></h1>
        </div>
        <div className="flex gap-4">
          <div className="hidden xl:flex items-center gap-4 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <ShieldCheck size={18} className="text-emerald-500" />
            <span className="text-[9px] text-emerald-500 tracking-widest">ISO 9001:2015 Verified</span>
          </div>
        </div>
      </header>

      {/* 📝 FORMULAIRE HAUTE DENSITÉ */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 flex justify-center items-start pt-12">
        <form onSubmit={handleSubmit} className="w-full max-w-4xl grid grid-cols-12 gap-8 pb-20">
          
          <div className="col-span-12 xl:col-span-8 space-y-8">
            <section className="bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] p-10 lg:p-16 shadow-4xl space-y-10 text-left">
              <div className="space-y-4">
                <label className="text-[10px] text-slate-500 tracking-[0.4em] ml-4">Désignation du Plan *</label>
                <input required value={form.PAQ_Title} onChange={e => setForm({...form, PAQ_Title: e.target.value.toUpperCase()})} className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-sm font-black text-white outline-none focus:border-blue-600 uppercase italic shadow-inner" placeholder="EX: PLAN D'ACTIONS QUALITÉ SI 2026" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] text-slate-500 tracking-[0.4em] ml-4">Périmètre / Description</label>
                <textarea rows={5} value={form.PAQ_Description} onChange={e => setForm({...form, PAQ_Description: e.target.value})} className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-sm font-bold text-slate-300 outline-none focus:border-blue-600 italic shadow-inner resize-none" placeholder="Objectifs et périmètre d'application..." />
              </div>
            </section>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-8">
            <section className="bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] p-10 shadow-4xl space-y-8 text-left">
              <div className="space-y-4">
                <label className="text-[10px] text-slate-500 tracking-[0.4em] ml-2 flex items-center gap-2"><Calendar size={12}/> Exercice</label>
                <input type="number" value={form.PAQ_Year} onChange={e => setForm({...form, PAQ_Year: parseInt(e.target.value)})} className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-sm font-black text-white outline-none focus:border-blue-600 italic" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] text-slate-500 tracking-[0.4em] ml-2 flex items-center gap-2"><Building2 size={12}/> Processus *</label>
                <select required value={form.PAQ_ProcessusId} onChange={e => setForm({...form, PAQ_ProcessusId: e.target.value})} className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-xs font-black text-white outline-none appearance-none cursor-pointer">
                  <option value="">SÉLECTIONNER...</option>
                  {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] text-slate-500 tracking-[0.4em] ml-2 flex items-center gap-2"><Users size={12}/> Pilote Qualité *</label>
                <select required value={form.PAQ_QualityManagerId} onChange={e => setForm({...form, PAQ_QualityManagerId: e.target.value})} className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-xs font-black text-white outline-none appearance-none cursor-pointer">
                  <option value="">SÉLECTIONNER...</option>
                  {users.map(u => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
                </select>
              </div>

              <button disabled={submitting} type="submit" className="w-full bg-blue-600 hover:bg-white hover:text-blue-600 py-6 rounded-[2.5rem] text-[12px] text-white shadow-4xl border-none cursor-pointer transition-all font-black italic tracking-widest mt-8 flex items-center justify-center gap-3">
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Sceller le Plan
              </button>
            </section>
          </div>

        </form>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}