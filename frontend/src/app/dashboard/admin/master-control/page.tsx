/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : MASTER CONTROL HUB
 * -------------------------------------------------------------------------
 * RÔLE : Supervision régalienne de la Fédération Qualisoft.
 * ACTIONS : Validation financière, Surveillance Backups, KPIs Globaux.
 * DATE : 01 Mars 2026 | 16:10 GMT
 */

import React, { useEffect, useState, useCallback } from 'react';
import { 
  ShieldCheck, Wallet, Database, Clock, CheckCircle2, 
  Download, Lock, RefreshCcw, Loader2, TrendingUp, Activity 
} from 'lucide-react';
import apiClient from '@/core/api/api-client';
import { toast } from 'sonner';

// --- INTERFACES SCÉLLÉES ---
interface Transaction {
  TX_Id: string;
  TX_Status: 'EN_COURS' | 'VALIDE' | 'REJETE';
  TX_PaymentMethod: 'WAVE' | 'ORANGE_MONEY' | 'TRANSFERT';
  TX_Reference: string;
  TX_Amount: number;
  tenant?: { T_Name: string; T_CeoName: string; };
}

interface MasterData {
  stats: { totalRevenue: number; activeCount: number; pendingTrials: number; };
  tenants: { T_Transactions: Transaction[] }[];
}

interface BackupFile { name: string; date: string; size: string; }

export default function MasterDashboard() {
  const [data, setData] = useState<MasterData | null>(null);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  /**
   * 📡 SYNCHRONISATION KERNEL
   */
  const loadMasterData = useCallback(async () => {
    setLoading(true);
    try {
      const [resData, resBackups] = await Promise.all([
        apiClient.get('/admin/master-data'),
        apiClient.get('/admin/backups')
      ]);
      setData(resData.data);
      setBackups(resBackups.data);
    } catch (err) {
      toast.error("Rupture de liaison avec le Noyau Master");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMasterData(); }, [loadMasterData]);

  /**
   * ⚖️ VALIDATION FINANCIÈRE
   */
  const handleApprove = async (txId: string) => {
    if (!confirm("Valider cet encaissement et activer l'accès Élite ?")) return;
    setActionId(txId);
    try {
      await apiClient.post(`/admin/transactions/${txId}/validate`);
      toast.success("INSTANCE ACTIVÉE : Signal envoyé au nœud distant.");
      loadMasterData();
    } catch (err) {
      toast.error("Échec du scellage de transaction.");
    } finally {
      setActionId(null);
    }
  };

  if (loading || !data) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">Interrogation Matrix...</p>
    </div>
  );

  return (
    <div className="ml-72 p-10 space-y-12 italic text-left animate-in fade-in duration-700 pb-20 bg-[#0B0F1A] min-h-screen text-white">
      
      {/* HEADER & KPI */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div>
          <div className="flex items-center gap-3 text-blue-500 mb-3 font-black uppercase tracking-widest text-xs">
            <Lock size={16} /> Console Master • Abdoulaye THIONGANE
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">Master <span className="text-blue-600 text-7xl">Control</span></h1>
        </div>
        
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 w-full lg:w-auto font-sans">
          <StatBox label="Revenu Réel" value={`${data.stats.totalRevenue.toLocaleString()} XOF`} icon={TrendingUp} color="text-emerald-500" />
          <StatBox label="Nœuds Actifs" value={data.stats.activeCount} icon={Activity} color="text-blue-500" />
          <StatBox label="Essais / 14j" value={data.stats.pendingTrials} icon={Clock} color="text-amber-500" />
          <StatBox label="Archives SQL" value="SÉCURISÉ" icon={Database} color="text-purple-500" />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* VALIDATION FLUX */}
        <div className="xl:col-span-2 bg-white/5 border border-white/5 rounded-[3.5rem] p-10 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-4">
              <Wallet className="text-blue-600" size={28} /> Flux en Attente
            </h2>
            <button onClick={loadMasterData} className="p-3 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all">
              <RefreshCcw size={18} />
            </button>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-500 border-b border-white/5 pb-4">
                <th className="pb-4 px-2">Organisation</th>
                <th className="pb-4 px-2">Référence</th>
                <th className="pb-4 px-2">Montant</th>
                <th className="pb-4 px-2 text-right">Décision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.tenants.flatMap(t => t.T_Transactions).filter(tx => tx.TX_Status === 'EN_COURS').map(tx => (
                <tr key={tx.TX_Id} className="group hover:bg-white/2 transition-all duration-300">
                  <td className="py-6 px-2">
                    <p className="text-sm font-black text-white uppercase italic">{tx.tenant?.T_Name}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{tx.tenant?.T_CeoName}</p>
                  </td>
                  <td className="py-6 px-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${tx.TX_PaymentMethod === 'WAVE' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-orange-500'}`} />
                      <p className="text-[10px] font-black text-white uppercase">{tx.TX_PaymentMethod}</p>
                    </div>
                    <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-tighter">{tx.TX_Reference}</p>
                  </td>
                  <td className="py-6 px-2 font-black italic text-blue-400">{tx.TX_Amount.toLocaleString()} XOF</td>
                  <td className="py-6 px-2 text-right">
                    <button 
                      onClick={() => handleApprove(tx.TX_Id)}
                      disabled={actionId === tx.TX_Id}
                      className="bg-emerald-600 hover:bg-white hover:text-emerald-600 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ml-auto shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50"
                    >
                      {actionId === tx.TX_Id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                      Valider
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BACKUPS */}
        <div className="bg-white/5 border border-white/5 rounded-[3.5rem] p-10 backdrop-blur-3xl shadow-2xl">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-10 flex items-center gap-4">
            <Database className="text-purple-600" size={28} /> Archives SQL
          </h2>
          <div className="space-y-4 max-h-125 overflow-y-auto pr-2 custom-scrollbar">
            {backups.map((b, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-4xl border border-white/5 hover:border-purple-500/50 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black text-white uppercase tracking-tighter">{b.name}</p>
                  <Download size={16} className="text-slate-600 group-hover:text-purple-500 cursor-pointer transition-colors" />
                </div>
                <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  <span>{new Date(b.date).toLocaleDateString()}</span>
                  <span className="bg-white/5 px-2 py-1 rounded-md text-purple-400">{b.size}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-6 rounded-4xl min-w-45 backdrop-blur-md hover:bg-white/10 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl bg-white/5 ${color}`}><Icon size={16} /></div>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
      </div>
      <p className="text-2xl font-black text-white tracking-tighter italic leading-none">{value}</p>
    </div>
  );
}