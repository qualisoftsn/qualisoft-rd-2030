/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  AlertOctagon, Loader2, Plus, X, Trash2, Edit3, ShieldCheck, Save, Search,
  TrendingUp, Target, Calendar, Users, FileText, Download, Filter, 
  BarChart3, PieChart, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RiskGridPage() {
  const [processusList, setProcessusList] = useState<any[]>([]);
  const [riskTypes, setRiskTypes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [riskStats, setRiskStats] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'GRID' | 'DASHBOARD'>('GRID');
  const [selectedProcess, setSelectedProcess] = useState<string>('ALL');
  const [showActionsModal, setShowActionsModal] = useState<{ risk: any } | null>(null);

  // Etat du formulaire aligné sur ISO 9001:2015
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

  // Récupération des données
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resProc, resTypes, resUsers, resRisks] = await Promise.all([
        apiClient.get('/processus'),
        apiClient.get('/risk-types'),
        apiClient.get('/users'),
        apiClient.get('/risks/heatmap')
      ]);

      // Mapping pour afficher tous les processus
      const mappedData = resProc.data.map((proc: any) => ({
        ...proc,
        risks: resRisks.data.filter((r: any) => r.RS_ProcessusId === proc.PR_Id)
      }));

      setProcessusList(mappedData);
      setRiskTypes(resTypes.data);
      setUsers(resUsers.data);
    } catch (err) {
      console.error("Erreur de synchronisation des données", err);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupération des statistiques ISO 9001
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await apiClient.get('/risks/stats');
      setRiskStats(res.data);
    } catch (err) {
      console.error("Erreur chargement stats", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  // Filtre des risques
  const filteredProcessus = useMemo(() => {
    if (selectedProcess === 'ALL') return processusList;
    return processusList.filter(p => p.PR_Id === selectedProcess);
  }, [processusList, selectedProcess]);

  // Calcul des indicateurs ISO 9001
  const isoIndicators = useMemo(() => {
    if (!riskStats) return null;
    
    const total = riskStats.totalRisks;
    const treated = riskStats.byStatus.TRAITE || 0;
    const accepted = riskStats.byStatus.ACCEPTE || 0;
    const treatmentRate = total > 0 ? Math.round(((treated + accepted) / total) * 100) : 0;
    
    return {
      treatmentRate,
      criticalRate: riskStats.byCriticality.critical,
      improvementNeeded: treatmentRate < 80 || riskStats.byCriticality.critical > 0
    };
  }, [riskStats]);

  const handleOpenCreate = (procId: string) => {
    setEditingId(null);
    setFormData({ 
      RS_Libelle: '', RS_Activite: '', RS_Tache: '', RS_Causes: '', RS_Description: '',
      RS_Probabilite: 1, RS_Gravite: 1, RS_Maitrise: 1,
      RS_ProcessusId: procId, RS_TypeId: riskTypes[0]?.RT_Id || '',
      RS_Status: 'IDENTIFIE', RS_Mesures: '', RS_Acteurs: '',
      RS_NextReview: null,
      RS_Contexte: '',
      RS_PartiesInteressees: '',
      RS_ExigencesLegales: '',
      RS_Opportunite: '',
      actions: []
    });
    setIsModalOpen(true);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.patch(`/risks/${editingId}`, formData);
        toast.success("Risque mis à jour avec succès");
      } else {
        await apiClient.post('/risks', formData);
        toast.success("Risque créé avec succès - Actions générées automatiquement");
      }
      setIsModalOpen(false);
      fetchData();
      fetchStats();
    } catch (err: any) {
      console.error("Erreur enregistrement", err);
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Attention ! Cette action archivera le risque et toutes ses actions associées. Continuer ?")) return;
    
    try {
      await apiClient.delete(`/risks/${id}`);
      toast.success("Risque archivé avec succès");
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error("Erreur lors de l'archivage");
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await apiClient.get('/risks/report?period=QUARTER');
      // Génération d'un rapport PDF ou affichage dans une modale
      toast.success("Rapport de revue généré - Disponible dans Documents");
      console.log("Rapport:", res.data);
    } catch (err) {
      toast.error("Erreur lors de la génération du rapport");
    }
  };

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]">
      <div className="text-center">
        <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-widest">
          Chargement de la matrice des risques ISO 9001...
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-72 text-white italic text-left font-sans relative">
      
      {/* HEADER ISO 9001 */}
      <header className="mb-8 border-b border-white/5 pb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
              Management <span className="text-red-600">des Risques</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">
              ISO 9001:2015 §6.1 • Approche Basée sur les Risques • P x G x M
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleGenerateReport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg"
            >
              <FileText size={18} /> Rapport Revue Direction
            </button>
            
            <button 
              onClick={() => setViewMode(viewMode === 'GRID' ? 'DASHBOARD' : 'GRID')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all"
            >
              {viewMode === 'GRID' ? <BarChart3 size={18} /> : <GridIcon size={18} />}
              {viewMode === 'GRID' ? 'Tableau de Bord' : 'Grille Détaillée'}
            </button>
            
            <button 
              onClick={() => handleOpenCreate('')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
            >
              <Plus size={18} strokeWidth={3} /> Nouveau Risque
            </button>
          </div>
        </div>

        {/* INDICATEURS ISO 9001 */}
        {!statsLoading && riskStats && isoIndicators && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <IndicatorCard 
              label="Taux de Traitement" 
              value={`${isoIndicators.treatmentRate}%`} 
              target="≥ 80%" 
              icon={<Target className="text-emerald-500" />}
              status={isoIndicators.treatmentRate >= 80 ? 'success' : 'warning'}
              description="Objectif ISO 9001:2015 §10.2"
            />
            <IndicatorCard 
              label="Risques Critiques" 
              value={riskStats.byCriticality.critical} 
              icon={<AlertTriangle className="text-red-500" />}
              status={riskStats.byCriticality.critical > 0 ? 'critical' : 'success'}
              description="Score ≥ 20 (P×G×M)"
            />
            <IndicatorCard 
              label="Total des Risques" 
              value={riskStats.totalRisks} 
              icon={<AlertOctagon className="text-amber-500" />}
              description={`Évolution: ${riskStats.evolution.trend}`}
            />
            <IndicatorCard 
              label="Actions en Cours" 
              value={riskStats.actionsByStatus?.EN_COURS || 0} 
              icon={<Clock className="text-blue-500" />}
              description="Suivi des actions §6.1.2"
            />
          </div>
        )}
      </header>

      {/* MODE DASHBOARD - Vue analytique ISO 9001 */}
      {viewMode === 'DASHBOARD' ? (
        <DashboardView 
          processusList={processusList}
          riskStats={riskStats}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
        />
      ) : (
        /* MODE GRILLE - Vue détaillée par processus */
        <GridView 
          filteredProcessus={filteredProcessus}
          riskTypes={riskTypes}
          users={users}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
          onDelete={handleDelete}
          onViewActions={(risk) => setShowActionsModal({ risk })}
        />
      )}

      {/* MODAL DE CRÉATION/ÉDITION ISO 9001 */}
      {isModalOpen && (
        <RiskModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          riskTypes={riskTypes}
          users={users}
          processusList={processusList}
          isEditing={!!editingId}
        />
      )}

      {/* MODAL D'AFFICHAGE DES ACTIONS */}
      {showActionsModal && (
        <ActionsModal 
          risk={showActionsModal.risk}
          onClose={() => setShowActionsModal(null)}
        />
      )}
    </div>
  );
}

