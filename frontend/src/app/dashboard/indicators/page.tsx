/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📊 MODULE : PILOTAGE KPI & PERFORMANCE MATRIX
 * Rôle : Surveillance et mesure §9.1.1 ISO 9001.
 * Logic : Fenêtre de saisie stricte J+10 et workflow de validation RQ.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:51 GMT
 */

"use client";

import apiClient from "@/core/api/api-client";
import {
  Activity, AlertCircle, BarChart3, Calendar, CheckCircle2, Clock,
  Edit3, FileText, Filter, History, Loader2, Lock, RotateCcw,
  Save, Send, ShieldCheck, Target, TrendingUp, Unlock, X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";

// --- NOYAU DE TYPES SMI ---
type IVStatus = "BROUILLON" | "SOUMIS" | "VALIDE" | "RENVOYE";
type Frequence = "MENSUEL" | "BIMENSUEL" | "TRIMESTRIEL" | "SEMESTRIEL" | "ANNUEL";

interface IndicatorValue {
  IV_Id: string; IV_Month: number; IV_Year: number;
  IV_Actual: number | null; IV_Status: IVStatus;
  IV_Comment: string | null;
}

interface Indicator {
  IND_Id: string; IND_Code: string; IND_Libelle: string;
  IND_Unite: string; IND_Cible: number; IND_Frequence: Frequence;
  currentValue?: IndicatorValue; previousValue?: IndicatorValue;
  history?: IndicatorValue[];
}

interface Processus {
  PR_Id: string; PR_Code: string; PR_Libelle: string;
  PR_PiloteId: string; indicators: Indicator[];
}

export default function PilotageKPIPage() {
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedProcess, setSelectedProcess] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // --- ÉTATS MODAL & SAISIE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [activeProcess, setActiveProcess] = useState<Processus | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [inputComment, setInputComment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // --- 🔑 MOTEUR TEMPOREL ISO (Calcul J+10) ---
  const today = new Date();
  const targetPeriod = useMemo(() => {
    const d = today.getDate();
    const m = today.getMonth() + 1;
    const y = today.getFullYear();
    // Si nous sommes avant le 10, on saisit le mois précédent
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
      const [resP, resU] = await Promise.all([
        apiClient.get("/indicators/processes-with-values", {
          params: { month: targetPeriod.month, year: targetPeriod.year }
        }),
        apiClient.get("/me") // Philosophie Anti-NextAuth : Check direct Kernel
      ]);
      setProcesses(resP.data || []);
      setUser(resU.data);
    } catch {
      toast.error("ERREUR DE LIAISON NOYAU KPI");
    } finally { setLoading(false); }
  }, [targetPeriod]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- ACTIONS SOUVERAINES ---
  const handleOpenSaisie = async (indicator: Indicator, process: Processus) => {
    setSelectedIndicator(indicator);
    setActiveProcess(process);
    setInputValue(indicator.currentValue?.IV_Actual?.toString() || "");
    setInputComment(indicator.currentValue?.IV_Comment || "");
    setIsModalOpen(true);
    
    // Récupération de l'historique pour analyse de tendance
    const resH = await apiClient.get(`/indicators/${indicator.IND_Id}/history`);
    setSelectedIndicator(prev => prev ? { ...prev, history: resH.data } : null);
  };

  const handleSaveKPI = async () => {
    if (!selectedIndicator) return;
    setSubmitting(true);
    try {
      await apiClient.post("/indicators/save-value", {
        indicatorId: selectedIndicator.IND_Id,
        month: targetPeriod.month,
        year: targetPeriod.year,
        value: parseFloat(inputValue.replace(",", ".")),
        comment: inputComment,
      });
      toast.success("DONNÉE SCELÉE AU REGISTRE");
      fetchData();
      setIsModalOpen(false);
    } catch {
      toast.error("ÉCHEC DE PERSISTANCE PERFORMANCE");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black uppercase italic tracking-[0.5em] animate-pulse"><Loader2 className="animate-spin mb-4" size={48} /> Synchronisation Matrix...</div>;

  return (
    <div className="p-10 italic bg-[#0B0F1A] min-h-screen text-white text-left font-sans selection:bg-blue-600/30 ml-0 lg:ml-72">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-white/5 pb-10 mb-12 gap-8 mt-12 lg:mt-0">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none m-0">Pilotage <span className="text-blue-600">KPI</span></h1>
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
              <Calendar size={16} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Période : {targetPeriod.month}/{targetPeriod.year}</span>
            </div>
            <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest ${targetPeriod.isEditable ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {targetPeriod.isEditable ? <Unlock size={14} /> : <Lock size={14} />} {targetPeriod.isEditable ? `Fenêtre Ouverte (${targetPeriod.daysLeft}j)` : 'Saisie Verrouillée'}
            </div>
          </div>
        </div>
        <select value={selectedProcess} onChange={e => setSelectedProcess(e.target.value)} className="bg-slate-900 border border-white/10 rounded-2xl px-8 py-4 text-[10px] font-black uppercase italic text-white outline-none min-w-64 appearance-none cursor-pointer">
          <option value="all">Consolidation SMI Globale</option>
          {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
        </select>
      </header>

      <div className="space-y-16">
        {processes.filter(p => selectedProcess === 'all' || p.PR_Id === selectedProcess).map(process => (
          <section key={process.PR_Id} className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-10 shadow-3xl animate-in fade-in duration-700">
            <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg"><BarChart3 size={32} /></div>
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter m-0 leading-none">{process.PR_Libelle}</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 m-0">Responsable : Pilote de Processus</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {process.indicators.map(indicator => (
                <div key={indicator.IND_Id} className="bg-black/40 border border-white/5 rounded-[3.5rem] p-10 hover:border-blue-500/30 transition-all group flex flex-col shadow-2xl relative">
                  <div className="absolute top-8 right-8 bg-slate-800 px-3 py-1 rounded-lg text-[8px] font-black uppercase italic tracking-widest text-slate-500">{indicator.IND_Frequence}</div>
                  <h3 className="text-xl font-black uppercase italic text-white mb-8 pr-12 line-clamp-2 leading-tight">{indicator.IND_Libelle}</h3>
                  
                  <div className="bg-slate-950/50 rounded-4xl p-8 mb-8 border border-white/5 text-center">
                    <p className="text-[9px] font-black text-slate-600 uppercase mb-2 italic">Résultat {indicator.IND_Unite}</p>
                    <div className={`text-5xl font-black italic tracking-tighter leading-none ${indicator.currentValue?.IV_Actual ? (indicator.currentValue.IV_Actual >= indicator.IND_Cible ? 'text-emerald-500' : 'text-red-500') : 'text-slate-800'}`}>
                      {indicator.currentValue?.IV_Actual ?? '--'}
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-4 mb-8">
                    <div className="text-left"><p className="text-[8px] font-black text-slate-600 uppercase mb-1">Cible</p><p className="text-sm font-black italic text-emerald-500">{indicator.IND_Cible}</p></div>
                    <div className="text-right"><p className="text-[8px] font-black text-slate-600 uppercase mb-1">Statut</p><p className="text-[9px] font-black uppercase italic text-blue-400">{indicator.currentValue?.IV_Status ?? 'A SAISIR'}</p></div>
                  </div>

                  <button onClick={() => handleOpenSaisie(indicator, process)} disabled={!targetPeriod.isEditable} className="w-full py-5 rounded-3xl bg-blue-600 hover:bg-white hover:text-blue-600 text-white font-black uppercase italic text-[10px] tracking-widest transition-all border-none shadow-xl cursor-pointer active:scale-95 disabled:opacity-20">
                    <Edit3 size={14} className="inline mr-2" /> {indicator.currentValue?.IV_Actual ? 'Modifier Relevé' : 'Saisir Performance'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* MODAL DE SAISIE MATRIX */}
      {isModalOpen && selectedIndicator && (
        <div className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-[4rem] p-12 shadow-4xl text-left relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer"><X size={32} /></button>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-10 leading-none">{selectedIndicator.IND_Libelle}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Valeur mesurée ({selectedIndicator.IND_Unite}) *</label>
                <input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-3xl p-8 text-5xl font-black italic text-center text-blue-500 outline-none focus:border-blue-500 transition-all" autoFocus />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Analyse des écarts & Commentaires</label>
                <textarea value={inputComment} onChange={e => setInputComment(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-3xl p-8 text-sm font-bold italic text-slate-300 h-full min-h-32 outline-none focus:border-blue-500 uppercase" placeholder="DÉTAILLER LES CAUSES ICI..." />
              </div>
            </div>

            <button onClick={handleSaveKPI} disabled={submitting} className="w-full py-6 rounded-[2.5rem] bg-blue-600 text-white font-black uppercase italic text-xs tracking-widest shadow-3xl hover:bg-emerald-600 transition-all border-none cursor-pointer">
              {submitting ? <Loader2 className="animate-spin inline mr-2" /> : <Save className="inline mr-2" />} Sceller la donnée de performance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}