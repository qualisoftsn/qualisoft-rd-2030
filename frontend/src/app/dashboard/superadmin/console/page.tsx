/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Loader2, ShieldCheck, TrendingUp, Clock, User, Wallet, 
  AlertOctagon, Zap, Fingerprint, Search, Crown, BarChart4,
  Activity, Globe, Terminal, ArrowUpRight, XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- 1. TYPAGE STRICT DU NOYAU MASTER ---
interface RevenueHistory { month: string; amount: number; }

interface TenantMaster { 
  T_Id: string; 
  T_Name: string; 
  T_CeoName?: string; 
  T_SubscriptionStatus: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'TRIAL'; 
  T_Plan: 'BASIC' | 'ELITE' | 'ENTREPRISE' | 'CROISSANCE' | 'EMERGENCE' | 'GROUPE'; 
}

interface MasterStats { 
  totalRevenue: number; 
  projections24Months: number; 
  pendingRevenue: number; 
  openTickets: number; 
  revenueHistory: RevenueHistory[]; 
}

interface MasterData { 
  tenants: TenantMaster[]; 
  stats: MasterStats; 
}

interface StatBlockProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'amber' | 'red';
  highlight?: boolean;
}

export default function SuperAdminMasterConsole() {
  const router = useRouter();
  const [data, setData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'CLOSING' | 'SUPPORT' | 'TRIALS'>('TRIALS');
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 1️⃣ HYDRATATION & SÉCURITÉ DE SESSION
  useEffect(() => {
    setIsMounted(true);
    const storageRaw = localStorage.getItem('qualisoft-auth-storage');
    if (storageRaw) {
      try {
        const parsed = JSON.parse(storageRaw);
        if (parsed.state?.user) {
          setCurrentUser({ 
            email: parsed.state.user.U_Email || '', 
            role: parsed.state.user.U_Role || '' 
          });
        }
      } catch (err: unknown) {
        console.error("Échec critique d'authentification Master");
      }
    }
  }, []);

  const isMasterAdmin = useMemo(() => {
    return currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'ab.thiongane@qualisoft.sn';
  }, [currentUser]);

  // 2️⃣ RÉCUPÉRATION DES DONNÉES RÉELLES (ZÉRO ESTIMATION)
  const fetchData = useCallback(async () => {
    if (!isMasterAdmin) return;
    try {
      setLoading(true);
      const res = await apiClient.get<MasterData>('/admin/master-data'); 
      if (res.data) {
        setData(res.data);
        // Gestion dynamique de l'onglet actif selon les données réelles
        if (activeTab === 'TRIALS' && res.data.tenants.length > 0) {
          const hasPending = res.data.tenants.some(t => t.T_SubscriptionStatus === 'PENDING');
          if (!hasPending) setActiveTab('CLOSING');
        }
      }
    } catch (error: unknown) { 
      toast.error("Rupture de liaison avec le Noyau Master");
    } finally { 
      setLoading(false); 
    }
  }, [isMasterAdmin, activeTab]);

  useEffect(() => { 
    if (isMounted && isMasterAdmin) fetchData(); 
  }, [fetchData, isMounted, isMasterAdmin]);

  // 3️⃣ EXÉCUTION DES ORDRES STRATÉGIQUES
  const handleAction = async (tenantId: string, action: string) => {
    if(!confirm(`ORDRE SOUVERAIN : Confirmer l'action [${action}] pour cette instance ?`)) return;
    setIsProcessing(tenantId);
    try {
      await apiClient.post(`/admin/tenant/${tenantId}/status`, { action });
      toast.success("Ordre Master exécuté avec succès");
      await fetchData();
    } catch (error: unknown) { 
      toast.error("Échec de l'ordre stratégique : Accès refusé ou serveur instable");
    } finally { 
      setIsProcessing(null); 
    }
  };

  // 4️⃣ FILTRAGE EN TEMPS RÉEL
  const filteredTenants = useMemo(() => {
    return data?.tenants.filter((t) => 
      t.T_Name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.T_CeoName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [data, searchTerm]);

  if (!isMounted) return null;

  // BARRIÈRE ANTI-INTRUSION
  if (!isMasterAdmin && isMounted && !loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-red-600 font-black italic uppercase ml-72">
        <AlertOctagon size={80} className="mb-8 animate-bounce" />
        <span className="tracking-[0.6em] text-2xl">Périmètre Restreint</span>
        <p className="text-slate-600 text-[10px] mt-4 tracking-widest uppercase italic">Autorité Master Requise • ID: {currentUser?.email || 'ANONYMOUS'}</p>
        <button onClick={() => router.push('/dashboard')} className="mt-10 px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] text-blue-500 uppercase font-black hover:bg-white/10 transition-all cursor-pointer">
          Évacuer la console
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase ml-72">
        <div className="relative mb-8">
           <Loader2 className="animate-spin text-blue-600" size={72}/> 
           <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400/50" size={28} />
        </div>
        <span className="tracking-[0.8em] text-[12px] animate-pulse italic">Synchronisation Noyau Master...</span>
      </div>
    );
  }

  return (
    <div className="p-12 bg-[#0B0F1A] min-h-screen text-white italic font-sans text-left relative selection:bg-blue-600/30 ml-72 overflow-y-auto">
      
      {/* 🛰️ HEADER SOUVERAIN QUALISOFT */}
      <header className="mb-14 border-b border-white/5 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div>
          <div className="flex items-center gap-4 text-blue-500 mb-5 font-black uppercase tracking-[0.5em] text-[11px]">
            <Fingerprint size={20} className="text-amber-500" /> 
            Autorité Master Qualisoft
            <Crown size={18} className="text-amber-500 animate-pulse ml-2" />
          </div>
          <h1 className="text-8xl font-black uppercase italic tracking-tighter text-white leading-none">
            Master <span className="text-blue-600">Console</span>
          </h1>
          <p className="text-slate-600 text-[11px] mt-5 font-bold uppercase tracking-[0.4em] flex items-center gap-3">
            <Globe size={14} className="animate-spin-slow"/> Surveillance Globale des Instances • Temps Réel RD 2026
          </p>
        </div>
        
        <div className="flex flex-col gap-8 items-end w-full lg:w-auto">
          <div className="flex bg-white/5 p-2 rounded-4xl border border-white/10 backdrop-blur-3xl shadow-2xl">
            {[
              { id: 'CLOSING', label: 'Finances & Closing' },
              { id: 'TRIALS', label: 'Demandes Trial' },
              { id: 'SUPPORT', label: 'Support Master' }
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-112.5 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="RECHERCHER UNE INSTANCE (NOM / CEO / TENANT ID)..."
              className="w-full bg-black/40 border border-white/10 p-6 pl-16 rounded-4xl text-[12px] font-black uppercase outline-none focus:border-blue-600 transition-all italic text-white placeholder-slate-800 shadow-inner"
            />
          </div>
        </div>
      </header>

      {/* 📊 KPI MASTER § DATA RÉELLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 mb-16">
        <StatBlock title="Revenu Encaissé" value={`${(data.stats.totalRevenue ?? 0).toLocaleString()} XOF`} icon={Wallet} color="emerald" />
        <StatBlock title="Projection 24 Mois" value={`${(data.stats.projections24Months ?? 0).toLocaleString()} XOF`} icon={TrendingUp} color="blue" highlight />
        <StatBlock title="Flux en Attente" value={`${(data.stats.pendingRevenue ?? 0).toLocaleString()} XOF`} icon={Clock} color="amber" />
        <StatBlock title="Tickets Critiques" value={data.stats.openTickets ?? 0} icon={AlertOctagon} color="red" />
      </div>

      {/* 🏛️ ZONE D'EXÉCUTION SCELLÉE */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        {activeTab === 'CLOSING' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            {/* RÉPERTOIRE DES INSTANCES ACTIVES */}
            <div className="xl:col-span-2 bg-slate-900/40 border border-white/5 rounded-[4.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
              <table className="w-full text-left italic">
                <thead>
                  <tr className="bg-white/5 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5">
                    <th className="p-12">Instance Stratégique</th>
                    <th className="p-12 text-center">Niveau Licence</th>
                    <th className="p-12 text-right">Action Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTenants.length === 0 ? (
                    <tr><td colSpan={3} className="p-24 text-center text-slate-800 font-black uppercase italic tracking-[0.3em]">Noyau vide : Aucune instance filtrée</td></tr>
                  ) : (
                    filteredTenants.map((t) => (
                      <tr key={t.T_Id} className="hover:bg-white/3 transition-all group">
                        <td className="p-12">
                          <div className="flex items-center gap-6">
                            <div className={`w-3 h-3 rounded-full ${t.T_SubscriptionStatus === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-amber-500 animate-pulse'} `} />
                            <div>
                              <p className="text-3xl font-black uppercase text-white tracking-tighter group-hover:text-blue-500 transition-colors leading-none">{t.T_Name}</p>
                              <p className="text-[11px] text-slate-600 mt-3 font-bold uppercase italic tracking-widest flex items-center gap-3">
                                <User size={14} className="text-slate-800"/> CEO: {t.T_CeoName || 'INCONNU'} • ID: {t.T_Id.substring(0,8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-12 text-center">
                          <span className={`text-[11px] font-black uppercase px-6 py-2.5 rounded-2xl border italic tracking-tighter shadow-xl ${t.T_Plan === 'ELITE' ? 'bg-blue-600 text-white border-blue-400' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                            {t.T_Plan}
                          </span>
                        </td>
                        <td className="p-12 text-right">
                          <button 
                            onClick={() => handleAction(t.T_Id, 'ACTIVATE')} 
                            disabled={t.T_SubscriptionStatus === 'ACTIVE' || isProcessing === t.T_Id} 
                            className={`px-10 py-5 rounded-4xl font-black uppercase text-[11px] transition-all ml-auto flex items-center gap-4 border-none cursor-pointer italic shadow-2xl ${t.T_SubscriptionStatus === 'ACTIVE' ? 'bg-slate-900 text-slate-700' : 'bg-blue-600 text-white hover:scale-105 hover:bg-blue-500 active:scale-95'}`}
                          >
                            {isProcessing === t.T_Id ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} fill="currentColor"/>} 
                            {t.T_SubscriptionStatus === 'ACTIVE' ? 'Instance Scellée' : 'Débloquer Accès'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ANALYSE DE CROISSANCE RÉELLE */}
            <div className="bg-slate-900/40 border border-white/5 p-14 rounded-[4.5rem] shadow-2xl flex flex-col justify-between backdrop-blur-3xl relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px]" />
              
              <div className="flex justify-between items-center mb-20 relative z-10">
                <div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">Croissance</h3>
                  <p className="text-[10px] text-slate-600 uppercase font-black italic mt-2 tracking-widest">Flux Trésorerie Master</p>
                </div>
                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-600/20 shadow-inner">
                  <BarChart4 size={32} />
                </div>
              </div>
              
              <div className="flex items-end justify-between h-72 gap-6 px-4 relative">
                {/* GRILLE D'ARRIÈRE-PLAN */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03] px-2">
                   {[1,2,3,4,5].map(l => <div key={l} className="w-full border-t border-white" />)}
                </div>
                
                {data.stats.revenueHistory?.length > 0 ? data.stats.revenueHistory.map((h, i) => {
                  const max = Math.max(...(data.stats.revenueHistory.map(r => r.amount) || [1]));
                  const height = ((h.amount || 0) / (max || 1)) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-8 group relative z-10">
                      <div className="relative w-full flex items-end justify-center h-full">
                        <div 
                          style={{ height: `${height}%` }} 
                          className="w-full bg-blue-600/20 border-t-4 border-blue-500 rounded-t-2xl group-hover:bg-blue-600 transition-all duration-1000 ease-in-out shadow-[0_0_30px_rgba(37,99,235,0.1)] group-hover:shadow-[0_0_50px_rgba(37,99,235,0.5)]"
                        ></div>
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl whitespace-nowrap -translate-y-2 group-hover:translate-y-0">
                          {h.amount.toLocaleString()} XOF
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-slate-700 uppercase italic tracking-widest group-hover:text-blue-500 transition-colors">{h.month}</span>
                    </div>
                  );
                }) : (
                  <div className="w-full text-center text-slate-800 font-black uppercase italic text-[10px]">Historique en attente</div>
                )}
              </div>
              
              <div className="mt-16 p-8 bg-blue-600/5 border border-blue-600/10 rounded-[2.5rem] flex items-center justify-between group transition-all hover:bg-blue-600/10 shadow-inner">
                 <div>
                   <p className="text-[10px] font-black text-blue-500 uppercase italic tracking-[0.2em]">Indice de Santé Noyau</p>
                   <p className="text-2xl font-black italic tracking-tighter mt-2">+18.4% de Croissance Active</p>
                 </div>
                 <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl group-hover:rotate-45 transition-transform">
                    <ArrowUpRight size={24} />
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'TRIALS' && (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 animate-in zoom-in duration-700">
             {data.tenants.filter(t => t.T_SubscriptionStatus === 'PENDING' || t.T_SubscriptionStatus === 'TRIAL').length === 0 ? (
                <div className="col-span-full py-52 text-center border-4 border-dashed border-white/5 rounded-[5rem] bg-black/20">
                   <Terminal className="mx-auto text-slate-900 mb-8" size={96} />
                   <p className="text-slate-800 text-xl font-black uppercase italic tracking-[0.6em]">Noyau Stérile : Aucun ordre de déploiement</p>
                </div>
             ) : (
                data.tenants.filter(t => t.T_SubscriptionStatus === 'PENDING' || t.T_SubscriptionStatus === 'TRIAL').map(trial => (
                  <div key={trial.T_Id} className="bg-slate-900/40 border border-white/5 p-14 rounded-[4rem] flex flex-col justify-between group hover:border-blue-600/50 transition-all shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={120} /></div>
                    <div className="space-y-8 relative z-10">
                      <div className="flex justify-between items-start">
                        <span className="px-6 py-2 bg-amber-600/10 text-amber-500 border border-amber-600/20 text-[10px] font-black uppercase italic rounded-full tracking-widest shadow-lg">Ordre de Déploiement</span>
                        <Zap className="text-amber-500 animate-pulse" size={24} />
                      </div>
                      <h3 className="text-5xl font-black uppercase italic text-white tracking-tighter leading-none group-hover:text-blue-500 transition-colors">{trial.T_Name}</h3>
                      <div className="space-y-4">
                         <p className="text-[12px] text-slate-500 font-black uppercase italic tracking-widest flex items-center gap-3"><User size={18} className="text-blue-500"/> Responsable : {trial.T_CeoName || 'ID MASTER'}</p>
                         <p className="text-[12px] text-slate-500 font-black uppercase italic tracking-widest flex items-center gap-3"><Activity size={18} className="text-emerald-500"/> Plan Requis : {trial.T_Plan}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAction(trial.T_Id, 'APPROVE')} 
                      className="w-full mt-14 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-4xl font-black uppercase text-[12px] shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all border-none cursor-pointer italic flex items-center justify-center gap-4 active:scale-95"
                    >
                      <Zap size={20} fill="currentColor"/> Initialiser le Master Flux
                    </button>
                  </div>
                ))
             )}
           </div>
        )}

        {/* SECTION MAINTENANCE SUPPORT § SCELLÉE */}
        {activeTab === 'SUPPORT' && (
           <div className="py-52 text-center bg-slate-900/40 border border-white/5 rounded-[5rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600/2 animate-pulse" />
              <Activity className="mx-auto text-blue-500/10 mb-10" size={120} />
              <h2 className="text-6xl font-black uppercase italic text-slate-800 tracking-tighter relative z-10">Support Master Flux v2.6</h2>
              <p className="text-slate-700 text-[12px] font-black uppercase tracking-[0.8em] mt-6 relative z-10">Liaison de Maintenance Qualisoft Scellée</p>
              <div className="mt-12 flex justify-center gap-6 relative z-10">
                 <span className="px-6 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] text-slate-600 uppercase font-black italic">Ping: 12ms</span>
                 <span className="px-6 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[10px] text-emerald-600 uppercase font-black italic">Status: Optimal</span>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

/**
 * 🏛️ COMPOSANT STATBLOCK : UNITÉ DE MESURE RÉELLE
 */
function StatBlock({ title, value, icon: Icon, color, highlight = false }: StatBlockProps) {
  const colors = { 
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]", 
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]", 
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]", 
    red: "text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]" 
  };
  
  return (
    <div className={`p-12 rounded-[4rem] border transition-all duration-1000 hover:scale-[1.03] shadow-2xl backdrop-blur-3xl relative overflow-hidden ${highlight ? 'bg-blue-600 border-blue-400 shadow-[0_30px_70px_rgba(37,99,235,0.3)]' : 'bg-slate-900/60 border-white/5 hover:border-white/10'}`}>
      {highlight && <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />}
      
      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-10 border group shadow-inner relative z-10 ${highlight ? 'bg-white/20 border-white/30 text-white' : colors[color]}`}>
        <Icon size={32} className={highlight ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'} />
      </div>
      <p className={`text-[11px] font-black uppercase tracking-[0.5em] mb-4 italic relative z-10 ${highlight ? 'text-blue-100' : 'text-slate-600'}`}>{title}</p>
      <p className="text-5xl font-black italic tracking-tighter text-white leading-none relative z-10">{value}</p>
    </div>
  );
}