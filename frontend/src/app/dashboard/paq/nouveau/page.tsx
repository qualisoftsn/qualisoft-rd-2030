/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : PLAN D'ACTIONS QUALITÉ (PAQ) — COMMAND CENTER ELITE
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage du cycle d'amélioration continue (§10.3 ISO 9001).
 * ARCHITECTURE : Multi-Tenant SDE Matrix Isolation (Zéro données factices).
 * RÉFÉRENTIEL : types/elite-sde.ts (Prisma Core Strict).
 * CORRECTION : Strict alignement des objets de relation Prisma (Processus, QualityManager).
 * DESIGN : Cockpit Matrix Full-Space (max-w-500).
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

// --- 🛠️ UTILITAIRES DE SYSTÈME ---
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

// --- 🏗️ INTERFACES ÉTENDUES SDE ---
interface PAQDashboardData {
  total: number;
  enRetard: IAction[];
  aValider: IAction[];
  cloturees: IAction[];
  tauxEfficacite: number;
  chargeTravail: [string, number][];
}

export default function PAQPage() {
  // --- 📦 ÉTATS SCELLÉS DU NOYAU ---
  const [data, setData] = useState<PAQDashboardData | null>(null);
  const [paqs, setPaqs] = useState<IPAQ[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // État de la modale de rectification
  const [editingAction, setEditingAction] = useState<IAction | null>(null);

  /**
   * 📡 SYNCHRONISATION MATRIX (Zéro Simulation)
   * @description Extraction multi-tenant sécurisée des KPIs et des PAQs.
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resStats, resPaqs] = await Promise.all([
        apiClient.get('/paq/dashboard'),
        apiClient.get('/paq')
      ]);
      
      const stats = resStats.data?.data || resStats.data;
      const plans = resPaqs.data?.data || resPaqs.data;
      
      setData(stats);
      setPaqs(Array.isArray(plans) ? plans : []);
    } catch (error: unknown) {
      toast.error("ÉCHEC KERNEL : REGISTRE PAQ INACCESSIBLE.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * 💾 ACTION : SCELLAGE DE LA RECTIFICATION (§10.2)
   */
  const handleQuickUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction?.ACT_Id) return;
    
    const tid = toast.loading("Scellage de la mutation corrective SDE...");
    try {
      await apiClient.patch(`/paq/actions/${editingAction.ACT_Id}`, editingAction);
      toast.success("ACTION RECTIFIÉE DANS LE NOYAU.", { id: tid });
      setEditingAction(null);
      fetchData(); // Rafraîchissement global
    } catch (err: unknown) {
      toast.error("REFUS DE MUTATION SDE : INTÉGRITÉ COMPROMISE.", { id: tid });
    }
  };

  // --- 🛰️ ÉCRAN DE DÉPLOIEMENT ---
  if (loading) return (
    <div className="ml-72 flex h-screen flex-col items-center justify-center bg-[#0B0F1A] gap-12">
      <div className="relative flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={120} strokeWidth={1} />
        <Fingerprint className="absolute text-blue-600/20 animate-pulse" size={48} />
      </div>
      <p className="text-blue-500 font-black uppercase italic text-[14px] tracking-[1.5em]">
        Compilation Matrix PAQ...
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-16 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="w-full max-w-500 mx-auto space-y-24 animate-in fade-in duration-1000">
        
        {/* 🔝 EN-TÊTE STRATÉGIQUE (§10.3) */}
        <header className="flex justify-between items-end border-b-4 border-white/5 pb-16">
          <div className="space-y-8">
            <div className="flex items-center gap-6 text-blue-500 bg-blue-500/5 w-fit px-8 py-3 rounded-full border border-blue-500/10 shadow-inner">
              <ShieldCheck size={24} className="text-emerald-500" />
              <span className="text-[12px] font-black uppercase tracking-[0.5em] italic">Protocol ISO 9001:2015 Verified</span>
            </div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-none text-white">
              PILOTAGE <span className="text-blue-600">PAQ</span>
            </h1>
            <p className="text-slate-500 font-bold text-[14px] uppercase tracking-[1em] italic opacity-60 flex items-center gap-6">
              <Activity size={20} className="text-blue-600" /> AMÉLIORATION CONTINUE • PERFORMANCE SDE
            </p>
          </div>
          
          <div className="flex gap-10">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-5 px-14 py-8 rounded-[3rem] border-4 border-white/5 hover:bg-white/5 text-slate-400 font-black uppercase italic text-[13px] transition-all shadow-xl cursor-pointer bg-transparent"
            >
              <Printer size={28} /> Rapport Global
            </button>
            <Link href="/dashboard/paq/nouveau" className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-16 py-8 rounded-[3rem] font-black uppercase italic text-[13px] tracking-[0.4em] transition-all shadow-4xl border-none flex items-center gap-6 active:scale-95 group shadow-[0_20px_80px_rgba(37,99,235,0.4)]">
               <Plus size={36} strokeWidth={4} className="group-hover:rotate-90 transition-transform" /> 
               Initialiser un Plan Annuel
            </Link>
          </div>
        </header>

        {/* 📊 INDICATEURS DE RÉACTIVITÉ (§9.1.3) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          <StatCard title="ACTIONS TOTALES" value={data?.total || 0} icon={Target} color="blue" subtitle="Volume SDE SMI" />
          <StatCard title="RETARDS CRITIQUES" value={data?.enRetard?.length || 0} icon={ShieldAlert} color="red" subtitle="Alerte Exigence §10.2" />
          <StatCard title="INDICE EFFICACITÉ" value={`${data?.tauxEfficacite || 0}%`} icon={CheckCircle2} color="emerald" subtitle="Performance §9.1.3" />
          <StatCard title="PILOTES ACTIFS" value={data?.chargeTravail?.length || 0} icon={Users} color="orange" subtitle="Ressources Allouées" />
        </section>

        {/* 🏛️ GRID PRINCIPALE : CARTOGRAPHIE & RADAR */}
        <div className="grid grid-cols-12 gap-20 items-start">
          
          {/* GRILLE DES PLANS ANNUELS PAR PROCESSUS */}
          <div className="col-span-12 lg:col-span-8 space-y-16 text-left">
            <div className="flex items-center justify-between border-b-4 border-white/5 pb-12">
                <h3 className="text-5xl font-black uppercase italic flex items-center gap-10 leading-none">
                  <LayoutGrid className="text-blue-600" size={48} /> Cartographie des Plans
                </h3>
                <span className="text-[14px] font-black uppercase text-slate-500 tracking-[0.5em] bg-white/5 px-8 py-4 rounded-full border-2 border-white/5 shadow-inner">
                    {paqs.length} PLANS SCELLÉS
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {paqs.length > 0 ? paqs.map((paq: any) => (
                <Link href={`/dashboard/paq/${paq.PAQ_Id}`} key={paq.PAQ_Id} className="bg-[#151A2D] border-4 border-white/5 p-16 rounded-[6rem] hover:border-blue-600/40 transition-all group flex flex-col justify-between min-h-100 shadow-4xl relative overflow-hidden backdrop-blur-3xl">
                  <div className="absolute -right-16 -top-16 p-16 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-1000 text-white">
                    <BarChart3 size={300} />
                  </div>
                  
                  <div className="relative z-10 text-left">
                    <div className="flex justify-between items-start mb-16">
                        <span className="bg-blue-600/10 border-2 border-blue-600/20 px-10 py-4 rounded-4xl text-[16px] font-black text-blue-500 italic tracking-[0.4em] leading-none shadow-inner">
                            EXERCICE {paq.PAQ_Year}
                        </span>
                        <div className="flex flex-col items-end">
                            <span className="text-[12px] font-black uppercase text-slate-500 italic tracking-[0.5em]">
                              {paq._count?.Actions || paq.Actions?.length || 0} MESURES
                            </span>
                        </div>
                    </div>
                    
                    {/* ✅ CORRECTION : Utilisation de paq.Processus et non paq.PAQ_Processus */}
                    <h4 className="text-5xl font-black uppercase italic tracking-tighter group-hover:text-blue-500 transition-colors leading-[0.9] mb-12">
                      {paq.Processus?.PR_Libelle || "Processus Orphelin"}
                    </h4>
                    
                    {/* ✅ CORRECTION : Utilisation de paq.QualityManager et non paq.PAQ_QualityManager */}
                    <div className="flex items-center gap-8 bg-black/40 p-6 rounded-[3rem] border-2 border-white/5 w-fit shadow-inner">
                        <div className="w-16 h-16 rounded-3xl bg-[#0B0F1A] border-2 border-white/10 flex items-center justify-center text-[16px] font-black text-blue-500 shadow-xl">
                            {(paq.QualityManager?.U_FirstName?.charAt(0) || '').toUpperCase()}
                            {(paq.QualityManager?.U_LastName?.charAt(0) || '').toUpperCase()}
                        </div>
                        <p className="text-[12px] text-slate-500 font-black uppercase tracking-[0.4em] italic leading-tight">
                          PILOTE : <br/><span className="text-white text-[16px]">{paq.QualityManager?.U_FirstName} {paq.QualityManager?.U_LastName}</span>
                        </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-12 relative z-10">
                    <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:translate-x-6 transition-all shadow-2xl group-hover:bg-white group-hover:text-blue-600 border-4 border-transparent group-hover:border-blue-200">
                        <ArrowRight size={48} strokeWidth={3} />
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-2 py-64 text-center border-8 border-dashed border-white/5 rounded-[7rem] opacity-20">
                  <Target size={180} className="mx-auto mb-16 text-slate-500" />
                  <p className="font-black uppercase italic tracking-[1em] text-3xl leading-relaxed text-slate-600">Registre PAQ Vierge<br/>Aucun plan scellé</p>
                </div>
              )}
            </div>
          </div>

          {/* 🧨 RADAR DES URGENCES (§10.2) */}
          <aside className="col-span-12 lg:col-span-4 space-y-16">
            <div className="bg-[#151A2D] border-4 border-red-600/20 p-16 rounded-[6rem] h-fit shadow-[0_0_150px_rgba(220,38,38,0.1)] relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-red-600 rotate-12"><ShieldAlert size={250} /></div>
                
                <h3 className="text-4xl font-black uppercase italic text-red-600 mb-16 flex items-center gap-8 leading-none tracking-tighter">
                  <ShieldAlert className="animate-pulse" size={56} /> Radar Urgences
                </h3>
                
                <div className="space-y-10 relative z-10">
                   {data?.enRetard?.length ? data.enRetard.slice(0, 7).map((action) => {
                      const deadline = action.ACT_Deadline ? new Date(action.ACT_Deadline) : null;
                      const formattedDate = deadline && !isNaN(deadline.getTime()) 
                        ? deadline.toLocaleDateString('fr-FR') 
                        : "INDÉFINIE";

                      return (
                        <div key={action.ACT_Id} className="p-10 bg-black/60 rounded-[4rem] border-2 border-white/5 flex justify-between items-center group hover:border-red-600/40 transition-all shadow-4xl backdrop-blur-xl">
                            <div className="min-w-0 text-left">
                              <div className="flex items-center gap-5 mb-5">
                                  <Calendar size={20} className="text-red-500" />
                                  <p className="text-[12px] font-black text-red-500 italic tracking-[0.4em] uppercase leading-none">
                                    ÉCHÉANCE : {formattedDate}
                                  </p>
                              </div>
                              <p className="text-2xl font-black uppercase italic truncate pr-10 text-white leading-none tracking-tighter group-hover:text-red-400 transition-colors">
                                {action.ACT_Title}
                              </p>
                            </div>
                            <button 
                              onClick={() => setEditingAction(action)} 
                              className="p-8 text-slate-500 hover:text-white hover:bg-red-600 rounded-4xl transition-all cursor-pointer bg-white/5 border-none shadow-xl active:scale-90"
                            >
                              <Edit3 size={32} />
                            </button>
                        </div>
                      );
                   }) : (
                    <div className="text-center py-32 bg-emerald-500/5 rounded-[5rem] border-4 border-emerald-500/10 shadow-inner">
                        <CheckCircle2 size={100} className="text-emerald-500 mx-auto mb-12" />
                        <p className="text-emerald-500 text-[14px] font-black uppercase italic tracking-[0.8em] leading-relaxed">
                          SMI Intégrité OK :<br/>Zéro retard critique
                        </p>
                    </div>
                   )}
                </div>
            </div>

            {/* CHARGE PAR PILOTE (§5.3) */}
            <div className="bg-[#151A2D] border-4 border-blue-600/10 p-16 rounded-[6rem] shadow-4xl text-left relative overflow-hidden">
                <Activity size={200} className="absolute -bottom-10 -right-10 opacity-[0.03] text-blue-600" />
                <h3 className="text-3xl font-black uppercase italic text-blue-500 mb-16 flex items-center gap-8 relative z-10 tracking-tighter">
                  <Users size={40} /> Charge Pilotes
                </h3>
                <div className="space-y-12 relative z-10">
                  {data?.chargeTravail?.map(([name, count]) => (
                    <div key={name} className="group">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[14px] font-black text-slate-400 uppercase italic tracking-widest group-hover:text-blue-400 transition-colors leading-none">{name}</span>
                        <span className="text-[12px] font-black text-blue-500 bg-blue-600/10 px-6 py-2 rounded-xl border-2 border-blue-500/20 leading-none shadow-inner">{count} ACTIONS</span>
                      </div>
                      <div className="w-full bg-black/60 h-6 rounded-full overflow-hidden p-1.5 border-2 border-white/5 shadow-inner">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-[2s] ease-out shadow-[0_0_20px_rgba(37,99,235,0.6)]" 
                          style={{ width: `${(count / (data.total || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {(!data?.chargeTravail || data.chargeTravail.length === 0) && (
                      <div className="text-center py-10 opacity-30 text-[12px] font-black uppercase italic tracking-widest text-slate-400">Aucune action assignée</div>
                  )}
                </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 📟 MODAL DE RECTIFICATION SDE (SIDE-DRAWER MASTER) */}
      {editingAction && (
        <div className="fixed inset-0 z-100 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500" onClick={() => setEditingAction(null)} />
          <div className="relative h-full w-200 bg-[#0F172A] z-110 p-24 animate-in slide-in-from-right duration-700 border-l-8 border-blue-600 shadow-[-150px_0_200px_rgba(0,0,0,0.8)] overflow-y-auto">
            
            <div className="flex justify-between items-center mb-24 border-b-4 border-white/5 pb-16">
                <div className="flex items-center gap-10 text-left">
                    <div className="p-8 bg-blue-600 text-white rounded-4xl shadow-[0_0_50px_rgba(37,99,235,0.5)] animate-pulse"><Zap size={48} strokeWidth={3} /></div>
                    <div>
                        <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none text-white text-left">Rectification</h2>
                        <p className="text-[13px] font-black text-slate-500 uppercase tracking-[0.8em] mt-5 italic">Action Matrix §10.2</p>
                    </div>
                </div>
                <button onClick={() => setEditingAction(null)} className="p-8 hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all rounded-4xl border-none cursor-pointer bg-white/5 active:scale-90">
                    <X size={40} strokeWidth={3} />
                </button>
            </div>

            <form onSubmit={handleQuickUpdate} className="space-y-20 text-left">
              <div className="space-y-8">
                <label className="text-[14px] font-black uppercase text-slate-500 tracking-[0.6em] ml-10 italic flex items-center gap-4">
                  Intitulé de la mesure SMI
                </label>
                <input 
                  type="text" 
                  value={editingAction.ACT_Title} 
                  onChange={e => setEditingAction({...editingAction, ACT_Title: e.target.value.toUpperCase()})} 
                  className="w-full bg-black/40 border-4 border-white/5 rounded-[4rem] p-12 text-2xl font-black uppercase italic text-white outline-none focus:border-blue-600 shadow-inner transition-all" 
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-16">
                <div className="space-y-8 text-left">
                    <label className="text-[14px] font-black uppercase text-slate-500 tracking-[0.6em] ml-10 italic flex items-center gap-4">
                      Statut d&apos;avancement SDE
                    </label>
                    <div className="relative">
                      <select 
                          value={editingAction.ACT_Status} 
                          onChange={e => setEditingAction({...editingAction, ACT_Status: e.target.value as ActionStatus})} 
                          className="w-full bg-black/40 border-4 border-white/5 rounded-[4rem] p-12 text-xl font-black uppercase italic text-white outline-none focus:border-blue-600 cursor-pointer appearance-none shadow-inner"
                      >
                          <option value={ActionStatus.A_FAIRE}>✪ À FAIRE</option>
                          <option value={ActionStatus.EN_COURS}>⚡ EN COURS</option>
                          <option value={ActionStatus.TERMINEE}>✅ TERMINÉE</option>
                          <option value={ActionStatus.ANNULEE}>✕ ANNULÉE</option>
                      </select>
                    </div>
                </div>

                <div className="space-y-8 text-left">
                    <label className="text-[14px] font-black uppercase text-slate-500 tracking-[0.6em] ml-10 italic flex items-center gap-4">
                      Niveau de Priorité Critique
                    </label>
                    <div className="grid grid-cols-3 gap-8">
                        {Object.values(Priority).map((prio) => (
                            <button
                                key={prio}
                                type="button"
                                onClick={() => setEditingAction({...editingAction, ACT_Priority: prio})}
                                className={cn(
                                    "py-8 rounded-[3rem] text-[14px] font-black uppercase italic border-4 transition-all cursor-pointer shadow-lg",
                                    editingAction.ACT_Priority === prio 
                                      ? "bg-red-600 border-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] scale-105" 
                                      : "bg-black/40 border-white/5 text-slate-500 hover:border-white/20"
                                )}
                            >
                                {prio}
                            </button>
                        ))}
                    </div>
                </div>
              </div>

              <button type="submit" className="w-full py-12 mt-10 bg-blue-600 hover:bg-white hover:text-blue-600 text-white rounded-[4rem] font-black uppercase italic text-2xl tracking-[0.6em] transition-all shadow-[0_30px_80px_rgba(37,99,235,0.4)] border-none cursor-pointer flex items-center justify-center gap-10 active:scale-95 group">
                <ShieldCheck size={40} className="group-hover:scale-110 transition-transform" /> Valider
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🧩 STYLES QUANTIQUES */}
      <style jsx global>{`
        ::-webkit-scrollbar { width: 0px; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
    </div>
  );
}

/** 📊 COMPOSANT : CARTE STATISTIQUE HAUTE FIDÉLITÉ (max-w-500) */
function StatCard({ title, value, icon: Icon, color, subtitle }: { title: string, value: string | number, icon: any, color: string, subtitle: string }) {
  const themes: Record<string, string> = { 
    blue: "text-blue-500 border-blue-500/20 bg-blue-500/5 shadow-[0_0_50px_rgba(37,99,235,0.1)]", 
    red: "text-red-500 border-red-500/20 bg-red-500/5 shadow-[0_0_50px_rgba(239,68,68,0.1)]", 
    emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_50px_rgba(16,185,129,0.1)]", 
    orange: "text-orange-500 border-orange-500/20 bg-orange-500/5 shadow-[0_0_50px_rgba(249,115,22,0.1)]" 
  };
  return (
    <div className="bg-[#151A2D] border-4 border-white/5 p-16 rounded-[6rem] shadow-4xl relative overflow-hidden group hover:bg-black/40 transition-all text-left backdrop-blur-3xl">
      <div className={cn("w-32 h-32 rounded-[3rem] flex items-center justify-center mb-12 border-4 transition-all group-hover:rotate-12 group-hover:scale-110", themes[color])}>
        <Icon size={64} strokeWidth={2.5} />
      </div>
      <p className="text-[13px] font-black text-slate-500 uppercase tracking-[0.6em] mb-8 italic opacity-80 leading-none">{title}</p>
      <p className="text-[90px] font-black italic tracking-tighter leading-none mb-10 text-white">{value}</p>
      <div className="flex items-center gap-5 text-[12px] font-black uppercase text-slate-600 tracking-widest italic border-t-4 border-white/5 pt-10 leading-none">
          <Activity size={20} className="text-blue-600" /> {subtitle}
      </div>
    </div>
  );
}