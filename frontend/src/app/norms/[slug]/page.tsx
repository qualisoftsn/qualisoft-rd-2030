/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : Normes ISO & Diagnostic Matrix
 * RÉVISION : 04 Mars 2026 | 05:00 GMT
 * FEATURES : Information Publique + Infographie PDCA + Quiz Protégé
 */

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronLeft, ShieldCheck, Zap, Lock, RefreshCcw, BarChart, 
  ExternalLink, User, Building, Phone, X, ArrowRight, CheckCircle2 
} from 'lucide-react';

const NORMS_DATA = {
  "iso-9001": { 
    id: "ISO 9001", label: "Management Qualité", color: "text-blue-500", 
    content: "Standard mondial pour la satisfaction client et la maîtrise des processus (§4.4). Intègre nativement l'approche risques §6.1.",
    official: "https://www.iso.org/fr/iso-9001-quality-management.html",
    showPDCA: true
  },
  "iso-14001": { 
    id: "ISO 14001", label: "Management Environnement", color: "text-emerald-500", 
    content: "Référence pour la performance écologique et la conformité réglementaire environnementale (§6.1.3).",
    official: "https://www.iso.org/fr/iso-14001-environmental-management.html",
    showPDCA: false
  },
  "iso-45001": { 
    id: "ISO 45001", label: "Santé & Sécurité", color: "text-amber-500", 
    content: "Cadre pour la sécurité des travailleurs et la réduction des dangers SST (§6.1.2).",
    official: "https://www.iso.org/fr/iso-45001-occupational-health-and-safety.html",
    showPDCA: false
  },
  "iso-27001": { 
    id: "ISO 27001", label: "Sécurité Information", color: "text-red-500", 
    content: "Norme souveraine pour la cybersécurité et la protection des actifs informationnels Matrix.",
    official: "https://www.iso.org/fr/iso-iec-27001-information-security.html",
    showPDCA: false
  }
};

const QUESTIONS_POOL = [
  // 10 ISO 9001
  { q: "[9001] Vos processus sont-ils cartographiés avec des interactions claires (§4.4) ?", weight: 5 },
  { q: "[9001] La Direction démontre-t-elle un leadership actif et documenté (§5.1) ?", weight: 5 },
  { q: "[9001] Réalisez-vous une analyse de risques et opportunités par processus (§6.1) ?", weight: 5 },
  { q: "[9001] Les ressources nécessaires au SMI sont-elles identifiées et fournies (§7.1) ?", weight: 5 },
  { q: "[9001] Votre GED garantit-elle l'intégrité des documents (§7.5) ?", weight: 5 },
  { q: "[9001] Maîtrisez-vous la conformité des prestataires externes (§8.4) ?", weight: 5 },
  { q: "[9001] Le processus d'écoute client est-il systématique (§9.1.2) ?", weight: 5 },
  { q: "[9001] Les audits internes sont-ils réalisés selon un planning rigoureux (§9.2) ?", weight: 5 },
  { q: "[9001] La Revue de Direction statue-t-elle sur l'efficacité du système (§9.3) ?", weight: 5 },
  { q: "[9001] Les non-conformités font-elles l'objet d'une analyse de cause (§10.2) ?", weight: 5 },
  // 3 ISO 14001
  { q: "[14001] Identifiez-vous vos aspects environnementaux significatifs ?", weight: 10 },
  { q: "[14001] Avez-vous un plan d'urgence testé pour les incidents écologiques ?", weight: 10 },
  { q: "[14001] Votre veille réglementaire environnementale est-elle à jour ?", weight: 10 },
  // 3 ISO 45001
  { q: "[45001] Les travailleurs participent-ils à l'identification des dangers ?", weight: 10 },
  { q: "[45001] Suivez-vous mensuellement vos taux de fréquence et gravité ?", weight: 10 },
  { q: "[45001] Vos EPI sont-ils conformes et leur port contrôlé ?", weight: 10 },
  // 3 ISO 27001
  { q: "[27001] Votre Déclaration d'Applicabilité (SoA) est-elle signée ?", weight: 10 },
  { q: "[27001] Appliquez-vous le principe du moindre privilège informatique ?", weight: 10 },
  { q: "[27001] Vos sauvegardes sont-elles immuables et testées ?", weight: 10 }
];

