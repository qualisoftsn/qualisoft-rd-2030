/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🎭 MODULE : LandingView.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Interface de présentation dynamique (Elite vs Sagam vs Matrix).
 * DESIGN : Hardened Matrix - Glassmorphism & Souveraineté.
 */

"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, ArrowRight, Globe, Database, Crown } from 'lucide-react';

interface LandingProps {
  slug: string;
  type: string;
}

export default function LandingView({ slug, type }: LandingProps) {
  
  // 🎨 CONFIGURATION DU BRANDING SOUVERAIN
  const isElite = slug === 'elite' || slug === 'qualisoft';
  const isMaster = type === 'MASTER';

  const branding = {
    title: isElite ? "Qualisoft Elite" : `Portail ${slug.toUpperCase()}`,
    subtitle: isElite ? "L'Excellence du Pilotage SDE" : "Performance & Souveraineté Opérationnelle",
    color: isElite ? "from-amber-500 to-orange-600" : "from-blue-600 to-indigo-700",
    accent: isElite ? "text-amber-500" : "text-blue-500",
    logo: isElite ? <Crown size={40} /> : <Zap size={40} />,
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 flex flex-col items-center justify-center relative overflow-hidden italic font-sans">
      
      {/* 🌌 FOND MATRICIEL (Capture visuelle) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-linear-to-r ${branding.color} rounded-full blur-[120px] animate-pulse`} />
      </div>

      {/* 🛡️ HEADER NAVIGATION */}
      <nav className="fixed top-0 w-full p-10 flex justify-between items-center z-50 px-20">
        <div className="flex items-center gap-4">
          <div className={`${branding.accent} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`}>
            {branding.logo}
          </div>
          <span className="text-2xl font-black uppercase tracking-tighter italic text-white">
            QUALISOFT <span className={branding.accent}>{slug.toUpperCase()}</span>
          </span>
        </div>
        
        <Link 
          href="/auth/login" 
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all backdrop-blur-md no-underline"
        >
          Accès Matrix
        </Link>
      </nav>

      {/* 🚀 MAIN CONTENT */}
      <main className="relative z-10 text-center max-w-4xl px-10 animate-in fade-in zoom-in duration-1000">
        <div className="flex items-center justify-center gap-3 mb-8 opacity-50">
           <Globe size={14} />
           <span className="text-[10px] font-black uppercase tracking-[0.5em]">Instance : {slug}.qualisoft.sn</span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.85] text-white mb-10">
          {branding.title} <br />
          <span className={`bg-clip-text text-transparent bg-linear-to-r ${branding.color}`}>
            Sovereign OS
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
          {branding.subtitle}. <br />
          Exploitez la puissance du <span className="text-white font-black italic">Noyau Matrix RD-2026</span> pour un pilotage sans compromis.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <Link 
            href="/auth/login" 
            className={`bg-linear-to-r ${branding.color} text-white px-12 py-6 rounded-3xl font-black uppercase text-xs italic flex items-center gap-4 shadow-2xl hover:scale-105 transition-all no-underline`}
          >
            Déployer le Cockpit <ArrowRight size={18} />
          </Link>
          
          <button className="bg-white/5 border border-white/5 px-12 py-6 rounded-3xl font-black uppercase text-xs italic text-slate-400 hover:text-white transition-all flex items-center gap-4 cursor-pointer">
            <Database size={18} /> Documentation SMI
          </button>
        </div>
      </main>

      {/* 📡 FOOTER D'INTÉGRITÉ */}
      <footer className="fixed bottom-12 w-full flex justify-center gap-16 opacity-30">
        <div className="flex items-center gap-3">
          <ShieldCheck size={14} className={branding.accent} />
          <span className="text-[8px] font-black uppercase tracking-widest leading-none">Certifié Qualisoft SDE</span>
        </div>
        <div className="flex items-center gap-3">
          <Zap size={14} className={branding.accent} />
          <span className="text-[8px] font-black uppercase tracking-widest leading-none">Cluster Dakar Stable</span>
        </div>
      </footer>
    </div>
  );
}