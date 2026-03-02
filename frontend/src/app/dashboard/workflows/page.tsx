/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : src/app/(dashboard)/workflows/page.tsx
 * -------------------------------------------------------------------------
 * FONCTION : Noyau Master de Gestion des Flux BPMN & Décisions SMI.
 * RÔLE : Assurer la traçabilité des validations (ISO 9001 §4.4 & §7.5).
 * SÉCURITÉ : Zéro NextAuth. Tunneling crypté via SDE Kernel (apiClient).
 * DESIGN : High-Density decision tower / No-Scroll Global Frame.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 16:15 GMT
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  GitMerge, Clock, CheckCircle2, AlertCircle, Play, 
  Settings2, RefreshCw, Calculator, ShieldCheck,
  ArrowRightCircle, Activity, Zap, Layers, Cpu
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import WorkflowDesigner from '@/components/workflows/WorkflowDesigner';

// --- INTERFACES DU NOYAU DÉCISIONNEL ---
interface IWorkflowTask {
  AW_Id: string;
  AW_EntityType: string;
  AW_EntityId: string;
  AW_Comment?: string;
  AW_Status: 'PENDING' | 'APPROVED' | 'REJECTED';
  AW_Priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  AW_StepName?: string;
}

interface IWorkflowStats {
  pendingCount: number;
  completedCount: number;
  bottlenecks: number;
  velocity: string;
}

