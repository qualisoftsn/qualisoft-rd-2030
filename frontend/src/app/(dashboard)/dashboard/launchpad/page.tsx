/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : LAUNCHPAD PILOTE (ISO 9001 §5.3)
 * RÔLE : Point d'entrée opérationnel rattaché au processus du pilote
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 * LOGIC : Auto-détection du contexte par le Kernel Matrix
 */

import { useCallback, useEffect, useState } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { 
  AlertTriangle, ArrowRight, GitBranch, 
  ShieldCheck, Zap, RefreshCcw, FileWarning, 
  BellRing
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_Description?: string;
  PR_IsActive: boolean;
  PR_PiloteId: string;
  PR_CoPiloteId?: string;
}

interface QuickActionProps {
  title: string;
  sub: string;
  icon: React.ElementType;
  color: 'rose' | 'amber' | 'blue';
  href: string;
}

interface AlertStatProps {
  count: number;
  label: string;
  color: 'rose' | 'amber' | 'blue';
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCcw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : QUICK ACTION
// ============================================================================

function QuickAction({ title, sub, icon: Icon, color, href }: QuickActionProps) {
  const themes: Record<QuickActionProps['color'], string> = { 
    rose: "text-rose-400 border-rose-500/20", 
    amber: "text-amber-400 border-amber-500/20", 
    blue: "text-blue-400 border-blue-500/20" 
  };
  
  return (
    <Link 
      href={href} 
      className="group block bg-[#0F172A] border-2 border-white/5 p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl lg:rounded-[4rem] hover:border-blue-600/30 transition-all shadow-2xl no-underline relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label={`${title}: ${sub}`}
    >
      <div className="flex justify-between items-start mb-6 md:mb-8">
        <div className={cn("p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl lg:rounded-3xl bg-white/5 transition-transform group-hover:scale-110", themes[color])}>
          <Icon size={24} className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" aria-hidden="true" />
        </div>
        <ArrowRight size={20} className="w-5 h-5 text-slate-800 group-hover:text-white" aria-hidden="true" />
      </div>
      <h4 className="text-lg md:text-xl lg:text-2xl font-black text-white group-hover:text-blue-400 transition-colors m-0 leading-none mb-2 md:mb-3 italic uppercase tracking-tighter">{title}</h4>
      <p className="text-[9px] md:text-[10px] font-black text-slate-600 tracking-widest m-0 italic uppercase">{sub}</p>
    </Link>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ALERT STAT
// ============================================================================

function AlertStat({ count, label, color }: AlertStatProps) {
  const colors: Record<AlertStatProps['color'], { text: string; bg: string }> = { 
    rose: { text: "text-rose-400", bg: "bg-rose-500" }, 
    amber: { text: "text-amber-400", bg: "bg-amber-500" }, 
    blue: { text: "text-blue-400", bg: "bg-blue-500" } 
  };
  
  return (
    <div className="flex items-center gap-4 md:gap-6 lg:gap-8 group cursor-pointer" role="listitem">
      <div className={cn("text-4xl md:text-5xl lg:text-6xl font-black italic leading-none m-0 group-hover:scale-110 transition-transform tracking-tighter", colors[color].text)} aria-label={`${count} ${label}`}>
        {count}
      </div>
      <div className="space-y-1 md:space-y-2 flex-1">
        <span className="text-[10px] md:text-[11px] font-black text-slate-400 group-hover:text-white transition-colors tracking-widest block leading-none uppercase italic">{label}</span>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1 md:mt-2" role="progressbar" aria-valuenow={count * 25} aria-valuemin={0} aria-valuemax={100}>
          <div className={cn("h-full w-1/4", colors[color].bg)} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function PilotLaunchpad() {
  const [myProcess, setMyProcess] = useState<Processus | null>(null);
  const [loading, setLoading] = useState(true);

  const initLaunchpad = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Processus>("/processus/my-context");
      if (res.data) setMyProcess(res.data?.data || res.data);
    } catch (error) {
      console.error('❌ Erreur chargement contexte pilote:', error);
      toast.error("ÉCHEC DE DÉTECTION DU CONTEXTE PILOTE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') initLaunchpad(); }, [initLaunchpad]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Déploiement du Launchpad Pilote..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-12 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 lg:gap-10 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="text-left space-y-3 md:space-y-4 w-full xl:w-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tighter italic leading-none m-0">Launchpad <span className="text-blue-400">Pilote</span></h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] tracking-widest m-0 flex items-center gap-2 md:gap-3">
            <ShieldCheck size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" aria-hidden="true" /> 
            SYSTÈME DE MANAGEMENT INTÉGRÉ • MATRIX 2026
          </p>
        </div>
        <div className="bg-emerald-500/10 border-2 border-emerald-500/20 px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] flex items-center gap-3 md:gap-4 lg:gap-5 shadow-2xl">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-400 animate-ping" aria-hidden="true" />
          <span className="text-[9px] md:text-[10px] tracking-widest text-emerald-400 leading-none">Connexion Kernel Active</span>
        </div>
      </header>

      {/* 📜 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-14 py-5 md:py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 lg:gap-12 animate-in fade-in zoom-in-95 duration-1000">
          
          <div className="col-span-12 xl:col-span-8 space-y-6 md:space-y-8 lg:space-y-12 text-left">
            {myProcess ? (
              <Link 
                href={`/dashboard/processus/cockpit/${myProcess.PR_Id}`} 
                className="block group no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-2xl md:rounded-3xl lg:rounded-[4.5rem]"
                aria-label={`Accéder au cockpit du processus ${myProcess.PR_Code}`}
              >
                <div className="bg-blue-600 p-1 rounded-2xl md:rounded-3xl lg:rounded-[4.5rem] transition-all hover:-translate-y-2 md:hover:-translate-y-3 shadow-2xl shadow-blue-900/40 active:scale-95">
                  <div className="bg-[#0B0F1A] rounded-xl md:rounded-2xl lg:rounded-[4.4rem] p-6 md:p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 lg:gap-10">
                    <div className="flex items-center gap-4 md:gap-6 lg:gap-12">
                      <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] bg-blue-600 flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-all duration-500">
                        <GitBranch size={40} className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black tracking-tighter m-0 leading-none mb-2 md:mb-3 lg:mb-4 uppercase">Cockpit <span className="text-blue-400">Processus</span></h2>
                        <p className="text-slate-500 text-sm md:text-base lg:text-lg font-black tracking-widest m-0 leading-none">
                          {myProcess.PR_Code} — {myProcess.PR_Libelle}
                        </p>
                      </div>
                    </div>
                    <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full border border-white/10 flex items-center justify-center bg-white/2 group-hover:bg-blue-600 transition-all duration-500" aria-hidden="true">
                      <ArrowRight size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-rose-500/10 border-2 border-rose-500/20 rounded-2xl md:rounded-3xl lg:rounded-[4.5rem] p-6 md:p-8 lg:p-24 text-center shadow-2xl" role="status">
                <FileWarning size={48} className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-rose-400 mb-4 md:mb-6 lg:mb-8 mx-auto" aria-hidden="true" />
                <h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase text-white tracking-tighter m-0 leading-none">Contexte Pilote Introuvable</h2>
                <p className="text-[9px] md:text-[10px] text-slate-500 italic mt-3 md:mt-4 uppercase tracking-widest leading-relaxed">Aucun processus n&apos;est rattaché à votre profil dans le Noyau SMI.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-10" role="list" aria-label="Actions rapides">
              <QuickAction title="Déclarer une NC" sub="Non-conformité §10.2" icon={AlertTriangle} color="rose" href="/dashboard/improvement/nc/new" />
              <QuickAction title="Action Corrective" sub="Amélioration Continue" icon={Zap} color="amber" href="/dashboard/improvement/actions/new" />
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-6 md:space-y-8 lg:space-y-12 text-left">
            <article className="bg-[#0F172A]/40 border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-6 md:p-8 lg:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden" aria-label="Surveillance active">
              <div className="absolute top-0 right-0 p-6 md:p-8 lg:p-10 opacity-5 pointer-events-none -rotate-12">
                <BellRing size={120} className="w-30 h-30 md:w-40 md:h-40 lg:w-50 lg:h-50" aria-hidden="true" />
              </div>
              <h3 className="text-[10px] md:text-[11px] font-black text-slate-500 tracking-widest mb-8 md:mb-10 lg:mb-12 italic border-b border-white/5 pb-4 md:pb-5 lg:pb-6 m-0 leading-none uppercase">Surveillance Active §9.1</h3>
              <div className="space-y-6 md:space-y-8 lg:space-y-12" role="list">
                <AlertStat count={3} label="Actions en retard" color="rose" />
                <AlertStat count={1} label="KPI hors cible" color="amber" />
                <AlertStat count={5} label="Documents à réviser" color="blue" />
              </div>
              <button 
                type="button"
                className="w-full mt-8 md:mt-10 lg:mt-12 py-3 md:py-4 lg:py-6 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl lg:rounded-4xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5 transition-all cursor-pointer shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Revue de Performance Complète
              </button>
            </article>

            <blockquote className="bg-blue-600/10 border-2 border-blue-500/20 rounded-xl md:rounded-2xl lg:rounded-[3rem] p-6 md:p-8 lg:p-10 text-center group shadow-2xl">
              <p className="text-sm md:text-base font-black text-blue-400 uppercase italic leading-relaxed m-0 tracking-widest group-hover:scale-105 transition-all group-hover:text-white">
                &quot;L&apos;Excellence n&apos;est pas une destination, c&apos;est un standard de pilotage Matrix.&quot;
              </p>
            </blockquote>
          </div>

        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}