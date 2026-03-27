/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📊 MODULE : PILOTAGE KPI & PERFORMANCE (ISO 9001 §9.1.1)
 * RÔLE : Surveillance et mesure des indicateurs de performance
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 * LOGIC : Fenêtre de saisie stricte J+10 et workflow de scellage
 */

import { useCallback, useEffect, useMemo, useState, ChangeEvent } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import {
  BarChart3, Calendar, 
  Edit3, Loader2, Lock, RotateCcw,
  Save, TrendingUp, Unlock, X, RefreshCcw, AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Indicator {
  IND_Id: string;
  IND_Code: string;
  IND_Libelle: string;
  IND_Unite: string;
  IND_Cible: number;
  IND_Frequence: string;
  IND_IsActive: boolean;
  IND_CreatedAt: string;
  IND_UpdatedAt: string;
  IND_ProcessusId: string;
  IND_Processus?: Processus;
  IND_ObjectiveId?: string;
  currentValue?: IndicatorValue;
}

export interface IndicatorValue {
  IV_Id: string;
  IV_Month: number;
  IV_Year: number;
  IV_Actual: number;
  IV_Status: 'BROUILLON' | 'SOUMIS' | 'VALIDE' | 'RENVOYE';
  IV_Comment?: string;
  IV_IsActive: boolean;
  IV_CreatedAt: string;
  IV_UpdatedAt: string;
  IV_IndicatorId: string;
}

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_IsActive?: boolean;
  indicators?: Indicator[];
}

interface PeriodInfo {
  month: number;
  year: number;
  isEditable: boolean;
  daysLeft: number;
}

interface SaveValuePayload {
  indicatorId: string;
  month: number;
  year: number;
  value: number;
  comment?: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCcw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function PilotageKPIPage() {
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState<string>('all');

  // États modal & saisie
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [inputComment, setInputComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // 🔑 MOTEUR TEMPOREL ISO (Calcul J+10)
  const today = new Date();
  const targetPeriod = useMemo((): PeriodInfo => {
    const d = today.getDate();
    const m = today.getMonth() + 1;
    const y = today.getFullYear();
    const reportingMonth = d <= 10 ? (m === 1 ? 12 : m - 1) : m;
    const reportingYear = (d <= 10 && m === 1) ? y - 1 : y;
    return {
      month: reportingMonth,
      year: reportingYear,
      isEditable: d <= 10,
      daysLeft: d <= 10 ? 10 - d : 0
    };
  }, [today]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Processus[]>("/indicators/processes-with-values", {
        params: { month: targetPeriod.month, year: targetPeriod.year }
      });
      setProcesses(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement KPI:', error);
      toast.error("RUPTURE DE LIAISON NOYAU KPI");
    } finally {
      setLoading(false);
    }
  }, [targetPeriod]);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const handleOpenSaisie = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setInputValue(indicator.currentValue?.IV_Actual?.toString() || '');
    setInputComment(indicator.currentValue?.IV_Comment || '');
    setIsModalOpen(true);
  };

