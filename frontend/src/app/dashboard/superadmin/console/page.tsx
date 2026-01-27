/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/core/api/api-client';
import { 
  Loader2, ShieldCheck, TrendingUp, Clock, User, Wallet, 
  AlertOctagon, Zap, Fingerprint, Search, Crown, BarChart4
} from 'lucide-react';

// --- INTERFACES DE DONNÉES ---
interface RevenueHistory { month: string; amount: number; }
interface Transaction { TX_Amount: number; TX_Reference: string; }
interface Ticket { TK_Id: string; TK_Subject: string; TK_Description: string; TK_Priority: 'HIGH' | 'MEDIUM' | 'LOW'; TK_CreatedAt: string; }
interface TenantMaster { 
  T_Id: string; T_Name: string; T_CeoName?: string; T_SubscriptionStatus: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'TRIAL'; 
  T_Plan: 'BASIC' | 'ELITE' | 'ENTREPRISE' | 'CROISSANCE' | 'EMERGENCE' | 'GROUPE'; 
}
interface MasterStats { totalRevenue: number; projections24Months: number; pendingRevenue: number; openTickets: number; revenueHistory: RevenueHistory[]; }
interface MasterData { tenants: TenantMaster[]; stats: MasterStats; }

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

  // 1️⃣ Hydratation & Synchronisation avec qualisoft-auth-storage
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
      } catch (err) {
        console.error("Erreur critique : Décodage session échoué");
      }
    }
  }, []);

  const isMasterAdmin = useMemo(() => {
    return currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'ab.thiongane@qualisoft.sn';
  }, [currentUser]);

  // 2️⃣ Récupération des données Master
  const fetchData = useCallback(async () => {
    if (!isMasterAdmin) return;
    try {
      setLoading(true);
      const res = await apiClient.get<MasterData>('/admin/master-data'); 
      if (res.data) {
        setData(res.data);
        setActiveTab('CLOSING');
      }
    } catch (error) { 
      console.error("Erreur API : Impossible de charger le noyau de données");
    } finally { 
      setLoading(false); 
    }
  }, [isMasterAdmin]);

  useEffect(() => { 
    if (isMounted && isMasterAdmin) fetchData(); 
  }, [fetchData, isMounted, isMasterAdmin]);

  const handleAction = async (tenantId: string, action: string) => {
    if(!confirm(`Ordre Master : Confirmer ${action} ?`)) return;
    setIsProcessing(tenantId);
    try {
      await apiClient.post(`/admin/tenant/${tenantId}/status`, { action });
      await fetchData();
    } catch { 
      alert("Erreur d'exécution de l'ordre stratégique"); 
    } finally { 
      setIsProcessing(null); 
    }
  };

  const filteredTenants = useMemo(() => {
    return data?.tenants.filter((t) => 
      t.T_Name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.T_CeoName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [data, searchTerm]);

  if (!isMounted) return null;

  // Sécurité d'accès noyau
  if (!isMasterAdmin && isMounted && !loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-red-500 font-black italic uppercase ml-72">
        <AlertOctagon size={48} className="mb-4" />
        <span className="tracking-[0.2em] text-sm">Accès réservé au Noyau Qualisoft</span>
        <button onClick={() => router.push('/dashboard')} className="mt-6 text-[10px] text-blue-500 underline uppercase">Quitter la console</button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase ml-72">
        <Loader2 className="animate-spin mb-4" size={48}/> 
        <span className="tracking-[0.5em] text-[10px] animate-pulse">Séquence d&apos;authentification Master...</span>
      </div>
    );
  }

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen text-white italic font-sans text-left relative selection:bg-blue-600/30 ml-72 overflow-y-auto">
      <header className="mb-12 border-b border-white/5 pb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-blue-500 mb-3 font-black uppercase tracking-[0.5em] text-[10px]">
            <Fingerprint size={16} className="text-amber-500" /> 
            Autorité Qualisoft Master
            <Crown size={14} className="text-amber-500 animate-pulse ml-2" />
          </div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
            Master <span className="text-blue-600">Console</span>
          </h1>
        </div>
        
        <div className="flex flex-col gap-4 items-end">
          <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <button onClick={() => setActiveTab('CLOSING')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'CLOSING' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Finances & Closing</button>
            <button onClick={() => setActiveTab('TRIALS')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'TRIALS' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Demandes Trial</button>
            <button onClick={() => setActiveTab('SUPPORT')} className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'SUPPORT' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Support Tickets</button>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
            <input 
              type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="RECHERCHER UNE INSTANCE..."
              className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-xl text-[10px] font-black uppercase outline-none focus:border-blue-600 transition-all"
            />
          </div>
        </div>
      </header>

      {/* KPI - SÉCURISÉS CONTRE LES VALEURS UNDEFINED */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <StatBlock title="Revenu Encaissé" value={`${(data.stats.totalRevenue ?? 0).toLocaleString()} XOF`} icon={Wallet} color="emerald" />
        <StatBlock title="Projection 24 Mois" value={`${(data.stats.projections24Months ?? 0).toLocaleString()} XOF`} icon={TrendingUp} color="blue" highlight />
        <StatBlock title="Flux en Attente" value={`${(data.stats.pendingRevenue ?? 0).toLocaleString()} XOF`} icon={Clock} color="amber" />
        <StatBlock title="Tickets Critiques" value={data.stats.openTickets ?? 0} icon={AlertOctagon} color="red" />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'CLOSING' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left italic">
                <thead>
                  <tr className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">
                    <th className="p-8">Structure</th>
                    <th className="p-8 text-center">Plan</th>
                    <th className="p-8 text-right">Action Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTenants.map((t) => (
                    <tr key={t.T_Id} className="hover:bg-white/3 transition-colors group">
                      <td className="p-8">
                        <p className="text-xl font-black uppercase text-white tracking-tighter group-hover:text-blue-500">{t.T_Name}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase italic">{t.T_CeoName || 'Directeur Inconnu'}</p>
                      </td>
                      <td className="p-8 text-center">
                        <span className="text-[9px] font-black uppercase px-4 py-1.5 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{t.T_Plan}</span>
                      </td>
                      <td className="p-8 text-right">
                        <button 
                          onClick={() => handleAction(t.T_Id, 'ACTIVATE')} 
                          disabled={t.T_SubscriptionStatus === 'ACTIVE' || isProcessing === t.T_Id} 
                          className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] transition-all ml-auto ${t.T_SubscriptionStatus === 'ACTIVE' ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 text-white shadow-xl hover:scale-105'}`}
                        >
                          {isProcessing === t.T_Id ? <Loader2 className="animate-spin" size={14}/> : <Zap size={14}/>} {t.T_SubscriptionStatus === 'ACTIVE' ? 'Instance Active' : 'Activer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Croissance</h3>
                <BarChart4 className="text-blue-500" size={24} />
              </div>
              <div className="flex items-end justify-between h-48 gap-4 px-2">
                {data.stats.revenueHistory?.map((h, i) => {
                  const max = Math.max(...(data.stats.revenueHistory.map(r => r.amount) || [1]));
                  const height = ((h.amount || 0) / (max || 1)) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                      <div className="relative w-full flex items-end justify-center h-full">
                        <div style={{ height: `${height}%` }} className="w-full bg-blue-600/20 border-t-2 border-blue-500 rounded-t-lg group-hover:bg-blue-600 transition-all duration-500"></div>
                      </div>
                      <span className="text-[9px] font-black text-slate-600 uppercase italic">{h.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'TRIALS' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {data.tenants.filter(t => t.T_SubscriptionStatus === 'PENDING' || t.T_SubscriptionStatus === 'TRIAL').map(trial => (
                <div key={trial.T_Id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] flex flex-col justify-between group hover:border-blue-600/30 transition-all">
                  <h3 className="text-3xl font-black uppercase italic text-white mb-8 tracking-tighter">{trial.T_Name}</h3>
                  <button onClick={() => handleAction(trial.T_Id, 'APPROVE')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">Déployer l&apos;instance</button>
                </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}

function StatBlock({ title, value, icon: Icon, color, highlight = false }: StatBlockProps) {
  const colors = { 
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20", 
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", 
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20", 
    red: "text-red-500 bg-red-500/10 border-red-500/20" 
  };
  return (
    <div className={`p-8 rounded-[3rem] border transition-all duration-500 ${highlight ? 'bg-blue-600 border-blue-400 shadow-blue-500/20' : 'bg-slate-900/40 border-white/5'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${highlight ? 'bg-white/20 border-white/30 text-white' : colors[color]}`}><Icon size={24} /></div>
      <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-2 ${highlight ? 'text-blue-200' : 'text-slate-500'}`}>{title}</p>
      <p className="text-3xl font-black italic tracking-tighter text-white">{value}</p>
    </div>
  );
}