/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : PRÉPARATION ET SCAN DE PERFORMANCE (ISO 9001 §9.1.1)
 * RÔLE : Agrège les flux (NC, Audits, KPI) avant session de revue
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, ChangeEvent } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { Database, Search, Loader2, Target, Zap, ShieldAlert, Cpu, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_Description?: string;
  PR_IsActive?: boolean;
}

export interface ScanStep {
  label: string;
  icon: React.ElementType;
}

export interface InitializePayload {
  processId: string;
  month: number;
  year: number;
  docRef: string;
}

export interface InitializeResponse {
  PRV_Id: string;
  PRV_ProcessusId: string;
  PRV_Month: number;
  PRV_Year: number;
  PRV_Status: string;
  PRV_DocRef?: string;
}

export interface LoadingScanProps {
  step: string;
  Icon: React.ElementType;
  progress: number;
  total: number;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SCAN_STEPS: ScanStep[] = [
  { label: "Extraction des KPI & Valeurs Cibles", icon: Target },
  { label: "Scan des Non-Conformités & Écarts", icon: ShieldAlert },
  { label: "Cartographie des Risques & Opportunités", icon: Zap },
  { label: "Génération du PV Numérique", icon: Database }
];

// ============================================================================
// SOUS-COMPOSANT : LOADING SCAN
// ============================================================================

function LoadingScan({ step, Icon, progress, total }: LoadingScanProps) {
  return (
    <div 
      className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] text-white italic font-black uppercase tracking-widest gap-8 md:gap-10 lg:gap-12 px-4" 
      role="status" 
      aria-live="polite"
      aria-label={`Progression du scan: ${progress + 1} sur ${total}`}
    >
      <div className="relative" aria-hidden="true">
        <Loader2 size={120} className="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 text-blue-600 animate-spin opacity-10" />
        <Icon size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 absolute inset-0 m-auto text-blue-400 animate-pulse" />
      </div>
      <div className="space-y-4 md:space-y-6 lg:space-y-8 max-w-xl w-full text-center">
        <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl tracking-tighter text-white m-0 leading-none px-4">{step}...</h2>
        <div className="flex gap-2 md:gap-3 lg:gap-4 justify-center" role="progressbar" aria-valuenow={progress + 1} aria-valuemin={1} aria-valuemax={total}>
          {Array.from({ length: total }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 md:h-2 rounded-full transition-all duration-500",
                i <= progress ? "w-12 md:w-16 bg-blue-600 shadow-[0_0_10px_#2563eb]" : "w-8 md:w-10 bg-white/10"
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function PreparationRevue() {
  const router = useRouter();
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [selectedProc, setSelectedProc] = useState('');
  const [docRef, setDocRef] = useState('F-QLT-011');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      apiClient.get<Processus[]>('/processus')
        .then(res => {
          const data = Array.isArray(res.data) ? res.data.filter(p => p.PR_IsActive !== false) : [];
          setProcesses(data);
          if (data.length > 0) setSelectedProc(data[0].PR_Id);
        })
        .catch((error: unknown) => {
          console.error('❌ Erreur chargement processus:', error);
          toast.error("ERREUR : CARTOGRAPHIE PROCESSUS INACCESSIBLE");
        });
    }
  }, []);

  const handleStartScan = async () => {
    setFormError('');
    
    if (!selectedProc) {
      setFormError("Veuillez sélectionner un processus");
      return;
    }

    setIsScanning(true);
    
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setScanStep(i);
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      const payload: InitializePayload = {
        processId: selectedProc,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        docRef: docRef
      };
      
      const res = await apiClient.post<InitializeResponse>('/process-reviews/initialize', payload);
      toast.success("Session de revue initialisée avec succès");
      router.push(`/dashboard/process-review/session/${res.data.PRV_Id}`);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ERREUR CRITIQUE : ÉCHEC D'AGRÉGATION SDE");
      setIsScanning(false);
    }
  };

