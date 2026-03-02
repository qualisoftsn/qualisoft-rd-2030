/**
 * 🚀 MODULE : ProspectConsole.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Interface de démonstration des avantages stratégiques RD-2026.
 * RÉVISION : 02 Mars 2026 | 18:42 GMT
 */

"use client";

import React from 'react';
import { 
  Play, ShieldCheck, Zap, Globe, FileBarChart, ArrowUpRight 
} from 'lucide-react';

export default function ProspectConsole() {
  const features = [
    { title: "Zéro Papier", desc: "Digitalisation intégrale ISO", icon: Zap, color: "bg-amber-500" },
    { title: "Conformité", desc: "Monitoring §9.1 temps réel", icon: ShieldCheck, color: "bg-emerald-500" },
    { title: "Multi-Tenant", desc: "Isolation Kernel souveraine", icon: Globe, color: "bg-blue-500" },
    { title: "Reporting", desc: "Revues de direction PDF", icon: FileBarChart, color: "bg-indigo-500" }
  ];

  return (
    <div className="bg-linear-to-br from-[#0F172A] to-[#1E293B] rounded-[3.5rem] p-10 lg:p-14 text-white shadow-4xl relative overflow-hidden italic font-sans text-left group">
      
      <div className="absolute top-10 right-10 bg-blue-600 text-[8px] font-black uppercase px-4 py-1.5 rounded-full tracking-[0.3em] animate-pulse shadow-lg shadow-blue-900/40 z-20">
        Mode Présentation Elite
      </div>

      <div className="relative z-10">
        <h2 className="text-4xl font-black uppercase tracking-tighter m-0 italic">
          Console <span className="text-blue-500 underline decoration-white/10">Prospects</span>
        </h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-4 mb-12 italic">Arguments stratégiques Qualisoft RD 2026</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-7 rounded-[2.5rem] hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-default group/item">
              <div className={`w-10 h-10 ${f.color} rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover/item:scale-110 transition-transform`}>
                <f.icon size={20} className="text-white" />
              </div>
              <h4 className="text-xs font-black uppercase italic m-0 group-hover/item:text-blue-400 transition-colors">{f.title}</h4>
              <p className="text-[10px] text-slate-500 font-bold leading-tight lowercase italic mt-2 m-0 opacity-70 group-hover/item:opacity-100">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-6">
          <button className="px-10 py-5 bg-blue-600 hover:bg-white hover:text-blue-600 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 transition-all border-none cursor-pointer italic tracking-widest shadow-2xl">
            <Play size={16} fill="currentColor" /> Lancer la Visite Guidée
          </button>
          <button className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white flex items-center gap-3 transition-all cursor-pointer italic tracking-widest">
            Plaquette SDE <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* DÉCORATION DYNAMIQUE */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] group-hover:bg-blue-600/20 transition-all duration-1000" />
    </div>
  );
}