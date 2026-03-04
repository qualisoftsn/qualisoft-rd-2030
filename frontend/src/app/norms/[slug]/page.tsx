/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : Normes ISO & Diagnostic Matrix
 * RÉVISION : 04 Mars 2026 | 03:15 GMT
 * FEATURES : Diagnostic dynamique, Mélange aléatoire, Formulaire de déverrouillage.
 */

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft, ShieldCheck, Zap, Send, Lock, 
  CheckCircle2, RefreshCcw, BarChart, ExternalLink, Mail, User, Building, Phone
} from 'lucide-react';

// --- BASE DE DONNÉES DES NORMES ---
const NORMS_DATA = {
  "iso-9001": { id: "ISO 9001", label: "Qualité", color: "text-blue-500", bg: "bg-blue-600/10", border: "border-blue-500/20" },
  "iso-14001": { id: "ISO 14001", label: "Environnement", color: "text-emerald-500", bg: "bg-emerald-600/10", border: "border-emerald-500/20" },
  "iso-45001": { id: "ISO 45001", label: "SST", color: "text-amber-500", bg: "bg-amber-600/10", border: "border-amber-500/20" },
  "iso-27001": { id: "ISO 27001", label: "Sécurité Info", color: "text-red-500", bg: "bg-red-600/10", border: "border-red-500/20" }
};

// --- POOL DE QUESTIONS (Mélangées dynamiquement) ---
const QUESTIONS_POOL = [
  { q: "Vos processus clés sont-ils cartographiés et documentés ?", weight: 20 },
  { q: "Réalisez-vous une analyse de risques proactive (§6.1) ?", weight: 20 },
  { q: "L'implication de la Direction est-elle formellement prouvée ?", weight: 15 },
  { q: "Disposez-vous d'un système de veille réglementaire à jour ?", weight: 15 },
  { q: "Vos non-conformités génèrent-elles des actions correctives ?", weight: 15 },
  { q: "Mesurez-vous la satisfaction client / parties intéressées ?", weight: 15 }
];

