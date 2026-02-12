//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

// --- TYPES ANALYTIQUES SCELLÉS ---
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
  probability: number; 
  impact: number; 
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

// --- DATA MOCK (Sync API READY) ---
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
    label: 'Temps Traitement NC', value: 12, unit: 'j', trend: -15, target: 10,
    history: [{ month: 'Jan', value: 18 }, { month: 'Fév', value: 16 }, { month: 'Mar', value: 14 }, { month: 'Avr', value: 12 }]
  },
  { 
    label: 'Efficacité Actions', value: 88, unit: '%', trend: -1.2, target: 90,
    history: [{ month: 'Jan', value: 85 }, { month: 'Fév', value: 89 }, { month: 'Mar', value: 90 }, { month: 'Avr', value: 88 }]
  }
];

const RISK_DATA: RiskPoint[] = [
  { id: 'R-001', name: 'Départ expert métier', probability: 70, impact: 85, severity: 'critical' },
  { id: 'R-002', name: 'Non audit fournisseur', probability: 40, impact: 60, severity: 'medium' },
  { id: 'R-003', name: 'Changement norme ISO', probability: 20, impact: 90, severity: 'high' },
  { id: 'R-004', name: 'Panne serveur GED', probability: 15, impact: 75, severity: 'medium' },
  { id: 'R-005', name: 'Retard livraison', probability: 60, impact: 30, severity: 'low' },
];

const PROCESS_DATA: ProcessCompliance[] = [
  { process: 'Management', compliance: 98, audits: 4, nc: 0 },
  { process: 'Conception', compliance: 92, audits: 6, nc: 2 },
  { process: 'Achats', compliance: 85, audits: 3, nc: 4 },
  { process: 'Production', compliance: 96, audits: 8, nc: 1 },
  { process: 'Recouvrement', compliance: 78, audits: 2, nc: 5 },
];

