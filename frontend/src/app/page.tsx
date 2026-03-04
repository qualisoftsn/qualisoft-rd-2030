/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : RootPage (Landing Page Elite)
 * -------------------------------------------------------------------------
 * RÔLE : Portail d'entrée souverain pour elite.qualisoft.sn.
 * RÉVISION : 04 Mars 2026 | 01:15 GMT
 * DESIGN : Elite Industrial Dark • Caractères denses • Flows animés.
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, Zap, ChevronRight, ArrowRight, Fingerprint, 
  CheckCircle2, Star, Mail, Phone, MapPin, Globe, Loader2,
  FileText, ShieldAlert, HeartPulse, Lock
} from 'lucide-react';
import { toast } from 'sonner';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleRequestTrial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulation d'envoi vers ab.thiongane@qualisoft.sn via votre backend NestJS/OVH
    setTimeout(() => {
      toast.success("Demande transmise avec succès.");
      alert("Qualisoft vous remercie. Nous vous reviendrons sous 48h pour vos éléments de connexion à Qualisoft Elite. Vous disposez de 14 jours d'essai avec accès intégral à la plateforme. Nous vous invitons à confirmer votre abonnement en choisissant le plan qui vous convient et en payant par Wave ou Orange Money ou par opération bancaire. La réception de vos preuves de règlement vous ouvrira votre abonnement. Qualisoft vous remercie.");
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden text-[13px]">
      
      {/* 🔮 NAVIGATION SOUVERAINE */}
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-12 sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-2xl z-100">
        <div className="flex items-center gap-4">
          <Link href="https://qualisoft.sn" className="hover:opacity-80 transition-opacity">
            <Image src="/images/qslogo.png" alt="Qualisoft" width={32} height={32} />
          </Link>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <h1 className="text-lg font-black uppercase tracking-tighter m-0">
            QUALI<span className="text-blue-600">SOFT</span> <span className="text-slate-500 font-medium text-xs">ELITE</span>
          </h1>
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
          <Link href="https://qualisoft.sn" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <Globe size={12} /> RETOUR VITRINE
          </Link>
          <div className="animate-pulse bg-blue-600 px-4 py-2 rounded-full border border-blue-400/30">
             <span className="text-[9px] font-black uppercase tracking-widest">Lancement : 15 MARS 2026</span>
          </div>
          <Link href="/auth/login" className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
            CONNEXION SDE
          </Link>
        </div>
      </nav>

      {/* 🚀 HERO SECTION */}
      <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto text-left">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full mb-6">
              <Fingerprint size={12} className="text-blue-500" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-500">SDE Matrix OS • RD-2026</span>
            </div>
            <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.95] mb-8 italic">
              VOTRE <span className="text-blue-600">SOUVERAINETÉ</span> <br /> NORMATIVE.
            </h2>
            <p className="text-slate-400 font-bold uppercase text-[11px] leading-relaxed mb-8 max-w-lg">
              Plateforme de Management Intégré conçue pour la résilience. 
              Gérez vos processus, vos risques et votre conformité légale sur une infrastructure 100% isolée.
            </p>
            <div className="flex gap-4">
               <Link href="#trial" className="px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-900/20 flex items-center gap-3">
                 DEMANDER UN ESSAI <ChevronRight size={14} />
               </Link>
               <Link href="#docs" className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                 <FileText size={14} /> DOCS SÉCURISÉES
               </Link>
            </div>
          </div>
          <div className="relative animate-in fade-in zoom-in-95 duration-1000">
             <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-4xl group">
               <Image src="/images/qs_cockpit.jpg" alt="Cockpit" fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" />
               <div className="absolute inset-0 bg-linear-to-t from-[#0B0F1A] via-transparent to-transparent" />
             </div>
          </div>
        </div>
      </section>

      {/* 🛡️ SECTION NORMES ISO */}
      <section className="py-20 bg-white/2 border-y border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ISOCard icon={ShieldCheck} title="ISO 9001" desc="Management de la Qualité et satisfaction client (§SMI)." />
            <ISOCard icon={HeartPulse} title="ISO 14001" desc="Management Environnemental et réduction d'empreinte." />
            <ISOCard icon={ShieldAlert} title="ISO 45001" desc="Santé et Sécurité au Travail (§HSEQ)." />
            <ISOCard icon={Lock} title="ISO 27001" desc="Sécurité de l'information et Cyber-résilience Matrix." />
          </div>
        </div>
      </section>

      {/* 💰 PLANS ÉVOLUTIFS */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-black uppercase italic tracking-tighter">NOS PLANS <span className="text-blue-600">STRATÉGIQUES</span></h3>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Du déploiement agile à la souveraineté de groupe</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <PlanCard title="ESSAI" price="Gratuit" desc="Accès intégral" trial features={["14 Jours d'essai", "Tous les modules", "Support technique"]} />
          <PlanCard title="Émergence" price="55.000" desc="XOF / Mois" features={["GED Qualité", "Workflow NC", "1 Site"]} />
          <PlanCard title="Croissance" price="105.000" desc="XOF / Mois" features={["Audit Terrain", "Indicateurs KPI", "3 Sites"]} />
          <PlanCard title="Entreprise" price="175.000" desc="XOF / Mois" active features={["Gestion Risques", "Veille Légale", "Sites Illimités"]} />
          <PlanCard title="Groupe Élite" price="350.000" desc="XOF / Mois" features={["Multi-Tenant", "Matrix Console", "BI Avancée"]} />
        </div>
      </section>

      {/* 📧 FORMULAIRE D'ESSAI (OVH TUNNEL) */}
      <section id="trial" className="py-24 px-6 lg:px-12 bg-white/1">
        <div className="max-w-4xl mx-auto bg-[#0F172A]/40 border border-white/5 rounded-[3rem] p-10 lg:p-16 backdrop-blur-3xl shadow-4xl">
           <div className="text-center mb-12">
             <h4 className="text-2xl font-black uppercase italic tracking-tight">DEMANDER VOTRE ACCÈS <span className="text-blue-600">PROVISOIRE</span></h4>
             <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">Réponse garantie sous 48h par l&apos;unité Matrix</p>
           </div>
           
           <form onSubmit={handleRequestTrial} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input required placeholder="NOM DE L'ENTREPRISE" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-bold italic" />
              <input required placeholder="ADRESSE SIÈGE" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-bold italic" />
              <input required placeholder="NOM DU DEMANDEUR" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-bold italic" />
              <input required placeholder="FONCTION" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-bold italic" />
              <input required placeholder="TÉLÉPHONE FIXE" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-bold italic" />
              <input required placeholder="MOBILE" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-bold italic" />
              <input required type="email" placeholder="ADRESSE MAIL VÉRIFIABLE" className="md:col-span-2 bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-bold italic" />
              
              <button disabled={isSubmitting} className="md:col-span-2 py-6 bg-blue-600 rounded-2xl font-black uppercase tracking-widest italic hover:bg-blue-500 transition-all flex items-center justify-center gap-4">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                {isSubmitting ? "TRANSMISSION..." : "ACTIVER MON ESSAI 14 JOURS"}
              </button>
           </form>
        </div>
      </section>

      {/* 🏁 FOOTER & COORDONNÉES */}
      <footer className="py-20 border-t border-white/5 bg-[#080B14]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16 items-start text-left">
           <div className="space-y-6">
              <Image src="/images/qslogo.png" alt="Qualisoft" width={40} height={40} />
              <p className="text-slate-500 uppercase text-[9px] font-bold leading-relaxed">
                Qualisoft Elite Matrix est le fruit d&apos;une expertise africaine au service de la conformité internationale.
              </p>
           </div>
           <div className="space-y-6">
              <h5 className="text-xs font-black uppercase italic text-blue-500 tracking-widest">Coordonnées Qualisoft</h5>
              <div className="space-y-4">
                 <p className="flex items-center gap-3 text-[10px] font-bold uppercase"><MapPin size={14} className="text-blue-500" /> Villa 247, Cité Cheikh Hann, Lac Rose</p>
                 <p className="flex items-center gap-3 text-[10px] font-bold uppercase"><Phone size={14} className="text-blue-500" /> 77 631 00 91 / 77 441 09 02</p>
                 <p className="flex items-center gap-3 text-[10px] font-bold uppercase"><Mail size={14} className="text-blue-500" /> contact@qualisoft.sn</p>
              </div>
           </div>
           <div className="space-y-6">
              <h5 className="text-xs font-black uppercase italic text-slate-500 tracking-widest">Souveraineté ISO</h5>
              <div className="flex flex-wrap gap-4 opacity-30">
                 <span className="px-3 py-1 border border-white text-[8px] font-black">9001</span>
                 <span className="px-3 py-1 border border-white text-[8px] font-black">14001</span>
                 <span className="px-3 py-1 border border-white text-[8px] font-black">45001</span>
                 <span className="px-3 py-1 border border-white text-[8px] font-black">27001</span>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}

function ISOCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-blue-600/30 transition-all text-left group">
      <div className="w-10 h-10 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
        <Icon size={20} />
      </div>
      <h4 className="text-lg font-black uppercase italic text-white mb-3">{title}</h4>
      <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">{desc}</p>
    </div>
  );
}

function PlanCard({ title, price, desc, features, active, trial }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 text-left flex flex-col ${active ? 'bg-blue-600 border-blue-500 scale-105 shadow-2xl' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
       <h5 className={`text-xl font-black uppercase italic mb-1 ${active ? 'text-white' : 'text-blue-500'}`}>{title}</h5>
       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-6">{desc}</p>
       <div className="mb-8">
          <span className="text-2xl font-black italic">{price}</span>
          {!trial && <span className="text-[8px] font-bold ml-1">XOF</span>}
       </div>
       <ul className="space-y-3 list-none p-0 mb-8 flex-1">
          {features.map((f: string, i: number) => (
            <li key={i} className="flex items-center gap-2 text-[9px] font-bold uppercase italic">
              <CheckCircle2 size={12} className={active ? 'text-blue-200' : 'text-blue-500'} /> {f}
            </li>
          ))}
       </ul>
       <Link href="#trial" className={`w-full text-center py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'}`}>
         {trial ? "ACTIVER" : "S'ABONNER"}
       </Link>
    </div>
  );
}