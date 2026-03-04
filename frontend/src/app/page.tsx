/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : RootPage (Landing Page Showcase)
 * -------------------------------------------------------------------------
 * RÔLE : Portail d'entrée souverain pour elite.qualisoft.sn.
 * DESIGN : Showcase Réel • Plans Émergence/Croissance/Entreprise/Groupe.
 * RÉVISION : 04 Mars 2026 | 00:45 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Fingerprint, 
  CheckCircle2, Star
} from 'lucide-react';

// Données issues de vos constantes src/admin/constants/plans
const PLANS_DATA = [
  { id: 'EMERGENCE', name: 'Émergence', rawPrice: 55000, desc: 'Pilotage Essentiel SMI' },
  { id: 'CROISSANCE', name: 'Croissance', rawPrice: 105000, desc: 'Performance & Audit' },
  { id: 'ENTREPRISE', name: 'Entreprise', rawPrice: 175000, desc: 'Multi-Sites & Risques' },
  { id: 'GROUPE', name: 'Groupe Élite', rawPrice: 350000, desc: 'Souveraineté Totale' },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden">
      
      {/* 🔮 NAVIGATION SOUVERAINE */}
      <nav className="h-24 border-b border-white/5 flex items-center justify-between px-8 lg:px-20 sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-2xl z-100">
        <div className="flex items-center gap-5">
          <Image src="/images/qslogo.png" alt="Qualisoft" width={40} height={40} className="shadow-2xl" />
          <h1 className="text-xl font-black uppercase tracking-tighter m-0">
            QUALI<span className="text-blue-600">SOFT</span> <span className="text-slate-500 font-medium">ELITE</span>
          </h1>
        </div>
        <Link href="/auth/login" className="px-8 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-lg">
          DÉPLOYER LA MATRICE
        </Link>
      </nav>

      {/* 🚀 HERO SECTION */}
      <section className="pt-32 pb-20 px-8 lg:px-20 max-w-7xl mx-auto text-left">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-8">
            <Fingerprint size={14} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">Kernel v3.0 Scellé RD-2026</span>
          </div>
          <h2 className="text-6xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.9] mb-10 italic">
            L&apos;INTELLIGENCE <br />
            <span className="text-blue-600">OPÉRATIONNELLE</span> <br />
            SOUVERAINE.
          </h2>
        </div>
      </section>

      {/* 🖼️ SECTION SHOWCASE : VOS IMAGES RÉELLES */}
      <section className="py-24 px-8 lg:px-20 bg-white/2 border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-32">
          
          <div className="text-center">
             <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 mb-20 italic">
                Aperçu des modules de pilotage §ISO
             </h3>
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Image 1 : Cockpit Opérationnel */}
                <ShowcaseItem 
                  src="/images/qs_cockpit.jpg" 
                  title="Cockpit Opérationnel" 
                  desc="Pilotage centralisé des indicateurs clés."
                />
                {/* Image 2 : Revue de Direction */}
                <ShowcaseItem 
                  src="/images/qs_revuedirection.jpg" 
                  title="Revue de Direction" 
                  desc="Intelligence stratégique et conformité légale."
                  highlight
                />
                {/* Image 3 : Registre SSE */}
                <ShowcaseItem 
                  src="/images/qs_qhse.jpg" 
                  title="Registre SSE" 
                  desc="Gestion des incidents Santé et Sécurité."
                />
             </div>
          </div>
        </div>
      </section>

      {/* 💰 SECTION PLANS : VOS DONNÉES PRISMA */}
      <section className="py-40 px-8 lg:px-20 max-w-7xl mx-auto text-left">
        <div className="mb-20">
          <h4 className="text-4xl font-black uppercase italic tracking-tighter mb-4">
            NOS PLANS <span className="text-blue-600">STRATÉGIQUES.</span>
          </h4>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tarification mensuelle HT • Déploiement Cloud Souverain</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PLANS_DATA.map((plan) => (
            <div key={plan.id} className="p-10 bg-white/5 border border-white/5 rounded-[3rem] hover:border-blue-600/30 transition-all group relative overflow-hidden">
               {plan.id === 'GROUPE' && (
                 <div className="absolute top-5 right-5 text-amber-500 animate-pulse"><Star size={20} fill="currentColor" /></div>
               )}
               <h5 className="text-2xl font-black uppercase italic mb-2 text-white">{plan.name}</h5>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-8">{plan.desc}</p>
               <div className="mb-10">
                  <span className="text-3xl font-black text-blue-500 italic">{plan.rawPrice.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-slate-600 ml-2">XOF / MOIS</span>
               </div>
               <ul className="space-y-4 list-none p-0 mb-12">
                  <li className="flex items-center gap-3 text-[9px] font-black uppercase tracking-wide text-white/80">
                    <CheckCircle2 size={12} className="text-blue-500" /> GED Documentaire §7.5
                  </li>
                  <li className="flex items-center gap-3 text-[9px] font-black uppercase tracking-wide text-white/80">
                    <CheckCircle2 size={12} className="text-blue-500" /> Workflow NC §10.2
                  </li>
               </ul>
               <Link href="/auth/login" className="block w-full text-center py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                  SÉLECTIONNER
               </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 🏁 FOOTER */}
      <footer className="py-20 border-t border-white/5 bg-[#080B14] text-center">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.8em] italic">
          Qualisoft Elite Matrix • RD-2026 Sovereign OS
        </p>
      </footer>
    </div>
  );
}

function ShowcaseItem({ src, title, desc, highlight = false }: any) {
  return (
    <div className={`space-y-6 group ${highlight ? 'lg:-mt-10' : ''}`}>
      <div className={`relative aspect-video rounded-4xl overflow-hidden border-4 ${highlight ? 'border-blue-600 shadow-4xl shadow-blue-900/20' : 'border-white/5'} transition-all group-hover:scale-[1.02] duration-700`}>
        <Image src={src} alt={title} fill className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="px-4">
        <p className="text-sm font-black uppercase italic text-white m-0 tracking-tight">{title}</p>
        <p className="text-[10px] font-bold text-slate-500 uppercase mt-2 m-0">{desc}</p>
      </div>
    </div>
  );
}