export default function NormDetailPage({ params }: { params: { slug: string } }) {
  const norm = NORMS_DATA[params.slug as keyof typeof NORMS_DATA] || NORMS_DATA["iso-9001"];
  
  const [mode, setMode] = useState<'info' | 'quiz'>('info');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', company: '', email: '', phone: '' });
  const [shuffledQuestions, setShuffledQuestions] = useState(QUESTIONS_POOL);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (mode === 'quiz') {
      const mixed = [...QUESTIONS_POOL].sort(() => Math.random() - 0.5);
      setShuffledQuestions(mixed);
      setAnswers({});
      setScore(null);
    }
  }, [mode]);

  const calculateResult = () => {
    let totalPoints = 0;
    shuffledQuestions.forEach((q, idx) => {
      if (answers[idx] === 'OUI') totalPoints += 100;
      else if (answers[idx] === 'UN PEU') totalPoints += 50;
    });
    setScore(Math.round(totalPoints / shuffledQuestions.length));
  };

  const isFormValid = userInfo.name && userInfo.email && userInfo.company && userInfo.phone;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden text-[11px]">
      
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 lg:px-20 sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-2xl z-50">
        <Link href="/" className="flex items-center gap-2 text-slate-500 no-underline hover:text-white transition-all">
          <ChevronLeft size={16} /><span className="font-black uppercase tracking-widest text-[9px]">Retour Portail</span>
        </Link>
        <button onClick={() => setMode(mode === 'info' ? 'quiz' : 'info')} className="flex items-center gap-3 px-5 py-2 bg-blue-600 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white hover:text-blue-600 transition-all shadow-lg border-none cursor-pointer">
          {mode === 'info' ? <><Zap size={14} /> Quiz Conformité</> : 'Fermer Quiz'}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto py-20 px-8 text-left">
        {mode === 'info' ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-16">
            <div className="space-y-4 text-left">
              <h1 className="text-6xl font-black uppercase italic tracking-tighter m-0 leading-none">{norm.id}</h1>
              <p className={`text-xl font-black uppercase italic ${norm.color}`}>{norm.label}</p>
            </div>

            <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] text-lg font-bold leading-relaxed text-slate-300 italic">
              {norm.content}
            </div>

            {norm.showPDCA && (
              <div className="py-12 space-y-10">
                <div className="flex items-center gap-4">
                   <RefreshCcw className="text-blue-500" size={24} />
                   <h3 className="text-2xl font-black uppercase italic">Le Cycle PDCA - Amélioration Continue</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PDCACard step="P" title="PLAN (Planifier)" desc="Établir les objectifs et les processus (§6.0)." color="border-blue-500/30" />
                  <PDCACard step="D" title="DO (Faire)" desc="Mettre en œuvre ce qui a été planifié (§7.0 & §8.0)." color="border-emerald-500/30" />
                  <PDCACard step="C" title="CHECK (Vérifier)" desc="Surveiller et mesurer les processus (§9.0)." color="border-amber-500/30" />
                  <PDCACard step="A" title="ACT (Agir)" desc="Entreprendre des actions pour améliorer (§10.0)." color="border-red-500/30" />
                </div>
              </div>
            )}
            
            <a href={norm.official} target="_blank" className="inline-flex items-center gap-3 text-blue-500 uppercase font-black tracking-widest no-underline border-b border-blue-500/20 pb-1">
                Référence Officielle ISO.ORG <ExternalLink size={14} />
            </a>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 duration-500">
            {!isUnlocked ? (
              <div className="max-w-2xl mx-auto space-y-10 text-center">
                <Lock className="text-blue-600 mx-auto" size={40} />
                <h2 className="text-3xl font-black uppercase italic">Identification Diagnostic</h2>
                <form onSubmit={(e) => { e.preventDefault(); setIsUnlocked(true); }} className="bg-white/5 border border-white/5 p-8 rounded-[3rem] grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <input required placeholder="NOM & PRÉNOM" className="bg-white/5 border border-white/10 p-4 rounded-xl font-black text-white outline-none focus:border-blue-600" onChange={e => setUserInfo({...userInfo, name: e.target.value})} />
                  <input required placeholder="ENTREPRISE" className="bg-white/5 border border-white/10 p-4 rounded-xl font-black text-white outline-none focus:border-blue-600" onChange={e => setUserInfo({...userInfo, company: e.target.value})} />
                  <input required type="email" placeholder="EMAIL PROFESSIONNEL" className="bg-white/5 border border-white/10 p-4 rounded-xl font-black text-white outline-none focus:border-blue-600" onChange={e => setUserInfo({...userInfo, email: e.target.value})} />
                  <input required placeholder="MOBILE" className="bg-white/5 border border-white/10 p-4 rounded-xl font-black text-white outline-none focus:border-blue-600" onChange={e => setUserInfo({...userInfo, phone: e.target.value})} />
                  <button disabled={!isFormValid} className={`md:col-span-2 py-5 rounded-2xl font-black uppercase tracking-widest transition-all border-none cursor-pointer ${isFormValid ? 'bg-blue-600 text-white shadow-xl' : 'bg-white/5 text-slate-700 cursor-not-allowed'}`}>DÉGRISER LE QUIZ</button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black uppercase italic m-0">Diagnostic QS Elite</h2>
                  <button onClick={() => setAnswers({})} className="text-slate-600 hover:text-blue-500 bg-transparent border-none cursor-pointer"><RefreshCcw size={16} /></button>
                </div>
                {shuffledQuestions.map((q, idx) => (
                  <div key={idx} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex flex-col gap-6 text-left">
                    <span className="text-sm font-black uppercase italic">{q.q}</span>
                    <div className="flex gap-2">
                      <QuizBtn active={answers[idx] === 'OUI'} label="OUI" color="bg-blue-600" onClick={() => setAnswers({...answers, [idx]: 'OUI'})} />
                      <QuizBtn active={answers[idx] === 'UN PEU'} label="UN PEU" color="bg-amber-600" onClick={() => setAnswers({...answers, [idx]: 'UN PEU'})} />
                      <QuizBtn active={answers[idx] === 'NON'} label="NON" color="bg-red-600" onClick={() => setAnswers({...answers, [idx]: 'NON'})} />
                    </div>
                  </div>
                ))}
                <button onClick={calculateResult} disabled={Object.keys(answers).length < 19} className={`w-full py-8 rounded-[2.5rem] font-black uppercase tracking-widest text-sm transition-all border-none shadow-2xl ${Object.keys(answers).length === 19 ? 'bg-white text-blue-900 cursor-pointer' : 'bg-white/5 text-slate-800'}`}>VOIR MON RÉSULTAT</button>
                {score !== null && (
                  <div className="mt-12 p-12 bg-blue-600 rounded-[4rem] text-center shadow-4xl animate-in slide-in-from-top-10">
                    <h3 className="text-xl font-black uppercase mb-4 italic">Score de Maturité QSHE</h3>
                    <div className="text-8xl font-black italic mb-6">{score}%</div>
                    <Link href="/#trial" className="px-10 py-4 bg-[#0B0F1A] rounded-xl font-black uppercase tracking-widest text-white no-underline inline-block">OPTIMISER AVEC ELITE</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-white/5 bg-[#080B14] text-center">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest m-0 italic">Qualisoft Corporate • Villa 247, Lac Rose</p>
      </footer>
    </div>
  );
}

function PDCACard({ step, title, desc, color }: any) {
  return (
    <div className={`p-6 bg-white/5 border ${color} rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-all text-left`}>
      <span className="text-3xl font-black text-blue-600/50">{step}</span>
      <div>
        <p className="font-black uppercase italic m-0 text-white mb-1">{title}</p>
        <p className="text-[10px] font-bold text-slate-500 uppercase m-0 leading-tight">{desc}</p>
      </div>
    </div>
  );
}

function QuizBtn({ active, label, color, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all border-none cursor-pointer ${active ? `${color} text-white` : 'bg-white/5 text-slate-600 hover:bg-white/10'}`}>
      {label}
    </button>
  );
}