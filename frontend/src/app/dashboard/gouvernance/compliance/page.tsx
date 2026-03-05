/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ⚖️ MODULE : VEILLE LÉGALE & RÉGLEMENTAIRE §6.1.3 (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Identification des exigences et surveillance de conformité.
 * FIX : Layout 100dvh, Définition locale LoadingScreen, Design Matrix.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 14:58 GMT
 */

"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Scale, AlertCircle, Plus, Edit3, Trash2, 
  CheckCircle2, RefreshCcw,
  BookOpen, Target 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function CompliancePage() {
  const [data, setData] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ REQ_Title: '', REQ_Source: '', REQ_Deadline: '', REQ_Status: 'A_EVALUER', REQ_Observations: '', REQ_ProcessusId: '' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resReq, resProc] = await Promise.all([
        apiClient.get('/requirements'),
        apiClient.get('/processus')
      ]);
      setData(resReq.data?.data || resReq.data || []);
      setProcesses(resProc.data?.data || resProc.data || []);
    } catch (e) { toast.error("RUPTURE LÉGALE MATRIX"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = data.length;
    const compliant = data.filter(r => r.REQ_Status === 'CONFORME').length;
    const critical = data.filter(r => r.REQ_Status === 'NON_CONFORME' || (r.REQ_Deadline && new Date(r.REQ_Deadline) < new Date())).length;
    return { total, compliant, critical, rate: total > 0 ? Math.round((compliant/total)*100) : 0 };
  }, [data]);

  if (loading) return <LoadingScreen label="Audit du Noyau Légal §6.1.3..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-xl z-40">
        <div className="text-left space-y-2">
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Veille <span className="text-blue-500">Légale</span></h1>
          <p className="text-slate-500 text-[9px] tracking-[0.4em] m-0 italic"><Scale size={12} className="text-blue-500" /> Identification des Exigences §6.1.3</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="bg-blue-600 px-8 py-4 rounded-2xl text-[10px] flex items-center gap-3 shadow-2xl hover:bg-white hover:text-blue-600 transition-all border-none cursor-pointer italic text-white">
            <Plus size={18} strokeWidth={3} /> Indexer Exigence
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <ComplianceKPI label="Volume Textes" val={stats.total} icon={BookOpen} color="blue" />
          <ComplianceKPI label="Non-Conformités" val={stats.critical} icon={AlertCircle} color="rose" alert={stats.critical > 0} />
          <ComplianceKPI label="Conformité" val={`${stats.rate}%`} icon={CheckCircle2} color="emerald" />
        </div>

        <div className="bg-[#151B2B] border-2 border-white/5 rounded-[4rem] overflow-hidden shadow-4xl flex flex-col min-h-125">
          <div className="p-8 border-b border-white/5 bg-black/20 flex items-center gap-4 text-blue-500">
             <Target size={20} /> <h3 className="text-sm font-black m-0 tracking-[0.2em]">Registre des Textes Applicables</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-200">
              <thead>
                <tr className="bg-black/40 text-[9px] text-slate-500 tracking-[0.3em] border-b border-white/5 font-black italic">
                  <th className="px-10 py-5">Exigence / Source</th>
                  <th className="px-10 py-5 text-center">Processus</th>
                  <th className="px-10 py-5 text-center">Statut §9.1.2</th>
                  <th className="px-10 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-bold italic">
                {data.map(req => (
                  <tr key={req.REQ_Id} className="hover:bg-blue-600/5 transition-all group">
                    <td className="px-10 py-6">
                      <p className="text-sm font-black text-white m-0 leading-none mb-2">{req.REQ_Title}</p>
                      <span className="text-[8px] text-blue-500 tracking-widest uppercase">{req.REQ_Source}</span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="px-4 py-2 bg-white/5 rounded-xl text-[9px] border border-white/5">{req.REQ_Processus?.PR_Code || 'TRANSVERSE'}</span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={cn("px-4 py-2 rounded-xl text-[9px] border", req.REQ_Status === 'CONFORME' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20")}>
                        {req.REQ_Status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right opacity-0 group-hover:opacity-100 transition-all">
                      <div className="flex justify-end gap-3">
                         <button onClick={() => {}} className="p-3 bg-white/5 text-slate-500 hover:text-white rounded-xl border-none cursor-pointer"><Edit3 size={16}/></button>
                         <button onClick={() => {}} className="p-3 bg-white/5 text-slate-500 hover:text-rose-500 rounded-xl border-none cursor-pointer"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 10px; }` }} />
    </div>
  );
}

function ComplianceKPI({ label, val, icon: Icon, color, alert }: any) {
  const themes: any = { blue: "text-blue-500 border-blue-500/20", rose: "text-rose-500 border-rose-500/20", emerald: "text-emerald-500 border-emerald-500/20" };
  return (
    <div className={cn("bg-[#151B2B] p-8 rounded-[3rem] border-2 flex items-center gap-6 shadow-2xl", alert ? "border-rose-500/40 animate-pulse" : "border-white/5")}>
      <div className={cn("p-5 rounded-2xl bg-white/5", themes[color])}><Icon size={24}/></div>
      <div>
        <p className="text-[9px] text-slate-500 tracking-[0.3em] m-0 mb-2">{label}</p>
        <p className="text-4xl font-black italic m-0 tracking-tighter leading-none">{val}</p>
      </div>
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