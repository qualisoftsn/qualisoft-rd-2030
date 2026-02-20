/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NOM ABSOLU : src/app/dashboard/quality/risks/page.tsx
 * FONCTION : Registre central de la gestion des risques et opportunités.
 * NORME : ISO 9001:2015 §6.1 (Actions à l'égard des risques et opportunités).
 * LOGIQUE : Évaluation PxGxM, cartographie par processus et pilotage des actions de traitement.
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  AlertOctagon, Loader2, Plus, X, Trash2, Edit3, ShieldCheck, Save, Search,
  TrendingUp, Target, Calendar, Users, FileText, Download, Filter, 
  BarChart3, PieChart, CheckCircle, Clock, AlertTriangle, ChevronRight, LayoutGrid
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- 🛡️ TYPAGE STRICT DU SMI ---
interface Risk {
  RS_Id: string;
  RS_Libelle: string;
  RS_Probabilite: number;
  RS_Gravite: number;
  RS_Maitrise: number;
  RS_Score?: number;
  RS_Status: string;
  RS_ProcessusId: string;
  RS_Actions?: any[];
  [key: string]: any;
}

export default function RiskGridPage() {
  // --- ÉTATS DES RÉFÉRENTIELS ---
  const [processusList, setProcessusList] = useState<any[]>([]);
  const [riskTypes, setRiskTypes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // --- ÉTATS DE CHARGEMENT & VUE ---
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'GRID' | 'DASHBOARD'>('GRID');
  const [selectedProcess, setSelectedProcess] = useState<string>('ALL');

  // --- ÉTATS DES MODAUX ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [riskStats, setRiskStats] = useState<any>(null);
  const [showActionsModal, setShowActionsModal] = useState<{ risk: any } | null>(null);

  // --- STRUCTURE DU FORMULAIRE ISO 9001:2015 ---
  const [formData, setFormData] = useState({
    RS_Libelle: '', 
    RS_Activite: '', 
    RS_Tache: '', 
    RS_Causes: '',
    RS_Description: '',
    RS_Probabilite: 1, 
    RS_Gravite: 1, 
    RS_Maitrise: 1,
    RS_ProcessusId: '', 
    RS_TypeId: '', 
    RS_Status: 'IDENTIFIE',
    RS_Mesures: '', 
    RS_Acteurs: '',
    RS_NextReview: null as Date | null,
    RS_Contexte: '',
    RS_PartiesInteressees: '',
    RS_ExigencesLegales: '',
    RS_Opportunite: '',
    actions: [] as any[]
  });

  /**
   * 📡 SYNCHRONISATION MULTI-SOURCES
   * Agrège les processus, les types de risques, les acteurs et la heatmap.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resProc, resTypes, resUsers, resRisks] = await Promise.all([
        apiClient.get('/processus'),
        apiClient.get('/risk-types'),
        apiClient.get('/users'),
        apiClient.get('/risks/heatmap')
      ]);

      // Mapping des risques par processus pour la vue en grille
      const mappedData = resProc.data.map((proc: any) => ({
        ...proc,
        risks: resRisks.data.filter((r: any) => r.RS_ProcessusId === proc.PR_Id)
      }));

      setProcessusList(mappedData);
      setRiskTypes(resTypes.data);
      setUsers(resUsers.data);
    } catch (err) {
      toast.error("Rupture de liaison avec le Noyau de Risques");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 📊 ANALYSE STATISTIQUE §9.1.3
   * Récupère les métriques de performance du management des risques.
   */
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await apiClient.get('/risks/stats');
      setRiskStats(res.data);
    } catch (err) {
      console.error("Échec du calcul des stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  /**
   * 🧠 CALCULATEUR D'INDICATEURS ISO
   * Sécurise les données statistiques pour l'affichage des KPIs de tête.
   */
  const isoIndicators = useMemo(() => {
    if (!riskStats || !riskStats.byCriticality) {
      return { treatmentRate: 0, criticalCount: 0, improvementNeeded: false };
    }
    
    const total = riskStats.totalRisks || 0;
    const treated = riskStats.byStatus?.TRAITE || 0;
    const accepted = riskStats.byStatus?.ACCEPTE || 0;
    const treatmentRate = total > 0 ? Math.round(((treated + accepted) / total) * 100) : 0;
    const criticalCount = riskStats.byCriticality?.critical || 0; 
    
    return {
      treatmentRate,
      criticalCount,
      improvementNeeded: treatmentRate < 80 || criticalCount > 0
    };
  }, [riskStats]);

  /** 🔍 FILTRAGE PAR PROCESSUS */
  const filteredProcessus = useMemo(() => {
    if (selectedProcess === 'ALL') return processusList;
    return processusList.filter(p => p.PR_Id === selectedProcess);
  }, [processusList, selectedProcess]);

  /** 📝 OUVERTURE CRÉATION */
  const handleOpenCreate = (procId: string) => {
    setEditingId(null);
    setFormData({ 
      RS_Libelle: '', RS_Activite: '', RS_Tache: '', RS_Causes: '', RS_Description: '',
      RS_Probabilite: 1, RS_Gravite: 1, RS_Maitrise: 1,
      RS_ProcessusId: procId, RS_TypeId: riskTypes[0]?.RT_Id || '',
      RS_Status: 'IDENTIFIE', RS_Mesures: '', RS_Acteurs: '',
      RS_NextReview: null, RS_Contexte: '', RS_PartiesInteressees: '',
      RS_ExigencesLegales: '', RS_Opportunite: '', actions: []
    });
    setIsModalOpen(true);
  };

  /** 🛠️ OUVERTURE ÉDITION */
  const handleOpenEdit = (risk: any) => {
    setEditingId(risk.RS_Id);
    setFormData({
      RS_Libelle: risk.RS_Libelle,
      RS_Activite: risk.RS_Activite || '',
      RS_Tache: risk.RS_Tache || '',
      RS_Causes: risk.RS_Causes || '',
      RS_Description: risk.RS_Description || '',
      RS_Probabilite: risk.RS_Probabilite,
      RS_Gravite: risk.RS_Gravite,
      RS_Maitrise: risk.RS_Maitrise || 1,
      RS_ProcessusId: risk.RS_ProcessusId,
      RS_TypeId: risk.RS_TypeId,
      RS_Status: risk.RS_Status,
      RS_Mesures: risk.RS_Mesures || '',
      RS_Acteurs: risk.RS_Acteurs || '',
      RS_NextReview: risk.RS_NextReview ? new Date(risk.RS_NextReview) : null,
      RS_Contexte: risk.RS_Contexte || '',
      RS_PartiesInteressees: risk.RS_PartiesInteressees || '',
      RS_ExigencesLegales: risk.RS_ExigencesLegales || '',
      RS_Opportunite: risk.RS_Opportunite || '',
      actions: risk.RS_Actions || []
    });
    setIsModalOpen(true);
  };

  /** 💾 PERSISTANCE SÉCURISÉE (§7.5) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.patch(`/risks/${editingId}`, formData);
        toast.success("Risque mis à jour dans la matrice");
      } else {
        await apiClient.post('/risks', formData);
        toast.success("Identification Risque scellée §6.1");
      }
      setIsModalOpen(false);
      fetchData();
      fetchStats();
    } catch (err: any) {
      toast.error("Échec de l'enregistrement documentaire");
    }
  };

  /** 🗑️ ARCHIVAGE LOGIQUE */
  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Confirmer l'archivage de ce risque ? Cette action sera tracée.")) return;
    try {
      await apiClient.delete(`/risks/${id}`);
      toast.success("Élément déplacé vers le registre d'archives");
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error("Échec de l'archivage");
    }
  };

  // --- RENDU ÉCRAN DE CHARGEMENT ---
  if (loading) return (
    <div className="ml-80 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-6">
      <Loader2 className="animate-spin text-red-600" size={50} />
      <p className="text-red-600 font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Calcul de la Matrice PxGxM...</p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-80 text-white italic text-left font-sans selection:bg-red-600/30">
      
      {/* 📡 HEADER SOUVERAIN RISQUES */}
      <header className="mb-10 border-b border-white/5 pb-10">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              Management <span className="text-red-600">des Risques</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-4 italic flex items-center gap-3">
              <ShieldCheck size={14} className="text-red-600" /> ISO 9001:2015 §6.1 • Cartographie des Menaces SMI
            </p>
          </div>
          <div className="flex gap-5">
            <button 
              onClick={() => setViewMode(viewMode === 'GRID' ? 'DASHBOARD' : 'GRID')} 
              className="bg-slate-900 border border-white/10 hover:bg-slate-800 px-8 py-5 rounded-2xl font-black uppercase text-[10px] flex items-center gap-4 transition-all shadow-inner italic"
            >
              {viewMode === 'GRID' ? <BarChart3 size={20} /> : <LayoutGrid size={20} />}
              {viewMode === 'GRID' ? 'Analyse Dashboard' : 'Registre Grille'}
            </button>
            <button 
              onClick={() => handleOpenCreate('')} 
              className="bg-red-600 hover:bg-red-500 px-10 py-5 rounded-2xl font-black uppercase text-[10px] flex items-center gap-4 transition-all shadow-[0_20px_50px_rgba(220,38,38,0.2)] border-none cursor-pointer italic"
            >
              <Plus size={20} strokeWidth={4} /> Identifier un Risque
            </button>
          </div>
        </div>

        {/* 📊 MATRICE D'INDICATEURS RÉACTIFS (§9.1.3) */}
        {!statsLoading && riskStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <IndicatorCard 
              label="Taux de Maîtrise" value={`${isoIndicators.treatmentRate}%`} 
              target="≥ 80%" icon={<Target className="text-emerald-500" />}
              status={isoIndicators.treatmentRate >= 80 ? 'success' : 'warning'}
            />
            <IndicatorCard 
              label="Menaces Critiques" value={isoIndicators.criticalCount} 
              icon={<AlertTriangle className="text-red-500" />}
              status={isoIndicators.criticalCount > 0 ? 'critical' : 'success'}
            />
            <IndicatorCard 
              label="Risques Indexés" value={riskStats.totalRisks || 0} 
              icon={<AlertOctagon className="text-amber-500" />}
            />
            <IndicatorCard 
              label="Actions Correctives" value={riskStats.actionsByStatus?.EN_COURS || 0} 
              icon={<Clock className="text-blue-500" />}
            />
          </div>
        )}
      </header>

      {/* 🛰️ ZONE DE RENDU DES VUES */}
      {viewMode === 'DASHBOARD' ? (
        <DashboardView processusList={processusList} riskStats={riskStats} />
      ) : (
        <GridView 
          filteredProcessus={filteredProcessus} 
          onOpenCreate={handleOpenCreate} 
          onOpenEdit={handleOpenEdit} 
          onDelete={handleDelete}
          onViewActions={(risk: any) => setShowActionsModal({ risk })}
        />
      )}

      {/* 📟 MODALES DE GESTION */}
      {isModalOpen && (
        <RiskModal 
          isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
          onSubmit={handleSubmit} formData={formData} setFormData={setFormData}
          riskTypes={riskTypes} users={users} processusList={processusList} isEditing={!!editingId}
        />
      )}

      {showActionsModal && (
        <ActionsModal risk={showActionsModal.risk} onClose={() => setShowActionsModal(null)} users={users} />
      )}
    </div>
  );
}

/** 🛠️ COMPOSANT : CARTE INDICATEUR SMI */
function IndicatorCard({ label, value, target, icon, status }: any) {
  const getColors = () => {
    if (status === 'success') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.05)]';
    if (status === 'warning') return 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_10px_30px_rgba(245,158,11,0.05)]';
    if (status === 'critical') return 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse';
    return 'bg-white/5 border-white/10 text-slate-400';
  };
  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all ${getColors()}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-black/40 rounded-2xl shadow-inner">{icon}</div>
        {target && <span className="text-[9px] font-black bg-white/5 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] italic border border-white/5">Cible ISO: {target}</span>}
      </div>
      <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest italic">{label}</p>
      <p className="text-5xl font-black tracking-tighter italic">{value}</p>
    </div>
  );
}

