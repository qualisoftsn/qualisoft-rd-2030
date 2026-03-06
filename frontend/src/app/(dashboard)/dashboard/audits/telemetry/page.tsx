/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : AuditTelemetry.tsx (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Analyse visuelle des performances d'audit (Zéro Scroll).
 * RÉVISION : 05 Mars 2026 | 01:25 GMT
 */

"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { ShieldCheck, Target, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import apiClient from '@/core/api/api-client';

export default function AuditTelemetry() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/audits/stats/by-process')
      .then(res => setStats(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full">
      <header className="shrink-0 p-8 md:p-12 border-b border-white/5 bg-[#0B0F1A]/90 backdrop-blur-md">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white italic tracking-tighter uppercase m-0 leading-none">
          Télémétrie <span className="text-blue-600">Audit</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4 m-0">Analyse de conformité transversale Matrix</p>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 space-y-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 h-auto">
          
          {/* GRAPHIQUE BARRES */}
          <div className="xl:col-span-8 bg-[#0F172A] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px]" />
            <div className="flex items-center gap-4 mb-10 relative z-10">
              <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500"><TrendingUp size={24} /></div>
              <h3 className="text-sm font-black uppercase tracking-widest italic m-0">Score de conformité par Processus (%)</h3>
            </div>
            <div className="h-87.5 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="process" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '10px' }} />
                  <Bar dataKey="score" radius={[12, 12, 0, 0]} barSize={45}>
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score < 70 ? '#ef4444' : '#2563eb'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* INDICATEURS RAPIDES */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            {[
              { label: "Audits Réalisés", value: "24", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "NC Majeures", value: "03", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
              { label: "Objectif SMI", value: "95%", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Activité Matrix", value: "Live", icon: Activity, color: "text-blue-400", bg: "bg-white/5", animate: "animate-pulse" },
            ].map((kpi, i) => (
              <div key={i} className="bg-[#0F172A] border border-white/5 p-8 rounded-4xl flex items-center justify-between group hover:border-white/20 transition-all shadow-xl flex-1">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest m-0">{kpi.label}</p>
                  <h4 className="text-4xl font-black text-white italic m-0 tracking-tighter">{kpi.value}</h4>
                </div>
                <div className={`w-16 h-16 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110 ${kpi.animate || ''}`}>
                  <kpi.icon size={32} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="shrink-0 p-8 border-t border-white/5 text-center bg-[#0B0F1A]">
         <p className="text-[9px] font-black text-slate-700 uppercase italic tracking-[0.5em] m-0 leading-relaxed">Qualisoft Satellite Surveillance • 🛰️ SDE-OS 2026</p>
      </footer>
    </div>
  );
}