/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🚀 MODULE : HUB D'AMÉLIORATION CONTINUE SOUVERAIN (ISO 9001 §10)
 * RÔLE : Consolidation totale des modules Actions, PAQ et PDCA
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useEffect, useCallback, useMemo, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  Target, ShieldAlert, ClipboardCheck, List, Plus, Filter, TrendingUp,
  Clock, CheckCircle2, AlertCircle, ArrowRight, Search, LayoutGrid, 
  Loader2, RefreshCcw, Zap, Activity, Kanban, ChevronRight, X, Calendar
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { format, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type ActionStatus = 'A_FAIRE' | 'EN_COURS' | 'A_VALIDER' | 'TERMINEE' | 'NON_EFFICACE' | 'ANNULEE' | 'EN_RETARD';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL';
export type ActionOrigin = 'AUDIT' | 'NON_CONFORMITE' | 'RECLAMATION' | 'REVUE_DIRECTION' | 'COPIL' | 'RISQUE' | 'SSE' | 'OBJECTIF' | 'LEGAL' | 'ALERTE' | 'AUTRE';
export type ActionType = 'CORRECTIVE' | 'PREVENTIVE' | 'AMELIORATION';

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Actif?: boolean;
}

export interface PAQ {
  PAQ_Id: string;
  PAQ_Title: string;
  PAQ_Description?: string;
  PAQ_Year: number;
  PAQ_Status: string;
  PAQ_Budget?: number;
  PAQ_DateCloture?: string;
  PAQ_IsActive: boolean;
  PAQ_ProcessusId: string;
  PAQ_QualityManagerId: string;
  PAQ_CreatedAt: string;
  PAQ_UpdatedAt: string;
}

export interface Action {
  ACT_Id: string;
  ACT_Title: string;
  ACT_Description?: string;
  ACT_Origin: ActionOrigin;
  ACT_Type: ActionType;
  ACT_Status: ActionStatus;
  ACT_Priority: Priority;
  ACT_IsActive: boolean;
  ACT_CreatedAt: string;
  ACT_Deadline?: string;
  ACT_CompletedAt?: string;
  ACT_UpdatedAt: string;
  ACT_ResponsableId: string;
  ACT_CreatorId: string;
  ACT_PAQId: string;
  ACT_NCId?: string;
  ACT_ReclamationId?: string;
  ACT_AuditId?: string;
  ACT_MeetingId?: string;
  ACT_SSEEventId?: string;
  ACT_RiskId?: string;
  ACT_Responsable?: User;
}

interface ImprovementStats {
  total: number;
  completed: number;
  late: number;
  efficiency: number;
}

interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Vue Globale', icon: TrendingUp },
  { id: 'registry', label: 'Registre CAPA', icon: List },
  { id: 'my-tasks', label: 'Mes Tâches', icon: ShieldAlert },
  { id: 'paq', label: 'Programmes PAQ', icon: ClipboardCheck },
  { id: 'priorities', label: 'Matrice Eisenhower', icon: Target },
];

