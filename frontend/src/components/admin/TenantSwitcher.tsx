'use client';

import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';

const TENANTS = [
  { id: 'TENANT-QUALI-CORP', name: 'Qualisoft Corporate', color: 'text-blue-500' },
  { id: 'TENANT-SENELEC', name: 'SENELEC', color: 'text-yellow-500' },
  { id: 'TENANT-PAD', name: 'Port Autonome de Dakar', color: 'text-cyan-500' }
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TenantSwitcher({ currentTenant, onSwitch }: any) {
  return (
    <div className="relative group">
      <button className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
        <div className="p-2 bg-[#2563eb]/20 rounded-lg">
          <Building2 size={20} className="text-[#2563eb]" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Organisation</p>
          <p className="text-sm font-black italic uppercase text-white tracking-tight">
            {TENANTS.find(t => t.id === currentTenant)?.name || "Sélectionner"}
          </p>
        </div>
        <ChevronDown size={16} className="ml-4 text-gray-600 group-hover:rotate-180 transition-transform" />
      </button>

      {/* Dropdown Menu (Design Elite) */}
      <div className="absolute top-full left-0 mt-4 w-64 bg-[#121826] border border-white/10 rounded-4xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 backdrop-blur-3xl">
        {TENANTS.map((t) => (
          <button
            key={t.id}
            onClick={() => onSwitch(t.id)}
            className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl transition-colors text-left"
          >
            <div className={`w-2 h-2 rounded-full ${t.color}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}