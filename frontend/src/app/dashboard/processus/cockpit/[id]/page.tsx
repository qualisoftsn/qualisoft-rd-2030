/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  GitBranch, FileText, CheckSquare, BarChart3, RefreshCcw, 
  Target, ShieldAlert, Settings2, Activity, Bell, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

type ModuleType = 'ID' | 'GED' | 'ACTIONS' | 'KPI' | 'RISQUES' | 'SSE';

export default function ProcessCockpit() {
  // 🛡️ SÉCURISATION ID
  const params = useParams();
  const id = params?.id as string;
  
  const [process, setProcess] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>('ID');
  const [loading, setLoading] = useState(true);

  const fetchProcessData = useCallback(async () => {
    if (!id) return;
    try {
      const res = await apiClient.get(`/processus/${id}`);
      setProcess(res.data);
    } catch (err) {
      toast.error("Rupture de liaison Cockpit");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProcessData(); }, [fetchProcessData, id]);

  if (loading) return (
    <div className="h-screen bg-[#0B0F1A] flex items-center justify-center ml-72">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden text-left">
      <header className="px-10 py-6 border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-3xl flex justify-between items-center shrink-0">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-4xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-900/40"><GitBranch size={32} /></div>
          <div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg uppercase tracking-widest">{process?.PR_Code}</span>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">{process?.PR_Libelle}</h1>
            </div>
            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.5em] mt-3 italic">PILOTE : {process?.PR_Pilote?.U_FirstName} {process?.PR_Pilote?.U_LastName} • VERSION V{process?.PR_Version}.0</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-white hover:text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-[10px] italic shadow-xl transition-all border-none">ACTION DE PILOTAGE</button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <nav className="w-72 bg-[#0B1222] border-r border-white/5 flex flex-col p-6 gap-2 overflow-y-auto shrink-0">
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6 px-4 italic">Hub Opérationnel</p>
          <NavBtn active={activeModule === 'ID'} icon={GitBranch} label="Identité §4.4" onClick={() => setActiveModule('ID')} />
          <NavBtn active={activeModule === 'GED'} icon={FileText} label="Documentation §7.5" onClick={() => setActiveModule('GED')} />
          <NavBtn active={activeModule === 'ACTIONS'} icon={CheckSquare} label="Actions (PAQ)" onClick={() => setActiveModule('ACTIONS')} />
          <NavBtn active={activeModule === 'KPI'} icon={BarChart3} label="Indicateurs KPI" onClick={() => setActiveModule('KPI')} />
          <NavBtn active={activeModule === 'RISQUES'} icon={ShieldAlert} label="Risques & Opportunités" onClick={() => setActiveModule('RISQUES')} />
          <NavBtn active={activeModule === 'SSE'} icon={Activity} label="Sécurité & Environnement" onClick={() => setActiveModule('SSE')} />
        </nav>

        <main className="flex-1 bg-[#0B0F1A] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              {activeModule === 'ID' && (
                <div className="grid grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="col-span-8 space-y-12">
                        <section className="bg-slate-900/40 border border-white/5 p-12 rounded-[4rem] relative overflow-hidden group shadow-2xl">
                            <h2 className="text-xl font-black uppercase italic mb-8 flex items-center gap-4 text-blue-500 tracking-tight"><Target size={28} /> Finalités & Objectifs Stratégiques</h2>
                            <p className="text-sm leading-relaxed text-slate-300 font-bold uppercase italic opacity-90">{process?.PR_Objectifs || "Aucun objectif formalisé."}</p>
                        </section>
                        <div className="grid grid-cols-2 gap-12">
                            <IdentityCard title="Ressources" icon={Settings2} content={process?.PR_Ressources} />
                            <IdentityCard title="Surveillance" icon={Activity} content={process?.PR_Surveillance} />
                        </div>
                    </div>
                    <div className="col-span-4">
                        <div className="bg-blue-600/10 border border-blue-500/20 p-12 rounded-[4rem] shadow-2xl">
                            <h3 className="text-[11px] font-black uppercase text-blue-500 mb-8 tracking-widest italic">Santé du Processus</h3>
                            <div className="space-y-8">
                                <ProgressItem label="Conformité GED" val={78} />
                                <ProgressItem label="Avancement PAQ" val={45} color="bg-amber-500" />
                                <ProgressItem label="Taux de Risque" val={12} color="bg-rose-500" />
                            </div>
                        </div>
                    </div>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavBtn({ active, icon: Icon, label, onClick }: any) { return ( <button onClick={onClick} className={`flex items-center gap-5 px-6 py-4 rounded-2xl transition-all group relative border-none cursor-pointer text-left w-full ${active ? "bg-blue-600 text-white shadow-2xl translate-x-2" : "text-slate-500 hover:text-white hover:bg-white/5"}`}><Icon size={18} /><span className="text-[11px] font-black uppercase italic tracking-tight">{label}</span></button>); }
function IdentityCard({ title, icon: Icon, content }: any) { return ( <div className="bg-white/2 border border-white/5 p-10 rounded-[3.5rem] group hover:border-blue-600/30 transition-all shadow-xl"><div className="flex items-center gap-5 mb-8"><div className="p-4 bg-white/5 rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all"><Icon size={24} /></div><h4 className="text-[12px] font-black uppercase italic text-slate-400 tracking-widest">{title}</h4></div><p className="text-xs font-bold text-white uppercase italic leading-relaxed opacity-70">{content || "Donnée manquante."}</p></div>); }
function ProgressItem({ label, val, color = "bg-blue-500" }: any) { return ( <div><div className="flex justify-between text-[9px] font-black uppercase italic mb-3 tracking-widest"><span>{label}</span><span>{val}%</span></div><div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${val}%` }} /></div></div>); }