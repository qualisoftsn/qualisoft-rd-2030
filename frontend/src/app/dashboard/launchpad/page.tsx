/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : LAUNCHPAD PILOTE (SDE)
 * Rôle : Entry point opérationnel rattaché au processus.
 * Logic : Auto-détection du contexte Pilote.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:51 GMT
 */

"use client";

import apiClient from "@/core/api/api-client";
import { Activity, AlertTriangle, ArrowRight, Bell, FileWarning, GitBranch, Rocket, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

export default function PilotLaunchpad() {
  const [myProcess, setMyProcess] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const initLaunchpad = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/processus/my-context");
      if (res.data) setMyProcess(res.data);
    } catch {
      toast.error("ÉCHEC DE DÉTECTION DU CONTEXTE PILOTE");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { initLaunchpad(); }, [initLaunchpad]);

  if (loading) return (
    <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center ml-0 lg:ml-72 text-blue-500 font-black italic uppercase tracking-[0.5em] animate-pulse">
      <Activity className="animate-spin mb-4" size={40} /> Déploiement du Launchpad...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-0 lg:ml-72 p-10 lg:p-14 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="mb-20 animate-in fade-in slide-in-from-top-6 duration-700 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mt-12 lg:mt-0">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none m-0">Launchpad <span className="text-blue-600">Pilote</span></h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.5em] mt-6 italic flex items-center gap-3 m-0">
            <ShieldCheck size={14} className="text-blue-500" /> SYSTÈME DE MANAGEMENT INTÉGRÉ • ELITE 2026
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-3xl flex items-center gap-4 shadow-xl">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 italic">Connexion Matrix Active</span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="col-span-12 xl:col-span-8 space-y-12 text-left">
          {myProcess ? (
            <Link href={`/dashboard/processus/cockpit/${myProcess.PR_Id}`} className="block group">
              <div className="bg-blue-600 p-1 rounded-[4rem] transition-all hover:-translate-y-2 shadow-4xl shadow-blue-900/40 active:scale-[0.98]">
                <div className="bg-[#0B0F1A] rounded-[3.8rem] p-12 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="flex items-center gap-10">
                    <div className="w-24 h-24 rounded-4xl bg-blue-600 flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-all duration-500"><GitBranch size={48} className="text-white" /></div>
                    <div>
                      <h2 className="text-4xl font-black uppercase italic tracking-tighter m-0 leading-none mb-3">Accéder au <span className="text-blue-500">Cockpit</span></h2>
                      <p className="text-slate-500 text-sm font-bold uppercase italic tracking-widest m-0 leading-none">
                        {myProcess.PR_Code} — {myProcess.PR_Libelle}
                      </p>
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center bg-white/2 group-hover:bg-blue-600 transition-all duration-500"><ArrowRight size={32} /></div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 rounded-[4rem] p-20 text-center">
              <FileWarning size={64} className="text-red-500 mb-6 mx-auto" />
              <p className="text-xl font-black uppercase italic text-white tracking-tighter">Contexte Pilote Introuvable</p>
              <p className="text-xs text-slate-500 italic mt-2 uppercase">Aucun processus rattaché à ce matricule dans le Kernel.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <QuickAction title="Déclarer une NC" sub="Non-conformité §10.2" icon={AlertTriangle} color="text-red-500" href="/dashboard/improvement/nc/new" />
            <QuickAction title="Action Corrective" sub="Amélioration Continue" icon={Zap} color="text-amber-500" href="/dashboard/improvement/actions/new" />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-12 text-left">
          <div className="bg-slate-900/40 border border-white/5 rounded-[4rem] p-12 backdrop-blur-md shadow-3xl">
            <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.5em] mb-12 italic border-b border-white/5 pb-6 m-0 leading-none">Surveillance §9.1</h3>
            <div className="space-y-10">
              <AlertStat count={3} label="Actions en retard" color="text-red-500" />
              <AlertStat count={1} label="KPI hors cible" color="text-amber-500" />
              <AlertStat count={5} label="Documents à réviser" color="text-blue-500" />
            </div>
            <button className="w-full mt-12 py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase italic tracking-widest text-slate-400 border border-white/5 transition-all cursor-pointer">Revue de Performance Complète</button>
          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 rounded-[3rem] p-10 text-center group">
            <p className="text-xs font-black text-blue-500 uppercase italic leading-relaxed m-0 tracking-widest group-hover:scale-105 transition-all">&quot;L&apos;Excellence n&apos;est pas une destination, c&apos;est un standard de pilotage.&quot;</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ title, sub, icon: Icon, color, href }: any) {
  return (
    <Link href={href} className="group block bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] hover:bg-slate-900 transition-all shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-all`}><Icon size={28} /></div>
        <ArrowRight size={18} className="text-slate-800 group-hover:text-white" />
      </div>
      <h4 className="text-xl font-black uppercase italic text-white group-hover:text-blue-500 transition-colors m-0 leading-none mb-2">{title}</h4>
      <p className="text-[9px] font-black uppercase italic text-slate-600 tracking-widest m-0">{sub}</p>
    </Link>
  );
}

function AlertStat({ count, label, color }: any) {
  return (
    <div className="flex items-center gap-6 group cursor-pointer">
      <div className={`text-5xl font-black italic leading-none m-0 ${color} group-hover:scale-110 transition-transform`}>{count}</div>
      <div className="space-y-1 flex-1">
        <span className="text-[10px] font-black uppercase italic text-slate-400 group-hover:text-white transition-colors tracking-widest block leading-none">{label}</span>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2"><div className={`h-full ${color.replace('text', 'bg')} w-1/4`} /></div>
      </div>
    </div>
  );
}