/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 📈 MODULE : SSE CHART (VISUALISATION DE L'ACCIDENTOLOGIE)
 * -------------------------------------------------------------------------
 * FONCTION : Analyse prédictive et historique des incidents (§10.2 ISO 45001).
 * RÔLE : Transformer les signaux faibles du SDE en indicateurs décisionnels.
 * ISOLATION : Agrégation des données filtrée par le périmètre du Tenant.
 */

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SSEChartProps {
  data: any[]; // Registre des événements SSE scellés
}

export function SSEChart({ data }: SSEChartProps) {
  /**
   * 🧪 PROTOCOLE D'AGRÉGATION MATRIX
   * On transforme les événements bruts en série temporelle sur les 6 derniers mois.
   */
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const months = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];
    const counts: Record<string, number> = {};

    // Initialisation du référentiel temporel
    data.forEach((event) => {
      const date = new Date(event.CS_Date || event.createdAt);
      const monthLabel = months[date.getMonth()];
      counts[monthLabel] = (counts[monthLabel] || 0) + 1;
    });

    return Object.keys(counts).map((key) => ({
      name: key,
      incidents: counts[key],
    }));
  }, [data]);

  return (
    <div className="h-100 w-full bg-transparent font-sans italic">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          {/* Grille de structure Matrix */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />

          {/* 🛠️ CORRECTION TYPESCRIPT : AXE X SCELLÉ */}
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            // On utilise tickFormatter pour l'uppercase au lieu de textTransform CSS
            tickFormatter={(val) => val.toUpperCase()}
            tick={{ 
              fill: '#64748b', 
              fontSize: 10, 
              fontWeight: 900,
            }}
            dy={15}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
            dx={-10}
          />

          {/* TOOLTIP ÉLITE : INFOBULLE SDE */}
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              border: 'none',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              padding: '20px',
            }}
            itemStyle={{
              color: '#3b82f6',
              fontSize: '10px',
              fontWeight: '900',
              textTransform: 'uppercase',
              fontStyle: 'italic',
            }}
            labelStyle={{
              color: '#94a3b8',
              fontSize: '9px',
              fontWeight: '900',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}
            cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
          />

          {/* AIRE DE DONNÉES : GRADIENT SOUVERAIN */}
          <defs>
            <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="incidents"
            stroke="#2563EB"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorIncidents)"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}