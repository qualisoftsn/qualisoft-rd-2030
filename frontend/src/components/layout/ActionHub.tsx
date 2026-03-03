/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ⚡ MODULE : ActionHub.tsx (Anciennement TrialBanner)
 * -------------------------------------------------------------------------
 * RÔLE : Hub d'actions prioritaires et monitoring de Node Matrix.
 * SÉCURITÉ : Protection de licence via TrialProvider (§ISO 27001).
 * RÉVISION : 03 Mars 2026 | 03:15 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React from 'react';
import { 
  Zap, Plus, Download, Search, Bell, 
  HelpCircle, Database, Lock, ShieldCheck 
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// ✅ IMPORTS SCELLÉS
import { useTrial } from '@/providers/TrialProvider';
import { useAuthStore } from '@/store/authStore';

export default function ActionHub() {
  const router = useRouter();
  const { user } = useAuthStore() as any;

  // 🛡️ RÉCUPÉRATION SÉCURISÉE DU CONTEXTE (Ligne 23 fixée)
  const trial = useTrial(); 
  const isReadOnly = trial?.isReadOnly || false;

  const handleAction = (label: string) => {
    if (isReadOnly && (label.includes('NOUVELLE') || label.includes('ACTION'))) {
      toast.error("PROTOCOLE REJETÉ", {
        description: "Instance en mode Lecture Seule. Action d'écriture suspendue.",
      });
      return;
    }

    toast.success(`KERNEL : Flux ${label} initialisé`, {
      description: "Protocole Qualisoft SDE actif.",
      icon: <ShieldCheck className="text-blue-500" />
    });
  };

  return (
    <div className="bg-linear-to-r from-[#1E293B] to-[#0F172A] p-6 flex justify-between items-center px-12 border-b border-white/5 shadow-4xl relative z-40 italic font-sans rounded-b-[3rem] backdrop-blur-md">
      
      {/* 🕹️ MATRIX NODE STATUS */}
      <div className="flex items-center gap-6">
        <div className={`p-3 rounded-2xl border transition-all duration-700 ${
          isReadOnly 
          ? 'bg-orange-500/10 border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.2)]' 
          : 'bg-blue-600/10 border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
        }`}>
          {isReadOnly ? (
            <Lock size={20} className="text-orange-500 animate-pulse" />
          ) : (
            <Zap size={20} className="text-blue-400 animate-pulse" />
          )}
        </div>
        <div className="flex flex-col text-left">
          <p className="text-[11px] font-black uppercase text-white tracking-[0.4em] leading-none mb-2 m-0">
            Node Matrix <span className={isReadOnly ? "text-orange-500" : "text-blue-500"}>
              {isReadOnly ? 'LECTURE SEULE' : 'OPÉRATIONNEL'}
            </span>
          </p>
          <div className="flex items-center gap-3 opacity-50">
            <Database size={12} className="text-slate-400" />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] m-0 leading-none">
              {user?.U_TenantName || 'SDE'} • v2026.1.4
            </span>
          </div>
        </div>
      </div>

      {/* 🚀 COMMAND TERMINAL */}
      <div className="flex items-center gap-10">
        <div className="flex bg-white/5 rounded-3xl p-1.5 border border-white/10 shadow-inner backdrop-blur-2xl">
          
          <button 
            onClick={() => handleAction('NOUVELLE_UNITÉ')}
            disabled={isReadOnly}
            className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all border-none italic tracking-widest
              ${isReadOnly 
                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' 
                : 'bg-transparent text-white hover:bg-white hover:text-slate-900 cursor-pointer group'}`}
          >
            {isReadOnly ? <Lock size={14} /> : <Plus size={16} className="text-blue-400 group-hover:text-slate-900 group-hover:rotate-90 transition-transform" />} 
            Nouvelle Unité
          </button>
          
          <div className="w-px h-6 bg-white/10 self-center mx-1" />
          
          <button 
            onClick={() => handleAction('EXPORT_SMI')}
            className="flex items-center gap-3 px-8 py-3 bg-transparent hover:bg-blue-600 rounded-xl text-[10px] font-black uppercase text-white transition-all border-none cursor-pointer group italic tracking-widest"
          >
            <Download size={16} className="text-blue-400 group-hover:text-white group-hover:translate-y-1 transition-transform" /> 
            Exporter Registre
          </button>
        </div>
        
        {/* 🛠️ QUICK TOOLS */}
        <div className="flex items-center gap-8 text-slate-400 border-l border-white/10 pl-10 h-8">
          <Search size={20} className="hover:text-blue-500 hover:scale-110 cursor-pointer transition-all duration-300" />
          <div className="relative cursor-pointer group">
            <Bell size={20} className="hover:text-blue-500 hover:scale-110 transition-all duration-300" />
            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping ${isReadOnly ? 'bg-orange-500' : 'bg-blue-600'}`} />
          </div>
          <HelpCircle size={20} className="hover:text-white hover:scale-110 cursor-pointer transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}