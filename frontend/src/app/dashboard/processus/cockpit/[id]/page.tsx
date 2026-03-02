/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🎛️ MODULE : COCKPIT PROCESSUS 
 * -------------------------------------------------------------------------
 * RÔLE : Console de pilotage centralisée pour un processus spécifique.
 * ARCHITECTURE : Zéro NextAuth, Interface Responsive (Mobile/Desktop).
 * DATE : 02 Mars 2026 | 13:17 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  GitBranch, FileText, CheckSquare, BarChart3, RefreshCcw, 
  Target, ShieldAlert, Settings2, Activity, Bell, Loader2, 
  ArrowLeft, ShieldCheck, Zap
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

type ModuleType = 'ID' | 'GED' | 'ACTIONS' | 'KPI' | 'RISQUES' | 'SSE';

export default function ProcessCockpit({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [process, setProcess] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>('ID');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProcessData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/processus/${id}`);
      setProcess(res.data?.data || res.data);
    } catch (err) { 
      toast.error("Perte de liaison avec la base de données Matrix."); 
    } finally { 
      setLoading(false); 
    }
  }, [id]);

  useEffect(() => { fetchProcessData(); }, [fetchProcessData]);

  if (loading || !process) return (
    <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center ml-0 lg:ml-72 gap-6">
      <Loader2 className="animate-spin text-blue-600 w-16 h-16" strokeWidth={2} />
      <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[12px] italic animate-pulse">
        SDE COCKPIT SYNC...
      </span>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-0 lg:ml-72 flex flex-col overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER COCKPIT (Responsive) */}
      <header className="px-6 lg:px-10 py-6 border-b-2 border-white/5 bg-[#0F172A]/90 backdrop-blur-3xl flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 shadow-xl gap-6 z-20">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg border border-white/10 group shrink-0">
            <GitBranch size={28} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform lg:w-8 lg:h-8" />
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
              <span className="text-[9px] font-black px-3 py-1.5 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-xl uppercase italic tracking-widest leading-none w-max">
                {process?.PR_Code || 'SDE-REF'}
              </span>
              <h1 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter italic leading-none m-0 text-white">
                {process?.PR_Libelle || 'PROCESSUS INCONNU'}
              </h1>
            </div>
            <p className="text-slate-400 font-black text-[9px] lg:text-[10px] uppercase tracking-[0.3em] lg:tracking-[0.4em] m-0 mt-3 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" /> PILOTE : <span className="text-slate-100">{process?.PR_Pilote?.U_FirstName || 'NON'} {process?.PR_Pilote?.U_LastName || 'DÉFINI'}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none bg-slate-900 border-2 border-white/5 hover:border-white/20 hover:bg-white hover:text-slate-900 px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center justify-center gap-3 cursor-pointer italic tracking-widest text-slate-300 shadow-sm">
              NOTIF <Bell size={16} />
            </button>
            <button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all border-none flex items-center justify-center gap-3 cursor-pointer italic tracking-widest text-white">
              ACTION <Zap size={16} />
            </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        
        {/* 🧭 NAV CONSOLE (Scroll horizontal sur mobile, vertical sur desktop) */}
        <nav className="w-full lg:w-72 bg-[#0B1222] border-b lg:border-b-0 lg:border-r-2 border-white/5 flex flex-row lg:flex-col p-4 lg:p-6 gap-3 lg:gap-4 shrink-0 overflow-x-auto lg:overflow-y-auto custom-scrollbar items-center lg:items-stretch">
          <p className="hidden lg:block text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 px-4 border-l-2 border-blue-600/30 italic">Infrastructure</p>
          
          <NavBtn active={activeModule === 'ID'} icon={GitBranch} label="Identité Matrix" onClick={() => setActiveModule('ID')} />
          <NavBtn active={activeModule === 'GED'} icon={FileText} label="Maîtrise Doc" onClick={() => setActiveModule('GED')} />
          <NavBtn active={activeModule === 'ACTIONS'} icon={CheckSquare} label="Actions PAQ" onClick={() => setActiveModule('ACTIONS')} />
          <NavBtn active={activeModule === 'KPI'} icon={BarChart3} label="Performance" onClick={() => setActiveModule('KPI')} />
          <NavBtn active={activeModule === 'RISQUES'} icon={ShieldAlert} label="Risques §6.1" onClick={() => setActiveModule('RISQUES')} />
          <NavBtn active={activeModule === 'SSE'} icon={Activity} label="Monitoring" onClick={() => setActiveModule('SSE')} />
          
          <div className="hidden lg:block flex-1 min-h-10" /> {/* Spacer */}
          
          <button 
            onClick={() => router.push('/dashboard/processus')} 
            className="hidden lg:flex shrink-0 items-center justify-center gap-3 py-4 rounded-2xl text-slate-500 hover:text-white transition-all bg-slate-900 border border-white/5 hover:border-white/20 cursor-pointer italic font-black text-[10px] uppercase tracking-[0.3em] shadow-sm"
          >
            <ArrowLeft size={16} /> Retour Carto
          </button>
        </nav>

        {/* 📟 MAIN CONSOLE VIEWPORT */}
        <main className="flex-1 bg-[#0B0F1A] overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none mix-blend-screen">
            <Target size={600} className="text-white" />
          </div>

          <div className="h-full overflow-y-auto p-6 lg:p-12 custom-scrollbar relative z-10">
            {activeModule === 'ID' ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 animate-in fade-in duration-700">
                <div className="xl:col-span-8 space-y-8 lg:space-y-10">
                  <section className="bg-slate-900/40 border-2 border-white/5 p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[4rem] relative overflow-hidden group shadow-2xl backdrop-blur-md">
                    <div className="absolute -right-16 -top-16 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
                      <Target size={300} />
                    </div>
                    <div className="flex items-center gap-5 lg:gap-6 mb-8 lg:mb-10 relative z-10">
                      <div className="p-3 lg:p-4 bg-blue-600/10 text-blue-500 rounded-2xl border border-blue-500/20 shadow-inner">
                        <Target size={28} />
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-black uppercase italic text-blue-500 tracking-tighter m-0 leading-none">Finalités Stratégiques</h2>
                    </div>
                    <p className="text-[13px] lg:text-[16px] leading-relaxed text-slate-300 font-bold uppercase italic opacity-90 m-0 relative z-10 whitespace-pre-wrap">
                      {process?.PR_Objectifs || "Aucune finalité formalisée pour ce segment Matrix. L'approche processus nécessite une définition claire des résultats attendus."}
                    </p>
                    
                    {/* Illustration Pédagogique BPMN */}
                    <div className="mt-10 bg-black/40 border border-white/5 p-6 rounded-3xl mix-blend-screen opacity-60 flex flex-col items-center justify-center">
                       <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Modélisation BPMN Théorique</span>
                       
                    </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                    <IdentityCard title="Ressources Requises" icon={Settings2} content={process?.PR_Ressources} />
                    <IdentityCard title="Méthodes de Surveillance" icon={Activity} content={process?.PR_Surveillance} />
                  </div>
                </div>

                <div className="xl:col-span-4">
                  <div className="bg-[#0F172A] border-2 border-blue-600/20 p-8 lg:p-10 rounded-[3rem] lg:rounded-[4rem] shadow-2xl sticky top-8">
                    <h3 className="text-[10px] lg:text-[11px] font-black uppercase text-blue-500 tracking-[0.3em] lg:tracking-[0.4em] mb-10 text-center italic leading-none m-0">Indice de Santé SDE</h3>
                    <div className="space-y-8 lg:space-y-10">
                      <ProgressItem label="Doc. Conformité" val={85} />
                      <ProgressItem label="Actions PAQ" val={62} color="bg-amber-500" />
                      <ProgressItem label="Risques Maîtrisés" val={91} color="bg-emerald-500" />
                      <ProgressItem label="Efficacité KPI" val={45} color="bg-rose-500" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40 italic mt-20 lg:mt-0">
                <RefreshCcw size={80} strokeWidth={2} className="animate-spin text-blue-600 mb-8" />
                <p className="text-2xl font-black uppercase tracking-[0.3em] lg:tracking-[0.5em] text-blue-500 m-0 text-center">
                  Flux {activeModule} <br/> <span className="text-slate-500 text-lg">En construction...</span>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }
      `}</style>
    </div>
  );
}

