/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🔄 MODULE : TenantSwitcher.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Commutation instantanée entre instances organisationnelles.
 * SÉCURITÉ : Isolation visuelle par code couleur.
 * RÉVISION : 02 Mars 2026 | 18:05 GMT
 */

"use client";

import React from 'react';
import { Building2, ChevronDown, CheckCircle2, ShieldCheck } from 'lucide-react';

const TENANTS = [
  { id: 'QUALI', name: 'Qualisoft Corporate', color: 'bg-blue-600' },
  { id: 'SENELEC', name: 'SENELEC SA', color: 'bg-yellow-500' },
  { id: 'PAD', name: 'Port de Dakar', color: 'bg-emerald-500' }
];

export default function TenantSwitcher({ currentTenant, onSwitch }: any) {
  const active = TENANTS.find(t => t.id === currentTenant);

  return (
    <div className="relative group italic font-sans text-left shrink-0">
      <button className="flex items-center gap-5 px-6 py-4 bg-[#0F172A] border border-white/5 rounded-4xl hover:border-blue-600 transition-all cursor-pointer w-80 shadow-2xl border-none">
        <div className={`w-12 h-12 ${active?.color || 'bg-slate-800'} rounded-xl flex items-center justify-center text-white shadow-3xl border border-white/10 shrink-0`}>
          <Building2 size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2 italic flex items-center gap-2 m-0">
            <ShieldCheck size={10} className="text-blue-500" /> Instance Active
          </p>
          <p className="text-[13px] font-black text-white uppercase tracking-tighter truncate m-0 italic leading-none">{active?.name || "Choisir Instance..."}</p>
        </div>
        <ChevronDown size={20} className="text-slate-700 group-hover:rotate-180 transition-transform" />
      </button>

      <div className="absolute top-[115%] left-0 w-80 bg-white rounded-[2.5rem] shadow-4xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-4 group-hover:translate-y-0 transition-all z-200 p-4 border border-slate-100">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest p-4 border-b border-slate-50 mb-3 italic m-0">Infrastructures Déployées</p>
        <div className="space-y-1.5">
          {TENANTS.map((t) => (
            <button key={t.id} onClick={() => onSwitch(t.id)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border-none cursor-pointer ${currentTenant === t.id ? 'bg-blue-50 text-blue-900' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-2.5 h-2.5 rounded-full ${t.color} ${currentTenant === t.id ? 'animate-pulse' : ''} shrink-0`} />
                <span className="text-[11px] font-black uppercase italic truncate">{t.name}</span>
              </div>
              {currentTenant === t.id && <CheckCircle2 size={16} className="text-blue-600" />}
            </button>
          ))}
        </div>
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /><p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] italic m-0 leading-none">Sovereign Tenant Isolation</p></div>
      </div>
    </div>
  );
}