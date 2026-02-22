/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🚀 MODULE : COCKPIT DE PILOTAGE (COMMAND CENTER)
 * -------------------------------------------------------------------------
 * RÔLE : Centre de monitoring tactique pour un processus SMI.
 * CONFORMITÉ : §9.1.3 (Analyse et évaluation de la performance).
 * ARCHITECTURE : Hub Modulaire Elite RD 2030.
 * RÉFÉRENTIEL : types/elite-sde.ts
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Correction Import
import apiClient from '@/core/api/api-client';
import { 
  GitBranch, FileText, CheckSquare, BarChart3, RefreshCcw, 
  Target, ShieldAlert, Settings2, Activity, Bell, Loader2, ArrowLeft,
  ChevronRight, Fingerprint, ShieldCheck, Zap
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Processus as IProcessus } from '@/types/elite-sde';

type ModuleType = 'ID' | 'GED' | 'ACTIONS' | 'KPI' | 'RISQUES' | 'SSE';

export default function ProcessCockpit() {
  const params = useParams();
  const router = useRouter(); // Correction Hook
  const id = params?.id as string;
  
  const [process, setProcess] = useState<any>(null); // Extended Processus
  const [activeModule, setActiveModule] = useState<ModuleType>('ID');
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * 📡 RÉCUPÉRATION DU FLUX OPÉRATIONNEL (§9.1.3)
   * @description Synchronise le cockpit avec l'état réel du processus dans le SDE.
   */
  const fetchProcessData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/processus/${id}`);
      const data = res.data?.data || res.data;
      setProcess(data);
    } catch (err: unknown) {
      console.error("❌ Rupture Cockpit:", err);
      toast.error("Rupture de liaison Cockpit : Perte de synchronisation Matrix");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { 
    fetchProcessData(); 
  }, [fetchProcessData, id]);

  if (loading) return (
    <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center ml-72 gap-6">
      <div className="relative">
         <Loader2 className="animate-spin text-blue-600" size={64} strokeWidth={1.5} />
         <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600/30" size={24} />
      </div>
      <span className="text-blue-500 font-black uppercase tracking-[0.5em] text-[11px] animate-pulse">
        SDE COCKPIT SYNC IN PROGRESS...
      </span>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden text-left selection:bg-blue-500/30">
      <Toaster position="top-right" richColors />
      
      {/* 🔝 HEADER TACTIQUE DU COCKPIT (§5.1) */}
      <header className="px-16 py-10 border-b border-white/5 bg-[#0F172A]/95 backdrop-blur-3xl flex justify-between items-center shrink-0 shadow-2xl relative z-20">
        <div className="flex items-center gap-12">
          <div className="w-24 h-24 rounded-[2.5rem] bg-blue-600 flex items-center justify-center shadow-[0_20px_60px_rgba(37,99,235,0.4)] transition-all hover:scale-105 border border-white/10 group cursor-help">
            <GitBranch size={48} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
          </div>
          <div className="text-left space-y-4">
            <div className="flex items-center gap-6">
              <span className="text-[11px] font-black px-5 py-2 bg-blue-600/10 text-blue-500 border border-blue-600/20 rounded-xl uppercase tracking-widest italic leading-none">
                {process?.PR_Code}
              </span>
              <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none text-white">{process?.PR_Libelle}</h1>
            </div>
            <p className="text-slate-500 font-black text-[11px] uppercase tracking-[0.6em] italic flex items-center gap-3">
              <ShieldCheck size={14} className="text-emerald-500" />
              PILOTAGE : <span className="text-slate-100">{process?.PR_Pilote?.U_FirstName} {process?.PR_Pilote?.U_LastName}</span> 
              <span className="mx-4 text-slate-800">•</span>
              VERSION OFFICIELLE <span className="text-blue-500">V{process?.PR_Version || '1'}.0</span>
            </p>
          </div>
        </div>
        <div className="flex gap-6">
            <button className="bg-slate-900/50 hover:bg-white hover:text-slate-900 px-8 py-5 rounded-2xl font-black uppercase text-[10px] italic shadow-xl transition-all border border-white/5 flex items-center gap-3">
              NOTIFICATIONS <Bell size={18} />
            </button>
            <button className="bg-blue-600 hover:bg-white hover:text-slate-900 px-12 py-5 rounded-2xl font-black uppercase text-[10px] italic shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all border-none flex items-center gap-3">
              PILOTAGE DIRECT <Zap size={18} />
            </button>
        </div>
      </header>

      {/* 

[Image of Turtle Diagram ISO 9001]
 
          Cette infographie définit les entrées, sorties, ressources et contrôles du processus.
      */}

      <div className="flex-1 flex overflow-hidden">
        
        {/* 🧭 NAVIGATION HUB (CENTRAL CONSOLE) */}
        <nav className="w-85 bg-[#0B1222] border-r border-white/5 flex flex-col p-10 gap-4 overflow-y-auto shrink-0 custom-scrollbar shadow-inner">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-10 px-6 italic leading-none text-left border-l-2 border-blue-600/30 pl-4">
            Command Infrastructure
          </p>
          
          <NavBtn active={activeModule === 'ID'} icon={GitBranch} label="Identité Matrix §4.4" onClick={() => setActiveModule('ID')} />
          <NavBtn active={activeModule === 'GED'} icon={FileText} label="Maîtrise Doc §7.5" onClick={() => setActiveModule('GED')} />
          <NavBtn active={activeModule === 'ACTIONS'} icon={CheckSquare} label="Actions PAQ" onClick={() => setActiveModule('ACTIONS')} />
          <NavBtn active={activeModule === 'KPI'} icon={BarChart3} label="Performance KPI" onClick={() => setActiveModule('KPI')} />
          <NavBtn active={activeModule === 'RISQUES'} icon={ShieldAlert} label="Risques §6.1" onClick={() => setActiveModule('RISQUES')} />
          <NavBtn active={activeModule === 'SSE'} icon={Activity} label="Monitoring SSE" onClick={() => setActiveModule('SSE')} />
          
          <div className="mt-auto pt-10 border-t border-white/5">
              <button onClick={() => router.push('/dashboard/processus')} className="w-full flex items-center justify-center gap-4 px-8 py-5 rounded-2xl text-slate-500 hover:text-white transition-all bg-white/5 border border-white/5 cursor-pointer italic font-black text-[11px] uppercase tracking-widest shadow-xl">
                <ArrowLeft size={18} /> Retour Cartographie
              </button>
          </div>
        </nav>

        {/* 📟 MAIN CONSOLE (CORE AREA) */}
        <main className="flex-1 bg-[#0B0F1A] overflow-hidden flex flex-col relative">
          {/* Filigrane Matrix en arrière-plan */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
             <Target size={600} />
          </div>

          <div className="flex-1 overflow-y-auto p-20 custom-scrollbar text-left relative z-10">
              
              {/* MODULE : IDENTITÉ DU PROCESSUS (§4.4.1) */}
              {activeModule === 'ID' && (
                <div className="grid grid-cols-12 gap-16 animate-in fade-in slide-in-from-bottom-12 duration-700">
                    <div className="col-span-8 space-y-16">
                        {/* FINALITÉS (§4.4.1 a) */}
                        <section className="bg-slate-900/40 border border-white/5 p-20 rounded-[5rem] relative overflow-hidden group shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop-blur-sm">
                            <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:scale-110 transition-transform"><Target size={250} /></div>
                            <div className="flex items-center gap-8 mb-12">
                               <div className="p-4 bg-blue-600/20 text-blue-500 rounded-3xl border border-blue-500/20"><Target size={40} strokeWidth={2.5} /></div>
                               <h2 className="text-3xl font-black uppercase italic text-blue-500 tracking-tighter leading-none">
                                  Finalités & Objectifs Stratégiques
                               </h2>
                            </div>
                            <p className="text-[18px] leading-relaxed text-slate-200 font-bold uppercase italic opacity-90 max-w-4xl">
                                {process?.PR_Objectifs || "Aucune finalité formalisée pour ce segment du SMI Matrix."}
                            </p>
                        </section>
                        
                        {/* GRILLE DE RESSOURCES ET SURVEILLANCE */}
                        <div className="grid grid-cols-2 gap-12">
                            <IdentityCard title="Ressources Nécessaires" icon={Settings2} content={process?.PR_Ressources} />
                            <IdentityCard title="Dispositif Surveillance" icon={Activity} content={process?.PR_Surveillance} />
                        </div>
                    </div>

                    {/* DASHBOARD DE SANTÉ SDE */}
                    <div className="col-span-4">
                        <div className="bg-[#0F172A] border-2 border-blue-600/10 p-16 rounded-[6rem] shadow-4xl text-left sticky top-10">
                            <div className="flex items-center justify-center gap-4 mb-16">
                               <Activity className="text-blue-500" size={24} />
                               <h3 className="text-[13px] font-black uppercase text-blue-500 tracking-[0.5em] italic leading-none">Indice de Santé</h3>
                            </div>
                            
                            <div className="space-y-12">
                                <ProgressItem label="Conformité Documentaire" val={78} />
                                <ProgressItem label="Traitement Actions (PAQ)" val={45} color="bg-amber-500" />
                                <ProgressItem label="Score de Risque" val={12} color="bg-rose-500" />
                                <ProgressItem label="Efficacité KPI" val={92} color="bg-emerald-500" />
                            </div>
                            
                            <div className="mt-20 pt-12 border-t border-white/5 text-center">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic opacity-50 flex items-center justify-center gap-3">
                                  <ShieldCheck size={12} /> Analyse SDE v2.4 Secured
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
              )}

              {/* AUTRES MODULES EN STANDBY */}
              {activeModule !== 'ID' && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                    <RefreshCcw size={100} className="animate-spin text-blue-600 mb-12" />
                    <p className="text-3xl font-black uppercase tracking-[0.4em] italic text-blue-500">
                       Sync Module : {activeModule}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 italic">Initialisation du flux de données sectoriel...</p>
                </div>
              )}
          </div>
        </main>
      </div>
      
      {/* 🧩 STYLES COCKPIT CUSTOM */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; border: 3px solid #0b0f1a; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </div>
  );
}

/** 🛠️ COMPOSANTS ATOMIQUES DU COCKPIT */

function NavBtn({ active, icon: Icon, label, onClick }: any) { 
  return ( 
    <button 
      onClick={onClick} 
      className={`flex items-center gap-8 px-10 py-6 rounded-3xl transition-all group relative border-none cursor-pointer text-left w-full ${active ? "bg-blue-600 text-white shadow-[0_20px_50px_rgba(37,99,235,0.4)] translate-x-4 italic" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
    >
      <Icon size={24} className={`transition-all duration-500 ${active ? 'scale-110 drop-shadow-[0_0_10px_white]' : 'group-hover:rotate-12'}`} />
      <span className="text-[14px] font-black uppercase italic tracking-tight">{label}</span>
      {active && <div className="absolute right-6 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white]" />}
    </button>
  ); 
}

