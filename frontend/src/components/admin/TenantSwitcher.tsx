/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
/**
 * 🔄 MODULE : TENANT SWITCHER MASTER
 * -------------------------------------------------------------------------
 * FONCTION : Commutation rapide entre les instances organisationnelles.
 * RÔLE : Permet au Super-Admin d'agir dans le contexte spécifique d'un client.
 * NOTE : Liste statique simulée; doit être liée à matrixApi.getTenants() en prod.
 */

import React from 'react';
import { Building2, ChevronDown, CheckCircle2, ShieldCheck } from 'lucide-react';

const TENANTS = [
  { id: 'TENANT-QUALI-CORP', name: 'Qualisoft Corporate', color: 'bg-blue-600' },
  { id: 'TENANT-SENELEC', name: 'SENELEC SA', color: 'bg-yellow-500' },
  { id: 'TENANT-PAD', name: 'Port Autonome de Dakar', color: 'bg-cyan-500' }
];

export default function TenantSwitcher({ currentTenant, onSwitch }: any) {
  const active = TENANTS.find(t => t.id === currentTenant);

  return (
    <div className="relative group font-sans italic text-left">
      {/* BOUTON D'AFFICHAGE DU CONTEXTE ACTIF */}
      <button className="flex items-center gap-4 px-6 py-4 bg-slate-950 border-2 border-slate-800 rounded-2xl hover:border-blue-600 transition-all cursor-pointer w-80 shadow-2xl group border-none">
        <div className={`w-12 h-12 ${active?.color || 'bg-slate-700'} rounded-xl flex items-center justify-center text-white shadow-lg border border-white/10 group-hover:scale-110 transition-transform`}>
          <Building2 size={24} />
        </div>
        <div className="text-left flex-1 truncate">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-2 italic flex items-center gap-2">
            <ShieldCheck size={10} className="text-blue-500" /> Instance Active
          </p>
          <p className="text-md font-black text-white uppercase tracking-tighter truncate italic">
            {active?.name || "Sélectionner..."}
          </p>
        </div>
        <ChevronDown size={20} className="text-slate-600 group-hover:rotate-180 group-hover:text-white transition-all" />
      </button>

      {/* MENU DÉROULANT DES ORGANISATIONS (DROPDOWN) */}
      <div className="absolute top-[115%] left-0 w-80 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-4xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all z-200 p-4 overflow-hidden">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] p-4 border-b border-slate-50 mb-3 italic">Changer d&apos;organisation</p>
        
        <div className="space-y-2">
          {TENANTS.map((t) => (
            <button
              key={t.id}
              onClick={() => onSwitch(t.id)}
              className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all text-left group/item border-none cursor-pointer ${
                currentTenant === t.id 
                ? 'bg-blue-50 text-blue-900 shadow-inner' 
                : 'hover:bg-slate-50 text-slate-600 bg-transparent'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${t.color} shadow-sm ${currentTenant === t.id ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-black uppercase tracking-tight italic">{t.name}</span>
              </div>
              {currentTenant === t.id && (
                <CheckCircle2 size={18} className="text-blue-600" />
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-blue-600" />
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none italic">Isolation Multi-Tenant Active</p>
        </div>
      </div>
    </div>
  );
}