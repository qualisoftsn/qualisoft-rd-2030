/* eslint-disable @typescript-eslint/no-unused-vars */
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

/**
 * 📊 MODULE : PILOTAGE KPI & PERFORMANCE PROCESSUS
 * -------------------------------------------------------------------------
 * Ce module gère le cycle de vie des données de performance (Indicateurs).
 * * FONCTIONNALITÉS CLÉS :
 * 1. 🔑 Fenêtre de saisie stricte : Autorise la saisie du mois M-1 uniquement entre le 1 et le 10 du mois M.
 * 2. 🛡️ Workflow de validation : Brouillon -> Soumis (Pilote) -> Validé/Renvoyé (RQ).
 * 3. 🎯 Monitoring ISO 9001 : Comparaison en temps réel avec les cibles et calcul de variation.
 * 4. 📈 Analyse Historique : Visualisation des 12 derniers mois pour identifier les tendances.
 */

// --- TYPES & INTERFACES (Modèle de données SMI) ---

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
  previousValue?: IndicatorValue; // Utilisé pour le calcul de variation Delta
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
  // --- ÉTATS DU NOYAU ---
  const [processes, setProcesses] = useState<Processus[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // --- ÉTATS DES MODALS & SAISIE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [activeProcess, setActiveProcess] = useState<Processus | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [inputComment, setInputComment] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'saisie' | 'historique'>('saisie');
  const [submitting, setSubmitting] = useState(false);

  // --- 🔑 MOTEUR DE LOGIQUE TEMPORELLE (Février 2026) ---
  // Règle SMI : On saisit les résultats du mois passé durant les 10 premiers jours du mois en cours.
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  /**
   * Calcule dynamiquement la période de reporting cible.
   * Si nous sommes le 5 Février, la cible est Janvier 2026.
   * Si nous sommes le 15 Février, la saisie est verrouillée.
   */
  const targetPeriod = useMemo(() => {
    let targetMonth = currentMonth;
    let targetYear = currentYear;
    
    // Entre le 1er et le 10, on rapporte les chiffres du mois précédent
    if (currentDay <= 10) {
      targetMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      targetYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    }
    
    return {
      month: targetMonth,
      year: targetYear,
      isEditable: currentDay <= 10, // Fenêtre normative ISO
      daysLeft: currentDay <= 10 ? 10 - currentDay : 0
    };
  }, [currentDay, currentMonth, currentYear]);

  // Détermine si l'utilisateur possède des privilèges de validation (RQ / Admin)
  const isAdmin = useMemo(() => 
    ['SUPER_ADMIN', 'ADMIN', 'RQ'].includes(user?.U_Role || ''),
  [user]);

  /**
   * Vérifie si l'indicateur est éligible à un relevé ce mois-ci selon sa fréquence.
   */
  const shouldDisplayThisMonth = useCallback((freq: Frequence, month: number): boolean => {
    switch(freq) {
      case 'MENSUEL': return true;
      case 'BIMENSUEL': return month % 2 !== 0; // Jan, Mar, May, etc.
      case 'TRIMESTRIEL': return [3, 6, 9, 12].includes(month);
      case 'SEMESTRIEL': return [6, 12].includes(month);
      case 'ANNUEL': return month === 12;
      default: return true;
    }
  }, []);

  /**
   * Gestionnaire de permissions fines (RBAC + Time-based)
   * Un utilisateur peut éditer si :
   * - Il est Admin/RQ (toujours)
   * - Il est Pilote et nous sommes entre le 1 et le 10 ET le statut est BROUILLON/RENVOYE.
   */
  const canEdit = useCallback((indicator: Indicator, process: Processus): boolean => {
    if (!user) return false;
    if (isAdmin) return true;
    
    const isOwner = process.PR_PiloteId === user.U_Id || process.PR_CoPiloteId === user.U_Id;
    if (!isOwner) return false;
    if (!targetPeriod.isEditable) return false;
    
    const status = indicator.currentValue?.IV_Status || 'BROUILLON';
    return status === 'BROUILLON' || status === 'RENVOYE';
  }, [user, isAdmin, targetPeriod.isEditable]);

  /**
   * 📡 SYNCHRONISATION DES DONNÉES AVEC LE NOYAU
   */
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
      toast.error("Erreur de liaison avec le noyau indicateurs");
      console.error("KPI_SYNC_ERROR:", err);
    } finally {
      setLoading(false);
    }
  }, [targetPeriod]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * 🛠️ ACTIONS DE SAISIE
   */
  const handleOpenModal = async (indicator: Indicator, process: Processus) => {
    setSelectedIndicator(indicator);
    setActiveProcess(process);
    setInputValue(indicator.currentValue?.IV_Actual?.toString() || '');
    setInputComment(indicator.currentValue?.IV_Comment || '');
    setActiveTab('saisie');
    setIsModalOpen(true);

    // Chargement de la profondeur historique pour analyse de tendance
    try {
      const historyRes = await apiClient.get(`/indicators/${indicator.IND_Id}/history`);
      setSelectedIndicator(prev => prev ? { ...prev, history: historyRes.data } : null);
    } catch (err) {
      console.error("KPI_HISTORY_ERROR:", err);
    }
  };

  const handleSaveValue = async () => {
    if (!selectedIndicator || !activeProcess) return;
    setSubmitting(true);
    
    try {
      await apiClient.post('/indicators/save-value', {
        indicatorId: selectedIndicator.IND_Id,
        month: targetPeriod.month,
        year: targetPeriod.year,
        value: parseFloat(inputValue.replace(',', '.')) || 0,
        comment: inputComment
      });
      
      toast.success("Donnée de performance enregistrée");
      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur de persistance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitProcess = async (processId: string) => {
    try {
      setSubmitting(true);
      await apiClient.post(`/indicators/submit-process/${processId}`, {
        month: targetPeriod.month,
        year: targetPeriod.year
      });
      
      toast.success("Performance soumise pour validation au RQ");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Échec de transmission");
    } finally {
      setSubmitting(false);
    }
  };

  // --- 🎨 HELPERS DE DESIGN (INDUSTRIAL MATRIX) ---

  const getStatusConfig = (status?: IVStatus) => {
    const configs = {
      VALIDE: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20', icon: CheckCircle2, label: 'Validé' },
      SOUMIS: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/20', icon: Send, label: 'Soumis' },
      RENVOYE: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/20', icon: RotateCcw, label: 'Renvoyé' },
      BROUILLON: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/20', icon: Edit3, label: 'Brouillon' }
    };
    return configs[status || 'BROUILLON'];
  };

  const getPerformanceColor = (actual?: number | null, target?: number) => {
    if (actual == null || !target) return 'text-slate-600';
    const ratio = actual / target;
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
          Accès au noyau de performance...
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-8 lg:p-12 italic bg-[#0B0F1A] min-h-screen text-white pb-32 text-left font-sans selection:bg-blue-600/30">
      
      {/* 🔝 HEADER : ÉTAT DE LA FENÊTRE TEMPORELLE */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-white/5 pb-10 mb-12 gap-6">
        <div>
          <h1 className="text-4xl lg:text-38xl font-black uppercase italic tracking-tighter leading-none mb-6">
            Pilotage <span className="text-blue-600">KPI</span>
          </h1>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-4xl border border-white/5 shadow-inner">
              <Calendar size={16} className="text-blue-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300">
                Période Active : {targetPeriod.month}/{targetPeriod.year}
              </span>
            </div>
            
            {targetPeriod.isEditable ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 px-6 py-3 rounded-4xl border border-emerald-500/20 text-emerald-400 animate-pulse">
                <Unlock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  Saisie Ouverte ({targetPeriod.daysLeft}j restants)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-500/10 px-6 py-3 rounded-4xl border border-amber-500/20 text-amber-400 shadow-lg">
                <Lock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  Fenêtre Verrouillée (Prochaine : 1-10 du mois)
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex items-center gap-2 bg-blue-600/10 px-6 py-3 rounded-4xl border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase italic tracking-widest shadow-inner">
              <ShieldCheck size={16}/> Mode Responsable Qualité
            </div>
          )}
          <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5 shadow-2xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-3xl shadow-blue-600/50' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              <Activity size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-3xl shadow-blue-600/50' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              <FileText size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* 🔍 BARRE DE FILTRES STRATÉGIQUES */}
      <div className="flex flex-wrap gap-4 mb-12 bg-slate-900/40 p-6 rounded-[3rem] border border-white/5 backdrop-blur-md shadow-2xl items-center">
        <div className="flex items-center gap-3 ml-4">
          <Filter size={18} className="text-blue-500" />
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest italic">Axe de Processus :</span>
        </div>
        
        <select 
          value={selectedProcess}
          onChange={(e) => setSelectedProcess(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-4xl px-8 py-3 text-xs font-black uppercase italic text-white focus:border-blue-500 outline-none transition-all hover:bg-black/80 appearance-none min-w-70 cursor-pointer"
        >
          <option value="all">Consolidation Globale</option>
          {processes.map(p => (
            <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>
          ))}
        </select>
      </div>

      {/* 🚀 GRILLE DES PROCESSUS ET INDICATEURS */}
      <div className="space-y-16">
        {filteredProcesses.map((process) => {
          const activeIndicators = process.indicators.filter(ind => 
            shouldDisplayThisMonth(ind.IND_Frequence, targetPeriod.month)
          );

          if (activeIndicators.length === 0) return null;

          const hasDraft = activeIndicators.some(ind => 
            !ind.currentValue?.IV_Actual || ind.currentValue.IV_Status === 'BROUILLON' || ind.currentValue.IV_Status === 'RENVOYE'
          );

          return (
            <section key={process.PR_Id} className="bg-slate-900/30 border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl shadow-black animate-in fade-in duration-700">
              
              {/* HEADER DU PROCESSUS */}
              <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-linear-to-r from-blue-900/10 via-transparent to-transparent">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-4xl flex items-center justify-center shadow-3xl shadow-blue-900/50">
                    <BarChart3 size={32} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none mb-2">
                      {process.PR_Libelle}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] leading-none">
                        CODE : {process.PR_Code}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none">
                        KPI : {activeIndicators.length} UNITÉ(S)
                      </span>
                    </div>
                  </div>
                </div>
                
                {targetPeriod.isEditable && !isAdmin && (process.PR_PiloteId === user?.U_Id || process.PR_CoPiloteId === user?.U_Id) && (
                  <button
                    onClick={() => handleSubmitProcess(process.PR_Id)}
                    disabled={submitting || !hasDraft}
                    className={`flex items-center gap-4 px-10 py-5 rounded-[2.5rem] font-black uppercase text-[11px] italic tracking-widest transition-all shadow-3xl border-none cursor-pointer ${
                      hasDraft 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 shadow-blue-900/50' 
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {hasDraft ? 'TRANSMETTRE LA REVUE' : 'PERFORMANCE TRANSMISE'}
                  </button>
                )}
              </div>

              {/* LISTE DES INDICATEURS (GRID OU LIST) */}
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-10' 
                : 'flex flex-col divide-y divide-white/5'
              }>
                {activeIndicators.map((indicator) => {
                  const status = indicator.currentValue?.IV_Status || 'BROUILLON';
                  const statusInfo = getStatusConfig(status);
                  const editable = canEdit(indicator, process);
                  const actual = indicator.currentValue?.IV_Actual;
                  const prev = indicator.previousValue?.IV_Actual;
                  const variation = actual && prev ? ((actual - prev) / prev * 100).toFixed(1) : null;
                  const StatusIcon = statusInfo.icon;

                  if (viewMode === 'list') {
                    return (
                      <div key={indicator.IND_Id} className="flex items-center justify-between p-8 hover:bg-white/2 transition-all group border-none bg-transparent">
                        <div className="flex-1 grid grid-cols-12 gap-8 items-center text-left">
                          <div className="col-span-4">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2">{indicator.IND_Code}</span>
                            <span className="text-xl font-black text-white italic block truncate leading-none uppercase">{indicator.IND_Libelle}</span>
                            <span className="text-[9px] text-slate-500 uppercase mt-2 block font-black tracking-widest italic">CIBLE : {indicator.IND_Cible} {indicator.IND_Unite}</span>
                          </div>
                          
                          <div className="col-span-2 flex justify-center">
                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase italic tracking-widest border flex items-center gap-2 ${statusInfo.color}`}>
                              <StatusIcon size={12} /> {statusInfo.label}
                            </span>
                          </div>
                          
                          <div className="col-span-3 text-center">
                            {actual != null ? (
                              <div className={`text-3xl font-black italic tracking-tighter ${getPerformanceColor(actual, indicator.IND_Cible)}`}>
                                {actual} <span className="text-sm text-slate-600 ml-1">{indicator.IND_Unite}</span>
                              </div>
                            ) : (
                              <span className="text-slate-800 text-sm font-black italic uppercase tracking-widest">Défaut Relevé</span>
                            )}
                          </div>
                          
                          <div className="col-span-3 flex justify-end pr-4">
                            <button
                              onClick={() => handleOpenModal(indicator, process)}
                              disabled={!editable && !isAdmin}
                              className={`flex items-center gap-3 px-8 py-4 rounded-4xl font-black uppercase text-[10px] italic transition-all border shadow-lg cursor-pointer ${
                                editable || isAdmin
                                  ? 'bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border-blue-500/30' 
                                  : 'bg-slate-900/50 text-slate-700 border-white/5 cursor-not-allowed'
                              }`}
                            >
                              {editable || isAdmin ? <Edit3 size={16} /> : <Lock size={16} />}
                              {editable || isAdmin ? 'SAISIR' : 'VERROUILLÉ'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // --- CARD COMPONENT (GRID MODE) ---
                  return (
                    <div key={indicator.IND_Id} className="bg-black/40 border border-white/5 rounded-[3.5rem] p-10 hover:border-blue-500/30 hover:bg-slate-900/50 transition-all group relative flex flex-col shadow-2xl text-left backdrop-blur-sm">
                      <div className="absolute top-0 right-0 p-8">
                        <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase italic tracking-widest border backdrop-blur-md flex items-center gap-2 ${statusInfo.color}`}>
                          <StatusIcon size={12} /> {statusInfo.label}
                        </div>
                      </div>

                      <div className="mb-10 pr-24">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] block mb-4 italic leading-none">{indicator.IND_Code}</span>
                        <h3 className="text-2xl font-black uppercase italic text-white leading-[1.1] line-clamp-2 group-hover:text-blue-400 transition-colors tracking-tighter">
                          {indicator.IND_Libelle}
                        </h3>
                      </div>

                      <div className="bg-slate-950/60 rounded-[3rem] p-8 mb-8 border border-white/5 group-hover:border-blue-500/20 shadow-inner transition-all">
                        <div className="flex justify-between items-end mb-4">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic leading-none">Valeur Relevée</span>
                          <span className="text-[10px] font-black text-slate-700 uppercase italic tracking-widest">{indicator.IND_Unite}</span>
                        </div>
                        
                        <div className={`text-5xl font-black italic tracking-tighter mb-4 leading-none ${actual != null ? getPerformanceColor(actual, indicator.IND_Cible) : 'text-slate-800'}`}>
                          {actual != null ? actual : '--'}
                        </div>
                        
                        {variation !== null && (
                          <div className={`flex items-center gap-2 text-[11px] font-black uppercase italic tracking-widest ${Number(variation) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            <TrendingUp size={16} className={Number(variation) < 0 ? 'rotate-180' : ''} />
                            <span>{Number(variation) > 0 ? '+' : ''}{variation}% DELTA</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-white/2 rounded-3xl p-6 border border-white/5 flex flex-col justify-center">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2 italic">Cible SMI</span>
                          <div className="flex items-center gap-2 text-emerald-500 font-black italic text-xl tracking-tighter leading-none">
                            <Target size={18} /> {indicator.IND_Cible}
                          </div>
                        </div>
                        <div className="bg-white/2 rounded-3xl p-6 border border-white/5 flex flex-col justify-center">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2 italic">Périodicité</span>
                          <div className="flex items-center gap-2 text-blue-400 font-black italic text-xs tracking-widest leading-none">
                            <Clock size={18} /> {indicator.IND_Frequence.slice(0, 4)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenModal(indicator, process)}
                        disabled={!editable && !isAdmin}
                        className={`w-full py-6 rounded-[2.5rem] font-black uppercase text-[11px] italic tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-3xl border-none cursor-pointer mt-auto ${
                          editable || isAdmin
                            ? 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.03] shadow-blue-900/50' 
                            : 'bg-slate-900/80 text-slate-700 cursor-not-allowed grayscale'
                        }`}
                      >
                        {editable || isAdmin ? (
                          <><Edit3 size={18} /> {actual != null ? 'MODIFIER LA VALEUR' : 'SAISIR RÉSULTAT'}</>
                        ) : (
                          <><Lock size={18} /> DOSSIER VERROUILLÉ</>
                        )}
                      </button>

                      {indicator.currentValue?.IV_Comment && (
                        <div className="mt-6 p-5 bg-amber-500/5 border-l-4 border-amber-500/30 rounded-r-2xl animate-in fade-in slide-in-from-top-2">
                          <p className="text-[10px] text-amber-200/60 italic font-bold leading-relaxed line-clamp-3">
                            &quot;{indicator.currentValue.IV_Comment}&quot;
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

      {/* 🛠️ MODAL DE RÉDACTION / ANALYSE DÉTAILLÉE */}
      {isModalOpen && selectedIndicator && activeProcess && (
        <div className="fixed inset-0 bg-[#0B0F1A]/98 backdrop-blur-3xl z-50 flex items-center justify-center p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 w-full max-w-5xl rounded-[4.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden my-auto relative">
            
            <div className="p-12 border-b border-white/10 flex justify-between items-start bg-linear-to-r from-blue-900/20 via-transparent to-transparent">
              <div className="text-left">
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-5 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] italic shadow-lg">
                    {selectedIndicator.IND_Code}
                  </span>
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">
                    AXE : {activeProcess.PR_Libelle}
                  </span>
                </div>
                <h2 className="text-5xl font-black uppercase italic text-white leading-none tracking-tighter mb-4">
                  {selectedIndicator.IND_Libelle}
                </h2>
                <div className="flex items-center gap-6 mt-6">
                  <span className="flex items-center gap-3 text-xs font-black uppercase italic text-emerald-400 tracking-widest">
                    <Target size={18} /> Cible : {selectedIndicator.IND_Cible} {selectedIndicator.IND_Unite}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  <span className="flex items-center gap-3 text-xs font-black uppercase italic text-blue-400 tracking-widest">
                    <Clock size={18} /> RELEVÉ {selectedIndicator.IND_Frequence}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-5 hover:bg-red-600/10 hover:text-red-500 rounded-full transition-all border-none bg-transparent cursor-pointer text-slate-500"
              >
                <X size={32} />
              </button>
            </div>

            <div className="flex border-b border-white/5 px-12 bg-black/20">
              {['saisie', 'historique'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-8 px-10 text-[11px] font-black uppercase italic tracking-[0.4em] transition-all border-b-2 bg-transparent cursor-pointer ${
                    activeTab === tab ? 'text-blue-400 border-blue-500' : 'text-slate-600 border-transparent hover:text-slate-300'
                  }`}
                >
                  {tab === 'saisie' ? `Saisie ${targetPeriod.month}/${targetPeriod.year}` : 'Analyse & Historique'}
                </button>
              ))}
            </div>

            <div className="p-12">
              {activeTab === 'saisie' ? (
                <div className="space-y-12 max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
                  
                  <div className={`p-8 rounded-[3rem] border flex items-center gap-6 shadow-inner ${
                    targetPeriod.isEditable ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                  }`}>
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-lg">
                      {targetPeriod.isEditable ? <Unlock size={28} /> : <Lock size={28} />}
                    </div>
                    <div className="text-left">
                      <span className="text-[12px] font-black uppercase tracking-[0.3em] block mb-1">
                        {targetPeriod.isEditable ? 'Statut : Accès Autorisé' : 'Statut : Consultation Seule'}
                      </span>
                      <span className="text-sm font-bold italic opacity-70">
                        {targetPeriod.isEditable 
                          ? `Données modifiables jusqu'au 10 du mois. Veillez à la précision des sources.` 
                          : 'La période normative de saisie est échue. Toute modification requiert l\'aval du RQ.'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6 text-left">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-8 block leading-none">Valeur Constatée ({selectedIndicator.IND_Unite})</label>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={!canEdit(selectedIndicator, activeProcess) && !isAdmin}
                      className="w-full bg-black/60 border-2 border-white/5 rounded-[3.5rem] p-12 text-center text-6xl font-black italic outline-none focus:border-blue-600 transition-all text-white placeholder:text-slate-900 shadow-2xl disabled:opacity-30 appearance-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-6 text-left">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-8 block leading-none">Commentaire d&apos;Analyse & Justification</label>
                    <textarea
                      value={inputComment}
                      onChange={(e) => setInputComment(e.target.value)}
                      disabled={!canEdit(selectedIndicator, activeProcess) && !isAdmin}
                      rows={5}
                      className="w-full bg-black/60 border-2 border-white/5 rounded-[3rem] p-10 text-base font-black italic outline-none focus:border-blue-600 transition-all text-white placeholder:text-slate-800 resize-none shadow-2xl disabled:opacity-30 uppercase leading-relaxed"
                      placeholder="DÉTAILLEZ ICI LES CAUSES DE LA PERFORMANCE ET LES ACTIONS CORRECTIVES SI NÉCESSAIRE..."
                    />
                  </div>

                  <div className="flex gap-6 pt-6">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-7 rounded-[2.5rem] border border-white/10 text-[11px] font-black uppercase italic tracking-widest hover:bg-white/5 transition-all text-slate-500 bg-transparent cursor-pointer"
                    >
                      Annuler la saisie
                    </button>
                    {(canEdit(selectedIndicator, activeProcess) || isAdmin) && (
                      <button
                        onClick={handleSaveValue}
                        disabled={submitting}
                        className="flex-2 py-7 rounded-[2.5rem] bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-[12px] font-black uppercase italic tracking-widest shadow-3xl shadow-blue-900/50 flex items-center justify-center gap-4 transition-all hover:scale-105 border-none cursor-pointer"
                      >
                        {submitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        SCELLER LE RÉSULTAT KPI
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-12 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center text-left">
                    <h3 className="text-3xl font-black uppercase italic text-white flex items-center gap-6 tracking-tighter leading-none">
                      <History size={40} className="text-blue-500" />
                      Chronologie de Performance
                    </h3>
                    <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                      12 DERNIERS MOIS INDEXÉS
                    </div>
                  </div>
                  
                  <div className="grid gap-6">
                    {(!selectedIndicator.history || selectedIndicator.history.length === 0) ? (
                      <div className="py-24 bg-black/40 rounded-[4rem] border border-dashed border-white/10 text-center">
                        <AlertCircle size={64} className="mx-auto mb-6 text-slate-800" />
                        <p className="text-xl font-black uppercase italic text-slate-700 tracking-[0.4em]">Défaut d&apos;Antériorité Documentaire</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedIndicator.history.map((val) => (
                          <div key={val.IV_Id} className="flex items-center justify-between p-8 bg-black/30 rounded-[3rem] border border-white/5 hover:border-blue-500/20 transition-all group shadow-xl text-left">
                            <div className="flex items-center gap-10">
                              <div className="w-24 h-24 bg-slate-900 rounded-4xl flex flex-col items-center justify-center border border-white/10 shadow-inner group-hover:border-blue-600/30 transition-colors">
                                <span className="text-3xl font-black text-white italic leading-none mb-1">{val.IV_Month.toString().padStart(2, '0')}</span>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">{val.IV_Year}</span>
                              </div>
                              <div className="text-left">
                                <div className={`text-5xl font-black italic tracking-tighter leading-none mb-4 ${
                                  val.IV_Actual != null && val.IV_Actual >= selectedIndicator.IND_Cible * 0.95 ? 'text-emerald-400' :
                                  val.IV_Actual != null && val.IV_Actual >= selectedIndicator.IND_Cible * 0.8 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                  {val.IV_Actual} <span className="text-xl text-slate-700 ml-1">{selectedIndicator.IND_Unite}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase italic tracking-widest border ${getStatusConfig(val.IV_Status).color}`}>
                                    {getStatusConfig(val.IV_Status).label}
                                  </span>
                                  {val.IV_Comment && <span className="text-[10px] text-slate-600 italic font-bold uppercase truncate max-w-md">&quot;{val.IV_Comment}&quot;</span>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right pr-6">
                              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block mb-2 italic">Efficacité</span>
                              <span className={`text-4xl font-black italic leading-none ${
                                val.IV_Actual && val.IV_Actual >= selectedIndicator.IND_Cible ? 'text-emerald-500 shadow-emerald-500/20' : 'text-amber-500'
                              }`}>
                                {val.IV_Actual ? ((val.IV_Actual / selectedIndicator.IND_Cible) * 100).toFixed(0) : 0}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 📊 MINI GRAPHIQUE D'ANALYSE (CSS-BASED) */}
                  {selectedIndicator.history && selectedIndicator.history.length > 1 && (
                    <div className="mt-12 p-12 bg-black/40 rounded-[4.5rem] border border-white/5 shadow-inner">
                      <h4 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] mb-12 italic text-left">Visualisation de la Tendance Annuelle</h4>
                      <div className="h-48 flex items-end justify-between gap-4 px-6 relative">
                        {/* Ligne de cible */}
                        <div className="absolute left-0 right-0 h-0.5 bg-emerald-500/20 border-t border-dashed border-emerald-500/40 z-0 bottom-[95%] pointer-events-none" />
                        
                        {selectedIndicator.history.slice(-12).reverse().map((val, idx) => {
                          const height = val.IV_Actual ? Math.min((val.IV_Actual / selectedIndicator.IND_Cible) * 100, 110) : 0;
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-4 group cursor-pointer z-10">
                              <div className="opacity-0 group-hover:opacity-100 transition-all bg-white text-black px-2 py-1 rounded text-[9px] font-black mb-1">{val.IV_Actual}</div>
                              <div 
                                className={`w-full rounded-t-2xl transition-all duration-700 shadow-lg ${
                                  height >= 95 ? 'bg-emerald-500/40' : height >= 80 ? 'bg-amber-500/40' : 'bg-red-500/40'
                                } group-hover:bg-blue-600 group-hover:scale-x-110`}
                                style={{ height: `${Math.max(height, 8)}%` }}
                              />
                              <span className="text-[10px] font-black text-slate-600 group-hover:text-white transition-colors uppercase italic">
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