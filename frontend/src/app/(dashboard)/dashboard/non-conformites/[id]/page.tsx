/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : RÉSOLUTION NC §10.2 (ISO 9001)
 * RÔLE : Diagnostic, plan d'action et scellage de clôture d'un écart
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useCallback, useEffect, useState, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient, { type ApiError } from '@/core/api/api-client';
import {
  AlertOctagon, ArrowLeft, CheckCircle2, 
  FileText, Search, Wrench, ShieldCheck, 
  Activity, ShieldAlert, RefreshCcw, Save
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type NCStatus = 'DETECTION' | 'ANALYSE' | 'ACTION_EN_COURS' | 'VERIFICATION' | 'CLOTURE';
export type NCGravity = 'MINEURE' | 'MAJEURE' | 'CRITIQUE';

export interface NonConformite {
  NC_Id: string;
  NC_Libelle: string;
  NC_Description: string;
  NC_Gravite: NCGravity;
  NC_Statut: NCStatus;
  NC_Source: string;
  NC_Diagnostic?: string;
  NC_CreatedAt: string;
  NC_UpdatedAt: string;
  NC_ProcessusId?: string;
  NC_ResponsableId?: string;
  NC_ActionId?: string;
}

export interface WorkflowStep {
  id: NCStatus;
  label: string;
  icon: React.ElementType;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 'DETECTION', label: 'DÉTECTION', icon: AlertOctagon },
  { id: 'ANALYSE', label: 'DIAGNOSTIC', icon: Search },
  { id: 'ACTION_EN_COURS', label: 'PLAN ACTION', icon: Wrench },
  { id: 'VERIFICATION', label: 'VÉRIFICATION', icon: ShieldCheck },
  { id: 'CLOTURE', label: 'CLÔTURE', icon: CheckCircle2 },
];

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCcw className="animate-spin text-red-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-red-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function NonConformiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ncId = params.id as string;

  const [nc, setNc] = useState<NonConformite | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [diagnostic, setDiagnostic] = useState('');

  const fetchNC = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<NonConformite>(`/non-conformites/${ncId}`);
      const data = res.data?.data || res.data;
      setNc(data);
      setDiagnostic(data?.NC_Diagnostic || '');
    } catch (error) {
      console.error('❌ Erreur chargement NC:', error);
      toast.error('RUPTURE LIAISON : ÉCART INTROUVABLE');
      router.push('/dashboard/non-conformites');
    } finally { 
      setLoading(false); 
    }
  }, [ncId, router]);

  useEffect(() => { if (typeof window !== 'undefined') fetchNC(); }, [fetchNC]);

  const handleUpdatePhase = async (nextStatus: NCStatus, payload: Partial<NonConformite> = {}) => {
    setSaving(true);
    const toastId = toast.loading(`SCELLAGE KERNEL : PASSAGE EN ${nextStatus}...`);
    try {
      await apiClient.patch(`/non-conformites/${ncId}`, { NC_Statut: nextStatus, ...payload });
      toast.success(`PHASE SCELLÉE : ${nextStatus} (§10.2)`, { id: toastId });
      fetchNC();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || 'ERREUR DE COMMUNICATION KERNEL');
    } finally {
      setSaving(false);
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Ouverture du Dossier NC §10.2..." />;
  }

  if (!nc) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status">
        <AlertOctagon className="text-red-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Écart introuvable</p>
        <button 
          type="button"
          onClick={() => router.push('/dashboard/non-conformites')}
          className="mt-4 text-[9px] text-red-400 hover:text-red-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded px-3 py-1"
        >
          Retour au registre
        </button>
      </div>
    );
  }

  const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.id === nc.NC_Statut);
  const isClosed = nc.NC_Statut === 'CLOTURE';
  const canEditDiagnostic = currentStepIndex <= 1 && !isClosed;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-red-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 lg:gap-8 mt-12 lg:mt-0">
        <button 
          type="button"
          onClick={() => router.push('/dashboard/non-conformites')} 
          className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer italic tracking-widest focus:outline-none focus:ring-2 focus:ring-red-400 rounded px-2 py-1"
          aria-label="Retour au registre des non-conformités"
        >
          <ArrowLeft size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
          <span className="hidden sm:inline">Retour au registre</span>
        </button>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3 md:gap-4 px-4 md:px-6 lg:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-[9px] md:text-[10px] tracking-widest shadow-inner">
            <Activity size={14} className={cn("w-3.5 h-3.5 md:w-4 md:h-4", isClosed ? "text-emerald-400" : "text-amber-400 animate-pulse")} aria-hidden="true" /> 
            {nc.NC_Statut}
          </div>
        </div>
      </header>

      {/* 🔄 STEPPER MATRIX */}
      <div className="shrink-0 px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-10 pb-0 flex flex-col items-center">
        <div className="w-full max-w-5xl relative flex justify-between px-4 md:px-6 lg:px-10" role="progressbar" aria-valuenow={currentStepIndex + 1} aria-valuemin={1} aria-valuemax={WORKFLOW_STEPS.length} aria-label="Progression du workflow de résolution">
          <div className="absolute top-1/2 left-4 md:left-6 lg:left-20 right-4 md:right-6 lg:right-20 h-0.5 md:h-1 bg-white/5 -translate-y-1/2 z-0 rounded-full" aria-hidden="true" />
          <div 
            className="absolute top-1/2 left-4 md:left-6 lg:left-20 h-0.5 md:h-1 bg-red-600 -translate-y-1/2 z-0 transition-all duration-1000 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
            style={{ width: `${(currentStepIndex / (WORKFLOW_STEPS.length - 1)) * 100 * 0.8}%` }}
            aria-hidden="true"
          />
          {WORKFLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 md:gap-3 lg:gap-4 relative z-10">
                <div 
                  className={cn(
                    "w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-2xl md:rounded-3xl flex items-center justify-center border-2 transition-all duration-500 shadow-2xl focus:outline-none focus:ring-2 focus:ring-red-400",
                    isActive ? 'bg-red-600 border-red-400 text-white' : 'bg-[#0B0F1A] border-white/10 text-slate-700'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <Icon size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" />
                </div>
                <span className={cn("text-[7px] md:text-[8px] tracking-widest", isCurrent ? 'text-white' : 'text-slate-700')}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📋 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-12 text-left">
          
          {/* Left Column */}
          <aside className="col-span-12 lg:col-span-4 space-y-4 md:space-y-6 lg:space-y-10">
            <article className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-4 md:p-6 lg:p-12 shadow-2xl relative overflow-hidden">
               <div className="absolute -right-4 md:-right-6 lg:-right-10 -bottom-4 md:-bottom-6 lg:-bottom-10 opacity-5 pointer-events-none rotate-12">
                 <ShieldAlert size={120} className="w-30 h-30 md:w-40 md:h-40 lg:w-50 lg:h-50" aria-hidden="true" />
               </div>
               <span className="text-[9px] md:text-[10px] text-red-400 tracking-widest mb-3 md:mb-4 block">IDENTITÉ ÉCART</span>
               <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black m-0 leading-none tracking-tighter uppercase italic">{nc.NC_Libelle}</h1>
               <div className="mt-6 md:mt-8 lg:mt-10 pt-6 md:pt-8 lg:pt-10 border-t border-white/5 space-y-4 md:space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] md:text-[9px] text-slate-500">GRAVITÉ</span>
                    <span className="text-sm md:text-base font-black text-red-400 italic">{nc.NC_Gravite}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] md:text-[9px] text-slate-500">SOURCE</span>
                    <span className="text-sm md:text-base font-black text-blue-400 italic">{nc.NC_Source}</span>
                  </div>
               </div>
            </article>

            <article className="bg-black/40 border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-4 md:p-6 lg:p-10 shadow-inner">
               <h4 className="text-[9px] md:text-[10px] text-slate-600 tracking-widest mb-4 md:mb-6 m-0 uppercase flex items-center gap-2 md:gap-3">
                 <FileText size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
                 Description Constat
               </h4>
               <p className="text-sm md:text-base text-slate-300 font-bold leading-relaxed m-0 italic uppercase">{nc.NC_Description}</p>
            </article>
          </aside>

          {/* Right Column: Analysis */}
          <section className="col-span-12 lg:col-span-8 space-y-4 md:space-y-6 lg:space-y-10">
            <article className={cn(
              "bg-[#0F172A] border-2 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-4 md:p-6 lg:p-12 shadow-2xl transition-all",
              currentStepIndex >= 1 ? 'border-red-600/20' : 'opacity-20 grayscale pointer-events-none'
            )}>
              <h2 className="text-lg md:text-xl lg:text-2xl font-black mb-6 md:mb-8 lg:mb-10 m-0 flex items-center gap-3 md:gap-4 lg:gap-6">
                <Search className="text-red-400 w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" /> 
                Analyse des Causes Racines (§10.2)
              </h2>
              <label htmlFor="diagnostic" className="sr-only">Diagnostic des causes racines</label>
              <textarea 
                id="diagnostic"
                value={diagnostic} 
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDiagnostic(e.target.value)} 
                disabled={!canEditDiagnostic}
                className={cn(
                  "w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-[3rem] p-4 md:p-6 lg:p-10 text-base md:text-lg font-bold italic text-slate-300 outline-none focus:border-red-500 transition-all uppercase resize-none h-48 md:h-56 lg:h-64 shadow-inner leading-relaxed",
                  !canEditDiagnostic && "opacity-50 cursor-not-allowed"
                )}
                placeholder="DÉTAILLER L'ANALYSE DES CAUSES (5 POURQUOI / ISHIKAWA)..."
                aria-describedby="diagnostic-help"
              />
              <p id="diagnostic-help" className="sr-only">Utilisez la méthode des 5 pourquoi ou le diagramme d'Ishikawa pour identifier les causes racines</p>
              
              {canEditDiagnostic && (
                <button 
                  type="button"
                  onClick={() => handleUpdatePhase('ACTION_EN_COURS', { NC_Diagnostic: diagnostic })} 
                  disabled={saving || !diagnostic.trim()} 
                  className={cn(
                    "mt-6 md:mt-8 lg:mt-10 w-full py-4 md:py-5 lg:py-6 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] bg-red-600 hover:bg-white hover:text-red-700 text-white font-black text-[10px] md:text-[11px] lg:text-[12px] tracking-widest shadow-2xl border-none cursor-pointer transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400",
                    (saving || !diagnostic.trim()) && "opacity-70 cursor-wait"
                  )}
                  aria-busy={saving}
                >
                  {saving ? (
                    <><RefreshCcw size={16} className="w-4 h-4 animate-spin inline mr-2" aria-hidden="true" /> SCELLAGE...</>
                  ) : (
                    <><Save size={16} className="w-4 h-4 inline mr-2" aria-hidden="true" /> Valider & Sceller l&apos;Analyse</>
                  )}
                </button>
              )}
            </article>
          </section>
          
        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(220,38,38,0.3);border-radius:10px}:focus-visible{outline:2px solid #ef4444;outline-offset:2px}`}</style>
    </div>
  );
}