function NavBtn({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) { 
  return ( 
    <button 
      onClick={onClick} 
      className={`flex items-center gap-3 lg:gap-5 px-5 py-3 lg:px-6 lg:py-4 rounded-2xl transition-all border-none cursor-pointer text-left shrink-0 lg:w-full ${active ? "bg-blue-600 text-white shadow-lg lg:translate-x-2 italic shadow-blue-900/30" : "text-slate-500 hover:text-white hover:bg-slate-800"}`}
    >
      <Icon size={16} className="lg:w-5 lg:h-5 shrink-0" />
      <span className="text-[10px] lg:text-[11px] font-black uppercase italic tracking-widest whitespace-nowrap">{label}</span>
    </button>
  ); 
}

function IdentityCard({ title, icon: Icon, content }: { title: string, icon: any, content: string }) { 
  return ( 
    <div className="bg-slate-900/40 border-2 border-white/5 p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] group hover:border-blue-500/30 transition-all backdrop-blur-sm shadow-xl flex flex-col">
      <div className="flex items-center gap-4 lg:gap-5 mb-6 lg:mb-8">
        <div className="p-3 lg:p-4 bg-white/5 rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
          <Icon size={24} className="lg:w-7 lg:h-7" />
        </div>
        <h4 className="text-[10px] lg:text-[12px] font-black uppercase italic text-slate-500 tracking-[0.2em] lg:tracking-[0.3em] m-0 leading-tight">
          {title}
        </h4>
      </div>
      <p className="text-[12px] lg:text-[14px] font-bold text-slate-300 uppercase italic leading-relaxed m-0 whitespace-pre-wrap flex-1">
        {content || "Donnée SMI non formalisée."}
      </p>
    </div>
  ); 
}

function ProgressItem({ label, val, color = "bg-blue-600" }: { label: string, val: number, color?: string }) { 
  return ( 
    <div className="group">
      <div className="flex justify-between items-center text-[9px] lg:text-[10px] font-black uppercase mb-3 lg:mb-4 tracking-widest m-0">
        <span className="text-slate-500 group-hover:text-white transition-colors">{label}</span>
        <span className="text-white bg-slate-900 border border-white/10 px-3 py-1 rounded-lg shadow-inner">{val}%</span>
      </div>
      <div className="h-2 lg:h-3 bg-black border border-white/10 rounded-full overflow-hidden p-0.5 shadow-inner">
        <div className={`h-full transition-all duration-1000 ease-out rounded-full ${color}`} style={{ width: `${val}%` }} />
      </div>
    </div>
  ); 
}