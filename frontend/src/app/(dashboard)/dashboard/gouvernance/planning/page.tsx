/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📅 MODULE : CHRONOGRAMME MASTER §9.3 (ISO 9001)
 * RÔLE : Pilotage temporel des instances et jalons critiques
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { Plus, Trash2, RefreshCcw } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface GovernanceActivity {
  GA_Id: string;
  GA_Num?: string;
  GA_Title: string;
  GA_Type: 'COPIL' | 'REVUE_DIRECTION' | 'REVUE_PROCESSUS' | 'AUDIT_INTERNE' | 'AUDIT_EXTERNE' | 'VEILLE_REGLEMENTAIRE' | 'SEANCE_PROCESSUS';
  GA_DatePlanned: string;
  GA_Deadline?: string;
  GA_Status: 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'POSTPONED' | 'CANCELLED';
  GA_IsActive: boolean;
  GA_CreatedAt: string;
  GA_UpdatedAt: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCcw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic">{label}</span>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function PerformancePlanning() {
  const [activities, setActivities] = useState<GovernanceActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<GovernanceActivity[]>('/gouvernance/planning');
      setActivities(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement planning:', error);
      toast.error("SYNCHRO CHRONO ÉCHOUÉE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = activities.length;
    const done = activities.filter(a => a.GA_Status === 'DONE').length;
    const late = activities.filter(a => a.GA_Status !== 'DONE' && a.GA_Deadline && new Date(a.GA_Deadline) < new Date()).length;
    return { 
      completion: total > 0 ? Math.round((done/total)*100) : 0, 
      late, 
      total 
    };
  }, [activities]);

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmez-vous la suppression de cette activité ?')) return;
    const toastId = toast.loading("Suppression en cours...");
    try {
      await apiClient.delete(`/gouvernance/activities/${id}`);
      toast.success("Activité supprimée", { id: toastId });
      fetchData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || "Erreur", { id: toastId });
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Sync Master Chronos §9.3..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="text-left space-y-2 w-full xl:w-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter leading-none m-0">Chronogramme <span className="text-blue-400">Master</span></h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0 italic">Ordonnancement Temporel SMI §9.3</p>
        </div>
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 px-6 md:px-8 lg:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] flex items-center gap-2 md:gap-3 shadow-2xl hover:bg-white hover:text-blue-700 transition-all border-none text-white italic cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 w-full xl:w-auto justify-center"
          aria-label="Créer une nouvelle activité"
        >
          <Plus size={16} className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} aria-hidden="true" /> 
          <span className="hidden sm:inline">Nouvelle Activité</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6 space-y-6 md:space-y-8 lg:space-y-12">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 lg:gap-10" aria-label="Statistiques du planning">
          <article className="bg-[#0F172A] p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl border border-white/5 shadow-2xl">
             <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mb-3 md:mb-4">Réalisation</p>
             <span className="text-4xl md:text-5xl lg:text-6xl font-black italic text-emerald-400 tracking-tighter leading-none">{stats.completion}%</span>
          </article>
          <article className="bg-[#0F172A] p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl border border-white/5 shadow-2xl">
             <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mb-3 md:mb-4">Retards</p>
             <span className="text-4xl md:text-5xl lg:text-6xl font-black italic text-rose-400 tracking-tighter leading-none">{stats.late}</span>
          </article>
          <article className="bg-[#0F172A] p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl border border-white/5 shadow-2xl">
             <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mb-3 md:mb-4">Instances</p>
             <span className="text-4xl md:text-5xl lg:text-6xl font-black italic text-blue-400 tracking-tighter leading-none">{stats.total}</span>
          </article>
        </section>

        {/* Timeline */}
        <section className="space-y-4 md:space-y-6" aria-label="Liste des activités planifiées">
          {activities.map(act => {
            const isDone = act.GA_Status === 'DONE';
            const isLate = !isDone && act.GA_Deadline && new Date(act.GA_Deadline) < new Date();
            
            return (
              <article 
                key={act.GA_Id} 
                className="bg-[#0F172A] border border-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 lg:gap-8 group hover:border-blue-500/40 transition-all shadow-2xl focus-within:border-blue-500/40"
                role="article"
                aria-labelledby={`activity-title-${act.GA_Id}`}
              >
                <div className="flex items-start gap-4 md:gap-6 lg:gap-10 flex-1 min-w-0">
                  {/* Date badge */}
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600/10 border border-blue-500/20 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-blue-400 shrink-0">
                     <span className="text-[8px] md:text-[9px] font-black uppercase mb-0.5 md:mb-1">
                       {new Date(act.GA_DatePlanned).toLocaleString('fr', {month: 'short'})}
                     </span>
                     <span className="text-2xl md:text-3xl font-black leading-none">
                       {new Date(act.GA_DatePlanned).getDate()}
                     </span>
                  </div>
                  
                  {/* Content */}
                  <div className="text-left min-w-0">
                    <span className="px-3 md:px-4 py-1 md:py-1.5 bg-black/40 rounded-full text-[7px] md:text-[8px] text-slate-500 border border-white/5 tracking-widest uppercase mb-2 md:mb-3 md:mb-4 inline-block">
                      {act.GA_Type}
                    </span>
                    <h4 
                      id={`activity-title-${act.GA_Id}`}
                      className="text-lg md:text-xl lg:text-2xl font-black m-0 tracking-tighter group-hover:text-blue-400 transition-colors leading-none truncate"
                    >
                      {act.GA_Title}
                    </h4>
                    {act.GA_Deadline && (
                      <p className={cn(
                        "text-[8px] md:text-[9px] mt-1 md:mt-2",
                        isLate ? "text-rose-400" : "text-slate-500"
                      )}>
                        Échéance: {new Date(act.GA_Deadline).toLocaleDateString('fr-SN')}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Status + Actions */}
                <div className="flex items-center gap-3 md:gap-4 md:gap-6">
                  <span className={cn(
                    "px-4 md:px-5 lg:px-6 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black border",
                    isDone 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : isLate
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-white/5 text-slate-400 border-white/5"
                  )}>
                    {act.GA_Status}
                  </span>
                  <button 
                    type="button"
                    onClick={() => handleDelete(act.GA_Id)}
                    className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl hover:bg-rose-600 transition-all border-none text-slate-400 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    aria-label={`Supprimer ${act.GA_Title}`}
                    title="Supprimer"
                  >
                    <Trash2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true"/>
                  </button>
                </div>
              </article>
            );
          })}
          
          {activities.length === 0 && (
            <div className="py-24 md:py-32 text-center border-2 border-dashed border-white/5 rounded-2xl md:rounded-3xl bg-white/2" role="status">
              <p className="text-[9px] md:text-[10px] tracking-widest font-black uppercase">Aucune activité planifiée</p>
              <button 
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-3 md:mt-4 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
              >
                Créer votre première activité
              </button>
            </div>
          )}
        </section>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}