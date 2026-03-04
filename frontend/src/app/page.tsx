/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : RootPage (Landing Page Elite)
 * RÉVISION : 04 Mars 2026 | 06:00 GMT
 * DESIGN : Elite Industrial Dark • Animations 3D • Focus Conformité
 */

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, CheckCircle2, ShieldAlert, HeartPulse, Lock,
  X, Monitor, Smartphone, Tablet, Zap, ChevronRight, Loader2 
} from 'lucide-react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [showAutoResponse, setShowAutoResponse] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company: '', address: '', requesterName: '',
    function: '', landline: '', mobile: '', email: ''
  });

  useEffect(() => { setMounted(true); }, []);

  const isFormValid = useMemo(() => {
    return Object.values(formData).every(val => val.trim().length > 1) && formData.email.includes('@');
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setShowAutoResponse(true);
    setFormData({ company: '', address: '', requesterName: '', function: '', landline: '', mobile: '', email: '' });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden text-[12px]">
      
      {/* 🔝 NAVIGATION */}
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 lg:px-12 sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-2xl z-100">
        <Link href="https://qualisoft.sn" className="flex items-center gap-4 no-underline group">
          <Image src="/images/qslogo.png" alt="QS" width={40} height={40} className="shadow-2xl" />
          <span className="text-sm font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">Qualisoft</span>
        </Link>
        
        {/* 🚀 LANCEMENT (Jaune sur Vert) */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
           <span className="px-6 py-2 bg-green-500/20 text-yellow-400 rounded-full text-xl font-black uppercase tracking-[0.3em] animate-pulse border border-green-500/30">
             Lancement : 15 Mars 2026
           </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/norms/iso-9001" className="hidden sm:flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-blue-600 transition-all shadow-lg animate-pulse no-underline">
            <Zap size={14} /> Quiz Conformité
          </Link>
          <Link href="#trial" className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all no-underline text-white">
            J&apos;ESSAYE
          </Link>
        </div>
      </nav>

      {/* 🚀 HERO */}
      <section className="pt-24 pb-16 px-8 lg:px-12 max-w-7xl mx-auto text-left">
        <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-8 italic drop-shadow-2xl">
          MAÎTRISEZ VOTRE <br/><span className="text-blue-600">CONFORMITÉ.</span>
        </h2>
        <div className="flex gap-6">
           <Link href="#trial" className="px-8 py-4 bg-blue-600 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl no-underline">J&apos;ESSAYE QS ELITE</Link>
           <Link href="#norms" className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-black uppercase tracking-widest hover:bg-white/10 transition-all no-underline">DOCUMENTATION</Link>
        </div>
      </section>

      {/* 🖼️ SHOWCASE ANIMÉ (Spirales & Tourbillons) */}
      <section className="py-20 px-8 lg:px-12 bg-white/2 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="relative group perspective-1000">
             <div className="transform transition-transform duration-1000 group-hover:rotate-y-12 animate-[spin_20s_linear_infinite_reverse]">
               <ShowcaseItem src="/images/qs_cockpit.jpg" title="Cockpit Opérationnel" icon={Monitor} active />
             </div>
          </div>
          <div className="relative group perspective-1000 z-10 lg:-mt-10">
             <div className="transform transition-transform duration-1000 hover:scale-110 animate-[bounce_6s_ease-in-out_infinite]">
               <ShowcaseItem src="/images/qs_revuedirection.jpg" title="Revue de Direction" icon={Smartphone} active highlight />
             </div>
          </div>
          <div className="relative group perspective-1000">
             <div className="transform transition-transform duration-1000 group-hover:-rotate-y-12 animate-[spin_25s_linear_infinite]">
               <ShowcaseItem src="/images/qs_qhse.jpg" title="Registre QHSE" icon={Tablet} active />
             </div>
          </div>
        </div>
      </section>

      {/* 💰 PLANS (Déplacés avant les Normes) */}
      <section className="py-24 px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-black uppercase italic tracking-tighter">PLANS <span className="text-blue-600">STRATÉGIQUES</span></h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <PlanCard title="ESSAI" price="14 Jours" desc="Gratuit" features={["Accès Intégral", "Tous Modules", "Support"]} trial />
          <PlanCard title="Émergence" price="55.000" desc="XOF / Mois" features={["GED §7.5", "Workflow NC", "1 Site"]} />
          <PlanCard title="Croissance" price="105.000" desc="XOF / Mois" features={["Audit Terrain", "Indicateurs", "3 Sites"]} />
          <PlanCard title="Entreprise" price="175.000" desc="XOF / Mois" features={["Risques §6.1", "Veille Légale", "Sites Illimités"]} active />
          <PlanCard title="Groupe Élite" price="350.000" desc="XOF / Mois" features={["Multi-Tenant", "Matrix Console", "BI"]} />
        </div>
      </section>

      {/* 🛡️ NORMES ISO (Documentation) */}
      <section id="norms" className="py-20 px-8 lg:px-12 max-w-7xl mx-auto bg-white/1 rounded-[4rem]">
        <div className="text-center mb-12">
           <h3 className="text-2xl font-black uppercase italic tracking-tighter">DOCUMENTATION <span className="text-blue-600">NORMATIVE</span></h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ISOLink href="/norms/iso-9001" title="ISO 9001" icon={ShieldCheck} color="text-blue-500" />
          <ISOLink href="/norms/iso-14001" title="ISO 14001" icon={HeartPulse} color="text-emerald-500" />
          <ISOLink href="/norms/iso-45001" title="ISO 45001" icon={ShieldAlert} color="text-amber-500" />
          <ISOLink href="/norms/iso-27001" title="ISO 27001" icon={Lock} color="text-red-500" />
        </div>
      </section>

      {/* 📧 FORMULAIRE */}
      <section id="trial" className="py-24 px-8">
        <div className="max-w-4xl mx-auto bg-[#0F172A]/80 border border-blue-600/20 rounded-[3rem] p-12 backdrop-blur-3xl shadow-[0_0_80px_rgba(37,99,235,0.1)] text-left">
           <h4 className="text-3xl font-black uppercase italic mb-2">J&apos;ESSAYE <span className="text-blue-600">QS ELITE</span></h4>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Transmission sécurisée • Réponse sous 48H</p>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="ENTREPRISE" className="bg-[#0B0F1A] border border-white/10 p-5 rounded-xl uppercase font-black text-white outline-none focus:border-blue-500 transition-colors" />
              <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="ADRESSE SIÈGE" className="bg-[#0B0F1A] border border-white/10 p-5 rounded-xl uppercase font-black text-white outline-none focus:border-blue-500 transition-colors" />
              <input required value={formData.requesterName} onChange={e => setFormData({...formData, requesterName: e.target.value})} placeholder="NOM DU DEMANDEUR" className="bg-[#0B0F1A] border border-white/10 p-5 rounded-xl uppercase font-black text-white outline-none focus:border-blue-500 transition-colors" />
              <input required value={formData.function} onChange={e => setFormData({...formData, function: e.target.value})} placeholder="FONCTION" className="bg-[#0B0F1A] border border-white/10 p-5 rounded-xl uppercase font-black text-white outline-none focus:border-blue-500 transition-colors" />
              <input required value={formData.landline} onChange={e => setFormData({...formData, landline: e.target.value})} placeholder="TÉLÉPHONE FIXE" className="bg-[#0B0F1A] border border-white/10 p-5 rounded-xl uppercase font-black text-white outline-none focus:border-blue-500 transition-colors" />
              <input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="MOBILE" className="bg-[#0B0F1A] border border-white/10 p-5 rounded-xl uppercase font-black text-white outline-none focus:border-blue-500 transition-colors" />
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="EMAIL VÉRIFIABLE" className="md:col-span-2 bg-[#0B0F1A] border border-white/10 p-5 rounded-xl uppercase font-black text-white outline-none focus:border-blue-500 transition-colors" />
              <button disabled={!isFormValid || isSubmitting} className={`md:col-span-2 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-sm transition-all border-none shadow-2xl ${isFormValid ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer text-white' : 'bg-white/5 text-slate-700 cursor-not-allowed'}`}>
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "ACTIVER MON ESSAI 14 JOURS"}
              </button>
           </form>
        </div>
      </section>

      {/* 🏁 FOOTER AMÉLIORÉ (Lisibilité accrue) */}
      <footer className="py-16 border-t border-white/10 bg-[#05080F] text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic m-0">Qualisoft International SDE</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-relaxed m-0">
            Villa 247, Cité Cheikh Hann, Route du Lac Rose <br/>
            Tél: 77 631 00 91 / 77 441 09 02 • contact@qualisoft.sn
          </p>
        </div>
      </footer>

      {showAutoResponse && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-[#0B0F1A]/95 backdrop-blur-md">
           <div className="max-w-md w-full bg-[#0F172A] border border-blue-600/50 rounded-4xl p-10 text-left relative shadow-[0_0_100px_rgba(37,99,235,0.3)]">
              <button onClick={() => setShowAutoResponse(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white bg-transparent border-none cursor-pointer transition-colors"><X size={24} /></button>
              <h5 className="text-3xl font-black uppercase italic mb-6">Qualisoft vous <span className="text-blue-600">remercie.</span></h5>
              <div className="space-y-4 text-slate-300 font-bold uppercase text-[10px] leading-relaxed italic">
                <p>Réponse sous 48h pour vos accès Elite.</p>
                <p>Abonnement via <span className="text-blue-500">Wave</span> ou <span className="text-orange-500">Orange Money</span>.</p>
                <p className="text-white border-l-2 border-blue-600 pl-4 py-1">Villa 247, Lac Rose • 77 631 00 91</p>
              </div>
              <button onClick={() => setShowAutoResponse(false)} className="mt-10 w-full py-5 bg-blue-600 rounded-xl font-black uppercase border-none text-white cursor-pointer hover:bg-blue-500 transition-colors">COMPRIS</button>
           </div>
        </div>
      )}
    </div>
  );
}

function ShowcaseItem({ src, title, icon: Icon, active, highlight }: any) {
  return (
    <div className="space-y-6">
      <div className={`relative aspect-video rounded-3xl overflow-hidden ${active ? (highlight ? 'border-4 border-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.3)]' : 'border-2 border-blue-600/50 shadow-2xl') : 'border border-white/10 opacity-80'}`}>
        <Image src={src} alt={title} fill className="object-cover" />
      </div>
      <div className="flex items-center justify-center gap-3 bg-[#0B0F1A]/50 p-3 rounded-full border border-white/5 backdrop-blur-sm">
        <Icon size={16} className={active ? 'text-blue-500' : 'text-slate-500'} />
        <p className={`font-black uppercase m-0 text-[10px] tracking-widest ${active ? 'text-white' : 'text-slate-400'}`}>{title}</p>
      </div>
    </div>
  );
}

function ISOLink({ icon: Icon, title, href, color }: any) {
  return (
    <Link href={href} className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-600/50 transition-all flex flex-col items-center gap-4 no-underline group text-center hover:-translate-y-2">
      <div className={`p-4 bg-white/5 rounded-xl group-hover:bg-blue-600/20 transition-colors`}>
        <Icon size={24} className={color} />
      </div>
      <span className="font-black uppercase tracking-widest text-white text-[10px] group-hover:text-blue-500 transition-colors">{title}</span>
    </Link>
  );
}

function PlanCard({ title, price, desc, features, active, trial }: any) {
  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 text-left flex flex-col ${active ? 'bg-blue-600 border-blue-400 scale-105 shadow-[0_0_40px_rgba(37,99,235,0.4)]' : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}`}>
       <h5 className={`text-lg font-black uppercase italic mb-1 m-0 ${active ? 'text-white' : 'text-blue-500'}`}>{title}</h5>
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 m-0 leading-none italic">{desc}</p>
       <div className="mb-8">
          <span className="text-3xl font-black italic">{price}</span>
          {!trial && <span className="text-[9px] font-bold ml-1 text-slate-300">XOF</span>}
       </div>
       <ul className="space-y-4 list-none p-0 mb-8 flex-1 m-0">
          {features.map((f: string, i: number) => (
            <li key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase italic m-0">
              <CheckCircle2 size={14} className={active ? 'text-blue-200' : 'text-blue-500'} /> {f}
            </li>
          ))}
       </ul>
       <Link href="#trial" className={`w-full text-center py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all no-underline shadow-xl ${active ? 'bg-white text-blue-900 hover:bg-slate-100' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
         {trial ? "ACTIVER" : "CHOISIR"}
       </Link>
    </div>
  );
}