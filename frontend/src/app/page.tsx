/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/**
 * 🛰️ MODULE : RootPage (Landing Page Elite)
 * RÉVISION : 04 Mars 2026 | 01:50 GMT
 * FIX : Réduction taille titre, Restauration images réelles, Validation stricte.
 */

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  ShieldAlert, HeartPulse, Lock,
  X} from 'lucide-react';

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
    setFormData({ company: '', address: '', requesterName: '', function: '', landline: '', mobile: '', email: '' });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden text-[11px]">
      
      {/* 🔝 NAV : Qualisoft & Lancement */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 lg:px-12 sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-2xl z-100">
        <Link href="https://qualisoft.sn" className="flex items-center gap-3">
          <Image src="/images/qslogo.png" alt="QS" width={28} height={28} />
          <span className="font-black uppercase tracking-widest text-slate-400">Qualisoft</span>
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2 animate-pulse text-blue-500">
           <span className="text-lg font-black uppercase tracking-[0.3em]">Lancement : 15 Mars 2026</span>
        </div>
        <div />
      </nav>

      {/* 🚀 HERO : Titre Réduit & Actions */}
      <section className="pt-20 pb-12 px-8 lg:px-12 max-w-7xl mx-auto text-left">
        <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none mb-6 italic">
          MAÎTRISEZ VOTRE <span className="text-blue-600">SOUVERAINETÉ.</span>
        </h2>
        <div className="flex gap-4">
           <Link href="#trial" className="px-6 py-3 bg-blue-600 rounded-xl font-black uppercase hover:scale-105 transition-all shadow-xl">J&apos;ESSAYE QS ELITE</Link>
           <Link href="#norms" className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-black uppercase hover:bg-white/10 transition-all">DOCUMENTATION</Link>
        </div>
      </section>

      {/* 🖼️ SHOWCASE : Images Réelles (qs_cockpit, qs_revuedirection, qs_qhse) */}
      <section className="py-12 px-8 lg:px-12 bg-white/1 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10"><Image src="/images/qs_cockpit.jpg" alt="Cockpit" fill className="object-cover" /></div>
            <p className="font-black uppercase text-blue-500">I. Cockpit de Pilotage</p>
          </div>
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-blue-600 shadow-2xl"><Image src="/images/qs_revuedirection.jpg" alt="Revue" fill className="object-cover" /></div>
            <p className="font-black uppercase text-white">II. Revue de Direction</p>
          </div>
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10"><Image src="/images/qs_qhse.jpg" alt="QHSE" fill className="object-cover" /></div>
            <p className="font-black uppercase text-blue-500">III. Registre QHSE</p>
          </div>
        </div>
      </section>

      {/* 🛡️ NORMES ISO (Liens vers pages) */}
      <section id="norms" className="py-16 px-8 lg:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
        <ISOCard href="/norms/iso-9001" title="ISO 9001" icon={ShieldCheck} color="text-blue-500" />
        <ISOCard href="/norms/iso-14001" title="ISO 14001" icon={HeartPulse} color="text-emerald-500" />
        <ISOCard href="/norms/iso-45001" title="ISO 45001" icon={ShieldAlert} color="text-amber-500" />
        <ISOCard href="/norms/iso-27001" title="ISO 27001" icon={Lock} color="text-red-500" />
      </section>

      {/* 📧 FORMULAIRE D&apos;ESSAI */}
      <section id="trial" className="py-20 px-8">
        <div className="max-w-3xl mx-auto bg-[#0F172A]/60 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-3xl shadow-4xl text-left">
           <h4 className="text-xl font-black uppercase italic mb-2">J&apos;ESSAYE <span className="text-blue-600">QS ELITE</span></h4>
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-8">Réponse sous 48H</p>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="ENTREPRISE" className="bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="ADRESSE" className="bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <input required value={formData.requesterName} onChange={e => setFormData({...formData, requesterName: e.target.value})} placeholder="DEMANDEUR" className="bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <input required value={formData.function} onChange={e => setFormData({...formData, function: e.target.value})} placeholder="FONCTION" className="bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <input required value={formData.landline} onChange={e => setFormData({...formData, landline: e.target.value})} placeholder="TÉL FIXE" className="bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="MOBILE" className="bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="EMAIL VÉRIFIABLE" className="md:col-span-2 bg-white/5 border border-white/10 p-4 rounded-xl uppercase font-black text-white" />
              <button disabled={!isFormValid || isSubmitting} className={`md:col-span-2 py-5 rounded-2xl font-black uppercase tracking-widest transition-all ${isFormValid ? 'bg-blue-600 hover:bg-blue-500' : 'bg-white/5 text-slate-700'}`}>
                {isSubmitting ? "TRANSMISSION..." : "ACTIVER MON ESSAI 14 JOURS"}
              </button>
           </form>
        </div>
      </section>

      {/* 🏁 FOOTER OFFICIEL */}
      <footer className="py-12 border-t border-white/5 bg-[#080B14] text-center">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-relaxed italic">
          Villa 247, Cité Cheikh Hann, Route du Lac Rose • Tél: 77 631 00 91 / 77 441 09 02 • contact@qualisoft.sn
        </p>
      </footer>

      {/* 🛰️ RÉPONSE AUTO */}
      {showAutoResponse && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-[#0B0F1A]/95 backdrop-blur-md">
           <div className="max-w-md w-full bg-[#0F172A] border border-blue-600/30 rounded-4xl p-10 text-left relative">
              <button onClick={() => setShowAutoResponse(false)} className="absolute top-6 right-6 text-slate-500"><X size={20} /></button>
              <h5 className="text-xl font-black uppercase italic mb-6">Qualisoft vous <span className="text-blue-600">remercie.</span></h5>
              <div className="space-y-4 text-slate-300 font-bold uppercase text-[9px] leading-relaxed italic">
                <p>Réponse sous 48h pour vos accès Elite.</p>
                <p>Abonnement via <span className="text-blue-500">Wave</span> ou <span className="text-orange-500">Orange Money</span>.</p>
                <p className="text-white border-l border-blue-600 pl-4">Villa 247, Lac Rose • 77 631 00 91</p>
              </div>
              <button onClick={() => setShowAutoResponse(false)} className="mt-8 w-full py-4 bg-blue-600 rounded-xl font-black uppercase">COMPRIS</button>
           </div>
        </div>
      )}
    </div>
  );
}

function ISOCard({ icon: Icon, title, href, color }: any) {
  return (
    <Link href={href} className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-blue-600/30 transition-all flex items-center gap-4 no-underline group">
      <Icon size={18} className={color} />
      <span className="font-black uppercase tracking-widest text-white group-hover:text-blue-500 transition-colors">{title}</span>
    </Link>
  );
}