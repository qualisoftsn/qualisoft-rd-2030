/* eslint-disable @typescript-eslint/no-explicit-any */
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

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

export default function ProcessReviewListPage() {
  const router = useRouter();

  // --- ÉTATS ---
  const [reviews, setReviews] = useState<ProcessReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // --- CHARGEMENT DES DONNÉES ---
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>('/process-reviews');
      // Adaptation selon si l'API renvoie { data: [] } ou []
      const data = res.data?.data || res.data || [];
      setReviews(data);
    } catch (err) {
      console.error('[PROCESS_REVIEWS] API error:', err);
      toast.error('Échec du chargement des revues de processus');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // --- STATISTIQUES EN TEMPS RÉEL ---
  const stats = useMemo(() => {
    const total = reviews.length;
    const validated = reviews.filter(r => r.PRV_Status === 'VALIDEE' || r.PRV_Status === 'CLOTUREE').length;
    const rate = total > 0 ? Math.round((validated / total) * 100) : 0;
    const currentYearCount = reviews.filter(r => r.PRV_Year === new Date().getFullYear()).length;
    return { total, validated, rate, currentYear: currentYearCount };
  }, [reviews]);

  // --- FILTRAGE ---
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const processName = (r as any).PRV_Processus?.PR_Libelle || "";
      const processCode = (r as any).PRV_Processus?.PR_Code || "";
      const docRef = r.PRV_DocRef || "";
      const searchLower = search.toLowerCase();

      return (
        processName.toLowerCase().includes(searchLower) ||
        processCode.toLowerCase().includes(searchLower) ||
        docRef.toLowerCase().includes(searchLower) ||
        r.PRV_Year.toString().includes(searchLower)
      );
    });
  }, [reviews, search]);

  // --- GESTION DU CHARGEMENT ---
  if (loading) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50 italic">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Synchronisation Matrix SDE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6 font-sans italic">
      <Toaster position="top-right" richColors theme="dark" />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* 🔝 HEADER STRATÉGIQUE */}
        <header className="border-b border-gray-200 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-[9px] font-black uppercase tracking-tighter text-indigo-800">
                  ISO 9001:2015 §9.1.1
                </span>
                <span className={cn(
                  "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-tighter",
                  stats.rate >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                )}>
                  {stats.rate}% de conformité
                </span>
              </div>
              <h1 className="mt-2 text-3xl font-black uppercase tracking-tighter text-gray-900 italic">
                Revues de <span className="text-indigo-600">Processus</span>
              </h1>
              <p className="mt-1 text-xs font-bold text-gray-500 uppercase tracking-widest">
                Surveillance et mesure de la performance des processus §9.1.1
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
              <button
                onClick={fetchReviews}
                className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-90"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push('/dashboard/process-review/preparation')}
                className="inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle revue
              </button>
            </div>
          </div>

          {/* 🔍 BARRE DE RECHERCHE */}
          <div className="mt-8 max-w-lg">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="FILTRER PAR PROCESSUS, RÉFÉRENCE OU ANNÉE..."
                className="w-full rounded-2xl border-gray-200 bg-white py-3.5 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
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
            title="Exercice 2026"
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
          <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900">Registre des revues</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">SDE Kernel Data Management</p>
            </div>
            <div className="flex items-center gap-2">
               <div className="h-2 w-32 rounded-full bg-gray-100 overflow-hidden">
                 <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${stats.rate}%` }} />
               </div>
               <span className="text-[10px] font-black text-indigo-600 uppercase">{stats.rate}% Compliance</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-5 text-left">Période</th>
                  <th className="px-8 py-5 text-left">Processus Impacté</th>
                  <th className="px-8 py-5 text-left">Référence SDE</th>
                  <th className="px-8 py-5 text-left">Statut Matrix</th>
                  <th className="px-8 py-5 text-right">Pilotage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {filteredReviews.map((review) => (
                  <tr
                    key={review.PRV_Id}
                    onClick={() => router.push(`/dashboard/process-review/session/${review.PRV_Id}`)}
                    className="group cursor-pointer hover:bg-indigo-50/30 transition-all"
                  >
                    <td className="px-8 py-5">
                      <div className="inline-flex items-center rounded-xl bg-gray-100 px-3 py-1.5 text-[10px] font-black text-gray-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {review.PRV_Month.toString().padStart(2, '0')}/{review.PRV_Year}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-gray-900 uppercase tracking-tight">
                        {(review as any).PRV_Processus?.PR_Libelle || 'NON SPÉCIFIÉ'}
                      </div>
                      <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
                        {(review as any).PRV_Processus?.PR_Code || 'SDE-REF'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-[11px] font-bold text-gray-500 font-mono">
                      {review.PRV_DocRef || `PRV-${review.PRV_Id.slice(0, 8).toUpperCase()}`}
                    </td>
                    <td className="px-8 py-5">
                      <StatusBadge status={review.PRV_Status} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
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
            <div className="p-20 text-center">
              <div className="mx-auto h-20 w-20 rounded-4xl bg-gray-50 flex items-center justify-center border border-dashed border-gray-200">
                <FileText className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="mt-6 text-sm font-black uppercase text-gray-900">Aucune donnée scellée</h3>
              <p className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                La matrix ne contient aucune revue correspondant à vos critères.
              </p>
            </div>
          )}
        </div>

        {/* 🛡️ BLOC DE CONFORMITÉ ISO */}
        <div className="rounded-[2.5rem] bg-indigo-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 pointer-events-none">
             <ShieldCheck size={200} />
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <span className="text-xl font-black italic">§</span>
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter italic">Protocole ISO 9001:2015 §9.1.1</h3>
                <p className="mt-1 text-sm font-medium text-indigo-200/80 max-w-2xl leading-relaxed italic">
                  L&apos;efficacité du SMQ repose sur la mesure systématique. Vos revues de processus scellées constituent la preuve de surveillance de la performance opérationnelle.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push('/dashboard/process-review/preparation')}
                className="bg-white text-indigo-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all active:scale-95"
              >
                <Calendar className="mr-2 h-4 w-4 inline" />
                Planifier exercice
              </button>
              <button className="bg-indigo-700/50 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
                <Download className="mr-2 h-4 w-4 inline" />
                Exporter Registre
              </button>
            </div>
          </div>
        </div>
      </div>
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
    <div className="rounded-4xl bg-white p-6 shadow-xl shadow-gray-200/30 border border-gray-100 transition-all hover:scale-105 duration-500">
      <div className="flex flex-col gap-4">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border transition-all", colors[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none">{title}</p>
          <p className="mt-2 text-3xl font-black text-gray-900 tracking-tighter italic leading-none">{value}</p>
          <p className="mt-3 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{subtext}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const config: any = {
    BROUILLON: { label: 'BROUILLON', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <Clock size={12} /> },
    EN_COURS: { label: 'EN COURS', color: 'bg-blue-100 text-blue-600 border-blue-200', icon: <Activity size={12} /> },
    VALIDEE: { label: 'VALIDÉE', color: 'bg-emerald-100 text-emerald-600 border-emerald-200', icon: <CheckCircle2 size={12} /> },
    CLOTUREE: { label: 'CLÔTURÉE', color: 'bg-indigo-100 text-indigo-600 border-indigo-200', icon: <ShieldCheck size={12} /> },
  };

  const { label, color, icon } = config[status] || config.BROUILLON;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border", color)}>
      {icon}
      {label}
    </span>
  );
}