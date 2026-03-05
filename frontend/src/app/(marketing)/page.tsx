//* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : LANDING PAGE VITRINE (QUALISOFT ELITE)
 * -------------------------------------------------------------------------
 * RÔLE : Conversion des prospects et présentation de la proposition de valeur.
 * DESIGN : Clean Tech, High-Trust, Focus Performance. PWA Ready.
 * RÉVISION : 04 Mars 2026 | 22:46 GMT
 * -------------------------------------------------------------------------
 */

import Link from "next/link";
import { ShieldCheck, BarChart3, HardHat, CheckCircle2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    // scroll-smooth permet une navigation fluide via les liens du header
    <div className="min-h-dvh bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 scroll-smooth overflow-x-hidden">
      
      {/* 1. NAVIGATION SOUVERAINE */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 md:px-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white font-black text-xl italic leading-none">Q</span>
            </div>
            <div className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tighter">
              Qualisoft <span className="text-blue-600">Elite</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 lg:space-x-10 font-bold text-[10px] lg:text-[11px] uppercase tracking-widest text-slate-500">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Fonctionnalités</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors">Tarifs</Link>
            <Link
              href="/auth/login"
              className="px-6 py-2.5 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0)] hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              Connexion Matrix
            </Link>
          </div>

          {/* Bouton Mobile Simplifié */}
          <div className="md:hidden">
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION : LA PROMESSE QHSE */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 px-4 md:px-6 overflow-hidden flex flex-col items-center justify-center min-h-[90dvh]">
        {/* Décoration de fond (Halo Matrix) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-full h-150 bg-linear-to-b from-blue-50/80 to-transparent -z-10 rounded-b-[100%]" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 text-blue-700 text-[9px] md:text-[10px] font-black uppercase tracking-widest animate-bounce">
            <ShieldCheck size={14} /> Certifié ISO 9001:2015 Ready
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tighter text-slate-950 px-2">
            Votre Conformité ISO <br className="hidden md:block" />
            <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
              sur Pilote Automatique.
            </span>
          </h1>
          
          <p className="text-base md:text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed italic px-4">
            La plateforme QHSE n°1 en Afrique de l&apos;Ouest qui transforme vos
            contraintes réglementaires en leviers de performance. 
            <span className="text-slate-900 font-bold"> Sans Excel, sans stress.</span>
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 pt-6 w-full px-4">
            <Link
              href="/auth/login" // Redirigé vers login car onboarding nécessite auth généralement, à adapter selon vos routes
              className="w-full md:w-auto bg-blue-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-slate-900 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              Démarrer le Hub <ArrowRight size={18} />
            </Link>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-tighter">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> Accès Sécurisé Matrix OS
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION CARACTÉRISTIQUES : LES PILIERS */}
      <section id="features" className="py-20 md:py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="group bg-white p-8 md:p-10 rounded-4xl md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-slate-100">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-blue-600 transition-colors">
                <ShieldCheck className="text-blue-600 group-hover:text-white transition-colors" size={24} />
              </div>
              <h3 className="text-lg md:text-xl font-black mb-4 uppercase tracking-tighter">Isolation Matrix</h3>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium italic">
                Souveraineté des données garantie. Isolation multi-tenant stricte : 
                votre patrimoine industriel reste dans votre propre coffre-fort numérique.
              </p>
            </div>

            {/* Feature 2 - Recommandé */}
            <div className="group bg-white p-8 md:p-10 rounded-4xl md:rounded-[2.5rem] shadow-xl border-t-4 border-blue-600 relative transform md:-translate-y-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-blue-600/20">
                <BarChart3 className="text-white" size={24} />
              </div>
              <h3 className="text-lg md:text-xl font-black mb-4 uppercase tracking-tighter">Dashboard Pulse</h3>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium italic">
                Visualisez votre niveau de conformité en temps réel. Pilotage par les 
                risques et indicateurs de performance automatisés pour vos revues de direction.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white p-8 md:p-10 rounded-4xl md:rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-slate-100">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-blue-600 transition-colors">
                <HardHat className="text-blue-600 group-hover:text-white transition-colors" size={24} />
              </div>
              <h3 className="text-lg md:text-xl font-black mb-4 uppercase tracking-tighter">HSE Terrain 2.0</h3>
              <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium italic">
                Mobilité totale. Déclarez les situations dangereuses et presqu&apos;accidents 
                directement depuis le chantier. Réactivité immédiate du PAQ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION PRICING : STRATÉGIE DE CROISSANCE */}
      <section id="pricing" className="py-20 md:py-32 px-4 md:px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 uppercase tracking-tighter italic">
            Choisissez votre <span className="text-blue-600 text-4xl md:text-6xl">Ambition</span>
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mb-12 md:mb-20 italic">
            Des tarifs adaptés au tissu industriel africain
          </p>
          
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* PACK EMERGENCE */}
            <div className="p-8 md:p-12 border-2 border-slate-100 rounded-[2.5rem] md:rounded-[3.5rem] text-left hover:border-blue-200 transition-all duration-500 group">
              <h3 className="text-xl md:text-2xl font-black mb-2 uppercase tracking-tighter">Pack Emergence</h3>
              <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase mb-8 tracking-widest">Pour les PME en croissance</p>
              <div className="text-4xl md:text-5xl font-black mb-8 md:mb-10 text-slate-900 italic">
                0 FCFA{" "}
                <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">/ mois</span>
              </div>
              <ul className="space-y-4 md:space-y-5 mb-10 md:mb-12">
                <PricingFeature text="Jusqu'à 3 processus métier" active />
                <PricingFeature text="Gestion documentaire (GED)" active />
                <PricingFeature text="Plan d'Actions (PAQ) Standard" active />
                <PricingFeature text="Module Risques & Opportunités" active={false} />
                <PricingFeature text="Rapports de Direction Automatiques" active={false} />
              </ul>
              <Link
                href="/auth/login"
                className="block text-center py-4 md:py-5 rounded-2xl border-2 border-slate-950 font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-slate-950 hover:text-white transition-all"
              >
                S&apos;inscrire au programme
              </Link>
            </div>

            {/* PACK ELITE - LE PIVOT */}
            <div className="p-8 md:p-12 bg-slate-950 text-white rounded-[2.5rem] md:rounded-[4rem] text-left shadow-[0_20px_40px_rgba(0,0,0,0.2)] lg:shadow-[0_40px_80px_rgba(0,0,0,0.15)] relative overflow-hidden border-2 border-blue-600/30">
              <div className="absolute top-0 right-0 bg-blue-600 text-[8px] md:text-[9px] font-black px-4 md:px-6 py-2 rounded-bl-xl md:rounded-bl-2xl uppercase tracking-[0.3em]">
                Recommandé
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-2 uppercase tracking-tighter">Pack Elite</h3>
              <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase mb-8 tracking-widest">Pour les leaders industriels</p>
              <div className="text-4xl md:text-5xl font-black mb-8 md:mb-10 italic">Sur Devis</div>
              <ul className="space-y-4 md:space-y-5 mb-10 md:mb-12">
                <PricingFeature text="Processus illimités" active light />
                <PricingFeature text="Module Risques complet" active light />
                <PricingFeature text="Exports PDF & Rapports ISO" active light />
                <PricingFeature text="Support Premium 24/7 (Dakar)" active light />
              </ul>
              <Link
                href="/auth/login"
                className="block text-center py-5 md:py-6 rounded-2xl bg-blue-600 font-black uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] hover:bg-white hover:text-blue-600 transition-all shadow-xl shadow-blue-900/40"
              >
                Passer au niveau Elite
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="py-8 md:py-12 border-t border-slate-50 text-center px-4">
        <p className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] md:tracking-[0.8em]">
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
    <li className={`flex items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest ${!active ? 'opacity-30' : ''}`}>
      <CheckCircle2 size={16} className={`shrink-0 ${active ? (light ? 'text-blue-400' : 'text-blue-600') : (light ? 'text-slate-800' : 'text-slate-200')}`} />
      <span className={light ? 'text-slate-100' : 'text-slate-600'}>{text}</span>
    </li>
  );
}