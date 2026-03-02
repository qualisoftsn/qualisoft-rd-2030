/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🚀 MODULE : AMÉLIORATION CONTINUE (HUB MATRIX)
 * Rôle : Pilotage §10 • Registre des Actions & PDCA Cycle.
 * Design : Dark Matrix High-Density.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:41 GMT
 */

'use client';

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Target, ShieldAlert, ClipboardCheck, List, Plus, Filter, TrendingUp,
  Clock, CheckCircle2, AlertCircle, ArrowRight, Search, LayoutGrid, Loader2, X
} from 'lucide-react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';

type TabView = 'overview' | 'actions' | 'plans' | 'paq' | 'by-process';
type ViewMode = 'kanban' | 'list';

function ImprovementHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams ? searchParams.get('tab') : 'overview';
  
  const [activeTab, setActiveTab] = useState<TabView>(tabFromUrl as TabView);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/improvement/hub-stats');
      setStats(res.data?.data || res.data);
    } catch {
      toast.error("Hub Amélioration : Mode dégradé (Défaut Sync)");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleTabChange = (tab: TabView) => {
    setActiveTab(tab);
    router.push(`/dashboard/improvement?tab=${tab}`, { scroll: false });
  };

  if (loading) return (
    <div className="ml-0 lg:ml-72 flex h-screen items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase tracking-[0.5em] animate-pulse">
      <Loader2 className="animate-spin mr-4" /> Hub Amélioration...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-0 lg:ml-72 flex flex-col relative overflow-hidden selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" />
      
      <header className="sticky top-0 z-40 bg-[#0B0F1A]/90 backdrop-blur-xl border-b border-white/5 px-8 lg:px-10 py-8 gap-8 mt-12 lg:mt-0">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between xl:items-end gap-8">
          <div className="text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-500/20"><Target className="text-blue-500" size={24} /></div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none m-0">Amélioration <span className="text-blue-600">Continue</span></h1>
            </div>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] m-0 italic">ISO 9001 §10 • Maîtrise des Actions Matrix CORE</p>
          </div>
          
          <div className="flex items-center gap-4 justify-center">
            <div className="bg-white/5 p-1 rounded-2xl flex border border-white/5">
              <button onClick={() => setViewMode('list')} className={cn("p-3 rounded-xl transition-all border-none cursor-pointer", viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white')}><List size={18} /></button>
              <button onClick={() => setViewMode('kanban')} className={cn("p-3 rounded-xl transition-all border-none cursor-pointer", viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white')}><LayoutGrid size={18} /></button>
            </div>
            <Link href="/dashboard/improvement/actions/new" className="bg-blue-600 hover:bg-white hover:text-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-3xl border-none text-white italic active:scale-95"><Plus size={16} /> Nouvelle Action</Link>
          </div>
        </div>

        <nav className="max-w-7xl mx-auto mt-8 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { id: 'overview', label: 'Vue Globale', icon: TrendingUp },
            { id: 'actions', label: 'Registre Actions', icon: ShieldAlert },
            { id: 'plans', label: 'Plans Traitement', icon: ClipboardCheck },
            { id: 'paq', label: 'PAQ Annuel', icon: Target },
            { id: 'by-process', label: 'Vue Processus', icon: Filter },
          ].map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id as TabView)} className={cn("flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase text-[10px] transition-all border-none italic whitespace-nowrap cursor-pointer", activeTab === tab.id ? 'bg-slate-800 text-blue-400 shadow-xl' : 'text-slate-500 hover:text-white')}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-10 flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'overview' && <OverviewSection stats={stats} />}
        {activeTab === 'actions' && <ActionsList viewMode={viewMode} />}
        {activeTab === 'plans' && <PlansList />}
        {activeTab === 'paq' && <PaqList />}
        {activeTab === 'by-process' && <ProcessView />}
      </main>
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }`}</style>
    </div>
  );
}

function OverviewSection({ stats }: any) {
  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        <MetricCard title="Actions Actives" value={stats?.totalActions || 0} trend="+12%" icon={ShieldAlert} color="blue" />
        <MetricCard title="En Retard" value={stats?.enRetard || 0} trend="Critique" icon={Clock} color="red" />
        <MetricCard title="Efficacité" value={`${stats?.tauxEfficacite || 84}%`} trend="+5%" icon={CheckCircle2} color="emerald" />
        <MetricCard title="Plans NC" value={stats?.activePlans || 0} trend="En cours" icon={ClipboardCheck} color="amber" />
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 xl:col-span-8 bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 backdrop-blur-md text-left">
          <h3 className="text-lg font-black uppercase italic mb-8 flex items-center gap-4 m-0"><Filter size={18} className="text-blue-500" /> Répartition par Origine Matrix</h3>
          <div className="space-y-8">
            {stats?.sources?.map((source: any, idx: number) => (
              <div key={idx} className="flex items-center gap-8">
                <span className="text-[10px] font-black uppercase text-slate-500 w-40 italic tracking-widest">{source.origin}</span>
                <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden shadow-inner">
                  <div className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-1000" style={{ width: `${(source.count / (stats?.totalActions || 1)) * 100}%` }} />
                </div>
                <span className="text-sm font-black italic text-blue-400 w-12">{source.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 bg-red-600/5 border border-red-500/10 rounded-[3.5rem] p-10 relative overflow-hidden flex flex-col justify-between text-left">
          <AlertCircle className="absolute -right-10 -bottom-10 text-red-500/5" size={240} />
          <div>
            <h3 className="text-lg font-black uppercase italic mb-8 text-red-500 flex items-center gap-3 m-0"><AlertCircle size={20} /> Urgences SMQ</h3>
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl hover:bg-red-500/20 transition-all cursor-pointer group shadow-xl relative z-10">
               <p className="text-[9px] font-black text-red-500 uppercase italic mb-2 tracking-[0.2em] leading-none">Alerte Retard Critique</p>
               <p className="text-sm font-bold italic leading-tight text-white/90 m-0 uppercase line-clamp-2">Mise à jour urgente des protocoles de sécurité §7.1.3</p>
            </div>
          </div>
          <button className="text-[10px] font-black text-slate-400 hover:text-white uppercase italic transition-all border-none bg-transparent cursor-pointer flex items-center gap-2 mt-8 tracking-widest">Voir le registre critique <ArrowRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon: Icon, color }: any) {
  const colors: any = { blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20', red: 'text-red-500 bg-red-500/10 border-red-500/20', emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
  return (
    <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[3rem] group hover:border-blue-600/30 transition-all shadow-2xl backdrop-blur-sm text-left relative overflow-hidden">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${colors[color]}`}><Icon size={28} /></div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 italic leading-none m-0">{title}</p>
          <p className="text-5xl font-black italic tracking-tighter leading-none text-white m-0">{value}</p>
        </div>
        <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl italic ${trend?.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-400'}`}>{trend}</span>
      </div>
    </div>
  );
}

