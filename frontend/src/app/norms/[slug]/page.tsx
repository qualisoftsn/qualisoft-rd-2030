/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : Normes ISO & Diagnostic Matrix
 * RÉVISION : 04 Mars 2026 | 06:00 GMT
 * FEATURES : Information Publique + Infographie PDCA + Quiz Protégé
 */

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, ShieldCheck, Zap, Lock, RefreshCcw, BarChart, 
  ExternalLink, User, Building, Phone, X, CheckCircle2 
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
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden text-[12px]">
      
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 lg:px-20 sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-2xl z-50">
        <Link href="/" className="flex items-center gap-3 text-slate-500 no-underline hover:text-white transition-all">
          <ChevronLeft size={20} /><span className="font-black uppercase tracking-widest text-[10px]">Retour Portail</span>
        </Link>
        <button onClick={() => setMode(mode === 'info' ? 'quiz' : 'info')} className="flex items-center gap-3 px-6 py-3 bg-blue-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-blue-600 transition-all shadow-lg border-none cursor-pointer">
          {mode === 'info' ? <><Zap size={14} /> Quiz Conformité</> : 'Fermer Quiz'}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto py-24 px-8 text-left">
        {mode === 'info' ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-16">
            <div className="space-y-4 text-left">
              <h1 className="text-7xl lg:text-8xl font-black uppercase italic tracking-tighter m-0 leading-none">{norm.id}</h1>
              <p className={`text-2xl font-black uppercase italic ${norm.color}`}>{norm.label}</p>
            </div>

            <div className="p-12 bg-white/5 border border-white/10 rounded-[3rem] text-xl font-bold leading-relaxed text-slate-300 italic shadow-2xl">
              {norm.content}
            </div>

            {norm.showPDCA && (
              <div className="py-16 space-y-12">
                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                   <RefreshCcw className="text-blue-500 animate-spin-slow" size={32} />
                   <h3 className="text-3xl font-black uppercase italic m-0">Le Cycle PDCA</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PDCACard step="P" title="PLAN (Planifier)" desc="Établir les objectifs et les processus (§6.0)." color="border-blue-500/50" bg="bg-blue-900/10" />
                  <PDCACard step="D" title="DO (Faire)" desc="Mettre en œuvre ce qui a été planifié (§7.0 & §8.0)." color="border-emerald-500/50" bg="bg-emerald-900/10" />
                  <PDCACard step="C" title="CHECK (Vérifier)" desc="Surveiller et mesurer les processus (§9.0)." color="border-amber-500/50" bg="bg-amber-900/10" />
                  <PDCACard step="A" title="ACT (Agir)" desc="Entreprendre des actions pour améliorer (§10.0)." color="border-red-500/50" bg="bg-red-900/10" />
                </div>
              </div>
            )}
            
            <a href={norm.official} target="_blank" className="inline-flex items-center justify-center gap-4 w-full py-6 bg-[#0F172A] text-blue-500 uppercase font-black tracking-widest rounded-2xl border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all no-underline shadow-xl">
                Référence Officielle ISO.ORG <ExternalLink size={18} />
            </a>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 duration-500">
            {!isUnlocked ? (
              <div className="max-w-2xl mx-auto space-y-10 text-center">
                <Lock className="text-blue-600 mx-auto" size={48} />
                <h2 className="text-4xl font-black uppercase italic">Identification Diagnostic</h2>
                <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Aiguillage sécurisé vers ab.thiongane@qualisoft.sn</p>
                <form onSubmit={(e) => { e.preventDefault(); setIsUnlocked(true); }} className="bg-[#0F172A] border border-blue-600/30 p-10 rounded-[3rem] grid grid-cols-1 md:grid-cols-2 gap-6 text-left shadow-[0_0_50px_rgba(37,99,235,0.1)]">
                  <input required placeholder="NOM & PRÉNOM" className="bg-[#0B0F1A] border border-white/10 p-5 rounded-xl font-black text-white outline-none focus:border-blue-600 transition-colors" onChange={e => setUserInfo({...userInfo, name: e.target.value})} />
                  <input required placeholder="ENTREPRISE" className="bg-[#0B0F1A] border border-white/10 p-5 rounded-xl font-black text-white outline-none focus:border-blue-600 transition-colors" onChange={e => setUserInfo({...userInfo, company: e.target.value})} />
                  <input required type="email" placeholder="EMAIL PROFESSIONNEL" className="bg-[#0B0F1A] border border-white/10 p-5 rounded-xl font-black text-white outline-none focus:border-blue-600 transition-colors" onChange={e => setUserInfo({...userInfo, email: e.target.value})} />
                  <input required placeholder="MOBILE" className="bg-[#0B0F1A] border border-white/10 p-5 rounded-xl font-black text-white outline-none focus:border-blue-600 transition-colors" onChange={e => setUserInfo({...userInfo, phone: e.target.value})} />
                  <button disabled={!isFormValid} className={`md:col-span-2 py-6 rounded-2xl font-black uppercase tracking-widest transition-all border-none cursor-pointer ${isFormValid ? 'bg-blue-600 text-white shadow-2xl hover:bg-blue-500' : 'bg-white/5 text-slate-700 cursor-not-allowed'}`}>DÉGRISER LE QUIZ</button>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                  <h2 className="text-3xl font-black uppercase italic m-0">Diagnostic Matrix SDE</h2>
                  <button onClick={() => setAnswers({})} className="text-slate-500 hover:text-blue-500 bg-transparent border-none cursor-pointer flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"><RefreshCcw size={16} /> Réinitialiser</button>
                </div>
                {shuffledQuestions.map((q, idx) => (
                  <div key={idx} className="p-8 bg-[#0F172A] border border-white/5 rounded-3xl flex flex-col gap-6 text-left shadow-lg hover:border-blue-600/30 transition-colors">
                    <span className="text-base font-black uppercase italic text-slate-200">{q.q}</span>
                    <div className="flex gap-3">
                      <QuizBtn active={answers[idx] === 'OUI'} label="OUI" color="bg-blue-600" onClick={() => setAnswers({...answers, [idx]: 'OUI'})} />
                      <QuizBtn active={answers[idx] === 'UN PEU'} label="UN PEU" color="bg-amber-600" onClick={() => setAnswers({...answers, [idx]: 'UN PEU'})} />
                      <QuizBtn active={answers[idx] === 'NON'} label="NON" color="bg-red-600" onClick={() => setAnswers({...answers, [idx]: 'NON'})} />
                    </div>
                  </div>
                ))}
                <div className="pt-10">
                   <button onClick={calculateResult} disabled={Object.keys(answers).length < 19} className={`w-full py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-lg transition-all border-none shadow-2xl ${Object.keys(answers).length === 19 ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-500' : 'bg-[#0F172A] text-slate-600 cursor-not-allowed border border-white/5'}`}>VOIR MON RÉSULTAT FINAL</button>
                </div>
                {score !== null && (
                  <div className="mt-16 p-16 bg-linear-to-br from-blue-600 to-indigo-900 rounded-[4rem] text-center shadow-[0_0_100px_rgba(37,99,235,0.4)] animate-in slide-in-from-bottom-10">
                    <h3 className="text-2xl font-black uppercase mb-6 italic tracking-widest text-blue-100">Score de Maturité Matrix</h3>
                    <div className="text-[10rem] leading-none font-black italic mb-10 drop-shadow-2xl">{score}%</div>
                    <Link href="/#trial" className="px-12 py-5 bg-white rounded-2xl font-black uppercase tracking-[0.3em] text-blue-900 no-underline inline-block hover:scale-105 transition-transform shadow-2xl">PASSER À L&apos;ACTION</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-16 border-t border-white/10 bg-[#05080F] text-center">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest m-0 italic leading-relaxed">Qualisoft International SDE <br/> Villa 247, Cité Cheikh Hann, Lac Rose</p>
      </footer>
    </div>
  );
}

function PDCACard({ step, title, desc, color, bg }: any) {
  return (
    <div className={`p-8 ${bg} border ${color} rounded-4xl flex items-start gap-6 hover:scale-[1.02] transition-transform text-left`}>
      <span className="text-4xl font-black opacity-40">{step}</span>
      <div>
        <p className="text-lg font-black uppercase italic m-0 text-white mb-2">{title}</p>
        <p className="text-xs font-bold text-slate-400 uppercase m-0 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function QuizBtn({ active, label, color, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex-1 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all border-none cursor-pointer ${active ? `${color} text-white shadow-lg` : 'bg-[#0B0F1A] text-slate-500 hover:bg-white/10 border border-white/5'}`}>
      {label}
    </button>
  );
}