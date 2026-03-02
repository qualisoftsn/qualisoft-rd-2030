/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛡️ MODULE : RÉSOLUTION DES NON-CONFORMITÉS (SMI MATRIX)
 * -------------------------------------------------------------------------
 * RÔLE : Traitement, diagnostic et clôture d'un écart.
 * NORME : ISO 9001:2015 §10.2.
 * DESIGN : Elite Dark Industrial • Glassmorphism • UI Dense.
 * LOGIQUE : 100% ALIGNÉ PRISMA. Utilisation exclusive de `NC_Diagnostic`
 * et transition stricte du `NC_Statut`.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 12:05 GMT
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import {
  AlertOctagon, ArrowLeft, CheckCircle2, ChevronRight, Clock,
  FileText, Loader2, Save, ShieldAlert, Target, XCircle, Zap,
  Search, Wrench, ShieldCheck, Lock, Link as LinkIcon
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  NonConformite, NCStatus, NCGravity, NCSource,
  NCStatus as NCStatusEnum, NCGravity as NCGravityEnum
} from '@/types/elite-sde';

// --- CONFIGURATION DU WORKFLOW SDE ---
const WORKFLOW_STEPS = [
  { id: NCStatusEnum.DETECTION, label: 'DÉTECTION', icon: AlertOctagon },
  { id: NCStatusEnum.ANALYSE, label: 'DIAGNOSTIC', icon: Search },
  { id: NCStatusEnum.ACTION_EN_COURS, label: 'PLAN D\'ACTION', icon: Wrench },
  { id: NCStatusEnum.VERIFICATION, label: 'VÉRIFICATION', icon: ShieldCheck },
  { id: NCStatusEnum.CLOTURE, label: 'CLÔTURE', icon: CheckCircle2 },
];

