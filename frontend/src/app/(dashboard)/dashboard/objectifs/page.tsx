/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🎯 MODULE : PILOTAGE DES OBJECTIFS QUALITÉ §6.2 (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Définition, suivi et mesure de l'efficacité stratégique.
 * DESIGN : Elite High-Density, 100dvh, Zéro Scroll Global, ClickUp Style.
 * FIX : Intégration locale du LoadingScreen pour éviter l'erreur de référence.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 12:08 GMT
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import {
  Target, CheckCircle2, Plus, 
  Calendar, RefreshCw, Trash2, Edit3, 
  BarChart2, User
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { format, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function QualityObjectivesPage() {
  const [objectives, setObjectives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({ status: 'ALL', search: '' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/quality-objectives');
      const data = res.data?.data || res.data || [];
      setObjectives(Array.isArray(data) ? data : []);
    } catch {
      toast.error('RUPTURE DE LIAISON AU REGISTRE STRATÉGIQUE');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => {
    const total = objectives.length;
    const achieved = objectives.filter(o => o.QO_Status === 'ATTEINT').length;
    const avg = total > 0 ? Math.round(objectives.reduce((acc, o) => acc + o.QO_Progress, 0) / total) : 0;
    return { total, achieved, avg };
  }, [objectives]);

  // --- 🛰️ COMPOSANT DE CHARGEMENT SCELLÉ ---
  if (loading) return <LoadingScreen label="Synchronisation Stratégique §6.2..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />

      {/* 🔝 HEADER TACTIQUE */}
      <header className="shrink-0 p-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-8 bg-[#0B0F1A]/95 backdrop-blur-xl z-40 mt-12 lg:mt-0">
        <div className="text-left space-y-3">
          <div className="flex items-center gap-4">
            <span className="bg-blue-600/10 border border-blue-500/20 px-4 py-1 rounded-xl text-[9px] tracking-widest text-blue-500 flex items-center gap-2">
              <Target size={12} /> ISO 9001 §6.2
            </span>
            <span className="text-slate-500 text-[9px] tracking-[0.4em] italic">{stats.total} OBJECTIFS INDEXÉS</span>
          </div>
          <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Pilotage <span className="text-blue-600">Objectifs</span></h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden md:flex rounded-2xl border border-white/10 bg-black/40 p-1">
                <button onClick={() => setViewMode('grid')} className={cn("px-6 py-2 rounded-xl text-[9px] transition-all border-none cursor-pointer", viewMode === 'grid' ? "bg-blue-600 text-white" : "text-slate-500")}>GRILLE</button>
                <button onClick={() => setViewMode('list')} className={cn("px-6 py-2 rounded-xl text-[9px] transition-all border-none cursor-pointer", viewMode === 'list' ? "bg-blue-600 text-white" : "text-slate-500")}>LISTE</button>
            </div>
            <button className="bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-3xl text-[10px] flex items-center gap-3 transition-all border-none cursor-pointer text-white italic shadow-4xl active:scale-95">
                <Plus size={18} /> Déployer Objectif
            </button>
        </div>
      </header>

      {/* 📊 KPI DASH ROW */}
      <div className="shrink-0 p-8 pb-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        <ObjectiveStat label="Total Objectifs" val={stats.total} icon={Target} color="blue" />
        <ObjectiveStat label="Taux Atteinte" val={`${stats.achieved}/${stats.total}`} icon={CheckCircle2} color="emerald" />
        <div className="md:col-span-2 bg-[#151B2B] rounded-[2.5rem] p-7 border-2 border-white/5 flex flex-col justify-between shadow-4xl">
          <div className="flex justify-between items-center mb-4">
             <span className="text-[10px] text-slate-500 tracking-widest leading-none">Progression Moyenne du SMI</span>
             <BarChart2 size={18} className="text-blue-500" />
          </div>
          <div className="flex items-end gap-5">
             <span className="text-5xl leading-none text-white tracking-tighter">{stats.avg}%</span>
             <div className="flex-1 h-3 bg-black/40 rounded-full mb-1 overflow-hidden">
                <div className="h-full bg-blue-600 shadow-[0_0_15px_#2563eb] transition-all duration-1000" style={{ width: `${stats.avg}%` }} />
             </div>
          </div>
        </div>
      </div>

      {/* 📋 LISTE DES OBJECTIFS (Scroll Isolé) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
          {objectives.length > 0 ? objectives.map(obj => (
            <div key={obj.QO_Id} className="bg-[#151B2B] border-2 border-white/5 rounded-[4rem] p-10 hover:border-blue-500/30 transition-all flex flex-col justify-between shadow-4xl group relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Target size={200} /></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                   <span className={cn(
                     "px-5 py-2 rounded-xl text-[9px] tracking-widest border",
                     obj.QO_Status === 'ATTEINT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-600/10 text-blue-500 border-blue-500/20'
                   )}>{obj.QO_Status}</span>
                   <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <Edit3 size={18} className="text-slate-500 cursor-pointer hover:text-white" />
                      <Trash2 size={18} className="text-rose-500 cursor-pointer hover:text-white" />
                   </div>
                </div>
                <h3 className="text-3xl tracking-tighter leading-none m-0 mb-4 group-hover:text-blue-500 transition-colors uppercase">{obj.QO_Title}</h3>
                <p className="text-[11px] text-slate-500 normal-case italic font-bold leading-relaxed mb-10 line-clamp-3">{obj.QO_Description}</p>
              </div>
              
              <div className="relative z-10 space-y-8">
                <div className="flex flex-col gap-3">
                   <div className="flex justify-between text-[10px] tracking-widest text-slate-400"><span>Cible : {obj.QO_Target}</span><span>{obj.QO_Progress}%</span></div>
                   <div className="h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div className={cn("h-full rounded-full transition-all duration-1000", obj.QO_Progress >= 100 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]")} style={{ width: `${obj.QO_Progress}%` }} />
                   </div>
                </div>
                
                <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-blue-500"><User size={14} /></div>
                      <span className="text-[10px] text-slate-500 tracking-widest">{obj.QO_OwnerName || 'PILOTE'}</span>
                   </div>
                   <span className={cn("text-[9px] flex items-center gap-2 tracking-widest", isPast(new Date(obj.QO_Deadline)) && obj.QO_Status !== 'ATTEINT' ? 'text-red-500 animate-pulse' : 'text-slate-600')}>
                      <Calendar size={12} /> {format(new Date(obj.QO_Deadline), 'dd MMM yyyy', { locale: fr })}
                   </span>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full h-96 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[5rem] opacity-20">
               <Target size={80} className="mb-6" />
               <p className="tracking-[0.5em] text-xl">Aucun Objectif Stratégique Déployé</p>
            </div>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

// --- 🧩 SOUS-COMPOSANTS D'ARCHITECTURE ---

function ObjectiveStat({ label, val, icon: Icon, color }: any) {
  const c: any = { blue: "text-blue-500 bg-blue-500/10 border-blue-500/20", emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
  return (
    <div className="bg-[#151B2B] p-8 rounded-[3rem] border-2 border-white/5 flex items-center gap-6 shadow-4xl transition-all hover:-translate-y-1">
      <div className={cn("p-5 rounded-2xl shadow-inner", c[color])}><Icon size={28} /></div>
      <div className="text-left">
        <p className="text-[10px] text-slate-500 tracking-widest mb-2 leading-none italic m-0">{label}</p>
        <p className="text-4xl font-black italic m-0 tracking-tighter text-white leading-none">{val}</p>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}
