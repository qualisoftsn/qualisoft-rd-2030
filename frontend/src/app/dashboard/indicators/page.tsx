/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Loader2, Calendar, Lock, Unlock, History, TrendingUp, 
  AlertCircle, CheckCircle2, X, Save, Send, ChevronLeft, 
  ChevronRight, Filter, BarChart3, Clock, Edit3, ShieldCheck,
  Target, Activity, FileText, RotateCcw, Zap, Eye, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Types stricts basés sur Prisma
type IVStatus = 'BROUILLON' | 'SOUMIS' | 'VALIDE' | 'RENVOYE';
type Frequence = 'MENSUEL' | 'BIMENSUEL' | 'TRIMESTRIEL' | 'SEMESTRIEL' | 'ANNUEL';

interface IndicatorValue {
  IV_Id: string;
  IV_Month: number;
  IV_Year: number;
  IV_Actual: number | null;
  IV_Status: IVStatus;
  IV_Comment: string | null;
  IV_CreatedAt: string;
  IV_UpdatedAt: string;
}

interface Indicator {
  IND_Id: string;
  IND_Code: string;
  IND_Libelle: string;
  IND_Unite: string;
  IND_Cible: number;
  IND_Frequence: Frequence;
  IND_ProcessusId: string;
  currentValue?: IndicatorValue;
  previousValue?: IndicatorValue; // Pour calculer la variation
  history?: IndicatorValue[];
}

interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_PiloteId: string;
  PR_CoPiloteId?: string;
  indicators: Indicator[];
}

interface User {
  U_Id: string;
  U_Email: string;
  U_FirstName?: string;
  U_LastName?: string;
  U_Role: string;
}