function ActionsList({ viewMode }: { viewMode: ViewMode }) {
  const [actions, setActions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => { apiClient.get('/actions').then(res => setActions(res.data?.data || res.data || [])); }, []);

  const filtered = actions.filter(a => (a.ACT_Title || "").toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 bg-white/2 p-6 rounded-[3rem] border border-white/5 items-center backdrop-blur-sm">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input type="text" placeholder="RECHERCHER DANS LE REGISTRE PDCA..." className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-[10px] font-black uppercase italic outline-none focus:border-blue-500 text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="bg-slate-950 border border-white/10 rounded-2xl px-8 py-5 text-[10px] font-black uppercase italic text-slate-500 outline-none cursor-pointer appearance-none w-full sm:w-auto min-w-48"><option>Tous Processus</option></select>
      </div>

      <div className="space-y-4">
        {filtered.map((action) => (
          <div key={action.ACT_Id} onClick={() => router.push(`/dashboard/improvement/actions/${action.ACT_Id}`)} className="group bg-slate-900/40 border border-white/5 p-8 rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between hover:bg-slate-900/80 hover:border-blue-600/30 transition-all cursor-pointer shadow-xl text-left gap-6">
            <div className="flex items-center gap-10 flex-1 w-full">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><ShieldAlert size={28} /></div>
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 italic tracking-widest uppercase m-0 border border-blue-600/20 leading-none">SDE CORE</span>
                  <span className="text-[9px] font-black text-slate-600 uppercase italic tracking-widest leading-none">ID #{action.ACT_Id?.slice(-4)}</span>
                </div>
                <h3 className="text-xl font-black uppercase italic text-white group-hover:text-blue-500 transition-colors m-0 truncate tracking-tighter leading-none">{action.ACT_Title}</h3>
              </div>
            </div>
            <div className="bg-blue-600/10 text-blue-500 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg shrink-0"><ArrowRight size={20} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export default function ImprovementHubPage() {
  return <Suspense fallback={null}><ImprovementHubContent /></Suspense>;
}

// Stubs pour la compilation (À implémenter selon sessions/page.tsx)
function PlansList() { return <div className="py-20 text-slate-500 font-black italic uppercase text-xs tracking-widest">Registre des Plans de Traitement NC Matrix...</div>; }
function PaqList() { return <div className="py-20 text-slate-500 font-black italic uppercase text-xs tracking-widest">Plans d&apos;Actions Qualité Annuels...</div>; }
function ProcessView() { return <div className="py-20 text-slate-500 font-black italic uppercase text-xs tracking-widest">Cartographie Transverse des Actions...</div>; }