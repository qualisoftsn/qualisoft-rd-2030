/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
// File: frontend/src/app/dashboard/stats/page.tsx
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

// --- TYPES ANALYTIQUES ---
interface KPIData {
  label: string;
  value: number;
  unit: string;
  trend: number; // % de variation
  target: number;
  history: { month: string; value: number }[];
}

interface RiskPoint {
  id: string;
  name: string;
  probability: number; // 0-100
  impact: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ProcessCompliance {
  process: string;
  compliance: number;
  audits: number;
  nc: number;
}

// --- DONNÉES SIMULÉES (Remplacer par API call) ---
const MOCK_KPIS: KPIData[] = [
  { 
    label: 'Conformité SMI', 
    value: 94.2, 
    unit: '%', 
    trend: 2.1, 
    target: 95,
    history: [
      { month: 'Jan', value: 89 }, { month: 'Fév', value: 91 }, 
      { month: 'Mar', value: 92 }, { month: 'Avr', value: 94.2 }
    ]
  },
  { 
    label: 'Couverture GPEC', 
    value: 78.5, 
    unit: '%', 
    trend: 5.4, 
    target: 80,
    history: [
      { month: 'Jan', value: 65 }, { month: 'Fév', value: 70 }, 
      { month: 'Mar', value: 75 }, { month: 'Avr', value: 78.5 }
    ]
  },
  { 
    label: 'Temps de traitement NC', 
    value: 12, 
    unit: 'jours', 
    trend: -15, 
    target: 10,
    history: [
      { month: 'Jan', value: 18 }, { month: 'Fév', value: 16 }, 
      { month: 'Mar', value: 14 }, { month: 'Avr', value: 12 }
    ]
  },
  { 
    label: 'Efficacité Actions', 
    value: 88, 
    unit: '%', 
    trend: -1.2, 
    target: 90,
    history: [
      { month: 'Jan', value: 85 }, { month: 'Fév', value: 89 }, 
      { month: 'Mar', value: 90 }, { month: 'Avr', value: 88 }
    ]
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

const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4'
};

export default function StatsIntelligencePage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'risks' | 'process'>('overview');
  
  // Simulation fetch données
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [period]);

  // Calculs analytiques
  const globalScore = useMemo(() => {
    return Math.round(MOCK_KPIS.reduce((acc, kpi) => acc + (kpi.value / kpi.target * 100), 0) / MOCK_KPIS.length);
  }, []);

  const criticalRisks = useMemo(() => RISK_DATA.filter(r => r.severity === 'critical').length, []);
  
  const exportReport = (format: 'pdf' | 'excel') => {
    // Simulation export
    console.log(`Exporting ${format} report for period ${period}...`);
    alert(`Rapport ${format.toUpperCase()} généré pour la période ${period}`);
  };

