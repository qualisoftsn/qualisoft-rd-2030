/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Gavel, Calendar, MessageSquare, 
  TrendingUp, Award, Zap, ChevronRight, LayoutDashboard,
  CheckCircle2, AlertTriangle, BarChart3, Users, FileText,
  RefreshCw, Download, Plus
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- TYPES CONFORMES PRISMA ---
interface GovernanceStats {
  complianceScore: number;
  planningCompletion: number;
  maturityLevel: string;
  upcomingMeetings: number;
  decisionsPending: number;
  regulatoryUpdates: number;
}

export default function GovernanceExcellence() {
  const [stats, setStats] = useState<GovernanceStats>({
    complianceScore: 0,
    planningCompletion: 0,
    maturityLevel: 'N/A',
    upcomingMeetings: 0,
    decisionsPending: 0,
    regulatoryUpdates: 0,
  });
  const [loading, setLoading] = useState(true);

  // --- CHARGEMENT DES STATISTIQUES RÉELLES ---
  useEffect(() => {
    const loadGovernanceStats = async () => {
      try {
        // 🔑 SIMULATION : À remplacer par appel API réel vers /governance/stats
        // Exemple de payload backend attendu :
        // {
        //   complianceScore: 92,
        //   planningCompletion: 78,
        //   maturityLevel: 'Niveau 3',
        //   upcomingMeetings: 4,
        //   decisionsPending: 17,
        //   regulatoryUpdates: 3
        // }
        await new Promise(resolve => setTimeout(resolve, 800));
        setStats({
          complianceScore: 92,
          planningCompletion: 78,
          maturityLevel: 'Niveau 3',
          upcomingMeetings: 4,
          decisionsPending: 17,
          regulatoryUpdates: 3,
        });
      } catch (err) {
        console.error('[GOVERNANCE] Failed to load stats:', err);
        toast.error('Échec du chargement des indicateurs de gouvernance');
      } finally {
        setLoading(false);
      }
    };
    loadGovernanceStats();
  }, []);

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* 🔝 HEADER STRATÉGIQUE */}
        <header className="border-b border-gray-200 pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                  ISO 9001:2015 §9.3
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Maturité SMI: {stats.maturityLevel}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold text-gray-900">Gouvernance stratégique</h1>
              <p className="mt-2 text-sm text-gray-600">
                Pilotage des revues de direction, conformité réglementaire et prise de décision stratégique
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
              <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <Download className="mr-1.5 h-4 w-4" />
                Exporter le rapport
              </button>
              <Link
                href="/dashboard/gouvernance/copil"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <LayoutDashboard className="mr-1.5 h-4 w-4" />
                Dashboard COPIL
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* 📊 KPI RAPIDE */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KPIBadge
              label="Conformité réglementaire"
              value={`${stats.complianceScore}%`}
              trend="up"
              icon={ShieldCheck}
              color="emerald"
            />
            <KPIBadge
              label="Planification exécutée"
              value={`${stats.planningCompletion}%`}
              trend="neutral"
              icon={Calendar}
              color="blue"
            />
            <KPIBadge
              label="Décisions en attente"
              value={stats.decisionsPending.toString()}
              trend="down"
              icon={MessageSquare}
              color="amber"
            />
          </div>
        </header>

        {/* 🚀 PILIERS DE GOUVERNANCE (§9.1 / §9.3) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* PILIER 1 : VEILLE LÉGALE & CONFORMITÉ */}
          <Link
            href="/dashboard/gouvernance/compliance"
            className="group block rounded-xl bg-white p-7 shadow-sm transition-all hover:shadow-md border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                  <Gavel className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-gray-900">Veille légale & conformité</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Surveillance des exigences réglementaires sénégalaises et internationales (ANSD, RGPD, ISO).
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>Niveau de conformité</span>
                <span className="text-indigo-600">{stats.complianceScore}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${stats.complianceScore}%` }}
                />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-gray-500">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>{stats.regulatoryUpdates} mises à jour réglementaires ce mois</span>
            </div>
          </Link>

          {/* PILIER 2 : PLANIFICATION STRATÉGIQUE */}
          <Link
            href="/dashboard/gouvernance/planning"
            className="group block rounded-xl bg-white p-7 shadow-sm transition-all hover:shadow-md border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Calendar className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-gray-900">Planification stratégique</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Calendrier des revues de direction, COPIL et jalons critiques du système de management.
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>Exécution du plan</span>
                <span className="text-emerald-600">{stats.planningCompletion}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${stats.planningCompletion}%` }}
                />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{stats.upcomingMeetings} réunions planifiées dans les 30 jours</span>
            </div>
          </Link>

          {/* PILIER 3 : SÉANCES & DÉCISIONS */}
          <Link
            href="/dashboard/gouvernance/sessions"
            className="group block rounded-xl bg-white p-7 shadow-sm transition-all hover:shadow-md border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-gray-900">Séances & décisions</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Traçabilité des arbitrages, suivi des actions décidées et capitalisation des retours d&apos;expérience.
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>Décisions en attente</span>
                <span className="text-amber-600">{stats.decisionsPending}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${Math.min(stats.decisionsPending * 5, 100)}%` }}
                />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-gray-500">
              <Users className="h-4 w-4 text-gray-400" />
              <span>124 décisions archivées depuis le dernier audit</span>
            </div>
          </Link>
        </div>

        {/* 📈 TABLEAU DE BORD DE MATURITÉ */}
        <div className="rounded-xl bg-white p-7 shadow-sm border border-gray-200">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800">
                  <Award className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Maturité du Système de Management Intégré</h2>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Évaluation selon le modèle de maturité ISO 9004:2018 — Niveau actuel :{' '}
                <span className="font-bold text-indigo-700">{stats.maturityLevel}</span>
              </p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="w-full sm:w-64">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                    <span>Progrès vers Niveau 4</span>
                    <span>78%</span>
                  </div>
                  <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: '78%' }} />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 rounded-full ${
                          level <= 3 ? 'bg-indigo-600' : level === 4 ? 'bg-gray-300' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                    <FileText className="mr-1.5 h-4 w-4" />
                    Rapport de maturité
                  </button>
                  <button className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Plan d&apos;amélioration
                  </button>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="h-32 w-32 rounded-full bg-linear-to-br from-indigo-50 to-indigo-100 p-4">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white shadow-md">
                  <span className="text-3xl font-bold text-indigo-700">{stats.maturityLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🛡️ BLOC DE CONFORMITÉ ISO */}
        <div className="rounded-xl bg-indigo-50 p-6 border border-indigo-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                <span className="text-xs font-bold text-white">§</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-indigo-900">Exigence ISO 9001:2015 §9.3</h3>
                <p className="mt-1 text-sm text-indigo-800">
                  La revue de direction doit démontrer que le système de management est maintenu adéquat, approprié et efficace.
                </p>
                <p className="mt-2 text-xs text-indigo-700">
                  Toutes les activités de gouvernance sont scellées avec horodatage certifié et traçabilité complète pour audit.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/gouvernance/copil"
              className="mt-4 inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50 md:mt-0"
            >
              Accéder au dashboard COPIL
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANTS CLICKUP-STYLE
// ============================================================================

function KPIBadge({
  label,
  value,
  trend,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: 'emerald' | 'blue' | 'amber' | 'red';
}) {
  const colorClasses = {
    emerald: 'text-emerald-700 bg-emerald-50',
    blue: 'text-blue-700 bg-blue-50',
    amber: 'text-amber-700 bg-amber-50',
    red: 'text-red-700 bg-red-50',
  };

  const trendIcon = {
    up: <ChevronRight className="h-4 w-4 rotate-45 text-emerald-600" />,
    down: <ChevronRight className="h-4 w-4 -rotate-45 text-red-600" />,
    neutral: <div className="h-4 w-4" />,
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', colorClasses[color])}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-0.5 text-xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {trendIcon[trend]}
      </div>
    </div>
  );
}

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');