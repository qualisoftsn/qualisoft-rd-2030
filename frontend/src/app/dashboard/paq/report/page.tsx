/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 📊 MODULE : REPORTING ANALYTIQUE PAQ — ÉDITION ÉLITE
 * -------------------------------------------------------------------------
 * RÔLE : Analyse et évaluation de la performance (§9.1.3 ISO 9001).
 * USAGE : Revue de performance et préparation des rapports d'audit.
 * ARCHITECTURE : Full-Space Occupancy Dashboard.
 * -------------------------------------------------------------------------
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  ShieldAlert, CheckCircle2, Clock, Users, 
  Target, Loader2, User, Printer, Plus,
  Activity, ArrowRight, BarChart3, TrendingUp, Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';

// --- 🛠️ UTILITAIRES SDE ---
const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export default function PAQReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  /**
   * 🛰️ EXTRACTION ANALYTIQUE (§9.1.3)
   */
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/paq/dashboard');
      const stats = res.data?.data || res.data;
      setData(stats);
    } catch (error: unknown) {
      console.error("❌ Erreur Dashboard PAQ:", error);
      toast.error("Rupture de flux analytique.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0B0F1A] ml-72 gap-6">
      <Loader2 className="animate-spin text-blue-500" size={50} />
      <p className="text-blue-500 font-black uppercase italic text-[11px] tracking-[0.6em] animate-pulse">
        Compilation des données SMI...
      </p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0B0F1A] min-h-screen p-16 ml-72 text-white font-sans italic text-left selection:bg-blue-600/30 overflow-x-hidden">
      <Toaster position="top-right" richColors />
      
      <div className="w-full max-w-500 mx-auto space-y-20 animate-in fade-in duration-700">
        
        {/* 🔝 HEADER COCKPIT ANALYTIQUE */}
        <header className="flex justify-between items-end border-b-2 border-white/5 pb-12">
          <div className="space-y-6">
            <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none text-white">
              PLAN D&apos;ACTIONS <span className="text-blue-600 italic">QUALITÉ</span>
            </h1>
            <p className="text-blue-400 font-bold text-[12px] uppercase tracking-[0.5em] mt-3 italic opacity-80">
              Pilotage de la Performance & Amélioration Continue (§9.1.3)
            </p>
          </div>
          
          <div className="flex gap-8">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-4 px-10 py-6 rounded-4xl border-2 border-white/5 hover:bg-white hover:text-slate-900 text-slate-400 font-black uppercase italic text-[11px] transition-all shadow-xl"
            >
              <Printer size={20} /> Lancer Rapport PDF
            </button>
            <button 
              onClick={() => router.push('/dashboard/paq/nouveau')}
              className="flex items-center gap-4 bg-blue-600 hover:bg-white hover:text-slate-900 text-white px-12 py-6 rounded-4xl font-black uppercase italic text-[11px] transition-all shadow-2xl border-none active:scale-95"
            >
              <Plus size={22} strokeWidth={3} /> Nouvelle Action Corrective
            </button>
          </div>
        </header>

        {/*  */}

        {/* 📊 COMPTEURS HAUTE DÉFINITION (§10.2 / §10.3) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <StatCard title="ACTIONS TOTALES" value={data?.total || 0} icon={Target} color="blue" />
          <StatCard title="RETARDS CRITIQUES" value={data?.enRetard?.length || 0} icon={ShieldAlert} color="red" />
          <StatCard title="EN ATTENTE" value={data?.aValider?.length || 0} icon={Clock} color="orange" />
          <StatCard title="CLÔTURÉES SDE" value={data?.cloturees?.length || 0} icon={CheckCircle2} color="emerald" />
        </div>

        <div className="grid grid-cols-12 gap-16 items-start">
          
          {/* 🧨 SECTION : RADAR DES URGENCES (§10.2) */}
          <div className="col-span-12 lg:col-span-8 bg-[#0F172A]/40 border-2 border-white/5 p-16 rounded-[5rem] backdrop-blur-3xl shadow-4xl text-left">
            <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
               <h3 className="text-3xl font-black uppercase italic flex items-center gap-6">
                 <span className="w-2 h-10 bg-red-600 rounded-full animate-pulse"></span> 
                 Analyse des Écarts & Retards
               </h3>
               <span className="text-[11px] font-black text-red-500 uppercase tracking-widest">{data?.enRetard?.length || 0} CRITIQUES</span>
            </div>
            
            <div className="space-y-6">
              {data?.enRetard?.length > 0 ? (
                data.enRetard.map((action: any) => (
                  <ActionRow key={action.ACT_Id} action={action} />
                ))
              ) : (
                <div className="text-center py-32 border-4 border-dashed border-white/5 rounded-[4rem] bg-emerald-500/5 group">
                  <CheckCircle2 size={80} className="mx-auto text-emerald-500 mb-8 transition-transform group-hover:scale-110" />
                  <p className="text-emerald-500 font-black uppercase italic tracking-[0.5em] text-sm">
                    SMI INTÉGRITÉ OK : Zéro retard critique détecté
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 📊 SECTION : CHARGE PILOTES & EFFORT SDE */}
          <aside className="col-span-12 lg:col-span-4 bg-[#0F172A]/60 border-2 border-white/5 rounded-[5rem] p-16 shadow-4xl text-left backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12"><TrendingUp size={180} /></div>
            
            <h3 className="text-2xl font-black uppercase italic mb-14 text-blue-500 flex items-center gap-6 relative z-10">
              <Users size={32} /> Effort par Pilote
            </h3>
            
            <div className="space-y-12 relative z-10">
              {data?.chargeTravail?.map(([name, count]: any) => (
                <div key={name} className="group">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[12px] font-black text-slate-300 uppercase italic tracking-[0.2em] group-hover:text-white transition-colors">{name}</span>
                    <span className="text-[12px] font-black text-blue-500 bg-blue-500/10 px-4 py-1.5 rounded-xl border border-blue-500/20">{count} ACT.</span>
                  </div>
                  <div className="w-full bg-[#0B0F1A] h-4 rounded-full overflow-hidden p-1 border border-white/5 shadow-inner">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-[2s] ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                      style={{ width: `${(count / (data.total || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-20 p-10 bg-white/2 rounded-4xl border border-white/5 flex items-center gap-6 group hover:border-blue-500/20 transition-all cursor-help">
               <BarChart3 className="text-blue-500 group-hover:scale-110 transition-transform" size={28} />
               <div className="text-left">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Index de Performance</p>
                  <p className="text-lg font-black uppercase text-white tracking-tighter italic">SDE ANALYTICS v2.6</p>
               </div>
            </div>
          </aside>
        </div>
      </div>

      {/* 🧩 STYLES MATRIX CUSTOM */}
      <style jsx global>{`
        ::-webkit-scrollbar { display: none !important; }
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
    </div>
  );
}

/** 📊 COMPOSANT : CARTE STATISTIQUE HAUTE FIDÉLITÉ */
function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-[0_0_40px_rgba(37,99,235,0.1)]",
    red: "text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-[0_0_40px_rgba(249,115,22,0.1)]",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]",
  };
  return (
    <div className="bg-[#0F172A]/40 border border-white/5 p-12 rounded-[4rem] transition-all group hover:bg-slate-900/60 text-left">
      <div className={cn("w-20 h-20 rounded-4xl flex items-center justify-center mb-10 border-2 transition-all group-hover:rotate-12 group-hover:scale-110", colors[color])}>
        <Icon size={40} strokeWidth={2.5} />
      </div>
      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4 italic opacity-60 leading-none">{title}</p>
      <p className="text-7xl font-black italic tracking-tighter leading-none text-white">{value}</p>
    </div>
  );
}

/** 📋 COMPOSANT : LIGNE D'ACTION (RADAR URGENCES) */
function ActionRow({ action }: { action: any }) {
  // ✅ CORRECTIF LIGNE 215 : Sécurisation de la Date d'échéance
  const deadline = action.ACT_Deadline ? new Date(action.ACT_Deadline) : null;
  const formattedDate = deadline && !isNaN(deadline.getTime()) 
    ? deadline.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
    : "NON DÉFINIE";

  return (
    <div className="flex items-center justify-between p-10 bg-white/2 rounded-[3rem] border-2 border-transparent hover:border-white/5 hover:bg-white/5 transition-all group cursor-pointer relative overflow-hidden">
      <div className="flex gap-8 items-center relative z-10">
        <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex items-center justify-center font-black text-red-600 italic border border-red-600/20 text-xl shadow-lg group-hover:bg-red-600 group-hover:text-white transition-all">!</div>
        <div className="text-left">
          <p className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-red-500 transition-colors">{action.ACT_Title}</p>
          <div className="flex items-center gap-4 mt-3">
             <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase italic tracking-widest">
              <User size={14} className="text-blue-500" /> {action.ACT_Responsable?.U_FirstName} {action.ACT_Responsable?.U_LastName}
            </span>
            <span className="text-[9px] text-slate-700 uppercase font-black tracking-widest border border-white/5 px-3 py-1 rounded-lg">ID: {action.ACT_Id?.slice(0, 8)}</span>
          </div>
        </div>
      </div>
      <div className="text-right relative z-10">
        <div className="flex items-center justify-end gap-3 mb-2">
            <Calendar size={14} className="text-red-500" />
            <p className="text-[12px] font-black text-red-500 italic uppercase tracking-tighter leading-none">ÉCHÉANCE : {formattedDate}</p>
        </div>
        <p className={cn(
            "text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mt-2 italic border",
            action.ACT_Priority === 'HAUTE' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/5 border-white/10 text-slate-500"
        )}>
            {action.ACT_Priority || 'PRIORITÉ STANDARD'}
        </p>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-2 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}