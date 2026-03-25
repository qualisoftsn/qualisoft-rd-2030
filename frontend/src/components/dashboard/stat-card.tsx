/**
 * 🎴 MODULE : StatCard.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Affichage de KPI critique avec filigrane dynamique.
 * RÉVISION : 02 Mars 2026 | 18:48 GMT
 */

"use client";

import React from 'react';
import { LucideIcon, TrendingUp, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: 'info' | 'warning' | 'danger' | 'success';
  trend?: string;
}

export function StatCard({ title, value, icon: Icon, variant, trend }: StatCardProps) {
  const styles = {
    info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    danger: "text-red-500 bg-red-500/10 border-red-500/20",
    success: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-4xl hover:border-blue-500/30 transition-all duration-700 group relative overflow-hidden text-left italic font-sans">
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] m-0">{title}</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none m-0">{value}</h3>
            {trend && (
              <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase">
                <TrendingUp size={12} strokeWidth={3} /> {trend}
              </span>
            )}
          </div>
        </div>
        
        <div className={`p-5 rounded-2xl ${styles[variant]} border transition-all group-hover:rotate-12 group-hover:scale-110 duration-500`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>

      {/* FILIGRANE SDE */}
      <Icon className="absolute -right-8 -bottom-8 text-slate-100 opacity-20 group-hover:opacity-40 group-hover:scale-125 transition-all duration-1000" size={160} />
      
      <div className="mt-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span className="text-[8px] font-black uppercase text-blue-600 tracking-widest">Détails du registre</span>
        <ArrowUpRight size={10} className="text-blue-600" />
      </div>
    </div>
  );
}
