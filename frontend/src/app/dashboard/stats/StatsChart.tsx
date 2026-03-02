/**
 * 📊 COMPOSANT : src/app/dashboard/stats/components/StatsChart.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Visualisation comparative (Audits vs Départements) par implantation.
 * USAGE : Utilisé dans les vues de synthèse pour la cartographie des ressources.
 * DATE DE RÉVISION : 02 Mars 2026 | 15:25 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export interface SiteStat {
  id: string;
  SiteName: string;
  _count: {
    audits: number;
    departement: number;
    users: number;
  };
}

interface StatsChartProps {
  data: SiteStat[];
}

export default function StatsChart({ data = [] }: StatsChartProps) {
  // Préparation du flux de données pour Recharts
  const chartData = useMemo(() => {
    return data.map((site) => ({
      name: site.SiteName || 'Nœud inconnu',
      audits: site._count?.audits || 0,
      departements: site._count?.departement || 0,
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-75 lg:h-125 bg-slate-900/40 p-6 rounded-4xl border border-white/5 flex items-center justify-center opacity-50">
        <p className="text-slate-400 font-black uppercase italic text-[10px] tracking-widest">Données de cartographie indisponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full h-100 lg:h-125 bg-slate-900/40 p-6 lg:p-12 rounded-[2.5rem] lg:rounded-[4.5rem] border border-white/5 shadow-2xl lg:shadow-4xl backdrop-blur-3xl relative overflow-hidden group">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 lg:mb-12 gap-4">
          <h3 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-white m-0 leading-none">Cartographie<br className="block sm:hidden"/> des Ressources</h3>
          <div className="flex gap-4 lg:gap-6 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 custom-scrollbar-hide">
              <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-black uppercase text-blue-500 italic whitespace-nowrap m-0">
                  <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.6)] shrink-0"></div> Audits
              </div>
              <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-black uppercase text-amber-500 italic whitespace-nowrap m-0">
                  <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] shrink-0"></div> Départements
              </div>
          </div>
      </div>

      <div className="h-[calc(100%-80px)] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ bottom: 10, left: -20, right: 10, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900, fontStyle: 'italic' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900, fontStyle: 'italic' }} dx={-10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0B0F1A', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', textTransform: 'uppercase' }}
              itemStyle={{ fontWeight: 900, fontStyle: 'italic', fontSize: '11px' }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            {/* Taille de barre adaptative selon l'écran gérée par Recharts (maxBarSize) */}
            <Bar dataKey="audits" name="Audits" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={1500} />
            <Bar dataKey="departements" name="Départements" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <style jsx>{`
        .custom-scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}