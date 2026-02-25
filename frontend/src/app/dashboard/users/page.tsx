/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FICHIER : app/(dashboard)/users/page.tsx
 * ===========================================================================
 * PAGE GESTION DES UTILISATEURS (RESSOURCES HUMAINES)
 * Rôle : Pilotage des habilitations et qualifications (ISO 9001 §7.2)
 * Design : Style ClickUp professionnel (sobre, épuré, orienté productivité)
 * Conformité : 100% schéma Prisma — champs relationnels strictement validés
 * ===========================================================================
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  Users,
  UserPlus,
  Building2,
  GitBranch,
  Edit,
  Activity,
  Database,
  RefreshCw,
  Search,
  Trash2,
  Loader2,
  LayoutGrid,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import type {
  User,
  Site,
  OrgUnit,
  Processus,
  Tenant,
  Role,
} from '@/types/elite-sde';
import { Role as RoleEnum } from '@/types/elite-sde';

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isSubdomain, setIsSubdomain] = useState(true);

  // --- DÉTECTION DU MODE MULTI-TENANT ---
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isRootDomain =
        hostname === 'qualisoft.sn' ||
        hostname === 'www.qualisoft.sn' ||
        hostname === 'localhost' ||
        hostname.endsWith('.vercel.app');
      setIsSubdomain(!isRootDomain);
    }
  }, []);

  // --- CHARGEMENT DES DONNÉES (CORRIGÉ & TYPÉ) ---
  const fetchData = useCallback(async () => {
    if (!mounted) return;

    try {
      setLoading(true);

      // On prépare les requêtes de base
      const requests: Promise<any>[] = [
        apiClient.get<User[]>('/users'),
        apiClient.get<Site[]>('/sites'),
        apiClient.get<OrgUnit[]>('/org-units'),
        apiClient.get<Processus[]>('/processes'),
      ];

      // Ajout conditionnel de la 5ème requête si on est sur le domaine racine
      if (!isSubdomain) {
        requests.push(apiClient.get<Tenant[]>('/tenants'));
      }

      const responses = await Promise.all(requests);

      // Destructuration sécurisée (resTenants sera undefined si isSubdomain est vrai)
      const [resUsers, resSites, resUnits, resProcs, resTenants] = responses;

      setUsers(resUsers.data || []);
      setSites(resSites.data || []);
      setOrgUnits(resUnits.data || []);
      setProcesses(resProcs.data || []);

      if (!isSubdomain && resTenants) {
        setTenants(resTenants.data || []);
      }
    } catch (err) {
      console.error('[USERS] Failed to load data:', err);
      toast.error('Échec du chargement des référentiels Matrix');
    } finally {
      setLoading(false);
    }
  }, [mounted, isSubdomain]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- STATISTIQUES EN TEMPS RÉEL ---
  const stats = useMemo(() => {
    const total = users.length;
    const pilotes = users.filter((u) => u.U_Role === RoleEnum.PILOTE).length;
    const admins = users.filter((u) =>
      [RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN].includes(u.U_Role),
    ).length;
    const activeCount = users.filter((u) => u.U_IsActive).length;

    return {
      total,
      pilotes,
      admins,
      active: activeCount,
      activationRate: total > 0 ? Math.round((activeCount / total) * 100) : 0,
    };
  }, [users]);

  // --- FILTRAGE DES UTILISATEURS ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        user.U_FirstName?.toLowerCase().includes(searchLower) ||
        user.U_LastName?.toLowerCase().includes(searchLower) ||
        user.U_Email.toLowerCase().includes(searchLower) ||
        user.U_Role.toLowerCase().includes(searchLower) ||
        sites.find((s) => s.S_Id === user.U_SiteId)?.S_Name?.toLowerCase().includes(searchLower) ||
        orgUnits.find((ou) => ou.OU_Id === user.U_OrgUnitId)?.OU_Name?.toLowerCase().includes(searchLower) ||
        processes.find((p) => p.PR_Id === user.U_AssignedProcessId)?.PR_Libelle?.toLowerCase().includes(searchLower);

      const matchesTenant = selectedTenantId ? user.tenantId === selectedTenantId : true;

      return matchesSearch && matchesTenant;
    });
  }, [users, search, selectedTenantId, sites, orgUnits, processes]);

  // --- SUPPRESSION D'UTILISATEUR (ARCHIVAGE SÉCURISÉ) ---
  const handleDelete = async (userId: string) => {
    if (!userId) {
      toast.error("Identifiant de l'utilisateur introuvable");
      return;
    }

    if (!confirm('⚠️ ARCHIVAGE DÉFINITIF\n\nCette action désactive le compte utilisateur mais conserve toutes les données pour audit.\n\nConfirmer l\'archivage ?')) {
      return;
    }

    try {
      setIsDeleting(userId);
      await apiClient.delete(`/users/${userId}`);
      toast.success('Utilisateur archivé avec succès');
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Échec de l'archivage";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading || !mounted) {
    return (
      <div className="ml-72 flex min-h-screen items-center justify-center bg-gray-50 italic">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Initialisation Matrix SDE...</p>
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
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-indigo-800">
                  ISO 9001:2015 §7.2
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-blue-800">
                  {stats.total} profils scellés
                </span>
              </div>
              <h1 className="mt-2 text-3xl font-black uppercase tracking-tighter text-gray-900 italic">
                Gestion des <span className="text-indigo-600">Utilisateurs</span>
              </h1>
              <p className="mt-1 text-xs font-bold text-gray-500 uppercase tracking-widest">
                Pilotage des habilitations et qualifications des ressources humaines
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
              {!isSubdomain && (
                <button
                  onClick={() => router.push('/dashboard/matrix-control')}
                  className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <LayoutGrid className="mr-2 h-4 w-4" /> QS Control
                </button>
              )}
              <button
                onClick={fetchData}
                className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push('/dashboard/users/nouveau')}
                className="inline-flex items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Nouvel utilisateur
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <KPIStat title="Effectif total" value={stats.total.toString()} icon={Database} color="blue" subtext="Population SDE" />
            <KPIStat title="Pilotes processus" value={stats.pilotes.toString()} icon={TargetIcon} color="emerald" subtext="Propriétaires §5.3" />
            <KPIStat title="Administrateurs" value={stats.admins.toString()} icon={ShieldCheckIcon} color="indigo" subtext="Privilèges SMI" />
            <KPIStat 
              title="Taux d'activation" 
              value={`${stats.activationRate}%`} 
              icon={Activity} 
              color={stats.activationRate >= 90 ? 'emerald' : 'amber'} 
              subtext="Comptes actifs" 
            />
          </div>
        </header>

        {/* 🔍 FILTRES CLICKUP */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="RECHERCHER UN PROFIL (NOM, EMAIL, RÔLE, SITE...)"
                className="w-full rounded-xl border-gray-100 bg-gray-50 py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {!isSubdomain && tenants.length > 0 && (
              <div className="w-full md:w-72">
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full rounded-xl border-gray-100 bg-gray-50 py-3 px-4 text-xs font-bold uppercase outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">Tous les tenants Matrix</option>
                  {tenants.map((t) => (
                    <option key={t.T_Id} value={t.T_Id}>{t.T_Name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 📋 TABLEAU HAUTE DENSITÉ */}
        <div className="rounded-4xl bg-white shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-5 text-left">Utilisateur</th>
                  <th className="px-8 py-5 text-left">Identifiant Email</th>
                  <th className="px-8 py-5 text-left">Niveau de Privilège</th>
                  <th className="px-8 py-5 text-left">Périmètre</th>
                  <th className="px-8 py-5 text-left">Processus Assigné</th>
                  <th className="px-8 py-5 text-left">Statut Matrix</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {filteredUsers.map((user) => {
                  const site = sites.find((s) => s.S_Id === user.U_SiteId);
                  const orgUnit = orgUnits.find((ou) => ou.OU_Id === user.U_OrgUnitId);
                  const assignedProcess = processes.find((p) => p.PR_Id === user.U_AssignedProcessId);

                  return (
                    <tr key={user.U_Id} className={cn("group transition-all hover:bg-indigo-50/30", !user.U_IsActive && "opacity-40 grayscale")}>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-black group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                            {user.U_FirstName?.charAt(0)}{user.U_LastName?.charAt(0)}
                          </div>
                          <div className="text-sm font-black text-gray-900 uppercase tracking-tight italic">
                            {user.U_FirstName} {user.U_LastName}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-xs font-bold text-gray-500 italic">
                        {user.U_Email}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <RoleBadge role={user.U_Role} />
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase italic">
                            <Building2 className="h-3 w-3 text-indigo-500" /> {site?.S_Name || 'Non affecté'}
                          </div>
                          {orgUnit && (
                            <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                              <GitBranch className="h-3 w-3" /> {orgUnit.OU_Name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        {assignedProcess ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-xl border border-blue-100">
                            <span className="text-[9px] font-black text-blue-600 uppercase">{assignedProcess.PR_Code}</span>
                            <span className="text-[10px] font-bold text-blue-800 uppercase italic truncate max-w-30">{assignedProcess.PR_Libelle}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-gray-300 uppercase italic">Libre</span>
                        )}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          user.U_IsActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-100 text-gray-400 border-gray-200"
                        )}>
                          {user.U_IsActive ? 'Actif' : 'Archivé'}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => router.push(`/dashboard/users/${user.U_Id}`)}
                            className="p-2 bg-white rounded-xl text-gray-400 hover:text-indigo-600 shadow-sm border border-gray-100"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.U_Id)}
                            disabled={isDeleting === user.U_Id}
                            className="p-2 bg-white rounded-xl text-gray-400 hover:text-red-600 shadow-sm border border-gray-100"
                          >
                            {isDeleting === user.U_Id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-20 text-center">
              <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <h3 className="text-sm font-black uppercase text-gray-900">Aucun résultat dans la matrix</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">La recherche n&apos;a retourné aucun profil scellé.</p>
            </div>
          )}
        </div>

        {/* 🛡️ BLOC DE CONFORMITÉ */}
        <div className="rounded-[2.5rem] bg-indigo-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 pointer-events-none">
             <Database size={200} />
          </div>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <span className="text-xl font-black italic">§</span>
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter italic">Protocole ISO 9001:2015 §7.2</h3>
                <p className="mt-1 text-sm font-medium text-indigo-200/80 max-w-2xl leading-relaxed italic">
                  L&apos;organisation doit assurer la compétence des personnes réalisant un travail sous son contrôle. 
                  L&apos;archivage systématique garantit la traçabilité historique des responsabilités et habilitations.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => router.push('/dashboard/users/nouveau')} className="bg-white text-indigo-900 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">
                Créer Profil
              </button>
              <button className="bg-indigo-700 text-white border border-white/10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
                Export RH
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANTS ATOMIQUES (HÉGÉMONIE CLICKUP)
// ============================================================================

function KPIStat({ title, value, icon: Icon, color, subtext }: any) {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
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

function RoleBadge({ role }: { role: Role }) {
  const config: any = {
    SUPER_ADMIN: { label: 'SUPER ADMIN', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    ADMIN: { label: 'ADMIN', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    USER: { label: 'UTILISATEUR', color: 'bg-gray-100 text-gray-600 border-gray-200' },
    PILOTE: { label: 'PILOTE PROCESSUS', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    COPILOTE: { label: 'COPILOTE', color: 'bg-sky-100 text-sky-700 border-sky-200' },
    AUDITEUR: { label: 'AUDITEUR', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    HSE: { label: 'HSE MANAGER', color: 'bg-red-100 text-red-700 border-red-200' },
    SAFETY_OFFICER: { label: 'SAFETY OFFICER', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    RQ: { label: 'RESPONSABLE QUALITÉ', color: 'bg-green-100 text-green-700 border-green-200' },
    DIRECTION: { label: 'DIRECTION', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    OBSERVATEUR: { label: 'OBSERVATEUR', color: 'bg-gray-100 text-gray-500 border-gray-200' },
  };

  const { label, color } = config[role] || config.USER;

  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border", color)}>
      {label}
    </span>
  );
}

function TargetIcon({ className }: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.744c0 5.033 3.078 9.348 7.455 11.096a12.23 12.23 0 004.545 0C19.422 19.1 22.5 14.787 22.5 9.744c0-1.303-.207-2.559-.598-3.744A11.96 11.96 0 0112 2.714z" />
    </svg>
  );
}

function DownloadIcon({ className }: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}