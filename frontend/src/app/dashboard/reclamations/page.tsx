/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : GESTION DES RÉCLAMATIONS CLIENTS (ISO 10002)
 * -------------------------------------------------------------------------
 * RÔLE : Traitement, analyse des causes et résolution des réclamations tiers.
 * CONFORMITÉ : ISO 10002:2018 | Schéma Prisma Elite SDE.
 * DESIGN : ClickUp Enterprise (Sobriété, Espaces, Focus Data).
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 16:30 GMT
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  Target,
  Trash2,
  UploadCloud,
  X,
  Download,
  Edit3,
  Save,
  Clock,
  ExternalLink
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useAuthStore } from '@/store/authStore'; // ✅ Utilisation du store global Qualisoft
import type {
  Reclamation,
  ReclamationStatus,
  Tier,
  Processus,
  User,
  Priority,
} from '@/types/elite-sde';

// --- UTILITAIRES ---
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(' ');

// --- CONFIGURATION DES STATUTS ISO ---
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  NOUVELLE: { label: 'Nouvelle', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <AlertCircle className="h-3 w-3" /> },
  EN_ANALYSE: { label: 'En analyse', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Target className="h-3 w-3" /> },
  ACTION_EN_COURS: { label: 'Action en cours', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: <Clock className="h-3 w-3" /> },
  TRAITEE: { label: 'Traitée', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  REJETEE: { label: 'Rejetée', color: 'bg-slate-100 text-slate-800 border-slate-200', icon: <X className="h-3 w-3" /> },
};

