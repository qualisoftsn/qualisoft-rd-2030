/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@/core/api/api-client';
import { 
  CheckCircle2, XCircle, Loader2, ShieldCheck, 
  Phone, Crown, Search, Building2, TrendingUp, 
  Clock, User, Wallet, AlertOctagon, Send, 
  ArrowUpRight, Activity, Zap, Fingerprint
} from 'lucide-react';

export default function SuperAdminMasterConsole() {
  const [data, setData] = useState<any>({ tenants: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'CLOSING' | 'SUPPORT' | 'TRIALS'>('TRIALS');
  
  // Simulation de la récupération de l'utilisateur connecté (JWT ou Context)
  // Dans ton intégration réelle, utilise ton hook useAuth()
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Récupération de l'email depuis le localStorage ou ton état global
    const email = typeof window !== 'undefined' ? localStorage.getItem('qs_user_email') : null;
    setCurrentUserEmail(email);
  }, []);

  const isMasterAdmin = currentUserEmail === 'ab.thiongane@qualisoft.sn';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/master-data'); 
      setData(res.data);
      
      // Si l'utilisateur n'est pas Master, on le force sur l'onglet Trials
      if (currentUserEmail && currentUserEmail !== 'ab.thiongane@qualisoft.sn') {
        setActiveTab('TRIALS');
      } else if (currentUserEmail === 'ab.thiongane@qualisoft.sn') {
        setActiveTab('CLOSING');
      }
    } catch (e) { 
      console.error("Erreur de synchronisation Master Console"); 
    } finally { 
      setLoading(false); 
    }
  }, [currentUserEmail]);

  useEffect(() => { 
    if (currentUserEmail) fetchData(); 
  }, [fetchData, currentUserEmail]);

  const handleAction = async (tenantId: string, action: string) => {
    if(!confirm(`Confirmer l'opération stratégique : ${action} ?`)) return;
    setIsProcessing(tenantId);
    try {
      await apiClient.post(`/admin/tenant/${tenantId}/status`, { action });
      fetchData();
    } catch (e) { 
      alert("Erreur lors de l'exécution de l'ordre Master"); 
    } finally { 
      setIsProcessing(null); 
    }
  };

  const filteredTenants = Array.isArray(data?.tenants) 
    ? data.tenants.filter((t: any) => 
        t.T_Name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.T_CeoName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0B0F1A] text-blue-500 font-black italic uppercase animate-in fade-in duration-700 ml-72">
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-blue-600/20 rounded-full blur-xl animate-pulse"></div>
        <Loader2 className="animate-spin relative" size={48}/> 
      </div>
      <span className="tracking-[0.5em] text-[10px]">Initialisation du Noyau Master...</span>
    </div>
  );

  return (
    <div className="p-10 bg-[#0B0F1A] min-h-screen text-white italic font-sans text-left relative selection:bg-blue-600/30 ml-72">
      
      {/* HEADER STRATÉGIQUE */}
      <header className="mb-12 border-b border-white/5 pb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-blue-500 mb-3 font-black uppercase tracking-[0.5em] text-[10px]">
            <Fingerprint size={16} className={isMasterAdmin ? "text-amber-500" : "text-blue-500"} /> 
            {isMasterAdmin ? "Accès Propriétaire Universel" : "Qualisoft Control Tower"}
          </div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white leading-none">
            Master <span className="text-blue-600">Console</span>
          </h1>
        </div>
        
        <div className="flex flex-col gap-4 items-end">
            <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                {isMasterAdmin && (
                  <button 
                      onClick={() => setActiveTab('CLOSING')} 
                      className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'CLOSING' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                      Finances & Closing
                  </button>
                )}
                <button 
                    onClick={() => setActiveTab('TRIALS')} 
                    className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'TRIALS' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    Demandes Trial
                </button>
                <button 
                    onClick={() => setActiveTab('SUPPORT')} 
                    className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === 'SUPPORT' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    Support Tickets
                </button>
            </div>
            <div className="relative w-full lg:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="RECHERCHER UNE INSTANCE..."
                    className="w-full bg-white/5 border border-white/10 p-3 pl-12 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-600 transition-all placeholder:text-slate-700"
                />
            </div>
        </div>
      </header>

      {/* 🚀 KPI PROJECTIONS & FINANCE (Masqués si pas Master) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <StatBlock title="Revenu Encaissé" value={isMasterAdmin ? `${data.stats?.totalRevenue?.toLocaleString()} XOF` : "•••••• XOF"} icon={Wallet} color="emerald" />
        <StatBlock title="Projection 24 Mois" value={isMasterAdmin ? `${data.stats?.projections24Months?.toLocaleString()} XOF` : "•••••• XOF"} icon={TrendingUp} color="blue" highlight />
        <StatBlock title="Flux en Attente" value={isMasterAdmin ? `${data.stats?.pendingRevenue?.toLocaleString()} XOF` : "•••••• XOF"} icon={Clock} color="amber" />
        <StatBlock title="Tickets Critiques" value={data.stats?.openTickets || 0} icon={AlertOctagon} color="red" />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'CLOSING' && isMasterAdmin && (
            <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-sm">
              <table className="w-full text-left italic">
                  <thead>
                    <tr className="bg-white/5 text-[9px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">
                        <th className="p-8">Structure / CEO</th>
                        <th className="p-8 text-center">Plan Actuel</th>
                        <th className="p-8 text-center">Engagement</th>
                        <th className="p-8">Dernier Flux</th>
                        <th className="p-8 text-right">Action Master</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                  {filteredTenants.length > 0 ? filteredTenants.map((t: any) => (
                      <tr key={t.T_Id} className="hover:bg-white/3 transition-colors group">
                        <td className="p-8">
                            <p className="text-xl font-black uppercase text-white leading-none tracking-tighter group-hover:text-blue-500 transition-colors">{t.T_Name}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase italic flex items-center gap-2">
                               <User size={12} className="text-blue-600" /> {t.T_CeoName} • {t.T_Phone}
                            </p>
                        </td>
                        <td className="p-8 text-center">
                            <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border ${t.T_SubscriptionStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                {t.T_Plan} • {t.T_SubscriptionStatus}
                            </span>
                        </td>
                        <td className="p-8 text-center">
                            <p className="text-sm font-black text-white italic">{t.T_ContractDuration || 24} Mois</p>
                        </td>
                        <td className="p-8">
                            <p className="text-sm font-black text-emerald-500">{(t.T_Transactions?.[0]?.TX_Amount || 0).toLocaleString()} XOF</p>
                            <p className="text-[9px] text-slate-500 uppercase font-bold italic tracking-tighter mt-1">{t.T_Transactions?.[0]?.TX_Reference || '---'}</p>
                        </td>
                        <td className="p-8 text-right">
                            <button 
                              onClick={() => handleAction(t.T_Id, 'ACTIVATE')}
                              disabled={t.T_SubscriptionStatus === 'ACTIVE' || isProcessing === t.T_Id}
                              className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all ml-auto ${t.T_SubscriptionStatus === 'ACTIVE' ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-40' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl active:scale-95'}`}
                            >
                              {isProcessing === t.T_Id ? <Loader2 className="animate-spin" size={14}/> : <Zap size={14}/>}
                              {t.T_SubscriptionStatus === 'ACTIVE' ? 'Activé' : 'Activer'}
                            </button>
                        </td>
                      </tr>
                  )) : (
                    <tr><td colSpan={5} className="p-20 text-center text-slate-600 uppercase text-[10px] font-black tracking-[0.2em]">Aucun résultat</td></tr>
                  )}
                  </tbody>
              </table>
            </div>
        )}

        {activeTab === 'TRIALS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.tenants.filter((t: any) => t.T_SubscriptionStatus === 'PENDING').length > 0 ? (
                    data.tenants.filter((t: any) => t.T_SubscriptionStatus === 'PENDING').map((trial: any) => (
                        <div key={trial.T_Id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] flex flex-col justify-between group hover:border-blue-600/30 transition-all shadow-2xl">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/10">
                                    <Building2 size={24} />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full italic">Trial Request</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase italic text-white mb-2 tracking-tighter">{trial.T_Name}</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8">{trial.T_Sector} • 14 Jours d&apos;essai</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleAction(trial.T_Id, 'REJECT')} className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"><XCircle size={18}/></button>
                                <button onClick={() => handleAction(trial.T_Id, 'APPROVE')} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 shadow-xl transition-all">Valider l&apos;instance</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                        <p className="text-slate-600 font-black text-[10px] uppercase tracking-[0.3em]">Aucune demande Trial en attente</p>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'SUPPORT' && (
            <div className="grid grid-cols-1 gap-6">
            {data.tenants.flatMap((t: any) => t.T_Tickets || []).map((ticket: any) => (
                <div key={ticket.TK_Id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] flex flex-col lg:flex-row justify-between lg:items-center group hover:border-red-500/30 transition-all gap-8">
                  <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <span className={`px-3 py-1 text-[8px] font-black uppercase rounded-full border ${ticket.TK_Priority === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                            {ticket.TK_Priority} Priority
                        </span>
                        <span className="text-slate-600 text-[9px] font-black uppercase flex items-center gap-2"><Clock size={12}/> {ticket.TK_CreatedAt}</span>
                      </div>
                      <h3 className="text-2xl font-black uppercase italic text-white mb-3 tracking-tighter">{ticket.TK_Subject}</h3>
                      <p className="text-slate-400 text-xs italic line-clamp-2 leading-relaxed">{ticket.TK_Description}</p>
                  </div>
                  <button className="bg-white/5 border border-white/10 hover:bg-blue-600 p-5 rounded-2xl text-slate-500 hover:text-white transition-all">
                      <Send size={22} />
                  </button>
                </div>
            ))}
            </div>
        )}
      </div>

      <div className="fixed -bottom-20 -right-20 opacity-[0.02] pointer-events-none rotate-12">
        <ShieldCheck size={600} />
      </div>
    </div>
  );
}

function StatBlock({ title, value, icon: Icon, color, highlight = false }: any) {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20"
  };
  return (
    <div className={`p-8 rounded-[3rem] border shadow-2xl transition-all duration-500 group hover:scale-[1.02] ${highlight ? 'bg-blue-600 border-blue-400' : 'bg-slate-900/40 border-white/5'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${highlight ? 'bg-white/20 border-white/30 text-white' : colors[color]}`}>
        <Icon size={24} />
      </div>
      <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-2 ${highlight ? 'text-blue-200' : 'text-slate-500'}`}>{title}</p>
      <p className={`text-3xl font-black italic tracking-tighter text-white`}>{value}</p>
    </div>
  );
}