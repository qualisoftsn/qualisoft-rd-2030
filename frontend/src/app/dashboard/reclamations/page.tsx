/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : REGISTRE DES RÉCLAMATIONS CLIENTS (ISO 10002)
 * -------------------------------------------------------------------------
 * RÔLE : Suivi macroscopique et filtrage des dossiers de plaintes.
 * CONFORMITÉ : ISO 10002:2018 | Zéro NextAuth (100% apiClient).
 * ARCHITECTURE : Routage natif vers /nouveau et /[id] (Modales supprimées).
 * DATE : 02 Mars 2026 | 14:15 GMT
 * -------------------------------------------------------------------------
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
  Download,
  Clock,
  RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import type { Reclamation, ReclamationStatus } from '@/types/elite-sde';

// --- UTILITAIRES ---
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

// --- CONFIGURATION DES STATUTS ISO ---
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  NOUVELLE: { label: 'Nouvelle', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <AlertCircle className="h-3 w-3" /> },
  EN_ANALYSE: { label: 'En analyse', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Target className="h-3 w-3" /> },
  ACTION_EN_COURS: { label: 'Action en cours', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: <Clock className="h-3 w-3" /> },
  TRAITEE: { label: 'Traitée', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  REJETEE: { label: 'Rejetée', color: 'bg-slate-100 text-slate-800 border-slate-200', icon: <AlertCircle className="h-3 w-3" /> },
};

export default function ReclamationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore() as any;

  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | 'ALL'>('ALL');

  /**
   * 📡 SYNCHRONISATION DU NOYAU RÉCLAMATIONS
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Reclamation[]>('/reclamations');
      const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setReclamations(data);
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
      const matchText = `${rec.REC_Object} ${rec.REC_Reference} ${rec.Tier?.TR_Name}`.toLowerCase();
      const matchesSearch = matchText.includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'ALL' || rec.REC_Status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [reclamations, searchTerm, selectedStatus]);

  if (loading && reclamations.length === 0) {
    return (
      <div className="ml-0 lg:ml-72 min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" strokeWidth={2} />
        <span className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">Synchronisation Registre...</span>
      </div>
    );
  }

  return (
    <div className="ml-0 lg:ml-72 bg-[#F9FAFB] min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      <Toaster position="top-right" richColors />

      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-700">
        
        {/* 🔝 HEADER CLICKUP STYLE */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6 lg:pb-8">
          <div className="space-y-2 lg:space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 lg:p-2.5 rounded-lg text-white shadow-lg shadow-indigo-200">
                <ShieldCheck size={20} className="lg:w-6 lg:h-6" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-900 uppercase italic m-0">
                Réclamations <span className="text-indigo-600">Clients</span>
              </h1>
            </div>
            <p className="text-xs lg:text-sm text-slate-500 font-medium m-0">
              Management de la satisfaction client — Conformité ISO 10002:2018
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 transition-all shadow-sm">
              <RefreshCw size={18} />
            </button>
            <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={18} />
            </button>
            <button
              onClick={() => router.push('/reclamations/nouveau')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-[0_8px_16px_rgba(79,70,229,0.2)] active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> Déclarer un litige
            </button>
          </div>
        </header>

        

        {/* 📊 KPI CARDS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          <KPIBox title="Registre" value={stats.total} icon={FileText} color="indigo" sub="Total dossiers" />
          <KPIBox title="À traiter" value={stats.nouvelles} icon={AlertCircle} color="amber" sub="Priorité immédiate" />
          <KPIBox title="Résolues" value={stats.traitees} icon={CheckCircle2} color="emerald" sub="Archives closes" />
          <KPIBox title="Taux de succès" value={`${stats.rate}%`} icon={Target} color="indigo" sub="Objectif Qualité" />
        </div>

        {/* 🔍 BARRE D'OUTILS ET FILTRES */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Rechercher par référence, client, objet..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl py-3 px-5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            <option value="ALL">Tous les statuts</option>
            {Object.keys(STATUS_CONFIG).map(key => (
              <option key={key} value={key}>{STATUS_CONFIG[key].label}</option>
            ))}
          </select>
        </div>

        {/* 📋 TABLEAU DES RÉCLAMATIONS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap lg:whitespace-normal">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Référence</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest min-w-62.5">Objet & Client</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Statut</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Échéance</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Pilotage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecs.map((rec) => (
                <tr
                  key={rec.REC_Id}
                  onClick={() => router.push(`/reclamations/${rec.REC_Id}`)}
                  className="hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                      #{rec.REC_Reference}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors italic line-clamp-1">{rec.REC_Object}</span>
                      <span className="text-[11px] text-slate-500 font-medium mt-1 uppercase tracking-wider flex items-center gap-1">
                        {rec.Tier?.TR_Name || "TIERS INCONNU"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={rec.REC_Status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      {rec.REC_Deadline ? new Date(rec.REC_Deadline).toLocaleDateString('fr-FR') : 'Non définie'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                      <ArrowUpRight size={18} strokeWidth={2.5} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecs.length === 0 && (
            <div className="py-24 flex flex-col items-center text-slate-400 gap-4 bg-slate-50/50">
              <Search size={48} strokeWidth={1.5} className="text-slate-300" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Aucune réclamation dans le périmètre</p>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
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
    <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 group hover:border-indigo-300 transition-all">
      <div className={cn("p-3 rounded-xl border shrink-0", colors[color])}>
        <Icon size={20} className="lg:w-6 lg:h-6" />
      </div>
      <div>
        <p className="text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 leading-none">{title}</p>
        <p className="text-2xl lg:text-3xl font-black text-slate-900 italic leading-none m-0">{value}</p>
        <p className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase m-0">{sub}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReclamationStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOUVELLE;
  return (
    <span className={cn("inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-black border uppercase tracking-widest whitespace-nowrap", config.color)}>
      {config.icon}
      {config.label}
    </span>
  );
}