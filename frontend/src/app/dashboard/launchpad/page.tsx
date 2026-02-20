/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/core/api/api-client';
import { 
  Rocket, GitBranch, CheckCircle2, AlertTriangle, 
  FileWarning, ArrowRight, Activity, Zap, ShieldCheck,
  Bell, LayoutDashboard, Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * 🛰️ MODULE : LAUNCHPAD PILOTE (ENTRY POINT)
 * -------------------------------------------------------------------------
 * RÔLE : Point d'entrée stratégique pour le pilote rattaché à un processus.
 * * FONCTIONNALITÉS :
 * 1. Identification automatique du processus rattaché à l'utilisateur connecté.
 * 2. Accès rapide au cockpit de pilotage (données temps réel).
 * 3. Raccourcis de saisie (Non-conformités §10.2 et Actions d'amélioration).
 * 4. Monitoring flash des alertes de performance (Indicateurs et Retards).
 * * CONFORMITÉ ISO 9001 : 
 * - Clause 9.1.1 : Surveillance et mesure.
 * - Clause 10.2 : Traitement des non-conformités.
 */

// Interface pour la structure des données du processus
interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_Description?: string;
}

export default function PilotLaunchpad() {
  // --- ÉTATS DU COMPOSANT ---
  const [myProcess, setMyProcess] = useState<Processus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /**
   * 📡 RÉCUPÉRATION DU CONTEXTE OPÉRATIONNEL
   * Le service filtrant côté backend assure que l'utilisateur ne récupère 
   * que le processus dont il est désigné comme Pilote ou Copilote.
   */
  const initLaunchpad = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/processus');
      
      // Sécurisation : On vérifie l'existence d'un processus rattaché
      if (res.data && res.data.length > 0) {
        setMyProcess(res.data[0]);
      } else {
        console.warn("Aucun processus rattaché détecté pour cet utilisateur.");
        setError(true);
      }
    } catch (err) {
      console.error("Erreur d'initialisation du Launchpad:", err);
      toast.error("Échec de synchronisation avec le noyau opérationnel.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initLaunchpad();
  }, [initLaunchpad]);

  // --- ÉTAT DE CHARGEMENT ---
  if (loading) {
    return (
      <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center ml-72">
        <Activity className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse">
          Chargement du flux Elite...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 p-12 selection:bg-blue-600/30">
      
      {/* 👋 WELCOME SECTION : IDENTITÉ VISUELLE */}
      <header className="mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic flex items-center gap-6 leading-none">
              <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/20">
                <Rocket className="text-blue-500" size={40} />
              </div>
              Launchpad <span className="text-blue-600">Pilote</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.5em] mt-6 italic flex items-center gap-2">
              <ShieldCheck size={12} className="text-blue-500/50" />
              Focus Opérationnel • Qualisoft Elite 2026 • Système de Management Intégré
            </p>
          </div>
          
          {/* Badge d'état du système */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 px-6 py-3 rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Flux de données actif</span>
          </div>
        </div>
      </header>

      {/* 🚀 LAYOUT PRINCIPAL : COCKPIT & ALERTES */}
      <div className="grid grid-cols-12 gap-12 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* 🕹️ ACCÈS DIRECT AU COCKPIT (ZONE DE COMMANDE) */}
        <div className="col-span-12 lg:col-span-8 space-y-10">
          
          {error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-[3.5rem] p-12 text-center">
              <FileWarning size={48} className="mx-auto text-red-500 mb-6" />
              <h3 className="text-xl font-black uppercase mb-2">Contexte introuvable</h3>
              <p className="text-slate-500 text-xs italic uppercase">Aucun processus n&apos;est rattaché à votre profil d&apos;utilisateur.</p>
            </div>
          ) : (
            <Link href={`/dashboard/processus/cockpit/${myProcess?.PR_Id}`}>
              <div className="group relative bg-blue-600 p-0.5 rounded-[3.5rem] transition-all hover:-translate-y-1 active:scale-[0.98] cursor-pointer shadow-3xl shadow-blue-900/40 overflow-hidden">
                {/* Effet de lueur interne */}
                <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="bg-[#0B0F1A] rounded-[3.4rem] p-12 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-10">
                    <div className="w-24 h-24 rounded-4xl bg-blue-600 flex items-center justify-center shadow-xl group-hover:rotate-15 transition-all duration-500">
                      <GitBranch size={45} className="text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-4xl font-black uppercase tracking-tighter mb-3 leading-none italic">
                        Accéder à mon <span className="text-blue-500">Cockpit</span>
                      </h2>
                      <div className="flex items-center gap-3">
                         <span className="bg-blue-600/10 text-blue-500 font-black text-[10px] uppercase italic tracking-[0.2em] px-3 py-1 rounded-lg border border-blue-500/20">
                            {myProcess?.PR_Code}
                         </span>
                         <span className="text-slate-500 font-black text-[10px] uppercase italic tracking-[0.2em]">
                            — {myProcess?.PR_Libelle}
                         </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center bg-white/2 group-hover:bg-blue-600 group-hover:border-blue-400 transition-all duration-500">
                    <ArrowRight size={32} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* ⚡ ACTIONS RAPIDES (INSERTION DIRECTE) */}
          <div className="grid grid-cols-2 gap-10">
              <QuickCard 
                title="Déclarer une NC" 
                subtitle="Non-conformité §10.2"
                icon={AlertTriangle} 
                color="text-red-500" 
                href="/dashboard/improvement/nc/new"
              />
              <QuickCard 
                title="Nouvelle Action" 
                subtitle="Amélioration Continue"
                icon={Zap} 
                color="text-amber-500" 
                href="/dashboard/improvement/actions/new"
              />
          </div>
        </div>

        {/* 📊 RÉSUMÉ DES URGENCES (LOGIQUE DE SURVEILLANCE §9.1) */}
        <div className="col-span-12 lg:col-span-4 space-y-10">
           {/* Widget d'alertes consolidées */}
           <div className="bg-white/2 border border-white/5 rounded-[3.5rem] p-10 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] italic leading-none">
                  Focus Risques
                </h3>
                <Bell size={14} className="text-slate-600" />
              </div>

              <div className="space-y-8">
                 <AlertItem count={3} label="Actions en retard" color="text-red-500" />
                 <AlertItem count={1} label="Indicateur hors cible" color="text-amber-500" />
                 <AlertItem count={5} label="Docs à réviser" color="text-blue-500" />
              </div>

              <div className="mt-12 pt-10 border-t border-white/5">
                <button className="w-full py-4 bg-white/2 hover:bg-white/5 rounded-2xl text-[9px] font-black uppercase italic tracking-widest text-slate-400 transition-all border border-white/5">
                  Consulter la revue complète
                </button>
              </div>
           </div>

           {/* Zone d'inspiration Qualité */}
           <div className="bg-blue-600/5 border border-blue-600/10 rounded-[3rem] p-10 text-center relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                <ShieldCheck size={120} />
              </div>
              <p className="text-[11px] font-black text-blue-500 uppercase italic leading-relaxed relative z-10">
                &quot;La qualité n&apos;est pas un acte, c&apos;est une habitude.&quot;
              </p>
              <p className="text-[8px] font-bold text-slate-600 uppercase mt-4 tracking-widest italic relative z-10">
                — ARISTOTE (Vecteur de Performance)
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 🏷️ COMPOSANT : CARTE D'ACTION RAPIDE
 * Pour les flux d'insertion de données SMQ (NC, Actions, Audits).
 */
function QuickCard({ title, subtitle, icon: Icon, color, href }: any) {
  return (
    <Link href={href}>
      <div className="bg-white/2 border border-white/5 p-10 rounded-[3rem] hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group shadow-xl">
         <div className="flex items-start justify-between mb-6">
           <div className={`p-4 rounded-2xl bg-white/5 ${color} group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all`}>
            <Icon size={28} />
           </div>
           <ArrowRight size={18} className="text-slate-800 group-hover:text-white transition-all" />
         </div>
         <div className="text-left">
           <h4 className="text-lg font-black uppercase italic text-white group-hover:text-blue-500 transition-colors leading-none mb-2">{title}</h4>
           <p className="text-[9px] font-black uppercase italic text-slate-600 tracking-widest">{subtitle}</p>
         </div>
      </div>
    </Link>
  );
}

/**
 * 🏷️ COMPOSANT : ITEM D'ALERTE PERFORMANCE
 * Affiche un compteur stylisé avec label pour les priorités ISO.
 */
function AlertItem({ count, label, color }: any) {
  return (
    <div className="flex items-center gap-6 group cursor-pointer text-left">
       <div className={`text-4xl font-black italic min-w-10 ${color} group-hover:scale-110 transition-transform leading-none`}>
          {count}
       </div>
       <div className="space-y-1">
          <span className="text-[10px] font-black uppercase italic text-slate-400 group-hover:text-white transition-colors tracking-widest leading-none block">
            {label}
          </span>
          <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
             <div className={`h-full ${color.replace('text', 'bg')} w-1/3`} />
          </div>
       </div>
    </div>
  );
}