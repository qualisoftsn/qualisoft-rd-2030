/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : COPIL STRATÉGIQUE §9.3 (ISO 9001)
 * RÔLE : Revue de Direction Digitale et Calcul IPE (Indice de Performance)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useCallback, useEffect, useMemo, useState, ChangeEvent } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { 
  Activity, AlertTriangle, BarChart3, CheckCircle2, 
  Download, Globe, MessageSquare, Save, ShieldCheck, 
  TrendingUp, Loader2 
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface ChecklistItem {
  label: string;
  status: boolean;
}

export interface CopilStats {
  processScore: number;
  riskCoverage: number;
  openNC: number;
  paqProgress: number;
}

export interface CopilData {
  stats: CopilStats;
  decisions: string;
  isoChecklist: ChecklistItem[];
}

export interface PeriodParams {
  month: number;
  year: number;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <Loader2 className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : METRIC CARD
// ============================================================================

interface MetricCardProps {
  title: string;
  val: string | number;
  icon: React.ElementType;
  color: 'emerald' | 'blue' | 'rose' | 'amber';
  formula: string;
}

function MetricCard({ title, val, icon: Icon, color, formula }: MetricCardProps) {
  const themes: Record<MetricCardProps['color'], string> = { 
    emerald: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10", 
    blue: "text-blue-400 bg-blue-500/5 border-blue-500/10", 
    rose: "text-rose-400 bg-rose-500/5 border-rose-500/10", 
    amber: "text-amber-400 bg-amber-500/5 border-amber-500/10" 
  };
  
  return (
    <article className="bg-[#0F172A] border-2 border-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl flex flex-col justify-between group hover:border-blue-600/30 transition-all shadow-2xl relative overflow-hidden focus-within:ring-2 focus-within:ring-blue-400">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all duration-500 group-hover:scale-110", themes[color])}>
          <Icon size={20} className="w-5 h-5 md:w-7 md:h-7" aria-hidden="true" />
        </div>
      </div>
      <div className="space-y-2 relative z-10">
        <p className="text-[9px] md:text-[10px] text-slate-500 mb-1 italic m-0 tracking-widest">{title}</p>
        <p className="text-4xl md:text-5xl font-black italic text-white tracking-tighter leading-none m-0">{val}</p>
      </div>
      <div className="mt-4 md:mt-6 pt-4 md:pt-5 border-t border-white/5 relative z-10 text-[10px] md:text-[11px] text-slate-600 italic font-bold">
        {formula}
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function CopilPage() {
  const [data, setData] = useState<CopilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [decisions, setDecisions] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const period = useMemo((): PeriodParams => ({ 
    month: new Date().getMonth() + 1, 
    year: new Date().getFullYear() 
  }), []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<CopilData>("/copil/analysis", { params: period });
      const apiData = res.data?.data || res.data;
      setData(apiData);
      setDecisions(apiData?.decisions || "");
      setChecklist(apiData?.isoChecklist || []);
    } catch (error) {
      console.error('❌ Erreur chargement COPIL:', error);
      toast.error("RUPTURE NOYAU MASTER COPIL");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Validation de la session...");
    try {
      await apiClient.post("/copil/validate", { period, decisions });
      toast.success("Session validée et archivée", { id: toastId });
      fetchData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || "Erreur de validation", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Scrututation Noyau §9.3..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex items-center gap-3">
            <Globe size={20} className="w-5 h-5 md:w-6 md:h-6 text-blue-400 animate-pulse" aria-hidden="true" />
            <h1 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter m-0 leading-none">COPIL <span className="text-blue-400">Stratégique</span></h1>
          </div>
          <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0 flex items-center gap-2">
            <ShieldCheck size={12} className="w-3 h-3 text-emerald-400" aria-hidden="true" /> REVUE DE DIRECTION • ISO 9001 §9.3
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button className="bg-white/5 border border-white/10 px-4 md:px-6 py-2.5 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] flex items-center gap-2 md:gap-3 hover:bg-white/10 transition-all border-none text-white italic cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400">
            <Download size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> Export Direction
          </button>
          <button 
            type="button"
            onClick={handleSave} 
            disabled={isSaving}
            className={cn(
              "bg-blue-600 px-4 md:px-6 lg:px-8 lg:px-10 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] lg:text-[10px] flex items-center gap-2 md:gap-3 shadow-2xl border-none transition-all hover:bg-white hover:text-blue-700 italic cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
              isSaving && "opacity-70 cursor-wait"
            )}
            aria-busy={isSaving}
          >
            {isSaving ? (
              <><Loader2 size={14} className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Validation...</>
            ) : (
              <><Save size={14} className="w-3.5 h-3.5" aria-hidden="true" /> Valider Session</>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6 space-y-6 md:space-y-8 lg:space-y-10">
        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8" aria-label="Indicateurs de performance COPIL">
          <MetricCard title="Efficacité SMI" val={`${data?.stats?.processScore ?? 88}%`} icon={Activity} color="emerald" formula="$$\frac{\sum(Perf. Réelle)}{\sum(Cibles)} \times 100$$" />
          <MetricCard title="Couverture" val={`${data?.stats?.riskCoverage ?? 94}%`} icon={ShieldCheck} color="blue" formula="$$\frac{Actions}{Risques Actifs}$$" />
          <MetricCard title="Écarts NC" val={data?.stats?.openNC ?? 3} icon={AlertTriangle} color="rose" formula="$$\sum Non-Conformités$$" />
          <MetricCard title="Vélocité PAQ" val={`${data?.stats?.paqProgress ?? 72}%`} icon={TrendingUp} color="amber" formula="$$\mu(Actions Closes)$$" />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
          {/* Decisions Editor */}
          <section className="col-span-12 xl:col-span-8 bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 flex flex-col gap-6 md:gap-8 lg:gap-10">
             <div className="flex items-center gap-3 md:gap-4 text-blue-400 border-b border-white/5 pb-4 md:pb-6">
                <MessageSquare size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
                <h3 className="text-lg md:text-xl m-0 tracking-widest">Arbitrages Direction</h3>
             </div>
             <textarea 
               value={decisions} 
               onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDecisions(e.target.value)} 
               className="flex-1 bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-10 text-white italic font-black text-[10px] md:text-sm outline-none focus:border-blue-600 shadow-inner resize-none min-h-48 md:min-h-60 lg:min-h-75 leading-relaxed" 
               placeholder="CONSIGNER LES ARBITRAGES ICI..."
               aria-label="Zone de saisie des arbitrages de direction"
             />
          </section>

          {/* Sidebar: Performance + Checklist */}
          <aside className="col-span-12 xl:col-span-4 flex flex-col gap-4 md:gap-6 lg:gap-8">
            {/* Performance Card */}
            <article className="bg-blue-600 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl shadow-2xl relative overflow-hidden group">
               <ShieldCheck size={200} className="absolute -right-8 md:-right-10 -bottom-8 md:-bottom-10 text-white/10 rotate-12 w-50 h-50 md:w-60 md:h-60" aria-hidden="true" />
               <h3 className="text-xl md:text-2xl text-white mb-6 md:mb-8 m-0 tracking-tighter">Performance SMI</h3>
               <span className="text-5xl md:text-6xl font-black italic text-white leading-none">85%</span>
               <div className="mt-6 md:mt-8 h-2 md:h-3 w-full bg-white/20 rounded-full overflow-hidden p-0.5 md:p-1 border border-white/10" role="progressbar" aria-valuenow={85} aria-valuemin={0} aria-valuemax={100}>
                 <div className="h-full bg-white shadow-[0_0_20px_white] rounded-full" style={{ width: "85%" }} aria-hidden="true" />
               </div>
            </article>

            {/* Checklist */}
            <article className="bg-[#0F172A] border border-white/5 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl flex-1 overflow-hidden flex flex-col">
               <h4 className="text-[9px] md:text-[10px] lg:text-[11px] text-slate-500 tracking-widest mb-4 md:mb-6 border-b border-white/5 pb-3 md:pb-4 m-0 flex items-center gap-2 md:gap-3">
                 <BarChart3 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> Données d&apos;entrée §9.3
               </h4>
               <div className="overflow-y-auto custom-scrollbar space-y-3 md:space-y-4">
                 {checklist.map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-4 md:p-5 lg:p-6 bg-white/2 rounded-xl md:rounded-2xl lg:rounded-3xl border border-white/5">
                     <span className="text-[9px] md:text-[10px] font-black italic tracking-tighter m-0">{item.label}</span>
                     {item.status ? (
                       <CheckCircle2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400" aria-label="Conforme" aria-hidden="true" />
                     ) : (
                       <AlertTriangle size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-400 animate-pulse" aria-label="Non conforme" aria-hidden="true" />
                     )}
                   </div>
                 ))}
               </div>
            </article>
          </aside>
        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}