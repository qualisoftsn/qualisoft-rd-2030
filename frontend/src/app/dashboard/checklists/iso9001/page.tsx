'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import {
  CheckCircle2, Download, 
  RefreshCw, Search, Target, XCircle,
  Layers, Loader2, ExternalLink,
  Check, X, Minus, HelpCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

// --- TYPES CONFORMES PRISMA ---
type ResponseType = 'YES' | 'NO' | 'PARTIAL' | 'NA';

interface ChecklistItem {
  LC_Id: string;
  LC_Clause: string;
  LC_Title: string;
  LC_Description: string;
  LC_Criteria: string;
  LC_IsMandatory: boolean;
  LC_SenegalSpecific: boolean;
  response?: {
    CR_Response: ResponseType;
    CR_Comment?: string;
    CR_Evidence?: string;
    CR_IsCompliant: boolean;
  };
}

export default function ISO9001ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClause, setActiveClause] = useState<string>('4');
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ChecklistItem[]>('/checklist?standard=ISO9001');
      setItems(res.data || []);
    } catch (err) {
      console.error('[CHECKLIST] API error:', err);
      toast.error('Échec du chargement de la checklist ISO 9001');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- CALCUL DES STATISTIQUES ---
  const stats = useMemo(() => {
    const total = items.length;
    const compliant = items.filter(i => i.response?.CR_Response === 'YES').length;
    const nonCompliant = items.filter(i => i.response?.CR_Response === 'NO').length;
    const partial = items.filter(i => i.response?.CR_Response === 'PARTIAL').length;
    const na = items.filter(i => i.response?.CR_Response === 'NA').length;
    const rate = total > 0 ? Math.round((compliant / total) * 100) : 0;
    
    return { total, compliant, nonCompliant, partial, na, rate };
  }, [items]);

  // --- FILTRAGE DES EXIGENCES ---
  const filteredItems = useMemo(() => {
    return items.filter(i =>
      i.LC_Clause.startsWith(activeClause) &&
      (i.LC_Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.LC_Clause.includes(searchTerm) ||
        i.LC_Description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [items, activeClause, searchTerm]);

  // --- SAUVEGARDE DE LA RÉPONSE ---
  const updateResponse = async (id: string, resp: ResponseType) => {
    setSavingId(id);
    try {
      await apiClient.post('/checklist/response', { LC_Id: id, CR_Response: resp });
      toast.success(`Réponse enregistrée pour l'exigence §${id}`);
      fetchData();
    } catch (e) {
      console.error('[CHECKLIST] Save error:', e);
      toast.error('Échec de l\'enregistrement de la réponse');
    } finally {
      setSavingId(null);
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
          <p className="mt-4 text-sm font-medium text-gray-600">Chargement de la checklist ISO 9001:2015...</p>
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
                  ISO 9001:2015
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                  {stats.rate}% de conformité
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">Checklist d&apos;audit ISO 9001:2015</h1>
              <p className="mt-1 text-sm text-gray-600">
                Évaluation exhaustive de la conformité selon les exigences des clauses §4 à §10
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
              <button
                onClick={fetchData}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Actualiser les données"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <Download className="mr-1.5 h-4 w-4" />
                Exporter le rapport
              </button>
            </div>
          </div>

          {/* 🔍 BARRE DE RECHERCHE */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par clause, titre ou critère..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {filteredItems.length} exigence{filteredItems.length > 1 ? 's' : ''} correspondante{filteredItems.length > 1 ? 's' : ''} • Clause active : §{activeClause}
            </p>
          </div>
        </header>

        {/* 📊 TABLEAU DE BORD KPI */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPIStat
            title="Taux de conformité"
            value={`${stats.rate}%`}
            icon={Target}
            color={stats.rate >= 90 ? 'emerald' : stats.rate >= 75 ? 'blue' : 'amber'}
          />
          <KPIStat
            title="Exigences conformes"
            value={stats.compliant.toString()}
            icon={CheckCircle2}
            color="emerald"
          />
          <KPIStat
            title="Écarts identifiés"
            value={stats.nonCompliant.toString()}
            icon={XCircle}
            color="red"
          />
          <KPIStat
            title="Total des exigences"
            value={stats.total.toString()}
            icon={Layers}
            color="gray"
          />
        </div>

        {/* 🧩 CONTENU PRINCIPAL : NAVIGATION + TABLEAU */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* NAVIGATION PAR CLAUSES (GAUCHE) */}
          <div className="lg:col-span-1">
            <nav className="rounded-xl bg-white shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-900">Navigation par clauses</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { id: '4', title: 'Contexte de l\'organisation', description: 'Enjeux & parties intéressées' },
                  { id: '5', title: 'Leadership', description: 'Politique & responsabilités' },
                  { id: '6', title: 'Planification', description: 'Risques & opportunités' },
                  { id: '7', title: 'Support', description: 'Ressources & information' },
                  { id: '8', title: 'Réalisation', description: 'Opérations & production' },
                  { id: '9', title: 'Évaluation des performances', description: 'Surveillance & revue' },
                  { id: '10', title: 'Amélioration', description: 'Actions correctives' },
                ].map((clause) => {
                  const clauseItems = items.filter(i => i.LC_Clause.startsWith(clause.id));
                  const compliantCount = clauseItems.filter(i => i.response?.CR_Response === 'YES').length;
                  const totalCount = clauseItems.length;
                  const progress = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0;
                  
                  return (
                    <button
                      key={clause.id}
                      onClick={() => setActiveClause(clause.id)}
                      className={`w-full px-4 py-4 text-left transition-colors ${
                        activeClause === clause.id
                          ? 'bg-indigo-50 border-l-4 border-indigo-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            §{clause.id} {clause.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">{clause.description}</p>
                        </div>
                        <div className="ml-4 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-medium text-indigo-700">{progress}%</p>
                            <div className="mt-1 h-1.5 w-12 overflow-hidden rounded-full bg-gray-200">
                              <div
                                className="h-full rounded-full bg-indigo-600"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* TABLEAU DES EXIGENCES (DROITE) */}
          <div className="lg:col-span-3">
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Clause §{activeClause} — Exigences à évaluer
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {filteredItems.length} exigence{filteredItems.length > 1 ? 's' : ''} •{' '}
                  <span className="font-medium text-indigo-700">
                    {stats.rate}% de conformité globale
                  </span>
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exigence
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Critère d&apos;évaluation
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredItems.map((item) => (
                      <tr key={item.LC_Id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                                §{item.LC_Clause}
                              </span>
                              {item.LC_IsMandatory && (
                                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                  Obligatoire
                                </span>
                              )}
                              {item.LC_SenegalSpecific && (
                                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                  Sénégal
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900">{item.LC_Title}</p>
                            <p className="text-xs text-gray-500">{item.LC_Description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{item.LC_Criteria}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <ResponseBadge response={item.response?.CR_Response} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <ResponseButton
                              label="Oui"
                              response="YES"
                              active={item.response?.CR_Response === 'YES'}
                              color="emerald"
                              onClick={() => updateResponse(item.LC_Id, 'YES')}
                              loading={savingId === item.LC_Id}
                            />
                            <ResponseButton
                              label="Non"
                              response="NO"
                              active={item.response?.CR_Response === 'NO'}
                              color="red"
                              onClick={() => updateResponse(item.LC_Id, 'NO')}
                              loading={savingId === item.LC_Id}
                            />
                            <ResponseButton
                              label="Partiel"
                              response="PARTIAL"
                              active={item.response?.CR_Response === 'PARTIAL'}
                              color="amber"
                              onClick={() => updateResponse(item.LC_Id, 'PARTIAL')}
                              loading={savingId === item.LC_Id}
                            />
                            <ResponseButton
                              label="N/A"
                              response="NA"
                              active={item.response?.CR_Response === 'NA'}
                              color="gray"
                              onClick={() => updateResponse(item.LC_Id, 'NA')}
                              loading={savingId === item.LC_Id}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredItems.length === 0 && (
                <div className="p-12 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-gray-900">Aucune exigence trouvée</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aucune exigence ne correspond à votre recherche ou à la clause sélectionnée.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 rounded-md bg-white px-3 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Réinitialiser la recherche
                  </button>
                </div>
              )}

              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${stats.rate}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    Conformité globale :{' '}
                    <span className="text-indigo-700">{stats.rate}%</span> ({stats.compliant} / {stats.total} exigences conformes)
                  </div>
                  <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <Download className="mr-1.5 h-4 w-4" />
                    Exporter le rapport PDF
                  </button>
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
                <h3 className="text-sm font-medium text-indigo-900">Exigence ISO 9001:2015 §9.2</h3>
                <p className="mt-1 text-sm text-indigo-800">
                  L&apos;organisation doit effectuer des audits internes à des intervalles planifiés pour fournir des informations sur la conformité du système de management de la qualité.
                </p>
                <p className="mt-2 text-xs text-indigo-700">
                  Cette checklist couvre l&apos;ensemble des exigences des clauses §4 à §10 et est conforme aux bonnes pratiques d&apos;audit interne.
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
              <ExternalLink className="ml-1.5 h-4 w-4" />
            </a>
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
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'emerald' | 'blue' | 'amber' | 'red' | 'gray';
}) {
  const colorClasses = {
    emerald: 'text-emerald-700 bg-emerald-50',
    blue: 'text-blue-700 bg-blue-50',
    amber: 'text-amber-700 bg-amber-50',
    red: 'text-red-700 bg-red-50',
    gray: 'text-gray-700 bg-gray-50',
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
          </div>
        </div>
      </div>
    </div>
  );
}

function ResponseBadge({ response }: { response?: ResponseType }) {
  if (!response) {
    return (
      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
        <HelpCircle className="mr-1 h-3.5 w-3.5" />
        En attente
      </span>
    );
  }

  const config: Record<ResponseType, { label: string; icon: React.ReactNode; color: string }> = {
    YES: { label: 'Conforme', icon: <Check className="h-3.5 w-3.5" />, color: 'bg-emerald-100 text-emerald-800' },
    NO: { label: 'Non conforme', icon: <X className="h-3.5 w-3.5" />, color: 'bg-red-100 text-red-800' },
    PARTIAL: { label: 'Partiellement', icon: <Minus className="h-3.5 w-3.5" />, color: 'bg-amber-100 text-amber-800' },
    NA: { label: 'Non applicable', icon: <Minus className="h-3.5 w-3.5" />, color: 'bg-gray-100 text-gray-800' },
  };

  const { label, icon, color } = config[response];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {icon}
      <span className="ml-1">{label}</span>
    </span>
  );
}

function ResponseButton({
  label,
  response,
  active,
  color,
  onClick,
  loading,
}: {
  label: string;
  response: ResponseType;
  active: boolean;
  color: 'emerald' | 'red' | 'amber' | 'gray';
  onClick: () => void;
  loading: boolean;
}) {
  const colorClasses = {
    emerald: active
      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    red: active ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-50 text-red-700 hover:bg-red-100',
    amber: active
      ? 'bg-amber-500 text-white hover:bg-amber-600'
      : 'bg-amber-50 text-amber-800 hover:bg-amber-100',
    gray: active ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  };

  const icons: Record<ResponseType, React.ReactNode> = {
    YES: <Check className="h-4 w-4" />,
    NO: <X className="h-4 w-4" />,
    PARTIAL: <Minus className="h-4 w-4" />,
    NA: <HelpCircle className="h-4 w-4" />,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        colorClasses[color]
      } ${loading ? 'opacity-75 cursor-not-allowed' : 'focus:ring-indigo-500'}`}
      aria-label={`Marquer comme ${label}`}
    >
      {loading && response === 'YES' ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        icons[response]
      )}
    </button>
  );
}