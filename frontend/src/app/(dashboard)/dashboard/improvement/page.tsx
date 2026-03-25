/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🚀 MODULE : HUB D'AMÉLIORATION CONTINUE SOUVERAIN (ELITE-SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Consolidation totale des modules Actions, PAQ et PDCA.
 * ISO : Alignement strict ISO 9001 §10.2, 14001 §10.2, 45001 §10.2.
 * DESIGN : 100dvh, Dark Matrix, High-Density, Zero Global Scroll.
 * DATA : 100% Temps Réel (Nexus PostgreSQL via apiClient).
 * ---------------------------------------------------------------------------
 * DATE : 06 Mars 2026 | 01:15 GMT
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import { 
  Target, ShieldAlert, ClipboardCheck, List, Plus, Filter, TrendingUp,
  Clock, CheckCircle2, AlertCircle, ArrowRight, Search, LayoutGrid, 
  Loader2, RefreshCcw, Zap, Activity, Kanban, ChevronRight, X, Calendar
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { format, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

// Référentiel Types Elite-SDE
import { Action, ActionStatus, Priority, ActionOrigin, ActionType, User, PAQ } from '@/types/elite-sde';
import { cn } from '@/core/utils/cn';

export default function UnifiedImprovementHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore() as any;
  
  // --- ÉTATS DU NOYAU ---
  const [activeTab, setActiveTab] = useState<string>(searchParams?.get('tab') || 'overview');
  const [actions, setActions] = useState<Action[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [paqs, setPaqs] = useState<PAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- CHARGEMENT SYNCHRONE DU NEXUS ---
  const syncKernel = useCallback(async () => {
    try {
      setLoading(true);
      const [actionsRes, usersRes, paqsRes] = await Promise.all([
        apiClient.get('/actions'),
        apiClient.get('/users'),
        apiClient.get('/paq')
      ]);
      
      setActions(Array.isArray(actionsRes.data?.data) ? actionsRes.data.data : actionsRes.data || []);
      setUsers(Array.isArray(usersRes.data?.data) ? usersRes.data.data : usersRes.data || []);
      setPaqs(Array.isArray(paqsRes.data?.data) ? paqsRes.data.data : paqsRes.data || []);
    } catch (err) {
      toast.error("RUPTURE DE LIAISON NOYAU : SYNC IMPOSSIBLE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { syncKernel(); }, [syncKernel]);

  // --- LOGIQUE DE FILTRAGE & STATS ---
  const stats = useMemo(() => {
    const total = actions.length;
    const completed = actions.filter(a => a.ACT_Status === ActionStatus.TERMINEE).length;
    const late = actions.filter(a => a.ACT_Status !== ActionStatus.TERMINEE && a.ACT_Deadline && isPast(new Date(a.ACT_Deadline))).length;
    const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, late, efficiency };
  }, [actions]);

  const filteredActions = useMemo(() => {
    let result = actions.filter(a => 
      a.ACT_Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ACT_Id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (activeTab === 'my-tasks') result = result.filter(a => a.ACT_ResponsableId === user?.U_Id);
    return result;
  }, [actions, searchTerm, activeTab, user]);

  if (loading) return <LoadingMatrix label="Synchronisation intégrale §10..." />;

  return (
    <div className="h-full w-full flex flex-col bg-[#0B0F1A] text-white italic font-black uppercase overflow-hidden relative">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 TOP COMMAND CENTER (Header ClickUp) */}
      <header className="shrink-0 p-8 lg:p-12 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.3)] animate-pulse">
                <Target size={32} />
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl tracking-tighter leading-none m-0">Hub <span className="text-blue-600">Amélioration</span></h1>
                <p className="text-slate-500 text-[10px] tracking-[0.4em] mt-3 m-0 italic flex items-center gap-3">
                  <Activity size={14} className="text-blue-600" /> SYSTÈME INTÉGRÉ §10 • PDCA MATRIX CORE
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 w-full xl:w-auto">
            <div className="relative flex-1 xl:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500" size={18} />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="RECHERCHER DANS LE REGISTRE..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-[11px] font-black uppercase outline-none focus:border-blue-600 transition-all text-white italic shadow-inner"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-3xl font-black text-[11px] transition-all shadow-4xl border-none text-white cursor-pointer flex items-center gap-4 active:scale-95"
            >
              <Plus size={20} strokeWidth={4} /> Action Rapide
            </button>
          </div>
        </div>

        {/* 🧭 NAVIGATION TACTIQUE (Tabs) */}
        <nav className="mt-12 flex gap-4 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
          {[
            { id: 'overview', label: 'Vue Globale', icon: TrendingUp },
            { id: 'registry', label: 'Registre CAPA', icon: List },
            { id: 'my-tasks', label: 'Mes Tâches', icon: ShieldAlert },
            { id: 'paq', label: 'Programmes PAQ', icon: ClipboardCheck },
            { id: 'priorities', label: 'Matrice Eisenhower', icon: Target },
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={cn(
                "flex items-center gap-4 px-8 py-4 rounded-2xl text-[10px] transition-all border-none italic whitespace-nowrap cursor-pointer",
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-2xl' : 'text-slate-500 hover:text-white bg-white/5'
              )}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* 📜 ZONE DE TRAVAIL (Isolated Scroll) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 space-y-12">
        {activeTab === 'overview' && <OverviewGrid stats={stats} actions={actions} />}
        {activeTab === 'registry' && <RegistryTable actions={filteredActions} users={users} router={router} />}
        {activeTab === 'my-tasks' && <RegistryTable actions={filteredActions} users={users} router={router} />}
        {activeTab === 'paq' && <PAQGrid paqs={paqs} />}
        {activeTab === 'priorities' && <EisenhowerMatrix actions={actions} router={router} />}
      </main>

      {/* 🧾 MODALE D'INDEXATION RAPIDE (Héritage Actions-Tab) */}
      {isModalOpen && <ActionModal onClose={() => setIsModalOpen(false)} users={users} onCreated={syncKernel} />}

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS DE HAUTE DENSITÉ
// ============================================================================

function OverviewGrid({ stats }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 animate-in slide-in-from-bottom-8 duration-700">
      <StatCard title="Actions Matrix" val={stats.total} trend="SMI §10" icon={Activity} color="blue" />
      <StatCard title="Clôturées" val={stats.completed} trend="Efficacité" icon={CheckCircle2} color="emerald" />
      <StatCard title="Retard Critique" val={stats.late} trend="Alerte §10.2" icon={Clock} color="rose" />
      <StatCard title="Taux de Succès" val={`${stats.efficiency}%`} trend="Performance" icon={TrendingUp} color="amber" />
    </div>
  );
}

function RegistryTable({ actions, users, router }: any) {
  return (
    <div className="bg-[#0F172A]/80 border border-white/5 rounded-[3rem] overflow-hidden shadow-4xl backdrop-blur-md">
      <table className="w-full text-left border-collapse">
        <thead className="bg-black/40 text-[10px] text-slate-500 italic tracking-[0.3em] uppercase border-b border-white/5">
          <tr>
            <th className="p-8">Réf / Désignation</th>
            <th className="p-8">Responsable</th>
            <th className="p-8">Statut SDE</th>
            <th className="p-8 text-right">Échéance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {actions.length === 0 ? (
            <tr><td colSpan={4} className="p-20 text-center text-slate-700 italic tracking-widest">Aucune donnée détectée dans le nœud.</td></tr>
          ) : (
            actions.map((a: any) => {
              const resp = users.find((u: any) => u.U_Id === a.ACT_ResponsableId);
              return (
                <tr key={a.ACT_Id} onClick={() => router.push(`/dashboard/actions/${a.ACT_Id}`)} className="hover:bg-blue-600/5 transition-all cursor-pointer group">
                  <td className="p-8">
                    <span className="text-[9px] text-blue-500 font-black mb-2 block tracking-widest italic">{a.ACT_Id.slice(-8)}</span>
                    <p className="text-lg font-black text-white m-0 truncate group-hover:text-blue-400">{a.ACT_Title}</p>
                  </td>
                  <td className="p-8 text-[11px] font-bold text-slate-400 italic">
                    {resp ? `${resp.U_FirstName} ${resp.U_LastName}` : 'Non assigné'}
                  </td>
                  <td className="p-8">
                    <span className={cn(
                      "px-4 py-2 rounded-xl text-[9px] font-black border uppercase italic",
                      a.ACT_Status === ActionStatus.TERMINEE ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    )}>
                      {a.ACT_Status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-8 text-right text-[11px] font-black italic text-slate-500">
                    {a.ACT_Deadline ? format(new Date(a.ACT_Deadline), 'dd MMM yyyy', { locale: fr }) : '---'}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function PAQGrid({ paqs }: { paqs: PAQ[] }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      {paqs.map(p => (
        <div key={p.PAQ_Id} className="bg-[#151B2B] p-10 rounded-[3.5rem] border border-white/5 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-4xl group">
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-4 py-2 rounded-xl border border-emerald-500/20 font-black">ANNÉE {p.PAQ_Year}</span>
              <ClipboardCheck className="text-emerald-500/30 group-hover:text-emerald-500 transition-colors" size={40} />
            </div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase m-0 leading-tight group-hover:text-emerald-400">{p.PAQ_Title}</h3>
            <p className="text-slate-500 text-xs mt-4 italic font-bold normal-case leading-relaxed">{p.PAQ_Description}</p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-black italic tracking-widest text-slate-600">
             <span>STATUT: {p.PAQ_Status}</span>
             <ChevronRight />
          </div>
        </div>
      ))}
    </div>
  );
}

function EisenhowerMatrix({ actions, router }: any) {
  const quadrants = [
    { id: 'q1', title: 'Action Immédiate', desc: 'Urgent & Critique', color: 'rose', filter: (a:any) => a.ACT_Priority === 'CRITICAL' || a.ACT_Priority === 'URGENT' },
    { id: 'q2', title: 'Planification', desc: 'Stratégique §6.2', color: 'blue', filter: (a:any) => a.ACT_Priority === 'HIGH' || a.ACT_Priority === 'MEDIUM' },
    { id: 'q3', title: 'Délégation', desc: 'Opérationnel §8', color: 'amber', filter: (a:any) => a.ACT_Priority === 'LOW' },
    { id: 'q4', title: 'Revue Post-Audit', desc: 'Bruit & Maintenance', color: 'slate', filter: (a:any) => !a.ACT_Priority },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {quadrants.map(q => (
        <div key={q.id} className={cn("bg-white/2 border-2 rounded-[3.5rem] p-10 transition-all flex flex-col shadow-4xl", `border-${q.color}-500/10 hover:border-${q.color}-500/40`)}>
           <div className="flex justify-between items-start mb-8">
              <div className="text-left">
                <h3 className={cn("text-2xl font-black uppercase italic m-0 tracking-tighter", `text-${q.color}-500`)}>{q.title}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">{q.desc}</p>
              </div>
              <span className="bg-white/5 px-4 py-2 rounded-xl text-xs font-black">{actions.filter(q.filter).length}</span>
           </div>
           <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-4">
              {actions.filter(q.filter).map((a:any) => (
                <div key={a.ACT_Id} onClick={() => router.push(`/dashboard/actions/${a.ACT_Id}`)} className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer flex items-center justify-between group">
                   <p className="text-[11px] font-black uppercase italic m-0 truncate pr-6 text-slate-300 group-hover:text-white">{a.ACT_Title}</p>
                   <ArrowRight size={16} className="text-slate-800 group-hover:text-blue-500" />
                </div>
              ))}
           </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ATOMIQUES & MODALES
// ============================================================================

function StatCard({ title, val, trend, icon: Icon, color }: any) {
  const themes: any = { blue: "text-blue-500 bg-blue-500/10 border-blue-500/20", rose: "text-rose-500 bg-rose-500/10 border-rose-500/20", emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", amber: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
  return (
    <div className="bg-[#151B2B] border-2 border-white/5 p-8 rounded-[3.5rem] flex flex-col justify-between shadow-4xl group hover:scale-[1.02] transition-all text-left">
      <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-8 border shadow-inner", themes[color])}><Icon size={28} /></div>
      <div className="flex items-end justify-between">
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 tracking-widest mb-2 italic m-0 leading-none">{title}</p>
          <p className="text-5xl font-black italic tracking-tighter leading-none text-white m-0 truncate">{val}</p>
        </div>
        <span className="text-[9px] font-black uppercase px-4 py-2 bg-white/5 rounded-xl italic tracking-widest text-slate-500 shadow-inner">{trend}</span>
      </div>
    </div>
  );
}

function ActionModal({ onClose, users, onCreated }: any) {
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const tid = toast.loading("DÉPLOIEMENT TACTIQUE...");
    try {
      const formData = new FormData(e.target);
      await apiClient.post('/actions', Object.fromEntries(formData));
      toast.success("ACTION SCELLÉE §10.2", { id: tid });
      onCreated();
      onClose();
    } catch { toast.error("ÉCHEC DU SCELLAGE", { id: tid }); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-200 flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="bg-[#0F172A] w-full max-w-4xl rounded-[4rem] border border-blue-500/20 shadow-4xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-10 border-b border-white/5 flex justify-between items-center shrink-0">
          <h2 className="text-3xl font-black m-0 tracking-tighter italic uppercase text-white">Nouveau <span className="text-blue-500">Scellage CAPA</span></h2>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-2xl hover:bg-rose-600 transition-all border-none cursor-pointer text-white"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar italic font-black uppercase text-left">
          <div className="space-y-3">
             <label className="text-[10px] text-slate-500 tracking-widest ml-4">TITRE DE L&apos;ACTION *</label>
             <input required name="ACT_Title" className="w-full bg-black/40 border border-white/10 p-8 rounded-[2.5rem] text-xl text-white outline-none focus:border-blue-500 italic uppercase" />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3 text-left">
               <label className="text-[10px] text-slate-500 tracking-widest ml-4">RESPONSABLE *</label>
               <select name="ACT_ResponsableId" className="w-full bg-black/40 border border-white/10 p-6 rounded-2xl text-[11px] text-white outline-none italic uppercase">
                  {users.map((u: any) => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
               </select>
            </div>
            <div className="space-y-3 text-left">
               <label className="text-[10px] text-slate-500 tracking-widest ml-4">DATE ÉCHÉANCE *</label>
               <input type="date" name="ACT_Deadline" className="w-full bg-black/40 border border-white/10 p-6 rounded-2xl text-[11px] text-blue-500 font-black outline-none italic uppercase" />
            </div>
          </div>
          <button disabled={submitting} className="w-full bg-blue-600 py-8 rounded-[3rem] font-black text-xs tracking-[0.5em] hover:bg-white hover:text-blue-600 transition-all shadow-4xl border-none cursor-pointer flex items-center justify-center gap-4 text-white">
            {submitting ? <Loader2 className="animate-spin" /> : <Zap fill="currentColor" />} {submitting ? "SCELLAGE..." : "DÉPLOYER ACTION"}
          </button>
        </form>
      </div>
    </div>
  );
}

function LoadingMatrix({ label }: { label: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 text-blue-500">
      <Loader2 className="animate-spin" size={60} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] animate-pulse italic text-center px-10">{label}</span>
    </div>
  );
}
