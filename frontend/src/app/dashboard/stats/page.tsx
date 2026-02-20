/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🧠 MODULE : INTELLIGENCE STATISTIQUE & ANALYTIQUE SOUVERAINE
 * -------------------------------------------------------------------------
 * RÔLE : Centre de commandement décisionnel de l'instance.
 * FONCTION : Agrégation multi-normes, matrice des risques et prédiction IA.
 * CONFORMITÉ : ISO 9001, 14001, 45001 (§9.1 Monitoring & Mesure).
 */

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, ShieldCheck, AlertTriangle, Users, 
  Target, Zap, BarChart3, PieChart, RefreshCcw, 
  ArrowUpRight, ArrowDownRight, Activity, Calendar,
  Download, Filter, Brain, AlertOctagon, CheckCircle2,
  Clock, FileText, ChevronDown, MoreHorizontal
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart as RePieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/core/api/api-client';
import { toast } from 'sonner';

// --- INTERFACES ANALYTIQUES SCELLÉES ---
interface KPIData {
  label: string;
  value: number;
  unit: string;
  trend: number; 
  target: number;
  history: { month: string; value: number }[];
}

interface RiskPoint {
  id: string;
  name: string;
  probability: number; // Axe X
  impact: number;      // Axe Y
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ProcessCompliance {
  process: string;
  compliance: number;
  audits: number;
  nc: number;
}

// --- CONFIGURATION CHROMATIQUE ELITE (NEON-SOVEREIGN) ---
const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  grid: 'rgba(255, 255, 255, 0.05)'
};

// --- DATA MOCK (STRUCTURE ALIGNÉE API) ---
const MOCK_KPIS: KPIData[] = [
  { 
    label: 'Conformité SMI', value: 94.2, unit: '%', trend: 2.1, target: 95,
    history: [{ month: 'Jan', value: 89 }, { month: 'Fév', value: 91 }, { month: 'Mar', value: 92 }, { month: 'Avr', value: 94.2 }]
  },
  { 
    label: 'Couverture GPEC', value: 78.5, unit: '%', trend: 5.4, target: 80,
    history: [{ month: 'Jan', value: 65 }, { month: 'Fév', value: 70 }, { month: 'Mar', value: 75 }, { month: 'Avr', value: 78.5 }]
  },
  { 
    label: 'Résolution NC', value: 12, unit: 'j', trend: -15, target: 10,
    history: [{ month: 'Jan', value: 18 }, { month: 'Fév', value: 16 }, { month: 'Mar', value: 14 }, { month: 'Avr', value: 12 }]
  },
  { 
    label: 'Efficacité SMI', value: 88, unit: '%', trend: -1.2, target: 90,
    history: [{ month: 'Jan', value: 85 }, { month: 'Fév', value: 89 }, { month: 'Mar', value: 90 }, { month: 'Avr', value: 88 }]
  }
];

const RISK_DATA: RiskPoint[] = [
  { id: 'R-001', name: 'Obsolescence Normative', probability: 70, impact: 85, severity: 'critical' },
  { id: 'R-002', name: 'Rupture Audit Externe', probability: 40, impact: 60, severity: 'medium' },
  { id: 'R-003', name: 'Fuite Données Sensibles', probability: 20, impact: 90, severity: 'high' },
  { id: 'R-004', name: 'Indisponibilité Cloud', probability: 15, impact: 75, severity: 'medium' },
  { id: 'R-005', name: 'Retard Action Corrective', probability: 60, impact: 30, severity: 'low' },
];

const PROCESS_DATA: ProcessCompliance[] = [
  { process: 'Pilotage SMI', compliance: 98, audits: 4, nc: 0 },
  { process: 'Ressources Humaines', compliance: 92, audits: 6, nc: 2 },
  { process: 'Relation Client', compliance: 85, audits: 3, nc: 4 },
  { process: 'Infrastructures', compliance: 96, audits: 8, nc: 1 },
  { process: 'Support Technique', compliance: 78, audits: 2, nc: 5 },
];

