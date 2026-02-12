'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldAlert, CheckCircle2, Clock, Users, 
  ArrowRight, Target, Loader2, LayoutGrid, 
  Plus, Save, Edit3, X
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

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
      toast.error("Rupture de flux PAQ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.patch(`/paq/actions/${editingAction.ACT_Id}`, editingAction);
      toast.success("Action rectifiée");
      setEditingAction(null);
      fetchData();
    } catch (err) {
      toast.error("Échec de mise à jour");
    }
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0B0F1A] ml-72">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
      <p className="text-blue-500 font-black uppercase italic text-[10px] tracking-[0.4em]">Calcul Qualisoft Elite...</p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-12 ml-72 text-white font-sans italic text-left">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <header className="flex justify-between items-end border-b border-white/5 pb-10">
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">PILOTAGE <span className="text-blue-500">PAQ</span></h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.5em] mt-4 italic">Surveillance Système ISO</p>
          </div>
          <Link href="/dashboard/paq/nouveau" className="bg-blue-600 hover:bg-white hover:text-slate-900 text-white px-10 py-6 rounded-2xl font-black uppercase italic text-xs transition-all shadow-2xl border-none">
             <Plus size={20} className="inline mr-2" /> Initialiser un Plan
          </Link>
        </header>

        <div className="grid grid-cols-4 gap-8">
          <StatCard title="ACTIONS TOTALES" value={data?.total || 0} icon={Target} color="blue" />
          <StatCard title="RETARDS CRITIQUES" value={data?.enRetard?.length || 0} icon={ShieldAlert} color="red" />
          <StatCard title="INDICE EFFICACITÉ" value={`${data?.tauxEfficacite || 0}%`} icon={CheckCircle2} color="emerald" />
          <StatCard title="PILOTES ACTIFS" value={data?.chargeTravail?.length || 0} icon={Users} color="orange" />
        </div>

        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-8 space-y-10">
            <h3 className="text-2xl font-black uppercase italic flex items-center gap-4"><LayoutGrid className="text-blue-500" /> Plans Annuels</h3>
            <div className="grid grid-cols-2 gap-8">
              {paqs.map((paq: any) => (
                <Link href={`/dashboard/paq/${paq.PAQ_Id}`} key={paq.PAQ_Id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] hover:border-blue-500/40 transition-all group flex flex-col justify-between min-h-64 shadow-2xl">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="bg-blue-500/10 px-5 py-2 rounded-xl text-[11px] font-black text-blue-400 italic">{paq.PAQ_Year}</span>
                      <span className="text-[10px] font-black uppercase text-slate-500 italic tracking-widest">{paq._count?.PAQ_Actions || 0} ACTIONS</span>
                    </div>
                    <h4 className="text-3xl font-black uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors leading-tight">{paq.PAQ_Processus?.PR_Libelle}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-4">Responsable : {paq.PAQ_QualityManager?.U_LastName}</p>
                  </div>
                  <div className="flex justify-end"><ArrowRight className="text-blue-500 group-hover:translate-x-3 transition-transform" /></div>
                </Link>
              ))}
            </div>
          </div>

          <aside className="col-span-4 bg-red-500/5 border border-red-500/10 p-10 rounded-[3.5rem] h-fit">
            <h3 className="text-xl font-black uppercase italic text-red-500 mb-8 flex items-center gap-3"><ShieldAlert /> Urgences</h3>
            <div className="space-y-6">
               {data?.enRetard?.slice(0, 5).map((action: any) => (
                  <div key={action.ACT_Id} className="p-6 bg-white/2 rounded-2xl border border-white/5 flex justify-between items-center group">
                     <div>
                        <p className="text-[10px] font-black text-red-500 italic mb-2">DÉLAI : {new Date(action.ACT_Deadline).toLocaleDateString()}</p>
                        <p className="text-sm font-black uppercase italic truncate max-w-[150px]">{action.ACT_Title}</p>
                     </div>
                     <button onClick={() => setEditingAction(action)} className="text-slate-600 hover:text-white transition-colors cursor-pointer bg-transparent border-none"><Edit3 size={18} /></button>
                  </div>
               ))}
            </div>
          </aside>
        </div>
      </div>

      {editingAction && (
        <>
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]" onClick={() => setEditingAction(null)} />
          <div className="fixed top-0 right-0 h-full w-[500px] bg-[#0F172A] z-[110] p-16 animate-in slide-in-from-right duration-500 border-l border-white/10">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-12 border-b border-white/5 pb-8">RECTIFIER <span className="text-blue-500">L&apos;ACTION</span></h2>
            <form onSubmit={handleUpdate} className="space-y-10 text-left">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-2">Intitulé</label>
                <input type="text" value={editingAction.ACT_Title} onChange={e => setEditingAction({...editingAction, ACT_Title: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-6 text-sm font-bold italic text-white outline-none" />
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest ml-2">Statut</label>
                <select value={editingAction.ACT_Status} onChange={e => setEditingAction({...editingAction, ACT_Status: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-xs font-black uppercase italic text-white outline-none">
                  <option value="A_FAIRE">À FAIRE</option>
                  <option value="EN_COURS">EN COURS</option>
                  <option value="TERMINEE">TERMINÉE</option>
                  <option value="ANNULEE">ANNULÉE</option>
                </select>
              </div>
              <button type="submit" className="w-full py-7 bg-blue-600 rounded-3xl text-xs font-black uppercase italic transition-all shadow-2xl border-none cursor-pointer"><Save size={20} className="inline mr-3" /> Sceller les modifications</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const themes: any = { blue: "text-blue-500 border-blue-500/20", red: "text-red-500 border-red-500/20", emerald: "text-emerald-500 border-emerald-500/20", orange: "text-orange-500 border-orange-500/20" };
  return (
    <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3.5rem] shadow-2xl">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border-2 ${themes[color]}`}><Icon size={32} /></div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{title}</p>
      <p className="text-6xl font-black italic tracking-tighter leading-none">{value}</p>
    </div>
  );
}