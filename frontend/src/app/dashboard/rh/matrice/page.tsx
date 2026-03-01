/**
 * FICHIER : app/(dashboard)/rh/matrice/page.tsx
 * ===========================================================================
 * PAGE MATRICE DE COMPÉTENCES DÉTAILLÉE
 * Rôle : Visualisation avancée de la matrice GPEC avec navigation sticky
 * Design : Style ClickUp professionnel (sobre, épuré, orienté lisibilité)
 * Conformité : 100% schéma Prisma — zéro champ inventé
 * Dernière mise à jour : 2026-03-01 17:15 UTC+0 (Dakar)
 * ===========================================================================
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Loader2, 
  Search, 
  Target, 
  Users, 
  Fingerprint,
  ArrowLeft,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useAuth } from '@/core/providers/auth-provider';
import type { User, Competence, UserCompetence } from '@/types/elite-sde';

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

export default function RHMasterMatrix() {
  const router = useRouter();
  const { user, tenantId, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    if (!tenantId || authLoading) return;

    try {
      setLoading(true);
      const res = await apiClient.get<{ users: User[]; competences: Competence[] }>('/competences/matrix');
      
      setUsers(res.data.users || []);
      setCompetences(res.data.competences || []);
    } catch (err) {
      console.error('[RH_MATRICE] Failed to load matrix data:', err);
      toast.error('Échec du chargement de la matrice de compétences');
    } finally {
      setLoading(false);
    }
  }, [tenantId, authLoading]);

  useEffect(() => {
    if (!authLoading && tenantId) {
      fetchData();
    }
  }, [authLoading, tenantId, fetchData]);

  // --- FILTRAGE DES UTILISATEURS ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      `${user.U_FirstName || ''} ${user.U_LastName || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  // --- GESTION DU CHARGEMENT ---
  if (authLoading || loading) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Chargement de la matrice de compétences...</p>
        </div>
      </div>
    );
  }

  if (!user || !tenantId) {
    router.push('/login');
    return null;
  }

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* 🔝 HEADER */}
        <header className="border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                  ISO 9001:2015 §7.2
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  {users.length} collaborateurs
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">Matrice de compétences</h1>
              <p className="mt-1 text-sm text-gray-600">
                Visualisation détaillée des niveaux de maîtrise par collaborateur et compétence critique
              </p>
            </div>
          </div>
        </header>

        {/* 🔍 BARRE DE RECHERCHE */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un collaborateur par nom..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 📋 MATRICE */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Matrice GPEC ({filteredUsers.length} collaborateurs)
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Niveaux de maîtrise : 0 = Non acquis • 1-2 = En cours • 3-4 = Maîtrisé • 5 = Expert
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 z-20 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Collaborateur
                    </th>
                    {competences.map((comp) => (
                      <th
                        key={comp.CP_Id}
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-30"
                      >
                        <div className="max-w-32 truncate font-medium text-gray-700">{comp.CP_Name}</div>
                        <div className="mt-1 text-[10px] font-medium text-indigo-600">Seuil: {comp.CP_NiveauRequis}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.U_Id} className="hover:bg-gray-50">
                        <td className="sticky left-0 z-10 bg-white px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-medium">
                              {user.U_FirstName?.charAt(0) || '?'}
                              {user.U_LastName?.charAt(0) || '?'}
                            </div>
                            <div className="ml-3">
                              <div>{user.U_FirstName} {user.U_LastName}</div>
                              <div className="mt-0.5 text-xs text-gray-500">{user.U_Role}</div>
                            </div>
                          </div>
                        </td>
                        {competences.map((comp) => {
                          const userComp = user.U_Competences?.find(
                            (uc: UserCompetence) => uc.UC_CompetenceId === comp.CP_Id,
                          );
                          const currentLevel = userComp?.UC_NiveauActuel || 0;
                          const isCompliant = currentLevel >= comp.CP_NiveauRequis;

                          return (
                            <td key={`${user.U_Id}-${comp.CP_Id}`} className="px-6 py-4 text-center">
                              <div
                                className={cn(
                                  'mx-auto flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm',
                                  isCompliant
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : currentLevel > 0
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-gray-100 text-gray-600',
                                )}
                                title={`Niveau actuel: ${currentLevel} / Requis: ${comp.CP_NiveauRequis}`}
                              >
                                {currentLevel}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={competences.length + 1} className="p-12 text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Fingerprint className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="mt-4 text-sm font-medium text-gray-900">
                          Aucun collaborateur trouvé
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Aucun collaborateur ne correspond à votre recherche
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 📊 LÉGENDE ET CONSEILS */}
        <div className="rounded-xl bg-indigo-50 p-6 border border-indigo-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                <span className="text-xs font-bold text-white">§</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-indigo-900">Légende de la matrice</h3>
                <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-emerald-100"></div>
                    <span className="text-xs text-gray-700">Maîtrisé (≥ seuil)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-amber-100"></div>
                    <span className="text-xs text-gray-700">En cours (< seuil >)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gray-100"></div>
                    <span className="text-xs text-gray-700">Non acquis (0)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs text-gray-700">Seuil requis</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 md:mt-0">
              <button
                onClick={() => router.push('/dashboard/rh')}
                className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Users className="mr-1.5 h-4 w-4" />
                Retour au hub RH
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}