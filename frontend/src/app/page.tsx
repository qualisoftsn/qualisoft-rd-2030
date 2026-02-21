/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

/**
 * 🌍 MODULE : LANDING PAGE (PORTAIL PUBLIC QUALISOFT ELITE)
 * -------------------------------------------------------------------------
 * FONCTION : Vitrine de présentation et capture de prospects (Lead Gen).
 * RÔLE : Point d'entrée unique vers l'écosystème Multi-Tenant. 
 * ISOLATION : Ce portail est public, mais le formulaire d'essai nourrit
 * directement le sas de provisionnement sécurisé du Kernel Matrix.
 */

import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  Fingerprint,
  Mail,
  Rocket,
  ShieldCheck,
  Sparkles,
  MapPin,
  Phone,
  Facebook,
  Linkedin,
  Twitter
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Configuration des plans (Liée au système de facturation du SDE)
  const plans = [
    {
      name: "ESSAI",
      price: "0 FCFA",
      period: "/14 jours",
      desc: "Découverte totale de l'écosystème.",
      features: ["1 Utilisateur Matrix", "Conformité ISO 9001", "Support Standard", "Accès Cloud Souverain"],
      premium: false
    },
    {
      name: "ÉMERGENCE",
      price: "55.000 FCFA",
      period: "/mois",
      desc: "Idéal pour les PME en phase de structuration.",
      features: ["5 Utilisateurs", "ISO 9001 & 14001", "Gestion Documentaire", "Tableaux de bord"],
      premium: false
    },
    {
      name: "CROISSANCE",
      price: "105.000 FCFA",
      period: "/mois",
      desc: "Le standard industriel pour le multi-site.",
      features: ["20 Utilisateurs", "Full Pack ISO", "Audits & Non-Conformités", "Analytique Avancée"],
      premium: true
    },
    {
      name: "ENTREPRISE",
      price: "175.000 FCFA",
      period: "/mois",
      desc: "Performance globale et gestion des risques.",
      features: ["Utilisateurs Illimités", "Workflow Personnalisé", "Gestion des Risques", "Cockpit Direction"],
      premium: false
    },
    {
      name: "GROUPE",
      price: "Sur Devis",
      period: "",
      desc: "Souveraineté totale pour holdings.",
      features: ["Instance Dédiée", "SLA Garanti 99.9%", "Support Élite 24/7", "Sécurité Matrix avancée"],
      premium: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 selection:text-blue-200 font-sans italic">
      
      {/* --- NAVBAR ELITE --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F1A]/90 backdrop-blur-2xl border-b border-white/5 px-6 md:px-12 py-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg shadow-blue-600/40 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span className="font-black text-2xl text-white not-italic relative z-10">Q</span>
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none hidden md:block">
              Qualisoft <span className="text-blue-500">ELITE</span>
            </h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] hidden md:block mt-1">
              RD 2030 Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-8">
          {/* 🚧 MODE TEASING ACTIVÉ 
            Les boutons d'accès à la plateforme sont masqués temporairement 
            jusqu'au lancement officiel du 02 Mars 2026.
          */}
          {/* <Link href="/auth/login" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-amber-500 transition-all group">
            <Crown size={14} className="group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Master Access</span>
          </Link>
          <div className="hidden sm:block h-4 w-px bg-white/10"></div>
          <Link href="/auth/login" className="flex items-center gap-2 px-8 py-4 bg-blue-600 border border-blue-400/30 rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 active:scale-95">
            <LogIn size={16} /> Entrer dans la matrice
          </Link> 
          */}
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-56 pb-24 px-6 overflow-hidden text-center">
        {/* Décoration de fond */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img src="/QS_FondEcran.webp" alt="Fond Matrix Qualisoft" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-[#0B0F1A]/80 to-[#0B0F1A]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* 🚀 BADGE DE LANCEMENT : Animation "Spaced Blinking" et couleurs vibrantes */}
          <div className="relative inline-flex items-center justify-center mb-12 group">
            {/* Lueur externe pulsante */}
            <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-40 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
            
            {/* Badge Principal */}
            <div className="relative flex items-center gap-4 px-8 py-4 rounded-full bg-slate-900 border border-blue-500/50 text-white shadow-[0_0_40px_rgba(37,99,235,0.3)]">
              <div className="p-2 bg-blue-600/20 rounded-full">
                <Rocket size={20} className="text-blue-400 animate-bounce" />
              </div>
              {/* Le texte clignote doucement pour attirer l'œil sans agresser */}
              <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.4em] text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-white to-blue-400 animate-[pulse_2.5s_ease-in-out_infinite]">
                Lancement Officiel : 02 Mars 2026
              </span>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-10 italic drop-shadow-2xl">
            Pilotez votre <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-indigo-400 to-blue-600">Conformité.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-2xl font-bold italic mb-16 leading-relaxed">
            L&apos;excellence ISO 9001, 14001 et 45001 digitalisée. <br className="hidden md:block"/>Rejoignez l&apos;élite souveraine du pilotage d&apos;entreprise.
          </p>

          {/* FORMULAIRE D'ANTICIPATION (LEAD GEN) */}
          <div id="essai" className="max-w-lg mx-auto bg-white/5 border border-white/10 p-10 rounded-[3.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl mb-40 relative overflow-hidden">
            {/* Effet lumineux interne */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,1)]"></div>

            {!submitted ? (
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                <div className="text-left space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 ml-4 italic">Réserver mon accès prioritaire (14 Jours)</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                      type="email" 
                      required 
                      placeholder="votre.nom@entreprise.sn" 
                      className="w-full bg-[#0B0F1A]/80 border-2 border-white/10 rounded-3xl py-6 pl-16 text-sm text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" 
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-3xl transition-all flex items-center justify-center gap-4 text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/40 active:scale-95 border-none cursor-pointer">
                  DÉMARRER MON ESSAI ÉLITE <Sparkles size={20} />
                </button>
              </form>
            ) : (
              <div className="py-12 space-y-6 animate-in zoom-in duration-500 text-center">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Accès Réservé !</h3>
                  <p className="text-slate-400 text-[11px] font-black uppercase italic tracking-widest leading-relaxed">
                    Le Kernel a enregistré votre demande.<br/>L&apos;équipe Qualisoft vous contactera sous 48h.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* --- PLANS & TARIFS CONSOLIDÉS (Responsive Amélioré) --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
            {plans.map((plan, i) => (
              <div key={i} className={`relative p-8 rounded-[3rem] border-2 transition-all duration-500 hover:-translate-y-2 flex flex-col ${plan.premium ? 'border-blue-500 bg-blue-900/10 shadow-2xl shadow-blue-900/30' : 'border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10'}`}>
                
                {plan.premium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-[8px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/30 whitespace-nowrap">
                    Recommandé
                  </div>
                )}
                
                <h3 className="text-lg font-black uppercase italic mb-2 tracking-tighter text-white">{plan.name}</h3>
                <p className="text-slate-500 text-[9px] mb-6 uppercase font-bold italic h-10 leading-relaxed">{plan.desc}</p>
                
                <div className="mb-8 pb-8 border-b border-white/10">
                   <div className="text-2xl font-black italic text-white leading-none tracking-tighter">{plan.price}</div>
                   {plan.period && <div className="text-[10px] text-blue-400 uppercase font-black tracking-widest mt-2">{plan.period}</div>}
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3 text-[10px] font-bold uppercase text-slate-300 italic leading-snug">
                      <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" /> 
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="#essai" className={`block w-full py-4 rounded-2xl text-center text-[9px] font-black uppercase tracking-[0.2em] transition-all ${plan.premium ? 'bg-blue-600 text-white shadow-xl hover:bg-blue-500' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                  Sélectionner
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MODULES ÉLITE (Preuves de Valeur) --- */}
      <section className="py-32 px-6 border-t border-white/5 bg-black/40 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 text-center">
            {[
              { label: "ISO 9001/14001", icon: ShieldCheck, desc: "Souveraineté Totale" },
              { label: "Audits Digitaux", icon: ClipboardCheck, desc: "Zéro Papier Garanti" },
              { label: "Cockpit Direction", icon: Activity, desc: "Pilotage Temps Réel" },
              { label: "Sécurité Matrix", icon: Fingerprint, desc: "Isolation Multi-Tenant" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center space-y-5 group">
                <div className="w-20 h-20 rounded-4xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-500 shadow-xl">
                  <f.icon size={32} className="text-blue-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">{f.label}</h4>
                  <p className="text-[9px] text-slate-500 font-black uppercase mt-2 italic tracking-widest">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER SOUVERAIN (Coordonnées & Réseaux) --- */}
      <footer className="pt-24 pb-12 px-6 border-t border-white/10 bg-[#0B0F1A] relative overflow-hidden">
        {/* Glow de fond */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-blue-600/10 blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-left relative z-10 mb-20">
          
          {/* Colonne 1 : Branding & Réseaux */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">Q</div>
              <h4 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                Qualisoft <br/><span className="text-blue-600">ELITE</span>
              </h4>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-8 italic leading-relaxed">
              Le standard industriel de la digitalisation QHSE avec des économies réelles et la conformité assurée.
            </p>
            
            {/* Réseaux Sociaux */}
            <div className="flex gap-4">
              <a href="#" aria-label="LinkedIn Qualisoft" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-lg">
                <Linkedin size={20} />
              </a>
              <a href="#" aria-label="X / Twitter Qualisoft" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-lg">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="Facebook Qualisoft" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-lg">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Colonne 2 : Coordonnées Physiques */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 border-b border-white/5 pb-4">Siège Social</h4>
            <div className="flex items-start gap-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest leading-loose">
              <MapPin size={20} className="text-blue-500 shrink-0 mt-1" />
              <p className="italic">
                Villa 247, Route du Lac Rose, <br />
                Cité Cheikh Hann <br />
                <span className="text-white font-black">Dakar, Sénégal</span>
              </p>
            </div>
          </div>

          {/* Colonne 3 : Contact & Master Access */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 border-b border-white/5 pb-4">Contactez-nous</h4>
            
            <div className="flex items-start gap-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest leading-loose">
              <Phone size={20} className="text-blue-500 shrink-0 mt-1" />
              <p className="italic">
                +221 77 441 09 02 <br />
                +221 77 631 00 91
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest pt-2">
              <Mail size={20} className="text-blue-500 shrink-0" />
              <a href="mailto:ab.thiongane@qualisoft.sn" className="hover:text-blue-400 transition-colors italic border-b border-blue-500/30 pb-1">
                ab.thiongane@qualisoft.sn
              </a>
            </div>
          </div>

        </div>

        {/* Ligne de droits */}
        <div className="pt-8 border-t border-white/5 text-center relative z-10">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] italic">
            © 2026 QUALISOFT RD 2030 • TOUS DROITS RÉSERVÉS • ARCHITECTURE MULTI-TENANT SÉCURISÉE
          </p>
        </div>
      </footer>

    </div>
  );
}