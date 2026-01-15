'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// On exporte l'interface pour que le parent puisse l'utiliser
export interface SiteStat {
  id: string;
  SiteName: string;
  address?: string | null;
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
  const chartData = React.useMemo(() => {
    return data.map((site) => ({
      name: site.SiteName || 'Site inconnu',
      audits: site._count?.audits || 0,
      departements: site._count?.departement || 0,
    }));
  }, [data]);

  return (
    <div className="w-full h-112.5 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
            <Bar dataKey="audits" name="Audits" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={30} />
            <Bar dataKey="departements" name="Dép." fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}