/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : page.tsx (Détail & Résolution NC)
 * -------------------------------------------------------------------------
 * CHEMIN : src/app/dashboard/non-conformites/[id]/page.tsx
 * RÔLE : Visualisation, diagnostic et clôture d'un écart (§10.2).
 * RÉVISION : 03 Mars 2026 | 16:30 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import {
  AlertOctagon, ArrowLeft, CheckCircle2, Clock,
  FileText, Loader2, Search, Wrench, ShieldCheck, Lock, 
  Activity, ShieldAlert, Zap
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// 🔱 RÉFÉRENTIEL ELITE-SDE
import {
  NonConformite,
  NCStatus,
  NCStatus as NCStatusEnum,
  NCGravity as NCGravityEnum
} from '@/types/elite-sde';

const WORKFLOW_STEPS = [
  { id: NCStatusEnum.DETECTION, label: 'DÉTECTION', icon: AlertOctagon },
  { id: NCStatusEnum.ANALYSE, label: 'DIAGNOSTIC', icon: Search },
  { id: NCStatusEnum.ACTION_EN_COURS, label: 'PLAN D\'ACTION', icon: Wrench },
  { id: NCStatusEnum.VERIFICATION, label: 'VÉRIFICATION', icon: ShieldCheck },
  { id: NCStatusEnum.CLOTURE, label: 'CLÔTURE', icon: CheckCircle2 },
];

export default function NonConformiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ncId = params.id as string;
  const { user } = useAuthStore() as any;

  const [nc, setNc] = useState<NonConformite | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [diagnostic, setDiagnostic] = useState('');

  const fetchNC = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<NonConformite>(`/non-conformites/${ncId}`);
      setNc(res.data);
      setDiagnostic(res.data.NC_Diagnostic || '');
    } catch (err) {
      toast.error('ÉCHEC DE LOCALISATION DE L\'ÉCART');
      router.push('/dashboard/non-conformites');
    } finally {
      setLoading(false);
    }
  }, [ncId, router]);

  useEffect(() => { fetchNC(); }, [fetchNC]);

  const handleUpdatePhase = async (nextStatus: NCStatus, payload: Partial<NonConformite> = {}) => {
    setSaving(true);
    const tid = toast.loading(`SCELLAGE : PASSAGE EN ${nextStatus}...`);
    try {
      await apiClient.patch(`/non-conformites/${ncId}`, {
        NC_Statut: nextStatus,
        ...payload
      });
      toast.success(`PHASE SCELLÉE : ${nextStatus}`, { id: tid });
      fetchNC();
    } catch (error) {
      toast.error('ERREUR DE COMMUNICATION KERNEL');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !nc) return (
    <div className="flex h-[80vh] items-center justify-center italic text-blue-500 font-black uppercase tracking-[0.4em]">
      <Loader2 className="h-10 w-10 animate-spin mr-6" /> Synchronisation du dossier...
    </div>
  );

  const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.id === nc.NC_Statut);
  const isClosed = nc.NC_Statut === NCStatusEnum.CLOTURE;

  return (
    <div className="bg-[#0B0F1A] min-h-screen p-6 lg:p-10 text-white font-sans italic selection:bg-blue-600/30 animate-in fade-in duration-500">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER */}
      <header className="mb-12 border-b border-white/5 pb-8">
        <button 
          onClick={() => router.push('/dashboard/non-conformites')} 
          className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 tracking-widest hover:text-white transition-all mb-8 bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={14} /> Registre des Non-Conformités
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="rounded-xl bg-red-600/10 border border-red-500/20 px-4 py-1.5 text-[9px] font-black text-red-500 uppercase tracking-widest">
                REF: {nc.NC_Id.slice(0, 8).toUpperCase()}
              </span>
              <span className={`rounded-xl px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border ${
                nc.NC_Gravite === NCGravityEnum.CRITIQUE ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {nc.NC_Gravite}
              </span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter m-0">{nc.NC_Libelle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest">
              <Activity size={16} className={isClosed ? "text-emerald-500" : "text-amber-500 animate-pulse"} /> 
              {nc.NC_Statut}
            </div>
          </div>
        </div>
      </header>

      {/* 🔄 STEPPER */}
      <div className="mb-16 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 rounded-full z-0" />
        <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full z-0 transition-all duration-700" style={{ width: `${(currentStepIndex / (WORKFLOW_STEPS.length - 1)) * 100}%` }} />
        <div className="relative z-10 flex justify-between">
          {WORKFLOW_STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${index <= currentStepIndex ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20' : 'bg-[#0B0F1A] border-white/10 text-slate-600'}`}>
                <step.icon size={18} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${index === currentStepIndex ? 'text-white' : 'text-slate-600'}`}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 🛠️ CONTENU PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0F172A] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-6 flex items-center gap-3">
              <FileText size={16} className="text-blue-500" /> Constat
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-bold uppercase">{nc.NC_Description}</p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className={`bg-[#0F172A] border rounded-[2.5rem] p-10 shadow-2xl transition-all ${currentStepIndex >= 1 ? 'border-blue-500/20' : 'opacity-40 grayscale'}`}>
            <h2 className="text-sm font-black uppercase text-white tracking-[0.2em] mb-6 flex items-center gap-4">
              <Search size={20} className="text-blue-500" /> Analyse & Diagnostic (§10.2)
            </h2>
            <textarea 
              value={diagnostic} 
              onChange={e => setDiagnostic(e.target.value)} 
              disabled={currentStepIndex > 1 || isClosed}
              className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-sm font-bold italic text-slate-300 outline-none focus:border-blue-500 transition-all uppercase resize-none h-40" 
              placeholder="Saisir l'analyse des causes racines..." 
            />
            {currentStepIndex <= 1 && !isClosed && (
              <button 
                onClick={() => handleUpdatePhase(NCStatusEnum.ACTION_EN_COURS, { NC_Diagnostic: diagnostic })} 
                disabled={saving || !diagnostic.trim()} 
                className="mt-6 w-full py-4 rounded-2xl bg-blue-600 hover:bg-white hover:text-blue-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl border-none cursor-pointer transition-all"
              >
                Valider le diagnostic
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}