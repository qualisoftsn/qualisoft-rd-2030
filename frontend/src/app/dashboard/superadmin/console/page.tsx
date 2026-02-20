/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ NOM ABSOLU : src/app/dashboard/admin/console/page.tsx
 * FONCTION : Centre de commandement Master pour la supervision des instances SaaS.
 * RÔLE : Arbitrage des souscriptions, monitoring des revenus et filtrage global.
 * SÉCURITÉ : Accès restreint aux emails certifiés Qualisoft et au rôle SUPER_ADMIN.
 */

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

// --- INTERFACES DU NOYAU ---
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
interface MasterData { tenants: TenantMaster[]; stats: MasterStats; }

export default function SuperAdminMasterConsole() {
  const router = useRouter();
  const [data, setData] = useState<MasterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'CLOSING' | 'SUPPORT' | 'TRIALS'>('TRIALS');
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 🛡️ AUTHENTICATION & HYDRATATION DU CONTEXTE
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
      } catch (err) { console.error("Défaut de lecture du token Master"); }
    }
  }, []);

  // 🔒 VÉRIFICATION DE L'AUTORITÉ SUPRÊME
  const isMasterAdmin = useMemo(() => {
    return currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'ab.thiongane@qualisoft.sn';
  }, [currentUser]);

  // 📡 RÉCUPÉRATION DES DONNÉES DU NŒUD CENTRAL
  const fetchData = useCallback(async () => {
    if (!isMasterAdmin) return;
    try {
      setLoading(true);
      const res = await apiClient.get<MasterData>('/admin/master-data'); 
      if (res.data) {
        setData(res.data);
        // Basculement intelligent vers Closing si aucun Trial n'est en attente
        if (activeTab === 'TRIALS' && res.data.tenants.length > 0) {
          const hasPending = res.data.tenants.some(t => t.T_SubscriptionStatus === 'PENDING');
          if (!hasPending) setActiveTab('CLOSING');
        }
      }
    } catch (error) { toast.error("Rupture de liaison avec le Noyau Master");
    } finally { setLoading(false); }
  }, [isMasterAdmin, activeTab]);

  useEffect(() => { if (isMounted && isMasterAdmin) fetchData(); }, [fetchData, isMounted, isMasterAdmin]);

  // ⚔️ EXÉCUTION DES ORDRES DE DÉPLOIEMENT OU ACTIVATION
  const handleAction = async (tenantId: string, action: string) => {
    if(!confirm(`ORDRE STRATÉGIQUE : Confirmer l'action [${action}] ?`)) return;
    setIsProcessing(tenantId);
    try {
      await apiClient.post(`/admin/tenant/${tenantId}/status`, { action });
      toast.success("Ordre Master exécuté");
      await fetchData();
    } catch (error) { toast.error("Échec de l'ordre : Serveur instable ou droits insuffisants");
    } finally { setIsProcessing(null); }
  };

  // 🔍 LOGIQUE DE FILTRAGE INSTANTANÉ
  const filteredTenants = useMemo(() => {
    return data?.tenants.filter((t) => 
      t.T_Name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.T_CeoName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [data, searchTerm]);

  if (!isMounted) return null;

  // 🛑 BARRIÈRE ANTI-INTRUSION
  if (!isMasterAdmin && isMounted && !loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-red-600 font-black italic uppercase ml-72">
        <AlertOctagon size={80} className="mb-8 animate-bounce" />
        <span className="tracking-[0.6em] text-2xl">Zone d&apos;accès Restreinte</span>
        <p className="text-slate-600 text-[10px] mt-4 tracking-widest uppercase italic">Autorité Master Requise</p>
        <button onClick={() => router.push('/dashboard')} className="mt-10 px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] text-blue-500 uppercase font-black cursor-pointer">Évacuer la console</button>
      </div>
    );
  }

  if (loading || !data) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase ml-72">
      <Loader2 className="animate-spin mb-4" size={50}/>
      <span className="tracking-[0.8em] text-[10px] animate-pulse italic">Synchronisation Master...</span>
    </div>
  );

  return (
    <div className="p-12 bg-[#0B0F1A] min-h-screen text-white italic font-sans text-left ml-72 overflow-y-auto">
      <header className="mb-14 border-b border-white/5 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div>
          <div className="flex items-center gap-4 text-blue-500 mb-5 font-black uppercase tracking-[0.5em] text-[11px]">
            <Fingerprint size={20} className="text-amber-500" /> Autorité Master Qualisoft <Crown size={18} className="text-amber-500 animate-pulse" />
          </div>
          <h1 className="text-8xl font-black uppercase italic tracking-tighter text-white leading-none">Console <span className="text-blue-600">Master</span></h1>
          <p className="text-slate-600 text-[11px] mt-5 font-bold uppercase tracking-[0.4em] flex items-center gap-3"><Globe size={14} className="animate-spin-slow"/> Surveillance Globale des Instances • Temps Réel 2026</p>
        </div>
        
        <div className="flex flex-col gap-8 items-end">
          <div className="flex bg-white/5 p-2 rounded-4xl border border-white/10 backdrop-blur-3xl shadow-2xl">
            {[{ id: 'CLOSING', label: 'Finances' }, { id: 'TRIALS', label: 'Demandes Trial' }, { id: 'SUPPORT', label: 'Support' }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500'}`}>{tab.label}</button>
            ))}
          </div>
          <div className="relative w-full lg:w-112.5">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="RECHERCHER UNE INSTANCE..." className="w-full bg-black/40 border border-white/10 p-6 pl-16 rounded-4xl text-[12px] font-black uppercase outline-none focus:border-blue-600 text-white placeholder-slate-800 shadow-inner" />
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10 mb-16">
        <StatBlock title="Revenu Encaissé" value={`${(data.stats.totalRevenue ?? 0).toLocaleString()} XOF`} icon={Wallet} color="emerald" />
        <StatBlock title="Projection 24M" value={`${(data.stats.projections24Months ?? 0).toLocaleString()} XOF`} icon={TrendingUp} color="blue" highlight />
        <StatBlock title="Flux en Attente" value={`${(data.stats.pendingRevenue ?? 0).toLocaleString()} XOF`} icon={Clock} color="amber" />
        <StatBlock title="Tickets Critiques" value={data.stats.openTickets ?? 0} icon={AlertOctagon} color="red" />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {activeTab === 'CLOSING' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 text-left">
            <div className="xl:col-span-2 bg-slate-900/40 border border-white/5 rounded-[4.5rem] overflow-hidden shadow-4xl backdrop-blur-3xl">
              <table className="w-full text-left italic">
                <thead className="bg-white/5 text-[11px] font-black uppercase text-slate-500 tracking-[0.4em]">
                  <tr><th className="p-12">Instance</th><th className="p-12 text-center">Licence</th><th className="p-12 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTenants.map((t) => (
                    <tr key={t.T_Id} className="hover:bg-white/3 transition-all group">
                      <td className="p-12">
                        <div className="flex items-center gap-6 text-left">
                          <div className={`w-3 h-3 rounded-full ${t.T_SubscriptionStatus === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-amber-500 animate-pulse'} `} />
                          <div>
                            <p className="text-3xl font-black uppercase text-white leading-none tracking-tighter group-hover:text-blue-500">{t.T_Name}</p>
                            <p className="text-[11px] text-slate-600 mt-3 font-bold uppercase italic"><User size={14} className="inline mr-2"/> CEO: {t.T_CeoName || 'ID MASTER'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-12 text-center">
                        <span className={`text-[11px] font-black uppercase px-6 py-2.5 rounded-2xl border ${t.T_Plan === 'ELITE' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400'}`}>{t.T_Plan}</span>
                      </td>
                      <td className="p-12 text-right">
                        <button onClick={() => handleAction(t.T_Id, 'ACTIVATE')} disabled={t.T_SubscriptionStatus === 'ACTIVE'} className={`px-10 py-5 rounded-4xl font-black uppercase text-[11px] flex items-center gap-4 border-none cursor-pointer ${t.T_SubscriptionStatus === 'ACTIVE' ? 'bg-slate-900 text-slate-700' : 'bg-blue-600 text-white shadow-2xl'}`}>
                          {isProcessing === t.T_Id ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18}/>} {t.T_SubscriptionStatus === 'ACTIVE' ? 'Scellée' : 'Débloquer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BAR CHART RÉEL (CSS-BASED) */}
            <div className="bg-slate-900/40 border border-white/5 p-14 rounded-[4.5rem] shadow-2xl backdrop-blur-3xl relative">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-20 text-left">Croissance Noyau</h3>
              <div className="flex items-end justify-between h-72 gap-6 relative">
                {data.stats.revenueHistory?.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-8 group relative z-10">
                    <div style={{ height: `${(h.amount / Math.max(...data.stats.revenueHistory.map(r => r.amount))) * 100}%` }} className="w-full bg-blue-600/20 border-t-4 border-blue-500 rounded-t-2xl group-hover:bg-blue-600 transition-all duration-700 shadow-inner"></div>
                    <span className="text-[11px] font-black text-slate-700 uppercase italic group-hover:text-blue-500">{h.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBlock({ title, value, icon: Icon, color, highlight = false }: any) {
  const themes: any = { 
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20", emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", 
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20", red: "text-red-500 bg-red-500/10 border-red-500/20" 
  };
  return (
    <div className={`p-12 rounded-[4rem] border transition-all hover:scale-[1.03] shadow-4xl backdrop-blur-3xl text-left ${highlight ? 'bg-blue-600 border-blue-400' : 'bg-slate-900/60 border-white/5'}`}>
      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-10 border ${highlight ? 'bg-white/20 text-white border-white/30' : themes[color]}`}><Icon size={32} /></div>
      <p className={`text-[11px] font-black uppercase tracking-[0.5em] mb-4 italic ${highlight ? 'text-blue-100' : 'text-slate-600'}`}>{title}</p>
      <p className="text-5xl font-black italic tracking-tighter text-white leading-none">{value}</p>
    </div>
  );
}