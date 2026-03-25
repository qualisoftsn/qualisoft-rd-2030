/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 COMPOSANT : GRAPH DE CONSOMMATION ÉLITE (SDE-CORE)
 * -------------------------------------------------------------------------
 * RÔLE : Analyse comparative Énergie/Eau pour le SMI (§9.1.1 ISO 14001)
 * VERSION : 2.0 - Typing strict + Accessibilité + Fallback Recharts
 * DESIGN : AreaChart Matrix avec gradients, Responsive PWA, WCAG AA
 * RÉVISION : 19 Mars 2026 | 17:00 GMT
 * -------------------------------------------------------------------------
 */

import React, { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, AreaChart, TooltipProps
} from 'recharts';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ConsumptionEntry {
  CON_Value: number;
  CON_Type: 'ELECTRICITE' | 'EAU' | 'GAZ' | 'FIOUL' | 'AUTRE';
  CON_Unit: 'kWh' | 'm³' | 'L' | 'kg';
  CON_Month: number;
  CON_Year: number;
  CON_SiteId: string;
  CON_Site?: { S_Name: string };
}

export interface ConsumptionChartProps {
  consumptions: ConsumptionEntry[];
  period: 'MONTH' | 'QUARTER' | 'YEAR';
  siteId: string;
  className?: string;
  'aria-label'?: string;
}

interface ChartDataPoint {
  month: string;
  monthLabel: string;
  energy: number;
  water: number;
  rawDate: Date;
}

// ============================================================================
// UTILITAIRES
// ============================================================================

const ENERGY_KEYWORDS = ['electric', 'énergie', 'éner', 'gaz', 'fioul'];
const WATER_KEYWORDS = ['eau', 'water', 'h2o'];

const isEnergyType = (type: string): boolean => 
  ENERGY_KEYWORDS.some(kw => type.toLowerCase().includes(kw));

const isWaterType = (type: string): boolean => 
  WATER_KEYWORDS.some(kw => type.toLowerCase().includes(kw));

const formatValue = (value: number, type: 'energy' | 'water'): string => {
  return new Intl.NumberFormat('fr-SN').format(value) + (type === 'energy' ? ' kWh' : ' m³');
};

// ============================================================================
// CUSTOM TOOLTIP (Typé)
// ============================================================================

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div 
      className="bg-[#0F172A] border border-white/10 rounded-xl p-4 shadow-2xl"
      role="tooltip"
      aria-label={`Données pour ${label}`}
    >
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
        {label}
      </p>
      {payload.map((entry, index) => (
        <p key={index} className="text-[10px] font-bold flex items-center gap-2" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden="true" />
          {entry.name}: {formatValue(entry.value, entry.name.includes('ÉNERGIE') ? 'energy' : 'water')}
        </p>
      ))}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ConsumptionChart({ 
  consumptions, 
  period, 
  siteId, 
  className,
  'aria-label': ariaLabel 
}: ConsumptionChartProps) {
  
  const chartData = useMemo((): ChartDataPoint[] => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    
    const monthsToShow = period === 'MONTH' ? 1 : period === 'QUARTER' ? 3 : 12;
    const data: ChartDataPoint[] = [];
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const monthNum = targetDate.getMonth() + 1;
      const yearNum = targetDate.getFullYear();
      
      const siteFilter = (c: ConsumptionEntry): boolean => 
        siteId === 'ALL' || c.CON_SiteId === siteId;
      
      const energy = consumptions
        .filter(c => c.CON_Month === monthNum && c.CON_Year === yearNum && siteFilter(c))
        .filter(c => isEnergyType(c.CON_Type))
        .reduce((sum, c) => sum + (Number(c.CON_Value) || 0), 0);
      
      const water = consumptions
        .filter(c => c.CON_Month === monthNum && c.CON_Year === yearNum && siteFilter(c))
        .filter(c => isWaterType(c.CON_Type))
        .reduce((sum, c) => sum + (Number(c.CON_Value) || 0), 0);
      
      data.push({
        month: targetDate.toISOString().slice(0, 7), // YYYY-MM for sorting
        monthLabel: targetDate.toLocaleString('fr-FR', { month: 'short' }).toUpperCase(),
        energy: Math.round(energy),
        water: Math.round(water),
        rawDate: targetDate,
      });
    }
    return data;
  }, [consumptions, period, siteId]);

  // Fallback si pas de données
  if (chartData.length === 0) {
    return (
      <div className={cn("h-full w-full flex items-center justify-center", className)} role="status">
        <p className="text-[10px] text-slate-500 italic">Aucune donnée de consommation disponible</p>
      </div>
    );
  }

  return (
    <div 
      className={cn("h-full w-full min-h-[300px] animate-in fade-in duration-500", className)}
      role="region"
      aria-label={ariaLabel || "Graphique de consommation énergie et eau"}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          aria-label="Évolution mensuelle des consommations"
        >
          <defs>
            {/* Gradients Matrix Néon */}
            <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.05)" 
            vertical={false} 
          />

          <XAxis 
            dataKey="monthLabel" 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={9} 
            fontWeight={700} 
            axisLine={false} 
            tickLine={false}
            dy={10}
            aria-label="Mois"
          />

          <YAxis 
            stroke="rgba(255,255,255,0.4)" 
            fontSize={9} 
            fontWeight={700} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(value) => new Intl.NumberFormat('fr-SN', { notation: 'compact' }).format(value)}
            aria-label="Valeur de consommation"
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />

          {/* ÉNERGIE AREA */}
          <Area 
            type="monotone" 
            dataKey="energy" 
            stroke="#f59e0b" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorEnergy)" 
            name="ÉNERGIE (kWh)"
            animationDuration={1000}
            isAnimationActive={true}
          />

          {/* EAU AREA */}
          <Area 
            type="monotone" 
            dataKey="water" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorWater)" 
            name="EAU (m³)"
            animationDuration={1000}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Légende accessible */}
      <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-white/5" role="list" aria-label="Légende du graphique">
        <span className="flex items-center gap-2 text-[8px] font-black uppercase tracking-wider text-amber-400" role="listitem">
          <span className="w-3 h-0.5 bg-amber-500 rounded-full" aria-hidden="true" /> Énergie
        </span>
        <span className="flex items-center gap-2 text-[8px] font-black uppercase tracking-wider text-blue-400" role="listitem">
          <span className="w-3 h-0.5 bg-blue-500 rounded-full" aria-hidden="true" /> Eau
        </span>
      </div>
    </div>
  );
}
