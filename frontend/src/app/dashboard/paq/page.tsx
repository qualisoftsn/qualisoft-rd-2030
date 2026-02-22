/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : PLAN D'ACTIONS QUALITÉ (PAQ) — COMMAND CENTER ELITE
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage du cycle d'amélioration continue (§10.3 ISO 9001).
 * ARCHITECTURE : Multi-Tenant SDE Matrix Isolation.
 * RÉFÉRENTIEL : types/elite-sde.ts (Prisma Core).
 * CORRECTIFS : Implémentation cn(), Sécurisation ACT_Deadline, Design Full-Space.
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldAlert, CheckCircle2, Clock, Users, 
  ArrowRight, Target, Loader2, LayoutGrid, 
  Plus, Save, Edit3, X, TrendingUp, Printer, 
  Zap, Fingerprint, Activity, BarChart3,
  ShieldCheck, AlertTriangle, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { PAQ as IPAQ, Action as IAction, User as IUser } from '@/types/elite-sde';

// --- 🛠️ UTILITAIRES DE SYSTÈME ---
/**
 * Fusionne les classes CSS en ignorant les valeurs falsy.
 */
const cn = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ');
};

// --- 🏗️ INTERFACES ÉTENDUES ---
interface PAQDashboardData {
  total: number;
  enRetard: IAction[];
  aValider: IAction[];
  cloturees: IAction[];
  tauxEfficacite: number;
  chargeTravail: [string, number][];
}

