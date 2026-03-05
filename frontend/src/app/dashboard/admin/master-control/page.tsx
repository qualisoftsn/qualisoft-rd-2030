/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : MASTER CONTROL HUB (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Supervision régalienne de la Fédération Qualisoft.
 * FIX : UI ClickUp 100dvh (Zéro Scroll Global), PWA Ready (retrait ml-72).
 * SÉCURITÉ : Zéro NextAuth. Appels API centralisés.
 * DATE : 05 Mars 2026 | 00:10 GMT
 * -------------------------------------------------------------------------
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

  const loadMasterData = useCallback(async () => {
    setLoading(true);
    try {
      const [resData, resBackups] = await Promise.all([
        apiClient.get('/admin/master-data'),
        apiClient.get('/admin/backups').catch(() => ({ data: [] })) // Fallback si non implémenté
      ]);
      setData(resData.data);
      setBackups(resBackups.data || []);
    } catch (err) {
      toast.error("Rupture de liaison avec le Noyau Master");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMasterData(); }, [loadMasterData]);

  const handleApprove = async (txId: string) => {
    if (!confirm("Valider cet encaissement et activer l'accès Élite au locataire ?")) return;
    setActionId(txId);
    try {
      await apiClient.post(`/admin/transactions/${txId}/validate`);
      toast.success("INSTANCE ACTIVÉE : Signal envoyé au nœud distant.");
      loadMasterData();
    } catch (err) {
      toast.error("Échec du scellage de la transaction.");
    } finally {
      setActionId(null);
    }
  };

  if (loading || !data) return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 bg-[#0B0F1A]">
      <Loader2 className="animate-spin text-blue-600" size={48} strokeWidth={3} />
      <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-slate-500 italic animate-pulse m-0">Interrogation Matrix...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full">
      
      {/* HEADER & KPI (Fixe) */}
      <header className="shrink-0 p-6 md:p-8 lg:p-12 border-b border-white/5 bg-[#0B0F1A]/90 backdrop-blur-md z-20 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-center gap-3 text-blue-500 mb-3 md:mb-4 font-black uppercase tracking-widest text-[9px] md:text-xs">
            <Lock size={16} className="md:w-5 md:h-5" /> Console Master • Supervision SDE
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic m-0 leading-none">
            Master <span className="text-blue-600">Control</span>
          </h1>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full xl:w-auto font-sans animate-in fade-in slide-in-from-right-4 duration-500">
          <StatBox label="Revenu Réel" value={`${data.stats.totalRevenue.toLocaleString()} XOF`} icon={TrendingUp} color="text-emerald-500" />
          <StatBox label="Nœuds Actifs" value={data.stats.activeCount} icon={Activity} color="text-blue-500" />
          <StatBox label="Essais / 14j" value={data.stats.pendingTrials} icon={Clock} color="text-amber-500" />
          <StatBox label="Archives SQL" value="SÉCURISÉ" icon={Database} color="text-purple-500" />
        </div>
      </header>

      {/* ZONE DE DÉFILEMENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-12">
        <div className="max-w-400 mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-10">
          
          {/* VALIDATION FLUX */}
          <div className="xl:col-span-2 bg-[#0F172A]/80 border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 backdrop-blur-xl shadow-2xl flex flex-col max-h-200">
            <div className="flex items-center justify-between mb-8 md:mb-10 border-b border-white/5 pb-6 shrink-0">
              <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 md:gap-4 m-0">
                <Wallet className="text-blue-600" size={28} /> Flux en Attente
              </h2>
              <button onClick={loadMasterData} className="p-3 bg-white/5 rounded-xl hover:bg-blue-600 transition-all border-none cursor-pointer text-white">
                <RefreshCcw size={18} />
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left min-w-150">
                <thead className="sticky top-0 bg-[#0F172A]/90 backdrop-blur-md">
                  <tr className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 border-b border-white/5">
                    <th className="pb-4 px-4 pt-2">Organisation</th>
                    <th className="pb-4 px-4 pt-2">Référence</th>
                    <th className="pb-4 px-4 pt-2">Montant</th>
                    <th className="pb-4 px-4 pt-2 text-right">Décision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.tenants.flatMap(t => t.T_Transactions).filter(tx => tx.TX_Status === 'EN_COURS').length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                        Aucun flux financier en attente de validation.
                      </td>
                    </tr>
                  ) : (
                    data.tenants.flatMap(t => t.T_Transactions).filter(tx => tx.TX_Status === 'EN_COURS').map(tx => (
                      <tr key={tx.TX_Id} className="group hover:bg-white/5 transition-all duration-300">
                        <td className="py-5 px-4">
                          <p className="text-sm md:text-base font-black text-white uppercase italic m-0">{tx.tenant?.T_Name}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest m-0">{tx.tenant?.T_CeoName}</p>
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${tx.TX_PaymentMethod === 'WAVE' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-orange-500'}`} />
                            <p className="text-[9px] md:text-[10px] font-black text-white uppercase m-0">{tx.TX_PaymentMethod}</p>
                          </div>
                          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter m-0">{tx.TX_Reference}</p>
                        </td>
                        <td className="py-5 px-4 font-black italic text-blue-400 text-sm md:text-base">{tx.TX_Amount.toLocaleString()} XOF</td>
                        <td className="py-5 px-4 text-right">
                          <button 
                            onClick={() => handleApprove(tx.TX_Id)}
                            disabled={actionId === tx.TX_Id}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ml-auto shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50 border-none cursor-pointer"
                          >
                            {actionId === tx.TX_Id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                            Valider
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* BACKUPS */}
          <div className="bg-[#0F172A]/80 border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 backdrop-blur-xl shadow-2xl flex flex-col max-h-200">
            <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter mb-8 md:mb-10 flex items-center gap-3 md:gap-4 shrink-0 m-0">
              <Database className="text-purple-500" size={28} /> Archives SQL
            </h2>
            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {backups.length === 0 ? (
                <div className="text-center text-slate-500 text-[10px] uppercase tracking-widest font-bold py-10">
                  Aucune archive système détectée.
                </div>
              ) : (
                backups.map((b, i) => (
                  <div key={i} className="p-5 md:p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-purple-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <p className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-tighter m-0 truncate pr-4">{b.name}</p>
                      <Download size={16} className="text-slate-500 group-hover:text-purple-400 cursor-pointer transition-colors shrink-0" />
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">
                      <span>{new Date(b.date).toLocaleDateString()}</span>
                      <span className="bg-[#0B0F1A] border border-white/5 px-2 py-1 rounded-md text-purple-400">{b.size}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 🧪 CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37,99,235,0.5); }
      `}} />
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-5 md:p-6 rounded-2xl md:rounded-3xl min-w-35 backdrop-blur-md hover:bg-white/10 transition-all flex flex-col justify-between">
      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
        <div className={`p-2 rounded-xl bg-[#0B0F1A] border border-white/5 ${color}`}><Icon size={14} className="md:w-4 md:h-4" /></div>
        <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none m-0 line-clamp-1">{label}</span>
      </div>
      <p className="text-xl md:text-2xl font-black text-white tracking-tighter italic leading-none m-0 truncate">{value}</p>
    </div>
  );
}