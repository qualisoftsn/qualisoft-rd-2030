/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ConsumptionChartProps {
  consumptions: any[];
  period: 'MONTH' | 'QUARTER' | 'YEAR';
  siteId: string;
}

export default function ConsumptionChart({ consumptions, period, siteId }: ConsumptionChartProps) {
  const chartData = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthsToShow = period === 'MONTH' ? 1 : period === 'QUARTER' ? 3 : 12;
    
    const data = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(currentYear, now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      
      const siteFilter = siteId === 'ALL' ? () => true : (c: any) => c.CON_SiteId === siteId;
      
      const energy = consumptions
        .filter(c => c.CON_Month === month && c.CON_Year === currentYear && siteFilter(c))
        .filter(c => c.CON_Type.toLowerCase().match(/electric|énergie/))
        .reduce((sum: number, c: any) => sum + (Number(c.CON_Value) || 0), 0);
      
      const water = consumptions
        .filter(c => c.CON_Month === month && c.CON_Year === currentYear && siteFilter(c))
        .filter(c => c.CON_Type.toLowerCase().match(/eau|water/))
        .reduce((sum: number, c: any) => sum + (Number(c.CON_Value) || 0), 0);
      
      data.push({
        month: date.toLocaleString('fr-FR', { month: 'short' }).toUpperCase(),
        energy: Math.round(energy),
        water: Math.round(water)
      });
    }
    return data;
  }, [consumptions, period, siteId]);

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px', fontWeight: '900', fontStyle: 'italic' }}
            labelStyle={{ color: 'white', marginBottom: '8px' }}
          />
          <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 8 }} name="ÉNERGIE (kWh)" />
          <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 8 }} name="EAU (m³)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}