export default function PilotageKPIPage() {
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [activeProcess, setActiveProcess] = useState<Processus | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [inputComment, setInputComment] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'saisie' | 'historique'>('saisie');
  const [submitting, setSubmitting] = useState(false);

  // 🔑 Logique Temporelle Stricte (1-10 du mois)
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Détermine la période de saisie active
  const targetPeriod = useMemo(() => {
    let targetMonth = currentMonth;
    let targetYear = currentYear;
    
    // Si on est entre le 1er et 10, on saisit le mois précédent
    if (currentDay <= 10) {
      targetMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      targetYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    }
    
    return {
      month: targetMonth,
      year: targetYear,
      isEditable: currentDay <= 10, // Fenêtre de saisie ouverte
      daysLeft: currentDay <= 10 ? 10 - currentDay : 0
    };
  }, [currentDay, currentMonth, currentYear]);

  const isAdmin = useMemo(() => 
    ['SUPER_ADMIN', 'ADMIN', 'RQ'].includes(user?.U_Role || ''),
  [user]);

  // Vérifie si l'indicateur doit être affiché ce mois-ci selon sa fréquence
  const shouldDisplayThisMonth = useCallback((freq: Frequence, month: number): boolean => {
    switch(freq) {
      case 'MENSUEL': return true;
      case 'BIMENSUEL': return [1,3,5,7,9,11].includes(month);
      case 'TRIMESTRIEL': return [3,6,9,12].includes(month);
      case 'SEMESTRIEL': return [6,12].includes(month);
      case 'ANNUEL': return month === 12;
      default: return true;
    }
  }, []);

  // Permissions de modification
  const canEdit = useCallback((indicator: Indicator, process: Processus): boolean => {
    if (!user) return false;
    
    // RQ et Admin peuvent toujours modifier (même après soumission)
    if (isAdmin) return true;
    
    // Vérifier si pilote ou copilote
    const isPilote = process.PR_PiloteId === user.U_Id;
    const isCoPilote = process.PR_CoPiloteId === user.U_Id;
    
    if (!isPilote && !isCoPilote) return false;
    
    // Vérifier la fenêtre temporelle (1-10 uniquement)
    if (currentDay > 10) return false;
    
    // Vérifier le statut actuel
    const status = indicator.currentValue?.IV_Status || 'BROUILLON';
    return status === 'BROUILLON' || status === 'RENVOYE';
  }, [user, isAdmin, currentDay]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [processRes, userData] = await Promise.all([
        apiClient.get('/indicators/processes-with-values', {
          params: { 
            month: targetPeriod.month, 
            year: targetPeriod.year 
          }
        }),
        Promise.resolve(JSON.parse(localStorage.getItem('user') || '{}'))
      ]);
      
      setProcesses(processRes.data || []);
      setUser(userData);
    } catch (err) {
      toast.error("Erreur liaison noyau indicateurs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [targetPeriod]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenModal = async (indicator: Indicator, process: Processus) => {
    setSelectedIndicator(indicator);
    setActiveProcess(process);
    setInputValue(indicator.currentValue?.IV_Actual?.toString() || '');
    setInputComment(indicator.currentValue?.IV_Comment || '');
    setActiveTab('saisie');
    setIsModalOpen(true);

    // Charger l'historique
    try {
      const historyRes = await apiClient.get(`/indicators/${indicator.IND_Id}/history`);
      setSelectedIndicator(prev => prev ? { ...prev, history: historyRes.data } : null);
    } catch (err) {
      console.error("Erreur chargement historique", err);
    }
  };

  const handleSaveValue = async () => {
    if (!selectedIndicator || !activeProcess) return;
    
    try {
      await apiClient.post('/indicators/save-value', {
        indicatorId: selectedIndicator.IND_Id,
        month: targetPeriod.month,
        year: targetPeriod.year,
        value: parseFloat(inputValue) || 0,
        comment: inputComment
      });
      
      toast.success("Valeur enregistrée");
      fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de sauvegarde");
    }
  };

  const handleSubmitProcess = async (processId: string) => {
    try {
      setSubmitting(true);
      await apiClient.post(`/indicators/submit-process/${processId}`, {
        month: targetPeriod.month,
        year: targetPeriod.year
      });
      
      toast.success("Processus transmis au Responsable Qualité");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de transmission");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status?: IVStatus) => {
    switch(status) {
      case 'VALIDE': 
        return { 
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20', 
          icon: CheckCircle2,
          label: 'Validé' 
        };
      case 'SOUMIS': 
        return { 
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/20', 
          icon: Send,
          label: 'Soumis' 
        };
      case 'RENVOYE': 
        return { 
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/20', 
          icon: RotateCcw,
          label: 'Renvoyé' 
        };
      default: 
        return { 
          color: 'bg-slate-500/20 text-slate-400 border-slate-500/20', 
          icon: Edit3,
          label: 'Brouillon' 
        };
    }
  };

  const getPerformanceColor = (actual?: number | null, target?: number) => {
    if (actual == null) return 'text-slate-600';
    const ratio = actual / (target || 1);
    if (ratio >= 0.95) return 'text-emerald-400';
    if (ratio >= 0.8) return 'text-amber-400';
    return 'text-red-400';
  };

  const filteredProcesses = useMemo(() => {
    if (selectedProcess === 'all') return processes;
    return processes.filter(p => p.PR_Id === selectedProcess);
  }, [processes, selectedProcess]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0B0F1A]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <span className="text-[10px] font-black uppercase text-blue-600 tracking-[0.4em] animate-pulse italic">
          Synchronisation KPI...
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-8 lg:p-12 italic bg-[#0B0F1A] min-h-screen text-white pb-32 text-left font-sans selection:bg-blue-600/30">
      
      {/* Header Principal */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-white/5 pb-10 mb-12 gap-6">
        <div>
          <h1 className="text-6xl lg:text-8xl font-black uppercase italic tracking-tighter leading-none mb-6">
            Pilotage <span className="text-blue-600">KPI</span>
          </h1>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-[2rem] border border-white/5">
              <Calendar size={16} className="text-blue-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">
                Période active : {targetPeriod.month}/{targetPeriod.year}
              </span>
            </div>
            
            {targetPeriod.isEditable ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 px-6 py-3 rounded-[2rem] border border-emerald-500/20 text-emerald-400 animate-pulse">
                <Unlock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Fenêtre de saisie ouverte ({targetPeriod.daysLeft}j restants)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-500/10 px-6 py-3 rounded-[2rem] border border-amber-500/20 text-amber-400">
                <Lock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Saisie verrouillée (Prochaine : 1-10 du mois prochain)
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex items-center gap-2 bg-blue-600/10 px-6 py-3 rounded-[2rem] border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase italic tracking-widest shadow-inner">
              <ShieldCheck size={16}/> Mode Responsable Qualité
            </div>
          )}
          <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <Activity size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <FileText size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Barre de Filtres */}
      <div className="flex flex-wrap gap-4 mb-12 bg-slate-900/40 p-6 rounded-[3rem] border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-blue-500" />
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Filtrer :</span>
        </div>
        
        <select 
          value={selectedProcess}
          onChange={(e) => setSelectedProcess(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-[2rem] px-6 py-3 text-sm font-bold italic text-white focus:border-blue-500 outline-none transition-all hover:border-white/20"
        >
          <option value="all">Tous les processus</option>
          {processes.map(p => (
            <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>
          ))}
        </select>
      </div>

      {/* Grille des Processus */}
      <div className="space-y-16">
        {filteredProcesses.map((process) => {
          // Filtrer les indicateurs actifs pour cette période
          const activeIndicators = process.indicators.filter(ind => 
            shouldDisplayThisMonth(ind.IND_Frequence, targetPeriod.month)
          );

          if (activeIndicators.length === 0) return null;

          // Vérifier si tout est soumis pour afficher le bouton global
          const hasDraft = activeIndicators.some(ind => 
            !ind.currentValue?.IV_Actual || ind.currentValue.IV_Status === 'BROUILLON'
          );
          const allSubmitted = activeIndicators.every(ind => 
            ['SOUMIS', 'VALIDE'].includes(ind.currentValue?.IV_Status || '')
          );

          return (
            <section key={process.PR_Id} className="bg-slate-900/30 border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl shadow-black/50">
              {/* Header du Processus */}
              <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-blue-900/10 via-transparent to-transparent">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-lg shadow-blue-900/50">
                      <BarChart3 size={28} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase italic tracking-tight text-white leading-none">
                        {process.PR_Libelle}
                      </h2>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1 block">
                        {process.PR_Code} • {activeIndicators.length} indicateur{activeIndicators.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Bouton de soumission globale (visible uniquement pour pilote/copilote) */}
                {targetPeriod.isEditable && !isAdmin && (process.PR_PiloteId === user?.U_Id || process.PR_CoPiloteId === user?.U_Id) && (
                  <button
                    onClick={() => handleSubmitProcess(process.PR_Id)}
                    disabled={submitting || !hasDraft}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[2.5rem] font-black uppercase text-[11px] italic tracking-widest transition-all shadow-xl ${
                      hasDraft 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 hover:shadow-blue-900/50' 
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {hasDraft ? 'Transmettre au RQ' : 'Tous transmis'}
                  </button>
                )}
              </div>

              {/* Liste des Indicateurs */}
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-10' 
                : 'flex flex-col divide-y divide-white/5'
              }>
                {activeIndicators.map((indicator) => {
                  const status = indicator.currentValue?.IV_Status || 'BROUILLON';
                  const statusConfig = getStatusConfig(status);
                  const editable = canEdit(indicator, process);
                  const actual = indicator.currentValue?.IV_Actual;
                  const prev = indicator.previousValue?.IV_Actual;
                  const variation = actual && prev ? ((actual - prev) / prev * 100).toFixed(1) : null;
                  const StatusIcon = statusConfig.icon;

                  if (viewMode === 'list') {
                    return (
                      <div key={indicator.IND_Id} className="flex items-center justify-between p-8 hover:bg-white/5 transition-all group">
                        <div className="flex-1 grid grid-cols-12 gap-6 items-center">
                          <div className="col-span-4">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] block mb-2">
                              {indicator.IND_Code}
                            </span>
                            <span className="text-lg font-bold text-white italic block truncate">
                              {indicator.IND_Libelle}
                            </span>
                            <span className="text-[9px] text-slate-500 uppercase mt-2 block font-bold tracking-wider">
                              {indicator.IND_Frequence} • Cible {indicator.IND_Cible} {indicator.IND_Unite}
                            </span>
                          </div>
                          
                          <div className="col-span-2 flex justify-center">
                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border flex items-center gap-2 ${statusConfig.color}`}>
                              <StatusIcon size={12} />
                              {statusConfig.label}
                            </span>
                          </div>
                          
                          <div className="col-span-3 text-center">
                            {actual !== undefined && actual !== null ? (
                              <div className={`text-3xl font-black italic ${getPerformanceColor(actual, indicator.IND_Cible)}`}>
                                {actual}
                                <span className="text-sm text-slate-500 ml-2">{indicator.IND_Unite}</span>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-sm font-bold italic">Non saisi</span>
                            )}
                          </div>
                          
                          <div className="col-span-3 flex justify-end">
                            <button
                              onClick={() => handleOpenModal(indicator, process)}
                              disabled={!editable && !isAdmin}
                              className={`flex items-center gap-2 px-6 py-3 rounded-[2rem] font-black uppercase text-[10px] italic transition-all border ${
                                editable || isAdmin
                                  ? 'bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border-blue-500/30' 
                                  : 'bg-slate-800/50 text-slate-600 border-slate-700 cursor-not-allowed'
                              }`}
                            >
                              {editable || isAdmin ? <Edit3 size={14} /> : <Lock size={14} />}
                              {editable || isAdmin ? 'Saisir' : status === 'SOUMIS' ? 'En attente RQ' : 'Verrouillé'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Mode Grid (Cartes)
                  return (
                    <div key={indicator.IND_Id} className="bg-black/20 border border-white/5 rounded-[3rem] p-8 hover:border-blue-500/30 hover:bg-white/[0.02] transition-all group relative overflow-hidden flex flex-col">
                      {/* Bandeau Status */}
                      <div className="absolute top-0 right-0 p-6">
                        <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase italic tracking-widest border backdrop-blur-md flex items-center gap-2 ${statusConfig.color}`}>
                          <StatusIcon size={12} />
                          {statusConfig.label}
                        </div>
                      </div>

                      {/* Header */}
                      <div className="mb-8 pr-20">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] block mb-3">
                    {indicator.IND_Code}
                    </span>
                    <h3 className="text-2xl font-black uppercase italic text-white leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {indicator.IND_Libelle}
                    </h3>
                  </div>

                  {/* Valeur Actuelle */}
                  <div className="bg-slate-950/50 rounded-[2.5rem] p-8 mb-6 border border-white/5 group-hover:border-white/10 transition-all">
                    <div className="flex justify-between items-end mb-4">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Valeur constatée</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{indicator.IND_Unite}</span>
                    </div>
                    
                    <div className={`text-6xl font-black italic mb-2 ${actual !== undefined && actual !== null ? getPerformanceColor(actual, indicator.IND_Cible) : 'text-slate-700'}`}>
                      {actual !== undefined && actual !== null ? actual : '--'}
                    </div>
                    
                    {variation !== null && (
                      <div className={`flex items-center gap-2 text-[11px] font-bold ${Number(variation) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        <TrendingUp size={14} className={Number(variation) < 0 ? 'rotate-180' : ''} />
                        <span>{Number(variation) > 0 ? '+' : ''}{variation}% vs mois préc.</span>
                      </div>
                    )}
                  </div>

                  {/* Métriques Secondaires */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 rounded-[2rem] p-5 border border-white/5">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Objectif</span>
                      <div className="flex items-center gap-2 text-emerald-400 font-black italic text-lg">
                        <Target size={16} />
                        {indicator.IND_Cible}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-[2rem] p-5 border border-white/5">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Fréquence</span>
                      <div className="flex items-center gap-2 text-slate-300 font-bold text-sm italic">
                        <Clock size={16} className="text-blue-400" />
                        {indicator.IND_Frequence}
                      </div>
                    </div>
                  </div>

                  {/* Bouton Action */}
                  <button
                    onClick={() => handleOpenModal(indicator, process)}
                    disabled={!editable && !isAdmin}
                    className={`w-full py-5 rounded-[2.5rem] font-black uppercase text-[11px] italic tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl mt-auto ${
                      editable || isAdmin
                        ? 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02] hover:shadow-blue-900/50' 
                        : 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    {editable || isAdmin ? (
                      <><Edit3 size={18} /> {actual !== undefined ? 'Modifier' : 'Saisir'}</>
                    ) : (
                      <><Lock size={18} /> {status === 'SOUMIS' ? 'En attente RQ' : 'Verrouillé'}</>
                    )}
                  </button>

                  {/* Commentaire si existant */}
                  {indicator.currentValue?.IV_Comment && (
                    <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                      <p className="text-[10px] text-amber-200/70 italic line-clamp-2">
                        "{indicator.currentValue.IV_Comment}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      );
    })}
  </div>

  {/* Modal de Saisie / Détails */}
  {isModalOpen && selectedIndicator && activeProcess && (
    <div className="fixed inset-0 bg-[#0B0F1A]/98 backdrop-blur-3xl z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden my-8">
        
        {/* Header Modal */}
        <div className="p-10 border-b border-white/10 flex justify-between items-start bg-gradient-to-r from-blue-900/20 to-transparent">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                {selectedIndicator.IND_Code}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {activeProcess.PR_Code}
              </span>
            </div>
            <h2 className="text-4xl font-black uppercase italic text-white leading-tight mb-2">
              {selectedIndicator.IND_Libelle}
            </h2>
            <div className="flex items-center gap-4 mt-4">
              <span className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                <Target size={14} className="text-emerald-400" />
                Cible: {selectedIndicator.IND_Cible} {selectedIndicator.IND_Unite}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                <Clock size={14} className="text-blue-400" />
                {selectedIndicator.IND_Frequence}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="p-4 hover:bg-white/10 rounded-full transition-colors group"
          >
            <X size={24} className="text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-white/5 px-10">
          <button
            onClick={() => setActiveTab('saisie')}
            className={`py-6 px-8 text-[11px] font-black uppercase italic tracking-widest transition-all border-b-2 relative ${
              activeTab === 'saisie' 
                ? 'text-blue-400 border-blue-500' 
                : 'text-slate-500 border-transparent hover:text-white'
            }`}
          >
            Saisie {targetPeriod.month}/{targetPeriod.year}
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`py-6 px-8 text-[11px] font-black uppercase italic tracking-widest transition-all border-b-2 relative ${
              activeTab === 'historique' 
                ? 'text-blue-400 border-blue-500' 
                : 'text-slate-500 border-transparent hover:text-white'
            }`}
          >
            Historique & Analyse
          </button>
        </div>

        {/* Content */}
        <div className="p-10">
          {activeTab === 'saisie' ? (
            <div className="space-y-10 max-w-2xl mx-auto">
              {/* Alert Période */}
              <div className={`p-6 rounded-[2.5rem] border flex items-center gap-4 ${
                targetPeriod.isEditable 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
              }`}>
                {targetPeriod.isEditable ? <Unlock size={24} /> : <Lock size={24} />}
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest block mb-1">
                    {targetPeriod.isEditable ? 'Saisie autorisée' : 'Lecture seule'}
                  </span>
                  <span className="text-sm font-bold italic">
                    {targetPeriod.isEditable 
                      ? `Vous pouvez modifier cette valeur jusqu'au 10/${currentMonth}` 
                      : 'La période de saisie est close. Contactez le RQ pour modification.'
                    }
                  </span>
                </div>
              </div>

              {/* Input Valeur */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 block">
                  Valeur réelle constatée ({selectedIndicator.IND_Unite})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={!canEdit(selectedIndicator, activeProcess) && !isAdmin}
                  className="w-full bg-black/40 border-2 border-white/10 rounded-[3rem] p-10 text-center text-7xl font-black italic outline-none focus:border-blue-600 transition-all text-white placeholder:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="0.00"
                />
                {inputValue && (
                  <div className={`text-center text-sm font-bold italic ${
                    Number(inputValue) >= selectedIndicator.IND_Cible * 0.95 ? 'text-emerald-400' :
                    Number(inputValue) >= selectedIndicator.IND_Cible * 0.8 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {Number(inputValue) >= selectedIndicator.IND_Cible ? '✓ Objectif atteint' : 
                     Number(inputValue) >= selectedIndicator.IND_Cible * 0.8 ? '⚠ Proche de l\'objectif' : 
                     '⚠ Sous-performance'}
                  </div>
                )}
              </div>

              {/* Commentaire */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 block">
                  Commentaire / Justificatif
                </label>
                <textarea
                  value={inputComment}
                  onChange={(e) => setInputComment(e.target.value)}
                  disabled={!canEdit(selectedIndicator, activeProcess) && !isAdmin}
                  rows={4}
                  className="w-full bg-black/40 border-2 border-white/10 rounded-[2.5rem] p-8 text-sm font-bold italic outline-none focus:border-blue-600 transition-all text-white placeholder:text-slate-700 resize-none disabled:opacity-50"
                  placeholder="Expliquez les circonstances de cette performance, actions correctives envisagées..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-6 rounded-[2.5rem] border border-white/10 text-[11px] font-black uppercase italic hover:bg-white/5 transition-all text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                {(canEdit(selectedIndicator, activeProcess) || isAdmin) && (
                  <button
                    onClick={handleSaveValue}
                    disabled={submitting}
                    className="flex-[2] py-6 rounded-[2.5rem] bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-[11px] font-black uppercase italic shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] hover:shadow-blue-900/50"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Enregistrer
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <h3 className="text-2xl font-black uppercase italic text-white mb-8 flex items-center gap-4">
                <History size={28} className="text-blue-500" />
                Historique des 12 derniers mois
              </h3>
              
              <div className="space-y-4">
                {(selectedIndicator.history || []).length === 0 ? (
                  <div className="text-center py-20 text-slate-600 bg-black/20 rounded-[3rem] border border-white/5">
                    <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-bold italic">Aucun historique disponible</p>
                    <p className="text-sm text-slate-500 mt-2">Les données apparaîtront après la première saisie</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {selectedIndicator.history?.map((val) => (
                      <div key={val.IV_Id} className="flex items-center justify-between p-6 bg-black/20 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-slate-800 rounded-[2rem] flex flex-col items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-colors">
                            <span className="text-2xl font-black text-white">{val.IV_Month}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase">{val.IV_Year}</span>
                          </div>
                          <div>
                            <div className={`text-4xl font-black italic ${
                              val.IV_Actual && val.IV_Actual >= selectedIndicator.IND_Cible * 0.95 ? 'text-emerald-400' :
                              val.IV_Actual && val.IV_Actual >= selectedIndicator.IND_Cible * 0.8 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {val.IV_Actual} 
                              <span className="text-lg text-slate-500 ml-2">{selectedIndicator.IND_Unite}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${getStatusConfig(val.IV_Status).color}`}>
                                {getStatusConfig(val.IV_Status).label}
                              </span>
                              {val.IV_Comment && (
                                <span className="text-[10px] text-slate-500 italic max-w-xs truncate">
                                  "{val.IV_Comment}"
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Performance</span>
                          <span className={`text-xl font-black italic ${
                            val.IV_Actual && val.IV_Actual >= selectedIndicator.IND_Cible ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {val.IV_Actual ? ((val.IV_Actual / selectedIndicator.IND_Cible) * 100).toFixed(0) : 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mini Graph Placeholder */}
              {selectedIndicator.history && selectedIndicator.history.length > 1 && (
                <div className="mt-10 p-8 bg-black/20 rounded-[3rem] border border-white/5">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6">Évolution visuelle</h4>
                  <div className="h-40 flex items-end justify-between gap-2 px-4">
                    {selectedIndicator.history.slice(-12).map((val, idx) => {
                      const height = val.IV_Actual ? Math.min((val.IV_Actual / selectedIndicator.IND_Cible) * 100, 100) : 0;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                          <div 
                            className={`w-full rounded-t-xl transition-all duration-500 ${height >= 95 ? 'bg-emerald-500/50' : height >= 80 ? 'bg-amber-500/50' : 'bg-red-500/50'} hover:opacity-80`}
                            style={{ height: `${Math.max(height, 5)}%` }}
                          />
                          <span className="text-[9px] font-black text-slate-600 group-hover:text-white transition-colors">
                            {val.IV_Month}/{val.IV_Year.toString().slice(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</div> 
);
}        