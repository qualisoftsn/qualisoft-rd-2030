//* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⚡ MODULE : ELITE TRIAL BANNER (PILOTAGE RAPIDE)
 * -------------------------------------------------------------------------
 * FONCTION : Barre d'outils dynamique pour les actions à haute fréquence.
 * RÔLE : Accès immédiat aux rapports et aux nouvelles déclarations.
 * DESIGN : Intégration transparente au-dessus du Layout Principal.
 */

import React from 'react';
import { Zap, Plus, Download, Search, Bell, HelpCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function EliteTrialBanner() {
  const handleAction = (label: string) => {
    toast.info(`Initialisation : Flux ${label}`);
  };

  return (
    <div className="ml-72 bg-linear-to-r from-blue-700 to-indigo-950 p-4 flex justify-between items-center px-10 border-b border-white/10 shadow-2xl relative z-40 italic font-sans">
      <div className="flex items-center gap-5">
        <div className="bg-white/10 p-2.5 rounded-xl animate-pulse border border-white/5">
          <Zap size={18} className="text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        </div>
        <div className="flex flex-col text-left">
           <p className="text-[10px] font-black uppercase text-white tracking-[0.3em] leading-none mb-1.5">
             Système de Pilotage Actif
           </p>
           <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-blue-400" />
              <span className="text-[9px] font-bold text-blue-200 uppercase tracking-widest opacity-80">Matrix Kernel v2026.1.4 Scellé</span>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* TERMINAL DE COMMANDES PRÉCISES */}
        <div className="flex bg-black/30 rounded-2xl p-1.5 border border-white/10 shadow-inner backdrop-blur-md">
          <button 
            onClick={() => handleAction('Nouvelle Action')}
            className="flex items-center gap-3 px-6 py-2.5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase text-white transition-all border-none cursor-pointer group"
          >
            <Plus size={16} className="text-blue-400 group-hover:rotate-90 transition-transform" /> 
            Nouvelle Action
          </button>
          <div className="w-px h-6 bg-white/10 self-center mx-1" />
          <button 
            onClick={() => handleAction('Génération Rapport')}
            className="flex items-center gap-3 px-6 py-2.5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase text-white transition-all border-none cursor-pointer group"
          >
            <Download size={16} className="text-blue-400 group-hover:translate-y-1 transition-transform" /> 
            Exporter Rapport
          </button>
        </div>
        
        {/* BARRE D'ACCÈS RAPIDE AUX MICRO-SERVICES */}
        <div className="flex items-center gap-6 text-white/50 border-l border-white/10 pl-8 h-8">
          <Search size={20} className="hover:text-blue-400 hover:scale-110 cursor-pointer transition-all" />
          <Bell size={20} className="hover:text-blue-400 hover:scale-110 cursor-pointer transition-all" />
          <HelpCircle size={20} className="hover:text-blue-400 hover:scale-110 cursor-pointer transition-all" />
        </div>
      </div>
    </div>
  );
}