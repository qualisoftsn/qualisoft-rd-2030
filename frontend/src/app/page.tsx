/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/**
 * 🛰️ MODULE : RootPage (Landing Page Elite)
 * -------------------------------------------------------------------------
 * RÔLE : Portail d'entrée souverain pour elite.qualisoft.sn.
 * RÉPARATION : Correction de l'erreur ISOCard/FeatureCard & Validation Form.
 * RÉVISION : 04 Mars 2026 | 01:35 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, Zap, Globe, ChevronRight, ArrowRight, 
  Smartphone, Tablet, Monitor, CheckCircle2, FileText, HeartPulse, 
  X, Loader2, ShieldAlert, Lock
} from 'lucide-react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [showAutoResponse, setShowAutoResponse] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ÉTAT DU FORMULAIRE POUR VALIDATION
  const [formData, setFormData] = useState({
    company: '', address: '', requesterName: '',
    function: '', landline: '', mobile: '', email: ''
  });

  useEffect(() => { setMounted(true); }, []);

  // 🛡️ LOGIQUE DE VALIDATION STRICTE
  const isFormValid = useMemo(() => {
    return Object.values(formData).every(value => value.trim().length > 1) && 
           formData.email.includes('@') && formData.email.includes('.');
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setShowAutoResponse(true); 
    setFormData({ company: '', address: '', requesterName: '', function: '', landline: '', mobile: '', email: '' });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden">
      
      {/* 🔮 CORE MATRIX EFFECTS */}
      <div className="absolute top-0 right-0 w-250 h-250 bg-blue-600/5 blur-[180px] rounded-full pointer-events-none animate-pulse" />

      {/* 🔝 NAVIGATION SOUVERAINE */}
      <nav className="h-24 border-b border-white/5 flex items-center justify-between px-8 lg:px-20 sticky top-0 bg-[#0B0F1A]/80 backdrop-blur-2xl z-100">
        <div className="flex items-center gap-5">
          <Link href="https://qualisoft.sn" className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl transition-transform hover:scale-105">
            <Image src="/images/qslogo.png" alt="Qualisoft" width={32} height={32} />
          </Link>
          <div className="flex flex-col text-left">
            <h1 className="text-2xl font-black uppercase tracking-tighter m-0 leading-none italic">
              QUALI<span className="text-blue-600">SOFT</span>
            </h1>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Elite Matrix OS</span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 animate-pulse text-blue-500 hidden md:block text-center">
           <span className="text-2xl font-black uppercase tracking-[0.4em] drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]">
             Lancement : 15 Mars 2026
           </span>
        </div>

        <div className="hidden lg:flex items-center gap-12">
          <Link href="https://qualisoft.sn" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <Globe size={12} /> Qualisoft
          </Link>
          <Link href="#trial" className="group flex items-center gap-4 px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-blue-600 transition-all shadow-2xl">
            J&apos;ESSAYE QS ELITE <ChevronRight size={14} />
          </Link>
        </div>
      </nav>

      {/* 🚀 HERO SECTION */}
      <section className="relative pt-36 pb-24 px-8 lg:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col items-start gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <h2 className="text-7xl lg:text-[10rem] font-black uppercase tracking-[calc(-0.05em)] leading-[0.85] m-0 italic drop-shadow-2xl text-left">
            MAÎTRISEZ VOTRE <br />
            <span className="text-blue-600">SOUVERAINETÉ.</span>
          </h2>
          <p className="text-xl text-slate-400 font-bold max-w-xl leading-tight uppercase italic border-l-4 border-blue-600 pl-8 text-left">
            L&apos;architecture SDE Matrix redéfinit le Management Intégré. Isolation multi-tenant et conformité ISO native.
          </p>
          <div className="flex flex-wrap gap-6 mt-12">
            <Link href="#trial" className="px-12 py-6 bg-blue-600 rounded-4xl font-black uppercase text-xs tracking-[0.2em] flex items-center gap-4 hover:scale-105 transition-all shadow-4xl group">
              DEMANDER UN ESSAI <ArrowRight size={20} />
            </Link>
            <Link href="#solutions" className="px-12 py-6 bg-white/5 border border-white/10 rounded-4xl font-black uppercase text-xs tracking-[0.2em] flex items-center gap-4 hover:bg-white/10 transition-all group">
              <FileText size={20} /> DOCUMENTATION
            </Link>
          </div>
        </div>
      </section>

      {/* 🖼️ SECTION SHOWCASE : LES TROIS IMAGES */}
      <section className="py-20 px-8 lg:px-20 bg-white/2 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-16 text-center italic">
            Une interface unique • Trois environnements de pilotage
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-end">
            <div className="group space-y-6">
              <div className="relative aspect-9/16 bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-4xl overflow-hidden transition-transform group-hover:-translate-y-4 duration-700">
                <Image src="/images/showcase-mobile.png" alt="SDE Mobile" fill className="object-cover opacity-80" />
              </div>
              <div className="text-center">
                <Smartphone className="text-blue-500 mx-auto mb-2" size={24} />
                <p className="text-xs font-black uppercase italic m-0">Elite Mobile Access</p>
              </div>
            </div>
            <div className="group space-y-6 lg:-mb-10">
              <div className="relative aspect-video bg-slate-900 rounded-4xl border-8 border-slate-800 shadow-[0_0_80px_rgba(37,99,235,0.15)] overflow-hidden transition-all group-hover:scale-105 duration-700">
                <Image src="/images/showcase-desktop.png" alt="SDE Desktop" fill className="object-cover" />
              </div>
              <div className="text-center">
                <Monitor className="text-blue-500 mx-auto mb-2" size={32} />
                <p className="text-sm font-black uppercase italic m-0">Cockpit Décisionnel Matrix</p>
              </div>
            </div>
            <div className="group space-y-6">
              <div className="relative aspect-4/3 bg-slate-900 rounded-[2.5rem] border-8 border-slate-800 shadow-4xl overflow-hidden transition-transform group-hover:-translate-y-4 duration-700">
                <Image src="/images/showcase-tablet.png" alt="SDE Tablet" fill className="object-cover opacity-80" />
              </div>
              <div className="text-center">
                <Tablet className="text-blue-500 mx-auto mb-2" size={24} />
                <p className="text-xs font-black uppercase italic m-0">Module Audit & Preuves</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ SOLUTIONS GRID : SECTION NORMES ISO */}
      <section id="solutions" className="py-40 px-8 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ISOCard icon={ShieldCheck} title="ISO 9001" desc="Qualité & Satisfaction Client." color="text-blue-500" />
          <ISOCard icon={HeartPulse} title="ISO 14001" desc="Management Environnemental." color="text-emerald-500" />
          <ISOCard icon={ShieldAlert} title="ISO 45001" desc="Santé & Sécurité au Travail." color="text-amber-500" />
          <ISOCard icon={Lock} title="ISO 27001" desc="Sécurité de l'Information." color="text-red-500" />
        </div>
      </section>

      {/* 💰 PLANS ÉVOLUTIFS */}
      <section className="py-24 px-8 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <PlanCard title="ESSAI" price="Gratuit" desc="14 Jours" trial features={["Accès intégral", "Tous modules", "Support"]} />
          <PlanCard title="Émergence" price="55.000" desc="XOF / Mois" features={["GED Qualité", "Workflow NC", "1 Site"]} />
          <PlanCard title="Croissance" price="105.000" desc="XOF / Mois" features={["Audit Terrain", "Indicateurs", "3 Sites"]} />
          <PlanCard title="Entreprise" price="175.000" desc="XOF / Mois" active features={["Risques §6.1", "Veille Légale", "Sites Illimités"]} />
          <PlanCard title="Groupe Élite" price="350.000" desc="XOF / Mois" features={["Multi-Tenant", "Matrix Console", "BI"]} />
        </div>
      </section>

      {/* 📧 FORMULAIRE J'ESSAYE QS ELITE */}
      <section id="trial" className="py-24 px-8 lg:px-12 bg-white/1">
        <div className="max-w-4xl mx-auto bg-[#0F172A]/40 border border-white/5 rounded-[4rem] p-10 lg:p-16 backdrop-blur-3xl shadow-4xl text-left">
           <div className="text-center mb-12">
             <h4 className="text-3xl font-black uppercase italic tracking-tight">J&apos;ESSAYE <span className="text-blue-600">QS ELITE</span></h4>
             <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest">Réponse sous 48H</p>
           </div>
           
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="NOM DE L'ENTREPRISE" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black italic text-white" />
              <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="ADRESSE SIÈGE" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black italic text-white" />
              <input required value={formData.requesterName} onChange={e => setFormData({...formData, requesterName: e.target.value})} placeholder="NOM DU DEMANDEUR" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black italic text-white" />
              <input required value={formData.function} onChange={e => setFormData({...formData, function: e.target.value})} placeholder="FONCTION" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black italic text-white" />
              <input required value={formData.landline} onChange={e => setFormData({...formData, landline: e.target.value})} placeholder="TÉLÉPHONE FIXE" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black italic text-white" />
              <input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="MOBILE" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black italic text-white" />
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="ADRESSE MAIL VÉRIFIABLE" className="md:col-span-2 bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black italic text-white" />
              
              <button 
                type="submit"
                disabled={!isFormValid || isSubmitting} 
                className={`md:col-span-2 py-8 rounded-3xl font-black uppercase tracking-[0.3em] italic transition-all flex items-center justify-center gap-4 text-sm border-none cursor-pointer
                  ${isFormValid ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xl' : 'bg-white/5 text-slate-700 cursor-not-allowed opacity-50'}`}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                {isSubmitting ? "TRANSMISSION..." : "ACTIVER MON ESSAI 14 JOURS"}
              </button>
           </form>
        </div>
      </section>

      {/* 🏁 FOOTER OFFICIEL */}
      <footer className="py-24 border-t border-white/5 bg-[#080B14]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-10 shadow-2xl">
            <Image src="/images/qslogo.png" alt="Qualisoft" width={32} height={32} priority />
          </div>
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.8em] mb-8 m-0 italic text-center leading-relaxed">
            Villa 247, Cité Cheikh Hann, Route du Lac Rose, <br />
            Tél: 77 631 00 91 / 77 441 09 02 • contact@qualisoft.sn <br />
            &copy; {new Date().getFullYear()} Qualisoft International. Tous droits de souveraineté réservés.
          </p>
        </div>
      </footer>

      {/* 🛰️ RÉPONSE AUTOMATIQUE */}
      {showAutoResponse && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-6 bg-[#0B0F1A]/95 backdrop-blur-md animate-in fade-in duration-300">
           <div className="max-w-2xl w-full bg-[#0F172A] border border-blue-600/30 rounded-[3rem] p-12 shadow-4xl relative text-left">
              <button onClick={() => setShowAutoResponse(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                <X size={24} />
              </button>
              <h5 className="text-3xl font-black uppercase italic text-white mb-6 leading-tight">Qualisoft vous <span className="text-blue-600">remercie.</span></h5>
              <div className="space-y-6 text-slate-300 font-bold uppercase text-[11px] leading-relaxed italic">
                <p>Nous vous reviendrons sous 48h pour vos éléments de connexion à Qualisoft Elite.</p>
                <p>Vous disposez de 14 jours d&apos;essai avec accès intégral à la plateforme.</p>
                <p className="text-white border-l-2 border-blue-600 pl-6">
                  Confirmation par <span className="text-blue-500">Wave</span>, <span className="text-orange-500">Orange Money</span> ou virement.
                </p>
              </div>
              <button onClick={() => setShowAutoResponse(false)} className="mt-10 w-full py-5 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-white hover:bg-blue-500 border-none cursor-pointer shadow-xl">COMPRIS</button>
           </div>
        </div>
      )}
    </div>
  );
}

