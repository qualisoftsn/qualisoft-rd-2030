/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 📊 COMPOSANT : DISTRIBUTION ANALYTIQUE DES SITES
 * -------------------------------------------------------------------------
 * RÔLE : Visualisation comparative audits vs départements par implantation.
 */

'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

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
  const chartData = React.useMemo(() => {
    return data.map((site) => ({
      name: site.SiteName || 'Nœud inconnu',
      audits: site._count?.audits || 0,
      departements: site._count?.departement || 0,
    }));
  }, [data]);

  return (
    <div className="w-full h-128 bg-slate-900/40 p-12 rounded-[4.5rem] border border-white/5 shadow-4xl backdrop-blur-3xl relative overflow-hidden group">
      <div className="flex justify-between items-center mb-12">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Cartographie des Ressources</h3>
          <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-500 italic">
                  <div className="w-3 h-3 rounded-full bg-blue-600 shadow-lg shadow-blue-500/40"></div> Audits
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-500 italic">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/40"></div> Départements
              </div>
          </div>
      </div>

      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={chartData} margin={{ bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 900 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 900 }} dx={-10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0B0F1A', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', textTransform: 'uppercase' }}
              itemStyle={{ fontWeight: 900, fontStyle: 'italic', fontSize: '11px' }}
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            />
            <Bar dataKey="audits" name="Audits" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={35} animationDuration={2000} />
            <Bar dataKey="departements" name="Départements" fill="#f59e0b" radius={[10, 10, 0, 0]} barSize={35} animationDuration={2000} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}