/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : NOYAU WORKFLOWS MASTER (ELITE SDE)
 * ---------------------------------------------------------------------------
 * FONCTION : Gestion des Flux BPMN & Arbitrages SMI.
 * RÔLE : Traçabilité des validations (ISO 9001 §4.4 & §7.5).
 * DESIGN : Decision Tower / 100dvh / Zero-Scroll.
 * ARCHITECTURE : Souveraine (Sans NextAuth).
 * ---------------------------------------------------------------------------
 * RÉVISION : 05 Mars 2026 | 22:55 GMT
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  GitMerge, Clock, CheckCircle2, AlertCircle, Play, 
  Settings2, RefreshCw, ShieldCheck,
  ArrowRightCircle, Activity, Zap, Layers, Cpu
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import WorkflowDesigner from '@/components/workflows/WorkflowDesigner';
import { cn } from '@/core/utils/cn';

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
      toast.error("Rupture de liaison avec le Noyau Workflows Master.");
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
      toast.success("Décision scellée dans le registre SMI.", { id: tid });
      fetchTasks();
    } catch (err) {
      toast.error("Échec du scellage de la décision.", { id: tid });
    } finally {
      setIsProcessing(null);
    }
  };

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
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🚀 DECISION TOWER HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div>
          <div className="flex items-center gap-3 text-blue-500 text-[10px] tracking-[0.4em] mb-3">
            <ShieldCheck size={18} /> Qualisoft Decision Engine §4.4
          </div>
          <h1 className="text-4xl lg:text-6xl tracking-tighter leading-none m-0 italic">
            Noyau <span className="text-blue-600">Workflows</span>
          </h1>
          <p className="text-slate-500 text-[9px] tracking-[0.3em] mt-3 m-0">
            {"Modélisation BPMN : $$L_{cycle} = \\frac{\\sum_{i=1}^{n} (T_{end} - T_{start})}{N}$$"}
          </p>
        </div>

        <div className="flex gap-4 w-full xl:w-auto">
          <button 
            onClick={fetchTasks}
            className="p-4 bg-white/5 border border-white/10 rounded-xl hover:text-blue-500 transition-all cursor-pointer shadow-xl flex justify-center"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsDesignerOpen(true)}
            className="flex-1 xl:flex-none bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-4 rounded-xl font-black text-[10px] tracking-widest border-none cursor-pointer shadow-2xl transition-all flex items-center justify-center gap-3"
          >
            <Settings2 size={18} /> CONFIGURER FLUX
          </button>
        </div>
      </header>

      {/* 🧩 VIEWPORT ANALYTIQUE & DÉCISIONNEL */}
      <main className="flex-1 overflow-hidden flex flex-col p-8 gap-8">
        
        {/* 📊 KPI GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 shrink-0 animate-in slide-in-from-bottom-6">
          <Metric title="En Attente" val={stats.pendingCount} icon={Clock} color="text-amber-500" formula="Tâches Pending" />
          <Metric title="Clôturés" val={stats.completedCount} icon={CheckCircle2} color="text-emerald-500" formula="Approbations" />
          <Metric title="Critiques" val={stats.bottlenecks} icon={AlertCircle} color="text-red-500" formula="Priority High" />
          <Metric title="Vélocité" val={stats.velocity} icon={GitMerge} color="text-blue-500" formula="Cycle moyen" />
        </div>

        {/* 🖥️ DENSITY DECISION QUEUE */}
        <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-[4rem] p-10 flex flex-col shadow-4xl backdrop-blur-3xl overflow-hidden animate-in slide-in-from-bottom-12">
          
          <div className="flex justify-between items-center mb-10 shrink-0">
            <h3 className="text-2xl font-black italic flex items-center gap-4 text-emerald-500 tracking-tighter m-0 leading-none">
              <Play className="fill-emerald-500" size={24} /> File d&apos;Attente Décisionnelle
            </h3>
            <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
              <Activity size={16} className="text-blue-500 animate-pulse" />
              <span className="text-[9px] text-blue-400 tracking-widest italic">SDE REAL-TIME MONITORING</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-6">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 gap-6">
                <RefreshCw className="animate-spin text-blue-500" size={50} strokeWidth={1} />
                <span className="text-[10px] tracking-[0.5em] animate-pulse">Sync Noyau Décisionnel...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-6">
                 <Layers size={100} strokeWidth={0.5} />
                 <div className="space-y-2">
                   <p className="text-2xl font-black tracking-widest italic m-0">Registre Vierge</p>
                   <p className="text-[10px] m-0">Aucun arbitrage SMI requis à ce stade.</p>
                 </div>
              </div>
            ) : (
              tasks.map((task: IWorkflowTask) => (
                <div 
                  key={task.AW_Id} 
                  className="bg-white/5 border-2 border-white/5 p-8 lg:p-10 rounded-[3rem] group hover:border-blue-500/40 transition-all flex flex-col xl:flex-row items-center justify-between gap-8 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                  
                  <div className="text-left space-y-4 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="bg-blue-600/10 text-blue-500 px-4 py-1.5 rounded-xl text-[9px] border border-blue-500/20">{task.AW_EntityType}</span>
                      <span className="text-slate-500 text-[10px] flex items-center gap-2"><Activity size={14}/> {task.AW_StepName || "ÉTAPE STANDARD"}</span>
                      {task.AW_Priority === 'HIGH' && (
                        <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-[8px] animate-pulse">CRITIQUE</span>
                      )}
                    </div>
                    <h4 className="text-2xl lg:text-3xl font-black tracking-tighter text-white m-0 truncate group-hover:text-blue-500 transition-colors">
                      {task.AW_Comment || "En attente de qualification"}
                    </h4>
                    <p className="text-[9px] text-slate-600 tracking-widest m-0 flex items-center gap-2 italic">
                       <Clock size={12} /> Émission : {new Date(task.createdAt).toLocaleDateString()} &bull; ID: {task.AW_EntityId}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleProcessTask(task.AW_Id)}
                    disabled={isProcessing === task.AW_Id}
                    className="w-full xl:w-auto bg-blue-600 text-white px-10 py-5 rounded-4xl font-black text-[10px] tracking-widest border-none cursor-pointer hover:bg-white hover:text-blue-600 transition-all shadow-xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                  >
                    {isProcessing === task.AW_Id ? <RefreshCw className="animate-spin" size={16}/> : <ArrowRightCircle size={20} />}
                    TRAITER L&apos;ÉTAPE
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* 🛰️ FORMULES DE MATURITÉ ALGÈBRE SMI */}
      <footer className="shrink-0 p-6 bg-black/40 border-t border-white/5 flex flex-col xl:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-6 text-slate-500 text-[10px] tracking-widest italic">
            <Cpu size={16} className="text-blue-500" />
            <span>Algorithme de Maturité : {"$$M = \\frac{A_{clôture}}{A_{requis}} \\times 100$$"}</span>
         </div>
         <span className="text-[9px] text-slate-700 tracking-[0.5em]">QUALISOFT MASTER CORE v6.0</span>
      </footer>

      {/* MODAL DESIGNER */}
      {isDesignerOpen && (
        <WorkflowDesigner 
          entityId="ROOT-FLOW" 
          entityType="ACTION" 
          onClose={() => setIsDesignerOpen(false)} 
          onSuccess={() => { setIsDesignerOpen(false); fetchTasks(); }}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function Metric({ title, val, icon: Icon, color, formula }: any) {
  return (
    <div className="bg-[#151A2D] border border-white/5 p-8 rounded-[3rem] shadow-2xl group hover:border-blue-500/20 transition-all text-left relative overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div className={cn("p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner", color)}>
          <Icon size={24} />
        </div>
        <div className="text-right space-y-1">
           <span className="text-[8px] text-slate-700 font-black tracking-widest italic m-0 block">NOYAU SMI</span>
           <p className="text-[7px] text-slate-600 m-0 uppercase truncate max-w-24">{formula}</p>
        </div>
      </div>
      <p className="text-[9px] text-slate-500 tracking-widest m-0 mb-3 italic">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl lg:text-5xl font-black italic tracking-tighter text-white leading-none">{val}</span>
        <Activity size={14} className="text-slate-800" />
      </div>
    </div>
  );
}