/** 📊 COMPOSANT : VUE REGISTRE EN GRILLE */
function GridView({ filteredProcessus, onOpenCreate, onOpenEdit, onDelete, onViewActions }: any) {
  return (
    <div className="space-y-20 animate-in fade-in duration-700">
      {filteredProcessus.map((proc: any) => (
        <section key={proc.PR_Id}>
          <div className="flex justify-between items-end mb-10 border-l-8 border-red-600 pl-10">
            <div>
              <span className="text-red-500 font-black text-[11px] uppercase tracking-[0.4em] italic leading-none">{proc.PR_Code}</span>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mt-4">{proc.PR_Libelle}</h2>
            </div>
            <button 
              onClick={() => onOpenCreate(proc.PR_Id)} 
              className="bg-white/5 hover:bg-red-600 text-slate-400 hover:text-white border border-white/10 px-8 py-4 rounded-2xl font-black uppercase text-[10px] transition-all italic tracking-widest"
            >
              + Identifier un risque
            </button>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] italic">
                  <th className="p-10">Identification & Danger</th>
                  <th className="p-10 text-center">Matrice (P-G-M)</th>
                  <th className="p-10 text-center">Score Critique</th>
                  <th className="p-10">Statut ISO</th>
                  <th className="p-10">Actions GPEC</th>
                  <th className="p-10 text-right">Pilotage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 italic">
                {proc.risks?.length > 0 ? proc.risks.map((risk: any) => {
                  const score = risk.RS_Score || (risk.RS_Probabilite * risk.RS_Gravite * (risk.RS_Maitrise || 1));
                  return (
                    <tr key={risk.RS_Id} className="hover:bg-white/5 transition-all group">
                      <td className="p-10">
                        <span className="text-[10px] font-black text-blue-500 uppercase block mb-2 tracking-widest">{risk.RS_Activite || 'PROCESSUS CLÉ'}</span>
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-red-500 transition-colors">{risk.RS_Libelle}</h4>
                        <p className="text-[11px] text-slate-500 mt-3 line-clamp-2 max-w-xl font-bold">{risk.RS_Description}</p>
                      </td>
                      <td className="p-10 text-center">
                        <div className="flex justify-center gap-4">
                          <span title="Probabilité" className="w-12 h-12 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-center font-black text-sm italic">{risk.RS_Probabilite}</span>
                          <span title="Gravité" className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-500/20 flex items-center justify-center font-black text-sm text-red-500 italic">{risk.RS_Gravite}</span>
                          <span title="Maîtrise" className="w-12 h-12 rounded-2xl bg-blue-950/40 border border-blue-500/20 flex items-center justify-center font-black text-sm text-blue-500 italic">{risk.RS_Maitrise}</span>
                        </div>
                      </td>
                      <td className="p-10 text-center">
                        <span className={`text-5xl font-black italic tracking-tighter ${score >= 20 ? 'text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)]' : score >= 12 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {score}
                        </span>
                      </td>
                      <td className="p-10">
                        <span className="bg-white/5 border border-white/10 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic">{risk.RS_Status}</span>
                      </td>
                      <td className="p-10">
                        <button onClick={() => onViewActions(risk)} className="text-blue-500 font-black text-[11px] uppercase flex items-center gap-3 italic hover:bg-blue-500/10 p-4 rounded-2xl transition-all">
                          <Users size={18} /> {risk.RS_Actions?.length || 0} Mesures
                        </button>
                      </td>
                      <td className="p-10 text-right">
                        <div className="flex justify-end gap-5">
                          <button onClick={() => onOpenEdit(risk)} className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-blue-500 transition-all border-none cursor-pointer"><Edit3 size={20} /></button>
                          <button onClick={() => onDelete(risk.RS_Id)} className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-red-600 transition-all border-none cursor-pointer"><Trash2 size={20} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={6} className="p-32 text-center text-slate-700 font-black uppercase text-[12px] tracking-[0.5em] italic opacity-30">Aucun risque scellé dans ce périmètre processus</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

/** 📈 COMPOSANT : ANALYSE DASHBOARD ISO */
function DashboardView({ riskStats }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-bottom-10 duration-1000">
      <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[4rem] shadow-2xl">
        <h3 className="text-3xl font-black uppercase italic mb-12 flex items-center gap-5 tracking-tighter leading-none"><PieChart className="text-red-600" /> Profil de Criticité SMI</h3>
        <div className="space-y-10">
          {['critical', 'high', 'medium', 'low'].map(level => {
            const count = riskStats?.byCriticality?.[level] || 0;
            const pct = riskStats?.totalRisks > 0 ? (count / riskStats.totalRisks) * 100 : 0;
            return (
              <div key={level} className="space-y-4">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] italic">
                  <span className={level === 'critical' ? 'text-red-500' : 'text-slate-400'}>{level} risk segment</span>
                  <span className="text-white">{count} Menaces</span>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full transition-all duration-1000 ${level === 'critical' ? 'bg-red-600' : level === 'high' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-linear-to-br from-red-600/10 via-transparent to-transparent border border-red-600/10 p-12 rounded-[4rem] shadow-2xl backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-5 text-red-600 rotate-12"><TrendingUp size={300} /></div>
        <h3 className="text-3xl font-black uppercase italic mb-12 flex items-center gap-5 tracking-tighter leading-none relative z-10"><AlertTriangle className="text-amber-500" /> Alertes ISO 9001 §6.1</h3>
        <div className="space-y-6 relative z-10">
          {riskStats?.recommendations?.length > 0 ? riskStats.recommendations.map((rec: string, i: number) => (
            <div key={i} className="flex gap-6 p-8 bg-black/40 rounded-[2.5rem] border-l-8 border-amber-600 shadow-xl">
              <ShieldCheck size={28} className="text-amber-600 shrink-0" />
              <p className="text-[13px] font-bold italic leading-relaxed text-slate-300 uppercase tracking-tight">{rec}</p>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20 italic">
                <CheckCircle size={60} className="mb-6" />
                <p className="font-black uppercase tracking-widest text-[10px]">Aucune anomalie détectée dans le système de risques</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 📑 COMPOSANT : MODALE D'IDENTIFICATION DU RISQUE */
function RiskModal({ isOpen, onClose, onSubmit, formData, setFormData, riskTypes, users, processusList, isEditing }: any) {
  const score = formData.RS_Probabilite * formData.RS_Gravite * formData.RS_Maitrise;

  return (
    <div className="fixed inset-0 z-110 bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 animate-in zoom-in duration-300">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-[4.5rem] w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col shadow-[0_60px_120px_rgba(0,0,0,0.8)]">
        
        {/* HEADER MODALE */}
        <div className="p-12 border-b border-white/5 flex justify-between items-center text-left">
          <div>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              {isEditing ? 'Édition' : 'Identification'} <span className="text-red-600">Risque SMI</span>
            </h2>
            <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.4em] italic mt-4">Scellage du dossier d&apos;analyse §6.1</p>
          </div>
          <button onClick={onClose} className="p-6 bg-white/5 rounded-3xl hover:bg-red-600 text-white transition-all border-none cursor-pointer"><X size={36} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-16 scrollbar-hide text-left italic">
          <form onSubmit={onSubmit} className="space-y-16">
            
            {/* SEGMENTATION ISO */}
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-6 tracking-[0.3em] italic">Processus Pilote Impacté</label>
                <select required className="w-full bg-[#0F172A] border border-white/10 p-7 rounded-3xl outline-none focus:border-red-600 uppercase font-black text-xs text-white appearance-none cursor-pointer shadow-inner" 
                  value={formData.RS_ProcessusId} onChange={e => setFormData({...formData, RS_ProcessusId: e.target.value})}>
                  <option value="">-- SÉLECTIONNER UN PROCESSUS --</option>
                  {processusList.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-6 tracking-[0.3em] italic">Catégorie de Menace</label>
                <select required className="w-full bg-[#0F172A] border border-white/10 p-7 rounded-3xl outline-none focus:border-red-600 uppercase font-black text-xs text-white appearance-none cursor-pointer shadow-inner"
                  value={formData.RS_TypeId} onChange={e => setFormData({...formData, RS_TypeId: e.target.value})}>
                  {riskTypes.map((t: any) => <option key={t.RT_Id} value={t.RT_Id}>{t.RT_Label}</option>)}
                </select>
              </div>
            </div>

            {/* DÉSIGNATION RADICALE */}
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase text-slate-500 ml-6 tracking-[0.3em] italic">Intitulé du Risque & Danger Potentiel (§6.1.1)</label>
              <input required className="w-full bg-[#0F172A] border border-white/10 p-8 rounded-3xl outline-none focus:border-red-600 uppercase font-black text-xl italic text-white shadow-inner tracking-tighter"
                value={formData.RS_Libelle} onChange={e => setFormData({...formData, RS_Libelle: e.target.value})} placeholder="DÉSIGNATION DE L'ANOMALIE OU DU RISQUE..." />
            </div>

            {/* MATRICE P-G-M (§ÉVALUATION) */}
            <div className="grid grid-cols-3 gap-12">
              <MatriceInput label="Probabilité d&apos;occurrence" val={formData.RS_Probabilite} set={(v: any) => setFormData({...formData, RS_Probabilite: v})} color="text-white" />
              <MatriceInput label="Gravité de l&apos;impact" val={formData.RS_Gravite} set={(v: any) => setFormData({...formData, RS_Gravite: v})} color="text-red-500" />
              <MatriceInput label="Indice de Non-Maîtrise" val={formData.RS_Maitrise} set={(v: any) => setFormData({...formData, RS_Maitrise: v})} color="text-blue-500" />
            </div>

            {/* SCORE ANALYTIQUE */}
            <div className="bg-slate-950/60 rounded-[3rem] p-12 border border-white/5 flex flex-col items-center shadow-inner group">
              <span className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-600 mb-6 italic leading-none">Score de Criticité GPEC (§PxGxM)</span>
              <span className={`text-[12rem] font-black italic tracking-tighter leading-none transition-transform group-hover:scale-110 duration-700 ${score >= 20 ? 'text-red-600' : 'text-amber-500'}`}>{score}</span>
              <p className="mt-8 text-[11px] font-black uppercase text-slate-700 italic tracking-[0.4em]">
                 {"$$Score = P \\times G \\times M$$"}
              </p>
            </div>

            {/* DESCRIPTION DÉTAILLÉE */}
            <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-slate-500 ml-6 tracking-[0.3em] italic">Description du Scénario & Conséquences SMI</label>
                <textarea rows={4} className="w-full bg-[#0F172A] border border-white/10 p-8 rounded-[2.5rem] outline-none focus:border-red-600 font-bold text-sm text-slate-200 italic shadow-inner resize-none leading-relaxed"
                  value={formData.RS_Description} onChange={e => setFormData({...formData, RS_Description: e.target.value})} placeholder="Détailler ici les causes racines, le contexte interne/externe et les enjeux opérationnels..." />
            </div>

            {/* ACTIONS DE VALIDATION */}
            <div className="flex justify-end gap-6 border-t border-white/5 pt-16">
              <button type="button" onClick={onClose} className="px-12 py-6 font-black uppercase text-[12px] text-slate-600 tracking-widest hover:text-white transition-all border-none bg-transparent cursor-pointer italic">Abandonner</button>
              <button type="submit" className="bg-red-600 hover:bg-red-500 px-16 py-7 rounded-4xl font-black uppercase text-[12px] flex items-center gap-5 transition-all shadow-2xl shadow-red-900/40 border-none cursor-pointer text-white italic active:scale-95">
                  <Save size={24} /> Sceller le Risque
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/** 🛠️ COMPOSANT : INPUT MATRICE (STYLISÉ) */
function MatriceInput({ label, val, set, color }: any) {
  return (
    <div className="bg-slate-950/40 p-10 rounded-[3rem] border border-white/5 text-center space-y-8 shadow-inner hover:border-white/20 transition-all">
      <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 italic block leading-none">{label}</label>
      <div className="flex items-center justify-center gap-8">
          <button type="button" onClick={() => set(Math.max(1, val - 1))} className="w-12 h-12 rounded-full border border-white/10 text-slate-500 hover:text-white transition-all border-none cursor-pointer bg-white/5 font-black text-xl">-</button>
          <span className={`text-8xl font-black italic tracking-tighter leading-none ${color}`}>{val}</span>
          <button type="button" onClick={() => set(Math.min(4, val + 1))} className="w-12 h-12 rounded-full border border-white/10 text-slate-500 hover:text-white transition-all border-none cursor-pointer bg-white/5 font-black text-xl">+</button>
      </div>
      <p className="text-[9px] font-black text-slate-800 uppercase italic tracking-widest leading-none">Échelle 1-4 (ISO Standard)</p>
    </div>
  );
}

/** 📋 COMPOSANT : MODALE DES ACTIONS DE TRAITEMENT */
function ActionsModal({ risk, onClose, users }: any) {
  return (
    <div className="fixed inset-0 z-110 bg-black/98 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in duration-500 text-left">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-[4.5rem] w-full max-w-5xl p-16 max-h-[85vh] overflow-hidden flex flex-col shadow-4xl relative">
        <div className="absolute top-0 right-0 p-20 opacity-5 text-blue-500 -rotate-12 pointer-events-none"><ShieldCheck size={300} /></div>
        
        <div className="flex justify-between items-start mb-16 relative z-10 border-b border-white/5 pb-10">
          <div className="text-left">
            <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Traitement <span className="text-blue-500">du Risque</span></h2>
            <p className="text-red-500 font-black text-[13px] uppercase mt-4 tracking-[0.3em] italic leading-tight">{risk.RS_Libelle}</p>
          </div>
          <button onClick={onClose} className="p-6 bg-white/5 rounded-3xl hover:bg-red-600 text-white transition-all border-none cursor-pointer"><X size={36} /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 relative z-10 scrollbar-hide">
          {risk.RS_Actions?.length > 0 ? risk.RS_Actions.map((a: any) => (
            <div key={a.ACT_Id} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] flex justify-between items-center group hover:bg-blue-600/5 transition-all shadow-xl">
              <div className="text-left">
                <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.4em] italic mb-3 block">Type: {a.ACT_Type || 'PRÉVENTIVE'}</span>
                <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic group-hover:text-blue-400 transition-colors leading-none">{a.ACT_Title}</h4>
                <div className="flex items-center gap-8 mt-6 text-[11px] text-slate-500 font-black uppercase tracking-widest italic">
                  <span className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5"><Users size={16} /> {a.ACT_Responsable?.U_FirstName}</span>
                  <span className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5"><Calendar size={16} /> {a.ACT_Deadline ? new Date(a.ACT_Deadline).toLocaleDateString() : 'NON PLANIFIÉ'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-4">
                  <span className="bg-blue-600/10 text-blue-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-blue-600/20 italic shadow-lg">{a.ACT_Status}</span>
                  <button className="p-3 bg-white/5 rounded-xl hover:text-white transition-all opacity-0 group-hover:opacity-100 border-none cursor-pointer"><ChevronRight size={20}/></button>
              </div>
            </div>
          )) : (
            <div className="py-40 flex flex-col items-center justify-center opacity-20 italic">
                <ShieldCheck size={80} className="mb-8" />
                <p className="text-slate-500 font-black uppercase text-xl tracking-[0.5em] text-center">Aucune mesure de traitement planifiée §6.1.2</p>
                <button className="mt-10 px-10 py-5 bg-white/5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all border-none cursor-pointer">Initialiser une action</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}