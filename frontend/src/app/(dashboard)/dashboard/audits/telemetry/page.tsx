/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : AuditTelemetry.tsx (ISO 9001 §9.1.3)
 * -------------------------------------------------------------------------
 * RÔLE : Analyse visuelle des performances d'audit (Zéro Scroll Global)
 * VERSION : 3.0 - Recharts typé + Données Prisma-aligned + Design Elite + Accessibilité
 * API : apiClient Axios avec interceptors (Bearer + X-Tenant-Id)
 * NOTE : Fallback offline pour démo
 * RÉVISION : 19 Mars 2026 | Production OVH
 * -------------------------------------------------------------------------
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie,
  type TooltipProps
} from 'recharts';
import { 
  ShieldCheck, Target, AlertCircle, TrendingUp, Activity, 
  Calendar, CheckCircle2, Clock, FileText
} from 'lucide-react';
import { cn } from '@/core/utils/cn';
import apiClient from '@/core/api/api-client';

// ============================================================================
// TYPES & INTERFACES (Strict Typing - Prisma aligned)
// ============================================================================

// Basé sur model Processus + Audit + NonConformite du schema.prisma
export interface ProcessStats {
  process: string;              // PR_Libelle from Processus
  score: number;                // Calculated: (conformities / total_checks) * 100
  audits: number;               // Count of Audit where AU_ProcessusId = PR_Id
  ncCount: number;              // Count of NonConformite linked to this process
}

export interface TelemetryData {
  totalAudits: number;          // Count of Audit where AU_Status !== 'ANNULE'
  completedAudits: number;      // Count where AU_Status === 'TERMINE'
  ncMajeures: number;           // Count where NC_Gravite === 'MAJEURE' OR 'CRITIQUE'
  ncMineures: number;           // Count where NC_Gravite === 'MINEURE'
  objectifSMI: number;          // Target score from QualityObjective or config
  lastUpdate: string;           // ISO string
  byProcess: ProcessStats[];    // Array of process-level stats
  trend: Array<{ month: string; score: number }>; // 6-month trend data
}

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  trend?: 'up' | 'down' | 'stable';
  animate?: boolean;
  subtext?: string;
}

// Typing pour Recharts Tooltip (évite `any`)
interface RechartsTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color?: string;
  }>;
  label?: string;
}

// ============================================================================
// DONNÉES DE DÉMO (Fallback si API indisponible)
// ============================================================================

const DEMO_DATA: TelemetryData = {
  totalAudits: 24,
  completedAudits: 18,
  ncMajeures: 3,
  ncMineures: 7,
  objectifSMI: 95,
  lastUpdate: new Date().toISOString(),
  byProcess: [
    { process: 'Direction', score: 98, audits: 4, ncCount: 0 },
    { process: 'RH', score: 87, audits: 3, ncCount: 2 },
    { process: 'Production', score: 72, audits: 6, ncCount: 5 },
    { process: 'Logistique', score: 91, audits: 4, ncCount: 1 },
    { process: 'Maintenance', score: 68, audits: 4, ncCount: 4 },
    { process: 'QHSE', score: 96, audits: 3, ncCount: 0 },
  ],
  trend: [
    { month: 'Jan', score: 78 },
    { month: 'Fév', score: 82 },
    { month: 'Mar', score: 85 },
    { month: 'Avr', score: 81 },
    { month: 'Mai', score: 88 },
    { month: 'Juin', score: 92 },
  ],
};

// ============================================================================
// SOUS-COMPOSANT : KPI CARD
// ============================================================================

