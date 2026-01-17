"use client";

import {
  Activity, CheckCircle2, ChevronRight, ClipboardCheck, Crown, Fingerprint,
  Mail, Rocket, ShieldCheck, Sparkles, X, Zap, Building2
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function LandingPage() {
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterKey, setMasterKey] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      company: formData.get('company'),
      email: formData.get('email'),
      message: "Demande d'essai 14 jours (Landing Page)"
    };

    try {
      const response = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("Erreur serveur. Veuillez vérifier les informations.");
      }
    } catch (error) {
      alert("Erreur de connexion. Vérifiez votre réseau.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F1A]/80 backdrop-blur-2xl border-b border-white/5 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-blue-600/20">
            <span className="font-black text-xl text-white not-italic">Q</span>
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter leading-none hidden md:block">
            Qualisoft <span className="text-blue-600">RD 2030 AT</span>
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <button onClick={() => setShowMasterModal(true)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-amber-500 transition-all">
            <Crown size={14} /> <span>Accès Master QS</span>
          </button>
          <Link href="/register" className="px-6 py-3 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all">
            Essai Gratuit
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-48 pb-20 px-6 overflow-hidden border-b border-white/5 text-center">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-10">
            <Zap size={14} className="fill-blue-400" /> Disponibilité Initiale : 02/02/2026
          </div>
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-10 italic">
            Pilotez votre <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Conformité.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-xl font-medium italic mb-14 leading-relaxed">
            L'excellence normative ISO au Sénégal et dans l'UEMOA. Digitalisez votre GED et vos flux Qualité.
          </p>

          {/* FORMULAIRE REPARÉ (Design image_d510eb) */}
          <div className="max-w-md mx-auto bg-white/5 border border-white/10 p-8 rounded-[3rem] shadow-3xl backdrop-blur-xl">
            {!submitted ? (
              <form onSubmit={handleInviteSubmit} className="space-y-4 text-left">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Inscrivez-vous pour le test de 14 jours</label>
                <div className="relative">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" name="company" required placeholder="Nom de l'entreprise" className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-4 focus:border-blue-500 transition-all text-white outline-none" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="email" name="email" required placeholder="votre@email.com" className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-4 focus:border-blue-500 transition-all text-white outline-none" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/30">
                  {loading ? "TRAITEMENT..." : "RÉSERVER MON ACCÈS ÉLITE"} <Sparkles size={18} />
                </button>
              </form>
            ) : (
              <div className="py-8 space-y-4 animate-in zoom-in">
                <CheckCircle2 size={32} className="text-blue-500 mx-auto" />
                <h3 className="text-xl font-black uppercase italic">Enregistré !</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Rendez-vous le 02 février.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION MODULES */}
      <section className="py-24 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "ISO 9001/14001", icon: ShieldCheck, desc: "Conformité Totale" },
            { label: "Audits Digitaux", icon: ClipboardCheck, desc: "Zéro Papier" },
            { label: "Cockpit Direction", icon: Activity, desc: "Temps Réel" },
            { label: "Sécurité Master", icon: Fingerprint, desc: "Isolation Cloud" },
          ].map((f, i) => (
            <div key={i} className="space-y-4 group">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto group-hover:bg-blue-600/20 transition-all"><f.icon size={28} className="text-blue-500" /></div>
              <h4 className="text-sm font-black uppercase tracking-widest">{f.label}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase italic">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION TARIFS */}
      <section id="plans" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
          {[
            { name: "Essai 14J", price: "0", period: "OFFERT", feat: ["21 modules"] },
            { name: "Émergence", price: "55K", period: "AN / HT", feat: ["RQ + 3 Pilotes"] },
            { name: "Croissance", price: "105K", period: "AN / HT", feat: ["10 Utilisateurs"] },
            { name: "Entreprise", price: "175K", period: "AN / HT", feat: ["Illimité"], highlight: true },
            { name: "Groupe", price: "350K", period: "AN / HT", feat: ["Multi-sites"] },
          ].map((plan, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] bg-slate-900/50 border ${plan.highlight ? 'border-blue-600 ring-4 ring-blue-600/10' : 'border-white/5'}`}>
              <h3 className="text-lg font-black uppercase italic mb-6">{plan.name}</h3>
              <div className="text-3xl font-black mb-6">{plan.price} <span className="text-[9px] text-slate-500 block uppercase">{plan.period}</span></div>
              <ul className="space-y-3 mb-10">
                {plan.feat.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-tighter"><CheckCircle2 size={12} className="text-blue-600" /> {f}</li>
                ))}
              </ul>
              <Link href="/register" className="w-full py-4 block bg-white/5 rounded-2xl text-center text-[9px] font-black uppercase hover:bg-blue-600 transition-all">Choisir</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 text-center border-t border-white/5">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Qualisoft RD 2030 • Dakar • Sénégal • Excellence Opérationnelle</p>
      </footer>
    </div>
  );
}
