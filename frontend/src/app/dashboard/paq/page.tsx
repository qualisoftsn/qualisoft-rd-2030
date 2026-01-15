/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldAlert, CheckCircle2, Clock, Users, 
  ArrowRight, Target, Loader2, LayoutGrid, 
  Plus, Calendar, X, Save, Edit3
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function PAQPage() {
  const [data, setData] = useState<any>(null); 
  const [paqs, setPaqs] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [editingAction, setEditingAction] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resStats, resPaqs] = await Promise.all([
        apiClient.get('/paq/dashboard'),
        apiClient.get('/paq')
      ]);
      setData(resStats.data);
      setPaqs(resPaqs.data);
    } catch (error) {
      console.error("Erreur sync PAQ:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/paq/actions/${editingAction.ACT_Id}`, editingAction);
      toast.success("Action mise à jour");
      setEditingAction(null);
      fetchData();
    } catch (err) {
      toast.error("Échec de la modification");
    }
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0B0F1A] ml-72">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-widest">Analyse Qualisoft Elite...</p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-8 ml-72 text-white font-sans italic text-left relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER */}
        <header className="flex justify-between items-center border-b border-white/5 pb-8">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              Pilotage <span className="text-blue-500">PAQ</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3 italic">Amélioration Continue • Certification ISO</p>
          </div>
          <Link href="/dashboard/paq/nouveau" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 rounded-4xl font-black uppercase italic text-xs shadow-xl flex items-center gap-3 transition-all active:scale-95">
             <Plus size={18} /> Initialiser un PAQ
          </Link>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-4 gap-6">
          <PaqStatCard title="Total Actions" value={data?.total || 0} icon={Target} color="blue" />
          <PaqStatCard title="Actions en Retard" value={Array.isArray(data?.enRetard) ? data.enRetard.length : 0} icon={ShieldAlert} color="red" />
          <PaqStatCard title="Efficacité" value={`${Math.round(data?.tauxEfficacite || 0)}%`} icon={CheckCircle2} color="emerald" />
          <PaqStatCard title="Charge Active" value={data?.chargeTravail?.length || 0} icon={Users} color="orange" />
        </div>

        <div className="grid grid-cols-12 gap-10">
          {/* LISTE DES PLANS */}
          <div className="col-span-8 space-y-8">
            <h3 className="text-xl font-black uppercase italic flex items-center gap-3">
              <LayoutGrid className="text-blue-500" /> Référentiel des Plans Annuels
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {paqs.map((paq: any) => (
                <Link href={`/dashboard/paq/${paq.PAQ_Id}`} key={paq.PAQ_Id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] hover:border-blue-500/30 transition-all group min-h-55 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-white/5 px-4 py-1.5 rounded-xl border border-white/10 text-[10px] font-black text-blue-400">{paq.PAQ_Year}</span>
                      <span className="text-[9px] font-black uppercase text-slate-500 italic">{paq._count?.PAQ_Actions || 0} ACTIONS</span>
                    </div>
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors">{paq.PAQ_Processus?.PR_Libelle}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Resp: {paq.PAQ_QualityManager?.U_LastName}</p>
                  </div>
                  <div className="flex justify-end mt-4"><ArrowRight className="text-blue-500 group-hover:translate-x-2 transition-transform" /></div>
                </Link>
              ))}
            </div>
          </div>

          {/* VIGILANCE RETARDS */}
          <aside className="col-span-4 space-y-8">
             <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-[3rem]">
                <h3 className="text-lg font-black uppercase italic text-red-500 mb-6 flex items-center gap-2">
                   <ShieldAlert size={20} /> Vigilance Retards
                </h3>
                <div className="space-y-4">
                   {/* ✅ PROTECTION .slice() contre les erreurs runtime */}
                   {(Array.isArray(data?.enRetard) ? data.enRetard : []).slice(0, 4).map((action: any) => (
                      <div key={action.ACT_Id} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group">
                         <div>
                            <p className="text-[9px] font-black text-red-500 italic underline mb-1">{new Date(action.ACT_Deadline).toLocaleDateString()}</p>
                            <p className="text-[11px] font-black uppercase italic truncate max-w-37.5">{action.ACT_Title}</p>
                         </div>
                         <button onClick={() => setEditingAction(action)} className="text-slate-600 hover:text-white transition-colors">
                            <Edit3 size={16} />
                         </button>
                      </div>
                   ))}
                </div>
             </div>
          </aside>
        </div>
      </div>

      {/* MODAL DE MODIFICATION (SLIDE-OVER) */}
      {editingAction && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100" onClick={() => setEditingAction(null)} />
          <div className="fixed top-0 right-0 h-full w-125 bg-[#0F172A] border-l border-white/10 z-110 p-12 overflow-y-auto animate-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-10 border-b border-white/5 pb-6 text-white">
              Modifier <span className="text-blue-500 text-4xl">l&apos;Action</span>
            </h2>
            <form onSubmit={handleUpdate} className="space-y-8">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 italic mb-3 block">Désignation de l&apos;action</label>
                <input type="text" value={editingAction.ACT_Title} onChange={e => setEditingAction({...editingAction, ACT_Title: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-6 text-sm font-bold italic text-white outline-none focus:border-blue-600 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 italic mb-3 block">Statut Actuel</label>
                <select value={editingAction.ACT_Status} onChange={e => setEditingAction({...editingAction, ACT_Status: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-xl p-5 text-[10px] font-black uppercase italic text-white outline-none">
                  <option value="A_FAIRE">À FAIRE</option>
                  <option value="EN_COURS">EN COURS</option>
                  <option value="TERMINEE">TERMINÉE</option>
                  <option value="ANNULEE">ANNULÉE</option>
                </select>
              </div>
              <button type="submit" className="w-full py-6 bg-blue-600 rounded-[2.5rem] text-[11px] font-black uppercase italic hover:bg-blue-500 transition-all shadow-xl flex items-center justify-center gap-3">
                <Save size={18}/> Enregistrer les modifications
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

function PaqStatCard({ title, value, icon: Icon, color }: any) {
  const themes: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20"
  };
  return (
    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] group hover:bg-white/2 transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${themes[color]}`}><Icon size={24} /></div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{title}</p>
      <p className="text-4xl font-black italic tracking-tighter leading-none">{value}</p>
    </div>
  );
}