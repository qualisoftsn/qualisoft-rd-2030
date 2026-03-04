/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/**
 * 🛰️ MODULE : RootPage (Landing Page Elite)
 * RÉVISION : 04 Mars 2026 | 02:15 GMT
 * DESIGN : Elite Industrial Dark • 5 Plans Scellés • Showcase 3 Images.
 */

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  CheckCircle2, ShieldAlert, HeartPulse, Lock,
  X, Monitor, Smartphone, Tablet
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
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setShowAutoResponse(true);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden text-[11px]">
      
      {/* 🔝 NAV : Lancement 15 Mars au centre */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 lg:px-12 sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-2xl z-100">
        <Link href="https://qualisoft.sn" className="flex items-center gap-3">
          <Image src="/images/qslogo.png" alt="QS" width={28} height={28} />
          <span className="font-black uppercase tracking-widest text-slate-400">Qualisoft</span>
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2 animate-pulse text-blue-500">
           <span className="text-xl font-black uppercase tracking-[0.3em]">Lancement : 15 Mars 2026</span>
        </div>
        <div />
      </nav>

      {/* 🚀 HERO : Titre Maîtrisé */}
      <section className="pt-20 pb-12 px-8 lg:px-12 max-w-7xl mx-auto text-left">
        <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none mb-6 italic">
          MAÎTRISEZ VOTRE <span className="text-blue-600">SOUVERAINETÉ.</span>
        </h2>
        <div className="flex gap-4">
           <Link href="#trial" className="px-6 py-3 bg-blue-600 rounded-xl font-black uppercase hover:scale-105 transition-all shadow-xl">J&apos;ESSAYE QS ELITE</Link>
           <Link href="#norms" className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-black uppercase hover:bg-white/10 transition-all">DOCUMENTATION</Link>
        </div>
      </section>

      {/* 🖼️ SHOWCASE : 3 Images Réelles */}
      <section className="py-12 px-8 lg:px-12 bg-white/1 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10"><Image src="/images/qs_cockpit.jpg" alt="Cockpit" fill className="object-cover opacity-80" /></div>
            <div className="flex items-center gap-2"><Monitor size={14} className="text-blue-500" /><p className="font-black uppercase m-0">Cockpit Opérationnel</p></div>
          </div>
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-blue-600 shadow-2xl"><Image src="/images/qs_revuedirection.jpg" alt="Revue" fill className="object-cover" /></div>
            <div className="flex items-center gap-2"><Smartphone size={14} className="text-white" /><p className="font-black uppercase m-0 text-white">Revue de Direction</p></div>
          </div>
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10"><Image src="/images/qs_qhse.jpg" alt="QHSE" fill className="object-cover opacity-80" /></div>
            <div className="flex items-center gap-2"><Tablet size={14} className="text-blue-500" /><p className="font-black uppercase m-0">Registre QHSE</p></div>
          </div>
        </div>
      </section>

      {/* 🛡️ NORMES ISO (Section 4 Points) */}
      <section id="norms" className="py-16 px-8 lg:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
        <ISOLink href="/norms/iso-9001" title="ISO 9001" icon={ShieldCheck} color="text-blue-500" />
        <ISOLink href="/norms/iso-14001" title="ISO 14001" icon={HeartPulse} color="text-emerald-500" />
        <ISOLink href="/norms/iso-45001" title="ISO 45001" icon={ShieldAlert} color="text-amber-500" />
        <ISOLink href="/norms/iso-27001" title="ISO 27001" icon={Lock} color="text-red-500" />
      </section>

      {/* 💰 PLANS STRATÉGIQUES (Restauration intégrale) */}
      <section className="py-16 px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <PlanCard title="ESSAI" price="14 Jours" desc="Gratuit" features={["Accès Intégral", "Tous Modules", "Support"]} trial />
          <PlanCard title="Émergence" price="55.000" desc="XOF / Mois" features={["GED §7.5", "Workflow NC", "1 Site"]} />
          <PlanCard title="Croissance" price="105.000" desc="XOF / Mois" features={["Audit Terrain", "Indicateurs", "3 Sites"]} />
          <PlanCard title="Entreprise" price="175.000" desc="XOF / Mois" features={["Risques §6.1", "Veille Légale", "Sites Illimités"]} active />
          <PlanCard title="Groupe Élite" price="350.000" desc="XOF / Mois" features={["Multi-Tenant", "Matrix Console", "BI Avancée"]} />
        </div>
      </section>

      {/* 📧 FORMULAIRE J&apos;ESSAYE QS ELITE */}
      <section id="trial" className="py-20 px-8">
        <div className="max-w-3xl mx-auto bg-[#0F172A]/60 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-4xl text-left">
           <h4 className="text-xl font-black uppercase italic mb-2">J&apos;ESSAYE <span className="text-blue-600">QS ELITE</span></h4>
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-8 italic text-left">Réponse sous 48H</p>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="ENTREPRISE" className="bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="ADRESSE" className="bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <input required value={formData.requesterName} onChange={e => setFormData({...formData, requesterName: e.target.value})} placeholder="DEMANDEUR" className="bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <input required value={formData.function} onChange={e => setFormData({...formData, function: e.target.value})} placeholder="FONCTION" className="bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <input required value={formData.landline} onChange={e => setFormData({...formData, landline: e.target.value})} placeholder="TÉL FIXE" className="bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="MOBILE" className="bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="EMAIL VÉRIFIABLE" className="md:col-span-2 bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <button disabled={!isFormValid || isSubmitting} className={`md:col-span-2 py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${isFormValid ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer' : 'bg-white/5 text-slate-700 cursor-not-allowed'}`}>
                {isSubmitting ? "TRANSMISSION EN COURS..." : "ACTIVER MON ESSAI 14 JOURS"}
              </button>
           </form>
        </div>
      </section>

      {/* 🏁 FOOTER OFFICIEL */}
      <footer className="py-12 border-t border-white/5 bg-[#080B14] text-center">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-relaxed italic m-0">
          Villa 247, Cité Cheikh Hann, Route du Lac Rose • Tél: 77 631 00 91 / 77 441 09 02 • contact@qualisoft.sn
        </p>
      </footer>

      {/* 🛰️ RÉPONSE AUTOMATIQUE */}
      {showAutoResponse && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-[#0B0F1A]/95 backdrop-blur-md">
           <div className="max-w-md w-full bg-[#0F172A] border border-blue-600/30 rounded-4xl p-10 text-left relative">
              <button onClick={() => setShowAutoResponse(false)} className="absolute top-6 right-6 text-slate-500 bg-transparent border-none cursor-pointer"><X size={20} /></button>
              <h5 className="text-xl font-black uppercase italic mb-6">Qualisoft vous <span className="text-blue-600">remercie.</span></h5>
              <div className="space-y-4 text-slate-300 font-bold uppercase text-[9px] leading-relaxed italic">
                <p>Réponse sous 48h pour vos accès Elite.</p>
                <p>Abonnement via <span className="text-blue-500">Wave</span> ou <span className="text-orange-500">Orange Money</span>.</p>
                <p className="text-white border-l border-blue-600 pl-4">Villa 247, Lac Rose • 77 631 00 91</p>
              </div>
              <button onClick={() => setShowAutoResponse(false)} className="mt-8 w-full py-4 bg-blue-600 rounded-xl font-black uppercase border-none text-white cursor-pointer">COMPRIS</button>
           </div>
        </div>
      )}
    </div>
  );
}

