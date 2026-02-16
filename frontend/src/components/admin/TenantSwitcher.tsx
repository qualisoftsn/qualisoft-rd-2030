/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Building2, ChevronDown, CheckCircle2 } from 'lucide-react';

const TENANTS = [
  { id: 'TENANT-QUALI-CORP', name: 'Qualisoft Corporate', color: 'bg-blue-600' },
  { id: 'TENANT-SENELEC', name: 'SENELEC SA', color: 'bg-yellow-500' },
  { id: 'TENANT-PAD', name: 'Port Autonome de Dakar', color: 'bg-cyan-500' }
];

export default function TenantSwitcher({ currentTenant, onSwitch }: any) {
  const active = TENANTS.find(t => t.id === currentTenant);

  return (
    <div className="relative group font-sans italic">
      <button className="flex items-center gap-4 px-6 py-4 bg-slate-950 border-2 border-slate-800 rounded-2xl hover:border-blue-600 transition-all cursor-pointer w-72">
        <div className={`w-10 h-10 ${active?.color || 'bg-slate-700'} rounded-xl flex items-center justify-center text-white shadow-lg`}>
          <Building2 size={20} />
        </div>
        <div className="text-left flex-1 truncate">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Instance Active</p>
          <p className="text-sm font-black text-white uppercase tracking-tighter truncate">
            {active?.name || "Sélectionner..."}
          </p>
        </div>
        <ChevronDown size={18} className="text-slate-600 group-hover:rotate-180 transition-transform" />
      </button>

      <div className="absolute top-[110%] left-0 w-80 bg-white border-2 border-slate-200 rounded-3xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-200 p-3 overflow-hidden">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] p-4 border-b border-slate-100 mb-2 italic">Changer d&apos;organisation</p>
        <div className="space-y-1">
          {TENANTS.map((t) => (
            <button
              key={t.id}
              onClick={() => onSwitch(t.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all text-left group/item ${currentTenant === t.id ? 'bg-blue-50 text-blue-900 border-2 border-blue-100' : 'hover:bg-slate-50 text-slate-600 border-2 border-transparent'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${t.color} shadow-sm`} />
                <span className="text-xs font-black uppercase tracking-tight">{t.name}</span>
              </div>
              {currentTenant === t.id && <CheckCircle2 size={16} className="text-blue-600" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}