export default function PAQPage() {
  // --- 📦 ÉTATS DE DONNÉES SCELLÉS ---
  const [data, setData] = useState<PAQDashboardData | null>(null);
  const [paqs, setPaqs] = useState<IPAQ[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingAction, setEditingAction] = useState<IAction | null>(null);

  /**
   * 📡 SYNCHRONISATION DES FLUX MATRIX
   * @description Extraction simultanée des KPIs et de la cartographie des plans.
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
      console.error("❌ Rupture de flux PAQ:", error);
      toast.error("ÉCHEC DE SYNCHRONISATION : REGISTRE SMI INACCESSIBLE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * 💾 ACTION : RECTIFICATION SOUVERAINE (§10.2)
   */
  const handleQuickUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction?.ACT_Id) return;
    
    const tid = toast.loading("Scellage de la mutation corrective...");
    try {
      await apiClient.patch(`/paq/actions/${editingAction.ACT_Id}`, editingAction);
      toast.success("Action rectifiée dans le SMI.", { id: tid });
      setEditingAction(null);
      fetchData();
    } catch (err: unknown) {
      toast.error("Refus de mutation : Intégrité des données compromise.", { id: tid });
    }
  };

  // --- 🛰️ ÉCRAN DE DÉPLOIEMENT ---
  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0B0F1A] ml-72 gap-8">
      <div className="relative flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={80} strokeWidth={1} />
        <Fingerprint className="absolute text-blue-600/30 animate-pulse" size={32} />
      </div>
      <p className="text-blue-500 font-black uppercase italic text-[11px] tracking-[0.8em]">
        Compilation Qualisoft Matrix 2026...
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-12 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors />
      
      <div className="w-full space-y-20 animate-in fade-in duration-1000">
        
        {/* 🔝 EN-TÊTE STRATÉGIQUE (§10.3) */}
        <header className="flex justify-between items-end border-b-2 border-white/5 pb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-blue-500 bg-blue-500/5 w-fit px-6 py-2 rounded-full border border-blue-500/10">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol ISO 9001:2015 Verified</span>
            </div>
            <h1 className="text-7xl font-black uppercase italic tracking-tighter leading-none text-white">
              PILOTAGE <span className="text-blue-600">PAQ</span>
            </h1>
            <p className="text-slate-500 font-bold text-[12px] uppercase tracking-[0.7em] italic opacity-60">
              AMÉLIORATION CONTINUE • PERFORMANCE SDE MATRIX
            </p>
          </div>
          
          <div className="flex gap-8">
            <button className="flex items-center gap-3 px-10 py-6 rounded-4xl border-2 border-white/5 hover:bg-white/5 text-slate-400 font-black uppercase italic text-[11px] transition-all shadow-xl">
              <Printer size={22} /> Rapport Global PDF
            </button>
            <Link href="/dashboard/paq/nouveau" className="bg-blue-600 hover:bg-white hover:text-slate-900 text-white px-14 py-6 rounded-[2.5rem] font-black uppercase italic text-[11px] tracking-widest transition-all shadow-[0_20px_60px_rgba(37,99,235,0.4)] border-none flex items-center gap-5 active:scale-95 group">
               <Plus size={28} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
               Initialiser un Plan Annuel
            </Link>
          </div>
        </header>

        {/* 📊 INDICATEURS DE RÉACTIVITÉ (§9.1.3) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <StatCard title="ACTIONS TOTALES" value={data?.total || 0} icon={Target} color="blue" subtitle="Volume SDE SMI" />
          <StatCard title="RETARDS CRITIQUES" value={data?.enRetard?.length || 0} icon={ShieldAlert} color="red" subtitle="Alerte Non-Conformité §10.2" />
          <StatCard title="INDICE EFFICACITÉ" value={`${data?.tauxEfficacite || 0}%`} icon={CheckCircle2} color="emerald" subtitle="Mesure de Performance §9.1.3" />
          <StatCard title="PILOTES ACTIFS" value={data?.chargeTravail?.length || 0} icon={Users} color="orange" subtitle="Affectation Ressources" />
        </section>

        {/* 🏛️ GRID PRINCIPALE : CARTOGRAPHIE & RADAR (FULL SPACE) */}
        <div className="grid grid-cols-12 gap-16 items-start">
          
          {/* GRILLE DES PLANS ANNUELS PAR PROCESSUS */}
          <div className="col-span-12 lg:col-span-8 space-y-12 text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <h3 className="text-4xl font-black uppercase italic flex items-center gap-8 leading-none">
                  <LayoutGrid className="text-blue-600" size={40} /> Cartographie des Plans
                </h3>
                <span className="text-[12px] font-black uppercase text-slate-500 tracking-[0.3em] bg-white/5 px-6 py-2 rounded-full border border-white/5">
                    {paqs.length} PLANS SCELLÉS
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {paqs.length > 0 ? paqs.map((paq: any) => (
                <Link href={`/dashboard/paq/${paq.PAQ_Id}`} key={paq.PAQ_Id} className="bg-[#0F172A]/40 border border-white/5 p-14 rounded-[5rem] hover:border-blue-600/40 transition-all group flex flex-col justify-between min-h-87.5 shadow-4xl relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 p-10 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-1000 text-white">
                    <BarChart3 size={250} />
                  </div>
                  
                  <div className="relative z-10 text-left">
                    <div className="flex justify-between items-start mb-12">
                        <span className="bg-blue-600/10 border border-blue-600/20 px-8 py-3 rounded-2xl text-[14px] font-black text-blue-500 italic tracking-widest leading-none">
                            EXERCICE {paq.PAQ_Year}
                        </span>
                        <div className="flex flex-col items-end">
                            <span className="text-[11px] font-black uppercase text-slate-500 italic tracking-[0.3em]">{paq._count?.PAQ_Actions || 0} MESURES</span>
                        </div>
                    </div>
                    
                    <h4 className="text-4xl font-black uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors leading-tight mb-8">
                      {paq.PAQ_Processus?.PR_Libelle || "Segment Inconnu"}
                    </h4>
                    
                    <div className="flex items-center gap-5 bg-white/2 p-5 rounded-3xl border border-white/5 w-fit">
                        <div className="w-10 h-10 rounded-xl bg-[#0B0F1A] border border-white/10 flex items-center justify-center text-[12px] font-black text-blue-500 shadow-xl">
                            {(paq.PAQ_QualityManager?.U_FirstName?.charAt(0) || '').toUpperCase()}
                            {(paq.PAQ_QualityManager?.U_LastName?.charAt(0) || '').toUpperCase()}
                        </div>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">
                          PILOTE : <span className="text-white">{paq.PAQ_QualityManager?.U_FirstName} {paq.PAQ_QualityManager?.U_LastName}</span>
                        </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-10 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:translate-x-4 transition-all shadow-2xl group-hover:bg-white group-hover:text-blue-600">
                        <ArrowRight size={32} />
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-2 py-48 text-center border-4 border-dashed border-white/5 rounded-[6rem] opacity-20">
                  <Target size={120} className="mx-auto mb-10" />
                  <p className="font-black uppercase italic tracking-[0.8em] text-sm leading-relaxed">Néant Opérationnel :<br/>Aucun plan d&apos;actions n&apos;est scellé</p>
                </div>
              )}
            </div>
          </div>

          {/* 🧨 RADAR DES URGENCES (§10.2) */}
          <aside className="col-span-12 lg:col-span-4 space-y-12">
            <div className="bg-red-600/5 border-2 border-red-600/10 p-12 rounded-[5rem] h-fit shadow-[0_0_100px_rgba(220,38,38,0.05)] backdrop-blur-3xl relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-red-600 rotate-12"><ShieldAlert size={150} /></div>
                
                <h3 className="text-3xl font-black uppercase italic text-red-600 mb-14 flex items-center gap-6 leading-none tracking-tighter">
                  <ShieldAlert className="animate-pulse" size={40} /> Radar Urgences
                </h3>
                
                <div className="space-y-8 relative z-10">
                   {data?.enRetard?.length ? data.enRetard.slice(0, 7).map((action) => {
                      // ✅ CORRECTION LIGNE 215 : Sécurisation de la Date
                      const deadline = action.ACT_Deadline ? new Date(action.ACT_Deadline) : null;
                      const formattedDate = deadline && !isNaN(deadline.getTime()) 
                        ? deadline.toLocaleDateString('fr-FR') 
                        : "INDÉTERMINÉE";

                      return (
                        <div key={action.ACT_Id} className="p-8 bg-[#0B0F1A]/80 rounded-[3rem] border border-white/5 flex justify-between items-center group hover:border-red-600/40 transition-all shadow-2xl">
                            <div className="min-w-0 text-left">
                              <div className="flex items-center gap-3 mb-3">
                                  <Calendar size={14} className="text-red-500" />
                                  <p className="text-[11px] font-black text-red-500 italic tracking-[0.3em] uppercase">
                                    ÉCHÉANCE : {formattedDate}
                                  </p>
                              </div>
                              <p className="text-lg font-black uppercase italic truncate pr-8 text-white leading-none tracking-tighter">{action.ACT_Title}</p>
                            </div>
                            <button 
                              onClick={() => setEditingAction(action)} 
                              className="p-5 text-slate-600 hover:text-white hover:bg-red-600 rounded-2xl transition-all cursor-pointer bg-white/5 border-none shadow-xl active:scale-90"
                            >
                              <Edit3 size={24} />
                            </button>
                        </div>
                      );
                   }) : (
                    <div className="text-center py-24 bg-emerald-500/5 rounded-[4rem] border border-emerald-500/10">
                        <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-8" />
                        <p className="text-emerald-500 text-[13px] font-black uppercase italic tracking-[0.5em] leading-relaxed">
                          SMI Intégrité OK :<br/>Zéro retard critique
                        </p>
                    </div>
                   )}
                </div>

                <div className="mt-20 pt-12 border-t border-white/5 text-center">
                    <button className="text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors bg-transparent border-none cursor-pointer italic">
                        Accéder au Registre d&apos;Écarts complet §10.2
                    </button>
                </div>
            </div>

            {/* CHARGE PAR PILOTE (§5.3) */}
            <div className="bg-blue-600/5 border-2 border-blue-600/10 p-14 rounded-[5rem] shadow-4xl text-left backdrop-blur-md">
                <h3 className="text-2xl font-black uppercase italic text-blue-500 mb-12 flex items-center gap-6">
                  <Activity size={32} /> Charge Pilotes
                </h3>
                <div className="space-y-12">
                  {data?.chargeTravail?.map(([name, count]) => (
                    <div key={name} className="group">
                      <div className="flex justify-between items-center mb-5">
                        <span className="text-[13px] font-black text-slate-400 uppercase italic tracking-widest group-hover:text-blue-400 transition-colors">{name}</span>
                        <span className="text-[12px] font-black text-blue-500 bg-blue-500/10 px-4 py-1.5 rounded-xl border border-blue-500/10">{count} ACTIONS</span>
                      </div>
                      <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-[2s] ease-out shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                          style={{ width: `${(count / (data.total || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 📟 MODAL DE RECTIFICATION (MATRIX SIDE-DRAWER) */}
      {editingAction && (
        <div className="fixed inset-0 z-100 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500" onClick={() => setEditingAction(null)} />
          <div className="relative h-full w-full max-w-2xl bg-[#0F172A] z-110 p-20 animate-in slide-in-from-right duration-700 border-l-4 border-blue-600 shadow-[-100px_0_150px_rgba(0,0,0,0.8)] overflow-y-auto">
            <div className="flex justify-between items-center mb-20 border-b-4 border-white/5 pb-12">
                <div className="flex items-center gap-8 text-left">
                    <div className="p-6 bg-blue-600 text-white rounded-4xl shadow-4xl animate-pulse"><Zap size={44} strokeWidth={2.5} /></div>
                    <div>
                        <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-white text-left">Rectification</h2>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">Action Corrective Matrix §10.2</p>
                    </div>
                </div>
                <button onClick={() => setEditingAction(null)} className="p-6 hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all rounded-3xl border-none cursor-pointer bg-white/5">
                    <X size={48} strokeWidth={1} />
                </button>
            </div>

            <form onSubmit={handleQuickUpdate} className="space-y-16 text-left">
              <div className="space-y-6">
                <label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.4em] ml-8 italic">Intitulé de la mesure SMI *</label>
                <input 
                  type="text" 
                  value={editingAction.ACT_Title} 
                  onChange={e => setEditingAction({...editingAction, ACT_Title: e.target.value.toUpperCase()})} 
                  className="w-full bg-[#0B0F1A] border-4 border-white/5 rounded-[2.5rem] p-10 text-xl font-black uppercase italic text-white outline-none focus:border-blue-600 shadow-inner transition-all" 
                />
              </div>

              <div className="grid grid-cols-1 gap-12">
                <div className="space-y-6 text-left">
                    <label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.4em] ml-8 italic">État d&apos;avancement SDE Matrix</label>
                    <div className="relative">
                      <select 
                          value={editingAction.ACT_Status} 
                          onChange={e => setEditingAction({...editingAction, ACT_Status: e.target.value as any})} 
                          className="w-full bg-[#0B0F1A] border-4 border-white/5 rounded-[2.5rem] p-10 text-[14px] font-black uppercase italic text-white outline-none focus:border-blue-600 cursor-pointer appearance-none shadow-inner"
                      >
                          <option value="A_FAIRE">✪ À FAIRE (STANDBY)</option>
                          <option value="EN_COURS">⚡ EN COURS (PROCESSING)</option>
                          <option value="TERMINEE">✅ TERMINÉE (SEALED)</option>
                          <option value="ANNULEE">✕ ANNULÉE (REVOKED)</option>
                      </select>
                      <ArrowRight size={20} className="absolute right-10 top-1/2 -translate-y-1/2 text-blue-600 rotate-90" />
                    </div>
                </div>

                <div className="space-y-6 text-left">
                    <label className="text-[12px] font-black uppercase text-slate-500 tracking-[0.4em] ml-8 italic">Niveau de Priorité Critique</label>
                    <div className="grid grid-cols-3 gap-6">
                        {['BASSE', 'MOYENNE', 'HAUTE'].map((prio) => (
                            <button
                                key={prio}
                                type="button"
                                onClick={() => setEditingAction({...editingAction, ACT_Priority: prio as any})}
                                className={cn(
                                    "py-6 rounded-3xl text-[12px] font-black uppercase italic border-4 transition-all cursor-pointer",
                                    editingAction.ACT_Priority === prio ? "bg-red-600 border-red-600 text-white shadow-2xl" : "bg-transparent border-white/5 text-slate-500 hover:border-white/20"
                                )}
                            >
                                {prio}
                            </button>
                        ))}
                    </div>
                </div>
              </div>

              <button type="submit" className="w-full py-12 bg-blue-600 hover:bg-white hover:text-slate-900 text-white rounded-[3rem] font-black uppercase italic text-[14px] tracking-[0.8em] transition-all shadow-[0_30px_100px_rgba(37,99,235,0.4)] border-none cursor-pointer flex items-center justify-center gap-8 active:scale-95">
                <ShieldCheck size={36} /> Sceller la Mutation Corrective
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🧩 STYLES QUANTIQUES */}
      <style jsx global>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </div>
  );
}

/** 📊 COMPOSANT : CARTE STATISTIQUE HAUTE FIDÉLITÉ */
function StatCard({ title, value, icon: Icon, color, subtitle }: { title: string, value: string | number, icon: any, color: string, subtitle: string }) {
  const themes: Record<string, string> = { 
    blue: "text-blue-500 border-blue-500/20 bg-blue-500/5", 
    red: "text-red-500 border-red-500/20 bg-red-500/5 shadow-[0_0_50px_rgba(239,68,68,0.1)]", 
    emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5", 
    orange: "text-orange-500 border-orange-500/20 bg-orange-500/5" 
  };
  return (
    <div className="bg-[#0F172A]/40 border-2 border-white/5 p-14 rounded-[5rem] shadow-4xl relative overflow-hidden group hover:bg-slate-900/60 transition-all text-left">
      <div className={cn("w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-10 border-4 transition-all group-hover:rotate-12 group-hover:scale-110", themes[color])}>
        <Icon size={48} strokeWidth={2.5} />
      </div>
      <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.5em] mb-6 italic opacity-60 leading-none">{title}</p>
      <p className="text-8xl font-black italic tracking-tighter leading-none mb-8 text-white">{value}</p>
      <div className="flex items-center gap-4 text-[11px] font-black uppercase text-slate-600 tracking-widest italic border-t border-white/5 pt-8">
          <Activity size={16} className="text-blue-600" /> {subtitle}
      </div>
    </div>
  );
}