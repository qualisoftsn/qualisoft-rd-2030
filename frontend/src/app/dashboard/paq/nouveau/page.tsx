/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : PLAN D'ACTIONS QUALITÉ (PAQ) — COMMAND CENTER ELITE
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage du cycle d'amélioration continue (§10.3 ISO 9001).
 * ARCHITECTURE : Zéro NextAuth, Multi-Tenant SDE Matrix Isolation.
 * DESIGN : Cockpit Matrix Full-Space (max-w-500).
 * DATE : 02 Mars 2026 | 12:43 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldAlert, CheckCircle2, Clock, Users, 
  ArrowRight, Target, Loader2, LayoutGrid, 
  Plus, Save, Edit3, X, Printer, 
  Zap, Fingerprint, Activity, BarChart3,
  ShieldCheck, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { PAQ as IPAQ, Action as IAction, ActionStatus, Priority } from '@/types/elite-sde';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

interface PAQDashboardData {
  total: number;
  enRetard: IAction[];
  aValider: IAction[];
  cloturees: IAction[];
  tauxEfficacite: number;
  chargeTravail: [string, number][];
}

export default function NouveauPAQPage() {
  const [data, setData] = useState<PAQDashboardData | null>(null);
  const [paqs, setPaqs] = useState<IPAQ[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingAction, setEditingAction] = useState<IAction | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resStats, resPaqs] = await Promise.all([
        apiClient.get('/paq/dashboard'),
        apiClient.get('/paq')
      ]);
      setData(resStats.data?.data || resStats.data);
      setPaqs(Array.isArray(resPaqs.data?.data || resPaqs.data) ? (resPaqs.data?.data || resPaqs.data) : []);
    } catch (error: unknown) {
      toast.error("ÉCHEC KERNEL : REGISTRE PAQ INACCESSIBLE.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleQuickUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction?.ACT_Id) return;
    
    const tid = toast.loading("Scellage de la mutation corrective SDE...");
    try {
      await apiClient.patch(`/paq/actions/${editingAction.ACT_Id}`, editingAction);
      toast.success("ACTION RECTIFIÉE DANS LE NOYAU.", { id: tid });
      setEditingAction(null);
      fetchData(); 
    } catch (err: unknown) {
      toast.error("REFUS DE MUTATION SDE : INTÉGRITÉ COMPROMISE.", { id: tid });
    }
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-8">
      <div className="relative flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={80} strokeWidth={2} />
        <Fingerprint className="absolute text-blue-600/30 animate-pulse" size={32} />
      </div>
      <p className="text-blue-500 font-black uppercase italic text-xs tracking-[1em]">Compilation Matrix PAQ...</p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-8 lg:p-16 ml-0 lg:ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="w-full max-w-400 mx-auto space-y-16 animate-in fade-in duration-1000">
        
        {/* 🔝 EN-TÊTE STRATÉGIQUE (§10.3) */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end border-b-2 border-white/5 pb-10 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-blue-400 bg-blue-500/10 w-fit px-5 py-2 rounded-full border border-blue-500/20 shadow-inner">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] italic m-0">Protocol ISO 9001:2015 Verified</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black uppercase italic tracking-tighter leading-none text-white m-0">
              PILOTAGE <span className="text-blue-600">PAQ</span>
            </h1>
            <p className="text-slate-500 font-bold text-[10px] lg:text-[12px] uppercase tracking-[0.5em] italic opacity-80 flex items-center gap-4 m-0">
              <Activity size={16} className="text-blue-600" /> AMÉLIORATION CONTINUE • PERFORMANCE SDE
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 lg:gap-6 w-full xl:w-auto">
            <button onClick={() => window.print()} className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-5 rounded-3xl border-2 border-white/5 hover:bg-white/5 text-slate-400 font-black uppercase italic text-[10px] lg:text-[11px] transition-all cursor-pointer bg-transparent">
              <Printer size={20} /> Rapport Global
            </button>
            <Link href="/dashboard/paq/nouveau/form" className="flex-1 xl:flex-none bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-8 py-5 rounded-3xl font-black uppercase italic text-[10px] lg:text-[11px] tracking-widest transition-all border-none flex items-center justify-center gap-3 active:scale-95 group shadow-[0_10px_40px_rgba(37,99,235,0.3)] no-underline">
               <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
               Initialiser un Plan Annuel
            </Link>
          </div>
        </header>

        {/* 📊 INDICATEURS DE RÉACTIVITÉ (§9.1.3) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
          <StatCard title="ACTIONS TOTALES" value={data?.total || 0} icon={Target} color="blue" subtitle="Volume SDE SMI" />
          <StatCard title="RETARDS CRITIQUES" value={data?.enRetard?.length || 0} icon={ShieldAlert} color="red" subtitle="Alerte Exigence §10.2" />
          <StatCard title="INDICE EFFICACITÉ" value={`${data?.tauxEfficacite || 0}%`} icon={CheckCircle2} color="emerald" subtitle="Performance §9.1.3" />
          <StatCard title="PILOTES ACTIFS" value={data?.chargeTravail?.length || 0} icon={Users} color="orange" subtitle="Ressources Allouées" />
        </section>

        {/* 🏛️ GRID PRINCIPALE : CARTOGRAPHIE & RADAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* GRILLE DES PLANS ANNUELS PAR PROCESSUS */}
          <div className="lg:col-span-8 space-y-10 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-white/5 pb-6 gap-4">
                <h3 className="text-2xl lg:text-4xl font-black uppercase italic flex items-center gap-4 leading-none m-0">
                  <LayoutGrid className="text-blue-600" size={32} /> Cartographie des Plans
                </h3>
                <span className="text-[10px] lg:text-[11px] font-black uppercase text-slate-400 tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5 shrink-0 m-0">
                  {paqs.length} PLANS SCELLÉS
                </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {paqs.length > 0 ? paqs.map((paq: any) => (
                <Link href={`/dashboard/paq/${paq.PAQ_Id}`} key={paq.PAQ_Id} className="bg-[#151A2D] border-2 border-white/5 p-8 lg:p-10 rounded-[3rem] hover:border-blue-600/40 transition-all group flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-md no-underline">
                  <div className="absolute -right-8 -top-8 p-8 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-1000 text-white pointer-events-none">
                    <BarChart3 size={150} />
                  </div>
                  
                  <div className="relative z-10 text-left">
                    <div className="flex justify-between items-start mb-10">
                        <span className="bg-blue-600/10 border border-blue-600/20 px-4 py-2 rounded-2xl text-[10px] lg:text-[11px] font-black text-blue-400 italic tracking-[0.2em] leading-none shadow-inner m-0">
                          EXERCICE {paq.PAQ_Year}
                        </span>
                        <span className="text-[9px] lg:text-[10px] font-black uppercase text-slate-500 italic tracking-widest m-0 bg-white/5 px-3 py-1.5 rounded-lg">
                          {paq._count?.Actions || paq.Actions?.length || 0} MESURES
                        </span>
                    </div>
                    
                    <h4 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors leading-tight mb-8 m-0 text-white line-clamp-2">
                      {paq.Processus?.PR_Libelle || "Processus Orphelin"}
                    </h4>
                    
                    <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5 w-fit shadow-inner">
                        <div className="w-10 h-10 rounded-xl bg-[#0B0F1A] border border-white/10 flex items-center justify-center text-[12px] font-black text-blue-500 shadow-md">
                          {(paq.QualityManager?.U_FirstName?.charAt(0) || '').toUpperCase()}{(paq.QualityManager?.U_LastName?.charAt(0) || '').toUpperCase()}
                        </div>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic leading-tight m-0">
                          PILOTE : <br/><span className="text-slate-300 text-[11px]">{paq.QualityManager?.U_FirstName} {paq.QualityManager?.U_LastName || 'NON DÉFINI'}</span>
                        </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-8 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-white/5 text-slate-500 flex items-center justify-center group-hover:translate-x-2 transition-all group-hover:bg-blue-600 group-hover:text-white border border-transparent">
                        <ArrowRight size={20} strokeWidth={3} />
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="xl:col-span-2 py-32 text-center border-4 border-dashed border-white/5 rounded-[4rem] opacity-30 bg-[#151A2D]">
                  <Target size={80} className="mx-auto mb-8 text-slate-500" />
                  <p className="font-black uppercase italic tracking-widest text-sm leading-relaxed text-slate-400 m-0">Registre PAQ Vierge<br/>Aucun plan scellé</p>
                </div>
              )}
            </div>
          </div>

          {/* 🧨 RADAR DES URGENCES & CHARGE (§10.2 / §5.3) */}
          <aside className="col-span-1 lg:col-span-4 space-y-8">
            <div className="bg-[#151A2D] border-2 border-red-600/20 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden text-left backdrop-blur-md">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-red-600 rotate-12 pointer-events-none"><ShieldAlert size={120} /></div>
                
                <h3 className="text-xl lg:text-2xl font-black uppercase italic text-red-500 mb-8 flex items-center gap-4 leading-none tracking-tighter m-0">
                  <ShieldAlert className="animate-pulse shrink-0" size={28} /> Radar Urgences
                </h3>
                
                <div className="space-y-4 relative z-10">
                   {data?.enRetard?.length ? data.enRetard.slice(0, 5).map((action) => {
                      const deadline = action.ACT_Deadline ? new Date(action.ACT_Deadline) : null;
                      const formattedDate = deadline && !isNaN(deadline.getTime()) ? deadline.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit'}) : "INDÉFINIE";

                      return (
                        <div key={action.ACT_Id} className="p-5 bg-black/40 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-red-600/40 transition-all shadow-inner">
                           <div className="min-w-0 text-left pr-4">
                              <div className="flex items-center gap-2 mb-2">
                                  <Calendar size={12} className="text-red-500" />
                                  <p className="text-[9px] font-black text-red-500 italic tracking-widest uppercase leading-none m-0">ÉCHÉANCE : {formattedDate}</p>
                              </div>
                              <p className="text-sm font-black uppercase italic truncate text-slate-300 leading-none tracking-tighter group-hover:text-red-400 transition-colors m-0">{action.ACT_Title}</p>
                           </div>
                           <button onClick={() => setEditingAction(action)} className="p-3 text-slate-500 hover:text-white hover:bg-red-600 rounded-xl transition-all cursor-pointer bg-white/5 border-none shadow-md shrink-0">
                              <Edit3 size={16} />
                           </button>
                        </div>
                      );
                   }) : (
                    <div className="text-center py-12 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 shadow-inner">
                        <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-4" />
                        <p className="text-emerald-500 text-[9px] font-black uppercase italic tracking-widest m-0 px-4">SMI Intégrité OK : Zéro retard critique</p>
                    </div>
                   )}
                </div>
            </div>

            <div className="bg-[#151A2D] border-2 border-blue-600/10 p-8 rounded-[3rem] shadow-2xl text-left relative overflow-hidden backdrop-blur-md">
                <Activity size={100} className="absolute -bottom-4 -right-4 opacity-[0.03] text-blue-600 pointer-events-none" />
                <h3 className="text-xl lg:text-2xl font-black uppercase italic text-blue-500 mb-8 flex items-center gap-4 relative z-10 tracking-tighter m-0">
                  <Users size={24} /> Charge Pilotes
                </h3>
                <div className="space-y-6 relative z-10">
                  {data?.chargeTravail?.map(([name, count]) => (
                    <div key={name} className="group">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase italic tracking-widest group-hover:text-blue-400 transition-colors truncate">{name}</span>
                        <span className="text-[9px] lg:text-[10px] font-black text-blue-500 bg-blue-600/10 px-3 py-1 rounded-lg border border-blue-500/20 leading-none shrink-0 ml-2">{count} ACT.</span>
                      </div>
                      <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${(count / (data.total || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  {(!data?.chargeTravail || data.chargeTravail.length === 0) && (
                      <div className="text-center py-6 opacity-40 text-[10px] font-black uppercase italic tracking-widest text-slate-500">Aucune action assignée</div>
                  )}
                </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 📟 MODAL DE RECTIFICATION SDE (SIDE-DRAWER MASTER) */}
      {editingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer" onClick={() => setEditingAction(null)} />
          <div className="relative h-full w-full max-w-lg bg-[#0F172A] z-50 p-8 lg:p-12 animate-in slide-in-from-right duration-500 border-l border-blue-600/50 shadow-2xl overflow-y-auto">
            
            <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4 text-left">
                    <div className="p-3 bg-blue-600/20 text-blue-500 rounded-xl border border-blue-500/30"><Zap size={24} strokeWidth={2.5} /></div>
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none text-white m-0">Rectification</h2>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 italic m-0">Action Matrix §10.2</p>
                    </div>
                </div>
                <button onClick={() => setEditingAction(null)} className="p-3 hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all rounded-xl border-none cursor-pointer bg-white/5">
                    <X size={20} strokeWidth={3} />
                </button>
            </div>

            <form onSubmit={handleQuickUpdate} className="space-y-8 text-left">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic block m-0">Intitulé de la mesure SMI</label>
                <input type="text" value={editingAction.ACT_Title} onChange={e => setEditingAction({...editingAction, ACT_Title: e.target.value.toUpperCase()})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-black uppercase italic text-white outline-none focus:border-blue-500 shadow-inner transition-all" required />
              </div>

              <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic block m-0">Statut d&apos;avancement SDE</label>
                  <select value={editingAction.ACT_Status} onChange={e => setEditingAction({...editingAction, ACT_Status: e.target.value as ActionStatus})} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-black uppercase italic text-slate-300 outline-none focus:border-blue-500 cursor-pointer shadow-inner appearance-none">
                      <option value={ActionStatus.A_FAIRE}>✪ À FAIRE</option>
                      <option value={ActionStatus.EN_COURS}>⚡ EN COURS</option>
                      <option value={ActionStatus.TERMINEE}>✅ TERMINÉE</option>
                      <option value={ActionStatus.ANNULEE}>✕ ANNULÉE</option>
                  </select>
              </div>

              <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic block m-0">Niveau de Priorité</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.values(Priority).map((prio) => (
                          <button key={prio} type="button" onClick={() => setEditingAction({...editingAction, ACT_Priority: prio})} className={cn("py-3 rounded-xl text-[10px] font-black uppercase italic border transition-all cursor-pointer", editingAction.ACT_Priority === prio ? "bg-red-600/20 border-red-500 text-red-400 shadow-md" : "bg-black/40 border-white/5 text-slate-500 hover:border-white/20 hover:text-white")}>
                              {prio}
                          </button>
                      ))}
                  </div>
              </div>

              <button type="submit" className="w-full py-4 mt-4 bg-blue-600 hover:bg-white hover:text-blue-600 text-white rounded-2xl font-black uppercase italic text-sm tracking-widest transition-all shadow-lg border-none cursor-pointer flex items-center justify-center gap-3">
                <ShieldCheck size={18} /> Valider
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle }: any) {
  const themes: Record<string, string> = { 
    blue: "text-blue-500 border-blue-500/20 bg-blue-500/10 shadow-lg", 
    red: "text-red-500 border-red-500/20 bg-red-500/10 shadow-lg", 
    emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10 shadow-lg", 
    orange: "text-orange-500 border-orange-500/20 bg-orange-500/10 shadow-lg" 
  };
  return (
    <div className="bg-[#151A2D] border border-white/5 p-6 lg:p-8 rounded-4xl shadow-2xl relative overflow-hidden group hover:bg-black/40 transition-all text-left backdrop-blur-md">
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border transition-transform group-hover:scale-110", themes[color])}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic m-0">{title}</p>
      <p className="text-4xl lg:text-5xl font-black italic tracking-tighter leading-none mb-4 text-white m-0">{value}</p>
      <div className="flex items-center gap-2 text-[8px] font-black uppercase text-slate-500 tracking-widest italic border-t border-white/5 pt-4 m-0">
          <Activity size={12} className="text-blue-500" /> {subtitle}
      </div>
    </div>
  );
}