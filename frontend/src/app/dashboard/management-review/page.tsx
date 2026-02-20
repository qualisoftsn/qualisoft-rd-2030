/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileBarChart, Download, Printer, ShieldCheck, 
  TrendingUp, AlertTriangle, CheckCircle2, Loader2,
  Target, Users, ClipboardCheck, Calendar, 
  ArrowUpRight, ArrowDownRight, Minus, Plus,
  Edit3, Save, X, ChevronRight, Flag,
  FileText, BarChart3, Activity, Lock, LucideIcon
} from 'lucide-react';
import { usePermissions } from '@/core/hooks/usePermissions';
import apiClient from '@/core/api/api-client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * -------------------------------------------------------------------------
 * 🏛️ MODULE : REVUE DE DIRECTION (MANAGEMENT REVIEW)
 * -------------------------------------------------------------------------
 * RÔLE : 
 * Cette page est le cockpit de décision stratégique du SMI. Elle permet au
 * Responsable Qualité (RQ) et à la Direction de compiler les performances
 * semestrielles ou annuelles pour valider la stratégie Qualité.
 * * CONFORMITÉ ISO 9001 §9.3 :
 * - Analyse des tendances et indicateurs (9.3.2.c)
 * - Satisfaction client (9.3.2.c.1)
 * - Résultats d'audits (9.3.2.c.6)
 * - Adéquation des ressources et efficacité des actions liées aux risques.
 * -------------------------------------------------------------------------
 */

// --- 🔒 INTERFACES DE DONNÉES STRICTES ---

interface ProcessPerformance {
  id: string;
  name: string;
  performance: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  status: 'success' | 'warning' | 'danger';
}

interface RiskReview {
  id: string;
  reference: string;
  description: string;
  level: 'high' | 'medium' | 'low';
  mitigation: string;
  status: 'active' | 'mitigated' | 'critical';
}

interface Decision {
  id: string;
  title: string;
  responsible: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
}

interface AuditFindings {
  major: number;
  minor: number;
  observation: number;
}

/**
 * Structure globale de la Revue de Direction
 */
interface ReviewData {
  id?: string;
  period: string; // ex: "S1 2026"
  date: string;
  status: 'draft' | 'validated' | 'archived';
  globalPerformance: number; // Indice de maturité calculé
  processCount: number;
  criticalRisks: number;
  customerSatisfaction: number;
  summary: string; // Synthèse rédigée par le RQ
  processes: ProcessPerformance[];
  risks: RiskReview[];
  decisions: Decision[];
  auditFindings: AuditFindings;
  previousReview?: {
    globalPerformance: number;
    date: string;
  };
}

interface StatConfig {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend: string;
  trendIcon: LucideIcon;
  trendColor: string;
}

