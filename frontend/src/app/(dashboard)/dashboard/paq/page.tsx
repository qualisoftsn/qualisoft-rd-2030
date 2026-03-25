/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛡️ MODULE : PILOTAGE DES PLANS D'ACTIONS QUALITÉ (PAQ)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage du cycle d'amélioration continue (ISO 9001 §10.3).
 * DESIGN : Elite High-Density, 100dvh, Zéro Scroll Global, ClickUp Style.
 * LOGIQUE : Zéro NextAuth • Synchronisation Kernel Matrix.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 17:15 GMT
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import {
  ArrowRight, BarChart3, CheckCircle2,
  Edit3, LayoutGrid, Plus, Printer, ShieldAlert,
  Target, Users, X, RefreshCw, Zap
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function PAQPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [paqs, setPaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAction, setEditingAction] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resStats, resPaqs] = await Promise.all([
        apiClient.get('/paq/dashboard'),
        apiClient.get('/paq'),
      ]);
      setData(resStats.data?.data || resStats.data);
      setPaqs(resPaqs.data?.data || resPaqs.data || []);
    } catch {
      toast.error('ÉCHEC DE SYNCHRONISATION DU REGISTRE PAQ');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingScreen label="Synchronisation des Plans d'Actions..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-indigo-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER STRATÉGIQUE (Fixe) */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-xl z-50 gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4">
            <span className="bg-indigo-600/10 border border-indigo-500/20 px-4 py-1 rounded-xl text-[9px] text-indigo-500 tracking-widest flex items-center gap-2">
              <Zap size={12} /> ISO 9001 §10.3
            </span>
            <span className="text-slate-500 text-[9px] tracking-[0.4em] italic">{data?.total || 0} ACTIONS ACTIVES</span>
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Plans <span className="text-indigo-600">Actions</span></h1>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          <button onClick={() => window.print()} className="flex-1 xl:flex-none p-5 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 text-slate-400 transition-all cursor-pointer"><Printer size={20}/></button>
          <button onClick={() => router.push('/dashboard/paq/nouveau')} className="flex-1 xl:flex-none bg-indigo-600 hover:bg-white hover:text-indigo-600 px-10 py-5 rounded-3xl text-[10px] flex items-center justify-center gap-3 shadow-4xl border-none cursor-pointer text-white italic transition-all active:scale-95">
            <Plus size={18} /> Nouveau Plan
          </button>
        </div>
      </header>

      {/* 📊 KPI DASHBOARD (Fixe) */}
      <div className="shrink-0 p-8 pb-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Actions Totales" value={data?.total || 0} icon={Target} color="indigo" sub="Volume SMI" />
        <KPICard title="Retards Critiques" value={data?.enRetard?.length || 0} icon={ShieldAlert} color="red" sub="Alerte §10.2" />
        <KPICard title="Efficacité" value={`${data?.tauxEfficacite || 0}%`} icon={CheckCircle2} color="emerald" sub="Performance" />
        <KPICard title="Charge Pilotes" value={data?.chargeTravail?.length || 0} icon={Users} color="blue" sub="Ressources" />
      </div>

      {/* 📋 WORKZONE (Scroll Isolé) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4">
        <div className="grid grid-cols-12 gap-8 pb-20">
          
          {/* Liste des PAQ (Colonne Large) */}
          <section className="col-span-12 xl:col-span-8 space-y-6 text-left">
            <h2 className="text-[11px] text-slate-500 tracking-[0.4em] m-0 mb-4 italic flex items-center gap-3">
              <LayoutGrid size={16} /> Plans Annuels Scellés
            </h2>
            <div className="bg-[#151B2B] border-2 border-white/5 rounded-[3.5rem] overflow-hidden shadow-4xl divide-y divide-white/5">
              {paqs.length > 0 ? paqs.map((paq) => (
                <div key={paq.PAQ_Id} onClick={() => router.push(`/dashboard/paq/${paq.PAQ_Id}`)} className="p-8 hover:bg-white/5 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-center gap-6 group">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 text-indigo-500 border border-indigo-500/20 flex flex-col items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <span className="text-[8px] font-black opacity-60">AN</span>
                      <span className="text-xl font-black leading-none">{paq.PAQ_Year}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl m-0 tracking-tighter group-hover:text-indigo-400 transition-colors uppercase italic">{paq.PAQ_Title}</h3>
                      <p className="text-[9px] text-slate-500 mt-2 m-0 tracking-widest uppercase">{paq.Processus?.PR_Libelle || 'Global SMI'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-500 m-0 tracking-widest italic uppercase">Taux d&apos;avancement</p>
                      <div className="w-32 h-1.5 bg-black/40 rounded-full mt-2 overflow-hidden border border-white/5">
                        <div className="h-full bg-indigo-500" style={{ width: '65%' }} />
                      </div>
                    </div>
                    <ArrowRight size={24} className="text-slate-800 group-hover:text-white group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center opacity-20"><Target size={60} className="mx-auto mb-4" /><p>Aucun plan d&apos;action enregistré</p></div>
              )}
            </div>
          </section>

          {/* Radar Urgences & Charge (Colonne Latérale) */}
          <aside className="col-span-12 xl:col-span-4 space-y-8 flex flex-col">
            <div className="bg-[#151B2B] border-2 border-red-600/20 p-8 rounded-[3rem] shadow-4xl flex flex-col gap-8 relative overflow-hidden">
               <ShieldAlert className="absolute -right-4 -top-4 opacity-5 text-red-600" size={100} />
               <h3 className="text-[11px] text-red-500 tracking-[0.4em] m-0 italic flex items-center gap-3 uppercase font-black"><ShieldAlert size={16} /> Radar Retards §10.2</h3>
               <div className="space-y-4">
                 {data?.enRetard?.slice(0, 4).map((action: any) => (
                   <div key={action.ACT_Id} className="bg-black/40 border border-white/5 p-5 rounded-2xl flex justify-between items-center group hover:border-red-600/40 transition-all">
                     <div className="text-left">
                       <p className="text-[10px] text-red-500 m-0 tracking-widest uppercase mb-1 font-black">Exp: {new Date(action.ACT_Deadline).toLocaleDateString()}</p>
                       <p className="text-xs m-0 italic truncate w-40 text-slate-300">{action.ACT_Title}</p>
                     </div>
                     <button onClick={() => setEditingAction(action)} className="p-3 bg-white/5 rounded-xl border-none cursor-pointer text-slate-600 hover:text-white transition-all"><Edit3 size={16} /></button>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-[#151B2B] border-2 border-indigo-600/10 p-8 rounded-[3rem] shadow-4xl flex flex-col gap-8 flex-1">
               <h3 className="text-[11px] text-indigo-500 tracking-[0.4em] m-0 italic flex items-center gap-3 uppercase font-black"><BarChart3 size={16} /> Charge par Pilote</h3>
               <div className="space-y-6">
                 {data?.chargeTravail?.map((pilot: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end italic"><span className="text-[10px] text-slate-400 tracking-widest truncate w-40">{pilot.name}</span><span className="text-lg leading-none">{pilot.count}</span></div>
                      <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${(pilot.count / (data.total || 1)) * 100}%` }} />
                      </div>
                    </div>
                 ))}
               </div>
            </div>
          </aside>
        </div>
      </main>

      {/* 📟 DRAWER DE RECTIFICATION */}
      {editingAction && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingAction(null)} />
          <div className="relative w-full max-w-lg bg-[#0F172A] border-l-2 border-indigo-600/30 h-full p-12 flex flex-col shadow-4xl animate-in slide-in-from-right duration-500 text-left overflow-y-auto">
             <header className="flex justify-between items-center mb-12">
               <h2 className="text-3xl tracking-tighter m-0 uppercase italic">Rectifier <span className="text-indigo-600">Action</span></h2>
               <button onClick={() => setEditingAction(null)} className="p-4 text-slate-500 hover:text-white bg-transparent border-none cursor-pointer"><X size={32}/></button>
             </header>
             <form className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 tracking-[0.4em]">TITRE DE L&apos;ACTION *</label>
                  <input value={editingAction.ACT_Title} className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-sm font-black text-white outline-none focus:border-indigo-600 uppercase italic" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] text-slate-500 tracking-[0.4em]">PRIORITÉ</label>
                    <select className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-xs text-white outline-none appearance-none cursor-pointer">
                      <option>URGENT</option><option>HAUTE</option><option>MOYENNE</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] text-slate-500 tracking-[0.4em]">STATUT</label>
                    <select className="w-full bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-xs text-white outline-none appearance-none cursor-pointer">
                      <option>EN_COURS</option><option>TERMINEE</option>
                    </select>
                  </div>
                </div>
                <button type="button" className="w-full bg-indigo-600 py-6 rounded-[2.5rem] text-[12px] text-white shadow-4xl border-none cursor-pointer hover:bg-white hover:text-indigo-600 transition-all font-black italic tracking-widest mt-12 uppercase">Sceller la Rectification §10.2</button>
             </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color, sub }: any) {
  const c: any = { indigo: "text-indigo-500 border-indigo-500/10", red: "text-red-500 border-red-500/10", emerald: "text-emerald-500 border-emerald-500/10", blue: "text-blue-500 border-blue-500/10" };
  return (
    <div className={cn("bg-[#151B2B] p-8 rounded-[3rem] border-2 flex items-center gap-6 shadow-4xl transition-all hover:-translate-y-1 relative overflow-hidden", c[color])}>
      <div className="p-5 rounded-2xl bg-black/40 border border-white/5 shadow-inner"><Icon size={28} /></div>
      <div className="text-left relative z-10">
        <p className="text-4xl font-black italic m-0 tracking-tighter text-white leading-none">{value}</p>
        <p className="text-[10px] text-slate-500 tracking-widest mt-2 m-0 uppercase leading-none">{title}</p>
        <p className="text-[8px] text-slate-700 mt-1 m-0 tracking-[0.3em] font-bold italic">{sub}</p>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-indigo-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center px-10 leading-relaxed">{label}</span>
    </div>
  );
}
