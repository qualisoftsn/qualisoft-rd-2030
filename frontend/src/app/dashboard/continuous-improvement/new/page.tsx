/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 MODULE : CRÉATION ACTION CORRECTIVE (NEW) - elite-sde
 * -------------------------------------------------------------------------
 * RÔLE : Workflow de scellage documentaire PDCA.
 * FIX : Stepper Matrix, Occupation intégrale, Zéro NextAuth.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 03:20 GMT
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast, Toaster } from 'sonner';
import apiClient from '@/core/api/api-client';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Layers, Loader2,
  Save, ShieldCheck, Target, FileWarning
} from 'lucide-react';
import { cn } from '@/core/utils/cn';

export default function NewActionPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refs, setRefs] = useState({ users: [], paqs: [], processes: [] });

  const [form, setForm] = useState({
    ACT_Title: '', ACT_Description: '', ACT_Priority: 'MEDIUM',
    ACT_Origin: 'AUTRE', ACT_ResponsableId: '', ACT_PAQId: '', ACT_Deadline: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [u, p, pr] = await Promise.all([
          apiClient.get('/users'), apiClient.get('/paq'), apiClient.get('/processus')
        ]);
        setRefs({ users: u.data, paqs: p.data, processes: pr.data });
      } catch { toast.error("Échec chargement référentiels."); }
    };
    loadData();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const tid = toast.loading("Scellage en cours...");
    try {
      await apiClient.post('/actions', { ...form, ACT_Status: 'A_FAIRE', ACT_IsActive: true });
      toast.success("Action scellée dans le registre.", { id: tid });
      router.push('/dashboard/continuous-improvement');
    } catch { toast.error("Échec du scellage.", { id: tid }); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-full bg-[#0B0F1A] text-white italic font-sans overflow-y-auto custom-scrollbar p-6 lg:p-12 pb-32">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="max-w-4xl mx-auto mt-12 lg:mt-0">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-white/5 border border-white/5 px-6 py-3 rounded-2xl mb-12 cursor-pointer">
          <ArrowLeft size={16} /> Retour Registre
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic m-0 leading-none">Sceller une <span className="text-blue-600">Action</span></h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4 m-0 italic flex justify-center items-center gap-3">
             <Target size={14} className="text-blue-500" /> PLAN-DO-CHECK-ACT • ISO 9001:2015
          </p>
        </div>

        {/* STEPPER ELITE */}
        <div className="grid grid-cols-3 gap-4 mb-16 max-w-2xl mx-auto">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn("h-2 rounded-full transition-all duration-500", step >= s ? "bg-blue-600 shadow-[0_0_15px_#2563eb]" : "bg-white/5")} />
          ))}
        </div>

        <div className="bg-[#151B2B] border-2 border-white/5 rounded-[3rem] p-8 lg:p-12 shadow-4xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full" />
          
          {step === 1 && (
            <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Désignation de l&apos;action *</label>
                <input value={form.ACT_Title} onChange={e => setForm({...form, ACT_Title: e.target.value})} className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-5 text-sm font-black italic uppercase text-white outline-none focus:border-blue-500" placeholder="EX: MISE EN CONFORMITÉ DES ÉQUIPEMENTS..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Description / Analyse des causes</label>
                <textarea rows={4} value={form.ACT_Description} onChange={e => setForm({...form, ACT_Description: e.target.value})} className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-5 text-sm font-bold italic text-white outline-none focus:border-blue-500" placeholder="Détaillez le 'Pourquoi' et le 'Comment'..." />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Priorité Matrix</label>
                  <select value={form.ACT_Priority} onChange={e => setForm({...form, ACT_Priority: e.target.value})} className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-5 text-xs font-black italic text-white outline-none cursor-pointer">
                    <option value="CRITICAL">CRITIQUE</option><option value="HIGH">HAUTE</option><option value="MEDIUM">MOYENNE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Origine</label>
                  <select value={form.ACT_Origin} onChange={e => setForm({...form, ACT_Origin: e.target.value})} className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-5 text-xs font-black italic text-white outline-none cursor-pointer">
                    <option value="AUDIT">AUDIT</option><option value="NC">NON-CONFORMITÉ</option><option value="AUTRE">AUTRE</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="bg-blue-600/10 border-2 border-blue-500/20 p-6 rounded-4xl flex items-center gap-5">
                 <Layers className="text-blue-500" size={32} />
                 <p className="text-xs font-bold italic text-blue-300 m-0">Liaison obligatoire au Plan d&apos;Actions Qualité (PAQ) pour consolidation du SMI.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Rattachement PAQ *</label>
                <select value={form.ACT_PAQId} onChange={e => setForm({...form, ACT_PAQId: e.target.value})} className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-5 text-xs font-black italic text-white outline-none">
                  <option value="">SÉLECTIONNER UN PLAN ACTIF...</option>
                  {refs.paqs.map((p:any) => <option key={p.PAQ_Id} value={p.PAQ_Id}>{p.PAQ_Title.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Pilote Responsable *</label>
                  <select value={form.ACT_ResponsableId} onChange={e => setForm({...form, ACT_ResponsableId: e.target.value})} className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-5 text-xs font-black italic text-white outline-none">
                    <option value="">CHOISIR UN UTILISATEUR...</option>
                    {refs.users.map((u:any) => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Échéance Finale *</label>
                  <input type="date" value={form.ACT_Deadline} onChange={e => setForm({...form, ACT_Deadline: e.target.value})} className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-5 text-xs font-black text-white outline-none" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in zoom-in-95">
               <div className="bg-emerald-500/10 border-2 border-emerald-500/20 p-8 rounded-[2.5rem] text-center">
                  <ShieldCheck className="mx-auto text-emerald-500 mb-4" size={56} />
                  <h3 className="text-xl font-black uppercase italic text-white m-0">Payload Validé</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-3">L&apos;action va être scellée avec la référence système unique.</p>
               </div>
               <div className="bg-black/40 border border-white/5 p-6 rounded-2xl space-y-4 font-black italic text-xs uppercase">
                  <div className="flex justify-between"><span>Désignation:</span> <span className="text-blue-500">{form.ACT_Title}</span></div>
                  <div className="flex justify-between"><span>Échéance:</span> <span className="text-white">{form.ACT_Deadline}</span></div>
               </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-12 pt-10 border-t border-white/5">
            <button disabled={step === 1} onClick={() => setStep(s => s - 1)} className="px-8 py-5 rounded-3xl bg-white/5 text-[10px] font-black uppercase italic text-slate-400 hover:text-white transition-all cursor-pointer border-none flex items-center justify-center gap-3">
              <ArrowLeft size={16} /> Précédent
            </button>
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} className="px-10 py-5 bg-blue-600 rounded-3xl text-[10px] font-black uppercase italic text-white shadow-xl shadow-blue-900/20 transition-all cursor-pointer border-none flex items-center justify-center gap-3 active:scale-95">
                Étape Suivante <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="px-10 py-5 bg-emerald-600 rounded-3xl text-[10px] font-black uppercase italic text-white shadow-xl shadow-emerald-900/20 transition-all cursor-pointer border-none flex items-center justify-center gap-3 active:scale-95">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} SCELLER L&apos;ACTION
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}