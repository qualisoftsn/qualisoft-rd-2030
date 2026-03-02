/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🎯 MODULE : PILOTAGE DES OBJECTIFS QUALITÉ (§6.2)
 * -------------------------------------------------------------------------
 * RÔLE : Définition, suivi et mesure des objectifs stratégiques du SMI.
 * NORME : ISO 9001:2015 Clause 6.2.
 * ARCHITECTURE : Zéro NextAuth • Client API Sécurisé • Isolation Data.
 * DESIGN : Elite Dark Industrial • Glassmorphism • UI Dense.
 * FIX : Cast strict Boolean pour la condition `isOverdue` (Ts-Error).
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 12:20 GMT
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import {
  Target, CheckCircle2, XCircle, Clock, AlertTriangle,
  Plus, Search, Calendar, User, RefreshCw, Trash2,
  Edit3, ChevronRight, Flag, Activity, LayoutGrid, List, X,
  Save, BarChart2, Download
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { format, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import type {
  QualityObjective as QualityObjectiveType,
  User as UserType,
  Processus as ProcessusType
} from '@/types/elite-sde';

// --- 🛠️ UTILITAIRES MATRIX ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

export default function QualityObjectivesPage() {
  // --- 💾 ÉTATS DU NOYAU ---
  const [objectives, setObjectives] = useState<QualityObjectiveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<QualityObjectiveType | null>(null);
  const [filters, setFilters] = useState({ status: 'ALL', search: '' });
  
  // Référentiels
  const [users, setUsers] = useState<UserType[]>([]);
  const [processes, setProcesses] = useState<ProcessusType[]>([]);

  // --- 📡 CHARGEMENT DES RÉFÉRENTIELS (SANS NEXTAUTH) ---
  useEffect(() => {
    const loadReferentials = async () => {
      try {
        const [uRes, pRes] = await Promise.all([
          apiClient.get<UserType[]>('/users'),
          apiClient.get<ProcessusType[]>('/processes'),
        ]);
        setUsers(uRes.data || []);
        setProcesses(pRes.data || []);
      } catch (err) {
        toast.error('ÉCHEC DE CONNEXION AUX RÉFÉRENTIELS');
      }
    };
    loadReferentials();
  }, []);

  // --- 📡 SYNCHRONISATION DES OBJECTIFS ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filters.status !== 'ALL') params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const res = await apiClient.get<QualityObjectiveType[]>('/quality-objectives', { params });
      setObjectives(res.data || []);
    } catch (error) {
      toast.error('RUPTURE DE LIAISON AVEC LE REGISTRE DES OBJECTIFS');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- ⚡ MISE À JOUR RAPIDE DE LA PROGRESSION ---
  const handleQuickProgress = async (id: string, progress: number) => {
    try {
      await apiClient.patch(`/quality-objectives/${id}/progress`, { progress });
      toast.success(`PROGRESSION SCELLÉE À ${progress}%`);
      fetchData();
    } catch (e) {
      toast.error('ÉCHEC DE LA SYNCHRONISATION');
    }
  };

  // --- 🗑️ ARCHIVAGE MATRICIEL ---
  const handleDelete = async (id: string) => {
    if (!confirm("ALERTE SDE : Archiver cet objectif stratégique ?\n\nL'enregistrement sera conservé pour la traçabilité d'audit (§7.5).")) return;
    try {
      await apiClient.delete(`/quality-objectives/${id}`);
      toast.success('OBJECTIF ARCHIVÉ AVEC SUCCÈS');
      fetchData();
    } catch (e) {
      toast.error('ÉCHEC : DÉPENDANCES DÉTECTÉES');
    }
  };

  // --- 📊 MOTEUR STATISTIQUE EN TEMPS RÉEL ---
  const stats = useMemo(() => {
    const total = objectives.length;
    const active = objectives.filter(o => o.QO_Status === 'EN_COURS' || o.QO_Status === 'BROUILLON').length;
    const achieved = objectives.filter(o => o.QO_Status === 'ATTEINT').length;
    const overdue = objectives.filter(
      o => Boolean(o.QO_Status !== 'ATTEINT' && o.QO_Status !== 'ANNULE' && o.QO_Deadline && isPast(new Date(o.QO_Deadline)))
    ).length;
    const avg = total > 0 ? Math.round(objectives.reduce((acc, o) => acc + o.QO_Progress, 0) / total) : 0;
    
    return { total, active, achieved, overdue, avg };
  }, [objectives]);

  // --- RENDU COCKPIT ---
  if (loading) {
    return (
      <div className="ml-0 lg:ml-72 flex min-h-screen items-center justify-center bg-[#0B0F1A]">
        <div className="text-center text-blue-500 font-black uppercase tracking-[0.5em] animate-pulse">
          <RefreshCw className="h-10 w-10 animate-spin mx-auto mb-4" />
          Synchronisation Stratégique...
        </div>
      </div>
    );
  }

  return (
    <div className="ml-0 lg:ml-72 bg-[#0B0F1A] min-h-screen p-8 lg:p-12 text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔮 EFFET MATRICIEL DE FOND */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent_60%)] pointer-events-none z-0" />

      <div className="mx-auto max-w-7xl relative z-10 space-y-10">
        
        {/* 🔝 HEADER STRATÉGIQUE */}
        <header className="border-b border-white/5 pb-10 mt-12 lg:mt-0 animate-in fade-in slide-in-from-top-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="rounded-xl bg-blue-600/10 border border-blue-500/20 px-4 py-1.5 text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                  <Target size={12} /> ISO 9001:2015 §6.2
                </span>
                <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                  {stats.active} ACTIFS
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-none m-0">
                Pilotage <span className="text-blue-600">Objectifs</span>
              </h1>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Définition, suivi et mesure de l&apos;efficacité du Système de Management
              </p>
            </div>

            <button
              onClick={() => { setSelectedObjective(null); setModalMode('create'); }}
              className="flex items-center justify-center gap-3 rounded-4xl bg-blue-600 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-3xl shadow-blue-900/40 hover:bg-white hover:text-blue-600 transition-all border-none cursor-pointer"
            >
              <Plus size={16} /> Déployer Objectif
            </button>
          </div>

          {/* 📊 KPI CARDS SDE */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <KPIStat title="Volume" value={stats.total} icon={Target} color="slate" />
            <KPIStat title="En Cours" value={stats.active} icon={Activity} color="blue" />
            <KPIStat title="Atteints" value={stats.achieved} icon={CheckCircle2} color="emerald" />
            <KPIStat title="En Retard" value={stats.overdue} icon={AlertTriangle} color={stats.overdue > 0 ? 'red' : 'slate'} alert={stats.overdue > 0} />
            
            <div className="rounded-[2.5rem] bg-slate-900/40 p-6 backdrop-blur-md border border-white/5 shadow-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">Progression Globale</p>
                <BarChart2 className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex items-end gap-3 mb-3">
                <p className="text-4xl font-black text-white m-0 leading-none">{stats.avg}%</p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-blue-600 shadow-[0_0_10px_#2563eb] transition-all duration-1000" style={{ width: `${stats.avg}%` }} />
              </div>
            </div>
          </div>
        </header>

        {/* 🔍 BARRE DE RECHERCHE & CONTRÔLES */}
        <div className="rounded-[2.5rem] bg-slate-900/40 shadow-2xl border border-white/5 backdrop-blur-md p-4 lg:p-6 animate-in fade-in zoom-in-95">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher cible, titre..."
                className="w-full rounded-full border border-white/10 bg-black/40 py-3 pl-12 pr-6 text-xs font-bold uppercase tracking-widest text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none transition-all"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex rounded-full border border-white/10 bg-black/40 p-1">
                <button onClick={() => setViewMode('grid')} className={cn('flex items-center gap-2 rounded-full px-5 py-2 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border-none', viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-slate-500 hover:text-white')}>
                  <LayoutGrid size={14} /> <span className="hidden sm:inline">Grille</span>
                </button>
                <button onClick={() => setViewMode('list')} className={cn('flex items-center gap-2 rounded-full px-5 py-2 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border-none', viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-slate-500 hover:text-white')}>
                  <List size={14} /> <span className="hidden sm:inline">Liste</span>
                </button>
              </div>
              <button onClick={fetchData} className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer" title="Actualiser">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 🗂️ VUE GRILLE SDE */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 animate-in slide-in-from-bottom-8">
            {objectives.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-white/10 bg-slate-900/20 py-24 backdrop-blur-sm">
                <div className="rounded-full bg-white/5 p-6 mb-6">
                  <Target className="h-10 w-10 text-slate-600" />
                </div>
                <p className="text-sm font-black uppercase tracking-[0.5em] text-white">Aucun objectif défini</p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">Iso 9001 requiert des objectifs documentés</p>
              </div>
            ) : (
              objectives.map((obj) => (
                <ObjectiveCard
                  key={obj.QO_Id}
                  objective={obj}
                  users={users}
                  processes={processes}
                  onQuickProgress={handleQuickProgress}
                  onEdit={() => { setSelectedObjective(obj); setModalMode('edit'); }}
                  onDelete={() => handleDelete(obj.QO_Id)}
                />
              ))
            )}
          </div>
        )}

        {/* 📋 VUE LISTE SDE */}
        {viewMode === 'list' && (
          <div className="rounded-[2.5rem] bg-[#151A2D]/80 shadow-2xl border border-white/5 overflow-hidden backdrop-blur-md animate-in slide-in-from-bottom-8">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full text-left">
                <thead className="bg-black/40 border-b border-white/5">
                  <tr>
                    {['OBJECTIF', 'CIBLE', 'PILOTE', 'ÉCHÉANCE', 'PROGRESSION', 'STATUT', 'ACTIONS'].map(h => (
                      <th key={h} className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {objectives.map((obj) => {
                    const isOverdue = Boolean(obj.QO_Status !== 'ATTEINT' && obj.QO_Status !== 'ANNULE' && obj.QO_Deadline && isPast(new Date(obj.QO_Deadline)));
                    const owner = users.find(u => u.U_Id === obj.QO_OwnerId);
                    
                    return (
                      <tr key={obj.QO_Id} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-5">
                          <div className="text-xs font-black text-white uppercase">{obj.QO_Title}</div>
                          <div className="mt-1 text-[9px] font-bold text-slate-500 uppercase line-clamp-1">{obj.QO_Description}</div>
                        </td>
                        <td className="px-8 py-5 text-[10px] font-black text-blue-400 uppercase">{obj.QO_Target}</td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-white border border-white/10">
                              {owner?.U_FirstName?.[0] || '?'}
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 uppercase">
                              {owner ? `${owner.U_LastName}` : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                            <Calendar size={12} />
                            {obj.QO_Deadline ? format(new Date(obj.QO_Deadline), 'dd MMM yyyy', { locale: fr }) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="w-24 flex items-center gap-3">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                              <div className={cn("h-full rounded-full shadow-[0_0_10px_currentColor]", obj.QO_Progress >= 100 ? 'bg-emerald-500 text-emerald-500' : 'bg-blue-600 text-blue-600')} style={{ width: `${Math.min(obj.QO_Progress, 100)}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 w-8">{obj.QO_Progress}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap"><StatusBadge status={obj.QO_Status} isOverdue={isOverdue} /></td>
                        <td className="px-8 py-5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => { setSelectedObjective(obj); setModalMode('edit'); }} className="text-slate-500 hover:text-blue-500 transition-colors bg-transparent border-none cursor-pointer"><Edit3 size={16} /></button>
                            <button onClick={() => handleDelete(obj.QO_Id)} className="text-slate-500 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🧾 MODAL SOUVERAIN DE CRÉATION/ÉDITION */}
        {modalMode && (
          <ObjectiveModal
            mode={modalMode}
            objective={selectedObjective}
            users={users}
            processes={processes}
            onClose={() => { setModalMode(null); setSelectedObjective(null); }}
            onRefresh={fetchData}
          />
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </div>
  );
}

// ============================================================================
// COMPOSANTS SDE MATRIX
// ============================================================================

function KPIStat({ title, value, icon: Icon, color, alert = false }: any) {
  const c: any = { 
    slate: 'text-slate-400 bg-slate-800/50 border-slate-700', 
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.2)]', 
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]', 
    red: 'text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
  };

  return (
    <div className={cn("rounded-[2.5rem] bg-slate-900/40 p-6 backdrop-blur-md border shadow-xl flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1", alert ? 'border-red-500/50 animate-pulse' : 'border-white/5')}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 m-0">{title}</p>
        <div className={cn('rounded-xl p-3 border', c[color])}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-4xl font-black text-white m-0 leading-none">{value}</p>
    </div>
  );
}

function StatusBadge({ status, isOverdue }: { status: any, isOverdue: boolean }) {
  const config: any = {
    'BROUILLON': { label: 'BROUILLON', class: 'bg-slate-800 text-slate-400 border-slate-700' },
    'EN_COURS': { label: 'EN COURS', class: 'bg-blue-600/10 text-blue-400 border-blue-500/20' },
    'ATTEINT': { label: 'ATTEINT', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    'NON_ATTEINT': { label: 'ÉCHEC', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
    'REPORTE': { label: 'REPORTÉ', class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    'ANNULE': { label: 'ANNULÉ', class: 'bg-gray-800 text-gray-500 border-gray-700' },
  };
  const c = isOverdue && status !== 'ATTEINT' ? { label: 'EN RETARD', class: 'bg-red-600/20 text-red-500 border-red-500/40 animate-pulse' } : config[status] || config['BROUILLON'];
  
  return <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${c.class}`}>{c.label}</span>;
}

function ObjectiveCard({ objective, users, processes, onQuickProgress, onEdit, onDelete }: any) {
  const isOverdue = Boolean(objective.QO_Status !== 'ATTEINT' && objective.QO_Status !== 'ANNULE' && objective.QO_Deadline && isPast(new Date(objective.QO_Deadline)));
  const owner = users.find((u: any) => u.U_Id === objective.QO_OwnerId);
  const process = processes.find((p: any) => p.PR_Id === objective.QO_ProcessusId);

  return (
    <div className="group rounded-[2.5rem] bg-[#151A2D]/80 border border-white/5 p-8 transition-all duration-300 hover:border-blue-500/30 hover:bg-[#1a2030] shadow-2xl backdrop-blur-xl flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-6">
          <StatusBadge status={objective.QO_Status} isOverdue={isOverdue} />
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="text-slate-500 hover:text-blue-500 bg-transparent border-none cursor-pointer"><Edit3 size={16} /></button>
            <button onClick={onDelete} className="text-slate-500 hover:text-red-500 bg-transparent border-none cursor-pointer"><Trash2 size={16} /></button>
          </div>
        </div>

        <h3 className="text-xl font-black text-white uppercase leading-tight mb-3 line-clamp-2">{objective.QO_Title}</h3>
        {objective.QO_Description && <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed line-clamp-2 mb-6">{objective.QO_Description}</p>}

        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-300 mb-8 bg-black/30 p-4 rounded-2xl border border-white/5">
          <Flag size={14} className="text-blue-500" /> <span className="text-slate-500 tracking-widest">Cible:</span> <span className="text-blue-400">{objective.QO_Target}</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Progression</span>
          <span className="text-xl font-black text-white leading-none">{objective.QO_Progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/50 mb-6">
          <div className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor]", objective.QO_Progress >= 100 ? 'bg-emerald-500 text-emerald-500' : 'bg-blue-600 text-blue-600')} style={{ width: `${Math.min(objective.QO_Progress, 100)}%` }} />
        </div>

        {(objective.QO_Status === 'EN_COURS' || objective.QO_Status === 'BROUILLON') && (
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[25, 50, 75, 100].map(p => (
              <button key={p} onClick={() => onQuickProgress(objective.QO_Id, p)} className="rounded-xl bg-white/5 border border-white/10 py-2 text-[10px] font-black text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all cursor-pointer">
                {p}%
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-slate-400">
            <User size={12} className="text-slate-500" /> {owner ? `${owner.U_FirstName} ${owner.U_LastName}` : 'NON ASSIGNÉ'}
          </div>
          <div className={cn("flex items-center gap-3 text-[10px] font-bold uppercase", isOverdue ? 'text-red-500' : 'text-slate-400')}>
            <Calendar size={12} className={isOverdue ? "text-red-500" : "text-slate-500"} /> {objective.QO_Deadline ? format(new Date(objective.QO_Deadline), 'dd MMM yyyy', { locale: fr }) : 'SANS ÉCHÉANCE'}
          </div>
        </div>
      </div>
    </div>
  );
}

function ObjectiveModal({ mode, objective, users, processes, onClose, onRefresh }: any) {
  const [form, setForm] = useState({
    QO_Title: objective?.QO_Title || '',
    QO_Description: objective?.QO_Description || '',
    QO_Target: objective?.QO_Target || '',
    QO_Deadline: objective?.QO_Deadline ? format(new Date(objective.QO_Deadline), 'yyyy-MM-dd') : '',
    QO_OwnerId: objective?.QO_OwnerId || '',
    QO_ProcessusId: objective?.QO_ProcessusId || '',
    QO_Status: objective?.QO_Status || 'BROUILLON',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.QO_Title.trim() || !form.QO_Target.trim() || !form.QO_Deadline || !form.QO_OwnerId || !form.QO_ProcessusId) {
      return toast.error("VEUILLEZ REMPLIR TOUS LES CHAMPS OBLIGATOIRES");
    }

    setSubmitting(true);
    const tid = toast.loading("SCELLAGE DE L'OBJECTIF...");
    try {
      if (mode === 'create') {
        await apiClient.post('/quality-objectives', form);
      } else {
        await apiClient.patch(`/quality-objectives/${objective.QO_Id}`, form);
      }
      toast.success(mode === 'create' ? "OBJECTIF DÉPLOYÉ" : "OBJECTIF MIS À JOUR", { id: tid });
      onRefresh();
      onClose();
    } catch (err: any) {
      toast.error("ÉCHEC D'ÉCRITURE KERNEL", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0B0F1A]/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 w-full max-w-3xl rounded-[4rem] p-10 shadow-4xl text-left relative overflow-hidden">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer"><X size={32} /></button>
        
        <div className="flex items-center gap-5 mb-10 border-b border-white/5 pb-8">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50"><Target size={32} className="text-white" /></div>
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter m-0 leading-none">{mode === 'create' ? 'Nouvel Objectif' : 'Édition Objectif'}</h2>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2 m-0">Traçabilité ISO 9001 §6.2</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Intitulé de l&apos;Objectif *</label>
            <input required type="text" value={form.QO_Title} onChange={e => setForm({...form, QO_Title: e.target.value.toUpperCase()})} className="w-full mt-2 bg-black/40 border border-white/10 rounded-3xl p-5 text-sm font-black italic text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 uppercase" placeholder="EX: RÉDUIRE LE TAUX DE NON-CONFORMITÉS..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Cible / Indicateur *</label>
              <input required type="text" value={form.QO_Target} onChange={e => setForm({...form, QO_Target: e.target.value})} className="w-full mt-2 bg-black/40 border border-white/10 rounded-3xl p-5 text-sm font-black italic text-blue-400 outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 uppercase" placeholder="EX: < 2% AVANT DÉCEMBRE" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Échéance SDE *</label>
              <input required type="date" value={form.QO_Deadline} onChange={e => setForm({...form, QO_Deadline: e.target.value})} className="w-full mt-2 bg-black/40 border border-white/10 rounded-3xl p-5 text-sm font-black italic text-white outline-none focus:border-blue-500 transition-all uppercase scheme-dark" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Pilote Responsable *</label>
              <select required value={form.QO_OwnerId} onChange={e => setForm({...form, QO_OwnerId: e.target.value})} className="w-full mt-2 bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase italic text-white outline-none focus:border-blue-500 cursor-pointer appearance-none">
                <option value="">AFFECTATION...</option>
                {users.filter((u: any) => u.U_IsActive).map((u: any) => <option key={u.U_Id} value={u.U_Id}>{u.U_FirstName} {u.U_LastName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Processus Lié *</label>
              <select required value={form.QO_ProcessusId} onChange={e => setForm({...form, QO_ProcessusId: e.target.value})} className="w-full mt-2 bg-black/50 border border-white/10 rounded-2xl p-4 text-xs font-black uppercase italic text-white outline-none focus:border-blue-500 cursor-pointer appearance-none">
                <option value="">RATHECHEMENT...</option>
                {processes.filter((p: any) => p.PR_IsActive).map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] ml-4">Stratégie & Ressources (Optionnel)</label>
            <textarea rows={3} value={form.QO_Description} onChange={e => setForm({...form, QO_Description: e.target.value})} className="w-full mt-2 bg-black/40 border border-white/10 rounded-3xl p-5 text-xs font-bold italic text-slate-300 outline-none focus:border-blue-500 transition-all uppercase resize-none placeholder:text-slate-800" placeholder="MOYENS ALLOUÉS, MÉTHODOLOGIE..." />
          </div>

          <button type="submit" disabled={submitting} className="w-full py-6 rounded-[2.5rem] bg-blue-600 hover:bg-white hover:text-blue-600 text-white font-black uppercase italic text-xs tracking-widest shadow-3xl shadow-blue-900/40 transition-all border-none cursor-pointer mt-8 flex items-center justify-center gap-3">
            {submitting ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} Sceller l&apos;Objectif
          </button>
        </form>
      </div>
    </div>
  );
}