export default function StatsIntelligencePage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'risks' | 'process'>('overview');
  
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [period]);

  const globalScore = useMemo(() => {
    return Math.round(MOCK_KPIS.reduce((acc, kpi) => acc + (kpi.value / kpi.target * 100), 0) / MOCK_KPIS.length);
  }, []);

  const criticalRisks = useMemo(() => RISK_DATA.filter(r => r.severity === 'critical').length, []);
  
  const exportReport = (format: 'pdf' | 'excel') => {
    toast.info(`Génération du rapport ${format.toUpperCase()}...`);
    // Logique export réelle ici
  };

  if (loading) {
    return (
      <div className="p-10 bg-[#0B0F1A] min-h-screen flex items-center justify-center italic">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <RefreshCcw className="w-16 h-16 text-blue-600 animate-spin" />
             <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 w-6 h-6 animate-pulse" />
          </div>
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.5em]">
            Extraction de la Matrix...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 bg-[#0B0F1A] min-h-screen text-white italic font-sans selection:bg-blue-600/30 overflow-x-hidden pb-20">
      
      {/* 🔝 HEADER INTELLIGENT */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/5 pb-10 mb-12">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] bg-blue-500/5 w-fit px-4 py-1.5 rounded-full border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <Brain size={14} className="animate-pulse" /> 
            Intelligence Souveraine • RD 2030
          </div>
          <h1 className="text-5xl lg:text-38xl font-black uppercase italic tracking-tighter leading-none">
            Analyse <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-blue-400 to-indigo-400">Statistique</span>
          </h1>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
             <Clock size={14} className="text-blue-500" />
             Synchronisation Master : {new Date().toLocaleTimeString()} • Nœud : {user?.tenantId || 'Matrix-Core'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1.5 flex gap-1 shadow-2xl backdrop-blur-md">
            {(['7d', '30d', '90d', '1y'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${
                  period === p 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {p === '7d' ? '7 Jours' : p === '30d' ? '30 Jours' : p === '90d' ? '90 Jours' : '1 An'}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => exportReport('pdf')}
              className="bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-600/10 p-4 rounded-2xl transition-all group border-none cursor-pointer"
            >
              <FileText size={20} className="text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => exportReport('excel')}
              className="bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-600/10 p-4 rounded-2xl transition-all group border-none cursor-pointer"
            >
              <BarChart3 size={20} className="text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* 📊 KPI GRID AVEC MINI-VISUALISATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {MOCK_KPIS.map((kpi, i) => (
          <div key={i} className="bg-slate-900/40 border border-white/5 hover:border-blue-500/30 p-8 rounded-[2.5rem] transition-all duration-500 group relative overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               {i === 0 ? <ShieldCheck size={100} /> : i === 1 ? <Target size={100} /> : i === 2 ? <Clock size={100} /> : <Zap size={100} />}
            </div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 ${
                kpi.trend > 0 ? 'text-emerald-500' : kpi.trend < 0 ? 'text-rose-500' : 'text-amber-500'
              }`}>
                {i === 0 ? <ShieldCheck size={28} /> : i === 1 ? <Target size={28} /> : i === 2 ? <Clock size={28} /> : <Zap size={28} />}
              </div>
              <div className={`flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-full border ${
                kpi.trend > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                kpi.trend < 0 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {kpi.trend > 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                {Math.abs(kpi.trend)}%
              </div>
            </div>
            
            <div className="mb-8 relative z-10">
              <div className="text-5xl font-black italic tracking-tighter leading-none mb-2">{kpi.value}<span className="text-xl text-slate-600 ml-1">{kpi.unit}</span></div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{kpi.label}</div>
            </div>

            {/* Sparkline Glow */}
            <div className="h-16 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpi.history}>
                  <defs>
                    <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={i === 0 ? COLORS.primary : i === 1 ? COLORS.secondary : i === 2 ? COLORS.success : COLORS.warning} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={i === 0 ? COLORS.primary : i === 1 ? COLORS.secondary : i === 2 ? COLORS.success : COLORS.warning} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={i === 0 ? COLORS.primary : i === 1 ? COLORS.secondary : i === 2 ? COLORS.success : COLORS.warning} 
                    fill={`url(#grad${i})`} 
                    strokeWidth={3}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
              <div className="flex justify-between text-[9px] font-black uppercase text-slate-600 mb-2">
                <span>Objectif: {kpi.target}{kpi.unit}</span>
                <span className="text-blue-500">{Math.round((kpi.value / kpi.target) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    (kpi.value / kpi.target) >= 1 ? 'bg-emerald-500' : 
                    (kpi.value / kpi.target) >= 0.8 ? 'bg-blue-600' : 'bg-rose-600'
                  }`}
                  style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📈 ANALYSE TEMPORELLE ET RISQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
        
        {/* ÉVOLUTION TEMPORELLE */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">Évolution de la Conformité</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 italic">Tendance structurelle sur 12 mois glissants</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 italic">
                <div className="w-3 h-3 rounded-full bg-blue-600 shadow-lg shadow-blue-600/50"></div> Réel
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 italic">
                <div className="w-3 h-3 rounded-full border-2 border-white/20"></div> Seuil de Sécurité
              </div>
            </div>
          </div>
          
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_KPIS[0].history} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tick={{ fontWeight: 900, fill: '#475569' }} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[80, 100]} tick={{ fontWeight: 900, fill: '#475569' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={COLORS.primary} 
                  strokeWidth={5}
                  dot={{ fill: COLORS.primary, strokeWidth: 4, r: 6, stroke: '#0B0F1A' }}
                  activeDot={{ r: 10, fill: '#fff', stroke: COLORS.primary, strokeWidth: 4 }}
                  animationDuration={2000}
                />
                <Line 
                  type="monotone" 
                  dataKey={() => 95} 
                  stroke="rgba(255,255,255,0.1)" 
                  strokeDasharray="10 10" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARTOGRAPHIE DES RISQUES ISO */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 shadow-2xl backdrop-blur-xl flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Matrice de Sévérité</h3>
            <AlertOctagon size={24} className="text-rose-600 animate-pulse" />
          </div>
          
          {criticalRisks > 0 && (
            <div className="mb-8 bg-rose-600/10 border border-rose-600/20 rounded-3xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="w-12 h-12 bg-rose-600/20 rounded-2xl flex items-center justify-center">
                 <AlertTriangle size={24} className="text-rose-600" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-rose-500 tracking-[0.2em] mb-1">Points Critiques</p>
                <p className="text-sm font-black text-white italic">{criticalRisks} risques de niveau Gantelet détectés</p>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-75 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                <XAxis type="number" dataKey="probability" name="Probabilité" stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} tick={{ fontWeight: 900 }} />
                <YAxis type="number" dataKey="impact" name="Impact" stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} tick={{ fontWeight: 900 }} />
                <ZAxis type="number" range={[100, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '5 5' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as RiskPoint;
                      return (
                        <div className="bg-[#0B0F1A] border border-white/10 p-5 rounded-4xl shadow-2xl backdrop-blur-xl">
                          <p className="text-[8px] font-black uppercase text-blue-500 mb-2 tracking-widest">{d.id}</p>
                          <p className="text-xs font-black text-white italic mb-3 uppercase leading-tight">{d.name}</p>
                          <div className="flex gap-4 text-[9px] font-black uppercase">
                            <span className="text-blue-400">P: {d.probability}%</span>
                            <span className="text-rose-400">I: {d.impact}%</span>
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
                      fill={
                        entry.severity === 'critical' ? COLORS.danger : 
                        entry.severity === 'high' ? COLORS.warning : 
                        entry.severity === 'medium' ? COLORS.primary : COLORS.success
                      } 
                      className="drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            
            {/* Quadrants de risque */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-rose-600/20 rounded-tr-3xl border-l border-b border-rose-600/20"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-emerald-600/20 rounded-bl-3xl border-r border-t border-emerald-600/20"></div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 border-t border-white/5 pt-6">
            {['Critique', 'Élevé', 'Moyen', 'Faible'].map((level, i) => (
              <div key={level} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full shadow-lg shadow-black/20" 
                  style={{ 
                    backgroundColor: i === 0 ? COLORS.danger : i === 1 ? COLORS.warning : i === 2 ? COLORS.primary : COLORS.success 
                  }} 
                />
                <span className="text-[10px] font-black uppercase text-slate-500 italic tracking-widest">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🧬 CONFORMITÉ PROCESSUS ET INSIGHTS IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* CONFORMITÉ PAR PROCESSUS */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Performances Processus</h3>
            <CheckCircle2 size={24} className="text-emerald-500" />
          </div>

          <div className="space-y-8">
            {PROCESS_DATA.map((proc, i) => (
              <div key={i} className="group cursor-default">
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black uppercase italic text-white tracking-tight group-hover:text-blue-400 transition-colors">{proc.process}</span>
                    {proc.nc > 0 && (
                      <div className="bg-rose-600/20 text-rose-500 text-[8px] font-black px-3 py-1 rounded-full uppercase border border-rose-600/20 animate-pulse">
                        {proc.nc} Anomalies détectées
                      </div>
                    )}
                  </div>
                  <span className={`text-lg font-black italic tracking-tighter ${
                    proc.compliance >= 95 ? 'text-emerald-400' : 
                    proc.compliance >= 80 ? 'text-blue-400' : 'text-amber-500'
                  }`}>
                    {proc.compliance}%
                  </span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden flex border border-white/5 p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 shadow-lg ${
                      proc.compliance >= 95 ? 'bg-emerald-500' : 
                      proc.compliance >= 80 ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${proc.compliance}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[9px] font-black uppercase text-slate-600 tracking-widest">
                  <span>{proc.audits} audits scellés</span>
                  <span className="italic">Obj. Qualité : 95%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECOMMANDATIONS PRÉDICTIVES IA */}
        <div className="bg-linear-to-br from-blue-900/20 via-slate-900/40 to-indigo-900/20 border border-blue-500/20 rounded-[3.5rem] p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                 <Brain size={32} className="text-blue-400 animate-pulse" />
              </div>
              <div>
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter">Moteur d&apos;Insights</h3>
                 <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] italic">Analyse Neuro-Prédictive SMI</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 border border-white/5 hover:border-amber-500/30 rounded-3xl p-6 transition-all cursor-pointer group backdrop-blur-md">
                <div className="flex items-start gap-5">
                  <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-500 mt-1 border border-amber-500/10 group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-md font-black uppercase tracking-tight mb-2 group-hover:text-amber-400 transition-colors italic">Déviation Processus Achats</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">Le score Achats présente une chute de 7% sur les 14 derniers jours. Risque de non-conformité majeure pour l&apos;audit ISO de juin.</p>
                    <div className="mt-4 flex gap-3">
                      <button className="text-[9px] font-black uppercase bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-white hover:text-blue-600 transition-all border-none shadow-lg italic">
                        Lancer Action Corrective
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 hover:border-emerald-500/30 rounded-3xl p-6 transition-all cursor-pointer group backdrop-blur-md">
                <div className="flex items-start gap-5">
                  <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500 mt-1 border border-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <TrendingUp size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-md font-black uppercase tracking-tight mb-2 group-hover:text-emerald-400 transition-colors italic">Optimisation RH scellée</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">L&apos;accélération de 15% du traitement des NC indique une meilleure maturité des équipes RQ. Score GPEC projeté : +5%.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 mt-8 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic font-sans">Maturité SMI Prédite (M+1)</span>
                  <span className="text-3xl font-black italic text-blue-500 tracking-tighter">92.8%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-linear-to-r from-blue-700 via-blue-500 to-emerald-500 w-[92%] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000"></div>
                </div>
                <p className="text-[9px] text-slate-600 mt-4 uppercase tracking-[0.3em] font-black text-center">Basé sur l&apos;algorithme Qualisoft-Neural v4.2</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}