/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : RootPage (Landing Showcase)
 * -------------------------------------------------------------------------
 * RÔLE : Portail d'entrée Haute-Fidélité pour elite.qualisoft.sn.
 * DESIGN : Showcase Produit • Plans Stratégiques • Triple Capture.
 * RÉVISION : 04 Mars 2026 | 00:25 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Fingerprint, 
  Smartphone, Tablet, Monitor, CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden">
      
      {/* 🔮 NAVIGATION HAUTE-PRÉCISION */}
      <nav className="h-24 border-b border-white/5 flex items-center justify-between px-8 lg:px-20 sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-2xl z-100">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-2xl">
            <Image src="/images/qslogo.png" alt="Qualisoft" width={28} height={28} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter m-0 italic">
            QUALI<span className="text-blue-600">SOFT</span> <span className="text-slate-500 font-medium">ELITE</span>
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/auth/login" className="px-8 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-lg shadow-blue-900/20">
            DÉPLOYER LA MATRICE
          </Link>
        </div>
      </nav>

      {/* 🚀 HERO : VISION SDE */}
      <section className="relative pt-32 pb-20 px-8 lg:px-20 max-w-7xl mx-auto text-left">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-8">
            <Fingerprint size={14} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Architecture Matrix RD-2026 Scellée</span>
          </div>
          <h2 className="text-6xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.9] mb-10 italic">
            L&apos;INTELLIGENCE <br />
            <span className="text-blue-600">NORMATIVE</span> <br />
            SOUVERAINE.
          </h2>
        </div>
      </section>

      {/* 🖼️ SECTION SHOWCASE : LES TROIS IMAGES DE LA PLATEFORME */}
      <section className="py-20 px-8 lg:px-20 bg-white/2 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-16 text-center italic">
            Une interface unique • Trois environnements de pilotage
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-end">
            {/* Image 1 : Mobile Focus */}
            <div className="group space-y-6">
              <div className="relative aspect-9/16 bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-4xl overflow-hidden transition-transform group-hover:-translate-y-4 duration-700">
                <Image src="/images/showcase-mobile.png" alt="SDE Mobile" fill className="object-cover opacity-80" />
                <div className="absolute inset-0 bg-linear-to-t from-blue-900/40 to-transparent" />
              </div>
              <div className="text-center">
                <Smartphone className="text-blue-500 mx-auto mb-2" size={24} />
                <p className="text-xs font-black uppercase italic m-0">Elite Mobile Access</p>
              </div>
            </div>

            {/* Image 2 : Desktop Main Dashboard (Centrale) */}
            <div className="group space-y-6 lg:-mb-10">
              <div className="relative aspect-video bg-slate-900 rounded-4xl border-8 border-slate-800 shadow-[0_0_80px_rgba(37,99,235,0.15)] overflow-hidden transition-all group-hover:scale-105 duration-700">
                <Image src="/images/showcase-desktop.png" alt="SDE Desktop" fill className="object-cover" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
              </div>
              <div className="text-center">
                <Monitor className="text-blue-500 mx-auto mb-2" size={32} />
                <p className="text-sm font-black uppercase italic m-0">Cockpit Décisionnel Matrix</p>
              </div>
            </div>

            {/* Image 3 : Tablet / Audit Terrain */}
            <div className="group space-y-6">
              <div className="relative aspect-4/3 bg-slate-900 rounded-[2.5rem] border-8 border-slate-800 shadow-4xl overflow-hidden transition-transform group-hover:-translate-y-4 duration-700">
                <Image src="/images/showcase-tablet.png" alt="SDE Tablet" fill className="object-cover opacity-80" />
                <div className="absolute inset-0 bg-linear-to-t from-indigo-900/40 to-transparent" />
              </div>
              <div className="text-center">
                <Tablet className="text-blue-500 mx-auto mb-2" size={24} />
                <p className="text-xs font-black uppercase italic m-0">Module Audit & Preuves</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🗺️ LES PLANS STRATÉGIQUES (Déploiement) */}
      <section className="py-40 px-8 lg:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-20">
          <div className="lg:w-1/3 space-y-8 sticky top-40 text-left">
            <h3 className="text-4xl font-black uppercase italic leading-none tracking-tighter">
              NOS PLANS DE <br /> <span className="text-blue-600">DÉPLOIEMENT.</span>
            </h3>
            <p className="text-slate-500 font-bold uppercase text-xs leading-relaxed">
              Choisissez le niveau d&apos;intégration adapté à la maturité de votre Système de Management.
            </p>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
            <PlanCard 
              title="Elite Core"
              price="Standard ISO"
              features={["GED Documentaire", "Gestion des Risques", "Actions Correctives", "Support 24/7"]}
            />
            <PlanCard 
              title="Matrix Sovereign"
              price="Full Performance"
              active
              features={["Tout le pack Core", "Télémétrie Temps Réel", "Multi-Tenant Illimité", "Audit Smart-Check", "API Intégration Native"]}
            />
          </div>
        </div>
      </section>

      {/* 🏁 FOOTER */}
      <footer className="py-20 border-t border-white/5 bg-[#080B14]">
        <div className="max-w-7xl mx-auto px-8 text-center space-y-12">
          <p className="text-[11px] font-black text-slate-700 uppercase tracking-[0.8em] m-0 italic">
            Qualisoft Elite Matrix • RD-2026
          </p>
          <div className="flex justify-center gap-10 opacity-20">
             <Image src="/images/qslogo.png" alt="Logo" width={40} height={40} className="grayscale" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function PlanCard({ title, price, features, active = false }: any) {
  return (
    <div className={`p-10 rounded-[3rem] border transition-all duration-500 text-left ${active ? 'bg-blue-600 border-blue-500 shadow-2xl shadow-blue-900/20 scale-105' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
      <h4 className={`text-2xl font-black uppercase italic mb-2 ${active ? 'text-white' : 'text-blue-500'}`}>{title}</h4>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-8">{price}</p>
      <ul className="space-y-4 list-none p-0 m-0 mb-10">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wide">
            <CheckCircle2 size={14} className={active ? 'text-blue-200' : 'text-blue-500'} /> {f}
          </li>
        ))}
      </ul>
      <Link href="/auth/login" className={`block text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600 hover:bg-slate-100' : 'bg-white/10 text-white hover:bg-white/20'}`}>
        Sélectionner le Plan
      </Link>
    </div>
  );
}