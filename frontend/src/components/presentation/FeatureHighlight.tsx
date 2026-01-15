"use client";
import { PieChart, ShieldCheck, Users, Zap } from "lucide-react";

export default function ProspectHighlight() {
  const highlights = [
    {
      title: "SMI 100% Digital",
      desc: "Passage au zéro papier pour tous vos processus ISO.",
      icon: Zap,
    },
    {
      title: "Gestion des Risques",
      desc: "Anticipation proactive des menaces critiques.",
      icon: ShieldCheck,
    },
    {
      title: "Rapports Automatisés",
      desc: "Génération de PDF en temps réel pour vos audits.",
      icon: PieChart,
    },
    {
      title: "Multi-Sites",
      desc: "Pilotez vos filiales depuis un point central.",
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem]">
      {highlights.map((h, i) => (
        <div key={i} className="p-4 space-y-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <h.icon size={16} />
          </div>
          <h4 className="text-[10px] font-black uppercase text-blue-900 tracking-tighter">
            {h.title}
          </h4>
          <p className="text-[9px] text-slate-500 font-medium leading-tight">
            {h.desc}
          </p>
        </div>
      ))}
    </div>
  );
}
