/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : AuditTelemetry.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Analyse visuelle des performances d'audit par processus.
 * RÉVISION : 04 Mars 2026 | 15:20 GMT
 */

"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldCheck, Target, AlertCircle, TrendingUp } from 'lucide-react';
import apiClient from '@/core/api/api-client';

export default function AuditTelemetry() {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    // Appel au nouveau Kernel d'agrégation d'audits
    apiClient.get('/audits/stats/by-process').then(res => setStats(res.data));
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Télémétrie <span className="text-blue-600">Audit</span></h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">Analyse de conformité transversale Matrix</p>
      </div>

      {/* 📊 GRAPHIQUE DE CONFORMITÉ */}
      <div className="bg-[#0F172A]/40 border border-white/5 p-10 rounded-[3rem] backdrop-blur-xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Taux de conformité par Processus (%)</h3>
        </div>

        <div className="h-100 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="process" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px' }}
                itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Bar dataKey="score" radius={[10, 10, 0, 0]} barSize={40}>
                {stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score < 70 ? '#ef4444' : '#2563eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📉 INDICATEURS RAPIDES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Audits Réalisés", value: "24", icon: ShieldCheck, color: "text-emerald-500" },
          { label: "NC Majeures", value: "03", icon: AlertCircle, color: "text-red-500" },
          { label: "Objectif SMI", value: "95%", icon: Target, color: "text-blue-500" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-white/20 transition-all">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</p>
              <h4 className="text-3xl font-black text-white italic">{kpi.value}</h4>
            </div>
            <kpi.icon size={32} className={`${kpi.color} opacity-20 group-hover:opacity-100 transition-opacity`} />
          </div>
        ))}
      </div>
    </div>
  );
}