/** 🛠️ COMPOSANTS INTERNES */
function ISOCard({ icon: Icon, title, desc, color }: any) {
  return (
    <div className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-blue-600/30 transition-all text-left group">
      <div className={`w-10 h-10 bg-white/5 ${color} rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all`}>
        <Icon size={20} />
      </div>
      <h4 className="text-lg font-black uppercase italic text-white mb-3 m-0">{title}</h4>
      <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed m-0">{desc}</p>
    </div>
  );
}

function PlanCard({ title, price, desc, features, active, trial }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 text-left flex flex-col ${active ? 'bg-blue-600 border-blue-500 scale-105 shadow-2xl' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
       <h5 className={`text-xl font-black uppercase italic mb-1 m-0 ${active ? 'text-white' : 'text-blue-500'}`}>{title}</h5>
       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-6 m-0 leading-none">{desc}</p>
       <div className="mb-8 mt-2">
          <span className="text-2xl font-black italic">{price}</span>
          {!trial && <span className="text-[8px] font-bold ml-1">XOF</span>}
       </div>
       <ul className="space-y-3 list-none p-0 mb-8 flex-1 m-0">
          {features.map((f: string, i: number) => (
            <li key={i} className="flex items-center gap-2 text-[9px] font-bold uppercase italic m-0">
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