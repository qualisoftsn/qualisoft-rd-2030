/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  GitBranch, FileText, CheckSquare, BarChart3, RefreshCcw, 
  Target, ShieldAlert, Settings2, Activity, Bell, Loader2, 
  ArrowLeft, ShieldCheck, Zap, Fingerprint
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

type ModuleType = 'ID' | 'GED' | 'ACTIONS' | 'KPI' | 'RISQUES' | 'SSE';

export default function ProcessCockpit() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [process, setProcess] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>('ID');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProcessData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/processus/${id}`);
      setProcess(res.data?.data || res.data);
    } catch (err) { toast.error("Perte de liaison Matrix"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchProcessData(); }, [id]);

  if (loading) return (
    <div className="h-screen bg-[#0B0F1A] flex flex-col items-center justify-center ml-72 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">SDE COCKPIT SYNC...</span>
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER COCKPIT (Shrink-0) */}
      <header className="px-10 py-6 border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-3xl flex justify-between items-center shrink-0 shadow-xl">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg border border-white/10 group">
            <GitBranch size={32} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-4">
              <span className="text-[8px] font-black px-3 py-1 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-lg uppercase italic tracking-widest leading-none">{process?.PR_Code}</span>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none m-0 text-white">{process?.PR_Libelle}</h1>
            </div>
            <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] m-0 mt-1 flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-500" /> PILOTE : <span className="text-slate-100">{process?.PR_Pilote?.U_FirstName} {process?.PR_Pilote?.U_LastName}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-4">
            <button className="bg-slate-900/50 hover:bg-white hover:text-slate-900 px-6 py-3 rounded-xl font-black uppercase text-[9px] transition-all border border-white/5 flex items-center gap-2 cursor-pointer">NOTIF <Bell size={14} /></button>
            <button className="bg-blue-600 hover:bg-white hover:text-slate-900 px-6 py-3 rounded-xl font-black uppercase text-[9px] shadow-lg transition-all border-none flex items-center gap-2 cursor-pointer">ACTION <Zap size={14} /></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 🧭 NAV CONSOLE (Corrected Logique) */}
        <nav className="w-72 bg-[#0B1222] border-r border-white/5 flex flex-col p-6 gap-2 shrink-0 overflow-y-auto custom-scrollbar">
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6 px-4 border-l-2 border-blue-600/30">Infrastructure</p>
          
          <NavBtn active={activeModule === 'ID'} icon={GitBranch} label="Identité Matrix" onClick={() => setActiveModule('ID')} />
          <NavBtn active={activeModule === 'GED'} icon={FileText} label="Maîtrise Doc" onClick={() => setActiveModule('GED')} />
          <NavBtn active={activeModule === 'ACTIONS'} icon={CheckSquare} label="Actions PAQ" onClick={() => setActiveModule('ACTIONS')} />
          <NavBtn active={activeModule === 'KPI'} icon={BarChart3} label="Performance" onClick={() => setActiveModule('KPI')} />
          <NavBtn active={activeModule === 'RISQUES'} icon={ShieldAlert} label="Risques §6.1" onClick={() => setActiveModule('RISQUES')} />
          <NavBtn active={activeModule === 'SSE'} icon={Activity} label="Monitoring" onClick={() => setActiveModule('SSE')} />
          
          <button onClick={() => router.push('/dashboard/processus')} className="mt-auto flex items-center justify-center gap-3 py-4 rounded-xl text-slate-500 hover:text-white transition-all bg-white/5 border border-white/5 cursor-pointer italic font-black text-[9px] uppercase tracking-widest">
            <ArrowLeft size={14} /> Retour Carto
          </button>
        </nav>

        {/* 📟 MAIN CONSOLE (No-Scroll Viewport) */}
        <main className="flex-1 bg-[#0B0F1A] overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.01] pointer-events-none"><Target size={400} /></div>

          <div className="h-full overflow-y-auto p-10 custom-scrollbar relative z-10">
            {activeModule === 'ID' ? (
              <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-500">
                <div className="col-span-8 space-y-8">
                  <section className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] relative overflow-hidden group shadow-2xl backdrop-blur-md">
                    <div className="absolute -right-10 -top-10 opacity-5 group-hover:scale-110 transition-transform"><Target size={200} /></div>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="p-3 bg-blue-600/20 text-blue-500 rounded-2xl border border-blue-500/20"><Target size={24} /></div>
                      <h2 className="text-xl font-black uppercase italic text-blue-500 tracking-tighter m-0">Finalités Stratégiques</h2>
                    </div>
                    <p className="text-[14px] leading-relaxed text-slate-200 font-bold uppercase italic opacity-90 m-0">
                      {process?.PR_Objectifs || "Aucune finalité formalisée pour ce segment Matrix."}
                    </p>
                  </section>

                  <div className="grid grid-cols-2 gap-8">
                    <IdentityCard title="Ressources" icon={Settings2} content={process?.PR_Ressources} />
                    <IdentityCard title="Surveillance" icon={Activity} content={process?.PR_Surveillance} />
                  </div>
                </div>

                <div className="col-span-4">
                  <div className="bg-[#0F172A] border border-blue-600/20 p-8 rounded-[4rem] shadow-2xl sticky top-0">
                    <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-[0.4em] mb-10 text-center">Indice de Santé SDE</h3>
                    <div className="space-y-8">
                      <ProgressItem label="Doc. Conformité" val={85} />
                      <ProgressItem label="Actions PAQ" val={62} color="bg-amber-500" />
                      <ProgressItem label="Risques Maîtrisés" val={91} color="bg-emerald-500" />
                      <ProgressItem label="Efficacité KPI" val={45} color="bg-rose-500" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                <RefreshCcw size={60} className="animate-spin text-blue-600 mb-6" />
                <p className="text-xl font-black uppercase tracking-[0.3em] text-blue-500">Flux {activeModule} En attente...</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function NavBtn({ active, icon: Icon, label, onClick }: any) { 
  return ( 
    <button onClick={onClick} className={`flex items-center gap-6 px-6 py-4 rounded-2xl transition-all border-none cursor-pointer text-left w-full ${active ? "bg-blue-600 text-white shadow-lg translate-x-2 italic" : "text-slate-500 hover:text-white hover:bg-white/5"}`}>
      <Icon size={18} />
      <span className="text-[11px] font-black uppercase italic tracking-tight">{label}</span>
    </button>
  ); 
}

function IdentityCard({ title, icon: Icon, content }: any) { 
  return ( 
    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] group hover:border-blue-500/30 transition-all backdrop-blur-sm shadow-xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-white/5 rounded-xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all"><Icon size={22} /></div>
        <h4 className="text-[11px] font-black uppercase italic text-slate-500 tracking-widest m-0">{title}</h4>
      </div>
      <p className="text-[12px] font-bold text-slate-300 uppercase italic leading-relaxed m-0">{content || "Donnée SMI non formalisée."}</p>
    </div>
  ); 
}

function ProgressItem({ label, val, color = "bg-blue-600" }: any) { 
  return ( 
    <div className="group">
      <div className="flex justify-between text-[9px] font-black uppercase mb-3 tracking-widest"><span className="text-slate-500 group-hover:text-white">{label}</span><span className="text-white bg-white/5 px-2 py-0.5 rounded-md">{val}%</span></div>
      <div className="h-2 bg-black border border-white/10 rounded-full overflow-hidden p-0.5"><div className={`h-full transition-all duration-1000 rounded-full ${color}`} style={{ width: `${val}%` }} /></div>
    </div>
  ); 
}