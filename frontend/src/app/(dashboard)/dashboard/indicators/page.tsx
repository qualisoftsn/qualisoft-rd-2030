/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📊 MODULE : PILOTAGE KPI & PERFORMANCE (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Surveillance et mesure §9.1.1 ISO 9001.
 * LOGIC : Fenêtre de saisie stricte J+10 et workflow de scellage souverain.
 * DESIGN : Layout 100dvh, Dark Matrix, ClickUp Density.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 11:42 GMT
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/core/api/api-client";
import {
  BarChart3, Calendar, 
  Edit3, Loader2, Lock, RotateCcw,
  Save, TrendingUp, Unlock, X, RefreshCcw
} from "lucide-react";
import { toast, Toaster } from "sonner";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export default function PilotageKPIPage() {
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState<string>("all");

  // --- ÉTATS MODAL & SAISIE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<any>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [inputComment, setInputComment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // --- 🔑 MOTEUR TEMPOREL ISO (Calcul J+10) ---
  const today = new Date();
  const targetPeriod = useMemo(() => {
    const d = today.getDate();
    const m = today.getMonth() + 1;
    const y = today.getFullYear();
    // Fenêtre de saisie : Si nous sommes avant le 10, on traite le mois précédent
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
      const res = await apiClient.get("/indicators/processes-with-values", {
        params: { month: targetPeriod.month, year: targetPeriod.year }
      });
      setProcesses(res.data?.data || res.data || []);
    } catch {
      toast.error("RUPTURE DE LIAISON NOYAU KPI");
    } finally { setLoading(false); }
  }, [targetPeriod]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenSaisie = async (indicator: any) => {
    setSelectedIndicator(indicator);
    setInputValue(indicator.currentValue?.IV_Actual?.toString() || "");
    setInputComment(indicator.currentValue?.IV_Comment || "");
    setIsModalOpen(true);
  };

  const handleSaveKPI = async () => {
    if (!selectedIndicator) return;
    setSubmitting(true);
    const tid = toast.loading("Scellage de la performance...");
    try {
      await apiClient.post("/indicators/save-value", {
        indicatorId: selectedIndicator.IND_Id,
        month: targetPeriod.month,
        year: targetPeriod.year,
        value: parseFloat(inputValue.replace(",", ".")),
        comment: inputComment,
      });
      toast.success("DONNÉE SCELÉE AU REGISTRE §9.1.1", { id: tid });
      fetchData();
      setIsModalOpen(false);
    } catch {
      toast.error("ÉCHEC DE PERSISTANCE PERFORMANCE", { id: tid });
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingScreen label="Synchronisation Matrix KPI..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER SDE (Fixe) */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-40 gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-4">
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Pilotage <span className="text-blue-600">KPI</span></h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
              <Calendar size={16} className="text-blue-500" />
              <span className="text-[10px] tracking-widest text-slate-300">Période : {targetPeriod.month}/{targetPeriod.year}</span>
            </div>
            <div className={cn(
              "px-6 py-3 rounded-2xl border text-[9px] flex items-center gap-2 tracking-widest transition-all",
              targetPeriod.isEditable ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            )}>
              {targetPeriod.isEditable ? <Unlock size={14} className="animate-pulse" /> : <Lock size={14} />} 
              {targetPeriod.isEditable ? `Fenêtre Ouverte (${targetPeriod.daysLeft}j Restants)` : 'Saisie Verrouillée J+10'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <select 
            value={selectedProcess} 
            onChange={e => setSelectedProcess(e.target.value)} 
            className="flex-1 xl:flex-none bg-slate-900 border border-white/10 rounded-2xl px-8 py-5 text-[10px] font-black uppercase italic text-white outline-none min-w-80 cursor-pointer appearance-none shadow-2xl"
          >
            <option value="all">Consolidation SMI Globale</option>
            {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
          </select>
          <button onClick={fetchData} className="p-5 bg-white/5 border border-white/10 rounded-2xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      {/* 📜 WORKZONE (Scroll Isolé) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-16">
        {processes.filter(p => selectedProcess === 'all' || p.PR_Id === selectedProcess).map(process => (
          <section key={process.PR_Id} className="bg-slate-900/40 border-2 border-white/5 rounded-[4rem] p-10 shadow-4xl animate-in fade-in duration-700">
            <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-3xl rotate-3 group-hover:rotate-0 transition-transform">
                  <BarChart3 size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tighter m-0 leading-none">{process.PR_Libelle}</h2>
                  <p className="text-[10px] text-slate-500 tracking-[0.4em] mt-3 m-0 italic">ISO 9001 §4.4 • Processus {process.PR_Code}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {process.indicators?.map((indicator: any) => (
                <div key={indicator.IND_Id} className="bg-black/40 border border-white/5 rounded-[3.5rem] p-10 hover:border-blue-500/30 transition-all flex flex-col shadow-2xl relative group">
                  <div className="absolute top-8 right-8 bg-white/5 px-4 py-2 rounded-xl text-[8px] tracking-widest text-slate-500 border border-white/5 italic">
                    {indicator.IND_Frequence}
                  </div>
                  
                  <h3 className="text-xl font-black mb-8 pr-12 line-clamp-2 leading-none tracking-tighter text-white uppercase italic">
                    {indicator.IND_Libelle}
                  </h3>
                  
                  <div className="bg-[#0B0F1A] rounded-[2.5rem] p-8 mb-8 border border-white/5 text-center shadow-inner group-hover:border-blue-500/20 transition-all">
                    <p className="text-[9px] text-slate-600 mb-3 tracking-widest italic leading-none m-0 uppercase">Résultat mesuré ({indicator.IND_Unite})</p>
                    <div className={cn(
                      "text-6xl font-black italic tracking-tighter leading-none mt-2",
                      indicator.currentValue?.IV_Actual 
                        ? (indicator.currentValue.IV_Actual >= indicator.IND_Cible ? 'text-emerald-500' : 'text-rose-500') 
                        : 'text-slate-800'
                    )}>
                      {indicator.currentValue?.IV_Actual ?? '--'}
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-4 mb-8">
                    <div className="text-left space-y-1">
                      <p className="text-[8px] text-slate-600 uppercase tracking-widest m-0">Cible</p>
                      <p className="text-base font-black italic text-emerald-500 m-0">{indicator.IND_Cible}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[8px] text-slate-600 uppercase tracking-widest m-0">Statut</p>
                      <p className="text-[10px] font-black uppercase text-blue-500 m-0 italic">{indicator.currentValue?.IV_Status ?? 'A SAISIR'}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleOpenSaisie(indicator)} 
                    disabled={!targetPeriod.isEditable} 
                    className="w-full py-6 rounded-3xl bg-blue-600 text-white font-black uppercase italic text-[10px] tracking-widest transition-all border-none shadow-3xl cursor-pointer hover:bg-white hover:text-blue-600 disabled:opacity-20"
                  >
                    <Edit3 size={14} className="inline mr-2" /> {indicator.currentValue?.IV_Actual ? 'Modifier Relevé' : 'Saisir Performance'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* 🧾 MODAL DE SAISIE MATRIX */}
      {isModalOpen && selectedIndicator && (
        <div className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-2xl z-100 flex items-center justify-center p-6 animate-in zoom-in-95 duration-300 italic font-black uppercase">
          <div className="bg-slate-900 border-2 border-white/10 w-full max-w-4xl rounded-[5rem] p-12 lg:p-16 shadow-4xl text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><TrendingUp size={300} /></div>
            
            <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer"><X size={40} /></button>
            
            <header className="mb-12 border-b border-white/5 pb-8 relative z-10">
              <span className="text-blue-500 text-[10px] tracking-[0.5em] mb-4 block">Protocole de Saisie §9.1.1</span>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tighter m-0 leading-tight uppercase">{selectedIndicator.IND_Libelle}</h2>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 relative z-10">
              <div className="space-y-4 text-left">
                <label className="text-[11px] text-slate-500 tracking-[0.3em] ml-6 italic leading-none uppercase">Valeur mesurée ({selectedIndicator.IND_Unite}) *</label>
                <input 
                  type="number" 
                  value={inputValue} 
                  onChange={e => setInputValue(e.target.value)} 
                  className="w-full bg-black/40 border-2 border-white/5 rounded-[2.5rem] p-10 text-6xl font-black italic text-center text-blue-500 outline-none focus:border-blue-600 transition-all shadow-inner" 
                  autoFocus 
                />
              </div>
              <div className="space-y-4 text-left">
                <label className="text-[11px] text-slate-500 tracking-[0.3em] ml-6 italic leading-none uppercase">Analyse des écarts & Commentaires</label>
                <textarea 
                  value={inputComment} 
                  onChange={e => setInputComment(e.target.value)} 
                  className="w-full bg-black/40 border-2 border-white/5 rounded-[2.5rem] p-8 text-sm font-bold italic text-slate-300 h-full min-h-48 outline-none focus:border-blue-600 uppercase resize-none shadow-inner leading-relaxed" 
                  placeholder="DÉTAILLER LES CAUSES DES ÉCARTS SI NÉCESSAIRE..." 
                />
              </div>
            </div>

            <button 
              onClick={handleSaveKPI} 
              disabled={submitting} 
              className="w-full py-8 rounded-[3rem] bg-blue-600 text-white font-black uppercase italic text-xs tracking-[0.4em] shadow-4xl hover:bg-emerald-600 transition-all border-none cursor-pointer active:scale-95 relative z-10"
            >
              {submitting ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} className="inline mr-4" />} Sceller la donnée de performance
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
}

// --- SOUS-COMPOSANT SDE ---
function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500">
      <RefreshCcw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] animate-pulse italic text-center px-10 leading-relaxed">{label}</span>
    </div>
  );
}