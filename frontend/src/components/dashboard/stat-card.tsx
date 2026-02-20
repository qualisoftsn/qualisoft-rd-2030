'use client';
/**
 * 📈 COMPOSANT : INDICATEUR STRATÉGIQUE (STAT CARD)
 * -------------------------------------------------------------------------
 * FONCTION : Affichage haute-fidélité d'un KPI métier.
 * PHILOSOPHIE : Clarté immédiate, esthétique Elite.
 */

import React from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: 'info' | 'warning' | 'danger' | 'success';
  trend?: string;
}

export function StatCard({ title, value, icon: Icon, variant, trend }: StatCardProps) {
  const styles = {
    info: "text-blue-600 bg-blue-50 border-blue-100",
    warning: "text-amber-600 bg-amber-50 border-amber-100",
    danger: "text-red-600 bg-red-50 border-red-100",
    success: "text-emerald-600 bg-emerald-50 border-emerald-100",
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden text-left">
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">{title}</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-black text-slate-950 tracking-tighter italic leading-none">{value}</h3>
            {trend && (
              <span className="flex items-center gap-1 text-[9px] font-black text-blue-500 uppercase italic">
                <TrendingUp size={10} /> {trend}
              </span>
            )}
          </div>
        </div>
        <div className={`p-4 rounded-2xl ${styles[variant]} border transition-transform group-hover:rotate-12`}>
          <Icon size={24} />
        </div>
      </div>
      {/* Filigrane décoratif en fond */}
      <Icon className="absolute -right-6 -bottom-6 text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity" size={120} />
    </div>
  );
}