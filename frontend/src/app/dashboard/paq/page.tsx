/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛡️ FICHIER : app/(dashboard)/paq/page.tsx
 * ===========================================================================
 * PAGE : PILOTAGE DES PLANS D'ACTIONS QUALITÉ (PAQ)
 * RÔLE : Pilotage du cycle d'amélioration continue (ISO 9001 §10.3)
 * DESIGN : Style ClickUp professionnel (sobre, épuré, orienté productivité)
 * ARCHITECTURE : Zéro NextAuth (100% apiClient), Zéro fausses données.
 * DATE : 02 Mars 2026 | 12:43 GMT
 * ===========================================================================
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  Activity, ArrowRight, BarChart3, Calendar, CheckCircle2,
  Edit3, LayoutGrid, Loader2, Plus, Printer, ShieldAlert,
  Target, Users, X
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import type { Action, PAQ, User, Processus, ActionStatus, Priority } from '@/types/elite-sde';
import { ActionStatus as ActionStatusEnum, Priority as PriorityEnum } from '@/types/elite-sde';

// --- UTILITAIRE DE CLASSES ---
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

// --- TYPES ÉTENDUS ---
interface PAQDashboardData {
  total: number;
  enRetard: Action[];
  aValider: Action[];
  cloturees: Action[];
  tauxEfficacite: number;
  chargeTravail: Array<{ name: string; count: number }>;
}