function IdentityCard({ title, icon: Icon, content }: any) { 
  return ( 
    <div className="bg-slate-900/40 border border-white/5 p-16 rounded-[5rem] group hover:border-blue-600/30 transition-all shadow-2xl text-left backdrop-blur-sm">
      <div className="flex items-center gap-8 mb-12 text-left">
        <div className="p-6 bg-white/5 rounded-3xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">
          <Icon size={36} strokeWidth={2} />
        </div>
        <h4 className="text-[15px] font-black uppercase italic text-slate-500 tracking-[0.3em] leading-none text-left">{title}</h4>
      </div>
      <p className="text-[16px] font-bold text-slate-200 uppercase italic leading-relaxed opacity-90 text-left">
        {content || "Donnée SMI non formalisée pour ce segment structurel."}
      </p>
    </div>
  ); 
}

function ProgressItem({ label, val, color = "bg-blue-600" }: any) { 
  return ( 
    <div className="text-left group">
      <div className="flex justify-between text-[11px] font-black uppercase italic mb-6 tracking-widest leading-none">
        <span className="text-slate-500 group-hover:text-white transition-colors">{label}</span>
        <span className="text-white bg-white/5 px-3 py-1 rounded-lg">{val}%</span>
      </div>
      <div className="h-4 bg-black border border-white/10 rounded-full overflow-hidden p-1 shadow-inner">
        <div className={`h-full transition-all duration-[2s] ease-out rounded-full ${color} shadow-[0_0_20px_rgba(37,99,235,0.2)]`} style={{ width: `${val}%` }} />
      </div>
    </div>
  ); 
}