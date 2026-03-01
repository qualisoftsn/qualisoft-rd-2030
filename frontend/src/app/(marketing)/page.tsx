/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : LANDING PAGE VITRINE (QUALISOFT ELITE)
 * -------------------------------------------------------------------------
 * RÔLE : Conversion des prospects et présentation de la proposition de valeur.
 * DESIGN : Clean Tech, High-Trust, Focus Performance.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 14:20 GMT
 */

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, BarChart3, HardHat, CheckCircle2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. NAVIGATION SOUVERAINE */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6 md:px-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl italic">Q</span>
            </div>
            <div className="text-xl font-black text-slate-900 uppercase tracking-tighter">
              Qualisoft <span className="text-blue-600">Elite</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-10 font-bold text-[11px] uppercase tracking-widest text-slate-500">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Fonctionnalités</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors">Tarifs</Link>
            <Link
              href="/auth/login"
              className="px-6 py-2.5 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              Connexion Matrix
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION : LA PROMESSE QHSE */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        {/* Décoration de fond (Halo Matrix) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-150 bg-linear-to-b from-blue-50/50 to-transparent -z-10" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest animate-bounce">
            <ShieldCheck size={14} /> Certifié ISO 9001:2015 Ready
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter text-slate-950">
            Votre Conformité ISO <br />
            <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
              sur Pilote Automatique.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed italic">
            La plateforme QHSE n°1 en Afrique de l&apos;Ouest qui transforme vos
            contraintes réglementaires en leviers de performance. 
            <span className="text-slate-900 font-bold"> Sans Excel, sans stress.</span>
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 pt-6">
            <Link
              href="/auth/onboarding"
              className="w-full md:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-slate-900 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              Démarrer l&apos;essai gratuit <ArrowRight size={18} />
            </Link>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-tighter">
              <CheckCircle2 size={16} className="text-emerald-500" /> 14 jours d&apos;essai — Sans CB
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION CARACTÉRISTIQUES : LES PILIERS */}
      <section id="features" className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-slate-100">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors">
                <ShieldCheck className="text-blue-600 group-hover:text-white" size={28} />
              </div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Isolation Matrix</h3>
              <p className="text-slate-500 leading-relaxed font-medium italic">
                Souveraineté des données garantie. Isolation multi-tenant stricte : 
                votre patrimoine industriel reste dans votre propre coffre-fort numérique.
              </p>
            </div>

            {/* Feature 2 - Recommandé */}
            <div className="group bg-white p-10 rounded-[2.5rem] shadow-xl border-t-4 border-blue-600 relative">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8">
                <BarChart3 className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Dashboard Pulse</h3>
              <p className="text-slate-500 leading-relaxed font-medium italic">
                Visualisez votre niveau de conformité en temps réel. Pilotage par les 
                risques et indicateurs de performance automatisés pour vos revues de direction.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-slate-100">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors">
                <HardHat className="text-blue-600 group-hover:text-white" size={28} />
              </div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">HSE Terrain 2.0</h3>
              <p className="text-slate-500 leading-relaxed font-medium italic">
                Mobilité totale. Déclarez les situations dangereuses et presqu&apos;accidents 
                directement depuis le chantier. Réactivité immédiate du PAQ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION PRICING : STRATÉGIE DE CROISSANCE */}
      <section id="pricing" className="py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter italic">
            Choisissez votre <span className="text-blue-600 text-6xl">Ambition</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-20 italic">
            Des tarifs adaptés au tissu industriel africain
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* PACK EMERGENCE */}
            <div className="p-12 border-2 border-slate-100 rounded-[3.5rem] text-left hover:border-blue-200 transition-all duration-500 group">
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Pack Emergence</h3>
              <p className="text-slate-400 text-xs font-bold uppercase mb-8 tracking-widest">Pour les PME en croissance</p>
              <div className="text-5xl font-black mb-10 text-slate-900 italic">
                0 FCFA{" "}
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">/ mois</span>
              </div>
              <ul className="space-y-5 mb-12">
                <PricingFeature text="Jusqu'à 3 processus métier" active />
                <PricingFeature text="Gestion documentaire (GED)" active />
                <PricingFeature text="Plan d'Actions (PAQ) Standard" active />
                <PricingFeature text="Module Risques & Opportunités" active={false} />
                <PricingFeature text="Rapports de Direction Automatiques" active={false} />
              </ul>
              <Link
                href="/auth/onboarding"
                className="block text-center py-5 rounded-2xl border-2 border-slate-950 font-black uppercase text-[10px] tracking-widest hover:bg-slate-950 hover:text-white transition-all"
              >
                S&apos;inscrire au programme
              </Link>
            </div>

            {/* PACK ELITE - LE PIVOT */}
            <div className="p-12 bg-slate-950 text-white rounded-[4rem] text-left shadow-[0_40px_80px_rgba(0,0,0,0.15)] relative overflow-hidden border-2 border-blue-600/30">
              <div className="absolute top-0 right-0 bg-blue-600 text-[9px] font-black px-6 py-2 rounded-bl-2xl uppercase tracking-[0.3em]">
                Recommandé
              </div>
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Pack Elite</h3>
              <p className="text-slate-500 text-xs font-bold uppercase mb-8 tracking-widest">Pour les leaders industriels</p>
              <div className="text-5xl font-black mb-10 italic">Sur Devis</div>
              <ul className="space-y-5 mb-12">
                <PricingFeature text="Processus illimités" active light />
                <PricingFeature text="Module Risques complet" active light />
                <PricingFeature text="Exports PDF & Rapports ISO" active light />
                <PricingFeature text="Support Premium 24/7 (Dakar)" active light />
              </ul>
              <Link
                href="/auth/onboarding"
                className="block text-center py-6 rounded-2xl bg-blue-600 font-black uppercase text-xs tracking-[0.3em] hover:bg-white hover:text-blue-600 transition-all shadow-2xl shadow-blue-900/40"
              >
                Passer au niveau Elite
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="py-12 border-t border-slate-50 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.8em]">
          Qualisoft Elite RD 2030 • Souveraineté Numérique Sénégalaise
        </p>
      </footer>
    </div>
  );
}

/**
 * 🛠️ COMPOSANT INTERNE : PricingFeature
 */
function PricingFeature({ text, active, light = false }: { text: string; active: boolean; light?: boolean }) {
  return (
    <li className={`flex items-center gap-3 text-xs font-bold uppercase tracking-widest ${!active ? 'opacity-30' : ''}`}>
      <CheckCircle2 size={16} className={active ? (light ? 'text-blue-400' : 'text-blue-600') : (light ? 'text-slate-800' : 'text-slate-200')} />
      <span className={light ? 'text-slate-100' : 'text-slate-600'}>{text}</span>
    </li>
  );
}