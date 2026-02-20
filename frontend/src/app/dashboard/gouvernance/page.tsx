/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldCheck, Gavel, Calendar, MessageSquare, 
  TrendingUp, Award, Zap, ChevronRight, LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';

/**
 * 🏛️ PORTAIL DE GOUVERNANCE SOUVERAINE
 * Rôle : Point d'entrée unique pour le pilotage stratégique (§9.3 ISO 9001).
 * Il consolide visuellement la maturité du SMI.
 */
export default function GovernanceExcellence() {
  // Simulation de stats consolidées (A lier au Noyau Master en prod)
  const [stats, setStats] = useState({ compliance: 92, planning: 75, maturity: 'Niveau 3' });

  return (
    <div className="ml-72 p-10 bg-[#0B0F1A] min-h-screen text-white italic text-left font-sans selection:bg-blue-500/30">
      
      {/* 🔝 HEADER SOUVERAIN */}
      <header className="mb-12 border-b border-white/5 pb-10 flex justify-between items-end animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
            Gouvernance <span className="text-blue-500 text-8xl block tracking-[-0.05em]">Souveraine</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-6 italic">
            Intelligence de Pilotage & Conformité Stratégique RD 2030
          </p>
        </div>
        <div className="flex gap-4">
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center backdrop-blur-md shadow-2xl">
                <p className="text-[9px] font-black uppercase text-blue-500 mb-1 tracking-widest leading-none">Maturité SMI</p>
                <p className="text-2xl font-black uppercase italic leading-none">{stats.maturity}</p>
            </div>
        </div>
      </header>

      {/* 🚀 LES 3 PILIERS DU PILOTAGE (§9.1 / §9.3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        
        {/* PILIER 1 : COMPLIANCE */}
        <Link href="/dashboard/gouvernance/compliance" className="group bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] hover:border-blue-500/50 transition-all duration-500 shadow-xl backdrop-blur-sm">
          <Gavel className="text-blue-500 mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" size={40} />
          <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">Veille Légale</h3>
          <p className="text-slate-500 text-xs font-bold leading-relaxed mb-6 uppercase italic">Maîtrise des exigences réglementaires et surveillance normative §6.1.3.</p>
          <div className="flex justify-between items-center text-blue-500 font-black text-xs uppercase tracking-widest border-t border-white/5 pt-6">
            <span>Score: {stats.compliance}%</span> <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>

        {/* PILIER 2 : CHRONOGRAMME */}
        <Link href="/dashboard/gouvernance/planning" className="group bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] hover:border-emerald-500/50 transition-all duration-500 shadow-xl backdrop-blur-sm">
          <Calendar className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-500" size={40} />
          <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">Chronogramme</h3>
          <p className="text-slate-500 text-xs font-bold leading-relaxed mb-6 uppercase italic">Planification maîtresse des jalons et activités critiques de direction.</p>
          <div className="flex justify-between items-center text-emerald-500 font-black text-xs uppercase tracking-widest border-t border-white/5 pt-6">
            <span>Réalisation: {stats.planning}%</span> <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>

        {/* PILIER 3 : SÉANCES */}
        <Link href="/dashboard/gouvernance/sessions" className="group bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] hover:border-amber-500/50 transition-all duration-500 shadow-xl backdrop-blur-sm">
          <MessageSquare className="text-amber-500 mb-6 group-hover:scale-110 transition-transform duration-500" size={40} />
          <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">Séances</h3>
          <p className="text-slate-500 text-xs font-bold leading-relaxed mb-6 uppercase italic">Traçabilité des arbitrages et pilotage des revues de processus.</p>
          <div className="flex justify-between items-center text-amber-500 font-black text-xs uppercase tracking-widest border-t border-white/5 pt-6">
            <span>Décisions: 124</span> <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>
      </div>

      {/* 🛡️ BANNER DE GARANTIE DE CONFORMITÉ */}
      <div className="bg-blue-600/5 border border-blue-500/20 p-12 rounded-[4rem] flex items-center justify-between shadow-inner relative overflow-hidden group">
        <Zap className="absolute -right-10 -bottom-10 text-blue-500/10 rotate-12 group-hover:scale-150 transition-transform duration-1000" size={200} />
        <div className="flex items-center gap-8 relative z-10 text-left">
            <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center text-blue-500 shadow-2xl border border-blue-500/30">
                <ShieldCheck size={40} />
            </div>
            <div>
                <h3 className="text-2xl font-black uppercase italic leading-none mb-2">Garantie de <span className="text-blue-600">Conformité</span></h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight italic">
                  Toutes les activités de gouvernance Matrix sont scellées et liées aux exigences ISO 9001:2015 §9.3.
                </p>
            </div>
        </div>
        <Link href="/dashboard/gouvernance/copil" className="px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl relative z-10 border-none text-white italic">
            Dashboard COPIL <ChevronRight size={14} className="inline ml-2" />
        </Link>
      </div>
    </div>
  );
}