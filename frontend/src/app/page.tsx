/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : RootPage (Landing Page Elite)
 * -------------------------------------------------------------------------
 * RÔLE : Portail d'entrée souverain pour elite.qualisoft.sn.
 * DESIGN : Elite Industrial Dark • Glassmorphism • High-Tech §ISO.
 * RÉVISION : 03 Mars 2026 | 18:55 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, Zap, 
  ArrowRight, Fingerprint, Layers 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden">
      
      {/* 🔮 BACKGROUND MATRIX */}
      <div className="absolute top-0 right-0 w-200 h-200 bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-150 h-150 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* 🔝 NAVIGATION VITRINE */}
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
          <Link href="#solutions" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Solutions</Link>
          <Link href="#iso" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Normes ISO</Link>
          <Link href="/auth/login" className="px-8 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-lg shadow-blue-900/20">
            Accès Matrix
          </Link>
        </div>
      </nav>

      {/* 🚀 HERO SECTION */}
      <section className="relative pt-32 pb-20 px-8 lg:px-20 max-w-7xl mx-auto text-left">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-8">
            <Fingerprint size={14} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Kernel v3.0 Scellé RD-2026</span>
          </div>
          <h2 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-10 italic">
            PILOTEZ VOTRE <br />
            <span className="text-blue-600">SOUVERAINETÉ</span> <br />
            QUALITÉ.
          </h2>
          <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed mb-12 uppercase italic">
            La première plateforme de Management Intégré conçue pour la résilience et la traçabilité absolue. Conforme ISO 9001, 14001, 45001.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link href="/auth/login" className="px-10 py-5 bg-white text-blue-950 rounded-2xl font-black uppercase text-[12px] tracking-widest flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-all">
              Démarrer le Pilotage <ArrowRight size={18} />
            </Link>
            <Link href="#solutions" className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-white/10 transition-all">
              Explorer le SMI
            </Link>
          </div>
        </div>
      </section>

      {/* 📊 GRID FEATURES */}
      <section id="solutions" className="py-32 px-8 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard 
            icon={Layers} 
            title="Cockpit Multi-Tenant" 
            desc="Isolation totale des données par site et sous-domaine souverain."
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Conformité ISO" 
            desc="Workflows automatisés pour les audits et le traitement des NC §10.2."
          />
          <FeatureCard 
            icon={Zap} 
            title="Temps Réel Matrix" 
            desc="Télémétrie instantanée de vos indicateurs de performance stratégiques."
          />
        </div>
      </section>

      {/* 🏁 FOOTER */}
      <footer className="py-20 border-t border-white/5 text-center px-8">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-4">Qualisoft Elite Matrix • Sénégal 2026</p>
        <div className="flex justify-center gap-8 opacity-40">
           <span className="text-[9px] font-black uppercase tracking-widest">ISO 9001:2015</span>
           <span className="text-[9px] font-black uppercase tracking-widest">ISO 14001:2015</span>
           <span className="text-[9px] font-black uppercase tracking-widest">ISO 45001:2018</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-10 bg-white/5 border border-white/5 rounded-[3rem] hover:border-blue-600/30 transition-all group cursor-default text-left">
      <div className="w-14 h-14 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-black uppercase italic text-white mb-4">{title}</h3>
      <p className="text-sm text-slate-500 font-bold uppercase leading-relaxed m-0">{desc}</p>
    </div>
  );
}