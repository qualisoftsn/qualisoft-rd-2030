/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛠️ MODULE : SESSION INTERACTIVE DE REVUE (ISO 9001 §9.1.1)
 * RÔLE : Interface de saisie des analyses et workflow de signature
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { use, useCallback, useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { 
  ArrowLeft, CheckCircle2, ClipboardList, Cpu, 
  Info, Loader2, PenTool, Printer, Save, ShieldAlert, 
  Target, RefreshCw 
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface ProcessReview {
  PRV_Id: string;
  PRV_ProcessusId: string;
  PRV_Month: number;
  PRV_Year: number;
  PRV_Status: 'BROUILLON' | 'EN_COURS' | 'VALIDEE' | 'CLOTUREE';
  PRV_PerformanceAnalysis?: string;
  PRV_AuditAnalysis?: string;
  PRV_RiskAnalysis?: string;
  PRV_ResourcesAnalysis?: string;
  PRV_Decisions?: string;
  PRV_PiloteSigned: boolean;
  PRV_RQSigned: boolean;
  PRV_DocRef?: string;
  PRV_DateReview?: string;
  PRV_CreatedAt: string;
  PRV_UpdatedAt: string;
}

export interface AnalysisFieldProps {
  label: string;
  val: string;
  setVal: (value: string) => void;
  icon: React.ElementType;
  color: 'blue' | 'red' | 'amber' | 'purple' | 'emerald';
  disabled: boolean;
  large?: boolean;
}

export interface SignStatusProps {
  label: string;
  active: boolean;
}

export interface FormData {
  performance: string;
  audit: string;
  risk: string;
  resources: string;
  decisions: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-indigo-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SIGN STATUS
// ============================================================================

function SignStatus({ label, active }: SignStatusProps) {
  return (
    <div 
      className={cn(
        "px-4 md:px-6 lg:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl border-2 flex items-center gap-3 md:gap-4 transition-all duration-700 shadow-2xl",
        active ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-slate-600"
      )}
      role="status"
      aria-label={`${label}: ${active ? 'Signé' : 'En attente'}`}
    >
       <div className={cn(
         "w-2 h-2 md:w-3 md:h-3 rounded-full",
         active ? "bg-emerald-400 shadow-[0_0_10px_#10b981]" : "bg-slate-700"
       )} aria-hidden="true" />
       <span className="text-[9px] md:text-[10px] font-black tracking-widest italic">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ANALYSIS FIELD
// ============================================================================

function AnalysisField({ label, val, setVal, icon: Icon, color, disabled, large }: AnalysisFieldProps) {
  const colors: Record<AnalysisFieldProps['color'], string> = { 
    blue: "text-blue-400 border-blue-500/10", 
    red: "text-red-400 border-red-500/10", 
    amber: "text-amber-400 border-amber-500/10", 
    purple: "text-purple-400 border-purple-500/10", 
    emerald: "text-emerald-400 border-emerald-500/10" 
  };
  
  return (
    <article className={cn(
      "bg-[#0F172A] p-6 md:p-8 lg:p-10 xl:p-14 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] border-2 shadow-2xl flex flex-col gap-4 md:gap-6 lg:gap-8 h-full transition-all focus-within:ring-2 focus-within:ring-indigo-400",
      colors[color]
    )}>
       <h3 className="text-[10px] md:text-[11px] font-black tracking-widest m-0 italic flex items-center gap-2 md:gap-3 lg:gap-4">
         <Icon size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" /> 
         {label}
       </h3>
       <label htmlFor={`analysis-${label}`} className="sr-only">{label}</label>
       <textarea 
         id={`analysis-${label}`}
         disabled={disabled} 
         value={val} 
         onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setVal(e.target.value)} 
         className={cn(
           "w-full flex-1 bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-6 lg:p-8 text-[10px] md:text-sm font-bold text-slate-300 outline-none focus:border-white/20 italic shadow-inner resize-none uppercase",
           large ? "text-base md:text-lg lg:text-xl font-black text-white lg:min-h-[300px] md:min-h-[200px] min-h-[150px]" : "min-h-[150px] md:min-h-[200px]"
         )} 
         placeholder="Saisissez votre analyse..."
         aria-disabled={disabled}
       />
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function RevueSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [review, setReview] = useState<ProcessReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormData>({
    performance: "", 
    audit: "", 
    risk: "", 
    resources: "", 
    decisions: ""
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ProcessReview>(`/process-reviews/${id}`);
      const d = res.data?.data || res.data || null;
      setReview(d);
      setForm({
        performance: d?.PRV_PerformanceAnalysis || "",
        audit: d?.PRV_AuditAnalysis || "",
        risk: d?.PRV_RiskAnalysis || "",
        resources: d?.PRV_ResourcesAnalysis || "",
        decisions: d?.PRV_Decisions || ""
      });
    } catch (error) {
      console.error('❌ Erreur chargement session:', error);
      toast.error("ÉCHEC DE CONNEXION SDE SESSION");
    } finally { 
      setLoading(false); 
    }
  }, [id]);

  useEffect(() => { if (typeof window !== 'undefined') loadData(); }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Sauvegarde en cours...");
    try {
      await apiClient.put(`/process-reviews/${id}`, {
        PRV_PerformanceAnalysis: form.performance,
        PRV_AuditAnalysis: form.audit,
        PRV_RiskAnalysis: form.risk,
        PRV_ResourcesAnalysis: form.resources,
        PRV_Decisions: form.decisions
      });
      toast.success("BROUILLON SCELLÉ DANS LE SMI", { id: toastId });
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ERREUR DE PERSISTANCE MATRIX", { id: toastId });
    } finally { 
      setSaving(false); 
    }
  };

  const handleSign = async () => {
    if (!confirm("Voulez-vous sceller cette revue ? Cette action est irréversible.")) return;
    const toastId = toast.loading("Signature en cours...");
    try {
      await apiClient.post(`/process-reviews/${id}/sign`);
      toast.success("SESSION SCELLÉE & ACTIONS INJECTÉES", { id: toastId });
      loadData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ÉCHEC D'AUTHENTIFICATION DE SIGNATURE", { id: toastId });
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Sécurisation de la séance interactive..." />;
  }

  const isLocked = review?.PRV_Status === 'VALIDEE' || review?.PRV_Status === 'CLOTUREE';

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30 relative">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 lg:gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer italic uppercase focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-2 py-1"
            aria-label="Retour au registre des revues"
          >
            <ArrowLeft size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
            <span className="hidden sm:inline">Retour Registre Central</span>
          </button>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic">
            Revue <span className="text-indigo-400">Processus</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-3 md:gap-4 w-full xl:w-auto justify-center xl:justify-end">
           <SignStatus label="Visa Pilote" active={review?.PRV_PiloteSigned || false} />
           <SignStatus label="Visa Direction" active={review?.PRV_RQSigned || false} />
        </div>
      </header>

      {/* 📝 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-32 md:pb-40">
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 xl:gap-10">
          <AnalysisField 
            label="1. Analyse Performance (KPI)" 
            val={form.performance} 
            setVal={(v: string) => setForm({...form, performance: v})} 
            icon={Info} 
            color="blue" 
            disabled={isLocked} 
          />
          <AnalysisField 
            label="2. Revues Audits & NC" 
            val={form.audit} 
            setVal={(v: string) => setForm({...form, audit: v})} 
            icon={ClipboardList} 
            color="red" 
            disabled={isLocked} 
          />
          <AnalysisField 
            label="3. Risques & Opportunités" 
            val={form.risk} 
            setVal={(v: string) => setForm({...form, risk: v})} 
            icon={ShieldAlert} 
            color="amber" 
            disabled={isLocked} 
          />
          <AnalysisField 
            label="4. Besoins en Ressources" 
            val={form.resources} 
            setVal={(v: string) => setForm({...form, resources: v})} 
            icon={Cpu} 
            color="purple" 
            disabled={isLocked} 
          />
          <div className="lg:col-span-2">
             <AnalysisField 
               label="5. Décisions Stratégiques & Mutations (PAQ)" 
               val={form.decisions} 
               setVal={(v: string) => setForm({...form, decisions: v})} 
               icon={Target} 
               color="emerald" 
               large 
               disabled={isLocked} 
             />
          </div>
        </div>
      </main>

      {/* 🚀 FLOATING ACTION BAR */}
      <div className="fixed bottom-4 md:bottom-6 lg:bottom-10 left-4 right-4 lg:left-1/2 lg:-translate-x-1/2 lg:right-auto z-50 bg-[#0F172A]/95 backdrop-blur-3xl p-4 md:p-6 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] border-2 border-white/10 shadow-2xl flex flex-wrap gap-3 md:gap-4 lg:gap-6 items-center" role="toolbar" aria-label="Actions de session">
        <button 
          type="button"
          onClick={() => router.push(`/dashboard/process-review/report/${id}`)} 
          className="p-2.5 md:p-3 lg:p-6 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl border border-white/5 transition-all cursor-pointer text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Imprimer le rapport"
          title="Imprimer"
        >
          <Printer size={18} className="w-4.5 h-4.5 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" />
        </button>
        <button 
          type="button"
          onClick={handleSave} 
          disabled={saving || isLocked} 
          className={cn(
            "flex-1 lg:flex-none px-6 md:px-8 lg:px-12 py-3 md:py-4 lg:py-6 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] text-[9px] md:text-[10px] lg:text-[11px] font-black italic border-none cursor-pointer uppercase transition-all tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center justify-center gap-2 md:gap-3",
            (saving || isLocked) && "opacity-20 cursor-not-allowed"
          )}
          aria-busy={saving}
          aria-disabled={isLocked}
        >
          {saving ? (
            <><Loader2 size={16} className="w-4 h-4 md:w-5 md:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">Sauvegarder</span></>
          ) : (
            <><Save size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> <span className="hidden sm:inline">Sauvegarder</span></>
          )}
        </button>
        <button 
          type="button"
          onClick={handleSign} 
          disabled={isLocked} 
          className={cn(
            "flex-1 lg:flex-none px-6 md:px-8 lg:px-16 py-3 md:py-4 lg:py-6 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] text-[9px] md:text-[10px] lg:text-[11px] font-black italic border-none cursor-pointer uppercase transition-all tracking-widest text-white shadow-2xl flex items-center justify-center gap-2 md:gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-400",
            isLocked ? "bg-emerald-600 cursor-default" : "bg-indigo-600 hover:scale-105 hover:bg-indigo-500"
          )}
          aria-disabled={isLocked}
        >
          {isLocked ? (
            <><CheckCircle2 size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" /> <span>Session Scellée</span></>
          ) : (
            <><PenTool size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" /> <span>Signer & Clôturer</span></>
          )}
        </button>
      </div>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:10px}:focus-visible{outline:2px solid #6366f1;outline-offset:2px}`}</style>
    </div>
  );
}