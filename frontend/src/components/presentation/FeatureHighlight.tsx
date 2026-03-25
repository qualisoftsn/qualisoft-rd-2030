/**
 * 🛰️ MODULE : FeatureHighlight.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Présentation stratégique des capacités Matrix.
 * RÉVISION : 02 Mars 2026 | 18:50 GMT
 */

"use client";

import React from 'react';
import { PieChart, ShieldCheck, Users, Zap, ArrowUpRight } from "lucide-react";

export default function FeatureHighlight() {
  const highlights = [
    { title: "SMI 100% Digital", desc: "Digitalisation intégrale des processus ISO avec scellage.", icon: Zap, color: "bg-amber-500" },
    { title: "Gestion des Risques", desc: "Anticipation proactive via le monitoring Kernel Matrix.", icon: ShieldCheck, color: "bg-emerald-500" },
    { title: "Rapports IA", desc: "Génération de PDF analytiques pour vos audits de certification.", icon: PieChart, color: "bg-blue-600" },
    { title: "Multi-Tenant", desc: "Isolation scellée des données filiales sans fuite de flux.", icon: Users, color: "bg-indigo-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-blue-600/5 border border-blue-500/20 rounded-[3.5rem] italic font-sans text-left relative overflow-hidden group">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
      
      {highlights.map((h, i) => (
        <div key={i} className="p-8 space-y-5 group/item transition-all duration-500 hover:bg-white rounded-[2.5rem] hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer relative z-10 border border-transparent hover:border-blue-500/10">
          <div className={`w-12 h-12 ${h.color} rounded-2xl flex items-center justify-center text-white shadow-xl group-hover/item:rotate-12 transition-all`}>
            <h.icon size={22} />
          </div>
          <div>
            <h4 className="text-[12px] font-black uppercase text-slate-900 tracking-tighter italic m-0 flex items-center gap-2">
              {h.title} <ArrowUpRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
            </h4>
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-3 m-0 opacity-80 group-hover/item:opacity-100 transition-opacity">
              {h.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
