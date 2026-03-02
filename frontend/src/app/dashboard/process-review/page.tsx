/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛡️ FICHIER : app/(dashboard)/process-review/page.tsx
 * ===========================================================================
 * PAGE : REGISTRE DES REVUES DE PROCESSUS
 * RÔLE : Pilotage et surveillance de la performance des processus (ISO 9001 §9.1.1)
 * DESIGN : Cockpit Analytique SDE (Haute Densité, Orienté Action)
 * ARCHITECTURE : Zéro NextAuth (100% apiClient), Typage Strict.
 * DATE : 02 Mars 2026 | 12:58 GMT
 * ===========================================================================
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  Plus, ChevronRight, FileText, CheckCircle2,
  Clock, ShieldCheck, Activity, Loader2,
  Calendar, Search, RefreshCw, Target,
  Download
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- TYPES SÉCURISÉS ---
import type {
  ProcessReview as ProcessReviewType,
  ReviewStatus
} from '@/types/elite-sde';

// --- UTILITAIRE DE CLASSES ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

export default function ProcessReviewListPage() {
  const router = useRouter();

  // --- ÉTATS DU NOYAU ---
  const [reviews, setReviews] = useState<ProcessReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // --- 📡 CHARGEMENT DES DONNÉES SDE ---
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>('/process-reviews');
      // Sécurisation de l'extraction des données selon le format de réponse
      const data = res.data?.data || res.data || [];
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[PROCESS_REVIEWS] Erreur de synchronisation:', err);
      toast.error('Rupture de flux : Échec du chargement des revues de processus');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // --- 📊 CALCUL DES STATISTIQUES EN TEMPS RÉEL ---
  const stats = useMemo(() => {
    const total = reviews.length;
    const validated = reviews.filter(r => r.PRV_Status === 'VALIDEE' || r.PRV_Status === 'CLOTUREE').length;
    const rate = total > 0 ? Math.round((validated / total) * 100) : 0;
    const currentYearCount = reviews.filter(r => r.PRV_Year === new Date().getFullYear()).length;
    return { total, validated, rate, currentYear: currentYearCount };
  }, [reviews]);

  // --- 🔍 MOTEUR DE FILTRAGE DYNAMIQUE ---
  const filteredReviews = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    if (!searchLower) return reviews;

    return reviews.filter(r => {
      const processName = (r as any).PRV_Processus?.PR_Libelle || "";
      const processCode = (r as any).PRV_Processus?.PR_Code || "";
      const docRef = r.PRV_DocRef || "";

      return (
        processName.toLowerCase().includes(searchLower) ||
        processCode.toLowerCase().includes(searchLower) ||
        docRef.toLowerCase().includes(searchLower) ||
        r.PRV_Year.toString().includes(searchLower)
      );
    });
  }, [reviews, search]);

  // --- 🛰️ ÉCRAN DE CHARGEMENT ---
  if (loading) {
    return (
      <div className="ml-0 lg:ml-72 flex min-h-screen items-center justify-center bg-gray-50 italic">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" strokeWidth={2} />
          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600 animate-pulse">
            Synchronisation Matrix SDE...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-0 lg:ml-72 bg-gray-50 min-h-screen p-6 lg:p-10 font-sans italic selection:bg-indigo-100">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="mx-auto max-w-7xl space-y-10">
        
        {/* 🔝 HEADER STRATÉGIQUE */}
        <header className="border-b-2 border-gray-200 pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <span className="rounded-full bg-indigo-100 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-800 shadow-sm">
                  ISO 9001:2015 §9.1.1
                </span>
                <span className={cn(
                  "rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm",
                  stats.rate >= 80 ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                )}>
                  {stats.rate}% DE CONFORMITÉ
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-gray-900 italic leading-none m-0">
                REVUES DE <span className="text-indigo-600">PROCESSUS</span>
              </h1>
              <p className="mt-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest m-0">
                Surveillance et mesure de la performance des processus
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={fetchReviews}
                className="p-3 bg-white border-2 border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Rafraîchir les données"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push('/dashboard/process-review/preparation')}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer border-none"
              >
                <Plus className="mr-2 h-4 w-4" strokeWidth={3} />
                Nouvelle revue
              </button>
            </div>
          </div>

          {/* 🔍 BARRE DE RECHERCHE */}
          <div className="mt-8 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="FILTRER PAR PROCESSUS, RÉFÉRENCE OU ANNÉE..."
                className="w-full rounded-2xl border-2 border-gray-200 bg-white py-4 pl-14 pr-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* 📊 TABLEAU DE BORD KPI */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KPIStat
            title="Taux de scellement"
            value={`${stats.rate}%`}
            icon={ShieldCheck}
            color={stats.rate >= 90 ? 'emerald' : stats.rate >= 75 ? 'blue' : 'amber'}
            subtext="sessions validées"
          />
          <KPIStat
            title="Sessions totales"
            value={stats.total.toString()}
            icon={FileText}
            color="blue"
            subtext="historique matrix"
          />
          <KPIStat
            title={`Exercice ${new Date().getFullYear()}`}
            value={stats.currentYear.toString()}
            icon={Calendar}
            color="indigo"
            subtext="revues annuelles"
          />
          <KPIStat
            title="Statut ISO"
            value={stats.rate >= 80 ? 'CONFORME' : 'CRITIQUE'}
            icon={Target}
            color={stats.rate >= 80 ? 'emerald' : 'amber'}
            subtext="Audit prêt"
          />
        </div>

        {/* 📋 LISTE DES REVUES */}
        <div className="rounded-[2.5rem] bg-white shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="border-b-2 border-gray-100 bg-gray-50/80 px-8 py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 m-0">Registre des revues</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-2 m-0">SDE Kernel Data Management</p>
            </div>
            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
               <div className="h-2 w-32 rounded-full bg-gray-100 overflow-hidden">
                 <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${stats.rate}%` }} />
               </div>
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{stats.rate}% COMPLIANCE</span>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y-2 divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6 text-left whitespace-nowrap">Période</th>
                  <th className="px-8 py-6 text-left">Processus Impacté</th>
                  <th className="px-8 py-6 text-left whitespace-nowrap">Référence SDE</th>
                  <th className="px-8 py-6 text-left whitespace-nowrap">Statut Matrix</th>
                  <th className="px-8 py-6 text-right whitespace-nowrap">Pilotage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {filteredReviews.map((review) => (
                  <tr
                    key={review.PRV_Id}
                    onClick={() => router.push(`/dashboard/process-review/session/${review.PRV_Id}`)}
                    className="group cursor-pointer hover:bg-indigo-50/50 transition-colors"
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="inline-flex items-center rounded-xl bg-gray-100 px-4 py-2 text-[11px] font-black text-gray-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-gray-200 group-hover:border-indigo-700 shadow-sm">
                        {review.PRV_Month.toString().padStart(2, '0')} / {review.PRV_Year}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-black text-gray-900 uppercase tracking-tight m-0 group-hover:text-indigo-700 transition-colors">
                        {(review as any).PRV_Processus?.PR_Libelle || 'PROCESSUS NON SPÉCIFIÉ'}
                      </div>
                      <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-1 m-0">
                        {(review as any).PRV_Processus?.PR_Code || 'SDE-REF'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[11px] font-bold text-gray-500 font-mono whitespace-nowrap">
                      <span className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                         {review.PRV_DocRef || `PRV-${review.PRV_Id.slice(0, 8).toUpperCase()}`}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <StatusBadge status={review.PRV_Status} />
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm">
                           <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReviews.length === 0 && (
            <div className="p-24 text-center bg-gray-50/30">
              <div className="mx-auto h-24 w-24 rounded-full bg-white flex items-center justify-center border-2 border-dashed border-gray-200 shadow-sm">
                <FileText className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="mt-8 text-lg font-black uppercase text-gray-900 tracking-tighter m-0">Aucune donnée scellée</h3>
              <p className="mt-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest m-0">
                La matrix ne contient aucune revue correspondant à vos critères.
              </p>
            </div>
          )}
        </div>

        {/* 🛡️ BLOC DE CONFORMITÉ ISO & DIAGRAMME */}
        <div className="rounded-[3rem] bg-indigo-900 p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 pointer-events-none">
             <ShieldCheck size={250} />
          </div>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between relative z-10">
            <div className="flex-1">
              <div className="flex items-start gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                  <span className="text-2xl font-black italic">§</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic m-0">Protocole ISO 9001:2015 §9.1.1</h3>
                  <p className="mt-4 text-[13px] font-medium text-indigo-100 max-w-2xl leading-relaxed italic m-0">
                    L&apos;efficacité du Système de Management de la Qualité (SMQ) repose sur la mesure systématique et l&apos;amélioration continue (PDCA). Vos revues de processus scellées constituent la preuve formelle de surveillance de la performance opérationnelle.
                  </p>
                </div>
              </div>
              
              {/* Insertion contextuelle du diagramme PDCA */}
              <div className="mt-8 bg-black/20 p-6 rounded-3xl border border-white/10 inline-block">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-4 italic">Cycle d&apos;amélioration continue (PDCA)</p>
                
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <button
                onClick={() => router.push('/dashboard/process-review/preparation')}
                className="bg-white text-indigo-900 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-50 transition-all active:scale-95 border-none cursor-pointer flex items-center justify-center"
              >
                <Calendar className="mr-3 h-4 w-4" />
                Planifier exercice
              </button>
              <button className="bg-indigo-800/50 backdrop-blur-md border border-indigo-400/30 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center">
                <Download className="mr-3 h-4 w-4" />
                Exporter Registre
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(79, 70, 229, 0.5); }
      `}</style>
    </div>
  );
}

// ============================================================================
// COMPOSANTS ATOMIQUES
// ============================================================================

function KPIStat({ title, value, icon: Icon, color, subtext }: any) {
  const colors: any = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  };

  return (
    <div className="rounded-4xl bg-white p-6 lg:p-8 shadow-lg shadow-gray-200/30 border border-gray-100 transition-all hover:scale-105 duration-500 hover:shadow-xl">
      <div className="flex flex-col gap-5">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl border transition-all", colors[color])}>
          <Icon className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none m-0">{title}</p>
          <p className="mt-3 text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter italic leading-none m-0">{value}</p>
          <div className="mt-4 inline-block bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
             <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] m-0">{subtext}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const config: any = {
    BROUILLON: { label: 'BROUILLON', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <Clock size={12} strokeWidth={3} /> },
    EN_COURS: { label: 'EN COURS', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Activity size={12} strokeWidth={3} /> },
    VALIDEE: { label: 'VALIDÉE', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={12} strokeWidth={3} /> },
    CLOTUREE: { label: 'CLÔTURÉE', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <ShieldCheck size={12} strokeWidth={3} /> },
  };

  const { label, color, icon } = config[status] || config.BROUILLON;
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm", color)}>
      {icon}
      {label}
    </span>
  );
}