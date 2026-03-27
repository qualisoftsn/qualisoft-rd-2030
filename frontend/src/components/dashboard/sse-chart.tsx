/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📈 MODULE : SSEChart (Accidentology Timeline)
 * RÔLE : Visualisation temporelle de l'accidentologie
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { cn } from '@/core/utils/cn';
import { AlertCircle, TrendingUp, ShieldAlert } from 'lucide-react';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface SSEDataPoint {
  CS_Date?: string;
  createdAt?: string;
  SSE_DateEvent?: string;
  count?: number;
  type?: string;
  [key: string]: unknown;
}

export interface ChartDataPoint {
  name: string;
  incidents: number;
  fullName: string;
}

export interface SSEChartProps {
  data: SSEDataPoint[];
  className?: string;
  height?: number;
  showGrid?: boolean;
  onPointClick?: (data: ChartDataPoint) => void;
}

export interface EmptyStateProps {
  message: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const MONTHS = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];

const CustomTooltip = ({ 
  active, 
  payload, 
  label 
}: { 
  active?: boolean; 
  payload?: Array<{ value: number; color: string }>; 
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl p-4 md:p-5 lg:p-6"
        role="tooltip"
        aria-label={`Nombre d'incidents en ${label}`}
      >
        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
          {label}
        </p>
        <p className="text-lg md:text-xl lg:text-2xl font-black text-blue-400 italic tabular-nums">
          {payload[0].value} {payload[0].value > 1 ? 'INCIDENTS' : 'INCIDENT'}
        </p>
      </div>
    );
  }
  return null;
};

// ============================================================================
// SOUS-COMPOSANT : EMPTY STATE
// ============================================================================

function EmptyState({ message }: EmptyStateProps) {
  return (
    <div 
      className="h-[300px] md:h-[350px] lg:h-[400px] flex flex-col items-center justify-center text-center p-4 md:p-6 lg:p-8"
      role="status"
      aria-label={message}
    >
      <ShieldAlert size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-slate-700 mb-3 md:mb-4" aria-hidden="true" />
      <p className="text-[9px] md:text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
        {message}
      </p>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function SSEChart({ 
  data, 
  className, 
  height = 400,
  showGrid = true,
  onPointClick 
}: SSEChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    const counts: Record<string, number> = {};
    const fullNames: Record<string, string> = {};

    data.forEach((event) => {
      try {
        const dateStr = event.SSE_DateEvent || event.CS_Date || event.createdAt;
        if (!dateStr) return;
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return;
        
        const monthIndex = date.getMonth();
        const monthLabel = MONTHS[monthIndex];
        counts[monthLabel] = (counts[monthLabel] || 0) + 1;
        fullNames[monthLabel] = date.toLocaleDateString('fr-SN', { month: 'long', year: 'numeric' });
      } catch {
        // Skip invalid dates
        return;
      }
    });

    // Ensure all months are represented (for continuous timeline)
    const result: ChartDataPoint[] = MONTHS.map((month) => ({
      name: month,
      incidents: counts[month] || 0,
      fullName: fullNames[month] || month,
    }));

    return result;
  }, [data]);

  const totalIncidents = useMemo(() => {
    return chartData.reduce((sum, point) => sum + point.incidents, 0);
  }, [chartData]);

  const hasData = totalIncidents > 0;

  const handlePointClick = (point: ChartDataPoint) => {
    if (point.incidents > 0) {
      setHoveredPoint(point);
      onPointClick?.(point);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, point: ChartDataPoint) => {
    if ((e.key === 'Enter' || e.key === ' ') && point.incidents > 0) {
      e.preventDefault();
      handlePointClick(point);
    }
  };

  if (!hasData) {
    return (
      <div className={cn("w-full font-sans italic animate-in fade-in duration-1000", className)}>
        <EmptyState message="Aucun incident enregistré" />
      </div>
    );
  }

  return (
    <div 
      className={cn("w-full font-sans italic animate-in fade-in duration-1000", className)}
      style={{ height: `${height}px` }}
      role="img"
      aria-label={`Graphique d'accidentologie: ${totalIncidents} incidents sur 12 mois`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={chartData} 
          margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="matrixGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#e2e8f0" 
              opacity={0.2} 
            />
          )}

          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ 
              fill: '#64748b', 
              fontSize: 10, 
              fontWeight: 900, 
              letterSpacing: '0.1em' 
            }}
            dy={15}
            aria-label="Mois"
          />

          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ 
              fill: '#64748b', 
              fontSize: 10, 
              fontWeight: 900 
            }} 
            dx={-10}
            allowDecimals={false}
            aria-label="Nombre d'incidents"
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ 
              stroke: '#3b82f6', 
              strokeWidth: 2, 
              strokeDasharray: '6 6',
              opacity: 0.5
            }}
          />

          <Area
            type="monotone"
            dataKey="incidents"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#matrixGradient)"
            animationDuration={2500}
            strokeLinecap="round"
            activeDot={{
              r: 6,
              fill: '#3b82f6',
              stroke: '#fff',
              strokeWidth: 2,
              cursor: 'pointer'
            }}
            onClick={(data) => {
              if (data && typeof data === 'object' && 'name' in data) {
                handlePointClick(data as ChartDataPoint);
              }
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      {totalIncidents > 0 && (
        <div 
          className="mt-4 flex items-center justify-between text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest"
          role="status"
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <TrendingUp size={10} className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400" aria-hidden="true" />
            <span>Total: <span className="text-blue-400 tabular-nums">{totalIncidents}</span> incidents</span>
          </div>
          <span className="text-slate-600">Période: 12 mois</span>
        </div>
      )}
    </div>
  );
}

export default SSEChart;