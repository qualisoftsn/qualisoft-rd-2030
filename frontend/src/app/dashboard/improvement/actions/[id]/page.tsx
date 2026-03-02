/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🔍 MODULE : DOSSIER D'AUDIT (ACTION DETAIL)
 * Rôle : Archivage des preuves §7.5.3 • Cycle PDCA Transverse.
 * Logic : Philosophie Anti-NextAuth (Session Kernel-Managed).
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:46 GMT
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  ArrowLeft, Clock, User, Calendar, Paperclip, CheckCircle2, 
  MessageSquare, Edit3, Save, Trash2, ExternalLink, FileText,
  Target, Loader2, X, ArrowRight, ShieldCheck, AlertCircle,
  Plus
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

export default function ActionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [action, setAction] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'tasks' | 'evidence'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const loadDossier = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [actionRes, tasksRes, evidRes] = await Promise.all([
        apiClient.get(`/actions/${id}`),
        apiClient.get(`/actions/${id}/tasks`),
        apiClient.get(`/actions/${id}/evidences`)
      ]);
      setAction(actionRes.data);
      setEditData(actionRes.data);
      setTasks(tasksRes.data || []);
      setEvidences(evidRes.data || []);
    } catch (err) {
      toast.error("RUPTURE DE LIAISON DOSSIER MATRIX");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadDossier(); }, [loadDossier]);

  const handleUpdate = async () => {
    const tid = toast.loading("Scellage des modifications...");
    try {
      await apiClient.patch(`/actions/${id}`, editData);
      setAction(editData);
      setIsEditing(false);
      toast.success("REGISTRE ACTUALISÉ §10.2", { id: tid });
    } catch {
      toast.error("ERREUR D'ÉCRITURE KERNEL", { id: tid });
    }
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 font-black uppercase italic tracking-[0.5em] animate-pulse">
      <Loader2 className="animate-spin mr-4" /> Analyse Dossier...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-0 lg:ml-72 flex flex-col selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="sticky top-0 z-40 bg-[#0B0F1A]/90 backdrop-blur-xl border-b border-white/5 px-10 py-6 mt-12 lg:mt-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest bg-transparent border-none cursor-pointer italic">
            <ArrowLeft size={16} /> Retour au registre
          </button>
          
          <div className="flex gap-4">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 border-none transition-all cursor-pointer italic"><Edit3 size={14} /> Modifier</button>
            ) : (
              <button onClick={handleUpdate} className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 transition-all border-none shadow-3xl cursor-pointer italic"><Save size={14} /> Sceller</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-10 flex-1 text-left">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="animate-in fade-in slide-in-from-left-6 duration-700">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase italic tracking-widest">{action.ACT_Status}</span>
                <span className="bg-slate-800 text-slate-500 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase italic tracking-widest">ID #{id.slice(-6)}</span>
              </div>
              
              {isEditing ? (
                <input value={editData.ACT_Title} onChange={e => setEditData({...editData, ACT_Title: e.target.value.toUpperCase()})} className="w-full bg-slate-950 border border-blue-600/30 rounded-3xl p-8 text-3xl font-black italic text-white outline-none mb-6" />
              ) : (
                <h1 className="text-5xl font-black uppercase italic tracking-tighter m-0 leading-none mb-8">{action.ACT_Title}</h1>
              )}
              
              <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 shadow-inner backdrop-blur-sm">
                 <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-6 italic leading-none m-0">Analyse SMQ & Description</p>
                 <p className="text-slate-300 font-bold italic leading-relaxed m-0 uppercase text-sm">{action.ACT_Description || "AUCUNE ANALYSE PRÉCISE INDEXÉE."}</p>
              </div>
            </div>

            <nav className="flex gap-4 border-b border-white/5 mt-12 overflow-x-auto custom-scrollbar">
              {['details', 'tasks', 'evidence'].map((t) => (
                <button key={t} onClick={() => setActiveTab(t as any)} className={cn("px-8 py-4 text-[10px] font-black uppercase italic tracking-widest border-none bg-transparent cursor-pointer transition-all", activeTab === t ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-600')}>{t}</button>
              ))}
            </nav>

            <div className="py-10">
              {activeTab === 'tasks' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-6 bg-white/2 border border-white/5 rounded-3xl group hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-emerald-500 transition-colors"><CheckCircle2 size={20} /></div>
                        <span className="text-sm font-black uppercase italic text-white leading-none">{task.itemTitre}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-600 uppercase italic tracking-widest">Responsable: {task.responsable?.U_FirstName}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'evidence' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
                  {evidences.map((ev: any) => (
                    <div key={ev.id} className="p-6 bg-slate-950/40 border border-white/5 rounded-3xl flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center"><FileText size={24} /></div>
                        <div className="text-left"><p className="text-[11px] font-black uppercase italic text-white m-0 leading-none">{ev.PV_FileName}</p></div>
                      </div>
                      <a href={ev.PV_Url} target="_blank" className="text-slate-600 hover:text-white transition-colors"><ExternalLink size={18} /></a>
                    </div>
                  ))}
                  <div className="col-span-full py-16 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer"><Plus size={32} /><span className="text-[10px] font-black uppercase italic tracking-widest">Indexation Preuve §7.5.3</span></div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-in fade-in duration-500">
                   <div className="bg-white/2 p-8 rounded-4xl border border-white/5"><p className="text-[9px] font-black text-slate-500 uppercase italic mb-3 leading-none tracking-widest">Responsable Dossier</p><p className="text-xl font-black italic m-0">{action.ACT_Responsable?.U_FirstName} {action.ACT_Responsable?.U_LastName}</p></div>
                   <div className="bg-white/2 p-8 rounded-4xl border border-white/5"><p className="text-[9px] font-black text-slate-500 uppercase italic mb-3 leading-none tracking-widest">Échéance Critique</p><p className="text-xl font-black italic m-0 text-blue-500">{new Date(action.ACT_Deadline).toLocaleDateString()}</p></div>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="bg-blue-600/5 border border-blue-500/10 rounded-[3rem] p-10 sticky top-32 text-left shadow-2xl backdrop-blur-md">
              <h3 className="text-2xl font-black uppercase italic mb-8 border-b border-white/5 pb-6 tracking-tighter m-0">Indicateur <span className="text-blue-500">Maturité</span></h3>
              <div className="space-y-8">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl"><ShieldCheck size={32} /></div>
                   <div><p className="text-[9px] font-black text-slate-500 uppercase m-0 italic tracking-widest">Score PDCA</p><p className="text-3xl font-black italic text-white m-0 tracking-tighter">88%</p></div>
                </div>
                <div className="pt-8 border-t border-white/5"><p className="text-[9px] text-slate-500 font-bold uppercase italic leading-relaxed tracking-widest m-0">Scellage numérique conforme aux exigences de l&apos;audit qualité.</p></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}