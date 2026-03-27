/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🎙️ MODULE : SÉANCES PROCESSUS §9.3 (ISO 9001)
 * RÔLE : Traçabilité des arbitrages opérationnels et décisions SMI
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { Presentation, Plus, Edit3, Trash2, MapPin, Target, RefreshCcw, Database, X, Save, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface GovernanceActivity {
  GA_Id: string;
  GA_Num?: string;
  GA_Title: string;
  GA_Type: 'SEANCE_PROCESSUS' | 'COPIL' | 'REVUE_DIRECTION';
  GA_DatePlanned: string;
  GA_Deadline?: string;
  GA_Status: 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'POSTPONED' | 'CANCELLED';
  GA_Location?: string;
  GA_Processes?: Array<{ PR_Id: string; PR_Code: string; PR_Libelle: string }>;
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
      <Loader2 className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic">{label}</span>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SeancesPage() {
  const [data, setData] = useState<GovernanceActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<GovernanceActivity[]>('/gouvernance/planning?type=SEANCE_PROCESSUS');
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement séances:', error);
      toast.error("RUPTURE REGISTRE SÉANCES");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmez-vous la suppression de cette séance ?')) return;
    const toastId = toast.loading("Suppression en cours...");
    try {
      await apiClient.delete(`/gouvernance/activities/${id}`);
      toast.success("Séance supprimée", { id: toastId });
      fetchData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || "Erreur", { id: toastId });
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Ouverture du Registre Séances..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="text-left space-y-2 w-full xl:w-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter leading-none m-0">Sessions <span className="text-blue-400">Processus</span></h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0 italic flex items-center gap-2">
            <Presentation size={12} className="w-3 h-3 text-blue-400" aria-hidden="true" /> Surveillance Opérationnelle §9.3
          </p>
        </div>
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 px-6 md:px-8 lg:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] flex items-center gap-2 md:gap-3 md:gap-4 transition-all shadow-2xl border-none cursor-pointer text-white hover:bg-white hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full xl:w-auto justify-center"
          aria-label="Programmer une nouvelle séance"
        >
          <Plus size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
          <span className="hidden sm:inline">Programmer Séance</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6 space-y-6 md:space-y-8 lg:space-y-10">
        <section className="grid grid-cols-1 gap-6 md:gap-8" aria-label="Liste des séances processus">
          {data.length > 0 ? data.map(s => (
            <article 
              key={s.GA_Id} 
              className="bg-[#0F172A] border border-white/5 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl flex flex-col xl:flex-row justify-between gap-6 md:gap-8 lg:gap-10 group hover:border-blue-500/40 transition-all shadow-2xl focus-within:border-blue-500/40"
              role="article"
              aria-labelledby={`session-title-${s.GA_Id}`}
            >
              <div className="flex items-start gap-4 md:gap-6 lg:gap-10 flex-1 min-w-0">
                {/* Date badge */}
                <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-600/10 border border-blue-500/20 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-blue-400 shrink-0">
                   <span className="text-[9px] md:text-[10px] font-black mb-0.5 md:mb-1 uppercase tracking-widest">
                     {new Date(s.GA_DatePlanned).toLocaleString('fr', {month: 'short'})}
                   </span>
                   <span className="text-3xl md:text-4xl font-black italic m-0 leading-none">
                     {new Date(s.GA_DatePlanned).getDate()}
                   </span>
                </div>
                
                {/* Content */}
                <div className="text-left space-y-3 md:space-y-4 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3 md:gap-5">
                    <span className="px-3 md:px-4 lg:px-5 py-1 md:py-1.5 lg:py-2 bg-blue-600/20 text-blue-400 rounded-full text-[8px] md:text-[9px] border border-blue-500/20 font-black uppercase tracking-widest">
                      {s.GA_Num || 'SDE-SESSION'}
                    </span>
                    <span className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[9px] text-slate-500 italic">
                      <MapPin size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" aria-hidden="true"/> 
                      {s.GA_Location || 'PLATEFORME MATRIX'}
                    </span>
                  </div>
                  <h2 
                    id={`session-title-${s.GA_Id}`}
                    className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter m-0 leading-none group-hover:text-blue-400 transition-colors uppercase truncate"
                  >
                    {s.GA_Title}
                  </h2>
                  {s.GA_Processes && s.GA_Processes.length > 0 && (
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {s.GA_Processes.map((p) => (
                        <span 
                          key={p.PR_Id} 
                          className="px-3 md:px-4 py-1 bg-white/5 border border-white/5 rounded-lg md:rounded-xl text-[7px] md:text-[8px] text-blue-400 tracking-widest flex items-center gap-1"
                        >
                          <Target size={10} className="w-2.5 h-2.5" aria-hidden="true"/> 
                          {p.PR_Code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 md:gap-3 opacity-0 group-hover:opacity-100 transition-all shrink-0 justify-end xl:justify-start">
                <button 
                  type="button"
                  className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl hover:bg-blue-600 transition-all border-none text-slate-400 hover:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label={`Modifier ${s.GA_Title}`}
                  title="Modifier"
                >
                  <Edit3 size={16} className="w-4 h-4" aria-hidden="true"/>
                </button>
                <button 
                  type="button"
                  onClick={() => handleDelete(s.GA_Id)}
                  className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl hover:bg-rose-600 transition-all border-none text-slate-400 hover:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
                  aria-label={`Supprimer ${s.GA_Title}`}
                  title="Supprimer"
                >
                  <Trash2 size={16} className="w-4 h-4" aria-hidden="true"/>
                </button>
              </div>
            </article>
          )) : (
            <div 
              className="py-32 md:py-40 text-center border-2 border-dashed border-white/5 rounded-2xl md:rounded-3xl bg-white/2" 
              role="status"
              aria-live="polite"
            >
               <Database size={48} className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 opacity-20" aria-hidden="true" />
               <p className="text-[9px] md:text-[10px] tracking-widest font-black uppercase">Registre Sessions Vierge §9.3</p>
               <button 
                 type="button"
                 onClick={() => setIsModalOpen(true)}
                 className="mt-3 md:mt-4 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
               >
                 Créer votre première séance
               </button>
            </div>
          )}
        </section>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}