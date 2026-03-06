//* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 💡 COMPOSANT : GRAPH DE CONSOMMATION ÉLITE (SDE-CORE)
 * -------------------------------------------------------------------------
 * RÔLE : Analyse comparative Énergie/Eau pour le SMI (§9.1.1 ISO 14001).
 * DESIGN : AreaChart Matrix avec gradients, Responsive PWA.
 * FIX : Typage rigoureux pour éviter l'erreur 'never' sur CON_Value.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 11:20 GMT
 */

'use client';

import React, { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, AreaChart} from 'recharts';

// --- INTERFACE SCELLÉE ---
interface ConsumptionEntry {
  CON_Value: number;
  CON_Type: string;
  CON_Month: number;
  CON_Year: number;
  CON_SiteId: string;
}

interface ConsumptionChartProps {
  consumptions: ConsumptionEntry[];
  period: 'MONTH' | 'QUARTER' | 'YEAR';
  siteId: string;
}

export default function ConsumptionChart({ consumptions, period, siteId }: ConsumptionChartProps) {
  
  const chartData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Détermination de la profondeur temporelle
    const monthsToShow = period === 'MONTH' ? 1 : period === 'QUARTER' ? 3 : 12;
    
    const data = [];
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      // Calcul du mois et de l'année glissante
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const m = targetDate.getMonth() + 1;
      const y = targetDate.getFullYear();
      
      const siteFilter = siteId === 'ALL' ? () => true : (c: ConsumptionEntry) => c.CON_SiteId === siteId;
      
      // Filtrage Énergie (§ ISO : Électricité, Gaz, etc.)
      const energy = consumptions
        .filter(c => c.CON_Month === m && c.CON_Year === y && siteFilter(c))
        .filter(c => (c.CON_Type || '').toLowerCase().match(/electric|énergie|éner/))
        .reduce((sum, c) => sum + (Number(c.CON_Value) || 0), 0);
      
      // Filtrage Ressources Eau
      const water = consumptions
        .filter(c => c.CON_Month === m && c.CON_Year === y && siteFilter(c))
        .filter(c => (c.CON_Type || '').toLowerCase().match(/eau|water/))
        .reduce((sum, c) => sum + (Number(c.CON_Value) || 0), 0);
      
      data.push({
        month: targetDate.toLocaleString('fr-FR', { month: 'short' }).toUpperCase(),
        energy: Math.round(energy),
        water: Math.round(water)
      });
    }
    return data;
  }, [consumptions, period, siteId]);

  return (
    <div className="h-full w-full min-h-75 animate-in fade-in duration-700">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {/* Gradients Matrix Néon */}
            <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.03)" 
            vertical={false} 
          />

          <XAxis 
            dataKey="month" 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={9} 
            fontWeight="900" 
            axisLine={false} 
            tickLine={false}
            dy={10}
          />

          <YAxis 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={9} 
            fontWeight="900" 
            axisLine={false} 
            tickLine={false} 
          />

          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0F172A', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '12px', 
              fontSize: '10px', 
              fontWeight: '900', 
              fontStyle: 'italic',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
            }}
            itemStyle={{ padding: '2px 0' }}
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
          />

          {/* ÉNERGIE AREA */}
          <Area 
            type="monotone" 
            dataKey="energy" 
            stroke="#f59e0b" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorEnergy)" 
            name="ÉNERGIE (kWh)"
            animationDuration={1500}
          />

          {/* EAU AREA */}
          <Area 
            type="monotone" 
            dataKey="water" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorWater)" 
            name="EAU (m³)"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}