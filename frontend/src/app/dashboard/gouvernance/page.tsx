/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldCheck, Gavel, Calendar, MessageSquare, 
  TrendingUp, Award, Zap, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';

export default function GovernanceExcellence() {
  const [stats, setStats] = useState({ compliance: 92, planning: 75, maturity: 'Niveau 3' });

  return (
    <div className="ml-72 p-10 bg-[#0B0F1A] min-h-screen text-white italic text-left font-sans">
      <header className="mb-12 border-b border-white/5 pb-10 flex justify-between items-end">
        <div>
          <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none">
            Gouvernance <span className="text-blue-500 text-8xl block">Souveraine</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-6 italic">
            Intelligence de Pilotage & Conformité Stratégique RD 2030
          </p>
        </div>
        <div className="flex gap-4">
            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center">
                <p className="text-[9px] font-black uppercase text-blue-500 mb-1">Maturité SMI</p>
                <p className="text-2xl font-black uppercase italic">{stats.maturity}</p>
            </div>
        </div>
      </header>

      {/* LES 3 PILIERS DE LA GOUVERNANCE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Link href="/dashboard/gouvernance/compliance" className="group bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] hover:border-blue-500/50 transition-all">
          <Gavel className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
          <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">Veille Légale</h3>
          <p className="text-slate-500 text-xs font-bold leading-relaxed mb-6 uppercase">Maîtrise des exigences réglementaires et conformité normative.</p>
          <div className="flex justify-between items-center text-blue-500 font-black text-xs uppercase tracking-widest">
            <span>Score: {stats.compliance}%</span> <ChevronRight size={18} />
          </div>
        </Link>

        <Link href="/dashboard/gouvernance/planning" className="group bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] hover:border-emerald-500/50 transition-all">
          <Calendar className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
          <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">Chronogramme</h3>
          <p className="text-slate-500 text-xs font-bold leading-relaxed mb-6 uppercase">Planification maîtresse des jalons et activités de direction.</p>
          <div className="flex justify-between items-center text-emerald-500 font-black text-xs uppercase tracking-widest">
            <span>Réalisation: {stats.planning}%</span> <ChevronRight size={18} />
          </div>
        </Link>

        <Link href="/dashboard/gouvernance/sessions" className="group bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] hover:border-amber-500/50 transition-all">
          <MessageSquare className="text-amber-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
          <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">Séances</h3>
          <p className="text-slate-500 text-xs font-bold leading-relaxed mb-6 uppercase">Traçabilité des décisions et pilotage des processus clés.</p>
          <div className="flex justify-between items-center text-amber-500 font-black text-xs uppercase tracking-widest">
            <span>Décisions: 124</span> <ChevronRight size={18} />
          </div>
        </Link>
      </div>

      <div className="bg-blue-600/5 border border-blue-500/20 p-12 rounded-[4rem] flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center text-blue-500 shadow-2xl">
                <ShieldCheck size={40} />
            </div>
            <div>
                <h3 className="text-2xl font-black uppercase italic leading-none mb-2">Garantie de <span className="text-blue-500">Conformité</span></h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight italic">
                  Toutes les activités de gouvernance sont liées aux exigences ISO 9001:2015.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}