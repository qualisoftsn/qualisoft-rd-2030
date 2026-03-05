/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ FICHIER : app/dashboard/actions/[id]/page.tsx (elite-sde)
 * ===========================================================================
 * PAGE DÉTAIL D'UNE ACTION CORRECTIVE/PRÉVENTIVE (CAPA)
 * Rôle : Pilotage tactique et suivi d'exécution d'une action (ISO 9001 §10.2).
 * FIX : UI ClickUp Dark Mode, 100dvh (Zéro Scroll Global), PWA Ready.
 * SÉCURITÉ : Typage strict, Zéro NextAuth.
 * DATE : 05 Mars 2026 | 00:00 GMT
 * ===========================================================================
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  ArrowLeft, Calendar, CheckCircle2, Clock, Loader2, Printer, Save, Target, User as UserIcon,
  AlertCircle, X, TrendingUp, Info, FileText, ShieldCheck
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import {
  Action, ActionStatus, Priority, ActionOrigin, ActionType, User, PAQ, Preuve,
} from '@/types/elite-sde';

// --- UTILITAIRE CN ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

export default function DetailActionPage() {
  const params = useParams();
  const router = useRouter();
  const actionId = params?.id as string;

  const [action, setAction] = useState<Action | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [paqs, setPaqs] = useState<PAQ[]>([]);
  const [preuves, setPreuves] = useState<Preuve[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    ACT_Description: '',
    ACT_Status: '' as ActionStatus,
  });

  const fetchData = useCallback(async () => {
    if (!actionId) return;
    try {
      setLoading(true);
      const [actionRes, usersRes, paqsRes, preuvesRes] = await Promise.all([
        apiClient.get<Action>(`/actions/${actionId}`),
        apiClient.get<User[]>('/users'),
        apiClient.get<PAQ[]>('/paq'),
        apiClient.get<Preuve[]>(`/preuves?actionId=${actionId}`),
      ]);

      const actionData = actionRes.data;
      setAction(actionData);
      setUsers(usersRes.data || []);
      setPaqs(paqsRes.data || []);
      setPreuves(preuvesRes.data || []);
      setFormData({
        ACT_Description: actionData.ACT_Description || '',
        ACT_Status: actionData.ACT_Status,
      });
    } catch (err) {
      console.error('[ACTION_DETAIL] Failed to load ', err);
      toast.error('Échec du chargement des détails Matrix de l\'action');
      router.push('/dashboard/actions');
    } finally {
      setLoading(false);
    }
  }, [actionId, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    if (!action?.ACT_Deadline) return { daysLeft: 0, isOverdue: false };
    const deadline = new Date(action.ACT_Deadline).getTime();
    const now = new Date().getTime();
    const diff = deadline - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return {
      daysLeft: days < 0 ? Math.abs(days) : days,
      isOverdue: days < 0 && action.ACT_Status !== 'TERMINEE',
    };
  }, [action]);

  const handleSave = async () => {
    if (!action) return;
    setIsSaving(true);
    const tid = toast.loading("Mise à jour de l'action en cours...");
    try {
      const payload: Partial<Action> = {
        ACT_Description: formData.ACT_Description.trim() || undefined,
        ACT_Status: formData.ACT_Status,
      };

      if (formData.ACT_Status === 'TERMINEE' && action.ACT_Status !== 'TERMINEE') {
        payload.ACT_CompletedAt = new Date().toISOString();
      }

      await apiClient.patch(`/actions/${action.ACT_Id}`, payload);
      toast.success('Action mise à jour et scellée avec succès', { id: tid });
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Échec de la synchronisation SDE';
      toast.error(Array.isArray(msg) ? msg[0] : msg, { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !action) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#0F172A] text-white italic">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" strokeWidth={3} />
        <p className="text-[10px] md:text-xs font-black text-blue-500 uppercase tracking-[0.4em] animate-pulse m-0">Décryptage du registre...</p>
      </div>
    );
  }

  const responsible = users.find((u) => u.U_Id === action.ACT_ResponsableId);
  const creator = users.find((u) => u.U_Id === action.ACT_CreatorId);
  const paq = paqs.find((p) => p.PAQ_Id === action.ACT_PAQId);
  const isCompleted = action.ACT_Status === 'TERMINEE';

  return (
    <div className="h-full flex flex-col bg-[#0F172A] italic font-sans overflow-hidden selection:bg-blue-600/30 text-white w-full">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER FIXE (Zéro Scroll) */}
      <header className="shrink-0 p-6 md:p-8 lg:px-12 border-b border-white/5 bg-[#0F172A]/90 backdrop-blur-md z-20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-xl md:rounded-2xl bg-white/5 p-3 text-slate-400 hover:bg-white hover:text-slate-900 transition-all border-none cursor-pointer active:scale-95"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-400">
                Réf: {action.ACT_Id.slice(0, 8).toUpperCase()}
              </span>
              <span className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">
                {action.ACT_Origin.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter m-0 leading-tight">
              {action.ACT_Title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-slate-600" />
                <span>PAQ: {paq?.PAQ_Title || 'Non assigné'}</span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                <UserIcon className="h-4 w-4 text-slate-600" />
                <span>Créée par {creator ? `${creator.U_FirstName} ${creator.U_LastName}` : 'Système'} le {new Date(action.ACT_CreatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 shrink-0 mt-4 md:mt-0">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center rounded-xl md:rounded-2xl border border-white/10 bg-[#0B0F1A] p-4 text-slate-400 hover:text-white hover:border-slate-500 transition-all cursor-pointer active:scale-95 shadow-inner"
            aria-label="Imprimer le rapport"
          >
            <Printer className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isCompleted}
            className="inline-flex items-center justify-center rounded-xl md:rounded-2xl bg-blue-600 px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/20 hover:bg-white hover:text-slate-900 transition-all disabled:opacity-50 border-none cursor-pointer active:scale-95"
          >
            {isSaving ? (
              <><Loader2 className="mr-3 h-4 w-4 md:h-5 md:w-5 animate-spin" /> SCELLAGE...</>
            ) : (
              <><Save className="mr-3 h-4 w-4 md:h-5 md:w-5" /> {isCompleted ? 'ACTION CLÔTURÉE' : 'VALIDER MODIFICATIONS'}</>
            )}
          </button>
        </div>
      </header>

      {/* 📜 ZONE DE DÉFILEMENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl space-y-8 pb-20">
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* COLONNE 1 : MÉTADONNÉES ET STATUT */}
            <div className="lg:col-span-1 space-y-8">
              
              {/* STATUT DE L'ACTION */}
              <div className="rounded-4xl bg-[#0B0F1A]/80 shadow-2xl border border-white/5 p-8 backdrop-blur-sm">
                <h2 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3 m-0">
                  <Target size={16} className="text-blue-500" /> Statut Actuel
                </h2>
                <div className="space-y-3">
                  {Object.values(ActionStatus).map((status) => (
                    <button
                      key={status}
                      onClick={() => !isCompleted && setFormData({ ...formData, ACT_Status: status })}
                      disabled={isCompleted}
                      className={cn(
                        'w-full flex items-center justify-between rounded-2xl px-5 py-4 text-left text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border cursor-pointer m-0',
                        formData.ACT_Status === status
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-inner'
                          : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white',
                        isCompleted && 'cursor-not-allowed opacity-50',
                      )}
                    >
                      <span>{status.replace('_', ' ')}</span>
                      {formData.ACT_Status === status && (
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* INDICATEURS DE PERFORMANCE */}
              <div className="rounded-4xl bg-[#0B0F1A]/80 shadow-2xl border border-white/5 p-8 backdrop-blur-sm">
                <h2 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3 m-0">
                  <TrendingUp size={16} className="text-emerald-500" /> Indicateurs Clés
                </h2>
                <div className="space-y-6">
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Échéance</span>
                      <span className={cn('text-xs md:text-sm font-black italic', stats.isOverdue ? 'text-rose-500' : 'text-white')}>
                        {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString('fr-FR') : 'Non définie'}
                      </span>
                    </div>
                    {stats.isOverdue && (
                      <div className="flex items-center gap-2 text-[10px] font-black text-rose-500 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 uppercase tracking-widest">
                        <AlertCircle className="h-4 w-4" />
                        <span>Retard : {stats.daysLeft} Jours</span>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-white/5" />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Priorité</span>
                    <PriorityBadge priority={action.ACT_Priority} />
                  </div>

                  <div className="h-px bg-white/5" />

                  <div className="space-y-3">
                    <span className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Responsable Désigné</span>
                    <div className="flex items-center gap-3 bg-[#0F172A] p-4 rounded-2xl border border-white/5 shadow-inner">
                      <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-xs shrink-0">
                        {responsible?.U_FirstName?.charAt(0) || '?'}
                        {responsible?.U_LastName?.charAt(0) || '?'}
                      </div>
                      <span className="text-xs md:text-sm font-black text-white uppercase italic truncate">
                        {responsible ? `${responsible.U_FirstName} ${responsible.U_LastName}` : 'Non assigné'}
                      </span>
                    </div>
                  </div>

                  {action.ACT_CompletedAt && (
                    <>
                      <div className="h-px bg-white/5" />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] md:text-xs font-bold text-emerald-500 uppercase tracking-widest">Date Clôture</span>
                        <span className="text-xs md:text-sm font-black text-emerald-400 italic">
                          {new Date(action.ACT_CompletedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* COLONNES 2-3 : RAPPORT ET PREUVES */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* RAPPORT D'EXÉCUTION */}
              <div className="rounded-[2.5rem] bg-[#0B0F1A]/80 shadow-2xl border border-white/5 p-8 md:p-10 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <h2 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 m-0">
                    <FileText size={16} className="text-amber-500" /> Rapport d&apos;Exécution
                  </h2>
                  <span className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-amber-500">
                    Preuve ISO §10.2.1
                  </span>
                </div>
                <textarea
                  value={formData.ACT_Description}
                  onChange={(e) => setFormData({ ...formData, ACT_Description: e.target.value })}
                  disabled={isCompleted}
                  placeholder="Saisissez le rapport d'exécution technique détaillant les actions menées, les résultats obtenus et les leçons apprises..."
                  className={cn(
                    'block w-full rounded-3xl border border-white/5 bg-[#0F172A] p-6 text-xs md:text-sm font-bold italic text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none shadow-inner placeholder:text-slate-600 custom-scrollbar',
                    isCompleted ? 'bg-black/50 text-slate-500 cursor-not-allowed border-transparent' : '',
                  )}
                  rows={8}
                />
                <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-slate-500 m-0">
                  Ce rapport constitue une preuve objective de l&apos;efficacité de l&apos;action corrective/préventive.
                </p>
              </div>

              {/* DOSSIER DE PREUVES */}
              <div className="rounded-[2.5rem] bg-[#0B0F1A]/80 shadow-2xl border border-white/5 p-8 md:p-10 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                  <h2 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3 m-0">
                    <ShieldCheck size={16} className="text-emerald-500" /> Dossier de preuves
                  </h2>
                  <button className="inline-flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all cursor-pointer active:scale-95 m-0 border-solid">
                    <FileText className="mr-2 h-4 w-4" />
                    Ajouter une preuve
                  </button>
                </div>

                <div className="mt-6">
                  {preuves.length > 0 ? (
                    <div className="space-y-4">
                      {preuves.map((preuve) => (
                        <div key={preuve.PV_Id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-white/5 bg-[#0F172A] p-5 gap-4 shadow-inner group hover:border-emerald-500/30 transition-colors">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black italic uppercase text-white m-0 truncate group-hover:text-emerald-400 transition-colors">{preuve.PV_FileName}</p>
                            <p className="mt-2 text-[10px] font-bold text-slate-500 m-0 truncate">
                              {preuve.PV_Commentaire || 'Aucun commentaire associé à cette preuve.'}
                            </p>
                          </div>
                          <button className="shrink-0 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-rose-500 hover:bg-rose-500 hover:text-white transition-all focus:outline-none cursor-pointer">
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-4xl border-2 border-dashed border-white/10 bg-black/30 py-16 hover:bg-white/5 hover:border-emerald-500/30 transition-all group">
                      <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
                        <FileText className="h-8 w-8 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <p className="text-sm font-black uppercase tracking-widest text-slate-400 m-0 group-hover:text-white transition-colors">Aucune preuve associée</p>
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 text-center max-w-sm">
                        Ajoutez des documents ou rapports pour justifier l&apos;efficacité de l&apos;action.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* 🛡️ BLOC DE CONFORMITÉ ISO */}
          <div className="rounded-[2.5rem] bg-blue-900/10 border border-blue-500/20 p-8 md:p-10 mt-10 italic shadow-inner">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 border border-blue-400 shadow-lg shrink-0">
                  <span className="text-sm font-black text-white">§</span>
                </div>
                <div>
                  <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-blue-400 m-0 mb-3">Exigence ISO 9001:2015 §10.2</h3>
                  <p className="text-xs md:text-sm font-bold text-slate-400 leading-relaxed m-0">
                    Lorsqu&apos;une non-conformité survient, l&apos;organisation doit réagir, évaluer la nécessité d&apos;agir pour éliminer la cause afin d&apos;éviter que la non-conformité ne se reproduise ou ne se produise ailleurs.
                  </p>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-blue-500/70 m-0">
                    Cette action fait partie du Plan d&apos;Amélioration Continue (CAPA) et sa traçabilité est garantie.
                  </p>
                </div>
              </div>
              
              <div className="shrink-0 mt-4 md:mt-0">
                <button
                  onClick={handleSave}
                  disabled={isSaving || isCompleted}
                  className={cn(
                    'inline-flex items-center justify-center rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all border-none cursor-pointer w-full md:w-auto active:scale-95',
                    isCompleted
                      ? 'bg-black/50 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 text-white hover:bg-white hover:text-slate-900 shadow-blue-900/20',
                  )}
                >
                  <Save className="mr-3 h-4 w-4" />
                  {isCompleted ? 'ACTION CLÔTURÉE' : 'VALIDER MODIFICATIONS'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}} />
    </div>
  );
}

// ============================================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================================

function PriorityBadge({ priority }: { priority: Priority }) {
  const config: Record<Priority, { label: string; color: string }> = {
    LOW: { label: 'Basse', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
    MEDIUM: { label: 'Moyenne', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    HIGH: { label: 'Haute', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    URGENT: { label: 'Urgente', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    CRITICAL: { label: 'Critique', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' },
  };

  const { label, color } = config[priority] || config.MEDIUM;
  return (
    <span className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest border italic shadow-inner ${color}`}>
      {label}
    </span>
  );
}