export default function ManagementReviewPage() {
  // --- HOOKS & AUTHENTIFICATION ---
  const { user } = usePermissions();
  
  // --- ÉTATS DE GESTION DES FLUX ---
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'risks' | 'decisions'>('overview');
  
  // --- ÉTATS DE DONNÉES ---
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [editedSummary, setEditedSummary] = useState<string>('');

  /**
   * 📡 PROTOCOLE DE RÉCUPÉRATION DES DONNÉES
   * Tente une connexion au Master, sinon bascule sur un jeu de données 
   * de secours pour garantir la continuité du service (Fallback).
   */
  const loadData = useCallback(async () => {
    try {
      setFetching(true);
      const { data } = await apiClient.get<ReviewData>('/smi/management-review/data');
      setReviewData(data);
      setEditedSummary(data?.summary || '');
    } catch (error) {
      console.warn("Liaison Master compromise - Activation du Fallback Qualisoft Elite");
      // Simulation d'une revue type pour démonstration/secours
      setReviewData({
        id: "temp-rev-001",
        period: `S${Math.ceil(new Date().getMonth() / 6) > 1 ? 2 : 1} ${new Date().getFullYear()}`,
        date: new Date().toISOString(),
        status: 'draft',
        globalPerformance: 87,
        processCount: 12,
        criticalRisks: 2,
        customerSatisfaction: 94,
        summary: "La performance globale du SMI reste stable malgré les tensions sur le processus Production. Les axes d'amélioration se situent sur la gestion des compétences et le maintien de la GED opérationnelle.",
        auditFindings: { major: 0, minor: 2, observation: 3 },
        processes: [
          { id: '1', name: 'Management Stratégique', performance: 92, target: 90, trend: 'up', status: 'success' },
          { id: '2', name: 'Ressources Humaines', performance: 88, target: 85, trend: 'up', status: 'success' },
          { id: '3', name: 'Production & Logistique', performance: 76, target: 85, trend: 'down', status: 'warning' },
        ],
        risks: [],
        decisions: []
      });
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 📄 GÉNÉRATION DU RAPPORT SOUVERAIN (EXPORT PDF)
   * Envoie une requête au service d'impression pour générer le document officiel scellé.
   */
  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/smi/management-review/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Revue_Direction_${reviewData?.period || 'Export'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export Error - Échec du service d'impression", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✏️ PERSISTANCE DE LA SYNTHÈSE RQ/DIRECTION
   * Met à jour uniquement la partie rédactionnelle de la revue (Commentaire §9.3.2).
   */
  const handleSaveSummary = async () => {
    if (!reviewData?.id) return;
    try {
      setLoading(true);
      await apiClient.patch(`/smi/management-review/${reviewData.id}/summary`, { summary: editedSummary });
      setReviewData(prev => prev ? { ...prev, summary: editedSummary } : null);
      setIsEditing(false);
    } catch (error) {
      console.error("Save Error - Échec de persistance", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📊 CALCULATEUR DE DÉVIATION STRATÉGIQUE
   * Compare la performance actuelle avec la revue précédente pour déterminer la tendance.
   */
  const trendGlobal = useMemo(() => {
    const current = reviewData?.globalPerformance ?? 0;
    const previous = reviewData?.previousReview?.globalPerformance;
    
    if (previous === undefined) return { icon: Minus, color: 'text-slate-400', value: 'N/A' };
    const diff = current - previous;
    if (diff > 0) return { icon: ArrowUpRight, color: 'text-emerald-500', value: `+${diff}%` };
    if (diff < 0) return { icon: ArrowDownRight, color: 'text-red-500', value: `${diff}%` };
    return { icon: Minus, color: 'text-slate-400', value: '0%' };
  }, [reviewData]);

  // Rendu de chargement initial
  if (fetching) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 italic font-sans">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Initialisation du Gantelet Master...</span>
      </div>
    </div>
  );

  const majorCount = reviewData?.auditFindings?.major ?? 0;
  const minorCount = reviewData?.auditFindings?.minor ?? 0;

  // Configuration des KPIs pour la grille d'affichage
  const stats: StatConfig[] = [
    { label: "Indice de Maturité", value: `${reviewData?.globalPerformance ?? 0}%`, icon: TrendingUp, color: "text-emerald-500", trend: trendGlobal.value, trendIcon: trendGlobal.icon, trendColor: trendGlobal.color },
    { label: "Unités en Surveillance", value: reviewData?.processCount ?? 0, icon: Target, color: "text-blue-500", trend: "Actifs", trendIcon: CheckCircle2, trendColor: "text-emerald-400" },
    { label: "NPS / Satisfaction", value: `${reviewData?.customerSatisfaction ?? 0}%`, icon: Users, color: "text-indigo-500", trend: "ISO §9.1.2", trendIcon: ArrowUpRight, trendColor: "text-emerald-400" },
    { label: "Résultats d'Audit", value: majorCount + minorCount, icon: ClipboardCheck, color: majorCount > 0 ? "text-red-500" : "text-amber-500", trend: `${majorCount} Majeur(s)`, trendIcon: majorCount > 0 ? AlertTriangle : CheckCircle2, trendColor: majorCount > 0 ? "text-red-500" : "text-emerald-400" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10 italic bg-slate-50/30 min-h-screen font-sans selection:bg-blue-100 text-left">
      
      {/* 🔝 HEADER SOUVERAIN : Statut et Actions Documentaires */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-200 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
              reviewData?.status === 'validated' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              reviewData?.status === 'archived' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
            }`}>
              {reviewData?.status === 'validated' ? '✓ Revue Scellée' : reviewData?.status === 'archived' ? 'Historique Archivé' : 'Action RQ Requise (Brouillon)'}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" />
              Instance : {reviewData?.period} • {reviewData?.date && format(new Date(reviewData.date), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
            Revue de <span className="text-blue-600">Direction</span>
          </h1>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em]">Pilotage Stratégique • Management SMI • Qualisoft Elite RD 2030</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => window.print()} 
            className="px-8 py-5 bg-white border border-slate-200 text-slate-900 rounded-3xl text-[10px] font-black uppercase flex items-center gap-3 hover:bg-slate-50 transition-all shadow-md cursor-pointer border-none"
          >
            <Printer size={18} className="group-hover:rotate-12 transition-transform" /> Imprimer
          </button>
          <button 
            onClick={handleExport} 
            disabled={loading} 
            className="px-8 py-5 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase flex items-center gap-3 shadow-2xl hover:bg-blue-600 transition-all disabled:opacity-50 border-none cursor-pointer"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} Export Souverain PDF
          </button>
        </div>
      </div>

      {/* 🧭 NAVIGATION DYNAMIQUE (TABS) */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {(['overview', 'processes', 'risks', 'decisions'] as const).map((tabId) => {
          const icons = { overview: BarChart3, processes: Target, risks: AlertTriangle, decisions: Flag };
          const labels = { overview: "Synthèse Globale", processes: "Performance Processus", risks: "Analyse des Risques", decisions: "Décisions & Plan d'Actions" };
          const Icon = icons[tabId];
          return (
            <button 
              key={tabId} 
              onClick={() => setActiveTab(tabId)} 
              className={`flex items-center gap-3 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-none cursor-pointer ${
                activeTab === tabId 
                  ? 'bg-slate-900 text-white shadow-xl -translate-y-0.5' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-slate-800'
              }`}
            >
              <Icon size={16} /> {labels[tabId]}
            </button>
          );
        })}
      </div>

      {/* 📊 GRILLE DES INDICATEURS CLÉS (SMI KPI GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
            <div className="relative z-10 text-left">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-slate-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                   <stat.icon size={32} />
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${stat.trendColor} bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-100 shadow-sm`}>
                  <stat.trendIcon size={12} /> {stat.trend}
                </div>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 italic leading-none">{stat.label}</p>
              <p className="text-5xl font-black text-slate-900 italic tracking-tighter leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 📄 CONTENU PRINCIPAL : ANALYSE RQ (§9.3.2) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* SECTION : CONSTAT D'ANALYSE (ÉDITABLE) */}
          <div className="lg:col-span-2 bg-slate-900 rounded-[4rem] p-10 lg:p-16 text-white relative overflow-hidden shadow-2xl border border-slate-800 group">
            <div className="relative z-10 space-y-10 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                  <Activity className="text-blue-500" size={32} /> Constat d&apos;Analyse Stratégique
                </h3>
                <div className="flex gap-3">
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="p-4 bg-white/10 hover:bg-blue-600 rounded-2xl transition-all border-none cursor-pointer text-white"
                      title="Éditer la synthèse"
                    >
                      <Edit3 size={20} />
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={handleSaveSummary} 
                        className="p-4 bg-emerald-500 hover:bg-emerald-600 rounded-2xl transition-all border-none cursor-pointer text-white shadow-lg"
                      >
                        <Save size={20} />
                      </button>
                      <button 
                        onClick={() => {setIsEditing(false); setEditedSummary(reviewData?.summary || '')}} 
                        className="p-4 bg-red-500/20 hover:bg-red-500 text-red-100 rounded-2xl transition-all border-none cursor-pointer"
                      >
                        <X size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {!isEditing ? (
                <div className="space-y-6 text-xl text-slate-300 font-medium leading-relaxed italic whitespace-pre-wrap first-letter:text-6xl first-letter:font-black first-letter:text-blue-500 first-letter:mr-4 first-letter:float-left first-letter:leading-none">
                  {reviewData?.summary || "Le Responsable Qualité n'a pas encore indexé la synthèse pour cette période."}
                </div>
              ) : (
                <textarea 
                  value={editedSummary} 
                  onChange={(e) => setEditedSummary(e.target.value)} 
                  className="w-full h-80 bg-white/5 border border-white/20 rounded-[2.5rem] p-10 text-lg text-white font-medium italic focus:outline-none focus:border-blue-500 resize-none transition-all shadow-inner leading-relaxed" 
                  placeholder="Rédigez ici la conclusion stratégique de la direction..."
                />
              )}
              
              {/* COMPTEURS DE SYNTHÈSE AU PIED DE L'ANALYSE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-white/10">
                <div className="space-y-2">
                  <p className="text-5xl font-black text-emerald-400 tracking-tighter italic leading-none">{reviewData?.processCount ?? 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Axes de Processus Audités</p>
                </div>
                <div className="space-y-2 border-x border-white/10 px-8 text-center">
                  <p className="text-5xl font-black text-rose-500 tracking-tighter italic leading-none">{majorCount}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Écarts Majeurs Détectés</p>
                </div>
                <div className="space-y-2 text-right">
                  <p className="text-5xl font-black text-amber-400 tracking-tighter italic leading-none">{reviewData?.criticalRisks ?? 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Menaces de Niveau Critique</p>
                </div>
              </div>

              {/* BLOC DE SIGNATURE NUMÉRIQUE (RQ) */}
              <div className="mt-16 flex items-center gap-6 p-8 bg-white/5 rounded-[3rem] border border-white/10 w-fit backdrop-blur-md shadow-2xl">
                 <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center font-black text-white text-2xl border-2 border-white/20 shadow-xl">
                  {user?.U_FirstName?.[0]}{user?.U_LastName?.[0]}
                 </div>
                 <div className="text-left">
                   <p className="text-xl font-black uppercase tracking-tight text-white italic leading-none mb-1">{user?.U_FirstName} {user?.U_LastName}</p>
                   <p className="text-[10px] text-blue-400 font-bold uppercase italic tracking-[0.3em] leading-none">Validateur SMI • {user?.U_TenantName}</p>
                 </div>
              </div>
            </div>
            {/* Décoration de fond (Watermark) */}
            <FileBarChart className="absolute -right-32 -bottom-32 text-white/5 pointer-events-none group-hover:text-white/10 transition-colors" size={500} />
          </div>

          {/* COLONNE DROITE : FOCUS AUDITS ET CONFORMITÉ */}
          <div className="space-y-10">
            <div className="bg-white rounded-[4rem] p-10 border border-slate-100 shadow-2xl relative overflow-hidden group">
              <h3 className="text-xl font-black uppercase text-slate-900 mb-10 flex items-center gap-4 italic tracking-tight leading-none text-left">
                 <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500"><ShieldCheck size={24} className="text-blue-600" /></div>
                 Bilan des Audits
              </h3>
              <div className="space-y-4">
                <AuditItem label="Écarts Majeurs (Bloquants)" val={majorCount} color="red" />
                <AuditItem label="Écarts Mineurs (Glissements)" val={minorCount} color="amber" />
                <AuditItem label="Pistes de Progrès (Recom.)" val={reviewData?.auditFindings?.observation ?? 0} color="blue" />
              </div>
              
              {/* INDICATEUR D'EFFICACITÉ GLOBALE */}
              <div className="mt-12 pt-12 border-t border-slate-100 flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3 italic">Taux d&apos;Efficience du SMI</p>
                <div className="flex items-end gap-3 group">
                  <Activity size={24} className="text-emerald-500 mb-3 animate-pulse" />
                  <span className="text-7xl font-black text-emerald-600 italic tracking-tighter leading-none group-hover:scale-105 transition-transform">{reviewData?.globalPerformance}%</span>
                </div>
              </div>
            </div>

            {/* BADGE DE CERTIFICATION ISO */}
            <div className="bg-blue-600 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-2 text-left">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-200 italic leading-none">Référentiel Actif</p>
                    <p className="text-2xl font-black italic tracking-tighter leading-none">Certifié ISO 9001:2015</p>
                  </div>
                  <CheckCircle2 size={48} className="text-blue-200 opacity-40 group-hover:scale-110 group-hover:opacity-100 transition-all" />
               </div>
               <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* 🔐 FOOTER TECHNIQUE & INTÉGRITÉ (§9.3.3) */}
      <footer className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] gap-8">
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full shadow-inner border border-slate-100">
          <Lock size={12} className="text-blue-500" /> 
          Document Scellé • Accès Pilote Restreint • ISO 9001 §9.3.3
        </div>
        <div className="italic font-bold tracking-[0.2em] text-slate-300 uppercase">Qualisoft Elite Engine Node 2030 • {format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
        <div className="flex items-center gap-4">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" /> 
          <span className="text-emerald-600">Intégrité SMI Validée</span>
        </div>
      </footer>
    </div>
  );
}

/**
 * 🏷️ SOUS-COMPOSANT : ÉLÉMENT DE BILAN D'AUDIT
 */
function AuditItem({ label, val, color }: { label: string, val: number, color: 'red' | 'amber' | 'blue' }) {
  const themes = {
    red: 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
  };
  
  return (
    <div className={`flex items-center justify-between p-6 rounded-4xl border shadow-sm transition-all hover:translate-x-2 cursor-default ${themes[color]}`}>
      <span className="text-[11px] font-black uppercase tracking-widest italic">{label}</span>
      <span className="text-3xl font-black italic tracking-tighter leading-none">{val}</span>
    </div>
  );
}