function KpiCard({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  bg, 
  trend, 
  animate, 
  subtext 
}: KpiCardProps) {
  return (
    <article 
      className={cn(
        "bg-[#0F172A] border border-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl flex items-center justify-between group hover:border-white/20 transition-all shadow-xl flex-1 min-h-[120px] focus-within:border-blue-500/30",
        animate && "animate-pulse"
      )}
      role="region"
      aria-label={`${label}: ${value}`}
    >
      <div className="space-y-2 md:space-y-3">
        <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest m-0">{label}</p>
        <h4 className="text-3xl md:text-4xl font-black text-white italic m-0 tracking-tighter">{value}</h4>
        {subtext && <p className="text-[8px] text-slate-600">{subtext}</p>}
        {trend && (
          <span className={cn(
            "text-[8px] font-black uppercase tracking-wider flex items-center gap-1",
            trend === 'up' ? "text-emerald-400" : trend === 'down' ? "text-rose-400" : "text-slate-400"
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trend === 'up' ? '+4.2%' : trend === 'down' ? '-1.8%' : 'Stable'}
          </span>
        )}
      </div>
      <div className={cn(
        "w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110",
        bg, color
      )} aria-hidden="true">
        <Icon size={24} className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" />
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : CUSTOM TOOLTIP FOR CHARTS (Typé)
// ============================================================================

function CustomTooltip({ active, payload, label }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  
  return (
    <div 
      className="bg-[#0B0F1A] border border-white/10 rounded-xl p-4 shadow-2xl"
      role="tooltip"
      aria-live="polite"
    >
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-[10px] font-bold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}{entry.name === 'score' ? '%' : ''}
        </p>
      ))}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : AUDIT TELEMETRY
// ============================================================================

export default function AuditTelemetry() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // FETCH DATA (CRUD: READ)
  // ============================================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get<TelemetryData>('/audits/stats/telemetry');
      setData(response.data);
      
    } catch (err) {
      console.error('❌ Erreur chargement télémétrie:', err);
      setError("Mode démo activé (API indisponible)");
      // Fallback vers les données de démo
      setData(DEMO_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchData();
      
      // Refresh auto toutes les 5 minutes
      const interval = setInterval(fetchData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, []);

  // ============================================================================
  // CALCULS & FORMATTING (Memoized)
  // ============================================================================

  const completionRate = useMemo(() => {
    if (!data) return 0;
    return Math.round((data.completedAudits / data.totalAudits) * 100);
  }, [data]);

  const ncTotal = useMemo(() => {
    if (!data) return 0;
    return data.ncMajeures + data.ncMineures;
  }, [data]);

  const averageScore = useMemo(() => {
    if (!data?.byProcess?.length) return 0;
    const sum = data.byProcess.reduce((acc, p) => acc + p.score, 0);
    return Math.round(sum / data.byProcess.length);
  }, [data]);

  const pieData = useMemo(() => {
    if (!data) return [];
    const conformes = data.completedAudits - ncTotal;
    return [
      { name: 'Conformes', value: conformes, color: '#10b981' },
      { name: 'NC Mineures', value: data.ncMineures, color: '#f59e0b' },
      { name: 'NC Majeures', value: data.ncMajeures, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [data, ncTotal]);

  // ============================================================================
  // ÉTATS D'AFFICHAGE
  // ============================================================================

  if (loading && !data && typeof window !== 'undefined') {
    return (
      <div 
        className="h-full flex items-center justify-center bg-[#0B0F1A] text-blue-400 font-black italic uppercase gap-4" 
        role="status"
        aria-live="polite"
      >
        <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" aria-hidden="true" />
        Chargement des analytics...
      </div>
    );
  }

  if (!data && typeof window !== 'undefined') {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0B0F1A] text-slate-400 p-8">
        <AlertCircle size={48} className="w-12 h-12 mb-4 text-amber-400" aria-hidden="true" />
        <p className="text-lg font-black uppercase italic mb-2">Données indisponibles</p>
        <p className="text-sm mb-6">{error || 'Vérifiez votre connexion'}</p>
        <button 
          type="button"
          onClick={fetchData}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full selection:bg-blue-600/30">
      
      {/* HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white italic tracking-tighter uppercase m-0 leading-none">
              Télémétrie <span className="text-blue-500">Audit</span>
            </h1>
            <p className="text-slate-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-1.5 md:mt-2 m-0">
              Analyse de conformité transversale Matrix
            </p>
          </div>
          <div className="flex items-center gap-3 text-[8px] text-slate-600 uppercase tracking-widest">
            <Clock size={12} className="w-3 h-3" aria-hidden="true" />
            <span>Mis à jour: {new Date(data?.lastUpdate || '').toLocaleTimeString('fr-SN')}</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-5 md:py-6">
        <div className="max-w-7xl mx-auto space-y-5 md:space-y-6">
          
          {/* KPI GRID */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" aria-label="Indicateurs clés de performance">
            <KpiCard 
              label="Audits Réalisés" 
              value={data?.totalAudits || 0} 
              icon={ShieldCheck} 
              color="text-emerald-400" 
              bg="bg-emerald-500/10"
              trend="up"
              subtext={`${data?.completedAudits || 0} terminés`}
            />
            <KpiCard 
              label="Non-Conformités" 
              value={ncTotal} 
              icon={AlertCircle} 
              color="text-rose-400" 
              bg="bg-rose-500/10"
              trend={ncTotal > 5 ? 'down' : 'stable'}
              subtext={`${data?.ncMajeures || 0} majeures`}
            />
            <KpiCard 
              label="Score Moyen" 
              value={`${averageScore}%`} 
              icon={Target} 
              color="text-blue-400" 
              bg="bg-blue-500/10"
              trend={averageScore >= (data?.objectifSMI || 0) ? 'up' : 'stable'}
              subtext={`Objectif: ${data?.objectifSMI || 0}%`}
            />
            <KpiCard 
              label="Taux de Clôture" 
              value={`${completionRate}%`} 
              icon={CheckCircle2} 
              color="text-amber-400" 
              bg="bg-amber-500/10"
              animate={completionRate < 80}
            />
          </section>

          {/* CHARTS GRID */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 md:gap-6" aria-label="Visualisations des données d'audit">
            
            {/* Bar Chart: Score par Processus */}
            <article className="xl:col-span-8 bg-[#0F172A] border border-white/5 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px]" aria-hidden="true" />
              
              <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 relative z-10">
                <div className="p-2 md:p-3 bg-blue-600/10 rounded-xl md:rounded-2xl text-blue-400">
                  <TrendingUp size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
                </div>
                <h3 className="text-sm md:text-base font-black uppercase tracking-widest italic m-0 text-white">
                  Score de conformité par Processus (%)
                </h3>
              </div>
              
              <div className="h-64 md:h-80 w-full relative z-10" role="img" aria-label="Graphique en barres: score de conformité par processus">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.byProcess || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="process" 
                      stroke="#64748b" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false} 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37, 99, 235, 0.1)' }} />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={32} aria-label="Scores de conformité">
                      {(data?.byProcess || []).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.score < 70 ? '#ef4444' : entry.score < 85 ? '#f59e0b' : '#10b981'} 
                          fillOpacity={0.9} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            {/* Side Panel: Pie + Trend */}
            <div className="xl:col-span-4 flex flex-col gap-4 md:gap-6">
              
              {/* Pie Chart: Répartition NC */}
              <article className="bg-[#0F172A] border border-white/5 p-6 rounded-2xl md:rounded-3xl shadow-xl flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 mb-4">
                  Répartition des NC
                </h4>
                <div className="h-40" role="img" aria-label="Graphique circulaire: répartition des non-conformités">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                        aria-label="Répartition des non-conformités par gravité"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`pie-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4" role="list" aria-label="Légende du graphique circulaire">
                  {pieData.map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-[8px] text-slate-500" role="listitem">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                      {item.name}
                    </span>
                  ))}
                </div>
              </article>
              
              {/* Trend Chart */}
              <article className="bg-[#0F172A] border border-white/5 p-6 rounded-2xl md:rounded-3xl shadow-xl flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest italic text-slate-500 mb-4">
                  Évolution 6 mois
                </h4>
                <div className="h-32" role="img" aria-label="Graphique en aire: évolution du score sur 6 mois">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.trend || []}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={8} tickLine={false} axisLine={false} domain={[60, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#scoreGradient)" 
                        aria-label="Évolution du score de conformité"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>
              
            </div>
          </section>

          {/* TABLEAU RÉCAPITULATIF */}
          <section className="bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden" aria-label="Détail des processus audités">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-3">
                <FileText className="text-blue-400 w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
                Détail par Processus
              </h3>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">
                {data?.byProcess?.length || 0} processus analysés
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left" role="table">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                    <th scope="col" className="p-4">Processus</th>
                    <th scope="col" className="p-4 text-center">Audits</th>
                    <th scope="col" className="p-4 text-center">Score</th>
                    <th scope="col" className="p-4 text-center">NC</th>
                    <th scope="col" className="p-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="text-[10px]">
                  {(data?.byProcess || []).map((proc, index) => {
                    const status = proc.score >= 90 ? { label: 'Excellent', color: 'text-emerald-400' } :
                                  proc.score >= 75 ? { label: 'Bon', color: 'text-blue-400' } :
                                  proc.score >= 60 ? { label: 'À améliorer', color: 'text-amber-400' } :
                                  { label: 'Critique', color: 'text-rose-400' };
                    
                    return (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors" role="row">
                        <td className="p-4 font-black uppercase text-white">{proc.process}</td>
                        <td className="p-4 text-center text-slate-500">{proc.audits}</td>
                        <td className="p-4 text-center">
                          <span className={cn(
                            "font-black",
                            proc.score >= 90 ? "text-emerald-400" :
                            proc.score >= 75 ? "text-blue-400" :
                            proc.score >= 60 ? "text-amber-400" : "text-rose-400"
                          )}>
                            {proc.score}%
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {proc.ncCount > 0 ? (
                            <span className="text-rose-400 font-bold">{proc.ncCount}</span>
                          ) : (
                            <span className="text-emerald-400" aria-label="Aucune non-conformité">✓</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={cn("font-black uppercase tracking-wider", status.color)}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="shrink-0 px-4 md:px-6 py-4 border-t border-white/5 text-center bg-[#0B0F1A]">
         <p className="text-[8px] md:text-[9px] font-black text-slate-700 uppercase italic tracking-widest m-0 leading-relaxed">
           Qualisoft Satellite Surveillance • 🛰️ SDE-OS 2026
         </p>
      </footer>

      {/* STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(37, 99, 235, 0.3); 
          border-radius: 10px; 
        }
        :focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        /* Recharts tooltip override */
        .recharts-tooltip-wrapper { outline: none !important; }
      `}</style>
    </div>
  );
}