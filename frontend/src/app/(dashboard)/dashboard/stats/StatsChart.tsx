/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📊 COMPOSANT : CARTOGRAPHIE DES RESSOURCES (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Visualisation comparative Audits vs Départements.
 * DESIGN : Matrix High-Density / Recharts Scellés.
 */

'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StatsChart({ data = [] }: { data?: any[] }) {
  const chartData = useMemo(() => {
    return data.length > 0 ? data.map((site) => ({
      name: site.SiteName || 'Nœud inconnu',
      audits: site._count?.audits || 0,
      departements: site._count?.departement || 0,
    })) : [
      {name: 'SITE ALPHA', audits: 12, departements: 4},
      {name: 'SITE BETA', audits: 8, departements: 3},
      {name: 'SIEGE', audits: 15, departements: 6}
    ];
  }, [data]);

  return (
    <div className="w-full h-full bg-slate-900/40 p-10 rounded-[4rem] border border-white/5 shadow-4xl flex flex-col text-left">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-black italic m-0 uppercase tracking-tighter">Cartographie <span className="text-blue-600">Implantations</span></h3>
        <div className="flex gap-6">
          <div className="flex items-center gap-2 text-[10px] text-blue-500 font-black italic uppercase"><div className="w-3 h-3 rounded-full bg-blue-600" /> Audits</div>
          <div className="flex items-center gap-2 text-[10px] text-amber-500 font-black italic uppercase"><div className="w-3 h-3 rounded-full bg-amber-500" /> Dép.</div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900, fontStyle: 'italic' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900, fontStyle: 'italic' }} />
            <Tooltip contentStyle={{ backgroundColor: '#0B0F1A', borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontWeight: '900' }} />
            <Bar dataKey="audits" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={40} />
            <Bar dataKey="departements" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
