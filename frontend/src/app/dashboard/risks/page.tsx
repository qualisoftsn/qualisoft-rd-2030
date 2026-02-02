/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  AlertOctagon, Loader2, Plus, X, Trash2, Edit3, ShieldCheck, Save, Search,
  TrendingUp, Target, Calendar, Users, FileText, Download, Filter, 
  BarChart3, PieChart, CheckCircle, Clock, AlertTriangle, ChevronRight, LayoutGrid
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

  // État du formulaire aligné sur ISO 9001:2015
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resProc, resTypes, resUsers, resRisks] = await Promise.all([
        apiClient.get('/processus'),
        apiClient.get('/risk-types'),
        apiClient.get('/users'),
        apiClient.get('/risks/heatmap')
      ]);

      const mappedData = resProc.data.map((proc: any) => ({
        ...proc,
        risks: resRisks.data.filter((r: any) => r.RS_ProcessusId === proc.PR_Id)
      }));

      setProcessusList(mappedData);
      setRiskTypes(resTypes.data);
      setUsers(resUsers.data);
    } catch (err) {
      console.error("Erreur sync data", err);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await apiClient.get('/risks/stats');
      setRiskStats(res.data);
    } catch (err) {
      console.error("Erreur stats", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  // ✅ CALCUL SÉCURISÉ DES INDICATEURS (Correction de l'erreur Runtime)
  const isoIndicators = useMemo(() => {
    // Si riskStats est null ou si byCriticality n'existe pas, on renvoie des valeurs neutres
    if (!riskStats || !riskStats.byCriticality) {
      return { treatmentRate: 0, criticalCount: 0, improvementNeeded: false };
    }
    
    const total = riskStats.totalRisks || 0;
    const treated = riskStats.byStatus?.TRAITE || 0;
    const accepted = riskStats.byStatus?.ACCEPTE || 0;
    const treatmentRate = total > 0 ? Math.round(((treated + accepted) / total) * 100) : 0;
    const criticalCount = riskStats.byCriticality?.critical || 0; // Sécurisation .critical
    
    return {
      treatmentRate,
      criticalCount,
      improvementNeeded: treatmentRate < 80 || criticalCount > 0
    };
  }, [riskStats]);

  const filteredProcessus = useMemo(() => {
    if (selectedProcess === 'ALL') return processusList;
    return processusList.filter(p => p.PR_Id === selectedProcess);
  }, [processusList, selectedProcess]);

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
        toast.success("Risque mis à jour");
      } else {
        await apiClient.post('/risks', formData);
        toast.success("Risque créé §6.1");
      }
      setIsModalOpen(false);
      fetchData();
      fetchStats();
    } catch (err: any) {
      toast.error("Erreur d'enregistrement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Archiver ce risque ?")) return;
    try {
      await apiClient.delete(`/risks/${id}`);
      toast.success("Risque archivé");
      fetchData();
      fetchStats();
    } catch (err) {
      toast.error("Erreur");
    }
  };

  if (loading) return (
    <div className="ml-80 flex h-screen items-center justify-center bg-[#0B0F1A]">
      <div className="text-center">
        <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Analyse de la matrice des risques...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-10 ml-80 text-white italic text-left font-sans">
      <header className="mb-8 border-b border-white/5 pb-8">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
              Management <span className="text-red-600">des Risques</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3 italic">
              ISO 9001:2015 §6.1 • Approche par les risques • Cartographie PxGxM
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setViewMode(viewMode === 'GRID' ? 'DASHBOARD' : 'GRID')} className="bg-slate-800 hover:bg-slate-700 px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all">
              {viewMode === 'GRID' ? <BarChart3 size={18} /> : <LayoutGrid size={18} />}
              {viewMode === 'GRID' ? 'Dashboard ISO' : 'Vue Grille'}
            </button>
            <button onClick={() => handleOpenCreate('')} className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-red-900/20">
              <Plus size={18} strokeWidth={3} /> Nouveau Risque
            </button>
          </div>
        </div>

        {/* INDICATEURS RÉACTIFS */}
        {!statsLoading && riskStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <IndicatorCard 
              label="Taux de Traitement" value={`${isoIndicators.treatmentRate}%`} 
              target="≥ 80%" icon={<Target className="text-emerald-500" />}
              status={isoIndicators.treatmentRate >= 80 ? 'success' : 'warning'}
            />
            <IndicatorCard 
              label="Risques Critiques" value={isoIndicators.criticalCount} 
              icon={<AlertTriangle className="text-red-500" />}
              status={isoIndicators.criticalCount > 0 ? 'critical' : 'success'}
            />
            <IndicatorCard 
              label="Total Risques" value={riskStats.totalRisks || 0} 
              icon={<AlertOctagon className="text-amber-500" />}
            />
            <IndicatorCard 
              label="Actions en cours" value={riskStats.actionsByStatus?.EN_COURS || 0} 
              icon={<Clock className="text-blue-500" />}
            />
          </div>
        )}
      </header>

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

