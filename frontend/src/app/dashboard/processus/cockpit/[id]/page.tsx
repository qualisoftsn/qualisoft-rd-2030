/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  GitBranch, FileText, CheckSquare, BarChart3, RefreshCcw, 
  Target, ShieldAlert, Settings2, Activity, Bell, Loader2, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import router from 'next/router';

/**
 * 🚀 MODULE : COCKPIT DE PILOTAGE (COMMAND CENTER)
 * -------------------------------------------------------------------------
 * RÔLE : Interface de monitoring et de gestion d'un processus unique.
 * CONFORMITÉ : §9.1.3 (Analyse et évaluation de la performance).
 * MODULES : ID, GED, PAQ, KPI, RISQUES, SSE.
 */

type ModuleType = 'ID' | 'GED' | 'ACTIONS' | 'KPI' | 'RISQUES' | 'SSE';

export default function ProcessCockpit() {
  const params = useParams();
  const id = params?.id as string;
  
  const [process, setProcess] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>('ID');
  const [loading, setLoading] = useState(true);

  /**
   * 📡 RÉCUPÉRATION DU FLUX OPÉRATIONNEL
   * Charge les données de profondeur du processus (Finalités, Versioning, Pilote).
   */
  const fetchProcessData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/processus/${id}`);
      setProcess(res.data);
    } catch (err) {
      toast.error("Rupture de liaison Cockpit : Perte de synchronisation");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProcessData(); }, [fetchProcessData, id]);

  if (loading) return (
    <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center ml-72">
      <Loader2 className="animate-spin text-blue-500 mb-6" size={48} />
      <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">SYNC COCKPIT...</span>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden text-left selection:bg-blue-500/30">
      
      {/* 🔝 HEADER TACTIQUE DU COCKPIT */}
      <header className="px-12 py-8 border-b border-white/5 bg-[#0F172A]/90 backdrop-blur-3xl flex justify-between items-center shrink-0 shadow-2xl relative z-20">
        <div className="flex items-center gap-10">
          <div className="w-20 h-20 rounded-4xl bg-blue-600 flex items-center justify-center shadow-[0_15px_40px_rgba(37,99,235,0.4)] transition-transform hover:scale-105">
            <GitBranch size={40} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-5">
              <span className="text-[10px] font-black px-4 py-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl uppercase tracking-widest italic">
                {process?.PR_Code}
              </span>
              <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">{process?.PR_Libelle}</h1>
            </div>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] mt-4 italic">
              PILOTAGE : <span className="text-slate-200">{process?.PR_Pilote?.U_FirstName} {process?.PR_Pilote?.U_LastName}</span> • VERSION OFFICIELLE V{process?.PR_Version || '1'}.0
            </p>
          </div>
        </div>
        <div className="flex gap-4">
            <button className="bg-slate-900 hover:bg-white hover:text-slate-900 px-8 py-5 rounded-2xl font-black uppercase text-[10px] italic shadow-xl transition-all border border-white/5">NOTIFICATIONS <Bell size={16} className="inline ml-2" /></button>
            <button className="bg-blue-600 hover:bg-white hover:text-slate-900 px-10 py-5 rounded-2xl font-black uppercase text-[10px] italic shadow-[0_15px_40px_rgba(37,99,235,0.2)] transition-all border-none">PILOTAGE DIRECT</button>
        </div>
      </header>

      {/* 

[Image of Turtle Diagram ISO 9001]
 */}

      <div className="flex-1 flex overflow-hidden">
        
        {/* 🧭 NAVIGATION HUB (PANEL GAUCHE) */}
        <nav className="w-80 bg-[#0B1222] border-r border-white/5 flex flex-col p-8 gap-3 overflow-y-auto shrink-0 custom-scrollbar">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-8 px-4 italic leading-none text-left">Infrastructure Opérationnelle</p>
          <NavBtn active={activeModule === 'ID'} icon={GitBranch} label="Identité §4.4" onClick={() => setActiveModule('ID')} />
          <NavBtn active={activeModule === 'GED'} icon={FileText} label="Documentation §7.5" onClick={() => setActiveModule('GED')} />
          <NavBtn active={activeModule === 'ACTIONS'} icon={CheckSquare} label="Actions (PAQ)" onClick={() => setActiveModule('ACTIONS')} />
          <NavBtn active={activeModule === 'KPI'} icon={BarChart3} label="Indicateurs KPI" onClick={() => setActiveModule('KPI')} />
          <NavBtn active={activeModule === 'RISQUES'} icon={ShieldAlert} label="Risques & Opportunités" onClick={() => setActiveModule('RISQUES')} />
          <NavBtn active={activeModule === 'SSE'} icon={Activity} label="Sécurité & Environnement" onClick={() => setActiveModule('SSE')} />
          
          <div className="mt-auto pt-8 border-t border-white/5">
             <button onClick={() => router.back()} className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer italic font-black text-[10px] uppercase">
                <ArrowLeft size={16} /> Retour Cartographie
             </button>
          </div>
        </nav>

        {/* 📟 MAIN CONSOLE (ZONE DE CONTENU) */}
        <main className="flex-1 bg-[#0B0F1A] overflow-hidden flex flex-col relative">
          <div className="flex-1 overflow-y-auto p-16 custom-scrollbar text-left">
              
              {/* MODULE : IDENTITÉ DU PROCESSUS */}
              {activeModule === 'ID' && (
                <div className="grid grid-cols-12 gap-16 animate-in fade-in slide-in-from-bottom-12 duration-700 text-left">
                    <div className="col-span-8 space-y-16 text-left">
                        {/* FINALITÉS (§4.4.1 a) */}
                        <section className="bg-slate-900/40 border border-white/5 p-16 rounded-[4.5rem] relative overflow-hidden group shadow-[0_30px_100px_rgba(0,0,0,0.5)] text-left">
                            <div className="absolute top-0 right-0 p-12 opacity-5"><Target size={200} /></div>
                            <h2 className="text-2xl font-black uppercase italic mb-10 flex items-center gap-5 text-blue-500 tracking-tight leading-none text-left">
                                <Target size={32} /> Finalités & Objectifs Stratégiques
                            </h2>
                            <p className="text-base leading-relaxed text-slate-300 font-bold uppercase italic opacity-95 text-left">
                                {process?.PR_Objectifs || "Aucun objectif formalisé pour ce segment du SMI."}
                            </p>
                        </section>
                        
                        <div className="grid grid-cols-2 gap-12 text-left">
                            <IdentityCard title="Ressources Nécessaires" icon={Settings2} content={process?.PR_Ressources} />
                            <IdentityCard title="Dispositif Surveillance" icon={Activity} content={process?.PR_Surveillance} />
                        </div>
                    </div>

                    {/* DASHBOARD DE SANTÉ À DROITE */}
                    <div className="col-span-4 text-left">
                        <div className="bg-blue-600/5 border border-blue-500/10 p-12 rounded-[5rem] shadow-2xl text-left sticky top-0">
                            <h3 className="text-[11px] font-black uppercase text-blue-500 mb-12 tracking-[0.4em] italic text-center leading-none">Indice de Santé</h3>
                            <div className="space-y-10 text-left">
                                <ProgressItem label="Conformité Documentaire" val={78} />
                                <ProgressItem label="Traitement Actions (PAQ)" val={45} color="bg-amber-500" />
                                <ProgressItem label="Score de Risque" val={12} color="bg-rose-500" />
                                <ProgressItem label="Efficacité KPI" val={92} color="bg-emerald-500" />
                            </div>
                            
                            <div className="mt-16 pt-10 border-t border-blue-500/10 text-center">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Analyse en temps réel v2.4</p>
                            </div>
                        </div>
                    </div>
                </div>
              )}

              {/* AUTRES MODULES : EN ATTENTE DE DÉPLOIEMENT DÉTAILLÉ */}
              {activeModule !== 'ID' && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                    <RefreshCcw size={80} className="animate-spin mb-8" />
                    <p className="text-2xl font-black uppercase tracking-widest italic">Synchronisation du module {activeModule}...</p>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}

/** 🛠️ COMPOSANTS ATOMIQUES DU COCKPIT */

function NavBtn({ active, icon: Icon, label, onClick }: any) { 
  return ( 
    <button 
      onClick={onClick} 
      className={`flex items-center gap-6 px-8 py-5 rounded-2xl transition-all group relative border-none cursor-pointer text-left w-full ${active ? "bg-blue-600 text-white shadow-[0_15px_40px_rgba(37,99,235,0.4)] translate-x-3 italic" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
    >
      <Icon size={20} className={`transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:rotate-12'}`} />
      <span className="text-[12px] font-black uppercase italic tracking-tight">{label}</span>
      {active && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />}
    </button>
  ); 
}

function IdentityCard({ title, icon: Icon, content }: any) { 
  return ( 
    <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[4rem] group hover:border-blue-600/30 transition-all shadow-xl text-left">
      <div className="flex items-center gap-6 mb-10 text-left">
        <div className="p-5 bg-white/5 rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
          <Icon size={28} />
        </div>
        <h4 className="text-[13px] font-black uppercase italic text-slate-500 tracking-[0.2em] leading-none text-left">{title}</h4>
      </div>
      <p className="text-sm font-bold text-white uppercase italic leading-relaxed opacity-80 text-left">
        {content || "Donnée SMI non formalisée."}
      </p>
    </div>
  ); 
}

function ProgressItem({ label, val, color = "bg-blue-500" }: any) { 
  return ( 
    <div className="text-left">
      <div className="flex justify-between text-[10px] font-black uppercase italic mb-4 tracking-widest leading-none">
        <span className="text-slate-400">{label}</span>
        <span className="text-white">{val}%</span>
      </div>
      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
        <div className={`h-full transition-all duration-[1.5s] ease-out rounded-full ${color}`} style={{ width: `${val}%` }} />
      </div>
    </div>
  ); 
}