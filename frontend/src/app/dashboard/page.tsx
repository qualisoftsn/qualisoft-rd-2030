/**
 * 🛰️ MODULE : Dashboard/page.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Centre de commandement Matrix OS.
 * FOCUS : Performance, Traçabilité (§ISO-9001) et Zéro Latence.
 * RÉVISION : 03 Mars 2026 | 18:05 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { 
  Target, ShieldCheck, Zap, 
  AlertTriangle, ChevronRight, Loader2,
  Layers} from 'lucide-react';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

export default function DashboardPage() {
  const { user } = useAuthStore() as any;
  const [mounted, setMounted] = useState(false);

  // 🛡️ Stabilisation de l'hydratation client
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * 🧠 CALCUL DES MÉTADONNÉES DE CONTEXTE
   */
  const context = useMemo(() => {
    if (!user) return null;
    
    const role = user.U_Role?.toUpperCase();
    // ✅ ALIGNEMENT STRICT : Utilisation de U_AssignedProcessId pour le build
    const procId = user.U_AssignedProcessId || "TRANSVERSE";
    
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const sub = hostname.split(".")[0].toLowerCase();
    const isMaster = ["app", "elite", "www", "localhost", "qualisoft"].includes(sub);

    return { role, procId, isMaster };
  }, [user]);

  if (!mounted || !user || !context) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center italic">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">
          Synchronisation des Flux Matrix...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans italic pb-20">
      
      {/* 🔝 SECTION SOUVERAINE : IDENTITÉ & STATUT */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
             <span className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[9px] font-black text-blue-500 uppercase tracking-widest">
                {context.isMaster ? "Sovereign Node" : `Organisation : ${user.U_TenantName}`}
             </span>
             <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest">
                ID : {user.U_Id.slice(0, 8)}
             </span>
          </div>
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter m-0 italic leading-none">
            Salut, <span className="text-blue-600">{user.U_FirstName}</span>
          </h1>
          <p className="text-slate-500 font-bold text-[11px] uppercase tracking-[0.3em] flex items-center gap-3">
            <Layers size={14} className="text-blue-500" /> 
            {context.isMaster ? "Contrôle Global Matrix" : `Pilotage : ${context.role}`} 
            — Processus : {context.procId}
          </p>
        </div>

        {/* INDICATEUR DE CONFORMITÉ RAPIDE */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-4xl flex items-center gap-5 backdrop-blur-md">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <ShieldCheck size={24} />
          </div>
          <div className="text-left leading-none">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Santé du SMI</p>
            <p className="text-2xl font-black text-white m-0 tracking-tighter italic">98.4%</p>
          </div>
        </div>
      </div>

      {/* 🛠️ GRILLE DE PILOTAGE OPÉRATIONNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 📋 COLONNE PRINCIPALE : ACTIONS & OBJECTIFS */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* OBJECTIFS DU PROCESSUS */}
          <section className="bg-white/5 border border-white/5 p-10 rounded-[3.5rem] text-left group hover:border-blue-600/20 transition-all duration-500">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3 italic">
                <Target size={16} className="text-blue-500" /> Objectifs Stratégiques
              </h3>
              <button className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors border-none bg-transparent cursor-pointer">
                Détails du Processus
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: "Performance Qualité", val: 88, color: "bg-blue-600" },
                { label: "Traitement des NC", val: 42, color: "bg-amber-500" },
              ].map((obj, i) => (
                <div key={i} className="bg-black/20 p-8 rounded-3xl border border-white/5 hover:bg-black/40 transition-colors">
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-xs font-black text-white uppercase italic tracking-tight">{obj.label}</p>
                    <p className="text-[10px] font-black text-slate-500">{obj.val}%</p>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${obj.color} transition-all duration-1000 ease-out`} 
                      style={{ width: `${obj.val}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ACCÈS RAPIDES AUX ALERTES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-600/5 border border-blue-500/10 p-10 rounded-[3rem] group hover:bg-blue-600/10 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <Zap className="text-blue-500" size={32} />
                <ChevronRight className="text-blue-500/20 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm font-black text-white uppercase italic m-0">Actions Correctives</p>
              <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest leading-relaxed">
                4 actions en attente de validation d&apos;efficacité.
              </p>
            </div>

            <div className="bg-red-600/5 border border-red-500/10 p-10 rounded-[3rem] group hover:bg-red-600/10 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <AlertTriangle className="text-red-500" size={32} />
                <ChevronRight className="text-red-500/20 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm font-black text-white uppercase italic m-0">Non-Conformités</p>
              <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest leading-relaxed">
                Une anomalie critique (§10.2) nécessite votre diagnostic.
              </p>
            </div>
          </div>
        </div>

        {/* 🛰️ COLONNE DROITE : TRAÇABILITÉ TEMPS RÉEL */}
        <div className="lg:col-span-4">
           <ActivityFeed />
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.1); border-radius: 10px; }
      `}</style>

    </div>
  );
}