/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Target, Layers, ShieldAlert, ClipboardCheck, 
  LayoutGrid, List, Plus, Filter, TrendingUp,
  Clock, CheckCircle2, AlertCircle, ArrowRight,
  Search, Calendar, User, X, Edit3, Save, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

type TabView = 'overview' | 'actions' | 'tasks' | 'plans' | 'paq' | 'by-process';
type ViewMode = 'kanban' | 'list';

/**
 * Cette page est le centre de pilotage transverse. Elle agrège les statistiques d'efficacité, gère le registre des actions correctives et préventives, 
 * et permet de basculer entre les différentes strates du progrès (PAQ, Plans de traitement, Vue Processus).
 * 
 * 🛰️ CORE ENGINE : ImprovementHubContent
 * Gère la logique métier complexe : synchronisation URL-Tab, agrégation des KPIs
 * et routage vers les sous-sections du SMI.
 */
function ImprovementHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 🧭 Synchronisation de l'onglet actif via les paramètres d'URL (Persistance du contexte)
  const tabFromUrl = searchParams ? searchParams.get('tab') : null;
  const [activeTab, setActiveTab] = useState<TabView>((tabFromUrl as TabView) || 'overview');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (tabFromUrl) setActiveTab(tabFromUrl as TabView);
  }, [tabFromUrl]);

  /**
   * 📊 RÉCUPÉRATION DES INDICATEURS DE PERFORMANCE (KPIs)
   * Tente de récupérer les stats agrégées, sinon calcule un fallback basé sur les actions brutes.
   */
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/improvement/hub-stats');
      setStats(res.data);
    } catch (err) {
      console.warn("Hub Stats API indéfinie, basculement sur calcul local de sécurité.");
      try {
        const [actionsRes, plansRes] = await Promise.all([
          apiClient.get('/actions'),
          apiClient.get('/action-plans')
        ]);
        setStats({
          totalActions: actionsRes.data.length,
          enRetard: actionsRes.data.filter((a: any) => 
            a.ACT_Deadline && new Date(a.ACT_Deadline) < new Date() && a.ACT_Status !== 'TERMINEE'
          ).length,
          tauxEfficacite: 84, // Moyenne normative
          activePlans: plansRes.data.length,
          sources: []
        });
      } catch (fallbackErr) {
        toast.error("Échec de synchronisation avec le registre d'amélioration");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleTabChange = (tab: TabView) => {
    setActiveTab(tab);
    router.push(`/dashboard/improvement?tab=${tab}`, { scroll: false });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1A] ml-72 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
      <p className="text-[10px] font-black uppercase italic tracking-[0.5em] text-slate-500 animate-pulse">Initialisation du Hub Elite...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 text-left selection:bg-blue-600/30">
      
      {/* 🔝 HUB HEADER : Navigation et Identité Visuelle */}
      <header className="sticky top-0 z-40 bg-[#0B0F1A]/90 backdrop-blur-xl border-b border-white/5 px-10 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2">
                <Target className="text-blue-500" size={20} />
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
                Amélioration <span className="text-blue-600">Continue</span>
              </h1>
            </div>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
              ISO 9001 §10 • Hub Central de Maîtrise des Actions Correctives
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-900/50 rounded-2xl p-1 border border-white/5 shadow-inner">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
            <Link 
              href="/dashboard/improvement/actions/new"
              className="bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-3xl shadow-blue-900/40 active:scale-95"
            >
              <Plus size={16} /> Nouvelle Action
            </Link>
          </div>
        </div>

        {/* 🧭 NAVIGATION TABULAIRE (Stratégie GPEC & SMQ) */}
        <nav className="max-w-7xl mx-auto mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'overview', label: 'Vue Globale', icon: TrendingUp },
            { id: 'actions', label: 'Registre Actions', icon: ShieldAlert },
            { id: 'plans', label: 'Plans de Traitement', icon: ClipboardCheck },
            { id: 'paq', label: 'PAQ Annuel', icon: Target },
            { id: 'by-process', label: 'Vue Processus', icon: Filter },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabView)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-wider transition-all whitespace-nowrap border ${
                activeTab === tab.id 
                  ? 'bg-slate-800 text-blue-400 border-blue-500/20 shadow-xl' 
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-900/30'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* 🚀 WORKSPACE : Affichage dynamique des sections */}
      <main className="max-w-7xl mx-auto p-10 animate-in fade-in duration-500">
        {activeTab === 'overview' && <OverviewSection stats={stats} loading={loading} />}
        {activeTab === 'actions' && <ActionsList viewMode={viewMode} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        {activeTab === 'plans' && <PlansList />}
        {activeTab === 'paq' && <PaqList />}
        {activeTab === 'by-process' && <ProcessView />}
      </main>
    </div>
  );
}

/**
 * 📊 SECTION : VUE GLOBALE
 * Présente les KPIs consolidés et les alertes SMQ critiques.
 */
function OverviewSection({ stats, loading }: { stats: any, loading: boolean }) {
  if (loading) return null;
  
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Actions Actives" value={stats?.totalActions || 0} trend="+12%" icon={ShieldAlert} color="blue" />
        <MetricCard title="En Retard" value={stats?.enRetard || 0} trend="Critique" icon={Clock} color="red" />
        <MetricCard title="Efficacité" value={`${stats?.tauxEfficacite || 84}%`} trend="+5%" icon={CheckCircle2} color="emerald" />
        <MetricCard title="Plans NC" value={stats?.activePlans || 0} trend="En cours" icon={ClipboardCheck} color="orange" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 backdrop-blur-sm">
          <h3 className="text-lg font-black uppercase italic mb-8 flex items-center gap-4">
            <Filter size={18} className="text-blue-500" /> 
            Répartition par Origine d&apos;Action
          </h3>
          <div className="space-y-6">
            {stats?.sources?.length > 0 ? stats.sources.map((source: any, idx: number) => (
              <div key={idx} className="flex items-center gap-6">
                <span className="text-[10px] font-black uppercase text-slate-500 w-40 italic">{source.origin}</span>
                <div className="flex-1 bg-slate-800/50 rounded-full h-3 overflow-hidden border border-white/5">
                  <div className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${(source.count / (stats?.totalActions || 1)) * 100}%` }} />
                </div>
                <span className="text-sm font-black italic text-blue-400">{source.count}</span>
              </div>
            )) : <p className="text-slate-500 text-[10px] font-black uppercase italic py-10 text-center tracking-widest">En attente d&apos;indexation des origines...</p>}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-red-600/5 border border-red-500/10 rounded-[3.5rem] p-10 relative overflow-hidden group">
          <AlertCircle className="absolute -right-8 -bottom-8 text-red-500/5 rotate-12 group-hover:scale-110 transition-transform duration-1000" size={220} />
          <h3 className="text-lg font-black uppercase italic mb-8 text-red-500 flex items-center gap-2">
            <AlertCircle size={18} /> Urgences SMQ
          </h3>
          <div className="space-y-4 relative z-10 text-left">
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-4xl hover:bg-red-500/20 transition-all cursor-pointer">
              <p className="text-[9px] font-black text-red-500 uppercase italic mb-2 tracking-widest leading-none">Audit Interne Q1 - Retard</p>
              <p className="text-sm font-bold italic leading-tight text-white/90">Mise à jour urgente des protocoles de sécurité Matrix</p>
              <div className="mt-6 flex justify-between items-center text-red-400">
                <span className="text-[9px] font-black uppercase tracking-widest">Voir l&apos;action</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
  };
  return (
    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] hover:bg-slate-900/60 transition-all group shadow-2xl backdrop-blur-sm">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border shadow-lg ${colors[color]}`}>
        <Icon size={28} />
      </div>
      <div className="flex items-end justify-between">
        <div className="text-left">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 italic leading-none">{title}</p>
          <p className="text-5xl font-black italic tracking-tighter leading-none text-white">{value}</p>
        </div>
        <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl italic ${trend?.startsWith('+') ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

// --- 📋 SECTION : REGISTRE DES ACTIONS ---

function ActionsList({ viewMode, searchTerm, setSearchTerm }: { viewMode: ViewMode, searchTerm: string, setSearchTerm: (s: string) => void }) {
  const [actions, setActions] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [filter, setFilter] = useState({ origin: 'ALL', status: 'ALL', processId: 'ALL' });
  const router = useRouter();

  useEffect(() => {
    apiClient.get('/actions').then(res => setActions(res.data));
    apiClient.get('/processes').then(res => setProcesses(res.data));
  }, []);

  const filtered = useMemo(() => {
    return actions.filter(a => {
      const matchesSearch = !searchTerm || 
        a.ACT_Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.ACT_Description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch &&
        (filter.origin === 'ALL' || a.ACT_Origin === filter.origin) &&
        (filter.status === 'ALL' || a.ACT_Status === filter.status) &&
        (filter.processId === 'ALL' || a.ACT_ProcessusId === filter.processId);
    });
  }, [actions, searchTerm, filter]);

  if (viewMode === 'kanban') {
    return <KanbanView items={filtered} type="actions" processes={processes} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Barre de Recherche et Filtres */}
      <div className="flex gap-4 bg-white/2 p-6 rounded-[3rem] border border-white/5 flex-wrap items-center backdrop-blur-sm">
        <div className="flex-1 relative min-w-75">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="RECHERCHER DANS LE REGISTRE..."
            className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-[10px] font-black uppercase italic outline-none focus:border-blue-500 transition-all text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black uppercase italic outline-none min-w-50 text-blue-400 appearance-none cursor-pointer"
          onChange={(e) => setFilter({...filter, processId: e.target.value})}
          value={filter.processId}
        >
          <option value="ALL">Tous Processus</option>
          {processes.map((proc: any) => (
            <option key={proc.PR_Id} value={proc.PR_Id}>{proc.PR_Code} - {proc.PR_Libelle}</option>
          ))}
        </select>
        <select 
          className="bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-[10px] font-black uppercase italic outline-none text-slate-400 appearance-none cursor-pointer" 
          onChange={(e) => setFilter({...filter, status: e.target.value})} 
          value={filter.status}
        >
          <option value="ALL">Tous Statuts</option>
          <option value="A_FAIRE">À Faire</option>
          <option value="EN_COURS">En Cours</option>
          <option value="TERMINEE">Terminée</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? filtered.map((action) => (
          <ActionCard 
            key={action.ACT_Id} 
            action={action} 
            processes={processes} 
            onClick={() => router.push(`/dashboard/improvement/actions/${action.ACT_Id}`)} 
          />
        )) : (
          <div className="py-20 bg-slate-900/20 rounded-[3rem] border border-dashed border-white/10 text-center">
            <Search className="mx-auto text-slate-800 mb-4" size={48} />
            <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-600">Aucune action trouvée dans ce périmètre.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionCard({ action, processes, onClick }: { action: any, processes: any[], onClick: () => void }) {
  const process = processes.find((p: any) => p.PR_Id === action.ACT_ProcessusId);
  const isDelayed = action.ACT_Deadline && new Date(action.ACT_Deadline) < new Date() && 
    action.ACT_Status !== 'TERMINEE' && action.ACT_Status !== 'ANNULEE';
  
  const statusConfig: any = {
    'TERMINEE': { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    'A_FAIRE': { icon: Clock, color: 'text-slate-500 bg-slate-800 border-white/5' },
    'EN_COURS': { icon: AlertCircle, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
    'ANNULEE': { icon: X, color: 'text-red-500 bg-red-500/10 border-red-500/20' }
  };
  const statusInfo = statusConfig[action.ACT_Status] || statusConfig['A_FAIRE'];
  const StatusIcon = statusInfo.icon;

  return (
    <div onClick={onClick} className="group bg-slate-900/40 border border-white/5 p-8 rounded-[3.5rem] flex items-center justify-between hover:bg-slate-900/80 hover:border-blue-600/30 transition-all cursor-pointer shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-10 flex-1 min-w-0 text-left">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border shadow-inner ${statusInfo.color}`}>
          <StatusIcon size={32} />
        </div>
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {process && <span className="text-[9px] font-black px-3 py-1 rounded-lg bg-blue-600 text-white italic tracking-widest uppercase flex items-center gap-1"><Target size={10} /> {process.PR_Code}</span>}
            {isDelayed && <span className="text-[9px] font-black bg-red-600 text-white px-3 py-1 rounded-lg uppercase animate-pulse italic tracking-widest">RETARD</span>}
            <span className="text-[9px] font-black text-slate-600 uppercase italic tracking-widest">ID #{action.ACT_Id?.slice(-4)}</span>
          </div>
          <h3 className="text-xl font-black uppercase italic text-slate-100 group-hover:text-blue-500 transition-colors truncate tracking-tighter leading-none">{action.ACT_Title}</h3>
          <div className="flex items-center gap-8 text-slate-500 italic text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-2"><Calendar size={14} className="text-blue-500/50" /> {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString() : 'ÉCHÉANCE INDÉFINIE'}</span>
            <span className="flex items-center gap-2"><User size={14} className="text-blue-500/50" /> {action.ACT_Responsable?.U_FirstName} {action.ACT_Responsable?.U_LastName}</span>
          </div>
        </div>
      </div>
      <div className="bg-blue-600/10 text-blue-500 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg ml-6"><ArrowRight size={20} /></div>
    </div>
  );
}

// --- 📋 SECTION : PLANS DE TRAITEMENT ---

function PlansList() {
  const [plans, setPlans] = useState<any[]>([]);
  const router = useRouter();
  useEffect(() => { apiClient.get('/action-plans').then(res => setPlans(res.data)); }, []);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
      {plans.map((plan: any) => (
        <div key={plan.id} onClick={() => router.push(`/dashboard/improvement/plans/${plan.id}`)} className="bg-slate-900/40 border border-white/5 p-10 rounded-[4rem] hover:border-emerald-500/30 transition-all group cursor-pointer shadow-2xl text-left backdrop-blur-sm">
          <div className="flex justify-between items-start mb-8">
            <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500 shadow-lg"><ClipboardCheck size={32} /></div>
            <span className="px-5 py-2 rounded-2xl bg-slate-800 text-[10px] font-black uppercase text-slate-400 italic border border-white/5 tracking-widest">{plan.planStatus}</span>
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-white group-hover:text-emerald-500 transition-colors leading-tight">{plan.planTitre}</h3>
          <div className="bg-slate-950/50 rounded-4xl p-6 mb-8 border border-white/5 italic">
            <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Non-Conformité liée</p>
            <p className="text-sm font-bold text-slate-400 italic leading-snug">&quot;{plan.nonConformite?.NC_Libelle || 'Non rattachée'}&quot;</p>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-white/5">
            <div className="flex gap-10">
              <div className="text-left"><p className="text-[9px] font-black text-slate-600 uppercase mb-1 italic">Échéance</p><p className="text-md font-black italic text-white">{plan.dateFinPrevue ? new Date(plan.dateFinPrevue).toLocaleDateString() : '—'}</p></div>
              <div className="text-left"><p className="text-[9px] font-black text-slate-600 uppercase mb-1 italic">Consolidation</p><p className="text-md font-black text-emerald-500 italic uppercase tracking-tighter">{plan.actions?.length || 0} ACTIONS</p></div>
            </div>
            <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-xl active:scale-95 transition-all"><ArrowRight size={20} /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- 📅 SECTION : PAQ ANNUEL ---

function PaqList() {
  const [paqs, setPaqs] = useState<any[]>([]);
  const router = useRouter();
  useEffect(() => { apiClient.get('/paq').then(res => setPaqs(res.data)); }, []);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {paqs.map((paq: any) => (
        <div key={paq.PAQ_Id} onClick={() => router.push(`/dashboard/improvement/paq/${paq.PAQ_Id}`)} className="bg-slate-900/40 border border-white/5 p-10 rounded-[4.5rem] hover:border-blue-500/30 transition-all group cursor-pointer relative overflow-hidden shadow-2xl backdrop-blur-sm text-left">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <span className="bg-blue-600 text-white px-5 py-2 rounded-2xl text-[11px] font-black italic shadow-lg uppercase tracking-widest">PAQ {paq.PAQ_Year}</span>
            <span className="text-[10px] font-black text-slate-500 uppercase italic tracking-[0.2em]">{paq._count?.PAQ_Actions || 0} ACTIONS SÉCURISÉES</span>
          </div>
          <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-3 group-hover:text-blue-400 transition-colors leading-none text-white">{paq.PAQ_Processus?.PR_Libelle}</h3>
          <p className="text-[10px] text-slate-600 font-bold uppercase mb-10 italic tracking-widest">PILOTE QUALITÉ: {paq.PAQ_QualityManager?.U_FirstName} {paq.PAQ_QualityManager?.U_LastName}</p>
          <div className="space-y-4">
             <div className="flex justify-between items-center text-[10px] font-black uppercase italic text-slate-400 tracking-widest"><span>Avancement de Performance</span><span>65%</span></div>
             <div className="w-full bg-slate-950 rounded-full h-4 p-1 shadow-inner border border-white/5">
                <div className="bg-blue-600 h-full rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all duration-1000" style={{ width: '65%' }} />
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- 🎯 SECTION : VUE PAR PROCESSUS ---

function ProcessView() {
  const [processes, setProcesses] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const router = useRouter();
  
  useEffect(() => { 
    Promise.all([apiClient.get('/processes'), apiClient.get('/actions')])
      .then(([p, a]) => { setProcesses(p.data); setActions(a.data); }); 
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {processes.map((process: any) => {
        const pActions = actions.filter((a: any) => a.ACT_ProcessusId === process.PR_Id);
        const delayed = pActions.filter((a: any) => a.ACT_Deadline && new Date(a.ACT_Deadline) < new Date() && a.ACT_Status !== 'TERMINEE').length;
        
        return (
          <div key={process.PR_Id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[4rem] hover:bg-slate-900/80 transition-all group cursor-pointer shadow-2xl backdrop-blur-sm text-left" onClick={() => router.push(`/dashboard/improvement?tab=actions`)}>
            <div className="flex justify-between items-start mb-8">
              <div className="p-5 bg-blue-500/10 rounded-3xl border border-blue-500/20 text-blue-500 shadow-xl"><Target size={32} /></div>
              <div className="text-right">
                <p className="text-5xl font-black italic tracking-tighter leading-none text-white">{pActions.length}</p>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">Actions Indexées</p>
              </div>
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2 group-hover:text-blue-500 transition-colors leading-tight text-white">{process.PR_Libelle}</h3>
            <p className="text-[11px] font-black text-slate-500 mb-8 italic uppercase tracking-widest">AXE: {process.PR_Code}</p>
            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex justify-between text-[10px] font-black uppercase italic tracking-widest">
                <span className="text-slate-600">Risques Retard</span>
                <span className={delayed > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}>{delayed} UNITÉS</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 shadow-inner overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${delayed > 0 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500'}`} 
                  style={{ width: `${(delayed / (pActions.length || 1)) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- 🗂️ SECTION : KANBAN BOARD ---

function KanbanView({ items, processes }: any) {
  const columns = ['A_FAIRE', 'EN_COURS', 'TERMINEE'];
  const labels: any = { 'A_FAIRE': 'À Faire', 'EN_COURS': 'En Cours', 'TERMINEE': 'Terminées' };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[calc(100vh-350px)] overflow-x-auto pb-6 animate-in slide-in-from-right-10 duration-700">
      {columns.map((status) => (
        <div key={status} className="bg-slate-950/40 rounded-[3.5rem] p-8 border border-white/5 flex flex-col min-w-87.5 shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-8 px-4">
              <h4 className="text-[12px] font-black uppercase italic text-slate-500 tracking-[0.3em]">{labels[status]}</h4>
              <span className="bg-slate-800 text-white px-4 py-1 rounded-xl text-[10px] font-black italic border border-white/10 shadow-lg">{items.filter((i: any) => i.ACT_Status === status).length}</span>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar text-left">
            {items.filter((i: any) => i.ACT_Status === status).map((item: any) => {
              const proc = processes.find((p: any) => p.PR_Id === item.ACT_ProcessusId);
              return (
                <div key={item.ACT_Id} className="bg-slate-900/60 border border-white/5 p-6 rounded-4xl hover:border-blue-500/50 transition-all cursor-pointer group shadow-xl hover:-translate-y-0.5">
                  <p className="text-sm font-black uppercase italic text-white mb-4 leading-snug group-hover:text-blue-400 transition-colors line-clamp-2 tracking-tight">{item.ACT_Title}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {proc && <span className="text-[8px] font-black text-blue-500 uppercase bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10 italic tracking-widest">{proc.PR_Code}</span>}
                    <span className={`text-[8px] font-black uppercase px-2.5 py-1 rounded-lg border italic tracking-widest ${item.ACT_Priority === 'URGENT' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-800 text-slate-500 border-white/5'}`}>{item.ACT_Priority}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 pt-4 border-t border-white/5 italic tracking-widest">
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-slate-600" /> {item.ACT_Deadline ? new Date(item.ACT_Deadline).toLocaleDateString() : 'INDÉFINIE'}</span>
                    <Clock size={14} className={item.ACT_Priority === 'URGENT' ? 'text-red-500 animate-pulse' : 'text-slate-600'} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 🚀 EXPORT SÉCURISÉ (Next.js Suspense boundary)
 */
export default function ImprovementHubPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0F1A] ml-72 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-[10px] font-black uppercase italic tracking-[0.5em] text-slate-500 animate-pulse">Déploiement du Hub d&apos;Amélioration...</p>
      </div>
    }>
      <ImprovementHubContent />
    </Suspense>
  );
}