/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🎛️ MODULE : COCKPIT PROCESSUS (SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Console de pilotage centralisée pour un processus spécifique.
 * DESIGN : Elite High-Density, Modular Dash, 100dvh.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 20:10 GMT
 */

'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  GitBranch, FileText, CheckSquare, BarChart3, RefreshCw, 
  Target, ShieldAlert, Settings2, Activity, 
  ArrowLeft, ShieldCheck, Zap
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

export default function ProcessCockpit({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [process, setProcess] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('ID');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/processus/${id}`);
      setProcess(res.data?.data || res.data);
    } catch { toast.error("PERTE DE LIAISON MATRIX"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !process) return <LoadingScreen label="SDE COCKPIT SYNC..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 COMPACT HEADER */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center bg-[#0F172A]/90 backdrop-blur-3xl z-50 gap-8 mt-12 lg:mt-0 shadow-4xl">
        <div className="flex items-center gap-8 text-left">
          <div className="w-20 h-20 rounded-4xl bg-blue-600 flex items-center justify-center shadow-4xl border border-white/10 shrink-0">
            <GitBranch size={32} />
          </div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <span className="bg-blue-600/10 border border-blue-500/20 px-4 py-1 rounded-xl text-[9px] text-blue-500 tracking-widest">{process.PR_Code}</span>
              <h1 className="text-3xl lg:text-4xl tracking-tighter leading-none m-0 italic">{process.PR_Libelle}</h1>
            </div>
            <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0 flex items-center gap-3 italic">
              <ShieldCheck size={14} className="text-emerald-500" /> Pilote : <span className="text-white">{process.PR_Pilote?.U_FirstName} {process.PR_Pilote?.U_LastName}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <button onClick={() => router.back()} className="flex-1 lg:flex-none bg-slate-900 border-2 border-white/5 px-8 py-4 rounded-3xl font-black text-[10px] tracking-widest text-slate-400 flex items-center justify-center gap-3 transition-all cursor-pointer"><ArrowLeft size={16}/> Retour</button>
          <button className="flex-1 lg:flex-none bg-blue-600 px-8 py-4 rounded-3xl font-black text-[10px] tracking-widest text-white border-none flex items-center justify-center gap-3 transition-all cursor-pointer shadow-4xl"><Zap size={16}/> Action</button>
        </div>
      </header>

      {/* 🧭 SIDE NAVIGATION & CONTENT GRID */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <nav className="w-full lg:w-80 bg-[#0B1222] border-r border-white/5 flex lg:flex-col p-6 gap-4 overflow-x-auto lg:overflow-y-auto custom-scrollbar shrink-0">
          <NavBtn active={activeTab === 'ID'} icon={GitBranch} label="Identité Matrix" onClick={() => setActiveTab('ID')} />
          <NavBtn active={activeTab === 'GED'} icon={FileText} label="Maîtrise Doc" onClick={() => setActiveTab('GED')} />
          <NavBtn active={activeTab === 'ACTIONS'} icon={CheckSquare} label="Actions PAQ" onClick={() => setActiveTab('ACTIONS')} />
          <NavBtn active={activeTab === 'KPI'} icon={BarChart3} label="Performance" onClick={() => setActiveTab('KPI')} />
          <NavBtn active={activeTab === 'RISQUES'} icon={ShieldAlert} label="Risques §6.1" onClick={() => setActiveTab('RISQUES')} />
          <NavBtn active={activeTab === 'SSE'} icon={Activity} label="Monitoring" onClick={() => setActiveTab('SSE')} />
        </nav>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-10 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
            <Target size={600} />
          </div>

          <div className="max-w-350 mx-auto animate-in fade-in duration-700 pb-20">
            {activeTab === 'ID' ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-8 space-y-10">
                  <section className="bg-slate-900/40 border-2 border-white/5 p-12 lg:p-16 rounded-[4rem] relative overflow-hidden group shadow-4xl backdrop-blur-md text-left">
                    <h2 className="text-3xl font-black italic text-blue-500 mb-8 flex items-center gap-5 m-0 uppercase"><Target size={32} /> Finalités Stratégiques</h2>
                    <p className="text-lg leading-relaxed text-slate-300 font-bold italic opacity-90 m-0 whitespace-pre-wrap">
                      {process.PR_Objectifs || "Aucune finalité formalisée pour ce segment Matrix. L'approche processus nécessite une définition claire des résultats attendus."}
                    </p>
                  </section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <CockpitCard title="Ressources" icon={Settings2} text={process.PR_Ressources} />
                    <CockpitCard title="Surveillance" icon={Activity} text={process.PR_Surveillance} />
                  </div>
                </div>
                <div className="xl:col-span-4">
                  <div className="bg-[#0F172A] border-2 border-blue-600/20 p-12 rounded-[4rem] shadow-4xl space-y-12">
                    <h3 className="text-[11px] font-black text-blue-500 tracking-[0.4em] mb-12 text-center italic m-0">Indice de Santé SDE</h3>
                    <HealthBar label="Doc. Conformité" val={85} />
                    <HealthBar label="Actions PAQ" val={62} color="bg-amber-500" />
                    <HealthBar label="Risques Maîtrisés" val={91} color="bg-emerald-500" />
                  </div>
                </div>
              </div>
            ) : <EmptyModule module={activeTab} />}
          </div>
        </main>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function NavBtn({ active, icon: Icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-6 px-8 py-5 rounded-[1.8rem] transition-all border-none cursor-pointer text-left shrink-0 lg:w-full font-black uppercase text-[10px] tracking-widest italic", active ? "bg-blue-600 text-white shadow-4xl lg:translate-x-3" : "text-slate-500 hover:text-white hover:bg-white/5")}>
      <Icon size={18} /> {label}
    </button>
  );
}

function CockpitCard({ title, icon: Icon, text }: any) {
  return (
    <div className="bg-slate-900/40 border-2 border-white/5 p-12 rounded-[3.5rem] group hover:border-blue-600/30 transition-all backdrop-blur-md shadow-4xl text-left">
      <div className="flex items-center gap-5 mb-8">
        <div className="p-4 bg-white/5 rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all"><Icon size={28}/></div>
        <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500 m-0">{title}</h4>
      </div>
      <p className="text-sm font-bold text-slate-400 leading-relaxed italic m-0">{text || "Donnée SMI non formalisée."}</p>
    </div>
  );
}

function HealthBar({ label, val, color = "bg-blue-600" }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-[10px] font-black tracking-widest text-slate-500"><span>{label}</span><span className="text-white">{val}%</span></div>
      <div className="h-2.5 bg-black border border-white/5 rounded-full overflow-hidden p-0.5 shadow-inner">
        <div className={cn("h-full rounded-full transition-all duration-1000", color)} style={{ width: `${val}%` }} />
      </div>
    </div>
  );
}

function EmptyModule({ module }: any) {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center opacity-40 italic">
      <RefreshCw size={80} className="animate-spin text-blue-600 mb-8" />
      <p className="text-3xl font-black tracking-[0.4em] text-blue-500 m-0 uppercase text-center">Flux {module} <br/><span className="text-slate-500 text-xl font-black">Architecture en cours...</span></p>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed uppercase">{label}</span>
    </div>
  );
}