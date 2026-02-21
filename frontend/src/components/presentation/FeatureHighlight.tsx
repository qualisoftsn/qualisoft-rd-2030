"use client";
/**
 * 🛰️ MODULE : ProspectHighlight
 * -------------------------------------------------------------------------
 * FONCTION : Mise en avant des piliers technologiques Qualisoft Elite.
 * RÔLE : Présentation marketing des capacités de digitalisation et d'isolation.
 * PHILOSOPHIE : Clarté, impact visuel et mise en avant de la souveraineté.
 */

import { PieChart, ShieldCheck, Users, Zap } from "lucide-react";

export default function ProspectHighlight() {
  // Définition des "High-Lights" stratégiques du système Matrix
  const highlights = [
    {
      title: "SMI 100% Digital",
      desc: "Passage au zéro papier pour tous vos processus ISO avec scellage numérique.",
      icon: Zap,
    },
    {
      title: "Gestion des Risques",
      desc: "Anticipation proactive des menaces critiques via le monitoring Kernel.",
      icon: ShieldCheck,
    },
    {
      title: "Rapports Automatisés",
      desc: "Génération de PDF analytiques en temps réel pour vos audits de certification.",
      icon: PieChart,
    },
    {
      title: "Multi-Sites & Tenant",
      desc: "Isolation scellée des données : pilotez vos filiales sans aucune fuite de flux.",
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem]">
      {highlights.map((h, i) => (
        <div key={i} className="p-4 space-y-2 group transition-all duration-300 hover:bg-white/40 rounded-3xl">
          {/* Conteneur d'icône avec style Matrix Blue */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
            <h.icon size={16} />
          </div>
          
          {/* Titrage en typographie Elite */}
          <h4 className="text-[10px] font-black uppercase text-blue-900 tracking-tighter italic">
            {h.title}
          </h4>
          
          {/* Description métier */}
          <p className="text-[9px] text-slate-500 font-medium leading-tight">
            {h.desc}
          </p>
        </div>
      ))}
    </div>
  );
}