/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : FlashStats.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Affichage des indicateurs critiques (KPI) en temps réel.
 */

"use client";

import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, Zap, Target, Loader2 } from 'lucide-react';
import apiClient from '@/core/api/api-client';

interface StatsData {
  ncOpen: number;
  ncClosed: number;
  actionsPending: number;
  complianceRate: number;
}

export default function FlashStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get<StatsData>('/dashboard/stats/flash');
        setStats(res.data);
      } catch (err) {
        console.error("Échec Télémétrie Stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader2 className="animate-spin text-blue-600 mx-auto" />;

  const cards = [
    { label: "NC Ouvertes", value: stats?.ncOpen, icon: ShieldAlert, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "NC Clôturées", value: stats?.ncClosed, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Actions en cours", value: stats?.actionsPending, icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Conformité", value: `${stats?.complianceRate}%`, icon: Target, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-[#0F172A]/40 border border-white/5 p-6 rounded-4xl flex items-center gap-5 backdrop-blur-sm group hover:border-white/10 transition-all">
          <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
            <card.icon size="24" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest m-0">{card.label}</p>
            <h4 className="text-2xl font-black text-white m-0 italic tracking-tighter">{card.value}</h4>
          </div>
        </div>
      ))}
    </div>
  );
}
