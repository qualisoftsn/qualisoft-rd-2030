/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🎯 MODULE : PILOTAGE DES OBJECTIFS QUALITÉ §6.2 (ISO 9001)
 * RÔLE : Définition, suivi et mesure de l'efficacité stratégique
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import {
  Target, CheckCircle2, Plus, 
  Calendar, RefreshCw, Trash2, Edit3, 
  BarChart2, User, AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { format, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type ObjectiveStatus = 'EN_COURS' | 'ATTEINT' | 'EN_RETARD' | 'ANNULE';

export interface QualityObjective {
  QO_Id: string;
  QO_Title: string;
  QO_Description: string;
  QO_Target: string;
  QO_Progress: number;
  QO_Status: ObjectiveStatus;
  QO_Deadline: string;
  QO_OwnerName?: string;
  QO_OwnerId?: string;
  QO_ProcessusId?: string;
  QO_CreatedAt: string;
  QO_UpdatedAt: string;
}

export interface ObjectiveStatProps {
  label: string;
  val: string | number;
  icon: React.ElementType;
  color: 'blue' | 'emerald';
}

export interface FilterState {
  status: ObjectiveStatus | 'ALL';
  search: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : OBJECTIVE STAT
// ============================================================================

function ObjectiveStat({ label, val, icon: Icon, color }: ObjectiveStatProps) {
  const colors: Record<ObjectiveStatProps['color'], string> = { 
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20", 
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
  };
  
  return (
    <article className="bg-[#0F172A] p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 border-white/5 flex items-center gap-4 md:gap-6 shadow-2xl transition-all hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-400">
      <div className={cn("p-3 md:p-4 md:p-5 rounded-xl md:rounded-2xl shadow-inner", colors[color])}>
        <Icon size={20} className="w-5 h-5 md:w-7 md:h-7" aria-hidden="true" />
      </div>
      <div className="text-left">
        <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mb-1 md:mb-2 leading-none italic m-0">{label}</p>
        <p className="text-3xl md:text-4xl font-black italic m-0 tracking-tighter text-white leading-none">{val}</p>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function QualityObjectivesPage() {
  const [objectives, setObjectives] = useState<QualityObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterState>({ status: 'ALL', search: '' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<QualityObjective[]>('/quality-objectives');
      const data = Array.isArray(res.data) ? res.data : [];
      setObjectives(data);
    } catch (error) {
      console.error('❌ Erreur chargement objectifs:', error);
      toast.error('RUPTURE DE LIAISON AU REGISTRE STRATÉGIQUE');
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = objectives.length;
    const achieved = objectives.filter(o => o.QO_Status === 'ATTEINT').length;
    const avg = total > 0 ? Math.round(objectives.reduce((acc, o) => acc + o.QO_Progress, 0) / total) : 0;
    return { total, achieved, avg };
  }, [objectives]);

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmez-vous la suppression de cet objectif ?')) return;
    const toastId = toast.loading("Suppression en cours...");
    try {
      await apiClient.delete(`/quality-objectives/${id}`);
      toast.success("Objectif supprimé", { id: toastId });
      fetchData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Erreur de suppression", { id: toastId });
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Synchronisation Stratégique §6.2..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 lg:gap-8 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <span className="bg-blue-600/10 border border-blue-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] tracking-widest text-blue-400 flex items-center gap-1.5 md:gap-2">
              <Target size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" /> 
              ISO 9001 §6.2
            </span>
            <span className="text-slate-500 text-[8px] md:text-[9px] tracking-widest italic">{stats.total} OBJECTIFS INDEXÉS</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0">Pilotage <span className="text-blue-400">Objectifs</span></h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <div className="hidden md:flex rounded-xl md:rounded-2xl border border-white/10 bg-black/40 p-1" role="tablist" aria-label="Mode d'affichage">
            <button 
              type="button"
              onClick={() => setViewMode('grid')} 
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-[9px] transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                viewMode === 'grid' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"
              )}
              role="tab"
              aria-selected={viewMode === 'grid'}
            >
              GRILLE
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('list')} 
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-[9px] transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                viewMode === 'list' ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"
              )}
              role="tab"
              aria-selected={viewMode === 'list'}
            >
              LISTE
            </button>
          </div>
          <button 
            type="button"
            className="bg-blue-600 hover:bg-white hover:text-blue-700 px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] flex items-center gap-2 md:gap-3 transition-all border-none cursor-pointer text-white italic shadow-2xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full xl:w-auto justify-center"
            aria-label="Créer un nouvel objectif qualité"
          >
            <Plus size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
            <span className="hidden sm:inline">Déployer Objectif</span>
          </button>
        </div>
      </header>

      {/* 📊 KPI DASH ROW */}
      <section className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-0 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6" aria-label="Statistiques des objectifs qualité">
        <ObjectiveStat label="Total Objectifs" val={stats.total} icon={Target} color="blue" />
        <ObjectiveStat label="Taux Atteinte" val={`${stats.achieved}/${stats.total}`} icon={CheckCircle2} color="emerald" />
        <article className="md:col-span-2 bg-[#0F172A] rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-7 border-2 border-white/5 flex flex-col justify-between shadow-2xl">
          <div className="flex justify-between items-center mb-3 md:mb-4">
             <span className="text-[9px] md:text-[10px] text-slate-500 tracking-widest leading-none">Progression Moyenne du SMI</span>
             <BarChart2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="flex items-end gap-4 md:gap-5">
             <span className="text-4xl md:text-5xl leading-none text-white tracking-tighter">{stats.avg}%</span>
             <div className="flex-1 h-2 md:h-3 bg-black/40 rounded-full mb-0.5 md:mb-1 overflow-hidden" role="progressbar" aria-valuenow={stats.avg} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-blue-600 shadow-[0_0_15px_#2563eb] transition-all duration-1000" style={{ width: `${stats.avg}%` }} aria-hidden="true" />
             </div>
          </div>
        </article>
      </section>

      {/* 📋 LISTE DES OBJECTIFS */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pt-0 md:pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 pb-16 md:pb-20" role="list" aria-label="Liste des objectifs qualité">
          {objectives.length > 0 ? objectives.map(obj => {
            const isAchieved = obj.QO_Status === 'ATTEINT';
            const isOverdue = isPast(new Date(obj.QO_Deadline)) && !isAchieved;
            
            return (
              <article 
                key={obj.QO_Id} 
                className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-6 md:p-8 lg:p-10 hover:border-blue-500/30 transition-all flex flex-col justify-between shadow-2xl group relative overflow-hidden focus-within:border-blue-500/30"
                role="listitem"
                aria-labelledby={`objective-title-${obj.QO_Id}`}
              >
                <div className="absolute -right-4 md:-right-6 lg:-right-10 -top-4 md:-top-6 lg:-top-10 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" aria-hidden="true">
                  <Target size={120} className="w-30 h-30 md:w-40 md:h-40 lg:w-50 lg:h-50" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6 md:mb-8">
                     <span className={cn(
                       "px-3 md:px-4 lg:px-5 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[9px] tracking-widest border",
                       isAchieved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-600/10 text-blue-400 border-blue-500/20'
                     )}>
                       {obj.QO_Status}
                     </span>
                     <div className="flex gap-2 md:gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          type="button"
                          className="p-2 bg-white/5 rounded-lg hover:bg-blue-600 transition-all border-none cursor-pointer text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                          aria-label={`Modifier ${obj.QO_Title}`}
                          title="Modifier"
                        >
                          <Edit3 size={16} className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(obj.QO_Id)}
                          className="p-2 bg-white/5 rounded-lg hover:bg-rose-600 transition-all border-none cursor-pointer text-slate-400 hover:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                          aria-label={`Supprimer ${obj.QO_Title}`}
                          title="Supprimer"
                        >
                          <Trash2 size={16} className="w-4 h-4" aria-hidden="true" />
                        </button>
                     </div>
                  </div>
                  <h3 id={`objective-title-${obj.QO_Id}`} className="text-xl md:text-2xl lg:text-3xl tracking-tighter leading-none m-0 mb-3 md:mb-4 group-hover:text-blue-400 transition-colors uppercase truncate">
                    {obj.QO_Title}
                  </h3>
                  <p className="text-[10px] md:text-[11px] text-slate-500 normal-case italic font-bold leading-relaxed mb-6 md:mb-8 md:mb-10 line-clamp-3">
                    {obj.QO_Description}
                  </p>
                </div>
                
                <div className="relative z-10 space-y-6 md:space-y-8">
                  <div className="flex flex-col gap-2 md:gap-3">
                     <div className="flex justify-between text-[9px] md:text-[10px] tracking-widest text-slate-400">
                       <span>Cible : {obj.QO_Target}</span>
                       <span>{obj.QO_Progress}%</span>
                     </div>
                     <div className="h-2 md:h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5" role="progressbar" aria-valuenow={obj.QO_Progress} aria-valuemin={0} aria-valuemax={100}>
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            obj.QO_Progress >= 100 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                          )} 
                          style={{ width: `${obj.QO_Progress}%` }} 
                          aria-hidden="true" 
                        />
                     </div>
                  </div>
                  
                  <div className="pt-6 md:pt-8 border-t border-white/5 flex justify-between items-center">
                     <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] md:text-[10px] text-blue-400">
                          <User size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
                        </div>
                        <span className="text-[9px] md:text-[10px] text-slate-500 tracking-widest">{obj.QO_OwnerName || 'PILOTE'}</span>
                     </div>
                     <span className={cn(
                       "text-[8px] md:text-[9px] flex items-center gap-1.5 md:gap-2 tracking-widest",
                       isOverdue ? 'text-red-400 animate-pulse' : 'text-slate-600'
                     )}>
                        <Calendar size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" /> 
                        {format(new Date(obj.QO_Deadline), 'dd MMM yyyy', { locale: fr })}
                     </span>
                  </div>
                </div>
              </article>
            );
          }) : (
            <div className="col-span-full h-64 md:h-80 lg:h-96 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[5rem] opacity-20" role="status">
               <Target size={48} className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 mb-3 md:mb-4 md:mb-6" aria-hidden="true" />
               <p className="text-[10px] md:text-[11px] lg:text-xl tracking-widest">Aucun Objectif Stratégique Déployé</p>
               <button 
                 type="button"
                 className="mt-3 md:mt-4 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
               >
                 Créer votre premier objectif
               </button>
            </div>
          )}
        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}