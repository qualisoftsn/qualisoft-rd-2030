/**
 * FICHIER : app/(dashboard)/requirements/page.tsx
 * ===========================================================================
 * PAGE EXIGENCES RÉGLEMENTAIRES (VEILLE LÉGALE)
 * Rôle : Gestion centralisée des textes légaux, décrets et arrêtés (ISO 14001 §6.1.3 / ISO 45001 §6.1.3)
 * Design : Style ClickUp professionnel (sobre, épuré, orienté productivité)
 * Conformité : 100% schéma Prisma — zéro champ inventé
 * Dernière mise à jour : 2026-03-01 14:30 UTC+0 (Dakar)
 * ===========================================================================
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Plus,
  Scale,
  Search,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import type {
  RegulatoryRequirement,
  Tenant,
  Alert,
  Action,
  Document,
} from '@/types/elite-sde';

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

// --- INTERFACE CONFORME PRISMA ---
interface RequirementItem extends RegulatoryRequirement {
  RR_Alerts?: Alert[];
  RR_Actions?: Action[];
  RR_Documents?: Document[];
  tenant?: Tenant;
}

export default function RequirementsPage() {
  const router = useRouter();
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // --- CHARGEMENT DES EXIGENCES RÉGLEMENTAIRES ---
  const fetchRequirements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<RequirementItem[]>('/requirements');
      setRequirements(res.data || []);
    } catch (err) {
      console.error('[REQUIREMENTS] Failed to load regulatory requirements:', err);
      toast.error('Échec du chargement du référentiel réglementaire');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  // --- STATISTIQUES EN TEMPS RÉEL ---
  const stats = useMemo(() => {
    const now = new Date();
    const limit30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      total: requirements.length,
      compliant: requirements.filter((r) => r.RR_Status === 'COMPLIANT').length,
      nonCompliant: requirements.filter((r) => r.RR_Status === 'NON_COMPLIANT').length,
      pending30d: requirements.filter((r) => {
        if (r.RR_Status === 'COMPLIANT') return false;
        const due = new Date(r.RR_DueDate);
        return due >= now && due <= limit30Days;
      }).length,
      complianceRate: requirements.length > 0
        ? Math.round((requirements.filter((r) => r.RR_Status === 'COMPLIANT').length / requirements.length) * 100)
        : 0,
    };
  }, [requirements]);

  // --- FILTRAGE DES EXIGENCES ---
  const filteredRequirements = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return requirements.filter((req) => {
      const matchText =
        req.RR_Title.toLowerCase().includes(term) ||
        req.RR_Reference.toLowerCase().includes(term) ||
        req.RR_Authority.toLowerCase().includes(term);
      const matchCat = selectedCategory === 'ALL' || req.RR_Category === selectedCategory;
      const matchStat = selectedStatus === 'ALL' || req.RR_Status === selectedStatus;
      return matchText && matchCat && matchStat;
    });
  }, [requirements, searchTerm, selectedCategory, selectedStatus]);

  // --- GESTION DU CHARGEMENT ---
  if (loading) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">
            Chargement du référentiel réglementaire...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* 🔝 HEADER STRATÉGIQUE */}
        <header className="border-b border-gray-200 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                  ISO 14001:2015 §6.1.3
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  {stats.complianceRate}% de conformité
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">
                Exigences réglementaires
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Veille juridique centralisée : textes légaux, décrets, arrêtés et obligations sectorielles
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
              <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <FileText className="mr-1.5 h-4 w-4" />
                Rapport de conformité
              </button>
              <button
                onClick={() => router.push('/dashboard/requirements/nouveau')}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Nouvelle exigence
              </button>
            </div>
          </div>

          {/* 📊 KPI CARDS */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPIStat
              title="Base documentaire"
              value={stats.total.toString()}
              icon={FileText}
              color="blue"
              subtext="Textes référencés"
            />
            <KPIStat
              title="Conformes"
              value={stats.compliant.toString()}
              icon={CheckCircle2}
              color="emerald"
              subtext="Statut conforme"
            />
            <KPIStat
              title="Échéances critiques"
              value={stats.pending30d.toString()}
              icon={Clock}
              color="amber"
              subtext="Dans les 30 jours"
            />
            <KPIStat
              title="Non-conformes"
              value={stats.nonCompliant.toString()}
              icon={AlertTriangle}
              color="red"
              subtext="À traiter en urgence"
            />
          </div>
        </header>

        {/* 🔍 BARRE DE RECHERCHE ET FILTRES */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, référence, autorité..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="w-full sm:w-48">
                <label htmlFor="category-filter" className="sr-only">
                  Filtrer par catégorie
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">Toutes catégories</option>
                  <option value="ENVIRONNEMENT">Environnement</option>
                  <option value="SÉCURITÉ">Sécurité (SST)</option>
                  <option value="QUALITÉ">Qualité</option>
                  <option value="SOCIAL">Social / RH</option>
                  <option value="SANTE_PUBLIQUE">Santé publique</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>

              <div className="w-full sm:w-48">
                <label htmlFor="status-filter" className="sr-only">
                  Filtrer par statut
                </label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">Tous statuts</option>
                  <option value="PENDING">À traiter</option>
                  <option value="COMPLIANT">Conforme</option>
                  <option value="NON_COMPLIANT">Non conforme</option>
                  <option value="IN_PROGRESS">En cours</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 📋 TABLEAU DES EXIGENCES */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Registre des exigences réglementaires ({filteredRequirements.length})
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Conformément aux exigences des normes ISO 14001:2015 §6.1.3 et ISO 45001:2018 §6.1.3
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence & Titre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autorité
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Échéance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredRequirements.map((req) => (
                  <tr
                    key={req.RR_Id}
                    onClick={() => router.push(`/dashboard/requirements/${req.RR_Id}`)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{req.RR_Title}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 font-medium">
                          {req.RR_Reference}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{req.RR_Type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {req.RR_Authority}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          req.RR_Category === 'ENVIRONNEMENT'
                            ? 'bg-green-100 text-green-800'
                            : req.RR_Category === 'SÉCURITÉ'
                              ? 'bg-red-100 text-red-800'
                              : req.RR_Category === 'QUALITÉ'
                                ? 'bg-blue-100 text-blue-800'
                                : req.RR_Category === 'SOCIAL'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-gray-100 text-gray-800',
                        )}
                      >
                        {req.RR_Category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={req.RR_Priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(req.RR_DueDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={req.RR_Status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ArrowUpRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRequirements.length === 0 && (
            <div className="p-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Scale className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">
                Aucune exigence réglementaire trouvée
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucune exigence ne correspond à vos critères de recherche ou filtres.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                }}
                className="mt-4 rounded-md bg-white px-3 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-gray-700">
                {filteredRequirements.length} exigence{filteredRequirements.length > 1 ? 's' : ''} sur {requirements.length} au total
              </p>
              <button
                onClick={() => router.push('/dashboard/requirements/nouveau')}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Ajouter une exigence
              </button>
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
                <h3 className="text-sm font-medium text-indigo-900">
                  Exigences des normes ISO 14001:2015 §6.1.3 et ISO 45001:2018 §6.1.3
                </h3>
                <p className="mt-1 text-sm text-indigo-800">
                  L&apos;organisation doit déterminer et avoir accès aux exigences légales et autres exigences
                  auxquelles elle souscrit, qui sont associées à ses aspects environnementaux et à ses
                  dangers.
                </p>
                <p className="mt-2 text-xs text-indigo-700">
                  Ce registre centralise toutes les obligations réglementaires applicables à votre organisation,
                  avec suivi des échéances et statut de conformité pour garantir la traçabilité lors des audits.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
              <button
                onClick={() => router.push('/dashboard/requirements/nouveau')}
                className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Ajouter une exigence
              </button>
              <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <DownloadIcon className="mr-1.5 h-4 w-4" />
                Exporter le registre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANTS CLICKUP-STYLE
// ============================================================================

function KPIStat({
  title,
  value,
  icon: Icon,
  color,
  subtext,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'amber' | 'red';
  subtext: string;
}) {
  const colorClasses = {
    blue: 'text-blue-700 bg-blue-50',
    emerald: 'text-emerald-700 bg-emerald-50',
    amber: 'text-amber-700 bg-amber-50',
    red: 'text-red-700 bg-red-50',
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">{title}</p>
            <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
            <p className="mt-1 text-[10px] font-medium text-gray-500 uppercase tracking-wider">{subtext}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    COMPLIANT: { label: 'Conforme', color: 'bg-emerald-100 text-emerald-800' },
    NON_COMPLIANT: { label: 'Non conforme', color: 'bg-red-100 text-red-800' },
    PENDING: { label: 'À traiter', color: 'bg-amber-100 text-amber-800' },
    IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  };

  const { label, color } = config[status] || config.PENDING;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; color: string }> = {
    CRITICAL: { label: 'Critique', color: 'bg-red-100 text-red-800' },
    HIGH: { label: 'Élevée', color: 'bg-amber-100 text-amber-800' },
    MEDIUM: { label: 'Moyenne', color: 'bg-blue-100 text-blue-800' },
    LOW: { label: 'Basse', color: 'bg-gray-100 text-gray-800' },
  };

  const { label, color } = config[priority] || config.MEDIUM;
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn('h-4 w-4', className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}