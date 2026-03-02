/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface WasteBreakdownProps {
  wastes: any[];
  period: 'MONTH' | 'QUARTER' | 'YEAR';
  siteId: string;
}

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6'];

export default function WasteBreakdown({ wastes, period, siteId }: WasteBreakdownProps) {
  const chartData = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthsToShow = period === 'MONTH' ? 1 : period === 'QUARTER' ? 3 : 12;
    const wasteByType: Record<string, number> = {};
    
    wastes.forEach((waste: any) => {
      const inPeriod = period === 'YEAR' 
        ? waste.WAS_Year === currentYear 
        : waste.WAS_Year === currentYear && (
          period === 'MONTH' ? waste.WAS_Month === (now.getMonth() + 1) : Math.floor((waste.WAS_Month - 1) / 3) === Math.floor(now.getMonth() / 3)
        );
      
      const matchesSite = siteId === 'ALL' || waste.WAS_SiteId === siteId;
      
      if (inPeriod && matchesSite) {
        const type = (waste.WAS_Type || 'AUTRE').toUpperCase();
        wasteByType[type] = (wasteByType[type] || 0) + (Number(waste.WAS_Weight) || 0);
      }
    });
    
    return Object.entries(wasteByType).map(([name, value]) => ({ name, value }));
  }, [wastes, period, siteId]);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%" cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={8}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px', fontWeight: '900' }}
          />
          <Legend 
            verticalAlign="bottom" 
            formatter={(value) => <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}