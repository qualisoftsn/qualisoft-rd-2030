/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  Target, Plus, Search, 
  Activity, 
  TrendingUp, Calculator, Clock,
  ShieldCheck, AlertCircle, 
  Archive, 
  Layers, Gauge, Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default function ActionsHubPage() {
  const { user } = useAuthStore();
  const [actions, setActions] = useState<any[]>([]);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProcess, setSelectedProcess] = useState('ALL');

  const isRQ = useMemo(() => 
    user?.U_Role === 'RQ' || user?.U_Role === 'SUPER_ADMIN', 
  [user]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [actionsRes, procRes] = await Promise.all([
        apiClient.get('/actions'),
        apiClient.get('/processus')
      ]);
      setActions(actionsRes.data || []);
      setProcesses(procRes.data || []);
    } catch (err) {
      toast.error("Erreur de synchronisation avec le Noyau d'Actions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- ANALYSE DE PERFORMANCE ACTIONS (§9.1.3) ---
  const stats = useMemo(() => {
    const filtered = selectedProcess === 'ALL' ? actions : actions.filter(a => a.ACT_PAQ?.PAQ_ProcessusId === selectedProcess);
    const total = filtered.length;
    const completed = filtered.filter(a => a.ACT_Status === 'TERMINEE').length;
    const delayed = filtered.filter(a => a.ACT_Status !== 'TERMINEE' && a.ACT_Deadline && new Date(a.ACT_Deadline) < new Date()).length;
    
    return {
      total,
      effectiveness: total > 0 ? Math.round((completed / total) * 100) : 0,
      delayed,
      inProgress: filtered.filter(a => a.ACT_Status === 'EN_COURS').length
    };
  }, [actions, selectedProcess]);

  const handleArchive = async (id: string) => {
    if (!isRQ) return toast.error("Habilitation insuffisante pour l'archivage (§7.5.3)");
    try {
      await apiClient.delete(`/actions/${id}`); // Suppression logique -> Archivage
      toast.success("Action transférée à la Chambre Forte");
      fetchData();
    } catch (e) { toast.error("Échec de l'archivage"); }
  };

  const filteredActions = useMemo(() => {
    return actions.filter(a => {
      const matchProcess = selectedProcess === 'ALL' || a.ACT_PAQ?.PAQ_ProcessusId === selectedProcess;
      const matchSearch = a.ACT_Title.toLowerCase().includes(search.toLowerCase()) || a.ACT_Responsable?.U_LastName.toLowerCase().includes(search.toLowerCase());
      return matchProcess && matchSearch && a.ACT_IsActive;
    });
  }, [actions, selectedProcess, search]);

  if (loading) return (
    <div className="ml-72 flex h-screen items-center justify-center bg-[#0B0F1A]">
      <Activity className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans ml-72 flex flex-col overflow-hidden">
      
      {/* 🔝 HEADER STRATÉGIQUE (10% H) */}
      <header className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/80 backdrop-blur-3xl shrink-0">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
            Noyau de Traitement <span className="text-blue-600">des Actions</span>
          </h1>
          <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
            <Target size={12} className="text-blue-500" /> ISO 9001 §10.2 • Plan d&apos;Amélioration Continue
          </p>
        </div>
        <div className="flex gap-4">
          <select 
            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-[10px] font-black uppercase italic outline-none focus:border-blue-600 transition-all cursor-pointer"
            value={selectedProcess}
            onChange={(e) => setSelectedProcess(e.target.value)}
          >
            <option value="ALL">Tous les Processus</option>
            {processes.map(p => <option key={p.PR_Id} value={p.PR_Id}>{p.PR_Code} - {p.PR_Libelle}</option>)}
          </select>
          <button className="bg-blue-600 hover:bg-blue-500 px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 transition-all shadow-3xl shadow-blue-900/40">
            <Plus size={18} /> Nouvelle Action
          </button>
        </div>
      </header>

      {/* 📊 ANALYTICS PDCA (15% H) */}
      <main className="flex-1 p-8 grid grid-cols-12 grid-rows-6 gap-6 overflow-hidden">
        
        <div className="col-span-12 row-span-1 grid grid-cols-4 gap-6">
          <MetricCard title="Efficacité PAQ" val={`${stats.effectiveness}%`} trend="Objectif 85%" icon={Gauge} color="emerald" formula="Σ(Actions Closes) / Σ(Engagées)" />
          <MetricCard title="Actions en Retard" val={stats.delayed} trend="Critique" icon={AlertCircle} color="red" formula="Échéance < Today() & Statut ≠ Clos" />
          <MetricCard title="Charge Active" val={stats.inProgress} trend="En cours" icon={Activity} color="blue" formula="Sessions avec statut 'EN_COURS'" />
          <MetricCard title="Actions Totales" val={stats.total} trend="Volume" icon={Layers} color="amber" formula="Inventaire brut du processus" />
        </div>

        {/* 📋 TABLEAU DE BORD DES ACTIONS (80% W) */}
        <div className="col-span-12 row-span-5 flex flex-col bg-slate-900/20 border border-white/5 rounded-[3rem] overflow-hidden shadow-inner">
          <div className="p-6 border-b border-white/5 bg-white/2 flex justify-between items-center">
            <div className="relative group w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="text" placeholder="FILTRER PAR TITRE, RESPONSABLE..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-12 text-[9px] font-black outline-none focus:border-blue-600 transition-all uppercase italic"
                  value={search} onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{filteredActions.length} Actions Filtrées</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#0B0F1A] z-20 border-b border-white/5">
                <tr className="text-[8px] font-black uppercase text-slate-600 italic">
                  <th className="p-6">Origine & Source</th>
                  <th className="p-6">Désignation de l&apos;Action</th>
                  <th className="p-6">Responsable</th>
                  <th className="p-6">Échéance</th>
                  <th className="p-6">Évolution</th>
                  <th className="p-6 text-right">Opérations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredActions.map((action) => (
                  <tr key={action.ACT_Id} className="hover:bg-blue-600/5 transition-all group">
                    <td className="p-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={cn("px-2.5 py-1 rounded-lg text-[7px] font-black uppercase w-max border", getOriginStyle(action.ACT_Origin))}>
                           {action.ACT_Origin}
                        </span>
                        <span className="text-[9px] font-black text-slate-500 italic">Réf: {action.ACT_Id.slice(0,8)}</span>
                      </div>
                    </td>
                    <td className="p-6 max-w-md">
                      <p className="text-[11px] font-black uppercase text-white leading-tight tracking-tight">{action.ACT_Title}</p>
                      <p className="text-[9px] text-slate-500 font-bold mt-1.5 uppercase italic truncate">{action.ACT_Description || "Sans description technique"}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-[9px] font-black text-blue-500 border border-blue-600/20">
                            {action.ACT_Responsable?.U_FirstName?.[0]}{action.ACT_Responsable?.U_LastName?.[0]}
                         </div>
                         <span className="text-[10px] font-black uppercase italic text-slate-300">{action.ACT_Responsable?.U_FirstName} {action.ACT_Responsable?.U_LastName}</span>
                      </div>
                    </td>
                    <td className="p-6">
                       <div className={cn("flex items-center gap-2 text-[10px] font-black italic", isDelayed(action.ACT_Deadline, action.ACT_Status) ? "text-red-500 animate-pulse" : "text-slate-400")}>
                          <Clock size={12} /> {new Date(action.ACT_Deadline).toLocaleDateString()}
                       </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full w-24 overflow-hidden">
                          <div className={cn("h-full transition-all duration-1000", getStatusColor(action.ACT_Status))} style={{ width: getStatusProgress(action.ACT_Status) }} />
                        </div>
                        <span className="text-[8px] font-black uppercase italic text-slate-500">{action.ACT_Status}</span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2.5 bg-white/5 hover:bg-blue-600 rounded-xl transition-all text-slate-400 hover:text-white" title="Évoluer l'action">
                           <TrendingUp size={14} />
                        </button>
                        <button className="p-2.5 bg-white/5 hover:bg-indigo-600 rounded-xl transition-all text-slate-400 hover:text-white" title="Voir les preuves §7.5">
                           <Eye size={14} />
                        </button>
                        {isRQ && (
                          <button 
                            onClick={() => handleArchive(action.ACT_Id)}
                            className="p-2.5 bg-red-500/10 hover:bg-red-600 rounded-xl transition-all text-red-500 hover:text-white" 
                            title="Archiver (Action RQ)"
                          >
                             <Archive size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* FOOTER FORMULES DE CALCUL */}
      <footer className="px-10 py-4 bg-[#0F172A] border-t border-white/5 flex justify-between items-center shrink-0">
         <div className="flex items-center gap-8">
            <Formula title="Vitesse de traitement" formula="V = (Date_Clôture - Date_Création) / N" />
            <Formula title="Indice de Récurrence" formula="R = (NC_Récurrentes / Total_NC)" />
         </div>
         <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest italic">Noyau certifié conforme ISO 9001:2015</span>
         </div>
      </footer>
    </div>
  );
}

// --- UTILITAIRES & SOUS-COMPOSANTS ---

function MetricCard({ title, val, trend, icon: Icon, color, formula }: any) {
  const themes: any = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  };
  return (
    <div className="bg-[#0F172A]/60 border border-white/5 p-6 rounded-[2.5rem] flex flex-col justify-between group hover:border-blue-600/30 transition-all relative">
      <div className="flex justify-between items-start">
         <div className={cn("p-3 rounded-xl border", themes[color])}><Icon size={18} /></div>
         <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">{trend}</span>
      </div>
      <div className="mt-3">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 italic leading-none">{title}</p>
        <p className="text-3xl font-black italic text-white tracking-tighter">{val}</p>
      </div>
      {/* TOOLTIP FORMULE AU SURVOL */}
      <div className="absolute inset-0 bg-blue-600/95 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center z-20">
         <Calculator size={16} className="mb-2 text-white" />
         <p className="text-[8px] font-black uppercase text-blue-100 mb-1">Logique SMI</p>
         <p className="text-[9px] font-bold text-white uppercase italic leading-tight">{formula}</p>
      </div>
    </div>
  );
}

function Formula({ title, formula }: any) {
    return (
        <div className="flex items-center gap-3">
            <Calculator size={12} className="text-blue-500" />
            <span className="text-[8px] font-black text-slate-500 uppercase italic leading-none">{title}: <span className="text-white">{formula}</span></span>
        </div>
    );
}

const getOriginStyle = (origin: string) => {
    switch (origin) {
        case 'AUDIT': return 'text-blue-400 bg-blue-400/5 border-blue-400/20';
        case 'NON_CONFORMITE': return 'text-red-400 bg-red-400/5 border-red-400/20';
        case 'RECLAMATION': return 'text-amber-400 bg-amber-400/5 border-amber-400/20';
        case 'RISQUE': return 'text-indigo-400 bg-indigo-400/5 border-indigo-400/20';
        default: return 'text-slate-400 bg-slate-400/5 border-slate-400/20';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'TERMINEE': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
        case 'A_VALIDER': return 'bg-amber-500';
        case 'EN_COURS': return 'bg-blue-500 animate-pulse';
        default: return 'bg-slate-700';
    }
};

const getStatusProgress = (status: string) => {
    switch (status) {
        case 'TERMINEE': return '100%';
        case 'A_VALIDER': return '75%';
        case 'EN_COURS': return '40%';
        default: return '10%';
    }
};

const isDelayed = (deadline: string, status: string) => {
    return status !== 'TERMINEE' && deadline && new Date(deadline) < new Date();
};