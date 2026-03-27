/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛡️ MODULE : REGISTRE DES REVUES DE PROCESSUS (ISO 9001 §9.1.1)
 * RÔLE : Surveillance de la performance des processus
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useEffect, useState, useCallback, useMemo, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { type ApiError } from '@/core/api/api-client';
import {
  Plus, ChevronRight, FileText, 
  ShieldCheck, Activity, 
  Calendar, Search, RefreshCw, Target, AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type ReviewStatus = 'BROUILLON' | 'EN_COURS' | 'VALIDEE' | 'CLOTUREE';

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_IsActive?: boolean;
}

export interface ProcessReview {
  PRV_Id: string;
  PRV_ProcessusId: string;
  PRV_Processus?: Processus;
  PRV_Month: number;
  PRV_Year: number;
  PRV_Status: ReviewStatus;
  PRV_DocRef?: string;
  PRV_DateReview?: string;
  PRV_NextReviewDate?: string;
  PRV_CreatedAt: string;
  PRV_UpdatedAt: string;
  PRV_CreatedById?: string;
}

export interface KPICardProps {
  title: string;
  val: string | number;
  icon: React.ElementType;
  color: 'emerald' | 'blue' | 'indigo' | 'amber';
}

export interface StatusBadgeProps {
  status: ReviewStatus;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-indigo-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : STATUS BADGE
// ============================================================================

function StatusBadge({ status }: StatusBadgeProps) {
  const cfg: Record<ReviewStatus, string> = {
    BROUILLON: "bg-slate-800 text-slate-400 border-white/5",
    EN_COURS: "bg-blue-600/10 text-blue-400 border-blue-500/20",
    VALIDEE: "bg-emerald-600/10 text-emerald-400 border-emerald-500/20",
    CLOTUREE: "bg-indigo-600/10 text-indigo-400 border-indigo-500/20"
  };
  
  return (
    <span className={cn(
      "px-3 md:px-4 py-1 md:py-1.5 rounded-full md:rounded-xl text-[8px] md:text-[9px] font-black border uppercase tracking-widest italic",
      cfg[status] || cfg.BROUILLON
    )}>
      {status}
    </span>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI CARD
// ============================================================================

function KPICard({ title, val, icon: Icon, color }: KPICardProps) {
  const colors: Record<KPICardProps['color'], string> = { 
    emerald: "text-emerald-400", 
    blue: "text-blue-400", 
    indigo: "text-indigo-400", 
    amber: "text-amber-400" 
  };
  
  return (
    <article className="bg-[#0F172A] p-6 md:p-7 rounded-2xl md:rounded-3xl border-2 border-white/5 flex items-center gap-4 md:gap-6 shadow-2xl transition-all hover:-translate-y-1 focus-within:ring-2 focus-within:ring-indigo-400">
      <div className={cn("p-3 md:p-4 bg-black/40 rounded-xl md:rounded-2xl border border-white/5", colors[color])}>
        <Icon size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
      </div>
      <div className="text-left">
        <p className="text-3xl md:text-4xl font-black italic m-0 tracking-tighter text-white leading-none">{val}</p>
        <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mt-1 md:mt-2 m-0 uppercase leading-none font-black italic">{title}</p>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ProcessReviewListPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ProcessReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ProcessReview[]>('/process-reviews');
      const data = Array.isArray(res.data) ? res.data : [];
      setReviews(data);
    } catch (error) {
      console.error('❌ Erreur chargement revues:', error);
      toast.error('RUPTURE DE FLUX : ÉCHEC DU CHARGEMENT DES REVUES');
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchReviews(); }, [fetchReviews]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const validated = reviews.filter(r => r.PRV_Status === 'VALIDEE' || r.PRV_Status === 'CLOTUREE').length;
    const currentYear = new Date().getFullYear();
    return { 
      total, 
      rate: total > 0 ? Math.round((validated / total) * 100) : 0,
      currentYear: reviews.filter(r => r.PRV_Year === currentYear).length
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (!search.trim()) return reviews;
    const query = search.toLowerCase();
    return reviews.filter(rev => 
      rev.PRV_Processus?.PR_Libelle?.toLowerCase().includes(query) ||
      rev.PRV_Processus?.PR_Code?.toLowerCase().includes(query) ||
      rev.PRV_DocRef?.toLowerCase().includes(query) ||
      rev.PRV_Year.toString().includes(query)
    );
  }, [reviews, search]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Synchronisation Matrix SDE..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-indigo-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <span className="bg-indigo-600/10 border border-indigo-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] text-indigo-400 tracking-widest">
              ISO 9001 §9.1.1
            </span>
            <span className="text-emerald-400 text-[8px] md:text-[9px] tracking-widest">
              {stats.rate}% CONFORMITÉ
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic">
            Revues de <span className="text-indigo-400">Processus</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button 
            type="button"
            onClick={() => router.push('/dashboard/process-review/analytics')} 
            className="p-2.5 md:p-3 lg:p-5 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl border border-white/10 text-slate-400 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Voir les analytics des revues"
          >
            <Activity size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          </button>
          <button 
            type="button"
            onClick={() => router.push('/dashboard/process-review/preparation')} 
            className="bg-indigo-600 hover:bg-white hover:text-indigo-700 px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] flex items-center gap-2 md:gap-3 shadow-2xl border-none cursor-pointer text-white italic transition-all active:scale-95 uppercase font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full xl:w-auto justify-center"
            aria-label="Créer une nouvelle revue de processus"
          >
            <Plus size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" /> 
            <span className="hidden sm:inline">Nouvelle Revue</span>
          </button>
        </div>
      </header>

      {/* 📊 KPI & SEARCH */}
      <section className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-0 space-y-4 md:space-y-6 lg:space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" role="list" aria-label="Statistiques des revues de processus">
          <KPICard title="Taux de scellement" val={`${stats.rate}%`} icon={ShieldCheck} color="emerald" />
          <KPICard title="Sessions totales" val={stats.total} icon={FileText} color="blue" />
          <KPICard title="Exercice 2026" val={stats.currentYear} icon={Calendar} color="indigo" />
          <KPICard title="Audit Statut" val={stats.rate >= 80 ? 'OK' : 'FAIL'} icon={Target} color={stats.rate >= 80 ? 'emerald' : 'amber'} />
        </div>
        <div className="relative group">
          <label htmlFor="review-search" className="sr-only">Rechercher une revue</label>
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-all pointer-events-none w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          <input 
            id="review-search"
            value={search} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} 
            placeholder="FILTRER PAR PROCESSUS, RÉFÉRENCE OU ANNÉE..." 
            className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] py-2.5 md:py-3 lg:py-6 pl-10 md:pl-16 pr-4 md:pr-6 lg:pr-8 text-[9px] md:text-[10px] lg:text-[11px] font-black italic text-white outline-none focus:border-indigo-500 transition-all uppercase tracking-widest"
            aria-label="Filtrer les revues de processus"
          />
        </div>
      </section>

      {/* 📋 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pt-0 md:pt-4">
        <article className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] overflow-hidden shadow-2xl mb-6 md:mb-8 lg:mb-10" role="region" aria-label="Liste des revues de processus">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" role="table">
              <thead className="bg-black/20 border-b border-white/5">
                <tr className="text-[8px] md:text-[9px] lg:text-[10px] text-slate-500 tracking-widest font-black italic">
                  <th className="p-4 md:p-6 lg:p-8 text-left" scope="col">Période</th>
                  <th className="p-4 md:p-6 lg:p-8 text-left" scope="col">Processus Impacté</th>
                  <th className="p-4 md:p-6 lg:p-8 text-left" scope="col">Référence SDE</th>
                  <th className="p-4 md:p-6 lg:p-8 text-left" scope="col">Statut Matrix</th>
                  <th className="p-4 md:p-6 lg:p-8 text-right px-8 md:px-10 lg:px-12" scope="col">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReviews.length > 0 ? filteredReviews.map((rev) => (
                  <tr 
                    key={rev.PRV_Id} 
                    onClick={() => router.push(`/dashboard/process-review/session/${rev.PRV_Id}`)} 
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/dashboard/process-review/session/${rev.PRV_Id}`); }}
                    className="group hover:bg-white/5 transition-all cursor-pointer focus-within:bg-white/5 focus:outline-none"
                    role="row"
                    tabIndex={0}
                    aria-label={`Revue de processus: ${rev.PRV_Processus?.PR_Libelle || 'Inconnu'} - ${rev.PRV_Month}/${rev.PRV_Year}`}
                  >
                    <td className="p-4 md:p-6 lg:p-8">
                      <span className="bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[11px] border border-white/5 group-hover:bg-indigo-600 transition-all inline-block">
                        {rev.PRV_Month.toString().padStart(2, '0')} / {rev.PRV_Year}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 lg:p-8">
                      <p className="text-base md:text-lg m-0 leading-none group-hover:text-indigo-400 transition-colors uppercase italic truncate">
                        {rev.PRV_Processus?.PR_Libelle || 'Non spécifié'}
                      </p>
                      <p className="text-[8px] md:text-[9px] text-slate-600 mt-1 md:mt-2 m-0 tracking-widest font-black italic">
                        {rev.PRV_Processus?.PR_Code || 'SDE-CORE'}
                      </p>
                    </td>
                    <td className="p-4 md:p-6 lg:p-8 text-[10px] md:text-[11px] font-bold text-slate-500 font-mono tracking-tighter truncate">
                      {rev.PRV_DocRef || `PRV-${rev.PRV_Id.slice(0, 8)}`}
                    </td>
                    <td className="p-4 md:p-6 lg:p-8">
                      <StatusBadge status={rev.PRV_Status} />
                    </td>
                    <td className="p-4 md:p-6 lg:p-8 text-right px-8 md:px-10 lg:px-12">
                      <ChevronRight size={20} className="w-5 h-5 md:w-6 md:h-6 text-slate-800 group-hover:text-white group-hover:translate-x-1 md:group-hover:translate-x-2 transition-all inline" aria-hidden="true" />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="p-12 md:p-16 lg:p-20 text-center text-slate-600" role="status">
                      <FileText size={48} className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                      <p className="text-[10px] md:text-[11px] tracking-widest">
                        {search ? 'Aucune revue ne correspond à la recherche' : 'Aucune revue de processus enregistrée'}
                      </p>
                      {!search && (
                        <button 
                          type="button"
                          onClick={() => router.push('/dashboard/process-review/preparation')}
                          className="mt-3 md:mt-4 text-[8px] md:text-[9px] text-indigo-400 hover:text-indigo-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-3 py-1"
                        >
                          Créer votre première revue
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:10px}:focus-visible{outline:2px solid #6366f1;outline-offset:2px}`}</style>
    </div>
  );
}