export default function PAQPage() {
  const router = useRouter();
  const [data, setData] = useState<PAQDashboardData | null>(null);
  const [paqs, setPaqs] = useState<PAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAction, setEditingAction] = useState<Action | null>(null);

  // --- 📡 CHARGEMENT DES DONNÉES SDE ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resStats, resPaqs] = await Promise.all([
        apiClient.get<PAQDashboardData>('/paq/dashboard'),
        apiClient.get<PAQ[]>('/paq'),
      ]);
      setData(resStats.data);
      setPaqs(resPaqs.data || []);
    } catch (err) {
      console.error('[PAQ] Échec de synchronisation:', err);
      toast.error('Échec du chargement des plans d\'actions qualité');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- 💾 MISE À JOUR RAPIDE D'ACTION ---
  const handleQuickUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction?.ACT_Id) return;

    const tid = toast.loading("Mise à jour en cours...");
    try {
      await apiClient.patch(`/paq/actions/${editingAction.ACT_Id}`, {
        ACT_Status: editingAction.ACT_Status,
        ACT_Priority: editingAction.ACT_Priority,
        ACT_Title: editingAction.ACT_Title,
      });
      toast.success('Action mise à jour avec succès', { id: tid });
      setEditingAction(null);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de la mise à jour';
      toast.error(Array.isArray(msg) ? msg[0] : msg, { id: tid });
    }
  };

  if (loading) {
    return (
      <div className="ml-0 lg:ml-72 flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-sm font-medium text-gray-600">Synchronisation des plans d&apos;actions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-0 lg:ml-72 bg-gray-50 min-h-screen p-6 lg:p-10 font-sans">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-7xl space-y-8">
        {/* 🔝 HEADER STRATÉGIQUE */}
        <header className="border-b border-gray-200 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">ISO 9001:2015 §10.3</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">{data?.total || 0} actions actives</span>
              </div>
              <h1 className="mt-3 text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Plans d&apos;actions qualité</h1>
              <p className="mt-1 text-sm text-gray-600">Pilotage du cycle d&apos;amélioration continue et suivi des mesures correctives</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
              <button onClick={() => window.print()} className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all">
                <Printer className="mr-2 h-4 w-4" /> Exporter le rapport
              </button>
              <button onClick={() => router.push('/dashboard/paq/nouveau')} className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all">
                <Plus className="mr-2 h-4 w-4" /> Nouveau plan annuel
              </button>
            </div>
          </div>

          {/* 📊 KPI CARDS */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPIStat title="Actions totales" value={data?.total.toString() || '0'} icon={Target} color="blue" subtext="Volume SMI" />
            <KPIStat title="Retards critiques" value={data?.enRetard?.length.toString() || '0'} icon={ShieldAlert} color="red" subtext="Alerte §10.2" />
            <KPIStat title="Taux d'efficacité" value={`${data?.tauxEfficacite || 0}%`} icon={CheckCircle2} color={data?.tauxEfficacite && data.tauxEfficacite >= 85 ? 'emerald' : 'amber'} subtext="Performance §9.1.3" />
            <KPIStat title="Pilotes actifs" value={data?.chargeTravail?.length.toString() || '0'} icon={Users} color="indigo" subtext="Affectation ressources" />
          </div>
        </header>

        {/* 🏛️ GRID PRINCIPALE */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* COLONNE 1-2 : LISTE DES PAQ */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Plans annuels</h2>
                  <p className="mt-1 text-xs text-gray-500">Structurés par processus et année d&apos;exécution</p>
                </div>
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700">{paqs.length} plans scellés</span>
              </div>

              <div className="divide-y divide-gray-200">
                {paqs.length > 0 ? (
                  paqs.map((paq) => <PAQCard key={paq.PAQ_Id} paq={paq} onClick={() => router.push(`/dashboard/paq/${paq.PAQ_Id}`)} />)
                ) : (
                  <div className="p-16 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center"><LayoutGrid className="h-6 w-6 text-gray-400" /></div>
                    <h3 className="mt-4 text-sm font-medium text-gray-900">Aucun plan d&apos;actions qualité</h3>
                    <p className="mt-1 text-sm text-gray-500">Commencez par créer votre premier plan annuel.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLONNE 3 : RADAR URGENCES + CHARGE */}
          <div className="space-y-8">
            <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-rose-100 bg-rose-50 px-6 py-4">
                <h2 className="text-sm font-bold text-rose-800 flex items-center gap-2 uppercase tracking-wide"><ShieldAlert className="h-4 w-4" /> Actions en retard</h2>
              </div>
              <div className="p-5">
                {data?.enRetard && data.enRetard.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {data.enRetard.slice(0, 5).map((action) => {
                      const deadline = action.ACT_Deadline ? new Date(action.ACT_Deadline) : null;
                      const formattedDate = deadline && !isNaN(deadline.getTime()) ? deadline.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Non définie';
                      return (
                        <div key={action.ACT_Id} className="flex items-start justify-between rounded-lg border border-rose-100 bg-rose-50/50 p-3 hover:border-rose-300 transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 mb-1"><Calendar className="h-3 w-3" /> Échéance : {formattedDate}</div>
                            <p className="truncate text-sm font-medium text-gray-900">{action.ACT_Title}</p>
                          </div>
                          <button onClick={() => setEditingAction(action)} className="ml-2 rounded p-1.5 text-gray-400 hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer"><Edit3 className="h-4 w-4" /></button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10"><CheckCircle2 className="h-10 w-10 text-emerald-400 mb-3" /><p className="text-sm font-medium text-emerald-700">Aucune action en retard</p></div>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-indigo-100 bg-indigo-50 px-6 py-4">
                <h2 className="text-sm font-bold text-indigo-800 flex items-center gap-2 uppercase tracking-wide"><Activity className="h-4 w-4" /> Charge par pilote</h2>
              </div>
              <div className="p-6">
                {data?.chargeTravail && data.chargeTravail.length > 0 ? (
                  <div className="space-y-5">
                    {data.chargeTravail.map(({ name, count }) => (
                      <div key={name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-700"><span>{name}</span><span className="text-indigo-600">{count} actions</span></div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(count / (data.total || 1)) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8"><BarChart3 className="mx-auto h-8 w-8 text-gray-300 mb-2" /><p className="text-xs text-gray-500">Aucune donnée de charge</p></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📟 MODAL D'ÉDITION D'ACTION */}
      {editingAction && (
        <EditActionModal
          action={editingAction}
          onClose={() => setEditingAction(null)}
          onSubmit={handleQuickUpdate}
          onChange={(field: any, value: any) => setEditingAction((prev) => (prev ? { ...prev, [field]: value } : null))}
        />
      )}
    </div>
  );
}

// --- SOUS-COMPOSANTS CLICKUP STYLE ---
function KPIStat({ title, value, icon: Icon, color, subtext }: { title: string; value: string; icon: any; color: 'blue' | 'red' | 'emerald' | 'amber' | 'indigo'; subtext: string }) {
  const colorClasses = {
    blue: 'text-blue-700 bg-blue-50 border-blue-100',
    red: 'text-rose-700 bg-rose-50 border-rose-100',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-700 bg-amber-50 border-amber-100',
    indigo: 'text-indigo-700 bg-indigo-50 border-indigo-100',
  };
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colorClasses[color]}`}><Icon className="h-6 w-6" /></div>
        <div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
          <p className="text-[10px] font-medium text-gray-400 mt-0.5">{subtext}</p>
        </div>
      </div>
    </div>
  );
}

function PAQCard({ paq, onClick }: { paq: any; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full px-6 py-5 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:bg-gray-50 cursor-pointer border-none bg-transparent">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider border border-indigo-100">Exercice {paq.PAQ_Year}</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">{paq.PAQ_Processus?.PR_Libelle || paq.Processus?.PR_Libelle || 'PROCESSUS NON SPÉCIFIÉ'}</span>
          </div>
          <p className="text-base font-bold text-gray-900 truncate">{paq.PAQ_Title}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Pilote : {paq.PAQ_QualityManager ? `${paq.PAQ_QualityManager.U_FirstName} ${paq.PAQ_QualityManager.U_LastName}` : 'Non assigné'}</div>
            <div className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> {paq._count?.PAQ_Actions || paq.Actions?.length || 0} actions</div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
          <span className={cn('inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border', paq.PAQ_Status === 'EN_COURS' ? 'bg-blue-50 text-blue-700 border-blue-200' : paq.PAQ_Status === 'CLOTURE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : paq.PAQ_Status === 'ARCHIVE' ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-amber-50 text-amber-700 border-amber-200')}>
            {paq.PAQ_Status?.replace('_', ' ') || 'BROUILLON'}
          </span>
          <ArrowRight className="h-5 w-5 text-gray-300" />
        </div>
      </div>
    </button>
  );
}

function EditActionModal({ action, onClose, onSubmit, onChange }: any) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><Edit3 size={20} /></div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">Modifier l&apos;action</h3>
              <p className="text-xs text-gray-500 font-medium">Mise à jour rapide SDE</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Titre de l&apos;action</label>
            <input type="text" value={action.ACT_Title} onChange={(e) => onChange('ACT_Title', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Statut</label>
            <select value={action.ACT_Status} onChange={(e) => onChange('ACT_Status', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white cursor-pointer">
              {Object.values(ActionStatusEnum).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Priorité</label>
            <div className="grid grid-cols-3 gap-2">
              {[PriorityEnum.LOW, PriorityEnum.MEDIUM, PriorityEnum.HIGH, PriorityEnum.URGENT, PriorityEnum.CRITICAL].map((prio) => (
                <button type="button" key={prio} onClick={() => onChange('ACT_Priority', prio)} className={cn('py-2 text-[10px] font-bold uppercase rounded-lg border transition-all cursor-pointer', action.ACT_Priority === prio ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50')}>{prio}</button>
              ))}
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">Annuler</button>
            <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}