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
  // Préparation des données pour le graphique
  const chartData = React.useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthsToShow = period === 'MONTH' ? 1 : period === 'QUARTER' ? 3 : 12;
    
    const data = [];
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(currentYear, now.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      
      // Filtrer les consommations pour ce mois et site
      const siteFilter = siteId === 'ALL' ? () => true : (c: any) => c.CON_SiteId === siteId;
      
      const energy = consumptions
        .filter(c => c.CON_Month === month && c.CON_Year === currentYear && siteFilter(c))
        .filter(c => c.CON_Type.toLowerCase().includes('electric') || c.CON_Type.toLowerCase().includes('énergie'))
        .reduce((sum: number, c: any) => sum + c.CON_Value, 0);
      
      const water = consumptions
        .filter(c => c.CON_Month === month && c.CON_Year === currentYear && siteFilter(c))
        .filter(c => c.CON_Type.toLowerCase().includes('eau') || c.CON_Type.toLowerCase().includes('water'))
        .reduce((sum: number, c: any) => sum + c.CON_Value, 0);
      
      data.push({
        month: date.toLocaleString('fr-FR', { month: 'short' }),
        energy: Math.round(energy),
        water: Math.round(water)
      });
    }
    
    return data;
  }, [consumptions, period, siteId]);

  return (
    <div className="h-87.5">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="month" 
            stroke="rgba(255,255,255,0.6)" 
            fontSize={12} 
            fontWeight="bold"
          />
          <YAxis 
            stroke="rgba(255,255,255,0.6)" 
            fontSize={12} 
            fontWeight="bold"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(11, 15, 26, 0.95)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px'
            }}
            labelStyle={{ color: 'white', fontWeight: 'bold' }}
            itemStyle={{ color: 'white' }}
          />
          <Line 
            type="monotone" 
            dataKey="energy" 
            stroke="#f59e0b" 
            strokeWidth={3} 
            dot={{ fill: '#f59e0b', strokeWidth: 2 }}
            activeDot={{ r: 8 }}
            name="Énergie (kWh)"
          />
          <Line 
            type="monotone" 
            dataKey="water" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={{ fill: '#3b82f6', strokeWidth: 2 }}
            activeDot={{ r: 8 }}
            name="Eau (m³)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}