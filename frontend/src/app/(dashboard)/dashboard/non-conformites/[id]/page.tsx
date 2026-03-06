/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : RÉSOLUTION NC §10.2 (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Diagnostic, plan d'action et scellage de clôture d'un écart.
 * DESIGN : Cockpit 100dvh, Layout Multi-Panneaux, ClickUp Density.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 17:15 GMT
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  AlertOctagon, ArrowLeft, CheckCircle2, 
  FileText, Search, Wrench, ShieldCheck, 
  Activity, ShieldAlert, RefreshCcw, Save
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

const WORKFLOW_STEPS = [
  { id: 'DETECTION', label: 'DÉTECTION', icon: AlertOctagon },
  { id: 'ANALYSE', label: 'DIAGNOSTIC', icon: Search },
  { id: 'ACTION_EN_COURS', label: 'PLAN ACTION', icon: Wrench },
  { id: 'VERIFICATION', label: 'VÉRIFICATION', icon: ShieldCheck },
  { id: 'CLOTURE', label: 'CLÔTURE', icon: CheckCircle2 },
];

export default function NonConformiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ncId = params.id as string;

  const [nc, setNc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [diagnostic, setDiagnostic] = useState('');

  const fetchNC = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/non-conformites/${ncId}`);
      const data = res.data?.data || res.data;
      setNc(data);
      setDiagnostic(data.NC_Diagnostic || '');
    } catch {
      toast.error('RUPTURE LIAISON : ÉCART INTROUVABLE');
      router.push('/dashboard/non-conformites');
    } finally { setLoading(false); }
  }, [ncId, router]);

  useEffect(() => { fetchNC(); }, [fetchNC]);

  const handleUpdatePhase = async (nextStatus: string, payload: any = {}) => {
    setSaving(true);
    const tid = toast.loading(`SCELLAGE KERNEL : PASSAGE EN ${nextStatus}...`);
    try {
      await apiClient.patch(`/non-conformites/${ncId}`, { NC_Statut: nextStatus, ...payload });
      toast.success(`PHASE SCELLÉE : ${nextStatus} (§10.2)`, { id: tid });
      fetchNC();
    } catch { toast.error('ERREUR DE COMMUNICATION KERNEL'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingScreen label="Ouverture du Dossier NC §10.2..." />;

  const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.id === nc?.NC_Statut);
  const isClosed = nc?.NC_Statut === 'CLOTURE';

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-red-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-8 mt-12 lg:mt-0">
        <button onClick={() => router.push('/dashboard/non-conformites')} className="flex items-center gap-3 text-[10px] text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer italic tracking-widest">
          <ArrowLeft size={16} /> Retour au registre
        </button>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-[10px] tracking-[0.2em] shadow-inner">
            <Activity size={18} className={isClosed ? "text-emerald-500" : "text-amber-500 animate-pulse"} /> {nc.NC_Statut}
          </div>
        </div>
      </header>

      {/* 🔄 STEPPER MATRIX */}
      <div className="shrink-0 p-10 pb-0 flex flex-col items-center">
        <div className="w-full max-w-5xl relative flex justify-between px-10">
          <div className="absolute top-1/2 left-20 right-20 h-1 bg-white/5 -translate-y-1/2 z-0 rounded-full" />
          <div className="absolute top-1/2 left-20 h-1 bg-red-600 -translate-y-1/2 z-0 transition-all duration-1000 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]" style={{ width: `${(currentStepIndex / (WORKFLOW_STEPS.length - 1)) * 100 * 0.8}%` }} />
          {WORKFLOW_STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center gap-4 relative z-10">
              <div className={cn("w-14 h-14 rounded-3xl flex items-center justify-center border-2 transition-all duration-500 shadow-2xl", index <= currentStepIndex ? 'bg-red-600 border-red-400 text-white' : 'bg-[#0B0F1A] border-white/10 text-slate-700')}>
                <step.icon size={24} />
              </div>
              <span className={cn("text-[8px] tracking-[0.3em]", index === currentStepIndex ? 'text-white' : 'text-slate-700')}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 📋 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-10 lg:p-14">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-12 text-left">
          
          <div className="col-span-12 lg:col-span-4 space-y-10">
            <div className="bg-[#151B2B] border-2 border-white/5 rounded-[4rem] p-12 shadow-4xl relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none rotate-12"><ShieldAlert size={200} /></div>
               <span className="text-[10px] text-red-500 tracking-[0.5em] mb-4 block">IDENTITÉ ÉCART</span>
               <h1 className="text-4xl font-black m-0 leading-none tracking-tighter uppercase italic">{nc.NC_Libelle}</h1>
               <div className="mt-10 pt-10 border-t border-white/5 space-y-6">
                  <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500">GRAVITÉ</span><span className="text-sm font-black text-red-500 italic">{nc.NC_Gravite}</span></div>
                  <div className="flex justify-between items-center"><span className="text-[9px] text-slate-500">SOURCE</span><span className="text-sm font-black text-blue-500 italic">{nc.NC_Source}</span></div>
               </div>
            </div>

            <div className="bg-black/40 border-2 border-white/5 rounded-[4rem] p-10 shadow-inner">
               <h4 className="text-[10px] text-slate-600 tracking-[0.4em] mb-6 m-0 uppercase flex items-center gap-3"><FileText size={14} /> Description Constat</h4>
               <p className="text-sm text-slate-300 font-bold leading-relaxed m-0 italic uppercase">{nc.NC_Description}</p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-10">
            <div className={cn("bg-[#151B2B] border-2 rounded-[4rem] p-12 shadow-4xl transition-all", currentStepIndex >= 1 ? 'border-red-600/20' : 'opacity-20 grayscale')}>
              <h2 className="text-2xl font-black mb-10 m-0 flex items-center gap-6"><Search className="text-red-500" size={32} /> Analyse des Causes Racines (§10.2)</h2>
              <textarea 
                value={diagnostic} 
                onChange={e => setDiagnostic(e.target.value)} 
                disabled={currentStepIndex > 1 || isClosed}
                className="w-full bg-black/40 border-2 border-white/5 rounded-[3rem] p-10 text-lg font-bold italic text-slate-300 outline-none focus:border-red-600 transition-all uppercase resize-none h-64 shadow-inner leading-relaxed" 
                placeholder="DÉTAILLER L'ANALYSE DES CAUSES (5 POURQUOI / ISHIKAWA)..." 
              />
              {currentStepIndex <= 1 && !isClosed && (
                <button 
                  onClick={() => handleUpdatePhase('ACTION_EN_COURS', { NC_Diagnostic: diagnostic })} 
                  disabled={saving || !diagnostic.trim()} 
                  className="mt-10 w-full py-6 rounded-[2.5rem] bg-red-600 hover:bg-white hover:text-red-600 text-white font-black text-[12px] tracking-[0.4em] shadow-4xl border-none cursor-pointer transition-all active:scale-95"
                >
                  {saving ? <RefreshCcw className="animate-spin" /> : <Save size={18} className="inline mr-4" />} Valider & Sceller l&apos;Analyse
                </button>
              )}
            </div>
          </div>
          
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(220,38,38,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-red-600 italic font-black uppercase tracking-[0.5em]">
      <RefreshCcw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}