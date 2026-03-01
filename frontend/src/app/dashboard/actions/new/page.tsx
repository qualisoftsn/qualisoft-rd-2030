/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FICHIER : app/(dashboard)/actions/new/page.tsx
 * ===========================================================================
 * PAGE CRÉATION D'UNE NOUVELLE ACTION CORRECTIVE/PRÉVENTIVE (CAPA)
 * Rôle : Indexation d'une nouvelle mesure d'amélioration (ISO 9001 §10.2.1)
 * Design : Style ClickUp professionnel (sobre, épuré, orienté productivité)
 * Conformité : 100% schéma Prisma — zéro champ inventé
 * Dernière mise à jour : 2026-03-01 15:45 UTC+0 (Dakar)
 * ===========================================================================
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  Calendar,
  Loader2,
  Save,
  Target,
  User as UserIcon,
  X,
  Zap,
  AlertCircle,
  Info,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  Action,
  ActionStatus,
  Priority,
  ActionOrigin,
  ActionType,
  User,
  PAQ,
} from '@/types/elite-sde';

export default function NewActionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [paqs, setPaqs] = useState<PAQ[]>([]);

  const [formData, setFormData] = useState({
    ACT_Title: '',
    ACT_Description: '',
    ACT_Priority: Priority.MEDIUM,
    ACT_Origin: ActionOrigin.AUTRE,
    ACT_Type: ActionType.CORRECTIVE,
    ACT_ResponsableId: '',
    ACT_PAQId: '',
    ACT_Deadline: '',
  });

  // --- CHARGEMENT DES RÉFÉRENTIELS ---
  const loadReferences = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, paqsRes] = await Promise.all([
        apiClient.get<User[]>('/users'),
        apiClient.get<PAQ[]>('/paq'),
      ]);
      setUsers(usersRes.data || []);
      setPaqs(paqsRes.data || []);
    } catch (err) {
      console.error('[NEW_ACTION] Failed to load references:', err);
      toast.error('Échec du chargement des référentiels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  // --- SOUMISSION DU FORMULAIRE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation minimale
    if (!formData.ACT_Title.trim()) {
      toast.error('Le titre de l\'action est obligatoire');
      return;
    }
    if (!formData.ACT_PAQId) {
      toast.error('Le Plan d\'Actions Qualité (PAQ) est obligatoire');
      return;
    }
    if (!formData.ACT_ResponsableId) {
      toast.error('Le responsable de l\'action est obligatoire');
      return;
    }
    if (!formData.ACT_Deadline) {
      toast.error('La date d\'échéance est obligatoire');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<Action> = {
        ACT_Title: formData.ACT_Title.trim(),
        ACT_Description: formData.ACT_Description.trim() || undefined,
        ACT_Priority: formData.ACT_Priority,
        ACT_Origin: formData.ACT_Origin,
        ACT_Type: formData.ACT_Type,
        ACT_Status: ActionStatus.A_FAIRE,
        ACT_ResponsableId: formData.ACT_ResponsableId,
        ACT_CreatorId: users.find((u) => u.U_IsActive)?.U_Id || users[0]?.U_Id || '',
        ACT_PAQId: formData.ACT_PAQId,
        ACT_Deadline: new Date(formData.ACT_Deadline).toISOString(),
        ACT_IsActive: true,
      };

      await apiClient.post<Action>('/actions', payload);
      toast.success('Action créée avec succès');
      router.push('/dashboard/actions');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de la création de l\'action';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
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
          <p className="mt-4 text-sm font-medium text-gray-600">Chargement des référentiels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-72 bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-3xl space-y-8">
        {/* 🔝 HEADER */}
        <header className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Retour"
              >
                <X className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nouvelle action CAPA</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Création d&apos;une action corrective, préventive ou d&apos;amélioration (ISO 9001 §10.2.1)
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/actions')}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Annuler
            </button>
          </div>
        </header>

        {/* 📝 FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-xl bg-white shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titre de l&apos;action <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.ACT_Title}
                  onChange={(e) => setFormData({ ...formData, ACT_Title: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ex: Mettre à jour la procédure de réception des marchandises"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description détaillée
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.ACT_Description}
                  onChange={(e) => setFormData({ ...formData, ACT_Description: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Décrivez le contexte, les causes racines identifiées et les objectifs attendus..."
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="paq" className="block text-sm font-medium text-gray-700">
                    Plan d&apos;Actions Qualité (PAQ) <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="paq"
                    required
                    value={formData.ACT_PAQId}
                    onChange={(e) => setFormData({ ...formData, ACT_PAQId: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner un PAQ...</option>
                    {paqs
                      .filter((p) => p.PAQ_IsActive && p.PAQ_Status !== 'ARCHIVE')
                      .map((paq) => (
                        <option key={paq.PAQ_Id} value={paq.PAQ_Id}>
                          {paq.PAQ_Title} ({paq.PAQ_Year}) — {paq.PAQ_Processus?.PR_Libelle}
                        </option>
                      ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    L&apos;action sera rattachée à ce plan et contribuera à ses objectifs
                  </p>
                </div>

                <div>
                  <label htmlFor="responsible" className="block text-sm font-medium text-gray-700">
                    Responsable <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="responsible"
                    required
                    value={formData.ACT_ResponsableId}
                    onChange={(e) => setFormData({ ...formData, ACT_ResponsableId: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Sélectionner un responsable...</option>
                    {users
                      .filter((u) => u.U_IsActive)
                      .map((user) => (
                        <option key={user.U_Id} value={user.U_Id}>
                          {user.U_FirstName} {user.U_LastName} ({user.U_Role})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                    Échéance <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.ACT_Deadline}
                    onChange={(e) => setFormData({ ...formData, ACT_Deadline: e.target.value })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Priorité
                  </label>
                  <select
                    id="priority"
                    value={formData.ACT_Priority}
                    onChange={(e) => setFormData({ ...formData, ACT_Priority: e.target.value as Priority })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {Object.values(Priority).map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
                    Origine
                  </label>
                  <select
                    id="origin"
                    value={formData.ACT_Origin}
                    onChange={(e) => setFormData({ ...formData, ACT_Origin: e.target.value as ActionOrigin })}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {Object.values(ActionOrigin).map((origin) => (
                      <option key={origin} value={origin}>
                        {origin.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ℹ️ BLOC D'INFORMATION ISO */}
          <div className="rounded-xl bg-indigo-50 p-6 border border-indigo-100">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600">
                <span className="text-xs font-bold text-white">§</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-indigo-900">Exigence ISO 9001:2015 §10.2.1</h3>
                <p className="mt-1 text-sm text-indigo-800">
                  Lorsqu&apos;une non-conformité survient, l&apos;organisation doit évaluer la nécessité d&apos;agir pour éliminer la cause afin d&apos;éviter que la non-conformité ne se reproduise.
                </p>
                <p className="mt-2 text-xs text-indigo-700">
                  Cette action sera scellée dans le registre SMI avec horodatage certifié et traçabilité complète pour audit.
                </p>
              </div>
            </div>
          </div>

          {/* ✅ BOUTONS D'ACTION */}
          <div className="flex flex-col-reverse items-center justify-end gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push('/dashboard/actions')}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Créer l&apos;action
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}