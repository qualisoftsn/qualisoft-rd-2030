/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🚀 MODULE : AMÉLIORATION CONTINUE §10 (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage du Registre des Actions et Cycle PDCA Matrix.
 * DESIGN : 100dvh, Dark Matrix, High-Density, Zero Global Scroll.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 15:38 GMT
 */

'use client';

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Target, ShieldAlert, ClipboardCheck, List, Plus, Filter, TrendingUp,
  Clock, CheckCircle2, AlertCircle, ArrowRight, Search, LayoutGrid, Loader2, RefreshCcw
} from 'lucide-react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

function ImprovementHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams ? searchParams.get('tab') : 'overview';
  
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || 'overview');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/improvement/hub-stats');
      setStats(res.data?.data || res.data);
    } catch {
      toast.error("HUB AMÉLIORATION : MODE DÉGRADÉ (DÉFAUT SYNC)");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/dashboard/improvement?tab=${tab}`, { scroll: false });
  };

  if (loading) return <LoadingScreen label="Synchronisation Hub Amélioration §10..." />;

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      {/* 🔝 HEADER FIXE GÉANT */}
      <header className="shrink-0 bg-[#0B0F1A]/95 backdrop-blur-xl border-b border-white/5 p-8 lg:p-10 z-40 mt-12 lg:mt-0">
        <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-8">
          <div className="text-left space-y-3">
            <div className="flex items-center gap-4">
               <div className="bg-blue-600/10 p-3 rounded-2xl border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]"><Target className="text-blue-500" size={32} /></div>
               <h1 className="text-4xl lg:text-5xl tracking-tighter leading-none m-0">Amélioration <span className="text-blue-600">Continue</span></h1>
            </div>
            <p className="text-slate-500 text-[10px] tracking-[0.4em] m-0 italic">ISO 9001 §10 • Maîtrise des Actions Matrix CORE</p>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="bg-black/40 p-1.5 rounded-2xl flex border border-white/10 shadow-inner">
              <button onClick={() => setViewMode('list')} className={cn("p-3 rounded-xl transition-all border-none cursor-pointer", viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white')}><List size={18} /></button>
              <button onClick={() => setViewMode('kanban')} className={cn("p-3 rounded-xl transition-all border-none cursor-pointer", viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white')}><LayoutGrid size={18} /></button>
            </div>
            <Link href="/dashboard/improvement/actions/new" className="bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-3xl font-black text-[11px] transition-all shadow-4xl border-none text-white no-underline flex items-center gap-3">
              <Plus size={18} strokeWidth={3} /> Nouvelle Action
            </Link>
          </div>
        </div>

        {/* NIVEAU NAVIGATION SECONDAIRE */}
        <nav className="mt-10 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { id: 'overview', label: 'Vue Globale', icon: TrendingUp },
            { id: 'actions', label: 'Registre Actions', icon: ShieldAlert },
            { id: 'plans', label: 'Plans Traitement', icon: ClipboardCheck },
            { id: 'paq', label: 'PAQ Annuel', icon: Target },
          ].map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={cn("flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] transition-all border-none italic whitespace-nowrap cursor-pointer", activeTab === tab.id ? 'bg-slate-800 text-blue-400 shadow-xl border border-white/10' : 'text-slate-500 hover:text-white bg-transparent')}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* 📜 ZONE DE TRAVAIL SCROLLABLE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-10">
        {activeTab === 'overview' && <OverviewSection stats={stats} />}
        {activeTab === 'actions' && <ActionsList />}
        {activeTab !== 'overview' && activeTab !== 'actions' && (
           <div className="h-full flex items-center justify-center opacity-20 border-2 border-dashed border-white/5 rounded-[4rem]">
              <p className="text-xl tracking-[0.5em]">Module {activeTab} en cours de scellage...</p>
           </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.1); border-radius: 10px; }` }} />
    </div>
  );
}

