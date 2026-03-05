/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 COMPOSANT : PIE-CHART DÉCHETS MATRIX
 * -------------------------------------------------------------------------
 * RÔLE : Analyse granulométrique des flux de sortie (§8.1 ISO 14001).
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 05:18 GMT
 */

'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6'];

export default function WasteBreakdown({ wastes, siteId }: any) {
  const chartData = useMemo(() => {
    const wasteByType: Record<string, number> = {};
    wastes.filter((w:any) => siteId === 'ALL' || w.WAS_SiteId === siteId).forEach((w: any) => {
      const type = (w.WAS_Type || 'AUTRE').toUpperCase();
      wasteByType[type] = (wasteByType[type] || 0) + (Number(w.WAS_Weight) || 0);
    });
    return Object.entries(wasteByType).map(([name, value]) => ({ name, value }));
  }, [wastes, siteId]);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={10}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '10px', fontStyle: 'italic', fontWeight: '900' }}
          />
          <Legend 
            verticalAlign="bottom" 
            iconType="circle"
            formatter={(value) => <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}