export default function ReclamationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore() as any;

  // States de données
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | 'ALL'>('ALL');
  const [selectedRec, setSelectedRec] = useState<Reclamation | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  /**
   * 📡 SYNCHRONISATION DU NOYAU RÉCLAMATIONS
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [recsRes, tiersRes, procsRes, usersRes] = await Promise.all([
        apiClient.get<Reclamation[]>('/reclamations'),
        apiClient.get<Tier[]>('/tiers'),
        apiClient.get<Processus[]>('/processes'),
        apiClient.get<User[]>('/users'),
      ]);
      
      setReclamations(recsRes.data || []);
      setTiers(tiersRes.data || []);
      setProcesses(procsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      toast.error('Échec du chargement du registre ISO 10002');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, fetchData]);

  /**
   * 📊 ANALYTICS TEMPS RÉEL
   */
  const stats = useMemo(() => {
    const total = reclamations.length;
    const traitees = reclamations.filter(r => r.REC_Status === 'TRAITEE').length;
    const nouvelles = reclamations.filter(r => r.REC_Status === 'NOUVELLE').length;
    const rate = total > 0 ? Math.round((traitees / total) * 100) : 0;
    return { total, nouvelles, traitees, rate };
  }, [reclamations]);

  const filteredRecs = useMemo(() => {
    return reclamations.filter(rec => {
      const matchesSearch = 
        rec.REC_Object.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.REC_Reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.Tier?.TR_Name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'ALL' || rec.REC_Status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [reclamations, searchTerm, selectedStatus]);

  if (loading) {
    return (
      <div className="ml-72 h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronisation Registre...</span>
      </div>
    );
  }

  return (
    <div className="ml-72 bg-[#F9FAFB] min-h-screen p-8 selection:bg-indigo-100">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        {/* 🔝 HEADER CLICKUP STYLE */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
                <ShieldCheck size={20} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
                Réclamations <span className="text-indigo-600">Clients</span>
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Management de la satisfaction client — Conformité ISO 10002:2018
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={18} />
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> Déclarer une réclamation
            </button>
          </div>
        </header>

        {/* 📊 KPI CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPIBox title="Registre" value={stats.total} icon={FileText} color="indigo" sub="Total réclamations" />
          <KPIBox title="A traiter" value={stats.nouvelles} icon={AlertCircle} color="amber" sub="Priorité immédiate" />
          <KPIBox title="Résolues" value={stats.traitees} icon={CheckCircle2} color="emerald" sub="Archives closes" />
          <KPIBox title="Taux de succès" value={`${stats.rate}%`} icon={Target} color="indigo" sub="Objectif Qualité" />
        </div>

        {/* 🔍 BARRE D'OUTILS ET FILTRES */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Rechercher par référence, client, objet..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">Tous les statuts</option>
            {Object.keys(STATUS_CONFIG).map(key => (
              <option key={key} value={key}>{STATUS_CONFIG[key].label}</option>
            ))}
          </select>
        </div>

        {/* 📋 TABLEAU DES RÉCLAMATIONS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Référence</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Objet & Détail</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Statut</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Echéance</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-sans">
              {filteredRecs.map((rec) => (
                <tr
                  key={rec.REC_Id}
                  onClick={() => setSelectedRec(rec)}
                  className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-400">#{rec.REC_Reference}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors italic">{rec.REC_Object}</span>
                      <span className="text-[11px] text-slate-500 mt-0.5">{rec.Tier?.TR_Name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={rec.REC_Status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-600">
                        {rec.REC_Deadline ? new Date(rec.REC_Deadline).toLocaleDateString('fr-FR') : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ArrowUpRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-all inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecs.length === 0 && (
            <div className="py-20 flex flex-col items-center text-slate-400 gap-4">
              <Search size={48} strokeWidth={1} />
              <p className="text-sm font-medium uppercase tracking-widest">Aucune réclamation dans le périmètre</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAUX */}
      {isCreateModalOpen && (
        <CreateReclamationModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={fetchData}
          tiers={tiers}
          processes={processes}
          users={users}
        />
      )}

      {selectedRec && (
        <ReclamationDetailDrawer
          reclamation={selectedRec}
          onClose={() => setSelectedRec(null)}
          onUpdated={fetchData}
          tiers={tiers}
          processes={processes}
          users={users}
        />
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANTS ATOMIQUES
// ============================================================================

function KPIBox({ title, value, icon: Icon, color, sub }: any) {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-300 transition-all">
      <div className={cn("p-3 rounded-xl border", colors[color])}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">{title}</p>
        <p className="text-2xl font-black text-slate-900 italic leading-none">{value}</p>
        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{sub}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReclamationStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOUVELLE;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter", config.color)}>
      {config.icon}
      {config.label}
    </span>
  );
}

/**
 * 📟 MODAL DE CRÉATION
 */
function CreateReclamationModal({ onClose, onCreated, tiers, processes, users }: any) {
  const [form, setForm] = useState({
    REC_Object: '',
    REC_Description: '',
    REC_TierId: '',
    REC_ProcessusId: '',
    REC_OwnerId: '',
    REC_Deadline: '',
    REC_Gravity: 'MEDIUM' as Priority,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.REC_TierId || !form.REC_ProcessusId) return toast.error("Veuillez remplir les champs obligatoires");

    setSubmitting(true);
    try {
      await apiClient.post('/reclamations', {
        ...form,
        REC_Deadline: form.REC_Deadline ? new Date(form.REC_Deadline).toISOString() : null,
        REC_Status: 'NOUVELLE'
      });
      toast.success("Réclamation ISO enregistrée");
      onCreated();
      onClose();
    } catch (err) {
      toast.error("Échec de création");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 space-y-8">
          <div className="flex justify-between items-center border-b border-slate-100 pb-6">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
              Déclarer une <span className="text-indigo-600">Réclamation</span>
            </h2>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Objet de la réclamation *</label>
              <input 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold italic outline-none focus:border-indigo-600 transition-all"
                value={form.REC_Object}
                onChange={e => setForm({...form, REC_Object: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tier / Client *</label>
              <select 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold italic outline-none cursor-pointer"
                value={form.REC_TierId}
                onChange={e => setForm({...form, REC_TierId: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                {tiers.map((t: any) => <option key={t.TR_Id} value={t.TR_Id}>{t.TR_Name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Processus Impacté *</label>
              <select 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold italic outline-none cursor-pointer"
                value={form.REC_ProcessusId}
                onChange={e => setForm({...form, REC_ProcessusId: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                {processes.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-8 py-3 text-sm font-bold uppercase text-slate-500 hover:text-slate-900 transition-colors">Annuler</button>
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-black uppercase italic text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              {submitting ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
              Sceller la réclamation
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/**
 * 📟 DRAWER DE DÉTAIL
 */
function ReclamationDetailDrawer({ reclamation, onClose, onUpdated, tiers, processes, users }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...reclamation });
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      await apiClient.patch(`/reclamations/${reclamation.REC_Id}`, form);
      toast.success("Registre mis à jour");
      onUpdated();
      setIsEditing(false);
    } catch (err) {
      toast.error("Erreur de sauvegarde");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-110 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto italic">
        <div className="p-10 space-y-10">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Détail Dossier</span>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 mt-4">{reclamation.REC_Object}</h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">Référence Matrix: {reclamation.REC_Reference}</p>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"><X size={24}/></button>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
            <div className="flex justify-between items-center">
              <StatusBadge status={form.REC_Status} />
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors">
                  <Edit3 size={14} /> Modifier le dossier
                </button>
              ) : (
                <div className="flex gap-4">
                  <button onClick={() => setIsEditing(false)} className="text-[10px] font-black uppercase text-slate-400">Annuler</button>
                  <button onClick={handleUpdate} disabled={submitting} className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1">
                    <Save size={14} /> Sauvegarder
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Description du litige</h4>
              {isEditing ? (
                <textarea 
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium outline-none h-32 focus:border-indigo-600"
                  value={form.REC_Description}
                  onChange={e => setForm({...form, REC_Description: e.target.value})}
                />
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed">{reclamation.REC_Description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <DetailItem label="Client émetteur" value={reclamation.Tier?.TR_Name} />
            <DetailItem label="Processus cible" value={reclamation.Processus?.PR_Libelle || "Non spécifié"} />
            <DetailItem label="Propriétaire" value={`${reclamation.Owner?.U_FirstName} ${reclamation.Owner?.U_LastName}`} />
            <DetailItem label="Date Réception" value={new Date(reclamation.REC_DateReceipt).toLocaleDateString('fr-FR')} />
          </div>

          <div className="pt-10 border-t border-slate-100 space-y-6">
             <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-2">
                <Target className="text-indigo-600" size={18} /> Plan de Résolution (ISO 10002)
             </h4>
             <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
               {isEditing ? (
                 <textarea 
                    placeholder="Saisir la solution corrective proposée..."
                    className="w-full bg-white border border-indigo-200 rounded-2xl p-4 text-sm font-medium outline-none h-32 focus:border-indigo-600"
                    value={form.REC_SolutionProposed}
                    onChange={e => setForm({...form, REC_SolutionProposed: e.target.value})}
                 />
               ) : (
                 <p className="text-sm text-indigo-900 leading-relaxed italic">
                   {reclamation.REC_SolutionProposed || "Aucune solution n'a encore été enregistrée pour ce dossier."}
                 </p>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: any) {
  return (
    <div className="space-y-1 text-left">
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}