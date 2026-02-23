/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 💡 CE QUE FAIT CETTE PAGE :
 * --------------------------
 * RÔLE : Centralise la définition, le suivi et la mesure de l'efficacité 
 * des objectifs stratégiques du Système de Management Intégré (SMI).
 * CONFORMITÉ : Répond strictement aux exigences du §6.2 de l'ISO 9001:2015.
 * FONCTIONNALITÉS ACTIVES :
 * - Calcul en temps réel de la progression globale (Score de réalisation).
 * - Moteur de filtrage et recherche par enjeux/pilotes.
 * - Validation stricte des formulaires (Anti-données corrompues).
 * - Vue double (Grille analytique et Liste).
 * - Mise à jour express de la progression (Quick Progress 25/50/75/100%).
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Target, CheckCircle2, XCircle, Clock, AlertTriangle, 
  Plus, Search, Calendar, User, RefreshCw, Trash2, 
  Edit3, ChevronRight, Flag, Activity, LayoutGrid, List, X, 
  Save, BarChart,
  ChevronDown
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { format, isPast, parseISO } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** * 🛠️ UTILITAIRE DE FUSION DE CLASSES (Tailwind SDE) 
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 🛡️ INTERFACES SCELLÉES (Référentiel elite-sde.ts) ---

export interface QualityObjective {
  QO_Id: string;
  QO_Title: string;
  QO_Description?: string;
  QO_Target: string;
  QO_Deadline: string;
  QO_Status: 'NOUVEAU' | 'EN_COURS' | 'ATTEINT' | 'COMPROMIS';
  QO_Progress: number;
  QO_OwnerId: string;
  QO_ProcessusId: string;
  QO_Owner?: { U_Id: string; U_FirstName: string; U_LastName: string };
  QO_Processus?: { PR_Id: string; PR_Code: string; PR_Libelle: string };
}

export interface UserBase {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
}

export interface ProcessusBase {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
}

