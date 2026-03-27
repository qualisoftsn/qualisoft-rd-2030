/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🎛️ MODULE : COCKPIT PROCESSUS (ISO 9001 §4.4)
 * RÔLE : Console de pilotage centralisée pour un processus spécifique
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState, useCallback, use, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  GitBranch, FileText, CheckSquare, BarChart3, RefreshCw, 
  Target, ShieldAlert, Settings2, Activity, 
  ArrowLeft, ShieldCheck, Zap, AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Actif?: boolean;
}

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_Description?: string;
  PR_Objectifs?: string;
  PR_Ressources?: string;
  PR_Surveillance?: string;
  PR_TypeId?: string;
  PR_PiloteId?: string;
  PR_Pilote?: User;
  PR_IsActive: boolean;
  PR_CreatedAt: string;
  PR_UpdatedAt: string;
}

export type CockpitTab = 'ID' | 'GED' | 'ACTIONS' | 'KPI' | 'RISQUES' | 'SSE';

export interface NavBtnProps {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

export interface CockpitCardProps {
  title: string;
  icon: React.ElementType;
  text?: string;
}

export interface HealthBarProps {
  label: string;
  val: number;
  color?: 'blue' | 'amber' | 'emerald';
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : NAV BUTTON
// ============================================================================

function NavBtn({ active, icon: Icon, label, onClick }: NavBtnProps) {
  return (
    <button 
      type="button"
      onClick={onClick} 
      className={cn(
        "flex items-center gap-3 md:gap-4 lg:gap-6 px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-[1.8rem] transition-all border-none cursor-pointer text-left shrink-0 lg:w-full font-black uppercase text-[9px] md:text-[10px] tracking-widest italic focus:outline-none focus:ring-2 focus:ring-blue-400",
        active ? "bg-blue-600 text-white shadow-2xl lg:translate-x-2" : "text-slate-500 hover:text-white hover:bg-white/5"
      )}
      aria-pressed={active}
      aria-label={label}
    >
      <Icon size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

// ============================================================================
// SOUS-COMPOSANT : COCKPIT CARD
// ============================================================================

function CockpitCard({ title, icon: Icon, text }: CockpitCardProps) {
  return (
    <article className="bg-slate-900/40 border-2 border-white/5 p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] group hover:border-blue-600/30 transition-all backdrop-blur-md shadow-2xl text-left focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400">
      <div className="flex items-center gap-3 md:gap-4 lg:gap-5 mb-4 md:mb-6 lg:mb-8">
        <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <Icon size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />
        </div>
        <h4 className="text-[10px] md:text-[11px] lg:text-[12px] font-black uppercase tracking-widest text-slate-500 m-0">{title}</h4>
      </div>
      <p className="text-[10px] md:text-sm font-bold text-slate-400 leading-relaxed italic m-0">
        {text || "Donnée SMI non formalisée."}
      </p>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : HEALTH BAR
// ============================================================================

function HealthBar({ label, val, color = 'blue' }: HealthBarProps) {
  const colors: Record<HealthBarProps['color'], string> = { 
    blue: "bg-blue-600", 
    amber: "bg-amber-500", 
    emerald: "bg-emerald-500" 
  };
  
  return (
    <div className="space-y-2 md:space-y-3 lg:space-y-4" role="progressbar" aria-valuenow={val} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${val}%`}>
      <div className="flex justify-between text-[9px] md:text-[10px] font-black tracking-widest text-slate-500">
        <span>{label}</span>
        <span className="text-white">{val}%</span>
      </div>
      <div className="h-2 md:h-2.5 bg-black border border-white/5 rounded-full overflow-hidden p-0.5 shadow-inner">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", colors[color])} 
          style={{ width: `${val}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : EMPTY MODULE
// ============================================================================

function EmptyModule({ module }: { module: string }) {
  return (
    <div className="h-[300px] md:h-[400px] lg:h-[500px] flex flex-col items-center justify-center opacity-40 italic" role="status">
      <RefreshCw size={48} className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 animate-spin text-blue-400 mb-4 md:mb-6 lg:mb-8" aria-hidden="true" />
      <p className="text-xl md:text-2xl lg:text-3xl font-black tracking-widest text-blue-400 m-0 uppercase text-center px-4">
        Flux {module}
        <br />
        <span className="text-slate-500 text-base md:text-lg lg:text-xl font-black">Architecture en cours...</span>
      </p>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ProcessCockpit({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [process, setProcess] = useState<Processus | null>(null);
  const [activeTab, setActiveTab] = useState<CockpitTab>('ID');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Processus>(`/processus/${id}`);
      setProcess(res.data?.data || res.data || null);
    } catch (error) {
      console.error('❌ Erreur chargement cockpit:', error);
      toast.error("PERTE DE LIAISON MATRIX");
    } finally { 
      setLoading(false); 
    }
  }, [id]);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="SDE COCKPIT SYNC..." />;
  }

  if (!process) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status">
        <AlertCircle className="text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Processus introuvable</p>
        <button 
          type="button"
          onClick={() => router.back()}
          className="mt-4 text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const tabs: Array<{ id: CockpitTab; label: string; icon: React.ElementType }> = [
    { id: 'ID', label: 'Identité Matrix', icon: GitBranch },
    { id: 'GED', label: 'Maîtrise Doc', icon: FileText },
    { id: 'ACTIONS', label: 'Actions PAQ', icon: CheckSquare },
    { id: 'KPI', label: 'Performance', icon: BarChart3 },
    { id: 'RISQUES', label: 'Risques §6.1', icon: ShieldAlert },
    { id: 'SSE', label: 'Monitoring', icon: Activity },
  ];

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center bg-[#0F172A]/90 backdrop-blur-3xl z-40 gap-4 md:gap-6 lg:gap-8 mt-12 lg:mt-0 shadow-2xl">
        <div className="flex items-center gap-4 md:gap-6 lg:gap-8 text-left w-full lg:w-auto">
          <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-2xl md:rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl border border-white/10 shrink-0">
            <GitBranch size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4 mb-1 md:mb-2">
              <span className="bg-blue-600/10 border border-blue-500/20 px-2.5 md:px-3 lg:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] text-blue-400 tracking-widest">
                {process.PR_Code}
              </span>
              <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl tracking-tighter leading-none m-0 italic truncate">
                {process.PR_Libelle}
              </h1>
            </div>
            <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0 flex items-center gap-2 md:gap-3 italic">
              <ShieldCheck size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-400" aria-hidden="true" /> 
              Pilote : <span className="text-white truncate">{process.PR_Pilote?.U_FirstName} {process.PR_Pilote?.U_LastName || 'Non assigné'}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-center lg:justify-end">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="flex-1 lg:flex-none bg-slate-900 border-2 border-white/5 px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl lg:rounded-3xl font-black text-[9px] md:text-[10px] tracking-widest text-slate-400 flex items-center justify-center gap-2 md:gap-3 transition-all cursor-pointer hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Retour à la liste des processus"
          >
            <ArrowLeft size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
            <span className="hidden sm:inline">Retour</span>
          </button>
          <button 
            type="button"
            className="flex-1 lg:flex-none bg-blue-600 px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl lg:rounded-3xl font-black text-[9px] md:text-[10px] tracking-widest text-white border-none flex items-center justify-center gap-2 md:gap-3 transition-all cursor-pointer shadow-2xl hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Créer une action"
          >
            <Zap size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
            <span className="hidden sm:inline">Action</span>
          </button>
        </div>
      </header>

      {/* 🧭 SIDE NAV & CONTENT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <nav 
          className="w-full lg:w-64 md:w-72 lg:w-80 bg-[#0B1222] border-r border-white/5 flex lg:flex-col p-3 md:p-4 lg:p-6 gap-2 md:gap-3 lg:gap-4 overflow-x-auto lg:overflow-y-auto custom-scrollbar shrink-0" 
          role="tablist" 
          aria-label="Navigation du cockpit"
        >
          {tabs.map((tab) => (
            <NavBtn 
              key={tab.id}
              active={activeTab === tab.id} 
              icon={tab.icon} 
              label={tab.label} 
              onClick={() => setActiveTab(tab.id)} 
            />
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-4 md:py-6 lg:py-10 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none" aria-hidden="true">
            <Target size={150} className="w-40 h-40 md:w-50 md:h-50 lg:w-60 lg:h-60" />
          </div>

          <div className="max-w-[100rem] mx-auto animate-in fade-in duration-700 pb-16 md:pb-20">
            {activeTab === 'ID' ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 lg:gap-10">
                <div className="xl:col-span-8 space-y-6 md:space-y-8 lg:space-y-10">
                  <section className="bg-slate-900/40 border-2 border-white/5 p-6 md:p-8 lg:p-12 xl:p-16 rounded-2xl md:rounded-3xl lg:rounded-[4rem] relative overflow-hidden group shadow-2xl backdrop-blur-md text-left">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-black italic text-blue-400 mb-4 md:mb-6 lg:mb-8 flex items-center gap-3 md:gap-4 lg:gap-5 m-0 uppercase">
                      <Target size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" /> 
                      Finalités Stratégiques
                    </h2>
                    <p className="text-base md:text-lg leading-relaxed text-slate-300 font-bold italic opacity-90 m-0 whitespace-pre-wrap">
                      {process.PR_Objectifs || "Aucune finalité formalisée pour ce segment Matrix. L'approche processus nécessite une définition claire des résultats attendus."}
                    </p>
                  </section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-10">
                    <CockpitCard title="Ressources" icon={Settings2} text={process.PR_Ressources} />
                    <CockpitCard title="Surveillance" icon={Activity} text={process.PR_Surveillance} />
                  </div>
                </div>
                <div className="xl:col-span-4">
                  <article className="bg-[#0F172A] border-2 border-blue-600/20 p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl space-y-6 md:space-y-8 lg:space-y-12">
                    <h3 className="text-[10px] md:text-[11px] font-black text-blue-400 tracking-widest mb-8 md:mb-10 lg:mb-12 text-center italic m-0">
                      Indice de Santé SDE
                    </h3>
                    <HealthBar label="Doc. Conformité" val={85} />
                    <HealthBar label="Actions PAQ" val={62} color="amber" />
                    <HealthBar label="Risques Maîtrisés" val={91} color="emerald" />
                  </article>
                </div>
              </div>
            ) : (
              <EmptyModule module={activeTab} />
            )}
          </div>
        </main>
      </div>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}