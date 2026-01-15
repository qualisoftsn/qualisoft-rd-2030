/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, Users, Wallet, Database, Clock, 
  CheckCircle2, AlertCircle, Search, Download, ExternalLink,
  TrendingUp, Activity, Lock, RefreshCcw, Loader2
} from 'lucide-react';
import apiClient from '@/core/api/api-client';

export default function MasterDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [resData, resBackups] = await Promise.all([
        apiClient.get('/admin/master-data'),
        apiClient.get('/admin/backups')
      ]);
      setData(resData.data);
      setBackups(resBackups.data);
    } catch (err) {
      console.error("Erreur de connexion au Noyau Master");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransaction = async (txId: string) => {
    if (!confirm("Voulez-vous valider cet encaissement et activer l'accès Élite pour ce client ?")) return;
    setActionLoading(txId);
    try {
      await apiClient.post(`/admin/transactions/${txId}/validate`);
      loadMasterData();
      alert("INSTANCE ACTIVÉE : Le client a été notifié par email.");
    } catch (err) {
      alert("Erreur lors de la validation technique.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse">Synchronisation avec le Noyau Master...</p>
    </div>
  );

  return (
    <div className="space-y-10 italic text-left animate-in fade-in duration-1000 pb-20">
      
      {/* 🟢 HEADER & GLOBAL STATS */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <div className="flex items-center gap-3 text-blue-500 mb-3">
            <Lock size={16} />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Console de Haute Direction • Abdoulaye THIONGANE</span>
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter text-white">Master <span className="text-blue-600">Control</span></h1>
        </div>
        
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 w-full lg:w-auto">
          <StatBox label="Revenu Réel" value={data.stats.totalRevenue} icon={TrendingUp} color="text-emerald-500" />
          <StatBox label="Sites Actifs" value={data.stats.activeCount} icon={Activity} color="text-blue-500" />
          <StatBox label="Essais en cours" value={data.stats.pendingTrials} icon={Clock} color="text-amber-500" />
          <StatBox label="État Backups" value="SÉCURISÉ" icon={Database} color="text-purple-500" />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* 🟡 SECTION 1 : VALIDATION DES PAIEMENTS (FLUX ENTRANTS) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                <Wallet className="text-blue-600" size={28} /> Flux Financiers en Attente
              </h2>
              <button onClick={loadMasterData} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                <RefreshCcw size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-600 border-b border-white/5">
                    <th className="pb-6">Organisation</th>
                    <th className="pb-6">Référence / Opérateur</th>
                    <th className="pb-6">Montant HT</th>
                    <th className="pb-6 text-right">Actions Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.tenants.flatMap((t: any) => t.T_Transactions)
                    .filter((tx: any) => tx.TX_Status === 'EN_COURS')
                    .map((tx: any) => (
                    <tr key={tx.TX_Id} className="group hover:bg-white/2 transition-all">
                      <td className="py-6">
                        <p className="text-sm font-black text-white uppercase tracking-tighter">{tx.tenant?.T_Name}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">CEO: {tx.tenant?.T_CeoName}</p>
                      </td>
                      <td className="py-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${tx.TX_PaymentMethod === 'WAVE' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                          <p className="text-[10px] font-black text-white uppercase">{tx.TX_PaymentMethod}</p>
                        </div>
                        <p className="text-[9px] font-mono text-slate-500 mt-1 tracking-widest">{tx.TX_Reference}</p>
                      </td>
                      <td className="py-6">
                        <p className="text-sm font-black text-white italic">{tx.TX_Amount?.toLocaleString()} XOF</p>
                      </td>
                      <td className="py-6 text-right">
                        <button 
                          onClick={() => handleApproveTransaction(tx.TX_Id)}
                          disabled={actionLoading === tx.TX_Id}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-2 ml-auto"
                        >
                          {actionLoading === tx.TX_Id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                          Valider Encaissement
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 🟣 SECTION 2 : SURVEILLANCE COFFRE-FORT (BACKUPS) */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-10 backdrop-blur-xl">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-4">
              <Database className="text-purple-600" size={28} /> Archives SQL
            </h2>
            <div className="space-y-4 max-h-125 overflow-y-auto pr-2">
              {backups.map((b, i) => (
                <div key={i} className="p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-black text-white uppercase truncate w-40 tracking-tighter">{b.name}</p>
                    <Download size={16} className="text-slate-600 group-hover:text-purple-500 cursor-pointer transition-colors" />
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>{new Date(b.date).toLocaleDateString()}</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded-md text-slate-300 font-black">{b.size}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-6 bg-purple-600/10 border border-purple-600/20 rounded-3xl">
              <p className="text-[9px] text-purple-300 font-black uppercase leading-relaxed tracking-widest">
                Rotation active : 10 jours glissants. Stockage Villa 247 sécurisé.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// COMPOSANT : CARTE STATISTIQUE MASTER
function StatBox({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-slate-900/40 border border-white/5 p-6 rounded-4xl min-w-45 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl bg-white/5 ${color}`}>
          <Icon size={16} />
        </div>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
      </div>
      <p className="text-2xl font-black text-white tracking-tighter italic leading-none">{value}</p>
    </div>
  );
}