export default function QualityObjectivesPage() {
  // --- 📦 ÉTATS DU COCKPIT SDE ---
  const [objectives, setObjectives] = useState<QualityObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<QualityObjective | null>(null);
  const [filters, setFilters] = useState({ status: 'ALL', search: '' });

  /**
   * 🔄 SYNCHRONISATION AVEC LE NOYAU MASTER
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<QualityObjective[]>('/quality-objectives', { 
        params: { 
          status: filters.status !== 'ALL' ? filters.status : undefined,
          search: filters.search || undefined
        } 
      });
      setObjectives(res.data);
    } catch (error) {
      toast.error("ÉCHEC DE SYNCHRONISATION AVEC LE NOYAU MASTER.");
      console.error("API_SYNC_ERROR:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * ⚡ MISE À JOUR RAPIDE DE LA PROGRESSION
   */
  const handleQuickProgress = async (id: string, progress: number) => {
    const tid = toast.loading("Mise à jour de la trajectoire...");
    try {
      await apiClient.patch(`/quality-objectives/${id}/progress`, { progress });
      toast.success(`PROGRESSION SCÈLLÉE À ${progress}%`, { id: tid });
      fetchData(); // Rafraîchissement global pour recalculer les statistiques
    } catch (e) {
      toast.error("ERREUR DE COMMUNICATION LORS DE LA MUTATION.", { id: tid });
    }
  };

  /**
   * 🗑️ ARCHIVAGE / SUPPRESSION SÉCURISÉE
   */
  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ VOULEZ-VOUS VRAIMENT ARCHIVER CET ENJEU STRATÉGIQUE ? (Action irréversible et tracée)")) return;
    try {
      await apiClient.delete(`/quality-objectives/${id}`);
      toast.success("OBJECTIF STRATÉGIQUE ARCHIVÉ.");
      fetchData();
    } catch (e) {
      toast.error("SUPPRESSION VERROUILLÉE : Des indicateurs dépendent de cet objectif.");
    }
  };

  /**
   * 📊 CALCULATEUR KPI TEMPS RÉEL
   */
  const stats = useMemo(() => {
    const total = objectives.length;
    const active = objectives.filter(o => o.QO_Status === 'EN_COURS' || o.QO_Status === 'NOUVEAU').length;
    const achieved = objectives.filter(o => o.QO_Status === 'ATTEINT').length;
    // Retard si en cours et date dépassée
    const overdue = objectives.filter(o => o.QO_Status !== 'ATTEINT' && o.QO_Deadline && isPast(new Date(o.QO_Deadline))).length;
    const avg = total > 0 ? Math.round(objectives.reduce((acc, o) => acc + o.QO_Progress, 0) / total) : 0;
    
    return { total, active, achieved, overdue, avg };
  }, [objectives]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F1A] text-white italic font-sans ml-80 selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🚀 HEADER STRATÉGIQUE : Titre et Actions Globales */}
      <header className="sticky top-0 z-40 bg-[#0B0F1A]/95 backdrop-blur-3xl border-b-4 border-white/5 px-16 py-12 shrink-0 shadow-2xl">
        <div className="flex justify-between items-end mb-12 text-left">
          <div className="space-y-4">
            <span className="px-6 py-2 rounded-2xl bg-blue-600/10 border-2 border-blue-600/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-4 italic shadow-inner w-fit">
               <Target size={16} className="animate-pulse" /> Master Planning
            </span>
            <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none m-0">
              Pilotage <span className="text-blue-600">Objectifs</span>
            </h1>
            <p className="text-slate-500 text-[12px] font-black uppercase tracking-[0.4em] italic m-0">
              TRAJECTOIRE STRATÉGIQUE 2026 • CONFORMITÉ ISO 9001:2015 §6.2
            </p>
          </div>
          <button 
            onClick={() => { setSelectedObjective(null); setModalMode('create'); }}
            className="bg-blue-600 hover:bg-blue-500 px-12 py-6 rounded-[3rem] font-black uppercase text-[12px] tracking-widest flex items-center gap-4 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.6)] active:scale-95 border-none cursor-pointer"
          >
            <Plus size={24} strokeWidth={3} /> Définir un enjeu
          </button>
        </div>

        {/* 📈 DASHBOARD FLASH : Statistiques clés */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatCard val={stats.total} label="Volume Total" icon={Target} color="white" />
          <StatCard val={stats.active} label="En Cours" icon={Activity} color="blue" />
          <StatCard val={stats.achieved} label="Atteints" icon={CheckCircle2} color="emerald" />
          <StatCard val={stats.overdue} label="En Retard" icon={AlertTriangle} color="red" alert={stats.overdue > 0} />
          
          <div className="bg-[#151A2D] border-2 border-white/5 rounded-[3rem] p-8 flex flex-col justify-center shadow-4xl backdrop-blur-3xl">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4 italic text-left">Indice de réalisation Global</span>
            <div className="flex items-center gap-6">
               <span className="text-5xl font-black italic text-blue-500 leading-none">{stats.avg}%</span>
               <div className="flex-1 h-3 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_20px_#2563eb]" 
                    style={{ width: `${stats.avg}%` }} 
                  />
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* 🛠️ ZONE DE FILTRAGE ET RECHERCHE */}
      <main className="flex-1 p-16 space-y-12">
        <div className="flex flex-col xl:flex-row gap-8 items-center bg-[#151A2D] p-6 rounded-[4rem] border-2 border-white/5 shadow-4xl">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={24} />
            <input 
              type="text" 
              value={filters.search} 
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="EXPLORER LES ENJEUX, PILOTES OU PROCESSUS..."
              className="w-full bg-black/40 border-2 border-white/5 rounded-[3rem] py-8 pl-24 pr-10 text-[13px] font-black uppercase italic outline-none focus:border-blue-600 transition-all placeholder:text-slate-600 shadow-inner"
            />
          </div>
          
          {/* Switcher de Vue (Grid/List) */}
          <div className="flex w-full xl:w-auto bg-black/40 rounded-[3rem] p-2 border-2 border-white/5 shadow-inner">
             <button 
              onClick={() => setViewMode('grid')} 
              className={cn("flex-1 xl:flex-none px-12 py-6 rounded-[2.5rem] transition-all border-none cursor-pointer flex justify-center", viewMode === 'grid' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
             >
              <LayoutGrid size={24} strokeWidth={2.5}/>
             </button>
             <button 
              onClick={() => setViewMode('list')} 
              className={cn("flex-1 xl:flex-none px-12 py-6 rounded-[2.5rem] transition-all border-none cursor-pointer flex justify-center", viewMode === 'list' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
             >
              <List size={24} strokeWidth={2.5}/>
             </button>
          </div>
        </div>

        {/* 📋 RENDU DES OBJECTIFS */}
        <div className={cn("gap-10", viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col")}>
          {loading ? (
             <div className="col-span-full py-40 flex flex-col items-center gap-8">
                <RefreshCw className="animate-spin text-blue-600" size={64} />
                <p className="text-[12px] font-black uppercase italic text-slate-500 tracking-[0.6em] animate-pulse">Synchronisation de la matrice...</p>
             </div>
          ) : objectives.length === 0 ? (
            <div className="col-span-full py-40 flex flex-col items-center gap-6 border-4 border-dashed border-white/5 rounded-[5rem] bg-white/2">
              <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center">
                <Target size={64} className="text-slate-600" />
              </div>
              <p className="text-2xl font-black uppercase italic text-slate-500 tracking-widest">Aucun objectif répertorié</p>
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

      {/* 🧾 MODAL DE GESTION (CREATE/EDIT) SÉCURISÉ */}
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

// ============================================================================
// 🧩 SOUS-COMPOSANTS : ÉLÉMENTS UI DÉDIÉS
// ============================================================================

/**
 * 📊 CARTE DE STATISTIQUE : Rendu visuel d'un KPI
 */
function StatCard({ val, label, icon: Icon, color, alert }: any) {
  const themes: Record<string, string> = {
    white: "text-white bg-[#151A2D] border-white/5",
    blue: "text-blue-500 bg-[#151A2D] border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.1)]",
    emerald: "text-emerald-500 bg-[#151A2D] border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]",
    red: "text-rose-500 bg-rose-950/20 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.2)] animate-pulse"
  };

  return (
    <div className={cn("border-2 rounded-[3rem] p-10 flex items-center gap-6 shadow-4xl transition-all text-left backdrop-blur-3xl", themes[color])}>
      <Icon size={40} strokeWidth={2.5} />
      <div>
        <p className="text-5xl font-black italic leading-none tracking-tighter m-0">{val}</p>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-60 m-0 leading-none">{label}</p>
      </div>
    </div>
  );
}

/**
 * 🎯 CARTE D'OBJECTIF : Composant maître de l'affichage individuel
 */
function ObjectiveCard({ obj, onQuickProgress, onEdit, onDelete }: { obj: QualityObjective, onQuickProgress: any, onEdit: any, onDelete: any }) {
  // Calcul de l'état critique de l'échéance
  const isOverdue = obj.QO_Status !== 'ATTEINT' && obj.QO_Deadline && isPast(new Date(obj.QO_Deadline));
  
  return (
    <div className="bg-[#151A2D] border-2 border-white/5 rounded-[4rem] p-12 group hover:border-blue-500/30 transition-all duration-500 flex flex-col justify-between shadow-4xl overflow-hidden relative text-left">
      <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 pointer-events-none">
        <Target size={200} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-12">
          <div className={cn(
            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase italic border-2 tracking-[0.3em]",
            obj.QO_Status === 'ATTEINT' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : 
            isOverdue ? "bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse" : "bg-blue-600/10 border-blue-600/30 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          )}>
            {isOverdue ? "⚠️ RETARD CRITIQUE §6.2" : obj.QO_Status.replace('_', ' ')}
          </div>
          
          {/* Menu d'actions contextuel */}
          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
            <button onClick={onEdit} className="p-4 bg-black/40 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-blue-600 transition-all cursor-pointer"><Edit3 size={18}/></button>
            <button onClick={onDelete} className="p-4 bg-black/40 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-rose-600 transition-all cursor-pointer"><Trash2 size={18}/></button>
          </div>
        </div>

        <h3 className="text-3xl font-black uppercase italic text-white mb-8 leading-tight group-hover:text-blue-400 transition-colors duration-500 tracking-tighter m-0 line-clamp-3">
          {obj.QO_Title}
        </h3>
        
        <div className="flex flex-col gap-4 mb-auto">
           <div className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase italic">
             <Flag size={18} className="text-blue-500" />
             <span className="tracking-[0.2em] text-slate-500">Cible Master : <span className="text-white">{obj.QO_Target}</span></span>
           </div>
           {obj.QO_Description && (
             <p className="text-slate-500 font-bold text-sm italic line-clamp-2 m-0">{obj.QO_Description}</p>
           )}
        </div>

        {/* COMPTEUR DE RÉALISATION INTERACTIF */}
        <div className="space-y-6 mt-12 mb-10">
           <div className="flex justify-between items-end text-[10px] font-black uppercase italic tracking-[0.3em]">
              <span className="text-slate-500">Taux de réalisation</span>
              <span className="text-4xl text-blue-500 leading-none">{obj.QO_Progress}%</span>
           </div>
           <div className="h-4 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 ease-out", 
                  obj.QO_Progress >= 100 
                    ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                    : "bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                )} 
                style={{ width: `${Math.min(obj.QO_Progress, 100)}%` }} 
              />
           </div>
           
           {/* Quick Progress Buttons (§9.1 Monitoring) */}
           {(obj.QO_Status === 'EN_COURS' || obj.QO_Status === 'NOUVEAU') && (
             <div className="flex gap-3 pt-4">
               {[25, 50, 75, 100].map(p => (
                 <button 
                   key={p} 
                   onClick={() => onQuickProgress(obj.QO_Id, p)}
                   className="flex-1 py-4 rounded-2xl bg-black/40 text-[10px] font-black uppercase italic hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all border border-white/5 cursor-pointer text-slate-500 shadow-inner"
                 >
                   {p}%
                 </button>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* METADONNÉES DE RESPONSABILITÉ */}
      <div className="pt-8 border-t-2 border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-[10px] font-black uppercase italic text-slate-500 tracking-[0.2em] shrink-0">
          <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-xl">
             <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
               <User size={14} className="text-blue-400" />
             </div>
             <span className="truncate max-w-37.5">Pilote : {obj.QO_Owner?.U_FirstName || 'NON ASSIGNÉ'}</span>
          </div>
          <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-xl">
             <Calendar size={14} className="text-slate-400" />
             <span>{obj.QO_Deadline ? format(new Date(obj.QO_Deadline), 'MMM yyyy') : 'SANS ÉCHÉANCE'}</span>
          </div>
      </div>
    </div>
  );
}

/**
 * 🧾 MODAL DE FORMULAIRE : Interface de saisie souveraine (Avec Validation SDE)
 */
function ObjectiveEntryModal({ mode, objective, onClose, onRefresh }: { mode: string, objective: QualityObjective | null, onClose: any, onRefresh: any }) {
  const [form, setForm] = useState({
    QO_Title: objective?.QO_Title || '',
    QO_Description: objective?.QO_Description || '',
    QO_Target: objective?.QO_Target || '',
    QO_Deadline: objective?.QO_Deadline ? format(new Date(objective.QO_Deadline), 'yyyy-MM-dd') : '',
    QO_OwnerId: objective?.QO_OwnerId || '',
    QO_ProcessusId: objective?.QO_ProcessusId || ''
  });
  
  const [pilots, setPilots] = useState<UserBase[]>([]);
  const [processus, setProcessus] = useState<ProcessusBase[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Chargement des référentiels système
  useEffect(() => {
    const loadReferentials = async () => {
      try {
        const [uRes, pRes] = await Promise.all([
          apiClient.get<UserBase[]>('/users'),
          apiClient.get<ProcessusBase[]>('/processus')
        ]);
        setPilots(uRes.data);
        setProcessus(pRes.data);
      } catch (err) {
        toast.error("ÉCHEC DU CHARGEMENT DES RÉFÉRENTIELS (Pilotes / Processus).");
      }
    };
    loadReferentials();
  }, []);

  /**
   * 🛡️ MOTEUR DE VALIDATION STRICTE
   */
  const validateForm = () => {
    if (!form.QO_Title.trim()) { toast.error("ÉCHEC : L'énoncé stratégique est obligatoire."); return false; }
    if (!form.QO_Target.trim()) { toast.error("ÉCHEC : La valeur cible est requise."); return false; }
    if (!form.QO_Deadline) { toast.error("ÉCHEC : L'échéance finale est requise (ISO 9001 §6.2.1)."); return false; }
    if (!form.QO_OwnerId) { toast.error("ÉCHEC : Un pilote responsable doit être désigné."); return false; }
    if (!form.QO_ProcessusId) { toast.error("ÉCHEC : Le rattachement à un processus est obligatoire."); return false; }
    
    // Alerte bienveillante sur les dates
    const selectedDate = new Date(form.QO_Deadline);
    if (selectedDate < new Date() && mode === 'create') {
      toast.warning("NOTE : L'échéance sélectionnée est déjà passée.");
    }

    return true;
  };

  /**
   * 💾 Action de persistance dans le Noyau
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return; // Blocage si invalide

    setSubmitting(true);
    const tid = toast.loading("Scellement des données dans la Matrix...");
    try {
      if (mode === 'create') {
        await apiClient.post('/quality-objectives', form);
      } else {
        await apiClient.patch(`/quality-objectives/${objective?.QO_Id}`, form);
      }
      
      toast.success("ENJEU STRATÉGIQUE SYNCHRONISÉ AVEC SUCCÈS.", { id: tid });
      onRefresh();
      onClose();
    } catch (e) {
      toast.error("ERREUR D'ÉCRITURE DANS LE NOYAU MASTER.", { id: tid });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-3xl p-10 overflow-y-auto">
      <div className="bg-[#151A2D] border-2 border-white/5 w-full max-w-5xl rounded-[4rem] p-16 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 my-auto">
        
        <div className="flex justify-between items-center mb-16 text-left border-b-2 border-white/5 pb-10">
          <h2 className="text-4xl font-black uppercase italic flex items-center gap-6 tracking-tighter leading-none m-0 text-white">
            <div className="w-20 h-20 rounded-4xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-inner">
              <Target className="text-blue-500" size={40} /> 
            </div>
            <div>
              {mode === 'create' ? 'Définir' : 'Ajuster'} <span className="text-blue-500">Objectif Qualité</span>
              <p className="text-[10px] text-slate-500 tracking-[0.4em] mt-3">FORMULAIRE CONFORME ISO 9001:2015</p>
            </div>
          </h2>
          <button onClick={onClose} className="p-6 bg-black/40 hover:bg-rose-600/20 rounded-4xl text-slate-500 hover:text-rose-500 transition-all border-none cursor-pointer">
            <X size={32} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 text-left">
          <div className="space-y-10">
            {/* --- Section Identification --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="col-span-1 lg:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-8 block italic tracking-[0.3em]">Énoncé Stratégique (Critère SMART)</label>
                  <input 
                    value={form.QO_Title} 
                    onChange={e => setForm({...form, QO_Title: e.target.value.toUpperCase()})} 
                    className="w-full bg-black/40 border-2 border-white/5 rounded-[3rem] p-8 text-2xl font-black italic uppercase outline-none focus:border-blue-600 transition-all shadow-inner text-white placeholder:text-slate-800" 
                    placeholder="EX: RÉDUIRE LE TAUX DE REBUT INDUSTRIEL..." 
                  />
               </div>
               
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-8 block italic tracking-[0.3em]">Valeur Cible (Indicateur)</label>
                  <input 
                    value={form.QO_Target} 
                    onChange={e => setForm({...form, QO_Target: e.target.value})} 
                    className="w-full bg-black/40 border-2 border-white/5 rounded-[3rem] p-8 text-[13px] font-black italic uppercase outline-none focus:border-blue-600 transition-all shadow-inner text-white placeholder:text-slate-800" 
                    placeholder="EX: INFÉRIEUR À 2.5%" 
                  />
               </div>
               
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-8 block italic tracking-[0.3em]">Échéance Finale (ISO §6.2.1)</label>
                  <input 
                    type="date" 
                    value={form.QO_Deadline} 
                    onChange={e => setForm({...form, QO_Deadline: e.target.value})} 
                    className="w-full bg-black/40 border-2 border-white/5 rounded-[3rem] p-8 text-[13px] font-black italic uppercase outline-none focus:border-blue-600 transition-all shadow-inner text-white cursor-pointer color-scheme-dark" 
                  />
               </div>

               <div className="col-span-1 lg:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-8 block italic tracking-[0.3em]">Description détaillée (Optionnel)</label>
                  <textarea 
                    value={form.QO_Description} 
                    onChange={e => setForm({...form, QO_Description: e.target.value})} 
                    className="w-full bg-black/40 border-2 border-white/5 rounded-[3rem] p-8 text-[13px] font-bold italic outline-none focus:border-blue-600 transition-all shadow-inner text-white placeholder:text-slate-800 min-h-37.5 resize-none" 
                    placeholder="Précisez le contexte, les ressources nécessaires..." 
                  />
               </div>
            </div>

            {/* --- Section Gouvernance --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-10 border-t-2 border-white/5">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-8 block italic tracking-[0.3em]">Pilote Responsable (Authority)</label>
                  <div className="relative">
                    <select 
                      value={form.QO_OwnerId} 
                      onChange={e => setForm({...form, QO_OwnerId: e.target.value})} 
                      className="w-full bg-black/40 border-2 border-white/5 rounded-[3rem] p-8 text-[13px] font-black italic uppercase outline-none focus:border-blue-600 transition-all shadow-inner text-white appearance-none cursor-pointer"
                    >
                       <option value="" className="bg-[#0B0F1A] text-slate-500">-- DÉSIGNER UN PILOTE --</option>
                       {pilots.map(p => <option className="bg-[#0B0F1A]" key={p.U_Id} value={p.U_Id}>{p.U_FirstName} {p.U_LastName}</option>)}
                    </select>
                    <ChevronDown className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={24} />
                  </div>
               </div>
               
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-8 block italic tracking-[0.3em]">Processus Support (SMI Root)</label>
                  <div className="relative">
                    <select 
                      value={form.QO_ProcessusId} 
                      onChange={e => setForm({...form, QO_ProcessusId: e.target.value})} 
                      className="w-full bg-black/40 border-2 border-white/5 rounded-[3rem] p-8 text-[13px] font-black italic uppercase outline-none focus:border-blue-600 transition-all shadow-inner text-white appearance-none cursor-pointer"
                    >
                       <option value="" className="bg-[#0B0F1A] text-slate-500">-- RATTACHER UN PROCESSUS --</option>
                       {processus.map(pr => <option className="bg-[#0B0F1A]" key={pr.PR_Id} value={pr.PR_Id}>{pr.PR_Code} - {pr.PR_Libelle}</option>)}
                    </select>
                    <ChevronDown className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={24} />
                  </div>
               </div>
            </div>
          </div>

          {/* --- Actions Finales --- */}
          <div className="pt-12 flex flex-col md:flex-row gap-6 mt-10">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-8 bg-black/40 border-2 border-white/5 rounded-[3rem] text-[12px] font-black uppercase italic tracking-widest hover:bg-white/10 hover:text-white transition-all cursor-pointer text-slate-500"
            >
              Abandonner
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="flex-2 bg-blue-600 py-8 rounded-[3rem] text-[13px] font-black uppercase italic shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500 active:scale-95 flex justify-center items-center gap-5 border-none cursor-pointer text-white disabled:opacity-50"
            >
              {submitting ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} />}
              Sceller dans la trajectoire stratégique
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}