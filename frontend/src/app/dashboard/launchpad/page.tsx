/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : LAUNCHPAD PILOTE (SDE CORE)
 * -------------------------------------------------------------------------
 * RÔLE : Point d'entrée opérationnel rattaché au processus du pilote.
 * LOGIC : Auto-détection du contexte par le Kernel Matrix.
 * DESIGN : Cockpit 100dvh, Design Immersif, PWA Ready.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 11:48 GMT
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import apiClient from "@/core/api/api-client";
import { 
  AlertTriangle, ArrowRight, GitBranch, 
  ShieldCheck, Zap, RefreshCcw, FileWarning, 
  BellRing
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "sonner";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export default function PilotLaunchpad() {
  const [myProcess, setMyProcess] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const initLaunchpad = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/processus/my-context");
      if (res.data) setMyProcess(res.data?.data || res.data);
    } catch {
      toast.error("ÉCHEC DE DÉTECTION DU CONTEXTE PILOTE");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { initLaunchpad(); }, [initLaunchpad]);

  if (loading) return <LoadingScreen label="Déploiement du Launchpad Pilote..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="shrink-0 p-8 lg:p-12 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-10 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-xl z-40">
        <div className="text-left space-y-4">
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter italic leading-none m-0">Launchpad <span className="text-blue-600">Pilote</span></h1>
          <p className="text-slate-500 text-[10px] tracking-[0.5em] m-0 flex items-center gap-3">
            <ShieldCheck size={14} className="text-blue-500" /> SYSTÈME DE MANAGEMENT INTÉGRÉ • MATRIX 2026
          </p>
        </div>
        <div className="bg-emerald-500/10 border-2 border-emerald-500/20 px-10 py-5 rounded-[2.5rem] flex items-center gap-5 shadow-3xl">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] tracking-[0.2em] text-emerald-500 leading-none">Connexion Kernel Active</span>
        </div>
      </header>

      {/* 📜 WORKZONE (Occupation Intégrale) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-14">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-12 animate-in fade-in zoom-in-95 duration-1000">
          
          <div className="col-span-12 xl:col-span-8 space-y-12 text-left">
            {myProcess ? (
              <Link href={`/dashboard/processus/cockpit/${myProcess.PR_Id}`} className="block group no-underline">
                <div className="bg-blue-600 p-1 rounded-[4.5rem] transition-all hover:-translate-y-3 shadow-4xl shadow-blue-900/40 active:scale-95">
                  <div className="bg-[#0B0F1A] rounded-[4.4rem] p-12 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-12">
                      <div className="w-28 h-28 rounded-[2.5rem] bg-blue-600 flex items-center justify-center shadow-3xl group-hover:rotate-6 transition-all duration-500">
                        <GitBranch size={56} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter m-0 leading-none mb-4 uppercase">Cockpit <span className="text-blue-500">Processus</span></h2>
                        <p className="text-slate-500 text-lg font-black tracking-widest m-0 leading-none">
                          {myProcess.PR_Code} — {myProcess.PR_Libelle}
                        </p>
                      </div>
                    </div>
                    <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center bg-white/2 group-hover:bg-blue-600 transition-all duration-500">
                      <ArrowRight size={32} />
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-rose-500/10 border-2 border-rose-500/20 rounded-[4.5rem] p-24 text-center shadow-4xl">
                <FileWarning size={80} className="text-rose-500 mb-8 mx-auto" />
                <h2 className="text-3xl font-black uppercase text-white tracking-tighter m-0 leading-none">Contexte Pilote Introuvable</h2>
                <p className="text-xs text-slate-500 italic mt-4 uppercase tracking-widest leading-relaxed">Aucun processus n&apos;est rattaché à votre profil dans le Noyau SMI.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <QuickAction title="Déclarer une NC" sub="Non-conformité §10.2" icon={AlertTriangle} color="rose" href="/dashboard/improvement/nc/new" />
              <QuickAction title="Action Corrective" sub="Amélioration Continue" icon={Zap} color="amber" href="/dashboard/improvement/actions/new" />
            </div>
          </div>

          <div className="col-span-12 xl:col-span-4 space-y-12 text-left">
            <div className="bg-slate-900/40 border-2 border-white/5 rounded-[4rem] p-12 backdrop-blur-md shadow-4xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none -rotate-12"><BellRing size={200} /></div>
              <h3 className="text-[11px] font-black text-slate-500 tracking-[0.5em] mb-12 italic border-b border-white/5 pb-6 m-0 leading-none uppercase">Surveillance Active §9.1</h3>
              <div className="space-y-12">
                <AlertStat count={3} label="Actions en retard" color="rose" />
                <AlertStat count={1} label="KPI hors cible" color="amber" />
                <AlertStat count={5} label="Documents à réviser" color="blue" />
              </div>
              <button className="w-full mt-12 py-6 bg-white/5 hover:bg-white/10 rounded-4xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5 transition-all cursor-pointer shadow-xl">Revue de Performance Complète</button>
            </div>

            <div className="bg-blue-600/10 border-2 border-blue-500/20 rounded-[3rem] p-10 text-center group shadow-4xl">
              <p className="text-sm font-black text-blue-500 uppercase italic leading-relaxed m-0 tracking-widest group-hover:scale-105 transition-all group-hover:text-white">&quot;L&apos;Excellence n&apos;est pas une destination, c&apos;est un standard de pilotage Matrix.&quot;</p>
            </div>
          </div>

        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

function QuickAction({ title, sub, icon: Icon, color, href }: any) {
  const themes: any = { rose: "text-rose-500 border-rose-500/20", amber: "text-amber-500 border-amber-500/20", blue: "text-blue-500 border-blue-500/20" };
  return (
    <Link href={href} className="group block bg-[#151B2B] border-2 border-white/5 p-12 rounded-[4rem] hover:border-blue-600/30 transition-all shadow-3xl no-underline relative overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div className={cn("p-5 rounded-3xl bg-white/5 transition-transform group-hover:scale-110", themes[color])}><Icon size={32} /></div>
        <ArrowRight size={20} className="text-slate-800 group-hover:text-white" />
      </div>
      <h4 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors m-0 leading-none mb-3 italic uppercase tracking-tighter">{title}</h4>
      <p className="text-[10px] font-black text-slate-600 tracking-widest m-0 italic uppercase">{sub}</p>
    </Link>
  );
}

function AlertStat({ count, label, color }: any) {
  const colors: any = { rose: "text-rose-500 bg-rose-500", amber: "text-amber-500 bg-amber-500", blue: "text-blue-500 bg-blue-500" };
  return (
    <div className="flex items-center gap-8 group cursor-pointer">
      <div className={cn("text-6xl font-black italic leading-none m-0 group-hover:scale-110 transition-transform tracking-tighter", colors[color].split(' ')[0])}>{count}</div>
      <div className="space-y-2 flex-1">
        <span className="text-[11px] font-black text-slate-400 group-hover:text-white transition-colors tracking-widest block leading-none uppercase italic">{label}</span>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
          <div className={cn("h-full w-1/4", colors[color].split(' ')[1])} />
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500">
      <RefreshCcw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] animate-pulse italic text-center px-10 leading-relaxed">{label}</span>
    </div>
  );
}