  if (isScanning) {
    const CurrentIcon = SCAN_STEPS[scanStep].icon;
    return <LoadingScan step={SCAN_STEPS[scanStep].label} Icon={CurrentIcon} progress={scanStep} total={SCAN_STEPS.length} />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="text-[9px] md:text-[10px] text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer italic flex items-center gap-1.5 md:gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
            aria-label="Retour à la liste des revues"
          >
            <ArrowLeft size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
            <span className="hidden sm:inline">Retour</span>
          </button>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic">
            Scan <span className="text-blue-400">Performance</span>
          </h1>
        </div>
        <div className="hidden xl:flex items-center gap-2 md:gap-3 lg:gap-4 px-4 md:px-6 py-2 md:py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl md:rounded-2xl">
          <Cpu size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 text-blue-400" aria-hidden="true" />
          <span className="text-[8px] md:text-[9px] text-blue-400 tracking-widest">SDE ANALYTICS ENGINE</span>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 flex items-center justify-center">
        <article className="w-full max-w-[100rem] bg-[#0F172A] border-2 border-white/5 p-6 md:p-8 lg:p-12 xl:p-20 rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl relative overflow-hidden text-left animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 right-0 p-8 md:p-12 lg:p-16 opacity-[0.03] pointer-events-none" aria-hidden="true">
            <Search size={150} className="w-40 h-40 md:w-50 md:h-50 lg:w-60 lg:h-60" />
          </div>

          <div className="space-y-6 md:space-y-8 lg:space-y-12 relative z-10">
            <div className="space-y-3 md:space-y-4">
              <label htmlFor="process-select" className="text-[9px] md:text-[10px] text-blue-400 tracking-widest ml-4 md:ml-6 flex items-center gap-2 md:gap-3 italic font-black">
                <Target size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
                Sélection du Processus Pilote
              </label>
              <select 
                id="process-select"
                value={selectedProc} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  setSelectedProc(e.target.value);
                  setFormError('');
                }} 
                className={cn(
                  "w-full bg-slate-950 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-6 lg:p-8 font-black text-base md:text-xl lg:text-2xl xl:text-3xl italic text-white outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-inner uppercase pr-12 md:pr-16",
                  formError && !selectedProc ? "border-rose-500/50" : "border-white/10"
                )}
                aria-required="true"
                aria-invalid={!!formError && !selectedProc}
              >
                {processes.length > 0 ? processes.map(p => (
                  <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0B0F1A] text-white">
                    [{p.PR_Code}] {p.PR_Libelle}
                  </option>
                )) : (
                  <option value="" className="bg-[#0B0F1A] text-slate-500">Aucun processus disponible</option>
                )}
              </select>
              {formError && !selectedProc && (
                <p className="text-rose-400 text-[8px] md:text-[9px] ml-4 md:ml-6 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formError}
                </p>
              )}
            </div>

            <div className="space-y-3 md:space-y-4">
              <label htmlFor="doc-ref" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-4 md:ml-6 flex items-center gap-2 md:gap-3 italic font-black">
                <Database size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
                Référence Documentaire
              </label>
              <input 
                id="doc-ref"
                type="text" 
                value={docRef} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDocRef(e.target.value.toUpperCase())} 
                className="w-full bg-slate-950 border-2 border-white/10 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-6 lg:p-8 font-black text-base md:text-xl lg:text-2xl xl:text-3xl italic text-emerald-400 outline-none focus:border-emerald-500 text-center uppercase shadow-inner"
                placeholder="EX: F-QLT-011"
                aria-label="Référence documentaire de la revue"
              />
            </div>

            <button 
              type="button"
              onClick={handleStartScan} 
              disabled={isScanning || processes.length === 0}
              className={cn(
                "w-full bg-blue-600 py-4 md:py-6 lg:py-8 lg:py-10 rounded-xl md:rounded-2xl lg:rounded-[3rem] font-black uppercase text-[10px] md:text-[11px] lg:text-[12px] xl:text-[15px] tracking-widest shadow-2xl hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 md:gap-6 lg:gap-8 xl:gap-10 group border-none cursor-pointer text-white italic focus:outline-none focus:ring-2 focus:ring-blue-400",
                (isScanning || processes.length === 0) && "opacity-50 cursor-not-allowed hover:scale-100"
              )}
              aria-busy={isScanning}
              aria-disabled={processes.length === 0}
            >
              <span className="hidden sm:inline">Démarrer le moteur de Scan</span>
              <span className="sm:hidden">Scanner</span>
              <Search size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 group-hover:rotate-12 transition-transform" aria-hidden="true" />
            </button>

            {processes.length === 0 && (
              <p className="text-[8px] md:text-[9px] text-slate-500 text-center tracking-widest italic" role="status">
                Aucun processus disponible. Veuillez contacter l'administrateur.
              </p>
            )}
          </div>
        </article>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}