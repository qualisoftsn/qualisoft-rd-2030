/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React from 'react';
import { Play, ShieldCheck, Zap, Globe, FileCheck, ArrowUpRight } from 'lucide-react';

export default function ProspectConsole() {
  const features = [
    { title: "Zéro Papier", desc: "Digitalisation intégrale des processus ISO", icon: Zap, color: "bg-amber-500" },
    { title: "Conformité", desc: "Monitoring en temps réel des exigences", icon: ShieldCheck, iconColor: "text-emerald-500", color: "bg-emerald-500/10" },
    { title: "Multi-Tenant", desc: "Isolation stricte des données clients", icon: Globe, color: "bg-blue-500" },
    { title: "Reporting", desc: "Génération de Revues de Direction PDF", icon: FileBarChart, color: "bg-indigo-500" }
  ];

  return (
    <div className="bg-linear-to-br from-slate-900 to-blue-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden italic mb-8">
      {/* Badge Mode Démo */}
      <div className="absolute top-6 right-8 bg-blue-500 text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-[0.2em] animate-pulse">
        Mode Présentation Elite
      </div>

      <div className="relative z-10">
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
          Console <span className="text-blue-400">Prospects</span>
        </h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">
          Arguments stratégiques Qualisoft RD 2030
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-3xl hover:bg-white/10 transition-all cursor-default group">
              <div className={`w-8 h-8 ${f.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                <f.icon size={16} className="text-white" />
              </div>
              <h4 className="text-xs font-black uppercase mb-1 group-hover:text-blue-400 transition-colors">{f.title}</h4>
              <p className="text-[9px] text-slate-400 font-medium leading-tight lowercase italic">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <button className="px-6 py-3 bg-blue-600 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-500 transition-all">
            <Play size={14} fill="currentColor" /> Lancer la visite guidée
          </button>
          <button className="px-6 py-3 bg-white/10 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10">
            Télécharger la Plaquette <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Déco fond */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/20 blur-[100px] rounded-full" />
    </div>
  );
}

// Icone manquant dans l'import local
import { FileBarChart } from 'lucide-react';