  if (loading) {
    return (
      <div className="p-10 bg-[#0B0F1A] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-blue-500 text-xs font-black uppercase tracking-widest animate-pulse">
            Analyse des données en cours...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 bg-[#0B0F1A] min-h-screen text-white italic selection:bg-blue-600/30">
      
      {/* HEADER INTELLIGENT */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8 mb-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 text-blue-500 mb-3 font-black uppercase tracking-[0.3em] text-[10px]">
            <Brain size={16} className="animate-pulse" /> 
            Intelligence Artificielle • Analyse Prédictive
          </div>
          <h1 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none mb-2">
            Tableau de <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-blue-400">Bord Stratégique</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mt-2">
            Analyse temps réel • Tenant: {user?.tenantId || 'N/A'} • Dernière synchro: {new Date().toLocaleTimeString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Sélecteur de période */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1 flex gap-1">
            {(['7d', '30d', '90d', '1y'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  period === p 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {p === '7d' ? '7J' : p === '30d' ? '30J' : p === '90d' ? '90J' : '1AN'}
              </button>
            ))}
          </div>

          {/* Actions export */}
          <div className="flex gap-2">
            <button 
              onClick={() => exportReport('pdf')}
              className="bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-600/10 px-4 py-3 rounded-2xl flex items-center gap-2 transition-all group"
            >
              <FileText size={16} className="text-slate-400 group-hover:text-blue-500" />
              <span className="text-[10px] font-black uppercase hidden lg:block">PDF</span>
            </button>
            <button 
              onClick={() => exportReport('excel')}
              className="bg-white/5 border border-white/10 hover:border-green-500/50 hover:bg-green-600/10 px-4 py-3 rounded-2xl flex items-center gap-2 transition-all group"
            >
              <BarChart3 size={16} className="text-slate-400 group-hover:text-green-500" />
              <span className="text-[10px] font-black uppercase hidden lg:block">Excel</span>
            </button>
          </div>
        </div>
      </header>

      {/* KPI CARDS AVEC SPARKLINES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {MOCK_KPIS.map((kpi, i) => (
          <div key={i} className="bg-white/5 border border-white/5 hover:border-white/20 p-6 rounded-4xl transition-all group backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${
                kpi.trend > 0 ? 'text-emerald-500' : kpi.trend < 0 ? 'text-red-500' : 'text-amber-500'
              }`}>
                {i === 0 ? <ShieldCheck size={24} /> : i === 1 ? <Target size={24} /> : i === 2 ? <Clock size={24} /> : <Zap size={24} />}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${
                kpi.trend > 0 ? 'bg-emerald-500/10 text-emerald-500' : 
                kpi.trend < 0 ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
              }`}>
                {kpi.trend > 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                {Math.abs(kpi.trend)}%
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-3xl font-black italic tracking-tighter">{kpi.value}{kpi.unit}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{kpi.label}</div>
            </div>

            {/* Sparkline mini */}
            <div className="h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpi.history}>
                  <defs>
                    <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={i === 0 ? COLORS.primary : i === 1 ? COLORS.secondary : i === 2 ? COLORS.success : COLORS.warning} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={i === 0 ? COLORS.primary : i === 1 ? COLORS.secondary : i === 2 ? COLORS.success : COLORS.warning} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={i === 0 ? COLORS.primary : i === 1 ? COLORS.secondary : i === 2 ? COLORS.success : COLORS.warning} 
                    fill={`url(#grad${i})`} 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Barre de progression vs Target */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex justify-between text-[9px] font-black uppercase text-slate-600 mb-1">
                <span>Objectif: {kpi.target}{kpi.unit}</span>
                <span>{Math.round((kpi.value / kpi.target) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    (kpi.value / kpi.target) >= 1 ? 'bg-emerald-500' : 
                    (kpi.value / kpi.target) >= 0.8 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* GRILLE PRINCIPALE ANALYTIQUE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Graphique d'évolution temporelle */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Évolution Conformité</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Tendance sur 12 mois glissants</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div> Réel
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="w-3 h-3 rounded-full bg-white/20 border border-white/40"></div> Objectif
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_KPIS[0].history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[80, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 900 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={COLORS.primary} 
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey={() => 95} 
                  stroke="#ffffff30" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Matrice des risques (Scatter plot) */}
        <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Cartographie Risques</h3>
            <AlertOctagon size={20} className="text-red-500" />
          </div>
          
          {criticalRisks > 0 && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-[10px] font-black uppercase text-red-400">{criticalRisks} Risque(s) critique(s) détecté(s)</span>
            </div>
          )}

          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis type="number" dataKey="probability" name="Probabilité" unit="%" stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <YAxis type="number" dataKey="impact" name="Impact" unit="%" stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as RiskPoint;
                      return (
                        <div className="bg-[#0F172A] border border-white/10 p-3 rounded-xl shadow-xl">
                          <p className="text-[10px] font-black uppercase text-slate-400">{data.id}</p>
                          <p className="text-xs font-bold text-white mb-1">{data.name}</p>
                          <div className="flex gap-3 text-[9px] font-black uppercase">
                            <span className="text-blue-400">Proba: {data.probability}%</span>
                            <span className="text-amber-400">Impact: {data.impact}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Risques" data={RISK_DATA} fill="#8884d8">
                  {RISK_DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.severity === 'critical' ? COLORS.danger : 
                        entry.severity === 'high' ? COLORS.warning : 
                        entry.severity === 'medium' ? COLORS.primary : COLORS.success
                      } 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            
            {/* Zones de risque */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-red-500/5 rounded-tr-4xl"></div>
              <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-emerald-500/5 rounded-bl-4xl"></div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['Critique', 'Élevé', 'Moyen', 'Faible'].map((level, i) => (
              <div key={level} className="flex items-center gap-1.5">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ 
                    backgroundColor: i === 0 ? COLORS.danger : i === 1 ? COLORS.warning : i === 2 ? COLORS.primary : COLORS.success 
                  }} 
                />
                <span className="text-[9px] font-black uppercase text-slate-500">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONFORMITÉ PAR PROCESSUS + ACTIONS RÉCENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Tableau de conformité par processus */}
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Conformité par Processus</h3>
            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>

          <div className="space-y-4">
            {PROCESS_DATA.map((proc, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase text-white">{proc.process}</span>
                    {proc.nc > 0 && (
                      <span className="bg-red-500/20 text-red-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                        {proc.nc} NC
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-black italic ${
                    proc.compliance >= 95 ? 'text-emerald-400' : 
                    proc.compliance >= 80 ? 'text-blue-400' : 'text-amber-400'
                  }`}>
                    {proc.compliance}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      proc.compliance >= 95 ? 'bg-emerald-500' : 
                      proc.compliance >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${proc.compliance}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[8px] font-black uppercase text-slate-600">
                  <span>{proc.audits} audits</span>
                  <span>Obj: 95%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights & Recommandations IA */}
        <div className="bg-linear-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-[2.5rem] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Brain size={24} className="text-blue-400 animate-pulse" />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Insights IA</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-500/20 p-2 rounded-xl text-amber-500 mt-1">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black uppercase tracking-tight mb-1 group-hover:text-blue-400 transition-colors">Risque de non-conformité détecté</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Le processus Achats descend sous les 85%. Risque de finding majeur à la prochaine audit.</p>
                    <div className="mt-3 flex gap-2">
                      <button className="text-[9px] font-black uppercase bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors">
                        Voir l&apos;action
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-500 mt-1">
                    <TrendingUp size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black uppercase tracking-tight mb-1 group-hover:text-emerald-400 transition-colors">Tendance positive</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">La vitesse de traitement des NC a augmenté de 15%. Vous serez audit-ready dans 3 semaines.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Score de maturité prédit</span>
                  <span className="text-lg font-black italic text-blue-400">92%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-blue-600 to-emerald-500 w-[92%]"></div>
                </div>
                <p className="text-[8px] text-slate-500 mt-2 uppercase tracking-wider">Basé sur les tendances actuelles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}