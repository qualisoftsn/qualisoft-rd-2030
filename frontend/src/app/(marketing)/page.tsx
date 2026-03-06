'use client';

/**
 * 💎 MODULE : ELITE LANDING ENGINE (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Conversion & Acquisition Clients.
 * DESIGN : High-Tech White, ClickUp Minimalist, Apple-like precision.
 * RÉVISION : 06 Mars 2026 | 02:05 GMT
 * -------------------------------------------------------------------------
 */

import React from "react";
import Link from "next/link";
import { ShieldCheck, BarChart3, HardHat, CheckCircle2, ArrowRight, Zap, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white text-slate-950 font-sans selection:bg-blue-600 selection:text-white scroll-smooth overflow-x-hidden italic">
      
      {/* 🔝 HEADER SOUVERAIN */}
      <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-5 px-6 md:px-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 rotate-3">
              <span className="text-white font-black text-2xl italic leading-none">Q</span>
            </div>
            <div className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">
              Qualisoft <span className="text-blue-600">Elite</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-12 font-black text-[11px] uppercase tracking-widest text-slate-500">
            <Link href="#features" className="hover:text-blue-600 transition-colors no-underline">Technologies</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors no-underline">Solutions</Link>
            <Link href="/auth/login" className="bg-slate-900 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-all shadow-xl no-underline">
              S'identifier
            </Link>
          </div>
        </div>
      </nav>

      {/* 🚀 HERO : PROMESSE QHSE 2030 */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[95dvh] text-center">
        {/* HALO DÉCORATIF */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-blue-50 to-transparent -z-10 opacity-60" />
        
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/40">
            <ShieldCheck size={16} /> Certifié ISO-READY 2026
          </div>
          
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-[ -0.05em] text-slate-950 italic">
            MAÎTRISEZ VOTRE <br />
            <span className="text-blue-600">CONFORMITÉ.</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto font-bold leading-relaxed px-4 italic uppercase tracking-tight">
            Le noyau QHSE nouvelle génération pour l'industrie africaine. 
            <span className="text-slate-900 underline decoration-blue-600 decoration-4 underline-offset-8"> Zéro papier. Zéro risque.</span>
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 pt-10">
            <Link
              href="/auth/login"
              className="w-full md:w-auto bg-blue-600 text-white px-12 py-6 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-4 no-underline"
            >
              Lancer l'Expérience <ArrowRight size={20} />
            </Link>
            <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <Zap size={20} className="text-amber-500" /> SÉCURISÉ PAR MATRIX CORE
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ FEATURES : LES PILIERS INDUSTRIELS */}
      <section id="features" className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={Globe} 
              title="Souveraineté" 
              desc="Vos données résident dans votre propre nœud Matrix. Isolation cryptographique totale entre les locataires." 
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Dashboard Pulse" 
              highlight 
              desc="Visualisez votre conformité ISO en temps réel avec des indicateurs prédictifs et automatisés." 
            />
            <FeatureCard 
              icon={HardHat} 
              title="Mobilité Terrain" 
              desc="Déclarez incidents et anomalies en 3 clics sur mobile, même hors ligne. Synchronisation atomique." 
            />
          </div>
        </div>
      </section>

      {/* 💰 PRICING : L'ACCÈS À L'ÉLITE */}
      <section id="pricing" className="py-40 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-7xl font-black mb-10 uppercase tracking-tighter italic">L'INVESTISSEMENT <span className="text-blue-600">SÛR</span></h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-stretch pt-10 text-left">
            {/* PACK EMERGENCE */}
            <div className="p-12 border-4 border-slate-100 rounded-[3rem] hover:border-blue-600/10 transition-all flex flex-col">
              <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter text-slate-900">Emergence</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">PME & STARTUPS INDUSTRIELLES</p>
              <div className="text-5xl font-black italic mb-12">0 FCFA <span className="text-xs uppercase text-slate-400 tracking-widest">/ mois</span></div>
              <ul className="space-y-6 flex-1 mb-12">
                <PricingItem text="3 Processus Métier" />
                <PricingItem text="Plan d'Actions Standard" />
                <PricingItem text="GED Cloud Sécurisée" />
              </ul>
              <Link href="/auth/login" className="w-full py-5 rounded-2xl border-4 border-slate-900 text-center font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all no-underline">Démarrer Gratuitement</Link>
            </div>

            {/* PACK ELITE */}
            <div className="p-12 bg-slate-950 text-white rounded-[4rem] shadow-2xl relative overflow-hidden border-4 border-blue-600 flex flex-col">
              <div className="absolute top-0 right-0 bg-blue-600 px-6 py-2 text-[10px] font-black uppercase tracking-widest italic">Standard Industriel</div>
              <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">Elite</h3>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-10">GRANDS COMPTES & MULTI-SITES</p>
              <div className="text-5xl font-black italic mb-12">Sur Devis</div>
              <ul className="space-y-6 flex-1 mb-12">
                <PricingItem text="Processus Illimités" light />
                <PricingItem text="Module Risques & Opportunités" light />
                <PricingItem text="Audit Interne Automatisé" light />
                <PricingItem text="Support Premium 24/7" light />
              </ul>
              <Link href="/auth/login" className="w-full py-6 rounded-3xl bg-blue-600 text-center font-black uppercase text-[11px] tracking-widest hover:bg-white hover:text-blue-600 transition-all no-underline shadow-xl shadow-blue-900/40">Contacter le Hub Elite</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-slate-50 text-center opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.8em]">Qualisoft Elite RD 2030 • Digital Sovereignty</p>
      </footer>
    </div>
  );
}

// COMPOSANTS ATOMIQUES
function FeatureCard({ icon: Icon, title, desc, highlight = false }: any) {
  return (
    <div className={`p-10 rounded-[3rem] transition-all duration-500 border-2 ${highlight ? 'bg-white shadow-2xl border-blue-600 -translate-y-4' : 'bg-white border-slate-50 hover:shadow-xl'}`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${highlight ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
        <Icon size={32} strokeWidth={2.5} />
      </div>
      <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tighter">{title}</h3>
      <p className="text-slate-500 font-bold leading-relaxed italic text-sm uppercase tracking-tight">{desc}</p>
    </div>
  );
}

function PricingItem({ text, light = false }: any) {
  return (
    <li className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest italic">
      <CheckCircle2 size={18} className={light ? 'text-blue-400' : 'text-blue-600'} />
      <span className={light ? 'text-slate-200' : 'text-slate-600'}>{text}</span>
    </li>
  );
}