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
  Save 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, isPast } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** * 🛠️ UTILITAIRE DE FUSION DE CLASSES TAILWIND 
 * Permet de combiner conditionnellement des classes CSS sans conflits.
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 🎯 PAGE : PILOTAGE DES OBJECTIFS QUALITÉ (§6.2 ISO 9001)
 * -------------------------------------------------------------------------
 * RÔLE : Centralise la définition, le suivi et la mesure de l'efficacité 
 * des objectifs stratégiques du Système de Management Intégré (SMI).
 * * CARACTÉRISTIQUES :
 * - Tracking en temps réel de la progression.
 * - Alertes automatiques sur les échéances dépassées.
 * - Liaison avec les pilotes (Authority) et les processus support.
 */
export default function QualityObjectivesPage() {
  // --- ÉTATS DU COCKPIT ---
  const [objectives, setObjectives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<any>(null);
  const [filters, setFilters] = useState({ status: 'ALL', search: '' });

  /**
   * 🔄 SYNCHRONISATION AVEC LE NOYAU MASTER
   * Récupère la liste exhaustive des objectifs avec filtres appliqués.
   */
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
      console.error("API_SYNC_ERROR:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Déclenchement de la synchronisation au montage et à chaque changement de filtre
  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * ⚡ MISE À JOUR RAPIDE DE LA PROGRESSION
   * Permet d'ajuster le pourcentage de réalisation directement depuis la carte.
   */
  const handleQuickProgress = async (id: string, progress: number) => {
    try {
      toast.loading("Mise à jour du flux...", { id: 'prog-up' });
      await apiClient.patch(`/quality-objectives/${id}/progress`, { progress });
      toast.success("Progression enregistrée", { id: 'prog-up' });
      fetchData(); // Rafraîchissement global pour recalculer les stats
    } catch (e) {
      toast.error("Erreur de communication API", { id: 'prog-up' });
    }
  };

  /**
   * 🗑️ ARCHIVAGE / SUPPRESSION
   * Retire l'objectif du flux actif. Un contrôle de sécurité est appliqué.
   */
  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment archiver cet enjeu stratégique ? Cette action est tracée dans les logs de conformité.")) return;
    try {
      await apiClient.delete(`/quality-objectives/${id}`);
      toast.success("Objectif archivé");
      fetchData();
    } catch (e) {
      toast.error("Suppression verrouillée : des indicateurs dépendent de cet objectif.");
    }
  };

  /**
   * 📊 CALCULATEUR KPI TEMPS RÉEL
   * Analyse la masse de données pour extraire les indicateurs de santé du SMQ.
   */
  const stats = useMemo(() => ({
    total: objectives.length,
    active: objectives.filter(o => o.QO_Status === 'EN_COURS').length,
    achieved: objectives.filter(o => o.QO_Status === 'ATTEINT').length,
    // Un objectif est considéré "Overdue" s'il est en cours et que la date est passée
    overdue: objectives.filter(o => o.QO_Status === 'EN_COURS' && isPast(new Date(o.QO_Deadline))).length,
    // Moyenne de complétion globale du SMI
    avg: objectives.length > 0 ? Math.round(objectives.reduce((acc, o) => acc + o.QO_Progress, 0) / objectives.length) : 0
  }), [objectives]);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 pb-24 selection:bg-blue-600/30">
      
      {/* 🚀 HEADER STRATÉGIQUE : Titre et Actions Globales */}
      <header className="sticky top-0 z-40 bg-[#0B0F1A]/95 backdrop-blur-3xl border-b border-white/5 px-12 py-10">
        <div className="flex justify-between items-end mb-10 text-left">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
              Pilotage <span className="text-blue-600">Objectifs</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase mt-4 tracking-[0.5em] italic">
              Planification Qualité Elite 2026 • Conformité ISO 9001:2015 §6.2
            </p>
          </div>
          <button 
            onClick={() => { setSelectedObjective(null); setModalMode('create'); }}
            className="bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-[2.5rem] font-black uppercase text-[12px] flex items-center gap-3 transition-all shadow-[0_10px_40px_rgba(37,99,235,0.3)] active:scale-95 border-none cursor-pointer"
          >
            <Plus size={20} /> Définir un enjeu
          </button>
        </div>

        {/* 📈 DASHBOARD FLASH : Statistiques clés */}
        <div className="grid grid-cols-5 gap-6">
          <StatCard val={stats.total} label="Total" icon={Target} color="white" />
          <StatCard val={stats.active} label="En cours" icon={Activity} color="blue" />
          <StatCard val={stats.achieved} label="Atteints" icon={CheckCircle2} color="emerald" />
          <StatCard val={stats.overdue} label="En retard" icon={AlertTriangle} color="red" alert={stats.overdue > 0} />
          
          <div className="bg-[#151B2B] border border-white/5 rounded-[2.5rem] p-6 flex flex-col justify-center shadow-inner">
            <span className="text-[9px] font-black uppercase text-slate-500 mb-2 italic text-left">Indice de réalisation SMI</span>
            <div className="flex items-center gap-3">
               <span className="text-3xl font-black italic text-blue-500 leading-none">{stats.avg}%</span>
               <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000 ease-out" 
                    style={{ width: `${stats.avg}%` }} 
                  />
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* 🛠️ ZONE DE FILTRAGE ET RECHERCHE */}
      <main className="max-w-7xl mx-auto p-12 space-y-12">
        <div className="flex gap-6 items-center">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={22} />
            <input 
              type="text" 
              value={filters.search} 
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Explorer les enjeux, pilotes ou processus..."
              className="w-full bg-[#151B2B]/40 border border-white/5 rounded-[2.5rem] py-6 pl-16 pr-6 text-sm font-black uppercase italic outline-none focus:border-blue-500/30 transition-all placeholder:text-slate-800"
            />
          </div>
          
          {/* Switcher de Vue (Grid/List) */}
          <div className="flex bg-[#151B2B] rounded-2xl p-1 border border-white/5 shadow-inner">
             <button 
              onClick={() => setViewMode('grid')} 
              className={cn("p-4 rounded-xl transition-all border-none cursor-pointer", viewMode === 'grid' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300")}
             >
              <LayoutGrid size={20}/>
             </button>
             <button 
              onClick={() => setViewMode('list')} 
              className={cn("p-4 rounded-xl transition-all border-none cursor-pointer", viewMode === 'list' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300")}
             >
              <List size={20}/>
             </button>
          </div>
        </div>

        {/* 📋 RENDU DES OBJECTIFS */}
        <div className={cn("gap-8", viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col")}>
          {loading ? (
             <div className="col-span-full py-32 flex flex-col items-center gap-6">
                <RefreshCw className="animate-spin text-blue-600" size={48} />
                <p className="text-[10px] font-black uppercase italic text-slate-500 tracking-[0.4em] animate-pulse">Synchronisation du Noyau Master...</p>
             </div>
          ) : objectives.length === 0 ? (
            <div className="col-span-full py-32 flex flex-col items-center gap-4 border border-dashed border-white/5 rounded-[4rem] opacity-30">
              <Target size={64} />
              <p className="text-xl font-black uppercase italic">Aucun objectif répertorié</p>
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

      {/* 🧾 MODAL DE GESTION (CREATE/EDIT) */}
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

// --- 🧩 SOUS-COMPOSANTS : ÉLÉMENTS UI DÉDIÉS ---

/**
 * CARTE DE STATISTIQUE : Rendu visuel d'un KPI
 */
function StatCard({ val, label, icon: Icon, color, alert }: any) {
  const themes: any = {
    white: "text-white bg-white/5 border-white/10",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/5",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
    red: "text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/10 animate-pulse"
  };
  return (
    <div className={cn("border rounded-[2.5rem] p-7 flex items-center gap-5 shadow-2xl transition-all text-left", themes[color])}>
      <Icon size={28} />
      <div>
        <p className="text-4xl font-black italic leading-none tracking-tighter">{val}</p>
        <p className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-50">{label}</p>
      </div>
    </div>
  );
}

/**
 * CARTE D'OBJECTIF : Composant maître de l'affichage individuel
 */
function ObjectiveCard({ obj, onQuickProgress, onEdit, onDelete }: any) {
  // Calcul de l'état critique de l'échéance
  const isOverdue = obj.QO_Status === 'EN_COURS' && isPast(new Date(obj.QO_Deadline));
  
  return (
    <div className="bg-[#151B2B]/40 border border-white/5 rounded-[4rem] p-10 group hover:border-blue-500/30 transition-all flex flex-col justify-between shadow-2xl overflow-hidden relative text-left">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Target size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div className={cn(
            "px-5 py-2 rounded-xl text-[9px] font-black uppercase italic border tracking-tighter",
            obj.QO_Status === 'ATTEINT' ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)]" : 
            isOverdue ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse" : "bg-blue-600/10 border-blue-600/30 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
          )}>
            {isOverdue ? "⚠️ RETARD CRITIQUE §6.2" : obj.QO_Status}
          </div>
          
          {/* Menu d'actions contextuel */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
            <button onClick={onEdit} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-blue-400 hover:bg-blue-600/10 transition-all border-none cursor-pointer"><Edit3 size={16}/></button>
            <button onClick={onDelete} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-red-500 hover:bg-red-600/10 transition-all border-none cursor-pointer"><Trash2 size={16}/></button>
          </div>
        </div>

        <h3 className="text-2xl font-black uppercase italic text-white mb-6 leading-tight group-hover:text-blue-500 transition-colors duration-500 tracking-tight">
          {obj.QO_Title}
        </h3>
        
        <div className="flex items-center gap-3 mb-10 text-[11px] font-black text-slate-400 uppercase italic">
          <Flag size={16} className="text-blue-500" />
          <span className="tracking-tight text-slate-500">Cible Master : <span className="text-white">{obj.QO_Target}</span></span>
        </div>

        {/* COMPTEUR DE RÉALISATION INTERACTIF */}
        <div className="space-y-6 mb-12">
           <div className="flex justify-between items-end text-[10px] font-black uppercase italic tracking-[0.2em]">
              <span className="text-slate-700">Taux de réalisation</span>
              <span className="text-3xl text-blue-500 leading-none">{obj.QO_Progress}%</span>
           </div>
           <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 shadow-inner">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out", 
                  obj.QO_Progress >= 100 
                    ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                    : "bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                )} 
                style={{ width: `${Math.min(obj.QO_Progress, 100)}%` }} 
              />
           </div>
           
           {/* Quick Progress Buttons (§9.1 Monitoring) */}
           {obj.QO_Status === 'EN_COURS' && (
             <div className="flex gap-2 pt-2">
                {[25, 50, 75, 100].map(p => (
                  <button 
                    key={p} 
                    onClick={() => onQuickProgress(obj.QO_Id, p)}
                    className="flex-1 py-3 rounded-2xl bg-white/2 text-[10px] font-black uppercase italic hover:bg-blue-600 hover:text-white transition-all border border-white/5 cursor-pointer text-slate-600 shadow-sm"
                  >
                    {p}%
                  </button>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* METADONNÉES DE RESPONSABILITÉ */}
      <div className="pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase italic text-slate-600 tracking-widest">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-600/20">
               <User size={14} className="text-blue-500" />
             </div>
             <span>Pilote : {obj.QO_Owner?.U_FirstName}</span>
          </div>
          <div className="flex items-center gap-3">
             <Calendar size={14} className="text-slate-700" />
             <span>Horizon : {format(new Date(obj.QO_Deadline), 'MMMM yyyy')}</span>
          </div>
      </div>
    </div>
  );
}

/**
 * MODAL DE FORMULAIRE : Interface de saisie souveraine
 */
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

  // Chargement des référentiels système au montage
  useEffect(() => {
    const loadReferentials = async () => {
      try {
        const [uRes, pRes] = await Promise.all([
          apiClient.get('/users'),
          apiClient.get('/processus')
        ]);
        setPilots(uRes.data);
        setProcessus(pRes.data);
      } catch (err) {
        toast.error("Échec du chargement des référentiels");
      }
    };
    loadReferentials();
  }, []);

  /**
   * Action de validation et persistance dans le Noyau
   */
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
      toast.error("Erreur d'écriture dans le Noyau Master");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F1A]/95 backdrop-blur-3xl p-6 overflow-y-auto">
      <div className="bg-[#151B2B] border border-white/10 w-full max-w-4xl rounded-[4.5rem] p-16 shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-500 my-auto">
        <div className="flex justify-between items-center mb-16 text-left">
          <h2 className="text-4xl font-black uppercase italic flex items-center gap-6 tracking-tighter leading-none">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
              <Target className="text-white" size={36} /> 
            </div>
            {mode === 'create' ? 'Définir' : 'Ajuster'} <span className="text-blue-600">Objectif</span>
          </h2>
          <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-full text-slate-700 hover:text-white transition-all border-none cursor-pointer"><X size={44}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 text-left">
          <div className="space-y-10">
            {/* Section Identification */}
            <div className="grid grid-cols-2 gap-10">
               <div className="col-span-2 space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-8 block italic tracking-[0.3em]">Énoncé Stratégique (Critère SMART)</label>
                  <input 
                    required 
                    value={form.QO_Title} 
                    onChange={e => setForm({...form, QO_Title: e.target.value.toUpperCase()})} 
                    className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-3xl p-8 text-2xl font-black italic uppercase outline-none focus:border-blue-600 transition-all shadow-inner text-white placeholder:text-slate-900" 
                    placeholder="EX: RÉDUIRE LE TAUX DE REBUT INDUSTRIEL..." 
                  />
               </div>
               <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-8 block italic tracking-[0.3em]">Valeur Cible (Indicateur)</label>
                  <input 
                    required 
                    value={form.QO_Target} 
                    onChange={e => setForm({...form, QO_Target: e.target.value})} 
                    className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-3xl p-8 text-sm font-black italic uppercase outline-none focus:border-blue-600 transition-all shadow-inner text-white" 
                    placeholder="EX: INFÉRIEUR À 2.5%" 
                  />
               </div>
               <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-8 block italic tracking-[0.3em]">Échéance Finale (ISO §6.2.1)</label>
                  <input 
                    type="date" 
                    required 
                    value={form.QO_Deadline} 
                    onChange={e => setForm({...form, QO_Deadline: e.target.value})} 
                    className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-3xl p-8 text-sm font-black italic uppercase outline-none focus:border-blue-600 transition-all shadow-inner text-white cursor-pointer" 
                  />
               </div>
            </div>

            {/* Section Gouvernance */}
            <div className="grid grid-cols-2 gap-10">
               <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-8 block italic tracking-[0.3em]">Pilote Responsable (Authority)</label>
                  <div className="relative">
                    <select 
                      required 
                      value={form.QO_OwnerId} 
                      onChange={e => setForm({...form, QO_OwnerId: e.target.value})} 
                      className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-3xl p-8 text-sm font-black italic uppercase outline-none focus:border-blue-600 transition-all shadow-inner text-white appearance-none cursor-pointer"
                    >
                       <option value="">-- DÉSIGNER UN PILOTE --</option>
                       {pilots.map(p => <option key={p.U_Id} value={p.U_Id}>{p.U_FirstName} {p.U_LastName}</option>)}
                    </select>
                    <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-slate-700 pointer-events-none" size={20} />
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-8 block italic tracking-[0.3em]">Processus Support (SMI Root)</label>
                  <div className="relative">
                    <select 
                      required 
                      value={form.QO_ProcessusId} 
                      onChange={e => setForm({...form, QO_ProcessusId: e.target.value})} 
                      className="w-full bg-[#0B0F1A] border-2 border-white/10 rounded-3xl p-8 text-sm font-black italic uppercase outline-none focus:border-blue-600 transition-all shadow-inner text-white appearance-none cursor-pointer"
                    >
                       <option value="">-- RATTACHER UN PROCESSUS --</option>
                       {processus.map(pr => <option key={pr.PR_Id} value={pr.PR_Id}>{pr.PR_Code} - {pr.PR_Libelle}</option>)}
                    </select>
                    <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-slate-700 pointer-events-none" size={20} />
                  </div>
               </div>
            </div>
          </div>

          {/* Actions Finales */}
          <div className="pt-10 flex gap-6">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-8 bg-white/5 rounded-[3rem] text-[12px] font-black uppercase italic tracking-widest hover:bg-white/10 transition-all border-none cursor-pointer text-slate-500"
            >
              Abandonner
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="flex-2 bg-blue-600 py-8 rounded-[3rem] text-[14px] font-black uppercase italic shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500 active:scale-95 flex justify-center items-center gap-5 border-none cursor-pointer text-white"
            >
              {submitting ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} />}
              Inscrire dans la trajectoire stratégique 2026
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}