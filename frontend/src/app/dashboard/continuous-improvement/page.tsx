/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 MODULE : REGISTRE D'AMÉLIORATION CONTINUE (HUB) - elite-sde
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage PDCA (Plan-Do-Check-Act) §10.2 ISO 9001.
 * FIX : Layout 100dvh, Zéro Scroll Global, Intégration Eisenhower, PWA.
 * SÉCURITÉ : Zéro NextAuth, API Client Souverain.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 03:12 GMT
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import { differenceInDays, format, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast, Toaster } from 'sonner';
import {
  AlertCircle, AlertTriangle, BarChart3, Calendar,
  CheckCircle2, Clock, Download, FileText, Filter,
  LayoutGrid, List, Plus, RefreshCcw,
  Search, ShieldCheck, Target, Users, Activity,
  Loader2, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';

// --- TYPES & UTILS ---
type ViewMode = 'kanban' | 'list' | 'matrix';
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function ContinuousImprovementHub() {
  const router = useRouter();
  const { user } = useAuthStore() as any;

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ source: 'ALL', status: 'ALL', priority: 'ALL' });

  const loadActions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/continuous-improvement/actions');
      const data = res.data?.data || res.data;
      setActions(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("FLUX INTERROMPU : ERREUR DE SYNCHRONISATION REGISTRE.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadActions(); }, [loadActions]);

  const filtered = useMemo(() => {
    return actions.filter(a => {
      const matchSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.reference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filters.status === 'ALL' || a.status === filters.status;
      return matchSearch && matchStatus;
    });
  }, [actions, searchTerm, filters]);

  const stats = useMemo(() => ({
    total: actions.length,
    active: actions.filter(a => ['A_FAIRE', 'EN_COURS'].includes(a.status)).length,
    late: actions.filter(a => isPast(new Date(a.deadline)) && a.status !== 'TERMINEE').length,
    done: actions.filter(a => a.status === 'TERMINEE').length,
  }), [actions]);

  if (loading && actions.length === 0) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
      <Loader2 className="animate-spin text-blue-500" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] italic text-blue-500 animate-pulse">Extraction PDCA Matrix...</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] text-white italic font-sans overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER CLICKUP */}
      <header className="shrink-0 p-6 md:px-10 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0">
        <div className="flex items-center gap-8 w-full xl:w-auto">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic m-0">Amélioration <span className="text-blue-600">Continue</span></h1>
            <p className="text-slate-500 text-[9px] font-black uppercase mt-2 tracking-[0.3em] m-0 italic flex items-center gap-2">
              <Activity size={12} className="text-blue-500" /> §10 ISO 9001 • PERFORMANCE SYSTÉMIQUE
            </p>
          </div>
          <div className="hidden xl:flex gap-4 border-l border-white/10 pl-8">
            <KPIStatSmall label="Actives" val={stats.active} color="blue" />
            <KPIStatSmall label="En Retard" val={stats.late} color="red" />
            <KPIStatSmall label="Efficacité" val={`${Math.round((stats.done / (stats.total || 1)) * 100)}%`} color="emerald" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
          <div className="relative flex-1 xl:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="RECHERCHER ACTION..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-all text-white italic shadow-inner"
            />
          </div>
          <button 
            onClick={() => router.push('/dashboard/continuous-improvement/new')}
            className="bg-blue-600 hover:bg-white hover:text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase italic border-none text-white cursor-pointer active:scale-95 transition-all shadow-xl shadow-blue-900/20 flex items-center gap-3"
          >
            <Plus size={18} strokeWidth={3} /> Nouvelle Action
          </button>
        </div>
      </header>

      {/* 🎛️ TOOLBAR VUES */}
      <nav className="shrink-0 px-6 py-3 border-b border-white/5 bg-black/20 flex flex-wrap justify-between items-center gap-4">
        <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
          <ViewBtn active={viewMode === 'kanban'} icon={LayoutGrid} label="Kanban" onClick={() => setViewMode('kanban')} />
          <ViewBtn active={viewMode === 'list'} icon={List} label="Liste" onClick={() => setViewMode('list')} />
          <ViewBtn active={viewMode === 'matrix'} icon={Target} label="Eisenhower" onClick={() => setViewMode('matrix')} />
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase italic text-slate-400 hover:text-white transition-all border-none cursor-pointer">
            <Download size={14} /> Exporter Rapport
          </button>
          <button onClick={loadActions} className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-blue-500 transition-all border-none cursor-pointer"><RefreshCcw size={16}/></button>
        </div>
      </nav>

      {/* 📜 ZONE D'OCCUPATION INTÉGRALE (Isolated Scroll) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 bg-[#0B0F1A]">
        {viewMode === 'kanban' && <KanbanMatrix actions={filtered} router={router} />}
        {viewMode === 'list' && <ListDense actions={filtered} router={router} />}
        {viewMode === 'matrix' && (
          <div className="space-y-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-black uppercase italic mb-4">Matrice de Décision Eisenhower</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-loose">Priorisation des actions correctives selon l&apos;urgence et l&apos;importance stratégique §10.2.</p>
              

[Image of Eisenhower Decision Matrix]

            </div>
            <EisenhowerGrid actions={filtered} router={router} />
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37,99,235,0.2); border-radius: 10px; }` }} />
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

const KPIStatSmall = ({ label, val, color }: any) => {
  const themes: any = { blue: "text-blue-500", red: "text-red-500", emerald: "text-emerald-500" };
  return (
    <div className="flex flex-col items-start">
      <span className="text-[18px] font-black italic text-white leading-none">{val}</span>
      <span className={cn("text-[8px] font-black uppercase tracking-widest mt-1", themes[color])}>{label}</span>
    </div>
  );
};

const ViewBtn = ({ active, icon: Icon, label, onClick }: any) => (
  <button onClick={onClick} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase italic transition-all border-none cursor-pointer", active ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}>
    <Icon size={14} /> <span className="hidden sm:inline">{label}</span>
  </button>
);

function KanbanMatrix({ actions, router }: any) {
  const columns = [
    { id: 'A_FAIRE', title: 'À Faire', color: 'slate' },
    { id: 'EN_COURS', title: 'En Cours', color: 'blue' },
    { id: 'A_VALIDER', title: 'Validation', color: 'amber' },
    { id: 'TERMINEE', title: 'Clôturée', color: 'emerald' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full min-h-150">
      {columns.map(col => (
        <div key={col.id} className="flex-1 min-w-75 flex flex-col bg-white/2 rounded-[2.5rem] border border-white/5 p-4 shadow-2xl">
          <div className="flex justify-between items-center px-4 py-3 mb-4">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-2">
               <span className={cn("w-2 h-2 rounded-full", `bg-${col.color}-500`)} /> {col.title}
             </h3>
             <span className="bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-bold">{actions.filter((a:any) => a.status === col.id).length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar">
            {actions.filter((a:any) => a.status === col.id).map((action: any) => (
              <ActionCard key={action.id} action={action} onClick={() => router.push(`/dashboard/continuous-improvement/${action.id}`)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionCard({ action, onClick }: any) {
  const isLate = isPast(new Date(action.deadline)) && action.status !== 'TERMINEE';
  return (
    <div onClick={onClick} className="bg-[#0F172A] border border-white/5 rounded-2xl p-5 hover:border-blue-500/30 transition-all cursor-pointer group shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic">{action.reference}</span>
        <div className={cn("w-2 h-2 rounded-full", action.priority === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-slate-700')} />
      </div>
      <h4 className="text-xs font-black uppercase italic text-white m-0 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">{action.title}</h4>
      <div className="mt-6 flex justify-between items-center">
        <div className="flex -space-x-2">
           <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-[#0F172A] flex items-center justify-center text-[9px] font-black">{action.responsible.lastName[0]}</div>
        </div>
        <div className={cn("text-[8px] font-black px-2 py-1 rounded-md uppercase", isLate ? "bg-red-500 text-white" : "bg-white/5 text-slate-400")}>
          {isLate ? "RETARD" : format(new Date(action.deadline), "dd MMM", { locale: fr })}
        </div>
      </div>
    </div>
  );
}

function ListDense({ actions, router }: any) {
  return (
    <div className="bg-[#151A2D] border border-white/5 rounded-3xl overflow-hidden shadow-4xl">
      <table className="w-full text-left border-collapse">
        <thead className="bg-black/20 border-b border-white/10">
          <tr className="text-[9px] text-slate-500 italic font-black uppercase tracking-[0.2em]">
            <th className="px-6 py-4">Référence</th>
            <th className="px-6 py-4">Action Corrective</th>
            <th className="px-6 py-4">Pilote</th>
            <th className="px-6 py-4">Statut</th>
            <th className="px-6 py-4 text-right">Échéance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {actions.map((a: any) => (
            <tr key={a.id} onClick={() => router.push(`/dashboard/continuous-improvement/${a.id}`)} className="hover:bg-blue-600/5 transition-all cursor-pointer group">
              <td className="px-6 py-4 text-[9px] font-black text-blue-500 uppercase italic">{a.reference}</td>
              <td className="px-6 py-4">
                <p className="text-[11px] font-black uppercase text-white m-0 italic group-hover:text-blue-400">{a.title}</p>
              </td>
              <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{a.responsible.firstName} {a.responsible.lastName}</td>
              <td className="px-6 py-4">
                <span className="text-[8px] font-black uppercase px-3 py-1 bg-white/5 rounded-full border border-white/5">{a.status}</span>
              </td>
              <td className="px-6 py-4 text-right text-[10px] font-black italic">{format(new Date(a.deadline), 'dd/MM/yyyy')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EisenhowerGrid({ actions, router }: any) {
  const quadrants = [
    { id: 'q1', title: 'DÉCIDER (Immédiat)', desc: 'Urgent & Important', color: 'red', filter: (a:any) => ['CRITICAL', 'HIGH'].includes(a.priority) && isPast(new Date(a.deadline)) },
    { id: 'q2', title: 'PLANIFIER (Stratégie)', desc: 'Non-Urgent & Important', color: 'blue', filter: (a:any) => ['HIGH', 'MEDIUM'].includes(a.priority) && !isPast(new Date(a.deadline)) },
    { id: 'q3', title: 'DÉLÉGUER (Opérations)', desc: 'Urgent & Non-Important', color: 'amber', filter: (a:any) => a.priority === 'LOW' && isPast(new Date(a.deadline)) },
    { id: 'q4', title: 'ÉLIMINER (Revue)', desc: 'Non-Urgent & Non-Important', color: 'slate', filter: (a:any) => a.priority === 'LOW' && !isPast(new Date(a.deadline)) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {quadrants.map(q => (
        <div key={q.id} className={cn("bg-white/2 border-2 rounded-[2.5rem] p-8 transition-all flex flex-col", `border-${q.color}-500/20 hover:border-${q.color}-500/50`)}>
           <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className={cn("text-xl font-black uppercase italic m-0", `text-${q.color}-400`)}>{q.title}</h3>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">{q.desc}</p>
              </div>
              <span className="bg-white/5 px-3 py-1 rounded-xl text-xs font-black">{actions.filter(q.filter).length}</span>
           </div>
           <div className="space-y-3 flex-1 overflow-y-auto max-h-75 custom-scrollbar pr-2">
              {actions.filter(q.filter).map((a:any) => (
                <div key={a.id} onClick={() => router.push(`/dashboard/continuous-improvement/${a.id}`)} className="bg-[#0F172A] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 cursor-pointer flex items-center justify-between group">
                  <p className="text-[10px] font-black uppercase italic m-0 truncate pr-4">{a.title}</p>
                  <ArrowRight size={14} className="text-slate-700 group-hover:text-blue-500 transition-all" />
                </div>
              ))}
           </div>
        </div>
      ))}
    </div>
  );
}