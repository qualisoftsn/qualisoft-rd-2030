/**
 * 📚 MODULE : NormPage (Template Dynamique)
 */

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ExternalLink, ShieldCheck } from 'lucide-react';

const NORMS_DATA = {
  "iso-9001": {
    title: "ISO 9001:2015",
    subtitle: "Management de la Qualité",
    content: "La norme ISO 9001 définit les critères applicables à un système de management de la qualité. Elle repose sur un certain nombre de principes de management de la qualité, notamment une forte orientation client, la motivation et l'engagement de la direction, l'approche processus et l'amélioration continue.",
    ref: "https://www.iso.org/fr/iso-9001-quality-management.html"
  },
  "iso-14001": {
    title: "ISO 14001:2015",
    subtitle: "Management Environnemental",
    content: "Cette norme fournit un cadre aux organisations pour protéger l'environnement et répondre aux conditions environnementales changeantes, en équilibre avec les besoins socio-économiques. Elle permet d'améliorer la performance environnementale via une utilisation rationnelle des ressources.",
    ref: "https://www.iso.org/fr/iso-14001-environmental-management.html"
  },
  "iso-45001": {
    title: "ISO 45001:2018",
    subtitle: "Santé & Sécurité au Travail",
    content: "Destinée à prévenir les traumatismes et pathologies liés au travail et à fournir des lieux de travail sûrs et sains. Elle s'appuie sur d'autres systèmes de management comme l'ISO 14001 et l'ISO 9001 pour créer une structure HSEQ intégrée.",
    ref: "https://www.iso.org/fr/iso-45001-occupational-health-and-safety.html"
  },
  "iso-27001": {
    title: "ISO 27001:2022",
    subtitle: "Sécurité de l'Information",
    content: "La norme de référence pour la cybersécurité. Elle spécifie les exigences pour l'établissement, la mise en œuvre, la mise à jour et l'amélioration continue d'un système de management de la sécurité de l'information (SMSI).",
    ref: "https://www.iso.org/fr/iso-iec-27001-information-security.html"
  }
};

export default function NormPage({ params }: { params: { slug: string } }) {
  const norm = NORMS_DATA[params.slug as keyof typeof NORMS_DATA];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30">
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-12 sticky top-0 bg-[#0B0F1A]/90 backdrop-blur-2xl z-50">
        <Link href="/" className="flex items-center gap-4 hover:text-blue-500 transition-colors">
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Retour Landing</span>
        </Link>
        <div className="flex items-center gap-4">
          <Image src="/images/qslogo.png" alt="Qualisoft" width={28} height={28} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Qualisoft Elite</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-32 pb-20 px-8">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-10">
          <ShieldCheck size={16} className="text-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Standard International</span>
        </div>

        <h1 className="text-6xl lg:text-8xl font-black uppercase italic tracking-tighter mb-4 leading-none">
          {norm.title}
        </h1>
        <p className="text-2xl font-bold text-blue-500 uppercase italic mb-12 tracking-tight">
          {norm.subtitle}
        </p>

        <div className="prose prose-invert max-w-none mb-20 text-slate-400 text-lg leading-relaxed uppercase">
          {norm.content}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <a href={norm.ref} target="_blank" className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-between hover:bg-white/10 transition-all group">
             <div>
                <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Référence Officielle</p>
                <p className="text-lg font-black uppercase italic m-0">Consulter sur ISO.org</p>
             </div>
             <ExternalLink size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
          <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem]">
             <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Intégration Elite</p>
             <p className="text-sm font-bold uppercase italic m-0 text-slate-300">
               Ce standard est nativement implémenté dans le Kernel Matrix RD-2026 via nos modules de pilotage §SMI.
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}