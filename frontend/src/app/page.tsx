/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

/**
 * 🌍 MODULE : LANDING PAGE (PORTAIL PUBLIC QUALISOFT ELITE)
 * -------------------------------------------------------------------------
 * FONCTION : Vitrine de présentation et capture de prospects (Lead Gen).
 * RESTAURATION : Date au 15 Mars 2026, Formulaire complet, Quiz, 3 Images tournantes.
 * DESIGN : Elite MS, Glassmorphism, Souveraineté.
 * RÉVISION : 09 Mars 2026
 * -------------------------------------------------------------------------
 */

import {
  Activity, CheckCircle2, ClipboardCheck, Facebook, FileDown,
  Fingerprint, Linkedin, Mail, MapPin, Phone, Rocket,
  ShieldCheck, Sparkles, Twitter, BrainCircuit, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const plans = [
    { name: "ESSAI", price: "0 FCFA", period: "/14 jours", desc: "Découverte totale de l'écosystème.", features: ["1 Utilisateur Matrix", "Conformité ISO 9001", "Support Standard", "Accès Cloud Souverain"], premium: false },
    { name: "ÉMERGENCE", price: "55.000 FCFA", period: "/mois", desc: "Idéal pour les PME en phase de structuration.", features: ["5 Utilisateurs", "ISO 9001 & 14001", "Gestion Documentaire", "Tableaux de bord"], premium: false },
    { name: "CROISSANCE", price: "105.000 FCFA", period: "/mois", desc: "Le standard industriel pour le multi-site.", features: ["20 Utilisateurs", "Full Pack ISO", "Audits & Non-Conformités", "Analytique Avancée"], premium: true },
    { name: "ENTREPRISE", price: "175.000 FCFA", period: "/mois", desc: "Performance globale et gestion des risques.", features: ["Utilisateurs Illimités", "Workflow Personnalisé", "Gestion des Risques", "Cockpit Direction"], premium: false },
    { name: "GROUPE", price: "Sur Devis", period: "", desc: "Souveraineté totale pour holdings.", features: ["Instance Dédiée", "SLA Garanti 99.9%", "Support Élite 24/7", "Sécurité Matrix avancée"], premium: false },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white selection:bg-blue-600/30 selection:text-blue-200 font-sans italic overflow-x-hidden">
      
      {/* --- NAVBAR ELITE --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F1A]/90 backdrop-blur-2xl border-b border-white/5 px-6 md:px-12 py-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="h-12 w-auto flex items-center justify-center relative group">
            <img src="/images/qslogo.png" alt="Qualisoft Logo" className="h-full w-auto object-contain filter brightness-110 group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none hidden md:block m-0">
              Qualisoft <span className="text-blue-500">ELITE</span>
            </h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] hidden md:block mt-1 m-0">
              RD 2030 Architecture
            </p>
          </div>
        </div>
        
        <Link 
          href="/auth/login" 
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 no-underline"
        >
          Accès Matrix
        </Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-12 px-6 overflow-hidden text-center">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-b from-[#0B0F1A] via-[#0B0F1A]/80 to-[#0B0F1A]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="relative inline-flex items-center justify-center mb-12 group">
            <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-40 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
            <div className="relative flex items-center gap-4 px-8 py-4 rounded-full bg-slate-900 border border-blue-500/50 text-white shadow-[0_0_40px_rgba(37,99,235,0.3)]">
              <div className="p-2 bg-blue-600/20 rounded-full">
                <Rocket size={20} className="text-blue-400 animate-bounce" />
              </div>
              {/* RESTAURATION DE LA DATE EXACTE */}
              <span className="text-[13px] md:text-xs font-black uppercase tracking-[0.4em] text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-white to-blue-400 animate-[pulse_2.5s_ease-in-out_infinite]">
                Lancement Officiel : 15 Mars 2026
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-10 italic drop-shadow-2xl">
            Pilotez notre <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-indigo-400 to-blue-600">
              Conformité.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-2xl font-bold italic mb-16 leading-relaxed">
            L&apos;excellence ISO 9001, 14001 et 45001 digitalisée. <br className="hidden md:block" />
            Rejoignez l&apos;élite souveraine du pilotage d&apos;entreprise.
          </p>

          {/* DUAL ACTION : FORMULAIRE COMPLET + QUIZ DE MATURITÉ */}
          <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch max-w-5xl mx-auto mb-20">
            
            {/* RESTAURATION : FORMULAIRE COMPLET D'ESSAI */}
            <div id="essai" className="flex-1 bg-white/5 border border-white/10 p-8 md:p-10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,1)]"></div>
              {!submitted ? (
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                  <div className="text-left mb-6">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Essai Prioritaire (14 J)</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 italic">Provisionnement sécurisé du Kernel Matrix</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" required placeholder="Nom Complet" className="w-full bg-[#0B0F1A]/80 border-2 border-white/10 rounded-2xl py-4 px-5 text-xs text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" />
                    <input type="text" required placeholder="Entreprise" className="w-full bg-[#0B0F1A]/80 border-2 border-white/10 rounded-2xl py-4 px-5 text-xs text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" />
                  </div>
                  <input type="email" required placeholder="Email Professionnel (ex: nom@entreprise.sn)" className="w-full bg-[#0B0F1A]/80 border-2 border-white/10 rounded-2xl py-4 px-5 text-xs text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" />
                  <input type="tel" required placeholder="Téléphone / WhatsApp" className="w-full bg-[#0B0F1A]/80 border-2 border-white/10 rounded-2xl py-4 px-5 text-xs text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" />

                  <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/40 active:scale-95 border-none cursor-pointer">
                    DÉMARRER MON ESSAI <Sparkles size={18} />
                  </button>
                </form>
              ) : (
                <div className="py-16 space-y-6 animate-in zoom-in duration-500 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Accès Réservé !</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase italic tracking-widest leading-relaxed">
                      Le Kernel a enregistré votre demande.<br/>L&apos;équipe Qualisoft vous contactera sous 48h.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RESTAURATION : LE QUIZ DE MATURITÉ */}
            <div className="flex-1 bg-linear-to-br from-indigo-900/40 to-blue-900/20 border border-blue-500/20 p-8 md:p-10 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-blue-500/50 transition-all cursor-pointer">
              <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                 <BrainCircuit size={200} />
              </div>
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform">
                 <BrainCircuit size={40} className="text-blue-400" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4 relative z-10">Quiz de Maturité</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 italic mb-8 relative z-10 max-w-sm leading-relaxed">
                Évaluez la performance de votre Système de Management. Obtenez un diagnostic flash gratuit de vos processus et risques.
              </p>
              <button className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-50 transition-all flex items-center gap-3 relative z-10 shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                LANCER LE DIAGNOSTIC <ArrowRight size={16} />
              </button>
            </div>

          </div>

          {/* ZONE INFO */}
          <div className="mb-24">
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-2">Besoin de plus d&apos;informations ?</p>
            <Link href="/resources/download" className="flex items-center justify-center gap-3 text-[10px] font-black text-blue-400 hover:text-white transition-colors uppercase tracking-widest group">
              <FileDown size={13} className="group-hover:translate-y-1 transition-transform" />
              Télécharger le Guide Stratégique ISO 2026
            </Link>
          </div>

          {/* --- RESTAURATION : LES 3 IMAGES QUI TOURNOIENT (NEW ELITE VISUAL SHOWCASE) --- */}
          {/* L'animation custom 'animate-spin-slow' fait tourner l'ensemble du conteneur en 3D */}
          <div className="max-w-7xl mx-auto mb-32 px-4 perspective-1000">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
              
              {/* Effet tournoyant de fond global */}
              <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full animate-[spin_20s_linear_infinite]" />

              {/* Image 1: Cockpit Opérationnel */}
              <div className="group relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/50 shadow-2xl transition-all duration-700 hover:scale-[1.05] hover:-rotate-2 hover:z-10 animate-[float_6s_ease-in-out_infinite]">
                <div className="p-6 text-left absolute z-10 top-0 left-0 w-full bg-linear-to-b from-black/80 to-transparent pt-6 pb-12">
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Kernel Matrix V2</span>
                  <h4 className="text-lg font-black italic uppercase leading-tight mt-1 text-white">Cockpit Opérationnel</h4>
                </div>
                <img src="/images/QS_cockpit.jpg" alt="Cockpit Direction" className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-110" />
              </div>

              {/* Image 2: Revue de Direction Strategic */}
              <div className="group relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/50 shadow-2xl transition-all duration-700 hover:scale-[1.05] hover:rotate-2 hover:z-10 animate-[float_6s_ease-in-out_infinite_1s]">
                <div className="p-6 text-left absolute z-10 top-0 left-0 w-full bg-linear-to-b from-black/80 to-transparent pt-6 pb-12">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Intelligence Stratégique</span>
                  <h4 className="text-lg font-black italic uppercase leading-tight mt-1 text-white">Revue de Direction</h4>
                </div>
                <img src="/images/QS_Revuedirection.jpg" alt="Revue de direction" className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-110" />
              </div>

              {/* Image 3: Architecture SMI */}
              <div className="group relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/50 shadow-2xl transition-all duration-700 hover:scale-[1.05] hover:-rotate-1 hover:z-10 animate-[float_6s_ease-in-out_infinite_2s]">
                <div className="p-6 text-left absolute z-10 top-0 left-0 w-full bg-linear-to-b from-black/80 to-transparent pt-6 pb-12">
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-500">Pyramide Structurelle</span>
                  <h4 className="text-lg font-black italic uppercase leading-tight mt-1 text-white">Architecture SMI</h4>
                </div>
                <img src="/images/qsorg01.gif" alt="Structure Organique" className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-110" />
              </div>

            </div>
          </div>

          {/* PLANS ET TARIFS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left relative z-10">
            {plans.map((plan, i) => (
              <div key={i} className={`relative p-8 rounded-[3rem] border-2 transition-all duration-500 hover:-translate-y-2 flex flex-col ${plan.premium ? "border-blue-500 bg-blue-900/10 shadow-2xl shadow-blue-900/30" : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10"}`}>
                {plan.premium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-[8px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/30 whitespace-nowrap text-white">
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
                <Link href="#essai" className={`block w-full py-4 rounded-2xl text-center text-[9px] font-black uppercase tracking-[0.2em] transition-all no-underline ${plan.premium ? "bg-blue-600 text-white shadow-xl hover:bg-blue-500" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}>
                  Sélectionner
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MODULES ÉLITE --- */}
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
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-500 shadow-xl">
                  <f.icon size={30} className="text-blue-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white m-0">{f.label}</h4>
                  <p className="text-[9px] text-slate-500 font-black uppercase mt-2 italic tracking-widest m-0">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER SOUVERAIN --- */}
      <footer className="pt-24 pb-12 px-6 border-t border-white/10 bg-[#0B0F1A] relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-blue-600/10 blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-left relative z-10 mb-20">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img src="/images/qslogo.png" alt="Qualisoft Elite" className="h-10 w-auto opacity-100 filter brightness-110" />
              <h4 className="text-2xl font-black uppercase tracking-tighter text-white leading-none m-0">Qualisoft <br /><span className="text-blue-600">ELITE</span></h4>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-8 italic leading-relaxed">
              Le standard industriel de la digitalisation QHSE avec des économies réelles et la conformité assurée.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><Linkedin size={20} /></a>
              <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><Twitter size={20} /></a>
              <a href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><Facebook size={20} /></a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 border-b border-white/5 pb-4 m-0">Siège Social</h4>
            <div className="flex items-start gap-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest leading-loose">
              <MapPin size={20} className="text-blue-500 shrink-0 mt-1" />
              <p className="italic m-0">Villa 247, Route du Lac Rose, <br /> Cité Cheikh Hann <br /> <span className="text-white font-black">Dakar, Sénégal</span></p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-600 border-b border-white/5 pb-4 m-0">Contactez-nous</h4>
            <div className="flex items-start gap-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest leading-loose">
              <Phone size={20} className="text-blue-500 shrink-0 mt-1" />
              <p className="italic m-0">+221 77 441 09 02 <br /> +221 77 631 00 91</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-300 uppercase tracking-widest pt-2">
              <Mail size={20} className="text-blue-500 shrink-0" />
              <a href="mailto:ab.thiongane@qualisoft.sn" className="hover:text-blue-400 transition-colors italic border-b border-blue-500/30 pb-1 text-white no-underline">ab.thiongane@qualisoft.sn</a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center relative z-10">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] italic m-0">
            © 2026 QUALISOFT RD 2030 • TOUS DROITS RÉSERVÉS • ARCHITECTURE MULTI-TENANT SÉCURISÉE
          </p>
        </div>
      </footer>

      {/* 🧪 ANIMATIONS CSS SUR-MESURE POUR LE FLOAT (TOURNOIEMENT) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        .animate-\\[float_6s_ease-in-out_infinite\\] { animation: float 6s ease-in-out infinite; }
        .animate-\\[float_6s_ease-in-out_infinite_1s\\] { animation: float 6s ease-in-out infinite 1s; }
        .animate-\\[float_6s_ease-in-out_infinite_2s\\] { animation: float 6s ease-in-out infinite 2s; }
      `}} />
    </div>
  );
}