export default function NonConformiteResolutionPage() {
  const router = useRouter();
  const params = useParams();
  const ncId = params.id as string;
  const { user } = useAuthStore();

  const [nc, setNc] = useState<NonConformite | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // État strictement limité aux champs existants dans Prisma
  const [diagnostic, setDiagnostic] = useState('');

  // --- 📡 SYNCHRONISATION KERNEL ---
  const fetchNC = useCallback(async () => {
    try {
      setLoading(true);
      // On peut imaginer inclure les actions liées si l'API le permet : ?include=actions
      const res = await apiClient.get<NonConformite>(`/non-conformites/${ncId}`);
      const data = res.data;
      setNc(data);
      // Hydratation du SEUL champ texte de résolution existant dans Prisma
      setDiagnostic(data.NC_Diagnostic || '');
    } catch (err) {
      toast.error('ÉCHEC DE LOCALISATION DE L\'ÉCART DANS LE KERNEL');
      router.push('/dashboard/non-conformites');
    } finally {
      setLoading(false);
    }
  }, [ncId, router]);

  useEffect(() => { fetchNC(); }, [fetchNC]);

  // --- ⚙️ MOTEUR DE TRANSITION DE STATUT ---
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
      toast.error('ÉCHEC DE SCELLAGE MATRIX', { id: tid });
    } finally {
      setSaving(false);
    }
  };

  const getStepIndex = (status: string) => WORKFLOW_STEPS.findIndex(s => s.id === status);

  if (loading || !nc) return (
    <div className="ml-0 lg:ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-red-500 font-black uppercase italic tracking-[0.5em] animate-pulse">
      <Loader2 className="h-10 w-10 animate-spin mr-4" /> Extraction du Dossier §10.2...
    </div>
  );

  const currentStepIndex = getStepIndex(nc.NC_Statut);
  const isClosed = nc.NC_Statut === NCStatusEnum.CLOTURE;

  return (
    <div className="ml-0 lg:ml-72 bg-[#0B0F1A] min-h-screen p-8 lg:p-12 text-white font-sans italic selection:bg-red-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER & NAVIGATION */}
      <header className="mb-12 animate-in fade-in slide-in-from-top-4">
        <button onClick={() => router.push('/dashboard/non-conformites')} className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 tracking-widest hover:text-white transition-colors mb-8 bg-transparent border-none cursor-pointer">
          <ArrowLeft size={14} /> Retour au Registre Central
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="rounded-xl bg-red-600/10 border border-red-500/20 px-4 py-1.5 text-[9px] font-black text-red-500 uppercase tracking-widest">{nc.NC_Code || `NC-${nc.NC_Id.slice(0, 6)}`}</span>
              <span className={`rounded-xl px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border ${nc.NC_Gravite === NCGravityEnum.CRITIQUE ? 'bg-red-500/10 text-red-500 border-red-500/20' : nc.NC_Gravite === NCGravityEnum.MAJEURE ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                Gravité : {nc.NC_Gravite}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter m-0 leading-none">{nc.NC_Libelle}</h1>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-3">
              <Clock size={12} /> DÉCLARÉ LE {new Date(nc.NC_CreatedAt).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {isClosed ? (
              <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-widest shadow-3xl shadow-emerald-900/20">
                <Lock size={16} /> DOSSIER SCELLÉ ET CLÔTURÉ
              </div>
            ) : (
              <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                <Zap size={16} className="text-amber-500 animate-pulse" /> ÉTAT : {nc.NC_Statut}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 🔄 WORKFLOW STEPPER SDE */}
      <div className="mb-14 relative animate-in fade-in zoom-in-95 duration-700">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 rounded-full z-0" />
        <div className="absolute top-1/2 left-0 h-1 bg-red-600 -translate-y-1/2 rounded-full z-0 transition-all duration-1000" style={{ width: `${(currentStepIndex / (WORKFLOW_STEPS.length - 1)) * 100}%` }} />
        
        <div className="relative z-10 flex justify-between">
          {WORKFLOW_STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isActive = index === currentStepIndex;
            return (
              <div key={step.id} className="flex flex-col items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-xl ${isActive ? 'bg-red-600 border-red-400 text-white scale-110 shadow-red-600/40' : isCompleted ? 'bg-[#0B0F1A] border-red-600 text-red-500' : 'bg-[#0B0F1A] border-white/10 text-slate-600'}`}>
                  <step.icon size={20} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest hidden md:block ${isActive ? 'text-white' : isCompleted ? 'text-red-400' : 'text-slate-600'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-32">
        {/* 📑 COLONNE GAUCHE : IDENTITÉ DE L'ÉCART */}
        <div className="lg:col-span-4 space-y-8 animate-in slide-in-from-left-8 duration-700">
          <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 backdrop-blur-md shadow-3xl">
            <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
              <FileText size={16} className="text-blue-500" /> Constat Factuel
            </h2>
            <div className="text-sm font-medium text-slate-300 uppercase leading-relaxed mb-8">
              {nc.NC_Description}
            </div>
            
            <div className="space-y-6">
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Source Détection</p>
                <p className="text-xs font-black text-white uppercase">{nc.NC_Source}</p>
              </div>
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Processus Impacté</p>
                <p className="text-xs font-black text-blue-400 uppercase">{nc.NC_ProcessusId || "NON DÉFINI"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🛠️ COLONNE DROITE : MOTEUR DE RÉSOLUTION MATRICIEL (§10.2) */}
        <div className="lg:col-span-8 space-y-8 animate-in slide-in-from-right-8 duration-700">
          
          {/* PHASE 1 & 2 : DIAGNOSTIC (Aligné avec NC_Diagnostic de Prisma) */}
          <div className={`bg-slate-900/40 border rounded-[3rem] p-10 backdrop-blur-md shadow-3xl transition-all duration-500 ${currentStepIndex >= 0 ? 'border-red-500/30' : 'border-white/5 opacity-50 grayscale'}`}>
            <h2 className="text-sm font-black uppercase text-white tracking-[0.2em] mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4"><Search size={20} className="text-red-500" /> Diagnostic & Analyse des Causes</div>
              {currentStepIndex > 1 && <CheckCircle2 size={20} className="text-emerald-500" />}
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Champ de la base : NC_Diagnostic</p>
            <textarea 
              value={diagnostic} onChange={e => setDiagnostic(e.target.value)} disabled={currentStepIndex > 1 || isClosed}
              className="w-full bg-black/40 border border-white/10 rounded-3xl p-8 text-sm font-bold italic text-slate-300 outline-none focus:border-red-500 transition-all uppercase resize-none disabled:opacity-50" 
              rows={4} placeholder="DÉTERMINATION DES CAUSES PROFONDES (5 POURQUOI, ISHIKAWA)..." 
            />
            
            {/* Si on est en phase DÉTECTION ou ANALYSE, on peut sceller le diagnostic pour passer à l'action */}
            {currentStepIndex <= 1 && !isClosed && (
              <button onClick={() => handleUpdatePhase(NCStatusEnum.ACTION_EN_COURS, { NC_Diagnostic: diagnostic })} disabled={saving || !diagnostic.trim()} className="mt-6 w-full py-5 rounded-4xl bg-red-600 hover:bg-white hover:text-red-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl border-none cursor-pointer disabled:opacity-20 transition-all">
                Sceller le Diagnostic & Déclencher le Plan d&apos;Action
              </button>
            )}
          </div>

          {/* PHASE 3 : ACTIONS (Rappel de l'architecture relationnelle Prisma `NC_Actions Action[]`) */}
          <div className={`bg-slate-900/40 border rounded-[3rem] p-10 backdrop-blur-md shadow-3xl transition-all duration-500 ${currentStepIndex >= 2 ? 'border-amber-500/30' : 'border-white/5 opacity-50 grayscale pointer-events-none'}`}>
            <h2 className="text-sm font-black uppercase text-white tracking-[0.2em] mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4"><Wrench size={20} className="text-amber-500" /> Plan d&apos;Actions Correctives</div>
              {currentStepIndex > 2 && <CheckCircle2 size={20} className="text-emerald-500" />}
            </h2>
            
            <div className="bg-black/30 border border-amber-500/20 rounded-3xl p-8 text-center">
              <LinkIcon size={32} className="text-amber-500/50 mx-auto mb-4" />
              <p className="text-xs font-bold text-slate-300 uppercase leading-relaxed max-w-lg mx-auto mb-6">
                Conformément à l&apos;architecture du Kernel, les actions liées à cet écart sont gérées dans le module <span className="text-amber-500">Actions (PAQ)</span>.
              </p>
              <button onClick={() => router.push('/dashboard/improvement')} className="px-6 py-3 rounded-xl bg-amber-600/20 text-amber-500 border border-amber-500/30 font-black text-[9px] uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all cursor-pointer">
                Ouvrir le registre des actions
              </button>
            </div>

            {currentStepIndex === 2 && !isClosed && (
              <button onClick={() => handleUpdatePhase(NCStatusEnum.VERIFICATION)} disabled={saving} className="mt-6 w-full py-5 rounded-4xl bg-amber-600 hover:bg-white hover:text-amber-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl border-none cursor-pointer disabled:opacity-20 transition-all">
                Actions Déployées ➔ Demander Vérification
              </button>
            )}
          </div>

          {/* PHASE 4 & 5 : VÉRIFICATION & CLÔTURE (Changement d'état strict) */}
          <div className={`bg-slate-900/40 border rounded-[3rem] p-10 backdrop-blur-md shadow-3xl transition-all duration-500 ${currentStepIndex >= 3 ? 'border-emerald-500/30' : 'border-white/5 opacity-50 grayscale pointer-events-none'}`}>
            <h2 className="text-sm font-black uppercase text-white tracking-[0.2em] mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4"><ShieldCheck size={20} className="text-emerald-500" /> Vérification de l&apos;Efficacité</div>
              {isClosed && <CheckCircle2 size={20} className="text-emerald-500" />}
            </h2>
            
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8">
              <p className="text-xs font-bold text-emerald-400/80 uppercase leading-relaxed m-0 text-center">
                Vérifiez que les actions rattachées ont atteint leurs objectifs. La clôture de cet écart verrouillera définitivement l&apos;enregistrement pour audit (§10.2).
              </p>
            </div>

            {currentStepIndex === 3 && !isClosed && (
              <button onClick={() => handleUpdatePhase(NCStatusEnum.CLOTURE)} disabled={saving} className="mt-8 w-full py-6 rounded-4xl bg-emerald-600 hover:bg-white hover:text-emerald-600 text-white font-black uppercase text-[11px] tracking-widest shadow-xl border-none cursor-pointer disabled:opacity-20 transition-all flex items-center justify-center gap-3">
                <Lock size={18} /> Sceller et Clôturer l&apos;Écart
              </button>
            )}
          </div>

        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef4444; }
      `}</style>
    </div>
  );
}