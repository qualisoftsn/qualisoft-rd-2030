/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🧠 MODULE : src/app/dashboard/stats/page.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Centre de commandement décisionnel de l'instance.
 * FONCTION : Agrégation multi-normes, matrice des risques et prédiction IA.
 * CONFORMITÉ : ISO 9001, 14001, 45001 (§9.1 Monitoring & Mesure).
 * SÉCURITÉ : Zéro NextAuth. 100% Responsive. Isolation Tenant.
 * DATE DE RÉVISION : 02 Mars 2026 | 15:25 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  TrendingUp, ShieldCheck, AlertTriangle, Target, Zap, 
  BarChart3, RefreshCcw, ArrowUpRight, ArrowDownRight, 
  Clock, FileText, Brain, AlertOctagon, CheckCircle2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/core/api/api-client'; // Prêt pour les requêtes dynamiques
import { toast, Toaster } from 'sonner';
import StatsChart from './StatsChart'; // Ajustez le chemin si nécessaire

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

// --- CONFIGURATION CHROMATIQUE ELITE ---
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
   * Simule l'appel au moteur Qualisoft-Neural (à remplacer par API réelle).
   */
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [period]);

  const globalScore = useMemo(() => {
    return Math.round(MOCK_KPIS.reduce((acc, kpi) => acc + (kpi.value / kpi.target * 100), 0) / MOCK_KPIS.length);
  }, []);

  const criticalRisksCount = useMemo(() => RISK_DATA.filter(r => r.severity === 'critical').length, []);
  
  const handleExport = (format: 'pdf' | 'excel') => {
    const tid = toast.loading(`Génération du rapport ${format.toUpperCase()}...`);
    setTimeout(() => toast.success(`Exportation scellée et téléchargée.`, { id: tid }), 1500);
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 bg-[#0B0F1A] min-h-screen flex items-center justify-center italic p-4">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
           <RefreshCcw className="w-16 h-16 lg:w-20 lg:h-20 text-blue-600 animate-spin opacity-30" />
           <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 w-8 h-8 lg:w-10 lg:h-10 animate-pulse" />
        </div>
        <p className="text-blue-500 text-[9px] lg:text-[11px] font-black uppercase tracking-[0.4em] lg:tracking-[0.6em] animate-pulse text-center m-0">
          Décodage des Flux Analytiques...
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#0B0F1A] min-h-screen ml-0 lg:ml-72 text-white italic font-sans selection:bg-blue-600/30 overflow-x-hidden pb-12 lg:pb-20 text-left">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 EN-TÊTE DE COMMANDEMENT ANALYTIQUE */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 lg:gap-10 border-b border-white/5 pb-8 lg:pb-12 mb-8 lg:mb-16 animate-in fade-in duration-700">
        <div className="flex-1 space-y-4 lg:space-y-6 w-full xl:w-auto">
          <div className="flex items-center gap-3 lg:gap-4 text-blue-500 font-black uppercase tracking-[0.3em] lg:tracking-[0.5em] text-[9px] lg:text-[11px] bg-blue-500/5 w-fit px-4 lg:px-6 py-2 rounded-full border border-blue-500/20 shadow-xl m-0">
            <Brain size={16} className="animate-pulse shrink-0" /> 
            Algorithme Neural Qualisoft • v4.2
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none m-0">
            Intelligence <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-blue-400 to-indigo-400">Statistique</span>
          </h1>
          <p className="text-slate-500 text-[9px] lg:text-[12px] font-black uppercase tracking-[0.2em] lg:tracking-widest flex items-center gap-2 lg:gap-4 italic m-0">
             <Clock size={14} className="text-blue-500 shrink-0 hidden sm:block" />
             <span className="truncate">Master Sync : {new Date().toLocaleTimeString()} • Nœud : {user?.tenantId || 'SMI-CORE-01'}</span>
          </p>
        </div>

        {/* CONTRÔLES TACTIQUES */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-8 w-full xl:w-auto">
          {/* Sélecteur Temporel (Scrollable) */}
          <div className="bg-white/5 border border-white/10 rounded-xl lg:rounded-3xl p-1.5 lg:p-2 flex gap-1 lg:gap-2 shadow-inner backdrop-blur-3xl overflow-x-auto custom-scrollbar-hide w-full sm:w-auto">
            {(['7d', '30d', '90d', '1y'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 sm:flex-none px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase transition-all duration-300 border-none cursor-pointer whitespace-nowrap ${
                  period === p 
                    ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.4)]' 
                    : 'bg-transparent text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {p === '7d' ? 'Semaine' : p === '30d' ? 'Mois' : p === '90d' ? 'Trimestre' : 'Année'}
              </button>
            ))}
          </div>

          <div className="flex gap-3 lg:gap-4 w-full sm:w-auto">
            <button onClick={() => handleExport('pdf')} className="flex-1 sm:flex-none flex justify-center bg-white/5 border border-white/10 hover:border-blue-500/50 p-4 lg:p-5 rounded-xl lg:rounded-2xl transition-colors group cursor-pointer shadow-lg">
              <FileText size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors lg:w-5.5 lg:h-5.5" />
            </button>
            <button onClick={() => handleExport('excel')} className="flex-1 sm:flex-none flex justify-center bg-white/5 border border-white/10 hover:border-emerald-500/50 p-4 lg:p-5 rounded-xl lg:rounded-2xl transition-colors group cursor-pointer shadow-lg">
              <BarChart3 size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors lg:w-5.5 lg:h-5.5" />
            </button>
          </div>
        </div>
      </header>

      

      {/* 📊 GRILLE KPI : MÉTRIQUES DE PERFORMANCE (§9.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-10 mb-10 lg:mb-16 animate-in slide-in-from-bottom-8 duration-700">
        {MOCK_KPIS.map((kpi, i) => (
          <div key={i} className="bg-slate-900/40 border border-white/5 hover:border-blue-500/30 p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[4rem] transition-all duration-500 group relative overflow-hidden backdrop-blur-3xl shadow-xl hover:shadow-2xl">
            <div className="absolute top-0 right-0 p-6 lg:p-10 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
               {i === 0 ? <ShieldCheck size={80} className="lg:w-30 lg:h-30" /> : i === 1 ? <Target size={80} className="lg:w-30 lg:h-30" /> : i === 2 ? <Clock size={80} className="lg:w-30 lg:h-30" /> : <Zap size={80} className="lg:w-30 lg:h-30" />}
            </div>
            
            <div className="flex justify-between items-start mb-6 lg:mb-8 relative z-10">
              <div className={`p-4 lg:p-5 rounded-xl lg:rounded-2xl bg-black/40 border border-white/5 ${
                kpi.trend > 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {i === 0 ? <ShieldCheck size={24} className="lg:w-8 lg:h-8" /> : i === 1 ? <Target size={24} className="lg:w-8 lg:h-8" /> : i === 2 ? <Clock size={24} className="lg:w-8 lg:h-8" /> : <Zap size={24} className="lg:w-8 lg:h-8" />}
              </div>
              <div className={`flex items-center gap-1.5 lg:gap-2 text-[9px] lg:text-[11px] font-black px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-full border shadow-md ${
                kpi.trend > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}>
                {kpi.trend > 0 ? <ArrowUpRight size={14} className="lg:w-4 lg:h-4"/> : <ArrowDownRight size={14} className="lg:w-4 lg:h-4"/>}
                {Math.abs(kpi.trend)}%
              </div>
            </div>
            
            <div className="mb-6 lg:mb-10 relative z-10">
              <div className="text-4xl lg:text-6xl font-black italic tracking-tighter leading-none mb-2 lg:mb-3 text-white m-0">
                {kpi.value}<span className="text-xl lg:text-2xl text-slate-500 ml-1.5 lg:ml-2">{kpi.unit}</span>
              </div>
              <div className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] text-slate-500 italic m-0 truncate" title={kpi.label}>{kpi.label}</div>
            </div>

            {/* Sparkline Glow */}
            <div className="h-16 lg:h-20 w-full relative z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-700">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpi.history}>
                  <defs>
                    <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke={COLORS.primary} fill={`url(#grad${i})`} strokeWidth={3} animationDuration={1500} isAnimationActive={!loading} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 lg:mt-8 pt-4 lg:pt-8 border-t border-white/5 relative z-10">
              <div className="flex justify-between text-[8px] lg:text-[10px] font-black uppercase text-slate-500 mb-2 lg:mb-3 italic tracking-widest leading-none">
                <span>Cible: {kpi.target}{kpi.unit}</span>
                <span className="text-blue-500">{Math.round((kpi.value / kpi.target) * 100)}%</span>
              </div>
              <div className="h-1.5 lg:h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 shadow-md ${
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12 mb-10 lg:mb-16 animate-in slide-in-from-bottom-12 duration-1000">
        
        {/* ÉVOLUTION DE LA CONFORMITÉ (§9.1.3) */}
        <div className="xl:col-span-2 bg-slate-900/40 border border-white/5 rounded-[2.5rem] lg:rounded-[4.5rem] p-6 sm:p-8 lg:p-12 shadow-2xl lg:shadow-4xl backdrop-blur-3xl flex flex-col min-h-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:gap-6 mb-8 lg:mb-12 shrink-0">
            <div>
              <h3 className="text-2xl lg:text-4xl font-black uppercase italic tracking-tighter text-white m-0 leading-none">Flux de Conformité</h3>
              <p className="text-[9px] lg:text-[11px] text-slate-500 font-black uppercase tracking-[0.3em] lg:tracking-[0.5em] mt-2 lg:mt-3 italic leading-none m-0">Analyse temporelle globale</p>
            </div>
            <div className="flex gap-4 lg:gap-6 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 custom-scrollbar-hide">
              <div className="flex items-center gap-2 lg:gap-3 text-[9px] lg:text-[10px] font-black uppercase text-slate-400 italic whitespace-nowrap">
                <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)] shrink-0"></div> Indice Réel
              </div>
              <div className="flex items-center gap-2 lg:gap-3 text-[9px] lg:text-[10px] font-black uppercase text-slate-400 italic whitespace-nowrap">
                <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2 border-white/20 shrink-0"></div> Seuil ISO
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-62.5 lg:min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_KPIS[0].history} margin={{ left: -20, right: 10, bottom: 0, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} dy={10} tick={{ fontStyle: 'italic' }} />
                <YAxis stroke="#475569" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} domain={['dataMin - 5', 100]} dx={-10} tick={{ fontStyle: 'italic' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="value" stroke={COLORS.primary} strokeWidth={4} dot={{ fill: COLORS.primary, strokeWidth: 3, r: 6, stroke: '#0B0F1A' }} activeDot={{ r: 8, fill: '#fff', stroke: COLORS.primary, strokeWidth: 3 }} animationDuration={2000} isAnimationActive={!loading} />
                <Line type="monotone" dataKey={() => 95} stroke="rgba(255,255,255,0.2)" strokeDasharray="5 5" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARTOGRAPHIE DES RISQUES (§6.1) */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] lg:rounded-[4.5rem] p-6 sm:p-8 lg:p-12 shadow-2xl lg:shadow-4xl backdrop-blur-3xl flex flex-col min-h-100">
          <div className="flex justify-between items-start lg:items-center mb-6 lg:mb-10 shrink-0">
            <h3 className="text-xl lg:text-3xl font-black uppercase italic tracking-tighter text-white m-0 leading-none">Matrice<br className="block lg:hidden"/> Risques</h3>
            <AlertOctagon size={28} className="text-rose-600 animate-pulse shrink-0 lg:w-8 lg:h-8" />
          </div>
          
          {criticalRisksCount > 0 && (
            <div className="mb-6 lg:mb-8 bg-rose-600/10 border border-rose-600/20 rounded-2xl lg:rounded-3xl p-4 lg:p-6 flex items-center gap-4 shadow-xl shrink-0">
              <div className="w-10 h-10 lg:w-14 lg:h-14 bg-rose-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center border border-rose-500/20 shrink-0">
                 <AlertTriangle size={20} className="text-rose-600 lg:w-7 lg:h-7" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[9px] lg:text-[10px] font-black uppercase text-rose-500 tracking-[0.2em] mb-1 lg:mb-2 leading-none m-0 truncate">Vigilance Critique</p>
                <p className="text-xs lg:text-sm font-black text-white italic tracking-tight m-0 leading-tight">{criticalRisksCount} menaces majeures détectées.</p>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-50 relative w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis type="number" dataKey="probability" name="Probabilité" stroke="#475569" fontSize={9} fontWeight={900} tickLine={false} domain={[0, 100]} />
                <YAxis type="number" dataKey="impact" name="Impact" stroke="#475569" fontSize={9} fontWeight={900} tickLine={false} domain={[0, 100]} />
                <ZAxis type="number" range={[100, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as RiskPoint;
                      return (
                        <div className="bg-[#0B0F1A] border border-white/10 p-4 lg:p-5 rounded-3xl lg:rounded-4xl shadow-2xl backdrop-blur-3xl text-left max-w-50 lg:max-w-xs">
                          <p className="text-[8px] lg:text-[9px] font-black uppercase text-blue-500 mb-2 tracking-[0.2em] lg:tracking-[0.4em] m-0 leading-none">{d.id}</p>
                          <p className="text-xs lg:text-sm font-black text-white italic mb-3 uppercase leading-tight tracking-tighter m-0">{d.name}</p>
                          <div className="flex flex-col lg:flex-row gap-1 lg:gap-4 text-[9px] lg:text-[10px] font-black uppercase italic">
                            <span className="text-blue-400">Proba: {d.probability}%</span>
                            <span className="text-rose-500">Impact: {d.impact}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Risques" data={RISK_DATA} isAnimationActive={!loading} animationDuration={1500}>
                  {RISK_DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.severity === 'critical' ? COLORS.danger : entry.severity === 'high' ? COLORS.warning : COLORS.primary} 
                      className={entry.severity === 'critical' ? "drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]" : ""}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            
            {/* Zones de danger */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-rose-600/20 rounded-tr-2xl lg:rounded-tr-[3rem] border-l border-b border-rose-500/30"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-emerald-600/10 rounded-bl-2xl lg:rounded-bl-[3rem] border-r border-t border-emerald-500/20"></div>
            </div>
          </div>

          <div className="mt-6 lg:mt-8 flex flex-wrap gap-3 lg:gap-4 border-t border-white/5 pt-4 lg:pt-6 italic shrink-0 justify-center sm:justify-start">
            {['CRITIQUE', 'HAUT', 'MOYEN', 'FAIBLE'].map((level, i) => (
              <div key={level} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full shadow-md" style={{ backgroundColor: i === 0 ? COLORS.danger : i === 1 ? COLORS.warning : i === 2 ? COLORS.primary : COLORS.success }} />
                <span className="text-[8px] lg:text-[9px] font-black uppercase text-slate-500 tracking-widest">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🧬 CONFORMITÉ PROCESSUS ET INSIGHTS NEURAUX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-in slide-in-from-bottom-12 duration-1200">
        
        {/* SCORE DE CONFORMITÉ PAR PROCESSUS (§4.4) */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] lg:rounded-[4.5rem] p-6 sm:p-8 lg:p-12 shadow-2xl lg:shadow-4xl backdrop-blur-3xl text-left">
          <div className="flex justify-between items-start sm:items-center mb-8 lg:mb-12 gap-4">
            <h3 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-white m-0 leading-none">Conformité <br className="block sm:hidden"/>Processus</h3>
            <CheckCircle2 size={28} className="text-emerald-500 shrink-0 lg:w-8 lg:h-8" />
          </div>

          <div className="space-y-6 lg:space-y-8">
            {PROCESS_DATA.map((proc, i) => (
              <div key={i} className="group">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-3 lg:mb-4 gap-2">
                  <div className="flex flex-wrap items-center gap-3 lg:gap-4 w-full sm:w-auto">
                    <span className="text-sm lg:text-base font-black uppercase italic text-white tracking-tighter group-hover:text-blue-500 transition-colors leading-none m-0">{proc.process}</span>
                    {proc.nc > 0 && (
                      <div className="bg-rose-600/20 text-rose-500 text-[8px] lg:text-[9px] font-black px-3 py-1 lg:px-4 lg:py-1.5 rounded-full uppercase border border-rose-600/20 tracking-widest italic m-0">
                        {proc.nc} NC OUVERTES
                      </div>
                    )}
                  </div>
                  <span className={`text-xl lg:text-2xl font-black italic tracking-tighter leading-none m-0 self-end ${proc.compliance >= 95 ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {proc.compliance}%
                  </span>
                </div>
                <div className="h-3 lg:h-4 bg-black/60 rounded-full overflow-hidden flex border border-white/10 p-0.5 lg:p-1 shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 shadow-md ${proc.compliance >= 95 ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-blue-600 shadow-blue-500/30'}`}
                    style={{ width: `${proc.compliance}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 lg:mt-3 text-[9px] lg:text-[10px] font-black uppercase text-slate-500 tracking-widest lg:tracking-widest italic leading-none">
                  <span>Dossier : {proc.audits} audits</span>
                  <span>Target ISO : 95%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🧠 MOTEUR D'INSIGHTS QUALISOFT-NEURAL */}
        <div className="bg-linear-to-br from-blue-900/40 via-slate-900/50 to-indigo-900/40 border border-blue-500/20 rounded-[2.5rem] lg:rounded-[4.5rem] p-6 sm:p-8 lg:p-12 relative overflow-hidden shadow-2xl lg:shadow-4xl text-left flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-75 h-75 lg:w-125 lg:h-125 bg-blue-600/20 rounded-full blur-[80px] lg:blur-[120px] -mr-37.5 -mt-37.5 lg:-mr-62.5 lg:-mt-62.5 opacity-40 pointer-events-none z-0"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-12">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-600/20 rounded-xl lg:rounded-3xl flex items-center justify-center border border-blue-500/30 shadow-xl shrink-0">
                 <Brain size={24} className="text-blue-400 animate-pulse lg:w-9 lg:h-9" />
              </div>
              <div className="min-w-0 pr-2">
                 <h3 className="text-2xl lg:text-4xl font-black uppercase italic tracking-tighter text-white leading-none m-0 truncate">Moteur d&apos;Insights</h3>
                 <p className="text-[9px] lg:text-[11px] text-blue-400 font-black uppercase tracking-[0.2em] lg:tracking-[0.5em] italic mt-2 lg:mt-3 m-0 truncate">Intelligence Prédictive SMI</p>
              </div>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <InsightItem type="warning" title="Déviation : Processus Client" description="La conformité a chuté de 9%. Risque d'écart majeur lors de l'audit externe." action="Plan d'Action Correctif" />
              <InsightItem type="success" title="Maturité GPEC Accélérée" description="Déploiement SSE en avance (+15%). Impact estimé : +4% sur l'indice global." />
            </div>
          </div>

          <div className="bg-black/40 lg:bg-black/60 rounded-4xl lg:rounded-[3rem] p-6 lg:p-10 border border-white/5 mt-8 lg:mt-auto shadow-2xl backdrop-blur-xl group relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-2">
              <span className="text-[9px] lg:text-[11px] font-black uppercase text-slate-400 tracking-widest lg:tracking-widest italic leading-none m-0">Indice Prédit (M+1)</span>
              <span className="text-3xl lg:text-4xl font-black italic text-blue-500 tracking-tighter group-hover:scale-105 transition-transform origin-left sm:origin-right leading-none m-0">92.8%</span>
            </div>
            <div className="h-2 lg:h-3 bg-white/5 rounded-full overflow-hidden p-0.5 lg:p-1 shadow-inner">
              <div className="h-full bg-linear-to-r from-blue-700 via-blue-500 to-emerald-500 w-[92.8%] rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-2000"></div>
            </div>
            <p className="text-[7px] lg:text-[9px] text-slate-600 mt-4 lg:mt-6 uppercase tracking-[0.3em] lg:tracking-[0.6em] font-black text-center italic opacity-60 m-0">Neural-Core v4.2.1-stable</p>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// --- SOUS-COMPOSANTS TACTIQUES ---

function InsightItem({ type, title, description, action }: { type: 'warning' | 'success', title: string, description: string, action?: string }) {
  return (
    <div className="bg-white/5 border border-white/5 hover:border-blue-500/30 rounded-3xl lg:rounded-[2.5rem] p-5 lg:p-8 transition-colors group backdrop-blur-md shadow-lg text-left m-0">
      <div className="flex flex-col sm:flex-row items-start gap-4 lg:gap-6">
        <div className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl border shadow-md shrink-0 ${
          type === 'warning' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }`}>
          {type === 'warning' ? <AlertTriangle size={20} className="lg:w-6 lg:h-6" /> : <TrendingUp size={20} className="lg:w-6 lg:h-6" />}
        </div>
        <div className="flex-1 min-w-0 w-full">
          <h4 className={`text-base lg:text-lg font-black uppercase tracking-tight mb-2 lg:mb-3 italic leading-none transition-colors m-0 truncate ${
            type === 'warning' ? 'group-hover:text-amber-400' : 'group-hover:text-emerald-400'
          }`} title={title}>{title}</h4>
          <p className="text-[10px] lg:text-[11px] text-slate-400 leading-relaxed font-bold uppercase italic tracking-tight opacity-80 m-0">{description}</p>
          {action && (
            <button className="mt-4 lg:mt-6 w-full sm:w-auto text-[9px] lg:text-[10px] font-black uppercase bg-blue-600 text-white px-5 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl hover:bg-blue-500 transition-colors border-none shadow-md italic tracking-widest cursor-pointer active:scale-95 m-0">
              {action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}