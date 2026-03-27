/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : NOYAU WORKFLOWS MASTER (ISO 9001 §4.4 & §7.5)
 * RÔLE : Gestion des Flux BPMN & Arbitrages SMI
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useEffect, useCallback, useMemo, KeyboardEvent } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  GitMerge, Clock, CheckCircle2, AlertCircle, Play, 
  Settings2, RefreshCw, ShieldCheck,
  ArrowRightCircle, Activity, Zap, Layers, Cpu, AlertTriangle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type WorkflowTaskStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type WorkflowPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type WorkflowEntityType = 'NC' | 'ACTION' | 'AUDIT' | 'RISQUE' | 'AUTRE';

export interface IWorkflowTask {
  AW_Id: string;
  AW_EntityType: WorkflowEntityType;
  AW_EntityId: string;
  AW_Comment?: string;
  AW_Status: WorkflowTaskStatus;
  AW_Priority: WorkflowPriority;
  AW_StepName?: string;
  createdAt: string;
  AW_CreatedBy?: string;
  AW_DueDate?: string;
}

export interface IWorkflowStats {
  pendingCount: number;
  completedCount: number;
  bottlenecks: number;
  velocity: string;
}

export interface MetricProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'amber' | 'emerald' | 'red' | 'blue';
  formula: string;
}

export interface WorkflowDesignerProps {
  entityId: string;
  entityType: string;
  onClose: () => void;
  onSuccess: () => void;
}