const STATUS_COLORS: Record<ActionStatus, string> = {
  TERMINEE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  A_FAIRE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  EN_COURS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  A_VALIDER: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  NON_EFFICACE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  ANNULEE: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  EN_RETARD: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

// ============================================================================
// SOUS-COMPOSANT : LOADING MATRIX
// ============================================================================

function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <Loader2 className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : STAT CARD
// ============================================================================

interface StatCardProps {
  title: string;
  val: string | number;
  trend: string;
  icon: React.ElementType;
  color: 'blue' | 'rose' | 'emerald' | 'amber';
}

function StatCard({ title, val, trend, icon: Icon, color }: StatCardProps) {
  const themes: Record<StatCardProps['color'], string> = { 
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20", 
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20", 
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", 
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20" 
  };
  
  return (
    <article className="bg-[#0F172A] border-2 border-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl flex flex-col justify-between shadow-2xl group hover:scale-[1.02] transition-all text-left focus-within:ring-2 focus-within:ring-blue-400">
      <div className={cn("w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center mb-6 md:mb-8 border shadow-inner", themes[color])}>
        <Icon size={20} className="w-5 h-5 md:w-7 md:h-7" aria-hidden="true" />
      </div>
      <div className="flex items-end justify-between">
        <div className="min-w-0">
          <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mb-1 md:mb-2 italic m-0 leading-none">{title}</p>
          <p className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none text-white m-0 truncate">{val}</p>
        </div>
        <span className="text-[8px] md:text-[9px] font-black uppercase px-3 md:px-4 py-1.5 md:py-2 bg-white/5 rounded-xl italic tracking-widest text-slate-500 shadow-inner">{trend}</span>
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : REGISTRY TABLE
// ============================================================================

interface RegistryTableProps {
  actions: Action[];
  users: User[];
  router: ReturnType<typeof useRouter>;
}

function RegistryTable({ actions, users, router }: RegistryTableProps) {
  return (
    <div className="bg-[#0F172A]/80 border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md" role="region" aria-label="Registre des actions CAPA">
      <table className="w-full text-left border-collapse" role="table">
        <thead className="bg-black/40 text-[8px] md:text-[9px] text-slate-500 italic tracking-widest uppercase border-b border-white/5">
          <tr>
            <th className="p-6 md:p-8" scope="col">Réf / Désignation</th>
            <th className="p-6 md:p-8" scope="col">Responsable</th>
            <th className="p-6 md:p-8" scope="col">Statut SDE</th>
            <th className="p-6 md:p-8 text-right" scope="col">Échéance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {actions.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-16 md:p-20 text-center text-slate-700 italic tracking-widest" role="status">
                Aucune donnée détectée dans le nœud.
              </td>
            </tr>
          ) : (
            actions.map((a) => {
              const resp = users.find((u) => u.U_Id === a.ACT_ResponsableId);
              const isDone = a.ACT_Status === 'TERMINEE';
              return (
                <tr 
                  key={a.ACT_Id} 
                  onClick={() => router.push(`/dashboard/actions/${a.ACT_Id}`)} 
                  className="hover:bg-blue-600/5 transition-all cursor-pointer group focus-within:bg-blue-600/5"
                  role="row"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/dashboard/actions/${a.ACT_Id}`); }}
                  aria-label={`Action: ${a.ACT_Title}`}
                >
                  <td className="p-6 md:p-8">
                    <span className="text-[8px] md:text-[9px] text-blue-400 font-black mb-1 md:mb-2 block tracking-widest italic">{a.ACT_Id.slice(-8)}</span>
                    <p className="text-base md:text-lg font-black text-white m-0 truncate group-hover:text-blue-400">{a.ACT_Title}</p>
                  </td>
                  <td className="p-6 md:p-8 text-[10px] md:text-[11px] font-bold text-slate-400 italic">
                    {resp ? `${resp.U_FirstName} ${resp.U_LastName}` : 'Non assigné'}
                  </td>
                  <td className="p-6 md:p-8">
                    <span className={cn("px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black border uppercase italic", STATUS_COLORS[a.ACT_Status])}>
                      {a.ACT_Status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-6 md:p-8 text-right text-[10px] md:text-[11px] font-black italic text-slate-500">
                    {a.ACT_Deadline ? format(new Date(a.ACT_Deadline), 'dd MMM yyyy', { locale: fr }) : '---'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : PAQ GRID
// ============================================================================

interface PAQGridProps {
  paqs: PAQ[];
}

function PAQGrid({ paqs }: PAQGridProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 lg:gap-10" role="list" aria-label="Programmes PAQ">
      {paqs.map((p) => (
        <article key={p.PAQ_Id} className="bg-[#0F172A] p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl border border-white/5 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-2xl group focus-within:border-emerald-500/30" role="listitem">
          <div>
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] md:text-[10px] px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-emerald-500/20 font-black">ANNÉE {p.PAQ_Year}</span>
              <ClipboardCheck className="text-emerald-500/30 group-hover:text-emerald-400 transition-colors w-8 h-8 md:w-10 md:h-10" aria-hidden="true" />
            </div>
            <h3 className="text-lg md:text-xl lg:text-2xl font-black text-white italic tracking-tighter uppercase m-0 leading-tight group-hover:text-emerald-400 truncate">{p.PAQ_Title}</h3>
            <p className="text-[10px] md:text-[11px] text-slate-500 mt-3 md:mt-4 italic font-bold normal-case leading-relaxed line-clamp-2">{p.PAQ_Description}</p>
          </div>
          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/5 flex justify-between items-center text-[9px] md:text-[10px] font-black italic tracking-widest text-slate-600">
             <span>STATUT: {p.PAQ_Status}</span>
             <ChevronRight size={14} className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </article>
      ))}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : EISENHOWER MATRIX
// ============================================================================

interface EisenhowerMatrixProps {
  actions: Action[];
  router: ReturnType<typeof useRouter>;
}

function EisenhowerMatrix({ actions, router }: EisenhowerMatrixProps) {
  const quadrants: Array<{ id: string; title: string; desc: string; color: string; filter: (a: Action) => boolean }> = [
    { id: 'q1', title: 'Action Immédiate', desc: 'Urgent & Critique', color: 'rose', filter: (a) => a.ACT_Priority === 'CRITICAL' || a.ACT_Priority === 'URGENT' },
    { id: 'q2', title: 'Planification', desc: 'Stratégique §6.2', color: 'blue', filter: (a) => a.ACT_Priority === 'HIGH' || a.ACT_Priority === 'MEDIUM' },
    { id: 'q3', title: 'Délégation', desc: 'Opérationnel §8', color: 'amber', filter: (a) => a.ACT_Priority === 'LOW' },
    { id: 'q4', title: 'Revue Post-Audit', desc: 'Bruit & Maintenance', color: 'slate', filter: (a) => !a.ACT_Priority },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 h-full" role="grid" aria-label="Matrice Eisenhower">
      {quadrants.map((q) => (
        <section key={q.id} className={cn("bg-white/2 border-2 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 transition-all flex flex-col shadow-2xl focus-within:ring-2 focus-within:ring-blue-400", `border-${q.color}-500/10 hover:border-${q.color}-500/40`)} role="gridcell" aria-labelledby={`${q.id}-title`}>
           <div className="flex justify-between items-start mb-6 md:mb-8">
              <div className="text-left">
                <h3 id={`${q.id}-title`} className={cn("text-lg md:text-xl lg:text-2xl font-black uppercase italic m-0 tracking-tighter", `text-${q.color}-400`)}>{q.title}</h3>
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1 md:mt-2">{q.desc}</p>
              </div>
              <span className="bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black">{actions.filter(q.filter).length}</span>
           </div>
           <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 custom-scrollbar pr-2 md:pr-4" role="list" aria-label={`Actions ${q.title}`}>
              {actions.filter(q.filter).map((a) => (
                <button 
                  key={a.ACT_Id} 
                  type="button"
                  onClick={() => router.push(`/dashboard/actions/${a.ACT_Id}`)} 
                  className="w-full text-left bg-black/40 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={`Voir l'action: ${a.ACT_Title}`}
                >
                   <p className="text-[10px] md:text-[11px] font-black uppercase italic m-0 truncate pr-4 md:pr-6 text-slate-400 group-hover:text-white">{a.ACT_Title}</p>
                   <ArrowRight size={14} className="w-3.5 h-3.5 text-slate-800 group-hover:text-blue-400" aria-hidden="true" />
                </button>
              ))}
              {actions.filter(q.filter).length === 0 && (
                <p className="text-[9px] md:text-[10px] text-slate-600 italic text-center py-4">Aucune action dans ce quadrant</p>
              )}
           </div>
        </section>
      ))}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ACTION MODAL
// ============================================================================

interface ActionModalProps {
  onClose: () => void;
  users: User[];
  onCreated: () => void;
}

function ActionModal({ onClose, users, onCreated }: ActionModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ACT_Title: '',
    ACT_ResponsableId: '',
    ACT_Deadline: '',
    ACT_Priority: 'MEDIUM' as Priority,
    ACT_Type: 'CORRECTIVE' as ActionType,
    ACT_Origin: 'AUTRE' as ActionOrigin,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.ACT_Title || !formData.ACT_ResponsableId || !formData.ACT_Deadline) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }
    
    setSubmitting(true);
    const toastId = toast.loading("DÉPLOIEMENT TACTIQUE...");
    try {
      await apiClient.post('/actions', {
        ...formData,
        ACT_Deadline: new Date(formData.ACT_Deadline).toISOString(),
      });
      toast.success("ACTION SCELLÉE §10.2", { id: toastId });
      onCreated();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "ÉCHEC DU SCELLAGE", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [onClose]);

  if (typeof window === 'undefined') return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0F172A] w-full max-w-4xl rounded-2xl md:rounded-3xl border border-blue-500/20 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-6 md:p-8 lg:p-10 border-b border-white/5 flex justify-between items-center shrink-0">
          <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl font-black m-0 tracking-tighter italic uppercase text-white">Nouveau <span className="text-blue-400">Scellage CAPA</span></h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-2xl hover:bg-rose-600 transition-all border-none cursor-pointer text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            aria-label="Fermer"
          >
            <X size={18} className="w-4.5 h-4.5 md:w-5 md:h-5" aria-hidden="true" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 md:p-8 lg:p-10 space-y-5 md:space-y-6 lg:space-y-8 overflow-y-auto custom-scrollbar italic font-black uppercase text-left">
          <div className="space-y-2">
             <label htmlFor="ACT_Title" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 md:ml-4 block">TITRE DE L&apos;ACTION *</label>
             <input 
               id="ACT_Title"
               required 
               name="ACT_Title" 
               value={formData.ACT_Title}
               onChange={handleChange}
               className="w-full bg-black/40 border border-white/10 p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl lg:rounded-3xl text-[11px] md:text-lg text-white outline-none focus:border-blue-500 italic uppercase" 
             />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div className="space-y-2 text-left">
               <label htmlFor="ACT_ResponsableId" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 md:ml-4 block">RESPONSABLE *</label>
               <select 
                 id="ACT_ResponsableId"
                 name="ACT_ResponsableId" 
                 value={formData.ACT_ResponsableId}
                 onChange={handleChange}
                 required
                 className="w-full bg-black/40 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] text-white outline-none italic uppercase cursor-pointer"
               >
                  <option value="" className="bg-[#0B0F1A] text-slate-500">Sélectionner...</option>
                  {users.filter(u => u.U_Actif !== false).map((u) => <option key={u.U_Id} value={u.U_Id} className="bg-[#0B0F1A]">{u.U_FirstName} {u.U_LastName}</option>)}
               </select>
            </div>
            <div className="space-y-2 text-left">
               <label htmlFor="ACT_Deadline" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 md:ml-4 block">DATE ÉCHÉANCE *</label>
               <input 
                 id="ACT_Deadline"
                 type="date" 
                 name="ACT_Deadline" 
                 value={formData.ACT_Deadline}
                 onChange={handleChange}
                 required
                 className="w-full bg-black/40 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] text-blue-400 font-black outline-none italic uppercase" 
               />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div className="space-y-2 text-left">
               <label htmlFor="ACT_Priority" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 md:ml-4 block">Priorité</label>
               <select 
                 id="ACT_Priority"
                 name="ACT_Priority" 
                 value={formData.ACT_Priority}
                 onChange={handleChange}
                 className="w-full bg-black/40 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] text-white outline-none italic uppercase cursor-pointer"
               >
                  <option value="LOW" className="bg-[#0B0F1A]">Basse</option>
                  <option value="MEDIUM" className="bg-[#0B0F1A]">Moyenne</option>
                  <option value="HIGH" className="bg-[#0B0F1A]">Élevée</option>
                  <option value="URGENT" className="bg-[#0B0F1A]">Urgente</option>
                  <option value="CRITICAL" className="bg-[#0B0F1A]">Critique</option>
               </select>
            </div>
            <div className="space-y-2 text-left">
               <label htmlFor="ACT_Type" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-2 md:ml-4 block">Type</label>
               <select 
                 id="ACT_Type"
                 name="ACT_Type" 
                 value={formData.ACT_Type}
                 onChange={handleChange}
                 className="w-full bg-black/40 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] text-white outline-none italic uppercase cursor-pointer"
               >
                  <option value="CORRECTIVE" className="bg-[#0B0F1A]">Corrective</option>
                  <option value="PREVENTIVE" className="bg-[#0B0F1A]">Préventive</option>
                  <option value="AMELIORATION" className="bg-[#0B0F1A]">Amélioration</option>
               </select>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={submitting} 
            className={cn(
              "w-full bg-blue-600 py-4 md:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-3xl font-black text-[9px] md:text-[10px] lg:text-xs tracking-widest hover:bg-white hover:text-blue-700 transition-all shadow-2xl border-none cursor-pointer flex items-center justify-center gap-2 md:gap-3 lg:gap-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-400",
              submitting && "opacity-70 cursor-wait"
            )}
            aria-busy={submitting}
          >
            {submitting ? (
              <><Loader2 size={16} className="w-4 h-4 animate-spin" aria-hidden="true" /> <span>SCELLAGE...</span></>
            ) : (
              <><Zap size={16} className="w-4 h-4" aria-hidden="true" /> <span>DÉPLOYER ACTION</span></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function UnifiedImprovementHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(searchParams?.get('tab') || 'overview');
  const [actions, setActions] = useState<Action[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [paqs, setPaqs] = useState<PAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const syncKernel = useCallback(async () => {
    try {
      setLoading(true);
      const [actionsRes, usersRes, paqsRes] = await Promise.all([
        apiClient.get<Action[]>('/actions'),
        apiClient.get<User[]>('/users'),
        apiClient.get<PAQ[]>('/paq')
      ]);
      
      setActions(Array.isArray(actionsRes.data) ? actionsRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setPaqs(Array.isArray(paqsRes.data) ? paqsRes.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement amélioration:', error);
      toast.error("RUPTURE DE LIAISON NOYAU : SYNC IMPOSSIBLE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') syncKernel(); }, [syncKernel]);

  const stats = useMemo((): ImprovementStats => {
    const total = actions.length;
    const completed = actions.filter(a => a.ACT_Status === 'TERMINEE').length;
    const late = actions.filter(a => a.ACT_Status !== 'TERMINEE' && a.ACT_Deadline && isPast(new Date(a.ACT_Deadline))).length;
    const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, late, efficiency };
  }, [actions]);

  const filteredActions = useMemo(() => {
    let result = actions.filter(a => 
      a.ACT_Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ACT_Id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (activeTab === 'my-tasks') {
      // Note: user should be typed properly in production
      result = result.filter(a => a.ACT_ResponsableId === (user as any)?.U_Id);
    }
    return result;
  }, [actions, searchTerm, activeTab, user]);

  const OverviewGrid = useCallback(({ stats: s }: { stats: ImprovementStats }) => (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 animate-in slide-in-from-bottom-8 duration-700" aria-label="Statistiques d'amélioration">
      <StatCard title="Actions Matrix" val={s.total} trend="SMI §10" icon={Activity} color="blue" />
      <StatCard title="Clôturées" val={s.completed} trend="Efficacité" icon={CheckCircle2} color="emerald" />
      <StatCard title="Retard Critique" val={s.late} trend="Alerte §10.2" icon={Clock} color="rose" />
      <StatCard title="Taux de Succès" val={`${s.efficiency}%`} trend="Performance" icon={TrendingUp} color="amber" />
    </section>
  ), []);

  if (loading && typeof window !== 'undefined') {
    return <LoadingMatrix label="Synchronisation intégrale §10..." />;
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#0B0F1A] text-white italic font-sans overflow-hidden relative selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 TOP COMMAND CENTER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-12 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 md:gap-6 lg:gap-8">
          <div className="space-y-3 md:space-y-4 w-full xl:w-auto">
            <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
              <div className="p-3 md:p-4 bg-blue-600 rounded-xl md:rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.3)] animate-pulse">
                <Target size={20} className="w-5 h-5 md:w-8 md:h-8" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0">Hub <span className="text-blue-400">Amélioration</span></h1>
                <p className="text-slate-500 text-[8px] md:text-[9px] lg:text-[10px] tracking-widest mt-2 md:mt-3 m-0 italic flex items-center gap-2 md:gap-3">
                  <Activity size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" aria-hidden="true" /> SYSTÈME INTÉGRÉ §10 • PDCA MATRIX CORE
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-96 group">
              <label htmlFor="action-search" className="sr-only">Rechercher une action</label>
              <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 pointer-events-none w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" />
              <input 
                id="action-search"
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                placeholder="RECHERCHER DANS LE REGISTRE..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-2.5 md:py-3 lg:py-5 pl-10 md:pl-14 pr-4 text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase outline-none focus:border-blue-500 transition-all text-white italic shadow-inner"
                aria-label="Filtrer les actions"
              />
            </div>
            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-white hover:text-blue-700 px-4 md:px-6 lg:px-8 lg:px-10 py-2.5 md:py-3 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl font-black text-[9px] md:text-[10px] lg:text-[11px] transition-all shadow-2xl border-none text-white cursor-pointer flex items-center gap-2 md:gap-3 lg:gap-4 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full xl:w-auto justify-center"
              aria-label="Créer une nouvelle action"
            >
              <Plus size={16} className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} aria-hidden="true" /> 
              <span className="hidden sm:inline">Action Rapide</span>
            </button>
          </div>
        </div>

        {/* 🧭 NAVIGATION TACTIQUE */}
        <nav className="mt-6 md:mt-8 lg:mt-12 flex gap-2 md:gap-3 lg:gap-4 overflow-x-auto pb-2 custom-scrollbar no-scrollbar" role="tablist" aria-label="Navigation des vues d'amélioration">
          {TABS.map((tab) => (
            <button 
              key={tab.id} 
              type="button"
              onClick={() => setActiveTab(tab.id)} 
              className={cn(
                "flex items-center gap-2 md:gap-3 lg:gap-4 px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] lg:text-[10px] transition-all border-none italic whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-2xl' : 'text-slate-500 hover:text-white bg-white/5'
              )}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
            >
              <tab.icon size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* 📜 ZONE DE TRAVAIL */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-12 py-4 md:py-6 lg:py-12 space-y-6 md:space-y-8 lg:space-y-12">
        {activeTab === 'overview' && <OverviewGrid stats={stats} />}
        {(activeTab === 'registry' || activeTab === 'my-tasks') && <RegistryTable actions={filteredActions} users={users} router={router} />}
        {activeTab === 'paq' && <PAQGrid paqs={paqs} />}
        {activeTab === 'priorities' && <EisenhowerMatrix actions={actions} router={router} />}
      </main>

      {/* 🧾 MODALE */}
      {isModalOpen && <ActionModal onClose={() => setIsModalOpen(false)} users={users} onCreated={syncKernel} />}

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(37,99,235,0.3);border-radius:10px}.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}