export default function NormDetailPage({ params }: { params: { slug: string } }) {
  const norm = NORMS_DATA[params.slug as keyof typeof NORMS_DATA] || NORMS_DATA["iso-9001"];
  
  // États
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', company: '', email: '', phone: '' });
  const [shuffledQuestions, setShuffledQuestions] = useState(QUESTIONS_POOL);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState<number | null>(null);

  // Mélange des questions au montage ou au reset
  const shuffle = () => {
    const mixed = [...QUESTIONS_POOL].sort(() => Math.random() - 0.5);
    setShuffledQuestions(mixed);
    setAnswers({});
    setScore(null);
  };

  useEffect(() => { shuffle(); }, []);

  // Validation Formulaire
  const isFormValid = userInfo.name && userInfo.email && userInfo.company && userInfo.phone;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation d'envoi à ab.thiongane@qualisoft.sn
    console.log("Transmission des données prospect à ab.thiongane@qualisoft.sn", userInfo);
    setIsUnlocked(true);
  };

  const calculateResult = () => {
    let total = 0;
    shuffledQuestions.forEach((q, idx) => {
      if (answers[idx]) total += q.weight;
    });
    setScore(total);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden text-[12px]">
      
      {/* NAV */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 lg:px-20 sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-2xl z-50">
        <Link href="/" className="flex items-center gap-2 text-blue-500 no-underline hover:text-white transition-colors">
          <ChevronLeft size={16} /><span className="font-black uppercase tracking-widest">Retour</span>
        </Link>
        <span className="font-black uppercase tracking-[0.3em] text-slate-500">Diagnostic Elite {norm.id}</span>
      </nav>

      <main className="max-w-4xl mx-auto py-20 px-8">
        
        {/* SECTION 1 : IDENTIFICATION (LE MUR) */}
        {!isUnlocked ? (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="text-center mb-12">
              <Lock className="mx-auto mb-6 text-blue-600" size={48} />
              <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter mb-4">Déverrouiller le <span className="text-blue-600">Diagnostic</span></h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest">Identifiez-vous pour accéder à l&apos;outil de maturité ISO.</p>
            </div>

            <form onSubmit={handleUnlock} className="bg-white/5 border border-white/5 rounded-[3rem] p-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input required placeholder="NOM & PRÉNOM" className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-2xl outline-none focus:border-blue-600 font-black uppercase text-white" 
                  value={userInfo.name} onChange={e => setUserInfo({...userInfo, name: e.target.value})} />
              </div>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input required placeholder="ENTREPRISE" className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-2xl outline-none focus:border-blue-600 font-black uppercase text-white"
                  value={userInfo.company} onChange={e => setUserInfo({...userInfo, company: e.target.value})} />
              </div>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input required type="email" placeholder="EMAIL PROFESSIONNEL" className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-2xl outline-none focus:border-blue-600 font-black uppercase text-white"
                  value={userInfo.email} onChange={e => setUserInfo({...userInfo, email: e.target.value})} />
              </div>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input required placeholder="MOBILE" className="w-full bg-white/5 border border-white/10 p-5 pl-12 rounded-2xl outline-none focus:border-blue-600 font-black uppercase text-white"
                  value={userInfo.phone} onChange={e => setUserInfo({...userInfo, phone: e.target.value})} />
              </div>
              <button disabled={!isFormValid} className={`md:col-span-2 py-6 rounded-2xl font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${isFormValid ? 'bg-blue-600 hover:bg-blue-500' : 'bg-white/5 text-slate-700'}`}>
                ACCÉDER AU QUIZ ELITE <Send size={18} />
              </button>
            </form>
          </div>
        ) : (
          /* SECTION 2 : LE QUIZ DÉGRISÉ */
          <div className="animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className={`text-5xl font-black uppercase italic ${norm.color}`}>{norm.id}</h2>
                <p className="font-bold uppercase tracking-widest text-slate-500">Indice de Maturité Opérationnelle</p>
              </div>
              <button onClick={shuffle} className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all text-slate-400">
                <RefreshCcw size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {shuffledQuestions.map((q, idx) => (
                <div key={idx} className="p-8 bg-white/5 border border-white/5 rounded-4xl flex items-center justify-between group hover:border-blue-600/30 transition-all">
                  <span className="text-lg font-black uppercase italic pr-8">{q.q}</span>
                  <div className="flex gap-4">
                    <button onClick={() => setAnswers({...answers, [idx]: true})} className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all border-none cursor-pointer ${answers[idx] === true ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-600'}`}>
                      OUI
                    </button>
                    <button onClick={() => setAnswers({...answers, [idx]: false})} className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all border-none cursor-pointer ${answers[idx] === false ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-600'}`}>
                      NON
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={calculateResult}
              disabled={Object.keys(answers).length < shuffledQuestions.length}
              className={`mt-12 w-full py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xl transition-all shadow-4xl ${Object.keys(answers).length === shuffledQuestions.length ? 'bg-white text-blue-900' : 'bg-white/5 text-slate-800'}`}
            >
              GÉNÉRER MON SCORE MATRICE
            </button>

            {/* SECTION 3 : RÉSULTAT */}
            {score !== null && (
              <div className="mt-20 p-12 bg-blue-600 rounded-[4rem] text-center animate-in slide-in-from-top-12 duration-700 shadow-[0_0_80px_rgba(37,99,235,0.4)]">
                <BarChart className="mx-auto mb-6" size={48} />
                <h3 className="text-2xl font-black uppercase tracking-widest mb-2">Votre Score de Maturité :</h3>
                <div className="text-8xl font-black italic mb-6">{score}%</div>
                <p className="text-lg font-bold uppercase italic max-w-xl mx-auto leading-tight mb-10">
                  {score < 50 ? "Alerte : Votre système présente des failles critiques de conformité." : 
                   score < 80 ? "En Progression : Votre socle est solide mais nécessite une automatisation Elite." : 
                   "Excellence : Vous êtes prêt pour la certification Matrix RD-2026."}
                </p>
                <Link href="/#trial" className="inline-block px-12 py-6 bg-[#0B0F1A] rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all no-underline text-white">
                  OPTIMISER AVEC ELITE
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-[#080B14] text-center">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic m-0">
          Villa 247, Cité Cheikh Hann, Route du Lac Rose • contact@qualisoft.sn
        </p>
      </footer>
    </div>
  );
}