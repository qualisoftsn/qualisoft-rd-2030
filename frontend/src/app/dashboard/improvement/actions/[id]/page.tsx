/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🔍 MODULE : DOSSIER PDCA (ACTION DETAIL) §10.2
 * -------------------------------------------------------------------------
 * RÔLE : Archivage des preuves et suivi des jalons de conformité.
 * DESIGN : Cockpit 100dvh, Layout Multi-Panneaux, Matrix Kernel.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 15:45 GMT
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  ArrowLeft, Save, ExternalLink, FileText, 
  ShieldCheck, CheckCircle2, Plus, RefreshCcw 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export default function ActionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [action, setAction] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'tasks' | 'evidence'>('details');

  const loadDossier = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [actionRes, tasksRes, evidRes] = await Promise.all([
        apiClient.get(`/actions/${id}`),
        apiClient.get(`/actions/${id}/tasks`),
        apiClient.get(`/actions/${id}/evidences`)
      ]);
      setAction(actionRes.data?.data || actionRes.data);
      setTasks(tasksRes.data?.data || tasksRes.data || []);
      setEvidences(evidRes.data?.data || evidRes.data || []);
    } catch { toast.error("RUPTURE DE LIAISON DOSSIER MATRIX"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadDossier(); }, [loadDossier]);

  if (loading) return <LoadingScreen label="Analyse du Dossier PDCA..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-50 gap-6 mt-12 lg:mt-0">
        <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] bg-transparent border-none cursor-pointer italic">
          <ArrowLeft size={16} /> Retour au registre
        </button>
        <div className="flex gap-4">
          <button className="bg-blue-600 px-10 py-4 rounded-2xl text-[10px] flex items-center gap-3 shadow-4xl border-none cursor-pointer text-white italic transition-all hover:bg-white hover:text-blue-600">
            <Save size={16} /> Sceller les modifications
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 text-left">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-8 space-y-10 animate-in slide-in-from-left-6 duration-700">
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="bg-blue-600/10 text-blue-500 border border-blue-500/20 px-5 py-2 rounded-2xl text-[9px] tracking-[0.3em]">{action.ACT_Status}</span>
                <span className="text-[9px] text-slate-600 tracking-widest italic">INDEX #ID-{id.slice(-6)}</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter m-0 leading-none italic uppercase">{action.ACT_Title}</h1>
            </div>

            <div className="bg-[#151B2B] border-2 border-white/5 rounded-[4rem] p-12 shadow-4xl">
              <h4 className="text-[10px] text-slate-500 tracking-[0.4em] mb-6 italic uppercase m-0 border-b border-white/5 pb-4">Analyse SMQ & Description (§10.2)</h4>
              <p className="text-xl text-slate-300 font-bold leading-relaxed m-0 italic uppercase">{action.ACT_Description || "AUCUNE ANALYSE PRÉCISE INDEXÉE DANS LE NOYAU."}</p>
            </div>

            {/* TAB SYSTEM */}
            <div className="space-y-8">
              <nav className="flex gap-4 border-b border-white/5">
                {['details', 'tasks', 'evidence'].map((t) => (
                  <button key={t} onClick={() => setActiveTab(t as any)} className={cn("px-8 py-5 text-[10px] font-black tracking-widest border-none bg-transparent cursor-pointer transition-all", activeTab === t ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-600')}>{t}</button>
                ))}
              </nav>

              <div className="min-h-75">
                {activeTab === 'tasks' && (
                  <div className="grid gap-4">
                    {tasks.map((task: any) => (
                      <div key={task.id} className="p-8 bg-black/20 border border-white/5 rounded-4xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-6"><CheckCircle2 className="text-slate-700 group-hover:text-emerald-500 transition-colors" size={24} /><span className="text-lg font-black tracking-tight leading-none">{task.itemTitre}</span></div>
                        <span className="text-[10px] text-slate-600 tracking-widest uppercase italic">RESP: {task.responsable?.U_FirstName}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'evidence' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {evidences.map((ev: any) => (
                      <div key={ev.id} className="p-8 bg-black/40 border border-white/5 rounded-4xl flex items-center justify-between shadow-inner group">
                        <div className="flex items-center gap-5"><FileText className="text-blue-500" size={28}/><p className="text-[11px] font-black italic m-0 truncate w-40">{ev.PV_FileName}</p></div>
                        <a href={ev.PV_Url} target="_blank" className="p-3 bg-white/5 rounded-xl hover:text-blue-500 transition-all"><ExternalLink size={20}/></a>
                      </div>
                    ))}
                    <div className="col-span-full py-16 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center gap-4 opacity-40 hover:opacity-100 transition-all cursor-pointer"><Plus size={32}/><span className="text-[10px] font-black tracking-[0.5em]">Indexation Preuve §7.5.3</span></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="bg-blue-600/10 border-2 border-blue-500/20 p-12 rounded-[4rem] sticky top-32 shadow-4xl text-left backdrop-blur-md">
              <h3 className="text-2xl font-black mb-10 m-0 tracking-tighter leading-none">Indicateur <span className="text-blue-500">Maturité</span></h3>
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-3xl"><ShieldCheck size={40} /></div>
                <div><p className="text-[10px] text-slate-500 uppercase m-0 italic tracking-widest">Score PDCA</p><p className="text-5xl font-black italic text-white m-0 tracking-tighter">88%</p></div>
              </div>
              <div className="pt-8 border-t border-white/5"><p className="text-[9px] text-slate-500 font-bold uppercase italic leading-relaxed tracking-widest m-0">Scellage conforme aux exigences de l&apos;audit ISO §10.2.</p></div>
            </div>
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 lg:pl-72 text-blue-500">
      <RefreshCcw className="animate-spin" size={60} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] animate-pulse italic">{label}</span>
    </div>
  );
}