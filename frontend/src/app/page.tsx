/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/**
 * 🛰️ MODULE : RootPage (Landing Page Elite)
 * RÉVISION : 04 Mars 2026 | 01:10 GMT
 * LOGIQUE : Validation de formulaire stricte & Réponse automatique.
 */

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, Zap, ChevronRight, 
  Loader2, FileText, ShieldAlert, HeartPulse, Lock,
  X, Check
} from 'lucide-react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [showAutoResponse, setShowAutoResponse] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ÉTAT DU FORMULAIRE
  const [formData, setFormData] = useState({
    company: '', address: '', requesterName: '',
    function: '', landline: '', mobile: '', email: ''
  });

  useEffect(() => { setMounted(true); }, []);

  // 🛡️ LOGIQUE DE VALIDATION : Le bouton ne s'active que si TOUT est rempli
  const isFormValid = useMemo(() => {
    return Object.values(formData).every(value => value.trim().length > 2) && 
           formData.email.includes('@') && formData.email.includes('.');
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    
    // Simule le tunnel de transmission vers ab.thiongane@qualisoft.sn (OVH)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setShowAutoResponse(true); // Déclenche la réponse automatique
    setFormData({ company: '', address: '', requesterName: '', function: '', landline: '', mobile: '', email: '' });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden text-[12px]">
      
      {/* 🔝 NAVIGATION */}
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-12 sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-2xl z-100">
        <Link href="https://qualisoft.sn" className="flex items-center gap-4 hover:opacity-80 transition-all">
          <Image src="/images/qslogo.png" alt="Qualisoft" width={32} height={32} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-sans not-italic">Qualisoft</span>
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2 animate-pulse text-blue-500 hidden md:block">
           <span className="text-2xl font-black uppercase tracking-[0.4em] drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]">
             Lancement : 15 Mars 2026
           </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#trial" className="px-5 py-2 bg-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-lg">
            J&apos;ESSAYE QS ELITE
          </Link>
        </div>
      </nav>

      {/* 🚀 HERO SECTION */}
      <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000 text-left">
            <h2 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10 italic">
              MAÎTRISEZ VOTRE <br /> <span className="text-blue-600">SOUVERAINETÉ.</span>
            </h2>
            <div className="flex gap-6">
               <Link href="#trial" className="px-10 py-5 bg-blue-600 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-4">
                 DEMANDER UN ESSAI <ChevronRight size={18} />
               </Link>
               <Link href="#norms" className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-4">
                 <FileText size={18} /> DOCUMENTATION
               </Link>
            </div>
          </div>
          <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-4xl">
             <Image src="/images/qs_cockpit.jpg" alt="Cockpit" fill className="object-cover opacity-80" />
          </div>
        </div>
      </section>

      {/* 🛡️ SECTION NORMES ISO */}
      <section id="norms" className="py-20 bg-white/1 border-y border-white/5 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ISOCard href="/norms/iso-9001" icon={ShieldCheck} title="ISO 9001" desc="Qualité & Satisfaction Client." color="text-blue-500" />
          <ISOCard href="/norms/iso-14001" icon={HeartPulse} title="ISO 14001" desc="Management Environnemental." color="text-emerald-500" />
          <ISOCard href="/norms/iso-45001" icon={ShieldAlert} title="ISO 45001" desc="Santé & Sécurité au Travail." color="text-amber-500" />
          <ISOCard href="/norms/iso-27001" icon={Lock} title="ISO 27001" desc="Sécurité de l'Information." color="text-red-500" />
        </div>
      </section>

      {/* 📧 FORMULAIRE D'ESSAI DYNAMIQUE */}
      <section id="trial" className="py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto bg-[#0F172A]/40 border border-white/5 rounded-[4rem] p-12 lg:p-20 backdrop-blur-3xl shadow-4xl relative">
           <div className="text-center mb-16">
             <h4 className="text-3xl font-black uppercase italic tracking-tight">J&apos;ESSAYE <span className="text-blue-600">QS ELITE</span></h4>
             <p className="text-[10px] font-bold text-slate-500 uppercase mt-4 tracking-widest leading-none">Réponse sous 48H</p>
           </div>
           
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-blue-500 ml-4 uppercase tracking-widest">Entreprise</label>
                <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="NOM DE L'ENTREPRISE" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black text-white italic" />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-blue-500 ml-4 uppercase tracking-widest">Localisation</label>
                <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="ADRESSE SIÈGE" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black text-white italic" />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-blue-500 ml-4 uppercase tracking-widest">Contact</label>
                <input required value={formData.requesterName} onChange={e => setFormData({...formData, requesterName: e.target.value})} placeholder="NOM DU DEMANDEUR" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black text-white italic" />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-blue-500 ml-4 uppercase tracking-widest">Responsabilité</label>
                <input required value={formData.function} onChange={e => setFormData({...formData, function: e.target.value})} placeholder="FONCTION" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black text-white italic" />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-blue-500 ml-4 uppercase tracking-widest">Standard</label>
                <input required value={formData.landline} onChange={e => setFormData({...formData, landline: e.target.value})} placeholder="TÉLÉPHONE FIXE" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black text-white italic" />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-blue-500 ml-4 uppercase tracking-widest">Mobile Matrix</label>
                <input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="MOBILE" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black text-white italic" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[8px] font-black text-blue-500 ml-4 uppercase tracking-widest">Canal de communication</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="ADRESSE MAIL VÉRIFIABLE" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-blue-600 transition-all uppercase text-[10px] font-black text-white italic" />
              </div>
              
              <button 
                type="submit"
                disabled={!isFormValid || isSubmitting} 
                className={`md:col-span-2 py-8 rounded-3xl font-black uppercase tracking-[0.3em] italic transition-all flex items-center justify-center gap-4 text-sm border-none cursor-pointer
                  ${isFormValid ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xl' : 'bg-white/5 text-slate-700 cursor-not-allowed opacity-50'}`}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Zap size={20} />}
                {isSubmitting ? "TRANSMISSION..." : "ACTIVER MON ESSAI 14 JOURS"}
              </button>
           </form>
        </div>
      </section>

      {/* 🏁 FOOTER & COORDONNÉES */}
      <footer className="py-20 border-t border-white/5 bg-[#080B14]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 text-left">
           <div className="space-y-6">
              <Image src="/images/qslogo.png" alt="Qualisoft" width={40} height={40} />
              <div className="space-y-2">
                <p className="text-white uppercase text-[10px] font-black leading-none m-0">Qualisoft International SDE</p>
                <p className="text-slate-600 uppercase text-[9px] font-bold leading-relaxed max-w-sm m-0 italic">
                  Villa 247, Cité Cheikh Hann, Route du Lac Rose <br />
                  Tél: 77 631 00 91 / 77 441 09 02 • contact@qualisoft.sn
                </p>
              </div>
           </div>
        </div>
      </footer>

      {/* 🛰️ RÉPONSE AUTOMATIQUE (MODALE SCELLÉE) */}
      {showAutoResponse && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-6 bg-[#0B0F1A]/95 backdrop-blur-md animate-in fade-in duration-300">
           <div className="max-w-2xl w-full bg-[#0F172A] border border-blue-600/30 rounded-[3rem] p-12 shadow-[0_0_100px_rgba(37,99,235,0.2)] relative text-left">
              <button onClick={() => setShowAutoResponse(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                <X size={24} />
              </button>
              
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-8">
                <Check className="text-blue-500" size={32} strokeWidth={3} />
              </div>

              <h5 className="text-3xl font-black uppercase italic text-white mb-6 leading-tight">
                Qualisoft vous <span className="text-blue-600">remercie.</span>
              </h5>

              <div className="space-y-6 text-slate-300 font-bold uppercase text-[11px] leading-relaxed italic">
                <p>Nous vous reviendrons sous 48h pour vos éléments de connexion à Qualisoft Elite.</p>
                <p>Vous disposez de 14 jours d&apos;essai avec accès intégral à la plateforme.</p>
                <p className="text-white border-l-2 border-blue-600 pl-6">
                  Nous vous invitons à confirmer votre abonnement en choisissant le plan qui vous convient et en payant par <span className="text-blue-500">Wave</span>, <span className="text-orange-500">Orange Money</span> ou par opération bancaire.
                </p>
                <p>La réception de vos preuves de règlement vous ouvrira votre abonnement définitif.</p>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-2">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Coordonnées Qualisoft :</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase italic m-0">Villa 247, Cité Cheikh Hann, Route du Lac Rose</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase italic m-0">Tél: 77 631 00 91 / 77 441 09 02 • contact@qualisoft.sn</p>
              </div>

              <button 
                onClick={() => setShowAutoResponse(false)}
                className="mt-10 w-full py-5 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-white hover:bg-blue-500 transition-all border-none cursor-pointer shadow-xl shadow-blue-900/20"
              >
                COMPRIS
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

function ISOCard({ icon: Icon, title, desc, href, color }: any) {
  return (
    <Link href={href} className="p-8 bg-white/5 border border-white/5 rounded-3xl hover:border-blue-600/30 transition-all group block no-underline text-left">
      <div className={`w-10 h-10 bg-white/5 ${color} rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all`}>
        <Icon size={20} />
      </div>
      <h4 className="text-lg font-black uppercase italic text-white mb-2">{title}</h4>
      <p className="text-[10px] text-slate-500 font-bold uppercase leading-tight m-0">{desc}</p>
    </Link>
  );
}