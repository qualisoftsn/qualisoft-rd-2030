/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 COMPOSANT : PIE-CHART DÉCHETS MATRIX
 * -------------------------------------------------------------------------
 * RÔLE : Analyse granulométrique des flux de sortie (§8.1 ISO 14001)
 * VERSION : 2.0 - Typing strict + Accessibilité + Fallback Recharts
 * DESIGN : Donut chart interactif, légende accessible, WCAG AA
 * RÉVISION : 19 Mars 2026 | 18:00 GMT
 * -------------------------------------------------------------------------
 */

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, TooltipProps } from 'recharts';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WasteEntry {
  WAS_Weight: number;
  WAS_Unit: 'kg' | 'T';
  WAS_Type: 'DANGEREUX' | 'RECYCLABLE' | 'MENAGER' | 'INDUSTRIEL' | 'AUTRE';
  WAS_SiteId: string;
  WAS_Treatment: 'RECYCLAGE' | 'INCINERATION' | 'ENFOUISSEMENT' | 'VALORISATION';
}

export interface WasteBreakdownProps {
  wastes: WasteEntry[];
  siteId: string;
  className?: string;
  'aria-label'?: string;
}

interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
  unit: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const WASTE_COLORS: Record<NonNullable<WasteEntry['WAS_Type']>, string> = {
  RECYCLABLE: '#10b981',   // emerald-500
  DANGEREUX: '#f43f5e',    // rose-500
  MENAGER: '#64748b',      // slate-500
  INDUSTRIEL: '#8b5cf6',   // purple-500
  AUTRE: '#94a3b8',        // slate-400
};

const WASTE_LABELS: Record<string, string> = {
  RECYCLABLE: 'Recyclable',
  DANGEREUX: 'Dangereux',
  MENAGER: 'Ménager',
  INDUSTRIEL: 'Industriel',
  AUTRE: 'Autre',
};

// ============================================================================
// CUSTOM TOOLTIP (Typé)
// ============================================================================

interface WasteTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
}

function WasteTooltip({ active, payload }: WasteTooltipProps) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
  const formattedValue = new Intl.NumberFormat('fr-SN').format(entry.value);

  return (
    <div 
      className="bg-[#0B0F1A] border border-white/10 rounded-xl p-4 shadow-2xl"
      role="tooltip"
      aria-label={`Détails pour ${entry.name}`}
    >
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
        {WASTE_LABELS[entry.name] || entry.name}
      </p>
      <p className="text-lg font-black italic text-white m-0">
        {formattedValue} kg
      </p>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} aria-hidden="true" />
        <span className="text-[8px] text-slate-500 uppercase tracking-wider">
          {entry.name.toLowerCase()}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function WasteBreakdown({ 
  wastes, 
  siteId, 
  className,
  'aria-label': ariaLabel 
}: WasteBreakdownProps) {
  
  const chartData = useMemo((): ChartDataPoint[] => {
    const wasteByType: Record<string, { value: number; unit: string }> = {};
    
    wastes
      .filter(w => siteId === 'ALL' || w.WAS_SiteId === siteId)
      .forEach(w => {
        const type = w.WAS_Type || 'AUTRE';
        const weight = Number(w.WAS_Weight) || 0;
        const unit = w.WAS_Unit || 'kg';
        
        if (!wasteByType[type]) {
          wasteByType[type] = { value: 0, unit };
        }
        wasteByType[type].value += weight;
      });
    
    return Object.entries(wasteByType)
      .filter(([_, data]) => data.value > 0)
      .map(([type, data]) => ({
        name: type,
        value: Math.round(data.value),
        color: WASTE_COLORS[type as keyof typeof WASTE_COLORS] || WASTE_COLORS.AUTRE,
        unit: data.unit,
      }))
      .sort((a, b) => b.value - a.value); // Tri décroissant
  }, [wastes, siteId]);

  // Fallback si pas de données
  if (chartData.length === 0) {
    return (
      <div className={cn("h-full w-full flex items-center justify-center", className)} role="status">
        <p className="text-[10px] text-slate-500 italic">Aucune donnée de déchets disponible</p>
      </div>
    );
  }

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div 
      className={cn("h-full w-full min-h-[300px]", className)}
      role="region"
      aria-label={ariaLabel || "Répartition des déchets par type"}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart aria-label="Graphique en donut de la répartition des déchets">
          <Pie
            data={chartData}
            cx="50%" 
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={8}
            dataKey="value"
            stroke="none"
            aria-label="Données de répartition des déchets"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="#0B0F1A"
                strokeWidth={2}
                aria-label={`${WASTE_LABELS[entry.name] || entry.name}: ${entry.value} kg`}
              />
            ))}
          </Pie>
          
          <Tooltip content={<WasteTooltip />} />
          
          <Legend 
            verticalAlign="bottom" 
            height={40}
            iconType="circle"
            iconSize={10}
            formatter={(value) => {
              const entry = chartData.find(d => d.name === value);
              const percent = total > 0 ? Math.round((entry?.value || 0) / total * 100) : 0;
              return (
                <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                  {WASTE_LABELS[value] || value} ({percent}%)
                </span>
              );
            }}
            wrapperStyle={{ paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Valeur totale au centre (optionnel) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-[8px] text-slate-500 uppercase tracking-wider">Total</p>
          <p className="text-lg font-black italic text-white">
            {new Intl.NumberFormat('fr-SN').format(total)} kg
          </p>
        </div>
      </div>
    </div>
  );
}