  const handleSaveKPI = async () => {
    if (!selectedIndicator) return;
    
    const value = parseFloat(inputValue.replace(',', '.'));
    if (isNaN(value)) {
      toast.error("Veuillez entrer une valeur numérique valide");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Scellage de la performance...");
    
    try {
      const payload: SaveValuePayload = {
        indicatorId: selectedIndicator.IND_Id,
        month: targetPeriod.month,
        year: targetPeriod.year,
        value,
        comment: inputComment,
      };
      await apiClient.post("/indicators/save-value", payload);
      toast.success("DONNÉE SCELÉE AU REGISTRE §9.1.1", { id: toastId });
      fetchData();
      setIsModalOpen(false);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "ÉCHEC DE PERSISTANCE", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Synchronisation Matrix KPI..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 lg:gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-3 md:space-y-4 w-full xl:w-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0">Pilotage <span className="text-blue-400">KPI</span></h1>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <div className="bg-white/5 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl border border-white/5 flex items-center gap-2 md:gap-3">
              <Calendar size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" aria-hidden="true" />
              <span className="text-[9px] md:text-[10px] tracking-widest text-slate-300">Période : {targetPeriod.month}/{targetPeriod.year}</span>
            </div>
            <div className={cn(
              "px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl border text-[8px] md:text-[9px] flex items-center gap-1.5 md:gap-2 tracking-widest transition-all",
              targetPeriod.isEditable ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            )}>
              {targetPeriod.isEditable ? (
                <Unlock size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 animate-pulse" aria-hidden="true" />
              ) : (
                <Lock size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />
              )} 
              {targetPeriod.isEditable ? `Fenêtre Ouverte (${targetPeriod.daysLeft}j Restants)` : 'Saisie Verrouillée J+10'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <label htmlFor="process-select" className="sr-only">Filtrer par processus</label>
          <select 
            id="process-select"
            value={selectedProcess} 
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedProcess(e.target.value)} 
            className="flex-1 xl:flex-none bg-[#0F172A] border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-5 text-[9px] md:text-[10px] font-black uppercase italic text-white outline-none min-w-48 md:min-w-64 lg:min-w-80 cursor-pointer appearance-none shadow-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all" className="bg-[#0B0F1A]">Consolidation SMI Globale</option>
            {processes.map(p => <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0B0F1A]">{p.PR_Code} - {p.PR_Libelle}</option>)}
          </select>
          <button 
            type="button"
            onClick={fetchData} 
            className="p-2.5 md:p-3 lg:p-5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Actualiser les indicateurs"
            title="Synchroniser"
          >
            <RotateCcw size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* 📜 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6 space-y-8 md:space-y-12 lg:space-y-16">
        {processes.filter(p => selectedProcess === 'all' || p.PR_Id === selectedProcess).map(process => (
          <section key={process.PR_Id} className="bg-[#0F172A]/40 border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-6 md:p-8 lg:p-10 shadow-2xl animate-in fade-in duration-700" aria-label={`Indicateurs pour ${process.PR_Libelle}`}>
            <div className="flex justify-between items-center mb-6 md:mb-8 lg:mb-10 border-b border-white/5 pb-4 md:pb-6 lg:pb-8">
              <div className="flex items-center gap-4 md:gap-5 lg:gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-blue-600 rounded-xl md:rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                  <BarChart3 size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-black tracking-tighter m-0 leading-none">{process.PR_Libelle}</h2>
                  <p className="text-[8px] md:text-[9px] lg:text-[10px] text-slate-500 tracking-widest mt-2 md:mt-3 m-0 italic">ISO 9001 §4.4 • Processus {process.PR_Code}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8" role="list" aria-label={`Liste des indicateurs pour ${process.PR_Libelle}`}>
              {process.indicators?.map((indicator) => {
                const isOnTarget = indicator.currentValue?.IV_Actual !== undefined && indicator.currentValue.IV_Actual >= indicator.IND_Cible;
                const hasValue = indicator.currentValue?.IV_Actual !== undefined;
                
                return (
                  <article 
                    key={indicator.IND_Id} 
                    className="bg-black/40 border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-6 md:p-8 lg:p-10 hover:border-blue-500/30 transition-all flex flex-col shadow-2xl relative group focus-within:border-blue-500/30"
                    role="listitem"
                  >
                    <div className="absolute top-4 md:top-6 lg:top-8 right-4 md:right-6 lg:right-8 bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[7px] md:text-[8px] tracking-widest text-slate-500 border border-white/5 italic">
                      {indicator.IND_Frequence}
                    </div>
                    
                    <h3 className="text-base md:text-lg lg:text-xl font-black mb-6 md:mb-8 pr-12 line-clamp-2 leading-none tracking-tighter text-white uppercase italic">
                      {indicator.IND_Libelle}
                    </h3>
                    
                    <div className="bg-[#0B0F1A] rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-6 md:p-8 lg:p-8 mb-6 md:mb-8 border border-white/5 text-center shadow-inner group-hover:border-blue-500/20 transition-all">
                      <p className="text-[8px] md:text-[9px] text-slate-600 mb-2 md:mb-3 tracking-widest italic leading-none m-0 uppercase">Résultat mesuré ({indicator.IND_Unite})</p>
                      <div className={cn(
                        "text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter leading-none mt-1 md:mt-2",
                        hasValue 
                          ? (isOnTarget ? 'text-emerald-400' : 'text-rose-400') 
                          : 'text-slate-700'
                      )} aria-live="polite">
                        {hasValue ? indicator.currentValue?.IV_Actual : '--'}
                      </div>
                    </div>

                    <div className="flex justify-between items-center px-2 md:px-4 mb-6 md:mb-8">
                      <div className="text-left space-y-0.5 md:space-y-1">
                        <p className="text-[7px] md:text-[8px] text-slate-600 uppercase tracking-widest m-0">Cible</p>
                        <p className="text-base md:text-lg font-black italic text-emerald-400 m-0">{indicator.IND_Cible}</p>
                      </div>
                      <div className="text-right space-y-0.5 md:space-y-1">
                        <p className="text-[7px] md:text-[8px] text-slate-600 uppercase tracking-widest m-0">Statut</p>
                        <p className="text-[9px] md:text-[10px] font-black uppercase text-blue-400 m-0 italic">{indicator.currentValue?.IV_Status ?? 'A SAISIR'}</p>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleOpenSaisie(indicator)} 
                      disabled={!targetPeriod.isEditable} 
                      className={cn(
                        "w-full py-3 md:py-4 lg:py-6 rounded-xl md:rounded-2xl lg:rounded-3xl bg-blue-600 text-white font-black uppercase italic text-[9px] md:text-[10px] tracking-widest transition-all border-none shadow-2xl cursor-pointer hover:bg-white hover:text-blue-700 disabled:opacity-20 focus:outline-none focus:ring-2 focus:ring-blue-400",
                        !targetPeriod.isEditable && "cursor-not-allowed"
                      )}
                      aria-label={`Saisir ou modifier la valeur pour ${indicator.IND_Libelle}`}
                    >
                      <Edit3 size={14} className="w-3.5 h-3.5 inline mr-1.5 md:mr-2" aria-hidden="true" /> 
                      {hasValue ? 'Modifier Relevé' : 'Saisir Performance'}
                    </button>
                  </article>
                );
              })}
              {(!process.indicators || process.indicators.length === 0) && (
                <div className="col-span-full text-center py-8 md:py-12 text-slate-500" role="status">
                  <BarChart3 size={40} className="w-10 h-10 mx-auto mb-3 opacity-20" aria-hidden="true" />
                  <p className="text-[9px] md:text-[10px] font-black uppercase italic tracking-widest">Aucun indicateur configuré pour ce processus</p>
                </div>
              )}
            </div>
          </section>
        ))}
        
        {processes.length === 0 && (
          <div className="text-center py-16 md:py-24 text-slate-500" role="status">
            <AlertCircle size={48} className="w-12 h-12 mx-auto mb-4 opacity-20" aria-hidden="true" />
            <p className="text-[10px] md:text-[11px] font-black uppercase italic tracking-widest">Aucun processus trouvé pour la période sélectionnée</p>
          </div>
        )}
      </main>

      {/* 🧾 MODAL DE SAISIE */}
      {isModalOpen && selectedIndicator && typeof window !== 'undefined' && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 animate-in zoom-in-95 duration-300 italic font-black uppercase"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="bg-[#0F172A] border-2 border-white/10 w-full max-w-4xl rounded-2xl md:rounded-3xl lg:rounded-[5rem] p-6 md:p-8 lg:p-12 xl:p-16 shadow-2xl text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 md:p-10 lg:p-12 opacity-5 pointer-events-none rotate-12">
              <TrendingUp size={200} className="w-50 h-50 md:w-75 md:h-75" aria-hidden="true" />
            </div>
            
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 md:top-6 lg:top-12 right-4 md:right-6 lg:right-12 text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded p-1 md:p-2"
              aria-label="Fermer"
            >
              <X size={20} className="w-5 h-5 md:w-8 md:h-8 lg:w-10 lg:h-10" aria-hidden="true" />
            </button>
            
            <header className="mb-8 md:mb-10 lg:mb-12 border-b border-white/5 pb-6 md:pb-8 relative z-10">
              <span className="text-blue-400 text-[9px] md:text-[10px] tracking-widest mb-3 md:mb-4 block">Protocole de Saisie §9.1.1</span>
              <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tighter m-0 leading-tight uppercase">{selectedIndicator.IND_Libelle}</h2>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-12 mb-8 md:mb-10 lg:mb-12 relative z-10">
              <div className="space-y-2 md:space-y-3 lg:space-y-4 text-left">
                <label htmlFor="kpi-value" className="text-[9px] md:text-[10px] lg:text-[11px] text-slate-500 tracking-widest ml-2 md:ml-4 lg:ml-6 italic leading-none uppercase block">
                  Valeur mesurée ({selectedIndicator.IND_Unite}) *
                </label>
                <input 
                  id="kpi-value"
                  type="number" 
                  step="any"
                  value={inputValue} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)} 
                  className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-6 lg:p-8 md:p-10 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black italic text-center text-blue-400 outline-none focus:border-blue-500 transition-all shadow-inner" 
                  autoFocus 
                  aria-required="true"
                />
              </div>
              <div className="space-y-2 md:space-y-3 lg:space-y-4 text-left">
                <label htmlFor="kpi-comment" className="text-[9px] md:text-[10px] lg:text-[11px] text-slate-500 tracking-widest ml-2 md:ml-4 lg:ml-6 italic leading-none uppercase block">
                  Analyse des écarts & Commentaires
                </label>
                <textarea 
                  id="kpi-comment"
                  value={inputComment} 
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputComment(e.target.value)} 
                  className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-6 lg:p-8 text-[10px] md:text-[11px] font-bold italic text-slate-400 h-32 md:h-40 lg:h-48 outline-none focus:border-blue-500 uppercase resize-none shadow-inner leading-relaxed" 
                  placeholder="DÉTAILLER LES CAUSES DES ÉCARTS SI NÉCESSAIRE..." 
                />
              </div>
            </div>

            <button 
              type="button"
              onClick={handleSaveKPI} 
              disabled={submitting} 
              className={cn(
                "w-full py-4 md:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[3rem] bg-blue-600 text-white font-black uppercase italic text-[9px] md:text-[10px] lg:text-xs tracking-widest shadow-2xl hover:bg-white hover:text-blue-700 transition-all border-none cursor-pointer active:scale-95 relative z-10 focus:outline-none focus:ring-2 focus:ring-blue-400",
                submitting && "opacity-70 cursor-wait"
              )}
              aria-busy={submitting}
            >
              {submitting ? (
                <><Loader2 size={18} className="w-4.5 h-4.5 md:w-5 md:h-5 lg:w-6 lg:h-6 animate-spin inline mr-2" aria-hidden="true" /> Scellage...</>
              ) : (
                <><Save size={18} className="w-4.5 h-4.5 md:w-5 md:h-5 lg:w-6 lg:h-6 inline mr-2" aria-hidden="true" /> Sceller la donnée de performance</>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}