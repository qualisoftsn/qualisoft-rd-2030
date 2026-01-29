/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Target, Layers, ShieldAlert, ClipboardCheck, 
  LayoutGrid, List, Plus, Filter, TrendingUp,
  Clock, CheckCircle2, AlertCircle, ArrowRight,
  Search, Calendar, User, X, Edit3, Save
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

type TabView = 'overview' | 'actions' | 'tasks' | 'plans' | 'paq' | 'by-process';
type ViewMode = 'kanban' | 'list';

export default function ImprovementHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabView>((searchParams.get('tab') as TabView) || 'overview');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await apiClient.get('/improvement/hub-stats');
        setStats(res.data);
      } catch (err) {
        const [actionsRes, plansRes] = await Promise.all([
          apiClient.get('/actions'),
          apiClient.get('/action-plans')
        ]);
        setStats({
          totalActions: actionsRes.data.length,
          enRetard: actionsRes.data.filter((a: any) => 
            a.ACT_Deadline && new Date(a.ACT_Deadline) < new Date() && a.ACT_Status !== 'TERMINEE' && a.ACT_Status !== 'ANNULEE'
          ).length,
          tauxEfficacite: 84,
          activePlans: plansRes.data.length,
          sources: []
        });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleTabChange = (tab: TabView) => {
    setActiveTab(tab);
    router.push(`/dashboard/improvement?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans ml-72">
      <header className="sticky top-0 z-40 bg-[#0B0F1A]/90 backdrop-blur-xl border-b border-white/5 px-10 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2">
                <Target className="text-blue-500" size={20} />
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                Amélioration <span className="text-blue-500">Continue</span>
              </h1>
            </div>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
              Hub Central • Processus • Actions • Plans • PAQ
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-900/50 rounded-2xl p-1 border border-white/5">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
            <Link 
              href="/dashboard/improvement/actions/new"
              className="bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40"
            >
              <Plus size={16} /> Nouvelle Action
            </Link>
          </div>
        </div>

        <nav className="max-w-7xl mx-auto mt-8 flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Vue Globale', icon: TrendingUp },
            { id: 'actions', label: 'Actions Correctives', icon: ShieldAlert },
            { id: 'plans', label: 'Plans de Traitement', icon: ClipboardCheck },
            { id: 'paq', label: 'PAQ Annuel', icon: Target },
            { id: 'by-process', label: 'Vue Processus', icon: Filter },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabView)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-slate-800 text-blue-400 border border-blue-500/20 shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/30'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-10">
        {activeTab === 'overview' && <OverviewSection stats={stats} loading={loading} />}
        {activeTab === 'actions' && <ActionsList viewMode={viewMode} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        {activeTab === 'plans' && <PlansList />}
        {activeTab === 'paq' && <PaqList />}
        {activeTab === 'by-process' && <ProcessView />}
      </main>
    </div>
  );
}

function OverviewSection({ stats, loading }: { stats: any, loading: boolean }) {
  if (loading) return (
    <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl" />)}
      </div>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Actions Actives" value={stats?.totalActions || 0} trend="+12%" icon={ShieldAlert} color="blue" />
        <MetricCard title="En Retard" value={stats?.enRetard || 0} trend="Critique" icon={Clock} color="red" />
        <MetricCard title="Efficacité" value={`${stats?.tauxEfficacite || 84}%`} trend="+5%" icon={CheckCircle2} color="emerald" />
        <MetricCard title="Plans NC" value={stats?.activePlans || 0} trend="En cours" icon={ClipboardCheck} color="orange" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 bg-slate-900/40 border border-white/5 rounded-[3rem] p-8">
          <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
            <Filter size={18} className="text-blue-500" /> 
            Répartition par Origine
          </h3>
          <div className="space-y-4">
            {stats?.sources?.map((source: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-xs font-black uppercase text-slate-400 w-32">{source.origin}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${(source.count / (stats?.totalActions || 1)) * 100}%` }} />
                </div>
                <span className="text-sm font-black">{source.count}</span>
              </div>
            )) || <p className="text-slate-500 text-sm italic">Aucune donnée disponible</p>}
          </div>
        </div>

        <div className="col-span-4 bg-slate-900/40 border border-white/5 rounded-[3rem] p-8">
          <h3 className="text-lg font-black uppercase italic mb-6">À Traiter en Priorité</h3>
          <div className="space-y-3">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-[10px] font-black text-red-500 uppercase">Audit Interne Q4</p>
              <p className="text-xs font-bold mt-1">Mise à jour procédure CAPA</p>
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
    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] hover:bg-slate-900/60 transition-all group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-4xl font-black italic tracking-tighter">{value}</p>
        </div>
        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${trend?.startsWith('+') ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function ActionsList({ viewMode, searchTerm, setSearchTerm }: { viewMode: ViewMode, searchTerm: string, setSearchTerm: (s: string) => void }) {
  const [actions, setActions] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [filter, setFilter] = useState({ origin: 'ALL', status: 'ALL', processId: 'ALL' });
  const router = useRouter();

  useEffect(() => {
    apiClient.get('/actions').then(res => setActions(res.data));
    apiClient.get('/processes').then(res => setProcesses(res.data));
  }, []);

  const filtered = actions.filter(a => {
    const matchesSearch = !searchTerm || 
      a.ACT_Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ACT_Description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch &&
      (filter.origin === 'ALL' || a.ACT_Origin === filter.origin) &&
      (filter.status === 'ALL' || a.ACT_Status === filter.status) &&
      (filter.processId === 'ALL' || a.ACT_ProcessusId === filter.processId);
  });

  if (viewMode === 'kanban') {
    return <KanbanView items={filtered} type="actions" processes={processes} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 bg-slate-900/20 p-4 rounded-2xl border border-white/5 flex-wrap items-center">
        <div className="flex-1 relative min-w-75">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text"
            placeholder="Rechercher une action..."
            className="w-full bg-slate-800 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-xs font-black uppercase outline-none min-w-45"
          onChange={(e) => setFilter({...filter, processId: e.target.value})}
          value={filter.processId}
        >
          <option value="ALL">Tous Processus</option>
          {processes.map((proc: any) => (
            <option key={proc.PR_Id} value={proc.PR_Id}>{proc.PR_Code} - {proc.PR_Libelle}</option>
          ))}
        </select>
        
        <select 
          className="bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-xs font-black uppercase outline-none"
          onChange={(e) => setFilter({...filter, origin: e.target.value})}
          value={filter.origin}
        >
          <option value="ALL">Toutes Origines</option>
          <option value="AUDIT">Audit</option>
          <option value="COPIL">COPIL</option>
          <option value="NON_CONFORMITE">Non-Conformité</option>
          <option value="RECLAMATION">Réclamation</option>
          <option value="AUTRE">Autre</option>
        </select>
        
        <select 
          className="bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-xs font-black uppercase outline-none"
          onChange={(e) => setFilter({...filter, status: e.target.value})}
          value={filter.status}
        >
          <option value="ALL">Tous Statuts</option>
          <option value="A_FAIRE">À Faire</option>
          <option value="EN_COURS">En Cours</option>
          <option value="TERMINEE">Terminée</option>
          <option value="ANNULEE">Annulée</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((action) => (
          <ActionCard 
            key={action.ACT_Id} 
            action={action} 
            processes={processes} 
            onClick={() => router.push(`/dashboard/improvement/actions/${action.ACT_Id}`)} 
          />
        ))}
        {filtered.length === 0 && (
          <div className="py-20 text-center bg-slate-900/20 rounded-[3rem] border border-dashed border-white/10">
            <ShieldAlert size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Aucune action trouvée</p>
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
  
  const originColors: any = {
    'COPIL': 'bg-purple-500/20 text-purple-400 border-purple-500/20',
    'AUDIT': 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    'NON_CONFORMITE': 'bg-red-500/20 text-red-400 border-red-500/20',
    'RECLAMATION': 'bg-orange-500/20 text-orange-400 border-orange-500/20',
    'AUTRE': 'bg-slate-800 text-slate-400'
  };

  const statusConfig: any = {
    'TERMINEE': { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    'A_FAIRE': { icon: Clock, color: 'text-slate-400 bg-slate-800 border-white/10' },
    'EN_COURS': { icon: AlertCircle, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
    'ANNULEE': { icon: X, color: 'text-red-500 bg-red-500/10 border-red-500/20' }
  };

  const statusInfo = statusConfig[action.ACT_Status] || statusConfig['A_FAIRE'];
  const StatusIcon = statusInfo.icon;

  return (
    <div 
      onClick={onClick}
      className="group bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between hover:bg-slate-900/60 hover:border-blue-500/30 transition-all cursor-pointer shadow-xl"
    >
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${statusInfo.color}`}>
          <StatusIcon size={24} />
        </div>
        
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            {process && (
              <span className="text-[9px] font-black px-2 py-1 rounded uppercase bg-blue-600 text-white border border-blue-500 flex items-center gap-1">
                <Target size={10} /> {process.PR_Code}
              </span>
            )}
            
            <span className={`text-[9px] font-black px-2 py-1 rounded uppercase border ${originColors[action.ACT_Origin] || 'bg-slate-800 text-slate-400'}`}>
              {action.ACT_Origin?.replace('_', ' ')}
            </span>
            
            {isDelayed && (
              <span className="text-[9px] font-black bg-red-500 text-white px-2 py-1 rounded uppercase animate-pulse flex items-center gap-1">
                <Clock size={10} /> RETARD
              </span>
            )}
          </div>
          
          <h3 className="text-sm font-black uppercase text-slate-100 group-hover:text-blue-400 transition-colors truncate">
            {action.ACT_Title}
          </h3>
          
          {process && (
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <ArrowRight size={10} className="text-blue-500" /> 
              {process.PR_Libelle}
            </p>
          )}
          
          <div className="flex items-center gap-6 text-slate-500">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase">
              <Calendar size={12} /> 
              {action.ACT_Deadline ? new Date(action.ACT_Deadline).toLocaleDateString() : 'N/A'}
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase">
              <User size={12} />
              {action.ACT_Responsable?.U_FirstName} {action.ACT_Responsable?.U_LastName}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border ${
          action.ACT_Priority === 'URGENT' || action.ACT_Priority === 'CRITICAL' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
          action.ACT_Priority === 'HIGH' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 
          'bg-slate-800 border-white/10 text-slate-400'
        }`}>
          {action.ACT_Priority}
        </span>
        <button className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white p-3 rounded-xl transition-all">
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function PlansList() {
  const [plans, setPlans] = useState<any[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    apiClient.get('/action-plans').then(res => setPlans(res.data));
  }, []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {plans.map((plan: any) => (
        <div key={plan.id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] hover:border-green-500/30 transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-green-500">
              <ClipboardCheck size={24} />
            </div>
            <span className="px-4 py-2 rounded-xl bg-slate-800 text-[10px] font-black uppercase text-slate-400 border border-white/5">
              {plan.planStatus}
            </span>
          </div>
          
          <h3 className="text-2xl font-black uppercase italic tracking-tight mb-4 text-slate-100">
            {plan.planTitre}
          </h3>
          
          <div className="bg-slate-800/30 rounded-2xl p-4 mb-6 border border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Non-Conformité Associée</p>
            <p className="text-sm font-bold text-slate-300 italic">&quot;{plan.nonConformite?.NC_Libelle}&quot;</p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <div className="flex gap-6">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase">Échéance</p>
                <p className="text-sm font-bold text-slate-300">
                  {plan.dateFinPrevue ? new Date(plan.dateFinPrevue).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase">Actions</p>
                <p className="text-sm font-bold text-green-500">{plan.actions?.length || 0} tâches</p>
              </div>
            </div>
            <button 
              onClick={() => router.push(`/dashboard/improvement/plans/${plan.id}`)}
              className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaqList() {
  const [paqs, setPaqs] = useState<any[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    apiClient.get('/paq').then(res => setPaqs(res.data));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {paqs.map((paq: any) => (
        <div 
          key={paq.PAQ_Id} 
          onClick={() => router.push(`/dashboard/improvement/paq/${paq.PAQ_Id}`)}
          className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] hover:border-blue-500/30 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all" />
          
          <div className="flex justify-between items-start mb-6 relative">
            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
              {paq.PAQ_Year}
            </span>
            <span className="text-[9px] font-black text-slate-500 uppercase">
              {paq._count?.PAQ_Actions || 0} actions
            </span>
          </div>
          
          <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2 group-hover:text-blue-400 transition-colors">
            {paq.PAQ_Processus?.PR_Libelle}
          </h3>
          
          <p className="text-[10px] text-slate-500 font-bold uppercase mb-6">
            Pilote: {paq.PAQ_QualityManager?.U_FirstName} {paq.PAQ_QualityManager?.U_LastName}
          </p>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: '65%' }} />
          </div>
          <p className="text-[9px] text-slate-500 mt-2 font-black uppercase">Progression 65%</p>
        </div>
      ))}
    </div>
  );
}

function ProcessView() {
  const [processes, setProcesses] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      apiClient.get('/processes'),
      apiClient.get('/actions')
    ]).then(([procRes, actRes]) => {
      setProcesses(procRes.data);
      setActions(actRes.data);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {processes.map((process: any) => {
        const processActions = actions.filter((a: any) => a.ACT_ProcessusId === process.PR_Id);
        const activeCount = processActions.filter((a: any) => a.ACT_Status !== 'TERMINEE' && a.ACT_Status !== 'ANNULEE').length;
        const delayedCount = processActions.filter((a: any) => 
          a.ACT_Deadline && new Date(a.ACT_Deadline) < new Date() && a.ACT_Status !== 'TERMINEE' && a.ACT_Status !== 'ANNULEE'
        ).length;

        return (
          <div 
            key={process.PR_Id} 
            className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] hover:border-blue-500/30 transition-all group cursor-pointer"
            onClick={() => router.push(`/dashboard/improvement?tab=actions`)}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500">
                <Target size={24} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black italic">{processActions.length}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase">Actions</p>
              </div>
            </div>

            <h3 className="text-xl font-black uppercase italic tracking-tight mb-2 text-slate-100 group-hover:text-blue-400 transition-colors">
              {process.PR_Libelle}
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-6">Code: {process.PR_Code}</p>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className="text-slate-400">En cours</span>
                <span className="text-blue-400">{activeCount}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${(activeCount / (processActions.length || 1)) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                <span>Retards</span>
                <span className={delayedCount > 0 ? 'text-red-400' : 'text-emerald-400'}>{delayedCount}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanView({ items, type, processes }: { items: any[], type: 'actions' | 'tasks', processes: any[] }) {
  const columns = ['A_FAIRE', 'EN_COURS', 'TERMINEE', 'ANNULEE'];
  const columnLabels: any = {
    'A_FAIRE': 'À Faire',
    'EN_COURS': 'En Cours', 
    'TERMINEE': 'Terminées',
    'ANNULEE': 'Annulées'
  };

  return (
    <div className="grid grid-cols-4 gap-6 h-[calc(100vh-300px)] overflow-x-auto pb-4">
      {columns.map((status) => (
        <div key={status} className="bg-slate-900/20 rounded-3xl p-4 border border-white/5 flex flex-col min-w-70">
          <div className="flex justify-between items-center mb-4 px-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{columnLabels[status]}</h4>
            <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded-lg text-[10px] font-black">
              {items.filter(i => i.ACT_Status === status).length}
            </span>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto">
            {items
              .filter(i => i.ACT_Status === status)
              .map((item: any) => {
                const process = processes.find((p: any) => p.PR_Id === item.ACT_ProcessusId);
                return (
                  <div key={item.ACT_Id} className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group">
                    <p className="text-xs font-bold uppercase text-slate-200 mb-2 line-clamp-2">
                      {item.ACT_Title}
                    </p>
                    {process && (
                      <span className="text-[8px] font-black text-blue-400 uppercase bg-blue-500/10 px-2 py-0.5 rounded mb-2 inline-block">
                        {process.PR_Code}
                      </span>
                    )}
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-black uppercase mt-2">
                      <span>{item.ACT_Priority}</span>
                      <Clock size={12} />
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