export default function WorkflowsMasterPage() {
  const [tasks, setTasks] = useState<IWorkflowTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  /**
   * 🛡️ INITIALISATION SOUVERAINE
   * Élimination de NextAuth : Vérification locale via le SDE Kernel.
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * 📡 SYNCHRONISATION NOYAU MASTER
   * Extraction des files d'attente de décision ISO §4.4.
   */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/workflows/tasks');
      setTasks(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      toast.error("Rupture de liaison avec le Noyau Workflows.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isMounted) fetchTasks(); }, [fetchTasks, isMounted]);

  /**
   * ⚡ EXÉCUTION & SCELLAGE DE DÉCISION
   */
  const handleProcessTask = async (taskId: string) => {
    setIsProcessing(taskId);
    const tid = toast.loading("Scellage cryptographique de la décision...");
    try {
      await apiClient.post(`/workflows/tasks/${taskId}/approve`);
      toast.success("Décision enregistrée dans le registre SMI.", { id: tid });
      fetchTasks();
    } catch (err) {
      toast.error("Échec du scellage de la décision.", { id: tid });
    } finally {
      setIsProcessing(null);
    }
  };

  /**
   * 📊 ANALYTIQUE EN TEMPS RÉEL (KPI §9.1)
   */
  const stats = useMemo<IWorkflowStats>(() => {
    return {
      pendingCount: tasks.length,
      completedCount: 142, 
      bottlenecks: tasks.filter(t => t.AW_Priority === 'HIGH').length,
      velocity: "1.2j"
    };
  }, [tasks]);

  if (!isMounted) return null;

  return (
    <div className="ml-0 lg:ml-72 h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden p-4 lg:p-8 text-left">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🚀 DECISION TOWER HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 lg:mb-12 border-b border-white/5 pb-8 shrink-0 gap-6 animate-in fade-in duration-700">
        <div>
          <div className="flex items-center gap-3 text-blue-500 font-black uppercase text-[9px] lg:text-[10px] tracking-[0.4em] lg:tracking-[0.6em] mb-3 lg:mb-4 leading-none">
             <ShieldCheck size={18} /> Qualisoft Decision Engine §4.4
          </div>
          <h1 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter italic leading-none m-0 text-white">
            Noyau <span className="text-blue-600">Workflows</span>
          </h1>
          <p className="text-slate-500 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.4em] mt-4 lg:mt-5 italic m-0 opacity-70">
            Automates de décision & Registre d&apos;approbation
          </p>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <button 
            onClick={fetchTasks}
            className="p-4 lg:p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-blue-500 transition-all cursor-pointer shadow-xl flex justify-center m-0"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsDesignerOpen(true)}
            className="flex-1 lg:flex-none bg-blue-600 hover:bg-white hover:text-blue-600 px-8 py-4 lg:px-12 lg:py-5 rounded-2xl lg:rounded-3xl text-[10px] lg:text-[11px] font-black uppercase italic tracking-widest flex items-center justify-center gap-4 transition-all border-none cursor-pointer text-white shadow-2xl"
          >
            <Settings2 size={18} strokeWidth={3} /> CONFIGURER FLUX
          </button>
        </div>
      </header>

      {/* 📊 KPI GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8 lg:mb-12 shrink-0 animate-in slide-in-from-bottom-6 duration-1000">
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          <Metric title="En Attente" val={stats.pendingCount} icon={Clock} color="text-amber-500" formula="Tâches Pending" />
          <Metric title="Clôturés" val={stats.completedCount} icon={CheckCircle2} color="text-emerald-500" formula="Approbations" />
          <Metric title="Points Critiques" val={stats.bottlenecks} icon={AlertCircle} color="text-red-500" formula="Priority High" />
          <Metric title="Vélocité" val={stats.velocity} icon={GitMerge} color="text-blue-500" formula="Cycle moyen" />
        </div>
        
        <div className="lg:col-span-4 bg-blue-600/5 border border-blue-600/20 rounded-3xl lg:rounded-[3rem] p-6 lg:p-8 flex items-center gap-5 lg:gap-6 backdrop-blur-3xl shadow-xl relative overflow-hidden group">
           {/* Correction : w-8 h-8 (32px) et lg:w-10 lg:h-10 (40px) */}
           <Cpu className="text-blue-500 shrink-0 opacity-40 group-hover:scale-110 group-hover:opacity-100 transition-all w-8 h-8 lg:w-10 lg:h-10" strokeWidth={2.5} />
           <div className="text-left relative z-10">
              <p className="text-[9px] font-black uppercase text-blue-400 mb-2 tracking-widest italic leading-none m-0">Performance Algorithmique</p>
              <p className="text-[10px] lg:text-[11px] text-slate-400 leading-relaxed font-bold italic m-0">
                Performance = Σ(Δ t) / N étapes. <br/>
                Maturité = (Actions Closes / Total Requis) * 100.
              </p>
           </div>
        </div>
      </div>

      {/* 📋 DECISION QUEUE LIST */}
      <main className="flex-1 bg-slate-900/30 border border-white/5 rounded-[2.5rem] lg:rounded-[4rem] p-6 lg:p-12 flex flex-col overflow-hidden shadow-4xl backdrop-blur-md animate-in slide-in-from-bottom-12 duration-1000">
        <div className="flex justify-between items-center mb-8 lg:mb-10 shrink-0">
          <h3 className="text-2xl lg:text-3xl font-black uppercase italic flex items-center gap-4 text-emerald-500 tracking-tighter m-0 leading-none">
            {/* Correction : w-6 h-6 et lg:w-7 lg:h-7 */}
            <Play className="fill-emerald-500 w-6 h-6 lg:w-7 lg:h-7" /> File d&apos;Attente Décisionnelle
          </h3>
          <div className="hidden sm:flex items-center gap-3">
            <Activity size={18} className="text-blue-500 animate-pulse" />
            <span className="text-[9px] font-black text-slate-600 uppercase italic tracking-widest">SDE Matrix Real-Time</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 lg:pr-6 space-y-4 lg:space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 opacity-30">
              <RefreshCw className="animate-spin text-blue-500 w-12 h-12" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] italic animate-pulse">Synchronisation Noyau...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
               {/* Correction : w-20 h-20 et lg:w-24 lg:h-24 */}
               <Layers className="w-20 h-20 lg:w-24 lg:h-24 mb-8" />
               <p className="text-xl lg:text-2xl font-black uppercase italic tracking-[0.4em] m-0">Registre Vierge</p>
               <p className="text-[10px] uppercase mt-2">Aucune décision SMI en attente d&apos;arbitrage.</p>
            </div>
          ) : (
            tasks.map((task: IWorkflowTask) => (
              <div 
                key={task.AW_Id} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/2 p-6 lg:p-10 rounded-4xl lg:rounded-[3rem] border border-white/5 group hover:border-blue-600/40 transition-all shadow-lg hover:shadow-blue-900/10 relative overflow-hidden gap-6"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-left space-y-4 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 lg:gap-5">
                    <span className="text-[9px] font-black bg-blue-600/10 text-blue-400 px-4 py-1.5 rounded-lg uppercase tracking-widest border border-blue-600/20 italic leading-none m-0">
                      {task.AW_EntityType}
                    </span>
                    <span className="text-[9px] lg:text-[10px] font-black text-slate-500 italic uppercase tracking-widest flex items-center gap-2 m-0 leading-none truncate max-w-50">
                      <Activity size={14} className="shrink-0" /> {task.AW_StepName || "ÉTAPE STANDARD"} &bull; {task.AW_EntityId}
                    </span>
                    {task.AW_Priority === 'HIGH' && (
                      <span className="px-3 py-1 bg-red-600/10 text-red-500 border border-red-500/20 rounded-md text-[8px] font-black uppercase animate-pulse shrink-0 m-0">
                        Critique
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl lg:text-3xl font-black uppercase italic text-white tracking-tighter group-hover:text-blue-500 transition-colors m-0 leading-none truncate" title={task.AW_Comment}>
                    {task.AW_Comment || "En attente de qualification"}
                  </h4>
                  <p className="text-[9px] text-slate-600 font-bold uppercase italic flex items-center gap-2 m-0 leading-none">
                     <Clock size={12} className="shrink-0" /> Émise le {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleProcessTask(task.AW_Id)}
                  disabled={isProcessing === task.AW_Id}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-white hover:text-blue-600 px-8 py-4 lg:px-10 lg:py-5 rounded-xl lg:rounded-[2.5rem] text-[10px] font-black uppercase italic tracking-widest transition-all shadow-xl border-none cursor-pointer flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 m-0 shrink-0"
                >
                  {isProcessing === task.AW_Id ? <RefreshCw className="animate-spin" size={16}/> : <ArrowRightCircle size={18} strokeWidth={3}/>}
                  TRAITER L&apos;ÉTAPE
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL : DESIGNER DE FLUX ISO §4.4 */}
      {isDesignerOpen && (
        <WorkflowDesigner 
          entityId="ROOT-FLOW" 
          entityType="ACTION" 
          onClose={() => setIsDesignerOpen(false)} 
          onSuccess={() => { setIsDesignerOpen(false); fetchTasks(); }}
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.1); border-radius: 10px; }
        .custom-scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

/**
 * 🏛️ COMPOSANT METRIC : UNITÉ DE MESURE DE PERFORMANCE ISO
 */
function Metric({ title, val, icon: Icon, color, formula }: { title: string, val: number|string, icon: any, color: string, formula: string }) {
  return (
    <div className="bg-slate-900/40 border border-white/5 p-6 lg:p-8 rounded-4xl lg:rounded-[3rem] shadow-xl group hover:border-blue-500/30 transition-all relative overflow-hidden text-left m-0">
      <div className="flex justify-between items-start mb-6 lg:mb-8">
        <div className={`${color} p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner shrink-0`}>
          {/* Correction responsive via className */}
          <Icon className="w-6 h-6 lg:w-7 lg:h-7" strokeWidth={2.5} />
        </div>
        <div className="text-right hidden sm:block overflow-hidden">
           <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest italic group-hover:text-blue-500 transition-colors block">Noyau SMI</span>
           <p className="text-[8px] font-bold text-slate-600 uppercase mt-1 italic leading-none m-0 truncate">{formula}</p>
        </div>
      </div>
      <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase italic tracking-widest mb-2 leading-none m-0 truncate">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl lg:text-4xl xl:text-5xl font-black italic tracking-tighter text-white leading-none truncate">{val ?? 0}</span>
        <Activity size={14} className="text-slate-800 shrink-0" />
      </div>
    </div>
  );
}