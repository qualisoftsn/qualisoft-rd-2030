/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Target, CheckCircle2, XCircle, Clock, AlertTriangle, 
  Plus, Search, Calendar, User, RefreshCw, Trash2, 
  Edit3, ChevronRight, Flag, Activity, LayoutGrid, List, X, 
  Save // ✅ Correction : Import de l'icône manquante
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, isPast } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** * Utilitaire de fusion de classes Tailwind 
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function QualityObjectivesPage() {
  const [objectives, setObjectives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<any>(null);
  const [filters, setFilters] = useState({ status: 'ALL', search: '' });

  // --- 🔄 SYNCHRONISATION NOYAU ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/quality-objectives', { 
        params: { 
          status: filters.status !== 'ALL' ? filters.status : undefined,
          search: filters.search || undefined
        } 
      });
      setObjectives(res.data);
    } catch (error) {
      toast.error("Échec de synchronisation avec le Noyau Master");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- ⚡ ACTIONS DE PERFORMANCE ---
  const handleQuickProgress = async (id: string, progress: number) => {
    try {
      toast.loading("Mise à jour du flux...", { id: 'prog-up' });
      await apiClient.patch(`/quality-objectives/${id}/progress`, { progress });
      toast.success("Progression enregistrée", { id: 'prog-up' });
      fetchData(); 
    } catch (e) {
      toast.error("Erreur de communication API", { id: 'prog-up' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment archiver cet enjeu stratégique ?")) return;
    try {
      await apiClient.delete(`/quality-objectives/${id}`);
      toast.success("Objectif archivé");
      fetchData();
    } catch (e) {
      toast.error("Suppression verrouillée par le système");
    }
  };

  // --- 📊 KPI TEMPS RÉEL ---
  const stats = useMemo(() => ({
    total: objectives.length,
    active: objectives.filter(o => o.QO_Status === 'EN_COURS').length,
    achieved: objectives.filter(o => o.QO_Status === 'ATTEINT').length,
    overdue: objectives.filter(o => o.QO_Status === 'EN_COURS' && isPast(new Date(o.QO_Deadline))).length,
    avg: objectives.length > 0 ? Math.round(objectives.reduce((acc, o) => acc + o.QO_Progress, 0) / objectives.length) : 0
  }), [objectives]);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 pb-24">
      
      {/* 🚀 HEADER STRATÉGIQUE */}
      <header className="sticky top-0 z-40 bg-[#0B0F1A]/95 backdrop-blur-3xl border-b border-white/5 px-12 py-10">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-7xl font-black uppercase tracking-tighter italic leading-none">
              Pilotage <span className="text-blue-600">Objectifs</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase mt-4 tracking-[0.5em] italic">
              Planification ISO 9001 • §6.2 Performance Globale
            </p>
          </div>
          <button 
            onClick={() => { setSelectedObjective(null); setModalMode('create'); }}
            className="bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-[2.5rem] font-black uppercase text-[12px] flex items-center gap-3 transition-all shadow-3xl shadow-blue-900/40 active:scale-95"
          >
            <Plus size={20} /> Nouvel Objectif
          </button>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <StatCard val={stats.total} label="Total" icon={Target} color="white" />
          <StatCard val={stats.active} label="En cours" icon={Activity} color="blue" />
          <StatCard val={stats.achieved} label="Atteints" icon={CheckCircle2} color="emerald" />
          <StatCard val={stats.overdue} label="En retard" icon={AlertTriangle} color="red" alert={stats.overdue > 0} />
          <div className="bg-[#151B2B] border border-white/5 rounded-[2.5rem] p-6 flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase text-slate-500 mb-2 italic">Moyenne SMI</span>
            <div className="flex items-center gap-3">
               <span className="text-3xl font-black italic text-blue-500">{stats.avg}%</span>
               <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${stats.avg}%` }} />
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-12 space-y-12">
        {/* RECHERCHE & VUES */}
        <div className="flex gap-6 items-center">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={22} />
            <input 
              type="text" value={filters.search} onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Explorer les enjeux stratégiques..."
              className="w-full bg-[#151B2B]/40 border border-white/5 rounded-[2.5rem] py-6 pl-16 pr-6 text-sm font-black uppercase italic outline-none focus:border-blue-500/30"
            />
          </div>
          <div className="flex bg-[#151B2B] rounded-2xl p-1 border border-white/5 shadow-inner">
             <button onClick={() => setViewMode('grid')} className={cn("p-3 rounded-xl transition-all", viewMode === 'grid' ? "bg-blue-600 text-white" : "text-slate-500")}><LayoutGrid size={20}/></button>
             <button onClick={() => setViewMode('list')} className={cn("p-3 rounded-xl transition-all", viewMode === 'list' ? "bg-blue-600 text-white" : "text-slate-500")}><List size={20}/></button>
          </div>
        </div>

        {/* GRILLE D'OBJECTIFS */}
        <div className={cn("gap-8", viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col")}>
          {loading ? (
             <div className="col-span-full py-20 flex flex-col items-center gap-4">
                <RefreshCw className="animate-spin text-blue-600" size={44} />
                <p className="text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Synchronisation du Noyau...</p>
             </div>
          ) : (
            objectives.map(obj => (
              <ObjectiveCard 
                key={obj.QO_Id} 
                obj={obj} 
                onQuickProgress={handleQuickProgress}
                onEdit={() => { setSelectedObjective(obj); setModalMode('edit'); }}
                onDelete={() => handleDelete(obj.QO_Id)}
              />
            ))
          )}
        </div>
      </main>

      {/* MODAL D'ÉDITION ÉLITE */}
      {modalMode && (
        <ObjectiveEntryModal 
          mode={modalMode}
          objective={selectedObjective}
          onClose={() => { setModalMode(null); setSelectedObjective(null); }}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}

// --- 🧩 SOUS-COMPOSANTS ---

function StatCard({ val, label, icon: Icon, color, alert }: any) {
  const themes: any = {
    white: "text-white bg-white/5 border-white/10",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20 animate-pulse"
  };
  return (
    <div className={cn("border rounded-[2.2rem] p-6 flex items-center gap-4 shadow-xl transition-all", themes[color])}>
      <Icon size={26} />
      <div>
        <p className="text-3xl font-black italic leading-none">{val}</p>
        <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">{label}</p>
      </div>
    </div>
  );
}

function ObjectiveCard({ obj, onQuickProgress, onEdit, onDelete }: any) {
  const isOverdue = obj.QO_Status === 'EN_COURS' && isPast(new Date(obj.QO_Deadline));
  
  return (
    <div className="bg-[#151B2B]/40 border border-white/5 rounded-[3.5rem] p-10 group hover:border-blue-500/30 transition-all flex flex-col justify-between shadow-2xl overflow-hidden relative">
      <div>
        <div className="flex justify-between items-start mb-8">
          <div className={cn(
            "px-4 py-1.5 rounded-full text-[8px] font-black uppercase italic border tracking-tighter",
            obj.QO_Status === 'ATTEINT' ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-400" : 
            isOverdue ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse" : "bg-blue-600/10 border-blue-600/30 text-blue-400"
          )}>
            {isOverdue ? "⚠️ RETARD CRITIQUE" : obj.QO_Status}
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
            <button onClick={onEdit} className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-blue-400 hover:bg-blue-600/10 transition-all"><Edit3 size={16}/></button>
            <button onClick={onDelete} className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-600/10 transition-all"><Trash2 size={16}/></button>
          </div>
        </div>

        <h3 className="text-2xl font-black uppercase italic text-white mb-4 leading-tight group-hover:text-blue-500 transition-colors duration-500">
          {obj.QO_Title}
        </h3>
        
        <div className="flex items-center gap-2 mb-8 text-[10px] font-bold text-slate-400 uppercase italic">
          <Flag size={14} className="text-blue-500" />
          <span className="tracking-tighter">Objectif : {obj.QO_Target}</span>
        </div>

        {/* PROGRESSION INTERACTIVE */}
        <div className="space-y-4 mb-10">
           <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest">
              <span className="text-slate-600">Réalisation</span>
              <span className="text-blue-500">{obj.QO_Progress}%</span>
           </div>
           <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px]", obj.QO_Progress >= 100 ? "bg-emerald-500 shadow-emerald-500/40" : "bg-blue-600 shadow-blue-600/40")} 
                style={{ width: `${obj.QO_Progress}%` }} 
              />
           </div>
           {obj.QO_Status === 'EN_COURS' && (
             <div className="flex gap-2">
                {[25, 50, 75, 100].map(p => (
                  <button 
                    key={p} 
                    onClick={() => onQuickProgress(obj.QO_Id, p)}
                    className="flex-1 py-2 rounded-xl bg-white/5 text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all border border-white/5"
                  >
                    {p}%
                  </button>
                ))}
             </div>
           )}
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase italic text-slate-500 tracking-tighter">
         <div className="flex items-center gap-2">
            <User size={14} className="text-blue-600" /> {obj.QO_Owner?.U_FirstName}
         </div>
         <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-600" /> {format(new Date(obj.QO_Deadline), 'MMM yyyy')}
         </div>
      </div>
    </div>
  );
}

function ObjectiveEntryModal({ mode, objective, onClose, onRefresh }: any) {
  const [form, setForm] = useState({
    QO_Title: objective?.QO_Title || '',
    QO_Description: objective?.QO_Description || '',
    QO_Target: objective?.QO_Target || '',
    QO_Deadline: objective?.QO_Deadline ? format(new Date(objective.QO_Deadline), 'yyyy-MM-dd') : '',
    QO_OwnerId: objective?.QO_OwnerId || '',
    QO_ProcessusId: objective?.QO_ProcessusId || ''
  });
  const [pilots, setPilots] = useState<any[]>([]);
  const [processus, setProcessus] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Récupération dynamique des référentiels (Souveraineté des données)
    apiClient.get('/users').then(res => setPilots(res.data));
    apiClient.get('/processus').then(res => setProcessus(res.data));
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'create') await apiClient.post('/quality-objectives', form);
      else await apiClient.patch(`/quality-objectives/${objective.QO_Id}`, form);
      
      toast.success("Enjeu stratégique synchronisé");
      onRefresh();
      onClose();
    } catch (e) {
      toast.error("Erreur d'écriture dans le Noyau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-3xl p-6">
      <div className="bg-[#151B2B] border border-white/10 w-full max-w-3xl rounded-[4.5rem] p-16 shadow-3xl animate-in zoom-in-95 duration-500">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-black uppercase italic flex items-center gap-4">
            <Target className="text-blue-600" size={36} /> 
            {mode === 'create' ? 'Définir' : 'Ajuster'} <span className="text-blue-600">Objectif</span>
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full text-slate-500"><X size={36}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
               <div className="col-span-2">
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-3 block italic tracking-widest">Énoncé Stratégique (SMART)</label>
                  <input required value={form.QO_Title} onChange={e => setForm({...form, QO_Title: e.target.value})} className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-xl font-black italic uppercase outline-none focus:border-blue-600 transition-all" placeholder="EX: RÉDUIRE LE TAUX DE REBUT..." />
               </div>
               <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-3 block italic tracking-widest">Valeur Cible</label>
                  <input required value={form.QO_Target} onChange={e => setForm({...form, QO_Target: e.target.value})} className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-sm font-black italic uppercase outline-none focus:border-blue-600" placeholder="EX: < 2% DU VOLUME GLOBAL" />
               </div>
               <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-3 block italic tracking-widest">Échéance Finale</label>
                  <input type="date" required value={form.QO_Deadline} onChange={e => setForm({...form, QO_Deadline: e.target.value})} className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-sm font-black italic uppercase outline-none focus:border-blue-600" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-3 block italic tracking-widest">Pilote (Autorité)</label>
                  <select required value={form.QO_OwnerId} onChange={e => setForm({...form, QO_OwnerId: e.target.value})} className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-sm font-black italic uppercase outline-none focus:border-blue-600 appearance-none">
                     <option value="">-- CHOISIR PILOTE --</option>
                     {pilots.map(p => <option key={p.U_Id} value={p.U_Id}>{p.U_FirstName} {p.U_LastName}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-3 block italic tracking-widest">Processus Support</label>
                  <select required value={form.QO_ProcessusId} onChange={e => setForm({...form, QO_ProcessusId: e.target.value})} className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 text-sm font-black italic uppercase outline-none focus:border-blue-600 appearance-none">
                     <option value="">-- TOUS PROCESSUS --</option>
                     {processus.map(pr => <option key={pr.PR_Id} value={pr.PR_Id}>{pr.PR_Code} - {pr.PR_Libelle}</option>)}
                  </select>
               </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-blue-600 py-7 rounded-[2.8rem] text-[14px] font-black uppercase italic shadow-2xl transition-all hover:bg-blue-500 active:scale-95 flex justify-center items-center gap-4">
            {submitting ? <RefreshCw className="animate-spin" /> : <Save size={24} />}
            Inscrire dans la trajectoire 2026
          </button>
        </form>
      </div>
    </div>
  );
}