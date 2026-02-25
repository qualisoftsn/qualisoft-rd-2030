/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FICHIER : app/(dashboard)/quality/root-cause/page.tsx
 * ===========================================================================
 * PAGE ANALYSE DES CAUSES RACINES (ROOT CAUSE ANALYSIS)
 * Rôle : Détermination des causes fondamentales des écarts (ISO 9001 §10.2.1.b)
 * Méthodes : 5 Pourquoi & Ishikawa (5M)
 * Design : Style ClickUp professionnel (sobre, épuré, orienté productivité)
 * Conformité : 100% schéma Prisma — zéro champ inventé
 * ===========================================================================
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import {
  AlertOctagon,
  ArrowLeft,
  FileSearch,
  GitBranch,
  Info,
  Loader2,
  Microscope,
  Save,
  Target,
  Zap,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import type { NonConformite, NCStatus } from '@/types/elite-sde';
import { NCStatus as NCStatusEnum } from '@/types/elite-sde';

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

// --- TYPES ---
interface IshikawaData {
  MAIN_DOEUVRE: string;
  METHODE: string;
  MILIEU: string;
  MATERIEL: string;
  MATIERE: string;
}

export default function RootCauseAnalysisPage() {
  // --- ÉTATS ---
  const [ncList, setNcList] = useState<NonConformite[]>([]);
  const [selectedNc, setSelectedNc] = useState<NonConformite | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [whys, setWhys] = useState<string[]>(['', '', '', '', '']);
  const [ishikawa, setIshikawa] = useState<IshikawaData>({
    MAIN_DOEUVRE: '',
    METHODE: '',
    MILIEU: '',
    MATERIEL: '',
    MATIERE: '',
  });

  // --- CHARGEMENT DES NC OUVERTES ---
  const loadNCs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<NonConformite[]>('/non-conformites');
      // Filtrer les NC nécessitant une analyse (non clôturées)
      const openNCs = (res.data || []).filter(
        (nc) => nc.NC_Statut !== NCStatusEnum.CLOTURE && nc.NC_Statut !== NCStatusEnum.VERIFICATION
      );
      setNcList(openNCs);
    } catch (err) {
      console.error('[ROOT_CAUSE] Failed to load NCs:', err);
      toast.error('Échec du chargement des non-conformités');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNCs();
  }, [loadNCs]);

  // --- SÉLECTION D'UNE NC ---
  const handleSelectNc = (nc: NonConformite) => {
    setSelectedNc(nc);
    // Réinitialiser les états d'analyse
    setWhys(nc.NC_Diagnostic ? parseWhysFromDiagnostic(nc.NC_Diagnostic) : ['', '', '', '', '']);
    setIshikawa(nc.NC_Diagnostic ? parseIshikawaFromDiagnostic(nc.NC_Diagnostic) : {
      MAIN_DOEUVRE: '',
      METHODE: '',
      MILIEU: '',
      MATERIEL: '',
      MATIERE: '',
    });
  };

  // --- PARSING DU DIAGNOSTIC EXISTANT ---
  const parseWhysFromDiagnostic = (diagnostic: string): string[] => {
   const whysMatch = diagnostic.match(/5 Pourquoi\s*:\s*([\s\S]+?)(?:\r?\n\s*\r?\n|$)/);
    if (whysMatch && whysMatch[1]) {
      return whysMatch[1].split(' -> ').map(w => w.trim());
    }
    return ['', '', '', '', ''];
  };

  const parseIshikawaFromDiagnostic = (diagnostic: string): IshikawaData => {
    const ishikawaMatch = diagnostic.match(/Ishikawa\s*:\s*([\s\S]+?)(?=\n\s*\n|\n[A-Z].*?:|$)/);
    if (ishikawaMatch && ishikawaMatch[1]) {
      const lines = ishikawaMatch[1].split('\n');
      return {
        MAIN_DOEUVRE: lines.find(l => l.includes('Main d\'œuvre'))?.split(': ')[1] || '',
        METHODE: lines.find(l => l.includes('Méthode'))?.split(': ')[1] || '',
        MILIEU: lines.find(l => l.includes('Milieu'))?.split(': ')[1] || '',
        MATERIEL: lines.find(l => l.includes('Matériel'))?.split(': ')[1] || '',
        MATIERE: lines.find(l => l.includes('Matière'))?.split(': ')[1] || '',
      };
    }
    return {
      MAIN_DOEUVRE: '',
      METHODE: '',
      MILIEU: '',
      MATERIEL: '',
      MATIERE: '',
    };
  };

  // --- FORMATAGE DU DIAGNOSTIC POUR SAUVEGARDE ---
  const formatDiagnostic = (): string => {
    const filteredWhys = whys.filter(w => w.trim());
    const whysText = filteredWhys.length > 0 
      ? `5 Pourquoi: ${filteredWhys.join(' -> ')}`
      : '';

    const ishikawaText = [
      ishikawa.MAIN_DOEUVRE && `- Main d'œuvre: ${ishikawa.MAIN_DOEUVRE}`,
      ishikawa.METHODE && `- Méthode: ${ishikawa.METHODE}`,
      ishikawa.MILIEU && `- Milieu: ${ishikawa.MILIEU}`,
      ishikawa.MATERIEL && `- Matériel: ${ishikawa.MATERIEL}`,
      ishikawa.MATIERE && `- Matière: ${ishikawa.MATIERE}`,
    ]
      .filter(Boolean)
      .join('\n');

    return `${whysText}${whysText && ishikawaText ? '\n\n' : ''}${ishikawaText ? `Ishikawa:\n${ishikawaText}` : ''}`;
  };

  // --- SAUVEGARDE DE L'ANALYSE ---
  const handleSaveAnalysis = async () => {
    if (!selectedNc) {
      toast.warning('Veuillez sélectionner une non-conformité à analyser');
      return;
    }

    // Validation : au moins le premier pourquoi doit être rempli
    if (!whys[0].trim()) {
      toast.warning('Le premier "Pourquoi" est obligatoire pour valider l\'analyse');
      return;
    }

    setIsSaving(true);
    try {
      const diagnostic = formatDiagnostic();
      
      await apiClient.patch(`/non-conformites/${selectedNc.NC_Id}`, {
        NC_Diagnostic: diagnostic,
        NC_Statut: NCStatusEnum.ANALYSE,
      });

      toast.success('Analyse des causes racines enregistrée avec succès');
      loadNCs(); // Rafraîchir la liste pour mettre à jour le statut
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de l\'enregistrement de l\'analyse';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSaving(false);
    }
  };

  // --- GESTION DU CHARGEMENT ---
  if (loading) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Chargement des non-conformités...</p>
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
                  ISO 9001:2015 §10.2.1.b
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  {ncList.length} NC à analyser
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">Analyse des causes racines</h1>
              <p className="mt-1 text-sm text-gray-600">
                Identification systématique des causes fondamentales des écarts à l&apos;aide des méthodes 5 Pourquoi et Ishikawa (5M)
              </p>
            </div>

            <button
              onClick={handleSaveAnalysis}
              disabled={!selectedNc || isSaving || !whys[0].trim()}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement en cours...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  Enregistrer l&apos;analyse
                </>
              )}
            </button>
          </div>
        </header>

        {/* 🧪 LABORATOIRE D'ANALYSE */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* COLONNE 1 : SÉLECTION DE LA NC */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Non-conformités à analyser</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Sélectionnez une NC nécessitant une analyse des causes racines
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {ncList.length > 0 ? (
                  ncList.map((nc) => {
                    const isSelected = selectedNc?.NC_Id === nc.NC_Id;
                    return (
                      <button
                        key={nc.NC_Id}
                        onClick={() => handleSelectNc(nc)}
                        className={cn(
                          'w-full px-6 py-5 text-left transition-colors',
                          isSelected
                            ? 'bg-indigo-50 border-l-4 border-indigo-600'
                            : 'hover:bg-gray-50'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                                {nc.NC_Code || `NC-${nc.NC_Id.slice(0, 6).toUpperCase()}`}
                              </span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs font-medium text-gray-700">
                                {nc.NC_Source === 'INTERNAL_AUDIT' ? 'Audit interne' :
                                 nc.NC_Source === 'EXTERNAL_AUDIT' ? 'Audit externe' :
                                 nc.NC_Source === 'CLIENT_COMPLAINT' ? 'Réclamation client' :
                                 nc.NC_Source === 'SUPPLIER' ? 'Fournisseur' :
                                 nc.NC_Source === 'INCIDENT_SAFETY' ? 'Incident SST' :
                                 nc.NC_Source === 'PROCESS_REVIEW' ? 'Revue processus' :
                                 'Revue direction'}
                              </span>
                            </div>
                            <p className="mt-2 text-sm font-medium text-gray-900 line-clamp-2">
                              {nc.NC_Libelle}
                            </p>
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Target className="h-3.5 w-3.5 text-gray-400" />
                                <span>
                                  Gravité:{' '}
                                  <span className={cn(
                                    'font-medium',
                                    nc.NC_Gravite === 'CRITIQUE' ? 'text-red-600' :
                                    nc.NC_Gravite === 'MAJEURE' ? 'text-orange-600' : 'text-yellow-600'
                                  )}>
                                    {nc.NC_Gravite}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="shrink-0 text-indigo-600">
                              <Microscope className="h-5 w-5" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-12 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <AlertOctagon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-sm font-medium text-gray-900">Aucune NC à analyser</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Toutes les non-conformités sont soit clôturées, soit déjà analysées
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLONNES 2-3 : FORMULAIRE D'ANALYSE */}
          <div className="lg:col-span-2 space-y-8">
            {selectedNc ? (
              <>
                {/* SECTION : CONTEXTE DE LA NC */}
                <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
                      <AlertOctagon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">{selectedNc.NC_Libelle}</h2>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">&quot;{selectedNc.NC_Description}&quot;</p>
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                          <span>Gravité: {selectedNc.NC_Gravite}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ClockIcon className="h-3.5 w-3.5" />
                          <span>Détection: {new Date(selectedNc.NC_CreatedAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION : MÉTHODE DES 5 POURQUOI */}
                <div className="rounded-xl bg-white shadow-sm border border-gray-200">
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                      Méthode des 5 Pourquoi
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Questionnez successivement pour identifier la cause racine (minimum 1 réponse requise)
                    </p>
                  </div>
                  <div className="p-6 space-y-6">
                    {whys.map((why, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-bold text-sm">
                            {index + 1}
                          </div>
                          <label htmlFor={`why-${index}`} className="text-sm font-medium text-gray-700">
                            Pourquoi {index === 0 ? 'l\'écart s\'est-il produit' : 'cela est-il arrivé'} ?
                          </label>
                        </div>
                        <input
                          id={`why-${index}`}
                          type="text"
                          value={why}
                          onChange={(e) => {
                            const newWhys = [...whys];
                            newWhys[index] = e.target.value;
                            setWhys(newWhys);
                          }}
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder={
                            index === 0
                              ? 'Ex: Le technicien n\'a pas suivi la procédure de réception...'
                              : 'Ex: La procédure n\'était pas accessible sur le poste de travail...'
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION : DIAGRAMME D'ISHIKAWA (5M) */}
                <div className="rounded-xl bg-white shadow-sm border border-gray-200">
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                      Diagramme d&apos;Ishikawa (5M)
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Analysez les facteurs contributeurs selon les 5 dimensions classiques
                    </p>
                  </div>
                  <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {[
                      { key: 'MAIN_DOEUVRE', label: 'Main d\'œuvre', placeholder: 'Compétences, formation, fatigue, communication...' },
                      { key: 'METHODE', label: 'Méthode', placeholder: 'Procédures, instructions, modes opératoires, plans...' },
                      { key: 'MATERIEL', label: 'Matériel', placeholder: 'Machines, outils, équipements, maintenance, logiciels...' },
                      { key: 'MATIERE', label: 'Matière', placeholder: 'Intrants, matières premières, données, informations...' },
                      { key: 'MILIEU', label: 'Milieu', placeholder: 'Environnement, température, éclairage, organisation de l\'espace...' },
                    ].map((factor) => (
                      <div key={factor.key} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label htmlFor={`ishikawa-${factor.key}`} className="text-sm font-medium text-gray-700">
                            {factor.label}
                          </label>
                          <div
                            className="group relative"
                            onMouseEnter={(e) => {
                              const tooltip = e.currentTarget.querySelector('.tooltip') as HTMLElement;
                              if (tooltip) tooltip.style.display = 'block';
                            }}
                            onMouseLeave={(e) => {
                              const tooltip = e.currentTarget.querySelector('.tooltip') as HTMLElement;
                              if (tooltip) tooltip.style.display = 'none';
                            }}
                          >
                            <Info className="h-4 w-4 text-gray-400 cursor-help" aria-hidden="true" />
                            <div className="tooltip absolute bottom-full left-1/2 z-10 hidden w-64 -translate-x-1/2 transform rounded-lg bg-gray-900 p-3 text-xs text-white shadow-lg before:absolute before:left-1/2 before:top-full before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-gray-900">
                              {factor.placeholder}
                            </div>
                          </div>
                        </div>
                        <textarea
                          id={`ishikawa-${factor.key}`}
                          value={(ishikawa as any)[factor.key]}
                          onChange={(e) => setIshikawa({ ...ishikawa, [factor.key]: e.target.value })}
                          rows={3}
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder={factor.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* BOUTON DE SAUVEGARDE EN BAS */}
                <div className="sticky bottom-6 rounded-xl bg-white shadow-sm border border-gray-200 p-6">
                  <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
                    <p className="text-sm text-gray-500">
                      L&apos;analyse sera enregistrée dans le champ &quot;Diagnostic&quot; de la non-conformité et son statut passera à &quot;Analyse&quot;
                    </p>
                    <button
                      onClick={handleSaveAnalysis}
                      disabled={isSaving || !whys[0].trim()}
                      className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Save className="mr-1.5 h-4 w-4" />
                          Enregistrer l&apos;analyse des causes racines
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-12 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Microscope className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Sélectionnez une non-conformité</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Choisissez une NC dans la liste de gauche pour commencer l&apos;analyse des causes racines
                </p>
                <div className="mt-8 flex justify-center">
                  <div className="h-1 w-32 rounded-full bg-indigo-200">
                    <div className="h-full w-1/3 rounded-full bg-indigo-600" />
                  </div>
                </div>
              </div>
            )}
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
                <h3 className="text-sm font-medium text-indigo-900">Exigence ISO 9001:2015 §10.2.1.b</h3>
                <p className="mt-1 text-sm text-indigo-800">
                  Lorsqu&apos;une non-conformité survient, l&apos;organisation doit évaluer la nécessité d&apos;agir pour éliminer la cause afin d&apos;éviter que la non-conformité ne se reproduise ou ne se produise ailleurs.
                </p>
                <p className="mt-2 text-xs text-indigo-700">
                  Cette analyse doit identifier les causes profondes de l&apos;écart et non seulement les symptômes. Les méthodes 5 Pourquoi et Ishikawa sont des outils reconnus pour cette investigation.
                </p>
              </div>
            </div>
            <a
              href="https://www.iso.org/standard/62085.html"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50 md:mt-0"
            >
              Documentation officielle ISO
              <ExternalLinkIcon className="ml-1.5 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================================

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn('h-4 w-4', className)}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn('h-4 w-4', className)}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}