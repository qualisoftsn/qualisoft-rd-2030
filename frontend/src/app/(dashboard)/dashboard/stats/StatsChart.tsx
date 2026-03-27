/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📊 COMPOSANT : CARTOGRAPHIE DES RESSOURCES (ISO 9001 §4.4)
 * RÔLE : Visualisation comparative Audits vs Départements
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface SiteData {
  SiteName?: string;
  _count?: {
    audits?: number;
    departement?: number;
  };
}

export interface ChartData {
  name: string;
  audits: number;
  departements: number;
}

export interface StatsChartProps {
  data?: SiteData[];
  className?: string;
}

export interface LegendItemProps {
  label: string;
  color: 'blue' | 'amber';
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_DATA: ChartData[] = [
  { name: 'SITE ALPHA', audits: 12, departements: 4 },
  { name: 'SITE BETA', audits: 8, departements: 3 },
  { name: 'SIEGE', audits: 15, departements: 6 }
];

const COLORS = {
  audits: '#2563eb',
  departements: '#f59e0b'
};

// ============================================================================
// SOUS-COMPOSANT : LEGEND ITEM
// ============================================================================

function LegendItem({ label, color }: LegendItemProps) {
  const colorClasses: Record<'blue' | 'amber', string> = {
    blue: 'bg-blue-600 text-blue-400',
    amber: 'bg-amber-500 text-amber-400'
  };

  return (
    <div className="flex items-center gap-1.5 md:gap-2" role="listitem">
      <div 
        className={cn("w-2.5 h-2.5 md:w-3 md:h-3 rounded-full", colorClasses[color])} 
        aria-hidden="true" 
      />
      <span className="text-[9px] md:text-[10px] text-slate-400 font-black italic uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function StatsChart({ data = [], className }: StatsChartProps) {
  const chartData: ChartData[] = useMemo(() => {
    if (data.length > 0) {
      return data.map((site: SiteData) => ({
        name: site.SiteName || 'Nœud inconnu',
        audits: site._count?.audits || 0,
        departements: site._count?.departement || 0,
      }));
    }
    return DEFAULT_DATA;
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="bg-[#0B0F1A] rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/10 shadow-2xl"
          role="tooltip"
        >
          <p className="text-[10px] md:text-[11px] font-black text-white italic mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={index} 
              className="text-[9px] md:text-[10px] font-black italic m-0"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <article 
      className={cn(
        "w-full h-full bg-slate-900/40 p-4 md:p-6 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[4rem] border border-white/5 shadow-2xl flex flex-col text-left focus:outline-none focus:ring-2 focus:ring-blue-400",
        className
      )}
      role="figure"
      aria-label="Cartographie des implantations : audits vs départements"
      tabIndex={0}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-10" role="group" aria-label="Légende du graphique">
        <h3 className="text-lg md:text-xl lg:text-2xl font-black italic m-0 uppercase tracking-tighter">
          Cartographie <span className="text-blue-400">Implantations</span>
        </h3>
        <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-6" role="list">
          <LegendItem label="Audits" color="blue" />
          <LegendItem label="Dép." color="amber" />
        </div>
      </div>

      <div className="flex-1 min-h-0" role="img" aria-label="Graphique en barres comparant audits et départements par site">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(255,255,255,0.05)" 
            />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ 
                fill: '#475569', 
                fontSize: 10, 
                fontWeight: 900, 
                fontStyle: 'italic' 
              }}
              height={40}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ 
                fill: '#475569', 
                fontSize: 10, 
                fontWeight: 900, 
                fontStyle: 'italic' 
              }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="audits" 
              fill={COLORS.audits} 
              radius={[6, 6, 0, 0]} 
              maxBarSize={40}
              name="Audits"
            />
            <Bar 
              dataKey="departements" 
              fill={COLORS.departements} 
              radius={[6, 6, 0, 0]} 
              maxBarSize={40}
              name="Départements"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}