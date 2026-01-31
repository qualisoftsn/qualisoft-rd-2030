/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface WasteBreakdownProps {
  wastes: any[];
  period: 'MONTH' | 'QUARTER' | 'YEAR';
  siteId: string;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

export default function WasteBreakdown({ wastes, period, siteId }: WasteBreakdownProps) {
  // Préparation des données pour le graphique
  const chartData = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthsToShow = period === 'MONTH' ? 1 : period === 'QUARTER' ? 3 : 12;
    
    // Regrouper les déchets par type
    const wasteByType: any = {};
    
    wastes.forEach((waste: any) => {
      const wasteMonth = waste.WAS_Month;
      const wasteYear = waste.WAS_Year;
      
      // Vérifier la période
      const inPeriod = monthsToShow === 1 
        ? wasteMonth === now.getMonth() + 1 && wasteYear === currentYear
        : monthsToShow === 3
        ? Math.floor((wasteMonth - 1) / 3) === Math.floor(now.getMonth() / 3) && wasteYear === currentYear
        : wasteYear === currentYear;
      
      // Vérifier le site
      const matchesSite = siteId === 'ALL' || waste.WAS_SiteId === siteId;
      
      if (inPeriod && matchesSite) {
        const type = waste.WAS_Type;
        if (!wasteByType[type]) {
          wasteByType[type] = { name: type, value: 0 };
        }
        wasteByType[type].value += waste.WAS_Weight;
      }
    });
    
    return Object.values(wasteByType).map((item: any, idx) => ({
      ...item,
      fill: COLORS[idx % COLORS.length]
    }));
  }, [wastes, period, siteId]);

  return (
    <div className="h-87.5">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(11, 15, 26, 0.95)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px'
            }}
            labelStyle={{ color: 'white', fontWeight: 'bold' }}
            itemStyle={{ color: 'white' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value: any) => (
              <span className="text-[10px] font-black text-white/80">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}