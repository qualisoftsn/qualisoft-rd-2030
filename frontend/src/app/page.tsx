/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : RootPage (Landing Page Elite)
 * -------------------------------------------------------------------------
 * RÔLE : Portail d'entrée souverain pour elite.qualisoft.sn.
 * DESIGN : Elite Industrial Dark • Glassmorphism • SDE Logic.
 * RÉVISION : 04 Mars 2026 | 00:10 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  ChevronRight, ArrowRight, Fingerprint, 
  Lock, Network, Cpu, Activity} from 'lucide-react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden">
      
      {/* 🔮 CORE MATRIX ATMOSPHERE */}
      <div className="absolute top-0 right-0 w-250 h-250 bg-blue-600/5 blur-[180px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-200 h-200 bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />

      {/* 🔝 NAVIGATION VITRINE */}
      <nav className="h-24 border-b border-white/5 flex items-center justify-between px-8 lg:px-20 sticky top-0 bg-[#0B0F1A]/80 backdrop-blur-2xl z-100">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-transform hover:scale-105">
            <Image src="/images/qslogo.png" alt="Qualisoft" width={32} height={32} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black uppercase tracking-tighter m-0 leading-none italic">
              QUALI<span className="text-blue-600">SOFT</span>
            </h1>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Elite Matrix OS</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-12">
          <Link href="#solutions" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-500 transition-colors">Systèmes SDE</Link>
          <Link href="#iso" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-500 transition-colors">Conformité</Link>
          <Link href="/auth/login" className="group flex items-center gap-4 px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-blue-600 transition-all shadow-2xl shadow-blue-900/40">
            ACCÉDER AU COCKPIT <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* 🚀 HERO SECTION : SOUVERAINETÉ NUMÉRIQUE */}
      <section className="relative pt-36 pb-24 px-8 lg:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col items-start gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="inline-flex items-center gap-4 px-5 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full">
            <Fingerprint size={16} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Kernel v3.0 Scellé • RD-2026</span>
          </div>

          <h2 className="text-7xl lg:text-[10rem] font-black uppercase tracking-[calc(-0.05em)] leading-[0.85] m-0 italic drop-shadow-2xl text-left">
            PILOTEZ VOTRE <br />
            <span className="text-blue-600">SOUVERAINETÉ</span> <br />
            QUALITÉ.
          </h2>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-12 mt-10 text-left">
            <p className="text-xl text-slate-400 font-bold max-w-xl leading-tight uppercase italic border-l-4 border-blue-600 pl-8">
              L&apos;architecture SDE Matrix redéfinit le Management Intégré. Isolation multi-tenant, traçabilité absolue et conformité ISO native.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-[#0B0F1A] bg-slate-800 flex items-center justify-center shadow-lg">
                    <ShieldCheck size={18} className="text-blue-500" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-white italic">+250 Sceaux</span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Actifs sur le Réseau</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-12">
            <Link href="/auth/login" className="px-12 py-6 bg-white text-blue-950 rounded-4xl font-black uppercase text-xs tracking-[0.2em] flex items-center gap-4 hover:bg-blue-600 hover:text-white transition-all shadow-4xl group">
              Initialiser la Session <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 🛠️ SOLUTIONS GRID : ÉCOSYSTÈME ISO */}
      <section id="solutions" className="py-40 px-8 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={Network} 
            title="Multi-Tenant" 
            desc="Isolation atomique des données par sous-domaine souverain."
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Normes ISO" 
            desc="Workflows natifs 9001, 14001, 45001 scellés dans le Kernel."
          />
          <FeatureCard 
            icon={Cpu} 
            title="Matrix SDE" 
            desc="Système de Décision Éclairée piloté par télémétrie réelle."
          />
          <FeatureCard 
            icon={Lock} 
            title="Zéro Trust" 
            desc="Sécurité périmétrique sans dépendance NextAuth."
          />
        </div>
      </section>

      {/* 📊 ANALYTICS PREVIEW SECTION */}
      <section className="py-20 px-8 lg:px-20 max-w-7xl mx-auto">
        <div className="bg-white/5 border border-white/5 rounded-[4rem] p-12 lg:p-20 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
          <div className="text-left space-y-8 flex-1">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="text-white" size={24} />
             </div>
             <h3 className="text-4xl lg:text-6xl font-black uppercase italic leading-none tracking-tighter">
                TÉLÉMÉTRIE <br /> EN TEMPS RÉEL.
             </h3>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs leading-relaxed max-w-md">
                Visualisez l&apos;état de santé de votre SMI à travers tous vos sites. Détection proactive des non-conformités et pilotage des plans d&apos;actions CAPA.
             </p>
             <ul className="space-y-4 m-0 p-0 list-none">
                <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-500">
                   <ShieldCheck size={14} /> Intelligence ISO 9001:2015
                </li>
                <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                   <ShieldCheck size={14} /> Management Environnemental 14001
                </li>
             </ul>
          </div>
          <div className="flex-1 relative w-full aspect-video bg-black/40 rounded-3xl border border-white/10 shadow-4xl overflow-hidden group">
             <Image 
                src="/images/dashboard-preview.png" 
                alt="Dashboard Preview" 
                fill 
                className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000"
             />
             <div className="absolute inset-0 bg-linear-to-t from-[#0B0F1A] via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* 🏁 FOOTER PROTOCOL */}
      <footer className="py-24 border-t border-white/5 bg-[#080B14]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-10 shadow-2xl">
            <Image src="/images/qslogo.png" alt="Qualisoft" width={32} height={32} />
          </div>
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.8em] mb-8 m-0 italic text-center">
            Qualisoft Elite Matrix • RD-2026 Sovereign OS
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-30">
             {["ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018", "ISO 27001"].map((norm) => (
               <span key={norm} className="text-[10px] font-black uppercase tracking-widest">{norm}</span>
             ))}
          </div>
          <div className="mt-20 text-[9px] font-bold text-slate-700 uppercase tracking-widest italic">
            &copy; {new Date().getFullYear()} Qualisoft International. Tous droits de souveraineté réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * 🛰️ COMPOSANT INTERNE : FEATURE CARD
 */
function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-12 bg-white/5 border border-white/5 rounded-[4rem] hover:bg-white/[0.07] hover:border-blue-500/30 transition-all group flex flex-col items-start text-left shadow-2xl">
      <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-xl shadow-blue-900/10">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-black uppercase italic text-white mb-5 tracking-tight">{title}</h3>
      <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed m-0 tracking-wider">
        {desc}
      </p>
    </div>
  );
}