function ISOLink({ icon: Icon, title, href, color }: any) {
  return (
    <Link href={href} className="p-5 bg-white/5 border border-white/5 rounded-xl hover:border-blue-600/30 transition-all flex items-center gap-4 no-underline group text-left">
      <Icon size={16} className={color} />
      <span className="font-black uppercase tracking-widest text-white text-[9px]">{title}</span>
    </Link>
  );
}

function PlanCard({ title, price, desc, features, active, trial }: any) {
  return (
    <div className={`p-6 rounded-3xl border transition-all duration-500 text-left flex flex-col ${active ? 'bg-blue-600 border-blue-500 scale-105 shadow-2xl' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
       <h5 className={`text-sm font-black uppercase italic mb-1 m-0 ${active ? 'text-white' : 'text-blue-500'}`}>{title}</h5>
       <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-4 m-0 leading-none italic">{desc}</p>
       <div className="mb-6">
          <span className="text-xl font-black italic">{price}</span>
          {!trial && <span className="text-[7px] font-bold ml-1">XOF</span>}
       </div>
       <ul className="space-y-2 list-none p-0 mb-6 flex-1 m-0">
          {features.map((f: string, i: number) => (
            <li key={i} className="flex items-center gap-2 text-[8px] font-bold uppercase italic m-0">
              <CheckCircle2 size={10} className={active ? 'text-blue-200' : 'text-blue-500'} /> {f}
            </li>
          ))}
       </ul>
       <Link href="#trial" className={`w-full text-center py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all no-underline ${active ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'}`}>
         {trial ? "ACTIVER" : "CHOISIR"}
       </Link>
    </div>
  );
}