// ========================
// COMPOSANTS RÉUTILISABLES
// ========================

function IndicatorCard({ label, value, target, icon, status, description }: any) {
  const getStatusColor = () => {
    if (status === 'success') return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
    if (status === 'warning') return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
    if (status === 'critical') return 'bg-red-500/20 border-red-500/30 text-red-400';
    return 'bg-slate-500/20 border-white/10 text-slate-400';
  };

  return (
    <div className={`p-5 rounded-2xl border ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
        {target && (
          <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full">
            Cible: {target}
          </span>
        )}
      </div>
      <p className="text-[9px] font-black uppercase text-white/70 mb-1">{label}</p>
      <p className="text-3xl font-black">{value}</p>
      {description && (
        <p className="text-[8px] mt-2 text-white/60 italic">{description}</p>
      )}
    </div>
  );
}

function GridIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function DashboardView({ processusList, riskStats, onOpenCreate, onOpenEdit }: any) {
  return (
    <div className="space-y-8">
      {/* Cartographie des risques par processus */}
      <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          <BarChart3 className="text-blue-500" /> Répartition des Risques par Processus
        </h2>
        <div className="h-96 bg-slate-900/30 rounded-2xl border border-white/5 flex items-center justify-center">
          <p className="text-slate-500 italic">Graphique de répartition - En développement</p>
        </div>
      </section>

      {/* Analyse des tendances */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <TrendingUp className="text-emerald-500" /> Évolution des Risques
          </h2>
          <div className="space-y-4">
            {riskStats?.topProcesses?.map((proc: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <span className="font-black">Processus {idx + 1}</span>
                <div className="flex items-center gap-4">
                  <div className="w-40 bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-red-500" 
                      style={{ width: `${Math.min(100, (proc.count / riskStats.totalRisks) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="font-black text-red-400">{proc.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <PieChart className="text-amber-500" /> Répartition par Criticité
          </h2>
          <div className="space-y-4">
            {Object.entries(riskStats?.byCriticality || {}).map(([level, count]: [string, any]) => {
              const percentage = riskStats.totalRisks > 0 ? Math.round((count / riskStats.totalRisks) * 100) : 0;
              return (
                <div key={level} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <span className="font-black capitalize">{level}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-40 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full ${
                          level === 'critical' ? 'bg-red-500' :
                          level === 'high' ? 'bg-amber-500' :
                          level === 'medium' ? 'bg-blue-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="font-black">{count} ({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recommandations ISO 9001 */}
      <section className="bg-gradient-to-r from-red-900/30 to-amber-900/30 border border-amber-500/20 rounded-3xl p-8">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-amber-400">
          <AlertTriangle size={24} /> Recommandations ISO 9001:2015
        </h2>
        <div className="space-y-4">
          {riskStats?.recommendations?.map((rec: string, idx: number) => (
            <div key={idx} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border-l-4 border-amber-500">
              <CheckCircle className="text-amber-400 mt-1 flex-shrink-0" size={18} />
              <p className="font-bold text-white/90">{rec}</p>
            </div>
          ))}
          {!riskStats?.recommendations?.length && (
            <p className="text-emerald-400 font-bold italic">
              ✅ Aucune recommandation critique - Bon niveau de maturité du système de management
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function GridView({ filteredProcessus, riskTypes, users, onOpenCreate, onOpenEdit, onDelete, onViewActions }: any) {
  return (
    <div className="space-y-12">
      {filteredProcessus.map((proc) => (
        <section key={proc.PR_Id} className="group">
          <div className="flex justify-between items-end mb-6 border-l-4 border-red-600 pl-6">
            <div>
              <span className="text-red-500 font-black text-[10px] uppercase tracking-widest">{proc.PR_Code}</span>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">{proc.PR_Libelle}</h2>
              <p className="text-slate-500 text-[9px] mt-1 uppercase italic">
                Pilote: {proc.PR_Pilote?.U_FirstName} {proc.PR_Pilote?.U_LastName}
              </p>
            </div>
            <button 
              onClick={() => onOpenCreate(proc.PR_Id)}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
            >
              <Plus size={16} strokeWidth={3} /> Identifier un risque
            </button>
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-x-auto backdrop-blur-sm">
            <table className="w-full text-left min-w-[1200px]">
              <thead>
                <tr className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">
                  <th className="p-6">Identification (Activité / Danger)</th>
                  <th className="p-6 text-center">P</th>
                  <th className="p-6 text-center">G</th>
                  <th className="p-6 text-center">M</th>
                  <th className="p-6 text-center">Score</th>
                  <th className="p-6">Statut ISO 9001</th>
                  <th className="p-6">Actions Associées</th>
                  <th className="p-6 text-right">Prochaine Revue</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px]">
                {proc.risks?.length > 0 ? proc.risks.map((risk: any) => {
                  const score = risk.RS_Score || (risk.RS_Probabilite * risk.RS_Gravite * (risk.RS_Maitrise || 1));
                  const isCritical = score >= 20;
                  const isHigh = score >= 12 && score < 20;
                  
                  return (
                    <tr key={risk.RS_Id} className="hover:bg-white/2 transition-colors">
                      <td className="p-6">
                        <span className="text-[8px] font-black text-blue-500 uppercase block mb-1">
                          {risk.RS_Activite || 'ACTIVITÉ NON DÉFINIE'}
                        </span>
                        <span className="text-lg font-black uppercase italic tracking-tight text-white">
                          {risk.RS_Libelle}
                        </span>
                        <p className="text-[9px] text-slate-400 mt-1 line-clamp-2">
                          {risk.RS_Causes || 'Causes non spécifiées'}
                        </p>
                        {risk.RS_Opportunite && (
                          <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <span className="text-[8px] font-black text-emerald-400 uppercase">Opportunité:</span>
                            <p className="text-[9px] text-emerald-300 mt-1 line-clamp-1">{risk.RS_Opportunite}</p>
                          </div>
                        )}
                      </td>
                      <td className="p-6 text-center font-black italic text-slate-400">P{risk.RS_Probabilite}</td>
                      <td className="p-6 text-center font-black italic text-red-500">G{risk.RS_Gravite}</td>
                      <td className="p-6 text-center font-black italic text-blue-500">M{risk.RS_Maitrise || 1}</td>
                      <td className="p-6 text-center">
                        <span className={`text-3xl font-black italic ${
                          isCritical ? 'text-red-500 animate-pulse' :
                          isHigh ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {score}
                        </span>
                        {isCritical && (
                          <div className="mt-1 text-[8px] font-black text-red-400 flex items-center justify-center gap-1">
                            <AlertTriangle size={12} /> CRITIQUE
                          </div>
                        )}
                      </td>
                      <td className="p-6">
                        <RiskStatusBadge status={risk.RS_Status} />
                        {risk.RS_Contexte && (
                          <p className="text-[8px] mt-1 text-slate-500 italic line-clamp-1">
                            Contexte: {risk.RS_Contexte}
                          </p>
                        )}
                      </td>
                      <td className="p-6">
                        <button 
                          onClick={() => onViewActions(risk)}
                          className="text-[10px] font-black text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Users size={14} />
                          {risk.RS_Actions?.length || 0} action{risk.RS_Actions?.length > 1 ? 's' : ''}
                          <ChevronRight size={12} className="ml-1" />
                        </button>
                        {risk.RS_Actions?.some((a: any) => a.ACT_Status === 'EN_RETARD') && (
                          <div className="mt-1 text-[8px] text-red-400 flex items-center gap-1">
                            <Clock size={10} /> Actions en retard
                          </div>
                        )}
                      </td>
                      <td className="p-6 text-right">
                        {risk.RS_NextReview ? (
                          <div className="text-center">
                            <Calendar className="text-amber-400 mx-auto mb-1" size={16} />
                            <span className="text-[10px] font-black">
                              {new Date(risk.RS_NextReview).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Non planifiée</span>
                        )}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => onOpenEdit(risk)} 
                            className="p-2 bg-white/5 hover:bg-blue-600 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => onDelete(risk.RS_Id)} 
                            className="p-2 bg-white/5 hover:bg-red-600 rounded-lg transition-colors"
                            title="Archiver"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={9} className="p-20 text-center opacity-20">
                      <ShieldCheck size={60} className="mx-auto mb-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.5em]">
                        Aucun risque identifié pour ce processus
                      </span>
                      <p className="text-[9px] mt-2 text-slate-600 italic">
                        Conformément à l'ISO 9001:2015 §6.1, identifiez les risques et opportunités
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function RiskStatusBadge({ status }: { status: string }) {
  const config = {
    'IDENTIFIE': { label: 'Identifié', color: 'bg-blue-500/20 text-blue-300' },
    'EVALUE': { label: 'Évalué', color: 'bg-amber-500/20 text-amber-300' },
    'SURVEILLE': { label: 'Surveillé', color: 'bg-orange-500/20 text-orange-300' },
    'CRITIQUE': { label: 'Critique', color: 'bg-red-500/20 text-red-300 animate-pulse' },
    'TRAITE': { label: 'Traité', color: 'bg-emerald-500/20 text-emerald-300' },
    'ACCEPTE': { label: 'Accepté', color: 'bg-purple-500/20 text-purple-300' },
    'ANNULE': { label: 'Annulé', color: 'bg-slate-500/20 text-slate-300' }
  };
  
  const { label, color } = config[status as keyof typeof config] || config.IDENTIFIE;
  
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${color} border border-current/30`}>
      {label}
    </span>
  );
}

function ChevronRight({ size, className }: { size: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><polyline points="9 18 15 12 9 6" /></svg>;
}

// ========================
// MODALS COMPLETS
// ========================

function RiskModal({ isOpen, onClose, onSubmit, formData, setFormData, riskTypes, users, processusList, isEditing }: any) {
  const [activeTab, setActiveTab] = useState('RISK');
  const [newAction, setNewAction] = useState({
    ACT_Title: '',
    ACT_Type: 'PREVENTIVE',
    ACT_ResponsableId: users[0]?.U_Id || '',
    ACT_Deadline: null as Date | null,
    ACT_Description: ''
  });

  if (!isOpen) return null;

  const handleAddAction = () => {
    if (!newAction.ACT_Title.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      actions: [
        ...prev.actions,
        { ...newAction, ACT_Deadline: newAction.ACT_Deadline?.toISOString() }
      ]
    }));
    
    setNewAction({
      ACT_Title: '',
      ACT_Type: 'PREVENTIVE',
      ACT_ResponsableId: users[0]?.U_Id || '',
      ACT_Deadline: null,
      ACT_Description: ''
    });
  };

  const handleRemoveAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const score = formData.RS_Probabilite * formData.RS_Gravite * formData.RS_Maitrise;
  const isCritical = score >= 20;

  return (
    <div className="fixed inset-0 z-200 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-[3rem] w-full max-w-6xl max-h-[95vh] overflow-y-auto animate-in zoom-in duration-300">
        <div className="sticky top-0 bg-[#0B0F1A] border-b border-white/5 z-10">
          <div className="flex justify-between items-center p-6">
            <h2 className="text-4xl font-black uppercase italic">
              {isEditing ? 'Modifier le' : 'Nouveau'} <span className="text-red-600">Risque</span>
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={32} />
            </button>
          </div>
          
          <div className="border-b border-white/5">
            <div className="flex">
              <button
                onClick={() => setActiveTab('RISK')}
                className={`px-8 py-4 font-black text-[10px] uppercase tracking-widest ${
                  activeTab === 'RISK' 
                    ? 'text-red-500 border-b-4 border-red-500' 
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                Identification du Risque
              </button>
              <button
                onClick={() => setActiveTab('CONTEXT')}
                className={`px-8 py-4 font-black text-[10px] uppercase tracking-widest ${
                  activeTab === 'CONTEXT' 
                    ? 'text-amber-500 border-b-4 border-amber-500' 
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                Contexte ISO 9001
              </button>
              <button
                onClick={() => setActiveTab('ACTIONS')}
                className={`px-8 py-4 font-black text-[10px] uppercase tracking-widest ${
                  activeTab === 'ACTIONS' 
                    ? 'text-blue-500 border-b-4 border-blue-500' 
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                Actions Associées ({formData.actions.length})
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-8">
          {activeTab === 'RISK' && (
            <div className="grid grid-cols-3 gap-8 italic font-black">
              <div className="col-span-1 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Processus</label>
                <select
                  required
                  value={formData.RS_ProcessusId}
                  onChange={e => setFormData({...formData, RS_ProcessusId: e.target.value})}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-red-500 uppercase"
                >
                  <option value="">-- Sélectionner un processus --</option>
                  {processusList.map((proc: any) => (
                    <option key={proc.PR_Id} value={proc.PR_Id}>{proc.PR_Code} - {proc.PR_Libelle}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Type de Risque</label>
                <select
                  required
                  value={formData.RS_TypeId}
                  onChange={e => setFormData({...formData, RS_TypeId: e.target.value})}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-red-500 uppercase"
                >
                  <option value="">-- Sélectionner un type --</option>
                  {riskTypes.map((type: any) => (
                    <option key={type.RT_Id} value={type.RT_Id}>{type.RT_Label}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Activité liée</label>
                <input 
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-red-500 uppercase" 
                  value={formData.RS_Activite} 
                  onChange={e => setFormData({...formData, RS_Activite: e.target.value})} 
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Désignation du Danger / Risque *</label>
                <input 
                  required
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-red-500 uppercase" 
                  value={formData.RS_Libelle} 
                  onChange={e => setFormData({...formData, RS_Libelle: e.target.value})} 
                />
              </div>

              <div className="col-span-3 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Causes / Événements déclencheurs</label>
                <textarea 
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-white outline-none focus:border-red-500 italic h-24" 
                  value={formData.RS_Causes} 
                  onChange={e => setFormData({...formData, RS_Causes: e.target.value})} 
                />
              </div>

              <div className="col-span-3 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Description détaillée</label>
                <textarea 
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-white outline-none focus:border-red-500 italic h-32" 
                  value={formData.RS_Description} 
                  onChange={e => setFormData({...formData, RS_Description: e.target.value})} 
                />
              </div>

              <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                <label className="text-[9px] uppercase text-slate-400">Probabilité (P)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="4" 
                  required
                  className="bg-transparent text-4xl w-full text-center outline-none font-black" 
                  value={formData.RS_Probabilite} 
                  onChange={e => setFormData({...formData, RS_Probabilite: Math.min(4, Math.max(1, parseInt(e.target.value) || 1))})} 
                />
                <div className="text-[8px] text-slate-500 mt-2 italic">
                  1=Rare, 2=Peu probable, 3=Probable, 4=Très probable
                </div>
              </div>

              <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                <label className="text-[9px] uppercase text-red-500">Gravité (G)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="4" 
                  required
                  className="bg-transparent text-4xl w-full text-center outline-none font-black text-red-500" 
                  value={formData.RS_Gravite} 
                  onChange={e => setFormData({...formData, RS_Gravite: Math.min(4, Math.max(1, parseInt(e.target.value) || 1))})} 
                />
                <div className="text-[8px] text-slate-500 mt-2 italic">
                  1=Négligeable, 2=Modéré, 3=Grave, 4=Catastrophique
                </div>
              </div>

              <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                <label className="text-[9px] uppercase text-emerald-400">Maîtrise (M)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="4" 
                  required
                  className="bg-transparent text-4xl w-full text-center outline-none font-black text-emerald-400" 
                  value={formData.RS_Maitrise} 
                  onChange={e => setFormData({...formData, RS_Maitrise: Math.min(4, Math.max(1, parseInt(e.target.value) || 1))})} 
                />
                <div className="text-[8px] text-slate-500 mt-2 italic">
                  1=Maîtrise totale, 2=Maîtrise partielle, 3=Maîtrise faible, 4=Aucune maîtrise
                </div>
              </div>

              <div className="col-span-3 p-6 bg-gradient-to-r from-red-900/30 to-amber-900/30 border border-amber-500/30 rounded-2xl flex flex-col items-center justify-center">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[10px] uppercase text-amber-400 italic">Score de Criticité</span>
                  <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-black text-amber-400">P</span>
                  </div>
                  <span className="text-2xl">×</span>
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-black text-red-400">G</span>
                  </div>
                  <span className="text-2xl">×</span>
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-black text-emerald-400">M</span>
                  </div>
                  <span className="text-2xl">=</span>
                </div>
                <div className="text-center">
                  <span className={`text-7xl font-black italic tracking-tighter ${
                    isCritical ? 'text-red-500 animate-pulse' : 'text-amber-400'
                  }`}>
                    R = {score}
                  </span>
                  <div className={`mt-2 text-[10px] font-black uppercase ${
                    isCritical ? 'text-red-400' : score >= 12 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {isCritical ? 'RISQUE CRITIQUE - ACTION IMMÉDIATE REQUISE' : 
                     score >= 12 ? 'RISQUE ÉLEVÉ - SURVEILLANCE RENFORCÉE' : 
                     'RISQUE MODÉRÉ'}
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Mesures Préventives/Correctives</label>
                <textarea 
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs h-28 outline-none focus:border-red-500 italic" 
                  value={formData.RS_Mesures} 
                  onChange={e => setFormData({...formData, RS_Mesures: e.target.value})} 
                />
              </div>
              <div className="col-span-1 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Acteurs Impliqués</label>
                <textarea 
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] h-28 outline-none focus:border-red-500 uppercase italic" 
                  value={formData.RS_Acteurs} 
                  onChange={e => setFormData({...formData, RS_Acteurs: e.target.value})} 
                />
              </div>

              <div className="col-span-1 space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Prochaine Revue</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-red-500" 
                  value={formData.RS_NextReview ? formData.RS_NextReview.toISOString().split('T')[0] : ''}
                  onChange={e => setFormData({
                    ...formData, 
                    RS_NextReview: e.target.value ? new Date(e.target.value) : null
                  })} 
                />
                <p className="text-[8px] text-slate-500 mt-1 italic">ISO 9001 §9.3 - Revue de direction</p>
              </div>
            </div>
          )}

          {activeTab === 'CONTEXT' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase text-slate-500 ml-2">Contexte Organisationnel (ISO 9001 §4.1)</label>
                  <textarea 
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs h-32 outline-none focus:border-amber-500 italic" 
                    value={formData.RS_Contexte} 
                    onChange={e => setFormData({...formData, RS_Contexte: e.target.value})} 
                    placeholder="Ex: Expansion internationale, changement réglementaire, nouveau marché..."
                  />
                  <p className="text-[8px] text-amber-500 mt-1 italic">📋 Facteurs internes et externes influençant le risque</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] uppercase text-slate-500 ml-2">Parties Intéressées (ISO 9001 §4.2)</label>
                  <textarea 
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs h-32 outline-none focus:border-amber-500 italic" 
                    value={formData.RS_PartiesInteressees} 
                    onChange={e => setFormData({...formData, RS_PartiesInteressees: e.target.value})} 
                    placeholder="Ex: Clients, fournisseurs, autorités, employés..."
                  />
                  <p className="text-[8px] text-amber-500 mt-1 italic">👥 Parties impactées ou influençant le risque</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Exigences Légales et Réglementaires (ISO 9001 §6.1.3)</label>
                <textarea 
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs h-32 outline-none focus:border-amber-500 italic" 
                  value={formData.RS_ExigencesLegales} 
                  onChange={e => setFormData({...formData, RS_ExigencesLegales: e.target.value})} 
                  placeholder="Ex: Normes qualité, réglementations sécurité, lois environnementales..."
                />
                <p className="text-[8px] text-amber-500 mt-1 italic">⚖️ Obligations légales applicables à ce risque</p>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase text-slate-500 ml-2">Opportunités Associées (ISO 9001 §6.1)</label>
                <textarea 
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-xs h-32 outline-none focus:border-emerald-500 italic" 
                  value={formData.RS_Opportunite} 
                  onChange={e => setFormData({...formData, RS_Opportunite: e.target.value})} 
                  placeholder="Ex: Innovation produit, amélioration processus, réduction coûts..."
                />
                <p className="text-[8px] text-emerald-500 mt-1 italic">💡 Opportunités potentielles liées à ce risque</p>
              </div>
            </div>
          )}

          {activeTab === 'ACTIONS' && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                  <Users className="text-blue-400" /> Actions de Traitement Associées
                </h3>
                <p className="text-[10px] text-slate-400 italic mb-4">
                  ISO 9001 §6.1.2 - Planification des actions pour traiter les risques et opportunités
                </p>
                
                {/* Liste des actions existantes */}
                {formData.actions.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {formData.actions.map((action: any, idx: number) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-blue-400 uppercase">{action.ACT_Type}</span>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className="text-[10px] font-bold">{action.ACT_Title}</span>
                          </div>
                          {action.ACT_Description && (
                            <p className="text-[9px] text-slate-400 mt-1 line-clamp-1">{action.ACT_Description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-[9px] text-slate-500">
                            <span>Responsable: {users.find((u: any) => u.U_Id === action.ACT_ResponsableId)?.U_FirstName || 'Non assigné'}</span>
                            {action.ACT_Deadline && (
                              <>
                                <span>•</span>
                                <span>Échéance: {new Date(action.ACT_Deadline).toLocaleDateString('fr-FR')}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveAction(idx)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600 italic">
                    Aucune action associée - Ajoutez des actions ci-dessous
                  </div>
                )}

                {/* Formulaire d'ajout d'action */}
                <div className="mt-6 pt-6 border-t border-white/5">
                  <h4 className="text-lg font-black mb-4">Ajouter une Nouvelle Action</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase text-slate-500">Titre de l'action *</label>
                      <input
                        type="text"
                        required
                        value={newAction.ACT_Title}
                        onChange={e => setNewAction({...newAction, ACT_Title: e.target.value})}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                        placeholder="Ex: Mettre à jour la procédure de sécurité"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase text-slate-500">Type d'action *</label>
                      <select
                        value={newAction.ACT_Type}
                        onChange={e => setNewAction({...newAction, ACT_Type: e.target.value})}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                      >
                        <option value="PREVENTIVE">Préventive</option>
                        <option value="CORRECTIVE">Corrective</option>
                        <option value="AMELIORATION">Amélioration</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase text-slate-500">Responsable *</label>
                      <select
                        value={newAction.ACT_ResponsableId}
                        onChange={e => setNewAction({...newAction, ACT_ResponsableId: e.target.value})}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                      >
                        {users.map((user: any) => (
                          <option key={user.U_Id} value={user.U_Id}>
                            {user.U_FirstName} {user.U_LastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase text-slate-500">Échéance</label>
                      <input
                        type="date"
                        value={newAction.ACT_Deadline ? newAction.ACT_Deadline.toISOString().split('T')[0] : ''}
                        onChange={e => setNewAction({
                          ...newAction, 
                          ACT_Deadline: e.target.value ? new Date(e.target.value) : null
                        })}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <label className="text-[9px] uppercase text-slate-500">Description</label>
                    <textarea
                      value={newAction.ACT_Description}
                      onChange={e => setNewAction({...newAction, ACT_Description: e.target.value})}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-blue-500 h-24"
                      placeholder="Description détaillée de l'action à entreprendre..."
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Ajouter cette action
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-red-900/30"
            >
              <Save size={20} />
              {isEditing ? 'Mettre à jour le risque' : 'Enregistrer et générer les actions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActionsModal({ risk, onClose }: any) {
  if (!risk) return null;

  return (
    <div className="fixed inset-0 z-200 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0B0F1A] border-b border-white/5 z-10 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black">Actions Associées au Risque</h2>
            <p className="text-xl text-red-500 mt-1">{risk.RS_Libelle}</p>
            <p className="text-[10px] text-slate-500 mt-2 uppercase italic">
              Score: {risk.RS_Score} • Statut: {risk.RS_Status}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={32} />
          </button>
        </div>

        <div className="p-8">
          {risk.RS_Actions?.length > 0 ? (
            <div className="space-y-4">
              {risk.RS_Actions.map((action: any) => (
                <div 
                  key={action.ACT_Id} 
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                        action.ACT_Type === 'CORRECTIVE' ? 'bg-red-500/20 text-red-300' :
                        action.ACT_Type === 'PREVENTIVE' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {action.ACT_Type}
                      </span>
                      <h3 className="text-lg font-black mt-2">{action.ACT_Title}</h3>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${
                      action.ACT_Status === 'TERMINEE' ? 'bg-emerald-500/20 text-emerald-300' :
                      action.ACT_Status === 'EN_RETARD' ? 'bg-red-500/20 text-red-300 animate-pulse' :
                      action.ACT_Status === 'A_VALIDER' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {action.ACT_Status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {action.ACT_Description && (
                    <p className="text-[10px] text-slate-400 mt-2 mb-3 italic">{action.ACT_Description}</p>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4 text-[10px] text-slate-400">
                    <div>
                      <span className="text-blue-400 font-black uppercase">Responsable:</span>
                      <p className="mt-1">{action.ACT_Responsable?.U_FirstName} {action.ACT_Responsable?.U_LastName}</p>
                    </div>
                    <div>
                      <span className="text-blue-400 font-black uppercase">Priorité:</span>
                      <p className="mt-1">{action.ACT_Priority}</p>
                    </div>
                    <div>
                      <span className="text-blue-400 font-black uppercase">Échéance:</span>
                      <p className={`mt-1 ${
                        action.ACT_Deadline && new Date(action.ACT_Deadline) < new Date() && action.ACT_Status !== 'TERMINEE'
                          ? 'text-red-400 font-black animate-pulse' 
                          : ''
                      }`}>
                        {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString('fr-FR') : 'Non définie'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-600 italic">
              <Users size={48} className="mx-auto mb-4 text-blue-500/30" />
              <p>Aucune action associée à ce risque</p>
              <p className="text-[10px] mt-2">ISO 9001 §6.1.2 - Aucune action planifiée pour traiter ce risque</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}