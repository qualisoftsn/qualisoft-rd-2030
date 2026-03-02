/**
 * ⚡ MODULE : TrialBanner.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Barre d'outils dynamique (Action Hub).
 * FONCTION : Accès prioritaire aux processus à haut flux.
 * DESIGN : Elite SDE - Glassmorphism Indigo.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 18:45 GMT
 */

"use client";

import { 
  Zap, Plus, Download, Search, Bell, 
  HelpCircle, Database 
} from 'lucide-react';
import { toast } from 'sonner';

export default function EliteTrialBanner() {
  const handleAction = (label: string) => {
    toast.success(`KERNEL : Flux ${label} initialisé`, {
      description: "Protocole Qualisoft SDE actif.",
    });
  };

  return (
    <div className="ml-80 mr-20 bg-linear-to-r from-[#1E293B] to-[#0F172A] p-5 flex justify-between items-center px-12 border-b border-white/5 shadow-4xl relative z-40 italic font-sans rounded-b-4xl">
      
      {/* 🕹️ STATUS INDICATOR */}
      <div className="flex items-center gap-6">
        <div className="bg-blue-600/10 p-3 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
          <Zap size={20} className="text-blue-400 animate-pulse" />
        </div>
        <div className="flex flex-col text-left">
           <p className="text-[11px] font-black uppercase text-white tracking-[0.4em] leading-none mb-2 m-0">
             Pilotage Stratégique <span className="text-blue-500">Actif</span>
           </p>
           <div className="flex items-center gap-3 opacity-60">
              <Database size={12} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] m-0 leading-none">Matrix Node v2026.1.4 Scellé</span>
           </div>
        </div>
      </div>

      {/* 🚀 COMMAND TERMINAL */}
      <div className="flex items-center gap-10">
        <div className="flex bg-white/5 rounded-3xl p-1.5 border border-white/10 shadow-inner backdrop-blur-xl">
          <button 
            onClick={() => handleAction('NOUVELLE_ACTION')}
            className="flex items-center gap-3 px-8 py-3 hover:bg-white hover:text-slate-900 rounded-xl text-[10px] font-black uppercase text-white transition-all border-none cursor-pointer group italic tracking-widest"
          >
            <Plus size={16} className="text-blue-400 group-hover:text-slate-900 group-hover:rotate-90 transition-transform" /> 
            Nouvelle Unité
          </button>
          
          <div className="w-px h-6 bg-white/10 self-center mx-1" />
          
          <button 
            onClick={() => handleAction('EXPORT_SMI')}
            className="flex items-center gap-3 px-8 py-3 hover:bg-blue-600 rounded-xl text-[10px] font-black uppercase text-white transition-all border-none cursor-pointer group italic tracking-widest"
          >
            <Download size={16} className="text-blue-400 group-hover:text-white group-hover:translate-y-1 transition-transform" /> 
            Exporter Registre
          </button>
        </div>
        
        {/* 🛠️ QUICK ACCESS TOOLS */}
        <div className="flex items-center gap-8 text-slate-500 border-l border-white/10 pl-10 h-8">
          <Search size={20} className="hover:text-blue-500 hover:scale-110 cursor-pointer transition-all duration-300" />
          <div className="relative cursor-pointer group">
            <Bell size={20} className="hover:text-blue-500 hover:scale-110 transition-all duration-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-ping" />
          </div>
          <HelpCircle size={20} className="hover:text-white hover:scale-110 cursor-pointer transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}