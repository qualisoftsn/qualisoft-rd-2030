/**
 * 🛰️ MODULE : RootPage (Landing Page Elite)
 * -------------------------------------------------------------------------
 * RÔLE : Portail d'entrée souverain pour elite.qualisoft.sn.
 * RÉVISION : 03 Mars 2026 | 19:20 GMT
 */

"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, Zap, Fingerprint, ArrowRight, Layers 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic overflow-x-hidden selection:bg-blue-600/30">
      
      {/* 🔮 BACKGROUND EFFECTS */}
      <div className="absolute top-0 right-0 w-200 h-200 bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />

      {/* 🔝 NAV BAR */}
      <nav className="h-24 border-b border-white/5 flex items-center justify-between px-8 lg:px-20 sticky top-0 bg-[#0B0F1A]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-2xl">
            <Image src="/images/qslogo.png" alt="Qualisoft" width={28} height={28} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter m-0 italic">
            QUALI<span className="text-blue-600">SOFT</span> <span className="text-slate-500 font-normal">ELITE</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <Link href="/auth/login" className="px-8 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-lg shadow-blue-900/20">
            Accès Cockpit
          </Link>
        </div>
      </nav>

      {/* 🚀 HERO SECTION */}
      <section className="relative pt-40 pb-20 px-8 lg:px-20 max-w-7xl mx-auto text-left">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-8">
            <Fingerprint size={14} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Kernel v3.0 Scellé RD-2026</span>
          </div>
          <h2 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-10 italic">
            MAÎTRISEZ VOTRE <br />
            <span className="text-blue-600">SOUVERAINETÉ</span> <br />
            QUALITÉ.
          </h2>
          <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed mb-12 uppercase italic">
            Management Intégré ISO 9001, 14001, 45001. Architecture multi-tenant souveraine pour une traçabilité absolue.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link href="/auth/login" className="px-10 py-5 bg-white text-blue-950 rounded-2xl font-black uppercase text-[12px] tracking-widest flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-all">
              Démarrer le Pilotage <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 🧩 FEATURES QUICK GRID */}
      <section className="py-20 px-8 lg:px-20 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="p-10 bg-white/5 border border-white/5 rounded-[3rem]">
          <ShieldCheck className="text-blue-500 mb-6" size={32} />
          <h3 className="text-lg font-black uppercase italic text-white mb-2">Conformité SMI</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Workflows automatisés selon les exigences normatives §10.2.</p>
        </div>
        <div className="p-10 bg-white/5 border border-white/5 rounded-[3rem]">
          <Layers className="text-blue-500 mb-6" size={32} />
          <h3 className="text-lg font-black uppercase italic text-white mb-2">Multi-Tenant</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Isolation étanche des données par sous-domaines souverains.</p>
        </div>
        <div className="p-10 bg-white/5 border border-white/5 rounded-[3rem]">
          <Zap className="text-blue-500 mb-6" size={32} />
          <h3 className="text-lg font-black uppercase italic text-white mb-2">Performance KPI</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Télémétrie en temps réel de vos indicateurs stratégiques.</p>
        </div>
      </section>
    </div>
  );
}