function OverviewSection({ stats }: any) {
  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        <MetricCard title="Actions Actives" val={stats?.totalActions || 0} trend="+12%" icon={ShieldAlert} color="blue" />
        <MetricCard title="En Retard" val={stats?.enRetard || 0} trend="Critique" icon={Clock} color="rose" />
        <MetricCard title="Efficacité" val={`${stats?.tauxEfficacite || 84}%`} trend="+5%" icon={CheckCircle2} color="emerald" />
        <MetricCard title="Plans NC" val={stats?.activePlans || 0} trend="En cours" icon={ClipboardCheck} color="amber" />
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 xl:col-span-8 bg-[#151B2B] border-2 border-white/5 rounded-[4rem] p-12 shadow-4xl text-left flex flex-col gap-10">
          <h3 className="text-xl font-black m-0 flex items-center gap-4"><Filter size={20} className="text-blue-500" /> Répartition par Origine Matrix</h3>
          <div className="space-y-10">
            {stats?.sources?.map((source: any, idx: number) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between text-[10px] tracking-widest text-slate-500"><span>{source.origin}</span><span className="text-blue-400">{source.count} ACTIONS</span></div>
                <div className="bg-black/40 rounded-full h-2.5 overflow-hidden shadow-inner border border-white/5">
                  <div className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-1000" style={{ width: `${(source.count / (stats?.totalActions || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 bg-rose-600/5 border-2 border-rose-500/10 rounded-[4rem] p-12 relative overflow-hidden flex flex-col justify-between text-left shadow-4xl group">
          <AlertCircle className="absolute -right-16 -bottom-16 text-rose-500/5 group-hover:scale-110 transition-transform duration-1000" size={300} />
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-rose-500 mb-8 flex items-center gap-4 m-0 leading-none tracking-tighter"><AlertCircle size={28} /> Urgences SMQ</h3>
            <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-4xl hover:bg-rose-500/20 transition-all cursor-pointer shadow-xl">
                <p className="text-[9px] font-black text-rose-500 mb-2 tracking-[0.4em]">Alerte Retard Critique</p>
                <p className="text-lg font-black italic text-white m-0 uppercase leading-tight line-clamp-2">Protocoles de sécurité §7.1.3 : Mise à jour expirée.</p>
            </div>
          </div>
          <button className="text-[10px] font-black text-slate-400 hover:text-white bg-transparent border-none cursor-pointer flex items-center gap-3 mt-10 tracking-[0.3em] uppercase transition-all">Voir le registre critique <ArrowRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function ActionsList() {
  const [actions, setActions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => { 
    apiClient.get('/actions').then(res => setActions(res.data?.data || res.data || [])); 
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action) => (
          <div key={action.ACT_Id} onClick={() => router.push(`/dashboard/improvement/actions/${action.ACT_Id}`)} className="bg-[#151B2B] border-2 border-white/5 p-10 rounded-[4rem] flex items-center justify-between hover:border-blue-500/40 transition-all cursor-pointer shadow-4xl group">
            <div className="flex items-center gap-8 text-left">
              <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><ShieldAlert size={32} /></div>
              <div className="space-y-2">
                <span className="px-4 py-1.5 bg-blue-600/10 text-blue-500 rounded-full text-[9px] border border-blue-500/20 tracking-widest">SDE CORE • ID #{action.ACT_Id?.slice(-4)}</span>
                <h3 className="text-2xl font-black italic m-0 tracking-tighter leading-none text-white group-hover:text-blue-400 transition-colors uppercase truncate max-w-sm">{action.ACT_Title}</h3>
              </div>
            </div>
            <div className="p-5 bg-white/5 rounded-3xl group-hover:bg-blue-600 transition-all"><ArrowRight size={20} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ title, val, trend, icon: Icon, color }: any) {
  const themes: any = { 
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20", 
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20", 
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", 
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20" 
  };
  return (
    <div className="bg-[#151B2B] border-2 border-white/5 p-8 rounded-[3.5rem] flex flex-col justify-between shadow-4xl group hover:scale-[1.02] transition-all text-left">
      <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-8 border", themes[color])}><Icon size={28} /></div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-slate-500 tracking-widest mb-2 italic m-0 leading-none">{title}</p>
          <p className="text-5xl font-black italic tracking-tighter leading-none text-white m-0">{val}</p>
        </div>
        <span className={cn("text-[9px] font-black uppercase px-4 py-2 rounded-xl italic tracking-widest shadow-inner", trend?.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-500')}>{trend}</span>
      </div>
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6 lg:pl-72 text-blue-500">
      <RefreshCcw className="animate-spin" size={60} strokeWidth={1} />
      <span className="text-[10px] font-black uppercase tracking-[1em] animate-pulse italic">{label}</span>
    </div>
  );
}

export default function ImprovementHubPage() {
  return <Suspense fallback={<LoadingScreen label="Chargement Hub..." />}><ImprovementHubContent /></Suspense>;
}