//* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📊 MODULE : REPORTING ANALYTIQUE PAQ — ÉDITION ÉLITE
 * -------------------------------------------------------------------------
 * RÔLE : Analyse et évaluation de la performance (§9.1.3 ISO 9001).
 * USAGE : Revue de performance et préparation des rapports d'audit.
 * ARCHITECTURE : Full-Space Occupancy Dashboard (Dark Matrix), Zéro NextAuth.
 * DATE : 02 Mars 2026 | 12:43 GMT
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldAlert, CheckCircle2, Clock, Users, 
  Target, Loader2, User, Printer, Plus,
  BarChart3, TrendingUp, Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export default function PAQReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/paq/dashboard');
      setData(res.data?.data || res.data);
    } catch (error: unknown) {
      console.error("❌ Erreur Dashboard PAQ:", error);
      toast.error("Rupture de flux analytique avec la Matrix.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0B0F1A] ml-0 lg:ml-72 gap-6">
      <Loader2 className="animate-spin text-blue-500" size={50} />
      <p className="text-blue-500 font-black uppercase italic text-[11px] tracking-[0.6em] animate-pulse">Compilation des données SMI...</p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-8 lg:p-16 ml-0 lg:ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors theme="dark" />
      
      <div className="w-full max-w-400 mx-auto space-y-12 lg:space-y-20 animate-in fade-in duration-700">
        
        {/* 🔝 HEADER COCKPIT ANALYTIQUE */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b-2 border-white/5 pb-8 lg:pb-12">
          <div className="space-y-4 lg:space-y-6">
            <h1 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none text-white m-0">
              PLAN D&apos;ACTIONS <span className="text-blue-600 italic">QUALITÉ</span>
            </h1>
            <p className="text-blue-400 font-bold text-[10px] lg:text-[12px] uppercase tracking-[0.3em] lg:tracking-[0.5em] m-0 italic opacity-80">
              Pilotage de la Performance & Amélioration Continue (§9.1.3)
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 lg:gap-8 w-full lg:w-auto">
            <button onClick={() => window.print()} className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 lg:px-10 py-4 lg:py-6 rounded-3xl border-2 border-white/5 hover:bg-white hover:text-slate-900 text-slate-400 font-black uppercase italic text-[10px] lg:text-[11px] transition-all shadow-xl cursor-pointer bg-transparent">
              <Printer size={18} /> Lancer Rapport PDF
            </button>
            <button onClick={() => router.push('/dashboard/paq/nouveau')} className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-6 lg:px-12 py-4 lg:py-6 rounded-3xl font-black uppercase italic text-[10px] lg:text-[11px] transition-all shadow-2xl border-none cursor-pointer active:scale-95">
              <Plus size={20} strokeWidth={3} /> Nouvelle Action
            </button>
          </div>
        </header>

        {/* 📊 COMPTEURS HAUTE DÉFINITION (§10.2 / §10.3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
          <StatCard title="ACTIONS TOTALES" value={data?.total || 0} icon={Target} color="blue" />
          <StatCard title="RETARDS CRITIQUES" value={data?.enRetard?.length || 0} icon={ShieldAlert} color="red" />
          <StatCard title="EN ATTENTE" value={data?.aValider?.length || 0} icon={Clock} color="orange" />
          <StatCard title="CLÔTURÉES SDE" value={data?.cloturees?.length || 0} icon={CheckCircle2} color="emerald" />
        </div>

        <div className="grid grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* 🧨 SECTION : RADAR DES URGENCES (§10.2) */}
          <div className="col-span-12 lg:col-span-8 bg-[#0F172A]/40 border border-white/5 p-8 lg:p-16 rounded-[3rem] lg:rounded-[5rem] backdrop-blur-3xl shadow-2xl text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 lg:mb-12 border-b border-white/5 pb-6 lg:pb-8 gap-4">
               <h3 className="text-2xl lg:text-3xl font-black uppercase italic flex items-center gap-4 m-0">
                 <span className="w-2 h-8 lg:h-10 bg-red-600 rounded-full animate-pulse shrink-0"></span> 
                 Analyse des Écarts & Retards
               </h3>
               <span className="text-[10px] lg:text-[11px] font-black text-red-500 uppercase tracking-widest shrink-0">{data?.enRetard?.length || 0} CRITIQUES</span>
            </div>
            
            <div className="space-y-4 lg:space-y-6">
              {data?.enRetard?.length > 0 ? (
                data.enRetard.map((action: any) => <ActionRow key={action.ACT_Id} action={action} />)
              ) : (
                <div className="text-center py-20 lg:py-32 border-4 border-dashed border-white/5 rounded-[3rem] bg-emerald-500/5 group">
                  <CheckCircle2 size={60} className="mx-auto text-emerald-500 mb-6 transition-transform group-hover:scale-110" />
                  <p className="text-emerald-500 font-black uppercase italic tracking-[0.3em] lg:tracking-[0.5em] text-[10px] lg:text-sm m-0 px-4">SMI INTÉGRITÉ OK : Zéro retard critique détecté</p>
                </div>
              )}
            </div>
          </div>

          {/* 📊 SECTION : CHARGE PILOTES & EFFORT SDE */}
          <aside className="col-span-12 lg:col-span-4 bg-[#0F172A]/60 border border-white/5 rounded-[3rem] lg:rounded-[5rem] p-8 lg:p-16 shadow-2xl text-left backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 lg:p-12 opacity-5 rotate-12 pointer-events-none"><TrendingUp size={140} /></div>
            
            <h3 className="text-xl lg:text-2xl font-black uppercase italic mb-10 lg:mb-14 text-blue-500 flex items-center gap-4 relative z-10 m-0">
              <Users size={28} /> Effort par Pilote
            </h3>
            
            <div className="space-y-8 lg:space-y-12 relative z-10">
              {data?.chargeTravail?.map(([name, count]: any) => (
                <div key={name} className="group">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] lg:text-[12px] font-black text-slate-300 uppercase italic tracking-widest lg:tracking-[0.2em] group-hover:text-white transition-colors truncate">{name}</span>
                    <span className="text-[10px] lg:text-[12px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 lg:px-4 lg:py-1.5 rounded-xl border border-blue-500/20 shrink-0 ml-2">{count} ACT.</span>
                  </div>
                  <div className="w-full bg-[#0B0F1A] h-3 lg:h-4 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]" style={{ width: `${(count / (data.total || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
              {(!data?.chargeTravail || data.chargeTravail.length === 0) && (
                <p className="text-xs font-black italic text-slate-600 uppercase text-center py-10 opacity-50">Aucun pilote assigné</p>
              )}
            </div>

            <div className="mt-12 lg:mt-20 p-6 lg:p-10 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4 lg:gap-6 group hover:border-blue-500/30 transition-all cursor-help">
               <BarChart3 className="text-blue-500 group-hover:scale-110 transition-transform shrink-0" size={24} />
               <div className="text-left">
                  <p className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-1 m-0">Index de Performance</p>
                  <p className="text-sm lg:text-lg font-black uppercase text-white tracking-tighter italic m-0">SDE ANALYTICS v2.6</p>
               </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        @media print { body { visibility: hidden; } .flex-1 { visibility: visible; position: absolute; left: 0; top: 0; background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; } * { text-shadow: none !important; box-shadow: none !important; } }
        ::-webkit-scrollbar { display: none !important; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.1)]",
    red: "text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.1)]",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]",
  };
  return (
    <div className="bg-[#0F172A]/40 border border-white/5 p-8 lg:p-12 rounded-4xl lg:rounded-[4rem] transition-all group hover:bg-slate-900/60 text-left">
      <div className={cn("w-16 h-16 lg:w-20 lg:h-20 rounded-3xl flex items-center justify-center mb-6 lg:mb-10 border transition-all group-hover:rotate-12 group-hover:scale-110", colors[color])}>
        <Icon size={32} strokeWidth={2.5} className="lg:w-10 lg:h-10" />
      </div>
      <p className="text-[9px] lg:text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] lg:tracking-[0.5em] mb-2 lg:mb-4 italic opacity-60 leading-none m-0">{title}</p>
      <p className="text-5xl lg:text-7xl font-black italic tracking-tighter leading-none text-white m-0">{value}</p>
    </div>
  );
}

function ActionRow({ action }: { action: any }) {
  const deadline = action.ACT_Deadline ? new Date(action.ACT_Deadline) : null;
  const formattedDate = deadline && !isNaN(deadline.getTime()) ? deadline.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "NON DÉFINIE";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 lg:p-10 bg-white/5 rounded-4xl border border-transparent hover:border-white/10 hover:bg-white/10 transition-all group cursor-pointer relative overflow-hidden gap-6">
      <div className="flex gap-4 lg:gap-8 items-center relative z-10 w-full sm:w-auto">
        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-red-600/10 rounded-xl flex items-center justify-center font-black text-red-500 italic border border-red-600/20 text-lg shadow-lg group-hover:bg-red-600 group-hover:text-white transition-all shrink-0">!</div>
        <div className="text-left min-w-0">
          <p className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter group-hover:text-red-400 transition-colors m-0 truncate leading-none">{action.ACT_Title}</p>
          <div className="flex flex-wrap items-center gap-3 lg:gap-4 mt-2 lg:mt-3">
             <span className="flex items-center gap-1.5 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase italic tracking-widest truncate">
              <User size={12} className="text-blue-500" /> {action.ACT_Responsable?.U_FirstName || 'PILOTE'} {action.ACT_Responsable?.U_LastName || 'INCONNU'}
            </span>
            <span className="text-[8px] lg:text-[9px] text-slate-500 uppercase font-black tracking-widest border border-white/10 px-2 py-1 rounded-md">ID: {action.ACT_Id?.slice(0, 8)}</span>
          </div>
        </div>
      </div>
      <div className="text-left sm:text-right relative z-10 w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end">
        <div className="flex items-center gap-2 mb-0 sm:mb-2">
            <Calendar size={12} className="text-red-500" />
            <p className="text-[10px] lg:text-[12px] font-black text-red-500 italic uppercase tracking-tighter leading-none m-0">ÉCHÉANCE : {formattedDate}</p>
        </div>
        <p className={cn("text-[8px] lg:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block italic border m-0", action.ACT_Priority === 'HAUTE' || action.ACT_Priority === 'URGENT' || action.ACT_Priority === 'CRITICAL' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/5 border-white/10 text-slate-400")}>
            {action.ACT_Priority || 'PRIORITÉ STANDARD'}
        </p>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-1 lg:w-2 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}