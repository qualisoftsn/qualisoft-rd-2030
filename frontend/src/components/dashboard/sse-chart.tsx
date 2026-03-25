/* eslint-disable @typescript-eslint/no-explicit-any */
//* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/purity */
/**
 * 📈 MODULE : SSEChart.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Visualisation temporelle de l'accidentologie.
 * PHILOSOPHIE : Signaux faibles et tendances §10.2 ISO 45001.
 * RÉVISION : 02 Mars 2026 | 18:48 GMT
 */

"use client";

import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer} from 'recharts';

interface SSEChartProps {
  data: any[]; // Registre des sinistres injecté par le Kernel
}

export function SSEChart({ data }: SSEChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const months = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];
    const counts: Record<string, number> = {};

    data.forEach((event) => {
      const date = new Date(event.CS_Date || event.createdAt || Date.now());
      const monthLabel = months[date.getMonth()];
      counts[monthLabel] = (counts[monthLabel] || 0) + 1;
    });

    return Object.keys(counts).map((key) => ({
      name: key,
      incidents: counts[key],
    }));
  }, [data]);

  return (
    <div className="h-87.5 w-full bg-transparent font-sans italic animate-in fade-in duration-1000">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="matrixGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />

          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(v) => v.toUpperCase()}
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }}
            dy={15}
          />

          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} 
            dx={-10}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '16px 24px',
            }}
            itemStyle={{
              color: '#3b82f6',
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              fontStyle: 'italic',
            }}
            labelStyle={{
              color: '#94a3b8',
              fontSize: '9px',
              fontWeight: '900',
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}
            cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '6 6' }}
          />

          <Area
            type="monotone"
            dataKey="incidents"
            stroke="#2563EB"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#matrixGradient)"
            animationDuration={2500}
            strokeLinecap="round"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