// ✅ COMPOSANTS DE VUE (SÉPARÉS POUR LA CLARTÉ)

function IndicatorCard({ label, value, target, icon, status }: any) {
  const getColors = () => {
    if (status === 'success') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (status === 'warning') return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    if (status === 'critical') return 'bg-red-500/10 border-red-500/20 text-red-400';
    return 'bg-white/5 border-white/10 text-slate-400';
  };
  return (
    <div className={`p-6 rounded-3xl border ${getColors()}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
        {target && <span className="text-[8px] font-black bg-white/10 px-2 py-1 rounded-lg uppercase tracking-widest">Cible: {target}</span>}
      </div>
      <p className="text-[9px] font-black uppercase opacity-60 mb-1">{label}</p>
      <p className="text-4xl font-black tracking-tighter">{value}</p>
    </div>
  );
}

function GridView({ filteredProcessus, onOpenCreate, onOpenEdit, onDelete, onViewActions }: any) {
  return (
    <div className="space-y-16">
      {filteredProcessus.map((proc: any) => (
        <section key={proc.PR_Id}>
          <div className="flex justify-between items-end mb-8 border-l-4 border-red-600 pl-8">
            <div>
              <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.3em]">{proc.PR_Code}</span>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-tight">{proc.PR_Libelle}</h2>
            </div>
            <button onClick={() => onOpenCreate(proc.PR_Id)} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 px-6 py-3 rounded-2xl font-black uppercase text-[10px] transition-all">
              Identifier un risque
            </button>
          </div>

          <div className="bg-slate-900/30 border border-white/5 rounded-[3rem] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest">
                  <th className="p-8">Identification & Danger</th>
                  <th className="p-8 text-center">Matrice (P-G-M)</th>
                  <th className="p-8 text-center">Score</th>
                  <th className="p-8">Statut ISO</th>
                  <th className="p-8">Traitement</th>
                  <th className="p-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 italic">
                {proc.risks?.length > 0 ? proc.risks.map((risk: any) => {
                  const score = risk.RS_Score || (risk.RS_Probabilite * risk.RS_Gravite * (risk.RS_Maitrise || 1));
                  return (
                    <tr key={risk.RS_Id} className="hover:bg-white/2 transition-all">
                      <td className="p-8">
                        <span className="text-[9px] font-black text-blue-500 uppercase block mb-1">{risk.RS_Activite || 'PROCESSUS CLÉ'}</span>
                        <h4 className="text-lg font-black text-white uppercase">{risk.RS_Libelle}</h4>
                        <p className="text-[10px] text-slate-500 mt-2 line-clamp-1">{risk.RS_Description}</p>
                      </td>
                      <td className="p-8 text-center">
                        <div className="flex justify-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-[10px]">{risk.RS_Probabilite}</span>
                          <span className="w-8 h-8 rounded-lg bg-red-900/30 flex items-center justify-center font-black text-[10px] text-red-500">{risk.RS_Gravite}</span>
                          <span className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center font-black text-[10px] text-blue-500">{risk.RS_Maitrise}</span>
                        </div>
                      </td>
                      <td className="p-8 text-center">
                        <span className={`text-3xl font-black ${score >= 20 ? 'text-red-500 animate-pulse' : score >= 12 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {score}
                        </span>
                      </td>
                      <td className="p-8">
                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase">{risk.RS_Status}</span>
                      </td>
                      <td className="p-8">
                        <button onClick={() => onViewActions(risk)} className="text-blue-400 font-black text-[10px] uppercase flex items-center gap-2">
                          <Users size={14} /> {risk.RS_Actions?.length || 0} Actions
                        </button>
                      </td>
                      <td className="p-8">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => onOpenEdit(risk)} className="p-2 hover:text-blue-500 transition-colors"><Edit3 size={16} /></button>
                          <button onClick={() => onDelete(risk.RS_Id)} className="p-2 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={6} className="p-20 text-center text-slate-600 font-black uppercase text-[10px] tracking-widest">Aucun risque identifié pour ce processus</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function DashboardView({ riskStats }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-slate-900/30 border border-white/5 p-10 rounded-[3rem]">
        <h3 className="text-2xl font-black mb-8 flex items-center gap-4"><PieChart className="text-red-600" /> Criticité Globale</h3>
        <div className="space-y-6">
          {['critical', 'high', 'medium', 'low'].map(level => {
            const count = riskStats?.byCriticality?.[level] || 0;
            const pct = riskStats?.totalRisks > 0 ? (count / riskStats.totalRisks) * 100 : 0;
            return (
              <div key={level} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>{level}</span>
                  <span>{count} Risques</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${level === 'critical' ? 'bg-red-500' : level === 'high' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-linear-to-br from-red-900/20 to-transparent border border-red-900/20 p-10 rounded-[3rem]">
        <h3 className="text-2xl font-black mb-8 flex items-center gap-4"><AlertTriangle className="text-amber-500" /> Alertes ISO 9001</h3>
        <div className="space-y-4">
          {riskStats?.recommendations?.map((rec: string, i: number) => (
            <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border-l-4 border-amber-500">
              <CheckCircle size={20} className="text-amber-500 shrink-0" />
              <p className="text-[11px] font-bold italic leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ✅ MODALE FORMULAIRE ISO

function RiskModal({ isOpen, onClose, onSubmit, formData, setFormData, riskTypes, users, processusList, isEditing }: any) {
  const [tab, setTab] = useState('MAIN');
  const score = formData.RS_Probabilite * formData.RS_Gravite * formData.RS_Maitrise;

  return (
    <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-4xl font-black uppercase italic">{isEditing ? 'Édition' : 'Identification'} <span className="text-red-600">Risque</span></h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={32} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10">
          <form onSubmit={onSubmit} className="space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-widest">Processus Impacté</label>
                <select required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-red-600 uppercase font-black text-xs" 
                  value={formData.RS_ProcessusId} onChange={e => setFormData({...formData, RS_ProcessusId: e.target.value})}>
                  <option value="">Sélectionner...</option>
                  {processusList.map((p: any) => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Libelle}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-widest">Type de Menace</label>
                <select required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-red-600 uppercase font-black text-xs"
                  value={formData.RS_TypeId} onChange={e => setFormData({...formData, RS_TypeId: e.target.value})}>
                  {riskTypes.map((t: any) => <option key={t.RT_Id} value={t.RT_Id}>{t.RT_Label}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-widest">Désignation du Risque (§6.1)</label>
              <input required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-red-600 uppercase font-black text-sm italic"
                value={formData.RS_Libelle} onChange={e => setFormData({...formData, RS_Libelle: e.target.value})} placeholder="Ex: Perte de données clients..." />
            </div>

            <div className="grid grid-cols-3 gap-8">
              <MatriceInput label="Probabilité" val={formData.RS_Probabilite} set={(v: any) => setFormData({...formData, RS_Probabilite: v})} color="text-white" />
              <MatriceInput label="Gravité" val={formData.RS_Gravite} set={(v: any) => setFormData({...formData, RS_Gravite: v})} color="text-red-500" />
              <MatriceInput label="Maîtrise" val={formData.RS_Maitrise} set={(v: any) => setFormData({...formData, RS_Maitrise: v})} color="text-blue-500" />
            </div>

            <div className="bg-white/2 rounded-3xl p-8 border border-white/5 flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Score de Criticité Actuel</span>
              <span className={`text-8xl font-black italic tracking-tighter ${score >= 20 ? 'text-red-600' : 'text-amber-500'}`}>{score}</span>
            </div>

            <div className="flex justify-end gap-4 border-t border-white/5 pt-10">
              <button type="button" onClick={onClose} className="px-10 py-4 font-black uppercase text-[10px] text-slate-500">Annuler</button>
              <button type="submit" className="bg-red-600 px-10 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3"><Save size={18} /> Enregistrer Risque</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function MatriceInput({ label, val, set, color }: any) {
  return (
    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center space-y-4">
      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</label>
      <input type="number" min="1" max="4" className={`bg-transparent text-5xl w-full text-center outline-none font-black ${color}`} 
        value={val} onChange={e => set(Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))} />
    </div>
  );
}

function ActionsModal({ risk, onClose, users }: any) {
  return (
    <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 text-left">
      <div className="bg-[#0B0F1A] border border-white/10 rounded-[3rem] w-full max-w-4xl p-10 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Actions de Traitement</h2>
            <p className="text-red-500 font-black text-xs uppercase mt-2 tracking-widest">{risk.RS_Libelle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={32} /></button>
        </div>
        <div className="space-y-4">
          {risk.RS_Actions?.map((a: any) => (
            <div key={a.ACT_Id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex justify-between items-center group hover:border-blue-500/50 transition-all">
              <div>
                <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest">{a.ACT_Type}</span>
                <h4 className="text-lg font-black text-white uppercase mt-1 italic">{a.ACT_Title}</h4>
                <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-bold">
                  <span className="flex items-center gap-2"><Users size={12} /> {a.ACT_Responsable?.U_FirstName}</span>
                  <span className="flex items-center gap-2"><Calendar size={12} /> {a.ACT_Deadline ? new Date(a.ACT_Deadline).toLocaleDateString() : 'Non planifié'}</span>
                </div>
              </div>
              <span className="bg-blue-600/10 text-blue-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-blue-600/20">{a.ACT_Status}</span>
            </div>
          ))}
          {!risk.RS_Actions?.length && <p className="text-center py-20 text-slate-600 font-black uppercase text-[10px] italic">Aucune action planifiée pour traiter ce risque.</p>}
        </div>
      </div>
    </div>
  );
}