export interface LoadingStateProps {
  label: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const PRIORITY_LABELS: Record<WorkflowPriority, string> = {
  LOW: 'FAIBLE',
  MEDIUM: 'MOYENNE',
  HIGH: 'CRITIQUE'
};

const ENTITY_LABELS: Record<WorkflowEntityType, string> = {
  NC: 'Non-Conformité',
  ACTION: 'Action',
  AUDIT: 'Audit',
  RISQUE: 'Risque',
  AUTRE: 'Autre'
};

// ============================================================================
// SOUS-COMPOSANT : METRIC CARD
// ============================================================================

function Metric({ title, value, icon: Icon, color, formula }: MetricProps) {
  const colorClasses: Record<MetricProps['color'], string> = {
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    red: "text-red-400",
    blue: "text-blue-400"
  };

  return (
    <article 
      className="bg-[#0F172A] border border-white/5 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] shadow-2xl group hover:border-blue-500/20 transition-all text-left relative overflow-hidden focus-within:ring-2 focus-within:ring-blue-400"
      role="article"
      aria-label={`${title}: ${value}`}
      tabIndex={0}
    >
      <div className="flex justify-between items-start mb-4 md:mb-6 lg:mb-8">
        <div className={cn(
          "p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 shadow-inner",
          colorClasses[color]
        )}>
          <Icon size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
        </div>
        <div className="text-right space-y-0.5 md:space-y-1">
           <span className="text-[7px] md:text-[8px] text-slate-700 font-black tracking-widest italic m-0 block">NOYAU SMI</span>
           <p className="text-[6px] md:text-[7px] text-slate-600 m-0 uppercase truncate max-w-[80px] md:max-w-24">{formula}</p>
        </div>
      </div>
      <p className="text-[8px] md:text-[9px] text-slate-500 tracking-widest m-0 mb-2 md:mb-3 italic">{title}</p>
      <div className="flex items-baseline gap-1.5 md:gap-2">
        <span className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black italic tracking-tighter text-white leading-none">{value}</span>
        <Activity size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-slate-800" aria-hidden="true" />
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : TASK CARD
// ============================================================================

interface TaskCardProps {
  task: IWorkflowTask;
  isProcessing: boolean;
  onProcess: (taskId: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>, taskId: string) => void;
}

function TaskCard({ task, isProcessing, onProcess, onKeyDown }: TaskCardProps) {
  const isHighPriority = task.AW_Priority === 'HIGH';
  const entityTypeLabel = ENTITY_LABELS[task.AW_EntityType] || task.AW_EntityType;

  return (
    <article 
      className="bg-white/5 border-2 border-white/5 p-4 md:p-6 lg:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] group hover:border-blue-500/40 transition-all flex flex-col xl:flex-row items-center justify-between gap-4 md:gap-6 lg:gap-8 relative overflow-hidden focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="article"
      aria-label={`Tâche workflow: ${task.AW_Comment || 'En attente'}`}
      tabIndex={0}
      onKeyDown={(e) => onKeyDown(e, task.AW_Id)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 lg:w-2 bg-blue-600 opacity-0 group-hover:opacity-100 transition-all" aria-hidden="true" />
      
      <div className="text-left space-y-2 md:space-y-3 lg:space-y-4 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4">
          <span className="bg-blue-600/10 text-blue-400 px-2 md:px-3 lg:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] border border-blue-500/20">
            {entityTypeLabel}
          </span>
          <span className="text-slate-500 text-[9px] md:text-[10px] flex items-center gap-1.5 md:gap-2">
            <Activity size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
            {task.AW_StepName || "ÉTAPE STANDARD"}
          </span>
          {isHighPriority && (
            <span className="bg-red-600 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-lg text-[7px] md:text-[8px] animate-pulse">
              CRITIQUE
            </span>
          )}
        </div>
        <h4 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-black tracking-tighter text-white m-0 truncate group-hover:text-blue-400 transition-colors">
          {task.AW_Comment || "En attente de qualification"}
        </h4>
        <p className="text-[8px] md:text-[9px] text-slate-600 tracking-widest m-0 flex items-center gap-1.5 md:gap-2 italic">
           <Clock size={10} className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4" aria-hidden="true" /> 
           Émission : {new Date(task.createdAt).toLocaleDateString('fr-SN')} • ID: {task.AW_EntityId}
        </p>
      </div>
      
      <button 
        type="button"
        onClick={() => onProcess(task.AW_Id)}
        disabled={isProcessing}
        className={cn(
          "w-full xl:w-auto bg-blue-600 text-white px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black text-[9px] md:text-[10px] tracking-widest border-none cursor-pointer hover:bg-white hover:text-blue-700 transition-all shadow-xl flex items-center justify-center gap-2 md:gap-3 lg:gap-4 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400",
          isProcessing && "opacity-50 cursor-not-allowed active:scale-100"
        )}
        aria-label={`Traiter la tâche: ${task.AW_Comment || 'En attente'}`}
        aria-busy={isProcessing}
      >
        {isProcessing ? (
          <><RefreshCw size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden lg:inline">TRAITEMENT...</span></>
        ) : (
          <><ArrowRightCircle size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden lg:inline">TRAITER L&apos;ÉTAPE</span></>
        )}
      </button>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function WorkflowsMasterPage() {
  const [tasks, setTasks] = useState<IWorkflowTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<IWorkflowTask[]>('/workflows/tasks');
      setTasks(Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []));
    } catch (error) {
      console.error('❌ Erreur chargement workflows:', error);
      toast.error("Rupture de liaison avec le Noyau Workflows Master.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isMounted) fetchTasks(); }, [fetchTasks, isMounted]);

  const handleProcessTask = async (taskId: string) => {
    setIsProcessing(taskId);
    const toastId = toast.loading("Scellage cryptographique de la décision...");
    try {
      await apiClient.post(`/workflows/tasks/${taskId}/approve`);
      toast.success("Décision scellée dans le registre SMI.", { id: toastId });
      fetchTasks();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Échec du scellage de la décision.", { id: toastId });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleTaskKeyDown = (e: KeyboardEvent<HTMLDivElement>, taskId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleProcessTask(taskId);
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

  const handleOpenDesigner = () => {
    setIsDesignerOpen(true);
  };

  const handleCloseDesigner = () => {
    setIsDesignerOpen(false);
  };

  const handleDesignerSuccess = () => {
    setIsDesignerOpen(false);
    fetchTasks();
  };

  if (!isMounted) {
    return null;
  }

  // Dynamic import du WorkflowDesigner pour éviter circular dependency
  const WorkflowDesigner = isDesignerOpen 
    ? require('@/components/workflows/WorkflowDesigner').default as React.ComponentType<WorkflowDesignerProps>
    : null;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 md:gap-3 text-blue-400 text-[9px] md:text-[10px] tracking-widest mb-2 md:mb-3">
            <ShieldCheck size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" /> 
            Qualisoft Decision Engine §4.4
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl xl:text-6xl tracking-tighter leading-none m-0 italic">
            Noyau <span className="text-blue-400">Workflows</span>
          </h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest mt-2 md:mt-3 m-0" role="img" aria-label="Formule de cycle de vie BPMN">
            Modélisation BPMN : L_cycle = Σ(T_end - T_start) / N
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button 
            type="button"
            onClick={fetchTasks}
            disabled={loading}
            className="p-2 md:p-3 lg:p-4 bg-white/5 border border-white/10 rounded-lg md:rounded-xl hover:text-blue-400 transition-all cursor-pointer shadow-xl flex justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            aria-label="Actualiser les tâches"
          >
            <RefreshCw size={16} className={cn("w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5", loading ? "animate-spin" : "")} aria-hidden="true" />
          </button>
          <button 
            type="button"
            onClick={handleOpenDesigner}
            className="flex-1 xl:flex-none bg-blue-600 hover:bg-white hover:text-blue-700 px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] tracking-widest border-none cursor-pointer shadow-xl transition-all flex items-center justify-center gap-2 md:gap-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Configurer les flux de travail"
          >
            <Settings2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
            <span className="hidden sm:inline">CONFIGURER FLUX</span>
          </button>
        </div>
      </header>

      {/* 🧩 MAIN CONTENT */}
      <main className="flex-1 overflow-hidden flex flex-col px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 gap-4 md:gap-6 lg:gap-8">
        
        {/* KPI GRID */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 shrink-0 animate-in slide-in-from-bottom-6" role="list" aria-label="Indicateurs de performance workflow">
          <Metric title="En Attente" value={stats.pendingCount} icon={Clock} color="amber" formula="Tâches Pending" />
          <Metric title="Clôturés" value={stats.completedCount} icon={CheckCircle2} color="emerald" formula="Approbations" />
          <Metric title="Critiques" value={stats.bottlenecks} icon={AlertCircle} color="red" formula="Priority High" />
          <Metric title="Vélocité" value={stats.velocity} icon={GitMerge} color="blue" formula="Cycle moyen" />
        </section>

        {/* DECISION QUEUE */}
        <article 
          className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-4 md:p-6 lg:p-8 lg:p-10 flex flex-col shadow-2xl backdrop-blur-md overflow-hidden animate-in slide-in-from-bottom-12"
          aria-labelledby="queue-title"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-10 shrink-0">
            <h3 id="queue-title" className="text-lg md:text-xl lg:text-2xl font-black italic flex items-center gap-3 md:gap-4 text-emerald-400 tracking-tighter m-0 leading-none">
              <Play className="fill-emerald-400 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" size={24} aria-hidden="true" /> 
              File d&apos;Attente Décisionnelle
            </h3>
            <div className="bg-blue-600/10 border border-blue-500/20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl flex items-center gap-2 md:gap-3" role="status">
              <Activity size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-blue-400 animate-pulse" aria-hidden="true" />
              <span className="text-[8px] md:text-[9px] text-blue-400 tracking-widest italic">SDE REAL-TIME MONITORING</span>
            </div>
          </div>
          
          <div 
            className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-4 space-y-3 md:space-y-4 lg:space-y-6" 
            role="list"
            aria-label="Liste des tâches en attente"
          >
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4 md:gap-6" role="status" aria-live="polite">
                <RefreshCw className="animate-spin text-blue-400 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" strokeWidth={1} aria-hidden="true" />
                <span className="text-[9px] md:text-[10px] tracking-widest animate-pulse">Sync Noyau Décisionnel...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-4 md:gap-6" role="status">
                 <Layers size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20" strokeWidth={0.5} aria-hidden="true" />
                 <div className="space-y-1 md:space-y-2">
                   <p className="text-xl md:text-2xl font-black tracking-widest italic m-0">Registre Vierge</p>
                   <p className="text-[9px] md:text-[10px] m-0">Aucun arbitrage SMI requis à ce stade.</p>
                 </div>
              </div>
            ) : (
              tasks.map((task: IWorkflowTask) => (
                <TaskCard 
                  key={task.AW_Id} 
                  task={task}
                  isProcessing={isProcessing === task.AW_Id}
                  onProcess={handleProcessTask}
                  onKeyDown={handleTaskKeyDown}
                />
              ))
            )}
          </div>
        </article>
      </main>

      {/* FOOTER */}
      <footer className="shrink-0 px-4 md:px-6 py-3 md:py-4 lg:py-6 bg-black/40 border-t border-white/5 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6" role="contentinfo">
         <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-500 text-[9px] md:text-[10px] tracking-widest italic">
            <Cpu size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-blue-400" aria-hidden="true" />
            <span>Algorithme de Maturité : M = (A_clôture / A_requis) × 100</span>
         </div>
         <span className="text-[8px] md:text-[9px] text-slate-700 tracking-widest">QUALISOFT MASTER CORE v6.0</span>
      </footer>

      {/* WORKFLOW DESIGNER MODAL */}
      {isDesignerOpen && WorkflowDesigner && (
        <WorkflowDesigner 
          entityId="ROOT-FLOW" 
          entityType="ACTION" 
          onClose={handleCloseDesigner} 
          onSuccess={handleDesignerSuccess}
        />
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}