export default function StatsIntelligencePage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  
  /**
   * 📡 CYCLE DE SYNCHRONISATION
   * Simule l'appel au moteur Qualisoft-Neural pour charger les calculs asynchrones.
   */
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [period]);

  /**
   * 🧠 LOGIQUE DÉCISIONNELLE
   * Calcul du score de maturité global selon la pondération des KPIs.
   */
  const globalScore = useMemo(() => {
    return Math.round(MOCK_KPIS.reduce((acc, kpi) => acc + (kpi.value / kpi.target * 100), 0) / MOCK_KPIS.length);
  }, []);

  const criticalRisksCount = useMemo(() => RISK_DATA.filter(r => r.severity === 'critical').length, []);
  
  const handleExport = (format: 'pdf' | 'excel') => {
    toast.success(`Exportation du rapport ${format.toUpperCase()} scellé.`);
  };

  if (loading) return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen flex items-center justify-center italic">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
           <RefreshCcw className="w-20 h-20 text-blue-600 animate-spin opacity-20" />
           <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 w-10 h-10 animate-pulse" />
        </div>
        <p className="text-blue-500 text-[11px] font-black uppercase tracking-[0.6em] animate-pulse">
          Décodage des Flux Analytiques...
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 bg-[#0B0F1A] min-h-screen text-white italic font-sans selection:bg-blue-600/30 overflow-x-hidden pb-20 text-left">
      
      {/* 🔝 EN-TÊTE DE COMMANDEMENT ANALYTIQUE */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b border-white/5 pb-12 mb-16">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4 text-blue-500 font-black uppercase tracking-[0.5em] text-[11px] bg-blue-500/5 w-fit px-6 py-2 rounded-full border border-blue-500/20 shadow-2xl">
            <Brain size={16} className="animate-pulse" /> 
            Algorithme Neural Qualisoft • v4.2
          </div>
          <h1 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none">
            Intelligence <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-blue-400 to-indigo-400">Statistique</span>
          </h1>
          <p className="text-slate-500 text-[12px] font-black uppercase tracking-widest flex items-center gap-4 italic">
             <Clock size={16} className="text-blue-500" />
             Master Sync : {new Date().toLocaleTimeString()} • Nœud : {user?.tenantId || 'SMI-CORE-01'}
          </p>
        </div>

        {/* CONTRÔLES TACTIQUES */}
        <div className="flex flex-wrap items-center gap-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-2 flex gap-2 shadow-inner backdrop-blur-3xl">
            {(['7d', '30d', '90d', '1y'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-500 ${
                  period === p 
                    ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.4)]' 
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {p === '7d' ? 'Semaine' : p === '30d' ? 'Mois' : p === '90d' ? 'Trimestre' : 'Année'}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={() => handleExport('pdf')} className="bg-white/5 border border-white/10 hover:border-blue-500/50 p-5 rounded-2xl transition-all group cursor-pointer shadow-xl">
              <FileText size={22} className="text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={() => handleExport('excel')} className="bg-white/5 border border-white/10 hover:border-emerald-500/50 p-5 rounded-2xl transition-all group cursor-pointer shadow-xl">
              <BarChart3 size={22} className="text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* 📊 GRILLE KPI : MÉTRIQUES DE PERFORMANCE (§9.1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
        {MOCK_KPIS.map((kpi, i) => (
          <div key={i} className="bg-slate-900/40 border border-white/5 hover:border-blue-500/40 p-10 rounded-[4rem] transition-all duration-700 group relative overflow-hidden backdrop-blur-3xl shadow-4xl hover:-translate-y-2">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
               {i === 0 ? <ShieldCheck size={120} /> : i === 1 ? <Target size={120} /> : i === 2 ? <Clock size={120} /> : <Zap size={120} />}
            </div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className={`p-5 rounded-2xl bg-black/40 border border-white/5 ${
                kpi.trend > 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {i === 0 ? <ShieldCheck size={32} /> : i === 1 ? <Target size={32} /> : i === 2 ? <Clock size={32} /> : <Zap size={32} />}
              </div>
              <div className={`flex items-center gap-2 text-[11px] font-black px-4 py-2 rounded-full border shadow-lg ${
                kpi.trend > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}>
                {kpi.trend > 0 ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
                {Math.abs(kpi.trend)}%
              </div>
            </div>
            
            <div className="mb-10 relative z-10">
              <div className="text-6xl font-black italic tracking-tighter leading-none mb-3 text-white">
                {kpi.value}<span className="text-2xl text-slate-600 ml-2">{kpi.unit}</span>
              </div>
              <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 italic">{kpi.label}</div>
            </div>

            {/* Sparkline Glow (Visualisation Historique) */}
            <div className="h-20 w-full relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpi.history}>
                  <defs>
                    <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.5}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke={COLORS.primary} fill={`url(#grad${i})`} strokeWidth={4} animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-3 italic tracking-widest">
                <span>Objectif: {kpi.target}{kpi.unit}</span>
                <span className="text-blue-500">{Math.round((kpi.value / kpi.target) * 100)}% d&apos;atteinte</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 shadow-2xl ${
                    (kpi.value / kpi.target) >= 1 ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-500/20'
                  }`}
                  style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📈 ANALYSE TEMPORELLE ET CARTOGRAPHIE ISO 31000 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
        
        {/* ÉVOLUTION DE LA CONFORMITÉ (§9.1.3) */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-[4.5rem] p-12 shadow-4xl backdrop-blur-3xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div>
              <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">Flux de Conformité</h3>
              <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.5em] mt-3 italic leading-none">Analyse structurelle des audits scellés</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 italic">
                <div className="w-4 h-4 rounded-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)]"></div> Réalité
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 italic">
                <div className="w-4 h-4 rounded-full border-2 border-white/20"></div> Seuil Critique
              </div>
            </div>
          </div>
          
          <div className="h-112 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_KPIS[0].history} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} fontWeight={900} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={11} fontWeight={900} tickLine={false} axisLine={false} domain={[80, 100]} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}
                  itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 3 }}
                />
                <Line type="monotone" dataKey="value" stroke={COLORS.primary} strokeWidth={6} dot={{ fill: COLORS.primary, strokeWidth: 5, r: 8, stroke: '#0B0F1A' }} activeDot={{ r: 12, fill: '#fff', stroke: COLORS.primary, strokeWidth: 5 }} animationDuration={2500} />
                <Line type="monotone" dataKey={() => 95} stroke="rgba(255,255,255,0.1)" strokeDasharray="12 12" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARTOGRAPHIE DES RISQUES (§6.1) */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[4.5rem] p-12 shadow-4xl backdrop-blur-3xl flex flex-col">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Matrice des Risques</h3>
            <AlertOctagon size={32} className="text-rose-600 animate-pulse" />
          </div>
          
          {criticalRisksCount > 0 && (
            <div className="mb-10 bg-rose-600/10 border border-rose-600/20 rounded-4xl p-8 flex items-center gap-6 shadow-2xl animate-in fade-in slide-in-from-top-6">
              <div className="w-16 h-16 bg-rose-600/20 rounded-2xl flex items-center justify-center border border-rose-500/20">
                 <AlertTriangle size={32} className="text-rose-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[11px] font-black uppercase text-rose-500 tracking-[0.3em] mb-2 leading-none">Vigilance Critique</p>
                <p className="text-sm font-black text-white italic tracking-tight">{criticalRisksCount} menaces de niveau Gantelet détectées.</p>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-88 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis type="number" dataKey="probability" name="Probabilité" stroke="#475569" fontSize={11} fontWeight={900} tickLine={false} domain={[0, 100]} />
                <YAxis type="number" dataKey="impact" name="Impact" stroke="#475569" fontSize={11} fontWeight={900} tickLine={false} domain={[0, 100]} />
                <ZAxis type="number" range={[200, 800]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '10 10' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as RiskPoint;
                      return (
                        <div className="bg-[#0B0F1A] border border-white/10 p-6 rounded-[2.5rem] shadow-4xl backdrop-blur-3xl text-left">
                          <p className="text-[9px] font-black uppercase text-blue-500 mb-3 tracking-[0.4em]">{d.id}</p>
                          <p className="text-sm font-black text-white italic mb-4 uppercase leading-none tracking-tighter">{d.name}</p>
                          <div className="flex gap-6 text-[10px] font-black uppercase italic">
                            <span className="text-blue-400">Proba: {d.probability}%</span>
                            <span className="text-rose-500">Impact: {d.impact}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Risques" data={RISK_DATA}>
                  {RISK_DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.severity === 'critical' ? COLORS.danger : entry.severity === 'high' ? COLORS.warning : COLORS.primary} 
                      className="drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            
            {/* Zones de danger (Quadrants) */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-rose-600/30 rounded-tr-[4rem] border-l-2 border-b-2 border-rose-600/30 shadow-inner"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-emerald-600/20 rounded-bl-[4rem] border-r-2 border-t-2 border-emerald-600/20"></div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 border-t border-white/5 pt-8 italic">
            {['CRITIQUE', 'HAUT', 'MOYEN', 'STABLE'].map((level, i) => (
              <div key={level} className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full shadow-2xl" style={{ backgroundColor: i === 0 ? COLORS.danger : i === 1 ? COLORS.warning : i === 2 ? COLORS.primary : COLORS.success }} />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🧬 CONFORMITÉ PROCESSUS ET INSIGHTS NEURAUX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* SCORE DE CONFORMITÉ PAR PROCESSUS (§4.4) */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[4.5rem] p-12 shadow-4xl backdrop-blur-3xl text-left">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Performances Processus</h3>
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>

          <div className="space-y-10">
            {PROCESS_DATA.map((proc, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-end mb-4">
                  <div className="flex items-center gap-5">
                    <span className="text-base font-black uppercase italic text-white tracking-tighter group-hover:text-blue-500 transition-colors leading-none">{proc.process}</span>
                    {proc.nc > 0 && (
                      <div className="bg-rose-600/20 text-rose-500 text-[9px] font-black px-4 py-1.5 rounded-full uppercase border border-rose-600/20 animate-pulse tracking-widest italic">
                        {proc.nc} NC OUVERTES
                      </div>
                    )}
                  </div>
                  <span className={`text-2xl font-black italic tracking-tighter leading-none ${proc.compliance >= 95 ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {proc.compliance}%
                  </span>
                </div>
                <div className="h-4 bg-black/60 rounded-full overflow-hidden flex border border-white/10 p-1 shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 shadow-2xl ${proc.compliance >= 95 ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-blue-600 shadow-blue-500/30'}`}
                    style={{ width: `${proc.compliance}%` }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-[10px] font-black uppercase text-slate-500 tracking-widest italic leading-none">
                  <span>Dossier : {proc.audits} audits scellés</span>
                  <span>Target ISO : 95%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🧠 MOTEUR D'INSIGHTS QUALISOFT-NEURAL */}
        <div className="bg-linear-to-br from-blue-900/30 via-slate-900/40 to-indigo-900/30 border border-blue-500/20 rounded-[4.5rem] p-12 relative overflow-hidden shadow-4xl text-left">
          <div className="absolute top-0 right-0 w-160 h-160 bg-blue-600/10 rounded-full blur-[150px] -mr-80 -mt-80 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 bg-blue-600/20 rounded-3xl flex items-center justify-center border border-blue-500/30 shadow-2xl">
                 <Brain size={36} className="text-blue-400 animate-pulse" />
              </div>
              <div>
                 <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">Moteur d&apos;Insights</h3>
                 <p className="text-[11px] text-blue-400 font-black uppercase tracking-[0.5em] italic mt-3">Algorithme de Prédiction Neuro-SMI</p>
              </div>
            </div>

            <div className="space-y-8">
              <InsightItem type="warning" title="Déviation Critique : Processus Client" description="La conformité Relation Client a chuté de 9% sur le dernier cycle. Risque de non-conformité majeure lors de l'audit ISO imminent." action="Lancer Action Corrective §10.2" />
              <InsightItem type="success" title="Maturité GPEC en Accélération" description="Le déploiement des habilitations SSE est en avance de 15%. Impact positif de +4% sur l'indice de sécurité global prévu." />
              
              <div className="bg-black/60 rounded-[3rem] p-10 border border-white/5 mt-10 shadow-4xl backdrop-blur-3xl group">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest italic leading-none">Indice de Maturité Prédit (M+1)</span>
                  <span className="text-4xl font-black italic text-blue-500 tracking-tighter group-hover:scale-110 transition-transform leading-none">92.8%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden p-1 shadow-inner">
                  <div className="h-full bg-linear-to-r from-blue-700 via-blue-500 to-emerald-500 w-[92.8%] rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-2000"></div>
                </div>
                <p className="text-[9px] text-slate-600 mt-6 uppercase tracking-[0.6em] font-black text-center italic opacity-50">Généré par Neural-Core v4.2.1-stable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS TACTIQUES ---

function InsightItem({ type, title, description, action }: { type: 'warning' | 'success', title: string, description: string, action?: string }) {
  return (
    <div className="bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-[2.5rem] p-8 transition-all group backdrop-blur-md shadow-2xl text-left">
      <div className="flex items-start gap-6">
        <div className={`p-4 rounded-2xl mt-1 border shadow-xl group-hover:scale-110 transition-transform ${
          type === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }`}>
          {type === 'warning' ? <AlertTriangle size={24} /> : <TrendingUp size={24} />}
        </div>
        <div className="flex-1">
          <h4 className={`text-lg font-black uppercase tracking-tight mb-3 italic leading-none transition-colors ${
            type === 'warning' ? 'group-hover:text-amber-400' : 'group-hover:text-emerald-400'
          }`}>{title}</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed font-bold uppercase italic tracking-tight opacity-70">{description}</p>
          {action && (
            <button className="mt-6 text-[10px] font-black uppercase bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-white hover:text-blue-600 transition-all border-none shadow-2xl italic tracking-widest cursor-pointer active:scale-95">
              {action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}